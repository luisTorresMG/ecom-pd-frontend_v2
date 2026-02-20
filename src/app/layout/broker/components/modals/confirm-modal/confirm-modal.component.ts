import { Component, OnInit, Input } from '@angular/core';
import { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent implements OnInit {
  @Input() public formModalReference: any; // Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public tickets: any;
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;
  @Input() public listActions: any;
  @Input() public error: boolean = false;

  inputs: any = {};
  @Input() mensaje: [SweetAlertIcon, string, string] | undefined;
  ejecutivos: any[] = [];
  opcionesEjecutivos: any[] = [];
  icon: string;
  constructor(
    public activeModal: NgbActiveModal
  ) {}

  async ngOnInit() {
    this.icon = `assets/rentas/${this.mensaje[0]}.svg` 
}


  select() {
    this.activeModal.close();
  }
}
