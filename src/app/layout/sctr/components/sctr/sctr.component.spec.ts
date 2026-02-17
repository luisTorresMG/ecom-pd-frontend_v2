import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SctrComponent } from './sctr.component';

describe('SctrComponent', () => {
  let component: SctrComponent;
  let fixture: ComponentFixture<SctrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SctrComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SctrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
