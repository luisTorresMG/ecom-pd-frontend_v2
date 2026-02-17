import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Vidaley } from '../../../shared/models/vidaley';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfig } from '../../../../../app.config';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { VidaleyService } from '../../../shared/services/vidaley.service';
import { finalize } from 'rxjs/operators';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-pago-efectivo-payment',
  templateUrl: './pago-efectivo-payment.component.html',
  styleUrls: ['./pago-efectivo-payment.component.css'],
})
export class PagoEfectivoPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('payment')
  content;

  modalRef: BsModalRef;

  vidaleyUser: Vidaley;

  successfullPayment = false;
  loading = false;
  valid = false;
  approve = false;

  paymentUrl: SafeResourceUrl;
  validMessages: string;
  messages: string[];

  constructor(
    private readonly sessionService: SessionService,
    private readonly vidaleyService: VidaleyService,
    private readonly modalService: BsModalService,
    private readonly sanitizer: DomSanitizer,
    private readonly appConfig: AppConfig,
    private readonly router: Router,
    private readonly issueService: EmisionService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};

    if (!this.vidaleyUser.ruc) {
      this.successfullPayment = true;
    } else {
      this.getPayment();
    }
  }

  getPayment() {
    this.loading = true;

    this.vidaleyService
      .getPagoEfectivoURL({
        idProcess: this.vidaleyUser.idProcess,
        tipoPago: 2,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (response) => {
          if (response.errorCode === '0') {
            this.issueService
              .registrarTracking(
                this.vidaleyUser.idProcess,
                this.googleService.getClientID(),
                this.vidaleyUser.amount
              )
              .subscribe(
                () => { },
                () => {
                  this.googleService.setGenericErrorEvent(
                    'Vida Ley - Paso 5',
                    'Registro de Client ID'
                  );
                }
              );
            this.getModal(response);
          }

          if (response.errorCode === 'EMISION_VALIDATON') {
            this.valid = false;
            this.approve = true;
            this.validMessages = response.errorDesc.toString().substr(1);
            this.messages = this.validMessages.split('|');
          }

          if (response.errorCode === 'PEFECTIVO_ERROR') {
            this.valid = true;
            this.approve = false;
            this.validMessages = response.errorDesc;
          }
        },
        () => {
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 5',
            'Generación de CIP'
          );
        }
      );
  }

  ngOnDestroy(): void {
    if (this.valid && this.approve) {
      this.cleanSession();
    }
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  getModal(response: any) {
    this.valid = true;
    this.approve = true;

    this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      response.errorDesc
    );

    this.modalRef = this.modalService.show(this.content);
  }

  goToMain() {
    this.cleanSession();
    this.router.navigate(['/sctr/step-1']);
  }

  cleanSession() {
    sessionStorage.clear();
  }
}
