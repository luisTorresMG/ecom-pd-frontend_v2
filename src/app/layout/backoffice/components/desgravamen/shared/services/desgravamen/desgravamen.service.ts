import {Injectable} from '@angular/core';
import {UtilsService} from '@shared/services/utils/utils.service';

@Injectable({
  providedIn: 'root',
  deps: [UtilsService]
})
export class DesgravamenService {
  readonly SESSION_STORAGE_KEY = 'pd:x35xy4x4x3x.storage';

  constructor(
    private readonly utilsService: UtilsService,
  ) {
  }

  get storage(): any {
    return this.utilsService.decryptStorage(this.SESSION_STORAGE_KEY);
  }

  set storage(values: any) {
    const payload = {
      ...this.storage,
      ...values,
    };

    this.utilsService.encryptStorage({
      name: this.SESSION_STORAGE_KEY,
      data: payload,
    });
  }
}
