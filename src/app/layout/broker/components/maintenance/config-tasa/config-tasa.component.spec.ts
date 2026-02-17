import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigTasaComponent } from './config-tasa.component';

describe('ConfigTasaComponent', () => {
  let component: ConfigTasaComponent;
  let fixture: ComponentFixture<ConfigTasaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigTasaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigTasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
