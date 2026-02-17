import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextareaModule } from '../form-input-textarea/form-input-textarea.module';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';
import { PanelDpsComponent } from './panel-dps.component';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { FormInputRadioModule } from '../form-input-radio/form-input-radio.module';
import { FormButtonModule } from '../form-button/form-button.module';


@NgModule({
  imports: [
    CommonModule,
    PanelWidgetModule,
    PanelTableModule,
    FormInputSelectModule,
    FormInputTextareaModule,
    FormInputFileModule,
    FormInputTextModule,
    FormInputRadioModule,
    FormInputTextareaModule,
    FormButtonModule,
  ],
  declarations: [PanelDpsComponent],
  exports: [PanelDpsComponent],
})
export class PanelDpsModule { }
