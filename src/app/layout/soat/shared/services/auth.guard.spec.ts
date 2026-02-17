import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { TokenService } from './token.service';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  const tokenService = {
    getToken: () => of({ token: true })
  };

  let mockGuard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, { provide: TokenService, useValue: tokenService }]
    });

    mockGuard = TestBed.get(AuthGuard);
  });

  it('should be defined', () => {
    expect(mockGuard).toBeDefined();
  });

  it('should validate component', () => {
    const response = mockGuard.canActivate();

    response.subscribe(res => {
      expect(res).toBeTruthy();
    });
  });
});
