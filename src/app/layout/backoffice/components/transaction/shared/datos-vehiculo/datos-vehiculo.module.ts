import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatosVehiculoComponent } from './datos-vehiculo.component';
@NgModule({
  declarations: [DatosVehiculoComponent],
  imports: [
    CommonModule
  ],
  exports: [DatosVehiculoComponent]
})
export class DatosVehiculoModule { }
