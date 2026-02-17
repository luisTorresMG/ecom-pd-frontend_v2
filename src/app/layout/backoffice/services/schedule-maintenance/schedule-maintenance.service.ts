import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class ScheduleMaintenanceService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    // ORIGEN
    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', { headers: this.headers });
    };

    // INTERFAZ
    public listarInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, { headers: this.headers });
    }

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    // LISTAR HORTARIOS
    public listarHorarios(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Schedule/ListarHorarios', { headers: this.headers });
    };

    // MODIFICAR HORTARIOS
    public modificarHorarios(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Schedule/ModificarHorarios', data, { headers: this.headers });
    };

    // REGISTRAR HORTARIOS
    public registrarHorarios(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Schedule/RegistrarHorarios', data, { headers: this.headers });
    };

    // INICIAR SERVICIO
    public iniciarServicio(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Schedule/IniciarServicio', data, { headers: this.headers });
    };

    // DETENER SERVICIO
    public detenerServicio(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Schedule/DetenerServicio', data, { headers: this.headers });
    };

    // ESTADO SERVICIO
    public estadoServicio(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Schedule/EstadoServicio', data, { headers: this.headers });
    };

    // LISTAR SERVICIOS
    public listarServicios(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Schedule/ListarServicios', { headers: this.headers });
    };
}