import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MainService } from '../services/main/main.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private readonly _MainService: MainService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    let req = request;
    if (token) {
      req = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        body: request.body
      });
    }
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this._MainService.getToken().subscribe(
              (res: any) => {
                localStorage.setItem('token', res.sequence);
                location.reload();
              },
              (error: any) => {
                console.log(error);
              }
            );
          }
          return throwError(err);
        }
        return throwError(err);
      }),
      finalize(() => {
      })
    );
  }
}
