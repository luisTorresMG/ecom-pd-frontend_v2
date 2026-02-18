import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { PaymentVisaResponse } from '../../layout/vidaindividual-latest/models/payment-visa.model';
import { PaymentService } from '../shared/services/payment.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { ClientInfoService } from '../shared/services/client-info.service';
import { GoogleTagService } from '../shared/services/google-tag-service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  dataPago: {
    idProcess: number;
    token?: string;
    idClienteGoogle: string;
    idSesionTransaccion: string;
  } = {
    idProcess: null,
    token: null,
    idClienteGoogle: null,
    idSesionTransaccion: null,
  };
  responseConsultaPago: PaymentVisaResponse;
  isCalledConsultaEstado: boolean;
  isSucess: number;
  tryStep: boolean;
  insuranceType: any;
  insuranceCategory: any;
  errorEmision: any;
  errorDesc: string;
  idSessionGA4: string = '_ga_K3XX963LFH';

  @ViewChild('emissionMessage', { static: true, read: TemplateRef })
  _emissionMessage: TemplateRef<any>;

  constructor(
    private readonly _Router: Router,
    private readonly _ActivatedRoute: ActivatedRoute,
    private readonly _PaymentService: PaymentService,
    private readonly _vc: ViewContainerRef,
    private readonly _ga: GoogleAnalyticsService,
    private readonly clientInfoService: ClientInfoService,
    private readonly gts: GoogleTagService
  ) {
    this.dataPago.idProcess = this.insurance?.processId;
    this.dataPago.token = this._ActivatedRoute.snapshot.paramMap.get('id');
    this.dataPago.idClienteGoogle = this.clientInfoService.getClientID();
    this.dataPago.idSesionTransaccion = this.clientInfoService.getSessionID();
    this.isCalledConsultaEstado = false;
    this.isSucess = 1;
    this.tryStep = false;
  }

  ngOnInit(): void {
    this._ga.emitGenericEventAP('Visualiza resumen de VISA');

    this._ActivatedRoute.params.subscribe(
      (params) => (
        (this.insuranceType = params.insuranceType),
        (this.insuranceCategory = params.insuranceCategory)
      )
    );
    this.validatePayment();
  }

  ngOnDestroy(): void {
    if (!this.tryStep) {
      const idSesion = sessionStorage.getItem('0FF2C61A');
      sessionStorage.clear();
      if (!!idSesion) {
        sessionStorage.setItem('0FF2C61A', idSesion);
      }
    }
  }

  private validatePayment(): void {
    if (this.paymentResponse?.paied) {
      this.responseConsultaPago = this.paymentResponse;
      this.isCalledConsultaEstado = true;
      if (
        this.paymentResponse['result'] &&
        this.paymentResponse['paied'] &&
        !this.paymentResponse['hasError']
      ) {
        this.isSucess = 2;
      }
      if (
        this.paymentResponse['result'] &&
        !this.paymentResponse['paied'] &&
        this.paymentResponse['hasError']
      ) {
        this.errorDesc = this.paymentResponse.errorDesc;
        this.isSucess = 3;
      }
      if (
        this.paymentResponse['result'] &&
        this.paymentResponse['paied'] &&
        this.paymentResponse['hasError']
      ) {
        this.isSucess = 4;
        this.errorEmision = {
          title: null,
          // tslint:disable-next-line:max-line-length
          desc: `Hemos recibido tu pago, en unos momentos estaremos enviando la póliza a tu correo.`,
        };
        this._vc.createEmbeddedView(this._emissionMessage);
      }
      if (
        !this.paymentResponse['result'] &&
        !this.paymentResponse['paied'] &&
        this.paymentResponse['hasError']
      ) {
        this.isCalledConsultaEstado = false;
        this.isSucess = 3;
        console.log('error');
      }
    } else {
      this.paymentState();
    }
  }

  private paymentState(): void {
    this._PaymentService.consultarEstadoPago(this.dataPago as any).subscribe(
      (res: any) => {
        this.responseConsultaPago = res;
        this.isCalledConsultaEstado = true;
        if (res.success) {
          this.isSucess = 2;
          sessionStorage.setItem(
            'visa-payment-response',
            JSON.stringify({
              result: true,
              paied: true,
              hasError: false,
              ...this.responseConsultaPago,
              tokenVisa: this.dataPago.token,
            })
          );
          this._ga.emitGenericEventAP(
            'Pagó con VISA',
            this.planSelected?.plan?.prima,
            this.currencyDesc
          );

          const tagManagerPayload = {
            event: 'virtualEventGA4_A6',
            Producto: 'Accidentes Personales',
            Paso: 'Paso 4',
            Sección: 'Resumen de compra',
            TipoAcción: 'Visualizar confirmación',
            CTA: 'Pago Visa',
            CheckTerminos: this.insurance.checkTerminosAsistencia
              ? 'Activado'
              : 'Desactivado',
            ProgramaAsistencia: this.insurance.checkProgramaAsistencia
              ? 'Activado'
              : 'Desactivado',
            tipoPlan: this.planSelected.plan?.descripcion,
            NombreSeguro: this.insurance.namePlan,
            TipoDocumento:
              this.insurance.documentType == 1
                ? 'RUC'
                : this.insurance.documentType == 2
                ? 'DNI'
                : 'CE',
            TipoMoneda: this.insurance.idMoneda == 1 ? 'Soles' : 'Dólares',
            Vigencia: this.insurance.frecuenciaPago?.descripcion,
            InicioVigencia: moment(this.insurance.startValidity).format(
              'DD/MM/YYYY'
            ),
            FinVigencia: this.insurance.endValidity,
            NumBeneficiarios:
              this.insurance.insuranceInfo.cantidadBeneficiarios,
            NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
            Ocupacion: this.insurance.actividad?.descripcion,
            pagePath: window.location.pathname,
            timeStamp: new Date().getTime(),
            user_id: this.insurance.id,
            TipoCliente: this.insurance.tipoCliente,
            ID_Proceso: this.insurance.processId,
            Canal: 'Venta Directa',
          };
          this.gts.virtualEvent(tagManagerPayload);

          const tagManagerPayloadPurchase = {
            event: 'purchase',
            CheckTerminos: this.insurance.checkTerminosAsistencia
              ? 'Activado'
              : 'Desactivado',
            ProgramaAsistencia: this.insurance.checkProgramaAsistencia
              ? 'Activado'
              : 'Desactivado',
            tipoPlan: this.planSelected.plan?.descripcion,
            NombreSeguro: this.insurance.namePlan,
            TipoDocumento:
              this.insurance.documentType == 1
                ? 'RUC'
                : this.insurance.documentType == 2
                ? 'DNI'
                : 'CE',
            TipoMoneda: this.insurance.idMoneda == 1 ? 'Soles' : 'Dólares',
            Vigencia: this.insurance.frecuenciaPago?.descripcion,
            InicioVigencia: moment(this.insurance.startValidity).format(
              'DD/MM/YYYY'
            ),
            FinVigencia: this.insurance.endValidity,
            NumBeneficiarios:
              this.insurance.insuranceInfo.cantidadBeneficiarios,
            NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
            Ocupacion: this.insurance.actividad?.descripcion,
            pagePath: window.location.pathname,
            timeStamp: new Date().getTime(),
            user_id: this.insurance.id,
            TipoCliente: this.insurance.tipoCliente,
            ID_Proceso: this.insurance.processId,
            Canal: 'Venta Directa',
            ecommerce: {
              transaction_id: this.insurance.processId,
              value: this.planSelected?.plan?.prima,
              currency: this.insurance.idMoneda == 1 ? 'PEN' : 'USD',
              items: [
                {
                  item_id: 61,
                  item_name: this.insurance.namePlan,
                  price: this.planSelected?.plan?.prima,
                  item_brand: 'Protecta',
                  item_category: 'Accidentes Personales',
                  item_variant: this.insurance.variant,
                  quantity: 1,
                },
              ],
            },
          };
          this.gts.virtualEvent(tagManagerPayloadPurchase);
        } else {
          this.errorDesc = res.errorDesc;
          this.isSucess = 3;
          sessionStorage.setItem(
            'visa-payment-response',
            JSON.stringify({
              result: true,
              paied: false,
              hasError: true,
              ...this.responseConsultaPago,
              tokenVisa: this.dataPago.token,
            })
          );
          this._ga.emitGenericEventAP(
            'Consulta pago VISA',
            this.planSelected?.plan?.prima,
            'Ocurrió un error en la emisión',
            2
          );
        }
        switch (this.responseConsultaPago.errorCode) {
          case 'ERROR_EMISION':
            this.isSucess = 4;
            this.errorEmision = {
              title: null,
              // tslint:disable-next-line:max-line-length
              desc: `Hemos recibido tu pago, en unos momentos estaremos enviando la póliza a tu correo.`,
            };
            sessionStorage.setItem(
              'visa-payment-response',
              JSON.stringify({
                result: true,
                paied: true,
                hasError: true,
                ...this.responseConsultaPago,
                tokenVisa: this.dataPago.token,
              })
            );
            this._vc.createEmbeddedView(this._emissionMessage);
            // tslint:disable-next-line:max-line-length
            this._ga.emitGenericEventAP(
              'Consulta pago VISA',
              this.planSelected?.plan?.prima,
              'Pagó con VISA pero ocurrió un error en la emisión',
              2
            );
            break;
        }
      },
      (err: any) => {
        console.error(err);
        this.isCalledConsultaEstado = false;
        this.isSucess = 3;
        sessionStorage.setItem(
          'visa-payment-response',
          JSON.stringify({
            result: false,
            paied: false,
            hasError: true,
            tokenVisa: this.dataPago.token,
          })
        );
        this._ga.emitGenericEventAP(
          'Consulta pago VISA',
          this.planSelected?.plan?.prima,
          'Error al pagar con VISA',
          2
        );
      }
    );
  }

  backToInit(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this._Router.navigate(['/accidentespersonales']);
  }

  intentarDeNuevo(): void {
    this.tryStep = true;
    sessionStorage.removeItem('dataNiubiz');
    this._ga.emitGenericEventAP(`Clic en 'Reintentar Pago'`);
    const productKeys = JSON.parse(sessionStorage.getItem('product-keys'));
    this._Router.navigate([
      `/accidentespersonales/${productKeys.category}/${productKeys.product}/step-4/payment-method`,
    ]);
  }

  get paymentResponse(): any {
    return JSON.parse(sessionStorage.getItem('visa-payment-response') || '{}');
  }

  get idProductCategory(): number {
    return Number(JSON.parse(sessionStorage.getItem('insurance'))?.categoryId);
  }

  get nombreCotizador(): string {
    if (this.idProductCategory === 1) {
      return `${this.insurance?.name} ${this.insurance?.lastname} ${this.insurance?.surname}`;
    }
    return `${this.insurance?.name}`;
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get planSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected'));
  }

  get fecha(): string {
    const fecha = new Date(this.insurance?.startValidity);
    return `${fecha?.getDate()}/${
      fecha?.getMonth() + 1
    }/${fecha?.getFullYear()}`;
  }

  get currencyDescription(): string {
    switch (+this.insurance?.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  private get currencyDesc(): string {
    switch (+this.insurance?.idMoneda) {
      case 1:
        return 'Soles';
      default:
        return 'Dólares';
    }
  }
}
