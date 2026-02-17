import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as ga from 'ngx-google-analytics';
import { AppConfig } from '@root/app.config';
import { v4 as uuid } from 'uuid';
import { Subscription } from 'rxjs';
import { IGoogleAnalytics } from '../../interfaces/google-analytics.interface';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

const analytics = location.pathname.includes('accidentespersonales')
  ? Analytics({
      app: 'ecommerce-ap',
      plugins: [
        googleAnalytics({
          trackingId: AppConfig.TRACK_ID_AP,
        }),
      ],
    })
  : null;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  private apiUri: string;

  constructor(
    private readonly _http: HttpClient,
    private readonly _ga: ga.GoogleAnalyticsService
  ) {
    this.apiUri = AppConfig.PD_API;
  }

  pageView(_: { path: string; title: string }) {
    this._ga.pageView(_.path, _.title, undefined, {
      user_id: this.sessionId,
    });

    analytics.page({
      path: _.path,
      title: _.title,
    });
  }

  emitGenericEventAP(
    accion: string,
    prima: number = 0,
    etiqueta: string = null,
    tipo = 1
  ) {
    // : Observable<any> {

    let url = window.location.pathname;
    if (url.indexOf('/accidentespersonales/payment/visa/') > -1) {
      url = '/accidentespersonales/payment/visa';
    }

    let page = '';
    if (url.indexOf('/step-1') > -1) {
      page = 'Paso 1';
    } else if (url.indexOf('/step-2') > -1) {
      page = 'Paso 2';
    } else if (url.indexOf('/step-3') > -1) {
      page = 'Paso 3';
    } else if (url.indexOf('/step-4') > -1) {
      page = 'Paso 4';
    } else if (url.indexOf('/step-5') > -1) {
      page = 'Paso 5';
    } else if (url.indexOf('/payment/visa') > -1) {
      page = 'Visa';
    } else if (url.indexOf('/payment/pago-efectivo') > -1) {
      page = 'Pago Efectivo';
    } else {
      page = 'Home';
    }

    const idProducto = sessionStorage.getItem('productIdPolicy') || 0;
    const processId = this.session?.processId || 0;

    const payload = {
      idRamo: 61,
      idSesion: this.sessionId,
      idProducto: idProducto,
      idProcess: processId,
      categoria: `Accidentes Personales - ${page}`,
      accion: accion?.replace(`"`, `'`),
      etiqueta: etiqueta,
      tipo,
      prima: prima,
    };

    const api = `${this.apiUri}/Tracking/event/register`;
    return this._http
      .post(api, payload)
      .map((response) => response)
      .subscribe(
        (response) => {
          console.log(response);
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  emitEvent(_: IGoogleAnalytics): Subscription {
    const payload = {
      idRamo: _.branchId,
      idSesion: _.sessionId,
      idProducto: _.productId,
      idProcess: _.processId,
      categoria: _.category,
      accion: _.action,
      etiqueta: _.label,
      tipo: _.type,
      prima: _.ammount,
    };

    const api = `${this.apiUri}/Tracking/event/register`;
    return this._http
      .post(api, payload)
      .map((response: boolean) => response)
      .subscribe();
  }

  get sessionId(): string {
    let sessionId = sessionStorage.getItem('0FF2C61A');
    if (!sessionId) {
      sessionId = uuid();
      sessionStorage.setItem('0FF2C61A', sessionId);
    }
    return sessionId;
  }

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }
}
