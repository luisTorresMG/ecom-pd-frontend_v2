import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TipoDocRequest,
  BuscarRequest,
  MarcaRequest,
  UsoRequest,
  VersionRequest,
  ClaseRequest,
  DepartamentoRequest,
  ProvinciaRequest,
  DistritoRequest,
  ValidarRequest,
  ComparacionRequest,
} from '../../../models/transaccion/endosos-general/endosos-general.model';
@Injectable({
  providedIn: 'root',
})
export class EndososGeneralService {
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

  estado(datos: TipoDocRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  marca(datos: MarcaRequest) {
    const parametros = new HttpParams().set('_', datos._);
    const url = this.urlApi + '/EndososGral/Core/MarkRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  uso(datos: UsoRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/UseRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  version(datos: VersionRequest) {
    const parametros = new HttpParams()
      .set('P_NVEHBRAND', datos.P_NVEHBRAND)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/VersionRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  clase(datos: ClaseRequest) {
    const parametros = new HttpParams()
      .set('P_NVEHBRAND', datos.P_NVEHBRAND)
      .set('P_SDESVEHMODEL', datos.P_SDESVEHMODEL)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ClassRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  departamento(datos: DepartamentoRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/DepartmentRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  provincia(datos: ProvinciaRequest) {
    const parametros = new HttpParams()
      .set('P_NPROVINCE', datos.P_NPROVINCE)
      .set('P_NLOCAL', datos.P_NLOCAL)
      .set('P_SDESCRIPT', datos.P_SDESCRIPT)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/ProvinceRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  distrito(datos: DistritoRequest) {
    const parametros = new HttpParams()
      .set('P_NLOCAL', datos.P_NLOCAL)
      .set('P_NMUNICIPALITY', datos.P_NMUNICIPALITY)
      .set('P_SDESCRIPT', datos.P_SDESCRIPT)
      .set('_', datos._);
    const url = this.urlApi + '/User/Emergente/DistritoRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  buscar(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLESP', datos.P_NPOLESP)
      .set('P_SPLATE', datos.P_SPLATE)
      .set('P_NTIPPER', datos.P_NTIPPER)
      .set('P_SNAME', datos.P_SNAME)
      .set('P_NNRODOC', datos.P_NNRODOC)
      .set('P_SAPEPAT', datos.P_SAPEPAT)
      .set('P_SAPEMAT', datos.P_SAPEMAT)
      .set('P_NUSERCODE', datos.P_NUSERCODE);
    const url = this.urlApi + '/EndososGral/Core/EndososRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  validar(datos: ValidarRequest) {
    const parametros = new HttpParams()
      .set('P_NVOUCHER', datos.P_NVOUCHER) // *
      .set('P_NPOLESP_COMP', datos.P_NPOLESP_COMP) // *
      .set('P_DVIGINI', datos.P_DVIGINI) // *
      .set('P_DVIGFIN', datos.P_DVIGFIN) // *
      .set('P_DEFFECDATE', datos.P_DEFFECDATE) // *
      .set('P_DEFFECDATE_', datos.P_DEFFECDATE_) // *
      .set('HORA_EMISION', datos.HORA_EMISION) // *
      .set('P_FECHA_EMISION2', datos.P_FECHA_EMISION2) // *
      .set('P_FECHA_EMISION', datos.P_FECHA_EMISION) // *
      .set('P_HORA', datos.P_HORA) // *
      .set('P_SPLATE', datos.P_SPLATE) // *
      .set('P_NMARK', datos.P_NMARK) // *
      .set('P_NSEATING', datos.P_NSEATING) // *
      .set('P_NYEAR', datos.P_NYEAR) // *
      .set('P_SSERIAL', datos.P_SSERIAL) // *
      .set('P_NCIRCU', datos.P_NCIRCU) // *
      .set('P_NTIPPER', datos.P_NTIPPER) // *
      .set('P_SNUMDOC', datos.P_SNUMDOC) // *
      .set('P_SLEGALNAME', datos.P_SLEGALNAME) // *
      .set('P_SFIRSTNAME', datos.P_SFIRSTNAME) // *
      .set('P_SNAME', datos.P_SNAME) // *
      .set('P_SLASTNAME', datos.P_SLASTNAME) // *
      .set('P_SLASTNAME2', datos.P_SLASTNAME2) // *
      .set('P_SE_MAIL_S', datos.P_SE_MAIL_S) // *
      .set('P_SSTREET', datos.P_SSTREET) // *
      .set('P_SADDRESS', datos.P_SADDRESS) // *
      .set('P_NPROVINCE', datos.P_NPROVINCE) // *
      .set('P_NLOCAL', datos.P_NLOCAL) // *
      .set('P_NMUNICIPALITY', datos.P_NMUNICIPALITY) // *
      .set('P_SCLIENT', datos.P_SCLIENT) // *
      .set('P_NREASON', datos.P_NREASON) // *
      .set('P_NDIGIT_VERIF', datos.P_NDIGIT_VERIF) // *
      .set('P_SOBSERVATION', datos.P_SOBSERVATION) // *
      .set('P_NIDDOC_TYPE', datos.P_NIDDOC_TYPE) // *
      .set('P_SCLIENTNAME', datos.P_SCLIENTNAME) // *
      .set('P_NUSERREGISTER', datos.P_NUSERREGISTER) // *
      .set('P_NRESULTADO', datos.P_NRESULTADO) // *
      .set('P_SNOMMARCA', datos.P_SNOMMARCA) // *
      .set('P_NMODEL', datos.P_NMODEL) // *
      .set('P_AUTORIZA', datos.P_AUTORIZA) // *
      .set('P_SCLASSTYPE', datos.P_SCLASSTYPE) // *
      .set('P_SORIGEN', datos.P_SORIGEN) // *
      .set('P_SREGIST_TMP', datos.P_SREGIST_TMP) // *
      .set('P_VALIDA', datos.P_VALIDA) // *
      .set('P_NCLASE', datos.P_NCLASE) // *
      .set('P_NUSO', datos.P_NUSO) // *
      .set('P_TI', datos.P_TI) // *
      .set('P_NPREMIUM', datos.P_NPREMIUM); // *
    const url = this.urlApi + '/EndososGral/Core/PRO_VAL_CAMPOS';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  modificar(datos: any) {
    const url = this.urlApi + '/EndososGral/Core/InsertEndososPlataforma';
    const call = this._http.post(url, datos);
    return this.llamarApi(call);
  }

  comparacion(datos: ComparacionRequest) {
    const parametros = new HttpParams()
      .set('P_NVEHBRAND', datos.P_NVEHBRAND)
      .set('P_DESVEHMODEL', datos.P_DESVEHMODEL)
      .set('P_NIDCLASE', datos.P_NIDCLASE);
    const url = this.urlApi + '/FastRegisterUnit/Core/GetVersionEquivalente';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
