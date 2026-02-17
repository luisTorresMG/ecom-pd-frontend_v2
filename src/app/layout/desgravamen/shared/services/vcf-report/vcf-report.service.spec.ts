import { TestBed } from '@angular/core/testing';

import { VcfReportService } from './vcf-report.service';

describe('VcfReportService', () => {
  let service: VcfReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VcfReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
