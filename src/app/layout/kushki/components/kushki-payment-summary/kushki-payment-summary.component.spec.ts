import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KushkiPaymentSummaryComponent } from './kushki-payment-summary.component';

describe('KushkiPaymentSummaryComponent', () => {
  let component: KushkiPaymentSummaryComponent;
  let fixture: ComponentFixture<KushkiPaymentSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KushkiPaymentSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KushkiPaymentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
