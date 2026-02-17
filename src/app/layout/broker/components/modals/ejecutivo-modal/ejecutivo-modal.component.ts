import { Component, OnInit, Input } from '@angular/core';
//Importación de servicios

import swal, { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import Swal from 'sweetalert2';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-ejecutivo-modal',
  templateUrl: './ejecutivo-modal.component.html',
  styleUrls: ['./ejecutivo-modal.component.css'],
})
export class EjecutivoModalComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public tickets: any;
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;
  @Input() public listActions: any;

  inputs: any = {};

  ejecutivos: any = [];
  opcionesEjecutivos: any = [];

  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.getEjecutivos();
  }
  drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var draggedElement = document.getElementById(data);
    var targetElement = ev.target;
    if (
      targetElement.tagName === 'BUTTON' &&
      draggedElement instanceof HTMLButtonElement
    ) {
      if (draggedElement !== targetElement) {
        var replacedText = targetElement.innerText;
        targetElement.innerText = draggedElement.innerText;
        draggedElement.innerText = replacedText;
      }
    }
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
  }

  onSelectTypeSearch() {
    switch (this.inputs.P_TYPE_SEARCH) {
      case '1':
        break;

      case '2':
        break;
    }
  }
  getEjecutivos() {
    const data = {
      P_NUSERCODE: this.NUSERCODE,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    this.rentasService.getListEjecutivos(data).subscribe({
      next: (response) => {
        this.ejecutivos = response.C_TABLE;

        if (this.ejecutivos.length === 0) {
          this.opcionesEjecutivos = [
            {
              codigo: 0,
              valor: 'No existe ejecutivos',
            },
          ];
        } else {
          this.opcionesEjecutivos = this.ejecutivos.map((ejecutivo) => {
            return {
              codigo: ejecutivo.NCODE,
              valor: ejecutivo.SDESCRIPT,
            };
          });
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async select() {
    const mensaje = await this.getMessage(20);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    if (
      this.inputs.P_EJECUTIVO.codigo === 0 ||
      this.inputs.P_EJECUTIVO.codigo == ''
    ) {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: mensajeParts[2],
      });
    } else {
        const codigo = this.inputs.P_EJECUTIVO.codigo;
        const ejecutivo = this.ejecutivos.find((e: any) => e.NCODE === codigo);
        this.rentasService
        .EquivalenciaUsuario({ dni: ejecutivo.SDNI, token: '' })
        .subscribe({
          next: (response) => {
            if(response.numbermsg != 0){
              this.ErrorModal(80) 
            }else{
      const listaSCODE_JIRA = this.tickets.map((ticket) => ticket.SCODE_JIRA);
      const data = {
        LIST_SCODE_JIRA: listaSCODE_JIRA,
        P_NUSERCODE_RE: this.inputs.P_EJECUTIVO.codigo,
        P_NUSERCODE: this.NUSERCODE,
        P_SCODE_JIRA: '',
      };
      this.rentasService.updAsignar(data).subscribe({
        next: (response) => {
          const mensajeParts: [SweetAlertIcon, string, string] =
            this.separateString(response.P_SMESSAGE);
          if (response.P_NCODE == 0) {
            Swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
            // this.formModalReference.dismiss()
            this.activeModal.close();
          } else {
            Swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
          },
          error: (error) => {
            console.error(error);
          },
        });
      
    }
  }

  async ErrorModal(numberError:number) {
    const message = await this.getMessage(numberError);
    const mensaje = this.separateString(message);

    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.error = true;
    modalRef.componentInstance.mensaje = mensaje;
  }
  
  async getMessage(nerror: number): Promise<string> {
    const data = {
      P_NERRORNUM: nerror,
    };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error(error);
      return 'Error al obtener el mensaje';
    }
  }

  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }
}
