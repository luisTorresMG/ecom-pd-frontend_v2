import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
  ViewChild,
  TemplateRef,
  ElementRef,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { NgxSpinnerService } from 'ngx-spinner';
import { RecaptchaComponent } from 'ng-recaptcha';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MainService } from '../shared/services/main.service';
import { RegularExpressions } from '@shared/regexp/regexp';
import { fadeAnimation } from '@root/shared/animations/animations';
import { ParametersResponse } from '../../layout/vidaindividual-latest/models/parameters.model';
import { UbigeoService } from '../../shared/services/ubigeo/ubigeo.service';
import { UserInfoRequest } from '../shared/models/user-info-request';
import { ClientInfoService } from '../shared/services/client-info.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { IDocumentInfoGestionRequest } from '../../shared/interfaces/document-information.interface';
import { DocumentInfoResponseModel } from '../../shared/models/document-information/document-information.model';
import { AppConfig } from '../../app.config';
import { GoogleTagService } from '../shared/services/google-tag-service';
import moment from 'moment';
import { maskAddress, maskDocument, maskName, maskPhone } from '../shared/utils/maskDataClient';

@Component({
  standalone: false,
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  animations: [fadeAnimation],
})
export class UserInfoComponent implements OnInit, OnDestroy, AfterViewChecked {
  hasErrorSubmit: string;
  datePickerConfig: Partial<BsDatepickerConfig>;
  paramSubject = new Subscription();
  insuranceType: string;
  insuranceCategory: string;

  documentTypes = [
    { value: '4', label: 'CE' },
    { value: '2', label: 'DNI' },
    { value: '1', label: 'RUC' },
  ];

  sexTypes = [
    { value: 2, label: 'MASCULINO' },
    { value: 1, label: 'FEMENINO' },
  ];

  flightTypes = [
    { value: '1', label: 'Nacional' },
    // { value: '2', label: 'Internacional' },
  ];

  loaders = {
    user: false,
    department: false,
    province: false,
    district: false,
  };

  legalUser = false;
  contractInsurance = false;
  placeholder = 'Nombre';
  siteKey = AppConfig.CAPTCHA_KEY;

  parameters$: ParametersResponse;
  listStatusCivil: any[] = [];
  departments: any[] = [];
  provinces: any[];
  districts: any[];
  countries: any[] = [];

  docTypes: Array<{ idDoc: number; sDoc }> = [];
  limitDocumentNumberLegalRepresentative: { min: number; max: number } = {
    min: 8,
    max: 8,
  };
  limitMaxLengthName: number = 50;
  form!: FormGroup;  
 

  saveClientResponse: any;
  showDerivation = false;

  messageDerivation = null;
  isDocumentMasked = false;
  isLastnameMasked = false;
  isSurnameMasked = false;
  isPhoneMasked = false;
  isAddressMasked = false;
  isDocumentRLMasked = false;
  isLastnameRLMasked = false;
  isSurnameRLMasked = false;
  documentMasked = '';
  lastnameMasked = '';
  surnameMasked = '';
  phoneMasked = '';
  addressMasked = '';
  documentRLMasked = '';
  lastnameRLMasked = '';
  surnameRLMasked = '';

  private readonly categoryGoogleAnalytics: string =
    'Ecommerce AP - Cliente - Paso 2';

  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  @ViewChild('modalDocumentInvalid', { static: true, read: TemplateRef })
  modalDocumentInvalid: TemplateRef<ElementRef>;

