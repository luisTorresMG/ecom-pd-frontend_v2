import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationValidateComponent } from 'app/layout/backoffice/components/desgravamen/configuration/phases/structure-configuration-validate/structure-configuration-validate.component';

describe('StructureConfigurationValidateComponent', () => {
  let component: StructureConfigurationValidateComponent;
  let fixture: ComponentFixture<StructureConfigurationValidateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationValidateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
