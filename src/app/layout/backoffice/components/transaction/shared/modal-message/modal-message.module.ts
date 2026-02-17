import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalMessageComponent } from './modal-message.component';
import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
  declarations: [ModalMessageComponent],
  imports: [
    CommonModule,
    ModalModule,
    ModalModule.forRoot()
  ],
  exports: [ModalMessageComponent]
})
export class ModalMessageModule { }
