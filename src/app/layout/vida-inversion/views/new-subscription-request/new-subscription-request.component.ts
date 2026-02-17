import { Component, OnInit } from "@angular/core";
import { VidaInversionConstants } from "../../vida-inversion.constants";
import { PolicyService } from "../../../broker/services/policy/policy.service";
import { QuotationService } from "../../../broker/services/quotation/quotation.service";
import { DataSuscription, DataSuscriptionRequest } from "../../models/DataSuscriptionRequest";
import { ActivatedRoute, Router } from "@angular/router";
import { VidaInversionService } from "../../services/vida-inversion.service";
import { ClientInformationService } from "../../../broker/services/shared/client-information.service";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddPropertyComponent } from "../../components/add-property/add-property.component";
import { AddDeclarationComponent } from "../../components/add-declaration/add-declaration.component";
import { AddRelationComponent } from "../../components/add-relation/add-relation.component";
import { AddWorkComponent } from "../../components/add-work/add-work.component";
import { ParameterSettingsService } from "../../../broker/services/maintenance/parameter-settings.service";
import { PolicyemitService } from "../../../broker/services/policy/policyemit.service";
import { AddPepComponent } from "../../components/add-pep/add-pep.component";
import { AddFamilyComponent } from "../../components/add-family/add-family.component";
import moment from "moment";
import { QuotationDocumentsComponent } from "../../components/quotation-documents/quotation-documents.component";

@Component({
    selector: 'app-new-subscription-request.component',
    templateUrl: './new-subscription-request.component.html',
    styleUrls: ['./new-subscription-request.component.css']
})
export class NewSubscriptionRequestComponent implements OnInit {

    P_NID_COTIZACION: any;
    P_NID_SOLICITUD: any;
    isLoading: boolean = false;
    pepBool: Boolean = false;
    comentario: string = "";
    comentarios: any[];
    coments: any[] = [];
    userComment: string;
    dateComment: string;


    current_step: number;
    cur_usr: any;
    search_service_wordcheck: any;
    search_service_idecon: any;

    value_work: any = 0;
    value_properties: any = 0;
    value_relationship: any = 0;
    value_declaration: any = 0;
    value_familiar_pep: any = 0;
    value_trabajos_pep: any = 0;
    value_inmuebles_pep: any = 0;
    value_parientes_pep: any = 0;
    value_personas_pep: any = 0;
    value_declaracion_pep: any = 0;

    showCoordinadorBtn: boolean = false;
    showGerenteBtn: boolean = false;
    showScoreBtn: boolean = true;
    scoring: string;
    montoSucripcion: string;
    works: any;
    response_create_solicitud: any;

    dataSuscription: DataSuscription = {
        P_NID_COTIZACION: 0,
        P_NID_PROC: "",
        P_NTYPE_SCORE: 0,
        P_NSTATE_SOLID: 0,
        P_NMONTO_SUSCRIPCION: 0,
        P_NAPORTE_TOTAL: 0,
        P_NVALOR_CUOTA: 0,
        P_DCHANGDAT: new Date,
        P_DCOMPDATE: new Date,
    };
    data_request_suscription: DataSuscriptionRequest = {
        APORTE_TOTAL: 0,
        NUMERO_DOCUMENTO: "",
        NUMERO_POLIZA: "",
        PROD_DESCRIPT: "",
        RAMO_DESCRIPT: "",
        CURRENCY_DESCRIPT: "",
        SCLIENT: "",
        MONTO_SUSCRIPCION: 0,
        FULL_NAME: "",
        LAST_NAME: ""
    }

    data_policy_emit_cab: any;
    montoSuscripcion: number;
    profile_id: any;
    mensaje: string;
    numeroConComas: string = '';
    cod_prod_channel: any;

    CONSTANTS: any = VidaInversionConstants;
    current_day: any = new Date;

    idecon_contractor: any = {
        otherList: 'NO',
        pep: 'NO',
        famPep: 'NO'
    }

    world_check_contractor: any = {
        otherList: 'NO',
        pep: 'NO'
    }


    experian_contractor: any = {
        riskClient: 'NO'
    }


    constructor(private quotationService: QuotationService,
        private policyemit: PolicyemitService,
        private activatedRoute: ActivatedRoute,
        private vidaInversionService: VidaInversionService,
        public clientInformationService: ClientInformationService,
        private modalService: NgbModal,
        private router: Router,
        private parameterSettingsService: ParameterSettingsService,
    ) { }

