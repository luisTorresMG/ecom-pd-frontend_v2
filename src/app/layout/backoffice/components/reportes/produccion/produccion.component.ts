import { ProductionReportService } from '../../../services/productionreport/productionreport.service';
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
import { ProductionReport } from '../../../models/productionreport/productionreport';
import {
    BaseFilter,
    IBuscarProduccionResponse,
} from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import {
    FormGroup,
    FormBuilder,
    Validators,
    AbstractControl,
} from '@angular/forms';
import moment from 'moment';
import { UtilsService } from '@shared/services/utils/utils.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpParams } from '@angular/common/http';
defineLocale('es', esLocale);
@Component({
    selector: 'app-produccion',
    templateUrl: './produccion.component.html',
    styleUrls: ['./produccion.component.css'],
})
export class ProduccionComponent implements OnInit {
    formCargaMasivaSearch: FormGroup;
    messageEnvio: string;
    form: FormGroup;
    message: string;
    messageinfo: string;
    rotate = true;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    maxSize = 10;
    productionReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    ListBP: any;
    exportarex: string;
    urlApi: string;
    endDate = '';
    fecha = new Date();
    MENSAJE: string;
    fExistRegistro: any = false;
    bsRangeValue: Date[];
    bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    bsValueFin: Date = new Date();
    ListProductionReport: ProductionReport[];
    ListProductionReportExport: ProductionReport[];
    msgErrorLista = '';

    @ViewChild('modal', { static: true }) modal: ModalDirective;
    constructor(
        private readonly _utilsService: UtilsService,
        private productionReportService: ProductionReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private readonly _builder: FormBuilder
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

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    // PAGINADO
    currentPage = 0;
    p = 0;
    ngOnInit() {
        this.bsRangeValue = [];
    }

    onEventSearch(event) {
        this.npage = 0;
        // if (this.bsRangeValue.length > 0) {
        //   this.startDate = this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy');
        //   this.endDate = this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy');
        this.startDate = this.bsValueIni.toISOString();
        this.endDate = this.bsValueFin.toISOString();
        this.getProductionReport();
        // }
    }

    getProductionReport() {
        this.productionReportFilter = new BaseFilter();
        this.productionReportFilter.DRANGESTART = this.startDate;
        this.productionReportFilter.DRANGEEND = this.endDate;
        this.productionReportFilter.NPAGENUM = this.npage;
        this.productionReportFilter.NPAGESIZE = this.itemsPerPage;

        this.spinner.show();
        this.productionReportService
            .getProductionReport(this.productionReportFilter)
            .subscribe(
                async (result) => {
                    this.ListProductionReport = <any[]>result;
                    if (this.ListProductionReport.length > 0) {
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
        this.getProductionReport();
    }

    onEventDownload(event) {
        // this.startDate = this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy');
        // this.endDate = this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy');
        this.startDate = this.bsValueIni.toISOString();
        this.endDate = this.bsValueFin.toISOString();
        this.productionReportFilter = new BaseFilter();
        this.productionReportFilter.DRANGESTART = this.startDate;
        this.productionReportFilter.DRANGEEND = this.endDate;
        this.productionReportFilter.NPAGENUM = null;
        this.productionReportFilter.NPAGESIZE = null;

        this.spinner.show();
        this.productionReportService
            .getProductionReport(this.productionReportFilter)
            .subscribe(
                async (data) => {
                    this.spinner.hide();
                    this.ListProductionReportExport = <any[]>data;
                    if (this.ListProductionReportExport.length > 0) {
                        this.excelService.exportProductionReport(
                            this.ListProductionReportExport,
                            'produccion'
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
        this.form.reset();
        this.form.get('fechaInicio').setValue(this.bsValueIni);
        this.form.get('fechaFin').setValue(this.bsValueFin);
        this.ListBP = [];
    }

    buscar() {
        if (
            Date.parse(this.f['fechaInicio'].value) >
            Date.parse(this.f['fechaFin'].value)
        ) {
            this.MENSAJE =
                'El rango de fecha inicial de búsqueda no puede ser menor al rango de fecha final.';
            this.modal.show();
        } else {
            this.spinner.show();
            const data: any = {
                filterscount: '',
                groupscount: '',
                pagenum: '',
                pagesize: '',
                recordstartindex: '',
                recordendindex: '',
                P_DRANGESTART: moment(this.f['fechaInicio'].value).format('YYYY-MM-DD'),
                P_DRANGEEND: moment(this.f['fechaFin'].value).format('YYYY-MM-DD'),
                P_NPOLICY: '',
                P_NNUMPOINT: '',
                _: 1637250552305,
            };
            this.productionReportService.listar(data).subscribe(
                (response: IBuscarProduccionResponse) => {
                    this.ListBP = response;
                    this.spinner.hide();
                },
                (error: any) => {
                    console.log(error);
                    this.spinner.hide();
                }
            );
        }
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
            const startDate = moment(this.f['fechaInicio'].value).format(
                'YYYY-MM-DD'
            );
            const endDate = moment(this.f['fechaFin'].value).format('YYYY-MM-DD');
            let urlForDownload3 =
                this.urlApi + `/VariousReports/Reports/reportProductionGet?`;
            const params: any = new HttpParams()
                .set('P_DRANGESTART', moment(this.f['fechaInicio'].value).format())
                .set('P_DRANGEEND', moment(this.f['fechaFin'].value).format())
                .set('P_NPOLICY', '')
                .set('P_NNUMPOINT', '');
            params.updates.forEach((x: any) => {
                urlForDownload3 += `${x.param}=${x.value}&`;
            });
            urlForDownload3 = urlForDownload3.substring(
                0,
                urlForDownload3.length - 1
            );
            const date = new Date();
            this.spinner.show();
            this._utilsService.callApiUrl(urlForDownload3).subscribe(
                (res: any) => {
                    console.dir(res);

                    const req = {
                        nombre: `produccion.${date.getFullYear()}${date.getMonth() + 1
                            }${date.getDate()}.xls`,
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

    ocultarModal() {
        this.modal.hide();
    }
}
