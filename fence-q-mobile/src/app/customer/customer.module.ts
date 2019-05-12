import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { CustomerRoutingModule } from "./customer-routing.module";
import { CustomerComponent } from "./customer.component";
import { LoginModule } from "../login/login.module";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        CustomerRoutingModule,
        LoginModule
    ],
    declarations: [
        CustomerComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CustomerModule { }
