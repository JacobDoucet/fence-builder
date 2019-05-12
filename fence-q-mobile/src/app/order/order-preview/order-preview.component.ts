import { FenceOrderInterface } from "../../types/fence-order";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular";
import { OrderService } from "~/app/shared/order.service";
import { TouchGestureEventData } from "tns-core-modules/ui/gestures";
import { Vibrate } from "nativescript-vibrate";
import { Subscription, timer } from "rxjs";
import { tap } from "rxjs/internal/operators/tap";
import { decomposeInches } from "~/app/shared/util";

const COLUMNS = 20;

const vibrator: Vibrate = new Vibrate();

@Component({
  selector: "OrderPreview",
  templateUrl: "./order-preview.component.html",
  styleUrls: [ "./order-preview.component.css" ],
  moduleId: module.id
})
export class OrderPreviewComponent implements OnInit {

  @Input() lockTouchState = false;

  @Input() index: number = 0;
  @Input() order: FenceOrderInterface;
  @Output() select = new EventEmitter<void>();

  delaySub: Subscription;

  backgroundColor = "white";
  borderColor = "#eaeaea";
  borderRadius = 0;
  borderWidth = 1;

  marginTop = 0;
  marginBottom = 0;
  marginLeft = 0;
  marginRight = 0;

  paddingTop = 15;
  paddingBottom = 15;
  paddingLeft = 15;
  paddingRight = 15;

  readonly columns = new Array(COLUMNS).fill("*").join(", ");

  get id() { return this.order.id || "null"; }

  get fence() { return this.order.fence || {
    name: "No Fence Selected...",
    price: 0
  }; }
  get fenceName() { return this.fence.name; }

  get description() {
    // TODO
    return "A short description about the fence type, installation, etc...";
  }

  get quantity() {
    const inches = this.order.quantity || 0;
    const decomposed = decomposeInches(inches);

    return `${decomposed.ft} ft ${decomposed.inch} inches`;
  }
  get price() { return this.fence.price * this.order.quantity; }
  get priceLabel() { return `$${Math.floor(this.price / 100)}.${this.price % 100 < 10 ? "0" : ""}${this.price % 100}`; }

  get status() {
    if (this.order.status === "none") {
      return "Not sent...";
    }
    
    return this.order.status;
  }

  set touching(touching: boolean) {
    if (!this.lockTouchState) {
      // this.backgroundColor = touching ? "white" : "white";
      // this.borderRadius = touching ? 10 : 5;
      // this.borderWidth = touching ? 10 : 5;
      // this.marginLeft = touching ? 10 : 20;
      // this.marginRight = touching ? 10 : 20;
      // this.paddingLeft = touching ? 20 : 10;
      // this.paddingRight = touching ? 20 : 10;
      // this.padding = touching ? 15 : 10;
    }
  }

  get imageUrl() {
      if (!this.order.fence || !this.order.fence.image_url) {
        // Set default image
      }
      return this.order.fence.image_url;
  }

  constructor(
    private router: RouterExtensions,
    private route: ActivatedRoute,
    private orderService: OrderService) {
    // constructor
  }

  col(num: number) {
    return Math.round(COLUMNS * num);
  }

  ngOnInit() {
    // ngOnInit
    this.touching = false;
  }

  onSwipe(event) {
    if (event.direction === 2) {
      this.router.navigate([`../order/${this.index}`], {
        relativeTo: this.route,
        queryParams: {
          last: this.index
        },
        transition: {
          name: "slideLeft"
        }
      });
      this.orderService.selectOrder(this.order);
    }
  }

  onTap() {
    // console.log('Emitting select');
    this.touching = true;
    this.select.emit();
  }

  onTouch(event: TouchGestureEventData) {
    // vibrator.vibrate(1);

    if (event.action === "up") {
      return this.touching = false;
    } else if (event.action === "move") {
      return this.touching = false;
    }

    this.delayThenRemoveTouching();
    this.touching = true;
  }

  delayThenRemoveTouching() {
    if (this.delaySub) {
      this.delaySub.unsubscribe();
    }
    this.delaySub = timer(500).pipe(
        tap(() => this.touching = false)
    ).subscribe();
  }

}
