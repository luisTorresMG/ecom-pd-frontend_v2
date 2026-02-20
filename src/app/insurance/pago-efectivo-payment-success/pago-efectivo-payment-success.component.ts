import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { GoogleAnalyticsService } from '../../shared/services/google-analytics/google-analytics.service';
import { GoogleTagService } from '../shared/services/google-tag-service';

@Component({
  standalone: false,
  selector: 'app-pago-efectivo-payment-success',
  templateUrl: './pago-efectivo-payment-success.component.html',
  styleUrls: ['./pago-efectivo-payment-success.component.scss']
})
export class PagoEfectivoPaymentSuccessComponent implements OnInit {
  insuranceType: string = '';
  insuranceCategory: string = '';

  constructor(
    private readonly _router: Router,
    private readonly route: ActivatedRoute,
    private readonly gts: GoogleTagService
  ) {
    this.route.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;
    });
  }

  ngOnInit(): void {
    const tagManagerPayload = {
      event: 'virtualEventGA4_A6',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 4',
      Sección: 'Datos del producto',
      TipoAcción: 'Visualizar datos del producto',
      CTA: 'Finalizar',
      CheckTerminos: this.session.checkTerminosAsistencia
        ? 'Activado'
        : 'Desactivado',
      ProgramaAsistencia: this.session.checkProgramaAsistencia
        ? 'Activado'
        : 'Desactivado',
      tipoPlan: this.planSelected.plan?.descripcion,
      NombreSeguro: this.session.namePlan,
      TipoDocumento:
        this.session.documentType == 1
          ? 'RUC'
          : this.session.documentType == 2
            ? 'DNI'
            : 'CE',
      TipoMoneda: this.session.idMoneda == 1 ? 'Soles' : 'Dólares',
      Vigencia: this.session.frecuenciaPago?.descripcion,
      InicioVigencia: moment(this.session.startValidity).format('DD/MM/YYYY'),
      FinVigencia: this.session.endValidity,
      NumBeneficiarios: this.session.insuranceInfo.cantidadBeneficiarios,
      NumAsegurados: this.session.insuranceInfo.cantidadAsegurados,
      Ocupacion: this.session.actividad?.descripcion,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
      user_id: this.session.id,
      TipoCliente: this.session.tipoCliente,
      ID_Proceso: this.session.processId,
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManagerPayload);
  }
  
  get session(): any {
    const pagoEfectivoRaw = sessionStorage.getItem('pago-efectivo-response');
    const insuranceRaw = sessionStorage.getItem('insurance');

    const pagoEfectivo =
      (pagoEfectivoRaw ? JSON.parse(pagoEfectivoRaw) : {}) as Record<string, any>;

    const insurance =
      (insuranceRaw ? JSON.parse(insuranceRaw) : {}) as Record<string, any>;

    // si JSON.parse devolviera null (por ejemplo si guardaron "null"), lo convertimos a {}
    const safePagoEfectivo =
      pagoEfectivo && typeof pagoEfectivo === 'object' ? pagoEfectivo : {};

    const safeInsurance =
      insurance && typeof insurance === 'object' ? insurance : {};

    return {
      ...safeInsurance,
      ...safePagoEfectivo,
    };
  }


  get planSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected')) || null;
  }

  get currencyDescription(): string {
    switch (+this.session?.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  goToHome(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this._router.navigate(['/accidentespersonales']);
  }

  ammountTransform(val: any): string {
    return (+val).toFixed(2);
  }

  currentDate(): string {
    return moment(new Date()).format('DD/MM/YYYY')
  }
}
