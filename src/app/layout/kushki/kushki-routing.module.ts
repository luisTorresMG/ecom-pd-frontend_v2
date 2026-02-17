import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KushkiPaymentSummaryComponent } from './components/kushki-payment-summary/kushki-payment-summary.component';

const routes: Routes = [
  {
    path: '',
    component: KushkiPaymentSummaryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KushkiRoutingModule {}
