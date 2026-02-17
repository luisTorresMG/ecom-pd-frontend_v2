import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router,
} from '@angular/router';
import { Vidaley } from '../models/vidaley';

@Injectable({
  providedIn: 'root',
})
export class RouteValidationGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const [url] = route.url;

    const vidaleyUser: Vidaley = JSON.parse(sessionStorage.getItem('sctr'));

    if (!vidaleyUser) {
      this.redirectToStep1();
      return false;
    }

    switch (url.path) {
      case 'step2':
        return this.validate(vidaleyUser.email);
      case 'step3':
        return this.validate(vidaleyUser.businessName);
      case 'step4':
        return this.validate(vidaleyUser.startValidity);
      case 'step5':
        return this.validate(`${vidaleyUser.amount}`);
      default:
        return true;
    }
  }

  redirectToStep1() {
    this.router.navigate(['/sctr/step-1']);
  }

  validate(val: string): boolean {
    if (!val) {
      this.redirectToStep1();
    }

    return !!val;
  }
}
