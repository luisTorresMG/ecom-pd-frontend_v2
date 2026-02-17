//#region MODULES
import { NgModule } from '@angular/core';
import { BrokerModule } from '../broker/broker.module';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//import { DesgravamenRoutingModule } from './desgravamen-routing.module';

import { LOCALE_ID } from '@angular/core';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { SharedComponentsModule } from '@root/shared/modules/shared-components.module';
//#endregion

import { CommonMethods } from '../../layout/broker/components/common-methods';
import { FileService } from '../broker/components/quote/acc-personales/core/services/file.service';
import { StorageService } from '../broker/components/quote/acc-personales/core/services/storage.service';
import { SharedAppModule } from '../shared-app/shared-app.module';
import { QuoteComponent } from './components/quote/quote.component';
import { DesgravamenRoutingModule } from './desgravamen-routing.module';
import { BandejaComponent } from './components/bandeja/bandeja.component';
import { RequestQuoteComponent } from './components/request-quote/request-quote.component';
import { RequestPolicyComponent } from './components/request-policy/request-policy.component';
import { SharedComponentsModulePD } from './shared/components/shared-components.module';

import { EndorseeComponent } from './components/endorsee/endorsee.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EndorseeViewComponent } from './shared/components/endorsee-view/endorsee-view.component';
import { NavMenuProdModule } from '../../shared/components/navmenuprod/navmenuprod.module';
import { DesgravamenServicePD } from './desgravament.service';

/* -------------------------------------------------------------------------- */

//#region COMPONENTS
import { MainComponent } from './components/main/main.component';

import { Step1Component } from './components/steps/step1/step1.component';
import { Step2Component } from './components/steps/step2/step2.component';
import { Step3Component } from './components/steps/step3/main/step3.component';
import { PlanDetailComponent } from './components/steps/step3/plan-detail/plan-detail.component';
import { Step4Component } from './components/steps/step4/step4.component';
import { Step5Component } from './components/steps/step5/step5.component';

import { FormBeneficiarioComponent } from './shared/components/form-beneficiario/form-beneficiario.component';

import { VisaComponent } from './components/payments/visa/visa.component';
import { PagoEfectivoComponent } from './components/payments/pago-efectivo/pago-efectivo.component';
//#endregion

//#region SERVICES
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionStorageService } from '../../shared/services/storage/storage-service';
import { SessionService } from '../soat/shared/services/session.service';
import { ApiService } from '../../shared/services/api.service';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { DesgravamenService } from './shared/services/desgravamen.service';
import { AuthInterceptor } from '@root/shared/interceptors/auth.interceptor';

//#endregion

import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';

/* -------------------------------------------------------------------------- */

import { CommonComponentsModule } from '@shared/modules/common-components.module';
import { VcfReserveReportComponent } from './components/reports/vcf-reserve-report/vcf-reserve-report.component';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
    imports: [
        CommonModule,
        DesgravamenRoutingModule,
        BrokerModule,
        SharedAppModule,
        NavMenuProdModule,
        SharedComponentsModule,
        SharedComponentsModulePD,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule,
        NgbModule,
        CommonComponentsModule,
        RecaptchaModule
    ],
    declarations: [
        MainComponent,
        Step1Component,
        Step2Component,
        Step3Component,
        PlanDetailComponent,
        Step4Component,
        Step5Component,
        FormBeneficiarioComponent,
    VisaComponent,
    PagoEfectivoComponent,
        QuoteComponent,
        RequestQuoteComponent,
        RequestPolicyComponent,
        BandejaComponent,
        EndorseeComponent,
    EndorseeViewComponent,
    VcfReserveReportComponent,
    ],
  entryComponents: [EndorseeViewComponent],
  exports: [],
    providers: [
        DesgravamenService,
        DesgravamenServicePD,
        UtilsService,
        ApiService,
        SessionService,
        SessionStorageService,
        BsLocaleService,
        /*
        {
            provide: LOCALE_ID,
      useValue: 'es',
        },*/
        {
            provide: HTTP_INTERCEPTORS,
            multi: true,
      useClass: AuthInterceptor,
    },
  ],
})
export class DesgravamenModule {
    /*
    constructor(localeService: BsLocaleService) {
        defineLocale('es', esLocale);
        localeService.use('es');
    }
    */
}
