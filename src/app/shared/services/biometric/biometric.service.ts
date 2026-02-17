import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../app.config';
import { BiometricRequest } from '../../models/biometric/biometric.model';
@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private apiUri: string;
  constructor(private readonly _http: HttpClient) {
    this.apiUri = AppConfig.PD_API;
  }

  registBiometric(data: BiometricRequest): Observable<any> {
    // tslint:disable-next-line:prefer-const
    const formData: FormData = new FormData();
    formData.append('data', JSON.stringify(data.data));
    formData.append('fileattach', data.file);
    const url = `${this.apiUri}/Ecommerce/biometrico/vidaindividual/registrar`;
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
    const url = `${this.apiUri}/Ecommerce/biometrico/vidaindividual/consultar`;
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
}
