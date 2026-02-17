import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddPepComponent } from '../../components/add-pep/add-pep.component';
import { AddPropertyComponent } from '../../components/add-property/add-property.component';
import { AddRelationComponent } from '../../components/add-relation/add-relation.component';
import { AddDeclarationComponent } from '../../components/add-declaration/add-declaration.component';
import { AddBeneficiaryComponent } from '../../components/add-beneficiary/add-beneficiary.component';
import { OriginDetailModalComponent } from '../../components/origin-detail-modal/origin-detail-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { CommonMethods } from '../../../broker/components/common-methods';
import { DataContractor } from '../../models/DataContractor';
import { DataInsured } from '../../models/DataInsured';
import { AccPersonalesService } from '../../../broker/components/quote/acc-personales/acc-personales.service';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { AddressService } from '../../../broker/services/shared/address.service';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import Swal from 'sweetalert2';
import { AddFileComponent } from '../../components/add-file/add-file.component';
import moment from 'moment';
import { subtractWithPrecision } from '../../../../shared/helpers/utils';
import { VoucherComponent } from '../../components/voucher/voucher.component';
import { AddSocietarioComponent } from '../../components/add-societario/add-societario.component';
import { isEqual } from 'lodash';
import { OthersService } from '../../../broker/services/shared/others.service';

type Beneficiary = {
    siddoc_beneficiary: string;
    niddoc_type_beneficiary: string;
    percen_participation: string;
    sphone: string;
    se_mail: string;
    srelation: string;
    [key: string]: any; // other non-important fields
};

@Component({
    templateUrl: './quotation-definitive.component.html',
    styleUrls: ['./quotation-definitive.component.scss']
})


export class QuotationDefinitiveComponent implements OnInit {

    quotation_id: number = 0;
    profile_id: any;
    coments: any[] = [];

    quotation: any = {
        moneda: "",
        fondo: "",
        contribution: "",
        date_fund: new Date(),
        nid_proc: "",
        periodo: "",
        monedaDesc: "",
        date_fundDescrip: "",
        contributionDesc: 0,
        date_fund_disabled: false,
        deriv_firmas: "",
        quoteState: '',
        score: null,
        score_insu: null,
        nintentos_cambio_firma: null,
        ninsdoc_changsign: 0,
        nsignature_type: 0,
        nderivfirm_changsign: 0,
    };

    min_date_fund: any = new Date();
    max_date_fund: any = new Date();


    sclient: string = '0';
    prospect_id: any;

    showGerenteBtn: boolean = false;
    isScoreLow: boolean = false;
    dissabled_next_button: boolean = false; //  se creo para no 2 o mas veces al metodo

    showScoreBtn: boolean = true;

    comentarios: any[];
    comentario: string;

    CONSTANTS: any = VidaInversionConstants;
    isLoading: boolean = false;
    dissabled_btn_modal_detail_origin: boolean = false;

    dissabled_btn_modal_add_benef: boolean = false;


    boolNumberCTR: boolean = false;
    boolNumberASG: boolean = false;
    boolEmailCTR: boolean = false;
    boolEmailASG: boolean = false;
    @Input() check_input_value;
    @Input() check_input_value_beneficiary = 0;
    @Input() check_input_value_beneficiary_original = 0;
    @Input() check_input_nationality;
    @Input() check_input_relationship;
    @Input() check_input_fiscal_obligations;
    @Input() check_input_obligated_subject;     // VIGP-KAFG 03/04/2025
    @Input() check_input_calidad_socio; // VIGP-KAFG 09/07/2025

    @Input() check_input_insu_nationality;  //VIGP-KAFG 07/04/2025
    @Input() check_input_insu_relationship; //VIGP-KAFG 07/04/2025
    @Input() check_input_insu_fiscal_obligations;  //VIGP-KAFG 07/04/2025
    @Input() check_input_insu_obligated_subject;     // VIGP-KAFG 07/04/2025
    @Input() check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025

    cont_high: boolean;
    cont_low: boolean;
    cont_medium: boolean;

    insu_high: boolean;
    insu_low: boolean;
    insu_medium: boolean;

    is_insu_score_completed: boolean;
    is_cont_score_completed: boolean;

    cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    NID_STATE: number;
    DEF_STATE: number;
    pdfFile = '';
    investment: any = [];
    error_msg = "";
    error_upd_360 = "0";
    serror = "";
    contractor_province_department: any = false;
    contractor_province_selected: any = false;
    insured_province_department: any = false;
    insured_province_selected: any = false;

    value_pep: any = 0;
    value_properties: any = 0;
    value_relationship: any = 0;
    value_declaration: any = 0;

    type_rol: any;
    ocupation_value: any;
    step_list: any;
    now_date: any;
    request_validate_days: string;
    pep_data: any // ALMACENA LOS DATOS PEP
    check_input_value_360: any; //Valor si el Contratante === Asegurado o no que es traido de BD
    parse_amount: any;
    show_guide: boolean = false;
    new_client_insured = false; // Indica si es cliente Ya se encuentra registrado en el 360 o no
    desc_scoring: any = "-";
    recomendacion: any = "";
    sum_scoring: any = '';
    current_step: number;
    cur_usr: any;
    pro_usr: any;

    CURRENCY: any;
    TIME: any = [];
    APORT: any;
    NATIONALITY: any;
    FONDO: any;

    filesList: any = [];

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
    list_occupation_contractor: any = [];
    list_gender_contractor: any = [];
    list_benefeciarys: any = [];
    list_benefeciarys_original: any = [];
    list_document_type_contractor: any = [];
    steps_list: any;

    list_societarios_cont: any = []; // VIGP-KAFG 10/07/2025
    list_societarios_insu: any = []; // VIGP-KAFG 10/07/2025

    list_societarios_cont_original: any = []; // VIGP-KAFG 10/07/2025
    list_societarios_insu_original: any = []; // VIGP-KAFG 10/07/2025

    isViewModalSocietarios: boolean = false;

    origin_fund_saving_percent: any = 0; // Origen de fondo ahoro
    origin_fund_spp_percent: any = 0; // Origen de fondo sistema privadode pensiones

    chekedsumamaxima: boolean = false;
    current_quotation_selected: any;

    perfilamiento: any = {
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        perfilamiento_exist: false,
        question1_disabled: false,
        question2_disabled: false,
        question3_disabled: false,
        question4_disabled: false,
        question5_disabled: false
    }

