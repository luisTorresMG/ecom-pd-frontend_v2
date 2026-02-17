import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { ShopService } from '../services/shop.service';
import { Autorizacion } from '../../layout/client/shared/models/autorizacion.model';
import { AppConfig } from '@root/app.config';
@Component({
  selector: 'app-visa-payment',
  templateUrl: './visa-payment.component.html',
  styleUrls: ['./visa-payment.component.css'],
})
export class VisaPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('payment')
  content;

  modalRef: BsModalRef;

  visaToken: string;
  visaSession: any;

  pdf = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

  successfullPayment = false;
  valid = false;
  approve = false;
  validationMessage: string;
  messages: string[];
  successfullCall = false;
  loading = false;

  auth = new Autorizacion();
  errorFnCb = false;

  shoppingCart: any;
  shoppingCartTotal = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly modalService: BsModalService,
    private readonly router: Router,
    private readonly shopService: ShopService,
    private readonly _appConfig: AppConfig
  ) { }

  ngOnInit() {
    this.shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart'));
    this.shoppingCartTotal = +sessionStorage.getItem('shoppingCartTotal');
    this.visaToken = this.route.snapshot.params.id;
    this.visaSession = JSON.parse(sessionStorage.getItem('visa')) || {};

    // if (!this.vidaleyUser.ruc) {
    //   this.successfullPayment = true;
    // } else if (this.visaToken) {
    //   this.getPayment();
    // }
    this.getPayment();
  }

  getPayment() {
    console.log('HEY!');
    this.loading = true;
    this.shopService
      .getVisaPayment(this.getPaymentPayload())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (response) => {
          this.successfullCall = true;

          this.auth.authorizedAmount = response.authorizedAmount;
          this.auth.cardNumber = response.cardNumber;
          this.auth.orderNumber = response.orderNumber;
          this.auth.transactionDateTime = response.transactionDateTime;
          this.auth.fullDate = response.fullDate;
          //   this.auth.email = this.vidaleyUser.email;
          //   this.auth.phoneNumber = this.vidaleyUser.phoneNumber;
          this.auth.customerName = response.pdf_CustomerName;
          this.auth.errorMessage = response.errorDesc;
          this.auth.pdf_Id = response.pdf_ID;
          this.auth.numPolicy = response.numPolicy;
          //   this.auth.id = this.vidaleyUser.idProcess;
          this.auth.description = 'Ecommerce';
          this.auth.producto = 'Ecommerce';
          if (response.errorCode === '0') {
            this.valid = true;
            this.approve = true;
          }

          if (response.errorCode === 'PAGO_VALIDATON') {
            this.valid = true;
            this.approve = false;
            this.validationMessage = response.errorDesc;
          }

          if (response.errorCode === 'EMISION_VALIDATON') {
            this.valid = false;
            this.approve = true;
            this.validationMessage = response.errorDesc
              ? response.errorDesc.toString().substr(1)
              : '';
            this.messages = this.validationMessage.split('|');
          }

          if (!response.errorCode) {
            this.successfullCall = false;
          }
        },
        () => {
          this.successfullCall = false;
          this.approve = false;
          this.errorFnCb = true;
        }
      );
  }

  getPaymentPayload() {
    return {
      IdProcess: this.visaSession.idProcess,
      tipoPago: 1,
      token: this.visaToken,
      procesos: [
        ...this.shoppingCart.soat.map((item) => ({
          processId: item.soat._nidProcess,
          amount: item.rate.precio,
          type: 'soat',
        })),
        ...this.shoppingCart.vidaley.map((item) => ({
          processId: item.vidaley.idProcess,
          amount: item.vidaley.amount,
          type: 'vidaley',
        })),
        ...this.shoppingCart.sctr.map((item) => ({
          processId: item.sctr.idProcess,
          amount: item.sctr.amount,
          type: 'sctr',
        })),
      ],
    };
  }

  showTermsAndConditions() {
    this.modalRef = this.modalService.show(this.content);
  }

  closeTermsModal() {
    this.modalRef.hide();
  }

  //   downloadPdf() {
  //     this.sessionService.generarVoucherDigitalPdf(this.auth).subscribe(
  //       (res) => {
  //         this.downloadDigitalPdf(res);
  //       },
  //       (err) => {
  //         console.log(err);
  //       }
  //     );
  //   }

  downloadDigitalPdf(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  goToMain() {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Compra realizada - Visa',
      'Realizar otra Compra',
      '(not available)'
    );
    this.router.navigate(['/shop']);
  }

  ngOnDestroy(): void {
    if (this.valid && this.approve) {
      sessionStorage.clear();
    }
  }
}
