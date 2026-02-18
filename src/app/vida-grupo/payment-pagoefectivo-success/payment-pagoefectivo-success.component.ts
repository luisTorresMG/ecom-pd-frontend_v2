import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-payment-pagoefectivo-success',
  templateUrl: './payment-pagoefectivo-success.component.html',
  styleUrls: ['./payment-pagoefectivo-success.component.scss'],
})
export class PaymentPagoefectivoSuccessComponent implements OnInit {
  constructor(private readonly _router: Router) {}

  ngOnInit(): void {
    console.log(this.session);
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

  get currencyType(): string {
    switch (+this.session?.cotizacionInfo?.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }
}
