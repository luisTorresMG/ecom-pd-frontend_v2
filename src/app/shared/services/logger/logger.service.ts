import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../general/config.service';
import { Logger } from '../../models/logger/logger';
import { ApiService } from '../api.service';


@Injectable()
export class LoggerService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  _baseUrl = '';

  constructor(private configService: ConfigService,
    private http: HttpClient,
    private api: ApiService) {
    this._baseUrl = configService.getWebApiURL();
  }

  addLogger(Parametros: Logger) {
    const body = JSON.stringify(Parametros);
    return this.http
      .post(this._baseUrl + '/logger/addlogger', body, {
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
