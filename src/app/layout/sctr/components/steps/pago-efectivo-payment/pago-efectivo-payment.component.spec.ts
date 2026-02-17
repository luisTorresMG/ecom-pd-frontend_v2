import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoEfectivoPaymentComponent } from './pago-efectivo-payment.component';

describe('PagoEfectivoPaymentComponent', () => {
  let component: PagoEfectivoPaymentComponent;
  let fixture: ComponentFixture<PagoEfectivoPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagoEfectivoPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoEfectivoPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
