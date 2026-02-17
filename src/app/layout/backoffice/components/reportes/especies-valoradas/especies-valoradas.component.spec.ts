import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EspeciesValoradasComponent } from './especies-valoradas.component';

describe('EspeciesValoradasComponent', () => {
  let component: EspeciesValoradasComponent;
  let fixture: ComponentFixture<EspeciesValoradasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EspeciesValoradasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EspeciesValoradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
