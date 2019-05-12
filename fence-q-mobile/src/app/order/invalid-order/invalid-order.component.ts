import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ValidationResult } from "~/app/shared/order.validation";

@Component({
  selector: "InvalidOrder",
  templateUrl: "./invalid-order.component.html",
  moduleId: module.id
})
export class InvalidOrderComponent implements OnInit {

  @Input() validationResult: ValidationResult;
  @Output() dismiss: EventEmitter<void> = new EventEmitter();

  constructor() {
    // Constructor
  }

  ngOnInit() {
    // NgOnInit
  }

}
