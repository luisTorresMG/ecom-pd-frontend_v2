
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { GlobalValidators } from '../global-validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SuspensionService } from '../../services/suspension-service/suspension.service';
@Component({
    selector: 'app-maintenance-suspension-periods',
    templateUrl: './maintenance-suspension-periods.component.html',
    styleUrls: ['./maintenance-suspension-periods.css']
})

export class MaintenanceSuspensionPeriodsComponent implements OnInit {
    isLoading: boolean = false;
    @ViewChild('childModalMensaje', { static: true })
    childModalMensaje: ModalDirective;
    currentPage = 1;
    itemsPerPage = 7;
    totalItems = 0;
    maxSize = 10;
    ramos: any;
    submitted: boolean = false;
    submittedModal: boolean = false;
    Months: any;
    DStartDate: Date;
    DEndDate: Date;
    Today: Date;
    filterForm: FormGroup;
    filterModalForm: FormGroup;
    bsConfigYear: Partial<BsDatepickerConfig>;
    bsConfigDate: Partial<BsDatepickerConfig>;
    DataSuspension: any;
    pagedResult: any;
    isEdit: boolean;
    isActive: boolean;
    nidActual: any;
    DstartDateModal: any;
    DendDateModal: any;
    constructor(
        private formBuilder: FormBuilder,
        private suspensionApi: SuspensionService,
        private cdRef: ChangeDetectorRef

    ) {
        this.bsConfigDate = Object.assign(
            {
                locale: 'es',
                showWeekNumbers: false,
                dateInputFormat: 'DD/MM/YYYY',
            }
        );
        this.bsConfigYear = Object.assign(
            {
                dateInputFormat: 'YYYY',
                locale: 'es',
                minMode: 'year',
                startView: 'year'
            }
        );
        this.Months = [
            { "mes": 1, "descripcion": "ENERO" },
            { "mes": 2, "descripcion": "FEBRERO" },
            { "mes": 3, "descripcion": "MARZO" },
            { "mes": 4, "descripcion": "ABRIL" },
            { "mes": 5, "descripcion": "MAYO" },
            { "mes": 6, "descripcion": "JUNIO" },
            { "mes": 7, "descripcion": "JULIO" },
            { "mes": 8, "descripcion": "AGOSTO" },
            { "mes": 9, "descripcion": "SEPTIEMBRE" },
            { "mes": 10, "descripcion": "OCTUBRE" },
            { "mes": 11, "descripcion": "NOVIEMBRE" },
            { "mes": 12, "descripcion": "DICIEMBRE" }];

        this.Today = new Date();
        this.DStartDate = this.getDate(this.Today, 1);
        this.DEndDate = this.getDate(this.Today, 2);
        this.isEdit = false;
        this.DstartDateModal = this.DStartDate;
        this.DendDateModal = this.DEndDate;
    }

    ngOnInit(): void {

        this.createFormMain();
        this.getParams();
        this.createFormModal(false);

    }

    private createFormMain(): void {
        this.filterForm = this.formBuilder.group({
            P_NBRANCH: ['0', [Validators.required]],
            P_SMONTH: [0, [Validators.required]],
            P_SYEAR: [new Date(), [Validators.required]],
        });
    }



    private createFormModal(isEdit: boolean, data: any = null): void {
        
        let fechaInicio = isEdit ? this.parseDateString(data.DSTART_DATE) : this.DStartDate;
        let fechaFin = isEdit ? this.parseDateString(data.DEND_DATE) : this.DEndDate;

        this.filterModalForm = this.formBuilder.group({
            P_BRANCH_MODAL: [isEdit ? data.NBRANCH : '', [Validators.required]],
            P_MONTH_MODAL: [isEdit ? data.NMONTH : this.getCurrentDate(2), [Validators.required]],
            P_YEAR_MODAL: [isEdit ? data.YEAR : this.getCurrentDate(1), [Validators.required]],
            P_DSTARTDATE: [fechaInicio, [Validators.required]],
            P_DEXPIRDAT: [fechaFin, [Validators.required]],
            P_HOURINI_MODAL: [isEdit ? data.DSTART_HOUR : '23:59', [Validators.required]],
            P_HOURFIN_MODAL: [isEdit ? data.DEND_HOUR : '23:59', [Validators.required]],
        });


        this.filterModalForm.setValidators([
            GlobalValidators.dateSortS,
            GlobalValidators.dateEqualsSort,
            GlobalValidators.dateMinorSort
        ]);


    }

