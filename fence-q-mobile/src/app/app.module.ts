import { HttpClientModule } from "@angular/common/http";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { isIOS } from "tns-core-modules/platform";
import { TNSFontIconModule } from "nativescript-ngx-fonticon";

declare var GMSServices: any;

if (isIOS) {
    GMSServices.provideAPIKey("IOS_API_KEY_HERE");
}

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        HttpClientModule,
        TNSFontIconModule.forRoot({
            'fa': './assets/font-awesome.css',
            'ion': './assets/ionicons.css'
        })
    ],
    declarations: [
        AppComponent
    ],
    providers: [],
    exports: [
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
