import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { ConfigService } from '../../../../shared/services/general/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { AppConfig } from '@root/app.config';

@Injectable({
  providedIn: 'root',
})
export class SoatUserService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  baseURL: string;
  private readonly wspdUrlApi: string = AppConfig.WSPD_API;

  derivationSubject: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly api: ApiService,
    private readonly configService: ConfigService,
    private readonly http: HttpClient
  ) {
    this.baseURL = this.configService.getWebApiURL();
  }

  payments(payload) {
    const data = JSON.stringify(payload);

    return this.api
      .postHeader('emissionproc/ProcessRenovation', data, this.headers)
      .pipe(map((response) => response));
  }

  emissionProcessCompletePolicy(
    transactionToken,
    sessionToken,
    processId,
    flujoId
  ) {
    const endpoint = 'emissionproc';
    const action = 'renovation';
    const url = `${endpoint}/${action}`;

    const data = {
      TransactionToken: transactionToken,
      SessionToken: sessionToken,
      ProcesoId: processId,
      FlujoId: flujoId,
    };

    return this.api.post(url, data);
  }

  getUserFromProcessId(pId: string) {
    return this.api.get(`Emission/proceso/${pId}`);
  }

  validateEmail(email: string): Observable<{
    bloqueado: boolean;
    correo: string;
    success: boolean;
    message: string;
  }> {
    const url = `${this.wspdUrlApi}/soat/validarCorreo/${email}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  validateDocument(payload: {
    documento: string;
    correo: string;
    canal: string;
  }): Observable<any> {
    const url = `${this.wspdUrlApi}/soat/validar/ventasInusuales`;
    return this.http
      .post(url, {
        ...payload,
        noBase64: true,
      })
      .pipe(map((response: any) => response.data));
  }

  notificationUnusualSale(payload: any): Subscription {
    const url = `${this.wspdUrlApi}/notificacion/derivacion/asesor`;
    return this.http
      .post(url, {
        ...payload,
        noBase64: true,
      })
      .subscribe();
  }
}
