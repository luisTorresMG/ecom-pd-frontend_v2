import { TestBed } from '@angular/core/testing';

import { PreQuotationService } from './pre-quotation.service';

describe('PreQuotationService', () => {
  let service: PreQuotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreQuotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
