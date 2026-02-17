import { Component, OnInit, ViewChild } from '@angular/core';
import { Vidaley } from '../../../shared/models/vidaley';
import { Router } from '@angular/router';
import { VidaleyService } from '../../../shared/services/vidaley.service';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { VisaService } from '../../../../../shared/services/pago/visa.service';
import { Selling } from '../../../../soat/shared/interfaces/selling.interface';
import { environment } from '../../../../../../environments/environment';
import { AppConfig } from '../../../../../app.config';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.css'],
})
export class Step5Component implements OnInit {
  @ViewChild('peModal') content;

  @ViewChild('shoppingCart')
  shoppingCartModal: ViewChild;

  vidaleyUser: Vidaley;
  visaSessionToken: any;
  selling: Selling;
  moreInfo = false;

  loadingDownload = true;
  pdfResponse = <any>{};
  modalRef: BsModalRef;

  ecommerce = false;
  ecommerceModal: BsModalRef;

  constructor(
    private readonly router: Router,
    private readonly vidaleyService: VidaleyService,
    private readonly sessionService: SessionService,
    private readonly modalService: BsModalService,
    private readonly visaService: VisaService,
    private readonly spinner: NgxSpinnerService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};
    this.googleService.setSummary(this.vidaleyUser);
    this.getVisaToken();
    this.ecommerce = this.isEcommerce();

    setTimeout(() => {
      this.vidaleyService
        .getPdf({ idProcess: this.vidaleyUser.idProcess })
        .subscribe((response) => {
          this.pdfResponse = response;
          this.loadingDownload = false;
        });
    }, 16000);
  }

  openPagoEfectivoInfo() {
    this.modalRef = this.modalService.show(this.content);
  }

  visaClick() {
    this.googleService.setSummaryAction('Visanet');
  }

  downloadPdf(e) {
    this.googleService.setSummaryAction('Descargar cotización');
    e.preventDefault();
    this.spinner.show();
    if (this.pdfResponse.archivo) {
      this.downloadSlip();
    } else {
      setTimeout(() => {
        this.vidaleyService
          .getPdf({ idProcess: this.vidaleyUser.idProcess })
          .subscribe(
            (response) => {
              this.pdfResponse = response;
              this.downloadSlip();
            },
            () => {
              this.googleService.setGenericErrorEvent(
                'Vida Ley - Paso 5',
                'Descargar cotización'
              );
            }
          );
      }, 3000);
    }
  }

  downloadSlip() {
    let linkSource = 'data:application/pdf;base64,';
    linkSource += this.pdfResponse.archivo;
    const a = document.createElement('a');
    a.setAttribute('href', linkSource);
    a.setAttribute('download', this.pdfResponse.nombre);
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    this.spinner.hide();
    a.click();
    a.remove();
  }

  getVisaToken() {
    this.visaService
      .generarSessionToken(
        this.vidaleyUser.idProcess,
        this.vidaleyUser.amount,
        environment.canaldeventadefault,
        environment.puntodeventadefault,
        5,
        77,
        1
      )
      .subscribe((response) => {
        const config = {
          action: AppConfig.ACTION_FORM_VISA_SCTR_ECOMMERCE,
          timeoutUrl: '/sctr/step-5',
        };

        this.visaSessionToken = { ...config, ...response };
        this.visaSessionToken.flow = 'sctr';
        this.sessionService.saveToLocalStorage('visa', this.visaSessionToken);
      });
  }

  onPayment() {
    this.googleService.setSummaryAction('Pago Efectivo');
    this.router.navigate(['sctr/payment/pago-efectivo']);
  }

  showMoreInfo() {
    this.moreInfo = true;
  }

  isEcommerce() {
    return sessionStorage.getItem('ecommerce') === 'sctr';
  }

  showEcommerceModal() {
    this.ecommerceModal = this.modalService.show(this.shoppingCartModal);
  }

  closeModal() {
    this.ecommerceModal.hide();
  }
}
