import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegularExpressions } from '@shared/regexp/regexp';
import { ProductService } from '../../../layout/broker/services/product/panel/product.service';

@Component({
  standalone: false,
  selector: 'app-otp-auth-aws',
  templateUrl: './otp-auth-aws.component.html',
  styleUrls: ['./otp-auth-aws.component.scss'],
})
export class OtpAuthAwsComponent implements OnInit {
  form: FormGroup;

  @Input() idProcessUser: string;

  @Output() close = new EventEmitter<void>();
  @Output() resendCode = new EventEmitter<void>();
  @Output() result = new EventEmitter<void>();

  tokenTimer: number = 180;
  resendTimer: number = 60;
  mainInterval: any;
  resendInterval: any;
  canResend: boolean = false;
  message: string = '';

  @ViewChild('c1', { static: false, read: ElementRef }) code1: ElementRef;
  @ViewChild('c2', { static: false, read: ElementRef }) code2: ElementRef;
  @ViewChild('c3', { static: false, read: ElementRef }) code3: ElementRef;
  @ViewChild('c4', { static: false, read: ElementRef }) code4: ElementRef;

  @ViewChild('response', { static: false, read: ElementRef })
  _response: ElementRef;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly productService: ProductService
  ) {
    this.form = this.builder.group({
      code1: this.createCodeControl(),
      code2: this.createCodeControl(),
      code3: this.createCodeControl(),
      code4: this.createCodeControl(),
    });
  }

  ngOnInit(): void {
    this.startTokenTimer();
    this.startResendTimer();

    this.f['code1'].valueChanges.subscribe((val: any) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code1'].setValue('');
        }
        if (val.length > 1) {
          this.f['code1'].setValue(val.charAt(0));
          this.f['code2'].setValue(val.slice(1));
          return;
        }

        this.focusCode('code2');
      }
    });
    this.f['code2'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code2'].setValue('');
        }
        if (val.length > 1) {
          this.f['code2'].setValue(val.charAt(0));
          this.f['code3'].setValue(val.slice(1));
          return;
        }

        this.focusCode('code3');
      }
    });
    this.f['code3'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code3'].setValue('');
        }
        if (val.length > 1) {
          this.f['code3'].setValue(val.charAt(0));
          this.f['code4'].setValue(val.slice(1));
          return;
        }

        this.focusCode('code4');
      }
    });
    this.f['code4'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (!RegularExpressions.numbers.test(val)) {
          this.f['code4'].setValue('');
        }
        if (val.length > 1) {
          this.f['code4'].setValue(val.charAt(0));
          return;
        }
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  private createCodeControl(): FormControl {
    return this.builder.control(null, [
      Validators.pattern(RegularExpressions.numbers),
      Validators.min(0),
      Validators.max(9),
      Validators.minLength(1),
      Validators.required,
    ]);
  }

  focusCode(element: string): void {
    this[element]?.nativeElement.focus();
    this[element]?.nativeElement.select();
  }

  startTokenTimer(): void {
    this.mainInterval = setInterval(() => {
      this.tokenTimer--;
      if (this.tokenTimer <= 0) {
        clearInterval(this.mainInterval);
      }
    }, 1000);
  }

  startResendTimer(): void {
    this.canResend = false;
    this.resendTimer = 60;
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.padZero(mins)}:${this.padZero(secs)}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  closeModal(): void {
    this.close.emit();
  }

  resendToken(): void {
    this.message = '';
    this.resendCode.emit();
  }

  validateCode(): void {
    this.spinner.show();
    this.message = '';
    const codeVerification = Object.values(this.form.getRawValue()).join('');

    const payload = {
      authentication: {
        applicationId: '19100001',
        authenticationType: '04',
        userData: {
          processId: this.idProcessUser,
        },
      },
    };

    this.productService.validateToken(payload, codeVerification).subscribe(
      (response) => {
        
        if (response.status.id === 201) {
          this.result.emit(response)
          return;
        }

        if (response.status.name == 'UNSUCCESS VALIDATION') {
          this.message = 'El código ingresado es incorrecto. Por favor, inténtalo de nuevo.';
        } else if (response.status.name == 'LIMIT EXCEEDED') {
          this.message = 'Has excedido el número de intentos permitidos. Por favor, inténtalo de nuevo más tarde.';
        } else {
          this.message = 'Ocurrió un error al validar el código. Por favor, inténtalo de nuevo más tarde.';
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.message = 'Ocurrió un error al validar el código. Por favor, inténtalo de nuevo más tarde.';
        console.log(error);
      }
    );
  }
}