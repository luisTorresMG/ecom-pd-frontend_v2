import { TestBed } from '@angular/core/testing';

import { ScreenSplashService } from './screen-splash.service';

describe('ScreenSplashService', () => {
  let service: ScreenSplashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenSplashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
