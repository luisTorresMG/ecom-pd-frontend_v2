import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OtpComponent } from '../components/otp/otp.component';
import { BiometricStep1Component } from '../components/otp/biometric-step1/biometric-step1.component';
import { BiometricStep2Component } from '../components/otp/biometric-step2/biometric-step2.component';
import { OtpTokenComponent } from '../components/otp/otp-token/otp-token.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    OtpComponent,
    BiometricStep1Component,
    BiometricStep2Component,
    OtpTokenComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    OtpComponent,
    BiometricStep1Component,
    BiometricStep2Component,
    OtpTokenComponent
  ]
})
export class OtpAuthModule {
}
