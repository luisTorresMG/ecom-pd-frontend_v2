import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLoadComponent } from 'app/layout/backoffice/components/desgravamen/bulk-load/bulk-load.component';

describe('BulkLoadComponent', () => {
  let component: BulkLoadComponent;
  let fixture: ComponentFixture<BulkLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
