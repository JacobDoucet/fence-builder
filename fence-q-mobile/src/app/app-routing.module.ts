import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NSEmptyOutletComponent } from "nativescript-angular";
import { NativeScriptRouterModule } from "nativescript-angular/router";

const routes: Routes = [
    {
        path: "",
        redirectTo: "/(" +
            "builderTab:builder/default" +
            "//customerTab:customer/default" +
            "//orderTab:order/default" +
            ")",
        pathMatch: "full"
    },
    {
        path: "builder",
        component: NSEmptyOutletComponent,
        loadChildren: "~/app/builder/builder.module#BuilderModule",
        outlet: "builderTab"
    },
    {
        path: "customer",
        component: NSEmptyOutletComponent,
        loadChildren: "~/app/customer/customer.module#CustomerModule",
        outlet: "customerTab"
    },
    {
        path: "order",
        component: NSEmptyOutletComponent,
        loadChildren: "~/app/order/order.module#OrderModule",
        outlet: "orderTab"
    }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }