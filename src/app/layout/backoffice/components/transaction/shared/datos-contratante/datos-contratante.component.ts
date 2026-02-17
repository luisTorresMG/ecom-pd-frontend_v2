import { Component, OnInit, Input } from '@angular/core';
import { DatosContratanteDto } from './DTOs/datos-contratante.dto';
@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.css']
})
export class DatosContratanteComponent implements OnInit {

  constructor() {
    this.$IS_EMPRESA_OR_PERSONA = 'persona';
  }
  @Input() $DATA_CONTRATANTE: DatosContratanteDto;
  @Input() $IS_EMPRESA_OR_PERSONA: string;
  ngOnInit(): void {
  }
}
