import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationBillingComponent } from './structure-configuration-billing.component';

describe('StructureConfigurationBillingComponent', () => {
  let component: StructureConfigurationBillingComponent;
  let fixture: ComponentFixture<StructureConfigurationBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
