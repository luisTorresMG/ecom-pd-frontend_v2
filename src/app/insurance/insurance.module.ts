import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from '../insurance/main/main.component';
import { PickInsuranceComponent } from '../insurance/pick-insurance/pick-insurance.component';
import { InsuranceRoutingModule } from './insurance-routing.module';
import { SharedComponentsModule } from '../shared/modules/shared-components.module';
import { SharedAppModule } from '../layout/shared-app/shared-app.module';
import { ApiService } from '../shared/services/api.service';
import { ConfigService } from '../shared/services/general/config.service';
import { SessionStorageService } from '../shared/services/storage/storage-service';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';
import { StatusIndicatorComponent } from './shared/components/status-indicator/status-indicator.component';
import { UserDocumentComponent } from './user-document/user-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { UserInfoComponent } from './user-info/user-info.component';
import { TokenService } from '../layout/soat/shared/services/token.service';
import { AuthGuard } from '../layout/soat/shared/services/auth.guard';
import { VehiculoService } from '../layout/broker/services/vehiculo/vehiculo.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EmisionService } from '../layout/client/shared/services/emision.service';
import { UtilityService } from '../shared/services/general/utility.service';
import { UbigeoService } from '../shared/services/ubigeo/ubigeo.service';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { InsuranceInfoComponent } from './insurance-info/insurance-info.component';
import { QuestionsModule } from './questions/questions.module';
import { ShowStepsComponent } from './show-steps/show-steps.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { InsuranceComparisonComponent } from './insurance-comparison/insurance-comparison.component';
import { PlanInfoComponent } from './plan-info/plan-info.component';
import { PolicyComponent } from './policy/policy.component';
import { ValidateQuotationComponent } from './validate-quotation/validate-quotation.component';
import { SelectPaymentMethodComponent } from './select-payment-method/select-payment-method.component';

import { ComparePlanComponent } from './compare-plan/compare-plan.component';
import { VisaService } from '../shared/services/pago/visa.service';
import { SessionService } from '../layout/soat/shared/services/session.service';
import { AuthInterceptor } from '@root/shared/interceptors/auth.interceptor';
import { MainService } from './shared/services/main.service';
import { ValidateQuotationService } from './shared/services/validate-quotation.service';
import { DecimalPipe } from '@angular/common';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { MoreInfoComponent } from './shared/components/more-info/more-info.component';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { PaymentService } from './shared/services/payment.service';
import { PagoEfectivoPaymentSuccessComponent } from './pago-efectivo-payment-success/pago-efectivo-payment-success.component';

import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { TermsApComponent } from './terms-ap/terms-ap.component';
import { CommonComponentsModule } from '@shared/modules/common-components.module';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxPaginationModule } from 'ngx-pagination';
import { RecaptchaModule } from 'ng-recaptcha';
import { ProductSelectedResolver } from '@root/insurance/shared/resolvers/product-selected.resolver';
import { AcordionApComponent } from './shared/components/acordion-ap/acordion-ap.component';
import { FooterApComponent } from './shared/components/footer-ap/footer-ap.component';
import { ContactUsComponent } from './shared/components/contact-us/contact-us.component';
import { SliderComponent } from './shared/components/slider/slider.component';
import { NavigationComponent } from '../insurance/navigation/navigation.component';
import { ChatBotComponent } from './shared/components/chat-bot/chat-bot.component';
import { GoogleTagService } from './shared/services/google-tag-service';

const interceptors = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
];
@NgModule({
  declarations: [
    MainComponent,
    PickInsuranceComponent,
    NavigationComponent,
    LoadingIndicatorComponent,
    StatusIndicatorComponent,
    UserDocumentComponent,
    UserInfoComponent,
    InsuranceInfoComponent,
    ShowStepsComponent,
    InsuranceComparisonComponent,
    PlanInfoComponent,
    PolicyComponent,
    ValidateQuotationComponent,
    SelectPaymentMethodComponent,
    ComparePlanComponent,
    PaymentSuccessComponent,
    MoreInfoComponent,
    PagoEfectivoPaymentSuccessComponent,
    TermsApComponent,
    AcordionApComponent,
    FooterApComponent,
    ContactUsComponent,
    SliderComponent,
    ChatBotComponent,
  ],
  imports: [
    CommonModule,
    InsuranceRoutingModule,
    SharedComponentsModule,
    SharedAppModule,
    NgSelectModule,
    ReactiveFormsModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    QuestionsModule,
    ModalModule,
    CommonComponentsModule,
    NgxCurrencyModule,
    NgxPaginationModule,
    RecaptchaModule,
  ],
  providers: [
    ApiService,
    ConfigService,
    SessionStorageService,
    TokenService,
    AuthGuard,
    VehiculoService,
    EmisionService,
    UtilityService,
    UbigeoService,
    BsModalService,
    VisaService,
    SessionService,
    MainService,
    ValidateQuotationService,
    UtilsService,
    PaymentService,
    GoogleTagService,
    DecimalPipe,
    interceptors,
    ProductSelectedResolver,
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InsuranceModule {
  constructor(localeService: BsLocaleService) {
    defineLocale('es', esLocale);
    localeService.use('es');
  }
}
