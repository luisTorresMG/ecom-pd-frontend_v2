import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {AppConfig} from '@root/app.config';
import {
  ICreateRecipientResponse,
  IDeleteRecipientRequest, IDeleteRecipientResponse,
  IGetRecipientsResponse, IRecipient, ISalesChannelsAndContractorsResponse, IUpdateRecipientResponse
} from '../../interfaces/email-configuration.interface';

@Injectable({
  providedIn: 'root'
})
export class EmailConfigurationService {

  apiUrl: string = AppConfig.WSPD_API;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getRecipients(): Observable<IGetRecipientsResponse> {
    const url: string = `${this.apiUrl}/sia/correo/listado`;
    return this.http.get(url).pipe(map((response: any) => response.data as IGetRecipientsResponse));
  }

  getSalesChannelsAndContractors(): Observable<ISalesChannelsAndContractorsResponse> {
    const url: string = `${this.apiUrl}/sia/canalVenta/contratante/listado`;
    return this.http.get(url).pipe(map((response: any) => response.data as ISalesChannelsAndContractorsResponse));
  }

  createRecipient(payload: IRecipient): Observable<ICreateRecipientResponse> {
    const url: string = `${this.apiUrl}/sia/correo/crear`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data as ICreateRecipientResponse));
  }

  updateRecipient(payload: IRecipient): Observable<IUpdateRecipientResponse> {
    const url: string = `${this.apiUrl}/sia/correo/actualizar`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data as IUpdateRecipientResponse));
  }

  deleteRecipient(payload: IDeleteRecipientRequest): Observable<IDeleteRecipientResponse> {
    const url: string = `${this.apiUrl}/sia/correo/eliminar`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data as IDeleteRecipientResponse));
  }
}
