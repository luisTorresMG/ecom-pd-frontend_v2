import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UtilsService } from '../../../../shared/services/utils/utils.service';
import { DocumentInfoResponseModel } from '../../../../shared/models/document-information/document-information.model';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { ClientInfoService } from '../../services/client-info.service';
import { AppConfig } from '../../../../app.config';
import { RecaptchaComponent } from 'ng-recaptcha';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegularExpressions } from '../../../../shared/regexp/regexp';
import { GoogleTagService } from '../../services/google-tag-service';
import { maskEmail, maskPhone, maskName } from '../../utils/maskDataClient';

@Component({
  standalone: false,
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent implements OnInit {
  form!: FormGroup;

  

  limitLengthDocumentNumber: { min: number; max: number } = {
    min: 8,
    max: 8,
  };

  documentInfoResponse: any;

  documentNumberHasError: boolean = false;
  isLastnameMasked: boolean = false;
  isPhoneMasked: boolean = false;
  isEmailMasked: boolean = false;
  lastnameMasked: string = '';
  phoneMasked: string = '';
  emailMasked: string = '';

  siteKey = AppConfig.CAPTCHA_KEY;

  @ViewChild('modalSuccessContactForm', { static: true, read: TemplateRef })
  modalContactForm!: TemplateRef<ElementRef>;

  @ViewChild('recaptchaRef', { static: true }) recaptcha!: RecaptchaComponent;

  constructor(
    private readonly builder: FormBuilder,
    private readonly utilsService: UtilsService,
    private readonly clienteInfoService: ClientInfoService,
    private readonly spinner: NgxSpinnerService,
    private readonly cd: ChangeDetectorRef,
    private readonly vc: ViewContainerRef,
    private readonly gts: GoogleTagService
  ) {
    this.form = this.builder.group({
    legalName: [null],
    names: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern(RegularExpressions.text),
        Validators.maxLength(30),
      ]),
    ],
    lastNames: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern(RegularExpressions.text),
        Validators.maxLength(50),
      ]),
    ],
    email: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern(RegularExpressions.email),
        Validators.maxLength(60),
      ]),
    ],
    phone: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
      ]),
    ],
    documentType: [2, Validators.required],
    documentNumber: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
      ]),
    ],
    privacy: [false, Validators.required],
  });

  }

  ngOnInit(): void {
    this.formValidations();
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get rucType(): number | null {
    if (this.formControl['documentType'].value == 1) {
      const type = +this.formControl['documentNumber'].value
        ?.toString()
        .slice(0, 2);
      return type;
    }
    return null;
  }

  rucValidations(): void {
    if (this.formControl['documentType'].value == 1) {
      this.documentNumberHasError = false;
      if (this.rucType == 10) {
        this.formControl['legalName'].clearValidators();
        this.formControl['names'].setValidators(
          Validators.compose([Validators.required, Validators.maxLength(30)])
        );
        this.formControl['lastNames'].setValidators(
          Validators.compose([Validators.required, Validators.maxLength(60)])
        );
      } else if (this.rucType == 20) {
        this.formControl['legalName'].setValidators(
          Validators.compose([Validators.required, Validators.maxLength(80)])
        );
        this.formControl['names'].clearValidators();
        this.formControl['lastNames'].clearValidators();
      } else {
        this.documentNumberHasError = true;
      }
      this.formControl['legalName'].updateValueAndValidity();
      this.formControl['names'].updateValueAndValidity();
      this.formControl['lastNames'].updateValueAndValidity();
      this.cd.detectChanges();
    }
  }

  private formValidations(): void {
    this.formControl['documentType'].valueChanges.subscribe((value: string) => {
      this.documentNumberHasError = false;
      switch (+value) {
        case 1: {
          this.limitLengthDocumentNumber = {
            min: 11,
            max: 11,
          };
          this.rucValidations();
          break;
        }
        case 2: {
          this.limitLengthDocumentNumber = {
            min: 8,
            max: 8,
          };
          this.formControl['legalName'].clearValidators();
          this.formControl['names'].setValidators(
            Validators.compose([Validators.required])
          );
          this.formControl['lastNames'].setValidators(
            Validators.compose([Validators.required])
          );
          break;
        }
        case 4: {
          this.limitLengthDocumentNumber = {
            min: 9,
            max: 12,
          };
          this.formControl['legalName'].clearValidators();
          this.formControl['names'].setValidators(
            Validators.compose([Validators.required])
          );
          this.formControl['lastNames'].setValidators(
            Validators.compose([Validators.required])
          );
          break;
        }
      }
      this.formControl['documentNumber'].setValue(null);
      this.formControl['legalName'].setValue(null);
      this.formControl['names'].setValue(null);
      this.formControl['email'].setValue(null);
      this.formControl['phone'].setValue(null);
      this.formControl['lastNames'].setValue(null);
      this.formControl['documentNumber'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(this.limitLengthDocumentNumber.min),
          Validators.maxLength(this.limitLengthDocumentNumber.max),
        ])
      );

      this.formControl['documentNumber'].updateValueAndValidity();
      this.formControl['legalName'].updateValueAndValidity();
      this.formControl['names'].updateValueAndValidity();
      this.formControl['lastNames'].updateValueAndValidity();
      this.cd.detectChanges();
    });

    this.formControl['documentNumber'].valueChanges.subscribe(
      (value: string) => {
        this.rucValidations();
        if (this.formControl['documentNumber'].hasError('pattern')) {
          this.formControl['documentNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formControl['names'].valueChanges.subscribe((value: string) => {
      if (this.formControl['names'].hasError('pattern')) {
        this.formControl['names'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.formControl['lastNames'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.isLastnameMasked) {
        this.isLastnameMasked = false;
        this.formControl['lastNames'].setValue('', {emitEvent: false})
      } else {
        if (this.formControl['lastNames'].hasError('pattern')) {
        this.formControl['lastNames'].setValue(
          value.slice(0, value.length - 1)
        );
      }
      }
    });
    this.formControl['phone'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.isPhoneMasked) {
        this.isPhoneMasked = false;
        this.formControl['phone'].setValue('', {emitEvent: false})
      } else {
        if (
          this.formControl['phone'].hasError('pattern') ||
          +value?.toString().slice(0, 1) != 9
        ) {
          this.formControl['phone'].setValue(value.slice(0, value.length - 1));
        }
      }
    });

    this.formControl['email'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.isEmailMasked) {
        this.isEmailMasked = false;
        this.formControl['email'].setValue('', {emitEvent: false})
      } 
    });
  }

  getDocumentInformation(data: string): void {
    if (
      this.formControl['documentType'].value == 1 &&
      this.documentNumberHasError
    ) {
      return;
    }
    if (
      this.formControl['documentType'].valid &&
      this.formControl['documentNumber'].valid
    ) {
      this.spinner.show();
      this.isEmailMasked = false;
      this.isPhoneMasked = false;

      const payload = {
        idRamo: 73,
        idTipoDocumento: this.formControl['documentType'].value,
        numeroDocumento: this.formControl['documentNumber'].value,
        token: data,
      };
      this.utilsService.documentInfoResponse(payload).subscribe({
        next: (response: DocumentInfoResponseModel) => {
          if (response.success) {
            this.documentInfoResponse = response;

            if (response.documentType == 1 && this.rucType == 20) {
              this.formControl['legalName'].setValue(response.legalName);
            } else {
              this.formControl['names'].setValue(response.names);
              this.formControl['lastNames'].setValue(
                `${response.apePat} ${response.apeMat}`
              );
            }

            this.formControl['email'].setValue(response.email);
            this.formControl['phone'].setValue(response.phoneNumber);

            if (response.apePat || response.apeMat) {
              this.isLastnameMasked = true;
              this.lastnameMasked = `${maskName(response.apePat)} ${maskName(response.apeMat)}`
            }

            if (response.email) {
              this.isEmailMasked = true;
              this.emailMasked = maskEmail(response.email);
            }

            if (response.phoneNumber) {
              this.isPhoneMasked = true;
              this.phoneMasked = maskPhone(response.phoneNumber.toString());
            }
          }
          this.form.markAllAsTouched();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.cd.detectChanges();
        },
        complete: () => {
          this.spinner.hide();
          this.recaptcha.reset();
          this.cd.detectChanges();
        },
      });
    }
  }

  requestClientInfo() {
    if (this.formControl['documentNumber'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.getDocumentInformation(token);
      return;
    }
  }

  onSubmit(): void {
    if (this.form.valid && !this.documentNumberHasError) {
      const control = this.form.controls;

      const tagManagerPayload = {
        event: 'virtualEventGA4_A2',
        Producto: 'Accidentes Personales',
        Paso: 'Paso 0',
        Sección: 'Formulario Contacto',
        TipoAcción: 'Intención de avance',
        CTA: 'Quiero que me contacten',
        TipoDocumento:
          control['documentType'].value == 1
            ? 'RUC'
            : control['documentType'].value == 2
            ? 'DNI'
            : 'CE',
        CheckComunicaciones: control['privacy'].value
          ? 'Activado'
          : 'Desactivado',
        pagePath: '/accidentespersonales',
        timeStamp: new Date().getTime(),
        user_id: this.documentInfoResponse.id || '',
      };
      this.gts.virtualEvent(tagManagerPayload);

      const payload = {
        idRamo: 61,
        idProducto: 1,
        idTipoDocumento: control['documentType'].value,
        numeroDocumento: control['documentNumber'].value,
        nombreCliente:
          this.rucType == 20
            ? control['legalName'].value?.toString().toUpperCase()
            : `${control['names'].value} ${control['lastNames'].value}`.toUpperCase(),
        correo: control['email'].value.toString().toLowerCase(),
        telefono: control['phone'].value,
        privacidad: control['privacy'].value ? 1 : 0,
        ecommerce: 'ACCIDENTES PERSONALES',
      };

      this.clienteInfoService.contactAdvisor(payload).subscribe({
        next: (response: any) => {
          if (response.success) {
            const tagManagerPayloadResponse = {
              ...tagManagerPayload,
              TipoAcción: 'Avance exitoso',
            };
            this.gts.virtualEvent(tagManagerPayloadResponse);

            this.form.reset();
            control['documentType'].setValue(2);
            control['privacy'].setValue(false);
            this.vc.createEmbeddedView(this.modalContactForm);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.cd.detectChanges();
        },
        complete: () => {
          this.cd.detectChanges();
        },
      });
    }
  }

  closeModals(): void {
    this.vc.clear();
  }
}