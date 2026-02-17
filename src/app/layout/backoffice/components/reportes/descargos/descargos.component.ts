import { DischargeReportService } from '../../../services/dischargereport/dischargereport.service';
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
import { DischargeReport } from '../../../models/dischargereport/dischargereport';
import {
    BaseFilter,
    BusquedaDescargoResponse,
} from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { HttpParams } from '@angular/common/http';

defineLocale('es', esLocale);
@Component({
    selector: 'app-descargos',
    templateUrl: './descargos.component.html',
    styleUrls: ['./descargos.component.css'],
})
export class DescargosComponent implements OnInit {
    form: FormGroup;
    messageEnvio: string;
    message: string;
    messageinfo: string;
    rotate = true;
    dataBusqueda: any;
    urlForDownload3: string;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    urlApi: string;
    maxSize = 10;
    dischargeReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    endDate = '';
    fExistRegistro: any = false;
    ListDischargeReport: DischargeReport[];
    ListDischargeReportExport: DischargeReport[];
    msgErrorLista = '';
    lote = '';
    constructor(
        private dischargeReportService: DischargeReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private readonly _builder: FormBuilder,
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
        this.form = this._builder.group({
            lote: [
                null,
                Validators.compose([Validators.pattern(/^\d*$/), Validators.required]),
            ],
        });
    }

    // PAGINADO
    currentPage = 0;
    p = 0;
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
        this.getDischargeReport();
    }
    getDischargeReport() {
        this.dischargeReportFilter = new BaseFilter();
        this.dischargeReportFilter.NNUMLOT = +this.lote;
        this.dischargeReportFilter.NPAGENUM = this.npage;
        this.dischargeReportFilter.NPAGESIZE = this.itemsPerPage;
        this.spinner.show();
        this.dischargeReportService
            .getDischargeReport(this.dischargeReportFilter)
            .subscribe(
                async (result) => {
                    this.ListDischargeReport = <any[]>result;
                    if (this.ListDischargeReport.length > 0) {
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
        this.getDischargeReport();
    }
    onEventDownload(event) {
        if (this.lote == '') {
            return;
        }
        this.dischargeReportFilter = new BaseFilter();
        this.dischargeReportFilter.NNUMLOT = +this.lote;
        this.dischargeReportFilter.NPAGENUM = null;
        this.dischargeReportFilter.NPAGESIZE = null;
        this.spinner.show();
        this.dischargeReportService
            .getDischargeReport(this.dischargeReportFilter)
            .subscribe(
                async (data) => {
                    this.spinner.hide();
                    this.ListDischargeReportExport = <any[]>data;
                    if (this.ListDischargeReportExport.length > 0) {
                        this.excelService.exportDischargeReport(
                            this.ListDischargeReportExport,
                            'discharge'
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
        this.dataBusqueda = [];
    }

    busqueda() {
        this.spinner.show();
        const data: any = {
            filterscount: '',
            groupscount: '',
            pagenum: '',
            pagesize: '',
            recordstartindex: '',
            recordendindex: '',
            P_NNUMLOT: this.f['lote'].value,
            _: 1637863005997,
        };
        this.dischargeReportService.listar(data).subscribe(
            (response: BusquedaDescargoResponse) => {
                this.dataBusqueda = response;
                this.spinner.hide();
            },
            (error: any) => {
                console.log(error);
                this.spinner.hide();
            }
        );
    }

    exportar() {
        /* this.urlForDownload3 = this.urlApi + `/ReportDischarge/Core/ReportExcel`;
        const params: any = new HttpParams().set('P_NNUMLOT', this.f['lote'].value);
        params.updates.forEach((x: any) => {
          urlForDownload3 += `${x.param}=${x.value}&`;
        });
        urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
        console.log(urlForDownload);
        window.open(this.urlForDownload3); */
        this.dischargeReportService.exportarExcel(
            this.dataBusqueda.entities,
            'Descarga_Reporte_Descargos'
        );
    }
}
