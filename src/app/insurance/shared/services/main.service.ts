import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { UtilsService } from '@root/shared/services/utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class MainService implements Resolve<any> {

  private readonly stepStorage: string = 'e-ap.5t3p_5t0r463';

  constructor(
    private readonly api: ApiService,
    private readonly _utilsService: UtilsService
  ) { }

  resolve(): Observable<any> {
    return this._utilsService.getTerms().map((response: any) => response);
  }

  getToken(): Observable<any> {
    const url = `tool/GetTerms`;
    return this.api.get(url);
  }

  set nstep(step: number) {
    sessionStorage.setItem(this.stepStorage, btoa(step.toString()));
  }

  get nstep(): number {
    return +atob(sessionStorage.getItem(this.stepStorage)) || 0;
  }
}
