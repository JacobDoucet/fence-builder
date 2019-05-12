import { Component, OnInit, Input } from '@angular/core';
import { ForeignKey } from '../crud.component';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input() entity: any;
  @Input() key: any;
  @Input() disabled: boolean;
  @Input() foreignKeys: ForeignKey[] = [];

  get label() { return this.key.replace(/_id$/, '').split('_').join(' '); }
  get foreignKey() { return this.foreignKeys.find(fk => fk.key === this.key); }

  constructor() { }

  ngOnInit() {
    console.log(this.key);
  }

}
