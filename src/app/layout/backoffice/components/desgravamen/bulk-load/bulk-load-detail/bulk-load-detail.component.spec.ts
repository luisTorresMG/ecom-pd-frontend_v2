import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLoadDetailComponent } from 'app/layout/backoffice/components/desgravamen/bulk-load/bulk-load-detail/bulk-load-detail.component';

describe('BulkLoadDetailComponent', () => {
  let component: BulkLoadDetailComponent;
  let fixture: ComponentFixture<BulkLoadDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkLoadDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkLoadDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
