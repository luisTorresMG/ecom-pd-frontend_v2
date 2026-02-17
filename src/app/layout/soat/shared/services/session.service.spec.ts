import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';
import { ActivatedRoute } from '@angular/router';
import { VehiculoService } from '../../../client/shared/services/vehiculo.service';
import { of } from 'rxjs';

describe('SessionService', () => {
  let service: SessionService;

  const activatedRoute = {
    queryParams: of({ code: 'Test' })
  };

  const carService = {
    obtenerCodigoCanal: () => of({ scodchannel: 'Test', scodsalepoint: 'Test' })
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: VehiculoService,
          useValue: carService
        }
      ]
    })
  );

  beforeEach(() => {
    service = TestBed.get(SessionService);

    spyOn(sessionStorage, 'getItem').and.returnValue('{}');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get correct values from session storage', () => {
    service.getSellingPoint();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('selling');

    service.getSoatUser();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('soat-user');

    service.getRef();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('referenceChannel');

    service.getRate();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('rate');

    service.getCampaign();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('campaign');

    service.getCertificate();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('certificate');

    service.getClientBill();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('contractor');

    service.getVisa();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('visa');

    service.getTerms();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('terms');

    service.getStepPayload();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('step2-3');
  });

  it('should save values in session storage', () => {
    spyOn(sessionStorage, 'setItem');

    service.saveToLocalStorage('test', { test: 'test' });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'test',
      JSON.stringify({ test: 'test' })
    );
  });

  it('should get channel code when setSellingPoint is called', () => {
    spyOn(service, 'saveToLocalStorage');
    const response = service.setSellingPoint('Test');

    response.subscribe(selling => {
      expect(selling.sellingChannel).toEqual('Test');
      expect(selling.sellingPoint).toEqual('Test');
      expect(service.saveToLocalStorage).toHaveBeenCalled();
    });
  });

  it('should get selling info when renewSellingPoint is called', () => {
    spyOn(service, 'setSellingPoint').and.callThrough();
    const response = service.renewSellingPoint();

    response.subscribe(selling => {
      expect(selling.sellingChannel).toEqual('Test');
      expect(selling.sellingPoint).toEqual('Test');
      expect(service.setSellingPoint).toHaveBeenCalledWith('Test');
    });
  });
});
