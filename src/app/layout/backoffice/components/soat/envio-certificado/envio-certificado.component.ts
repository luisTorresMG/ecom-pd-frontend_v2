import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';
import { Router } from '@angular/router';
import { EnvioCertificadoService } from '../../../services/soat/envio-certificado.service';
import {
  ListarRequest,
  IListarResponse,
  IUsoResponse,
  ITipoResponse,
  IDepartamentoResponse,
  IProvinciaResponse,
  IDistritoResponse,
  IZonaResponse,
  IModeloResponse,
  IClaseResponse,
  IEnviarResponse,
  EnviarRequest,
  IMarcaResponde,
} from '../../../models/soat/envio-certificado.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { viewClassName } from '@angular/compiler';

@Component({
  selector: 'app-envio-certificado',
  templateUrl: './envio-certificado.component.html',
  styleUrls: ['./envio-certificado.component.scss'],
})
export class EnvioCertificadoComponent implements OnInit {
  showSelected: boolean;
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  formEnviar: FormGroup;
  @ViewChild('modalResultado') modalResultado: ModalDirective;
  @ViewChild('modalConfirmacion') modalConfirmacion: ModalDirective;
  selectedAll: any;
  info: any;
  constructor(
    private readonly _envioCertificadoService: EnvioCertificadoService,
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
      certificado: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.maxLength(10),
          Validators.minLength(10),
        ]),
      ],
      placa: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9a-zA-Z]*$/),
          Validators.required,
          Validators.maxLength(6),
          Validators.minLength(6),
        ]),
      ],
    });
    this.formEnviar = this._builder.group({
      correo: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ]),
      ],
    });
    this.showSelected = false;
  }

  dataEnvioCotizacion: IListarResponse;
  dataEnvioCorreo: any;
  dataUso: any;
  dataTipoDoc: any;
  dataDepart: any;
  dataProv: any;
  dataDist: any;
  dataZona: any;
  dataModelo: any;
  dataClase: any;
  dataMarca: any;

  oldPoliza: string;
  oldPlaca: string;

  ngOnInit(): void {
    this.uso();
    this.tipoUso();
    this.depart();
    this.marca();
    this.fc['certificado'].valueChanges.subscribe((val) => {
      if (val) {
        this.fc['certificado'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.required,
            Validators.maxLength(10),
            Validators.minLength(10),
          ])
        );
        this.fc['placa'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9a-zA-Z]*$/),
            Validators.maxLength(6),
            Validators.minLength(6)
          ])
        );
        this.fc['placa'].clearValidators();
      } else {
        this.fc['certificado'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.maxLength(10),
            Validators.minLength(10),
          ])
        );
        this.fc['placa'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9a-zA-Z]*$/),
            Validators.required,
            Validators.maxLength(6),
            Validators.minLength(6)
          ])
        );
      }
      this.fc['placa'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['certificado'].updateValueAndValidity({
        emitEvent: false,
      });
      if (val) {
        if (this.fc['certificado'].hasError('pattern')) {
          this.fc['certificado'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fc['placa'].valueChanges.subscribe((val) => {
      if (val) {
        this.fc['certificado'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.maxLength(10),
            Validators.minLength(10),
          ])
        );
        this.fc['placa'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9a-zA-Z]*$/),
            Validators.required,
            Validators.maxLength(6),
            Validators.minLength(6)
          ])
        );
        this.fc['certificado'].clearValidators();

      } else {
        this.fc['certificado'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.maxLength(10),
            Validators.minLength(10),
          ])
        );
        this.fc['placa'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9a-zA-Z]*$/),
            Validators.maxLength(6),
            Validators.minLength(6)
          ])
        );
      }
      this.fc['certificado'].updateValueAndValidity({
        emitEvent: false,
      });
      this.fc['placa'].updateValueAndValidity({
        emitEvent: false,
      });
      if (val) {
        if (this.fc['placa'].hasError('pattern')) {
          this.fc['placa'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
  }

  get fc(): any {
    return this.form.controls;
  }

  get ff(): any {
    return this.formEnviar.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  showbuscar() {
    this.info = null;
    this.showSelected = false;
    this._spinner.show();
    const data: ListarRequest = new ListarRequest(this.form.getRawValue());
    this._envioCertificadoService.listar(data).subscribe(
      (response: IListarResponse) => {
        this.dataEnvioCotizacion = response;
        this.modalResultado.show();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
    /*this._envioCertificadoService
      .listar(new ListarRequest(this.form.getRawValue()))
      .subscribe(
        (res: any) => {
          console.log(res);
          this.data = new ListarResponse(res);
          this._spinner.hide();
          this.modalResultado.show();
        },
        (error) => {
          console.log(error);
          this._spinner.hide();
        }
      );*/
  }

  enviar() {
    this._spinner.show();
    const data: EnviarRequest = {
      ...this.form.getRawValue(),
      certificado: this.fc.certificado.value ? this.fc.certificado.value : 0,
      ...this.formEnviar.getRawValue(),
      correo: this.ff.correo ? this.ff.correo.value : 0,
    };
    this._envioCertificadoService.enviar(data).subscribe(
      (response: IEnviarResponse) => {
        this.dataEnvioCorreo = response;
        this.modalConfirmacion.show();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  ocultarConfirmacion() {
    this.modalConfirmacion.hide();
  }

  hidebuscar() {
    this.modalResultado.hide();
    this.form.reset();
    this.info = null;
  }

  limpiar() {
    this.form.reset();
    this.showSelected = false;
    this.info = null;
  }

  guardarInfo(data) {
    this.info = data;
  }

  // APIS EXTRAS

  // USO
  uso() {
    this._envioCertificadoService.uso().subscribe(
      (response: IUsoResponse) => {
        this.dataUso = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }
  descripcionUso(idU) {
    return (
      this.dataUso?.PRO_USE?.find(
        (x) => x.NIDUSO?.toString() === idU?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // TIPO DE DOCUMENTO

  tipoUso() {
    this._envioCertificadoService.tipo_do().subscribe(
      (response: ITipoResponse) => {
        this.dataTipoDoc = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionTipoDoc(idD) {
    return (
      this.dataTipoDoc?.PRO_MASTER?.find(
        (x) => x.SITEM?.toString() === idD?.toString()
      )?.SDECRIPTION || ''
    );
  }

  // DEPARTAMENTO
  depart() {
    this._envioCertificadoService.depar().subscribe(
      (response: IDepartamentoResponse) => {
        this.dataDepart = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionDepartamento(idDe) {
    return (
      this.dataDepart?.PRO_DEPARTMENT?.find(
        (x) => x.NPROVINCE?.toString() === idDe?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // PROVINCIA
  provin() {
    const data: any = {
      P_NPROVINCE: this.info?.NPROVINCE,
      P_NLOCAL: 0,
      P_SDESCRIPT: '',
      _: 1636488179396,
    };
    this._envioCertificadoService.prov(data).subscribe(
      (response: IProvinciaResponse) => {
        this.dataProv = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionProvincia(idP) {
    return (
      this.dataProv?.PRO_PROVINCE?.find(
        (x) => x.NLOCAL?.toString() === idP?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // DISTRITO
  distr() {
    const data: any = {
      P_NLOCAL: this.info?.NLOCAL,
      P_NMUNICIPALITY: 0,
      P_SDESCRIPT: '',
      _: 1636488180225,
    };
    this._envioCertificadoService.dist(data).subscribe(
      (response: IDistritoResponse) => {
        this.dataDist = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionDistrito(idDis) {
    return (
      this.dataDist?.PA_SEL_MUNICIPALITY?.find(
        (x) => x.NMUNICIPALITY?.toString() === idDis?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // ZONA
  zona() {
    const data: any = {
      P_SREGIST: this.info?.SPLACA,
      P_STYPE_VEHICLE: this.info?.TI_VEHICULO,
      P_NPROVINCE: '',
      P_NYEAR: this.info?.NYEAR,
      _: 1636488180225,
    };
    this._envioCertificadoService.zona(data).subscribe(
      (response: IZonaResponse) => {
        this.dataZona = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }
  descripcionZona(idZ) {
    return (
      this.dataZona?.PRO_ZONE?.find(
        (x) => x.NPROVINCE?.toString() === idZ?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // MARCA

  marca() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1636492273283,
    };
    this._envioCertificadoService.marca(data).subscribe(
      (response: IMarcaResponde) => {
        this.dataMarca = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionMarca(idM) {
    return (
      this.dataMarca?.PRO_MARK?.find(
        (x) => x.NVEHBRAND?.toString() === idM?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // MODELO
  modelo() {
    const data: any = {
      P_NVEHBRAND: this.info?.SPLACA,
      P_NVEHMODEL: 0,
      P_SDESCRIPT: '',
      _: 1636492273218,
    };
    this._envioCertificadoService.modelo(data).subscribe(
      (response: IModeloResponse) => {
        this.dataModelo = response.PRO_MODEL;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionModelo(id: any): string {
    return /* this.dataModelo.find((x) => Number(x) === Number(id)) */ '';
  }

  // CLASE
  clase() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1636492273283,
    };
    this._envioCertificadoService.clase(data).subscribe(
      (response: IClaseResponse) => {
        this.dataClase = response.PRO_CLASS;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  descripcionClase(id: any): string {
    return /* this.dataClase.find((x) => Number(x) === Number(id)) */ '';
  }

  // VER MODAL CON INFORMACION
  showInformacionCertificado() {
    this.showSelected = true;
    this.modalResultado.hide();
    this.provin();
    this.distr();
    this.zona();
    this.modelo();
    this.clase();
    this.formEnviar.get('correo').setValue(this.info?.SE_MAIL);
  }
}
