import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { DataContractor } from '../../models/DataContractor';
import { DataInsured } from '../../models/DataInsured';
import { AddressService } from '../../../broker/services/shared/address.service';
import { AccPersonalesService } from '../../../broker/components/quote/acc-personales/acc-personales.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { CommonMethods } from '../../../broker/components/common-methods';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2';
import { PolicyemitService } from '../../../broker/services/policy/policyemit.service';
import { subtractWithPrecision } from '../../../../shared/helpers/utils';
import { OthersService } from '../../../broker/services/shared/others.service';

@Component({
    selector: 'app-quotation-evaluation',
    templateUrl: './quotation-evaluation.component.html',
    styleUrls: ['./quotation-evaluation.component.scss']
})
export class QuotationEvaluationComponent implements OnInit {

    quotation_id: number;
    prospect_id: number;

    profile_id: any;
    quotation: any = {
        moneda: '',
        fondo: '',
        contribution: '',
        date_fund: new Date(),
        nid_proc: ""
    };

    current_day: any = new Date();
    CONSTANTS: any = VidaInversionConstants;
    isLoading: boolean = false;
    dissabled_btn_modal_detail_origin: boolean = false;

    @Input() check_input_value = 1;
    @Input() check_input_value_beneficiary = 0;
    @Input() check_input_nationality;
    @Input() check_input_relationship;
    @Input() check_input_fiscal_obligations;


    CODPRODUCTO_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    investment: any = [];
    pep_data: any // ALMACENA LOS DATOS PEP
    parse_amount: any;
    cur_usr: any;

    CURRENCY: any = [{ NCODIGINT: "", SDESCRIPT: "" }];
    TIME: any = [];
    APORT: any;
    NATIONALITY: any;
    FONDO: any;
    polizaEmitCab: any = {};


    //ACTUALIZAR REGISTRO
    nregister_contractor = 0;
    nregister_insured = 0;
    nregister_parentesco = 0;
    nregister_nnatusa = 0;
    nregister_nconpargc = 0;
    nregister_nofistri = 0;
    nregister_noccupation = 0;

    list_data_contractor_department: any = [];
    list_data_contractor_province: any = [];
    list_data_contractor_district: any = [];

    list_data_insured_department: any = [];
    list_data_insured_province: any = [];
    list_data_insured_district: any = [];
    list_civil_state_contractor: any = [];
    list_civil_state_insured: any = [];
    filesList: any = [];


    list_nationalities_contractor: any = [];
    list_nationalities_insured: any = [];

    list_occupation_contractor: any = [];
    latestComments: any[] = []; //DVP VIGP 07-03-2025

    // DVP VIGP 10-03-2025
    historialEvaluaciones: any[] = [];

    list_gender_contractor: any = [];
    list_benefeciarys: any = [];
    list_document_type_contractor: any = [];

