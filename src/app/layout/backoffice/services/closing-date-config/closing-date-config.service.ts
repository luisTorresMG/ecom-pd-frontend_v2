import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class ClosingDateConfigService {

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

    // ESTADOS
    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/ClosingDateConfig/ListarEstados', { headers: this.headers });
    };

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    // MESES
    public listarMeses(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/ClosingDateConfig/ListarMeses', { headers: this.headers });
    };

    // CONFIGURACIONES CRUD
    public listarConfiguraciones(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarConfiguraciones', data, { headers: this.headers });
    }

    public agregarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/AgregarConfiguracion', data, { headers: this.headers });
    }

    public modificarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ModificarConfiguracion', data, { headers: this.headers });
    }

    public eliminarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/EliminarConfiguracion', data, { headers: this.headers });
    }
}