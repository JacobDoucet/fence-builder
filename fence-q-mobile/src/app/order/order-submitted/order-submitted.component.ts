import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FenceOrderInterface } from "~/app/types/fence-order";

@Component({
  selector: "OrderSubmitted",
  templateUrl: "./order-submitted.component.html",
  moduleId: module.id
})
export class OrderSubmittedComponent implements OnInit {

  @Input() submittedOrder: FenceOrderInterface;
  @Output() dismiss: EventEmitter<void> = new EventEmitter();

  constructor() {
    // Constructor
  }

  ngOnInit() {
    // ngOnInit
  // console.log(this.submittedOrder);
  }

}
