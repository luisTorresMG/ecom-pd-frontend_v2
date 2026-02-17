import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import 'rxjs/add/operator/catch';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { AssignReassignReport } from '../../models/assignreassignreport/assignreassignreport';
import {
    BaseFilter,
    BuscarRequest,
    EstadoRequest,
} from '../../models/basefilter/basefilter';

@Injectable()
export class AssignReassignReportService {
    public token: string;
    public firstName: string;
    public lastName: string;
    public canal: string;
    public puntoVenta: string;
    public desCanal: string;
    public desPuntoVenta: string;
    public tipoCanal: string;
    private urlApi: string;
    // public menu: Features[] = [];
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    constructor(
        private http: HttpClient,
        private config: AppConfig,
        private sessionStorageService: SessionStorageService
    ) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
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
    getAssignReassignReport(baseFilter: BaseFilter) {
        const body = JSON.stringify(baseFilter);
        return this.http
            .post(
                this.config.apiUrl + '/AssignReassignReport/getAssignReassignReport',
                body,
                { headers: this.headers }
            )
            .map(
                (response) => response,
                (error) => {
                    console.log(error);
                }
            );
    }

    listar(datos: BuscarRequest) {
        const parametros = new HttpParams()
            .set('filterscount', datos.filterscount)
            .set('groupscount', datos.groupscount)
            .set('pagenum', datos.pagenum)
            .set('pagesize', datos.pagesize)
            .set('recordstartindex', datos.recordstartindex)
            .set('recordendindex', datos.recordendindex)
            .set('P_DREGDATE', datos.P_DREGDATE)
            .set('P_NNUMLOT', datos.P_NNUMLOT)
            .set('P_NSTATUS', datos.P_NSTATUS)
            .set('P_NPOLICY', datos.P_NPOLICY)
            .set('P_NNUMPOINT', datos.P_NNUMPOINT)
            .set('_', datos._);
        const url = this.urlApi + '/VariousReports/Core/AssignReassignRead';
        const call = this.http.get(url, { params: parametros });
        return this.llamarApi(call);
    }

    estado(datos: EstadoRequest) {
        const parametros = new HttpParams()
            .set('P_SCODE', datos.P_SCODE)
            .set('_', datos._);
        const url = this.urlApi + '/Common/Core/StatePolicy';
        const call = this.http.get(url, { params: parametros });
        return this.llamarApi(call);
    }
}
