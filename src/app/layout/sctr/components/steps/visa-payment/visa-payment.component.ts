import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfig } from '../../../../../app.config';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { Vidaley } from '../../../shared/models/vidaley';
import { Autorizacion } from '../../../../client/shared/models/autorizacion.model';
import { environment } from '../../../../../../environments/environment';
import { VidaleyService } from '../../../shared/services/vidaley.service';
import { finalize } from 'rxjs/operators';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';
import { NgxSpinnerService } from 'ngx-spinner';

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

  vidaleyUser: Vidaley;

  auth = new Autorizacion();
  errorFnCb = false;

  constructor(
    private readonly sessionService: SessionService,
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly modalService: BsModalService,
    private readonly appConfig: AppConfig,
    private readonly router: Router,
    private readonly vidaleyService: VidaleyService,
    private readonly googleService: GoogleTagManagerService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};
    this.visaToken = this.route.snapshot.params.id;
    this.visaSession = this.sessionService.getVisa();

    if (!this.vidaleyUser.ruc) {
      this.successfullPayment = true;
    } else if (this.visaToken) {
      this.getPayment();
    }
  }

  getPayment() {
    this.loading = true;
    this.vidaleyService
      .getVisaPayment({
        idProcess: this.vidaleyUser.idProcess,
        tipoPago: 1,
        token: this.visaToken,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (response) => {
          this.successfullCall = true;

          this.auth.authorizedAmount = response.authorizedAmount;
          this.auth.cardNumber = response.cardNumber;
          this.auth.orderNumber = response.orderNumber;
          this.auth.transactionDateTime = response.transactionDateTime;
          this.auth.fullDate = response.fullDate;
          this.auth.email = this.vidaleyUser.email;
          this.auth.phoneNumber = this.vidaleyUser.phoneNumber;
          this.auth.customerName = response.pdf_CustomerName;
          this.auth.errorMessage = response.errorDesc;
          this.auth.pdf_Id = response.pdf_ID;
          this.auth.numPolicyPension = response.numPolicyPension;
          this.auth.numPolicySalud = response.numPolicySalud;
          this.auth.id = this.vidaleyUser.idProcess;
          this.auth.description = 'Seguro SCTR';

          if (response.errorCode === '0') {
            this.valid = true;
            this.approve = true;

            this.googleService.setOrderPurchase(this.vidaleyUser);
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
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 5',
            'Autorizar pago VISA'
          );
        }
      );
  }

  showTermsAndConditions() {
    this.modalRef = this.modalService.show(this.content);
  }

  closeTermsModal() {
    this.modalRef.hide();
  }

  downloadPdf() {
    /*this.pdf = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${AppConfig.PD_API}/sctr/DownloadCustomerPdf/${this.auth.pdf_Id}`
    );*/
    this.spinner.show();
    this.sessionService.generarVoucherDigitalPdf(this.auth).subscribe(
      (res) => {
        this.downloadDigitalPdf(res);
        this.spinner.hide();
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

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
    this.router.navigate(['/sctr/step-1']);
  }

  ngOnDestroy(): void {
    if (this.valid && this.approve) {
      sessionStorage.clear();
    }
  }
}
