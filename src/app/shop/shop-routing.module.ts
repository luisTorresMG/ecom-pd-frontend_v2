import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckOutComponent } from './check-out/check-out.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { PagoEfectivoPaymentComponent } from './pago-efectivo-payment/pago-efectivo-payment.component';
import { VisaPaymentComponent } from './visa-payment/visa-payment.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'checkout',
        component: CheckOutComponent,
      },
      {
        path: 'payment/pago-efectivo',
        component: PagoEfectivoPaymentComponent,
      },
      {
        path: 'payment/visa/:id',
        component: VisaPaymentComponent,
      },
      { path: '**', redirectTo: '' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
// export class EcommerceRoutingModule {}
export class ShopRoutingModule {}
