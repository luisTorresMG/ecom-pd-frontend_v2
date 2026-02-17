import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class TramasHistoricasService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}
  //
  public listarProductos(): Observable<any> {
    return this.http.get(this.Url + '/TramasHistoricas/ListarProductos', { headers: this.headers });
  }
  //
  public listarEndosos(): Observable<any> {
    return this.http.get(this.Url + '/TramasHistoricas/ListarEndosos', { headers: this.headers });
  }
  //
  public insertReportStatus(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/TramasHistoricas/InsertReportStatus', data, { headers: this.headers });
  }
  //
  public listarCabeceras(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/TramasHistoricas/ListarCabeceras', data, { headers: this.headers });
  }
  //
  public getReporteTramasHistoricas(idReport: any): Observable<any>{
    const Json = { "P_NID_CAB": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.Url + '/TramasHistoricas/GetReporteTramasHistoricas', data,{ headers: this.headers });
  }  
}