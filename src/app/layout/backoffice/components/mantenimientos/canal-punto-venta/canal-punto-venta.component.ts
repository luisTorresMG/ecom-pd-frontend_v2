import { Component, OnInit, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ChannelTypesModel } from '../../../models/mantenimientos/channel-types.model';
import { ChannelsModel } from '../../../models/mantenimientos/channels.model';
import { MantenimientosService } from '../../../services/mantenimientos/mantenimientos.service';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { IDepartamentoModel, IDistritoModel, IProvinciaModel, ParametersResponse } from '@root/shared/models/ubigeo/parameters.model';
import { IBuscarCanalRequest } from '../../../interfaces/buscar-canal.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChannelResultModel } from '../../../models/mantenimientos/channel-result.model';
import { PointSaleResultModel } from '../../../models/mantenimientos/point-sale-result.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { SemaforoPointSaleModel } from '../../../models/mantenimientos/semaforoPointSale.model';
import { AppConfig } from '@root/app.config';
import { HttpParams } from '@angular/common/http';
import { DocumentRequest, DocumentResponse, DocumentFormatResponse } from '@shared/models/document/document.models';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-canal-punto-venta',
  templateUrl: './canal-punto-venta.component.html',
  styleUrls: ['./canal-punto-venta.component.scss'],
})
export class MantCanalPuntoVentaComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  urlApi: string;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  form: FormGroup;
  formChannel: FormGroup;
  formPointSale: FormGroup;
  formState: FormGroup;

  resultChannels$: ChannelResultModel;
  pointSalesOfChannel$: PointSaleResultModel;
  dataSemaforo$: any;

  channels$: ChannelsModel;
  channelTypes$: ChannelTypesModel;

  parameters$: ParametersResponse;

  departments$: Array<IDepartamentoModel>;
  provinces$: Array<IProvinciaModel>;
  districts$: Array<IDistritoModel>;

  departmentsPointSales$: Array<IDepartamentoModel>;
  provincesPointSales$: Array<IProvinciaModel>;
  districtsPointSales$: Array<IDistritoModel>;

  dataPointSale: any;

  channelSelected: any;

  isNewChannel: boolean;
  editMode: boolean;
  editFormMode: boolean;
  channelActive: boolean;
  showFormPointSales: boolean;
  disableChangeUbigeo: boolean;

  isNewPointSale: boolean;

  estadoCanal: Array<{
    id: number;
    description: string;
  }>;

  dataChannel: any;
  fullNameChannelSale: string;
  downloadURL2: any;
  totalItems = 0;
  itemsPerPage = 10;
  maxSize = 10;
  currentPage = 0;
  tipoDocumento: string;

  @ViewChild('channel', { static: true, read: TemplateRef })
  _channel: TemplateRef<any>;
  @ViewChild('distributionConfirm', { static: true, read: TemplateRef })
  _distributionConfirm: TemplateRef<any>;
  @ViewChild('succesChangeDistribution', { static: true, read: TemplateRef })
  _succesChangeDistribution: TemplateRef<any>;
  @ViewChild('semaforoPointSale', { static: true, read: TemplateRef })
  _semaforoPointSale: TemplateRef<any>;
  @ViewChild('stateChannel', { static: true, read: TemplateRef })
  _stateChannel: TemplateRef<any>;
  @ViewChild('sureChangeState', { static: true, read: TemplateRef })
  _sureChangeState: TemplateRef<any>;
  @ViewChild('successChangeState', { static: true, read: TemplateRef })
  _successChangeState: TemplateRef<any>;
  @ViewChild('sureChannel', { static: true, read: TemplateRef })
  _sureChannel: TemplateRef<any>;
  @ViewChild('successChannel', { static: true, read: TemplateRef })
  _successChannel: TemplateRef<any>;
  limitDocumentNumber: { min: number; max: number };
  constructor(
    private readonly _builder: FormBuilder,
    private readonly _mantenimientosService: MantenimientosService,
    private readonly _vc: ViewContainerRef,
    private readonly _utilsService: UtilsService,
    private readonly _spinner: NgxSpinnerService
  ) {
    this.limitDocumentNumber = {
      min: 0,
      max: 0,
    };
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.disableChangeUbigeo = false;
    this.isNewPointSale = false;
    this.channelActive = false;
    this.editFormMode = false;
    this.showFormPointSales = false;

    this.estadoCanal = [];
    this.dataSemaforo$ = [];
    this.isNewChannel = false;
    this.editMode = false;

    this.dataSemaforo$ = new SemaforoPointSaleModel();

    this.bsConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
      }
    );

    this.departments$ = [];
    this.provinces$ = [];
    this.districts$ = [];

    this.departmentsPointSales$ = [];
    this.provincesPointSales$ = [];
    this.districtsPointSales$ = [];

    this.channels$ = new ChannelsModel();
    this.channelTypes$ = new ChannelTypesModel();
    this.resultChannels$ = new ChannelResultModel();

    this.pointSalesOfChannel$ = new PointSaleResultModel();

    this.form = this._builder.group({
      tipoCanal: [null],
      canalVenta: [null],
      estadoCanal: [null],
      tipoDocumento: [null],
      numeroDocumento: [
        null,
        Validators.compose([
          Validators.pattern(/^\d*$/),
          Validators.minLength(9),
          Validators.maxLength(12),
        ]),
      ],
      razonSocial: [null],
      nombres: [null],
      apellidoPaterno: [null],
      apellidoMaterno: [null],
    });
    this.formChannel = this._builder.group({
      codigoCanal: [null],
      codigoCliente: [null],
      tipoDocumento: [null, Validators.required],
      numeroDocumento: [
        null,
        Validators.compose([
          Validators.pattern(/^\d*$/),
          Validators.required,
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.max),
        ]),
      ],
      razonSocial: [null],
      nombres: [
        null,
        Validators.compose([Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)]),
      ],
      apellidoPaterno: [
        null,
        Validators.compose([Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)]),
      ],
      apellidoMaterno: [
        null,
        Validators.compose([Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)]),
      ],
      telefono: [null, Validators.compose([Validators.pattern(/^\d*$/)])],
      direccion: [null, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      contacto: [
        null,
        Validators.compose([
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/),
          Validators.required,
        ]),
      ],
      email: [null, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      tipoCanal: [null, Validators.required],
      gestorPadre: [null, Validators.required],
      inicioVigencia: [null, Validators.required],
      finVigencia: [null, Validators.required],
      distribucion: [null, Validators.required],
      minimoStock: [
        null,
        Validators.compose([
          Validators.pattern(/^[\d]*$/),
          Validators.required,
        ]),
      ],
      maximoStock: [
        null,
        Validators.compose([
          Validators.pattern(/^[\d]*$/),
          Validators.required,
        ]),
      ],
      porcentajeRechazo: [
        null,
        Validators.compose([Validators.pattern(/^\d*$/), Validators.required]),
      ],
    });
    this.formPointSale = this._builder.group({
      codigoPuntoVenta: [null],
      descripcion: [null, Validators.required],
      telefono: [
        null,
        Validators.compose([Validators.required, Validators.pattern(/^\d*$/)]),
      ],
      direccion: [null, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      contacto: [
        null,
        Validators.compose([
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/),
          Validators.required,
        ]),
      ],
      email: [null, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      minStock: [null, Validators.compose([Validators.pattern(/^[\d]*$/)])],
      maxStock: [null, Validators.compose([Validators.pattern(/^[\d]*$/)])],
      porcentajeRechazo: [
        null,
        Validators.compose([Validators.pattern(/^[\d]*$/)]),
      ],
    });
    this.formState = this._builder.group({
      state: [null, Validators.required],
      expireDate: [null],
    });
  }

  ngOnInit(): void {
    this.channels();
    this.channelTypes();
    this.parameters();
    this.buscar();

    this.fc['tipoDocumento'].valueChanges.subscribe((val) => {
      if (!this.editMode) {
        this.fc['numeroDocumento'].setValue(null);
      }
      switch (+val) {
        case 2:
          this.limitDocumentNumber = {
            min: 8,
            max: 8,
          };
          break;
        case 4:
        case 1:
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
        this.fc['numeroDocumento'].setValidators(Validators.compose([
          Validators.pattern(/^\d*$/),
          Validators.required,
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.max),
        ]));
      } else {
        this.fc['numeroDocumento'].setValidators(Validators.compose([
          Validators.pattern(/^\d*$/),
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.max),
        ]));
      }
      this.fc['numeroDocumento'].updateValueAndValidity({
        emitEvent: true
      });
    });
    this.fc['departamento'].valueChanges.subscribe((val: any) => {
      if (this.isNewChannel || !this.disableChangeUbigeo) {
        this.fc['provincia'].setValue(null);
        this.fc['distrito'].setValue(null);
      }
      this.provinces$ = [];
      this.districts$ = [];
      if (!!val) {
        this.provinces$ = this.departments$.find(
          (x) => Number(x.id) === Number(val)
        )?.provincias;
      }
    });

    this.fc['provincia'].valueChanges.subscribe((val: any) => {
      if (this.isNewChannel || !this.disableChangeUbigeo) {
        this.fc['distrito'].setValue(null);
      }
      this.districts$ = [];
      if (!!val) {
        this.districts$ = this.provinces$?.find(
          (x) => Number(x.idProvincia) === Number(val)
        )?.distritos;
      }
    });

    this.fp['departamento'].valueChanges.subscribe((val: any) => {
      if (this.isNewChannel || !this.disableChangeUbigeo) {
        this.fp['provincia'].setValue(null);
        this.fp['distrito'].setValue(null);
      }
      this.provincesPointSales$ = [];
      this.districtsPointSales$ = [];
      if (!!val) {
        this.provincesPointSales$ = this.departmentsPointSales$.find(
          (x) => Number(x.id) === Number(val)
        )?.provincias;
      }
    });
    this.fp['provincia'].valueChanges.subscribe((val: any) => {
      if (this.isNewChannel || !this.disableChangeUbigeo) {
        this.fp['distrito'].setValue(null);
      }
      this.districtsPointSales$ = [];
      if (!!val) {
        this.districtsPointSales$ = this.provincesPointSales$.find(
          (x) => Number(x.idProvincia) === Number(val)
        )?.distritos;
      }
    });
    this.f['numeroDocumento'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['numeroDocumento'].hasError('pattern')) {
          this.f['numeroDocumento'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fc['numeroDocumento'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['numeroDocumento'].hasError('pattern')) {
          this.fc['numeroDocumento'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fc['minimoStock'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['minimoStock'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fc['minimoStock'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.fc['maximoStock'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['maximoStock'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fc['maximoStock'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.fc['porcentajeRechazo'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['porcentajeRechazo'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fc['porcentajeRechazo'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fp['minStock'].valueChanges.subscribe((val: any) => {
      if (val) {
        if (this.fp['minStock'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fp['minStock'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fp['maxStock'].valueChanges.subscribe((val: any) => {
      if (val) {
        if (this.fp['maxStock'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fp['maxStock'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
    this.fc['numeroDocumento'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['numeroDocumento'].hasError('pattern')) {
          this.fc['numeroDocumento'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fc['nombres'].valueChanges.subscribe((val) => {
      if (this.fc['nombres'].hasError('pattern')) {
        this.fc['nombres'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fc['apellidoPaterno'].valueChanges.subscribe((val) => {
      if (this.fc['apellidoPaterno'].hasError('pattern')) {
        this.fc['apellidoPaterno'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fc['apellidoMaterno'].valueChanges.subscribe((val) => {
      if (this.fc['apellidoMaterno'].hasError('pattern')) {
        this.fc['apellidoMaterno'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fc['contacto'].valueChanges.subscribe((val) => {
      if (this.fc['contacto'].hasError('pattern')) {
        this.fc['contacto'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fc['telefono'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['telefono'].hasError('pattern')) {
          this.fc['telefono'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.fp['telefono'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fp['telefono'].hasError('pattern')) {
          this.fp['telefono'].setValue(val.substring(val, val.length - 1));
        }
      }
    });
    this.fp['contacto'].valueChanges.subscribe((val) => {
      if (this.fp['contacto'].hasError('pattern')) {
        this.fp['contacto'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fp['porcentajeRechazo'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fp['porcentajeRechazo'].hasError('pattern') || +val.substring(0, 1) === 0) {
          this.fp['porcentajeRechazo'].setValue(
            val.substring(val, val.length - 1)
          );
        }
      }
    });
    this.fc['gestorPadre'].valueChanges.subscribe((val) => {
      console.log(val);
    });
  }

  channels(): void {
    this.f['canalVenta'].setValue(null);
    this.channels$ = new ChannelsModel();
    this._spinner.show();
    this.getChannels(this.f['tipoCanal'].value);
  }
  changeChannel(val) {
    if (this.editMode) {
      this.fc['gestorPadre'].setValue(null);
    }

    this.channels$ = new ChannelsModel();
    this._spinner.show();
    this.getChannels(val);
  }
  private getChannels(val): void {
    this._mantenimientosService.channels(val).subscribe(
      (res: ChannelsModel) => {
        this.channels$ = new ChannelsModel(res);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  channelTypes(): void {
    this._mantenimientosService.channelTypes().subscribe(
      (res: ChannelTypesModel) => {
        this.channelTypes$ = new ChannelTypesModel(res);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  parameters(): void {
    this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = res;
        this.departments$ = res.ubigeos;
        this.departmentsPointSales$ = res.ubigeos;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  getDataOfDocument(): void {
    if (this.fc['numeroDocumento'].valid && this.fc['numeroDocumento'].value && !this.editFormMode) {
      const req: DocumentRequest = {
        type: this.fc['tipoDocumento'].value,
        documentNumber: this.fc['numeroDocumento'].value
      };
      this._spinner.show();
      this._utilsService.documentData(req).pipe(
        map((val: DocumentResponse) => {
          return new DocumentFormatResponse(val);
        })
      ).subscribe(
        (res: DocumentFormatResponse) => {
          if (+this.fc['tipoDocumento'].value === 1) {
            this.fc['razonSocial'].setValue(res.completeNames);
          } else {
            this.fc['nombres'].setValue(res.names);
            this.fc['apellidoPaterno'].setValue(res.apellidoPaterno);
            this.fc['apellidoMaterno'].setValue(res.apellidoMaterno);
          }
          this.fc['telefono'].setValue(res.phone);
          this.fc['direccion'].setValue(res.address);
          this.fc['departamento'].setValue(res.department);
          this.fc['provincia'].setValue(res.province);
          this.fc['distrito'].setValue(res.district);
          this.fc['email'].setValue(res.email);
          this._spinner.hide();
        },
        (err: any) => {
          console.error(err);
          this._spinner.hide();
        }
      );
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  get fc(): { [key: string]: AbstractControl } {
    return this.formChannel.controls;
  }
  get fp(): { [key: string]: AbstractControl } {
    return this.formPointSale.controls;
  }
  get fs(): { [key: string]: AbstractControl } {
    return this.formState.controls;
  }
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  pageChanged(e: any): void {
    this.currentPage = e;
    this.buscar(false);
  }
  buscar(btn?: boolean): void {
    if (btn) {
      this.itemsPerPage = 10;
      this.currentPage = 0;
    }
    this._spinner.show();
    this.resultChannels$ = new ChannelResultModel();
    const req: IBuscarCanalRequest = {
      apellidoMaterno: this.f['apellidoMaterno'].value || '',
      apellidoPaterno: this.f['apellidoPaterno'].value || '',
      canalVenta: this.f['canalVenta'].value,
      estadoCanal: this.f['estadoCanal'].value || -1,
      nombres: this.f['nombres'].value || '',
      numeroDocumento: this.f['numeroDocumento'].value || '',
      razonSocial: this.f['razonSocial'].value || '',
      tipoCanal: this.f['tipoCanal'].value || 0,
      tipoDocumento: this.f['tipoDocumento'].value || '',
      pageSize: this.itemsPerPage,
      endIndex: this.itemsPerPage * ((this.currentPage || 1) - 1) + 10,
      numPage: ((this.currentPage || 1) - 1),
      pageIndex: this.itemsPerPage * ((this.currentPage || 1) - 1),
    };
    this._mantenimientosService.buscarCanal(req).subscribe(
      (res: ChannelResultModel) => {
        this.resultChannels$ = new ChannelResultModel(res);
        this.totalItems = this.resultChannels$.totalItems;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  clearForm(): void {
    this.form.reset();
  }
  enableChangeUbigeo(): void {
    this.disableChangeUbigeo = false;
  }
  nuevoCanal(): void {
    this.isNewChannel = true;
    this.editMode = false;
    this.editFormMode = true;

    this.formChannel.enable();

    this.fc['codigoCanal'].disable();
    this.fc['codigoCliente'].disable();
    this.fc['distribucion'].setValue('CANAL DE VENTA');

    this._vc.createEmbeddedView(this._channel);
    this.channels$ = new ChannelsModel();
  }
  showModalChannelForEdit(data: any): void {
    this.dataPointSale = data;

    this.channelSelected = data;
    this.showFormPointSales = false;
    this.disableChangeUbigeo = true;

    this.editMode = true;
    this.isNewChannel = false;

    this.fc['codigoCanal'].setValue(data.canal.codigoCanal);
    this.fc['codigoCliente'].setValue(data.canal.codigoCliente);
    this.fc['tipoDocumento'].setValue(data.canal.tipoDocumento);
    this.fc['numeroDocumento'].setValue(data.canal.numeroDocumento);
    this.fc['razonSocial'].setValue(data.canal.nombreCanal);
    this.fc['nombres'].setValue(data.canal.nombres);
    this.fc['apellidoPaterno'].setValue(data.canal.apellidoPaterno);
    this.fc['apellidoMaterno'].setValue(data.canal.apellidoMaterno);
    this.fc['telefono'].setValue(data.contacto.celular);
    this.fc['direccion'].setValue(data.ubigeo.direccion);
    this.fc['departamento'].setValue(data.ubigeo.departamento?.toString());
    this.fc['provincia'].setValue(Number(data.ubigeo.provincia || '0'));
    this.fc['distrito'].setValue(Number(data.ubigeo.distrito || '0'));
    this.fc['contacto'].setValue(data.contacto.nombreContacto);
    this.fc['email'].setValue(data.contacto.email);
    this.fc['tipoCanal'].setValue(data.canal.codigoTipoCanal);
    this.fc['gestorPadre'].setValue(data.canal.codigoGestorPadre);
    this.fc['inicioVigencia'].setValue(
      moment(data.fechaInicioVigencia).toDate()
    );
    this.fc['finVigencia'].setValue(moment(data.fechaFinVigencia).toDate());
    this.fc['distribucion'].setValue(data.tipoDistribucion);
    this.fc['minimoStock'].setValue(data.stock.minimo);
    this.fc['maximoStock'].setValue(data.stock.maximo);
    this.fc['porcentajeRechazo'].setValue(data.porcentajeMaximoRechazo);

    this.formChannel.disable();
    this.validateFormChannel(data);
    this._vc.createEmbeddedView(this._channel);
    this.pointSalesOfChannel();
  }
  validateFormChannel(data: any): void {
    if (data.canal.estado === 'INACTIVO') {
      this.fc['provincia'].enable();
      this.fc['distrito'].enable();
      this.channelActive = false;
      this.editFormMode = false;
    }
    if (data.canal.estado === 'VIGENTE') {
      this.formChannel.enable();
      this.fc['codigoCanal'].disable();
      this.fc['codigoCliente'].disable();
      this.channelActive = true;
      this.editFormMode = true;
    }
  }
  pointSalesOfChannel(): void {
    const req = {
      poliza: this.channelSelected.canal.codigoCanal,
    };
    this._spinner.show();
    this._mantenimientosService.pointSales(req).subscribe(
      (res: PointSaleResultModel) => {
        this.pointSalesOfChannel$ = new PointSaleResultModel(res);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  closeModalChannel(): void {
    this.closeModal();
    this.formChannel.reset();
    this.formPointSale.reset();
    this.pointSalesOfChannel$ = new PointSaleResultModel();
  }

  closeModal(): void {
    this.isNewChannel = false;
    this.editMode = false;
    this.formPointSale.reset();
    this.formState.reset();
    this._vc.clear();
  }

  submitChannel(): void {
    this._vc.createEmbeddedView(this._sureChannel);
  }

  saveChannel(): void {
    if (this.formChannel.valid) {
      const req = {
        ...this.formChannel.getRawValue(),
        codigoCanalPadre: this.fc['gestorPadre'].value,
        codigoUsuario: this.currentUser?.id,
      };
      this._mantenimientosService.saveChannel(req).subscribe(
        (res: any) => {
          this.closeModal();
        },
        (err: any) => {
          console.error(err);
          this.closeModal();
        }
      );
    }
  }
  savePointSale(): void {
    if (this.formPointSale.valid) {
      this._spinner.show();
      const req = {
        ...this.formPointSale.getRawValue(),
        puntoVenta: this.fp['codigoPuntoVenta'].value || '',
        userCode: this.currentUser?.id,
        poliza: this.dataPointSale?.canal?.codigoCanal || '',
      };
      // tslint:disable-next-line:prefer-const
      let reqStock = {
        ...this.formPointSale.getRawValue(),
        poliza: this.dataPointSale?.canal?.codigoCanal || '',
        userName: this.currentUser.username,
      };
      if (!this.isNewPointSale) {
        this._mantenimientosService.savePointChannel(req).subscribe(
          (res: any) => {
            reqStock = {
              ...reqStock,
              puntoVenta: this.fp['codigoPuntoVenta'].value || '',
            };
            this._mantenimientosService
              .updateStock(reqStock)
              .subscribe((resp: any) => {
                this.pointSalesOfChannel();
              });
            this._spinner.hide();
          },
          (err: any) => {
            console.error(err);
            this._spinner.hide();
          }
        );
      } else {
        this._mantenimientosService.newPointChannel(req).subscribe(
          (res: any) => {
            reqStock = {
              ...reqStock,
              puntoVenta: res?.P_NNUMPOINT,
            };
            this._mantenimientosService
              .updateStock(reqStock)
              .subscribe((resp: any) => {
                this.pointSalesOfChannel();
              });
            this._spinner.hide();
          },
          (err: any) => {
            console.error(err);
            this._spinner.hide();
          }
        );
      }
    }
  }
  submitState(): void {
    if (this.formState.valid) {
      this._spinner.show();
      const req = {
        poliza: this.dataChannel.canal.codigoCanal,
        cliente: this.dataChannel.canal.codigoCliente,
        state: this.fs['state'].value,
        polizaPadre: -1,
        expireDate: moment(this.fs['expireDate'].value).toDate().toISOString(),
        user: this.currentUser?.username,
      };
      this._mantenimientosService.changeState(req).subscribe(
        (res: any) => {
          this._spinner.hide();
          this._vc.clear();
          if (res.STATUS === 1) {
            this._vc.createEmbeddedView(this._successChangeState);
          }
        },
        (err: any) => {
          console.error(err);
          this._vc.clear();
          this._spinner.hide();
        }
      );
    }
  }
  closeModalSuccessState(): void {
    this.closeModal();
    this.buscar();
  }

  export() {
    this.downloadURL2 =
      this.urlApi +
      '/StockManagement/Reports/PA_SEL_CHANNEL_FILTER_REPORT_GET?P_NTYPECHANNEL=' +
      this.f['tipoCanal'].value ||
      0 + '&P_NPOLICY=' + this.f['canalVenta'].value ||
      0 + '&P_NPOLICYSTATE=' + this.f['estadoCanal'].value ||
      -1 + '&P_NTYPEDOC=' + this.f['tipoDocumento'].value ||
      0 + '&P_NNRODOC=' + this.f['numeroDocumento'].value ||
      0 + '&P_SNOMBRES=' + this.f['razonSocial'].value ||
      '';

    let urlForDownload = `${this.urlApi}/StockManagement/Reports/PA_SEL_CHANNEL_FILTER_REPORT_GET?`;
    const params: any = new HttpParams()
      .set('P_NTYPECHANNEL', this.f['tipoCanal'].value || '0')
      .set('P_NPOLICY', this.f['canalVenta'].value || '0')
      .set('P_NPOLICYSTATE', this.f['estadoCanal'].value || '-1')
      .set('P_NTYPEDOC', this.f['tipoDocumento'].value || '0')
      .set('P_NNRODOC', this.f['numeroDocumento'].value || '0')
      .set('P_SNOMBRES', this.f['razonSocial'].value || '');
    params.updates.forEach((x: any) => {
      urlForDownload += `${x.param}=${x.value}&`;
    });
    urlForDownload = urlForDownload.substring(0, urlForDownload.length - 1);
    window.open(urlForDownload);
  }

  openModalDistributionConfirm(val: any): void {
    if (
      val !== this.fc['distribucion'].value &&
      this.fc['distribucion'].enabled &&
      !this.isNewChannel
    ) {
      this._vc.createEmbeddedView(this._distributionConfirm);
    }
  }

  closeModalDistributionConfirm(): void {
    this._vc.remove();
  }

  salePointBaja(): void {
    this._spinner.show();
    this._mantenimientosService
      .salePointBaja(this.fc['codigoCanal'].value)
      .subscribe(
        (res: any) => {
          this.pointSalesOfChannel();
          this._vc.remove();
          this._spinner.hide();
          if (res.NSTATUS === 1) {
            this._vc.createEmbeddedView(this._succesChangeDistribution);
          }
        },
        (err: any) => {
          console.error(err);
          this._spinner.hide();
        }
      );
  }

  closeModalSuccessDistribution(): void {
    this._vc.remove();
  }

  openPointSalesOfChannel() {
    this.showFormPointSales = true;
    this.isNewPointSale = true;
    this.fp['codigoPuntoVenta'].disable();
  }

  noEditChannel(): void {
    this.showFormPointSales = false;
    this.editFormMode = false;
    this.formChannel.disable();
  }
  editChannel(): void {
    this.editFormMode = true;
    this.formChannel.enable();
    this.fc['codigoCanal'].disable();
    this.fc['codigoCliente'].disable();
    this.validateFormChannel(this.dataPointSale);
  }

  editPointSale(data: any): void {
    console.log(data);
    this.showFormPointSales = true;
    this.isNewPointSale = false;
    this.fp['codigoPuntoVenta'].setValue(data.numeroPuntoVenta);
    this.fp['descripcion'].setValue(data.descripcion);
    this.fp['telefono'].setValue(data.telefono);
    this.fp['direccion'].setValue(data.direccion);
    this.fp['departamento'].setValue(data.departamento.id);
    this.fp['provincia'].setValue(data.provincia.id);
    this.fp['distrito'].setValue(data.distrito.id);
    this.fp['contacto'].setValue(data.contacto);
    this.fp['email'].setValue(data.correo);
    this.fp['minStock'].setValue(data.stock.minimo);
    this.fp['maxStock'].setValue(data.stock.maximo);
    this.fp['porcentajeRechazo'].setValue(data.porcentajeRechazo);
  }

  showModalSemaforo(data: any): void {
    const req = {
      poliza: data.canal.codigoCanal,
      puntoVenta: 0,
    };
    this._spinner.show();
    this._mantenimientosService.semaforoPointSale(req).subscribe(
      (res: any) => {
        this.dataSemaforo$ = new SemaforoPointSaleModel(res);
        this._spinner.hide();
        this._vc.clear();
        this._vc.createEmbeddedView(this._semaforoPointSale);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  changeState(data: any): void {
    this.dataChannel = data;
    this.fullNameChannelSale = `${data.canal.codigoCanal} - ${data.canal.nombreCanal}`;

    this.fs['expireDate'].setValue(moment(data.fechaFinVigencia).toDate());

    if (data.canal.estado === 'VIGENTE') {
      this.estadoCanal = [
        {
          id: 0,
          description: 'INACTIVO',
        },
      ];
    } else {
      this.estadoCanal = [
        {
          id: 1,
          description: 'VIGENTE',
        },
      ];
    }
    this.fs['state'].setValue(this.estadoCanal[0].id);

    this._vc.clear();
    this._vc.createEmbeddedView(this._stateChannel);
  }

  openSureChangeState(): void {
    this._vc.createEmbeddedView(this._sureChangeState);
  }

  removeLastTemplate(): void {
    this._vc.remove();
  }

  changeValueTipoDocumento(e): void {
    if (this.dataPointSale.canal.tipoDocumento !== e) {
      this.formChannel.get('numeroDocumento').setValue(null);
    } else {
      this.formChannel
        .get('numeroDocumento')
        .setValue(this.dataPointSale.canal.numeroDocumento);
    }
  }

  documentTypeToText(val: any): string {
    switch (+val) {
      case 1:
        return 'N° RUC(*)';
      case 2:
        return 'N° DNI(*)';
      case 4:
        return 'C.E.';
      default:
        return '';
    }
  }
}
