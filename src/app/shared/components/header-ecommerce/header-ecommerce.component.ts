import { Component, Input, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { environment } from './../../../../environments/environment';
import { SessionStorageService } from '../../services/storage/storage-service';
import { HeaderService } from '../header/header.service';
import { AppConfig } from '../../../app.config';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '@root/layout/soat/shared/services/session.service';
@Component({
  selector: 'app-header-ecommerce',
  templateUrl: './header-ecommerce.component.html',
  styleUrls: ['./header-ecommerce.component.css'],
})
export class HeaderEcommerceComponent implements OnInit {
  @Input() title: string;
  @Input() banner: string;

  showLogo = false;
  imagePath = '';
  canal = '';

  ecommerce = false;
  ecommerceTotal = 0;
  show = true;

  showBannerImage: boolean;
  constructor(
    private readonly _HeaderService: HeaderService,
    private readonly _sessionStorageService: SessionStorageService,
    private readonly _appConfig: AppConfig,
    private readonly _router: Router,
    private readonly _sessionService: SessionService,
    private readonly _route: ActivatedRoute
  ) {
    this.showBannerImage = true;
    this.title = null;
    this.banner = null;
    this._sessionStorageService.watchStorage().subscribe((data: string) => {
      if (data) {
        this.setImagebyCanal();
      }
    });
    this._HeaderService.totalItemsValue.subscribe((res: any) => {
      if (this.ecommerce) {
        this.ecommerceTotal = res;
      }
    });
    this._sessionService.renewSellingPoint().subscribe((res: any) => {
      // tslint:disable-next-line:max-line-length
      if (
        location.pathname.indexOf('/soat/') !== -1 &&
        this.selling?.sellingChannel?.toString() !== '2015000002'
      ) {
        this.showBannerImage = false;
      } else {
        this.showBannerImage = true;
      }
    });
  }

  ngOnInit(): void {
    const shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart'));
    this.ecommerce = !!shoppingCart;
    this.show = JSON.parse(localStorage.getItem('showNewMenu'));
    if (this.ecommerce) {
      this.ecommerceTotal =
        shoppingCart.soat.length +
        shoppingCart.vidaley.length +
        shoppingCart.sctr.length;
      this._HeaderService.setValueTotal = this.ecommerceTotal;
    }
  }
  get selling(): { sellingChannel: number; sellingPoint: number } {
    return JSON.parse(sessionStorage.getItem('selling'));
  }
  setImagebyCanal() {
    this.showLogo = false;
    const logoBroker = sessionStorage.getItem('canalVentaCliente');
    const logoClient = JSON.parse(sessionStorage.getItem('selling')) || '{}';
    this.canal = isNullOrUndefined(logoBroker)
      ? logoClient.sellingChannel
      : logoBroker;
    if (Number(environment.canaldeventadefault) !== Number(this.canal)) {
      if (this.canal != null) {
        this.showLogo = true;
      }
    }
    this.imagePath = 'assets/logos_Canal/' + this.canal + '.svg';
  }

  get soatConsulta(): boolean {
    if (window.location.pathname.indexOf('soat/consulta') !== -1) {
      return true;
    }
    return false;
  }

  goShopCart(): void {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Shop',
      'Ir a la tienda',
      '(not available)'
    );
    this._router.navigate(['/shop/checkout']);
  }
}
