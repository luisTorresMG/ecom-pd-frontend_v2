import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import moment from 'moment';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CargaMasivaService } from '../../../../services/transaccion/carga-masiva/carga-masiva.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as ChannelPointDto from '../../../../services/transaccion/shared/DTOs/channel-point.dto';
import { ChannelPointService } from '../../../../services/transaccion/shared/channel-point.service';
import * as SDto from '../../../../services/transaccion/carga-masiva/DTOs/carga-masiva.dto';
import * as CDto from './DTOs/CargaMasiva.dto';
import { ParseDateService } from '../../../../services/transaccion/shared/parse-date.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { UbigeoService } from '../../../../../../shared/services/ubigeo/ubigeo.service';
import { ParametersResponse } from '../../../../../vidaindividual-latest/models/parameters.model';
import { ClientRequest } from '../../../../models/carga-masiva/client.model';
import { AppConfig } from '../../../../../../app.config';
import { IExportExcel } from '../../../../../../shared/interfaces/export-excel.interface';
import { UtilsService } from '../../../../../../shared/services/utils/utils.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { DocumentInfoResponseModel } from '../../../../../../shared/models/document-information/document-information.model';

@Component({
  standalone: false,
  selector: 'app-carga-masiva',
  templateUrl: './CargaMasiva.component.html',
  styleUrls: ['./CargaMasiva.component.css'],
  animations: [
    trigger('modal', [
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(-100px)',
        }),
        animate(
          250,
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class CargaMasivaComponent implements OnInit, OnDestroy {
  formCargaMasivaSearch: FormGroup;
  formAddCarga: FormGroup;
  formGenerarFactura: FormGroup;

  rucValidity: RegExp;
  documentNumberIsValid: boolean;

  formCliente: FormGroup;
  disabledFormClienteSubmit: boolean;
  modalCliente: boolean;
  /*
    1: CREAR CLIENTE CARGA MASIVA
  */
  typeModalConfirmacion: number;
  modalConfirmacionDesc: string | null;
  modalConfirmacionTitle: string | null;
  modalConfirmacion: boolean;

  modalSuccessDesc: string | null;
  modalSuccessIsTrue: boolean;
  modalSuccess: boolean;

  documentLimit: { min: number; max: number };
  parameters$: ParametersResponse;
  nationalities: any;
  departments: any;
  provinces: any;
  districts: any;

  currentPage = 1;
  siteKey = AppConfig.CAPTCHA_KEY;

  constructor(
    private readonly _Router: Router,
    private readonly _CargaMasivaService: CargaMasivaService,
    private readonly spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _ChannelPointService: ChannelPointService,
    private readonly _ParseDateService: ParseDateService,
    private readonly _ubigeoService: UbigeoService,
    private readonly utilsService: UtilsService
  ) {
    this.documentLimit = {
      min: 11,
      max: 11,
    };
    this.CANAL_VENTA_ADD_CARGA = [];
    this.PUNTO_VENTA_ADD_CARGA = {
      PRO_SALE_POINT: [
        {
          NNUMPOINT: 0,
          SDESCRIPT: '',
        },
      ],
    };
    this.initFormAddCarga();
    this.formCargaMasivaSearch = this._FormBuilder.group({
      canal: [0],
      puntoVenta: [0],
      fechaInicio: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
      estado: [0],
      idProceso: [null],
    });
    this.formGenerarFactura = this._FormBuilder.group({
      idFactura: [null, Validators.required],
      typeFactura: [false, Validators.required],
    });
    this.formCliente = this._FormBuilder.group({
      documentType: [null, Validators.required],
      documentNumber: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.documentLimit.min),
          Validators.maxLength(this.documentLimit.max),
        ]),
      ],
      apellidoPaterno: [null],
      apellidoMaterno: [null],
      nombres: [null],
      razonSocial: [
        null,
        Validators.compose([Validators.required, Validators.minLength(3)]),
      ],
      nacionalidad: [null, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      direccion: [null, Validators.required],
      email: [
        null,
        Validators.compose([
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
          Validators.required,
        ]),
      ],
      fechaNacimiento: [null],
      sexo: [null],
      celular: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      clientState: [false, Validators.required],
    });
    this.titleModal = 'Mensaje';
    this.modalCliente = false;
    this.disabledFormClienteSubmit = false;

    this.modalConfirmacion = false;
    this.modalConfirmacionDesc = null;
    this.modalConfirmacionTitle = null;
    this.typeModalConfirmacion = 0;

    this.modalSuccessIsTrue = false;
    this.modalSuccess = false;
    this.modalSuccessDesc = null;
    this.rucValidity = /^(10|15|20)(\d{9})$/;
    this.documentNumberIsValid = false;
  }
  precioSelectCargaMasiva = 0;
  countFacturasSelectCargaMasiva = 0;

  bsConfig: Partial<BsDatepickerConfig>;
  bsConfigCliente: Partial<BsDatepickerConfig>;

  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalUploadFile', { static: true })
  modalUploadFile: ModalDirective;
  @ViewChild('modalHistorialCarga', { static: true })
  modalHistorialCarga: ModalDirective;
  @ViewChild('modalMessage', { static: true }) modalMessage: ModalDirective;
  @ViewChild('skeletonLoading', { static: true }) skeletonLoading: ElementRef;
  @ViewChild('modalSuccessFacturacion', { static: true })
  modalSuccessFacturacion: ModalDirective;
  @ViewChild('modalError', { static: true }) modalError: ModalDirective;
  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;
  @ViewChild('formClienteError', { static: false, read: ElementRef })
  formClienteError: ElementRef;
  NAME_FILE = 'Selecciona un archivo Excel';
  ARCHIVO_CARGA_MASIVA: File = null;
  IS_PAGE_VER_DETALLE = 1;
  CANAL_VENTA_ID: number;
  PUNTO_VENTA_ID: number;
  CANAL_VENTA_ADD_CARGA: ChannelPointDto.CanalVentaDto[] = [];
  PUNTO_VENTA_ADD_CARGA: ChannelPointDto.PuntoVentaDto;
  ID_CARGA_MASIVA: number;
  DATA_CARGA_MASIVA: SDto.SearchCargaMasivaDto = {
    success: false,
    cargaMasivaDetail: [
      {
        canal: null,
        cantidadRegistro: null,
        cantidadContratantes: null,
        estado: null,
        factura: null,
        fechaProceso: null,
        idProceso: null,
        primaTotal: null,
        puntoVenta: null,
        usuario: null,
      },
    ],
  };
  DATA_HISTORIAL_CARGA_MASIVA: SDto.SearchCargaMasivaHisDto = {
    success: false,
    cargaMasivaDetail: [
      {
        fechaRegistro: null,
        idEstado: null,
        usuario: null,
      },
    ],
  };
  titleModal: string;
  messageModal: string;
  titleModalError: string;
  messageModalError: string;
  NCONTRATANTES = 0;
  NSKELETON = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  IS_CLICK_DESCARGAR_CONSTANCIAS = false;
  ngOnInit(): void {
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
    const limitDate = new Date(
      new Date().setFullYear(Number(new Date().getFullYear()) - 18)
    );
    this.bsConfigCliente = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: limitDate,
      }
    );
    this.buscarCargaMasiva();
    this.parameters();
  }
  ngOnDestroy(): void {
    const html = document.getElementById('html-document');
    if (html) {
      html.style.overflow = 'auto';
    }
  }
  initForm(): void {
    this.fc['documentType'].valueChanges.subscribe((val: any) => {
      this.resetFormCliente();
      switch (Number(val)) {
        case 1:
          this.fc['razonSocial'].setValue(null);
          this.fc['razonSocial'].setValidators(
            Validators.compose([Validators.required, Validators.minLength(3)])
          );
          this.fc['razonSocial'].updateValueAndValidity();

          this.fc['apellidoPaterno'].setValue(null);
          this.fc['apellidoPaterno'].clearValidators();
          this.fc['apellidoPaterno'].updateValueAndValidity();

          this.fc['apellidoMaterno'].setValue(null);
          this.fc['apellidoMaterno'].clearValidators();
          this.fc['apellidoMaterno'].updateValueAndValidity();

          this.fc['nombres'].setValue(null);
          this.fc['nombres'].clearValidators();
          this.fc['nombres'].updateValueAndValidity();

          this.fc['fechaNacimiento'].setValue(null);
          this.fc['fechaNacimiento'].clearValidators();
          this.fc['fechaNacimiento'].updateValueAndValidity();

          this.fc['sexo'].setValue(null);
          this.fc['sexo'].clearValidators();
          this.fc['sexo'].updateValueAndValidity();

          this.documentLimit = {
            min: 11,
            max: 11,
          };
          break;
        case 2:
        case 4:
          this.fc['razonSocial'].setValue(null);
          this.fc['razonSocial'].clearValidators();
          this.fc['razonSocial'].updateValueAndValidity();

          this.fc['apellidoPaterno'].setValue(null);
          this.fc['apellidoPaterno'].setValidators(Validators.required);
          this.fc['apellidoPaterno'].updateValueAndValidity();

          this.fc['apellidoMaterno'].setValue(null);
          this.fc['apellidoMaterno'].setValidators(Validators.required);
          this.fc['apellidoMaterno'].updateValueAndValidity();

          this.fc['nombres'].setValue(null);
          this.fc['nombres'].setValidators(Validators.required);
          this.fc['nombres'].updateValueAndValidity();

          this.fc['fechaNacimiento'].setValue(null);
          this.fc['fechaNacimiento'].setValidators(Validators.required);
          this.fc['fechaNacimiento'].updateValueAndValidity();

          this.fc['sexo'].setValue(null);
          this.fc['sexo'].setValidators(Validators.required);
          this.fc['sexo'].updateValueAndValidity();
          break;
      }
      this.setUbigeo();
      this.fc['documentNumber'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.minLength(this.documentLimit.min),
          Validators.maxLength(this.documentLimit.max),
          Validators.pattern(/^[0-9]*$/),
        ])
      );
      this.fc['documentNumber'].updateValueAndValidity();
    });
    this.fc['departamento'].valueChanges.subscribe((val: any) => {
      // this.provinces = [];
      // this.fc['provincia'].setValue(null);
      if (val !== null && val !== '0') {
        this.provinces = this.departments?.find(
          (x) => Number(x.id) === Number(val)
        )?.provincias;
      }
    });
    this.fc['provincia'].valueChanges.subscribe((val: any) => {
      // this.districts = [];
      // this.fc['distrito'].setValue(null);
      if (val !== null && val !== 0) {
        this.districts = this.provinces?.find(
          (x) => Number(x.idProvincia) === Number(val)
        )?.distritos;
      }
    });
    this.fc['documentNumber'].valueChanges.subscribe((val: any) => {
      if (this.fc['documentNumber'].hasError('pattern')) {
        const newVal = val
          ?.toString()
          .substring(0, val?.toString()?.length - 1);
        this.fc['documentNumber'].setValue(newVal);
      }
      if (!this.clienteEmpresa) {
        this.fc['razonSocial'].clearValidators();
        this.fc['razonSocial'].updateValueAndValidity();

        this.fc['nombres'].setValidators(Validators.required);
        this.fc['nombres'].updateValueAndValidity();

        this.fc['apellidoPaterno'].setValidators(Validators.required);
        this.fc['apellidoPaterno'].updateValueAndValidity();

        this.fc['apellidoMaterno'].setValidators(Validators.required);
        this.fc['apellidoMaterno'].updateValueAndValidity();

        this.fc['fechaNacimiento'].setValidators(Validators.required);
        this.fc['fechaNacimiento'].updateValueAndValidity();

        this.fc['sexo'].setValidators(Validators.required);
        this.fc['sexo'].updateValueAndValidity();
      } else {
        this.fc['razonSocial'].setValidators(Validators.required);
        this.fc['razonSocial'].updateValueAndValidity();

        this.fc['nombres'].clearValidators();
        this.fc['nombres'].updateValueAndValidity();

        this.fc['apellidoPaterno'].clearValidators();
        this.fc['apellidoPaterno'].updateValueAndValidity();

        this.fc['apellidoMaterno'].clearValidators();
        this.fc['apellidoMaterno'].updateValueAndValidity();

        this.fc['fechaNacimiento'].clearValidators();
        this.fc['fechaNacimiento'].updateValueAndValidity();

        this.fc['sexo'].clearValidators();
        this.fc['sexo'].updateValueAndValidity();
      }
    });
    this.fc['celular'].valueChanges.subscribe((val: any) => {
      const newVal = val?.toString().substring(0, val?.toString()?.length - 1);
      if (this.fc['celular'].hasError('pattern')) {
        this.fc['celular'].setValue(newVal);
      }
      if (val) {
        if (Number(val.toString().substring(0, 1)) !== 9) {
          this.fc['celular'].setValue(newVal);
        }
      }
    });
  }
  resetFormCliente(): void {
    this.fc['documentNumber'].setValue(null);
    this.fc['apellidoPaterno'].setValue(null);
    this.fc['apellidoMaterno'].setValue(null);
    this.fc['nombres'].setValue(null);
    this.fc['razonSocial'].setValue(null);
    this.fc['nacionalidad'].setValue(null);
    this.fc['departamento'].setValue(null);
    this.fc['provincia'].setValue(null);
    this.fc['distrito'].setValue(null);
    this.fc['direccion'].setValue(null);
    this.fc['email'].setValue(null);
    this.fc['fechaNacimiento'].setValue(null);
    this.fc['sexo'].setValue(null);
    this.fc['celular'].setValue(null);
    this.fc['clientState'].setValue(null);
  }
  get fc(): any {
    return this.formCliente.controls;
  }
  get clienteEmpresa(): boolean {
    if (this.fc['documentNumber'].valid) {
      const matchRucPersona = this.fc['documentNumber'].value
        ?.toString()
        .match(/^(10|15)(\d{9})$/);
      if (matchRucPersona !== null) {
        return false;
      }
    }
    return true;
  }
  get clientePersona(): boolean {
    return Number(this.fc['documentType'].value) !== 1;
  }
  validityFormCliente(control: any, type: number): string {
    if (control.touched) {
      switch (type) {
        case 3:
          if (control.hasError('required')) {
            return 'La razón social es obligatoria';
          }
          if (control.hasError('minlength')) {
            return 'Este campo debe tener mínimo 3 caracteres';
          }
          break;
      }
    }
    this.documentNumberIsValid = true;
    return null;
  }
  get hasErrorNumberDocument(): string {
    const control = this.fc['documentNumber'];
    if (control.touched) {
      if (!control.hasError('minlength')) {
        if (control.value?.toString().match(this.rucValidity) === null) {
          this.documentNumberIsValid = false;
          return 'El número de documento no es válido';
        }
      }
      if (control.hasError('required')) {
        return 'El número de documento es obligatorio';
      }
    }
    return null;
  }
  get hasErrorNacionalidad(): string {
    const control = this.fc['nacionalidad'];
    if (control.touched && control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    return null;
  }
  get hasErrorRazonSocial(): string {
    const control = this.fc['razonSocial'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
      if (control.hasError('minlength')) {
        return 'Este campo debe tener mínimo 3 caracteres';
      }
    }
    return null;
  }
  get hasErrorNombres(): string {
    const control = this.fc['nombres'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorApellidoPaterno(): string {
    const control = this.fc['apellidoPaterno'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorProvincia(): string {
    const control = this.fc['provincia'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorDistrito(): string {
    const control = this.fc['distrito'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorCelular(): string {
    const control = this.fc['celular'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorSexo(): string {
    const control = this.fc['sexo'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorFechaNacimiento(): string {
    const control = this.fc['fechaNacimiento'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorDireccion(): string {
    const control = this.fc['direccion'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorEmail(): string {
    const control = this.fc['email'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
      if (control.hasError('pattern')) {
        return 'El correo electrónico no es válido';
      }
    }
    return null;
  }
  get hasErrorApellidoMaterno(): string {
    const control = this.fc['apellidoMaterno'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  get hasErrorDepartamento(): string {
    const control = this.fc['departamento'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  submitFormCliente(): void {
    if (this.formCliente.valid) {
      this.typeModalConfirmacion = 1;
      this.modalConfirmacionTitle = 'Confirmación';
      this.modalConfirmacionDesc = '¿Estás seguro que desea crear el cliente?';
      this.openCloseModalConfirmacion();
    } else {
      this.formCliente.markAsTouched();
    }
  }
  modalConfirmTypeSubmit(): void {
    switch (this.typeModalConfirmacion) {
      case 1:
        this.openAndCloseModalCliente();
        this.confirmFormCliente();
        break;
    }
  }
  openCloseModalConfirmacion(): void {
    this.modalConfirmacion = !this.modalConfirmacion;
  }
  private confirmFormCliente(): void {
    const data: ClientRequest = new ClientRequest({
      ...this.formCliente.getRawValue(),
      idUsuario: JSON.parse(localStorage.getItem('currentUser')).id || null,
    });
    this._CargaMasivaService.createCliente(data).subscribe(
      (res: any) => {
        this.openCloseModalConfirmacion();
        if (res.success) {
          this.modalSuccessIsTrue = true;
          this.modalSuccessDesc = 'El contratante fué creado correctamente.';
        } else {
          this.modalSuccessIsTrue = false;
          this.modalSuccessDesc = 'Ocurrió un error al crear el contratante';
          if (res.mensaje.indexOf('ORA-20001') !== -1) {
            this.modalSuccessDesc =
              'No pueden presentarse más de cuatro vocales y/o consonantes juntas en la dirección';
          }
          if (res.mensaje.indexOf('ORA-20002') !== -1) {
            this.modalSuccessDesc =
              'La dirección no debe contener caracteres no permitidos';
          }
        }
        this.modalSuccess = true;
      },
      (err: any) => {
        console.log(err);
        this.modalSuccessIsTrue = false;
        this.modalSuccessDesc = 'Ocurrió un error al crear el contratante';
      }
    );
  }
  setUbigeo(): void {
    if (Number(this.fc['documentType'].value) === 1) {
      this.fc['nacionalidad'].setValue('1');
      this.fc['nacionalidad'].disable();
      this.fc['departamento'].setValue(null);
      this.fc['provincia'].setValue(null);
      this.fc['distrito'].setValue(null);
      this.fc['departamento'].enable();
      this.fc['provincia'].enable();
      this.fc['distrito'].enable();
    }
    if (Number(this.fc['documentType'].value) === 2) {
      this.documentLimit = {
        min: 8,
        max: 8,
      };
      this.fc['nacionalidad'].setValue('1');
      this.fc['nacionalidad'].disable();
      this.fc['departamento'].setValue(null);
      this.fc['provincia'].setValue(null);
      this.fc['distrito'].setValue(null);
      this.fc['departamento'].enable();
      this.fc['provincia'].enable();
      this.fc['distrito'].enable();
    }
    if (Number(this.fc['documentType'].value) === 4) {
      this.documentLimit = {
        min: 9,
        max: 12,
      };
      this.fc['nacionalidad'].setValue(null);
      this.fc['nacionalidad'].enable();
      this.fc['departamento'].setValue('14');
      this.fc['provincia'].setValue(1401);
      this.fc['distrito'].setValue(140101);
      this.fc['departamento'].disable();
      this.fc['provincia'].disable();
      this.fc['distrito'].disable();
    }
  }
  getDataOfDocument(token: string): void {
    if (this.fc['documentNumber'].valid) {
      this.disabledFormClienteSubmit = false;
      this.formClienteError.nativeElement.textContent = '';
      this.spinner.show();
      const data: any = {
        idRamo: 100,
        idProducto: 1,
        idTipoDocumento: this.fc['documentType'].value,
        numeroDocumento: this.fc['documentNumber'].value,
        idUsuario: JSON.parse(localStorage.getItem('currentUser')).id,
        token: token,
      };
      this.utilsService.documentInfoClientResponse(data).subscribe(
        (res: DocumentInfoResponseModel) => {
          this.fc['razonSocial'].setValue(res.legalName);
          this.fc['apellidoPaterno'].setValue(res.apePat);
          this.fc['apellidoMaterno'].setValue(res.apeMat);
          this.fc['nombres'].setValue(res.names);
          this.fc['direccion'].setValue(res.address);
          this.fc['email'].setValue(res.email);
          this.fc['celular'].setValue(res.phoneNumber);
          this.fc['clientState'].setValue(res.clienteEstado);
          this.fc['sexo'].setValue(res.sex);
          this.setUbigeo();
          if (
            Number(this.fc['documentType'].value) === 1 ||
            Number(this.fc['documentType'].value) === 2
          ) {
            this.fc['nacionalidad'].setValue(
              res.nationality !== null ? res.nationality : '1'
            );
            this.fc['departamento'].setValue(
              res.department !== null ? res.department.toString() : null
            );
            this.fc['provincia'].setValue(
              Number(res.province) !== 0 ? Number(res.province) : null
            );
            this.fc['distrito'].setValue(
              Number(res.district) !== 0
                ? Number(res.district)
                : null
            );
          }
          if (Number(this.fc['documentType'].value) === 4) {
            this.fc['nacionalidad'].setValue(
              res.nationality !== null ? res.nationality : null
            );
            this.fc['departamento'].setValue(
              res.department !== null ? res.department.toString() : '14'
            );
            this.fc['provincia'].setValue(
              Number(res.province) !== 0 ? Number(res.province) : 1401
            );
            this.fc['distrito'].setValue(
              Number(res.district) !== 0
                ? Number(res.district)
                : 140101
            );
          }
          if (res.clientCode !== null) {
            this.formClienteError.nativeElement.textContent =
              'El contratante consultado ya se encuentra registrado';
            this.disabledFormClienteSubmit = true;
          } else {
            this.disabledFormClienteSubmit = false;
          }
          this.spinner.hide();
        },
        (err: any) => {
          console.error(err);
          this.spinner.hide();
        }
      );
    }
  }
  parameters(): void {
    this._ubigeoService.getParameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = res;
        this.nationalities = res.nacionalidades;
        this.departments = res.ubigeos;
        this.initForm();
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  openAndCloseModalSuccess(): void {
    this.modalSuccess = !this.modalSuccess;
    if (!this.modalSuccessIsTrue) {
      this.modalCliente = true;
    } else {
      this.formCliente.reset();
    }
  }
  openAndCloseModalCliente(): void {
    this.disabledFormClienteSubmit = false;
    this.modalCliente = !this.modalCliente;
    const html = document.getElementById('html-document');
    if (this.modalCliente) {
      if (html) {
        html.style.overflow = 'hidden';
      }
      this.fc['documentType'].setValue(1);
    } else {
      if (html) {
        html.style.overflow = 'auto';
      }
      this.formCliente.markAsUntouched();
    }
  }
  openAndCloseModalConfirm(): void {
    this.modalConfirmacion = !this.modalConfirmacion;
  }
  initFormAddCarga(): void {
    this.ARCHIVO_CARGA_MASIVA = null;
    this.NAME_FILE = 'Selecciona un archivo Excel';
    this.PUNTO_VENTA_ADD_CARGA = {
      PRO_SALE_POINT: [
        {
          NNUMPOINT: 0,
          SDESCRIPT: '',
        },
      ],
    };
    this.formAddCarga = this._FormBuilder.group({
      canalVenta: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      puntoVenta: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      file: [null, Validators.required],
    });
  }
  showModalUploadCargaMasiva(): void {
    this.CanalVentaDataAddCarga();
    this.modalUploadFile.show();
  }
  hideModalUploadCargaMasiva(): void {
    this.modalUploadFile.hide();
    this.initFormAddCarga();
  }
  uploadFile(e) {
    if (e.target.files.length !== 0) {
      const ext = e.target.files[0].name.substring(
        e.target.files[0].name.indexOf('.'),
        e.target.files[0].name.length
      );
      if (ext === '.xls' || ext === '.xlsx') {
        this.NAME_FILE = e.target.files[0].name;
        this.ARCHIVO_CARGA_MASIVA = e.target.files[0];
      } else {
        this.NAME_FILE = 'El archivo no es válido';
      }
    }
  }
  hideModalHistorialCarga(): void {
    this.modalHistorialCarga.hide();
  }
  validarArchivoCargaMasiva(): void {
    const canal = this.formAddCarga.get('canalVenta').value;
    const punto = this.formAddCarga.get('puntoVenta').value;
    if (canal !== 0 && punto !== 0 && this.ARCHIVO_CARGA_MASIVA !== null) {
      this.spinner.show();
      const data: CDto.AddCargaMasiva = {
        canalVenta: canal,
        puntoVenta: punto,
        file: this.ARCHIVO_CARGA_MASIVA,
        tdr: null,
        contratante: null,
      };
      this._CargaMasivaService.generarCargaMasiva(data).subscribe(
        (res: SDto.DataCargaMasiva) => {
          this._CargaMasivaService.setDataCargaMasiva(res);
          this._Router.navigate(['backoffice/transaccion/CargaMasivaAdd']);
          this.spinner.hide();
        },
        (err: any) => {
          console.log(err);
          this.initFormAddCarga();
          this.hideModalUploadCargaMasiva();
          this.spinner.hide();
          this.titleModalError = 'Error al adjuntar archivo';
          this.messageModalError =
            'Ocurrió un problema al adjuntar archivo, puede que no tenga el formato correcto.';
          this.modalError.show();
        }
      );
    }
  }
  GoUploadFileViewDetail(id): void {
    this._Router.navigate(['/backoffice/transaccion/CargaMasivaAdd'], {
      queryParams: {
        IdCargaMasiva: id,
      },
    });
  }
  showModal(id, nContratantes: string): void {
    this.hideAllMenusActions();
    this.NCONTRATANTES = Number.parseInt(nContratantes);
    this.formGenerarFactura.get('idFactura').setValue(id);
    if (this.NCONTRATANTES > 1) {
      this.formGenerarFactura.get('typeFactura').setValue(true);
    } else {
      this.formGenerarFactura.get('typeFactura').setValue(false);
    }
    this.modal.show();
  }
  generarFactura(): void {
    this.modal.hide();
    this.spinner.show();
    const data = {
      id: this.formGenerarFactura.get('idFactura').value,
      facturacionIndividual: this.formGenerarFactura.get('typeFactura').value,
    };
    this._CargaMasivaService.facturarCarga(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.buscarCargaMasiva();
        if (res.success === true) {
          this.showModalSuccessFacturacion();
        } else {
          this.titleModalError = 'Mensaje';
          this.messageModalError = res.mensaje;
          this.modalError.show();
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }
  descargarFactura(id: number): void {
    this.hideAllMenusActions();
    this.spinner.show();
    this._CargaMasivaService.descargarFactura(id).subscribe(
      (res: any) => {
        this.spinner.hide();
        const archivo = {
          file: res.archivo,
          id: id,
          nombre: res.nombre,
        };
        if (res.success === true) {
          this.downloadArchivo(archivo);
        } else {
          // tslint:disable-next-line:max-line-length
          this.showModalMessage(
            'Su comprobante se encuentra en proceso de validación, por favor intente nuevamente en unos minutos.',
            'Validación'
          );
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }
  descargarExcel(id: number): void {
    this.hideAllMenusActions();
    this.spinner.show();
    this._CargaMasivaService.descargarExcel(id).subscribe(
      (res: any) => {
        this.spinner.hide();
        const archivo = {
          file: res.archivo,
          id: id,
          nombre: res.nombre,
        };
        if (res.success === true) {
          this.downloadArchivo(archivo);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }
  closeModal(): void {
    this.precioSelectCargaMasiva = 0;
    this.countFacturasSelectCargaMasiva = 0;
    this.formGenerarFactura.reset();
    this.modal.hide();
  }
  changePage(isPage): void {
    this.IS_PAGE_VER_DETALLE = isPage;
  }
  CanalVentaData(e): void {
    this.CANAL_VENTA_ID = e;
    this.formCargaMasivaSearch.get('canal').setValue(e);
    this.formCargaMasivaSearch.get('puntoVenta').setValue(0);
  }
  PuntoVentaData(e): void {
    this.PUNTO_VENTA_ID = e;
    this.formCargaMasivaSearch.get('puntoVenta').setValue(e);
  }
  CanalVentaDataAddCarga(): void {
    const dataUser = {
      nusercode: Number.parseInt(
        JSON.parse(localStorage.getItem('currentUser')).id
      ),
      nchannel: 0,
      scliename: '',
    };
    this._ChannelPointService.canalVentaData(dataUser).subscribe(
      (res: ChannelPointDto.CanalVentaDto[]) => {
        this.CANAL_VENTA_ADD_CARGA = res;
        if (res.length === 1) {
          this.formAddCarga.get('canalVenta').setValue(res[0].nchannel);
          this.PuntoVentaDataAddCarga(res[0]);
        }
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  PuntoVentaDataAddCarga(e): void {
    this.formAddCarga.get('puntoVenta').setValue(0);
    if (e) {
      this._ChannelPointService.puntoVentaData(e.nchannel).subscribe(
        (res: ChannelPointDto.PuntoVentaDto) => {
          this.PUNTO_VENTA_ADD_CARGA = res;
          if (res.PRO_SALE_POINT.length === 1) {
            this.formAddCarga
              .get('puntoVenta')
              .setValue(res.PRO_SALE_POINT[0].NNUMPOINT);
          }
        },
        (err: any) => {
          console.log(err);
        }
      );
    }
  }
  buscarCargaMasiva(): void {
    this.spinner.show();
    this.DATA_CARGA_MASIVA = {
      success: false,
      cargaMasivaDetail: [
        {
          canal: null,
          cantidadRegistro: null,
          cantidadContratantes: null,
          estado: null,
          factura: null,
          fechaProceso: null,
          idProceso: null,
          primaTotal: null,
          puntoVenta: null,
          usuario: null,
        },
      ],
    };
    this.currentPage = 1;
    const data: CDto.SearchCargaMasivaDto = {
      canal: this.formCargaMasivaSearch.get('canal').value,
      fechaFin: this._ParseDateService.parseDate(
        this.formCargaMasivaSearch.get('fechaFin').value.toString()
      ),
      fechaInicio: this._ParseDateService.parseDate(
        this.formCargaMasivaSearch.get('fechaInicio').value.toString()
      ),
      puntoVenta: this.formCargaMasivaSearch.get('puntoVenta').value,
      idEstado: this.formCargaMasivaSearch.get('estado').value,
      idProceso: this.formCargaMasivaSearch.get('idProceso').value,
      idUsuario: 0,
    };
    if (data.idProceso == null) {
      data.idProceso = 0;
    }
    this.skeletonLoading.nativeElement.hidden = false;
    this._CargaMasivaService.searchCargaMasiva(data).subscribe(
      (res: SDto.SearchCargaMasivaDto) => {
        res.cargaMasivaDetail = res.cargaMasivaDetail.map((value) => ({
          ...value,
          primaTotal: +value.primaTotal.toString().replace(',', '.'),
        }));
        this.DATA_CARGA_MASIVA = res;
        this.skeletonLoading.nativeElement.hidden = true;
        this.spinner.hide();
      },
      (err: any) => {
        this.skeletonLoading.nativeElement.hidden = true;
        console.log(err);
        this.spinner.hide();
      }
    );
  }
  historialCargaMasiva(id: number): void {
    this.hideAllMenusActions();
    const data: CDto.SerchCargaMasivaHisDto = {
      idPoliza: id,
    };
    this.spinner.show();
    this._CargaMasivaService.searchHistory(data).subscribe(
      (res: SDto.SearchCargaMasivaHisDto) => {
        this.ID_CARGA_MASIVA = id;
        this.DATA_HISTORIAL_CARGA_MASIVA = res;
        this.spinner.hide();
        this.modalHistorialCarga.show();
      },
      (err: any) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }
  showModalMessage(msj: string, title: string): void {
    this.messageModal = msj;
    this.modalMessage.show();
    this.titleModal = title;
  }
  hideModalMessage(): void {
    this.modalMessage.hide();
  }
  downloadArchivo(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.nombre);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.spinner.hide();
    }
  }
  /* Exporting a function called exportarExcel. */
  exportarExcel(): void {
    const payload: IExportExcel = {
      fileName: 'Carga_Masiva',
      data: this.DATA_CARGA_MASIVA.cargaMasivaDetail.map((value: any) => ({
        'CANAL DE VENTA ': value.canal,
        'FECHA DE CARGA ': moment(value.fechaProceso, 'DD/MM/YYYY').toDate(),
        'CANTIDAD DE REGISTROS ': +value.cantidadRegistro,
        'PRIMA TOTAL ': +value.primaTotal,
        'USUARIO ': value.usuario,
        'ESTADO ': value.estado,
      })),
    };
    this.utilsService.exportExcel(payload);
  }

  showModalSuccessFacturacion(): void {
    this.modalSuccessFacturacion.show();
  }
  hideModalSuccessFacturacion(): void {
    this.modalSuccessFacturacion.hide();
  }
  descargarFormatoExcelCargaMasiva(): void {
    this.spinner.show();
    this._CargaMasivaService.descargarFormatoExcelCargaMasiva().subscribe(
      (res: any) => {
        this.spinner.hide();
        const data = {
          file: res.archivo,
          nombre: res.nombre,
        };
        if (res.success === true) {
          this.downloadArchivo(data);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }
  showActionsCargaMasiva(id: any, index: any): void {
    const table = document.getElementById('table-scroll');
    const html = document.getElementById('actions' + id);
    if (html?.hidden === true) {
      this.hideAllMenusActions();
      html.hidden = false;
      html.style.top = '0';
      document.getElementById('row' + id).style.background =
        'rgba(170, 158, 192, 0.25)';
      if (table.scrollHeight - table.clientHeight > 0 && index >= 5) {
        html.style.top = '-127px';
      } else {
        html.style.top = '0';
      }
    } else {
      html.hidden = true;
      html.style.top = '0';
      document.getElementById('row' + id).style.background = '#fff';
    }
  }
  hideAllMenusActions(): void {
    this.DATA_CARGA_MASIVA.cargaMasivaDetail.forEach((e) => {
      const el = document.getElementById('actions' + e.idProceso);
      if (el) {
        el.hidden = true;
        el.style.top = '0';
        document.getElementById('row' + e.idProceso).style.background = '#fff';
      }
    });
  }
  hideModalError(): void {
    this.modalError.hide();
  }
  descargarConstancias(id): void {
    this.hideAllMenusActions();
    this.spinner.show();
    this._CargaMasivaService.descargarConstancia(id).subscribe(
      (res: any) => {
        const data = {
          file: res.archivo,
          nombre: res.nombreArchivo,
        };
        this.downloadArchivo(data);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  requestClientInfo() {
    if (this.fc['documentNumber'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.getDataOfDocument(token)
      this.recaptcha.reset();
      return;
    }
  }
}
