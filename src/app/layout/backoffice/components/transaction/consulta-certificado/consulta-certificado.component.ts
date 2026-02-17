import { Component, OnInit, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ConsultaCertificadoDto } from './DTOs/consultaCertificado.dto';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ConsultaCertificadoService } from '../../../services/transaccion/consulta-certificado/consulta-certificado.service';
import {
  ITipoDocumentoResponse,
  IBuscarResponse,
  BuscarRequest,
} from '../../../models/transaccion/consulta-certificados/consulta-certificados.model';
import { AppConfig } from '../../../../../app.config';
@Component({
  selector: 'app-consulta-certificado',
  templateUrl: './consulta-certificado.component.html',
  styleUrls: ['./consulta-certificado.component.scss'],
})
export class ConsultaCertificadoComponent implements OnInit {
  form: FormGroup;
  formConsulta: FormGroup;

  showSelected: boolean;
  showSelected2: boolean;
  showSelected3: boolean;
  urlApi: string;
  bsConfig: Partial<BsDatepickerConfig>;

  fecha = new Date();
  bsValueIni: Date;
  bsValueFin: Date;

  dataCertificado: ConsultaCertificadoDto = null;
  dataTipoDocumento: any;

  dataBuscar: any;
  dataBuscar2: any;

  downloadURL: any;
  tipoContratante: string;
  info: any;

  nCertificado: number;
  placa: string;
  tipoDocumento: string;

  alertMessage: string;

  limitDocumentNumber: { min: number, max: number };

