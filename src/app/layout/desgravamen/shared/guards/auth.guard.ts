import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AppConfig } from '@root/app.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _router: Router
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot): boolean {
    // *OBTENER NÚMERO DE STEP BASE 64
    const nstepEncode = sessionStorage.getItem(AppConfig.DESGRAVAMEN_NSTEP);
    if (!!nstepEncode) {
      // *DECODIFICAR NÚMERO STEP
      const nstepDecode = atob(nstepEncode);
      if (next.data.nstep <= Number(nstepDecode)) {
        return true;
      } else {
        this._router.navigate(['/desgravamen/step' + Number(nstepDecode)]);
      }
    }
    return true;
  }
}
