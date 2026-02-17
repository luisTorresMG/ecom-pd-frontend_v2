import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../general/config.service';
import { DocumentRequest, DocumentResponse } from '../../models/document/document.models';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  _baseUrl = '';

  constructor(
    private readonly _http: HttpClient,
    private readonly _configService: ConfigService
  ) {
    this._baseUrl = this._configService.getWebApiURL();
  }
  dataOfDocument(data: DocumentRequest): Observable<DocumentResponse> {
    const url = `${this._baseUrl}/Emission/cliente/${data.type}/${data.documentNumber}`;
    const call: Observable<any> = this._http.get(url);
    const data$: Observable<DocumentResponse> = new Observable(obs => {
      call.subscribe(
        (res: DocumentResponse[]) => {
          obs.next(res[0]);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }
}
