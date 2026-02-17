import { environment } from './../../../../environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { Router, NavigationEnd } from '@angular/router';
import { SessionStorageService } from '../../services/storage/storage-service';
import { isNullOrUndefined } from 'util';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderService } from './header.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  haveUser = false;
  show = true;
  showSidebar = false;
  showLogo = false;
  showLeftButton = false;
  imagePaths: '';
  imagePath = '';
  opcionModalidad: number;
  totalSoats = 0;
  canal = '';
  ecommerce = false;
  ecommerceTotal = 0;
  base_url: SafeResourceUrl;
  private is_page_secure: string;
  constructor(
    private sidebarService: SidebarService,
    private sessionStorageService: SessionStorageService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer,
    private readonly _HeaderService: HeaderService
  ) {
    console.log(location.origin);
    this._HeaderService.totalItemsValue.subscribe(
      (res: any) => {
        if (this.ecommerce) {
          this.ecommerceTotal = res;
        }
      }
    );
    this.is_page_secure = location.origin.indexOf('http') !== -1 ? 'http://' : 'https://';
    this.base_url = location.origin.indexOf('localhost') !== -1 ? '' : `${this.is_page_secure + environment.domainurl}`;
    /*this.base_url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.domainurl}/shop/checkout`
    );*/
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.displayLeftButton();
        this.sidebarService.announceSidebar(false);
      }
    });

    this.sidebarService.node$.subscribe((val) => {
      this.showSidebar = !val;
    });

    this.sessionStorageService.watchStorage().subscribe((data: string) => {
      if (data) {
        this.setImagebyCanal();
      }
    });
  }

  toggleCollapse() {
    this.show = !this.show;
  }

  toggleSidebar() {
    this.sidebarService.announceSidebar(this.showSidebar);
  }

  ngOnInit() {
    this.displayLeftButton();

    const shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart'));
    this.ecommerce = !!shoppingCart;

    if (this.ecommerce) {
      this.ecommerceTotal =
        shoppingCart.soat.length +
        shoppingCart.vidaley.length +
        shoppingCart.sctr.length;
      this._HeaderService.setValueTotal = this.ecommerceTotal;
    }
  }

  ngOnDestroy(): void { }

  displayLeftButton() {
    const mUser = JSON.parse(localStorage.getItem('currentUser'));
    this.haveUser = mUser !== null;
    const pn = window.location.pathname.toLowerCase();
    if (pn.indexOf('extranet') !== -1) {
      this.showLeftButton = pn.indexOf('extranet/login') === -1;
    }
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
}
