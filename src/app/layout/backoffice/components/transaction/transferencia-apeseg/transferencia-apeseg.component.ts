import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TransferenciaApesegDto } from './DTOs/transferenciaApeseg.dto';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TransferenciaApesegService } from '../../../services/transaccion/transferencia-apeseg/transferencia-apeseg.service';
import {
  IListarResponse,
  ListarRequest,
  IEstadoResponse,
  IEnviarResponse,
} from '../../../models/transferencia-apeseg/transferencia-apeseg.model';
import moment from 'moment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-transferencia-apeseg',
  templateUrl: './transferencia-apeseg.component.html',
  styleUrls: ['./transferencia-apeseg.component.css'],
})
export class TransferenciaApesegComponent implements OnInit {
  formDataSearch: FormGroup;
  @ViewChild('modal') modal: ModalDirective;
  @ViewChild('modalEnviarMasivo') modalEnviarMasivo: ModalDirective;
  @ViewChild('modalResultado') modalResultado: ModalDirective;
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _transferenciaApesegService: TransferenciaApesegService
  ) {
    // this.initFormDataSearch();
    this.formDataSearch = _FormBuilder.group({
      fechaInicio: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
      estadoTrans: ['5'],
      nCertificado: ['', Validators.required],
      placa: [''],
    });
    this.showbuscar();
  }

  bsConfig: Partial<BsDatepickerConfig>;

  fecha = new Date();
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  dataEnviar: any;
  MENSAJEFINAL: any;

  get f(): any {
    return this.formDataSearch.controls;
  }

  info: any;
  currentPage: 0;
  p: 0;
  dataTransferenciaApeseg: IListarResponse;
  nPoliza: number;
  seleccionado: any;
  dataEstado: any;

  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.estado();
    window.scrollTo(0, 0);
    // this._spinner.show();
    // setTimeout(() => {
    //  for (let i = 0; i <= 28; i++) {
    //   const data: TransferenciaApesegDto = {
    //     placa: 'QWR981',
    //     canal: 'CANAL DE VENTA',
    //    puntoVenta: 'PUNTO DE VENTA POINT',
    //     nCertificado: 'NUMERO DE CERTIFICADO',
    //     fechaIniVigencia: '06-03-2021',
    //     fechaFinVigencia: '06-03-2021',
    //    fechaEnvio: '06-03-2021',
    //     contratante: 'KEVIN HARRINSON LUGO DIAZ',
    //     desError: 'LOREM IPSUM DOLOR SIT AMET HAS ERROR DESC',
    //     estado: 'NO ENVIADO'
    //   };
    //   this.dataTransferenciaApeseg.push(data);
    // }
    // this._spinner.hide();
    // }, 2500);
  }

  // initFormDataSearch(): void {
  //  this.formDataSearch = this._FormBuilder.group({
  //    fechaInicio: [new Date(this.fecha.setMonth(this.fecha.getMonth() - 6))],
  //    fechaFin: [new Date()],
  //    estadoTrans: [null],
  //    nCertificado: [null, Validators.required],
  //    placa: [null],
  //  });
  // }
  modalConfirmacion(data: any): void {
    this.info = data;
    this.modal.show();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  cancelModalConfirmacion(): void {
    this.modal.hide();
  }
  clearDataFormSearch(): void {
    this.dataTransferenciaApeseg = null;
    this.formDataSearch.reset();
    this.bsValueIni = new Date();
    this.bsValueFin = new Date();
    this.formDataSearch.get('fechaInicio').setValue(this.bsValueIni);
    this.formDataSearch.get('fechaFin').setValue(this.bsValueFin);
    this.formDataSearch.get('nCertificado').setValue('');
    this.formDataSearch.get('placa').setValue('');
    this.formDataSearch.get('estadoTrans').setValue('5');
  }
  searchData(): void {
    this._spinner.show();
    setTimeout(() => {
      this._spinner.hide();
    }, 1000);
  }
  showModalEnviarMasivo() {
    this.modalEnviarMasivo.show();
  }
  hideModalEnviarMasivo() {
    this.modalEnviarMasivo.hide();
  }
  enviarMasivo(): void {
    console.log('Enviando masivo...');
    this._spinner.show();
    const fd: any = new FormData();
    fd.append('certificates[0][P_N_POLESP_COMP]', this.info.N_POLESP_COMP);
    fd.append('certificates[0][P_NUSEREDIT]', this.currentUser.id);
    fd.append('certificates[0][P_NTRANSFERSTATUS]', '');
    fd.append('certificates[0][buttonSendAPESEG]', 1);
    fd.append(
      'parameters[P_DREGDATEINI]',
      moment(this.f['fechaInicio'].value).format()
    );
    fd.append(
      'parameters[P_DREGDATEFIN]',
      moment(this.f['fechaFin'].value).format()
    );
    fd.append('parameters[P_NTRANSFERSTATUS]', 5);
    fd.append('parameters[P_INDENTI]', 0);
    /*  let i = 0;
     for (i = 0; i < 10; i++) {
       formData.append(
         'certificates[' + i + '][P_N_POLESP_COMP]',
         this.info.N_POLESP_COMP
       );
       formData.append(
         'certificates[' + i + '][P_NUSEREDIT]',
         this.currentUser.id
       );
       formData.append('certificates[' + i + '][P_NTRANSFERSTATUS]', '');
       formData.append('certificates[' + i + '][buttonSendAPESEG]', 1);
     }
     formData.append(
       'parameters[P_DREGDATEINI]',
       moment(this.f['fechaInicio'].value).format()
     );
     formData.append(
       'parameters[P_DREGDATEFIN]',
       moment(this.f['fechaFin'].value).format()
     );
     formData.append('parameters[P_NTRANSFERSTATUS]', 5);
     formData.append('parameters[P_INDENTI]', 0); */
    this._transferenciaApesegService.enviar(fd).subscribe(
      (response: IEnviarResponse) => {
        this.dataEnviar = response;
        this.modalResultado.show();
        this.MENSAJEFINAL = this.dataEnviar?.message;
        this.modal.hide();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.modalResultado.show();
        this.MENSAJEFINAL = 'APESEG recibió con satisfacción el certificado.';
        this.modal.hide();
        this._spinner.hide();
      }
    );
  }

  onChange(seleccionado) {
    console.log(seleccionado);
    this.seleccionado = seleccionado;
  }

  estado() {
    const data: any = {
      S_TYPE: 'TRANSFERSTATUS',
      _: 1634677625846,
    };
    this._transferenciaApesegService.estado(data).subscribe(
      (response: IEstadoResponse) => {
        console.log(response);
        this.dataEstado = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }
  showbuscar() {
    this._spinner.show();
    const data: any = {
      P_DREGDATEINI: moment(this.f['fechaInicio'].value).format('YYYY-MM-DD'),
      P_DREGDATEFIN: moment(this.f['fechaFin'].value).format('YYYY-MM-DD'),
      P_NTRANSFERSTATUS: this.f['estadoTrans'].value,
      P_NCERTIFICADO: this.f['nCertificado'].value,
      P_NPLACA: this.f['placa'].value,
    };
    this._transferenciaApesegService.listar(data).subscribe(
      (response: IListarResponse) => {
        console.log(response);
        this.dataTransferenciaApeseg = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  hideModalResultado() {
    this.modalResultado.hide();
  }
}
