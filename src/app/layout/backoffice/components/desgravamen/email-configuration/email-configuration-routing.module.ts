import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './components/main/main.component';
import { ExternalRecipientsComponent } from './components/external-recipients/external-recipients.component';
import { InternalRecipientsComponent } from './components/internal-recipients/internal-recipients.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'destinatarios-externos',
        component: ExternalRecipientsComponent
      },
      {
        path: 'destinatarios-internos',
        component: InternalRecipientsComponent
      },
      {
        path: '**',
        redirectTo: 'destinatarios-externos',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailConfigurationRoutingModule { }
