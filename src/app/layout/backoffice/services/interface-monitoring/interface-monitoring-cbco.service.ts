import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })

export class InterfaceMonitoringCBCOService {
    
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    //ORIGEN
    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', { headers: this.headers });
    };

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarRamos', data, { headers: this.headers });
    };

    // ESTADOS DE PROCESO
    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InterfaceMonitoringCBCO/ListarEstados', { headers: this.headers });
    };

    // CABECERA INTERFACES
    public listarCabeceraInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarCabeceraInterfacesCBCO', data, { headers: this.headers });
    }

    // CABECERA INTERFACES POR RECIBO
    public listarCabeceraInterfacesRecibo(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarCabeceraInterfacesCBCORecibo', data, { headers: this.headers });
    }

    // DETALLE INTERFACES
    public listarDetalleInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesCBCO', data, { headers: this.headers });
    }
  
    // ERRORES DETALLE 
    public listarErroresDetalle(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarErroresDetalle', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS
    public listarDetalleInterfacesExactus(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesExactus', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ERRORES
    public listarDetalleInterfacesExactusError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesExactusError', data, { headers: this.headers });
    }

    // INSERTAR REPROCESO
    public insertarReproceso(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Reprocess/InsertarReproceso', data, { headers: this.headers });
    }

    // INSERTAR REPROCESO EXACTUS
    public insertarReprocesoAsi(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Reprocess/InsertarReprocesoAsi_CBCO', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS INTERMEDIO
    public listarDetalleInterfacesAsientosContables(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContables', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ASIENTO INTERMEDIO
    public listarDetalleInterfacesAsientosContablesAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesAsiento', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ERRORES INTERMEDIO
    public listarDetalleInterfacesAsientosContablesError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesError', data, { headers: this.headers });
    }

    // TIPO BÚSQUEDA
    public listarTipoBusqueda(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InterfaceMonitoring/ListarTipoBusqueda', { headers: this.headers });
    };

    // DETALLE OPERACIÓN
    public listarDetalleOperacion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/listarDetalleOperacion', data, { headers: this.headers });
    }

    // DETALLE INTERFACES XLSX COBRANZA
    public listarDetalleInterfacesXLSX_CB(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarDetalleInterfacesXLSX_CBCO', data, { headers: this.headers });
    }

    // RENTAS
    public ListarOrigenRentas(): Observable<any> {
        return this.http.get(this.Url + '/InterfaceMonitoringCBCO/ListarOrigenRentas', { headers: this.headers });
    }
    public ListarPagoSiniestro(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarPagoSiniestro', data, { headers: this.headers });
    }
    public ListarAprobacionesRentas(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/ListarAprobacionesRentas', data, { headers: this.headers });
    }
    public AprobarPagoList(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringCBCO/AprobarPagoList', data, { headers: this.headers });
    }

    // NUEVO RENTAS - DGC - 24/04/2024
    public ListarAprobacionesRentasRes(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/ListarAprobacionesRentasRes', data, { headers: this.headers });
    }
    public ListarAprobacionesRentasDet(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/ListarAprobacionesRentasDet', data, { headers: this.headers });
    }
    public MostrarTotalesMontos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/MostrarTotalesMontos', data, { headers: this.headers });
    }
    public AprobarPagos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/AprobarPagos', data, { headers: this.headers });
    }
    public GetDataReportRentasRes(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/GetDataReportRentasRes', data, { headers: this.headers });
    }
    public GetDataReportRentasDet(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Rentas/GetDataReportRentasDet', data, { headers: this.headers });
    }

    public GetHorarioInterfaz(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/GetHorarioInterfaz', data, { headers: this.headers });
    }

    public GetFechaAprobacionOP(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InterfaceMonitoringTeso/GetFechaAprobacionOP', data, { headers: this.headers });
    }
}
