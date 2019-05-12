import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  login() {
    const { username, password } = this;
    this.http.post(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(() => {
          console.log('Login success');
          this.router.navigate(['.']);
        }),
        catchError((e, $) => {
          console.log('Login failure');
          const message = Object.keys(e.error)
            .map(key => `${key} = ${e.error[key]}`)
            .join(', ');
          this.error = message;
          return of(message);
        })
      ).subscribe();
  }

}
