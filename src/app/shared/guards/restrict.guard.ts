import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RestrictGuard implements CanActivate {
  constructor(private readonly _router: Router) {
  }

  canActivate(): boolean {
    const authorizedChannels = [2018000011, 2018000038];
    const channelCurrentUser = +JSON.parse(
      localStorage.getItem('currentUser') || '{}'
    )?.canal;

    if (!authorizedChannels.includes(channelCurrentUser) || !channelCurrentUser) {
      this._router.navigate(['/extranet/welcome']);
    }
    return true;
  }
}
