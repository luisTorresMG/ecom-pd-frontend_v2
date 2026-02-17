import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RucFormComponent } from './ruc-form.component';

describe('RucFormComponent', () => {
  let component: RucFormComponent;
  let fixture: ComponentFixture<RucFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RucFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RucFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
