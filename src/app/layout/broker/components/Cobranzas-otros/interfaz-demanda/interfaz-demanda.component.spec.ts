import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfazDemandaComponent } from './interfaz-demanda.component';

describe('InterfazDemandaComponent', () => {
  let component: InterfazDemandaComponent;
  let fixture: ComponentFixture<InterfazDemandaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterfazDemandaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfazDemandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
