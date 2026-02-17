import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InterfaceBankPaymentService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public ListarOrigen(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', { headers: this.headers });
    }

    public ListarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, { headers: this.headers });
    }

    public ListarTipoBusquedaSI(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoring/ListarTipoBusquedaSI', data, { headers: this.headers });
    }

    public ListarBancosTesoreria(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InterfaceMonitoringTeso/ListarBancosTesoreria', { headers: this.headers });
    }

    public ListarBuscarPor(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InterfaceMonitoringTeso/ListarBuscarPor', { headers: this.headers });
    }

    public ListarEstadosTesoreria(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarEstadosTesoreria', data, { headers: this.headers });
    }

    public ListarAprobaciones(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarAprobaciones', data, { headers: this.headers });
    }

    public ListarAprobacionesDoc(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarAprobacionesDoc', data, { headers: this.headers });
    }

    public ListarAprobacionesDetalle(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarAprobacionesDetalle', data, { headers: this.headers });
    }

    public ListarAprobacionesDetalleDoc(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarAprobacionesDetalleDoc', data, { headers: this.headers });
    }

    public AgregarDetalleObservacion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/AgregarDetalleObservacion', data, { headers: this.headers });
    }

    public ListarDetalleObservacion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarDetalleObservacion', data, { headers: this.headers });
    }

    public AprobarProcesoList(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/AprobarProcesoList', data, { headers: this.headers });
    }

    public ResolverObservacionList(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ResolverObservacionList', data, { headers: this.headers });
    }    

    public ListarBankTesoreriaCAB_XLS(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarBankTesoreriaCAB_XLS', data, { headers: this.headers });
    }

    public ListarBankTesoreriaDET_XLS(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/ListarBankTesoreriaDET_XLS', data, { headers: this.headers });
    }

    public GetHorarioInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/GetHorarioInterfaz', data, { headers: this.headers });
    }
}