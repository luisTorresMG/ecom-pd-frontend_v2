import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { StateSales } from '../../models/statesales/statesales';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class StateSalesService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostStateSales(stateSales: StateSales) {
    const body = JSON.stringify(stateSales);
    return this.http.post(this._baseUrl + '/StateSales/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
}
