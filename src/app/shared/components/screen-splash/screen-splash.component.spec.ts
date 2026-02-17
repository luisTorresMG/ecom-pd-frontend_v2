import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSplashComponent } from './screen-splash.component';

describe('ScreenSplashComponent', () => {
  let component: ScreenSplashComponent;
  let fixture: ComponentFixture<ScreenSplashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenSplashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
