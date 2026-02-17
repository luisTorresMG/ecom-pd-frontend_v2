import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import * as FileSaver from 'file-saver';
import moment from 'moment';

@Component({
    selector: 'app-reporte-facturacion',
    templateUrl: './reporte-facturacion.component.html',
    styleUrls: ['./reporte-facturacion.component.scss']

})

export class ReporteFacturacionComponent implements OnInit {


    foundResults: any;
    CONSTANTS: any = VidaInversionConstants;
    cur_usr: any;

    isLoading: boolean = false;

    filterDate = {
        startDate:moment().startOf('month'),
        endDate: moment().endOf('month'),
    }
    
    private pollInterval: any;

    search_params = {
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

        // await this.obtenerReportes();
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

    }

    async obtenerReportes(idReport =null){
        try {
            const request_report = {
                Nbranch: this.CONSTANTS.RAMO,
                Nproduct: this.CONSTANTS.COD_PRODUCTO,
                NTYPE_REPORT:5,
                DDATE_START_REPORT: this.search_params.start_date_options.start_date,
                DDATE_END_REPORT: this.search_params.end_date_options.end_date,
                ID_REPORT: idReport
            }

            const resp = await this.atp_report_service.GetStatusReport(request_report).toPromise();
            this.foundResults = resp;
         
        }catch (error) {
            console.error("Error al obtener los reportes: ", error);
            Swal.fire('Error', 'No se pudieron obtener los reportes', 'error');
        }
    }

    getStatusIcon(status: number): string {
        switch (status) {
            case 0: return 'assets/icons/loadingtc.gif';
            case 1: return 'assets/icons/loadingtc.gif';
            case 2: return 'assets/icons/verifyct.png';
            case 3: case 4: return 'assets/icons/incorrecttc.png';
            case 5: return 'assets/icons/warntc.png';
            default: return 'assets/icons/incorrecttc.png';
        }
    }

    private startPolling(reportId: string) {
        
        this.pollInterval = setInterval(async () => {
            await this.obtenerReportes(reportId);
            
            if (this.foundResults.length > 0) {
                const status = this.foundResults[0].NSTATUS;
                console.log('Estado actual del reporte:', status);
                
                if (status === 2 || status === 3 || status === 4 || status === 5) {
                    console.log('Reporte terminado, deteniendo polling');
                    this.stopPolling();
                }
            }
        }, 5000);
    }

    private stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    getStatusTitle(status: number): string {
        switch (status) {
            case 0: return 'Iniciado';
            case 1: return 'Cargando';
            case 2: return 'Finalizado';
            case 3: case 4: return 'Incorrecto';
            case 5: return 'Reporte sin datos';
            default: return 'Estado desconocido';
        }
    }

    changeStartDate(event){
        
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

    async createReportCab() {

        let validate_dates = "1";

        this.search_params.start_date_options.validate_start_date = false;
        this.search_params.end_date_options.validate_end_date = false;
        this.search_params.start_date_options.customClass = [];
        this.search_params.end_date_options.customClass = [];
        // Para la fehca Fin si es igual o mayor al dia de Hoy igualmente Nuestra fecha Fin va ser el dia de hoy (actual), Pero si selecciona un dias o varios dias antes de la fecha del dia Va seleccionar esa fecha pasada

        if (this.search_params.start_date_options.start_date > this.search_params.end_date_options.end_date) {
            this.search_params.start_date_options.validate_start_date = true;
            this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
        }

        if (this.search_params.end_date_options.end_date < this.search_params.start_date_options.start_date) {
            this.search_params.end_date_options.validate_end_date = true;
            this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
        }
      
        if (!this.search_params.start_date_options.validate_start_date && !this.search_params.end_date_options.validate_end_date) {
            const request_report_cab = {
                NBRANCH: this.CONSTANTS.RAMO,
                NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                NTYPE_REPORT:5,
                Ddate_start_report: this.search_params.start_date_options.start_date,
                Ddate_end_report: this.search_params.end_date_options.end_date,
                Nusercode: this.cur_usr?.id
            }

            const dStart = moment(this.search_params.start_date_options.start_date).format('DD/MM/YYYY');
            const dEnd = moment(this.search_params.end_date_options.end_date).format('DD/MM/YYYY');

            const result = await Swal.fire({
                title: 'Advertencia',
                text: `Está seguro que desea generar el reporte de facturacion con el rango de fechas del ${dStart} al ${dEnd}?`,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: true,
            })

            

            if (result.isConfirmed) {

                try{
                    this.isLoading = true;
                    const registered = await this.atp_report_service.CreateReportCab(request_report_cab).toPromise()
                
                    if (registered.Ncode == 0) {
                        Swal.fire('Generación de reporte', `Se acaba de generar el reporte  de facturacion con el ID: ${registered.Sid_report}`, 'success');
                        await this.obtenerReportes(registered.Sid_report)
                        this.startPolling(registered.Sid_report);
                    }
                    else {
                        Swal.fire('Generación de reporte', registered.Smessage, 'error');
                    }
                }catch(ex){
                    console.log("error: ", ex)
                }finally{
                    this.isLoading = false;
                }
            }
        }
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
