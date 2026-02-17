import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputDateModule } from '../form-input-date/form-input-date.module';
import { FormInputCheckboxModule } from '../form-input-checkbox/form-input-checkbox.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';

import { PanelInfoPolizaComponent } from './panel-info-poliza.component';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    PanelWidgetModule,
    FormInputSelectModule,
    FormInputDateModule,
    FormInputCheckboxModule,
    FormInputTextModule,
  ],
  declarations: [
    PanelInfoPolizaComponent,
  ],
  exports: [
    PanelInfoPolizaComponent,
  ]
})
export class PanelInfoPolizaModule { }
