import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
export class ComChannelAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user.profileId != 210) {
      this.router.navigate(['/extranet/welcome']);
      return false;
    }
    return true;
  }
}
