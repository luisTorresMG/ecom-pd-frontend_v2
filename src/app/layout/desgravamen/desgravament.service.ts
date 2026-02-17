import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../app/app.config';
import { CommonMethods } from '../broker/components/common-methods';
import { PolicyemitService } from '../broker/services/policy/policyemit.service';
import { QuotationService } from '../broker/services/quotation/quotation.service';
import { ClientInformationService } from '../broker/services/shared/client-information.service';
import { DesgravamentConstants } from './shared/core/desgravament.constants';


@Injectable()
export class DesgravamenServicePD {
  CONSTANTS: any = DesgravamentConstants;
  private Url = AppConfig.URL_API_SCTR;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(
    private http: HttpClient) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
  }


  public listBeneficiarios(params: any): Observable<any> {
    params.noBase64 = true;
    return this.http.post(this.Url + '/QuotationManager/GetBeneficiar', params, { headers: this.headers });
  }

  public getEndoserByQuotation(params: any): Observable<any> {
    params.noBase64 = true;
    return this.http.post(this.Url + '/ProviderManager/getProviderListByQuotation', params, { headers: this.headers });
  }


  getFrecuenciaPago(params): Observable<any> {
    const url = this.Url + '/PolicyManager/FrecuenciaPago?codrenovacion=' + params.codRenovacion + '&producto=' + params.producto;
    return this.http.get(url);
  }

  getListaTipoRenovacion(): Observable<any> {
    const url = this.Url + '/PolicyManager/ListaTipoRenovacion';
    return this.http.get(url);
  }

  public insertQuotation(params: any): Observable<any> {
    // const request = JSON.stringify(params);
    params.noBase64 = true;
    return this.http
      .post(
        this.Url + '/QuotationManager/UpdateNumCredit', params, {
        headers: this.headers
      });
  }

  getListaTipoPlan(params: any): Observable<any> {
    params.noBase64 = true;
    return this.http.post(this.Url + '/QuotationManager/GetTypePlan', params, { headers: this.headers });
  }

  getListaDPS(params: any): Observable<any> {
    const url = this.Url + '/QuotationManager/GetDPS?numcotizacion=' + params.numcotizacion + '&nbranch=' + params.nbranch + '&nproduct=' + params.nproduct;
    return this.http.post(url, { headers: this.headers });
  }

}
