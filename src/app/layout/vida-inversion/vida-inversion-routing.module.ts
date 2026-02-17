import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProspectsComponent } from './views/prospects/prospects.component';
import { MainComponent } from './main/main.component';
import { NewProspectsComponent } from './views/new-prospects/new-prospects.component';
import { RequestQuoteComponent } from './views/request-quote/request-quote.component';
import { NewQuotationComponent } from './views/new-quotation/new-quotation.component';
import { QuotationDefinitiveComponent } from './views/quotation-definitive/quotation-definitive.component';
import { QuotationDataPepComponent } from './views/quotation-data-pep/quotation-data-pep.component';
import { QuotationDefinitiveConsultComponent } from './views/quotation-definitive-consult/quotation-definitive-consult.component';
import { ViewQuotationComponent } from './views/view-quotation/view-quotation.component';
import { PolicyComponent } from './views/policy/policy.component';
import { PolicyTransactionConsultComponent } from './views/policy-transaction-consult/policy-transaction-consult.component';
import { SubscriptionRequestComponent } from './views/subscription-request/subscription-request.component';
import { NewSubscriptionRequestComponent } from './views/new-subscription-request/new-subscription-request.component';
import { SubscriptionRequestConsultationComponent } from './views/subscription-request-consultation/subscription-request-consultation.component';
import { PolicySubscriptionComponent } from './views/policy-subscription/policy-subscription.component';
import { ReporteTecnicaComponent } from './views/reporte-tecnica/reporte-tecnica.component';
import { ReporteComercialComponent } from './views/reporte-comercial/reporte-comercial.component';
import { EeccReportComponent } from './views/eecc-report/eecc-report.component';
import { ReportesMonitoreoComponent } from './views/reportes-monitoreo/reportes-monitoreo.component';
import { QuotationEvaluationComponent } from './views/quotation-evaluation/quotation-evaluation.component';
import { ReporteOperacionesComponent } from './views/reporte-operaciones/reporte-operaciones.component';
import { ReporteUniversoPolizaComponent } from './views/reporte-universo-poliza/reporte-universo-poliza.component';
import { ReporteFacturacionComponent } from './views/reporte-facturacion/reporte-facturacion.component';



const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            // PROSPECTOS
            {
                path: 'prospectos',
                component: ProspectsComponent
            },
            {
                path: 'nuevo-prospecto',
                component: NewProspectsComponent
            },
            // COTIZACIÓN
            {
                path: 'consulta-cotizacion',
                component: RequestQuoteComponent
            },
            {
                path: 'nueva-cotizacion/:prospecto',
                component: NewQuotationComponent
            },
            {
                path: 'cotizacion-definitiva/:cotizacion/:cliente/:prospecto',
                component: QuotationDefinitiveComponent
            },
            {
                path: 'cotizacion-datapep/:cotizacion/:cliente/:prospecto', // ARJG - VIGP
                component: QuotationDataPepComponent
            },
            {
                path: 'ver-cotizacion/:prospecto/:cotizacion',
                component: ViewQuotationComponent
            },
            {
                path: 'consulta-cotizacion-definitiva', // CONSULTA SOLICITUDES DE COTIZACION
                component: QuotationDefinitiveConsultComponent
            },
            // EMISIÓN
            {
                path: 'emitir/:cotizacion/:prospecto',
                component: PolicyComponent
            },

            // CONSULTA DE COTIZACION PARA POSIBLE EMISION
            {
                path: 'cotizacion-evaluacion/:cotizacion/:prospecto',
                component: QuotationEvaluationComponent
            },
            // LISTADO DE POLIZAS
            {
                path: 'consulta-poliza',
                component: PolicyTransactionConsultComponent
            },
            // SUSCRIPCIÓN
            {
                path: 'bandeja-solicitudes',
                component: SubscriptionRequestComponent
            },
            // {
            //     path: 'consulta-solicitud-suscripcion',
            //     component: SubscriptionRequestConsultationComponent
            // },
            {
                path: 'nueva-solicitud-suscripcion/:cotizacion/:solicitud',
                component: NewSubscriptionRequestComponent
            },
            {
                path: 'suscripcion-poliza',
                component: PolicySubscriptionComponent
            },
            {
                path: 'reporte-tecnica',
                component: ReporteTecnicaComponent
            },
            {
                path: 'reporte-comercial',
                component: ReporteComercialComponent
            },
            {
                path: 'informe-eecc',
                component: EeccReportComponent
            },
            {
                path: 'monitoreo-reportes',
                component: ReportesMonitoreoComponent
            },
            {
                path: 'reporte-produccion',
                component: ReporteOperacionesComponent
            },
            {
                path: 'reporte-universo-poliza',
                component: ReporteUniversoPolizaComponent
            },            
            {
                path: 'reporte-facturacion',
                component: ReporteFacturacionComponent
            },            
            // {
            //     path: 'monitoreo-reporte-comercial',
            //     component: MonitoreoRepo
            // },

            {
                path: '**', redirectTo: '', pathMatch: 'full'
                // path: '**', redirectTo: 'prospectos', pathMatch: 'full'
            },
        ],
        // resolve: {
        //   token: VidaInversionService
        // }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class VidaInversionRoutingModule { }
