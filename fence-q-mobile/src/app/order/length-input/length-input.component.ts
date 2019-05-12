import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { decomposeInches, reduceToInches } from "~/app/shared/util";
import { TextField } from "tns-core-modules/ui/text-field";

@Component({
  selector: "LengthInput",
  templateUrl: "./length-input.component.html",
  styleUrls: [ "./length-input.component.css" ],
  moduleId: module.id
})
export class LengthInputComponent implements OnInit {

  @Input() set length(length: number) {
    const { ft, inch } = decomposeInches(length);
    this.feet = ft;
    this.inches = inch;
  }
  @Output() lengthChange: EventEmitter<number> = new EventEmitter();

  feet: number;
  inches: number;

  constructor() {
    // Constructor
  }

  ngOnInit() {
    // ngOnInit
  }

  setFtInches(data: { ft: number, inch: number }) {
    const inches = reduceToInches(data);
    if (inches >= 0 ) {
      const decomposed = decomposeInches(inches);
      this.feet = decomposed.ft;
      this.inches = decomposed.inch;

      this.lengthChange.emit(inches);
    }
  }

  changeDistance(args, field: "feet" | "inches") {
    const textField = <TextField>args.object;

    const value = Math.round(Number(textField.text));
    let ft = this.feet;
    let inch = this.inches;

    if (field === "feet") {
      ft = value;
    } else {
      inch = value;
      if (inch > 12 && inch % 10 === 0) {
        inch = inch / 10;
      }
    }

    this.setFtInches({ ft, inch });

  }

  increment(delta: number, field: "feet" | "inches") {
    let ft = this.feet;
    let inch = this.inches;

    if (field === "feet") {
      ft += delta;
    } else if (field === "inches") {
      inch += delta;
    }

    this.setFtInches({ ft, inch });
  }

}
