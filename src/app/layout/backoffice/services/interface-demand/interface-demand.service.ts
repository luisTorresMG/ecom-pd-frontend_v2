import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InterfaceDemandService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

//cambios temp
    public obtenerFechaDeCierreDelaInterfaz(filtros: any): Observable<any> {
        const data = JSON.stringify(filtros);
        return this.http.post(this.Url + '/InterfazDemanda/obtenerFechaCierreInterfaz', data, { headers: this.headers });
    }

    public EnviarSolicitudInterfazDemanda(filtros: any): Observable<any> {
        const data = JSON.stringify(filtros);
        return this.http.post(this.Url + '/InterfazDemanda/EnviarSolicitudInterfazDemanda', data, { headers: this.headers });
    }

        public obtenerConfiguracionCierrexInterfaz(filtros: any): Observable<any> {
        const data = JSON.stringify(filtros);
        return this.http.post(this.Url + '/InterfazDemanda/ListarConfiguracionesInterfazDemanda', data, { headers: this.headers });
    }
}
