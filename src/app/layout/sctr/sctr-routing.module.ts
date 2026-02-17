import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../soat/shared/services/auth.guard';
import { Step1Component } from './components/steps/step1/step1.component';
import { Step2Component } from './components/steps/step2/step2.component';
import { Step3Component } from './components/steps/step3/step3.component';
import { Step4Component } from './components/steps/step4/step4.component';
import { Step5Component } from './components/steps/step5/step5.component';
import { VisaPaymentComponent } from './components/steps/visa-payment/visa-payment.component';
import { PagoEfectivoPaymentComponent } from './components/steps/pago-efectivo-payment/pago-efectivo-payment.component';
import { RouteValidationGuard } from './shared/services/route-validation.guard';
import { SctrComponent } from './components/sctr/sctr.component';

const routes: Routes = [
  {
    path: '',
    component: SctrComponent,
    children: [
      {
        path: 'step-1',
        component: Step1Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'step-2',
        component: Step2Component,
        canActivate: [RouteValidationGuard],
      },
      {
        path: 'step-3',
        component: Step3Component,
        canActivate: [RouteValidationGuard],
      },
      {
        path: 'step-4',
        component: Step4Component,
        canActivate: [RouteValidationGuard],
      },
      {
        path: 'step-5',
        component: Step5Component,
        canActivate: [RouteValidationGuard],
      },
      {
        path: 'payment/visa/:id',
        component: VisaPaymentComponent,
        canActivate: [RouteValidationGuard],
      },
      {
        path: 'payment/pago-efectivo',
        component: PagoEfectivoPaymentComponent,
        canActivate: [RouteValidationGuard],
      },
      { path: '**', redirectTo: 'step-1' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SctrRoutingModule {}
