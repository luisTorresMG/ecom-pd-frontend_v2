import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class PriorityConfigurationService {

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

    // LISTAR DEPENDECIAS DE INTERFAZ FILTRADAS
    public listarDependenciasInterfacesFiltradas(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/ListarDependenciasInterfacesFiltradas', data, { headers: this.headers });
    };

    // LISTAR PRIORIDADES DE INTERFAZ
    public listarPrioridadesInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/ListarPrioridadesInterfaces', data, { headers: this.headers });
    };

    // ELIMINAR E INSERTAR NUEVAS PRIORIDADES
    public eliminarAgregarPrioridadesInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/EliminarAgregarPrioridadesInterfaces', data, { headers: this.headers });
    };
}