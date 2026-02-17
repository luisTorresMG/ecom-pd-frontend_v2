import { BrowserModule } from "@angular/platform-browser";
//import { RegistSiniestroSoatComponent } from "./regist-siniestro-soat/regist-siniestro-soat.component";
import { RegistSiniestroSoatComponent } from '../component/regist-siniestro-soat/regist-siniestro-soat.component';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "@root/app-routing.module";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerModule } from "ngx-bootstrap";
import { NgxSpinnerModule } from "ngx-spinner";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxCaptchaModule } from "ngx-captcha";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaV3Module } from "ng-recaptcha";
import { ToastrModule } from "ngx-toastr";
import { SessionStorageService } from "@shared/services/storage/storage-service";
import { AuthInterceptor } from "@shared/interceptors/auth.interceptor";
import { AppComponent } from "@root/app.component";
import { LogoutDialogComponent } from "@shared/logout/component/logout-dialog.component";
import { registerLocaleData } from "@angular/common";
import { ApiService } from "@shared/services/api.service";
import { ConfigService } from "@shared/services/general/config.service";
import { ThemeService } from "ng2-charts";
import { LogoutService } from "@shared/logout/service/logout.service";
import { VersionCheckService } from "@shared/services/check-service/version-check.service";
import { AuthenticationService } from "@root/layout/broker/services";
import { AppConfig } from "@root/app.config";
import { SidebarService } from "@shared/services/sidebar/sidebar.service";
import { VehiculoService } from "@root/layout/client/shared/services/vehiculo.service";
import { CookieService } from "ngx-cookie-service";
//import { ChatBotService } from "@shared/services/chat-bot/chat-bot.service";
import { SessionService } from "@root/layout/soat/shared/services/session.service";
import { NgModule } from "@angular/core";
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

@NgModule({
    declarations: [      
      RegistSiniestroSoatComponent,
    ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatButtonModule,
      MatFormFieldModule,
      AppRoutingModule,
      HttpClientModule,
      NgbModule,
      BsDatepickerModule.forRoot(),
      NgxSpinnerModule,
      FormsModule,
      ReactiveFormsModule,
      NgxCaptchaModule,
      DragDropModule,
      MatInputModule,      
      MatCheckboxModule,
      RecaptchaV3Module,
      RecaptchaModule,
      RecaptchaFormsModule,
      ToastrModule.forRoot({
        timeOut: 10000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
    ],
    exports: [RegistSiniestroSoatComponent],
    providers: [   
        ApiService,
        ConfigService,
        ThemeService,
        LogoutService,
        VersionCheckService,
        AuthenticationService,
        AppConfig,
        SidebarService,
        VehiculoService,
        CookieService,
        //ChatBotService,
        SessionService,     
        SessionStorageService,
      { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
      },
  
    ],
    bootstrap: [RegistSiniestroSoatComponent],
    entryComponents: [LogoutDialogComponent],
  })
  export class SiniestroModule {}