import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private apiUrlPD: string = AppConfig.PD_API;
  private apiUrlWSPD: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getResumenInfo(idProcess: number): Observable<any> {
    const url = `${this.apiUrlWSPD}/vidaGrupo/resumen/${idProcess}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getTokenNiubiz(idProcess: number): Observable<any> {
    const url = `${this.apiUrlWSPD}/vidaGrupo/niubiz/token/${idProcess}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  emission(payload: any): Observable<any> {
    const url = `${this.apiUrlWSPD}/vidaGrupo/emision`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  obtenerMetodoPago(data: any): Observable<any> {
    const url = `${this.apiUrlWSPD}/pago/tipo/obtener`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  public getClientID() {
    try {
      var cookie = this.getCookie('_ga').split('.');
      return cookie[2] + '.' + cookie[3];
    } catch (e) {
      console.log('No Universal Analytics cookie found');
    }
  }

  private getCookie(name: any) {
    var re = new RegExp(name + '=([^;]+)');
    var value = re.exec(document.cookie);
    return value != null ? unescape(value[1]) : '';
  }

  public getSessionID() {
    const pattern = /_ga_34TTLR6HF7=GS\d\.\d\.(.+?)(?:;|$)/;
    const match = document.cookie.match(pattern);
    const parts = match?.[1].split('.');
    return parts?.shift();
  }
}
