import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionDeRegistrosService } from '../../../services/mantenimientos/gestion-de-registros.service';
import {
  IBuscarResponse,
  IEstadoResponse,
  IHistorialResponse,
  ISolicitudResponse,
  IDocumentoResponse,
  DepartamentoResponse,
  ProvinciaResponse,
  DistritoResponse,
  CanalResponse,
  IArchivoResponse,
  IChannelDocumentValidate,
  IDataResponse,
  IDataAdjuntoResponse,
  IChannelFathersResponse,
  IEstadoEResponse,
  IDatosLineaEResponse,
  IDatosCanalResponse,
  IDatosPVResponse,
  FrecuenciaResponse,
  StatusResponse,
  TipoPapelesModel,
  EvaluarResponse,
  ProveedorStockResponse,
  ListaPapeles,
  ActualizarCanalAsociado,
} from '../../../models/mantenimientos/gestion-de-registros/gestion-de-registros.model';
import moment from 'moment';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../../../app.config';
import { UtilsService } from '@shared/services/utils/utils.service';
import { StockProviderModel } from '../../../models/mantenimientos/gestion-de-registros/stock-provider.model';
// tslint:disable-next-line:max-line-length
import {
  IDepartamentoModel,
  IDistritoModel,
  IProvinciaModel,
  ParametersResponse,
} from '@shared/models/ubigeo/parameters.model';
import {
  ChannelModel,
  IChannel,
} from '../../../models/mantenimientos/gestion-de-registros/channel.model';
import { PointSaleDetailModel } from '../../../models/mantenimientos/gestion-de-registros/point-sale-detail.model';
import { ChannelInfoModel } from '../../../models/mantenimientos/gestion-de-registros/channel-info.model';
import {
  ISalePoint,
  SalePointModel,
} from '../../../models/mantenimientos/gestion-de-registros/sale-point.model';
import { Subscription } from 'rxjs';
import { RegularExpressions } from '@shared/regexp/regexp';
import {
  NewRequestService
} from '@root/layout/backoffice/components/mantenimientos/shared/services/new-request.service';
import { Branch, ChannelInfo } from '../shared/interfaces/new-request.interface';

