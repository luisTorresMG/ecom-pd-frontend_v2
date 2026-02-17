import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InmobiliaryModuleReportsService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    public listarOrigen(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarOrigen', { headers: this.headers });
    };

    public listarInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ListarInterfaz', data, { headers: this.headers });
    }

    public reporteContableXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportContable', data, { headers: this.headers });
    }

    public reporteOperativoXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportOperaciones', data, { headers: this.headers });
    }
    public reporteControlBancarioXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportControlBancario', data, { headers: this.headers });
    }

    // PRODUCTOS VILP
    public listarProductosVILP(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/InmoModuleReports/ListarProductosVILP', { headers: this.headers });
    }

    public reporteTransferencias(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportTransferencias', data, { headers: this.headers });
    }
    //INI MMQ 22/01/2023 AHO.TOT 
    public reporteCuentasPorCobrar(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportCuentasPorCobrar', data, { headers: this.headers });
    }
    //FIN MMQ 22/01/2023 AHO.TOT 
    public reporteCheques(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoModuleReports/ProcessReportCheques', data, { headers: this.headers });
    }
}