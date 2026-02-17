import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { UtilsService } from '@shared/services/utils/utils.service';
import { AppConfig } from '@root/app.config';
import { IStorage, ITokenInfo } from '../interfaces/dps-vidagrupo.interface';

@Injectable({
  providedIn: 'root'
})
export class DpsVidagrupoService {
  private readonly pdApiUrl: string = AppConfig.PD_API;
  private readonly secretKey: string = 'q5w6e1:qwe5641a0.56';

  constructor(
    private readonly utilsService: UtilsService,
    private readonly http: HttpClient
  ) {
  }

  get storage(): IStorage {
    const storage = this.utilsService.decryptStorage(this.secretKey);

    return storage ?? {};
  }

  set storage(data: IStorage) {
    const currentStorage = {
      ...this.storage,
      ...data
    };
    this.utilsService.encryptStorage({
      name: this.secretKey,
      data: currentStorage
    });
  }

  saveDps(payload: {
    id: number,
    jsondps: string,
    numeroDocumento: string
  }): Observable<{ success: boolean, message: string }> {
    const url: string = `${this.pdApiUrl}/dps`;
    return this.http.post(url, payload).pipe(map((response: any) => response));
  }

  getStatus(token: string): Observable<ITokenInfo> {
    const url: string = `${this.pdApiUrl}/dps/status/${token}`;
    return this.http.get(url).pipe(map((response: any) => response));
  }

  updateState(payload: { id: number, success: boolean }): Observable<HttpResponse<any>> {
    const url: string = `${this.pdApiUrl}/dps/actualizar`;
    return this.http.post(url, payload, { observe: 'response' }).pipe(map((response: any) => response));
  }
}
