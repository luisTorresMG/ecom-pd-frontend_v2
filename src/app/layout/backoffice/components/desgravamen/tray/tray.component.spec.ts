import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { TrayComponent } from './tray.component';
import { TrayService } from '../shared/services/tray/tray.service';

describe('TrayComponent', () => {
  let app: TrayComponent;
  let fixture: ComponentFixture<TrayComponent>;

  let httpMock: HttpTestingController;
  let trayService: TrayService;

  const structureIdSelected = 'STR-42';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TrayComponent],
      providers: [TrayService],
    }).compileComponents();

    trayService = TestBed.inject(TrayService);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrayComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('Desgravamen grupal (Bandeja de estructuras) - should create', () => {
    expect(app).toBeTruthy();
  });

  it('#GetStructures', (done: DoneFn) => {
    trayService.getAll().subscribe((response: Array<any>) => {
      expect(Array.isArray(response)).toBeTruthy();
      done();
    });
  });

  it('#FindStructure', (done: DoneFn) => {
    trayService.getDetail(structureIdSelected).subscribe((response: any) => {
      expect(response.success).toBeTruthy();
      done();
    });
  });

  it('#DisableStructure', (done: DoneFn) => {
    trayService
      .disable({ idEstructura: structureIdSelected, activo: false })
      .subscribe((response: any) => {
        expect(response.success).toBeTruthy();
        done();
      });
  });

  it('#DeleteStructure', (done: DoneFn) => {
    trayService.delete(structureIdSelected).subscribe((response: any) => {
      expect(response.success).toBeTruthy();
      done();
    });
  });
});
