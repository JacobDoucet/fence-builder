import { AppConstants } from "~/app/constants";
import { ModelInterface } from "./../types/model";
import * as appSettings from "tns-core-modules/application-settings";
import { Observable, of, throwError } from "rxjs";
import { mergeMap, tap, map, delayWhen } from "rxjs/operators";

const keyLists: { [key: string]: Array<string> } = {
    Fence: AppConstants.FenceKeys,
    FenceOrder: AppConstants.FenceOrderKeys,
    Customer: AppConstants.CustomerKeys
};

export class LocalDataService {

    /**
     * Utilities
     */

    static getKeys(modelname) {
        return keyLists[modelname] || null;
    }

    /**
     * Single Value
     */

    static pushToList$(key: string, value: string | number) {
        return new Observable<void>(($) => {
            let list = appSettings.getString(key);

            if (!!value || !isNaN(Number(value))) {
                if (!!list) {
                    if (list.split(",").indexOf(`${value}`) === -1) {
                        list = `${list},${value}`;
                    }
                } else {
                    list = `${value}`;
                }
                appSettings.setString(key, list.replace(/^,/, ""));
            } else {
                this.remove(key);
            }

            $.next(null);
            $.complete();
        });
    }

    static removeFromList(key: string, value: string | number) {
        return new Observable<void>(($) => {
            let list = appSettings.getString(key);

            if (!!list) {
                list = list.replace(`${value}`, "")
                    .replace(/,,/, ",")
                    .split(",")
                    .filter((piece) => !!piece)
                    .join(",");
                appSettings.setString(key, list);
            }

            $.next(null);
            $.complete();
        });
    }

    static insert$(key: string, value: any): Observable<void> {
        // console.log("SAVE", key);
        // console.log(value);

        return new Observable<void>(($) => {
            if (!!value || (value !== null && value !== undefined)) {
                if (Array.isArray(value)) {
                    value = value.map((v) => serialize(v)).join(",");
                }
                value = serialize(value);
                appSettings.setString(key, `${value}`);
            } else {
                this.remove(key);
            }
            $.next(null);
            $.complete();
        });
    }

    static delete(key: string) {
        appSettings.remove(key);
    }

    static select$<T>(key: string): Observable<string | T> {
        return new Observable<string>(($) => {
            const val = appSettings.getString(key);
            // console.log(`SELECT ${key.split(".").filter((e, i) => i % 2 === 0).join(".")}=${val}`);
            try {
                $.next(JSON.parse(val));
            } catch (e) {
                $.next(val || null);
            }
            $.complete();
        });
    }

    static remove(key: string) {
        // console.log("REMOVE:", key);

        return appSettings.remove(key);
    }

    /**
     * Entities
     */

    static serializeMany$<T extends ModelInterface>(entities: Array<T>, modelname: string): Observable<void> {
        const ids = (appSettings.getString(modelname) || "").split(",");
        entities.map((entity) => entity.id).forEach((id) => {
            if (!ids.find((_id) => _id === id)) {
                ids.push(id);
            }
        });
        const serializeEntities = entities.reduce(
            (pipeline, entity) => pipeline.pipe(mergeMap(() => this.serializeOne$(entity, modelname))), of(null)
        );
        
        return this.insert$(modelname, ids).pipe(
            mergeMap(() => serializeEntities)
        );
        
    }

    static serializeOne$<T extends ModelInterface>(entity: T, modelname: string): Observable<void> {
        const keys: Array<string> = keyLists[modelname];
        if (keys) {
            
            return keys.reduce(
                (pipeline, key) => pipeline.pipe(
                    mergeMap(() => this.insert$(this.keyGen(modelname, entity, key), entity[key]))
                ),
                this.pushToList$(modelname, entity.id)
            );
        } else {
            return throwError(`${modelname} not configured.`);
        }
    }

    static deleteOne$<T extends ModelInterface>(entity: T, modelname: string): Observable<void> {
        modelname = modelname;
        const keys: Array<string> = keyLists[modelname];
        if (keys) {
            return keys.reduce(
                (pipeline, key) => pipeline.pipe(
                    map(() => this.remove(this.keyGen(modelname, entity, key)))
                ),
                this.removeFromList(modelname, entity.id)
            );
        } else {
            return throwError(`${modelname} not configured.`);
        }
    }

    static deleteAll$<T extends ModelInterface>(modelname: string): Observable<void> {
        const keys: Array<string> = keyLists[modelname];
        if (keys) {
            const ids = appSettings.getString(modelname) || "";

            return ids
                .split(",")
                .reduce((pipeline, id) => pipeline.pipe(
                    delayWhen(() => this.deleteOne$({ id }, modelname))
                ), of(undefined)).pipe(
                    tap(() => appSettings.remove(modelname))
                );
        }
        throw new Error(`deleteAll$("${modelname}") <= ${modelname} not configured`);
    }

    static selectAll$(modelname: string) {
        const ids = (appSettings.getString(modelname) || "").split(",");
        // console.log(modelname, "Ids found:", ids.length);
        // console.log(ids.join("<<<<>>>>>"));

        return ids.reduce((pipeline, id) => pipeline.pipe(
            mergeMap((collection) => this.deserialize$(modelname, id).pipe(
                map((entity) => {
                    collection.push(entity);

                    return collection;
                })
            )),
            map((collection) => collection.filter((c) => !!c))
        ), of([])).pipe(
            tap((entities) => {
                // console.log(`Deserialized ${modelname} [ ${entities.length} ]`);
            })
        );
    }

    static deserialize$<T extends ModelInterface>(modelname: string, id: string): Observable<T> {
        const keys: Array<string> = keyLists[modelname];
        if (!keys) { return throwError(`${modelname} not configured.`); }
        
        const newEntity: ModelInterface = { id };

        return of(newEntity as T)
            .pipe(delayWhen(
                (entity) => {
                    return keys.reduce(
                        (pipeline, key) => pipeline.pipe(
                            mergeMap(() => this.select$(this.keyGen(modelname, entity, key))
                                .pipe(
                                    tap((value) => entity[key] = value)
                                )
                            )
                        ),
                        of(null)
                    );
                })
            );
    }

    static keyGen<T extends ModelInterface>(modelname: string, entity: T, key?: string): string {
        if (!key) { return `${modelname}`; }

        return `${modelname}.${entity.id}.${key}`;
    }
}

function serialize(thing) {
    if (typeof thing === "string") { return thing; }

    return JSON.stringify(thing);
}
