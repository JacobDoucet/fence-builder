import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  endpoint = 'customer';

  readonly user$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  get user() { return this.user$.value; }
  set user(user: any) {
    this.user$.next(user);
  }

  constructor() { }

  ngOnInit() {
    this.user$.subscribe(user => console.log('New User:', user));
  }

}
