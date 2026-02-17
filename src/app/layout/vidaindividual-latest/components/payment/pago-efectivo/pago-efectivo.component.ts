import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-pago-efectivo',
  templateUrl: './pago-efectivo.component.html',
  styleUrls: ['./pago-efectivo.component.scss']
})
export class PagoEfectivoComponent implements OnInit {

  successPay: boolean;

  constructor(
    private readonly _router: Router
  ) {
    this.successPay = false;
  }

  ngOnInit(): void {
  }
  get idProcess(): any {
    return sessionStorage.getItem('idprocess_vi');
  }
  get session(): any {
    return sessionStorage.getItem('dataStep2');
  }

  get pagoEfectivoResponse(): any {
    return JSON.parse(sessionStorage.getItem('pago-efectivo-response') || '{}');
  }

  get tarifario(): any {
    return JSON.parse(sessionStorage.getItem('step2') || '{}');
  }

  get currencyDescription(): string {
    const session = JSON.parse(sessionStorage.getItem('step2'));
    return +session.moneda == 1 ? 'S/' : 'US$';
  }

  backToInit(): void {
    sessionStorage.clear();
    this._router.navigate(['/vidadevolucion']);
  }
}
