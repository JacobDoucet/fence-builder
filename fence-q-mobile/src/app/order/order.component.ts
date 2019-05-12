import { FenceOrderInterface } from "./../types/fence-order";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular";
import { OrderService } from "../shared/order.service";
import { validateOrder, ValidationResult } from "~/app/shared/order.validation";

const DEFAULT_TITLE = "Quotes";
const INQUIRY_TITLE = "Submit Inquiry";

export enum PageStatus {
    BROWSE = "BROWSE",
    SELECTED = "SELECTED",
    SUBMITTED = "SUBMITTED",
    INVALID = "INVALID"
}

@Component({
    selector: "Order",
    moduleId: module.id,
    templateUrl: "./order.component.html"
})
export class OrderComponent implements OnInit, OnDestroy {

    BROWSE = PageStatus.BROWSE;
    SELECTED = PageStatus.SELECTED;
    SUBMITTED = PageStatus.SUBMITTED;
    INVALID = PageStatus.INVALID;
    PageStatus: PageStatus = PageStatus.BROWSE;

    title = DEFAULT_TITLE;

    lastOrderId: string = null;
    orders: Array<FenceOrderInterface> = [];
    orderLabels: Array<string> = [];
    selectedOrder: FenceOrderInterface = null;
    submittedOrder: FenceOrderInterface = null;

    distance$: Observable<number> = this.orderService.distance$;

    validationResult: ValidationResult;

    private destroy = new Subject();

    constructor(
        private route: ActivatedRoute,
        private router: RouterExtensions,
        private orderService: OrderService) {
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        // console.log("OrderComponent.ngOnInit");
        this.orderService.orders$.pipe(
            // tap((f) => console.log(f)),
            // tap((o) => console.log(`OrderComponent received ${o.length} orders`)),
            tap((orders) => this.orders = orders),
            tap(() => this.orderLabels = this.orders.map(orderToLabel))
            // tap((orders) => console.log(`>> orders emitted ${orders.length} entities`))
        ).subscribe();

        this.route.queryParams
            .pipe(
                tap((query) => {
                    this.lastOrderId = query.last || null;
                })
            ).subscribe();
    }

    ngOnDestroy() {
        // console.log("DESTROY");
        this.destroy.next();
        this.destroy.complete();
    }

    selectOrder(order: FenceOrderInterface) {
        this.title = order ? INQUIRY_TITLE : DEFAULT_TITLE;
        this.selectedOrder = order;
        if (this.selectedOrder) {
            const chop = this.orders.splice(this.orders.indexOf(this.selectedOrder), this.orders.length);
            this.orders = chop.concat(this.orders);
            this.PageStatus = PageStatus.SELECTED;
        } else {
            this.PageStatus = PageStatus.BROWSE;
        }
    }

    onSwipe(event) {
      if (event.direction === 1) { this.onSwipeRight(); }
      if (event.direction === 2) { this.onSwipeLeft(); }
    }

    onSwipeLeft() {
        // console.log(`Navigate to ${this.lastOrderId}`);
        if (this.lastOrderId) {
            this.router.navigate([`../order/${this.lastOrderId}`], { relativeTo: this.route });
        }
    }

    onSwipeRight() {
        // on swipe right
    }

    placeOrder(order: FenceOrderInterface) {
        // console.log("Place order");
        // console.log(order);
        const orderValidation = validateOrder(order);
        if (orderValidation.valid) {
            order.customer.user = order.user;
            return this.orderService
                .placeOrder$(order)
                .pipe(
                    map((response: { data: FenceOrderInterface }) => response.data),
                    tap((submittedOrder) => this.submittedOrder = submittedOrder),
                    tap(() => this.PageStatus = PageStatus.SUBMITTED)
                ).subscribe();
        }

        this.validationResult = orderValidation;
        this.PageStatus = PageStatus.INVALID;
    }

    changeDistance(distance: number) {
        this.orderService.changeDistance(distance);
    }
}

function orderToLabel(order: FenceOrderInterface): string {
    return JSON.stringify(order);
}
