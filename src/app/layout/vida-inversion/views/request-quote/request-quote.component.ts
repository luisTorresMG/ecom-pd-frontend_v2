import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddLeyendComponent } from '../../components/add-leyend/add-leyend.component';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { AddLeyend1Component } from '../../components/add-leyend1/add-leyend1.component';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import * as FileSaver from 'file-saver';
import { SearchParamsQuotation } from '../../models/SearchParamsQuotation';

@Component({
    templateUrl: './request-quote.component.html',
    styleUrls: ['./request-quote.component.scss']
})
export class RequestQuoteComponent implements OnInit {

    profile_id: any;
    data: Array<any> = [];
    CHANNEL: any;
    PRODUCT: any
    TYPE_CLIENT: any;
    TYPE_STATE: any = [{ Id: "", Name: "" }];
    TYPE_ADVISER: any = [{ Id: "", Name: "" }];
    TYPE_SUPERVIS: any = [{ Id: "", Name: "" }];
    TYPE_BOSS: any = [{ Id: "", Name: "" }];


    TYPE_DOCUMENT: any;
    NUMBER_DOCUMENT: any;
    BOSS: any;
    SUPERVISOR: any;
    ADVISER: any;
    EJECUTIVO: any;

    CONSTANTS: any = VidaInversionConstants;
    cur_usr: any;
    cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    listToShowNV: any = [];
    currentPageNV = 1;
    itemsPerPageNV = 5;
    totalItemsNV = 0;
    maxSizeNV = 15;

    isLoading: boolean = false;


    search_params: SearchParamsQuotation = {
        quotation: "",
        client_type: {},
        state_type: {},
        document_type: {},
        document_number: "",
        names: "",
        last_name: "",
        last_name2: "",
        type_adviser: {},
        type_supervision: {},
        type_boss: {}
    }

    constructor(private router: Router, private modalService: NgbModal,
        public clientInformationService: ClientInformationService,
        public quotationService: QuotationService,
        private parameterSettingsService: ParameterSettingsService,
        private vidaInversionService: VidaInversionService,
    ) { }

    async ngOnInit() {

        this.isLoading = true;
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.PRODUCT = [{ codigo: this.CONSTANTS.COD_PRODUCTO, valor: this.CONSTANTS.DESC_PRODUCTO }];
        this.CHANNEL = [{ codigo: this.cur_usr.canal, valor: this.cur_usr.desCanal }];


        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);
        

        await this.quotationService.getStatusList('3', '18').toPromise().then(
            res => { this.TYPE_STATE = res; },
            error => {
                this.TYPE_STATE = [];
            }
        );



        this.TYPE_CLIENT = [
            { codigo: "0", valor: 'AMBOS' },
            { codigo: "1", valor: 'CONTRATANTE' },
            { codigo: "2", valor: 'ASEGURADO' },
        ];


        this.TYPE_DOCUMENT = [
            { codigo: "0", valor: 'SELECCIONE' },
            { codigo: "1", valor: 'DNI' },
            { codigo: "2", valor: 'CARNET DE EXTRANJERÍA - CE' },
        ];


        // Asesor
        if (this.profile_id.toString() == '191') {

            const request_adviser = {
                P_NFILTER: 0,
                P_NIDUSERA: parseInt(this.cur_usr.id),
            };

            this.TYPE_ADVISER = await this.quotationService.getAsesorVIGP(request_adviser).toPromise();

            this.search_params.type_adviser = { Id: this.cur_usr.id, codigo: this.cur_usr.id };
                
            const request_supervisor = {
                P_NFILTER: this.search_params.type_adviser.Id,
                P_NIDUSERA: 0
            };

            this.TYPE_SUPERVIS = await this.quotationService.getSupervisorVIGP(request_supervisor).toPromise();
            this.search_params.type_supervision = { Id: this.TYPE_SUPERVIS[0].Id, codigo: this.TYPE_SUPERVIS[0].Id };

            const request_boss = {
                P_NFILTER: this.search_params.type_supervision.Id,
                P_NIDUSERA: 0
            };

            this.TYPE_BOSS = await this.quotationService.getJefeVIGP(request_boss).toPromise();
            this.search_params.type_boss = { Id: this.TYPE_BOSS[0].Id, codigo: this.TYPE_BOSS[0].Id };

        }

