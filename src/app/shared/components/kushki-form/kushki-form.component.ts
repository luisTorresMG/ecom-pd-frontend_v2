import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import {Kushki} from '@kushki/js';
import {HttpErrorResponse} from '@angular/common/http';

import {environment} from '../../../../environments/environment';
import {KushkiService} from '@shared/services/kushki/kushki.service';

import {ScreenSplashService} from '@screen-splash';
import {RegularExpressions} from '@shared/regexp/regexp';
import {fadeAnimation} from '@shared/animations/animations';
import {String} from './constants/constants';
import {KushkiModel} from '@shared/models/kushki/kushki.model';
import {IKushkiResult} from '@shared/interfaces/kushki.interface';

enum paymentResponseCodes {
  DECLINED = '017'
}

interface ITokenResponse {
  token: string;
}

interface ITokenOTPResponse {
  token: string;
  secureId: string;
  secureService: 'KushkiOTP';
}

interface IToken3DSResponse {
  token: string;
  secureId: string;
  secureService: '3dsecure';
  security: {
    acsURL: string;
    authenticationTransactionId: string;
    authRequired: boolean;
    paReq: string;
    specificationVersion: string;
  };
}

interface ITokenErrorResponse {
  message: string;
  code: string;
  error: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pro-kushki-form',
  templateUrl: './kushki-form.component.html',
  styleUrls: ['./kushki-form.component.sass'],
  providers: [KushkiService],
  animations: [fadeAnimation],
})
export class KushkiFormComponent implements OnInit {
  @Output() result: EventEmitter<IKushkiResult> = new EventEmitter<IKushkiResult>();

  private kushki: Kushki;

  cardType: 'visa' | 'mastercard' | 'diners' | 'amex';

  currencies: Record<'PEN' | 'USD', string> = String.currencies;

  paymentInfo: KushkiModel = new KushkiModel(this.kushkiService.getPaymentInfo());
  paymentMethod: 'card' | 'cash' | 'transfer' = this.paymentInfo.payment.allowedMethods[0];
  idTokenSesion: number = 0;

