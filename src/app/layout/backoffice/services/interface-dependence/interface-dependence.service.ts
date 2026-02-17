import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InterfaceDependenceService {

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

    // LISTAR DEPENDECIAS DE INTERFAZ
    public listarDependenciasInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/ListarDependenciasInterfaces', data, { headers: this.headers });
    };

    // AGREGAR DEPENDECIAS DE INTERFAZ
    public agregarDependenciasInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/AgregarDependenciasInterfaces', data, { headers: this.headers });
    };

    // ELIMINAR DEPENDECIAS DE INTERFAZ
    public eliminarDependenciasInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post<any[]>(this.Url + '/InterfaceDependence/EliminarDependenciasInterfaces', data, { headers: this.headers });
    };
}