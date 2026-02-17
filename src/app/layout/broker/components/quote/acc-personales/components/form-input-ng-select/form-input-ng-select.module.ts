import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { FormInputNgSelectComponent } from './form-input-ng-select.component';



@NgModule({
  declarations: [
    FormInputNgSelectComponent,
],
exports: [
    FormInputNgSelectComponent
],
imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ]
})
export class FormInputNgSelectModule { }
