import { TestBed } from '@angular/core/testing';

import { InsuranceTypesService } from './insurance-types.service';

fdescribe('InsuranceTypesService', () => {
  let service: InsuranceTypesService;
  beforeEach(() => TestBed.configureTestingModule({}));

  beforeEach(() => {
    service = TestBed.get(InsuranceTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get categories', () => {
    service.getCategories().subscribe(function (response) {
      expect(response.length).toBeGreaterThan(0);
    });
  });

  it('should get subcategories by category id', () => {});
});
