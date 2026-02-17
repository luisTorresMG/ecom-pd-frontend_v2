import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../../../shared/services/api.service';
import { Auto } from '../models/auto.model';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';

@Injectable()
export class VehiculoService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private headersfile = new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' });

  _baseUrl = '';
  constructor(private http: HttpClient,
    private api: ApiService,
    private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }

  getClases(filter: any) {
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/Classe/classByModel', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  getMarcas(filter: any) {
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/brand/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  getModelosPrincipales(filter: any) {
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/model/modelsByBrandClass/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  getModelos(filter: any) {
    // console.log(uso);
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/model/modelByBrand/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  getModelosByBrandClass(filter: any) {
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/model/versionByBrandClass/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }


  getZonasCirculacion(filter: any) {
    const body = JSON.stringify(filter);
    return this.http.post(this._baseUrl + '/Zone/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  validarToken() {
    const endpoint = 'emission';
    const action = 'validatetoken';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  validarPlaca(tipo: string, placa: string) {
    const endpoint = 'emission';
    const action = 'validarplaca';
    const url = `${endpoint}/${action}/${tipo}/${placa}`;

    return this.api.get(url);
  }

  informacionPlaca(canalVenta: string, tipo: string, placa: string) {
    const endpoint = 'emission';
    const action = 'datosplaca';
    const url = `${endpoint}/${action}/${canalVenta}/${tipo}/${placa}`;
    return this.api.get(url);
  }

  validarPlacaMail(codigocanal: string, tipo: string, placa: string, correo: string) {
    const endpoint = '/emission';
    const action = 'validarplacamail';
    const url = `${endpoint}/${action}`;

    const data = {
      codigocanal,
      tipo,
      placa,
      correo
    };

    return this.http.post(this._baseUrl + url, data, { headers: this.headers });
  }


  renovacionPlaca(placa: string) {
    const endpoint = 'emission';
    const action = 'renovacionplaca';
    const url = `${endpoint}/${action}/${placa}`;

    return this.api.get(url);
  }

  validarPlacaCampaign(codchannel: string, placa: string) {
    const endpoint = 'emission';
    const action = 'validarplacacampaign';
    const url = `${endpoint}/${action}/${codchannel}/${placa}`;

    return this.api.get(url);
  }

  registrar(vehiculo: any) {
    const endpoint = 'auto';
    const data = JSON.stringify(vehiculo);

    return this.http.post(this._baseUrl + '/Auto/', data, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  obtenerVehiculo(id): Observable<Auto> {
    const endpoint = 'auto';
    const url = `${endpoint}/${id}`;

    return this.api.get(url);
  }

  obtenerCodigoCanal(key: string) {
    const endpoint = 'codechannel';
    const action = 'obtenercodechannel';
    const url = `${endpoint}/${action}/${key}`;
    return this.api.get(url);
  }

  aplicarCupon(filter: any) {
    const endpoint = 'codechannel';
    const action = 'aplicarcupon';
    const url = `${endpoint}/${action}`;
    return this.api.post(url, filter);
  }

  registrarEmision(IdProceso) {
    const endpoint = 'emissionproc';
    const action = 'EmissionProcessPolicy';
    const url = `${endpoint}/${action}`;
    const data = {
      NIDPROCESS: IdProceso
    };
    return this.api.postHeader(url, data, this.headers);
  }

  LeerArchivo2(path) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=ISO-8859-1');
    return this.http.get(path, { headers, responseType: 'text' });
  }


  registrarTracking(IdProceso, IdCliente, Prima) {
    const endpoint = 'tracking';
    const action = 'registertracking';
    const url = `${endpoint}/${action}`;

    const data = {
      NIDPROCESS: IdProceso,
      NPREMIUM: Prima,
      NCLIENTID: IdCliente
    };
    return this.api.post(url, data);
  }

  LeerArchivo() {
    const endpoint = 'tool';
    const action = 'GetTerms';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  ObtenerConfiguracion() {
    const endpoint = 'tool';
    const action = 'admindata';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

}

