import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationMigrateComponent } from 'app/layout/backoffice/components/desgravamen/configuration/phases/structure-configuration-migrate/structure-configuration-migrate.component';

describe('StructureConfigurationMigrateComponent', () => {
  let component: StructureConfigurationMigrateComponent;
  let fixture: ComponentFixture<StructureConfigurationMigrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationMigrateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationMigrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
