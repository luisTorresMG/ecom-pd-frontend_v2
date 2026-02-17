import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisaTestingComponent } from './components/visa-testing/visa-testing.component';
import { SummaryComponent } from './components/summary/summary.component';

const routes: Routes = [
  {
    path: '',
    component: VisaTestingComponent,
  },
  {
    path: 'summary/:token',
    component: SummaryComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisaTestingRoutingModule {}
