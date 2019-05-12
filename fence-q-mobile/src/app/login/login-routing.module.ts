import { NativeScriptRouterModule } from "nativescript-angular/router";
import { LoginComponent } from "./login.component";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { Routes } from "@angular/router";

const routes: Routes = [
  { path: "default", component: LoginComponent }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class LoginRoutingModule { }