    async ngOnInit() {

        this.isLoading = true;
        this.current_step = 1;

        this.P_NID_COTIZACION = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);
        this.P_NID_SOLICITUD = this.activatedRoute.snapshot.params["solicitud"];
        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.userComment = this.cur_usr.firstName + ' ' + this.cur_usr.lastName;
        this.dateComment = moment(new Date()).format('DD/MM/YYYY hh:mm:ss a').toUpperCase();

        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);

        await this.policyemit.getPolicyEmitCab(this.P_NID_COTIZACION, "1", this.cur_usr.id).toPromise().then((res) => {
            this.data_policy_emit_cab = res.GenericResponse;
        });

        await this.quotationService.getRequestSuscription(this.P_NID_COTIZACION).toPromise().then((result) => {
            this.data_request_suscription = result.GenericResponse[0];
        });

        await this.getIdecon();
        await this.getWorldCheck();
        await this.invokeServiceExperia();
        await this.GetCommentsCotiVIGP();

        /* INI DATOS DE PRUEBAS */ 
        this.idecon_contractor.pep =  'NO';
        this.world_check_contractor.pep = 'NO';
        this.experian_contractor.riskClient = 'NO';
        /* FIN DATOS DE PRUEBAS */ 

        this.isLoading = false;
    }

    InsUpdCotiStatesVIGP = async () => {
        let item = {
            P_NID_COTIZACION: this.P_NID_COTIZACION,
            P_SSTATREGT_COT: 6,
            P_SCOMMENT: this.comentario,
            P_NUSERCODE: this.cur_usr.id
        }
        this.quotationService.InsUpdCotiStatesVIGP(item).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    //this.comentario = null;
                    Swal.fire('Información', res.P_SMESSAGE, 'info');
                    this.router.navigate(["extranet/vida-inversion/bandeja-solicitudes"]);
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'error');
                }

            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
            }
        );
    }

    formatearNumeroConComas(event: any) {

        let numero = event.target.value;
        this.montoSuscripcion = this.revertirFormateo(numero);
        numero = numero.replace(/[^\d.]/g, '');
        numero = numero.replace(/(\..*)\./g, '$1');
        const partes = numero.split('.');
        if (partes.length > 1) {
            partes[1] = partes[1].slice(0, 2);
            numero = partes.join('.');
        }
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        this.numeroConComas = partes.join('.');
    }

    revertirFormateo(numeroConComas: string): number {
        const numeroSinComas = numeroConComas.replace(/,/g, '');
        const numero = parseFloat(numeroSinComas).toFixed(2);
        return parseFloat(numero);
    }


    async getIdecon() {

        let datosIdecom = {};
        let consultIdecom = {
            P_SCLIENT: null,
            P_NOTHERLIST: 0,
            P_NISPEP: 0,
            P_NISFAMPEP: 0,
            P_NNUMBERFAMPEP: 0,
            P_SUPDCLIENT: 0
        };
        let sclientIdecom = { P_SCLIENT: this.data_policy_emit_cab.SCLIENT }

        datosIdecom = {
            name: this.data_request_suscription.FULL_NAME,
            idDocNumber: this.data_policy_emit_cab.NUM_DOCUMENTO,
            percentage: 100,
            typeDocument: ""
        }

        await this.vidaInversionService.ConsultaIdecom(sclientIdecom).toPromise().then(
            async (res) => {
                consultIdecom = {
                    P_SCLIENT: res.P_SCLIENT,
                    P_NOTHERLIST: res.P_NOTHERLIST,
                    P_NISPEP: res.P_NISPEP,
                    P_NISFAMPEP: res.P_NISFAMPEP,
                    P_NNUMBERFAMPEP: res.P_NNUMBERFAMPEP,
                    P_SUPDCLIENT: res.P_SUPDCLIENT
                }

                this.search_service_idecon = res.P_SUPDCLIENT;
                if (consultIdecom.P_SCLIENT == null || consultIdecom.P_SCLIENT == "") {
                    await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                        async (res) => {
                            consultIdecom = {
                                P_SCLIENT: this.data_policy_emit_cab.SCLIENT,
                                P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                P_NISPEP: res.isPep ? 1 : 0,
                                P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                P_SUPDCLIENT: 0
                            }

                            this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                            await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                        }
                    );
                } else {
                    if (consultIdecom.P_SUPDCLIENT == 1) {
                        await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                            async (res) => {
                                consultIdecom = {
                                    P_SCLIENT: this.data_policy_emit_cab.SCLIENT,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                    P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                    P_SUPDCLIENT: 1
                                }

                                this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            }
                        );
                    } else {
                        this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                        this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                        this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';
                    }
                }
            }
        );
    }

    async getWorldCheck() {

        let datosWorldCheck = {};

        let consultWorldCheck = {
            P_SCLIENT: null,
            P_NOTHERLIST: 0,
            P_NISPEP: 0,
            P_SUPDCLIENT: 0
        };

        let sclientWorldCheck = { P_SCLIENT: this.data_policy_emit_cab.SCLIENT }

        datosWorldCheck = {
            name: this.data_request_suscription.FULL_NAME,
            idDocNumber: this.data_policy_emit_cab.NUM_DOCUMENTO,
            typeDocument: ""
        }

        await this.vidaInversionService.ConsultaWorldCheck(sclientWorldCheck).toPromise().then(
            async (res) => {
                consultWorldCheck = {
                    P_SCLIENT: res.P_SCLIENT,
                    P_NOTHERLIST: res.P_NOTHERLIST,
                    P_NISPEP: res.P_NISPEP,
                    P_SUPDCLIENT: res.P_SUPDCLIENT
                }

                this.search_service_wordcheck = res.P_SUPDCLIENT;

                if (consultWorldCheck.P_SCLIENT == null || consultWorldCheck.P_SCLIENT == "") {
                    await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                        async (res) => {
                            consultWorldCheck = {
                                P_SCLIENT: this.data_policy_emit_cab.SCLIENT,
                                P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                P_NISPEP: res.isPep ? 1 : 0,
                                P_SUPDCLIENT: 0
                            }

                            this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                        }
                    );
                } else {

                    if (consultWorldCheck.P_SUPDCLIENT == 1) {
                        await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                            async (res) => {
                                consultWorldCheck = {
                                    P_SCLIENT: this.data_policy_emit_cab.SCLIENT,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_SUPDCLIENT: 1
                                }

                                this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                            }
                        );
                    } else {
                        this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                        this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';
                    }
                }
            }
        );
    }



    async invokeServiceExperia() {

        let datosServiceExperia = {};

        datosServiceExperia = {
            tipoid: this.data_policy_emit_cab.TIPO_DOCUMENTO.toString(),
            id: this.data_policy_emit_cab.NUM_DOCUMENTO.toString(),
            papellido: this.data_request_suscription.LAST_NAME,
            sclient: this.data_policy_emit_cab.SCLIENT,
            usercode: this.cur_usr.id
        }

        await this.vidaInversionService.invokeServiceExperia(datosServiceExperia).toPromise().then(
            async res => {
                this.experian_contractor.riskClient = res.nflag == 0 ? 'SÍ' : 'NO';
            }
        );
    }





    validateRequest() {

        let type_message: SweetAlertIcon;

        // console.log(this.search_service_idecon);
        // console.log(this.search_service_wordcheck);
        // console.log(this.idecon_contractor.pep);
        // console.log(this.idecon_contractor.famPep);
        // console.log(this.world_check_contractor.pep);
        //console.log(this.montoSuscripcion);


        //this.search_service_wordcheck ==> Si ES  MAYOR A 6 MESES 1, SINO 0

        const response_status = {
            cod_error: 0, /* 0 = No entra a ninguna validación,  1 = Monto Menor a lo permitido, 2 = Debe derivar para el proceso de firmas, 3 = NO se debe generar la solicitud (se rechaza), 4 = Debe derivar para realizar Scoring de Riesgos, 5 = Mostrar ventanas para completar Datos Pep */
            smessage: "",
            title: 'Información',
            type_message,
            profile_to_derivate: 0
        }


        if (!this.montoSuscripcion) { // Campo de monto de suscripcion vacio
            response_status.cod_error = 1;
            response_status.smessage = "Ingresar un monto de suscripción.";
            response_status.type_message = "warning";
            return response_status;
        }

        if (this.montoSuscripcion < 1000.00) {
            response_status.cod_error = 1;
            response_status.smessage = "El aporte debe ser mayor o igual a US$ 1,000.";
            response_status.type_message = "warning";
            return response_status;
        }


        if (this.montoSuscripcion <= 50000.00) {  // DERIVA AL PERFIL SOPORTE para firmas
            response_status.cod_error = 2;
            response_status.type_message = "success";
            response_status.profile_to_derivate = 192;
            return response_status;
        }

        // if (this.montoSuscripcion > 50000.00) { // Si el Laft es positivo NO DEBE GEENRAR LA SOLICITUD
        //     response_status.cod_error = 3;
        //     response_status.type_message = "error";
        //     return response_status;
        // }

        if (this.montoSuscripcion > 50000.00 && (this.search_service_idecon == 1 || this.search_service_wordcheck == 1) && (this.idecon_contractor.pep == 'NO' && this.idecon_contractor.famPep == "NO" && this.world_check_contractor.pep == "NO")) {  // FALTA AGREGAR LAFT NEGATIVO, DERIVA AL PERFIL SOPORTE para Scorging de Riesgo
            response_status.cod_error = 4;
            response_status.type_message = "success";
            response_status.profile_to_derivate = 192;
            return response_status;
        }


        if (this.montoSuscripcion > 50000.00 && (this.search_service_idecon == 1 || this.search_service_wordcheck == 1) && (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == "SÍ" || this.world_check_contractor.pep == "SÍ")) { //  FALTA AGREGAR LAFT NEGATIVO, Derivación Soporte Comercial para Scoring de Riesgos
            response_status.cod_error = 5;
            return response_status;
        }


        if (this.montoSuscripcion > 50000.00 && (this.search_service_idecon == 0 || this.search_service_wordcheck == 0) && (this.idecon_contractor.pep == 'NO' && this.idecon_contractor.famPep == "NO" && this.world_check_contractor.pep == "NO")) { // Derivación a Soporte Comercial por Scoring de Riesgos
            response_status.cod_error = 4;
            response_status.profile_to_derivate = 192;
            response_status.type_message = "success";
            return response_status;
        }

        if (this.montoSuscripcion > 50000.00 && (this.search_service_idecon == 0 || this.search_service_wordcheck == 0) && (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == "SÍ" || this.world_check_contractor.pep == "SÍ")) { // Debe completar datos Pep 
            response_status.cod_error = 5;
            return response_status;
        }

        return response_status;
    }

    async generateRequest() {

        const response_validate_amount = this.validateRequest();
        console.log(response_validate_amount);

        if (response_validate_amount.cod_error == 1) {
            Swal.fire(response_validate_amount.title, response_validate_amount.smessage, response_validate_amount.type_message);
        }

        else if (response_validate_amount.cod_error == 2) {

            this.response_create_solicitud = await this.createSolicitud();

            if (this.response_create_solicitud.P_NCODE == 1) {
                Swal.fire('Información', this.response_create_solicitud.P_SMESSAGE, 'error');
                return;
            }
            // OJO SE ENVIA EL ESTADO EN CULA VA ESTAR, NO EL PERFIL DEL USUARIO QUE VA DERIVAR
            await this.InsDeriv(response_validate_amount.profile_to_derivate, `se generó el N° ${this.response_create_solicitud.P_NID_SOLICUTD} de solicitud, se derivó al perfil de Soporte Comercial para su atención.`, this.response_create_solicitud.P_NID_PROC);
        }

        else if (response_validate_amount.cod_error == 3) {
            Swal.fire(response_validate_amount.title, response_validate_amount.smessage, response_validate_amount.type_message);
            return;
        }

        else if (response_validate_amount.cod_error == 4) {
            this.response_create_solicitud = await this.createSolicitud();

            if (this.response_create_solicitud.P_NCODE == 1) {
                Swal.fire('Información', this.response_create_solicitud.P_SMESSAGE, 'error');
                return;
            }

            // OJO SE ENVIA EL ESTADO EN CULA VA ESTAR, NO EL PERFIL DEL USUARIO QUE VA DERIVAR
            await this.InsDeriv(response_validate_amount.profile_to_derivate, `se generó el N° ${this.response_create_solicitud.P_NID_SOLICUTD} de solicitud, se derivó al perfil de Soporte Comercial para su atención.`, this.response_create_solicitud.P_NID_PROC);
        }

        else if (response_validate_amount.cod_error == 5) {
            this.current_step = this.current_step + 1;
        }
    }

    goToSolicitudesList() {
        this.router.navigate([`extranet/vida-inversion/bandeja-solicitudes`]);
    }

    SelDatosPEPVIGP = () => {
        this.vidaInversionService.SelDatosPEPVIGP({ P_NID_COTIZACION: this.P_NID_COTIZACION, P_SCLIENT: this.data_policy_emit_cab.SCLIENT }).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    this.value_familiar_pep = res.P_NSECCION_1;
                    this.value_trabajos_pep = res.P_NSECCION_2;
                    this.value_inmuebles_pep = res.P_NSECCION_3;
                    this.value_parientes_pep = res.P_NSECCION_4;
                    this.value_personas_pep = res.P_NSECCION_5;
                    this.value_declaracion_pep = res.P_NSECCION_6;

                    if (this.value_familiar_pep == 1 && this.value_parientes_pep == 1 && this.value_personas_pep == 1 && this.value_declaracion_pep == 1) {
                        this.pepBool = true;
                    } else {
                        this.pepBool = false;
                    }
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error obteniendo los datos PEP.", 'error');
            }
        )
    }

    openPepModal = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddPepComponent, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openPepFamily = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddFamilyComponent, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openRelationsModal() {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddRelationComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openDeclarationModal() {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddDeclarationComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openPropertyModal = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddPropertyComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openPepWorkModal = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddWorkComponent, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.quotation_id = this.P_NID_COTIZACION;
        modalRef.componentInstance.reference.sclient = this.data_policy_emit_cab.SCLIENT;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }

    openModalDocuments = () => {
        if (this.pepBool) {

            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(QuotationDocumentsComponent, {
                size: 'lg',
                backdropClass: 'light-blue-backdrop',
                backdrop: 'static',
                keyboard: true,
            });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.cotizacion = this.P_NID_COTIZACION;
        }
    }

    previusStep() {
        this.current_step = this.current_step - 1;
    }

    generateRequestPep() {
        console.log(this.comentario);
        if (this.comentario.trim() == "" || this.comentario.trim() == " ") {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        }

        if (this.value_familiar_pep == 0 || this.value_parientes_pep == 0 || this.value_personas_pep == 0 || this.value_declaracion_pep == 0 || this.value_inmuebles_pep == 0 || this.value_trabajos_pep == 0) {
            Swal.fire('Información', 'Debe completar todos las datos para poder continuar.', 'warning');
        }
    }

    GetCommentsCotiVIGP = async () => {
        await this.quotationService.GetCommentsCotiVIGP({ P_NID_COTIZACION: this.P_NID_COTIZACION, P_NID_PROC: this.dataSuscription.P_NID_PROC }).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.comentarios = res.C_TABLE;
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
            }
        );
    }

    InsDeriv = async (state, mess, nid_proc) => {

        let item = {
            P_NID_COTIZACION: this.P_NID_COTIZACION,
            P_NID_PROC: nid_proc,
            P_NID_STATE_DER: state,
            P_SCOMMENT: "",
            P_NUSERCODE: this.cur_usr.id
        }
        await this.quotationService.InsCommentsCotiVIGP(item).toPromise().then((res) => {
            console.log(res);

            Swal.fire(
                {
                    title: 'Información',
                    text: mess,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showCloseButton: false
                }
            ).then(
                (result) => {
                    if (result.value) {
                        this.router.navigate([`extranet/vida-inversion/bandeja-solicitudes`]);
                    }
                }
            );
        });
    };

    InsCommentsCotiVIGP = async (state, mess, nid_proc) => {

        if (this.coments.length == 0) {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        } else {

            for (let i = 0; i < this.coments.length; i++) {
                let item = {
                    P_NID_COTIZACION: this.P_NID_COTIZACION,
                    P_NID_PROC: nid_proc,
                    P_NID_STATE_DER: state,
                    P_SCOMMENT: this.coments[i].coment,
                    P_NUSERCODE: this.cur_usr.id
                }
                await this.quotationService.InsCommentsCotiVIGP(item).toPromise();
            }

            Swal.fire(
                {
                    title: 'Información',
                    text: mess,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showCloseButton: false
                }
            ).then(
                (result) => {
                    if (result.value && state != 12) {
                        this.router.navigate([`extranet/vida-inversion/bandeja-solicitudes`]);
                    }
                }
            );
        }
    }


    async createSolicitud() {

        const request = {
            P_NPOLICY: parseInt(this.data_policy_emit_cab.NPOLICY),
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_NAMOUNT_CONTRIBUTION: this.montoSuscripcion,
            P_NID_COTIZACION: parseInt(this.P_NID_COTIZACION),
            P_NUSERCODE: parseInt(this.cur_usr.id)
        };
        let response;

        await this.quotationService.InsSolicitud(request).toPromise().then(res => {
            response = res;
        });
        return response;
    }

    coment = () => {
        if (this.comentario == null || this.comentario == '') {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        } else {
            let item = { coment: this.comentario };
            this.coments.push(item);
            this.comentario = '';
        }
    }

}