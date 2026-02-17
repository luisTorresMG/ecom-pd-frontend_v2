import { CreditNoteReportService } from '../../../services/creditnotereport/creditnotereport.service';
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
import { CreditNoteReport } from '../../../models/creditnotereport/creditnotereport';
import { BaseFilter } from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { __exportStar } from 'tslib';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpParams } from '@angular/common/http';
import moment from 'moment';
import { UtilsService } from '@shared/services/utils/utils.service';

defineLocale('es', esLocale);
@Component({
  selector: 'app-notas-credito',
  templateUrl: './notas-credito.component.html',
  styleUrls: ['./notas-credito.component.css'],
})
export class NotasCreditoComponent implements OnInit {
  messageEnvio: string;
  message: string;
  messageinfo: string;
  rotate = true;
  currentPage = 0;
  urlApi: string;
  bsConfig: Partial<BsDatepickerConfig>;
  totalItems = 0;
  itemsPerPage = 10;
  maxSize = 10;
  creditNoteReportFilter = new BaseFilter();
  npage = 1;
  startDate = '';
  endDate = '';
  fecha = new Date();
  MENSAJE: any;
  fExistRegistro: any = false;
  bsRangeValue: Date[];
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListCreditNoteReport: CreditNoteReport[];
  ListCreditNoteReportExport: CreditNoteReport[];
  msgErrorLista = '';

  form: FormGroup;
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  constructor(
    private readonly _utilsService: UtilsService,
    private creditNoteReportService: CreditNoteReportService,
    private readonly _builder: FormBuilder,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
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

  exportar(): void {
    if (
      Date.parse(this.f['fechaFin'].value) <
      Date.parse(this.f['fechaInicio'].value)
    ) {
      this.modal.show();
      this.MENSAJE =
        'El rango de fecha inicial de búsqueda no puede ser menor al rango de fecha final.';
    } else {
      let urlForDownload3 = `https://servicios.protectasecurity.pe/backoffice/ReportUtil/Core/reportProductionNCGet?`;
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
          console.dir(res);

          const req = {
            nombre: `reporte-nota-credito${new Date().getTime()}.xls`,
            archivo: res.archivo,
          };
          this._utilsService.downloadArchivo(req);
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
      this.getCreditNoteReport();
    }
  }

  getCreditNoteReport() {
    this.creditNoteReportFilter = new BaseFilter();
    this.creditNoteReportFilter.DRANGESTART = this.startDate;
    this.creditNoteReportFilter.DRANGEEND = this.endDate;
    this.creditNoteReportFilter.NPAGENUM = this.npage;
    this.creditNoteReportFilter.NPAGESIZE = this.itemsPerPage;

    this.spinner.show();
    this.creditNoteReportService
      .getCreditNoteReport(this.creditNoteReportFilter)
      .subscribe(
        async (result) => {
          this.ListCreditNoteReport = <any[]>result;
          if (this.ListCreditNoteReport.length > 0) {
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
    this.getCreditNoteReport();
  }

  onEventDownload(event) {
    if (this.bsRangeValue.length == 0) {
      return;
    }

    this.startDate = this.bsRangeValue[0].toISOString();
    this.endDate = this.bsRangeValue[1].toISOString();
    this.creditNoteReportFilter = new BaseFilter();
    this.creditNoteReportFilter.DRANGESTART = this.startDate;
    this.creditNoteReportFilter.DRANGEEND = this.endDate;
    this.creditNoteReportFilter.NPAGENUM = null;
    this.creditNoteReportFilter.NPAGESIZE = null;

    this.spinner.show();
    this.creditNoteReportService
      .getCreditNoteReport(this.creditNoteReportFilter)
      .subscribe(
        async (data) => {
          this.spinner.hide();
          this.ListCreditNoteReportExport = <any[]>data;
          if (this.ListCreditNoteReportExport.length > 0) {
            this.excelService.exportCreditNoteReport(
              this.ListCreditNoteReportExport,
              'creditNote'
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

  ocultarModal() {
    this.modal.hide();
  }
}
