import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { VidaindividualLatestRoutingModule } from './vidaindividual-latest-routing.module';
// *MODULOS
//#region
import { SharedComponentsModule } from '@shared/modules/shared-components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { SharedAppModule } from '../shared-app/shared-app.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SessionStorageService } from '@shared/services/storage/storage-service';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import localeEs from '@angular/common/locales/es-PE';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { CommonComponentsModule } from '@shared/modules/common-components.module';
//#endregion

// *COMPONENTS
//#region
import { VidaindividualLatestComponent } from './components/main/vidaindividual-latest.component'; // MAIN
import { ShowStepsComponent } from './components/show-steps/show-steps.component'; // SHOW STEPS
import { Step1Component } from './components/step1/step1.component'; // STEP 1
import { Step2Component } from './components/step2/step2.component'; // STEP 2
import { Step3Component } from './components/step3/step3.component'; // STEP 3
import { Step4Component } from './components/step4/step4.component'; // STEP 4
import { TermsComponent } from './components/terms/terms.component';
import { PolicyComponent } from './components/policy/policy.component';
import { BeneficiarioFormComponent } from './components/beneficiario-form/beneficiario-form.component';
import { PagoEfectivoComponent } from './components/payment/pago-efectivo/pago-efectivo.component';
import { VisaTestComponent } from './components/tests/visa/visa-test.component';
//#endregion

// *SERVICES
import { VisaService } from '@shared/services/pago/visa.service';
import { SessionService } from '../soat/shared/services/session.service';
import { VisaButtonATPDirective } from './directives/visa-button-atp.directive';
import { VisaComponent } from './components/payment/visa/visa.component';
import { Step1Service } from './services/step1/step1.service';
import { Step2Service } from './services/step2/step2.service';
import { Step3Service } from './services/step3/step3.service';
import { Step4Service } from './services/step4/step4.service';
import { MainService } from './services/main/main.service';
import { PaymentsService } from './services/payments.service';
import { ApiService } from '@shared/services/api.service';
import { ChatBotService } from '@shared/services/chat-bot/chat-bot.service';
import { RecaptchaModule } from 'ng-recaptcha';
// *PIPES
import { DecimalPipe } from '@angular/common';

// *GUARDS
import { AuthGuard } from './guards/auth.guard';

registerLocaleData(localeEs, 'es');

// *INTERCEPTORS
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';
import { KushkiFormModule } from '@shared/modules/kushki-form.module';

@NgModule({
    declarations: [
        VidaindividualLatestComponent,
        ShowStepsComponent,
        Step1Component,
        Step2Component,
        Step3Component,
        Step4Component,
        TermsComponent,
        PolicyComponent,
        VisaButtonATPDirective,
        VisaComponent,
        BeneficiarioFormComponent,
        PagoEfectivoComponent,
        VisaTestComponent,
    ],
    imports: [
        CommonModule,
        VidaindividualLatestRoutingModule,
        BsDatepickerModule,
        ModalModule,
        RouterModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        SharedAppModule,
        HttpClientModule,
        FormsModule,
        CommonComponentsModule,
        RecaptchaModule,
        KushkiFormModule
    ],
    providers: [
        SessionStorageService,
        SessionService,
        VisaService,
        BsModalService,
        DecimalPipe,
        AuthGuard,
        MainService,
        Step1Service,
        Step2Service,
        Step3Service,
        Step4Service,
        PaymentsService,
        ApiService,
        ChatBotService,
        {
            provide: LOCALE_ID,
            useValue: 'es',
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        TermsComponent
    ]
})
export class VidaindividualLatestModule {
  constructor(localeService: BsLocaleService) {
    defineLocale('es', esLocale);
    localeService.use('es');
  }
}
