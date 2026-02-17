import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DpsVidagrupoResolverService } from './shared/resolvers/dps-vidagrupo-resolver.service';

import { MainComponent } from './main/main.component';
import { DpsComponent } from './dps/dps.component';
import { AuthComponent } from './auth/auth.component';


const routes: Routes = [
  {
    path: ':token',
    component: MainComponent,
    children: [
      {
        path: '',
        component: DpsComponent
      },
      {
        path: 'autenticacion',
        component: AuthComponent
      }
    ],
    resolve: {
      insuranceInfo: DpsVidagrupoResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DpsVidagrupoRoutingModule {
}
