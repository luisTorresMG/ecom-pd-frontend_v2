import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from '../../../layout/broker/services/authentication.service';
import { AppConfig } from '../../../app.config';
import { Observable, Subscription } from 'rxjs';
import { String } from './contants/string';

@Component({
  standalone: false,
  // tslint:disable-next-line:component-selector
  selector: 'app-nav-menuprod',
  // moduleId: module.id,
  templateUrl: 'navmenuprod.component.html',
  styleUrls: [
    './navmenuprod.component.css',
    './navmenuprod.component.mobile.css',
  ],
})
export class NavMenuProdComponent implements OnInit, OnDestroy {
  @ViewChild('subMenuReportes', { static: false, read: ElementRef })
  subMenuReportes: ElementRef;
  @ViewChild('subMenuSoat', { static: false, read: ElementRef })
  subMenuSoat: ElementRef;
  @ViewChild('subMenuBackoffice', { static: false, read: ElementRef })
  subMenuBackoffice: ElementRef;
  @ViewChild('subMenuMantenimiento', { static: false, read: ElementRef })
  subMenuMantenimiento: ElementRef;
  @ViewChild('subMenuSeguridad', { static: false, read: ElementRef })
  subMenuSeguridad: ElementRef;
  @ViewChild('subMenuRentas', { static: false, read: ElementRef })
  subMenuRentas: ElementRef;
  @ViewChild('subMenuConstanciaSoat', { static: false, read: ElementRef })
  subMenuConstanciaSoat: ElementRef;
  DATA_MENU: any = null;
  showProfileMenu = false;

  subscription: Subscription;

  promotorList = String.promotorList;
  epsItem:any; //AVS- INTERCONEXION SABSA
  epsSCTR = JSON.parse(sessionStorage.getItem('epsKuntur'));

