import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { VisaTestingRoutingModule } from './visa-testing-routing.module';

import { VisaTestingComponent } from './components/visa-testing/visa-testing.component';
import { SummaryComponent } from './components/summary/summary.component';

@NgModule({
  declarations: [SummaryComponent, VisaTestingComponent],
  imports: [
    CommonModule,
    VisaTestingRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
  ],
})
export class VisaTestingModule {}
