import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import {
  IRegisterOtp,
  IRegisterOtpResponse,
  IValidateOtp,
  IValidateOtpResponse,
} from '@shared/interfaces/otp-auth.interface';

@Injectable({
  providedIn: 'root',
})
export class OtpAuthService {
  private urlApi: string;

  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.PD_API;
  }

  get storage(): IValidateOtpResponse | any {
    if (sessionStorage.getItem(AppConfig.OTPAUTH_STORAGE)) {
      return JSON.parse(
        atob(sessionStorage.getItem(AppConfig.OTPAUTH_STORAGE)) || '{}'
      );
    } else {
      return {};
    }
  }

  set storage(_: IValidateOtpResponse | any) {
    sessionStorage.setItem(AppConfig.OTPAUTH_STORAGE, btoa(JSON.stringify(_)));
  }

  registerOtp(payload: IRegisterOtp): Observable<IRegisterOtpResponse> {
    const req: IRegisterOtp = {
      ...payload,
      celular: payload.type == 1 ? payload.celular : null,
      correo: payload.type == 2 ? payload.correo : null,
    };
    const url = `${this.urlApi}/Ecommerce/otp/registrar`;
    return this._http
      .post(url, req)
      .map((response: any) => response);
  }

  validateOtp(payload: IValidateOtp): Observable<IValidateOtpResponse> {
    const url = `${this.urlApi}/Ecommerce/otp/validar`;
    return this._http
      .post(url, payload)
      .map((response: IValidateOtpResponse) => response);
  }
}
