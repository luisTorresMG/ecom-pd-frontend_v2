import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';
import { IDetailProcessResponse } from '../../interfaces/process.interface';
import { IGetUrlResponse } from '../../interfaces/bulk-load.interface';
import { HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})
export class BulkLoadService {
  private readonly wspdApi = AppConfig.WSPD_APIAWS;
  private Url2 = AppConfig.URL_API_SCTR;

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });//INI <RQ2024-57 - 03/04/2024> 
  private url = AppConfig.URL_API_SCTR;//INI <RQ2024-57 - 03/04/2024> 

  constructor(private readonly http: HttpClient) {
  }

  getInformation(payload: { type: number; value: any }): Observable<any> {
    const type = {
      1: 'detalle',
      2: 'informacion',
      3: 'datos',
    };
    const url = `${this.wspdApi}/sia/cargaMasiva/${type[payload.type]}/${
      payload.value
    }`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  listProcesses(): Observable<any> {
    const url = `${this.wspdApi}/sia/cargaMasiva/listado`;
    return this.http
      .get(url)
      .pipe(map((response: any) => response.data.listadoProcesos ?? []));
  }

  getStates(): Observable<any[]> {
    const url: string = `${this.wspdApi}/sia/cargaMasiva/listado/estados`;
    return this.http.get(url).pipe(map((response: any) => response.data.listadoEstados ?? []));
  }

  getContractors(): Observable<Array<string>> {
    const url = `${this.wspdApi}/sia/cargaMasiva/contratantes/listado`;
    return this.http
      .get(url)
      .pipe(map((response: any) => response.data?.listaContratantes ?? []));
  }

  getRulesReport(): Observable<any> {
    const url = `${this.wspdApi}/sia/cargaMasiva/reglas/listado`;
    return this.http
      .get(url)
      .pipe(map((response: any) => response.data?.listaReglasNegocio ?? []));
  }

  getExtraPremium(payload: {
    idProceso: number;
    noBase64?: boolean;
  }): Observable<Array<any>> {
    payload.noBase64 = true;
    const url = `${this.wspdApi}/sia/cargaMasiva/primaExtra`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data?.listadoPrimaExtra ?? []));
  }

  getSummary(payload: { idProceso: number; noBase64?: true }): Observable<any> {
    payload.noBase64 = true;

    const url = `${this.wspdApi}/sia/cargaMasiva/resumen`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  getUrlResponse(url: string): Observable<any> {
    return this.http.get(url).pipe(map((response: any) => response as any));
  }

  saveFilename(payload: any): Observable<IGetUrlResponse> {
    const url = `${this.wspdApi}/sia/cargaMasiva/guardarArchivo`;
    return this.http
      .post(url, {
        ...payload,
        noBase64: true,
      })
      .pipe(map((response: any) => response.data as IGetUrlResponse));
  }

  saveFile({ url, file }: { url: string; file: File }): Observable<any> {
    return this.http
      .put(url, file, { observe: 'response' })
      .pipe(map((response: any) => response));
  }

volcadoFile(data: FormData): Observable<any> {
    return this.http.post(this.Url2 + '/AwsDesgravamen/volcadoFile', data);
  }

  getDetailProcess(processId: number): Observable<IDetailProcessResponse> {
    const url = `${this.wspdApi}/sia/cargaMasiva/detalle/proceso/${processId}`;
    return this.http
      .get(url)
      .pipe(map((response: any) => response.data as IDetailProcessResponse));
  }

  getFunctions(): Observable<
    Array<{ idFuncion: number; nombreFuncion: string }>
  > {
    const url = `${this.wspdApi}/sia/cargaMasiva/funciones`;
    return this.http
      .get(url)
      .pipe(map((response: any) => response.data?.listadoFunciones ?? []));
  }

  getUrlErrorsByPhase(payload: {
    idProceso: number;
    fase: 1 | 2 | 3 | 4;
  }): Observable<string> {
    const url = `${this.wspdApi}/sia/cargaMasiva/descargaArchivo`;
    return this.http
      .post(url, {
        ...payload,
        noBase64: true,
      })
      .pipe(map((response: any) => response.data?.link ?? ''));
  }

  getCSVFileErrors(url: string): Observable<string> {
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(map((response: string) => response as string));
  }

  downloadReprocessFile(payload): Observable<any> {
    const url: string = `${this.wspdApi}/sia/cargaMasiva/archivo`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(
      map((response: any) => response.data)
    );
  }

  emitProcess(payload: any): Observable<{ success: boolean, message: string, procesoMigrado: string }> {
    const url: string = `${this.wspdApi}/sia/cargaMasiva/migracion`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data));
  }

  billingProcess(payload: any): Observable<any> {
    const url: string = `${this.wspdApi}/sia/cargaMasiva/facturacion/proceso`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data));
  }

 //INI <RQ2024-57 - 03/04/2024> 
 public validarHorarioMigra(payload: any): Observable<any> {
    const url: string = `${this.wspdApi}/AwsDesgravamen/validarHorarioMigra`;
    return this.http.post(url, { 
        ...payload,
        noBase64: true
      }).pipe(map((response: any) => response.data));
}  

  public getFacSuspendida(payload: any): Observable<any> {
    const url: string = `${this.wspdApi}/AwsDesgravamen/getFacSuspendida`;
    return this.http.post(url, { 
        ...payload,
        noBase64: true
      }).pipe(map((response: any) => response.data));
 //FIN <RQ2024-57 - 03/04/2024> 

}  
}
