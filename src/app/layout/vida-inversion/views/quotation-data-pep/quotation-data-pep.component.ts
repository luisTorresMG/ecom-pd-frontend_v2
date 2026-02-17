import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddPepComponent } from '../../components/add-pep/add-pep.component';
import { AddWorkComponent } from '../../components/add-work/add-work.component';
import { AddFamilyComponent } from '../../components/add-family/add-family.component';

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
import { QuotationDocumentsComponent } from '../../components/quotation-documents/quotation-documents.component';
import moment from 'moment';
import { AddSocietarioComponent } from '../../components/add-societario/add-societario.component';
import { OthersService } from '../../../broker/services/shared/others.service';

@Component({
    templateUrl: './quotation-data-pep.component.html',
    styleUrls: ['./quotation-data-pep.component.scss']
})


export class QuotationDataPepComponent implements OnInit {

    quotation_id: number = 0;
    profile_id: any;
    coments: any[] = [];
    timer_file: any;
    loading: Boolean = false;

    quotation: any = {
        moneda: '',
        fondo: '',
        contribution: '',
        date_fund: new Date(),
        nid_proc: "",
        periodo: '',
        monedaDesc: '',
        date_fundDesc: '',
        contributionDesc: 0,
        date_fund_disabled: false
    };

    sclient: string = '0';
    prospect_id: any;

    showCoordinadorBtn: boolean = false;
    showGerenteBtn: boolean = false;

    showScoreBtn: boolean = true;
    randomItem: string = '';

    comentarios: any[];
    comentario: string;

    CONSTANTS: any = VidaInversionConstants;
    isLoading: boolean = false;
    dissabled_btn_modal_detail_origin: boolean = false;


    boolNumberCTR: boolean = false;
    boolNumberASG: boolean = false;
    boolEmailCTR: boolean = false;
    boolEmailASG: boolean = false;

    @Input() check_input_value;
    @Input() check_input_value_beneficiary = 1;
    @Input() check_input_nationality;
    @Input() check_input_relationship;
    @Input() check_input_fiscal_obligations;
    @Input() check_input_obligated_subject;     // VIGP-KAFG 02/04/2025
    @Input() check_input_calidad_socio; // VIGP-KAFG 09/07/2025

    @Input() check_input_insu_nationality;  //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_relationship; //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_fiscal_obligations;  //VIGP-KAFG 03/04/2025
    @Input() check_input_insu_obligated_subject;     // VIGP-KAFG 02/04/2025
    @Input() check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025

    cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    NID_STATE: number;
    DEF_STATE: number;
    pdfFile = '';
    investment: any = [];
    error_msg = "";
    error_upd_360 = "0";
    contractor_province_department: any = false;
    contractor_province_selected: any = false;
    insured_province_department: any = false;
    insured_province_selected: any = false;

    value_familiar_pep: any = 0;
    value_trabajos_pep: any = 0;
    value_inmuebles_pep: any = 0;
    value_parientes_pep: any = 0;
    value_personas_pep: any = 0;
    value_declaracion_pep: any = 0;
    pepBool: Boolean = false;
    type_rol: any;
    step_list: any;
    now_date: any;
    pep_data: any // ALMACENA LOS DATOS PEP
    check_input_value_360: any; //Valor si el Contratante === Asegurado o no que es traido de BD
    parse_amount: any;
    show_guide: boolean = false;
    new_client_insured = false; // Indica si es cliente Ya se encuentra registrado en el 360 o no
    recomendacion: any = "";
    current_step: number;
    cur_usr: any;

    CURRENCY: any;
    TIME: any = [];
    APORT: any;
    NATIONALITY: any;
    FONDO: any;

    list_files: any = [];
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
    list_societarios_cont: any = []; // VIGP-KAFG 10/07/2025
    list_societarios_insu: any = []; // VIGP-KAFG 10/07/2025
    list_document_type_contractor: any = [];
    steps_list: any;

    isViewModalSocietarios:boolean = false;

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

    // INI VIGP-KAFG 04/04/2025
    data_occuptacion_insu: any = {
        occupation_status: 0,
        occupation_status_disabled: false,
        centro_trabajo: '',// VIGP-KAFG 08/07/2025
        cargo: '',// VIGP-KAFG 08/07/2025
        texto_obligated_subject: '',// VIGP-KAFG 08/07/2025
        centro_trabajo_disabled: false, // VIGP-KAFG 08/07/2025
        cargo_disabled: false, // VIGP-KAFG 08/07/2025
    }
    // FIN VIGP-KAFG 04/04/2025

    data_quotation_complementary: any = {
        // P_NID_PROSPECT: 0,  // VIGP-KAFG 07/04/2025
        P_NID_COTIZACION: 0,  // VIGP-KAFG 02/04/2025
        P_NTYPE_CLIENT: 0,  // VIGP-KAFG 04/04/2025
        P_SDOCUMENT_NUMBER: '',  // VIGP-KAFG 04/04/2025
        P_NOCCUPATION: 0,
        P_NNATUSA: 3,
        P_NOBLIGATED_SUBJECT: 3, // VIGP-KAFG 02/04/2025
        P_NCONPARGC: 3,
        P_NOFISTRI: 3,
        P_USER: 0,
        P_SCENTRO_TRABAJO: '',// VIGP-KAFG 08/07/2025
        P_SCARGO: '',// VIGP-KAFG 08/07/2025
        P_NCALIDAD_SOCIO: 3, // VIGP-KAFG 09/07/2025
        P_SOCIETARIOS:[] // VIGP-KAFG 09/07/2025
    }

    // INI VIGP-KAFG 03/04/2025
    data_complementary_insu: any = {
        P_NID_COTIZACION: 0,   // VIGP-KAFG 07/04/2025
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
        P_SOCIETARIOS:[] // VIGP-KAFG 09/07/2025
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

    check_input_nationality_disabled = false;
    check_input_relationship_disabled = false;
    check_input_fiscal_obligations_disabled = false;
    check_input_value_beneficiary_disabled = false;
    check_input_obligated_subject_disabled = false; //VIGP-KAFG 02/04/2025
    check_input_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025

    // INI VIGP-KAFG 03/04/2025
    check_input_insu_nationality_disabled = false;
    check_input_insu_relationship_disabled = false;
    check_input_insu_fiscal_obligations_disabled = false;
    check_input_insu_obligated_subject_disabled = false;
    check_input_insu_calidad_socio_disabled = false; // VIGP-KAFG 09/07/2025
    // INI VIGP-KAFG 03/04/2025

    registerDatapet = true;
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
    firmaManuscrita = false;
    userComment: string;
    dateComment: string;

    homologacionCont: string = "——";  // VIGP-KAFG 16/04/2025 
    homologacionInsu: string = "——";  // VIGP-KAFG 16/04/2025 

    riesgo_negativo_insu: string = "——";  // VIGP-KAFG 26092025
    riesgo_negativo_cont: string = "——";  // VIGP-KAFG 26092025

    FL_DATA_QUALITY: boolean = false; // VIGP-KAFG 17/09/2025

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
        private othersService: OthersService
    ) {
        pdfDefaultOptions.assetsFolder = 'bleeding-edge';
    }

    async ngOnInit() {

        this.isLoading = true;

        this.FL_DATA_QUALITY = await this.CONSTANTS.getIsActiveDataQuality(this.vidaInversionService);

        this.quotation_id = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);
        this.sclient = this.activatedRoute.snapshot.params["cliente"];
        this.prospect_id = this.activatedRoute.snapshot.params["prospecto"];

        this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 
        this.homologacionInsu = "——";  // VIGP-KAFG 16/04/2025 

        this.step_list = [
            {
                step_index: 1,
                tittle: "Datos del Contratante/Asegurado"
            },
            {
                step_index: 2,
                tittle: "Nueva Cotización"
            }
        ];
        this.getNidStateAndDefState();


        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.userComment = this.cur_usr.firstName + ' ' + this.cur_usr.lastName;
        this.dateComment = moment(new Date()).format('DD/MM/YYYY hh:mm:ss a').toUpperCase();

