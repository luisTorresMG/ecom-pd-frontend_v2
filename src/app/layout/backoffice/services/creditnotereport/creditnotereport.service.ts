import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import 'rxjs/add/operator/catch';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { CreditNoteReport } from '../../models/creditnotereport/creditnotereport';
import { BaseFilter } from '../../models/basefilter/basefilter';

@Injectable()
export class CreditNoteReportService {
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
        private http: HttpClient,
        private config: AppConfig,
        private sessionStorageService: SessionStorageService) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }


    getCreditNoteReport(baseFilter: BaseFilter) {
        const body = JSON.stringify(baseFilter);
        return this.http
            .post(
                this.config.apiUrl + '/CreditNoteReport/getCreditNoteReport',
                body, { headers: this.headers }
            )
            .map(response => response,
                error => {
                    console.log(error);
                });
    }

}
