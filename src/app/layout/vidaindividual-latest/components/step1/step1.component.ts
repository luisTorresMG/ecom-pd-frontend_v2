import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef, } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators, } from '@angular/forms';
import { BsModalRef, BsModalService, ModalDirective, } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { Step1Service } from '../../services/step1/step1.service';
import { Observable, of, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Step1Response } from '../../models/step1.model';
import { DocumentRequest, DocumentResponse } from '../../models/document.model';
import moment from 'moment';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { MainService } from '../../services/main/main.service';
import { NotificationRequest } from '../../models/notification.model';
import { ResumenResponse } from '../../models/resumen.model';
import { environment } from 'environments/environment';
import { Selling } from '../../../soat/shared/interfaces/selling.interface';
import { BeneficiarioDto } from '../../models/beneficiario.model';
import { AppConfig } from '@root/app.config';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { base64ToArrayBuffer } from '@shared/helpers/utils';
import * as FileSaver from 'file-saver';
import { VidaDevolucionModel } from '../../models/vidadevolucion.model';
import { DocumentFormatResponse } from '@shared/models/document/document.models';
import { DocumentFormatNotSameResponse } from '@shared/models/document/document.modelsNotSame';
import { ValidateQuotationService } from '@root/insurance/shared/services/validate-quotation.service';
import { IDocumentInfoClientRequest } from '@shared/interfaces/document-information.interface';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { RecaptchaComponent } from 'ng-recaptcha';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(400, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class Step1Component implements OnInit {
  vd: VidaDevolucionModel;
  vd2: VidaDevolucionModel;
  documentResponse: DocumentFormatResponse;
  otherDocumentResponse: DocumentFormatNotSameResponse;

  msgMissData: String;
  msgMissData2: String;

  iscollapse: boolean;
  samePerson: boolean;

  FORM_COTIZAR: FormGroup;
  relationshipContractor$: Array<any> = [];

  DATA_SERVICES: string[] = [];
  modalRef: BsModalRef;
  NDOC_VALID: boolean;
  FECHA_NAC: string;
  NSFECHA_NAC: string;
  MAXLENGTHDOCUMENT: number;
  IS_CALL_NDOC: boolean;
  FECHA_NAC_IS_ERROR: boolean;
  NSFECHA_NAC_IS_ERROR: boolean;
  numberDocumentLimit: { min: number; max: number };
  bsConfig: Partial<BsDatepickerConfig>;
  isProcessValid = false;

  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  limitDate: Date;
  isValidFechaNacimiento: boolean;
  NSisValidFechaNacimiento: boolean;

  returnTarifario: boolean;

  code: any;

  itemsBeneficios: any;
  itemTest: any;
  baseUrlBeneficios: string;

  intentosResumen: number;

  ideconDC: any;
  worldCheckDC: any;

  check1: any;
  check2: any;

  linkVencido: boolean;
  aseguradoContratante: boolean;
  documentContratante: boolean;
  siteKey = AppConfig.CAPTCHA_KEY;
  subscribeContratanteObs: Subscription;
  isSubscribedDocumentNumberContractor: boolean = false;

  @ViewChild('termsModal') termsModal;
  @ViewChild('termsModalPolicy') termsModalPolicy;
  @ViewChild('modalContratante', { static: false, read: TemplateRef })
  modalContratante: ModalDirective;
  @ViewChild('modalBeneficios', { static: true, read: TemplateRef })
  modalBeneficios: ModalDirective;
  @ViewChild('modalReactivarAlert', { static: true, read: TemplateRef })
  _modalReactivarAlert: TemplateRef<any>;
  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _Router: Router,
    private readonly _route: ActivatedRoute,
    private readonly modalService: BsModalService,
    private readonly vc: ViewContainerRef,
    private readonly _Step1Service: Step1Service,
    private readonly spinner: NgxSpinnerService,
    private readonly _mainService: MainService,
    private readonly _utilsService: UtilsService,
    private readonly mainService: MainService,
    private readonly validateQuotationService: ValidateQuotationService,
    private readonly trackingService: TrackingService
  ) {
    this.linkVencido = false;
    this.documentResponse = new DocumentFormatResponse();
    this.otherDocumentResponse = new DocumentFormatNotSameResponse();
    this._mainService.step = 1;
    this.iscollapse = true;
    this.samePerson = true;
    this.itemTest = null;

    this.msgMissData2 = '';

    this.msgMissData = '';

    this.FORM_COTIZAR = this._builder.group({
      typeDoc: [2, Validators.compose([Validators.required])],
      nDoc: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ]),
      ],
      telefono: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      fechaNac: [
        this.bsValueFin,
        Validators.compose([
          // Validators.pattern(/^[0-9]{2}.[0-9]{2}.[0-9]{4}$/),
          Validators.required,
        ]),
      ],
      terms: [true, Validators.required],
      privacy: [false, Validators.required],
      same: [false, Validators.required],
      ctypeDoc: [2],
      cnDoc: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]),
      ],
      cparentesco: [null],
      cemail: [
        null,
        Validators.compose([Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)]),
      ],
      ctelefono: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      cfechaNac: [
        this.bsValueFin,
        Validators.compose([
          // Validators.pattern(/^[0-9]{2}.[0-9]{2}.[0-9]{4}$/),
        ]),
      ],
    });
    this.DATA_SERVICES.push(
      'La totalidad de las primas pagadas y más se devolverán al finalizar el periodo elegido.'
    );
    this.DATA_SERVICES.push('Periodos de 6, 8, 10, 12 y 15 años.');
    this.DATA_SERVICES.push(
      'Los beneficiarios deben tener interés asegurable.'
    );
    this.NDOC_VALID = false;
    this.FECHA_NAC = '';
    this.NSFECHA_NAC = '';
    this.IS_CALL_NDOC = false;
    this.FECHA_NAC_IS_ERROR = false;
    this.NSFECHA_NAC_IS_ERROR = false;
    this.numberDocumentLimit = { min: 8, max: 8 };
    if (this.isReturnDataDocumentSession == null) {
      this.isReturnDataDocumentSession = '0';
    }
    this.isValidFechaNacimiento = true;
    this.NSisValidFechaNacimiento = true;
    this.returnTarifario = true;
    this.baseUrlBeneficios = 'assets/vidaindividual/beneficios';
    this.itemsBeneficios = [
      {
        img: `${this.baseUrlBeneficios}/beneficio-1.svg`,
        desc: null,
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-2.svg`,
        desc: null,
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-3.svg`,
        desc: null,
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-4.svg`,
        desc: null,
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-5.svg`,
        desc: null,
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-6.svg`,
        desc: null,
        small: null,
      },
    ];
    this.intentosResumen = 0;
  }

  ngOnInit(): void {
    this._mainService.tipoCambio().subscribe(
      (res: any) => {
        localStorage.removeItem('tipocambio');
        localStorage.setItem('tipocambio', res.data?.valor);
      },
      (err) => {
        console.error(err);
        this.spinner.hide();
      }
    );

    const gtmPage = {
      event: 'virtualPage',
      payload: {
        pagePath: window.location.pathname,
        pageName: 'Paso 1',
      },
    };

    let resp: any = sessionStorage.getItem('_str_pay');
    if (!!resp) {
      resp = JSON.parse(resp);
      if (resp?.success || resp?.errorCode === 'ERROR_EMISION') {
        sessionStorage.clear();
      }
    }
    this.vd = new VidaDevolucionModel(this._mainService.storage);
    this._mainService.storage = this.vd;
    scrollTo(0, 0);
    let host = window.location.hostname;
    const path = window.location.pathname;
    if (path.indexOf('/staging/') !== -1) {
      host =
        '../../../../../staging/assets/formato-tramas/vidadevolucion/terminos-condiciones.txt';
    } else if (path.indexOf('/ecommerce/') !== -1) {
      host =
        '../../../../../ecommerce/assets/formato-tramas/vidadevolucion/terminos-condiciones.txt';
    } else {
      host =
        '../../../../../assets/formato-tramas/vidadevolucion/terminos-condiciones.txt';
    }
    fetch(host)
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem('formato-trama-vd', data);
      });
    this.changeTypeDoc();
    this.setDataOfStorage();
    sessionStorage.setItem('step', '1');
    this.limitDate = new Date(
      new Date().setFullYear(Number(new Date().getFullYear()) - 18)
    );
    this.bsConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
      }
    );
    const sellingConfig = {
      sellingChannel: environment.canaldeventadefault,
      sellingPoint: environment.puntodeventadefault,
      linkAgenciado: false,
    };
    // sessionStorage.removeItem('link-agenciado');
    this.saveToLocalStorage('selling', sellingConfig);

    const token = localStorage.getItem('token');
    if (!token) {
      this._mainService.getToken().subscribe(
        (res: any) => {
          localStorage.setItem('token', res.sequence);
        },
        (err: any) => {
          console.log(err);
        }
      );
    }

    this.fc['telefono'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['telefono'].value?.toString()?.substring(0, 1) !== '9') {
          this.fc['telefono'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
        if (this.fc['telefono'].hasError('pattern')) {
          this.fc['telefono'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
      }
    });
    this.fc['ctelefono'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['ctelefono'].value?.toString()?.substring(0, 1) !== '9') {
          this.fc['ctelefono'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
        if (this.fc['ctelefono'].hasError('pattern')) {
          this.fc['ctelefono'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
      }
    });
    this.fc['fechaNac'].valueChanges.subscribe((val) => {
      if (val) {
        let dateIso: string;
        let date: Date;
        let fechaNacimientoFormatToValidate: Date;
        let fechaNacimientoFormat = this.fc['fechaNac']?.value?.toString();
        if (this.fc['fechaNac']?.value?.toString().length > 10) {
          dateIso = new Date(this.fc['fechaNac']?.value).toISOString();
          date = new Date(dateIso);
          fechaNacimientoFormat = moment(date).format('DD/MM/YYYY').toString();
          this.fc['fechaNac'].setValue(fechaNacimientoFormat);
          this.FECHA_NAC = fechaNacimientoFormat;
        }
        this.vd.contratante.fechaNacimiento = this.FECHA_NAC;
        this._mainService.storage = this.vd;
        const dayF = fechaNacimientoFormat.substring(0, 2);
        const mesF = fechaNacimientoFormat.substring(3, 5);
        const yearF = fechaNacimientoFormat.substring(6, 10);
        fechaNacimientoFormatToValidate = new Date(`${yearF}/${mesF}/${dayF}`);
        this.isValidFechaNacimiento =
          fechaNacimientoFormatToValidate <= this.limitDate;
      }
    });
    this.fc['same'].setValue(this.iscollapse);
    this.fc['same'].valueChanges.subscribe((val) => {
      this.iscollapse = val;
      this.changeValidatorsReact(val);
      this.msgMissData = '';
      this.msgMissData2 = '';
      sessionStorage.removeItem('dataContratantenotSame');
      sessionStorage.removeItem('infoBenContratante');
      sessionStorage.removeItem('infoContratante');
    });

    this.fc['nDoc'].valueChanges.subscribe((val) => {
      sessionStorage.removeItem('step2');
      sessionStorage.removeItem('dataBeneficiarios');
      sessionStorage.removeItem('codigoComercio');
      sessionStorage.removeItem('dps');

      if (this.fc['nDoc'].hasError('pattern')) {
        this.fc['nDoc'].setValue(val?.substring(0, val?.length - 1));
      }
      this.getDataOfDocument();
    });

    this.subscribeContratanteObs = this.subscribeContratante();

    if (this.resumen) {
      this.fc['nDoc'].disable();
      this.fc['typeDoc'].disable();
    }
    this.getParameters();

    this._route.queryParams.subscribe((val) => {
      if (val.code) {
        this.renewSellingPoint().subscribe(
          (res: any) => {
            if (res.linkAgenciado) {
              sessionStorage.setItem('link-agenciado', val.code?.toString());
            }
          },
          (err: any) => {
            console.log(err);
          }
        );
      }
      if (val.processId) {
        sessionStorage.setItem('processDigitalPlatform', val.processId);
        this.isProcessValid = true;

        if (token) {
          this.getResumen(val.processId);
        } else {
          this.spinner.show();
          this._mainService.getToken().subscribe(
            (res: any) => {
              this.spinner.hide();
              localStorage.setItem('token', res.sequence);
              this.getResumen(val.processId);
            },
            (err: any) => {
              console.log(err);
              this.spinner.hide();
            }
          );
        }
      }

      if (val.ndoc) {
        sessionStorage.setItem('ndocLink', val.ndoc);
      }

      if (!!this._mainService.storage) {
        this.vd = this._mainService.storage;
      }
    });
  }

  subscribeContratante() {
    if (this.isSubscribedDocumentNumberContractor) {
      return;
    }

    this.isSubscribedDocumentNumberContractor = true;

    return this.fc['cnDoc'].valueChanges.subscribe((val) => {
      if (!this.isProcessValid) {
        sessionStorage.removeItem('dataContratantenotSame');
      }
      if (!this.isProcessValid) {
        sessionStorage.removeItem('infoBenContratante');
      }
      if (!this.isProcessValid) {
        sessionStorage.removeItem('dps');
      }
      if (this.fc['cnDoc'].hasError('pattern')) {
        this.fc['cnDoc'].setValue(val?.substring(0, val?.length - 1));
      }
      this.getDataDocumentNotSame();
    });
  }

  closeModal() {
    this.vc.clear();
  }

  getParameters(): void {
    this.validateQuotationService.getParametros().subscribe({
      next: (response: any) => {
        console.dir(response);
        this.relationshipContractor$ = response.parentescos;
        // this.ejecutivos = response?.asesores;
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  showmodalInfo() {
    this.vc.createEmbeddedView(this._modalReactivarAlert);
  }

  getResumen(idProcess: any): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('ed73f20edbf2b73');
    localStorage.removeItem('9FF2C61A');
    localStorage.removeItem('ADD601A8CA7B');
    localStorage.removeItem('productUser');
    sessionStorage.removeItem('dataContratantenotSame');
    sessionStorage.removeItem('dataContratante');
    sessionStorage.removeItem('infoContratante');
    this.spinner.show();
    this._mainService.obtenerResumen(idProcess).subscribe(
      (resp: any) => {
        this.fc['same'].setValue(
          resp?.aseguradoInfo?.aseguradoContratante == 1 ? false : true
        );
        this.fc['same'].disable();
        this.spinner.hide();
        sessionStorage.setItem('resumen-atp', JSON.stringify(resp));

        sessionStorage.setItem('idProcess', idProcess);

        window['dataLayer'].length = 0;
        window['dataLayer'].push({
          'estado': 'Logueado',
          'user_id': sessionStorage.getItem('user-id-unique'),
          'TipoCliente': sessionStorage.getItem('client-type'),
          'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
        });

        localStorage.setItem(
          'currentUser',
          JSON.stringify({ name: resp.cotizacionInfo?.nombreAsesor })
        );
        if (resp.success) {
          this.sessionValidInfoDocument = 'true';
          this.vd.isResumen = true;
          this.vd.idProcess = idProcess;
          this.vd.contratante = {
            ...this.vd?.contratante,
            tipoDocumento: resp?.aseguradoInfo.idTipoDocumento,
            numeroDocumento: resp?.aseguradoInfo.numeroDocumento,
            correo: resp?.aseguradoInfo.correo,
            celular: resp?.aseguradoInfo.telefono,
            fechaNacimiento: resp?.aseguradoInfo.fechaNacimiento,
            terminos: true,
            apellidoMaterno: resp?.aseguradoInfo.apellidoMaterno,
            apellidoPaterno: resp?.aseguradoInfo.apellidoPaterno,
            nacionalidad: {
              id: resp?.aseguradoInfo.idNacionalidad,
              description: resp?.aseguradoInfo.nacionalidad,
            },
            departamento: {
              id: resp?.aseguradoInfo.idDepartamento,
              description: resp?.aseguradoInfo.departamento,
            },
            provincia: {
              id: resp?.aseguradoInfo.idProvincia,
              description: resp?.aseguradoInfo.provincia,
            },
            distrito: {
              id: resp?.aseguradoInfo.idDistrito,
              description: resp?.aseguradoInfo.distrito,
            },
            direccion: resp?.aseguradoInfo.direccion,
            estadoCivil: resp?.aseguradoInfo.idEstadoCivil,
            fechaNacimientoReturnOfApi: true,
            nombres: resp?.aseguradoInfo.nombre,
            obligacionesFiscales: resp?.aseguradoInfo.obligacionFiscal,
            ocupacion: resp?.aseguradoInfo.idOcupacion,
            sexo: resp?.aseguradoInfo.idSexo,
            privacidad: '0',
            // tslint:disable-next-line:max-line-length
            nombreCompleto: `${resp?.aseguradoInfo.nombre} ${resp?.aseguradoInfo.apellidoPaterno} ${resp?.aseguradoInfo.apellidoMaterno}`,
          };
          this.vd.dps = JSON.parse(resp?.dps);
          this._mainService.storage = this.vd;
          this.fc.typeDoc.setValue(resp?.aseguradoInfo?.idTipoDocumento || 2);
          this.fc.nDoc.setValue(resp?.aseguradoInfo?.numeroDocumento);
          this.fc.email.setValue(resp?.aseguradoInfo?.correo);
          this.fc.telefono.setValue(Number(resp?.aseguradoInfo?.telefono));
          this.fc.fechaNac.setValue(resp?.aseguradoInfo?.fechaNacimiento);
          this.documentResponse.returnBirthDate =
            !!resp?.aseguradoInfo?.fechaNacimiento;
          this.documentResponse.success =
            !!resp?.aseguradoInfo?.fechaNacimiento;
          this.FECHA_NAC = resp?.aseguradoInfo?.fechaNacimiento;
          this.fc.terms.setValue(true);
          this.isReturnDataDocumentSession = '1';
          sessionStorage.setItem(
            'info-document',
            JSON.stringify({
              p_SCLIENT_APPPAT: resp?.aseguradoInfo?.apellidoPaterno,
              p_SCLIENT_APPMAT: resp?.aseguradoInfo?.apellidoMaterno,
              p_SCLIENT_NAME: resp?.aseguradoInfo?.nombre,
              p_SMAIL: resp?.aseguradoInfo?.correo,
              p_NDOCUMENT_TYP: resp?.aseguradoInfo?.idTipoDocumento,
              p_SDOCUMENT: resp?.aseguradoInfo?.numeroDocumento,
              p_FOTO: resp?.aseguradoInfo?.foto ?? ''
            })
          );
          if (resp?.aseguradoInfo.foto) {
            sessionStorage.setItem('document-avatar', resp?.aseguradoInfo.foto);
          }
          this.fc['nDoc'].disable();
          this.fc['typeDoc'].disable();
          sessionStorage.setItem('client-type', resp.cotizacionInfo.tipoCliente || 'No Cliente - Nuevo');
          if (resp.contratanteInfo) {
            sessionStorage.setItem('user-id-unique', resp.contratanteInfo.codigoCliente);

            if (Number(resp.aseguradoInfo.aseguradoContratante) == 0) {
              sessionStorage.removeItem('dataContratantenotSame');
              sessionStorage.removeItem('infoContratante');
              sessionStorage.removeItem('dataContratante');
              sessionStorage.removeItem('step1');
            } else if (Number(resp.aseguradoInfo.aseguradoContratante) == 1) {
              sessionStorage.removeItem('dataContratantenotSame');
              sessionStorage.removeItem('dataContratante');
              sessionStorage.removeItem('infoContratante');
              const dataDocument = {
                document: {
                  typeDoc: resp.contratanteInfo.idTipoDocumento || null,
                  nDoc: resp.contratanteInfo.numeroDocumento || null,
                },
              };

              this.documentResponse = this.parseDocumentInfoResumen(
                resp.contratanteInfo
              );
              this.documentResponse.address =
                this.documentResponse?.address?.replace('–', '-') || null;

              this.setInformacionContratante(
                this.parseInfomacionResumen(resp.contratanteInfo)
              );
              this.itemTest = this.parseInfomacionResumen(resp.contratanteInfo);
              this.otherDocumentResponse = new DocumentFormatNotSameResponse({
                ...this.itemTest,
                success: true,
              });

              sessionStorage.setItem(
                'infoContratante',
                JSON.stringify(
                  this.parseInfomacionResumen(resp.contratanteInfo)
                )
              );
              sessionStorage.setItem(
                'dataContratante',
                JSON.stringify(this.otherDocumentResponse)
              );

              if (this.isProcessValid && this.subscribeContratanteObs) {
                this.subscribeContratanteObs.unsubscribe();
              }
              this.fc['cnDoc'].setValue(resp.contratanteInfo.numeroDocumento);
              this.subscribeContratanteObs = this.subscribeContratante();
              this.fc['cemail'].setValue(resp.contratanteInfo.correo);
              this.fc['ctelefono'].setValue(resp.contratanteInfo.telefono);
              this.fc['cfechaNac'].setValue(
                resp.contratanteInfo.fechaNacimiento
              );

              this.fc['cemail'].valueChanges.subscribe((val) => {
                const changedata = this.resumenAT;
                changedata.contratanteInfo.correo = val;
                sessionStorage.setItem(
                  'resumen-atp',
                  JSON.stringify(changedata)
                );
              });
              this.fc['ctelefono'].valueChanges.subscribe((val) => {
                const changedata = this.resumenAT;
                changedata.contratanteInfo.telefono = val;
                sessionStorage.setItem(
                  'resumen-atp',
                  JSON.stringify(changedata)
                );
              });
              this.NSFECHA_NAC = resp.contratanteInfo.fechaNacimiento;
              this.iscollapse = false;
              this.FORM_COTIZAR.controls['cemail'].setValidators([
                Validators.required,
                Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
              ]);
              this.FORM_COTIZAR.controls['cemail'].updateValueAndValidity();

              this.FORM_COTIZAR.controls['cnDoc'].setValidators([
                Validators.required,
                Validators.pattern(/^[0-9]*$/),
                Validators.minLength(8),
                Validators.maxLength(8),
              ]);
              this.FORM_COTIZAR.controls['cnDoc'].updateValueAndValidity();

              this.FORM_COTIZAR.controls['ctelefono'].setValidators([
                Validators.pattern(/^[0-9]*$/),
                Validators.required,
                Validators.minLength(9),
                Validators.maxLength(9),
              ]);
              this.FORM_COTIZAR.controls['ctelefono'].updateValueAndValidity();

              this.FORM_COTIZAR.controls['cfechaNac'].setValidators([
                Validators.required,
              ]);
              this.FORM_COTIZAR.controls['cfechaNac'].updateValueAndValidity();

              this.fc['cnDoc'].disable();
            }
          }
        } else {
          sessionStorage.removeItem('isReturnDataDocument');
          sessionStorage.removeItem('_xvddv1cn_tr9x');
          this.sessionValidInfoDocument = 'false';
          this.vd.isResumen = false;
          this.returnTarifario = false;
          if (resp?.cotizacionInfo) {
            const resum = JSON.parse(this.resumenAtp || '{}');
            localStorage.setItem(
              'currentUser',
              JSON.stringify({
                nombreAsesor: resum?.cotizacionInfo?.nombreAsesor,
                email: resum?.cotizacionInfo?.correoAsesor,
              })
            );

            if (resp?.cotizacionInfo?.flagEmision === '1') {
              this.sendNotification('PolizaEmitidaVidaIndividual');
              return;
            }

            if (resp?.cotizacionInfo?.expiracion === '1') {
              this.linkVencido = true;
              this.sendNotification('LinkVencidoVidaIndividual');
              return;
            }
          }
        }
        // this.getDataOfDocument();
      },
      (err: any) => {
        console.error(err);
        this.spinner.hide();
      }
    );
  }

  changeValidatorsReact(valid: boolean) {
    switch (valid) {
      case false:
        this.FORM_COTIZAR.controls['cemail'].setValidators([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ]);
        this.FORM_COTIZAR.controls['cemail'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['cnDoc'].setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]);
        this.FORM_COTIZAR.controls['cnDoc'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['ctelefono'].setValidators([
          Validators.pattern(/^[0-9]*$/),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]);
        this.FORM_COTIZAR.controls['ctelefono'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['cfechaNac'].setValidators([
          Validators.required,
        ]);
        this.FORM_COTIZAR.controls['cfechaNac'].updateValueAndValidity();
        this.msgMissData = '';
        this.msgMissData2 = '';
        this.FORM_COTIZAR.controls['ctelefono'].setValue('');
        this.FORM_COTIZAR.controls['cemail'].setValue(null);
        if (this.isProcessValid && this.subscribeContratanteObs) {
          this.subscribeContratanteObs.unsubscribe();
        }
        this.FORM_COTIZAR.controls['cnDoc'].setValue('');
        this.subscribeContratanteObs = this.subscribeContratante();
        sessionStorage.removeItem('dataContratantenotSame');
        sessionStorage.removeItem('infoBenContratante');
        break;

      case true:
        this.FORM_COTIZAR.controls['cemail'].clearValidators();
        this.FORM_COTIZAR.controls['cemail'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['cnDoc'].clearValidators();
        this.FORM_COTIZAR.controls['cnDoc'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['ctelefono'].clearValidators();
        this.FORM_COTIZAR.controls['ctelefono'].updateValueAndValidity();

        this.FORM_COTIZAR.controls['cfechaNac'].clearValidators();
        this.FORM_COTIZAR.controls['cfechaNac'].updateValueAndValidity();

        this.msgMissData = '';
        this.msgMissData2 = '';
        this.FORM_COTIZAR.controls['ctelefono'].setValue(null);
        this.FORM_COTIZAR.controls['cemail'].setValue(null);
        this.FORM_COTIZAR.controls['cnDoc'].setValue(null);

        sessionStorage.removeItem('dataContratantenotSame');
        sessionStorage.removeItem('infoBenContratante');

        break;
    }
  }

  renewSellingPoint(): Observable<Selling> {
    const sellingConfig = {
      sellingChannel: environment.canaldeventadefault,
      sellingPoint: environment.puntodeventadefault,
      linkAgenciado: false,
    };

    this.saveToLocalStorage('selling', sellingConfig);

    return this._route.queryParams.pipe(
      switchMap((params) => {
        if (params.code) {
          return this.setSellingPoint(params.code);
        }
        return of(sellingConfig);
      })
    );
  }

  saveToLocalStorage(key: string, payload: any) {
    localStorage.setItem(key, JSON.stringify(payload));
  }

  setSellingPoint(code: string) {
    return this._mainService.obtenerLinkAgenciado(code).pipe(
      filter(
        (val) =>
          val.scodchannel !== undefined && val.scodsalepoint !== undefined
      ),
      map((response) => {
        const sellingConfig = {
          sellingChannel: response.scodchannel,
          sellingPoint: response.scodsalepoint,
          linkAgenciado: true,
        };
        this.saveToLocalStorage('selling', sellingConfig);
        return sellingConfig;
      })
    );
  }

  set isReturnDataDocumentSession(val) {
    sessionStorage.setItem('isReturnDataDocument', val);
  }

  get isReturnDataDocumentSession(): string {
    const is = sessionStorage.getItem('isReturnDataDocument') || null;
    return is;
  }

  get dataContratanteNotSame() {
    return JSON.parse(sessionStorage.getItem('dataContratantenotSame') || null);
  }

  get processId() {
    return JSON.parse(sessionStorage.getItem('processDigitalPlatform') || null);
  }

  get dataContratante() {
    return JSON.parse(sessionStorage.getItem('dataContratante') || null);
  }

  setDataOfStorage(): void {
    const val: VidaDevolucionModel = this._mainService.storage;
    this.fc['typeDoc'].setValue(Number(val.contratante.tipoDocumento));
    this.fc['nDoc'].setValue(val.contratante.numeroDocumento);
    this.fc['email'].setValue(val.contratante.correo);
    this.fc['telefono'].setValue(val.contratante.celular);
    this.fc['fechaNac'].setValue(val.contratante.fechaNacimiento);
    this.FECHA_NAC = val.contratante.fechaNacimiento;
    this.fc['terms'].setValue(true);
    this.fc['privacy'].setValue(val.contratante.privacidad !== '0');
    this.iscollapse = val.contratante.contraSegurado;
    if (this._mainService.storage) {
      this.documentResponse.returnBirthDate =
        this._mainService.storage.contratante.fechaNacimientoReturnOfApi;
      this.documentResponse.success =
        !!this._mainService.storage.contratante.fechaNacimiento;
    } else {
      this.documentResponse.returnBirthDate = false;
      this.documentResponse.success =
        !!this._mainService.storage.contratante.fechaNacimiento;
    }
    if (this.dataContratanteNotSame != null) {
      if (this.dataContratanteNotSame.success) {
        this.iscollapse = false;
        this.changeReturnValidators();
        this.fc['typeDoc'].setValue(Number(val.contratante.tipoDocumento));
        if (this.isProcessValid && this.subscribeContratanteObs) {
          this.subscribeContratanteObs.unsubscribe();
        }
        this.fc['cnDoc'].setValue(this.dataContratanteNotSame.documentNumber);
        this.subscribeContratanteObs = this.subscribeContratante();
        this.fc['cemail'].setValue(this.dataContratanteNotSame.email);
        this.fc['ctelefono'].setValue(this.dataContratanteNotSame.phone);
        this.fc['cfechaNac'].setValue(this.dataContratanteNotSame.birthDate);
      }
    }
  }

  changeReturnValidators() {
    this.FORM_COTIZAR.controls['cemail'].setValidators([
      Validators.required,
      Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
    ]);
    this.FORM_COTIZAR.controls['cemail'].updateValueAndValidity();

    this.FORM_COTIZAR.controls['cnDoc'].setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]*$/),
      Validators.minLength(8),
      Validators.maxLength(8),
    ]);
    this.FORM_COTIZAR.controls['cnDoc'].updateValueAndValidity();

    this.FORM_COTIZAR.controls['ctelefono'].setValidators([
      Validators.pattern(/^[0-9]*$/),
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(9),
    ]);
    this.FORM_COTIZAR.controls['ctelefono'].updateValueAndValidity();

    this.FORM_COTIZAR.controls['cfechaNac'].setValidators([
      Validators.required,
    ]);
    this.FORM_COTIZAR.controls['cfechaNac'].updateValueAndValidity();
  }

  changeTypeDoc(): void {
    this.fc['nDoc'].setValue(null);
    this.FECHA_NAC = '';
    this.fc['fechaNac'].setValue('');
    this.FECHA_NAC_IS_ERROR = false;
    this.NSFECHA_NAC_IS_ERROR = false;
    this.fc['fechaNac'].markAsUntouched();
    switch (Number(this.fc['typeDoc'].value)) {
      case 2: {
        this.MAXLENGTHDOCUMENT = 8;
        break;
      }
      case 4: {
        this.MAXLENGTHDOCUMENT = 9;
        break;
      }
      default: {
        this.MAXLENGTHDOCUMENT = 8;
        break;
      }
    }
  }

  get selling(): any {
    return this._mainService.getSellingPoint();
  }

  get fc(): any {
    return this.FORM_COTIZAR.controls;
  }

  get infoDocument(): any {
    return JSON.parse(sessionStorage.getItem('info-document')) || null;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  samePersonCheck() {
    const a = this.fc['cnDoc']?.value?.toString();
    const b = this.fc['nDoc']?.value?.toString();

    this.samePerson = a == b && a != null && b != null;
  }

  get errorSamePerson(): String {
    const a = this.fc['cnDoc']?.value?.toString();
    const b = this.fc['nDoc']?.value?.toString();

    this.samePerson = a == b && a != null && b != null;

    return this.samePerson ? 'El DNI del contratante no puede ser el mismo que el del asegurado.' : '';
  }

  submitFormCotizar(): void {
    if (this.FORM_COTIZAR.valid) {
      const newGtmPayload = {
        eventName: 'virtualEventGA4_A',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 1',
          'Sección': 'Cotización Datos DNI',
          'TipoAcción': 'Intención de avance',
          'CTA': 'Cotiza aquí',
          'CheckTérminos': 'Activado',
          'CheckComunicaciones': this.fc['privacy'].value ? 'Activado' : 'Desactivado'
        }
      };
      this.trackingService.gtmTracking(newGtmPayload);

      this.spinner.show();
      let dateIso: string;
      let date: Date;
      let fechaNacimientoFormatToValidate: Date;
      let idProcess = Number(sessionStorage.getItem('idProcess'));
      if (idProcess < 0) {
        sessionStorage.removeItem('idProcess');
        idProcess = 0;
      }
      let fechaNacimientoFormat = this.fc['fechaNac']?.value?.toString();
      if (this.fc['fechaNac']?.value?.toString().length > 10) {
        dateIso = new Date(this.fc['fechaNac']?.value).toISOString();
        date = new Date(dateIso);
        fechaNacimientoFormat = moment(date).format('DD/MM/YYYY').toString();
        this.fc['fechaNac'].setValue(fechaNacimientoFormat);
        this.FECHA_NAC = fechaNacimientoFormat;
      }
      this.vd.contratante.fechaNacimiento = this.FECHA_NAC;
      this._mainService.storage = this.vd;
      const dayF = fechaNacimientoFormat.substring(0, 2);
      const mesF = fechaNacimientoFormat.substring(3, 5);
      const yearF = fechaNacimientoFormat.substring(6, 10);
      fechaNacimientoFormatToValidate = new Date(`${yearF}/${mesF}/${dayF}`);
      this.isValidFechaNacimiento =
        fechaNacimientoFormatToValidate <= this.limitDate;
      const data: any = {
        idProcess: idProcess || 0,
        idTipoDocumento: Number(this.fc['typeDoc'].value),
        numeroDocumento: this.fc['nDoc']?.value?.toString(),
        // tslint:disable-next-line:max-line-length
        nombres:
        // tslint:disable-next-line:max-line-length
          `${this.infoDocument?.p_SCLIENT_NAME} ${this.infoDocument?.p_SCLIENT_APPPAT} ${this.infoDocument?.p_SCLIENT_APPMAT}`?.trim() ||
          null,
        primerApellido: this.infoDocument?.p_SCLIENT_APPPAT || null,
        fechaNacimiento: fechaNacimientoFormat,
        telefono: this.fc['telefono'].value,
        email: this.fc['email'].value,
        idFlujo: '1',
        idTipoPersona: 1,
        codigoUsuario: '3822',
        canalVenta:
          this.resumen?.canalInfo?.codigoCanal || this.selling?.sellingChannel,
        puntoVenta:
          this.resumen?.canalInfo?.codigoPuntoVenta ||
          this.selling?.sellingPoint,
        terminos: '0',
        privacidad: Number(this.fc['privacy'].value).toString(),
        homonimo: '0',
        origen: 'S',
      };

      this.vd.contratante = {
        ...this.vd.contratante,
        privacidad: data.privacidad,
        celular: data.telefono,
        fechaNacimiento: data.fechaNacimiento,
        numeroDocumento: data.numeroDocumento,
        correo: data.email,
        terminos: true,
      };
      this.vd.codigoUsuario = data.codigoUsuario;
      this.vd.canalVenta = data.canalVenta;
      this.vd.puntoVenta = data.puntoVenta;
      this.vd.idProcess = data.idProcess;
      this._mainService.storage = this.vd;
      const day = this.FECHA_NAC.substring(0, 2);
      const mes = this.FECHA_NAC.substring(3, 5);
      const year = this.FECHA_NAC.substring(6, 10);
      if (this.isReturnDataDocumentSession === '0') {
        let dataDocument: DocumentRequest;
        let isCe: boolean;
        if (Number(this.fc['typeDoc'].value) === 4) {
          dataDocument = {
            document: {
              nDoc: this.fc['nDoc'].value,
              typeDoc: this.fc['typeDoc'].value,
            },
          };
          isCe = false;
        } else {
          dataDocument = {
            documentMigration: {
              nDoc: this.fc['nDoc'].value,
              dia: day,
              mes: mes,
              year: year,
            },
          };
          isCe = true;
        }
        this._Step1Service.getDataOfDocument(dataDocument, isCe).subscribe(
          (res: any) => {
            const datos = {
              p_SCLIENT_APPPAT: res.apellidoPaterno,
              p_SCLIENT_APPMAT: res.apellidoMaterno,
              p_SCLIENT_NAME: res.nombre,
            };
            sessionStorage.setItem('info-document', JSON.stringify(datos));
          },
          (err: any) => {
            console.error(err);
            this.spinner.hide();
          }
        );
      } else {
        if (!this.iscollapse) {
          const data2: any = {
            idProcess: idProcess || 0,
            idTipoDocumento: Number(this.fc['typeDoc'].value),
            numeroDocumento: this.fc['cnDoc']?.value?.toString(),
            // tslint:disable-next-line:max-line-length
            nombres:
            // tslint:disable-next-line:max-line-length
              `${this.dataContratanteNotSame?.names} ${this.dataContratanteNotSame?.apellidoPaterno} ${this.dataContratanteNotSame?.apellidoMaterno}`?.trim() ||
              null,
            primerApellido:
              this.dataContratanteNotSame?.apellidoPaterno || null,
            fechaNacimiento: this.fc['cfechaNac'].value,
            telefono: this.fc['ctelefono'].value,
            email: this.fc['cemail'].value,
            idFlujo: '1',
            idTipoPersona: 1,
            codigoUsuario: '3822',
            canalVenta:
              this.resumen?.canalInfo?.codigoCanal ||
              this.selling?.sellingChannel,
            puntoVenta:
              this.resumen?.canalInfo?.codigoPuntoVenta ||
              this.selling?.sellingPoint,
            terminos: '0',
            privacidad: Number(this.fc['privacy'].value).toString(),
            homonimo: '0',
            origen: 'S',
          };
          this.spinner.show();
          this.cotizarContratanteAsegurado(data, data2);
        } else {
          this.spinner.show();
          this.cotizar(data);
        }
      }
    }
  }

  private cotizarContratanteAsegurado(data, data2) {
    const ndoc = sessionStorage.getItem('ndocLink') || null;
    this._Step1Service.cotizar(data).subscribe(
      (res: Step1Response) => {
        if (!sessionStorage.getItem('idProcess')) {
          window['dataLayer'].length = 0;
          window['dataLayer'].push({
            'estado': 'Logueado',
            'user_id': sessionStorage.getItem('user-id-unique'),
            'TipoCliente': sessionStorage.getItem('client-type'),
            'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
          });
        }

        sessionStorage.setItem('idProcess', JSON.stringify(res.idProcess));
        sessionStorage.setItem('tarifario', JSON.stringify(res.rateAges));
        sessionStorage.setItem('cumulus', JSON.stringify(res.cumulus));
        if (this.dataContratanteNotSame) {
          const submitData = this.dataContratanteNotSame;
          submitData.email = this.fc['cemail'].value || '';
          submitData.phone = this.fc['ctelefono'].value;
          submitData.documentNumber = this.fc['cnDoc'].value;
          submitData.success = true;
          submitData.relationship = 0;

          sessionStorage.setItem(
            'dataContratantenotSame',
            JSON.stringify(submitData)
          );
        }
        const payloadRiskClient: any = {
          idProcess: Number(sessionStorage.getItem('idProcess')),
          idTipoDocumento: 2,
          numeroDocumento: this.FORM_COTIZAR.get('nDoc').value,
          // tslint:disable-next-line:max-line-length
          nombres: `${this.vd?.contratante.nombres} ${
            this.vd?.contratante.apellidoPaterno || ''
          } ${this.vd?.contratante.apellidoMaterno || ''}`.trim(),
          primerApellido: this.vd?.contratante.apellidoPaterno,
        };
        const payloadRiskClient2: any = {
          idProcess: Number(sessionStorage.getItem('idProcess')),
          idTipoDocumento: 2,
          numeroDocumento: data2?.numeroDocumento,
          // tslint:disable-next-line:max-line-length
          nombres: data2?.nombres,
          primerApellido: data2?.primerApellido,
        };
        this.vd.idProcess = res.idProcess;
        this.vd.cumulus = {
          nCountPolicy: res.cumulus.nCountPolicy,
          nCumulusAvailable: res.cumulus.nCountPolicy,
          nTc: res.cumulus.nTc,
          sExceedsCumulus: res.cumulus.sExceedsCumulus,
        };
        this._mainService.storage = this.vd;
        // this._utilsService.clienteRiesgo(payloadRiskClient).subscribe();
        if (res.success) {
          if (res.cumulus.sExceedsCumulus == 'S') {
            this.returnTarifario = false;
            this.sendNotification('ErrorTarifarioVdp');
            this.spinner.hide();
            sessionStorage.clear();
            return;
          } else {
            sessionStorage.setItem('step', '2');
            if (res.rateAges !== null) {
              this.returnTarifario = true;
            } else {
              this.returnTarifario = false;
              sessionStorage.clear();
              return;
            }
          }
        } else {
          if (res.saltarIdecon) {
            sessionStorage.setItem('step', '2');
            if (res.rateAges !== null) {
              this.returnTarifario = true;
              /* this.nextStep(); */
            } else {
              this.returnTarifario = false;
              this.sendNotification(res.errorCode);
              sessionStorage.clear();
            }
            return;
          }
          if (res.saltarWorldCheck) {
            this.returnTarifario = false;
            this.sendNotification(res.errorCode);
            sessionStorage.clear();
            return;
          }
          this.returnTarifario = false;
          if (res.idProcess > 0) {
            this.spinner.hide();
            this.sendNotification(res.errorCode);
            sessionStorage.clear();
            // localStorage.removeItem('token');
          }
        }
        this._utilsService.nuevoClienteRiesgo(payloadRiskClient).subscribe(
          (rep: any) => {
            this.vd.tarifario = {
              isFamPep: rep.idecon.isFamPep,
              isIdNumber: rep.idecon.isIdNumber,
              isIdNumberFamPep: rep.idecon.isIdNumberFamPep,
              isOtherList: rep.idecon.isOtherList,
              isPep: rep.idecon.isPep,
              rateAges: res.rateAges,
              saltarExperian: res.saltarExperian,
              saltarIdecon: res.saltarIdecon,
              saltarWorldCheck: res.saltarWorldCheck,
            };
            sessionStorage.setItem(
              'validity',
              JSON.stringify({
                ...rep.idecon,
              })
            );
            if (rep.idecon.isOtherList || rep.worldCheck.isOtherList) {
              this.ideconDC = rep.idecon;
              this.worldCheckDC = rep.worldCheck;
              this.check1 = true;
              this.sendNotification('PEPVidaIndividual');
              /*  this.returnTarifario = false;
                               sessionStorage.clear();
                               return; */
            } else {
              this.check1 = false;
            }
            this._utilsService.nuevoClienteRiesgo(payloadRiskClient2).subscribe(
              (resp: any) => {
                this.spinner.hide();
                if (resp.idecon.isOtherList || resp.worldCheck.isOtherList) {
                  this.ideconDC = resp.idecon;
                  this.worldCheckDC = resp.worldCheck;
                  this.check2 = true;
                  this.sendNotificationContractorCase('PEPVidaIndividual');
                  /* this.returnTarifario = false;
                                      sessionStorage.clear();
                                      return; */
                } else {
                  this.check2 = false;
                }
                if (!this.check1 && !this.check2) {
                  this.returnTarifario = true;
                  if (ndoc == null) {
                    this.saveDataContratante();
                  }
                  this.nextStep();
                } else {
                  this.returnTarifario = false;
                  sessionStorage.clear();
                  return;
                }
              },
              (err: any) => {
                console.error(err);
                this.returnTarifario = false;
                this.spinner.hide();
              }
            );
          },
          (err: any) => {
            console.error(err);
            this.returnTarifario = false;
            this.spinner.hide();
          }
        );
      },
      (err: any) => {
        console.error(err);
        this.returnTarifario = false;
        this.spinner.hide();
      }
    );
  }

  private cotizar(data) {
    const ndoc = sessionStorage.getItem('ndocLink') || null;
    this._Step1Service.cotizar(data).subscribe(
      (res: Step1Response) => {
        if (!sessionStorage.getItem('idProcess')) {
          window['dataLayer'].length = 0;
          window['dataLayer'].push({
            'estado': 'Logueado',
            'user_id': sessionStorage.getItem('user-id-unique'),
            'TipoCliente': sessionStorage.getItem('client-type'),
            'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
          });
        }

        sessionStorage.setItem('idProcess', JSON.stringify(res.idProcess));
        sessionStorage.setItem('tarifario', JSON.stringify(res.rateAges));
        sessionStorage.setItem('cumulus', JSON.stringify(res.cumulus));
        sessionStorage.removeItem('infoContratante');
        if (this.iscollapse) {
          const dataSamePerson = new DocumentFormatNotSameResponse({
            ...this.user,
            relationship: 0,
            p_SMAIL: this.fc['email'].value,
            p_SPHONE: this.fc['telefono'].value,
            success: false,
          });

          sessionStorage.setItem(
            'dataContratantenotSame',
            JSON.stringify(dataSamePerson)
          );
        }
        if (!this.iscollapse) {
          if (this.dataContratante) {
            if (this.dataContratante.success) {
              const saveInfo = this.dataContratante;
              saveInfo.email = this.fc['cemail'].value;
              saveInfo.phone = this.fc['ctelefono'].value;
              saveInfo.success = true;
              sessionStorage.setItem(
                'dataContratantenotSame',
                JSON.stringify(saveInfo)
              );
            }
          } else {
            /*  this.itemTest = this.infoBenCont; */
            const updateData = JSON.parse(
              sessionStorage.getItem('dataContratantenotSame')
            );
            updateData.email = this.fc['cemail'].value;
            updateData.phone = this.fc['ctelefono'].value;
            updateData.success = true;

            sessionStorage.setItem(
              'dataContratantenotSame',
              JSON.stringify(updateData)
            );
          }
        }
        this.vd.idProcess = res.idProcess;
        const payloadRiskClient: any = {
          idProcess: Number(sessionStorage.getItem('idProcess')),
          idTipoDocumento: 2,
          numeroDocumento: this.FORM_COTIZAR.get('nDoc').value,
          // tslint:disable-next-line:max-line-length
          nombres: `${this.vd?.contratante.nombres} ${
            this.vd?.contratante.apellidoPaterno || ''
          } ${this.vd?.contratante.apellidoMaterno || ''}`.trim(),
          primerApellido: this.vd?.contratante.apellidoPaterno,
        };

        this.vd.cumulus = {
          nCountPolicy: res.cumulus.nCountPolicy,
          nCumulusAvailable: res.cumulus.nCountPolicy,
          nTc: res.cumulus.nTc,
          sExceedsCumulus: res.cumulus.sExceedsCumulus,
        };
        this._mainService.storage = this.vd;
        if (res.success) {
          if (res.cumulus.sExceedsCumulus == 'S') {
            this.returnTarifario = false;
            this.sendNotification('ErrorTarifarioVdp');
            // sessionStorage.clear();
          } else {
            sessionStorage.setItem('step', '2');
            if (res.rateAges !== null) {
              this.returnTarifario = true;
            } else {
              this.returnTarifario = false;
              sessionStorage.clear();
              return;
            }
          }
        } else {
          if (res.saltarIdecon) {
            sessionStorage.setItem('step', '2');
            if (res.rateAges !== null) {
              this.returnTarifario = true;
            } else {
              this.returnTarifario = false;
              this.sendNotification(res.errorCode);
              sessionStorage.clear();
            }
            return;
          }
          this.returnTarifario = false;
          if (res.idProcess > 0) {
            this.sendNotification(res.errorCode);
            sessionStorage.clear();
            // localStorage.removeItem('token');
          }
        }
        this._utilsService.nuevoClienteRiesgo(payloadRiskClient).subscribe(
          (response: any) => {
            this.spinner.hide();
            this.vd.tarifario = {
              isFamPep: response.idecon.isFamPep,
              isIdNumber: response.idecon.isIdNumber,
              isIdNumberFamPep: response.idecon.isIdNumberFamPep,
              isOtherList: response.idecon.isOtherList,
              isPep: response.idecon.isPep,
              rateAges: res.rateAges,
              saltarExperian: res.saltarExperian,
              saltarIdecon: res.saltarIdecon,
              saltarWorldCheck: res.saltarWorldCheck,
            };
            sessionStorage.setItem(
              'validity',
              JSON.stringify({
                ...response.idecon,
              })
            );
            if (
              response.idecon.isOtherList ||
              response.worldCheck.isOtherList
            ) {
              this.ideconDC = response.idecon;
              this.worldCheckDC = response.worldCheck;
              this.sendNotification('PEPVidaIndividual');
              this.returnTarifario = false;
              sessionStorage.clear();
              return;
            }
            if (this.returnTarifario) {
              if (ndoc == null) {
                this.saveDataContratante();
              }
              this.nextStep();
            }
          },
          (err: any) => {
            console.error(err);
            this.returnTarifario = false;
            this.spinner.hide();
          }
        );
      },
      (err: any) => {
        console.error(err);
        this.returnTarifario = false;
        this.spinner.hide();
      }
    );
  }

  get errorDocument(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('nDoc')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('nDoc')?.touched;
    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          return 'El número de documento es obligatorio';
        }
        case 'pattern':
        case 'minlength':
        case 'maxlength': {
          return 'El número documento no es válido';
        }
      }
    }
    return '';
  }

  get contErrorDocument(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('cnDoc')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('cnDoc')?.touched;
    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          return 'El número de documento es obligatorio';
        }
        case 'pattern':
        case 'minlength':
        case 'maxlength': {
          return 'El número documento no es válido';
        }
      }
    }
    return '';
  }

  get errorEmail(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('email')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('email')?.touched;

    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          return 'Este campo es obligatorio';
        }
        case 'email': {
          return 'El correo electrónico no es válido';
        }
      }
    }
    return '';
  }

  get contErrorEmail(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('cemail')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('cemail')?.touched;

    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          return 'Este campo es obligatorio';
        }
        case 'email': {
          return 'El correo electrónico no es válido';
        }
      }
    }
    return '';
  }

  get errorFechaNac(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('fechaNac')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('fechaNac')?.touched;
    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          this.FECHA_NAC_IS_ERROR = true;
          return 'Este campo es obligatorio';
        }
        case 'pattern': {
          this.FECHA_NAC_IS_ERROR = true;
          return 'La fecha de nacimiento no es válida';
        }
      }
    }
    this.FORM_COTIZAR.get('fechaNac').markAsUntouched();
    this.FECHA_NAC_IS_ERROR = false;
    return '';
  }

  get NSerrorFechaNac(): string {
    const ERRORS: ValidationErrors | null =
      this.FORM_COTIZAR.get('cfechaNac')?.errors || null;
    const TYPE_ERROR: string | {} = Object.keys(
      ERRORS || {}
    )[0]?.toLocaleLowerCase();
    const TOUCHED: boolean = this.FORM_COTIZAR.get('cfechaNac')?.touched;
    if (TOUCHED) {
      switch (TYPE_ERROR) {
        case 'required': {
          this.NSFECHA_NAC_IS_ERROR = true;
          return 'Este campo es obligatorio';
        }
        case 'pattern': {
          this.NSFECHA_NAC_IS_ERROR = true;
          return 'La fecha de nacimiento no es válida';
        }
      }
    }
    this.FORM_COTIZAR.get('cfechaNac').markAsUntouched();
    this.NSFECHA_NAC_IS_ERROR = false;
    return '';
  }

  private validarRetornoInformacionApiDocumento(
    data: DocumentFormatResponse
  ): void {
    const haveBirthdate = !!data.birthDate;
    const haveNombres = !!data.names && !!data.apellidoPaterno;
    const haveSexo = !!data.sex;
    const isValid = haveBirthdate && haveNombres && haveBirthdate && haveSexo;
    this.sessionValidInfoDocument = isValid.toString();
    if (!isValid) {
      this.sendNotification('SinInformacionVidaIndividual');
    }
  }

  private set sessionValidInfoDocument(val: string) {
    sessionStorage.setItem('_data_document_valid', val);
  }

  get isValidInfoDocument(): boolean {
    return sessionStorage.getItem('_data_document_valid') === 'true' || false;
  }

  getDataDocumentNotSame() {
    this.samePersonCheck();
    if (this.fc['cnDoc'].valid) {
      this.spinner.show();
      const dataDocument: DocumentRequest = {
        document: {
          typeDoc: this.FORM_COTIZAR.get('typeDoc').value || null,
          nDoc: this.FORM_COTIZAR.get('cnDoc').value || null,
        },
      };

      if (dataDocument.document?.nDoc !== null) {
        this.documentContratante = true;
        if (!this.isProcessValid) {
          this.requestClientInfo();
        } else {
          this.spinner.hide();
        }
      } else {
        this.msgMissData = '';
        this.spinner.hide();
      }
    }
  }

  getDataOfDocument() {
    sessionStorage.removeItem('insurance');

    if (this.vd.isResumen) {
      return;
    }

    if (this.fc['nDoc'].valid) {
      this.documentContratante = false;
      this.requestClientInfo();
    }
  }

  get getValTerms(): boolean {
    return this.FORM_COTIZAR.get('terms')?.value;
  }

  get user(): any {
    return JSON.parse(sessionStorage.getItem('info-document'));
  }

  changeTerms(check): void {
    this.FORM_COTIZAR.get('terms').setValue(check);
  }

  changePolicy(check): void {
    this.FORM_COTIZAR.get('privacy').setValue(check);
  }

  showHideModalBeneficios(isShow: boolean): void {
    isShow ? this.modalBeneficios.show() : this.modalBeneficios.hide();
  }

  get resumen(): ResumenResponse {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  get resumenAT(): any {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  nextStep(): void {
    const gtmPayload1 = {
      eventName: 'virtualEventGA4_B',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 1',
        'Sección': 'Cotización Datos DNI',
        'TipoAcción': 'Avance exitoso',
        'CTA': 'Cotiza aquí',
        'CheckTérminos': 'Activado',
        'CheckComunicaciones': this.fc['privacy'].value ? 'Activado' : 'Desactivado',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess') ?? '0',
        'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtmPayload1);

    const gtmPayload2 = {
      eventName: 'userData',
      payload: {
        'userID': this.mainService.userId,
        'PagePath': location.pathname,
        'TimeStamp': new Date().getTime().toString()
      }
    };
    this.trackingService.gtmTracking(gtmPayload2);

    if (this.resumen) {
      // tslint:disable-next-line:prefer-const
      let dataBeneficiarios: Array<any> = [];
      let index = 1;
      this.resumen.beneficiariosInfo.forEach((val) => {
        const databenf: BeneficiarioDto = {
          apellidoMaterno: val.apellidoMaterno,
          apellidoPaterno: val.apellidoPaterno,
          codigoCliente: val.codigoCliente,
          complete: true,
          departamento: {
            id: val.idDepartamento,
            descripcion: val.departamento,
          },
          direccion: val.direccion,
          distrito: {
            descripcion: val.distrito,
            id: val.idDistrito,
          },
          email: val.correo,
          fechaNacimiento: val.fechaNacimiento,
          idNacionalidad: val.idNacionalidad,
          idSexo: val.idSexo,
          idTipoDocumento: val.idTipoDocumento,
          idTipoPersona: Number(val.idTipoPersona),
          nacionalidadDesc: val.nacionalidad,
          nombre: val.nombre,
          numeroDocumento: val.numeroDocumento,
          porcentajeParticipacion: Number(val.porcentajeParticipacion),
          provincia: {
            descripcion: val.provincia,
            id: val.idProvincia,
          },
          relacion: {
            descripcion: val.parentesco,
            id: val.idParentesco,
          },
          telefono: val.telefono,
          index: index,
        };
        dataBeneficiarios.push(databenf);
        index++;
      });

      const data = {
        cantidadAnio: this.resumen.cotizacionInfo.cantidadAnios,
        moneda: this.resumen.cotizacionInfo.idMoneda,
        capital: this.resumen.cotizacionInfo.capital,
        porcentajeRetorno: this.resumen.cotizacionInfo.porcentajeRetorno,
        primaAnual: this.resumen.cotizacionInfo.primaAnual,
        primaMensual: this.resumen.cotizacionInfo.primaMensual,
        primaRetorno: this.resumen.cotizacionInfo.primaNeta,
        primaInicial: this.resumen.cotizacionInfo.primaInicial,
        primaFallecimiento: this.resumen.cotizacionInfo.primaPorcentajeRetorno,
        plan: this.resumen.cotizacionInfo.idPlan,
        readExlusionCoverage: false,
        beneficiarioLegal: !(this.resumen.beneficiariosInfo.length === 0),
        idTarifario: this.resumen.cotizacionInfo.idTarifario,
      };
      const dataStep2 = {
        idProcess: Number(sessionStorage.getItem('idProcess')),
        ...data,
        beneficiarios: dataBeneficiarios,
        fechaInicio: this.resumen.cotizacionInfo.fechaInicioVigencia,
        fechaFin: this.resumen.cotizacionInfo.fechaFinVigencia,
      };
      this.vd.idProcess = dataStep2.idProcess;
      this.vd.plan = {
        anios: Number(data.cantidadAnio),
        moneda: Number(data.moneda),
        capital: Number(data.capital),
        idPlan: Number(data.plan),
        porcentajeRetorno: Number(data.porcentajeRetorno),
        primaAnual: Number(data.primaAnual),
        primaFallecimiento: Number(data.primaFallecimiento),
        primaInicial: Number(data.primaInicial),
        primaMensual: Number(data.primaMensual),
        primaRetorno: Number(data.primaRetorno),
        fechaInicioVigencia: this.resumen.cotizacionInfo.fechaInicioVigencia,
        fechaFinVigencia: this.resumen.cotizacionInfo.fechaFinVigencia,
        terminos: true,
        beneficiarioLegal: !(this.resumen.beneficiariosInfo.length === 0),
        beneficiarios: dataBeneficiarios,
      };
      sessionStorage.setItem('step2', JSON.stringify(dataStep2));
      sessionStorage.setItem(
        'dataBeneficiarios',
        JSON.stringify(dataBeneficiarios)
      );
    }

    sessionStorage.setItem(
      'step1',
      JSON.stringify(this.FORM_COTIZAR.getRawValue())
    );
    this._mainService.storage = this.vd;
    this._mainService.step = 2;

    this._Router.navigate(['/vidadevolucion/step2'], {
      queryParamsHandling: 'merge',
    });
  }

  showModal() {
    // this.modalRef = this.modalService.show(this.termsModal);
    const data = {
      archivo: sessionStorage.getItem('formato-trama-vd'),
      nombre: 'Terminos y condiciones.pdf',
    };
    this.downloadArchivo(data);
  }

  closePrivacyModal() {
    this.modalRef.hide();
  }

  closePrivacyModaPolicy() {
    this.modalRef.hide();
  }

  get nameUser(): string {
    if (!!this.user?.p_SCLIENT_NAME) {
      return ` ${this.user.p_SCLIENT_NAME}, `;
    } else {
      return ', ';
    }
  }

  refreshPage(): void {
    sessionStorage.clear();
    localStorage.removeItem('token');
    this.vd.isResumen = false;
    this.returnTarifario = true;
    this._Router.navigate(['/vidadevolucion'], {
      queryParamsHandling: 'merge',
    });
    // location.reload();
  }

  get idecon(): any {
    return JSON.parse(sessionStorage.getItem('validity'));
  }

  get namesComplete(): string {
    return `${this?.user?.p_SCLIENT_NAME || ''} ${
      this?.user?.p_SCLIENT_APPPAT || ''
    } ${this?.user?.p_SCLIENT_APPMAT || ''}`.trim();
  }

  get resumenAtp(): any {
    return sessionStorage.getItem('resumen-atp');
  }

  get cumulus(): any {
    return JSON.parse(sessionStorage.getItem('cumulus'));
  }

  getMonedaDesc(val): string {
    switch (Number(val)) {
      case 1: {
        return 'SOLES';
      }
      case 2: {
        return 'DÓLARES';
      }
      default: {
        return 'DESCRIPCION MONEDA';
      }
    }
  }

  getSumaAsegurada() {
    if (this.cumulus.nCumulusAvailble == this.cumulus.nCumulusMax) {
      return this.cumulus.nCumulusMax;
    } else {
      return this.cumulus.nCumulusMax - this.cumulus.nCumulusAvailble;
    }
  }

  private sendNotification(type): void {
    const resumen = JSON.parse(this.resumenAtp || '{}');
    const sumaAccure = this.getSumaAsegurada() || 0;
    const data: NotificationRequest = new NotificationRequest({
      idProcess: sessionStorage.getItem('idProcess') || 0,
      asegurado:
        this.namesComplete || `${resumen?.cotizacionInfo?.cliente || ''}`,
      cantidadAnios: resumen?.cotizacionInfo?.cantidadAnios || null,
      email: this.fc?.email?.value || resumen?.contratanteInfo?.correo || null,
      telefono:
        Number(this.fc['telefono']?.value) ||
        resumen?.contratanteInfo?.telefono ||
        null,
      fechaNacimiento:
        this.fc.fechaNac?.value ||
        resumen?.contratanteInfo?.fechaNacimiento ||
        null,
      fechaSolicitud: moment(new Date().toDateString()).format('DD/MM/YYYY'),
      monedaDescripcion: resumen?.cotizacionInfo?.moneda
        ? this.getMonedaDesc(resumen?.cotizacionInfo?.idMoneda)
        : null,
      monedaSimbolo: resumen?.cotizacionInfo?.moneda || null,
      nroDocumento:
        this.fc.nDoc?.value ||
        resumen?.contratanteInfo?.numeroDocumento ||
        null,
      porcentajeDevolucion: resumen?.cotizacionInfo?.porcentajeRetorno || null,
      // tslint:disable-next-line:max-line-length
      capital: resumen?.cotizacionInfo?.capital
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.capital).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaAnual: resumen?.cotizacionInfo?.primaAnual
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaAnual).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaFallecimiento: resumen?.cotizacionInfo?.capital
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.capital).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaInicial: resumen?.cotizacionInfo?.primaInicial
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaInicial).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaMensual: resumen?.cotizacionInfo?.primaMensual
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaMensual).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaRetorno: resumen?.cotizacionInfo?.primaPorcentajeRetorno
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaPorcentajeRetorno).toFixed(2)
        : null,
      tipoNotificacion: type,

      experianRisk: this.worldCheckDC?.experianRisk || false,
      isOtherListWC: this.worldCheckDC?.isOtherList,
      isIdNumberWC: this.worldCheckDC?.isIdNumber,
      isPepWC: this.worldCheckDC?.isPep,

      ...this.ideconDC,
      CumuloMaximo: this.cumulus.nCumulusMax || 0,
      TotalPolizas: this.cumulus.nTc || 0,
      SumaAsegurada: sumaAccure || 0,
    });
    if (this.iscollapse) {
      sessionStorage.removeItem('idProcess');
    }
    sessionStorage.removeItem('resumen-atp');

    this._mainService.sendNotification(data).subscribe();
  }

  private sendNotificationContractorCase(type): void {
    const resumen = JSON.parse(
      sessionStorage.getItem('dataContratantenotSame') || '{}'
    );
    const sumaAccure = 0;
    const data: NotificationRequest = new NotificationRequest({
      idProcess: sessionStorage.getItem('idProcess') || 0,
      asegurado: `${
        resumen?.names +
        ' ' +
        resumen?.apellidoPaterno +
        ' ' +
        resumen?.apellidoMaterno
      }`,
      cantidadAnios: resumen?.cotizacionInfo?.cantidadAnios || null,
      email: resumen?.email || null,
      telefono: resumen?.phone || null,
      fechaNacimiento: resumen?.birthDate || null,
      fechaSolicitud: moment(new Date().toDateString()).format('DD/MM/YYYY'),
      monedaDescripcion: resumen?.cotizacionInfo?.moneda
        ? this.getMonedaDesc(resumen?.cotizacionInfo?.idMoneda)
        : null,
      monedaSimbolo: resumen?.cotizacionInfo?.moneda || null,
      nroDocumento: resumen?.documentNumber || null,
      porcentajeDevolucion: resumen?.cotizacionInfo?.porcentajeRetorno || null,
      // tslint:disable-next-line:max-line-length
      capital: resumen?.cotizacionInfo?.capital
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.capital).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaAnual: resumen?.cotizacionInfo?.primaAnual
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaAnual).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaFallecimiento: resumen?.cotizacionInfo?.capital
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.capital).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaInicial: resumen?.cotizacionInfo?.primaInicial
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaInicial).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaMensual: resumen?.cotizacionInfo?.primaMensual
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaMensual).toFixed(2)
        : null,
      // tslint:disable-next-line:max-line-length
      primaRetorno: resumen?.cotizacionInfo?.primaPorcentajeRetorno
        ? resumen?.cotizacionInfo?.moneda +
        ' ' +
        Number(resumen?.cotizacionInfo?.primaPorcentajeRetorno).toFixed(2)
        : null,
      tipoNotificacion: type,

      experianRisk: this.worldCheckDC?.experianRisk || false,
      isOtherListWC: this.worldCheckDC?.isOtherList,
      isIdNumberWC: this.worldCheckDC?.isIdNumber,
      isPepWC: this.worldCheckDC?.isPep,

      ...this.ideconDC,
      CumuloMaximo: 0,
      TotalPolizas: 0,
      SumaAsegurada: sumaAccure,
    });
    sessionStorage.removeItem('idProcess');
    sessionStorage.removeItem('resumen-atp');

    this._mainService.sendNotification(data).subscribe();
  }

  downloadArchivo(response) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], { type: 'application/pdf' });
      FileSaver.saveAs(data, response.nombre);
    }
  }

  emailSuggestion(val: string): void {
    this.fc['email'].setValue(val);
  }

  DuemailSuggestion(val: string): void {
    this.fc['cemail'].setValue(val);
  }


  saveDataContratante() {
    const prove = JSON.parse(sessionStorage.getItem('info-document')) || null;
    const resumendata =
      JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;

    this.aseguradoContratante = !resumendata?.success;

    const payload = {
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idClient: prove.p_SCLIENT,
      numeroDocumento: prove.p_SDOCUMENT,
      aseguradoContratante: this.aseguradoContratante,
      definitiva: false,
      contratante:
        prove != null
          ? {
            idTipoPersona: 1,
            idTipoDocumento: Number(resumendata.documentType),
            numeroDocumento: resumendata.documentNumber,
            nombres: resumendata.names,
            apellidoPaterno: resumendata.apellidoPaterno,
            apellidoMaterno: resumendata.apellidoMaterno,
            fechaNacimiento: resumendata.birthDate,
            idSexo: resumendata.sex,
            homonimo: 0,
            parentesco: 0,
            telefono: resumendata.phone,
            correo: resumendata.email,
            direccion: resumendata.address,
            idEstadoCivil: Number(resumendata.civilStatus),
            idDepartamento: Number(resumendata.department),
            idProvincia: Number(resumendata.province) || null,
            idDistrito: Number(resumendata.district) || null,
            obligacionFiscal: false,
            idOcupacion: 0,
          }
          : null,
    };
    this._Step1Service.saveDataContratante(payload).subscribe();
  }

  requestClientInfo() {
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      if (this.documentContratante) {
        this.getFieldContratante(token);
      } else {
        this.getFieldAsegurado(token);
      }
    }
  }

  getFieldAsegurado(token) {
    this.spinner.show();
    this._utilsService
        .getNewTerms()
        .pipe(
          map((x) => {
            return x;
          }),
          mergeMap(() => {
            const payload: IDocumentInfoClientRequest = {
              idRamo: 71,
              idProducto: 1,
              idTipoDocumento: +this.fc.typeDoc?.value,
              numeroDocumento: this.fc.nDoc?.value,
              idUsuario: 3822,
              token: token,
            };
            return this._utilsService.documentInfoClientResponse(payload);
          })
        )
        .subscribe(
          (res: any) => {
            sessionStorage.setItem('client-type', res.clientType ?? 'No Cliente - Nuevo');
            sessionStorage.setItem('user-id-unique', res.id);

            if (res.names != null) {
              this.documentResponse = this.parseDocumentInfo(res);
              this.documentResponse.address =
                this.documentResponse?.address?.replace('–', '-') || null;
              this.setStorageAsegurado(this.parseDocumentResponse(res));
              this.fc['fechaNac'].setValue(this.vd.contratante.fechaNacimiento);
              this.fc['telefono'].setValue(this.vd.contratante.celular);
              this.fc['email'].setValue(this.vd.contratante.correo);
              this.FORM_COTIZAR.markAllAsTouched();
              this.validarRetornoInformacionApiDocumento(this.documentResponse);
              this.msgMissData2 = '';
            } else {
              this.msgMissData2 = 'Usuario sin información registrada';
            }

            this.spinner.hide();
            this.recaptcha.reset();
          },
          (err: any) => {
            console.error(err);
            this.FECHA_NAC = '';
            this.FORM_COTIZAR.get('fechaNac').setValue(this.FECHA_NAC);
            this.FECHA_NAC_IS_ERROR = false;
            this.NSFECHA_NAC_IS_ERROR = false;
            this.IS_CALL_NDOC = true;
            this.isReturnDataDocumentSession = '0';
            this.sessionValidInfoDocument = 'false';
            this.spinner.hide();
            this.recaptcha.reset();
          }
        );
  }

  setStorageAsegurado(res: DocumentResponse) {
    if (!!this.documentResponse.avatar) {
      sessionStorage.setItem('document-avatar', this.documentResponse.avatar);
    }

    this.vd = new VidaDevolucionModel({
      ...this._mainService.storage,
      contratante: {
        tipoDocumento: this.documentResponse.documentType?.toString(),
        numeroDocumento: this.documentResponse.documentNumber,
        nombres: this.documentResponse.names,
        apellidoPaterno: this.documentResponse.apellidoPaterno,
        apellidoMaterno: this.documentResponse.apellidoMaterno,
        celular: this.documentResponse.phone?.toString(),
        correo: this.documentResponse.email,
        nacionalidad: {
          id: this.documentResponse.nationality,
        },
        departamento: {
          id: this.documentResponse.department,
        },
        provincia: {
          id: this.documentResponse.province,
        },
        distrito: {
          id: this.documentResponse.district,
        },
        direccion: this.documentResponse.address,
        fechaNacimiento: this.documentResponse.birthDate,
        fechaNacimientoReturnOfApi: !!this.documentResponse.birthDate,
        sexo: this.documentResponse.sex,
        contraSegurado: this.iscollapse,
      },
    });

    this._mainService.storage = this.vd;

    if (this.documentResponse.names !== '') {
      this.isReturnDataDocumentSession = '1';
    } else {
      this.isReturnDataDocumentSession = '0';
    }
    this.FECHA_NAC = this.documentResponse.birthDate;
    this.IS_CALL_NDOC = true;

    // tslint:disable-next-line:prefer-const
    let dataToStorage: any = res;
    dataToStorage.p_NDOCUMENT_TYP = this.FORM_COTIZAR.get('typeDoc').value;
    dataToStorage.p_SDOCUMENT = this.FORM_COTIZAR.get('nDoc').value;
    sessionStorage.setItem('info-document', JSON.stringify(dataToStorage));
  }

  getFieldContratante(token) {
    const payload: IDocumentInfoClientRequest = {
      idRamo: 71,
      idProducto: 1,
      idTipoDocumento: +this.FORM_COTIZAR.get('typeDoc').value || null,
      numeroDocumento: this.FORM_COTIZAR.get('cnDoc').value || null,
      idUsuario: 3822,
      token: token,
    };
    this._utilsService
        .documentInfoClientResponse(payload)
        .subscribe(
          (response: any) => {
            this.setInformacionContratante(this.parseDocumentResponse(response));
            this.recaptcha.reset();
          },
          (error) => {
            console.error(error);
            this.recaptcha.reset();
          }
        );
  }

  setInformacionContratante(datos) {
    this.itemTest = datos;

    const documentData = new DocumentFormatNotSameResponse({
      ...this.itemTest,
      relationship: 0,
      success: true,
    });
    this.otherDocumentResponse = new DocumentFormatNotSameResponse({
      ...this.itemTest,
      success: true,
    });

    if (this.itemTest.p_SCLIENT_NAME != null) {
      sessionStorage.setItem(
        'dataContratantenotSame',
        JSON.stringify(this.otherDocumentResponse)
      );
      sessionStorage.setItem('infoContratante', JSON.stringify(datos));

      this.vd2 = new VidaDevolucionModel({
        ...this._mainService.storage,
        contratanteNotSame: {
          tipoDocumento: documentData.documentType?.toString(),
          numeroDocumento: documentData.documentNumber,
          nombres: documentData.names,
          apellidoPaterno: documentData.apellidoPaterno,
          apellidoMaterno: documentData.apellidoMaterno,
          celular: documentData.phone?.toString(),
          correo: documentData.email,
          nacionalidad: {
            id: documentData.nationality,
          },
          departamento: {
            id: documentData.department,
          },
          provincia: {
            id: documentData.province,
          },
          distrito: {
            id: documentData.district,
          },
          direccion: documentData.address,
          fechaNacimiento: documentData.birthDate,
          fechaNacimientoReturnOfApi: !!documentData.birthDate,
          sexo: documentData.sex,
        },
      });

      this.NSFECHA_NAC = documentData.birthDate;
      if (this.fc['cnDoc'].value != null && !this.resumenAT) {
        this.fc['cfechaNac'].setValue(documentData.birthDate || null);
        this.fc['ctelefono'].setValue(documentData.phone || null);
        this.fc['cemail'].setValue(documentData.email || null);
      }

      this.spinner.hide();
      this.msgMissData = '';

      this.fc['cfechaNac'].valueChanges.subscribe((val) => {
        if (val) {
          let dateIso: string;
          let date: Date;
          let fechaNacimientoFormatToValidate: Date;
          let fechaNacimientoFormat = this.fc['cfechaNac']?.value?.toString();
          if (this.fc['cfechaNac']?.value?.toString().length > 10) {
            dateIso = new Date(this.fc['cfechaNac']?.value).toISOString();
            date = new Date(dateIso);
            fechaNacimientoFormat = moment(date)
              .format('DD/MM/YYYY')
              .toString();
          }
          this.vd.contratante.fechaNacimiento = fechaNacimientoFormat;
          this._mainService.storage = this.vd;
          const dayF = fechaNacimientoFormat.substring(0, 2);
          const mesF = fechaNacimientoFormat.substring(3, 5);
          const yearF = fechaNacimientoFormat.substring(6, 10);
          fechaNacimientoFormatToValidate = new Date(
            `${yearF}/${mesF}/${dayF}`
          );
          this.NSisValidFechaNacimiento =
            fechaNacimientoFormatToValidate <= this.limitDate;
        }
      });
    } else {
      this.spinner.hide();
      if (!this.iscollapse) {
        this.msgMissData = 'Usuario sin información registrada';
      }
    }
  }

  private parseDocumentInfo(
    datosDocumento: DocumentInfoResponseModel
  ): DocumentFormatResponse {
    let result = new DocumentFormatResponse();
    result = {
      address: datosDocumento.address,
      apellidoMaterno: datosDocumento.apeMat,
      apellidoPaterno: datosDocumento.apePat,
      avatar: datosDocumento.image ?? '',
      birthDate: datosDocumento.birthdate,
      civilStatus: datosDocumento.civilStatus,
      completeNames: `${datosDocumento.names} ${datosDocumento.apePat} ${datosDocumento.apeMat}`,
      department: datosDocumento.department,
      district: datosDocumento.district,
      documentNumber: datosDocumento.documentNumber,
      documentType: datosDocumento.documentType,
      email: datosDocumento.email,
      names: datosDocumento.names,
      nationality: datosDocumento.nationality,
      phone: datosDocumento.phoneNumber,
      province: datosDocumento.province,
      returnBirthDate: datosDocumento.returnBirthdate,
      sex: datosDocumento.sex,
      success: datosDocumento.success,
    };
    return result;
  }

  private parseDocumentResponse(
    datosDocumento: DocumentInfoResponseModel
  ): DocumentResponse {
    return new DocumentResponse({
      p_DBIRTHDAT: datosDocumento.birthdate,
      p_NDOCUMENT_TYP: datosDocumento.documentType,
      p_NLOCAT: datosDocumento.department,
      p_NMUNICIPALITY: datosDocumento.district,
      p_NPERSON_TYP: 1,
      p_NPROVINCE: datosDocumento.province,
      p_SADDRESS: datosDocumento.address,
      p_SCLIENT: null,
      p_SCLIENT_APPMAT: datosDocumento.apeMat,
      p_SCLIENT_APPPAT: datosDocumento.apePat,
      p_SCLIENT_NAME: datosDocumento.names,
      p_SDOCUMENT: datosDocumento.documentNumber,
      p_SLEGALNAME: datosDocumento.legalName,
      p_SMAIL: datosDocumento.email,
      p_SPHONE: datosDocumento.phoneNumber,
      p_SSEXCLIEN: datosDocumento.sex,
      p_SISCLIENT_GBD: null,
      historicoSCTR: null,
      p_SFOTO: datosDocumento.image ?? ''
    });
  }

  parseInfomacionResumen(datosDocumento): DocumentResponse {
    return {
      p_DBIRTHDAT: datosDocumento.fechaNacimiento,
      p_NDOCUMENT_TYP: datosDocumento.idTipoDocumento,
      p_NLOCAT: datosDocumento.idDepartamento,
      p_NMUNICIPALITY: datosDocumento.idDistrito,
      p_NPERSON_TYP: datosDocumento.idTipoPersona,
      p_NPROVINCE: datosDocumento.idProvincia,
      p_SADDRESS: datosDocumento.direccion,
      p_SCLIENT: datosDocumento.codigoCliente,
      p_SCLIENT_APPMAT: datosDocumento.apellidoMaterno,
      p_SCLIENT_APPPAT: datosDocumento.apellidoPaterno,
      p_SCLIENT_NAME: datosDocumento.nombre,
      p_SDOCUMENT: datosDocumento.numeroDocumento,
      p_SLEGALNAME: null,
      p_SMAIL: datosDocumento.correo,
      p_SPHONE: datosDocumento.telefono,
      p_SSEXCLIEN: datosDocumento.idSexo,
      p_SISCLIENT_GBD: null,
      historicoSCTR: null,
      p_SFOTO: datosDocumento.foto
    };
  }

  private parseDocumentInfoResumen(datosDocumento): DocumentFormatResponse {
    let result = new DocumentFormatResponse();
    result = {
      address: datosDocumento.idDistrito,
      apellidoMaterno: datosDocumento.apellidoMaterno,
      apellidoPaterno: datosDocumento.apellidoPaterno,
      avatar: datosDocumento.image ?? '',
      birthDate: datosDocumento.fechaNacimiento,
      civilStatus: datosDocumento.idEstadoCivil,
      completeNames: `${datosDocumento.nombre} ${datosDocumento.apellidoPaterno} ${datosDocumento.apellidoMaterno}`,
      department: datosDocumento.idDepartamento,
      district: datosDocumento.idDistrito,
      documentNumber: datosDocumento.numeroDocumento,
      documentType: datosDocumento.idTipoDocumento,
      email: datosDocumento.correo,
      names: datosDocumento.nombre,
      nationality: datosDocumento.idNacionalidad,
      phone: datosDocumento.telefono,
      province: datosDocumento.idProvincia,
      returnBirthDate: datosDocumento.fechaNacimiento,
      sex: datosDocumento.idSexo,
      success: true,
    };
    return result;
  }
}
