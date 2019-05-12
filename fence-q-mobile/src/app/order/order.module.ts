import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { OrderRoutingModule } from "./order-routing.module";
import { OrderComponent } from "./order.component";
import { OrderPreviewComponent } from "./order-preview/order-preview.component";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { OrderSubmittedComponent } from './order-submitted/order-submitted.component';
import { LengthInputComponent } from './length-input/length-input.component';
import { InvalidOrderComponent } from './invalid-order/invalid-order.component';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        OrderRoutingModule
    ],
    declarations: [
        OrderComponent,
        OrderPreviewComponent,
        OrderDetailComponent,
        OrderSubmittedComponent,
        LengthInputComponent,
        InvalidOrderComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class OrderModule { }