        this.timer_file = false;

        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);

        if (this.profile_id == 203 || this.profile_id == 196) {
            this.data_contractor = {
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
            this.data_complementary.occupation_status_disabled = true;
            this.data_complementary.centro_trabajo_disabled = true; // VIGP-KAFG 08/07/2025
            this.data_complementary.cargo_disabled = true; // VIGP-KAFG 08/07/2025
            this.check_input_nationality_disabled = true;
            this.check_input_obligated_subject_disabled = true; // VIGP-KAFG 02/04/2025 
            this.check_input_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025

            this.check_input_relationship_disabled = true;
            this.check_input_fiscal_obligations_disabled = true;
            this.quotation.date_fund_disabled = true;
            this.check_input_value_beneficiary_disabled = true;
            this.perfilamiento.question1_disabled = true;
            this.perfilamiento.question2_disabled = true;
            this.perfilamiento.question3_disabled = true;
            this.perfilamiento.question4_disabled = true;
            this.perfilamiento.question5_disabled = true;

            // INI VIGP-KAFG 02/04/2025
            this.data_occuptacion_insu.occupation_status_disabled = true;
            this.data_occuptacion_insu.centro_trabajo_disabled = true;
            this.data_occuptacion_insu.cargo_disabled = true;
            this.check_input_insu_nationality_disabled = true;
            this.check_input_insu_relationship_disabled = true;
            this.check_input_insu_fiscal_obligations_disabled = true;
            this.check_input_insu_obligated_subject_disabled = true;
            this.check_input_insu_calidad_socio_disabled = true; // VIGP-KAFG 09/07/2025

            this.isViewModalSocietarios = true;
            // INI VIGP-KAFG 02/04/2025
        }

        this.GetStatusModalPep();
        this.GetCommentsCotiVIGP();
        this.readFile();

        this.type_rol = '0';
        this.check_input_value = 1;
        this.current_step = 1;
        this.now_date = new Date();

        // FOR Contractor
        // Se les esta agregando un await para poder Controlarlo
        this.list_document_type_contractor = await this.clientInformationService.getDocumentTypeList(this.cod_prod_channel).toPromise()

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

        await this.vidaInversionService.searchByProspectQuotation(request_search_prospect).toPromise().then(async res_prospect_quotation => {

            this.data_contractor.type_document = { Id: res_prospect_quotation.TYPE_DOC_CONTRACTOR }
            this.data_contractor.document_number = res_prospect_quotation.DOC_CONTRACTOR;
            this.check_input_value = parseInt(res_prospect_quotation.NID_ASCON);

            const params_360 = {
                P_TIPOPER: 'CON',
                P_NUSERCODE: this.cur_usr.id,
                P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                P_SIDDOC: this.data_contractor.document_number,
            };

            await this.clientInformationService.getCliente360(params_360).toPromise().then(async res => {
                if (res.P_NCODE == "0") {
                    if (res.EListClient[0].P_SCLIENT == null) {
                    }
                    else {
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
                                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                        });
                                } else {
                                    await this.getDataContractor(res);
                                    if(params_360.P_NIDDOC_TYPE == 2) {
                                        this.data_contractor.nationality_disabled = true;
                                        this.data_contractor.civil_status_disabled = true;
                                    }
                                    await this.invokeServiceExperia(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                                    // await this.getWorldCheck(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                                    await this.getIdecon(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                                    // await this.consultProspect(1);
                                    await this.getInsuredData360(res_prospect_quotation);  // Llamando la data del Asegurado
                                    await this.ConsultDataComplementary(1);
                                    await this.getDataRegNegativoClient(1); /*VIGP 17112025 */
                                    await this.getOriginPep(1);
                                    // await this.getOriginPep(2);
                                    this.data_contractor_360 = { ...this.data_contractor }; // Almacenando la Info de Inicio del 360 para el Contratante en una Variable para validacino si cambio alguna info
                                }
                            }
                        }
                    }

                }
                else if (res.P_NCODE === "2" || res.P_NCODE === "1" || res.P_NCODE === "3") {
                    this.clearData(1);
                    this.isLoading = false;
                    Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
                }
            }, error => {
                this.isLoading = false;
                Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
            }
            )
        })

        // this.TIME = [
        //     { codigo: "1", valor: '7 AÑOS' },
        //     { codigo: "2", valor: '8 AÑOS' },
        // ];

        this.list_files = [
            {   // 01
                desc: "SOLICITUD DEL SEGURO",
                value: "solicitud_del_seguro",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 02
                desc: "COTIZACIÓN OFICIAL DE FIRMA",
                value: "cotizacion_oficial_de_firma",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 03
                desc: "INFORMACIÓN COMPLEMENTARIA",
                value: "informacion_complementaria",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 04
                desc: "CONSTANCIA DE PAGO",
                value: "constancia_de_pago",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 05
                desc: "FORMATO PEP",
                value: "formato_pep",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 06
                desc: "DECLARACIÓN JURADA DE ANTECEDENTES",
                value: "declaracion_jurada_de_antecedentes",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 07
                desc: "DECLARACIÓN DE FONDOS",
                value: "declaracion_de_fondos",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 08
                desc: "INFORME PEP",
                value: "informe_pep",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 09
                desc: "DOCUMENTOS DE SUSTENTO DE ORIGEN DE FONDOS",
                value: "documentos_de_sustento_de_origen_de_fondos",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 10
                desc: "CRONOGRAMA DE PAGOS",
                value: "cronograma_de_pagos",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 11
                desc: "CUADRO DE RESCATE",
                value: "cuadro_de_rescate",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 12
                desc: "DECLARACIÓN JURADA DEL PERFIL INVERSIONISTA",
                value: "declaracion_jurada_del_perfil_inversionista",
                type: "ARCHIVO PDF",
                flag: 2
            },
            {   // 13
                desc: "DNI DEL CLIENTE",
                value: "dni_del_cliente",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 14
                desc: "DNI DE BENEFICIARIOS MENORES DE EDAD",
                value: "dni_de_beneficiarios_menores_de_edad",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 15
                desc: "VOUCHER DE PAGO",
                value: "voucher_de_pago",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 16
                desc: "FICHA RENIEC ASEGURAD / CONTRATANTE",
                value: "ficha_reniec_asegurado_contratante",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 17
                desc: "FICHA RENIEC BENEFICIARIOS",
                value: "ficha_reniec_beneficiarios",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 18
                desc: "REPORTE EXPERIAN, WC, IDECON",
                value: "reporte_experian",
                type: "ARCHIVO PDF",
                flag: 1
            },
            {   // 0
                desc: "OTROS",
                value: "otros",
                type: "ARCHIVO PDF",
                flag: 0
            }
        ];


        const get_data_coti = { P_QUOTATIONNUMBER: this.quotation_id };

        const response_geccotizacion_pre = await this.quotationService.GetCotizacionPre(get_data_coti).toPromise();

        if (response_geccotizacion_pre.P_COD_ERROR == 1) {
            this.quotation.date_fund = new Date();
            this.quotation.contribution = "";
            this.quotation.fondo = "";
            this.quotation.moneda = "";
            this.quotation.periodo = "";
            this.quotation.monedaDesc = "";
            this.quotation.date_fundDesc = "";
        }

        else {

            this.getCurrency(response_geccotizacion_pre.NCURRENCY);

            this.parse_amount = CommonMethods.formatNUMBER(response_geccotizacion_pre.P_CONTRIBUTION);
            this.quotation.contribution = this.parse_amount;
            this.quotation.contributionDesc = response_geccotizacion_pre.P_CONTRIBUTION;
            this.quotation.date_fundDesc = response_geccotizacion_pre.P_DDATE_FUND;
            this.quotation.periodo = response_geccotizacion_pre.P_NSAVING_TIME;

            if (this.quotation.contribution.toUpperCase() == "NAN") {
                this.quotation.contribution = '';
            }

            this.quotation.fondo = { NFUNDS: response_geccotizacion_pre.P_NFUNDS };
            this.quotation.moneda = { NCODIGINT: response_geccotizacion_pre.P_NCURRENCY };

            let split_date_date_fund = response_geccotizacion_pre.P_DDATE_FUND.split('/');
            this.quotation.date_fund = new Date(parseInt(split_date_date_fund[2]), parseInt(split_date_date_fund[1]) - 1, parseInt(split_date_date_fund[0]));

            this.quotation.nid_proc = response_geccotizacion_pre.CodigoProceso;

            this.list_benefeciarys = response_geccotizacion_pre.List_beneficiary.map(element => {
                return {
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
                    last_name2: element.slastname2.toUpperCase(),
                    birthday_date: element.dbirthdat,
                    gender: { id: element.ssexclien },
                    relation: { NCODIGO: element.srelation },
                    email: element.se_mail,
                    phone: element.sphone,
                    assignment: element.percen_participation,
                };
            })

            if (this.list_benefeciarys.length > 0) {
                this.check_input_value_beneficiary = 0;
            }

            this.currentPage = 1;
            this.totalItems = this.list_benefeciarys.length;
            this.listToShow_benefeciarys = this.list_benefeciarys.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );
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

                this.origin_fund_saving_percent = sum_origin_detail;
                this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);
            }
        }

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
                    await Swal.fire('Información', 'Ocurrió un problema al consultar el registro negativo', 'error');
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
                        } else {
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
                        await Swal.fire('Información', 'Ocurrió un problema al consultar el registro negativo', 'error');
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

    // Origen pep arjg
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

    getCurrency = (item) => {
        this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).subscribe(
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

    //this.check_input_fiscal_obligations=0;

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

        /* INI Validacion Datos Complementarios */
        if (this.data_complementary.occupation_status.codigo == "") {
            this.error_msg += 'Ocupacion no seleccionado.<br>';
        }

        if([3,4,8].includes(this.data_complementary.occupation_status.Id)) {
            if(this.data_complementary.centro_trabajo == null || this.data_complementary.centro_trabajo == "") {
                this.error_msg += 'Debe completar el campo "Centro de Trabajo" para el contratante.<br>';
            }

            if(this.data_complementary.cargo == null || this.data_complementary.cargo == "") {
                this.error_msg += 'Debe completar el campo "Cargo" para el contratante.<br>';
            }
        }

        if ((this.check_input_nationality != 0) && (this.check_input_nationality != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        if ((this.check_input_relationship != 0) && (this.check_input_relationship != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        if ((this.check_input_fiscal_obligations != 0) && (this.check_input_fiscal_obligations != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        // INI VIGP-KAFG 04/04/2025
        if ((this.check_input_obligated_subject != 0) && (this.check_input_obligated_subject != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }
        // FIN VIGP-KAFG 04/04/2025

        if ((this.check_input_calidad_socio != 0) && (this.check_input_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
            this.error_msg += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el contratante.<br>';
        } else {
            if(this.check_input_calidad_socio == 1 && this.list_societarios_cont.length == 0){
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

        // INI VIGP-KAFG 04/04/2025
        /****** VALIDA DATOS COMPLEMENTARIOS DEL ASEGURADO *******/
        if (this.data_occuptacion_insu.occupation_status.codigo == "") {
            this.error_msg += 'Ocupacion del asegurado no seleccionado.<br>';
        }

        if([3,4,8].includes(this.data_occuptacion_insu.occupation_status.Id)) {
            if(this.data_occuptacion_insu.centro_trabajo == null || this.data_occuptacion_insu.centro_trabajo == "") {
                this.error_msg += 'Debe completar el campo "Centro de Trabajo" para el asegurado.<br>';
            }

            if(this.data_occuptacion_insu.cargo == null || this.data_occuptacion_insu.cargo == "") {
                this.error_msg += 'Debe completar el campo "Cargo" para el asegurado.<br>';
            }
        }

        if ((this.check_input_insu_nationality != 0) && (this.check_input_insu_nationality != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        if ((this.check_input_insu_relationship != 0) && (this.check_input_insu_relationship != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        if ((this.check_input_insu_fiscal_obligations != 0) && (this.check_input_insu_fiscal_obligations != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }

        if ((this.check_input_insu_obligated_subject != 0) && (this.check_input_insu_obligated_subject != 1)) {
            this.error_msg += 'Se debe completar todos los campos para continuar<br>';
        }
        // FIN VIGP-KAFG 04/04/2025

        if ((this.check_input_insu_calidad_socio != 0) && (this.check_input_insu_calidad_socio != 1)) { // VIGP-KAFG 09/07/2025
            this.error_msg += 'Debe completar la pregunta "¿Cuenta con calidad de socio, accionista, asociado o título equivalente y/o administrador de personas jurídicas o entes jurídicos donde un PEP tenga el 25 % o más del capital social, aporte o participación?" para el asegurado.<br>';
        } else {
            if(this.check_input_insu_calidad_socio == 1 && this.list_societarios_insu.length == 0){
                this.error_msg += 'Debe registrar al menos un societario para el asegurado. <br>'
            }
        }

        return this.error_msg;
    }


    ValidateInputStep3() {

        let error_msg = "";
        if (((Number(this.origin_fund_saving_percent) + Number(this.origin_fund_spp_percent)) == 100) || ((Number(this.origin_fund_saving_percent) + Number(this.origin_fund_spp_percent) == 100.00))) { }
        else { error_msg = 'Debe completar todas las preguntas.'; }

        if (this.check_input_value_beneficiary == 0) {

            // let sum_asing = this.list_benefeciarys.reduce((acc, current) => { return acc + parseFloat(current.percentage_participation).toFixed(2) });
            let sum_asing = this.list_benefeciarys.reduce((acc, current) => {
                let parse_percentage = parseFloat(current.percentage_participation);
                let a = parse_percentage.toFixed(2);
                let b = parseFloat(a);
                return acc + b;
            }, 0);

            if ((sum_asing == 100) || (sum_asing == 100.00)) { }
            else { error_msg = 'Debe completar todas las preguntas.'; }
        }
        return error_msg;
    }

    ValidateInputStep4() {

        let error_msg = "";
        // if (this.perfilamiento.question1 && this.perfilamiento.question2 && this.perfilamiento.question3 && this.perfilamiento.question4 && this.perfilamiento.question5) {

        if ((this.perfilamiento.question1 == "") || (this.perfilamiento.question2 == "") || (this.perfilamiento.question3 == "") || (this.perfilamiento.question4 == "") || (this.perfilamiento.question5 == "")) {
            error_msg = 'Debe completar todas las preguntas.';
        }
        return error_msg;
    }

    previusStep(value) {
        if (value == 2) {

            /* VIGP - DGC - 12/02/2024 - INICIO */
            if (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == 'SÍ' || this.world_check_contractor.pep == 'SÍ' || this.check_input_relationship == 1) {
                this.current_step = value;
            }
            else {
                this.current_step = 1;
            }
            /* VIGP - DGC - 12/02/2024 - FIN */
        }
        else {
            this.current_step = value;
        }
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

    OpenModalBeneficiary(type, item) {

        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(AddBeneficiaryComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.list_benefeciary = this.list_benefeciarys;
        modalRef.componentInstance.reference.type = type;
        modalRef.componentInstance.reference.item = item;
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
                        slastname2: res.slastname2,
                        srelation_name: res.relation.text,
                        percentage_participation: res.assignment,
                        type_doc: res.type_document.Id,
                        type_document: { desc_type_doc: res.type_document.Name },
                        desc_nationality: res.nationality.SDESCRIPT,
                        relation: { GLS_ELEMENTO: res.relation.SDESCRIPT, NCODIGO: res.relation.COD_ELEMENTO },
                        desc_type_doc: res.type_document.Id == 2 ? 'DNI' : "CE",
                    };

                    // AQUI SE DEBE COMPROBAR QUE EL TIPO Y NUMERO DE DOCUEMNTO SEA LOS MISMOS, SI SON LOS MISMO VA REEMPLAZAR LA DATA CON EL NUEVO ELEMENTO EDITADO, SI NO SE ENCUENTRA UNO IGUAL LO VA INSERTAR COMO NUEV
                    if (type == 'edit') {

                        const new_list_benefeciary = this.list_benefeciarys.map((element) => {

                            if ((element.type_doc == new_item.type_doc) && (element.siddoc == new_item.document_number)) { return new_item; }
                            else { return element; }
                        });
                        this.list_benefeciarys = new_list_benefeciary;
                    }
                    else {
                        this.list_benefeciarys.push(new_item);// Aqui se esta insertando
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
    }


    openAddPepModal = () => {
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
                this.GetStatusModalPep();
            }
        );
    }

    openAddWorkPepModal = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddWorkComponent, {
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
                this.GetStatusModalPep();
            }
        );
    }

    openAddFamilyPepModal = () => {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddFamilyComponent, {
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
                this.GetStatusModalPep();
            }
        );
    }

    openPropertyModal = () => {
        //debugger
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
                this.GetStatusModalPep();
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
                this.GetStatusModalPep();
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
                this.GetStatusModalPep();
            }
        );
    }


    async OpenModalDetailOrigin(type = '') {
        let modalRef: NgbModalRef;

        if (type == "edit" && this.dissabled_btn_modal_detail_origin == false) { }

        else {
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

            await modalRef.result.then((res) => { response_origin_detail_modal = res });

            if ((!response_origin_detail_modal.cancel) || (response_origin_detail_modal.cancel != "true")) { this.showPercentage(response_origin_detail_modal); }

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

            this.origin_fund_saving_percent = sum_origin_detail;
            this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);
        }
    };

    deleteDetailOrigin() {

        if (this.dissabled_btn_modal_detail_origin == false) { }
        else {
            this.vidaInversionService.DeleteOriginDetail(this.quotation_id).toPromise().then(
                res => {
                    if (res.ErrorCode == 0) {

                        this.origin_fund_saving_percent = 0;
                        this.origin_fund_spp_percent = 0;
                        this.dissabled_btn_modal_detail_origin = false;

                        Swal.fire('Información', "Se eliminó la información correctamente.", 'success');
                    } else {
                        Swal.fire('Información', "Ocurrió un problema al realizar la solicitud.", 'error');
                    }
                },
                error => {
                    Swal.fire('Información', "Ocurrió un problema al realizar la solicitud.", 'error');
                }
            );
        }
    }

    toUpper(event: KeyboardEvent): void {
        const inputElement = event.target as HTMLInputElement;
        inputElement.value = inputElement.value.toUpperCase();
    }

    readFile = () => {
        let obj = {
            P_NID_COTIZACION: this.quotation_id
        };
        this.vidaInversionService.ReadDocumentsVIGP(obj).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    // this.filesList = res.P_DOCUMENTS.filter(x => x.P_FLAG != 1);
                    this.filesList = res.P_DOCUMENTS;
                }
            },
            error => {
                Swal.fire('Información', "Ha ocurrido un error al obtener los archivos.", 'error');
            }
        );
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

    deleteFile = (item, i) => {
        if (item.P_FLAG == 5) {
            let _temp = this.filesList.splice(i, 1);
            let temp = this.filesList.filter(x => x !== _temp);
            this.filesList = temp;
        } else {
            Swal.fire(
                {
                    title: '¿Está seguro de eliminar el archivo?',
                    text: 'Esta acción es irreversible.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                }
            ).then(
                (result) => {
                    if (result.value) {
                        let obj = {
                            P_NID_COTIZACION: this.quotation_id,
                            P_DESCRI: item.P_DESCRI,
                            P_NAME: item.P_NAME,
                            P_FLAG: item.P_FLAG
                        };
                        this.vidaInversionService.DeleteDocumentsVIGP(obj).subscribe(
                            res => {
                                if (res.P_NCODE == 0) {
                                    Swal.fire('Información', "Se eliminó el archivo correctamente.", 'success');
                                    this.readFile();
                                } else {
                                    Swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            },
                            error => {
                                Swal.fire('Información', "Ha ocurrido un error al eliminar el archivo.", 'error');
                            }
                        );
                    }
                    else if (result.dismiss === Swal.DismissReason.cancel) {
                        this.modalService.dismissAll();
                    }
                }
            )
        }
    }

    importFile = (event, item) => {
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

            this.vidaInversionService.SaveDocumentsVIGP(myFormData).subscribe(
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

    deleteBenefeciary(item_benefeciary) {

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
                        //this.data_contractor.document_number = null;
                        Swal.fire('Información', 'El documento ingresado se encuentra registrado como asegurado, cambiar la opción a SI en caso el contratante y asegurado sean el mismo.', 'warning');
                        return;
                    } else {
                        //this.data_insured.document_number = null;
                        Swal.fire('Información', 'El documento ingresado se encuentra registrado como contratante, cambiar la opción a SI en caso el contratante y asegurado sean el mismo.', 'warning');
                        return;
                    }
                }
            }
        }

        this.clickBuscar(search_type);
    }


    searchValidate(search_type) { // 1 Contratante 2 Asegurado

        const validate_res = { cod_error: "0", message: "" };

        if (search_type == 1) {

            if (this.data_contractor.type_document.Id == 2) {
                

                if (this.data_contractor.document_number.length == 7) {
                    console.log(this.data_contractor.document_number);
                    this.data_contractor.document_number = this.data_contractor.document_number.padStart(8, "0");
                    console.log(this.data_contractor.document_number);
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

    async getIdecon(client_type: number) {
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
        } else {
            insured_data_client.P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, insured_data_client.P_SCLIENT);
            this.homologacionInsu = insured_data_client.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        }


        // let split_date = insured_data_client.P_DBIRTHDAT.split('/');
        // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;
        if (insured_data_client.P_DBIRTHDAT == null) {
            console.log("Fecha Nula");
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
    
    resolveLabelBtnSocietario(type: number): string {
        if (type == 1) return `${this.isViewModalSocietarios?"":"Agregar "}Societarios(${this.list_societarios_cont.length})`;
        else if (type == 2) return `${this.isViewModalSocietarios?"":"Agregar "}Societarios(${this.list_societarios_insu.length})`;
        return '';
    }

    viewBtnAddSocietario(type: number): boolean {
        if(type == 1) return this.check_input_calidad_socio == 1;
        else if(type == 2) return this.check_input_insu_calidad_socio == 1;
        return false;
    }
    
    openModalAddSocietario(type: number){
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
                        this.list_societarios_cont = res.list_societarios;
                    }else if( type == 2) {
                        this.list_societarios_insu = res.list_societarios;
                    }
                }
                
            }
        )
    }

    async ConsultDataComplementary(search_type) {
        let params_cons = {
            P_NID_COTIZACION: this.quotation_id,  // VIGP-KAFG 02/04/2025
            P_NTYPE_CLIENT: search_type,  // VIGP-KAFG 04/04/2025
            P_SNUMBER_DOCUMENT: search_type == 1 ? this.data_contractor.document_number : this.data_insured.document_number,  // VIGP-KAFG 04/04/2025
        };
        await this.vidaInversionService.ConsultDataComplementary(params_cons).toPromise().then(
            async res => {

                if (search_type == 1) { // VIGP-KAFG 04/04/2025
                    this.check_input_nationality = res.P_NNATUSA;
                    this.check_input_relationship = res.P_NCONPARGC;
                    this.check_input_fiscal_obligations = res.P_NOFISTRI;
                    this.check_input_obligated_subject = res.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
                    this.check_input_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                    this.data_complementary.occupation_status = { Id: res.P_NOCCUPATION }
                    this.data_complementary.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "":res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_complementary.cargo = res.P_SCARGO == 'null' ? "":res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_cont = res.P_SOCIETARIOS
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                    //     return societario;
                    // });

                    this.nregister_nnatusa = res.P_NNATUSA;
                    this.nregister_nconpargc = res.P_NCONPARGC;
                    this.nregister_nofistri = res.P_NOFISTRI;
                    this.nregister_noccupation = res.P_NOCCUPATION
                    this.nregister_scentro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "":res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.nregister_scargo = res.P_SCARGO == 'null' ? "":res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.nregister_nobligated_subject = res.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
                    this.nregister_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025

                    console.log("comple: ", this.data_complementary)

                    // INI VIGP-KAFG 04/04/2025
                } else {

                    this.check_input_insu_relationship = res.P_NCONPARGC;
                    this.check_input_insu_nationality = res.P_NNATUSA;
                    this.check_input_insu_fiscal_obligations = res.P_NOFISTRI;
                    this.check_input_insu_obligated_subject = res.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
                    this.check_input_insu_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                    this.data_occuptacion_insu.occupation_status = { Id: res.P_NOCCUPATION }
                    this.data_occuptacion_insu.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "":res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_occuptacion_insu.cargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_insu = res.P_SOCIETARIOS
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                    //     return societario;
                    // });

                    this.nregister_insu_nnatusa = res.P_NNATUSA;
                    this.nregister_insu_nconpargc = res.P_NCONPARGC;
                    this.nregister_insu_nofistri = res.P_NOFISTRI;
                    this.nregister_insu_noccupation = res.P_NOCCUPATION
                    this.nregister_insu_scentro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "":res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.nregister_insu_scargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.nregister_insu_nobligated_subject = res.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
                    this.nregister_insu_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                }
                // FIN VIGP-KAFG 04/04/2025

                this.changeOccupation(search_type); //KAFG VIGP
            })
    };

    changeOccupation(typeClient: number):void{
        if (typeClient == 1) {
            if([3,4,8].includes(this.data_complementary.occupation_status.Id)) {
                this.data_complementary.texto_obligated_subject = "(*)";      
            }else{
                this.data_complementary.texto_obligated_subject = "";      
            }
        } else {
            if([3,4,8].includes(this.data_occuptacion_insu.occupation_status.Id)) {
                this.data_occuptacion_insu.texto_obligated_subject = "(*)";      
            }else{
                this.data_occuptacion_insu.texto_obligated_subject = "";      
            }
        }
    }

    async clickBuscar(search_type) {
        const res = this.searchValidate(search_type);

        if (res.cod_error == "1") {
            Swal.fire('Información', res.message, 'error');
        }

        else {

            this.isLoading = true;

            let params_360;
            if (search_type == 1) {
                params_360 = {
                    P_TIPOPER: 'CON',
                    P_NUSERCODE: this.cur_usr.id,
                    P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                    P_SIDDOC: this.data_contractor.document_number,
                };
            } else { // Asegurado
                params_360 = {
                    P_TIPOPER: 'CON',
                    P_NUSERCODE: this.cur_usr.id,
                    P_NIDDOC_TYPE: this.data_insured.type_document.Id,
                    P_SIDDOC: this.data_insured.document_number,
                };
            }

            await this.clientInformationService.getCliente360(params_360).toPromise().then(
                async res => {
                    if (res.P_NCODE === "0") {
                        if (res.EListClient[0].P_SCLIENT == null) {
                            // No se tiene registro el SCLIENT indicado
                        } else {

                            if (res.EListClient.length === 1) {
                                //if (res.EListClient[0].P_SIDDOC != null) {
                                if (search_type == 1) {
                                    // this.clearData(search_type);
                                    // await this.getDataContractor(res);
                                    // await this.consultProspect(search_type);
                                    // await this.ConsultDataComplementary(search_type);
                                    // this.invokeServiceExperia(1);
                                    // // this.getWorldCheck(1);
                                    // this.getIdecon(1);
                                }
                                else { // 2 Insured
                                    this.clearData(search_type);
                                    await this.cargarDatosInsured(res);
                                    // this.invokeServiceExperia(2);
                                    // this.getWorldCheck(2);
                                    // this.getIdecon(2);
                                }
                                this.isLoading = false;
                                //}
                            }
                        }

                    }

                    else if (res.P_NCODE === "3") { // Se debe habilitar los campos para poder ingresar la Data y Crear el prospecto
                        this.isLoading = false;
                        Swal.fire('Información', 'No se encontró información, ingresar manualmente los datos.', 'error');

                        if (search_type == 2) {
                            this.enableInputs(search_type);// Solo para el Asegurado
                        }
                    }
                    else {
                        this.clearData(search_type);
                        this.isLoading = false;
                        Swal.fire('Información', res.P_SMESSAGE, 'error');
                    }

                }, error => {
                    this.isLoading = false;
                    Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
                }
            )
        }
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
        } else {

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
        console.log("profile_id: ", this.profile_id);
        if (next_step == 2 && this.profile_id != 203 && this.profile_id != 196) {
            this.ValidateInputStep1Contractor(); 
            if (this.error_msg.toString().trim() != '') {
                Swal.fire('Información Contratante', this.error_msg, 'error');
                return;
            }

            if (this.check_input_value == 0) {
                this.ValidateInputStep1Insured();
                if (this.error_msg.toString().trim() != '') {
                    Swal.fire('Información Asegurado', this.error_msg, 'error');
                    return;
                }
            }

            this.nregister_contractor = 0;
            this.nregister_insured = 0;
            this.nregister_contractor_corr = 0;
            this.nregister_contractor_telf = 0;
            this.nregister_contractor_dire = 0;
            this.nregister_insured_dire = 0;
            this.nregister_insured_corr = 0;
            this.nregister_insured_telf = 0;

            const client_update = this.validateForUpdateClient();

            if (client_update == true) {
                const response_upd_data_client = await this.updateDataClient360();
                if (response_upd_data_client.cod_error === 1) {
                    this.isLoading = false;
                    Swal.fire('Información', response_upd_data_client.message_error, 'error');
                    return;
                }
            }

            //validacion datos complementarios
            //datos complementarios
            if (this.data_complementary.occupation_status.Id != this.nregister_noccupation) { this.nregister_contractor = 1; };
            if (this.data_complementary.centro_trabajo != this.nregister_scentro_trabajo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
            if (this.data_complementary.cargo != this.nregister_scargo) { this.nregister_contractor = 1; }; // VIGP-KAFG 08/07/2025
            if (this.check_input_nationality != this.nregister_nnatusa) { this.nregister_contractor = 1; };
            if (this.check_input_relationship != this.nregister_nconpargc) { this.nregister_contractor = 1; };
            if (this.check_input_fiscal_obligations != this.nregister_nofistri) { this.nregister_contractor = 1; };
            if (this.check_input_obligated_subject != this.nregister_nobligated_subject) { this.nregister_contractor = 1; }; // VIGP-KAFG 02/04/2025
            if (this.check_input_calidad_socio != this.nregister_calidad_socio || this.check_input_calidad_socio == 1) { this.nregister_contractor = 1; } // VIGP-KAFG 09/07/2025

            //actualizacion de datos complementarios
            if (this.nregister_contractor == 1) {
                // this.data_quotation_complementary.P_NID_PROSPECT = parseInt(this.prospect_id);   // VIGP-KAFG 07/04/2025
                this.data_quotation_complementary.P_NID_COTIZACION = this.quotation_id; // VIGP-KAFG 02/04/2025
                this.data_quotation_complementary.P_NTYPE_CLIENT = 1;   // VIGP-KAFG 07/04/2025
                this.data_quotation_complementary.P_NOCCUPATION = this.data_complementary.occupation_status.Id;
                this.data_quotation_complementary.P_NNATUSA = this.check_input_nationality;
                this.data_quotation_complementary.P_NOBLIGATED_SUBJECT = this.check_input_obligated_subject; // VIGP-KAFG 02/04/2025
                this.data_quotation_complementary.P_NCALIDAD_SOCIO = this.check_input_calidad_socio; // VIGP-KAFG 09/07/2025
                this.data_quotation_complementary.P_NCONPARGC = this.check_input_relationship;
                this.data_quotation_complementary.P_NOFISTRI = this.check_input_fiscal_obligations;
                this.data_quotation_complementary.P_USER = this.cur_usr.id,
                this.data_quotation_complementary.P_SCENTRO_TRABAJO = this.data_complementary.centro_trabajo ?? '';
                this.data_quotation_complementary.P_SCARGO = this.data_complementary.cargo ?? '';
                this.data_quotation_complementary.P_SOCIETARIOS = this.list_societarios_cont
                // .map(societario => {
                //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ','); // VIGP-KAFG 07/04/2025
                //     return societario;
                // });
                const resContCompl = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_quotation_complementary).toPromise();

                console.log("resContCompl: ", resContCompl);
                if (resContCompl.P_NCODE == 1) {
                    Swal.fire('Información', 'Ha ocurrido un error al actualizar los datos complementarios del contratante.', 'error');
                    return;
                }
            }

            // INI VIGP-KAFG 04/04/2025
            if (this.check_input_value == 0) {
                /*********** ACTUALIZACION DATOS COMPLEMENTARIOS DEL ASEGURADO ************/
                if (this.data_occuptacion_insu.occupation_status.Id != this.nregister_insu_noccupation) { this.nregister_insured = 1; };
                if (this.check_input_insu_nationality != this.nregister_insu_nnatusa) { this.nregister_insured = 1; };
                if (this.check_input_insu_relationship != this.nregister_insu_nconpargc) { this.nregister_insured = 1; };
                if (this.check_input_insu_fiscal_obligations != this.nregister_insu_nofistri) { this.nregister_insured = 1; };
                if (this.check_input_insu_obligated_subject != this.nregister_insu_nobligated_subject) { this.nregister_insured = 1; }; // VIGP-KAFG 02/04/2025
                if (this.data_occuptacion_insu.centro_trabajo != this.nregister_insu_scentro_trabajo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
                if (this.data_occuptacion_insu.cargo != this.nregister_insu_scargo) { this.nregister_insured = 1; }; // VIGP-KAFG 08/07/2025
                if (this.check_input_insu_calidad_socio != this.nregister_insu_calidad_socio || this.check_input_insu_calidad_socio == 1) { this.nregister_insured = 1; } // VIGP-KAFG 09/07/2025

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
                    this.data_complementary_insu.P_SOCIETARIOS = this.list_societarios_insu;
                    // .map(societario => {
                    //     societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace('.', ','); // VIGP-KAFG 07/04/2025
                    //     return societario;
                    // });

                    const resInsuCompl = await this.vidaInversionService.UpdDataComplementaryVIGP(this.data_complementary_insu).toPromise();
                    
                    if (resInsuCompl.P_NCODE == 1) {
                        Swal.fire('Información', 'Ha ocurrido un error al actualizar los datos complementarios del asegurado.', 'error');
                        return;
                    }
                }
            }

            if(client_update || this.nregister_contractor == 1 || (this.check_input_value == 0 && this.nregister_insured == 1)) {
                await this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.quotation_id, P_NDOCUMENT : 1}).toPromise();
            }

            // FIN VIGP-KAFG 04/04/2025

            // this.validateModalConfirmInsured(next_step); // VALIDACION PARA MOSTRAR CAMBIAR DE ASEGURADO CUANDO EL CONTRATANTE Y EL ASEGURADO SON LO MISMO
            this.current_step = next_step;
        }

        else if (next_step == 4) {

            const msg_validate = this.ValidateInputStep3();
            if (msg_validate.toString().trim() != "") {
                Swal.fire('Información', msg_validate, 'error');
                return;
            }

            const myFormData: FormData = new FormData();

            const params = {
                CodigoProceso: this.quotation.nid_proc,
                P_NTYPE_PROFILE: this.CONSTANTS.COD_PRODUCTO,
                P_NUSERCODE: this.cur_usr.id,
                NumeroCotizacion: this.quotation_id,
                List_beneficiary: []
            };

            if (this.check_input_value_beneficiary == 0) {
                if (this.list_benefeciarys.length > 0) {

                    for (let i = 0; i < this.list_benefeciarys.length; i++) {

                        let format_birthday_beneficiary = "null";
                        if (typeof this.list_benefeciarys[i].birthday_date == "object") {
                            format_birthday_beneficiary = this.list_benefeciarys[i].birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.list_benefeciarys[i].birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.list_benefeciarys[i].birthday_date.getFullYear();
                        }
                        // else if (typeof this.list_benefeciarys[i].birthday_date == "string"){
                        //     format_birthday_beneficiary="";
                        // }

                        let item = {
                            nid_cotizacion: this.quotation_id,
                            nid_proc: this.quotation.nid_proc,
                            niiddoc_type: this.list_benefeciarys[i].type_document.desc_type_doc,
                            siddoc: this.list_benefeciarys[i].siddoc,
                            sfirstname: this.list_benefeciarys[i].sfirstname.toUpperCase(),
                            slastname: this.list_benefeciarys[i].slastname.toUpperCase(),
                            slastname2: this.list_benefeciarys[i].last_name2.toUpperCase(),
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
                        params.List_beneficiary.push(item);
                    }
                } else {
                    params.List_beneficiary = [];
                }

            }

            myFormData.append('objeto', JSON.stringify(params));

            this.vidaInversionService.CleanBeneficiar(myFormData).toPromise().then((res) => {
                if (res.codError == 1) {
                    Swal.fire('Información', res.desError, 'error');
                } else {
                    this.current_step = next_step;
                }
            });
        }

        else if (next_step == 5 && this.profile_id != 203 && this.profile_id != 196) {

            let res = this.ValidateInputStep4(); // TODo => aGREGAR LA VALIDACION ACA QUE TODAS LAS PREGUNTAS ESTEN COMPLETAS
            if (res.toString().trim() != "") {
                Swal.fire('Información', res, 'error');
                return;
            }
            else {
                const myFormData: FormData = new FormData();
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
                    }
                ];

                const request_perfilamiento = {
                    P_NID_COTIZACION: this.quotation_id,
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                    P_UPDETE_PERFILAMIENTO: this.perfilamiento.perfilamiento_exist,
                    P_PERFILAMIENTO_ITEMS: response_items
                };

                myFormData.append('respuestas_perfilamiento', JSON.stringify(request_perfilamiento));

                this.vidaInversionService.InsPerfilamiento(myFormData).toPromise().then((res) => {
                    if (res.P_COD_ERR == 1) {
                        Swal.fire('Información', 'Ocurrió un problema en el cálculo del perfilamiento', 'error');
                    } else {
                        this.current_step = next_step;
                    }
                });
            }
        }
        else {
            this.current_step = next_step;
        }
    }

    enableInputs(type: any, isReset: boolean = true) { // Cuando el 360 no llama Info

        if (type == 1) {// Contratante
            // this.data_contractor.docuemnt_number = "";
            if(isReset){
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
            if(isReset){
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

            if (this.nregister_parentesco?.COD_ELEMENTO != this.data_insured.relation.COD_ELEMENTO) { response = true; this.nregister_insured = 1; }; //parentesco
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

        if (this.nregister_parentesco != this.data_insured.relation) { response = true; this.nregister_insured = 1; }; //parentesco

        return response;
    }


    esEmailValido(email: string): boolean {
        let mailValido = false;
        'use strict';

        var EMAIL_REGEX = this.CONSTANTS.REGEX.CORREO;
        //var EMAIL_REGEX = /^[a-z0-9!#$%&''*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([A-Z]{2}|arpa|biz|com|info|intww|name|net|org|pro|aero|asia|cat|coop|edu|gov|jobs|mil|mobi|online|museum|pro|tel|travel|post|pe|global)$/;
        if (email.match(EMAIL_REGEX)) {
            mailValido = true;
        }
        return mailValido;
    }


    async updateDataClient360() {

        let error_upd_360 = { cod_error: 0, message_error: "" }

        let formatter_data = this.formatter_data_definitive();

        if (this.check_input_value == 1) { // Solo Contratante

            let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor, this.idecon_contractor);

            if (validate_error_contractor.cod_error == 1) {
                error_upd_360.cod_error = 1;
                error_upd_360.message_error = validate_error_contractor.message_error;
                return error_upd_360;
            }

            let validate_nationality_data_complementary_contractor = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_CONTRACTOR(this.check_input_nationality);

            if (validate_nationality_data_complementary_contractor.cod_error == 1) {
                this.isLoading = false;
                Swal.fire('Información', validate_nationality_data_complementary_contractor.message_error, 'error');
                return;
            }

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

            this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {

                if (res.P_NCODE == 1) {
                    error_upd_360.cod_error = 1;
                    error_upd_360.message_error = res.P_SMESSAGE;
                    return error_upd_360;
                }

                else {
                    prospect_data[0].P_TYPE_ACTION = 1;
                    prospect_data[0].P_NID_COTIZACION = this.quotation_id;
                    prospect_data[0].P_NID_PROC = this.quotation.nid_proc;
                    this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {
                        if (res.P_NCODE == 1) {
                            this.isLoading = false;
                            Swal.fire('Información', res.P_SMESSAGE, 'error')
                        }
                    })
                    let update_client_360 = this.format_360(1); // Para enviar al 360
                    await this.clientInformationService.getCliente360(update_client_360).toPromise().then(
                        async res => {
                            if (res.P_NCODE == 1) {
                                error_upd_360.cod_error = 1;
                                error_upd_360.message_error = res.P_SMESSAGE;
                                return error_upd_360;
                            }
                            else {

                                // Validacion para actualizar la ubicacion del Contratante
                                //if (this.data_contractor.address !== "" || this.data_contractor.department.Id != "0" || this.data_contractor.province.Id != "0" || this.data_contractor.district.Id != "0") {
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
                                    await this.vidaInversionService.saveDirection(contractor_ubication).toPromise().then(
                                        async res => {
                                            if (res.P_NCODE == 0 || res.P_NCODE == 2) {
                                            }
                                            else {
                                                error_upd_360.cod_error = 1;
                                                error_upd_360.message_error = res.P_SMESSAGE;
                                                return error_upd_360;
                                            }
                                        }
                                    )
                                }

                            }
                        })
                }
            });


        } else { // Contratante y Asegurado

            let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor, this.idecon_contractor);
            let validate_error_insured = this.CONSTANTS.VALIDATE_INSURED(this.data_insured, this.idecon_insured);

            if (validate_error_contractor.cod_error == 1 || validate_error_insured.cod_error == 1) {
                error_upd_360.cod_error = 1;
                error_upd_360.message_error = validate_error_contractor.message_error + validate_error_insured.message_error;
                return error_upd_360;
            }

            let validate_nationality_data_complementary_contractor = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_CONTRACTOR(this.check_input_nationality);

            if (validate_nationality_data_complementary_contractor.cod_error == 1) {
                this.isLoading = false;
                Swal.fire('Información', validate_nationality_data_complementary_contractor.message_error, 'error');
                return;
            }

            let validate_nationality_data_complementary_insured = this.CONSTANTS.VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_INSURED(this.check_input_insu_nationality);

            if (validate_nationality_data_complementary_insured.cod_error == 1) {
                this.isLoading = false;
                Swal.fire('Información', validate_nationality_data_complementary_insured.message_error, 'error');
                return;
            }

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

            if (this.new_client_insured == true) {  // Si el Asegurado no esta registrado en el 360

                let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado
                //asegurado
                await this.clientInformationService.getCliente360(update_client_360_insured).toPromise().then(
                    async res2 => {

                        if (res2.P_NCODE == 1) {
                            error_upd_360.cod_error = 1;
                            error_upd_360.message_error = res2.P_SMESSAGE;
                            return error_upd_360;
                        }
                        else {

                            prospect_data[1].P_SCLIENT = res2.P_SCOD_CLIENT.toString().trim();
                            this.data_insured.sclient = res2.P_SCOD_CLIENT.toString().trim();

                            if (
                                (this.data_insured.address == "" || this.data_insured.address == null) &&
                                (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                                (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                                (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                            ) {

                            } else if(this.nregister_insured_dire == 1){
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

                                await this.vidaInversionService.saveDirection(insured_ubication).toPromise().then(
                                    async res => {
                                        if (res.P_NCODE == 0 || res.P_NCODE == 2) { // cod 2 No se enviaron datos nuevos para actualizar
                                        } else {
                                            error_upd_360.cod_error = 1;
                                            error_upd_360.message_error = res.P_SMESSAGE;
                                            return error_upd_360;
                                        }
                                    })
                            }

                        }
                    });

                this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {
                    if (res.P_NCODE == 1) {
                        error_upd_360.cod_error = 1;
                        error_upd_360.message_error = res.P_SMESSAGE;
                        return error_upd_360;
                    }
                });
                //para actualizar LA DATA DEL ASEGURADO EN TABLAS
                prospect_data[0].P_TYPE_ACTION = 1;
                prospect_data[0].P_NID_COTIZACION = this.quotation_id;
                prospect_data[0].P_NID_PROC = this.quotation.nid_proc;
                this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {
                    if (res.P_NCODE == 1) {
                        this.isLoading = false;
                        Swal.fire('Información', res.P_SMESSAGE, 'error');
                    }
                })

            }
            else {
                this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {
                    if (res.P_NCODE == 1) {
                        error_upd_360.cod_error = 1;
                        error_upd_360.message_error = res.P_SMESSAGE;
                        return error_upd_360;
                    }
                    else {

                        let update_client_360_contractor = this.format_360(1); // Para enviar al 360 Contratante
                        let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado

                        //contratante
                        await this.clientInformationService.getCliente360(update_client_360_contractor).toPromise().then(
                            async res => {

                                if (res.P_NCODE == 1) {
                                    error_upd_360.cod_error = 1;
                                    error_upd_360.message_error = res.P_SMESSAGE;
                                    return error_upd_360;
                                }

                                else {

                                    if (
                                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                                    ) {
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
                                        await this.vidaInversionService.saveDirection(contractor_ubication).toPromise().then(
                                            async res => {
                                                if (res.P_NCODE == 0 || res.P_NCODE == 2) {
                                                }
                                                else {
                                                    error_upd_360.cod_error = 1;
                                                    this.isLoading = false;
                                                    //Swal.fire('Información', res.P_SMESSAGE, 'warning')
                                                    return error_upd_360;
                                                }
                                            }
                                        )
                                    }
                                }
                            });

                        //asegurado
                        await this.clientInformationService.getCliente360(update_client_360_insured).toPromise().then(
                            async res2 => {

                                if (res2.P_NCODE == 1) {
                                    error_upd_360.cod_error = 1;
                                    error_upd_360.message_error = res2.P_SMESSAGE;
                                    return error_upd_360;
                                }
                                else {

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

                                        await this.vidaInversionService.saveDirection(insured_ubication).toPromise().then(
                                            async res => {
                                                if (res.P_NCODE == 0 || res.P_NCODE == 2) { // cod 2 No se enviaron datos nuevos para actualizar
                                                } else {
                                                    error_upd_360.cod_error = 1;
                                                    error_upd_360.message_error = res.P_SMESSAGE;
                                                    return error_upd_360;
                                                }
                                            })
                                    }
                                }
                            });
                    }
                })

                prospect_data[0].P_TYPE_ACTION = 1;
                prospect_data[0].P_NID_COTIZACION = this.quotation_id;
                prospect_data[0].P_NID_PROC = this.quotation.nid_proc;
                this.vidaInversionService.insertProspect(prospect_data).subscribe(async (res) => {
                    if (res.P_NCODE == 1) {
                        this.isLoading = false;
                        Swal.fire('Información', res.P_SMESSAGE, 'error')
                    }
                })
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
                        // P_TIPOPER: "", // KAFG 06/02/2025
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
                        // P_TipOper: "", // KAFG 06/02/2025
                        P_CLASS: ""
                    }]
                }

            }
        }
        else {

            // let split_date = this.data_insured.birthday_date.split('/');
            // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;

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
                        // P_TipOper: "", // KAFG 06/02/2025
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
                        // P_TipOper: "", // KAFG 06/02/2025
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
                        // P_TipOper: "",
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
                        // P_TipOper: "",
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
                        // P_TipOper: "",
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
                        // P_TipOper: "",
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

    openFileModal() {
        let modalRef: NgbModalRef;

        modalRef = this.modalService.open(AddFileComponent, {
            size: 'md',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: true,
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.previusStep = () => this.previusStep(5);
        modalRef.componentInstance.reference.funFirmaManuscrita = () => this.funFirmaManuscrita();

    }

    funFirmaManuscrita() {
        this.firmaManuscrita = true
    }

    GetCommentsCotiVIGP = () => {
        this.quotationService.GetCommentsCotiVIGP({ P_NID_COTIZACION: this.quotation_id, P_NID_PROC: this.quotation.nid_proc }).toPromise().then(
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

    cancelar = () => {
        Swal.fire(
            {
                title: '¿Estás seguro de salir de la cotización',
                text: 'Los datos ingresados previamente permanecerán guardados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
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
        this.quotationService.GetNidStateAndDefState(this.quotation_id).subscribe(
            res => {
                this.NID_STATE = res.P_NID_STATE
                this.DEF_STATE = res.P_DEF_STATE
            },
        );
    }


    GetStatusModalPep = () => {
        this.vidaInversionService.SelDatosPEPVIGP({ P_NID_COTIZACION: this.quotation_id, P_SCLIENT: this.sclient }).toPromise().then(
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

    derivadoASoporte = () => {

        if (!this.pepBool) {
            Swal.fire('Información', "Se debe completar los datos requeridos.", 'error');
            return
        }

        Swal.fire(
            {
                title: 'Información',
                text: '¿Está seguro de derivar a Soporte?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then((result) => {

            if (!result.value) return

            let item = {
                P_NID_COTIZACION: this.quotation_id,
                P_NID_STATE_DER: 17,
                P_SCOMMENT: 'Revisión de Datos PEP',
                P_NUSERCODE: this.cur_usr.id
            }

            this.quotationService.InsCommentsCotiVIGP(item).subscribe(res => {
                if (res.P_NCODE == 0) {
                    Swal.fire(
                        {
                            title: 'Información',
                            text: 'Se derivó a soporte correctamente.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showCloseButton: false
                        }
                    ).then((result) => {
                        if (result.value) {
                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                        }
                    }
                    );
                } else { Swal.fire('Información', res.P_MESSAGE, 'error'); }
            },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                }
            );
        }
        );
    }

    aprobar = () => {
        if (this.coments.length == 0) {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        } else {
            Swal.fire(
                {
                    title: 'Información',
                    text: '¿Está seguro de aprobar la cotización?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                }
            ).then(
                (result) => {
                    if (result.value) {
                        for (let i = 0; i < this.coments.length; i++) {
                            let item = {
                                P_NID_COTIZACION: this.quotation_id,
                                P_NID_STATE_DER: 15,
                                P_SCOMMENT: this.coments[i].coment,
                                P_NUSERCODE: this.cur_usr.id
                            }
                            this.quotationService.InsCommentsCotiVIGP(item).subscribe(
                                res => {
                                    if (res.P_NCODE == 0) {
                                        this.comentario = null;
                                        this.coments = [];
                                        this.GetCommentsCotiVIGP();

                                    } else {
                                        Swal.fire('Información', res.P_MESSAGE, 'error');
                                    }
                                },
                                err => {
                                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                                }
                            );
                        }

                        Swal.fire(
                            {
                                title: 'Información',
                                text: 'Se derivó al supervisor correctamente.',
                                icon: 'success',
                                confirmButtonText: 'Aceptar',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                showCloseButton: false
                            }
                        ).then(
                            (result) => {
                                if (result.value) {
                                    this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                }
                            }
                        );
                    }
                }
            );
        }
    }

    rechazar = () => {
        if (this.coments.length == 0) {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
        } else {
            Swal.fire(
                {
                    title: 'Información',
                    text: '¿Está seguro de rechazar la cotización?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                }
            ).then(
                (result) => {

                    if (result.value) {

                        for (let i = 0; i < this.coments.length; i++) {
                            let item = {
                                P_NID_COTIZACION: this.quotation_id,
                                P_NID_STATE_DER: 16,
                                P_SCOMMENT: this.coments[i].coment,
                                P_NUSERCODE: this.cur_usr.id
                            }
                            this.quotationService.InsCommentsCotiVIGP(item).subscribe(
                                res => {
                                    if (res.P_NCODE == 0) {
                                        this.comentario = null;
                                        this.coments = [];
                                        this.GetCommentsCotiVIGP();

                                    } else {
                                        Swal.fire('Información', res.P_MESSAGE, 'error');
                                    }
                                },
                                err => {
                                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                                    return;
                                }
                            );
                        }

                        this.quotationService.cancelCotizacionesVigentesVIGP({ QuotationNumber: this.quotation_id }).toPromise().then(
                            res => {
                                if (res.P_COD_ERR == 0) {
                                    Swal.fire(
                                        {
                                            title: 'Información',
                                            text: 'Se anuló la cotización correctamente.',
                                            icon: 'success',
                                            confirmButtonText: 'Aceptar',
                                            allowOutsideClick: false,
                                            allowEscapeKey: false,
                                            showCloseButton: false
                                        }
                                    ).then(
                                        (result) => {
                                            if (result.value) {
                                                this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                            }
                                        }
                                    );
                                } else {
                                    Swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            },
                            err => {
                                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                                return;
                            }
                        );
                    }
                }
            );
        }
    }

    openDownloadModal = () => {

        if (this.pepBool) {

            this.loading = true;

            this.quotationService.GetNidStateCotizac(this.quotation_id).toPromise().then(res => { this.NID_STATE = res.P_NID_STATE });

            setTimeout(() => { this.loading = false; console.log('Proceso completado.'); }, 10000);

            this.loading = false;

            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(QuotationDocumentsComponent, {
                size: 'lg',
                backdropClass: 'light-blue-backdrop',
                backdrop: 'static',
                keyboard: true,
            });

            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.cotizacion = this.quotation_id;
        }
    }

    coment = () => {

        if (this.comentario == null || this.comentario == '') {
            Swal.fire('Información', 'Debe ingresar un comentario.', 'warning');
            return;
        } else {
            let item = { coment: this.comentario };
            this.coments.push(item);
            this.comentario = '';
        }
    }

    async getInsuredData360(res_prospect_quotation: any) {

        if (this.check_input_value == 0) {

            this.data_insured.type_document = { Id: res_prospect_quotation.TYPE_DOC_INSURED };
            this.data_insured.document_number = res_prospect_quotation.DOC_INSURED;
            this.data_insured.relation = { COD_ELEMENTO: res_prospect_quotation.SRELATION };
            this.nregister_parentesco = this.data_insured.relation;

            const params_360 = {
                P_TipOper: 'CON',
                P_NUSERCODE: this.cur_usr.id,
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
                                if (res.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2 && this.FL_DATA_QUALITY) {
                                    this.data_insured.document_number = "";
                                    this.data_insured.type_document = { Id: 0 };
                                    this.clearData(2);
        
                                    this.isLoading = false;
                                    Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error')
                                    .then((result) => {
                                        console.log("result: ", result);
                                            this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
                                        });
                                } else {
                                    await this.cargarDatosInsured(res);
                                    if(params_360.P_NIDDOC_TYPE == 2){
                                        this.data_insured.nationality_disabled = true;
                                        this.data_insured.civil_status_disabled = true;
                                    }
                                    // this.invokeServiceExperia(2);
                                    // this.getWorldCheck(2);
                                    // this.getIdecon(2);
                                    await this.getOriginPep(2);
                                    await this.getDataRegNegativoClient(1); /*VIGP 17112025 */
                                    if(!this.FL_DATA_QUALITY) this.enableInputs(2, false);
                                    await this.ConsultDataComplementary(2);
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
                this.current_step = next_step;
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

                    //AFIRMA QUE EL CONTRATANTE ES IGUAL QUE EL ASEUGRADO POR ENDER LLAMAR SOLO PARA CONTRATANTE
                    if (result.isConfirmed) {

                        /* VIGP - DGC - 12/02/2024 - INICIO */
                        if (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == 'SÍ' || this.world_check_contractor.pep == 'SÍ' || this.check_input_relationship == 1) {
                            this.current_step = next_step;
                        }
                        else {
                            this.current_step = next_step;
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
}