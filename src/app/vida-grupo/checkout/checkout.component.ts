import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../app.config';
import {
  IRegisterOtp,
  IValidateOtpResponse,
} from '../../shared/interfaces/otp-auth.interface';
import { BiometricResultDto } from '../../shared/models/biometric/biometric.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { KushkiService } from '../../shared/services/kushki/kushki.service';
import { Kushki } from '@kushki/js';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RegularExpressions } from '../../shared/regexp/regexp';
import { environment } from '../../../environments/environment';
import { String } from '@shared/components/kushki-form/constants/constants';
import { v4 as uuid } from 'uuid';

declare var VisanetCheckout: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  acceptTerms: boolean;
  showAuthentication: boolean = false;
  authMethodData: IRegisterOtp;
  biometricResult: BiometricResultDto;
  otpResponse: IValidateOtpResponse;
  codeLink: string = '';
  isValid: boolean = true;
  sourcePagoEfectivo: SafeUrl;
  idClientGoogle: string = '';
  idTransactionSession: string = '';

  paymentType$: any;
  //Data de la cotización obtenido de la api
  dataResumen: any = {};

  private kushki: Kushki;
  cardType: string = '';
  kushkiForm: FormGroup = this.builder.group({
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(16),
        Validators.maxLength(16),
      ],
    ],
    dueDate: [
      '',
      [
        Validators.pattern('^(0[1-9]|1[0-2])/(0[1-9]|[1-2][0-9]|3[0-1])$'),
        Validators.required,
        Validators.maxLength(5),
      ],
    ],
    cvv: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
    ],
  });
  messageInfoKushki: string = '';

  @ViewChild('visaPay', { static: false, read: ElementRef })
  visaPay: ElementRef;
  @ViewChild('btnSubmit', { static: false, read: ElementRef })
  btnSubmit: ElementRef;
  @ViewChild('modalPagoEfectivo', { static: false, read: ModalDirective })
  modalPagoEfectivo: ModalDirective;
  @ViewChild('modalKushkiPayment', { static: true, read: TemplateRef })
  modalKushkiPayment: TemplateRef<ElementRef>;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly appConfig: AppConfig,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly checkoutService: CheckoutService,
    private readonly domSanitizer: DomSanitizer,
    private readonly kushkiService: KushkiService,
    private readonly builder: FormBuilder,
    private readonly viewContainerRef: ViewContainerRef
  ) {
    this.paymentType$ = {
      niubiz: false,
      kushki: false,
    };
    this.codeLink = this.activatedRoute.snapshot.paramMap.get('idProcess');
    this.sourcePagoEfectivo =
      this.domSanitizer.bypassSecurityTrustResourceUrl('');
    this.idClientGoogle = this.checkoutService.getClientID();
    this.idTransactionSession = this.checkoutService.getSessionID();
  }

  ngOnInit() {
    if (
      this.insurance &&
      this.codeLink == this.insurance?.cotizacionInfo?.idProceso
    ) {
      this.dataResumen = this.insurance;
      this.getPaymentType();

      if (this.responseOtp) {
        this.otpResponse = this.responseOtp;
      }
    } else {
      this.getResumenData();
    }

    if (!this.dataNiubiz?.sessionNiubiz) {
      this.generateTokenNiubiz();
    }

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

    this.kushkiFormControl['dueDate'].valueChanges.subscribe(
      (value: string) => {
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
      }
    );
  }

  getResumenData(): void {
    this.spinner.show();

    this.checkoutService.getResumenInfo(+this.codeLink).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.isValid = false;
          return;
        }
        const { sessionNiubiz, ...responseResumen } = response;
        this.dataResumen = responseResumen;
        this.isValid = true;
        sessionStorage.setItem('insurance', JSON.stringify(responseResumen));
        sessionStorage.setItem(
          'dataNiubiz',
          JSON.stringify(response.sessionNiubiz)
        );
        this.getPaymentType();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.isValid = false;
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getPaymentType() {
    const data = {
      aplicacion: 1,
      idRamo: +this.dataResumen?.cotizacionInfo?.idRamo,
      idProducto: +this.dataResumen?.cotizacionInfo?.idProducto,
      codigoCanal: this.dataResumen?.canalInfo?.codigoCanal,
    };

    this.checkoutService.obtenerMetodoPago(data).subscribe({
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

  generateTokenNiubiz(): void {
    this.spinner.show();

    this.checkoutService.getTokenNiubiz(+this.codeLink).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        sessionStorage.setItem(
          'dataNiubiz',
          JSON.stringify(response.sessionNiubiz)
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get currencyType(): string {
    switch (+this.dataResumen?.cotizacionInfo?.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  get isRuc(): boolean {
    return Number(this.dataResumen?.contratanteInfo?.idTipoDocumento) == 1;
  }

  get kushkiFormControl(): { [key: string]: AbstractControl } {
    return this.kushkiForm.controls;
  }

  get uuid(): any {
    if (sessionStorage.getItem('vidagrupo-uuid')) {
      return sessionStorage.getItem('vidagrupo-uuid');
    }

    const guid = uuid();
    sessionStorage.setItem('vidagrupo-uuid', guid);
    return this.uuid;
  }

  get responseOtp(): any {
    return JSON.parse(sessionStorage.getItem('otp-response'));
  }

  get dataNiubiz(): any {
    return JSON.parse(sessionStorage.getItem('dataNiubiz'));
  }

  showModalAuthMethod(e: boolean) {
    this.showAuthentication = e;
  }

  showHideModalBiometrico(): void {
    this.authMethodData = {
      idProcess: this.dataResumen?.cotizacionInfo?.idProceso,
      dni: this.dataResumen?.contratanteInfo?.numeroDocumento,
      nombre: this.dataResumen?.contratanteInfo?.nombres,
      apellido: this.dataResumen?.contratanteInfo?.apellidoPaterno,
      celular: this.dataResumen?.contratanteInfo?.telefono,
      correo: this.dataResumen?.contratanteInfo?.correo,
    };

    this.showAuthentication = !this.showAuthentication;
  }

  otpResult(e: IValidateOtpResponse) {
    this.biometricResult = null;
    this.otpResponse = e;
    this.showAuthentication = false;

    if (e.hasError) {
      this.btnSubmit.nativeElement.textContent = 'Reintentar';
      return;
    }

    if (e.success) {
      sessionStorage.setItem('otp-response', JSON.stringify(e));
    }
  }

  pagarPagoEfectivo(): void {
    this.spinner.show();
    const dataEmision = {
      idProceso: +this.dataResumen?.cotizacionInfo?.idProceso,
      token: null,
      tipoPago: 2,
      idClienteGoogle: this.idClientGoogle,
      idSesionTransaccion: this.idTransactionSession,
    };
    this.checkoutService.emission(dataEmision).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.sourcePagoEfectivo =
            this.domSanitizer.bypassSecurityTrustResourceUrl(response.message);
          sessionStorage.setItem(
            'pago-efectivo-response',
            JSON.stringify(response)
          );
          this.modalPagoEfectivo.show();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  finalizePayment(): void {
    this.router.navigate([`/vidagrupo/payment/resumen/pago-efectivo`]);
  }

  pay(type: number) {
    if (type == 2) {
      this.insertVisaScript();
      return;
    }
    this.getCredentials();
  }

  insertVisaScript() {
    delete window['VisanetCheckout'];
    this.appConfig.loadScriptSubscription(this.visaPay).then((loaded) => {
      const visaConfig = this.getSubscriptionConfig();
      VisanetCheckout.configure({
        ...visaConfig,
        complete: () => {},
      });
      VisanetCheckout.open();
    });
    return;
  }

  private getSubscriptionConfig() {
    const subs = {
      action: `${AppConfig.ACTION_VISA_PAY}/${btoa(
        AppConfig.DOMAIN_URL + '/vidagrupo/payment/visa'
      )}`,
      method: 'POST',
      sessiontoken: this.dataNiubiz?.sessionNiubiz,
      channel: 'paycard',
      merchantid: this.dataNiubiz?.codigoComercio,
      merchantlogo: AppConfig.LOGO_PROTECTA,
      formbuttoncolor: '#ED6E00',
      formbuttontext:
        `${this.currencyType} ${this.dataResumen?.cotizacionInfo?.primaTotal}` ||
        'Pagar',
      purchasenumber: this.dataNiubiz?.numeroCompra,
      showamount: false,
      amount: this.dataResumen?.cotizacionInfo?.primaTotal.toString(),
      cardholdername: this.onlyText(
        this.dataResumen?.contratanteInfo?.nombres ||
          this.dataResumen?.contratanteInfo?.razonSocial
      ),
      cardholderlastname: this.onlyText(
        this.dataResumen?.contratanteInfo?.apellidoPaterno ||
          this.dataResumen?.contratanteInfo?.razonSocial
      ),
      cardholderemail: this.dataResumen?.contratanteInfo?.correo,
      expirationminutes: '20',
      timeouturl: window.location + '/visa',
      usertoken: null,
    };

    return subs;
  }

  onlyText(txt: string): string {
    txt = txt.replace(/[^a-zA-Z ]/g, '');
    return txt;
  }

  private getCredentials(): void {
    this.spinner.show();

    const payload: any = {
      idRamo: +this.dataResumen?.cotizacionInfo?.idRamo,
      idProducto: +this.dataResumen?.cotizacionInfo?.idProducto,
      idMoneda: this.dataResumen?.cotizacionInfo?.idMoneda,
      idCategoria: this.dataResumen?.cotizacionInfo?.idCategoria,
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
        this.viewContainerRef.createEmbeddedView(this.modalKushkiPayment);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      },
    });
  }

  closeModal(): void {
    this.viewContainerRef.clear();
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

  kushkiSubmit(): void {
    this.spinner.show();

    this.saveInfoKushki();

    const names =
      `${this.dataResumen?.contratanteInfo?.nombres} ${this.dataResumen?.contratanteInfo?.apellidoPaterno} ${this.dataResumen?.contratanteInfo?.apellidoMaterno}`.trim();
    const dueDate: string = this.kushkiFormControl['dueDate'].value.split('/');
    this.kushki.requestSubscriptionToken(
      {
        currency:
          this.dataResumen?.cotizacionInfo?.idMoneda == 1 ? 'PEN' : 'USD',
        card: {
          name: names,
          number: this.kushkiFormControl['cardNumber'].value,
          cvc: this.kushkiFormControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      },
      (response): void => {
        this.spinner.hide();

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

  saveInfoKushki(): void {
    const payload = {
      montoCobro: this.dataResumen?.cotizacionInfo?.primaTotal,
      codigoCanal: this.dataResumen?.canalInfo?.codigoCanal,
      idUsuario: 3822,
      idRamo: +this.dataResumen?.cotizacionInfo?.idRamo,
      idProducto: +this.dataResumen?.cotizacionInfo?.idProducto,
      idMoneda: +this.dataResumen?.cotizacionInfo?.idMoneda,
      externalId: this.uuid,
      idTipoDocumento: this.dataResumen?.contratanteInfo?.idTipoDocumento,
      numeroDocumento: this.dataResumen?.contratanteInfo?.numeroDocumento,
      email: this.dataResumen?.contratanteInfo?.correo,
      idPayment: this.dataResumen?.cotizacionInfo?.idProceso,
      nombres: this.dataResumen?.contratanteInfo?.nombres,
      apellidoPaterno: this.dataResumen?.contratanteInfo?.apellidoPaterno,
      apellidoMaterno: this.dataResumen?.contratanteInfo?.apellidoMaterno,
      razonSocial: null,
      telefono: this.dataResumen?.contratanteInfo?.telefono,
      generar: false,
    };
    this.kushkiService.saveInfo(payload).subscribe();
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

    this.viewContainerRef.clear();
    this.kushkiForm.patchValue(
      {
        cardNumber: '',
        dueDate: '',
        cvv: '',
      },
      {
        emitEvent: false,
      }
    );

    this.kushki.requestValidate3DS(req, (response: any): void => {
      if (!response?.isValid) {
        return;
      }

      this.processPayment(info['token']);
    });
  }

  private processPayment(token: string): void {
    const emissionPayload = {
      idProceso: this.dataResumen?.cotizacionInfo?.idProceso,
      tipoPago: 4,
      token,
      idClienteGoogle: this.idClientGoogle,
      idSesionTransaccion: this.idTransactionSession,
    };

    const idProcess = this.dataResumen?.cotizacionInfo?.idProceso;

    sessionStorage.setItem('kushki-payload', JSON.stringify(emissionPayload));
    this.router.navigate([`/vidagrupo/payment/visa/${token}`]);
  }
}
