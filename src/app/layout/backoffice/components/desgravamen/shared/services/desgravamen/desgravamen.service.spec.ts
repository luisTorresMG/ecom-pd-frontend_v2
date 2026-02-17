import { TestBed } from '@angular/core/testing';

import { DesgravamenService } from './desgravamen.service';

describe('DesgravamenService', () => {
  let service: DesgravamenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesgravamenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