        // Supervisor
        if (this.profile_id.toString() == '194') {

            const request_supervisor = {
                P_NFILTER: 0,
                P_NIDUSERA: parseInt(this.cur_usr.id)
            };

            this.TYPE_SUPERVIS = await this.quotationService.getSupervisorVIGP(request_supervisor).toPromise();
            this.search_params.type_supervision = { Id: this.TYPE_SUPERVIS[0].Id, codigo: this.TYPE_SUPERVIS[0].Id };
                    
            const request_adviser = {
                P_NFILTER: this.search_params.type_supervision.Id,
                P_NIDUSERA: 0
            };

            this.TYPE_ADVISER = await this.quotationService.getAsesorVIGP(request_adviser).toPromise();
            this.TYPE_ADVISER.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_adviser = { Id: 0};

            const request_boss = {
                P_NFILTER: this.search_params.type_supervision.Id,
                P_NIDUSERA: 0
            };

            this.TYPE_BOSS = await this.quotationService.getJefeVIGP(request_boss).toPromise();
            this.search_params.type_boss = { Id: this.TYPE_BOSS[0].Id, codigo: this.TYPE_BOSS[0].Id };
        }

        // Jefe
        if (this.profile_id.toString() == '195') {

            const request_boss = {
                P_NFILTER: 0,
                P_NIDUSERA: parseInt(this.cur_usr.id)
            };

            this.TYPE_BOSS = await this.quotationService.getJefeVIGP(request_boss).toPromise();
            this.search_params.type_boss = { Id: this.TYPE_BOSS[0].Id, codigo: this.TYPE_BOSS[0].Id };

            const request_validate_boss = {
                P_NFILTER: this.search_params.type_boss.Id,
                P_NIDUSERA: 0
            };

            this.TYPE_SUPERVIS = await this.quotationService.getSupervisorVIGP(request_validate_boss).toPromise();
            this.TYPE_SUPERVIS.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_supervision = { Id: 0 };

            this.TYPE_ADVISER = [{Id: 0, Name: 'TODOS'}];
            this.search_params.type_adviser = { Id: 0 };
        }

        // Soporte
        if (this.profile_id.toString() == '192' || this.profile_id.toString() == '196') {

            const request_boss = {
                P_NFILTER: 0,
                P_NIDUSERA: 0
            };

            this.TYPE_BOSS = await this.quotationService.getJefeVIGP(request_boss).toPromise();
            this.TYPE_BOSS.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_boss = { Id: 0 };
            this.TYPE_SUPERVIS = [{ Id: 0, Name: 'TODOS' }];
            this.search_params.type_supervision = { Id: 0 };
            this.TYPE_ADVISER = [{ Id: 0, Name: 'TODOS' }];
            this.search_params.type_adviser = { Id: 0 };
        }
            
        const quotation_list_params = {
            Nbranch: this.CONSTANTS.RAMO.toString(),
            ProductType: this.CONSTANTS.COD_PRODUCTO.toString(),
            User: this.cur_usr.id,
            Channel: this.cur_usr.canal,
            QuotationNumber: "0",
            ClientType: "0",
            StateType: "0",
            ContractorDocumentType: "0",
            ContractorDocumentNumber: "0",
            ContractorFirstName: "0",
            ContractorPaternalLastName: "0",
            ContractorMaternalLastName: "0",
            NumberProfile: this.profile_id,
            AdviserType: this.search_params.type_adviser.Id,
            SupervisorType: this.search_params.type_supervision.Id,
            BossType: this.search_params.type_boss.Id,
        };

        await this.getListQuotation(quotation_list_params);

