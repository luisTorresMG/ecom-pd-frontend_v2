import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargosComponent } from './descargos.component';

describe('DescargosComponent', () => {
  let component: DescargosComponent;
  let fixture: ComponentFixture<DescargosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescargosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
