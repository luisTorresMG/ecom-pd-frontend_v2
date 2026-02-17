import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PaymentVisaSuccessComponent } from './payment-visa-success/payment-visa-success.component';
import { PaymentPagoefectivoSuccessComponent } from './payment-pagoefectivo-success/payment-pagoefectivo-success.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'payment/:idProcess',
        component: CheckoutComponent,
      },
      {
        path: 'payment/visa/:id',
        component: PaymentVisaSuccessComponent,
      },
      {
        path: 'payment/resumen/pago-efectivo',
        component: PaymentPagoefectivoSuccessComponent,
      },
      {
        path: '**',
        redirectTo: 'payment/:idProcess',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VidaGrupoRoutingModule {}
