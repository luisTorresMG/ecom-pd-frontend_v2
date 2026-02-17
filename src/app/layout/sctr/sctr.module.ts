import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { SctrComponent } from './components/sctr/sctr.component';
import { Step1Component } from './components/steps/step1/step1.component';
import { SctrRoutingModule } from './sctr-routing.module';
import { RucFormComponent } from './components/ruc-form/ruc-form.component';
import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { SessionStorageService } from '../../shared/services/storage/storage-service';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../soat/shared/services/auth.guard';
import { TokenService } from '../soat/shared/services/token.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ClientHttpInterceptor } from '../client/shared/services/client-http-interceptor';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import localeEs from '@angular/common/locales/es-PE';
import { SessionService } from '../soat/shared/services/session.service';
import { VehiculoService } from '../client/shared/services/vehiculo.service';
import { EmisionService } from '../client/shared/services/emision.service';
import { ApiService } from '../../shared/services/api.service';
import { ConfigService } from '../../shared/services/general/config.service';
import { UtilityService } from '../../shared/services/general/utility.service';
import { Step2Component } from './components/steps/step2/step2.component';
import { ContractorComponent } from './components/contractor/contractor.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UbigeoService } from '../../shared/services/ubigeo/ubigeo.service';
import { Step3Component } from './components/steps/step3/step3.component';
import { QuoteComponent } from './components/quote/quote.component';
import { Step4Component } from './components/steps/step4/step4.component';
import { Step5Component } from './components/steps/step5/step5.component';
import { SummaryComponent } from './components/summary/summary.component';
import { VidaleyService } from './shared/services/vidaley.service';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { StepNavigationComponent } from './components/step-navigation/step-navigation.component';
import { VisaService } from '../../shared/services/pago/visa.service';
import { VisaPaymentComponent } from './components/steps/visa-payment/visa-payment.component';
import { PagoEfectivoPaymentComponent } from './components/steps/pago-efectivo-payment/pago-efectivo-payment.component';
import { SharedAppModule } from '../shared-app/shared-app.module';
import { GoogleTagManagerService } from './shared/services/google-tag-manager.service';
import { PrivacyVidaLeyComponent } from './components/privacy/privacy.component';
import { TermsVidaLeyComponent } from './components/terms/terms.component';
import { InsuranceTypesComponent } from './components/insurance-types/insurance-types.component';
import { BannerComponent } from './components/banner/banner.component';
import { InformationSctrComponent } from './components/information/information.component';
import { StepsInfoSctrComponent } from './components/steps-info/steps-info.component';
import { EmployeeInfoComponent } from './components/employee-info/employee-info.component';
import { ShopModule } from '../../shop/shop.module';
import { CommonComponentsModule } from '@shared/modules/common-components.module';

registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    Step1Component,
    SctrComponent,
    RucFormComponent,
    Step2Component,
    ContractorComponent,
    Step3Component,
    QuoteComponent,
    Step4Component,
    Step5Component,
    SummaryComponent,
    ErrorMessageComponent,
    StepNavigationComponent,
    StepsInfoSctrComponent,
    VisaPaymentComponent,
    PagoEfectivoPaymentComponent,
    PrivacyVidaLeyComponent,
    InformationSctrComponent,
    TermsVidaLeyComponent,
    InsuranceTypesComponent,
    BannerComponent,
    EmployeeInfoComponent,
  ],
  entryComponents: [SctrComponent],
  imports: [
    CommonModule,
    SctrRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    SharedAppModule,
    SharedComponentsModule,
    // EcommerceModule,
    ShopModule,
    CommonComponentsModule,
  ],
  providers: [
    ApiService,
    ConfigService,
    UtilityService,
    SessionStorageService,
    TokenService,
    AuthGuard,
    SessionService,
    VehiculoService,
    EmisionService,
    UbigeoService,
    VidaleyService,
    VisaService,
    GoogleTagManagerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ClientHttpInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'es' },
  ],
})
export class SctrModule {
  constructor(localeService: BsLocaleService) {
    defineLocale('es', esLocale);
    localeService.use('es');
  }
}