  constructor(
    private readonly router: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly route: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly cd: ChangeDetectorRef,
    private readonly ga: GoogleAnalyticsService,
    private readonly locationService: UbigeoService,
    private readonly clientInfoService: ClientInfoService,
    private readonly mainService: MainService,
    private readonly utilsService: UtilsService,
    private readonly gts: GoogleTagService,
    private readonly vc: ViewContainerRef,
  ) {
     this.form = this.builder.group({
      documentType: [
        {
          value: this.session.documentType,
          disabled: false,
        },
        [Validators.required],
      ],
      documentNumber: [
        null,
        [Validators.required],
      ],
      lastname: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          Validators.required,
        ]),
      ],
      surname: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          +this.session?.documentType == 4 ? null : Validators.required,
        ]),
      ],
      name: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.text),
          Validators.required,
        ]),
      ],
      address: [null, [Validators.required, this.spaceValidator]],
      department: [this.session.department, [Validators.required]],
      province: [this.session.provincia, [Validators.required]],
      district: [this.session.district, [Validators.required]],
      phoneNumber: [
        null,
        [Validators.required, Validators.pattern(/^[0-9]*$/)],
      ],
      contractInsurance: [this.session.contractInsurance || false],
      sex: [
        this.session.sex,
        this.session.documentType == 1 ? null : Validators.required,
      ],
      civilStatus: [
        this.session.civilStatus,
        this.session.documentType == 1 ? null : Validators.required,
      ],
      country: [this.session.country || 1, []],
      legalRepresentative: this.builder.group({
        documentType: [this.session.legalRepresentative?.documentType || 2],
        documentNumber: [this.session.legalRepresentative?.documentNumber],
        names: [this.session.legalRepresentative?.names],
        lastName: [this.session.legalRepresentative?.lastName],
        lastName2: [this.session.legalRepresentative?.lastName2],
        approvedClient: [this.session.legalRepresentative?.approvedClient || false],
      }),
    });
    this.hasErrorSubmit = null;

    if (this.productSelected?.idTipoPoliza == 2) {
      this.formLegalRepresentativeControl['documentType'].setValidators(
        Validators.required
      );
      this.formLegalRepresentativeControl['names'].setValidators(
        Validators.required
      );
      this.formLegalRepresentativeControl['lastName'].setValidators(
        Validators.required
      );
      this.formLegalRepresentativeControl['lastName2'].setValidators(
        Validators.required
      );
      this.formLegalRepresentativeControl['documentNumber'].setValidators(
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(this.limitDocumentNumberLegalRepresentative.min),
          Validators.maxLength(this.limitDocumentNumberLegalRepresentative.max),
        ])
      );
    }
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('dataAsegurados');
    sessionStorage.removeItem('contractInsurance');
    this.mainService.nstep = 2;
    window.scrollTo(0, 0);
    this.datePickerConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        maxDate: new Date(),
      }
    );

    this.paramSubject = this.router.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;
    });

    this.validateIfChecked();
    this.getParameters();

    if (this.isRuc) {
      this.docTypes = [
        {
          idDoc: 1,
          sDoc: 'RUC',
        },
      ];
      this.limitMaxLengthName = 150;
    } else {
      this.docTypes = [
        {
          idDoc: 2,
          sDoc: 'DNI',
        },
        {
          idDoc: 4,
          sDoc: 'CE',
        },
      ];
      this.limitMaxLengthName = 50;
    }
    
    this.validarInputEmpty('documentType');
    this.validarInputEmpty('documentNumber');
    this.valueChangesForm();

    setTimeout(() => {
      this.ga.emitGenericEventAP('Visualiza paso 2');
    }, 100);
  }

  getParameters(): void {
    this.spinner.show();
    this.locationService.getParameters().subscribe(
      (res: ParametersResponse) => {
        this.spinner.hide();
        this.parameters$ = res;
        this.listStatusCivil = this.parameters$.estadoCivil
          ?.filter((val) => val.id != 8 && val.id != 7 && val.id != 5)
          ?.map((value: any) => ({
            ...value,
            descripcion: value.descripcion.toLocaleUpperCase(),
          }));
        this.departments = this.parameters$.ubigeos;
        this.countries = this.parameters$.nacionalidades;
        this.changeUbigeo();
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.hasErrorSubmit = 'Ocurrió un error al obtener el ubigeo';
        this.ga.emitGenericEventAP(
          `Obtener ubigeo`,
          0,
          'Error al obtener el ubigeo',
          2
        );
        this.getUserInfo();
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get formLegalRepresentativeControl(): { [key: string]: AbstractControl } {
    return (this.f['legalRepresentative'] as FormGroup).controls;
  }

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }

  get productSelected(): any {
    return JSON.parse(sessionStorage.getItem('_producto_selecionado'));
  }

  valueChangesForm(): void {

    if (this.f['documentType'].value == 1) {
      this.f['name'].setValidators(Validators.required);
      this.f['name'].updateValueAndValidity();
    }

    this.f['phoneNumber'].valueChanges.subscribe((val) => {
      if (!val) {
        return;
      }

      if (this.isPhoneMasked) {
          this.isPhoneMasked = false;
          this.f['phoneNumber'].setValue('', {emitEvent: false})
        } else {
          if (
          this.f['phoneNumber'].hasError('pattern') ||
          val?.toString()?.slice(0, 1) != '9'
          ) {
            this.f['phoneNumber'].setValue(val.substring(0, val.length - 1));
          }
        }
    });
    this.f['address'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.isAddressMasked) {
        this.isAddressMasked = false;
        this.f['address'].setValue('', {emitEvent: false})
      }
    });
    this.f['name'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (this.f['name'].hasError('pattern')) {
          this.f['name'].setValue(value.slice(0, value.length - 1));
        }
      }
    });
    this.f['lastname'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.isLastnameMasked) {
        this.isLastnameMasked = false;
        this.f['lastname'].setValue('', {emitEvent: false})
      } else {
        if (this.f['lastname'].hasError('pattern')) {
          this.f['lastname'].setValue(value.slice(0, value.length - 1));
        }
      }
    });
    this.f['surname'].valueChanges.subscribe((value: string) => {
      if (value) {
        return;
      }

      if (this.isSurnameMasked) {
        this.isSurnameMasked = false;
        this.f['surname'].setValue('', {emitEvent: false})
      } else {
        if (this.f['surname'].hasError('pattern')) {
          this.f['surname'].setValue(value.slice(0, value.length - 1));
        }
      }
    });

    if (this.session?.categoryId == 1) {
      return;
    }

    this.formLegalRepresentativeControl['documentType'].valueChanges.subscribe(
      (value: string) => {
        this.formLegalRepresentativeControl['documentNumber'].setValue(null);
        this.formLegalRepresentativeControl['names'].setValue(null);
        this.formLegalRepresentativeControl['lastName'].setValue(null);
        this.formLegalRepresentativeControl['lastName2'].setValue(null);
        this.formLegalRepresentativeControl['names'].enable();
        this.formLegalRepresentativeControl['lastName'].enable();
        this.formLegalRepresentativeControl['lastName2'].enable();

        switch (+value) {
          case 2:
            this.limitDocumentNumberLegalRepresentative = {
              min: 8,
              max: 8,
            };
            break;
          case 4:
            this.limitDocumentNumberLegalRepresentative = {
              min: 9,
              max: 12,
            };
            break;
          default:
            this.limitDocumentNumberLegalRepresentative = {
              min: 8,
              max: 12,
            };
            break;
        }
        this.formLegalRepresentativeControl['documentNumber'].setValidators(
          Validators.compose([
            Validators.pattern(RegularExpressions.numbers),
            Validators.required,
            Validators.minLength(
              this.limitDocumentNumberLegalRepresentative.min
            ),
            Validators.maxLength(
              this.limitDocumentNumberLegalRepresentative.max
            ),
          ])
        );
        this.formLegalRepresentativeControl[
          'documentNumber'
        ].updateValueAndValidity();
      }
    );

    this.formLegalRepresentativeControl[
      'documentNumber'
    ].valueChanges.subscribe((value: string) => {
      if (
        this.formLegalRepresentativeControl['documentNumber'].hasError(
          'pattern'
        )
      ) {
        this.formLegalRepresentativeControl['documentNumber'].setValue(
          value.slice(0, value.length - 1)
        );
        return;
      }
    });
  }

  validationsForm(): void {}

  changeUbigeo(): void {
    this.f['department'].valueChanges.subscribe((val) => {
      if (val) {
        this.districts = [];
        this.f['province'].setValue(null);
        this.f['district'].setValue(null);
        this.provinces = this.departments?.find(
          (x) => Number(x.id) === Number(val)
        )?.provincias;
      }
    });

    this.f['province'].valueChanges.subscribe((val) => {
      if (val) {
        this.f['district'].setValue(null);
        this.districts = this.provinces?.find(
          (x) => Number(x.idProvincia) === Number(val)
        )?.distritos;
      }
    });

    this.f.documentType.valueChanges.subscribe((val) => {
      if (Number(val) === 2) {
        this.f.country.setValue('1');
        this.f.country.disable();
        this.f.department.setValue(null);
        this.f.province.setValue(null);
        this.f.district.setValue(null);
        this.f.department.enable();
        this.f.province.enable();
        this.f.district.enable();
      }
      if (Number(val) === 4) {
        this.f.country.setValue(null);
        this.f.country.enable();
        this.f.department.setValue('14');
        this.f.province.setValue(1401);
        this.f.district.setValue(140101);
        this.f.department.disable();
        this.f.province.disable();
        this.f.district.disable();
      }
      
      if (this.session.documentType != 1 && this.session.approvedClient) {
        if (this.session.name) {
          this.f['name'].disable({
            emitEvent: false,
          });
        }
        if (this.session.lastname) {
          this.f['lastname'].disable({
            emitEvent: false,
          });
        }
        if (this.session.surname) {
          this.f['surname'].disable({
            emitEvent: false,
          });
        }
        if (this.session.sex) {
          this.f['sex'].disable({
            emitEvent: false,
          });
        }
      }
    });
    this.form.patchValue(this.session);
    this.getUserInfo();

    if (this.session.documentType == 1 && this.session.approvedClient) {
      if (this.session.name) {
        this.f['name'].disable({
          emitEvent: false,
        });
    }
      if (this.session.address) {
      this.f['address'].disable({
        emitEvent: false,
      });
    }
      if (this.session.department) {
      this.f['department'].disable({
        emitEvent: false,
      });
    }
      if (this.session.province) {
      this.f['province'].disable({
        emitEvent: false,
      });
    }
      if (this.session.district) {
      this.f['district'].disable({
        emitEvent: false,
      });
    }
    }

    if (!this.departments?.find((x) => +x.id == +this.f['department'].value)) {
      this.f['department'].setValue(null);
    }

    if (
      !this.provinces?.find((x) => +x.idProvincia == +this.f['province'].value)
    ) {
      this.f['province'].setValue(null);
    }

    if (
      !this.districts?.find((x) => +x.idDistrito == +this.f['district'].value)
    ) {
      this.f['district'].setValue(null);
    }

    if (this.formLegalRepresentativeControl['approvedClient'].value) {
      this.formLegalRepresentativeControl['names'].disable();
      this.formLegalRepresentativeControl['lastName'].disable();
      this.formLegalRepresentativeControl['lastName2'].disable();
    }
  }

  get productIdSelected(): number {
    return Number(sessionStorage.getItem('productIdPolicy'));
  }

  get isTypeProductViajes(): boolean {
    return this.productIdSelected === 4 || this.productIdSelected === 8;
  }

  get namesOrRazonSocial() {
    if (Number(this.f['documentType'].value) === 1) {
      return 'Razón Social';
    }
    return 'Nombres';
  }

  get isRuc(): boolean {
    return Number(this.session.documentType) === 1;
  }

  getDocumentInformation(data: string): void {
    if (this.formLegalRepresentativeControl['documentNumber'].invalid) {
      return;
    }

    this.isDocumentRLMasked = false;
    this.isLastnameRLMasked = false;
    this.isSurnameRLMasked = false;

    const payload: IDocumentInfoGestionRequest = {
      idRamo: 61,
      idTipoDocumento:
        this.formLegalRepresentativeControl['documentType'].value,
      numeroDocumento:
        this.formLegalRepresentativeControl['documentNumber'].value,
      idUsuario: 3822,
      token: data,
    };

    this.spinner.show();
    this.utilsService.documentInfoGestion(payload).subscribe({
      next: (response: DocumentInfoResponseModel) => {
        console.dir(response);

        const documentType = this.formLegalRepresentativeControl['documentType'].value;

        if (!response.success && documentType == 2) {
          this.vc.createEmbeddedView(this.modalDocumentInvalid);
          return;
        }

        if (response.approvedClient) {
          this.formLegalRepresentativeControl['names'].disable();
          this.formLegalRepresentativeControl['lastName'].disable();
          this.formLegalRepresentativeControl['lastName2'].disable();
        } else {
          this.formLegalRepresentativeControl['names'].enable();
          this.formLegalRepresentativeControl['lastName'].enable();
          this.formLegalRepresentativeControl['lastName2'].enable();
        }

        this.formLegalRepresentativeControl['names'].setValue(response.names);
        this.formLegalRepresentativeControl['lastName'].setValue(
          response.apePat
        );
        this.formLegalRepresentativeControl['lastName2'].setValue(
          response.apeMat
        );
        this.formLegalRepresentativeControl['approvedClient'].setValue(
          response.approvedClient
        );

        if (response.apePat) {
          this.isLastnameRLMasked = true;
          this.lastnameRLMasked = maskName(response.apePat);
        }

        if (response.apeMat) {
          this.isSurnameRLMasked = true;
          this.surnameRLMasked = maskName(response.apeMat)
        }
        
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this.spinner.hide();
        this.recaptcha.reset();
      },
    });
  }

  getDocumentType(val: string) {
    const documentType = this.documentTypes.find(
      (item) => item.value === `${val}`
    );
    return documentType ? documentType.label : null;
  }

  showError(controlName: string): boolean {
    return (
      this.f[controlName].invalid &&
      (this.f[controlName].dirty || this.f[controlName].touched)
    );
  }

  getUserInfo() {
    this.loaders.user = true;
    const documentType = this.documentTypes.find(
      (item) => item.value === `${this.session.documentType}`
    );

    if (!documentType) {
      return;
    }

    if (documentType.value === '1') {
      this.showRuc();
    }
    this.setUserForm();
  }

  setUserForm() {
    this.f.name.setValue(this.session.name);
    this.f.lastname.setValue(this.session.lastname);
    this.f.surname.setValue(this.session.surname);
    this.f.address.setValue(this.session.address);
    this.f.phoneNumber.setValue(this.session.phoneNumber);

    if (this.session.documentNumber) {
      this.isDocumentMasked = true;
      this.documentMasked = maskDocument(this.session.documentNumber);
      this.f['documentNumber'].disable({emitEvent: false});
    }

    if (this.session.lastname) {
      this.isLastnameMasked = true;
      this.lastnameMasked = maskName(this.session.lastname);
    }

    if (this.session.surname) {
      this.isSurnameMasked = true;
      this.surnameMasked = maskName(this.session.surname);
    }

    if (this.session.address) {
      this.isAddressMasked = true;
      this.addressMasked = maskAddress(this.session.address);
    }

    if (this.session.phoneNumber) {
      this.isPhoneMasked = true;
      this.phoneMasked = maskPhone(this.session.phoneNumber.toString());
    }

    if (this.session.legalRepresentative?.documentNumber) {
      this.isDocumentRLMasked = true;
      this.documentRLMasked = maskDocument(this.session.legalRepresentative?.documentNumber);
    }

    if (this.session.legalRepresentative?.lastName) {
      this.isLastnameRLMasked = true;
      this.lastnameRLMasked = maskName(this.session.legalRepresentative?.lastName);
    }

    if (this.session.legalRepresentative?.lastName2) {
      this.isSurnameRLMasked = true;
      this.surnameRLMasked = maskName(this.session.legalRepresentative?.lastName2);
    }

    this.f.country.setValue(this.session.country || '1');
    if (Number(this.f['documentType'].value) !== 4) {
      this.f.department.setValue(this.session?.department?.toString());
      this.f.province.setValue(
        this.session?.province ? Number(this.session.province) : null
      );
      this.f.district.setValue(
        this.session?.district ? Number(this.session.district) : null
      );
      if (this.session?.department?.toString() === '0') {
        this.f.province.setValue(null);
      }
      if (this.session?.province?.toString() === '0') {
        this.f.department.setValue(null);
      }
      if (this.session?.district?.toString() === '0') {
        this.f.district.setValue(null);
      }
    } else {
      this.f.department.setValue('14');
      this.f.province.setValue(1401);
      this.f.district.setValue(140101);
      this.f.country.setValue(this.session.country || null);
    }
  }

  showRuc() {
    this.legalUser = true;
    const validationRules = this.legalUser ? null : [Validators.required];

    this.f['lastname'].setValue('');
    this.f['surname'].setValue('');
    this.f['lastname'].setValidators(validationRules);
    this.f['surname'].setValidators(validationRules);
    this.f['lastname'].updateValueAndValidity();
    this.f['surname'].updateValueAndValidity();

    this.placeholder = 'Razón Social';
  }

  resetForm() {
    this.f['province'].setValue(null);
    this.f['district'].setValue(null);
  }

  spaceValidator(control: FormControl) {
    const space = (control.value || '').trim().length === 0;
    return !space ? null : { space: true };
  }

  validateIfChecked() {
    this.f['contractInsurance'].valueChanges.subscribe((val) => {
      if (val) {
        this.f['sex'].setValidators(Validators.required);
        this.f['country'].setValidators(Validators.required);
      } else {
        this.f['sex'].clearValidators();
        this.f['country'].clearValidators();

        this.f['sex'].markAsPristine();
        this.f['country'].markAsPristine();
      }

      this.f['sex'].updateValueAndValidity();
      this.f['country'].updateValueAndValidity();
    });
  }

  getCountries() {
    this.clientInfoService.getCountries().subscribe((response) => {
      this.countries = response;
    });
  }

  get isValidRuc(): boolean {
    if (this.session.categoryId == 2) {
      return (
        this.session.contractorStatus == 'ACTIVO' &&
        this.session.domicileCondition == 'HABIDO'
      );
    }
    return true;
  }

  onSubmit() {
    this.ga.emitGenericEventAP(`Clic en 'Siguiente'`);

    const tagDataUno = {
      event: 'virtualEventGA4_A3',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 2',
      Sección: 'Datos del contratante',
      TipoAcción: 'Intento de avance',
      CTA: 'Siguiente',
      NombreSeguro: this.session.namePlan,
    };

    const tagDataDos = {
      TipoDocumento:
        this.session.documentType == 1
          ? 'RUC'
          : this.session.documentType == 2
          ? 'DNI'
          : 'CE',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.session.id,
      TipoCliente: this.session.tipoCliente,
      ID_Proceso: this.session.processId,
      Canal: 'Venta Directa',
    };

    if (this.session.categoryId == 1) {
      const tagManagerPayload = {
        ...tagDataUno,
        ...tagDataDos,
      };
      this.gts.virtualEvent(tagManagerPayload);
    }

    if (this.session.categoryId == 2) {
      const tagManagerPayloadRuc = {
        ...tagDataUno,
        event: 'virtualEventGA4_A4',
        TipoRegistro: 'RUC',
        ...tagDataDos,
      };
      this.gts.virtualEvent(tagManagerPayloadRuc);
    }

    this.form.markAllAsTouched();
    if (this.form.valid) {
      const formValues = this.form.getRawValue();
      const request = new UserInfoRequest({
        ...this.session,
        ...formValues,
        civilStatus: this.f['civilStatus'].value
          ? this.f['civilStatus'].value
          : 5,
        tipoPoliza: this.productSelected?.idTipoPoliza,
        condicionDomicilio: this.session.domicileCondition,
        estadoContratante: this.session.contractorStatus,
      });

      this.spinner.show();
      this.clientInfoService.saveClient(request).subscribe(
        (res: any) => {
          this.spinner.hide();

          if (!res.success) {
            this.messageDerivation = 'Hola. Tu solicitud ha sido recepcionada por un asesor de Protecta Security, nos estaremos comunicando contigo en un máximo de 2 días laborables.';
            this.showDerivation = true;

            this.ga.emitGenericEventAP(
                `Clic en 'Siguiente'`,
                0,
                'Error al grabar el contratante',
                2
              );
            return;
          }
          
          this.saveClientResponse = res;
            sessionStorage.setItem(
              'insurance',
              JSON.stringify({
                ...this.session,
                ...formValues,
                processId: res.idProceso,
              })
            );

            this.messageDerivation = null;
            if (this.session.categoryId == 2) {
              if (!this.isValidRuc) {
                // tslint:disable-next-line:max-line-length
                this.messageDerivation = `Hola, el RUC ${this.session.documentNumber} no está activo o habilitado en la SUNAT. Por favor, verifica que la información sea correcta.`;
                this.showDerivation = true;
                return;
              }
            }

            if (this.session.categoryId == 1) {
              const tagManagerPayloadResponse = {
                ...tagDataUno,
                TipoAcción: 'Avance exitoso',
                ...tagDataDos,
              };
              this.gts.virtualEvent(tagManagerPayloadResponse);
            }

            if (this.session.categoryId == 2) {
              const tagManagerPayloadResponseRuc = {
                ...tagDataUno,
                event: 'virtualEventGA4_A4',
                TipoAcción: 'Avance exitoso',
                TipoRegistro: 'RUC',
                ...tagDataDos,
              };
              this.gts.virtualEvent(tagManagerPayloadResponseRuc);
            }

            this.mainService.nstep = 3;
            this.route.navigate([
              `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3`,
            ]);
        },
        (err: any) => {
          this.spinner.hide();
          console.error(err);
        }
      );
    }
  }

  backStep(): void {
    this.ga.emitGenericEventAP(`Clic en 'Anterior'`);
    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-1`,
    ]);
  }

  validarInputEmpty(control): boolean {
    const isEmpty: boolean = !(this.f[control]?.value?.toString().length > 0);
    if (!isEmpty) {
      this.form.get(control).disable();
    } else {
      this.form.get(control).enable();
    }
    return isEmpty;
  }

  ngOnDestroy(): void {
    this.paramSubject.unsubscribe();
  }

  get phoneNumberValid(): boolean {
    if (
      this.f['phoneNumber'].value?.toString() !== '987654321' &&
      this.f['phoneNumber'].value?.toString() !== '999999999'
    ) {
      return true;
    }
    return false;
  }

  requestClientInfo() {
    if (this.formLegalRepresentativeControl['documentNumber'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.getDocumentInformation(token);
      return;
    }
  }

  refreshPage() {
    this.closeModal();
    this.formLegalRepresentativeControl['documentNumber'].setValue('');
    this.formLegalRepresentativeControl['names'].setValue('');
    this.formLegalRepresentativeControl['lastName'].setValue('');
    this.formLegalRepresentativeControl['lastName2'].setValue('');
  }

  closeModal(): void {
    this.vc.clear();
  }
}
