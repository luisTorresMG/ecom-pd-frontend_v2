import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ValidarRequest,
  IListarResponse,
  ImprimirRequest,
} from '../../../models/transaccion/impresion-certificados/impresion-certificados.model';
@Injectable({
  providedIn: 'root',
})
export class ImpresionCertificadoService {
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

  validar(datos: ValidarRequest) {
    const parametros = new HttpParams()
      .set('P_INDTIPOIMP', datos.P_INDTIPOIMP)
      .set('P_SPOLICYS', datos.P_SPOLICYS)
      .set('P_SFEINI', datos.P_SFEINI)
      .set('P_SFEFIN', datos.P_SFEFIN);
    const url = this.urlApi + '/PrintCertificate/Core/Val_Certif';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  listar(datos: any) {
    const url = this.urlApi + '/PrintCertificate/Core/ListCertificado';
    const call = this._http.post(url, datos);
    return this.llamarApi(call);
  }

  imprimir(datos: ImprimirRequest) {
    const parametros = new HttpParams()
      .set('P_INDTIPOIMP', datos.P_INDTIPOIMP)
      .set('P_SPOLICYS', datos.P_SPOLICYS)
      .set('P_SFEINI', datos.P_SFEINI)
      .set('P_SFEFIN', datos.P_SFEFIN);
    const url = this.urlApi + '/PrintCertificate/Core/ReadPDFMasivo/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  limpiar() {
    const url = this.urlApi + '/PrintCertificate/Core/LimpiarGrilla';
    const call = this._http.get(url);
    return this.llamarApi(call);
  }
}
