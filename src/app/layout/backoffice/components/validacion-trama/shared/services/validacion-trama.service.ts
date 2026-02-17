import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable, of } from 'rxjs';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ValidacionTramaService {
  private readonly digitalPlatformAPI = AppConfig.WSPD_API;

  constructor(private http: HttpClient) {}

  listado(payload: any): Observable<any> {
    const transformedPayload = {
      idCarga: +payload.validator || 0,
      idRamo: +payload.branch || 0,
      idProducto: +payload.product || 0,
      canal: +payload.channelSale || 0,
      idEstructura: payload.structure || null,
      fechaInicio: moment(payload.startDate).format('DD/MM/YYYY'),
      fechaFin: moment(payload.endDate).format('DD/MM/YYYY'),
      indice: payload.currentPage,
      cantidadRegistros: payload.cantidadRegistros,
    };

    const url = `${this.digitalPlatformAPI}/sia/tramas/listado`;
    return this.http.post(url, transformedPayload).pipe(
      map((response: any) => ({
        ...response.data,
        listadoTramas: response.data.listadoTramas ?? [],
        cantidadRegistros:
          +((response.data || []).listadoTramas || [])[0]?.cantidadRegistros ||
          0,
      }))
    );
  }

  getStructureTypes(payload: any): Observable<any> {
    const url = `${this.digitalPlatformAPI}/sia/estructuras`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  downloadExcel(payload: any): Observable<any> {
    const url = `${this.digitalPlatformAPI}/sia/descargar`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
}
