import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { Step1Request, Step1Response } from '../../models/step1.model';
import {
  DocumentRequest,
  DocumentResponse,
  DocumentMigrationsResponse,
} from '../../models/document.model';
@Injectable({
  providedIn: 'root',
})
export class Step1Service {
  API_URI: string;
  API_KUNTUR: string;
  API_PDSTG: string;

  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
    this.API_PDSTG = AppConfig.WSPD_API;
  }
  // tslint:disable-next-line:max-line-length
  getDataOfDocument(
    data: DocumentRequest,
    ce: boolean
  ): Observable<DocumentResponse[] | DocumentMigrationsResponse> {
    // tslint:disable-next-line:max-line-length
    const URL = ce
      ? // tslint:disable-next-line:max-line-length
      `${this.API_URI}/VidaIndividual/cliente/migracion/${data.documentMigration.nDoc}/${data.documentMigration.dia}/${data.documentMigration.mes}/${data.documentMigration.year}`
      : `${this.API_URI}/vidaindividual/cliente/${data.document.typeDoc}/${data.document.nDoc}`;
    const GET$: Observable<any> = this._http.get(URL);
    const DATA$: Observable<DocumentResponse[] | DocumentMigrationsResponse> =
      new Observable((obs) => {
        GET$.subscribe(
          (res: DocumentResponse[] | DocumentMigrationsResponse) => {
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
  cotizar(data: Step1Request): Observable<Step1Response> {
    const URL = `${this.API_URI}/VidaIndividual/cliente/tarifario`;
    const POST$ = this._http.post(URL, data);
    const DATA$: Observable<Step1Response> = new Observable((obs) => {
      POST$.subscribe(
        (res: Step1Response) => {
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
  saveDataContratante(data: any): Observable<any> {
    const URL = `${this.API_PDSTG}/vdp/contratante`;
    const POST$ = this._http.post(URL, data);
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
}
