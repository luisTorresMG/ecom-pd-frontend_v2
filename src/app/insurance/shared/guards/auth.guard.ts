import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router} from '@angular/router';
import {MainService} from '../services/main.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _router: Router,
    private readonly _mainService: MainService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot): any {
    if (!!Object.keys(this.paymentResponse).length) {
      if ((this.paymentResponse['result'] &&
          this.paymentResponse['paied'] &&
          !this.paymentResponse['hasError']) ||
        (this.paymentResponse['result'] &&
          this.paymentResponse['paied'] &&
          this.paymentResponse['hasError'])) {
        this._router.navigate([`/accidentespersonales/payment/visa/${this.paymentResponse.tokenVisa}`]);
        return false;
      }
    }

    if (!!Object.keys(this.pagoEfectivoResponse).length) {
      this._router.navigate(['/accidentespersonales/payment/pago-efectivo']);
      return false;
    }

    const nstep: number = route.data.nstep;
    const insuranceCategory: string = route.paramMap.get('insuranceCategory') || null;
    const insuranceType: string = route.paramMap.get('insuranceType') || null;

    if (this._mainService.nstep >= nstep) {
      return true;
    }

    const includeSteps: number[] = [0, 1];

    if (includeSteps.includes(this._mainService.nstep) && insuranceCategory && insuranceType) {
      return true;
    }

    if (insuranceCategory && insuranceType) {
      const url = `/accidentespersonales/${insuranceCategory}/${insuranceType}/step-${this._mainService.nstep}`;
      this._mainService.nstep = this._mainService.nstep;
      this._router.navigate([url]);
      return false;
    }

    sessionStorage.clear();
    this._mainService.nstep = 0;
    this._router.navigate([`/accidentespersonales`]);
    return false;
  }

  get paymentResponse(): any {
    return JSON.parse(sessionStorage.getItem('visa-payment-response') || '{}');
  }

  get pagoEfectivoResponse(): any {
    return JSON.parse(sessionStorage.getItem('pago-efectivo-response') || '{}');
  }
}
