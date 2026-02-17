import { Injectable } from '@angular/core';
import { CommonMethods } from '../broker/components/common-methods';
import moment from 'moment';
import { ParameterSettingsService } from '../broker/services/maintenance/parameter-settings.service';
import { ClientInformationService } from '../broker/services/shared/client-information.service';
import { VidaInversionService } from './services/vida-inversion.service';

@Injectable()
export class VidaInversionConstants {

    public static REGEX: any = {
        PORCENTAJE: /^((100(\.0{1,2})?)|(\d{1,2}([\\.]{0,1})+(\.\d{1,6})?))$/,
        NUMBER: /^[0-9]+$/,
        NUMBER_: /^[1-9][0-9]*$/,
        HUNDREDS_NUMBER: /^[0-9,]+$/,
        DECIMAL: /^\d*\.?\d{0,2}$/,
        '1': /^[0-9]{1,11}$/, // RUC
        '2': /^[0-9]{1,8}$/, // DNI
        '4': /^[0-9A-Za-z]{1,12}$/, // CARNET DE EXTRANJERIA
        DOCUMENTO_DEFAULT: /^[0-9A-Za-z]{1,15}$/, // PASAPORTE
        ALFANUMERICO: /^[A-Za-z0-9\s]+$/,
        LEGALNAME: /^[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#'. ]+$/,
        LETRAS: /^[A-Za-zÑñ'\s]+$/,
        CORREO: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        CELULAR: /^9\d{8}$/,
        RANGO_1_100_DECIMAL: /^(100(\.0{0,2})?|([1-9][0-9]?)(\.\d{0,2})?)$/

    };

    public static MAXLENGTH: any = {
        '1': 11, // RUC
        '2': 8, // DNI
        '4': 12, // CARNET DE EXTRANJERIA
        '6': 12, // PASAPORTE

    };

    public static MINLENGTH: any = {
        '1': 11, // RUC
        '2': 8, // DNI
        '4': 8, // CARNET DE EXTRANJERIA
        '6': 8, // PASAPORTE
    };

    public static TIPO_RESPUESTA: any = {
        EXITOSO: '0',
        ERROR: '1',
        SUNAT_ERROR: '3'
    };

    public static TIPO_DOCUMENTO: any = {
        RUC: 1,
        DNI: 2
    };

    public static RAMO: any = 71;
    public static RAMO_DESC: any = "VIDA INDIVIDUAL DE LARGO PLAZO";

    public static COD_PRODUCTO: any = 6;
    public static COD_CHA_PRODUCTO: any = 18;
    public static DESC_PRODUCTO: string = "VIDA INVERSIÓN GLOBAL PROTECTA";

    public static PLANMAESTRO: any = "1";

    public static CERTYPE: any = 3;

    public static EMISIONDIRECTA: any = "S";
    public static WITHOUT_PARAMS: any = "521";

    PUBLIC

    public static PERFIL: any = {
        ADMIN: "5",
        TECNICA: "137",
        COMERCIAl: "7",
        OPERACIONES: "136",
        EXTERNO: "134",
    };

    public static ESTADO: any = {
        APROBADO: '2',
        APROBADO_TECNICA: '13',
        RECHAZADO: '3',
        NO_PROCEDE: '11',
    };

    public static TRANSACTION_CODE: any = {
        COTIZACION: 0,
        EMISION: 1,
        INCLUSION: 2,
        EXCLUSION: 3,
        RENOVACION: 4,
        ANULACION: 7,
        ENDOSAR: 8
    };

    public static USUARIO_OK: any = 0;
    public static USUARIO_BLOQUEADO: any = 1;
    public static USUARIO_PRIVILEGIOS: any = 2;

    public static TIPO_PERSONA: any = {
        NATURAL: 'PN',
        JURIDICA: 'PJ'
    };

    public static TIPOS_PERSONA: any = [
        { codigo: VidaInversionConstants.TIPO_PERSONA.NATURAL, valor: 'Persona natural' },
        { codigo: VidaInversionConstants.TIPO_PERSONA.JURIDICA, valor: 'Persona jurídica' },
    ];

    public static TIPO_CUENTA: any = {
        '1': 'Gobierno', GOBIERNO: '1',
        '2': 'Privado', PRIVADO: '2'
    };

    public static TIPO_POLIZA: any = {
        '1': 'Individual', INDIVIDUAL: '1',
        '2': 'Grupal', GRUPAL: '2'
    };

    public static TIPO_MONEDA: any = {
        SOLES: 1,
    };


    public static MODO_VISTA: any = {
        COTIZAR: '',
        VISUALIZAR: 'Visualizar',
        EVALUAR: 'Evaluar',
        AUTORIZAR: 'Autorizar',
        EMITIR: 'Emitir',
        EMITIRR: 'EmitirR',
        RENOVAR: 'Renovar',
        POLIZARENOVAR: 'RenovarPoliza',
        INCLUIR: 'Incluir',
        POLIZAINCLUIR: 'InclusionPoliza',
        EXCLUIR: 'Excluir',
        ENDOSO: 'Endoso',
        ANULACION: 'Anulacion'

    };

    public static FLAG_TRAMA: any = {
        SIN_TRAMA: 0
    };

    public static NRO_TRANSACCTION: any = {
        VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4], ['RenovarPoliza', 4], ['InclusionPoliza', 2], ['Incluir', 2], ['Excluir', 3],
        ['Endoso', 8], ['Anulacion', 7]]

    };

