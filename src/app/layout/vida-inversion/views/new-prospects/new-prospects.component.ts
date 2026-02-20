import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { AddressService } from '../../../broker/services/shared/address.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { DataContractor } from '../../models/DataContractor';
import { DataInsured } from '../../models/DataInsured';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { QuotationService } from '../../../../layout/broker/services/quotation/quotation.service';


@Component({
    standalone: false,
    selector: 'app-new-prospects',
    templateUrl: './new-prospects.component.html',
    styleUrls: ['./new-prospects.component.scss']
})
export class NewProspectsComponent implements OnInit {

    CONSTANTS: any = VidaInversionConstants;
    cod_prod_channel: any;

    boolNumberCTR: boolean = false;
    boolNumberASG: boolean = false;
    boolEmailCTR: boolean = false;
    boolEmailASG: boolean = false;
    // @Input() public reference: any;
    @Input() check_input_value;

    contractor_province_department: any = false;
    contractor_province_selected: any = false;
    insured_province_department: any = false;
    insured_province_selected: any = false;

    show_guide: boolean = false;
    isLoading: boolean = false;

    list_data_contractor_department: any = [];
    list_data_contractor_province: any = [];
    list_data_contractor_district: any = [];

    list_data_insured_department: any = [];
    list_data_insured_province: any = [];
    list_data_insured_district: any = [];

    type_rol: any;
    new_client_contractor = false; // Indica si es cliente Ya se encuentra registrado en el 360 o no
    new_client_insured = false; // Indica si es cliente Ya se encuentra registrado en el 360 o no
    profile_id: any;
    cur_usr: any;
    GENDER_LIST: any[] = [];

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

    homologacionCont: string = "——";  // VIGP-KAFG 16/04/2025 
    homologacionInsu: string = "——";  // VIGP-KAFG 16/04/2025 

    /* DGC - VIGP PEP - 06/02/2024 - FIN */

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
        department: [],
        province: [],
        district: [],
        phone: "",
        email: "",
        address: "",
        idecon: 0, /*VIGP 17112025*/
        wc:0, /*VIGP 17112025*/

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
        department: [],
        province: [],
        district: [],
        phone: "",
        email: "",
        address: "",
        idecon: 0, /*VIGP 17112025*/
        wc:0, /*VIGP 17112025*/

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

    FL_ENABLE_PROSPECT : boolean = false;
    FL_DATA_QUALITY : boolean = false;

    riesgo_negativo_insu: string = "";  // VIGP-KAFG 26092025
    riesgo_negativo_cont: string = "";  // VIGP-KAFG 26092025

    constructor(private router: Router,
        public clientInformationService: ClientInformationService,
        public addressService: AddressService,
        private vidaInversionService: VidaInversionService,
        private parameterSettingsService: ParameterSettingsService,
        public quotationService: QuotationService,

    ) { }

    async ngOnInit() {

        this.isLoading = true;
        this.type_rol = '0';
        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);
        this.check_input_value = 1;
        this.isLoading = false;

        this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 
        this.homologacionInsu = "——";  // VIGP-KAFG 16/04/2025 

        this.clientInformationService.getGenderList()
            .subscribe((response: any[]) => {
                this.GENDER_LIST = response.filter(gender =>
                    gender.SSEXCLIEN === '1' || gender.SSEXCLIEN === '2'
                );
            });

