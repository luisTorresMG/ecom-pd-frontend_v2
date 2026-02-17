import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    ECanalYPuntoRequest,
    BusquedaRequest,
} from '../../models/basefilter/basefilter';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ReporteEvxcypService {
    private urlApi: string;
    constructor(private readonly _http: HttpClient) {
        this.urlApi = AppConfig.BACKOFFICE_API;
    }

    private llamarApi(call: any) {
        const data = new Observable((obs) => {
            call.subscribe(
                (res) => {
                    obs.next(res);
                    obs.complete();
                },
                (error) => {
                    obs.error(error);
                }
            );
        });
        return data;
    }

    estado(datos: ECanalYPuntoRequest) {
        const parametros = new HttpParams().set('_', datos._);
        const url = this.urlApi + '/ReportAssign/ReportChannel/StateRead';
        const call = this._http.get(url, { params: parametros });
        return this.llamarApi(call);
    }

    busqueda(datos: BusquedaRequest) {
        const parametros = new HttpParams()
            .set('filterscount', datos.filterscount)
            .set('groupscount', datos.groupscount)
            .set('pagenum', datos.pagenum)
            .set('pagesize', datos.pagesize)
            .set('recordstartindex', datos.recordstartindex)
            .set('recordendindex', datos.recordendindex)
            .set('P_NPOLICYS', datos.P_NPOLICYS)
            .set('P_NSALEPOINTS', datos.P_NSALEPOINTS)
            .set('P_NSTATUS', datos.P_NSTATUS)
            .set('_', datos._);
        const url = this.urlApi + '/ReportAssign/ReportChannel/PolespRead/';
        const call = this._http.get(url, { params: parametros });
        return this.llamarApi(call);
    }
}
