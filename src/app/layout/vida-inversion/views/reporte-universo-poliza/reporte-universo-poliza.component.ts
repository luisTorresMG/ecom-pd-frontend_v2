import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import moment from 'moment';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-reporte-universo-poliza',
    templateUrl: './reporte-universo-poliza.component.html',
    styleUrls: ['./reporte-universo-poliza.component.scss']
})
export class ReporteUniversoPolizaComponent implements OnInit, OnDestroy {

    foundResults: any = [];
    CONSTANTS: any = VidaInversionConstants;
    cur_usr: any;
    isLoading: boolean = false;
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
        }
    }

    constructor(public atp_report_service: AtpReportService) {
    }

    async ngOnInit() {
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    changeStartDate(event) {
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

    changeEndDate(event) {
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

    async createUniverseReportCab() {
        this.search_params.start_date_options.validate_start_date = false;
        this.search_params.end_date_options.validate_end_date = false;
        this.search_params.start_date_options.customClass = [];
        this.search_params.end_date_options.customClass = [];

        if (this.search_params.start_date_options.start_date > this.search_params.end_date_options.end_date) {
            this.search_params.start_date_options.validate_start_date = true;
            this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
        }

        if (this.search_params.end_date_options.end_date < this.search_params.start_date_options.start_date) {
            this.search_params.end_date_options.validate_end_date = true;
            this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
        }

        if (!this.search_params.start_date_options.validate_start_date && 
            !this.search_params.end_date_options.validate_end_date) {

            const request_report_cab = {
                Nbranch: this.CONSTANTS.RAMO,
                Nproduct: this.CONSTANTS.COD_PRODUCTO,
                Ntype_report: 4,
                Ddate_start_report: this.search_params.start_date_options.start_date,
                Ddate_end_report: this.search_params.end_date_options.end_date,
                Start_date: this.search_params.start_date_options.start_date,
                Npolicy: null,
                Nusercode: this.cur_usr?.id
            }

            const dStart = moment(this.search_params.start_date_options.start_date).format('DD/MM/YYYY');
            const dEnd = moment(this.search_params.end_date_options.end_date).format('DD/MM/YYYY');

            const result = await Swal.fire({
                title: 'Advertencia',
                text: `¿Está seguro que desea generar el reporte de universo de pólizas con el rango de fechas del ${dStart} al ${dEnd}?`,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: true,
            })

            if (result.isConfirmed) {
                try {
                    this.isLoading = true;
                    this.stopPolling();
                    this.foundResults = [];

                    const registered = await this.atp_report_service.CreateUniverseReportCab(request_report_cab).toPromise()

                    if (registered.Ncode == 0) {
                        Swal.fire('Generación de reporte', 
                            `Reporte enviado para procesamiento con ID: ${registered.Sid_report}`, 
                            'success');
                        
                        await this.loadSpecificReport(registered.Sid_report);
                        this.startPolling(registered.Sid_report);
                    }
                    else {
                        Swal.fire('Generación de reporte', registered.Smessage, 'error');
                    }
                } catch (ex) {
                    console.log("error: ", ex)
                    Swal.fire('Error', 'Ocurrió un error al generar el reporte', 'error');
                } finally {
                    this.isLoading = false;
                }
            }
        }
    }

    async loadSpecificReport(reportId: string) {
        try {
            const request_search = {
                Nbranch: this.CONSTANTS.RAMO,
                Nproduct: this.CONSTANTS.COD_PRODUCTO,
                Ntype_report: 4,
                Ddate_start_report: new Date(),
                Ddate_end_report: new Date(),
                Id_report: reportId
            };

            const response = await this.atp_report_service.GetStatusReportUniverse(request_search).toPromise();
            
            this.foundResults = response || [];
            console.log('Reporte específico encontrado:', this.foundResults);

        } catch (ex) {
            console.error("Error en loadSpecificReport: ", ex);
            this.foundResults = [];
        }
    }

    private startPolling(reportId: string) {
        console.log('Iniciando polling para reporte:', reportId);
        
        this.pollInterval = setInterval(async () => {
            await this.loadSpecificReport(reportId);
            
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
            console.log('Deteniendo polling');
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    async downloadFileReport(item) {
        try {
            this.isLoading = true;
            
            const downloadParams = {
                ID_REPORT: item.ID_REPORT,
                SMAIN_ROUTE: item.SMAIN_ROUTE
            };

            const res = await this.atp_report_service.DownloadFileReport(downloadParams).toPromise();
            
            const fileData = res.Data || res.Ofile;
            
            if (fileData) {
                const file = new File([this.obtenerBlobFromBase64(fileData, '')],
                    item.ID_REPORT + '.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                FileSaver.saveAs(file);
                Swal.fire('Descarga', 'Reporte descargado exitosamente', 'success');
            } else {
                Swal.fire('Error', 'No se pudo obtener el archivo', 'error');
            }
        } catch (ex) {
            console.error("Error: ", ex);
            Swal.fire('Error', 'Error al procesar la descarga', 'error');
        } finally {
            this.isLoading = false;
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

    getStatusDescription(status: number): string {
        switch (status) {
            case 0: return 'Iniciado';
            case 1: return 'En Proceso';
            case 2: return 'Completado';
            case 3: return 'Error';
            case 4: return 'Error';
            case 5: return 'Sin Datos';
            default: return 'Desconocido';
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
}