import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../../app.config';
import { ProductByUserRQ } from '../../../models/product/panel/Request/ProductByUserRQ';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    private apiOtp = AppConfig.URL_API_OTPAWS;
    constructor(private http: HttpClient) { }

    public getProductByUser(data: ProductByUserRQ): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/Product/ProductsByUser', request, { headers: this.headers });
    }

    public getEps(): Observable<any> {
        return this.http.post(this.Url + '/Product/EpsKuntur', '', { headers: this.headers });
    }

    public getDataSctr(data: any): Observable<any> {
      const request = JSON.stringify(data);
      return this.http.post(this.Url + '/Product/DataSctr', request, { headers: this.headers });
    }

    public getValidateUser (data: any): Observable<any> {
        const url = `${this.apiOtp}/security/globalAuthentication/v0/authentication`;
        console.log(data)

        const headersType = new HttpHeaders({
          'validation-type': '10'
        });

        if (data.authentication.userData?.processId) {
          return this.http.post(url, data, { headers: headersType });
        }

        return this.http.post(url, data);
    }

    public validateToken(data: any, token: string): Observable<any> {
        const url = `${this.apiOtp}/security/globalAuthentication/v0/authentication`;

        const headersToken = new HttpHeaders({
          'validation-type': '10',
          'validation-data': token
        });
        return this.http.post(url, data, { headers: headersToken });
    }

}
