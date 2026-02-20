import { animate, style, transition, trigger } from '@angular/animations';
import { DecimalPipe } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IVisaTokenRequest } from '@root/shared/interfaces/visa-token.interface';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { environment } from 'environments/environment';
import { AppConfig } from '@root/app.config';
import { BiometricResultDto, DataBiometricDto, } from '@shared/models/biometric/biometric.model';
import { SessionService } from '../../../soat/shared/services/session.service';
import { ParametersResponse } from '../../models/parameters.model';
import { Step4Request } from '../../models/step4.model';
import { VidaDevolucionModel } from '../../models/vidadevolucion.model';
import { MainService } from '../../services/main/main.service';
import { PaymentsService } from '../../services/payments.service';
import { Step2Service } from '../../services/step2/step2.service';
import { Step4Service } from '../../services/step4/step4.service';
import { ValidateQuotationService } from '@root/insurance/shared/services/validate-quotation.service';

import { IRegisterOtp, IValidateOtpResponse, } from '@shared/interfaces/otp-auth.interface';
import { OtpAuthService } from '@shared/services/otp-auth/otp-auth.service';
import { SlipRequest } from '../../models/slip.model';
import { Step1Service } from '../../services/step1/step1.service';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';
import { HttpErrorResponse } from '@angular/common/http';
import { KushkiService } from '@shared/services/kushki/kushki.service';

import { v4 as uuid } from 'uuid';
import { Kushki } from '@kushki/js';
import { RegularExpressions } from '@shared/regexp/regexp';
import { String } from '@shared/components/kushki-form/constants/constants';

declare var VisanetCheckout: any;

