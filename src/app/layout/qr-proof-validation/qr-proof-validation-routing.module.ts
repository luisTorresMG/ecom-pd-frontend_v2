import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { ProofConsultationComponent } from './components/proof-consultation/proof-consultation.component';
import { PolicyholderInquiriesComponent } from './components/policyholder-inquiries/policyholder-inquiries.component';

const routes: Routes = [
    {
        path:'', component: MainComponent, children:[
            {
                path:'', component: ProofConsultationComponent
            },
            {
                path:'consulta-asegurados', component: PolicyholderInquiriesComponent
            }
        ]
    },
    {
        path:'**', redirectTo:'', pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QrProofValidationRoutingModule { }
