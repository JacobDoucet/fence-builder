import { Component, OnInit, Input } from "@angular/core";
import { BuilderService } from "~/app/shared/builder.service";
import { BehaviorSubject, Observable } from "rxjs";
import { getIconSource } from "~/app/shared/icon.source";

@Component({
  selector: "ControlPanel",
  templateUrl: "./control-panel.component.html",
  styleUrls: ["./control-panel.component.css"],
  moduleId: module.id
})
export class ControlPanelComponent implements OnInit {

  searchActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  nodeActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  gateActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  markerActive$: Observable<boolean>;
  distanceLabel$: Observable<string>;
  distance$: Observable<number>;
  loading$: Observable<boolean>;

  @Input() row = 0;
  @Input() col = 0;

  get selectType(): "NODE" | "GATE" {
    return this.builderService.selectType;
  }

  get selectedMarker() {
    return this.builderService.selectedMarker;
  }

  constructor(private builderService: BuilderService) {
  }

  ngOnInit() {
  }

  toggleNode() {
    // console.log("ControlPanelComponent.toggleNode");
    this.gateActive$.next(false);
    this.nodeActive$.next(!this.nodeActive$.value);
  }

  toggleGate() {
    // console.log("ControlPanelComponent.toggleGate");
    this.nodeActive$.next(false);
    this.gateActive$.next(!this.gateActive$.value);
  }

  newNode() {
    const nodeActive = this.nodeActive$.value;
    const gateActive = this.gateActive$.value;

    this.nodeActive$.next(true);
    this.gateActive$.next(false);

    this.getCurrentLocation();

    setTimeout(() => {
      this.gateActive$.next(gateActive);
      this.nodeActive$.next(nodeActive);
    }, 1);

  }

  newGate() {
    const nodeActive = this.nodeActive$.value;
    const gateActive = this.gateActive$.value;

    this.gateActive$.next(true);
    this.nodeActive$.next(false);

    this.getCurrentLocation();

    setTimeout(() => {
      this.gateActive$.next(gateActive);
      this.nodeActive$.next(nodeActive);
    }, 1);
  }

  reset() {
    // console.log("ControlPanelComponent.reset");
  }

  getIconSource(icon: string): string {
    return getIconSource(icon);
  }

  toggleMapType() {
    // console.log("ControlPanelComponent.toggleMapType");
  }

  toggleSearch() {
    this.searchActive$.next(!this.searchActive$.value);
  }

  getCurrentLocation() {
    // console.log("ControlPanelComponent.getCurrentLocation");
  }

  clickDelete() {
    // console.log("ControlPanelComponent.clickDelete");
  }

  clickReset() {
    // console.log("ControlPanelComponent.clickReset");
  }

  moveMarker(offset: number) {
    // console.log("ControlPanelComponent.moveMarker");
  }

}
