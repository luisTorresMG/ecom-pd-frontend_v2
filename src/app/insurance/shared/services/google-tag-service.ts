import { Injectable } from '@angular/core';
import Analytics, { AnalyticsInstance } from 'analytics';
import googleTagManager from '@analytics/google-tag-manager';
import { AppConfig } from '@root/app.config';

@Injectable({
  providedIn: 'root',
})
export class GoogleTagService {
  private readonly analytics: AnalyticsInstance = Analytics({
    app: 'ecommerce-ap',
    plugins: [
      googleTagManager({
        containerId: AppConfig.GTM_ID_AP,
        dataLayerName: 'dataLayer',
        debug: true,
      }),
    ],
  });

  virtualEvent(payload: any): void {
    this.analytics.track(payload);
  }
}
