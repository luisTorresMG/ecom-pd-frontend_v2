import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyReportInsuredComponent } from './policy-report-insured.component';

describe('PolicyReportInsuredComponent', () => {
  let component: PolicyReportInsuredComponent;
  let fixture: ComponentFixture<PolicyReportInsuredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyReportInsuredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyReportInsuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
