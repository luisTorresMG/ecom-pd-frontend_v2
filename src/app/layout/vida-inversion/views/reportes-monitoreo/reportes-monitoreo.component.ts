import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-reportes-monitoreo',
    templateUrl: './reportes-monitoreo.component.html',
    styleUrls: ['./reportes-monitoreo.component.scss']
})
export class ReportesMonitoreoComponent implements OnInit {

    foundResults: any = [];
    CONSTANTS: any = VidaInversionConstants;
    cur_usr: any;

    isLoading: boolean = false;

    search_params = {
        id_report: "",
        start_date_options: {
            start_date: new Date(),
            min_start_date: new Date(),
            max_start_date: new Date(),
            start_date_disabled: null,
            validate_start_date: false,
            customClass: [],
        },
        end_date_options: {
            end_date: new Date(),
            min_end_date: new Date(),
            max_end_date: new Date(),
            end_date_disabled: null,
            validate_end_date: false,
            customClass: [],
        },
    }

    constructor(public atp_report_service: AtpReportService) {
    }

    async ngOnInit() {
        // await this.searchReport();

    }



    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    changeStartDate(event){
        
        // console.log("eventStart: ", event)
        // console.log("end: ", this.search_params.end_date_options.end_date)
        this.search_params.start_date_options.validate_start_date = false;
        this.search_params.end_date_options.validate_end_date = false;
        this.search_params.start_date_options.customClass = [];
        this.search_params.end_date_options.customClass = [];

        if (event > this.search_params.end_date_options.end_date) {
            this.search_params.start_date_options.validate_start_date = true;
            this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
        }

        if (this.search_params.end_date_options.end_date < event) {
            this.search_params.end_date_options.validate_end_date = true;
            this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
        }
    }

    changeEndDate(event){
        // console.log("eventEnd: ", event)
        // console.log("start: ", this.search_params.start_date_options.start_date)
        this.search_params.start_date_options.validate_start_date = false;
        this.search_params.end_date_options.validate_end_date = false;
        this.search_params.start_date_options.customClass = [];
        this.search_params.end_date_options.customClass = [];

        if (this.search_params.start_date_options.start_date > event) {
            this.search_params.start_date_options.validate_start_date = true;
            this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
        }

        if (event < this.search_params.start_date_options.start_date) {
            this.search_params.end_date_options.validate_end_date = true;
            this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
        }
    }

    changeIdReport(val){
        if(val && val.length > 0){
            this.search_params.start_date_options.start_date = new Date();
            this.search_params.end_date_options.end_date = new Date();
            this.search_params.start_date_options.validate_start_date = false;
            this.search_params.start_date_options.customClass = [];
            this.search_params.end_date_options.validate_end_date = false;
            this.search_params.end_date_options.customClass = [];
        }
    }

    async searchReport() {

        try{
            this.isLoading = true;
            const request_search = {
                NBRANCH: this.CONSTANTS.RAMO,
                NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                DDATE_START_REPORT: this.search_params.start_date_options.start_date.toLocaleDateString('es-PE'),
                DDATE_END_REPORT: this.search_params.end_date_options.end_date.toLocaleDateString('es-PE'),
                ID_REPORT: this.search_params.id_report,
                NTYPE_REPORT: 1,
            };

            await this.atp_report_service.GetStatusReport(request_search).toPromise().then((res) => {
                this.foundResults = res;
                console.log(this.foundResults);
            });

        }catch(ex){
            console.log("Error: ", ex)
        }finally{
            this.isLoading = false;
        }

    }

    downloadFileReport(item) {
        try{
            this.isLoading = true;
            this.atp_report_service.DownloadFileReport(item).toPromise().then((res) => {
                console.log(res);

                const file = new File([this.obtenerBlobFromBase64(res.Ofile, '')],
                    item.ID_REPORT + '.xlsx', { type: 'text/xls' });
                FileSaver.saveAs(file);
            });
        }catch(ex){
            console.log("Error: ", ex)
        }finally{
            this.isLoading = false;
        }
    }

}
