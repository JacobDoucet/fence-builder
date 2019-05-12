import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  readonly navItems: BehaviorSubject<NavItem[]> = new BehaviorSubject([]);
  readonly navItems$ = this.navItems.pipe(filter(items => !!items));

  readonly subnavItems: BehaviorSubject<NavItem[]> = new BehaviorSubject([]);
  readonly subnavItems$ = this.subnavItems.pipe(filter(items => !!items));

  constructor() {}
}

export interface NavItem {
  title: string;
  path: string;
}
