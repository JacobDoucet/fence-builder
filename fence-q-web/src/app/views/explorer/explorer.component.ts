import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavbarService, NavItem } from '../../services/navbar.service';
import { HttpClient } from '@angular/common/http';
import { tap, map, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { EndpointConfig } from '../../components/crud/crud.component';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  endpoints: EndpointConfig[] = [
    { endpoint: 'fence',
      foreignKeys: []
    },
    {
      endpoint: 'customer',
      foreignKeys: []
    },
    {
      endpoint: 'order',
      foreignKeys: [
        {
          key: 'customer_id',
          label: customer => `${customer.username}`,
          resource$: () => this.storeService.getStore('customer')
        },
        {
          key: 'fence_id',
          label: fence => `${fence.name}`,
          resource$: () => this.storeService.getStore('fence')
        }
      ]
    },
  ];

  get navitems(): NavItem[] {
    return [
      { path: './explorer/map', title: 'Map' },
      { path: './explorer/fence', title: 'Fences' }
    ];
  }

  constructor(private navbar: NavbarService, private storeService: StoreService) { }

  ngOnInit() {
  }

}
