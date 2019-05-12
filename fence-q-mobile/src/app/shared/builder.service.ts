import { Injectable } from "@angular/core";
import { Subject, Observable, OperatorFunction, BehaviorSubject } from "rxjs";
import { Location, distance } from "nativescript-geolocation";
import { map, tap, catchError } from "rxjs/operators";
import { Marker, Position, MapView, Polyline } from "nativescript-google-maps-sdk";
import { AppConstants } from "~/app/constants";
import { Color } from "tns-core-modules/color/color";
import { FenceBlueprintInterface } from "../types/fence-blueprint";
import { FenceMeasurementInterface } from "../types/fence-measurement";
import { metersToInches } from "~/app/shared/util";
import { isAndroid, isIOS } from "tns-core-modules/platform";

const MARKER_TITLE = "Selected.";

const COLOR_MAP = {
    NODE: AppConstants.FENCE_MARKER_COLOR,
    GATE: AppConstants.GATE_MARKER_COLOR
};

export enum MapType {
    NONE = 0,
    REGULAR = 1,
    SATELLITE = 2,
    TERRAIN = 3,
    HYBRID = 4
}

@Injectable({
    providedIn: "root"
})
export class BuilderService {

    mapType: MapType = MapType.HYBRID;

    polylineWidth = isIOS ? 3 : 10;

    selectTypeCache: "NODE" | "GATE" = null;
    selectType: "NODE" | "GATE" = null;
    node: Subject<Location | Position> = new Subject();
    gate: Subject<Location | Position> = new Subject();

    nodeMarker$: Observable<Marker> = this.node.asObservable().pipe(
        locationToMarker("NODE"),
        errorHandler(`BuilderService.nodeMarker$`),
        tap((marker: Marker) => null)
    );

    gateMarker$: Observable<Marker> = this.gate.asObservable().pipe(
        locationToMarker("GATE"),
        errorHandler(`BuilderService.gateMarker`),
        tap((marker: Marker) => null)
    );

    selectedPolyline: Polyline;

    selectedMarker$ = new BehaviorSubject<Marker>(null);
    get selectedMarker(): Marker { return this.selectedMarker$.value }
    set selectedMarker(marker: Marker) {
        if (marker) {
            this.selectTypeCache = this.selectType;
            this.selectType = null;
        } else {
            this.selectType = this.selectTypeCache;
            this.selectTypeCache = null;
        }
        this.selectedMarker$.next(marker);
    }

    selectedPosition: Position;

    distance$: Observable<number>;

    private mapView: MapView = null;
    private polylines: Array<Polyline> = [];
    private markers: Array<Marker> = [];
    private markerPointMap: Array<MarkerPointMap> = [];
    private distance: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor() {
        // Constructor
        this.distance$ = this.distance.asObservable();

        // this.retrieveBlueprints();
        this.newPolyline();

        this.gateMarker$.pipe(
            // tap((marker) => alert("NEW GATE MARKER")),
            tap((marker: Marker) => this.mapView.addMarker(marker)),
            errorHandler(`mapView.addMarker<'GATE'>`)
        ).subscribe();

        this.nodeMarker$.pipe(
            // tap((marker) => alert("NEW NODE MARKER")),
            tap((marker: Marker) => this.mapView.addMarker(marker)),
            tap((marker: Marker) => this.addNodeToPolyline(marker, this.selectedPolyline)),
            errorHandler(`mapView.addMarker<'NODE'>`)
        ).subscribe();
    }

    setMapView(mapView: MapView) {
        this.mapView = mapView;
        this.setMapType(this.mapType);
        this.polylines
            .forEach((polyline) => {
                this.mapView.addPolyline(polyline);
            });
        // console.log("setMapView complete.");
    }

    setMapType(type: MapType) {
        // console.log(`BuiderService.setMapType(${type})`);
        this.mapType = type || this.mapType;
        if (this.mapView) {
            // console.log(`> this.mapView.gMap.setMapType(${type})`);
            if (isAndroid) {
                this.mapView.gMap.setMapType(type);
            } else {
                this.mapView.gMap.mapType = type;
            }
        }
    }

    selectPolyline(polyline: Polyline) {
        // console.log("selectPolyline(polyline)");
        // console.log(polyline);
        this.selectedPolyline = polyline === this.selectedPolyline ? null : polyline;
    }

    newPolyline(polyline?: Polyline): Polyline {
        // console.log("newPolyline()");
        const newPolyline = polyline || new Polyline();
        newPolyline.color = new Color(AppConstants.FENCE_MARKER_COLOR);
        newPolyline.width = this.polylineWidth;
        newPolyline.geodesic = true;
        this.addPolyline(newPolyline);
        this.selectPolyline(newPolyline);

        return newPolyline;
    }

    addPolyline(polyline: Polyline) {
        this.polylines.push(polyline);
    }

