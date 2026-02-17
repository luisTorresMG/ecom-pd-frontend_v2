import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { District } from '../../models/district/district';
import { Municipality } from '../../models/municipality/municipality';
import { Province } from '../../models/province/province';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametersResponse } from '../../../layout/vidaindividual-latest/models/parameters.model';

@Injectable()
export class UbigeoService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostProvince(province: Province) {
    const bodyPro = JSON.stringify(province);

    return this.http.post(this._baseUrl + '/Province/', bodyPro, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
  getPostDistrict(district: District) {
    const bodyDis = JSON.stringify(district);
    return this.http.post(this._baseUrl + '/District', bodyDis, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
  getPostMunicipality(municipality: Municipality) {
    const bodyMun = JSON.stringify(municipality);
    return this.http.post(this._baseUrl + '/Municipality/', bodyMun, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
  getParameters(): Observable<ParametersResponse> {
    const url = `${this._baseUrl}/VidaIndividual/parametros`;
    const call: Observable<any> = this.http.get(url);
    const data$: Observable<ParametersResponse> = new Observable(obs => {
      call.subscribe(
        (res: ParametersResponse) => {
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
