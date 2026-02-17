import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddBeneficiaryComponent } from '../../components/add-beneficiary/add-beneficiary.component';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { AddressService } from '../../../broker/services/shared/address.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { DataInsured } from '../../models/DataInsured';
import { DataContractor } from '../../models/DataContractor';
import { AccPersonalesService } from '../../../broker/components/quote/acc-personales/acc-personales.service';
import { CommonMethods } from '../../../broker/components/common-methods';
import { QuotationService } from '../../../../layout/broker/services/quotation/quotation.service';
import { StorageService } from '../../../broker/components/quote/acc-personales/core/services/storage.service';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import { AddSocietarioComponent } from '../../components/add-societario/add-societario.component';

@Component({
    templateUrl: './new-quotation.component.html',
    styleUrls: ['./new-quotation.component.scss']
})

export class NewQuotationComponent implements OnInit {

    quotation_id: number = 0;
    profile_id: any;
    masterChecked: boolean = false;
    CONSTANTS: any = VidaInversionConstants;
    cod_prod_channel: any;

    boolNumberCTR: boolean = false;
    boolNumberASG: boolean = false;
    boolEmailCTR: boolean = false;
    boolEmailASG: boolean = false;
    @Input() check_input_value;
    @Input() check_input_value_beneficiary = 0;

    @Input() check_input_nationality;  //ARJG VIGP
    @Input() check_input_relationship; //ARJG VIGP
    @Input() check_input_fiscal_obligations;  //ARJG VIGP
    @Input() check_input_obligated_subject;     // VIGP-KAFG 02/04/2025
    @Input() check_input_calidad_socio; // VIGP-KAFG 09/07/2025


    @Input() check_input_insu_nationality;  //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_relationship; //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_fiscal_obligations;  //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_obligated_subject;     // VIGP-KAFG 02/04/2025
    @Input() check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025

    contractor_province_department: any = false;
    contractor_province_selected: any = false;
    insured_province_department: any = false;
    insured_province_selected: any = false;
    show_guide: boolean = false;
    isLoading: boolean = false;

    current_step: number;
    cur_usr: any;
    list: any;
    type_rol: any;
    prospect_id: number;
    format_amount: any;
    parse_amount_contribution: any;
    s_usr: any;
    investment: any = [];
    list_plan: any = [];

    TIME: any = [];
    CURRENCY: any = [];
    DEPARTMENT: any;
    PROVINCE: any;
    DISTRICT: any;


    desc_scoring: any = "-";
    recomendacion: any = "";
    sum_scoring: any = '';


    list_data_contractor_department: any = [];
    list_data_contractor_province: any = [];
    list_data_contractor_district: any = [];

    list_data_insured_department: any = [];
    list_data_insured_province: any = [];
    list_data_insured_district: any = [];
    list_civil_state_contractor: any = [];
    list_civil_state_insured: any = [];

    list_nationalities_contractor: any = [];
    list_nationalities_insured: any = [];

    list_occupation_contractor: any = [];  //ARJG VIGP

    GENDER_LIST: any[] = [];
    list_benefeciary: any = [];
    list_societarios_cont: any = []; // VIGP-KAFG 10/07/2025
    list_societarios_insu: any = []; // VIGP-KAFG 10/07/2025
    list_document_type_contractor: any = [];
    listadoCotizacionesVigentes: any;
    listadoCotizacionesNoVigentes: any;
    steps_list: any;
    chekedsumamaxima: boolean = false;
    current_quotation_selected: any;
    data_contractor_step1: any;
    are_many_plans: boolean;
    are_many_funds: boolean;

    current_quotation: any;

    perfilamiento: any = {
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        question6: "",
        perfilamiento_exist: false,
        question1_disabled: false,
        question2_disabled: false,
        question3_disabled: false,
        question4_disabled: false,
        question5_disabled: false,
        question6_disabled: false
    }

    options_perfilamiento_question1 = [];
    options_perfilamiento_question2 = [];
    options_perfilamiento_question3 = [];
    options_perfilamiento_question4 = [];
    options_perfilamiento_question5 = [];
    options_perfilamiento_question6 = [];
    list_occupation_id: any = {
        Id: 0,
        Name: ""
    }

    data_complementary: any = {
        occupation_status: 0,
        occupation_status_disabled: false,
        centro_trabajo: '',// VIGP-KAFG 08/07/2025
        cargo: '',// VIGP-KAFG 08/07/2025
        texto_obligated_subject: '',// VIGP-KAFG 08/07/2025
    }

    // INI VIGP-KAFG 04/04/2025
    data_occuptacion_insu: any = {
        occupation_status: 0,
        occupation_status_disabled: false,
        centro_trabajo: '', // VIGP-KAFG 08/07/2025
        cargo: '', // VIGP-KAFG 08/07/2025
        texto_obligated_subject: '', // VIGP-KAFG 08/07/2025
    }
    // FIN VIGP-KAFG 04/04/2025


    data_quotation_complementary: any = {
        P_NID_PROSPECT: 0,
        P_NTYPE_CLIENT: 0,  // VIGP-KAFG 04/04/2025
        P_SNUMBER_DOCUMENT: '',  // VIGP-KAFG 04/04/2025
        P_NOCCUPATION: 0,
        P_NNATUSA: 3,
        P_NCONPARGC: 3,
        P_NOFISTRI: 3,
        P_NOBLIGATED_SUBJECT: 3, // VIGP-KAFG 02/04/2025
        P_USER: 0,
        P_SCENTRO_TRABAJO: '',// VIGP-KAFG 08/07/2025
        P_SCARGO: '',// VIGP-KAFG 08/07/2025
        P_NCALIDAD_SOCIO: 3, // VIGP-KAFG 09/07/2025
        P_SOCIETARIOS: [] // VIGP-KAFG 09/07/2025
    }

    // INI VIGP-KAFG 03/04/2025
    data_complementary_insu: any = {
        P_NID_PROSPECT: 0,
        P_NTYPE_CLIENT: 0,
        P_SNUMBER_DOCUMENT: '',
        P_NOCCUPATION: 0,
        P_NNATUSA: 3,
        P_NCONPARGC: 3,
        P_NOFISTRI: 3,
        P_NOBLIGATED_SUBJECT: 3,
        P_USER: 0,
        P_SCENTRO_TRABAJO: '',// VIGP-KAFG 08/07/2025
        P_SCARGO: '',// VIGP-KAFG 08/07/2025
        P_NCALIDAD_SOCIO: 3, // VIGP-KAFG 09/07/2025
        P_SOCIETARIOS: [] // VIGP-KAFG 09/07/2025
    }
    // FIN VIGP-KAFG 03/04/2025

    //ACTUALIZAR REGISTRO
    nregister_contractor = 0;
    nregister_insured = 0;
    nregister_parentesco: any;
    nregister_nnatusa = 0;
    nregister_nobligated_subject = 0; // VIGP-KAFG 02/04/2025
    nregister_calidad_socio = 0; // VIGP-KAFG 09/07/2025
    nregister_nconpargc = 0;
    nregister_nofistri = 0;
    nregister_noccupation = 0;
    nregister_scentro_trabajo = ''; // VIGP-KAFG 08/07/2025
    nregister_scargo = ''; // VIGP-KAFG 08/07/2025
    nregister_contractor_dire = 0;
    nregister_contractor_corr = 0;
    nregister_contractor_telf = 0;
    nregister_insured_dire = 0;
    nregister_insured_corr = 0;
    nregister_insured_telf = 0;

    // INI VIGP-KAFG 03/04/2025
    nregister_insu_nnatusa = 0;
    nregister_insu_nobligated_subject = 0;
    nregister_insu_calidad_socio = 0; // VIGP-KAFG 09/07/2025
    nregister_insu_nconpargc = 0;
    nregister_insu_nofistri = 0;
    nregister_insu_noccupation = 0;
    // FIN VIGP-KAFG 03/04/2025
    nregister_insu_scentro_trabajo = ''; // VIGP-KAFG 08/07/2025
    nregister_insu_scargo = ''; // VIGP-KAFG 08/07/2025

    // BENEFICIARIOS
    listToShowBeneficiaries: any = [];
    currentPageBeneficiaries = 1; // currentPage = 1;
    itemsPerPage = 2;
    totalItems = 0;
    maxSize = 10;

    // COTIZACIONES VIGENTES
    // listToShowV: any = [];
    listToShowCurrentQuotation: any = [];
    currentPageCurrentQuotation = 1; // currentPageV = 1;
    itemsPerPageV = 4;
    totalItemsV = 0;
    maxSizeV = 10;

    // COTIZACIONES NO VIGENTES
    // listToShowNV: any = [];
    listToShowQuotationNotAllowed: any = [];
    currentPageQuotationNotAllowed = 1;// currentPageNV = 1;
    itemsPerPageNV = 4;
    totalItemsNV = 0;
    maxSizeNV = 10;
    check_input_value_360: any; //Valor si el Contratante === Asegurado o no que es traido de BD
    inactivityTimer: any;

    new_client_insured = false; // Indica si es cliente Ya se encuentra registrado en el 360 o no

    check_input_nationality_disabled = true; //ARJG VIGP
    check_input_relationship_disabled = true; //ARJG VIGP
    check_input_fiscal_obligations_disabled = true; //ARJG VIGP
    check_input_obligated_subject_disabled = true; //VIGP-KAFG 02/04/2025
    check_input_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025

    // INI VIGP-KAFG 03/04/2025
    check_input_insu_nationality_disabled = true;
    check_input_insu_relationship_disabled = true;
    check_input_insu_fiscal_obligations_disabled = true;
    check_input_insu_obligated_subject_disabled = true;
    check_input_insu_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025
    // INI VIGP-KAFG 03/04/2025


    diaActual = moment(new Date()).toDate();
    fecha_fin_poliza: string;
    fecha_fin_asegurado: string

    /* DGC - VIGP PEP - 06/02/2024 - INICIO */
    idecon_contractor: any = {
        otherList: 'NO',
        pep: 'NO',
        famPep: 'NO'
    }

    idecon_insured: any = {
        otherList: 'NO',
        pep: 'NO',
        famPep: 'NO'
    }

    //ARJG
    world_check_contractor: any = {
        otherList: 'NO',
        pep: 'NO'
    }

    world_check_insured: any = {
        otherList: 'NO',
        pep: 'NO'
    }

    experian_contractor: any = {
        riskClient: 'NO'
    }

    experian_insured: any = {
        riskClient: 'NO'
    }

    /* DGC - VIGP PEP - 06/02/2024 - FIN */

    quotation = {
        contribution: "",
        currency: { NCODIGINT: "", SDESCRIPT: "" },
        funds: { NcoreFund: "", Sdescript: "", NidInvestmentFund: "" },
        date_fund: new Date(),
    }

    min_date_fund: any = new Date();
    max_date_fund: any = new Date();

    holidays : string[] = [];

    data_contractor: DataContractor = {
        sclient: "",
        type_document: "",
        document_number: "",
        birthday_date: "",
        names: "",
        last_name: "",
        last_name2: "",
        gender: "",
        civil_status: "",
        nationality: "",
        department: "",
        province: "",
        district: "",
        phone: "",
        email: "",
        address: "",
        idecon: 0,
        wc:0,

        type_document_disabled: true,
        document_number_disabled: true,
        birthday_date_disabled: true,
        names_disabled: true,
        last_name_disabled: true,
        last_name2_disabled: true,
        gender_disabled: true,
        civil_status_disabled: false,
        nationality_disabled: false,
        department_disabled: false,
        province_disabled: false,
        district_disabled: false,
        phone_disabled: false,
        email_disabled: false,
        address_disabled: false,
    };


    data_insured: DataInsured = {
        sclient: "",
        type_document: "",
        document_number: "",
        birthday_date: "",
        names: "",
        last_name: "",
        last_name2: "",
        gender: "",
        civil_status: "",
        nationality: "",
        department: {},
        province: {},
        district: {},
        phone: "",
        email: "",
        address: "",
        idecon: 0,
        wc:0,

        type_document_disabled: false,
        document_number_disabled: false,
        birthday_date_disabled: true,
        names_disabled: true,
        last_name_disabled: true,
        last_name2_disabled: true,
        gender_disabled: true,
        civil_status_disabled: false,
        nationality_disabled: false,
        department_disabled: false,
        province_disabled: false,
        district_disabled: false,
        phone_disabled: false,
        email_disabled: false,
        address_disabled: false,
    };

    data_contractor_360: DataContractor = { // Info traida 360 Directamente
        sclient: "",
        type_document: "",
        document_number: "",
        birthday_date: "",
        names: "",
        last_name: "",
        last_name2: "",
        gender: "",
        civil_status: "",
        nationality: "",
        department: [],
        province: [],
        district: [],
        phone: "",
        email: "",
        address: "",
    };

    data_insured_360: DataInsured = { // Info traida 360 Directamente
        sclient: "",
        type_document: "",
        document_number: "",
        birthday_date: "",
        names: "",
        last_name: "",
        last_name2: "",
        gender: "",
        civil_status: "",
        nationality: "",
        department: [],
        province: [],
        district: [],
        phone: "",
        email: "",
        address: "",
    };

    homologacionCont: string = "——";  // VIGP-KAFG 16/04/2025 
    homologacionInsu: string = "——";  // VIGP-KAFG 16/04/2025 

    riesgo_negativo_insu: string = "——";  // VIGP 13112025
    riesgo_negativo_cont: string = "——";  // VIGP 13112025

    FL_DATA_QUALITY: boolean = false;

    /*INI VIGP 17112025 */
    old_prospect_data = {
        P_NTYPE_DOCUMENT_CONT: null,
        P_SNUMBER_DOCUMENT_CONT: null,
        P_NTYPE_DOCUMENT_INSU: null,
        P_SNUMBER_DOCUMENT_INSURED: null,
        P_NID_ASCON: 0,
        
        P_NRIESGON_CONT: 0,
        P_NIDECON_CONT: 0,
        P_WCHECK_CONT: 0,
        P_NESTADO_RIESGON_CONT: 0,

        P_NRIESGON_INSU: 0,
        P_NIDECON_INSU: 0,
        P_WCHECK_INSU: 0,
        P_NESTADO_RIESGON_INSU: 0,
    }
    /*INI VIGP 17112025 */

    constructor(private router: Router,
        private storageService: StorageService,
        public clientInformationService: ClientInformationService,
        public addressService: AddressService,
        private vidaInversionService: VidaInversionService,
        private quotationService: QuotationService,
        private readonly activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private acc_personales_service: AccPersonalesService,
        private parameterSettingsService: ParameterSettingsService
    ) { }

    async ngOnInit() {

        this.isLoading = true;

        this.FL_DATA_QUALITY = await this.CONSTANTS.getIsActiveDataQuality(this.vidaInversionService);

        this.quotation_id = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);

        this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 
        this.homologacionInsu = "——";  // VIGP-KAFG 16/04/2025 

        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.prospect_id = parseInt(this.activatedRoute.snapshot.params["prospecto"]);
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.type_rol = '0';

