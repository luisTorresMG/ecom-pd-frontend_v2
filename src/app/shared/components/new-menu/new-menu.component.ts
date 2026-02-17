import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HeaderService } from '../header/header.service';
import { SessionStorageService } from '../../services/storage/storage-service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { isNullOrUndefined } from 'util';
import { environment } from './../../../../environments/environment';
import { AppConfig } from '../../../app.config';
import { Router } from '@angular/router';
@Component({
  selector: 'app-new-menu',
  templateUrl: './new-menu.component.html',
  styleUrls: ['./new-menu.component.css']
})
export class NewMenuComponent implements OnInit {
  list_link_mobile: any[] = [];
  list_link_desktop: any[] = [];
  IS_MOBILE: boolean;
  // tslint:disable-next-line:no-inferrable-types
  IS_SHOW_LIST_MENU: boolean = false;
  ecommerce = false;
  ecommerceTotal = 0;

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
  base_url: SafeResourceUrl;
  NAME_USER: string;
  private is_page_secure: string;
  @ViewChild('listMenuMobile', { static: true, read: ElementRef }) listMenuMobile?: ElementRef;
  constructor(
    private readonly _HeaderService: HeaderService,
    private sessionStorageService: SessionStorageService,
    private readonly _appConfig: AppConfig,
    private readonly _router: Router
  ) {
    this.IS_MOBILE = window.innerWidth <= 800 ? true : false;
    this.list_link_mobile = [
      {
        desc: '¿Quiénes somos?',
        link: 'https://protectasecurity.pe/quienes-somos-6/'
      },
      {
        desc: 'Productos y servicios',
        link: 'https://protectasecurity.pe/productos/'
      },
      {
        desc: 'Oferta Inmobiliaria',
        link: 'https://protectasecurity.pe/protecta-security-inversiones-inmobiliarias/'
      },
      {
        desc: 'Net privada',
        link: 'https://netprivada.protectasecurity.pe/'
      },
      {
        desc: 'Responsabilidad Social',
        link: 'https://netprivada.protectasecurity.pe/'
      }
    ];
    this.list_link_desktop = [
      {
        desc: '¿Quiénes somos?',
        link: null,
        child1: [
          {
            child2: [
              {
                desc: 'Protecta Security',
                link: 'https://protectasecurity.pe/quienessomos/',
                style: 'underline-bold-orange'
              },
              {
                desc: 'Valores',
                link: 'https://protectasecurity.pe/quienessomos/#valores',
                style: 'underline'
              },
              {
                desc: 'Reconocimientos',
                link: 'https://protectasecurity.pe/quienessomos/#reconocimientos',
                style: 'underline'
              }
            ]
          },
          {
            child2: [
              {
                desc: 'Memorias',
                link: null,
                style: 'bold-white'
              },
              {
                desc: 'Memoria 2018',
                link: 'https://protectasecurity.pe/memoria/',
                style: 'underline'
              },
              {
                desc: 'Memoria 2019',
                link: 'https://protectasecurity.pe/memoria2019/',
                style: 'underline'
              }
            ]
          },
          {
            child2: [
              {
                desc: 'Alianzas',
                link: null,
                style: 'bold-white'
              },
              {
                desc: 'Portal Brokers Sanitas',
                link: 'https://protectasecurity.sanitasperu.com/',
                style: 'underline'
              },
              {
                desc: 'Pagos en línea Sanitas',
                link: 'https://pagosenlinea.sanitasperu.com/#202cb962ac59075b964b07152d234b70',
                style: 'underline'
              }
            ]
          }
        ]
      },
      {
        desc: 'Productos y servicios',
        link: null,
        child1: [
          {
            child2: [
              {
                desc: 'Personas',
                link: 'https://protectasecurity.pe/personas/',
                style: 'underline-bold-orange'
              },
              {
                desc: 'Renta y Ahorro',
                link: null,
                style: 'bold-white'
              },
              {
                desc: 'Renta total',
                link: 'https://protectasecurity.pe/landing-productos-renta-total',
                style: 'underline'
              },
              {
                desc: 'Renta vitalicia',
                link: 'https://protectasecurity.pe/personas/rentas/renta-vitalicia/',
                style: 'underline'
              },
              {
                desc: 'Ahorro total',
                link: 'https://protectasecurity.pe/ahorro-total-protecta/',
                style: 'underline'
              },
              {
                desc: 'Soat Electrónico',
                link: 'https://protectasecurity.pe/soat-electronico/',
                style: 'bold-white bw-mt'
              }
            ]
          },
          {
            child2: [
              {
                desc: 'Microseguros',
                link: 'https://protectasecurity.pe/personas/microseguros/',
                style: 'bold-white'
              },
              {
                desc: 'Vida',
                link: 'https://protectasecurity.pe/personas/microseguros/#planes',
                style: 'underline'
              },
              {
                desc: 'Sepelio',
                link: 'https://protectasecurity.pe/personas/microseguros/#planes',
                style: 'underline'
              },
              {
                desc: 'Desgravamen',
                link: 'https://protectasecurity.pe/personas/microseguros/#planes',
                style: 'underline'
              },
              {
                desc: 'Banca Seguros',
                link: 'https://protectasecurity.pe/personas/#banca_seguros',
                style: 'bold-white bw-mt'
              },
              {
                desc: 'Desgravamen',
                link: 'https://protectasecurity.pe/personas/#banca_seguros',
                style: 'underline'
              }
            ]
          },
          {
            child2: [
              {
                desc: 'Seguros',
                link: 'https://protectasecurity.pe/personas/#seguros',
                style: 'bold-white'
              },
              {
                desc: 'Accidentes personales',
                link: 'https://protectasecurity.pe/personas/#seguros',
                style: 'underline'
              },
              {
                desc: 'Oncológico',
                link: 'https://protectasecurity.pe/personas/#seguros',
                style: 'underline'
              },
              {
                desc: 'Vida',
                link: 'https://protectasecurity.pe/personas/#seguros',
                style: 'underline'
              },
              {
                desc: 'Seguro de vida sepelio',
                link: 'https://protectasecurity.pe/personas/#seguros',
                style: 'underline'
              },
              {
                desc: 'Otros seguros',
                link: 'https://protectasecurity.pe/personas/#otros-seguros',
                style: 'bold-white bw-mt'
              }
            ]
          },
          {
            child2: [
              {
                desc: 'Empresas',
                link: 'https://protectasecurity.pe/empresas/',
                style: 'underline-bold-orange'
              },
              {
                desc: 'SCTR',
                link: 'https://protectasecurity.pe/empresas/seguros-para-empresas/',
                style: 'underline'
              },
              {
                desc: 'Vida Ley Trabajador',
                link: 'https://protectasecurity.pe/seguro-vida-ley/',
                style: 'underline'
              },
              {
                desc: 'Vida Ley Ex Trabajador',
                link: 'https://protectasecurity.pe/empresas/seguros-para-empresas/',
                style: 'underline'
              },
            ]
          }
        ]
      },
      {
        desc: 'Oferta Inmobiliaria',
        link: 'https://protectasecurity.pe/protecta-security-inversiones-inmobiliarias/',
        child1: null
      },
      {
        desc: 'Net Privada',
        link: 'https://netprivada.protectasecurity.pe/',
        child1: null
      },
      /*{
        desc: 'Responsabilidad Social',
        link: 'https://protectasecurity.pe/protecta-security-inversiones-inmobiliarias/',
        child1: null
      },*/
      {
        desc: 'Consulta SOAT',
        link: 'https://plataformadigital.protectasecurity.pe/ecommerce/soat/consulta',
        child1: null
      }
    ];

    this._HeaderService.totalItemsValue.subscribe(
      (res: any) => {
        if (this.ecommerce) {
          this.ecommerceTotal = res;
        }
      }
    );
    this.setImagebyCanal();
    this.sessionStorageService.watchStorage().subscribe((data: string) => {
      if (data) {
        console.log('subs');
        this.setImagebyCanal();
      }
    });
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
  showHideMenuList(): void {
    this.IS_SHOW_LIST_MENU = !this.IS_SHOW_LIST_MENU;
    this.IS_SHOW_LIST_MENU ? this.listMenuMobile.nativeElement.hidden = false : this.listMenuMobile.nativeElement.hidden = true;
  }
  get currentUser(): any {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return ``;
  }
  get channelDescription(): string {
    const channelSimulador = JSON.parse(localStorage.getItem(AppConfig.PROFILE_ADMIN_STORE));
    const channel = JSON.parse(localStorage.getItem('currentUser')).desCanal;
    let name: string;
    if (channelSimulador !== null) {
      name = channelSimulador.sdescript.toLowerCase();
    } else {
      if (channel) {
        return channel.toLowerCase();
      }
      return ``;
    }
    return name;
  }
  get isExtranet(): boolean {
    // tslint:disable-next-line:max-line-length
    return (window.location.toString().indexOf('extranet') !== -1 || window.location.toString().indexOf('backoffice') !== -1) && window.location.toString().indexOf('extranet/login') == -1;
  }
  goToShop(): void {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Shop',
      'Ir a la tienda',
      '(not available)'
    );
    this._router.navigate(['/shop/checkout']);
  }
}