    public static VISTA_FORMA_PAGO: any = {
        VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4], ['Incluir', 2]]
    };

    public static TRX_PENDIENTES: any = {
        VISTAS: [['Emisión', 1], ['Renovación', 4], ['Declaración', 4], ['Inclusión', 2]]
    };

    public static PAGO_ELEGIDO: any = {
        VOUCHER: 'voucher',
        DIRECTO: 'directo',
        EFECTIVO: 'efectivo',
        OMITIR: 'omitir'
    };

    public static BLOCKED_NATIONALITIES: any = [49]; // estados unidos

    // Validaciones para Contratante básicas
    public static VALIDATE_CONTRACTOR(data_contractor): any {

        let diaActualNoFormat = moment(new Date()).toDate();
        let diaActual = new Date(diaActualNoFormat.getFullYear(), diaActualNoFormat.getMonth(), diaActualNoFormat.getDate());
        let diaMinus18 = moment(diaActual).subtract(18, 'years').toDate();

        let response = { cod_error: 0, message_error: "" }

        if (data_contractor.type_document.codigo == "") {
            response.message_error += 'Es obligatorio seleccionar el tipo de Documento para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.document_number == "") {
            response.message_error += 'Debe ingresar el número de documento del contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.birthday_date == "") {
            response.message_error += 'Fecha de nacimiento vacia para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.birthday_date > diaMinus18) {
            response.message_error += 'El contratante no puede ser menor de edad. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.names == "") {
            response.message_error += 'Debe ingresar un nombre para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.last_name == "") {
            response.message_error += 'Debe ingresar un apellido paterno para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.last_name2 == "") {
            response.message_error += 'Debe ingresar un apellido materno para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.gender == "") {
            response.message_error += 'Debe elegir un sexo para el contratante. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.email !== "" && !data_contractor.email.match(this.REGEX.CORREO)) {
            response.message_error += 'El correo del contratante es inválido. <br>';
            response.cod_error = 1;
        }

        if (data_contractor.phone !== "" && !data_contractor.phone.match(this.REGEX.CELULAR)) {
            response.message_error += 'El celular del contratante es inválido. <br>';
            response.cod_error = 1;
        }

        /* INI VALIDACIÓN NACIONALIDAD EEUU */
        if (VidaInversionConstants.BLOCKED_NATIONALITIES.includes(data_contractor.nationality?.NNATIONALITY)) {
            response.message_error += 'El contratante no puede ser de nacionalidad estadounidense. <br>';
            response.cod_error = 1;
        }
        /* FIN VALIDACIÓN NACIONALIDAD EEUU */

        return response;
    }

    // Validaciones para Asegurado básicas
    public static VALIDATE_INSURED(data_insured): any {

        let diaActualNoFormat = moment(new Date()).toDate();
        let diaActual = new Date(diaActualNoFormat.getFullYear(), diaActualNoFormat.getMonth(), diaActualNoFormat.getDate());
        let diaMinus18 = moment(diaActual).subtract(18, 'years').toDate();

        let response = { cod_error: 0, message_error: "" }

        if (data_insured.type_document.codigo == "") {
            response.message_error += 'Es obligatorio seleccionar el tipo de documento para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.document_number == "") {
            response.message_error += 'Se debe ingresar el número de documento del asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.birthday_date == "") {
            response.message_error += 'Fecha de nacimiento vacia para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.birthday_date > diaMinus18) {
            response.message_error += 'El asegurado no puede ser menor de edad. <br>';
            response.cod_error = 1;
        }

        if (data_insured.names == "") {
            response.message_error += 'Debe ingresar un nombre para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.last_name == "") {
            response.message_error += 'Debe ingresar un apellido paterno para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.last_name2 == "") {
            response.message_error += 'Debe ingresar un apellido materno para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.gender == "") {
            response.message_error += 'Debe elegir un sexo para el asegurado. <br>';
            response.cod_error = 1;
        }

        if (data_insured.email !== "" && !data_insured.email.match(this.REGEX.CORREO)) {
            response.message_error += 'El correo del asegurado es inválido. <br>';
            response.cod_error = 1;
        }

        if (data_insured.phone !== "" && !data_insured.phone.match(this.REGEX.CELULAR)) {
            response.message_error += 'El celular del asegurado es inválido. <br>';
            response.cod_error = 1;
        }

        if (data_insured.relation.codigo == '') {
            console.log("Parentesco Incompleto");
            response.message_error += 'Parentesco Incompleto. <br>';
            response.cod_error = 1;
        }


        /* INI VALIDACIÓN NACIONALIDAD EEUU */
        if (VidaInversionConstants.BLOCKED_NATIONALITIES.includes(data_insured.nationality?.NNATIONALITY)) {
            response.message_error += 'El asegurado no puede ser de nacionalidad estadounidense. <br>';
            response.cod_error = 1;
        }
        /* FIN VALIDACIÓN NACIONALIDAD EEUU */

        return response;
    }

    public static changeStyleCredit(amount_to_parse) {

        const response = { parse_amount: "", amount: "" }
        let format_amount = parseInt(amount_to_parse.replace(/,/g, ''));

        response.parse_amount = CommonMethods.formatNUMBER(format_amount);
        response.amount = response.parse_amount;

        if (response.amount.toUpperCase() == "NAN") {
            response.amount = '';
        }

        return response;
        // this.parse_amount = CommonMethods.formatNUMBER(format_amount);
        // this.work.salary = this.parse_amount;

        // if (this.work.salary.toUpperCase() == "NAN") {
        //     this.work.salary = '';
        // }
    }

    public static async GET_PROFILE_PRODUCT(parameterSettingsService: ParameterSettingsService, cod_prod_profile: any) {
        let profile = 0;
        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = cod_prod_profile;
        await parameterSettingsService.getProfileProduct(_data).toPromise().then(
            (res) => {
                profile = res;
            },
            err => {
                console.log(err)
            }
        );
        return profile;
    }

    public static VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_CONTRACTOR(check_input_nationality) {

        let response = { cod_error: 0, message_error: "" }

        if (check_input_nationality == 1) {
            response.message_error += 'El contratante no puede ser de nacionalidad estadounidense (datos complementarios). <br>';
            response.cod_error = 1;
        }
        return response;
    }

    public static VALIDATE_NATIONALITY_DATA_COMPLEMENTARY_INSURED(check_input_nationality) {

        let response = { cod_error: 0, message_error: "" }

        if (check_input_nationality == 1) {
            response.message_error += 'El asegurado no puede ser de nacionalidad estadounidense (datos complementarios). <br>';
            response.cod_error = 1;
        }
        return response;

    }

    public static async getStatusClientHomologation(clientInformationService: ClientInformationService, Sclient) {
        // const request_source = { Sclient: res.EListClient[0].P_SCLIENT }
        const request_source = { Sclient }
        const response_source = await clientInformationService.getSourceXClient(request_source).toPromise();
        // response_source el codigo 0 indica que esta homologado y cod 1 indica que hay un error 

        if (response_source.p_NCODE == 0) {
            return 1;
        } else {
            return 0
        }
    }

    public static async getIsActiveDataQuality(vidaInversionService: VidaInversionService) {
        const data = await vidaInversionService.getIsActiveDataQuality(this.RAMO.toString()).toPromise();
        if (data == 1) return true;
        else { return false; }
    }

}