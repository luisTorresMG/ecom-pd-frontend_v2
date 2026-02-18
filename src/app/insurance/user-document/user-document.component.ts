import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { RecaptchaComponent } from 'ng-recaptcha';
import { AppConfig } from '../../app.config';
import { environment } from '../../../environments/environment';
import { ProductResponse } from '../shared/models/product-response';
import { UserDocumentRequest } from '../shared/models/user-document-request';
import { StatusDocumentRequest } from '../shared/models/status-document-request';
import { ClientInfoService } from '../shared/services/client-info.service';
import { EmisionService } from '../../layout/client/shared/services/emision.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  MigrationRequest,
  MigrationResponse,
} from '../../layout/client/shared/models/migration.model';
import { fadeAnimation } from '@root/shared/animations/animations';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { MainService } from '../shared/services/main.service';
import { InsuranceTypesService } from '../shared/services/insurance-types.service';

import { HttpErrorResponse } from '@angular/common/http';
import { UserDocumentResponse } from '../shared/models/user-document-response';
import { base64ToArrayBuffer } from '../../shared/helpers/utils';
import { IDocumentInfoGestionRequest } from '../../shared/interfaces/document-information.interface';
import { DocumentInfoResponseModel } from '../../shared/models/document-information/document-information.model';
import { RegularExpressions } from '../../shared/regexp/regexp';
import { GoogleTagService } from '../shared/services/google-tag-service';
import { maskDocument, maskEmail } from '../shared/utils/maskDataClient'

@Component({
  selector: 'app-user-document',
  templateUrl: './user-document.component.html',
  styleUrls: ['./user-document.component.scss'],
  animations: [fadeAnimation],
})
export class UserDocumentComponent implements OnInit {
  paramSubject = new Subscription();
  insuranceType: string;
  insuranceCategory: string;
  datePickerConfig: Partial<BsDatepickerConfig>;

  documentTypes: Array<{ value: string; label: string }> = [];

  form = this.fb.group({
    documentType: [this.session.documentType, [Validators.required]],
    documentNumber: [this.session.documentNumber, [Validators.required]],
    email: [
      this.session.email,
      Validators.compose([
        Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        Validators.required,
      ]),
    ],
    fechaNac: [this.session.fechaNac, Validators.required],
    privacy: [this.session.privacy || false],
    terms: [1 || false],
  });

  documentNumberLimit = {
    min: 8,
    max: 8,
  };

  rucisvalid = false;

  productSelected: ProductResponse;
  planSelected: string = '';
  siteKey = AppConfig.CAPTCHA_KEY;

  modalRef: BsModalRef;
  docType: number;
  ACEPT_TERMS: boolean;
  maxLengthDocNumber: number;

  hasErrorSubmit: boolean;

  isClientState: boolean = false;

  documentInformationResponse = null;
  dataClienteId: string = '';

  isEmailMasked = false;
  isDocumentMasked = false;
  emailMasked = '';
  documentMasked = '';

  @ViewChild('modalTerms', { static: true, read: TemplateRef })
  _modalTerms: TemplateRef<any>;

  @ViewChild('termsModalPolicy') termsModalPolicy;

  @ViewChild('modalAdquirirSeguro', { static: true, read: ModalDirective })
  modalAdquirirSeguro: ModalDirective;

  @ViewChild('modalDocumentInvalid', { static: true, read: TemplateRef })
  modalDocumentInvalid: TemplateRef<ElementRef>;

  @ViewChild('modalDocumentCE', { static: true, read: TemplateRef })
  modalDocumentCE: TemplateRef<ElementRef>;

  @ViewChild('modalClienteEstado', { static: true, read: TemplateRef })
  modalClienteEstado: TemplateRef<ElementRef>;

  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  private readonly categoryGoogleAnalytics: string =
    'Ecommerce AP - Cliente - Paso 1';

