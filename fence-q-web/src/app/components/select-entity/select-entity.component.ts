import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-select-entity',
  templateUrl: './select-entity.component.html',
  styleUrls: ['./select-entity.component.scss']
})
export class SelectEntityComponent implements OnInit {

  @Input() endpoint: string;
  @Input() selected: any;
  @Output() selectedChange: EventEmitter<any> = new EventEmitter();

  get store$ () { return this.storeService.getStore(this.endpoint); }

  @Input() labelFormatter: (entity: any) => string = entity =>
    `${entity.name || entity.title || entity.label || entity.id}`

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    console.log(this.endpoint);
  }

}
