import { DigitalPlatformReportService } from '../../../services/digitalplatformreport/digitalplatformreport.service';
import { Router } from '@angular/router';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { async } from '@angular/core/testing';
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';
import { DigitalPlatformReport } from '../../../models/digitalplatformreport/digitalplatformreport';
import { BaseFilter } from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpParams } from '@angular/common/http';
import moment from 'moment';
import { UtilsService } from '@shared/services/utils/utils.service';

defineLocale('es', esLocale);
@Component({
  selector: 'app-produccion-plataforma-digital',
  templateUrl: './produccion-plataforma-digital.component.html',
  styleUrls: ['./produccion-plataforma-digital.component.css'],
})
export class ProduccionPlataformaDigitalComponent implements OnInit {
  form: FormGroup;
  messageEnvio: string;
  message: string;
  messageinfo: string;
  rotate = true;
  currentPage = 0;
  bsConfig: Partial<BsDatepickerConfig>;
  totalItems = 0;
  itemsPerPage = 10;
  maxSize = 10;
  MENSAJE: any;
  digitalPlatformReportFilter = new BaseFilter();
  npage = 1;
  startDate = '';
  endDate = '';
  fecha = new Date();
  fExistRegistro: any = false;
  bsRangeValue: Date[];
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListDigitalPlatformReport: DigitalPlatformReport[];
  ListDigitalPlatformReportExport: DigitalPlatformReport[];
  msgErrorLista = '';
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  constructor(
    private digitalPlatformReportService: DigitalPlatformReportService,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private readonly _builder: FormBuilder,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService,
    private readonly _utilsService: UtilsService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );

    this.form = _builder.group({
      fechaInicio: [this.bsValueIni, Validators.required],
      fechaFin: [this.bsValueFin, Validators.required],
    });
  }

  ngOnInit() {
    this.bsRangeValue = [];
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onEventSearch(event) {
    this.npage = 0;
    if (this.bsRangeValue.length > 0) {
      this.startDate = this.datePipe.transform(
        this.bsRangeValue[0],
        'dd/MM/yyyy'
      );
      this.endDate = this.datePipe.transform(
        this.bsRangeValue[1],
        'dd/MM/yyyy'
      );
      this.getDigitalPlatformReport();
    }
  }

  getDigitalPlatformReport() {
    this.digitalPlatformReportFilter = new BaseFilter();
    this.digitalPlatformReportFilter.DRANGESTART = this.startDate;
    this.digitalPlatformReportFilter.DRANGEEND = this.endDate;
    this.digitalPlatformReportFilter.NPAGENUM = this.npage;
    this.digitalPlatformReportFilter.NPAGESIZE = this.itemsPerPage;

    this.spinner.show();
    this.digitalPlatformReportService
      .getDigitalPlatformReport(this.digitalPlatformReportFilter)
      .subscribe(
        async (result) => {
          this.ListDigitalPlatformReport = <any[]>result;
          if (this.ListDigitalPlatformReport.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = result[0].rowtotal;
          } else {
            this.fExistRegistro = false;
            this.msgErrorLista = 'No se encontraron Registros..';
          }
          // this.emissionService.registrarEvento('', EventStrings.REPORTE_PRODUCCION).subscribe();
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  pageChanged(event: any): void {
    this.npage = event.page - 1;
    this.getDigitalPlatformReport();
  }

  onEventDownload(event) {
    if (this.bsRangeValue.length == 0) {
      return;
    }

    this.startDate = this.datePipe.transform(
      this.bsRangeValue[0],
      'dd/MM/yyyy'
    );
    this.endDate = this.datePipe.transform(this.bsRangeValue[1], 'dd/MM/yyyy');
    this.digitalPlatformReportFilter = new BaseFilter();
    this.digitalPlatformReportFilter.DRANGESTART = this.startDate;
    this.digitalPlatformReportFilter.DRANGEEND = this.endDate;
    this.digitalPlatformReportFilter.NPAGENUM = null;
    this.digitalPlatformReportFilter.NPAGESIZE = null;

    this.spinner.show();
    this.digitalPlatformReportService
      .getDigitalPlatformReport(this.digitalPlatformReportFilter)
      .subscribe(
        async (data) => {
          this.spinner.hide();
          this.ListDigitalPlatformReportExport = <any[]>data;
          if (this.ListDigitalPlatformReportExport.length > 0) {
            this.excelService.exportDigitalPlatformReport(
              this.ListDigitalPlatformReportExport,
              'digitalPlatform'
            );
          }
          // this.emissionService.registrarEvento('', EventStrings.PAYROLL_EXPORTAR).subscribe();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  onEventClear(event) {
    this.bsRangeValue = [];
  }

  exportar() {
    if (
      Date.parse(this.f['fechaFin'].value) <
      Date.parse(this.f['fechaInicio'].value)
    ) {
      this.modal.show();
      this.MENSAJE =
        'El rango de fecha inicial de búsqueda no puede ser menor al rango de fecha final.';
    } else {
      let urlForDownload3 = `https://servicios.protectasecurity.pe/backoffice/ReportUtil/Core/reportProductionGet?`;
      const params: any = new HttpParams()
        .set(
          'P_DRANGESTART',
          moment(this.f['fechaInicio'].value).format('YYYY-MM-DD')
        )
        .set(
          'P_DRANGEEND',
          moment(this.f['fechaFin'].value).format('YYYY-MM-DD')
        )
        .set('P_NPOLICY', '')
        .set('P_NNUMPOINT', '');
      params.updates.forEach((x: any) => {
        urlForDownload3 += `${x.param}=${x.value}&`;
      });
      urlForDownload3 = urlForDownload3.substring(
        0,
        urlForDownload3.length - 1
      );
      this.spinner.show();
      this._utilsService.callApiUrl(urlForDownload3).subscribe(
        (res: any) => {
          const file = {
            archivo: res.archivo,
            nombre: `reporte-pd-${new Date().getTime()}.xls`,
          };
          if (res.archivo) {
            this._utilsService.downloadArchivo(file);
          }
          this.spinner.hide();
        },
        (err: any) => {
          console.error(err);
          this.spinner.hide();
        }
      );
    }
  }

  limpiar(): void {
    this.form.reset();
    this.form.get('fechaInicio').setValue(this.bsValueIni);
    this.form.get('fechaFin').setValue(this.bsValueFin);
  }

  ocultarModal() {
    this.modal.hide();
  }
}