  constructor(
    private readonly router: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly route: Router,
    private readonly clientInfoService: ClientInfoService,
    private readonly insuranceTypesService: InsuranceTypesService,
    private readonly modalService: BsModalService,
    private readonly spinner: NgxSpinnerService,
    private readonly _emisionService: EmisionService,
    private readonly _ga: GoogleAnalyticsService,
    private readonly utilsService: UtilsService,
    private readonly _mainService: MainService,
    private readonly _vc: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef,
    private readonly gts: GoogleTagService
  ) {
    this.hasErrorSubmit = false;
    this.ACEPT_TERMS = true;
    this.datePickerConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        maxDate: new Date(
          new Date().setFullYear(Number(new Date().getFullYear()) - 18)
        ),
      }
    );
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.documentInformationResponse = this.session || null;

    if (this.session?.fechaNac && this.session?.approvedClient) {
      this.f['fechaNac'].disable();
    }

    setTimeout(() => {
      this._ga.emitGenericEventAP(`Visualiza paso 1`);
    }, 100);

    this.initStep();
    this.dataClienteId = this.clientInfoService.getClientID();
    
    this._mainService.nstep = 1;
  }

  initStep(): void {
    this.paramSubject = this.router.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;

      switch (+this.productoSeleccionado.productId) {
        case 1:
          this.planSelected = 'Accidentes Individuales';
          break;
        case 2:
          this.planSelected = 'Accidentes Familiares';
          break;
        case 3:
          this.planSelected = 'Accidentes Estudiantiles';
          break;
        case 4:
          this.planSelected = 'Accidentes Viajes';
          break;
        case 5:
          this.planSelected = 'Accidentes Laborales';
          break;
        case 7:
          this.planSelected = 'Accidentes Estudiantiles';
          break;
        case 8:
          this.planSelected = 'Accidentes Viajes';
          break;
        default:
          this.planSelected = '';
          break;
      }
      const productSelected: ProductResponse[] = JSON.parse(
        sessionStorage.getItem('productSelected')
      );

      if (productSelected) {
        this.productSelected = productSelected.find(
          (item) => item.key === this.insuranceType
        );

        this.documentTypes = this.productSelected?.documentTypes;

        if (this.documentTypes?.length === 1) {
          this.form.get('documentType').setValue(this.documentTypes[0]?.value);
          this.documentNumberLimit = { min: 11, max: 11 };
        }
        if (
          this.documentTypes?.filter((x) => x.label === 'DNI')?.length === 1
        ) {
          this.form
            .get('documentType')
            .setValue(
              this.documentTypes?.filter((x) => x.label === 'DNI')[0]?.value
            );
          this.documentNumberLimit = { min: 8, max: 8 };
        }
        if (this.session.documentType) {
          this.f['documentType'].setValue(`${this.session.documentType}`);
        }
        this.setDocumentValidation();

        this.form.valueChanges.subscribe((val: any) => {
          sessionStorage.setItem(
            'insurance',
            JSON.stringify({
              ...this.session,
              ...this.form.getRawValue(),
              namePlan: this.planSelected,
            })
          );
        });
      }
    });

    if (this.session.email) {
      this.isEmailMasked = true;
      this.emailMasked = maskEmail(this.session.email);
    }

    if (this.session.documentNumber) {
      this.isDocumentMasked = true;
      this.documentMasked = maskDocument(this.session.documentNumber);
    }

    this.changeTypeDocument(this.f['documentType'].value);
    this.setDocumentNumberValidation(this.f['documentType'].value);

    this.f['documentNumber'].valueChanges.subscribe((val) => {

      const match = val?.match(/\d+/g);
      if (match) {
        if (match[0].length < val.length) {
          this.f['documentNumber'].setValue(val.replaceAll(val, match));
        }
      }
      const matchLetter = val?.match(/\D/g);
      if (matchLetter) {
        this.f['documentNumber'].setValue(val.substring(0, val.length - 1));
      }

      if (this.f['documentType'].value != 4) {
        this.documentInformationResponse = null;
      }
    });
    this.f['email'].valueChanges.subscribe((val) => {
      if (this.isEmailMasked) {
        this.isEmailMasked = false;
        this.f['email'].setValue('', { emitEvent: false });
      }
    });
  }

  getCategoriesAndProducts(): void {
    this.spinner.show();

    const params = this.router.snapshot.params;

    this.insuranceTypesService
      .getProducts(params['insuranceCategory'] == 'personales' ? '1' : '2')
      .subscribe(
        (res: ProductResponse[]) => {
          this.spinner.hide();

          const selectedProductInfo = res.find(
            (c) => c.key === params['insuranceType']
          );

          sessionStorage.setItem(
            'productIdPolicy',
            JSON.stringify(Number(selectedProductInfo.productId))
          );
          sessionStorage.setItem(
            '_producto_selecionado',
            JSON.stringify(selectedProductInfo)
          );
          if (Number(selectedProductInfo?.modeCode) === 2) {
            sessionStorage.setItem('modalidad', 'true');
          } else {
            sessionStorage.setItem('modalidad', 'false');
          }

          this.initStep();
        },
        (err: any) => {
          console.log(err);
          this.spinner.hide();
        }
      );
  }

  get showBirthDate(): boolean {
    if (Number(this.f['documentType'].value) !== 1) {
      this.f['fechaNac'].setValidators(Validators.required);
      return true;
    } else {
      this.f['fechaNac'].clearValidators();
    }
    this.f['fechaNac'].updateValueAndValidity();
    return false;
  }

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }

  get idProductSelected(): any {
    return sessionStorage.getItem('productIdPolicy');
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid && this.isDocumentInfoResponse) {
      if (this.f['documentType'].value == 4) {
        this.f['fechaNac'].setValue(
          moment(this.f['fechaNac'].value, 'DD/MM/YYYY').toDate()
        );
        this._vc.createEmbeddedView(this.modalDocumentCE);
        return;
      }
      this.validateform();
    }
  }

  validateform() {
    this._vc.clear();

    if (Number(this.f['documentType'].value) === 4) {
      this.spinner.show();
      const date = new Date(
        moment(this.f['fechaNac'].value, 'DD/MM/YYYY').format('YYYY/MM/DD')
      );
      const data = new MigrationRequest({
        ce: this.f['documentNumber'].value,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
      this._emisionService.dataMigration(data).subscribe(
        (res: MigrationResponse) => {
          
          if (res.success) {
            const dataMigration = {
                lastname: res.apellidoPaterno,
                surname: res.apellidoMaterno,
                name: res.nombre,
              };
              sessionStorage.setItem(
                'insurance',
                JSON.stringify({
                  ...this.session,
                  ...dataMigration,
                })
              );
          }
          
          this.nextStep();
        },
        (err: any) => {
          console.log(err);
          this.spinner.hide();
          this.nextStep();
        }
      );
    } else {
      this.nextStep();
    }
  }

  validarruc() {
    this.spinner.show();
    const req = {
      numerodocumento: this.f.documentNumber.value,
      branchId: 61,
    };
    this.utilsService.clienteInformation(req).subscribe((response) => {
      this.spinner.hide();
      this.rucisvalid = response.clienteDeuda || response.clienteEstado;
    });
  }

  get productoSeleccionado(): any {
    return JSON.parse(sessionStorage.getItem('_producto_selecionado'));
  }

  nextStep(): void {
    this._ga.emitGenericEventAP(`Clic en 'Cotiza aquí'`);

    const tagManagerPayload = {
      event: 'virtualEventGA4_A3',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 1',
      Sección: 'Cotiza tu seguro',
      TipoAcción: 'Intención de avance',
      CTA: 'Cotiza aquí',
      NombreSeguro: this.session.namePlan,
      TipoDocumento:
        this.f['documentType'].value == 1
          ? 'RUC'
          : this.f['documentType'].value == 2
          ? 'DNI'
          : 'CE',
      CheckBeneficios: this.f['privacy'].value ? 'Activado' : 'Desactivado',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.session.id,
      TipoCliente: this.session.tipoCliente,
      Canal: 'Venta Directa',
    };
    this.gts.virtualEvent(tagManagerPayload);

    if (this.f['documentType'].value == 4) {
      this.f['fechaNac'].setValue(
        moment(this.f['fechaNac'].value).format('DD/MM/YYYY')
      );
    }

    if (this.f['documentType'].value == 1 && this.isClientState) {
      this._vc.clear();
      this._vc.createEmbeddedView(this.modalClienteEstado);

      const dataClientState = {
        idRamo: 61,
        idProducto: +this.idProductSelected,
        ruc: this.f['documentNumber'].value,
        correo: this.f['email'].value,
      };
      this.clientInfoService.isClientState(dataClientState).subscribe();

      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      processId: this.session.processId,
      flowType: this.session.flowType,
      saleChannel: environment.canaldeventadefault,
      pointOfSale: environment.puntodeventadefault,
      modeCode: this.productSelected.modeCode,
      idTipoPoliza: this.productoSeleccionado?.idTipoPoliza,
      productId:
        +this.productSelected.productId > 0
          ? this.productSelected.productId
          : 0,
      categoryId: this.productSelected.categoryId,
      idSesion: sessionStorage.getItem('0FF2C61A'),
      terminos: 1,
    };
    const request = new UserDocumentRequest(payload);
    this.spinner.show();
    this.clientInfoService.saveClientDocument(request).subscribe(
      (response: UserDocumentResponse) => {
        this.documentInformationResponse = {
          ...this.documentInformationResponse,
          complete: true,
        };
        this.hasErrorSubmit = !(response.processId > 0);
        if (+response.processId > 0) {
          sessionStorage.setItem(
            'insurance',
            JSON.stringify({
              ...this.session,
              categoryId: this.productSelected.categoryId,
              ...payload,
              ...response,
              ...this.form.getRawValue(),
              clientTypeId: this.session.personType,
              documentType: this.session.documentType,
              documentNumber: this.session.documentNumber,
              name: this.session.names || this.session.legalName,
              lastname: this.session.apePat,
              surname: this.session.apeMat,
              department: this.session.department,
              province: this.session.province,
              district: this.session.district,
              address: this.session.address,
              email: this.session.email,
              phoneNumber: this.session.phoneNumber,
              clientId: this.session.clientCode,
              birthdate: this.session.birthdate,
              sex: (+this.session.sex === 1 || +this.session.sex === 2) ? +this.session.sex : null,
            })
          );

          if (+this.f.documentType.value != 1) {
            this._mainService.nstep = 2;
            this.emitEventSucces();

            this.route.navigate([
              `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-2`,
            ]);
            return;
          }

          const req = {
            numerodocumento: this.f.documentNumber.value,
            branchId: 61,
          };
          if (+this.f.documentType.value === 1) {
            this.utilsService.clienteInformation(req).subscribe((res) => {
              this.rucisvalid = res.clienteDeuda || res.clienteEstado;
              if (!this.rucisvalid) {
                this.spinner.hide();
                this._mainService.nstep = 2;
                this.emitEventSucces();

                this.route.navigate([
                  `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-2`,
                ]);
              } else {
                this.spinner.hide();
                this._ga.emitGenericEventAP('Derivación al Asesor');
              }
            });
          }
        } else {
          this.spinner.hide();
          this._ga.emitGenericEventAP(
            `Clic en 'Cotiza aquí'`,
            0,
            'Error al cotizar el producto',
            2
          );
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this._ga.emitGenericEventAP(
          `Clic en 'Cotiza aquí'`,
          0,
          'Error al cotizar el producto',
          2
        );
      }
    );
  }

  emitEventSucces() {
    const tagDataUno = {
      event: 'virtualEventGA4_A3',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 1',
      Sección: 'Cotiza tu seguro',
      TipoAcción: 'Avance exitoso',
      CTA: 'Cotiza aquí',
      NombreSeguro: this.session.namePlan,
    };

    const tagDataDos = {
      CheckBeneficios: this.f['privacy'].value ? 'Activado' : 'Desactivado',
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.session.id,
      TipoCliente: this.session.tipoCliente,
      ID_Proceso: this.session.processId,
      Canal: 'Venta Directa',
    };

    if (this.session.categoryId == 1) {
      const tagManagerPayloadResponse = {
        ...tagDataUno,
        TipoDocumento:
          this.f['documentType'].value == 1
            ? 'RUC'
            : this.f['documentType'].value == 2
            ? 'DNI'
            : 'CE',
        ...tagDataDos,
      };
      this.gts.virtualEvent(tagManagerPayloadResponse);
    }

    if (this.session.categoryId == 2) {
      const tagManagerPayloadRucResponse = {
        ...tagDataUno,
        event: 'virtualEventGA4_A4',
        TipoRegistro: 'RUC',
        ...tagDataDos,
      };
      this.gts.virtualEvent(tagManagerPayloadRucResponse);
    }
    window['dataLayer'].length = 0;
    window['dataLayer'].push({
      estado: 'Logueado',
      clientID: this.dataClienteId,
      user_id: this.session.id,
      TipoCliente: this.session.tipoCliente,
      Canal: 'Venta Directa',
    });
  }

  get f() {
    return this.form.controls;
  }

  showError(controlName: string): boolean {
    return (
      this.f[controlName].invalid &&
      (this.f[controlName].dirty || this.f[controlName].touched)
    );
  }

  setDocumentValidation() {
    this.f['documentType'].valueChanges.subscribe((documentType) => {
      this.f['documentNumber'].setValue(null);
      this.f['email'].setValue(null);
      this.f['fechaNac'].setValue(null);
      this.f['fechaNac'].enable();

      this.setDocumentNumberValidation(documentType);
      this.cdr.detectChanges();
    });
  }

  setDocumentNumberValidation(documentType): void {
    let pattern = /^\d{8}$/;

    if (documentType === '1') {
      pattern = /^(20)(\d{9})$/;
      this.documentNumberLimit = { min: 11, max: 11 };
    }

    if (documentType === '2') {
      pattern = /^\d{8}$/;
      this.documentNumberLimit = { min: 8, max: 8 };
    }

    if (documentType === '4') {
      pattern = /^[\w\d_.-]{9,12}$/;
      this.documentNumberLimit = { min: 9, max: 12 };
    }

    this.f['documentNumber'].setValidators([
      Validators.required,
      Validators.pattern(pattern),
      Validators.minLength(this.documentNumberLimit.min),
      Validators.maxLength(this.documentNumberLimit.max),
    ]);

    this.f['documentNumber'].updateValueAndValidity();
  }

  emitEventPolicy(): void {
    // tslint:disable-next-line:max-line-length
    this._ga.emitGenericEventAP(
      this.f['privacy'].value
        ? `Marca 'Políticas y envío de promociones'`
        : `Desmarca 'Políticas y envío de promociones'`
    );
  }

  emitEventTerms(): void {
    // tslint:disable-next-line:max-line-length
    this._ga.emitGenericEventAP(
      this.f['terms'].value
        ? `Marca 'Términos y condiciones'`
        : `Desmarca 'Términos y condiciones'`
    );
  }

  showTerms() {
    this._vc.createEmbeddedView(this._modalTerms);
    this._ga.emitGenericEventAP(`Clic en el link de 'Términos y condiciones'`);
  }

  closeModals(e = null): void {
    this._vc.clear();
  }

  clickPrivacyPolicy(): void {
    this._ga.emitGenericEventAP(
      `Clic en el link de 'Políticas y envío de promociones'`
    );
  }

  closePrivacyModal() {
    this.modalRef.hide();
  }

  showModalPolicy() {
    this.modalRef = this.modalService.show(this.termsModalPolicy);
  }

  closePrivacyModaPolicy() {
    this.modalRef.hide();
  }

  get IsValidForm(): boolean {
    return this.form.valid ? true : false;
  }

  get isDocumentInfoResponse(): boolean {
    return !!this.documentInformationResponse && Object.keys(this.documentInformationResponse).length > 0;
  }

  hideModalAdquirirSeguro() {
    this.modalAdquirirSeguro.hide();
  }

  validityDocumentNumber() {
    const docNumber = this.f['documentNumber'].value;
    if (docNumber?.toString().length > this.maxLengthDocNumber) {
      this.f['documentNumber'].setValue(
        docNumber?.toString().substring(0, this.maxLengthDocNumber)
      );
    }
  }

  changeTypeDocument(val) {
    this.cdr.detectChanges();

    switch (Number(val)) {
      case 1: {
        this.documentNumberLimit = {
          min: 11,
          max: 11,
        };
        break;
      }
      case 2: {
        this.documentNumberLimit = {
          min: 8,
          max: 8,
        };
        break;
      }
      case 4: {
        this.documentNumberLimit = {
          min: 9,
          max: 12,
        };
        break;
      }
    }
  }

  /* A function that returns a promise. */
  getDataOfDocument(data: string): void {
    // tslint:disable-next-line:max-line-length
    if (this.f['documentNumber'].valid) {
      this.spinner.show();
      this.f['email'].setValue(null);
      this.f['fechaNac'].setValue(null);
      this.isEmailMasked = false;

      const payload: IDocumentInfoGestionRequest = {
        idRamo: 61,
        idTipoDocumento: +this.f['documentType'].value,
        numeroDocumento: this.f['documentNumber'].value,
        idUsuario: 3822,
        token: data,
      };

      this.utilsService.documentInfoGestion(payload).subscribe({
        next: (response: DocumentInfoResponseModel) => {
          this.documentInformationResponse = response;
          this.isClientState = response.isState;

          if (
            (!response.success && payload.idTipoDocumento != 4) ||
            (payload.idTipoDocumento == 1 && !response.address)
          ) {
            this._vc.createEmbeddedView(this.modalDocumentInvalid);
            return;
          }

          response.civilStatus =
            response.civilStatus == 5 ||
            response.civilStatus == 7 ||
            response.civilStatus == 8
              ? null
              : response.civilStatus;

          if (response.birthdate) {
            this.f['fechaNac'].setValue(response.birthdate);

             if(response.approvedClient) {
                this.f['fechaNac'].disable();
             } else {
                this.f['fechaNac'].enable();
             }
          } else {
            this.f['fechaNac'].setValue(null);
          }

          this.f['email'].setValue(response.email);

          if (response.email) {
            this.isEmailMasked = true;
            this.emailMasked = maskEmail(response.email)
          }

          const valueSession = {
            ...this.session,
            ...response,
            lastname: response.apePat,
            surname: response.apeMat,
            country: `${response.nationality || ''}`,
            location: response.district,
            nacionalidad: `${response.nationality || ''}`,
            telefono: response.phoneNumber,
            fechaNac: response.birthdate,
            avatar: response.image,
            tipoCliente: response.clientType,
            successClientInformation: response.success,
            documentInformation: {
              ...response,
            },
          };
          this.documentInformationResponse = valueSession;

          sessionStorage.setItem('insurance', JSON.stringify(valueSession));

          let returnType = '';

          if (+this.session.documentType == 1) {
            returnType = response.returnBirthdate
              ? 'fecha de nacimiento autocompletado'
              : '';
          }

          returnType = response.email ? 'correo autocompletado' : returnType;

          if (response.birthdate && response.email) {
            returnType =
              +this.session.documentType == 1
                ? 'correo autocompletado'
                : 'fecha de nacimiento autocompletado y correo autocompletado';
          }

          if (!response.birthdate && !response.email) {
            returnType = 'ningún dato autocompletado';
          }

          if (+this.session.documentType == 1) {
            if (response.birthdate && !response.email) {
              returnType = 'ningún dato autocompletado';
            }
          }

          if (+this.productoSeleccionado.categoryId == 1 && response?.image) {
            sessionStorage.setItem('document-avatar', response?.image);
          }

          this._ga.emitGenericEventAP(
            `Ingresa nro de documento + ${returnType}`
          );

          this._ga.emitGenericEventAP(
            `Tipo de cliente`,
            0,
            response.clientType
          );
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
          const analyticsPayloadError = {
            action: 'Obtener información de documento',
            premium: 0,
            label: 'Error al obtener información del documento',
            type: 2,
          };
          this._ga.emitGenericEventAP(
            analyticsPayloadError.action,
            analyticsPayloadError.premium,
            analyticsPayloadError.label,
            analyticsPayloadError.type
          );
        },
        complete: () => {
          this.spinner.hide();
          this.recaptcha.reset();
        },
      });
    }
  }

  emailSuggestion(val: string): void {
    this.f['email'].setValue(val);
    this._ga.emitGenericEventAP(`Usa automcompletar de correo`);
  }

  refreshPage() {
    this.closeModals();
    this._ga.emitGenericEventAP(`Clic en 'Volver al Inicio'`);
    this.f['documentNumber'].setValue(null);
    this.f['email'].setValue(null);
    this.f['fechaNac'].setValue(null);
    this.f['fechaNac'].enable();
    this.rucisvalid = false;
    this.documentInformationResponse = null;
    setTimeout(() => {
      this._ga.emitGenericEventAP(`Visualiza paso 1`);
    }, 100);
  }

  downloadArchivo(response: { nombre: string; archivo: string }) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], { type: 'application/pdf' });
      FileSaver.saveAs(data, response.nombre);
    }
  }

  disableButtonCotizar(): boolean {
    return this.f['privacy'].value ? false : true;
  }

  requestClientInfo() {
    if (this.f['documentNumber'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.getDataOfDocument(token);
      return;
    }
  }
}
