import { AuthService } from "./shared/auth.service";
import { Component, OnInit } from "@angular/core";
import { getIconSource } from "~/app/shared/icon.source";

import { android as androidApp } from 'tns-core-modules/application';
import { device } from 'tns-core-modules/platform';
import { interval } from "rxjs";
import { startWith, tap } from "rxjs/operators";
declare var android: any;

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

    customerTabIcon = getIconSource("userprofile");
    customerMapperIcon = getIconSource("border");
    customerQuotesIcon = getIconSource("receipt");

    get isLoggedIn() { return !!this.authService.token; }

    get customerTabTitle() { return this.isLoggedIn ? this.authService.username : "Login"; }

    constructor(
        private authService: AuthService) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
        // this.page.actionBarHidden = true;
        interval(5000).pipe(
            startWith(0),
            tap(() => this.goFullscreen())
        ).subscribe();
    }

    getIconSource(icon: string): string {
        return getIconSource(icon);
    }

    onTap() {
        this.goFullscreen();
    }

    private goFullscreen() {
        if (androidApp && device.sdkVersion >= '21') {
            const View = android.view.View;
            const window = androidApp.startActivity.getWindow();
            const decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    private hideFullscreen() {
        if (androidApp && device.sdkVersion >= '21') {
            const View = android.view.View;
            const window = androidApp.startActivity.getWindow();
            const decorView = window.getDecorView();
            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

}
