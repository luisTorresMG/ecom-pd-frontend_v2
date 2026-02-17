import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class ModuleReportsService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    public listarOrigen(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', { headers: this.headers });
    };

    public listarInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, { headers: this.headers });
    }

    public reporteContableXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportContable', data, { headers: this.headers });
    }

    public reporteOperativoXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportOperaciones', data, { headers: this.headers });
    }
    public reporteControlBancarioXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportControlBancario', data, { headers: this.headers });
    }

    // PRODUCTOS VILP
    public listarProductosVILP(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/ModuleReports/ListarProductosVILP', { headers: this.headers });
    }

    public reporteTransferencias(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportTransferencias', data, { headers: this.headers });
    }
    //INI MMQ 22/01/2023 AHO.TOT 
    public reporteCuentasPorCobrar(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportCuentasPorCobrar', data, { headers: this.headers });
    }
    //FIN MMQ 22/01/2023 AHO.TOT 
    public reporteCheques(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportCheques', data, { headers: this.headers });
    }
    //INI MMQ 09-08-2024
    public reportePreliminar(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportPreliminar', data, { headers: this.headers });
    }
    //FIN MMQ 09-08-2024

    // INI  SD-72290 - 01-09-2025 -->
    public reporteCentrosCostosXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ModuleReports/ProcessReportCentrosCostos', data, { headers: this.headers });
    }
    // FIN  SD-72290 - 01-09-2025 -->
}