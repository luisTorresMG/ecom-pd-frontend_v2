import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PreQuotationService {

  constructor(private readonly apiService: ApiService) { }

  preCotizar(data: any) {
    return this.apiService.post('AccidentesPersonales/planes/registrar', data).pipe(
      map((response) => {
        console.log(response);
        return response;
      })
    );
  }
}
