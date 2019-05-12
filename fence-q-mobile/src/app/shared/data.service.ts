import { LocalDataService } from "./local-data.service";
import { AuthService } from "./auth.service";
import { AppConstants } from "~/app/constants";
import { ModelInterface } from "./../types/model";
import { tap, map, catchError, mergeMap, delayWhen, take } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FenceOrderInterface } from "../types/fence-order";
import { Observable, BehaviorSubject, of, MonoTypeOperatorFunction, forkJoin } from "rxjs";
import { FenceInterface } from "../types/fence";
import { CustomerInterface } from "../types/customer";
import { FenceBlueprintInterface } from "../types/fence-blueprint";

export interface ApiResponse<T extends ModelInterface> {
    data?: Array<T>;
    error?: string;
}

@Injectable({
    providedIn: "root"
})
export class DataService {

    private get authToken(): string { return this.authService.token; }

    orders$: BehaviorSubject<Array<FenceOrderInterface>>;
    customer$: BehaviorSubject<Array<CustomerInterface>>;
    fences$: BehaviorSubject<Array<FenceInterface>>;
    fenceBlueprints$: BehaviorSubject<Array<FenceBlueprintInterface>>;

    constructor(private httpClient: HttpClient, private authService: AuthService) {
        this.orders$ = new BehaviorSubject<Array<FenceOrderInterface>>([]);
        this.customer$ = new BehaviorSubject<Array<CustomerInterface>>([]);
        this.fences$ = new BehaviorSubject<Array<FenceInterface>>([]);
        this.fenceBlueprints$ = new BehaviorSubject<Array<FenceBlueprintInterface>>([]);
        // this.orders$.pipe(logger("orders$")).subscribe();
        // this.fences$.pipe(logger("fences$")).subscribe();
        // this.fences$.pipe(logger("customer$")).subscribe();
        this.authService.authEvent$
            .pipe(tap(() => this.refresh()))
            .subscribe();
        this.authService.logout$.pipe(
            tap(() => {
                this.clearLocal<CustomerInterface>("Customer");
            })
        ).subscribe();

        // LocalDataService.remove("Fence");
        // LocalDataService.remove("FenceOrder");
        // LocalDataService.remove("Customer");

    }

    getStore(modelname: string): BehaviorSubject<Array<ModelInterface>> {
        if (modelname === "FenceOrder") {
            return this.orders$;
        }
        if (modelname === "Customer") {
            return this.customer$;
        }
        if (modelname === "Fence") {
            return this.fences$;
        }
        if (modelname === "FenceBlueprint") {
            return this.fenceBlueprints$;
        }
        throw new Error(`DataService.getStore("${modelname}") <- ${modelname} not configured`);
    }

    refresh() {
        this.fetchFences();
        // this.fetchOrders();
        this.fetchCustomers();
    }

    readonly fetchFences = () => this.fetchFences$().subscribe();
    readonly fetchOrders = () => this.fetchOrders$().subscribe();
    readonly fetchCustomers = () => this.fetchCustomers$().subscribe();

    fetchOrders$(): Observable<Array<FenceOrderInterface>> {
        return this.fetchEntities$<FenceOrderInterface>("FenceOrder", "fenceorder", this.orders$);
    }

    saveOrder$(order: FenceOrderInterface) {
        return this.saveRemote$(order, "FenceOrder", "fenceorder");
    }

    fetchFences$(): Observable<Array<FenceInterface>> {
        // return this.fetchEntities$<FenceInterface>("Fence", "fence", this.fences$);
        return this.fetch$<FenceInterface>("fence")
            .pipe(
                setStore(this.fences$)
                // tap((fences) => console.log("fetchFences$ Complete"))
            );
    }

    fetchBlueprints$(): Observable<Array<FenceBlueprintInterface>> {
        return this.fetchLocal$("FenceBlueprint");
    }

    fetchCustomers$(): Observable<Array<CustomerInterface>> {
        return LocalDataService.select$<Array<CustomerInterface>>("Customer").pipe(
            map((c) => (c || []) as Array<CustomerInterface>),
            tap((c) => this.customer$.next(c))
        );
    }

