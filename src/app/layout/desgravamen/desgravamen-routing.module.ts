import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BandejaComponent } from './components/bandeja/bandeja.component';
import { EndorseeComponent } from './components/endorsee/endorsee.component';
import { QuoteComponent } from './components/quote/quote.component';
import { RequestPolicyComponent } from './components/request-policy/request-policy.component';
import { RequestQuoteComponent } from './components/request-quote/request-quote.component';

//#region COMPONENTS
import { MainComponent } from './components/main/main.component';

import { Step1Component } from './components/steps/step1/step1.component';
import { Step2Component } from './components/steps/step2/step2.component';
import { Step3Component } from './components/steps/step3/main/step3.component';
import { PlanDetailComponent } from './components/steps/step3/plan-detail/plan-detail.component';
import { Step4Component } from './components/steps/step4/step4.component';
import { Step5Component } from './components/steps/step5/step5.component';

import { PagoEfectivoComponent } from './components/payments/pago-efectivo/pago-efectivo.component';
import { VisaComponent } from './components/payments/visa/visa.component';

import { VcfReserveReportComponent } from './components/reports/vcf-reserve-report/vcf-reserve-report.component';

//#endregion

//#region AUTHS
// *GUARD
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
        path: '', component: MainComponent, children: [
            {
                path: 'step1',
                component: Step1Component
            },
            {
                path: 'step2',
                component: Step2Component,
                canActivate: [AuthGuard],
                data: {
                    nstep: 2
                }
            },
            {
                path: 'step3',
                component: Step3Component,
                canActivate: [AuthGuard],
                data: {
                    nstep: 3
                }
            },
            {
                path: 'step3/plan-detail',
                component: PlanDetailComponent,
                canActivate: [AuthGuard],
                data: {
                    nstep: 3
                }
            },
            {
                path: 'step4',
                component: Step4Component,
                canActivate: [AuthGuard],
                data: {
                    nstep: 4
                }
            },
            {
                path: 'step5',
                component: Step5Component,
                canActivate: [AuthGuard],
                data: {
                    nstep: 5
                }
            },
            {
                path: 'payment/pago-efectivo',
                component: PagoEfectivoComponent,
                canActivate: [AuthGuard],
                data: {
                    nstep: 5
                }
            },
            {
                path: 'payment/visa/:token',
                component: VisaComponent,
                canActivate: [AuthGuard],
                data: {
                    nstep: 5
                }
            },
            {
    path: 'cotizador',
    component: QuoteComponent
      },
      {
    path: 'consulta-cotizacion',
    component: RequestQuoteComponent
      },
      {
    path: 'bandeja',
    component: BandejaComponent
      },
      {
    path: 'consulta-poliza',
    component: RequestPolicyComponent
      },
      {
    path: 'evaluacion-cotizacion/:numeroCotizacion/:mode',
    component: QuoteComponent,
        data: {
      esEvaluacion: true
        }
      },
      {
    path: 'mantenimiento-endosatario',
    component: EndorseeComponent
      },
      { path: 'reporte-reserve', component: VcfReserveReportComponent }, // Reporte Reservas y Reaseguro VCF
      {
       path: 'evaluacion-poliza/:numeroCotizacion/:mode',
      component: QuoteComponent,
        data: {
        esEvaluacion: true
    }
            },
            {
                path: '**', redirectTo: 'step1', pathMatch: 'full'
            },

        ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DesgravamenRoutingModule { }
