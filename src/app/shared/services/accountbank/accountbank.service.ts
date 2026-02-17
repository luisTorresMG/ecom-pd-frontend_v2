import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AcountBank } from '../../models/accountbank/accountbank';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AccountBankService {
  ListAcountBank: any[];
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  _baseUrl = '';
  constructor(private http: HttpClient, private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }
  getAccountBankPostBank(account: AcountBank) {
    const body = JSON.stringify(account);
    return this.http
      .post(this._baseUrl + '/AccountBank/GetAccountBank', body, {
        headers: this.headers
      })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }
}
