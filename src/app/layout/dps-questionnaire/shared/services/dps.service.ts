import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BiometricRequest } from '../../../../shared/models/biometric/biometric.model';
import { AppConfig } from '@root/app.config';
import { Resolve } from '@angular/router';

interface UploadResponse {
  id: string;
  mensaje: any;
  result: boolean;
  documento: string;
}

interface ValidateResponse {
  coincidencia: boolean;
  documentId: string;
  expirationDate: string;
  result: boolean;
  status: boolean;
}

interface BiometricValidateRequest {
  idProcess: string;
  idBigPrime: string;
  idRamo: number;
  documento: string;
  idProducto: number;
}

@Injectable({
  providedIn: 'root',
})
export class DpsService implements Resolve<any> {
  baseUrl = AppConfig.PD_API;

  constructor(private readonly http: HttpClient) {}

  get storage(): any {
    if (!sessionStorage.getItem('dp5_5t0r4g3-PS')) {
      return;
    }
    return JSON.parse(atob(sessionStorage.getItem('dp5_5t0r4g3-PS')));
  }

  set storage(values: any) {
    sessionStorage.setItem(
      'dp5_5t0r4g3-PS',
      btoa(
        JSON.stringify({
          ...this.storage,
          ...values,
        })
      )
    );
  }

  resolve(): Observable<{ token: string }> {
    let token = '';
    return this.http.get(`${this.baseUrl}/Dps/auth`).pipe(
      map((response: any) => {
        const res = response as { token: string };
        token = response.token;
        return res;
      }),
      finalize(() => sessionStorage.setItem('authToken', token))
    );
  }

  validateToken(token: string): Observable<{ id: number; success: boolean }> {
    return this.http
      .get(`${this.baseUrl}/Dps/${token}`)
      .pipe(map((response) => response as { id: number; success: boolean }));
  }

  register(payload: {
    id: number;
    jsondps: string;
  }): Observable<{ success: boolean }> {
    return this.http.post(`${this.baseUrl}/Dps`, payload)
      .pipe(map((response) => response as { success: boolean }));
  }

  upload(data: BiometricRequest): Observable<UploadResponse> {
    const formData: FormData = new FormData();
    formData.append('data', JSON.stringify(data.data));
    formData.append('fileattach', data.file);

    return this.http
      .post(`${this.baseUrl}/Dps/biometrico/registrar`, formData)
      .pipe(
        map(
          (response: UploadResponse) =>
            ({
              ...response,
              mensaje: JSON.parse(response?.mensaje || '{}'),
            } as UploadResponse)
        )
      );
  }

  validate(data: BiometricValidateRequest): Observable<ValidateResponse> {
    return this.http
      .post(`${this.baseUrl}/Dps/biometrico/consultar`, data)
      .pipe(
        map(
          (response: { success: ValidateResponse }) =>
            response.success as ValidateResponse
        )
      );
  }

  success(payload: { id: number; success: boolean }) {
    return this.http.post(`${this.baseUrl}/Dps/actualizar`, payload);
  }

  notification(payload: any): Observable<any> {
    /*  LinkVencidoDPS
     EnvioLinkDPS */
    return this.http.post(`${this.baseUrl}/dps/notification`, payload);
  }
}
