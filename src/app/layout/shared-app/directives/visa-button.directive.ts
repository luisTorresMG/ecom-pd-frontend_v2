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
  HostListener,
  NgZone,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SessionToken } from '../../client/shared/models/session-token.model';
import { AppConfig } from '../../../app.config';

@Directive({
  selector: '[appVisaButton]',
})
export class VisaButtonDirective implements OnInit, OnDestroy, OnChanges {
  @Input()
  config: SessionToken;

  @Input()
  amount: number;

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
      document.getElementById('soatVisaScript').remove();
      this.insertVisaScript();
    }
  }

  insertVisaScript() {
    const time = new Date().getTime() / 1000;
    let src = `${environment.visabuttonservice}?v=${time}`;

    if (this.isIEOrEdge) {
      src = `${window.location.origin}/assets/js/checkoutnomin.js?v=${time}`;
    }

    this.loadScript(src).then((loaded) => {
      const btn = document.querySelector('.start-js-btn.modal-opener.medium');

      if (btn) {
        btn['style'].background = `url("${this.el.nativeElement.src}")`;
        btn['style'].backgroundSize = '140px 50px';
        btn['style'].backgroundRepeat = 'no-repeat';
        btn['style'].boxShadow = '0 0px 0';

        btn['style'].outline = 'none';
        btn['style'].width = '140px';
        btn['style'].height = '50px';
        btn['style'].cursor = 'pointer';

        btn.addEventListener('click', () => {
          this.ngZone.run(() => {
            this.myClick.next();
          });
        });
      }

      if (loaded) {
        this.el.nativeElement.style.display = 'none';
      }
    });
  }

  @HostListener('click', ['$event'])
  onClick() {
    this.myClick.next();
  }

  ngOnDestroy() {
    delete window['VisanetCheckout'];
  }

  private loadScript(src: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      const form = this.renderer.createElement('form');

      form.setAttribute(
        'action',
        this.config['action'] || AppConfig.ACTION_FORM_VISA_SOAT
      );
      form.setAttribute('method', 'POST');
      form.setAttribute('id', 'soatVisaScript');
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('charset', 'utf-8');
      script.setAttribute('async', true);
      script.setAttribute('data-buttonsize', 'MEDIUM');
      script.setAttribute('data-showamount', 'FALSE');
      script.setAttribute('data-channel', 'web');
      script.setAttribute('data-expirationminutes', '20');
      script.setAttribute(
        'data-timeouturl',
        this.config['timeoutUrl'] || 'soat/step4'
      );
      script.setAttribute('data-showamount', true);
      script.setAttribute('data-formbuttoncolor', '#ED6E00');
      script.setAttribute('data-sessiontoken', this.config.sessionToken);
      script.setAttribute('data-merchantid', this.config['merchantid'] || environment.codigocomercio);

      if (this.config.flow === 'vidaley') {
        script.setAttribute('data-merchantid', environment.codigocomercioVidaLey);
      }

      if (this.config.flow === 'sctr') {
        script.setAttribute('data-merchantid', environment.codigocomercioSctr);
      }

      if (this.config.flow === 'eshop') {
        script.setAttribute('data-merchantid', environment.codigoComercioShop);
      }

      if (this.config.flow === 'vidaindividual') {
        script.setAttribute('data-merchantid', environment.codigocomercioATP);
        script.setAttribute('data-channel', 'paycard');
      }

      if (this.config.flow === 'accidentespersonales') {
        script.setAttribute('data-merchantid', environment.codigocomercioAP);
      }

      if (this.config.flow === 'soat') {
        script.setAttribute('data-merchantid', environment.codigocomercio);
      }

      script.setAttribute('src', src);
      script.setAttribute('data-amount', this.amount);
      script.setAttribute('data-purchasenumber', this.config.purchaseNumber);
      script.setAttribute('data-merchantlogo', AppConfig.MERCHANT_LOGO_VISA);
      this.renderer.appendChild(form, script);

      this.renderer.insertBefore(
        this.el.nativeElement.parentNode,
        form,
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
