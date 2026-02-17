import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// *COMPONENTS
//#region
import { VidaindividualLatestComponent } from './components/main/vidaindividual-latest.component';
import { Step1Component } from './components/step1/step1.component'; // STEP 1
import { Step2Component } from './components/step2/step2.component'; // STEP 2
import { Step3Component } from './components/step3/step3.component'; // STEP 3
import { Step4Component } from './components/step4/step4.component'; // STEP 4
import { VisaComponent } from './components/payment/visa/visa.component';
import { PagoEfectivoComponent } from './components/payment/pago-efectivo/pago-efectivo.component';
import { VisaTestComponent } from './components/tests/visa/visa-test.component';
import { AuthGuard } from './guards/auth.guard';
//#endregion
const routes: Routes = [
  {
    path: '',
    component: VidaindividualLatestComponent,
    children: [
      { path: 'step1', component: Step1Component },
      {
        path: 'step2',
        component: Step2Component,
        canActivate: [AuthGuard],
        data: {
          nstep: 2,
        },
      },
      {
        path: 'step3',
        component: Step3Component,
        canActivate: [AuthGuard],
        data: {
          nstep: 3,
        },
      },
      {
        path: 'step4',
        component: Step4Component,
        canActivate: [AuthGuard],
        data: {
          nstep: 4,
        },
      },
      {
        path: 'payment/visa/:id',
        component: VisaComponent,
      },
      {
        path: 'payment/pagoefectivo',
        component: PagoEfectivoComponent,
      },
      {
        path: 'test/visa',
        component: VisaTestComponent,
      },
      { path: '**', redirectTo: 'step1', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VidaindividualLatestRoutingModule { }
