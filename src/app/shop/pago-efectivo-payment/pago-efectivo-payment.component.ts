import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ShopService } from '../services/shop.service';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-pago-efectivo-payment',
  templateUrl: './pago-efectivo-payment.component.html',
  styleUrls: ['./pago-efectivo-payment.component.css'],
})
export class PagoEfectivoPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('payment')
  content;

  shoppingCart: any;
  shoppingCartTotal = 0;

  modalRef: BsModalRef;

  successfullPayment = false;
  loading = false;
  valid = false;
  approve = false;

  paymentUrl: SafeResourceUrl;
  validMessages: string;
  messages: string[];

  constructor(
    private readonly modalService: BsModalService,
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router,
    private readonly shopService: ShopService,
    private readonly _appConfig: AppConfig
  ) { }

  ngOnInit() {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Cliente - Paso 6',
      'Pago Efectivo',
      'Reserva Satisfactoria'
    );
    this.shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart'));
    this.shoppingCartTotal = +sessionStorage.getItem('shoppingCartTotal');
    this.getPayment();
  }

  getPayment() {
    this.loading = true;
    const payload = this.getPaymentPayload();

    this.shopService
      .getPagoEfectivoURL(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        if (response.exito) {
          this.getModal(response);
        }

        if (response.errorCode === 'EMISION_VALIDATON') {
          this.valid = false;
          this.approve = true;
          this.validMessages = response.errorDesc.toString().substr(1);
          this.messages = this.validMessages.split('|');
        }

        if (response.errorCode === 'PEFECTIVO_ERROR') {
          this.valid = true;
          this.approve = false;
          this.validMessages = response.errorDesc;
        }
      });
  }

  getPaymentPayload() {
    return {
      IdProcess: -1,
      tipoSolicitud: 9,
      monto: this.shoppingCartTotal,
      ramo: 999,
      producto: '1',
      externalId: '134567',
      procesos: [
        ...this.shoppingCart.soat.map((item) => ({
          processId: item.soat._nidProcess,
          amount: item.rate.precio,
          type: 'soat',
        })),
        ...this.shoppingCart.vidaley.map((item) => ({
          processId: item.vidaley.idProcess,
          amount: item.vidaley.amount,
          type: 'vidaley',
        })),
        ...this.shoppingCart.sctr.map((item) => ({
          processId: item.sctr.idProcess,
          amount: item.sctr.amount,
          type: 'sctr',
        })),
      ],
    };
  }

  ngOnDestroy(): void {
    if (this.valid && this.approve) {
      this.cleanSession();
    }

    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  getModal(response: any) {
    this.valid = true;
    this.approve = true;

    this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      response.uri
    );

    this.modalRef = this.modalService.show(this.content);
  }

  goToMain() {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Compra realizada - Pago Efectivo',
      'Realizar otra Compra',
      '(not available)'
    );
    this.cleanSession();
    sessionStorage.setItem('is_reload', 'true');
    this.router.navigate(['/shop']);
  }

  cleanSession() {
    sessionStorage.clear();
  }
}
