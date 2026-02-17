import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { FlowType } from '../../models/flowtype/flowtype';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class FlowTypeService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostFlowType(stateSales: FlowType) {
    const body = JSON.stringify(stateSales);
    return this.http.post(this._baseUrl + '/FlowType/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
}
