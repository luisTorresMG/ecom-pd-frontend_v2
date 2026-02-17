import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonMethods } from '@root/layout/broker/components/common-methods';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import Swal from 'sweetalert2';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-origin-detail-modal',
    templateUrl: './origin-detail-modal.component.html',
    styleUrls: ['./origin-detail-modal.component.scss']
})
export class OriginDetailModalComponent implements OnInit {

    @Input() public reference: any;
    @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

    percentBool: boolean = true;
    porcentage: any;
    example_amount: any;
    funds_financial_institution: any = {};
    saving_financial_institution_list_1: any = [];
    saving_financial_institution_list_2: any = [];
    saving_financial_institution_list_3: any = [];
    saving_financial_institution_list_4: any = [];

    LIST_AFP: any;

    CONSTANTS: any = VidaInversionConstants;

    origin_detail: any = {
        private_pension_system: "",
    };

    change_value: any;

    constructor(private vidaInversionService: VidaInversionService) { }

    async ngOnInit() {

        await this.vidaInversionService.GetProviderListVIGP(this.CONSTANTS.RAMO).toPromise().then((res) => {
            this.saving_financial_institution_list_1 = res.providerList;
            this.saving_financial_institution_list_2 = res.providerList;
            this.saving_financial_institution_list_3 = res.providerList;
            this.saving_financial_institution_list_4 = res.providerList;
            // this.cambiaDatosPoliza.emit();
            // this.emitirCambiarDatoPoliza();
        });

        this.origin_detail = {
            private_pension_system: "",
        };

        this.porcentage = '%';

        this.funds_financial_institution = {
            business_income: "",
            remunerations: "",
            gratifications: "",
            business_dividens: "",
            sale_securities: "",
            canceled_bank_certificates: "",
            loan: "",
            income_personal_fees: "",
            compensation_service_time: "",
            labor_profits: "",
            sales_estates: "",
            inheritance: "",
            cancellation_term_deposits: "",
            others: ""
        };

        this.LIST_AFP = [
            { id: "0", value: "NINGUNO" },
            { id: "1", value: "PROFUTURO" },
            { id: "2", value: "HABITAT" },
            { id: "3", value: "INTEGRA" },
            { id: "4", value: "PRIMA" }
        ];

        await this.vidaInversionService.GetOriginDetailCab(this.reference.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];
                this.origin_detail.private_pension_system = { id: response.P_NPRIVATE_PENSION_SYSTEM.toString() };
                //this.origin_detail.cuspp_code = response.P_NCUSPP == "" ? '' : response.P_NCUSPP;
                this.origin_detail.saving_financial_institution_1 = { cod_proveedor: response.P_NSAVING_FINANCIAL_INSTITUTION1 };
                this.origin_detail.saving_financial_institution_2 = { cod_proveedor: response.P_NSAVING_FINANCIAL_INSTITUTION2 };
                this.origin_detail.saving_financial_institution_3 = { cod_proveedor: response.P_NSAVING_FINANCIAL_INSTITUTION3 };
                this.origin_detail.saving_financial_institution_4 = { cod_proveedor: response.P_NSAVING_FINANCIAL_INSTITUTION4 };
                this.origin_detail.account_number_1 = response.P_SACCOUNT_NUMBER1 == '0' ? '' : response.P_SACCOUNT_NUMBER1;
                this.origin_detail.account_number_2 = response.P_SACCOUNT_NUMBER2 == '0' ? '' : response.P_SACCOUNT_NUMBER2;
                this.origin_detail.account_number_3 = response.P_SACCOUNT_NUMBER3 == '0' ? '' : response.P_SACCOUNT_NUMBER3;
                this.origin_detail.account_number_4 = response.P_SACCOUNT_NUMBER4 == '0' ? '' : response.P_SACCOUNT_NUMBER4;
                this.origin_detail.comment = response.P_SCOMMENT;
            }

