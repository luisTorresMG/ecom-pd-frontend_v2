import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { InsuranceTypesService } from '../services/insurance-types.service';
import { MainService } from '../services/main.service';

@Injectable()
export class ProductSelectedResolver implements Resolve<any> {
  constructor(
    private readonly router: Router,
    private readonly insuranceTypesService: InsuranceTypesService,
    private readonly mainService: MainService
  ) {
    sessionStorage.clear();
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const session: string = sessionStorage.getItem('productIdPolicy');

    if (session) {
      return of({});
    }

    return this.insuranceTypesService
      .getProducts(
        route.params['insuranceCategory'] == 'personales' ? '1' : '2'
      )
      .pipe(
        tap((response) => {
          const selectedProductInfo = response.items?.find(
            (c) => c.key === route.params['insuranceType']
          );

          if (!selectedProductInfo) {
            this.router.navigate(['/accidentespersonales']);
          }

          sessionStorage.setItem(
            'productSelected',
            JSON.stringify(response.items)
          );

          sessionStorage.setItem(
            'productIdPolicy',
            JSON.stringify(Number(selectedProductInfo.productId))
          );
          sessionStorage.setItem(
            '_producto_selecionado',
            JSON.stringify(selectedProductInfo)
          );
          if (Number(selectedProductInfo?.modeCode) === 2) {
            sessionStorage.setItem('modalidad', 'true');
          } else {
            sessionStorage.setItem('modalidad', 'false');
          }

          this.mainService.nstep = 1;
        })
      );
  }
}
