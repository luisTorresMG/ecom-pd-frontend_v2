import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { ApiService } from '../../shared/services/api.service';
import { ConfigService } from '../../shared/services/general/config.service';
import { UtilityService } from '../../shared/services/general/utility.service';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  baseURL: string;
  headers = {};

  constructor(
    private readonly api: ApiService,
    private readonly configService: ConfigService,
    private readonly utilityService: UtilityService
  ) {
    this.baseURL = this.configService.getWebApiURL();
  }

  removeItem(processId: number) {
    const payload = this.utilityService.encodeObjectToBase64({
      IdProceso: processId,
    });

    return this.api
      .post('ecommerce/EliminarProceso', { data: payload })
      .pipe(map((response) => response));
  }

  getPagoEfectivoURL(data) {
    const payload = this.utilityService.encodeObjectToBase64(
      JSON.stringify(data)
    );

    this.headers = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.getToken()}`
      ),
    };

    return this.api
      .post('Pago/pagoefectivo/generarcip', { data: payload }, this.headers)
      .pipe(map((response) => response));
  }

  generarSessionToken(idProcess, amount, canal, puntoventa, flujo, tipoDocumento, numeroDocumento, codigoComercio) {
    const payload = this.utilityService.encodeObjectToBase64(
      JSON.stringify({
        Amount: amount,
        IdProcess: idProcess,
        Canal: canal,
        PuntoVenta: puntoventa,
        Flujo: flujo,
        Ramo: 999,
        TipoDocumento: tipoDocumento,
        NumeroDocumento: numeroDocumento,
        codigoComercio
      })
    );

    this.headers = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.getToken()}`
      ),
    };

    return this.api.post(
      'Pago/GenerateVisaSecurityToken',
      { data: payload },
      this.headers
    );
  }

  getVisaPayment(data) {
    const payload = this.utilityService.encodeObjectToBase64(data);

    this.headers = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.getToken()}`
      ),
    };

    return this.api
      .post('Ecommerce/emision', { data: payload }, this.headers)
      .pipe(map((response) => response));
  }

  getToken() {
    let token = '';
    if (!isNullOrUndefined(JSON.parse(localStorage.getItem('currentUser')))) {
      token = JSON.parse(localStorage.getItem('currentUser'))['token'];
    }

    return token;
  }
}
