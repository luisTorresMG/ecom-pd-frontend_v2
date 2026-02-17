import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanalPuntoVentaComponent } from './canal-puntoventa.component';

describe('CanalPuntoVentaComponent', () => {
  let component: CanalPuntoVentaComponent;
  let fixture: ComponentFixture<CanalPuntoVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanalPuntoVentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanalPuntoVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
