import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })
export class ModuleCostCenterService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  // LISTAR RAMOS
  public listarRamos(): Observable<any> {
    return this.http.get(this.Url + '/ModuleCostCenter/ListarRamos', { headers: this.headers });
};

  // LISTAR TODOS RAMOS
  public listarRamosTodos(): Observable<any> {
    return this.http.get<any[]>(
      this.Url + '/ModuleCostCenter/ListarRamosTodos',
      {
        headers: this.headers,
      }
    );
  }

  // LISTAR PRODUCTOS
  public listarProductos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/ListarProductos',
      data,
      { headers: this.headers }
    );
  }

  // LISTAR TODOS PRODUCTOS
  public listarProductosTodos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/ListarProductosTodos',
      data,
      { headers: this.headers }
    );
  }

  // LISTAR TODOS LOS CENTROS DE COSTOS
  public listarCentroCostos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/ListarCentroCostos',
      data,
      { headers: this.headers }
    );
  }

  // VALIDAR CENTROS DE COSTOS
  public validarCentroCostos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/ValidarCentroCostos',
      data,
      { headers: this.headers }
    );
  }

  // BUSCAR AGREGAR CENTROS DE COSTOS
  public buscarAgregarCentroCostos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/BuscarAgregarCentroCostos',
      data,
      { headers: this.headers }
    );
  }

  // AGREGAR CENTROS DE COSTOS
  public agregarCentroCostos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/AgregarCentroCostos',
      data,
      { headers: this.headers }
    );
  }

  // BUSCAR POLIZA CENTROS DE COSTOS
  public listarPoliza(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/ModuleCostCenter/ListarPoliza', data, {
      headers: this.headers,
    });
  }

  // BUSCAR POLIZA CENTROS DE COSTOS
  public registrarAsignacion(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/ModuleCostCenter/RegistrarAsignacion',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
