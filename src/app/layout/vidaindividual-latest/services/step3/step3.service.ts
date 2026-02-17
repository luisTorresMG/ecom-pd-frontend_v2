import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { Step3Request, Step3Response } from '../../models/step3.model';
import { PepRequest, PepResponse } from '../../models/pep.model';
@Injectable({
  providedIn: 'root',
})
export class Step3Service {
  API_URI: string;
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
  }
  submitEncuesta(data: Step3Request): Observable<Step3Response> {
    const URL = `${this.API_URI}/Vidaindividual/dps`;
    const POST$ = this._http.post(URL, data);
    const DATA$: Observable<Step3Response> = new Observable((obs) => {
      POST$.subscribe(
        (res: Step3Response) => {
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

  blackList(request: PepRequest): Observable<PepResponse> {
    const URL = `${this.API_URI}/VidaIndividual/cliente/pep`;
    const POST$ = this._http.post(URL, request);
    const DATA$: Observable<PepResponse> = new Observable((obs) => {
      POST$.subscribe(
        (res: PepResponse) => {
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
  blackListExperian(request: PepRequest): Observable<PepResponse> {
    const URL = `${this.API_URI}/VidaIndividual/cliente/pep/riesgo`;
    const POST$ = this._http.post(URL, request);
    const DATA$: Observable<PepResponse> = new Observable((obs) => {
      POST$.subscribe(
        (res: PepResponse) => {
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