        await this.getIsActiveDataQuality();
        
    }

    concat = (type) => {
        if (type == 1 && this.data_contractor.document_number.length < 8 && this.data_contractor.type_document.Id == 2) {
            let sust = 8 - this.data_contractor.document_number.length;
            let str: string = "";
            for (let i = 0; i < sust; i++) str += "0";
            this.data_contractor.document_number = str + this.data_contractor.document_number;
        }
        if (type == 2 && this.data_insured.document_number.length < 8 && this.data_insured.type_document.Id == 2) {
            let sust = 8 - this.data_insured.document_number.length;
            let str: string = "";
            for (let i = 0; i < sust; i++) str += "0";
            this.data_insured.document_number = str + this.data_insured.document_number;
        }
    }

    changeDocumentType(search_type: any) {

        if (search_type == 1) {
            this.data_contractor.document_number = "";
            this.resetOldProspectData();
            this.clearData(1)
            this.clearData(2)

            if(!this.FL_DATA_QUALITY) this.enableInputs(1);
            if(!this.FL_DATA_QUALITY) this.enableInputs(2);
        } else {
            this.data_insured.document_number = "";
            this.clearData(2)
            if(!this.FL_DATA_QUALITY) this.enableInputs(2);
        }
    }

    changeDocumentNumber(event, change_type: number) {
        if (change_type == 1) {
            if (this.data_contractor.type_document?.Id === 4) {
                this.data_contractor.document_number = event.toUpperCase();
            }
            this.resetOldProspectData();
            this.clearData(1);
            this.clearData(2);
            if(!this.FL_DATA_QUALITY) this.enableInputs(1);
            if(!this.FL_DATA_QUALITY) this.enableInputs(2);
            
        } else {
            if (this.data_insured.type_document?.Id === 4) {
                this.data_insured.document_number = event.toUpperCase();
            }
            this.clearData(2);
            if(!this.FL_DATA_QUALITY) this.enableInputs(2);
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

    search = async (search_type: any) => {
        
        // if(!this.FL_DATA_QUALITY) return;

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

        const request_validate_contractor = {
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_NTYPE_DOCUMENT: parseInt(this.data_contractor.type_document.Id),
            P_SUSERNAME: this.cur_usr.username,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_NIDUSER: this.cur_usr.id
        };

        this.isLoading = true;
        const response_validate_contractor = await this.vidaInversionService.validateClientProspect(request_validate_contractor).toPromise();
        this.isLoading = false;

        if (response_validate_contractor.P_NCODE == 1) {
            Swal.fire('Información', response_validate_contractor.P_SMESSAGE, 'error');
            this.clearData(search_type)
            if(!this.FL_DATA_QUALITY) this.enableInputs(search_type);
        }
        else {
            this.clickBuscar(search_type);
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

    validateInputs(type_reg: string): { isError: boolean; error_message_contract: string } {
        let isError = false;
        let error_message_contract = "";

        if (this[type_reg].type_document == '' || this[type_reg].type_document.codigo == '') {
            isError = true;
            error_message_contract += "Tipo de Documento no seleccionado. <br>";
        }
        if (this[type_reg].document_number == null || this[type_reg].document_number == '') {
            isError = true;
            error_message_contract += "Nro. Documento vacio. <br>";
        }
        if (this[type_reg].birthday_date == '') {
            isError = true;
            error_message_contract += "Fecha Nacimiento vacio. <br>";
        }
        if (this[type_reg].names == null || this[type_reg].names == '') {
            error_message_contract += "Nombres Incompletos. <br>";
            isError = true;
        }
        if (this[type_reg].last_name == null || this[type_reg].last_name == '') {
            error_message_contract += "Apellido Paterno Incompleto. <br>";
            isError = true;
        }

        if (this[type_reg].last_name2 == null || this[type_reg].last_name2 == '') {
            error_message_contract += "Apellido Materno Incompleto. <br>";
            isError = true;
        }

        if (this[type_reg].gender.codigo == '' || this[type_reg].gender.codigo == '') {
            isError = true;
            error_message_contract += "Sexo Incompleto. <br>";
        }

        return { isError, error_message_contract }
    }

    formatter_data_prospect() {

        const contractor_data = {
            P_NCHANNEL: "1000",
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_SCLIENT: this.data_contractor.sclient,
            P_NTYPE_DOCUMENT: this.data_contractor.type_document.Id,
            P_SNUMBER_DOCUMENT: this.data_contractor.document_number,
            P_SNAMES: this.data_contractor.names ? this.data_contractor.names.toUpperCase() : null,
            P_SLASTNAME: this.data_contractor.last_name ? this.data_contractor.last_name.toUpperCase() : null,
            P_SLASTNAME2: this.data_contractor.last_name2 ? this.data_contractor.last_name2.toUpperCase() : null,
            // P_DDATEBIRTHDAY: this.data_contractor.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_contractor.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_contractor.birthday_date.getFullYear(),
            P_DDATEBIRTHDAY: this.data_contractor.birthday_date ? this.data_contractor.birthday_date : null,
            P_NID_SEX: this.data_contractor.gender && this.data_contractor.gender.SSEXCLIEN != "" ? this.data_contractor.gender.SSEXCLIEN : null,
            P_NID_NATION: this.data_contractor.nationality.NNATIONALITY,
            P_SCELLPHONE: this.data_contractor.phone,
            P_SEMAIL: this.data_contractor.email,
            P_SADDRESS: this.data_contractor.address.toUpperCase(),
            P_NID_DPTO: this.data_contractor.department.Id,
            P_NID_PROV: this.data_contractor.province.Id,
            P_NID_DIST: this.data_contractor.district.Id,
            P_NID_ASCON: this.check_input_value, // 1 Si , 0 NO
            P_NREG_NEGATIVE: this.riesgo_negativo_cont == 'SI' ? 1 : 0, /*VIGP 17112025 */
            P_NIDECON: this.data_contractor.idecon, /*VIGP 17112025 */
            // P_WC: this.data_contractor.wc, /*VIGP 17112025 */
            P_WC: 0, /*VIGP 17112025 */
            P_NTYPE_CLIENT: 1,
            P_USER: this.cur_usr.id,
            P_SUSERNAME: this.cur_usr.username
        };

        const insured_data = {
            P_NCHANNEL: "1000",
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
            P_SCLIENT: this.data_insured.sclient,
            P_NTYPE_DOCUMENT: this.data_insured.type_document.Id,
            P_SNUMBER_DOCUMENT: this.data_insured.document_number,
            P_SNAMES: this.data_insured.names ? this.data_insured.names.toUpperCase() : null,
            P_SLASTNAME: this.data_insured.last_name ? this.data_insured.last_name.toUpperCase() : null,
            P_SLASTNAME2: this.data_insured.last_name2 ? this.data_insured.last_name2.toUpperCase() : null,
            // P_DDATEBIRTHDAY: this.data_insured.birthday_date ? this.data_insured?.birthday_date.getDate().toString().padStart(2, '0') + '/' + (this.data_insured?.birthday_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data_insured?.birthday_date.getFullYear() : '',
            P_DDATEBIRTHDAY: this.data_insured.birthday_date ? this.data_insured.birthday_date : null,
            P_NID_SEX: this.data_insured.gender ? this.data_insured.gender.SSEXCLIEN : null,
            P_NID_NATION: this.data_insured.nationality.NNATIONALITY,
            P_SCELLPHONE: this.data_insured.phone,
            P_SEMAIL: this.data_insured.email,
            P_SADDRESS: this.data_insured.address.toUpperCase(),
            P_NID_DPTO: this.data_insured.department.Id,
            P_NID_PROV: this.data_insured.province.Id,
            P_NID_DIST: this.data_insured.district.Id,
            P_NID_ASCON: this.check_input_value, // 1 Si , 0 NO
            P_NREG_NEGATIVE: this.riesgo_negativo_insu == 'SI' ? 1 : 0, /*VIGP 17112025 */
            P_NIDECON: this.data_insured.idecon,  /*VIGP 17112025 */
            // P_WC: this.data_insured.wc, /*VIGP 17112025 */
            P_WC: 0, /*VIGP 17112025 */
            P_NTYPE_CLIENT: 2,
            P_SRELATION: this.data_insured.relation.COD_ELEMENTO
        };

        let format_data = { contractor_data, insured_data };

        return format_data;
    }


    format_360(search_type) {
        // search_type 1 para Contratante 2 Para Contratatne y Asegurado

        let formatter_data_360 = {};

        if (search_type == 1) {

            let format_birthday = this.data_contractor.birthday_date.toLocaleDateString('es-ES');
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
                P_NUSERCODE: this.cur_usr.id
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
                        // P_TIPOPER: "",
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
                        // P_TIPOPER: "",
                        P_CLASS: ""
                    }]
                }
            }
        }
        else {

            let format_birthday = this.data_insured.birthday_date.toLocaleDateString('es-ES');

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
                        // P_TIPOPER: "",  // KAFG 06/02/2025
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
                        // P_TIPOPER: "",  // KAFG 06/02/2025
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
                        // P_TIPOPER: "", // KAFG 06/02/2025
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
                        // P_TIPOPER: "", // KAFG 06/02/2025
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
                        // P_TIPOPER: "", // KAFG 06/02/2025
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
                        // P_TIPOPER: "", // KAFG 06/02/2025
                        P_CLASS: ""
                    }]
                }

            }
        }
        return formatter_data_360;
    }

    formatterDataDirection(search_type) {
        let client_ubication;

        if (search_type == 1) {
            client_ubication = {
                P_NRECOWNER: "2",
                P_SRECTYPE: "2",
                P_NIDDOC_TYPE: this.data_contractor.type_document.Id.toString(),
                P_SIDDOC: this.data_contractor.document_number,
                P_NCOUNTRY: "1",
                P_NUSERCODE: this.cur_usr.id.toString(),
                P_NPROVINCE: this.data_contractor.department.Id ? this.data_contractor.department.Id.toString() : null,
                P_NLOCAL: this.data_contractor.province.Id ? this.data_contractor.province.Id.toString() : null,
                P_NMUNICIPALITY: this.data_contractor.district.Id ? this.data_contractor.district.Id.toString() : null,
                P_SREFERENCE: "REFERENCIAL",
                P_SNOM_DIRECCION: this.data_contractor.address,
                P_SORIGEN: "SCTRM",
            }
        } else if (search_type == 2) {

            client_ubication = {
                P_NRECOWNER: "2",
                P_SRECTYPE: "2",
                P_NIDDOC_TYPE: this.data_insured.type_document.Id.toString(),
                P_SIDDOC: this.data_insured.document_number,
                P_NCOUNTRY: "1",
                P_NUSERCODE: this.cur_usr.id.toString(),
                P_NPROVINCE: this.data_insured.department.Id ? this.data_insured.department.Id.toString() : null,
                P_NLOCAL: this.data_insured.province.Id ? this.data_insured.province.Id.toString() : null,
                P_NMUNICIPALITY: this.data_insured.district.Id ? this.data_insured.district.Id.toString() : null,
                P_SREFERENCE: "REFERENCIAL",
                P_SNOM_DIRECCION: this.data_insured.address,
                P_SORIGEN: "SCTRM",
            }
        }
        return client_ubication;
    }

    async insertUpdateExistingClient(update_client_360) {
        let response;
        await this.clientInformationService.getCliente360(update_client_360).toPromise().then((res) => {
            response = res;
            return response;
        })
        return response;
    }

    async insProspect(prospect_data) {
        let response;
        await this.vidaInversionService.insertProspect(prospect_data).toPromise().then((res) => {
            response = res;
            return response;
        })
        return response;
    }

    async insDirection(client_ubication) {
        let response;
        await this.vidaInversionService.saveDirection(client_ubication).toPromise().then((res) => {
            response = res;
            return response;
        })
        return response;
    }


    async createProspect() { 

        // INI Validaciones de campos obligatorios CONTRATANTE arjg         
        const { isError, error_message_contract } = this.validateInputs('data_contractor');

        if (isError) {
            Swal.fire('Información Contratista', error_message_contract, 'error');
            return;
        }
        // FIN Validaciones de campos obligatorios CONTRATANTE arjg 

        // INI Validaciones de campos obligatorios ASEGURADO arjg 
        if (this.check_input_value == 0) {

            const { isError: isError2, error_message_contract: error_message_contract2 } = this.validateInputs('data_insured');

            if (isError2) {
                Swal.fire('Información Asegurado', error_message_contract2, 'error');
                return;
            }
        }

        /*INI VIGP 17112025 */
        if (this.riesgo_negativo_cont == '') {
            await this.getDataRegNegativoClient(1); 
        }
        if (this.check_input_value == 0) {
            if (this.riesgo_negativo_insu == '') {
                await this.getDataRegNegativoClient(2); 
            }
        }
        const enOtasListas = this.validaProspectoObservado();
        console.log("enOtasListas", enOtasListas);
        /*FIN VIGP 17112025 */

        // return;
        
        let formatter_data = this.formatter_data_prospect();
        let prospect_data = [];

        if (this.check_input_value == 1) { // Solo Contratante

            Swal.fire({
                title: 'Confirmación',
                text: '¿Esta seguro que el contratante es igual al asegurado?',
                icon: 'warning',
                confirmButtonText: 'SI',
                cancelButtonText: 'NO',
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(async (result) => {
                
                if (result.isConfirmed) {

                    
                    Swal.fire({
                        title: 'Confirmación',
                        text: '¿Está seguro de que los datos ingresados son correctos?',
                        icon: 'warning',
                        confirmButtonText: 'SI',
                        cancelButtonText: 'NO',
                        showCancelButton: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then(async (result2) => {

                        
                        if(result2.isConfirmed){

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

                            let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor, this.idecon_contractor);

                            if (validate_error_contractor.cod_error === 1) {
                                Swal.fire('Información', validate_error_contractor.message_error, 'error');
                                return;
                            }

                            prospect_data.push(formatter_data.contractor_data);

                            // VALIDAMOS SI ES NUEVO CLIENTE O NO
                            console.log("this.new_client_contractor", this.new_client_contractor);
                            if (this.new_client_contractor) {

                                let ins_client_360 = this.formatter_insert_360(1); // Para enviar al 360
                                let insert_response_client360 = await this.insertUpdateExistingClient(ins_client_360);

                                if (insert_response_client360.P_NCODE == 1) {
                                    Swal.fire('Información', insert_response_client360.P_SMESSAGE, 'warning')
                                    return;
                                }

                                prospect_data[0].P_SCLIENT = insert_response_client360.P_SCOD_CLIENT.trim(); // Agregando Sclient del nuevo contratante

                                if (
                                    (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                                    (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                                    (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                                    (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                                ) { }

                                else {

                                    const contractor_ubication = this.formatterDataDirection(1); // Contratante
                                    const response_contractor_ubication = await this.insDirection(contractor_ubication);

                                    if (![0, 2].includes(response_contractor_ubication.P_NCODE)) {
                                        Swal.fire('Información', response_contractor_ubication.P_SMESSAGE, 'warning');
                                        return;
                                    }
                                }

                                let response_prospect = await this.insProspect(prospect_data);

                                if (response_prospect.P_NCODE == 1) {
                                    Swal.fire('Información', response_prospect.P_SMESSAGE, 'warning')
                                }
                                else {
                                    if(enOtasListas){
                                        await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                                    }else {
                                        await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success')
                                    }

                                    this.router.navigate(['extranet/vida-inversion/prospectos']); 
                                }
                                
                            }
                            else {

                                formatter_data = this.formatter_data_prospect(); // Obteniendo nuevamente el cliente por sitiene informacion pasada
                                prospect_data = [];

                                prospect_data.push(formatter_data.contractor_data);

                                // EL CONTRATANTE YA ESTA REGISTRADO EN EL 360
                                const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                                if (response_insert_prospect.P_NCODE == 1) {
                                    Swal.fire('Información', response_insert_prospect.P_SMESSAGE, 'error');
                                    return;
                                }
                                else {

                                    let update_client_360 = this.format_360(1); // Para enviar al 360

                                    const response_update_client_360 = await this.clientInformationService.getCliente360(update_client_360).toPromise();

                                    if (response_update_client_360.P_NCODE == 1) {
                                        Swal.fire('Información', response_update_client_360.P_SMESSAGE, 'warning')
                                    }

                                    // VALIDACION PARA ACTUALIZAR LA UBICACION DEL CONTRATANTE
                                    if (
                                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                                    ) {
                                        // No entra porque no hay datos de ubigeo
                                        if(enOtasListas){
                                            await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                                        }else {
                                            await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success');
                                        }
                                        this.router.navigate(['extranet/vida-inversion/prospectos']); 
                                        return;
                                    }
                                    else {

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
                                            P_SREFERENCE: "REFERENCIAL",
                                            P_SNOM_DIRECCION: this.data_contractor.address,
                                            P_SORIGEN: "SCTRM",
                                        }

                                        const response_contractor_ubication = await this.vidaInversionService.saveDirection(contractor_ubication).toPromise();

                                        if (response_contractor_ubication.P_NCODE == 0 || response_contractor_ubication.P_NCODE == 2) {

                                            Swal.fire('Información', "El prospecto se creó exitosamente.", 'success').then(result => { this.router.navigate(['extranet/vida-inversion/prospectos']); });
                                        }
                                        else {
                                            Swal.fire('Información', response_contractor_ubication.P_SMESSAGE, 'warning');
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
                else {
                    this.check_input_value = 0;
                    this.show_guide = true;
                    setTimeout(() => {
                        this.show_guide = false;
                    }, 5000);
                }
            })
        }
        else {

            // EXISTE CONTRATANTE Y ASEGURADO
            /* DGC - 17/01/2024 - INICIO */
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

            let validate_error_contractor = this.CONSTANTS.VALIDATE_CONTRACTOR(this.data_contractor, this.idecon_contractor);
            let validate_error_insured = this.CONSTANTS.VALIDATE_INSURED(this.data_insured, this.idecon_insured);

            if (validate_error_contractor.cod_error == 1 || validate_error_insured.cod_error == 1) {
                Swal.fire('Información', `${validate_error_contractor.message_error}${validate_error_insured.message_error}`, 'error');
                return;
            }

            prospect_data = []; //limpiando variable
            prospect_data.push(formatter_data.contractor_data);
            prospect_data.push(formatter_data.insured_data);

            if (this.new_client_contractor || this.new_client_insured) {

                // VALIDAMOS SI EL CONTRATANTE o el asegurado NO ESTAN REGISTRADOS
                // EL CONTRATANTE Y EL ASEGURADO SON NUEVOS
                if (this.new_client_contractor == true && this.new_client_insured == true) {

                    let ins_contractor_client_360 = this.formatter_insert_360(1); // Para enviar al 360
                    let insert_response_contractor_client360 = await this.insertUpdateExistingClient(ins_contractor_client_360);

                    if (insert_response_contractor_client360.P_NCODE == 1) {
                        Swal.fire('Información', insert_response_contractor_client360.P_SMESSAGE, 'warning');
                        return;
                    }

                    prospect_data[0].P_SCLIENT = insert_response_contractor_client360.P_SCOD_CLIENT.trim();

                    if (
                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                    ) { }
                    else {
                        const contractor_ubication = this.formatterDataDirection(1);// Contratante
                        const response_contractor_ubication = await this.insDirection(contractor_ubication);

                        if (![0, 2].includes(response_contractor_ubication.P_NCODE)) {
                            Swal.fire('Información', response_contractor_ubication.P_SMESSAGE, 'warning');
                            return;
                        }
                    }

                    // En este punto el Contratante y toda su Data ya se inserto, continuamos con el ASEGURADO
                    let ins_insured_client_360 = this.formatter_insert_360(2); // Para enviar al 360 Asegurado
                    let insert_response_insured_client360 = await this.insertUpdateExistingClient(ins_insured_client_360);

                    if (insert_response_insured_client360.P_NCODE == 1) {
                        Swal.fire('Información', insert_response_insured_client360.P_SMESSAGE, 'warning');
                        return;
                    }

                    prospect_data[1].P_SCLIENT = insert_response_insured_client360.P_SCOD_CLIENT.trim();

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) {
                        //
                    } else {

                        const insured_ubication = this.formatterDataDirection(2);// Asegurado
                        const response_insured_ubication = await this.insDirection(insured_ubication);

                        if (![0, 2].includes(response_insured_ubication.P_NCODE)) {
                            Swal.fire('Información', response_insured_ubication.P_SMESSAGE, 'warning');
                            return;
                        }

                    }

                    let response_prospect = await this.insProspect(prospect_data);

                    if (response_prospect.P_NCODE == 1) {
                        Swal.fire('Información', response_prospect.P_SMESSAGE, 'warning');
                        return;
                    }
                    else {
                        if(enOtasListas){
                            await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                        }else {
                            await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success')
                        }    

                        this.router.navigate(['extranet/vida-inversion/prospectos']);
                    }
                }
                // EL CONTRATANTE ES NUEVO, PERO EL ASEGURADO NO
                else if (this.new_client_contractor == true && this.new_client_insured == false) {

                    // Se insertar el contratante ; y al aseguro se le proce a llamar igualmente para actualizar el asegurado.
                    let ins_contractor_client_360 = this.formatter_insert_360(1); // Para enviar al 360
                    let insert_response_contractor_client360 = await this.insertUpdateExistingClient(ins_contractor_client_360);

                    if (insert_response_contractor_client360.P_NCODE == 1) {
                        Swal.fire('Información', insert_response_contractor_client360.P_SMESSAGE, 'warning');
                        return;
                    }

                    prospect_data[0].P_SCLIENT = insert_response_contractor_client360.P_SCOD_CLIENT.trim();
                    //if (this.data_contractor.address !== "" || this.data_contractor.department.Id != "0" || this.data_contractor.province.Id != "0" || this.data_contractor.district.Id != "0") {

                    if (
                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                    ) {
                        // no entra porque no hay datos de ubigeo
                    }

                    else {

                        const contractor_ubication = this.formatterDataDirection(1);// Contratante
                        const response_contractor_ubication = await this.insDirection(contractor_ubication);

                        if (![0, 2].includes(response_contractor_ubication.P_NCODE)) {
                            Swal.fire('Información', response_contractor_ubication.P_SMESSAGE, 'warning');
                            return;
                        }
                    }

                    //AQUI LLLAMAR AL CIENT PARA EL ASEUGRADO PARA QUE LO ACTUALIZE Y A ESE TAMBIEN CONSULTARLE POR SU DIRECCION
                    let update_insured_client_360 = this.format_360(2); // Para enviar al 360
                    let update_response_insured_client360 = await this.insertUpdateExistingClient(update_insured_client_360);
                    if (update_response_insured_client360.P_NCODE == 1) {
                        Swal.fire('Información', update_response_insured_client360.P_SMESSAGE, 'warning');
                        return;
                    }

                    prospect_data[1].P_SCLIENT = update_response_insured_client360.P_SCOD_CLIENT.trim();

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) {
                        //
                    }

                    else {

                        const insured_ubication = this.formatterDataDirection(2);// Asegurado
                        const response_insured_ubication = await this.insDirection(insured_ubication);

                        if (![0, 2].includes(response_insured_ubication.P_NCODE)) {
                            Swal.fire('Información', response_insured_ubication.P_SMESSAGE, 'warning');
                            return;
                        }
                    }

                    let response_prospect2 = await this.insProspect(prospect_data);

                    if (response_prospect2.P_NCODE == 1) {
                        Swal.fire('Información', response_prospect2.P_SMESSAGE, 'warning');
                        return;
                    }
                    else {
                        if(enOtasListas){
                            await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                        }else {
                            await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success');
                        }
                        this.router.navigate(['extranet/vida-inversion/prospectos']);
                    }
                }

                // EL CONTRATANTE NO ES NUEVO, PERO EL ASEGURADO SI
                else if (this.new_client_contractor == false && this.new_client_insured == true) {
                    // EL CONTRATANTE YA EXISTE, PERO EL ASEGURADO ES NUEVO
                    let update_contractor_client_360 = this.format_360(1); // Para enviar al 360
                    let update_response_contractor_client360 = await this.insertUpdateExistingClient(update_contractor_client_360);

                    if (update_response_contractor_client360.P_NCODE == 1) {
                        Swal.fire('Información', update_response_contractor_client360.P_SMESSAGE, 'warning');
                        return;
                    }

                    //if (this.data_contractor.address !== "" || this.data_contractor.department.Id != "0" || this.data_contractor.province.Id != "0" || this.data_contractor.district.Id != "0") {
                    if (
                        (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                        (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                        (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                        (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                    ) {
                        // no entra porque no hay datos de ubigeo
                    }
                    else {

                        const contractor_ubication2 = this.formatterDataDirection(1);// Contratante
                        const response_contractor_ubication2 = await this.insDirection(contractor_ubication2);

                        if (![0, 2].includes(response_contractor_ubication2.P_NCODE)) {
                            Swal.fire('Información', response_contractor_ubication2.P_SMESSAGE, 'warning');
                            return;
                        }
                    }

                    // YA SE ACTUALIZO LA DATA DEL CONTRATANTE, AHORA SE VA REGISTRAR EL ASEGURADO EN EL 360
                    let ins_insured_client_360 = this.formatter_insert_360(2); // Para enviar al 360
                    let insert_response_insured_client360 = await this.insertUpdateExistingClient(ins_insured_client_360);

                    if (insert_response_insured_client360.P_NCODE == 1) {
                        Swal.fire('Información', insert_response_insured_client360.P_SMESSAGE, 'warning');
                        return;
                    }
                    else {

                        prospect_data[1].P_SCLIENT = insert_response_insured_client360.P_SCOD_CLIENT.trim();
                        

                        //if (this.data_insured.address !== "" || this.data_insured.department.Id != "0" || this.data_insured.province.Id != "0" || this.data_insured.district.Id != "0") {
                        if (
                            (this.data_insured.address == "" || this.data_insured.address == null) &&
                            (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                            (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                            (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                        ) { }

                        else {

                            const insured_ubication3 = this.formatterDataDirection(2);// Asegurado
                            const response_insured_ubication3 = await this.insDirection(insured_ubication3);

                            if (![0, 2].includes(response_insured_ubication3.P_NCODE)) {
                                Swal.fire('Información', response_insured_ubication3.P_SMESSAGE, 'warning');
                                return;
                            }

                        }
                        // YA SE ACTUALIZO LA INFO DEl Contratante y se Inserto el Asegurado, ahora se crea prospectos.
                        let response_prospect3 = await this.insProspect(prospect_data);

                        if (response_prospect3.P_NCODE == 1) {
                            Swal.fire('Información', response_prospect3.P_SMESSAGE, 'warning');
                            return;
                        }
                        else {
                            if(enOtasListas){
                                await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                            }else {
                                await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success');
                            }
                            this.router.navigate(['extranet/vida-inversion/prospectos']);
                        }
                    }
                }
            }
            else {

                const response_insert_prospect = await this.vidaInversionService.insertProspect(prospect_data).toPromise();

                if (response_insert_prospect.P_NCODE == 1) {
                    Swal.fire('Información', response_insert_prospect.P_SMESSAGE, 'error');
                    return;
                }

                let update_client_360_contractor = this.format_360(1); // Para enviar al 360 Contratante
                let update_client_360_insured = this.format_360(2); // Para enviar al 360 Asegurado

                const response_update_client_360_contractor = await this.clientInformationService.getCliente360(update_client_360_contractor).toPromise();

                if (response_update_client_360_contractor.P_NCODE == 1) {
                    Swal.fire('Información', response_update_client_360_contractor.P_SMESSAGE, 'warning');
                    return;
                }

                if (
                    (this.data_contractor.address == "" || this.data_contractor.address == null) &&
                    (this.data_contractor.department.Id == undefined || this.data_contractor.department.Id == null) &&
                    (this.data_contractor.province.Id == undefined || this.data_contractor.province.Id == null) &&
                    (this.data_contractor.district.Id == undefined || this.data_contractor.district.Id == null)
                ) {

                    // no entra porque no hay datos de ubigeo
                    const response_update_client_360_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();

                    if (response_update_client_360_insured.P_NCODE == 1) {
                        Swal.fire('Información', response_update_client_360_insured.P_SMESSAGE, 'warning');
                        return;
                    }

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) {
                        if(enOtasListas){
                            await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                        }else {
                            await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success');
                        }
                        this.router.navigate(['extranet/vida-inversion/prospectos']);
                    }
                    else {

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
                            P_SREFERENCE: "REFERENCIAL",
                            P_SNOM_DIRECCION: this.data_insured.address,
                            P_SORIGEN: "SCTRM",
                        }

                        const response_insured_ubication = await this.vidaInversionService.saveDirection(insured_ubication).toPromise();

                        if (response_insured_ubication.P_NCODE == 0 || response_insured_ubication.P_NCODE == 2) {
                            // cod 2 No se enviaron datos nuevos para actualizar
                            if(enOtasListas){
                                await Swal.fire('Información', "Se creó el prospecto, para poder continuar con el proceso comunícate con área de Soporte Rentas, para mayor información", 'warning');
                            }else {
                                await Swal.fire('Información', "El prospecto se creó exitosamente.", 'success')
                            }
                            this.router.navigate(['extranet/vida-inversion/prospectos']);
                        }
                        else {
                            Swal.fire('Información', response_insured_ubication.P_SMESSAGE, 'warning');
                            return;
                        }
                    }

                }
                else {

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
                        P_SREFERENCE: "REFERENCIAL",
                        P_SNOM_DIRECCION: this.data_contractor.address,
                        P_SORIGEN: "SCTRM",
                    }

                    const response_contractor_ubication = await this.vidaInversionService.saveDirection(contractor_ubication).toPromise();


                    // if (response_contractor_ubication.P_NCODE == 0 || response_contractor_ubication.P_NCODE == 2) {
                    if (![0, 2].includes(response_contractor_ubication.P_NCODE)) {

                        Swal.fire('Información', response_contractor_ubication.P_SMESSAGE, 'warning');
                        return;
                    }

                    const response_update_client_360_insured = await this.clientInformationService.getCliente360(update_client_360_insured).toPromise();

                    if (response_update_client_360_insured.P_NCODE == 1) {
                        Swal.fire('Información', response_update_client_360_insured.P_SMESSAGE, 'warning');
                        return;
                    }

                    if (
                        (this.data_insured.address == "" || this.data_insured.address == null) &&
                        (this.data_insured.department.Id == undefined || this.data_insured.department.Id == null) &&
                        (this.data_insured.province.Id == undefined || this.data_insured.province.Id == null) &&
                        (this.data_insured.district.Id == undefined || this.data_insured.district.Id == null)
                    ) {
                        //
                        Swal.fire('Información', "El prospecto se creó exitosamente.", 'success').then(result => { this.router.navigate(['extranet/vida-inversion/prospectos']); });
                    } else {
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
                            P_SREFERENCE: "REFERENCIAL",
                            P_SNOM_DIRECCION: this.data_insured.address,
                            P_SORIGEN: "SCTRM",
                        }

                        const response_insured_ubication = await this.vidaInversionService.saveDirection(insured_ubication).toPromise();

                        if (response_insured_ubication.P_NCODE == 0 || response_insured_ubication.P_NCODE == 2) {
                            // cod 2 No se enviaron datos nuevos para actualizar
                            Swal.fire('Información', "El prospecto se creó exitosamente.", 'success').then(result => { this.router.navigate(['extranet/vida-inversion/prospectos']); });
                        }
                        else {
                            Swal.fire('Información', response_insured_ubication.P_SMESSAGE, 'warning')
                        }
                    }
                }

            }
        }
    }

    changeValue(value) {
        this.check_input_value = value;
        if (this.check_input_value == 0) {
            this.check_input_value = 0;
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
            this.data_insured.province = { Id: 0 };
        });
    }

    onSelectProvinceInsured() {

        this.insured_province_selected = true;
        this.list_data_insured_district = [];
        this.addressService.getDistrictList(this.data_insured?.province?.Id).toPromise().then(res => {
            this.list_data_insured_district = res;
            this.data_insured.district = { Id: null };
            this.data_insured.district = { Id: 0 };
        });
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

    async clickBuscar(search_type, l_relation = null) {
        const res = this.searchValidate(search_type);

        if (res.cod_error == "1") {
            Swal.fire('Información', res.message, 'error');
        }
        else {
            this.isLoading = true;
            let params_360;

            if (search_type == 1) {
                const documentNumber = this.data_contractor.type_document.Id === 4
                    ? this.data_contractor.document_number.toUpperCase()
                    : this.data_contractor.document_number;

                params_360 = {
                    P_TIPOPER: 'CON',
                    P_NUSERCODE: this.cur_usr.id,
                    P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                    P_SIDDOC: documentNumber,
                };
            } else {
                const documentNumber = this.data_insured.type_document.Id === 4
                    ? this.data_insured.document_number.toUpperCase()
                    : this.data_insured.document_number;

                params_360 = {
                    P_TIPOPER: 'CON',
                    P_NUSERCODE: this.cur_usr.id,
                    P_NIDDOC_TYPE: this.data_insured.type_document.Id,
                    P_SIDDOC: documentNumber,
                };
            }

            if(this.FL_DATA_QUALITY && params_360.P_NIDDOC_TYPE == 2){
                try {
                    const dataReniec = await this.clientInformationService.getClientReniec(params_360).toPromise();
                    if(dataReniec.P_NCODE == 1 || dataReniec.P_NCODE == null){
                        this.isLoading = false;
                        Swal.fire('Información', 'Ha ocurrido un error al comunicarnos con los servicios de RENIEC, comunicarse con TI.', 'error');
                        return;
                    }    
                } catch (error) {
                    console.log("Error al consultar RENIEC", error);
                    this.isLoading = false;
                    Swal.fire('Información', 'Ha ocurrido un error al comunicarnos con los servicios de RENIEC, comunicarse con TI.', 'error');
                    return ;
                }
                

            }

            await this.clientInformationService.getCliente360(params_360).toPromise().then(
                async res => {
                    if (res.P_NCODE === "0") {
                        if (res.EListClient[0].P_SCLIENT == null) {
                            // No se tiene registro el SCLIENT indicado
                        } else {
                            if (res.EListClient.length === 1) {
                                //if (res.EListClient[0].P_SIDDOC != null) {

                                res.EListClient[0].P_NHOMOLOG = await this.CONSTANTS.getStatusClientHomologation(this.clientInformationService,res.EListClient[0].P_SCLIENT);

                                if (res.EListClient[0].P_NHOMOLOG != 1 && params_360.P_NIDDOC_TYPE == 2 && this.FL_DATA_QUALITY) {
                                    if (search_type == 1) {
                                        this.data_contractor.document_number = "";
                                        this.data_contractor.type_document = { Id: 0 };
                                        this.clearData(1);
                                        if(!this.FL_DATA_QUALITY) this.enableInputs(1);
                                    } else {
                                        this.data_insured.document_number = "";
                                        this.data_insured.type_document = { Id: 0 };
                                        this.clearData(2);
                                        if(!this.FL_DATA_QUALITY) this.enableInputs(2);
                                    }
                                    this.isLoading = false;
                                    Swal.fire('Información', 'Los datos relacionados al documento en consulta no están homologados.', 'error');
                                } else {
                                    if (search_type == 1) {
                                        this.clearData(1);
                                        this.clearData(2);
                                        await this.cargarDatosContractor(res, search_type);
                                        this.data_contractor.nationality_disabled = true;
                                        this.data_contractor.civil_status_disabled = true;

                                        if(!this.FL_DATA_QUALITY) this.enableInputs(1,false);
                                        if(!this.FL_DATA_QUALITY) this.enableInputs(2),false;
                                        await this.consultProspect(search_type);
                                        await this.getDataIdeconClient(1); // TEMP 070082025
                                        await this.getDataRegNegativoClient(1);
                                    }
                                    else { // 2 Insured
                                        this.clearData(2);
                                        if (l_relation != null) this.data_insured.relation = { COD_ELEMENTO: l_relation, codigo: l_relation }
                                        await this.cargarDatosInsured(res, search_type);
                                        this.data_insured.nationality_disabled = true;
                                        this.data_insured.civil_status_disabled = true;
                                        if(!this.FL_DATA_QUALITY) this.enableInputs(2,false);
                                        await this.getDataIdeconClient(2); // TEMP 070082025
                                        await this.getDataRegNegativoClient(2);
                                    }
                                }


                                //}
                            }
                        }
                    }
                    else if (res.P_NCODE === "3") { // Se debe habilitar los campos para poder ingresar la Data y Crear el prospecto
                        if (params_360.P_NIDDOC_TYPE == 4) {
                            this.enableInputs(search_type); // VIGP-KAFG 16/04/2025
                            Swal.fire('Información', 'No se encontró información, ingresar manualmente los datos.', 'error');
                        } else {
                            // if (search_type == 1) {
                            //     this.data_contractor.document_number = "";
                            //     this.data_contractor.type_document = { Id: 0 };
                            // } else {
                            //     this.data_insured.document_number = "";
                            //     this.data_insured.type_document = { Id: 0 };
                            // }
                            Swal.fire('Información', 'No se encontró información.', 'error');
                            this.clearData(search_type);
                            if(!this.FL_DATA_QUALITY) this.enableInputs(search_type);
                        }
                        this.isLoading = false;
                    }
                    else {
                        this.clearData(search_type);
                        if(!this.FL_DATA_QUALITY) this.enableInputs(search_type);
                        this.isLoading = false;
                        Swal.fire('Información', res.P_SMESSAGE, 'error');
                    }
                }, error => {
                    this.isLoading = false;
                    Swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
                }
            )

            this.isLoading = false;

        }
    }

    async cargarDatosContractor(res: any, search_type: any) {
        const contracting_data = res.EListClient[0];

        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_contractor.sclient = contracting_data.P_SCLIENT;

        if (this.data_contractor.type_document.Id == 4) {  // VIGP-KAFG 21/04/2025
            this.homologacionCont = "__";   // VIGP-KAFG 21/04/2025 
        } else {   // VIGP-KAFG 21/04/2025
            this.homologacionCont = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025
        }   // VIGP-KAFG 21/04/2025

        if (contracting_data.P_DBIRTHDAT == null) {
            console.log("Fecha Nula");
        } else {
            let split_date = contracting_data.P_DBIRTHDAT.split('/');
            this.data_contractor.birthday_date = new Date(split_date[1] + '/' + split_date[0] + '/' + split_date[2]); //FECHA
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
        }
        else {
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

    /*INI VIGP 17112025 */
    async getDataRegNegativoClient(client_type: number) {
        let consultaRegNegativo = {
            TypeDocument: null,
            IdDocNumber: null,
            Name: null
        };

        let sclientRN = { P_SCLIENT: null }
    
        if(client_type == 1){

            sclientRN.P_SCLIENT = this.data_contractor.sclient;
            consultaRegNegativo = {
                TypeDocument: this.data_contractor.type_document.valor,
                IdDocNumber: this.data_contractor.document_number,
                Name: this.data_contractor.last_name + ' ' + this.data_contractor.last_name2 + ' ' + this.data_contractor.names
            }
        } else {
            sclientRN.P_SCLIENT = this.data_insured.sclient;
            consultaRegNegativo = {
                TypeDocument: this.data_insured.type_document.valor,
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
                    // Manejo de error en la consulta a getRegNegativo
                    this.isLoading = false;
                    await Swal.fire('Información', 'Ocurrió un problema al consultar el Servicio de Registro Negativo.', 'error');
                    this.isLoading = true;
                    if(client_type == 1){
                        this.riesgo_negativo_cont = 'NO';
                    }
                    else{
                        this.riesgo_negativo_insu = 'NO';
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
                        // Manejo de error en la consulta a getRegNegativo
                        this.isLoading = false;
                        await Swal.fire('Información', 'Ocurrió un problema al consultar el Servicio de Registro Negativo.', 'error');
                        this.isLoading = true;
                        if(client_type == 1){
                            this.riesgo_negativo_cont = 'NO';
                        }
                        else{
                            this.riesgo_negativo_insu = 'NO';
                        }
                    }

                } else {
                    if (client_type == 1) {
                        this.riesgo_negativo_cont = res.P_NOTHERLIST == 1 ? 'SI' : 'NO';
                    } else {
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
        let sclientIdecom = { P_SCLIENT: null }

        if (client_type == 1) {
            sclientIdecom.P_SCLIENT = this.data_contractor.sclient;
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
                        try{
                            const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise()
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

                            await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                        } catch (error) {
                            // Manejo de error en la consulta a getIdecon
                            this.isLoading = false;
                            await Swal.fire('Información', 'Ocurrió un problema al consultar Idecon.', 'error');
                            this.isLoading = true;
                            this.idecon_contractor.otherList = 'NO';
                            this.idecon_contractor.pep = 'NO';
                            this.idecon_contractor.famPep = 'NO';
                        }
                             
                    } else {
                        if (consultIdecom.P_SUPDCLIENT == "1") {

                            try{
                                const resIdecon = await this.vidaInversionService.getIdecon(datosIdecom).toPromise()
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

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                            } catch (error) {
                                // Manejo de error en la consulta a getIdecon
                                this.isLoading = false;
                                await Swal.fire('Información', 'Ocurrió un problema al consultar Idecon.', 'error');
                                this.isLoading = true;
                                this.idecon_contractor.otherList = 'NO';
                                this.idecon_contractor.pep = 'NO';
                                this.idecon_contractor.famPep = 'NO';

                            }   
                        } else {
                            this.idecon_contractor.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_contractor.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';
                            // this.isLoading = false;
                        }
                    }
                }
            );
        } else {
            sclientIdecom.P_SCLIENT = this.data_insured.sclient;
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

                            await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                        } catch (error) {
                            this.isLoading = false;
                            // Manejo de error en la consulta a getIdecon
                            await Swal.fire('Información', 'Ocurrió un problema al consultar Idecon.', 'error');
                            this.isLoading = true;
                            this.idecon_insured.otherList = 'NO';
                            this.idecon_insured.pep = 'NO';
                            this.idecon_insured.famPep = 'NO';
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

                                await this.vidaInversionService.InsUpdIdecom(consultIdecom).toPromise().then();
                                    // this.isLoading = false;
                            } catch (error) {
                                this.isLoading = false;
                                // Manejo de error en la consulta a getIdecon
                                await Swal.fire('Información', 'Ocurrió un problema al consultar Idecon.', 'error');
                                this.isLoading = true;
                                this.idecon_insured.otherList = 'NO';
                                this.idecon_insured.pep = 'NO';
                                this.idecon_insured.famPep = 'NO';
                            }

                        } else {
                            this.idecon_insured.otherList = consultIdecom.P_NOTHERLIST == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.pep = consultIdecom.P_NISPEP == 1 ? 'SÍ' : 'NO';
                            this.idecon_insured.famPep = consultIdecom.P_NISFAMPEP == 1 ? 'SÍ' : 'NO';
                            // this.isLoading = false;
                        }
                    }
                }
            );
        }

        if(client_type == 1){
            this.data_contractor.idecon = consultIdecom.P_NOTHERLIST;
        }else{
            this.data_insured.idecon = consultIdecom.P_NOTHERLIST;
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

                /*INI VIGP 17112025 */
                this.old_prospect_data.P_NTYPE_DOCUMENT_CONT = res.P_NTYPE_DOCUMENT_CONT;
                this.old_prospect_data.P_SNUMBER_DOCUMENT_CONT = res.P_SNUMBER_DOCUMENT_CONT == "null" ? null : res.P_SNUMBER_DOCUMENT_CONT;
                this.old_prospect_data.P_NTYPE_DOCUMENT_INSU = res.P_NTYPE_DOCUMENT;
                this.old_prospect_data.P_SNUMBER_DOCUMENT_INSURED = res.P_SNUMBER_DOCUMENT_INSURED == "null" ? null : res.P_SNUMBER_DOCUMENT_INSURED;
                this.old_prospect_data.P_NID_ASCON = res.P_NID_ASCON;
                this.old_prospect_data.P_NRIESGON_CONT = res.P_NRIESGON_CONT;
                this.old_prospect_data.P_NIDECON_CONT = res.P_NIDECON_CONT;
                this.old_prospect_data.P_WCHECK_CONT = res.P_WCHECK_CONT;
                this.old_prospect_data.P_NESTADO_RIESGON_CONT = res.P_NESTADO_RIESGON_CONT;
                this.old_prospect_data.P_NID_ASCON = res.P_NID_ASCON;
                this.old_prospect_data.P_NRIESGON_INSU = res.P_NRIESGON_INSU;
                this.old_prospect_data.P_NIDECON_INSU = res.P_NIDECON_INSU;
                this.old_prospect_data.P_WCHECK_INSU = res.P_WCHECK_INSU;
                this.old_prospect_data.P_NESTADO_RIESGON_INSU = res.P_NESTADO_RIESGON_INSU;
                /*INI VIGP 17112025 */

                if (this.check_input_value == 0) {
                    this.data_insured.type_document = { Id: res.P_NTYPE_DOCUMENT };
                    this.data_insured.document_number = res.P_SNUMBER_DOCUMENT_INSURED.trim();
                    this.data_insured.relation = { COD_ELEMENTO: res.P_SRELATION }
                    // this.clickBuscar(search_type);//
                    this.clickBuscar(2, res.P_SRELATION);// Buscar Asegurado
                }
            }, error => {
                this.isLoading = false;
                Swal.fire('Información', 'Ocurrió un problema al solicitar su petición.', 'error');
            }
        )
    };

    /*INI VIGP 17112025*/
    validaProspectoObservado(){
        // El prospecto si existe
        if(this.old_prospect_data.P_SNUMBER_DOCUMENT_CONT != null && this.old_prospect_data.P_SNUMBER_DOCUMENT_CONT != ""){
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
            if([rn_cont,idecon_cont,wcheck_cont].includes(1) && [0,2].includes(estado_rn_cont)){
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
                        if([rn_insu,idecon_insu,wcheck_insu].includes(1) && [0,2].includes(estado_rn_insu)) return true;
                        else return false;
                    }else {
                        console.log("validacion D...");
                        if(this.riesgo_negativo_insu == 'SI' || this.idecon_insured.otherList == 'SÍ') return true;
                        else return false;
                    }
                }
            }

            // El contratante es diferente del asegurado
            if(this.check_input_value == 0){
                if(this.riesgo_negativo_insu == 'SI' || this.idecon_insured.otherList == 'SÍ') return true;
                else return false;
            }
            // El contratante es igual al asegurado
            else return false;
        }
        // El prospecto no existe
        else{
            console.log('validacion E...');
            console.log('this.riesgo_negativo_cont', this.riesgo_negativo_cont);
            console.log('this.idecon_contractor.otherList', this.idecon_contractor.otherList);
            console.log('this.check_input_value', this.check_input_value);
            // El contratante es igual al asegurado y se encuentra observado
            if(this.riesgo_negativo_cont == 'SI' || this.idecon_contractor.otherList == 'SÍ') return true;

            
            if(this.check_input_value == 1) return false; // el contratante es igual al asegurado
            else {
                // El contratante es diferente del asegurado y el asegurado se encuentra observado
                if(this.riesgo_negativo_insu == 'SI' || this.idecon_insured.otherList == 'SÍ') return true;
                else return false;
            }
            
        }
    }
    /*FIN VIGP 17112025*/

    async cargarDatosInsured(res: any, search_type: any) {

        const contracting_data = res.EListClient[0];
        this.data_insured.names = contracting_data.P_SFIRSTNAME;
        this.data_insured.last_name = contracting_data.P_SLASTNAME;
        this.data_insured.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_insured.sclient = contracting_data.P_SCLIENT;

        if (this.data_insured.type_document.Id == 4) {  // VIGP-KAFG 21/04/2025 
            this.homologacionInsu = "__";  // VIGP-KAFG 21/04/2025 
        } else {  // VIGP-KAFG 21/04/2025 
            this.homologacionInsu = contracting_data.P_NHOMOLOG == 1 ? "SI" : "NO";  // VIGP-KAFG 16/04/2025 
        }  // VIGP-KAFG 21/04/2025 
        //this.data_insured.relation = { COD_ELEMENTO: 0 }

        if (contracting_data.P_DBIRTHDAT == null) {
            console.log("Fecha Nula");
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
    };

    async setDepartmentContractor(id: any) {
        await this.addressService.getDepartmentList().toPromise().then(res => {
            this.list_data_contractor_department = res;
            this.data_contractor.department = { Id: id }
        })
    };

    async setProvinceContractor(department_id, province_id) {
        await this.addressService.getProvinceList(department_id).toPromise().then(async res => {
            this.list_data_contractor_province = res;
            this.data_contractor.province = { Id: province_id };
        })
    };

    async setDistrictContractor(province_id, municipality_id) {
        await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
            this.list_data_contractor_district = res;
            this.data_contractor.district = { Id: parseInt(municipality_id) }
        });
    };

    async setDepartmentInsured(id: any) {
        await this.addressService.getDepartmentList().toPromise().then(res => {
            this.list_data_insured_department = res;
            this.data_insured.department = { Id: id }
        })
    };

    async setProvinceInsured(department_id, province_id) {
        await this.addressService.getProvinceList(department_id).toPromise().then(async res => {
            this.list_data_insured_province = res;
            this.data_insured.province = { Id: province_id };
        })
    };

    async setDistrictInsured(province_id, municipality_id) {
        await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
            this.list_data_insured_district = res;
            this.data_insured.district = { Id: parseInt(municipality_id) }
        })
    };

    async getIsActiveDataQuality(){
        const data = await this.vidaInversionService.getIsActiveDataQuality("71").toPromise();
        if(data == 1) this.FL_DATA_QUALITY = true;
        else {
            this.FL_DATA_QUALITY = false;
            this.enableInputs(1);
        }
    }

    resetOldProspectData(){
        this.old_prospect_data = {
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
    }

    clearData(type: any) {

        if (type == 1) {// Contratante
            // this.data_contractor.document_number = "";
            // this.data_contractor.type_document = "";
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
            if (this.data_contractor.idecon != 0) this.data_contractor.idecon = 0;
            this.riesgo_negativo_cont = ''; // VIGP 17112025

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
            // this.list_data_contractor_department = [];
            this.homologacionCont = "——";  // VIGP-KAFG 16/04/2025 

        } else if (type == 2) { // Asegurado
            // this.data_insured.document_number = "";
            // this.data_insured.type_document = "";
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
            if (this.data_insured.idecon != 0) this.data_insured.idecon = 0;
            this.riesgo_negativo_insu = ''; // VIGP 17112025

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
            // this.list_data_insured_department = [];
            this.homologacionInsu = "——"; // VIGP-KAFG 16/04/2025 
        }
    };


    enableInputs(search_type: any, isReset : boolean = true) { // Cuando el 360 no llama Info

        if (search_type == 1) {// Contratante

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

            if(this.list_data_contractor_department.length ==0){
                this.addressService.getDepartmentList().toPromise().then(res => {
                    this.list_data_contractor_department = res;
                    this.data_contractor.department = { Id: null }
                    this.list_data_contractor_province = [];
                    this.data_contractor.province = { Id: null }
                    this.list_data_contractor_district = [];
                    this.data_contractor.district = { Id: null }
                });
            }

            this.new_client_contractor = true; // Indicamos que el cliente va ser nuevo

        } else if (search_type == 2) { // Asegurado
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

            if(this.list_data_insured_department.length ==0){
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

            this.new_client_insured = true;  // Indicamos que el cliente va ser nuevo
        }
    };





}