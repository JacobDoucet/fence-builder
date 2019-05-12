import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../shared/auth.service";

@Injectable({
  providedIn: "root"
})
export class UserGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const auth = !!this.authService.token;
      
      if (!auth) {
        this.router.navigate(["login"]);
      }

      return auth;
  }
}