            else {
                this.origin_detail.private_pension_system = { id: '' };
                //this.origin_detail.cuspp_code = '';
                this.origin_detail.saving_financial_institution_1 = { cod_proveedor: '' };
                this.origin_detail.saving_financial_institution_2 = { cod_proveedor: '' };
                this.origin_detail.saving_financial_institution_3 = { cod_proveedor: '' };
                this.origin_detail.saving_financial_institution_4 = { cod_proveedor: '' };
                this.origin_detail.account_number_1 = '';
                this.origin_detail.account_number_2 = '';
                this.origin_detail.account_number_3 = '';
                this.origin_detail.account_number_4 = '';
                this.origin_detail.comment = '';
            }
        });

        await this.vidaInversionService.GetOriginDetailDet(this.reference.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];
                this.funds_financial_institution.business_income = response.P_NBUSINESS_INCOME;
                this.funds_financial_institution.income_personal_fees = response.P_NINCOME_PERSONAL_FEES;
                this.funds_financial_institution.remunerations = response.P_NREMUNERATIONS;
                this.funds_financial_institution.compensation_service_time = response.P_NCOMPENSATION_SERVICE_TIME;
                this.funds_financial_institution.gratifications = response.P_NGRATIFICATIONS;
                this.funds_financial_institution.labor_profits = response.P_NLABOR_PROFITS;
                this.funds_financial_institution.business_dividens = response.P_NBUSINESS_DIVIDENS;
                this.funds_financial_institution.sales_estates = response.P_NSALES_ESTATES;
                this.funds_financial_institution.inheritance = response.P_NINHERITANCE;
                this.funds_financial_institution.canceled_bank_certificates = response.P_NCANCELED_BANK_CERTIFICATES;
                this.funds_financial_institution.cancellation_term_deposits = response.P_NCANCELLATION_TERM_DEPOSITS;
                this.funds_financial_institution.loan = response.P_NLOAN;
                this.funds_financial_institution.others = response.P_NOTHERS;
                this.funds_financial_institution.sale_securities = response.P_NSALE_SECURITIES;
            }
            else {
                this.funds_financial_institution.business_income = '';
                this.funds_financial_institution.income_personal_fees = '';
                this.funds_financial_institution.remunerations = '';
                this.funds_financial_institution.compensation_service_time = '';
                this.funds_financial_institution.gratifications = '';
                this.funds_financial_institution.labor_profits = '';
                this.funds_financial_institution.business_dividens = '';
                this.funds_financial_institution.sales_estates = '';
                this.funds_financial_institution.inheritance = '';
                this.funds_financial_institution.canceled_bank_certificates = '';
                this.funds_financial_institution.cancellation_term_deposits = '';
                this.funds_financial_institution.loan = '';
                this.funds_financial_institution.others = '';
                this.funds_financial_institution.sale_securities = '';
            }
        });
        // this.percentBool = true;
        this.valOrigin();
    }


    emitirCambiarDatoPoliza() {
        setTimeout(() => {
            this.cambiaDatosPoliza.emit();
        }, 100);
    }

    validateInput() {

        let response = { cod_error: 0, message_error: "" };

        // Si el private_pensions sistem tiene valor origin_detail.cuspp_code debe completarse
        // if (this.origin_detail.private_pension_system.id != "0" && (this.origin_detail.cuspp_code == undefined || this.origin_detail.cuspp_code == "" || this.origin_detail.cuspp_code == "0")) {
        //     response.cod_error = 1;
        //     response.message_error += 'Se debe completar los datos para continuar.';
        //     console.log(1);
        //     return response;
        // };

        // Si alguna opcion de ahorro financiero se debe completar Obligatoriamente el campo Numero de cuenta
        if (this.origin_detail.saving_financial_institution_1.cod_proveedor && (!this.origin_detail.account_number_1) || (!this.origin_detail.saving_financial_institution_1.cod_proveedor) && this.origin_detail.account_number_1) {
            response.cod_error = 1;
            response.message_error += 'Se debe completar los datos para continuar.';
            console.log(2);
            return response;
        };

        if (this.origin_detail.saving_financial_institution_2.cod_proveedor && (!this.origin_detail.account_number_2) || (!this.origin_detail.saving_financial_institution_2.cod_proveedor) && this.origin_detail.account_number_2) {
            response.cod_error = 1;
            response.message_error += 'Se debe completar los datos para continuar.';
            console.log(3);
            return response;
        };

        if (this.origin_detail.saving_financial_institution_3.cod_proveedor && (!this.origin_detail.account_number_3) || (!this.origin_detail.saving_financial_institution_3.cod_proveedor) && this.origin_detail.account_number_3) {
            response.cod_error = 1;
            response.message_error += 'Se debe completar los datos para continuar.';
            console.log(4);
            return response;
        };
        if (this.origin_detail.saving_financial_institution_4.cod_proveedor && (!this.origin_detail.account_number_4) || (!this.origin_detail.saving_financial_institution_4.cod_proveedor) && this.origin_detail.account_number_4) {
            response.cod_error = 1;
            response.message_error = "Se debe completar los datos para continuar.";
            console.log(5);
            return response;
        };

        if ((this.origin_detail.private_pension_system.id != "0") && (this.origin_detail.saving_financial_institution_1.cod_proveedor || this.origin_detail.saving_financial_institution_2.cod_proveedor || this.origin_detail.saving_financial_institution_3.cod_proveedor || this.origin_detail.saving_financial_institution_4.cod_proveedor) && (
            (!this.funds_financial_institution.business_income) &&
            (!this.funds_financial_institution.remunerations) &&
            (!this.funds_financial_institution.gratifications) &&
            (!this.funds_financial_institution.business_dividens) &&
            (!this.funds_financial_institution.sale_securities) &&
            (!this.funds_financial_institution.canceled_bank_certificates) &&
            (!this.funds_financial_institution.loan) &&
            (!this.funds_financial_institution.income_personal_fees) &&
            (!this.funds_financial_institution.compensation_service_time) &&
            (!this.funds_financial_institution.labor_profits) &&
            (!this.funds_financial_institution.sales_estates) &&
            (!this.funds_financial_institution.inheritance) &&
            (!this.funds_financial_institution.cancellation_term_deposits) &&
            (!this.funds_financial_institution.others)
        )) {
            response.cod_error = 1;
            response.message_error = "Se debe completar los datos para continuar.";
            console.log(6);
            return response;
        }
        // sum_porcent == 0


        // if(
        // ){}

        // if (
        //     (this.origin_detail.saving_financial_institution_1.cod_proveedor && (!this.origin_detail.account_number_1) || (!this.origin_detail.saving_financial_institution_1.cod_proveedor) && this.origin_detail.account_number_1) ||
        //     (this.origin_detail.saving_financial_institution_2.cod_proveedor && (!this.origin_detail.account_number_2) || (!this.origin_detail.saving_financial_institution_2.cod_proveedor) && this.origin_detail.account_number_2) ||
        //     (this.origin_detail.saving_financial_institution_3.cod_proveedor && (!this.origin_detail.account_number_3) || (!this.origin_detail.saving_financial_institution_3.cod_proveedor) && this.origin_detail.account_number_3) ||
        //     (this.origin_detail.saving_financial_institution_4.cod_proveedor && (!this.origin_detail.account_number_4) || (!this.origin_detail.saving_financial_institution_4.cod_proveedor) && this.origin_detail.account_number_4)
        //     &&
        //     (
        //         this.funds_financial_institution.business_income &&
        //         this.funds_financial_institution.remunerations &&
        //         this.funds_financial_institution.gratifications &&
        //         this.funds_financial_institution.business_dividens &&
        //         this.funds_financial_institution.sale_securities &&
        //         this.funds_financial_institution.canceled_bank_certificates &&
        //         this.funds_financial_institution.loan &&
        //         this.funds_financial_institution.income_personal_fees &&
        //         this.funds_financial_institution.compensation_service_time &&
        //         this.funds_financial_institution.labor_profits &&
        //         this.funds_financial_institution.sales_estates &&
        //         this.funds_financial_institution.inheritance &&
        //         this.funds_financial_institution.cancellation_term_deposits &&
        //         this.funds_financial_institution.others
        //     )
        // ) {
        //     response.cod_error = 1;
        //     response.message_error = "Se debe completar los datos para continuar.";
        //     console.log(6);
        //     return response;
        // }

        return response;
    };

    async addOriginDetail() {

        const validate_res = this.validateInput();

        if (validate_res.cod_error == 1) {
            Swal.fire('Información', validate_res.message_error, 'error');
            return;
        } else {


            // Aahora el cusp esta llegnadolo como 0

            const origin_detail_cab = {
                P_NID_COTIZACION: this.reference.quotation_id,
                P_NPRIVATE_PENSION_SYSTEM: this.origin_detail.private_pension_system.id,
                //P_NCUSPP: this.origin_detail.cuspp_code,
                P_NSAVING_FINANCIAL_INSTITUTION1: this.origin_detail.saving_financial_institution_1.cod_proveedor,
                P_SACCOUNT_NUMBER1: this.origin_detail.account_number_1,
                P_NSAVING_FINANCIAL_INSTITUTION2: this.origin_detail.saving_financial_institution_2.cod_proveedor,
                P_SACCOUNT_NUMBER2: this.origin_detail.account_number_2,
                P_NSAVING_FINANCIAL_INSTITUTION3: this.origin_detail.saving_financial_institution_3.cod_proveedor,
                P_SACCOUNT_NUMBER3: this.origin_detail.account_number_3,
                P_NSAVING_FINANCIAL_INSTITUTION4: this.origin_detail.saving_financial_institution_4.cod_proveedor,
                P_SACCOUNT_NUMBER4: this.origin_detail.account_number_4,
                P_SCOMMENT: this.origin_detail.comment,
            };

            const origin_detail_det = {
                P_NID_COTIZACION: this.reference.quotation_id,
                P_NBUSINESS_INCOME: this.funds_financial_institution.business_income,
                P_NREMUNERATIONS: this.funds_financial_institution.remunerations,
                P_NGRATIFICATIONS: this.funds_financial_institution.gratifications,
                P_NBUSINESS_DIVIDENS: this.funds_financial_institution.business_dividens,
                P_NSALE_SECURITIES: this.funds_financial_institution.sale_securities,
                P_NCANCELED_BANK_CERTIFICATES: this.funds_financial_institution.canceled_bank_certificates,
                P_NLOAN: this.funds_financial_institution.loan,
                P_NINCOME_PERSONAL_FEES: this.funds_financial_institution.income_personal_fees,
                P_NCOMPENSATION_SERVICE_TIME: this.funds_financial_institution.compensation_service_time,
                P_NLABOR_PROFITS: this.funds_financial_institution.labor_profits,
                P_NSALES_ESTATES: this.funds_financial_institution.sales_estates,
                P_NINHERITANCE: this.funds_financial_institution.inheritance,
                P_NCANCELLATION_TERM_DEPOSITS: this.funds_financial_institution.cancellation_term_deposits,
                P_NOTHERS: this.funds_financial_institution.others,
            };

            let sum_porcent =
                (this.funds_financial_institution.business_income ? Number.parseFloat(this.funds_financial_institution.business_income) : 0) +
                (this.funds_financial_institution.remunerations ? Number.parseFloat(this.funds_financial_institution.remunerations) : 0) +
                (this.funds_financial_institution.gratifications ? Number.parseFloat(this.funds_financial_institution.gratifications) : 0) +
                (this.funds_financial_institution.business_dividens ? Number.parseFloat(this.funds_financial_institution.business_dividens) : 0) +
                (this.funds_financial_institution.sale_securities ? Number.parseFloat(this.funds_financial_institution.sale_securities) : 0) +
                (this.funds_financial_institution.canceled_bank_certificates ? Number.parseFloat(this.funds_financial_institution.canceled_bank_certificates) : 0) +
                (this.funds_financial_institution.loan ? Number.parseFloat(this.funds_financial_institution.loan) : 0) +
                (this.funds_financial_institution.income_personal_fees ? Number.parseFloat(this.funds_financial_institution.income_personal_fees) : 0) +
                (this.funds_financial_institution.compensation_service_time ? Number.parseFloat(this.funds_financial_institution.compensation_service_time) : 0) +
                (this.funds_financial_institution.labor_profits ? Number.parseFloat(this.funds_financial_institution.labor_profits) : 0) +
                (this.funds_financial_institution.sales_estates ? Number.parseFloat(this.funds_financial_institution.sales_estates) : 0) +
                (this.funds_financial_institution.inheritance ? Number.parseFloat(this.funds_financial_institution.inheritance) : 0) +
                (this.funds_financial_institution.cancellation_term_deposits ? Number.parseFloat(this.funds_financial_institution.cancellation_term_deposits) : 0) +
                (this.funds_financial_institution.others ? Number.parseFloat(this.funds_financial_institution.others) : 0);


            // Si se selecciona privado de pensiones y ahorro Financier NO puede colocar el 100 a Financiero y si SELECCIONA SOLO FINANCIERTA NO PUEDE PASAR EL 100%
            if (sum_porcent > 100) {
                Swal.fire('Información', "El porcentaje total de asignación no puede superar el 100%", 'error');
                console.log(1);
                return;
            }
            else if (sum_porcent > 99 && (this.origin_detail.private_pension_system.id != "0")) {
                Swal.fire('Información', "El porcentaje total de asignación no puede superar el 100%", 'error');
                console.log(2);
                return;
            }
            else if (sum_porcent < 100 && (this.origin_detail.private_pension_system.id == "0")) {
                Swal.fire('Información', "El porcentaje total de asignación debe el 100%", 'error');
                console.log(3);
                return;
            }

            else {

                let request_data = { ...origin_detail_cab, ...origin_detail_det };

                const response_ins_cab = await this.vidaInversionService.InsOriginDetailCab(origin_detail_cab).toPromise().then((res) => res);

                if (response_ins_cab.ErrorCode == 1) {
                    Swal.fire('Información', 'Sucedió un error al insertar la información de Sistema privado de pensiones', 'error');
                    return;
                }

                const response_ins_det = await this.vidaInversionService.InsOriginDetailDet(origin_detail_det).toPromise().then((res2) => res2);
                if (response_ins_det.ErrorCode == 1) {
                    Swal.fire('Información', 'Sucedió un error al insertar la información en Institución financiera', 'error');
                    return;
                }

                Swal.fire('Información', "Se registró correctamente.", 'success').then(res => {
                    this.reference.close(request_data);
                });
            }

        }
    }

    valOrigin = () => {
        if (this.origin_detail.saving_financial_institution_1.cod_proveedor && (!this.origin_detail.account_number_1) || (!this.origin_detail.saving_financial_institution_1.cod_proveedor) && this.origin_detail.account_number_1) {
            this.cleanOrigin();
            this.percentBool = true;
            return;
        } else {
            this.percentBool = false;
        };

        if (this.origin_detail.saving_financial_institution_2.cod_proveedor && (!this.origin_detail.account_number_2) || (!this.origin_detail.saving_financial_institution_2.cod_proveedor) && this.origin_detail.account_number_2) {
            this.cleanOrigin();
            this.percentBool = true;
            return;
        } else {
            this.percentBool = false;
        };

        if (this.origin_detail.saving_financial_institution_3.cod_proveedor && (!this.origin_detail.account_number_3) || (!this.origin_detail.saving_financial_institution_3.cod_proveedor) && this.origin_detail.account_number_3) {
            this.cleanOrigin();
            this.percentBool = true;
            return;
        } else {
            this.percentBool = false;
        };

        if (this.origin_detail.saving_financial_institution_4.cod_proveedor && (!this.origin_detail.account_number_4) || (!this.origin_detail.saving_financial_institution_4.cod_proveedor) && this.origin_detail.account_number_4) {
            this.cleanOrigin();
            this.percentBool = true;
            return;
        } else {
            this.percentBool = false;
        };

        if (
            this.origin_detail.saving_financial_institution_1.cod_proveedor && this.origin_detail.account_number_1 ||
            this.origin_detail.saving_financial_institution_2.cod_proveedor && this.origin_detail.account_number_2 ||
            this.origin_detail.saving_financial_institution_3.cod_proveedor && this.origin_detail.account_number_3 ||
            this.origin_detail.saving_financial_institution_4.cod_proveedor && this.origin_detail.account_number_4
        ) {
            this.percentBool = false;
        } else {
            this.percentBool = true;
        };
    }

    cleanOrigin = () => {
        this.funds_financial_institution.business_income = null;
        this.funds_financial_institution.income_personal_fees = null;
        this.funds_financial_institution.remunerations = null;
        this.funds_financial_institution.compensation_service_time = null;
        this.funds_financial_institution.gratifications = null;
        this.funds_financial_institution.labor_profits = null;
        this.funds_financial_institution.business_dividens = null;
        this.funds_financial_institution.sales_estates = null;
        this.funds_financial_institution.sale_securities = null;
        this.funds_financial_institution.inheritance = null;
        this.funds_financial_institution.canceled_bank_certificates = null;
        this.funds_financial_institution.cancellation_term_deposits = null;
        this.funds_financial_institution.loan = null;
        this.funds_financial_institution.others = null;
    }
}