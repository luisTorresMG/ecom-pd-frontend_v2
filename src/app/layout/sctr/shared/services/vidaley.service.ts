import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { ConfigService } from '../../../../shared/services/general/config.service';
import { map, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { GoogleTagManagerService } from './google-tag-manager.service';
import { TokenService } from '../../../soat/shared/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class VidaleyService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  baseURL: string;

  constructor(
    private readonly api: ApiService,
    private readonly configService: ConfigService,
    private readonly http: HttpClient,
    private readonly googleService: GoogleTagManagerService,
    private readonly tokenService: TokenService
  ) {
    this.baseURL = this.configService.getWebApiURL();
  }

  payments() {
    return this.api
      .get(`Sctr/FrecuenciaPago`)
      .pipe(map((response) => response));
  }

  activities() {
    return this.api.get('Sctr/Actividades').pipe(map((response) => response));
  }

  subActivities(id: number) {
    return this.api
      .get(`Sctr/Actividades/${id}`)
      .pipe(map((response) => response));
  }

  setUser(payload) {
    const data = JSON.stringify(payload);
    return this.api
      .postHeader('Sctr/cliente', data, this.headers)
      .pipe(map((response) => response));
  }

  setQuote(payload) {
    const data = JSON.stringify(payload);

    return this.api
      .postHeader('Sctr/cotizar', data, this.headers)
      .pipe(map((response) => response));
  }

  validateFile(payload): any {
    return this.http
      .post(`${this.baseURL}/Sctr/cotizar/validartrama`, payload)
      .pipe(
        map((response) => response),
        catchError((err) => {
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 3',
            'Pre-cotizar'
          );
          throw err;
        })
      );
  }

  getPagoEfectivoURL(payload) {
    const data = JSON.stringify(payload);

    return this.api.post('Sctr/pagoefectivo/generarcip', data).pipe(
      map((response) => response),
      catchError((err) => {
        this.googleService.setErrorEvent('');
        throw err;
      })
    );
  }

  getVisaPayment(payload) {
    const data = JSON.stringify(payload);

    return this.api.post('Sctr/emision', data).pipe(
      map((response) => response),
      catchError((err) => {
        this.googleService.setErrorEvent('');
        throw err;
      })
    );
  }

  sendRequest(payload) {
    return this.api.post('Sctr/solicitud', payload).pipe(
      map((response) => response),
      catchError((err) => {
        this.googleService.setErrorEvent('');
        throw err;
      })
    );
  }

  getPdf(payload) {
    return this.api.post('Sctr/slip/descarga', payload).pipe(
      map((response) => response),
      catchError((err) => {
        this.googleService.setErrorEvent('');
        throw err;
      })
    );
  }

  getSctrUserFromProcessId(tipoconsulta, id, tipodoc, numerodoc, emitido) {
    let data = JSON.stringify({ idProcess: id });

    if (tipoconsulta === 1) {
      data = JSON.stringify(
        {
          idProcess: id,
          tipoDocumento: tipodoc,
          numeroDocumento: numerodoc,
          emitido
        });
    }
    return this.api.post('Sctr/historico', data).pipe(
      map((response) => response),
      catchError((err) => {
        throw err;
      })
    );
  }
}
