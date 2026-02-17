import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class CurrencyTypeService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';
  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }
  getPostCurrencyType(currencyType: any) {
    const body = JSON.stringify(currencyType);
    return this.http.post(this._baseUrl + '/Currency/', { body }, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
}
