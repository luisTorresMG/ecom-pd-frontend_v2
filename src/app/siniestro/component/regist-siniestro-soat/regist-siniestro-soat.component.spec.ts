import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistSiniestroSoatComponent } from './regist-siniestro-soat.component';

describe('RegistSiniestroSoatComponent', () => {
  let component: RegistSiniestroSoatComponent;
  let fixture: ComponentFixture<RegistSiniestroSoatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistSiniestroSoatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistSiniestroSoatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
