import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SandboxComponent } from './sandbox/sandbox.component';

@NgModule({
  declarations: [SandboxComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [SandboxComponent]
})
export class SandboxModule { }
