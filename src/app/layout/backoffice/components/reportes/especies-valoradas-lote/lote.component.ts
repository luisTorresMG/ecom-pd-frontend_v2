import { BatchReportService } from '../../../services/batchreport/batchreport.service';
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
import { BatchReport } from '../../../models/batchreport/batchreport';
import { BaseFilter } from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Validar2Request } from '../../../models/transaccion/reasignar-solicitud/reasignar-solicitud.model';
import { HttpParams } from '@angular/common/http';
import { UtilsService } from '@shared/services/utils/utils.service';
defineLocale('es', esLocale);
@Component({
    selector: 'app-lote',
    templateUrl: './lote.component.html',
    styleUrls: ['./lote.component.css'],
})
export class LoteComponent implements OnInit {
    messageEnvio: string;
    message: string;
    urlForDownload3: string;
    messageinfo: string;
    form: FormGroup;
    rotate = true;
    currentPage = 0;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    maxSize = 10;
    batchReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    urlApi: string;
    endDate = '';
    fExistRegistro: any = false;
    ListBatchReport: BatchReport[];
    ListBatchReportExport: BatchReport[];
    msgErrorLista = '';
    lote = '';
    constructor(
        private batchReportService: BatchReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private readonly _builder: FormBuilder,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private readonly _utilsService: UtilsService
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
        this.form = this._builder.group({
            lote: [
                null,
                Validators.compose([Validators.pattern(/^\d*$/), Validators.required]),
            ],
        });
    }
    ngOnInit() {
        this.msgErrorLista = 'No hay información para mostrar';
        this.lote = '';
        this.f['lote'].valueChanges.subscribe((val) => {
            if (val) {
                if (this.f['lote'].hasError('pattern')) {
                    this.f['lote'].setValue(val.substring(val, val.length - 1));
                }
                const firstNumber = Number(val.substring(0, 1));
                if (firstNumber === 0) {
                    this.f['lote'].setValue(val.substring(0, val.length - 1));
                }
            }
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    onEventSearch(event) {
        this.npage = 0;
        this.getBatchReport();
    }
    getBatchReport() {
        this.batchReportFilter = new BaseFilter();
        this.batchReportFilter.NNUMLOT = +this.lote;
        this.batchReportFilter.NPAGENUM = this.npage;
        this.batchReportFilter.NPAGESIZE = this.itemsPerPage;
        this.spinner.show();
        this.batchReportService.getBatchReport(this.batchReportFilter).subscribe(
            async (result) => {
                this.ListBatchReport = <any[]>result;
                if (this.ListBatchReport.length > 0) {
                    this.fExistRegistro = true;
                    this.totalItems = result[0].rowtotal;
                } else {
                    this.fExistRegistro = false;
                    this.msgErrorLista = 'No hay información para mostrar';
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
        this.getBatchReport();
    }
    onEventDownload(event) {
        if (this.lote == '') {
            return;
        }
        this.batchReportFilter = new BaseFilter();
        this.batchReportFilter.NNUMLOT = +this.lote;
        this.batchReportFilter.NPAGENUM = null;
        this.batchReportFilter.NPAGESIZE = null;
        this.spinner.show();
        this.batchReportService.getBatchReport(this.batchReportFilter).subscribe(
            async (data) => {
                this.spinner.hide();
                this.ListBatchReportExport = <any[]>data;
                if (this.ListBatchReportExport.length > 0) {
                    this.excelService.exportBatchReport(
                        this.ListBatchReportExport,
                        'lote'
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
        this.lote = '';
        this.fExistRegistro = false;
        this.ListBatchReport = [];
        this.msgErrorLista = '';
        this.msgErrorLista = 'No hay información para mostrar';
    }

    exportar() {
        let urlForDownload3 =
            this.urlApi + `/ReportAssign/ReportAssign/HistoryReport?`;
        const params: any = new HttpParams().set('P_NNUMLOT', this.f['lote'].value);
        params.updates.forEach((x: any) => {
            urlForDownload3 += `${x.param}=${x.value}&`;
        });
        urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
        this.spinner.show();
        this._utilsService.callApiUrl(urlForDownload3).subscribe(
            (res: any) => {
                console.dir(res);

                const req = {
                    nombre: `reporte-lote-${new Date().getTime()}.xls`,
                    archivo: res.archivo
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
