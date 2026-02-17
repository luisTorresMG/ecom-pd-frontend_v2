import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { BankService } from '../../../services/bank/bank.service';
import { AccountBankService } from '../../../services/accountbank/accountbank.service';
import { AcountBank } from '../../../models/accountbank/accountbank';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {
  @Output() evResultBank = new EventEmitter();
  ResultBank = 0;
  @Output() evResultAccountBank = new EventEmitter();
  ResultAccountBank = 0;
  mensaje: string;
  banks: any[];
  ListAccountBank: any[];
  accountbank = new AcountBank(0, 0, '');
  constructor(private bankService: BankService,
    private accountbankService: AccountBankService
  ) { }

  ngOnInit() {
    this.bankService.getPostBank()
      .subscribe(
        data => {
          this.banks = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwBank(resultBank: number, resuttext: string) {
    this.evResultBank.emit({ id: resultBank, text: resuttext });
  }
  throwAccountBank(resultAccountBank: number, resuttext: string) {
    this.evResultAccountBank.emit({ id: resultAccountBank, text: resuttext });
  }
  onSelectAccountBank(event: any) {
    const accountbankId = event.target.value;
    const accountbanktext = event.target.options[event.target.selectedIndex].text;
    this.ResultAccountBank = accountbankId;
    this.throwAccountBank(accountbankId, accountbanktext);
  }
  onSelectBank(event: any) {
    const bankId = event.target.value;
    const banktext = event.target.options[event.target.selectedIndex].text;
    this.ResultBank = bankId;
    this.accountbank.nidbank = Number(bankId);
    this.accountbankService.getAccountBankPostBank(this.accountbank);
    this.throwBank(bankId, banktext);
    if (bankId === '0') {
      this.ListAccountBank = [];
    } else {
      this.accountbankService.getAccountBankPostBank(this.accountbank)
        .subscribe(
          data => {
            this.ListAccountBank = <any[]>data;
          },
          error => {
            console.log(error);
          }
        );
    }
  }
}


