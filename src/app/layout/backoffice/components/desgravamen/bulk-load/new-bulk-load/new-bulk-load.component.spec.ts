import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBulkLoadComponent } from 'app/layout/backoffice/components/desgravamen/bulk-load/new-bulk-load/new-bulk-load.component';

describe('NewBulkLoadComponent', () => {
  let component: NewBulkLoadComponent;
  let fixture: ComponentFixture<NewBulkLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBulkLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBulkLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
