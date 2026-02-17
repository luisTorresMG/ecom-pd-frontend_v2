import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndososComponent } from './endosos.component';

describe('EndososComponent', () => {
  let component: EndososComponent;
  let fixture: ComponentFixture<EndososComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndososComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndososComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
