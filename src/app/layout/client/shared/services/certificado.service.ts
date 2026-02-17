import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class CertificadoService {
  constructor(private api: ApiService) { }
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  obtenerPoliza(filter: any) {
    const endpoint = 'certificado';
    const action = 'getpolizas';
    const url = `${endpoint}/${action}/${filter.canal}/${filter.puntoventa}/${filter.modalidad}`;

    return this.api.get(url);
  }

  registrarCertificado(datos) {
    const endpoint = 'certificado';
    // const action = '';
    const url = `${endpoint}`; // ${action}
    const data = JSON.stringify(datos);

    return this.api.postHeader(url, data, this.headers);
  }

  registrarCertificadoecommerce(datos) {
    const endpoint = 'certificado';
    const action = 'certificadoecommerce';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(datos);

    return this.api.postHeader(url, data, this.headers);
  }

}
