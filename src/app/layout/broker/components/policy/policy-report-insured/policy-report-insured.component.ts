import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2'
import { CommonMethods } from '../../common-methods';
import { PolicyemitService } from '../../../services/policy/policyemit.service';

@Component({
    selector: 'app-policy-report-insured',
    templateUrl: './policy-report-insured.component.html',
    styleUrls: ['./policy-report-insured.component.scss']
})
export class PolicyReportInsuredComponent implements OnInit {
    @Input() public reference: any;
    @Input() public itemCotizacion: any;

    dateConfig: Partial<BsDatepickerConfig>;
    dateIni: Date = new Date();
    dateFin: Date = new Date();
    // dateIniMax: Date = new Date();
    // dateFinMin: Date = new Date();
    dateFinMax: Date = new Date();
    // dataReport: any = {};
    flagLoading: boolean = false;
    reportInsuredList: any = [];

    constructor(
        private modalService: NgbModal,
        private router: Router,
        private policyService: PolicyemitService,
    ) {
        this.dateConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    ngOnInit(): void {

        this.dateIni = ModuleConfig.StartDate;
        this.dateFin = ModuleConfig.EndDate;
        // this.dateIniMax = ModuleConfig.EndDate;
        // this.dateFinMin = ModuleConfig.StartDate;
        // this.dateFinMax = ModuleConfig.EndDate;

    }

    cerrarModal() {
        this.reference.close();
    }

    changeDateIni(event) {
        console.log(this.dateIni)
        // this.dateFinMin = new Date(this.dateIni);
    }

    changeDateFin(event) {
        console.log(this.dateFin)
        // this.dateIniMax = new Date(this.dateFin);
    }

    async generateReportInsured() {

        this.flagLoading = true;

        let dataReport = await this.generateReportInsuredList();

        console.log(dataReport);
        console.log(this.itemCotizacion);

        if (dataReport.P_NREGULA == '0') {
            await this.generateReportExcel(null, 0);
        }
        else {
            if (dataReport.P_NREGULA == '-1') {
                this.reportInsuredList = [];
                Swal.fire('Información', dataReport.P_SMESSAGE, 'error');
            }
            else {
                this.reportInsuredList = dataReport.reportInsuredList;
            }
        }

        this.flagLoading = false;
    }

    async generateReportExcel(item: any, flagReg: any) {
        this.flagLoading = true;

        let reportInfo = await this.generateExcelReport(item, flagReg);

        this.flagLoading = false;

        if (reportInfo.P_NCODE == "0") {
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // Tipo MIME para Excel
            this.downloadFile(reportInfo.P_SFILE, "Reporte_asegurados_" + this.itemCotizacion.NRO_COTIZACION, fileType);
            Swal.fire('Información', "Se generó la descarga del reporte correctamente", 'success');
        } else {
            Swal.fire('Información', reportInfo.P_SMESSAGE, 'error');
        }
    }

    downloadFile(base64String: string, fileName: string, fileType: string) {
        // Convertir Base64 en un blob
        const binaryString = window.atob(base64String); // Decodificar Base64
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);

        for (let i = 0; i < binaryLen; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: fileType });

        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = fileName;  // Nombre del archivo
        link.click();

        // Limpiar el objeto URL
        URL.revokeObjectURL(url);
    }

    async generateExcelReport(item: any, flagReg: any): Promise<any> {
        let data: any = {
            fechaIni: item == null ? CommonMethods.formatDate(this.dateIni) : item.P_DFINI,
            fechaFin: item == null ? CommonMethods.formatDate(this.dateFin) : item.P_DFFIN,
            nroCotizacion: this.itemCotizacion.NRO_COTIZACION,
            flagReg: flagReg
        };

        return this.policyService.generateExcelReportInsured(data).toPromise();
    }

    async generateReportInsuredList(): Promise<any> {
        let data: any = {
            fechaIni: CommonMethods.formatDate(this.dateIni),
            fechaFin: CommonMethods.formatDate(this.dateFin),
            nroCotizacion: this.itemCotizacion.NRO_COTIZACION
        };

        return this.policyService.reportInsuredList(data).toPromise();
    }

}
