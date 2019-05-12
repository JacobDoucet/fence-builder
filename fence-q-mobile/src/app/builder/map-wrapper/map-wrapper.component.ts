import { Component, OnInit, Input } from "@angular/core";
import { registerElement } from "nativescript-angular/element-registry";
import { MapView } from "nativescript-google-maps-sdk";
import { MapType } from "~/app/shared/builder.service";

// Important - must register MapView plugin in order to use in Angular templates
registerElement("MapView", () => MapView);

@Component({
  selector: "MapWrapper",
  templateUrl: "./map-wrapper.component.html",
  styleUrls: ["./map-wrapper.component.css"],
  moduleId: module.id
})
export class MapWrapperComponent implements OnInit {

  mapView: MapView = null;

  @Input() col = 0;
  @Input() row = 0;

  @Input() latitude = 0;
  @Input() longitude = 0;
  mapAnimationsEnabled = false;
  zoom = 17;
  minZoom = 17;
  maxZoom = 19;
  bearing = 0;
  tilt = 0;

  markers = [];

  constructor() {
    // Constructor
  }

  ngOnInit() {
    // OnInit
  }

  /*
  mapReady="onMapReady"
  markerSelect="onMarkerSelect"
  markerBeginDragging="onMarkerBeginDragging"
  markerEndDragging="onMarkerEndDragging"
  markerDrag="onMarkerDrag"
  cameraChanged="onCameraChanged"
  cameraMove="onCameraMove"
   */

  onMapReady(event) {
    // onMapReady
  }

  onMarkerSelect(event) {
    // console.log("MapWrapperComponent.onMarkerSelect >");
  }

  onMarkerBeginDragging(event) {
    // console.log("MapWrapperComponent.onMarkerBeginDragging >");
  }

  onMarkerEndDragging(event) {
      // console.log("MapWrapperComponent.onMarkerEndDragging >");
  }

  onMarkerDrag(event) {
      // console.log("MapWrapperComponent.onMarkerDrag >");
  }

  onCameraChanged(event) {
      // console.log("MapWrapperComponent.onCameraChanged >");
  }

  onCameraMove(event) {
      // console.log("MapWrapperComponent.onCameraMove >");
  }

  onCoordinateTapped(event) {
    // console.log("MapWrapperComponent.onCoordinateTapped >");
  }

  // Setters

  setMapType(mapType: MapType) {
    // console.log("MapWrapperComponent.setMapType >", mapType);
  }

}
