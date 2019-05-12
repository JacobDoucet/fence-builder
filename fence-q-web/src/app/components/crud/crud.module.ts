import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudComponent } from './crud.component';
import { InputComponent } from './input/input.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CrudComponent,
    InputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    CrudComponent
  ]
})
export class CrudModule { }
