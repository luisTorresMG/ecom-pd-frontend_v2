import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { VehiculoService } from '../../../client/shared/services/vehiculo.service';
import { of } from 'rxjs';

describe('TokenService', () => {
  const carService = {
    LeerArchivo: () => of({ sequence: 'TEST' })
  };

  let service: TokenService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        TokenService,
        {
          provide: VehiculoService,
          useValue: carService
        }
      ]
    })
  );

  beforeEach(() => {
    service = TestBed.get(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return token when getToken is called', () => {
    let response = service.getToken();
    response.subscribe(res => expect(res.token).toEqual('TEST'));

    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 1);

    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ token: 'TEST', expDate: expDate.getTime() })
    );

    response = service.getToken();
    response.subscribe(res => {
      expect(res.token).toEqual('TEST');
      expect(res.expDate).toEqual(expDate.getTime());
      expect(localStorage.getItem).toHaveBeenCalledWith('currentUser');
    });
  });
});
