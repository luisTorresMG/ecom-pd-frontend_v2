import { TestBed } from '@angular/core/testing';

import { ValidateQuotationService } from './validate-quotation.service';

describe('ValidateQuotationService', () => {
  let service: ValidateQuotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidateQuotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
