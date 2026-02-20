import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import moment from 'moment';

@Component({
    standalone: false,
    selector: 'app-reporte-comercial',
    templateUrl: './reporte-comercial.component.html',
    styleUrls: ['./reporte-comercial.component.scss']

})

export class ReporteComercialComponent implements OnInit {


    foundResults: any;
    CONSTANTS: any = VidaInversionConstants;
    cur_usr: any;

    isLoading: boolean = false;

    filterDate = {
        startDate:moment().startOf('month'),
        endDate: moment().endOf('month'),
    }

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

    // async obtenerReportes(idReport =null){
    //     try {
    //         const request_report = {
    //             Nbranch: this.CONSTANTS.RAMO,
    //             Nproduct: this.CONSTANTS.COD_PRODUCTO,
    //             DDATE_START_REPORT: this.search_params.start_date_options.start_date,
    //             DDATE_END_REPORT: this.search_params.end_date_options.end_date,
    //             ID_REPORT: idReport
    //         }

    //         await this.atp_report_service.GetStatusReport(request_report).toPromise().then((res) => {
    //             this.foundResults = res;

    //         });  
         
    //     }catch (error) {
    //         console.error("Error al obtener los reportes: ", error);
    //         Swal.fire('Error', 'No se pudieron obtener los reportes', 'error');
    //     }
    // }

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
        // La fecha inicio debe ser menor a la fecha fin, caso contrario se mostrará un mensaje en rojo alertando que la “Fecha inicio es mayor a fecha fin"
        // La fecha fin debe ser mayor a la fecha inicio, caso contrario se mostrará un mensaje en rojo alertando que la “Fecha fin es menor a fecha inicio”
        // if (this.search_params.end_date_options.end_date < this.seafrch_params.start_date_options.start_date) {
        //     this.search_params.start_date_options.validate_start_date = true;
        //     this.search_params.end_date_options.validate_end_date = true;
        // }
        // else {
        //     this.search_params.start_date_options.validate_start_date = false;
        //     this.search_params.end_date_options.validate_end_date = false;
        //     validate_dates = "0";
        // }

        // if (validate_dates === "0") {
        //     this.foundResults = [1, 2];
        // }
        if (!this.search_params.start_date_options.validate_start_date && !this.search_params.end_date_options.validate_end_date) {
            const request_report_cab = {
                NBRANCH: this.CONSTANTS.RAMO,
                NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                NTYPE_REPORT:1,
                Ddate_start_report: this.search_params.start_date_options.start_date,
                Ddate_end_report: this.search_params.end_date_options.end_date,
                Nusercode: this.cur_usr?.id
            }

            const dStart = moment(this.search_params.start_date_options.start_date).format('DD/MM/YYYY');
            const dEnd = moment(this.search_params.end_date_options.end_date).format('DD/MM/YYYY');

            const result = await Swal.fire({
                title: 'Advertencia',
                text: `Está seguro que desea generar el reporte comercial con el rango de fechas del ${dStart} al ${dEnd}?`,
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
                        Swal.fire('Generación de reporte', `Se acaba de generar el reporte comercial con el ID: ${registered.Sid_report}`, 'success');
                        // this.obtenerReportes(res.Sid_report);
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
}
