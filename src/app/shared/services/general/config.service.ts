import { Injectable } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Injectable()
export class ConfigService {
  _webApi: string;

  constructor() {
    this._webApi = AppConfig.PD_API;
  }

  getWebApiURL() {
    return this._webApi;
  }
}
