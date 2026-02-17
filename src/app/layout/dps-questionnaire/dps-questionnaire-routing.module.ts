import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BiometricComponent } from './components/biometric/biometric.component';
import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { AuthComponent } from './components/auth/auth.component';

import { DpsService } from './shared/services/dps.service';
import { SummaryComponent } from './components/summary/summary.component';

const routes: Routes = [
  {
    path: ':token',
    component: MainComponent,
    children: [
      {
        path: 'inicio',
        component: HomeComponent,
      },
      {
        path: 'preguntas',
        component: QuestionnaireComponent,
      },
      {
        path: 'biometrico',
        component: BiometricComponent,
      },
      {
        path: 'auth',
        component: AuthComponent,
      },
      {
        path: 'summary',
        component: SummaryComponent,
      },
      {
        path: '**',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
    resolve: {
      token: DpsService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DpsQuestionnaireRoutingModule {}
