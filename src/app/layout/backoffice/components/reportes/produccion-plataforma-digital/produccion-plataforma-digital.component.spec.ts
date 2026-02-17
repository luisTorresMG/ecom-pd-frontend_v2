import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduccionPlataformaDigitalComponent } from './produccion-plataforma-digital.component';

describe('ProduccionPlataformaDigitalComponent', () => {
  let component: ProduccionPlataformaDigitalComponent;
  let fixture: ComponentFixture<ProduccionPlataformaDigitalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProduccionPlataformaDigitalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduccionPlataformaDigitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
