import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { Contratante } from '../models/contratante.model';
import { TipoDocumento } from '../models/tipo-documento.model';
import { Observable } from 'rxjs/Observable';
import { Auto } from '../models/auto.model';
import { PrimaFilter } from '../models/prima.model';
import { PlanFilter } from '../../../broker/models/plan/planfilter';
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class ClienteService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private api: ApiService) {}

  getTiposPersona(tipoPersona: number = 0) {
    const endpoint = 'cliente';
    const action = 'GetListTipoPersona';
    const url = `${endpoint}/${action}/${tipoPersona}`;

    return this.api.get(url);
  }

  getTiposDocumento(id, idtipo): Observable<TipoDocumento[]> {
    const endpoint = 'cliente';
    const action = 'GetListTipoDocumento';
    const url = `${endpoint}/${action}/${id}/${idtipo}`;

    return this.api.get(url);
  }

  registrar(cliente: any) {
    const endpoint = 'cliente';
    const data = JSON.stringify(cliente);

    return this.api.postHeader(endpoint, data, this.headers);
  }

  obtenerCliente(id): Observable<Contratante> {
    const endpoint = 'cliente';
    const url = `${endpoint}/${id}`;

    return this.api.get(endpoint);
  }
}
