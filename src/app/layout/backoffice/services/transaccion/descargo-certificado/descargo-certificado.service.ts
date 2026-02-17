import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BuscarRequest,
  EstadoRequest,
  CanalRequest,
  ProcessRequest,
  ObtenerRequest,
  DescargoRequest,
} from '../../../models/transaccion/descargar-certificado/descargar-certificado.model';
import { map } from 'rxjs/operators';
import { IGetLotsPayload, IGetLotsResponse } from '@root/layout/backoffice/interfaces/descargo-certificado.interface';

@Injectable({
  providedIn: 'root',
})
export class DescargoCertificadoService {
  private urlApi: string;
  private readonly wspdApiUrl: string = AppConfig.WSPD_API;

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

  buscar(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', datos.filterscount)
      .set('groupscount', datos.groupscount)
      .set('pagenum', datos.pagenum)
      .set('pagesize', datos.pagesize)
      .set('recordstartindex', datos.recordstartindex)
      .set('recordendindex', datos.recordendindex)
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('P_CODCANAL', datos.P_CODCANAL)
      .set('P_DESCANAL', datos.P_DESCANAL)
      .set('P_NSTATUSPOL_ORI', datos.P_NSTATUSPOL_ORI)
      .set('P_SSTATUSPOL', datos.P_SSTATUSPOL)
      .set('P_STATUS', datos.P_STATUS)
      .set('_', datos._);
    const url = this.urlApi + '/DischargeConfirm/Core/ReadCode';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  estado(datos: EstadoRequest) {
    const parametros = new HttpParams().set('_', datos._);
    const url = this.urlApi + '/DischargeConfirm/Core/StateRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  canal(datos: CanalRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/DischargeConfirm/Core/PolicyRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  process(datos: ProcessRequest) {
    const parametros = new HttpParams()
      .set('P_NNUMLOT', datos.P_NNUMLOT)
      .set('P_NUSERCODE', datos.P_NUSERCODE)
      .set('P_SUSERCODE', datos.P_SUSERCODE);
    const url = this.urlApi + '/DischargeConfirm/Core/ProcessList';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  obtener(datos: ObtenerRequest) {
    const parametros = new HttpParams()
      .set('P_NUSERCODE', datos.P_NUSERCODE)
      .set('P_NSTATUSDISC', datos.P_NSTATUSDISC);
    const url = this.urlApi + '/DischargeConfirm/Core/ObtenerLote';
    // const url ='http://190.216.170.173/backofficeqa' + '/DischargeConfirm/Core/ObtenerLote';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  getLots(payload: IGetLotsPayload): Observable<IGetLotsResponse> {
    const url: string = `${this.wspdApiUrl}/backoffice/descargoCertificado`;
    return this._http.post(url, payload).pipe(map((response: any) => response.data as IGetLotsResponse));
  }

  descargo(datos: DescargoRequest) {
    const parametros = new HttpParams()
      .set('filterscount', datos.filterscount)
      .set('groupscount', datos.groupscount)
      .set('pagenum', datos.pagenum)
      .set('pagesize', datos.pagesize)
      .set('recordstartindex', datos.recordstartindex)
      .set('recordendindex', datos.recordendindex)
      .set('_', datos._);
    const url = this.urlApi + '/DischargeConfirm/Core/ReadDescargo';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