    options_perfilamiento_question1 = [];
    options_perfilamiento_question2 = [];
    options_perfilamiento_question3 = [];
    options_perfilamiento_question4 = [];
    options_perfilamiento_question5 = [];
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
        centro_trabajo_disabled: false, // VIGP-KAFG 08/07/2025
        cargo_disabled: false, // VIGP-KAFG 08/07/2025
    }

    // INI VIGP-KAFG 07/04/2025
    data_occuptacion_insu: any = {
        occupation_status: 0,
        occupation_status_disabled: false,
        centro_trabajo: '',// VIGP-KAFG 08/07/2025
        cargo: '',// VIGP-KAFG 08/07/2025
        texto_obligated_subject: '',// VIGP-KAFG 08/07/2025
        centro_trabajo_disabled: false, // VIGP-KAFG 08/07/2025
        cargo_disabled: false, // VIGP-KAFG 08/07/2025
    }
    // FIN VIGP-KAFG 07/04/2025


    // data_quotation_complementary: any = {
    //     P_NID_PROSPECT: 0,
    //     P_NOCCUPATION: 0,
    //     P_NNATUSA: 3,
    //     P_NCONPARGC: 3,
    //     P_NOFISTRI: 3,
    //     P_USER: 0
    // }

    data_quotation_complementary_cot_prospect: any = {
        // P_NID_PROSPECT: 0, VIGP-KAFG 07/04/2025
        P_NID_COTIZACION: 0,
        P_NTYPE_CLIENT: 0,  // VIGP-KAFG 07/04/2025
        P_SDOCUMENT_NUMBER: '',  // VIGP-KAFG 07/04/2025
        P_NOCCUPATION: 0,
        P_NNATUSA: 3,
        P_NCONPARGC: 3,
        P_NOFISTRI: 3,
        P_NOBLIGATED_SUBJECT: 3, // VIGP-KAFG 03/04/2025
        P_USER: 0,
        P_SCENTRO_TRABAJO: '',// VIGP-KAFG 08/07/2025
        P_SCARGO: '',// VIGP-KAFG 08/07/2025
        P_NCALIDAD_SOCIO: 3, // VIGP-KAFG 09/07/2025
        P_SOCIETARIOS: [] // VIGP-KAFG 09/07/2025
    }

    // INI VIGP-KAFG 07/04/2025
    data_complementary_insu: any = {
        P_NID_COTIZACION: 0,
        P_NTYPE_CLIENT: 0,
        P_SDOCUMENT_NUMBER: '',
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
    // FIN VIGP-KAFG 07/04/2025

    split_date_date_fund_quotation: any;

    //ACTUALIZAR REGISTRO
    nregister_contractor = 0;
    nregister_insured = 0;
    nregister_parentesco: any;
    nregister_nnatusa = 0;
    nregister_nconpargc = 0;
    nregister_nobligated_subject = 0; // VIGP-KAFG 03/04/2025
    nregister_calidad_socio = 0; // VIGP-KAFG 09/07/2025
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

    // INI VIGP-KAFG 07/04/2025
    nregister_insu_nnatusa = 0;
    nregister_insu_nobligated_subject = 0;
    nregister_insu_calidad_socio = 0; // VIGP-KAFG 09/07/2025
    nregister_insu_nconpargc = 0;
    nregister_insu_nofistri = 0;
    nregister_insu_noccupation = 0;
    // FIN VIGP-KAFG 07/04/2025
    nregister_insu_scentro_trabajo = ''; // VIGP-KAFG 08/07/2025
    nregister_insu_scargo = ''; // VIGP-KAFG 08/07/2025


    // BENEFICIARIOS
    listToShow_benefeciarys: any = [];
    currentPage = 1;
    itemsPerPage = 2;
    totalItems = 0;
    maxSize = 10;

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
        relation_disabled: false, // VIGP KAFG 19/02/2025
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

    status_contractor_disabled = true;

    check_input_nationality_disabled = false;
    check_input_relationship_disabled = false;
    check_input_fiscal_obligations_disabled = false;
    check_input_value_beneficiary_disabled = false;
    check_input_obligated_subject_disabled = false; //VIGP-KAFG 03/04/2025
    check_input_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025

    // INI VIGP-KAFG 07/04/2025
    check_input_insu_nationality_disabled = false;
    check_input_insu_relationship_disabled = false;
    check_input_insu_fiscal_obligations_disabled = false;
    check_input_insu_obligated_subject_disabled = false;
    check_input_insu_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025
    // INI VIGP-KAFG 07/04/2025

    actions = true;
    firmaManuscrita = false;

    /* DGC - VIGP PEP - 06/02/2024 - INICIO */
    origin_pep_contractor: any = {
        id_1: 'NO',
        id_2: 'NO',
        id_3: 'NO',
        wc_1: 'NO',
        wc_2: 'NO',
        ex_1: 'NO',
        dc_1: 'NO'
    }

    origin_pep_insured: any = {
        id_1: 'NO',
        id_2: 'NO',
        id_3: 'NO',
        wc_1: 'NO',
        wc_2: 'NO',
        ex_1: 'NO',
        dc_1: 'NO'
    }

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

    exist_origin_detail_spp: boolean = false;
    exist_origin_detail_saving_financial_institution: boolean = false;

    userComment: string;
    dateComment: string;

    bossBool: Number = 0;
    is_last_day: Number;
    is_penultimate_day: Number;
    is_second_to_last_day: Number;
    is_passing_second_to_last_day: Number;
    flag_file_cliente: string;
    fileNameSelected: string;


    homologacionCont: string = "——";  // VIGP-KAFG 16/04/2025
    homologacionInsu: string = "——";  // VIGP-KAFG 16/04/2025

    payment_status: boolean = false;
    bank_selected: any = { Id_entidad: 0 };
    disabled_inputs_voucher_component: boolean = false;

    /*INI VIGP 17112025 */
    riesgo_negative_insu: string = "——"; 
    riesgo_negative_cont: string = "——"; 
    /*FIN VIGP 17112025 */

    holidays: string[] = [];

    constructor(
        private router: Router,
        public clientInformationService: ClientInformationService,
        public addressService: AddressService,
        private vidaInversionService: VidaInversionService,
        private quotationService: QuotationService,
        private readonly activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private acc_personales_service: AccPersonalesService,
        private parameterSettingsService: ParameterSettingsService,
        private othersService: OthersService,
    ) {
        // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
        pdfDefaultOptions.assetsFolder = 'assets'; //DVP 2025-02-13 VIGP
    }

    async ngOnInit() {

        this.is_insu_score_completed = false;
        this.is_cont_score_completed = false;

        this.cont_high = false;
        this.cont_low = false;
        this.cont_medium = false;

        this.insu_high = false;
        this.insu_low = false;
        this.insu_medium = false;

        this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025
        this.homologacionInsu = "——";  // VIGP-KAFG 16/04/2025

        this.isLoading = true;
        this.quotation_id = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);
        this.fileNameSelected = '';
        this.step_list = [
            {
                step_index: 1,
                tittle: "Datos del Contratante/Asegurado"
            },
            {
                step_index: 2,
                tittle: "Cotización"
            },
            {
                step_index: 3,
                tittle: "File del cliente/Comentarios"
            },
            {
                step_index: 4,
                tittle: "Datos del Producto"
            }
        ];

        this.getNidStateAndDefState();
        this.sclient = this.activatedRoute.snapshot.params["cliente"];
        this.prospect_id = this.activatedRoute.snapshot.params["prospecto"];
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.userComment = this.cur_usr.firstName + ' ' + this.cur_usr.lastName;
        this.dateComment = moment(new Date()).format('DD/MM/YYYY hh:mm:ss a').toUpperCase();


        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);
        console.log("profile_id: ", this.profile_id);
        this.type_rol = '0';
        this.sum_scoring = '';
        this.check_input_value = 1;
        this.current_step = 1;
        this.now_date = new Date();

        // FOR Contractor
        // Se les esta agregando un await para poder Controlarlo
        this.list_document_type_contractor = await this.clientInformationService.getDocumentTypeList(this.cod_prod_channel).toPromise();

        this.list_gender_contractor = await this.clientInformationService.getGenderList().toPromise();

        this.list_civil_state_contractor = await this.clientInformationService.getCivilStatusList().toPromise();

        // Ocupacion
        this.list_occupation_contractor = await this.clientInformationService.getOccupationTypeList().toPromise();

        this.list_nationalities_contractor = await this.clientInformationService.getNationalityList().toPromise();

        // Asegurado
        this.list_civil_state_insured = await this.clientInformationService.getCivilStatusList().toPromise();

        this.list_nationalities_insured = await this.clientInformationService.getNationalityList().toPromise();

        this.CURRENCY = await this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).toPromise();

        this.investment = await this.vidaInversionService.investmentFunds().toPromise();

        const request_search_prospect = { P_NID_PROSPECT: this.prospect_id, P_NID_COTIZACION: this.quotation_id };

        const response_search_prospect = await this.vidaInversionService.searchByProspectQuotation(request_search_prospect).toPromise();

        this.data_contractor.type_document = { Id: response_search_prospect.TYPE_DOC_CONTRACTOR }
        this.data_contractor.document_number = response_search_prospect.DOC_CONTRACTOR;
        this.check_input_value = parseInt(response_search_prospect.NID_ASCON);

        const params_360 = {
            P_TIPOPER: 'CON',
            P_NUSERCODE: this.cur_usr.id,
            P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
            P_SIDDOC: this.data_contractor.document_number,
        };

        const response_client360 = await this.clientInformationService.getCliente360(params_360).toPromise();

        if (response_client360.P_NCODE == "0") {

            if (response_client360.EListClient[0].P_SCLIENT !== null) {

                if (response_client360.EListClient.length === 1) {

                    if (response_client360.EListClient[0].P_SIDDOC != null) {
                        response_client360.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, response_client360.EListClient[0].P_SCLIENT);
                        if (response_client360.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2) {
                            this.data_contractor.document_number = "";
                            this.data_contractor.type_document = { Id: 0 };
                            // this.clearData(1);

                            this.isLoading = false;

                            Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error')
                                .then((result) => {
                                    console.log("result: ", result);
                                    this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                });
                        } else {
                            await this.getDataContractor(response_client360);
                            if (params_360.P_NIDDOC_TYPE == 2) {
                                this.data_contractor.nationality_disabled = true;
                                this.data_contractor.civil_status_disabled = true;
                            }
                            // await this.invokeServiceExperia(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                            // await this.getWorldCheck(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                            await this.getDataIdeconClient(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                            // await this.consultProspect();
                            await this.getInsuredData360(response_search_prospect); // Llamando la data del Asegurado
                            await this.ConsultDataComplementary(1);
                            await this.getOriginPep(1);
                            // await this.getOriginPep(2);
                            await this.getDataRegNegativoClient(1); /*VIGP 17112025*/
                            this.data_contractor_360 = { ...this.data_contractor }; // Almacenando la Info de Inicio del 360 para el Contratante en una Variable para validacino si cambio alguna info
                        }
                    }
                }
            }
        }
        else if (response_client360.P_NCODE === "1" || response_client360.P_NCODE === "2" || response_client360.P_NCODE === "3") {
            this.clearData(1);
            this.isLoading = false;
            Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
            return;
        }


        const get_data_coti = { P_QUOTATIONNUMBER: this.quotation_id };

        const data_coti_pre = await this.quotationService.GetCotizacionPre(get_data_coti).toPromise();

        if (data_coti_pre.P_COD_ERROR == 1) {
            Swal.fire('Información', 'Ocurrió un problema al obtener los datos de la cotización preliminar.', 'error');
            return;
        }

        await this.getCurrency(data_coti_pre.NCURRENCY);

        this.parse_amount = CommonMethods.formatNUMBER(data_coti_pre.P_CONTRIBUTION);
        this.quotation.contribution = this.parse_amount;
        this.quotation.contributionDesc = data_coti_pre.P_CONTRIBUTION;
        this.quotation.date_fundDescrip = data_coti_pre.P_DDATE_FUND;
        this.quotation.periodo = data_coti_pre.P_NSAVING_TIME;
        this.quotation.deriv_firmas = data_coti_pre.P_DDERIV_FIRMAS;

        if (this.quotation.contribution.toUpperCase() == "NAN") {
            this.quotation.contribution = '';
        }

        this.quotation.fondo = { NFUNDS: data_coti_pre.P_NFUNDS };
        this.quotation.moneda = { NCODIGINT: data_coti_pre.P_NCURRENCY };

        await this.GetHolidays();

        this.min_date_fund = this.sumarDiasHabiles(new Date(), 6,'min');
        this.max_date_fund = this.sumarDiasHabiles(new Date(), 6,'max');

        this.split_date_date_fund_quotation = data_coti_pre.P_DDATE_FUND.split('/');

        this.quotation.date_fund = new Date(parseInt(this.split_date_date_fund_quotation[2]), parseInt(this.split_date_date_fund_quotation[1]) - 1, parseInt(this.split_date_date_fund_quotation[0]));
        this.quotation.nid_proc = data_coti_pre.CodigoProceso;
        this.quotation.quoteState = data_coti_pre.P_NSTATE;
        this.quotation.nintentos_cambio_firma = data_coti_pre.NINTENTOS_CAMBIO_FIRMA; // VIGP-KAFG 19/08/2025
        this.quotation.ninsdoc_changsign = data_coti_pre.NINSDOC_CHANGSIGN; // VIGP-KAFG 20/08/2025
        this.quotation.nsignature_type = data_coti_pre.NSIGNATURE_TYPE; // VIGP-KAFG 22/08/2025
        this.quotation.score = data_coti_pre.P_NSCORE;
        this.quotation.score_insu = data_coti_pre.P_NSCORE_INSU; // VIGP-KAFG 08/04/2025
        this.quotation.nderivfirm_changsign = data_coti_pre.P_NDERIVFIRM_CHANGSIGN; // VIGP-KAFG 26/08/2025 

        this.list_benefeciarys = data_coti_pre.List_beneficiary.map(element => {
            return {
                sclient: element.sclient,
                type_doc: element.niddoc_type_beneficiary,
                type_document: { Id: element.niddoc_type_beneficiary, desc_type_doc: element.sdesc_doc },
                siddoc: element.siddoc_beneficiary,
                desc_type_doc: element.sdesc_doc,
                srelation_name: element.sdesc_srelation,
                percentage_participation: element.percen_participation,
                nationality: { NNATIONALITY: element.nnationality },
                desc_nationality: element.sdesc_nationality,
                sfirstname: element.sfirstname.toUpperCase(),
                slastname: element.slastname.toUpperCase(),
                slastname2: element.slastname2.toUpperCase(),
                birthday_date: element.dbirthdat,
                gender: { id: element.ssexclien },
                relation: { NCODIGO: element.srelation },
                email: element.se_mail,
                phone: element.sphone,
                assignment: element.percen_participation,
            };
        })

        //make a copy of list_benefeciarys
        this.list_benefeciarys_original = this.list_benefeciarys.map((item: Beneficiary) => ({
            siddoc_beneficiary: item.siddoc,
            niddoc_type_beneficiary: item.desc_type_doc == "C.E" ? "Carnet de Extranjería" : item.desc_type_doc,
            percen_participation: item.percentage_participation,
            sphone: item.phone,
            se_mail: item.email.toUpperCase(),
            srelation: item.srelation_name,
        }));

        if (this.list_benefeciarys.length > 0) { 
            this.check_input_value_beneficiary = 0; 
            this.check_input_value_beneficiary_original = 0;
        }

        this.currentPage = 1;
        this.totalItems = this.list_benefeciarys.length;
        this.listToShow_benefeciarys = this.list_benefeciarys.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );

        this.getDatosPep();
        this.SelDatosPEPVIGP();
        await this.GetCommentsCotiVIGP();
        this.readFile();


        if (this.profile_id == "203" || this.profile_id == "196") {

            this.data_contractor = {
                ...this.data_contractor,
                type_document_disabled: true,
                document_number_disabled: true,
                birthday_date_disabled: true,
                names_disabled: true,
                last_name_disabled: true,
                last_name2_disabled: true,
                gender_disabled: true,
                civil_status_disabled: true,
                nationality_disabled: true,
                department_disabled: true,
                province_disabled: true,
                district_disabled: true,
                phone_disabled: true,
                email_disabled: true,
                address_disabled: true,
            };
            this.data_insured = {
                ...this.data_insured,
                type_document_disabled: true,
                document_number_disabled: true,
                birthday_date_disabled: true,
                names_disabled: true,
                last_name_disabled: true,
                last_name2_disabled: true,
                gender_disabled: true,
                civil_status_disabled: true,
                nationality_disabled: true,
                department_disabled: true,
                province_disabled: true,
                district_disabled: true,
                phone_disabled: true,
                email_disabled: true,
                address_disabled: true,
                relation_disabled: true,
            };
            this.status_contractor_disabled = true;
            this.data_complementary.occupation_status_disabled = true;
            this.data_complementary.centro_trabajo_disabled = true; // VIGP-KAFG 08/07/2025
            this.data_complementary.cargo_disabled = true; // VIGP-KAFG
            this.check_input_nationality_disabled = true;
            this.check_input_relationship_disabled = true;
            this.check_input_fiscal_obligations_disabled = true;
            this.check_input_obligated_subject_disabled = true; // VIGP-KAFG 03/04/2025
            this.check_input_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025

            this.quotation.date_fund_disabled = true;
            this.check_input_value_beneficiary_disabled = true;
            this.perfilamiento.question1_disabled = true;
            this.perfilamiento.question2_disabled = true;
            this.perfilamiento.question3_disabled = true;
            this.perfilamiento.question4_disabled = true;
            this.perfilamiento.question5_disabled = true;
            this.dissabled_btn_modal_add_benef = true;
            this.actions = false;
            this.dissabled_btn_modal_detail_origin = true;

            // INI VIGP-KAFG 07/04/2025
            this.data_occuptacion_insu.occupation_status_disabled = true;
            this.data_occuptacion_insu.centro_trabajo_disabled = true; // VIGP-KAFG 08/07/2025
            this.data_occuptacion_insu.cargo_disabled = true; // VIGP
            this.check_input_insu_nationality_disabled = true;
            this.check_input_insu_relationship_disabled = true;
            this.check_input_insu_fiscal_obligations_disabled = true;
            this.check_input_insu_obligated_subject_disabled = true;
            // INI VIGP-KAFG 07/04/2025
            this.check_input_insu_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025
            this.isViewModalSocietarios = true;
        }

        this.disabledFileClientIncompleteInputs();

        // Para Gerente
        if (this.profile_id == "192" && (this.NID_STATE == 10 || this.isChangeSignature())) {
            this.disabledInputsforManager();
        }

        const origin_detail_cab = await this.vidaInversionService.GetOriginDetailCab(this.quotation_id).toPromise();

        if (origin_detail_cab.length > 0) {

            const response = origin_detail_cab[0];
            // CON ESTA DATA SABREMOS SI la cotizacino tiene todo a segura de pensiona , todo a ahorros financieros o compartido.
            // CAMBIOS PARA SISTEMA PRIVADO DE PENSIONES
            if (response.P_NCUSPP != 0 && response.P_NPRIVATE_PENSION_SYSTEM != 0) {
                this.exist_origin_detail_spp = true;
            }

            if (response.P_NSAVING_FINANCIAL_INSTITUTION1 || response.P_NSAVING_FINANCIAL_INSTITUTION2 || response.P_NSAVING_FINANCIAL_INSTITUTION3 || response.P_NSAVING_FINANCIAL_INSTITUTION4) {
                this.exist_origin_detail_saving_financial_institution = true;
            }
        }

        const origin_detail_det = await this.vidaInversionService.GetOriginDetailDet(this.quotation_id).toPromise();

        if (origin_detail_det.length > 0) {
            const response = origin_detail_det[0];

            this.dissabled_btn_modal_detail_origin = true;

            // Retorna la suma de los Porcentajes
            if (this.exist_origin_detail_spp == true && this.exist_origin_detail_saving_financial_institution == false) {
                this.origin_fund_saving_percent = 0;
                this.origin_fund_spp_percent = 100;
            }
            else if (this.exist_origin_detail_saving_financial_institution == true && this.exist_origin_detail_spp == false) {
                this.origin_fund_saving_percent = 100;
                this.origin_fund_spp_percent = 0;
            }

            else {

                let sum_origin_detail = Number.parseFloat(response.P_NBUSINESS_INCOME) + Number.parseFloat(response.P_NREMUNERATIONS) + Number.parseFloat(response.P_NGRATIFICATIONS) + Number.parseFloat(response.P_NBUSINESS_DIVIDENS) + Number.parseFloat(response.P_NSALE_SECURITIES) + Number.parseFloat(response.P_NCANCELED_BANK_CERTIFICATES) + Number.parseFloat(response.P_NLOAN) + Number.parseFloat(response.P_NINCOME_PERSONAL_FEES) + Number.parseFloat(response.P_NCOMPENSATION_SERVICE_TIME) + Number.parseFloat(response.P_NLABOR_PROFITS) + Number.parseFloat(response.P_NSALES_ESTATES) + Number.parseFloat(response.P_NINHERITANCE) + Number.parseFloat(response.P_NCANCELLATION_TERM_DEPOSITS) + Number.parseFloat(response.P_NOTHERS);

                // this.origin_fund_saving_percent = sum_origin_detail;
                // this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);

                this.origin_fund_saving_percent = sum_origin_detail.toFixed(2);
                this.origin_fund_spp_percent = subtractWithPrecision(100, this.origin_fund_saving_percent);
            }
        }


        if (this.profile_id == "192" && this.flag_file_cliente != "2") {

            this.request_validate_days = this.now_date.getDate().toString().padStart(2, '0') + '/' + (this.now_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.now_date.getFullYear();

            this.request_validate_days = this.quotation.deriv_firmas ? this.quotation.deriv_firmas : this.request_validate_days;

            const response_validate_lasts_days_months = await this.quotationService.ValidateLastsDaysMonths(this.request_validate_days).toPromise();

            // Para pruebas: forzar a que sea el antepenúltimo día
            this.is_last_day = response_validate_lasts_days_months.P_IS_LAST_DAY;
            this.is_penultimate_day = response_validate_lasts_days_months.P_IS_PENULTIMATE_DAY;
            this.is_second_to_last_day = response_validate_lasts_days_months.P_IS_SECOND_TO_LAST_DAY;
            // this.is_second_to_last_day = 1; // Forzar a 1 para simular antepenúltimo día

            this.is_passing_second_to_last_day = response_validate_lasts_days_months.P_IS_PASSING_SECOND_TO_LAST_DAY;
        }

        // Para COORDINADOR Y/O GERENTE
        if (this.profile_id == "196" || this.profile_id == "203") {
            this.current_step = 4;
        }

        // Si está en estado "En Firmas"
        if (this.NID_STATE == 12 || (this.quotation.quoteState == 30 && this.quotation.nintentos_cambio_firma == 1)) {
            this.current_step = 3; // Mostrar la pantalla de firmas
            this.readFile(); // Cargar los archivos correspondientes
        }

        this.getStatusPaymentVoucher();

        this.isLoading = false;
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
                        this.riesgo_negative_cont = !resRN.coincidenceRN ? 'NO' : 'SI';
                    }
                    else{
                        this.riesgo_negative_insu = !resRN.coincidenceRN ? 'NO' : 'SI';
                    }

                    if(resRN.isError == 1) throw new Error('Error en getRegNegativo');

                    await this.vidaInversionService.InsUpdRegistroNegativo({
                        P_SCLIENT: sclientRN.P_SCLIENT,
                        P_NISREGNEG: resRN.coincidenceRN ? 1 : 0,
                        P_SUPDCLIENT: '0'
                    }).toPromise();

                } catch (error) {
                    if(client_type == 1){
                        this.riesgo_negative_cont = '';
                    }
                    else{
                        this.riesgo_negative_insu = '';
                    }
                }
            } else {

                if (res.P_SUPDCLIENT == "1") {
                    try {
                        const resRN = await this.vidaInversionService.getRegNegativo(consultaRegNegativo).toPromise();

                        if(client_type == 1){
                            this.riesgo_negative_cont = !resRN.coincidenceRN ? 'NO' : 'SI';
                        }
                        else{
                            this.riesgo_negative_insu = !resRN.coincidenceRN ? 'NO' : 'SI';
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
                            this.riesgo_negative_cont = '';
                        }
                        else{
                            this.riesgo_negative_insu = '';
                        }
                    }
                } else {
                    if(client_type == 1){
                        this.riesgo_negative_cont = res.P_NOTHERLIST == 1 ? 'SI' : 'NO';
                    }
                    else{
                        this.riesgo_negative_insu = res.P_NOTHERLIST == 1 ? 'SI' : 'NO';
                    }
                }
            }
        } catch (error) {
            if(client_type == 1){
                this.riesgo_negative_cont = '';
            }
            else{
                this.riesgo_negative_insu = '';
            }
        }
    }
    /*FIN VIGP 17112025 */

    isChangeSignature(): boolean {
        return [30,28].includes(this.quotation.quoteState) && this.quotation.nintentos_cambio_firma == 1 && this.profile_id == "192";
    }

    validaFechaHabil(): boolean {
        // this.quotation.date_fund
        const today = this.quotation.date_fund;
        const isHoliday = this.holidays.some(holiday => holiday == today.toISOString().slice(0, 10));
        return today.getDay() !== 0 && today.getDay() !== 6 && !isHoliday;
    }

    resolveOldFileClient(fileName: string){
        if((this.quotation.nsignature_type == 1 && this.quotation.quoteState == 30 && this.quotation.nintentos_cambio_firma == 1) // Validacion para firma manuscrita
            || (this.quotation.nsignature_type == 2 && [30,28].includes(this.quotation.quoteState) && this.quotation.nintentos_cambio_firma == 1 && this.quotation.nstate_doc_toc == 3) // Validacion para firma digital
        ){
            const chunks = fileName.split('.');
            if(chunks.length == 2){
                return `${chunks[0]}_anterior.${chunks[1]}`;   
            }
        }
        return fileName;
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

    //origin pep arjg
    async getOriginPep(client_type: number) {
        let datosOriginPep = {};

        let consultOriginPep = {
            P_ID1: 0,
            P_ID2: 0,
            P_ID3: 0,
            P_WC1: 0,
            P_WC2: 0,
            P_EX1: 0,
            P_DC1: 0
        };

        if (client_type == 1) {

            datosOriginPep = {
                P_NID_COTIZACION: this.quotation_id,
                P_NTYPE_CLIENT: client_type,
                P_SCLIENT: this.data_contractor.sclient
            }
            await this.vidaInversionService.ConsultaOriginPep(datosOriginPep).toPromise().then(
                async (res) => {

                    consultOriginPep = {
                        P_ID1: res.P_ID1,
                        P_ID2: res.P_ID2,
                        P_ID3: res.P_ID3,
                        P_WC1: res.P_WC1,
                        P_WC2: res.P_WC2,
                        P_EX1: res.P_EX1,
                        P_DC1: res.P_DC1
                    }

                    this.origin_pep_contractor.id_1 = consultOriginPep.P_ID1 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_contractor.id_2 = consultOriginPep.P_ID2 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_contractor.id_3 = consultOriginPep.P_ID3 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_contractor.wc_1 = consultOriginPep.P_WC1 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_contractor.wc_2 = consultOriginPep.P_WC2 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_contractor.ex_1 = consultOriginPep.P_EX1 == 1 ? 'SÍ' : 'NO';
                    //this.origin_pep_contractor.dc_1 = consultOriginPep.P_DC1 == 1 ? 'SÍ' : 'NO';
                }
            );
        } else {

            datosOriginPep = {
                P_NID_COTIZACION: this.quotation_id,
                P_NTYPE_CLIENT: client_type,
                P_SCLIENT: this.data_insured.sclient
            }

            await this.vidaInversionService.ConsultaOriginPep(datosOriginPep).toPromise().then(
                async (res) => {
                    consultOriginPep = {
                        P_ID1: res.P_ID1,
                        P_ID2: res.P_ID2,
                        P_ID3: res.P_ID3,
                        P_WC1: res.P_WC1,
                        P_WC2: res.P_WC2,
                        P_EX1: res.P_EX1,
                        P_DC1: res.P_DC1
                    }
                    this.origin_pep_insured.id_1 = consultOriginPep.P_ID1 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_insured.id_2 = consultOriginPep.P_ID2 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_insured.id_3 = consultOriginPep.P_ID3 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_insured.wc_1 = consultOriginPep.P_WC1 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_insured.wc_2 = consultOriginPep.P_WC2 == 1 ? 'SÍ' : 'NO';
                    this.origin_pep_insured.ex_1 = consultOriginPep.P_EX1 == 1 ? 'SÍ' : 'NO';
                }
            );
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

    getCurrency = async (item) => {
        await this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).toPromise().then(
            res => {
                let temp = res.filter(x => x.NCODIGINT == item);
                this.quotation.monedaDesc = temp[0].SDESCRIPT;
            }
        );
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = this.cur_usr.id;
        _data.nProduct = this.CONSTANTS.COD_CHA_PRODUCTO;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                },
                err => {
                    console.log(err)
                }
            );
        return profile;
    }

    getDatosPep = () => {
        this.quotationService.getDatosPep({ P_NID_COTIZACION: this.quotation_id, P_SCLIENT: this.sclient }).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.value_pep = res.P_NSECCION;
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error obteniendo los datos PEP.", 'error');
            }
        )
    }

    SelDatosPEPVIGP = () => {
        this.vidaInversionService.SelDatosPEPVIGP({ P_NID_COTIZACION: this.quotation_id, P_SCLIENT: this.sclient }).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.value_properties = res.P_NSECCION_1;
                    this.value_relationship = res.P_NSECCION_2;
                    this.value_declaration = res.P_NSECCION_3;
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error obteniendo los datos PEP.", 'error');
            }
        )
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow_benefeciarys = this.list_benefeciarys.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
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
            this.data_contractor.province = { Id: 0 }
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
            this.data_insured.province = { Id: 0 }
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

    // INI VIGP-KAFG 07/04/2025
    changeValueNationality(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_nationality = value;
        else this.check_input_insu_nationality = value;
    }
    // FIN VIGP-KAFG 07/04/2025

    // INI VIGP-KAFG 07/04/2025
    changeValueObligatedSubject(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_obligated_subject = value;
        else this.check_input_insu_obligated_subject = value;
    }
    // FIN VIGP-KAFG 07/04/2025

    // INI VIGP-KAFG 09/07/2025
    changeValueCalidadDeSocio(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_calidad_socio = value;
        else this.check_input_insu_calidad_socio = value;
    }
    // FIN VIGP-KAFG 09/07/2025

    // INI VIGP-KAFG 07/04/2025
    changeValueRelationship(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_relationship = value;
        else this.check_input_insu_relationship = value;
    }
    // FIN VIGP-KAFG 07/04/2025

    // INI VIGP-KAFG 07/04/2025
    changeValueFiscal_obligations(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_fiscal_obligations = value;
        else this.check_input_insu_fiscal_obligations = value;
    }
    // FIN VIGP-KAFG 07/04/2025

    ValidateInputStep1Contractor() {

        this.error_msg = "";

        let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor);
        if (validate_error_contractor.cod_error === 1) {
            this.error_msg += validate_error_contractor.message_error;
        }

        let validate_nationality_data_complementary_contractor = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_CONTRACTOR(this.check_input_nationality);
        if (validate_nationality_data_complementary_contractor.cod_error == 1) {
            this.error_msg += validate_nationality_data_complementary_contractor.message_error;
        }

        if (this.data_contractor.civil_status.codigo == "0") {
            this.error_msg += 'Debe seleccionar un estado civil para el contratante.<br>';
        }

        if (this.data_contractor.nationality.codigo == "") {
            this.error_msg += 'Debe seleccionar una nacionalidad para el contratante.<br>';
        }

        if (this.data_contractor.address == "") {
            this.error_msg += 'Debe ingresar una dirección para el contratante.<br>';
        }

        if (this.data_contractor.department.codigo == "") {
            this.error_msg += 'Debe seleccionar un departamente para el contratante.<br>';
        }

        if (this.data_contractor.province.codigo == "") {
            this.error_msg += 'Debe seleccionar una provincia para el contratante.<br>';
        }

        if (this.data_contractor.district.codigo == "") {
            this.error_msg += 'Debe seleccionar un distrito para el contratante.<br>';
        }

        // INI VIGP-193
        if (this.data_contractor.phone == "") {
            this.error_msg += 'Debe completar el campo celular para el contratante.<br>';
        }

        if (this.data_contractor.email == "") {
            this.error_msg += 'Debe completar el campo correo electrónico para el contratante.<br>';
        }
        // FIN VIGP-193

        

        /* INI Validacion Datos Complementarios */
        if (this.data_complementary.occupation_status.codigo == "") {
            this.error_msg += 'Debe seleccionar una ocupación para el contratante.<br>';
        }

        if ([3, 4, 8].includes(this.data_complementary.occupation_status.Id)) {
            if (this.data_complementary.centro_trabajo == null || this.data_complementary.centro_trabajo == "") {
                this.error_msg += 'Debe completar el campo "Centro de Trabajo" para el contratante.<br>';
            }

            if (this.data_complementary.cargo == null || this.data_complementary.cargo == "") {
                this.error_msg += 'Debe completar el campo "Cargo" para el contratante.<br>';
            }
        }

        if ((this.check_input_nationality != 0) && (this.check_input_nationality != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Es de nacionalidad estadounidense?" para el contratante.<br>';
        }

        if ((this.check_input_relationship != 0) && (this.check_input_relationship != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Es cónyuge o pariente hasta segundo grado de consanguinidad (abuelo(a), padre, madre, hijo(a), hermano(a), nieto(a)) de uno o más PEP?" para el contratante. <br>';
        }

        if ((this.check_input_fiscal_obligations != 0) && (this.check_input_fiscal_obligations != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿El asegurado tiene obligaciones fiscales/tributarias" para el contratante?<br>';
        }

        // INI VIGP-KAFG 07/04/2025
        if ((this.check_input_obligated_subject != 0) && (this.check_input_obligated_subject != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Sujeto Obligado?" para el contratante<br>';
        }
        // FIN VIGP-KAFG 07/04/2025

        if ((this.check_input_calidad_socio != 0) && (this.check_input_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
            this.error_msg += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el contratante.<br>';
        } else {
            if (this.check_input_calidad_socio == 1 && this.list_societarios_cont.length == 0) {
                this.error_msg += 'Debe registrar al menos un societario para el contratante. <br>'
            }
        }

        /* FIN Validacion Datos Complementarios */

        return this.error_msg;
    }

    ValidateInputStep1Insured() {

        this.error_msg = "";

        let validate_error_insured = this.CONSTANTS.VALIDATE_INSURED(this.data_insured);
        if (validate_error_insured.cod_error === 1) {
            this.error_msg += validate_error_insured.message_error;
        }

        let validate_nationality_data_complementary_insured = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_INSURED(this.check_input_insu_nationality);
        if (validate_nationality_data_complementary_insured.cod_error === 1) {
            this.error_msg += validate_nationality_data_complementary_insured.message_error;
        }

        if (this.data_insured.civil_status.codigo == "0") {
            this.error_msg += 'Debe seleccionar un estado civil para el asegurado.<br>';
        }

        if (this.data_insured.nationality.codigo == "") {
            this.error_msg += 'Debe seleccionar una nacionalidad para el asegurado.<br>';
        }


        if (this.data_insured.address == "") {
            this.error_msg += 'Debe ingresar una dirección para el asegurado.<br>';
        }

        if (this.data_insured.department.codigo == "") {
            this.error_msg += 'Debe seleccionar un departamente para el asegurado.<br>';
        }

        if (this.data_insured.province.codigo == "") {
            this.error_msg += 'Debe seleccionar una provincia para el asegurado.<br>';
        }

        if (this.data_insured.district.codigo == "") {
            this.error_msg += 'Debe seleccionar un distrito para el asegurado.<br>';
        }

        // INI VIGP-193
        if (this.data_insured.phone == "") {
            this.error_msg += 'Debe completar el campo celular para el asegurado.<br>';
        }

        if (this.data_insured.email == "") {
            this.error_msg += 'Debe completar el campo correo electrónico para el asegurado.<br>';
        }
        // FIN VIGP-193

        /* INI Validacion Datos Complementarios */
        // INI VIGP-KAFG 07/04/2025
        /****** VALIDA DATOS COMPLEMENTARIOS DEL ASEGURADO *******/
        if (this.data_occuptacion_insu.occupation_status.codigo == "") {
            this.error_msg += 'Debe seleccionar una ocupación para el asegurado.<br>';
        }

        if ([3, 4, 8].includes(this.data_occuptacion_insu.occupation_status.Id)) {
            if (this.data_occuptacion_insu.centro_trabajo == null || this.data_occuptacion_insu.centro_trabajo == "") {
                this.error_msg += 'Debe completar el campo "Centro de Trabajo" para el asegurado.<br>';
            }

            if (this.data_occuptacion_insu.cargo == null || this.data_occuptacion_insu.cargo == "") {
                this.error_msg += 'Debe completar el campo "Cargo" para el asegurado.<br>';
            }
        }

        if ((this.check_input_insu_nationality != 0) && (this.check_input_insu_nationality != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Es de nacionalidad estadounidense?" para el asegurado.<br>';
        }

        if ((this.check_input_insu_relationship != 0) && (this.check_input_insu_relationship != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Es cónyuge o pariente hasta segundo grado de consanguinidad (abuelo(a), padre, madre, hijo(a), hermano(a), nieto(a)) de uno o más PEP?" para el asegurado. <br>';
        }

        if ((this.check_input_insu_fiscal_obligations != 0) && (this.check_input_insu_fiscal_obligations != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿El asegurado tiene obligaciones fiscales/tributarias" para el asegurado?<br>';
        }

        if ((this.check_input_insu_obligated_subject != 0) && (this.check_input_insu_obligated_subject != 1)) {
            this.error_msg += 'Debe completar la pregunta "¿Sujeto Obligado?" para el asegurado<br>';
        }
        // FIN VIGP-KAFG 07/04/2025

        if ((this.check_input_insu_calidad_socio != 0) && (this.check_input_insu_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
            this.error_msg += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el asegurado.<br>';
        } else {
            if (this.check_input_insu_calidad_socio == 1 && this.list_societarios_insu.length == 0) {
                this.error_msg += 'Debe registrar al menos un societario para el asegurado. <br>'
            }
        }
        /* FIN Validacion Datos Complementarios */

        return this.error_msg;
    }

    ValidateInputStep3() {

        let error_msg = "";
        const sum = Number(this.origin_fund_saving_percent) + Number(this.origin_fund_spp_percent);
        if (Math.abs(sum - 100) < 0.01) { }
        else { error_msg = 'Debe completar todas las preguntas.'; }

        if (this.check_input_value_beneficiary == 0) {

            let sum_asing = this.list_benefeciarys.reduce((acc, current) => {
                let parse_percentage = parseFloat(current.percentage_participation);
                let a = parse_percentage.toFixed(2);
                let b = parseFloat(a);
                return acc + b;
            }, 0);


            if ((sum_asing == 100) || (sum_asing == 100.00)) { }
            else { error_msg = 'La suma de la asignacion debe ser del 100%.'; }
        }
        return error_msg;
    }

    previusStep(value) {
        this.current_step = value;
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

    resolveLabelBtnSocietario(type: number): string {
        if (type == 1) return `${this.isViewModalSocietarios ? "" : "Agregar "}Societarios(${this.list_societarios_cont.length})`;
        else if (type == 2) return `${this.isViewModalSocietarios ? "" : "Agregar "}Societarios(${this.list_societarios_insu.length})`;
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
        modalRef.componentInstance.reference.isView = this.isViewModalSocietarios;
        if (type == 1) modalRef.componentInstance.reference.list_societarios = this.list_societarios_cont;
        if (type == 2) modalRef.componentInstance.reference.list_societarios = this.list_societarios_insu;
        modalRef.componentInstance.reference.type = type;

        modalRef.result.then(
            (res) => {
                if (res) {
                    
                    if (type == 1) {
                        this.list_societarios_cont = res.list_societarios.map(item => {
                            item.NPORCENTAJE = item.NPORCENTAJE.toString();
                            return {
                                NPORCENTAJE: item.NPORCENTAJE,
                                SRAZON_SOCIAL: item.SRAZON_SOCIAL,
                                SROL: item.SROL,
                                SRUC: item.SRUC
                            };
                        });
                    } else if (type == 2) {
                        this.list_societarios_insu = res.list_societarios.map(item => {
                            item.NPORCENTAJE = item.NPORCENTAJE.toString();
                            return {
                                NPORCENTAJE: item.NPORCENTAJE,
                                SRAZON_SOCIAL: item.SRAZON_SOCIAL,
                                SROL: item.SROL,
                                SRUC: item.SRUC
                            };
                        });
                    }
                }

            }
        )
    }

    OpenModalBeneficiary(type, item) {
        if (["196"].includes(this.profile_id)) return;
        // if (!["203", "196"].includes(this.profile_id)) {
        // if (!["203", "196", "192"].includes(this.profile_id) || (this.profile_id == "192" && this.NID_STATE != 10)) {
            // if (this.profile_id != '196' && this.profile_id != '203') {
            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(AddBeneficiaryComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.reference.list_benefeciary = this.list_benefeciarys;
            modalRef.componentInstance.reference.type = type;
            modalRef.componentInstance.reference.item = item;
            if (item != null) modalRef.componentInstance.reference.item.last_name2 = item.slastname2
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
                            slastname2: res.last_name2,
                            srelation_name: res.relation.text,
                            percentage_participation: res.assignment,
                            type_doc: res.type_document.Id,
                            type_document: { desc_type_doc: res.type_document.Name },
                            desc_nationality: res.nationality.SDESCRIPT,
                            relation: { GLS_ELEMENTO: res.relation.SDESCRIPT, NCODIGO: res.relation.COD_ELEMENTO },
                            desc_type_doc: res.type_document.Id == 2 ? 'DNI' : "C.E",
                        };

                        // AQUI SE DEBE COMPROBAR QUE EL TIPO Y NUMERO DE DOCUEMNTO SEA LOS MISMOS, SI SON LOS MISMO VA REEMPLAZAR LA DATA CON EL NUEVO ELEMENTO EDITADO, SI NO SE ENCUENTRA UNO IGUAL LO VA INSERTAR COMO NUEV
                        if (type == 'edit') {

                            const new_list_benefeciary = this.list_benefeciarys.map((element) => {
                                if ((element.type_doc == item.type_doc) && (element.siddoc == item.siddoc)) { return new_item; }
                                else { return element; }
                            });
                            this.list_benefeciarys = new_list_benefeciary;
                        }
                        else {
                            this.list_benefeciarys.push({ ...new_item, slastname2: new_item.last_name2 });// Aqui se esta insertando
                        }

                        this.currentPage = 1;
                        this.totalItems = this.list_benefeciarys.length;
                        this.listToShow_benefeciarys = this.list_benefeciarys.slice(
                            (this.currentPage - 1) * this.itemsPerPage,
                            this.currentPage * this.itemsPerPage
                        );
                    }
                }
            )
        // }
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
        modalRef.componentInstance.reference.quotation_id = this.quotation_id;
        modalRef.componentInstance.reference.sclient = this.sclient;

        modalRef.result.then(
            res => {
                this.getDatosPep();
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
        modalRef.componentInstance.reference.quotation_id = this.quotation_id;
        modalRef.componentInstance.reference.sclient = this.sclient;

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
        modalRef.componentInstance.reference.quotation_id = this.quotation_id;
        modalRef.componentInstance.reference.sclient = this.sclient;

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
        modalRef.componentInstance.reference.quotation_id = this.quotation_id;
        modalRef.componentInstance.reference.sclient = this.sclient;

        modalRef.result.then(
            res => {
                this.SelDatosPEPVIGP();
            }
        );
    }


    async OpenModalDetailOrigin(type = '') {

        if (this.profile_id != '196' && this.profile_id != '203') {
            let modalRef: NgbModalRef;

            if (type == "edit" && this.dissabled_btn_modal_detail_origin == false) return;

            modalRef = this.modalService.open(OriginDetailModalComponent, {
                size: 'xl',
                backdropClass: 'light-blue-backdrop',
                backdrop: 'static',
                keyboard: true,
            });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.reference.quotation_id = this.quotation_id;

            let response_origin_detail_modal = {
                P_NBUSINESS_DIVIDENS: null,
                P_NBUSINESS_INCOME: null,
                P_NCANCELED_BANK_CERTIFICATES: null,
                P_NCANCELLATION_TERM_DEPOSITS: null,
                P_NCOMPENSATION_SERVICE_TIME: null,
                P_NCUSPP: null,
                P_NGRATIFICATIONS: null,
                P_NID_COTIZACION: null,
                P_NINCOME_PERSONAL_FEES: null,
                P_NINHERITANCE: null,
                P_NLABOR_PROFITS: null,
                P_NLOAN: null,
                P_NOTHERS: null,
                P_NPRIVATE_PENSION_SYSTEM: null,
                P_NREMUNERATIONS: null,
                P_NSALES_ESTATES: null,
                P_NSALE_SECURITIES: null,
                P_NSAVING_FINANCIAL_INSTITUTION1: null,
                P_NSAVING_FINANCIAL_INSTITUTION2: null,
                P_NSAVING_FINANCIAL_INSTITUTION3: null,
                P_NSAVING_FINANCIAL_INSTITUTION4: null,
                P_SACCOUNT_NUMBER1: null,
                P_SACCOUNT_NUMBER2: null,
                P_SACCOUNT_NUMBER3: null,
                P_SACCOUNT_NUMBER4: null,
                cancel: "false",
                P_SCOMMENT: ''
            };

            await modalRef.result.then((res) => { 
                response_origin_detail_modal = res ;
            });

            if ((!response_origin_detail_modal.cancel) || (response_origin_detail_modal.cancel != "true")) { 
                this.registrarLocalUpdateCot(2);
                this.registrarLocalUpdateCot(3);
                this.showPercentage(response_origin_detail_modal); 
            }
        }
    }


    showPercentage(origin_detail) {

        // console.log(origin_detail.P_NPRIVATE_PENSION_SYSTEM); // Su valor por defecto  es 0
        // console.log(origin_detail.P_NCUSPP); // Su valor por defecto es Vacio ''

        // Cuando No existe NINGUNA INSTITUCION FINANCIERA Y EL SISTEMA PRIVADO DE PENSIONES TIENE VALOR.

        if ((!origin_detail?.P_NSAVING_FINANCIAL_INSTITUTION1 && !origin_detail?.P_NSAVING_FINANCIAL_INSTITUTION2 && !origin_detail?.P_NSAVING_FINANCIAL_INSTITUTION3 && !origin_detail?.P_NSAVING_FINANCIAL_INSTITUTION4) && (origin_detail?.P_NPRIVATE_PENSION_SYSTEM != "0" && origin_detail?.P_NCUSPP != "")) {
            this.origin_fund_saving_percent = 0;
            this.origin_fund_spp_percent = 100;
            this.dissabled_btn_modal_detail_origin = true;
        }

        // Si existe 1 o mas Ahorro financiero Y el Sistema privado de pensiones es Vacio.
        else if ((origin_detail.P_NSAVING_FINANCIAL_INSTITUTION1 || origin_detail.P_NSAVING_FINANCIAL_INSTITUTION2 || origin_detail.P_NSAVING_FINANCIAL_INSTITUTION3 || origin_detail.P_NSAVING_FINANCIAL_INSTITUTION4) && (origin_detail?.P_NPRIVATE_PENSION_SYSTEM == "0" && origin_detail?.P_NCUSPP == "")) {
            console.log("Alguno financiero tiene valor y Se tiene vacion el SPP");
            this.origin_fund_saving_percent = 100;
            this.origin_fund_spp_percent = 0;
            this.dissabled_btn_modal_detail_origin = true;
        }

        else {
            origin_detail.P_NBUSINESS_INCOME = origin_detail.P_NBUSINESS_INCOME ? origin_detail.P_NBUSINESS_INCOME == '' ? 0 : origin_detail.P_NBUSINESS_INCOME : 0;
            origin_detail.P_NREMUNERATIONS = origin_detail.P_NREMUNERATIONS ? origin_detail.P_NREMUNERATIONS == '' ? 0 : origin_detail.P_NREMUNERATIONS : 0;
            origin_detail.P_NGRATIFICATIONS = origin_detail.P_NGRATIFICATIONS ? origin_detail.P_NGRATIFICATIONS == '' ? 0 : origin_detail.P_NGRATIFICATIONS : 0;
            origin_detail.P_NBUSINESS_DIVIDENS = origin_detail.P_NBUSINESS_DIVIDENS ? origin_detail.P_NBUSINESS_DIVIDENS == '' ? 0 : origin_detail.P_NBUSINESS_DIVIDENS : 0;
            origin_detail.P_NSALE_SECURITIES = origin_detail.P_NSALE_SECURITIES ? origin_detail.P_NSALE_SECURITIES == '' ? 0 : origin_detail.P_NSALE_SECURITIES : 0;
            origin_detail.P_NCANCELED_BANK_CERTIFICATES = origin_detail.P_NCANCELED_BANK_CERTIFICATES ? origin_detail.P_NCANCELED_BANK_CERTIFICATES == '' ? 0 : origin_detail.P_NCANCELED_BANK_CERTIFICATES : 0;
            origin_detail.P_NLOAN = origin_detail.P_NLOAN ? origin_detail.P_NLOAN == '' ? 0 : origin_detail.P_NLOAN : 0;
            origin_detail.P_NINCOME_PERSONAL_FEES = origin_detail.P_NINCOME_PERSONAL_FEES ? origin_detail.P_NINCOME_PERSONAL_FEES == '' ? 0 : origin_detail.P_NINCOME_PERSONAL_FEES : 0;
            origin_detail.P_NCOMPENSATION_SERVICE_TIME = origin_detail.P_NCOMPENSATION_SERVICE_TIME ? origin_detail.P_NCOMPENSATION_SERVICE_TIME == '' ? 0 : origin_detail.P_NCOMPENSATION_SERVICE_TIME : 0;
            origin_detail.P_NLABOR_PROFITS = origin_detail.P_NLABOR_PROFITS ? origin_detail.P_NLABOR_PROFITS == '' ? 0 : origin_detail.P_NLABOR_PROFITS : 0;
            origin_detail.P_NSALES_ESTATES = origin_detail.P_NSALES_ESTATES ? origin_detail.P_NSALES_ESTATES == '' ? 0 : origin_detail.P_NSALES_ESTATES : 0;
            origin_detail.P_NINHERITANCE = origin_detail.P_NINHERITANCE ? origin_detail.P_NINHERITANCE == '' ? 0 : origin_detail.P_NINHERITANCE : 0;
            origin_detail.P_NCANCELLATION_TERM_DEPOSITS = origin_detail.P_NCANCELLATION_TERM_DEPOSITS ? origin_detail.P_NCANCELLATION_TERM_DEPOSITS == '' ? 0 : origin_detail.P_NCANCELLATION_TERM_DEPOSITS : 0;
            origin_detail.P_NOTHERS = origin_detail.P_NOTHERS ? origin_detail.P_NOTHERS == '' ? 0 : origin_detail.P_NOTHERS : 0;

            let sum_origin_detail = Number.parseFloat(origin_detail.P_NBUSINESS_INCOME) + Number.parseFloat(origin_detail.P_NREMUNERATIONS) + Number.parseFloat(origin_detail.P_NGRATIFICATIONS) + Number.parseFloat(origin_detail.P_NBUSINESS_DIVIDENS) + Number.parseFloat(origin_detail.P_NSALE_SECURITIES) + Number.parseFloat(origin_detail.P_NCANCELED_BANK_CERTIFICATES) + Number.parseFloat(origin_detail.P_NLOAN) + Number.parseFloat(origin_detail.P_NINCOME_PERSONAL_FEES) + Number.parseFloat(origin_detail.P_NCOMPENSATION_SERVICE_TIME) + Number.parseFloat(origin_detail.P_NLABOR_PROFITS) + Number.parseFloat(origin_detail.P_NSALES_ESTATES) + Number.parseFloat(origin_detail.P_NINHERITANCE) + Number.parseFloat(origin_detail.P_NCANCELLATION_TERM_DEPOSITS) + Number.parseFloat(origin_detail.P_NOTHERS)

            this.dissabled_btn_modal_detail_origin = true;

            // this.origin_fund_saving_percent = sum_origin_detail;
            // this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);

            // this.origin_fund_saving_percent = sum_origin_detail;
            this.origin_fund_saving_percent = sum_origin_detail.toFixed(2);
            this.origin_fund_spp_percent = subtractWithPrecision(100, this.origin_fund_saving_percent);
        }
    };

    async deleteDetailOrigin() {

        if (this.profile_id != '196' && this.profile_id != '203') {
            if (this.dissabled_btn_modal_detail_origin == false) return;
            
            this.isLoading = true;
            try{

                const res = await this.vidaInversionService.DeleteOriginDetail(this.quotation_id).toPromise();
                 
                if (res.ErrorCode == 0) {

                    this.origin_fund_saving_percent = 0;
                    this.origin_fund_spp_percent = 0;
                    this.dissabled_btn_modal_detail_origin = false;

                    this.registrarLocalUpdateCot(2);
                    this.registrarLocalUpdateCot(3);

                    Swal.fire('Información', "Se eliminó la información correctamente.", 'success');
                } else {
                    Swal.fire('Información', "Ocurrió un problema al realizar la solicitud.", 'error');
                }

            }catch(error){
                Swal.fire('Información', "Ocurrió un problema al realizar la solicitud.", 'error');
            } finally {
                this.isLoading = false;
            }
        }
    }

    toUpper(event: KeyboardEvent): void {
        const inputElement = event.target as HTMLInputElement;
        inputElement.value = inputElement.value.toUpperCase();
    }
    
    registrarLocalUpdateCot(typeFile: number) {
        /**
         * typeFile => 
         *      1: Slip de cotizacion
         *      2: Documentos PEP
         *      3: File del cliente
         */

        let updateCot = localStorage.getItem('updateCot');
        let parseUpdateCot = updateCot ? JSON.parse(updateCot) as any[] : [];
        const newUpdateCot = parseUpdateCot.filter(x => `${x.NID_COTIZACION}-${x.TYPE_FILE}` !=  `${this.quotation_id}-${typeFile}`);
        newUpdateCot.push({ NID_COTIZACION: this.quotation_id, TYPE_FILE: typeFile });
        localStorage.setItem('updateCot', JSON.stringify(newUpdateCot));
    }

    async execReGenDocumentsVIGP(){
        let updateCot = localStorage.getItem('updateCot');
        let parseUpdateCot = updateCot ? JSON.parse(updateCot) as any[] : [];
        if(parseUpdateCot.length == 0) return;

        const reGenDocs = parseUpdateCot.filter(x => x.NID_COTIZACION == this.quotation_id);
        if(reGenDocs.length == 0) return;
        // reGenDocs.forEach( async (item) => {

        //     await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: item.NID_COTIZACION, P_NDOCUMENT : item.TYPE_FILE, P_APPLY_DELETE: 1}).toPromise();
        // });
        const exetype1 = reGenDocs.find(x=> `${x.NID_COTIZACION}-${x.TYPE_FILE}` ==  `${this.quotation_id}-${1}`)
        const exetype2 = reGenDocs.find(x=> `${x.NID_COTIZACION}-${x.TYPE_FILE}` ==  `${this.quotation_id}-${2}`)
        const exetype3 = reGenDocs.find(x=> `${x.NID_COTIZACION}-${x.TYPE_FILE}` ==  `${this.quotation_id}-${3}`)

        if(exetype1) await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 1, P_APPLY_DELETE: 1}).toPromise();
        if (exetype2) await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 2, P_APPLY_DELETE: 1}).toPromise();
        if(exetype3)await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 3, P_APPLY_DELETE: 1}).toPromise();

        // Eliminar el item del localStorage
        const newUpdateCot = parseUpdateCot.filter(x => x.NID_COTIZACION != this.quotation_id);
        localStorage.setItem('updateCot', JSON.stringify(newUpdateCot));
    }

    readFile = async (isRefresh = false) => {

        if(isRefresh){
            await this.refreshStatesCoti();
        }

        let obj = {
            P_NID_COTIZACION: this.quotation_id
        };

        try{
            const res = await this.vidaInversionService.ReadDocumentsVIGP(obj).toPromise();
            // .then(
            // res => {
                if (res.P_NCODE == 0) {

                    // console.log(this.NID_STATE);
                    // console.log(this.flag_file_cliente);


                    if (this.NID_STATE == 12 || this.NID_STATE == 14) {
                        let temp = res.P_DOCUMENTS.filter(x => x.P_FLAG != 1);

                        // console.log(temp);

                        let bool: boolean = false;
                        for (let i = 0; i < temp.length; i++) {
                            if ((temp[i].P_FLAG == 7 && temp[i].P_STATUS == 1 && (!this.isChangeSignature() || !(this.isChangeSignature() && [0,2].includes(this.quotation.nsignature_type)) )) 
                                || (temp[i].P_FLAG == 9 && temp[i].P_STATUS == 1 && this.flag_file_cliente == "1")) { // Cuando se subió el File Del Cliente firmado
                                bool = true;
                            }
                        }
                        console.log("bool: ", bool);
                        if (bool) {

                            // this.filesList = temp.filter(x => x.P_FLAG != 6 );
                            // INI CAMBIO  LINEA DE TIEMPO  19122024
                            console.log("this.flag_file_cliente: ", this.flag_file_cliente);
                            if (this.flag_file_cliente == "1") {
                                this.filesList = temp.filter(x => ![6, 7, 8].includes(x.P_FLAG));
                            }
                            else if (this.flag_file_cliente == "2") {
                                this.filesList = temp.filter(x => ![6, 7, 9].includes(x.P_FLAG));
                            }
                            else {
                                if (this.isChangeSignature() && this.quotation.nsignature_type == 1) {
                                    this.filesList = temp.filter(x => ![8, 9].includes(x.P_FLAG));
                                }else {
                                    this.filesList = temp.filter(x => ![6, 8, 9].includes(x.P_FLAG));
                                }
                            }
                            // FIN  CAMBIO  LINEA DE TIEMPO  19122024

                            this.firmaManuscrita = true;

                        } else {
                            // this.filesList = temp.filter(x => x.P_FLAG != 7);
                            /* INI CAMBIO  LINEA DE TIEMPO  19122024 */
                            if (this.flag_file_cliente == "1") {
                                this.filesList = temp.filter(x => ![6, 7, 9].includes(x.P_FLAG));
                            }
                            else if (this.flag_file_cliente == "2") {
                                this.filesList = temp.filter(x => ![7, 8, 9].includes(x.P_FLAG));
                            }
                            else {
                                this.filesList = temp.filter(x => ![7, 8, 9].includes(x.P_FLAG));
                            }
                            /* FIN CAMBIO  LINEA DE TIEMPO */

                            this.firmaManuscrita = false;
                        }
                    } else {
                        this.filesList = res.P_DOCUMENTS.filter(x => x.P_FLAG != 6 && x.P_FLAG != 7 && x.P_FLAG != 9);
                        this.firmaManuscrita = false;
                    }

                    // if(this.filesList.find(x => x.P_FLAG == 7 && x.P_STATUS == 1)){
                    //     const newFilterList = this.filesList.filter(x => x.P_FLAG != 6);
                    //     this.filesList = newFilterList;
                    // }
                }
            // },
            // error => {
            // }
        // );
            }catch(error){
                // throw error;
                Swal.fire('Información', "Ha ocurrido un error al obtener los archivos.", 'error');
            }finally{
                this.isLoading = false;
            }
    }

    isExistFileFlag = (flag: number): boolean => {
        let temp = this.filesList.find(x => x.P_FLAG == flag && x.P_STATUS == 1);
        return temp ? true : false;
    }

    addFile = () => {
        let temp = this.filesList.filter(x => x.P_FLAG == 3 || x.P_FLAG == 4 || x.P_FLAG == 5)
        if (temp.length >= 5) {
            Swal.fire('Información', 'Solo puede agregar 5 documentos como máximo.', 'warning');
            return;
        }
        let item: any = {};
        item.P_DESCRI = "otros";
        item.P_NAME = "";
        item.P_FLAG = 5;
        item.P_TYPE = "";
        item.P_FILE_NAME = "";
        item.P_STATUS = 0;
        this.filesList.push(item);
    }

    deleteFile = async (item, i) => {
        console.log(item);
        if (item.P_FLAG == 5) {
            let _temp = this.filesList.splice(i, 1);
            let temp = this.filesList.filter(x => x !== _temp);
            this.filesList = temp;
        } else {
            const isConfirm = await Swal.fire(
                {
                    title: '¿Está seguro de eliminar el archivo?',
                    text: 'Esta acción es irreversible.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                }
            );
            
            // console.log("isConfirm: ", isConfirm)
            // return;
            // Swal.fire(
            //     {
            //         title: '¿Está seguro de eliminar el archivo?',
            //         text: 'Esta acción es irreversible.',
            //         icon: 'warning',
            //         showCancelButton: true,
            //         confirmButtonText: 'Aceptar',
            //         allowOutsideClick: false,
            //         cancelButtonText: 'Cancelar',
            //     }
            // ).then(
            //     (result) => {

                    if (isConfirm.isConfirmed) {

                        let nopcion = 0;

                        if(!this.isChangeSignature() && this.quotation.nsignature_type != 0){ // Eliminar file cliente firmado en el primer intento
                            nopcion = 1;  // Elimina el file cliente firmado, resetea los estados de firma, resetea tipo_firma, resetea el ninsdoc_changsign
                        } else if (this.isChangeSignature() && this.NID_STATE == 14 && this.quotation.ninsdoc_changsign == 1 && this.quotation.nderivfirm_changsign == 0){ // Eliminar file cliente firmado en el segundo intento
                            nopcion = 2;  // Solo elimina el file, mantiene los estados y otras columnas para mantener la accion derivar para firmas
                        }else if(this.isChangeSignature() && this.NID_STATE == 12 && this.quotation.nderivfirm_changsign == 1 && this.quotation.nsignature_type != 0){ // Eliminar file cliente firmado en el segundo intento
                            nopcion = 1;
                        }
                        let obj = {
                            P_NID_COTIZACION: this.quotation_id,
                            P_DESCRI: item.P_DESCRI,
                            P_NAME: item.P_NAME,
                            P_FLAG: item.P_FLAG,
                            P_OPCION: nopcion
                        };
                        const res = await this.vidaInversionService.DeleteDocumentsVIGP(obj).toPromise();
                            // .then(
                            // res => {
                                if (res.P_NCODE == 0) {
                                    Swal.fire('Información', "Se eliminó el archivo correctamente.", 'success');

                                    // add voucher de pago (pago total y banco)
                                    if (item.P_DESCRI == "voucher_de_pago") {

                                        const request = {
                                            P_NID_COTIZACION: this.quotation_id,
                                            P_NIDPROD: this.quotation.nid_proc,
                                            P_STATUS_TOTAL_PAYMENT: null,
                                            P_BANK_PAYMENT: null
                                        }
                                        await this.vidaInversionService.updateStatusTotalPayment(request).toPromise();
                                    }
                                    // add voucher de pago (pago total y banco)
                                    await this.readFile(true);
                                    //
                                } else {
                                    Swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            // },
                            // error => {
                            //     Swal.fire('Información', "Ha ocurrido un error al eliminar el archivo.", 'error');
                            // }
                        // );
                    }
                    else if (isConfirm.dismiss === Swal.DismissReason.cancel) {
                        this.modalService.dismissAll();
                    }
                // }
            // )
        }
    }

    importFile = async (event, item) => {
        if (item.P_NAME == null || item.P_NAME == "") {
            Swal.fire('Información', "Debe ingresar el nombre del documento.", 'warning');
        } else {
            if (event.target.files.length == 0) {
                return;
            }

            let file: File = event.target.files[0];
            let myFormData: FormData = new FormData();

            let obj = {
                P_NID_COTIZACION: this.quotation_id,
                P_DESCRI: item.P_DESCRI,
                P_NAME: item.P_NAME,
                P_FLAG: item.P_FLAG
            };

            myFormData.append('objeto', JSON.stringify(obj));
            myFormData.append('dataFile', file);

            await this.vidaInversionService.SaveDocumentsVIGP(myFormData).toPromise().then(
                res => {
                    if (res.P_NCODE == 0) {
                        Swal.fire('Información', "Se subió el archivo correctamente.", 'success');
                        this.readFile();
                    } else {
                        Swal.fire('Información', res.P_MESSAGE, 'error');
                    }
                },
                error => {
                    Swal.fire('Información', "Ha ocurrido un error al cargar el archivo.", 'error');
                }
            );
        }
    }

    exportFile = (item) => {
        let obj = item.P_FILE_NAME;
        this.othersService.downloadFile(obj).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    Swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    var newBlob = new Blob([res], { type: "application/pdf" });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);

                    var link = document.createElement('a');
                    link.href = data;

                    link.download = obj.substring(obj.lastIndexOf("\\") + 1);
                    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                    setTimeout(function () {
                        window.URL.revokeObjectURL(data);
                        link.remove();
                    }, 100);
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error al descargar el archivo.", 'error');
            }
        );
    }

    visualizeFile = (item, content: any) => {

        let obj = item.P_FILE_NAME;
        this.fileNameSelected = item.P_TYPE;
        this.othersService.downloadFile(obj).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    Swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    var newBlob = new Blob([res], { type: "application/pdf" });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    this.pdfFile = window.URL.createObjectURL(newBlob);
                    this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error al visualizar el archivo.", 'error');
            }
        );
    }

    listToString = (list: String[]): string => {
        let output = "";
        if (list != null) {
            list.forEach(
                function (item) {
                    output = output + item + " <br>"
                }
            );
        }
        return output;
    }

    deleteBenefeciary(item_benefeciary) {
        
        if (["196"].includes(this.profile_id)) return;
        // if (this.profile_id != '196' && this.profile_id != '203') {
        // if (!["203", "196", "192"].includes(this.profile_id) || (this.profile_id == "192" && this.NID_STATE != 10)) {

            let new_list_benefeciary = this.list_benefeciarys.filter((element) => element.siddoc != item_benefeciary.siddoc);
            this.list_benefeciarys = new_list_benefeciary;
            this.totalItems = this.list_benefeciarys.length;
            this.listToShow_benefeciarys = this.list_benefeciarys.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );
            this.currentPage = this.listToShow_benefeciarys.length == 0 ? this.currentPage - 1 : this.currentPage;
            this.listToShow_benefeciarys = this.list_benefeciarys.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );
            this.registrarLocalUpdateCot(3);
        // }
    }

    changeStyleCredit(input_name = "") {

        let format_amount = parseInt(this.quotation.contribution.replace(/,/g, ''));

        this.parse_amount = CommonMethods.formatNUMBER(format_amount);
        this.quotation.contribution = this.parse_amount;

        if (this.quotation.contribution.toUpperCase() == "NAN") {
            this.quotation.contribution = '';
        }
    }

    changeDocumentType(search_type: any) {
        if (search_type == 1) {
            this.data_contractor.document_number = "";
        } else {
            this.data_insured.document_number = "";
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
    }

    searchValidate(search_type) { // 1 Contratante 2 Asegurado

        const validate_res = { cod_error: "0", message: "" };

        if (search_type == 1) {

            if (this.data_contractor.type_document.Id == 2) {
                // console.log(this.data_contractor.document_number.length);

                if (this.data_contractor.document_number.length == 7) {
                    // console.log(this.data_contractor.document_number);
                    this.data_contractor.document_number = this.data_contractor.document_number.padStart(8, "0");
                    // console.log(this.data_contractor.document_number);
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
                        await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                            async (res) => {
                                consultIdecom = {
                                    P_SCLIENT: this.data_contractor.sclient,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                    P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                    P_SUPDCLIENT: '0'
                                }

                                this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            }
                        );
                    } else {
                        if (consultIdecom.P_SUPDCLIENT == "1") {
                            await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                                async (res) => {
                                    consultIdecom = {
                                        P_SCLIENT: this.data_contractor.sclient,
                                        P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                        P_NISPEP: res.isPep ? 1 : 0,
                                        P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                        P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                        P_SUPDCLIENT: '1'
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
        } else {
            datosIdecom = {
                name: this.data_insured.names + ' ' + this.data_insured.last_name + ' ' + this.data_insured.last_name2,
                idDocNumber: this.data_insured.document_number,
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
                        await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                            async (res) => {
                                consultIdecom = {
                                    P_SCLIENT: this.data_insured.sclient,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                    P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                    P_SUPDCLIENT: '0'
                                }

                                this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                                this.isLoading = false;
                            }
                        );
                    } else {
                        if (consultIdecom.P_SUPDCLIENT == "1") {
                            await this.vidaInversionService.getIdecon(datosIdecom).toPromise().then(
                                async (res) => {
                                    consultIdecom = {
                                        P_SCLIENT: this.data_insured.sclient,
                                        P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                        P_NISPEP: res.isPep ? 1 : 0,
                                        P_NISFAMPEP: res.isFamPep ? 1 : 0,
                                        P_NNUMBERFAMPEP: res.isIdNumberFamPep ? 1 : 0,
                                        P_SUPDCLIENT: '1'
                                    }

                                    this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                    this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                                    this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';

                                    await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                                }
                            );
                        } else {
                            this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';
                        }
                    }
                }
            );
        }
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


    async cargarDatosInsured(res: any) {

        const insured_data_client = res.EListClient[0];

        this.data_insured.names = insured_data_client.P_SFIRSTNAME;
        this.data_insured.last_name = insured_data_client.P_SLASTNAME;
        this.data_insured.last_name2 = insured_data_client.P_SLASTNAME2;
        this.data_insured.sclient = insured_data_client.P_SCLIENT;

        if (this.data_insured.type_document.Id == 4) {
            this.homologacionInsu = "__";
        }
        else {
            insured_data_client.P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, insured_data_client.P_SCLIENT);
            this.homologacionInsu = insured_data_client.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025
        }

        // let split_date = insured_data_client.P_DBIRTHDAT.split('/');
        // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;
        if (insured_data_client.P_DBIRTHDAT == null) {
            // console.log("Fecha Nula");
        } else {
            let split_date = insured_data_client.P_DBIRTHDAT.split('/');
            this.data_insured.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        }
        this.data_insured.gender = { SSEXCLIEN: insured_data_client.P_SSEXCLIEN };
        this.data_insured.civil_status = { NCIVILSTA: insured_data_client.P_NCIVILSTA };

        this.data_insured.nationality = { NNATIONALITY: insured_data_client.P_NNATIONALITY };


        if (insured_data_client.EListEmailClient.length >= 1) {
            this.data_insured.email = insured_data_client.EListEmailClient[0].P_SE_MAIL;
        }


        if (insured_data_client.EListAddresClient.length >= 1) {
            this.data_insured.address = insured_data_client.EListAddresClient[0].P_SDESDIREBUSQ;
            this.data_insured.department = { Id: parseInt(insured_data_client.EListAddresClient[0].P_NPROVINCE) }

            await this.setDepartmentInsured(parseInt(insured_data_client.EListAddresClient[0].P_NPROVINCE));

            await this.setProvinceInsured(parseInt(this.data_insured.department.Id), parseInt(insured_data_client.EListAddresClient[0].P_NLOCAL));

            await this.setDistrictInsured(parseInt(this.data_insured.province.Id), parseInt(insured_data_client.EListAddresClient[0].P_NMUNICIPALITY));

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

        if (insured_data_client.EListPhoneClient.length >= 1) {
            this.data_insured.phone = insured_data_client.EListPhoneClient[0].P_SPHONE;
        }
    }

    async ConsultDataComplementary(search_type) {
        let params_cons = {
            P_NID_COTIZACION: this.quotation_id,  // VIGP-KAFG 03/04/2025
            P_NTYPE_CLIENT: search_type,  // VIGP-KAFG 04/04/2025
            P_SNUMBER_DOCUMENT: search_type == 1 ? this.data_contractor.document_number : this.data_insured.document_number,  // VIGP-KAFG 07/04/2025
        };
        await this.vidaInversionService.ConsultDataComplementary(params_cons).toPromise().then(
            async res => {

                if (search_type == 1) { // VIGP-KAFG 07/04/2025
                    this.check_input_nationality = res.P_NNATUSA;
                    this.check_input_relationship = res.P_NCONPARGC;
                    this.check_input_fiscal_obligations = res.P_NOFISTRI;
                    this.check_input_obligated_subject = res.P_NOBLIGATED_SUBJECT // VIGP-KAFG 03/04/2025
                    this.check_input_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                    this.data_complementary.occupation_status = { Id: res.P_NOCCUPATION }
                    this.data_complementary.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_complementary.cargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_cont_original = res.P_SOCIETARIOS;
                    this.list_societarios_cont = res.P_SOCIETARIOS
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                    //     return societario;
                    // });

                    this.nregister_nnatusa = res.P_NNATUSA;
                    this.nregister_nconpargc = res.P_NCONPARGC;
                    this.nregister_nofistri = res.P_NOFISTRI;
                    this.nregister_noccupation = res.P_NOCCUPATION;
                    this.nregister_scentro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.nregister_scargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.nregister_nobligated_subject = res.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 03/04/2025
                    this.nregister_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025

                    // INI VIGP-KAFG 07/04/2025
                } else {

                    this.check_input_insu_relationship = res.P_NCONPARGC;
                    this.check_input_insu_nationality = res.P_NNATUSA;
                    this.check_input_insu_fiscal_obligations = res.P_NOFISTRI;
                    this.check_input_insu_obligated_subject = res.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
                    this.check_input_insu_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                    this.data_occuptacion_insu.occupation_status = { Id: res.P_NOCCUPATION }
                    this.data_occuptacion_insu.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_occuptacion_insu.cargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_insu_original = res.P_SOCIETARIOS;
                    this.list_societarios_insu = res.P_SOCIETARIOS
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                    //     return societario;
                    // });

                    this.nregister_insu_nnatusa = res.P_NNATUSA;
                    this.nregister_insu_nconpargc = res.P_NCONPARGC;
                    this.nregister_insu_nofistri = res.P_NOFISTRI;
                    this.nregister_insu_noccupation = res.P_NOCCUPATION
                    this.nregister_insu_scentro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.nregister_insu_scargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.nregister_insu_nobligated_subject = res.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
                    this.nregister_insu_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                }
                // FIN VIGP-KAFG 07/04/2025

                this.changeOccupation(search_type); //KAFG VIGP
            })
    };

    // (Metodo no se esta usando ya que no se tiene la funcionalidad de cambiar de asegurado)
    async consultProspect() {
        // INI VIGP-KAFG 18/03/2025
        let params_cons = {
            P_NID_COTIZACION: this.quotation_id
        }

        await this.vidaInversionService.searchByProspectQuotation(params_cons).toPromise().then( // VIGP-KAFG 18/03/2025
            async res => {
                // INI VIGP-KAFG 18/03/2025
                // this.check_input_value = res.P_NID_ASCON;
                this.check_input_value = res.NID_ASCON;
                // this.check_input_value_360 = res.P_NID_ASCON;
                this.check_input_value_360 = res.NID_ASCON;
                if (this.check_input_value == 0) {
                    // this.data_insured.type_document = { Id: res.P_NTYPE_DOCUMENT };
                    this.data_insured.type_document = { Id: res.TYPE_DOC_INSURED };
                    // this.data_insured.document_number = res.P_SNUMBER_DOCUMENT_INSURED.trim();
                    this.data_insured.document_number = res.DOC_INSURED.trim();
                    // if (res.P_SRELATION == null) { // PARENTESCO
                    if (res.SRELATION == null) { // PARENTESCO
                        this.data_insured.relation = { COD_ELEMENTO: 0 };
                    } else {
                        this.data_insured.relation = { COD_ELEMENTO: parseInt(res.SRELATION) };
                    }
                    // FIN VIGP-KAFG 18/03/2025
                    this.nregister_parentesco = this.data_insured.relation;
                    console.log(this.nregister_parentesco);

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
                                if (res.EListClient[0].P_SCLIENT == null) { }
                                else {
                                    // 2 Insured
                                    if (res.EListClient.length === 1) {
                                        await this.cargarDatosInsured(res);
                                        // this.invokeServiceExperia(2);
                                        // this.getWorldCheck(2);
                                        this.getDataIdeconClient(2); //TEMP 070082025
                                        this.data_insured_360 = { ...this.data_insured }; // Almacenando la Info de Inicio del 360 para el Asegurado en una Variable para validar si se tiene que actualizar data de la persona.
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

    async getDataContractor(res: any) {

        const contracting_data = res.EListClient[0];

        let split_date = contracting_data.P_DBIRTHDAT.split('/');
        this.data_contractor.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_contractor.sclient = contracting_data.P_SCLIENT;

        if (this.data_contractor.type_document.Id == 4) {
            this.homologacionCont = "__";
        }
        else {
            contracting_data.P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, contracting_data.P_SCLIENT);
            this.homologacionCont = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025
        }

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
            });
        }


        if (contracting_data.EListPhoneClient.length >= 1) {
            this.data_contractor.phone = contracting_data.EListPhoneClient[0].P_SPHONE;
        }
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
            this.data_insured.relation = { COD_ELEMENTO: 0 };

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
        }
    }

    async changeStep(next_step) {
        // console.log("this.flag_file_cliente: ", this.flag_file_cliente)
        /* Para que no salga el mensaje cuando se tenga que subir el file completo*/
        this.isLoading = true;
        try{
            
            if (next_step == 2 && this.flag_file_cliente == "2") {
                this.current_step = next_step;
            }

            // Validar que soporte sea despues de ser aprobado por Gerente
            else if (next_step == 2 && (!["203", "196"].includes(this.profile_id))) {
                // else if (next_step == 2 && (!["203", "196", "192"].includes(this.profile_id) || (this.profile_id == "192" && this.NID_STATE != 10))) {
                this.ValidateInputStep1Contractor();
                if (this.error_msg.toString().trim() != '') {
                    this.isLoading = false;
                    await Swal.fire('Información Contratante', this.error_msg, 'error');
                    return;
                }

                if (this.check_input_value == 0) {

                    this.ValidateInputStep1Insured();
                    if (this.error_msg.toString().trim() != '') {
                        this.isLoading = false;
                        await Swal.fire('Información Asegurado', this.error_msg, 'error');
                        return;
                    }
                }

                //cliente360
                this.nregister_contractor = 0;
                this.nregister_insured = 0;
                this.nregister_contractor_corr = 0;
                this.nregister_contractor_telf = 0;
                this.nregister_contractor_dire = 0;
                this.nregister_insured_dire = 0;
                this.nregister_insured_corr = 0;
                this.nregister_insured_telf = 0;
                
                const client_update = this.validateForUpdateClient();
                

                // if (client_update == true || this.check_input_value != this.check_input_value_360) {
                if (client_update == true) {

                    const response_upd_data_client = await this.updateDataClient360();

                    if (response_upd_data_client.cod_error === 1) {
                        this.isLoading = false;
                        await Swal.fire('Información', response_upd_data_client.message_error, 'error');
                        return;
                    }

                    await this.changeInsuredQuotation();
                }

                // Validacion datos complementarios
                if (this.data_complementary.occupation_status.Id != this.nregister_noccupation) { this.nregister_contractor = 1; };
                if (this.data_complementary.centro_trabajo != this.nregister_scentro_trabajo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
                if (this.data_complementary.cargo != this.nregister_scargo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
                if (this.check_input_nationality != this.nregister_nnatusa) { this.nregister_contractor = 1; };
                if (this.check_input_relationship != this.nregister_nconpargc) { this.nregister_contractor = 1; };
                if (this.check_input_fiscal_obligations != this.nregister_nofistri) { this.nregister_contractor = 1; };
                if (this.check_input_obligated_subject != this.nregister_nobligated_subject) { this.nregister_contractor = 1; }; // VIGP-KAFG 03/04/2025
                if (this.check_input_calidad_socio != this.nregister_calidad_socio) { this.nregister_contractor = 1; } // VIGP-KAFG 09/07/2025
                if(!isEqual(this.list_societarios_cont_original, this.list_societarios_cont)) {this.nregister_contractor = 1; }



                // Actualizacion de datos complementarios
                if (this.nregister_contractor == 1) {
                    // Actualización directa a TBL_PD_COT_PROSPECT
                    // this.data_quotation_complementary_cot_prospect.P_NID_PROSPECT = 0;  // VIGP-KAFG 07/04/2025
                    this.data_quotation_complementary_cot_prospect.P_NID_COTIZACION = this.quotation_id;
                    this.data_quotation_complementary_cot_prospect.P_NTYPE_CLIENT = 1;   // VIGP-KAFG 07/04/2025
                    this.data_quotation_complementary_cot_prospect.P_NOCCUPATION = this.data_complementary.occupation_status.Id;
                    this.data_quotation_complementary_cot_prospect.P_NNATUSA = this.check_input_nationality;
                    this.data_quotation_complementary_cot_prospect.P_NCONPARGC = this.check_input_relationship;
                    this.data_quotation_complementary_cot_prospect.P_NOFISTRI = this.check_input_fiscal_obligations;
                    this.data_quotation_complementary_cot_prospect.P_NOBLIGATED_SUBJECT = this.check_input_obligated_subject; // VIGP-KAFG 02/04/2025
                    this.data_quotation_complementary_cot_prospect.P_NCALIDAD_SOCIO = this.check_input_calidad_socio; // VIGP-KAFG 09/07/2025
                    this.data_quotation_complementary_cot_prospect.P_USER = this.cur_usr.id;
                    this.data_quotation_complementary_cot_prospect.P_SCENTRO_TRABAJO = this.data_complementary.centro_trabajo ?? '';
                    this.data_quotation_complementary_cot_prospect.P_SCARGO = this.data_complementary.cargo ?? '';
                    this.data_quotation_complementary_cot_prospect.P_SOCIETARIOS = this.list_societarios_cont
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ',');
                    //     return societario;
                    // });

                    const resContCompl = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary_cot_prospect).toPromise();
                    if (resContCompl.P_NCODE == 1) {
                        this.isLoading = false;
                        Swal.fire('Información', 'Ha ocurrido un error al actualizar los datos complementarios del contratante.', 'error');
                        return;
                    }   
                }

                // INI VIGP-KAFG 07/04/2025
                if (this.check_input_value == 0) {
                    /*********** ACTUALIZACION DATOS COMPLEMENTARIOS DEL ASEGURADO ************/
                    if (this.data_occuptacion_insu.occupation_status.Id != this.nregister_insu_noccupation) { this.nregister_insured = 1; };
                    if (this.check_input_insu_nationality != this.nregister_insu_nnatusa) { this.nregister_insured = 1; };
                    if (this.check_input_insu_relationship != this.nregister_insu_nconpargc) { this.nregister_insured = 1; };
                    if (this.check_input_insu_fiscal_obligations != this.nregister_insu_nofistri) { this.nregister_insured = 1; };
                    if (this.check_input_insu_obligated_subject != this.nregister_insu_nobligated_subject) { this.nregister_insured = 1; }; // VIGP-KAFG 02/04/2025
                    if (this.check_input_insu_calidad_socio != this.nregister_insu_calidad_socio) { this.nregister_insured = 1; } // VIGP-KAFG 09/07/2025
                    if (this.data_occuptacion_insu.centro_trabajo != this.nregister_insu_scentro_trabajo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
                    if (this.data_occuptacion_insu.cargo != this.nregister_insu_scargo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
                    if (!isEqual(this.list_societarios_insu_original, this.list_societarios_insu)) { this.nregister_insured = 1; }

                    if (this.nregister_insured == 1) {
                        this.data_complementary_insu.P_NID_COTIZACION = this.quotation_id;
                        this.data_complementary_insu.P_NTYPE_CLIENT = 2;
                        this.data_complementary_insu.P_SDOCUMENT_NUMBER = this.data_insured.document_number;
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
                        //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ',');
                        //     return societario;
                        // });

                        const response_upd_data_complementary = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_complementary_insu).toPromise();

                        if (response_upd_data_complementary.P_NCODE == 1) {
                            this.isLoading = false;
                            Swal.fire('Información', 'Ha ocurrido un error al actualizar los datos complementarios del asegurado.', 'error');
                            return;
                        }
                    }
                }
                // FIN VIGP-KAFG 07/04/2025
                // this.validateModalConfirmInsured(next_step); // VALIDACION PARA MOSTRAR CAMBIAR DE ASEGURADO CUANDO EL CONTRATANTE Y EL ASEGURADO SON LO MISMO
                // console.log("client_update: ", client_update)
                // console.log("this.nregister_contractor: ", this.nregister_contractor)
                // console.log("this.nregister_insured: ", this.nregister_insured)
                // console.log("perfil_id: ", this.profile_id)
                // console.log("this.check_input_value: ", this.check_input_value)

                if(client_update || this.nregister_contractor == 1 || (this.check_input_value == 0 && this.nregister_insured == 1)) {
                    // await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 1}).toPromise();
                    // await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 2}).toPromise();
                    this.registrarLocalUpdateCot(1);
                    this.registrarLocalUpdateCot(2);
                    if(["195","192"].includes(this.profile_id) && (this.nregister_contractor == 1 || (this.check_input_value == 0 && this.nregister_insured == 1))) {
                        // await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 3}).toPromise();
                        this.registrarLocalUpdateCot(3);
                    }
                }

                this.current_step = next_step;
            }

            // else if (next_step == 3 && (!["203", "196", "192"].includes(this.profile_id) || (this.profile_id == "192" && this.NID_STATE != 10))) {
            else if (next_step == 3 && (!["203", "196"].includes(this.profile_id))) {

                const msg_validate = this.ValidateInputStep3();

                if (msg_validate.toString().trim() != "") {
                    this.isLoading = false;
                    await Swal.fire('Información', msg_validate, 'error');
                    return;
                }

                this.validaCambiosTab2();

                const myFormData: FormData = new FormData();

                const params = {
                    CodigoProceso: this.quotation.nid_proc,
                    P_NTYPE_PROFILE: this.CONSTANTS.COD_PRODUCTO,
                    P_NUSERCODE: this.cur_usr.id,
                    NumeroCotizacion: this.quotation_id,
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    List_beneficiary: []
                };

                if (this.check_input_value_beneficiary == 0) {
                    if (this.list_benefeciarys.length > 0) {

                        let existeNoHomologado = false;

                        for (let i = 0; i < this.list_benefeciarys.length; i++) {

                            let format_birthday_beneficiary = "null";
                            if (typeof this.list_benefeciarys[i].birthday_date == "object") {
                                format_birthday_beneficiary = this.list_benefeciarys[i].birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.list_benefeciarys[i].birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.list_benefeciarys[i].birthday_date.getFullYear();
                            }
                            // else if (typeof this.list_benefeciarys[i].birthday_date == "string"){
                            //     format_birthday_beneficiary="";
                            // }

                            const tipoDocDesc = this.list_benefeciarys[i].type_document.desc_type_doc; // VIGP-KAFG 28/04/2025
                            let item = {
                                nid_cotizacion: this.quotation_id,
                                nid_proc: this.quotation.nid_proc,
                                // niiddoc_type: this.list_benefeciarys[i].type_document.desc_type_doc,
                                // niddoc_type_beneficiary: this.list_benefeciarys[i].type_document.desc_type_doc,
                                sclient: this.list_benefeciarys[i].sclient,
                                niiddoc_type: tipoDocDesc == "C.E" ? "Carnet de Extranjería" : tipoDocDesc, // VIGP-KAFG 28/04/2025
                                niddoc_type_beneficiary: tipoDocDesc == "C.E" ? "Carnet de Extranjería" : tipoDocDesc, // VIGP-KAFG 28/04/2025
                                siddoc: this.list_benefeciarys[i].siddoc,
                                siddoc_beneficiary: this.list_benefeciarys[i].siddoc,
                                sfirstname: this.list_benefeciarys[i].sfirstname.toUpperCase(),
                                slastname: this.list_benefeciarys[i].slastname.toUpperCase(),
                                slastname2: this.list_benefeciarys[i].slastname2.toUpperCase(),
                                nnationality: this.list_benefeciarys[i].desc_nationality,
                                percen_participation: this.list_benefeciarys[i].percentage_participation,
                                dbirthdat: format_birthday_beneficiary == "null" ? this.list_benefeciarys[i].birthday_date : format_birthday_beneficiary,
                                nusercode: this.cur_usr.id,
                                srole: 'Beneficiario',
                                // scivilsta: this.list_benefeciarys[i].scivilsta, //No esta en el formulario,
                                se_mail: this.list_benefeciarys[i].email.toUpperCase(),
                                sphone_type: "Celular",
                                sphone: this.list_benefeciarys[i].phone,
                                // srelation: this.list_benefeciarys[i].relation?.srelation_name,
                                srelation: this.list_benefeciarys[i].srelation_name,
                                ssexclien: this.list_benefeciarys[i].gender.id,
                            }
                            console.log("item_benefi: ", item)
                            const cod_type_doc = String(item.niiddoc_type == "Carnet de Extranjería" ? 4 : 2).padStart(2, '0');
                            const num_doc = String(item.siddoc).padStart(12, '0');
                            const dataReniec = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, item.sclient);
                            if(dataReniec != 1 && cod_type_doc == '02'){
                                existeNoHomologado = true;
                            }

                            params.List_beneficiary.push(item);
                        }
                        if(existeNoHomologado){
                            params.List_beneficiary = [];
                            this.isLoading = false;
                            await Swal.fire('Información', 'Existen beneficiarios ingresados que no se encuentran homologados.', 'error');
                            return;
                        }
                    } else {
                        params.List_beneficiary = [];
                    }

                }

                myFormData.append('objeto', JSON.stringify(params));

                const date_fund_quotation = new Date(parseInt(this.split_date_date_fund_quotation[2]), parseInt(this.split_date_date_fund_quotation[1]) - 1, parseInt(this.split_date_date_fund_quotation[0])); // Fecha traida de los datos de la cotizacion


                let response_clean_beneficiar = { codError: 0, desError: "" };
                let response_upd_quotation_date_fun = { P_COD_ERR: 0, P_SMENSAJE: "" };

                // UPD FECHA DE ABONO
                if (date_fund_quotation.getTime() !== this.quotation.date_fund.getTime()) {

                    // Valida las fechas habiles
                    const isValida = this.validaFechaHabil();
                    if(isValida == false) {
                        this.isLoading = false;
                        await Swal.fire('Información', 'La fecha de abono no es válida. Solo se permiten días hábiles.', 'warning');
                        return;
                    }

                    const request_upd_date_fund = {
                        NumeroCotizacion: this.quotation_id,
                        P_DDATE_FUND: this.quotation.date_fund.getDate().toString().padStart(2, '0') + '/' + (this.quotation.date_fund.getMonth() + 1).toString().padStart(2, '0') + '/' + this.quotation.date_fund.getFullYear()
                    }

                    response_upd_quotation_date_fun = await this.quotationService.UpdDateFundQuotation(request_upd_date_fund).toPromise();
                    // response_upd_quotation_date_fun = await this.quotationService.UpdDateFundQuotation(request_upd_date_fund).toPromise().then();

                }
                console.log("pasa el flujo..");

                if (response_upd_quotation_date_fun.P_COD_ERR == 1) {
                    this.isLoading = false;
                    await Swal.fire('Información', response_upd_quotation_date_fun.P_SMENSAJE, 'error');
                    return;
                } else {
                    this.quotation.date_fundDescrip = this.quotation.date_fund.getDate().toString().padStart(2, '0') + '/' + (this.quotation.date_fund.getMonth() + 1).toString().padStart(2, '0') + '/' + this.quotation.date_fund.getFullYear();
                }

                if (this.flag_file_cliente != "2") {
                    const response_clean_beneficiar = await this.vidaInversionService.CleanBeneficiar(myFormData).toPromise();
                    console.log("response_clean_beneficiar: ", response_clean_beneficiar)
                    // .then(
                        // async res => {
                        if (response_clean_beneficiar.codError == 0) {
                            // if (res.codError == 0) {
                                console.log('old ', this.list_benefeciarys_original)
                                console.log('new', params.List_beneficiary)
                                if (this.hasListChanged(this.list_benefeciarys_original, params.List_beneficiary)) {
                                    this.registrarLocalUpdateCot(2);
                                    this.registrarLocalUpdateCot(3);
                                    // const data = {
                                    //     P_DOCUMENT_TYPE: 'ALL',
                                    //     P_QUOTATIONID: this.quotation_id,
                                    // };

                                    // this.list_benefeciarys_original = params.List_beneficiary;
                                    // console.log('has changed')
                                    // // await this.quotationService.TriggerDocumentGenerationByType(data).toPromise().then();
                                    // await this.quotationService.TriggerDocumentGenerationByType(data).toPromise();
                                }
                        } else {
                            this.isLoading = false;
                            await Swal.fire('Información', response_clean_beneficiar.desError, 'error');
                            this.isLoading = true;
                        }

                            // return res;
                        // }
                    // );
                }

                if (response_clean_beneficiar.codError == 1) {
                    this.isLoading = false;
                    Swal.fire('Información', response_clean_beneficiar.desError, 'error');
                    return;
                }

                await this.execReGenDocumentsVIGP();

                await this.readFile();
                this.isLoading = true;
                this.current_step = next_step;
            } else {
                console.log("ingresa aqui....")
                this.current_step = next_step;
            }
        }catch(error){
            console.log("error: ",error)
        }finally{
            this.isLoading = false;
        }
    }

    hasListChanged(oldList: Beneficiary[], newList: Beneficiary[]): boolean {
        if (oldList.length !== newList.length) {
            return true;
        }

        const createKey = (item: Beneficiary) =>
            `${item.siddoc_beneficiary}-${item.niddoc_type_beneficiary}`;

        const oldMap = new Map<string, Beneficiary>(
            oldList.map(item => [createKey(item), item])
        );
        console.log(oldMap);
        for (const newItem of newList) {
            const key = createKey(newItem);
            const oldItem = oldMap.get(key);

            if (!oldItem) {
                // New item was added
                return true;
            }

            // Compare the editable fields
            const fieldsToCompare = ['percen_participation', 'sphone', 'se_mail', 'srelation'];

            for (const field of fieldsToCompare) {
                if ((oldItem[field] || '') !== (newItem[field] || '')) {
                    return true;
                }
            }
        }

        return false;
    }

    enableInputs(type: any) { // Cuando el 360 no llama Info

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
            // this.data_contractor.department = { Id: null };
            // this.data_contractor.province = { Id: null };
            // this.data_contractor.district = { Id: null };

            this.data_contractor.type_document_disabled = false;
            this.data_contractor.document_number_disabled = false;
            this.data_contractor.birthday_date_disabled = true;
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


            this.addressService.getDepartmentList().toPromise().then(res => {
                this.list_data_contractor_department = res;
                this.data_contractor.department = { Id: null }
                this.list_data_contractor_province = [];
                this.data_contractor.province = { Id: null }
                this.list_data_contractor_district = [];
                this.data_contractor.district = { Id: null }
            });

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
            // this.data_insured.province = { Id: null };
            // this.data_insured.district = { Id: null };
            // this.data_insured.department = { Id: null };

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

            this.addressService.getDepartmentList().toPromise().then(res => {
                this.list_data_insured_department = res;
                this.data_insured.department = { Id: null }
                this.list_data_insured_province = [];
                this.data_insured.province = { Id: null }
                this.list_data_insured_district = [];
                this.data_insured.district = { Id: null }
                this.data_insured.relation = { COD_ELEMENTO: 0 }
            });

            this.new_client_insured = true; // Indicamos que el cliente va ser nuevo
        }
    }

    validaCambiosTab2() {
        let response = false;
        if(this.check_input_value_beneficiary != this.check_input_value_beneficiary_original) { response = true; }
        console.log("response1: ", response)
        // if(this.check_input_calidad_socio == 0) {
        //     console.log("list_benefeciarys_original: ", this.list_benefeciarys_original)
        //     console.log("list_benefeciarys: ", this.list_benefeciarys)
        //     if(!isEqual(this.list_benefeciarys_original, this.list_benefeciarys)) { response = true; }
        //     console.log("response2: ", response)
        // }

        if(response){
            this.registrarLocalUpdateCot(2);
            this.registrarLocalUpdateCot(3);   
        }

        return response;
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

            if (this.nregister_parentesco.COD_ELEMENTO != this.data_insured.relation.COD_ELEMENTO) { response = true; this.nregister_insured = 1; }; //parentesco
        }

        return response;
    }

    validateForUpdateInsured() {

        let response = false;

        if (this.data_insured.type_document.Id != this.data_insured_360.type_document.Id) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.document_number != this.data_insured_360.document_number) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.birthday_date != this.data_insured_360.birthday_date) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.names != this.data_insured_360.names) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.last_name != this.data_insured_360.last_name) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.last_name2 != this.data_insured_360.last_name2) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.gender.SSEXCLIEN != this.data_insured_360.gender.SSEXCLIEN) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.civil_status.NCIVILSTA != this.data_insured_360.civil_status.NCIVILSTA) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.nationality.NNATIONALITY != this.data_insured_360.nationality.NNATIONALITY) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.phone != this.data_insured_360.phone) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.email != this.data_insured_360.email) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.address != this.data_insured_360.address) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.department.Id != this.data_insured_360.department.Id) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.province.Id != this.data_insured_360.province.Id) { response = true; this.nregister_insured = 1; };

        if (this.data_insured.district.Id != this.data_insured_360.district.Id) { response = true; this.nregister_insured = 1; };

        if (this.nregister_parentesco.COD_ELEMENTO != this.data_insured.relation) { response = true; this.nregister_insured = 1; }; //parentesco

        return response;
    }


    async updateDataClient360() {

        let error_upd_360 = { cod_error: 0, message_error: "" }

        let formatter_data = this.formatter_data_definitive();

        if (this.check_input_value == 1) { // Solo Contratante


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

            let prospect_data = [];
            prospect_data.push(formatter_data.contractor_data);

            const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

            if (response_insert_prospect.P_NCODE == 1) {
                error_upd_360.cod_error = response_insert_prospect.P_NCODE;
                error_upd_360.message_error = response_insert_prospect.P_SMESSAGE;
                return error_upd_360;
            }

            let update_client_360 = this.format_360(1); // Para enviar al 360

            const response_upd_client = await this.clientInformationService.getCliente360(update_client_360).toPromise();

            // Validacion para actualizar la ubicacion del Contratante
            if (
                (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
            ) { }
            else if(this.nregister_contractor_dire == 1){

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

                const response_ins_contractor_direction = await this.vidaInversionService.saveDirection(contractor_ubication).toPromise();

                if (![0, 2].includes(response_ins_contractor_direction.P_NCODE)) {
                    error_upd_360.cod_error = 1;
                    error_upd_360.message_error = response_ins_contractor_direction.P_SMESSAGE;
                    return error_upd_360;
                }
            }

            if (response_upd_client.P_NCODE == 1) {
                error_upd_360.cod_error = response_upd_client.P_NCODE;
                error_upd_360.message_error = response_upd_client.P_SMESSAGE;
                return error_upd_360;
            } else if (response_upd_client.P_NCODE == 0){
                this.data_contractor_360 = { ...this.data_contractor };
            }
        }

        // Contratante y Asegurado
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

                const response_upd_client_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();


                prospect_data[1].P_SCLIENT = response_upd_client_insured.P_SCOD_CLIENT.toString().trim();
                this.data_insured.sclient = response_upd_client_insured.P_SCOD_CLIENT.toString().trim();

                if (
                    (this.data_insured.address == "" || this.data_insured.address == null) &&
                    (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                    (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                    (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                ) { }
                else if(this.nregister_insured_dire == 1){
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

                    // Cod 2 No se enviaron datos nuevos para actualizar , 0 no existe errores
                    if (![0, 2].includes(response_save_direction_insured.P_NCODE)) {
                        error_upd_360.cod_error = response_save_direction_insured.P_NCODE;
                        error_upd_360.message_error = response_save_direction_insured.P_SMESSAGE;
                        return error_upd_360;
                    }
                }

                if (response_upd_client_insured.P_NCODE == 1) {
                    error_upd_360.cod_error = response_upd_client_insured.P_NCODE;
                    error_upd_360.message_error = response_upd_client_insured.P_SMESSAGE;
                    return error_upd_360;
                } else if (response_upd_client_insured.P_NCODE == 0){
                    this.data_insured_360 = { ...this.data_insured };
                }

                const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                if (response_insert_prospect.P_NCODE == 1) {
                    error_upd_360.cod_error = response_insert_prospect.P_NCODE;
                    error_upd_360.message_error = response_insert_prospect.P_SMESSAGE;
                    return error_upd_360;
                }
            }

            else {

                const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                if (response_insert_prospect.P_NCODE == 1) {
                    error_upd_360.cod_error = response_insert_prospect.P_NCODE;
                    error_upd_360.message_error = response_insert_prospect.P_SMESSAGE;
                    return error_upd_360;
                }

                let update_client_360_contractor = this.format_360(1); // Para enviar al 360 Contratante
                let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado

                // Contratante
                const response_update_client_360_contractor = await this.clientInformationService.getCliente360(update_client_360_contractor).toPromise();

                if (response_update_client_360_contractor.P_NCODE == 1) {
                    error_upd_360.cod_error = response_update_client_360_contractor.P_NCODE;
                    error_upd_360.message_error = response_update_client_360_contractor.P_SMESSAGE;
                    return error_upd_360;
                }else if (response_update_client_360_contractor.P_NCODE == 0){
                    this.data_contractor_360 = { ...this.data_contractor };
                }

                if (
                    (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                    (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                    (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                    (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                ) { }
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
                        error_upd_360.cod_error = response_save_direction_contractor.P_NCODE;
                        error_upd_360.message_error = response_save_direction_contractor.P_SMESSAGE;
                        return error_upd_360;
                    }
                }

                // Asegurado
                const response_upd_client_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();

                if (response_upd_client_insured.P_NCODE == 1) {
                    error_upd_360.cod_error = response_upd_client_insured.P_NCODE;
                    error_upd_360.message_error = response_upd_client_insured.P_SMESSAGE;
                    return error_upd_360;
                }else if (response_upd_client_insured.P_NCODE == 0){
                    this.data_insured_360 = { ...this.data_insured };
                }

                if (
                    (this.data_insured.address == "" || this.data_insured.address == null) &&
                    (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                    (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                    (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                ) { }
                else if(this.nregister_insured_dire == 1){
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

                    // Cod 2 No se enviaron datos nuevos para actualizar
                    if (![0, 2].includes(response_save_direction_insured.P_NCODE)) {
                        error_upd_360.cod_error = response_save_direction_insured.P_NCODE;
                        error_upd_360.message_error = response_save_direction_insured.P_SMESSAGE;
                        return error_upd_360;
                    }
                }
            }
        }
        return error_upd_360;
    }

    formatter_data_definitive() {

        const contractor_data = {
            P_NCHANNEL: "1",
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_SCLIENT: this.data_contractor.sclient,
            P_NTYPE_DOCUMENT: this.data_contractor.type_document.Id,
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_SNAMES: this.data_contractor.names,
            P_SLASTNAME: this.data_contractor.last_name,
            P_SLASTNAME2: this.data_contractor.last_name2,
            P_DDATEBIRTHDAY: this.data_contractor.birthday_date,
            P_NID_SEX: this.data_contractor.gender.SSEXCLIEN,
            P_NID_NATION: this.data_contractor.nationality.NNATIONALITY,
            P_SCELLPHONE: this.data_contractor.phone,
            P_SEMAIL: this.data_contractor.email,
            P_SADDRESS: this.data_contractor.address,
            P_NID_DPTO: this.data_contractor.department.Id,
            P_NID_PROV: this.data_contractor.province.Id,
            P_NID_DIST: this.data_contractor.district.Id,
            P_NID_ASCON: this.check_input_value, // 1 Si , 0 NO
            P_NTYPE_CLIENT: 1,
            P_USER: this.cur_usr.id,
            P_SUSERNAME: this.cur_usr.username,
            P_REG_CONTRACTOR: this.nregister_contractor,
            P_REG_INSURED: this.nregister_insured
        };

        const insured_data = {
            P_NCHANNEL: "1000",
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
            P_NTYPE_CLIENT: 2,
            P_REG_CONTRACTOR: this.nregister_contractor,
            P_REG_INSURED: this.nregister_insured,
            P_SRELATION: this.data_insured.relation.COD_ELEMENTO
        };

        let format_data = { contractor_data, insured_data };

        return format_data;
    }


    // search_type 1 para Contratante 2 Para Contratatne y Asegurado
    format_360(search_type) {

        let formatter_data_360 = {};

        if (search_type == 1) {

            // let split_date = this.data_contractor.birthday_date.split('/');
            // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;

            const format_birthday = this.data_contractor.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_contractor.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_contractor.birthday_date.getFullYear();

            formatter_data_360 = {
                EListContactClient: [],
                EListCIIUClient: [],
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


    formatter_insert_360(search_type) {

        // search_type 1 para Contratante 2 Para Contratatne y Asegurado
        let formatter_data_360;

        if (search_type == 1) {

            const format_birthday = this.data_contractor.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_contractor.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_contractor.birthday_date.getFullYear();

            // Agrergar la Valdiacion que cuando se hace click en el Departamente busvcar si [items] esta vacio y si lo esta que llame el servicio
            formatter_data_360 = {
                EListContactClient: [],
                EListCIIUClient: [],
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

            if (this.data_contractor.phone !== "") {
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

            if (this.data_contractor.email !== "") {
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

            if (this.data_insured.phone !== "") {
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

            if (this.data_insured.email !== "") {
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

    // 1
    derivadoAJefe = async () => {

        const response_change_to_definitive = await this.changeToDefinitive();

        if (response_change_to_definitive.P_NCODE == 1) {
            Swal.fire('Información', response_change_to_definitive.P_SMESSAGE, 'error');
            return;
        }

        const response_upd = await this.InsUpdCotiStatesVIGP(1);

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(1, 'Se derivó al jefe correctamente.');

    }

    // 2
    observadoPorJefe = async () => {

        const response_upd = await this.InsUpdCotiStatesVIGP(29); // observada

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(2, 'Se registró la observación y se envió al supervisor.');
    }

    // 3
    derivadoASoporte = () => {
        this.InsCommentsCotiVIGP(3, 'Se derivó a soporte correctamente.');
    }

    // 4
    observadoPorSoporteAJefe = async () => {

        const response_upd = await this.InsUpdCotiStatesVIGP(29); // observada

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(4, 'Se registró la observación y se envió al jefe.');
    }

    // 5
    observadoPorSoporteASupervisor = async () => {

        const response_upd = await this.InsUpdCotiStatesVIGP(29); // observada

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(5, 'Se registró la observación y se envió al supervisor.');
    }

    // 6
    derivadoACoordinador = () => {
        this.InsCommentsCotiVIGP(6, 'Se derivó al coordinador correctamente.');
    }

    // 7
    aprobadoPorCoordinador = () => {
        this.InsCommentsCotiVIGP(7, 'Se aprobó correctamente.');
    }

    // 8
    rechazadoPorCoordinador = async () => {

        const response_upd = await this.InsUpdCotiStatesVIGP(3); // rechazado

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(8, 'Se rechazó correctamente.');
    }

    // 9
    derivadoAGerente = () => {
        this.InsCommentsCotiVIGP(9, 'Se derivó al gerente correctamente.');
    }

    // 10
    aprobadoPorGerente = () => {
        this.InsCommentsCotiVIGP(10, 'Se aprobó correctamente.');
    }

    // 11
    rechazadoPorGerente = async () => {

        const response_upd = await this.InsUpdCotiStatesVIGP(3); // rechazado

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        this.InsCommentsCotiVIGP(11, 'Se rechazó correctamente.');
    }

    //DVP 02-04-2025
    derivadoAFirmas = async () => {

        console.log("is_second_to_last_day: ", this.is_second_to_last_day)
        console.log("file_list: ", this.filesList)

        // add voucher de pago (pago total y banco)
        if (!this.payment_status || this.bank_selected?.Id_entidad == 0) {
            Swal.fire('Información', 'Se debe ingresar el banco destino y seleccionar la casilla "Pago Total".', 'error');
            return;
        }
        // add voucher de pago (pago total y banco)

        let existDocSeguro = false;
        let existDocFileCli = false;

        this.filesList.forEach(doc => {
            if(doc.P_DESCRI == "solicitud_del_seguro" && doc.P_STATUS == 1){
                existDocSeguro = true;
            }
            if(doc.P_DESCRI == "file_del_cliente" && doc.P_STATUS == 1){
                existDocFileCli = true;
            }
        });

        if(!(existDocFileCli || existDocSeguro)){
            Swal.fire('Información', 'Los documentos aún no están disponibles, por favor refresque la página.', 'error');
            return;
        }

        const isChangeSign = [30,28].includes(this.quotation.quoteState) && this.quotation.nintentos_cambio_firma == 1;
        const response_upd = await this.InsUpdCotiStatesVIGP(28, this.request_validate_days, isChangeSign);

        if (response_upd.cod_error == 1) {
            Swal.fire('Información', response_upd.smessage, 'error');
            return;
        }

        // Flujo antepenultimo dia
        if (this.is_second_to_last_day == 1) {
            Swal.fire({
                title: 'Confirmación',
                text: "¿Firmar sólo Solicitud de Seguro?",
                icon: 'warning',
                confirmButtonText: 'SI',
                cancelButtonText: 'NO',
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(async (result) => {

                if (result.isConfirmed) {
                    this.flag_file_cliente = "1";

                    await this.InsCommentsCotiVIGP(12, 'Se derivó a firmas para solicitud de seguro.', "1");

                    this.previusStep(3);
                    this.NID_STATE = 12;
                    this.refreshStatesCoti();
                    this.readFile();
                } else {
                    await this.InsCommentsCotiVIGP(12, 'Se derivó a firmas para file completo.', null);

                    this.previusStep(3);
                    this.NID_STATE = 12;
                    this.refreshStatesCoti();
                    this.readFile();
                }
            });
        } else {
            // Flujo normal (no antepenúltimo día)
            await this.InsCommentsCotiVIGP(12, 'Se derivó a firmas correctamente.', null);
            this.NID_STATE = 12;
            // Redireccionar a la vista de firmas
            this.previusStep(3);
            this.refreshStatesCoti();
            this.readFile();
        }
    }


    setStateQuotationReferSignatures = async () => {


        if (this.flag_file_cliente == "2") {
            // colocar file completo en TBL_PD_COTIZA_STATES_VIGP.FLAG_FILE_CLIENTE
            this.flag_file_cliente = "3";
            const response_upd = await this.InsUpdCotiStatesVIGP(30, this.request_validate_days, false, false);
            if (response_upd.cod_error == 1) { return; }
            // await this.InsCommentsCotiVIGP(14, null, this.flag_file_cliente, false);
        }
        else if (this.is_second_to_last_day == 1) {

            const response_upd = await this.InsUpdCotiStatesVIGP(28, this.request_validate_days, false, false); // ESTE METODO LO MAS PROBABLE ES QUE SE INVOQUE CUANDO SE SELECCIONAE FIRMAS MANUAL O MANUSCIRTA
            if (response_upd.cod_error == 1) { return; }

            //this.flag_file_cliente = "1";
            if (this.flag_file_cliente === "1") {
                const signatureData = {
                    P_NID_COTIZACION: this.quotation_id,
                    P_NSTATE_SIGN: 1,
                    P_USER: this.cur_usr.id
                };

                await this.quotationService.UpdateSignatureStatus(signatureData).toPromise(); //DVP VIGP 10-03-2025
                await this.InsCommentsCotiVIGP(12, null, this.flag_file_cliente,false);
            }
        }
        else {

            const response_upd = await this.InsUpdCotiStatesVIGP(28, this.request_validate_days, false, false); // ESTE METODO LO MAS PROBABLE ES QUE SE INVOQUE CUANDO SE SELECCIONAE FIRMAS MANUAL O MANUSCIRTA
            if (response_upd.cod_error == 1) { return; }
            await this.InsCommentsCotiVIGP(12, null, null, false);
        }
    }

    derivadoAOperaciones = () => {
        console.log(this.flag_file_cliente);

        if (this.is_passing_second_to_last_day == 1) {

            this.InsCommentsCotiVIGP(14, 'Las emisiones se encuentran suspendidas, se derivará a operaciones el primer día hábil del próximo mes.', this.flag_file_cliente);
        }
        else if (this.flag_file_cliente == "1") { // cuando se suibio 1 archivo del File y se deriva a Operaciones
            this.InsCommentsCotiVIGP(14, 'Se derivó a Operaciones correctamente. <br>Se tiene <b>2 días hábiles</b> para enviar firmado los documentos faltantes.', "2");
        } else {
            this.InsCommentsCotiVIGP(14, 'Se derivó a operaciones correctamente.');
        }
    }

    openFileModal() {
        let modalRef: NgbModalRef;

        console.log(this.flag_file_cliente);
        let obj;

        if (this.flag_file_cliente == "1") {
            obj = {
                P_NID_COTIZACION: this.quotation_id,
                P_DESCRI: "solicitud_del_seguro_firmado",
                P_NAME: "SOLICITUD DEL SEGURO FIRMADO",
                P_FLAG: 9,
                P_IS_ONLY_REQUEST: true,
                P_SIGNATURE_TYPE: 1,
                P_USER: this.cur_usr.id,
                P_SDOCUMENT:this.data_contractor.document_number, //VIGP-485
                P_SCLIENT:this.data_contractor.sclient //VIGP-485
            };
        }
        else {
            obj = {
                P_NID_COTIZACION: this.quotation_id,
                P_DESCRI: "file_del_cliente_firmado",
                P_NAME: "FILE DEL CLIENTE FIRMADO",
                P_FLAG: 7,
                P_IS_ONLY_REQUEST: false,
                P_SIGNATURE_TYPE: 1,
                P_USER: this.cur_usr.id,
                P_SDOCUMENT:this.data_contractor.document_number, //VIGP-485
                P_SCLIENT:this.data_contractor.sclient //VIGP-485
            };
        }

        modalRef = this.modalService.open(AddFileComponent, { 
            size: 'md',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.result.then(
            async (result) => {
                await this.setStateQuotationReferSignatures();  
                await this.quotationService.UpdateSignatureType({ P_NID_COTIZACION: this.quotation_id, P_NSIGNATURE_TYPE: 1 }).toPromise();
                await this.readFile(true)
                console.log(this.flag_file_cliente);
                if (this.flag_file_cliente == "2") {
                    // UPDATE CAB ESTADO A FIRMA COMPLETAS
                    const signatureData = {
                        P_NID_COTIZACION: this.quotation_id,
                        P_NSTATE_SIGN: 2, // Completo
                        P_USER: this.cur_usr.id
                    };

                    this.quotationService.UpdateSignatureStatus(signatureData).toPromise()
                        .then(() => {
                            // INGRESAR UN NUEVO REGISTRO DE COMENTARIO, PERO OBTENIENDO CIERTA INFO DEL ANTERIOR REGISTRO Y ESTA VEZ CAMBIAR AL FLAG COMPLETO OSEA ESTADO 3
                            // Validar si está listo para emitir
                            const validarData = {
                                P_NID_COTIZACION: this.quotation_id
                            };

                            this.quotationService.ValidarListoParaEmitir(validarData).toPromise()
                                .then(result => {
                                    if (result.RESULTADO) {
                                        // Si la validación es exitosa, mostrar mensaje
                                        Swal.fire({
                                            title: 'Información',
                                            text: 'La cotización cumple con los requisitos y ha sido marcada como LISTA PARA EMITIR',
                                            icon: 'success',
                                            confirmButtonText: 'Aceptar'
                                        }).then(() => {
                                            this.readFile();
                                        });
                                    } else {
                                        console.log("La cotización aún no cumple todos los requisitos para emitir");
                                    }
                                    // this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                })
                                .catch(error => {
                                    console.error("Error al validar si está listo para emitir: ", error);
                                });
                        })
                        .catch(error => {
                            console.error("Error al actualizar estado de firma: ", error);
                        });
                }
                else if (this.flag_file_cliente == "3") { // A la hora de subir el File Completo

                    Swal.fire({
                        title: 'Información',
                        text: 'Se cargó correctamente el file de cliente completo.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                    });

                }
            },
            (reason) => {
                console.log('Modal dismissed:', reason);
            }
        );

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.obj = obj;
        modalRef.componentInstance.reference.readFile = () => this.readFile(true);
        modalRef.componentInstance.reference.previusStep = () => this.previusStep(3);
    }

    refreshStatesCoti = async () => {
        const get_data_coti = { P_QUOTATIONNUMBER: this.quotation_id };
        const data_coti_pre = await this.quotationService.GetCotizacionPre(get_data_coti).toPromise();

        if (data_coti_pre.P_COD_ERROR == 1) {
            this.isLoading = false;
            Swal.fire('Información', 'Ocurrió un problema al obtener los datos de la cotización preliminar.', 'error');
            return;
        }
        this.quotation.deriv_firmas = data_coti_pre.P_DDERIV_FIRMAS;
        this.quotation.quoteState = data_coti_pre.P_NSTATE;
        this.quotation.nintentos_cambio_firma = data_coti_pre.NINTENTOS_CAMBIO_FIRMA; // VIGP-KAFG 19/08/2025
        this.quotation.ninsdoc_changsign = data_coti_pre.NINSDOC_CHANGSIGN; // VIGP-KAFG 20/08/2025
        this.quotation.nderivfirm_changsign = data_coti_pre.P_NDERIVFIRM_CHANGSIGN; // VIGP-KAFG 26/08/2025
        this.quotation.nsignature_type = data_coti_pre.NSIGNATURE_TYPE; // VIGP-KAFG 26/08/2025
    }

    InsUpdCotiStatesVIGP = async (state_cot, deriv_firmas = null, isChangSign = false, should_validate_coments = true ) => {

        const func_respnse = {
            cod_error: 0,
            smessage: ""
        };

        if (this.coments.length == 0 && should_validate_coments == true) {

            func_respnse.cod_error = 1;
            func_respnse.smessage = 'Debe ingresar un comentario.';
        } else {
            let item = {
                P_NID_COTIZACION: this.quotation_id,
                P_SSTATREGT_COT: state_cot,
                P_NUSERCODE: this.cur_usr.id,
                P_DDERIV_FIRMAS: deriv_firmas,
                P_ISCHANGSIGN: isChangSign ? 1 : 0, // VIGP-KAFG 21/08/2025
            }
            await this.quotationService.InsUpdCotiStatesVIGP(item).toPromise().then(
                res => {
                    if (res.P_NCODE == 1) {
                        func_respnse.cod_error = res.P_NCODE;
                        func_respnse.smessage = res.P_MESSAGE;
                    }
                },

            );
        }

        return func_respnse;
    }

    InsCommentsCotiVIGP = async (state, mess = null, flag_file_cliente = null, should_validate_coments = true) => {
        console.log(flag_file_cliente);
        console.log(this.coments);
        if (this.coments.length == 0 && should_validate_coments == true) {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
            return;
        }
        else {

            this.coments.forEach(async (coment_item) => {
                let item = {
                    P_NID_COTIZACION: this.quotation_id,
                    P_NID_STATE_DER: state,
                    P_SCOMMENT: coment_item?.coment,
                    P_NUSERCODE: this.cur_usr.id,
                    P_NFLAG_COTIZACION: 1,
                    P_FLAG_FILE_CLIENTE: flag_file_cliente,
                }
                await this.quotationService.InsCommentsCotiVIGP(item).toPromise().then(
                    res => {
                        if (res.P_NCODE == 0) {
                            this.comentario = null;
                            this.coments = [];
                            this.GetCommentsCotiVIGP();
                        } else {
                            Swal.fire('Información', res.P_MESSAGE, 'error');
                            return;
                        }
                    }
                );
            })

            if (mess != null) { // Si no es nulo mostrará un mensaje modal
                Swal.fire(
                    {
                        title: 'Información',
                        // text: mess,
                        html: mess,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: false
                    }
                ).then(
                    (result) => {
                        if (result.value && state != 12) {
                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                        }
                    }
                );
            }
        }
    }

    GetCommentsCotiVIGP = async () => {
        await this.quotationService.GetCommentsCotiVIGP({ P_NID_COTIZACION: this.quotation_id, P_NID_PROC: this.quotation.nid_proc }).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.comentarios = res.C_TABLE;

                    for (const item of this.comentarios) {

                        if (item.FLAG_FILE_CLIENTE) {
                            console.log(item);
                            // if (item.FLAG_FILE_CLIENTE && this.flag_file_cliente) {
                            //     if (parseInt(item.FLAG_FILE_CLIENT) > parseInt(this.flag_file_cliente)) {
                            //         this.flag_file_cliente = item.FLAG_FILE_CLIENT;
                            //     }
                            // } else {
                            //     this.flag_file_cliente = item.FLAG_FILE_CLIENTE.toString()
                            // }

                            this.flag_file_cliente = item.FLAG_FILE_CLIENTE;
                            break;
                        }

                    }
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
            }
        );

    }

    OnQualification(qualification: { qualification: string; typeClient: number }) {
        if (qualification.typeClient == 1) {
            this.cont_high = qualification.qualification == 'Alto' || qualification.qualification == 'Muy Alto';
            this.cont_low = qualification.qualification == 'Bajo' || qualification.qualification == 'Muy Bajo';
            this.cont_medium = qualification.qualification == 'Medio';
            this.is_cont_score_completed = true;
        } else {
            this.insu_high = qualification.qualification == 'Alto' || qualification.qualification == 'Muy Alto';
            this.insu_low = qualification.qualification == 'Bajo' || qualification.qualification == 'Muy Bajo';
            this.insu_medium = qualification.qualification == 'Medio';
            this.is_insu_score_completed = true;
        }

        this.DerivarAFirmasOGerente();
    }

    DerivarAFirmasOGerente = (): void => {
        if (this.check_input_value == 1) {
            this.showGerenteBtn = (this.cont_medium || this.cont_high) && this.NID_STATE == 3 ? true : false;
            this.isScoreLow = this.cont_low;
        } else if (this.check_input_value == 0) {
            if (!this.is_cont_score_completed || !this.is_insu_score_completed) return;
            this.showGerenteBtn = ((this.insu_medium || this.cont_medium) || (this.insu_high || this.cont_high)) && this.NID_STATE == 3 ? true : false;
            this.isScoreLow = (this.cont_low && this.insu_low) && this.NID_STATE == 3;
        }

    }

    cancelar = () => {
        Swal.fire(
            {
                title: '¿Estás seguro de salir de la cotización',
                text: 'Los datos ingresados previamente permanecerán guardados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }
        ).then(
            (result) => {
                if (result.value) {
                    this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                }
            }
        )
    }

    getNidStateAndDefState() {
        this.quotationService.GetNidStateAndDefState(this.quotation_id).toPromise().then(
            res => {
                this.NID_STATE = res.P_NID_STATE; // Estado de derivaciones
                this.DEF_STATE = res.P_DEF_STATE;
            }
        )
    }


    firmaElectronica = async () => {
        this.isLoading = true;
        
        try{
            await this.setStateQuotationReferSignatures();

            if (this.is_passing_second_to_last_day == 1) {
                const res = await this.quotationService.InsFirmaElectronicaVIGP({ P_NID_COT: this.quotation_id, P_IS_BOSS: this.bossBool }).toPromise()
                // .then(
                    // res => {
                        if (res.P_NCODE == 0) {
                            this.isLoading = false;
                            const confirm = await Swal.fire({
                                title: 'Información',
                                html: 'Se derivó a firma electrónica.<br> Las emisiones se encuentran suspendidas, se derivará a operaciones el primer día hábil del próximo mes.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                            })
                            this.isLoading = true;
                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                            this.quotationService.UpdateSignatureType({ P_NID_COTIZACION: this.quotation_id, P_NSIGNATURE_TYPE: 2 }).subscribe();

                            //  verificación de listo para emitir
                            if (this.flag_file_cliente == "1" || this.flag_file_cliente == "2") {
                                const validarData = {
                                    P_NID_COTIZACION: this.quotation_id
                                };

                                this.quotationService.ValidarListoParaEmitir(validarData).toPromise()
                                    .then(result => {
                                        console.log("Resultado de validación listo para emitir:", result);
                                    })
                                    .catch(error => {
                                        console.error("Error al validar si está listo para emitir: ", error);
                                    });
                            }
                        } else {
                            Swal.fire('Información', res.P_SMESSAGE, 'error');
                        }
                //     },
                //     err => {
                //         Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                //     }
                // )
            } else {
                const res = await this.quotationService.InsFirmaElectronicaVIGP({ P_NID_COT: this.quotation_id, P_IS_BOSS: this.bossBool }).toPromise()
                // .then(
                //     res => {
                        if (res.P_NCODE == 0) {
                            this.isLoading = false;
                            const confirm = await Swal.fire('Información', 'Se envió para firmar.', 'success');
                            this.isLoading = true;
                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                            this.quotationService.UpdateSignatureType({ P_NID_COTIZACION: this.quotation_id, P_NSIGNATURE_TYPE: 2 }).subscribe();

                            //  verificación de listo para emitir
                            const validarData = {
                                P_NID_COTIZACION: this.quotation_id
                            };

                            this.quotationService.ValidarListoParaEmitir(validarData).toPromise()
                                .then(result => {
                                    console.log("Resultado de validación listo para emitir:", result);
                                })
                                .catch(error => {
                                    console.error("Error al validar si está listo para emitir: ", error);
                                });
                        } else {
                            Swal.fire('Información', res.P_SMESSAGE, 'error');
                        }
                //     },
                //     err => {
                //         Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                //     }
                // )
            }
        }catch(ex){
            console.error("Error en la captura de excepción:", ex);
        }finally{
            this.isLoading = false;
        }

    }

    coment = () => {
        if (this.comentario.trim() == null || this.comentario.trim() == '') {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        } else {
            let item = { coment: this.comentario };
            this.coments.push(item);
            this.comentario = '';
        }
    }

    derBoss = (e) => {
        this.bossBool = e ? 1 : 0;
    }


    async changeInsuredQuotation() {

        const request = {

            flagCalcular: this.CONSTANTS.PERFIL.TECNICA == JSON.parse(localStorage.getItem('currentUser'))['profileId'] ? 1 : 0,
            codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id'],
            desUsuario: JSON.parse(localStorage.getItem('currentUser'))['username'],
            // codCanal: this.cotizacion.brokers[0].COD_CANAL,
            contratante: this.data_contractor.sclient,
            codRamo: this.CONSTANTS.RAMO,
            codProducto: this.CONSTANTS.COD_PRODUCTO,
            codTipoPerfil: this.CONSTANTS.COD_PRODUCTO,
            codProceso: this.quotation.nid_proc,
            PolizaMatriz: 0,
            type_mov: "1", // Emision
            nroCotizacion: this.quotation_id,
            MontoPlanilla: 0,
            CantidadTrabajadores: 1,
            flagSubirTrama: 1, //Valor para saber si se va enviar Trama o no al Back
            premium: 0,
            datosContratante: {
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
                // fechaNacimiento: "05/12/1972",
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
                // fechaNacimiento: "05/12/1972",
                nacionalidad: this.data_contractor.nationality.NNATIONALITY,
                email: this.data_contractor.email,
                sexo: this.data_contractor.gender.SSEXCLIEN,
                desTelefono: "Celular",
                telefono: this.data_contractor.phone,
                rol: "1"
            },
            datosPoliza: {
                branch: this.CONSTANTS.RAMO,
            }
        }

        this.quotationService.ChangeInsuredPd(request).toPromise();
    }

    disabledFileClientIncompleteInputs() {

        if (this.profile_id == "192" && this.flag_file_cliente == "2") {
            this.data_contractor = {
                ...this.data_contractor,
                type_document_disabled: true,
                document_number_disabled: true,
                birthday_date_disabled: true,
                names_disabled: true,
                last_name_disabled: true,
                last_name2_disabled: true,
                gender_disabled: true,
                civil_status_disabled: true,
                nationality_disabled: true,
                department_disabled: true,
                province_disabled: true,
                district_disabled: true,
                phone_disabled: true,
                email_disabled: true,
                address_disabled: true,
            };
            this.data_insured = {
                ...this.data_insured,
                type_document_disabled: true,
                document_number_disabled: true,
                birthday_date_disabled: true,
                names_disabled: true,
                last_name_disabled: true,
                last_name2_disabled: true,
                gender_disabled: true,
                civil_status_disabled: true,
                nationality_disabled: true,
                department_disabled: true,
                province_disabled: true,
                district_disabled: true,
                phone_disabled: true,
                email_disabled: true,
                address_disabled: true,
                relation_disabled: true,
            };
            this.status_contractor_disabled = true;
            this.data_complementary.occupation_status_disabled = true;
            this.data_complementary.centro_trabajo_disabled = true; // VIGP-KAFG 08/07/2025
            this.data_complementary.cargo_disabled = true; // VIGP-KAFG 08/07/2025
            this.check_input_nationality_disabled = true;
            //this.check_input_relationship_disabled = true;
            this.check_input_fiscal_obligations_disabled = true;
            this.quotation.date_fund_disabled = false;
            this.check_input_value_beneficiary_disabled = true;
            this.perfilamiento.question1_disabled = true;
            this.perfilamiento.question2_disabled = true;
            this.perfilamiento.question3_disabled = true;
            this.perfilamiento.question4_disabled = true;
            this.perfilamiento.question5_disabled = true;
            this.actions = true;
        }

        this.check_input_relationship_disabled = true; // Se esta deshabilitando para todo la cot definitiva 28022025
        this.check_input_insu_relationship_disabled = true;

    }

    async getInsuredData360(res_prospect_quotation: any) {

        if (this.check_input_value == 0) {

            this.data_insured.type_document = { Id: res_prospect_quotation.TYPE_DOC_INSURED };
            this.data_insured.document_number = res_prospect_quotation.DOC_INSURED;
            this.data_insured.relation = { COD_ELEMENTO: res_prospect_quotation.SRELATION };
            this.nregister_parentesco = this.data_insured.relation;

            const params_360 = {
                P_TipOper: 'CON',
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                P_NIDDOC_TYPE: res_prospect_quotation.TYPE_DOC_INSURED,
                P_SIDDOC: res_prospect_quotation.DOC_INSURED,
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
                                if (res.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2) {
                                    this.data_insured.document_number = "";
                                    this.data_insured.type_document = { Id: 0 };
                                    // this.clearData(2);

                                    this.isLoading = false;
                                    Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error')
                                        .then((result) => {
                                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                        });
                                } else {
                                    await this.cargarDatosInsured(res);
                                    if (params_360.P_NIDDOC_TYPE == 2) {
                                        this.data_insured.nationality_disabled = true;
                                        this.data_insured.civil_status_disabled = true;
                                    }
                                    this.invokeServiceExperia(2);
                                    await this.getOriginPep(2);
                                    // this.getWorldCheck(2);
                                    this.getDataIdeconClient(2); // TEMP 070082025
                                    await this.ConsultDataComplementary(2); // VIGP-KAFG 04/04/2025
                                    await this.getDataRegNegativoClient(2); /*VIGP 17112025*/
                                    this.data_insured_360 = { ...this.data_insured }; // Almacenando la Info de Inicio del 360 para el Asegurado en una Variable para validar si se tiene que actualizar data de la persona.
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
    }

    validateModalConfirmInsured(next_step: any) {

        if (this.check_input_value == 0) {

            /* VIGP - DGC - 12/02/2024 - INICIO */
            if (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == 'SÍ' || this.world_check_contractor.pep == 'SÍ' || this.check_input_relationship == 1) {
                this.current_step = next_step;
            }
            else {
                this.current_step = 2;   //3
            }
            /* VIGP - DGC - 12/02/2024 - FIN */

        }
        else if (this.check_input_value == 1) {
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

                        /* VIGP - DGC - 12/02/2024 - INICIO */
                        if (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == 'SÍ' || this.world_check_contractor.pep == 'SÍ' || this.check_input_relationship == 1) {
                            this.current_step = next_step;
                        }
                        else {
                            this.current_step = 2;
                        }
                        /* VIGP - DGC - 12/02/2024 - FIN */
                    }
                    else {
                        this.check_input_value = 0;
                        this.show_guide = true;
                        setTimeout(() => {
                            this.show_guide = false;
                        }, 5000);
                    }
                }
            )
        }
    }

    // Cambio de estado de la cot a definitiva y genera File del Cliente
    async changeToDefinitive() {

        let response = { P_NCODE: 0, P_SMESSAGE: "" };

        const request_documentos = {
            P_NID_COTIZACION: this.quotation_id,
            P_NUSERCODE: this.cur_usr.id
        };

        response = await this.quotationService.InsUpdCotiStatesVIGPDoc(request_documentos).toPromise();
        return response;
    }

    // Gerentes despues de Scoring
    disabledInputsforManager() {

        this.data_contractor = {
            ...this.data_contractor,
            type_document_disabled: true,
            document_number_disabled: true,
            birthday_date_disabled: true,
            names_disabled: true,
            last_name_disabled: true,
            last_name2_disabled: true,
            gender_disabled: true,
            civil_status_disabled: true,
            nationality_disabled: true,
            department_disabled: true,
            province_disabled: true,
            district_disabled: true,
            // phone_disabled: true,
            phone_disabled: false,
            // email_disabled: true,
            email_disabled: false,
            // address_disabled: true,
            address_disabled: false,
        };
        this.data_insured = {
            ...this.data_insured,
            type_document_disabled: true,
            document_number_disabled: true,
            birthday_date_disabled: true,
            names_disabled: true,
            last_name_disabled: true,
            last_name2_disabled: true,
            gender_disabled: true,
            civil_status_disabled: true,
            nationality_disabled: true,
            department_disabled: true,
            province_disabled: true,
            district_disabled: true,
            // phone_disabled: true,
            phone_disabled: false,
            // email_disabled: true,
            email_disabled: false,
            // address_disabled: true,
            address_disabled: false,
            relation_disabled: true,
        };
        this.status_contractor_disabled = true;
        this.data_complementary.occupation_status_disabled = true;
        // this.data_complementary.centro_trabajo_disabled = true;// VIGP-KAFG 08/07/2025
        // this.data_complementary.cargo_disabled = true;// VIGP-KAFG 08/07/2025
        this.data_complementary.centro_trabajo_disabled = false;// VIGP-KAFG 08/07/2025
        this.data_complementary.cargo_disabled = false;// VIGP-KAFG 08/07/2025

        this.check_input_nationality_disabled = true;
        this.check_input_relationship_disabled = true;
        this.check_input_fiscal_obligations_disabled = true;
        this.check_input_obligated_subject_disabled = true; // VIGP-KAFG 03/04/2025
        // this.check_input_calidad_socio_disabled = true;
        this.check_input_calidad_socio_disabled = false;
        // this.quotation.date_fund_disabled = true;
        this.quotation.date_fund_disabled = false;
        // this.check_input_value_beneficiary_disabled = true;
        this.check_input_value_beneficiary_disabled = false;
        this.perfilamiento.question1_disabled = true;
        this.perfilamiento.question2_disabled = true;
        this.perfilamiento.question3_disabled = true;
        this.perfilamiento.question4_disabled = true;
        this.perfilamiento.question5_disabled = true;
        // this.dissabled_btn_modal_add_benef = true;
        this.dissabled_btn_modal_add_benef = false;
        // this.actions = false;
        this.actions = true;
        this.dissabled_btn_modal_detail_origin = true;
        // this.dissabled_btn_modal_detail_origin = false;

        // INI VIGP-KAFG 07/04/2025
        this.data_occuptacion_insu.occupation_status_disabled = true;
        // this.data_occuptacion_insu.centro_trabajo_disabled = true; // VIGP-KAFG 08/07/2025
        // this.data_occuptacion_insu.cargo_disabled = true;// VIGP-KAFG 08/07/2025
        this.data_occuptacion_insu.centro_trabajo_disabled = false; // VIGP-KAFG 08/07/2025
        this.data_occuptacion_insu.cargo_disabled = false;// VIGP-KAFG 08/07/2025
        this.check_input_insu_nationality_disabled = true;
        this.check_input_insu_relationship_disabled = true;
        this.check_input_insu_fiscal_obligations_disabled = true;
        this.check_input_insu_obligated_subject_disabled = true;
        // this.check_input_insu_calidad_socio_disabled = true;
        this.check_input_insu_calidad_socio_disabled = false;
        // this.isViewModalSocietarios = true;
        this.isViewModalSocietarios = false;
        // INI VIGP-KAFG 07/04/2025
    }

    async getStatusPaymentVoucher() {

        const request = { P_NID_COTIZACION: this.quotation_id, P_NIDPROD: this.quotation.nid_proc };

        this.vidaInversionService.getStatusPaymentQuotationVigp(request).toPromise().then((res) => {
            this.bank_selected = { Id_entidad: res.Bank_payment_id };
            this.payment_status = res.Status_total_payment == 1 ? true : false;
        });
    }

    openModalVoucher() {

        let modalRefVourcher: NgbModalRef;

        modalRefVourcher = this.modalService.open(VoucherComponent, { backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false, centered: true });
        modalRefVourcher.componentInstance.reference = modalRefVourcher;
        modalRefVourcher.componentInstance.reference.nid_cotizacion = this.quotation_id;
        modalRefVourcher.componentInstance.reference.nid_proc = this.quotation.nid_proc;
        modalRefVourcher.componentInstance.reference.bank_selected = this.bank_selected;
        modalRefVourcher.componentInstance.reference.payment_status = this.payment_status;
        modalRefVourcher.componentInstance.reference.disabled_inputs_voucher_component = this.disabled_inputs_voucher_component;

        modalRefVourcher.result.then(async (res) => { await this.getStatusPaymentVoucher(); })
    }


    validateDeleteFile(item) {

        // if (item.P_DESCRI == 'voucher_de_pago' && this.NID_STATE == 12 Y 14) {
        if (item.P_DESCRI == "voucher_de_pago" && (this.profile_id == 196 || [12, 14].includes(this.NID_STATE)) ) {
            this.disabled_inputs_voucher_component = true;
            return false;
        }
        // if (this.profile_id != 203 && this.profile_id != 196 && ((item.P_FLAG == 2 || item.P_FLAG == 4 || item.P_FLAG == 7 || item.P_FLAG == 9) && item.P_STATUS == 1) || item.P_FLAG == 5) {
        if ((![203, 196].includes(this.profile_id)) && (([2, 4, 7, 9].includes(item.P_FLAG)) && item.P_STATUS == 1) || item.P_FLAG == 5) {
            return true;
        }
        return false;
    }
}

