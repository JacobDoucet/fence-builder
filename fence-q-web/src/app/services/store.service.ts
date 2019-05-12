import { BehaviorSubject, of } from 'rxjs';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { map, tap, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  store: BehaviorSubject<Store<any>[]> = new BehaviorSubject([]);

  constructor(private dataService: DataService) {}

  getStore<T>(endpoint: string) {
    let store: Store<T> = this.store.value.find(_store => _store.endpoint === endpoint);
    if (!store) {
      store = {
        endpoint,
        data$: new BehaviorSubject<T[]>([])
      };
      this.store.next(this.store.value.concat([store]));
      this.refreshStore$(endpoint).subscribe();
    }
    return store.data$.asObservable();
  }

  refreshStore$(endpoint: string) {
    const store = this.store.value.find(_store => _store.endpoint === endpoint);
    return of(store)
      .pipe(
        mergeMap(() => this.dataService.get$<any>({ endpoint: store.endpoint })),
        map((data: any[]) => data.filter(entity => !store.data$.value.find(_entity => entity.id === _entity.id))),
        tap(data => store.data$.next(store.data$.value.concat(data))),
        map(() => store.data$.value)
      );
  }

  push$(entity: any, endpoint: string) {
    const store = this.store.value.find(_store => _store.endpoint === endpoint);
    return this.dataService.createOrUpdate$({ endpoint }, entity)
      .pipe(
        mergeMap(() => this.refreshStore$(endpoint)),
        map(data => data.find(_entity => entity.id === _entity.id)),
        tap(_entity => replaceEntity(_entity, entity))
      );
  }

  destroyStore(endpoint: string) {
    const store$ = this.store.value;
    const store = store$.find(_store => _store.endpoint === endpoint);
    if (store) {
      store.data$.complete();
      this.store.next(store$.filter(_store => _store === store));
    }
  }
}

export interface Store<T> {
  endpoint: string;
  data$: BehaviorSubject<T[]>;
}

function replaceEntity(original: any, updated: any) {
  if (!original) { return; }
  Object.keys(updated).forEach(key => original[key] = updated[key]);
}
