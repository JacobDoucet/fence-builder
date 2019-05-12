import { LoginModule } from './../../components/login/login.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page.component';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [
    CommonModule,
    LoginModule
  ],
  exports: [LandingPageComponent]
})
export class LandingPageModule { }
