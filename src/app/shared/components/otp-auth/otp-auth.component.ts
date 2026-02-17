import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  IRegisterOtp,
  IRegisterOtpResponse,
  IValidateOtp,
  IValidateOtpResponse,
} from '../../interfaces/otp-auth.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { OtpAuthService } from '@shared/services/otp-auth/otp-auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';
import { maskEmail } from '../../../insurance/shared/utils/maskDataClient';

@Component({
  selector: 'app-otp-auth',
  templateUrl: './otp-auth.component.html',
  styleUrls: ['./otp-auth.component.scss'],
})
export class OtpAuthComponent implements OnInit {
  form: FormGroup;

  onlyNumbers: RegExp;

  tokenExpirationTime: number;
  secondstokenExpirationTime: number;

  tryAgainTime: number;
  secondsTryAgainTime: number;

  private dataOtp: IRegisterOtp;

  responseOtp: IRegisterOtpResponse;

  intervals: Array<any>;

  @Input() set data(payload: IRegisterOtp) {
    console.log(payload);
    this.dataOtp = payload;
    this.registerOtp();
  }

  @Output() showOtpAuth: EventEmitter<boolean>;
  @Output() resultOtp: EventEmitter<IValidateOtpResponse>;

  @ViewChild('c1', { static: false, read: ElementRef }) _code1: ElementRef;
  @ViewChild('c2', { static: false, read: ElementRef }) _code2: ElementRef;
  @ViewChild('c3', { static: false, read: ElementRef }) _code3: ElementRef;
  @ViewChild('c4', { static: false, read: ElementRef }) _code4: ElementRef;
  @ViewChild('c5', { static: false, read: ElementRef }) _code5: ElementRef;
  @ViewChild('c6', { static: false, read: ElementRef }) _code6: ElementRef;

