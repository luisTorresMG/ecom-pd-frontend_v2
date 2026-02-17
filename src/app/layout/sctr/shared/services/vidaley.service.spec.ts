import { TestBed } from '@angular/core/testing';

import { VidaleyService } from './vidaley.service';

describe('VidaleyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VidaleyService = TestBed.get(VidaleyService);
    expect(service).toBeTruthy();
  });
});
