import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InmobiliaryClosingDateConfigService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    // ORIGEN
    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarOrigen', { headers: this.headers });
    };

    // INTERFAZ
    public listarInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ListarInterfaz', data, { headers: this.headers });
    }

    // ESTADOS
    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoClosingDateConfig/ListarEstados', { headers: this.headers });
    };

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    // MESES
    public listarMeses(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoClosingDateConfig/ListarMeses', { headers: this.headers });
    };

    // CONFIGURACIONES CRUD
    public listarConfiguraciones(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/ListarConfiguraciones', data, { headers: this.headers });
    }

    public agregarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/AgregarConfiguracion', data, { headers: this.headers });
    }

    public modificarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/ModificarConfiguracion', data, { headers: this.headers });
    }

    public eliminarConfiguracion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/EliminarConfiguracion', data, { headers: this.headers });
    }
}