import { AuthService } from "./../shared/auth.service";
import { Component, OnInit } from "@angular/core";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { tap, catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "Login",
  moduleId: module.id,
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {

  get enabled() { return !!this.username && !!this.password; }

  get isLoggedIn() { return !!this.authService.token; }

  message = "";

  username: string = "";
  password: string = "";

  confirmPassword: string = "";
  showConfirmPassword = false;

  constructor(private authService: AuthService) {
    // constructor
  }

  ngOnInit() {
    // ngOnInit
  }

  login() {
    this.message = "";
    
    if (this.invalid()) {
      return;
    }

    this.authService
      .login$(this.username, this.password)
        .pipe(
          catchError((e) => {
            console.log("There was an error");
            this.message = parseLoginError(e);

            return of(e);
          })
        )
        .subscribe();
  }

  register() {
    this.message = "";
    
    if (this.invalid()) {
      return;
    }

    if (!this.confirmPassword) {
      return this.showConfirmPassword = true;
    }

    if (this.confirmPassword !== this.password) {
      return this.message = "Passwords do not match...";
    }

    this.authService.register$(this.username, this.password)
      .pipe(
          tap(() => this.message = "Successfully created. Click Login."),
          catchError((e) => {
              const defaultErrorMessage = "Error creating user.";

              try {
                this.message = e.error.error || defaultErrorMessage;
              } catch(e) {
                this.message = defaultErrorMessage;
              }

              return of(e);
          })
      ).subscribe();
  }

  logout() {
    this.authService.logout();
  }
  
  onTextChange(args, key: string) {
    const textField = <TextField>args.object;

    // console.log("onTextChange");
    this[key] = textField.text;
  }

  invalid() {
    
    if (!this.username) {
      this.message = "Username cannot be blank.";
      
      return this.message;
    }

    if (!this.password) {
      this.message = "Password cannot be blank.";
      
      return this.message;
    }

    if (this.password.length < 6) {
      this.message = "Password must be at least 7 characters."
    }

    return;
  }

}

function parseLoginError(e) {
  if (e && e.error) {
    if (e.error.message) { return e.error.message; }

    return e.error;
  }

  return e;
}
