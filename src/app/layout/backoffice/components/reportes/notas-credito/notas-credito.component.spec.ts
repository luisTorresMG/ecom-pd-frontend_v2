import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasCreditoComponent } from './notas-credito.component';

describe('ProduccionComponent', () => {
  let component: NotasCreditoComponent;
  let fixture: ComponentFixture<NotasCreditoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotasCreditoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotasCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
