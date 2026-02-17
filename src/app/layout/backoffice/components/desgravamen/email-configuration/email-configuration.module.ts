import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';

import {BreadcrumbModule} from '@shared/components/breadcrumb/breadcrumb.module';
import {ProSelectModule} from '@shared/components/pro-select/pro-select.module';

import {EmailConfigurationRoutingModule} from './email-configuration-routing.module';
import {MainComponent} from './components/main/main.component';
import {ExternalRecipientsComponent} from './components/external-recipients/external-recipients.component';
import {InternalRecipientsComponent} from './components/internal-recipients/internal-recipients.component';

import {EmailConfigurationService} from './shared/services/email-configuration/email-configuration.service';

@NgModule({
  declarations: [MainComponent, ExternalRecipientsComponent, InternalRecipientsComponent],
  imports: [
    CommonModule,
    EmailConfigurationRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BreadcrumbModule,
    ProSelectModule
  ],
  providers: [
    EmailConfigurationService
  ]
})
export class EmailConfigurationModule {
}
