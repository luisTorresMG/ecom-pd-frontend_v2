import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureConfigurationNotificationsComponent } from './structure-configuration-notifications.component';

describe('StructureConfigurationNotificationsComponent', () => {
  let component: StructureConfigurationNotificationsComponent;
  let fixture: ComponentFixture<StructureConfigurationNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureConfigurationNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureConfigurationNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