@Component({
  selector: 'app-gestion-de-registros',
  templateUrl: './gestion-de-registros.component.html',
  styleUrls: ['./gestion-de-registros.component.scss'],
})
export class GestionDeRegistrosComponent
  implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  formCreatePV: FormGroup;
  formEditPV: FormGroup;
  formCreateRequest: FormGroup;
  formSearch: FormGroup;
  formSearchSalePoint: FormGroup;
  formEvaluarA: FormGroup;

  urlApi: string;
  bsConfig: Partial<BsDatepickerConfig>;

  // DATA
  dataBuscar: any;
  dataEstado: any;
  dataHistorial: any;
  dataSolicitud: any;
  dataDepartamento: any;
  dataDocumento: any;
  dataCanal: any;

  iddepartamento: string;

  dataAdjunto: any;
  dataProvincia: any;

  idprovincia: string;

  dataArchivo: any;
  dataDistrito: any;

  pbuscar: number;

  STOCK: any;
  info: any;
  dataPV: any;
  nSolicitud: number;
  respuestaData: any;
  fecha: Date = new Date();
  infoRegistro: any;

  dataAceptarPV: any;
  dataChannelF: any;
  dataEstadoEV: any;
  dataDatosLinea: any;
  dataPuntoVenta: any = [];
  dataFrecuencia: any;
  dataStatus: any;

  listaPapeles: TipoPapelesModel;
  listaLineaCredito: ListaPapeles;
  creditLinePointSale: Array<ListaPapeles>;
  showButton: boolean;
  show: boolean;
  guardarExcel: File;
  listproveedorStock: any;
  tipoCanal: any;
  INFO: any;
  secuencia: any;

  indexPV: number;
  indexSelected: number;
  idSalePoint: number;
  isSubChannel: boolean = false;

  dataCreditLine: any;

  // BUTTON
  enableInputs: boolean;

  stockProvider$: StockProviderModel;

  departments$: Array<IDepartamentoModel>;
  provinces$: Array<IProvinciaModel>;
  districts$: Array<IDistritoModel>;

  bsValueIni: Date = new Date(
    this.fecha.setFullYear(this.fecha.getFullYear() - 1)
  );
  bsValueFin: Date = new Date();

  attachments: Array<any>;
  attachmentse: Array<any>;
  creditLineData: Array<any>;
  isSearchedData: boolean;
  isSearchedData2: boolean;
  isSearchedData3: boolean;
  isSearchedData4: boolean;
  isSearchedData5: boolean;
  isSearchedData6: boolean;
  isSearchedData7: boolean;
  isSearchedData8: boolean;

  /* BOTON EDITAR EVALUAR */
  btnEditar: boolean;

  // SECCIONES MODAL EVALUAR
  datosCanal: boolean;
  datosBasicos: boolean;
  datosComple: boolean;
  datosAdjuntos: boolean;
  datosPuntoVenta: boolean;
  datosLineaCredito: boolean;
  dataPuntoVenta2: boolean;
  datosEvaluarS: boolean;

  // PAGINADO
  currentPage = 0;
  p = 0;
  tipoArchivo: any;
  file: any;

  message: string;

  limitDocumentNumber: { min: number; max: number };
  cellPhoneValidator: Array<ValidatorFn>;

  validatorsDocumentNumber: any;

  enableLocations: boolean;
  documentNumberValidatorForChannel: { min: number; max: number };

  // *BUSCAR CANAL
  channels$: ChannelModel;
  channelSelected: IChannel;
  pageChannel: number;

  selectedPointSaleDetail: PointSaleDetailModel;
  typeModalSalePoint: number;
  fcrSpChannelReqId: number;

  indexSalePoint: number;

  showRequestType: boolean;

  creditLinesData: any;
  attachmentsData: any;

  showButtonEdit: boolean;

  enableAttachments: boolean;
  enableCreditLines: boolean;
  enableInputsCreditLines: boolean;

  // *SEARCH SALE POINT
  salePointPage: number;
  salePoints$: any;

  salePointSelected: ISalePoint;
  indexSalePointSelected: number;
  listStockOfSalePoint: any[];
  listStockValidar: any[];

  bulkLoadData$: any;

  documentSubscription: Subscription;
  flagDatosBasicos: boolean = false;
  flagTipoCanal: boolean = false;
  // Canal asociado por defeto
  channelDefault = '2015000002';
  //Lista de tipos de canales que deben poseer canal asociados
  listChannelType = [10, 11, 13];
  listMainChannel = [];

  branchByChannelList: Branch[] = [];

  branchProductList: any[] = [];
  isSOATSelected: boolean = false;

  @ViewChild('modalCreateRequest', { static: true, read: TemplateRef })
  _modalCreateRequest: TemplateRef<any>;
  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  _modalHistory: TemplateRef<any>;
  @ViewChild('modalSearch', { static: true, read: TemplateRef })
  _modalSearch: TemplateRef<any>;
  @ViewChild('modalEvaluarA', { static: true, read: TemplateRef })
  _modalEvaluarA: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  @ViewChild('modalCreatePV', { static: true, read: TemplateRef })
  _modalCreatePV: TemplateRef<any>;
  @ViewChild('modalFcrSalePoint', { static: true, read: TemplateRef })
  _modalFcrSalePoint: TemplateRef<any>;

  @ViewChild('modalEditPV', { static: true, read: TemplateRef })
  _modalEditPV: TemplateRef<any>;
  @ViewChild('modalAgregarStock', { static: true, read: TemplateRef })
  _modalAgregarStock: TemplateRef<any>;
  @ViewChild('modalFcrStock', { static: true, read: TemplateRef })
  _modalFcrStock: TemplateRef<any>;
  @ViewChild('modalSearchSalePoint', { static: true, read: TemplateRef })
  _modalSearchSalePoint: TemplateRef<any>;
  @ViewChild('modalBulkLoad', { static: true, read: TemplateRef })
  _modalBulkLoad: TemplateRef<any>;

  constructor(
    private readonly _GestionDeRegistrosService: GestionDeRegistrosService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _fb: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _utilsService: UtilsService,
    private readonly newRequestService: NewRequestService,
    private readonly _cd: ChangeDetectorRef
  ) {
    this.creditLinePointSale = [];
    this.listStockOfSalePoint = [];
    this.listStockValidar = [];
    this.salePoints$ = new SalePointModel();
    this.salePointPage = 0;
    this.showRequestType = true;
    this.enableInputsCreditLines = false;
    this.enableInputs = false;
    this.creditLinesData = null;
    this.dataCreditLine = null;
    this.attachmentsData = [];
    this.limitDocumentNumber = {
      min: 0,
      max: 0,
    };
    this.pageChannel = 0;
    this.channels$ = new ChannelModel();
    this.documentNumberValidatorForChannel = {
      min: 11,
      max: 11,
    };
    this.enableLocations = true;
    this.limitDocumentNumber = { min: 11, max: 11 };
    this.cellPhoneValidator = [
      Validators.pattern(/^[\d]*$/),
      Validators.minLength(9),
      Validators.maxLength(9),
    ];
    this.validatorsDocumentNumber = Validators.compose([
      Validators.pattern(/^[\d]*$/),
      Validators.minLength(this.limitDocumentNumber.min),
      Validators.maxLength(this.limitDocumentNumber.max),
    ]);
    this.stockProvider$ = new StockProviderModel();
    this.listaPapeles = new TipoPapelesModel();
    this.listaLineaCredito = new ListaPapeles();
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.attachments = this.creditLineData = new Array();
    this.pbuscar = 0;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.form = this._fb.group({
      fechaInicio: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
      numero_solicitud: [
        null,
        Validators.compose([Validators.pattern(/^\d*$/)]),
      ],
      estado: [99],
    });
    this.formCreateRequest = this._fb.group({
      requestType: [null, Validators.required],
      documentType: [1, Validators.required],
      documentNumber: [null, this.validatorsDocumentNumber],
      businessName: [null, Validators.required],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      cellphone: [null, this.cellPhoneValidator],
      address: [null, Validators.required],
      contact: [null, Validators.required],
      email: [null, Validators.required],
      channelType: [null, Validators.required],
      startValidity: [this.bsValueFin, Validators.required],
      endValidity: [this.bsValueFin, Validators.required],
      stockProvider: [null, Validators.required],
      distribution: ['1', Validators.required],
      channelSale: this._fb.group({
        channelCode: [{ value: null, disabled: true }],
        distributionType: [{ value: null, disabled: true }],
        channelState: [{ value: null, disabled: true }],
        stateDate: [{ value: null, disabled: true }],
      }),
      pointSale: this._fb.group({
        description: [null],
        department: [null],
        province: [null],
        district: [null],
        phone: [
          null,
          Validators.compose([
            Validators.pattern(/^[\d]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
          ]),
        ],
        address: [null],
        contact: [null],
        email: [null],
        frecuency: this._fb.group({
          quantity: [null],
          type: [null],
        }),
        state: [null],
      }),
      pointSales: this._fb.array([]),
      attachments: this._fb.array([]),
      creditLines: this._fb.array([]),
    });
    this.formSearch = this._fb.group({
      documentType: [null, Validators.required],
      documentNumber: [
        null,
        [
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(this.documentNumberValidatorForChannel.min),
          Validators.maxLength(this.documentNumberValidatorForChannel.max),
        ],
      ],
      businessName: [null],
    });
    this.formEvaluarA = this._fb.group({
      // DATOS DE CANAL DE VENTA
      codigo: [null, Validators.required],
      type_d: [null, Validators.required],
      estado: [null, Validators.required],
      date: [null, Validators.required],
      // DATOS BASICOS
      documentType: [null, Validators.required],
      documentNumber: [
        null,
        Validators.compose([
          Validators.pattern(/^\d*$/),
          Validators.required,
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.max),
        ]),
        ,
      ],
      businessName: [null, Validators.required],
      name: [null, Validators.required],
      lastname1: [null, Validators.required],
      lastname2: [null, Validators.required],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      cellphone: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      address: [null, Validators.required],
      contact: [null, Validators.required],
      email: [
        null,
        [Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN), Validators.required],
      ],
      channelType: [null, Validators.required],
      detail: [''],
      // DATOS COMPLEMENTARIOS
      startValidity: [this.bsValueFin, Validators.required],
      endValidity: [this.bsValueFin, Validators.required],
      stockProvider: [null, Validators.required],
      distribution: ['1', Validators.required],
      attachmentse: this._fb.array([]),
      creditLinese: this._fb.array([]),
      creditLinesPV: this._fb.array([]),
      // DATOS DE PUNTO DE VENTA
      descripcion: [null, Validators.required],
      departmentPV: [null, Validators.required],
      provincePV: [null, Validators.required],
      districtPV: [null, Validators.required],
      celular: [
        null,
        [
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
          Validators.required,
        ],
      ],
      direccion: [null, Validators.required],
      contacto: [null, Validators.required],
      correo: [
        null,
        [Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN), Validators.required],
      ],
      numeroF: [null, Validators.required],
      frecuencia: [null, Validators.required],
      estadoPV: [null, Validators.required],
      estadoE: [null, Validators.required],
      observacion: [null, Validators.required],
    });
    this.formCreatePV = this._fb.group({
      descripcion: [null, Validators.required],
      departmentPV: [null, Validators.required],
      provincePV: [null, Validators.required],
      districtPV: [null, Validators.required],
      celularPV: [
        null,
        [
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
          Validators.required,
        ],
      ],
      direccion: [null, Validators.required],
      contacto: [null, Validators.required],
      correo: [
        null,
        [Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN), Validators.required],
      ],
      numeroF: [null, Validators.required],
      frecuencia: [null, Validators.required],
      estadoPV: [null, Validators.required],
    });
    this.formEditPV = this._fb.group({
      descripcion: [null, Validators.required],
      departmentPV: [null, Validators.required],
      provincePV: [null, Validators.required],
      districtPV: [null, Validators.required],
      celularPV: [
        null,
        [
          Validators.pattern(/^[\d]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
          Validators.required,
        ],
      ],
      direccion: [null, Validators.required],
      contacto: [null, Validators.required],
      correo: [
        null,
        [Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN), Validators.required],
      ],
      numeroF: [null, Validators.required],
      frecuencia: [null, Validators.required],
      estadoPV: [null, Validators.required],
    });
    this.formSearchSalePoint = this._fb.group({
      documentType: [1],
      documentNumber: [null],
      clientName: [null],
      code: [null],
      description: [null],
    });
    this.isSearchedData = true;
    this.isSearchedData2 = false;
    this.isSearchedData3 = false;
    this.isSearchedData4 = true;
    this.isSearchedData5 = false;
    this.isSearchedData6 = true;
    this.isSearchedData7 = false;
    this.isSearchedData8 = false;
    this.datosCanal = true;
    this.datosBasicos = true;
    this.datosComple = true;
    this.datosAdjuntos = true;
    this.datosPuntoVenta = true;
    this.datosLineaCredito = true;
    this.dataPuntoVenta2 = true;
    this.datosEvaluarS = true;

    /* BOTON EDITAR EVALUAR */
    this.btnEditar = true;

    this.showButton = false;
    this.show = false;
  }

  ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    /* DATOS BASICOS */
    this.e['documentNumber'].disable();
    this.e['businessName'].disable();
    this.e['name'].disable();
    this.e['lastname1'].disable();
    this.e['lastname2'].disable();
    this.e['department'].disable();
    this.e['province'].disable();
    this.e['district'].disable();
    this.e['cellphone'].disable();
    this.e['address'].disable();
    this.e['contact'].disable();
    this.e['email'].disable();
    this.e['channelType'].disable();
    this.e['detail'].disable();

    // DATOS COMPLEMENTARIOS
    this.e['startValidity'].disable();
    this.e['endValidity'].disable();
    this.e['stockProvider'].disable();
    this.e['distribution'].disable();

    // DATOS DE PUNTO DE VENTA
    this.e['descripcion'].disable();
    this.e['departmentPV'].disable();
    this.e['provincePV'].disable();
    this.e['districtPV'].disable();
    this.e['celular'].disable();
    this.e['direccion'].disable();
    this.e['contacto'].disable();
    this.e['correo'].disable();
    this.e['numeroF'].enable();
    this.e['frecuencia'].disable();
    this.e['estadoPV'].disable();

    this.isSearchedData = true;
    this.isSearchedData2 = false;
    this.isSearchedData3 = false;
    this.isSearchedData4 = true;
    this.isSearchedData5 = false;
    this.isSearchedData6 = true;
    this.isSearchedData7 = false;
    this.isSearchedData8 = false;
    this.datosCanal = true;
    this.datosBasicos = true;
    this.datosComple = true;
    this.datosPuntoVenta = true;
    this.datosLineaCredito = true;
    this.dataPuntoVenta2 = true;
    this.datosEvaluarS = true;
    this.enableInputs = false;
    this.buscar();
    this.estado();
    this.locations();
    this.form.get('estado').setValue(99);
    this.f['numero_solicitud'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['numero_solicitud'].hasError('pattern')) {
          this.f['numero_solicitud'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fcr['requestType'].valueChanges.subscribe((val: string) => {
      this.changeValueSolicitud(val);
      if (val) {
        const cs = (this.fcr['channelSale'] as FormGroup).controls;
        const sp = (this.fcr['pointSale'] as FormGroup).controls;

        const f = (this.fcrSalePoint.get('frecuency') as FormGroup).controls;
        Object.keys(this.fcr).forEach((e: string) => {
          if (e !== 'requestType') {
            this.fcr[e].clearValidators();
          }
          this.fcr[e].enable({
            emitEvent: false,
          });
        });
        Object.keys(cs).forEach((e: string) => {
          cs[e].clearValidators();
          cs[e].updateValueAndValidity();
        });
        Object.keys(sp).forEach((e: string) => {
          sp[e].clearValidators();
          sp[e].updateValueAndValidity();
        });
        f['quantity'].clearValidators();
        f['quantity'].updateValueAndValidity();

        f['type'].clearValidators();
        f['type'].updateValueAndValidity();
        this.fcr['documentType'].disable();
        switch (+val) {
          case 0:
            this.showButtonEdit = false;
            this.fcr['documentNumber'].setValidators([
              this.validatorsDocumentNumber,
              Validators.required,
            ]);
            this.fcr['businessName'].setValidators(Validators.required);
            this.fcr['department'].setValidators(Validators.required);
            this.fcr['province'].setValidators(Validators.required);
            this.fcr['district'].setValidators(Validators.required);
            this.fcr['cellphone'].setValidators([
              ...this.cellPhoneValidator,
              Validators.required,
            ]);
            this.fcr['address'].setValidators(Validators.required);
            this.fcr['contact'].setValidators(Validators.required);
            this.fcr['distribution'].setValidators(Validators.required);
            this.fcr['distribution'].setValue('1');
            this.fcr['email'].setValidators([
              Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
              Validators.required,
            ]);
            this.fcr['channelType'].setValidators(Validators.required);
            this.fcr['stockProvider'].setValidators(Validators.required);

            this.enableCreditLines = true;
            this.enableInputsCreditLines = true;
            this.enableAttachments = true;
            this.enableAttachments = true;
            break;
          case 1:
            this.showButtonEdit = true;
            this.formCreateRequest.disable({
              emitEvent: false,
            });
            this.fcr['requestType'].enable({
              emitEvent: false,
            });
            this.fcr['documentNumber'].setValidators([
              this.validatorsDocumentNumber,
              Validators.required,
            ]);
            this.fcr['businessName'].setValidators(Validators.required);
            this.fcr['department'].setValidators(Validators.required);
            this.fcr['province'].setValidators(Validators.required);
            this.fcr['district'].setValidators(Validators.required);
            this.fcr['cellphone'].setValidators([
              ...this.cellPhoneValidator,
              Validators.required,
            ]);
            this.fcr['address'].setValidators(Validators.required);
            this.fcr['contact'].setValidators(Validators.required);
            this.fcr['distribution'].setValidators(Validators.required);
            this.fcr['distribution'].setValue('1');
            this.fcr['email'].setValidators([
              Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
              Validators.required,
            ]);
            break;
          case 2:
            this.showButtonEdit = false;
            const controls = this.fcrcs.controls;
            Object.keys(controls).forEach((e: string) => {
              controls[e].setValidators(Validators.required);
              controls[e].updateValueAndValidity();
            });
            break;
          case 3:
            this.showButtonEdit = false;
            Object.keys(cs).forEach((e: string) => {
              cs[e].setValidators(Validators.required);
              cs[e].updateValueAndValidity();
            });
            Object.keys(sp).forEach((e: string) => {
              sp[e].setValidators(Validators.required);
              sp[e].updateValueAndValidity();
            });
            sp['state'].clearValidators();
            sp['state'].updateValueAndValidity();

            f['quantity'].setValidators(Validators.required);
            f['quantity'].updateValueAndValidity();

            f['type'].setValidators(Validators.required);
            f['type'].updateValueAndValidity();

            this.fcr['pointSale']
              .get('phone')
              .setValidators([
                Validators.pattern(/^[\d]*$/),
                Validators.required,
                Validators.minLength(9),
                Validators.maxLength(9),
              ]);
            this.fcr['pointSale'].get('phone').updateValueAndValidity();

            this.fcr['pointSale']
              .get('email')
              .setValidators([
                Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
                Validators.required,
              ]);
            this.fcr['pointSale'].get('email').updateValueAndValidity();
            break;
        }
        Object.keys(this.fcr).forEach((e: string) => {
          this.fcr[e].updateValueAndValidity({
            emitEvent: false,
          });
        });
      }
    });
    this.fcr['channelType'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.stockProvider();
      }
      switch (+val) {
        case 10:
        case 11:
          this.obtenerListaMainChannel(this.channelDefault);
          break;

        default:
          if (this.formCreateRequest.controls['mainChannel']) {
            this.formCreateRequest.removeControl('mainChannel');
          }
          this.listMainChannel = [];
          this.flagTipoCanal = false;
      }
    });
    this.fcr['documentType'].valueChanges.subscribe((val: string) => {
      this.fcr['documentNumber'].setValue(null);
      switch (+val) {
        case 2:
          this.limitDocumentNumber = { min: 11, max: 11 };
          break;
        case 1:
          this.limitDocumentNumber = { min: 8, max: 8 };
          break;
        case 3:
          this.limitDocumentNumber = { min: 9, max: 12 };
          break;
      }
      this.fcr['documentNumber'].setValidators(this.validatorsDocumentNumber);
    });
    this.fcr['documentNumber'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.fcr['documentNumber'].hasError('pattern')) {
          this.fcr['documentNumber'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fcr['cellphone'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (
          this.fcr['cellphone'].hasError('pattern') ||
          +val.substring(0, 1) !== 9
        ) {
          this.fcr['cellphone'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fcr['pointSale'].get('phone').valueChanges.subscribe((val: string) => {
      if (val) {
        if (
          this.fcr['pointSale'].get('phone').hasError('pattern') ||
          +val.slice(0, 1) !== 9
        ) {
          this.fcr['pointSale']
            .get('phone')
            .setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.e['cellphone'].valueChanges.subscribe((val) => {
      if (val) {
        const newVal = val;
        if (
          this.e['cellphone'].hasError('pattern') ||
          Number(val.toString().substring(0, 1)) !== 9
        ) {
          this.e['cellphone'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.e['documentNumber'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.e['documentNumber'].hasError('pattern')) {
          this.e['documentNumber'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fcr['department'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.fcr['province'].setValue(null);
        this.fcr['district'].setValue(null);
        this.provinces$ = this.departments$?.find(
          (x) => +x.id == +val
        )?.provincias;
        this.districts$ = [];
      }
    });
    this.fcr['province'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.fcr['district'].setValue(null);
        this.districts$ = this.provinces$?.find(
          (x) => +x.idProvincia == +val
        )?.distritos;
      }
    });
    this.fs['documentType'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.channelSelected = null;
        this.channels$ = new ChannelModel();
        this.fs['documentNumber'].setValue(null);
        this.fs['documentNumber'].clearValidators();

        switch (+val) {
          case 2:
            this.documentNumberValidatorForChannel = {
              min: 11,
              max: 11,
            };
            break;
          case 1:
            this.documentNumberValidatorForChannel = {
              min: 8,
              max: 8,
            };
            break;
          case 3:
            this.documentNumberValidatorForChannel = {
              min: 9,
              max: 12,
            };
            break;
        }
        this.fs['documentNumber'].setValidators([
          Validators.pattern(/^[\d]*$/),
          Validators.required,
          Validators.minLength(this.documentNumberValidatorForChannel.min),
          Validators.maxLength(this.documentNumberValidatorForChannel.max),
        ]);
      }
    });
    this.e['celular'].valueChanges.subscribe((val) => {
      if (val) {
        const newVal = val;
        if (this.e['celular'].hasError('pattern')) {
          this.e['celular'].setValue(val.substring(val, val.length - 1));
        }
        if (Number(val.toString().substring(0, 1)) !== 9) {
          this.e['celular'].setValue(newVal);
        }
      }
    });
    this.e['documentType'].valueChanges.subscribe((val) => {
      switch (+val) {
        case 1:
          this.limitDocumentNumber = {
            min: 8,
            max: 8,
          };
          break;
        case 4:
        case 2:
          this.limitDocumentNumber = {
            min: 9,
            max: 12,
          };
          break;
        default:
          this.limitDocumentNumber = {
            min: 8,
            max: 12,
          };
          break;
      }
      if (val) {
        this.e['documentNumber'].setValidators(
          Validators.compose([
            Validators.pattern(/^\d*$/),
            Validators.required,
            Validators.minLength(this.limitDocumentNumber.min),
            Validators.maxLength(this.limitDocumentNumber.max),
          ])
        );
      } else {
        this.e['documentNumber'].setValidators(
          Validators.compose([
            Validators.pattern(/^\d*$/),
            Validators.minLength(this.limitDocumentNumber.min),
            Validators.maxLength(this.limitDocumentNumber.max),
          ])
        );
      }
      this.e['documentNumber'].updateValueAndValidity({
        emitEvent: true,
      });
    });
    this.pv['celularPV'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.pv['celularPV'].hasError('pattern')) {
          this.pv['celularPV'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.editpv['celularPV'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.editpv['celularPV'].hasError('pattern')) {
          this.editpv['celularPV'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.fcrSalePoint
        .get('department')
        .valueChanges.subscribe((val: string) => {
      if (val) {
        this.fcrSalePoint.get('province').setValue(null);
        this.fcrSalePoint.get('district').setValue(null);
        this.changeDepartmentFcrSp(val);
        this.districts$ = [];
      }
    });
    this.fcrSalePoint.get('province').valueChanges.subscribe((val: string) => {
      if (val) {
        this.fcrSalePoint.get('district').setValue(null);
        this.districts$ = [];
        this.changeProvinceFcrSp(val);
      }
    });
    this.fcrSalePoint.get('phone').valueChanges.subscribe((val: string) => {
      if (val && this.fcrSalePoint.get('phone').hasError('pattern')) {
        this.fcrSalePoint
            .get('phone')
            .setValue(val.substring(0, val.length - 1));
      }
    });
    this.e['channelType'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.stockProvidere();
      }
    });
    const fcrFrec = (this.fcrSalePoint.get('frecuency') as FormGroup).get(
      'quantity'
    );
    fcrFrec.valueChanges.subscribe((val: string) => {
      if (val) {
        if (!/^[\d]*$/.test(val)) {
          fcrFrec.setValue(val.slice(0, val.length - 1));
        }
      }
    });
    this.validDocument();
  }

  ngOnDestroy(): void {
    this.documentSubscription.unsubscribe();
  }

  validDocument() {
    this.documentSubscription = this.formCreateRequest.controls[
      'documentNumber'
      ].valueChanges.subscribe((value: string) => {
      let valid = this.formCreateRequest.controls['documentNumber'].valid;
      if (valid) {
        let iniciales = value?.length > 0 ? value.slice(0, 2) : 0;
        this.flagDatosBasicos = iniciales.toString() == '10';
        if (this.flagDatosBasicos) {
          this.formCreateRequest.addControl(
            'name',
            new FormControl(null, [
              Validators.required,
              Validators.pattern(RegularExpressions.text),
            ])
          );

          this.formCreateRequest.addControl(
            'lastname',
            new FormControl(null, [
              Validators.required,
              Validators.pattern(RegularExpressions.text),
            ])
          );

          this.formCreateRequest.addControl(
            'lastname2',
            new FormControl(null, [
              Validators.required,
              Validators.pattern(RegularExpressions.text),
            ])
          );

          this.formCreateRequest.removeControl('businessName');
        } else {
          if (this.formCreateRequest.controls['name']) {
            this.formCreateRequest.removeControl('name');
          }

          if (this.formCreateRequest.controls['lastname']) {
            this.formCreateRequest.removeControl('lastname');
          }

          if (this.formCreateRequest.controls['lastname2']) {
            this.formCreateRequest.removeControl('lastname2');
          }

          if (!this.formCreateRequest.controls['businessName']) {
            this.formCreateRequest.addControl(
              'businessName',
              new FormControl(null, [Validators.required])
            );
          }
        }
      }
    });
  }

  obtenerListaMainChannel(
    channel,
    flagcontrol: boolean = true,
    flagMainChannel: boolean = true
  ) {
    this.flagTipoCanal = true;
    if (flagcontrol) {
      this.formCreateRequest.addControl(
        'mainChannel',
        new FormControl(null, [Validators.required])
      );
    } else {
      this.formEvaluarA.addControl('mainChannel', new FormControl(null, []));
    }
    this._spinner.show();
    this._GestionDeRegistrosService.listaCanales().subscribe((response) => {
      this.listMainChannel = response;
      if (flagcontrol) {
        this.fcr['mainChannel'].setValue(channel);
      } else {
        this.e['mainChannel'].setValue(channel);
        if (flagMainChannel) {
          this.e['mainChannel'].disable();
        } else {
          this.e['mainChannel'].enable();
        }
      }
      this._spinner.hide();
    });
  }

  changeDepartmentFcrSp(e: string): void {
    this.provinces$ = this.departments$?.find((x) => +x.id == +e)?.provincias;
  }

  changeProvinceFcrSp(e: string): void {
    this.districts$ = this.provinces$?.find(
      (x) => +x.idProvincia == +e
    )?.distritos;
  }

  get f(): any {
    return this.form.controls;
  }

  get ff(): any {
    return this.formCreateRequest.controls;
  }

  get fs(): { [key: string]: AbstractControl } {
    return this.formSearch.controls;
  }

  get pv(): any {
    return this.formCreatePV.controls;
  }

  get editpv(): any {
    return this.formEditPV.controls;
  }

  get fcr(): { [key: string]: AbstractControl } {
    return this.formCreateRequest.controls;
  }

  get fcrcs(): any {
    return this.fcr['channelSale'] as FormGroup;
  }

  get fcrFiles(): FormArray {
    return this.fcr['attachments'] as FormArray;
  }

  get fssp(): { [key: string]: AbstractControl } {
    return this.formSearchSalePoint.controls;
  }

  set currentPageSP(val: any) {
    this.salePointPage = val;
    this.searchSalePoint(false);
  }

  get aFiles(): FormArray {
    return this.e['attachmentse'] as FormArray;
  }

  get lineFiles(): FormArray {
    return this.e['creditLinese'] as FormArray;
  }

  get lineFiles2(): FormArray {
    return this.e['creditLinese'] as FormArray;
  }

  get lineFilesStock(): FormArray {
    return this.e['creditLinesPV'] as FormArray;
  }

  get fcrCreditLines(): FormArray {
    return this.fcr['creditLines'] as FormArray;
  }

  get e(): any {
    return this.formEvaluarA.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  locations(): void {
    this._utilsService.parameters().subscribe(
      (response: ParametersResponse) => {
        this.departments$ = response.ubigeos;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  stockProvider(): void {
    this._spinner.show();
    this.fcr['stockProvider'].setValue(null);
    this.stockProvider$ = new StockProviderModel();
    this._GestionDeRegistrosService
        .stockProvider(this.fcr['channelType'].value)
        .subscribe(
          (res: StockProviderModel) => {
            this.stockProvider$ = res;
            this._spinner.hide();
          },
          (err: HttpErrorResponse) => {
            this._spinner.hide();
            console.error(err);
          }
        );
  }

  texto(id) {
    return (
      this.stockProvider$.items?.find(
        (x) => x.description?.toString() === id?.toString()
      )?.id || ''
    );
  }

  stockProvidere(): void {
    this._spinner.show();
    this.e['stockProvider'].setValue(null);
    this.stockProvider$ = new StockProviderModel();
    this._GestionDeRegistrosService
        .stockProvider(this.e['channelType'].value)
        .subscribe(
          (res: StockProviderModel) => {
            this.stockProvider$ = res;
            if (res.items.length == 1) {
              this.e['stockProvider'].setValue(res.items[0].id);
            }
            this._spinner.hide();
          },
          (err: HttpErrorResponse) => {
            this._spinner.hide();
            console.error(err);
          }
        );
  }

  openModalNewRequest(): void {
    this.channelSelected = null;
    this.selectedPointSaleDetail = null;
    this.listStockOfSalePoint = [];
    this.formCreateRequest.reset();
    this.fcrCreditLines.reset();
    this.fcr['documentType'].setValue(2);
    this.fcr['distribution'].setValue('1');
    this.fcr['requestType'].setValue('2');
    this.isSearchedData = true;
    this.isSearchedData2 = true;
    this.isSearchedData3 = false;
    this.isSearchedData4 = true;
    this.isSearchedData5 = false;
    this.isSearchedData6 = true;
    this.isSearchedData7 = false;
    this.showRequestType = true;
    this.showButtonEdit = false;
    this.creditLinesData = null;
    this.attachmentsData = null;
    this.channelSelected = null;
    this.enableAttachments = false;
    this.enableCreditLines = false;
    this.enableInputsCreditLines = false;
    this.selectedPointSaleDetail = null;
    this.solicitud();
    this.documento();
    this.departamento();
    this.canal();
    this._vc.createEmbeddedView(this._modalCreateRequest);
  }

  closeModalSearch() {
    this.formSearch.get('documentType').setValue(1);
    this.formSearch.reset();
    this._vc.remove();
    this.isSearchedData3 = false;
  }

  resetAll(): void {
    this._vc.clear();
    this.showRequestType = true;
    this.showButtonEdit = false;
    this.creditLinesData = null;
    this.attachmentsData = null;
    this.channelSelected = null;
    this.enableAttachments = false;
    this.enableCreditLines = false;
    this.enableInputsCreditLines = false;
    this.selectedPointSaleDetail = null;
    this.formCreateRequest.reset();
    const gc = this.fcrSalePoint.controls;
    const fc = (gc['frecuency'] as FormGroup).controls;
    Object.keys(gc).forEach((e) => {
      gc[e].clearValidators();
      gc[e].updateValueAndValidity();
    });
    Object.keys(fc).forEach((e) => {
      fc[e].clearValidators();
      fc[e].updateValueAndValidity();
    });
    this.ff['documentNumber'].enable();
    this.ff['businessName'].enable();
    this.ff['department'].enable();
    this.ff['province'].enable();
    this.ff['district'].enable();
    this.ff['cellphone'].enable();
    this.ff['address'].enable();
    this.ff['contact'].enable();
    this.ff['email'].enable();
    this.ff['channelType'].enable();
    this.ff['startValidity'].enable();
    this.ff['endValidity'].enable();
    this.ff['stockProvider'].enable();
    this.ff['distribution'].enable();
    this.formCreateRequest.get('startValidity').setValue(this.bsValueFin);
    this.formCreateRequest.get('endValidity').setValue(this.bsValueFin);
    this.formCreateRequest.get('distribution').setValue('1');
    this.formCreateRequest.get('documentType').setValue(2);
    this.fcrFiles.clear();
    this.fcrCreditLines.clear();
    this.formSearch.reset();
    this.fs['documentType'].setValue(1);
    /* this.aFiles.clear(); */
    this.lineFiles.clear();

    /* MODAL EVALUAR */
    this.e['documentNumber'].disable();
    this.e['businessName'].disable();
    this.e['name'].disable();
    this.e['lastname1'].disable();
    this.e['lastname2'].disable();
    this.e['department'].disable();
    this.e['province'].disable();
    this.e['district'].disable();
    this.e['cellphone'].disable();
    this.e['address'].disable();
    this.e['contact'].disable();
    this.e['email'].disable();
    this.e['detail'].disable();
    this.e['channelType'].disable({
      emitEvent: false,
    });
    // DATOS COMPLEMENTARIOS
    this.e['startValidity'].disable();
    this.e['endValidity'].disable();
    this.e['stockProvider'].disable();
    this.e['distribution'].disable();
    // DATOS DE PUNTO DE VENTA
    this.e['descripcion'].disable();
    this.e['departmentPV'].disable();
    this.e['provincePV'].disable();
    this.e['districtPV'].disable();
    this.e['celular'].disable();
    this.e['direccion'].disable();
    this.e['contacto'].disable();
    this.e['correo'].disable();
    this.e['numeroF'].disable();
    this.e['frecuencia'].disable();
    this.e['estadoPV'].disable();
    /* this.e['estadoE'].disable();
    this.e['observacion'].disable(); */
    this.showButton = false;
    this.show = false;
    this.enableInputs = false;
    /* this.dataAdjunto = []; */
    this.listaPapeles = new TipoPapelesModel();
  }

  closeModal(): void {
    this.resetAll();
    this.buscar();
  }

  closeLastModal(): void {
    this.formCreatePV.reset();
    this.fcr['pointSale'].reset();
    const gc = this.fcrSalePoint.controls;
    const fc = (gc['frecuency'] as FormGroup).controls;
    Object.keys(gc).forEach((e) => {
      gc[e].clearValidators();
      gc[e].updateValueAndValidity();
    });
    Object.keys(fc).forEach((e) => {
      fc[e].clearValidators();
      fc[e].updateValueAndValidity();
    });
    this._vc.remove();
  }

  limpiar() {
    this.form.get('fechaInicio').setValue(this.bsValueIni);
    this.form.get('fechaFin').setValue(this.bsValueFin);
    this.form.get('numero_solicitud').setValue(null);
    this.form.get('estado').setValue(99);
    this.buscar();
  }

  buscar(showSpinner = true) {
    if (showSpinner) {
      this._spinner.show();
    }

    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_DATEBEGIN:
        moment(this.f['fechaInicio'].value).format('YYYY-MM-DD') || '',
      P_DATEEND: moment(this.f['fechaFin'].value).format('YYYY-MM-DD') || '',
      P_NREQUEST: this.f['numero_solicitud'].value || 0,
      P_NSTATE: this.f['estado'].value,
      P_NIDUSER: this.currentUser.id, // this.currentUser.id --------- CAMBIAR,
      _: `${new Date().getTime()}`,
    };
    this._GestionDeRegistrosService.buscar(data).subscribe(
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

  estado() {
    const data: any = {
      P_NIDUSER: 62, // this.currentUser.id --------- CAMBIAR,
      _: new Date().getTime(),
    };
    this._GestionDeRegistrosService.estado(data).subscribe(
      (response: IEstadoResponse) => {
        this.dataEstado = response;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  historial(dat: any) {
    this._spinner.show();
    this._vc.createEmbeddedView(this._modalHistory);
    const data: any = {
      P_NIDCHANNELREQUEST: dat,
    };
    this._GestionDeRegistrosService.historial(data).subscribe(
      (response: IHistorialResponse) => {
        this.dataHistorial = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  openModalEvaluar(dat: any) {
    this.formEditPV.reset();
    this.lineFiles.reset();
    this.creditLineData = [];
    this.fcrCreditLines.clear();
    this.listaPapeles = new TipoPapelesModel();
    this.isSubChannel = false;
    /* MODAL EVALUAR */
    this.e['documentNumber'].disable();
    this.e['businessName'].disable();
    this.e['name'].disable();
    this.e['lastname1'].disable();
    this.e['lastname2'].disable();
    this.e['department'].disable();
    this.e['province'].disable();
    this.e['district'].disable();
    this.e['cellphone'].disable();
    this.e['address'].disable();
    this.e['contact'].disable();
    this.e['email'].disable();
    this.e['channelType'].disable();
    this.e['detail'].disable();
    // DATOS COMPLEMENTARIOS
    this.e['startValidity'].disable();
    this.e['endValidity'].disable();
    this.e['stockProvider'].disable();
    this.e['distribution'].disable();
    // DATOS DE PUNTO DE VENTA
    this.e['descripcion'].disable();
    this.e['departmentPV'].disable();
    this.e['provincePV'].disable();
    this.e['districtPV'].disable();
    this.e['celular'].disable();
    this.e['direccion'].disable();
    this.e['contacto'].disable();
    this.e['correo'].disable();
    this.e['numeroF'].disable();
    this.e['frecuencia'].disable();
    this.e['estadoPV'].disable();
    this.btnEditar = true;
    this.enableInputs = false;
    this.nSolicitud = dat?.NREQUEST;
    this.infoRegistro = dat;
    this.STOCK = 'NO';
    this._spinner.show();
    this.documento();
    this.departamento();
    this.canal();
    if (this.infoRegistro.NTYPEREQUEST != '0') {
      this.proveedorStock();
    }
    this.stockProvidere();
    this.e['estadoE'].setValue('4');
    this.e['observacion'].value = null;
    if (this.infoRegistro.NTYPEREQUEST === '0') {
      this.getDataRegistro();
      this.listaCredit();
      this.datosA();
    }
    if (this.infoRegistro.NTYPEREQUEST === '2') {
      this.getDataRegistro2();
      this.datosPV();
    }
    if (this.infoRegistro.NTYPEREQUEST === '3') {
      this.getDataRegistro2();
      this.datosPV();
    }
    if (this.infoRegistro.NTYPEREQUEST === '1') {
      this.getDataRegistro();
      this.listaCredit();
      this.datosA();
    }
    // this._vc.createEmbeddedView(this._modalEvaluarA);
    this._spinner.hide();

    const requestTypeIncludes: string[] = ['0', '1'];
    if (requestTypeIncludes.includes(this.infoRegistro.NTYPEREQUEST)) {
      this.getProductsByRequestID(dat.NREQUEST);
    }
  }

  getProductsByRequestID(requestID: string) {
    this._spinner.show();
    const payload = {
      numeroSolicitud: requestID,
      codigoCanal: null
    };
    this.newRequestService.getProductsOfChannel(payload).subscribe({
      next: (response: Branch[]): void => {
        this.branchByChannelList = response;
        this.e['detail'].setValue(response[0]?.detailSubChannel)
        console.log(response)
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this._spinner.hide();
      },
      complete: () => this._spinner.hide()
    });
  }

  getDataRegistro() {
    console.log('entroa  gestDataregistr')
    const data: any = {
      P_NIDREQUESTCHANNEL: this.nSolicitud,
      requestType: this.infoRegistro.NTYPEREQUEST,
    };
    this._GestionDeRegistrosService.respuestaData(data).subscribe(
      (response: IDataResponse) => {
        this.respuestaData = response.PA_SEL_DATA_REQUEST;
        console.log(this.respuestaData)

        if(this.respuestaData.NTYPECHANNEL == 13) {
            this.isSubChannel = true;
        }
        // DATOS BASICOS
        let iniciales =
          this.respuestaData?.SNUMDOC?.length > 0
            ? this.respuestaData?.SNUMDOC.slice(0, 2)
            : 0;
        this.flagDatosBasicos = iniciales.toString() == '10';

        this.e['documentType'].value = this.respuestaData?.NTYPEDOC;
        this.e['documentNumber'].value = this.respuestaData?.SNUMDOC;
        this.e['businessName'].value = this.respuestaData?.SCLIENTNAME;
        this.e['name'].value = this.respuestaData?.SNAME;
        this.e['lastname1'].value = this.respuestaData?.SLASTNAME;
        this.e['lastname2'].value = this.respuestaData?.SLASTNAME2;
        this.e['department'].value = this.respuestaData?.NPROVINCE;
        this.e['province'].value = this.respuestaData?.NLOCAL;
        this.e['district'].value = this.respuestaData?.NMUNICIPALITY;
        this.e['cellphone'].value = this.respuestaData?.SPHONE;
        this.e['address'].value = this.respuestaData?.SADDRESS;
        this.e['contact'].value = this.respuestaData?.SCONTACT;
        this.e['email'].value = this.respuestaData?.SMAIL;
        this.e['channelType'].value = this.respuestaData?.NTYPECHANNEL;
        // DATOS COMPLEMENTARIOS
        this.e['startValidity'].value = moment(
          this.respuestaData?.DBEGINVALIDITY
        ).format('DD/MM/YYYY');
        this.e['endValidity'].value = moment(
          this.respuestaData?.DENDVALIDITY
        ).format('DD/MM/YYYY');
        this.stockProvidere();
        this.e['stockProvider'].value = this.respuestaData?.NPROVIDERSTOCK;
        this.e['distribution'].value = this.respuestaData?.NDISTRIBUTION;
        if (this.respuestaData?.DBEGINVALIDITY === null) {
          this.e['startValidity'].value = '';
        }
        if (this.respuestaData?.DENDVALIDITY === null) {
          this.e['endValidity'].value = '';
        }
        if (this.respuestaData?.NTYPECHANNEL === 0) {
          this.e['channelType'].value = null;
        }
        if (this.respuestaData?.NPROVIDERSTOCK === 0) {
          this.e['stockProvider'].value = null;
        }
        this.provincia();
        this.distrito();
        this.channelFayhers();
        this.estadoSolicitud();
        this.proveedorStock();
        if (this.listChannelType.includes(+this.e['channelType'].value)) {
          this.getMainChannel();
        }
        this._vc.createEmbeddedView(this._modalEvaluarA);
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  getMainChannel() {
    this._spinner.show();
    this._GestionDeRegistrosService
        .obtenerCanalAsociado(this.nSolicitud)
        .subscribe((data) => {
          if (data.existe) {
            this.obtenerListaMainChannel(data.canalAsociado, false);
          }
        });
  }

  getDataRegistro2() {
    const data: any = {
      P_NIDCHANNELREQUEST: this.nSolicitud,
      requestType: this.infoRegistro.NTYPEREQUEST,
    };
    this._GestionDeRegistrosService.respuestaData2(data).subscribe(
      (response: IDatosCanalResponse) => {
        this.respuestaData = response.PA_READ_REQ_SALEPOINT;
        // DATOS - CANAL DE VENTA
        this.e['codigo'].value = this.infoRegistro?.NIDREQUEST;
        this.e['estado'].value = this.respuestaData?.SSTATE;
        this.e['date'].value = this.respuestaData?.SDATE;
        if (this.infoRegistro.NTYPEREQUEST === '2') {
          this.e['type_d'].value = 'Canal';
        } else {
          this.e['type_d'].value = 'Punto de Venta';
        }
        this.estadoSolicitud();
        this._vc.createEmbeddedView(this._modalEvaluarA);
        // this.datosPV();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  datosPV(): void {
    this._spinner.show();
    const data: any = {
      P_NIDCHANNELREQUEST: this.nSolicitud,
    };
    this._GestionDeRegistrosService.DatosPV(data).subscribe(
      (response: IDatosPVResponse) => {
        this.dataPV = response;
        this.dataPuntoVenta = response.PA_READ_DET_REQ_SALEPOINT;
        // DATOS DE PUNTO DE VENTA
        this.e['descripcion'].value = this.dataPuntoVenta[0].SDESCRIPTION;
        this.e['departmentPV'].value = this.dataPuntoVenta[0].NPROVINCE;
        this.e['provincePV'].value = this.dataPuntoVenta[0].NLOCAL;
        this.e['districtPV'].value = this.dataPuntoVenta[0].NMUNICIPALITY;
        this.e['celular'].value = this.dataPuntoVenta[0].SPHONE;
        this.e['direccion'].value = this.dataPuntoVenta[0].SADDRESS;
        this.e['contacto'].value = this.dataPuntoVenta[0].SCONTACT;
        this.e['correo'].value = this.dataPuntoVenta[0].SMAIL;
        this.e['numeroF'].value = this.dataPuntoVenta[0].SFRECUENCY;
        this.e['frecuencia'].value = this.dataPuntoVenta[0].STYPEFRECUENCY;
        this.e['estadoPV'].value = this.dataPuntoVenta[0].NSTATE;
        this.provincia();
        this.distrito();
        this.frecuencia();
        this.estadoPV();
        this.estadoSolicitud();
        if (this.infoRegistro.NTYPEREQUEST === '2') {
          this.listaCredit3();
        }
        if (this.infoRegistro.NTYPEREQUEST === '3') {
          this.listaCredit2();
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  solicitud() {
    this._spinner.show();
    const data: any = {
      S_TYPE: 'TYPE_REQUEST_CHANNEL',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.solicitud(data).subscribe(
      (response: ISolicitudResponse) => {
        this.dataSolicitud = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  documento() {
    this._spinner.show();
    const data: any = {
      S_TYPE: 'TYPEDOCUMENTS_CH',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.documento(data).subscribe(
      (response: IDocumentoResponse) => {
        this.dataDocumento = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // TIPO DE FRECUENCIA
  frecuencia() {
    this._spinner.show();
    const data: any = {
      S_TYPE: 'FRECUENCY',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.frecuencia(data).subscribe(
      (response: FrecuenciaResponse) => {
        this.dataFrecuencia = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // TIPO DE ESTADO DATOS - PUNTO DE VENTA
  estadoPV() {
    this._spinner.show();
    const data: any = {
      S_TYPE: 'STATUSUSER',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.status(data).subscribe(
      (response: StatusResponse) => {
        this.dataStatus = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // DEPARTAMENTO

  departamento() {
    this._spinner.show();
    const data: any = {
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.departamento(data).subscribe(
      (response: DepartamentoResponse) => {
        this.dataDepartamento = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  changeValueDepartamento(e: string): void {
    this.dataDistrito.PA_SEL_MUNICIPALITY = [];
    this.provincia2(e);
    this.formEvaluarA.get('department').setValue(e);
    this.formEvaluarA.get('province').setValue(null);
    this.formEvaluarA.get('district').setValue(null);
    this.iddepartamento = e;
  }

  changeValueDepartamentoPV(e: string): void {
    this.dataDistrito.PA_SEL_MUNICIPALITY = [];
    this.provincia2(e);
    this.formEvaluarA.get('departmentPV').setValue(e);
    this.formEvaluarA.get('provincePV').setValue(null);
    this.formEvaluarA.get('districtPV').setValue(null);
  }

  changeValueDepartamentoEPV(e: string): void {
    this.dataDistrito.PA_SEL_MUNICIPALITY = [];
    this.provincia2(e);
    this.formEditPV.get('departmentPV').setValue(e);
    this.formEditPV.get('provincePV').setValue(null);
    this.formEditPV.get('districtPV').setValue(null);
  }

  // PROVINCIA

  provincia() {
    const data: any = {
      P_NPROVINCE:
        this.iddepartamento ||
        this.respuestaData?.NPROVINCE ||
        this.dataPuntoVenta[0]?.NPROVINCE ||
        this.INFO?.NPROVINCE,
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.provincia(data).subscribe(
      (response: ProvinciaResponse) => {
        this.dataProvincia = response;
        this.e['province'].value = this.respuestaData?.NLOCAL;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  provincia2(e) {
    this.dataDistrito.PA_SEL_PROVINCE = [];
    const data: any = {
      P_NPROVINCE: e,
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.provincia(data).subscribe(
      (response: ProvinciaResponse) => {
        this.dataProvincia = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  changeValueProvincia(e: string): void {
    this.distrito2(e);
    this.idprovincia = e;
    this.formEvaluarA.get('province').setValue(e);
    this.formEvaluarA.get('district').setValue(null);
  }

  changeValueProvinciaPV(e: string): void {
    this.distrito2(e);
    this.formEvaluarA.get('provincePV').setValue(e);
    this.formEvaluarA.get('districtPV').setValue(null);
  }

  changeValueProvinciaEPV(e: string): void {
    this.distrito2(e);
    this.formEditPV.get('provincePV').setValue(e);
    this.formEditPV.get('districtPV').setValue(null);
  }

  // DISTRITO

  distrito() {
    const data: any = {
      P_NLOCAL:
        this.idprovincia ||
        this.respuestaData?.NLOCAL ||
        this.dataPuntoVenta[0]?.NLOCAL ||
        this.INFO?.NLOCAL,
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.distrito(data).subscribe(
      (response: DistritoResponse) => {
        this.dataDistrito = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  distrito2(e) {
    const data: any = {
      P_NLOCAL: e,
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.distrito(data).subscribe(
      (response: DistritoResponse) => {
        this.dataDistrito = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // CANAL

  canal() {
    const data: any = {
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.canal(data).subscribe(
      (response: CanalResponse) => {
        this.dataCanal = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  fcrReset(): void {
    this.formCreateRequest.patchValue({
      documentType: 2,
      documentNumber: null,
      businessName: null,
      department: null,
      province: null,
      district: null,
      cellphone: null,
      address: null,
      contact: null,
      email: null,
      channelType: null,
      startValidity: this.bsValueFin,
      endValidity: new Date(new Date().setDate(new Date().getDate() + 1)),
      stockProvider: null,
      distribution: 1,
      channelSale: {
        channelCode: null,
        distributionType: null,
        channelState: null,
        stateDate: null,
      },
      pointSale: {
        description: null,
        department: null,
        province: null,
        district: null,
        phone: null,
        address: null,
        contact: null,
        email: null,
        frecuency: {
          quantity: null,
          type: null,
        },
        state: null,
      },
      pointSales: [],
    });
  }

  changeValueSolicitud(e: string): void {
    this.fcrReset();
    this.isSearchedData = true;
    this.isSearchedData2 = false;
    this.isSearchedData4 = true;
    this.isSearchedData5 = false;
    this.isSearchedData6 = true;
    this.isSearchedData7 = false;
    this.isSearchedData8 = false;
    this.formCreateRequest.enable({
      emitEvent: false,
    });
    this.ff['documentType'].disable();
    if (e === '1') {
      this.isSearchedData = false;
      this.isSearchedData2 = true;
      this.ff['documentType'].disable();
      this.ff['documentNumber'].disable();
      this.ff['businessName'].disable();
      this.ff['department'].disable();
      this.ff['province'].disable();
      this.ff['district'].disable();
      this.ff['cellphone'].disable();
      this.ff['address'].disable();
      this.ff['contact'].disable();
      this.ff['email'].disable();
      this.ff['channelType'].disable();
      this.ff['startValidity'].disable();
      this.ff['endValidity'].disable();
      this.ff['stockProvider'].disable();
      this.ff['distribution'].disable();
    }
    if (e === '2') {
      this.isSearchedData2 = true;
      this.isSearchedData4 = false;
      this.isSearchedData6 = false;
      this.isSearchedData7 = true;
    }
    if (e === '3') {
      this.isSearchedData5 = true;
      this.isSearchedData4 = false;
      this.isSearchedData8 = true;
    }
  }

  searched() {
    this._vc.createEmbeddedView(this._modalSearch);
    this.fs['documentType'].setValue(2);
    this.documento();
  }

  buscarCanal() {
    this.channelSelected = null;
    this.isSearchedData3 = true;
    const req = {
      page: this.pageChannel,
      documentNumber: this.fs['documentNumber'].value || '',
      clientName: this.fs['businessName'].value || '',
    };

    this._spinner.show();
    this._GestionDeRegistrosService.searchChannel(req).subscribe(
      (response: ChannelModel) => {
        this.channels$ = response;
        this._spinner.hide();
      },
      (error) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  exportar() {
    this._spinner.show();
    // VERIFICAR
    if (this.f['estado'].value === 99) {
      this.f['estado'].value = '';
    }
    let urlForDownload3 =
      this.urlApi +
      `/ChannelRequest/ChannelRequestReport/ChannelRequestReport?`;
    const params: any = new HttpParams()
      .set(
        'P_DATEBEGIN',
        moment(this.f['fechaInicio'].value).format('YYYY-MM-DD') || ''
      )
      .set(
        'P_DATEEND',
        moment(this.f['fechaFin'].value).format('YYYY-MM-DD') || ''
      )
      .set('P_NREQUEST', this.f['numero_solicitud'].value || 0)
      .set('P_NSTATE', this.f['estado'].value)
      .set('P_NIDUSER', this.currentUser.id); // this.currentUser.id----- CAMBIAR
    params.updates.forEach((x: any) => {
      urlForDownload3 += `${x.param}=${x.value}&`;
    });
    urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
    this._utilsService.callApiUrl(urlForDownload3).subscribe(
      (res: any) => {
        const req = {
          archivo: res.archivo,
          nombre: `reporte-${new Date().getTime()}.xls`,
        };
        this._utilsService.downloadArchivo(req);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  nuevaSolicitud() {
    switch (+this.fcr['requestType'].value) {
      case 0:
      case 1:
        this.validateChannel();
        break;
      case 2:
        this.salePointHeaderRequest();
        break;
      case 3:
        this.validateSalePoint();
        break;
    }
  }

  private validateSalePoint(): void {
    const req = {
      requestType: this.fcr['requestType'].value,
      userId: this.currentUser['id'],
      channelId: this.fcr['channelSale'].get('channelCode').value,
      state: this.fcr['channelSale'].get('channelState').value,
      active: this.fcr['pointSale'].get('state').value,
    };
    this._GestionDeRegistrosService.validateSalePoint(req).subscribe(
      (response: any) => {
        if (!!response) {
          const f = (this.fcrSalePoint.get('frecuency') as FormGroup).controls;
          const payload = {
            ...this.fcrSalePoint.getRawValue(),
            channelRequestId: response,
            channelId: req.channelId,
            userId: this.currentUser['id'],
            sequence: this.salePointSelected.salePointId,
            frecuency: f['quantity'].value,
            frecuencyType: f['type'].value,
          };
          this.salePointMod(payload);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  private salePointMod(data): void {
    this._GestionDeRegistrosService.salePointMod(data).subscribe(
      (response: number) => {
        if (!!response) {
          this.message =
            'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
          this.fcrCreditLines.getRawValue().forEach((e) => {
            this.saveLineCreditIn(e);
          });
          this.closeModal();
          this._vc.createEmbeddedView(this._modalMessage);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  private validateChannel(): void {
    const req: IChannelDocumentValidate = {
      documentNumber: this.ff['documentNumber'].value,
      requestType: this.fcr['requestType'].value,
    };
    this._spinner.show();
    this._GestionDeRegistrosService.validar(req).subscribe(
      (res: any) => {
        this._spinner.hide();
        if (!+res.PA_VAL_DOC_REQ.P_COUNT) {
          console.dir(this.formCreateRequest.getRawValue());
          this.insertChannel()
              .then((rc: any) => {
                console.dir(rc);
              })
              .catch((err: any) => {
                console.error(err);
              });
        } else {
          this.message =
            'El número de documento ingresado ya ha sido registrado con anterioridad.';
          this._vc.createEmbeddedView(this._modalMessage);
        }
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  private salePointHeaderRequest(): void {
    const req = {
      requestType: this.fcr['requestType'].value,
      state: this.channelSelected.status,
      active: this.channelSelected.state == 'APROBADA' ? 1 : 0,
      userId: this.currentUser.id,
      channelId: this.channelSelected.request.id,
    };
    this._spinner.show();
    this._GestionDeRegistrosService.salePointHeaderRequest(req).subscribe(
      (response: any) => {
        if (!!+response) {
          this._vc.clear();
          this.message =
            'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
          setTimeout(() => {
            this._spinner.hide();
            this.buscar();
            this._vc.createEmbeddedView(this._modalMessage);
          }, 1000);
          this.fcrSpChannelReqId = response;
          this.selectedPointSaleDetail.items.forEach((e, i) => {
            const data = {
              ...e,
              channelRequestId: response,
              channelId: this.channelSelected.request.id,
              userId: this.currentUser.id,
              index: i + 1,
            };
            this.salePointRequest(data);
          });
          setTimeout(() => {
            this.listStockOfSalePoint.forEach((ee) => {
              this.saveLineCreditIn(ee);
            });
          }, 2000);
          /*  this.listStockOfSalePoint.forEach((e) => {
             this.saveLineCreditIn(e);
           }); */
        } else {
          this._spinner.hide();
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  private async salePointRequest(payload: any): Promise<any> {
    return this._GestionDeRegistrosService
               .salePointRequest(payload)
               .subscribe(
                 (response: any) => {
                 },
                 (error: HttpErrorResponse) => {
                   console.error(error);
                 }
               );
  }

  async insertChannel(): Promise<any> {
    const req = {
      ...this.formCreateRequest.getRawValue(),
      userId: this.currentUser.id,
    };
    return this._GestionDeRegistrosService.insertChannel(req).subscribe(
      (res: any) => {
        if (!!+res.NSTATUS) {
          this.fcrCreditLines.getRawValue().forEach((e: any) => {
            this.saveLineCredit(e);
          });

          const channelType: number = +this.fcr['channelType'].value;
          if (this.listChannelType.includes(channelType)) {
            const body: ActualizarCanalAsociado = {
              numeroDocumento: this.fcr['documentNumber'].value,
              codigoCanalAsociado: +this.fcr['mainChannel'].value,
            };
            this._GestionDeRegistrosService
                .actualizarCanalAsociado(body)
                .subscribe(() => {
                  this.message =
                    'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
                  this._vc.clear();
                  this.buscar();
                  this._vc.createEmbeddedView(this._modalMessage);
                });
          } else {
            this.message =
              'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
            this._vc.clear();
            this.buscar();
            this._vc.createEmbeddedView(this._modalMessage);
          }
        }
      },
      (err: HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  private saveLineCredit(payload: any): void {
    this._GestionDeRegistrosService.saveLineCredit(payload).subscribe();
  }

  private saveLineCreditIn(payload: any): void {
    this._GestionDeRegistrosService.saveLineCreditIn(payload).subscribe();
  }

  // PROVEEDOR DE STOCK
  channelFayhers() {
    this._spinner.show();
    const data: any = {
      P_NTYPECHANNEL: this.respuestaData?.NTYPECHANNEL,
      _: 1638808674731,
    };
    this._GestionDeRegistrosService.ProveedorStock(data).subscribe(
      (response: IChannelFathersResponse) => {
        this.dataChannelF = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // ESTADO EVALUAR SOLICITUD
  estadoSolicitud() {
    this._spinner.show();
    const data: any = {
      P_NIDUSER: 62, // this.currentUser.id,
      _: new Date().getTime(),
    };
    this._GestionDeRegistrosService.EstadoSolicitud(data).subscribe(
      (response: IEstadoEResponse) => {
        this.dataEstadoEV = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  // DATOS LINEA DE CREDITO
  datosLinea() {
    this._spinner.show();
    const data: any = {
      P_NIDCHANNELREQUEST: this.nSolicitud,
    };
    this._GestionDeRegistrosService.DatosLinea(data).subscribe(
      (response: IDatosLineaEResponse) => {
        this.dataDatosLinea = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  listaCredit() {
    const data: any = {
      P_NIDCHANNELREQUEST: this.nSolicitud,
    };
    this._GestionDeRegistrosService.listaPapeles(data)
        .subscribe((response: TipoPapelesModel) => {
          this.listaPapeles = response;
        });
  }

  listaCredit2() {
    const data: any = {
      P_NIDCHANNELREQUEST: this.nSolicitud,
    };
    this._GestionDeRegistrosService.listaPapeles2(data)
        .subscribe((response: TipoPapelesModel) => {
          this.listaPapeles = response;
        });
  }

  archivos(e: any): void {
    this.aFiles.clear();
    e.forEach((val) => {
      this.aFiles.push(this._fb.group(val));
    });
  }

  setFcrFiles(e: any): void {
    this.fcrFiles.clear();
    e.forEach((val) => {
      this.fcrFiles.push(this._fb.group(val));
    });
  }

  setFcrCreditLines(e: any): void {
    this.fcrCreditLines.clear();
    e.forEach((val) => {
      this.fcrCreditLines.push(
        this._fb.group({
          policyType: val.papelType,
          minStock: val.stockMin,
          maxStock: val.stockMax,
          currentStock: val.stockAct,
          documentNumber: this.fcr['documentNumber'].value,
          userId: this.currentUser.id,
        })
      );
    });
  }

  listaCreditLine(e: any, i: any): void {
    this.lineFiles.clear();
    e.forEach((val) => {
      this.lineFiles.push(
        this._fb.group({
          index: i + 1,
          channelCode: this.e['codigo'].value,
          policyType: val.papelType,
          minStock: val.stockMin,
          maxStock: val.stockMax,
          currentStock: val.stockAct,
          userId: this.currentUser.id,
          documentNumber: this.e['documentNumber'].value,
        })
      );
    });
  }

  listaCreditLine2(e: any): void {
    this.lineFiles2.clear();
    e.forEach((val) => {
      this.lineFiles2.push(
        this._fb.group({
          sequence: this.e['estadoPV'].value,
          nchannel: this.infoRegistro?.NIDREQUEST,
          policyType: val.papelType,
          minStock: val.stockMin,
          maxStock: val.stockMax,
          currentStock: val.stockAct,
          userId: this.currentUser.id,
        })
      );
    });
  }

  listaCreditLine3(e: any): void {
    this.lineFilesStock.clear();
    e.forEach((val) => {
      this.lineFilesStock.push(
        this._fb.group({
          index: this.indexSelected,
          channelCode: this.infoRegistro?.NIDREQUEST,
          policyType: val.papelType,
          minStock: val.stockMin,
          maxStock: val.stockMax,
          currentStock: val.stockAct,
          userId: this.currentUser.id,
        })
      );
    });
  }

  datosA() {
    this._spinner.show();
    const data: any = {
      P_NIDREQUESTCHANNEL: this.nSolicitud,
    };
    this._GestionDeRegistrosService.respuestaDataAdjunto(data).subscribe(
      (response: IDataAdjuntoResponse) => {
        this.dataAdjunto = response.PA_SEL_DATA_ATTACHMENT;
        this.aFiles.clear();
        this.dataAdjunto?.forEach((e) => {
          this.aFiles.push(
            this._fb.group({
              fileType: [e.SEXTENSION],
              file: [null],
              nombre: [e.SFILENAME],
              disable: [false],
              urlArchivo: [e.SROUTE],
            })
          );
        });
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  fcrEdit(): void {
    this.enableAttachments = true;
    this.enableCreditLines = true;
    this.enableInputsCreditLines = true;
    this.showButtonEdit = false;
    this.formCreateRequest.enable({
      emitEvent: false,
    });
    this.fcr['distribution'].disable();
    this.fcr['documentType'].disable({
      emitEvent: false,
    });
  }

  editar() {
    this.btnEditar = false;
    this.showButton = true;
    this.show = true;
    this.enableInputs = true;

    if (this.listChannelType.includes(+this.e['channelType'].value)) {
      if (this.e['mainChannel']) {
        this.obtenerListaMainChannel(this.e['mainChannel'].value, false, false);
      } else {
        this.obtenerListaMainChannel(this.channelDefault, false, false);
      }
    }

    // DATOS BASICOS
    // this.e['documentNumber'].enable();
    this.e['businessName'].enable();
    this.e['name'].enable();
    this.e['lastname1'].enable();
    this.e['lastname2'].enable();
    this.e['department'].enable();
    this.e['province'].enable();
    this.e['district'].enable();
    this.e['cellphone'].enable();
    this.e['address'].enable();
    this.e['contact'].enable();
    this.e['email'].enable();
    this.e['channelType'].enable();

    // DATOS COMPLEMENTARIOS
    this.e['startValidity'].enable();
    this.e['endValidity'].enable();
    this.e['stockProvider'].enable();

    // DATOS DE PUNTO DE VENTA
    this.e['descripcion'].enable();
    this.e['departmentPV'].enable();
    this.e['provincePV'].enable();
    this.e['districtPV'].enable();
    this.e['celular'].enable();
    this.e['direccion'].enable();
    this.e['contacto'].enable();
    this.e['correo'].enable();
    this.e['numeroF'].enable();
    this.e['frecuencia'].enable();
    this.e['estadoPV'].enable();
  }

  selectChannel(data: any): void {
    this.channelSelected = data;
  }

  selectedChannel(data): boolean {
    return JSON.stringify(this.channelSelected) == JSON.stringify(data);
  }

  aceptSelectChannel(): void {
    switch (+this.fcr['requestType'].value) {
      case 1:
        this.showButtonEdit = true;
        this.showRequestType = false;
        this.formCreateRequest.disable();
        const payload = {
          requestType: 1,
          P_NIDREQUESTCHANNEL: this.channelSelected.request.id,
        };
        this._GestionDeRegistrosService.respuestaData0(payload).subscribe(
          (response: any) => {
            const res: ChannelInfoModel = new ChannelInfoModel(response);

            this.fcr['documentNumber'].setValue(res.documentNumber);
            this.fcr['businessName'].setValue(res.clientName);

            this.fcr['department'].setValue(res.department, {
              eventEmit: false,
            });
            this.fcr['province'].setValue(res.province, {
              eventEmit: false,
            });
            this.fcr['district'].setValue(res.district, {
              eventEmit: false,
            });

            this.provinces$ = this.departments$.find(
              (x) => +x.id == +this.fcr['department'].value
            ).provincias;

            this.districts$ = this.provinces$.find(
              (x) => +x.idProvincia == +this.fcr['province'].value
            ).distritos;

            this.fcr['cellphone'].setValue(res.phone);
            this.fcr['address'].setValue(res.address);
            this.fcr['contact'].setValue(res.contact);
            this.fcr['email'].setValue(res.email);
            this.fcr['channelType'].setValue(res.channelType);
            this.fcr['startValidity'].setValue(
              moment(res.startDateValidity, 'MM/DD/YYYY')?.format(
                'DD/MM/YYYY'
              ) || null
            );
            this.fcr['endValidity'].setValue(
              moment(res.endDateValidity, 'MM/DD/YYYY')?.format('DD/MM/YYYY') ||
              null
            );
            this.fcr['stockProvider'].setValue(res.providerStock);
            this.fcr['distribution'].setValue(res.distributionType?.toString());
            this._vc.remove();
          },
          (error: HttpErrorResponse) => {
            console.error(error);
          }
        );
        const payloadAdjuntos = {
          P_NIDREQUESTCHANNEL: this.channelSelected.request.id,
        };
        this._GestionDeRegistrosService
            .respuestaDataAdjunto(payloadAdjuntos)
            .subscribe(
              (response: any) => {
                this.attachmentsData = response.PA_SEL_DATA_ATTACHMENT;

                this.fcrFiles.clear();
                this.attachmentsData?.forEach((e) => {
                  this.fcrFiles.push(
                    this._fb.group({
                      fileType: [e.SEXTENSION],
                      file: [null],
                      nombre: [e.SFILENAME],
                      disable: [false],
                      urlArchivo: [e.SROUTE],
                    })
                  );
                });
              },
              (error: HttpErrorResponse) => {
                console.error(error);
              }
            );
        this._GestionDeRegistrosService
            .creditLinesRead(this.channelSelected.request.id)
            .subscribe(
              (response: any) => {
                this.creditLinesData = { items: response || [] };
                this.fcrCreditLines.clear();
                this.creditLinesData?.items?.forEach((e) => {
                  this.fcrCreditLines.push(
                    this._fb.group({
                      ...e,
                      documentNumber: this.fcr['documentNumber'].value,
                      userId: this.currentUser.id,
                    })
                  );
                });
              },
              (error: HttpErrorResponse) => {
                console.error(error);
              }
            );
        break;
      case 2:
        this.pointSaleDetail().then(() => {
          const control = this.fcr['channelSale'];
          control.get('channelCode').setValue(this.channelSelected?.request.id);
          control
            .get('distributionType')
            .setValue(
              +this.channelSelected?.distribution === 2
                ? 'Punto de Venta'
                : 'Canal de Venta'
            );
          control.get('channelState').setValue(this.channelSelected?.state);
          control.get('stateDate').setValue(this.channelSelected?.date);
          control.disable();
          this._vc.remove();
        });
        break;
    }
  }

  async pointSaleDetail(): Promise<any> {
    this._spinner.show();
    return this._GestionDeRegistrosService
               .pointSaleDetail(this.channelSelected.request.id.toString())
               .subscribe(
                 (response: PointSaleDetailModel) => {
                   this.selectedPointSaleDetail = response;

                   this.showRequestType = false;

                   response.items.forEach((e, i) => {
                     const req = {
                       index: i,
                       channelSale: this.channelSelected?.request.id,
                       pointSale: e.id,
                     };
                     this.pointSaleCreditLines(req);
                   });

                   this._spinner.hide();
                 },
                 (error: HttpErrorResponse) => {
                   console.error(error);
                 }
               );
  }

  private pointSaleCreditLines(data: any): void {
    this._GestionDeRegistrosService.pointSaleCreditLines(data).subscribe(
      (response: any) => {
        this.selectedPointSaleDetail.items[data.index].creditLines =
          response?.PA_READ_LINE_CREDIT_SALE_POINT || [];
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  fileChange() {
    if (this.e['codigo'].value === null) {
      this.message =
        'Debe seleccionar un canal antes de agregar un punto de venta.';
      this._vc.createEmbeddedView(this._modalMessage);
    } else {
    }
  }

  evaluar() {
    this._spinner.show();
    if (this.e['estadoE'].value === null) {
      this.e['estadoE'].value = '';
    }
    if (this.e['observacion'].value === null) {
      this.e['observacion'].value = '';
    }
    const data: any = {
      idcanal: this.nSolicitud,
      idestado: this.e['estadoE'].value,
      iduser: this.currentUser.id,
      obser: this.e['observacion'].value,
    };
    this._GestionDeRegistrosService.evaluar(data).subscribe(
      (): void => {
        this._spinner.hide();

        if (this.e['estadoE'].value === '') {
          this.message = 'Debe seleccionar un estado para evaluar.';
          this._vc.createEmbeddedView(this._modalMessage);
          return;
        }

        this.message =
          'Se registró correctamente la solicitud.';
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this.buscar();
      },
      (): void => {
        this._spinner.hide();

        this.message =
          'Se registró correctamente la solicitud.';
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this.buscar();
      }
    );
  }

  agregarPV() {
    if (this.e['codigo'].value === null) {
      this.message =
        'Debe seleccionar un canal antes de agregar un punto de venta.';
      this._vc.createEmbeddedView(this._modalMessage);
    } else {
      this.formCreatePV.reset();
      this._vc.createEmbeddedView(this._modalCreatePV);
      this.departamento();
      this.provincia();
      this.distrito();
      this.frecuencia();
      this.estadoPV();
    }
  }

  get fcrSalePoint(): FormGroup {
    return this.fcr['pointSale'] as FormGroup;
  }

  fcrModalSalePoint(type: number, _?: any, index?: number): void {
    this.typeModalSalePoint = type;
    this.indexSalePoint = index;

    this.provinces$ = [];
    this.districts$ = [];
    const gc = this.fcrSalePoint.controls;
    const fc = (gc['frecuency'] as FormGroup).controls;
    if (_) {
      // SALE POINT CONTROLS
      gc['description'].setValue(_.description);
      gc['department'].setValue(_.department, {
        emitEvent: false,
      });
      gc['province'].setValue(_.province, {
        emitEvent: false,
      });
      gc['district'].setValue(_.district);

      gc['phone'].setValue(_.phone);

      gc['address'].setValue(_.address);

      gc['contact'].setValue(_.contact);
      gc['contact'].setValidators(Validators.required);
      gc['contact'].updateValueAndValidity();

      gc['email'].setValue(_.email);
      gc['state'].setValue(_?.state ?? null);

      // FRECUENCY
      fc['quantity'].setValue(_.frecuency);
      fc['type'].setValue(_.frecuencyType);

      this.changeDepartmentFcrSp(gc['department'].value);
      this.changeProvinceFcrSp(gc['province'].value);
    }
    gc['description'].setValidators(Validators.required);
    gc['description'].updateValueAndValidity();
    gc['department'].setValidators(Validators.required);
    gc['department'].updateValueAndValidity({
      emitEvent: false,
    });
    gc['province'].setValidators(Validators.required);
    gc['province'].updateValueAndValidity({
      emitEvent: false,
    });
    gc['district'].setValidators(Validators.required);
    gc['district'].updateValueAndValidity({
      emitEvent: false,
    });
    gc['phone'].setValidators([
      Validators.pattern(/^[\d]*$/),
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(9),
    ]);
    gc['phone'].updateValueAndValidity({
      emitEvent: false,
    });
    gc['address'].setValidators(Validators.required);
    gc['address'].updateValueAndValidity();
    gc['email'].setValidators([
      Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
      Validators.required,
    ]);
    gc['email'].updateValueAndValidity();
    fc['quantity'].setValidators(Validators.required);
    fc['quantity'].updateValueAndValidity();

    fc['type'].setValidators(Validators.required);
    fc['type'].updateValueAndValidity();
    this.fcrSalePoint.setValidators(Validators.required);
    this._vc.createEmbeddedView(this._modalFcrSalePoint);
  }

  fcrAddSalePoint(): void {
    const fcr = (this.fcr['pointSale'] as FormGroup).getRawValue();

    const data = {
      address: fcr.address,
      contact: fcr.contact,
      department: fcr.department,
      description: fcr.description,
      district: fcr.district,
      email: fcr.email,
      frecuency: fcr.frecuency.quantity,
      frecuencyType: fcr.frecuency.type,
      id: this.fcrSpChannelReqId,
      phone: fcr.phone,
      province: fcr.province,
      state: fcr.state,
    };
    switch (+this.typeModalSalePoint) {
      case 1:
        this.selectedPointSaleDetail.items.push(data);
        break;
      case 2:
        this.selectedPointSaleDetail.items[this.indexSalePoint] = data;
        break;
    }
    this._vc.remove();
    this.fcr['pointSale'].reset();
    const gc = this.fcrSalePoint.controls;
    const fc = (gc['frecuency'] as FormGroup).controls;
    Object.keys(gc).forEach((e) => {
      gc[e].clearValidators();
      gc[e].updateValueAndValidity();
    });
    Object.keys(fc).forEach((e) => {
      fc[e].clearValidators();
      fc[e].updateValueAndValidity();
    });
  }

  dropSalePoint(index: number): void {
    this.selectedPointSaleDetail.items =
      this.selectedPointSaleDetail.items.filter(
        (x) => x !== this.selectedPointSaleDetail.items[index]
      );
  }

  proveedorStock() {
    const data: any = {
      channelType: this.e['channelType'].value || this.tipoCanal,
    };

    this._GestionDeRegistrosService.proveedorStock(data).subscribe(
      (response: ProveedorStockResponse) => {
        this.listproveedorStock = response;
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  guardar() {
    this._spinner.show();
    if (this.e['name'].value === null) {
      this.e['name'].value = '';
    }
    if (this.e['lastname1'].value === null) {
      this.e['lastname1'].value = '';
    }
    if (this.e['lastname2'].value === null) {
      this.e['lastname2'].value = '';
    }
    if (this.e['stockProvider'].value === null) {
      this.e['stockProvider'].value = '';
    }
    if (this.e['startValidity'].value === null) {
      this.e['startValidity'].value = '';
    }
    if (this.e['endValidity'].value === null) {
      this.e['endValidity'].value = '';
    }
    if (
      this.infoRegistro.NTYPEREQUEST === '0' ||
      this.infoRegistro.NTYPEREQUEST === '1'
    ) {
      let businessName: string = this.e['businessName'].value;
      const iniciales =
        this.e['documentNumber'].value?.length > 0
          ? this.e['documentNumber'].value.slice(0, 2)
          : 0;
      if (iniciales.toString() == '10') {
        businessName = `${this.e['lastname1'].value} ${this.e['lastname2'].value}, ${this.e['name'].value}`;
      }
      const data: any = {
        nsolicitud: this.nSolicitud,
        documento: this.e['documentNumber'].value,
        cliente: businessName,
        nombre: this.e['name'].value,
        apellidop: this.e['lastname1'].value,
        apellidom: this.e['lastname2'].value,
        provincia: this.e['department'].value,
        local: this.e['province'].value,
        muni: this.e['district'].value,
        celular: this.e['cellphone'].value,
        direccion: this.e['address'].value,
        contacto: this.e['contact'].value,
        email: this.e['email'].value,
        fechai: this.e['startValidity'].value,
        fechaf: this.e['endValidity'].value,
        nproStock: this.e['stockProvider'].value,
        ndistribution: this.e['distribution'].value,
        channelType: this.e['channelType'].value,
        attachments: this.isSOATSelected ? this.e['attachmentse'].value || this.dataAdjunto : [],
      };

      this._GestionDeRegistrosService.update(data).subscribe(
        (): void => {
          if (this.isSOATSelected) {
            this.lineFiles.getRawValue().forEach((e: any) => {
              this.saveLineCredit(e);
            });
          }

          const channelType: number = +this.e['channelType'].value;

          if (this.listChannelType.includes(channelType)) {
            const body: ActualizarCanalAsociado = {
              numeroDocumento: this.e['documentNumber'].value,
              codigoCanalAsociado: +this.e['mainChannel'].value,
            };

            this._GestionDeRegistrosService
                .actualizarCanalAsociado(body)
                .subscribe((): void => {
                  this._spinner.hide();
                  this.message =
                    'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
                  this._vc.clear();
                  this._vc.createEmbeddedView(this._modalMessage);
                  this.buscar();
                });
          } else {
            this._spinner.hide();
            this.message =
              'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
            this._vc.clear();
            this._vc.createEmbeddedView(this._modalMessage);
            this.buscar();
          }

          const products: ChannelInfo[] = this.branchProductList.map((item) => ({
            idRamo: item.branchId,
            idProducto: item.productId,
            codigoUsuario: this.currentUser['id'],
            codigoCanal: this.infoRegistro?.NIDREQUEST,
            numeroDocumento: this.e['documentNumber'].value
          }));
          this.newRequestService.saveProducts({ crearCanal: products }).subscribe();
        },
        (error: any): void => {
          console.error(error);
          this._spinner.hide();
        }
      );
    }
    if (this.infoRegistro.NTYPEREQUEST === '2') {
      this.delete();
    }
    if (this.infoRegistro.NTYPEREQUEST === '3') {
      const data: any = {
        nsolicitud: this.nSolicitud,
        nichannel: this.infoRegistro?.NIDREQUEST,
        description: this.e['descripcion'].value,
        provincia: this.e['departmentPV'].value,
        local: this.e['provincePV'].value,
        muni: this.e['districtPV'].value,
        celular: this.e['celular'].value,
        direccion: this.e['direccion'].value,
        contacto: this.e['contacto'].value,
        correo: this.e['correo'].value,
        frecuencia: this.e['numeroF'].value,
        typefrecuencia: this.e['frecuencia'].value,
        sequence: this.e['estadoPV'].value,
      };
      this._GestionDeRegistrosService.update2(data).subscribe(
        (response: any) => {
          this.lineFiles.getRawValue().forEach((e: any) => {
            this.saveLineCreditIn(e);
          });
          this.message =
            'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
          this._vc.clear();
          this._vc.createEmbeddedView(this._modalMessage);
          this.buscar();
          this._spinner.hide();
        },
        (error: any) => {
          console.error(error);
          this._spinner.hide();
        }
      );
    }
  }

  private lineCredit(payload: any): void {
    this._GestionDeRegistrosService.lineCredit(payload).subscribe();
  }

  savePV() {
    this.dataPV?.PA_READ_DET_REQ_SALEPOINT.forEach((x, index) => {
      const data: any = {
        nsolicitud: this.nSolicitud,
        nichannel: this.infoRegistro?.NIDREQUEST,
        description: x.SDESCRIPTION,
        provincia: x.NPROVINCE,
        local: x.NLOCAL,
        muni: x.NMUNICIPALITY,
        celular: x.SPHONE,
        direccion: x.SADDRESS,
        contacto: x.SCONTACT,
        correo: x.SMAIL,
        frecuencia: x.SFRECUENCY,
        typefrecuencia: x.STYPEFRECUENCY,
        sequence: index + 1,
      };
      this._GestionDeRegistrosService.guardarSalePoint(data).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.error(error);
          this._spinner.hide();
        }
      );
    });
  }

  eliminar(index: number): void {
    this.dataPV.PA_READ_DET_REQ_SALEPOINT =
      this.dataPV.PA_READ_DET_REQ_SALEPOINT.filter(
        (x) => x !== this.dataPV.PA_READ_DET_REQ_SALEPOINT[index]
      );
  }

  editarPV(data, index: number) {
    this._spinner.show();
    this.indexPV = index;
    this.INFO = data;

    this.editpv['descripcion'].value = this.INFO?.SDESCRIPTION;
    this.editpv['departmentPV'].value = this.INFO?.NPROVINCE;
    this.editpv['provincePV'].value = this.INFO?.NLOCAL;
    this.editpv['districtPV'].value = this.INFO?.NMUNICIPALITY;
    this.editpv['celularPV'].value = this.INFO?.SPHONE;
    this.editpv['direccion'].value = this.INFO?.SADDRESS;
    this.editpv['contacto'].value = this.INFO?.SCONTACT;
    this.editpv['correo'].value = this.INFO?.SMAIL;
    this.editpv['numeroF'].value = this.INFO?.SFRECUENCY;
    this.editpv['frecuencia'].value = this.INFO?.STYPEFRECUENCY;
    this.editpv['estadoPV'].value = this.INFO?.NSTATE;
    this.departamento();
    this.provincia();
    this.distrito();
    this._vc.createEmbeddedView(this._modalEditPV);
    this._spinner.hide();
  }

  agregarStock(data, i: number): void {
    this.show = true;
    this.indexSelected = i;
    this.indexSalePointSelected = i - 1;
    this.idSalePoint = data.NIDSALEPOINT;

    this.lineFilesStock.clear();
    const find = this.creditLinePointSale.find(
      (x) => +x.pointSale == +this.idSalePoint
    );
    if (!find) {
      this.creditLinePointSale[this.indexSalePointSelected].itemsPV?.forEach(
        (e) => {
          this.lineFilesStock.push(
            this._fb.group({
              index: this.indexSelected,
              channelCode: this.infoRegistro?.NIDREQUEST,
              policyType: e.policyType,
              minStock: e.minStock,
              maxStock: e.maxStock,
              currentStock: e.currentStock,
              userId: this.currentUser.id,
            })
          );
        }
      );
    } else {
      find?.itemsPV?.forEach((e) => {
        this.lineFilesStock.push(
          this._fb.group({
            index: this.indexSelected,
            channelCode: this.infoRegistro?.NIDREQUEST,
            policyType: e.policyType,
            minStock: e.minStock,
            maxStock: e.maxStock,
            currentStock: e.currentStock,
            userId: this.currentUser.id,
          })
        );
      });
    }

    this.creditLinesData = {
      items: this.lineFilesStock.getRawValue() || [],
    };
    this._vc.createEmbeddedView(this._modalAgregarStock);
  }

  showModalFcrStock(data, i: number): void {
    this.creditLinesData = {
      items: this.stockOfSalePoint(i),
    };

    this.indexSalePointSelected = i;
    this.indexSelected = i;
    this._vc.createEmbeddedView(this._modalFcrStock);
  }

  dataFcrCreditLine(e: any) {
    this.fcrCreditLines.clear();
    e?.forEach((el) => {
      this.fcrCreditLines.push(
        this._fb.group({
          index: [this.indexSalePointSelected],
          channelCode: [this.channelSelected.request.id],
          policyType: [el.papelType],
          minStock: [el.stockMin],
          maxStock: [el.stockMax],
          currentStock: [el.stockAct],
          userId: [this.currentUser.id],
        })
      );
    });
  }

  stockOfSalePoint(i): any[] {
    return this.listStockOfSalePoint?.filter((x) => +x?.index === +i) || [];
  }

  stockValidar(i): any[] {
    return this.listStockValidar?.filter((x) => +x?.index === +i) || [];
  }

  aceptStockSalePoint() {
    this.listStockOfSalePoint = this.listStockOfSalePoint.filter(
      (x) => +x.index !== +this.indexSelected
    );
    this.fcrCreditLines.getRawValue().forEach((e) => {
      this.listStockOfSalePoint.push(e);
    });
    this.closeLastModal();
  }

  cancelModalStock(): void {
    this.closeLastModal();
    this.fcrCreditLines.clear();
  }

  aceptarPV() {
    this.dataPV?.PA_READ_DET_REQ_SALEPOINT.push({
      NIDSALEPOINT: this.dataPV?.PA_READ_DET_REQ_SALEPOINT.NIDSALEPOINT + 1,
      NPROVINCE: this.pv['departmentPV'].value,
      NLOCAL: this.pv['provincePV'].value,
      NMUNICIPALITY: this.pv['districtPV'].value,
      NSTATE: this.pv['estadoPV'].value,
      SADDRESS: this.pv['direccion'].value,
      SCONTACT: this.pv['contacto'].value,
      SDESCRIPTION: this.pv['descripcion'].value,
      SFRECUENCY: this.pv['numeroF'].value,
      SMAIL: this.pv['correo'].value,
      SPHONE: this.pv['celularPV'].value,
      STYPEFRECUENCY: this.pv['frecuencia'].value,
    });
    this.creditLinePointSale.push({
      pointSale: 0,
      itemsPV: [],
    });
    this._vc.remove();
  }

  aceptarEditPV() {
    this.dataPV.PA_READ_DET_REQ_SALEPOINT[this.indexPV] = {
      NIDSALEPOINT: this.dataPV?.PA_READ_DET_REQ_SALEPOINT.NIDSALEPOINT + 1,
      NPROVINCE: this.editpv['departmentPV'].value,
      NLOCAL: this.editpv['provincePV'].value,
      NMUNICIPALITY: this.editpv['districtPV'].value,
      NSTATE: this.editpv['estadoPV'].value,
      SADDRESS: this.editpv['direccion'].value,
      SCONTACT: this.editpv['contacto'].value,
      SDESCRIPTION: this.editpv['descripcion'].value,
      SFRECUENCY: this.editpv['numeroF'].value,
      SMAIL: this.editpv['correo'].value,
      SPHONE: this.editpv['celularPV'].value,
      STYPEFRECUENCY: this.editpv['frecuencia'].value,
    };
    this._vc.remove();
  }

  delete() {
    this._spinner.show();
    const data: any = {
      nsolicitud: this.nSolicitud,
    };
    this._GestionDeRegistrosService.deleteSalePoint(data).subscribe(
      (response: any) => {
        if (response.NSTATUS == 1) {
          this.savePV();
          this.message =
            'Se registró correctamente la solicitud, los aprobadores serán notificados en breve.';
          const creditLines = new Array();
          this.creditLinePointSale.forEach((e, i) => {
            e.itemsPV.forEach((ee) => {
              ee.index = e?.index || i + 1;
              ee.channelCode = +this.infoRegistro?.NIDREQUEST;
              ee.userId = +this.currentUser.id;
              creditLines.push(ee);
            });
          });
          setTimeout(() => {
            creditLines.forEach((e) => {
              this.saveLineCreditIn(e);
            });
          }, 2000);
          setTimeout(() => {
            this._spinner.hide();
            this._vc.clear();
            this._vc.createEmbeddedView(this._modalMessage);
            this.buscar();
          }, 1000);
          return;
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  aceptarStock() {
    this.listStockValidar = this.listStockValidar.filter(
      (x) => +x.index !== +this.indexSalePointSelected
    );
    if (!this.idSalePoint) {
      this.creditLinePointSale[this.indexSalePointSelected].itemsPV =
        this.lineFilesStock.getRawValue();
    } else {
      this.creditLinePointSale.find(
        (x) => +x.pointSale == +this.idSalePoint
      ).itemsPV = this.lineFilesStock.getRawValue();
    }

    this.lineFilesStock.getRawValue().forEach((e) => {
      this.listStockValidar.push(e);
    });
    this._vc.remove();
  }

  showModalFcrSearchSalePoint(): void {
    this.formSearchSalePoint.reset();
    this.fssp['documentType'].setValue(1);
    this.salePointSelected = null;
    this.salePoints$ = new SalePointModel();
    this._vc.createEmbeddedView(this._modalSearchSalePoint);
  }

  searchSalePoint(reset: boolean): void {
    if (reset) {
      this.salePointPage = 0;
    }
    this.salePointSelected = null;
    this._spinner.show();
    const payload = {
      ...this.formSearchSalePoint.getRawValue(),
      currentPage: this.salePointPage,
    };
    this._GestionDeRegistrosService.salePoints(payload).subscribe(
      (response: SalePointModel) => {
        this.salePoints$ = response;
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  selectSalePoint(data: ISalePoint): void {
    this.salePointSelected = data;
  }

  acepSalePoint(): void {
    if (!!this.salePointSelected) {
      this.showRequestType = false;
      this.formCreateRequest.disable({
        emitEvent: false,
      });
      this.fcr['channelSale']
        .get('channelCode')
        .setValue(this.salePointSelected.channelId);
      this.fcr['channelSale']
        .get('distributionType')
        .setValue('PUNTO DE VENTA');
      this.fcr['channelSale']
        .get('channelState')
        .setValue(this.salePointSelected.state);
      this.fcr['channelSale']
        .get('stateDate')
        .setValue(this.salePointSelected.dateUpdate);
      const cps = (this.fcr['pointSale'] as FormGroup).controls;
      cps['description'].setValue(this.salePointSelected.description);
      cps['department'].setValue(this.salePointSelected.department);
      cps['province'].setValue(this.salePointSelected.province);
      cps['district'].setValue(this.salePointSelected.district);
      cps['phone'].setValue(this.salePointSelected.phone);
      cps['address'].setValue(this.salePointSelected.address);
      cps['contact'].setValue(this.salePointSelected.contact);
      cps['email'].setValue(this.salePointSelected.email);
      cps['state'].setValue(this.salePointSelected.state);
      cps['frecuency']
        .get('quantity')
        .setValue(this.salePointSelected.frecuency);
      cps['frecuency']
        .get('type')
        .setValue(this.salePointSelected.frecuencyType);
      this.showButtonEdit = true;
      const payload = {
        channelId: this.salePointSelected.channelId,
        salePointId: this.salePointSelected.salePointId,
      };
      this._spinner.show();
      this._GestionDeRegistrosService.creditLinesOfSalePoint(payload).subscribe(
        (response: any) => {
          this.creditLinesData = { items: response };
          response.forEach((el, i) => {
            this.fcrCreditLines.push(
              this._fb.group({
                index: [i + 1],
                channelCode: [this.salePointSelected.channelId],
                policyType: [el.papelType],
                minStock: [el.stockMin],
                maxStock: [el.stockMax],
                currentStock: [el.stockAct],
                userId: [this.currentUser['id']],
              })
            );
          });
          this._spinner.hide();
          this._vc.remove();
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this._spinner.hide();
          this._vc.remove();
        }
      );
    }
  }

  bulkLoad(e: any) {
    if (e) {
      this._GestionDeRegistrosService.bulkLoad(e).subscribe((response: any) => {
        this.bulkLoadData$ = response;
        if (!!response.DataLoadMasive.ListSalePoints.length) {
          this._vc.createEmbeddedView(this._modalBulkLoad);
        }
      });
    }
  }

  listaCredit3() {
    this.creditLinePointSale = [];
    this.dataPV?.PA_READ_DET_REQ_SALEPOINT.forEach((x, index) => {
      const data: any = {
        index: index + 1,
        channelSale: this.infoRegistro?.NIDREQUEST,
        pointSale: x.NIDSALEPOINT,
      };
      this._GestionDeRegistrosService.listaLineaCredito2(data)
          .subscribe((response: ListaPapeles) => {
            this.creditLinePointSale.push(response);
            this.listaLineaCredito = response;
          });
    });
  }

  haveLineCredits(pointSale: any, index: number): boolean {
    if (!pointSale) {
      return !!this.creditLinePointSale[index].itemsPV.length;
    }
    const find = this.creditLinePointSale?.find(
      (x) => +x.pointSale == +pointSale
    );
    return !!find?.itemsPV.length;
  }

  onChangeBhanchFormList(event: any[]) {
    this.branchProductList = event;
  }

  onChangeIsSoatSelected(event: boolean): void {
    this.isSOATSelected = event;
  }
}