        this.isLoading = false;
        // await this.clearParameters();

    }

    async getListQuotation(request) {
        await this.quotationService.getQuotationsVIGP(request).toPromise().then(async (res) => {
            const response = res.GenericResponse;
            let format_res = [];
            if (res.ErrorCode == 0) {
                if (response.length > 0) {
                    format_res = response.map(
                        (element) => {
                            const new_element = {
                                id_cotizacion: element.QuotationNumber,
                                doc_contratante: element.ContractorDocumentNumber,
                                nom_contratante: element.ContractorFullName,
                                doc_aseg: element.InsuredDocumentNumber,
                                nom_aseg: element.InsuredFullName,
                                contribution: element.NCONTRIBUTION.toLocaleString('en-US'),
                                background: element.TYPE_FUND_DESC,
                                nom_asesor: element.AseosrComercial,
                                desc_state: element.SDESC_STATE,
                                date_preliminar: `P-${element.DEFFECT_PRELIMINARY}`,
                                date_definitiva: '-',
                                currency: element.NCURRENCY,
                                desc_currency: element.CURRENCY_DESC,
                                state_pre: element.StatusPreleminary,
                                state_def: element.StatusDefinitive,
                                remaining_days_pre: element.RemainingDaysPre,
                                remaining_days_def: element.RemainingDaysDef,
                                sclient_contractor: element.ContractorSclient,
                                sclient_insured: element.InsuredSclient,
                                NID_STATE: element.NID_STATE,
                                prospect: element.IdProspect,
                                state_ispep: element.ISPEP,
                                state_isfampep: element.ISFAMPEP,
                                state_wispep: element.WSPEP,
                                state_dcispep: element.DCISPEP,
                                INSU_ISPEP: element.INSU_ISPEP,
                                INSU_ISFAMPEP: element.INSU_ISFAMPEP,
                                INSU_WSPEP: element.INSU_WSPEP,
                                INSU_DCISPEP: element.INSU_DCISPEP,
                                flag_file_cliente: element.FLAG_FILE_CLIENTE,
                                signature_type: element.NSIGNATURE_TYPE,
                                signature_status: element.NSTATE_SIGN,
                                sstatregt: element.SSTATREGT,
                                nintentos_cambio_firma: element.NINTENTOS_CAMBIO_FIRMA,
                                nstate_doc_toc: element.NSTATE_DOC_TOC
                            }
                            if (element.DEFFECT_DEFINITIVE != "") {
                                new_element.date_definitiva = `D-${element.DEFFECT_DEFINITIVE}`;
                            }
                            return new_element;
                        }
                    )
                } else {
                    if (request.QuotationNumber && request.QuotationNumber !== "0") {
                        Swal.fire('Información', 'No existe el número de cotización ingresado.', 'error');
                    } else if (
                        (request.ContractorFirstName && request.ContractorFirstName !== "0") ||
                        (request.ContractorPaternalLastName && request.ContractorPaternalLastName !== "0") ||
                        (request.ContractorMaternalLastName && request.ContractorMaternalLastName !== "0")
                    ) {
                        Swal.fire('Información', 'No existe el número de cotización para este tipo de cliente.', 'error');
                    }
                }
            }

            this.data = format_res;
        });

        this.currentPageNV = 1;
        this.totalItemsNV = this.data.length;
        this.listToShowNV = this.data.slice(
            (this.currentPageNV - 1) * this.itemsPerPageNV,
            this.currentPageNV * this.itemsPerPageNV
        );
    }
    
    async onSelectBoss() {
        
        if (this.search_params.type_boss.Id == 0) {
            this.TYPE_SUPERVIS = [];
            this.TYPE_SUPERVIS.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_supervision = { Id: 0 };

            this.TYPE_ADVISER = [];
            this.TYPE_ADVISER.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_adviser = { Id: 0 };
            return;
        }

        const request_validate_boss = {
            P_NFILTER: this.search_params.type_boss.Id,
            P_NIDUSERA: 0
        };

        this.TYPE_SUPERVIS = await this.quotationService.getSupervisorVIGP(request_validate_boss).toPromise();
        this.TYPE_SUPERVIS.unshift({ Id: 0, Name: 'TODOS' });
        this.search_params.type_supervision = { Id: 0};

        this.onSelectSupervision();
    }

    async onSelectSupervision() {

        // Selecciono todos en supervisores y trae a todos los asesores
        if (this.search_params.type_supervision.Id == 0) {
            this.TYPE_ADVISER = [];
            this.TYPE_ADVISER.unshift({ Id: 0, Name: 'TODOS' });
            this.search_params.type_adviser = { Id: 0, codigo: 0 };
            return;
        }

        const request_validate_supervision = {
            P_NFILTER: this.search_params.type_supervision.Id,
            P_NIDUSERA: 0
        };

        this.TYPE_ADVISER = await this.quotationService.getAsesorVIGP(request_validate_supervision).toPromise();
        this.TYPE_ADVISER.unshift({Id: 0, Name: 'TODOS'});
        this.search_params.type_adviser = { Id: 0, codigo: 0};
    }

    createQuotation(item) {
        this.router.navigate([`extranet/vida-inversion/nueva-cotizacion/${item.prospect}`]);
    }

    viewQuotation(item) {
        this.router.navigate([`extranet/vida-inversion/ver-cotizacion/${item.prospect}/${item.id_cotizacion}`]);
    }


    GoToQuoteDefinitiveUpd(item) {

        this.router.navigate([`extranet/vida-inversion/cotizacion-definitiva/${item.id_cotizacion}/${item.sclient_contractor}/${item.prospect}`]);
    }

    GoToQuoteDefinitive(item) {
        this.router.navigate([`extranet/vida-inversion/cotizacion-definitiva/${item.id_cotizacion}/${item.sclient_contractor}/${item.prospect}`]);
    }

    async GoToChangeFirma(item) {
        this.isLoading = true;
        try {
            const response = await this.vidaInversionService.UpdateCambioFirma({ NID_COTIZACION: item.id_cotizacion, NCAMBIO_FIRMA: 1 }).toPromise();
            
            if (response.P_NCODE === 0) {
                this.router.navigate([`extranet/vida-inversion/cotizacion-definitiva/${item.id_cotizacion}/${item.sclient_contractor}/${item.prospect}`])
            } else {
                Swal.fire('Error', "Ocurrió un error al actualizar estado cambiar la firma.", 'error');
            }
        }
        catch (error) {
            Swal.fire('Error', 'Ocurrió un error al actualizar estado cambiar la firma.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    //ARJG
    GoToDataPep(item) {
        this.router.navigate([`extranet/vida-inversion/cotizacion-datapep/${item.id_cotizacion}/${item.sclient_contractor}/${item.prospect}`]);
    }

    GotoSend() {
        Swal.fire({
            title: 'Confirmaciòn',
            text: '¿Està seguro que desea enviar la cotizaciòn?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
            allowEscapeKey: false,
        }).then(
            result => {
                if (result.value) {
                    Swal.fire({
                        title: 'Mensaje',
                        text: 'Se asignó correctamente la cotizaciòn al correo correo@correo.com .',
                        icon: 'success',
                        confirmButtonText: 'Siguiente',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: true
                        //html: 'Seleccion: ' + result
                    })
                }
            }
        )
    }

    GotoAnular(item) {
        Swal.fire({
            title: 'Anular cotización: ' + item.id_cotizacion,
            text: '¿Està seguro(a) que desea anular la cotizaciòn?',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            confirmButtonColor: "#2b0d61",
        }).then(result => {
            if (result.value) {
                const request_cancel_quote = {
                    QuotationNumber: item.id_cotizacion
                }
                this.quotationService.cancelCotizacionesVigentesVIGP(request_cancel_quote).toPromise()
                    .then((res) => {
                        if (res.P_COD_ERR == 1) {
                            Swal.fire({
                                title: 'Error',
                                text: res.P_MESSAGE,
                                confirmButtonText: 'Aceptar',
                                confirmButtonColor: "#2b0d61",
                            });
                            return
                        }
                        const index = this.listToShowNV.findIndex(quote => quote.id_cotizacion === item.id_cotizacion);
                        if (index !== -1) {
                            this.listToShowNV[index].desc_state = 'ANULADO';
                            this.listToShowNV[index].state_pre = 5;
                            this.listToShowNV[index].state_def = 5;
                            this.listToShowNV = this.listToShowNV.slice();
                        }

                        Swal.fire({
                            title: 'Mensaje',
                            text: 'La cotizaciòn fue anulada correctamente.',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showCloseButton: true,
                            confirmButtonColor: "#2b0d61",
                        });
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Error',
                            text: 'Ocurrió un error al anular la cotización.',
                            confirmButtonText: 'Aceptar',
                            confirmButtonColor: "#2b0d61",
                        });
                    });
            }
        });
    }

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        switch (modalName) {
            case 'see-leyend1':
                modalRef = this.modalService.open(AddLeyendComponent, {
                    size: 'md',
                    backdropClass: 'light-blue-backdrop',
                    backdrop: 'static',
                    keyboard: true,
                });
                modalRef.componentInstance.reference = modalRef;
                break;
            case 'see-leyend2':
                modalRef = this.modalService.open(AddLeyend1Component, {
                    size: 'md',
                    backdropClass: 'light-blue-backdrop',
                    backdrop: 'static',
                    keyboard: true,
                });
                modalRef.componentInstance.reference = modalRef;
                break;

        }
    }

    pageChangedNV(currentPageNV) {
        this.currentPageNV = currentPageNV;
        this.listToShowNV = this.data.slice(
            (this.currentPageNV - 1) * this.itemsPerPageNV,
            this.currentPageNV * this.itemsPerPageNV
        );
    }


    validateParamsSearch() {

        const list_error = { cod_error: 0, error_message: '' };

        // TIPO DE CLIENTE
        // if (this.search_params.client_type?.codigo == "0") {
        //     if (this.search_params.names != '' || this.search_params.last_name != '' || this.search_params.last_name2 != '') {
        //         list_error.cod_error = 1;
        //         list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        //     }
        // }

        // if (this.search_params.document_type?.codigo != "" && this.search_params.client_type?.codigo == "0")
        // {
        //     list_error.cod_error = 1;
        //     list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        // }
        // if (this.search_params.names != '' && this.search_params.client_type?.codigo == "0" )
        // {
        //     list_error.cod_error = 1;
        //     list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        // }
        // if (this.search_params.last_name != '' && this.search_params.client_type?.codigo == "0" )
        // {
        //     list_error.cod_error = 1;
        //     list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        // }
        // if (this.search_params.last_name2 != '' && this.search_params.client_type?.codigo == "0" )
        // {
        //     list_error.cod_error = 1;
        //     list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        // }

        // NÚMERO DE DOCUMENTO
        if (this.search_params.document_type?.codigo != "" && this.search_params.document_number == "") {
            list_error.cod_error = 1;
            if (this.search_params.client_type?.codigo != "0") {
                list_error.error_message += `Se debe ingresar el número de documento del ${this.search_params.client_type?.text}. <br>`;
            } else {
                list_error.error_message += `Se debe ingresar el número de documento. <br>`;
            }
        }
        if (this.search_params.document_number.length > 0 && this.search_params.document_number.length < 8 && this.search_params.document_type?.codigo == "2") {
            list_error.cod_error = 1;
            list_error.error_message += `Cantidad de caracteres del DNI incorrecto. <br>`;
        }
        if (
            this.search_params.document_number.length > 0 && this.search_params.document_number.length !== 10 && this.search_params.document_type?.codigo == "4"
        ) {
            list_error.error_message += `Cantidad de caracteres del CE incorrecto. <br>`;
        }

        // TIPO DE DOCUMENTO
        if (this.search_params.document_type?.codigo == "" && this.search_params.document_number != "") {
            list_error.cod_error = 1;
            if (this.search_params.client_type?.codigo != "0") {
                list_error.error_message += `Se debe seleccionar el tipo de documento del ${this.search_params.client_type?.text}. <br>`;
            } else {
                list_error.error_message += `Se debe seleccionar el tipo de documento. <br>`;
            }
        }

        // if (this.search_params.client_type["codigo"] == '') {
        //     list_error.cod_error = 1;
        //     list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        // } else {
        //     if (this.search_params.document_type.codigo == "2" && this.search_params.document_number.toString().length != 8) {
        //         list_error.cod_error = 1;
        //         list_error.error_message += 'Cantidad de caracteres del DNI incorrecto. <br>';
        //     }
        //     if (this.search_params.document_type.codigo == "4" && this.search_params.document_number.toString().length != 12) {
        //         list_error.cod_error = 1;
        //         list_error.error_message += 'Cantidad de caracteres de CE incorrecto. <br>';
        //     }
        // }

        return list_error;
    }

    async searchQuotations() {
        this.isLoading = true;
        
        try {
            const response_validate = this.validateParamsSearch();
            if (response_validate.cod_error == 1) {
                Swal.fire('Información', response_validate.error_message, 'error');
                return;
            }

            const request = {
                Nbranch: this.CONSTANTS.RAMO.toString(),
                ProductType: this.CONSTANTS.COD_PRODUCTO.toString(),
                User: this.cur_usr.id,
                Channel: this.cur_usr.canal,
                QuotationNumber: this.search_params.quotation ? this.search_params.quotation : "0",
                StateType: this.search_params.state_type.codigo ? this.search_params.state_type.codigo : "0",
                ClientType: this.search_params.client_type.codigo ? this.search_params.client_type.codigo : "0",
                ContractorDocumentType: this.search_params.document_type.Id ? this.search_params.document_type.Id.toString() : "0",
                ContractorDocumentNumber: this.search_params.document_number ? this.search_params.document_number.toString() : "0",
                ContractorFirstName: this.search_params.names ? this.search_params.names.toString() : "0",
                ContractorPaternalLastName: this.search_params.last_name ? this.search_params.last_name.toString() : "0",
                ContractorMaternalLastName: this.search_params.last_name2 ? this.search_params.last_name2.toString() : "0",
                NumberProfile: this.profile_id,
                AdviserType: this.search_params.type_adviser.Id,
                SupervisorType: this.search_params.type_supervision.Id,
                BossType: this.search_params.type_boss.Id,
            };


            await this.getListQuotation(request);
        }
        catch (error) {
            console.error('Error al buscar cotizaciones:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async clearParameters() {
        this.search_params.quotation = "",
            this.search_params.client_type = { codigo: "0", text: "AMBOS", valor: "AMBOS", COD_PRODUCT: "", DES_PRODUCT: "" };
        this.search_params.state_type = { codigo: "0", text: "TODOS", valor: "TODOS", COD_STATE: "", DES_STATE: "" };
        this.search_params.document_type = { Id: "", codigo: "" };
        this.search_params.document_number = "";
        this.search_params.names = "";
        this.search_params.last_name = "";
        this.search_params.last_name2 = "";
        this.search_params.type_adviser = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" };
        this.search_params.type_supervision = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" };
        this.search_params.type_boss = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" };

    }

    changeDocumentType() {
        this.search_params.document_number = "";
    }

    SendQuotation(QuotationNumber) {
        Swal.fire({
            title: 'Confirmación',
            text: '¿Está seguro de que desea enviar la cotización?',
            icon: 'warning',
            showCloseButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: true
        }).then(result => {
            if (result.value) {
                let params = {
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NID_COTIZACION: QuotationNumber,
                    P_NIDHEADERPROC: null,
                    P_NTYPE_DOCUMENT_SEND: 1
                }
                this.vidaInversionService.SendDocument(params).subscribe(
                    res => {
                        if (res.P_ERROR == 0) {
                            Swal.fire('Éxito', `Documento enviado exitosamente al correo del cliente.`, 'success');
                        } else {
                            Swal.fire('Error', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        Swal.fire('Error', 'Ha ocurrido un error al enviar la cotización.', 'error');
                    }
                )
            }
        })
    }

    AnularOption(item) {
        // profile_id == 192 && item.StatusPreleminary !== 5 && item.NID_STATE !== 8
        let response = false

        switch (this.profile_id) {
            case "192": // SOPORTE
                if (item.state_pre !== 5 && item.state_def !== 5 && ![8, 11].includes(item.NID_STATE)) {
                    response = true
                }
                break

            default:
                response = false
                break
        }

        return response
    }

    DefinitivaOption(item) {

        let response = false;

        switch (this.profile_id) {

            case "195": // JEFE COMERCIAL
                if (
                    (
                        item.state_ispep == 0 && item.state_isfampep == 0 && item.state_wispep == 0 &&
                        item.INSU_ISPEP == 0 && item.INSU_ISFAMPEP == 0 && item.INSU_WSPEP == 0 &&
                        item.NID_STATE == 0 && item.state_dcispep == 0 && item.INSU_DCISPEP == 0) ||
                    (item.NID_STATE == 15 && [1, 2, 3, 6].includes(item.state_pre) && item.state_def == 6)
                ) {
                    response = true;
                }
                break;

            case "194": // SUPERVISOR COMERCIAL
                if (
                    (
                        item.state_ispep == 0 && item.state_isfampep == 0 && item.state_wispep == 0 && item.NID_STATE == 0 &&
                        item.INSU_ISPEP == 0 && item.INSU_ISFAMPEP == 0 && item.INSU_WSPEP == 0 && item.NID_STATE == 0 && item.state_dcispep == 0 && item.INSU_DCISPEP == 0) ||
                    (item.NID_STATE == 15 && [1, 2, 3, 6].includes(item.state_pre) && item.state_def == 6)
                ) {
                    response = true;
                }
                break;

            default:
                response = false;
                break;
        }
        return response;
    }

    DatosPepOption(item) {
        let response = false;
        switch (this.profile_id) {
            case "191": // ACESOR COMERCIAL

                if (item.NID_STATE == 0 &&
                    (
                        item.state_ispep == 1 ||
                        item.state_isfampep == 1 ||
                        item.state_wispep == 1 ||
                        item.state_dcispep == 1 ||
                        item.INSU_ISPEP == 1 ||
                        item.INSU_ISFAMPEP == 1 ||
                        item.INSU_WSPEP == 1 ||
                        item.INSU_DCISPEP == 1
                    )) {
                    response = true;
                }
                break;

            // case "195": // JEFE COMERCIAL

            //     if ([1,4].includes(item.NID_STATE)) {
            //         response = true;
            //     }
            //     break;

            case "192": // Soporte
                if (item.NID_STATE == 17) {
                    response = true;
                }
                break;

            // case "203": // COORDINADOR COMERCIAL
            //     if (item.NID_STATE == 6) {
            //         response = true;
            //     }
            //     break;

            // case "196": // GERENTE COMERCIAL
            //     if (item.NID_STATE == 9) {
            //         response = true;
            //     }
            //     break;

            // case "194": // SUPERVISOR COMERCIAL
            //     if ([2,5].includes(item.NID_STATE)) {
            //         response = true;
            //     }
            //     break;
            // case "136": //  ANALISTA DE OPERACIONES
            //     if (item.NID_STATE == 14) {
            //         response = true;
            //     }
            //     break;

            default:
                response = false;
                break;

        }
        return response;
    }

    carmbioFirmaOption(item) {
        let response = false;

        if (this.profile_id == "192") {
            // signature_type: element.NSIGNATURE_TYPE,
            // signature_status: element.NSTATE_SIGN,
            // sstatregt: element.SSTATREGT,
            // nintentos_cambio_firma: element.NINTENTOS_CAMBIO_FIRMA,
            // nstate_doc_toc: element.NSTATE_DOC_TOC
            if ((item.sstatregt == 30 && item.NID_STATE == 14 && item.nintentos_cambio_firma == 1) // validacion para firma manuscrita
                || ([28, 30].includes(item.sstatregt) && [12, 14].includes(item.NID_STATE) && item.nintentos_cambio_firma == 1) // validacion para firma electronica
            ) {
                response = true;
            }
        }

        return response;
    }

    AttendOption(item) {

        let response = false;

        if ([5].includes(item.state_pre) || [5].includes(item.state_def)) {
            return false
        }

        switch (this.profile_id) {
            case "195": // JEFE COMERCIAL

                if ([1, 4].includes(item.NID_STATE)) {
                    response = true;
                }
                break;
            //DVP 02-04-2025
            case "192": // Soporte
                let canAttend = false;

                // Condiciones generales de atención para Soporte
                // item.flag_file_cliente => TBL_PD_COTIZA_STATES_VIGP.FLAG_FILE_CLIENTE
                if ([3, 7, 8, 10, 11, 12, 13].includes(item.NID_STATE) ||
                    (item.NID_STATE == 14 && item.flag_file_cliente == '2')) {
                    // (item.NID_STATE == 14 && item.flag_file_cliente == '1')) {
                    canAttend = true;
                }

                // Permite atender firma manuscrita en proceso pero incompleta
                if (item.signature_type == 1 && item.signature_status != 2 && item.NID_STATE == 12) {
                    canAttend = true;
                }

                // Nunca permite atender firma electrónica en proceso
                if (item.signature_type == 2 && item.NID_STATE == 12) {
                    canAttend = false;
                }

                response = canAttend;
                break;

            case "203": // COORDINADOR COMERCIAL
                if (item.NID_STATE == 6) {
                    response = true;
                }
                break;

            case "196": // GERENTE COMERCIAL
                if (item.NID_STATE == 9) {
                    response = true;
                }
                break;

            case "194": // SUPERVISOR COMERCIAL
                if ([2, 5].includes(item.NID_STATE)) {
                    response = true;
                }
                break;
            // case "136": //  ANALISTA DE OPERACIONES
            //     if (item.NID_STATE == 14) {
            //         response = true;
            //     }
            //     break;

            default:
                response = false;
                break;

        }
        return response;
    }

    downloadQuotation(item: any): void {
        this.isLoading = true;

        const quotationNumber = item.id_cotizacion;
        const documentType = "Cotizacion_vigp_template";

        if (!quotationNumber) {
            Swal.fire('Información', 'Número de cotización no especificado', 'info');
            this.isLoading = false;
            return;
        }

        this.vidaInversionService.downloadQuotationDocument(quotationNumber, documentType)
            .subscribe({
                next: (blob: Blob) => {
                    FileSaver.saveAs(
                        blob,
                        `Cotizacion_${quotationNumber}.pdf`
                    );
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error al descargar la cotización', error);
                    Swal.fire('Error', 'No se pudo descargar el documento', 'error');
                    this.isLoading = false;
                }
            });
    }
}
