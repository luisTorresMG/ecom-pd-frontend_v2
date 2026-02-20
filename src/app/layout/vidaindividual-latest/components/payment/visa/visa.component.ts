// tslint:disable-next-line:max-line-length
import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentsService } from '../../../services/payments.service';
import { PaymentVisaResponse } from '../../../models/payment-visa.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationRequest } from '../../../models/notification.model';
import { MainService } from '../../../services/main/main.service';
import moment from 'moment';
import { IPaymentVisa } from '../../../interfaces/payment.interface';
import { AppConfig } from '@root/app.config';
import { HttpErrorResponse } from '@angular/common/http';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';

@Component({
  standalone: false,
  selector: 'app-visa',
  templateUrl: './visa.component.html',
  styleUrls: ['./visa.component.css'],
})
export class VisaComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  detalleCompra: any;
  USER_INFO: any;
  nombreCotizador: string;
  resumenAtp: any;
  dataContratanteNotSame: any;
  contractor: any;
  asecureContractor: boolean;
  nombreContratante: string;
  nombreAsegurado: string;
  dataPago: { idProcess: number; token?: string } = {
    idProcess: null,
    token: null,
  };
  responseConsultaPago: any;
  isCalledConsultaEstado: boolean;
  methodPay: string;
  isSucess: number;
  tryStep: boolean;

  itemsBeneficios: any = [];
  baseUrlBeneficios: string;

  errorDesc: string;

  request: any;

  errorEmision: any;

  emissionResult: {
    success: boolean,
    policy: string,
    origen: string
  } = sessionStorage.getItem('kushki-vdp-result') ? JSON.parse(sessionStorage.getItem('kushki-vdp-result') ?? '{}') : undefined;

  @ViewChild('modalBeneficios', { static: true, read: ModalDirective })
  modalBeneficios: ModalDirective;
  @ViewChild('emissionError', { static: true, read: TemplateRef })
  _emissionError!: TemplateRef<any>;

  constructor(
    private readonly _Router: Router,
    private readonly _ActivatedRoute: ActivatedRoute,
    private readonly _PaymentsService: PaymentsService,
    private readonly _mainService: MainService,
    private readonly _vc: ViewContainerRef,
    private readonly _cd: ChangeDetectorRef,
    private readonly trackingService: TrackingService
  ) {
    this.resumenAtp = JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
    this.dataContratanteNotSame = JSON.parse(sessionStorage.getItem('dataContratanteNotSame')) || null;
    this.contractor = JSON.parse(sessionStorage.getItem('infoContratante')) || null;

    if (this.contractor != null) {
      this.asecureContractor = this.contractor.p_SDOCUMENT != this.user.p_SDOCUMENT ? true : false;
      this.nombreContratante = this.contractor['p_SCLIENT_NAME']?.toString() + ' ' +
        this.contractor['p_SCLIENT_APPPAT']?.toString() || '';
    } else {
      this.asecureContractor = false;
      this.nombreContratante = '';
    }

    this.detalleCompra = JSON.parse(sessionStorage.getItem('step2'));
    this.USER_INFO = JSON.parse(sessionStorage.getItem('step1'));
    this.nombreCotizador = this.user['p_SCLIENT_NAME']?.toString();
    this.nombreAsegurado = this.user['p_SCLIENT_NAME']?.toString() + ' ' + this.user['p_SCLIENT_APPPAT']?.toString();
    this.dataPago.idProcess = this.detalleCompra.idProcess;
    this.dataPago.token = this._ActivatedRoute.snapshot.paramMap.get('id');
    this.methodPay = this._ActivatedRoute.snapshot.paramMap
                         .get('method-pay')
                         ?.toString()
                         ?.toUpperCase();
    this.isCalledConsultaEstado = false;
    this.isSucess = 1;
    this.tryStep = false;
    this.baseUrlBeneficios = 'assets/vidaindividual/beneficios';
    this.itemsBeneficios = [
      {
        img: `${this.baseUrlBeneficios}/beneficio-4.svg`,
        desc: 'Tu salud primero',
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-5.svg`,
        desc: 'Un tiempo para ti',
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-3.svg`,
        desc: 'Date un gusto',
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-1.svg`,
        desc: 'Sorteos',
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-6.svg`,
        desc: 'Para tu auto',
        small: null,
      },
      {
        img: `${this.baseUrlBeneficios}/beneficio-2.svg`,
        desc: 'Emprendimientos sociales',
        small: null,
      },
    ];

    let asesor: any = sessionStorage.getItem('resumen-atp');
    if (asesor) {
      asesor = JSON.parse(asesor);
    } else {
      asesor = {};
    }

    this.request = {
      idProcess: this.plan.idProcess,
      token: this.dataPago.token,
      parametros: {
        correoAsesor:
          asesor?.cotizacionInfo?.correoAsesor?.toLowerCase() || null,
        nombreAsesor: asesor?.cotizacionInfo?.nombreAsesor || null,
        asegurado: this.namesComplete || '',
        cantidadAnios: this.plan.cantidadAnio,
        correo: this.insurance.email,
        fechaNacimiento: this.insurance.fechaNac,
        fechaSolicitud: moment(new Date()).format('DD/MM/YYYY').toString(),
        telefono: this.insurance.telefono,
        experianRisk: this.pep.experianRisk,
        idProcess: this.plan.idProcess,
        isFamPep: this.validity.isFamPep,
        isIdNumber: this.validity.isIdNumber,
        isIdNumberFamPep: this.validity.isIdNumberFamPep,
        isIdNumberWC: this.pep.idIdNumberWC,
        isOtherList: this.validity.isOtherList,
        isOtherListWC: this.pep.isOtherListWC,
        isPep: this.pep.isPep,
        isPepWC: this.validity.isPepWC,
        monedaDescripcion: this.getCurrencyDescription(this.plan.moneda),
        monedaSimbolo: this.getCurrencySimbol(this.plan.moneda),
        nroDocumento: this.insurance.nDoc,
        porcentajeDevolucion: this.plan.porcentajeRetorno,
        idFrecuencia: +this.plan.idFrecuencia,
        frecuencia: this.plan.frecuencia,
        descPrima: Number(this.plan.descPrima),
        descPrimeraCuota: Number(this.plan.descPrimeraCuota),
        capital: `${this.getCurrencySimbol(this.plan.moneda)} ${Number(
          this.plan.capital || '0'
        )?.toFixed(2)}`,
        primaAnual: `${this.getCurrencySimbol(this.plan.moneda)} ${Number(
          this.plan.primaAnual || '0'
        )?.toFixed(2)}`,
        primaFallecimiento: `${this.getCurrencySimbol(
          this.plan.moneda
        )} ${Number(this.plan.primaFallecimiento || '0')?.toFixed(2)}`,
        primaInicial: `${this.getCurrencySimbol(this.plan.moneda)} ${Number(
          this.plan.primaInicial || '0'
        )?.toFixed(2)}`,
        primaMensual: `${this.getCurrencySimbol(this.plan.moneda)} ${Number(
          this.plan.primaMensual || '0'
        )?.toFixed(2)}`,
        primaRetorno: `${this.getCurrencySimbol(this.plan.moneda)} ${Number(
          this.plan.primaRetorno || '0'
        )?.toFixed(2)}`,
        tipoNotificacion: 'ErrorEmisionVidaIndividual',
      },
    };
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const resKushki = JSON.parse(sessionStorage.getItem('kushki-payload'));
    const resNiubizz = JSON.parse(sessionStorage.getItem('_str_pay'));

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

  ngAfterViewChecked(): void {
    this._cd.detectChanges();
  }

  private get tarifario(): any {
    return JSON.parse(sessionStorage.getItem('step2'));
  }

  private setDataPay(res): void {
    this.responseConsultaPago = res;
    this.emissionResult = res;
    this.isCalledConsultaEstado = true;
    this.errorDesc = res.errorDesc || res.message;

    if (res.success) {
      this.isSucess = 2;
      this.modalBeneficios.show();

      const gtmlTrackingPayload = {
        eventName: 'purchase',
        payload: {
          'CoberturaProtección': this.tarifario.capital,
          'Frecuencia': this.tarifario.frecuencia,
          'Periodo': `${this.tarifario.cantidadAnio} años`,
          'Devolución': `${this.tarifario.porcentajeRetorno}%`,
          'CoberturaDevolución': this.tarifario.primaRetorno,
          'Precio': (+this.tarifario.primaInicial).toFixed(2),
          'MétodoPago': 'Visa/Mastercard',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa',
          'ecommerce': {
            'transaction_id': sessionStorage.getItem('idProcess'),
            'value': (+this.tarifario.primaInicial).toFixed(2),
            'currency': this.tarifario.moneda == 1 ? 'PEN' : 'USD',
            'items': [{
              'item_id': 71,
              'item_name': 'Vida Devolución Protecta',
              'price': (+this.tarifario.primaInicial).toFixed(2),
              'item_brand': 'Protecta',
              'item_category': 'Seguros Vida',
              'quantity': 1
            }]
          }
        }
      };
      this.trackingService.gtmTracking(gtmlTrackingPayload);

      const gtmlTrackingSuccessPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 4',
          'Sección': 'Resumen de compra',
          'TipoAcción': 'Visualizar confirmación',
          'CTA': '',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa',
        }
      };
      this.trackingService.gtmTracking(gtmlTrackingSuccessPayload);

    } else {
      this.isSucess = 3;
      switch (this.responseConsultaPago.errorCode) {
        case 'ERROR_EMISION':
          this.isSucess = 4;
          this.errorEmision = {
            title: null,
            // tslint:disable-next-line:max-line-length
            desc: `Hemos recibido tu pago, en unos momentos estaremos enviando la póliza a tu correo.`,
          };
          this._vc.createEmbeddedView(this._emissionError);
          break;
      }
    }
  }

  private consultarPagoKushki(): void {
    this._vc.clear();
    const payload = JSON.parse(sessionStorage.getItem('kushki-payload'));
    this._PaymentsService.emission(payload).subscribe(
      (response): void => {
        console.dir(response);
        sessionStorage.setItem('kushki-vdp-result', JSON.stringify(response));
        this.setDataPay(response);
      },
      (err: HttpErrorResponse): void => {
        console.error(err);
        this.isCalledConsultaEstado = false;
        this.isSucess = 3;
      }
    );
  }

  private consultarPagoNiubizz(): void {
    this._vc.clear();

    this._PaymentsService.consultarEstadoPago(this.request).subscribe(
      (response): void => {
        console.dir(response);
        sessionStorage.setItem('_str_pay', JSON.stringify(response));
        this.setDataPay(response);
      },
      (err: HttpErrorResponse): void => {
        console.error(err);
        this.isCalledConsultaEstado = false;
        this.isSucess = 3;
      }
    );
  }

  ngOnDestroy(): void {
    if (!this.tryStep) {
      sessionStorage.clear();
    }
  }

  getCurrencyDescription(val): string {
    if (Number(val) === 1) {
      return 'Soles';
    }
    return 'Dólares';
  }

  getCurrencySimbol(val): string {
    if (Number(val) === 1) {
      return 'S/';
    }
    return '$';
  }

  get validity(): any {
    return JSON.parse(sessionStorage.getItem('validity'));
  }

  get pep(): any {
    return JSON.parse(sessionStorage.getItem('clientePep'));
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('step1'));
  }

  get plan(): any {
    return JSON.parse(sessionStorage.getItem('step2'));
  }

  get namesComplete(): string {
    return `${this.user.p_SCLIENT_NAME || ''} ${
      this.user.p_SCLIENT_APPPAT || ''
    } ${this.user.p_SCLIENT_APPMAT || ''}`?.trim();
  }

  backToInit(): void {
    const gtmTrackingPayload = {
      eventName: 'virtualEventGA4_E',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 4',
        'Sección': 'Resumen de compra',
        'TipoAcción': 'Seleccionar botón',
        'CTA': 'Volver al inicio',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa',
      }
    };
    this.trackingService.gtmTracking(gtmTrackingPayload);

    sessionStorage.clear();
    this._Router.navigate(['/vidadevolucion']);
  }

  intentarDeNuevo(): void {
    this.tryStep = true;
    sessionStorage.removeItem('_str_pay');
    sessionStorage.removeItem('kushki-vdp-result');
    this._Router.navigate(['/vidadevolucion/step4'], {
      queryParamsHandling: 'merge',
    });
  }

  convertPrima(moneda, amount) {
    switch (Number(moneda)) {
      case 1: {
        return `S / ${amount} `;
      }
      case 2: {
        return `US$ ${amount} `;
      }
    }
  }

  get user(): any {
    return JSON.parse(sessionStorage.getItem('info-document'));
  }

  closeModalBeneficios(): void {
    this.modalBeneficios.hide();
  }
}
