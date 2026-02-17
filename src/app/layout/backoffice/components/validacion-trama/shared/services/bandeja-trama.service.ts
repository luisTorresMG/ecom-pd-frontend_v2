import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfig } from '@root/app.config';

@Injectable({
  providedIn: 'root',
})
export class BandejaTramaService {
  private readonly wspdApi = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getAll(payload: any): Observable<any> {
    const url = `${this.wspdApi}/sia/estructuras/listado`;
    return this.http.post(url, payload).pipe(
      map((response: any) => ({
        ...response.data,
        cantidadRegistros: (response.data?.dataEstructura || [])
          .cantidadRegistros,
      }))
    );
  }

  overrideStructure(payload: any): Observable<any> {
    const url = `${this.wspdApi}/sia/estructuras/anular`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
}
