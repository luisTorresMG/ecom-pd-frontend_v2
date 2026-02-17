import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })
export class InmobiliaryInterfaceMonitoringCBCOService {
    
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    //ORIGEN
    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/InmoInterfaz/ListarOrigen', { headers: this.headers });
    };

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    // ESTADOS DE PROCESO
    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaceMonitoringCBCO/ListarEstados', { headers: this.headers });
    };

    // CABECERA INTERFACES
    public listarCabeceraInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarCabeceraInterfacesCBCO', data, { headers: this.headers });
    }

    // CABECERA INTERFACES POR RECIBO
    public listarCabeceraInterfacesRecibo(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarCabeceraInterfacesCBCORecibo', data, { headers: this.headers });
    }

    // DETALLE INTERFACES
    public listarDetalleInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesCBCO', data, { headers: this.headers });
    }
  
    // ERRORES DETALLE 
    public listarErroresDetalle(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarErroresDetalle', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS
    public listarDetalleInterfacesExactus(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesExactus', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ERRORES
    public listarDetalleInterfacesExactusError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesExactusError', data, { headers: this.headers });
    }

    // INSERTAR REPROCESO
    public insertarReproceso(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoReprocess/InsertarReproceso', data, { headers: this.headers });
    }

    // INSERTAR REPROCESO EXACTUS
    public insertarReprocesoAsi(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoReprocess/InsertarReprocesoAsi_CBCO', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS INTERMEDIO
    public listarDetalleInterfacesAsientosContables(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContables', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ASIENTO INTERMEDIO
    public listarDetalleInterfacesAsientosContablesAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesAsiento', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ERRORES INTERMEDIO
    public listarDetalleInterfacesAsientosContablesError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesError', data, { headers: this.headers });
    }

    // TIPO BÚSQUEDA
    public listarTipoBusqueda(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaceMonitoring/ListarTipoBusqueda', { headers: this.headers });
    };

    // DETALLE OPERACIÓN
    public listarDetalleOperacion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/listarDetalleOperacion', data, { headers: this.headers });
    }

    // DETALLE INTERFACES XLSX COBRANZA
    public listarDetalleInterfacesXLSX_CB(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesXLSX_CBCO', data, { headers: this.headers });
    }
}