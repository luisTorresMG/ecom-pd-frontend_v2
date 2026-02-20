import { FrecuenciaPago } from './../../layout/broker/models/polizaEmit/FrecuenciaPago';
import {
  Component,
  OnInit,
  AfterViewChecked,
  OnDestroy,
  Input,
  Output,
  ViewChild,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RecaptchaComponent, RecaptchaFormsModule  } from 'ng-recaptcha';
import moment from 'moment';

import { MainService } from '../shared/services/main.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { ValidateQuotationService } from '../shared/services/validate-quotation.service';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { ClientInfoService } from '../shared/services/client-info.service';
import { RegularExpressions } from '@shared/regexp/regexp';
import { fadeAnimation } from '@root/shared/animations/animations';
import { PlanRequest } from '../shared/models/plan-request';
import { AseguradoDto } from '../shared/models/asegurado.model';
import { AppConfig } from '../../app.config';
import { GoogleTagService } from '../shared/services/google-tag-service';
import { IDocumentInfoGestionRequest } from '../../shared/interfaces/document-information.interface';
import { maskAddress, maskDocument, maskEmail, maskName, maskPhone } from '../shared/utils/maskDataClient';

@Component({
  standalone: false,
  selector: 'app-validate-quotation',
  templateUrl: './validate-quotation.component.html',
  styleUrls: ['./validate-quotation.component.scss'],
  animations: [fadeAnimation]
})
export class ValidateQuotationComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  @Input() insuranceInfo: any;
  @Output() derivationAdvisorInfo = new EventEmitter();
  @Output() onClickSubmit = new EventEmitter();

  formInsurance: FormGroup;
  formDataTrama: FormGroup;
  formContractInsurance: FormGroup;
  archivoExcel: File;
  nombreArchivoExcel: string;
  dataBeneficiarios: Array<any> = [];
  dataAsegurados: Array<AseguradoDto> = [];
  departments$: Array<any>;
  provinces$: Array<any>;
  districts$: Array<any>;
  listStatusCivil$: Array<any>;
  parametros$: any;
  documentNumberLimit: { min: number; max: number };
  percents: number[] = [];
  insuranceType: string;
  insuranceCategory: string;
  subscription: Subscription;
  agregarBeneficiariosPorTrama: boolean;
  titleModalForm: string;
  tipoFormulario: number; // 1 = asegurado - 2 = beneficiario
  siteKey = AppConfig.CAPTCHA_KEY;
  isEditBenefi: boolean;

  errorTrama$: boolean;
  errorTramaMensaje$: string;
  errorTramaFile$: any = {
    fileName: null,
    fileBase64: null,
  };

  codClienteAseguradoSelected: any;
  tipoDocumentoAseguradoSelected: any;
  numeroDocumentoAseguradoSelected: any;

  errorFormInsurance = '';

  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  edit = false;
  typeOfModal: number; // ASEGURADO | BENEFICIARIO

  response: any;

  // *INDEX DEL ASEGURADO O BENEFICIARIO
  indexClient: number;

  hasErrorContractInsurance: string;
  hasErrorExistTitular: string;

  derivationAdvisor: boolean;
  relationshipContractor$: Array<any> = [];

  currentPageListErrors = 1;

  estudiantilIds: number[] = [3, 7];

  getDocumentIsCalled: boolean = false;
  isDocumentMasked: boolean = false;
  isLastnameMasked: boolean = false;
  isSurnameMasked: boolean = false;
  isAddressMasked: boolean = false;
  isEmailMasked: boolean = false;
  isPhoneMasked: boolean = false;
  documentMasked: string = '';
  lastnameMasked: string = '';
  surnameMasked: string = '';
  addressMasked: string = '';
  emailMasked: string = '';
  phoneMasked: string = '';

  @ViewChild('fileError', { static: false, read: ElementRef })
  fileError!: ElementRef;

  @ViewChild('modalInsurance', { static: true, read: TemplateRef })
  modalInsurance: TemplateRef<ElementRef>;

  @ViewChild('recaptchaRef', { static: true })
  recaptcha: RecaptchaComponent;

  @ViewChild('modalInvalidInsuranceLength', { static: true, read: TemplateRef })
  modalInvalidInsuranceLength: TemplateRef<ElementRef>;

  @ViewChild('modalDocumentInvalid', { static: true, read: TemplateRef })
  modalDocumentInvalid: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly validateQuotationService: ValidateQuotationService,
    private readonly spinner: NgxSpinnerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ga: GoogleAnalyticsService,
    private readonly mainService: MainService,
    private readonly utilsService: UtilsService,
    private readonly cd: ChangeDetectorRef,
    private readonly vc: ViewContainerRef,
    private readonly clientInfoService: ClientInfoService,
    private readonly gts: GoogleTagService
  ) {
    this.derivationAdvisor = false;
    this.hasErrorContractInsurance = null;
    this.hasErrorExistTitular = null;

    this.bsConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        format: 'DD/MM/YYYY',
        maxDate: new Date()
      }
    );

    this.documentNumberLimit = { min: 8, max: 8 };
    this.formContractInsurance = this.builder.group({
      active: [this.contractInsurance || false],
      labelTest: ['']
    });

    this.formInsurance = this.builder.group({
      codigoCliente: [null, Validators.required],
      tipoDocumento: [2, Validators.required],
      numeroDocumento: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(this.documentNumberLimit.min),
          Validators.maxLength(this.documentNumberLimit.max)
        ])
      ],
      nombres: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          Validators.required
        ])
      ],
      apePaterno: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          Validators.required
        ])
      ],
      apeMaterno: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          +this.session?.documentType == 4 ? null : Validators.required
        ])
      ],
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)
        ])
      ],
      sexo: [null, Validators.required],
      civilStatus: [null, Validators.required],
      relacion: [null, Validators.required],
      porcentaje: [null, Validators.required],
      fechaNac: [null, Validators.required],
      pais: [{ value: null, disabled: true }, Validators.required],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      direccion: [null, Validators.required],
      telefono: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(9),
          Validators.maxLength(9)
        ])
      ],
      aseguradoIndex: [null],
      relationshipContractor: [null],
      approvedClient: [null],
    });
    this.formDataTrama = this.builder.group({
      archivo: [null, Validators.required]
    });

    for (let i = 10; i <= 100; i += 10) {
      this.percents.push(i);
    }

    this.percents.push(25);
    this.percents = this.percents.sort((x, y) => x - y);

    this.subscription = new Subscription();
    this.subscription.add(
      this.route.params.subscribe((params) => {
        this.insuranceType = params.insuranceType;
        this.insuranceCategory = params.insuranceCategory;
      })
    );
    this.agregarBeneficiariosPorTrama = false;
    this.titleModalForm = 'AÑADE LOS SIGUIENTES DATOS DEL ASEGURADO';
    this.tipoFormulario = 1;
    this.fb['telefono'].valueChanges.subscribe((val) => {
      if (this.fb['telefono'].hasError('pattern')) {
        this.fb['telefono'].setValue(
          val?.toString().substring(0, val?.toString().length - 1)
        );
      }
    });

    this.fb['numeroDocumento'].valueChanges.subscribe((value: string) => {
      if (this.isDocumentMasked) {
        this.isDocumentMasked = false;
        this.fb['numeroDocumento'].setValue('', {emitEvent: false})
      }
      if (this.fb['numeroDocumento'].dirty) {
        this.getDocumentIsCalled = false;
        this.fb['fechaNac'].enable();
      }

      this.fb['numeroDocumento'].markAsUntouched();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    scrollTo(0, 0);
    this.mainService.nstep = 3;

    this.fb['nombres'].valueChanges.subscribe((val) => {
      if (this.fb['nombres'].hasError('pattern')) {
        this.fb['nombres'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fb['apePaterno'].valueChanges.subscribe((val) => {
      if (this.fb['apePaterno'].hasError('pattern')) {
        this.fb['apePaterno'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fb['apeMaterno'].valueChanges.subscribe((val) => {
      if (this.fb['apeMaterno'].hasError('pattern')) {
        this.fb['apeMaterno'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.fb['tipoDocumento'].valueChanges.subscribe((val) => {
      this.fb['numeroDocumento'].setValue(null);
      this.fb['nombres'].setValue(null);
      this.fb['apePaterno'].setValue(null);
      this.fb['apeMaterno'].setValue(null);
      this.fb['email'].setValue(null);
      this.fb['telefono'].setValue(null);
      this.fb['sexo'].setValue(null);
      this.fb['pais'].setValue(null);
      this.fb['direccion'].setValue(null);
      this.fb['department'].setValue(null);
      this.fb['province'].setValue(null);
      this.fb['district'].setValue(null);
      this.fb['fechaNac'].setValue(null);

      if (this.typeOfModal == 2) {
        this.fb['relacion'].setValue(null);
        this.fb['porcentaje'].setValue(null);
      }

      switch (Number(val)) {
        case 2: {
          this.documentNumberLimit = { min: 8, max: 8 };
          this.fb['pais'].setValue('1');
          this.fb['pais'].disable();
          this.fb['department'].enable();
          this.fb['province'].enable();
          this.fb['district'].enable();
          this.fb['department'].setValidators([Validators.required]);
          this.fb['province'].setValidators([Validators.required]);
          this.fb['district'].setValidators([Validators.required]);
          this.fb['apeMaterno'].setValidators([Validators.required]);
          this.fb['pais'].clearValidators();
          break;
        }
        case 4: {
          this.fb['department'].setValue(null);
          this.fb['province'].setValue(null);
          this.fb['district'].setValue(null);
          this.fb['department'].disable();
          this.fb['province'].disable();
          this.fb['district'].disable();
          this.fb['pais'].setValue(null);
          this.fb['pais'].enable();
          this.fb['department'].clearValidators();
          this.fb['province'].clearValidators();
          this.fb['district'].clearValidators();
          this.fb['pais'].setValidators([Validators.required]);
          this.fb['apeMaterno'].setValidators([
            Validators.pattern(RegularExpressions.text)
          ]);
          this.documentNumberLimit = { min: 9, max: 12 };
          break;
        }
      }
      this.fb['numeroDocumento'].setValidators([
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.documentNumberLimit.min),
          Validators.maxLength(this.documentNumberLimit.max),
          Validators.required
        ])
      ]);

      this.fb['apeMaterno'].updateValueAndValidity({
        emitEvent: false
      });
      this.fb['pais'].updateValueAndValidity({
        emitEvent: false
      });
      this.fb['department'].updateValueAndValidity({
        emitEvent: false
      });
      this.fb['province'].updateValueAndValidity({
        emitEvent: false
      });
      this.fb['district'].updateValueAndValidity({
        emitEvent: false
      });
      this.fb['numeroDocumento'].updateValueAndValidity({
        emitEvent: false
      });
    });
    this.fb['telefono'].valueChanges.subscribe((val) => {
      if (val) {
        if (
          this.fb['telefono'].hasError('pattern') ||
          val?.toString()?.slice(0, 1) != '9'
        ) {
          this.fb['telefono'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.spinner.show();
    this.validateQuotationService.getParametros().subscribe(
      (res: any) => {
        this.parametros$ = Object.freeze(res);
        this.listStatusCivil$ = res.estadoCivil?.filter(
          (val) => val.id != 8 && val.id != 7 && val.id != 5
        );
        this.departments$ = res.ubigeos;
        this.relationshipContractor$ = res.parentescos;

        this.relationshipContractor$.push(
          {
            id: '15',
            descripcion: 'Suegro/a'
          },
          {
            id: '41',
            descripcion: 'Titular'
          },
          {
            id: '25',
            descripcion: 'Yerno/Nuera'
          }
        );

        this.relationshipContractor$ = this.relationshipContractor$.sort(
          (a, b) => (a.descripcion as string).localeCompare(b.descripcion)
        );

        this.changesUbigeos();
        this.spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this.spinner.hide();
      }
    );
    this.agregarBeneficiariosPorTrama =
      Number(this.insurance.documentType) === 1;
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get session(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get categoryId(): number {
    return (
      JSON.parse(sessionStorage.getItem('_producto_selecionado'))[
        'categoryId'
        ] || null
    );
  }

  get contractInsurance(): any {
    return JSON.parse(sessionStorage.getItem('contractInsurance') || '{}')
      ?.active;
  }

  set contractInsuranceSession(checked: boolean) {
    sessionStorage.setItem(
      'contractInsurance',
      JSON.stringify({
        active: checked
      })
    );

    if (checked) {
      this.fb.tipoDocumento.setValue(Number(this.insurance.documentType));
      this.fb.numeroDocumento.setValue(this.insurance.documentNumber);
      this.fb.codigoCliente.setValue(
        `${this.fb.tipoDocumento.value}${this.fb.numeroDocumento.value}`
      );
      this.fb.nombres.setValue(this.insurance.name);
      this.fb.apePaterno.setValue(this.insurance.lastname);
      this.fb.apeMaterno.setValue(this.insurance.surname);
      this.fb.direccion.setValue(this.insurance.address);
      this.fb.telefono.setValue(this.insurance.phoneNumber);
      this.fb.pais.setValue(
        Number(this.insurance.documentType) === 2 ? '1' : this.insurance.country
      );
      this.fb.department.setValue(this.insurance.department?.toString());
      this.fb.province.setValue(Number(this.insurance.province));
      this.fb.district.setValue(Number(this.insurance.district));
      this.fb.email.setValue(this.insurance.email);
      this.fb.sexo.setValue(Number(this.insurance.sex));
      this.fb.civilStatus.setValue(+this.insurance.civilStatus);
      this.fb.approvedClient.setValue(+this.insurance.approvedClient);
      this.fb.fechaNac.setValue(
        this.insurance?.birthdate || this.insurance?.fechaNac
      );
      this.fb.porcentaje.setValue(100);
      this.fb.relacion.setValue(34);
      this.fb['relationshipContractor'].setValue('41');

      if (
        !this.dataAsegurados.find(
          (x) => x.codigoCliente == this.fb['codigoCliente']?.value
        ) &&
        this.productSelected == 1 &&
        this.sumPercentInsurance == 0
      ) {
        this.typeOfModal = this.tipoFormulario = 1;
        // this.vc.createEmbeddedView(this.modalInsurance);
        this.getDocumentIsCalled = true;
        this.agregarDataForm();
        return;
      }

      if (
        !this.dataAsegurados.find(
          (x) => x.codigoCliente == this.fb['codigoCliente']?.value
        ) &&
        this.productSelected != 1 &&
        this.productSelected != 3
      ) {
        this.typeOfModal = this.tipoFormulario = 1;
        // this.vc.createEmbeddedView(this.modalInsurance);
        this.getDocumentIsCalled = true;
        this.agregarDataForm();
        return;
      }

      sessionStorage.setItem(
        'contractInsurance',
        JSON.stringify({
          active: false
        })
      );

      this.formInsurance.reset();
      this.hasErrorContractInsurance = 'Ya existe un asegurado agregado';
      this.formContractInsurance.get('active').setValue(false, {
        emitEvent: false
      });

      setTimeout(() => {
        this.hasErrorContractInsurance = null;
      }, 3000);
    } else {
      const index = this.dataAsegurados.findIndex(
        (x) =>
          x.codigoCliente ==
          `${this.insurance.documentType}${this.insurance.documentNumber}`
      );
      if (index >= 0) {
        this.eliminarAsegurado(index);
      }
    }
  }

  get fb(): { [key: string]: AbstractControl } {
    return this.formInsurance.controls;
  }

  get planSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected')) || null;
  }

  get planSelectedInFa(): any {
    return JSON.parse(sessionStorage.getItem('_producto_selecionado')) || null;
  }

  get productSelected(): any {
    return JSON.parse(sessionStorage.getItem('productIdPolicy')) || null;
  }

  get showBenefits(): boolean {
    return Number(this.productSelected) !== 1;
  }

  get idTypeCategoria(): number {
    return Number(this.insurance.categoryId);
  }

  get typeCategory(): string {
    if (this.idTypeCategoria === 2) {
      return 'Seguros de Empresas';
    }
    return 'Seguros Personales';
  }

  get validityInsuranceLimit(): boolean {
    if (
      this.planSelectedInFa.key?.toLowerCase() === 'individual_hits' ||
      this.planSelectedInFa.key?.toLowerCase() === 'individual'
    ) {
      return this.dataAsegurados.length < 1;
    }

    if (
      this.planSelectedInFa.key?.toLowerCase() === 'familiar' ||
      this.planSelectedInFa.key?.toLowerCase() === 'estudiantil'
    ) {
      return this.dataAsegurados.length >= 0;
    }

    return true;
  }

  get isStudentProductSelected(): boolean {
    if (this.productSelected == 3) {
      return this.dataAsegurados.length == 0;
    }

    return true;
  }

  get validarStep(): boolean {
    if (+this.insurance.categoryId == 2) {
      return this.formDataTrama.valid;
    }

    const countFail = 0;
    let sumPercentageValid = 0;
    this.dataAsegurados.forEach((e) => {
      sumPercentageValid = e.beneficiarios
        ?.map((x) => x.porcentaje)
        ?.reduce((a, b) => +a + +b, 0);
    });

    // *BENEICIARIOS NO SON OBLIGATORIOS
    return (
      this.dataAsegurados?.length > 0 &&
      (sumPercentageValid == 0 || sumPercentageValid == 100) &&
      countFail == 0
    );
  }

  get getNumeroAsegurados(): string {
    if (this.dataAsegurados.length === 0) {
      return 'No tienes asegurados agregados';
    }
    if (this.dataAsegurados.length === 1) {
      return `Tienes (1) asegurado agregado`;
    }
    return `Tienes (${this.dataAsegurados.length}) asegurados agregados`;
  }

  get phoneValid(): boolean {
    return (
      this.fb['telefono'].value !== '987654321' &&
      this.fb['telefono'].value !== '999999999'
    );
  }

  get sumPercentInsurance(): number {
    let suma = 0;
    this.dataAsegurados.forEach((e) => {
      suma += +e.porcentaje;
    });
    return suma;
  }

  private changesUbigeos(): void {
    this.fb.department.valueChanges.subscribe((val) => {
      if (val !== null) {
        this.provinces$ = this.parametros$.ubigeos?.find(
          (x) => Number(x.id) === Number(val)
        )?.provincias;

        this.fb.province.setValue(null);
        this.fb.province.markAsUntouched();

        this.fb.district.setValue(null);
        this.fb.district.markAsUntouched();
        this.districts$ = [];
      }
    });

    this.fb.province.valueChanges.subscribe((val) => {
      if (val !== null) {
        this.districts$ = this.provinces$?.find(
          (x) => Number(x.idProvincia) === Number(val)
        )?.distritos;

        this.fb.district.setValue(null);
        this.fb.district.markAsUntouched();
      }
    });

    if (this.categoryId == 1) {
      if (sessionStorage.getItem('dataAsegurados')) {
        this.dataAsegurados = JSON.parse(
          sessionStorage.getItem('dataAsegurados')
        );
      } else {
        if (
          this.insurance.contractInsurance &&
          !this.estudiantilIds.includes(+this.productSelected)
        ) {
          this.fb.tipoDocumento.setValue(+this.insurance.documentType);
          this.fb.numeroDocumento.setValue(this.insurance.documentNumber);
          this.fb.codigoCliente.setValue(
            `${this.fb.tipoDocumento.value}${this.fb.numeroDocumento.value}`
          );
          this.fb.nombres.setValue(this.insurance.name);
          this.fb.apePaterno.setValue(this.insurance.lastname);
          this.fb.apeMaterno.setValue(this.insurance.surname);
          this.fb.direccion.setValue(this.insurance.address);
          this.fb.telefono.setValue(this.insurance.phoneNumber);
          this.fb.pais.setValue(
            Number(this.insurance.documentType) === 2 ? '1' : null
          );
          this.fb.department.setValue(this.insurance.department?.toString());
          this.fb.province.setValue(Number(this.insurance.province));
          this.fb.district.setValue(Number(this.insurance.district));
          this.fb.email.setValue(this.insurance.email);
          this.fb.sexo.setValue(Number(this.insurance.sex));
          this.fb.fechaNac.setValue(this.insurance.birthdate);
          setTimeout(() => {
            this.showHideModalBeneficiario(
              true,
              'AÑADE LOS SIGUIENTES DATOS DEL ASEGURADO',
              1
            );
          });
        }
      }
    }

    if (+this.insurance.categoryId == 1) {
      this.formContractInsurance.get('active').valueChanges.subscribe((val) => {
        this.contractInsuranceSession = val;
      });

      if (!sessionStorage.getItem('contractInsurance')) {
        this.formContractInsurance.get('active').setValue(true);
      }
    }
  }

  private isInsuranceContract(document: string): boolean {
    const sessionDocument = `${this.insurance.documentType}${this.insurance.documentNumber}`;
    return sessionDocument == document;
  }

  hideEdit(index: number): boolean {
    const productKeys = ['individual', 'individual_hits'];
    if (productKeys.includes(this.planSelectedInFa.key)) {
      return true;
    }
    return (
      this.dataAsegurados[index].numeroDocumento ===
      this.insurance.documentNumber
    );
  }

  validateSumaBeneficiaries(data: Array<any>): boolean {
    if (!data.length) {
      return false;
    }

    let suma = 0;
    data.forEach((e) => {
      suma += Number(e.porcentaje);
    });

    return suma !== 100;
  }

  agregarDataForm(): void {
    if (this.fb['fechaNac'].value?.toString().length >= 12) {
      this.fb['fechaNac'].setValue(
        moment(this.fb['fechaNac'].value).format('DD/MM/YYYY')
      );
    }

    if (!this.getDocumentIsCalled) {
      this.getDataOfDocument();
      return;
    }

    if (this.formInsurance.valid) {
      switch (this.tipoFormulario) {
        case 1: {
          const data: AseguradoDto = {
            index: this.fb['aseguradoIndex'].value,
            codigoCliente:
              this.fb['tipoDocumento'].value +
              '' +
              this.fb['numeroDocumento'].value,
            idTipoPersona: 1,
            apellidoMaterno: this.fb['apeMaterno'].value,
            apellidoPaterno: this.fb['apePaterno'].value,
            direccion: this.fb['direccion'].value,
            email: this.fb['email'].value,
            fechaNacimiento: this.fb['fechaNac'].value,
            idNacionalidad:
              Number(this.fb['tipoDocumento'].value) === 2
                ? '1'
                : this.fb.pais.value?.toString(),
            idSexo: this.fb['sexo'].value,
            idEstadoCivil: +this.fb['civilStatus'].value,
            idTipoDocumento: this.fb['tipoDocumento'].value,
            nombre: this.fb['nombres'].value,
            numeroDocumento: this.fb['numeroDocumento'].value,
            porcentaje: this.fb['porcentaje'].value,
            telefono: this.fb['telefono'].value,
            clienteHomologado: this.fb['approvedClient'].value,
            relacion: {
              id: this.fb['relacion'].value,
              descripcion: this.getRelacionString(this.fb['relacion'].value)
            },
            departamento: {
              id: this.fb['department'].value,
              descripcion: this.getDepartmentString(
                this.fb['department'].value.toString()
              )
            },
            provincia: {
              id: this.fb['province'].value,
              descripcion: this.getProvinceString(
                this.fb['province'].value.toString()
              )
            },
            distrito: {
              id: this.fb['district'].value,
              descripcion: this.getDistrictString(
                this.fb['district'].value.toString()
              )
            },
            // tslint:disable-next-line:max-line-length
            beneficiarios:
              this.dataAsegurados.find(
                (x) =>
                  x.codigoCliente.toString() ===
                  this.fb.codigoCliente.value.toString()
              )?.beneficiarios || [],
            idRelacionContratante:
              +this.fb['relationshipContractor'].value || null,
            relacionContratante:
              this.relationshipContractor$.find(
                (x) => x.id == this.fb['relationshipContractor'].value
              )?.descripcion || null
          };

          if (this.fb['aseguradoIndex'].value !== null) {
            this.dataAsegurados[this.fb['aseguradoIndex'].value] = data;
          } else {
            this.dataAsegurados.push(data);
            this.ga.emitGenericEventAP(`Clic en 'Agregar Asegurado'`);
          }
          if (
            this.dataAsegurados.some(
              (x) =>
                x.codigoCliente ==
                `${this.insurance.documentType}${this.insurance.documentNumber}`
            )
          ) {
            this.formContractInsurance.get('active').setValue(true, {
              emitEvent: false
            });
          } else {
            this.formContractInsurance.get('active').setValue(false, {
              emitEvent: false
            });
          }
          sessionStorage.setItem(
            'contractInsurance',
            JSON.stringify({
              active: this.formContractInsurance.get('active').value
            })
          );
          this.fb['aseguradoIndex'].setValue(null);
          this.vc.clear();
          this.edit = false;
          this.formInsurance.reset();
          this.fb['tipoDocumento'].setValue(2);
          this.codClienteAseguradoSelected = null;
          this.tipoDocumentoAseguradoSelected = null;
          this.numeroDocumentoAseguradoSelected = null;
          break;
        }
        case 2: {
          let sumaPorcentajeAsignacionBeneficiarios = Number(
            this.fb.porcentaje.value
          );

          this.dataAsegurados
            .find(
              (x) =>
                x.codigoCliente.toString() ===
                this.codClienteAseguradoSelected.toString()
            )
            .beneficiarios.forEach((val) => {
            if (this.fb['aseguradoIndex'].value !== null) {
              if (
                val.codigoClienteAsegurado.toString() !==
                this.fb.codigoCliente.value.toString()
              ) {
                sumaPorcentajeAsignacionBeneficiarios -= Number(
                  val.porcentaje
                );
                sumaPorcentajeAsignacionBeneficiarios += Number(
                  val.porcentaje
                );
              }
            } else {
              sumaPorcentajeAsignacionBeneficiarios += Number(val.porcentaje);
            }
          });

          if (sumaPorcentajeAsignacionBeneficiarios > 100) {
            this.isEditBenefi = false;
            this.errorFormInsurance =
              'La suma de los porcentajes de asignación de los beneficiarios debe ser 100%';
          } else {
            const data: any = {
              index: this.fb['aseguradoIndex'].value,
              codigoCliente:
                this.fb['tipoDocumento'].value +
                '' +
                this.fb['numeroDocumento'].value,
              codigoClienteAsegurado:
                this.tipoDocumentoAseguradoSelected +
                '' +
                this.numeroDocumentoAseguradoSelected,
              idTipoDocumentoAsegurado: this.tipoDocumentoAseguradoSelected,
              numeroDocumentoAsegurado: this.numeroDocumentoAseguradoSelected,
              idTipoPersona: 1,
              apellidoMaterno: this.fb['apeMaterno'].value,
              apellidoPaterno: this.fb['apePaterno'].value,
              direccion: this.fb['direccion'].value,
              email: this.fb['email'].value,
              fechaNacimiento: this.fb['fechaNac'].value,
              idNacionalidad:
                Number(this.fb['tipoDocumento'].value) === 2
                  ? 1
                  : this.fb['pais'].value,
              idSexo: this.fb['sexo'].value,
              idEstadoCivil: this.fb['civilStatus'].value,
              idTipoDocumento: this.fb['tipoDocumento'].value,
              nombre: this.fb['nombres'].value,
              numeroDocumento: this.fb['numeroDocumento'].value,
              porcentaje: this.fb['porcentaje'].value,
              telefono: this.fb['telefono'].value,
              clienteHomologado: this.fb['approvedClient'].value,
              relacion: {
                id: this.fb['relacion'].value,
                descripcion: this.getRelacionString(this.fb['relacion'].value)
              },
              departamento: {
                id: this.fb['department'].value,
                descripcion: this.getDepartmentString(
                  this.fb['department'].value?.toString()
                )
              },
              provincia: {
                id: this.fb['province'].value,
                descripcion: this.getProvinceString(
                  this.fb['province'].value?.toString()
                )
              },
              distrito: {
                id: this.fb['district'].value,
                descripcion: this.getDistrictString(
                  this.fb['district'].value?.toString()
                )
              }
            };
            const find = this.dataAsegurados.find(
              (x) =>
                Number(x.codigoCliente) ===
                Number(this.codClienteAseguradoSelected)
            );
            const idx = this.dataAsegurados.indexOf(find);
            if (this.fb['aseguradoIndex'].value !== null) {
              const index = this.fb['aseguradoIndex'].value;
              this.dataBeneficiarios[index] = data;
              this.dataAsegurados[idx].beneficiarios[index] = data;
            } else {
              this.dataAsegurados[idx].beneficiarios.push(data);
              this.dataBeneficiarios.push(data);
              this.ga.emitGenericEventAP(`Clic en 'Agregar Beneficiario'`);
            }

            this.vc.clear();
            this.formInsurance.reset();
            this.fb['tipoDocumento'].setValue(2);
            this.codClienteAseguradoSelected = null;
            this.tipoDocumentoAseguradoSelected = null;
            this.numeroDocumentoAseguradoSelected = null;
          }
          break;
        }
      }
    } else {
      this.formInsurance.markAllAsTouched();
    }

    this.saveToStorage('dataAsegurados', this.dataAsegurados);
    this.validateExistTitular();
  }

  getCountBeneficiaries(clientCode: any): number {
    const insurance = this.dataAsegurados.find(
      (x) => x.codigoCliente?.toString() === clientCode
    );

    return insurance?.beneficiarios.length;
  }

  private saveToStorage(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  disableFormBenesficiary(): void {
    this.fb['nombres'].disable({ emitEvent: false });
    this.fb['apePaterno'].disable({ emitEvent: false });
    this.fb['apeMaterno'].disable({ emitEvent: false });
    this.fb['direccion'].disable({ emitEvent: false });
    this.fb['relacion'].disable({ emitEvent: false });
    this.fb['porcentaje'].disable({ emitEvent: false });
    this.fb['civilStatus'].disable({ emitEvent: false });
    this.fb['department'].disable({ emitEvent: false });
    this.fb['province'].disable({ emitEvent: false });
    this.fb['district'].disable({ emitEvent: false });
    this.fb['email'].disable({ emitEvent: false });
    this.fb['telefono'].disable({ emitEvent: false });
    this.fb['sexo'].disable({ emitEvent: false });
    this.fb['fechaNac'].disable({ emitEvent: false });
  }

  enableFormBenesficiary(): void {
    this.fb['nombres'].enable({ emitEvent: false });
    this.fb['apePaterno'].enable({ emitEvent: false });
    this.fb['apeMaterno'].enable({ emitEvent: false });
    this.fb['direccion'].enable({ emitEvent: false });
    this.fb['relacion'].enable({ emitEvent: false });
    this.fb['porcentaje'].enable({ emitEvent: false });
    this.fb['civilStatus'].enable({ emitEvent: false });
    this.fb['department'].enable({ emitEvent: false });
    this.fb['province'].enable({ emitEvent: false });
    this.fb['district'].enable({ emitEvent: false });
    this.fb['email'].enable({ emitEvent: false });
    this.fb['telefono'].enable({ emitEvent: false });
    this.fb['sexo'].enable({ emitEvent: false });
    this.fb['fechaNac'].enable({ emitEvent: false });
  }

  showHideModalBeneficiario(
    show: boolean,
    title?: string,
    tipoForm?: number,
    data: any = {}
  ): void {
    this.indexClient = null;
    this.formInsurance.reset();
    this.formInsurance.enable();
    this.getDocumentIsCalled = false;
    this.fb['tipoDocumento'].setValue(2);
    this.isDocumentMasked = false;
    this.documentMasked = '';

    this.errorFormInsurance = '';
    if (show) {
      this.typeOfModal = this.tipoFormulario = tipoForm;
      this.titleModalForm = title;

      // this.disableFormBenesficiary();

      if (Number(tipoForm) === 1) {
        const d: Date = new Date();
        d.setFullYear(d.getFullYear() - 1);
        this.bsConfig = Object.assign(
          {},
          {
            locale: 'es',
            showWeekNumbers: false,
            format: 'DD/MM/YYYY',
            maxDate: new Date(d)
          }
        );
        d.setFullYear(new Date().getFullYear());
        this.fb.porcentaje.setValue(100); // EL ASEGURADO TIENE EL 100% DE PARTICIPACION
        this.fb.relacion.setValue(34); // 34: ASEGURADO
        this.fb['relationshipContractor'].setValidators(Validators.required);

        this.fb['relationshipContractor'].enable({ emitEvent: false });
        if (
          this.estudiantilIds.includes(+this.productSelected) &&
          !this.dataAsegurados.length
        ) {
          this.fb['relationshipContractor'].setValue('41');
          this.fb['relationshipContractor'].disable({ emitEvent: false });
        }
      } else {
        this.fb['relationshipContractor'].clearValidators();
        this.bsConfig = Object.assign(
          {},
          {
            locale: 'es',
            showWeekNumbers: false,
            format: 'DD/MM/YYYY',
            maxDate: new Date()
          }
        );
        this.fb.porcentaje.setValue(null);
        this.codClienteAseguradoSelected = data?.codigoCliente;
        this.tipoDocumentoAseguradoSelected = data?.idTipoDocumento;
        this.numeroDocumentoAseguradoSelected = data?.numeroDocumento;
      }
      this.vc.createEmbeddedView(this.modalInsurance);
    } else {
      this.typeOfModal = null;
      this.vc.clear();
      this.fb['aseguradoIndex'].setValue(null);
      this.formInsurance.reset();
      this.fb.tipoDocumento.setValue(2);
      this.edit = false;
      this.formInsurance.markAsUntouched();
      this.enableFormBenesficiary();

      const code = `${this.session.documentType}${this.session.documentNumber}`;
      if (!this.dataAsegurados.some((x) => x.codigoCliente == code)) {
        this.formContractInsurance.get('active').setValue(false);
      }
    }
  }

  private getRelacionString(val) {
    return this.parametros$?.parentescos?.find(
      (x) => x.id?.toString() == val?.toString()
    )?.descripcion;
  }

  private getDepartmentString(val) {
    return this.departments$?.filter((x) => x.id.toString() == val)[0]?.descripcion;
  }

  private getProvinceString(val) {
    return this.provinces$?.filter((x) => x.idProvincia.toString() == val)[0]?.provincia;
  }

  private getDistrictString(val) {
    return this.districts$?.filter((x) => x.idDistrito.toString() == val)[0]?.distrito;
  }

  getParentesco(id: any): string {
    if (!this.parametros$) {
      return '';
    }

    return this.parametros$.parentescos.find((x) => Number(x.id) === Number(id))?.descripcion;
  }

  eliminarAsegurado(index: number) {
    const codeClient = this.dataAsegurados[index]?.codigoCliente;
    // tslint:disable-next-line:max-line-length
    this.dataAsegurados = this.dataAsegurados.filter(
      (x) => x.codigoCliente?.toString() !== codeClient
    );

    this.ga.emitGenericEventAP(`Clic en 'Eliminar Asegurado'`);
    this.saveToStorage('dataAsegurados', this.dataAsegurados);

    if (
      `${this.insurance.documentType}${this.insurance.documentNumber}` ==
      codeClient
    ) {
      this.formContractInsurance.get('active').setValue(false);
    }

    this.validateExistTitular();
  }

  eliminarBeneficiario(data, index: number) {
    data.beneficiarios.splice(index, 1);
    this.ga.emitGenericEventAP(`Clic en 'Eliminar Beneficiario'`);
    this.saveToStorage('dataAsegurados', this.dataAsegurados);
  }

  getDataOfDocument() {
    if (this.fb['numeroDocumento'].invalid) {
      return;
    }

    this.errorFormInsurance = '';
    this.fb['codigoCliente'].setValue(
      this.fb['tipoDocumento'].value + '' + this.fb['numeroDocumento'].value
    );

    if (
      this.typeOfModal == 2 &&
      this.isInsuranceContract(this.fb['codigoCliente'].value)
    ) {
      this.errorFormInsurance = `El contratante no puede ser beneficiario`;
      this.fb.numeroDocumento.setValue(null);
      return;
    }

    if (
      this.typeOfModal == 1 &&
      this.productSelected == 3 &&
      this.isInsuranceContract(this.fb['codigoCliente'].value)
    ) {
      this.errorFormInsurance =
        'El contratante no puede ser asegurado para este producto';
      this.fb.numeroDocumento.setValue(null);
      return;
    }

    let insuranceCopy: any[];
    if (this.tipoFormulario === 1) {
      insuranceCopy = this.dataAsegurados.filter(
        (x) => x !== this.dataAsegurados[this.indexClient]
      );
    } else {
      insuranceCopy = this.dataAsegurados;
    }

    insuranceCopy.forEach((x) => {
      if (Number(x.codigoCliente) !== Number(this.fb.codigoCliente.value)) {
        let benef: any[];
        if (this.tipoFormulario === 2) {
          benef = x.beneficiarios.filter(
            (y) => y !== x.beneficiarios[this.indexClient]
          );
        } else {
          benef = x.beneficiarios;
        }
        benef.forEach((y) => {
          if (Number(y.codigoCliente) === Number(this.fb.codigoCliente.value)) {
            const _: AseguradoDto = this.dataAsegurados.find(
              (z) =>
                z.numeroDocumento?.toString() ===
                y.numeroDocumentoAsegurado?.toString()
            );
            // tslint:disable-next-line:max-line-length
            this.errorFormInsurance = `Esta persona ya es beneficiario del asegurado ${_.nombre} ${_.apellidoPaterno} ${_.apellidoMaterno}.`;
            this.fb.numeroDocumento.setValue(null);
            return;
          }
        });
      } else {
        this.fb.numeroDocumento.setValue(null);
        this.errorFormInsurance =
          'Esta persona ya es asegurado, por favor colocar otro número de documento.';
        return;
      }
    });
    this.requestClientInfo();
  }

  requestClientInfo() {
    if (this.fb['numeroDocumento'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.infoDocumento(token);
      return;
    }
  }

  private infoDocumento(token: string): void {
    if (
      this.fb['numeroDocumento'].invalid ||
      this.fb['tipoDocumento'].invalid
    ) {
      return;
    }

    this.spinner.show();
    this.isLastnameMasked = false;
    this.isSurnameMasked = false;
    this.isAddressMasked = false;
    this.isEmailMasked = false;
    this.isPhoneMasked = false;

    const data: IDocumentInfoGestionRequest = {
      idRamo: 61,
      idTipoDocumento: this.fb['tipoDocumento'].value,
      numeroDocumento: this.fb['numeroDocumento'].value,
      fechaNacimiento: this.fb['fechaNac'].value,
      idUsuario: 3822,
      token: token
    };
    this.utilsService.documentInfoGestion(data).subscribe({
      next: (res: DocumentInfoResponseModel) => {

        if (!res.success) {
            if ( this.fb['tipoDocumento'].value == 2 && !res.underAge) {
                this.vc.clear();
                this.vc.createEmbeddedView(this.modalDocumentInvalid)
                return;
            }
        }
        

        this.getDocumentIsCalled = true;
        this.enableFormBenesficiary();

        if (
          this.isInsuranceContract(
            `${this.fb['tipoDocumento'].value}${this.fb['numeroDocumento'].value}`
          )
        ) {
          const dataInsurance = JSON.parse(sessionStorage.getItem('insurance'));

          this.fb['tipoDocumento'].setValue(dataInsurance.documentType);
          this.fb['apeMaterno'].setValue(dataInsurance.apeMat);
          this.fb['apePaterno'].setValue(dataInsurance.apePat);
          this.fb['direccion'].setValue(dataInsurance.address);
          this.fb['email'].setValue(dataInsurance.email);
          this.fb['fechaNac'].setValue(dataInsurance.fechaNac);
          this.fb['pais'].setValue(dataInsurance.nacionalidad?.toString());
          this.fb['sexo'].setValue(dataInsurance.sex);
          this.fb['civilStatus'].setValue(dataInsurance.civilStatus);
          this.fb['nombres'].setValue(dataInsurance.name);
          this.fb['numeroDocumento'].setValue(dataInsurance.documentNumber);
          this.fb['telefono'].setValue(dataInsurance.telefono);
          this.fb['department'].setValue(dataInsurance.department);
          this.fb['province'].setValue(dataInsurance.province);
          this.fb['district'].setValue(dataInsurance.district);
          this.fb['approvedClient'].setValue(dataInsurance.approvedClient);
        } else {
          const infoClient = res;

          this.fb['nombres'].setValue(infoClient?.names);
          this.fb['apePaterno'].setValue(infoClient?.apePat);
          this.fb['apeMaterno'].setValue(infoClient?.apeMat);
          this.fb['direccion'].setValue(infoClient?.address);

          this.fb['email'].setValue(infoClient?.email);
          this.fb['telefono'].setValue(infoClient?.phoneNumber);

          if (infoClient?.apePat) {
            this.isLastnameMasked = true;
            this.lastnameMasked = maskName(infoClient?.apePat);
          }

          if (infoClient?.apeMat) {
            this.isSurnameMasked = true;
            this.surnameMasked = maskName(infoClient?.apeMat);
          }

          if (infoClient?.address) {
            this.isAddressMasked = true;
            this.addressMasked = maskAddress(infoClient?.address);
          }

          if (infoClient?.email) {
            this.isEmailMasked = true;
            this.emailMasked = maskEmail(infoClient?.email);
          }

          if (infoClient?.phoneNumber) {
            this.isPhoneMasked = true;
            this.phoneMasked = maskPhone(infoClient?.phoneNumber.toString())
          }

          this.fb['sexo'].setValue(
            +infoClient?.sex === 1 ||
            +infoClient?.sex === 2
              ? +infoClient?.sex
              : null);
          this.fb['approvedClient'].setValue(infoClient?.approvedClient);
          this.fb['civilStatus'].setValue(
            infoClient?.civilStatus == 5 ||
            infoClient?.civilStatus == 7 ||
            infoClient?.civilStatus == 8
              ? null
              : infoClient?.civilStatus
          );

          if (infoClient?.birthdate) {
            this.fb['fechaNac'].setValue(infoClient?.birthdate);
          }

          if (this.fb['tipoDocumento'].value == 2) {
            this.fb['pais'].setValue('1');

            if (
              this.departments$?.find((x) => +x.id == +infoClient?.department)
            ) {
              this.fb['department'].setValue(
                infoClient?.department
                  ? infoClient.department?.toString()
                  : null
              );
            }

            if (
              this.provinces$?.find(
                (x) => +x.idProvincia == +infoClient?.province
              )
            ) {
              this.fb['province'].setValue(infoClient?.province);
            }

            if (
              this.districts$?.find(
                (x) => +x.idDistrito == +infoClient?.district
              )
            ) {
              this.fb['district'].setValue(infoClient?.district);
            }
          }
        }

        if (res?.approvedClient) {
          if (res?.names) {
          this.fb['nombres'].disable({
              emitEvent: false,
          });
          }

          if (res?.apePat) {
          this.fb['apePaterno'].disable({
              emitEvent: false,
          });
          }

          if (res?.apeMat) {
          this.fb['apeMaterno'].disable({
              emitEvent: false,
          });
          }

          if (res?.birthdate) {
          this.fb['fechaNac'].disable({
              emitEvent: false,
          });
          }

          if (res?.sex) {
          this.fb['sexo'].disable({
              emitEvent: false,
          });
          }
        } else {
          this.fb['nombres'].enable({
            emitEvent: false
          });
          this.fb['apePaterno'].enable({
            emitEvent: false
          });
          this.fb['apeMaterno'].enable({
            emitEvent: false
          });
          this.fb['fechaNac'].enable({
            emitEvent: false
          });
          this.fb['sexo'].enable({
            emitEvent: false
          });
        }
        this.formInsurance.markAllAsTouched();
      },
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        this.spinner.hide();
        this.recaptcha.reset();
      }
    });
  }

  backStep(): void {
    this.ga.emitGenericEventAP(`Clic en 'Anterior'`);
    this.router.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-2`
    ]);
  }

  nextStep(): void {
    if (
      !this.validarStep ||
      !this.insuranceInfo?.insuranceInfoIsValid ||
      this.hasErrorExistTitular ||
      this.isInvalidForm
    ) {
      this.formInsurance.markAllAsTouched();
      this.onClickSubmit.emit(true);

      if (this.dataAsegurados.length == 0 && this.productSelected == '3') {
        this.hasErrorExistTitular =
          'Debes agregar un asegurado para esta póliza';
        this.vc.createEmbeddedView(this.modalInvalidInsuranceLength);
      }
      return;
    }

    this.spinner.show();

    this.errorTrama$ = false;
    this.errorTramaMensaje$ = '';
    this.errorTramaFile$ = {
      fileName: null,
      fileBase64: null,
    };
    this.currentPageListErrors = 1;

    const beneficiarios = [];
    const asegurados = [];

    let cantidadBeneficiariosInd = 0;
    let cantidadAseguradoInd = 0;

    this.dataAsegurados.forEach((x) => {
      cantidadAseguradoInd++;
      x.beneficiarios.forEach((e) => {
        cantidadBeneficiariosInd++;
        let paisBeneficiario = '';
        const nacionalidadBeneficiario = this.parametros$.nacionalidades.filter(
          (val) => val.id == e.idNacionalidad
        );
        nacionalidadBeneficiario.map((vale) => {
          paisBeneficiario = vale.descripcion;
        });

        beneficiarios.push({
          ...e,
          correo: e.email,
          nombres: e.nombre,
          idDepartamento: e.departamento.id,
          departamento: e.departamento.descripcion,
          idProvincia: e.provincia.id,
          provincia: e.provincia.descripcion,
          idDistrito: e.distrito.id,
          distrito: e.distrito.descripcion,
          idEstadoCivil: +e.idEstadoCivil,
          porcentajeParticipacion: e.porcentaje,
          idRelacion: e.relacion.id,
          relacion: e.relacion.descripcion,
          celular: e.telefono,
          nacionalidad: paisBeneficiario
        });
      });

      let paisAsegurado = '';
      const nacionalidadAsegurado = this.parametros$.nacionalidades.filter(
        (val) => val.id == x.idNacionalidad
      );

      nacionalidadAsegurado.map((vale) => {
        paisAsegurado = vale.descripcion;
      });

      const dataAsegurados = {
        codigoCliente: x.codigoCliente,
        idTipoPersona: x.idTipoPersona,
        nombres: x.nombre,
        apellidoMaterno: x.apellidoMaterno,
        apellidoPaterno: x.apellidoPaterno,
        direccion: x.direccion,
        correo: x.email,
        fechaNacimiento: x.fechaNacimiento,
        idNacionalidad: x.idNacionalidad,
        idSexo: x.idSexo,
        idEstadoCivil: x.idEstadoCivil,
        idTipoDocumento: x.idTipoDocumento,
        nombre: x.nombre,
        numeroDocumento: x.numeroDocumento,
        celular: x.telefono,
        idDepartamento: x.departamento.id,
        departamento: x.departamento.descripcion,
        idProvincia: x.provincia.id,
        provincia: x.provincia.descripcion,
        idDistrito: x.distrito.id,
        distrito: x.distrito.descripcion,
        idRelacion: x.idRelacionContratante,
        relacion: x.relacionContratante,
        nacionalidad: paisAsegurado
      };
      asegurados.push(dataAsegurados);
    });

    const data: any = {
      asegurados: asegurados || null,
      beneficiarios: beneficiarios || null,
      cantidadBeneficiarios: cantidadBeneficiariosInd,
      cantidadAsegurados: cantidadAseguradoInd
    };

    sessionStorage.setItem(
      'insurance',
      JSON.stringify({
        ...this.session,
        insuranceInfo: data
      })
    );

    const nuevo = {
      ...this.session,
      cantidadTrabajadores: cantidadAseguradoInd,
      mina: {
        ...this.session.mina,
        idDepartamentoMina: null
      }
    };

    const request = new PlanRequest(nuevo);

    const tagDataUno = {
      event: 'virtualEventGA4_A5',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Datos del seguro',
      TipoAcción: 'Intento de avance',
      CTA: this.idTypeCategoria == 1 ? 'Siguiente' : 'Validar Trama',
      NombreSeguro: this.insurance.namePlan,
      TipoDocumento:
        this.insurance.documentType == 1
          ? 'RUC'
          : this.insurance.documentType == 2
            ? 'DNI'
            : 'CE',
      TipoMoneda: this.insurance.idMoneda == 1 ? 'Soles' : 'Dólares',
      Vigencia: this.insurance.frecuenciaPago?.descripcion,
      InicioVigencia: moment(this.insurance.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.insurance.endValidity,
      NumBeneficiarios: cantidadBeneficiariosInd,
      NumAsegurados: cantidadAseguradoInd,
      Ocupacion: this.insurance.actividad?.descripcion
    };

    const tagDataDos = {
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa'
    };

    if (this.insurance.productId == 1 || this.insurance.productId == 2) {
      const tagManagerPayloadInd = {
        ...tagDataUno,
        ...tagDataDos
      };
      this.gts.virtualEvent(tagManagerPayloadInd);
    }

    if (this.insurance.productId == 3) {
      const tagManagerPayloadEstudent = {
        ...tagDataUno,
        Ubicación: this.insurance.ubicacionEstudiantil,
        ...tagDataDos
      };
      this.gts.virtualEvent(tagManagerPayloadEstudent);
    }

    const tagManagerPayloadRuc = {
      event: 'virtualEventGA4_A5',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Datos del seguro',
      TipoAcción: 'Intento avance',
      CTA: 'Validar Trama',
      NombreSeguro: this.insurance.namePlan,
      TipoRegistro: 'RUC',
      TipoDocumento: 'RUC',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa'
    };

    if (this.insurance.categoryId == 2) {
      this.gts.virtualEvent(tagManagerPayloadRuc);
    }

    const payload = {
      processId: this.session.processId,
      seguro: request,
      insurances: asegurados,
      benefits: beneficiarios,
      fileAttach: this.archivoExcel
    };

    this.clientInfoService.getPlans(payload).subscribe({
      next: (response: any) => {
        sessionStorage.removeItem('service-plans');

        this.spinner.hide();

        if (payload.insurances.length == 0) {
          sessionStorage.setItem(
            'cantidadTrabajadores',
            response.cantidadTrabajadores
          );
        } else {
          sessionStorage.setItem(
            'cantidadTrabajadores',
            cantidadAseguradoInd?.toString()
          );
        }

        if (payload.benefits.length == 0) {
          sessionStorage.setItem(
            'cantidadBeneficiarios',
            response.cantidadBeneficiarios
          );
        } else {
          sessionStorage.setItem(
            'cantidadBeneficiarios',
            cantidadBeneficiariosInd?.toString()
          );
        }

        if (response.plans) {
          sessionStorage.setItem('service-plans', JSON.stringify(response));

          const tagManagerPayloadResponse = {
            ...tagDataUno,
            ...tagDataDos,
            TipoAcción: 'Avance exitoso'
          };

          if (this.insurance.productId == 1 || this.insurance.productId == 2) {
            this.gts.virtualEvent(tagManagerPayloadResponse);
          }

          if (this.insurance.productId == 3) {
            const tagManagerPayloadEstudentResponse = {
              ...tagDataUno,
              TipoAcción: 'Avance exitoso',
              Ubicación: this.insurance.ubicacionEstudiantil,
              ...tagDataDos
            };
            this.gts.virtualEvent(tagManagerPayloadEstudentResponse);
          }

          if (this.insurance.categoryId == 2) {
            const tagManagerPayloadRucResponse = {
              ...tagManagerPayloadRuc,
              TipoAcción: 'Avance exitoso'
            };
            this.gts.virtualEvent(tagManagerPayloadRucResponse);
          }

          this.mainService.nstep = 3.1;
          this.router.navigate([
            `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`
          ]);
          return;
        }

        if (response.reglaNegocio) {
          this.derivationAdvisor = true;
          this.derivationAdvisorInfo.emit(this.derivationAdvisor);
          this.userDerivation();
          return;
        }

        if (!response.errores?.length && !response.success) {
          this.derivationAdvisor = true;
          this.derivationAdvisorInfo.emit(this.derivationAdvisor);
          this.userDerivation();
          return;
        }

        this.errorTrama$ = !!response.errores?.length;

        if (response.errores?.length) {
          this.errorTramaFile$ = {
            fileName: response.nombreArchivo,
            fileBase64: response.archivo,
          };
        
          this.nombreArchivoExcel = null;
          this.formDataTrama.reset();
          this.archivoExcel = null;
          return;
        }
        return;
      },
      error: (error: any) => {
        console.error(error);
        this.spinner.hide();
        this.ga.emitGenericEventAP(
          'Obtener planes',
          0,
          'Error al obtener planes',
          2
        );
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  private userDerivation(): void {
    const data = JSON.parse(sessionStorage.getItem('insurance'));
    const apePaterno = data.apePat || '';
    const apeMaterno = data.apeMat || '';

    const payload = {
      idProceso: data.processId,
      idRamo: 61,
      ramo: 'Accidentes Personales',
      idProducto: +data.productId,
      producto: data.tipoPlan,
      idTipoDocumento: data.documentType?.toString(),
      numeroDocumento: data.documentNumber,
      nombres:
        data.documentType == 1
          ? '-'
          : `${data.name} ${apePaterno} ${apeMaterno}`,
      razonSocial: data.legalName || '-',
      correo: data.email,
      telefono: data.telefono?.toString()
    };

    this.clientInfoService.derivation(payload).subscribe(
      (res: any) => {
        console.log(res);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  validarTramaBeneficiario(e): void {
    const file = e?.target?.files;
    if (file?.length > 0) {
      this.fileError.nativeElement.textContent = '';
      if (
        file[0]?.name?.indexOf('.xls') !== -1 ||
        file[0]?.name?.indexOf('.xlsx') !== -1
      ) {
        this.nombreArchivoExcel = file[0]?.name;
        this.archivoExcel = e.target.files[0];

        const tagManagerPayloadFileResponse = {
          event: 'virtualEventGA4_A5',
          Producto: 'Accidentes Personales',
          Paso: 'Paso 3',
          Sección: 'Datos del seguro',
          TipoAcción: 'Avance exitoso-adjuntar archivo',
          CTA: 'Adjuntar Archivo',
          NombreSeguro: this.insurance.namePlan,
          TipoRegistro: 'RUC',
          TipoDocumento: 'RUC',
          pagePath: window.location.pathname,
          timeStamp: new Date().getTime(),
          user_id: this.insurance.id,
          TipoCliente: this.insurance.tipoCliente,
          ID_Proceso: this.insurance.processId,
          Canal: 'Venta Directa'
        };
        this.gts.virtualEvent(tagManagerPayloadFileResponse);
      } else {
        this.fileError.nativeElement.textContent =
          'Archivo inválido, solo permite formato Excel';
        this.nombreArchivoExcel = null;
        this.formDataTrama.reset();
        this.archivoExcel = null;
      }
    } else {
      this.fileError.nativeElement.textContent = '';
      this.nombreArchivoExcel = null;
      this.formDataTrama.reset();
      this.archivoExcel = null;
    }
  }

  tagUploadFile(): void {
    this.errorTrama$ = false;
    this.errorTramaMensaje$ = '';
    this.errorTramaFile$ = {
      fileName: null,
      fileBase64: null,
    };
    this.ga.emitGenericEventAP(`Clic en 'Adjuntar archivo'`);

    const tagManagerPayloadFile = {
      event: 'virtualEventGA4_A5',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Datos del seguro',
      TipoAcción: 'Intento de avance-adjuntar archivo',
      CTA: 'Adjuntar Archivo',
      NombreSeguro: this.insurance.namePlan,
      TipoRegistro: 'RUC',
      TipoDocumento: 'RUC',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa',
    };
    this.gts.virtualEvent(tagManagerPayloadFile);
  }

  validarDocumento(): void {
    const nDoc = this.fb['numeroDocumento'].value?.toString();
    const errors: ValidationErrors | null =
      this.fb['numeroDocumento'].errors || null;
    const typeError: string | {} = Object.keys(
      errors || {}
    )[0]?.toLocaleLowerCase();
    if (typeError === 'pattern') {
      const splitNumeroDocumento = nDoc?.substring(0, nDoc.length - 1);
      this.fb['numeroDocumento'].setValue(splitNumeroDocumento);
    }
    const document = `${this.fb['tipoDocumento'].value}${this.fb['numeroDocumento'].value}`;

    if (this.isInsuranceContract(document) || +this.productSelected == 3) {
      this.fb['relationshipContractor'].setValue('41');

      if (+this.productSelected == 3) {
        this.fb['relationshipContractor'].disable({ emitEvent: false });
      }
    } else {
      this.fb['relationshipContractor'].setValue(null);
      this.fb['relationshipContractor'].enable();
    }
  }

  validarInputForm(controlName: string): string {
    let res = '';
    const control: AbstractControl = this.fb[controlName];
    const errors: ValidationErrors | null = control.errors || null;
    const typeError = Object.keys(errors || {})[0]?.toLocaleLowerCase();
    if (control.touched) {
      switch (typeError) {
        case 'required': {
          res = 'Este campo es obligatorio';
          break;
        }
        case 'pattern': {
          res = 'Este campo no es válido';
          break;
        }
        case 'minlength': {
          res = 'Este campo tiene muy pocos caracteres';
          break;
        }
        case 'maxlength': {
          res = 'Este campo tiene demasiados caracteres';
          break;
        }
        default: {
          res = '';
          break;
        }
      }
    }
    return res;
  }

  hasErrorInputForm(controlName): boolean {
    if (this.validarInputForm(controlName) !== '') {
      return true;
    }
    return false;
  }

  editBenefits(data: AseguradoDto, index: number) {
    this.indexClient = index;
    this.isEditBenefi = true;
    this.getDocumentIsCalled = true;
    this.titleModalForm = 'EDITA LOS SIGUIENTES DATOS DEL BENEFICIARIO';
    this.tipoFormulario = this.typeOfModal = 2;
    this.codClienteAseguradoSelected = data.codigoCliente;
    this.tipoDocumentoAseguradoSelected = data.idTipoDocumento;
    this.numeroDocumentoAseguradoSelected = data.numeroDocumento;

    const benf: any = this.dataAsegurados.find(
      (x) =>
        x.codigoCliente?.toString() ===
        this.codClienteAseguradoSelected?.toString()
    ).beneficiarios[index];

    this.editForm(benf, index);
  }

  editAsegurado(data: AseguradoDto, index: number) {
    this.indexClient = index;
    this.getDocumentIsCalled = true;
    this.titleModalForm = 'EDITA LOS SIGUIENTES DATOS DEL ASEGURADO';

    this.tipoFormulario = this.typeOfModal = 1;
    this.editForm(data, index, true);
    this.validateExistTitular();
  }

  private editForm(data: AseguradoDto, index: number, isInsurance = false) {
    this.fb['tipoDocumento'].setValue(data.idTipoDocumento);
    this.fb['aseguradoIndex'].setValue(index);
    this.fb['apeMaterno'].setValue(data.apellidoMaterno);
    this.fb['apePaterno'].setValue(data.apellidoPaterno);
    this.fb['direccion'].setValue(data.direccion);
    this.fb['email'].setValue(data.email);
    this.fb['fechaNac'].setValue(data.fechaNacimiento);
    this.fb['fechaNac'].enable();
    this.fb['pais'].setValue(data.idNacionalidad?.toString());
    this.fb['sexo'].setValue(data.idSexo);
    this.fb['civilStatus'].setValue(data.idEstadoCivil);
    this.fb['nombres'].setValue(data.nombre);
    this.fb['numeroDocumento'].setValue(data.numeroDocumento);
    this.fb['porcentaje'].setValue(data.porcentaje);
    this.fb['telefono'].setValue(data.telefono);
    this.fb['relacion'].setValue(data.relacion.id?.toString());
    this.fb['department'].setValue(data.departamento.id);
    this.fb['province'].setValue(data.provincia.id);
    this.fb['district'].setValue(data.distrito.id);
    this.fb['codigoCliente'].setValue(data.codigoCliente);
    this.fb['relationshipContractor'].setValue(data.idRelacionContratante);
    this.fb['approvedClient'].setValue(data.clienteHomologado);

    this.isDocumentMasked = true;
    this.isLastnameMasked = true;
    this.isSurnameMasked = true;
    this.isAddressMasked = true;
    this.isEmailMasked = true;
    this.isPhoneMasked = true;

    this.documentMasked = maskDocument(data.numeroDocumento);
    this.lastnameMasked = maskName(data.apellidoPaterno);
    this.surnameMasked = maskName(data.apellidoMaterno);
    this.phoneMasked = maskPhone(data.telefono.toString());
    this.addressMasked = maskAddress(data.direccion);
    this.emailMasked = maskEmail(data.email);

    if (data.clienteHomologado) {
        this.fb['nombres'].disable({
          emitEvent: false,
        });
        this.fb['apePaterno'].disable({
          emitEvent: false,
        });
        this.fb['apeMaterno'].disable({
          emitEvent: false,
        });
        this.fb['fechaNac'].disable({
          emitEvent: false,
        });
        this.fb['sexo'].disable({
          emitEvent: false,
        });
      }

    if (isInsurance) {
      this.fb['relationshipContractor'].setValidators(Validators.required);

      if (this.estudiantilIds.includes(+this.productSelected)) {
        this.fb['relationshipContractor'].disable({ emitEvent: false });
      }
    } else {
      this.fb['relationshipContractor'].clearValidators();
    }
    // tslint:disable-next-line:max-line-length
    if (this.isInsuranceContract(data.codigoCliente)) {
      this.fb['tipoDocumento'].disable({
        emitEvent: false
      });
      this.fb['numeroDocumento'].disable({
        emitEvent: false
      });
      this.fb['nombres'].disable({
        emitEvent: false
      });
      this.fb['apePaterno'].disable({
        emitEvent: false
      });
      this.fb['apeMaterno'].disable({
        emitEvent: false
      });
      this.fb['department'].disable({
        emitEvent: false
      });
      this.fb['province'].disable({
        emitEvent: false
      });
      this.fb['district'].disable({
        emitEvent: false
      });
      this.fb['telefono'].disable({
        emitEvent: false
      });
      this.fb['email'].disable({
        emitEvent: false
      });
      this.fb['direccion'].disable({
        emitEvent: false
      });
      this.fb['civilStatus'].disable({
        emitEvent: false
      });
      this.fb['fechaNac'].disable({
        emitEvent: false
      });
      this.fb['sexo'].disable({
        emitEvent: false
      });
    }
    this.edit = true;
    this.vc.createEmbeddedView(this.modalInsurance);
  }

  isCompletePorcentajeAsignacion(beneficiarios: Array<any>): boolean {
    let suma = 0;
    beneficiarios.forEach((e) => {
      suma += Number(e.porcentaje);
    });
    if (suma >= 100) {
      return true;
    }
    return false;
  }

  formatoTrama(): void {
    this.ga.emitGenericEventAP(`Clic en 'Descargar Formato'`);

    const tagManagerPayload = {
      event: 'virtualEventGA4_A5',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Datos del seguro',
      TipoAcción: 'Seleccionar botón',
      CTA: 'Descargar Formato',
      NombreSeguro: this.insurance.namePlan,
      TipoRegistro: 'RUC',
      TipoDocumento: 'RUC',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManagerPayload);

    this.utilsService
      .fetchResource(
        'assets/accidentes-personales/files/Trama de asegurados_AP.xlsx',
        'arraybuffer'
      )
      .subscribe({
        next: (response: ArrayBuffer) => {
          const payload = {
            fileName: 'formato_trama_ap.xlsx',
            file: response
          };

          this.utilsService.downloadFile(payload);
        },
        error: (error: any) => {
          console.error(error);
        }
      });
  }

  emailSuggestion(e: string) {
    this.fb['email'].setValue(e);
  }

  onFechaNacClick(): void {
    this.getDocumentIsCalled = false;
  }

  backToHome(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this.router.navigate(['/accidentespersonales']);
  }

  private validateExistTitular(): void {
    const existTitular = this.dataAsegurados.filter(
      (e) => e.idRelacionContratante == 41
    );

    this.hasErrorExistTitular =
      existTitular.length == 0
        ? 'Debe seleccionar al menos 1 titular'
        : existTitular.length > 1
          ? 'Solo debe existir 1 titular'
          : null;
  }

  get isInvalidForm(): boolean {
    if (this.productSelected == 3 && !this.dataAsegurados.length) {
      return false;
    }

    return (
      !this.validarStep ||
      !this.insuranceInfo?.insuranceInfoIsValid ||
      !!this.hasErrorExistTitular
    );
  }

  closeModal(): void {
    this.vc.clear();
  }

  downloadFile(): void {
    this.utilsService.downloadFile(this.errorTramaFile$);
  }

  maskNameClient(data: string) {
    return maskName(data)
  }
}
