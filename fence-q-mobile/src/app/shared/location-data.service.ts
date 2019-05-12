import { BehaviorSubject, Observable, from } from "rxjs";
import { Injectable, NgZone } from "@angular/core";
import { filter, map } from "rxjs/operators";
import {
    isEnabled,
    enableLocationRequest,
    getCurrentLocation,
    clearWatch,
    watchLocation,
    Location
} from "nativescript-geolocation";
import { Position } from "nativescript-google-maps-sdk";
import { Accuracy } from "tns-core-modules/ui/enums";

@Injectable({
    providedIn: "root"
})
export class LocationDataService {

    private loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    readonly loading$: Observable<boolean> = this.loading.asObservable();

    currentLocation$: Observable<Location | Position>;
    longitude$: Observable<number>;
    latitude$: Observable<number>;

    private currentLocation = new BehaviorSubject<Location | Position>(null);
    private watchId: number;

    constructor(private zone: NgZone) {
        this.currentLocation$ = this.currentLocation.asObservable().pipe(filter((l) => !!l));
        this.longitude$ = this.currentLocation$.pipe(map((l) => l.longitude));
        this.latitude$ = this.currentLocation$.pipe((map((l) => l.latitude)));
    }

    updateLocation() {
        this.getCurrentLocation().then((location) => {
            this.pushLocation(location);
            this.loading.next(false);
        }).catch((error) => {
            this.loading.next(false);
        });
    }

    pushLocation(location: Location | Position) {
        console.log("PushLocation");
        console.log(location);
        this.currentLocation.next(location);
    }

    getCurrentLocation(): Promise<any> {
        let $ = new Promise<void>((r) => r());
        if (!isEnabled()) {
            $ = enableLocationRequest();
        }

        this.loading.next(true);
        return $.then(
            () => {
                return getCurrentLocation({
                    desiredAccuracy: Accuracy.high,
                    timeout: 10000
                });
            }
        );
    }

    startWatchingLocation() {
        this.watchId = watchLocation((location) => {
            if (location) {
                this.zone.run(() => {
                    this.currentLocation.next(location);
                });
            }
        }, (error) => {
            console.error(error.message);
        }, {updateDistance: 1, minimumUpdateTime: 1000});
    }

    stopWatchingLocation() {
        if (this.watchId) {
            clearWatch(this.watchId);
            this.watchId = null;
        }
    }

}