    origin_fund_saving_percent: any = 0; // Origen de fondo ahoro
    origin_fund_spp_percent: any = 0; // Origen de fondo sistema privadode pensiones

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
        occupation_status: 0
    }

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
        gender: { SSEXCLIEN: "" },
        civil_status: { NCIVILSTA: "" },
        nationality: { NNATIONALITY: "" },
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
        relation_disabled: true
    };

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

    exist_origin_detail_spp: boolean = false;
    exist_origin_detail_saving_financial_institution: boolean = false;
    comment: any = "";

    dstartdate_ase: any;
    dexpirdat_ase: any;
    dstartdate: any;
    dexpirdat: any;
    pay_freq_des: string;

    partial_rescue: string;
    rescue: string;
    dps: string;
    cover_list: any;

    homologacionCont: string = "——";  // VIGP-KAFG 25/04/2025 
    homologacionInsu: string = "——";  // VIGP-KAFG 25/04/2025 

    riesgo_negativo_cont: string = "——"; /*VIGP 17112025*/
    riesgo_negativo_insu: string = "——"; /*VIGP 17112025*/

    constructor(private router: Router,
        private readonly activatedRoute: ActivatedRoute,
        public addressService: AddressService,
        public clientInformationService: ClientInformationService,
        public quotationService: QuotationService,
        private acc_personales_service: AccPersonalesService,
        private policyemit: PolicyemitService,
        private vidaInversionService: VidaInversionService,
        private parameterSettingsService: ParameterSettingsService,
        private othersService: OthersService) {}

    async ngOnInit() {
        this.quotation_id = parseInt(this.activatedRoute.snapshot.params["cotizacion"]);
        this.prospect_id = parseInt(this.activatedRoute.snapshot.params["prospecto"]);

        this.isLoading = true;

        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
        this.profile_id = await this.getProfileProduct();

        this.homologacionCont = "——";  // VIGP-KAFG 25/04/2025
        this.homologacionInsu = "——";  // VIGP-KAFG 25/04/2025

        this.current_day = String(this.current_day.getDate()).padStart(2, '0') + "/" + String((this.current_day.getMonth() + 1)).padStart(2, '0') + "/" + String(this.current_day.getFullYear()).padStart(2, '0');

        this.readFile();

        await this.clientInformationService.getDocumentTypeList(this.CODPRODUCTO_PROFILE).toPromise().then((result) => {
            this.list_document_type_contractor = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getGenderList().toPromise().then((result) => {
            this.list_gender_contractor = result;
        })

        // Ocupacion
        await this.clientInformationService.getOccupationTypeList().toPromise().then((result) => {
            this.list_occupation_contractor = result;
        })

        await this.clientInformationService.getNationalityList().toPromise().then((result) => {
            this.list_nationalities_contractor = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getNationalityList().toPromise().then((result) => {
            this.list_nationalities_insured = result;
        }).catch((err) => {
        });

        await this.clientInformationService.getCivilStatusList().toPromise().then((result) => {
            this.list_civil_state_contractor = result;
        }).catch((err) => {
        });

        // Asegurado
        await this.clientInformationService.getCivilStatusList().toPromise().then((result) => {
            this.list_civil_state_insured = result;
        }).catch((err) => {
        });


        await this.acc_personales_service.getCurrency({ nproduct: this.CONSTANTS.COD_PRODUCTO, nbranch: this.CONSTANTS.RAMO }).toPromise().then((result) => {
            this.CURRENCY = result;
        }).catch((err) => {
        });

        await this.vidaInversionService.investmentFunds().toPromise().then((result) => {
            this.investment = result;
        }).catch((err) => {
        });

        const request_search_prospect = { P_NID_PROSPECT: this.prospect_id };

        await this.vidaInversionService.searchByProspect(request_search_prospect).toPromise().then(async res => {

            this.data_contractor.type_document = { Id: res.TYPE_DOC_CONTRACTOR }
            this.data_contractor.document_number = res.DOC_CONTRACTOR;

            const params_360 = {
                P_TipOper: 'CON',
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
                            res.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService, res.EListClient[0].P_SCLIENT);
                            if (res.EListClient[0].P_SIDDOC != null) {
                                await this.cargarDatosContractor(res, 1);
                                await this.invokeServiceExperia(1);
                                await this.getWorldCheck(1);
                                await this.getIdecon(1);
                                await this.consultProspect(1);
                                await this.getDataRegNegativoClient(1); /*VIGP 17112025 */
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

        });

        const get_data_coti = {
            P_QUOTATIONNUMBER: this.quotation_id
        };

        await this.policyemit.getPolicyEmitCab(this.quotation_id, "1", this.cur_usr.id,).toPromise().then((res) => {
            this.polizaEmitCab = res.GenericResponse;

        });

        await this.quotationService.GetCotizacionPre(get_data_coti).toPromise().then((res) => {
            if (res.P_COD_ERROR == 1) {
                this.quotation.date_fund = new Date();
                this.quotation.contribution = "";
                this.quotation.fondo = "";
                this.quotation.moneda = "";
            }
            else {

                this.parse_amount = CommonMethods.formatNUMBER(res.P_CONTRIBUTION);
                this.quotation.contribution = this.parse_amount;

                if (this.quotation.contribution.toUpperCase() == "NAN") {
                    this.quotation.contribution = '';
                }

                this.quotation.fondo = { NFUNDS: res.P_NFUNDS };
                this.quotation.moneda = { NCODIGINT: res.NCURRENCY };

                let split_date_date_fund = res.P_DDATE_FUND.split('/');
                this.quotation.date_fund = new Date(parseInt(split_date_date_fund[2]), parseInt(split_date_date_fund[1]) - 1, parseInt(split_date_date_fund[0]));

                this.quotation.nid_proc = res.CodigoProceso;
                this.pay_freq_des = res.PAYFREQ_SDESCRIPT;

                this.list_benefeciarys = res.List_beneficiary.map(element => {
                    return {
                        type_doc: element.niddoc_type_beneficiary,
                        type_document: { Id: element.niddoc_type_beneficiary },
                        siddoc: element.siddoc_beneficiary,
                        desc_type_doc: element.sdesc_doc,
                        srelation_name: element.sdesc_srelation,
                        percentage_participation: element.percen_participation,
                        nationality: { NNATIONALITY: element.nnationality },
                        desc_nationality: element.sdesc_nationality,
                        sfirstname: element.sfirstname,
                        slastname: element.slastname,
                        slastname2: element.slastname2,
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
        if (this.quotation.nid_proc) {
            await this.getQuotationComments();
        }

        await this.vidaInversionService.GetOriginDetailCab(this.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];

                // CON ESTA DATA SABREMOS SI la cotizacino tiene todo a segura de pensiona , todo a ahorros financieros o compartido.
                if (response.P_NCUSPP != 0 && response.P_NPRIVATE_PENSION_SYSTEM != 0) {
                    this.exist_origin_detail_spp = true;
                }

                if (response.P_NSAVING_FINANCIAL_INSTITUTION1 || response.P_NSAVING_FINANCIAL_INSTITUTION2 || response.P_NSAVING_FINANCIAL_INSTITUTION3 || response.P_NSAVING_FINANCIAL_INSTITUTION4) {
                    this.exist_origin_detail_saving_financial_institution = true;
                }
            }
        });

        await this.vidaInversionService.GetOriginDetailDet(this.quotation_id).toPromise().then((res) => {
            if (res.length > 0) {
                const response = res[0];

                this.dissabled_btn_modal_detail_origin = true;

                // Retorna la suma de los Porcentajes
                if (this.exist_origin_detail_spp == true && this.exist_origin_detail_saving_financial_institution == false) {
                    this.origin_fund_saving_percent = "0.00";
                    this.origin_fund_spp_percent = "100.00";
                }
                else if (this.exist_origin_detail_spp == false && this.exist_origin_detail_saving_financial_institution == true ) {
                    this.origin_fund_saving_percent = "100.00";
                    this.origin_fund_spp_percent = "0.00";
                }
                else {
                    let sum_origin_detail = Number.parseFloat(response.P_NBUSINESS_INCOME) + Number.parseFloat(response.P_NREMUNERATIONS) + Number.parseFloat(response.P_NGRATIFICATIONS) + Number.parseFloat(response.P_NBUSINESS_DIVIDENS) + Number.parseFloat(response.P_NSALE_SECURITIES) + Number.parseFloat(response.P_NCANCELED_BANK_CERTIFICATES) + Number.parseFloat(response.P_NLOAN) + Number.parseFloat(response.P_NINCOME_PERSONAL_FEES) + Number.parseFloat(response.P_NCOMPENSATION_SERVICE_TIME) + Number.parseFloat(response.P_NLABOR_PROFITS) + Number.parseFloat(response.P_NSALES_ESTATES) + Number.parseFloat(response.P_NINHERITANCE) + Number.parseFloat(response.P_NCANCELLATION_TERM_DEPOSITS) + Number.parseFloat(response.P_NOTHERS);

                    this.origin_fund_saving_percent = sum_origin_detail.toFixed(2);
                    this.origin_fund_spp_percent = (100 - Number.parseFloat(this.origin_fund_saving_percent)).toFixed(2);
                }
            }
        });

        // this.dstartdate = this.getStartDate();
        if(this.polizaEmitCab.DEFFECDATE != null && this.polizaEmitCab.DEFFECDATE != ""){
            // El valor de DEFFECDATE esta en formato mm/dd/yyyy, hay que convertirlo a dd/mm/yyyy
            let split_date_deffec = this.polizaEmitCab.DEFFECDATE.split('/');
            this.dstartdate = String(split_date_deffec[1]).padStart(2, '0') + "/" + String(split_date_deffec[0]).padStart(2, '0') + "/" + String(split_date_deffec[2]);
        } else {
            this.dstartdate = this.getStartDate();
        }
        // this.dstartdate = this.polizaEmitCab.DEFFECDATE != null && this.polizaEmitCab.DEFFECDATE != "" ? this.polizaEmitCab.DEFFECDATE : this.getStartDate();
        this.dexpirdat = await this.getExpirDate();
        this.dstartdate_ase = this.dstartdate;
        this.dexpirdat_ase = this.dexpirdat;


        await this.quotationService.GetAdditionalInformationPolicy(this.quotation_id, this.quotation.nid_proc).toPromise().then(res => {
            this.partial_rescue = res.Partial_rescue;
            this.rescue = res.Rescue;
            this.dps = res.Dps;

            this.cover_list = res.CoverList.map((item) => ({ ...item, Ncapital: CommonMethods.formatNUMBER(item.Ncapital) }));
        });

        await this.loadHistorialEvaluaciones();
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
                        this.riesgo_negativo_cont = !res.coincidenceRN ? 'NO' : 'SI';
                    }
                    else{
                        this.riesgo_negativo_insu = !res.coincidenceRN ? 'NO' : 'SI';
                    }

                    if(resRN.isError == 1) throw new Error('Error en getRegNegativo');

                    await this.vidaInversionService.InsUpdRegistroNegativo({
                        P_SCLIENT: sclientRN.P_SCLIENT,
                        P_NISREGNEG: resRN.coincidenceRN ? 1 : 0,
                        P_SUPDCLIENT: '0'
                    }).toPromise();
                } catch (error) {
                    if(client_type == 1){
                        this.riesgo_negativo_cont = '——';
                    } else{
                        this.riesgo_negativo_insu = '——';
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

    // INI VIGP-KAFG 13/03/2025
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow_benefeciarys = this.list_benefeciarys.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }
    // FIN VIGP-KAFG 13/03/2025

    getStartDate() {

        const today = new Date();
        today.setDate(today.getDate() + 1);

        return String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear();
    }

    async getExpirDate(): Promise<string> {

        const request = {
            Nid_cotizacion: this.quotation_id,
            Nidproc: this.quotation.nid_proc
        }
        const response = await this.quotationService.GetExpirDate(request).toPromise().then();
        return response.P_EXPIR_DATE_FORMATTED;
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

    async cargarDatosContractor(res: any, search_type: any) {

        const contracting_data = res.EListClient[0];

        let split_date = contracting_data.P_DBIRTHDAT.split('/');
        this.data_contractor.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_contractor.sclient = contracting_data.P_SCLIENT;

        if (this.data_contractor.type_document.Id == 4) {
            this.homologacionCont = "__";
        }else {
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

    async cargarDatosInsured(res: any, search_type: any) {
        const contracting_data = res.EListClient[0];
        this.data_insured.names = contracting_data.P_SFIRSTNAME;
        this.data_insured.last_name = contracting_data.P_SLASTNAME;
        this.data_insured.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_insured.sclient = contracting_data.P_SCLIENT;

        if (this.data_insured.type_document.Id == 4) {
            this.homologacionInsu = "__";
        }
        else {
            this.homologacionInsu = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025
        }

        // let split_date = contracting_data.P_DBIRTHDAT.split('/');
        // let format_birthday = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;
        if (contracting_data.P_DBIRTHDAT == null) {
            console.log("Fecha Nula");
        } else {
            let split_date = contracting_data.P_DBIRTHDAT.split('/');
            this.data_insured.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
        }
        this.data_insured.gender = { SSEXCLIEN: contracting_data.P_SSEXCLIEN,codigo: contracting_data.P_SSEXCLIEN};
        console.log("this.data_insured.gender: ", this.data_insured.gender)
        console.log("this.list_gender_contractor: ", this.list_gender_contractor)
        this.data_insured.civil_status = { NCIVILSTA: contracting_data.P_NCIVILSTA };

        this.data_insured.nationality = { NNATIONALITY: contracting_data.P_NNATIONALITY }; // VIGP-KAFG 13/03/2025

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

        console.log("data_insured: ", this.data_insured)
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
                        // await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                        //     async (res) => {
                        //         consultWorldCheck = {
                        //             P_SCLIENT: this.data_contractor.sclient,
                        //             P_NOTHERLIST: res.isOtherList ? 1 : 0,
                        //             P_NISPEP: res.isPep ? 1 : 0,
                        //             P_SUPDCLIENT: '0'
                        //         }

                        //         this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                        //         this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                        //         await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                        //     }
                        // );
                    } else {
                        if (consultWorldCheck.P_SUPDCLIENT == "1") {
                            // await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                            //     async (res) => {
                            //         consultWorldCheck = {
                            //             P_SCLIENT: this.data_contractor.sclient,
                            //             P_NOTHERLIST: res.isOtherList ? 1 : 0,
                            //             P_NISPEP: res.isPep ? 1 : 0,
                            //             P_SUPDCLIENT: '1'
                            //         }

                            //         this.world_check_contractor.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            //         this.world_check_contractor.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            //         await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                            //     }
                            // );
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
                        // await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                        //     async (res) => {
                        //         consultWorldCheck = {
                        //             P_SCLIENT: this.data_insured.sclient,
                        //             P_NOTHERLIST: res.isOtherList ? 1 : 0,
                        //             P_NISPEP: res.isPep ? 1 : 0,
                        //             P_SUPDCLIENT: '0'
                        //         }

                        //         this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                        //         this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                        //         await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                        //         this.isLoading = false;
                        //     }
                        // );
                    } else {
                        if (consultWorldCheck.P_SUPDCLIENT == "1") {
                            // await this.vidaInversionService.getWorldCheck(datosWorldCheck).toPromise().then(
                            //     async (res) => {
                            //         consultWorldCheck = {
                            //             P_SCLIENT: this.data_insured.sclient,
                            //             P_NOTHERLIST: res.isOtherList ? 1 : 0,
                            //             P_NISPEP: res.isPep ? 1 : 0,
                            //             P_SUPDCLIENT: '1'
                            //         }

                            //         this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            //         this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';

                            //         await this.vidaInversionService.InsUpdWorldCheck(consultWorldCheck).toPromise().then();
                            //     }
                            // );
                        } else {
                            this.world_check_insured.otherList = consultWorldCheck.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.world_check_insured.pep = consultWorldCheck.P_NISPEP == 1 ? 'SÍ' : 'NO';
                        }
                    }
                }
            );
        }
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

    async consultProspect(search_type) {
        // INI VIGP-KAFG 13/03/2025
        let params_cons = {
            P_NID_COTIZACION: this.quotation_id
        }
        // let params_cons = {
        //     P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
        //     P_NTYPE_CLIENT: search_type
        // };
        // await this.vidaInversionService.consultProspect(params_cons).toPromise().then(
        // FIN VIGP-KAFG 13/03/2025
        await this.vidaInversionService.searchByProspectQuotation(params_cons).toPromise().then( // VIGP-KAFG 13/03/2025
            async res => {
                // INI VIGP-KAFG 13/03/2025

                // this.check_input_value = res.P_NID_ASCON;
                this.check_input_value = res.NID_ASCON;
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
                    this.nregister_parentesco = this.data_insured.relation;
                // FIN VIGP-KAFG 13/03/2025
                    // Asegurado
                    const params_360 = {
                        P_TipOper: 'CON',
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
                                        await this.cargarDatosInsured(res, search_type);
                                        await this.invokeServiceExperia(2);
                                        await this.getWorldCheck(2);
                                        await this.getIdecon(2); // TEMP 070082025
                                        await this.getDataRegNegativoClient(2); /*VIGP 17112025*/
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

    // INI DVP VIGP 14-03-2025
    async getQuotationComments() {
        const request = {
          P_NID_COTIZACION: this.quotation_id,
          P_NID_PROC: this.quotation.nid_proc
        };
              
        await this.quotationService.GetCommentsCotiVIGP(request).toPromise().then(
          res => {
            if (res && res.C_TABLE && res.C_TABLE.length > 0) {
              // Mostrar solo los dos comentarios más recientes
              this.latestComments = res.C_TABLE.slice(0, 2);
            }
          },
          error => {
            console.error('Error al obtener comentarios:', error);
          }
        );
      }
    // FIN DVP VIGP 14-03-2025

    readFile = () => {
        let obj = {
            P_NID_COTIZACION: this.quotation_id
        };
        this.vidaInversionService.ReadDocumentsVIGP(obj).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    // this.filesList = res.P_DOCUMENTS.filter(x => x.P_DESCRI != 'otros');
                    this.filesList = res.P_DOCUMENTS.filter(x => x.P_FLAG == 7 || x.P_FLAG == 4 || x.P_FLAG == 2);
                }
            },
            error => {
                Swal.fire('Información', "Ha ocurrido un error al obtener los archivos.", 'error');
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


    GoToQuotationDefinitiveList() {
        this.router.navigate(['extranet/vida-inversion/consulta-cotizacion-definitiva']);
    }

    // INI DVP VIGP 14-03-2025
    async loadHistorialEvaluaciones() {
        const request = {
            NumeroCotizacion: this.quotation_id
        };
        
        try {
            const response = await this.vidaInversionService.GetHistorialEvaluaciones(request).toPromise();
            if (response && response.P_NCODE === 0) {
                // Ordenar registros del más reciente al más antiguo
                this.historialEvaluaciones = (response.Evaluaciones || []).sort((a, b) => {
                    return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
                });
            }
        } catch (error) {
            console.error('Error al cargar el historial de evaluaciones', error);
        }
    }
    //FIN DVP VIGP 14-03-2025   
}
