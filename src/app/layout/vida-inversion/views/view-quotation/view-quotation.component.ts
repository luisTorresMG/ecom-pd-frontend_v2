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
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { OriginDetailModalComponent } from '../../components/origin-detail-modal/origin-detail-modal.component';
import { AddRelationComponent } from '../../components/add-relation/add-relation.component';
import { AddDeclarationComponent } from '../../components/add-declaration/add-declaration.component';
import { AddPepComponent } from '../../components/add-pep/add-pep.component';
import { AddPropertyComponent } from '../../components/add-property/add-property.component';
import { subtractWithPrecision } from '../../../../shared/helpers/utils';
import { AddSocietarioComponent } from '../../components/add-societario/add-societario.component';
import { OthersService } from '../../../broker/services/shared/others.service';

@Component({
    standalone: false,
    templateUrl: './view-quotation.component.html',
    styleUrls: ['./view-quotation.component.scss']
})


export class ViewQuotationComponent implements OnInit {

    quotation_id: number = 0;
    profile_id: any;
    P_DEF_STATE: number;
    P_NID_STATE: number;
    P_PRE_STATE: number;
    quotation: any = {
        moneda: '',
        fondo: { NFUNDS: "", SDESCRIPT: "" },
        contribution: '',
        date_fund: new Date(),
        nid_proc: "",
        periodo: '',
        monedaDesc: '',
        date_fundDesc: '',
        contributionDesc: 0,
        quoteState: '',
        score: null,
        score_insu: null
    };

    sclient: string = '0';
    prospect_id: any;

    showCoordinadorBtn: boolean = false;
    showGerenteBtn: boolean = false;


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
    @Input() check_input_nationality;
    @Input() check_input_relationship;
    @Input() check_input_fiscal_obligations;
    @Input() check_input_obligated_subject;     // VIGP-KAFG 02/04/2025
    @Input() check_input_calidad_socio; // VIGP-KAFG 09/07/2025

    @Input() check_input_insu_nationality;  //VIGP-KAFG 04/04/2025
    @Input() check_input_insu_relationship; //VIGP-KAFG 04/04/2025
    @Input() check_input_insu_fiscal_obligations;  //VIGP-KAFG 04/04/2025
    @Input() check_input_insu_obligated_subject;     // VIGP-KAFG 04/04/2025
    @Input() check_input_insu_calidad_socio; // VIGP-KAFG 09/07/2025

