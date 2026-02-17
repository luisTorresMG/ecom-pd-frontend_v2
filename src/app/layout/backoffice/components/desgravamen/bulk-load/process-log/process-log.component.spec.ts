import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessLogComponent } from 'app/layout/backoffice/components/desgravamen/bulk-load/process-log/process-log.component';

describe('ProcessLogComponent', () => {
  let component: ProcessLogComponent;
  let fixture: ComponentFixture<ProcessLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
