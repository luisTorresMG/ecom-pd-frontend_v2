import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '@root/app.config';
import { IHistoryRequest, IPaymentEnabledRequest, IUpdatePayment } from '../../interfaces/payment-maintenance.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentMaintenanceService {
  private readonly urlApi = AppConfig.WSPD_API;
  
  constructor(
    private readonly http: HttpClient,
  ) {}

  getlistApplications(): Observable<any> {
    const url = `${this.urlApi}/medioPago/mantenimiento/listado/aplicaciones`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
  getlistPaymentEnabled(payload: IPaymentEnabledRequest): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/medioPago/mantenimiento/listado`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getlistHistory(payload: IHistoryRequest): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/medioPago/mantenimiento/historial`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  updateEnabledPayment(payload: IUpdatePayment): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/medioPago/mantenimiento/actualizar`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }
}
