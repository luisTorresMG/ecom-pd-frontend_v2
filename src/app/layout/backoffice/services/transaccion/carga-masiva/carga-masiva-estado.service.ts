import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../../../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class CargaMasivaEstadoService {
  private readonly urlApi = AppConfig.WSPD_API;
  private readonly urlApiPD = AppConfig.PD_API;
  private dataCargaMasivaEstado: any;

  constructor(private readonly http: HttpClient) {}

  getParametersLoad(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/parametros`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getDataStateLoad(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiPD}/cargamasiva/listado/estado`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  validateTramaLoad(payload: any): Observable<any> {
    const formData = new FormData();
    formData.append('Canal', payload.Canal);
    formData.append('PuntoVenta', payload.PuntoVenta);
    formData.append('IdUsuario', payload.IdUsuario);
    formData.append('Contratante', payload.Contratante);
    formData.append('Tdr', payload.Tdr);
    formData.append(
      'fileattach',
      !!payload.fileattach ? payload.fileattach : null
    );

    const url = `${this.urlApiPD}/cargamasiva/validartrama`;
    return this.http.post(url, formData).pipe(map((response: any) => response));
  }

  emisionLoad(payload: number): Observable<any> {
    const data = {
      id: payload,
      noBase64: true,
    };
    const url = `${this.urlApiPD}/cargamasiva/emision`;
    return this.http.post(url, data).pipe(map((response: any) => response));
  }

  setDataCargaMasivaEstado(data: any): void {
    this.dataCargaMasivaEstado = data;
  }
  getDataCargaMasivaEstado(): void {
    return this.dataCargaMasivaEstado;
  }
}
