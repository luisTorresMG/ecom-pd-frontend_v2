import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AppConfig } from '@root/app.config';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly _router: Router) {

  }
  canActivate(next: ActivatedRouteSnapshot): boolean {
    // *OBTENER NÚMERO DE STEP BASE 64
    const nstepEncode = sessionStorage.getItem(AppConfig.VIDADEVOLUCION_NSTEP);
    if (!!nstepEncode) {
      // *DECODIFICAR NÚMERO STEP
      const nstepDecode = atob(nstepEncode);
      if (next.data.nstep <= Number(nstepDecode)) {
        return true;
      } else {
        this._router.navigate(['/vidadevolucion/step' + Number(nstepDecode)]);
      }
    }
    return true;
  }
}
