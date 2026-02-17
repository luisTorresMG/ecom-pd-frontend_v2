import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { IRegisterOtp } from '@shared/interfaces/otp-auth.interface';
import { IOtp, IOtpResult } from '@shared/interfaces/otp.interface';
import { RegularExpressions } from '@shared/regexp/regexp';
import { OtpAuthService } from '@shared/services/otp-auth/otp-auth.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'protecta-otp-token',
  templateUrl: './otp-token.component.html',
  styleUrls: ['./otp-token.component.sass'],
})
export class OtpTokenComponent implements OnInit {
  form: FormGroup = this.builder.group({
    code1: [
      null,
      [
        Validators.pattern(RegularExpressions.numbers),
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
        Validators.pattern(RegularExpressions.numbers),
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
        Validators.pattern(RegularExpressions.numbers),
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
        Validators.pattern(RegularExpressions.numbers),
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
        Validators.pattern(RegularExpressions.numbers),
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
        Validators.pattern(RegularExpressions.numbers),
        Validators.min(0),
        Validators.max(9),
        Validators.minLength(1),
        Validators.maxLength(1),
        Validators.required,
      ],
    ],
  });

  tokenExpirationTime: number;
  secondstokenExpirationTime: number;

  tryAgainTime: number;
  secondsTryAgainTime: number;

  payloadOtp: IOtp;

  responseOtp: any;

  intervals: Array<any>;

  @Input() set data(payload: IOtp) {
    this.payloadOtp = payload;
    this.registerOtp();
  }

  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() result: EventEmitter<IOtpResult> = new EventEmitter<IOtpResult>();

  @ViewChild('c1', { static: false, read: ElementRef }) code1: ElementRef;
  @ViewChild('c2', { static: false, read: ElementRef }) code2: ElementRef;
  @ViewChild('c3', { static: false, read: ElementRef }) code3: ElementRef;
  @ViewChild('c4', { static: false, read: ElementRef }) code4: ElementRef;
  @ViewChild('c5', { static: false, read: ElementRef }) code5: ElementRef;
  @ViewChild('c6', { static: false, read: ElementRef }) code6: ElementRef;

  @ViewChild('messageInfo', { static: false, read: ElementRef })
  messageInfo: ElementRef;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly otpAuthService: OtpAuthService,
  ) {
    this.intervals = new Array();
    this.tokenExpirationTime = 300;
    this.tryAgainTime = 60;
    this.secondstokenExpirationTime = this.secondsTryAgainTime = 0;
  }

  ngOnInit(): void {
    this.f['code1'].valueChanges.subscribe((val: any) => {
      console.log(val);
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code1'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code1'].valid) {
        this.code2.nativeElement.focus();
        this.code2Focus();
      }
    });

    this.f['code2'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code2'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code2'].valid) {
        this.code3.nativeElement.focus();
        this.code3Focus();
      }
    });

    this.f['code3'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code3'].setValue(val.slice(0, val.length - 1));
        }
      }
      if (this.f['code3'].valid) {
        this.code4.nativeElement.focus();
        this.code4Focus();
      }
    });

    this.f['code4'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code4'].setValue(val.slice(0, val.length - 1));
        }
        if (this.f['code4'].valid) {
          this.code5.nativeElement.focus();
          this.code5Focus();
        }
      }
    });

    this.f['code5'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code5'].setValue(val.slice(0, val.length - 1));
        }
        if (this.f['code5'].valid) {
          this.code6.nativeElement.focus();
          this.code6Focus();
        }
      }
    });

    this.f['code6'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code6'].setValue(val.slice(0, val.length - 1));
        }
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
    this.code1.nativeElement.select();
  }

  code2Focus(): void {
    this.code2.nativeElement.select();
  }

  code3Focus(): void {
    this.code3.nativeElement.select();
  }

  code4Focus(): void {
    this.code4.nativeElement.select();
  }

  code5Focus(): void {
    this.code5.nativeElement.select();
  }

  code6Focus(): void {
    this.code6.nativeElement.select();
  }

  submit(): void {
    if (this.form.valid) {
      this.valdiateOtp();
    }
  }

  closeModal(): void {
    this.close.emit(this.payloadOtp.methods.length == 1);
  }

  get otpDescription(): string {
    if (+this.payloadOtp?.selectedMethod == 2) {
      const _ = this.payloadOtp?.cellphone?.toString().split('') || [];
      const phone = `${_.slice(0, 3).join('')} ${_.slice(3, 6).join(
        ''
      )} ${_.slice(6, 9).join('')}`;
      return `Se ha enviado un SMS al +51 ${phone}`;
    }
    return `Se ha enviado el token a ${this.payloadOtp?.email}`;
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

  resendToken(): void {
    this.messageInfo.nativeElement.textContent = null;
    this.registerOtp();
  }

  registerOtp(): void {
    this.spinner.show();
    this.form.reset();

    const payload: IRegisterOtp = {
      idProcess: this.payloadOtp.processId,
      nombre: this.payloadOtp.names,
      apellido: this.payloadOtp.surnames,
      celular: this.payloadOtp.cellphone,
      correo: this.payloadOtp.email,
      dni: this.payloadOtp.documentNumber,
      type: this.payloadOtp.selectedMethod == 2 ? 1 : 2,
    };

    this.otpAuthService.registerOtp(payload).subscribe(
      (response: any) => {
        this.responseOtp = response;
        this.spinner.hide();

        if (this.responseOtp.success) {
          this.startCountdown();
          return;
        }

        this.messageInfo.nativeElement.textContent =
          'Ocurrió un error al intentar enviar el token de verificación';

        this.result.emit({
          success: false,
          hasError: true,
          message:
            'Ocurrió un error al intentar enviar el token de verificación',
          payload: this.payloadOtp,
          response: response,
          type: 'enviar-token',
        });
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.result.emit({
          success: false,
          hasError: true,
          message:
            'Ocurrió un error al intentar enviar el token de verificación',
          payload: this.payloadOtp,
          response: error,
          type: 'enviar-token',
        });
        this.messageInfo.nativeElement.textContent =
          'Ocurrió un error al intentar enviar el token de verificación';
      }
    );
  }

  valdiateOtp(): void {
    // tslint:disable-next-line:max-line-length
    const codeVerification = Object.values(this.form.getRawValue()).join('');
    const payload: any = {
      idProcess: this.payloadOtp.processId,
      uniqueId: this.responseOtp.uniqueId,
      numeroDocumento: this.payloadOtp.documentNumber,
      valor: codeVerification,
    };

    this.messageInfo.nativeElement.textContent = '';
    this.spinner.show();
    this.otpAuthService.validateOtp(payload).subscribe(
      (response: any) => {
        console.log(response);
        this.spinner.hide();

        if (!response.success) {
          this.messageInfo.nativeElement.textContent =
            'El token de verificación no es válido';
          this.form.reset();
          return;
        }

        const emit: IOtpResult = {
          success: response.success,
          hasError: false,
          message: '¡La validación OTP se realizó correctamente!',
          payload: payload,
          response: response,
          type: 'validar-token',
        };
        this.result.emit(emit);
        this.otpAuthService.storage = emit;
      },
      (error: HttpErrorResponse) => {
        console.error(error);

        this.messageInfo.nativeElement.textContent =
          'Ocurrió un error al intentar validar el token de verificación';

        this.spinner.hide();
        this.result.emit({
          success: false,
          hasError: true,
          message:
            'Ocurrió un error al intentar validar el token de verificación',
          payload: payload,
          response: error,
          type: 'validar-token',
        });
      }
    );
  }

  emitEventOtpAuthMethod(type: number): void {
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
}
