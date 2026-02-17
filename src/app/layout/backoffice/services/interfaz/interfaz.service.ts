import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InterfazService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen');
    };

    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarEstados');
    };

    public listarTipoAsiento(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarTipoAsiento');
    };

    public consultarTipoAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/Interfaz/ConsultarTipoAsiento', data, { headers: this.headers });
    };

    public listarReportesAsociados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarReportesAsociados');
    };

    public listarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, { headers: this.headers });
    }

    public agregarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/AgregarInterfaz', data, { headers: this.headers });
    }

    public modificarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ModificarInterfaz', data, { headers: this.headers });
    }

    public eliminarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/EliminarInterfaz', data, { headers: this.headers });
    }

    public listarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarMovimientos', data, { headers: this.headers });
    }

    public agregarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/AgregarMovimientos', data, { headers: this.headers });
    }

    public modificarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ModificarMovimientos', data, { headers: this.headers });
    }

    public eliminarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/EliminarMovimientos', data, { headers: this.headers });
    }
}