  formCardPayment: FormGroup = this.builder.group({
    names: [],
    legalName: [],
    email: [
      '',
      [Validators.required, Validators.pattern(RegularExpressions.email)],
    ],
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(16),
        Validators.maxLength(16),
      ],
    ],
    cvv: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
    ],
    dueDate: [
      '',
      [
        Validators.pattern('^(0[1-9]|1[0-2])/(0[1-9]|[1-2][0-9]|3[0-1])$'),
        Validators.maxLength(5),
      ],
    ],
  });

  formCashPayment: FormGroup = this.builder.group({
    names: [],
    surnames: [],
    legalName: [],
    documentType: [],
    documentNumber: [],
    email: ['', [Validators.required, Validators.pattern(RegularExpressions.email)]],
  });

  formPaymentTransfer: FormGroup = this.builder.group({
    documentType: [],
    documentNumber: [],
    email: ['', [Validators.required, Validators.pattern(RegularExpressions.email)]],
  });

  messageInfo: string = '';

  constructor(
    private readonly builder: FormBuilder,
    private readonly kushkiService: KushkiService,
    private readonly screenSplash: ScreenSplashService
  ) {
  }

  ngOnInit(): void {
    this.formValueChanges();
    this.initFormValues();
    this.getCredentials();
  }

  get formCardControl(): { [key: string]: AbstractControl } {
    return this.formCardPayment.controls;
  }

  get formCashControl(): { [key: string]: AbstractControl } {
    return this.formCashPayment.controls;
  }

  get formPaymentTransferControl(): { [key: string]: AbstractControl } {
    return this.formPaymentTransfer.controls;
  }

  /**
   * The function initializes form values for different payment methods based on the payment
   * information of the client.
   */
  initFormValues(): void {
    this.formCardPayment.patchValue(this.initialValuesAndDisableForm()[0]);
    this.formCashPayment.patchValue(this.initialValuesAndDisableForm()[1]);
    this.formPaymentTransfer.patchValue(this.initialValuesAndDisableForm()[2]);
  }

  initialValuesAndDisableForm(): any[] {
    const cardPaymentPayload = {
      names: this.paymentInfo.client.completeNames,
      legalName: this.paymentInfo.client.legalName,
      email: this.paymentInfo.client.email
    };
    const cashPaymentPayload = {
      names: this.paymentInfo.client.names,
      surnames: this.paymentInfo.client.surnames,
      legalName: this.paymentInfo.client.legalName,
      documentType: this.paymentInfo.client.documentType,
      documentNumber: this.paymentInfo.client.documentNumber,
      email: this.paymentInfo.client.email
    };
    const paymentTransferPayload = {
      documentType: this.paymentInfo.client.documentType,
      documentNumber: this.paymentInfo.client.documentNumber,
      email: this.paymentInfo.client.email
    };

    Object.keys(cardPaymentPayload).forEach((key: string): void => {
      if (!cardPaymentPayload[key]) {
        return;
      }
      this.formCardControl[key].disable({
        emitEvent: false
      });
    });

    Object.keys(cashPaymentPayload).forEach((key: string): void => {
      if (!cashPaymentPayload[key]) {
        return;
      }
      this.formCashControl[key].disable({
        emitEvent: false
      });
    });

    Object.keys(paymentTransferPayload).forEach((key: string): void => {
      if (!paymentTransferPayload[key]) {
        return;
      }
      this.formPaymentTransferControl[key].disable({
        emitEvent: false
      });
    });

    return [cardPaymentPayload, cashPaymentPayload, paymentTransferPayload];
  }

  private getCredentials(): void {
    this.screenSplash.show();
    this.idTokenSesion = 0;

    const payload: any = {
      idRamo: this.paymentInfo.branchId,
      idProducto: this.paymentInfo.productId,
      idMoneda: this.paymentInfo.payment.currency == 'PEN' ? '1' : '2',
      idCategoria: '1'
    };

    this.kushkiService.getCredentials(payload).subscribe({
      next: (response: any): void => {

        if (!response.success) {
          this.result.emit({
            success: false,
            message: 'Ocurrió un error al obtener el código de comercio',
            paymentInfo: {
              token: '',
              processId: this.idTokenSesion,
              paymentMethod: this.paymentMethod
            }
          });
          return;
        }

        this.kushki = new Kushki({
          merchantId: response.credenciales[0].llavePublica,
          inTestEnvironment: !environment.production,
          regional: false,
        });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.screenSplash.hide();

        this.result.emit({
          success: false,
          message: 'Ocurrió un error al obtener el código de comercio',
          paymentInfo: {
            token: '',
            processId: this.idTokenSesion,
            paymentMethod: this.paymentMethod
          }
        });
      },
      complete: (): void => {
        this.screenSplash.hide();
      }
    });
  }

  formValueChanges(): void {
    this.formCardControl['cardNumber'].valueChanges.subscribe(
      (value: string) => {
        this.cardType = undefined;
        if (this.formCardControl['cardNumber'].hasError('pattern')) {
          this.formCardControl['cardNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formCardControl['dueDate'].valueChanges.subscribe((value: string) => {
      const split = value.split('/');

      split.forEach((val) => {
        const regex = new RegExp(RegularExpressions.numbers);

        if (!regex.test(val)) {
          if (!val) {
            return;
          }

          this.formCardControl['dueDate'].setValue('', {
            emitEvent: false,
          });
        }
      });

      if (value.length === 2) {
        this.formCardControl['dueDate'].setValue(`${value}/`);
      }
    });

    this.formCashControl['documentNumber'].valueChanges.subscribe(
      (value: string) => {
        if (this.formCashControl['documentNumber'].hasError('pattern')) {
          this.formCashControl['documentNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formPaymentTransferControl['documentNumber'].valueChanges.subscribe(
      (value: string) => {
        if (
          this.formPaymentTransferControl['documentNumber'].hasError('pattern')
        ) {
          this.formPaymentTransferControl['documentNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  /**
   * The function requests bin information from Kushki API based on the card number input.
   * @returns If the length of the card number is less than 8, nothing is returned (the function exits
   * without doing anything). Otherwise, the function makes a request to the Kushki API to get
   * information about the card's BIN (Bank Identification Number) and logs the response to the console.
   */
  binInfo(): void {
    if (this.formCardControl['cardNumber'].value.length < 8) {
      return;
    }

    this.kushki.requestBinInfo(
      {
        bin: this.formCardControl['cardNumber'].value,
      },
      (response: any): void => {
        this.cardType = response.brand;
      }
    );
  }

  /**
   * The function enables three different forms with no event emission.
   */
  private enableForms(): void {
    this.formCardPayment.enable({
      emitEvent: false
    });
    this.formCashPayment.enable({
      emitEvent: false
    });
    this.formPaymentTransfer.enable({
      emitEvent: false
    });

    this.initialValuesAndDisableForm();
  }

  /**
   * The function saves payment information by constructing a payload object and sending it to a Kushki
   * service.
   */
  saveInfo(): void {
    const getCurrencyCode = (prefix: 'PEN' | 'USD'): number => {
      return prefix == 'PEN' ? 1 : 2;
    };

    const getDocumentTypeCode = (prefix: 'RUC' | 'DNI' | 'CE'): number => {
      switch (prefix) {
        case 'RUC':
          return 1;
        case 'DNI':
          return 2;
        case 'CE':
          return 4;
      }
    };

    const payload = {
      montoCobro: this.paymentInfo.payment.amount,
      codigoCanal: this.paymentInfo.channelCode,
      idUsuario: this.paymentInfo.userId,
      idRamo: this.paymentInfo.branchId,
      idProducto: this.paymentInfo.productId,
      idMoneda: getCurrencyCode(this.paymentInfo.payment.currency),
      externalId: this.paymentInfo.guid,
      idTipoDocumento: getDocumentTypeCode(this.paymentInfo.client.documentType),
      numeroDocumento: this.paymentInfo.client.documentNumber,
      email: this.paymentInfo.client.email,
      idPayment: 0,
      nombres: this.paymentInfo.client.names,
      apellidoPaterno: this.paymentInfo.client.paternalSurname,
      apellidoMaterno: this.paymentInfo.client.maternalSurname,
      razonSocial: this.paymentInfo.client.legalName,
      telefono: +this.paymentInfo.client.phoneNumber,
      generar: true,
      canalKushki: 'paycard',
    };
    this.kushkiService.saveInfo(payload).subscribe({
        next: (response: any): void => {

            if (!response.success) {
              this.result.emit({
                success: false,
                message: 'Ocurrió un error al obtener el código de comercio',
                paymentInfo: {
                  token: '',
                  processId: this.idTokenSesion,
                  paymentMethod: 'card'
                }
              });
              return;
            }
            this.idTokenSesion = response.idPayment;
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
            this.result.emit({
              success: false,
              message: 'Ocurrió un error al generar el token de sesion',
              paymentInfo: {
                token: '',
                processId: this.idTokenSesion,
                paymentMethod: 'card'
              }
            });
          },
    });
  }

  /**
   * The onSubmit function uses a switch statement to determine which payment method to use and calls
   * the corresponding function.
   */
  onSubmit(): void {
    this.messageInfo = '';
    this.saveInfo();

    switch (this.paymentMethod) {
      case 'card':
        this.cardPaymentSubmit();
        break;
      case 'cash':
        this.cashPaymentSubmit();
        break;
      case 'transfer':
        this.paymentTransferSubmit();
        break;
    }
  }

  /**
   * This function handles the submission of a card payment using the Kushki payment gateway, either
   * for a one-time payment or a subscription.
   * @returns nothing (void).
   */
  private cardPaymentSubmit(): void {
    if (this.formCardPayment.invalid) {
      return;
    }

    this.formCardPayment.disable({
      emitEvent: false
    });
    this.screenSplash.show('Validando transacción...');

    const dueDate: string = this.formCardControl['dueDate'].value.split('/');

    this.kushki.requestToken(
      {
        amount: this.paymentInfo.payment.amount,
        currency: this.paymentInfo.payment?.currency,
        card: {
          name: this.formCardControl['names'].value.trim(),
          number: this.formCardControl['cardNumber'].value,
          cvc: this.formCardControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      }, (response): void => {
        const res: ITokenResponse | ITokenOTPResponse | IToken3DSResponse | ITokenErrorResponse = response;

        this.screenSplash.hide();

        if (res['code'] === paymentResponseCodes.DECLINED) {
          this.enableForms();
          this.messageInfo = String.messageErrors.declined;
          return;
        }

        if (!res['token']) {
          this.enableForms();
          this.messageInfo = String.messageErrors.errorValidateTransaction;
          return;
        }

        this.processPayment(res);
      });
  }

  /**
   * This function submits a cash payment request using the Kushki API and displays a spinner while
   * waiting for a response.
   */
  private cashPaymentSubmit(): void {
    if (this.formCashPayment.invalid) {
      return;
    }

    this.formCashPayment.disable({
      emitEvent: false
    });

    this.screenSplash.show('Generando orden de pago...');

    this.kushki.requestCashToken(
      {
        name: this.formCashControl['names'].value,
        lastName: this.formCashControl['surnames'].value,
        identification: this.formCashControl['documentNumber'].value.toString(),
        documentType:
        this.formCashControl['documentType'].value,
        email: this.formCashControl['email'].value,
        totalAmount: this.paymentInfo.payment.amount,
        currency: this.paymentInfo.payment?.currency as any,
        description: this.paymentInfo.productName,
      }, (response: any): void => {
        const res: { token: string } = response;

        this.screenSplash.hide();

        if (!res.token) {
          this.enableForms();
          this.messageInfo = String.messageErrors.errorGeneratingPaymentOrder;
          return;
        }

        this.processPayment(res);
      });
  }

  /**
   * This function submits a payment transfer request using the Kushki API with the provided payment
   * and customer information.
   */
  private paymentTransferSubmit(): void {
    if (this.formPaymentTransfer.invalid) {
      return;
    }

    this.formPaymentTransfer.disable({
      emitEvent: false
    });

    this.screenSplash.show();

    this.kushki.requestTransferToken(
      {
        documentType:
          +this.formPaymentTransferControl['documentType'].value === 2
            ? 'DNI'
            : 'CE',
        documentNumber:
          this.formPaymentTransferControl['documentNumber'].value.toString(),
        paymentDescription: 'Pago con Tranferencia',
        email: this.formPaymentTransferControl['email'].value,
        currency: this.paymentInfo.payment?.currency as any,
        amount: {
          subtotalIva: 0,
          subtotalIva0: this.paymentInfo.payment.amount,
          iva: 0,
        },
      }, (response: any): void => {
        const res: { token: string } = response;

        this.screenSplash.hide();

        if (!res.token) {
          this.enableForms();
          this.messageInfo = String.messageErrors.errorGeneratingPaymentOrder;
          return;
        }

        this.processPayment(res);
      }
    );
  }

  // tslint:disable-next-line:max-line-length
  private processPayment(tokenInfo: ITokenResponse | ITokenOTPResponse | IToken3DSResponse | ITokenErrorResponse): void {
    const payload = {
      idProceso: this.idTokenSesion,
      token: tokenInfo['token']
    };

    let observable;

    switch (this.paymentMethod) {
      case 'card':
        if(this.paymentInfo.payment.isSubscription) {
            this.cardPaymentSubscription(tokenInfo);
            return;
          }
        this.validateCardPayment(tokenInfo);
        return;
      case 'cash':
        observable = this.kushkiService.processCashPayment(payload);
        break;
      case 'transfer':
        observable = this.kushkiService.processPaymentTransfer(payload);
        break;
    }

    this.screenSplash.show('Validando información...');

    observable.subscribe({
      next: (response): void => {

        this.screenSplash.hide();

        if (!response.idPayment) {
          this.messageInfo = String.messageErrors.errorValidatePayment;

          this.enableForms();
          return;
        }

        this.result.emit({
          success: response.success,
          message: 'Se generó correctamente el PIN de pago',
          paymentInfo: {
            processId: this.idTokenSesion,
            token: tokenInfo['token'],
            pin: response.pin,
            paymentMethod: this.paymentInfo.payment.isSubscription ? 'subscription' : this.paymentMethod
          }
        });
        this.enableForms();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.screenSplash.hide();
        this.messageInfo = String.messageErrors.errorGeneric;

        this.enableForms();
      }
    });
  }

  private cardPaymentSubscription(tokenInfo: ITokenResponse | ITokenErrorResponse): void {
    this.screenSplash.show('Validando transacción...');

    const dueDate: string = this.formCardControl['dueDate'].value.split('/');

    this.kushki.requestSubscriptionToken(
      {
        currency: this.paymentInfo.payment?.currency,
        card: {
          name: this.formCardControl['names'].value.trim(),
          number: this.formCardControl['cardNumber'].value,
          cvc: this.formCardControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      }, (response): void => {
        const res: ITokenResponse | ITokenErrorResponse = response;

        this.screenSplash.hide();

        if (res['code'] === paymentResponseCodes.DECLINED) {
          this.enableForms();
          this.messageInfo = String.messageErrors.declined;
          return;
        }

        if (!res['token']) {
          this.enableForms();
          this.messageInfo = String.messageErrors.errorValidateTransaction;
          return;
        }

        this.validateCardPayment(tokenInfo, res);
      });
  }

  // tslint:disable-next-line:max-line-length
  private validateCardPayment(tokenInfo: ITokenResponse | ITokenOTPResponse | IToken3DSResponse | ITokenErrorResponse, tokenSubscription?: ITokenResponse | ITokenErrorResponse): void {
    if (tokenSubscription) {
        this.emitValues(tokenInfo, tokenSubscription, true);
      } else {
        this.emitValues(tokenInfo, undefined, true);
      }
    return;

    // switch (tokenInfo['secureService']) {
    //   case 'KushkiOTP':
    //     this.validateOTP(tokenInfo as ITokenOTPResponse, tokenSubscription);
    //     break;
    //   case '3dsecure':
    //     this.validate3DS(tokenInfo as IToken3DSResponse, tokenSubscription);
    //     break;
    // }
  }

//   private validateOTP(payload: ITokenOTPResponse): void {

//   }

//   private validate3DS(payload: IToken3DSResponse): void {
//     if (!payload.security.authRequired) {
//       this.emitValues(payload, true);
//       return;
//     }

//     this.kushki.requestValidate3DS({
//       secureId: payload.secureId,
//       security: payload.security
//     }, (response: any): void => {
//       this.emitValues(payload,  true);
//     });
//   }

  private emitValues(info: any, tokenSubscription: any, success: boolean): void {
    this.result.emit({
      success,
      message: '',
      paymentInfo: {
        processId: this.idTokenSesion,
        token: info['token'],
        tokenSubscription:  tokenSubscription ? tokenSubscription['token'] : '',
        secureId: info['secureId'],
        paymentMethod: this.paymentInfo.payment.isSubscription ? 'subscription' : this.paymentMethod
      }
    });
  }
}
