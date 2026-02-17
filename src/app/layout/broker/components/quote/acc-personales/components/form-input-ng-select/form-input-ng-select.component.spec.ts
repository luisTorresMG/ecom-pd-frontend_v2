import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputNgSelectComponent } from './form-input-ng-select.component';

describe('FormInputNgSelectComponent', () => {
  let component: FormInputNgSelectComponent;
  let fixture: ComponentFixture<FormInputNgSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputNgSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
