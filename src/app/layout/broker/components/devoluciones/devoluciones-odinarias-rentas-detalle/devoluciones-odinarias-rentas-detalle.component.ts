import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { OthersService } from '../../../services/shared/others.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { forkJoin, Subscription } from 'rxjs';
import { ComentarioModalComponent } from '../../modals/comentario-modal/comentario-modal.component';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { AccPersonalesConstants } from '../../quote/acc-personales/core/constants/acc-personales.constants';
import { RegistroBeneficiarioModalComponent } from '../../modals/registro-benficiaro-modal/registro-benficiaro-modal.component';
import { DatePipe } from '@angular/common';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-devoluciones-odinarias-rentas-detalle',
  templateUrl: './devoluciones-odinarias-rentas-detalle.component.html',
  styleUrls: ['./devoluciones-odinarias-rentas-detalle.component.css'],
  providers: [NgbModalConfig, NgbModal],
})
export class DevolucionesOdinariasRentasDetalleComponent implements OnInit {
  P_SCODE: string;
  ticket: any = [];
  beneficiaries: any = [];
  history_pol: any = [];
  historyStatus: any = [];
  detallePoliza: any = [];
  doc_registrados: any = [];
  informacionPoliza: any = [];
  NUSERCODE: number;
  NIDPROFILE: number;
  productCanal: number;
  today: any;
  date: any;
  SCODE_JIRA: string;
  suscription: Subscription;
  items: any = [];
  listActions: any = [];
  inputs: any = [];
  edit: boolean = false;
  edit2: boolean = false;
  edit3: boolean = false;
  edit4: boolean = false;
  edit5: boolean = false;
   //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
  editfs: boolean = false;
  mostrarComboAnticipo: boolean = false;
   opcionesAnticipos: any[];
   RANGOINI_ANTI :string;
   RANGOFIN_ANTI :string;
   porcentajeMin;
 //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

  motivos: any[];
  opcionesMotivos: any[];
  submotivos: any[];
  opcionesSubMotivos: any[];
  newBeneficiary: any = [];
  isAddingNew = false;
  fileCant: number;
  fileSize: number;
  fileFormats: string;
  currentPage: number = 1;
  pageSize: number = 10;
  totalStatusHistory: number = 0;
  displayedStatusHistory: any;
  totalPage: number = 0;
  itemsPerPage: number = 10;
  showPagination: boolean = false;
  pestaActiva: number = 1;
  P_NTRANSAC: Number;
  emailUser: string;
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  CONSTANTS: any = AccPersonalesConstants;
  isLoading: boolean = false;
  originalTipoPago: number;
  porcentajeMax;
  porcentajeRegex: RegExp;
  receivers;
  opcionesTipoPagoReceptor;
  tipoPagoReceptor;
  banksOrigin;
  startRecord: number = 0;
  endRecord: number = 0;
  NUSEDNI: any;
  flagAfp: any;
  constructor(
    private router: Router,
    private rentasService: RentasService,
    private route: ActivatedRoute,
    private othersService: OthersService,
    private modalService: NgbModal,
    private datePipe: DatePipe
  ) {}
  async ngOnInit() {
    this.getOpcionesTipoCuenta()
    this.getOpcionesBanco()
    this.paginationHint()
    this.getDatePayment();
    this.isLoading = true;
    this.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
    // this.getEmailUser();
    this.getConfFile();
    this.getFormaPago();
    const date = new Date();
    this.today = this.formatDate(date);
    this.date = new Date()
    console.log(this.date)
    this.P_SCODE = this.route.snapshot.paramMap.get('SCODE');
    this.getTickets();
    try {
      await this.getProductCanal();
      await this.NidProfile();
      this.getListActions(this.P_SCODE);
      this.getListActionsTicket(this.P_SCODE);
    } catch (error) {
      console.error(error);
    }
    this.getColorActions();
    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    //this.getMaxPerAdvance();
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    this.suscription = this.rentasService.refreshDetail$.subscribe(() => {
      this.getTickets();
      this.getListActions(this.P_SCODE);
      this.getListActionsTicket(this.P_SCODE);
      if (this.flagAfp == 1 ){

        this.receivers[0].tipoPagoReceptor = {
            codigo: 2
        };
        console.log(this.receivers[0])

        }
    });

    this.isLoading = false;
  }

  hintHistory:string
  hintPagination:string
  async paginationHint() {
    const mensaje = await this.getMessage(61);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensaje2 = await this.getMessage(62);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
      this.hintHistory = mensajeParts[2];
      this.hintPagination = mensajeParts2[2];

  }

