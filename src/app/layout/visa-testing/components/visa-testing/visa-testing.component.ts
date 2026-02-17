import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

import { UtilsService } from '@shared/services/utils/utils.service';
import { VisaTestingService } from '../../shared/services/visa-testing.service';

import { AppConfig } from '@root/app.config';
import { RegularExpressions } from '@shared/regexp/regexp';
import { IVisaConfig } from '@shared/interfaces/visa-config.interface';
import { v4 as uuid } from 'uuid';
import { IParamaters } from '../../shared/interfaces/parameters.interface';

@Component({
  selector: 'app-visa-testing',
  templateUrl: './visa-testing.component.html',
  styleUrls: ['./visa-testing.component.sass'],
})
export class VisaTestingComponent implements OnInit, OnDestroy {
  form: FormGroup = this.builder.group({
    branch: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    product: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    merchantId: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    channel: [null, Validators.required],
    documentType: [2, Validators.required],
    documentNumber: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    clientName: [null],
    names: [null],
    apePat: [null],
    apeMat: [null],
    phoneNumber: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
      ]),
    ],
    email: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.email),
        Validators.required,
      ]),
    ],
    currencyType: [1, Validators.required],
    ammount: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.decimal),
        Validators.required,
      ]),
    ],
    generate: [1, Validators.required],
    processId: [null],
  });

  parameters$: any;
  channelTypes$: Array<any>;
  currencyTypes$: Array<any>;
  merchanIdList$: Array<any>;

  sessionVisa: any = null;

  @ViewChild('visaPay', { static: false, read: ElementRef })
  visaPay: ElementRef;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService,
    private readonly visaTestingService: VisaTestingService
  ) {}

  ngOnInit(): void {
    this.valueChangesForm();
    this.getSessionToken();
  }

  ngOnDestroy(): void {
    sessionStorage.clear();
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  valueChangesForm(): void {
    this.formControl['generate'].valueChanges.subscribe((value) => {
      if (value == 0) {
        this.formControl['processId'].setValidators(Validators.required);
      } else {
        this.formControl['processId'].clearValidators();
      }

      this.formControl['processId'].updateValueAndValidity();
    });
  }

  getSessionToken(): void {
    this.spinner.show();
    this.utilsService.getToken().subscribe({
      next: (response: string) => {
        localStorage.setItem('token', response);
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

  getParameters(): void {
    this.spinner.show();
    const payload = {
      branchId: +this.formControl['branch'].value,
      productId: +this.formControl['product'].value,
    };

    this.visaTestingService.getParameters(payload).subscribe({
      next: (response: Array<IParamaters>) => {
        console.dir(response);
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

  getVisaToken(): void {
    if (this.form.invalid) {
      return;
    }

    this.spinner.show();

    const req: any = {
      codigoComercio: +this.formControl['merchantId'].value,
      tipoCanal: this.formControl['channel'].value,
      montoCobro: this.formControl['ammount'].value,
      codigoCanal: 2015000002,
      idUsuario: 3822,
      idRamo: this.formControl['branch'].value,
      idProducto: this.formControl['product'].value,
      idMoneda: this.formControl['currencyType'].value,
      externalId: uuid(),
      idTipoDocumento: this.formControl['documentType'].value,
      numeroDocumento: this.formControl['documentNumber'].value,
      email: this.formControl['email'].value,
      generar: this.formControl['generate'].value == 1,
      idProceso: this.formControl['processId'].value || 0,
      nombres:
        this.formControl['documentType'].value != 1
          ? this.formControl['names'].value
          : null,
      apellidoPaterno:
        this.formControl['documentType'].value != 1
          ? this.formControl['apePat'].value
          : null,
      apellidoMaterno:
        this.formControl['documentType'].value != 1
          ? this.formControl['apeMat'].value
          : null,
      razonSocial:
        this.formControl['documentType'].value == 1
          ? this.formControl['clientName'].value
          : null,
      telefono: this.formControl['phoneNumber'].value,
    };

    this.visaTestingService.getSessionToken(req).subscribe({
      next: (response: any) => {
        this.sessionVisa = response;
        console.log(response);
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

  insertVisaScript(): void {
    const visaConfigPayload: IVisaConfig = {
      action: `${AppConfig.ACTION_VISA_PAY}/${btoa(
        AppConfig.DOMAIN_URL + '/visa/summary'
      )}`,
      channel: this.formControl['channel'].value,
      ammount: this.formControl['ammount'].value,
      buttonText: `${
        this.formControl['currencyType'].value == 1 ? 'S/' : '$'
      } ${this.formControl['ammount'].value}`,
      email: this.formControl['email'].value,
      lastName: `${this.formControl['apePat'].value} ${this.formControl['apeMat'].value}`,
      name: this.formControl['names'].value,
      merchantId: +this.formControl['merchantId'].value,
      token: this.sessionVisa.niubiz.sessionNiubiz,
      purchaseNumber: this.sessionVisa.niubiz.numeroCompra,
    };

    const sessionPayload = {
      ...this.form.getRawValue(),
      processId: this.sessionVisa.idPayment,
      channel: 2015000002,
      paymentType: this.formControl['channel'].value,
    };

    sessionStorage.setItem('visa-testing-ps', JSON.stringify(sessionPayload));

    this.utilsService.openVisaCheckout(this.visaPay, visaConfigPayload);
  }
}