    fetchEntities$<T extends ModelInterface>(modelname: string, endpoint: string, store: BehaviorSubject<Array<T>>): Observable<Array<T>> {
        return LocalDataService.selectAll$(modelname).pipe(
            // tap((entities) => console.log(`)) ${modelname} : pushing ${entities.length} entities to store`)),
            pushToStore(store),
            mergeMap((entities: Array<T>) => this.fetch$<T>(endpoint).pipe(
                mergeMap((entitiesUpdate) => entitiesUpdate.reduce((pipeline, entityUpdate) => {
                    return pipeline.pipe(
                        tap((fencesToInsert) => {
                            const existingEntity = entities.find((fenceInList) => fenceInList.id === entityUpdate.id);
                            if (!!existingEntity) {
                                return Object.keys(entityUpdate).filter((key) => entityUpdate[key] !== existingEntity[key])
                                    .forEach((key) => existingEntity[key] = entityUpdate[key]);
                            }
                            fencesToInsert.push(entityUpdate);
                        })
                    );
                }, of([]))
            ))),
            delayWhen((entitiesUpdate: Array<T>) => LocalDataService.serializeMany$(entitiesUpdate, modelname)),
            pushToStore(store),
            errorHandler()
        );
    }
    
    fetch$<T extends ModelInterface>(endpoint: string): Observable<Array<T>> {
        return this.httpClient.get<ApiResponse<T>>(`${AppConstants.API}/${endpoint}?${AppConstants.TOKEN_KEY}=${this.authToken}`)
            .pipe(
                unpack<T>()
            );
    }

    fetchLocal$<T extends ModelInterface>(modelname: string): Observable<Array<T>> {
        return LocalDataService.select$<Array<T>>(modelname)
            .pipe(
                map((t) => (t || []) as Array<T>)
            );
    }

    saveLocal$<T extends ModelInterface>(modelname: string, entity?: T, replaceAll?: boolean) {
        return this.getStore(modelname)
            .pipe(
                take(1),
                tap((entities) => {
                    if (entity && entities.indexOf(entity) === -1) {
                        entities.push(entity);
                    }
                }),
                map((entities) => replaceAll ? JSON.stringify([ entity ]) : JSON.stringify(entities)),
                mergeMap((entities) => LocalDataService.insert$(modelname, entities))
            );
    }

    clearLocal<T extends ModelInterface>(modelname: string) {
        LocalDataService.delete(modelname);
    }

    saveRemote$<T extends ModelInterface>(entity: T, modelname: string, endpoint: string) {
        const preId = entity.id;

        return this.httpClient.post(`${AppConstants.API}/${endpoint}?${AppConstants.TOKEN_KEY}=${this.authToken}`, entity)
            .pipe(
                // tap((response) => console.log(response))
            );
    }

    deletePersonalData$() {
        return forkJoin(
            LocalDataService.deleteAll$("FenceOrder"),
            LocalDataService.deleteAll$("Customer")
        ).pipe(
            catchError((e) => {
                // console.log("Error deleting personal data");

                return of(e);
            }),
            tap(() => {
                this.orders$.next([]);
                this.customer$.next([]);
            })
        );
    }

    deleteOrder$(order: FenceOrderInterface) {
        return this.deleteEntity$(order, "FenceOrder");
    }

    deleteEntity$(entity: ModelInterface, modelname: string) {
        return LocalDataService.deleteOne$(entity, modelname)
            .pipe(
                mergeMap(() => LocalDataService.selectAll$(modelname)),
                tap((entities) => this.getStore(modelname).next(entities))
            );
    }

}

function unpack<T extends ModelInterface>() {
    return map((data: ApiResponse<T>) => {
        if (data.error) {
            throw new Error(data.error);
        }

        return data.data;
    });
}

function setStore<T extends ModelInterface>(store: BehaviorSubject<Array<T>>): MonoTypeOperatorFunction<Array<T>> {
    return tap((data: Array<T>) => {
        store.next(data);
    });
}

function pushToStore<T extends ModelInterface>(store: BehaviorSubject<Array<T>>): MonoTypeOperatorFunction<Array<T>> {
    return tap((data: Array<T>) => {
        store.next(store.value.concat(data));
        // console.log(`Pushed ${data.length} entities to store ${store.constructor.name}`);
    });
}

function errorHandler() {
    return catchError((e) => {
        console.log("DataService > errorHandler");
        console.log(e.error || e);

        return of(e);
    });
}
