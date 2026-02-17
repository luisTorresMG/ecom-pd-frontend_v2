import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteComponent } from './lote.component';

describe('LoteComponent', () => {
  let component: LoteComponent;
  let fixture: ComponentFixture<LoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
