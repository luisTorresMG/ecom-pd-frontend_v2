import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignadosReasignadosComponent } from './asignados-reasignados.component';

describe('AsignadosReasignadosComponent', () => {
  let component: AsignadosReasignadosComponent;
  let fixture: ComponentFixture<AsignadosReasignadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignadosReasignadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignadosReasignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
