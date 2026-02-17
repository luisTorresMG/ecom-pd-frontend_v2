import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from '../../../layout/broker/services/authentication.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-nav-menu',
  // moduleId: module.id,
  templateUrl: 'navmenu.component.html',
  styleUrls: ['./navmenu.component.css', './navmenu.component.mobile.css']
})
export class NavMenuComponent implements OnInit {
  @ViewChild('subMenuReportes', { static: false, read: ElementRef }) subMenuReportes: ElementRef;
  @ViewChild('subMenuSoat', { static: false, read: ElementRef }) subMenuSoat: ElementRef;
  @ViewChild('subMenuBackoffice', { static: false, read: ElementRef }) subMenuBackoffice: ElementRef;
  @ViewChild('subMenuMantenimiento', { static: false, read: ElementRef }) subMenuMantenimiento: ElementRef;
  @ViewChild('subMenuSeguridad', { static: false, read: ElementRef }) subMenuSeguridad: ElementRef;
  @ViewChild('subMenuRentas', { static: false, read: ElementRef }) subMenuRentas: ElementRef;
  @ViewChild('subMenuConstanciaSoat', { static: false, read: ElementRef }) subMenuConstanciaSoat: ElementRef;
  DATA_MENU: any = null;
  NAME_USER: string;
  INICIAL_FNAME: string;
  INICIAL_FLNAME: string;

  constructor(private readonly _Router: Router,
    private readonly _AuthenticationService: AuthenticationService,
    private readonly _spinner: NgxSpinnerService) {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    this.NAME_USER = `${userData.firstName} ${userData.lastName}`;
    this.INICIAL_FLNAME = userData.lastName;
    this.INICIAL_FNAME = userData.firstName.substring(0, 1);
    this.INICIAL_FLNAME = this.INICIAL_FLNAME.substring(0, 1);
  }

  ngOnInit(): void {
    console.clear();
    const dataMenu = JSON.parse(localStorage.getItem('currentUser')).menu.filter(x => x.nidproduct === 10);
    const dataBodyMenu = dataMenu.filter(x => x.nidresource !== 153);
    this.DATA_MENU = dataMenu;
  }
  // SHOW MENUS ID
  showHideSubMenu(id: string): void {
    const html = document.getElementById('menu' + id);
    const icon = document.getElementById('iconmenu' + id);
    if (html.hidden === true) {
      this.DATA_MENU.forEach(e => {
        console.log(e.sname);
        document.getElementById('menu' + e.nidresource).hidden = true;
        document.getElementById('iconmenu' + e.nidresource).style.transform = 'rotate(0deg)';
        e.children.forEach(el => {
          document.getElementById('submenu' + el.nidresource).hidden = true;
          document.getElementById('iconsubmenu' + el.nidresource).style.transform = 'rotate(0deg)';
        });
      });
      icon.style.transform = 'rotate(90deg)';
      html.hidden = false;
    } else {
      icon.style.transform = 'rotate(0deg)';
      html.hidden = true;
    }
  }
  showHideChildren(id: string): void {
    const html = document.getElementById('submenu' + id);
    const icon = document.getElementById('iconsubmenu' + id);
    if (html.hidden === true) {
      this.DATA_MENU.forEach(e => {
        e.children.forEach(el => {
          document.getElementById('submenu' + el.nidresource).hidden = true;
          document.getElementById('iconsubmenu' + el.nidresource).style.transform = 'rotate(0deg)';
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
    this._AuthenticationService.logout().subscribe(
      result => {
        if (result) {
          this._spinner.hide();
          this._Router.navigate(['/extranet/login']);
          localStorage.clear();
          sessionStorage.clear();
        }
      },
      error => {
        this._spinner.hide();
        console.log('error: ', error);
      }
    );
  }
  //#endregion
}
