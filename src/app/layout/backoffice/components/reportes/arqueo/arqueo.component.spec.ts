import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArqueoComponent } from './arqueo.component';

describe('ArqueoComponent', () => {
  let component: ArqueoComponent;
  let fixture: ComponentFixture<ArqueoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArqueoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArqueoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
