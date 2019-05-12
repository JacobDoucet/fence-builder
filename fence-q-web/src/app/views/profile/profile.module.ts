import { SelectEntityModule } from './../../components/select-entity/select-entity.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    SelectEntityModule
  ],
  exports: [ProfileComponent]
})
export class ProfileModule { }
