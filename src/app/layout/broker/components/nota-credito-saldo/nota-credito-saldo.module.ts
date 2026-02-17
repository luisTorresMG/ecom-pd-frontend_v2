import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotaCreditoSaldoComponent} from './nota-credito-saldo.component';
import { BackOfficeModule } from '../../../backoffice/backoffice.module';

@NgModule({
  declarations: [NotaCreditoSaldoComponent],
  imports: [
    CommonModule,
    BackOfficeModule
  ],
  exports:[
    NotaCreditoSaldoComponent
  ],
})
export class NotaCreditoSaldoModule { }