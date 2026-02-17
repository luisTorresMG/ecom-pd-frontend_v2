import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccidentesPersonalesRoutingModule } from './accidentes-personales-routing.module';
import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

import { QuestionsModule } from '../../insurance/questions/questions.module';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import localeEs from '@angular/common/locales/es-PE';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
// TODO: COMPONENTES
//#region
import { MainComponent } from './components/main/main.component';
import { ShowStepsComponent } from './components/show-steps/show-steps.component';
import { Step0Component } from './components/step0/step0.component';
import { Step1Component } from './components/step1/step1.component';
import { Step2Component } from './components/step2/step2.component';
import { Step3ComparePlanComponent } from './components/step3-compare-plan/step3-compare-plan.component';
import { Step3DetailComponent } from './components/step3-detail/step3-detail.component';
import { Step3SelectPlanComponent } from './components/step3-select-plan/step3-select-plan.component';
import { Step3Component } from './components/step3/step3.component';
import { Step4Component } from './components/step4/step4.component';
import { Step5Component } from './components/step5/step5.component';
//#endregion

@NgModule({
  declarations: [
    MainComponent,
    ShowStepsComponent,
    Step0Component,
    Step1Component,
    Step2Component,
    Step3Component,
    Step3DetailComponent,
    Step3ComparePlanComponent,
    Step3SelectPlanComponent,
    Step4Component,
    Step5Component
  ],
  imports: [
    CommonModule,
    SharedComponentsModule,
    ModalModule,
    QuestionsModule,
    AccidentesPersonalesRoutingModule
  ],
  providers: [
    BsModalService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AccidentesPersonalesModule { }
