import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceComparisonComponent } from './insurance-comparison.component';

describe('InsuranceComparisonComponent', () => {
  let component: InsuranceComparisonComponent;
  let fixture: ComponentFixture<InsuranceComparisonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceComparisonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
