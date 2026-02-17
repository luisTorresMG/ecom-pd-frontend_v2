import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient]
})
export class TrayService {
  private readonly wspdApi = AppConfig.WSPD_APIAWS;

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<any> {
    const url = `${this.wspdApi}/sia/datos/configuracion`;
    return this.http
      .get(url)
      .pipe(
        map((response: any) => response.data.listaDatosConfiguracion ?? [])
      );
  }

  getDetail(structureId: string): Observable<any> {
    const url = `${this.wspdApi}/sia/detalle/estructura/${structureId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  disable(payload: { idEstructura: string; activo: boolean }): Observable<any> {
    const url = `${this.wspdApi}/sia/activo/estructura`;
    return this.http
      .post(url, { ...payload, noBase64: true })
      .pipe(map((response: any) => response.data));
  }

  delete(structureId: string): Observable<any> {
    const url = `${this.wspdApi}/sia/eliminar/estructura/${structureId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
