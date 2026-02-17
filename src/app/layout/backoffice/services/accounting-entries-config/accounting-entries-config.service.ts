import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

@Injectable({ providedIn: 'root' })
export class AccountingEntriesConfigService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  // LISTAR ORIGEN
  public listarOrigen(): Observable<any> {
    return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', {
      headers: this.headers,
    });
  }

  // LISTAR ESTADOS
  public listarEstados(): Observable<any> {
    return this.http.get<any[]>(
      this.Url + '/AccountEntriesConfig/ListarEstadosAsiento',
      { headers: this.headers }
    );
  }

  // INTERFAZ
  public listarInterfaces(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, {
      headers: this.headers,
    });
  }

  // LISTAR MOVIMIENTOS DE ASIENTOS
  public listarMovimientoAsiento(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarMovimientoAsiento',
      data,
      { headers: this.headers }
    );
  }

  // LISTAR MONTO ASOCIADO
  public listarMontoAsociado(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarMontoAsociado',
      data,
      { headers: this.headers }
    );
  }

  // LISTAR DETALLE ASOCIADO
  public listarDetalleAsociado(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarDetalleAsociado',
      data,
      { headers: this.headers }
    );
  }

  // LISTAR TIPO DINAMICA
  public listarTipoDinamica(): Observable<any> {
    return this.http.get<any[]>(
      this.Url + '/AccountEntriesConfig/ListarTipoDinamica',
      { headers: this.headers }
    );
  }

  /*********************ASIENTOS CONTABLES********************/
  // ASIENTO CONTABLES
  public listarAsientosContanbles(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarConfiguracionAsientosContables',
      data,
      { headers: this.headers }
    );
  }

  // AGREGAR ASIENTO CONTABLES
  public agregarAsientosContanbles(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/AgregarConfiguracionAsientosContables',
      data,
      { headers: this.headers }
    );
  }

  // ELIMINAR ASIENTO CONTABLES
  public eliminarAsientosContanbles(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/EliminarConfiguracionAsientosContables',
      data,
      { headers: this.headers }
    );
  }

  // MODIFICAR ASIENTO CONTABLES
  public modificarAsientosContables(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url +
        '/AccountEntriesConfig/ModificarConfiguracionAsientosContables',
      data,
      { headers: this.headers }
    );
  }
  /****************DINAMICAS******************/
  // ASIENTO CONTABLES
  public listarDinamicasContables(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarDinamicasContables',
      data,
      { headers: this.headers }
    );
  }

  // AGREGAR DINAMICA CONTABLE
  public agregarDinamicasContables(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/AgregarDinamicasContables',
      data,
      { headers: this.headers }
    );
  }

  // MODIFICAR DINAMICA ASIENTO
  public modificarDinamicaAsientos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ModificarDinamicaAsientos',
      data,
      { headers: this.headers }
    );
  }

  // ELIMINAR DINAMICA ASIENTOS
  public eliminarDinamicaAsientos(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/EliminarDinamicaAsientos',
      data,
      { headers: this.headers }
    );
  }

  /****************DETALLE DINAMICAS******************/
  // LISTAR DETALLE DINAMICA
  public listarDetalleDinamica(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/ListarDetalleDinamica',
      data,
      { headers: this.headers }
    );
  }

  // AGREGAR DETALLE DINAMICA ASIENTO
  public agregarDetalleDinamicas(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/AgregarDetalleDinamicas',
      data,
      { headers: this.headers }
    );
  }

  // ELIMINAR DINAMICA ASIENTOS
  public eliminarDetalleDinamica(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/AccountEntriesConfig/EliminarDetalleDinamica',
      data,
      { headers: this.headers }
    );
  }
}
