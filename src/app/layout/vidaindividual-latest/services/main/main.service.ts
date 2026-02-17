import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '@root/app.config';
import { ApiService } from '@shared/services/api.service';
import { Selling } from '../../../soat/shared/interfaces/selling.interface';
import { ResumenResponse } from '../../models/resumen.model';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  API_URI: string;
  API_URI2: string;

  constructor(
    private readonly _http: HttpClient,
    private readonly api: ApiService
  ) {
    this.API_URI = AppConfig.PD_API;
    this.API_URI2 = AppConfig.WSPD_API;
  }

  obtenerLinkAgenciado(key: string) {
    const endpoint = 'codechannel';
    const action = 'obtenercodechannel';
    const url = `${endpoint}/${action}/${key}`;
    return this.api.get(url);
  }

  getSellingPoint(): Selling {
    return JSON.parse(localStorage.getItem('selling') || '{}');
  }

  getToken(): Observable<any> {
    const url = `tool/vidaindividual/terms`;
    return this.api.get(url);
  }

  sendNotification(data: any): Observable<any> {
    let currentUser: any = localStorage.getItem('currentUser');
    let asesor: any = sessionStorage.getItem('resumen-atp');
    let newData = data;
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      newData = {
        ...data,
        correoAsesor: currentUser.email?.toLowerCase(),
        // tslint:disable-next-line:max-line-length
        nombreAsesor:
          `${currentUser?.firstName || ''} ${currentUser?.lastName || ''} ${
            currentUser?.lastName2 || ''
          }`.trim() ||
          currentUser?.nombreAsesor ||
          null,
      };
    }
    if (asesor) {
      asesor = JSON.parse(asesor);
      newData = {
        ...data,
        correoAsesor:
          asesor?.cotizacionInfo?.correoAsesor?.toLowerCase() || null,
        // tslint:disable-next-line:max-line-length
        nombreAsesor: asesor?.cotizacionInfo?.nombreAsesor || null,
      };
    }
    const url = `VidaIndividual/notificacion`;
    return this.api.post(url, newData);
  }

  tipoCambio(): Observable<any> {
    const url = `${this.API_URI2}/VDP/tipo-cambio`;
    return this._http.get(url);
  }

  obtenerResumen(idProcess: any): Observable<ResumenResponse> {
    const url = `${this.API_URI}/VidaIndividual/cotizacion/${idProcess}`;
    const call: Observable<any> = this._http.get(url, { observe: 'body' });
    const data$: Observable<ResumenResponse> = new Observable((obs) => {
      call.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  set storage(data: any) {
    sessionStorage.setItem(
      AppConfig.VIDADEVOLUCION_STORAGE,
      btoa(
        JSON.stringify({
          ...this.storage,
          ...data,
        })
      )
    );
  }

  get storage(): any {
    const storage = sessionStorage.getItem(AppConfig.VIDADEVOLUCION_STORAGE);
    return !!storage ? JSON.parse(atob(storage)) : null;
  }

  get step(): number {
    const step = sessionStorage.getItem(AppConfig.VIDADEVOLUCION_NSTEP);
    return !!step ? Number(atob(step)) : 1;
  }

  set step(val: number) {
    sessionStorage.setItem(
      AppConfig.VIDADEVOLUCION_NSTEP,
      btoa(val.toString())
    );
  }

  get userId(): string {
    return sessionStorage.getItem('user-id-unique');
  }
}
