import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Bank } from '../../models/bank/bank';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class BankService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';
  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostBank() {
    return this.http.get(this._baseUrl + '/Bank/', { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

}
