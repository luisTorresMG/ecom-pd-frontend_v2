import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../shared/services/api.service';
import { ProductResponse } from '../models/product-response';
import { CategoryResponse } from '../models/category.model';
import { AppConfig } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class InsuranceTypesService {
  private urlApiPd: string = AppConfig.PD_API;

  constructor(
    private readonly apiService: ApiService,
    private readonly http: HttpClient
  ) {}

  public getProducts(categoryId: string): Observable<any> {
    return this.apiService
      .get(`AccidentesPersonales/productos/${categoryId}`)
      .pipe(
        map((response: any) => ({
          success: response.success,
          items: response?.producto.map((p) => new ProductResponse(p)),
        })),
        catchError(() => {
          return of({
            success: false,
            items: [],
          });
        })
      );
  }

  getCategories(): Observable<CategoryResponse> {
    const url = 'AccidentesPersonales/categorias';
    return this.apiService.get(url);
  }

  getBenefits(segment: number): Observable<any> {
    const url = `${this.urlApiPd}/ecommerce/pqp/beneficios/${segment}`;
    return this.http.get(url).pipe(map((response: any) => response));
  }
}
