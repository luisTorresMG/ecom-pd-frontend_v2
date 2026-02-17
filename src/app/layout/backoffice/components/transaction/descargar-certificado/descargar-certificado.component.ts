import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DescargoCertificadoService } from '../../../services/transaccion/descargo-certificado/descargo-certificado.service';
import {
  IEstadoResponse,
  ICanalResponse,
  IProcessResponse,
  IObtenerResponse,
  IDescargoResponse,
} from '../../../models/transaccion/descargar-certificado/descargar-certificado.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IGetLotsPayload, IGetLotsResponse } from '@root/layout/backoffice/interfaces/descargo-certificado.interface';

@Component({
  selector: 'app-descargar-certificado',
  templateUrl: './descargar-certificado.component.html',
  styleUrls: ['./descargar-certificado.component.css'],
})
export class DescargarCertificadoComponent implements OnInit {
  form: FormGroup;

  intentos: number;
  currentPage: number = 0;
  dataEstado: any;
  dataCanal: any;
  MENSAJE: any;
  seleccionado: any;
  MENSAJECONFIRMACION: any;
  MENSAJEERROR: any;
  dataObtener: any;
  dataDescarg: any;
  INFO: any;
  dataProcess: any;
  dataInfo: any;
  p: number = 0;
  mensajeModal: string;
  isShowModal: boolean;

  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalEliminar', { static: true }) modalEliminar: ModalDirective;
  @ViewChild('modalAviso', { static: true }) modalAviso: ModalDirective;
  @ViewChild('modalConfirmacion', { static: true }) modalConfirmacion: ModalDirective;
  @ViewChild('modalError', { static: true }) modalError: ModalDirective;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly descargoCertificadoService: DescargoCertificadoService,
    private readonly builder: FormBuilder
  ) {
    this.isShowModal = false;
    this.form = this.builder.group({
      estado: [0, Validators.required],
      canal: [0, Validators.required],
      certificado: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
        ]),
      ],
    });
    this.dataInfo = {
      entities: [],
    };
    this.intentos = 0;
  }

  ngOnInit(): void {
    this.estado();
    this.canal();
    window.scrollTo(0, 0);
    this.f['certificado'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['certificado'].hasError('pattern')) {
          this.f['certificado'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  get f(): any {
    return this.form.controls;
  }

  busqueda() {
    this.searchData();
  }

  searchData() {
    const datai: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_NPOLICY: this.f['certificado'].value,
      P_CODCANAL: this.f['canal'].value,
      P_DESCANAL: this.textoCanal(this.f['canal'].value),
      P_NSTATUSPOL_ORI: this.f['estado'].value,
      P_SSTATUSPOL: this.textoEstado(this.f['estado'].value),
      P_STATUS: 0,
      _: 1634696043294,
    };
    if (this.f['certificado'].value === '') {
      this.modalAviso.show();
      this.MENSAJE = 'El campo CERTIFICADO no puede estar vacío.';
    } else {
      if (this.f['estado'].value === 0) {
        this.modalAviso.show();
        this.MENSAJE = 'El campo ESTADO no puede estar vacío.';
      } else {
        if (this.f['canal'].value === 0) {
          this.modalAviso.show();
          this.MENSAJE = 'El campo CANAL DE VENTA no puede estar vacío.';
        } else {
          if (
            !!this.dataInfo.entities.find(
              (x) => x.P_NPOLICY_OUT === this.f['certificado'].value
            )
          ) {
            this.modalAviso.show();
            this.MENSAJE = 'El CERTIFICADO ya se encuentra en la lista actual.';
            return;
          }
          this.spinner.show();
          this.descargoCertificadoService.buscar(datai).subscribe(
            (response: any) => {
              if (response?.Errores && response?.Errores !== 'null') {
                this.modalAviso.show();
                this.MENSAJE = response?.Errores;
              }

              this.dataInfo.entities.push(...response.entities);
              this.spinner.hide();
              this.intentos++;

              if (!response?.entities.length && this.intentos < 2) {
                this.searchData();
                return;
              }

              if (response?.entities.length) {
                this.f['estado'].disable();
                this.form.get('certificado').setValue('');
              }

              this.intentos = 0;
            },
            (error: any) => {
              console.log(error);
              this.spinner.hide();
            },
          );
        }
      }
    }
  }

  showModalGenerarLote(): void {
    this.modal.show();
  }

  closeGenerarLoteModal(): void {
    this.modal.hide();
  }

  showModalEliminar(data): void {
    this.modalEliminar.show();
    this.INFO = data;
  }

  hideModalEliminar(): void {
    this.modalEliminar.hide();
  }

  eliminarPoliza(): void {
    this.dataInfo.entities = this.dataInfo.entities.filter(
      (x) => x.P_NPOLICY_OUT !== this.INFO.P_NPOLICY_OUT
    );
    if (this.dataInfo.entities.length) {
      this.f['estado'].enable();
    }
    this.modalEliminar.hide();
  }

  onChange(seleccionado) {
    this.seleccionado = seleccionado;
  }

  textoEstado(idEstado) {
    return (
      this.dataEstado?.PRO_CURRENCY?.find(
        (x) => x.NSTATUSPOL?.toString() === idEstado?.toString()
      )?.SDESCRIPT || ''
    );
  }

  estado() {
    const data: any = {
      _: 1634689371321,
    };
    this.descargoCertificadoService.estado(data).subscribe(
      (response: IEstadoResponse) => {
        this.dataEstado = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  textoCanal(idCanal) {
    return (
      this.dataCanal?.PRO_POLICY?.find(
        (x) => x.NIDPOLICY?.toString() === idCanal?.toString()
      )?.SCLIENAME || ''
    );
  }

  canal() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1634689371333,
    };
    this.descargoCertificadoService.canal(data).subscribe(
      (response: ICanalResponse) => {
        this.dataCanal = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }


  limpiar() {
    this.form.get('estado').setValue(0);
    this.f['estado'].enable();
    this.form.get('canal').setValue(0);
    this.form.get('certificado').setValue('');
    this.dataInfo.entities = [];
  }

  ocultarModalAviso() {
    this.modalAviso.hide();
    this.modalConfirmacion.hide();
    this.modalError.hide();
  }

  descarg() {
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      _: 1634696043294,
    };
    this.descargoCertificadoService.descargo(data).subscribe(
      (response: IDescargoResponse) => {
        this.dataDescarg = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  descargoPolizas() {
    const certificates: any[] = this.dataInfo?.entities ?? [];
    const groupChannels: any[] = [];

    certificates.forEach((certificate: any): void => {
      if (groupChannels.some(x => +x.codigoCanal === +certificate.P_CODCANAL)) {
        return;
      }

      groupChannels.push({
        codigoCanal: certificate.P_CODCANAL.toString(),
        canal: certificate.P_DESCANAL,
        planilla: certificate.P_NINCLPAYROLL,
        estadoOrigen: certificate.P_NSTATUSPOL,
        origen: certificate.P_SORIGEN,
        listaPoliza: certificates.filter(x => x.P_CODCANAL == certificate.P_CODCANAL).map((item) => item.P_NPOLICY_OUT.toString())
      });
    });

    const payload: IGetLotsPayload = {
      idUsuario: this.currentUser['id'],
      estadoPoliza: this.f['estado'].value,
      nombreArchivo: null,
      detalle: groupChannels
    };

    this.modal.hide();
    this.spinner.show();

    this.descargoCertificadoService.getLots(payload).subscribe({
      next: (response: IGetLotsResponse): void => {
        console.dir(response);
        this.spinner.hide();

        if (!response.success) {
          this.MENSAJEERROR = response.message;
          this.modalError.show();
          return;
        }

        this.modalConfirmacion.show();
        this.MENSAJECONFIRMACION = `Se generó correctamente el lote de descargo N° ${response.numeroLote}`;
        this.limpiar();
        // this.descarg();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      }
    });
  }
}
