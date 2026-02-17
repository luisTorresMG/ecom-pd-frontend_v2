// tslint:disable-next-line:max-line-length
import { Component, TemplateRef, ViewChild, OnInit, ViewContainerRef, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '@root/app.config';
import { fadeAnimation } from '@root/shared/animations/animations';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import moment from 'moment';

// *SERVICES
import { DesgravamenService } from '../../../shared/services/desgravamen.service';
import { DocumentFormatResponse } from '../../../../../shared/models/document/document.models';
import { Subscription } from 'rxjs/Subscription';
import { RecaptchaComponent } from 'ng-recaptcha';
import { UtilsService } from '../../../../../shared/services/utils/utils.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
  animations: [fadeAnimation],
})
export class Step1Component implements OnInit, AfterViewInit, OnDestroy {

  subscription: Subscription;

  form: FormGroup;

  documentNumberLimit: { min: number, max: number };
  phoneNumberLimit: { min: number, max: number };

  dataOfDocument: DocumentFormatResponse;

  bsConfig: Partial<BsDatepickerConfig>;

  benefits: Array<{ img: string, desc: string, small: string }>;

  siteKey = AppConfig.CAPTCHA_KEY;

  @ViewChild('modalNeed', { read: TemplateRef }) _modalNeed: TemplateRef<any>;
  @ViewChild('modalBenefits', { read: TemplateRef }) _modalBenefits: TemplateRef<any>;
  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _desgravamenService: DesgravamenService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _router: Router,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _utilsService: UtilsService
  ) {
    this.benefits = [
      {
        img: `medico.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      },
      {
        img: `grua.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      },
      {
        img: `peru.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      },
      {
        img: `regalo.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      },
      {
        img: `celular.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      },
      {
        img: `tool.svg`,
        desc: 'Asistencia médica telefónica gratuita',
        small: null
      }
    ];
    this.subscription = new Subscription();
    this.documentNumberLimit = {
      min: 8,
      max: 8
    };
    this.phoneNumberLimit = {
      min: 9,
      max: 9
    };
    this.bsConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        maxDate: this.birthDateAdult
      }
    );
    this.form = this._builder.group({
      documentType: [2, Validators.required],
      documentNumber: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.required,
        Validators.minLength(this.documentNumberLimit.min),
        Validators.maxLength(this.documentNumberLimit.max)
      ])],
      email: [null, Validators.compose([
        Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        Validators.required
      ])],
      phone: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.required,
        Validators.minLength(this.phoneNumberLimit.min),
        Validators.maxLength(this.phoneNumberLimit.max)
      ])],
      birthDate: [null, Validators.required],
      terms: [true, Validators.required],
      privacy: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    if (this._desgravamenService.storage) {
      this.dataOfDocument = this._desgravamenService.storage;
      this.form.patchValue(this._desgravamenService.storage);
    } else {
      this.dataOfDocument = new DocumentFormatResponse();
    }
    this.f['documentNumber'].valueChanges.subscribe((val) => {
      this.dataOfDocument = new DocumentFormatResponse();

      this.f['email'].setValue(null);
      this.f['email'].markAsUntouched();

      this.f['birthDate'].setValue(null);
      this.f['birthDate'].markAsUntouched();

      this.f['phone'].setValue(null);
      this.f['phone'].markAsUntouched();

      if (this.f['documentNumber'].hasError('pattern')) {
        this.f['documentNumber'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.f['phone'].valueChanges.subscribe((val) => {
      if (this.f['phone'].hasError('pattern')) {
        this.f['phone'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.form.valueChanges.subscribe(() => {
      const data = {
        ...this.dataOfDocument,
        ...this.form.getRawValue(),
        birthDate: this.formatDate
      };
      this._desgravamenService.storage = data;
    });
  }
  ngAfterViewInit(): void {
    this.showModalNeed();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  get formatDate(): string {
    return this.f['birthDate'].value ? moment(this.f['birthDate'].value, 'DD/MM/YYYY')?.format('DD/MM/YYYY') : null;
  }
  get birthDateAdult(): Date {
    return new Date(new Date().setFullYear(Number(new Date().getFullYear()) - 18));
  }
  get f(): any {
    return this.form.controls;
  }
  get validateForm(): boolean {
    return this.form.valid && this.f['terms'].value;
  }
  submit(): void {
    if (this.validateForm) {
      // this._desgravamenService.storage = this.form.getRawValue();
      // this.form.disable();
      this._spinner.show();
      setTimeout(() => {
        // this.form.enable();
        this._spinner.hide();
        this.showModalBenefits();
      }, 1500);
    }
  }
  nextStep(): void {
    this.hideModal();
    this._desgravamenService.step = 2;
    this._router.navigate(['/desgravamen/step2']);
  }
  get hasErrorDocumentNumber(): string {
    const control = this.f['documentNumber'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'El número de documento es obligatorio';
      }
    }
    return null;
  }
  get hasErrorEmail(): string {
    const control = this.f['email'];
    if (control.touched) {
      if (control.hasError('pattern')) {
        return 'El correo electrónico no es válido';
      }
      if (control.hasError('required')) {
        return 'El correo electrónico es obligatorio';
      }
    }
    return null;
  }
  get hasErrorPhone(): string {
    const control = this.f['phone'];
    if (control.touched) {
      if (control.hasError('required')) {
        return 'El número de celular es obligatorio';
      }
    }
    return null;
  }
  get hasErrorBirthDate(): string {
    if (this.f.birthDate.touched) {
      if (this.f.birthDate.hasError('required')) {
        return 'Este campo es obligatorio';
      }
    }
    return null;
  }
  getDataOfDocument(token: string): void {
    if (this.f['documentNumber'].valid) {
      const data: any = {
        idRamo: 100,
        idProducto: 1,
        idTipoDocumento: this.f['documentType'].value,
        numeroDocumento: this.f['documentNumber'].value,
        idUsuario: 3822,
        token: token,
        noBase64: true,
      };
      this._spinner.show();
      this.subscription = this._utilsService.documentInfoClientResponse(data).subscribe(
        (res: any) => {
          this.dataOfDocument = {
            success: true,
            returnBirthDate: res.returnBirthdate,
            documentType: res.documentType,
            documentNumber: res.documentNumber,
            completeNames: res.names,
            names: res.names,
            apellidoPaterno: res.apePat,
            apellidoMaterno: res.apeMat,
            nationality: res.nationality,
            department: res.department,
            province: res.province,
            district: res.district,
            address: res.address,
            email: res.email,
            phone: res.phoneNumber,
            birthDate: res.birthdate,
            sex: res.sex,
            avatar: res.image,
            civilStatus: res.civilStatus,
          }
          this.f['email'].setValue(this.dataOfDocument.email);
          this.f['phone'].setValue(this.dataOfDocument.phone);
          this.f['birthDate'].setValue(this.dataOfDocument.birthDate);
          this._spinner.hide();
        },
        (err: any) => {
          this._spinner.hide();
          this.subscription.unsubscribe();
          console.error(err);
        }
      );
    }
  }

  // *UTILS
  toLowerCase(data: string): string {
    return data?.toLocaleLowerCase();
  }

  // *MODALS
  showModalBenefits(): void {
    this._viewContainerRef.createEmbeddedView(this._modalBenefits);
  }
  showModalNeed(): void {
    this._viewContainerRef.createEmbeddedView(this._modalNeed);
  }
  hideModal(): void {
    this._viewContainerRef.clear();
  }

  requestClientInfo() {
    if (this.f['documentNumber'].valid) {
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
