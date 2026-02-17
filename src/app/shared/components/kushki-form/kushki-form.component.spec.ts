import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KushkiFormComponent } from './kushki-form.component';

describe('KushkiComponent', () => {
  let component: KushkiFormComponent;
  let fixture: ComponentFixture<KushkiFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KushkiFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KushkiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
