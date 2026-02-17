import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO: COMPONENTES
//#region
import { MainComponent } from './components/main/main.component';
import { Step0Component } from './components/step0/step0.component';
import { Step1Component } from './components/step1/step1.component';
import { Step2Component } from './components/step2/step2.component';
import { Step3Component } from './components/step3/step3.component';
import { Step3ComparePlanComponent } from './components/step3-compare-plan/step3-compare-plan.component';
import { Step3DetailComponent } from './components/step3-detail/step3-detail.component';
import { Step3SelectPlanComponent } from './components/step3-select-plan/step3-select-plan.component';
import { Step4Component } from './components/step4/step4.component';
import { Step5Component } from './components/step5/step5.component';
//#endregion

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      {
        path: '', component: Step0Component
      },
      {
        path: 'step1', component: Step1Component
      },
      {
        path: 'step2', component: Step2Component
      },
      {
        path: 'step3', component: Step3Component
      },
      {
        path: 'step3/select-plan', component: Step3SelectPlanComponent
      },
      {
        path: 'step3/detail', component: Step3DetailComponent
      },
      {
        path: 'step3/compare-plan', component: Step3ComparePlanComponent
      },
      {
        path: 'step4', component: Step4Component
      },
      {
        path: 'step5', component: Step5Component
      }
    ]
  },
  {
    path: '**', redirectTo: '', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccidentesPersonalesRoutingModule { }
