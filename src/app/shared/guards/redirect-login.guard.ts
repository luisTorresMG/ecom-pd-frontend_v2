import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RedirectLoginGuard implements CanActivate {
  constructor(private readonly router: Router) {
  }

  canActivate(): boolean {
    const path = window.location.pathname.split('/').pop();
    const path_transac = window.location.pathname.split('/');
    const exludePaths = ['login', 'renew-password', 'transact-access-desgravamen'];
    const isLoginEPS: boolean = location.pathname.includes('login-eps');

    if (isLoginEPS || exludePaths.includes(path) || !path || exludePaths.includes(path_transac[3])) {
      return true;
    }

    const session = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (Object.keys(session).length) {
      return true;
    }

    this.router.navigate(['/extranet/login']);
    return false;
  }
}
