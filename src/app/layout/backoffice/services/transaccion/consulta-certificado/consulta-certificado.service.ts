import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TipoDocumentoRequest,
  BuscarRequest,
} from '../../../models/transaccion/consulta-certificados/consulta-certificados.model';
@Injectable({
  providedIn: 'root',
})
export class ConsultaCertificadoService {
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

  buscar(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('P_NIDDOC_TYPE', datos.P_NIDDOC_TYPE)
      .set('P_SIDDOC', datos.P_SIDDOC)
      .set('P_SREGIST', datos.P_SREGIST);
    const url = this.urlApi + '/AnnulmentNroLtDes/Core/CertifRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  tipo_documento(datos: TipoDocumentoRequest) {
    const parametros = new HttpParams()
      .set('P_USER', datos.P_USER)
      .set('_', datos._);
    const url = this.urlApi + '/FastRegisterUnit/Core/TypeDocumentRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
