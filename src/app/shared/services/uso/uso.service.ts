import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Uso } from '../../models/use/use';
import { Clase } from '../../../layout/client/shared/models/clase.model';
import { Modelo } from '../../../layout/client/shared/models/modelo.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class UsoService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostUsos(uso: Uso) {
    const body = JSON.stringify(uso);
    return this.http.post(this._baseUrl + '/Use/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  getPostUsosbyClase(clase: Modelo) {
    const body = JSON.stringify(clase);
    return this.http.post(this._baseUrl + '/Use/getUsebyClase', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }
}
