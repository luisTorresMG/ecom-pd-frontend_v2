import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

import { ScreenSplashService } from '@screen-splash';
import { UtilsService } from '@shared/services/utils/utils.service';
import { AppConfig } from '@root/app.config';


@Injectable({
  providedIn: 'root',
  deps: [HttpClient]
})
export class DpsVidagrupoResolverService implements Resolve<any> {

  private readonly pdApiUrl: string = AppConfig.PD_API;

  constructor(
    private readonly http: HttpClient,
    private readonly screenSplash: ScreenSplashService,
    private readonly utilsService: UtilsService
  ) {
  }

  resolve(): Observable<any> {
    this.screenSplash.show('Validando token...');
    const token: string = location.pathname.split('/vidagrupo/dps/')[1];
    const url: string = `${this.pdApiUrl}/dps/${token}`;

    return this.utilsService.getTerms().pipe(
      switchMap(() => this.http.get(url)
        .pipe(map((response: any) => {
          this.screenSplash.hide();
          return response;
        })))
    );
  }
}
