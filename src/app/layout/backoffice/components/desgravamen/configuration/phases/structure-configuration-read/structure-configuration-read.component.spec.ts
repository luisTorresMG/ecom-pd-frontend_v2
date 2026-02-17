import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationReadComponent } from 'app/layout/backoffice/components/desgravamen/configuration/phases/structure-configuration-read/structure-configuration-read.component';

describe('StructureConfigurationReadComponent', () => {
  let component: StructureConfigurationReadComponent;
  let fixture: ComponentFixture<StructureConfigurationReadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationReadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationReadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
