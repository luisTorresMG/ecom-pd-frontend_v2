import { ArqueoReportService } from '../../../services/arqueoreport/arqueoreport.service';
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
import { ArqueoReport } from '../../../models/arqueoreport/arqueoreport';
import { BaseFilter } from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { HttpParams } from '@angular/common/http';

defineLocale('es', esLocale);
@Component({
    selector: 'app-arqueo',
    templateUrl: './arqueo.component.html',
    styleUrls: ['./arqueo.component.css'],
})
export class ArqueoComponent implements OnInit {
    messageEnvio: string;
    urlForDownload3: string;
    message: string;
    messageinfo: string;
    rotate = true;
    urlApi: string;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    maxSize = 10;
    arqueoReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    endDate = '';
    fecha = new Date();
    fExistRegistro: any = false;
    bsRangeValue: Date[];
    bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    bsValueFin: Date = new Date();
    ListArqueoReport: ArqueoReport[];
    ListArqueoReportExport: ArqueoReport[];
    msgErrorLista = '';
    canales = [];
    usuario: any;
    canalSelected = '0';
    constructor(
        private arqueoReportService: ArqueoReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private channelSalesService: ChannelSalesService
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
    }

    // PAGINADO
    currentPage = 0;
    p = 0;

    ngOnInit() {
        this.msgErrorLista = 'No hay información para mostrar';
        this.bsRangeValue = [];
        const usuarioSession = localStorage.getItem('currentUser');
        if (usuarioSession !== null) {
            this.usuario = JSON.parse(usuarioSession);
        }

        this.listarCanales();
    }

    onEventSearch(event) {
        this.npage = 0;
        if (this.canalSelected !== '0') {
            this.getArqueoReport();
        }
    }

    getArqueoReport() {
        this.arqueoReportFilter = new BaseFilter();
        this.arqueoReportFilter.NCANAL = +this.canalSelected;
        this.spinner.show();
        this.arqueoReportService.getArqueoReport(this.arqueoReportFilter).subscribe(
            async (result) => {
                this.ListArqueoReport = <any[]>result;
                if (this.ListArqueoReport.length > 0) {
                    this.fExistRegistro = true;
                    this.totalItems = this.ListArqueoReport.length;
                } else {
                    this.fExistRegistro = false;
                    this.msgErrorLista = 'No hay información para mostrar';
                }
                this.emissionService
                    .registrarEvento('', EventStrings.REPORTE_PRODUCCION)
                    .subscribe();
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
        this.getArqueoReport();
    }

    onEventDownload(event) {
        if (this.canalSelected === '0') {
            return;
        }

        this.arqueoReportFilter.NCANAL = +this.canalSelected;
        this.arqueoReportFilter.NPAGENUM = null;
        this.arqueoReportFilter.NPAGESIZE = null;

        this.spinner.show();
        this.arqueoReportService.getArqueoReport(this.arqueoReportFilter).subscribe(
            async (data) => {
                this.spinner.hide();
                this.ListArqueoReportExport = <any[]>data;
                if (this.ListArqueoReportExport.length > 0) {
                    this.excelService.exportArqueoReport(
                        this.ListArqueoReportExport,
                        'arqueo'
                    );
                }
                this.emissionService
                    .registrarEvento('', EventStrings.PAYROLL_EXPORTAR)
                    .subscribe();
            },
            (err) => {
                this.spinner.hide();
                console.log(err);
            }
        );
    }

    listarCanales() {
        const filtro = new ChannelSales(this.usuario.id, '0', '');
        this.channelSalesService.getPostChannelSales(filtro).subscribe(
            (res) => {
                this.canales = <any[]>res;
            },
            (err) => {
                console.log(err);
            }
        );
    }

    onEventClear(event) {
        this.bsRangeValue = [];
        this.ListArqueoReport = [];
        this.canalSelected = '0';
        this.fExistRegistro = false;
        this.msgErrorLista = 'No hay información para mostrar';
    }

    onChangeCanal(nchannel) {
        this.canalSelected = nchannel;
        return (
            this.canales?.find((x) => x.nchannel?.toString() === nchannel?.toString())
                ?.sdescript || ''
        );
        // if (this.canalSelected === '0') {
        //   this.puntosVenta = [];
        // } else {
        //   this.listarPuntosVenta(this.canalSelected);
        // }
    }

    /* descripcionCanal(id) {
      return (
        this.canales?.find(
          (x) => x.nchannel?.toString() === id?.toString()
        )?.sdescript || ''
      );
    } */

    exportar() {
        /*  this.urlForDownload3 =
          `http://190.216.170.173/backofficeqa/ReportArqueo/Core/ReportExcel?P_DESCANAL=` +
          this.onChangeCanal(this.canalSelected);
        const params: any = new HttpParams().set('P_CODCANAL', this.canalSelected);
        params.updates.forEach((x: any) => {
          urlForDownload3 += `${x.param}=${x.value}&`;
        });
        urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
        // console.log(urlForDownload);
        window.open(this.urlForDownload3); */
        this.channelSalesService.exportarExcel(
            this.ListArqueoReport,
            'Descarga_Reporte_' + this.onChangeCanal(this.canalSelected)
        );
    }
}
