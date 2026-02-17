import { Component, OnInit, Input } from '@angular/core';
import { DataPolizaDto } from './DTOs/datos-poliza.dto';
@Component({
  selector: 'app-datos-poliza',
  templateUrl: './datos-poliza.component.html',
  styleUrls: ['./datos-poliza.component.css']
})
export class DatosPolizaComponent implements OnInit {

  constructor() { }
  @Input() $DATA_POLIZA: DataPolizaDto;

  ngOnInit(): void {
  }
}
