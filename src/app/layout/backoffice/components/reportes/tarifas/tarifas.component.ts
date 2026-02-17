import { RateReportService } from '../../../services/ratereport/ratereport.service';
import { Router } from '@angular/router';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { async } from '@angular/core/testing';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RateReport } from '../../../models/ratereport/ratereport';
import { BaseFilter } from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';

defineLocale('es', esLocale);
@Component({
    selector: 'app-tarifas',
    templateUrl: './tarifas.component.html',
    styleUrls: ['./tarifas.component.css']
})
export class TarifasComponent implements OnInit {

    messageEnvio: string;
    message: string;
    messageinfo: string;
    rotate = true;
    currentPage = 0;
    bsConfig: Partial<BsDatepickerConfig>;
    totalItems = 0;
    itemsPerPage = 10;
    maxSize = 10;
    rateReportFilter = new BaseFilter();
    npage = 1;
    startDate = '';
    endDate = '';
    fecha = new Date();
    fExistRegistro: any = false;
    bsRangeValue: Date[];
    bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    bsValueFin: Date = new Date();
    ListRateReport: RateReport[];
    ListRateReportExport: RateReport[];
    msgErrorLista = '';
    canales = [];
    usuario: any;
    canalSelected = '0';
    lote = '';

    constructor(
        private rateReportService: RateReportService,
        private datePipe: DatePipe,
        private excelService: ExcelService,
        private elementRef: ElementRef,
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private channelSalesService: ChannelSalesService,
    ) {

        this.bsConfig = Object.assign({},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                containerClass: 'theme-dark-blue',
                showWeekNumbers: true
            });


    }

    ngOnInit() {
        this.bsRangeValue = [];
        this.lote = '';
        const usuarioSession = localStorage.getItem('currentUser');
        if (usuarioSession !== null) {
            this.usuario = JSON.parse(usuarioSession);
        }


        this.listarCanales();
    }


    onEventSearch(event) {
        this.npage = 0;
        if (this.canalSelected !== '0') {
            this.getRateReport();
        }

    }

    getRateReport() {
        this.startDate = this.bsRangeValue[0].toISOString();
        this.endDate = this.bsRangeValue[1].toISOString();
        this.rateReportFilter = new BaseFilter();
        this.rateReportFilter.DRANGESTART = this.startDate;
        this.rateReportFilter.DRANGEEND = this.endDate;
        this.rateReportFilter.NCANAL = +this.canalSelected;
        this.rateReportFilter.NNUMLOT = +this.lote;
        this.spinner.show();
        this.rateReportService.getRateReport(this.rateReportFilter).subscribe(
            async result => {
                this.ListRateReport = <any[]>result;
                if (this.ListRateReport.length > 0) {
                    this.fExistRegistro = true;
                    this.totalItems = this.ListRateReport.length;
                } else {
                    this.fExistRegistro = false;
                    this.msgErrorLista = 'No se encontraron Registros..';
                }
                // this.emissionService.registrarEvento('', EventStrings.REPORTE_PRODUCCION).subscribe();
                this.spinner.hide();
            },
            err => {
                this.spinner.hide();
                console.log(err);
            }
        );

    }

    pageChanged(event: any): void {
        this.npage = event.page - 1;
        this.getRateReport();
    }

    onEventDownload(event) {
        if (this.canalSelected === '0') {
            return;
        }

        this.rateReportFilter.NCANAL = +this.canalSelected;
        this.rateReportFilter.NPAGENUM = null;
        this.rateReportFilter.NPAGESIZE = null;

        this.spinner.show();
        this.rateReportService.getRateReport(this.rateReportFilter).subscribe(
            async data => {
                this.spinner.hide();
                this.ListRateReportExport = <any[]>data;
                if (this.ListRateReportExport.length > 0) {
                    this.excelService.exportRateReport(this.ListRateReportExport, 'rate');
                }
                // this.emissionService.registrarEvento('', EventStrings.PAYROLL_EXPORTAR).subscribe();
            },
            err => {
                this.spinner.hide();
                console.log(err);
            }
        );
    }

    listarCanales() {
        const filtro = new ChannelSales(this.usuario.id, '0', '');
        this.channelSalesService
            .getPostChannelSales(filtro)
            .subscribe(
                res => {
                    this.canales = <any[]>res;
                },
                err => {
                    console.log(err);
                }
            );
    }

    onEventClear(event) {
        this.bsRangeValue = [];
        this.canalSelected = '0';
        this.lote = '';
    }

    onChangeCanal(nchannel) {
        this.canalSelected = nchannel;
        // if (this.canalSelected === '0') {
        //   this.puntosVenta = [];
        // } else {
        //   this.listarPuntosVenta(this.canalSelected);
        // }
    }

}
