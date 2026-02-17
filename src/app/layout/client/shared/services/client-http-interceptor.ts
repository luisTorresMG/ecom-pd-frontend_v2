import { AuthenticationService } from './../../../broker/services/authentication.service';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError, from as fromPromise, Observable } from 'rxjs';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { tap, catchError, finalize } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { TokenService } from '../../../soat/shared/services/token.service';
import { Router } from '@angular/router';

@Injectable()
export class ClientHttpInterceptor implements HttpInterceptor {
  constructor(private utilityService: UtilityService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let newBody = request.body;

    if (
      !newBody?.noBase64 &&
      request.method.toLowerCase() === 'post' &&
      !(newBody instanceof FormData)
    ) {
      newBody = { data: this.utilityService.encodeObjectToBase64(newBody) };
    }

    let token = '';
    if (!isNullOrUndefined(JSON.parse(localStorage.getItem('currentUser')))) {
      token = JSON.parse(localStorage.getItem('currentUser'))['token'];
    }
    const newRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
      body: newBody,
    });
    return next.handle(newRequest).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            const urlF = window.location.pathname;
            if (urlF.toLowerCase().indexOf('vidaley') > -1) {
              this.router.navigate(['vidaley/step-1']);
            }
            if (urlF.toLowerCase().indexOf('soat') > -1) {
              this.router.navigate(['soat/step1'], {
                preserveQueryParams: true,
              });
            }
            if (urlF.toLowerCase().indexOf('desgravamen') > -1) {
              this.router.navigate(['desgravamen/step1']);
            }
          }
          return throwError(err);
        }
        return throwError(err);
      }),
      finalize(() => {})
    );
  }
}
