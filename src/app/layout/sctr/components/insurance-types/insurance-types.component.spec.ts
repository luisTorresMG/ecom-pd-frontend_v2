import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceTypesComponent } from './insurance-types.component';

describe('InsuranceTypesComponent', () => {
  let component: InsuranceTypesComponent;
  let fixture: ComponentFixture<InsuranceTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