        this.check_input_value = 1;

        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);

        this.data_complementary.occupation_status_disabled = false; //ARJG VIGP
        this.check_input_nationality_disabled = false; //ARJG VIGP
        this.check_input_relationship_disabled = false; //ARJG VIGP
        this.check_input_fiscal_obligations_disabled = false; //ARJG VIGP
        this.check_input_obligated_subject_disabled = false; // VIGP-KAFG 02/04/2025 
        this.check_input_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025

        // INI VIGP-KAFG 02/04/2025
        this.data_occuptacion_insu.occupation_status_disabled = false;
        this.check_input_insu_nationality_disabled = false;
        this.check_input_insu_relationship_disabled = false;
        this.check_input_insu_fiscal_obligations_disabled = false;
        this.check_input_insu_obligated_subject_disabled = false;
        // INI VIGP-KAFG 02/04/2025
        this.check_input_insu_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025

        // INI Para el Contratante
        await this.clientInformationService.getDocumentTypeList(this.cod_prod_channel).toPromise().then((result) => {
            this.list_document_type_contractor = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getGenderList().toPromise().then(async (res: any[]) => {
            // this.list_gender_contractor = res;
            this.GENDER_LIST = res.filter(gender => gender.SSEXCLIEN === '1' || gender.SSEXCLIEN === '2');
        })

        await this.clientInformationService.getCivilStatusList().toPromise().then(async (result) => {
            this.list_civil_state_contractor = result;
        }).catch((err) => {
        });

        // Ocupacion
        await this.clientInformationService.getOccupationTypeList().toPromise().then((result) => {
            this.list_occupation_contractor = result;
        })


        await this.clientInformationService.getNationalityList().toPromise().then((result) => {
            this.list_nationalities_contractor = result;
        }).catch((err) => {
        });
        // FIN Para el Contratante

        // INI Para el Asegurado
        await this.clientInformationService.getCivilStatusList().toPromise().then((result) => {
            this.list_civil_state_insured = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getNationalityList().toPromise().then((result) => {
            this.list_nationalities_insured = result;
        }).catch((err) => {
        })
        // FIN Para el Asegurado

        await this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).toPromise().then((result) => {
            this.CURRENCY = result;
        }).catch((err) => {
        });

        const request_plans = {
            Nbranch: this.CONSTANTS.RAMO,
            Nproduct: this.CONSTANTS.COD_PRODUCTO
        };

        await this.vidaInversionService.getListaPlanes(request_plans).toPromise().then((result) => {

            if (result.IsSuccessful == false) {
                this.isLoading = false;
                Swal.fire('Información', "Ocurrió un problema al consultar los planes del tarifario.", 'error');
                return;
            }

            if (result.Data.Aplans.length == 0) {
                this.isLoading = false;
                Swal.fire('Información', "No se pudieron obtener planes.", 'error');
                return;
            }

            this.list_plan = result.Data.Aplans;
            this.list_plan.length == 1 ? this.are_many_plans = false : this.are_many_plans = true;

            // Si solo Existe un plan se Seleccionara automaticamente.
            if (!this.are_many_plans) {

                this.list_plan[0].Ofunds = this.list_plan[0].Ofunds.filter(item => item.Bstate === true);
                // this.list_plan[0].Ofunds.length == 1 ? this.are_many_funds = false : this.are_many_funds = true;
                this.investment = this.list_plan[0].Ofunds;

                // if (!this.are_many_funds) {
                //     console.log(this.investment);
                //     // this.investment = this.list_plan[0].Ofunds[0];
                //     console.log(this.investment);

                // }
            }
            else {
                this.investment = this.list_plan[0].Ofunds.filter(item => item.Bstate === true);
            }

        }).catch((err) => {
            console.error('Ocurrió un error al consultar los planes del tarifario.');
        });


        const request_search_prospect = { P_NID_PROSPECT: this.prospect_id };
        await this.vidaInversionService.searchByProspect(request_search_prospect).toPromise().then(async res => {
            console.log("RES PROSPECT: ", res);
            this.data_contractor.type_document = { Id: res.TYPE_DOC_CONTRACTOR }
            this.data_contractor.document_number = res.DOC_CONTRACTOR;

            /*INI VIGP 17112025*/
            this.old_prospect_data.P_NTYPE_DOCUMENT_CONT = Number(res.TYPE_DOC_CONTRACTOR);
            this.old_prospect_data.P_SNUMBER_DOCUMENT_CONT = res.DOC_CONTRACTOR == "null" ? null : res.DOC_CONTRACTOR;
            this.old_prospect_data.P_NTYPE_DOCUMENT_INSU = Number(res.TYPE_DOC_INSURED);
            this.old_prospect_data.P_SNUMBER_DOCUMENT_INSURED = res.DOC_INSURED == "null" ? null : res.DOC_INSURED;
            this.old_prospect_data.P_NID_ASCON = Number(res.NID_ASCON);
            this.old_prospect_data.P_NRIESGON_CONT = res.NRIESGON;
            this.old_prospect_data.P_NIDECON_CONT = res.NIDECON_CONT;
            this.old_prospect_data.P_WCHECK_CONT = res.NWC_CONT;
            this.old_prospect_data.P_NESTADO_RIESGON_CONT = res.NESTADO_RIESGON;
            this.old_prospect_data.P_NRIESGON_INSU = res.NRIESGON_INSU;
            this.old_prospect_data.P_NIDECON_INSU = res.NIDECON_INSU;
            this.old_prospect_data.P_WCHECK_INSU = res.NWC_INSU;
            this.old_prospect_data.P_NESTADO_RIESGON_INSU = res.NESTADO_RIESGON_INSU;
            /*FIN VIGP 17112025*/

            const params_360 = {
                P_TIPOPER: 'CON',
                P_NUSERCODE: this.cur_usr.id,
                P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                P_SIDDOC: this.data_contractor.document_number,
            };

            await this.clientInformationService.getCliente360(params_360).toPromise().then(async res => {
                if (res.P_NCODE === "0") {
                    if (res.EListClient[0].P_SCLIENT == null) {
                    } else {
                        if (res.EListClient.length === 1) {
                            if (res.EListClient[0].P_SIDDOC != null) {
                                res.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, res.EListClient[0].P_SCLIENT);
                                if (res.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2 && this.FL_DATA_QUALITY) {
                                    this.data_contractor.document_number = "";
                                    this.data_contractor.type_document = { Id: 0 };
                                    // this.clearData(1);

                                    this.isLoading = false;
                                    Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error')
                                        .then((result) => {
                                            console.log("result: ", result);
                                            this.router.navigate(['extranet/vida-inversion/prospectos']);
                                        });
                                } else {
                                    await this.cargarDatosContractor(res, 1);
                                    if (params_360.P_NIDDOC_TYPE == 2) {
                                        this.data_contractor.nationality_disabled = true;
                                        this.data_contractor.civil_status_disabled = true;
                                    }
                                    // if(!this.FL_DATA_QUALITY) this.enableInputs(1,false);
                                    console.log("Ingresa consulta data prospect....")
                                    await this.getDataIdeconClient(1); // TEMP 070082025
                                    await this.getWorldCheck(1); // ARJG 
                                    await this.invokeServiceExperia(1); // ARJG
                                    await this.getDataRegNegativoClient(1); /*VIGP 17112025 */
                                    await this.ConsultDataComplementary(1);  //ARJG
                                    await this.consultDataProspect(1);
                                    this.data_contractor_360 = { ...this.data_contractor }; // Guardando la info del Contratante traida del 360
                                }

                                /*INI VIGP 17112025*/
                                const validate_registro_negativo = this.validateRegistroNegativo();
                                if(validate_registro_negativo){
                                    this.isLoading = false;
                                    // await Swal.fire('Información', 'El contratante o asegurado se encuentran en otras listas de idecon, world check o riesgo negativo, el prospecto sera actualizado.', 'error');
                                    this.isLoading = true;
                                    await this.updateDataClient360(null, true); /*VIGP 17112025*/
                                    return;
                                }
                                /*FIN VIGP 17112025*/
                            }
                        }
                    }
                }
                else if (res.P_NCODE === "2" || res.P_NCODE === "1" || res.P_NCODE === "3") {
                    this.clearData(1);
                    // if(!this.FL_DATA_QUALITY)this.enableInputs(1,false);
                    this.isLoading = false;
                    Swal.fire('Información', res.P_SMESSAGE, 'error');
                    return;
                }
            }, error => {
                this.isLoading = false;
                Swal.fire('Información', 'Ocurrió un problema al solicitar su petición.', 'error');
                return;
            });
        })
        
        

        this.list_benefeciary = []; // Lista de Beneficiarios

        // INI Paginacion Beneficiarios
        this.currentPageBeneficiaries = 1;
        this.totalItems = this.list_benefeciary.length;
        this.listToShowBeneficiaries = this.list_benefeciary.slice(
            (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
            this.currentPageBeneficiaries * this.itemsPerPage
        );
        // FIN Paginacion Beneficiarios

        this.steps_list = [
            {
                step_index: 1,
                tittle: "Datos del Contratante/Asegurado"
            },
            {
                step_index: 2,
                tittle: "Perfilamiento"
            },
            {
                step_index: 3,
                tittle: "Nueva Cotización"
            }
        ]

        this.quotation.date_fund = new Date();
        await this.GetHolidays();
        // this.min_date_fund = new Date();// Fecha Abono sólo se permitirá seleccionar la fecha del día o fechas futuras (máximo 3 días hábiles), la cual será editable en la oficialización.
        // this.min_date_fund.setDate(this.min_date_fund.getDate() - 7);
        // this.max_date_fund.setDate(this.max_date_fund.getDate() + 7);
        this.min_date_fund = this.sumarDiasHabiles(new Date(), 6, 'min'); // Fecha Abono sólo se permitirá seleccionar la fecha del día o fechas futuras (máximo 7 días hábiles), la cual será editable en la oficialización.
        this.max_date_fund = this.sumarDiasHabiles(new Date(), 7, 'max'); // Fecha Abono sólo se permitirá seleccionar la fecha del día o fechas futuras (máximo 7 días hábiles), la cual será editable en la oficialización.

        this.current_step = 1;

        if (this.s_usr != null) {
            this.mostrarCotizacionesVigentesXusuario();
            this.mostrarCotizacionesNoVigentesXusuario();

            await this.vidaInversionService.getScoringOptions().toPromise().then((res) => {

                this.options_perfilamiento_question1 = res.filter((item) => item.P_NQUESTION === 1);
                this.options_perfilamiento_question2 = res.filter((item) => item.P_NQUESTION === 2);
                this.options_perfilamiento_question3 = res.filter((item) => item.P_NQUESTION === 3);
                this.options_perfilamiento_question4 = res.filter((item) => item.P_NQUESTION === 4);
                this.options_perfilamiento_question5 = res.filter((item) => item.P_NQUESTION === 5);
                this.options_perfilamiento_question6 = res.filter((item) => item.P_NQUESTION === 6);

            });
        }

        this.isLoading = false;
    }

    sumarDiasHabiles(fecha: Date, diasHabiles: number, type: string): Date {
        let contador = 0;
        let resultado = new Date(fecha);

        while (contador < diasHabiles) {
            resultado.setDate(resultado.getDate() + (type === 'min' ? -1 : 1));
            const dia = resultado.getDay();

            const currDate = resultado.toISOString().slice(0, 10);
            const isHoliday = this.holidays.some(holiday => holiday == currDate);
            // día 0 = domingo, día 6 = sábado
            if (dia !== 0 && dia !== 6 && !isHoliday) {
                contador++;
            }
        }

        return resultado;
    }

    async GetHolidays() {
        const data = await this.vidaInversionService.getHolidays().toPromise();
        this.holidays = data;
    }

    async getIsActiveDataQuality(){
        const data = await this.vidaInversionService.getIsActiveDataQuality("71").toPromise();
        if(data == 1) this.FL_DATA_QUALITY = true;
        else {
            this.FL_DATA_QUALITY = false;
            // this.enableInputs(1);
        }
    }

    async ConsultDataComplementary(search_type) {

        let params_cons = {
            P_NID_PROSPECT: this.prospect_id,
            P_NTYPE_CLIENT: search_type,  // VIGP-KAFG 04/04/2025
            P_SNUMBER_DOCUMENT: search_type == 1 ? this.data_contractor.document_number : this.data_insured.document_number,  // VIGP-KAFG 04/04/2025
        };

        const response_consult_datacomplementary = await this.vidaInversionService.ConsultDataComplementary(params_cons).toPromise();
        if (search_type == 1) { // VIGP-KAFG 04/04/2025
            // Si idecon_contractor.pep o world_check_contractor.pep son "SÍ", entonces establecer check_input_relationship como 1
            if (this.idecon_contractor.pep === 'SÍ' || this.world_check_contractor.pep === 'SÍ') {
                this.check_input_relationship = 1;
            } else if (this.idecon_contractor.famPep === 'SÍ') {
                this.check_input_relationship = 1;
            } else {
                this.check_input_relationship = response_consult_datacomplementary.P_NCONPARGC;
            }

            this.check_input_nationality = response_consult_datacomplementary.P_NNATUSA;
            this.check_input_fiscal_obligations = response_consult_datacomplementary.P_NOFISTRI;
            this.check_input_obligated_subject = response_consult_datacomplementary.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
            this.check_input_calidad_socio = response_consult_datacomplementary.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
            this.data_complementary.occupation_status = { Id: response_consult_datacomplementary.P_NOCCUPATION }
            this.data_complementary.centro_trabajo = response_consult_datacomplementary.P_SCENTRO_TRABAJO == 'null' ? "" : response_consult_datacomplementary.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
            this.data_complementary.cargo = response_consult_datacomplementary.P_SCARGO == 'null' ? "" : response_consult_datacomplementary.P_SCARGO; // VIGP-KAFG 08/07/2025
            this.list_societarios_cont = response_consult_datacomplementary.P_SOCIETARIOS;
            // .map(societario => {
            //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
            //     return societario;
            // }); // VIGP-KAFG 10/07/2025

            this.nregister_nnatusa = response_consult_datacomplementary.P_NNATUSA;
            this.nregister_nconpargc = response_consult_datacomplementary.P_NCONPARGC;
            this.nregister_nofistri = response_consult_datacomplementary.P_NOFISTRI;
            this.nregister_noccupation = response_consult_datacomplementary.P_NOCCUPATION;
            this.nregister_scentro_trabajo = response_consult_datacomplementary.P_SCENTRO_TRABAJO == 'null' ? "" : response_consult_datacomplementary.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
            this.nregister_scargo = response_consult_datacomplementary.P_SCARGO == 'null' ? "" : response_consult_datacomplementary.P_SCARGO; // VIGP-KAFG 08/07/2025
            this.nregister_nobligated_subject = response_consult_datacomplementary.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
            this.nregister_calidad_socio = response_consult_datacomplementary.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025

            // INI VIGP-KAFG 04/04/2025
        }
        else {
            // Si idecon_contractor.pep o world_check_contractor.pep son "SÍ", entonces establecer check_input_relationship como 1
            if (this.idecon_insured.pep === 'SÍ' || this.world_check_insured.pep === 'SÍ') {
                this.check_input_insu_relationship = 1;
            } else if (this.idecon_insured.famPep === 'SÍ') {
                this.check_input_insu_relationship = 1;
            } else {
                this.check_input_insu_relationship = response_consult_datacomplementary.P_NCONPARGC;
            }

            this.check_input_insu_nationality = response_consult_datacomplementary.P_NNATUSA;
            this.check_input_insu_fiscal_obligations = response_consult_datacomplementary.P_NOFISTRI;
            this.check_input_insu_obligated_subject = response_consult_datacomplementary.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
            this.check_input_insu_calidad_socio = response_consult_datacomplementary.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
            this.data_occuptacion_insu.occupation_status = { Id: response_consult_datacomplementary.P_NOCCUPATION }
            this.data_occuptacion_insu.centro_trabajo = response_consult_datacomplementary.P_SCENTRO_TRABAJO == 'null' ? "" : response_consult_datacomplementary.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
            this.data_occuptacion_insu.cargo = response_consult_datacomplementary.P_SCARGO == 'null' ? "" : response_consult_datacomplementary.P_SCARGO; // VIGP-KAFG 08/07/2025
            this.list_societarios_insu = response_consult_datacomplementary.P_SOCIETARIOS;
            // .map(societario => {
            //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
            //     return societario;
            // });

            this.nregister_insu_nnatusa = response_consult_datacomplementary.P_NNATUSA;
            this.nregister_insu_nconpargc = response_consult_datacomplementary.P_NCONPARGC;
            this.nregister_insu_nofistri = response_consult_datacomplementary.P_NOFISTRI;
            this.nregister_insu_noccupation = response_consult_datacomplementary.P_NOCCUPATION;
            this.nregister_insu_scentro_trabajo = response_consult_datacomplementary.P_SCENTRO_TRABAJO == 'null' ? "" : response_consult_datacomplementary.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
            this.nregister_insu_scargo = response_consult_datacomplementary.P_SCARGO == 'null' ? "" : response_consult_datacomplementary.P_SCARGO; // VIGP-KAFG 08/07/2025
            this.nregister_insu_nobligated_subject = response_consult_datacomplementary.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
            this.nregister_insu_calidad_socio = response_consult_datacomplementary.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
        }

        this.changeOccupation(search_type); //KAFG VIGP
    };

    changeDocumentType(search_type: any) {
        if (search_type == 1) {
            this.data_contractor.document_number = "";
        } else {
            this.data_insured.document_number = "";
        }
    }

    changeOccupation(typeClient: number): void {
        if (typeClient == 1) {
            if ([3, 4, 8].includes(this.data_complementary.occupation_status.Id)) {
                this.data_complementary.texto_obligated_subject = "(*)";
            } else {
                this.data_complementary.texto_obligated_subject = "";
            }
        } else {
            if ([3, 4, 8].includes(this.data_occuptacion_insu.occupation_status.Id)) {
                this.data_occuptacion_insu.texto_obligated_subject = "(*)";
            } else {
                this.data_occuptacion_insu.texto_obligated_subject = "";
            }
        }
    }

    search = (search_type: any) => {

        if (search_type == 1) {
            let errCode = 0;
            let errMsg = '';
            if (this.data_contractor.type_document.codigo == null || this.data_contractor.type_document.codigo == "") {
                errCode = 1;
                errMsg += 'Seleccione el tipo de documento del contratante. <br>';
            }
            if (this.data_contractor.document_number == null || this.data_contractor.document_number == "") {
                errCode = 1;
                errMsg += 'Ingrese el número de documento del contratante. <br>';
            }
            if (errCode == 1) {
                Swal.fire('Información', errMsg, 'warning');
                return;
            }
        }

        if (search_type == 2) {
            let errCode = 0;
            let errMsg = '';
            if (this.data_insured.type_document.codigo == null || this.data_insured.type_document.codigo == "") {
                errCode = 1;
                errMsg += 'Seleccione el tipo de documento del asegurado. <br>';
            }
            if (this.data_insured.document_number == null || this.data_insured.document_number == "") {
                errCode = 1;
                errMsg += 'Ingrese el número de documento del asegurado. <br>';
            }
            if (errCode == 1) {
                Swal.fire('Información', errMsg, 'warning');
                return;
            }
        }

        if (this.check_input_value == 0) {
            if (this.data_contractor.document_number && this.data_insured.document_number) {
                if (this.data_contractor.document_number == this.data_insured.document_number) {
                    if (search_type == 1) {
                        Swal.fire('Información', 'El documento ingresado se encuentra registrado como asegurado, cambiar la opción a SI en caso el contratante y asegurado sean el mismo.', 'warning');
                        return;
                    } else {
                        Swal.fire('Información', 'El documento ingresado se encuentra registrado como contratante, cambiar la opción a SI en caso el contratante y asegurado sean el mismo.', 'warning');
                        return;
                    }
                }
            }
        }

        this.clickBuscar(search_type);
    }

    pageChangedBeneficiaries(currentPage) {
        this.currentPageBeneficiaries = currentPage;
        this.listToShowBeneficiaries = this.list_benefeciary.slice(
            (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
            this.currentPageBeneficiaries * this.itemsPerPage
        );
    }

    pageChangedCurrentQuotation(currentPageV) {
        this.currentPageCurrentQuotation = currentPageV;
        this.listToShowCurrentQuotation = this.listadoCotizacionesVigentes.slice(
            (this.currentPageCurrentQuotation - 1) * this.itemsPerPageV,
            this.currentPageCurrentQuotation * this.itemsPerPageV
        );
    }

    pageChangedQuotationNotAllowed(currentPageNV) {
        this.currentPageQuotationNotAllowed = currentPageNV;
        this.listToShowQuotationNotAllowed = this.listadoCotizacionesNoVigentes.slice(
            (this.currentPageQuotationNotAllowed - 1) * this.itemsPerPageNV,
            this.currentPageQuotationNotAllowed * this.itemsPerPageNV
        );
    }

    changeValue(value) {
        this.check_input_value = value;
        if (this.check_input_value == 0) {
            this.show_guide = true;
            setTimeout(() => {
                this.show_guide = false;
            }, 5000);
        }
    }

    onSelectDepartament() {
        this.contractor_province_department = true;
        this.contractor_province_selected = false;
        this.data_contractor.province = { Id: null };
        this.data_contractor.district = { Id: null };
        this.list_data_contractor_district = [];

        this.addressService.getProvinceList(this.data_contractor?.department?.Id).toPromise().then(res => {
            this.list_data_contractor_province = res;
            this.data_contractor.province = { Id: 0 };
        });
    }

    onSelectProvince() {
        this.contractor_province_selected = true;
        this.list_data_contractor_district = [];

        this.addressService.getDistrictList(this.data_contractor?.province?.Id).toPromise().then(res => {
            this.list_data_contractor_district = res;
            this.data_contractor.district = { Id: null };
        });
    }

    onSelectDepartamentInsured() {
        this.insured_province_department = true;
        this.insured_province_selected = false;
        this.data_insured.province = { Id: null };
        this.data_insured.district = { Id: null };
        this.list_data_insured_district = [];

        this.addressService.getProvinceList(this.data_insured?.department?.Id).toPromise().then(res => {
            this.list_data_insured_province = res;
            this.data_insured.province = { Id: 0 };
        });
    }

    onSelectProvinceInsured() {
        this.insured_province_selected = true;
        this.list_data_insured_district = [];

        this.addressService.getDistrictList(this.data_insured?.province?.Id).toPromise().then(res => {
            this.list_data_insured_district = res;
            this.data_insured.district = { Id: null };
        });
    }

    changeValueBenefeciary(value) {
        this.check_input_value_beneficiary = value;
    }

    // INI VIGP-KAFG 04/04/2025
    changeValueNationality(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_nationality = value;
        else this.check_input_insu_nationality = value;
    }
    // FIN VIGP-KAFG 04/04/2025

    // INI VIGP-KAFG 04/04/2025
    changeValueObligatedSubject(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_obligated_subject = value;
        else this.check_input_insu_obligated_subject = value;
    }
    // FIN VIGP-KAFG 04/04/2025

    // INI VIGP-KAFG 09/07/2025
    changeValueCalidadDeSocio(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_calidad_socio = value;
        else this.check_input_insu_calidad_socio = value;
    }
    // FIN VIGP-KAFG 09/07/2025


    // INI VIGP-KAFG 04/04/2025
    changeValueRelationship(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_relationship = value;
        else this.check_input_insu_relationship = value;
    }
    // FIN VIGP-KAFG 04/04/2025


    // INI VIGP-KAFG 04/04/2025
    changeValueFiscal_obligations(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_fiscal_obligations = value;
        else this.check_input_insu_fiscal_obligations = value;
    }
    // FIN VIGP-KAFG 04/04/2025


    previusStep(value) {
        this.current_step = value;
    }

    async changeStep(next_step) {

        if (next_step == 2) {

            const response_validate_step2 = this.validateStep2();

            if (response_validate_step2.cod_error == 1) {
                Swal.fire('Información', response_validate_step2.message_error, 'error');
                return;
            }

            /*INI VIGP 17112025*/
            const validate_registro_negativo = this.validateRegistroNegativo();
            if(validate_registro_negativo){
                // await Swal.fire('Información', 'El contratante o asegurado se encuentran en otras listas de idecon, world check o riesgo negativo, el prospecto sera actualizado.', 'error');
                await this.updateDataClient360(null, true); /*VIGP 17112025*/
                return;
            }
            /*FIN VIGP 17112025*/

            if (this.check_input_value == 1) {
                Swal.fire({
                    title: 'Confirmación',
                    text: '¿Esta seguro que el contratante es igual al asegurado?',
                    icon: 'warning',
                    confirmButtonText: 'SI',
                    cancelButtonText: 'NO',
                    showCancelButton: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then(
                    result => {
                        if (result.isConfirmed) { //AFIRMA QUE EL CONTRATANTE ES IGUAL QUE EL ASEUGRADO POR ENDER LLAMAR SOLO PARA CONTRATANTE
                            this.current_step = next_step;
                        } else {
                            this.check_input_value = 0;
                            this.show_guide = true;
                            setTimeout(() => {
                                this.show_guide = false;
                            }, 5000);
                        }
                    }
                )
            } else {
                this.current_step = next_step;
            }
        }
        else if (next_step == 3) {

            const res = this.validateInputStep2();

            if (res.toString().trim() != "") {
                Swal.fire('Información', res, 'error');
                return;
            }
            this.current_step = next_step;
        }
    }

    /*INI VIGP 17112025*/
    validateRegistroNegativo(){
        
        const {
            P_NRIESGON_CONT             : rn_cont, 
            P_NIDECON_CONT              : idecon_cont,
            P_WCHECK_CONT               : wcheck_cont,
            P_NESTADO_RIESGON_CONT      : estado_rn_cont,
            P_NRIESGON_INSU             : rn_insu, 
            P_NIDECON_INSU              : idecon_insu,
            P_WCHECK_INSU               : wcheck_insu,
            P_NESTADO_RIESGON_INSU      : estado_rn_insu,
            P_NTYPE_DOCUMENT_INSU       : type_doc_insu,
            P_SNUMBER_DOCUMENT_INSURED  : num_doc_insu,
            P_NID_ASCON                 : nid_ascon
        } = this.old_prospect_data;

        console.log('old_prospect_data.nid_ascon', nid_ascon);
        console.log('this.check_input_value', this.check_input_value);
        console.log('type_doc_insu', type_doc_insu);
        console.log('num_doc_insu', num_doc_insu);
        console.log('this.data_insured.type_document.Id', this.data_insured.type_document.Id);
        console.log('this.data_insured.document_number', this.data_insured.document_number);

        // Valida si el contratante se encuentra en otras listas de RN, Idecon o Wcheck
        if(([rn_cont,idecon_cont,wcheck_cont].includes(1) && [0,2].includes(estado_rn_cont))
            || (rn_cont == 0 && this.riesgo_negativo_cont == 'SI')
            || (idecon_cont == 0 && this.idecon_contractor.otherList == 'SÍ')
            || (wcheck_cont == 0 && this.world_check_contractor.otherList == 'SÍ')
        ){
            console.log("validacion A...");
            return true;
        }

        // Valida si check_input_value tiene el mismo valor que el prospecto encontrado (old_prospect_data)
        if(nid_ascon == this.check_input_value){
            console.log("validacion B...");
            if(this.check_input_value == 1) return false; // El contratante es igual al asegurado

            // El contratante es diferente del asegurado
            if(nid_ascon == 0){
                // Valida que el asegurado actual sea el mismo al asegurado del prospecto encontrado (old_prospect_data)
                if(type_doc_insu == this.data_insured.type_document.Id && num_doc_insu == this.data_insured.document_number){
                    console.log("validacion C...");
                    if(([rn_insu,idecon_insu,wcheck_insu].includes(1) && [0,2].includes(estado_rn_insu))
                        || (rn_insu == 0 && this.riesgo_negativo_insu == 'SI')
                        || (idecon_insu == 0 && this.idecon_insured.otherList == 'SÍ')
                        || (wcheck_insu == 0 && this.world_check_insured.otherList == 'SÍ')
                    ) return true;
                    else return false;
                }else {
                    console.log("validacion D...");
                    if(this.riesgo_negativo_insu == 'SI' || this.idecon_insured.otherList == 'SÍ' || this.world_check_insured.otherList == 'SÍ') return true;
                    else return false;
                }
            }
        }

        // El contratante es diferente del asegurado
        console.log("validacion F...");
        if(this.check_input_value == 0){
            console.log("validacion E...");
            if(this.riesgo_negativo_insu == 'SI' || this.idecon_insured.otherList == 'SÍ' || this.world_check_insured.otherList == 'SÍ') return true;
            else return false;
        }
        // El contratante es igual al asegurado
        else return false;
    }
    /*FIN VIGP 17112025*/

    validateStep2() {

        let response = { cod_error: 0, message_error: "" };

        let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor);
        let validate_nationality_data_complementary_contractor = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_CONTRACTOR(this.check_input_nationality);

        if (validate_error_contractor.cod_error == 1 || validate_nationality_data_complementary_contractor.cod_error == 1) {

            if (validate_nationality_data_complementary_contractor.cod_error == 1) {
                validate_error_contractor.message_error += validate_nationality_data_complementary_contractor.message_error;
            }
            response.cod_error = 1;
            response.message_error += validate_error_contractor.message_error;
        }

        /* INI Validacion Datos Complementarios Contratante */
        if (this.data_complementary.occupation_status.codigo == "") {
            response.cod_error = 1;
            response.message_error += 'Debe seleccionar una ocupación para el contratante.<br>';
        }

        if ([3, 4, 8].includes(this.data_complementary.occupation_status.Id)) {
            if (this.data_complementary.centro_trabajo == null || this.data_complementary.centro_trabajo == "") {
                response.cod_error = 1;
                response.message_error += 'Debe completar el campo "Centro de Trabajo" para el contratante.<br>';
            }

            if (this.data_complementary.cargo == null || this.data_complementary.cargo == "") {
                response.cod_error = 1;
                response.message_error += 'Debe completar el campo "Cargo" para el contratante.<br>';
            }
        }

        if ((this.check_input_nationality != 0) && (this.check_input_nationality != 1)) {
            response.cod_error = 1;
            response.message_error += 'Debe completar la pregunta "¿Es de nacionalidad estadounidense?" para el contratante.<br>';
        }

        if ((this.check_input_relationship != 0) && (this.check_input_relationship != 1)) {
            response.cod_error = 1;
            response.message_error += 'Debe completar la pregunta "¿Es cónyuge o pariente hasta segundo grado de consanguinidad (abuelo(a), padre, madre, hijo(a), hermano(a), nieto(a)) de uno o más PEP?" para el contratante. <br>';
        }

        if ((this.check_input_fiscal_obligations != 0) && (this.check_input_fiscal_obligations != 1)) {
            response.cod_error = 1;
            response.message_error += 'Debe completar la pregunta "¿El asegurado tiene obligaciones fiscales/tributarias" para el contratante?<br>';
        }

        // INI VIGP-KAFG 07/04/2025
        if ((this.check_input_obligated_subject != 0) && (this.check_input_obligated_subject != 1)) {
            response.cod_error = 1;
            response.message_error += 'Debe completar la pregunta "¿Sujeto Obligado?" para el contratante<br>';
        }
        // FIN VIGP-KAFG 07/04/2025

        if ((this.check_input_calidad_socio != 0) && (this.check_input_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
            response.cod_error = 1;
            response.message_error += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el contratante.<br>';
        } else {
            if (this.check_input_calidad_socio == 1 && this.list_societarios_cont.length == 0) {
                response.cod_error = 1;
                response.message_error += 'Debe registrar al menos un societario para el contratante. <br>'
            }
        }

        /* FIN Validacion Datos Complementarios Contratante */

        // Validaciones de Campos obligatorios ASEGURADO arjg 
        if (this.check_input_value == 0) {

            let validate_error_insured = this.CONSTANTS.VALIDATE_INSURED(this.data_insured);
            let validate_nationality_data_complementary_insured = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_INSURED(this.check_input_insu_nationality);

            if (validate_error_insured.cod_error == 1 || validate_nationality_data_complementary_insured.cod_error == 1) {

                if (validate_nationality_data_complementary_insured.cod_error == 1) {
                    validate_error_insured.message_error += validate_nationality_data_complementary_insured.message_error;
                }
                response.cod_error = 1;
                response.message_error += validate_error_insured.message_error;
            }

            //**************** VALIDACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO *****************/

            if (this.data_occuptacion_insu.occupation_status.codigo == "") {
                response.cod_error = 1;
                response.message_error += 'Debe seleccionar una ocupación para el asegurado.<br>';
            }

            if ([3, 4, 8].includes(this.data_occuptacion_insu.occupation_status.Id)) {
                if (this.data_occuptacion_insu.centro_trabajo == null || this.data_occuptacion_insu.centro_trabajo == "") {
                    response.cod_error = 1;
                    response.message_error += 'Debe completar el campo "Centro de Trabajo" para el asegurado.<br>';
                }

                if (this.data_occuptacion_insu.cargo == null || this.data_occuptacion_insu.cargo == "") {
                    response.cod_error = 1;
                    response.message_error += 'Debe completar el campo "Cargo" para el asegurado.<br>';
                }
            }

            if ((this.check_input_insu_nationality != 0) && (this.check_input_insu_nationality != 1)) {
                response.cod_error = 1;
                response.message_error += 'Debe completar la pregunta "¿Es de nacionalidad estadounidense?" para el asegurado.<br>';
            }

            if ((this.check_input_insu_relationship != 0) && (this.check_input_insu_relationship != 1)) {
                response.cod_error = 1;
                response.message_error += 'Debe completar la pregunta "¿Es cónyuge o pariente hasta segundo grado de consanguinidad (abuelo(a), padre, madre, hijo(a), hermano(a), nieto(a)) de uno o más PEP?" para el asegurado. <br>';
            }

            if ((this.check_input_insu_fiscal_obligations != 0) && (this.check_input_insu_fiscal_obligations != 1)) {
                response.cod_error = 1;
                response.message_error += 'Debe completar la pregunta "¿El asegurado tiene obligaciones fiscales/tributarias" para el asegurado?<br>';
            }

            if ((this.check_input_insu_obligated_subject != 0) && (this.check_input_insu_obligated_subject != 1)) {
                response.cod_error = 1;
                response.message_error += 'Debe completar la pregunta "¿Sujeto Obligado?" para el asegurado<br>';
            }
            /* FIN Validacion Datos Complementarios */

            if ((this.check_input_insu_calidad_socio != 0) && (this.check_input_insu_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
                response.cod_error = 1;
                response.message_error += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el asegurado.<br>';
            } else {
                if (this.check_input_insu_calidad_socio == 1 && this.list_societarios_insu.length == 0) {
                    response.cod_error = 1;
                    response.message_error += 'Debe registrar al menos un societario para el asegurado. <br>'
                }
            }



            // INI VIGP-KAFG 04/04/2025
            /*********** DATOS COMPLEMENTARIOS DEL ASEGURADO ************/
            if (this.check_input_insu_nationality != this.nregister_insu_nnatusa) { this.nregister_insured = 1; };
            if (this.check_input_insu_relationship != this.nregister_insu_nconpargc) { this.nregister_insured = 1; };
            if (this.check_input_insu_fiscal_obligations != this.nregister_insu_nofistri) { this.nregister_insured = 1; };
            if (this.data_occuptacion_insu.occupation_status != this.nregister_insu_noccupation) { this.nregister_insured = 1; };
            if (this.data_occuptacion_insu.centro_trabajo != this.nregister_insu_scentro_trabajo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
            if (this.data_occuptacion_insu.cargo != this.nregister_insu_scargo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
            if (this.check_input_insu_obligated_subject != this.nregister_insu_nobligated_subject) { this.nregister_insured = 1; }; // VIGP-KAFG 02/04/2025
            // FIN VIGP-KAFG 04/04/2025
            if (this.check_input_insu_calidad_socio != this.nregister_insu_calidad_socio || this.check_input_insu_calidad_socio == 1) { this.nregister_insured = 1; } // VIGP-KAFG 09/07/2025

        }

        /*********** DATOS COMPLEMENTARIOS DEL CONTRATISTA ************/
        if (this.check_input_nationality != this.nregister_nnatusa) { this.nregister_contractor = 1; };
        if (this.check_input_relationship != this.nregister_nconpargc) { this.nregister_contractor = 1; };
        if (this.check_input_fiscal_obligations != this.nregister_nofistri) { this.nregister_contractor = 1; };
        if (this.data_complementary.occupation_status != this.nregister_noccupation) { this.nregister_contractor = 1; };
        if (this.data_complementary.centro_trabajo != this.nregister_scentro_trabajo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
        if (this.data_complementary.cargo != this.nregister_scargo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
        if (this.check_input_obligated_subject != this.nregister_nobligated_subject) { this.nregister_contractor = 1; }; // VIGP-KAFG 02/04/2025
        if (this.check_input_calidad_socio != this.nregister_calidad_socio || this.check_input_calidad_socio == 1) { this.nregister_contractor = 1; } // VIGP-KAFG 09/07/2025


        /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL CONTRATANTE ******************* */
        if (this.nregister_contractor == 1) {
            this.data_quotation_complementary.P_NID_PROSPECT = this.prospect_id;
            this.data_quotation_complementary.P_NTYPE_CLIENT = 1;
            this.data_quotation_complementary.P_SNUMBER_DOCUMENT = this.data_contractor.document_number;
            this.data_quotation_complementary.P_NOCCUPATION = this.data_complementary.occupation_status.Id;
            this.data_quotation_complementary.P_NNATUSA = this.check_input_nationality;
            this.data_quotation_complementary.P_NOBLIGATED_SUBJECT = this.check_input_obligated_subject; // VIGP-KAFG 02/04/2025
            this.data_quotation_complementary.P_NCALIDAD_SOCIO = this.check_input_calidad_socio; // VIGP-KAFG 09/07/2025
            this.data_quotation_complementary.P_NCONPARGC = this.check_input_relationship;
            this.data_quotation_complementary.P_NOFISTRI = this.check_input_fiscal_obligations;
            this.data_quotation_complementary.P_USER = this.cur_usr.id;
            this.data_quotation_complementary.P_SCENTRO_TRABAJO = this.data_complementary.centro_trabajo ?? '';
            this.data_quotation_complementary.P_SCARGO = this.data_complementary.cargo ?? '';
            this.data_quotation_complementary.P_SOCIETARIOS = this.list_societarios_cont;
            // .map(societario => {
            //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ','); // VIGP-KAFG 07/04/2025
            //     return societario;
            // });

        }

        // INI VIGP-KAFG 04/04/2025
        /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO ******************* */
        if (this.check_input_value == 0 && this.nregister_insured == 1) {
            this.data_complementary_insu.P_NID_PROSPECT = this.prospect_id;
            this.data_complementary_insu.P_NTYPE_CLIENT = 2;
            this.data_complementary_insu.P_SNUMBER_DOCUMENT = this.data_insured.document_number;
            this.data_complementary_insu.P_NOCCUPATION = this.data_occuptacion_insu.occupation_status.Id;
            this.data_complementary_insu.P_NNATUSA = this.check_input_insu_nationality;
            this.data_complementary_insu.P_NOBLIGATED_SUBJECT = this.check_input_insu_obligated_subject; // VIGP-KAFG 02/04/2025
            this.data_complementary_insu.P_NCALIDAD_SOCIO = this.check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025
            this.data_complementary_insu.P_NCONPARGC = this.check_input_insu_relationship;
            this.data_complementary_insu.P_NOFISTRI = this.check_input_insu_fiscal_obligations;
            this.data_complementary_insu.P_USER = this.cur_usr.id;
            this.data_complementary_insu.P_SCENTRO_TRABAJO = this.data_occuptacion_insu.centro_trabajo ?? '';
            this.data_complementary_insu.P_SCARGO = this.data_occuptacion_insu.cargo ?? '';
            this.data_complementary_insu.P_SOCIETARIOS = this.list_societarios_insu
            // .map(societario => {
            //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ','); // VIGP-KAFG 07/04/2025
            //     return societario;
            // });
        }
        // FIN VIGP-KAFG 04/04/2025

        return response;

    }

    /*INI VIGP 17112025 */
    async getDataRegNegativoClient(client_type: number) {
        let consultaRegNegativo = {
            TypeDocument: null,
            IdDocNumber: null,
            Name: null
        };

        let sclientRN = { P_SCLIENT: null };
        
        if(client_type == 1){
            sclientRN.P_SCLIENT = this.data_contractor.sclient;
            consultaRegNegativo = {
                TypeDocument: this.data_contractor.type_document.Id == "2" ? "DNI" : "CE",
                IdDocNumber: this.data_contractor.document_number,
                Name: this.data_contractor.last_name + ' ' + this.data_contractor.last_name2 + ' ' + this.data_contractor.names
            }
        } else {
            sclientRN.P_SCLIENT = this.data_insured.sclient;
            consultaRegNegativo = {
                TypeDocument: this.data_insured.type_document.Id == "2" ? "DNI" : "CE",
                IdDocNumber: this.data_insured.document_number,
                Name: this.data_insured.last_name + ' ' + this.data_insured.last_name2 + ' ' + this.data_insured.names
            }
        }

        try{
            
            const res = await this.vidaInversionService.ConsultaRegistroNegativo(sclientRN).toPromise();

            if (res.P_SCLIENT == null || res.P_SCLIENT == "") {

                try {
                    const resRN = await this.vidaInversionService.getRegNegativo(consultaRegNegativo).toPromise();    

                    if(client_type == 1){
                        this.riesgo_negativo_cont = !resRN.coincidenceRN ? 'NO' : 'SI';
                    }
                    else{
                        this.riesgo_negativo_insu = !resRN.coincidenceRN ? 'NO' : 'SI';
                    }

                    if(resRN.isError == 1) throw new Error('Error en getRegNegativo');

                    await this.vidaInversionService.InsUpdRegistroNegativo({
                        P_SCLIENT: sclientRN.P_SCLIENT,
                        P_NISREGNEG: resRN.coincidenceRN ? 1 : 0,
                        P_SUPDCLIENT: '0'
                    }).toPromise();
                    
                } catch (error) {
                    this.isLoading = false;
                    await Swal.fire('Información', 'Ocurrió un error al consultar el registro negativo.', 'error');
                    this.isLoading = true;
                
                    if(client_type == 1){
                        this.riesgo_negativo_cont = '';
                    }
                    else{
                        this.riesgo_negativo_insu = '';
                    }
                        
                }
            } else {

                if (res.P_SUPDCLIENT == "1") {
                    try {
                        const resRN = await this.vidaInversionService.getRegNegativo(consultaRegNegativo).toPromise();

                        if(client_type == 1){
                            this.riesgo_negativo_cont = !resRN.coincidenceRN ? 'NO' : 'SI';
                        }
                        else{
                            this.riesgo_negativo_insu = !resRN.coincidenceRN ? 'NO' : 'SI';
                        }       

                        if(resRN.isError == 1) throw new Error('Error en getRegNegativo');

                        await this.vidaInversionService.InsUpdRegistroNegativo({
                            P_SCLIENT: sclientRN.P_SCLIENT,
                            P_NISREGNEG: resRN.coincidenceRN ? 1 : 0,
                            P_SUPDCLIENT: '1'
                        }).toPromise();
                    } catch (error) {
                        this.isLoading = false;
                        await Swal.fire('Información', 'Ocurrió un error al consultar el registro negativo.', 'error');
                        this.isLoading = true;
                        if(client_type == 1){
                            this.riesgo_negativo_cont = '';
                        }
                        else{
                            this.riesgo_negativo_insu = '';
                        }
                    }
                } else {
                    if(client_type == 1){
                        this.riesgo_negativo_cont = res.P_NOTHERLIST == 1 ? 'SI' : 'NO';
                    }
                    else{
                        this.riesgo_negativo_insu = res.P_NOTHERLIST == 1 ? 'SI' : 'NO';
                    }
                }
            }

            
        } catch (error) {
            if(client_type == 1){
                this.riesgo_negativo_cont = '';
            }
            else{
                this.riesgo_negativo_insu = '';
            }
        }
    }
    /*FIN VIGP 17112025 */

    resolveLabelBtnSocietario(type: number): string {
        if (type == 1) return `Agregar Societarios(${this.list_societarios_cont.length})`;
        else if (type == 2) return `Agregar Societarios(${this.list_societarios_insu.length})`;
        return '';
    }

    viewBtnAddSocietario(type: number): boolean {
        if (type == 1) return this.check_input_calidad_socio == 1;
        else if (type == 2) return this.check_input_insu_calidad_socio == 1;
        return false;
    }

    openModalAddSocietario(type: number) {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(AddSocietarioComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        console.log("type", type);
        console.log("this.list_societarios_cont", this.list_societarios_cont);
        if (type == 1) modalRef.componentInstance.reference.list_societarios = this.list_societarios_cont;
        if (type == 2) modalRef.componentInstance.reference.list_societarios = this.list_societarios_insu;
        modalRef.componentInstance.reference.type = type;

        modalRef.result.then(
            (res) => {
                if (res) {
                    if (type == 1) {
                        this.list_societarios_cont = res.list_societarios;
                    } else if (type == 2) {
                        this.list_societarios_insu = res.list_societarios;
                    }
                }

            }
        )
    }

    OpenModalBeneficiary(type, item) {

        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(AddBeneficiaryComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.list_benefeciary = this.list_benefeciary;
        modalRef.componentInstance.reference.type = type;
        modalRef.componentInstance.reference.item = item;
        if (item != null) modalRef.componentInstance.reference.item.last_name2 = item.slastname2 // INI VIGP-KAFG 20/02/2025
        modalRef.componentInstance.reference.contratactor_doc = { type_doc: this.data_contractor.type_document, document_number: this.data_contractor.document_number };
        modalRef.componentInstance.reference.insured_doc = { type_doc: this.data_insured.type_document, document_number: this.data_insured.document_number };

        modalRef.result.then(
            (res) => {
                if (res) {
                    const new_item = {
                        ...res,
                        siddoc: res.document_number,
                        sfirstname: res.names,
                        slastname: res.last_name,
                        slastname2: res.last_name2, // INI VIGP-KAFG 20/02/2025
                        srelation_name: res.relation.GLS_ELEMENTO, // Aqui va ir el nombre del Parentesco
                        relation: { NCODIGO: res.relation.COD_ELEMENTO },
                        percentage_participation: res.assignment,
                        type_doc: res.type_document.Id,
                        desc_type_doc: res.type_document.Id == 2 ? 'DNI' : "CE",
                    };

                    if (type == 'edit') {
                        const new_list_benefeciary = this.list_benefeciary.map((element) => {
                            if ((element.type_document.Id == item.type_document.Id) && (element.document_number == item.document_number)) { return new_item; }
                            else { return element; }
                        });

                        this.list_benefeciary = new_list_benefeciary;
                    }
                    else {
                        // let split_date = new_item.birthday_date.split('/');
                        // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`; // parse to dd/mm/yyyy
                        // new_item.birthday_date = format_birthday;

                        // INI VIGP-KAFG 20/02/2025
                        this.list_benefeciary.push({ ...new_item, slastname2: new_item.last_name2 });// Aqui se esta insertando
                        // FIN VIGP-KAFG 20/02/2025
                    }

                    this.currentPageBeneficiaries = 1;
                    this.totalItems = this.list_benefeciary.length;
                    this.listToShowBeneficiaries = this.list_benefeciary.slice(
                        (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
                        this.currentPageBeneficiaries * this.itemsPerPage
                    );
                }
            }
        )
    }

    validateCheckInsured() {
        if ((this.check_input_value == 3) || (this.check_input_value == 1)) {
            const customswal = Swal.mixin({
                confirmButtonColor: "553d81",
                focusConfirm: false,
            })
            customswal.fire('Información', "Para esta sección, debe indicar que el asegurado NO es la misma persona que contrata el seguro.", 'warning');
        }
    }

    goToDefinitiveQuote() {
        if (this.current_quotation_selected) {
            this.router.navigate([`extranet/vida-inversion/cotizacion-definitiva/${this.current_quotation_selected.QuotationNumber}/${this.current_quotation_selected.ContractorSclient}/${this.current_quotation_selected.IdProspect}`]);
        } else {
            Swal.fire({
                title: 'Información',
                text: 'Debe seleccionar una cotización.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: true,
            })
        }
    }

    async SendQuotationSing(QuotationNumber) {
        try {
            const confirm = await Swal.fire('Confirmación', '¿Está seguro de que desea enviar la cotización?', 'warning');

            if (confirm.isConfirmed) {
                this.isLoading = true;

                let params = {
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NID_COTIZACION: QuotationNumber,
                    P_NIDHEADERPROC: null,
                    P_NTYPE_DOCUMENT_SEND: 2
                }

                const res = await this.vidaInversionService.SendDocument(params).toPromise()

                if (res.P_ERROR == 0) {
                    Swal.fire('Mensaje', res.P_MESSAGE, 'success');
                } else if (res.P_ERROR == 3) {
                    Swal.fire('Información', res.P_MESSAGE, 'info');
                } else {
                    Swal.fire('Mensaje', res.P_MESSAGE, 'error');
                }
            }
        } catch (error) {
            console.log("error: ", error)
            Swal.fire('Mensaje', 'Ha ocurrido un error al enviar la cotización.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    SendQuotationList() {
        let cap = this.listadoCotizacionesVigentes.filter(x => x.checked);
        if (cap.length > 0) {
            Swal.fire('Confirmación', '¿Está seguro de que desea enviar la cotización?', 'warning').then(
                result => {
                    if (result.value) {
                        let params = { P_LIST_QUOTATION: [] };
                        for (let i = 0; i < this.listadoCotizacionesVigentes.length; i++) {
                            if (this.listadoCotizacionesVigentes[i].checked) {
                                let item = {
                                    P_NBRANCH: this.CONSTANTS.RAMO,
                                    P_NID_COTIZACION: this.listadoCotizacionesVigentes[i].QuotationNumber,
                                    P_NIDHEADERPROC: null,
                                    P_NTYPE_DOCUMENT_SEND: 2
                                }
                                params.P_LIST_QUOTATION.push(item);
                            }
                        }

                        this.vidaInversionService.SendDocumentList(params).toPromise().then(
                            res => {
                                if (res.P_ERROR == 0) {
                                    Swal.fire('Mensaje', res.P_MESSAGE, 'success');
                                } else {
                                    Swal.fire('Mensaje', res.P_MESSAGE, 'error');
                                }
                            },
                            err => {
                                Swal.fire('Mensaje', 'Ha ocurrido un error al enviar la cotización.', 'error');
                            }
                        )
                    }
                }
            )
        } else {
            Swal.fire('Mensaje', 'Debe seleccionar al menos una cotización.', 'warning');
        }
    }

    obtenerFechaActual = () => {
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    createFormDataQuotationPreliminary() {
        const params = {
            NumeroPoliza: 0,
            NumeroCotizacion: 0,
            P_SCLIENT: this.data_contractor.sclient,
            // P_SCLIENT_PROVIDER: this.cotizacion.endosatario[0].cod_proveedor,
            P_NCURRENCY: this.quotation.currency.NCODIGINT,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_SAPLICACION: 'PD',
            P_DFEC_OTORGAMIENTO: this.obtenerFechaActual(), // !! CONSULTAR VALORES
            P_DSTARTDATE: this.obtenerFechaActual(), // !! CONSULTAR VALORES
            P_DEXPIRDAT: this.fecha_fin_poliza, // !! CONSULTAR VALORES            
            P_DSTARTDATE_ASE: this.obtenerFechaActual(), // !! CONSULTAR VALORES
            P_DEXPIRDAT_ASE: this.fecha_fin_asegurado, // !! CONSULTAR VALORES                        
            P_NIDCLIENTLOCATION: 1,
            // P_SCOMMENT: "",
            P_SRUTA: '',
            P_NUSERCODE: this.cur_usr.id,
            P_NACT_MINA: 0,
            P_NTIP_RENOV: 6,
            P_NPAYFREQ: 6,
            P_SCOD_ACTIVITY_TEC: 1,
            P_SCOD_CIUU: 1,
            P_NTIP_NCOMISSION: 0,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_NEPS: this.storageService.eps.STYPE,
            P_QUOTATIONNUMBER_EPS: "",
            P_NPENDIENTE: '0',
            P_NCOMISION_SAL_PR: 0,
            retOP: 2,
            FlagCambioFecha: 1,
            TrxCode: "EM",
            // planId: this.quotation.funds.NcoreFund,
            // planId: this.quotation.funds.NcoreFund, // CONSULTAR QUE VALOR DEBE INSERTAR EN CAB (revisar en productos disintos al ramo 73)
            planId: 1, // CONSULTAR QUE VALOR DEBE INSERTAR EN CAB (revisar en productos disintos al ramo 73)
            // P_NMODULEC_TARIFARIO: this.cotizacion.poliza.tipoPlan.ID_PLAN,
            // P_SDESCRIPT_TARIFARIO: this.cotizacion.poliza.tipoPlan.TIPO_PLAN,
            P_NPOLIZA_MATRIZ: 0,
            P_NTRABAJO_RIESGO: 0,
            P_NFACTURA_ANTICIPADA: 1,
            P_NTYPE_PROFILE: this.CONSTANTS.COD_PRODUCTO,
            P_NTYPE_PRODUCT: "1",
            P_NTYPE_MODALITY: 0,
            P_NTIPO_FACTURACION: 1,
            P_ESTADO: 2,
            // PolizaEditAsegurados: this.cotizacion.PolizaEditAsegurados, // 1 si se valido trama
            P_STRAN: "EM",
            IsDeclare: false,

            // nuevos tarifario
            // P_NDERIVA_TECNICA: 0,
            // P_NSCOPE: 1,
            // P_NTEMPORALITY: 0,
            // P_NTYPE_LOCATION: 0,
            P_NLOCATION: 14,
            // P_NNUM_CUOTA: this.cotizacion.poliza.nroCuotas,
            // nuevo tipo de renovacion
            P_STIMEREN: "3",
            QuotationDet: [
                {
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                    P_NTOTAL_TRABAJADORES: 1,
                    // P_NMONTO_PLANILLA: this.cotizacion.trama.MONT_PLANILLA,
                    // P_NTASA_CALCULADA: this.cotizacion.trama.TASA,
                    // P_NTASA_PROP: 0, 
                    // P_NPREMIUM_MIN: this.cotizacion.trama.PRIMA,
                    // P_NPREMIUM_MIN_PR: this.cotizacion.poliza.primaPropuesta,
                    P_NPREMIUM_END: '0',
                    P_NRATE: 0,
                    P_NDISCOUNT: 0,
                    P_NACTIVITYVARIATION: 0,
                    P_FLAG: '0',
                    P_NAMO_AFEC: this.format_amount,                    
                    P_NIVA: 0,
                    P_NAMOUNT: this.format_amount,            
                    P_NDE: 0,
                },
            ],
            QuotationCom: [ // Se enviará como Comercializador el Canal que esta Asociado el Usuario.
                {
                    P_NIDTYPECHANNEL: this.cur_usr.tipoCanal, // Revisar, otros productos estan enviando de la tabla "INTERM_TYP"
                    P_NINTERMED: this.cur_usr.canal,
                    P_SCLIENT_COMER: this.cur_usr.sclient,
                    P_NCOMISION_SAL_PR: 0,
                    P_NCOMISION_PEN: 0,
                    P_NCOMISION_PEN_PR: 0,
                    P_NPRINCIPAL: 0,
                }
            ],
            QuotationCli: [],
            // Vida Inversion
            // P_NSAVING_TIME: 7, // ESTE VALOR SE VA ENVIAR DESDE EL TARIFARIO
            P_CONTRIBUTION: this.format_amount,            
            P_NFUNDS: this.quotation.funds.NcoreFund, // SE COMENTO MOMENTANEAMOS PARA PODER AVANZAR CON LA HOMOLOGACION
            // P_NFUNDS: 2, // SE COMENTO MOMENTANEAMOS PARA PODER AVANZAR CON LA HOMOLOGACION
            P_DDATE_FUND: this.quotation.date_fund.toLocaleDateString('es-PE'),
            P_NID_PROSPECT: this.prospect_id,
            List_beneficiary: [],
            is_benef_direct: this.check_input_value_beneficiary
        };

        const myFormData: FormData = new FormData();

        if (this.check_input_value_beneficiary == 0) {
            if (this.list_benefeciary.length > 0) {

                for (let i = 0; i < this.list_benefeciary.length; i++) {

                    let item = {
                        // niiddoc_type: this.list_benefeciary[i].type_document.Id,
                        sclient: this.list_benefeciary[i].sclient,
                        niiddoc_type: this.list_benefeciary[i].type_document.Name,
                        niddoc_type_beneficiary: this.list_benefeciary[i].type_document.Name,
                        siddoc: this.list_benefeciary[i].siddoc,
                        siddoc_beneficiary: this.list_benefeciary[i].siddoc,
                        sfirstname: this.list_benefeciary[i].sfirstname,
                        slastname: this.list_benefeciary[i].slastname,
                        slastname2: this.list_benefeciary[i].slastname2,
                        nnationality: this.list_benefeciary[i].nationality.SDESCRIPT,
                        percen_participation: this.list_benefeciary[i].percentage_participation,
                        dbirthdat: this.list_benefeciary[i].birthday_date.toLocaleDateString('es-ES'),
                        nusercode: this.cur_usr.id,
                        srole: 'Beneficiario',
                        se_mail: this.list_benefeciary[i].email,
                        sphone_type: "Celular",
                        sphone: this.list_benefeciary[i].phone,
                        srelation: this.list_benefeciary[i].srelation_name,
                        ssexclien: this.list_benefeciary[i].gender.SSEXCLIEN,
                    };
                    params.List_beneficiary.push(item);
                }
            } else {
                params.List_beneficiary = []
            }
        }
        myFormData.append('objeto', JSON.stringify(params));
        return myFormData;
    }

    getDataForQuotationPreliminary() {

        const params = {
            flagCalcular: this.CONSTANTS.PERFIL.TECNICA == this.profile_id ? 1 : 0,
            codUsuario: this.cur_usr.id,
            desUsuario: this.cur_usr.username,
            // codCanal: this.cotizacion.brokers[0].COD_CANAL,
            contratante: this.data_contractor.sclient,
            codRamo: this.CONSTANTS.RAMO,
            codProducto: this.CONSTANTS.COD_PRODUCTO,
            codTipoPerfil: this.CONSTANTS.COD_PRODUCTO,
            codProceso: '',
            PolizaMatriz: 0,
            type_mov: "1", // Emision
            nroCotizacion: 0,
            MontoPlanilla: 0,
            CantidadTrabajadores: 1,
            flagSubirTrama: 1, //Valor para saber si se va enviar Trama o no al Back
            premium: 0,
            contribution_decimal: this.format_amount,            

            datosContratante: {
                codContratante: this.data_contractor.sclient, // Sclient
                desContratante: `${this.data_contractor.names} ${this.data_contractor.last_name2} ${this.data_contractor.last_name2}`, // Legal name
                codDocumento: this.data_contractor.type_document.Id, // Tipo de documento
                documento: this.data_contractor.document_number,
                nombre: this.data_contractor.names, // En caso de ruc es razon social
                apePaterno: this.data_contractor.last_name, // solo si es persona natural
                apeMaterno: this.data_contractor.last_name2, // solo si es persona natural
                // fechaNacimiento: "05/12/1972",
                fechaNacimiento: this.data_contractor.birthday_date, // en caso de ruc es fecha de creacion sino fecha actual
                nacionalidad: this.data_contractor.nationality.NNATIONALITY,
                email: this.data_contractor.email,
                sexo: this.data_contractor.gender.SSEXCLIEN,
                desTelefono: "Celular",
                telefono: this.data_contractor.phone,
                rol: "1",
                ascon: this.check_input_value
            },
            datosAsegurado: this.check_input_value == 0 ? { // REVISAR DIEGO, SI EL CONTRATANTE ES IGUAL QUE EL ASEGURO, EL CONTRATANTE ES EL ASEGURADO POR ENDE SE LE DEBE ENVIAR SU MISMA DATA
                codContratante: this.data_insured.sclient,
                desContratante: `${this.data_insured.names} ${this.data_insured.last_name2} ${this.data_insured.last_name2}`,
                codDocumento: this.data_insured.type_document.Id,
                documento: this.data_insured.document_number,
                nombre: this.data_insured.names,
                apePaterno: this.data_insured.last_name,
                apeMaterno: this.data_insured.last_name2,
                fechaNacimiento: this.data_insured.birthday_date,                
                nacionalidad: this.data_insured.nationality.NNATIONALITY,
                email: this.data_insured.email,
                sexo: this.data_insured.gender.SSEXCLIEN,
                desTelefono: "Celular",
                telefono: this.data_insured.phone,
                rol: "2"
            } : {
                codContratante: this.data_contractor.sclient,
                desContratante: `${this.data_contractor.names} ${this.data_contractor.last_name2} ${this.data_contractor.last_name2}`,
                codDocumento: this.data_contractor.type_document.Id,
                documento: this.data_contractor.document_number,
                nombre: this.data_contractor.names,
                apePaterno: this.data_contractor.last_name,
                apeMaterno: this.data_contractor.last_name2,
                fechaNacimiento: this.data_contractor.birthday_date,                
                nacionalidad: this.data_contractor.nationality.NNATIONALITY,
                email: this.data_contractor.email,
                sexo: this.data_contractor.gender.SSEXCLIEN,
                desTelefono: "Celular",
                telefono: this.data_contractor.phone,
                rol: "1"
            },
            datosPoliza: {
                // segmentoId: this.cotizacion.poliza.tipoPlan.ID_PLAN,
                tipoDocumento: this.data_contractor.type_document.Id,
                numDocumento: this.data_contractor.document_number,
                codTipoNegocio: 1, // Tipo de Poliza 1= Individual,
                codTipoProducto: this.CONSTANTS.COD_PRODUCTO,
                codTipoPerfil: this.CONSTANTS.COD_PRODUCTO,
                // codTipoPlan: this.cotizacion.poliza.tipoPlan.ID_PLAN,//this.CONSTANTS.PLANMAESTRO,
                // desTipoPlan: this.cotizacion.poliza.tipoPlan.TIPO_PLAN,
                codTipoRenovacion: 6, // POR DEFINIR EL TIPO DE RENOVACION,
                codTipoFrecuenciaPago: 6, // POR DEFINIR CODIGO DE FRECUENCIA DE PAGO POR EL MOMENTO MENSUAL,
                tipoRenovacionPoliza: "3", // nuevo tipo de renovacion
                InicioVigPoliza: this.obtenerFechaActual(),
                FinVigPoliza: this.fecha_fin_poliza,                
                InicioVigAsegurado: this.obtenerFechaActual(),
                FinVigAsegurado: this.fecha_fin_asegurado,                
                CodActividadRealizar: "1",
                CodCiiu: "1",
                codTipoFacturacion: 1,
                codMon: this.quotation.currency.NCODIGINT,
                typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION.toString(),
                branch: this.CONSTANTS.RAMO,
                nid_cotizacion: 0,
                trxCode: "EM", // Emision
                temporalidad: 0,
                codAlcance: 0,
                tipoUbigeo: 0,
                codUbigeo: !this.data_contractor.department.Id ? 14 : this.data_contractor.department.Id,
                polizaMatriz: 0,
                fechaOtorgamiento: this.obtenerFechaActual(),
            },
        };
        return params;
    }



    getDataQuotationFund() {


        const funds = {
            funds: [
                {
                    P_NFUNDS: this.quotation.funds.NidInvestmentFund, // SE COMENTO MOMENTANEAMOS PARA PODER AVANZAR CON LA HOMOLOGACION
                    // P_NFUNDS: 2, // SE COMENTO MOMENTANEAMOS PARA PODER AVANZAR CON LA HOMOLOGACION
                    P_NPARTICIP: 100, // Por el momento como es solo 1 fondo seleccinado, seria 100
                    P_NUSERCODE: this.cur_usr.id,
                    P_SREADDRESS: '',
                    // P_NQUAN_AVAIL: '',
                    P_SACTIVFOUND: "1",
                    // P_NORIGIN: this.investment[0].NORIGIN,
                    P_SAPV: '',
                    // P_NINTPROY: this.investment[0].NINTPROY,
                    // P_NINTPROYVAR: '',
                    P_NID_COTIZACION: 0
                }
            ]
        }
        return funds;
    }

    cleanQuoteData() {
        this.quotation.contribution = '';
        this.quotation.date_fund = new Date();
        this.list_benefeciary = [];
        this.currentPageBeneficiaries = 1;
        this.totalItems = this.list_benefeciary.length;
        this.listToShowBeneficiaries = this.list_benefeciary.slice(
            (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
            this.currentPageBeneficiaries * this.itemsPerPage
        );
        // this.changeValueBenefeciary(1); // VIGP-187
    }



    ValidateInputsQuotePreliminary() {

        let response = { cod_error: 0, message_error: "" }

        if (this.quotation.contribution == null || this.quotation.contribution == "") {
            response.message_error += 'Debe ingresar el aporte. <br>';
            response.cod_error = 1;
        }

        if (this.format_amount < 30000) {
            response.message_error += 'El aporte debe ser mayor o igual a US$ 30,000. <br>';
            response.cod_error = 1;
        }

        if (this.quotation.currency.NCODIGINT == "") {
            response.message_error += 'Debe seleccionar la moneda. <br>';
            response.cod_error = 1;
        }

        if (this.quotation.funds.NcoreFund == "") { // SE COMENTO MOMENTANEAMOS PARA PODER AVANZAR CON LA HOMOLOGACION
            response.message_error += 'Debe seleccionar un fondo. <br>';
            response.cod_error = 1;
        }

        const sum_percentage_participation = this.list_benefeciary.reduce((acc, current) => acc + parseInt(current?.percentage_participation), 0);
        if (sum_percentage_participation > 100) {
            response.message_error += 'La suma de la asignación no puede superar el 100%. <br>';
            response.cod_error = 1;
        }
        return response;
    }

    getRespuestasPerfilamiento() {

        const response_items = [
            {
                P_NQUESTION: 1,
                P_SANSWER: this.perfilamiento.question1
            },
            {
                P_NQUESTION: 2,
                P_SANSWER: this.perfilamiento.question2
            },
            {
                P_NQUESTION: 3,
                P_SANSWER: this.perfilamiento.question3
            },
            {
                P_NQUESTION: 4,
                P_SANSWER: this.perfilamiento.question4
            },
            {
                P_NQUESTION: 5,
                P_SANSWER: this.perfilamiento.question5
            },
            {
                P_NQUESTION: 6,
                P_SANSWER: this.perfilamiento.question6
            }
        ];

        return response_items;
    };

    getSearchScoring() {
        const search_scoring = {
            P_NID_COTIZACION: this.current_quotation,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
        }
        return search_scoring;
    }


    async CreateQuotePreliminary() {

        this.isLoading = true;

        const response_validate_cot_preliminary = this.ValidateInputsQuotePreliminary();

        if (response_validate_cot_preliminary.cod_error == 1) {
            this.isLoading = false;
            Swal.fire('Información', response_validate_cot_preliminary.message_error, 'warning');
            return;
        }

        this.quotation.date_fund = new Date(this.quotation.date_fund.getFullYear(), this.quotation.date_fund.getMonth(), this.quotation.date_fund.getDate());

        // Valida si es una fecha de abono válida
        // const daySelected = this.quotation.date_fund.getDay();
        // if ([0, 6].includes(daySelected)) {
        //     this.isLoading = false;
        //     Swal.fire('Información', 'La fecha de abono no es válida. Solo se permiten días hábiles.', 'warning');
        //     return;
        // }

        const fundDateValidation = await this.vidaInversionService.ValidateFundDate(this.quotation.date_fund).toPromise();

        if (!fundDateValidation.IS_VALID) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de abono no es válida. Solo se permiten días hábiles.', 'warning');
            return;
        }

        this.fecha_fin_poliza = await this.quotationService.GetFechaFinVigenciaPoliza({ P_SCLIENT: this.data_contractor.sclient }).toPromise();

        if (this.fecha_fin_poliza == "1" || this.fecha_fin_poliza == "null") {
            this.isLoading = false;
            Swal.fire('Información', 'Ocurrió un error al obtener la fecha fin de vigencia de la poliza', 'error');
            return;
        }
        else {
            this.fecha_fin_asegurado = this.fecha_fin_poliza;
        }

        // console.log("this.list_benefeciary: ", this.list_benefeciary);

        const myFormData = this.createFormDataQuotationPreliminary();
        const objCotDes = this.getDataForQuotationPreliminary();
        const objCotFund = this.getDataQuotationFund();

        myFormData.append('objDes', JSON.stringify(objCotDes));
        myFormData.append('objFund', JSON.stringify(objCotFund));

        // Inicializar variables para la actualizacion de registro del contratante y asegurado
        this.nregister_contractor = 0;
        this.nregister_insured = 0;
        this.nregister_contractor_corr = 0;
        this.nregister_contractor_telf = 0;
        this.nregister_contractor_dire = 0;
        this.nregister_insured_dire = 0;
        this.nregister_insured_corr = 0;
        this.nregister_insured_telf = 0;

        // Validación de los campos traidos del Contratante/Asegurado del 360 con los que estan actualmente en panttalla
        const must_update = this.validateForUpdateClient();
        console.log(must_update);


        if (must_update == true) {
            await this.updateDataClient360(myFormData);
            return;
        }

        try {

            if (this.nregister_contractor == 1) { 
                const resComp1 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary).toPromise();
                if (resComp1.P_NCODE == 1) {
                    Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                    return;
                }
            }

            // INI VIGP-KAFG 04/04/2025
            /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO ******************* */
            if (this.check_input_value == 0 && this.nregister_insured == 1) {
                const resComp2 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_complementary_insu).toPromise();
                if (resComp2.P_NCODE == 1) {
                    Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                    return;
                } else {

                    // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                }
            }
            const insert_quotation_response = await this.quotationService.insertQuotation(myFormData).toPromise();
            console.log("resp-quota: ", insert_quotation_response)

            if (insert_quotation_response.P_COD_ERR !== 0) {
                throw new Error(insert_quotation_response.P_MESSAGE);
            }

            this.current_quotation = insert_quotation_response.P_NID_COTIZACION; //ARJG
            // DGC - PERFILAMIENTO
            await this.insupdOrigenPep(this.current_quotation);

            const form_data_perfilamiento: FormData = new FormData();
            const response_items = this.getRespuestasPerfilamiento();
            const search_scoring = this.getSearchScoring();
            const response_request_scoring = await this.vidaInversionService.RequestScoring(search_scoring).toPromise();

            if (response_request_scoring.P_COD_ERR == 1) { }
            else {
                this.perfilamiento.perfilamiento_exist = response_request_scoring.P_COD_ERR == 0 ? true : false;
                const request_perfilamiento = {
                    P_NID_COTIZACION: this.current_quotation,
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                    P_UPDATE_PERFILAMIENTO: this.perfilamiento.perfilamiento_exist,
                    P_PERFILAMIENTO_ITEMS: response_items
                };

                form_data_perfilamiento.append('respuestas_perfilamiento', JSON.stringify(request_perfilamiento));
                const response_ins_perfilamiento = await this.vidaInversionService.InsPerfilamiento(form_data_perfilamiento).toPromise();

                if (response_ins_perfilamiento.P_COD_ERR == 1) {
                    throw new Error("Ocurrió un problema en el cálculo del perfilamiento");
                }
            }

            this.cleanQuoteData();
            this.mostrarCotizacionesVigentesXusuario();
            this.mostrarCotizacionesNoVigentesXusuario();

            // this.isLoading = false;
            Swal.fire({
                text: `La cotización ${insert_quotation_response.P_NID_COTIZACION} se generó correctamente.`,
                icon: 'success',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            })
        }
        catch (error) {

            Swal.fire({
                title: 'Información',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
        }
        finally {
            this.isLoading = false;
        }
        console.log(this.check_input_value_beneficiary);
    }

    deleteBenefeciary(item_benefeciary) {
        let new_list_benefeciary = this.list_benefeciary.filter((element) => element.siddoc != item_benefeciary.siddoc);
        this.list_benefeciary = new_list_benefeciary;
        this.totalItems = this.list_benefeciary.length;
        this.listToShowBeneficiaries = this.list_benefeciary.slice(
            (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
            this.currentPageBeneficiaries * this.itemsPerPage
        );
        this.currentPageBeneficiaries = this.listToShowBeneficiaries.length == 0 ? this.currentPageBeneficiaries - 1 : this.currentPageBeneficiaries;
        this.listToShowBeneficiaries = this.list_benefeciary.slice(
            (this.currentPageBeneficiaries - 1) * this.itemsPerPage,
            this.currentPageBeneficiaries * this.itemsPerPage
        );
    }

    CancelQuotation(item) {

        Swal.fire({
            title: `Anular cotización: ${item.QuotationNumber}`,
            text: '¿Está seguro(a) que desea anular la cotización?',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            allowOutsideClick: false,
            reverseButtons: true,
            confirmButtonColor: "#2b0d61",
        }).then(
            result => {

                if (result.value) {
                    const request_cancel_quote = {
                        QuotationNumber: item.QuotationNumber
                    }
                    this.quotationService.cancelCotizacionesVigentesVIGP(request_cancel_quote).toPromise().then((res) => {

                        if (res.P_COD_ERR == 1) {
                            this.isLoading = false;
                            Swal.fire('Información', res.P_MESSAGE, 'error');
                            return;
                        } else {

                            this.mostrarCotizacionesVigentesXusuario();
                            this.mostrarCotizacionesNoVigentesXusuario();

                            Swal.fire('Información', 'Se anuló la cotización correctamente.', 'success');
                            return;
                        }
                    })
                }
            }
        )
    }

    selectCotizacion(item: any) {
        item.selected = true;
        this.current_quotation_selected = item;
    }

    clearData(type: any) {

        if (type == 1) {// Contratante
            // this.data_contractor.docuemnt_number = "";
            this.data_contractor.birthday_date = "";
            this.data_contractor.names = "";
            this.data_contractor.last_name = "";
            this.data_contractor.last_name2 = "";
            this.data_contractor.gender = "";
            this.data_contractor.civil_status = "";
            this.data_contractor.nationality = "";
            this.data_contractor.phone = "";
            this.data_contractor.email = "";
            this.data_contractor.address = "";
            this.data_contractor.department = { Id: null };
            this.data_contractor.province = { Id: null };
            this.data_contractor.district = { Id: null };
            this.data_contractor.type_document_disabled = false;
            this.data_contractor.document_number_disabled = false;
            this.data_contractor.birthday_date_disabled = true;
            this.data_contractor.names_disabled = true;
            this.data_contractor.last_name_disabled = true;
            this.data_contractor.last_name2_disabled = true;
            this.data_contractor.gender_disabled = true;
            this.data_contractor.civil_status_disabled = false;
            this.data_contractor.nationality_disabled = false;
            this.data_contractor.department_disabled = false;
            this.data_contractor.province_disabled = false;
            this.data_contractor.district_disabled = false;
            this.data_contractor.phone_disabled = false;
            this.data_contractor.email_disabled = false;
            this.data_contractor.address_disabled = false;
            this.contractor_province_department = false;
            this.contractor_province_selected = false;
            this.list_data_contractor_province = [];
            this.list_data_contractor_district = [];
            this.list_data_contractor_department = [];
            this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 

        } else if (type == 2) { // Asegurado
            // this.data_insured.docuemnt_number = "";
            this.data_insured.birthday_date = "";
            this.data_insured.names = "";
            this.data_insured.last_name = "";
            this.data_insured.last_name2 = "";
            this.data_insured.gender = "";
            this.data_insured.civil_status = "";
            this.data_insured.nationality = "";
            this.data_insured.phone = "";
            this.data_insured.email = "";
            this.data_insured.address = "";
            this.data_insured.province = { Id: null };
            this.data_insured.district = { Id: null };
            this.data_insured.department = { Id: null };
            this.data_insured.relation = { COD_ELEMENTO: null };

            this.data_insured.type_document_disabled = false;
            this.data_insured.document_number_disabled = false;
            this.data_insured.birthday_date_disabled = true;
            this.data_insured.names_disabled = true;
            this.data_insured.last_name_disabled = true;
            this.data_insured.last_name2_disabled = true;
            this.data_insured.gender_disabled = true;
            this.data_insured.civil_status_disabled = false;
            this.data_insured.nationality_disabled = false;
            this.data_insured.department_disabled = false;
            this.data_insured.province_disabled = false;
            this.data_insured.district_disabled = false;
            this.data_insured.phone_disabled = false;
            this.data_insured.email_disabled = false;
            this.data_insured.address_disabled = false;
            this.insured_province_department = false;
            this.insured_province_selected = false;
            this.list_data_insured_province = [];
            this.list_data_insured_district = [];
            this.list_data_insured_department = [];
            this.data_insured.relation = [];
            this.homologacionInsu = "——"; // VIGP-KAFG 16/04/2025 

        }
    }

    clearDataComplementary(type: any) {

        if (type == 1) { // Contratante

            this.check_input_nationality = 3;
            this.check_input_relationship = 3;
            this.check_input_fiscal_obligations = 3;
            this.check_input_obligated_subject = 3;
            this.check_input_calidad_socio = 3;
        }
        else if (type == 2) { // Asegurado

            this.check_input_insu_nationality = 3;
            this.check_input_insu_relationship = 3;
            this.check_input_insu_fiscal_obligations = 3;
            this.check_input_insu_obligated_subject = 3;
            this.check_input_insu_calidad_socio = 3;
        }
    }

    async cargarDatosContractor(res: any, search_type: any) {

        const contracting_data = res.EListClient[0];
        if (contracting_data.P_DBIRTHDAT == null) {

        } else {
            let split_date = contracting_data.P_DBIRTHDAT.split('/');
            this.data_contractor.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        }

        if (this.data_contractor.type_document.Id == 4) {
            this.homologacionCont = "__";
        } else {
            this.homologacionCont = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        }
        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;

        this.data_contractor.sclient = contracting_data.P_SCLIENT;


        this.s_usr = { P_SCLIENT: this.data_contractor.sclient }; // Parta la busqueda del Contratante

        this.data_contractor.gender = { SSEXCLIEN: contracting_data.P_SSEXCLIEN };
        this.data_contractor.civil_status = { NCIVILSTA: contracting_data.P_NCIVILSTA };
        this.data_contractor.nationality = { NNATIONALITY: contracting_data.P_NNATIONALITY };

        if (contracting_data.EListEmailClient.length >= 1) {
            this.data_contractor.email = contracting_data.EListEmailClient[0].P_SE_MAIL;
        }

        if (contracting_data.EListAddresClient.length >= 1) {
            this.data_contractor.address = contracting_data.EListAddresClient[0].P_SDESDIREBUSQ;
            this.data_contractor.department = { Id: parseInt(contracting_data.EListAddresClient[0].P_NPROVINCE) }

            await this.setDepartmentContractor(parseInt(contracting_data.EListAddresClient[0].P_NPROVINCE));
            await this.setProvinceContractor(parseInt(this.data_contractor.department.Id), parseInt(contracting_data.EListAddresClient[0].P_NLOCAL));
            await this.setDistrictContractor(parseInt(this.data_contractor.province.Id), parseInt(contracting_data.EListAddresClient[0].P_NMUNICIPALITY));
        } else {
            await this.addressService.getDepartmentList().toPromise().then(res => {
                this.list_data_contractor_department = res;
                this.data_contractor.department = { Id: null }
                this.list_data_contractor_province = [];
                this.data_contractor.province = { Id: null }
                this.list_data_contractor_district = [];
                this.data_contractor.district = { Id: null }
                this.data_insured.relation = { COD_ELEMENTO: 0 }
            });
        }

        if (contracting_data.EListPhoneClient.length >= 1) {
            this.data_contractor.phone = contracting_data.EListPhoneClient[0].P_SPHONE;
        }
    }

    async getDataIdeconClient(client_type: number) {
        let datosIdecom = {};
        let consultIdecom = {
            P_SCLIENT: null,
            P_NOTHERLIST: 0,
            P_NISPEP: 0,
            P_NISFAMPEP: 0,
            P_NNUMBERFAMPEP: 0,
            P_SUPDCLIENT: '0'
        };
        let sclientIdecom = { P_SCLIENT: this.data_contractor.sclient }
        console.log("client_type: ", client_type);
        if (client_type == 1) {
            datosIdecom = {
                name: this.data_contractor.names + ' ' + this.data_contractor.last_name + ' ' + this.data_contractor.last_name2,
                idDocNumber: this.data_contractor.document_number,
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

                    if (consultIdecom.P_SCLIENT == null || consultIdecom.P_SCLIENT == "") {
                        try {
                            const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise();
                            
                            consultIdecom = {
                                P_SCLIENT: this.data_contractor.sclient,
                                P_NOTHERLIST: resIdecon.isOtherList ? 1 : 0,
                                P_NISPEP: resIdecon.isPep ? 1 : 0,
                                P_NISFAMPEP: resIdecon.isFamPep ? 1 : 0,
                                P_NNUMBERFAMPEP: resIdecon.isIdNumberFamPep ? 1 : 0,
                                P_SUPDCLIENT: '0'
                            }

                            this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                            if (this.idecon_contractor.pep === 'SÍ' || this.idecon_contractor.famPep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }

                            await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            
                        } catch (error) {
                            this.isLoading = false;
                            Swal.fire('Información', 'Error al consultar IDECON para el Contratante.', 'error');
                            this.isLoading = true;
                        }
                    } else {
                        if (consultIdecom.P_SUPDCLIENT == "1") {
                            try {
                                const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise();

                                consultIdecom = {
                                    P_SCLIENT: this.data_contractor.sclient,
                                    P_NOTHERLIST: resIdecon.isOtherList ? 1 : 0,
                                    P_NISPEP: resIdecon.isPep ? 1 : 0,
                                    P_NISFAMPEP: resIdecon.isFamPep ? 1 : 0,
                                    P_NNUMBERFAMPEP: resIdecon.isIdNumberFamPep ? 1 : 0,
                                    P_SUPDCLIENT: '1'
                                }

                                this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                if (this.idecon_contractor.pep === 'SÍ' || this.idecon_contractor.famPep === 'SÍ') {
                                    this.check_input_relationship = 1;
                                }

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            } catch (error) {
                                this.isLoading = false;
                                Swal.fire('Información', 'Error al consultar IDECON para el Contratante.', 'error');
                                this.isLoading = true;
                            }
                        } else {
                            this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                            if (this.idecon_contractor.pep === 'SÍ' || this.idecon_contractor.famPep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }
                            // this.isLoading = false;
                        }
                    }
                }
            );
        } else {
            datosIdecom = {
                name: this.data_insured.names + ' ' + this.data_insured.last_name + ' ' + this.data_insured.last_name2,
                idDocNumber: this.data_insured.document_number,
                percentage: 100,
                typeDocument: ""
            }
            sclientIdecom = { P_SCLIENT: this.data_insured.sclient }
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

                    if (consultIdecom.P_SCLIENT == null || consultIdecom.P_SCLIENT == "") {
                        
                        try {
                            const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise();
                        
                            consultIdecom = {
                                P_SCLIENT: this.data_insured.sclient,
                                P_NOTHERLIST: resIdecon.isOtherList ? 1 : 0,
                                P_NISPEP: resIdecon.isPep ? 1 : 0,
                                P_NISFAMPEP: resIdecon.isFamPep ? 1 : 0,
                                P_NNUMBERFAMPEP: resIdecon.isIdNumberFamPep ? 1 : 0,
                                P_SUPDCLIENT: '0'
                            }

                            this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                            if (this.idecon_insured.pep === 'SÍ' || this.idecon_insured.famPep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }

                            await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                        } catch (error) {
                            this.isLoading = false;
                            Swal.fire('Información', 'Error al consultar IDECON para el Asegurado.', 'error');
                            this.isLoading = true;
                        }
                    } else {
                        if (consultIdecom.P_SUPDCLIENT == "1") {
                            
                            try {
                                const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise();
                                
                                consultIdecom = {
                                    P_SCLIENT: this.data_insured.sclient,
                                    P_NOTHERLIST: resIdecon.isOtherList ? 1 : 0,
                                    P_NISPEP: resIdecon.isPep ? 1 : 0,
                                    P_NISFAMPEP: resIdecon.isFamPep ? 1 : 0,
                                    P_NNUMBERFAMPEP: resIdecon.isIdNumberFamPep ? 1 : 0,
                                    P_SUPDCLIENT: '1'
                                }

                                this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                if (this.idecon_insured.pep === 'SÍ' || this.idecon_insured.famPep === 'SÍ') {
                                    this.check_input_relationship = 1;
                                }

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            } catch (error) {
                                this.isLoading = false;
                                Swal.fire('Información', 'Error al consultar IDECON para el Asegurado.', 'error');
                                this.isLoading = true;
                            }
                        } else {
                            this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                            if (this.idecon_insured.pep === 'SÍ' || this.idecon_insured.famPep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }
                            // this.isLoading = false;
                        }
                    }
                }
            );
        }

        /*INI VIGP 17112025*/
        if(client_type == 1){
            this.data_contractor.idecon = consultIdecom.P_NOTHERLIST;
        } else {
            this.data_insured.idecon = consultIdecom.P_NOTHERLIST;
        }
        /*FIN VIGP 17112025*/
    }

    async setDepartmentContractor(id: any) {
        await this.addressService.getDepartmentList().toPromise().then(res => {
            this.list_data_contractor_department = res;
            this.data_contractor.department = { Id: id };
        })
    }

    async setProvinceContractor(department_id, province_id) {
        await this.addressService.getProvinceList(department_id).toPromise().then(async res => {
            this.list_data_contractor_province = res;
            this.data_contractor.province = { Id: province_id };
        })
    }

    async setDistrictContractor(province_id, municipality_id) {
        await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
            this.list_data_contractor_district = res;
            this.data_contractor.district = { Id: parseInt(municipality_id) };
        })
    }


    async setDepartmentInsured(id: any) {
        await this.addressService.getDepartmentList().toPromise().then(res => {
            this.list_data_insured_department = res;
            this.data_insured.department = { Id: id }
        })
    }

    async setProvinceInsured(department_id, province_id) {

        await this.addressService.getProvinceList(department_id).toPromise().then(async res => {
            this.list_data_insured_province = res;
            this.data_insured.province = { Id: province_id };
        })
    }

    async setDistrictInsured(province_id, municipality_id) {

        await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
            this.list_data_insured_district = res;
            this.data_insured.district = { Id: parseInt(municipality_id) }
        })
    }

    async consultDataProspect(search_type) {
        let params_cons = {
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_NTYPE_CLIENT: search_type
        };
        this.data_insured.relation = { COD_ELEMENTO: 0 };
        
        await this.vidaInversionService.consultProspect(params_cons).toPromise().then(
            async res => {

                this.check_input_value = res.P_NID_ASCON;
                this.check_input_value_360 = res.P_NID_ASCON;

                if (this.check_input_value == 0) {
                    // Contratante Distinto al ASEGURADO
                    this.data_insured.type_document = { Id: res.P_NTYPE_DOCUMENT };
                    this.data_insured.document_number = res.P_SNUMBER_DOCUMENT_INSURED.trim();
                    console.log("Obtiene relacion...");
                    if (res.P_SRELATION == null) { // PARENTESCO
                        this.data_insured.relation = { COD_ELEMENTO: 0 };
                    } else {
                        this.data_insured.relation = { COD_ELEMENTO: parseInt(res.P_SRELATION) };
                    }
                    console.log("Relacion obtenida: ", this.data_insured.relation);
                    
                    this.nregister_parentesco = this.data_insured.relation;
                    // Asegurado
                    const params_360 = {
                        P_TIPOPER: 'CON',
                        P_NUSERCODE: this.cur_usr.id,
                        P_NIDDOC_TYPE: this.data_insured.type_document.Id,
                        P_SIDDOC: this.data_insured.document_number,
                    };

                    await this.clientInformationService.getCliente360(params_360).toPromise().then(
                        async res => {
                            if (res.P_NCODE === "0") {
                                if (res.EListClient[0].P_SCLIENT == null) {
                                    // No se tiene registro el SCLIENT indicado
                                } else {
                                    // 2 Insured
                                    if (res.EListClient.length === 1) {
                                        res.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, res.EListClient[0].P_SCLIENT);
                                        if (res.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2 && this.FL_DATA_QUALITY) {
                                            this.data_insured.document_number = "";
                                            this.data_insured.type_document = { Id: 0 };
                                            this.clearData(2);

                                            this.isLoading = false;
                                            Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error');
                                        } else {
                                            //debugger;
                                            await this.cargarDatosInsured(res); 
                                            if (params_360.P_NIDDOC_TYPE == 2) {
                                                this.data_insured.nationality_disabled = true;
                                                this.data_insured.civil_status_disabled = true;
                                            }
                                            await this.getDataIdeconClient(2); // VIGP-KAFG 04/04/2025 // TEMP 070082025
                                            await this.getWorldCheck(2); // 5112025
                                            await this.invokeServiceExperia(2); // 5112025
                                            // if(!this.FL_DATA_QUALITY)this.enableInputs(2,false);
                                            await this.ConsultDataComplementary(2);  // VIGP-KAFG 04/04/2025 (Asegurado)
                                            await this.getDataRegNegativoClient(2); /*VIGP 17112025 */
                                            this.data_insured_360 = { ...this.data_insured }; // Almacenando la Info de Inicio del 360 para el Asegurado en una Variable                                            
                                        }
                                    }
                                }
                            }
                        }, error => {
                            this.isLoading = false;
                            Swal.fire('Información', 'Ocurrió un problema al solicitar su petición.', 'error');
                        }
                    )
                }
            })
    }

    async cargarDatosInsured(res: any) {        
        const contracting_data = res.EListClient[0];

        this.data_insured.names = contracting_data.P_SFIRSTNAME;
        this.data_insured.last_name = contracting_data.P_SLASTNAME;
        this.data_insured.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_insured.sclient = contracting_data.P_SCLIENT;

        if (this.data_insured.type_document.Id == 4) {
            this.homologacionInsu = "__";
        } else {
            this.homologacionInsu = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        }
        
        // this.homologacionInsu = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        // let split_date = contracting_data.P_DBIRTHDAT.split('/');
        // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;
        if (contracting_data.P_DBIRTHDAT == null) {

        } else {
            let split_date = contracting_data.P_DBIRTHDAT.split('/');
            this.data_insured.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        }
        this.data_insured.gender = { SSEXCLIEN: contracting_data.P_SSEXCLIEN };
        this.data_insured.civil_status = { NCIVILSTA: contracting_data.P_NCIVILSTA };

        this.data_insured.nationality = { NNATIONALITY: contracting_data.P_NNATIONALITY };


        if (contracting_data.EListEmailClient.length >= 1) {
            this.data_insured.email = contracting_data.EListEmailClient[0].P_SE_MAIL;
        }


        if (contracting_data.EListAddresClient.length >= 1) {
            this.data_insured.address = contracting_data.EListAddresClient[0].P_SDESDIREBUSQ;
            this.data_insured.department = { Id: parseInt(contracting_data.EListAddresClient[0].P_NPROVINCE) }

            await this.setDepartmentInsured(parseInt(contracting_data.EListAddresClient[0].P_NPROVINCE));

            await this.setProvinceInsured(parseInt(this.data_insured.department.Id), parseInt(contracting_data.EListAddresClient[0].P_NLOCAL));

            await this.setDistrictInsured(parseInt(this.data_insured.province.Id), parseInt(contracting_data.EListAddresClient[0].P_NMUNICIPALITY));

        } else {
            await this.addressService.getDepartmentList().toPromise().then(res => {
                this.list_data_insured_department = res;
                this.data_insured.department = { Id: null }
                this.list_data_insured_province = [];
                this.data_insured.province = { Id: null }
                this.list_data_insured_district = [];
                this.data_insured.district = { Id: null }
            });
        }

        if (contracting_data.EListPhoneClient.length >= 1) {
            this.data_insured.phone = contracting_data.EListPhoneClient[0].P_SPHONE;
        }

        this.data_insured_360 = { ...this.data_insured };
    }

    changeStyleCredit(input_name = "") {

        this.format_amount = parseInt(this.quotation.contribution.replace(/,/g, ''));

        this.parse_amount_contribution = CommonMethods.formatNUMBER(this.format_amount);
        this.quotation.contribution = this.parse_amount_contribution;

        if (this.quotation.contribution.toUpperCase() == "NAN") {
            this.quotation.contribution = '';
        }
    }

    checkAllQuotations(checked: boolean) {
        if (checked) {
            this.listadoCotizacionesVigentes.forEach(
                (value: any) => {
                    value.checked = true;
                }
            )
        } else {
            this.listadoCotizacionesVigentes.forEach(
                (value: any) => {
                    value.checked = false;
                }
            )
        }
    }

    isAllCheckQuotations() {
        this.masterChecked = this.listadoCotizacionesVigentes.every(
            function (item: any) {
                return item.checked == true;
            }
        )
    }

    format_360(search_type) {
        // search_type 1 para Contratante 2 Para Contratatne y Asegurado

        let formatter_data_360 = {};

        if (search_type == 1) {

            // let split_date = this.data_contractor.birthday_date.split('/');
            // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;

            const format_birthday = this.data_contractor.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_contractor.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_contractor.birthday_date.getFullYear();

            // Agrergar la Valdiacion que cuando se hace click en el Departamente busvcar si [items] esta vacio y si lo esta que llame el servicio 
            formatter_data_360 = {
                EListContactClient: [],
                EListCIIUClient: [],
                EListPhoneClient: [],
                EListEmailClient: [],
                P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                P_SIDDOC: this.data_contractor.document_number,
                P_TIPOPER: "INS",
                P_SFIRSTNAME: this.data_contractor.names,
                P_SLASTNAME: this.data_contractor.last_name,
                P_SLASTNAME2: this.data_contractor.last_name2,
                P_SLEGALNAME: "",
                P_SSEXCLIEN: this.data_contractor.gender.SSEXCLIEN,
                P_DBIRTHDAT: format_birthday,
                P_NSPECIALITY: "",
                P_NCIVILSTA: this.data_contractor.civil_status.NCIVILSTA, // this.data_contractor.civil_status.NCIVILSTA PASARLE EL CODE DE ESTADO CIVIL,
                P_SBLOCKADE: "2",
                P_NTITLE: "99",
                P_NHEIGHT: null,
                P_ORIGEN_DATA: "GESTORCLIENTE",
                P_NNATIONALITY: this.data_contractor.nationality.NNATIONALITY, // Cambio de pais
                // P_NNATIONALITY: "1", // Cambio de pais
                P_SBLOCKLAFT: "2",
                P_SISCLIENT_IND: "2",
                P_SISRENIEC_IND: "2",
                P_SISCLIENT_GBD: "2",
                P_SPOLIZA_ELECT_IND: "2",
                P_SPROTEG_DATOS_IND: "2",
                P_COD_CUSPP: "",
                P_NUSERCODE: this.cur_usr.id,
            }            

            if ((this.data_contractor.phone || "").trim() !== "" && this.nregister_contractor_telf == 1) {                
                formatter_data_360 = {
                    ...formatter_data_360, EListPhoneClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: this.cur_usr.id,
                        P_DESAREA: "",
                        P_DESTIPOTLF: "Celular",
                        P_NAREA_CODE: null,
                        P_NEXTENS1: "",
                        P_NPHONE_TYPE: "2",
                        P_NROW: 1,
                        P_SPHONE: this.data_contractor.phone,
                        P_SNOMUSUARIO: "",
                        P_DCOMPDATE: "",
                        P_TIPOPER: "",
                        P_CLASS: ""
                    }]
                }
            }

            if ((this.data_contractor.email || "").trim() !== "" && this.nregister_contractor_corr == 1) {                
                // Actualizacion de Correo Personal
                formatter_data_360 = {
                    ...formatter_data_360, EListEmailClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: this.cur_usr.id,
                        P_DESTICORREO: "Trabajo",
                        P_NROW: 1,
                        P_SE_MAIL: this.data_contractor.email,
                        P_SRECTYPE: 4,
                        P_TIPOPER: "",
                        P_CLASS: ""
                    }]
                }

            }
        }
        else {



            const format_birthday = this.data_insured.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_insured.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_insured.birthday_date.getFullYear();

            formatter_data_360 = {
                EListContactClient: [],
                EListCIIUClient: [],
                EListPhoneClient: [],
                EListEmailClient: [],
                P_NIDDOC_TYPE: this.data_insured.type_document.Id,
                P_SIDDOC: this.data_insured.document_number,
                P_TIPOPER: "INS",
                P_SFIRSTNAME: this.data_insured.names,
                P_SLASTNAME: this.data_insured.last_name,
                P_SLASTNAME2: this.data_insured.last_name2,
                P_SLEGALNAME: "",
                P_SSEXCLIEN: this.data_insured.gender.SSEXCLIEN,
                P_DBIRTHDAT: format_birthday,
                P_NSPECIALITY: "",
                P_NCIVILSTA: this.data_insured.civil_status.NCIVILSTA, // this.data_insured.civil_status.NCIVILSTA PASARLE EL CODE DE ESTADO CIVIL,
                P_SBLOCKADE: "2",
                P_NTITLE: "99",
                P_NHEIGHT: null,
                P_ORIGEN_DATA: "GESTORCLIENTE",
                P_NNATIONALITY: this.data_insured.nationality.NNATIONALITY, // Cambio de pais
                P_SBLOCKLAFT: "2",
                P_SISCLIENT_IND: "2",
                P_SISRENIEC_IND: "2",
                P_SISCLIENT_GBD: "2",
                P_SPOLIZA_ELECT_IND: "2",
                P_SPROTEG_DATOS_IND: "2",
                P_COD_CUSPP: "",
                P_NUSERCODE: this.cur_usr.id,
            }            

            if ((this.data_insured.phone || "").trim() !== "" && this.nregister_insured_telf == 1) {                
                formatter_data_360 = {
                    ...formatter_data_360, EListPhoneClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: this.cur_usr.id,
                        P_DESAREA: "",
                        P_DESTIPOTLF: "Celular",
                        P_NAREA_CODE: null,
                        P_NEXTENS1: "",
                        P_NPHONE_TYPE: "2",
                        P_NROW: 1,
                        P_SPHONE: this.data_insured.phone,
                        P_SNOMUSUARIO: "",
                        P_DCOMPDATE: "",
                        P_TIPOPER: "",
                        P_CLASS: ""
                    }]
                }
            }

            if ((this.data_insured.email || "").trim() !== "" && this.nregister_insured_corr == 1) {                
                // Actualizacion de Correo Personal
                formatter_data_360 = {
                    ...formatter_data_360, EListEmailClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: this.cur_usr.id,
                        P_DESTICORREO: "Trabajo",
                        P_NROW: 1,
                        P_SE_MAIL: this.data_insured.email,
                        P_SRECTYPE: 4,
                        P_TIPOPER: "",
                        P_CLASS: ""
                    }]
                }

            }
        }
        return formatter_data_360;
    }


    validateForUpdateClient() {

        let response = false;

        if (this.data_contractor.type_document.Id != this.data_contractor_360.type_document.Id) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.document_number != this.data_contractor_360.document_number) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.birthday_date != this.data_contractor_360.birthday_date) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.names != this.data_contractor_360.names) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.last_name != this.data_contractor_360.last_name) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.last_name2 != this.data_contractor_360.last_name2) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.gender.SSEXCLIEN != this.data_contractor_360.gender.SSEXCLIEN) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.civil_status.NCIVILSTA != this.data_contractor_360.civil_status.NCIVILSTA) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.nationality.NNATIONALITY != this.data_contractor_360.nationality.NNATIONALITY) { response = true; this.nregister_contractor = 1; };
                
        if ((this.data_contractor.phone).trim() != (this.data_contractor_360.phone).trim()) { response = true; this.nregister_contractor = 1; this.nregister_contractor_telf = 1;}; 

        if ((this.data_contractor.email).trim() != (this.data_contractor_360.email).trim()) { response = true; this.nregister_contractor = 1; this.nregister_contractor_corr = 1;};

        if ((this.data_contractor.address).trim() != (this.data_contractor_360.address).trim()) { response = true; this.nregister_contractor = 1; this.nregister_contractor_dire = 1;};

        if (this.data_contractor.department.Id != this.data_contractor_360.department.Id) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.province.Id != this.data_contractor_360.province.Id) { response = true; this.nregister_contractor = 1; };

        if (this.data_contractor.district.Id != this.data_contractor_360.district.Id) { response = true; this.nregister_contractor = 1; };

        if (this.check_input_value != this.check_input_value_360) { response = true; this.nregister_contractor = 1; };

        /*********** INI DATOS COMPLEMENTARIOS DEL CONTRATISTA ************/
        if (this.data_complementary.occupation_status.Id != this.nregister_noccupation) { this.nregister_contractor = 1; };

        if (this.data_complementary.centro_trabajo != this.nregister_scentro_trabajo) { this.nregister_contractor = 1; };

        if (this.data_complementary.cargo != this.nregister_scargo) { this.nregister_contractor = 1; };

        if (this.check_input_nationality != this.nregister_nnatusa) { this.nregister_contractor = 1; };

        if (this.check_input_relationship != this.nregister_nconpargc) { this.nregister_contractor = 1; };

        if (this.check_input_fiscal_obligations != this.nregister_nofistri) { this.nregister_contractor = 1; };

        if (this.check_input_obligated_subject != this.nregister_nobligated_subject) { this.nregister_contractor = 1; }; // VIGP-KAFG 02/04/2025

        if (this.check_input_calidad_socio != this.nregister_calidad_socio || this.check_input_calidad_socio == 1) { this.nregister_contractor = 1; }; // VIGP-KAFG 09/07/2025

        /*********** FIN DATOS COMPLEMENTARIOS DEL CONTRATISTA ************/

        // Contratante === Asegurado SI = 1 / Contratante !== Asegurado NO = 0
        if (this.check_input_value == 0) {

            if (this.data_insured.type_document.Id != this.data_insured_360.type_document.Id) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.document_number != this.data_insured_360.document_number) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.birthday_date != this.data_insured_360.birthday_date) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.names != this.data_insured_360.names) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.last_name != this.data_insured_360.last_name) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.last_name2 != this.data_insured_360.last_name2) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.gender.SSEXCLIEN != this.data_insured_360.gender.SSEXCLIEN) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.civil_status.NCIVILSTA != this.data_insured_360.civil_status.NCIVILSTA) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.nationality.NNATIONALITY != this.data_insured_360.nationality.NNATIONALITY) { response = true; this.nregister_insured = 1; };
            
            if ((this.data_insured.phone).trim() != (this.data_insured_360.phone).trim()) { response = true; this.nregister_insured = 1; this.nregister_insured_telf = 1};
            
            if ((this.data_insured.email).trim() != (this.data_insured_360.email).trim()) { response = true; this.nregister_insured = 1; this.nregister_insured_corr = 1};
            
            if ((this.data_insured.address).trim() != (this.data_insured_360.address).trim()) { response = true; this.nregister_insured = 1; this.nregister_insured_dire = 1};

            if (this.data_insured.department.Id != this.data_insured_360.department.Id) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.province.Id != this.data_insured_360.province.Id) { response = true; this.nregister_insured = 1; };

            if (this.data_insured.district.Id != this.data_insured_360.district.Id) { response = true; this.nregister_insured = 1; };

            if (this.nregister_parentesco?.COD_ELEMENTO != this.data_insured.relation.COD_ELEMENTO) { response = true; this.nregister_insured = 1; }; //parentesco

            // INI VIGP-KAFG 04/04/2025
            /*********** INI DATOS COMPLEMENTARIOS DEL ASEGURADO ************/
            if (this.data_occuptacion_insu.occupation_status.Id != this.nregister_insu_noccupation) { this.nregister_insured = 1; };

            if(this.data_occuptacion_insu.centro_trabajo != this.nregister_insu_scentro_trabajo) { this.nregister_insured = 1; };

            if(this.data_occuptacion_insu.cargo != this.nregister_insu_scargo ) { this.nregister_insured = 1; };

            if (this.check_input_insu_nationality != this.nregister_insu_nnatusa) { this.nregister_insured = 1; };

            if (this.check_input_insu_relationship != this.nregister_insu_nconpargc) { this.nregister_insured = 1; };

            if (this.check_input_insu_fiscal_obligations != this.nregister_insu_nofistri) { this.nregister_insured = 1; };

            if (this.check_input_insu_obligated_subject != this.nregister_insu_nobligated_subject) { this.nregister_insured = 1; }; // VIGP-KAFG 02/04/2025

            if (this.check_input_insu_calidad_socio != this.nregister_insu_calidad_socio || this.check_input_insu_calidad_socio == 1) { this.nregister_insured = 1; }; // VIGP-KAFG 09/07/2025
            /*********** FIN DATOS COMPLEMENTARIOS DEL ASEGURADO ************/
            // FIN VIGP-KAFG 04/04/2025
        }

        /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL CONTRATANTE ******************* */
        if (this.nregister_contractor == 1) {
            this.data_quotation_complementary.P_NID_PROSPECT = this.prospect_id;
            this.data_quotation_complementary.P_NTYPE_CLIENT = 1;
            this.data_quotation_complementary.P_SNUMBER_DOCUMENT = this.data_contractor.document_number;
            this.data_quotation_complementary.P_NOCCUPATION = this.data_complementary.occupation_status.Id;
            this.data_quotation_complementary.P_SCENTRO_TRABAJO = this.data_complementary.centro_trabajo; // VIGP-KAFG 02/04/2025
            this.data_quotation_complementary.P_SCARGO = this.data_complementary.cargo; // VIGP-KAFG 02/04/2025
            this.data_quotation_complementary.P_NNATUSA = this.check_input_nationality;
            this.data_quotation_complementary.P_NOBLIGATED_SUBJECT = this.check_input_obligated_subject; // VIGP-KAFG 02/04/2025
            this.data_quotation_complementary.P_NCALIDAD_SOCIO = this.check_input_calidad_socio; // VIGP-KAFG 09/07/2025
            this.data_quotation_complementary.P_NCONPARGC = this.check_input_relationship;
            this.data_quotation_complementary.P_NOFISTRI = this.check_input_fiscal_obligations;
            this.data_quotation_complementary.P_USER = this.cur_usr.id;
        }

        // INI VIGP-KAFG 04/04/2025
        /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO ******************* */
        if (this.check_input_value == 0 && this.nregister_insured == 1) {
            this.data_complementary_insu.P_NID_PROSPECT = this.prospect_id;
            this.data_complementary_insu.P_NTYPE_CLIENT = 2;
            this.data_complementary_insu.P_SNUMBER_DOCUMENT = this.data_insured.document_number;
            this.data_complementary_insu.P_NOCCUPATION = this.data_occuptacion_insu.occupation_status.Id;
            this.data_complementary_insu.P_SCENTRO_TRABAJO = this.data_occuptacion_insu.centro_trabajo;
            this.data_complementary_insu.P_SCARGO = this.data_occuptacion_insu.cargo;
            this.data_complementary_insu.P_NNATUSA = this.check_input_insu_nationality;
            this.data_complementary_insu.P_NOBLIGATED_SUBJECT = this.check_input_insu_obligated_subject; // VIGP-KAFG 02/04/2025
            this.data_complementary_insu.P_NCALIDAD_SOCIO = this.check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025
            this.data_complementary_insu.P_NCONPARGC = this.check_input_insu_relationship;
            this.data_complementary_insu.P_NOFISTRI = this.check_input_insu_fiscal_obligations;
            this.data_complementary_insu.P_USER = this.cur_usr.id;

        }
        // FIN VIGP-KAFG 04/04/2025
        return response;
    }

    async updateDataClient360(myFormData, isProspectObserved = false) { /*VIGP 17112025*/
        if(isProspectObserved) console.log("Prospecto en estado Observado, solo se actualizará el prospecto");
        let formatter_data = this.formatter_data_prospect(isProspectObserved); /*VIGP 17112025*/
        let prospect_data = [];

        try {

            // SOLO CONTRATANTE
            if (this.check_input_value == 1) {

                /* DGC - 17/01/2024 - INICIO */
                // CONTRATANTE
                if (this.data_contractor.type_document.Id == 2 && (this.data_contractor.nationality == "" || this.data_contractor.nationality.codigo == "")) {
                    this.data_contractor.nationality = { NNATIONALITY: 1 };
                }
                if (this.data_contractor.type_document.Id == 4 && (this.data_contractor.nationality == "" || this.data_contractor.nationality.codigo == "")) {
                    this.data_contractor.nationality = { NNATIONALITY: 276 };
                }
                if (this.data_contractor.civil_status == "" || this.data_contractor.civil_status.codigo == "") {
                    this.data_contractor.civil_status = { NCIVILSTA: -1 };
                }
                /* DGC - 17/01/2024 - FIN */

                //let prospect_data = [];
                prospect_data.push(formatter_data.contractor_data);

                let update_client_360 = this.format_360(1); // Para enviar al 360
                const update_client_360_response = await this.clientInformationService.getCliente360(update_client_360).toPromise();

                if (update_client_360_response.P_NCODE == 1) {
                    throw new Error(update_client_360_response.P_SMESSAGE);
                }

                // Validacion para actualizar la ubicacion del Contratante
                if (
                    (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                    (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                    (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                    (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                ) {
                    // no entra porque no hay datos de ubigeo
                }
                else if(this.nregister_contractor_dire == 1) {
                    let contractor_ubication = {
                        P_NRECOWNER: "2",
                        P_SRECTYPE: "2",
                        P_NIDDOC_TYPE: this.data_contractor.type_document.Id.toString(),
                        P_SIDDOC: this.data_contractor.document_number,
                        // P_NCOUNTRY: this.data_contractor.nationality.NNATIONALITY.toString() == "" ? "1": this.data_contractor.nationality.NNATIONALITY.toString(),
                        P_NCOUNTRY: "1",
                        P_NUSERCODE: this.cur_usr.id.toString(),
                        P_NPROVINCE: this.data_contractor.department.Id ? this.data_contractor.department.Id.toString() : null,
                        P_NLOCAL: this.data_contractor.province.Id ? this.data_contractor.province.Id.toString() : null,
                        P_NMUNICIPALITY: this.data_contractor.district.Id ? this.data_contractor.district.Id.toString() : null,
                        P_SREFERENCE: "referencial",
                        P_SNOM_DIRECCION: this.data_contractor.address,
                        P_SORIGEN: "SCTRM",
                        // P_NRECOWNER: "2",
                        // P_SRECTYPE: "2",
                        // P_NIDDOC_TYPE: "2",
                        // P_SIDDOC: "27725666",
                        // P_NCOUNTRY: "1",
                        // P_NUSERCODE: "1",
                        // P_NPROVINCE: "14",
                        // P_NLOCAL: "1401",
                        // P_SREFERENCE: "cerca",
                        // P_NMUNICIPALITY: "140101",
                        // P_SNOM_DIRECCION: "AV ROOSELVET",
                        // P_SORIGEN: "SCTRM"
                    }

                    const save_direction_contractor_response = await this.vidaInversionService.saveDirection(contractor_ubication).toPromise().then();

                    if (![0, 2].includes(save_direction_contractor_response.P_NCODE)) {
                        throw new Error(save_direction_contractor_response.P_SMESSAGE);
                    }
                }

                const insert_prospect_response = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                if (insert_prospect_response.P_NCODE == 1) {
                    throw new Error(insert_prospect_response.P_SMESSAGE);
                }else{
                    /*INI VIGP 17112025*/
                    if(isProspectObserved){ 
                        this.isLoading = false;
                        await Swal.fire('Información', 'El contratante o asegurado se encuentran en otras listas de idecon, world check o riesgo negativo, el prospecto sera actualizado.', 'error');
                        this.router.navigate(['extranet/vida-inversion/prospectos']); 
                        return;
                    }
                    /*FIN VIGP 17112025*/
                }

                const resComp1 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary).toPromise();
                if (resComp1.P_NCODE == 1) {
                    Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                    return;
                } else {

                    // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                }

                if(!isProspectObserved){
                    const insert_quotation_response = await this.quotationService.insertQuotation(myFormData).toPromise();
                    console.log("insert_quotation_response: ", insert_quotation_response)
                    if (insert_quotation_response.P_COD_ERR !== 0) {
                        throw new Error(insert_quotation_response.P_MESSAGE);
                    }

                    this.current_quotation = insert_quotation_response.P_NID_COTIZACION;

                    await this.insupdOrigenPep(this.current_quotation);

                    // DGC - PERFILAMIENTO
                    const myFormDataPerfilamiento: FormData = new FormData();
                    const response_items = this.getRespuestasPerfilamiento();
                    const search_scoring = this.getSearchScoring();
                    this.vidaInversionService.RequestScoring(search_scoring).toPromise().then(res => {

                        if (res.P_COD_ERR == 1) { }  //Error
                        // else if (res.P_COD_ERR == 2) { } // Es porque se puede registrar, no existe data en las tablas
                        else {
                            this.perfilamiento.perfilamiento_exist = res.P_COD_ERR == 0 ? true : false;
                            const request_perfilamiento = {
                                P_NID_COTIZACION: this.current_quotation,
                                P_NBRANCH: this.CONSTANTS.RAMO,
                                P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                                P_UPDATE_PERFILAMIENTO: this.perfilamiento.perfilamiento_exist,
                                P_PERFILAMIENTO_ITEMS: response_items
                            };
                            myFormDataPerfilamiento.append('respuestas_perfilamiento', JSON.stringify(request_perfilamiento));
                            this.vidaInversionService.InsPerfilamiento(myFormDataPerfilamiento).toPromise().then((res) => {
                                if (res.P_COD_ERR == 1) {
                                    throw new Error("Ocurrió un problema en el cálculo del perfilamiento");
                                }
                            });
                        }
                    });

                    this.mostrarCotizacionesVigentesXusuario();
                    this.mostrarCotizacionesNoVigentesXusuario();
                    this.cleanQuoteData();

                    Swal.fire({
                        text: `La cotización ${this.current_quotation} se generó correctamente.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: false
                    })
                }

            }

            // CONTRATANTE Y ASEGURADO
            else {

                /* DGC - 17/01/2024 - INICIO */
                // CONTRATANTE
                if (this.data_contractor.type_document.Id == 2 && (this.data_contractor.nationality == "" || this.data_contractor.nationality.codigo == "")) {
                    this.data_contractor.nationality = { NNATIONALITY: 1 };
                }
                if (this.data_contractor.type_document.Id == 4 && (this.data_contractor.nationality == "" || this.data_contractor.nationality.codigo == "")) {
                    this.data_contractor.nationality = { NNATIONALITY: 276 };
                }
                if (this.data_contractor.civil_status == "" || this.data_contractor.civil_status.codigo == "") {
                    this.data_contractor.civil_status = { NCIVILSTA: -1 };
                }
                // ASEGURADO
                if (this.data_insured.type_document.Id == 2 && (this.data_insured.nationality == "" || this.data_insured.nationality.codigo == "")) {
                    this.data_insured.nationality = { NNATIONALITY: 1 };
                }
                if (this.data_insured.type_document.Id == 4 && (this.data_insured.nationality == "" || this.data_insured.nationality.codigo == "")) {
                    this.data_insured.nationality = { NNATIONALITY: 276 };
                }
                if (this.data_insured.civil_status == "" || this.data_insured.civil_status.codigo == "") {
                    this.data_insured.civil_status = { NCIVILSTA: -1 };
                }
                /* DGC - 17/01/2024 - FIN */

                let prospect_data = [];
                prospect_data.push(formatter_data.contractor_data);
                prospect_data.push(formatter_data.insured_data); // Agregando Asegurado

                // Si el Asegurado no esta registrado en el 360
                if (this.new_client_insured == true) {

                    let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado

                    // Asegurado
                    const response_upd_client_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();

                    if (response_upd_client_insured.P_NCODE == 1) {
                        throw new Error(response_upd_client_insured.P_SMESSAGE);
                    }

                    prospect_data[1].P_SCLIENT = response_upd_client_insured.P_SCOD_CLIENT.toString().trim();
                    this.data_insured.sclient = response_upd_client_insured.P_SCOD_CLIENT.toString().trim();

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) { }
                    else if(this.nregister_insured_dire == 1) {

                        let insured_ubication = {
                            P_NRECOWNER: "2",
                            P_SRECTYPE: "2",
                            P_NIDDOC_TYPE: this.data_insured.type_document.Id.toString(),
                            P_SIDDOC: this.data_insured.document_number,
                            P_NCOUNTRY: "1",
                            P_NUSERCODE: this.cur_usr.id.toString(),
                            P_NPROVINCE: this.data_insured.department.Id.toString(),
                            P_NLOCAL: this.data_insured.province.Id.toString(),
                            P_NMUNICIPALITY: this.data_insured.district.Id.toString(),
                            P_SREFERENCE: "referencial",
                            P_SNOM_DIRECCION: this.data_insured.address,
                            P_SORIGEN: "SCTRM",
                        }

                        const response_save_direction_insured = await this.vidaInversionService.saveDirection(insured_ubication).toPromise();

                        if (![0, 2].includes(response_save_direction_insured.P_NCODE)) {
                            throw new Error(response_save_direction_insured.P_SMESSAGE);
                        }
                    }


                    const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                    if (response_insert_prospect.P_NCODE == 1) {
                        throw new Error(response_insert_prospect.P_SMESSAGE);
                    }

                    const resComp1 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary).toPromise();
                    if (resComp1.P_NCODE == 1) {
                        Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                        return;
                    } else {

                        /*INI VIGP 17112025*/
                        if(isProspectObserved){ 
                            this.isLoading = false;
                            await Swal.fire('Información', 'El contratante o asegurado se encuentran en otras listas de idecon, world check o riesgo negativo, el prospecto sera actualizado.', 'error');
                            this.router.navigate(['extranet/vida-inversion/prospectos']); 
                            return;
                        }
                        /*FIN VIGP 17112025*/

                        // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                    }

                    // INI VIGP-KAFG 04/04/2025
                    /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO ******************* */
                    if (this.check_input_value == 0 && this.nregister_insured == 1) {
                        const resComp2 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_complementary_insu).toPromise();
                        if (resComp2.P_NCODE == 1) {
                            Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                            return;
                        } else {

                            // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                        }
                    }

                    if(!isProspectObserved){ /*VIGP 17112025*/
                        const insert_quotation_response = await this.quotationService.insertQuotation(myFormData).toPromise();
                        console.log("insert_quotation_response: ", insert_quotation_response)
                        if (insert_quotation_response.P_COD_ERR !== 0) {
                            throw new Error(insert_quotation_response.P_MESSAGE);
                        }

                        this.current_quotation = insert_quotation_response.P_NID_COTIZACION;

                        await this.insupdOrigenPep(this.current_quotation);

                        // DGC - PERFILAMIENTO
                        const form_data_perfilamiento: FormData = new FormData();
                        const response_items = this.getRespuestasPerfilamiento();
                        const search_scoring = this.getSearchScoring();
                        this.vidaInversionService.RequestScoring(search_scoring).toPromise().then(async res => {

                            if (res.P_COD_ERR == 1) { }  //Error
                            // else if (res.P_COD_ERR == 2) { } // Es porque se puede registrar, no existe data en las tablas
                            else {
                                this.perfilamiento.perfilamiento_exist = res.P_COD_ERR == 0 ? true : false;
                                const request_perfilamiento = {
                                    P_NID_COTIZACION: this.current_quotation,
                                    P_NBRANCH: this.CONSTANTS.RAMO,
                                    P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                                    P_UPDATE_PERFILAMIENTO: this.perfilamiento.perfilamiento_exist,
                                    P_PERFILAMIENTO_ITEMS: response_items
                                };

                                form_data_perfilamiento.append('respuestas_perfilamiento', JSON.stringify(request_perfilamiento));

                                const respnose_ins_perfilamiento = await this.vidaInversionService.InsPerfilamiento(form_data_perfilamiento).toPromise();

                                if (respnose_ins_perfilamiento.P_COD_ERR == 1) {
                                    //this.dissabled_next_button = false;
                                    throw new Error("Ocurrió un problema en el cálculo del perfilamiento");
                                }
                            }
                        });

                        this.cleanQuoteData();
                        this.mostrarCotizacionesVigentesXusuario();
                        this.mostrarCotizacionesNoVigentesXusuario();

                        this.isLoading = false;

                        Swal.fire({
                            text: `La cotización ${insert_quotation_response.P_NID_COTIZACION} se generó correctamente.`,
                            icon: 'success',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showCloseButton: false
                        })
                        
                    } /*VIGP 17112025*/
                }
                else {

                    let update_client_360_contractor = this.format_360(1); // Para enviar al 360 Contratante
                    let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado

                    // Contratante
                    const response_update_client360_contractor = await this.clientInformationService.getCliente360(update_client_360_contractor).toPromise();

                    if (response_update_client360_contractor.P_NCODE == 1) {
                        throw new Error(response_update_client360_contractor.P_SMESSAGE);
                    }

                    if (
                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                    ) {
                        // no entra porque no hay datos de ubigeo
                    }
                    else if(this.nregister_contractor_dire == 1){

                        let contractor_ubication = {
                            P_NRECOWNER: "2",
                            P_SRECTYPE: "2",
                            P_NIDDOC_TYPE: this.data_contractor.type_document.Id.toString(),
                            P_SIDDOC: this.data_contractor.document_number,
                            P_NCOUNTRY: "1",
                            P_NUSERCODE: this.cur_usr.id.toString(),
                            P_NPROVINCE: this.data_contractor.department.Id.toString(),
                            P_NLOCAL: this.data_contractor.province.Id.toString(),
                            P_NMUNICIPALITY: this.data_contractor.district.Id.toString(),
                            P_SREFERENCE: "referencial",
                            P_SNOM_DIRECCION: this.data_contractor.address,
                            P_SORIGEN: "SCTRM",
                        }

                        const response_save_direction_contractor = await this.vidaInversionService.saveDirection(contractor_ubication).toPromise();

                        if (![0, 2].includes(response_save_direction_contractor.P_NCODE)) {
                            throw new Error(response_save_direction_contractor.P_SMESSAGE);
                        }
                    }

                    // Asegurado
                    const response_save_direction_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();

                    if (response_save_direction_insured.P_NCODE == 1) {
                        throw new Error(response_save_direction_insured.P_SMESSAGE);
                    }

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) {

                    } else if(this.nregister_insured_dire == 1) {

                        let insured_ubication = {
                            P_NRECOWNER: "2",
                            P_SRECTYPE: "2",
                            P_NIDDOC_TYPE: this.data_insured.type_document.Id.toString(),
                            P_SIDDOC: this.data_insured.document_number,
                            P_NCOUNTRY: "1",
                            P_NUSERCODE: this.cur_usr.id.toString(),
                            P_NPROVINCE: this.data_insured.department.Id.toString(),
                            P_NLOCAL: this.data_insured.province.Id.toString(),
                            P_NMUNICIPALITY: this.data_insured.district.Id.toString(),
                            P_SREFERENCE: "referencial",
                            P_SNOM_DIRECCION: this.data_insured.address,
                            P_SORIGEN: "SCTRM",
                        }

                        const response_save_direction_insured = await this.vidaInversionService.saveDirection(insured_ubication).toPromise();

                        if (![0, 2].includes(response_save_direction_insured.P_NCODE)) {
                            throw new Error(response_save_direction_insured.P_SMESSAGE);
                        }

                    }

                    const insert_prospect_response = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                    if (insert_prospect_response.P_NCODE == 1) {
                        throw new Error(insert_prospect_response.P_SMESSAGE);
                    }else{
                        /*INI VIGP 17112025*/
                        if(isProspectObserved){ 
                            this.isLoading = false;
                            await Swal.fire('Información', 'El contratante o asegurado se encuentran en otras listas de idecon, world check o riesgo negativo, el prospecto sera actualizado.', 'error');
                            this.router.navigate(['extranet/vida-inversion/prospectos']); 
                            return;
                        }
                        /*FIN VIGP 17112025*/
                    }

                    const resComp1 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary).toPromise();
                    if (resComp1.P_NCODE == 1) {
                        Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                        return;
                    } else {

                        // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                    }

                    // INI VIGP-KAFG 04/04/2025
                    /***************** ACTUALIZACION DE DATOS COMPLEMENTARIOS DEL ASEGURADO ******************* */
                    if (this.check_input_value == 0 && this.nregister_insured == 1) {
                        const resComp2 = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_complementary_insu).toPromise();
                        if (resComp2.P_NCODE == 1) {
                            Swal.fire('Información', 'Ha ocurrido un error al actualizar el archivo.', 'error');
                            return;
                        } else {

                            // Swal.fire('Información', 'Se actualizó el registro correctamente.', 'error');
                        }
                    }

                    if(!isProspectObserved){ /*VIGP 17112025*/
                        const insert_quotation_response = await this.quotationService.insertQuotation(myFormData).toPromise();
                        console.log("insert_quotation_response: ", insert_quotation_response)
                        if (insert_quotation_response.P_COD_ERR !== 0) {
                            throw new Error(insert_quotation_response.P_MESSAGE);
                        }

                        this.current_quotation = insert_quotation_response.P_NID_COTIZACION;
                        await this.insupdOrigenPep(this.current_quotation);

                        // DGC - PERFILAMIENTO
                        const form_data_perfilamiento: FormData = new FormData();
                        const response_items = this.getRespuestasPerfilamiento();
                        const search_scoring = this.getSearchScoring();
                        this.vidaInversionService.RequestScoring(search_scoring).toPromise().then(async (res) => {


                            if (res.P_COD_ERR == 1) { }  //Error
                            else {
                                this.perfilamiento.perfilamiento_exist = res.P_COD_ERR == 0 ? true : false;
                                const request_perfilamiento = {
                                    P_NID_COTIZACION: this.current_quotation,
                                    P_NBRANCH: this.CONSTANTS.RAMO,
                                    P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                                    P_UPDATE_PERFILAMIENTO: this.perfilamiento.perfilamiento_exist,
                                    P_PERFILAMIENTO_ITEMS: response_items
                                };
                                form_data_perfilamiento.append('respuestas_perfilamiento', JSON.stringify(request_perfilamiento));
                                await this.vidaInversionService.InsPerfilamiento(form_data_perfilamiento).toPromise().then((res) => {

                                    if (res.P_COD_ERR == 1) {
                                        throw new Error('Ocurrió un problema en el cálculo del perfilamiento');
                                    }
                                });
                            }
                        });

                        this.cleanQuoteData();
                        await this.mostrarCotizacionesVigentesXusuario();
                        await this.mostrarCotizacionesNoVigentesXusuario();

                        this.isLoading = false;
                        Swal.fire({
                            text: `La cotización ${this.current_quotation} se generó correctamente.`,
                            icon: 'success',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showCloseButton: false
                        });
                    }
                }
            }
        }
        catch (error) {
            Swal.fire({
                title: 'Información',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
        }
        finally { this.isLoading = false; }

    }


    formatter_data_prospect(isObserved: boolean) {

        const contractor_data = {
            P_NCHANNEL: this.cur_usr?.canal,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_SCLIENT: this.data_contractor.sclient,
            P_NTYPE_DOCUMENT: this.data_contractor.type_document.Id,
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_SNAMES: this.data_contractor.names ? this.data_contractor.names : null,
            P_SLASTNAME: this.data_contractor.last_name ? this.data_contractor.last_name : null,
            P_SLASTNAME2: this.data_contractor.last_name2 ? this.data_contractor.last_name2 : null,
            P_DDATEBIRTHDAY: this.data_contractor.birthday_date ? this.data_contractor.birthday_date : null,
            P_NID_SEX: this.data_contractor.gender ? this.data_contractor.gender.SSEXCLIEN : null,
            P_NID_NATION: this.data_contractor.nationality.NNATIONALITY,
            P_SCELLPHONE: this.data_contractor.phone,
            P_SEMAIL: this.data_contractor.email,
            P_SADDRESS: this.data_contractor.address,
            P_NID_DPTO: this.data_contractor.department.Id,
            P_NID_PROV: this.data_contractor.province.Id,
            P_NID_DIST: this.data_contractor.district.Id,
            P_NID_ASCON: this.check_input_value, // 1 Si , 0 NO
            P_NREG_NEGATIVE: this.riesgo_negativo_cont == 'SI' ? 1 : 0, /*VIGP 17112025 */
            P_NIDECON: this.data_contractor.idecon, /*VIGP 17112025 */
            P_WC: this.data_contractor.wc, /*VIGP 17112025 */
            P_NTYPE_CLIENT: 1,
            P_USER: this.cur_usr.id,
            P_SUSERNAME: this.cur_usr.username,
            P_REG_CONTRACTOR: this.nregister_contractor,
            P_REG_INSURED: this.nregister_insured,
            P_OBSERVED : isObserved ? 1 : 0 /*VIGP 17112025*/
        };

        const insured_data = {
            P_NCHANNEL: this.cur_usr?.canal,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_SCLIENT: this.data_insured.sclient,
            P_NTYPE_DOCUMENT: this.data_insured.type_document.Id,
            P_SNUMBER_DOCUMENT: this.data_insured.document_number,
            P_SNAMES: this.data_insured.names ? this.data_insured.names : null,
            P_SLASTNAME: this.data_insured.last_name ? this.data_insured.last_name : null,
            P_SLASTNAME2: this.data_insured.last_name2 ? this.data_insured.last_name2 : null,
            P_DDATEBIRTHDAY: this.data_insured.birthday_date ? this.data_insured.birthday_date : null,
            P_NID_SEX: this.data_insured.gender ? this.data_insured.gender.SSEXCLIEN : null,
            P_NID_NATION: this.data_insured.nationality.NNATIONALITY,
            P_SCELLPHONE: this.data_insured.phone,
            P_SEMAIL: this.data_insured.email,
            P_SADDRESS: this.data_insured.address,
            P_NID_DPTO: this.data_insured.department.Id,
            P_NID_PROV: this.data_insured.province.Id,
            P_NID_DIST: this.data_insured.district.Id,
            P_NID_ASCON: this.check_input_value, // 1 Si , 0 NO
            P_NREG_NEGATIVE: this.riesgo_negativo_insu == 'SI' ? 1 : 0, /*VIGP 17112025 */
            P_NIDECON: this.data_insured.idecon,  /*VIGP 17112025 */
            P_WC: this.data_insured.wc, /*VIGP 17112025 */
            P_NTYPE_CLIENT: 2,
            P_REG_CONTRACTOR: this.nregister_contractor,
            P_REG_INSURED: this.nregister_insured,
            P_SRELATION: this.data_insured.relation.COD_ELEMENTO,
            P_OBSERVED : isObserved ? 1 : 0 /*VIGP 17112025*/
        };

        let format_data = { contractor_data, insured_data };

        return format_data;

    }


    searchValidate(search_type) { // 1 Contratante 2 Asegurado

        const validate_res = { cod_error: "0", message: "" };

        if (search_type == 1) {

            if (this.data_contractor.type_document.Id == 2) {

                if (this.data_contractor.document_number.length == 7) {
                    this.data_contractor.document_number = this.data_contractor.document_number.padStart(8, "0");
                }

                if (!(this.data_contractor.document_number.length >= 7 && this.data_contractor.document_number.length <= 8)) {
                    validate_res.message = 'Cantidad de caracteres del DNI incorrecto.';
                    validate_res.cod_error = "1";
                }

            }

            if (this.data_contractor.type_document.Id == 4) {
                if (!(this.data_contractor.document_number.length >= 8 && this.data_contractor.document_number.length <= 12)) {
                    validate_res.message = 'Cantidad de caracteres del CE incorrecto.';
                    validate_res.cod_error = "1";
                }
            }

        }
        else if (search_type == 2) {

            if (this.data_insured.type_document.Id == 2) {

                if (this.data_insured.document_number.length == 7) {
                    this.data_insured.document_number = this.data_insured.document_number.padStart(8, "0");
                }

                if (!(this.data_insured.document_number.length >= 7 && this.data_insured.document_number.length <= 8)) {
                    validate_res.message = 'Cantidad de caracteres del DNI incorrecto.';
                    validate_res.cod_error = "1";
                }
            }

            if (this.data_insured.type_document.Id == 4) {
                if (!(this.data_insured.document_number.length >= 8 && this.data_insured.document_number.length <= 12)) {
                    validate_res.message = 'Cantidad de caracteres del CE incorrecto.';
                    validate_res.cod_error = "1";
                }
            }
        }
        return validate_res;
    }

    async clickBuscar(search_type) {

        const res = this.searchValidate(search_type);

        if (res.cod_error == "1") { Swal.fire('Información', res.message, 'error'); return; }

        this.isLoading = true;

        let params_360;

        if (search_type == 1) {
            params_360 = {
                P_TIPOPER: 'CON',
                P_NUSERCODE: this.cur_usr.id,
                P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                P_SIDDOC: this.data_contractor.document_number,
            };
        }
        else {
            // Asegurado
            params_360 = {
                P_TIPOPER: 'CON',
                P_NUSERCODE: this.cur_usr.id,
                P_NIDDOC_TYPE: this.data_insured.type_document.Id,
                P_SIDDOC: this.data_insured.document_number,
            };
        }

        const response_getcliente360 = await this.clientInformationService.getCliente360(params_360).toPromise();
        console.log("Option 1",response_getcliente360);
        if (response_getcliente360.P_NCODE === "0") {

            // No se tiene registro el SCLIENT indicado
            if (response_getcliente360.EListClient[0].P_SCLIENT == null) { }
            else {

                if (response_getcliente360.EListClient.length === 1) {

                    response_getcliente360.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, response_getcliente360.EListClient[0].P_SCLIENT);

                    if (search_type == 1) {
                        this.clearData(search_type);
                        await this.cargarDatosContractor(response_getcliente360, search_type);
                        await this.consultDataProspect(search_type);

                        await this.getDataIdeconClient(search_type); // TEMP 070082025
                        await this.getWorldCheck(search_type); // ARJG METODO ASINCRONO
                        await this.invokeServiceExperia(search_type); // ARJG METODO ASINCRONO
                        await this.getDataRegNegativoClient(search_type); /*VIGP 17112025*/
                    }
                    else { // 2 Insured

                        if (response_getcliente360.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2 && this.FL_DATA_QUALITY) {
                            this.data_insured.document_number = "";
                            this.data_insured.type_document = { Id: 0 };
                            this.clearData(search_type);

                            this.isLoading = false;
                            Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error');
                        } else {
                            this.clearData(2);                            
                            await this.cargarDatosInsured(response_getcliente360);                            
                            this.data_insured.nationality_disabled = true;
                            this.data_insured.civil_status_disabled = true;
                            // await this.consultDataProspect(2);
                            this.clearDataComplementary(2);
                            await this.getDataIdeconClient(2); // TEMP 070082025
                            await this.getWorldCheck(2); // ARJG METODO ASINCRONO
                            await this.invokeServiceExperia(2); // ARJG METODO ASINCRONO
                            await this.getDataRegNegativoClient(2); /*VIGP 17112025*/
                            this.isLoading = false;
                        }
                        // this.clearData(search_type);
                    }
                }
            }
        }

        else if (response_getcliente360.P_NCODE === "3") { // Se debe habilitar los campos para poder ingresar la Data y Crear el prospecto
            if (search_type == 2) {
                if (params_360.P_NIDDOC_TYPE == 4) {
                    this.enableInputs(search_type); // VIGP-KAFG 16/04/2025
                    Swal.fire('Información', 'No se encontró información, ingresar manualmente los datos.', 'error');
                } else {
                    if (search_type == 1) {
                        this.data_contractor.document_number = "";
                        this.data_contractor.type_document = { Id: 0 };
                    } else {
                        this.data_insured.document_number = "";
                        this.data_insured.type_document = { Id: 0 };
                    }

                    this.clearData(search_type);
                    Swal.fire('Información', 'No se encontró información.', 'error');
                }
                this.isLoading = false;
            } else {
                this.isLoading = false;
                Swal.fire('Información', 'No se encontró información, ingresar manualmente los datos.', 'error');
                // search_type == 2 && this.enableInputs(search_type);// Solo para el Asegurado
            }
        }
        else {
            this.clearData(search_type);
            this.isLoading = false;
            Swal.fire('Información', response_getcliente360.P_SMESSAGE, 'error');
        }
    }

    enableInputs(type: any, isReset: boolean = true) { // Cuando el 360 no llama Info

        if (type == 1) {// Contratante
            // this.data_contractor.docuemnt_number = "";
            if (isReset) {
                if (this.data_contractor.birthday_date != "") this.data_contractor.birthday_date = "";
                if (this.data_contractor.names != "") this.data_contractor.names = "";
                if (this.data_contractor.last_name != "") this.data_contractor.last_name = "";
                if (this.data_contractor.last_name2 != "") this.data_contractor.last_name2 = "";
                if (this.data_contractor.gender.codigo != "") this.data_contractor.gender = { codigo: "", text: "SELECCIONE" };
                if (this.data_contractor.civil_status.codigo != "") this.data_contractor.civil_status = { codigo: "", text: "SELECCIONE" };
                if (this.data_contractor.nationality.codigo != "") this.data_contractor.nationality = { codigo: "", text: "SELECCIONE" };
                if (this.data_contractor.phone != "") this.data_contractor.phone = "";
                if (this.data_contractor.email != "") this.data_contractor.email = "";
                if (this.data_contractor.address != "") this.data_contractor.address = "";


                if (this.data_contractor.department.Id != null) this.data_contractor.department = { Id: null };
                if (this.data_contractor.province.Id != null) this.data_contractor.province = { Id: null };
                if (this.data_contractor.district.Id != null) this.data_contractor.district = { Id: null };
            }

            this.data_contractor.type_document_disabled = false;
            this.data_contractor.document_number_disabled = false;
            this.data_contractor.birthday_date_disabled = false;
            this.data_contractor.names_disabled = false;
            this.data_contractor.last_name_disabled = false;
            this.data_contractor.last_name2_disabled = false;
            this.data_contractor.gender_disabled = false;
            this.data_contractor.civil_status_disabled = false;
            this.data_contractor.nationality_disabled = false;
            this.data_contractor.department_disabled = false;
            this.data_contractor.province_disabled = false;
            this.data_contractor.district_disabled = false;
            this.data_contractor.phone_disabled = false;
            this.data_contractor.email_disabled = false;
            this.data_contractor.address_disabled = false;
            this.contractor_province_department = false;
            this.contractor_province_selected = false;
            // this.list_data_contractor_province = [];
            // this.list_data_contractor_district = [];

            if (this.list_data_contractor_department.length == 0) {
                this.addressService.getDepartmentList().toPromise().then(res => {
                    this.list_data_contractor_department = res;
                    this.data_contractor.department = { Id: null }
                    this.list_data_contractor_province = [];
                    this.data_contractor.province = { Id: null }
                    this.list_data_contractor_district = [];
                    this.data_contractor.district = { Id: null }
                });
            }

        } else if (type == 2) { // Asegurado
            // this.data_insured.docuemnt_number = "";

            if (isReset) {
                if (this.data_insured.birthday_date != "") this.data_insured.birthday_date = "";
                if (this.data_insured.names != "") this.data_insured.names = "";
                if (this.data_insured.last_name != "") this.data_insured.last_name = "";
                if (this.data_insured.last_name2 != "") this.data_insured.last_name2 = "";
                if (this.data_insured.gender.codigo != "") this.data_insured.gender = { codigo: "", text: "SELECCIONE" };
                if (this.data_insured.civil_status.codigo != "") this.data_insured.civil_status = { codigo: "", text: "SELECCIONE" };
                if (this.data_insured.nationality.codigo != "") this.data_insured.nationality = { codigo: "", text: "SELECCIONE" };
                if (this.data_insured.phone != "") this.data_insured.phone = "";
                if (this.data_insured.email != "") this.data_insured.email = "";
                if (this.data_insured.address != "") this.data_insured.address = "";

                if (this.data_insured.province.Id != null) this.data_insured.province = { Id: null };
                if (this.data_insured.district.Id != null) this.data_insured.district = { Id: null };
                if (this.data_insured.department.Id != null) this.data_insured.department = { Id: null };
                if (this.data_insured.relation.codigo != "") this.data_insured.relation = { COD_ELEMENTO: 0 };
            }

            this.data_insured.type_document_disabled = false;
            this.data_insured.document_number_disabled = false;
            this.data_insured.birthday_date_disabled = false;
            this.data_insured.names_disabled = false;
            this.data_insured.last_name_disabled = false;
            this.data_insured.last_name2_disabled = false;
            this.data_insured.gender_disabled = false;
            this.data_insured.civil_status_disabled = false;
            this.data_insured.nationality_disabled = false;
            this.data_insured.department_disabled = false;
            this.data_insured.province_disabled = false;
            this.data_insured.district_disabled = false;
            this.data_insured.phone_disabled = false;
            this.data_insured.email_disabled = false;
            this.data_insured.address_disabled = false;

            this.insured_province_department = false;
            this.insured_province_selected = false;
            // this.list_data_insured_province = [];
            // this.list_data_insured_district = [];

            if (this.list_data_insured_department.length == 0) {
                this.addressService.getDepartmentList().toPromise().then(res => {
                    this.list_data_insured_department = res;
                    this.data_insured.department = { Id: null }
                    this.list_data_insured_province = [];
                    this.data_insured.province = { Id: null }
                    this.list_data_insured_district = [];
                    this.data_insured.district = { Id: null }
                    this.data_insured.relation = { COD_ELEMENTO: 0 }

                });
            }

            this.new_client_insured = true; // Indicamos que el cliente va ser nuevo
        }
    }

    validEmail = (num) => {
        if (num == 1) {
            if (this.data_contractor.email == "" || this.data_contractor.email.match(this.CONSTANTS.REGEX.CORREO)) {
                this.boolEmailCTR = false;
            } else {
                this.boolEmailCTR = true;
            }
        } else {
            if (this.data_insured.email == "" || this.data_insured.email.match(this.CONSTANTS.REGEX.CORREO)) {
                this.boolEmailASG = false;
            } else {
                this.boolEmailASG = true;
            }
        }
    }

    validNumber = (num) => {
        if (num == 1) {
            if (this.data_contractor.phone == "" || this.data_contractor.phone.match(this.CONSTANTS.REGEX.CELULAR)) {
                this.boolNumberCTR = false;
            } else {
                this.boolNumberCTR = true;
            }
        } else {
            if (this.data_insured.phone == "" || this.data_insured.phone.match(this.CONSTANTS.REGEX.CELULAR)) {
                this.boolNumberASG = false;
            } else {
                this.boolNumberASG = true;
            }
        }
    }


    async getWorldCheck(client_type: number) {
        let datosWorldCheck = {};

        let consultWorldCheck = {
            P_SCLIENT: null,
            P_NOTHERLIST: 0,
            P_NISPEP: 0,
            P_SUPDCLIENT: '0'
        };

        let sclientWorldCheck = { P_SCLIENT: this.data_contractor.sclient }

        if (client_type == 1) {
            datosWorldCheck = {
                name: this.data_contractor.names + ' ' + this.data_contractor.last_name + ' ' + this.data_contractor.last_name2,
                idDocNumber: this.data_contractor.document_number,
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

                    if (consultWorldCheck.P_SCLIENT == null || consultWorldCheck.P_SCLIENT == "") {
                        try {
                            const resWC = await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise()

                            consultWorldCheck = {
                                P_SCLIENT: this.data_contractor.sclient,
                                P_NOTHERLIST: resWC.isOtherList ? 1 : 0,
                                P_NISPEP: resWC.isPep ? 1 : 0,
                                P_SUPDCLIENT: '0'
                            }

                            this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            if (this.world_check_contractor.pep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }

                            await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();

                        } catch (error) {
                            this.isLoading = false;
                            await Swal.fire('Información', 'Error al consultar World Check: ' + error.message, 'error');  
                            this.isLoading = true;
                        }
                    } else {
                        if (["1", 1].includes(consultWorldCheck.P_SUPDCLIENT)) {

                            try {
                                const resWC = await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise();

                                consultWorldCheck = {
                                    P_SCLIENT: this.data_contractor.sclient,
                                    P_NOTHERLIST: resWC.isOtherList ? 1 : 0,
                                    P_NISPEP: resWC.isPep ? 1 : 0,
                                    P_SUPDCLIENT: '1'
                                }
                                this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                if (this.world_check_contractor.pep === 'SÍ') {
                                    this.check_input_relationship = 1;
                                }

                                await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();

                            } catch (error) {
                                this.isLoading = false;
                                await Swal.fire('Información', 'Error al consultar World Check: ' + error.message, 'error');  
                                this.isLoading = true;
                            }
                                
                        } else {
                            this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            if (this.world_check_contractor.pep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }
                        }
                    }
                }
            );
        } else {
            datosWorldCheck = {
                name: this.data_insured.names + ' ' + this.data_insured.last_name + ' ' + this.data_insured.last_name2,
                idDocNumber: this.data_insured.document_number,
                typeDocument: ""
            }
            sclientWorldCheck = { P_SCLIENT: this.data_insured.sclient }
            await this.vidaInversionService.ConsultaWorldCheck(sclientWorldCheck).toPromise().then(
                async (res) => {
                    consultWorldCheck = {
                        P_SCLIENT: res.P_SCLIENT,
                        P_NOTHERLIST: res.P_NOTHERLIST,
                        P_NISPEP: res.P_NISPEP,
                        P_SUPDCLIENT: res.P_SUPDCLIENT
                    }

                    if (consultWorldCheck.P_SCLIENT == null || consultWorldCheck.P_SCLIENT == "") {
                        
                        try {
                            const resWC = await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise();

                            consultWorldCheck = {
                                P_SCLIENT: this.data_insured.sclient,
                                P_NOTHERLIST: resWC.isOtherList ? 1 : 0,
                                P_NISPEP: resWC.isPep ? 1 : 0,
                                P_SUPDCLIENT: '0'
                            }
                            this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            if (this.world_check_insured.pep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }

                            await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                                // this.isLoading = false;
                        } catch (error) {
                            this.isLoading = false;
                            await Swal.fire('Información', 'Error al consultar World Check: ' + error.message, 'error');  
                            this.isLoading = true;
                        }
                    } else {
                        if (["1", 1].includes(consultWorldCheck.P_SUPDCLIENT)) {

                            try {
                                const resWC = await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise();

                                consultWorldCheck = {
                                    P_SCLIENT: this.data_insured.sclient,
                                    P_NOTHERLIST: resWC.isOtherList ? 1 : 0,
                                    P_NISPEP: resWC.isPep ? 1 : 0,
                                    P_SUPDCLIENT: '1'
                                }

                                this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                if (this.world_check_insured.pep === 'SÍ') {
                                    this.check_input_relationship = 1;
                                }

                                await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                                
                            } catch (error) {
                                this.isLoading = false;
                                await Swal.fire('Información', 'Error al consultar World Check: ' + error.message, 'error');  
                                this.isLoading = true;
                            }

                        } else {
                            this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            if (this.world_check_insured.pep === 'SÍ') {
                                this.check_input_relationship = 1;
                            }
                        }
                    }
                }
            );
        }

        /*INI VIGP 17112025*/
        if(client_type == 1){
            this.data_contractor.wc = consultWorldCheck.P_NOTHERLIST;
        } else {
            this.data_insured.wc = consultWorldCheck.P_NOTHERLIST;
        }
        /*FIN VIGP 17112025*/
    }

    async invokeServiceExperia(client_type: number) {
        let datosServiceExperia = {};
        if (client_type == 1) {
            datosServiceExperia = {
                tipoid: (this.data_contractor.type_document || {}).Id == '1' ? '2' : '1',
                id: this.data_contractor.document_number,
                papellido: this.data_contractor.last_name,
                sclient: this.data_contractor.sclient,
                usercode: this.cur_usr.id
            }
        } else {
            datosServiceExperia = {
                tipoid: (this.data_insured.type_document || {}).Id == '1' ? '2' : '1',
                id: this.data_insured.document_number,
                papellido: this.data_insured.last_name,
                sclient: this.data_insured.sclient,
                usercode: this.cur_usr.id
            }
        }
        await this.vidaInversionService.invokeServiceExperia(datosServiceExperia).toPromise().then(
            async res => {
                if (client_type == 1) {
                    this.experian_contractor.riskClient = res.nflag == 0 ? 'SÍ' : 'NO';
                } else {
                    this.experian_insured.riskClient = res.nflag == 0 ? 'SÍ' : 'NO';
                }
            }
        );
    }

    //ARJG
    GoToDataPep(item) {
        this.router.navigate([`extranet/vida-inversion/cotizacion-datapep/${item.QuotationNumber}/${item.ContractorSclient}/${item.IdProspect}`]);
    }

    onChangeOptionPerfilamiento = () => {

        if (
            this.perfilamiento.question1 && this.perfilamiento.question2 && this.perfilamiento.question3 &&
            this.perfilamiento.question4 && this.perfilamiento.question5 && this.perfilamiento.question6
        ) {
            let value_question1 = this.options_perfilamiento_question1.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question1.toUpperCase());
            let value_question2 = this.options_perfilamiento_question2.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question2.toUpperCase());
            let value_question3 = this.options_perfilamiento_question3.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question3.toUpperCase());
            let value_question4 = this.options_perfilamiento_question4.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question4.toUpperCase());
            let value_question5 = this.options_perfilamiento_question5.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question5.toUpperCase());
            let value_question6 = this.options_perfilamiento_question6.filter((item) => item.P_NOPTION.toUpperCase() == this.perfilamiento.question6.toUpperCase());

            let sun_scoring_local = value_question1[0].P_NVALUE + value_question2[0].P_NVALUE + value_question3[0].P_NVALUE + value_question4[0].P_NVALUE + value_question5[0].P_NVALUE + value_question6[0].P_NVALUE;

            const search_scoring_alt = {
                P_SCORING: sun_scoring_local,
                P_NID_COTIZACION: 0,
                P_NBRANCH: this.CONSTANTS.RAMO,
                P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            }
            this.vidaInversionService.RequestScoring(search_scoring_alt).toPromise().then(res => {

                if (res.P_COD_ERR == 0 || res.P_COD_ERR == 2) {
                    this.desc_scoring = res.P_DESC_SCORING;
                    this.recomendacion = res.P_RECOMENDACION;
                }
            });
        };
    }

    //ARJG
    async insupdQuotationOrigenPep(client_type: number, nid_cotizacion: string) {

        let consultQOPep = {};
        if (client_type == 1) {
            consultQOPep = {
                P_NID_COTIZACION: parseInt(nid_cotizacion),
                P_NTYPE_CLIENT: client_type,
                P_SCLIENT: this.data_contractor.sclient,
                P_IOTHERL: this.idecon_contractor.otherList == "SÍ" ? 1 : 0,
                P_IPEP: this.idecon_contractor.pep == "SÍ" ? 1 : 0,
                P_IFAMPEP: this.idecon_contractor.famPep == "SÍ" ? 1 : 0,
                P_WOTHERL: this.world_check_contractor.otherList == "SÍ" ? 1 : 0,
                P_WPEP: this.world_check_contractor.pep == "SÍ" ? 1 : 0,
                P_ERISKYC: this.experian_contractor.riskClient == "SÍ" ? 1 : 0,
                P_DCISPEP: this.data_quotation_complementary.P_NCONPARGC
            }
        }

        await this.vidaInversionService.InsUpdQOPep(consultQOPep).toPromise().then(res => {
            if (res.P_NCODE != 0) {
                Swal.fire('Información', 'Ocurrió un problema al actualizar los Datos PEP.', 'error');
            }
        });
    }

    async cargarDatosContratante(consultQOPep) {
        try {
            const datos = await this.vidaInversionService.InsUpdQOPep(consultQOPep);

        } catch (error) {
            console.error('Error al cargar los datos del contratante', error);
        }
    }

    async insupdQuotationOrigenPepA(client_type: number, nid_cotizacion: string) {
        let consultQOPep = {};
        if (client_type == 2) {
            consultQOPep = {
                P_NID_COTIZACION: parseInt(nid_cotizacion),
                P_NTYPE_CLIENT: client_type,
                P_SCLIENT: this.data_insured.sclient,
                P_IOTHERL: this.idecon_insured.otherList == "SÍ" ? 1 : 0,
                P_IPEP: this.idecon_insured.pep == "SÍ" ? 1 : 0,
                P_IFAMPEP: this.idecon_insured.famPep == "SÍ" ? 1 : 0,
                P_WOTHERL: this.world_check_insured.otherList == "SÍ" ? 1 : 0,
                P_WPEP: this.world_check_insured.pep == "SÍ" ? 1 : 0,
                P_ERISKYC: this.experian_insured.riskClient == "SÍ" ? 1 : 0,
                P_DCISPEP: this.data_complementary_insu.P_NCONPARGC
            }
        }

        await this.vidaInversionService.InsUpdQOPep(consultQOPep).toPromise().then(res => {
            if (res.P_NCODE != 0) {
                Swal.fire('Información', 'Ocurrió un problema al actualizar los Datos PEP.', 'error');
            }
        }
        );
    }

    async cargarDatosAsegurado(consultQOPep) {
        try {
            const datos = await this.vidaInversionService.InsUpdQOPep(consultQOPep);
        } catch (error) {
            console.error('Error al cargar los datos del asegurado', error);
        }
    }

    validateInputStep2() {

        let error_msg = "";

        if ((this.perfilamiento.question1 == "") || (this.perfilamiento.question2 == "") || (this.perfilamiento.question3 == "") || (this.perfilamiento.question4 == "") || (this.perfilamiento.question5 == "") || (this.perfilamiento.question6 == "")) {
            error_msg = 'Debe completar todas las preguntas.';
        }
        return error_msg;
    }

    // Funcion a futuro cuando existan mas planes, con la moneda cambiamos el plan (1 Plan por moneda)
    changeFondo() {
    }

    mostrarCotizacionesVigentesXusuario() {
        this.quotationService.getCotizacionesVigentesVIGP(this.s_usr).toPromise().then(
            res => {
                this.listadoCotizacionesVigentes = res;

                this.listadoCotizacionesVigentes.forEach(element => {
                    element.NCONTRIBUTION = element.NCONTRIBUTION.toLocaleString('en-US');
                    element.SDESC_STATE = element.SDESC_STATE.toUpperCase();
                });

                this.currentPageCurrentQuotation = 1;
                this.totalItemsV = this.listadoCotizacionesVigentes.length;
                this.listToShowCurrentQuotation = this.listadoCotizacionesVigentes.slice(
                    (this.currentPageCurrentQuotation - 1) * this.itemsPerPageV,
                    this.currentPageCurrentQuotation * this.itemsPerPageV
                );
            }
        )
    }

    mostrarCotizacionesNoVigentesXusuario() {
        this.quotationService.getCotizacionesNoVigentesVIGP(this.s_usr).toPromise().then(
            res => {
                this.listadoCotizacionesNoVigentes = res;

                /* Para Dar formato de Moneda en el Lista*/
                this.listadoCotizacionesNoVigentes.forEach(element => { element.NCONTRIBUTION = element.NCONTRIBUTION.toLocaleString('en-US') });

                this.currentPageQuotationNotAllowed = 1;
                this.totalItemsNV = this.listadoCotizacionesNoVigentes.length;
                this.listToShowQuotationNotAllowed = this.listadoCotizacionesNoVigentes.slice(
                    (this.currentPageQuotationNotAllowed - 1) * this.itemsPerPageNV,
                    this.currentPageQuotationNotAllowed * this.itemsPerPageNV
                );
            }
        )
    }

    onFundDateChange(newDate: Date) {
        if (newDate && this.quotation.date_fund !== newDate) {

            this.vidaInversionService.ValidateFundDate(newDate).subscribe(
                response => {

                    if (!response.IS_VALID) {
                        Swal.fire('Información', 'La fecha seleccionada no es válida. Solo se permiten hasta 3 días hábiles.', 'warning');
                        this.quotation.date_fund = new Date();
                    }
                },
                error => {
                    console.error('Error validating fund date:', error);
                }
            );
        }
    }

    async insupdOrigenPep(current_quotation) {
        await this.insupdQuotationOrigenPep(1, current_quotation); // ARJG
        if (this.check_input_value == 0) {

            await this.insupdQuotationOrigenPepA(2, current_quotation); // ARJG
        }
    }

    downloadQuotation(item: any): void {
        this.isLoading = true;

        const documentType = "Cotizacion_vigp_template";
        if (!documentType) {
            this.isLoading = false;
            Swal.fire('Información', 'Tipo de documento no especificado', 'info');
            return;
        }

        this.vidaInversionService.downloadQuotationDocument(item.QuotationNumber, documentType)
            .subscribe({
                next: (blob: Blob) => {
                    FileSaver.saveAs(
                        blob,
                        `Cotizacion_${item.QuotationNumber}.pdf`
                    );
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error al descargar la cotización', error);
                    Swal.fire('Información', 'El archivo se esta generando...', 'info');
                    this.isLoading = false;
                }
            });
    }

    changeDocumentNumber(event, change_type: number) {

        if (change_type == 2) {
            if (this.data_insured.type_document?.Id === 4) {
                this.data_insured.document_number = event.toUpperCase();
            }
            this.clearData(2);
        }
    }


}