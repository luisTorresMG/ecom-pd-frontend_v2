import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import 'rxjs/add/operator/catch';
//  import { Features } from '../../models/features';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { ProductionReport } from '../../models/productionreport/productionreport';
import {
    BaseFilter,
    BuscarProduccionRequest,
} from '../../models/basefilter/basefilter';

@Injectable()
export class ProductionReportService {
    private urlApi: string;
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
    constructor(
        private readonly _http: HttpClient,
        private http: HttpClient,
        private config: AppConfig,
        private sessionStorageService: SessionStorageService
    ) {
        this.urlApi = AppConfig.BACKOFFICE_API;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
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

    getProductionReport(baseFilter: BaseFilter) {
        const body = JSON.stringify(baseFilter);
        return this.http
            .post(
                this.config.apiUrl + '/ProductionReport/getProductionReport',
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

    listar(datos: BuscarProduccionRequest) {
        const parametros = new HttpParams()
            .set('filterscount', datos.filterscount)
            .set('groupscount', datos.groupscount)
            .set('pagenum', datos.pagenum)
            .set('pagesize', datos.pagesize)
            .set('recordstartindex', datos.recordstartindex)
            .set('recordendindex', datos.recordendindex)
            .set('P_DRANGESTART', datos.P_DRANGESTART)
            .set('P_DRANGEEND', datos.P_DRANGEEND)
            .set('P_NPOLICY', datos.P_NPOLICY)
            .set('P_NNUMPOINT', datos.P_NNUMPOINT)
            .set('_', datos._);
        const url = this.urlApi + '/VariousReports/Core/ProductionRead';
        const call = this._http.get(url, { params: parametros });
        return this.llamarApi(call);
    }
}
