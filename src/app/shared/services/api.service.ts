import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigService } from './general/config.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {
  url: string;
  headers = {};

  constructor(private http: HttpClient,
    private config: ConfigService) {
    this.headers = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json; charset=ISO-8859-1')
    };

    this.url = config.getWebApiURL();
  }

  public get(endpoint: string, params?: any, requestOptions?: any): Observable<any> {

    if (!requestOptions) {
      requestOptions = {
        params: new HttpParams()
      };
    }

    if (params) {
      requestOptions.params = new HttpParams();

      // tslint:disable-next-line:forin
      for (const p in params) {
        requestOptions.params.set(p, params[p]);
      }
    }

    requestOptions = this.setHeaders(requestOptions);

    return this.http.get(`${this.url}/${endpoint}`, requestOptions);
  }

  public post(endpoint: string, body: any, requestOptions?: any): Observable<any> {
    const reqOptions = this.setHeaders(requestOptions);

    return this.http.post(`${this.url}/${endpoint}`, body, reqOptions);
  }

  public postHeader(endpoint: string, body: any, header: HttpHeaders): Observable<any> {
    return this.http.post(`${this.url}/${endpoint}`, body, { headers: header });
  }

  public postHeader2(endpoint: string, body: any, header: HttpHeaders): Observable<any> {
    return this.http.post(endpoint, body, { headers: header });
  }
  public put(endpoint: string, body: any, requestOptions?: any): Observable<any> {
    const reqOptions = this.setHeaders(requestOptions);

    return this.http.put(`${this.url}/${endpoint}`, body, reqOptions);
  }

  public delete(endpoint: string, requestOptions?: any): Observable<any> {
    const reqOptions = this.setHeaders(requestOptions);

    return this.http.delete(`${this.url}/${endpoint}`, reqOptions);
  }

  public patch(endpoint: string, body: any, requestOptions?: any): Observable<any> {
    const reqOptions = this.setHeaders(requestOptions);

    return this.http.patch(`${this.url}/${endpoint}`, body, reqOptions);
  }

  private setHeaders(request) {
    return Object.assign(this.headers, request);
  }

}
