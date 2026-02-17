import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3ComparePlanComponent } from './step3-compare-plan.component';

describe('Step3ComparePlanComponent', () => {
  let component: Step3ComparePlanComponent;
  let fixture: ComponentFixture<Step3ComparePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Step3ComparePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Step3ComparePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
