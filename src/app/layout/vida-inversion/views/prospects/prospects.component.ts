import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AccPersonalesService } from '@root/layout/broker/components/quote/acc-personales/acc-personales.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApproveNegativeRecordComponent } from '../../components/approve-negative-record/approve-negative-record.component';
import { SearchParamsProspect } from '../../models/SearchParamsProspect';

@Component({
    templateUrl: './prospects.component.html',
    styleUrls: ['./prospects.component.scss']

})
export class ProspectsComponent implements OnInit {

    channelSales$: Array<any>;
    branches$: Array<any>;
    product$: Array<any>;
    date_init: string
    executiveComercial$: Array<any>;
    data: Array<any>;
    intermeds: [];
    intermedsObj: {};
    type_client_select: string = null;

    
    

    FormFilter: FormGroup;
    CONSTANTS: any = VidaInversionConstants;
    CHANNEL: any;
    RAMO: any;
    PRODUCT: any
    TYPE_CLIENT: any;
    TYPE_DOCUMENT: any;
    NUMBER_DOCUMENT: any;
    BOSS: any;
    SUPERVISOR: any;
    ADVISER: any;
    EJECUTIVO: any;
    isLoading: boolean = false;
    cur_usr: any;

    TYPE_ADVISER: any = [];
    TYPE_SUPERVIS: any = [];
    TYPE_BOSS: any = [];


    search_params: SearchParamsProspect = {
        client_type: {},
        document_type: {
            Id: "",
            codigo: ""
        },
        document_number: "",
        names: "",
        last_name: "",
        last_name2: "",

        type_adviser: "",
        type_supervision: "",
        type_boss: ""
    }

    // PROSPECTOS
    prospects_list: any = [];
    currentPage = 1;
    itemsPerPage = 9;
    totalItems = 0;
    maxSize = 10;
    profile_id: any;
    cod_prod_channel: any;

    constructor(
        public accPersonalesService: AccPersonalesService,
        private router: Router,
        public clientInformationService: ClientInformationService,
        private vidaInversionService: VidaInversionService,
        public quotationService: QuotationService,
        private parameterSettingsService: ParameterSettingsService,
        private modalService: NgbModal
    ) { }

    async ngOnInit() {

        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        this.isLoading = true;

        this.CHANNEL = [{ codigo: this.cur_usr.canal, valor: this.cur_usr.desCanal }];
        this.RAMO = [{ codigo: this.CONSTANTS.RAMO, valor: this.CONSTANTS.RAMO_DESC }];
        this.PRODUCT = [{ codigo: this.CONSTANTS.COD_PRODUCTO, valor: this.CONSTANTS.DESC_PRODUCTO }];

        this.TYPE_CLIENT = [
            { codigo: "0", valor: 'AMBOS' },
            { codigo: "1", valor: 'CONTRATANTE' },
            { codigo: "2", valor: 'ASEGURADO' },
        ];

        this.TYPE_DOCUMENT = [
            { codigo: "0", valor: 'SELECCIONE' },
            { codigo: "1", valor: 'DNI' },
            { codigo: "2", valor: 'CARNET DE EXTRANJERÍA-CE' },
        ];

        try {

            this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);

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

                this.TYPE_BOSS.unshift({ Id: 0, Name: 'TODOS'});
                this.search_params.type_boss = { Id: 0 };

                this.TYPE_SUPERVIS = [{ Id: 0, Name: 'TODOS'}];
                this.search_params.type_supervision = { Id: 0 };

                this.TYPE_ADVISER = [{ Id: 0, Name: 'TODOS'}];
                this.search_params.type_adviser = { Id: 0 };
            }

            // let params_request = {
            //     P_SUSERNAME: this.profile_id == 191 ? this.cur_usr.username : null,
            //     P_NPROFILE: this.profile_id,
            //     P_NIDUSER: this.cur_usr.id
            // };

            let params_request = {
                P_NCHANNEL: this.CHANNEL[0].codigo,
                P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                P_NTYPE_CLIENT: parseInt(this.search_params.client_type["codigo"]),
                P_NTYPE_DOCUMENT: this.search_params.document_type["codigo"] == "" ? 0 : parseInt(this.search_params.document_type["codigo"]),
                P_SNUMBER_DOCUMENT: this.search_params.document_number,
                P_SNAMES: this.search_params.names,
                P_SLASTNAME: this.search_params.last_name,
                P_SLASTNAME2: this.search_params.last_name2,
                P_SUSERNAME: this.cur_usr.username, // Username current user
                P_NPROFILE: this.profile_id, // Profile current user
                P_NIDUSER: this.cur_usr.id, // ID current user
                P_NADVISER: this.search_params.type_adviser.Id,
                P_NSUPERVISOR: this.search_params.type_supervision.Id,
                P_NBOSS: this.search_params.type_boss.Id
            }

