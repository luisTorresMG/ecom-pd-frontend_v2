import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeModule } from '../../../../backoffice/backoffice.module';
import { InformacionPlanillaComponent } from './informacion-planilla.component';
import { FormInputTextModule } from '../../quote/acc-personales/components/form-input-text/form-input-text.module';
import { NavMenuProdComponent } from '../../../../../shared/components/navmenuprod/navmenuprod.component';




@NgModule({
  declarations: [InformacionPlanillaComponent],
  imports: [
    CommonModule,
    BackOfficeModule,
    FormInputTextModule,
    NavMenuProdComponent
  ],
  exports:[
    InformacionPlanillaComponent
    
  ]
})
export class InformacionPlanillaModule { }
