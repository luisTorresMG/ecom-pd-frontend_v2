//agregado por Rosa Angelica
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class BulkLoadSurchargesService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getTransactionsByProduct(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/transactionsByProduct', body, {headers: this.headers})
    }

    validateTramaRecargos(paquete: FormData): Observable<any> {
        return this.http.post(this.Url + '/PolicyManager/validateTramaRecargos', paquete);
    }
}
