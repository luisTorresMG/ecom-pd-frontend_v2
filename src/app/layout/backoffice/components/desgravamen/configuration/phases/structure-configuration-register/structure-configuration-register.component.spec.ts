import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationRegisterComponent } from 'app/layout/backoffice/components/desgravamen/configuration/phases/structure-configuration-register/structure-configuration-register.component';

describe('StructureConfigurationRegisterComponent', () => {
  let component: StructureConfigurationRegisterComponent;
  let fixture: ComponentFixture<StructureConfigurationRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
