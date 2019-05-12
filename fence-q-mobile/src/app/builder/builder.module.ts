import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { BuilderRoutingModule } from "./builder-routing.module";
import { BuilderComponent } from "./builder.component";
import { MapWrapperComponent } from "./map-wrapper/map-wrapper.component";
import { ControlPanelComponent } from "./control-panel/control-panel.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        BuilderRoutingModule
    ],
    declarations: [
        BuilderComponent,
        MapWrapperComponent,
        ControlPanelComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class BuilderModule { }
