import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InmobiliaryInterfazService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarOrigen');
    };

    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarEstados');
    };

    public listarTipoAsiento(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarTipoAsiento');
    };

    public consultarTipoAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InmoInterfaz/ConsultarTipoAsiento', data, { headers: this.headers });
    };

    public listarReportesAsociados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarReportesAsociados');
    };

    public listarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ListarInterfaz', data, { headers: this.headers });
    }

    public agregarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/AgregarInterfaz', data, { headers: this.headers });
    }

    public modificarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ModificarInterfaz', data, { headers: this.headers });
    }

    public eliminarInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/EliminarInterfaz', data, { headers: this.headers });
    }

    public listarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ListarMovimientos', data, { headers: this.headers });
    }

    public agregarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/AgregarMovimientos', data, { headers: this.headers });
    }

    public modificarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/ModificarMovimientos', data, { headers: this.headers });
    }

    public eliminarMovimientos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaz/EliminarMovimientos', data, { headers: this.headers });
    }
}