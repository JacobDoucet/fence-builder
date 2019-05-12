import { Component } from '@angular/core';
import { NavbarService } from './services/navbar.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  readonly navItems$ = this.navbar.navItems$;
  readonly subnavItems$ = this.navbar.subnavItems$;

  constructor(private navbar: NavbarService) {
    this.navbar.navItems.next([
      { path: '/explorer', title: 'Explorer'},
      { path: '/profile', title: 'Profile'}
    ]);
  }
}
