import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AppConfig } from '@root/app.config';
import { NgxSpinnerService } from 'ngx-spinner';
import { MainService } from '../../../services/main/main.service';
import { PaymentsService } from '../../../services/payments.service';

declare var VisanetCheckout: any;

@Component({
  selector: 'app-visa-test',
  templateUrl: './visa-test.component.html',
  styleUrls: ['./visa-test.component.css']
})
export class VisaTestComponent implements OnInit {

  form: FormGroup;
  visaSessionToken: any;

  @ViewChild('visaPay', { static: false, read: ElementRef }) visaPay: ElementRef;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _visaService: PaymentsService,
    private readonly _AppConfig: AppConfig,
    private readonly _spinner: NgxSpinnerService,
    private readonly _mainService: MainService
  ) {
    this.form = this._builder.group({
      ammount: [null],
      canal: ['2015000002'],
      codigoComercio: ['342062522'],
      flujo: [6],
      idProcess: ['4248361'],
      puntoVenta: [2]
    });

    this._mainService.getToken().subscribe(
      (res: any) => {
        localStorage.setItem('token', res.sequence);
      },
      (err: any) => {
        console.log(err);
      }
    );

  }

  ngOnInit(): void {
  }
  get f(): any {
    return this.form.controls;
  }
  submit() {
    this._spinner.show();

    const datos = {
      p_SCLIENT_APPPAT: 'p_SCLIENT_APPPAT',
      p_SCLIENT_APPMAT: 'p_SCLIENT_APPMAT',
      p_SCLIENT_NAME: 'p_SCLIENT_NAME',
    };
    sessionStorage.setItem('info-document', JSON.stringify(datos));




    const data = {
      idProcess: this.f['idProcess'].value,
      amount: this.f['ammount'].value,
      canal: this.f['canal'].value,
      puntoventa: this.f['puntoVenta'].value,
      flujo: this.f['flujo'].value,
      codigoComercio: this.f['codigoComercio'].value
    };


    const dataStep1: any = {
      'typeDoc': 2,
      'nDoc': '75197879',
      'email': 'soporte.protecta@devmente.com',
      'telefono': 987989789,
      'fechaNac': '03/12/1999',
      'terms': true,
      'privacy': false
    };
    sessionStorage.setItem('step1', JSON.stringify(dataStep1));

    const dataStep2: any = {
      'idProcess': this.f['idProcess'].value,
      'cantidadAnio': 8,
      'moneda': 1,
      'capital': 100000,
      'porcentajeRetorno': 100,
      'primaAnual': 1080,
      'primaMensual': 90,
      'primaRetorno': 8585,
      'primaInicial': 35,
      'primaFallecimiento': 100000,
      'plan': 1,
      'readExlusionCoverage': true,
      'beneficiarioLegal': true,
      'idTarifario': 1,
      'beneficiarios': [],
      'fechaInicio': '31/8/2021',
      'fechaFin': '31/8/2029'
    };
    sessionStorage.setItem('step2', JSON.stringify(dataStep2));


    this._visaService.generarSessionTokenGeneric(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        console.dir(res);
        const config = {
          action: AppConfig.ACTION_FORM_VIDA_VIDAINDIVIDUAL,
          timeoutUrl: `${location.protocol}//${location.hostname}${location.pathname}`,
          codigoComercio: res.codigoComercio
        };
        this.visaSessionToken = { ...config, ...res };
        window['initDFP'](res.deviceFingerPrintId, res.purchaseNumber, res.clientIp, res.codigoComercio);
      },
      (err: any) => {
        this._spinner.hide();
        console.error(err);
      }
    );
  }
  pagar() {
    this.insertVisaScript();
  }
  insertVisaScript() {
    // const time = new Date().getTime() / 1000;
    // const src = environment.visabuttonserviceRenovacion;

    /*if (this.isIEOrEdge) {
      src = `${window.location.origin}/assets/js/checkoutnomin.js?v=${time}`;
    }*/
    delete window['VisanetCheckout'];
    this._AppConfig.loadScriptSubscription(this.visaPay).then((loaded) => {
      const visaConfig = this.getSubscriptionConfig();
      VisanetCheckout.configure({
        ...visaConfig,
        complete: (params) => {
          // VisanetCheckout.open();
        },
      });
      VisanetCheckout.open();
    });
    return;
  }
  private getSubscriptionConfig() {
    return {
      action: AppConfig.ACTION_FORM_VIDA_VIDAINDIVIDUAL,
      method: 'POST',
      sessiontoken: this.visaSessionToken.sessionToken,
      channel: 'paycard',
      merchantid: this.f['codigoComercio'].value,
      merchantlogo: AppConfig.MERCHANT_LOGO_VISA,
      formbuttoncolor: '#ED6E00',
      formbuttontext: 'S/ ' + this.f['ammount'].value,
      purchasenumber: this.visaSessionToken.purchaseNumber,
      showamount: false,
      amount: this.visaSessionToken.amount.toString(),
      cardholdername: 'Nombre Test',
      cardholderlastname: 'Apellido Test',
      cardholderemail: 'antifraude_prueba@gmail.com',
      expirationminutes: '20',
      timeouturl: window.location + '/vidadevolucion/renovation/visa',
      usertoken: null,
    };
  }
}