    getBlueprints(): Array<FenceBlueprintInterface> {
        const blueprints = this.polylines.map((polyline) => PolylineToBlueprint(polyline, null));
        if (blueprints[0]) {
            blueprints[0].gateLocations = this.markers
                .filter((m) => m.color === COLOR_MAP.GATE)
                .map((m) => ({
                    id: undefined,
                    start_x: m.position.latitude,
                    start_y: m.position.longitude,
                    end_x: null,
                    end_y: null
                }));
        }

        return blueprints;
    }

    deletePolyline(polyline: Polyline) {
        this.polylines.splice(this.polylines.indexOf(polyline), 1);
        this.mapView.removeShape(polyline);
        if (this.selectedPolyline === polyline) {
            this.selectedPolyline = null;
        }
    }

    addNodeToPolyline(marker: Marker, polyline: Polyline) {
        if (!marker) {
            return;
        }

        if (!polyline) {
            // console.log("addNodeToPolyline > no selected polyline, calling this.newPolyline();");
            polyline = this.newPolyline();
        }

        // console.log("Adding Position to Polyline");
        // console.log(this.selectedPolyline.getPoints());
        // console.log(this.selectedPolyline.geodesic);
        polyline.addPoint(marker.position);
        this.markers.push(marker);
        this.markerPointMap.push({
            polyline, marker, point: marker.position
        });
        this.updateCurrentDistance();
        // console.log(`Added new position ${marker.position.latitude}, ${marker.position.longitude}`);

        // console.log("addNodeToPolyline > added marker to selectedPolyline;");
        // console.log(`Total polylines: ${this.polylines.length}`);
        // console.log(`${ this.polylines.map((polyline, index) => `  [${index}] Polyline points: ${ polyline.getPoints().map.length }\n`) }`);
        // console.log(this.selectedPolyline.getPoints().map((point) => `(${point.latitude}, ${point.longitude})`));
    }

    selectPosition(marker: Marker) {
        const {latitude, longitude} = marker.position;
        this.selectedPosition = Position.positionFromLatLng(latitude, longitude);
    }

    markerPositionUpdate(marker: Marker) {
        // console.log("Marker Update");
        const {polyline} = this.markerPointMap.find((m) => m.marker === marker) || {} as any;
        // console.log(`Marker to update = ${!!marker}\nPolyline to update = ${!!polyline}`);
        if (polyline) {
            const newPoint = marker.position;
            const markerPointMap = this.markerPointMap.find((mapItem) => mapItem.marker === marker);
            const points = polyline.getPoints();
            const pointIndex = points.findIndex((p) => p.latitude === markerPointMap.point.latitude && p.longitude === markerPointMap.point.longitude);
            markerPointMap.point = newPoint;
            points[pointIndex] = newPoint;
            polyline.removeAllPoints();
            // console.log(`Polyline.addPoints(${points.length} points)`);
            // console.log(points.map((p) => `(${p.latitude}, ${p.longitude})`));
            polyline.addPoints(points);
            this.updateCurrentDistance();
        }
    }

    deleteSelectedMarker() {
        if (this.selectedMarker) {
            this.deleteMarker(this.selectedMarker);
            this.selectedMarker = null;
        }
    }

    deleteMarker(marker: Marker) {
        // console.log("Delete Marker");
        const {polyline} = this.markerPointMap.find((m) => m.marker === marker) || {} as any;
        if (polyline) {
            const markerPointMap = this.markerPointMap.find((mapItem) => mapItem.marker === marker);
            const points = polyline.getPoints();
            const pointIndex = points.findIndex((p) => p.latitude === markerPointMap.point.latitude && p.longitude === markerPointMap.point.longitude);
            points.splice(pointIndex, 1);
            this.selectedPolyline.removeAllPoints();
            this.selectedPolyline.addPoints(points);
        }
        this.updateCurrentDistance();
        this.mapView.removeMarker(marker);
    }

    deleteAllMarkers() {
        let nextMarker = this.markers.pop();
        while(nextMarker) {
            this.deleteMarker(nextMarker);
            nextMarker = this.markers.pop();
        }
    }

    updateCurrentDistance() {
        const updatedDistance = this.polylines.reduce((d, polyline: Polyline) => d + getDistanceOfPolyline(polyline), 0);
        const roundedDistance = Math.ceil(updatedDistance * 10) / 10;
        // console.log(`Updating current distance to ${updatedDistance} => ${roundedDistance}`);
        // Convert to Inches
        const inches = metersToInches(roundedDistance);
        this.distance.next(inches);
        // this.dataService.saveLocal$("FenceBlueprint").subscribe();
    }

    shiftMarkerOrder(marker: Marker, offset: number) {
        this.shiftNodeMarkerOrder(marker, offset);
    }

    private shiftNodeMarkerOrder(marker: Marker, offset: number) {
        if (this.markers.length < 3) {
            return;
        }

        const currentIndex = this.markers.indexOf(marker);
        const targetIndex = currentIndex + offset;

        arrayMove(this.markers, currentIndex, targetIndex);
        this.shiftNodeOrderOnPolyline(marker, currentIndex, targetIndex);
    }

