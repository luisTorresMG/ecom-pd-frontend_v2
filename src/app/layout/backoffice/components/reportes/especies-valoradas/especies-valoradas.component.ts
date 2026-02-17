import { HistoryReportService } from '../../../services/historyreport/historyreport.service';
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
import { HistoryReport } from '../../../models/historyreport/historyreport';
import {
    BaseFilter,
    BuscarHEVResponse,
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
import { UtilsService } from '@shared/services/utils/utils.service';

defineLocale('es', esLocale);
@Component({
    selector: 'app-especies-valoradas',
    templateUrl: './especies-valoradas.component.html',
    styleUrls: ['./especies-valoradas.component.scss'],
})
export class EspeciesValoradasComponent implements OnInit {
    messageEnvio: string;
    message: string;
    messageinfo: string;
    rotate = true;
    form: FormGroup;
    urlApi: string;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    maxSize = 10;
    dataBusqueda: any;
    historyReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    endDate = '';
    MENSAJE: string;
    fExistRegistro: any = false;
    ListHistoryReport: HistoryReport[];
    ListHistoryReportExport: HistoryReport[];
    msgErrorLista = '';
    certificado = '';
    @ViewChild('mensaje', { static: true, read: TemplateRef })
    _mensaje: TemplateRef<any>;
    constructor(
        private readonly _utilsService: UtilsService,
        private historyReportService: HistoryReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private readonly _fb: FormBuilder,
        private readonly _vc: ViewContainerRef
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
        this.form = _fb.group({
            certificado: [
                null,
                Validators.compose([
                    Validators.pattern(/^\d*$/),
                    Validators.required,
                    Validators.maxLength(10),
                ]),
            ],
        });
    }

    // PAGINADO
    currentPage = 0;
    p = 0;

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }
    ngOnInit() {
        this.buscar();
        this.msgErrorLista = 'No hay información para mostrar';
        this.certificado = '';
        this.f['certificado'].valueChanges.subscribe((val) => {
            if (val) {
                if (this.f['certificado'].hasError('pattern')) {
                    this.f['certificado'].setValue(val.substring(val, val.length - 1));
                }
                const firstNumber = Number(val.substring(0, 1));
                if (firstNumber === 0) {
                    this.f['certificado'].setValue(val.substring(0, val.length - 1));
                }
            }
        });
    }
    onEventSearch(event) {
        this.npage = 0;
        this.getHistoryReport();
    }
    getHistoryReport() {
        this.historyReportFilter = new BaseFilter();
        this.historyReportFilter.NPOLICY = +this.certificado;
        this.historyReportFilter.NPAGENUM = this.npage;
        this.historyReportFilter.NPAGESIZE = this.itemsPerPage;
        this.spinner.show();
        this.historyReportService
            .getHistoryReport(this.historyReportFilter)
            .subscribe(
                async (result) => {
                    this.ListHistoryReport = <any[]>result;
                    if (this.ListHistoryReport.length > 0) {
                        this.fExistRegistro = true;
                        this.totalItems = result[0].rowtotal;
                        this.spinner.hide();
                    } else {
                        /* if (this.f['certificado'].value === 0) {
                          this._vc.createEmbeddedView(this._mensaje);
                          this.MENSAJE = 'Debe ingresar un número de certificado válido.';
                          this.spinner.hide();
                        } else { */
                        this.fExistRegistro = false;
                        this.msgErrorLista = 'No hay información para mostrar';
                        this.spinner.hide();
                    }
                    // this.emissionService.registrarEvento('', EventStrings.REPORTE_PRODUCCION).subscribe();
                },
                (err) => {
                    this.spinner.hide();
                    console.log(err);
                }
            );
    }
    pageChanged(event: any): void {
        this.npage = event.page - 1;
        this.getHistoryReport();
    }
    onEventDownload(event) {
        if (this.certificado == '') {
            return;
        }
        this.historyReportFilter = new BaseFilter();
        this.historyReportFilter.NPOLICY = +this.certificado;
        this.historyReportFilter.NPAGENUM = null;
        this.historyReportFilter.NPAGESIZE = null;
        this.spinner.show();
        this.historyReportService
            .getHistoryReport(this.historyReportFilter)
            .subscribe(
                async (data) => {
                    this.spinner.hide();
                    this.ListHistoryReportExport = <any[]>data;
                    if (this.ListHistoryReportExport.length > 0) {
                        this.excelService.exportHistoryReport(
                            this.ListHistoryReportExport,
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
        this.certificado = '';
        this.ListHistoryReport = [];
        this.ListHistoryReportExport = [];
        this.dataBusqueda.entities = [];
        this.msgErrorLista = '';
        this.fExistRegistro = false;
        this.msgErrorLista = 'No hay información para mostrar';
    }

    exportar() {
        let urlForDownload3 =
            this.urlApi + `/ReportAssign/ReportHistory/HistoryReport?`;
        const params: any = new HttpParams().set(
            'P_NPOLESP_COMP',
            this.f['certificado'].value
        );
        params.updates.forEach((x: any) => {
            urlForDownload3 += `${x.param}=${x.value}&`;
        });
        urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
        this.spinner.show();
        this._utilsService.callApiUrl(urlForDownload3).subscribe(
            (res: any) => {
                console.dir(res);

                const req = {
                    nombre: `reporte-especies-valoradas${new Date().getTime()}.xls`,
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

    buscar() {
        this.spinner.show();
        const data: any = {
            filterscount: '',
            groupscount: '',
            pagenum: '',
            pagesize: '',
            recordstartindex: '',
            recordendindex: '',
            P_NPOLESP_COMP: this.f['certificado'].value || '',
            _: 1637349040336,
        };
        this.historyReportService.buscar(data).subscribe(
            (response: BuscarHEVResponse) => {
                this.dataBusqueda = response;
                this.spinner.hide();
            },
            (error: any) => {
                console.log(error);
                this.spinner.hide();
            }
        );
    }
}
