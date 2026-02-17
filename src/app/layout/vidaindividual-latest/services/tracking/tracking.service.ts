import { Injectable } from '@angular/core';
import Analytics, { AnalyticsInstance } from 'analytics';
import googleTagManager from '@analytics/google-tag-manager';

import { AppConfig } from '@root/app.config';

const analytics: AnalyticsInstance | any = location.pathname.includes('/vidadevolucion') ? Analytics({
  app: 'ecommerce-vdp',
  plugins: [
    googleTagManager({
      containerId: AppConfig.TRACK_ID_VDP,
      dataLayerName: 'dataLayer',
      debug: true
    })
  ]
}) : {};

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor() {
  }

  get resumeCotizadorVDP(): any {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) ?? {};
  }

  gtmTracking({ eventName, payload }: { eventName: string, payload: any }): void {
    analytics.track(eventName, {
      ...payload,
      'AsesorVenta': this.resumeCotizadorVDP.ejecutivos?.asesor ?? 'venta no asistida'
    });
  }
}