  @ViewChild('response', { static: false, read: ElementRef })
  _response: ElementRef;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _spinner: NgxSpinnerService,
    private readonly _otpAuthService: OtpAuthService,
    private readonly _vc: ViewContainerRef,
    private readonly trackingService: TrackingService
  ) {
    this.intervals = new Array();
    this.tokenExpirationTime = 300;
    this.tryAgainTime = 60;
    this.secondstokenExpirationTime = this.secondsTryAgainTime = 0;
    this.showOtpAuth = new EventEmitter<boolean>();
    this.resultOtp = new EventEmitter<IValidateOtpResponse>();
    this.onlyNumbers = /^\d+$/;
    this.form = this._builder.group({
      code1: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
      code2: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
      code3: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
      code4: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
      code5: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
      code6: [
        null,
        [
          Validators.pattern(this.onlyNumbers),
          Validators.min(0),
          Validators.max(9),
          Validators.minLength(1),
          Validators.maxLength(1),
          Validators.required,
        ],
      ],
    });
  }

  ngOnInit(): void {
    if (location.pathname.includes('/vidadevolucion')) {
      const gtmTrackingPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 4',
          'Sección': 'Modal Verificación Token',
          'TipoAcción': 'Visualizar modal',
          'CTA': 'Verificación Token',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
        }
      };
      this.trackingService.gtmTracking(gtmTrackingPayload);
    }

    this.f['code1'].valueChanges.subscribe((val: any) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code1'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code1'].valid) {
        this._code2.nativeElement.focus();
        this.code2Focus();
      }
    });
    this.f['code2'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code2'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code2'].valid) {
        this._code3.nativeElement.focus();
        this.code3Focus();
      }
    });
    this.f['code3'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code3'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code3'].valid) {
        this._code4.nativeElement.focus();
        this.code4Focus();
      }
    });
    this.f['code4'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code4'].setValue(val.slice(0, val.length - 1));
        }
        if (this.f['code4'].valid) {
          this._code5.nativeElement.focus();
          this.code5Focus();
        }
      }
    });
    this.f['code5'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code5'].setValue(val.slice(0, val.length - 1));
        }
        if (this.f['code5'].valid) {
          this._code6.nativeElement.focus();
          this.code6Focus();
        }
      }
    });
    this.f['code6'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!this.onlyNumbers.test(val)) {
          this.f['code6'].setValue(val.slice(0, val.length - 1));
        }
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get resumenAtp(): any {
    return JSON.parse(sessionStorage.getItem('resumen-atp') ?? '{}');
  }

  startCountdown(): void {
    this.intervals.forEach((e) => {
      clearInterval(e);
    });
    this.tokenExpirationTime = 300;
    this.tryAgainTime = 60;
    this.secondstokenExpirationTime = this.secondsTryAgainTime = 0;
    const interval = setInterval(() => {
      this.tokenExpirationTime =
        this.tokenExpirationTime > 0 ? this.tokenExpirationTime - 1 : 0;
      /* if (this.tokenExpirationTime - 1 < 0) {
        this.tokenExpirationTime = 0;
      } else {
        this.tokenExpirationTime--;
      } */
      this.tryAgainTime = this.tryAgainTime > 0 ? this.tryAgainTime - 1 : 0;

      if (this.secondstokenExpirationTime > 0) {
        this.secondstokenExpirationTime--;
      } else {
        if (this.tokenExpirationTime == 0) {
          this.secondstokenExpirationTime = 0;
        } else {
          this.secondstokenExpirationTime = 59;
        }
      }
      if (this.secondsTryAgainTime > 0) {
        this.secondsTryAgainTime--;
      } else {
        if (this.tryAgainTime == 0) {
          this.secondsTryAgainTime = 0;
        } else {
          this.secondsTryAgainTime = 59;
        }
      }
    }, 1000);
    this.intervals.push(interval);
  }

  code1Focus(): void {
    this._code1.nativeElement.select();
  }

  code2Focus(): void {
    this._code2.nativeElement.select();
  }

  code3Focus(): void {
    this._code3.nativeElement.select();
  }

  code4Focus(): void {
    this._code4.nativeElement.select();
  }

  code5Focus(): void {
    this._code5.nativeElement.select();
  }

  code6Focus(): void {
    this._code6.nativeElement.select();
  }

  submit(): void {
    if (this.form.valid) {
      this.valdiateOtp();
    }
  }

  closeModal(): void {
    this.showOtpAuth.emit(false);
  }

  closeAll(): void {
    window.location.reload();
  }

  get otpDescription(): string {
    if (+this.dataOtp?.type == 1) {
      const _ = this.dataOtp?.celular?.toString().split('') || [];
      const phone = `${_.slice(0, 3).join('')} ${_.slice(3, 6).join(
        ''
      )} ${_.slice(6, 9).join('')}`;
      return `Se ha enviado un SMS al +51 ${phone}`;
    }
    return `Se ha enviado el token a ${this.isAP ? maskEmail(this.dataOtp?.correo) : this.dataOtp?.correo}`;
  }

  get tokenTime(): string {
    const min = Math.floor(this.tokenExpirationTime / 60);
    return `${min.toString().padStart(2, '0')}:${this.secondstokenExpirationTime
      .toString()
      .padStart(2, '0')}`;
  }

  get tokenTryAgainTime(): string {
    const min = Math.floor(this.tryAgainTime / 60);
    return `${min.toString().padStart(2, '0')}:${this.secondsTryAgainTime
      .toString()
      .padStart(2, '0')}`;
  }

  registerOtp(): void {
    this._spinner.show();
    this.form.reset();
    this._otpAuthService.registerOtp(this.dataOtp).subscribe(
      (response: IRegisterOtpResponse) => {
        this.responseOtp = response;

        if (this.responseOtp.success) {
          this.startCountdown();
        } else {
          this.resultOtp.emit({
            success: false,
            hasError: true,
            message:
              'Ocurrió un error al intentar enviar el token de verificación',
          });
        }
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.resultOtp.emit({
          success: false,
          hasError: true,
          message:
            'Ocurrió un error al intentar enviar el token de verificación',
        });
      }
    );
  }

  valdiateOtp(): void {
    // tslint:disable-next-line:max-line-length
    const codeVerification = `${this.f['code1'].value}${this.f['code2'].value}${this.f['code3'].value}${this.f['code4'].value}${this.f['code5'].value}${this.f['code6'].value}`;
    const payload: IValidateOtp = {
      idProcess: this.dataOtp.idProcess,
      uniqueId: this.responseOtp.uniqueId,
      valor: codeVerification,
      NumeroDocumento: this.dataOtp.dni
    };
    this._response.nativeElement.textContent = '';
    this._spinner.show();
    this._otpAuthService.validateOtp(payload).subscribe(
      (response: IValidateOtpResponse) => {
        this._spinner.hide();
        sessionStorage.removeItem('_b10m3tr1c0');
        sessionStorage.removeItem('result-biometric');
        sessionStorage.removeItem(AppConfig.OTPAUTH_STORAGE);
        if (response.success) {
          const emit = {
            success: response.success,
            hasError: false,
            message: null,
          };
          this.resultOtp.emit(emit);
          this._otpAuthService.storage = emit;
        } else {
          this._response.nativeElement.textContent =
            'El token de verificación no es válido';
          this.form.reset();
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.resultOtp.emit({
          success: false,
          hasError: true,
          message:
            'Ocurrió un error al intentar validar el token de verificación',
        });
      }
    );
  }

  emitEventOtpAuthMethod(type: number): void {
    const isVdp = window.location.pathname.indexOf('/vidadevolucion') !== -1;

    if (isVdp) {
      const gtmTrackingPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 4',
          'Sección': 'Modal Verificación',
          'TipoAcción': 'Seleccionar botón',
          'CTA': type == 1 ? 'Verificar' : type == 2 ? 'Reenviar token' : 'Elegir otro método',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
        }
      };
      this.trackingService.gtmTracking(gtmTrackingPayload);
    }

    switch (type) {
      case 1:
        this.submit();
        break;
      case 2:
        this.registerOtp();
        break;
      case 3:
        this.closeModal();
        break;
    }
  }

  get isSOAT(): boolean {
    return location.pathname.indexOf('/soat') != -1;
  }

  get isVL(): boolean {
    return location.pathname.indexOf('/vidaley') != -1;
  }

  get isAP(): boolean {
    return location.pathname.indexOf('/accidentespersonales') != -1;
  }
}
