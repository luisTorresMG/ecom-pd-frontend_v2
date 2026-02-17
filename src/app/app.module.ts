import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing-module'
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LogoutDialogComponent } from './shared/logout/component/logout-dialog.component';
import { LogoutService } from './shared/logout/service/logout.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from './layout/broker/services/authentication.service';
import { AppConfig } from './app.config';
import { SidebarService } from './shared/services/sidebar/sidebar.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { ChatBotComponent } from './shared/components/chat-bot/chat-bot.component';
import { ChatBotService } from './shared/services/chat-bot/chat-bot.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehiculoService } from './layout/client/shared/services/vehiculo.service';
import { ApiService } from './shared/services/api.service';
import { ConfigService } from './shared/services/general/config.service';
import { ToastrModule } from 'ngx-toastr';
import { VersionCheckService } from './shared/services/check-service/version-check.service';
import { ThemeService } from 'ng2-charts';
import { MenuGeneralComponent } from './shared/components/menu-general/menu-general.component';
import { AuthInterceptor } from '@root/shared/interceptors/auth.interceptor';

import { SessionService } from '@root/layout/soat/shared/services/session.service';
import { SessionStorageService } from './shared/services/storage/storage-service';
import { RedirectUrlComponent } from './layout/redirect-url/redirect-url.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RegistSiniestroSoatComponent } from './siniestro/component/regist-siniestro-soat/regist-siniestro-soat.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ScreenSplashComponent } from '@shared/components/screen-splash/screen-splash.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    LogoutDialogComponent,
    ChatBotComponent,
    MenuGeneralComponent,
    RedirectUrlComponent,
    RegistSiniestroSoatComponent,
    ScreenSplashComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BsDatepickerModule.forRoot(),
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    DragDropModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),
  ],
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
    ChatBotService,
    SessionService,
    SessionStorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [LogoutDialogComponent],
})
export class AppModule {}
