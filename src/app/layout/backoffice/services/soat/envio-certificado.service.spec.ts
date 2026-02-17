import { TestBed } from '@angular/core/testing';

import { EnvioCertificadoService } from './envio-certificado.service';

describe('EnvioCertificadoService', () => {
  let service: EnvioCertificadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvioCertificadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
