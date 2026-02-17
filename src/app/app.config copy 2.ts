import { environment } from './../environments/environment';
import { ElementRef, Injectable, RendererFactory2 } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Injectable()
export class AppConfig {
  renderer: Renderer2;

  constructor(private readonly _Renderer: RendererFactory2) {
    this.renderer = _Renderer.createRenderer(null, null);
  }

  public readonly apiUrl = environment.backendapi;

  public static get ACTION_FORM_VISA_CLIENT(): string {
    return environment.backendapi + '/pago/formresponse/1';
  }

  public static get IS_PROTECTA(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.canal?.toString() === '2018000011') {
      return true;
    }
    return false;
  }

  public static get FILTER_CHANNEL_ONLY_BROKER(): {
    res: boolean;
    channel: string;
  } {
    if (AppConfig.PROFILE_ADMIN_STORE !== null) {
      const simulateChannel = JSON.parse(
        localStorage.getItem(AppConfig.PROFILE_ADMIN_STORE)
      );
      if (simulateChannel) {
        return {
          res: true,
          channel: simulateChannel.nchannel
        };
      }
    }
    return {
      res: false,
      channel: null
    };
  }

  public static get ACTION_FORM_VISA_BROKER(): string {
    return environment.backendapi + '/pago/formresponse/2';
  }

  public static get ACTION_FORM_VISA_PAYROLL(): string {
    return environment.backendapi + '/pago/formresponse/3';
  }

  public static get ACTION_FORM_VISA_PREPAYROLL(): string {
    return environment.backendapi + '/pago/formresponse/4';
  }

  public static get ACTION_FORM_VISA_SOAT(): string {
    return environment.backendapi + '/pago/formresponse/6';
  }

  public static get ACTION_FORM_VISA_RENOVATION(): string {
    return environment.backendapi + '/pago/formresponse/8';
  }

  public static get ACTION_FORM_VISA_VIDALEY(): string {
    return environment.backendapi + '/pago/formresponse/7';
  }

  public static get ACTION_FORM_VISA_SCTR(): string {
    return environment.backendapi + '/pago/formresponse/9';
  }

  public static get ACTION_FORM_VISA_SCTR_ECOMMERCE(): string {
    return environment.backendapi + '/pago/formresponse/10';
  }

  public static get ACTION_FORM_VISA_ECOMMERCE(): string {
    return environment.backendapi + '/pago/formresponse/11';
  }

  public static get ACTION_FORM_VIDA_VIDAINDIVIDUAL(): string {
    return environment.backendapi + '/pago/formresponse/12';
  }

  public static get ACTION_FORM_ACCIDENTES_PERSONALES(): string {
    return environment.backendapi + '/pago/formresponse/13';
  }

  public static get ACTION_VISA_PAY(): string {
    return `${this.WSPD_API}/pago/transaction`;
  }

  public static get MERCHANT_LOGO_VISA(): string {
    return (
      environment.domainurl + '/assets/logos/logo_protecta_security_cajon.png'
    );
  }

  public static get LOGO_PROTECTA(): string {
    return `${environment.domainurl}/assets/logos/logo-latest.png`;
  }

  public static get MERCHANT_NAME_VISA(): string {
    return 'Protecta Security';
  }

  public static get CAPTCHA_KEY(): string {
    return environment.recaptchaKey;
  }

  public static get CAPTCHA_KEY_SOAT(): string {
    return environment.recaptchaKeySoat;
  }

  public static get ITEMS_POR_PAGINA(): number {
    return 5;
  }

  //#region Estados de la Planilla
  public static get PAYROLL_STATUS_PENDING(): number {
    return 1;
  }

  public static get PAYROLL_STATUS_PAID(): number {
    return 2;
  }

  //#endregion

  //#region Estados de la Pre planilla
  public static get PREPAYROLL_STATUS_PENDING(): number {
    return 1;
  }

  public static get PREPAYROLL_STATUS_PAID(): number {
    return 2;
  }

  //#endregion

  //#region Estados de detalled de Pago
  public static get PAYMENT_DETAIL_STATUS_PENDING(): string {
    return '1';
  }

  public static get PAYMENT_DETAIL_STATUS_PAID(): string {
    return '2';
  }

  //#endregion

  public static get URL_API(): string {
    return environment.backendapi;
  }

  public static get URL_API2(): string {
    return environment.backendapi;
  }

  public static get URL_API_SCTR(): string {
    return environment.kunturapi;
  }

  public static get URL_API_IDECON(): string {
    return environment.ideconapi;
  }

  public static get URL_API_REG_NEGATIVO(): string {
    return environment.reg_negativo_api;
  }

  public static get URL_API_WORLD_CHECK(): string {
    return environment.worldcheckapi;
  }
  
  public static get URL_API_REPORT(): string {
    return environment.reportapi;
  }
  public static get URL_API_SCORING(): string {
    return environment.scoringapi;
  }
  public static get FLUJO_CLIENTE(): string {
    return '1';
  }

  public static get FLUJO_BROKER(): string {
    return '2';
  }

  public static get FLUJO_PLANILLA(): string {
    return '3';
  }

  public static get FLUJO_PREPLANILLA(): string {
    return '4';
  }

  //#region Configuración Tipo de Pago
  public static get SETTINGS_SALE(): string {
    return '2';
  }

  public static get SETTINGS_PAYROLL(): string {
    return '3';
  }

  //#endregion

  //#region BACKOFFICE API
  public static get BACKOFFICE_API(): string {
    return environment.backofficeApi;
  }

  //#endregion

  public static get BIGPRIME_API(): string {
    return environment.apiBigprime;
  }

  public static get PRODUCTION_MODE(): boolean {
    return environment.production;
  }

  public static get DOMAIN_URL(): string {
    return environment.domainurl;
  }

  public static get PATH_PDF_FILES(): string {
    return environment.domainurl + '/assets/files';
  }

  public static get TIPO_PERSONA_FLUJO_CLIENTE(): number {
    return 1;
  }

  public static get CUSTOM_SERIAL_NUMBER(): string {
    const customSerialNumber = '^w{7}$|^w{17}$|^w{20}$';
    return customSerialNumber;
  }

  public static get CUSTOM_MAIL_DOMAIN(): any {
    return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,6})$/;
  }

  public pixelEvent(
    event: string,
    category: string,
    action: string,
    label: string
  ) {
    if (!window['dataLayer']) {
      return;
    }

    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `
    (function () {
      dataLayer.push({'event':'${event}','category' : '${category}' , 'action':'${action}', 'label': '${label}'});
      // window.console.log('pixelEvent :  ${label}: ', new Date().toLocaleString());
    })();    `;
    oBody.appendChild(oScript);
  }

  public gtmTrackEvent(_: { event: string; payload: any }) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    const payload = {
      event: _.event,
      ..._.payload
    };

    oScript.innerHTML = `(function () { dataLayer.push(${JSON.stringify(
      payload
    )}); })();`;
    // window.console.log('pixelEvent :  ${_.payload.label}: ', new Date().toLocaleString());
    oBody.appendChild(oScript);
  }

  public pixelEventClient(
    event: string,
    category: string,
    action: string,
    label: string,
    clientType: string
  ) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `(function () {
      dataLayer.push({
          'event':'${event}',
          'category' : '${category}' ,
          'action':'${action}',
          'label':'${label}',
          'clientType': '${clientType}'
      });
      // window.console.log('pixelEvent :  ${label}: ', new Date().toLocaleString());
    })();`;
    oBody.appendChild(oScript);
  }

  public pageEvent(config) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    window['dataLayer'].push(config);
  }

  public pixelEventDetail(
    productID: string,
    productoPrecio: string,
    clase_vehiculo: string
  ) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `
    (function () {
      dataLayer.push({'event':'productDetails'
                  ,'dimension2' : 'Flujo Cliente'
                  , 'ecommerce': {
                    'currencyCode': 'PEN',
                    'detail':{
                      'actionField': {'list': 'SOAT Digital'},
                      'products': [{
                        'name': 'SOAT Digital',
                        'id': '${productID}',
                        'price': '${productoPrecio}',
                        'brand': 'Protecta',
                        'category': 'Seguros Vehiculares',
                        'variant': '${clase_vehiculo}'
                        }]
                    }
                  }
                    });
      // window.console.log('pixelEvent : ${productID}: ', new Date().toLocaleString());
    })();    `;
    oBody.appendChild(oScript);
  }

  public pixelEventDetailSoat(
    event: string,
    action: string,
    productID: string,
    productoPrecio: string,
    clase_vehiculo: string
  ) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `
    (function () {
      dataLayer.push({'event': '${event}'
                  ,'dimension2' : 'Flujo Cliente'
                  , 'ecommerce': {
                    'currencyCode': 'PEN',
                    '${action}':{
                      'products': [{
                        'name': 'SOAT Digital',
                        'id': '${productID}',
                        'price': '${productoPrecio}',
                        'brand': 'Protecta',
                        'category': 'Seguros Vehiculares',
                        'variant': '${clase_vehiculo}',
                        'quantity': 1
                        }]
                    }
                  }
                    });
      // window.console.log('pixelEvent : ${productID}: ', new Date().toLocaleString());
    })();    `;
    oBody.appendChild(oScript);
  }

  public pixelPagoExitoso(
    transactionID: string,
    precioVenta: string,
    productID: string,
    productoPrecio: string,
    clase_vehiculo: string,
    cliente_protecta: string
  ) {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `
    (function () {
      dataLayer.push({
        'event':'orderPurchase',
        'dimension1':'Visanet',
        'dimension2':'Flujo Cliente',
        'dimension8': '${cliente_protecta}',
        'ecommerce': {
         'currencyCode': 'PEN',
        'purchase': {
        'actionField': {
                'id': '${transactionID}',
                'affiliation': 'Standard',
                'revenue': '${precioVenta}',
                'tax':'0.00',
                'shipping': '0.00',
                'coupon': ''
                },
        'products': [{
        'name': 'SOAT Digital',
        'id': '${productID}',
        'price': '${productoPrecio}',
        'brand': 'Protecta',
        'category': 'Seguros Vehiculares',
        'variant': '${clase_vehiculo}',
        'quantity': 1,
        'coupon': ''
        }
        ]
      }
    }});

      // window.console.log('pixelEvent :${transactionID}', new Date().toLocaleString());
    })();    `;
    oBody.appendChild(oScript);
  }

  public pixelSaveClientID() {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML = `
    (function () {
       var dato = getClientID();
       sessionStorage.setItem("idClientTrack", dato);
      window.console.log('ClienteId :'+ dato , new Date().toLocaleString());
    })();    `;

    oBody.appendChild(oScript);
  }

  public AddEventAnalityc() {
    const oBody = document.getElementsByTagName('body')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');

    oScript.innerHTML = `
    (function () {
      var myFunction2 = function() {
        dataLayer.push({'event':'virtualEvent','category' : 'SOAT Digital - Cliente - Pago' , 'action':'Pago Visa', 'label': 'Ver Pop up'});
    };

    var myVar = setInterval(myTimer, 1000);

    function myTimer() {
      window.console.log('MyTimer:' , new Date().toLocaleString());
      var btnPay = document.getElementsByClassName("start-js-btn modal-opener medium");
        if(btnPay != undefined)
          {  for (var i = 0; i < btnPay.length; i++) {
              btnPay[i].addEventListener('click', myFunction2, false);
            }
            myStopFunction();
          }
    }

    function myStopFunction() {
      clearInterval(myVar);
    }
    })();    `;
    oBody.appendChild(oScript);
  }

  public loadScriptSubscription(el: ElementRef): Promise<boolean> {
    const src = environment.visabuttonserviceRenovacion;
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.setAttribute('src', src);

      this.renderer.insertBefore(
        el.nativeElement.parentNode,
        script,
        el.nativeElement
      );

      if (script.readyState) {
        script.onreadystatechange = () => {
          if (
            script.readyState === 'loaded' ||
            script.readyState === 'complete'
          ) {
            script.onreadystatechange = null;
            resolve(true);
          }
        };
      } else {
        script.onload = () => {
          resolve(true);
        };
      }

      script.onerror = (error) => {
        console.error(error);
        reject(false);
      };
    });
  }

  public loadGenericScriptBiometric(
    el: ElementRef,
    data: any
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.setAttribute('src', data.src);
      script.setAttribute('id', 'script-biometric');

      this.renderer.insertBefore(
        el.nativeElement.parentNode,
        script,
        el.nativeElement
      );
      if (script.readyState) {
        script.onreadystatechange = () => {
          if (
            script.readyState === 'loaded' ||
            script.readyState === 'complete'
          ) {
            script.onreadystatechange = null;
            resolve(true);
          }
        };
      } else {
        script.onload = () => {
          resolve(true);
        };
      }

      script.onerror = (error) => {
        console.error(error);
        reject(false);
      };
    });
  }

  public static get BIG_PRIME(): string {
    return environment.bigPrime;
  }

  public static get PROFILE_ADMIN_SOAT(): number {
    return 150;
  }

  public static get PROFILE_ADMIN_GUID(): string {
    return 'ADD601A8CA7B';
  }

  public static get PROFILE_ADMIN_STORE(): string {
    return '9FF2C61A';
  }

  public static get PROFILES_LOAD_SOAT() {
    // return [{ 'id': 28, 'name': 'Cobranzas', 'product': 1, 'orden': 3 },
    // { 'id': 19, 'name': 'Vendedor', 'product': 1, 'orden': 1 },
    // { 'id': 21, 'name': 'Liquidador', 'product': 1, 'orden': 2 }];

    return [
      { id: 19, name: 'Vendedor', product: 1, orden: 1 },
      { id: 21, name: 'Liquidador', product: 1, orden: 2 }
    ];
  }

  public static get TRACK_ID_AP() {
    return environment.trackIdAP;
  }

  public static get TRACK_ID_VDP() {
    return environment.trackIdVDP;
  }

  public static get GTM_ID_AP(): string {
    return environment.tagManagerIdAP;
  }

  public static get CLOUD_API_KEY_STORAGE() {
    return 'ps:cl0xd.4p1.5t0r4g3';
  }

  // #region VIDA DEVOLUCION
  public static get VIDADEVOLUCION_STORAGE(): string {
    return '_xvddv1cn_tr9x';
  }

  public static get VIDADEVOLUCION_NSTEP(): string {
    return '_xvddv1cn_5tp';
  }

  //#region DESGRAVAMEN
  public static get DESGRAVAMEN_STORAGE(): string {
    return '_ps_dx59xvxmxn_dxtx';
  }

  public static get DESGRAVAMEN_NSTEP(): string {
    return '_ps_dx59xvxmxn_nxt3p';
  }

  public static get VIDADEVOLUCION_COMERCIAL_STORAGE(): string {
    return '_ps_vxdxdxvxlxcxxn_stxrxgx';
  }

  public static get OTPAUTH_STORAGE(): string {
    return '_0tp4uth3nt1c4t10n_5tr9';
  }

  /*public static get PLATAFORMA_DIGITAL_API(): string {
      return `${environment.plataformaDigitalApi}/api`;
  }*/

  public static get SECRET_KEY(): string {
    return 'SC#45@1q56we.r1s_qwe@w-qWx_aPlata#PS';
  }

  public static get SECRET_KEY_APICLIENT(): string {
    return 'pms3JIVh2HsbEvVA6fvvy2EHW3t14HyG';
  }

  public static get PD_API(): string {
    return environment.backendapi;
  }

  public static get WSPD_API(): string {
    return environment.wspdApi;
  }

  public static get WSPD_APIAWS(): string {
    return environment.wspdApiAWS;
  }

  public static get URL_API_OTPAWS(): string {
    return environment.apiOtpAws;
  }

  public static get CONTRATANTE() {
    return '01';
  }

  public static get EXPUESTOS() {
    return '02';
  }

  public static get REPORTESUCAVE() {
    return '091'
  }
}
