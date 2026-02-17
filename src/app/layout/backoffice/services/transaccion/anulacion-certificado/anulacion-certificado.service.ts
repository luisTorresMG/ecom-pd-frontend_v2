import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BuscarRequest,
  AnularRequest,
  ValidarRequest,
  AnularCertifiRequest,
  EnviarEmailRequest,
} from '../../../models/anulacion-certificado/anulacion-certificado.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AnulaciónCertificadoService {
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

  listar(datos: BuscarRequest) {
    const parametros = new HttpParams().set('P_NPOLICY', datos.P_NPOLICY);
    const url = this.urlApi + '/Annulment/Core/CertifRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  motivo() {
    const parametros = new HttpParams()
      .set('P_USER', '62')
      .set('_', '1633544085761');
    const url = this.urlApi + '/Annulment/Core/MotiveRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  anular(datos: AnularRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY || '')
      .set('P_NMOTIVOANU', datos.P_NMOTIVOANU)
      .set('P_DNULLDATE', datos.P_DNULLDATE)
      .set('P_NBILLNUM', datos.P_NBILLNUM || 0)
      .set('P_DSTARTDATE', datos.P_DSTARTDATE || '')
      .set('P_DEXPIRDAT', datos.P_DEXPIRDAT || '')
      .set('P_NPREMIUM', datos.P_NPREMIUM || 0)
      .set('P_SDESCRIPTANU', datos.P_SDESCRIPTANU);
    const url = this.urlApi + '/Annulment/Core/ValAnulCertif';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  validar(datos: ValidarRequest) {
    const parametros = new HttpParams().set('P_NPOLICY', datos.P_NPOLICY);
    const url = this.urlApi + '/Annulment/Core/Val_Certif';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  anularCertifi(datos: AnularCertifiRequest) {
    const parametros = new HttpParams()
      .set('P_NPOLICY', datos.P_NPOLICY)
      .set('P_NMOTIVOANU', datos.P_NMOTIVOANU)
      .set('P_DNULLDATE', datos.P_DNULLDATE)
      .set('P_NUSERCODE', datos.P_NUSERCODE)
      .set('P_NVALOR_DEVOLVER', datos.P_NVALOR_DEVOLVER)
      .set('P_INDICA_TI_ANULA', datos.P_INDICA_TI_ANULA)
      .set('P_NRECEIPT', datos.P_NRECEIPT || 0)
      .set('P_SCERTYPE', datos.P_SCERTYPE || 0)
      .set('P_NBRANCH', datos.P_NBRANCH || 0)
      .set('P_NPRODUCT', datos.P_NPRODUCT || 0)
      .set('P_SCLIENT', datos.P_SCLIENT || '')
      .set('P_DSTARTDATE', datos.P_DSTARTDATE)
      .set('P_NBILLNUM', datos.P_NBILLNUM || 0)
      .set('P_NINSUR_AREA', datos.P_NINSUR_AREA || 0)
      .set('P_SBILLTYPE_ORI', datos.P_SBILLTYPE_ORI || '')
      .set('P_SBILLTYPE', datos.P_SBILLTYPE || '')
      .set('P_NPREMIUM', datos.P_NPREMIUM || 0)
      .set('P_NTRANSACTIO', datos.P_NTRANSACTIO || 0)
      .set('P_NCOMMISSI', datos.P_NCOMMISSI || 0)
      .set('P_NDIGIT_VERIF', datos.P_NDIGIT_VERIF || 0)
      .set('P_NIDDOC_TYPE', datos.P_NIDDOC_TYPE || 0)
      .set('P_SIDDOC', datos.P_SIDDOC || '');
    const url = this.urlApi + '/Annulment/Core/AnulCertif';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  enviarEmail(datos: EnviarEmailRequest) {
    const parametros = new HttpParams()
      .set('nroCertificado', datos.nroCertificado)
      .set('razonSocial', datos.razonSocial)
      .set('correo', datos.correo);
    const url = this.urlApi + '/Annulment/Core/enviarEmail';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
}
