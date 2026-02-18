import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../app.config';
import { PaymentVisaResponse } from '../../../layout/vidaindividual-latest/models/payment-visa.model';
import { QuotationRequest, QuotationResponse } from '../models/quotation.model';
import { ApiService } from '@shared/services/api.service';
import { map } from 'rxjs/operators';
import { TokenNiubiz } from '../interfaces/token-niubiz.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private URI_API: string;
  constructor(
    private readonly _http: HttpClient,
    private readonly apiService: ApiService
  ) {
    this.URI_API = AppConfig.PD_API;
  }
  generarCip(data: any): Observable<any> {
    const url = `${this.URI_API}/AccidentesPersonales/pagoefectivo/generarcip`;
    const call = this._http.post(url, data);
    const data$ = new Observable((obs) => {
      call.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }
  generarSessionTokenGeneric(idProcess, amount, canal, puntoventa, flujo) {
    const data = {
      Amount: amount,
      IdProcess: idProcess,
      Canal: canal,
      PuntoVenta: puntoventa,
      Flujo: flujo,
    };
    const base = {
      data: btoa(JSON.stringify(data)),
    };
    const url = `${this.URI_API}/Pago/GenerateVisaSecurityToken`;
    const call = this._http.post(url, base);
    const data$ = new Observable((obs) => {
      call.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }
  consultarEstadoPago(data: {
    idProcess: number;
    token?: string;
    idClienteGoogle: string;
    idSesionTransaccion?: string;
  }): Observable<PaymentVisaResponse> {
    const url = `${this.URI_API}/AccidentesPersonales/emision`;
    const call: Observable<any> = this._http.post(url, data);
    const data$: Observable<PaymentVisaResponse> = new Observable((obs) => {
      call.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }
  descargarCotizacion(data: QuotationRequest): Observable<QuotationResponse> {
    const url = `${this.URI_API}/AccidentesPersonales/slip/descarga`;
    const call: Observable<any> = this._http.post(url, data);
    const data$: Observable<QuotationResponse> = new Observable((obs) => {
      call.subscribe(
        (res: QuotationResponse) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  getTokenNiubiz(idProcess: number): Observable<TokenNiubiz> {
    return this.apiService
      .get(`AccidentesPersonales/niubiz/token/${idProcess}`)
      .pipe(map((response) => response.data));
  }
}
