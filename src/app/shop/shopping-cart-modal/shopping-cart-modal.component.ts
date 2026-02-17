import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import Rate from '../../layout/soat/shared/models/rate';
import SoatUser from '../../layout/soat/shared/models/soat-user';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-shopping-cart-modal',
  templateUrl: './shopping-cart-modal.component.html',
  styleUrls: ['./shopping-cart-modal.component.css'],
})
export class ShoppingCartModalComponent implements OnInit {
  @Output() closeaction = new EventEmitter();

  ecommerceType: string;
  info: any;
  shoppingCart;
  showProducts = false;

  constructor(
    private readonly router: Router,
    private readonly _appConfig: AppConfig
  ) {}

  ngOnInit() {
    this.ecommerceType = sessionStorage.getItem('ecommerce');

    this.shoppingCart = this.getShoppingCart();
    this.getUserInfo();
  }

  getUserInfo() {
    this.info = {};

    switch (this.ecommerceType) {
      case 'soat':
        this.getSoatInfo();
        break;
      case 'vidaley':
        this.getVidaleyInfo();
        break;
      case 'sctr':
        this.getSCTRInfo();
        break;
      default:
        this.info = {};
        break;
    }
  }

  showProductList() {
    this.showProducts = !this.showProducts;
  }

  onClose() {
    this.closeaction.emit();
  }

  onProductSelected(product: string) {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Agregar al carrito',
      'Seguir comprando',
      product
    );
    this.cleanSession();
    sessionStorage.setItem('ecommerce', product);
    this.router.navigate([`/${product}`]);
    this.closeaction.emit();
  }

  goToCheckout() {
    this.cleanSession();
    this.router.navigate(['/shop/checkout']);
    this.closeaction.emit();
  }

  cleanSession() {
    const shoppingCart = sessionStorage.getItem('shoppingCart');
    sessionStorage.clear();
    sessionStorage.setItem('shoppingCart', shoppingCart);
  }

  getSoatInfo() {
    this.info = {
      soat: this.getSoatUser(),
      productName: 'SOAT',
      productImage: 'soat',
      billing: this.getClientBill().v_CONTRATANTE,
      rate: this.getRate(),
      enableSubscription: sessionStorage.getItem('enableSubscription'),
      selling: JSON.parse(sessionStorage.getItem('selling')),
      certificate: JSON.parse(sessionStorage.getItem('certificate')),
      enableSubscriptionVL: sessionStorage.getItem('enableSubscriptionVL'),
      campaign: JSON.parse(sessionStorage.getItem('campaign')),
    };

    const soatIndex = this.shoppingCart.soat.findIndex(
      (item) => item.soat._license === this.info.soat.license
    );

    if (soatIndex < 0) {
      this.shoppingCart.soat.push(this.info);
    } else {
      this.shoppingCart.soat[soatIndex] = this.info;
    }

    sessionStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCart));
  }

  getVidaleyInfo() {
    this.info = {
      vidaley: this.getVidaleyUser(),
      productName: 'VIDA LEY',
      productImage: 'vidaley',
    };

    const vidaleyIndex = this.shoppingCart.vidaley.findIndex(
      (item) => item.vidaley.ruc === this.info.vidaley.ruc
    );

    if (vidaleyIndex < 0) {
      this.shoppingCart.vidaley.push(this.info);
    } else {
      this.shoppingCart.vidaley[vidaleyIndex] = this.info;
    }

    sessionStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCart));
  }

  getSCTRInfo() {
    this.info = {
      sctr: this.getSCTRUser(),
      productName: 'SCTR',
      productImage: 'sctr',
      sctrClient: sessionStorage.getItem('sctrClient'),
      sctrIndividual: sessionStorage.getItem('sctrIndividual'),
      selling: sessionStorage.getItem('selling'),
    };

    const sctrIndex = this.shoppingCart.sctr.findIndex(
      (item) => item.sctr.ruc === this.info.sctr.ruc
    );

    if (sctrIndex < 0) {
      this.shoppingCart.sctr.push(this.info);
    } else {
      this.shoppingCart.sctr[sctrIndex] = this.info;
    }

    sessionStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCart));
  }

  getSoatUser(): SoatUser {
    const soatUser = sessionStorage.getItem('soat-user') || '{}';
    return new SoatUser(JSON.parse(soatUser));
  }

  getVidaleyUser(): any {
    return JSON.parse(sessionStorage.getItem('vidaley-user')) || {};
  }

  getClientBill() {
    return JSON.parse(sessionStorage.getItem('contractor')) || {};
  }

  getRate(): Rate {
    return JSON.parse(sessionStorage.getItem('rate')) || {};
  }

  getSCTRUser(): any {
    return JSON.parse(sessionStorage.getItem('sctr')) || {};
  }

  getShoppingCart() {
    const defaultValue = {
      soat: [],
      vidaley: [],
      sctr: [],
    };

    return JSON.parse(sessionStorage.getItem('shoppingCart')) || defaultValue;
  }
}
