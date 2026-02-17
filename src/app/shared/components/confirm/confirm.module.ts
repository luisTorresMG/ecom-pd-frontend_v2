import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from './confirm.component';
import { ConfirmService } from './confirm.service';

@NgModule({
  imports: [
    CommonModule,
    NgbModule
  ],
  declarations: [
    ConfirmComponent
  ],
  providers: [
    ConfirmService
  ],
  entryComponents: [
    ConfirmComponent
  ],
  exports: [
    ConfirmComponent
  ]
})
export class ConfirmModule { }
