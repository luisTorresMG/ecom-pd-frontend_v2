import { Injectable } from '@angular/core';
import { Vidaley } from '../models/vidaley';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerService {
  constructor() {}

  setPageChange() {
    let currentUrl = window.location.pathname;

    if (currentUrl.indexOf('/sctr/payment/visa/') > -1) {
      currentUrl = '/sctr/payment/visa';
    }

    const config = {
      event: 'virtualPage',
      pagePath: currentUrl,
      pageName: this.getPageTitle(),
    };
    this.setDataLayer(config);
  }

  setFAQEvent(title) {
    const config = {
      event: 'virtualEvent',
      category: `Vida Ley - ${this.getPageTitle()}`,
      action: 'Preguntas frecuentes',
      label: title,
    };

    this.setDataLayer(config);
  }

  setIntentButton() {
    const config = {
      event: 'virtualEvent',
      category: `Vida Ley - ${this.getPageTitle()}`,
      action: 'Intención de avance',
      label: '(not available)',
    };

    this.setDataLayer(config);
  }

  setIntentButtonStep1(privacy: boolean) {
    const labelPrivacy = privacy
      ? 'Casilla publicidad marcada'
      : 'Casilla publicidad no marcada';
    const config = {
      event: 'virtualEvent',
      category: `Vida Ley - Paso 1`,
      action: 'Intención de avance',
      label: labelPrivacy,
    };
    this.setDataLayer(config);
  }

  setValidationIntent() {
    const config = {
      event: 'virtualEvent',
      category: `Vida Ley - ${this.getPageTitle()}`,
      action: 'intención de Validación',
      label: '(not available)',
    };

    this.setDataLayer(config);
  }

  setContactAction() {
    const config = {
      event: 'virtualEvent',
      category: `Vida Ley - ${this.getPageTitle()}`,
      action: 'Validación satisfactoria',
      label: 'Contacto por asesor',
    };

    this.setDataLayer(config);
  }

  setUploadAction(action) {
    const config = {
      event: 'virtualEvent',
      category: 'Vida Ley - Paso 4',
      action,
      label: '(not available)',
    };

    this.setDataLayer(config);
  }

  setSummary(summary: Vidaley) {
    const config = {
      event: 'productDetails',
      dimension3: summary.termDescription,
      ecommerce: {
        currencyCode: 'PEN',
        detail: {
          actionField: { list: 'Vida Ley' },
          products: [
            {
              name: 'Vida Ley',
              id: 117,
              price: summary.amount,
              brand: 'Protecta',
              category: 'Seguros de Vida',
              variant: summary.plan,
            },
          ],
        },
      },
    };

    this.setDataLayer(config);
  }

  setSummaryAction(action) {
    const config = {
      event: 'virtualEvent',
      category: 'Vida Ley - Paso 5',
      action,
      label: '(not available)',
    };

    this.setDataLayer(config);
  }

  setOrderPurchase(summary: Vidaley) {
    const config = {
      event: 'orderPurchase',
      dimension1: 'Visanet',
      dimension3: summary.termDescription,
      dimension4: summary.totalWorkers,
      dimension5: summary.totalAmount,
      dimension6: summary.rate,
      ecommerce: {
        currencyCode: 'PEN',
        purchase: {
          actionField: {
            id: summary.idProcess,
            affiliation: 'Standard',
            revenue: summary.amount,
            tax: '0.00',
            shipping: '0.00',
            coupon: '',
          },
          products: [
            {
              name: 'Vida Ley',
              id: 117,
              price: summary.amount,
              brand: 'Protecta',
              category: 'Seguros de Vida',
              variant: summary.plan,
              quantity: 1,
              coupon: '',
            },
          ],
        },
      },
    };

    this.setDataLayer(config);
  }

  getClientID() {
    try {
      const cookie = this.getCookie('_ga').split('.');
      return cookie[2] + '.' + cookie[3];
    } catch (e) {
      console.log('No Universal Analytics cookie found');
      return '';
    }
  }

  setProtectaClient(isClient: boolean) {
    const config = {
      event: 'virtualEvent',
      category: 'Vida Ley - Paso 2',
      action: isClient ? 'Autocompletado' : 'No autocompletado',
      label: '(not available)',
    };

    this.setDataLayer(config);
  }

  setErrorEvent(label) {
    const config = {
      event: 'virtualEvent',
      category: 'Errores en la web',
      action: `Vida Ley - ${this.getPageTitle()}`,
      label,
    };

    // this.setDataLayer(config);
  }

  setGenericErrorEvent(action, label) {
    const config = {
      event: 'virtualEvent',
      category: 'Errores en la web',
      action,
      label,
    };

    // this.setDataLayer(config);
  }

  private getCookie(name) {
    const re = new RegExp(name + '=([^;]+)');
    const value = re.exec(document.cookie);
    return value != null ? unescape(value[1]) : null;
  }

  private setDataLayer(config) {
    // console.log('[GTM]', config);
    window['dataLayer'].push(config);
  }

  private getPageTitle() {
    let url = window.location.pathname;
    // console.log(url);
    if (url.indexOf('/sctr/payment/visa/') > -1) {
      url = '/sctr/payment/visa';
    }

    if (url.indexOf('/sctr/step-1') > -1) {
      return 'Paso 1';
    } else if (url.indexOf('/sctr/step-2') > -1) {
      return 'Paso 2';
    } else if (url.indexOf('/sctr/step-3') > -1) {
      return 'Paso 3';
    } else if (url.indexOf('/sctr/step-4') > -1) {
      return 'Paso 4';
    } else if (url.indexOf('/sctr/step-5') > -1) {
      return 'Paso 5';
    } else if (url.indexOf('/sctr/payment/visa') > -1) {
      return 'Visa';
    } else if (url.indexOf('/sctr/payment/pago-efectivo') > -1) {
      return 'Pago Efectivo';
    } else {
      return '';
    }
  }
}
