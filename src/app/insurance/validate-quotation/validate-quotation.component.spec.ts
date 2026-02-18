import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateQuotationComponent } from './validate-quotation.component';

describe('ValidateQuotationComponent', () => {
  let component: ValidateQuotationComponent;
  let fixture: ComponentFixture<ValidateQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidateQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
