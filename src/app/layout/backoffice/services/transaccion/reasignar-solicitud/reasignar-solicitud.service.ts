import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CanalRequest,
  BuscarRequest,
  TipoCRequest,
  CanalDRequest,
  PuntoVRequest,
  CanalOrigenRequest,
  PuntoVORequest,
  ValidarRequest,
  InsertarRequest,
  Validar2Request,
} from '../../../models/transaccion/reasignar-solicitud/reasignar-solicitud.model';
@Injectable({
  providedIn: 'root',
})
export class ReasignarSolicitudService {
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

  canal(datos: CanalRequest) {
    const parametros = new HttpParams().set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/PolicyRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  tipoC(datos: TipoCRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  canalD(datos: CanalDRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/PolicyRead_Mant';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  puntoV(datos: PuntoVRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('P_NNUMPOINT', datos.P_NNUMPOINT)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/SalePointRead_Mant';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  buscar(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', datos.filterscount)
      .set('groupscount', datos.groupscount)
      .set('pagenum', datos.pagenum)
      .set('pagesize', datos.pagesize)
      .set('recordstartindex', datos.recordstartindex)
      .set('recordendindex', datos.recordendindex)
      .set('P_NPOLICY_O', datos.P_NPOLICY_O)
      .set('P_NPOLICY_D', datos.P_NPOLICY_D)
      .set('P_DFCREABEGIN', datos.P_DFCREABEGIN)
      .set('P_DFCREAEND', datos.P_DFCREAEND)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/PA_SEL_REASSIGN';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  canalO(datos: CanalOrigenRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/PolicyRead_Mant';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  puntoVO(datos: PuntoVORequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('P_NNUMPOINT', datos.P_NNUMPOINT)
      .set('_', datos._);
    const url = this.urlApi + '/Reassign/Core/SalePointRead_Mant';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  validar(datos: ValidarRequest) {
    const parametros = new HttpParams()
      .set('P_NUMLOT', datos.P_NUMLOT)
      .set('P_NPOLICY_O', datos.P_NPOLICY_O)
      .set('P_NNUMPOINT_O', datos.P_NNUMPOINT_O)
      .set('P_NTIPPOL', datos.P_NTIPPOL)
      .set('P_NQUANTITY', datos.P_NQUANTITY)
      .set('RANGE_LIST', datos.RANGE_LIST);
    const url = this.urlApi + '/Reassign/Core/SEL_LOT_CERTIFICATE_Read';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  validar2(datos: Validar2Request) {
    const parametros = new HttpParams()
      .set('P_NUMLOT', datos.P_NUMLOT)
      .set('P_NPOLICY_O', datos.P_NPOLICY_O)
      .set('P_NNUMPOINT_O', datos.P_NNUMPOINT_O)
      .set('P_NTIPPOL', datos.P_NTIPPOL)
      .set('P_NQUANTITY', datos.P_NQUANTITY);
    const url = this.urlApi + '/Reassign/Core/SEL_LOT_Read';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  insertar(datos: InsertarRequest) {
    const parametros = new HttpParams()
      .set('P_NUSERREGISTER', datos.P_NUSERREGISTER)
      .set('P_NPOLICY_O', datos.P_NPOLICY_O)
      .set('P_NPOLICY_D', datos.P_NPOLICY_D)
      .set('P_NNUMPOINT_O', datos.P_NNUMPOINT_O)
      .set('P_NNUMPOINT_D', datos.P_NNUMPOINT_D)
      .set('P_SRANGE', datos.P_SRANGE)
      .set('P_NTYPECERTIF', datos.P_NTYPECERTIF)
      .set('P_NQUANTITY', datos.P_NQUANTITY)
      .set('P_TYPE_ASSIGN', datos.P_TYPE_ASSIGN)
      .set('P_STATE', datos.P_STATE)
      .set('P_MESSAGE', datos.P_MESSAGE)
      .set('RANGE_LIST', datos.RANGE_LIST);
    const url = this.urlApi + '/Reassign/Core/Insert_Reassing';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
