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
    const pagoEfectivo = JSON.parse(
      sessionStorage.getItem('pago-efectivo-response') || '{}'
    );
    const insurance = JSON.parse(sessionStorage.getItem('insurance') || '{}');
    return (
      {
        ...insurance,
        ...pagoEfectivo,
      } || null
    );
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
