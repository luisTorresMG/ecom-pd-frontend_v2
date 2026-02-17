import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDpsEstadoComponent } from './panel-dps-estado.component';

describe('PanelDpsEstadoComponent', () => {
  let component: PanelDpsEstadoComponent;
  let fixture: ComponentFixture<PanelDpsEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDpsEstadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDpsEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
