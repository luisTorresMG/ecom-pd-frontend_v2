import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DpsVidagrupoRoutingModule } from './dps-vidagrupo-routing.module';

import { OtpAuthModule } from '@shared/modules/otp-auth.module';
import { MainComponent } from './main/main.component';
import { DpsComponent } from './dps/dps.component';
import { AuthComponent } from './auth/auth.component';

import { DpsVidagrupoResolverService } from './shared/resolvers/dps-vidagrupo-resolver.service';

@NgModule({
  declarations: [MainComponent, DpsComponent, AuthComponent],
  imports: [
    CommonModule,
    DpsVidagrupoRoutingModule,
    ReactiveFormsModule,
    OtpAuthModule
  ],
  providers: [DpsVidagrupoResolverService],
})
export class DpsVidagrupoModule {
}
