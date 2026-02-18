import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionsComponent } from './questions.component';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
@NgModule({
  declarations: [QuestionsComponent],
  imports: [
    CommonModule,
    ModalModule
  ],
  providers: [
    BsModalService
  ],
  exports: [QuestionsComponent]
})
export class QuestionsModule { }