            console.log(params_request);

            const res = await this.vidaInversionService.getProspects(params_request).toPromise();

            this.data = res;
            this.currentPage = 1;
            this.totalItems = this.data.length;
            this.prospects_list = this.data.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );

            // await this.clearParameters();

        } catch (error) {
            console.log("error: ", error)
        } finally {
            this.isLoading = false;
        }
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.prospects_list = this.data.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    get f(): { [key: string]: AbstractControl } {
        return this.FormFilter.controls;
    }

    GoToNewProspesct() {
        this.router.navigate(['extranet/vida-inversion/nuevo-prospecto']);
    }

    GoToNewQuotation(item) {
        /*INI VIGP 17112025*/
        if (
            ([item.NRIESGON, item.NIDECON_CONT, item.NWC_CONT].includes(1) && [0, 2].includes(item.NESTADO_RIESGON)) ||
            ([item.NRIESGON_INSU, item.NIDECON_INSU, item.NWC_INSU].includes(1) && [0, 2].includes(item.NESTADO_RIESGON_INSU))
        ) {
            Swal.fire({
                text: 'Para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información',
                icon: 'info',
                iconColor: '#ed6e00',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then((result) => {
                console.log("result: ", result)
            })

            return;
        }
        /*FIN VIGP 17112025*/

        this.router.navigate([`extranet/vida-inversion/nueva-cotizacion/${item.ID_PROSPECT}`]);
    }

    /*INI VIGP 17112025 */
    handleViewApproveRN(item) {
        if (this.profile_id != 192) return false;
        if (
            ([item.NRIESGON, item.NIDECON_CONT, item.NWC_CONT].includes(1) && [0, 2].includes(item.NESTADO_RIESGON)) ||
            ([item.NRIESGON_INSU, item.NIDECON_INSU, item.NWC_INSU].includes(1) && [0, 2].includes(item.NESTADO_RIESGON_INSU))
        ) {
            return true;
        }
    }

    /*INI VIGP 17112025*/
    async GoToAprobar(item) {
        console.log("item: ", item)
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(ApproveNegativeRecordComponent, { size: 'md', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.ID_PROSPECT = item.ID_PROSPECT;
        modalRef.componentInstance.reference.NAME_CONTRACTOR = item.NAME_CONTRACTOR;

        modalRef.result.then(
            async (res) => {
                console.log("res-approve_negative: ", res)
                if (res.is_success) {
                    await this.searchProspects();
                }
            }
        )
    }
    /*FIN VIGP 17112025*/


    GotoReassignment(item) {
        this.getIntermeds(item.NINTERMED);
        Swal.fire({
            title: 'Información',
            text: 'Este prospecto ya esta asignado, ¿estás seguro que deseas realizar una reasignación?',
            icon: 'question',
            iconColor: '#ed6e00',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
            allowEscapeKey: false,
        }).then(
            result => {
                if (result.value) {
                    const example = Swal.fire({
                        title: 'Reasignar',
                        text: 'Nombre del nuevo asignado',
                        input: 'select',
                        inputOptions: this.intermedsObj,
                        inputPlaceholder: 'SELECCIONAR',
                        confirmButtonText: 'Siguiente',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: true,
                        onOpen: () => Swal.getConfirmButton().focus(),
                        inputValidator: (value) => {
                            return new Promise((resolve) => {
                                if (value === "") {
                                    resolve("Debe seleccionar");
                                }
                                else {
                                    this.reasignarIntermediario(item.ID_PROSPECT, value);
                                }
                            })

                        },
                    })
                }
            }
        )
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

    async searchProspects() {

        const response_validate = this.validateParamsSearch();

        if (response_validate.cod_error == 1) {
            Swal.fire('Información', response_validate.error_message, 'error');
            return;
        }

        try {

            this.isLoading = true;

            let params_request = {
                P_NCHANNEL: this.CHANNEL[0].codigo,
                P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                P_NTYPE_CLIENT: parseInt(this.search_params.client_type["codigo"]),
                P_NTYPE_DOCUMENT: this.search_params.document_type["codigo"] == "" ? 0 : parseInt(this.search_params.document_type["codigo"]),
                P_SNUMBER_DOCUMENT: this.search_params.document_number,
                P_SNAMES: this.search_params.names,
                P_SLASTNAME: this.search_params.last_name,
                P_SLASTNAME2: this.search_params.last_name2,
                P_SUSERNAME: this.cur_usr.username, // Username current user
                P_NPROFILE: this.profile_id, // Profile current user
                P_NIDUSER: this.cur_usr.id, // ID current user
                P_NADVISER: this.search_params.type_adviser.Id,
                P_NSUPERVISOR: this.search_params.type_supervision.Id,
                P_NBOSS: this.search_params.type_boss.Id
            }

            if (params_request.P_SNUMBER_DOCUMENT === "") {
                params_request.P_NTYPE_DOCUMENT = 0;
            }

            const res = await this.vidaInversionService.getProspects(params_request).toPromise();

            this.data = res;
            this.currentPage = 1;
            this.totalItems = this.data.length;
            this.prospects_list = this.data.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );

            if (res.length == 0) {
                Swal.fire('Información', 'No se encontró información según los criterios de búsqueda ingresados.', 'error');
                return;
            }

        } catch (error) {
            console.log("error: ", error)
        } finally {
            this.isLoading = false;
        }
    }


    validateParamsSearch() {

        const list_error = { cod_error: 0, error_message: '' };

        // NÚMERO DE DOCUMENTO
        if (this.search_params.document_type["codigo"] != "" && this.search_params.document_number == "") {
            list_error.cod_error = 1;
            if (this.search_params.client_type["codigo"] != "0") {
                list_error.error_message += `Se debe ingresar el número de documento del ${this.search_params.client_type["text"]}. <br>`;
            } else {
                list_error.error_message += `Se debe ingresar el número de documento. <br>`;
            }
        }
        if (this.search_params.document_number.length > 0 && this.search_params.document_number.length < 8 && this.search_params.document_type["codigo"] == "2") {
            list_error.cod_error = 1;
            list_error.error_message += `Cantidad de caracteres del DNI incorrecto. <br>`;
        }
        if (this.search_params.document_number.length > 0 && this.search_params.document_number.length < 8 && this.search_params.document_type["codigo"] == "4") {
            list_error.cod_error = 1;
            list_error.error_message += `Cantidad de caracteres del CE incorrecto. <br>`;
        }

        // TIPO DE DOCUMENTO
        if (this.search_params.document_type["codigo"] == "" && this.search_params.document_number != "") {
            list_error.cod_error = 1;
            if (this.search_params.client_type["codigo"] != "0") {
                list_error.error_message += `Se debe seleccionar el tipo de documento del ${this.search_params.client_type["text"]}. <br>`;
            } else {
                list_error.error_message += `Se debe seleccionar el tipo de documento. <br>`;
            }
        }

        return list_error;
    }



    validateParamsSearchLegacy() {

        // this.search_params.document_type["codigo"] POR DEFECTO ESTÁ HACIENDO 2, QUE ES DNI

        const list_error = { cod_error: 0, error_message: '' };
        console.log(this.search_params.client_type);

        if (this.search_params.client_type["codigo"] == '') {
            list_error.cod_error = 1;
            list_error.error_message += 'Es obligatorio seleccionar el tipo de cliente. <br>';
        }
        else {
            this.type_client_select = this.search_params.client_type["valor"];
        }

        return list_error;
    }

    getIntermeds = (item) => {
        this.vidaInversionService.getIntermeds({ P_NINTERMED: item }).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    this.intermeds = res.C_TABLE;
                    this.intermedsObj = res.P_LIST;
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'warning')
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los intermediarios.', 'error')
            }
        )
    }

    reasignarIntermediario = (prospect, intermed) => {
        this.vidaInversionService.reasignarIntermediario({ P_NID_PROSPECT: prospect, P_NINTERMED: intermed }).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', 'Se asignó correctamente.', 'success')
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'warning')
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al asignar el intermediario.', 'error')
            }
        )
    }

    async clearParameters() {

        this.search_params.client_type = { COD_PRODUCT: "0" };
        this.search_params.document_type = { Id: "", codigo: "" };
        this.search_params.document_number = "";
        this.search_params.names = "";
        this.search_params.last_name = "";
        this.search_params.last_name2 = "";
        this.search_params.type_boss = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" }
        this.search_params.type_adviser = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" }
        this.search_params.type_supervision = { codigo: "0", text: "TODOS", valor: "TODOS", Id: "", Name: "" }
    }

    changeDocumentType() {
        this.search_params.document_number = "";
    }

}
