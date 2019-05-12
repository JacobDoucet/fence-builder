import { Entity } from './../../../../fence-q-api/src/models/index';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl, DataServiceGetOptions, DataServiceOptions, cast } from './data.service.util';
import { map, mergeMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  get$<T>(options: DataServiceGetOptions): Observable<T[]> {
    return of(buildUrl(options))
      .pipe(
        mergeMap(url => this.http.get(url)),
        map((data: any) => data.data),
        tap(console.log),
        cast<T[]>()
      );
  }

  createOrUpdate$<T extends Entity>(options: DataServiceOptions, entity: T): Observable<T[]> {
    if (!(<any>entity).id) { return this.create$<T>(options, entity); }
    return this.update$<T>(options, entity);
  }

  create$<T>(options: DataServiceOptions, entity: T): Observable<T[]> {
    return of(buildUrl(options))
      .pipe(
        mergeMap(url => this.http.post(url, entity)),
        map((data: any) => data.data),
        cast<T[]>()
      );
  }

  update$<T extends Entity>(options: DataServiceOptions, entity: T): Observable<T[]> {
    (<DataServiceGetOptions>options).id = entity.id;
    return of(buildUrl(options))
      .pipe(
        mergeMap(url => this.http.put(url, entity)),
        map((data: any) => data.data),
        cast<T[]>()
      );
  }

  delete$<T>(options: DataServiceGetOptions, id: number): Observable<T> {
    (<DataServiceGetOptions>options).id = id;
    return of(buildUrl(options))
      .pipe(
        mergeMap(url => this.http.delete(url)),
        map((data: any) => data.data),
        cast<T>()
      );
  }

}
