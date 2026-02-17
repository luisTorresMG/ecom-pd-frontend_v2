import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';
import { CertificadoDto } from './DTOs/certificadoDto.dto';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ImpresionCertificadoService } from '../../../services/transaccion/impresión-certificado/impresion-certificado.service';
import {
  ValidarRequest,
  IListarResponse,
  ILimpiarResponse,
  IValidarResponse,
  ImprimirRequest,
  IImprimirResponse,
} from '../../../models/transaccion/impresion-certificados/impresion-certificados.model';
import { HttpHeaders } from '@angular/common/http';
import { url } from 'inspector';
import { AppConfig } from '../../../../../app.config';
@Component({
  selector: 'app-impresion-certificado',
  templateUrl: './impresion-certificado.component.html',
  styleUrls: ['./impresion-certificado.component.scss'],
})
export class ImpresionCertificadoComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  urlApi: string;
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  form: FormGroup;
  formListar: FormGroup;
  @ViewChild('modalValidar', { static: true }) modalValidar: ModalDirective;
  @ViewChild('modalError', { static: true }) modalError: ModalDirective;
  http: any;
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _ImpresionCertificadoService: ImpresionCertificadoService,
    private readonly _http: HttpClient
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.typeCertificado = 'I';
    this.isShowModal = false;
    this.tipoContratante = 'persona';
    this.form = this._FormBuilder.group({
      tipo_impresion: ['I'],
      certificado: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
      ],
      fecha_inicio: [this.bsValueIni],
      fecha_fin: [this.bsValueFin],
    });
    this.formListar = this._FormBuilder.group({
      fecha_emision: [null],
      hora_emision: [null],
      tarifa: [null],
      placa: [null],
      año: [null],
      clase: [null],
      uso: [null],
      marca: [null],
      modelo: [null],
      numero_serie: [null],
      asientos: [null],
      fecha_inicio_vigencia: [null],
      fecha_fin_vigencia: [null],
      tipo_documento: [null],
      numero_documento: [null],
      razon_social: [null],
      departamento: [null],
      provincia: [null],
      distrito: [null],
      direccion: [null],
      correo: [null],
    });
  }

  nCertificado: number;
  dataBuscar: any;
  dataBuscar2: any;
  dataLimpiar: any;
  dataImprimir: any;
  dataValidar: any;
  MENSAJE: any;
  downloadURL: any;
  MENSAJEERROR: any;
  dataCertificado: CertificadoDto = null;
  tipoContratante: string;
  dataCertificadoArray: CertificadoDto[] = [];
  typeCertificado: string;
  currentPage = 0;
  p = 0;
  mensajeModal: string;
  isShowModal: boolean;
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.setDates();
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.f['certificado'].valueChanges.subscribe((val) => {
      if (this.f['certificado'].hasError('pattern')) {
        this.f['certificado'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.f['tipo_impresion'].valueChanges.subscribe((val) => {
      if (val === 'F') {
        this.f['certificado'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(10),
            Validators.maxLength(10),
          ])
        );
      }
    });
  }
  showModalMessage(message: string): void {
    this.mensajeModal = message;
    this.isShowModal = true;
  }

  get f(): any {
    return this.form.controls;
  }

  get ff(): any {
    return this.formListar.controls;
  }

  validar() {
    this.dataValidar = null;
    this._spinner.show();
    const dateI = new Date(this.f['fecha_inicio'].value);
    const dateF = new Date(this.f['fecha_fin'].value);
    const data: any = {
      P_INDTIPOIMP: this.f['tipo_impresion'].value,
      P_SPOLICYS: this.f['certificado'].value,
      P_SFEINI: `${dateI.getDate()}/${dateI.getMonth() + 1
        }/${dateI.getFullYear()}`,
      P_SFEFIN: `${dateF.getDate()}/${dateF.getMonth() + 1
        }/${dateF.getFullYear()}`,
    };
    this._ImpresionCertificadoService.validar(data).subscribe(
      (response: IValidarResponse) => {
        this.dataValidar = response;
        this._spinner.hide();
        if (this.dataValidar?.VAL_CERTIF?.P_NERROR === 0) {
          if (this.form.get('tipo_impresion').value === 'I') {
            this.searchCertificado();
          } else {
            this.searchCertificado2();
          }
        } else {
          this.modalValidar.show();
          this.MENSAJE = this.dataValidar?.VAL_CERTIF?.P_SERROR;
        }
        console.log(this.dataValidar);
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  searchCertificado(): void {
    this._spinner.show();
    const dateI = new Date(this.f['fecha_inicio'].value);
    const dateF = new Date(this.f['fecha_fin'].value);
    const formData: any = new FormData();
    formData.append('P_INDTIPOIMP', this.form.get('tipo_impresion').value);
    formData.append('P_SPOLICYS', this.form.get('certificado').value);
    formData.append(
      'P_SFEINI',
      `${dateI.getDate()}/${dateI.getMonth() + 1}/${dateI.getFullYear()}`
    );
    formData.append(
      'P_SFEFIN',
      `${dateF.getDate()}/${dateF.getMonth() + 1}/${dateF.getFullYear()}`
    );
    this._ImpresionCertificadoService.listar(formData).subscribe(
      (response: IListarResponse) => {
        this.dataBuscar = response;
        this.ff['fecha_emision'].setValue(
          this.dataBuscar?.entities[0]?.FECHA_EMISION
        );
        this.ff['hora_emision'].setValue(
          this.dataBuscar?.entities[0]?.HORA_EMISION
        );
        this.ff['tarifa'].setValue(this.dataBuscar?.entities[0]?.NPREMIUM);
        this.ff['placa'].setValue(this.dataBuscar?.entities[0]?.SREGIST);
        this.ff['año'].setValue(this.dataBuscar?.entities[0]?.NYEAR);
        this.ff['clase'].setValue(this.dataBuscar?.entities[0]?.CLASE);
        this.ff['uso'].setValue(this.dataBuscar?.entities[0]?.USO);
        this.ff['marca'].setValue(this.dataBuscar?.entities[0]?.MARCA);
        this.ff['modelo'].setValue(this.dataBuscar?.entities[0]?.MODELO);
        this.ff['numero_serie'].setValue(
          this.dataBuscar?.entities[0]?.SCHASSIS
        );
        this.ff['asientos'].setValue(this.dataBuscar?.entities[0]?.NSEATCOUNT);
        this.ff['fecha_inicio_vigencia'].setValue(
          this.dataBuscar?.entities[0]?.INICIO_VIGENCIA
        );
        this.ff['fecha_fin_vigencia'].setValue(
          this.dataBuscar?.entities[0]?.FIN_VIGENCIA
        );
        this.ff['tipo_documento'].setValue(
          this.dataBuscar?.entities[0]?.SDOC_TYPE
        );
        this.ff['numero_documento'].setValue(
          this.dataBuscar?.entities[0]?.SIDDOC
        );
        this.ff['razon_social'].setValue(
          this.dataBuscar?.entities[0]?.SCLIENAME
        );
        this.ff['departamento'].setValue(
          this.dataBuscar?.entities[0]?.DEPARTAMENTO
        );
        this.ff['provincia'].setValue(this.dataBuscar?.entities[0]?.PROVINCIA);
        this.ff['distrito'].setValue(this.dataBuscar?.entities[0]?.DISTRITO);
        this.ff['direccion'].setValue(this.dataBuscar?.entities[0]?.SSTREET);
        this.ff['correo'].setValue(this.dataBuscar?.entities[0]?.SE_MAIL);
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  searchCertificado2(): void {
    this._spinner.show();
    const dateI = new Date(this.f['fecha_inicio'].value);
    const dateF = new Date(this.f['fecha_fin'].value);
    const formData: any = new FormData();
    formData.append('P_INDTIPOIMP', this.form.get('tipo_impresion').value);
    formData.append('P_SPOLICYS', this.form.get('certificado').value);
    formData.append(
      'P_SFEINI',
      `${dateI.getDate()}/${dateI.getMonth() + 1}/${dateI.getFullYear()}`
    );
    formData.append(
      'P_SFEFIN',
      `${dateF.getDate()}/${dateF.getMonth() + 1}/${dateF.getFullYear()}`
    );
    this._ImpresionCertificadoService.listar(formData).subscribe(
      (response: IListarResponse) => {
        this.dataBuscar2 = response;
      },
      (error: any) => {
        console.log(error);
        this.modalError.show();
        this.MENSAJEERROR = 'Algún problema debe haber...';
        this._spinner.hide();
      }
    );
  }

  clearDataSearch(): void {
    this._spinner.show();
    this._ImpresionCertificadoService.limpiar().subscribe(
      (response: ILimpiarResponse) => {
        this.dataLimpiar = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
    this.formListar.reset();
    this.typeImpresion();
    this.dataBuscar2 = 0;
    this.dataBuscar = null;
    this.currentPage = 0;
    this.p = 0;
    this.form.get('certificado').setValue('');
    this.form.get('tipo_impresion').setValue('I');
    this.form.get('fecha_inicio').setValue(this.bsValueIni);
    this.form.get('fecha_fin').setValue(this.bsValueFin);
  }

  setDates(): void {
    this.bsValueIni = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    this.bsValueFin = new Date();
  }
  typeImpresion(): void {
    this.typeCertificado = 'I';
    this.currentPage = 0;
    this.p = 0;
  }
  typeMasivo(): void {
    this.typeCertificado = 'M';
  }
  typeRangos(): void {
    this.typeCertificado = 'F';
  }

  ocultarModalValidar() {
    this.modalValidar.hide();
    this.modalError.hide();
  }

  imprimir() {
    this.downloadURL =
      this.urlApi +
      '/PrintCertificate/Core/ReadPDFMasivo/?P_INDTIPOIMP=' +
      this.f['tipo_impresion'].value +
      '&P_SPOLICYS=' +
      this.f['certificado'].value +
      '&P_SFEINI=' +
      '' +
      '&P_SFEFIN=' +
      '';
    window.open(this.downloadURL);
  }
}
