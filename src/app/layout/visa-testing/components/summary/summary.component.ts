import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';

import { VisaTestingService } from '../../shared/services/visa-testing.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.sass'],
})
export class SummaryComponent implements OnInit {
  paymentResponse: any = null;
  requestPaymentStatus: any;

  constructor(
    private readonly visaTestingService: VisaTestingService,
    private readonly spinner: NgxSpinnerService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getPaymentStatus();
  }

  getPaymentStatus(): void {
    const req = JSON.parse(sessionStorage.getItem('visa-testing-ps'));

    const payload = {
      idPayment: req.processId || 0,
      token: this.activatedRoute.snapshot.paramMap.get('token'),
    };

    this.requestPaymentStatus = payload;

    this.spinner.show();
    this.visaTestingService.getPaymentStatus(payload).subscribe({
      next: (response: any) => {
        this.paymentResponse = response;
      },
      error: (error: any) => {
        console.error(error);
        this.paymentResponse = {
          complete: true,
          success: false,
          description: 'Tenemos problemas para validar la información.',
          ammount: `${req.currencyType == 1 ? 'S/' : '$'} ${req.ammount}`,
        };
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
}
