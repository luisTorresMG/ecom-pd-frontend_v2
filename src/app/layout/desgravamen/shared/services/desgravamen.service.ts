import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from '@root/shared/services/utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class DesgravamenService implements Resolve<any> {
  apiUri: string;

  constructor(private readonly _utilService: UtilsService) {
    this.apiUri = AppConfig.PD_API;
  }

  resolve(): Observable<any> {
    return this._utilService.getTerms();
  }

  // *STORAGE
  set storage(data: any) {
    sessionStorage.setItem(
      AppConfig.DESGRAVAMEN_STORAGE,
      btoa(
        JSON.stringify({
          ...this.storage,
          ...data,
        })
      )
    );
  }
  get storage(): any {
    return this.session ? JSON.parse(atob(this.session)) : null;
  }
  private get session(): string {
    return sessionStorage.getItem(AppConfig.DESGRAVAMEN_STORAGE);
  }
  set step(nstep: number) {
    sessionStorage.setItem(AppConfig.DESGRAVAMEN_NSTEP, btoa(nstep.toString()));
  }
  get step(): number {
    return this.sessionNstep ? Number(atob(this.sessionNstep)) : null;
  }
  private get sessionNstep(): string {
    return sessionStorage.getItem(AppConfig.DESGRAVAMEN_NSTEP);
  }
}
