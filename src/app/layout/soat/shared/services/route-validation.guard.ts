import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router,
} from '@angular/router';
import SoatUser from '../models/soat-user';

@Injectable({
  providedIn: 'root',
})
export class RouteValidationGuard implements CanActivate {
  resume: string;

  constructor(private readonly router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('route');

    const [url] = route.url;

    const soatUser = JSON.parse(sessionStorage.getItem('soat-user'));
    const step = JSON.parse(sessionStorage.getItem('step2-3'));
    const selling = JSON.parse(sessionStorage.getItem('selling'));
    this.resume = sessionStorage.getItem('resume');

    if (!soatUser || !selling) {
      this.redirectToStep1();
      return false;
    }

    switch (url.path) {
      case 'step2':
      case 'renovation/visa':
        return this.validate(soatUser._license);
      case 'step3':
        return this.validate(soatUser._modelDesc);
      case 'step4':
        return this.validate(soatUser._documentNumber, true);
      case 'step2-3':
        return this.validate(step);
      default:
        return true;
    }
  }

  redirectToStep1() {
    console.log('redirect');
    this.router.navigate(['/soat/step1'], {
      preserveQueryParams: true
    });
  }

  validate(val: string, skip = false): boolean {

    console.log('redirect validate');
    if (!val) {
      this.redirectToStep1();
    }

    if (this.resume === '1' && !skip) {
      sessionStorage.clear();
      this.router.navigate(['/soat/step1'], {
        preserveQueryParams: true
      });
    }

    return !!val;
  }
}
