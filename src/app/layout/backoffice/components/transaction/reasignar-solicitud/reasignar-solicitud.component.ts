import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReasignarSolicitudDto } from './DTOs/reasignarSolicitud.dto';
import { ReasignarSolicitudService } from '../../../services/transaccion/reasignar-solicitud/reasignar-solicitud.service';
import {
  IBuscarResponse,
  ICanalResponse,
  ITipoCResponse,
  IPuntoVDResponse,
  ICanalDResponse,
  CanalOrigenRequest,
  PuntoVORequest,
  IValidarResponse,
  InsertarResponse,
  ErrorResponse,
} from '../../../models/transaccion/reasignar-solicitud/reasignar-solicitud.model';
import { ParseDateService } from '../../../services/transaccion/shared/parse-date.service';
import { HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../../app.config';
import moment from 'moment';
@Component({
  selector: 'app-reasignar-solicitud',
  templateUrl: './reasignar-solicitud.component.html',
  styleUrls: ['./reasignar-solicitud.component.scss'],
})
export class ReasignarSolicitudComponent implements OnInit {
  formNuevoRegistro: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  IPuntoVResponse;
  urlApi: string;
  form: FormGroup;

  limitPolicy: { min: number, max: number };
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _ReasignarSolicitudService: ReasignarSolicitudService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _ParseDateService: ParseDateService
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date()
      }
    );
    const date = new Date();
    this.form = this._FormBuilder.group({
      fecha_ini: [new Date(date.setMonth(date.getMonth() - 6))],
      fecha_fin: [new Date()],
      canal_o: [0],
      canal_d: [0],
    });
    this.limitPolicy = {
      min: 10,
      max: 10
    };
    this.formNuevoRegistro = this._FormBuilder.group({
      certOrLote: ['Certificado', Validators.required],
      canalVentaOrigen: [null, Validators.required],
      puntoVentaOrigen: [null, Validators.required],
      tipoCertificado: [null, Validators.required],
      totalCertificado: [null, Validators.required],
      nCertificadoLote: [null, Validators.compose([
        Validators.required,
        Validators.pattern(/^\d*$/),
        Validators.minLength(this.limitPolicy.min),
        Validators.maxLength(this.limitPolicy.max),
      ])],
      canalDestino: [null, Validators.required],
      puntoVentaDestino: [null, Validators.required],
    });
  }

  get ff() {
    return this.formNuevoRegistro.controls;
  }

  get f(): any {
    return this.form.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  currentPage = 0;
  p = 0;
  dataBuscar: any;
  downloadURL: any;
  dataCanal: any;
  informacion2: any;
  dataPuntoV: any;
  dataInsertar: any;
  dataError: any;
  dataCanalO: any;
  dataValidar: any;
  dataTipoDoc: any;
  dataPuntoVO: any;
  MENSAJECONFIRMACION: any;
  MENSAJEFALTA: any;
  MENSAJERROR: any;
  dataCanalD: any;
  informacion: any;
  dataReasignarSolicitud: ReasignarSolicitudDto[] = [];
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalConfirmacion', { static: true })
  modalConfirmacion: ModalDirective;
  @ViewChild('modalError', { static: true })
  modalError: ModalDirective;
  @ViewChild('modalFalta', { static: true })
  modalFalta: ModalDirective;
  ngOnInit(): void {
    this.buscar();
    this.formNuevoRegistro.get('canalVentaOrigen').disable();
    this.formNuevoRegistro.get('puntoVentaOrigen').disable();
    this.formNuevoRegistro.get('totalCertificado').disable();
    this.canal();
    this.tipoDoc();
    this.canalD();
    this.puntoV(this.informacion);

    this.ff['nCertificadoLote'].valueChanges.subscribe(val => {
      if (val) {
        if (this.ff['nCertificadoLote'].hasError('pattern')) {
          this.ff['nCertificadoLote'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
  }

  nuevoRegistro(): void {
    this.modal.show();
    this.changeCertOrLote();
  }

  changeCertificado(): void {
    this.validar();
  }
  changeCertOrLote(): void {
    if (this.ff['certOrLote'].value === 'Lote') {
      this.ff['tipoCertificado'].disable();
      this.ff['canalVentaOrigen'].setValue(null);
      this.ff['puntoVentaOrigen'].setValue(null);
      this.ff['puntoVentaDestino'].setValue(null);
      this.ff['tipoCertificado'].setValue(null);
      this.ff['canalDestino'].setValue(null);
      this.ff['nCertificadoLote'].setValue(null);
      this.ff['totalCertificado'].setValue(null);
      this.limitPolicy = {
        min: 4,
        max: 4
      };
    } else {
      this.ff['tipoCertificado'].enable();
      this.ff['canalVentaOrigen'].setValue(null);
      this.ff['puntoVentaOrigen'].setValue(null);
      this.ff['puntoVentaDestino'].setValue(null);
      this.ff['tipoCertificado'].setValue(null);
      this.ff['canalDestino'].setValue(null);
      this.ff['nCertificadoLote'].setValue(null);
      this.ff['totalCertificado'].setValue(null);
      this.limitPolicy = {
        min: 10,
        max: 10
      };
    }
    this.ff['nCertificadoLote'].setValidators(Validators.compose([
      Validators.required,
      Validators.pattern(/^\d*$/),
      Validators.minLength(this.limitPolicy.min),
      Validators.maxLength(this.limitPolicy.max),
    ]));
    this.ff['nCertificadoLote'].updateValueAndValidity();
  }
  cancelRegistro(): void {
    this.modal.hide();
    this.formNuevoRegistro.reset();
    this.ff['certOrLote'].setValue('Certificado');
    this.ff['canalVentaOrigen'].setValue(null);
    this.ff['puntoVentaOrigen'].setValue(null);
    this.ff['tipoCertificado'].setValue(null);
    this.ff['puntoVentaDestino'].setValue(null);
    this.ff['canalDestino'].setValue(null);
    this.ff['totalCertificado'].setValue(null);
  }

  buscar() {
    this._spinner.show();
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_NPOLICY_O: this.f['canal_o'].value,
      P_NPOLICY_D: this.f['canal_d'].value,
      P_DFCREABEGIN: moment(this.f['fecha_ini'].value).format('YYYY-MM-DD'),
      P_DFCREAEND: moment(this.f['fecha_fin'].value).format('YYYY-MM-DD'),
      _: new Date().getTime(),
    };
    this._ReasignarSolicitudService.buscar(data).subscribe(
      (response: IBuscarResponse) => {
        this.dataBuscar = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // FILTROS
  canal() {
    const data: any = {
      _: 1634749648682,
    };
    this._ReasignarSolicitudService.canal(data).subscribe(
      (response: ICanalResponse) => {
        this.dataCanal = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // MODALES

  tipoDoc() {
    const data: any = {
      S_TYPE: 'TYPECERTIF',
      _: 1634764848578,
    };
    this._ReasignarSolicitudService.tipoC(data).subscribe(
      (response: ITipoCResponse) => {
        this.dataTipoDoc = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  canalD() {
    const data: any = {
      P_NPOLICY: 0,
      _: 1634765747943,
    };
    this._ReasignarSolicitudService.canalD(data).subscribe(
      (response: ICanalDResponse) => {
        this.dataCanalD = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  changeCanal(val) {
    this.puntoV(val);
    this.informacion = val;
  }

  puntoV(val) {
    const data: any = {
      P_NPOLICY: val,
      P_NNUMPOINT: 0,
      _: 1634764564849,
    };
    this.dataPuntoV = null;
    this.ff['puntoVentaDestino'].setValue(null);
    this._ReasignarSolicitudService.puntoV(data).subscribe(
      (response: IPuntoVDResponse) => {
        this.dataPuntoV = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  exportar() {
    this.downloadURL =
      this.urlApi +
      '/Reassign/Report/ReassignReport?P_NPOLICY_O=' +
      this.f['canal_o'].value +
      '&P_NPOLICY_D=' +
      this.f['canal_d'].value +
      '&P_DFCREABEGIN=' +
      moment(this.f['fecha_ini'].value).format('YYYY-MM-DD') +
      '&P_DFCREAEND=' +
      moment(this.f['fecha_fin'].value).format('YYYY-MM-DD');
    window.open(this.downloadURL);
  }

  // CANAL DE ORIGEN

  canalo() {
    const data: any = {
      P_NPOLICY: 0,
      _: 1634715941178,
    };
    this._ReasignarSolicitudService.canalO(data).subscribe(
      (response: CanalOrigenRequest) => {
        this.dataCanalO = response;
        this.ff['canalVentaOrigen'].setValue(
          this.dataValidar?.objParameters?.P_NPOLICY_O
        );
        this.puntov();
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  textoCanalO(idCO) {
    return (
      this.dataCanalO?.PRO_POLICY?.find(
        (x) => x.NIDPOLICY?.toString() === idCO?.toString()
      )?.SCLIENAME || ''
    );
  }

  // PUNTO DE VENTA ORIGEN

  puntov() {
    const data: any = {
      P_NPOLICY: this.dataValidar?.objParameters?.P_NPOLICY_O,
      P_NNUMPOINT: 0,
      _: 1634936810409,
    };
    this._ReasignarSolicitudService.puntoVO(data).subscribe(
      (response: PuntoVORequest) => {
        this.dataPuntoVO = response;
        this.ff['puntoVentaOrigen'].setValue(
          this.dataValidar?.objParameters?.P_NNUMPOINT_O
        );
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  textoPuntoVO(idPO) {
    return (
      this.dataPuntoVO?.PRO_SALE_POINT?.find(
        (x) => x.NNUMPOINT?.toString() === idPO?.toString()
      )?.SDESCRIPT || ''
    );
  }

  newPolicy(val: any): string {
    val = val?.toString();
    let count = 0;
    let continueFor = true;
    val
      .substring(1, val.length - 1)
      .split('')
      .forEach((e) => {
        if (continueFor) {
          if (e === '0') {
            count++;
          } else {
            continueFor = false;
          }
        }
      });
    return val.substring(1, val.length - 1).substring(count, val.length);
  }

  validar() {
    const ncertifValid = this.ff['nCertificadoLote'].value && this.ff['nCertificadoLote'].valid;
    if (this.ff['certOrLote'].value === 'Lote') {
      if (ncertifValid) {
        const data: any = {
          P_NUMLOT: this.ff['nCertificadoLote'].value,
          P_NPOLICY_O: 0,
          P_NNUMPOINT_O: 0,
          P_NTIPPOL: 0,
          P_NQUANTITY: 0,
        };
        this._ReasignarSolicitudService.validar2(data).subscribe(
          (response: IValidarResponse) => {
            this.dataValidar = response;
            this.canalo();
            this.ff['totalCertificado'].setValue(
              this.dataValidar?.objParameters?.P_NQUANTITY
            );
            this.ff['tipoCertificado'].setValue(
              this.dataValidar?.objParameters?.P_NTIPPOL
            );
            this._spinner.hide();
          },
          (error: ErrorResponse) => {
            console.error(error);
            this.dataValidar = null;
            this.ff['canalVentaOrigen'].setValue(null);
            this.ff['puntoVentaOrigen'].setValue(null);
            this.ff['totalCertificado'].setValue(null);
            this.dataError = error;
            this.MENSAJERROR = 'No se encontraron datos para el numero de lote ingresado';
            this._spinner.hide();
            this.modal.hide();
            this.modalError.show();
          }
        );
      }
    }
    if (this.ff['certOrLote'].value === 'Certificado') {
      if (this.ff['tipoCertificado'].value && ncertifValid) {
        const val = this.ff['nCertificadoLote'].value?.toString();
        let count = 0;
        let continueFor = true;
        val.substring(1, val.length - 1).split('').forEach((e) => {
          if (continueFor) {
            if (e === '0') {
              count++;
            } else {
              continueFor = false;
            }
          }
        });
        const newPolicy = val
          .substring(1, val.length - 1)
          .substring(count, val.length);

        const data: any = {
          P_NUMLOT: this.ff['nCertificadoLote'].value,
          P_NPOLICY_O: 0,
          P_NNUMPOINT_O: 0,
          P_NTIPPOL: this.ff['tipoCertificado'].value,
          P_NQUANTITY: 0,
          RANGE_LIST: newPolicy, // 2568 REVISAR - PROBLEMAS EN BACKOFFICE GET DE APIS ********
          _: new Date().getTime(),
        };
        this._ReasignarSolicitudService.validar(data).subscribe(
          (response: IValidarResponse) => {
            this.dataValidar = response;
            this.canalo();
            this.ff['totalCertificado'].setValue(
              this.dataValidar?.objParameters?.P_NQUANTITY
            );
            this._spinner.hide();
          },
          (error: ErrorResponse) => {
            console.error(error);
            this._spinner.hide();
            this.dataValidar = null;
            this.ff['canalVentaOrigen'].setValue(null);
            this.ff['puntoVentaOrigen'].setValue(null);
            this.ff['totalCertificado'].setValue(null);
            this.MENSAJERROR = 'Los certificados ingresados no han sido asignados.';
            this.dataError = error;
            this.modal.hide();
            this.modalError.show();
          }
        );
      }
    }
  }

  insertar(): void {
    if (this.dataValidar?.objParameters?.P_NTIPPOL !== +this.ff['tipoCertificado'].value) {
      this.MENSAJERROR = 'Los numeros de certificados no pertenecen al mismo Canal de Venta.';
      this.modal.hide();
      this.modalError.show();
      return;
    }
    this._spinner.show();
    if (this.ff['certOrLote'].value === 'Lote') {
      // tslint:disable-next-line:max-line-length
      if ((this.dataValidar?.objParameters.P_NPOLICY_O === (+this.ff['canalDestino'].value)) &&
        (this.dataValidar?.objParameters.P_NNUMPOINT_O === (+this.ff['puntoVentaDestino'].value))) {
        // this._spinner.hide();
        this.MENSAJERROR = 'Debe seleccionar un Punto de venta Destino diferente';
        this.modal.hide();
        this._spinner.hide();
        this.modalError.show();
        return;
      }
      let count = 0;
      this.ff['nCertificadoLote'].value
        .toString()
        .substring(1, this.ff['nCertificadoLote'].value.toString().length - 1)
        .split('')
        .forEach((e) => {
          if (e === '0') {
            count++;
          } else {
            return;
          }
        });
      const newPolicy1 = this.ff['nCertificadoLote'].value
        .toString()
        .substring(1, this.ff['nCertificadoLote'].value.toString().length - 1)
        .substring(count, this.ff['nCertificadoLote'].value.toString().length);
      const data: any = {
        P_NUSERREGISTER: this.currentUser.id,
        P_NPOLICY_O: this.ff['canalVentaOrigen'].value,
        P_NPOLICY_D: this.ff['canalDestino'].value,
        P_NNUMPOINT_O: this.ff['puntoVentaOrigen'].value,
        P_NNUMPOINT_D: this.ff['puntoVentaDestino'].value,
        P_SRANGE: this.ff['nCertificadoLote'].value,
        P_NTYPECERTIF: this.ff['tipoCertificado'].value,
        P_NQUANTITY: this.ff['totalCertificado'].value,
        P_TYPE_ASSIGN: 0,
        P_STATE: this.dataValidar?.objParameters?.P_STATE,
        P_MESSAGE: '',
        RANGE_LIST: newPolicy1,
      };
      this._ReasignarSolicitudService.insertar(data).subscribe(
        (response: InsertarResponse) => {
          this.dataInsertar = response;
          this.modalConfirmacion.show();
          this.modal.hide();
          this.MENSAJECONFIRMACION =
            this.dataInsertar?.objParameters?.P_MESSAGE;
          this.dataValidar = null;
          this._spinner.hide();
        },
        (error: any) => {
          console.error(error);
          // this._spinner.hide();
          this.MENSAJERROR = 'Los certificados ingresados no pertenecen al mismo Punto de Venta';
          this.modal.hide();
          this._spinner.hide();
          this.modalError.show();
        }
      );
    }
    if (this.ff['certOrLote'].value === 'Certificado') {

      const data: any = {
        P_NUSERREGISTER: this.currentUser.id,
        P_NPOLICY_O: this.ff['canalVentaOrigen'].value,
        P_NPOLICY_D: this.ff['canalDestino'].value,
        P_NNUMPOINT_O: this.ff['puntoVentaOrigen'].value,
        P_NNUMPOINT_D: this.ff['puntoVentaDestino'].value,
        P_SRANGE: this.ff['nCertificadoLote'].value,
        P_NTYPECERTIF: this.ff['tipoCertificado'].value,
        P_NQUANTITY: this.ff['totalCertificado'].value,
        P_TYPE_ASSIGN: 0,
        P_STATE: this.dataValidar?.objParameters?.P_STATE,
        P_MESSAGE: '',
        RANGE_LIST: this.dataValidar?.objParameters?.RANGE_LIST,
      };
      this._ReasignarSolicitudService.insertar(data).subscribe(
        (response: InsertarResponse) => {
          this.dataInsertar = response;
          this.modalConfirmacion.show();
          this.modal.hide();
          this.MENSAJECONFIRMACION =
            this.dataInsertar?.objParameters?.P_MESSAGE;
          this.dataValidar = null;
          this._spinner.hide();
        },
        (error: any) => {
          console.error(error);
          this._spinner.hide();
          this.MENSAJERROR = 'Los numeros de certificados no pertenecen al mismo Canal de Venta';
          this.modal.hide();
          this.modalError.show();
        }
      );
    }
  }

  ocultarModalConfirmacion() {
    this.modalConfirmacion.hide();
    this.buscar();
    this.formNuevoRegistro.get('certOrLote').setValue('Certificado');
    this.formNuevoRegistro.get('canalVentaOrigen').setValue(0);
    this.formNuevoRegistro.get('puntoVentaOrigen').setValue(0);
    this.formNuevoRegistro.get('puntoVentaDestino').setValue(0);
    this.formNuevoRegistro.get('tipoCertificado').setValue(0);
    this.formNuevoRegistro.get('canalDestino').setValue(0);
    this.formNuevoRegistro.get('nCertificadoLote').setValue('');
    this.formNuevoRegistro.get('totalCertificado').setValue('');
  }

  ocultarModalError() {
    this.modalError.hide();
    this.modal.show();
  }

  ocultarModalFalta() {
    this.modalFalta.hide();
    this.modal.show();
  }
}
