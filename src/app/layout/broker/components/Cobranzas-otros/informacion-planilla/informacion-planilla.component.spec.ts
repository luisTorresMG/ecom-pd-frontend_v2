import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionPlanillaComponent } from './informacion-planilla.component';

describe('InformacionPlanillaComponent', () => {
  let component: InformacionPlanillaComponent;
  let fixture: ComponentFixture<InformacionPlanillaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformacionPlanillaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
