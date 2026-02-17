import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IParamaters } from '../interfaces/parameters.interface';

@Injectable({
  providedIn: 'root',
})
export class VisaTestingService {
  private readonly urlApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getParameters({ branchId, productId }): Observable<Array<IParamaters>> {
    const url = `${this.urlApi}/pago/niubiz/codigosComercio/${branchId}/${productId}`;
    return this.http
      .get(url)
      .pipe(
        map((response: any) => (response.data ?? []) as Array<IParamaters>)
      );
  }

  getSessionToken(payload: any): Observable<any> {
    const url = `${this.urlApi}/pago/niubiz/token`;
    return this.http.post(url, payload).pipe(
      map((response: any) => {
        if (payload.tipoCanal == 'paycard') {
          window['initDFP'](
            response.data?.niubiz?.deviceFingerPrintId,
            response.data?.niubiz?.numeroCompra,
            response.data?.niubiz?.ip,
            response.data?.niubiz?.codigoComercio
          );
        }
        return response.data;
      })
    );
  }

  getPaymentStatus(payload: any): Observable<any> {
    const url = `${this.urlApi}/pago/niubiz/pago`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
}