    getParams = () => {
        let temp = this.suspensionApi.getBranchAvailable().subscribe(
            (res) => {
                this.ramos = res;
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los parámetros => ' + JSON.stringify(err),
                    'error'
                );
            }
        );
    };

    AbrirModal(nidSuspension: number = 0, data: any = null) {
        this.submitted = false;
        this.submittedModal = false;
        this.isEdit = nidSuspension == 0 ? false : true;
        if (data != null) {
            this.isActive = data.NSTATUS == 1 ? true : false;
        }
        this.nidActual = this.isEdit ? data.NID : null;
        this.createFormModal(this.isEdit, data);
        this.childModalMensaje.show();
        this.DstartDateModal = this.DStartDate;
        this.DendDateModal = this.DEndDate;
    }

    closeModalMensaje(): void {
        this.isEdit = false;
        this.submittedModal = false;
        this.isActive = false;
        this.nidActual = null;
        this.childModalMensaje.hide();

        this.DstartDateModal = this.DStartDate;
        this.DendDateModal = this.DEndDate;
    }

    onDateChangeModal() {

        let syear: number;

        const yearValue = this.filterModalForm.controls['P_YEAR_MODAL'].value;

        if (this.esStringFecha(yearValue)) {
            const parsedDate = new Date(yearValue);
            if (!isNaN(parsedDate.getTime())) {
                syear = parsedDate.getFullYear();
            } else {
                syear = Number(yearValue);
            }
        } else if (this.esDate(yearValue)) {
            syear = yearValue.getFullYear();
        } else {
            syear = parseInt(yearValue);
        }

        const month = Number(this.filterModalForm.controls['P_MONTH_MODAL'].value);
        const diniDate = new Date(syear, month - 1, 1);
        const dendDate = new Date(syear, month, 0);

        this.DstartDateModal = new Date(diniDate);
        this.DendDateModal = new Date(dendDate);
        this.filterModalForm.controls['P_DSTARTDATE'].setValue(null, { emitEvent: false });
        this.filterModalForm.controls['P_DEXPIRDAT'].setValue(null, { emitEvent: false });

        setTimeout(() => {
            this.filterModalForm.controls['P_DSTARTDATE'].setValue(new Date(diniDate));
            this.filterModalForm.controls['P_DEXPIRDAT'].setValue(new Date(dendDate));
        });

    }

    async GetListSuspensionesAvailable() {

        this.submitted = true;
        if (this.filterForm.valid) {
            let data = {
                "NBRANCH": this.filterForm.controls['P_NBRANCH'].value,
                "NYEAR": this.filterForm.controls['P_SYEAR'].value.getFullYear(),
                "MONTH": this.filterForm.controls['P_SMONTH'].value
            };

            this.setLoading(true);
            try {
                const temp = await this.suspensionApi.getListSuspension(data).toPromise();
                if (temp) {
                    this.setLoading()
                    this.DataSuspension = temp;
                    this.totalItems = this.DataSuspension.RESULT.length;
                    this.pageChanged(1);
                } else {
                    this.setLoading()
                    Swal.fire(
                        'Error',
                        'No se recibió respuesta del servidor.',
                        'error'
                    );
                }

            } catch (error) {
                this.setLoading()
                Swal.fire(
                    'Error',
                    'Error realizando la petición  => ' + JSON.stringify(error),
                    'error'
                );
            }
        }
    };

    async GenerateTransac() {
        this.submittedModal = true;
        let diniDate = this.formatDate(this.filterModalForm.controls['P_DSTARTDATE'].value) + ' ' + this.filterModalForm.controls['P_HOURINI_MODAL'].value;
        let typeofTransac: any;
        //let dendDate = this.formatDate(this.filterModalForm.controls['P_DEXPIRDAT'].value) + ' ' + this.filterModalForm.controls['P_HOURFIN_MODAL'].value;
        let rawDate = this.filterModalForm.controls['P_DEXPIRDAT'].value;
        let date = this.parseToDate(rawDate);
        let dendDate;
        if (date) {
            const modifiedDate = new Date(date);
            modifiedDate.setDate(modifiedDate.getDate() + 1);
            dendDate = this.formatDate(modifiedDate);
        }

        let temp;

        let message = this.isEdit ? 'actualizo' : 'guardo';

        let messageVerb = this.isEdit ? ' actualizar ' : ' guardar ';

        if (this.filterModalForm.valid) {

            typeofTransac = this.isEdit ? 2 : 1;

            const status = await this.ValidateStatusPeriod(typeofTransac);
            if (status.P_NSTATUS == 1) {
                Swal.fire(
                    'Información',
                    status.P_SMESSAGE,
                    'error'
                );
                return;
            }


            let data = {
                "P_NMONTHS": this.filterModalForm.controls['P_MONTH_MODAL'].value,
                "P_NYEAR": this.filterModalForm.controls['P_YEAR_MODAL'].value,
                "P_NUSERCODE": JSON.parse(localStorage.getItem('currentUser')).id,
                "P_NBRANCH": this.filterModalForm.controls['P_BRANCH_MODAL'].value,
                "P_DEFFECDATE": diniDate,
                "P_DEXPIRDAT": dendDate
            };

            if (this.isEdit) {
                data["P_NID"] = this.nidActual;
            }


            Swal.fire({
                title: 'Información',
                text: '¿Estás seguro que deseas ' + messageVerb + ' el registro?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            })
                .then(async (result) => {
                    if (result.value) {

                        this.setLoading(true)
                        try {
                            if (this.isEdit) {
                                temp = await this.suspensionApi.updFechasSuspension(data).toPromise();

                            } else {
                                temp = await this.suspensionApi.insNewSuspension(data).toPromise();
                            }

                            if (temp) {
                                this.setLoading()
                                if (temp.P_NCODE == 0) {
                                    /*if (this.isEdit) {
                                        this.GetListSuspensionesAvailable();
                                    }*/
                                    this.GetListSuspensionesAvailable();
                                    this.closeModalMensaje();
                                    Swal.fire(
                                        'Éxito',
                                        'Se ' + message + ' correctamente el registro',
                                        'success'
                                    );
                                } else {
                                    Swal.fire(
                                        'Error',
                                        'Error ' + temp.P_SMESSAGE,
                                        'error'
                                    );
                                }
                            } else {
                                this.setLoading()
                                Swal.fire(
                                    'Error',
                                    'No se recibió respuesta del servidor.',
                                    'error'
                                );
                            }

                        } catch (error) {
                            this.setLoading()
                            Swal.fire(
                                'Error',
                                'Error realizando la petición  => ' + JSON.stringify(error),
                                'error'
                            );
                        }
                    }
                });

        }



    };

    async CloseDeleteSuspension(dlt: boolean, param: any = null) {
        let temp;
        let message = dlt ? 'elimino' : 'cerro';
        let messageVerb = dlt ? ' eliminar ' : ' cerrar ';
        let typeofTransac: number;
        let data = {
            "P_NMONTHS": dlt ? param.NMONTH : this.filterModalForm.controls['P_MONTH_MODAL'].value,
            "P_NYEAR": dlt ? param.YEAR : this.filterModalForm.controls['P_YEAR_MODAL'].value,
            "P_NUSERCODE": JSON.parse(localStorage.getItem('currentUser')).id,
            "P_NBRANCH": dlt ? param.NBRANCH : this.filterModalForm.controls['P_BRANCH_MODAL'].value,
        };

        data["P_NID"] = dlt ? param.NID : this.nidActual;

        typeofTransac = dlt ? 3 : 4;

        const status = await this.ValidateStatusPeriod(typeofTransac);
        if (status.P_NSTATUS == 1) {
            Swal.fire(
                'Información',
                status.P_SMESSAGE,
                'error'
            );
            return;
        }

        Swal.fire({
            title: 'Información',
            text: '¿Estás seguro que deseas' + messageVerb + 'el período?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        })
            .then(async (result) => {
                if (result.value) {
                    this.setLoading(true)
                    try {
                        if (dlt) {
                            temp = await this.suspensionApi.updDeleteSuspension(data).toPromise();

                        } else {
                            temp = await this.suspensionApi.updCloseSuspension(data).toPromise();
                        }

                        if (temp) {
                            this.setLoading()
                            if (temp.P_NCODE == 0) {
                                this.GetListSuspensionesAvailable();
                                this.closeModalMensaje();
                                Swal.fire(
                                    'Éxito',
                                    'Se ' + message + ' correctamente el período',
                                    'success'
                                );
                            } else {
                                Swal.fire(
                                    'Error',
                                    'Error ' + temp.P_SMESSAGE,
                                    'error'
                                );
                            }
                        } else {
                            this.setLoading()
                            Swal.fire(
                                'Error',
                                'No se recibió respuesta del servidor.',
                                'error'
                            );
                        }

                    } catch (error) {
                        this.setLoading()
                        Swal.fire(
                            'Error',
                            'Error realizando la petición  => ' + JSON.stringify(error),
                            'error'
                        );
                    }
                }
            });
    };

    async ValidateStatusPeriod(ntype: number) {
        this.setLoading(true)
        let data = {
            "P_NTYPE": ntype,
            "P_NBRANCH": this.filterModalForm.controls['P_BRANCH_MODAL'].value,
            "P_NMONTHS": this.filterModalForm.controls['P_MONTH_MODAL'].value,
            "P_NYEAR": this.filterModalForm.controls['P_YEAR_MODAL'].value,
        };

        if (ntype != 1) {
            data["P_NID"] = this.nidActual;
        }

        try {
            let temp = await this.suspensionApi.valStatusSuspension(data).toPromise();
            this.setLoading()
            if (temp) {
                return temp;
            } else {
                return null;
            }

        } catch (error) {
            this.setLoading()
            return null;
        }


    }








    private esDate(fecha: any): fecha is Date {
        return fecha instanceof Date && !isNaN(fecha.getTime());
    }

    private esStringFecha(fecha: any): fecha is string {
        return typeof fecha === 'string' && fecha.length > 0;
    }

    private parseToDate(value: any): Date | null {
        if (value instanceof Date && !isNaN(value.getTime())) {
            return value;
        }

        if (typeof value === 'string') {
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
        }

        return null;
    }

    private parseDateString(fecha: string): Date {
        const [dia, mes, anio] = fecha.split('/');
        return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }

    private getCurrentDate(ntypeDate: number) {
        switch (ntypeDate) {
            case 1:
                return (this.Today.getFullYear()) // año
            case 2:
                return (this.Today.getMonth() + 1) // mes
            case 3:
                return (this.Today.getDay()) // dia

        }
    }

    private pageChanged(page: number) {
        this.currentPage = page;

        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        this.pagedResult = this.DataSuspension.RESULT.slice(start, end);

    }

    private formatDate(dateToFormat: Date) {
        return String(dateToFormat.getDate()).padStart(2, '0') + '/' +
            String(dateToFormat.getMonth() + 1).padStart(2, '0') + '/' +
            dateToFormat.getFullYear();
    }

    private getDate(dateToGet: Date, typeDate: number = 0) {
        switch (typeDate) {
            case 1:
                return new Date(dateToGet.getFullYear(), dateToGet.getMonth(), 1); // primer dia del mes 
            case 2:
                return new Date(dateToGet.getFullYear(), dateToGet.getMonth() + 1, 0) // ultimo dia del mes 
        }
    }
    private setLoading(state: boolean = false, context?: string): void {
        this.isLoading = state;
    }
}
