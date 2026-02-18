import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../app.config';
import { DocumentResponse } from '../models/document.model';
@Injectable({
  providedIn: 'root',
})
export class ValidateQuotationService {
  API_URI: string;
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
  }
  getLocation(data: any, type: string): Observable<any> {
    const URL = `${this.API_URI}/${type}`;
    const dataToBase64: any = {
      data: btoa(JSON.stringify(data)),
    };
    const POST$ = this._http.post(URL, dataToBase64);
    const DATA$: Observable<any> = new Observable((obs) => {
      POST$.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  getParametros(): Observable<any> {
    const URL = `${this.API_URI}/VidaIndividual/parametros`;
    const POST$ = this._http.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      POST$.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }
  generarCotizacion(data: any): Observable<any> {
    const url = `${this.API_URI}/AccidentesPersonales/paso3`;

    const req = {
      idProcess: data.idProcess,
      plan: data.plan,
      coberturas: data.coberturas,
      beneficios: data.beneficios,
      asistencias: data.asistencias,
      cantidadAsegurados: data.cantidadAsegurados,
    };

    const call = this._http.post(url, req);
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
}
