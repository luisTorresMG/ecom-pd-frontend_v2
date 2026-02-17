import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QrProofValidationRoutingModule } from './qr-proof-validation-routing.module';
import { MainComponent } from './components/main/main.component';
import { PolicyholderInquiriesComponent } from './components/policyholder-inquiries/policyholder-inquiries.component';
import { ProofConsultationComponent } from './components/proof-consultation/proof-consultation.component';

import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { CommonComponentsModule } from '../../shared/modules/common-components.module';

@NgModule({
  declarations: [MainComponent, PolicyholderInquiriesComponent, ProofConsultationComponent],
  imports: [
    CommonModule,
    QrProofValidationRoutingModule,
    SharedComponentsModule,
    CommonComponentsModule
  ]
})
export class QrProofValidationModule { }
