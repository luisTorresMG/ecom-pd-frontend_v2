import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AnulaciónCertificadoService } from '../../../services/transaccion/anulacion-certificado/anulacion-certificado.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BuscarRequest,
  IBuscarResponse,
  IMotivoResponse,
  AnularRequest,
  IAnularResponse,
  ValidarRequest,
  IValidarResponse,
  IAnularCertifiResponse,
  EnviarEmailResponse,
} from '../../../models/anulacion-certificado/anulacion-certificado.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import moment from 'moment';
@Component({
  selector: 'app-anulacion-certificado',
  templateUrl: './anulacion-certificado.component.html',
  styleUrls: ['./anulacion-certificado.component.css'],
})
export class AnulacionCertificadoComponent implements OnInit {
  showSelected: boolean;
  form: FormGroup;
  formAnularCertificado: FormGroup;
  formAnular: FormGroup;
  formCertificado: FormGroup;
  P_NPOLICY: string;
  P_NMOTIVOANU: string;
  P_DNULLDATE: string;
  P_NBILLNUM: string;
  P_DSTARTDATE: string;
  P_DEXPIRDAT: string;
  P_NPREMIUM: string;
  P_SDESCRIPTANU: string;
  P_AREA: any;
  P_AREA2: any;
  P_AREA3: any;
  P_MENSAJE_ANULACION: any;
  seleccionado: any;
  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  @ViewChild('modalAnular', { static: true }) modalAnular: ModalDirective;
  @ViewChild('modalValidar', { static: true }) modalValidar: ModalDirective;
  @ViewChild('modalAnular1', { static: true }) modalAnular1: ModalDirective;
  @ViewChild('modalAnularCertifi', { static: true })
  modalAnularCertifi: ModalDirective;
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _AnulaciónCertificadoService: AnulaciónCertificadoService
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
    this.form = this._FormBuilder.group({
      certificado: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.required,
        ]),
      ],
    });
    this.formCertificado = this._FormBuilder.group({
      canal: [null],
      moneda: [null],
      fecha_emision: [null],
      hora_emision: [null],
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
    });
    this.formAnularCertificado = this._FormBuilder.group({
      motivo: [null, Validators.required],
      fechaAnulacion: [null, Validators.required],
    });
    this.formAnular = this._FormBuilder.group({
      area: [0],
    });
    this.showSelected = true;
  }

  dataAnulacionCertificado: IBuscarResponse;
  dataCertificado: any;
  dataAnular: any;
  dataMotivo: any;
  dataValidar: any;
  dataAnularCertificado: any;
  dataEnviarEmail: any;

  get fc(): any {
    return this.form.controls;
  }

  get ff(): any {
    return this.formCertificado.controls;
  }

  get f(): any {
    return this.formAnularCertificado.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  ngOnInit(): void {
    this.motivo();
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.fc['certificado'].valueChanges.subscribe((val) => {
      if (this.fc['certificado'].hasError('pattern')) {
        this.fc['certificado'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.ff['tipo_documento'].valueChanges.subscribe((val) => {
      if (val === 'RUC') {
        this.showSelected = false;
      } else {
        this.showSelected = true;
      }
    });
  }

  searchData(): void {
    this._spinner.show();
    const data: BuscarRequest = new BuscarRequest(this.form.getRawValue());
    this._AnulaciónCertificadoService.listar(data).subscribe(
      (response: IBuscarResponse) => {
        this.dataAnulacionCertificado = response;
        console.log(response);
        this.ff['canal'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.CANAL
        );
        this.ff['moneda'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.MONEDA
        );
        this.ff['fecha_emision'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.FECHA_EMISION
        );
        this.ff['hora_emision'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.HORA_EMISION
        );
        this.ff['tarifa'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.NPREMIUM
        );
        this.ff['placa'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SREGIST
        );
        this.ff['clase'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.CLASE
        );
        this.ff['uso'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.USO
        );
        this.ff['marca'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.MARCA
        );
        this.ff['modelo'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.MODELO
        );
        this.ff['serie'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SCHASSIS
        );
        this.ff['asientos'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.NSEATCOUNT
        );
        this.ff['zona_circulacion'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.ZCIRCU
        );
        this.ff['año'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.NYEAR
        );
        this.ff['fecha_inicio_vigencia'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.INICIO_VIGENCIA
        );
        this.ff['fecha_fin_vigencia'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.FIN_VIGENCIA
        );
        this.ff['tipo_documento'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SDOC_TYPE
        );
        this.ff['numero_documento'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SIDDOC
        );
        this.ff['nombres'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SFIRSTNAME
        );
        this.ff['apellido_paterno'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SLASTNAME
        );
        this.ff['apellido_materno'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SLASTNAME2
        );
        this.ff['razon_social'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SLEGALNAME
        );
        this.ff['departamento'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.DEPARTAMENTO
        );
        this.ff['provincia'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.PROVINCIA
        );
        this.ff['distrito'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.DISTRITO
        );
        this.ff['direccion'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SSTREET
        );
        this.ff['correo'].setValue(
          this.dataAnulacionCertificado.PRO_CERTIF[0]?.SE_MAIL
        );
        this.formAnularCertificado.reset();
        console.log(this.formAnularCertificado.value);
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  showModalAnularCertificado(): void {
    this.modalAnular.show();
  }
  hideModalAnularCertificado(): void {
    this.modalAnular.hide();
  }

  ocultarModalAnularCertifi() {
    this.modalAnularCertifi.hide();
  }

  anularCertificadoSubmit() { }

  showModalMensaje() { }

  ocultarModalValidar() {
    this.modalValidar.hide();
  }

  ocultarModalAnular1() {
    this.modalAnular1.hide();
  }

  limpiar() {
    this.formCertificado.reset();
    this.form.reset();
    this.formAnularCertificado.reset();
    this.dataAnulacionCertificado = null;
  }

  onChange(seleccionado) {
    console.log(seleccionado);
    this.seleccionado = seleccionado;
  }
  motivo() {
    this._AnulaciónCertificadoService.motivo().subscribe(
      (response: IMotivoResponse) => {
        this.dataMotivo = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  ocultarModalAnular() {
    this.modalAnular.hide();
  }

  textoMotivo(idMotivo) {
    return (
      this.dataMotivo?.PRO_MOTIVE?.find(
        (x) => x.NNULLCODE?.toString() === idMotivo?.toString()
      )?.SDESCRIPT || ''
    );
  }
  anular() {
    this._spinner.show();
    const date = new Date(this.f['fechaAnulacion'].value);
    const data: any = {
      P_NPOLICY: this.fc['certificado'].value,
      P_NMOTIVOANU: this.f['motivo'].value,
      P_DNULLDATE: `${date.getDate()}/${date.getMonth() + 1
        }/${date.getFullYear()}`,
      P_NBILLNUM: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NBILLNUM,
      P_DSTARTDATE: this.ff['fecha_inicio_vigencia'].value,
      P_DEXPIRDAT: this.ff['fecha_fin_vigencia'].value,
      P_NPREMIUM: this.ff['tarifa'].value,
      P_SDESCRIPTANU: this.textoMotivo(this.f['motivo'].value),
    };
    this._AnulaciónCertificadoService.anular(data).subscribe(
      (response: IAnularResponse) => {
        this.dataAnular = response;
        if (this.dataAnular?.PRO_VALANULAR?.P_ES_ERROR === 0) {
          this.modalAnular.show();
          this.P_AREA = [this.dataAnular.PRO_VALANULAR.P_ERROR_MSG];
        } else {
          this.modalAnular1.show();
          this.P_AREA3 = [this.dataAnular.PRO_VALANULAR.P_ERROR_MSG];
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  validar() {
    this._spinner.show();
    const data: ValidarRequest = new ValidarRequest(this.form.getRawValue());
    this._AnulaciónCertificadoService.validar(data).subscribe(
      (response: IValidarResponse) => {
        this.dataValidar = response;
        if (this.dataValidar?.VAL_CERTIF?.P_ES_ERROR === 1) {
          this.modalValidar.show();
          this.P_AREA2 = [this.dataValidar.VAL_CERTIF.P_ERROR_MSG];
        } else {
          this.searchData();
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  procesoAnular() {
    this._spinner.show();
    console.dir(this.dataAnulacionCertificado?.PRO_CERTIF[0]);
    const date = new Date(this.f['fechaAnulacion'].value);
    const data: any = {
      P_NPOLICY: this.fc['certificado'].value,
      P_NMOTIVOANU: this.f['motivo'].value,
      P_DNULLDATE: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      P_NUSERCODE: this.currentUser.id,
      P_NVALOR_DEVOLVER: this.dataAnular?.PRO_VALANULAR?.P_NVALOR_DEVOLVER,
      P_INDICA_TI_ANULA: this.dataAnular?.PRO_VALANULAR?.P_INDICA_TI_ANULA,
      P_NRECEIPT: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NRECEIPT,
      P_SCERTYPE: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.SCERTYPE,
      P_NBRANCH: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NBRANCH,
      P_NPRODUCT: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NPRODUCT,
      P_SCLIENT: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.SCLIENT,
      P_DSTARTDATE: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.INICIO_VIGENCIA,
      P_NBILLNUM: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NBILLNUM,
      P_NINSUR_AREA: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NINSUR_AREA,
      P_SBILLTYPE_ORI: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.SBILLTYPE_ORI,
      P_SBILLTYPE: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.SBILLTYPE,
      P_NPREMIUM: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NPREMIUM,
      P_NTRANSACTIO: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NTRANSACTIO,
      P_NCOMMISSI: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NCOMMISSI,
      P_NDIGIT_VERIF: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NDIGIT_VERIF,
      P_NIDDOC_TYPE: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.NIDDOC_TYPE,
      P_SIDDOC: this.dataAnulacionCertificado?.PRO_CERTIF[0]?.SIDDOC,
    };
    this._AnulaciónCertificadoService.anularCertifi(data).subscribe(
      (response: any) => {
        console.log(response);
        this.dataAnularCertificado = response;
        this.modalAnularCertifi.show();
        this.modalAnular.hide();
        this.P_MENSAJE_ANULACION = [
          this.dataAnularCertificado.PRO_ANULAR.P_ERROR_MSG,
        ];
        this.limpiar();
        this._spinner.hide();
        if (response?.PRO_ANULAR?.P_ES_ERROR === 1) {
          return;
        }
        this.enviarEmail();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  enviarEmail() {
    this._spinner.show();
    const data: any = {
      nroCertificado: this.fc['certificado'].value,
      razonSocial:
        this.ff['nombres'].value +
        this.ff['apellido_paterno'].value +
        this.ff['apellido_materno'].value || this.ff['razon_social'].value,
      correo: this.ff['correo'].value,
    };
    this._AnulaciónCertificadoService.enviarEmail(data).subscribe(
      (response: EnviarEmailResponse) => {
        this.dataEnviarEmail = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }
}
