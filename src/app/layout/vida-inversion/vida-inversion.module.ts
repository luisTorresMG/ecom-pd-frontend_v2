import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from '@shared/modules/common-components.module';
import { VidaInversionRoutingModule } from './vida-inversion-routing.module';
import { MainComponent } from './main/main.component';
import { ProspectsComponent } from './views/prospects/prospects.component';
import { NavMenuProdModule } from '@shared/components/navmenuprod/navmenuprod.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LoadingScreenModule } from './components/loading-screen/loading-screen.module';
import { FormButtonModule } from './components/form-button/form-button.module';
import { FormInputSelectModule } from './components/form-input-select/form-input-select.module';
import { FormInputDateModule } from './components/form-input-date/form-input-date.module';
import { FormInputTextModule } from './components/form-input-text/form-input-text.module';
import { NewProspectsComponent } from './views/new-prospects/new-prospects.component';
import { BreadcrumbModule } from './components/breadcrumb/breadcrumb.module';
import { PanelWidgetModule } from './components/panel-widget/panel-widget.module';
import { FormInputRadioModule } from './components/form-input-radio/form-input-radio.module';
import { RequestQuoteComponent } from './views/request-quote/request-quote.component';
import { NewQuotationComponent } from './views/new-quotation/new-quotation.component';
import { AddBeneficiaryComponent } from './components/add-beneficiary/add-beneficiary.component';
import { IndexStepsModule } from './components/index-steps/index-steps.module';
import { QuotationDefinitiveComponent } from './views/quotation-definitive/quotation-definitive.component';
import { QuotationDataPepComponent } from './views/quotation-data-pep/quotation-data-pep.component';
import { AddFamilyComponent } from './components/add-family/add-family.component';
import { AddPepComponent } from './components/add-pep/add-pep.component';
import { AddDeclarationComponent } from './components/add-declaration/add-declaration.component';
import { AddPropertyComponent } from './components/add-property/add-property.component';
import { AddRelationComponent } from './components/add-relation/add-relation.component';
import { OriginDetailModalComponent } from './components/origin-detail-modal/origin-detail-modal.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AddLeyendComponent } from './components/add-leyend/add-leyend.component';
import { AddLeyend1Component } from './components/add-leyend1/add-leyend1.component';
import { QuotationDefinitiveConsultComponent } from './views/quotation-definitive-consult/quotation-definitive-consult.component';
import { ViewQuotationComponent } from './views/view-quotation/view-quotation.component';
import { PolicyComponent } from './views/policy/policy.component';
import { PolicyTransactionConsultComponent } from './views/policy-transaction-consult/policy-transaction-consult.component';
import { SubscriptionRequestComponent } from './views/subscription-request/subscription-request.component';
import { NgModule } from '@angular/core';
import { NewSubscriptionRequestComponent } from './views/new-subscription-request/new-subscription-request.component';
import { AddWorkComponent } from './components/add-work/add-work.component';
import { AddFileComponent } from './components/add-file/add-file.component';
import { SubscriptionRequestConsultationComponent } from './views/subscription-request-consultation/subscription-request-consultation.component';
import { PolicySubscriptionComponent } from './views/policy-subscription/policy-subscription.component';
import { EndosoModalComponent } from './components/endoso-modal/endoso-modal.component';
import { PanelEndosoComponent } from './components/panel-endoso/panel-endoso.component';
import { ReporteTecnicaComponent } from './views/reporte-tecnica/reporte-tecnica.component';
import { ReporteComercialComponent } from './views/reporte-comercial/reporte-comercial.component';
import { ReportesMonitoreoComponent } from './views/reportes-monitoreo/reportes-monitoreo.component';
import { QuotationDocumentsComponent } from '../../layout/vida-inversion/components/quotation-documents/quotation-documents.component';
import { EeccReportComponent } from './views/eecc-report/eecc-report.component';
import { QuotationEvaluationComponent } from './views/quotation-evaluation/quotation-evaluation.component';
import { InputNumberModule } from './components/inputs/input-number/input-number.module';
import { CalculateScoringComponent } from './components/calculate-scoring/calculate-scoring.component';
import { ReporteOperacionesComponent } from './views/reporte-operaciones/reporte-operaciones.component';
import { ReporteUniversoPolizaComponent } from './views/reporte-universo-poliza/reporte-universo-poliza.component';
import { ReporteFacturacionComponent } from './views/reporte-facturacion/reporte-facturacion.component';
import { VoucherComponent } from './components/voucher/voucher.component';
import { AddSocietarioComponent } from './components/add-societario/add-societario.component';
import { ApproveNegativeRecordComponent } from './components/approve-negative-record/approve-negative-record.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';

@NgModule({
    imports: [
        CommonModule,
        VidaInversionRoutingModule,
        NavMenuProdModule,
        FormInputDateModule,
        FormsModule,
        FormButtonModule,
        FormInputSelectModule,
        FormInputTextModule,
        InputNumberModule,
        ReactiveFormsModule,
        BsDatepickerModule,
        NgbModule,
        CommonComponentsModule,
        LoadingScreenModule,
        BreadcrumbModule,
        PanelWidgetModule,
        FormInputRadioModule,
        IndexStepsModule,
        NgxExtendedPdfViewerModule
    ],
    declarations: [
        MainComponent,
        ProspectsComponent,
        NewProspectsComponent,
        RequestQuoteComponent,
        NewQuotationComponent,
        AddBeneficiaryComponent,
        AddSocietarioComponent,
        ApproveNegativeRecordComponent,
        QuotationDefinitiveComponent,
        QuotationDataPepComponent,
        AddPepComponent,
        AddFamilyComponent,
        AddFileComponent,
        AddDeclarationComponent,
        AddPropertyComponent,
        AddRelationComponent,
        OriginDetailModalComponent,
        AddLeyendComponent,
        AddLeyend1Component,
        QuotationDefinitiveConsultComponent,
        ViewQuotationComponent,
        PolicyComponent,
        PolicyTransactionConsultComponent,
        SubscriptionRequestComponent,
        NewSubscriptionRequestComponent,
        SubscriptionRequestConsultationComponent,
        PolicySubscriptionComponent,
        ReporteTecnicaComponent,
        ReporteComercialComponent,
        ReportesMonitoreoComponent,
        ReporteOperacionesComponent,
        ReporteUniversoPolizaComponent,
        AddWorkComponent,
        EndosoModalComponent,
        PanelEndosoComponent,
        QuotationDocumentsComponent,
        EeccReportComponent,
        QuotationEvaluationComponent,
        CalculateScoringComponent,
        ReporteFacturacionComponent,
        VoucherComponent
    ],
    // entryComponents: [
    //     AddBeneficiaryComponent,
    //     AddSocietarioComponent,
    //     ApproveNegativeRecordComponent,
    //     AddPepComponent,
    //     AddFamilyComponent,
    //     AddDeclarationComponent,
    //     AddPropertyComponent,
    //     AddRelationComponent,
    //     AddLeyendComponent,
    //     AddLeyend1Component,
    //     OriginDetailModalComponent,
    //     AddWorkComponent,
    //     AddFileComponent,
    //     EndosoModalComponent,
    //     PanelEndosoComponent,
    //     QuotationDocumentsComponent,
    //     VoucherComponent
    // ],
    exports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        }
    ]
})

export class VidaInversionModule { }
