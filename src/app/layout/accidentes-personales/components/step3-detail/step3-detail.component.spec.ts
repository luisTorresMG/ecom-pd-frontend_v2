import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3DetailComponent } from './step3-detail.component';

describe('Step3DetailComponent', () => {
  let component: Step3DetailComponent;
  let fixture: ComponentFixture<Step3DetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Step3DetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Step3DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
