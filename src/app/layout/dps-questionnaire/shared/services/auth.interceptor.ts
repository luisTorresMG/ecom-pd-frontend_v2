import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UtilsService } from '../../../../shared/services/utils/utils.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly _http: HttpClient,
    private readonly _utilsService: UtilsService
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = sessionStorage.getItem('authToken');
    const newRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
      body: request.body
    });
    return next.handle(newRequest).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this._utilsService.getTerms().subscribe(
              () => {
                location.reload();
              }
            );
          }
        }
        return throwError(err);
      })
    );
  }
}
