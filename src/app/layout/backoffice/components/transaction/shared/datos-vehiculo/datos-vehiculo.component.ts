import { Component, OnInit, Input } from '@angular/core';
import { DatosVehiculoDto } from './DTOs/datos-vehiculo.dto';
@Component({
  selector: 'app-datos-vehiculo',
  templateUrl: './datos-vehiculo.component.html',
  styleUrls: ['./datos-vehiculo.component.css']
})
export class DatosVehiculoComponent implements OnInit {

  constructor() { }
  @Input() $DATA_VEHICULO: DatosVehiculoDto;

  ngOnInit(): void {
  }

}
