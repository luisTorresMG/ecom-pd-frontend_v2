import {
  Directive,
  ElementRef,
  OnInit,
  Renderer2,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SessionToken } from '../../client/shared/models/session-token.model';
import { AppConfig } from '../../../app.config';
import { NgZone } from '@angular/core';

declare var VisanetCheckout: any;

@Directive({
  selector: '[appVisaButtonATP]',
})
// tslint:disable-next-line:directive-class-suffix
export class VisaButtonATPDirective implements OnInit, OnDestroy, OnChanges {
  @Input()
  config: SessionToken;

  @Input()
  codigoComercio: string;

  @Input()
  cardName: string;

  @Input()
  cardLastName: string;

  @Input()
  cardEmail: string;

  @Input()
  amount: number;

  @Input()
  amountWithSimbol: string;

  @Output()
  complete = new EventEmitter<any>();

  @Output()
  myClick = new EventEmitter<void>();

  isIEOrEdge: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private appConfig: AppConfig,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(
      window.navigator.userAgent
    );

    this.insertVisaScript();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config && !changes.config.isFirstChange()) {
      delete window['VisanetCheckout'];
      this.insertVisaScript();
    }
  }

  insertVisaScript() {
    const time = new Date().getTime() / 1000;
    const src = environment.visabuttonserviceRenovacion;

    /*if (this.isIEOrEdge) {
      src = `${window.location.origin}/assets/js/checkoutnomin.js?v=${time}`;
    }*/
    this.loadScriptSubscription(src).then((loaded) => {
      const visaConfig = this.getSubscriptionConfig();
      const btn = document.querySelector('.visaBtn');
      VisanetCheckout.configure({
        ...visaConfig,
        complete: (params) => {
          console.log(params);
          this.complete.emit(params);
          // VisanetCheckout.open();
        },
      });
      btn.addEventListener('click', () => {
        VisanetCheckout.open();
      });
      // VisanetCheckout.open();
      if (loaded) {
        // this.el.nativeElement.style.display = 'none';
        this.appConfig.AddEventAnalityc();
      }
    });

    return;
  }

  ngOnDestroy() {
    delete window['VisanetCheckout'];
  }

  private getSubscriptionConfig() {
    return {
      action: AppConfig.ACTION_FORM_VIDA_VIDAINDIVIDUAL,
      method: 'POST',
      sessiontoken: this.config.sessionToken,
      channel: 'paycard',
      merchantid: this.codigoComercio,
      merchantlogo: AppConfig.MERCHANT_LOGO_VISA,
      formbuttoncolor: '#ED6E00',
      formbuttontext: this.amountWithSimbol || 'Pagar',
      purchasenumber: this.config.purchaseNumber,
      showamount: false,
      amount: this.amount,
      cardholdername: this.cardName,
      cardholderlastname: this.cardLastName,
      cardholderemail: this.cardEmail,
      expirationminutes: '20',
      timeouturl: window.location + '/vidadevolucion/renovation/visa',
      usertoken: null,
    };
  }

  private loadScriptSubscription(src: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.setAttribute('src', src);

      this.renderer.insertBefore(
        this.el.nativeElement.parentNode,
        script,
        this.el.nativeElement
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
}
