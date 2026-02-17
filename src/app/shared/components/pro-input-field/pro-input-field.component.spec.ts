import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProInputFieldComponent } from './pro-input-field.component';

describe('ProInputFieldComponent', () => {
  let component: ProInputFieldComponent;
  let fixture: ComponentFixture<ProInputFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProInputFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
