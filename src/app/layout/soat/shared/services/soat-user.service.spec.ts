import { TestBed } from '@angular/core/testing';

import { SoatUserService } from './soat-user.service';

describe('SoatUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SoatUserService = TestBed.get(SoatUserService);
    expect(service).toBeTruthy();
  });
});