@Component({
  standalone: false,
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(250, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class Step4Component
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked, AfterViewInit {
  IS_COMPLETE_PAY: boolean;
  FORM_STEP4: FormGroup;
  FORM_STEP4_CONTRACTOR: FormGroup;
  formBio: FormGroup;
  USER_INFO: any;
  USER_INFO_API: any;
  CONTRACTOR_INFO: any;
  CONTRACTOR_INFO_MODAL: any;
  HAVE_OBLIGACIONES: any;
  countries: Array<{ id: number; descripcion: string }>;
  departments$: Array<any>;
  provinces$: Array<any>;
  arreglo$: Array<any>;
  districts$: Array<any>;
  provincesCon$: Array<any>;
  districtsCon$: Array<any>;
  parameters$: ParametersResponse;
  parametros$: any;
  paymentType$: any;
  detalleCompra: any;
  fechaProximoPago: string;
  visaSessionToken: any;
  flagDisable: boolean;
  flagExtraAC: boolean;
  today: Date;
  fullasecuName: string;
  fullContracName: string;
  stringparentesco: string;
  valContractor: any;

  showModalBiometric: boolean;
  modalAdjuntarArchivo: boolean;
  validateApprove: boolean;
  metododepagovalidation = false;

  stepBiom: number;
  fromEcommerce: boolean;
  aseguradoContratante: boolean;

  titleBiometric: string;
  successBiometric: boolean;

  linkAgenciado: { code: string; is: boolean };

  // BIOMETRICO
  biometricResult: BiometricResultDto;

  insurance: DataBiometricDto;

  formAuthMethod: FormGroup;

  sourcePagoEfectivo: SafeResourceUrl;
  authMethodData: IRegisterOtp;

  otpResponse: IValidateOtpResponse;
  selectedMethod: number;

  contractorValidate: boolean;
  aseguradoValidate: boolean;
  currentUserState: number; // 0 ---> asegurado || 1 ---> contratante

  validityInfo = JSON.parse(sessionStorage.getItem('validity'));
  pepInfo = JSON.parse(sessionStorage.getItem('clientePep'));

  // *MODAL SUCCESS
  @ViewChild('modalSuccess', { static: true, read: TemplateRef })
  modalSuccess: TemplateRef<ElementRef>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalParent', { static: true, read: TemplateRef })
  modalParent: TemplateRef<ElementRef>;
  titleModal: string;
  descriptionModal: string;
  contractorOcupation: string;

  // PARENTESCO
  relationshipContractor$: Array<any> = [];

  private kushki: Kushki;
  cardType: string = '';
  kushkiForm!: FormGroup;

 
  messageInfoKushki: string = '';

  @ViewChild('modalObligaciones', { static: true, read: TemplateRef })
  modalObligaciones: TemplateRef<ElementRef>;
  @ViewChild('modalDisclaimerPayment', { static: true, read: TemplateRef })
  modalDisclaimerPayment: TemplateRef<ElementRef>;
  @ViewChild('visaPay', { static: false, read: ElementRef })
  visaPay: ElementRef;
  @ViewChild('biometric', { static: false, read: ElementRef })
  biometric: ElementRef;
  @ViewChild('methodPayment', { static: false, read: ElementRef })
  methodPayment: ElementRef;
  @ViewChild('btnSubmit', { static: false, read: ElementRef })
  btnSubmit: ElementRef;
  @ViewChild('modalAuthMethod', { static: true, read: TemplateRef })
  _modalAuthMethod: TemplateRef<any>;
  @ViewChild('modalPagoEfectivo', { static: true, read: TemplateRef })
  _modalPagoEfectivo: TemplateRef<any>;
  @ViewChild('modalKushkiPayment', { static: true, read: TemplateRef })
  modalKushkiPayment: TemplateRef<ElementRef>;
  @ViewChild('modalKushki3DS', { static: true, read: TemplateRef })
  modalKushki3DS: TemplateRef<ElementRef>;

  constructor(
    private readonly _Router: Router,
    private readonly _Step4Service: Step4Service,
    private readonly _Step2Service: Step2Service,
    private readonly _SessionService: SessionService,
    private readonly _AppConfig: AppConfig,
    private readonly _BUILDER: FormBuilder,
    private readonly _DecimalPipe: DecimalPipe,
    private readonly _PaymentsService: PaymentsService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _changesDetector: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private readonly _Step1Service: Step1Service,
    private readonly _mainService: MainService,
    private readonly _vc: ViewContainerRef,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _otpAuthService: OtpAuthService,
    private readonly validateQuotationService: ValidateQuotationService,
    private readonly kushkiService: KushkiService,
    private readonly trackingService: TrackingService
  ) {
   
    this.valContractor = '';
    this.IS_COMPLETE_PAY = true;
    this.fullasecuName = '';
    this.fullContracName = '';
    this.stringparentesco = '';
    this.contractorOcupation = '';

    this.formAuthMethod = this._BUILDER.group({
      method: [null, Validators.required],
    });
    this.parametros$ = [];
    this.paymentType$ = {
      niubiz: false,
      kushki: false,
    };
    this.arreglo$ = [];
    this.FORM_STEP4 = this._BUILDER.group({
      names: [null, Validators.required],
      apePat: [null, Validators.required],
      apeMat: [null, Validators.required],
      sex: [null, Validators.required],
      idNacionalidad: [1, Validators.required],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      direccion: [null, Validators.required],
      phone: [
        null,
        Validators.compose([
          Validators.pattern(/^[9][0-9]*$/),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      estadoCivil: [null, Validators.required],
      ocupacion: [null, Validators.required],
      obligaciones: [null, Validators.required],
      parentesco: [null],
    });
    this.FORM_STEP4_CONTRACTOR = this._BUILDER.group({
      names: [null],
      apePat: [null],
      apeMat: [null],
      sex: [null],
      idNacionalidad: [1],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      direccion: [null, Validators.required],
      phone: [
        null,
        Validators.compose([
          Validators.pattern(/^[9][0-9]*$/),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      estadoCivil: [1, Validators.required],
      ocupacion: [1, Validators.required],
      obligacion: [null, Validators.required],
    });
    this.validateApprove = true;
    this.fromEcommerce = true;
    this.formBio = this._BUILDER.group({
      img: [null],
      file: [null, Validators.required],
    });
    this.USER_INFO = JSON.parse(sessionStorage.getItem('step1'));
    this.USER_INFO_API = JSON.parse(sessionStorage.getItem('info-document'));
    this.CONTRACTOR_INFO = this.USER_INFO_API;
    const prove =
      JSON.parse(sessionStorage.getItem('infoContratante')) ||
      JSON.parse(sessionStorage.getItem('infoBenContratante'));
    if (prove) {
      // tslint:disable-next-line:max-line-length
      this.CONTRACTOR_INFO =
        JSON.parse(sessionStorage.getItem('infoContratante')) ||
        JSON.parse(sessionStorage.getItem('infoBenContratante'));
    } else {
      this.CONTRACTOR_INFO = this.USER_INFO_API;
    }
    this.CONTRACTOR_INFO_MODAL = this.USER_INFO_API;

    this.f['direccion'].setValue(
      this._mainService.storage.contratante?.direccion
    );
    this.f['names'].setValue(this._mainService.storage.contratante?.nombres);
    this.f['apePat'].setValue(
      this._mainService.storage.contratante?.apellidoPaterno
    );
    this.f['apeMat'].setValue(
      this._mainService.storage.contratante?.apellidoMaterno
    );
    this.f['sex'].setValue(this._mainService.storage.contratante?.sexo);
    this.f['phone'].setValue(this._mainService.storage.contratante?.celular);
    this.f['names'].disable();
    this.f['apeMat'].disable();
    this.f['apePat'].disable();
    this.f['sex'].disable();
    if (this.dataContratanteNotSame.success) {
      this.f['phone'].disable();
      this.f['obligaciones'].setValue(0);
    }

    this.HAVE_OBLIGACIONES = null;
    this.detalleCompra = JSON.parse(sessionStorage.getItem('step2'));
    this.fechaProximoPago = this.detalleCompra.fechaInicio;

    if (this.USER_INFO_API.p_NDOCUMENT_TYP === '4') {
      this.f['department'].setValue(null);
      this.f['province'].setValue(null);
      this.f['district'].setValue(null);
    } else {
      this.f['idNacionalidad'].setValue(1);
    }

    this.showModalBiometric = false;
    this.stepBiom = 1;
    this.successBiometric = false;

    if (this.linkAgenciadoStorage) {
      this.linkAgenciado = {
        code: this.linkAgenciadoStorage,
        is: true,
      };
    } else {
      this.linkAgenciado = {
        code: null,
        is: false,
      };
    }

    if (this.biometricStorage) {
      if (this.biometricStorage.success) {
        this.stepBiom = 3;
        this.modalAdjuntarArchivo = false;
        this.successBiometric = true;
        this.titleBiometric =
          '¡La validación de reconocimiento facial se realizó con éxito!';
      }
    }

    this.flagDisable =
      sessionStorage.getItem('processDigitalPlatform') ==
      sessionStorage.getItem('idProcess');
    if (this.flagDisable) {
      this.f['department'].disable();
      this.f['district'].disable();
      this.f['province'].disable();
      this.f['direccion'].disable();
      this.f['phone'].disable();
      this.f['parentesco'].disable();
      this.f['ocupacion'].disable();
      this.f['obligaciones'].disable();
      this.f['estadoCivil'].disable();
    }
      this.kushkiForm = this._BUILDER.group({
    cardNumber: ['', [
      Validators.required,
      Validators.pattern(RegularExpressions.numbers),
      Validators.minLength(14),
      Validators.maxLength(16),
    ]],
    dueDate: ['', [
      Validators.pattern('^(0[1-9]|1[0-2])/(0[1-9]|[1-2][0-9]|3[0-1])$'),
      Validators.required,
      Validators.maxLength(5),
    ]],
    cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
  });
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  get dataContratanteNotSame(): any {
    return JSON.parse(sessionStorage.getItem('dataContratantenotSame'));
  }

  get isMobile(): boolean {
    return navigator.userAgent.match(/Mobile/) !== null;
  }

  get linkAgenciadoStorage(): any {
    return sessionStorage.getItem('link-agenciado');
  }

  get resumenAtp() {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  get f() {
    return this.FORM_STEP4.controls;
  }

  get fc() {
    return this.FORM_STEP4_CONTRACTOR.controls;
  }

  get kushkiFormControl(): { [key: string]: AbstractControl } {
    return this.kushkiForm.controls;
  }

  get amountWithSimbol(): string {
    const amount = this._DecimalPipe.transform(
      Number(this.detalleCompra?.primaInicial),
      '1.2-2'
    );
    switch (Number(this.detalleCompra?.moneda)) {
      case 1: {
        return `S/ ${amount}`;
      }
      case 2: {
        return `US$ ${amount}`;
      }
    }
  }

  ngOnInit(): void {
    this.kushkiFormControl['cardNumber'].valueChanges.subscribe(
      (value: string) => {
        this.cardType = undefined;
        if (this.kushkiFormControl['cardNumber'].hasError('pattern')) {
          this.kushkiFormControl['cardNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.kushkiFormControl['dueDate'].valueChanges.subscribe((value: string) => {
      const split = value.split('/');

      split.forEach((val) => {
        const regex = new RegExp(RegularExpressions.numbers);

        if (!regex.test(val)) {
          if (!val) {
            return;
          }

          this.kushkiFormControl['dueDate'].setValue('', {
            emitEvent: false,
          });
        }
      });

      if (value.length === 2) {
        this.kushkiFormControl['dueDate'].setValue(`${value}/`);
      }
    });

    let resp: any = sessionStorage.getItem('_str_pay');
    if (!!resp) {
      resp = JSON.parse(resp);
      if (resp?.success || resp?.errorCode === 'ERROR_EMISION') {
        sessionStorage.clear();
        this._Router.navigate(['/vidadevolucion/step1'], {
          queryParamsHandling: 'merge',
        });
        return;
      }
    }
    this.f['department'].valueChanges.subscribe((val) => {
      this.provinces$ = [];
      this.districts$ = [];

      this.buscarProvincias(val);
    });
    this.f['province'].valueChanges.subscribe((val) => {
      this.districts$ = [];

      this.buscarDistrito(val);
    });
    this._Step2Service.getParameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = res;
        this.departments$ = res.ubigeos;
        this.countries = res.nacionalidades;
        this.setUbigeos();
        if (this.CONTRACTOR_INFO != null) {
          this.setUbigeosContrantanteNotSame();
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
    this.FORM_STEP4.valueChanges.subscribe((val) => {
      this.saveDataToStorage();
      this.FORM_STEP4.markAllAsTouched();
      const submitData = JSON.parse(sessionStorage.getItem('info-document'));
      submitData.p_NPROVINCE = this.f['department'].value;
      submitData.p_NLOCAT = this.f['province'].value;
      submitData.p_NMUNICIPALITY = this.f['district'].value;
      submitData.p_OCUPATION = this.f['ocupacion'].value;
      submitData.p_OBLIGATE = this.f['obligaciones'].value;
      submitData.p_NCIVILSTA = this.f['estadoCivil'].value;
      submitData.p_IDPARENT = this.f['parentesco'].value;
      sessionStorage.setItem('info-document', JSON.stringify(submitData));
    });

    this.FORM_STEP4_CONTRACTOR.valueChanges.subscribe((val) => {
      let submitDataContractor = JSON.parse(
        sessionStorage.getItem('infoContratante')
      );
      this.FORM_STEP4_CONTRACTOR.markAllAsTouched();

      if (this.fc['department'].value) {
        submitDataContractor.p_NPROVINCE = this.fc['department'].value;
      }

      if (this.fc['province'].value) {
        submitDataContractor.p_NLOCAT = this.fc['province'].value;
      }

      if (this.fc['ocupacion'].value) {
        submitDataContractor = {
          ...submitDataContractor,
          p_OCUPATION: this.fc['ocupacion'].value,
        };
      }

      if (this.fc['district'].value) {
        submitDataContractor.p_NMUNICIPALITY = this.fc['district'].value;
      }

      if (this.fc['obligacion'].value) {
        submitDataContractor.p_OBLIGATE = this.fc['obligacion'].value;
      }

      if (this.fc['estadoCivil'].value) {
        submitDataContractor.p_NCIVILSTA = this.fc['estadoCivil'].value;
      }

      if (this.fc['parentesco']?.value) {
        submitDataContractor.p_IDPARENT = this.f['parentesco'].value;
      }

      sessionStorage.setItem(
        'infoContratante',
        JSON.stringify(submitDataContractor)
      );
    });
    this.f['phone'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['phone'].value?.toString()?.substring(0, 1) !== '9') {
          this.f['phone'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
        if (this.f['phone'].hasError('pattern')) {
          this.f['phone'].setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
      }
    });

    this.getParameters();
    this.getPaymentType();

    const ndoc = sessionStorage.getItem('ndocLink');

    if (this.numDocExist || ndoc) {
      this.fromEcommerce = false;
      this.activateValidationContratante();

      if (+this.resumenAtp.aseguradoInfo.aseguradoContratante == 1) {
        if (ndoc == this.resumenAtp.contratanteInfo.numeroDocumento) {
          this.flagExtraAC = false;
          this.currentUserState = 1;
          this.aseguradoValidate = this.resumenAtp.cotizacionInfo.validacionAsegurado;
          this.contractorValidate = this.resumenAtp.cotizacionInfo.validacionContratante;
        } else if (ndoc == this.resumenAtp.aseguradoInfo.numeroDocumento) {

          this.flagExtraAC = true;
          this.currentUserState = 0;
          this.aseguradoValidate = this.resumenAtp.cotizacionInfo.validacionAsegurado;
          this.contractorValidate = this.resumenAtp.cotizacionInfo.validacionContratante;
        }
      }
      if (+this.resumenAtp.aseguradoInfo.aseguradoContratante == 0) {
        this.fromEcommerce = true;
      }
    }

    if (this.CONTRACTOR_INFO != null) {
      this.fc['obligacion'].valueChanges.subscribe((val) => {
        const dataStorage = this.CONTRACTOR_INFO;
        dataStorage.p_SISCLIENT_IND = val;
        sessionStorage.setItem('infoContratante', JSON.stringify(dataStorage));
      });
      if (this.CONTRACTOR_INFO.p_SDOCUMENT != this.USER_INFO_API.p_SDOCUMENT) {
        this.activateValidationContratante();
        this.insertContractorData();

        this.f['parentesco'].valueChanges.subscribe((val) => {
          this.arreglo$ = [23, 11, 1002, 3, 38, 9];
          const exist = this.arreglo$?.find((x) => x == val);
          if (exist && this.fromEcommerce) {
            this.stringparentesco = this.parameters$?.parentescos.find(
              (x) => Number(x.id) === Number(this.f['parentesco'].value)
            )?.descripcion;
            this.shownew();
          }
        });
      }
    }

    this.getResumen(this.idProcess);

    if (
      this.resumenAtp?.contratanteInfo?.numeroDocumento ===
      this.resumenAtp?.aseguradoInfo?.numeroDocumento
    ) {
      if (this.resumenAtp?.cotizacionInfo?.validacionAsegurado) {
        this.metododepagovalidation = true;
        // this.getVisaToken();
      }
    }
  }

  ngAfterViewChecked(): void {
    this._changesDetector.detectChanges();
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);

    if (this.resultBiometric) {
      this.funcBiometricResult(<BiometricResultDto>this.resultBiometric, false);
    }

    if (!!Object.keys(this.resultOtp).length) {
      this.otpResult(this.resultOtp);
    }
  }

  get resultOtp(): any {
    return this._otpAuthService.storage;
  }

  get numDocExist(): any {
    return sessionStorage.getItem('ndocLink') || null;
  }

  get resultBiometric(): any {
    return JSON.parse(sessionStorage.getItem('result-biometric')) || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config && !changes.config.isFirstChange()) {
      this.insertVisaScript();
    }
  }

  ngOnDestroy(): void {
  }

  insertContractorData(): void {
    this.fc['names'].setValue(this.CONTRACTOR_INFO?.p_SCLIENT_NAME);
    this.fc['apePat'].setValue(this.CONTRACTOR_INFO?.p_SCLIENT_APPPAT);
    this.fc['apeMat'].setValue(this.CONTRACTOR_INFO?.p_SCLIENT_APPMAT);
    this.fc['sex'].setValue(this.CONTRACTOR_INFO?.p_SSEXCLIEN);
    this.fc['idNacionalidad'].setValue(this.CONTRACTOR_INFO?.p_NNATIONALITY);
    this.fc['department'].setValue(
      this.CONTRACTOR_INFO?.p_NPROVINCE != 0
        ? this.CONTRACTOR_INFO?.p_NPROVINCE
        : null
    );
    this.fc['province'].setValue(
      this.CONTRACTOR_INFO?.p_NLOCAT != 0
        ? this.CONTRACTOR_INFO?.p_NLOCAT
        : null
    );
    this.fc['district'].setValue(
      this.CONTRACTOR_INFO?.p_NMUNICIPALITY != 0
        ? this.CONTRACTOR_INFO?.p_NMUNICIPALITY
        : null
    );

    this.fc['direccion'].setValue(this.CONTRACTOR_INFO?.p_SADDRESS);
    this.fc['phone'].setValue(this.dataContratanteNotSame.phone);

    this.fc['obligacion'].setValue(this.CONTRACTOR_INFO?.p_OBLIGATE || null);
    this.fc['estadoCivil'].setValue(this.CONTRACTOR_INFO?.p_NCIVILSTA || null);
    this.fc['ocupacion'].setValue(
      Number(this.CONTRACTOR_INFO?.p_OCUPATION) || null
    );

    const asecure = JSON.parse(sessionStorage.getItem('info-document')) || null;
    this.f['ocupacion'].setValue(asecure.p_OCUPATION || null);
    this.f['obligaciones'].setValue(Number(asecure.p_OBLIGATE) || null);
    this.f['parentesco'].setValue(asecure.p_IDPARENT || null);
    this.getParameters();
  }

  activateValidationContratante(): void {
    this.fc['names'].setValidators([Validators.required]);
    this.fc['names'].updateValueAndValidity();
    this.fc['apePat'].setValidators([Validators.required]);
    this.fc['apePat'].updateValueAndValidity();
    this.fc['apeMat'].setValidators([Validators.required]);
    this.fc['apeMat'].updateValueAndValidity();
    this.fc['sex'].setValidators([Validators.required]);
    this.fc['sex'].updateValueAndValidity();

    this.fc['department'].setValidators([Validators.required]);
    this.fc['department'].updateValueAndValidity();
    this.fc['province'].setValidators([Validators.required]);
    this.fc['province'].updateValueAndValidity();
    this.fc['district'].setValidators([Validators.required]);
    this.fc['district'].updateValueAndValidity();
    this.fc['direccion'].setValidators([Validators.required]);
    this.fc['direccion'].updateValueAndValidity();
    this.fc['phone'].setValidators([
      Validators.pattern(/^[9][0-9]*$/),
      Validators.minLength(9),
      Validators.maxLength(9),
      Validators.required,
    ]);
    this.fc['phone'].updateValueAndValidity();
    this.fc['estadoCivil'].setValidators([Validators.required]);
    this.fc['estadoCivil'].updateValueAndValidity();
    this.fc['ocupacion'].setValidators([Validators.required]);
    this.fc['ocupacion'].updateValueAndValidity();

    this.f['parentesco'].setValidators([Validators.required]);
    this.f['parentesco'].updateValueAndValidity();
    this.fc['obligacion'].setValidators([Validators.required]);
    this.fc['obligacion'].updateValueAndValidity();
  }

  insertVisaScript() {
    delete window['VisanetCheckout'];
    this._AppConfig.loadScriptSubscription(this.visaPay).then((loaded) => {
      const visaConfig = this.getSubscriptionConfig();
      VisanetCheckout.configure({
        ...visaConfig,
        complete: (params) => {
        },
      });
      VisanetCheckout.open();
    });
    return;
  }

  getParameters() {
    this.validateQuotationService.getParametros().subscribe({
      next: (response: any) => {
        this.parametros$ = response;
        this.relationshipContractor$ = response.parentescos;
        this.setdataModal();
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  getPaymentType() {
    const data = {
      aplicacion: 1,
      idRamo: 71,
      idProducto: 1,
      codigoCanal: this.selling['sellingChannel'],
    };

    this._Step4Service.obtenerMetodoPago(data).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.paymentType$.niubiz = response.tiposPago.some(
          (val) => val.idTipoPago == 2
        );
        this.paymentType$.kushki = response.tiposPago.some(
          (val) => val.idTipoPago == 6
        );
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  setdataModal(): void {
    this.contractorOcupation = this.parametros$?.ocupaciones.find(
      (occupation): boolean => Number(occupation.id) === Number(this.fc['ocupacion'].value)
    )?.descripcion;

    const { insuName, insuApePat, insuApeMat } = this.USER_INFO_API;
    const { contName, contApePat, contApeMat } = this.CONTRACTOR_INFO;

    this.fullasecuName = `${insuName || ''} ${insuApePat || ''} ${insuApeMat || ''}`.trim();
    this.fullContracName = `${contName || ''} ${contApePat || ''} ${contApeMat || ''}`.trim();

    this.f['parentesco'].valueChanges.subscribe((val): void => {
      if (val) {
        this.stringparentesco = this.parametros$?.parentescos.find(
          (relationship): boolean => Number(relationship.id) === Number(this.f['parentesco'].value)
        )?.descripcion;
      }
    });

    this.provincesCon$ = this.parametros$?.ubigeos.find(
      (department): boolean => Number(department.id) === Number(this.fc['department'].value)
    )?.provincias;

    this.fc['province'].valueChanges.subscribe((): void => {
      this.districtsCon$ = this.provincesCon$?.find(
        (province): boolean => Number(province.idProvincia) === Number(this.fc['province'].value)
      )?.distritos;
    });
  }

  private getSubscriptionConfig() {
    return {
      action: `${AppConfig.ACTION_VISA_PAY}/${btoa(AppConfig.DOMAIN_URL + '/vidadevolucion/payment/visa')}`,
      method: 'POST',
      sessiontoken: this.visaSessionToken.sessionToken,
      channel: 'paycard',
      merchantid: sessionStorage.getItem('codigoComercio'),
      merchantlogo: AppConfig.MERCHANT_LOGO_VISA,
      formbuttoncolor: '#ED6E00',
      formbuttontext: this.amountWithSimbol || 'Pagar',
      purchasenumber: this.visaSessionToken.purchaseNumber,
      showamount: false,
      amount: this.visaSessionToken.amount.toString(),
      cardholdername: this.f['names'].value,
      cardholderlastname: this.f['apePat'].value,
      cardholderemail: this.USER_INFO.email,
      expirationminutes: '20',
      timeouturl: window.location + '/vidadevolucion/renovation/visa',
      usertoken: null,
    };
  }

  buscarProvincias(idDepartamento) {
    this.f['province'].setValue(null);
    this.provinces$ = this.parameters$?.ubigeos.find(
      (x) => Number(x.id) === Number(idDepartamento)
    )?.provincias;
  }

  buscarDistrito(idProvincia) {
    this.f['district'].setValue(null);
    const distritos = this.provinces$?.find(
      (x) => Number(x.idProvincia) === Number(idProvincia)
    )?.distritos;
    this.districts$ = distritos;
  }

  setUbigeos(): void {
    if (this.insuranceStorage) {
      this.FORM_STEP4.patchValue(this.insuranceStorage);
    }
    const departamento =
      this._mainService?.storage?.contratante?.departamento?.id;
    const findDepartment = this.departments$.find(
      (x) => Number(x.id) === Number(departamento)
    );
    if (findDepartment) {
      this.f['department'].setValue(findDepartment.id);
      this.buscarProvincias(findDepartment.id);
      const provincia = this._mainService?.storage?.contratante?.provincia?.id;
      const findProvincia = this.provinces$.find(
        (x) => Number(x.id) === Number(provincia)
      );
      if (findProvincia) {
        this.f['province'].setValue(findProvincia.idProvincia);
        this.buscarDistrito(findProvincia.idProvincia);
        const distrito = this._mainService?.storage?.contratante?.distrito?.id;
        const findDistrito = this.districts$?.find(
          (x) => Number(x.idDistrito) === Number(distrito.idDistrito)
        );
        if (findDistrito) {
          this.f['district'].setValue(findDistrito.idDistrito);
        }
      }
    }

    if (this.resumenAtp !== null) {
      const resumen = this.resumenAtp;
      this.f['names'].setValue(resumen.aseguradoInfo?.nombre);
      this.f['apePat'].setValue(resumen.aseguradoInfo?.apellidoPaterno);
      this.f['apeMat'].setValue(resumen.aseguradoInfo?.apellidoMaterno);
      this.f['sex'].setValue(resumen.aseguradoInfo?.idSexo);
      this.f['idNacionalidad'].setValue(resumen.aseguradoInfo?.idNacionalidad);
      this.f['estadoCivil'].setValue(resumen.aseguradoInfo.idEstadoCivil);
      this.f['ocupacion'].setValue(resumen.aseguradoInfo.idOcupacion);
      this.f['obligaciones'].setValue(
        Number(resumen.aseguradoInfo.obligacionFiscal)
      );
      this.f['department'].setValue(resumen.aseguradoInfo.idDepartamento);
      this.f['province'].setValue(resumen.aseguradoInfo.idProvincia);
      this.f['district'].setValue(Number(resumen.aseguradoInfo.idDistrito));

      this.fc['department'].setValue(resumen.contratanteInfo.idDepartamento);
      this.fc['province'].setValue(resumen.contratanteInfo.idProvincia);
      this.fc['district'].setValue(Number(resumen.contratanteInfo.idDistrito));
      this.fc['direccion'].setValue(resumen.contratanteInfo.direccion);
      this.fc['phone'].setValue(resumen.contratanteInfo.telefono);
      this.f['parentesco'].setValue(
        Number(sessionStorage.getItem('id_relationship') ?? resumen?.contratanteInfo?.idParentesco ?? 0)
      );
      // this.f['parentesco'].setValue(+sessionStorage.getItem('id_relationship') ?? resumen.contratanteInfo.idParentesco ?? 0);
      this.fc['estadoCivil'].setValue(resumen.contratanteInfo.idEstadoCivil);
      this.fc['ocupacion'].setValue(resumen.contratanteInfo.idOcupacion);
      this.fc['obligacion'].setValue(
        Number(resumen.contratanteInfo.obligacionFiscal)
      );
      this.arreglo$ = [23, 11, 1002, 3, 38, 9];
      const exist = this.arreglo$?.find((x) => x == this.f['parentesco'].value);
      if (exist && this.currentUserState == 1) {
        this.stringparentesco = this.parameters$?.parentescos.find(
          (x) => Number(x.id) === Number(this.f['parentesco'].value)
        )?.descripcion;
        this.shownew();
      }
      this.USER_INFO_API = {
        p_SDOCUMENT: resumen.aseguradoInfo.numeroDocumento,
        p_NDOCUMENT_TYP: resumen.aseguradoInfo.idTipoDocumento?.toString(),
        p_SCLIENT_NAME: this.f.names.value,
        p_SCLIENT_APPPAT: this.f.apePat.value,
        p_SCLIENT_APPMAT: this.f.apeMat.value,
        p_SSEXCLIEN: resumen.aseguradoInfo.idSexo?.toString(),
      };

      this.f['obligaciones'].disable();
      this.fc['names'].disable();
      this.fc['apePat'].disable();
      this.fc['apeMat'].disable();
      this.fc['sex'].disable();
      this.fc['department'].disable();
      this.fc['province'].disable();
      this.fc['district'].disable();
      this.fc['direccion'].disable();
      this.fc['phone'].disable();
      this.fc['obligacion'].disable();
      this.fc['estadoCivil'].disable();
      this.fc['ocupacion'].disable();
    }
  }

  setUbigeosContrantanteNotSame(): void {
    this.provincesCon$ = this.parameters$?.ubigeos.find(
      (x) => Number(x.id) === Number(this.fc['department'].value)
    )?.provincias;
    this.districtsCon$ = this.provinces$?.find(
      (x) => Number(x.idProvincia) === Number(this.fc['province'].value)
    )?.distritos;

    this.fc['department'].valueChanges.subscribe((val) => {
      this.provincesCon$ = [];
      this.districtsCon$ = [];
      this.fc['province'].setValue(null);
      this.fc['district'].setValue(null);
      this.provincesCon$ = this.parameters$?.ubigeos.find(
        (x) => Number(x.id) === Number(val)
      )?.provincias;
    });
    this.districtsCon$ = this.provincesCon$?.find(
      (x) => Number(x.idProvincia) === Number(this.fc['province'].value)
    )?.distritos;
    this.fc['province'].valueChanges.subscribe((val) => {
      /* this.districtsCon$ = []; */
      this.fc['district'].setValue(null);
      this.districtsCon$ = this.provincesCon$?.find(
        (x) => Number(x.idProvincia) === Number(val)
      )?.distritos;
    });
  }

  get step1(): any {
    return JSON.parse(sessionStorage.getItem('step1'));
  }

  get ammountPayment(): number {
    return this.detalleCompra.primaInicial;
  }

  getVisaToken() {
    this._spinner.show();
    const data: IVisaTokenRequest = {
      idProcess: this.detalleCompra.idProcess,
      amount: this.ammountPayment,
      canal: Number(environment.canaldeventadefault),
      puntoventa: Number(environment.puntodeventadefault),
      flujo: 6,
      codigoComercio: Number(sessionStorage.getItem('codigoComercio')),
      Ramo: 71,
      Producto: 1,
    };
    this._PaymentsService.generarSessionTokenGeneric(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        const config = {
          action: AppConfig.ACTION_FORM_VIDA_VIDAINDIVIDUAL,
          timeoutUrl: `${location.protocol}//${location.hostname}${location.pathname}`,
          codigoComercio: sessionStorage.getItem('codigoComercio'),
        };
        this.visaSessionToken = { ...config, ...res };
        this.visaSessionToken.flow = 'vidaindividual';
        this._SessionService.saveToLocalStorage('visa', this.visaSessionToken);
        (window as any).initDFP(
          res.deviceFingerPrintId,
          res.purchaseNumber,
          res.clientIp,
          res.codigoComercio
        );
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
        // this._GoogleTagManagerService.setGenericErrorEvent('Vida Individual - Paso 4', 'Generar Token Visa');
      }
    );
  }

  get idProcess(): any {
    return sessionStorage.getItem('idProcess');
  }

  get biometricStorage(): any {
    return JSON.parse(sessionStorage.getItem('biometric')) || null;
  }

  get selling(): any {
    return JSON.parse(sessionStorage.getItem('selling') ?? '{}');
  }

  get uuid(): any {
    if (sessionStorage.getItem('vdp-uuid')) {
      return sessionStorage.getItem('vdp-uuid');
    }

    const guid = uuid();
    sessionStorage.setItem('vdp-uuid', guid);
    return this.uuid;
  }

  pagar(type): void {
    if (this.FORM_STEP4.valid) {
      if (this.isValidFormStep4) {
        const data: Step4Request = {
          apellidoMaterno: this.f['apeMat'].value,
          apellidoPaterno: this.f['apePat'].value,
          direccion: this.f['direccion'].value,
          fechaNacimiento: this.USER_INFO?.fechaNac,
          idDepartamento: this.f['department'].value,
          idDistrito: this.f['district'].value,
          idEstadoCivil: this.f['estadoCivil'].value,
          idNacionalidad: this.f['idNacionalidad'].value,
          idOcupacion: this.f['ocupacion'].value,
          idProcess: Number(sessionStorage.getItem('idProcess')),
          idProvincia: this.f['province'].value,
          idSexo: this.f['sex'].value,
          idTipoDocumento: this.USER_INFO_API?.p_NDOCUMENT_TYP,
          idTipoPersona: 1,
          nombre: this.f['names'].value,
          numeroDocumento: this.USER_INFO?.nDoc,
          obligacionFiscal: this.f['obligaciones'].value,
          telefono: this.f['phone'].value,
        };

        switch (type) {
          case 1: {
            this._spinner.show();
            forkJoin(
              this._Step4Service.dataContratante(data),
              this._Step4Service.generarCip(this.idProcess)
            ).subscribe(
              (res: any) => {
                sessionStorage.setItem(
                  'pago-efectivo-response',
                  JSON.stringify(res[1])
                );
                this.sourcePagoEfectivo =
                  this._domSanitizer.bypassSecurityTrustResourceUrl(
                    res[1]?.errorDesc
                  );
                this._vc.createEmbeddedView(this._modalPagoEfectivo);
                if (res[1]?.success) {
                }
                this._spinner.hide();
              },
              (err: any) => {
                console.error(err);
                this._spinner.hide();
              }
            );
            break;
          }
          case 2: {
            this._Step4Service.dataContratante(data).subscribe();
            this.insertVisaScript();
            break;
          }
          case 6: {
            this._Step4Service.dataContratante(data).subscribe();
            this.getCredentials();
            break;
          }
        }
        this.saveDataToStorage();
      }
    } else {
      this.FORM_STEP4.markAllAsTouched();
    }
  }

  eventPay(type, target): void {
    sessionStorage.setItem('methodPay-target-name', 'Tarjeta');

    const gtmTrackingPayload = {
      eventName: 'virtualEventGA4_G',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 4',
        'Sección': 'Paga tu seguro',
        'TipoAcción': 'Seleccionar método de pago',
        'CTA': 'Ir a pagar',
        'MétodoPago': target == 1 ? 'Mastercard' : 'Visa',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtmTrackingPayload);

    const gtmTrackingBeginCheckoutPayload = {
      eventName: 'begin_checkout',
      payload: {
        'CoberturaProtección': this.detalleCompra.capital,
        'Frecuencia': this.detalleCompra.frecuencia,
        'Periodo': `${this.detalleCompra.cantidadAnio} años`,
        'Devolución': `${this.detalleCompra.porcentajeRetorno}%`,
        'CoberturaDevolución': this.detalleCompra.primaRetorno,
        'PrimerPago': (+this.ammountPayment).toFixed(2),
        'MontoCuota': this.detalleCompra.primaMensual,
        'Precio': (+this.ammountPayment).toFixed(2),
        'currency': this.detalleCompra.moneda == 1 ? 'PEN' : 'USD',
        'value': (+this.ammountPayment).toFixed(2),
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa',
        'ecommerce': {
          'items': [{
            'item_id': 71,
            'item_name': 'Vida Devolución Protecta',
            'price': (+this.ammountPayment).toFixed(2),
            'item_brand': 'Protecta',
            'item_category': 'Seguros Vida',
            'quantity': 1
          }]
        }
      }
    };
    this.trackingService.gtmTracking(gtmTrackingBeginCheckoutPayload);

    this.pagar(type);
  }

  saveDataToStorage(): void {
    sessionStorage.setItem(
      'insurance',
      JSON.stringify(this.FORM_STEP4.getRawValue())
    );
  }

  get insuranceStorage(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  backStep(): void {
    this._Router.navigate(['/vidadevolucion/step3'], {
      queryParamsHandling: 'merge',
    });
  }

  backToInit(): void {
    sessionStorage.clear();
    this._Router.navigate(['/vidadevolucion/step1'], {
      queryParamsHandling: 'merge',
    });
  }

  get isValidFormStep4(): boolean {
    return (
      this.FORM_STEP4.valid &&
      this.FORM_STEP4.get('phone')?.value?.toString().length === 9
    );
  }

  showHideModalObligaciones(show) {
    if (show) {
      this._vc.createEmbeddedView(this.modalObligaciones);
    } else {
      this._vc.clear();
    }
  }

  showModalDisclaimerPayment(show): void {
    if (show) {
      this._vc.createEmbeddedView(this.modalDisclaimerPayment);
    } else {
      this._vc.clear();
    }
  }

  get moneda(): string {
    switch (Number(this.detalleCompra.moneda)) {
      case 1: {
        return 'S/';
      }
      case 2: {
        return 'US$';
      }
    }
  }

  getStringCurrency(money, amount): string {
    switch (Number(money)) {
      case 1: {
        return `S/ ${amount}`;
      }
      case 2: {
        return `US$ ${amount}`;
      }
    }
  }

  keyPress(event: KeyboardEvent) {
    event.preventDefault();
  }

  handleSelect(evt) {
    const target = evt.target;

    target.value = this.USER_INFO_API?.p_NPERSON_TYP;
  }

  showHideModalBiometrico(): void {
    const data: VidaDevolucionModel = {
      ...this._mainService.storage,
      contratante: {
        ...this._mainService.storage.contratante,
        departamento: {
          id: this.f['department'].value,
        },
        provincia: {
          id: this.f['province'].value,
        },
        distrito: {
          id: this.f['district'].value,
        },
        direccion: this.f['direccion'].value,
        celular: this.f['phone'].value,
        ocupacion: this.f['ocupacion'].value,
        estadoCivil: this.f['estadoCivil'].value,
        obligacionesFiscales: this.f['obligaciones'].value,
      },
    };

    this.authMethodData = {
      idProcess: this.idProcess,
      dni: this.step1.nDoc || sessionStorage.getItem('ndocLink'),
      nombre: this.insuranceStorage.names,
      apellido: `${this.insuranceStorage.apePat} ${this.insuranceStorage.apeMat}`,
      celular: this.f['phone'].value,
      correo: this.step1.email,
    };

    this._mainService.storage = data;
    this.insurance = new DataBiometricDto({
      idRamo: 61,
      idProcess: this.idProcess,
      nDoc: this.USER_INFO.nDoc,
      apeMat: this.insuranceStorage.apeMat,
      apePat: this.insuranceStorage.apePat,
      names: this.insuranceStorage.names,
    });

    this.modalAdjuntarArchivo = !this.modalAdjuntarArchivo;
    sessionStorage.removeItem('_b10m3tr1c0');
    sessionStorage.removeItem('result-biometric');
    sessionStorage.removeItem(AppConfig.OTPAUTH_STORAGE);

    const gtlmTrackingPayload = {
      eventName: 'virtualEventGA4_F',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 4',
        'Sección': 'Detalle de compra',
        'TipoAcción': 'Intención de avance',
        'Ocupación': this.parameters$?.ocupaciones.find(x => x.id == this.f['ocupacion'].value).descripcion,
        'EstadoCivil': this.parameters$?.estadoCivil.find(x => x.id == this.f['estadoCivil'].value).descripcion,
        'Departamento': this.departments$.find(x => x.id == this.f['department'].value).descripcion,
        'Provincia': this.provinces$.find(x => x.idProvincia == this.f['province'].value).provincia,
        'Distrito': this.districts$.find(x => x.idDistrito == this.f['district'].value).distrito,
        'Obligaciones': this.f['obligaciones'].value ? 'Sí' : 'No',
        'CTA': 'Siguiente',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtlmTrackingPayload);

    const gtlmTrackingSuccessPayload = {
      eventName: 'virtualEventGA4_F',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 4',
        'Sección': 'Detalle de compra',
        'TipoAcción': 'Avance exitoso',
        'Ocupación': this.parameters$?.ocupaciones.find(x => x.id == this.f['ocupacion'].value).descripcion,
        'EstadoCivil': this.parameters$?.estadoCivil.find(x => x.id == this.f['estadoCivil'].value).descripcion,
        'Departamento': this.departments$.find(x => x.id == this.f['department'].value).descripcion,
        'Provincia': this.provinces$.find(x => x.idProvincia == this.f['province'].value).provincia,
        'Distrito': this.districts$.find(x => x.idDistrito == this.f['district'].value).distrito,
        'Obligaciones': this.f['obligaciones'].value ? 'Sí' : 'No',
        'CTA': 'Siguiente',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtlmTrackingSuccessPayload);

    const gtlmTrackingModalAuthPayload = {
      eventName: 'virtualEventGA4_E',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 4',
        'Sección': 'Modal Proceso de Validación',
        'TipoAcción': 'Visualizar modal',
        'CTA': 'Opciones Validación',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'

      }
    };
    this.trackingService.gtmTracking(gtlmTrackingModalAuthPayload);
  }

  showHideModalBiometricoContratante(): void {
    const data: VidaDevolucionModel = {
      ...this._mainService.storage,
      contratante: {
        ...this._mainService.storage.contratante,
        departamento: {
          id: this.f['department'].value,
        },
        provincia: {
          id: this.f['province'].value,
        },
        distrito: {
          id: this.f['district'].value,
        },
        direccion: this.f['direccion'].value,
        celular: this.f['phone'].value,
        ocupacion: this.f['ocupacion'].value,
        estadoCivil: this.f['estadoCivil'].value,
        obligacionesFiscales: this.f['obligaciones'].value,
      },
    };

    this.authMethodData = {
      idProcess: this.idProcess,
      dni:
        sessionStorage.getItem('ndocLink') ||
        this.dataContratanteNotSame.documentNumber,
      nombre: this.fc['names'].value,
      apellido: `${this.fc['apePat'].value} ${this.fc['apeMat'].value}`,
      celular: this.fc['phone'].value,
      correo: this.dataContratanteNotSame.email,
    };

    this._mainService.storage = data;
    this.insurance = new DataBiometricDto({
      idRamo: 61,
      idProcess: this.idProcess,
      nDoc: this.authMethodData.dni,
      apeMat: this.fc['apeMat'].value,
      apePat: this.fc['apePat'].value,
      names: this.fc['names'].value,
    });

    this.modalAdjuntarArchivo = !this.modalAdjuntarArchivo;
    sessionStorage.removeItem('_b10m3tr1c0');
    sessionStorage.removeItem('result-biometric');
    sessionStorage.removeItem(AppConfig.OTPAUTH_STORAGE);
  }

  showHideModalBiometricoAsegurado(): void {
    this.authMethodData = {
      idProcess: this.idProcess,
      dni: sessionStorage.getItem('ndocLink'),
      nombre: this.insuranceStorage.names,
      apellido: `${this.insuranceStorage.apePat} ${this.insuranceStorage.apeMat}`,
      celular: this.fc['phone'].value,
      correo: this.step1.email,
      photo: this.infoDocument.p_SPHOTO
    };
    this.insurance = new DataBiometricDto({
      idRamo: 61,
      idProcess: this.idProcess,
      nDoc: sessionStorage.getItem('ndocLink'),
      apeMat: this.insuranceStorage.apeMat,
      apePat: this.insuranceStorage.apePat,
      names: this.insuranceStorage.names,
      photo: this.infoDocument.p_SPHOTO
    });
    this.modalAdjuntarArchivo = !this.modalAdjuntarArchivo;
    sessionStorage.removeItem('_b10m3tr1c0');
    sessionStorage.removeItem('result-biometric');
    sessionStorage.removeItem(AppConfig.OTPAUTH_STORAGE);
  }

  get infoDocument(): any {
    return JSON.parse(sessionStorage.getItem('info-document' ));
  }

  get actualDate(): string {
    return moment(new Date()).format('DD/MM/YYYY').toString();
  }

  get endDate(): string {
    return moment(new Date().setFullYear(new Date().getFullYear() + 1))
      .format('DD/MM/YYYY')
      .toString();
  }

  get tarifario(): any {
    return JSON.parse(sessionStorage.getItem('step2') || '{}');
  }

  get asesorName(): string {
    return `${this.currentUser.name ?? 'Plataforma Digital'}`;
  }

  currencyDescription(val: number): string {
    switch (val) {
      case 2:
        return 'DÓLARES';
      case 1:
      default:
        return 'SOLES';
    }
  }

  currencySymbol(val: number): string {
    switch (val) {
      case 2:
        return 'US$';
      case 1:
      default:
        return 'S/';
    }
  }

  enviarDatos(): void {
    const contratante: any = {
      apellidoMaterno: this.f['apeMat'].value,
      apellidoPaterno: this.f['apePat'].value,
      direccion: this.f['direccion'].value.toUpperCase(),
      fechaNacimiento: this.USER_INFO?.fechaNac,
      idDepartamento: !this.resumenAtp
        ? this.f['department'].value
        : Number(this.resumenAtp.aseguradoInfo.idDepartamento),
      idDistrito: !this.resumenAtp
        ? this.f['district'].value
        : Number(this.resumenAtp.aseguradoInfo.idDistrito),
      idEstadoCivil: !this.resumenAtp
        ? this.f['estadoCivil'].value
        : Number(this.resumenAtp.aseguradoInfo.idEstadoCivil),
      idNacionalidad: this.f['idNacionalidad'].value,
      idOcupacion: !this.resumenAtp
        ? this.f['ocupacion'].value
        : Number(this.resumenAtp.aseguradoInfo.idOcupacion),
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idProvincia: !this.resumenAtp
        ? this.f['province'].value
        : Number(this.resumenAtp.aseguradoInfo.idProvincia),
      idSexo: this.f['sex'].value,
      idTipoDocumento: this.USER_INFO_API?.p_NDOCUMENT_TYP,
      idTipoPersona: 1,
      nombre: this.f['names'].value,
      numeroDocumento: this.USER_INFO?.nDoc,
      obligacionFiscal: this.f['obligaciones'].value,
      telefono: this.f['phone'].value,
    };

    this._spinner.show();
    this._Step4Service.dataContratante(contratante).subscribe(
      () => {
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  sendValidationLinkAsegurado(): void {
    const data = {
      asegurado: {
        nombre:
          this.f['names'].value +
          ' ' +
          this.f['apePat'].value +
          ' ' +
          this.f['apeMat'].value,
        nroDocumento: this.USER_INFO?.nDoc,
        fechaNacimiento: this.USER_INFO?.fechaNac,
        telefono: this.f['phone'].value,
        correo: this.USER_INFO?.email,
        direccion: this.f['direccion'].value.toUpperCase(),
        idEstadoCivil: this.f['estadoCivil'].value,
        idDepartamento: this.f['department'].value,
        idProvincia: this.f['province'].value,
        idDistrito: this.f['district'].value,
        idOcupacion: this.f['ocupacion'].value,
        obligacionFiscal: this.f['obligaciones'].value,
      },
      contratante: {
        // tslint:disable-next-line:max-line-length
        nombre:
          this.dataContratanteNotSame.names +
          ' ' +
          this.dataContratanteNotSame.apellidoPaterno +
          ' ' +
          this.dataContratanteNotSame.apellidoMaterno,
        nrodocumento: this.dataContratanteNotSame.documentNumber,
        fechanacimiento: this.dataContratanteNotSame.birthDate,
        correo: this.dataContratanteNotSame.email,
      },
      idTarifario: this.tarifario.idTarifario,
      idProcess: this.idProcess,
      cantidadAnios: this.tarifario.cantidadAnio,
      capital: this.tarifario.capital,
      correo: this.step1.email,
      fechaFin: this.endDate,
      fechaInicio: this.actualDate,
      fechaSolicitud: this.actualDate,
      fechaNacimiento: this.step1.fechaNac,
      fechaVencimiento: this.endDate,
      monedaDescripcion: this.currencyDescription(+this.tarifario.moneda),
      monedaSimbolo: this.currencySymbol(+this.tarifario.moneda),
      nombreAsesor: this.asesorName,
      nroDocumento: this.step1.nDoc,
      porcentajeDevolucion: this.tarifario.porcentajeRetorno,
      primaFallecimiento: this.tarifario.primaFallecimiento,
      primaInicial: this.tarifario.primaInicial,
      primaMensual: this.tarifario.primaMensual,
      primaAnual: this.tarifario.primaAnual,
      primaRetorno: this.tarifario.primaRetorno,
      telefono: this.step1.telefono,
      idFrecuencia: this.tarifario.idFrecuencia,
      frecuencia: this.tarifario.frecuencia,
      descPrima: this.tarifario.descPrima,
      descPrimaMensual: this.tarifario.descPrimaMensual,
      documentoPrincipal: this.USER_INFO?.nDoc,
      correoPrincipal: this.USER_INFO?.email,
      aseguradoContratante: false,
    };

    this._spinner.show();
    this._Step4Service.envioLinkValidacion(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.enviarDatos();
        this.saveDataContratante();

        this.titleModal = 'Envío de correo al cliente';
        this.descriptionModal = `Se envió correctamente la información al cliente al correo ${data?.correoPrincipal}`;
        this._vc.createEmbeddedView(this.modalSuccess);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  sendValidationLinkContratante(): void {
    const data = {
      asegurado: {
        nombre:
          this.f['names'].value +
          ' ' +
          this.f['apePat'].value +
          ' ' +
          this.f['apeMat'].value,
        nroDocumento: this.USER_INFO?.nDoc,
        fechaNacimiento: this.USER_INFO?.fechaNac,
        telefono: this.f['phone'].value,
        correo: this.USER_INFO?.email,
        direccion: this.f['direccion'].value.toUpperCase(),
        idEstadoCivil: this.f['estadoCivil'].value,
        idDepartamento: this.f['department'].value,
        idProvincia: this.f['province'].value,
        idDistrito: this.f['district'].value,
        idOcupacion: this.f['ocupacion'].value,
        obligacionFiscal: this.f['obligaciones'].value,
      },
      contratante: {
        // tslint:disable-next-line:max-line-length
        nombre:
          this.dataContratanteNotSame.names +
          ' ' +
          this.dataContratanteNotSame.apellidoPaterno +
          ' ' +
          this.dataContratanteNotSame.apellidoMaterno,
        nrodocumento: this.dataContratanteNotSame.documentNumber,
        fechanacimiento: this.dataContratanteNotSame.birthDate,
        correo: this.dataContratanteNotSame.email,
      },
      idTarifario: this.tarifario.idTarifario,
      idProcess: this.idProcess,
      cantidadAnios: this.tarifario.cantidadAnio,
      capital: this.tarifario.capital,
      correo: this.step1.email,
      fechaFin: this.endDate,
      fechaInicio: this.actualDate,
      fechaSolicitud: this.actualDate,
      fechaNacimiento: this.step1.fechaNac,
      fechaVencimiento: this.endDate,
      monedaDescripcion: this.currencyDescription(+this.tarifario.moneda),
      monedaSimbolo: this.currencySymbol(+this.tarifario.moneda),
      nombreAsesor: this.asesorName,
      nroDocumento: this.step1.nDoc,
      porcentajeDevolucion: this.tarifario.porcentajeRetorno,
      primaFallecimiento: this.tarifario.primaFallecimiento,
      primaInicial: this.tarifario.primaInicial,
      primaMensual: this.tarifario.primaMensual,
      primaAnual: this.tarifario.primaAnual,
      primaRetorno: this.tarifario.primaRetorno,
      telefono: this.step1.telefono,
      idFrecuencia: this.tarifario.idFrecuencia,
      frecuencia: this.tarifario.frecuencia,
      descPrima: this.tarifario.descPrima,
      descPrimaMensual: this.tarifario.descPrimaMensual,
      documentoPrincipal: this.USER_INFO?.cnDoc,
      correoPrincipal: this.USER_INFO?.cemail,
      aseguradoContratante: false,
    };

    this._spinner.show();
    this._Step4Service.envioLinkValidacion(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.enviarDatos();
        this.saveDataContratante();
        this.titleModal = 'Envío de correo al cliente';
        this.descriptionModal = `Se envió correctamente la información al cliente al correo ${data?.correoPrincipal}`;
        this._vc.createEmbeddedView(this.modalSuccess);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // BIOMETRICO
  funcBiometricResult(e: BiometricResultDto, reload: boolean = true): void {
    this.biometricResult = e;
    if (this.btnSubmit) {
      if (this.biometricResult.success && !this.biometricResult.hasError) {
        this.stepBiom = 3;
        this.successBiometric = true;
        this.getVisaToken();
      } else {
        this.successBiometric = true;
        this.stepBiom = 1;
        this.btnSubmit.nativeElement.textContent = 'Reintentar';
      }
    }
    if (reload) {
      location.reload();
    }
  }

  funcUploadFileBiometricResult(e: BiometricResultDto): void {
    this.biometricResult = e;
    if (!e.success) {
      this.modalAdjuntarArchivo = false;
    }
  }

  // *MODALS
  closeModal(): void {
    this._vc.clear();
  }

  showModalAuthMethod(e: boolean) {
    this.modalAdjuntarArchivo = e;
  }

  selectedAuthMethod(e: number): void {
    this.selectedMethod = e;
  }

  otpResult(e: IValidateOtpResponse) {
    this.biometricResult = null;

    if (
      this.currentUserState == 0 ||
      this.currentUserState == 1 ||
      (this.CONTRACTOR_INFO.p_SDOCUMENT != this.USER_INFO_API.p_SDOCUMENT && this.fromEcommerce)
    ) {
      this.enviarDatos();
      this.saveDataContratante();
    } else {
      this.otpResponse = e;
    }

    this.modalAdjuntarArchivo = false;

    if (e.hasError) {
      this.btnSubmit.nativeElement.textContent = 'Reintentar';
      return;
    }

    window.scrollTo(0, 0);

    const gtmTrackingPayload = {
      eventName: 'add_to_cart',
      payload: {
        'CoberturaProtección': this.detalleCompra.capital,
        'Frecuencia': this.detalleCompra.frecuencia,
        'Periodo': `${this.detalleCompra.cantidadAnio} años`,
        'Devolución': `${this.detalleCompra.porcentajeRetorno}%`,
        'CoberturaDevolución': this.detalleCompra.primaRetorno,
        'PrimerPago': (+this.ammountPayment).toFixed(2),
        'MontoCuota': this.detalleCompra.primaMensual,
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa',
        'ecommerce': {
          'items': [{
            'item_id': 71,
            'item_name': 'Vida Devolución Protecta+',
            'price': (+this.ammountPayment).toFixed(2),
            'item_brand': 'Protecta',
            'item_category': 'Seguros Vida',
            'quantity': 1
          }]
        }
      }
    };
    this.trackingService.gtmTracking(gtmTrackingPayload);

    if (
      this.currentUserState == 0 &&
      this.resumenAtp?.cotizacionInfo?.validacionAsegurado != true
    ) {
      this.sendValidationLinkContratante();
    }

    this.getResumen(this.idProcess);
    // this.getVisaToken();
  }

  shownew() {
    this._vc.createEmbeddedView(this.modalParent);
    this.dateToday();
  }

  dateToday() {
    this.today = new Date();
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

  getMonedaSimbol(val): string {
    switch (Number(val)) {
      case 1: {
        return 'S/';
      }
      case 2: {
        return 'US$';
      }
      default: {
        return 'SIMBOLO MONEDA';
      }
    }
  }

  get dataSlip(): SlipRequest {
    const userData = JSON.parse(sessionStorage.getItem('step1'));
    const userDataDocumento = JSON.parse(
      sessionStorage.getItem('info-document')
    );
    const step2Data = JSON.parse(sessionStorage.getItem('step2'));
    const fechaActual = moment(new Date()).format('DD/MM/YYYY').toString();
    const fechaSiguiente = moment(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .format('DD/MM/YYYY')
      .toString();
    let name = `${userDataDocumento.p_SCLIENT_NAME} ${userDataDocumento.p_SCLIENT_APPPAT} ${userDataDocumento.p_SCLIENT_APPMAT}`;
    if (name.indexOf('null') > 0) {
      name = '-';
    }
    const data: SlipRequest = {
      asegurado: name,
      cantidadAnios: step2Data.cantidadAnio,
      capital: step2Data.capital,
      correo: userData.email,
      fechaInicio: fechaActual,
      fechaSolicitud: fechaActual,
      fechaNacimiento: userData.fechaNac,
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idTarifario: step2Data.idTarifario,
      fechaFin: fechaSiguiente,
      fechaVencimiento: fechaSiguiente,
      monedaDescripcion: this.getMonedaDesc(step2Data.moneda),
      monedaSimbolo: this.getMonedaSimbol(step2Data.moneda),
      nroDocumento: userData?.nDoc?.toString(),
      porcentajeDevolucion: step2Data.porcentajeRetorno,
      primaAnual: this._DecimalPipe.transform(step2Data.primaAnual, '1.2-2'),
      primaMensual: this._DecimalPipe.transform(
        step2Data.primaMensual,
        '1.2-2'
      ),
      primaRetorno: this._DecimalPipe.transform(
        step2Data.primaRetorno,
        '1.2-2'
      ),
      primaFallecimiento: this._DecimalPipe.transform(
        step2Data.primaFallecimiento,
        '1.2-2'
      ),
      primaInicial: this._DecimalPipe.transform(
        step2Data.primaInicial,
        '1.2-2'
      ),
      descPrima: +this._DecimalPipe.transform(step2Data.descPrima),
      descPrimeraCuota: +this._DecimalPipe.transform(
        step2Data.descPrimeraCuota,
        '1.2-2'
      ),
      primaMensualTotal: +this._DecimalPipe.transform(
        step2Data.primaMensualTotal,
        '1.2-2'
      ),
      primeraTotal: +this._DecimalPipe.transform(
        step2Data.primeraTotal,
        '1.2-2'
      ),
      idFrecuencia: step2Data.idFrecuencia,
      frecuencia: step2Data.frecuencia,
      contratante: {
        nombre: this.dataContratanteNotSame.names,
        nrodocumento: this.dataContratanteNotSame.documentNumber,
        fechanacimiento: this.dataContratanteNotSame.birthDate,
        correo: this.dataContratanteNotSame.email,
      },
    };
    return data;
  }

  getResumen(idProcess: any) {
    this._mainService.obtenerResumen(idProcess).subscribe(
      (resp: any) => {
        this._spinner.hide();

        this.aseguradoValidate = resp.cotizacionInfo.validacionAsegurado;
        this.contractorValidate = resp.cotizacionInfo.validacionContratante;

        sessionStorage.setItem('resumen-atp', JSON.stringify(resp));

        if (!!+resp.contratanteInfo.idParentesco) {
          sessionStorage.setItem('id_relationship', resp.contratanteInfo.idParentesco);
          this.f['parentesco'].setValue(resp.contratanteInfo.idParentesco);
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  saveDataContratante() {
    const prove = JSON.parse(sessionStorage.getItem('infoContratante')) || null;
    const newdata =
      JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;

    if (!prove) {
      this.aseguradoContratante = true;
    } else if (prove && this.USER_INFO_API.p_SDOCUMENT != prove.p_SDOCUMENT) {
      this.aseguradoContratante = false;
    }
    const payload = {
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idClient: this.USER_INFO_API.p_SCLIENT,
      numeroDocumento: this.USER_INFO_API.p_SDOCUMENT,
      aseguradoContratante: this.aseguradoContratante,
      definitiva: true,
      contratante:
        prove != null
          ? {
            idTipoPersona: Number(prove.p_NPERSON_TYP),
            idTipoDocumento: Number(prove.p_NDOCUMENT_TYP),
            numeroDocumento: prove.p_SDOCUMENT,
            nombres: prove.p_SCLIENT_NAME,
            apellidoPaterno: prove.p_SCLIENT_APPPAT,
            apellidoMaterno: prove.p_SCLIENT_APPMAT,
            fechaNacimiento: prove.p_DBIRTHDAT,
            idSexo: prove.p_SSEXCLIEN,
            homonimo: 0,
            parentesco: +this.f['parentesco'].value || +sessionStorage.getItem('id_relationship') || 0,
            telefono: newdata.phone.toString(),
            correo: newdata.email,
            direccion: this.fc['direccion'].value.toUpperCase(),
            idEstadoCivil: Number(this.fc['estadoCivil'].value),
            idDepartamento: this.fc['department'].value,
            idProvincia: this.fc['province'].value,
            idDistrito: this.fc['district'].value,
            obligacionFiscal: this.fc['obligacion'].value != 0,
            idOcupacion: Number(this.fc['ocupacion'].value),
          }
          : null,
    };
    this._Step1Service.saveDataContratante(payload).subscribe();
  }

  sendSlip() {
    const data = {
      asegurado:
        this.f['names'].value +
        ' ' +
        this.f['apePat'].value +
        ' ' +
        this.f['apeMat'].value,
      contratante: {
        // tslint:disable-next-line:max-line-length
        nombre:
          this.dataContratanteNotSame.names +
          ' ' +
          this.dataContratanteNotSame.apellidoPaterno +
          ' ' +
          this.dataContratanteNotSame.apellidoMaterno,
        nrodocumento: this.dataContratanteNotSame.documentNumber,
        fechanacimiento: this.dataContratanteNotSame.birthDate,
        correo: this.dataContratanteNotSame.email,
      },
      idTarifario: this.tarifario.idTarifario,
      idProcess: this.idProcess,
      cantidadAnios: this.tarifario.cantidadAnio,
      capital: this.tarifario.capital,
      correo: this.step1.email,
      fechaFin: this.endDate,
      fechaInicio: this.actualDate,
      fechaSolicitud: this.actualDate,
      fechaNacimiento: this.step1.fechaNac,
      fechaVencimiento: this.endDate,
      monedaDescripcion: this.currencyDescription(+this.tarifario.moneda),
      monedaSimbolo: this.currencySymbol(+this.tarifario.moneda),
      nombreAsesor: this.asesorName,
      nroDocumento: this.step1.nDoc,
      porcentajeDevolucion: this.tarifario.porcentajeRetorno,
      primaFallecimiento: this.tarifario.primaFallecimiento,
      primaInicial: this.tarifario.primaInicial,
      primaMensual: this.tarifario.primaMensual,
      primaAnual: this.tarifario.primaAnual,
      primaRetorno: this.tarifario.primaRetorno,
      telefono: this.step1.telefono,
      idFrecuencia: this.tarifario.idFrecuencia,
      frecuencia: this.tarifario.frecuencia,
      descPrima: this.tarifario.descPrima,
      descPrimaMensual: this.tarifario.descPrimaMensual,
      documentoPrincipal: this.USER_INFO?.cnDoc,
      correoPrincipal: this.USER_INFO?.cemail,
      aseguradoContratante: false,
    };

    this._spinner.show();
    this._Step2Service.sendSlip(data, 1).subscribe(
      (res: any) => {
        this.titleModal = 'Envío de correo al cliente';
        this.descriptionModal = `Se envió correctamente la información al cliente al correo ${this.dataSlip.correo}
             y ${this.dataSlip.contratante.correo}`;
        this._vc.createEmbeddedView(this.modalSuccess);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  kushkiResult(result: any): void {
    switch (result['secureService']) {
      case 'KushkiOTP':
        break;
      case '3dsecure':
        this.validate3DS(result);
        break;
      default:
        this.processPayment(result['token']);
        break;
    }
  }

  private validate3DS(info): void {
    const req = {
      secureId: info.secureId,
      security: {
        acsURL: info.security.acsURL,
        authenticationTransactionId: info.security.authenticationTransactionId,
        paReq: info.security.paReq,
        specificationVersion: info.security.specificationVersion,
        authRequired: info.security.authRequired,
      },
    };

    this._vc.clear();
    this.kushkiForm.patchValue({
      cardNumber: '',
      dueDate: '',
      cvv: ''
    }, {
      emitEvent: false
    });

    this.kushki.requestValidate3DS(req,
      (response: any): void => {
        if (!response?.isValid) {
          return;
        }

        this.processPayment(info['token']);
      });
  }

  private processPayment(token: string): void {
    const emissionPayload = {
      idProceso: this.idProcess,
      token,
      experianRisk: this.pepInfo.experianRisk ?? false,
      isFamPep: this.validityInfo.isFamPep ?? false,
      isIdNumber: this.validityInfo.isIdNumber ?? false,
      isIdNumberFamPep: this.validityInfo.isIdNumberFamPep ?? false,
      isIdNumberWC: this.pepInfo.idIdNumberWC ?? false,
      isOtherList: this.validityInfo.isOtherList ?? false,
      isOtherListWC: this.pepInfo.isOtherListWC ?? false,
      isPep: this.pepInfo.isPep ?? false,
      isPepWC: this.validityInfo.isPepWC ?? false,
    };

    sessionStorage.setItem('kushki-payload', JSON.stringify(emissionPayload));
    this._Router.navigate([`/vidadevolucion/payment/visa/${this.idProcess}`]);
  }

  kushkiSubmit(): void {
    this._spinner.show();

    this.saveInfoKushki();

    const prove =
      JSON.parse(sessionStorage.getItem('infoContratante')) || null;

    const contratante =
      prove == null
        ? {
          names: this.f['names'].value,
          paternalSurname: this.f['apePat'].value,
          maternalSurname: this.f['apeMat'].value,
        }
        : {
          names: prove.p_SCLIENT_NAME,
          paternalSurname: prove.p_SCLIENT_APPPAT,
          maternalSurname: prove.p_SCLIENT_APPMAT,
        };

    const names =
      `${contratante.names} ${contratante.paternalSurname} ${contratante.maternalSurname}`.trim();
    const dueDate: string = this.kushkiFormControl['dueDate'].value.split('/');
    this.kushki.requestSubscriptionToken(
      {
        currency: this.detalleCompra.moneda == 1 ? 'PEN' : 'USD',
        card: {
          name: names,
          number: this.kushkiFormControl['cardNumber'].value,
          cvc: this.kushkiFormControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      },
      (response): void => {
        this._spinner.hide();

        if (response['code'] === '017') {
          this.messageInfoKushki = String.messageErrors.declined;
          return;
        }

        if (!response['token']) {
          this.messageInfoKushki =
            String.messageErrors.errorValidateTransaction;
          return;
        }

        this.kushkiResult(response);
      }
    );
  }

  private getCredentials(): void {
    this._spinner.show();

    const payload: any = {
      idRamo: 71,
      idProducto: 1,
      idMoneda: this.detalleCompra.moneda,
      idCategoria: '1',
    };

    this.kushkiService.getCredentials(payload).subscribe({
      next: (response: any): void => {
        if (!response.success) {
          return;
        }

        this.kushki = new Kushki({
          merchantId: response.llavePublica,
          inTestEnvironment: !environment.production,
          regional: false,
        });
        this._vc.createEmbeddedView(this.modalKushkiPayment);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this._spinner.hide();
      },
      complete: (): void => {
        this._spinner.hide();
      },
    });
  }

  binInfo(): void {
    if (this.kushkiFormControl['cardNumber'].value.length < 8) {
      return;
    }

    this.kushki.requestBinInfo(
      {
        bin: this.kushkiFormControl['cardNumber'].value,
      },
      (response: any): void => {
        this.cardType = response.brand;
      }
    );
  }

  saveInfoKushki(): void {
    const prove = JSON.parse(sessionStorage.getItem('infoContratante')) || null;
    const newdata =
      JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;

    const contratante =
      prove == null
        ? {
          documentType: +this.USER_INFO_API.p_NDOCUMENT_TYP,
          documentNumber: this.USER_INFO.nDoc,
          names: this.f['names'].value,
          paternalSurname: this.f['apePat'].value,
          maternalSurname: this.f['apeMat'].value,
          email: this.step1.email,
          phoneNumber: +this.f['phone'].value,
        }
        : {
          documentType: +prove.p_NDOCUMENT_TYP,
          documentNumber: prove.p_SDOCUMENT,
          names: prove.p_SCLIENT_NAME,
          paternalSurname: prove.p_SCLIENT_APPPAT,
          maternalSurname: prove.p_SCLIENT_APPMAT,
          phoneNumber: newdata.phone.toString(),
          email: newdata.email,
        };

    const payload = {
      montoCobro: this.ammountPayment,
      codigoCanal: this.selling['sellingChannel'],
      idUsuario: 3822,
      idRamo: 71,
      idProducto: 1,
      idMoneda: +this.tarifario.moneda,
      externalId: this.uuid,
      idTipoDocumento: contratante.documentType,
      numeroDocumento: contratante.documentNumber,
      email: contratante.email,
      idPayment: this.idProcess,
      nombres: contratante.names,
      apellidoPaterno: contratante.paternalSurname,
      apellidoMaterno: contratante.maternalSurname,
      razonSocial: null,
      telefono: contratante.phoneNumber,
      generar: false,
    };
    this.kushkiService.saveInfo(payload).subscribe();
  }
}
