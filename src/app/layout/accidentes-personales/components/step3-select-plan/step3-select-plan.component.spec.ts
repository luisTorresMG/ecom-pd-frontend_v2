import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3SelectPlanComponent } from './step3-select-plan.component';

describe('Step3SelectPlanComponent', () => {
  let component: Step3SelectPlanComponent;
  let fixture: ComponentFixture<Step3SelectPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Step3SelectPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Step3SelectPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
