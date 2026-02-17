import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';
import {
  SavePlotConfigurationModel,
  TransformPlotDetailConfigurationModel,
} from '../models/plot-configuration.model';

@Injectable({
  providedIn: 'root',
})
export class PlotConfigurationService {
  private readonly wspdApi = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getParameters(): Observable<any> {
    const url = `${this.wspdApi}/sia/parametros`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getDetail(idStructure: number): Observable<any> {
    const url = `${this.wspdApi}/sia/estructuras/${idStructure}/detalle`;
    return this.http.get(url).pipe(
      map((response: any) => ({
        success: response.data.success,
        message: response.data.message,
        ...new TransformPlotDetailConfigurationModel(response.data),
      }))
    );
  }

  save(payload: any): Observable<{
    idEstructura: string;
    message: string;
    success: boolean;
  }> {
    const transformPayload = new SavePlotConfigurationModel(payload);
    const url = `${this.wspdApi}/sia/registro/estructuras`;

    return this.http.post(url, transformPayload).pipe(
      map((response: any) => ({
        ...response.data,
        showSuccessImage: true,
      }))
    );
  }

  update(payload: any): Observable<any> {
    const transformPayload = new SavePlotConfigurationModel(payload);
    const url = `${this.wspdApi}/sia/estructuras/editar`;

    return this.http.post(url, transformPayload).pipe(
      map((response: any) => ({
        ...response.data,
        showSuccessImage: true,
      }))
    );
  }
}
