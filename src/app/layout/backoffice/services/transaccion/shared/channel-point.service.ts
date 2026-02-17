import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as SDto from './DTOs/channel-point.dto';
import * as CDto from '../../../components/transaction/shared/channel-point/DTOs/channel-point.dto';
@Injectable({
  providedIn: 'root',
})
export class ChannelPointService {
  private API_URI: string;
  private API_BACKOFFICE: string;
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
    this.API_BACKOFFICE = AppConfig.BACKOFFICE_API;
  }
  canalVentaData(data: CDto.ChannelDto): Observable<SDto.CanalVentaDto[]> {
    console.log(data);
    const URL = `${this.API_URI}/ChannelSales/`;
    const dataBase64 = {
      data: btoa(JSON.stringify(data)),
    };
    const TOKEN$ = JSON.parse(localStorage.getItem('currentUser')).token;
    const POST$ = this._http.post(URL, dataBase64, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${TOKEN$}`),
    });
    const DATA$: Observable<any> = new Observable((obs) => {
      POST$.subscribe(
        (res: SDto.CanalVentaDto[]) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  puntoVentaData(P_NPOLICYS: number): Observable<SDto.PuntoVentaDto> {
    console.log(P_NPOLICYS);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    /* const params = new HttpParams()
      .set('P_NPOLICYS', P_NPOLICYS.toString()); */
    const URL = `${this.API_URI}/ChannelPoint`;
    const data = {
      spolicy: P_NPOLICYS,
      nnumpoint: currentUser?.indpuntoVenta,
    };
    const dataBase64 = {
      data: btoa(JSON.stringify(data)),
    };
    // const GET$ = this._http.get(URL, { params: params });
    const GET$ = this._http.post(URL, dataBase64);
    const DATA$: Observable<SDto.PuntoVentaDto> = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
          const map: any = res?.map((val) => ({
            NNUMPOINT: val.nnumpoint,
            SDESCRIPT: val.sdescript,
          }));
          const ret = { PRO_SALE_POINT: map };
          console.log(ret);
          obs.next(ret);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
}
