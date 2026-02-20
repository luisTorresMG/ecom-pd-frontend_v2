import {
  Component,
  OnInit,
  Input,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import Swal from 'sweetalert2';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentoModalComponent } from '../documento-modal/documento-modal.component';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-comentario-modal',
  templateUrl: './comentario-modal.component.html',
  styleUrls: ['./comentario-modal.component.css'],
})
export class ComentarioModalComponent implements OnInit, OnDestroy {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;
  @Input() public POPUPDATA: number;
  @Input() public ticket: any;
  @Input() public listActions: any;
  @Input() public SNAME_ACT: string;
  
  inputs: any = {};
  listAdj: any = [];
  tipoComentario: any[];
  opcionesTipoComentario: any[] = [];
  destinatarios: any[];
  opcionesDestinatarios: any[];
  semails: string;
  P_SMESSAGE: string[];
  P_NCODE: Number;
  suscription:Subscription
  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.getListAdj();
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.getListTypeComments();
    this.getListDestination(this.SNAME_ACT,this.ticket.NTICKET);
   
    this.suscription = this.rentasService.refreshDetail$.subscribe(() => {
        this.getListAdj();
    });
    // this.getMailSubject()
  }

  getListAdj() {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NMAIL: 0,
    };
    this.rentasService.getListAdj(data).subscribe({
      next: (response) => {
        this.listAdj = response.P_CURSOR;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updAttachmentAdj(P_NID: number, P_NATTACHEMAIL: number) {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NATTACHEMAIL: P_NATTACHEMAIL,
      P_NID: P_NID,
    };
    this.rentasService.updAttachmentAdj(data).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error(error);
      },
    });
  }

  options: Option[] = [{ code: 0, value: '-- Seleccione --' }];
  isSelectVisible: boolean = false;
  selectedOptions: Option[] = [this.options[0]];
  selectedOptionsValue(): string {
    return this.selectedOptions.map((option) => option.value).join(', ');
  }

  onSelectChange(event: Event): void {
    const selected = (event.target as HTMLSelectElement).selectedOptions;
    this.selectedOptions = Array.from(selected).map((option) => {
      const code = option.getAttribute('value');
      return this.opcionesDestinatarios.find((o) => o.code == Number(code!));
    });

    this.valEmailDestination(this.selectedOptionsCode());
  }

  selectedOptionsCode(): string {
    return this.selectedOptions.map((option) => option.code).join(',');
  }

  toggleSelectVisibility(): void {
    this.isSelectVisible = !this.isSelectVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.container-multi-select') && this.isSelectVisible) {
      this.isSelectVisible = false;
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  getListTypeComments() {
    //SERVICIO PARA LISTAR LOS
    this.rentasService.getListTypeComments().subscribe({
      next: (response) => {
        this.tipoComentario = response.C_TABLE;

        this.opcionesTipoComentario = this.tipoComentario.map((motivo) => {
          return {
            codigo: motivo.NCODE,
            valor: motivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListDestination(P_SNAME_ACT,P_NTICKET) {
    const data ={
        P_SNAME_ACT:P_SNAME_ACT,
        P_NTICKET:P_NTICKET
    }
    //SERVICIO PARA LISTAR LOS
    this.rentasService.getListDestination(data).subscribe({
      next: (response) => {
        this.destinatarios = response.C_TABLE;

        this.opcionesDestinatarios = this.destinatarios.map((motivo) => {
          return {
            code: motivo.NCODE,
            value: motivo.SDESCRIPT,
          };
        });
        console.log(this.opcionesDestinatarios)
        const validOptions = this.opcionesDestinatarios.filter(option => option.code !== 0);
        if (validOptions.length === 1) {
            console.log(validOptions.length)
          this.selectedOptions = [validOptions[0]];
        } else {
            console.log(validOptions.length)
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  valEmailDestination(P_STYPE_DEST: string) {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_STYPE_DEST: P_STYPE_DEST,
    };
    //SERVICIO PARA LISTAR LOS
    this.rentasService.valEmailDestination(data).subscribe({
      next: (response) => {
        this.P_NCODE = response.P_NCODE;
        this.P_SMESSAGE = response.P_SMESSAGE.split('||').filter(
          (part) => part.trim() !== ''
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  enviar() {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_STYPE_DEST: this.selectedOptionsCode(),
      P_NIDPROFILE: this.NIDPROFILE,
      P_SNAME_ACT: this.SNAME_ACT,
      P_NTYPE: 1,
    };
    this.rentasService.getEmailDestination(data).subscribe({
      next: (response) => {
        if (response.P_NCODE == 0) {
          const commentData = {
            P_NTYPECOMMENT: this.inputs.NCOMMUNICATION_TYPE.codigo,
            P_SCOMMETS: this.inputs.SEMAIL_MESSAGE,
            P_NTICKET: this.ticket.NTICKET,
            P_SEMAIL_MESSAGE: this.inputs.SEMAIL_MESSAGE,
            P_SEMAIL_SUBJECT: this.inputs.SEMAIL_SUBJECT,
            P_NBRANCH: this.ticket.NRAMO,
            P_NPRODUCT: this.ticket.NPRODUCT,
            P_SRECIPIENT_EMAIL: response.C_TABLE[0].SEMAILS,
            P_NMOTIV:
              this.ticket.NMOTIV == undefined
                ? this.ticket.NMOTIVO
                : this.ticket.NMOTIV,
            P_NSUBMOTIV:
              this.ticket.NSUBMOTIV == undefined
                ? this.ticket.NSUBMOTIVO
                : this.ticket.NSUBMOTIV,
            P_NPOLICY: this.ticket.POLIZA,
            P_NUSERCODE: this.NUSERCODE,
            P_NCOMMUNICATION_TYPE: this.inputs.NCOMMUNICATION_TYPE.codigo,
            POPUPDATA: this.POPUPDATA,
            P_STYPE_DEST: this.selectedOptionsCode(),
            P_SNAME_ACT: this.SNAME_ACT,
            P_NIDPROFILE: this.NIDPROFILE,
          };
          console.log(commentData);
          console.log(this.ticket.NMOTIV);
          console.log(this.ticket.NSUBMOTIV);
          this.activeModal.close(commentData);
        } else {
          const mensajeParts: [SweetAlertIcon, string, string] =
            this.separateString(response.P_SMESSAGE);
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
  async validateForm() {
    const mensaje = await this.getMessage(26);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    if (this.POPUPDATA === 3) {
      if (
        this.inputs.NCOMMUNICATION_TYPE.codigo == '' ||
        this.inputs.SEMAIL_MESSAGE == undefined ||
        this.inputs.SEMAIL_MESSAGE == '' ||
        this.selectedOptions[0].code == 0
      ) {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        return;
      }
    } else {
      if (
        this.inputs.NCOMMUNICATION_TYPE.codigo == '' ||
        this.inputs.SEMAIL_MESSAGE == undefined ||
        this.inputs.SEMAIL_MESSAGE == ''
      ) {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        return;
      }
    }
    this.enviar();
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
//   mailSubject;
//   getMailSubject() {
//     const data = {
//         "P_NTICKET": this.ticket.NTICKET,
//         "P_SNAME_ACT": this.SNAME_ACT,
//         "P_NIDPROFILE": this.NIDPROFILE,
//     };
//     this.rentasService.getMailSubject(data).subscribe({
//       next: (response) => {
//         console.log(response);
//         this.mailSubject = response.P_SSUBJECT;
//       },
//       error: (error) => {
//         console.error(error);
//       },
//     });
//   }
    ModalAdjuntar(){
    let modalRef = this.modalService.open(DocumentoModalComponent, {
        size: 'xl',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
        centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.NTICKET = this.ticket.NTICKET;
    modalRef.componentInstance.SCODE = this.ticket.SCODE;
    console.log(this.ticket.SCODE)
    console.log(this.ticket.NTICKET)
    modalRef.result
        .then(() => {
        })
        .catch((error) => {
        console.log('Modal cerrado');
        }); 
    }
}
interface Option {
  code: number;
  value: string;
}
