import { TestBed } from '@angular/core/testing';

import { EmailConfigurationService } from './email-configuration.service';

describe('EmailConfigurationService', () => {
  let service: EmailConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