    private shiftNodeOrderOnPolyline(marker: Marker, currentIndex: number, targetIndex: number) {
        const {polyline} = this.markerPointMap.find((m) => m.marker === marker) || {} as any;
        // console.log(`Marker to update = ${!!marker}\nPolyline to update = ${!!polyline}`);
        if (polyline) {
            const points = polyline.getPoints();
            arrayMove(points, currentIndex, targetIndex);
            polyline.removeAllPoints();
            // console.log(`Polyline.addPoints(${points.length} points)`);
            // console.log(points.map((p) => `(${p.latitude}, ${p.longitude})`));
            polyline.addPoints(points);
            this.updateCurrentDistance();
        }
    }

}

export interface MarkerPointMap {
    polyline: Polyline;
    marker: Marker;
    point: Position;
}

function locationToMarker(type: "NODE" | "GATE"): OperatorFunction<Location, Marker> {
    return map<Location, Marker>((location: Location) => {
        const marker = new Marker();
        if (!!location) {
            const position = Position.positionFromLatLng(location.latitude, location.longitude);
            marker.position = position;
            marker.title = MARKER_TITLE;
            marker.draggable = true;
            marker.color = COLOR_MAP[type];
        } else {
            // console.log(`Error in shared/builder.service.ts > locationToMarker received ${location} Marker`);
        }

        return marker;
    });
}

function errorHandler(label: string) {
    return catchError((error) => {
        const message = `Error in shared/builder.service.ts > ${label}`;
        // console.log(message);
        alert(message);
        console.log(error);

        return error;
    });
}

export function PolylineToBlueprint(polyline: Polyline, id: string, name?: string): FenceBlueprintInterface {
    name = name || "New Blueprint";
    const fenceMeasurements = generateFenceMeasurements(polyline);
    const gateLocations = [];

    return {
        id,
        name,
        fenceMeasurements,
        gateLocations
    };

}

function generateFenceMeasurements(polyline: Polyline): Array<FenceMeasurementInterface> {
    const points = polyline.getPoints();

    return points.map((point, index) => {
        if (index === 0) {
            return null;
        }

        return {
            id: undefined,
            start_x: point.latitude,
            start_y: point.longitude,
            end_x: points[index - 1].latitude,
            end_y: points[index - 1].longitude
        };
    }).filter((p) => !!p);
}

export function BlueprintToPolyline(fenceBlueprint: FenceBlueprintInterface): Polyline {
    const polyline = new Polyline();
    const points: Array<Position> = [];

    fenceBlueprint.fenceMeasurements.forEach((fenceMeasurement) => {
        const point1 = Position.positionFromLatLng(fenceMeasurement.start_x, fenceMeasurement.start_y);
        const point2 = Position.positionFromLatLng(fenceMeasurement.end_x, fenceMeasurement.end_y);
        if (!points.find((p) => p.latitude === point1.latitude && p.longitude === point1.longitude)) {
            points.push(point1);
        }
        points.push(point2);
    });

    polyline.addPoints(points);

    return polyline;

}

export function BlueprintToMarkers(fenceBlueprint: FenceBlueprintInterface): Array<Marker> {

    const markers: Array<Marker> = [];
    const points: Array<Position> = [];

    fenceBlueprint.fenceMeasurements.forEach((fenceMeasurement) => {
        const point1 = Position.positionFromLatLng(fenceMeasurement.start_x, fenceMeasurement.start_y);
        const point2 = Position.positionFromLatLng(fenceMeasurement.end_x, fenceMeasurement.end_y);
        if (!points.find((p) => p.latitude === point1.latitude && p.longitude === point1.longitude)) {
            points.push(point1);
        }
        points.push(point2);
    });

    return points.map(PositionToMarker);
}

export function PositionToMarker(position: Position): Marker {
    const marker = new Marker();
    marker.position = position;
    marker.title = "Fence";
    marker.draggable = true;
    marker.color = COLOR_MAP.NODE;

    return marker;
}

export function getDistanceOfPolyline(polyline: Polyline) {
    // console.log("getDistanceOfPolyline");
    const points = polyline.getPoints();
    // console.log(`> Polyline has ${points.length} points`);

    return points.reduce((d, point, index) => d + distanceBetweenPoints(point, points[index - 1]), 0);
}

export function distanceBetweenPoints(p1: Position, p2: Position): number {
    if (!p1 || !p2) {
        return 0;
    }

    const l1 = new Location();
    l1.longitude = p1.longitude;
    l1.latitude = p1.latitude;

    const l2 = new Location();
    l2.longitude = p2.longitude;
    l2.latitude = p2.latitude;

    return distance(l1, l2);
}

export function arrayMove<T>(arr: Array<T>, oldIndex: number, newIndex: number): Array<T> {
    if (newIndex >= arr.length) {
        newIndex = newIndex % arr.length;
    } else if (newIndex < 0) {
        newIndex = arr.length + newIndex;
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr; // for testing
}

