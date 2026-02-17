import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { ConfigService } from '../../../../shared/services/general/config.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  constructor(
    private readonly api: ApiService,
    private readonly configService: ConfigService
  ) {}

  coupon(payload) {
    return this.api
      .post('emissionproc/emissionprocesscompletepolicy', payload)
      .pipe(map(response => response));
  }
}
