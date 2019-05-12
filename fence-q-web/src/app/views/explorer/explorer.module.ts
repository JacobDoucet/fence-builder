import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorerComponent } from './explorer.component';
import { CrudModule } from '../../components/crud/crud.module';

@NgModule({
  declarations: [ExplorerComponent],
  imports: [
    CommonModule,
    CrudModule
  ],
  exports: [ExplorerComponent]
})
export class ExplorerModule { }
