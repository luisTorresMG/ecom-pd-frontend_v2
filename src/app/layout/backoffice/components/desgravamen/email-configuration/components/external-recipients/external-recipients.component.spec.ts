import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRecipientsComponent } from './external-recipients.component';

describe('ExternalRecipientsComponent', () => {
  let component: ExternalRecipientsComponent;
  let fixture: ComponentFixture<ExternalRecipientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalRecipientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalRecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
