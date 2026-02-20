import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { KushkiService } from '@shared/services/kushki/kushki.service';
import {IKushki} from '@shared/interfaces/kushki.interface';

interface ICurrency {
  symbol: 'S/' | '$';
  prefix: 'PEN' | 'USD';
}

@Component({
  standalone: false,
  selector: 'app-kushki-payment-summary',
  templateUrl: './kushki-payment-summary.component.html',
  styleUrls: ['./kushki-payment-summary.component.sass'],
  providers: [KushkiService],
})
export class KushkiPaymentSummaryComponent implements OnInit {
  currencies: Record<number, ICurrency> = {
    1: {
      symbol: 'S/',
      prefix: 'PEN',
    },
    2: {
      symbol: '$',
      prefix: 'USD',
    },
  };
    payload!: IKushki;
   paymentTypeControl!: FormControl;
 

  constructor(
    private readonly builder: FormBuilder,
    private readonly kushkiService: KushkiService
  ) {
      this.payload = this.kushkiService.getPaymentInfo();
      this.paymentTypeControl = this.builder.control('');
  }

  ngOnInit(): void {
    this.paymentTypeControl.setValue(this.payload.payment.allowedMethods[0]);
  }
}
