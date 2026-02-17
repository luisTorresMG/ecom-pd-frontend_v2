import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import 'rxjs/add/operator/catch';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { EndorsementReport } from '../../models/endorsementreport/endorsementreport';
import {
    BaseFilter,
    BuscarEndososRequest,
} from '../../models/basefilter/basefilter';

@Injectable()
export class EndorsementReportService {
    public token: string;
    public firstName: string;
    public lastName: string;
    public canal: string;
    public puntoVenta: string;
    public desCanal: string;
    public desPuntoVenta: string;
    public tipoCanal: string;
    // public menu: Features[] = [];
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private urlApi: string;
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

    getEndorsementReport(baseFilter: BaseFilter) {
        const body = JSON.stringify(baseFilter);
        return this.http
            .post(
                this.config.apiUrl + '/EndorsementReport/getEndorsementReport',
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

    busqueda(datos: BuscarEndososRequest) {
        const parametros = new HttpParams()
            .set('filterscount', datos.filterscount)
            .set('groupscount', datos.groupscount)
            .set('pagenum', datos.pagenum)
            .set('pagesize', datos.pagesize)
            .set('recordstartindex', datos.recordstartindex)
            .set('recordendindex', datos.recordendindex)
            .set('P_DRANGESTART', datos.P_DRANGESTART)
            .set('P_DRANGEEND', datos.P_DRANGEEND)
            .set('_', datos._);
        const url = this.urlApi + '/VariousReports/Core/EndorsementsRead';
        const call = this.http.get(url, { params: parametros });
        return this.llamarApi(call);
    }
}