  @ViewChild('modalAlertMessage', { static: true, read: TemplateRef }) modalMessage: TemplateRef<any>;
  @ViewChild('modalResultado', { static: true, read: TemplateRef }) _modalResultado: TemplateRef<any>;


  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _ConsultaCertificadoService: ConsultaCertificadoService,
    private readonly _vc: ViewContainerRef
  ) {
    this.limitDocumentNumber = {
      min: 0,
      max: 0
    };
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.form = this._FormBuilder.group({
      certificado: [null],
      origen: [null],
      canal_venta: [null],
      moneda: [null],
      lote_descargo: [null],
      planilla: [null],
      usuario_emision: [null],
      fecha_creacion: [null],
      fecha_emision: [null],
      hora_emisión: [null],
      tarifa: [null],
      placa: [null],
      clase: [null],
      uso: [null],
      marca: [null],
      modelo: [null],
      serie: [null],
      asientos: [null],
      zona_circulacion: [null],
      año: [null],
      fecha_inicio_vigencia: [null],
      fecha_fin_vigencia: [null],
      tipo_documento: [null],
      razon_social: [null],
      numero_documento: [null],
      nombres: [null],
      apellido_paterno: [null],
      apellido_materno: [null],
      departamento: [null],
      provincia: [null],
      distrito: [null],
      direccion: [null],
      correo: [null],
      telefono: [null],
      SCLIENAME: [null],
      ANULADO: [null],
    });
    this.formConsulta = this._FormBuilder.group({
      nCertificado: [
        null,
        Validators.compose([
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
      ],
      placa: [
        null,
        Validators.compose([
          Validators.pattern(/^[\w\d]*$/),
          Validators.minLength(6),
          Validators.maxLength(6),
        ]),
      ],
      tipoDocumento: [0],
      textoTipoDocumento: [
        null,
        Validators.compose([
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.min),
        ]),
      ],
    });
    this.showSelected = true;
    this.showSelected2 = true;
    this.showSelected3 = true;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formConsulta.controls;
  }

  get ff(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.tipodeDocumento();
    window.scrollTo(0, 0);
    this.ff['tipo_documento'].valueChanges.subscribe((val) => {
      if (val === 'RUC') {
        this.showSelected = false;
      } else {
        this.showSelected = true;
      }
    });
    this.ff['ANULADO'].valueChanges.subscribe((val) => {
      if (val === 'X') {
        this.showSelected2 = false;
        this.showSelected3 = true;
      } else {
        this.showSelected2 = true;
        this.showSelected3 = false;
      }
    });
    this.f['nCertificado'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['nCertificado'].hasError('pattern')) {
          this.f['nCertificado'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.f['placa'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['placa'].hasError('pattern')) {
          this.f['placa'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.f['tipoDocumento'].valueChanges.subscribe((val) => {
      this.f['textoTipoDocumento'].setValue(null);
      switch (+val) {
        case 2:
          this.limitDocumentNumber = {
            min: 8,
            max: 8
          };
          break;
        case 1:
          this.limitDocumentNumber = {
            min: 9,
            max: 12
          };
          break;
        default:
          this.limitDocumentNumber = {
            min: 8,
            max: 12
          };
          break;
      }
      if (+val === 0) {
        this.f['textoTipoDocumento'].setValidators(
          Validators.compose([
            Validators.pattern(/^\d*$/),
            Validators.minLength(this.limitDocumentNumber.min),
            Validators.maxLength(this.limitDocumentNumber.max)
          ])
        );
      } else {
        this.f['textoTipoDocumento'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^\d*$/),
            Validators.minLength(this.limitDocumentNumber.min),
            Validators.maxLength(this.limitDocumentNumber.max)
          ])
        );
      }

      this.f['textoTipoDocumento'].updateValueAndValidity({
        emitEvent: false,
      });
    });

    this.f['textoTipoDocumento'].valueChanges.subscribe((val) => {
      if (this.f['textoTipoDocumento'].hasError('pattern')) {
        this.f['textoTipoDocumento'].setValue(val.substring(0, val.length - 1));
      }
    });
  }

  hideModalResultado() {
    this._vc.clear();
    this.info = null;
  }

  clearDataConsulta(): void {
    this.info = null;
    this.formConsulta.reset();
    this.formConsulta.reset();
    this.formConsulta.get('tipoDocumento').setValue(0);
    this.form.reset();
    this.changeValueTipoDocumento('0');
    this.showSelected2 = true;
    this.showSelected3 = true;
  }
  searchConsulta(): void { }

  textoTipoDocumento(idTD) {
    return (
      this.dataTipoDocumento?.PRO_TYPEDOCUMENT?.find(
        (x) => x.NIDDOC_TYPE?.toString() === idTD?.toString()
      )?.SDESCRIPT || ''
    );
  }

  changeValueTipoDocumento(e: string): void {
    this.tipoDocumento = this.textoTipoDocumento(e);
  }

  tipodeDocumento() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1634243653009,
    };
    this._ConsultaCertificadoService.tipo_documento(data).subscribe(
      (response: ITipoDocumentoResponse) => {
        this.dataTipoDocumento = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  guardarInfo(data) {
    console.log(data);
    this.info = data;
  }
  buscar() {
    if (!this.f['nCertificado'].value &&
      !this.f['placa'].value &&
      !this.f['textoTipoDocumento'].value) {
      this.openModalMessage('Se debe llenar al menos algún campo');
      return;
    }
    this.info = null;
    this.dataBuscar = null;
    this.form.reset();
    this._spinner.show();
    const request = new BuscarRequest(this.formConsulta.getRawValue());
    this._ConsultaCertificadoService.buscar(request).subscribe(
      (response: IBuscarResponse) => {
        this.dataBuscar = response;
        console.log(response);
        if (this.dataBuscar.NCANT === 1) {
          this.ff['certificado'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.NPOLICY
          );
          this.ff['origen'].setValue(this.dataBuscar.PRO_CERTIF[0]?.ORIGEN);
          this.ff['canal_venta'].setValue(this.dataBuscar.PRO_CERTIF[0]?.CANAL);
          this.ff['moneda'].setValue(this.dataBuscar.PRO_CERTIF[0]?.MONEDA);
          this.ff['lote_descargo'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.NRO_LOTE_DESCARGO
          );
          this.ff['planilla'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.NRO_PLANILLA
          );
          this.ff['usuario_emision'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.USU_CREACION
          );
          this.ff['fecha_creacion'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.FE_CREACION
          );
          this.ff['fecha_emision'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.FECHA_EMISION
          );
          this.ff['hora_emisión'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.HORA_EMISION
          );
          this.ff['tarifa'].setValue(this.dataBuscar.PRO_CERTIF[0]?.NPREMIUM);
          this.ff['placa'].setValue(this.dataBuscar.PRO_CERTIF[0]?.SREGIST);
          this.ff['clase'].setValue(this.dataBuscar.PRO_CERTIF[0]?.CLASE);
          this.ff['uso'].setValue(this.dataBuscar.PRO_CERTIF[0]?.USO);
          this.ff['marca'].setValue(this.dataBuscar.PRO_CERTIF[0]?.MARCA);
          this.ff['modelo'].setValue(this.dataBuscar.PRO_CERTIF[0]?.MODELO);
          this.ff['serie'].setValue(this.dataBuscar.PRO_CERTIF[0]?.SCHASSIS);
          this.ff['asientos'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.NSEATCOUNT
          );
          this.ff['zona_circulacion'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.ZCIRCU
          );
          this.ff['año'].setValue(this.dataBuscar.PRO_CERTIF[0]?.NYEAR);
          this.ff['fecha_inicio_vigencia'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.INICIO_VIGENCIA
          );
          this.ff['fecha_fin_vigencia'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.FIN_VIGENCIA
          );
          this.ff['tipo_documento'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SDOC_TYPE
          );
          this.ff['razon_social'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SLEGALNAME
          );
          this.ff['numero_documento'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SIDDOC
          );
          this.ff['nombres'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SFIRSTNAME
          );
          this.ff['apellido_paterno'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SLASTNAME
          );
          this.ff['apellido_materno'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SLASTNAME2
          );
          this.ff['departamento'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.DEPARTAMENTO
          );
          this.ff['provincia'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.PROVINCIA
          );
          this.ff['distrito'].setValue(this.dataBuscar.PRO_CERTIF[0]?.DISTRITO);
          this.ff['direccion'].setValue(this.dataBuscar.PRO_CERTIF[0]?.SSTREET);
          this.ff['correo'].setValue(this.dataBuscar.PRO_CERTIF[0]?.SE_MAIL);
          this.ff['telefono'].setValue(this.dataBuscar.PRO_CERTIF[0]?.TELEFONO);
          this.ff['SCLIENAME'].setValue(
            this.dataBuscar.PRO_CERTIF[0]?.SCLIENAME
          );
          this.ff['ANULADO'].setValue(this.dataBuscar.PRO_CERTIF[0]?.ANULADO);
        }

        this._spinner.hide();
        if (this.dataBuscar?.NCANT > 1) {
          this._vc.createEmbeddedView(this._modalResultado);
          return;
        }
        if (!this.dataBuscar?.NCANT) {
          this.openModalMessage('No se han encontrado certificados con los filtros ingresados.');
        }
      },
      (error: any) => {
        console.error(error);
        this.form.reset();
        this.dataBuscar = null;
        this._spinner.hide();
        this.openModalMessage('Hubo un error con la matriz de datos.');
      }
    );
  }

  showInformacionCertificado() {
    this._vc.clear();
    this.ff['certificado'].setValue(this.info?.NPOLICY);
    this.ff['origen'].setValue(this.info?.ORIGEN);
    this.ff['canal_venta'].setValue(this.info?.CANAL);
    this.ff['moneda'].setValue(this.info?.MONEDA);
    this.ff['lote_descargo'].setValue(this.info?.NRO_LOTE_DESCARGO);
    this.ff['planilla'].setValue(this.info?.NRO_PLANILLA);
    this.ff['usuario_emision'].setValue(this.info?.USU_CREACION);
    this.ff['fecha_creacion'].setValue(this.info?.FE_CREACION);
    this.ff['fecha_emision'].setValue(this.info?.FECHA_EMISION);
    this.ff['hora_emisión'].setValue(this.info?.HORA_EMISION);
    this.ff['tarifa'].setValue(this.info?.NPREMIUM);
    this.ff['placa'].setValue(this.info?.SREGIST);
    this.ff['clase'].setValue(this.info?.CLASE);
    this.ff['uso'].setValue(this.info?.USO);
    this.ff['marca'].setValue(this.info?.MARCA);
    this.ff['modelo'].setValue(this.info?.MODELO);
    this.ff['serie'].setValue(this.info?.SCHASSIS);
    this.ff['asientos'].setValue(this.info?.NSEATCOUNT);
    this.ff['zona_circulacion'].setValue(this.info?.ZCIRCU);
    this.ff['año'].setValue(this.info?.NYEAR);
    this.ff['fecha_inicio_vigencia'].setValue(this.info?.INICIO_VIGENCIA);
    this.ff['fecha_fin_vigencia'].setValue(this.info?.FIN_VIGENCIA);
    this.ff['tipo_documento'].setValue(this.info?.SDOC_TYPE);
    this.ff['razon_social'].setValue(this.info?.SLEGALNAME);
    this.ff['numero_documento'].setValue(this.info?.SIDDOC);
    this.ff['nombres'].setValue(this.info?.SFIRSTNAME);
    this.ff['apellido_paterno'].setValue(this.info?.SLASTNAME);
    this.ff['apellido_materno'].setValue(this.info?.SLASTNAME2);
    this.ff['departamento'].setValue(this.info?.DEPARTAMENTO);
    this.ff['provincia'].setValue(this.info?.PROVINCIA);
    this.ff['distrito'].setValue(this.info?.DISTRITO);
    this.ff['direccion'].setValue(this.info?.SSTREET);
    this.ff['correo'].setValue(this.info?.SE_MAIL);
    this.ff['telefono'].setValue(this.info?.TELEFONO);
    this.ff['SCLIENAME'].setValue(this.info?.SCLIENAME);
    this.ff['ANULADO'].setValue(this.info?.ANULADO);
  }

  imprimir() {
    this.downloadURL =
      this.urlApi +
      '/AnnulmentNroLtDes/Core/ImprimirReporte?INICIO_VIGENCIA=' +
      this.ff['fecha_inicio_vigencia']?.value +
      '&FIN_VIGENCIA=' +
      this.ff['fecha_fin_vigencia']?.value +
      '&CANAL=' +
      this.ff['canal_venta']?.value +
      '&MONEDA=' +
      this.ff['moneda']?.value +
      '&CLASE=' +
      this.ff['clase']?.value +
      '&SREGIST=' +
      this.ff['placa']?.value +
      '&MARCA=' +
      this.ff['marca']?.value +
      '&MODELO=' +
      this.ff['modelo']?.value +
      '&USO=' +
      this.ff['uso']?.value +
      '&NSEATCOUNT=' +
      this.ff['asientos']?.value +
      '&SCHASSIS=' +
      this.ff['serie']?.value +
      '&NYEAR=' +
      this.ff['año']?.value +
      '&ZCIRCU=' +
      this.ff['zona_circulacion']?.value +
      '&NIDDOC_TYPE=' +
      this.info?.NIDDOC_TYPE +
      '&SDOC_TYPE=' +
      this.ff['tipo_documento']?.value +
      '&SIDDOC=' +
      this.ff['numero_documento']?.value +
      '&SFIRSTNAME=' +
      this.ff['nombres']?.value +
      '&SLASTNAME=' +
      this.ff['apellido_paterno']?.value +
      '&SLASTNAME2=' +
      this.ff['apellido_materno']?.value +
      '&SLEGALNAME=' +
      this.ff['razon_social']?.value +
      '&SCLIENAME=' +
      this.ff['SCLIENAME']?.value +
      '&DEPARTAMENTO=' +
      this.ff['departamento']?.value +
      '&PROVINCIA=' +
      this.ff['provincia']?.value +
      '&DISTRITO=' +
      this.ff['distrito']?.value +
      '&SSTREET=' +
      this.ff['direccion']?.value +
      '&SE_MAIL=' +
      this.ff['correo']?.value +
      '&NPREMIUM=' +
      this.ff['tarifa']?.value +
      '&FECHA_EMISION=' +
      this.ff['fecha_emision']?.value +
      '&HORA_EMISION=' +
      this.ff['hora_emisión']?.value +
      '&NRECEIPT=' +
      this.info?.NRECEIPT +
      '&SCERTYPE=' +
      this.info?.SCERTYPE +
      '&NBRANCH=' +
      this.info?.NBRANCH +
      '&NPRODUCT=' +
      this.info?.NPRODUCT +
      '&SCLIENT=' +
      this.info?.SCLIENT +
      '&NBILLNUM=' +
      this.info?.NBILLNUM +
      '&NINSUR_AREA=' +
      this.info?.NINSUR_AREA +
      '&SBILLTYPE_ORI=' +
      this.info?.SBILLTYPE_ORI +
      '&SBILLTYPE=' +
      this.info?.SBILLTYPE +
      '&NTRANSACTIO=' +
      this.info?.NTRANSACTIO +
      '&NCOMMISSI=' +
      this.info?.NCOMMISSI +
      '&FE_CREACION=' +
      this.ff['fecha_creacion']?.value +
      '&USU_CREACION=' +
      this.ff['usuario_emision']?.value +
      '&NRO_PLANILLA=' +
      this.ff['planilla']?.value +
      '&NRO_LOTE_DESCARGO=' +
      this.ff['lote_descargo']?.value +
      '&ANULADO=' +
      this.info?.ANULADO +
      '&TELEFONO=' +
      this.ff['telefono']?.value +
      '&ORIGEN=' +
      this.ff['origen']?.value +
      '&NDIGIT_VERIF=' +
      this.info?.NDIGIT_VERIF +
      '&NPOLICY=' +
      this.ff['certificado']?.value;
    window.open(this.downloadURL);
  }

  openModalMessage(message: string): void {
    this.alertMessage = message;
    this._vc.createEmbeddedView(this.modalMessage);
  }

  closeModal(): void {
    this._vc.clear();
  }
}
