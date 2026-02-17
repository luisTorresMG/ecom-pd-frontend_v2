import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-payment-visa-success',
  templateUrl: './payment-visa-success.component.html',
  styleUrls: ['./payment-visa-success.component.scss'],
})
export class PaymentVisaSuccessComponent implements OnInit {
  dataPago = {
    idProceso: null,
    token: null,
    tipoPago: null,
    idClienteGoogle: null,
    idSesionTransaccion: null,
  };

  isSucess: number;
  isCalledConsultaEstado: boolean;
  errorDesc: string;

  responseConsultaPago: any;
  emissionResult: {
    success: boolean;
    policy: string;
    origen: string;
  } = sessionStorage.getItem('kushki-vidagrupo-result')
    ? JSON.parse(sessionStorage.getItem('kushki-vidagrupo-result') ?? '{}')
    : undefined;

  errorEmision: any;

  @ViewChild('emissionError', { static: true, read: TemplateRef })
  _emissionError!: TemplateRef<any>;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly checkoutService: CheckoutService,
    private readonly spinner: NgxSpinnerService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly router: Router
  ) {
    this.dataPago.idProceso = +this.insurance?.cotizacionInfo?.idProceso;
    this.dataPago.token = this.activatedRoute.snapshot.paramMap.get('id');
    this.dataPago.idClienteGoogle = this.checkoutService.getClientID();
    this.dataPago.idSesionTransaccion = this.checkoutService.getSessionID();
    this.dataPago.tipoPago = 1;
    this.isSucess = 1;
    this.isCalledConsultaEstado = false;
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    const resKushki = JSON.parse(sessionStorage.getItem('kushki-payload'));
    const resNiubizz = JSON.parse(sessionStorage.getItem('niubiz_pay'));

    if (resKushki) {
      if (!this.emissionResult) {
        this.consultarPagoKushki();
        return;
      }
      this.setDataPay(this.emissionResult);
      return;
    }

    if (!resNiubizz) {
      this.consultarPagoNiubizz();
      return;
    }
    this.setDataPay(resNiubizz);
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get nombreCotizador(): string {
    if (this.insurance.contratanteInfo.idTipoDocumento != 1) {
      return `${this.insurance?.contratanteInfo?.nombres} ${this.insurance?.contratanteInfo?.apellidoPaterno} ${this.insurance?.contratanteInfo?.apellidoMaterno}`;
    }
    return `${this.insurance?.contratanteInfo?.nombres}`;
  }

  get currencyType(): string {
    switch (+this.insurance?.cotizacionInfo?.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  validatePayment(): void {
    this.consultarPagoNiubizz();
  }

  private consultarPagoKushki(): void {
    this.viewContainerRef.clear();
    const payload = JSON.parse(sessionStorage.getItem('kushki-payload'));
    this.checkoutService.emission(payload).subscribe(
      (response): void => {
        sessionStorage.setItem(
          'kushki-vidagrupo-result',
          JSON.stringify(response)
        );
        this.setDataPay(response);
      },
      (err: HttpErrorResponse): void => {
        console.error(err);
        this.isCalledConsultaEstado = false;
        this.isSucess = 3;
      }
    );
  }

  consultarPagoNiubizz(): void {
    this.checkoutService.emission(this.dataPago).subscribe({
      next: (response: any) => {
        sessionStorage.setItem('niubiz_pay', JSON.stringify(response));
        this.setDataPay(response);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.isCalledConsultaEstado = true;
        this.isSucess = 3;
      },
    });
  }

  private setDataPay(res): void {
    this.responseConsultaPago = res;
    this.emissionResult = res;
    this.isCalledConsultaEstado = true;
    this.errorDesc = res.errorDesc || res.message;

    if (res.success) {
      this.isSucess = 2;
    } else {
      this.isSucess = 3;
      switch (this.responseConsultaPago.codigoError) {
        case 'ERROR_EMISION':
          this.isSucess = 4;
          this.errorEmision = {
            title: null,
            desc: `Hemos recibido tu pago, en unos momentos estaremos enviando la póliza a tu correo.`,
          };

          this.viewContainerRef.createEmbeddedView(this._emissionError);
          break;
      }
    }
  }

  intentarDeNuevo(): void {
    sessionStorage.removeItem('niubiz_pay');
    sessionStorage.removeItem('kushki-vdp-result');
    sessionStorage.removeItem('dataNiubiz');
    this.router.navigate([
      `/vidagrupo/payment/${this.insurance?.cotizacionInfo?.idProceso}`,
    ]);
  }
}