    CODPRODUCTO_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];

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
    list_societarios_cont: any = [];
    list_societarios_insu: any = [];
    list_document_type_contractor: any = [];
    steps_list: any;

    origin_fund_saving_percent: any = 0; // Origen de fondo ahoro
    origin_fund_spp_percent: any = 0; // Origen de fondo sistema privadode pensiones

    isViewModalSocietarios:boolean = true;

    chekedsumamaxima: boolean = false;
    current_quotation_selected: any;

    perfilamiento: any = {
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        question6: "",
        perfilamiento_exist: false,
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
        centro_trabajo: '',// VIGP-KAFG 08/07/2025
        cargo: '',// VIGP-KAFG 08/07/2025
        texto_obligated_subject: '',// VIGP-KAFG 08/07/2025
    }

    // INI VIGP-KAFG 04/04/2025
    data_occuptacion_insu: any = {
        occupation_status: 0,
        centro_trabajo: '', // VIGP-KAFG 08/07/2025
        cargo: '', // VIGP-KAFG 08/07/2025
        texto_obligated_subject: '', // VIGP-KAFG 08/07/2025
    }
    // FIN VIGP-KAFG 04/04/2025

    data_quotation_complementary: any = {
        P_NID_PROSPECT: 0,
        P_NTYPE_CLIENT: 0,  // VIGP-KAFG 04/04/2025
        P_SDOCUMENT_NUMBER: '',  // VIGP-KAFG 04/04/2025
        P_NOCCUPATION: 0,
        P_NNATUSA: 3,
        P_NCONPARGC: 3,
        P_NOFISTRI: 3,
        P_NOBLIGATED_SUBJECT: 3, // VIGP-KAFG 02/04/2025
        P_USER: 0,
        P_SCENTRO_TRABAJO: '',// VIGP-KAFG 08/07/2025
        P_SCARGO: '',// VIGP-KAFG 08/07/2025
        P_NCALIDAD_SOCIO: 3, // VIGP-KAFG 09/07/2025
        P_SOCIETARIOS:[] // VIGP-KAFG 09/07/2025
    }

    // INI VIGP-KAFG 03/04/2025
    data_complementary_insu: any = {
        P_NID_PROSPECT: 0,
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
    nregister_parentesco = 0;

    nregister_nnatusa = 0;
    nregister_nobligated_subject = 0; // VIGP-KAFG 02/04/2025
    nregister_calidad_socio = 0; // VIGP-KAFG 09/07/2025
    nregister_nconpargc = 0;
    nregister_nofistri = 0;
    nregister_noccupation = 0;
    nregister_scentro_trabajo = ''; // VIGP-KAFG 08/07/2025
    nregister_scargo = ''; // VIGP-KAFG 08/07/2025

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
        civil_status_disabled: true,
        nationality_disabled: true,
        department_disabled: true,
        province_disabled: true,
        district_disabled: true,
        phone_disabled: true,
        email_disabled: true,
        address_disabled: true,
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
        civil_status_disabled: true,
        nationality_disabled: true,
        department_disabled: true,
        province_disabled: true,
        district_disabled: true,
        phone_disabled: true,
        email_disabled: true,
        address_disabled: true,
        relation_disabled: true, // VIGP KAFG 19/02/2025
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

    homologacionCont : string = "——";  // VIGP-KAFG 16/04/2025 
    homologacionInsu : string = "——";  // VIGP-KAFG 16/04/2025 
    
    /*INI VIGP 17112025 */
    riesgo_negative_insu: string = "——";
    riesgo_negative_cont: string = "——";
    /*FIN VIGP 17112025 */

    constructor(private router: Router,
        public clientInformationService: ClientInformationService,
        public addressService: AddressService,
        private vidaInversionService: VidaInversionService,
        private quotationService: QuotationService,
        private readonly activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private acc_personales_service: AccPersonalesService,
        private parameterSettingsService: ParameterSettingsService,
        private othersService: OthersService
    ) { }

    async ngOnInit() {

        this.isLoading = true;

        this.quotation_id = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);
        this.sclient = this.activatedRoute.snapshot.params["cliente"];
        this.prospect_id = this.activatedRoute.snapshot.params["prospecto"];
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));

        this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 
        this.homologacionInsu = "——";  // VIGP-KAFG 16/04/2025 

        await this.getNidStateAndDefState()
        this.profile_id = await this.getProfileProduct();

        this.getDatosPep();
        this.SelDatosPEPVIGP();
        this.readFile();

        this.type_rol = '0';
        this.sum_scoring = '';
        this.check_input_value = 1;
        this.current_step = 1;
        this.now_date = new Date();

        //  Para el Contratante
        await this.clientInformationService.getDocumentTypeList(this.CODPRODUCTO_PROFILE).toPromise().then((result) => {
            this.list_document_type_contractor = result;
        }).catch((err) => {
        });

        this.clientInformationService.getGenderList().toPromise().then((result) => {
            this.list_gender_contractor = result;
        })

        await this.clientInformationService.getCivilStatusList().toPromise().then((result) => {
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

        // Para el Asegurado
        await this.clientInformationService.getCivilStatusList().toPromise().then((result) => {
            this.list_civil_state_insured = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getNationalityList().toPromise().then((result) => {
            this.list_nationalities_insured = result;
        }).catch((err) => {
        })

        await this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).toPromise().then((result) => {
            this.CURRENCY = result;
        }).catch((err) => {
        });

        await this.vidaInversionService.investmentFunds().toPromise().then((result) => {
            this.investment = result;
        }).catch((err) => {
        });

        const request_search_prospect = { P_NID_PROSPECT: this.prospect_id, P_NID_COTIZACION: this.quotation_id };
        await this.vidaInversionService.searchByProspectQuotation(request_search_prospect).toPromise().then(async res_prospect_quotation => {

            this.data_contractor.type_document = { Id: res_prospect_quotation.TYPE_DOC_CONTRACTOR }
            this.data_contractor.document_number = res_prospect_quotation.DOC_CONTRACTOR;
            this.check_input_value = parseInt(res_prospect_quotation.NID_ASCON);


            const params_360 = {
                P_TipOper: 'CON',
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
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

                                await this.getDataContractor(res);
                                await this.invokeServiceExperia(1);
                                await this.getWorldCheck(1); // Cambiando a metodo asincrono ya que se demora mucho en responder el Servicio
                                await this.getIdecon(1);
                                //await this.consultProspect(1);
                                await this.getInsuredData360(res_prospect_quotation); // Llamando la data del Asegurado
                                await this.ConsultDataComplementary(1);
                                await this.getDataRegNegativoClient(1); /*VIGP 17112025 */
                                this.data_contractor_360 = { ...this.data_contractor };

                            }
                        }
                    }
                }
                else if (res.P_NCODE === "2" || res.P_NCODE === "1" || res.P_NCODE === "3") {
                    this.isLoading = false;
                    Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
                }
            }, error => {
                this.isLoading = false;
                Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
            }
            )
        })

        this.TIME = [
            { codigo: "1", valor: '7 AÑOS' },
            { codigo: "2", valor: '8 AÑOS' },
        ];

        this.APORT = [
            { codigo: "1", valor: '10,000' },
            { codigo: "2", valor: '20,000' },
            { codigo: "3", valor: '30,000' },
            { codigo: "4", valor: '40,000' },
        ];

        this.FONDO = [
            { codigo: "1", valor: 'MODERADO' },
        ];

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

        const search_scoring = {
            P_NID_COTIZACION: this.quotation_id,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
        }
        await this.vidaInversionService.RequestScoring(search_scoring).toPromise().then(res => {
            if (res.P_COD_ERR == 1) { }  //Error
            else if (res.P_COD_ERR == 2) { } // Es porque se puede registrar, no existe data en las tablas
            else {

                this.desc_scoring = res.P_DESC_SCORING;
                this.recomendacion = res.P_RECOMENDACION;
                this.sum_scoring = res.P_SUM_SCORING;
                this.perfilamiento.question1 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[0].P_SANSWER;
                this.perfilamiento.question2 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[1].P_SANSWER;
                this.perfilamiento.question3 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[2].P_SANSWER;
                this.perfilamiento.question4 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[3].P_SANSWER;
                this.perfilamiento.question5 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[4].P_SANSWER;
                this.perfilamiento.question6 = res.P_PERFILAMIENTO_ITEMS_RESPONSE[5].P_SANSWER;
                this.perfilamiento.perfilamiento_exist = res.P_COD_ERR == 0 ? true : false;
            }
        });

        const get_data_coti = {
            P_QUOTATIONNUMBER: this.quotation_id
        };

        await this.quotationService.GetCotizacionPre(get_data_coti).toPromise().then((res) => {
            if (res.P_COD_ERROR == 1) {
                this.quotation.date_fund = new Date();
                this.quotation.contribution = "";
                this.quotation.fondo = "";
                this.quotation.moneda = "";
                this.quotation.periodo = "";
                this.quotation.monedaDesc = "";
                this.quotation.date_fundDesc = "";
            }
            else {
                this.getCurrency(res.NCURRENCY);

                this.parse_amount = CommonMethods.formatNUMBER(res.P_CONTRIBUTION);
                this.quotation.contribution = this.parse_amount;
                this.quotation.contributionDesc = res.P_CONTRIBUTION;
                this.quotation.date_fundDesc = res.P_DDATE_FUND;
                this.quotation.periodo = res.P_NSAVING_TIME;
                this.quotation.quoteState = res.P_NSTATE;
                this.quotation.score = res.P_NSCORE;
                this.quotation.score_insu = res.P_NSCORE_INSU; // VIGP-KAFG 08/04/2025

                if (this.quotation.contribution.toUpperCase() == "NAN") {
                    this.quotation.contribution = '';
                }

                this.quotation.fondo = { NFUNDS: res.P_NFUNDS };
                this.quotation.moneda = { NCODIGINT: res.P_NCURRENCY };

                let split_date_date_fund = res.P_DDATE_FUND.split('/');
                this.quotation.date_fund = new Date(parseInt(split_date_date_fund[2]), parseInt(split_date_date_fund[1]) - 1, parseInt(split_date_date_fund[0]));

                this.quotation.nid_proc = res.CodigoProceso;
                this.GetCommentsCotiVIGP();

                this.list_benefeciarys = res.List_beneficiary.map(element => {
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
                        slastname2: element.slastname2.toUpperCase(),
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
        });


        await this.vidaInversionService.GetOriginDetailCab(this.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];

                // CON ESTA DATA SABREMOS SI la cotizacino tiene todo a segura de pensiona , todo a ahorros financieros o compartido.

                // CAMBIOS PARA SISTEMA PRIVADO DE PENSIONES
                if (response.P_NCUSPP != 0 && response.P_NPRIVATE_PENSION_SYSTEM != 0) {
                    this.exist_origin_detail_spp = true;

                }

                if (response.P_NSAVING_FINANCIAL_INSTITUTION1 || response.P_NSAVING_FINANCIAL_INSTITUTION2 || response.P_NSAVING_FINANCIAL_INSTITUTION3 || response.P_NSAVING_FINANCIAL_INSTITUTION4) {
                    this.exist_origin_detail_saving_financial_institution = true;
                }
            }

            else {

            }
        });

        await this.vidaInversionService.GetOriginDetailDet(this.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];

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

                    this.origin_fund_saving_percent = sum_origin_detail.toFixed(2);
                    // this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);
                    this.origin_fund_spp_percent = subtractWithPrecision(100, this.origin_fund_saving_percent);
                }
            }
        });

        await this.vidaInversionService.getScoringOptions().toPromise().then((res) => {

            this.options_perfilamiento_question1 = res.filter((item) => item.P_NQUESTION === 1);
            this.options_perfilamiento_question2 = res.filter((item) => item.P_NQUESTION === 2);
            this.options_perfilamiento_question3 = res.filter((item) => item.P_NQUESTION === 3);
            this.options_perfilamiento_question4 = res.filter((item) => item.P_NQUESTION === 4);
            this.options_perfilamiento_question5 = res.filter((item) => item.P_NQUESTION === 5);
            this.options_perfilamiento_question6 = res.filter((item) => item.P_NQUESTION === 6);

        });

        this.isLoading = false;
    }

    /*INI VIGP 17112025 */
    async getDataRegNegativoClient(client_type: number) {
        let consultaRegNegativo = {
            TypeDocument: null,
            IdDocNumber: null,
            Name: null
        };

        const sclientRN = { P_SCLIENT: null };
        
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
                        this.riesgo_negative_cont = '——';
                    } else{
                        this.riesgo_negative_insu = '——';
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
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
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
        this.quotationService.getDatosPep({ P_NID_COTIZACION: this.quotation_id, P_SCLIENT: this.sclient }).subscribe(
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
        this.vidaInversionService.SelDatosPEPVIGP({ P_NID_COTIZACION: this.quotation_id, P_SCLIENT: this.sclient }).subscribe(
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

    previusStep(value) {
        this.current_step = value;
        // if (value == 2) {
        //     /* VIGP - DGC - 12/02/2024 - INICIO */
        //     if (this.idecon_contractor.pep == 'SÍ' || this.idecon_contractor.famPep == 'SÍ' || this.world_check_contractor.pep == 'SÍ' || this.check_input_relationship == 1) {
        //         this.current_step = value;
        //     }
        //     else {
        //         this.current_step = 1;
        //     }
        //     /* VIGP - DGC - 12/02/2024 - FIN */
        // }
        // else {
        //     this.current_step = value;
        // }
    }

    validateCheckInsured() {
        // console.log(typeof this.type_rol);

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

    // ViewScoring(){
    //     if([191,192,194,195,203,196].includes(Number(this.profile_id)))return true
    //     return false
    // }

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

        console.log(this.P_NID_STATE);
        this.vidaInversionService.ReadDocumentsVIGP(obj).subscribe(
            res => {
                if (this.P_NID_STATE == 12 || this.P_NID_STATE == 14) {
                    let temp = res.P_DOCUMENTS.filter(x => x.P_FLAG != 1);

                    let isClientFileSigned = temp.some(item => item.P_FLAG === 7 && item.P_STATUS === 1); //  Si existe file del cliente firmado

                    if (isClientFileSigned) {
                        this.filesList = temp.filter(x => x.P_FLAG !== 6 && x.P_FLAG !== 8 && x.P_FLAG !== 9);
                    } else {
                        this.filesList = temp.filter(x => x.P_FLAG !== 6);
                    }
                } else {
                    this.filesList = res.P_DOCUMENTS.filter(x => x.P_FLAG != 6 && x.P_FLAG != 7 && x.P_FLAG != 9);
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

    exportFile = (item) => {
        let obj = item.P_FILE_NAME;
        this.othersService.downloadFile(obj).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    Swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    var newBlob = new Blob([res], { type: "application/pdf" });
                      const nav: any = window.navigator;
                        if (nav && nav.msSaveOrOpenBlob) {
                            nav.msSaveOrOpenBlob(newBlob);
                            return;
                        }
                    // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    //     window.navigator.msSaveOrOpenBlob(newBlob);
                    //     return;
                    // }
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
                      const nav: any = window.navigator;
                        if (nav && nav.msSaveOrOpenBlob) {
                            nav.msSaveOrOpenBlob(newBlob);
                            return;
                        }
                    // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    //     window.navigator.msSaveOrOpenBlob(newBlob);
                    //     return;
                    // }
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

    changeDocumentType(search_type: any) {
        if (search_type == 1) {
            this.data_contractor.document_number = "";
        } else {
            this.data_insured.document_number = "";
        }
    }

    searchValidate(search_type) { // 1 Contratante 2 Asegurado

        const validate_res = { cod_error: "0", message: "" };

        if (search_type == 1) {

            if (this.data_contractor.type_document.Id == 2) {
                console.log(this.data_contractor.document_number.length);

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
                        await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                            async (res) => {
                                consultWorldCheck = {
                                    P_SCLIENT: this.data_contractor.sclient,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_SUPDCLIENT: '0'
                                }

                                this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                            }
                        );
                    } else {
                        if (consultWorldCheck.P_SUPDCLIENT == "1") {
                            await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                                async (res) => {
                                    consultWorldCheck = {
                                        P_SCLIENT: this.data_contractor.sclient,
                                        P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                        P_NISPEP: res.isPep ? 1 : 0,
                                        P_SUPDCLIENT: '1'
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
        } else {
            datosWorldCheck = {
                name: this.data_insured.names + ' ' + this.data_insured.last_name + ' ' + this.data_insured.last_name2,
                idDocNumber: this.data_insured.document_number,
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
                        await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                            async (res) => {
                                consultWorldCheck = {
                                    P_SCLIENT: this.data_insured.sclient,
                                    P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                    P_NISPEP: res.isPep ? 1 : 0,
                                    P_SUPDCLIENT: '0'
                                }

                                this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                                this.isLoading = false;
                            }
                        );
                    } else {
                        if (consultWorldCheck.P_SUPDCLIENT == "1") {
                            await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                                async (res) => {
                                    consultWorldCheck = {
                                        P_SCLIENT: this.data_insured.sclient,
                                        P_NOTHERLIST: res.isOtherList ? 1 : 0,
                                        P_NISPEP: res.isPep ? 1 : 0,
                                        P_SUPDCLIENT: '1'
                                    }

                                    this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                                    this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                                    await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                                }
                            );
                        } else {
                            this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';
                        }
                    }
                }
            );
        }
    }

    resolveLabelBtnSocietario(type: number): string {
        if (type == 1) return `Societarios(${this.list_societarios_cont.length})`;
        else if (type == 2) return `Societarios(${this.list_societarios_insu.length})`;
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

    // INI VIGP-KAFG 09/07/2025
    changeValueCalidadDeSocio(value, typeCli = 'CONT') {
        if (typeCli == 'CONT') this.check_input_calidad_socio = value;
        else this.check_input_insu_calidad_socio = value;
    }
    // FIN VIGP-KAFG 09/07/2025

    async invokeServiceExperia(client_type: number) {
        let datosServiceExperia = {};
        if (client_type == 1) {
            datosServiceExperia = {
                tipoid: (this.data_contractor.type_document || {}).Id == '1' ? '2' : '1',
                id: this.data_contractor.document_number,
                papellido: this.data_contractor.last_name,
                sclient: this.data_contractor.sclient,
                usercode: JSON.parse(localStorage.getItem('currentUser'))['id']
            }
        } else {
            datosServiceExperia = {
                tipoid: (this.data_insured.type_document || {}).Id == '1' ? '2' : '1',
                id: this.data_insured.document_number,
                papellido: this.data_insured.last_name,
                sclient: this.data_insured.sclient,
                usercode: JSON.parse(localStorage.getItem('currentUser'))['id']
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

        if(this.data_insured.type_document.Id == 4) {  // VIGP-KAFG 21/04/2025
            this.homologacionInsu = "__";   // VIGP-KAFG 21/04/2025 
        }
        else {

            insured_data_client.P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, insured_data_client.P_SCLIENT);
            // VIGP-KAFG 21/04/2025
            this.homologacionInsu = insured_data_client.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        }   // VIGP-KAFG 21/04/2025

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
                    this.data_complementary.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_complementary.cargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_cont = res.P_SOCIETARIOS.map(societario => {
                        societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                        return societario;
                    });

                    this.nregister_nnatusa = res.P_NNATUSA;
                    this.nregister_nconpargc = res.P_NCONPARGC;
                    this.nregister_nofistri = res.P_NOFISTRI;
                    this.nregister_noccupation = res.P_NOCCUPATION
                    this.nregister_scentro_trabajo = res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.nregister_scargo = res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.nregister_nobligated_subject = res.P_NOBLIGATED_SUBJECT;  // VIGP-KAFG 02/04/2025
                    this.nregister_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025


                // INI VIGP-KAFG 04/04/2025
                } else {
                    
                    this.check_input_insu_nationality = res.P_NNATUSA;
                    this.check_input_insu_relationship = res.P_NCONPARGC;
                    this.check_input_insu_fiscal_obligations = res.P_NOFISTRI;
                    this.check_input_insu_obligated_subject = res.P_NOBLIGATED_SUBJECT // VIGP-KAFG 02/04/2025
                    this.check_input_insu_calidad_socio = res.P_NCALIDAD_SOCIO; // VIGP-KAFG 09/07/2025
                    this.data_occuptacion_insu.occupation_status = { Id: res.P_NOCCUPATION }
                    this.data_occuptacion_insu.centro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
                    this.data_occuptacion_insu.cargo = res.P_SCARGO == 'null' ? "" : res.P_SCARGO; // VIGP-KAFG 08/07/2025
                    this.list_societarios_insu = res.P_SOCIETARIOS.map(societario => {
                        societario.NPORCENTAJE = societario.NPORCENTAJE.toString().replace(',', '.'); // VIGP-KAFG 07/04/2025
                        return societario;
                    });

                    this.nregister_insu_nnatusa = res.P_NNATUSA;
                    this.nregister_insu_nconpargc = res.P_NCONPARGC;
                    this.nregister_insu_nofistri = res.P_NOFISTRI;
                    this.nregister_insu_noccupation = res.P_NOCCUPATION
                    this.nregister_insu_scentro_trabajo = res.P_SCENTRO_TRABAJO == 'null' ? "" : res.P_SCENTRO_TRABAJO; // VIGP-KAFG 08/07/2025
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

    async consultProspect(search_type) {
        let params_cons = {
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_NTYPE_CLIENT: search_type
        };
        await this.vidaInversionService.consultProspect(params_cons).toPromise().then(
            async res => {
                this.check_input_value = res.P_NID_ASCON;
                this.check_input_value_360 = res.P_NID_ASCON;
                if (this.check_input_value == 0) {
                    this.data_insured.type_document = { Id: res.P_NTYPE_DOCUMENT };
                    this.data_insured.document_number = res.P_SNUMBER_DOCUMENT_INSURED.trim();
                    if (res.P_SRELATION == null) { // PARENTESCO
                        this.data_insured.relation = { COD_ELEMENTO: 0 };
                    } else {
                        this.data_insured.relation = { COD_ELEMENTO: parseInt(res.P_SRELATION) };
                    }
                    this.nregister_parentesco = this.data_insured.relation;


                    // Asegurado
                    const params_360 = {
                        P_TipOper: 'CON',
                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
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
                                        await this.cargarDatosInsured(res);
                                        this.invokeServiceExperia(search_type);
                                        this.getWorldCheck(search_type);
                                        this.getIdecon(search_type);
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

    async getInsuredData360(res_prospect_quotation: any) {

        if (this.check_input_value == 0) {

            this.data_insured.type_document = { Id: res_prospect_quotation.TYPE_DOC_INSURED };
            this.data_insured.document_number = res_prospect_quotation.DOC_INSURED;
            this.data_insured.relation = { COD_ELEMENTO: res_prospect_quotation.SRELATION };

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
                                await this.cargarDatosInsured(res);
                                this.invokeServiceExperia(2);
                                this.getWorldCheck(2);
                                this.getIdecon(2);
                                await this.ConsultDataComplementary(2);
                                await this.getDataRegNegativoClient(2); /*VIGP 17112025 */
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
    }

    async getDataContractor(res: any) {

        const contracting_data = res.EListClient[0];

        let split_date = contracting_data.P_DBIRTHDAT.split('/');
        this.data_contractor.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_contractor.sclient = contracting_data.P_SCLIENT;

        if(this.data_contractor.type_document.Id == 4) {  // VIGP-KAFG 21/04/2025
            this.homologacionCont = "__";   // VIGP-KAFG 21/04/2025 
        }
        else {

            contracting_data.P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, contracting_data.P_SCLIENT);
            // VIGP-KAFG 21/04/2025
            this.homologacionCont = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025
        }   // VIGP-KAFG 21/04/2025

        // this.homologacionCont = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 

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

    changeStep(next_step) {
        this.current_step = next_step;
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
                P_TipOper: "INS",
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
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            }

            if (this.data_contractor.phone !== "") {
                formatter_data_360 = {
                    ...formatter_data_360, EListPhoneClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                        P_DESAREA: "",
                        P_DESTIPOTLF: "Celular",
                        P_NAREA_CODE: null,
                        P_NEXTENS1: "",
                        P_NPHONE_TYPE: "2",
                        P_NROW: 1,
                        P_SPHONE: this.data_contractor.phone,
                        P_SNOMUSUARIO: "",
                        P_DCOMPDATE: "",
                        P_TipOper: "",
                        P_CLASS: ""
                    }]
                }
            }

            if (this.data_contractor.email !== "") {
                // Actualizacion de Correo Personal
                formatter_data_360 = {
                    ...formatter_data_360, EListEmailClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                        P_DESTICORREO: "Trabajo",
                        P_NROW: 1,
                        P_SE_MAIL: this.data_contractor.email,
                        P_SRECTYPE: 4,
                        P_TipOper: "",
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
                P_TipOper: "INS",
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
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            }

            if (this.data_insured.phone !== "") {
                formatter_data_360 = {
                    ...formatter_data_360, EListPhoneClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                        P_DESAREA: "",
                        P_DESTIPOTLF: "Celular",
                        P_NAREA_CODE: null,
                        P_NEXTENS1: "",
                        P_NPHONE_TYPE: "2",
                        P_NROW: 1,
                        P_SPHONE: this.data_insured.phone,
                        P_SNOMUSUARIO: "",
                        P_DCOMPDATE: "",
                        P_TipOper: "",
                        P_CLASS: ""
                    }]
                }
            }

            if (this.data_insured.email !== "") {
                // Actualizacion de Correo Personal
                formatter_data_360 = {
                    ...formatter_data_360, EListEmailClient: [{
                        P_SORIGEN: "SCTR",
                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                        P_DESTICORREO: "Trabajo",
                        P_NROW: 1,
                        P_SE_MAIL: this.data_insured.email,
                        P_SRECTYPE: 4,
                        P_TipOper: "",
                        P_CLASS: ""
                    }]
                }

            }
        }
        return formatter_data_360;
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

    //   scoring = () => {
    //     let items: string[] = ['Bajo', 'Medio', 'Alto'];
    //     const randomIndex = Math.floor(Math.random() * items.length);
    //     this.randomItem = items[randomIndex];
    //     this.showScoreBtn = false;
    //     this.showCoordinadorBtn = (this.randomItem == 'Medio' || this.randomItem == 'Alto') && Number(this.quotation.contributionDesc) <= 100000 ? true : false;
    //     this.showGerenteBtn = (this.randomItem == 'Medio' || this.randomItem == 'Alto') && Number(this.quotation.contributionDesc) > 100000 ? true : false;
    // }

    OnQualification(qualification: string) {
        console.log('hey INSIDE ', qualification)
        const high = qualification == 'Alto' || 'Muy Alto';
        const low = qualification == 'Bajo' || 'Muy Bajo';
        const medium = qualification == 'Medio';

        this.showCoordinadorBtn = (medium || high) && Number(this.quotation.contributionDesc) <= 100000 ? true : false;
        this.showGerenteBtn = (medium || high) && Number(this.quotation.contributionDesc) > 100000 ? true : false;
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

    cerrar() {
        this.router.navigate(['extranet/vida-inversion/consulta-cotizacion']);
    }

    async getNidStateAndDefState() {
        await this.quotationService.GetNidStateAndDefState(this.quotation_id).toPromise().then(
            res => {
                console.log(res)
                this.P_NID_STATE = res.P_NID_STATE;
                this.P_DEF_STATE = res.P_DEF_STATE;
                this.P_PRE_STATE = res.P_PRE_STATE;
                this.P_DEF_STATE == 1;
                if (this.P_DEF_STATE == 0) {
                    this.step_list = [
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
                            tittle: "Datos del Producto"
                        }
                    ];
                } else {
                    console.log(this.P_DEF_STATE)
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
                }
            }
        );

    }

}
