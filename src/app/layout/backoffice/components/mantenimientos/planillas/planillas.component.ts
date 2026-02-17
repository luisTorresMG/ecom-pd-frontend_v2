import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { PlanillasService } from '../../../services/mantenimientos/planillas/planillas.service';
import {
  ListarRequest,
  IListarResponse,
  IActualizarResponse,
  GenerarFResponse,
  AnularResponse,
  GroupRequest,
  GroupResponse,
} from '../../../models/mantenimientos/planillas/planillas.model';
import moment from 'moment';
@Component({
  selector: 'app-planillas',
  templateUrl: './planillas.component.html',
  styleUrls: ['./planillas.component.scss'],
})
export class PlanillasComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueFin: Date = new Date();
  showSelected: boolean;
  showSelected2: boolean;
  form: FormGroup;
  formActualizar: FormGroup;
  fecha: Date = new Date();
  info: any;
  BODY_MODAL_SUCCESS: string;
  MENSAJE: any;
  dataGroup: any;
  ESTADO: any;
  COMPROBANTE: any;
  IMPORTE: any;
  TOTAL: any;
  fecha1: any;
  fechafinal: any;
  @ViewChild('modalMensajeActualizar') modalMensajeActualizar: ModalDirective;
  @ViewChild('modalActualizar') modalActualizar: ModalDirective;
  @ViewChild('modalNivelI', { static: true, read: ModalDirective })
  modalNivelI: ModalDirective;

  constructor(
    private readonly _PlanillasService: PlanillasService,
    private readonly _builder: FormBuilder,
    private readonly _spinner: NgxSpinnerService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.form = this._builder.group({
      planilla: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[\d]*$/),
        ]),
      ],
    });
    this.formActualizar = this._builder.group({
      numero_operacion: [null],
      fecha_operacion: [null],
    });
    this.showSelected = true;
    this.showSelected2 = true;
  }

  dataPlanilla: IListarResponse;
  dataActualizar: any;
  dataNivelI: any;
  dataGenerarF: any;
  dataAnular: any;

  get f(): any {
    return this.formActualizar.controls;
  }

  get ff(): any {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.ff['planilla'].valueChanges.subscribe((val) => {
      if (val) {
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.ff['planilla'].setValue(val.substring(0, val.length - 1));
        }
        if (this.ff['planilla'].hasError('pattern')) {
          this.ff['planilla'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
  }

  showbuscar() {
    this._spinner.show();
    const data: ListarRequest = new ListarRequest(this.form.getRawValue());
    this._PlanillasService.listar(data).subscribe(
      (response: IListarResponse) => {
        this.dataPlanilla = response;
        this.showSelected = false;
        this.ESTADO = this.dataPlanilla.entities[0].NESTADO_PLANILLA;
        this.TOTAL = this.dataPlanilla.entities[0].NMONTOTOTAL;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  buscarg() {
    this.showbuscar();
    this.group();
  }
  group() {
    this._spinner.show();
    const data: any = {
      P_NROPLANILLA: this.ff['planilla'].value,
    };
    this._PlanillasService.Group(data).subscribe(
      (response: GroupResponse) => {
        this.dataGroup = response;
        if (this.dataGroup.COMPROBANTE !== '' || this.dataGroup.IMPORTE !== 0) {
          this.showSelected2 = false;
          this.COMPROBANTE = this.dataGroup.COMPROBANTE;
          this.IMPORTE = this.dataGroup.IMPORTE;
        } else {
          this.showSelected2 = true;
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  actualizar(data) {
    this.info = data;
    this.modalActualizar.show();
    this.formActualizar
      .get('numero_operacion')
      .setValue(this.info?.NNRO_OPERACION);
    this.formActualizar
      .get('fecha_operacion')
      .setValue(moment(this.info?.NFECHA_OPERACION).format('DD/MM/YYYY'));
    console.log(this.info?.NFECHA_OPERACION);
  }

  hideModalActualizar() {
    this.modalActualizar.hide();
  }

  hideModalNivelI() {
    this.modalNivelI.hide();
    this.modalMensajeActualizar.hide();
  }

  NivelI() {
    this._spinner.show();
    const data: any = {
      P_NIDPAYROLL: this.ff['planilla'].value,
    };
    this._PlanillasService.NivelI(data).subscribe(
      (response: IActualizarResponse) => {
        this.dataNivelI = response;
        this.modalMensajeActualizar.show();
        this.MENSAJE = [this.dataNivelI.MSG];
        this.showbuscar();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  GenerarF() {
    this._spinner.show();
    const data: any = {
      P_NIDPAYROLL: this.ff['planilla'].value,
    };
    this._PlanillasService.GenerarF(data).subscribe(
      (response: GenerarFResponse) => {
        this.dataGenerarF = response;
        this.modalMensajeActualizar.show();
        this.MENSAJE = [this.dataGenerarF.MSG];
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  Anular() {
    this._spinner.show();
    const data: any = {
      P_NIDPAYROLL: this.ff['planilla'].value,
    };
    this._PlanillasService.Anular(data).subscribe(
      (response: AnularResponse) => {
        this.dataAnular = response;
        this.modalMensajeActualizar.show();
        this.MENSAJE = [this.dataAnular.MSG];
        this.showbuscar();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  limpiar() {
    this.form.reset();
    this.formActualizar.reset();
    this.showSelected = true;
  }

  actualizarInfo() {
    this._spinner.show();
    const date = new Date(this.f['fecha_operacion'].value);
    const data: any = {
      P_NOPERATION: this.f['numero_operacion'].value,
      P_DATEOPERATION:
        /* `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}` */ moment(
          this.f['fecha_operacion'].value,
          'DD/MM/YYYY'
        ).format('DD/MM/YYYY') ||
        moment(this.f['fecha_operacion'].value).format('DD/MM/YYYY'),
      P_NROPLANILLA: this.info?.NRO_PLANILLA,
      P_NIDPAYROLL_DETAIL: this.info?.NIDPAYROLL_DETAIL,
      P_ESTADO: this.info?.IDSTATE,
    };
    this._PlanillasService.actualizar(data).subscribe(
      (response: IActualizarResponse) => {
        this.dataActualizar = response;
        this.modalMensajeActualizar.show();
        this.modalActualizar.hide();
        this.MENSAJE = [this.dataActualizar.MSG];
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
    this.showbuscar();
  }
}
