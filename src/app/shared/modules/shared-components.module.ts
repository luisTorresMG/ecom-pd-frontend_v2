import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { ButtonVisaComponent } from '../components/button-visa/button-visa.component';
import { FrameComponent } from '../components/frame/frame.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemPersonalComponent } from '../components/item-personal/item-personal.component';
import { InputDateComponent } from '../components/input-date/input-date.component';
import { PixelGoogleAnalyticsComponent } from '../components/pixel-google-analytics/pixel-google-analytics.component';
import { PixelDigilantComponent } from '../components/pixel-digilant/pixel-digilant.component';
import { PixelGoogleTagManagerComponent } from '../components/pixel-google-tag-manager/pixel-google-tag-manager.component';
import { PixelFacebookComponent } from '../components/pixel-facebook/pixel-facebook.component';
import { ItemPersonalFullComponent } from '../components/item-personal-full/item-personal-full.component';
import { ButtonTelepagoComponent } from '../components/button-visa/button-telepago.component';
import { NavMenuComponent } from '../components/navmenu/navmenu.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NewMenuComponent } from '../components/new-menu/new-menu.component';
import { ReceptAsesorComponent } from '../components/recept-asesor/recept-asesor.component';
import { BiometricComponent } from '../components/biometric/biometric/biometric.component';
import { StepBiometricComponent } from '../components/biometric/step-biometric/step-biometric.component';
import { DpsComponent } from '../components/dps/dps.component';
import { LocationsComponent } from '../components/locations/locations.component';
import { AuthMethodComponent } from '../components/auth-method/auth-method.component';
import { OtpAuthComponent } from '../components/otp-auth/otp-auth.component';
import { BreadcrumbModule } from '../components/breadcrumb/breadcrumb.module';
import {ProSelectModule} from '../components/pro-select/pro-select.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NavMenuProdModule } from '@shared/components/navmenuprod/navmenuprod.module';
import { ProInputFieldComponent } from '../components/pro-input-field/pro-input-field.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { OtpComponent } from '../components/otp/otp.component';
import { BiometricStep1Component } from '../components/otp/biometric-step1/biometric-step1.component';
import { BiometricStep2Component } from '../components/otp/biometric-step2/biometric-step2.component';
import { OtpTokenComponent } from '../components/otp/otp-token/otp-token.component';
import { OtpAuthAwsComponent } from '../components/otp-auth-aws/otp-auth-aws.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgbModule,
    RouterModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    ModalModule,
    NavMenuProdModule,
    BreadcrumbModule,
    ProSelectModule
  ],
  declarations: [
    HeaderComponent,
    ButtonVisaComponent,
    ButtonTelepagoComponent,
    FrameComponent,
    ItemPersonalComponent,
    ItemPersonalFullComponent,
    InputDateComponent,
    PixelGoogleAnalyticsComponent,
    PixelGoogleTagManagerComponent,
    PixelDigilantComponent,
    PixelFacebookComponent,
    NavMenuComponent,
    NewMenuComponent,
    ReceptAsesorComponent,
    BiometricComponent,
    DpsComponent,
    LocationsComponent,
    AuthMethodComponent,
    OtpAuthComponent,
    StepBiometricComponent,
    ProInputFieldComponent,
    DropdownComponent,
    OtpComponent,
    BiometricStep1Component,
    BiometricStep2Component,
    OtpTokenComponent,
    OtpAuthAwsComponent
  ],
  exports: [
    HeaderComponent,
    NewMenuComponent,
    ItemPersonalComponent,
    ItemPersonalFullComponent,
    InputDateComponent,
    PixelGoogleAnalyticsComponent,
    PixelGoogleTagManagerComponent,
    PixelDigilantComponent,
    PixelFacebookComponent,
    NavMenuComponent,
    ReceptAsesorComponent,
    BiometricComponent,
    DpsComponent,
    LocationsComponent,
    AuthMethodComponent,
    OtpAuthComponent,
    BreadcrumbModule,
    ProSelectModule,
    StepBiometricComponent,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    NavMenuProdModule,
    RouterModule,
    NgbModule,
    ProInputFieldComponent,
    DropdownComponent,
    OtpComponent,
    BiometricStep1Component,
    BiometricStep2Component,
    OtpTokenComponent,
    OtpAuthAwsComponent,
  ],
  entryComponents: [
    ButtonVisaComponent,
    ButtonTelepagoComponent,
    FrameComponent,
    PixelGoogleAnalyticsComponent,
    PixelGoogleTagManagerComponent,
    PixelDigilantComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedComponentsModule {}
