import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    OnDestroy,
    Renderer2,
    ChangeDetectorRef
} from '@angular/core';
import { AppConfig } from '../../../app.config';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-button-visa',
    templateUrl: './button-visa.component.html',
    styleUrls: ['./button-visa.component.css']
})

export class ButtonVisaComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    action: string;
    isIEOrEdge: any;
    method = 'POST';
    src = environment.visabuttonservice;
    bMovido = false;
    @Input()
    sessionToken: string;
    subscribe;

    @Input()
    merchantId = environment.codigocomercio;

    @Input()
    canalId = 'web';

    @Input()
    buttonSize = 'MEDIUM'; // SMALL, MEDIUM, LARGE
    @Input()
    buttonColor?: string; // NAVY o GRAY
    @Input()
    merchantLogo?: string; // Url interna de la imagen
    @Input()
    merchantName = AppConfig.MERCHANT_NAME_VISA;
    @Input()
    formButtonColor = '#ED6E00';
    @Input()
    showAmount?: string; // True o False
    @Input()
    amount: string;
    @Input()
    purchaseNumber: string;
    @Input()
    cardHolderName?: string; // Opcional
    @Input()
    cardHolderLastName?: string; // Opcional
    @Input()
    cardHolderEmail?: string; // Opcional
    @Input()
    userToken?: string; // Opcional
    @Input()
    userId: string;
    @Input()
    timeouturl: string;
    i;
    form;
    interval;

    constructor(private ref: ChangeDetectorRef, private renderer: Renderer2) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.InjectFormulario();
    }

    ngOnDestroy() {
    }
    private InjectFormulario() {
        this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
        const urlsrc = window.location.origin;
        this.src = environment.visabuttonservice + '?v=' + Math.floor(new Date().getTime() / 1000);
        if (this.isIEOrEdge) {
            this.src = urlsrc + '/assets/js/checkoutnomin.js?v=' + Math.floor(new Date().getTime() / 1000);
        }
        const div = document.body.getElementsByClassName('btn-visa');
        if (div[0]) {
            while (div[0].hasChildNodes()) {
                div[0].removeChild(div[0].lastChild);
            }
        }
        this.form = document.createElement('form');
        const script = document.createElement('script');
        this.form.setAttribute('id', 'frmvisa');
        this.form.setAttribute('action', this.action);
        this.form.setAttribute('method', this.method);

        script.setAttribute('src', this.src);
        script.setAttribute('data-sessiontoken', this.sessionToken);
        script.setAttribute('data-merchantid', this.merchantId);

        if (this.buttonSize) {
            script.setAttribute('data-buttonsize', this.buttonSize);
        }
        if (this.buttonColor) {
            script.setAttribute('data-buttoncolor', this.buttonColor);
        }

        if (this.merchantLogo) {
            script.setAttribute('data-merchantlogo', this.merchantLogo);
        } else {
            script.setAttribute('data-merchantname', this.merchantName);
        }

        if (this.formButtonColor) {
            script.setAttribute('data-formbuttoncolor', this.formButtonColor);
        }
        if (this.showAmount) {
            script.setAttribute('data-showamount', this.showAmount);
        }

        script.setAttribute('data-amount', this.amount);
        script.setAttribute('data-purchasenumber', this.purchaseNumber);

        if (this.cardHolderName) {
            script.setAttribute('data-cardholdername', this.cardHolderName);
        }
        if (this.cardHolderLastName) {
            script.setAttribute('data-cardholderlastname', this.cardHolderLastName);
        }
        if (this.cardHolderEmail) {
            script.setAttribute('data-cardholderemail', this.cardHolderEmail);
        }
        if (this.userToken) {
            script.setAttribute('data-usertoken', this.userToken);
        }

        script.setAttribute('data-channel', this.canalId);
        script.setAttribute('data-expirationminutes', '20');
        script.setAttribute('data-timeouturl', this.timeouturl);

        this.form.appendChild(script);

        if (this.isIEOrEdge) {
            document.body.appendChild(this.form);
            this.bMovido = false;
            const source = setInterval(this.CadaIntervalo, 1000);
        } else {
            div[0].appendChild(this.form);
            this.interval = setInterval(() => {
                const btn = document.body.getElementsByClassName('start-js-btn modal-opener medium');
                if (btn[0] !== undefined) {
                    const actual = btn[0].getAttribute('style');
                    if (actual !== null) {
                        if (actual.indexOf('vnforapps') > -1) {
                            btn[0].attributes[2].value =
                                this.canalId === 'web' ?
                                    'background: url("assets/logos/pagaconvisa.png");' : 'background: url("assets/logos/pagacontelepago.png");';
                            clearInterval(this.interval);
                        }
                    }
                }
            }, 1000);
        }
        this.ref.markForCheck();
    }

    CadaIntervalo() {
        const div = document.body.getElementsByClassName('btn-visa');
        const visawraper = document.getElementById('visaNetWrapper');
        if (visawraper != null && div != null && visawraper.parentElement.nodeName.toString() === 'BODY') {
            const newForm = document.getElementsByTagName('form');
            div[0].appendChild(newForm[0]);
        }

    }
}
