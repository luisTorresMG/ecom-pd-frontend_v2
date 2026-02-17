import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AppConfig } from '../../app.config';
import { ItemPersonalComponent } from '../../shared/components/item-personal/item-personal.component';
import { ShopService } from '../services/shop.service';
import { HeaderService } from '../../shared/components/header/header.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css'],
})
export class CheckOutComponent implements OnInit {
  shoppingCart: any;
  total = 0.0;
  // tslint:disable-next-line:no-inferrable-types
  NTOTAL_ITEMS_CART: number = 0;
  visaSessionToken: any;
  // tslint:disable-next-line:no-inferrable-types
  is_load_visa_from_proceso_pago: boolean = false;
  @ViewChild('modalProcesoPago', { static: true, read: ModalDirective }) modalProcesoPago: ModalDirective;

  constructor(
    private readonly router: Router,
    private readonly shopService: ShopService,
    private readonly _HeaderService: HeaderService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _appConfig: AppConfig
  ) { }

  ngOnInit() {
    this.shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart')) || {
      soat: [],
      vidaley: [],
      sctr: [],
    };
    this.NTOTAL_ITEMS_CART = this.shoppingCart.soat.length + this.shoppingCart.vidaley.length + this.shoppingCart.sctr.length;
    this.total = this.getTotalPrice();
  }

  onProductSelected(product: string) {
    this.cleanSession();
    sessionStorage.setItem('ecommerce', product);
    this.router.navigate([`/${product}`]);
  }

  cleanSession() {
    const shoppingCart = sessionStorage.getItem('shoppingCart');
    sessionStorage.clear();
    sessionStorage.setItem('shoppingCart', shoppingCart);
    this._HeaderService.setValueTotal = 0;
  }
  keepBuying(): void {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Carrito de compras',
      'Seguir comprando',
      '(not available)'
    );
    this.router.navigate(['/shop']);
  }
  removeItem(type: string, index: number, data: any) {
    console.log(data);

    this._appConfig.pixelEventDetailSoat(
      'removeFromCart',
      'remove',
      '66',
      data?.certificate?.P_NPREMIUM || data?.vidaley?.amount,
      data?.soat?._typeDesc || data?.productName
    );
    const item = this.shoppingCart[type][index];
    const processId = item[type]._nidProcess || item[type].idProcess;
    this.shopService.removeItem(processId).subscribe(() => {
      this.shoppingCart[type].splice(index, 1);
      this.total = this.getTotalPrice();
      sessionStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCart));
      this.NTOTAL_ITEMS_CART = this.shoppingCart.soat.length + this.shoppingCart.vidaley.length + this.shoppingCart.sctr.length;
      this.getVisaToken();
    });
    this._HeaderService.setValueTotal = Number(this._HeaderService.getValueTotal) - 1;
  }
  getTotalPrice() {
    const soatTotal = this.shoppingCart.soat.reduce(
      (acc, item) => acc + item.rate.precio,
      0
    );

    const vidaleyTotal = this.shoppingCart.vidaley.reduce(
      (acc, item) => acc + item.vidaley.amount,
      0
    );

    const sctrTotal = this.shoppingCart.sctr.reduce(
      (acc, item) => acc + item.sctr.amount,
      0
    );

    sessionStorage.setItem(
      'shoppingCartTotal',
      soatTotal + vidaleyTotal + sctrTotal
    );

    return (soatTotal + vidaleyTotal + sctrTotal).toFixed(2);
  }

  onPagoEfectivoClick() {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Cliente - Paso 5',
      'Seleccion metodo de pago',
      'Pago Efectivo'
    );
    this._HeaderService.setValueTotal = 0;
    this.router.navigate(['shop/payment/pago-efectivo']);
  }
  getVisaToken() {
    let flow = '';
    delete window['VisanetCheckout'];
    this.visaSessionToken = null;
    let mainProcessId = -1;

    let haveDocument = false;
    let numeroDocumento = '';
    let tipoDocumento = '';

    if (
      this.shoppingCart.soat.length > 0 &&
      this.shoppingCart.vidaley.length > 0 &&
      this.shoppingCart.sctr.length > 0
    ) {
      haveDocument = true;
      tipoDocumento = this.shoppingCart.soat[0].soat._documentType;
      numeroDocumento = this.shoppingCart.soat[0].soat._documentNumber;
      flow = 'eshop';
    }

    if (
      this.shoppingCart.soat.length > 0 &&
      this.shoppingCart.vidaley.length === 0 &&
      this.shoppingCart.sctr.length === 0
    ) {
      mainProcessId = this.shoppingCart.soat[0].certificate.P_NIDPROCESS;
      flow = 'soat';

      if (!haveDocument) {
        tipoDocumento = this.shoppingCart.soat[0].soat._documentType;
        numeroDocumento = this.shoppingCart.soat[0].soat._documentNumber;
      }
    }

    if (
      this.shoppingCart.vidaley.length > 0 &&
      this.shoppingCart.soat.length === 0 &&
      this.shoppingCart.sctr.length === 0
    ) {
      flow = 'vidaley';
      mainProcessId = this.shoppingCart.vidaley[0].vidaley.idProcess;
      if (!haveDocument) {
        tipoDocumento = '1';
        numeroDocumento = this.shoppingCart.vidaley[0].vidaley.ruc;
      }
    }

    if (
      this.shoppingCart.sctr.length > 0 &&
      this.shoppingCart.soat.length === 0 &&
      this.shoppingCart.vidaley.length === 0
    ) {
      flow = 'sctr';
      mainProcessId = this.shoppingCart.sctr[0].sctr.idProcess;
      if (!haveDocument) {
        tipoDocumento = '1';
        numeroDocumento = this.shoppingCart.sctr[0].sctr.ruc;
      }
    }
    if (
      (this.shoppingCart.soat.length >= 1 &&
        this.shoppingCart.sctr.length >= 1) ||
      (this.shoppingCart.soat.length >= 1 &&
        this.shoppingCart.vidaley.length >= 1) ||
      (this.shoppingCart.vidaley.length >= 1 &&
        this.shoppingCart.sctr.length >= 1)
    ) {
      flow = 'eshop';
    }
    const total_items = this.shoppingCart.soat.length + this.shoppingCart.sctr.length + this.shoppingCart.vidaley.length;
    /* if (total_items > 1) {
      flow = 'eshop';
    } */
    console.log(this.shoppingCart);
    if (this.shoppingCart.soat.length > 0) {
      if (total_items === 1) {
        mainProcessId = this.shoppingCart.soat[0].certificate.P_NIDPROCESS;
      } else {
        mainProcessId = -1;
      }
      tipoDocumento = this.shoppingCart.soat[0].soat._documentType;
      numeroDocumento = this.shoppingCart.soat[0].soat._documentNumber;
    }
    if (this.shoppingCart.sctr.length > 0) {
      if (total_items === 1) {
        mainProcessId = this.shoppingCart.sctr[0].sctr.idProcess;
      } else {
        mainProcessId = -1;
      }
      tipoDocumento = '1';
      numeroDocumento = this.shoppingCart.sctr[0].sctr.ruc;
    }
    if (this.shoppingCart.vidaley.length > 0) {
      if (total_items === 1) {
        mainProcessId = this.shoppingCart.vidaley[0].vidaley.idProcess;
      } else {
        mainProcessId = -1;
      }
      tipoDocumento = '1';
      numeroDocumento = this.shoppingCart.vidaley[0].vidaley.ruc;
    }
    console.log(flow);
    let codigoComercio: string | null = null;
    switch (flow) {
      case 'soat':
        codigoComercio = environment.codigocomercio;
        break;
      case 'vidaley':
        codigoComercio = environment.codigocomercioVidaLey;
        break;
      case 'sctr':
        codigoComercio = environment.codigocomercioSctr;
        break;
      case 'vidadevolucion':
        codigoComercio = environment.codigocomercioATP;
        break;
      case 'accidentespersonales':
        codigoComercio = environment.codigocomercioAP;
        break;
      case 'eshop':
        codigoComercio = environment.codigoComercioShop;
        break;
    }
    console.log(codigoComercio);
    if (Number(this.total) > 0) {
      this.shopService
        .generarSessionToken(
          mainProcessId,
          this.total,
          environment.canaldeventadefault,
          environment.puntodeventadefault,
          11,
          tipoDocumento,
          numeroDocumento,
          codigoComercio
        )
        .subscribe((response) => {
          const config = {
            action: AppConfig.ACTION_FORM_VISA_ECOMMERCE,
            timeoutUrl: '/shop/checkout',
          };

          this.visaSessionToken = { ...config, ...response };

          // FIXME: CAMBIAR CODIGO COMERCIO
          this.visaSessionToken.flow = flow;
          // this.visaSessionToken.flow = 'eshop';

          // if (
          //   this.shoppingCart.vidaley.length > 0 &&
          //   this.shoppingCart.soat.length === 0 &&
          //   this.shoppingCart.sctr.length === 0
          // ) {
          //   this.visaSessionToken.flow = 'vidaley';
          // }

          // if (
          //   this.shoppingCart.sctr.length > 0 &&
          //   this.shoppingCart.soat.length === 0 &&
          //   this.shoppingCart.vidaley.length === 0
          // ) {
          //   this.visaSessionToken.flow = 'sctr';
          // }
          if (this.is_load_visa_from_proceso_pago) {
            this._spinner.hide();
            this.modalProcesoPago.show();
            this.is_load_visa_from_proceso_pago = false;
          }
          sessionStorage.setItem('visa', JSON.stringify(this.visaSessionToken));
        });
    }
  }
  showModalProcesoPago(): void {
    if (this.getTotalPrice() !== 0) {
      this.is_load_visa_from_proceso_pago = true;
      this._spinner.show();
      this.getVisaToken();
    }
  }
  hideModalProcesoPago(): void {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Cliente - Paso 5',
      'Seleccion metodo de pago',
      'Visa'
    );
    this._appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Cliente - Paso 6',
      'Pago Visa',
      'Ver Pop up'
    );
    this.modalProcesoPago.hide();
  }
  //   onProductSelected(type: string, index: number) {
  //     switch (type) {
  //       case 'soat':
  //         return this.setSoatUser(index);
  //     }
  //   }

  //   setSoatUser(index: number) {
  //     const payload = this.shoppingCart.soat[index];
  //     sessionStorage.setItem('soat-user', JSON.stringify(payload.soat));
  //     sessionStorage.setItem('rate', JSON.stringify(payload.rate));
  //     sessionStorage.setItem('contractor', JSON.stringify(payload.billing));
  //     sessionStorage.setItem('ecommerce', 'soat');
  //     sessionStorage.setItem(
  //       'enableSubscription',
  //       sessionStorage.getItem('enableSubscription')
  //     );
  //     sessionStorage.setItem('selling', JSON.stringify(payload.selling));
  //     sessionStorage.setItem('certificate', JSON.stringify(payload.certificate));
  //     sessionStorage.setItem(
  //       'enableSubscriptionVL',
  //       sessionStorage.getItem('enableSubscriptionVL')
  //     );
  //     sessionStorage.setItem('campaign', JSON.stringify(payload.campaign));
  //     this.router.navigate([`/soat/step3`]);
  //   }
}
