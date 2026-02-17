import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
    providedIn: 'root'
})
export class SuspensionService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }


    public getBranchAvailable() {
        const url = this.Url + '/PeriodoSuspension/GetListBranch';
        return this.http.get(url);
    }

    public getListSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/GetListSusp', data, {
                headers: this.headers
            });
    }

    public updCloseSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/UpdCloseSuspension', data, {
                headers: this.headers
            });
    }

    public updDeleteSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/UpdDeleteSuspension', data, {
                headers: this.headers
            });
    }

    public updFechasSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/UpdSuspension', data, {
                headers: this.headers
            });
    }

    public insNewSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/InsertNewSuspension', data, {
                headers: this.headers
            });
    }

    public valStatusSuspension(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/PeriodoSuspension/ValidateStatusSuspensionTransac', data, {
                headers: this.headers
            });
    }
}
