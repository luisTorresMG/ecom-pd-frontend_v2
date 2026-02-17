import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MarcaModeloService {
  [x: string]: any;

  private apiUri: string;
  private apiWSPD: string;

  constructor(private readonly _http: HttpClient) {
    this.apiUri = AppConfig.BACKOFFICE_API;
    this.apiWSPD = AppConfig.WSPD_API;
  }

  getClasses(): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/clases`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  getMarks(): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/marcas`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  getModels(idMarca: number): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/modelos/${idMarca}`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  getVersions(idModelo: number): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/versiones/${idModelo}`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  disableMark(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/marcas/anular`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  disableModel(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/modelos/anular`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  disableVersion(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/versiones/anular`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  createMark(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/marcas/registrar`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  createModel(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/modelos/registrar`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  createVersion(payload: any): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/versiones/registrar`;
    return this._http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  downloadMarks(): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/marcas/exportar`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  downloadModels(idMarca: number): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/modelos/exportar/${idMarca}`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }

  downloadVersions(idModelo: number): Observable<any> {
    const url = `${this.apiWSPD}/backoffice/mantenimiento/versiones/exportar/${idModelo}`;
    return this._http.get(url).pipe(map((response: any) => response.data));
  }
}
