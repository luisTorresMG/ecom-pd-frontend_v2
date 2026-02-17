import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ListarRequest,
  IListarResponse,
  EnviarRequest,
  ProvinciaRequest,
  DistritoRequest,
  ZonaRequest,
  MarcaRequest,
  ModeloRequest,
  ClaseRequest,
} from '../../models/soat/envio-certificado.model';
import { param } from 'jquery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvioCertificadoService {
  private urlApi: string;
  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.BACKOFFICE_API;
  }

  private llamarApi(call: any) {
    const data = new Observable((obs) => {
      call.subscribe(
        (res) => {
          obs.next(res);
          obs.complete();
        },
        (error) => {
          obs.error(error);
        }
      );
    });
    return data;
  }

  listar(datos: ListarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', '0')
      .set('pagesize', '10')
      .set('recordstartindex', '0')
      .set('recordendindex', '16')
      .set('P_NPOLESP', datos.P_NPOLESP)
      .set('P_SPLATE', datos.P_SPLATE)
      .set('P_NTIPPER', '0')
      .set('P_SNAME', '')
      .set('P_NNRODOC', '')
      .set('P_SAPEPAT', '')
      .set('P_SAPEMAT', '')
      .set('P_NUSERCODE', '62')
      .set('_', '1633383448098');
    const url = this.urlApi + '/EndososGral/Core/EndososReadList';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  uso() {
    const parametros = new HttpParams()
      .set('P_USER', '62')
      .set('_', '1633544085761');
    const url = this.urlApi + '/FastRegisterUnit/Core/UseRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  tipo_do() {
    const parametros = new HttpParams()
      .set('S_TYPE', 'TYPEDOCUMENTS_CH')
      .set('_', '1633553322536');
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  depar() {
    const parametros = new HttpParams()
      .set('P_USER', '62')
      .set('_', '1633553322558');
    const url = this.urlApi + '/FastRegisterUnit/Core/DepartmentRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  prov(datos: ProvinciaRequest) {
    const parametros = new HttpParams()
      .set('P_NPROVINCE', datos.P_NPROVINCE)
      .set('P_NLOCAL', datos.P_NLOCAL)
      .set('P_SDESCRIPT', datos.P_SDESCRIPT)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ProvinceRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  dist(datos: DistritoRequest) {
    const parametros = new HttpParams()
      .set('P_NLOCAL', datos.P_NLOCAL)
      .set('P_NMUNICIPALITY', datos.P_NMUNICIPALITY)
      .set('P_SDESCRIPT', datos.P_SDESCRIPT)
      .set('_', datos._);
    const url = this.urlApi + '/User/Emergente/DistritoRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  zona(datos: ZonaRequest) {
    const parametros = new HttpParams()
      .set('P_SREGIST', datos.P_SREGIST)
      .set('P_STYPE_VEHICLE', datos.P_STYPE_VEHICLE)
      .set('P_NPROVINCE', datos.P_NPROVINCE)
      .set('P_NYEAR', datos.P_NYEAR)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ZoneRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  marca(datos: MarcaRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/MarkRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  modelo(datos: ModeloRequest) {
    const parametros = new HttpParams()
      .set('P_NVEHBRAND', datos.P_NVEHBRAND)
      .set('P_NVEHMODEL', datos.P_NVEHMODEL)
      .set('P_SDESCRIPT', datos.P_SDESCRIPT)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ModelRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  clase(datos: ClaseRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ClassRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  enviar(datos: EnviarRequest) {
    const parametros = new HttpParams()
      .set('NPOLESP_COMP', datos.certificado)
      .set('SE_MAIL', datos.correo);
    const url = this.urlApi + '/EnvioCorreo/Core/UpdateMailPDF';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
