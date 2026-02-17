import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsInfoSctrComponent } from './steps-info.component';

describe('StepsInfoSctrComponent', () => {
  let component: StepsInfoSctrComponent;
  let fixture: ComponentFixture<StepsInfoSctrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepsInfoSctrComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepsInfoSctrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
