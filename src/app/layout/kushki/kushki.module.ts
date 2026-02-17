import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { KushkiRoutingModule } from './kushki-routing.module';

import { KushkiPaymentSummaryComponent } from './components/kushki-payment-summary/kushki-payment-summary.component';
import { KushkiFormModule } from '@shared/modules/kushki-form.module';
@NgModule({
  declarations: [KushkiPaymentSummaryComponent],
  imports: [
    CommonModule,
    KushkiRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    KushkiFormModule,
  ],
})
export class KushkiModule {}
