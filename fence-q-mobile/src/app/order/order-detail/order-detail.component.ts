import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { FenceOrderInterface } from "~/app/types/fence-order";
import { OrderPreviewComponent } from "~/app/order/order-preview/order-preview.component";

@Component({
  selector: "OrderDetail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.css"],
  moduleId: module.id
})
export class OrderDetailComponent implements OnInit {

  @Input() order: FenceOrderInterface;
  @Output() placeOrder: EventEmitter<FenceOrderInterface> = new EventEmitter();
  @Output() deselect: EventEmitter<void> = new EventEmitter();

  @ViewChild(OrderPreviewComponent) set orderPreviewComponent(component: OrderPreviewComponent) {
    if (component) {
      component.touching = true;
      component.lockTouchState = true;
    }
  }

  constructor() {
    // constructor
  }

  ngOnInit() {
    // ngOnInit
  }

  onDeselect() {
    this.deselect.emit();
  }

  onPlaceOrder() {
    this.placeOrder.emit();
  }

}
