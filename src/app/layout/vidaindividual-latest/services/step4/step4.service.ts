import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { BiometricRequest } from '../../../../shared/models/biometric/biometric.model';
import { IPasarelaRequest } from '../../models/pasarela.model';
import { dataUrl } from 'angular-file/file-upload/fileTools';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Step4Service {
  API_URI: string;
  wspApi: string = AppConfig.WSPD_API;

  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
  }

  resumenCompra(data: any): Observable<any> {
    const URL = `${this.API_URI}/`;
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

  dataContratante(data: any): Observable<any> {
    const URL = `${this.API_URI}/VidaIndividual/contratante`;
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

  envioLinkValidacion(data: any): Observable<any> {
    const URL = `${this.API_URI}/VidaIndividual/pasarela/autenticacion`;
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

  generarCip(id: any): Observable<any> {
    const data = {
      idProcess: id,
    };
    const url = `${this.API_URI}/VidaIndividual/pagoefectivo/generarcip`;
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

  emitirPagoEfectivo(data: any): Observable<any> {
    const url = `${this.API_URI}/pago/pagoefectivo/notificar`;
    const headers = new HttpHeaders().set('PE-Signature', '132465');
    const call = this._http.post(url, data, { headers: headers });
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

  registBiometric(data: BiometricRequest): Observable<any> {
    // tslint:disable-next-line:prefer-const
    const formData: FormData = new FormData();
    formData.append('data', JSON.stringify(data.data));
    formData.append('fileattach', data.file);
    const url = `${this.API_URI}/Ecommerce/biometrico/vidaindividual/registrar`;
    const call: Observable<any> = this._http.post(url, formData, {
      observe: 'response',
    });
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

  consultBiometric(data: any): Observable<any> {
    const url = `${this.API_URI}/Ecommerce/biometrico/vidaindividual/consultar`;
    const call: Observable<any> = this._http.post(url, data, {
      observe: 'response',
    });
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

  enviarPasarela(data: IPasarelaRequest): Observable<any> {
    const url = `${this.API_URI}/VidaIndividual/pasarela`;
    const call: Observable<any> = this._http.post(url, data);
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

  enviarComplementariosActual(dni: number, data: any): Observable<any> {
    const url = `${this.API_URI}/Vidaindividual/complementarios/${dni}`;
    return this._http.put(url, data).pipe(map((response: any) => response));
  }

  obtenerMetodoPago(data: any): Observable<any> {
    const url = `${this.wspApi}/pago/tipo/obtener`;
    return this._http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }
}
