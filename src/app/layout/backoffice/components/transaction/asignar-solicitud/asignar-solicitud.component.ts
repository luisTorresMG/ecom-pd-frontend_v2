import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AsignarSolicitudDto, DatosLoteDto } from './DTOs/asignarSolicitud.dto';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import * as CDto from './DTOs/asignarSolicitud.dto';
import * as SDto from '../../../services/transaccion/asignar-solicitud/DTOs/asignar-solicitud.dto';
import { AsignarSolicitudService } from '../../../services/transaccion/asignar-solicitud/asignar-solicitud.service';
import { ParseDateService } from '../../../services/transaccion/shared/parse-date.service';
import * as SSDto from '../../../services/transaccion/shared/DTOs/channel-point.dto';
import { ChannelPointService } from '../../../services/transaccion/shared/channel-point.service';
import moment from 'moment';
import { AppConfig } from '../../../../../app.config';
import { RegularExpressions } from '@shared/regexp/regexp';
@Component({
  selector: 'app-asignar-solicitud',
  templateUrl: './asignar-solicitud.component.html',
  styleUrls: ['./asignar-solicitud.component.scss'],
})
export class AsignarSolicitudComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 1));
  bsValueFin: Date = new Date();
  formAsignarSolicitud: FormGroup;
  formSearchPoliza: FormGroup;
  formRange: FormGroup = this.builder.group({
    ini: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    fin: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
  });

  urlApi: string;

  message: string;

  @ViewChild('modalAlert', { static: true, read: TemplateRef })
  _modalAlert: TemplateRef<any>;

  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly builder: FormBuilder,
    private readonly _AsignarSolicitudService: AsignarSolicitudService,
    private readonly _ParseDateService: ParseDateService,
    private readonly _ChannelPointService: ChannelPointService,
    private readonly _vc: ViewContainerRef
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.formAsignarSolicitud = this.builder.group({
      P_NIDPOLICY: [0, Validators.compose([Validators.required])],
      P_NNUMPOINT: [0, Validators.compose([Validators.required])],
      P_NPRODUCT: [0, Validators.compose([Validators.required])],
      P_NQUANTITY: [
        null,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^[0-9]*$/),
        ]),
      ],
    });
    this.formSearchPoliza = this.builder.group({
      P_NIDREQUEST: [''],
      P_NPOLICYS: [''],
      P_NSALEPOINTS: [''],
      P_NSTATUS: [0],
      P_DFCREABEGIN: [this.bsValueIni],
      P_DFCREAEND: [this.bsValueFin],
    });
    this.datosLote = {
      canalVenta: '',
      cantidad: '',
      desde: '',
      hasta: '',
      nLote: '',
      nSolicitud: '',
      puntoVenta: '',
      tipo: '',
    };
    this.btnRango = false;
    this.btnGrabar = false;
    this.selec = false;
    this.statusPolizaData();
  }
  currentPage = 0;
  p = 0;
  dataAsignarSolicitud: AsignarSolicitudDto[] = [];
  datosLote: DatosLoteDto = null;
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalMessage', { static: true }) modalMessage: ModalDirective;
  btnRango: boolean;
  btnGrabar: boolean;
  selec: boolean;
  CANAL_VENTA_DATA: SSDto.CanalVentaDto[] = [];
  CANAL_VENTA_DATA_NEW_POLICY: SSDto.CanalVentaDto[] = [];
  solicitud: number;

  PUNTO_VENTA_DATA: SSDto.PuntoVentaDto = {
    PRO_SALE_POINT: [
      {
        NNUMPOINT: 0,
        SDESCRIPT: '',
      },
    ],
  };
  PUNTO_VENTA_NEW_POLICY_DATA: SSDto.PuntoVentaDto = {
    PRO_SALE_POINT: [
      {
        NNUMPOINT: 0,
        SDESCRIPT: '',
      },
    ],
  };
  STATUS_POLCICY: SDto.StatusPolicy = {
    PRO_MASTER: [
      {
        SDECRIPTION: '',
        SITEM: 0,
      },
    ],
  };
  POLIZAS_DATA: SDto.PolizasDataDto = {
    ROWTOTAL: 0,
    STATUS: 0,
    entities: [
      {
        DREGISTER: '',
        NAMOUNTCOVERED: 0,
        NIDPOLICY: 0,
        NIDREQUEST: 0,
        NNUMLOT: 0,
        NNUMPOINT: 0,
        NPOLFIN: 0,
        NPOLINI: 0,
        NQUANTITYAMOUNT: 0,
        NREQUESTEDAMOUNT: 0,
        NTYPECERTIF: 0,
        NUSERREGISTER: 0,
        ROWNUMBER: 0,
        ROWTOTAL: 0,
        SCERTIFICATE: '',
        SPOLICY: '',
        SSALEPOINT: '',
        SSTATUS: '',
        STATUS: 0,
        TAG: '',
      },
    ],
  };
  TIPOS_CERTIFICADOS: SDto.TipoCertificadosDto = {
    PRO_MASTER: [
      {
        SDECRIPTION: '',
        SITEM: '',
      },
    ],
  };
  LOTE_DATA: CDto.LoteDataDto = {
    NIDREQUEST: 0,
    SPOLICY: '',
    SSALEPOINT: '',
    NNUMLOT: 0,
    SCERTIFICATE: '',
    P_NIDPOLICY: 0,
    P_NNUMPOINT: 0,
    P_NTIPPOL: 0,
    NPOLFIN: 0,
    NPOLINI: 0,
    NQUANTITYAMOUNT: 0,
  };
  LOTE_RANGO: SDto.LoteRango = {
    PRO_SEL_RANGE: {
      P_NPOLFIN_L: 0,
      P_NPOLINI_L: 0,
      P_TOTAL: 0,
    },
  };
  LOTE_RANGO_FOR_REQUEST: CDto.LoteRangoDto = {
    P_NPRODUCT: 0,
    P_QUANTITY: 0,
    P_USER: 0,
    P_IDREQUEST: 0,
  };
  P_IDREQUEST: CDto.CantidadAsignadaDto = {
    P_IDREQUEST: 0,
  };
  AMOUNTCOVERED = false;
  messageModal: string;
  downloadURL2: any;
  ngOnInit(): void {
    this.busqueda();
    this.f['P_NSALEPOINTS'].setValue('');
    window.scrollTo(0, 0);
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this._spinner.show();
    const dataUser = {
      nusercode: Number.parseInt(
        JSON.parse(localStorage.getItem('currentUser')).id
      ),
      nchannel: 0,
      scliename: '',
    };
    this._ChannelPointService.canalVentaData(dataUser).subscribe(
      (res: SSDto.CanalVentaDto[]) => {
        console.log(res);
        this.CANAL_VENTA_DATA_NEW_POLICY = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
    this.fc['P_NPRODUCT'].valueChanges.subscribe((val) => {
      console.log(val);
      if (val === 0) {
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
      } else {
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
      }
      this.fc['P_NNUMPOINT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NIDPOLICY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NQUANTITY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NPRODUCT'].updateValueAndValidity({
        emitEvent: false,
      });
    });
    this.fc['P_NIDPOLICY'].valueChanges.subscribe((val) => {
      console.log(val);
      if (val === 0) {
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      } else {
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      }
      this.fc['P_NNUMPOINT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NPRODUCT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NQUANTITY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NIDPOLICY'].updateValueAndValidity({
        emitEvent: false,
      });
    });

    this.fc['P_NNUMPOINT'].valueChanges.subscribe((val) => {
      console.log(val);
      if (val === 0) {
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(Validators.compose([]));
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      } else {
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      }
      this.fc['P_NIDPOLICY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NNUMPOINT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NPRODUCT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NQUANTITY'].updateValueAndValidity({
        emitEvent: false,
      });
    });

    this.fc['P_NQUANTITY'].valueChanges.subscribe((val) => {
      console.log(val);
      if (val) {
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.fc['P_NQUANTITY'].setValue(val.substring(0, val.length - 1));
        }
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      } else {
        this.fc['P_NIDPOLICY'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NNUMPOINT'].setValidators(
          Validators.compose([Validators.required])
        );
        this.fc['P_NPRODUCT'].setValidators(
          Validators.compose([Validators.required])
        );
      }
      console.log(val);
      this.fc['P_NQUANTITY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NIDPOLICY'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NNUMPOINT'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['P_NPRODUCT'].updateValueAndValidity({
        emitEvent: false,
      });
      if (val) {
        if (this.fc['P_NQUANTITY'].hasError('pattern')) {
          this.fc['P_NQUANTITY'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.formRangeControl['ini'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (this.formRangeControl['ini'].hasError('pattern')) {
          this.formRangeControl['ini'].setValue(
            value.slice(0, value.length - 1)
          );
        }
        this.formRangeControl['fin'].setValue(
          +value + ((+this.LOTE_RANGO.PRO_SEL_RANGE.P_TOTAL || 0) - 1)
        );
      }
      console.log(this.fc['P_NQUANTITY'].value);
      this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L = +value;

      if (!value) {
        this.formRangeControl['fin'].setValue(null);
      }
    });

    this.formRangeControl['fin'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (this.formRangeControl['fin'].hasError('pattern')) {
          this.formRangeControl['fin'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
      this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLFIN_L = +value;
    });
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get formRangeControl(): { [key: string]: AbstractControl } {
    return this.formRange.controls;
  }

  get f() {
    return this.formSearchPoliza.controls;
  }

  get fc() {
    return this.formAsignarSolicitud.controls;
  }
  CanalVentaData(e): void {
    console.log(e);
    this.CANAL_VENTA_DATA = e;
  }
  PuntoVentaData(e): void {
    this.PUNTO_VENTA_DATA = e;
    console.log(e);
  }
  setDefaultValueFormSearchPoliza(): void {
    this.formSearchPoliza.reset();
    this.formSearchPoliza
      .get('P_DFCREABEGIN')
      .setValue(new Date(this.fecha.setMonth(this.fecha.getMonth() - 6)));
    this.formSearchPoliza.get('P_DFCREAEND').setValue(new Date());
  }
  nuevaSolicitud(): void {
    this.modal.show();
    this._AsignarSolicitudService.tipoCertificados().subscribe(
      (res: SDto.TipoCertificadosDto) => {
        console.log(res);
        this.TIPOS_CERTIFICADOS = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  cancelNuevaSolicitud(): void {
    this.PUNTO_VENTA_NEW_POLICY_DATA = null;
    this.formAsignarSolicitud.reset();
    this.formAsignarSolicitud.get('P_NPRODUCT').setValue(0);
    this.formAsignarSolicitud.get('P_NIDPOLICY').setValue(0);
    this.formAsignarSolicitud.get('P_NNUMPOINT').setValue(0);
    this.modal.hide();
  }
  nuevaSolicitudSubmit(): void {
    if (this.formAsignarSolicitud.valid) {
    }
  }
  showModalMessage(msg: string): void {
    this.messageModal = msg;
    this.modalMessage.show();
  }
  hideModalMessage(): void {
    this.formSearchPoliza.reset();
    this.formSearchPoliza.get('P_NSALEPOINTS').setValue('');
    this.formSearchPoliza.get('P_NPOLICYS').setValue('');
    this.formSearchPoliza.get('P_NIDREQUEST').setValue('');
    this.formSearchPoliza.get('P_NSTATUS').setValue(0);
    this.formSearchPoliza.get('P_DFCREABEGIN').setValue(this.bsValueIni);
    this.formSearchPoliza.get('P_DFCREAEND').setValue(this.bsValueFin);
    this.formAsignarSolicitud.reset();
    this.formAsignarSolicitud.get('P_NIDPOLICY').setValue(0);
    this.formAsignarSolicitud.get('P_NNUMPOINT').setValue(0);
    this.formAsignarSolicitud.get('P_NPRODUCT').setValue(0);
    this.clearDataLote();
    this.modalMessage.hide();
    this.busqueda();
  }
  searchData(): void {
    this._spinner.show();
  }
  verDataLote(data: any): void {
    console.log(data);

    if (+data.NUSERREGISTER !== +this.currentUser.id) {
      this.showModalAlert(
        'Usted no puede asignar este requerimiento, ya que usted No lo ha generado.'
      );
      return;
    }
    this.btnRango = false;
    this.btnGrabar = false;
    this.LOTE_DATA = {
      NIDREQUEST: data.NIDREQUEST,
      NNUMLOT: data.NNUMLOT,
      SCERTIFICATE: data.SCERTIFICATE,
      SPOLICY: data.SPOLICY,
      SSALEPOINT: data.SSALEPOINT,
      NPOLFIN: data.NPOLFIN,
      NPOLINI: data.NPOLINI,
      NQUANTITYAMOUNT: data.NQUANTITYAMOUNT,
      P_NIDPOLICY: data.NIDPOLICY,
      P_NNUMPOINT: data.NNUMPOINT,
      P_NTIPPOL: data.NTYPECERTIF,
    };
    this.LOTE_RANGO_FOR_REQUEST.P_NPRODUCT = data.NTYPECERTIF;
    this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L = data.NPOLINI;
    this.formRangeControl['ini'].setValue(data.NPOLINI);
    this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLFIN_L = data.NPOLFIN;
    this.formRangeControl['fin'].setValue(data.NPOLFIN);
    this.LOTE_RANGO.PRO_SEL_RANGE.P_TOTAL = data.NQUANTITYAMOUNT;
    this.P_IDREQUEST.P_IDREQUEST = data.NIDREQUEST;
    if (data.NAMOUNTCOVERED === 0) {
      this.AMOUNTCOVERED = true;
    } else {
      this.AMOUNTCOVERED = false;
    }
  }
  clearDataLote(): void {
    this.LOTE_DATA = {
      NIDREQUEST: 0,
      SPOLICY: '',
      SSALEPOINT: '',
      NNUMLOT: 0,
      SCERTIFICATE: '',
      P_NIDPOLICY: 0,
      P_NNUMPOINT: 0,
      P_NTIPPOL: 0,
      NPOLFIN: 0,
      NPOLINI: 0,
      NQUANTITYAMOUNT: 0,
    };
    this.LOTE_RANGO.PRO_SEL_RANGE.P_TOTAL = 0;
    this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L = 0;
    this.formRangeControl['ini'].setValue(0);
    this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLFIN_L = 0;
    this.formRangeControl['fin'].setValue(0);
    this.AMOUNTCOVERED = false;
    this.btnGrabar = false;
    this.btnRango = false;
  }

  // * SERVICIOS
  changeCanalVentaData(NIDPOLICY: any): void {
    this.formAsignarSolicitud.get('P_NNUMPOINT').setValue(0);
    console.log(NIDPOLICY);
    const data: CDto.PuntoVentaDto = {
      P_NPOLICYS: NIDPOLICY,
    };
    this._AsignarSolicitudService.puntoVentaData(data).subscribe(
      (res: SDto.PuntoVentaDto) => {
        console.log(res);
        this.PUNTO_VENTA_NEW_POLICY_DATA = res;
        this.selec = true;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  puntoVentaNewPolicyData(): void {
    const data: CDto.PuntoVentaDto = {
      P_NUSER: 62,
      P_NPOLICYS: null,
    };
    this._AsignarSolicitudService.puntoVentaNewPolicyData(data).subscribe(
      (res: SDto.PuntoVentaDto) => {
        console.log(res);
        this.PUNTO_VENTA_NEW_POLICY_DATA = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  statusPolizaData(): void {
    this._AsignarSolicitudService.statusPolizaData().subscribe(
      (res: SDto.StatusPolicy) => {
        console.log(res);
        this.STATUS_POLCICY = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  busqueda(): void {
    this.CANAL_VENTA_DATA = null;
    this.PUNTO_VENTA_DATA = null;
    this.PUNTO_VENTA_NEW_POLICY_DATA = null;
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_NIDREQUEST: this.f['P_NIDREQUEST'].value,
      P_SCLIENAME: '',
      P_NPOLICYS: '',
      P_NSALEPOINTS: '',
      P_NSTATUS: 0,
      P_DFCREABEGIN: this.f['P_DFCREABEGIN'].value,
      P_DFCREAEND: this.f['P_DFCREAEND'].value,
      P_NCODUSER: this.currentUser.id,
      _: 1634770467978,
    };
    if (data.P_NSTATUS === 0) {
      data.P_NSTATUS = '';
    }
    if (data.P_DFCREABEGIN !== '') {
      data.P_DFCREABEGIN = moment(this.f['P_DFCREABEGIN'].value).format(
        'YYYY-MM-DD'
      );
    } else {
      data.P_DFCREABEGIN = '';
    }
    if (data.P_DFCREAEND !== '') {
      data.P_DFCREAEND = moment(this.f['P_DFCREAEND'].value).format(
        'YYYY-MM-DD'
      );
    } else {
      data.P_DFCREAEND = '';
    }
    this._spinner.show();
    this._AsignarSolicitudService.polizasData(data).subscribe(
      (res: SDto.PolizasDataDto) => {
        console.log(res);
        this.POLIZAS_DATA = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }

  polizasData(): void {
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_NIDREQUEST: this.f['P_NIDREQUEST'].value,
      P_SCLIENAME: '',
      P_NPOLICYS: this.CANAL_VENTA_DATA || this.f['P_NPOLICYS'].value,
      P_NSALEPOINTS: this.PUNTO_VENTA_DATA || this.f['P_NSALEPOINTS'].value,
      P_NSTATUS: this.f['P_NSTATUS'].value,
      P_DFCREABEGIN: this.f['P_DFCREABEGIN'].value,
      P_DFCREAEND: this.f['P_DFCREAEND'].value,
      P_NCODUSER: this.currentUser.id,
      _: 1634770467978,
    };
    if (data.P_NSTATUS === 0) {
      data.P_NSTATUS = '';
    }
    if (data.P_DFCREABEGIN !== '') {
      data.P_DFCREABEGIN = moment(this.f['P_DFCREABEGIN'].value).format(
        'YYYY-MM-DD'
      );
    } else {
      data.P_DFCREABEGIN = '';
    }
    if (data.P_DFCREAEND !== '') {
      data.P_DFCREAEND = moment(this.f['P_DFCREAEND'].value).format(
        'YYYY-MM-DD'
      );
    } else {
      data.P_DFCREAEND = '';
    }
    this._spinner.show();
    this._AsignarSolicitudService.polizasData(data).subscribe(
      (res: SDto.PolizasDataDto) => {
        console.log(res);
        this.POLIZAS_DATA = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  polizasDataWhitParam(data): void {
    if (data.P_DFCREABEGIN == null) {
      data.P_DFCREABEGIN = '';
    }
    if (data.P_DFCREAEND == null) {
      data.P_DFCREAEND = '';
    }
    if (data.P_NIDREQUEST == null) {
      data.P_NIDREQUEST = 0;
    }
    if (data.P_NPOLICYS == null) {
      data.P_NPOLICYS = 0;
    }
    if (data.P_NSALEPOINTS == null) {
      data.P_NSALEPOINTS = 0;
    }
    if (data.P_NSTATUS == null) {
      data.P_NSTATUS = 0;
    }
    const P_NIDREQUEST = this.formSearchPoliza.get('P_NIDREQUEST').value;
    data.P_DFCREABEGIN = this._ParseDateService.parseDate(
      data.P_DFCREABEGIN.toString()
    );
    data.P_DFCREAEND = this._ParseDateService.parseDate(
      data.P_DFCREAEND.toString()
    );
    if (P_NIDREQUEST == null) {
      this.formSearchPoliza.get('P_NIDREQUEST').setValue('');
    }
    this._spinner.show();
    console.log(this.formSearchPoliza.value);
    this._AsignarSolicitudService.polizasDataWhitParam(data).subscribe(
      (res: SDto.PolizasDataDto) => {
        console.log(res);
        this.POLIZAS_DATA = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  generarNuevaSolicitud(): void {
    console.log(this.formAsignarSolicitud.value);
    const dataValidateReq: CDto.ValidateRequestDto = {
      P_NIDREQUEST: this.LOTE_DATA.NIDREQUEST,
      P_AMOUNT: this.formAsignarSolicitud.get('P_NQUANTITY').value,
      P_NNUMPOINT: this.formAsignarSolicitud.get('P_NNUMPOINT').value,
      P_NTIPPOL: this.formAsignarSolicitud.get('P_NPRODUCT').value,
      P_NPOLICY: this.formAsignarSolicitud.get('P_NIDPOLICY').value,
    };
    this._spinner.show();
    this.validateRequest(dataValidateReq);
  }
  private validateRequest(data: CDto.ValidateRequestDto): void {
    const dataSol: CDto.NuevaSolicitudDto = {
      P_NIDPOLICY: this.formAsignarSolicitud.get('P_NIDPOLICY').value,
      P_NNUMPOINT: this.formAsignarSolicitud.get('P_NNUMPOINT').value,
      P_NPRODUCT: this.formAsignarSolicitud.get('P_NPRODUCT').value,
      P_NQUANTITY: this.formAsignarSolicitud.get('P_NQUANTITY').value,
      P_NUSERREGISTER: 62,
    };
    this._AsignarSolicitudService.validateRequest(data).subscribe(
      (res: SDto.ValidateRequestDto) => {
        this._AsignarSolicitudService.generarNuevaSolicitud(dataSol).subscribe(
          (resp: SDto.NuevaSolicitud) => {
            console.log(res);
            if (resp.PA_INS_REQUEST.P_RQ > 0) {
              this.validateRejection(resp.PA_INS_REQUEST.P_RQ);
            }
            this.solicitud = resp.PA_INS_REQUEST.P_RQ;
          },
          (err) => {
            console.log(err);
            this._spinner.hide();
          }
        );
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  private validateRejection(id): void {
    this._AsignarSolicitudService.validateRejection(id).subscribe(
      (res: any) => {
        console.log(res);
        const data: CDto.UpdateRequestMasive = {
          P_NIREQUEST: id,
          P_NSTATE: 2,
          P_NUSERREGISTER: 62,
        };
        this.updateRequestMasive(data);
        // this.showModalMessage('Se asignó correctamente');
      },
      (err) => {
        console.log(err);
      }
    );
  }
  private updateRequestMasive(data: CDto.UpdateRequestMasive): void {
    this._spinner.show();
    this._AsignarSolicitudService.updateRequestMasive(data).subscribe(
      (res: SDto.UpdateRequestMasive) => {
        console.log(res);
        this.formAsignarSolicitud.reset();
        this.modal.hide();
        this._spinner.hide();
        this.showModalMessage('Se asignó correctamente : ' + this.solicitud);
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  cantidadAsignada(): void {
    this._AsignarSolicitudService.cantidadAsignada(this.P_IDREQUEST).subscribe(
      (res: SDto.LoteRango) => {
        console.log(res);
        this.LOTE_RANGO = res;
        this.btnRango = true;
        this.LOTE_RANGO_FOR_REQUEST.P_QUANTITY = res.PRO_SEL_RANGE.P_TOTAL;
        this.LOTE_RANGO_FOR_REQUEST.P_USER = 62;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  generarRango(): void {
    this._spinner.show();
    this._AsignarSolicitudService
      .generarRango(this.LOTE_RANGO_FOR_REQUEST)
      .subscribe(
        (res: SDto.LoteRango) => {
          this._spinner.hide();
          this.LOTE_RANGO = res;
          this.formRangeControl['ini'].setValue(res.PRO_SEL_RANGE.P_NPOLINI_L, {
            emitEvent: false,
          });
          this.formRangeControl['fin'].setValue(res.PRO_SEL_RANGE.P_NPOLFIN_L);
          this.btnGrabar = true;
        },
        (err: any) => {
          this._spinner.hide();
          this.showModalMessage(
            'Usted no puede asignar este requerimiento, ya que usted No lo ha generado.'
          );
          console.log(err);
        }
      );
  }
  grabarLote(): void {
    this._spinner.show();
    const datos: CDto.ValidatePolesPDto = {
      P_NPOLESP_INI: this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L,
      P_NPRODUCT: this.LOTE_RANGO_FOR_REQUEST.P_NPRODUCT,
      P_USER: 62,
    };

    this.message = '';
    this._vc.clear();
    this._AsignarSolicitudService.grabarDatosLote(datos).subscribe(
      (res: SDto.ValidatePolesPDto) => {
        console.log(res);
        if (res.PA_VAL_POLESP.P_COUNT > 0) {
          const data: CDto.RangeValDto = {
            P_FIN: this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLFIN_L,
            P_INI: this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L,
            P_NPRODUCT: this.LOTE_RANGO_FOR_REQUEST.P_NPRODUCT,
            P_QUANTITY: this.LOTE_RANGO_FOR_REQUEST.P_QUANTITY,
            P_USER: 62,
          };
          this.rangeVal(data);
          this.AMOUNTCOVERED = false;
          return;
        }

        this.message =
          'El canal con el que esta intentando asignar, no cuenta con el rango de certificados solicitados.';
        this._vc.createEmbeddedView(this._modalAlert);
        this._spinner.hide();
      },
      (err: any) => {
        this._spinner.hide();
        console.log(err);

        this.message =
          'Tenemos problemas con el servidor, inténtelo más tarde.';
        this._vc.createEmbeddedView(this._modalAlert);
      }
    );
  }
  private rangeVal(data: CDto.RangeValDto): void {
    this._AsignarSolicitudService.rangeVal(data).subscribe(
      (res: SDto.RangoValDto) => {
        console.log(res);
        const dataInsert: CDto.GrabarLoteDto = {
          P_IDREQUEST: this.LOTE_DATA.NIDREQUEST,
          P_NAMOUNTCOVERED: this.LOTE_RANGO_FOR_REQUEST.P_QUANTITY,
          P_NIDPOLICY: this.LOTE_DATA.P_NIDPOLICY,
          P_NNUMPOINT: this.LOTE_DATA.P_NNUMPOINT,
          P_NPOLFIN: this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLFIN_L,
          P_NPOLINI: this.LOTE_RANGO.PRO_SEL_RANGE.P_NPOLINI_L,
          P_NPRODUCT: this.LOTE_DATA.P_NTIPPOL,
          P_NTIPPOL: this.LOTE_DATA.P_NTIPPOL,
          P_NQUANTITY: this.LOTE_RANGO_FOR_REQUEST.P_QUANTITY,
          P_NUSERREGISTER: 62,
        };
        this.insertAssign(dataInsert);
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  private insertAssign(data: CDto.GrabarLoteDto): void {
    this._AsignarSolicitudService.insertAssign(data).subscribe(
      (res: SDto.InsertAssignDto) => {
        console.log(res);
        if (res.NSTATUS === 1) {
          this.showModalMessage('Se asignó el lote correctamente.');
        }
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  exportar(data) {
    console.log(data.P_NSTATUS);
    this.downloadURL2 =
      this.urlApi +
      '/Assign/Report/AssignReport?P_NIDREQUEST=' +
      this.f['P_NIDREQUEST'].value +
      '&P_SCLIENAME=&P_NPOLICYS=' +
      (this.CANAL_VENTA_DATA || '') +
      '&P_NSALEPOINTS=' +
      (this.PUNTO_VENTA_DATA || '') +
      '&P_NSTATUS=' +
      (+this.f['P_NSTATUS'].value || '') +
      '&P_DFCREABEGIN=' +
      moment(this.f['P_DFCREABEGIN'].value).format() +
      '&P_DFCREAEND=' +
      moment(this.f['P_DFCREAEND'].value).format() +
      '&P_NCODUSER=' +
      this.currentUser.id;
    window.open(this.downloadURL2);
  }

  showModalAlert(message: string): void {
    this.message = message;
    this._vc.createEmbeddedView(this._modalAlert);
  }
  closeModal(): void {
    this._vc.clear();
  }
}
