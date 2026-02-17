import { TestBed } from '@angular/core/testing';

import { KushkiService } from './kushki.service';

describe('KushkiService', () => {
  let service: KushkiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KushkiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
