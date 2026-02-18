import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickInsuranceComponent } from './pick-insurance.component';

fdescribe('PickInsuranceComponent', () => {
  let component: PickInsuranceComponent;
  let fixture: ComponentFixture<PickInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PickInsuranceComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show categories', () => {
    expect(component.categories.length).toEqual(4);
  });

  it('should show subcategories when category is selected', () => {
    component.onCategoryClick('personal');
    expect(component.subcategories.length).toBeGreaterThan(0);
  });

  it('should check/uncheck subcategory description', () => {
    component.onSubcategoryCheck('viajes-empresas');
    expect(component.subcategorySelected.selected).toBeFalsy();

    component.onSubcategoryCheck('viajes-empresas');
    expect(component.subcategorySelected.selected).toBeTruthy();
  });
});
