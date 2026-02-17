import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { UtilsService } from '@shared/services/utils/utils.service';
import { IKushki } from '../../interfaces/kushki.interface';
import { AppConfig } from '@root/app.config';

interface ISaveInfo {
  montoCobro: number;
  codigoCanal: number;
  idUsuario: number;
  idRamo: number;
  idProducto: number;
  idMoneda: number;
  externalId: string;
  idTipoDocumento: number;
  numeroDocumento: string;
  email: string;
  idPayment: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  razonSocial: string;
  telefono: number;
}

@Injectable({
  providedIn: 'root',
  deps: [UtilsService]
})
export class KushkiService {
  private readonly kushkiStorage: string = 'eco:kushki_payment:payload';
  private readonly apiUrl: string = AppConfig.WSPD_API;
  
  constructor(
    private readonly utilsService: UtilsService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {
  }

  /**
   * It encrypts the data and stores it in the local storage.
   * @param {IKushki} data - IKushki - The data that you want to store.
   */
  private set payload(data: IKushki) {
    this.utilsService.encryptStorage({
      data,
      name: this.kushkiStorage
    });
  }

  /**
   * It returns the decrypted value of the kushkiStorage variable.
   * @returns The decrypted payload of the kushkiStorage.
   */
  private get payload(): IKushki {
    return this.utilsService.decryptStorage(this.kushkiStorage);
  }

  getPaymentInfo(): IKushki {
    return Object.keys(this.payload ?? {}).length ? this.payload : undefined;
  }

  /**
   * It opens a session with the payment gateway.
   * @returns void.
   * @param data
   */
  openSession(data: IKushki): void {
    this.payload = data;
  }

  getCredentials(payload: {
    idRamo: number;
    idProducto: number;
    idMoneda: '1' | '2';
    idCategoria: '1' | '2';
  }): Observable<any> {
    const url: string = `${this.apiUrl}/pago/kushki/credenciales`;
    return this.http
               .post(url, {...payload, noBase64: true})
               .pipe(map((response: any) => response.data));
  }

  saveInfo(payload: ISaveInfo): Observable<any> {
    const url: string = `${this.apiUrl}/pago/kushki/token`;
    return this.http
               .post(url, {...payload, noBase64: true})
               .pipe(map((response: any) => response.data));
  }

  processCashPayment(payload: {
    idProceso: number;
    token: string;
  }): Observable<any> {
    const url: string = `${this.apiUrl}/pago/coupon/kushki`;
    return this.http
               .post(url, {...payload, noBase64: true})
               .pipe(map((response: any) => response.data));
  }

  processPaymentTransfer(payload: {
    idProceso: number;
    token: string;
  }): Observable<any> {
    const url: string = `${this.apiUrl}/pago/kushki/transfer`;
    return this.http
               .post(url, {...payload, noBase64: true})
               .pipe(map((response: any) => response.data));
  }

  processEmission(payload: any): Observable<any> {
    const url = `${this.apiUrl}/soat/emision`;
    if (+sessionStorage.getItem('payment-type-emission') == 1) {
      payload.tipoPago = 1;
    }

    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  processPayKushki(payload: any): Observable<any> {
    const url = `${this.apiUrl}/planilla/pago`;
    return this.http
               .post(url, payload)
               .pipe(map((response: any) => response.data));
  }

  /**
   * It removes the session from the sessionStorage
   */
  destroySession(): void {
    sessionStorage.removeItem(this.kushkiStorage);
  }
}
