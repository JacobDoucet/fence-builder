import { AppConstants } from "~/app/constants";
import { DataService } from "./../shared/data.service";
import { AuthService } from "./../shared/auth.service";
import { ApiUserInterface } from "./../types/api-user";
import { CustomerInterface } from "./../types/customer";
import { Component, OnInit } from "@angular/core";
import { TextField } from "tns-core-modules/ui/text-field";
import { tap, filter, map, debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";
import { OrderService } from "~/app/shared/order.service";
import { catchError } from "rxjs/internal/operators/catchError";
import { of } from "rxjs/internal/observable/of";

@Component({
    selector: "Customer",
    moduleId: module.id,
    templateUrl: "./customer.component.html"
})
export class CustomerComponent implements OnInit, CustomerInterface {

    get isLoggedIn() { return !!this.authService.token; }
    get userLabel() { return `Logged in as ${this.authService.username}`; }

    dirty = false;

    readonly keys = AppConstants.CustomerKeys;

    id = null;
    user: ApiUserInterface = null;
    first_name = "";
    last_name = "";
    address_line_1 = "";
    address_line_2 = "";
    city = "";
    state = "";
    zip = "";
    phone = "";
    email = "";

    saveDataMessage = "Your info won't be sent to us until you send an inquiry.";

    private save$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private dataService: DataService,
        private orderService: OrderService) {
        // Use the component constructor to inject providers.
        this.authService.authEvent$
            .pipe(
                // tap((token) => console.log(token)),
                map((token) => !!token),
                tap(() => this.clear()),
                filter((auth) => auth)
            )
            .subscribe();
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        setTimeout(() => this.dirty = false);
        this.dataService.customer$.pipe(
            tap((customers) => console.log(`>> customers$ emitted ${customers.length} entities`)),
            filter((customers) => customers.length > 0),
            tap((customers) => Object.keys(customers[0]).forEach((key) => {
                if (key !== "user") {
                    this[key] = customers[0][key];
                }
                // console.log(` ===> this.${key} = ${this[key]}`);
            })),
            tap((customers) => this.orderService.updateCustomer(customers[0]))
        ).subscribe();

        this.save$.pipe(
            debounceTime(1000),
            tap(() => this.save())
        ).subscribe();

        // LocalDataService.deleteAll$("Customer").subscribe(() => console.log(":: deleteAll$ complete"));
    }

    clear() {
        this.keys.forEach((key) => this[key] = "");
    }

    logout() {
        this.dataService.deletePersonalData$().pipe(tap(() => {
            this.authService.logout();
        })).subscribe();
    }

    generateCustomer(): CustomerInterface {
        return {
            id: this.id || undefined,
            user: this.user,
            first_name: this.first_name,
            last_name: this.last_name,
            address_line_1: this.address_line_1,
            address_line_2: this.address_line_2,
            city: this.city,
            state: this.state,
            zip: this.zip,
            phone: this.phone,
            email: this.email
        };
    }

    save() {
        // this.dataService.saveLocal$(this, "Customer")
        //     .pipe(tap(() => this.dataService.fetchCustomers()))
        //     .subscribe();
        // this.dataService.store
        const customer: CustomerInterface = this.generateCustomer()
        this.dataService.saveLocal$<CustomerInterface>("Customer", customer, true).pipe(
            catchError((e) => {
                return of(e);
            }),
            tap(() => this.orderService.updateCustomer(customer))
        ).subscribe();
    }

    onTextChange(args, key: string) {
        const textField = <TextField>args.object;

        this[key] = textField.text;
        this.dirty = true;
        this.save$.next();
    }

    onReturn(args, key: string) {
        const textField = <TextField>args.object;

        // console.log("onReturn");
        this[key] = textField.text;
    }
}

function userKey(username): (key: string) => string {
    return (key) => `${username}.${key}`;
}