  flagListAfp() {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NUSERCODE: this.NUSERCODE,
    };
    this.rentasService.flagListAfp(data).subscribe({
      next: (response) => {
        this.flagAfp = response.C_TABLE;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
//<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
getMaxPerAdvanceNew() {
  this.porcentajeMax = Number(this.RANGOFIN_ANTI);
  this.porcentajeMin = Number(this.RANGOINI_ANTI);
  console.log("getMaxPerAdvanceNew " + this.RANGOINI_ANTI + "-" + this.RANGOFIN_ANTI);

}
/*+ VALIDA EL REGISTRO DEL RANGO*/
validarRango() {
  if (this.inputs.POR_ANTICIPO != null) {
    if (this.inputs.POR_ANTICIPO < this.porcentajeMin) {
      this.inputs.POR_ANTICIPO = this.porcentajeMin;
    }
    if (this.inputs.POR_ANTICIPO > this.porcentajeMax) {
      this.inputs.POR_ANTICIPO = this.porcentajeMax;
    }
  }
}
/*+ REALIZA LA VALIDACION AL INSTANTE DE ESCRIBIR*/
soloEnterosYRango(event: KeyboardEvent) {
  const tecla = event.key;

  // Bloquear puntos y comas
  if (tecla === '.' || tecla === ',') {
    event.preventDefault();
    return;
  }

  // Solo permitir dígitos
  if (!/^\d$/.test(tecla)) {
    event.preventDefault();
    return;
  }

  // Simula el valor que tendría el input después de presionar la tecla
  const input = event.target as HTMLInputElement;
  const valorActual = input.value;
  const valorFinal = valorActual + tecla;
  const numero = Number(valorFinal);

  // Bloquear si se sale del rango
  if (numero > this.porcentajeMax) {
    event.preventDefault();
    return;
  }
// Bloquear es 0
  if (numero == 0) {
    event.preventDefault();
    return;
  }
  // No bloqueamos el mínimo aquí porque normalmente es imposible escribir algo menor al mínimo
  // al ir construyendo el número
  
}
//<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
  getMaxPerAdvance() {
    const data = {
      P_NUSERCODE: this.NUSERCODE,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    this.rentasService.getMaxPerAdvance(data).subscribe({
      next: (response) => {
        this.porcentajeMax = response.P_PERADVANCE;
        let firstDigit = Number(this.porcentajeMax.toString().charAt(0));
        let secondDigit =
          this.porcentajeMax > 9
            ? Number(this.porcentajeMax.toString().charAt(1))
            : 0;
        // Genera la expresión regular dinámica basada en porcentajeMax
        let porcentajeRegexString;

        if (this.porcentajeMax < 10) {

          //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          //porcentajeRegexString = `^([0-${this.porcentajeMax}](\\.\\d{1,6})?)$`;
          porcentajeRegexString = `^([1-${this.porcentajeMax}](\\.\\d{1,6})?)$`;
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

        } else if (this.porcentajeMax < 100) {
          if (secondDigit === 0) {
            //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            ///porcentajeRegexString = `^([0-9](\\.\\d{1,6})?|${firstDigit}0(\\.\\d{1,6})?|[1-${
            porcentajeRegexString = `^([1-9](\\.\\d{1,6})?|${firstDigit}0(\\.\\d{1,6})?|[1-${
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
              firstDigit - 1
            }]\\d(\\.\\d{1,6})?)$`;
          } else {
                        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            //porcentajeRegexString = `^([0-9](\\.\\d{1,6})?|${firstDigit}[0-${secondDigit}](\\.\\d{1,6})?|[1-${
            porcentajeRegexString = `^([1-9](\\.\\d{1,6})?|${firstDigit}[0-${secondDigit}](\\.\\d{1,6})?|[1-${
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
              firstDigit - 1
            }]\\d(\\.\\d{1,6})?)$`;
          }
        } else {
         //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          //porcentajeRegexString = `^([0-9](\\.\\d{1,6})?|[1-9]\\d(\\.\\d{1,6})?|100(\\.0{1,6})?)$`;
          porcentajeRegexString = `^([1-9](\\.\\d{1,6})?|[1-9]\\d(\\.\\d{1,6})?|100(\\.0{1,6})?)$`;
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        }

        this.porcentajeRegex = new RegExp(porcentajeRegexString);
      },
      error: (error) => {
        console.error(error);
      },
    });
    //   }
    //   getEmailUser() {
    //     this.rentasService.getEmailUser({ P_NUSERCODE: this.NUSERCODE }).subscribe({
    //       next: (response) => {
    //         this.emailUser = response.C_TABLE[0]?.SEMAIL;
    //       },
    //       error: (error) => {
    //         console.error(error);
    //       },
    //     });
  }
  //FUNCION PARA DAR FORMATO A UNA FECHA
  formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = month < 10 ? `0${month}` : month;

    return `${paddedDay}/${paddedMonth}/${year}`;
  }

  //FUNCION PARA CAMBIAR DE PESTAÑA
  cambiarPestana(pestana: number) {
    this.pestaActiva = pestana;
  }

  //FUNCION PARA RETROCEDER A LA BANDEJA
  atras() {
    this.router.navigate(['/extranet/devoluciones-odinarias-rentas']);
  }

  getTickets() {
    //SERVICIO PARA RECUPERAR EL TICKET SELECCIONADO
    this.rentasService.getListTicket({ P_SCODE: this.P_SCODE }).subscribe({
      next: (response) => {
        this.ticket = response.C_TICKET[0];
        this.flagListAfp()
        this.doc_registrados = response.C_ADJUNTOS_REGIS.map((doc) => ({
            ...doc,
            isEditing: false
          }));
        this.historyStatus = response.C_HISTORY_STATUS;
        this.totalStatusHistory = this.historyStatus.length;
        this.sortTickets();
        this.paginateTickets();
        this.showPagination = true;
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        this.getDateMaxRequest();
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

        this.getPolicyData(this.ticket.POLIZA, this.ticket.COD_PRODUCTO);
        this.confirmPayment(this.ticket.NTICKET);
        this.originalTipoPago = this.ticket.TIPO_PAGO;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getPolicyData(poliza: string, cod_producto: string) {
    const data = {
      ramo: '',
      cod_producto: cod_producto,
      poliza: poliza,
    };
    this.rentasService.getPolicyData(data).subscribe({
      next: (response) => {
        this.beneficiaries = response.data[0].listaBeneficiarios;
        this.history_pol = response.data[0].listaEndoso;
        this.detallePoliza = response.data[0].detallePoliza[0];
        this.informacionPoliza = response.data[0].informacionPoliza[0];
         //<iINI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        this.validarAnti(this.informacionPoliza.PRC_ANTICIPO);
        this.getMaxPerAdvanceNew();
         //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        this.updateValidityPolicy()
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  paginateTickets() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.totalStatusHistory
    );
    this.displayedStatusHistory = this.historyStatus.slice(
      startIndex,
      endIndex
    );
    this.getTotalPages();
  }

  changePage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateTickets();
  }

  changeItemsPerPage() {
    this.pageSize = this.itemsPerPage;
    this.currentPage = 1; // Reset to the first page
    this.paginateTickets();
  }

  getTotalPages() {
    this.totalPage = Math.ceil(this.totalStatusHistory / this.itemsPerPage);
    this.startRecord = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endRecord = Math.min(this.startRecord + this.itemsPerPage - 1, this.totalStatusHistory);
  }

  //FUNCION PARA DESCARGAR ARCHIVOS
  async downloadFile(filePath: string) {
    const mensaje = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
//<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    //this.othersService.downloadFile(filePath).subscribe(
    this.rentasService.downloadFile(filePath).subscribe(
//<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >        
      (res) => {
        if (res.StatusCode == 1) {
          Swal.fire(
            'Información',
            this.listToString(res.ErrorMessageList),
            'error'
          );
        } else {
          const newBlob = new Blob([res], { type: 'application/pdf' });

          const navigator: any = window.navigator;
          if (navigator?.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(newBlob);
            return;
          }

          const data = window.URL.createObjectURL(newBlob);

          const link = document.createElement('a');
          link.href = data;

          link.download = filePath.substring(filePath.lastIndexOf('\\') + 1);
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );

          setTimeout(() => {
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        console.log(err);
      }
    );
  }

  listToString(list: string[]): string {
    let output = '';
    if (list != null) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  async uploadFile2(file: File, NTYPEATTACHMENT) {
    console.log(NTYPEATTACHMENT)
    const mensaje = await this.getMessage(22);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const filePath = file.name;
    const fileNameWithoutExtension = file.name.substring(
      0,
      file.name.lastIndexOf('.')
    );
    const extension = file.name.substring(file.name.lastIndexOf('.'));

    // Concatenar el sufijo "-ticket" antes de la extensión
    const fileNameWithSuffix = `${fileNameWithoutExtension}-${this.P_SCODE}${extension}`;
    const formData = new FormData();
    formData.append('file', file);
    this.rentasService.uploadFile(fileNameWithSuffix, formData).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          const data = {
            P_SCODE: this.P_SCODE,
            P_NTICKET: this.ticket.NTICKET,
            P_SNAME: fileNameWithSuffix,
            P_SSIZE: `${(file.size / 1024).toFixed(2)} KB`,
            P_SPATH: res.GenericResponse,
            P_NUSERCODE: this.NUSERCODE,
            P_NTYPEFILE: 1
          };
          const existingDoc = this.doc_registrados.find(
            (doc) => doc.SNAME === fileNameWithSuffix
          );

          existingDoc.SPATH = res.GenericResponse;

          this.rentasService.insTickAdjunt(data).subscribe(
            (res) => {
              existingDoc.NID = res.P_NID
            },
            (err) => {
              Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
            }
          );
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        } else {
          Swal.fire('Información', res.Message, 'error');
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }

  async deleteFileModal(doc, mensaje) {
    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    const mensajeSeparate = this.separateString(mensaje);
    modalRef.componentInstance.mensaje = mensajeSeparate;
    modalRef.result
      .then(() => {
        this.delTickAdjunt(doc);
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }

  async valTblAttachedfile(doc: any) {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NID: doc.NID,
      P_SNAME: doc.SNAME,
    };
    this.rentasService.valTblAttachedfile(data).subscribe((res) => {
      if (res.P_NCODE == 2) {
        this.deleteFileModal(doc, res.P_SMESSAGE);
      } else if(res.P_NCODE == 1){
        const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(res.P_SMESSAGE);
        Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
      } else {
        this.delTickAdjunt(doc);
      }
    });
  }

  async delTickAdjunt(doc: any) {
    this.deleteFile(doc);
    const mensaje = await this.getMessage(11);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    const data2 = {
      P_NID: doc.NID,
      P_SRUTA: doc.SPATH,
    };
    this.rentasService.delTickAdjunt(data2).subscribe(
      (res) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }

  getListActionsTicket(P_SCODE: string) {
    const data = {
      P_SCODE: P_SCODE,
      P_NUSERCODE: this.NUSERCODE,
      P_NPRODUCT: this.productCanal,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    //SERVICIO PARA LISTAR LAS ACCIONES DEL TICKET
    this.rentasService.getListActionsTicket(data).subscribe({
      next: (response) => {
        this.items = response.C_TABLE[0];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getListActions(P_SCODE: string) {
    //SERVICIO PARA LISTAR LAS ACCIONES DEL USUARIO ACTUAL TENIENDO EN CUENTA EL PRODUCTO
    this.rentasService
      .getListActions({
        P_NPRODUCT: this.productCanal,
        P_NIDPROFILE: this.NIDPROFILE,
        P_SCODE: P_SCODE,
      })
      .subscribe({
        next: (response) => {
          this.listActions = response.C_TABLE[0];
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  NidProfile(): Promise<void> {
    //SERVCIO PARA PARA OBTENER EL ID DE PERFIL TENIENDO EN CUENTA EL PRODUCTO
    return new Promise((resolve, reject) => {
      this.rentasService
        .getNidProfile({
          P_NPRODUCT: this.productCanal,
          P_NIDUSER: this.NUSERCODE,
        })
        .subscribe({
          next: (response) => {
            this.NIDPROFILE = response.C_TABLE[0].NIDPROFILE;
            resolve();
          },
          error: (error) => {
            console.error(error);
            reject(error);
          },
        });
    });
  }
  getProductCanal(): Promise<void> {
    return new Promise((resolve, reject) => {
      //SERVICIO PARA RECUPERAR EL PRODUCTO
      this.rentasService.getProductCanal().subscribe({
        next: (response) => {
          this.productCanal = response.NPRODUCT;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
      });
    });
  }
  popupData: number;

  async updStatusTicket(
    P_SCODE_JIRA: string,
    P_SNAME_ACT: string,
    ticket: any
  ) {
    if(P_SNAME_ACT == 'ASIGNAR'){
        this.rentasService
        .EquivalenciaUsuario({ dni: this.NUSEDNI, token: '' })
        .subscribe({
          next: (response) => {
            if(response.numbermsg != 0){
              this.ErrorModal(80)
              return;
            }else{
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
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
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
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
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
            }
          },
          error: (error) => {
            console.error(error);
            return;
          },
        });
     //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >   
    //}else if (P_SNAME_ACT == 'APROBAR') {
    }else if (P_SNAME_ACT == 'APROBAR' || (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {
     //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
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
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
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
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }else{
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
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
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
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
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }
  async confirmModal(dataupdate) {
    const message = await this.getMessage(21);
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
    modalRef.componentInstance.mensaje = mensaje;
    modalRef.result
      .then(() => {
        this.rentasService.valStatusTicket(dataupdate).subscribe({
          next: (response) => {
            if (response.P_NCODE == 0) {
              this.rentasService.updStatusTicketDetail(dataupdate).subscribe({
                next: (response) => {
                  const mensajeParts: [SweetAlertIcon, string, string] =
                    this.separateString(response.P_SMESSAGE);
                  Swal.fire({
                    icon: mensajeParts[0],
                    title: mensajeParts[1],
                    text: mensajeParts[2],
                  });
                  if (response.P_NCODE == 0) {
                    this.P_NTRANSAC = response.P_NTRANSAC;
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
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
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
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
  //FUNCION PARA ABRIR EL MODAL DE COMENTARIO
  async Comment(ticket, popupData, P_SCODE_JIRA, P_SNAME_ACT) {
    const mensaje2 = await this.getMessage(79);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    let modalRef = this.modalService.open(ComentarioModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.NUSERCODE = this.NUSERCODE;
    modalRef.componentInstance.NIDPROFILE = this.NIDPROFILE;
    modalRef.componentInstance.POPUPDATA = popupData;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.ticket = ticket;
    modalRef.componentInstance.SNAME_ACT = P_SNAME_ACT;
    modalRef.result
      .then((commentData) => {
        this.rentasService
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      //.EquivalenciaUsuario({ dni: this.ticket.SDNI_USUARIO_RESP, token: '' })
      .EquivalenciaUsuario({ dni:  this.ticket.SDNI_USUARIO_RESP ? this.ticket.SDNI_USUARIO_RESP :  JSON.parse(localStorage.getItem('currentUser')).dni, token: '' })
      //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      .subscribe({
        next: (response) => {
          if(response.numbermsg != 0){
            console.log("error")
            this.ErrorModal(80)
          }else{
            console.log(response.data[0].COD_USUARIO);
        const dataupdate = {
          P_SCODE_JIRA: P_SCODE_JIRA,
          P_NUSERCODE: this.NUSERCODE,
          P_NIDPROFILE: this.NIDPROFILE,
          P_SNAME_ACT: P_SNAME_ACT,
          P_NTYPECOMMENT: commentData.P_NTYPECOMMENT,
          P_SCOMMETS: commentData.P_SCOMMETS,
        };
        const P_DATA_ENDOSO_RESCATE = {
            ramo: '',
            cod_producto: ticket.COD_PRODUCTO,
            poliza: ticket.POLIZA,
            moneda: ticket.COD_MONEDA,
            monto: ticket.MTO_RESCATE,
            tramite: ticket.SCODE_JIRA,
                  usuario: response.data[0].COD_USUARIO,
          };
          const P_DATA_ENDOSO_HERENCIA = {
            ramo: '',
            cod_producto: ticket.COD_PRODUCTO,
            poliza: ticket.POLIZA,
            ticket: ticket.SCODE_JIRA,
            tipo_pago: ticket.DES_PAGO,
            fec_sol: ticket.FECHA_REGISTRO,
            pension_cal: ticket.MTO_RESCATE,
            pens_no_pagadas: ticket.NNOPAY_PENSIONS,
            pens_fut_no_pagadas: ticket.NFUTURENOPAY_PENSIONS,
            usuario: response.data[0].COD_USUARIO,
            sucesion: 'Sucesion Intestada',
            cod_usuario: response.data[0].COD_USUARIO,
                };

                const P_DATA_ENDOSO_ANTICIPO = {
                  ramo: '',
                  cod_producto: ticket.COD_PRODUCTO,
                  poliza: ticket.POLIZA,
                  moneda: ticket.COD_MONEDA,
                  monto: ticket.MTO_RESCATE,
                  //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                  //tramite: ticket.SCODE_JIRA,
                   ticket: ticket.SCODE_JIRA,
                  //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                  usuario: response.data[0].COD_USUARIO,
                   //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                 pension: ticket.NNOPAY_PENSIONS,
                 fec_sol: ticket.FECHA_SOLICITUD,
                 prc_anticipo: ticket.POR_ANTICIPO,
                 //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                };

                const P_DATA_ENDOSO_DEVOLUCION = {
                  ramo: '',
                  cod_producto: ticket.COD_PRODUCTO,
                  poliza: ticket.POLIZA,
                  moneda: ticket.COD_MONEDA,
                  monto: ticket.MTO_RESCATE,
                  tramite: ticket.SCODE_JIRA,
                  usuario: response.data[0].COD_USUARIO,
                };

                const P_DATA_ENDOSO_FALLECIMIENTO = {
                  ramo: '',
                  cod_producto: ticket.COD_PRODUCTO,
                  poliza: ticket.POLIZA,
                  moneda: ticket.COD_MONEDA,
                  monto: ticket.MTO_RESCATE,
                  tramite: ticket.SCODE_JIRA,
                  tipo_pago: ticket.DES_PAGO,
                  usuario: response.data[0].COD_USUARIO,
                };

                const P_DATA_ENDOSO_RESOLUCION = {
                  ramo: '',
                  cod_producto: ticket.COD_PRODUCTO,
                  poliza: ticket.POLIZA,
                  moneda: ticket.COD_MONEDA,
                  monto: ticket.MTO_RESCATE,
                  tramite: ticket.SCODE_JIRA,
                  usuario: response.data[0].COD_USUARIO,
          };

          //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          //if (P_SNAME_ACT == 'APROBAR') {
            if (P_SNAME_ACT == 'APROBAR'|| (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            this.isLoading = true;
            const data = {
              P_NTICKET: ticket.NTICKET,
              P_SCODE: this.P_SCODE,
              cod_submotivo: ticket.NSUBMOTIVO,
              P_SSUBMOTIVO: ticket.SUBMOTIVO,
              P_SPRODUCTO: ticket.PRODUCTO,
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                //FECHA_RECEPCION: ticket.FECHA_RECEPCION,
                FECHA_RECEPCION: ticket.FECHA_SOLICITUD,
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
              P_DATA_UPDATE: dataupdate,
              P_DATA_ENDOSO_RESCATE: P_DATA_ENDOSO_RESCATE,
              P_DATA_ENDOSO_HERENCIA: P_DATA_ENDOSO_HERENCIA,
                    P_DATA_ENDOSO_ANTICIPO: P_DATA_ENDOSO_ANTICIPO,
                    P_DATA_ENDOSO_DEVOLUCION: P_DATA_ENDOSO_DEVOLUCION,
                    P_DATA_ENDOSO_FALLECIMIENTO: P_DATA_ENDOSO_FALLECIMIENTO,
                    P_DATA_ENDOSO_RESOLUCION: P_DATA_ENDOSO_RESOLUCION,
            };
          this.rentasService.aprobarTicketDetail(data).subscribe({
            next: async (response) => {
            this.isLoading = false;
            //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
             if (response.P_NCODE == 0 && (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {
              this.P_NTRANSAC = 0;
                if (commentData.POPUPDATA == 3) {
                    this.insDataEmail(commentData);
                }
            }
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
              if (response.P_SMESSAGE.includes('||')) {
                const mensajeParts: [SweetAlertIcon, string, string] =
                  this.separateString(response.P_SMESSAGE);
                Swal.fire({
                  icon: mensajeParts[0],
                  title: mensajeParts[1],
                  text: mensajeParts[2],
                });
              } else {
                const mensaje = await this.getMessage(response.P_NCODE);
                const mensajeParts = this.separateString(mensaje);
                Swal.fire({
                  icon: mensajeParts[0],
                  title: mensajeParts[1],
                  text: response.P_SMESSAGE,
                });
              }
            },
            error: (error) => {
              console.error(error);
              this.isLoading = false;
              Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
            },
          });
        } else {
            this.isLoading = false;
          this.rentasService.updStatusTicketDetail(dataupdate).subscribe({
            next: (response) => {
              const mensajeParts: [SweetAlertIcon, string, string] =
                this.separateString(response.P_SMESSAGE);
              if (response.P_NCODE == 0) {
                this.P_NTRANSAC = response.P_NTRANSAC;
                if (commentData.POPUPDATA == 3) {
                  this.insDataEmail(commentData);
                }
              }
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
              this.isLoading = false;
            },
            error: (error) => {
              console.error(error);
            },
          });
        }

          }
        },
        error: (error) => {
            this.isLoading = false;
          console.error(error);
        },
      });
      })
      .catch((error) => {
        this.isLoading = false;
        console.log('Modal cerrado');
      });
  }
  //FUNCION PARAR ABIR UNA URL EN OTRA PESTAÑA
  openLink(url: string): void {
    window.open(url, '_blank');
  }

  edit_fields() {
    this.edit = true;
  }
  confirm_edit_fields() {
    this.updtTicketDescript();
    this.edit = false;
  }
  cancel_edit_fields() {
    this.edit = false;
  }

  edit_fields2() {
    this.getMotivos();
    this.opcionesSubMotivos = [
      {
        codigo: 0,
        valor: '- SELECCIONE -',
      },
    ];
    this.getSubMotivos(this.ticket.NMOTIVO);
    this.edit2 = true;
  }
  confirm_edit_fields2() {
    this.updtTicketNmotiv();
  }
  cancel_edit_fields2() {
    this.edit2 = false;
  }


  //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
  FechaInicioSol:Date
  FechaFinSol:Date
   edit_fieldsfs() {
    this.inputs.FECHA_SOLICITUD = this.fechaSol;
    this.editfs = true;
  }
 async confirm_edit_fieldsfs() {
    this.editfs = false;
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_DREQUEST: this.convertToDate(this.inputs.FECHA_SOLICITUD),
      P_NUSERCODE: this.NUSERCODE,
    };

  this.rentasService.updTicketRequest(data).subscribe({
      next: (response) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(response.P_SMESSAGE);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
 cancel_edit_fieldsfs() {
    this.editfs = false;
    this.ticket.TIPO_PAGO = this.originalTipoPago;
    this.inputs.P_TYPE_SEARCH = this.originalTipoPago;
  }
  get fechaSol(): string {
    ///this.FechaInicioSol = new Date();
    //const fechaFormateada = this.datePipe.transform(this.FechaInicioSol, 'dd/MM/yyyy');
    return this.ticket.FECHA_SOLICITUD ? this.ticket.FECHA_SOLICITUD : null;
  }

  set fechaSol(value: string) {
    this.ticket.FECHA_SOLICITUD = value;
  }
  getDateMaxRequest() {
    this.rentasService.getDateMaxRequest().subscribe({
        next: (response) => {
            const ndays_fin = response.C_TABLE[0].NDAYS_FIN;
            const ndays_ini = response.C_TABLE[0].NDAYS_INI;
            const fechaString = this.ticket.FECHA_RECEPCION; // formato: dd/MM/yyyy
            const [dia, mes, anio] = fechaString.split('/').map(Number);

            // Recuerda: el mes en JavaScript va de 0 (enero) a 11 (diciembre)
            this.FechaFinSol = new Date(anio, mes-1, dia);
            this.FechaInicioSol = new Date(anio, mes-1, dia);
            this.FechaFinSol.setDate(this.FechaFinSol.getDate() + (ndays_fin));
            this.FechaInicioSol.setDate(this.FechaInicioSol.getDate() - (ndays_ini));

        },
        error: (error) => {
            console.error(error);
        },
    });
}
 //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >


  edit_fields3() {
    this.getTypePayment();
    this.inputs.POR_ANTICIPO = this.ticket.POR_ANTICIPO;
    this.inputs.FECHA_PAGO = this.fechaPago;
     //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    this.convierteCombo();
     //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    
    this.edit3 = true;
  }
  async confirm_edit_fields3() {
    this.edit3 = false;
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_DPAYDATE: this.convertToDate(this.inputs.FECHA_PAGO),
       //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
       //P_NADVANCE_PERCENT: this.inputs.POR_ANTICIPO || 0,
      P_NADVANCE_PERCENT:  this.mostrarComboAnticipo ? this.inputs.POR_ANTICIPO.codigo: this.inputs.POR_ANTICIPO || 0,
       //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      P_NTYP_PAY: this.inputs.P_TYPE_SEARCH?.codigo || 0,
      //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      P_BCELL_PORCANTICIPO :  this.listActions.PORC_ANTICIPO == 'TRUE' ?  this.listActions.CELL_PORCANTICIPO : 'FALSE',
      //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    };
    this.rentasService.updTicketPayment(data).subscribe({
      next: (response) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(response.P_SMESSAGE);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  cancel_edit_fields3() {
    this.edit3 = false;
    this.ticket.TIPO_PAGO = this.originalTipoPago;
    this.inputs.P_TYPE_SEARCH = this.originalTipoPago;
  }

  edit_fields4() {
    this.edit4 = true;
    this.inputs.CORREO_ELECTRONICO_CONT = this.ticket.CORREO_ELECTRONICO_CONT;
  }
  confirm_edit_fields4() {
    this.edit4 = false;
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_SEMAIL: this.inputs.CORREO_ELECTRONICO_CONT,
    };
    this.rentasService.updTicketEmail(data).subscribe({
      next: (response) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(response.P_SMESSAGE);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  cancel_edit_fields4() {
    this.edit4 = false;
  }

  edit_fields5(receiver) {
    this.receivers.forEach(r => (r.isEditing = false)); // Deshabilitar edición en todas las filas
    receiver.isEditing = true; // Habilitar edición en la fila seleccionada

    if (receiver.COD_BANCO != null && receiver.COD_TIPO_CUENTA) {
      this.inputs.COD_BANCO = { codigo: receiver.COD_BANCO };
      this.inputs.COD_BANCO.codigo = receiver.COD_BANCO;
      this.inputs.TIPO_CUENTA = { codigo: receiver.COD_TIPO_CUENTA };
      this.inputs.TIPO_CUENTA.codigo = receiver.COD_TIPO_CUENTA;
    }
    this.inputs.NUM_CUENTA = receiver.NUM_CUENTA;
    this.inputs.NUM_CUENTA_CCI = receiver.NUM_CUENTA_CCI;
  }

  async confirm_edit_fields5(index) {
    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    this.isLoading = true;
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    // Obtener el receptor seleccionado
    const receiver = this.receivers[index];
    console.log(receiver)
    console.log(this.inputs)
    // Actualizar los campos del receptor seleccionado
    receiver.COD_TIPO_CUENTA = this.inputs.TIPO_CUENTA.codigo;
    receiver.COD_BANCO = this.inputs.COD_BANCO.codigo;
    receiver.NUM_CUENTA = this.inputs.NUM_CUENTA;
    receiver.NUM_CUENTA_CCI = this.inputs.NUM_CUENTA_CCI;

    // Preparar los datos para la validación
        const dataVal = {
          P_NTICKET: this.ticket.NTICKET,
          P_SCLIENAME: receiver.NOMBRE,
          P_NTYPEDOCU: receiver.COD_TIPO_IDEN,
          P_SCLIENDOCU: receiver.NUM_TIPO_IDEN,
          P_NUSERCODE: this.NUSERCODE,
          P_NTPAYWAY: receiver.tipoPagoReceptor?.codigo,
          P_SCODE_DESTINY_BANK: receiver.COD_BANCO,
          P_NTYPEACC: receiver.COD_TIPO_CUENTA,
        P_SACCNUM: receiver.NUM_CUENTA?.trim() ?? '',
        P_SCCIACC: receiver.NUM_CUENTA_CCI?.trim() ?? '',
    };

        console.log(dataVal);

    // Validar los datos
        const response = await this.rentasService.valTicketCotizaDet(dataVal).toPromise();

        if (response.P_NCODE !== 0) {
          const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(response.P_SMESSAGE);
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
          this.isLoading = false;
          return;
    } else if (response.P_NCODE === 0) {
        // Actualizar los datos del receptor
            const data = {
                P_NTICKET: this.ticket.NTICKET,
                P_NTRANSAC: receiver.NTRANSAC,
                P_SCODE_DESTINY_BANK: receiver.COD_BANCO,
            P_SACCNUM: receiver.NUM_CUENTA?.trim() ?? '',
                P_NTYPEACC: receiver.COD_TIPO_CUENTA,
            P_SCCIACC: receiver.NUM_CUENTA_CCI?.trim() ?? '',
                P_STITULARNAME: "",
                P_NTYPDOCID: "",
            P_SNUMDOCID: "",
        };
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        //this.updTblPdTicketCotizaDet(data);
        if (
          receiver.COD_PARENTESCO?.trim() != null &&
          receiver.COD_PARENTESCO?.trim() != ''
        ) {
          console.log('ENTRO A API DE DATOSBANCARIOS');
          const dataclienteOne = {
            NUM_TIPO_IDEN: receiver.NUM_TIPO_IDEN,
            COD_PARENTESCO: receiver.COD_PARENTESCO,
            COD_BANCO: receiver.COD_BANCO,
            COD_TIPO_CUENTA: receiver.COD_TIPO_CUENTA,
            NUM_CUENTA: receiver.NUM_CUENTA?.trim() ?? '',
            NUM_CUENTA_CCI: receiver.NUM_CUENTA_CCI?.trim() ?? '',
          };
          console.log(dataclienteOne);
          this.rentasService
            .EquivalenciaUsuario({
              dni: this.ticket.SDNI_USUARIO_RESP,
              token: '',
            })
            .subscribe({
              next: (response) => {
                const dataEndosoDatosBancarios = {
                  ramo: '',
                  cod_producto: this.ticket.COD_PRODUCTO,
                  poliza: this.ticket.POLIZA,
                  usuario: response.data[0].COD_USUARIO,
                  datacliente: [dataclienteOne],
                };
                console.log(dataEndosoDatosBancarios);
                //REALIZA EL ENDOSO DE MODIFICACION DE DATOS BANCARIOS
                this.rentasService
                  .ENDOSODATOSBANCARIOS(dataEndosoDatosBancarios)
                  .subscribe({
                    next: (response) => {
                      if (response.numbermsg == 0) {
                        this.updTblPdTicketCotizaDet(data);
                        this.isLoading = false;
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'Ups',
                          text: response.msg,
                        });
                        this.isLoading = false;
                      }
                    },
                    error: (error) => {
                      console.error(error);
                      this.isLoading = false;
                    },
                  });
              },
              error: (error) => {
                console.error(error);
                this.isLoading = false;
              },
            });
        } else {
          console.log('TIENE QUE SE REGISTRO DE HEREDEROS');
          //this.registroHerederosObs();
          this.rentasService
            .EquivalenciaUsuario({
              dni: this.ticket.SDNI_USUARIO_RESP,
              token: '',
            })
            .subscribe({
              next: (response) => {
                const formattedData2 = this.receivers.map((receiver) => ({
                  coD_TIPOIDEN: receiver.COD_TIPO_IDEN,
                  nuM_IDEN: receiver.NUM_TIPO_IDEN,
                  nombrE1: receiver.NOMBRE.split(' ')[0] || '',
                  nombrE2: receiver.NOMBRE.split(' ')[1] || '',
                  appaterno: receiver.NOMBRE.split(' ')[2] || '',
                  apmaterno: receiver.NOMBRE.split(' ')[3] || '',
                  direccion: '',
                  coD_DIRECCION: '',
                  fono: '',
                  correo: '',
                  coD_SEXO: '',
                  feC_NAC: '',
                  coD_TIPO: '',
                  ocupacion: '',
                  mtO_PENSION: '',
                  prC_PENSION: receiver.PRC_PENSION || '',
                  coD_VIAPAGO: receiver.tipoPagoReceptor.codigo || '',
                  VIA_PAGO: receiver.tipoPagoReceptor.text || '',
                  coD_BANCO: receiver.COD_BANCO || '',
                  banco:
                    this.opcionesBanco?.find(
                      (op) => op.codigo === receiver.COD_BANCO
                    )?.valor || '',
                  coD_TIPCUENTA: receiver.COD_TIPO_CUENTA || '',
                  TIPO_CUENTA:
                    this.opcionesTipoCuenta?.find(
                      (op) => op.codigo === receiver.COD_TIPO_CUENTA
                    )?.valor || '',
                  nuM_CUENTA: receiver.NUM_CUENTA || '',
                  nuM_CUENTA_CCI: receiver.NUM_CUENTA_CCI || '',
                  nuM_DOCUPAGO: '',
                }));

                const dataH = {
                  coD_TIPPROD: this.ticket.COD_PRODUCTO,
                  nuM_POLIZA: this.detallePoliza.NUM_POLIZA,
                  coD_USUARIOCREA: response.data[0].COD_USUARIO,
                  monto: this.ticket.IMP_DEVOLUCION || 0,
                  data: formattedData2,
                };

                console.log(dataH);
                this.rentasService.registroHerederos(dataH).subscribe({
                  next: (response) => {
                    console.log(response);
                    if (response.numbermsg == 0) {
                      this.updTblPdTicketCotizaDet(data);
                      this.isLoading = false;
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Ups',
                        text: response.msg,
                      });
                    }
                    this.isLoading = false;
                  },
                  error: (error) => console.error(error),
                });
              },
              error: (error) => {
                console.error(error);
                this.isLoading = false;
              },
            });
        }
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            }

    // Deshabilitar edición en el receptor seleccionado
    receiver.isEditing = false;
}

  cancel_edit_fields5() {
    this.receivers.forEach(r => (r.isEditing = false)); // Deshabilitar edición en todas las filas
        }

  edit_fields6(receiver) {
    console.log("Hola");

    // Guardar una copia del receptor antes de editarlo
    receiver.originalData = { ...receiver };

    this.receivers.forEach(r => (r.isEditing = false)); // Deshabilitar edición en todas las filas
    receiver.isEditing = true; // Habilitar edición en la fila seleccionada
    console.log(this.receivers);

    if (receiver.COD_BANCO != null && receiver.COD_TIPO_CUENTA) {
        this.inputs.COD_BANCO = { codigo: receiver.COD_BANCO };
        this.inputs.TIPO_CUENTA = { codigo: receiver.COD_TIPO_CUENTA };
      }

    this.inputs.NUM_CUENTA = receiver.NUM_CUENTA;
    this.inputs.NUM_CUENTA_CCI = receiver.NUM_CUENTA_CCI;
}

async confirm_edit_fields6(index) {
    const receiver = this.receivers[index];

    // Actualizar los campos del receptor seleccionado
    receiver.COD_TIPO_CUENTA = this.inputs.TIPO_CUENTA.codigo;
    receiver.COD_BANCO = this.inputs.COD_BANCO.codigo;
    receiver.NUM_CUENTA = this.inputs.NUM_CUENTA;
    receiver.NUM_CUENTA_CCI = this.inputs.NUM_CUENTA_CCI;

    const dataVal = {
        P_NTICKET: this.ticket.NTICKET,
        P_SCLIENAME: receiver.NOMBRE,
        P_NTYPEDOCU: receiver.COD_TIPO_IDEN,
        P_SCLIENDOCU: receiver.NUM_TIPO_IDEN,
        P_NUSERCODE: this.NUSERCODE,
        P_NTPAYWAY: receiver.tipoPagoReceptor?.codigo,
        P_SCODE_DESTINY_BANK: receiver.COD_BANCO,
        P_NTYPEACC: receiver.COD_TIPO_CUENTA,
        P_SACCNUM: receiver.NUM_CUENTA?.trim() ?? '',
        P_SCCIACC: receiver.NUM_CUENTA_CCI?.trim() ?? '',
    };

    console.log(dataVal);

    const response = await this.rentasService.valTicketCotizaDet(dataVal).toPromise();

    if (response.P_NCODE !== 0) {
        const mensajeParts = this.separateString(response.P_SMESSAGE);
        Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
        });
        return;
    } else if (response.P_NCODE === 0) {
        this.registroHerederos("editar");
    }

    // Deshabilitar edición en el receptor seleccionado
    receiver.isEditing = false;

    // Eliminar la copia original ya que los cambios fueron confirmados
    delete receiver.originalData;
}

    cancel_edit_fields6(receiver) {
        if (receiver.originalData) {
            // Restaurar los valores originales
            Object.assign(receiver, receiver.originalData);
            delete receiver.originalData; // Eliminar la copia después de restaurarla
        }
        // Deshabilitar edición en todas las filas
        this.receivers.forEach(r => (r.isEditing = false));
    }

    cancel_edit() {
        this.receivers.forEach(receiver => {
            if (receiver.originalData) {
                // Restaurar los valores originales
                Object.assign(receiver, receiver.originalData);
                delete receiver.originalData; // Eliminar la copia después de restaurarla
            }
            // Deshabilitar edición en todas las filas
            receiver.isEditing = false;
        });
  }


  eliminarHeredero(receiver) {
    console.log(this.receivers)

    this.receivers = this.receivers.filter(r => r !== receiver);
    console.log(this.receivers)

    this.registroHerederos("eliminar")
  }

  eliminarNuevoHeredero(receiver) {
    console.log(this.nuevoBeneficiario)
    this.nuevoBeneficiario = this.nuevoBeneficiario.filter(r => r !== receiver);
    console.log(this.nuevoBeneficiario)

  }


  async onFileSelected(event: any, P_SCODE: string) {
    const mensaje = await this.getMessage(24);
    const mensaje2 = await this.getMessage(23);
    const mensaje3 = await this.getMessage(25);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    const mensajeParts3: [SweetAlertIcon, string, string] =
      this.separateString(mensaje3);

    const fileInput = event.target;
    const allowedExtensions = this.fileFormats.split(',');
    const file: File = fileInput.files[0];

    const extension = file.name
      .substring(file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: `${mensajeParts[2]} ${this.getDisplayFileFormats()}.`,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (this.doc_registrados.length >= this.fileCant) {
      Swal.fire({
        icon: mensajeParts2[0],
        title: mensajeParts2[1],
        text: mensajeParts2[2] + this.fileCant,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (file) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > this.fileSize) {
        Swal.fire({
          icon: mensajeParts3[0],
          title: mensajeParts3[1],
          text: `${mensajeParts3[2]} ${this.fileSize} KB.`,
        });
        fileInput.value = ''; // Limpiar el input
        return;
      }

      const fileNameWithoutExtension = file.name.substring(
        0,
        file.name.lastIndexOf('.')
      );
      const extension = file.name.substring(file.name.lastIndexOf('.'));

      // Concatenar el sufijo "-ticket" antes de la extensión
      const fileNameWithSuffix = `${fileNameWithoutExtension}-${P_SCODE}${extension}`;
      const existingDocIndex = this.doc_registrados.findIndex(
        (doc) => doc.SNAME === fileNameWithSuffix
      );
      if (existingDocIndex !== -1) {
        // Si ya existe un documento con el mismo nombre, llama a la función eliminar
        this.eliminar(this.doc_registrados[existingDocIndex]);
      }

      const newDoc = {
        file: file,
        SNAME: fileNameWithSuffix,
        SSIZE: `${fileSizeKB.toFixed(2)} KB`,
        SPATH: URL.createObjectURL(file),
        isNew: true,
      };

      this.doc_registrados.push(newDoc);
    }
    fileInput.value = '';
  }

  eliminar(doc: any) {
    // Aquí va la lógica para eliminar el documento
    this.rentasService.delTickAdjunt(doc.NID);
    const index = this.doc_registrados.indexOf(doc);
    if (index !== -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA ELIMINAR UN DOCUMENTO
  deleteFile(doc: any) {
    const index = this.doc_registrados.indexOf(doc);
    if (index > -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA SUBIR EL DOCUMETO
  uploadFile(doc: any) {
    doc.isNew = false;
  }

  showNewBeneficiaryForm() {
    this.isAddingNew = true;
  }
  addBeneficiary() {
    const newBeneficiary = {
      NOMBRES: this.newBeneficiary.NOMBRES,
      NRO_IDENTIDAD: this.newBeneficiary.NRO_IDENTIDAD,
      PARENTESCO: this.newBeneficiary.PARENTESCO,
      PROC_PENSION: this.newBeneficiary.PROC_PENSION,
      TIPO_PAGO: this.newBeneficiary.TIPO_PAGO?.valor,
      TIPO_CUENTA: this.newBeneficiary.TIPO_CUENTA?.valor,
      BANCO_ORIGEN: this.newBeneficiary.BANCO_ORIGEN?.valor,
      CUENTA_BANCARIA: this.newBeneficiary.CUENTA_BANCARIA,
      CCI: this.newBeneficiary.CCI,
      TITULAR_CUENTA: this.newBeneficiary.TITULAR_CUENTA,
    };
    this.beneficiaries.push(newBeneficiary);
    this.isAddingNew = false;
    this.newBeneficiary.NOMBRES = '';
    this.newBeneficiary.NRO_IDENTIDAD = '';
    this.newBeneficiary.PARENTESCO = '';
    this.newBeneficiary.TIPO_PAGO = '';
    this.newBeneficiary.TIPO_CUENTA = '';
    this.newBeneficiary.BANCO_ORIGEN = '';
    this.newBeneficiary.CUENTA_BANCARIA = '';
    this.newBeneficiary.CCI = '';
    this.newBeneficiary.TITULAR_CUENTA = '';
  }

  async calcular() {
    this.isLoading = true;
     //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    //REALIZA LA VALIDACION DE FECHA DE SOLICITUD
    const dataValFS = {
            P_NTICKET: this.ticket.NTICKET,
            P_NUSERCODE: this.NUSERCODE
          };
    this.rentasService.valDateRequest(dataValFS).subscribe({
    next: (response) => {
        if (response.P_NCODE !== 0) {
        this.isLoading = false;
        const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(response.P_SMESSAGE);
        Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
        });
      return;
    }else {
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >


    const data = {
      ramo: '',
      cod_producto: this.ticket.COD_PRODUCTO,
      poliza: this.ticket.POLIZA,
      cod_submotivo: this.ticket.NSUBMOTIVO,
      num_documento: '',
      cod_tipodocumento: '',
//<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      //FECHA_RECEPCION: this.ticket.FECHA_RECEPCION,
      FECHA_RECEPCION: this.ticket.FECHA_SOLICITUD,
       prc_anticipo: this.ticket.POR_ANTICIPO
     //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
     //

    };
    //SERVICIO QUE RETORNA EL IMPORTE Y LA MONEDA
    this.rentasService.getCalculationAmount(data).subscribe({
      next: (response) => {
        if (response.numbermsg == 0) {
          if (response.data[0].NOPAGADAS !== null && response.data[0].NOPAGADASFUTURAS !== null ||response.data[0].VALRENTASPENDIENTES !== null && response.data[0].VALRENTASFUTURAS !== null) {
            console.log(response)

            this.rentasService
              .updTicketPensions({
                P_NTICKET: this.ticket.NTICKET,
                P_NNOPAY_PENSIONS:
                response.data[0].NOPAGADAS ||
                 //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                  response.data[0].MTO_PENSION ||
                  //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                response.data[0].VALRENTASPENDIENTES,
                P_FUTURENOPAY_PENSIONS: response.data[0].NOPAGADASFUTURAS || response.data[0].VALRENTASFUTURAS,
              })
              .subscribe({
                next: (response) => {
                  console.error(response);
                },
                error: (error) => {
                  console.error(error);
                  this.isLoading = false;
                },
              });
          }
          if(response.data[0].MTO_RESCATE !== this.ticket.MTO_RESCATE || response.data[0].MONEDA !== this.ticket.COD_MONEDA){
            this.verificarDatosPago()
          }

          const data2 = {
            P_NTICKET: this.ticket.NTICKET,
            P_IMPORTE:
              response.data[0].MTO_RESCATE ||
               response.data[0].TOTAL ||
                response.data[0].MTO_DEVOLUCION ||
              //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
              response.data[0].MTO_ANTICIPO ||
              //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                response.data[0].MTO_TOTAL,
            P_MONEDA:
              response.data[0].COD_MONEDA || response.data[0].MONEDA,
          };
          //SERVICIO QUE ACTUALIZA EL IMPORTE Y LA MONEDA DEL TICKET
          this.rentasService.updAmountTicketDetail(data2).subscribe({
            next: (response) => {
              const mensajeParts: [SweetAlertIcon, string, string] =
                this.separateString(response.P_SMESSAGE);
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
              this.isLoading = false;
            },
            error: (error) => {
              console.error(error);
              this.isLoading = false;
            },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Ups',
            text: response.msg,
          });
          const data2 = {
            P_NTICKET: this.ticket.NTICKET,
            P_IMPORTE:
              0,
            P_MONEDA:
              ""
          };
          //SERVICIO QUE ACTUALIZA EL IMPORTE Y LA MONEDA DEL TICKET
          this.rentasService.updAmountTicketDetail(data2).subscribe({
            next: (response) => {
              const mensajeParts: [SweetAlertIcon, string, string] =
                this.separateString(response.P_SMESSAGE);
              this.isLoading = false;
            },
            error: (error) => {
              console.error(error);
              this.isLoading = false;
            },
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      },
    });

     //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    }
  },
  error: (error) => {
    console.error(error);
    this.isLoading = false;
  },
});
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
  }


  async updtTicketDescript() {
    const mensaje2 = await this.getMessage(29);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_SDESCRIPT: this.ticket.DESCRIPCION,
    };

    this.rentasService.updtTicketDescript(data).subscribe({
      next: (res) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(res.P_SMESSAGE);

        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      },
    });
  }

  getMotivos() {
    //SERVICIO PARA LISTAR LOS MOTIVOS
    this.rentasService.getListMotivos().subscribe({
      next: (response) => {
        this.motivos = response.C_TABLE;

        this.opcionesMotivos = this.motivos.map((motivo) => {
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

  getSubMotivos(P_NMOTIVO) {
    //SERVICIO PARA LISTAR LOS SUBMOTIVOS
    this.rentasService.getListSubMotivos({ P_NMOTIVO: P_NMOTIVO }).subscribe({
      next: (response) => {
        this.submotivos = response.C_TABLE;

        this.opcionesSubMotivos = this.submotivos.map((submotivo) => {
          return {
            codigo: submotivo.NCODE,
            valor: submotivo.SDESCRIPT,
          };
        });
        this.inputs.P_SSUBMOTIVO = {};
        this.inputs.P_SSUBMOTIVO.codigo = this.ticket.NSUBMOTIVO;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  changeMotivo(P_NMOTIVO) {
    //SERVCIO PARA LISTAR LOS SUBMOTIVOS SEGUN EL MOTIVO SELECCIONADO
    this.getSubMotivos(P_NMOTIVO.codigo);
  }

  async updtTicketNmotiv() {
    const mensaje2 = await this.getMessage(30);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NMOTIV: this.inputs.P_NMOTIVO.codigo,
      P_NSUBMOTIV: this.inputs.P_SSUBMOTIVO.codigo,
    };
    this.rentasService.updtTicketNmotiv(data).subscribe({
      next: (res) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(res.P_SMESSAGE);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        if (res.P_NCODE == 0) {
          this.ticket.MOTIVO = this.inputs.P_NMOTIVO.valor;
          this.ticket.SUBMOTIVO = this.inputs.P_SSUBMOTIVO.valor;
          this.edit2 = false;
        }
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      },
    });
  }

  getConfFile() {
    this.rentasService.getConfFile().subscribe({
      next: (res) => {
        this.fileCant = Number(res.C_TABLE[0].FILE_CANT_TK);
        this.fileSize = Number(res.C_TABLE[0].FILE_SIZE);
        this.fileFormats = res.C_TABLE[0].FILE_FORMATS;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getAcceptedFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }
    return this.fileFormats
      .split(',')
      .map((ext) => `.${ext}`)
      .join(',');
  }

  getDisplayFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }

    const formats = this.fileFormats.split(',');
    if (formats.length > 1) {
      const lastFormat = formats.pop();
      return formats.join(', ') + ' y ' + lastFormat;
    } else if (formats.length === 1) {
      return formats[0];
    } else {
      return '';
    }
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
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.atras();
    }
  }

  insDataEmail(dataEmail) {
    const data = {
    P_NTICKET: dataEmail.P_NTICKET,
      P_SEMAIL_MESSAGE: dataEmail.P_SEMAIL_MESSAGE,
      P_SEMAIL_SUBJECT: dataEmail.P_SEMAIL_SUBJECT,
      P_SRECIPIENT_EMAIL: dataEmail.P_SRECIPIENT_EMAIL,
      P_NBRANCH: dataEmail.P_NBRANCH,
      P_NPRODUCT: dataEmail.P_NPRODUCT,
      P_NMOTIV: dataEmail.P_NMOTIV,
      P_NSUBMOTIV: dataEmail.P_NSUBMOTIV,
      P_NPOLICY: dataEmail.P_NPOLICY,
      P_NUSERCODE: this.NUSERCODE,
      P_NCOMMUNICATION_TYPE: dataEmail.P_NCOMMUNICATION_TYPE,
      P_STYPE_DEST: dataEmail.P_STYPE_DEST,
      P_SNAME_ACT: dataEmail.P_SNAME_ACT,
      P_NIDPROFILE: dataEmail.P_NIDPROFILE,
      P_SSENDER: JSON.parse(localStorage.getItem('currentUser')).email,
      P_NTRANSAC: this.P_NTRANSAC,
    };
    this.rentasService.insDataEmail(data).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error(error);
      },
    });
  }

  sortTickets() {
    if (this.sortField) {
      this.historyStatus.sort((a, b) => {
        let fieldA = a[this.sortField];
        let fieldB = b[this.sortField];
        if (this.sortField === 'FECHA_REGISTO') {
          // Convert dates to timestamps for comparison
          fieldA = new Date(fieldA).getTime();
          fieldB = new Date(fieldB).getTime();
        }
        if (fieldA < fieldB) {
          return this.sortOrder === 'asc' ? -1 : 1;
        } else if (fieldA > fieldB) {
          return this.sortOrder === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
    this.paginateTickets();
  }

  //FUNCION PARA ORDENAR DE MANERA ASCENDENTE O DESCENDENTE LAS COLUMNAS
  setSortField(field: string) {
    if (this.sortField === field) {
      // Toggle sort order if the same field is selected
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc'; // Default to ascending order
    }
    this.sortTickets();
  }

  ColorActions: any = [];
  getColorActions() {
    const data = {
      P_NUSERCODE: this.NUSERCODE,
      P_NPRODUCT: this.productCanal,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    this.rentasService.getColorActions(data).subscribe({
      next: (response) => {
        this.ColorActions = response.C_TABLE[0];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  confirmado: boolean = false;
  cohinciden: boolean = true;
  confirmarReceptor() {
    this.insTicketCotizaDet();
  }

  async guardarHerederos() {
    // Verificar si alguno tiene activo en false
    const inactivo = this.nuevoBeneficiario.some((beneficiario) => beneficiario.activo === false);
    if (inactivo) {
        const mensaje = await this.getMessage(88);
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(mensaje);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      return; // Detener la ejecución si hay algún inactivo
    }
    // Si todos están activos, proceder con el registro
    this.registroHerederos();
  }


  updateValidityPolicy(){
    const SDOC_AFP = this.receivers[0].RECEPTOR == "AFP" ? this.receivers[0].NUM_TIPO_IDEN :""
    this.rentasService.updateValidityPolicy({P_NTICKET: this.ticket.NTICKET, P_SSTARTDATE: this.informacionPoliza.FEC_INIVIGENCIA, P_SEXPIRDAT: this.informacionPoliza.FEC_FINVIGENCIA, P_SPENSIONTYPE: this.informacionPoliza.COD_TIPOPEN,P_SDOC_AFP: SDOC_AFP, P_SCUSDPP: this.informacionPoliza.CUSPP}).subscribe({
        next: (response) => {
            console.log(response)
          },
          error: (error) => {
            console.error(error);
          },
    })
  }
  //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    /*+ PROCEDE A VALIDAR SI VIENE CON RANGO O SELECCION*/
    validarAnti( valanticior:String){
    if (this.listActions.PORC_ANTICIPO == 'TRUE'){
        if (valanticior.includes(',')) {
            this.mostrarComboAnticipo = true;
            console.log("ANTICIPO COMA");
        } else if (valanticior.includes('-')) {
            this.mostrarComboAnticipo = false;
        console.log("ANTICIPO GUION");
         const RangoAnt = valanticior.split('-');
            this.RANGOINI_ANTI = RangoAnt[0];
            this.RANGOFIN_ANTI = RangoAnt[1];
        console.log("ANTICIPO GUION"+this.RANGOINI_ANTI + "*"+ this.RANGOFIN_ANTI);
        }else{
            this.mostrarComboAnticipo = false;
            console.log("ANTICIPO SIN RESULT");
        }
            }
        }
  /*+ REALIZA LA CONVERSION A COMBO DE ANTICIPO*/ 
  convierteCombo(){
    if (this.mostrarComboAnticipo == true) {
        console.log("ANTICPO ES COMA+"+this.informacionPoliza.PRC_ANTICIPO);
         this.mostrarComboAnticipo = true;
         const valores = this.informacionPoliza.PRC_ANTICIPO.split(',').map(v => v.trim());
         console.log("ANTICPO valores+"+valores);
        // Generamos las opciones del combo manualmente
            this.opcionesAnticipos = valores.map((v, idx) => {
            return {
                codigo: v, // o algún identificador
                valor: v
            };
            });
    }
  }
//<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

  updTblPdTicketCotizaDet(data){
    this.rentasService.updTblPdTicketCotizaDet(data).subscribe({
        next: (response) => {
            console.log(response)
            const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(response.P_SMESSAGE);
            Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
            });
          },
          error: (error) => {
            console.error(error);
          },
    })
  }
  verificarDatosPago() {
    // this.getPaymentInformation();
    this.rentasService.delTicketCotizaDet({P_NTICKET: this.ticket.NTICKET,P_NUSERCODE: this.NUSERCODE}).subscribe({
        next: (response) => {
            console.log(response)
          },
          error: (error) => {
            console.error(error);
          },
    })
    this.registroHerederos()
  }

  async deleteReceptor(confirmado) {
    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    const mensajeSeparate = this.separateString(
      'error||Upds!||Los datos del Pago han sido Modificados. ¿Desear reconfirmar los Receptores del pago?'
    );
    modalRef.componentInstance.mensaje = mensajeSeparate;
    modalRef.result
      .then(() => {
        this.confirmado = confirmado;
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }
  PRUEBA
//   async registroBeneficiario(data) {
//     let modalRef = this.modalService.open(RegistroBeneficiarioModalComponent, {
//       size: 'lg',
//       backdropClass: 'light-blue-backdrop',
//       backdrop: 'static',
//       keyboard: false,
//       centered: true,
//     });
//     modalRef.componentInstance.reference = modalRef;
//     modalRef.componentInstance.formModalReference = modalRef;
//     modalRef.componentInstance.listActions = this.listActions;
//     modalRef.componentInstance.data = data;
//     modalRef.result
//       .then((data) => {
//       console.log(data);
//       this.nuevoBeneficiario[0].activo = true;
//       this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
//         next: (bankResponse) => {
//             this.nuevoBeneficiario[0].BANCO_ORIGEN = bankResponse.C_TABLE[0]?.SDESCRIPT_ORIGIN_BANK || '';
//             this.nuevoBeneficiario[0].COD_BANCO_ORIGEN = bankResponse.C_TABLE[0]?.SCODE_ORIGIN_BANK || '';
//         },
//         error: (error) => console.error(error),
//       });
//       this.nuevoBeneficiario = this.nuevoBeneficiario.map((beneficiario, index) => {
//         if (index === 0) {
//           return { ...beneficiario, NOMBRE: data.EListClient[0].P_SLEGALNAME };
//         }
//         return beneficiario;
//       });



//         console.log(this.nuevoBeneficiario)
//       })
//       .catch((error) => {
//         console.log('Modal cerrado');
//       });
//   }

async registroBeneficiario(data) {
    console.log(data)

    let Usuario = null;
    this.rentasService.EquivalenciaUsuario({ dni: this.ticket.SDNI_USUARIO_RESP, token: '' })
            .subscribe({
                next: (response) => {
                Usuario= response.data[0].COD_USUARIO;
                console.log(Usuario)
                let modalRef = this.modalService.open(RegistroBeneficiarioModalComponent, {
                    size: 'lg',
                    backdropClass: 'light-blue-backdrop',
                    backdrop: 'static',
                    keyboard: false,
                    centered: true,
                  });
                  console.log(Usuario)
                  modalRef.componentInstance.reference = modalRef;
                  modalRef.componentInstance.formModalReference = modalRef;
                  modalRef.componentInstance.listActions = this.listActions;
                  modalRef.componentInstance.data = data;
                  modalRef.componentInstance.dataUsuarioEquival = Usuario;
                  modalRef.result
                    .then((data) => {
                      console.log(data);
                      const documentoEncontrado = this.tipoDocumentos.find(
                        (doc) => doc.NCODE === data.NCODE
                      );
                      // Obtener el NUM_TIPO_IDEN del cliente proporcionado en data
                      const targetIden = data.EListClient[0].P_SIDDOC;
                      const targetTipoIden = documentoEncontrado.NCODE;
                      console.log(targetIden);
                      console.log(targetTipoIden);
                        console.log( this.nuevoBeneficiario)

                      // Buscar el beneficiario por NUM_TIPO_IDEN
                      this.nuevoBeneficiario = this.nuevoBeneficiario.map((beneficiario) => {
                        console.log(beneficiario)

                          console.log(beneficiario.TIPO_IDEN.codigo  == targetTipoIden);
                          console.log(beneficiario.NUM_TIPO_IDEN === targetIden );
                          console.log(beneficiario.NUM_TIPO_IDEN === targetIden && beneficiario.TIPO_IDEN.codigo  == targetTipoIden);
                       console.log(beneficiario)
                        if (beneficiario.NUM_TIPO_IDEN === targetIden && beneficiario.TIPO_IDEN.codigo  == targetTipoIden) {
                          console.log("entre")
                          return {
                            ...beneficiario,
                            activo: true,
                            NOMBRE: data.EListClient[0].P_SLEGALNAME,
                          };
                        }
                        return beneficiario;
                      });

                      // Realizar la llamada al servicio para obtener BANCO_ORIGEN
                      this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
                        next: (bankResponse) => {
                          const bancoOrigen = bankResponse.C_TABLE[0]?.SDESCRIPT_ORIGIN_BANK || '';
                          const codigoBancoOrigen = bankResponse.C_TABLE[0]?.SCODE_ORIGIN_BANK || '';

                          // Actualizar el banco origen para los beneficiarios con el mismo NUM_TIPO_IDEN
                          this.nuevoBeneficiario = this.nuevoBeneficiario.map((beneficiario) => {
                            if (beneficiario.NUM_TIPO_IDEN === targetIden && beneficiario.TIPO_IDEN.codigo == targetTipoIden) {
                          console.log("entre")
                              return {
                                ...beneficiario,
                                BANCO_ORIGEN: bancoOrigen,
                                COD_BANCO_ORIGEN: codigoBancoOrigen,
                              };
                            }
                            return beneficiario;
                          });

                          console.log(this.nuevoBeneficiario);
                        },
                        error: (error) => console.error(error),
                      });
                    })
                    .catch((error) => {
                      console.log('Modal cerrado');
                    });
            },
            error: (error) => {
            console.error(error);
        },
    });


  }


  confirmPaymentFlag: number;
  confirmPayment(P_NTICKET) {
    this.rentasService.confirmPayment({ P_NTICKET: P_NTICKET }).subscribe({
      next: (response) => {
        this.confirmPaymentFlag = response.P_NFLAG;
        if (this.confirmPaymentFlag == 1){
            this.listTblPdTicketCotizaDet({ P_NTICKET: P_NTICKET })
        }else if (this.confirmPaymentFlag == 2){
            this.getPaymentInformation();
        }

      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async listTblPdTicketCotizaDet(P_NTICKET) {
    try {
      const response = await this.rentasService.ListTblPdTicketCotizaDet(P_NTICKET).toPromise();

      const receiversPromises = response.C_TABLE.map(async (item) => {
        const bankData =  await this.rentasService.getBankOrigin({ P_NTPAYWAY: item.NTPAYWAY }).toPromise();
        return {
          NUM_POLIZA: item.NUM_POLIZA,
          COD_PROD: item.COD_PROD,
          RECEPTOR: item.STYPERECEP,
          NOMBRE: item.SCLIENAME,
          COD_TIPO_IDEN: item.COD_TIPO_IDEN,
          TIPO_IDEN: item.COD_TIPO_IDEN.trim() !== ""? await this.getDescription('SDO', item.COD_TIPO_IDEN): "",
          NUM_TIPO_IDEN: item.NUM_TIPO_IDEN,
          COD_PARENTESCO: item.COD_PARENTESCO,
          PARENTESCO: item.COD_PARENTESCO.trim() !== ""?await this.getDescription('PA', item.COD_PARENTESCO): "",
          PRC_PENSION: item.PRC_PENSION,
          COD_BANCO: item.COD_BANCO,
          BANCO: item.COD_BANCO.trim() !== ""?await this.getDescription('BCO', item.COD_BANCO): "",
          COD_TIPO_CUENTA: item.NTYPEACC,
          TIPO_CUENTA: item.NTYPEACC.trim() !== ""?await this.getDescription('TCT', item.NTYPEACC): "",
          COD_TIPO_IDEN_MAC: item.NTYPDOCID,
          TIPO_IDEN_MAC: item.NTYPDOCID.trim() !== ""?await this.getDescription('SDO', item.NTYPDOCID): "",
          NUM_TIPO_IDEN_MAC: item.SNUMDOCID,
          NOMBRE_MAC: item.STITULARNAME,
          NUM_CUENTA: item.SACCNUM?.trim() ?? '',
          NUM_CUENTA_CCI: item.SCCIACC?.trim() ?? '',
          SDESCRIPT: item.SDESCRIPT,
          tipoPagoReceptor: {
            codigo: item.NTPAYWAY
          },
          BANCO_ORIGEN: bankData.C_TABLE[0]?.SDESCRIPT_ORIGIN_BANK || '',
          COD_BANCO_ORIGEN: bankData.C_TABLE[0]?.SCODE_ORIGIN_BANK || '',
          NTRANSAC: item.NTRANSAC,
          MONTO_DEVOLUCION: item.NPEYAMOUNT,
          PERMISSION_BTN: item.PERMISSION_BTN,
          isEditing: false,
        };
      });
      // Ejecuta todas las promesas simultáneamente
      this.receivers = await Promise.all(receiversPromises);
      console.log("asigna 1")
      console.log(this.receivers)
      this.getPolicyData(this.ticket.POLIZA, this.ticket.COD_PRODUCTO);
      this.inputs.NUM_CUENTA = this.receivers[0].NUM_CUENTA
      this.inputs.NUM_CUENTA_CCI = this.receivers[0].NUM_CUENTA_CCI
    } catch (error) {
      console.error(error);
    }
  }
  isNewBeneficiary: boolean = false;

  nuevoBeneficiario: any[] = [];

  agregarBeneficiario(event: MouseEvent) {
    this.cancel_edit()
    event.stopPropagation();
    this.getTipoDocumentos()
    this.getTipoBeneficiarios()
  console.log("-------------------------------------")

  console.log(this.nuevoBeneficiario)
    this.nuevoBeneficiario.push({
        RECEPTOR: { codigo: "HEREDERO", valor: '' },
        NOMBRE: '',
        TIPO_IDEN: '',
        NUM_TIPO_IDEN: '',
        PARENTESCO: '',
        PRC_PENSION: '',
        tipoPagoReceptor: { codigo: "HEREDERO", valor: '' },

        BANCO_ORIGEN: '',
        BANCO: '',
        COD_BANCO: '',
        COD_TIPO_CUENTA: '',
        NUM_CUENTA: '',
        NUM_CUENTA_CCI: '',
        NOMBRE_MAC: '',
        TIPO_IDEN_MAC: '',
        NUM_TIPO_IDEN_MAC: '',
        MONTO_DEVOLUCION: 0,
        activo: false
      });
  console.log(this.nuevoBeneficiario)
  console.log("-------------------------------------")


  }

  onTipoIdenChange(index: number): void {
    const beneficiario = this.nuevoBeneficiario[index];

    // Limpiar los campos excepto RECEPTOR, NUM_TIPO_IDEN y TIPO_IDEN
    this.nuevoBeneficiario[index] = {
      ...beneficiario,
      NOMBRE: null,
      PARENTESCO: null,
      PRC_PENSION: null,
      tipoPagoReceptor: null,
      BANCO_ORIGEN: null,
      COD_BANCO: null,
      COD_TIPO_CUENTA: null,
      NUM_CUENTA: null,
      NUM_CUENTA_CCI: null,
      NOMBRE_MAC: null,
      NUM_TIPO_IDEN_MAC: null,
      MONTO_DEVOLUCION: null,
      activo: false
    };
  }

  opcionesTipoDocumentos
  tipoDocumentos
  getTipoDocumentos() {
    this.rentasService.getListTipoDocumentosB().subscribe({
      next: (response) => {
        this.tipoDocumentos = response.C_TABLE;

        this.opcionesTipoDocumentos = this.tipoDocumentos.map(
          (tipoDocumento) => {
            return {
              codigo: tipoDocumento.NCODE,
              valor: tipoDocumento.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  opcionesTipoBeneficiarios : any[];
  tipoBeneficiarios
  getTipoBeneficiarios() {
    this.rentasService.getListTipoBeneficiarios().subscribe({
              next: (response) => {
        this.tipoBeneficiarios = response.C_TABLE;

        this.opcionesTipoBeneficiarios = this.tipoBeneficiarios.map(
          (tipoDocumento) => {
            return {
              codigo: tipoDocumento.SCODE,
              valor: tipoDocumento.SDESCRIPT,
            };
          }
        );
              },
              error: (error) => {
                console.error(error);
              },
            });
  }


  receiverNew: any = [];

  async valAddReceiverPayment(beneficiario: any, index) {
    console.log(beneficiario)
    const documentoEncontrado = this.tipoDocumentos.find(
        (doc) => doc.NCODE === beneficiario.TIPO_IDEN.codigo.toString()
      );
    console.log(this.tipoDocumentos)
      console.log(documentoEncontrado)
    const mensaje = await this.getMessage(18);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    // Validar si el beneficiario ya existe en las listas
    const alreadyExistsInNuevoBeneficiario = this.nuevoBeneficiario.some(
        (item, i) =>
          i !== index && // Excluir al beneficiario actual basado en el índice
          item.TIPO_IDEN === beneficiario.TIPO_IDEN &&
          item.NUM_TIPO_IDEN === beneficiario.NUM_TIPO_IDEN
      );


      const alreadyExistsInReceivers = this.receivers.some(
        (item) =>
          item.COD_TIPO_IDEN == documentoEncontrado.NCODE &&
          item.NUM_TIPO_IDEN === beneficiario.NUM_TIPO_IDEN
      );

  // Si ya existe, mostrar mensaje y retornar
  if (alreadyExistsInNuevoBeneficiario || alreadyExistsInReceivers) {
    const mensaje = await this.getMessage(87);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    Swal.fire({
      icon: mensajeParts[0],
      title: mensajeParts[1],
      text: mensajeParts[2],
    });

    return; // No permitir avanzar
  }

    const dataVal = {
        P_NTYPCLIENTDOC: documentoEncontrado.NCODE_VT,
        P_SCLINUMDOCU: beneficiario.NUM_TIPO_IDEN,
      };
    this.rentasService.valFormat(dataVal).subscribe({
            next: (response) => {
              if (response.P_SVALIDA == 2) {
                Swal.fire({
                  icon: mensajeParts[0],
                  title: mensajeParts[1],
                  text: mensajeParts[2],
          });
                this.isLoading = false;
                return;
              } else {
                const data = {
                    "P_NTICKET": this.ticket.NTICKET,
                    "P_NTYPEDOCU": documentoEncontrado.NCODE,
                    "P_SCLIENDOCU": beneficiario.NUM_TIPO_IDEN,
                    "P_NUSERCODE": this.NUSERCODE,
                  };

                  this.rentasService.valAddReceiverPayment(data).subscribe({
                    next: (response) => {
                      const mensajeParts: [SweetAlertIcon, string, string] =
                        this.separateString(response.P_SMESSAGE);
                      Swal.fire({
                        icon: mensajeParts[0],
                        title: mensajeParts[1],
                        text: mensajeParts[2],
                      });

                      if (response.P_NCODE == 0) {
                          beneficiario.activo = true;
                        // Actualización de datos cuando la validación es exitosa
                        const requestData = {
                          "P_TIPOPER": "Con",
                          "P_CODAPLICACION": "GESTORCLIENTE",
                          "P_NUSERCODE": "1",
                          "P_NIDDOC_TYPE": documentoEncontrado.NCODE_VT,
                          //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                          //"P_SIDDOC": String(beneficiario.NUM_TIPO_IDEN),
                          "P_SIDDOC": String(beneficiario.NUM_TIPO_IDEN).trim().toUpperCase(),
                          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                        };
                ///EListClient revertir los cambios a minuscula cuando se pase a prod
                        this.rentasService.GestionarCliente(requestData).subscribe({
                          next: (clientResponse) => {
        this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
                              next: (bankResponse) => {
                                beneficiario.BANCO_ORIGEN = bankResponse.C_TABLE[0]?.SDESCRIPT_ORIGIN_BANK || '';
                                beneficiario.COD_BANCO_ORIGEN = bankResponse.C_TABLE[0]?.SCODE_ORIGIN_BANK || '';
                              },
                              error: (error) => console.error(error),
                            });
                            beneficiario.NOMBRE = clientResponse.EListClient[0]?.P_SLEGALNAME || '';
                            const data3 = {
                              "P_NTYPCLIENTDOC": clientResponse.EListClient[0]?.P_NIDDOC_TYPE,
                              "P_SSEXCLIEN": clientResponse.EListClient[0]?.P_SSEXCLIEN,
                              "P_STYPERECEP": "",
                              "P_NCIVILSTA": String(clientResponse.EListClient[0]?.P_NCIVILSTA),
                              "P_NNATIONALITY": clientResponse.EListClient[0]?.P_NNATIONALITY,
                              "P_NPROVINCE": clientResponse.EListClient[0].EListAddresClient[0]?.P_NPROVINCE,
                              "P_NLOCAL": clientResponse.EListClient[0].EListAddresClient[0]?.P_NLOCAL,
                              "P_NMUNICIPALITY": clientResponse.EListClient[0].EListAddresClient[0]?.P_NMUNICIPALITY,
                              "P_NTYPCLIENTDOC_RT": documentoEncontrado.NCODE
                            }
                          this.rentasService.getEquivalenceInformation(data3).subscribe({
                              next: (responseInfo) => {
                                  this.rentasService.EquivalenciaUsuario({ dni: this.ticket.SDNI_USUARIO_RESP, token: '' })
                                  .subscribe({
            next: (response) => {
                                      if(response.numbermsg != 0){
                                          console.log("error")
                                          this.ErrorModal(80)
                                      }else{
                                        console.log(responseInfo)
                                          const dataRegistro = {
                                              "coD_TIPODOC": responseInfo.C_TABLE[0].COD_TIPODOC,
                                              "tipodoc": responseInfo.C_TABLE[0].TIPODOC,
                                              "nrodocu": clientResponse.EListClient[0]?.P_SIDDOC,
                                              "nombrecompleto": clientResponse.EListClient[0]?.P_SLEGALNAME,
                                              //"nombrE1": clientResponse.EListClient[0]?.P_SFIRSTNAME,
                                              "nombrE1": clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ")[0] || "",
                                              //"nombrE2": clientResponse.EListClient[0]?.P_SFIRSTNAME,
                                              "nombrE2": clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ").slice(1).join(" ") || "",
                                              "appaterno": clientResponse.EListClient[0]?.P_SLASTNAME,
                                              "apmaterno": clientResponse.EListClient[0]?.P_SLASTNAME2,
                                              "nombrelegal": clientResponse.EListClient[0]?.P_SLEGALNAME,
                                              //"fecnac": "20240506",
                                              "fecnac": clientResponse.EListClient[0]?.P_DBIRTHDAT.replace(/[-/]/g, ""),
                                              /// "fecnac": clientResponse.EListClient[0]?.P_DBIRTHDAT,
                                              "coD_SEXO": responseInfo.C_TABLE[0].COD_SEXO,
                                              "sexo": responseInfo.C_TABLE[0].SEXO,
                                              "coD_ESTADOCIVIL": responseInfo.C_TABLE[0].COD_ESTADOCIVIL,
                                              "estadocivil": responseInfo.C_TABLE[0].ESTADOCIVIL,
                                              "coD_NACIONALIDAD": responseInfo.C_TABLE[0].COD_NACIONALIDAD,
                                              "nacionalidad": responseInfo.C_TABLE[0].NACIONALIDAD,
                                              "direccion":  clientResponse.EListClient[0]?.EListAddresClient?.length? clientResponse.EListClient[0].EListAddresClient[0].P_SSTREET ?? "": "",
                                              "coD_DEPARTAMENTO": responseInfo.C_TABLE[0].COD_DEPARTAMENTO,
                                              "departamento": responseInfo.C_TABLE[0].DEPARTAMENTO,
                                              "coD_PROVINCIA": responseInfo.C_TABLE[0].COD_PROVINCIA,
                                              "provincia": responseInfo.C_TABLE[0].PROVINCIA,
                                              "coD_DISTRITO": responseInfo.C_TABLE[0].COD_DISTRITO,
                                              "distrito": responseInfo.C_TABLE[0].DISTRITO,
                                              "correo": clientResponse.EListClient[0]?.EListEmailClient?.length? clientResponse.EListClient[0].EListEmailClient[0].P_SE_MAIL?? "": "",
                                              "fono": clientResponse.EListClient[0]?.EListPhoneClient?.length? clientResponse.EListClient[0].EListPhoneClient[0].P_SPHONE ?? "": "",
                                              "coD_USUARIOCREA": response.data[0].COD_USUARIO
                                          }

                                          this.rentasService.registroclientes(dataRegistro).subscribe({
                                              next: (response) => {
                                                console.log(response);
                                                const mensajeParts: [SweetAlertIcon, string, string] =
                                                this.separateString(response.P_SMESSAGE);
                                              Swal.fire({
                                                icon: mensajeParts[0],
                                                title: mensajeParts[1],
                                                text: mensajeParts[2],
                                              });
                                              },
                                              error: (error) => {
                                                console.error(error);
                                                const mensajeParts: [SweetAlertIcon, string, string] =
                                                this.separateString(response.P_SMESSAGE);
                                              Swal.fire({
                                                icon: mensajeParts[0],
                                                title: mensajeParts[1],
                                                text: mensajeParts[2],
                                              });
                                              },
                                            });
                                      }
                                      },
                                      error: (error) => {
                                      console.error(error);
                                      },
                                  });

            },
            error: (error) => {
              console.error(error);
            },
          });
      },
                          error: (error) => console.error(error),
                        });
                      } else {
                        // Lógica en caso de error o validación fallida
                        this.registroBeneficiario({
                          P_NTYPEDOCU: documentoEncontrado.NCODE,
                          P_SCLIENDOCU: beneficiario.NUM_TIPO_IDEN,
                          index:  index,
                        });
                      }
                    },
                    error: (error) => console.error(error),
                  });
              }
            },
      error: (error) => {
              this.isLoading = false;
        console.error(error);
      },
    });

  }

//   valAddReceiverPayment(){
//     const data ={
//         "P_NTICKET": this.ticket.NTICKET,
//         "P_NTYPEDOCU": this.inputs.TYPE_DOCUMENT.codigo,
//         "P_SCLIENDOCU": this.inputs.NUM_TIPO_IDEN,
//         "P_NUSERCODE": this.NUSERCODE,
//     }
//     this.rentasService.valAddReceiverPayment(data).subscribe({
//         next: (response) => {
//             const mensajeParts: [SweetAlertIcon, string, string] =
//             this.separateString(response.P_SMESSAGE);
//           Swal.fire({
//             icon: mensajeParts[0],
//             title: mensajeParts[1],
//             text: mensajeParts[2],
//           });
//           if (response.P_NCODE == 0) {
//             this.edit6 = true
//             const data = {
//                 "P_TIPOPER": "Con",
//                 "P_CODAPLICACION": "GESTORCLIENTE",
//                 "P_NUSERCODE": "1",
//                 "P_NIDDOC_TYPE": this.inputs.TYPE_DOCUMENT.codigo,
//                 "P_SIDDOC": this.inputs.NUM_TIPO_IDEN,
//               }
//             this.rentasService.GestionarCliente(data).subscribe({
//                 next: (response) => {
//                     this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
//                         next: (response) => {
//                             this.receiverNew.BANCO_ORIGEN = response.C_TABLE[0]?.SDESCRIPT_ORIGIN_BANK || '';
//                             this.receiverNew.COD_BANCO_ORIGEN = response.C_TABLE[0]?.SCODE_ORIGIN_BANK || '';
//                         },
//                         error: (error) => {
//                           console.error(error);
//                         },
//                       });
//                   console.log(response)
//                   this.receiverNew.NAME = response.EListClient[0].P_SLEGALNAME

//                 },
//                 error: (error) => {
//                   console.error(error);
//                 },
//               });
//           } else {
//             this.registroBeneficiario({P_NTYPEDOCU:this.inputs.TYPE_DOCUMENT.codigo, P_SCLIENDOCU: this.inputs.NUM_TIPO_IDEN})
//           }
//         },
//         error: (error) => {
//           console.error(error);
//         },
//       });
//     }


getPaymentInformation() {
    const data = {
      ramo: '',
      cod_producto: this.ticket.COD_PRODUCTO,
      poliza: this.ticket.POLIZA,
      cod_submotivo: this.ticket.NSUBMOTIVO,
      fec_sol: this.ticket.FECHA_REGISTRO,
      monto: this.ticket.MTO_RESCATE,
    };
    console.log(this.receivers)
    const primera =  this.receivers == undefined
    console.log(primera)
    if(!primera){
        console.log(primera)
        this.cambiarPestana(5)
    }
    this.rentasService.getPaymentInformation(data).subscribe({
      next: (response) => {
        this.receivers = response.data || [];
        console.log(this.receivers)
        // Obtener los datos de banco de origen solo una vez
        this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
          next: (bankResponse) => {
            const bankData = bankResponse.C_TABLE[0];
            const bancoOrigen = bankData?.SDESCRIPT_ORIGIN_BANK || '';
            const codBancoOrigen = bankData?.SCODE_ORIGIN_BANK || '';

            this.receivers.forEach((receiver, index) => {
              receiver.BANCO_ORIGEN = bancoOrigen;
              receiver.COD_BANCO_ORIGEN = codBancoOrigen;
              receiver.NTICKET = this.ticket.NTICKET;
            console.log(receiver)
              if (receiver?.COD_VIAPAGO != null) {
              console.log("----------------------" + index)
                receiver.tipoPagoReceptor = { codigo: receiver.COD_VIAPAGO };
              }

    console.log(primera)


              if (this.flagAfp === 1 && index === 0) {
                console.log("AFP")
                const afpData = {
                  P_STYPERECEP: receiver.RECEPTOR,
                  P_NTYPEDOCU: receiver.COD_TIPO_IDEN,
                  P_SCLIENDOCU: receiver.NUM_TIPO_IDEN,
                  P_NCURRENCY: this.ticket.NCURRENCY,
                  P_NTPAYWAY: 2,
                };

                this.rentasService.getPaymentInformationAfp(afpData).subscribe({
                  next: (afpResponse) => {
                    const cuenta = afpResponse.C_TABLE[0];
                    console.log(afpResponse)

                    if(afpResponse.P_NCODE == 0){
                        receiver.NUM_CUENTA = cuenta?.SACCNUM.trim() ?? '';
                        receiver.NUM_CUENTA_CCI = cuenta?.SCCIACC.trim() ?? '';
                        receiver.COD_BANCO = cuenta?.SCODE_DESTINY_BANK;
                        receiver.COD_TIPO_CUENTA = cuenta?.NTYPEACC;
                        receiver.tipoPagoReceptor = { codigo: 2 };
                        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                        receiver.PRC_PENSION = 100;
                        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                        this.inputs.TIPO_CUENTA = {
                        codigo: cuenta?.NTYPEACC,
                        };

                        this.inputs.COD_BANCO = {
                        codigo: cuenta?.SCODE_DESTINY_BANK,
                        };
                    }
                     console.log(primera)

                    if(!primera){
                        this.cambiarPestana(3)
                    }
                  },
                  error: (error) => console.error('AFP Error:', error),
                });
              }
            });
            console.log(primera)
            if(this.flagAfp !== 1){
                if(!primera){
                    this.cambiarPestana(3)
                }
  }

            console.log(this.receivers)



          },
          error: (error) => console.error('Bank Origin Error:', error),
        });

        // Cargar todos los bancos disponibles
        this.rentasService.getBankOrigin({ P_NTPAYWAY: 1 }).subscribe({
          next: (response) => {
            this.banksOrigin = response.C_TABLE;
          },
          error: (error) => console.error(error),
        });
      },
      error: (error) => console.error(error),
    });
  }


  externalReceivers
  dataBasereceivers
  async comparePayments() {
    const mensaje = await this.getMessage(53);
    const mensaje2 = await this.getMessage(52);

    const data2 = {
      P_NTICKET: this.ticket.NTICKET
    };

    const data = {
      ramo: '',
      cod_producto: this.ticket.COD_PRODUCTO,
      poliza: this.ticket.POLIZA,
      cod_submotivo: this.ticket.NSUBMOTIVO,
        fec_sol:this.ticket.FECHA_REGISTRO,
        monto: this.ticket.MTO_RESCATE
    };

    // Usar forkJoin para ejecutar ambas peticiones al mismo tiempo y esperar a que ambas terminen
    forkJoin({
      dataBaseReceivers: this.rentasService.ListTblPdTicketCotizaDet(data2),
      externalReceivers: this.rentasService.getPaymentInformation(data)
    }).subscribe({
      next: ({ dataBaseReceivers, externalReceivers }) => {
        // Llenar los receptores desde las dos APIs
        this.dataBasereceivers = dataBaseReceivers.C_TABLE.map((item) => ({
          NUM_POLIZA: item.NUM_POLIZA,
          COD_PROD: item.COD_PROD,
          RECEPTOR: item.STYPERECEP,
          NOMBRE: item.SCLIENAME,
          COD_TIPO_IDEN: item.COD_TIPO_IDEN,
          NUM_TIPO_IDEN: item.NUM_TIPO_IDEN,
          COD_PARENTESCO: item.COD_PARENTESCO,
          PRC_PENSION: item.PRC_PENSION,
          COD_BANCO: item.COD_BANCO,
          COD_TIPO_CUENTA: item.NTYPEACC,
          COD_TIPO_IDEN_MAC: item.NTYPDOCID,
          NUM_TIPO_IDEN_MAC: item.SNUMDOCID,
          NOMBRE_MAC: item.STITULARNAME,
          NUM_CUENTA: item.SACCNUM?.trim() ?? '',
          NUM_CUENTA_CCI: item.SCCIACC?.trim() ?? '',
          PERMISSION_BTN: item.PERMISSION_BTN,
          tipoPagoReceptor: {
            codigo: item.NTPAYWAY
          },
          MONTO_DEVOLUCION: item.NPEYAMOUNT,
          isEditing: false,
        }));
        this.externalReceivers = externalReceivers.data;
        // Ahora proceder con la comparación
        this.compareReceivers(mensaje, mensaje2);
      },
      error: (error) => {
        console.error('Error en las llamadas a la API:', error);
      }
    });
    const data3 = {
        "P_STYPERECEP": this.receivers[0].RECEPTOR,
        "P_NTYPEDOCU": this.receivers[0].COD_TIPO_IDEN,
        "P_SCLIENDOCU": this.receivers[0].NUM_TIPO_IDEN,
        "P_NCURRENCY": this.ticket.NCURRENCY,
        "P_NTPAYWAY": 2
    }
    this.rentasService.getPaymentInformationAfp(data3).subscribe({
        next: (response) => {
            console.log(response)
        },
        error: (error) => {
            console.error(error);
        },
    });
  }

  // Método separado para la comparación
  compareReceivers(mensaje: any, mensaje2: any) {
    const baseFieldsToCompare = [
      'COD_TIPO_IDEN',
      'NUM_TIPO_IDEN',
      'COD_PARENTESCO',
      'PRC_PENSION',
      'RECEPTOR',
      'MONTO_DEVOLUCION',
    ];

    let allMatch = true;

    for (let i = 0; i < this.dataBasereceivers.length; i++) {
      const receiver = this.dataBasereceivers[i];
      const externalReceiver = this.externalReceivers[i];

      let fieldsToCompare = baseFieldsToCompare.slice();

      if (String(this.dataBasereceivers[i].tipoPagoReceptor.codigo) === '2') {
        fieldsToCompare = fieldsToCompare.concat([
          'COD_BANCO',
          'COD_TIPO_CUENTA',
          'COD_TIPO_IDEN_MAC',
          'NUM_TIPO_IDEN_MAC',
          'NUM_CUENTA',
          'NUM_CUENTA_CCI',
        ]);
      }

      for (const field of fieldsToCompare) {
        const receiverValue = String(receiver[field]).trim();
        const externalReceiverValue = String(externalReceiver[field]).trim();
        console.log(`Valor en BD: ${receiver[field]}, Valor en API: ${externalReceiver[field]}`);
        if (receiverValue !== externalReceiverValue) {
          console.log(`Valor en BD: ${receiver[field]}, Valor en API: ${externalReceiver[field]}`);
          console.log(`Diferencia en el campo ${field} para el receptor en la posición ${i}`);
          allMatch = false;
        }
      }
    }

    if (allMatch) {
      console.log('Todos los receptores coinciden en los campos comparados.');
      this.verificarDatosPagoModal(mensaje);
    } else {
      console.log('Existen diferencias entre los receptores.');
      this.verificarDatosPagoModal(mensaje2);
    }
  }



  async verificarDatosPagoModal(mensaje) {
    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    const mensajeSeparate = this.separateString(mensaje);
    modalRef.componentInstance.mensaje = mensajeSeparate;
    modalRef.result
      .then(() => {
        this.verificarDatosPago();
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }


  getDescription(cod_tabla: string, cod_elemento: string): Promise<string> {
    const data = {
      "cod_tabla": cod_tabla,
      "cod_elemento": cod_elemento
    };

    return new Promise((resolve, reject) => {
      this.rentasService.getDescription(data).subscribe({
        next: (response) => {
          const elemento = response.data[0].ELEMENTO as string;
          resolve(elemento);
        },
        error: (error) => {
          console.error(error);
          reject('Error retrieving description');
        },
      });
    });
  }
  opcionesTipoCuenta: any = [];
  getOpcionesTipoCuenta() {
    const data = {
      "cod_tabla": "TCT",
      "cod_elemento": ""
    };
    this.rentasService.getDescription(data).subscribe({
        next: (response) => {
            console.log(response);
           this.opcionesTipoCuenta = response.data
           .filter((submotivo) => submotivo.COD_ELEMENTO !== "00" && submotivo.COD_ELEMENTO !== "04") // Filtrar donde COD_ELEMENTO no sea "00" sin informacion
           .map((submotivo) => {
                return {
                  codigo: submotivo.COD_ELEMENTO,
                  valor: submotivo.ELEMENTO,
                };
              });
            console.log(this.opcionesTipoCuenta)
        },
        error: (error) => {
          console.error(error);
        }
    });
  }

  opcionesBanco: any = [];
  getOpcionesBanco() {
    const data = {
      "cod_tabla": "BCO",
      "cod_elemento": ""
    };

    this.rentasService.getDescription(data).subscribe({
      next: (response) => {
        console.log(response);
        this.opcionesBanco = response.data
          .filter((submotivo) => submotivo.COD_ELEMENTO !== "00") // Filtrar donde COD_ELEMENTO no sea "00" sin informacion
          .map((submotivo) => {
            return {
              codigo: submotivo.COD_ELEMENTO,
              valor: submotivo.ELEMENTO,
            };
          });
        console.log(this.opcionesBanco);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }



  valConfirmPayment() {
    this.rentasService
      .valConfirmPayment({ P_NTICKET: this.ticket.NTICKET })
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  opcionesTipoPago;
  tipoPagos;
  getTypePayment() {
    //SERVICIO PARA LISTAR LOS SUBMOTIVOS
    this.rentasService.getTypePayment().subscribe({
      next: (response) => {
        this.tipoPagos = response.C_TABLE;
        this.opcionesTipoPago = this.tipoPagos.map((submotivo) => {
          return {
            codigo: submotivo.NCODE,
            valor: submotivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  changeTypePayment(P_TYPE_SEARCH) {
    this.inputs.P_TYPE_SEARCH = P_TYPE_SEARCH;
  }

  get fechaPago(): string {
    const fechaFormateada = this.datePipe.transform(this.FechaInicio, 'dd/MM/yyyy');
    return this.ticket.FECHA_PAGO ? this.ticket.FECHA_PAGO : fechaFormateada;
  }

  set fechaPago(value: string) {
    this.ticket.FECHA_PAGO = value;
  }

  convertToDate(dateInput: any): Date | any {
    if (typeof dateInput === 'string') {
      const [day, month, year] = dateInput.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return dateInput;
  }



  async insTicketCotizaDet() {
    for (const receiver of this.receivers) {
        const dataVal = {
          P_NTICKET: this.ticket.NTICKET,
          P_SCLIENAME: receiver.NOMBRE,
          P_NTYPEDOCU: receiver.COD_TIPO_IDEN,
          P_SCLIENDOCU: receiver.NUM_TIPO_IDEN,
          P_NUSERCODE: this.NUSERCODE,
          P_NTPAYWAY: receiver.tipoPagoReceptor?.codigo || this.nuevoBeneficiario[0].tipoPagoReceptor?.codigo,
          P_SCODE_DESTINY_BANK: receiver.COD_BANCO,
          P_NTYPEACC: receiver.COD_TIPO_CUENTA,
          P_SACCNUM: receiver.NUM_CUENTA?.trim() ?? '',
          P_SCCIACC: receiver.NUM_CUENTA_CCI?.trim() ?? '',
        };
        console.log(dataVal)

        const response = await this.rentasService.valTicketCotizaDet(dataVal).toPromise();

        if (response.P_NCODE !== 0) {
          const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(response.P_SMESSAGE);
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
          return;
        }
      }

    const processedReceivers = this.receivers.map(receiver => {
      const tipoPagoReceptor = receiver.tipoPagoReceptor?.codigo || 1;
      if (tipoPagoReceptor === 1) {
        return {
          ...receiver,
          BANCO: '',
          TIPO_CUENTA: '',
          NUM_CUENTA: '',
          NUM_CUENTA_CCI: '',
          COD_BANCO: '',
          NOMBRE_MAC: '',
          TIPO_IDEN_MAC: '',
          NUM_TIPO_IDEN_MAC: '',
          P_NTPAYWAY: tipoPagoReceptor
        }
      }else if (tipoPagoReceptor === 2) {
        return {
          ...receiver,
          BANCO_ORIGEN: '',
          P_NTPAYWAY:tipoPagoReceptor
        };
    }
      return receiver;
    });
    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      //SOLO CUANDO ES AFP
      if (this.flagAfp === 1 ) {
      this.getGuardarReceptorAFP();
      }
      //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

    const data = {
      P_RECEIVERS: processedReceivers,
    };

    this.rentasService.insTicketCotizaDet(data).subscribe({
      next: (response) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(response.P_SMESSAGE);
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }


  getFormaPago() {
    this.rentasService.getFormaPago().subscribe({
      next: (response) => {
        this.tipoPagoReceptor = response.C_TABLE;

        this.opcionesTipoPagoReceptor = this.tipoPagoReceptor.map((estado) => {
          return {
            codigo: estado.NCODE,
            valor: estado.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async registroHerederos(accion: string = "crear") {
    await this.getTipoDocumentos()
    const mensaje = await this.getMessage(89);
    const mensaje2 = await this.getMessage(90);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    console.log(this.nuevoBeneficiario)
    console.log(this.receivers)
    if (this.nuevoBeneficiario.length <= 0 && this.receivers.length <= 0){
        console.log("vacio")
        const data = {
            coD_TIPPROD: this.ticket.COD_PRODUCTO,
            nuM_POLIZA: this.detallePoliza.NUM_POLIZA,
            coD_USUARIOCREA: "GMARTINEZ",
            monto: this.ticket.IMP_DEVOLUCION || 0,
            data: [],
          };

          this.rentasService.registroHerederos(data).subscribe({
            next: (response) => {
              console.log(response);
              this.nuevoBeneficiario = [];
              this.receivers = [];
              if (response.numbermsg == 0) {
                const mensaje = accion === "eliminar" ? mensajeParts2 : mensajeParts;
                Swal.fire({
                  icon: mensaje[0],
                  title: mensaje[1],
                  text: mensaje[2],
                });
              }
            },
            error: (error) => console.error(error),
          });
    }
    let formattedData = this.nuevoBeneficiario.map((receiver) => {
        console.log(this.tipoDocumentos)

        const documentoEncontrado = this.tipoDocumentos.find(
          (doc) => doc.NCODE === receiver.TIPO_IDEN.codigo.toString()
        );
        console.log(documentoEncontrado)
        return {
          coD_TIPOIDEN: documentoEncontrado.NCODE,
          nuM_IDEN: receiver.NUM_TIPO_IDEN,
          nombrE1: receiver.NOMBRE.split(' ')[0] || '',
          nombrE2: receiver.NOMBRE.split(' ')[1] || '',
          appaterno: receiver.NOMBRE.split(' ')[2] || '',
          apmaterno: receiver.NOMBRE.split(' ')[3] || '',
          direccion: '',
          coD_DIRECCION: '',
          fono: '',
          correo: '',
          coD_SEXO: '',
          feC_NAC: '',
          coD_TIPO: '',
          ocupacion: '',
          mtO_PENSION: '',
          prC_PENSION: receiver?.PRC_PENSION || '',
          coD_VIAPAGO: receiver?.tipoPagoReceptor?.codigo || '',
          VIA_PAGO: receiver?.tipoPagoReceptor?.text || '',
          coD_BANCO: receiver?.COD_BANCO?.codigo || '',
          banco: receiver?.COD_BANCO?.valor || '',
          coD_TIPCUENTA: receiver?.COD_TIPO_CUENTA?.codigo || '',
          TIPO_CUENTA: receiver?.COD_TIPO_CUENTA?.valor || '',
          nuM_CUENTA: receiver?.NUM_CUENTA || '',
          nuM_CUENTA_CCI: receiver?.NUM_CUENTA_CCI || '',
          nuM_DOCUPAGO: ''
        };
      });
      if (this.receivers.length > 0) {
        const additionalData = this.receivers.map((receiver) => {

          return {
            coD_TIPOIDEN: receiver.COD_TIPO_IDEN,
            nuM_IDEN: receiver.NUM_TIPO_IDEN,
            nombrE1: receiver.NOMBRE.split(' ')[0] || '',
            nombrE2: receiver.NOMBRE.split(' ')[1] || '',
            appaterno: receiver.NOMBRE.split(' ')[2] || '',
            apmaterno: receiver.NOMBRE.split(' ')[3] || '',
            direccion: '',
            coD_DIRECCION: '',
            fono: '',
            correo: '',
            coD_SEXO: '',
            feC_NAC: '',
            coD_TIPO: '',
            ocupacion: '',
            mtO_PENSION: '',
            prC_PENSION: receiver.PRC_PENSION || '',
            coD_VIAPAGO: receiver.tipoPagoReceptor.codigo || '',
            VIA_PAGO: receiver.tipoPagoReceptor.text || '',
            coD_BANCO: receiver.COD_BANCO || '',
            banco: this.opcionesBanco?.find(op => op.codigo === receiver.COD_BANCO)?.valor || '',
            coD_TIPCUENTA: receiver.COD_TIPO_CUENTA || '',
            TIPO_CUENTA: this.opcionesTipoCuenta?.find(op => op.codigo === receiver.COD_TIPO_CUENTA)?.valor || '',
            nuM_CUENTA: receiver.NUM_CUENTA || '',
            nuM_CUENTA_CCI: receiver.NUM_CUENTA_CCI || '',
            nuM_DOCUPAGO: ''
          };
        });

        // Combinar los datos de `nuevoBeneficiario` y `receivers`
        formattedData = formattedData.concat(additionalData);
    }

      for (const receiver of this.nuevoBeneficiario) {
        const documentoEncontrado = this.tipoDocumentos.find(
            (doc) => doc.NCODE === receiver.TIPO_IDEN.codigo.toString()
          );
        const dataVal = {
          P_NTICKET: this.ticket.NTICKET,
          P_SCLIENAME: receiver.NOMBRE,
          P_NTYPEDOCU: documentoEncontrado.NCODE,
          P_SCLIENDOCU: receiver.NUM_TIPO_IDEN,
          P_NUSERCODE: this.NUSERCODE,
          P_NTPAYWAY: receiver.tipoPagoReceptor?.codigo || this.nuevoBeneficiario[0].tipoPagoReceptor?.codigo,
          P_SCODE_DESTINY_BANK: receiver?.COD_BANCO?.codigo,
          P_NTYPEACC: receiver?.COD_TIPO_CUENTA?.codigo,
          P_SACCNUM: receiver.NUM_CUENTA?.trim() ?? '',
          P_SCCIACC: receiver.NUM_CUENTA_CCI?.trim() ?? '',

        };
        console.log(dataVal)
        const response = await this.rentasService.valTicketCotizaDet(dataVal).toPromise();

        if (response.P_NCODE !== 0) {
          const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(response.P_SMESSAGE);
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
          return;
        }
      }
      console.log(formattedData)
      const requests = formattedData.map((beneficiario) => {
      console.log(beneficiario)

        console.log("Mejoras")
        console.log(this.tipoDocumentos)
        const documentoEncontrado = this.tipoDocumentos.find(
          (doc) => doc.NCODE == String(beneficiario.coD_TIPOIDEN)
        );
      console.log(documentoEncontrado)
        const requestData = {
          P_TIPOPER: "Con",
          P_CODAPLICACION: "GESTORCLIENTE",
          P_NUSERCODE: "1",
          //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          //P_NIDDOC_TYPE: documentoEncontrado.NCODE_VT,
          P_NIDDOC_TYPE: documentoEncontrado.NCODE_VT.trim().toUpperCase(),
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          P_SIDDOC: String(beneficiario.nuM_IDEN),
        };

        return this.rentasService.GestionarCliente(requestData).pipe(
          switchMap((clientResponse) => {
            // Mapeo de datos del cliente al beneficiario
            beneficiario.nombrE1 = clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ")[0] || "";
            beneficiario.nombrE2 = clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ").slice(1).join(" ") || "";
            beneficiario.appaterno = clientResponse.EListClient[0]?.P_SLASTNAME || "";
            beneficiario.apmaterno = clientResponse.EListClient[0]?.P_SLASTNAME2 || "";
            beneficiario.direccion = clientResponse.EListClient[0]?.EListAddresClient[0]?.P_SSTREET || "";
            beneficiario.correo = clientResponse.EListClient[0]?.EListEmailClient[0]?.P_SE_MAIL || "";
            beneficiario.fono = clientResponse.EListClient[0]?.EListPhoneClient[0]?.P_SPHONE || "";
            beneficiario.feC_NAC = clientResponse.EListClient[0]?.P_DBIRTHDAT.replace(/[-/]/g, "");

            const data3 = {
              P_NTYPCLIENTDOC: clientResponse.EListClient[0]?.P_NIDDOC_TYPE,
              P_SSEXCLIEN: clientResponse.EListClient[0]?.P_SSEXCLIEN,
              P_STYPERECEP: "",
              P_NCIVILSTA: String(clientResponse.EListClient[0]?.P_NCIVILSTA),
              P_NNATIONALITY: clientResponse.EListClient[0]?.P_NNATIONALITY,
              P_NPROVINCE: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NPROVINCE,
              P_NLOCAL: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NLOCAL,
              P_NMUNICIPALITY: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NMUNICIPALITY,
              P_NTYPCLIENTDOC_RT: documentoEncontrado.NCODE
            };

            return this.rentasService.getEquivalenceInformation(data3).pipe(
              tap((responseInfo) => {
                beneficiario.coD_SEXO = responseInfo?.C_TABLE[0]?.COD_SEXO || "";
              })
            );
          })
        );
      });

      forkJoin(requests).subscribe({
        next: () => {
          const data = {
            coD_TIPPROD: this.ticket.COD_PRODUCTO,
            nuM_POLIZA: this.detallePoliza.NUM_POLIZA,
            coD_USUARIOCREA: "GMARTINEZ",
            monto: this.ticket.IMP_DEVOLUCION || 0,
            data: formattedData,
          };

          this.rentasService.registroHerederos(data).subscribe({
            next: (response) => {
              console.log(response);
              this.nuevoBeneficiario = [];
              this.receivers = [];
              if (response.numbermsg == 0) {
                console.log(mensajeParts)
                console.log(mensajeParts2)
                console.log(accion)
                const mensaje = accion === "eliminar" ? mensajeParts2 : mensajeParts;
                Swal.fire({
                  icon: mensaje[0],
                  title: mensaje[1],
                  text: mensaje[2],
                });
              }
            },
            error: (error) => console.error(error),
          });
        },
        error: (error) => console.error(error),
      });




    //   formattedData.forEach((beneficiario) => {
    //     console.log(beneficiario)
    //     console.log(this.tipoDocumentos)
    //     const documentoEncontrado = this.tipoDocumentos.find(
    //         (doc) => doc.NCODE === beneficiario.coD_TIPOIDEN
    //       );
    //       const ncode = documentoEncontrado ? documentoEncontrado.NCODE_VT : null;
    //     const requestData = {
    //       P_TIPOPER: "Con",
    //       P_CODAPLICACION: "GESTORCLIENTE",
    //       P_NUSERCODE: "1",
    //       P_NIDDOC_TYPE: String(ncode),
    //       P_SIDDOC: String(beneficiario.nuM_IDEN),
    //     };

    //     this.rentasService.GestionarCliente(requestData).subscribe({
    //       next: (clientResponse) => {
    //         console.log(clientResponse)
    //         beneficiario.nombrE1 = clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(' ')[0] || "";
    //         beneficiario.nombrE2 = clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(' ').slice(1).join(' ') || "";
    //         beneficiario.appaterno = clientResponse.EListClient[0]?.P_SLASTNAME || "";
    //         beneficiario.apmaterno = clientResponse.EListClient[0]?.P_SLASTNAME2 || "";
    //         beneficiario.direccion = clientResponse.EListClient[0]?.EListAddresClient[0]?.P_SSTREET || "";
    //         beneficiario.correo = clientResponse.EListClient[0]?.EListEmailClient[0]?.P_SE_MAIL || "";
    //         beneficiario.fono = clientResponse.EListClient[0]?.EListPhoneClient[0]?.P_SPHONE || "";
    //         beneficiario.feC_NAC = clientResponse.EListClient[0]?.P_DBIRTHDAT.replace(/[-/]/g, "");


    //         const data3 = {
    //           P_NTYPCLIENTDOC: clientResponse.EListClient[0]?.P_NIDDOC_TYPE,
    //           P_SSEXCLIEN: clientResponse.EListClient[0]?.P_SSEXCLIEN,
    //           P_STYPERECEP: "",
    //           P_NCIVILSTA: String(clientResponse.EListClient[0]?.P_NCIVILSTA),
    //           P_NNATIONALITY: clientResponse.EListClient[0]?.P_NNATIONALITY,
    //           P_NPROVINCE: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NPROVINCE,
    //           P_NLOCAL: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NLOCAL,
    //           P_NMUNICIPALITY: clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NMUNICIPALITY,
    //         };

    //         this.rentasService.getEquivalenceInformation(data3).subscribe({
    //           next: (responseInfo) => {
    //             // Aquí puedes actualizar más datos si es necesario
    //             beneficiario.coD_SEXO = responseInfo?.C_TABLE[0]?.COD_SEXO || ""

    //             console.log(beneficiario)

    //           },
    //           error: (error) => console.error(error),
    //         });
    //       },
    //       error: (error) => console.error(error),
    //     });
    //   });

    // const data = {
    //                     "coD_TIPPROD": this.ticket.COD_PRODUCTO,
    //                     "nuM_POLIZA": this.detallePoliza.NUM_POLIZA,
    //                     "coD_USUARIOCREA": "GMARTINEZ",
    //                     "monto": this.ticket.IMP_DEVOLUCION || 0,
    //                     "data": formattedData
    //                  }



    //                 this.rentasService.registroHerederos(data).subscribe({
    //                   next: (response) => {
    //                     console.log(response)
    //                     this.nuevoBeneficiario =[]
    //                     this.receivers = []
    //                     if(response.numbermsg == 0){
    //                        if(accion == "editar"){
    //                         Swal.fire({
    //                             icon: mensajeParts[0],
    //                             title: mensajeParts[1],
    //                             text: mensajeParts[2],
    //                           });
    //                        }else if(accion == "eliminar"){
    //                         Swal.fire({
    //                             icon: mensajeParts2[0],
    //                             title: mensajeParts2[1],
    //                             text: mensajeParts2[2],
    //                           });
    //                        }

    //                     }
    //                   },
    //                   error: (error) => {
    //                     console.error(error);
    //                   },
    //                 });





  }

  changeTypePaymentReceptor(receiver, index) {
    this.rentasService.getBankOrigin({ P_NTPAYWAY: receiver.tipoPagoReceptor.codigo }).subscribe({
      next: (response) => {
        this.receivers[index].BANCO_ORIGEN = response.C_TABLE[0].SDESCRIPT_ORIGIN_BANK;
        this.receivers[index].COD_BANCO_ORIGEN = response.C_TABLE[0].SCODE_ORIGIN_BANK;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  editIndex: number | null = null;
  tipoDocumento: any[];
  opcionesTipoDocumento: any[];
  getTypeFile(){
    this.rentasService.getTypeFile().subscribe({
        next: (response) => {
          this.tipoDocumento = response.C_TABLE;
          this.opcionesTipoDocumento = this.tipoDocumento.map((estado) => {
            return {
              codigo: estado.NCODE,
              valor: estado.SDESCRIPT,
            };
          });
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
  setEditMode(doc: any) {
    this.getTypeFile();
    this.doc_registrados.forEach(d => d.isEditing = false);
    doc.isEditing = true;
    this.inputs.NTYPEATTACHMENT = {
      codigo: doc.NTYPEATTACHMENT,
      valor: this.opcionesTipoDocumento.find(opcion => opcion.codigo === doc.NTYPEATTACHMENT)?.valor
    };
  }

  saveChanges(doc: any) {
    const data = {
        "P_NTICKET": doc.NTICKET,
        "P_NID": doc.NID,
        "P_NTYPEATTACHMENT": this.inputs.NTYPEATTACHMENT.codigo,
    }
    this.rentasService.getUpdNtypeActtachment(data).subscribe({
        next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
            this.separateString(response.P_SMESSAGE);
            Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
            });

            doc.NTYPEATTACHMENT = this.inputs.NTYPEATTACHMENT.codigo;
            doc.STYPEATTACHMENT = this.inputs.NTYPEATTACHMENT.valor;

        },
        error: (error) => {
            console.error(error);
        },
    })
    doc.isEditing = false;
  }

  cancelEdit(doc: any) {
    doc.isEditing = false;
    this.inputs.NTYPEATTACHMENT = null;
  }

  FechaInicio:Date
  FechaFin:Date

  getDateMaxPayment() {
    this.rentasService.getDateMaxPayment().subscribe({
        next: (response) => {
            const ndays = response.C_TABLE[0].NDAYS;
            this.FechaFin = new Date();
            this.FechaFin.setDate(this.FechaFin.getDate() + (ndays));
            this.FechaInicio.setDate(this.FechaInicio.getDate() + 1);
            console.log(this.FechaFin)
            console.log(this.FechaInicio)
        },
        error: (error) => {
            console.error(error);
        },
    });
}

getDatePayment() {
    const data = {
        "P_DATE_EVALU": new Date()
    };
    this.rentasService.getDatePayment(data).subscribe({
        next: (response) => {
            this.FechaInicio = new Date(response.C_TABLE);
            this.getDateMaxPayment()
        },
        error: (error) => {
            console.error(error);
        },
    });
}


 //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
 //REGISTRAR LOS RECEPTORES CUANDO SOLO SEAN AFP Y RV
  getGuardarReceptorAFP() {
    console.log('ENTRO A AFP Y ES RV');

    let formattedData2 = null;
    //ALMACENA LA INFORMACION DEL LISTADO
    for (const receiver of this.receivers) {
      const dataVal = {
        coD_TIPOIDEN: '9', ///RUC
        nuM_IDEN: receiver.NUM_TIPO_IDEN,
        nombrE1: receiver.NOMBRE || '',
        nombrE2: '',
        appaterno: '',
        apmaterno: '',
        direccion: '',
        coD_DIRECCION: '',
        fono: '',
        correo: '',
        coD_SEXO: '',
        feC_NAC: '',
        coD_TIPO: '',
        ocupacion: '',
        mtO_PENSION: '',
        prC_PENSION: receiver.PRC_PENSION || '',
        coD_VIAPAGO: receiver?.tipoPagoReceptor?.codigo || '',
        VIA_PAGO: receiver?.tipoPagoReceptor?.text || '',
        coD_BANCO: receiver.COD_BANCO || '',
        banco: this.opcionesBanco?.find((op) => op.codigo === receiver.COD_BANCO) ?.valor || '',
        coD_TIPCUENTA: receiver.COD_TIPO_CUENTA || '',
        TIPO_CUENTA:  this.opcionesTipoCuenta?.find((op) => op.codigo === receiver.COD_TIPO_CUENTA)?.valor || '',
        nuM_CUENTA: receiver?.NUM_CUENTA || '',
        nuM_CUENTA_CCI: receiver?.NUM_CUENTA_CCI || '',
        nuM_DOCUPAGO: '',
      };
      //console.log(dataVal);
      formattedData2 = dataVal;
    }

    const dataEnd = {
      coD_TIPPROD: this.ticket.COD_PRODUCTO,
      nuM_POLIZA: this.detallePoliza.NUM_POLIZA,
      coD_USUARIOCREA: 'GMARTINEZ',
      monto: this.ticket.IMP_DEVOLUCION || 0,
      data: [formattedData2],
    };
    //LLAMADO DE API
    this.rentasService.registroHerederos(dataEnd).subscribe({
      next: (response) => {
        console.log(response);
        this.nuevoBeneficiario = [];
        this.receivers = [];
      },
      error: (error) => console.error(error),
    });
  }

  registroHerederosObs() {
    console.log(this.receivers);
    //let formattedData2= [];
    //ALMACENA LA INFORMACION DEL LISTADO
    ///for (const receiver of this.receivers) {
    const formattedData2 = this.receivers.map((receiver) => ({
      ///const dataVal = {
          coD_TIPOIDEN: receiver.COD_TIPO_IDEN,
          nuM_IDEN: receiver.NUM_TIPO_IDEN,
          nombrE1: receiver.NOMBRE.split(' ')[0] || '',
          nombrE2: receiver.NOMBRE.split(' ')[1] || '',
          appaterno: receiver.NOMBRE.split(' ')[2] || '',
          apmaterno: receiver.NOMBRE.split(' ')[3] || '',
          direccion: '',
          coD_DIRECCION: '',
          fono: '',
          correo: '',
          coD_SEXO: '',
          feC_NAC: '',
          coD_TIPO: '',
          ocupacion: '',
          mtO_PENSION: '',
          prC_PENSION: receiver.PRC_PENSION || '',
          coD_VIAPAGO: receiver.tipoPagoReceptor.codigo || '',
          VIA_PAGO: receiver.tipoPagoReceptor.text || '',
          coD_BANCO: receiver.COD_BANCO || '',
          banco:
            this.opcionesBanco?.find((op) => op.codigo === receiver.COD_BANCO)
              ?.valor || '',
          coD_TIPCUENTA: receiver.COD_TIPO_CUENTA || '',
          TIPO_CUENTA:
            this.opcionesTipoCuenta?.find(
              (op) => op.codigo === receiver.COD_TIPO_CUENTA
            )?.valor || '',
          nuM_CUENTA: receiver.NUM_CUENTA || '',
          nuM_CUENTA_CCI: receiver.NUM_CUENTA_CCI || '',
          nuM_DOCUPAGO: '',
      ////};
      //console.log(dataVal);
     // formattedData2.push(dataVal); // ✅ Acumula cada item
    ///}  
     }));
     console.log(formattedData2);   
this.rentasService.EquivalenciaUsuario({ dni: this.ticket.SDNI_USUARIO_RESP, token: '' })
            .subscribe({
                next: (response) => {
    const data = {
            coD_TIPPROD: this.ticket.COD_PRODUCTO,
            nuM_POLIZA: this.detallePoliza.NUM_POLIZA,
            coD_USUARIOCREA: response.data[0].COD_USUARIO,
            monto: this.ticket.IMP_DEVOLUCION || 0,
            data: formattedData2,
            };
   console.log(data);            
        this.rentasService.registroHerederos(data).subscribe({
        next: (response) => {
            console.log(response);
            this.nuevoBeneficiario = [];
            this.receivers = [];
        },
        error: (error) => console.error(error),
        });
        },
            error: (error) => {
            console.error(error);
        },
    });
     
  }
 //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

}