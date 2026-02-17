import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalRecipientsComponent } from './internal-recipients.component';

describe('InternalRecipientsComponent', () => {
  let component: InternalRecipientsComponent;
  let fixture: ComponentFixture<InternalRecipientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalRecipientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalRecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