  constructor(
    private readonly _Router: Router,
    private readonly _AuthenticationService: AuthenticationService,
    private readonly _spinner: NgxSpinnerService
  ) {
    this.subscription = new Subscription();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const isAdmin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
    this.showProfileMenu = isAdmin === '1';
    const dataMenu = JSON.parse(localStorage.getItem('currentUser')).menu;
    const arrayMenu = dataMenu.reduce(
      (r, { nidproduct: nidproduct, ...object }) => {
        let temp = r.find((o) => o.nidproduct === nidproduct);
        const itemProductList = JSON.parse(localStorage.getItem('productUser'))[
          'res'
        ].find((o) => o.NIDPRODUCT === nidproduct);
        if (itemProductList) {
          if (!temp) {
            // tslint:disable-next-line:max-line-length
            r.push(
              (temp = {
                nidproduct,
                nidresource: object.nidresource,
                shtml:
                  nidproduct === 1
                    ? 'fa-car'
                    : nidproduct === 2
                    ? 'fa-briefcase'
                    : nidproduct === 3
                    ? 'fa-heart'
                    : nidproduct === 10
                    ? 'fa-cog'
                    : nidproduct === 6
                    ? 'fa-ambulance'
                    : nidproduct === 8
                    ? 'fa-users'
                    : nidproduct === 9
                    ? 'fa-money'
                    : nidproduct === 12
                    ? 'fa-university'
                    : nidproduct === 4
                    ? 'fa-money'
                    : nidproduct === 98
                    ? 'fa-list-alt'
                    : nidproduct === 97
                    ? 'fa-building'
                    : nidproduct == 16
                    ? 'fa-external-link-square'
                    : nidproduct === 17
                    ? 'fa-money'
                      : nidproduct === 18
                    ? 'fa fa-line-chart'
                      : '',
                sname: object.sproduct,
                sdescription: object.sproduct,
                children: [],
              })
            );
          }
          object.nidproduct = nidproduct;
          temp.children.push(object);
        }

        return r;
      },
      []
    );

    const arraytopMenu = dataMenu.reduce(
      (r, { nidproduct: nidproduct, ...object }) => {
        let temp = r.find((o) => o.nidproduct === nidproduct);
        // var itemProductList = JSON.parse(localStorage.getItem('currentUser')).productoPerfil.find(o => o.NIDPRODUCT !== nidproduct);
        if (nidproduct === 99) {
          // tslint:disable-next-line:max-line-length
          if (!temp) {
            r.push(
              (temp = {
                nidproduct,
                nidresource: object.nidresource,
                shtml: object.shtml,
                sname: object.sproduct,
                sdescription: object.sproduct,
                children: [],
              })
            );
          }
          object.nidproduct = nidproduct;
          temp.children.push(object);
        }

        return r;
      },
      []
    );

    if (arrayMenu) {
      // tslint:disable-next-line:max-line-length
      arrayMenu.splice(0, 0, {
        nidproduct: 0,
        nidresource: 0,
        shtml: 'menu-title',
        sname: 'PRODUCTOS',
        sdescription: 'Productos',
        stag: '',
        children: [],
      });
    }

    if (arraytopMenu) {
      if (arraytopMenu.length > 0) {
        arraytopMenu[0].children.forEach((entry) => {
          arrayMenu.splice(0, 0, entry);
        });
        // tslint:disable-next-line:max-line-length
        arrayMenu.splice(0, 0, {
          nidproduct: 0,
          nidresource: 0,
          shtml: 'menu-title',
          sname: 'GENERAL',
          sdescription: 'General',
          stag: '',
          children: [],
        });
      }
    }
    this.DATA_MENU = arrayMenu;
    const userStorage: Subscription = this._AuthenticationService
      .userStorage()
      .subscribe(
        (val: any) => {
          if (!Object.keys(val).length) {
            this.logoutSession();
          }
        },
        (error: any) => {
          console.error(error);
        }
      );
    this.subscription.add(userStorage);
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get showPhotocheckOption(): boolean {
    return this.promotorList.includes(+this.currentUser['id']);
  }

  // SHOW MENUS ID
  showHideSubMenu(id: string): void {
    if (!id) {
      return;
    }
    const html = document.getElementById('menu' + id);
    const icon = document.getElementById('iconmenu' + id);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const productId = this.DATA_MENU.find(
      (o) => Number(o.nidresource) === Number(id)
    ).nidproduct;
    const idperfil = currentUser.productoPerfil.find(
      (o) => o.idProducto === productId
    ).idPerfil;
    currentUser.profileId = idperfil;

    const admincurrentUser = JSON.parse(
      localStorage.getItem('admincurrentUser')
    );

    if (!admincurrentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    localStorage.setItem('codProducto', JSON.stringify({ productId }));

    if (productId == 2) { //AVS - INTERCONEXION SABSA
        this.epsItem = {
            NCODE: "3",
            SNAME: "GRANDIA",
            SDESCRIPTION: null,
            SIMAGE: "assets/images/grandia-eps.png",
            STYPE: "3"
        };
        //sessionStorage.setItem('epsKuntur', JSON.stringify(this.epsItem));
        localStorage.setItem('eps', JSON.stringify(this.epsItem));
    }else{
        this.epsItem = {
            NCODE: "1",
            SNAME: "PROTECTA",
            SDESCRIPTION: null,
            SIMAGE: "assets/images/protecta-eps.png",
            STYPE: "1"
        };
        //sessionStorage.setItem('epsKuntur', JSON.stringify(this.epsItem));
        localStorage.setItem('eps', JSON.stringify(this.epsItem));
    }
    
    if (html.hidden === true) {
      this.DATA_MENU.forEach((e) => {
        document.getElementById('menu' + e.nidresource).hidden = true;
        document.getElementById('iconmenu' + e.nidresource).style.transform =
          'rotate(0deg)';
        e.children.forEach((el) => {
          document.getElementById('submenu' + el.nidresource).hidden = true;
          document.getElementById(
            'iconsubmenu' + el.nidresource
          ).style.transform = 'rotate(0deg)';
        });
      });
      icon.style.transform = 'rotate(90deg)';
      html.hidden = false;
    } else {
      icon.style.transform = 'rotate(0deg)';
      html.hidden = true;
    }
  }

  routerMenuGeneral(data: any): void {
    localStorage.setItem(
      'codProducto',
      JSON.stringify({ productId: data.nidproduct })
    );
    this._Router.navigate([`/${data.stag}`]);
  }

  showHideChildren(id: string): void {
    const html = document.getElementById('submenu' + id);
    const icon = document.getElementById('iconsubmenu' + id);
    if (html.hidden === true) {
      this.DATA_MENU.forEach((e) => {
        e.children.forEach((el) => {
          document.getElementById('submenu' + el.nidresource).hidden = true;
          document.getElementById(
            'iconsubmenu' + el.nidresource
          ).style.transform = 'rotate(0deg)';
        });
      });
      icon.style.transform = 'rotate(90deg)';
      html.hidden = false;
    } else {
      icon.style.transform = 'rotate(0deg)';
      html.hidden = true;
    }
  }

  showHideGrandChildren(id: string): void {
    const html = document.getElementById('children' + id);
    const icon = document.getElementById('iconchildren' + id);
    if (html.hidden === true) {
      this.DATA_MENU.forEach((e) => {
        e.children.forEach((el) => {
          el.children.forEach((ol) => {
            document.getElementById('children' + ol.nidresource).hidden = true;
            document.getElementById(
              'iconchildren' + ol.nidresource
            ).style.transform = 'rotate(0deg)';
          });
        });
      });
      icon.style.transform = 'rotate(90deg)';
      html.hidden = false;
    } else {
      icon.style.transform = 'rotate(0deg)';
      html.hidden = true;
    }
  }

  doLogout() {
    this._spinner.show();
    this._Router.navigate(['/extranet/welcome']);
    this._AuthenticationService.logout().subscribe(
      (result) => {
        this._spinner.hide();
        if (result) {
          this.logoutSession();
        }
      },
      (error) => {
        this._spinner.hide();
        console.log('error: ', error);
      }
    );
  }

  private logoutSession(): void {
    this._Router.navigate(['/extranet/login']);
    localStorage.setItem('currentUser', '');
    localStorage.clear();
    sessionStorage.clear();
  }

  gotoProfile() {
    const adminUser = localStorage.getItem('admincurrentUser');
    if (adminUser) {
      localStorage.setItem('currentUser', adminUser);
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.canal = localStorage.getItem('channelMain');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, null);
    this._Router.navigate(['extranet/login-profile'], {
      skipLocationChange: true,
    });
  }

  get isSimulador(): boolean {
    const simulador = JSON.parse(
      localStorage.getItem(AppConfig.PROFILE_ADMIN_STORE)
    );
    const admin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
    if (simulador !== null && admin === '1') {
      return true;
    }
    return false;
  }

  get channelDescription(): string {
    const channelSimulador = JSON.parse(
      localStorage.getItem(AppConfig.PROFILE_ADMIN_STORE)
    );
    const channel = JSON.parse(localStorage.getItem('currentUser')).desCanal;
    let name: string;
    if (channelSimulador !== null) {
      name = channelSimulador.sdescript.toLowerCase();
    } else {
      name = channel.toLowerCase();
    }
    return name;
  }

  openAndCloseNavMenu(): void {
    const html = document.getElementById('main-nav-menu');

    if (html.style.display === 'none') {
      html.style.display = 'flex';
    } else {
      html.style.display = 'none';
    }
    if (html.style.display !== 'none' && html.style.display !== 'flex') {
      html.style.display = 'flex';
    }
  }

  //#endregion
}
