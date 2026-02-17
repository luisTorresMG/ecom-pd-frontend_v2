import { TestBed, async, inject } from '@angular/core/testing';

import { RouteValidationGuard } from './route-validation.guard';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import SoatUser from '../models/soat-user';

describe('RouteValidationGuard', () => {
  const router = {
    navigate: () => {}
  };

  let mockRouteValidationGuard: RouteValidationGuard;
  let mockRouter: Router;

  const testSoatUser = {
    _brandId: '1',
    _modelDesc: 'Test Model',
    _typeId: '1',
    _seats: 5,
    _serialNumber: '12345678901234567',
    _soatDate: null,
    _soatExpDate: '2020-10-02T00:00:00',
    _carYear: 2019,
    _usageId: '1',
    _license: 'ASD123',
    _email: 'test@test.com',
    _terms: true,
    _documentType: '2',
    _documentNumber: '99999999',
    _phoneNumber: '999999999',
    _address: 'Av. Siempre Viva 425',
    _lastName: 'Test',
    _surname: 'Test',
    _name: 'Test',
    _province: '1',
    _district: '1',
    _legalName: 'Test',
    _departmentId: '1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouteValidationGuard, { provide: Router, useValue: router }]
    });

    mockRouteValidationGuard = TestBed.get(RouteValidationGuard);
    mockRouter = TestBed.get(Router);

    spyOn(mockRouter, 'navigate');
  });

  it('should be defined', () => {
    expect(mockRouteValidationGuard).toBeDefined();
  });

  it('should redirect to step 1 when redirectToStep1 is called', () => {
    mockRouteValidationGuard.redirectToStep1();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/soat/step1']);
  });

  it('should validate when validate is called', () => {
    spyOn(mockRouteValidationGuard, 'redirectToStep1');

    const response = mockRouteValidationGuard.validate('test');
    expect(response).toBeTruthy();

    mockRouteValidationGuard.validate(null);
    expect(mockRouteValidationGuard.redirectToStep1).toHaveBeenCalled();
  });

  it('should validate component', () => {
    let response = mockRouteValidationGuard.canActivate(
      <any>{ url: [{ path: 'step1' }] },
      null
    );

    expect(response).toBeFalsy();

    spyOn(sessionStorage, 'getItem').and.callFake((type: string) => {
      if (type === 'soat-user') {
        return JSON.stringify(testSoatUser);
      }

      return true;
    });

    response = mockRouteValidationGuard.canActivate(
      <any>{ url: [{ path: 'step2' }] },
      null
    );

    expect(response).toBeTruthy();
  });
});
