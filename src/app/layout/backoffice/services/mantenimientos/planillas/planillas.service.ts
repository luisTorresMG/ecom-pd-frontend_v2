import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ListarRequest,
  ActualizarRequest,
  NivelIRequest,
  GenerarFRequest,
  AnularRequest,
  GroupRequest,
} from '../../../models/mantenimientos/planillas/planillas.model';
import { param } from 'jquery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanillasService {
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
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', '0')
      .set('pagesize', '10')
      .set('recordstartindex', '0')
      .set('recordendindex', '10')
      .set('P_NROPLANILLA', datos.P_NROPLANILLA)
      .set('_', '1633646741225');
    const url = this.urlApi + '/BillingPayRoll/Billing/PA_SEL_BillingPayRoll';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  actualizar(datos: ActualizarRequest) {
    const parametros = new HttpParams()
      .set('P_NOPERATION', datos.P_NOPERATION)
      .set('P_DATEOPERATION', datos.P_DATEOPERATION)
      .set('P_NROPLANILLA', datos.P_NROPLANILLA)
      .set('P_NIDPAYROLL_DETAIL', datos.P_NIDPAYROLL_DETAIL)
      .set('P_ESTADO', datos.P_ESTADO);
    const url =
      this.urlApi + '/BillingPayRoll/Emergente/PA_UPD_OPERATION_PAYROLL';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  NivelI(datos: NivelIRequest) {
    const parametros = new HttpParams().set('P_NIDPAYROLL', datos.P_NIDPAYROLL);
    const url = this.urlApi + '/BillingPayRoll/Billing/PA_UPD_BillingPayRoll';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  GenerarF(datos: GenerarFRequest) {
    const parametros = new HttpParams().set('P_NIDPAYROLL', datos.P_NIDPAYROLL);
    const url = this.urlApi + '/BillingPayRoll/Billing/BILLINGPAYROLL_CREBILLS';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  Anular(datos: AnularRequest) {
    const parametros = new HttpParams().set('P_NIDPAYROLL', datos.P_NIDPAYROLL);
    const url =
      this.urlApi + '/BillingPayRoll/Billing/PA_UPD_CANCEL_BILLINGPAYROLL';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  Group(datos: GroupRequest) {
    const parametros = new HttpParams().set(
      'P_NROPLANILLA',
      datos.P_NROPLANILLA
    );
    const url = this.urlApi + '/BillingPayRoll/Billing/PA_SEL_BILLSGROUP';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
