import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConfig} from '../../../app.config';
import {PaymentVisaResponse} from '../models/payment-visa.model';
import {IPaymentVisa} from '../interfaces/payment.interface';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private URI_API: string;
  private wspApi: string = AppConfig.WSPD_API;

  constructor(private readonly _http: HttpClient) {
    this.URI_API = AppConfig.PD_API;
  }

  consultarEstadoPago(data: {
    idProcess: number;
    token?: string;
  }): Observable<IPaymentVisa> {
    const url = `${this.URI_API}/Vidaindividual/emision`;
    const call: Observable<any> = this._http.post(url, data);
    const data$: Observable<IPaymentVisa> = new Observable((obs) => {
      call.subscribe(
        (res: IPaymentVisa) => {
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

  emission(payload: { idProceso: string, token: string }): Observable<any> {
    const url: string = `${this.wspApi}/vdp/emision`;
    return this._http.post(url, payload).pipe(map((response: any) => response.data));
  }

  generarSessionTokenGeneric(data) {
    const url = `${this.URI_API}/pago/visa/token`;
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
}
