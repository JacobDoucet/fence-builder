import { AppConstants } from "~/app/constants";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, tap } from "rxjs/operators";
import * as appSettings from "tns-core-modules/application-settings";
import { of, Observable, BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  authEvent$: BehaviorSubject<string>;
  logout$ = new Subject<void>();

  get username() { return appSettings.getString(AppConstants.USERNAME_KEY); }
  get token() { return appSettings.getString(AppConstants.TOKEN_KEY); }

  constructor(private httpClient: HttpClient) {
    this.authEvent$ = new BehaviorSubject<string>("");
  }

  authenticate$(): Observable<boolean> {
    return this.httpClient.get<boolean>(`${AppConstants.API}/auth?authToken=${this.token}`)
      .pipe(
        catchError((e) => {
          // console.log("User not authenticated");
          // console.log(e);

          return of(false);
        })
      );
  }

  logout() {
    appSettings.setString(AppConstants.TOKEN_KEY, "");
    appSettings.setString(AppConstants.USERNAME_KEY, "");
    this.authEvent$.next(null);
    this.logout$.next();
  }

  login$(username: string, password: string): Observable<string> {
    return this.httpClient.post<{ token: string }>(`${AppConstants.API}/auth/login`, { username, password })
      .pipe(
        // tap((data) => console.log(data)),
        map((data) => data.token),
        tap((token) => {
          appSettings.setString(AppConstants.TOKEN_KEY, token);
          appSettings.setString(AppConstants.USERNAME_KEY, username);
          this.authEvent$.next(token);
        })
      );
  }

  register$(username: string, password: string): Observable<any> {
    return this.httpClient.post<{ token: string }>(`${AppConstants.API}/apiuser`, { username, password });
  }
}
