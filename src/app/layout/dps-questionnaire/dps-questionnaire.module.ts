import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeEs from '@angular/common/locales/es-PE';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';

import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { SharedAppModule } from '../shared-app/shared-app.module';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { MainComponent } from './components/main/main.component';
import { DpsQuestionnaireRoutingModule } from './dps-questionnaire-routing.module';
import { AuthInterceptor } from './shared/services/auth.interceptor';
import { BiometricComponent } from './components/biometric/biometric.component';
import { HomeComponent } from './components/home/home.component';
import { DpsService } from './shared/services/dps.service';

import { CommonComponentsModule } from '@shared/modules/common-components.module';
import { AuthComponent } from './components/auth/auth.component';
import { SummaryComponent } from './components/summary/summary.component';
import { TermsComponent } from './shared/components/terms/terms.component';

registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    QuestionnaireComponent,
    MainComponent,
    BiometricComponent,
    HomeComponent,
    AuthComponent,
    SummaryComponent,
    TermsComponent,
  ],
  imports: [
    CommonModule,
    DpsQuestionnaireRoutingModule,
    BsDatepickerModule,
    ModalModule,
    RouterModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SharedAppModule,
    HttpClientModule,
    CommonComponentsModule,
  ],
  providers: [
    DpsService,
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
})
export class DpsQuestionnaireModule {
  constructor(localeService: BsLocaleService) {
    defineLocale('es', esLocale);
    localeService.use('es');
  }
}
