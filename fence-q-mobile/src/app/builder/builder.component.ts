import { MapWrapperComponent } from "./map-wrapper/map-wrapper.component";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { ControlPanelComponent } from "./control-panel/control-panel.component";
import { BuilderService, MapType } from "../shared/builder.service";
import { LocationDataService } from "../shared/location-data.service";
import { debounceTime, delayWhen, map, take, tap } from "rxjs/operators";
import { forkJoin, Subject } from "rxjs";
import { filter } from "rxjs/internal/operators/filter";
import { mergeFilter } from "~/app/shared/util";

@Component({
    selector: "Builder",
    moduleId: module.id,
    templateUrl: "./builder.component.html",
    styleUrls: [ "./builder.component.css" ]
})
export class BuilderComponent implements OnInit {

    @ViewChild(MapWrapperComponent) mapWrapper: MapWrapperComponent;
    @ViewChild(ControlPanelComponent) controlPanel: ControlPanelComponent;
    @ViewChild("searchbar") searchBarElement: ElementRef<SearchBar>;

    get nextMapType() {
        return this.builderService.mapType === MapType.HYBRID ? MapType.TERRAIN : MapType.HYBRID;
    }
    setMapType = (mapType: MapType) => this.builderService.setMapType(mapType);
    toggleMapType = () => {
        this.setMapType(this.nextMapType);
    };

    constructor(
        private builderService: BuilderService,
        private locationDataService: LocationDataService) {
        // constructor
    }

    ngOnInit(): void {
        this.initializeControls();
        this.initializeMap();
        this.listenForLocationUpdates();

        this.locationDataService.updateLocation();

        // console.log(this.builderService.selectedPolyline);
    }

    private initializeControls() {
        this.controlPanel.markerActive$ = this.builderService.selectedMarker$.pipe(
            map((marker) => !!marker)
        );

        this.controlPanel.loading$ = this.locationDataService.loading$;

        this.controlPanel.distanceLabel$ = this.builderService.distance$.pipe(
            map((d: number) => `${Math.round(d * 100) / 100} m`)
        );

        this.controlPanel.distance$ = this.builderService.distance$;

        this.controlPanel.toggleMapType = () => this.toggleMapType();

        this.controlPanel.getCurrentLocation = () => {
            this.locationDataService.updateLocation();
        };

        this.controlPanel.clickDelete = () => this.builderService.deleteSelectedMarker();

        this.controlPanel.clickReset = () => this.builderService.deleteAllMarkers();

        // Debounce the clicks
        const debounceMoveMarker = new Subject();

        debounceMoveMarker.asObservable().pipe(
            debounceTime(250),
            tap((offset: number) => {
                this.builderService
                    .shiftMarkerOrder(this.builderService.selectedMarker, offset)
            })
        ).subscribe();

        this.controlPanel.moveMarker = (offset: number) => debounceMoveMarker.next(offset);
    }

    private initializeMap() {
        this.mapWrapper.onMapReady = (event) => this.builderService.setMapView(event.object);
        this.mapWrapper.onMarkerSelect = (event) => {
            this.controlPanel.gateActive$.next(false);
            this.controlPanel.nodeActive$.next(false);
            this.builderService.selectedMarker = event.marker;
        };
        this.mapWrapper.onMarkerBeginDragging = (event) => this.builderService.selectPosition(event.marker);
        this.mapWrapper.onMarkerEndDragging = (event) => {
            this.builderService.markerPositionUpdate(event.marker);
            this.builderService.selectedPosition = null;
        };

        this.mapWrapper.onCoordinateTapped = (event) => {
            const { position } = event;
            if (!this.builderService.selectedMarker) {
                this.locationDataService.pushLocation(position);
            }
            this.builderService.selectedMarker = null;
        }
    }

    private listenForLocationUpdates() {
        this.locationDataService.currentLocation$
            .pipe(
                delayWhen((location) => forkJoin(
                    this.controlPanel.nodeActive$.pipe(take(1)),
                    this.controlPanel.gateActive$.pipe(take(1))
                ).pipe(
                    tap(([ nodeActive, gateActive]) => {
                        console.log(nodeActive, gateActive);
                        if (nodeActive) { this.builderService.node.next(location); }
                        if (gateActive) { this.builderService.gate.next(location); }
                    })
                ))
            ).subscribe();

        this.locationDataService.longitude$.pipe(
            mergeFilter(this.controlPanel.gateActive$, a => !a),
            mergeFilter(this.controlPanel.nodeActive$, a => !a),
            filter(() => !this.builderService.selectType),
            tap((lon) => this.mapWrapper.longitude = lon)
        ).subscribe();

        this.locationDataService.latitude$.pipe(
            mergeFilter(this.controlPanel.gateActive$, a => !a),
            mergeFilter(this.controlPanel.nodeActive$, a => !a),
            tap((lat) => this.mapWrapper.latitude = lat)
        ).subscribe();
    }

}
