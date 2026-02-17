import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderEcommerceComponent } from '../components/header-ecommerce/header-ecommerce.component';
import { FooterComponent } from '../components/footer/footer.component';
import { EmailSuggestionsComponent } from '../components/email-suggestions/email-suggestions.component';
import { StepsGenericComponent } from '../components/steps-generic/steps-generic.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { NewFooterComponent } from '../components/new-footer/new-footer.component';

@NgModule({
  declarations: [
    HeaderEcommerceComponent,
    FooterComponent,
    EmailSuggestionsComponent,
    StepsGenericComponent,
    NewFooterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    RouterModule,
    NgxSpinnerModule,
  ],
  exports: [
    HeaderEcommerceComponent,
    FooterComponent,
    EmailSuggestionsComponent,
    StepsGenericComponent,
    NewFooterComponent,
  ],
})
export class CommonComponentsModule {}
