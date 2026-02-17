import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { animate, style, transition, trigger } from '@angular/animations';

import { SessionStorageService } from '@shared/services/storage/storage-service';
import { PasswordService } from '@root/layout/broker/services/password/password.service';
import { ProductService } from '@root/layout/broker/services/product/panel/product.service';
import { sortArray } from '@shared/helpers/utils';
import { AppConfig } from '@root/app.config';

const transitionTime: number = 500;

@Component({
  selector: 'app-login-eps',
  templateUrl: './login-eps.component.html',
  styleUrls: ['./login-eps.component.sass'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(
          transitionTime,
          style({
            opacity: 1
          })
        )
      ])
    ]),
    trigger('fadeInY', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-15%)'
        }),
        animate(
          transitionTime,
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
})
export class LoginEpsComponent implements OnInit {

  form: FormGroup = this.builder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    forward: [false]
  });

  responseInfo: string = '';
  message: string = '';
  idProcessUser: string = '';
  showOtpAuthAws: boolean = false;

  @ViewChild('inputPassword', { static: true, read: ElementRef })
  inputPassword!: ElementRef;

  @ViewChild('modalUpdatePassword', { static: true, read: TemplateRef })
  modalUpdatePassword: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly passwordService: PasswordService,
    private readonly productService: ProductService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly vc: ViewContainerRef
  ) {
  }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.forwardAccount) {
      this.router.navigate(['/extranet/welcome']);
      return;
    }

    localStorage.removeItem('currentUser');
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  toggleShowPassword(): void {
    this.inputPassword.nativeElement.type = this.inputPassword.nativeElement.type == 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.responseInfo = '';
    this.idProcessUser = '';
    this.spinner.show();

    const payload = {
      authentication: {
        applicationId: '19100001',
        authenticationType: '04',
        userData: {
          user: this.formControl['username'].value,
          password: this.formControl['password'].value,
        },
      },
    };

    this.productService.getValidateUser(payload).subscribe(
      (response) => {

        if (response.status.id == 204) {
          this.spinner.hide();
          this.responseInfo  =
              'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
          return;
        }

        if (response.status.id == 403) {
          this.idProcessUser = response.data.processId;
          this.validateOTP(this.idProcessUser);
          return;
        }

        if (response.status.id == 201) {
          this.setAuthentication(response.data);
        }
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
        this.responseInfo =
            'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
      }
    );
  }

  private getDataSCTR(): void {
    this.responseInfo = '';
    this.spinner.show();

    const payload: { P_NIDUSER: number } = {
      P_NIDUSER: +this.currentUser['id']
    };
    this.productService.getDataSctr(payload).subscribe({
      next: (response: any): void => {

        if (response) {
          let urlLoginEps: string = location.pathname;

          if (urlLoginEps.includes('/ecommerce/')) {
            urlLoginEps = location.pathname.split('/ecommerce')[1];
          }

          localStorage.setItem('login-eps', urlLoginEps);
          this.setProducts(response.productList);
          this.setEPS(response.epsList);
          this.setMenu(response.productUserList);
          this.navigateHome();
          return;
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  private setProducts(products: any[]): void {
    enum productIncludes {
      SCTR_PEN = 'pensionID',
      SCTR_SAL = 'saludID',
      VIDA_LEY = 'vidaleyID',
      COVID_GRUPAL = 'covidID',
      ACC_PERSONALES = 'accPerID',
      VIDA_GRUPO = 'vidaGrupoID',
      DESGRAVAMEN = 'desgravamenID',
      VILP = 'VILP'
    }

    products.forEach((item: any): void => {
      if (!productIncludes[item.TIP_PRODUCT]) {
        return;
      }

      localStorage.setItem(
        productIncludes[item.TIP_PRODUCT],
        JSON.stringify({
          id: item.COD_PRODUCT.toString(),
          nbranch: item.NBRANCH.toString()
        })
      );
    });
  }

  private setEPS(epsList: any[]): void {
    sessionStorage.setItem('epsKuntur', JSON.stringify(epsList));
    localStorage.setItem('eps', JSON.stringify(epsList[0]));
  }

  private setMenu(menus: any[]): void {
    const loProducts = sortArray(menus, 'NIDPRODUCT', 1);
    localStorage.setItem('productUser', JSON.stringify({ res: loProducts }));
  }

  private navigateHome(): void {
    localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, null);


    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (this.formControl['forward'].value) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...user,
        forwardAccount: true
      }));
    }

    this.isEnableSimuladorCanales(user);

    this.router.navigate(['/extranet/welcome']);
  }

  private isEnableSimuladorCanales(user: any): void {
    const products: number[] = [20, 150, 151];
    const mainProduct = user.productoPerfil.some((x): boolean => x.idProducto === 1);

    if (mainProduct && products.includes(mainProduct.idPerfil)) {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '1');
    } else {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '0');
    }
  }
  
  private sendEmail() {

    const payload = {
      tipdoc: this.currentUser.tdocument,
      numdoc: this.currentUser.dni
    };

    this.passwordService.sendRetrievePassword(payload).subscribe({
      next: (response: any): void => {
        localStorage.removeItem('currentUser');

        if (!response.success) {
          this.responseInfo = 'Tuvimos un inconveniente realizando tu petición';
        }

        if (response.success) {
          this.message = 'Es necesario actualizar su contraseña. Hemos enviado un correo, Por favor revise su bandeja de entrada, carpeta de correo no deseado o spam.';
          this.vc.createEmbeddedView(this.modalUpdatePassword);
        }

      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.responseInfo = 'Tuvimos un inconveniente realizando tu petición';
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  closeModals(): void {
    this.vc.clear();
  }

  closeModalOtp() {
    this.showOtpAuthAws = false; 
  }

  resendToken() {
    this.spinner.show();
    this.showOtpAuthAws = false;
    this.validateOTP(this.idProcessUser);
  }

  validateOTP(id: string) {
    const payload = {
      authentication: {
        applicationId: '19100001',
        authenticationType: '04',
        userData: {
          processId: id,
        },
      },
    };

    this.productService.getValidateUser(payload).subscribe(
      (response) => {
        this.spinner.hide();

        if (response.status.id === 200) {
          this.showOtpAuthAws = true;
          return;
        }

        this.responseInfo =
            'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
      },
      (error) => {
        this.spinner.hide();
        this.responseInfo =
            'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
      }
    );
  }

   resultToken(response: any) {
    this.showOtpAuthAws = false;
    this.setAuthentication(response.data);
  }

  parseUserData(data: any): void {

    this.sessionStorageService.clearStorage();
    this.sessionStorageService.setItem('puntoVentaCliente', data.puntoVenta);
    this.sessionStorageService.setItem('canalVentaCliente', data.canal);

    const currentUser = {
        id: data.id,
        username: data.username,
        token: data.token,
        firstName: data.firstName,
        lastName: data.lastName,
        lastName2: data.lastName2,
        email: data.email,
        canal: data.canal,
        puntoVenta: data.puntoVenta,
        indpuntoVenta: data.puntoVenta,
        desCanal: data.desCanal,
        desPuntoVenta: data.desPuntoVenta,
        tipoCanal: data.tipoCanal,
        tdocument: data.tipdoc,
        dni: data.numdoc,
        sclient: data.codCliente,
        menu: data.menu,
        brokerId: data.brokerId,
        intermediaId: data.intermediaId,
        profileId: data.profileId,
        permissionList: data.permissionList,
        flagCambioClave: +data.cambioClave,
        productoPerfil: data.productoPerfil,
        promotor: data.promotor,
        listProducts: data.bannerPrincipal,
        logoutEcommerce: true
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  setAuthentication(data: any) {
    this.parseUserData(data);

    if (+data.cambioClave) {
      this.sendEmail();
      return;
    }
    
    this.getDataSCTR();
  }
}
