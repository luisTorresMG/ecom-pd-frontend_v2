import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { TokenService } from './token.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { UtilsService } from '@shared/services/utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly utilsService: UtilsService
  ) {}

  canActivate(): Observable<boolean> | boolean {
    return this.utilsService
      .getTokeneEcommerce()
      .pipe(map((response: any) => !!response.token));
  }
}
