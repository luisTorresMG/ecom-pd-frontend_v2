import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccPersonalesConstants } from '../../../../../layout/broker/components/quote/acc-personales/core/constants/acc-personales.constants';


@Component({
  selector: 'panel-info-exclusion',
  templateUrl: './panel-info-exclusion.component.html',
  styleUrls: ['./panel-info-exclusion.component.css']
})
export class PanelInfoExclusionComponent implements OnInit {
  @Input() detail: boolean;
  @Input() cotizacion: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();

  CONSTANTS: any = AccPersonalesConstants;

  filtroEstados: any;

  constructor() { }

  ngOnInit() {
    this.cotizacion.estadoDeuda = 'DEUDA';
    this.cotizacion.montoDeuda = 0;

  }

  hola (){

    this.recargarChange.emit(true)
  }






}
