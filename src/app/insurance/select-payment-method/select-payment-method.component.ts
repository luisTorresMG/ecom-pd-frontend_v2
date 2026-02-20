import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef,
  TemplateRef,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked,
  ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../app.config';
import { SessionService } from '../../layout/soat/shared/services/session.service';
import { PaymentService } from '../shared/services/payment.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  QuotationRequest,
  QuotationResponse
} from '../shared/models/quotation.model';
import {
  BiometricResultDto,
  DataBiometricDto
} from '@shared/models/biometric/biometric.model';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

declare var VisanetCheckout: any;
import { MainService } from '../shared/services/main.service';
import {
  IRegisterOtp,
  IValidateOtpResponse
} from '../../shared/interfaces/otp-auth.interface';
import { OtpAuthService } from '../../shared/services/otp-auth/otp-auth.service';
import { fadeAnimation } from '@shared/animations/animations';
import { ClientInfoService } from '../shared/services/client-info.service';
import { GoogleTagService } from '../shared/services/google-tag-service';
import { IClienteRiesgoRequest, IClienteRiesgoResponse } from '../../shared/interfaces/cliente-riesgo.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { maskAddress, maskEmail, maskName, maskPhone } from '../shared/utils/maskDataClient';

@Component({
  standalone: false,
  selector: 'app-select-payment-method',
  templateUrl: './select-payment-method.component.html',
  styleUrls: ['./select-payment-method.component.css'],
  animations: [fadeAnimation]
})
export class SelectPaymentMethodComponent
  implements OnInit, AfterViewInit, AfterViewChecked {
  insuranceType: string;
  insuranceCategory: string;
  successPay: boolean;

  sourcePagoEfectivo: SafeUrl;

  acceptTerms: boolean = true;
  experianComplete: boolean = false;

  @ViewChild('modalTerms', { static: false, read: TemplateRef })
  _modalTerms: TemplateRef<any>;
  @ViewChild('visaPay', { static: false, read: ElementRef })
  visaPay: ElementRef;
  @ViewChild('btnSubmit', { static: false, read: ElementRef })
  btnSubmit: ElementRef;
  @ViewChild('btnNext', { static: false, read: ElementRef })
  btnNext: ElementRef;
  @ViewChild('modalPagoEfectivo', { static: false, read: ModalDirective })
  modalPagoEfectivo: ModalDirective;

  dataGAId: {
    idClienteGoogle: string;
    idSesionTransaccion: string;
  } = {
    idClienteGoogle: null,
    idSesionTransaccion: null
  };
  idSessionGA4: string = '_ga_K3XX963LFH';

  modalBiometric: boolean;
  dataBiometric: DataBiometricDto;
  biometricResult: BiometricResultDto;
  stepBiom: number;
  successBiometric: boolean;

  showAuthentication = false;
  selectedMethod: number;
  otpResponse: IValidateOtpResponse;

  authMethodData: IRegisterOtp;

  disableDownloadQuotation: boolean;
  descriptionDownloadQuotation: string;

  cantidadAsegurados: any;
  cantidadBeneficiarios: any;

  derivationAdvisor: boolean = false;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _AppConfig: AppConfig,
    private readonly _SessionService: SessionService,
    private readonly _PaymentService: PaymentService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _DomSanitizer: DomSanitizer,
    private readonly _changeDetector: ChangeDetectorRef,
    private readonly _utilsService: UtilsService,
    private readonly _ga: GoogleAnalyticsService,
    private readonly _mainService: MainService,
    private readonly _vc: ViewContainerRef,
    private readonly _otpAuthService: OtpAuthService,
    private readonly clientInfoService: ClientInfoService,
    private readonly gts: GoogleTagService
  ) {
    if (!sessionStorage.getItem('exist-quotation-pdf')) {
      this.descriptionDownloadQuotation = 'Generando tu cotización ';
      this.disableDownloadQuotation = true;
      setTimeout(() => {
        this.disableDownloadQuotation = false;
        this.descriptionDownloadQuotation = 'Descarga tu cotización ';
      }, 15000);
    } else {
      this.disableDownloadQuotation = false;
      this.descriptionDownloadQuotation = 'Descarga tu cotización ';
    }
    this.modalBiometric = false;
    this.stepBiom = 1;
    this.successBiometric = false;
    this.dataGAId.idClienteGoogle = this.clientInfoService.getClientID();
    this.dataGAId.idSesionTransaccion = this.clientInfoService.getSessionID();

    this._route.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;

      sessionStorage.setItem('product-keys', JSON.stringify({
          category: this.insuranceCategory,
        product: this.insuranceType
      }));
    });
    this.successPay = false;
    this.sourcePagoEfectivo =
      this._DomSanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit(): void {
    this._mainService.nstep = 4;

    if (!this.dataNiubiz?.sessionNiubiz) {
      this.generateTokenNiubiz();
    }

    setTimeout(() => {
      this._ga.emitGenericEventAP('Visualiza paso 4');
    }, 100);

    window.scrollTo(0, 0);
    this.cantidadAsegurados = sessionStorage.getItem('cantidadTrabajadores');
    this.cantidadBeneficiarios = sessionStorage.getItem(
      'cantidadBeneficiarios'
    );
  }

  ngAfterViewChecked(): void {
    this._changeDetector.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.resultBiometric) {
      this.funcBiometricResult(<BiometricResultDto>this.resultBiometric, true);
    }

    if (!!Object.keys(this.resultOtp).length) {
      this.otpResult(this.resultOtp);
    }
  }

  get resultBiometric(): any {
    return JSON.parse(sessionStorage.getItem('result-biometric')) || null;
  }

  get biometricStorage(): any {
    return JSON.parse(sessionStorage.getItem('biometric')) || null;
  }

  showTerms() {
    this._vc.createEmbeddedView(this._modalTerms);
  }

  closeModals(e = null): void {
    this._vc.clear();
  }

  backStep(): void {
    this._ga.emitGenericEventAP(`Clic en 'Anterior'`);
    if (+this.productSelected['productId'] == 6) {
      this._router.navigate([
        `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`
      ]);
    } else {
      this._router.navigate([
        `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`
      ]);
    }
  }

  emitEventTag(metodoPago: string): void {
    const tagManayerPayloadPay = {
      event: 'virtualEventGA4_A7',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 4',
      Sección: 'Método de pago',
      TipoAcción: 'Seleccionar método de pago',
      CTA: metodoPago,
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
      InicioVigencia: moment(this.insurance.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.insurance.endValidity,
      NumBeneficiarios: this.insurance.insuranceInfo.cantidadBeneficiarios,
      NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
      Ocupacion: this.insurance.actividad?.descripcion,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManayerPayloadPay);

    const tagManagerPayloadCkeckout = {
      event: 'begin_checkout',
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
      InicioVigencia: moment(this.insurance.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.insurance.endValidity,
      NumBeneficiarios: this.insurance.insuranceInfo.cantidadBeneficiarios,
      NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
      Ocupacion: this.insurance.actividad?.descripcion,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa',
      currency: this.insurance.idMoneda == 1 ? 'PEN' : 'USD',
      value: this.planSelected.plan.prima,
      MétodoPago: metodoPago,
      ecommerce: {
        items: [
          {
            item_id: 61,
            item_name: this.insurance.namePlan,
            price: this.planSelected.plan.prima,
            item_brand: 'Protecta',
            item_category: 'Accidentes Personales',
            item_variant: this.insurance.variant,
            quantity: 1
          }
        ]
      }
    };
    this.gts.virtualEvent(tagManagerPayloadCkeckout);
  }

  pagarPagoEfectivo(): void {
    if (!this.acceptTerms) {
      return;
    }

    this._ga.emitGenericEventAP(`Clic en 'PagoEfectivo'`);
    this.emitEventTag('PagoEfectivo');

    const tagManayerPagoEfectivo = {
      event: 'protocolo',
      client_id: this.dataGAId.idClienteGoogle,
      session_id: this.dataGAId.idSesionTransaccion,
      user_id: this.insurance.id,
      ID_Proceso: this.insurance.processId
    };
    this.gts.virtualEvent(tagManayerPagoEfectivo);

    this._spinner.show();

    const payload = {
      idProcess: this.insurance.processId,
      idClienteGoogle: this.dataGAId.idClienteGoogle,
      idSesionTransaccion: this.dataGAId.idSesionTransaccion
    };

    this._PaymentService.generarCip(payload).subscribe(
      (res: any) => {
        this._spinner.hide();
        if (res.success) {
          this.sourcePagoEfectivo =
            this._DomSanitizer.bypassSecurityTrustResourceUrl(res.errorDesc);
          sessionStorage.setItem('pago-efectivo-response', JSON.stringify(res));

          const tagManagerPayloadPE = {
            event: 'virtualEventGA4_A6',
            Producto: 'Accidentes Personales',
            Paso: 'Paso 4',
            Sección: 'Información pago efectivo',
            TipoAcción: 'Visualizar código pago',
            CTA: 'PagoEfectivo',
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
            Canal: 'Venta Directa'
          };
          this.gts.virtualEvent(tagManagerPayloadPE);

          this.modalPagoEfectivo.show();
        } else {
          this._ga.emitGenericEventAP(
            `Clic en 'PagoEfectivo'`,
            0,
            'Error al generar CIP',
            2
          );
        }
      },
      (err: any) => {
        console.error(err);
        this._ga.emitGenericEventAP(
          `Clic en 'PagoEfectivo'`,
          0,
          'Error al generar CIP',
          2
        );
        this._spinner.hide();
      }
    );
  }

  pay() {
    if (!this.acceptTerms) {
      return;
    }

    this._ga.emitGenericEventAP('Clic en Visa');
    this.emitEventTag('Visa');

    this.insertVisaScript();
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }

  get contizacion(): any {
    return JSON.parse(sessionStorage.getItem('cotizacionId'));
  }

  get planSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected'));
  }

  get asegurados(): any {
    return JSON.parse(sessionStorage.getItem('dataAsegurados'));
  }

  get dataNiubiz(): any {
    return JSON.parse(sessionStorage.getItem('dataNiubiz'));
  }

  get countBeneficiarios(): number {
    let count = 0;
    this.asegurados?.forEach((e) => {
      count += e.beneficiarios.length;
    });
    return count;
  }

  generateTokenNiubiz(): void {
    this._spinner.show();

    this._PaymentService.getTokenNiubiz(+this.insurance.processId).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        response.sessionNiubiz.flow = 'accidentes-personales';
        sessionStorage.setItem(
          'dataNiubiz',
          JSON.stringify(response.sessionNiubiz)
        );
        window['initDFP'](
          response.sessionNiubiz?.deviceFingerPrintId,
          response.sessionNiubiz?.numeroCompra,
          response.sessionNiubiz?.ip,
          response.sessionNiubiz?.codigoComercio
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this._spinner.hide();
      },
    });
  }

  private getSubscriptionConfig() {
    const insurance = JSON.parse(sessionStorage.getItem('insurance'));

    const subs = {
      action: `${AppConfig.ACTION_VISA_PAY}/${btoa(
        AppConfig.DOMAIN_URL + '/accidentespersonales/payment/visa'
      )}`,
      method: 'POST',
      sessiontoken: this.dataNiubiz.sessionNiubiz,
      channel: 'paycard',
      merchantid: +this.dataNiubiz.codigoComercio,
      merchantlogo: AppConfig.LOGO_PROTECTA,
      formbuttoncolor: '#ED6E00',
      formbuttontext:
        `${+insurance.idMoneda == 1 ? 'S/' : '$'} ${
          this.planSelected.plan.prima
        }` || 'Pagar',
      purchasenumber: this.dataNiubiz.numeroCompra,
      showamount: false,
      amount: this.planSelected.plan.prima.toString(),
      cardholdername: this.onlyText(this.insurance.name),
      cardholderlastname: this.onlyText(
        this.insurance.lastname || this.insurance.name
      ),
      cardholderemail: this.insurance.email,
      expirationminutes: '20',
      timeouturl: window.location + '/visa',
      usertoken: null
    };
    return subs;
  }

  onlyText(txt: string): string {
    txt = txt.replace(/[^a-zA-Z ]/g, '');
    return txt;
  }

  insertVisaScript() {
    delete window['VisanetCheckout'];
    this._AppConfig.loadScriptSubscription(this.visaPay).then((loaded) => {
      const visaConfig = this.getSubscriptionConfig();
      VisanetCheckout.configure({
        ...visaConfig,
        complete: () => {
        }
      });
      VisanetCheckout.open();
    });
    return;
  }

  finalizePayment(): void {
    this._router.navigate(['/accidentespersonales/payment/pago-efectivo']);
  }

  descargarCotizacion(): void {
    this._ga.emitGenericEventAP(`Clic en 'Descargar Cotización'`);
    const data = new QuotationRequest({
      idCotizacion: this.contizacion,
      idProcess: this.insurance.processId
    });
    this._spinner.show();
    this._PaymentService.descargarCotizacion(data).subscribe(
      (res: QuotationResponse) => {
        res.nombre = `SLIP_${data.idProcess}.pdf`;
        if (res.resultado) {
          this.downloadArchivo(res);
          sessionStorage.setItem('exist-quotation-pdf', 'true');
        } else {
          this.disableDownloadQuotation = true;
          this.descriptionDownloadQuotation = 'Generando tu cotización ';
          setTimeout(() => {
            this.disableDownloadQuotation = false;
            this.descriptionDownloadQuotation = 'Descarga tu cotización';
          }, 15000);
        }
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  downloadArchivo(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.archivo;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.nombre);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  // BIOMETRIC
  showModalBiometric(): void {
    this.dataBiometric = new DataBiometricDto({
      idRamo: 61,
      idProcess: this.insurance.processId,
      apeMat: this.insurance.surname,
      apePat: this.insurance.lastname,
      nDoc: this.insurance.documentNumber,
      names: this.insurance.name
    });
    this.modalBiometric = !this.modalBiometric;
    this._ga.emitGenericEventAP(`Clic en 'Iniciar Biométrico'`);
  }

  funcBiometricResult(e: BiometricResultDto, emit: boolean = false): void {
    this.biometricResult = e;
    if (this.btnSubmit) {
      if (this.biometricResult.success && !this.biometricResult.hasError) {
        if (emit) {
          if (!sessionStorage.getItem('confirma_biometrico')) {
            this._ga.emitGenericEventAP('Confirma biometría');
            sessionStorage.setItem('confirma_biometrico', 'true');
          }
        }

        this.stepBiom = 3;
        this.successBiometric = true;
        this.btnSubmit.nativeElement.textContent = 'Siguiente';
      } else {
        this.successBiometric = true;
        this.stepBiom = 1;
        this.btnSubmit.nativeElement.textContent = 'Reintentar';
      }
      sessionStorage.setItem(
        'result-biometric',
        JSON.stringify({
          ...e
        })
      );
    }
    const rs: any = JSON.parse(sessionStorage.getItem('res-bio') || '{}');
    if (rs.status >= 400 && !rs?.isCall) {
      this._ga.emitGenericEventAP(
        'Consultar estado de biometría',
        0,
        'Error al consultar el estado de biometría',
        2
      );
      sessionStorage.setItem(
        'res-bio',
        JSON.stringify({
          ...rs,
          isCall: true
        })
      );
    }
  }

  closeBiometric(e: boolean): void {
    this.modalBiometric = e;
    location.reload();
  }

  funcUploadFileBiometricResult(e: BiometricResultDto): void {
    this.biometricResult = e;
    if (!e.success) {
      this.modalBiometric = false;
    }
  }

  get isRuc(): boolean {
    return Number(this.insurance?.documentType) === 1;
  }

  get currencyDescription(): string {
    switch (+this.insurance.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  ammountTransform(val: any): string {
    return (+val).toFixed(2);
  }

  ammountTransformWithoutIGV(val: any): string {
    return (+val / 1.18).toFixed(2);
  }

  get productSelected(): any {
    return JSON.parse(sessionStorage.getItem('_producto_selecionado'));
  }

  get idProductSelected(): number {
    return +sessionStorage.getItem('productIdPolicy');
  }

  get productSelectedDescription(): string {
    return `${this.productSelected.categoryName} ${this.productSelected.name}`
      .toString()
      .replace('Seguros', 'seguro')
      .replace('Personales', '')
      .replace('Empresas', '');
  }

  get resultOtp(): any {
    return this._otpAuthService.storage;
  }

  selectedAuthMethod(e: number): void {
    this.selectedMethod = e;
  }

  showModalAuthMethod(e: boolean) {
    this.showAuthentication = e;
  }

  showHideModalBiometrico(): void {
    const tagManayerPayloadNext = {
      event: 'virtualEventGA4_A7',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 4',
      Sección: 'Detalles de la cotización',
      TipoAcción: 'Intento de avance',
      CTA: 'Siguiente',
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
      InicioVigencia: moment(this.insurance.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.insurance.endValidity,
      NumBeneficiarios: this.insurance.insuranceInfo.cantidadBeneficiarios,
      NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
      Ocupacion: this.insurance.actividad?.descripcion,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManayerPayloadNext);

    const tagManayerPayloadNextResponse = {
      ...tagManayerPayloadNext,
      TipoAcción: 'Avance exitoso'
    };
    this.gts.virtualEvent(tagManayerPayloadNextResponse);

    const tagManayerPayloadModal = {
      ...tagManayerPayloadNext,
      Sección: 'Modal Proceso de Validación',
      TipoAcción: 'Visualizar Modal'
    };
    this.gts.virtualEvent(tagManayerPayloadModal);

    this.authMethodData = {
      idProcess: this.insurance.processId,
      dni: this.insurance.documentNumber,
      nombre: this.insurance.names,
      apellido: `${this.insurance.apePat} ${this.insurance.apeMat}`,
      celular: this.insurance.phoneNumber,
      correo: this.insurance.email
    };

    this.showAuthentication = !this.showAuthentication;
  }

  otpResult(e: IValidateOtpResponse) {
    this.biometricResult = null;
    this.otpResponse = e;
    this.showAuthentication = false;
    if (e.hasError) {
      this.btnSubmit.nativeElement.textContent = 'Reintentar';
    }
    
    if(this.otpResponse.success) {
      setTimeout(() => {
        this.validateExperian();
      }, 100);
    }
  }

  validateExperian(): void {
    this._spinner.show();

    const payload: IClienteRiesgoRequest = {
      idRamo: 61,
      idProducto: +this.idProductSelected,
      idTipoDocumento: this.insurance.documentType,
      numeroDocumento: this.insurance.documentNumber,
      nombres: this.insurance.names,
      primerApellido: this.insurance.apePat,
      idProceso: this.insurance.processId ?? 0,
    };

    this._utilsService.experianRisk(payload).subscribe({
        next: (response: IClienteRiesgoResponse) => {

         this.experianComplete = response.success; 
          this.derivationAdvisor = response.experian.experianRisk;
          if (this.derivationAdvisor) {
            this._ga.emitGenericEventAP(`Cliente riesgoso - Experian`);
            return;
          }

        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this._spinner.hide();
        },
        complete: () => {
          this._spinner.hide();
        },
    });
  }

  backToHome(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this._router.navigate(['/accidentespersonales']);
  }

  changeTerms() {
    this.acceptTerms = !this.acceptTerms;

    if (this.acceptTerms) {
      const tagManagerPayloadCheckBox = {
        event: 'virtualEventGA4_A7',
        Producto: 'Accidentes Personales',
        Paso: 'Paso 4',
        Sección: 'Detalles de la cotización',
        TipoAcción: 'Avance exitoso',
        CTA: 'none',
        checktérminoscotización: this.acceptTerms ? 'Activado' : 'Desactivado',
        CodTransaccion: this.insurance.processId,
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
        NumBeneficiarios: this.insurance.insuranceInfo.cantidadBeneficiarios,
        NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
        Ocupacion: this.insurance.actividad?.descripcion,
        pagePath: window.location.pathname,
        timeStamp: new Date().getTime(),
        user_id: this.insurance.id,
        TipoCliente: this.insurance.tipoCliente,
        ID_Proceso: this.insurance.processId,
        Canal: 'Venta Directa'
      };
      this.gts.virtualEvent(tagManagerPayloadCheckBox);
    }

    if (this.insurance.checkMetodoPago) {
      return;
    }

    const dataInsurance = {
      ...this.insurance,
      checkMetodoPago: true
    };
    sessionStorage.setItem('insurance', JSON.stringify(dataInsurance));

    const tagManayerPayloadCheck = {
      event: 'add_to_cart',
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
      InicioVigencia: moment(this.insurance.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.insurance.endValidity,
      NumBeneficiarios: this.insurance.insuranceInfo.cantidadBeneficiarios,
      NumAsegurados: this.insurance.insuranceInfo.cantidadAsegurados,
      Ocupacion: this.insurance.actividad?.descripcion,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.insurance.id,
      TipoCliente: this.insurance.tipoCliente,
      ID_Proceso: this.insurance.processId,
      Canal: 'Venta Directa',
      ecommerce: {
        items: [
          {
            item_id: '61',
            item_name: this.insurance.namePlan,
            price: this.planSelected.plan.prima,
            item_brand: 'Protecta',
            item_category: 'Accidentes Personales',
            item_variant: this.insurance.variant,
            quantity: 1
          }
        ]
      }
    };
    this.gts.virtualEvent(tagManayerPayloadCheck);
  }

  maskNameClient(data: string) {
    return maskName(data);
  }

  maskEmailClient(data: string) {
    return maskEmail(data);
  }

  maskPhoneClient(data: string) {
    return maskPhone(data);
  }

  maskAddressClient(data: string) {
    return maskAddress(data);
  }
}
