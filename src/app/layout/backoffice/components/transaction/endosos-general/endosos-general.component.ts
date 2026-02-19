import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { EndososDto } from './DTOs/endosos.dto';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { EndososGeneralService } from '../../../services/transaccion/endosos-general/endosos-general.service';
import {
  ITipoDocResponse,
  IBuscarResponse,
  IMarcaResponse,
  IUsoResponse,
  IVersionResponse,
  IClaseResponse,
  IDepartamentoResponse,
  IProvinciaResponse,
  IDistritoResponse,
  IModificarResponse,
  IValidarResponse,
  IComparacionResponse,
} from '../../../models/transaccion/endosos-general/endosos-general.model';
import moment from 'moment';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { ParametersResponse } from '../../../../../shared/models/ubigeo/parameters.model';
@Component({
  selector: 'app-endodos-general',
  templateUrl: './endosos-general.component.html',
  styleUrls: ['./endosos-general.component.scss'],
})
export class EndososGeneralComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  @ViewChild('modalError', { static: true }) modalError: ModalDirective;
  @ViewChild('modalModificar', { static: true }) modalModificar: ModalDirective;
  @ViewChild('modalModificarError', { static: true })
  modalModificarError: ModalDirective;
  @ViewChild('modalValidar', { static: true }) modalValidar: ModalDirective;
  @ViewChild('modalResultado', { static: true }) modalResultado: ModalDirective;
  typeCertificadoSearch: string;
  formCertificadoSearch: FormGroup;
  formDataCertificado: FormGroup;
  mensajeModal: string;
  isShowModal: boolean;
  dataEndosos: EndososDto;
  isSearchedData: boolean;
  isChangeForm: {
    iniVigencia: boolean;
    finVigencia: boolean;
    fechaEmision: boolean;
    horaEmision: boolean;
    placaAuto: boolean;
    marcaAuto: boolean;
    versionAuto: boolean;
    claseAuto: boolean;
    anio: boolean;
    serie: boolean;
    emailContratante: boolean;
  };
  @ViewChild('modalGuardar', { static: true }) modalGuardar: ModalDirective;
  dataEstado: any;
  tipoDocumento: any;
  dataUso: any;
  dataBuscada: any;
  dataClase: any;
  dataClase2: any;
  dataValidar: any;
  dataDepart: any;
  MENSAJE2: any;
  dataVersion: any;
  dataVersion2: any;
  dataDistr: any;
  FECHAINICIO: any;
  infoVersion: any;
  infoVersionCodigo: any;
  dataProv: any;
  dataModificar: any;
  infoMarca: any;
  dataComparacion: any;
  MENSAJEFINAL: any;
  MENSAJEFINALERROR: any;
  MENSAJE: any;
  info: any;
  parameters: ParametersResponse;
  dataMarca: any;
  versioninfo: any;

  limitDocumentNumber: { min: number; max: number };
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _EndososGeneralService: EndososGeneralService,
    private readonly _UtilsService: UtilsService
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
    this.typeCertificadoSearch = 'SELECCIONE';
    this.formCertificadoSearch = this._FormBuilder.group({
      certificado: [
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
          Validators.pattern(/^[a-zA-Z\d]*$/),
          Validators.minLength(6),
          Validators.maxLength(6),
        ]),
      ],
      tipoDoc: [0, Validators.required],
      numero: [null, Validators.compose([Validators.pattern(/^[\d]*$/)])],
      nombre: [null, Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)],
      apellidop: [null, Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)],
      apellidom: [null, Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)],
    });
    this.isShowModal = false;
    this.initDataEndosos();
    this.isSearchedData = false;
    this.isChangeForm = {
      anio: false,
      claseAuto: false,
      emailContratante: false,
      fechaEmision: false,
      finVigencia: false,
      horaEmision: false,
      iniVigencia: false,
      marcaAuto: false,
      placaAuto: false,
      serie: false,
      versionAuto: false,
    };
    this.initFormDataEndoso();
  }
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.tipoDoc();
    this.ubigeos();
    this.uso();
    this.version3();
    this.clase3();
    this.version();
    this.clase();
    this.f['certificado'].valueChanges.subscribe((val) => {
      if (val) {
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.f['certificado'].setValue(val.substring(0, val.length - 1));
        }
        if (this.f['certificado'].hasError('pattern')) {
          this.f['certificado'].setValue(val.substring(0, val.length - 1));
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
    this.f['tipoDoc'].valueChanges.subscribe((val) => {
      this.f['numero'].setValue(null);
      if (val) {
        switch (+val) {
          case 2:
            this.limitDocumentNumber = {
              min: 8,
              max: 8,
            };
            break;
          case 4:
            this.limitDocumentNumber = {
              min: 9,
              max: 9,
            };
            break;
          case 1:
            this.limitDocumentNumber = {
              min: 9,
              max: 12,
            };
            break;
        }
        if (+val !== 0) {
          this.f['numero'].setValidators(
            Validators.compose([
              Validators.required,
              Validators.pattern(/^[\d]*$/),
              Validators.minLength(this.limitDocumentNumber?.min || 8),
              Validators.maxLength(this.limitDocumentNumber?.max || 8),
            ])
          );
        } else {
          this.f['numero'].setValidators(
            Validators.compose([
              Validators.pattern(/^[\d]*$/),
              Validators.minLength(this.limitDocumentNumber?.min || 8),
              Validators.maxLength(this.limitDocumentNumber?.max || 8),
            ])
          );
        }

        this.f['numero'].updateValueAndValidity({
          emitEvent: false,
        });
      }
    });
    this.f['numero'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['numero'].hasError('pattern')) {
          this.f['numero'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.f['nombre'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.f['nombre'].hasError('pattern')) {
          this.f['nombre'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.f['apellidop'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.f['apellidop'].hasError('pattern')) {
          this.f['apellidop'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.f['apellidom'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.f['apellidom'].hasError('pattern')) {
          this.f['apellidom'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.ff['placaAuto'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.ff['placaAuto'].hasError('pattern')) {
          this.ff['placaAuto'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.ff['serie'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.ff['serie'].hasError('pattern')) {
          this.ff['serie'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.ff['anio'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.ff['anio'].hasError('pattern')) {
          this.ff['anio'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.ff['marcaAuto'].valueChanges.subscribe((val: string) => {
      this.infoMarca = val;
    });
  }

  get f(): any {
    return this.formCertificadoSearch.controls;
  }

  get ff(): any {
    return this.formDataCertificado.controls;
  }

  ocultarModalValidar() {
    this.modalValidar.hide();
    this.modalModificar.hide();
    this.modalModificarError.hide();
  }

  ubigeos() {
    this._UtilsService.parameters().subscribe(
      (response: ParametersResponse) => {
        this.parameters = response;
        this.dataDepart = response.ubigeos;
      },
      (error: any) => {}
    );
  }

  initFormDataEndoso(): void {
    this.formDataCertificado = this._FormBuilder.group({
      iniVigencia: [
        { value: this.dataEndosos.poliza.iniVigencia, disabled: true },
        Validators.required,
      ],
      finVigencia: [
        { value: this.dataEndosos.poliza.finVigencia, disabled: true },
        Validators.required,
      ],
      fechaEmision: [
        { value: this.dataEndosos.poliza.fechaEmision, disabled: true },
        Validators.required,
      ],
      horaEmision: [
        { value: this.dataEndosos.poliza.horaEmision, disabled: true },
        Validators.required,
      ],
      placaAuto: [
        { value: this.dataEndosos.vehiculo.placa, disabled: true },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9]*$/),
          Validators.required,
        ]),
      ],
      marcaAuto: [
        { value: this.dataEndosos.vehiculo.marca, disabled: true },
        Validators.required,
      ],
      versionAuto: [
        { value: this.dataEndosos.vehiculo.version, disabled: true },
        Validators.required,
      ],
      claseAuto: [
        { value: this.dataEndosos.vehiculo.clase, disabled: true },
        Validators.required,
      ],
      anio: [
        { value: this.dataEndosos.vehiculo.anio, disabled: true },
        Validators.compose([
          Validators.pattern(/^[\d]*$/),
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.min(1900),
          Validators.max(new Date().getFullYear() + 1),
        ]),
      ],
      serie: [
        { value: this.dataEndosos.vehiculo.serie, disabled: true },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z\d]*$/),
          Validators.required,
        ]),
      ],
      emailContratante: [
        { value: this.dataEndosos.contratante.email, disabled: false },
        Validators.required,
      ],
      motivoEndoso: [{ value: null, disabled: true }, Validators.required],
      observacion: [{ value: null, disabled: true }, Validators.required],
    });
  }

  guardarInfo(data) {
    console.log(data);
    this.info = data;
  }

  searchData(): void {
    if (this.formCertificadoSearch.invalid) {
      this.modalResultado.hide();
      this.modalModificarError.show();
      this.MENSAJEFINALERROR =
        'Debe ingresar un filtro para generar una búsqueda.';
      this._spinner.hide();
      this.isSearchedData = false;
      this.clearDataSearch();
      return;
    }
    this.info = null;
    this._spinner.show();
    const data: any = {
      P_NPOLESP: this.f['certificado'].value || '',
      P_SPLATE: this.f['placa'].value || '',
      P_NTIPPER: this.f['tipoDoc'].value,
      P_SNAME: this.f['nombre'].value || '',
      P_NNRODOC: this.f['numero'].value || '',
      P_SAPEPAT: this.f['apellidop'].value || '',
      P_SAPEMAT: this.f['apellidom'].value || '',
      P_NUSERCODE: this.currentUser.id,
    };
    this._EndososGeneralService.buscar(data).subscribe(
      (response: IBuscarResponse) => {
        console.log(response);
        this.formDataCertificado.disable();
        this.dataBuscada = response;
        if (this.dataBuscada?.Cantidad === 0) {
          this.modalError.show();
          this.MENSAJE = 'No se encontró registros con los filtros ingresados.';
          this._spinner.hide();
          this.isSearchedData = false;
          this.clearDataSearch();
          return;
        }
        if (this.dataBuscada?.Cantidad > 1) {
          this._spinner.hide();
          this.modalResultado.show();
        } else {
          this.info = response;
          this.marca();
          this.uso();
          this.dataProv = this.dataDepart?.find(
            (x) =>
              x.id?.toString() === response.PA_SEL_ENDOSO.NPROVINCE?.toString()
          )?.provincias;
          this.dataDistr = this.dataProv?.find(
            (x) =>
              x.idProvincia?.toString() ===
              response.PA_SEL_ENDOSO.NLOCAL?.toString()
          )?.distritos;
          this.version();
          this.clase();
          this.dataEndosos = this.dataEndosos = {
            poliza: {
              nCertificado: this.dataBuscada?.PA_SEL_ENDOSO?.NPOLESP_COMP,
              comprobante: this.dataBuscada?.PA_SEL_ENDOSO?.SCOMPROBANTE,
              iniVigencia: moment(
                this.dataBuscada?.PA_SEL_ENDOSO?.DVIGINI
              ).format('DD/MM/YYYY'),
              finVigencia: moment(
                this.dataBuscada?.PA_SEL_ENDOSO?.DVIGFIN
              ).format('DD/MM/YYYY'),
              horaEmision: this.dataBuscada?.PA_SEL_ENDOSO?.HORA_EMISION,
              fechaEmision: moment(
                this.dataBuscada?.PA_SEL_ENDOSO?.FECHA_EMISION
              ).format('DD/MM/YYYY'),
            },
            vehiculo: {
              placa: this.dataBuscada?.PA_SEL_ENDOSO?.SPLACA,
              marca: this.dataBuscada?.PA_SEL_ENDOSO?.NMARK,
              version: this.dataBuscada?.PA_SEL_ENDOSO?.DESVEHMODEL,
              clase: this.dataBuscada?.PA_SEL_ENDOSO?.NIDCLASE,
              uso: this.textoUso(this.dataBuscada?.PA_SEL_ENDOSO?.NIDUSO),
              nAsientos: this.dataBuscada?.PA_SEL_ENDOSO?.NSEATING,
              anio: this.dataBuscada?.PA_SEL_ENDOSO?.NYEAR,
              serie: this.dataBuscada?.PA_SEL_ENDOSO?.SSERIAL,
            },
            contratante: {
              apeMaterno: this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME2,
              apePaterno: this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME,
              departamento: this.textoDepartamento(
                this.dataBuscada?.PA_SEL_ENDOSO?.NPROVINCE
              ),
              direccion: this.dataBuscada?.PA_SEL_ENDOSO?.SADDRESS,
              distrito: this.textoDistrito(
                this.dataBuscada?.PA_SEL_ENDOSO?.NMUNICIPALITY
              ),
              email: this.dataBuscada?.PA_SEL_ENDOSO?.SE_MAIL,
              nDocumento: this.dataBuscada?.PA_SEL_ENDOSO?.SNUMDOC,
              nombres: this.dataBuscada?.PA_SEL_ENDOSO?.SNAME,
              provincia: this.textoProvincia(
                this.dataBuscada?.PA_SEL_ENDOSO?.NLOCAL
              ),
              tipoDocumento: this.dataBuscada?.PA_SEL_ENDOSO?.SDOC_TYPE,
              razonSocial: this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENTNAME,
              telefono: '',
            },
          };

          this.ff['iniVigencia'].setValue(this.dataEndosos.poliza.iniVigencia);
          this.ff['finVigencia'].setValue(this.dataEndosos.poliza.finVigencia);
          this.ff['fechaEmision'].setValue(
            this.dataEndosos.poliza.fechaEmision
          );
          this.ff['horaEmision'].setValue(this.dataEndosos.poliza.horaEmision);

          this.ff['placaAuto'].setValue(this.dataEndosos.vehiculo.placa);
          this.ff['marcaAuto'].setValue(this.dataEndosos.vehiculo.marca);
          this.ff['versionAuto'].setValue(this.dataEndosos.vehiculo.version);
          this.ff['claseAuto'].setValue(this.dataEndosos.vehiculo.clase);
          this.ff['anio'].setValue(this.dataEndosos.vehiculo.anio);
          this.ff['serie'].setValue(this.dataEndosos.vehiculo.serie);

          this.ff['emailContratante'].setValue(
            this.dataEndosos.contratante.email
          );
          this._spinner.hide();
        }
        this.isSearchedData = true;
        this.formDataCertificado.get('motivoEndoso').setValue(null);
        this.formDataCertificado.get('observacion').setValue(null);
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
    this.formDataCertificado.disable();
  }
  setEnableForm(): void {
    this.formDataCertificado.enable();
    this.ff['iniVigencia'].disable();
    this.ff['finVigencia'].disable();
    this.ff['fechaEmision'].disable();
    this.ff['horaEmision'].disable();

    if (this.info?.PA_SEL_ENDOSO.V_AUTORIZA === 'N') {
      this.ff['marcaAuto'].disable();
      this.ff['versionAuto'].disable();
      this.ff['claseAuto'].disable();
      this.ff['anio'].disable();
    } else {
      this.ff['marcaAuto'].enable();
      this.ff['versionAuto'].enable();
      this.ff['claseAuto'].enable();
      this.ff['anio'].enable();
    }

    this.formDataCertificado
      .get('iniVigencia')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.poliza.iniVigencia) {
          this.isChangeForm.iniVigencia = true;
        } else {
          this.isChangeForm.iniVigencia = false;
        }
      });
    this.formDataCertificado
      .get('finVigencia')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.poliza.finVigencia) {
          this.isChangeForm.finVigencia = true;
        } else {
          this.isChangeForm.finVigencia = false;
        }
      });
    this.formDataCertificado
      .get('fechaEmision')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.poliza.fechaEmision) {
          this.isChangeForm.fechaEmision = true;
        } else {
          this.isChangeForm.fechaEmision = false;
        }
      });
    this.formDataCertificado
      .get('horaEmision')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.poliza.horaEmision) {
          this.isChangeForm.horaEmision = true;
        } else {
          this.isChangeForm.horaEmision = false;
        }
      });
    this.formDataCertificado.get('placaAuto').valueChanges.subscribe((val) => {
      if (val !== this.dataEndosos.vehiculo.placa) {
        this.isChangeForm.placaAuto = true;
      } else {
        this.isChangeForm.placaAuto = false;
      }
    });
    this.formDataCertificado.get('marcaAuto').valueChanges.subscribe((val) => {
      if (val !== this.dataEndosos.vehiculo.marca) {
        this.isChangeForm.marcaAuto = true;
      } else {
        this.isChangeForm.marcaAuto = false;
      }
    });
    this.formDataCertificado
      .get('versionAuto')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.vehiculo.version) {
          this.isChangeForm.versionAuto = true;
        } else {
          this.isChangeForm.versionAuto = false;
        }
      });
    this.formDataCertificado.get('claseAuto').valueChanges.subscribe((val) => {
      if (val !== this.dataEndosos.vehiculo.clase) {
        this.isChangeForm.claseAuto = true;
      } else {
        this.isChangeForm.claseAuto = false;
      }
    });
    this.formDataCertificado.get('anio').valueChanges.subscribe((val) => {
      if (val !== this.dataEndosos.vehiculo.anio) {
        this.isChangeForm.anio = true;
      } else {
        this.isChangeForm.anio = false;
      }
    });
    this.formDataCertificado.get('serie').valueChanges.subscribe((val) => {
      if (val !== this.dataEndosos.vehiculo.serie) {
        this.isChangeForm.serie = true;
      } else {
        this.isChangeForm.serie = false;
      }
    });
    this.formDataCertificado
      .get('emailContratante')
      .valueChanges.subscribe((val) => {
        if (val !== this.dataEndosos.contratante.email) {
          this.isChangeForm.emailContratante = true;
        } else {
          this.isChangeForm.emailContratante = false;
        }
      });
  }
  changeTypeCertificadoSearch() {
    this.typeCertificadoSearch =
      this.formCertificadoSearch.get('tipoDoc').value;
  }

  textoTipoDocumento(idTD) {
    /*  return (
       this.dataEstado?.PRO_MASTER?.find(
         (x) => x.SITEM?.toString() === idTD?.toString()
       )?.SDECRIPTION || ''
     ); */
    switch (+idTD /*  */) {
      case 2:
        return 'DNI';
      case 4:
        return 'C.E.';
      case 1:
        return 'RUC';
      default:
        return '';
    }
  }

  changeValueTipoDocumento(e: string): void {
    this.tipoDocumento = this.textoTipoDocumento(e);
  }

  initDataEndosos(): void {
    this.dataEndosos = {
      poliza: {
        nCertificado: '',
        comprobante: '',
        iniVigencia: '',
        finVigencia: '',
        horaEmision: '',
        fechaEmision: '',
      },
      vehiculo: {
        placa: '',
        marca: '',
        version: '',
        clase: '',
        uso: '',
        nAsientos: '',
        anio: '',
        serie: '',
      },
      contratante: {
        apeMaterno: '',
        apePaterno: '',
        departamento: '',
        direccion: '',
        distrito: '',
        email: '',
        nDocumento: '',
        nombres: '',
        provincia: '',
        tipoDocumento: '',
        telefono: '',
        razonSocial: '',
      },
    };
  }
  clearDataSearch(): void {
    this.info = null;
    // this.typeCertificadoSearch = 'Seleccione';
    this.formCertificadoSearch.get('tipoDoc').setValue(0);
    this.formCertificadoSearch.get('placa').setValue(null);
    this.formCertificadoSearch.get('certificado').setValue(null);
    this.formCertificadoSearch.get('numero').setValue(null);
    this.formCertificadoSearch.get('nombre').setValue(null);
    this.formCertificadoSearch.get('apellidop').setValue(null);
    this.formCertificadoSearch.get('apellidom').setValue(null);
    this.changeValueTipoDocumento('0');
    // this.formCertificadoSearch.reset();
    this.formDataCertificado.reset();
    this.initDataEndosos();
    this.formDataCertificado.disable();
    this.isSearchedData = false;
    this.isChangeForm = {
      anio: false,
      claseAuto: false,
      emailContratante: false,
      fechaEmision: false,
      finVigencia: false,
      horaEmision: false,
      iniVigencia: false,
      marcaAuto: false,
      placaAuto: false,
      serie: false,
      versionAuto: false,
    };
    this.f['numero'].setValidators(
      Validators.compose([
        Validators.pattern(/^[\d]*$/),
        Validators.minLength(this.limitDocumentNumber?.min || 8),
        Validators.maxLength(this.limitDocumentNumber?.max || 8),
      ])
    );
    this.f['numero'].updateValueAndValidity({
      emitEvent: false,
    });
  }
  showModalGuardarEndoso(): void {
    this.modalGuardar.show();
  }
  hideModalGuardarEndoso(): void {
    this.modalGuardar.hide();
  }
  guardarEndoso(): void {
    this.modalGuardar.show();
  }
  showMessageModal(message: string): void {
    this.mensajeModal = message;
    this.isShowModal = true;
  }
  changeMarcaAuto(val): void {
    this.version2(val);
    this.formDataCertificado.get('marcaAuto').setValue(val);
    this.formDataCertificado.get('versionAuto').setValue(0);
    this.formDataCertificado.get('claseAuto').setValue(0);
    this.infoMarca = val;
  }
  changeVersionAuto(val): void {
    this.clase2(val);
    this.formDataCertificado.get('versionAuto').setValue(val);
    this.formDataCertificado.get('claseAuto').setValue(0);
  }
  changeClaseAuto(val): void {
    this.formDataCertificado.get('claseAuto').setValue(val);
  }

  changeFechaInicio(val): void {
    this.formDataCertificado.get('iniVigencia').setValue(val);
    this.FECHAINICIO = moment(this.ff['iniVigencia'].value).format(
      'DD/MM/YYYY'
    );
  }

  tipoDoc() {
    const data: any = {
      S_TYPE: 'TYPEDOCUMENTS_CH',
      _: 1634705934482,
    };
    this._EndososGeneralService.estado(data).subscribe(
      (response: ITipoDocResponse) => {
        this.dataEstado = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  // MARCA

  marca() {
    const data: any = {
      _: 1634715815696,
    };
    this._EndososGeneralService.marca(data).subscribe(
      (response: IMarcaResponse) => {
        this.dataMarca = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoMarca(idTD) {
    return (
      this.dataMarca?.PA_SEL_MARK?.find(
        (x) => x.NVEHBRAND?.toString() === idTD?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // USO

  uso() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1634715941178,
    };
    this._EndososGeneralService.uso(data).subscribe(
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

  textoUso(idU) {
    return (
      this.dataUso?.PRO_USE?.find(
        (x) => x.NIDUSO?.toString() === idU?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // VERSION

  version() {
    this._spinner.show();
    const data: any = {
      P_NVEHBRAND: this.dataBuscada?.PA_SEL_ENDOSO?.NMARK,
      _: 1634715940727,
    };
    this._EndososGeneralService.version(data).subscribe(
      (response: IVersionResponse) => {
        this.dataVersion = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoVersion(idV) {
    return (
      this.dataVersion?.version?.find(
        (x) => x.SDESVEHMODEL?.toString() === idV?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // CLASE

  clase() {
    this._spinner.show();
    const data: any = {
      P_NVEHBRAND: this.dataBuscada?.PA_SEL_ENDOSO?.NMARK,
      P_SDESVEHMODEL:
        this.dataBuscada?.PA_SEL_ENDOSO?.DESVEHMODEL ||
        this.ff['versionAuto'].value,
      _: 1634730445808,
    };
    this._EndososGeneralService.clase(data).subscribe(
      (response: IClaseResponse) => {
        this.dataClase = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoclase(idTD) {
    return (
      this.dataVersion?.version?.find(
        (x) => x.SDESCRIPT?.toString() === idTD?.toString()
      )?.SDESVEHMODEL || ''
    );
  }

  // DEPARTAMENTO

  departamento() {
    const data: any = {
      P_USER: this.currentUser.id,
      _: 1634730423757,
    };
    this._EndososGeneralService.departamento(data).subscribe(
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

  textoDepartamento(idD) {
    return this.dataDepart?.find((x) => x.id?.toString() === idD?.toString())
      ?.descripcion;

    /*  this.dataDepart?.PRO_DEPARTMENT?.find(
        (x) => x.NPROVINCE?.toString() === idD?.toString()
      )?.SDESCRIPT || '' */
  }

  // PROVINCIA

  provincia() {
    const data: any = {
      P_NPROVINCE: this.dataBuscada?.PA_SEL_ENDOSO?.NPROVINCE, // 14
      P_NLOCAL: 0,
      P_SDESCRIPT: '',
      _: 1634738134789,
    };
    this._EndososGeneralService.provincia(data).subscribe(
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

  textoProvincia(idP) {
    return this.dataProv?.find(
      (x) => x.idProvincia?.toString() === idP?.toString()
    )?.provincia;
  }

  // DISTRITO

  distrito() {
    const data: any = {
      P_NLOCAL: this.dataBuscada?.PA_SEL_ENDOSO?.NLOCAL, // 1401
      P_NMUNICIPALITY: 0,
      P_SDESCRIPT: '',
      _: 1634738143973,
    };
    this._EndososGeneralService.distrito(data).subscribe(
      (response: IDistritoResponse) => {
        this.dataDistr = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoDistrito(idDi) {
    return this.dataDistr?.find(
      (x) => x.idDistrito?.toString() === idDi?.toString()
    )?.distrito;
  }

  cerrarModal() {
    this.modalError.hide();
  }

  // CONDICIONES
  version2(val) {
    this._spinner.show();
    this.infoVersion = val;
    this.dataClase.PRO_CLASS = [];
    const data: any = {
      P_NVEHBRAND: val,
      _: 1634715940727,
    };
    this._EndososGeneralService.version(data).subscribe(
      (response: IVersionResponse) => {
        this.dataVersion = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  clase2(val) {
    this._spinner.show();
    const data: any = {
      P_NVEHBRAND: this.infoMarca,
      P_SDESVEHMODEL: val,
      _: 1634730445808,
    };
    this._EndososGeneralService.clase(data).subscribe(
      (response: IClaseResponse) => {
        this.dataClase = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  hideModalResultado() {
    this.info = null;
    this.modalResultado.hide();
    this.clearDataSearch();
  }

  // VERSION INFO

  version3() {
    const data: any = {
      P_NVEHBRAND: this.info?.NMARK,
      _: 1634715940727,
    };
    this._EndososGeneralService.version(data).subscribe(
      (response: IVersionResponse) => {
        this.dataVersion = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoVersion3(idV) {
    return (
      this.dataVersion?.version?.find(
        (x) => x.SDESVEHMODEL?.toString() === idV?.toString()
      )?.SDESCRIPT || ''
    );
  }

  // CLASE

  clase3() {
    const data: any = {
      P_NVEHBRAND: this.info?.NMARK,
      P_SDESVEHMODEL: this.info?.DESVEHMODEL,
      _: 1634730445808,
    };
    this._EndososGeneralService.clase(data).subscribe(
      (response: IClaseResponse) => {
        this.dataClase = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  textoclase3(idTD) {
    return (
      this.dataVersion?.version?.find(
        (x) => x.SDESCRIPT?.toString() === idTD?.toString()
      )?.SDESVEHMODEL || ''
    );
  }

  comparacion() {
    const data: any = {
      P_NVEHBRAND: this.ff['marcaAuto'].value,
      P_DESVEHMODEL: this.ff['versionAuto'].value,
      P_NIDCLASE: this.ff['claseAuto'].value,
    };
    this._EndososGeneralService.comparacion(data).subscribe(
      (response: IComparacionResponse) => {
        this.dataComparacion = response;
        /* this.infoVersionCodigo =
          this.dataComparacion?.PRO_VERSIONEQUI?.P_NVEHMODEL;
        console.log(this.infoVersionCodigo); */
        this.validar();
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  showInformacionCertificado() {
    this.modalResultado.hide();
    this.marca();
    this.uso();
    this.version3();
    this.clase3();
    this.dataProv = this.dataDepart?.find(
      (x) => x.id?.toString() === this.info?.NPROVINCE?.toString()
    )?.provincias;
    this.dataDistr = this.dataProv?.find(
      (x) => x.idProvincia?.toString() === this.info?.NLOCAL?.toString()
    )?.distritos;
    this.dataEndosos = this.dataEndosos = {
      poliza: {
        nCertificado: this.info?.NPOLESP_COMP,
        comprobante: this.info?.SCOMPROBANTE,
        iniVigencia: moment(this.info?.DVIGINI).format('DD/MM/YYYY'),
        finVigencia: moment(this.info?.DVIGFIN).format('DD/MM/YYYY'),
        horaEmision: this.info?.HORA_EMISION,
        fechaEmision: moment(this.info?.FECHA_EMISION).format('DD/MM/YYYY'),
      },
      vehiculo: {
        placa: this.info?.SPLACA,
        marca: this.info?.NMARK,
        version: this.info?.DESVEHMODEL,
        clase: this.info?.NIDCLASE,
        uso: this.textoUso(this.info?.NIDUSO),
        nAsientos: this.info?.NSEATING,
        anio: this.info?.NYEAR,
        serie: this.info?.SSERIAL,
      },
      contratante: {
        apeMaterno: this.info?.SLASTNAME2,
        apePaterno: this.info?.SLASTNAME,
        departamento: this.textoDepartamento(this.info?.NPROVINCE),
        direccion: this.info?.SADDRESS,
        distrito: this.textoDistrito(this.info?.NMUNICIPALITY),
        email: this.info?.SE_MAIL,
        nDocumento: this.info?.SNUMDOC,
        nombres: this.info?.SNAME,
        provincia: this.textoProvincia(this.info?.NLOCAL),
        tipoDocumento: this.info?.SDOC_TYPE,
        razonSocial: this.info?.SCLIENTNAME,
        telefono: '',
      },
    };
    this._spinner.hide();
    this.ff['iniVigencia'].setValue(this.dataEndosos.poliza.iniVigencia);
    this.ff['finVigencia'].setValue(this.dataEndosos.poliza.finVigencia);
    this.ff['fechaEmision'].setValue(this.dataEndosos.poliza.fechaEmision);
    this.ff['horaEmision'].setValue(this.dataEndosos.poliza.horaEmision);

    this.ff['placaAuto'].setValue(this.dataEndosos.vehiculo.placa);
    this.ff['marcaAuto'].setValue(this.dataEndosos.vehiculo.marca);
    this.ff['versionAuto'].setValue(this.dataEndosos.vehiculo.version);
    this.ff['claseAuto'].setValue(this.dataEndosos.vehiculo.clase);
    this.ff['anio'].setValue(this.dataEndosos.vehiculo.anio);
    this.ff['serie'].setValue(this.dataEndosos.vehiculo.serie);

    this.ff['emailContratante'].setValue(this.dataEndosos.contratante.email);

    this.infoMarca = this.ff['marcaAuto'].value;
    this.FECHAINICIO = this.ff['iniVigencia'].value;
    const infoCopy = this.info;
    this.info['PA_SEL_ENDOSO'] = infoCopy;
  }

  validar() {
    this._spinner.show();
    const fechaEmision = new Date(this.ff['fechaEmision'].value);
    const data: any = {
      P_NVOUCHER: (
        this.dataBuscada?.PA_SEL_ENDOSO?.SCOMPROBANTE || this.info?.SCOMPROBANTE
      )
        .toString()
        .padStart(12, '0'),
      P_NPOLESP_COMP:
        this.dataBuscada?.PA_SEL_ENDOSO?.NPOLESP_COMP ||
        this.info?.NPOLESP_COMP,
      P_DVIGINI:
        moment(this.ff['iniVigencia'].value, 'DD/MM/YYYY').format(
          'DD/MM/YYYY'
        ) || moment(this.ff['iniVigencia'].value).format('DD/MM/YYYY'),
      P_DVIGFIN:
        moment(this.ff['finVigencia'].value, 'DD/MM/YYYY').format(
          'DD/MM/YYYY'
        ) || moment(this.ff['finVigencia'].value).format('DD/MM/YYYY'),
      P_DEFFECDATE:
        this.dataBuscada?.PA_SEL_ENDOSO?.DEFFECDATE || this.info?.DEFFECDATE,
      P_DEFFECDATE_:
        this.dataBuscada?.PA_SEL_ENDOSO?.DEFFECDATE_D ||
        this.info?.DEFFECDATE_D,
      HORA_EMISION: this.ff['horaEmision'].value || '', //
      P_FECHA_EMISION2:
        moment(this.ff['fechaEmision'].value, 'DD/MM/YYYY').format(
          'DD/MM/YYYY'
        ) || moment(this.ff['fechaEmision'].value).format('DD/MM/YYYY'),
      P_FECHA_EMISION:
        moment(
          this.ff['fechaEmision'].value,
          'DD/MM/YYYY' + ' ' + this.ff['horaEmision'].value
        ).format('DD/MM/YYYY') +
        ' ' +
        this.ff['horaEmision'].value,
      /*  ` ${fechaEmision.getHours()}:${fechaEmision.getMinutes()}` */
      P_HORA: this.ff['horaEmision'].value || '',
      P_SPLATE: this.ff['placaAuto'].value || '',
      P_NMARK: this.ff['marcaAuto'].value || '',
      P_NSEATING:
        this.dataBuscada?.PA_SEL_ENDOSO?.NSEATING || this.info?.NSEATING,
      P_NYEAR: this.ff['anio'].value,
      P_SSERIAL: this.ff['serie'].value,
      P_NCIRCU:
        this.dataBuscada?.PA_SEL_ENDOSO?.NAUTOZONE ||
        this.info?.NAUTOZONE ||
        '',
      P_NTIPPER: this.dataBuscada?.PA_SEL_ENDOSO?.NTIPPER || this.info?.NTIPPER,
      P_SNUMDOC: this.dataBuscada?.PA_SEL_ENDOSO?.SNUMDOC || this.info?.SNUMDOC, //////
      P_SLEGALNAME:
        this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENTNAME ||
        this.info?.SCLIENTNAME ||
        '',
      P_SFIRSTNAME:
        this.dataBuscada?.PA_SEL_ENDOSO?.SNAME || this.info?.SNAME || '', // **
      P_SNAME: this.dataBuscada?.PA_SEL_ENDOSO?.SNAME || this.info?.SNAME || '', // **
      P_SLASTNAME:
        this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME ||
        this.info?.SLASTNAME ||
        '',
      P_SLASTNAME2:
        this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME2 ||
        this.info?.SLASTNAME2 ||
        '',
      P_SE_MAIL_S: this.ff['emailContratante'].value || '',
      P_SSTREET:
        this.dataBuscada?.PA_SEL_ENDOSO?.SADDRESS || this.info?.SADDRESS, // ***
      P_SADDRESS:
        this.dataBuscada?.PA_SEL_ENDOSO?.SADDRESS || this.info?.SADDRESS, // ***
      P_NPROVINCE:
        this.dataBuscada?.PA_SEL_ENDOSO?.NPROVINCE || this.info?.NPROVINCE,
      P_NLOCAL: this.dataBuscada?.PA_SEL_ENDOSO?.NLOCAL || this.info?.NLOCAL,
      P_NMUNICIPALITY:
        this.dataBuscada?.PA_SEL_ENDOSO?.NMUNICIPALITY ||
        this.info?.NMUNICIPALITY,
      P_SCLIENT: this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENT || this.info?.SCLIENT,
      P_NREASON: this.ff['motivoEndoso'].value,
      P_NDIGIT_VERIF:
        this.dataBuscada?.PA_SEL_ENDOSO?.NDIGIT_VERIF ||
        this.info?.NDIGIT_VERIF,
      P_SOBSERVATION: this.ff['observacion'].value || '',
      P_NIDDOC_TYPE:
        this.dataBuscada?.PA_SEL_ENDOSO?.NIDDOC_TYPE || this.info?.NIDDOC_TYPE,
      P_SCLIENTNAME:
        this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENTNAME || this.info?.SCLIENTNAME,
      P_NUSERREGISTER: this.currentUser.id,
      P_NRESULTADO: 1,
      P_SNOMMARCA: this.textoMarca(this.ff['marcaAuto'].value),
      P_NMODEL: this.dataComparacion?.PRO_VERSIONEQUI?.P_NVEHMODEL,
      P_AUTORIZA:
        this.dataBuscada?.PA_SEL_ENDOSO?.V_AUTORIZA || this.info?.V_AUTORIZA,
      P_SCLASSTYPE: 1,
      P_SORIGEN: this.dataBuscada?.PA_SEL_ENDOSO?.SORIGEN || this.info?.SORIGEN,
      P_SREGIST_TMP:
        this.dataBuscada?.PA_SEL_ENDOSO?.SPLACA || this.info?.SPLACA,
      P_VALIDA: 'S',
      P_NCLASE: this.ff['claseAuto'].value || '',
      P_NUSO: this.dataBuscada?.PA_SEL_ENDOSO?.NIDUSO || this.info?.NIDUSO,
      P_TI: this.dataBuscada?.PA_SEL_ENDOSO?.TI_DIRE || this.info?.TI_DIRE,
      P_NPREMIUM:
        this.dataBuscada?.PA_SEL_ENDOSO?.NPREMIUM || this.info?.NPREMIUM,
    };
    this._EndososGeneralService.validar(data).subscribe(
      (response: IValidarResponse) => {
        this.dataValidar = response;
        if (this.dataValidar.PRO_VAL_CAMPOS.P_ES_ERROR !== 0) {
          this.modalValidar.show();
          this.MENSAJE2 =
            this.dataValidar.PRO_VAL_CAMPOS.P_ERROR_MSG?.replaceAll('<BR>', '');
        } else {
          this.guardarEndoso();
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  aceptar(): void {
    this._spinner.show();
    this.modalGuardar.hide();
    const formData: any = new FormData();
    formData.append(
      'P_NVOUCHER',
      (this.dataBuscada?.PA_SEL_ENDOSO?.SCOMPROBANTE || this.info?.SCOMPROBANTE)
        .toString()
        .padStart(12, '0')
    );
    formData.append(
      'P_NPOLESP_COMP',
      this.dataBuscada?.PA_SEL_ENDOSO?.NPOLESP_COMP || this.info?.NPOLESP_COMP
    );
    formData.append(
      'P_DVIGINI',
      moment(this.ff['iniVigencia'].value, 'DD/MM/YYYY').format('DD/MM/YYYY') ||
        moment(this.ff['iniVigencia'].value).format('DD/MM/YYYY')
    );
    formData.append(
      'P_DVIGFIN',
      moment(this.ff['finVigencia'].value, 'DD/MM/YYYY').format('DD/MM/YYYY') ||
        moment(this.ff['finVigencia'].value).format('DD/MM/YYYY')
    );
    formData.append(
      'P_DEFFECDATE',
      this.dataBuscada?.PA_SEL_ENDOSO?.DEFFECDATE || this.info?.DEFFECDATE
    );
    formData.append(
      'P_DEFFECDATE_',
      this.dataBuscada?.PA_SEL_ENDOSO?.DEFFECDATE_D || this.info?.DEFFECDATE_D
    );
    formData.append('HORA_EMISION', this.ff['horaEmision'].value);
    formData.append(
      'P_FECHA_EMISION2',
      moment(this.ff['fechaEmision'].value, 'DD/MM/YYYY').format(
        'DD/MM/YYYY'
      ) || moment(this.ff['fechaEmision'].value).format('DD/MM/YYYY')
    );
    formData.append(
      'P_FECHA_EMISION',
      moment(this.ff['fechaEmision'].value, 'DD/MM/YYYY').format(
        'DD/MM/YYYY'
      ) || moment(this.ff['fechaEmision'].value).format('DD/MM/YYYY')
    );
    formData.append('P_HORA', this.ff['horaEmision'].value);
    formData.append('P_SPLATE', this.ff['placaAuto'].value);
    formData.append('P_NMARK', this.ff['marcaAuto'].value);
    formData.append(
      'P_NSEATING',
      this.dataBuscada?.PA_SEL_ENDOSO?.NSEATING || this.info?.NSEATING
    );
    formData.append('P_NYEAR', this.ff['anio'].value);
    formData.append('P_SSERIAL', this.ff['serie'].value);
    formData.append(
      'P_NCIRCU',
      this.dataBuscada?.PA_SEL_ENDOSO?.NAUTOZONE || this.info?.NAUTOZONE || ''
    );
    formData.append(
      'P_NTIPPER',
      this.dataBuscada?.PA_SEL_ENDOSO?.NTIPPER || this.info?.NTIPPER
    );
    formData.append(
      'P_SNUMDOC',
      this.dataBuscada?.PA_SEL_ENDOSO?.SNUMDOC || this.info?.SNUMDOC
    );
    formData.append(
      'P_SLEGALNAME',
      this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENTNAME ||
        this.info?.SCLIENTNAME ||
        ''
    );
    formData.append(
      'P_SFIRSTNAME',
      this.dataBuscada?.PA_SEL_ENDOSO?.SNAME || this.info?.SNAME || ''
    );
    formData.append(
      'P_SNAME',
      this.dataBuscada?.PA_SEL_ENDOSO?.SNAME || this.info?.SNAME || ''
    );
    formData.append(
      'P_SLASTNAME',
      this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME || this.info?.SLASTNAME || ''
    );
    formData.append(
      'P_SLASTNAME2',
      this.dataBuscada?.PA_SEL_ENDOSO?.SLASTNAME2 || this.info?.SLASTNAME2 || ''
    );
    formData.append('P_SE_MAIL_S', this.ff['emailContratante'].value || '');
    formData.append(
      'P_SSTREET',
      this.dataBuscada?.PA_SEL_ENDOSO?.SADDRESS || this.info?.SADDRESS
    );
    formData.append(
      'P_SADDRESS',
      this.dataBuscada?.PA_SEL_ENDOSO?.SADDRESS || this.info?.SADDRESS
    );
    formData.append(
      'P_NPROVINCE',
      this.dataBuscada?.PA_SEL_ENDOSO?.NPROVINCE || this.info?.NPROVINCE
    );
    formData.append(
      'P_NLOCAL',
      this.dataBuscada?.PA_SEL_ENDOSO?.NLOCAL || this.info?.NLOCAL
    );
    formData.append(
      'P_NMUNICIPALITY',
      this.dataBuscada?.PA_SEL_ENDOSO?.NMUNICIPALITY || this.info?.NMUNICIPALITY
    );
    formData.append(
      'P_SCLIENT',
      this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENT || this.info?.SCLIENT
    );
    formData.append('P_NREASON', 1);
    formData.append(
      'P_NDIGIT_VERIF',
      this.dataBuscada?.PA_SEL_ENDOSO?.NDIGIT_VERIF ||
        this.info?.NDIGIT_VERIF ||
        0
    );
    formData.append('P_SOBSERVATION', this.ff['observacion'].value || '');
    formData.append(
      'P_NIDDOC_TYPE',
      this.dataBuscada?.PA_SEL_ENDOSO?.NIDDOC_TYPE || this.info?.NIDDOC_TYPE
    );
    formData.append(
      'P_SCLIENTNAME',
      this.dataBuscada?.PA_SEL_ENDOSO?.SCLIENTNAME || this.info?.SCLIENTNAME
    );
    formData.append('P_NUSERREGISTER', this.currentUser.id);
    formData.append(
      'P_NRESULTADO',
      1 || this.dataBuscada?.PA_SEL_ENDOSO?.ROWTOTAL || this.info?.ROWTOTAL
    ); // VERIRIFicar ****
    formData.append('P_SNOMMARCA', this.textoMarca(this.ff['marcaAuto'].value));
    formData.append(
      'P_NMODEL',
      this.dataComparacion?.PRO_VERSIONEQUI?.P_NVEHMODEL
    );
    formData.append('P_AUTORIZA', 'S');
    formData.append('P_SCLASSTYPE', 1);
    formData.append(
      'P_SORIGEN',
      this.dataBuscada?.PA_SEL_ENDOSO?.SORIGEN || this.info?.SORIGEN
    );
    formData.append(
      'P_SREGIST_TMP',
      this.dataBuscada?.PA_SEL_ENDOSO?.SPLACA || this.info?.SPLACA
    );
    formData.append('P_VALIDA', 'S');
    console.log(this.formDataCertificado.get('claseAuto').value);
    formData.append(
      'P_NCLASE',
      this.formDataCertificado.get('claseAuto').value ||
        this.dataBuscada?.PA_SEL_ENDOSO?.NIDCLASE ||
        this.info?.NIDCLASE
    );
    formData.append(
      'P_NUSO',
      this.dataBuscada?.PA_SEL_ENDOSO?.NIDUSO || this.info?.NIDUSO
    );
    formData.append(
      'P_TI',
      this.dataBuscada?.PA_SEL_ENDOSO?.TI_DIRE || this.info?.TI_DIRE
    );
    formData.append(
      'P_NPREMIUM',
      this.dataBuscada?.PA_SEL_ENDOSO?.NPREMIUM || this.info?.NPREMIUM
    );
    formData.append('P_IND_MOD_POLIZA', this.policyModified);
    formData.append('P_IND_MOD_AUTO', this.autoModified);
    formData.append('P_IND_MOD_DIRE', this.addressModified);
    formData.append('P_IND_MOD_APESEG', this.apesegModified);
    formData.append(
      'P_DEFFECDATE_D',
      this.dataBuscada?.PA_SEL_ENDOSO?.DEFFECDATE_D || this.info?.DEFFECDATE_D
    );
    formData.append('P_TIPOCERTIFICADO', 'D');
    this._EndososGeneralService.modificar(formData).subscribe(
      (response: IModificarResponse) => {
        this.dataModificar = response;
        this.modalGuardar.hide();
        if (this.dataModificar?.NStatus?.P_ES_ERROR === 0) {
          this.modalModificar.show();
          this.MENSAJEFINAL = 'Se realizó la modificación correctamente.';
          this.clearDataSearch();
        } else {
          this.modalModificar.show();
          this.MENSAJEFINAL = this.dataModificar?.NStatus?.P_ERROR_MSG;
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.modalModificarError.show();
        this.MENSAJEFINALERROR =
          'Ocurrió un problema al intentar guardar los datos ingresados';
        this._spinner.hide();
      }
    );
  }
  transformCertif(val: string) {
    return val.padStart(8, '0');
  }

  get policyModified(): string {
    if (
      this.ff['iniVigencia'].value == this.dataEndosos.poliza.iniVigencia &&
      this.ff['finVigencia'].value == this.dataEndosos.poliza.finVigencia &&
      this.ff['fechaEmision'].value == this.dataEndosos.poliza.fechaEmision &&
      this.ff['horaEmision'].value == this.dataEndosos.poliza.horaEmision
    ) {
      return 'N';
    } else {
      return 'S';
    }
  }
  get autoModified(): string {
    if (
      this.ff['placaAuto'].value == this.dataEndosos.vehiculo.placa &&
      this.ff['marcaAuto'].value == this.dataEndosos.vehiculo.marca &&
      this.ff['versionAuto'].value == this.dataEndosos.vehiculo.version &&
      this.ff['claseAuto'].value == this.dataEndosos.vehiculo.clase &&
      this.ff['anio'].value == this.dataEndosos.vehiculo.anio &&
      this.ff['serie'].value == this.dataEndosos.vehiculo.serie
    ) {
      return 'N';
    } else {
      return 'S';
    }
  }
  get addressModified(): string {
    if (
      this.ff['emailContratante'].value == this.dataEndosos.contratante.email
    ) {
      return 'N';
    } else {
      return 'S';
    }
  }
  get apesegModified(): string {
    if (
      this.ff['placaAuto'].value == this.dataEndosos.vehiculo.placa &&
      this.ff['claseAuto'].value == this.dataEndosos.vehiculo.clase &&
      this.policyModified == 'N'
    ) {
      return 'N';
    } else {
      return 'S';
    }
  }
}
