import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewPlotService {
  urlApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getStructureTypes(payload: any): Observable<any> {
    const url = `${this.urlApi}/`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  validatePlot(payload: any): Observable<any> {
    const fd = new FormData();
    fd.set('argumentos', JSON.stringify(payload.argumentos));
    fd.set('fileattach', payload.attachedFile);
    fd.set('canal', payload.channelSale);
    fd.set('idEstructura', payload.structureType);
    fd.set('idUsuario', payload.userId);

    const url = `${this.urlApi}/sia`;
    return this.http.post(url, fd).pipe(map((response: any) => response.data));
  }
}
