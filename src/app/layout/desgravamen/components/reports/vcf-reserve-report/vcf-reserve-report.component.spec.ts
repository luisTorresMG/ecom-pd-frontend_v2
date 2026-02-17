import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VcfReserveReportComponent } from './vcf-reserve-report.component';

describe('VcfReserveReportComponent', () => {
  let component: VcfReserveReportComponent;
  let fixture: ComponentFixture<VcfReserveReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VcfReserveReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VcfReserveReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
