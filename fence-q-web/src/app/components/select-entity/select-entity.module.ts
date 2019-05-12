import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectEntityComponent } from './select-entity.component';

@NgModule({
  declarations: [SelectEntityComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [SelectEntityComponent]
})
export class SelectEntityModule { }
