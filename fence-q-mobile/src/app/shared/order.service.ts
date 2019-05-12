import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { FenceOrderInterface } from "../types/fence-order";
import { skip, take, tap, map, filter, delayWhen } from "rxjs/operators";
import { DataService } from "./data.service";
import { FenceInterface } from "../types/fence";
import { BuilderService } from "./builder.service";
import { ApiUserInterface } from "../types/api-user";
import { AuthService } from "./auth.service";
import { CustomerInterface } from "~/app/types/customer";

@Injectable({
  providedIn: "root"
})
export class OrderService {

  selectedOrder$: Observable<FenceOrderInterface>;
  orders$: Observable<Array<FenceOrderInterface>>;
  distance$: Observable<number>;

  private selectedOrder: BehaviorSubject<FenceOrderInterface> = new BehaviorSubject(null);
  private orders: BehaviorSubject<Array<FenceOrderInterface>> = new BehaviorSubject([]);
  private distance: BehaviorSubject<number> = new BehaviorSubject(0);
  private customer: BehaviorSubject<CustomerInterface> = new BehaviorSubject(null);

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private builderService: BuilderService) {

    this.selectedOrder$ = this.selectedOrder.asObservable().pipe(skip(1));
    this.orders$ = this.orders.asObservable();
    this.distance$ = this.distance.asObservable();
    
    // this.orders$.subscribe((o) => console.log(`this.orders$ emitted ${o.length} orders`));

    this.dataService.fences$
      .pipe(
        // tap(() => console.log(" -- Fences Emitted")),
        // tap((f) => console.log(f)),
        filter((fences) => fences.length > 0),
        map((fences: Array<FenceInterface>) => fences.map((f) => newOrderFromFence(f, this.authService.username))),
        // tap(() => console.log(" -- Transformed to Orders")),
        // tap((o) => console.log(o)),
        tap((orders: Array<FenceOrderInterface>) => this.orders.next(orders)),
        delayWhen(() => this.updateDistance())
      ).subscribe();

    this.orders$.pipe(
      delayWhen((orders) => this.dataService.customer$.pipe(
          tap((customers) => assignCustomerToOrderList(customers[0] || null, orders))
      ))
    ).subscribe((orders) => console.log(orders));

    this.updateDistance().subscribe();
  }

  updateDistance() {
    return this.builderService.distance$.pipe(
      tap((distance) => this.distance.next(distance)),
      // tap((distance) => console.log(`Distance emitted = ${distance}`)),
      delayWhen((distance) => this.orders$.pipe(
        take(1),
        tap((orders) => orders.forEach((order) => {
          // console.log(`Setting order.quantity = ${distance}`);
          order.quantity = distance;
        }))
      )),
      map(() => this.builderService.getBlueprints()),
      delayWhen((blueprints) => this.orders$.pipe(
        take(1),
        tap((orders) => orders.forEach((order) => {
          order.fenceBlueprints = blueprints;
        }))
      ))
      // tap(() => console.log("updateDistance COMPLETE"))
    );
  }

  changeDistance(distance: number) {
    this.orders$.pipe(
        take(1),
        tap(() => this.distance.next(distance)),
        tap((orders) => orders.forEach((order) => {
          // console.log(`Setting order.quantity = ${distance}`);
          order.quantity = distance;
          order.fenceBlueprints = [];
        }))
    ).subscribe();
  }

  selectOrder(order: FenceOrderInterface) {
    this.selectedOrder.next(order);
  }

  deleteOrder(order: FenceOrderInterface) {
    this.dataService.deleteOrder$(order).pipe(
      // tap(() => console.log("Removed order", order.id))
    ).subscribe();
  }

  placeOrder$(order: FenceOrderInterface) {
    if (!order.id) { delete order.id; }
    order.quantity = Math.round(order.quantity);
    order.fenceBlueprints = this.builderService.getBlueprints();
    
    return this.dataService.saveOrder$(order)
      .pipe(
        // tap(() => console.log("placeOrder$ complete"))
      );
  }

  updateCustomer(customer: CustomerInterface) {
    this.orders$.pipe(
        take(1),
        tap((orders) => assignCustomerToOrderList(customer, orders))
    ).subscribe();
  }

}

function assignCustomerToOrderList(customer: CustomerInterface, orders: Array<FenceOrderInterface>) {
   orders.forEach((order) => order.customer = customer);
}

function newOrderFromFence(fence: FenceInterface, username: string): FenceOrderInterface {

  const user: ApiUserInterface = {
    id: null,
    username,
    password: null
  };

  return {
    id: null,
    user,
    customer: null,
    fence,
    created: null,
    updated: null,
    quantity: 0,
    fenceBlueprints: []
  };
}
