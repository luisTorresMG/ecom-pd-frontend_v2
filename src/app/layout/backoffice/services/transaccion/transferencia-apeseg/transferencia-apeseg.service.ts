import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ListarRequest,
  EstadoRequest,
} from '../../../models/transferencia-apeseg/transferencia-apeseg.model';
import { param } from 'jquery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransferenciaApesegService {
  private urlApi: string;
  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.BACKOFFICE_API;
  }

  private llamarApi(call: any) {
    const data = new Observable((obs) => {
      call.subscribe(
        (res) => {
          obs.next(res);
          obs.complete();
        },
        (error) => {
          obs.error(error);
        }
      );
    });
    return data;
  }

  listar(datos: ListarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', '')
      .set('groupscount', '')
      .set('pagenum', '')
      .set('pagesize', '')
      .set('recordstartindex', '')
      .set('recordendindex', '')
      .set('P_DREGDATEINI', datos.P_DREGDATEINI)
      .set('P_DREGDATEFIN', datos.P_DREGDATEFIN)
      .set('P_NTRANSFERSTATUS', datos.P_NTRANSFERSTATUS)
      .set('P_NCERTIFICADO', datos.P_NCERTIFICADO)
      .set('P_NPLACA', datos.P_NPLACA)
      .set('_', '1633977070018');
    const url = this.urlApi + '/APESEGSend/Core/PA_SEL_CERTIFICATES_APESEG/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  estado(datos: EstadoRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Status/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  enviar(datos: any) {
    const url = this.urlApi + '/APESEGSend/Core/SendAPESEGMassive';
    const call = this._http.post(url, datos);
    return this.llamarApi(call);
  }
}
