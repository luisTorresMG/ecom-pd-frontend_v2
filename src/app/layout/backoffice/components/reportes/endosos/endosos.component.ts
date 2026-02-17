import { EndorsementReportService } from '../../../services/endorsementreport/endorsementreport.service';
import { Router } from '@angular/router';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { async } from '@angular/core/testing';
import {
    BsDatepickerConfig,
    BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';
import { EndorsementReport } from '../../../models/endorsementreport/endorsementreport';
import {
    BaseFilter,
    IBuscarEndososResponse,
} from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { UtilsService } from '../../../../../shared/services/utils/utils.service';

defineLocale('es', esLocale);
@Component({
    selector: 'app-endosos',
    templateUrl: './endosos.component.html',
    styleUrls: ['./endosos.component.scss'],
})
export class EndososComponent implements OnInit {
    private page: number;
    form: FormGroup;
    formRadio: FormGroup;
    ObjPayroll: any;
    messageEnvio: string;
    message: string;
    messageinfo: string;
    rotate = true;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    ListEndosos: any;
    maxSize = 10;
    baseFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    endDate = '';
    MENSAJE: string;
    fecha = new Date();
    fechaOr: any;
    urlApi: string;
    fExistRegistro: any = false;
    bsRangeValue: Date[];
    bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    bsValueFin: Date = new Date();
    ListEndorsementReport: EndorsementReport[];
    ListEndorsementReportExport: EndorsementReport[];
    msgErrorLista = '';
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    @ViewChild('modalExport', { static: true, read: TemplateRef })
    _modalExport: TemplateRef<any>;
    constructor(
        private endorsementReportService: EndorsementReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private readonly _vc: ViewContainerRef,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private readonly _builder: FormBuilder,
        private readonly _utilsService: UtilsService
    ) {
        this.page = 0;
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
        this.formRadio = this._builder.group({
            radio: ['EXCEL', Validators.required],
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    get ff(): any {
        return this.formRadio.controls;
    }

    // PAGINADO
    // currentPage = 0;
    p = 0;

    set currentPage(val) {
        this.p = val;
        this.buscar();
    }

    get currentPage(): number {
        return this.p;
    }

    ngOnInit() {
        this.bsRangeValue = [];
    }
    onEventSearch(event) {
        this.npage = 0;
        //    if (this.bsRangeValue.length > 0) {
        //     this.startDate = this.datePipe.transform(this.bsRangeValue[0], 'dd/MM/yyyy');
        //     this.endDate = this.datePipe.transform(this.bsRangeValue[1], 'dd/MM/yyyy');
        this.startDate = this.bsValueIni.toISOString();
        this.endDate = this.bsValueFin.toISOString();

        this.getEndorsementReport();
        //    }
    }
    getEndorsementReport() {
        this.baseFilter = new BaseFilter();
        this.baseFilter.DRANGESTART = this.startDate;
        this.baseFilter.DRANGEEND = this.endDate;
        this.baseFilter.NPAGENUM = this.npage;
        this.baseFilter.NPAGESIZE = this.itemsPerPage;
        this.spinner.show();
        this.endorsementReportService
            .getEndorsementReport(this.baseFilter)
            .subscribe(
                async (result) => {
                    this.ListEndorsementReport = <any[]>result;
                    if (this.ListEndorsementReport.length > 0) {
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
    pageChange(): void {
        this.buscar();
    }
    onEventDownload(event) {
        if (this.bsRangeValue.length == 0) {
            return;
        }
        this.startDate = this.bsValueIni.toISOString();
        this.endDate = this.bsValueFin.toISOString();
        this.baseFilter = new BaseFilter();
        this.baseFilter.DRANGESTART = this.startDate;
        this.baseFilter.DRANGEEND = this.endDate;
        this.baseFilter.NPAGENUM = null;
        this.baseFilter.NPAGESIZE = null;
        this.spinner.show();
        this.endorsementReportService
            .getEndorsementReport(this.baseFilter)
            .subscribe(
                async (data) => {
                    this.spinner.hide();
                    this.ListEndorsementReportExport = <any[]>data;
                    if (this.ListEndorsementReportExport.length > 0) {
                        this.excelService.exportEndorsementReport(
                            this.ListEndorsementReportExport,
                            'endosos'
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
        this.ListEndosos = [];
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
                filterscount: '0',
                groupscount: '0',
                pagenum: this.currentPage > 0 ? this.currentPage - 1 : 0,
                pagesize: '10',
                recordstartindex: this.currentPage * 10,
                recordendindex: this.currentPage * 10 + 10,
                P_DRANGESTART: new Date(this.f['fechaInicio'].value).toISOString(),
                P_DRANGEEND: new Date(this.f['fechaFin'].value).toISOString(),
                _: new Date().getTime(),
            };
            this.endorsementReportService.busqueda(data).subscribe(
                (response: IBuscarEndososResponse) => {
                    this.ListEndosos = response;
                    this.ListEndosos.entities = this.ListEndosos.entities.sort((a, b) =>
                        moment(a.DDATE_ENDOSES, 'DD/MM/YYYY') <
                            moment(b.DDATE_ENDOSES, 'DD/MM/YYYY')
                            ? -1
                            : 1
                    );
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
            this._vc.createEmbeddedView(this._modalExport);
            this.formRadio.get('radio').setValue('EXCEL');
        }
    }

    ocultarModal() {
        this.modal.hide();
    }

    closeModalExport() {
        this._vc.clear();
    }

    tipoExportar() {
        let urlForDownload3 =
            this.urlApi + `/VariousReports/Reports/reportEndorsementsGet?`;
        const params: any = new HttpParams()
            .set(
                'P_DRANGESTART',
                moment(this.f['fechaInicio'].value).format('YYYY-MM-DD')
            )
            .set('P_DRANGEEND', moment(this.f['fechaFin'].value).format('YYYY-MM-DD'))
            .set('format', this.ff['radio'].value);
        params.updates.forEach((x: any) => {
            urlForDownload3 += `${x.param}=${x.value}&`;
        });
        const date = new Date();
        urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
        this.spinner.show();
        this._utilsService.callApiUrl(urlForDownload3).subscribe(
            (res: any) => {
                if (res?.archivo) {
                    const file = {
                        archivo: res.archivo,
                        nombre:
                            `endosos.${date.getFullYear()}${date.getMonth() + 1
                            }${date.getDate()}.` +
                            (`${this.ff['radio'].value}`?.toLowerCase() == 'excel'
                                ? 'xls'
                                : 'pdf'),
                    };
                    this._utilsService.downloadArchivo(file);
                    this.spinner.hide();
                    this._vc.clear();
                    this.ff['radio'].setValue('EXCEL');
                }
            },
            (err: any) => {
                console.error(err);
                this.spinner.hide();
            }
        );
    }
}
