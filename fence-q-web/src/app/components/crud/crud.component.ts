import { StoreService } from './../../services/store.service';
import { DataService } from './../../services/data.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, mergeMap, map } from 'rxjs/operators';
import { buildUrl } from '../../services/data.service.util';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss']
})
export class CrudComponent implements OnInit {

  opentabs: {[key: string]: any} = {};

  @Input() endpoint = '';
  @Input() fixed: boolean;
  @Input() foreignKeys: ForeignKey[] = [];
  @Input() header: boolean;
  // @Input() store: boolean;

  store: Observable<any>;

  entity: any = {};
  get keys() { return Object.keys(this.entity); }

  constructor(private dataService: DataService, private storeService: StoreService) { }

  ngOnInit() {
    if (!!this.endpoint) {
      this.load().subscribe();
      this.store = this.storeService.getStore(this.endpoint);
    }
  }

  toggleTab(tab: string) {
    this.opentabs[tab] = !this.opentabs[tab];
  }

  load() {
    this.entity = {};
    return this.getNew();
  }

  getNew() {
    return this.dataService.get$({
      endpoint: this.endpoint,
      id: 'new'
    }).pipe(
      tap((data: any) => this.entity = data[0])
    );
  }

  select(entity) {
    this.entity = JSON.parse(JSON.stringify(entity));
  }

  save() {
    this.storeService.push$(this.entity, this.endpoint)
      .subscribe();
  }

  delete() {
    this.dataService.delete$<any>({ endpoint: this.endpoint }, this.entity.id)
      .pipe(mergeMap(() => this.load()))
      .subscribe();
  }

  new() {
    this.load().subscribe();
  }

}

export interface ForeignKey {
  key: string;
  label: (entity: any) => string;
  resource$: () => Observable<any[]>;
}

export interface EndpointConfig {
  endpoint: string;
  foreignKeys: ForeignKey[];
}
