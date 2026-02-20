import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ClientInformationService } from "../../../broker/services/shared/client-information.service";
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { DataContractor } from '../../models/DataContractor';
import { AddressService } from '../../../broker/services/shared/address.service';
import Swal from 'sweetalert2';
import { DataInsured } from '../../models/DataInsured';
import { DataBeneficiary } from '../../models/DataBeneficiary';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { PolicyemitService } from '../../../broker/services/policy/policyemit.service';
import { Console } from 'console';

@Component({
    standalone: false,
    selector: 'panel-endoso',
    templateUrl: './panel-endoso.component.html',
    styleUrls: ['./panel-endoso.component.css'],
})
export class PanelEndosoComponent implements OnInit {

    @Input() public reference: any;
    CONSTANTS: any = VidaInversionConstants;
    // beneficiariesList:any = [];
    beneficiariesListBD: any = [];
    toggle_edit_beneficiary: boolean;
    toggle_add_beneficiary: boolean;
    list_endoso_type: any = [];
    endoso_type: any;
    transaccionProtecta: any;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    item_id: any;
    myFormData: FormData = new FormData();
    params: any;
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    cotizacionID: string = '';
    percentage_participation: number;

    contractor_province_department: any = false;
    contractor_province_selected: any = false;
    insured_province_department: any = false;
    insured_province_selected: any = false;

    list_data_contractor_department: any = [];
    list_data_contractor_province: any = [];
    list_data_contractor_district: any = [];

    list_data_insured_department: any = [];
    list_data_insured_province: any = [];
    list_data_insured_district: any = [];


    list_data_beneficiary_department: any = [];
    list_data_beneficiary_province: any = [];
    list_data_beneficiary_district: any = [];

    boolNumberCTR: boolean = false;
    boolNumberASG: boolean = false;
    boolEmailCTR: boolean = false;
    boolEmailASG: boolean = false;
    boolNumberBNF: boolean = false;
    boolEmailBNF: boolean = false;

    isLoading: boolean = false;

    data_contractor: DataContractor = {
        sclient: "",
        type_document: "",
        document_number: "",
        nationality: "",
        names: "",
        last_name: "",
        last_name2: "",
        birthday_date: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        province: "",
        district: "",

        type_document_disabled: true,
        document_number_disabled: true,
        birthday_date_disabled: true,
        names_disabled: true,
        last_name_disabled: true,
        last_name2_disabled: true,
        gender_disabled: true,
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
        nationality: "",
        department: [],
        province: [],
        district: [],
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
        nationality_disabled: true,
        department_disabled: false,
        province_disabled: false,
        district_disabled: false,
        phone_disabled: false,
        email_disabled: false,
        address_disabled: false,
    };
    data_beneficiary: DataBeneficiary = {
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
        relation: "",
        assignment: "",

        type_document_disabled: false,
        document_number_disabled: false,
        birthday_date_disabled: false,
        names_disabled: false,
        last_name_disabled: false,
        last_name2_disabled: false,
        gender_disabled: false,
        civil_status_disabled: false,
        nationality_disabled: false,
        department_disabled: false,
        province_disabled: false,
        district_disabled: false,
        phone_disabled: false,
        email_disabled: false,
        address_disabled: false,
        relation_disabled: false
    };

    constructor(public clientInformationService: ClientInformationService,
        public addressService: AddressService,
        private quotationService: QuotationService,
        private policyemit: PolicyemitService,
        private parameterSettingsService: ParameterSettingsService,
        private vidaInversionService: VidaInversionService) { }
    CODPRODUCTO_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    async ngOnInit() {
        this.toggle_add_beneficiary = true;
        console.log(this.reference.documents);
        const formattedDocuments = this.formatDocuments(this.reference.documents);


        this.data_contractor.type_document = { Id: formattedDocuments.document_contrator.type_document.Id, Name: formattedDocuments.document_contrator.type_document.Name }
        this.data_contractor.document_number = formattedDocuments.document_contrator.document_number;
        this.data_insured.type_document = { Id: formattedDocuments.document_insured.type_document.Id, Name: formattedDocuments.document_insured.type_document.Name }
        this.data_insured.document_number = formattedDocuments.document_insured.document_number;
        this.clickBuscar(1)
        this.clickBuscar(2)
        console.log(this.data_contractor.document_number)
        console.log(this.data_insured.document_number)
        if (this.data_contractor.document_number == this.data_insured.document_number) {
            this.list_endoso_type = [{ Id: "1", Name: "ASEGURADO" }, { Id: "3", Name: "BENEFICIARIO" }];
        } else {
            this.list_endoso_type = [{ Id: "1", Name: "CONTRATANTE" }, { Id: "2", Name: "ASEGURADO" }, { Id: "3", Name: "BENEFICIARIO" }];
        }
        await this.vidaInversionService.GetBeneficiaries(this.reference.documents.SCOTIZACION, this.reference.documents.NID_PROC).toPromise().then((result) => {
            this.beneficiariesListBD = result.GenericResponse;

        }).catch((err) => {
            console.log("GetBeneficiaries" + err);
        });


    }


    formatDocuments(documents) {
        const extractNumber = (str) => {
            const parts = str.split('-');
            return parts.length > 1 ? parts[1].trim() : '';
        };

        let document_contrator = {
            type_document: {
                Id: documents.SDOC_CONT.includes('DNI') ? '2' : '4',
                Name: documents.SDOC_CONT.includes('DNI') ? 'DNI' : 'CARNET DE EXTRANJERÍA'
            },
            document_number: extractNumber(documents.SDOC_CONT)
        };

        let document_insured = {
            type_document: {
                Id: documents.SDOC_ASEG.includes('DNI') ? '2' : '4',
                Name: documents.SDOC_ASEG.includes('DNI') ? 'DNI' : 'Otro'
            },
            document_number: extractNumber(documents.SDOC_ASEG)
        };

        return {
            document_contrator,
            document_insured
        };
    }


    changeTypeEndoso() {
        // console.log(this.endoso_type); 
    }

    changeDocumentType(search_type: any) {
        if (search_type == 1) {
            this.data_contractor.document_number = "";
        } else if (search_type == 2) {
            this.data_insured.document_number = "";
        } else {
            this.data_beneficiary.document_number = "";
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
                    P_TipOper: "CON",
                    P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                    P_NIDDOC_TYPE: this.data_contractor.type_document.Id,
                    P_SIDDOC: this.data_contractor.document_number,
                };
            } else { // Asegurado
                params_360 = {
                    P_TipOper: 'CON',
                    P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
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
                                    this.clearData(search_type);
                                    await this.cargarDatosContractor(res, search_type);
                                    // await this.consultProspect(search_type);
                                    // await this.getIdecon(1);
                                }
                                else { // 2 Insured
                                    this.clearData(search_type);
                                    await this.cargarDatosInsured(res, search_type);
                                }
                                //}
                            }
                        }
                    }
                    else if (res.P_NCODE === "3") { // Se debe habilitar los campos para poder ingresar la Data y Crear el prospecto
                        this.isLoading = false;
                        Swal.fire('Información', 'No se encontró información, ingresar manualmente los datos.', 'error');
                        this.enableInputs(search_type);
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

    async cargarDatosContractor(res: any, search_type: any) {
        console.log(res);
        const contracting_data = res.EListClient[0];

        this.data_contractor.names = contracting_data.P_SFIRSTNAME;
        this.data_contractor.last_name = contracting_data.P_SLASTNAME;
        this.data_contractor.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_contractor.sclient = contracting_data.P_SCLIENT;
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

            await this.setdistricttContractor(parseInt(this.data_contractor.province.Id), parseInt(contracting_data.EListAddresClient[0].P_NMUNICIPALITY));
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

    async cargarDatosInsured(res: any, search_type: any) {

        const contracting_data = res.EListClient[0];

        this.data_insured.names = contracting_data.P_SFIRSTNAME;
        this.data_insured.last_name = contracting_data.P_SLASTNAME;
        this.data_insured.last_name2 = contracting_data.P_SLASTNAME2;
        this.data_insured.sclient = contracting_data.P_SCLIENT;
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
            await this.setdistricttInsured(parseInt(this.data_insured.province.Id), parseInt(contracting_data.EListAddresClient[0].P_NMUNICIPALITY));
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

    async setdistricttContractor(province_id, municipality_id) {
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

    async setdistricttInsured(province_id, municipality_id) {
        await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
            this.list_data_insured_district = res;
            this.data_insured.district = { Id: parseInt(municipality_id) }
        })
    };

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

    // async setDepartmentBeneficiary(id: any) {
    //     await this.addressService.getDepartmentList().toPromise().then(res => {
    //         this.list_data_beneficiary_department = res;
    //         this.data_beneficiary.department = { Id: id }
    //     })
    // };

    // async setProvinceBeneficiary(department_id, province_id) {
    //     await this.addressService.getProvinceList(department_id).toPromise().then(async res => {
    //         this.list_data_beneficiary_province = res;
    //         this.data_beneficiary.province = { Id: province_id };
    //     })
    // };

    // async setdistricttBeneficiary(province_id, municipality_id) {
    //     await this.addressService.getDistrictList(province_id).toPromise().then(async res => {
    //         this.list_data_beneficiary_district = res;
    //         this.data_beneficiary.district = { Id: parseInt(municipality_id) }
    //     })
    // };

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
        return validate_res;
    }

    clearData(type: any) {

        if (type == 1) {// Contratante
            // this.data_contractor.docuemnt_number = "";
            this.data_contractor.birthday_date = "";
            this.data_contractor.names = "";
            this.data_contractor.last_name = "";
            this.data_contractor.last_name2 = "";
            this.data_contractor.gender = "";
            this.data_contractor.nationality = "";
            this.data_contractor.phone = "";
            this.data_contractor.email = "";
            this.data_contractor.address = "";
            this.data_contractor.department = { Id: null };
            this.data_contractor.province = { Id: null };
            this.data_contractor.district = { Id: null };

            this.data_contractor.type_document_disabled = true;
            this.data_contractor.document_number_disabled = true;
            this.data_contractor.birthday_date_disabled = true;
            this.data_contractor.names_disabled = true;
            this.data_contractor.last_name_disabled = true;
            this.data_contractor.last_name2_disabled = true;
            this.data_contractor.gender_disabled = true;
            this.data_contractor.nationality_disabled = true;
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

        }
    };
    enableInputs(search_type: any) { // Cuando el 360 no llama Info

        if (search_type == 1) {// Contratante
            this.data_contractor.birthday_date = "";
            this.data_contractor.names = "";
            this.data_contractor.last_name = "";
            this.data_contractor.last_name2 = "";
            this.data_contractor.gender = "";
            this.data_contractor.nationality = "";
            this.data_contractor.phone = "";
            this.data_contractor.email = "";
            this.data_contractor.address = "";

            this.data_contractor.type_document_disabled = false;
            this.data_contractor.document_number_disabled = false;
            this.data_contractor.birthday_date_disabled = false;
            this.data_contractor.names_disabled = false;
            this.data_contractor.last_name_disabled = false;
            this.data_contractor.last_name2_disabled = false;
            this.data_contractor.gender_disabled = false;
            this.data_contractor.nationality_disabled = false;
            this.data_contractor.department_disabled = false;
            this.data_contractor.province_disabled = false;
            this.data_contractor.district_disabled = false;
            this.data_contractor.phone_disabled = false;
            this.data_contractor.email_disabled = false;
            this.data_contractor.address_disabled = false;
            this.contractor_province_department = false;
            this.contractor_province_selected = false;

            this.addressService.getDepartmentList().toPromise().then(res => {
                this.list_data_contractor_department = res;
                this.data_contractor.department = { Id: null }
                this.list_data_contractor_province = [];
                this.data_contractor.province = { Id: null }
                this.list_data_contractor_district = [];
                this.data_contractor.district = { Id: null }

            });

        }
    };
    validEmail = (num) => {
        if (num == 1) {
            if (this.data_contractor.email.match(this.CONSTANTS.REGEX.CORREO)) {
                this.boolEmailCTR = false;
            } else {
                this.boolEmailCTR = true;
            }
        } else if (num == 2) {
            if (this.data_insured.email.match(this.CONSTANTS.REGEX.CORREO)) {
                this.boolEmailASG = false;
            } else {
                this.boolEmailASG = true;
            }
        } else {
            if (this.data_beneficiary.email.match(this.CONSTANTS.REGEX.CORREO)) {
                this.boolEmailBNF = false;
            } else {
                this.boolEmailBNF = true;
            }
        }
    }

    validNumber = (num) => {
        if (num == 1) {
            if (this.data_contractor.phone.match(this.CONSTANTS.REGEX.CELULAR)) {
                this.boolNumberCTR = false;
            } else {
                this.boolNumberCTR = true;
            }
        } else if (num == 2) {
            if (this.data_insured.phone.match(this.CONSTANTS.REGEX.CELULAR)) {
                this.boolNumberASG = false;
            } else {
                this.boolNumberASG = true;
            }
        } else {
            if (this.data_beneficiary.phone.match(this.CONSTANTS.REGEX.CELULAR)) {
                this.boolNumberBNF = false;
            } else {
                this.boolNumberBNF = true;
            }
        }
    }

    
    obtenerFechaActual = () => {
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    parametersTransaction(search_type: any) {
        const NID_PROC_RANDOM: string = Date.now().toString() + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.params = {
            nroCotizacion: this.reference.documents.NRO_COTIZACION,
            nroPoliza: this.reference.documents.NPOLIZA,
            codProducto: this.codProducto,
            codProceso: NID_PROC_RANDOM,
            codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id'],
            transac: 8,
            datosPoliza: {
                branch: this.CONSTANTS.RAMO
            },
            datosContratante: {
                ascon: 0,
                codContratante: this.data_contractor.sclient,
                nombre: this.data_contractor.names,
                apePaterno: this.data_contractor.last_name,
                apeMaterno: this.data_contractor.last_name2,
                nacionalidad: this.data_contractor.nationality.NNATIONALITY,
                codDocumento: this.data_contractor.type_document.Id,
                documento: this.data_contractor.document_number,
                fechaNacimiento: this.data_contractor.birthday_date,
                email: this.data_contractor.email,
                desTelefono: "Celular",
                telefono: this.data_contractor.phone,
                sexo: this.data_contractor.gender.SSEXCLIEN,
                sstreet: this.data_contractor.address,
                department: this.data_contractor.department.Id,
                district: this.data_contractor.district.Id,
                province: this.data_contractor.province.Id
            },
            datosAsegurado: {
                ascon: 0,
                codContratante: this.data_insured.sclient,
                nombre: this.data_insured.names,
                apePaterno: this.data_insured.last_name,
                apeMaterno: this.data_insured.last_name2,
                nacionalidad: this.data_insured.nationality.NNATIONALITY,
                codDocumento: this.data_insured.type_document.Id,
                documento: this.data_insured.document_number,
                fechaNacimiento: this.data_insured.birthday_date,
                email: this.data_insured.email,
                desTelefono: "Celular",
                telefono: this.data_insured.phone,
                sexo: this.data_insured.gender.SSEXCLIEN,
                sstreet: this.data_insured.address,
                department: this.data_insured.department.Id,
                district: this.data_insured.district.Id,
                province: this.data_insured.province.Id
            },
            datosBeneficiario: {
                ascon: 0,
                codContratante: this.data_beneficiary.sclient,
                nombre: this.data_beneficiary.names,
                apePaterno: this.data_beneficiary.last_name,
                apeMaterno: this.data_beneficiary.last_name2,
                nacionalidad: this.data_beneficiary.nationality.NNATIONALITY,
                codDocumento: this.data_beneficiary.type_document.Id,
                documento: this.data_beneficiary.document_number,
                desCodDocumentoBeneficiary: this.data_beneficiary.type_document.Id,
                codDocumentoBeneficiary: this.data_beneficiary.document_number,
                porcentaParticipacion: this.data_beneficiary.assignment,
                fechaNacimiento: this.data_beneficiary.birthday_date,
                email: this.data_beneficiary.email,
                desTelefono: "Celular",
                telefono: this.data_beneficiary.phone,
                sexo: this.data_beneficiary.gender.SSEXCLIEN,
                sstreet: this.data_beneficiary.address,
                department: this.data_beneficiary.department.Id,
                district: this.data_beneficiary.district.Id,
                province: this.data_beneficiary.province.Id
            },
            beneficiariesListBD: this.beneficiariesListBD
        };



        if (search_type == 1) {
            this.params.datosContratante.ascon = 1
        } else if (search_type == 2) {
            this.params.datosAsegurado.ascon = 1
        } else {
            this.params.datosBeneficiario.ascon = 1
        }
        this.myFormData.append('CargaMas', JSON.stringify(this.params))
        this.transaccionProtecta = {
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCTO: this.CONSTANTS.COD_PRODUCTO,
            P_NID_COTIZACION: this.reference.documents.NRO_COTIZACION,
            P_DEFFECDATE: this.obtenerFechaActual(),
            P_DEXPIRDAT: this.reference.documents.DFIN_VIGENCIA, /*18/04/2025*/
            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            P_NTYPE_TRANSAC: 8,
            P_NID_PROC: NID_PROC_RANDOM,
            P_FACT_MES_VENCIDO: '',
            P_SFLAG_FAC_ANT: 1,
            P_SCOLTIMRE: "1",
            P_NPAYFREQ: 6,
            P_NMOV_ANUL: 0,
            P_NNULLCODE: 0,
            P_SCOMMENT: "",
            P_DIRECTO: 30,
            P_MESSAGE: "",
            P_POLICY: this.reference.documents.NPOLIZA,
            P_STRAN: 20,
            P_DSTARTDATE_ASE: this.reference.documents.DINICIO_VIGENCIA_ASEG,
            P_DSTARTDATE_POL: this.reference.documents.DINICIO_VIGENCIA,
            P_DEXPIRDAT_POL: this.reference.documents.DFIN_VIGENCIA,
            P_NAMO_AFEC: 0,
            P_NIVA: 0,
            P_NAMOUNT: 0,
        }
        this.myFormData.append(
            'transaccionProtecta',
            JSON.stringify(this.transaccionProtecta)
        );
        this.policyemit.transactionPolicy(this.myFormData).subscribe(
            (res) => {
                if (res.P_COD_ERR == 0) {
                    Swal.fire(
                        'Información',
                        'Se ha realizado el movimiento para la póliza ' +
                        // this.cotizacion.poliza.nroPoliza +
                        ' de forma satisfactoria.',
                        'success'
                    );
                } else {
                    Swal.fire('Información', res.P_MESSAGE || res.P_MESSAGE, 'error');
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }

    guardar(search_type: any) {
        if (search_type == 1) {
            if (this.boolEmailCTR == true) {
                Swal.fire('Información', 'Ingrese un correo electónico con el formato correcto', 'error')
            } else if (this.boolNumberCTR == true) {
                Swal.fire('Información', 'En el campo celular se deben ingresar 9 digitos y empezar por 9', 'error')
            } else if (this.data_contractor.address == "" || this.data_contractor.department.codigo == "" || this.data_contractor.district.codigo == "" || this.data_contractor.province.codigo == "") {
                Swal.fire('Información', 'La dirección se debe ingresar completa', 'error');
            } else {
                Swal.fire({
                    title: "Confimación",
                    text: "¿Esta seguro que desea generar el endoso?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Si",
                    cancelButtonText: "No"
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.parametersTransaction(search_type)
                        this.reference.close()
                    }
                });
            }

        } else if (search_type == 2) {
            this.boolEmailASG ? Swal.fire('Información', 'Ingrese un correo electónico con el formato correcto', 'error') : "";
            this.boolNumberASG ? Swal.fire('Información', 'En el campo celular se deben ingresar 9 digitos', 'error') : "";
            if (this.data_insured.address == "" || this.data_insured.department.codigo == "" || this.data_insured.district.codigo == "" || this.data_insured.province.codigo == "") {
                Swal.fire('Información', 'La dirección se debe ingresar completa', 'error');
            }
            Swal.fire({
                title: "Confimación",
                text: "¿Esta seguro que desea generar el endoso?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si",
                cancelButtonText: "No"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.parametersTransaction(search_type)
                }
            });
        } else {
            this.percentage_participation = this.beneficiariesListBD.reduce((acc, current) => acc + parseInt(current?.porcentaParticipacion), 0);
            if (this.percentage_participation < 100) {
                this.isLoading = false;
                Swal.fire('Información', 'La suma de porcentaje de la asignación(%) debe ser 100%.', 'warning');
                return;
            } else {
                this.parametersTransaction(3)
                this.reference.close()
            }
        }

    }

    addBeneficiary() {
        const sum_percentage_participation = this.beneficiariesListBD.reduce((acc, current) => acc + parseInt(current?.porcentaParticipacion), 0);
        if (sum_percentage_participation >= 100) {
            this.isLoading = false;
            Swal.fire('Información', 'La suma de porcentaje la asignación(%) es 100%.', 'warning');
            return;
        } else {
            if (this.data_beneficiary.type_document.codigo == "") {
                Swal.fire('Información', 'Ingrese un Tipo de documento', 'error')
            } else if (this.data_beneficiary.document_number == "") {
                Swal.fire('Información', 'Ingrese un numero de documento', 'error')
            } else if (this.data_beneficiary.document_number.length < 8 && this.data_beneficiary.type_document.codigo == "2") {
                Swal.fire('Información', 'Ingrese 8 digitos para el numero de documento', 'error')
            } else if (this.data_beneficiary.document_number.length < 8 && this.data_beneficiary.type_document.codigo == "4") {
                Swal.fire('Información', 'Ingrese 8 o 12 digitos para el numero de documento', 'error')
            } else if (this.data_beneficiary.nationality.codigo == "") {
                Swal.fire('Información', 'Ingrese una nacionalidad', 'error')
            } else if (this.data_beneficiary.names == "") {
                Swal.fire('Información', 'Ingrese su nombre', 'error')
            } else if (this.data_beneficiary.last_name == "") {
                Swal.fire('Información', 'Ingrese su apellido paterno', 'error')
            } else if (this.data_beneficiary.last_name2 == "") {
                Swal.fire('Información', 'Ingrese su apellido materno', 'error')
            } else if (this.data_beneficiary.birthday_date == "") {
                Swal.fire('Información', 'Ingrese su fecha de nacimiento', 'error')
            } else if (this.data_beneficiary.gender.codigo == "") {
                Swal.fire('Información', 'Ingrese su genero', 'error')
            } else if (this.data_beneficiary.relation.codigo == "") {
                Swal.fire('Información', 'Ingrese su Vinvulo', 'error')
            } else if (this.data_beneficiary.assignment == "") {
                Swal.fire('Información', 'Ingrese la asignación', 'error')
            } else if (this.data_beneficiary.email == "") {
                Swal.fire('Información', 'Ingrese un correo electónico', 'error')
            } else if (this.boolEmailBNF == true) {
                Swal.fire('Información', 'Ingrese un correo electónico con el formato correcto', 'error')
            } else if (this.boolNumberBNF == true || this.data_beneficiary.phone == "") {
                Swal.fire('Información', 'En el campo celular se deben ingresar 9 digitos', 'error')
            } else if (this.data_beneficiary.address == "" || this.data_beneficiary.department.codigo == "" || this.data_beneficiary.district.codigo == "" || this.data_beneficiary.province.codigo == "") {
                //     Swal.fire('Información', 'La dirección se debe ingresar completa', 'error');
            } else {
                // let item = {
                //     id:0,
                //     SFIRSTNAME: this.data_beneficiary.names,
                //     SLASTNAME: this.data_beneficiary.last_name,
                //     SLASTNAME2: this.data_beneficiary.last_name2,
                //     NNATIONALITY: this.data_beneficiary.nationality.NNATIONALITY,
                //     DBIRTHDAT: this.data_beneficiary.birthday_date,
                //     SSEXCLIEN: this.data_beneficiary.gender.SSEXCLIEN,
                //     NRELATION: this.data_beneficiary.relation.COD_ELEMENTO,
                //     RELATION_NAME: this.data_beneficiary.relation.GLS_ELEMENTO,
                //     PERCEN_PARTICIPATION: this.data_beneficiary.assignment,
                //     SE_MAIL: this.data_beneficiary.email,
                //     SPHONE: this.data_beneficiary.phone,
                //     NIDDOC_TYPE_PADRE: this.data_beneficiary.type_document.Id,
                //     SIDDOC_PADRE: this.data_beneficiary.document_number,
                //     SSTREET: this.data_beneficiary.address,
                //     DEPARTMENT: this.data_beneficiary.department.Id,
                //     DISTRICT: this.data_beneficiary.district.Id,
                //     PROVINCE: this.data_beneficiary.province.Id,
                // }
                let itemBD = {
                    ascon: 0,
                    id: 0,
                    codContratante: this.data_beneficiary.sclient,
                    nombre: this.data_beneficiary.names,
                    apePaterno: this.data_beneficiary.last_name,
                    apeMaterno: this.data_beneficiary.last_name2,
                    nacionalidad: this.data_beneficiary.nationality.NNATIONALITY,
                    codDocumento: this.data_beneficiary.type_document.Id,
                    documento: this.data_beneficiary.document_number,
                    desCodDocumentoBeneficiary: this.data_beneficiary.type_document.Id,
                    codDocumentoBeneficiary: this.data_beneficiary.document_number,
                    porcentaParticipacion: this.data_beneficiary.assignment,
                    nrelation: this.data_beneficiary.relation.COD_ELEMENTO,
                    srelation: this.data_beneficiary.relation.GLS_ELEMENTO,
                    fechaNacimiento: this.data_beneficiary.birthday_date,
                    email: this.data_beneficiary.email,
                    desTelefono: "Celular",
                    telefono: this.data_beneficiary.phone,
                    sexo: this.data_beneficiary.gender.SSEXCLIEN,
                    sstreet: this.data_beneficiary.address,
                    department: this.data_beneficiary.department.Id,
                    district: this.data_beneficiary.district.Id,
                    province: this.data_beneficiary.province.Id
                }
                if ((Number(sum_percentage_participation) + Number(itemBD.porcentaParticipacion)) > 100) {
                    this.isLoading = false;
                    Swal.fire('Información', 'La suma de porcentaje de la asignación(%) debe ser 100%.', 'warning');
                    return;
                } else {
                    this.beneficiariesListBD.push(itemBD);
                    let count = 0;

                    for (var i = 0; i < this.beneficiariesListBD.length; i++) {
                        this.beneficiariesListBD[i].id = ++count;
                    }
                    // this.beneficiariesListBD.push(itemBD); 
                }
                this.beneficiaryInit()
            }
        }

    }

    editBeneficiary(item) {

        this.item_id = item.documento
        this.data_beneficiary = {
            names: item.nombre,
            last_name: item.apePaterno,
            last_name2: item.apeMaterno,
            nationality: { NNATIONALITY: item.nacionalidad, SDESCRIPT: "" },
            birthday_date: item.fechaNacimiento,
            gender: { SSEXCLIEN: item.sexo, SDESCRIPT: "" },
            relation: { COD_ELEMENTO: item.nrelation, GLS_ELEMENTO: "" },
            assignment: item.porcentaParticipacion,
            email: item.email,
            phone: item.telefono,
            type_document: { Id: item.codDocumento, Name: "" },
            document_number: item.documento,
            department: { Id: item.department, SDESCRIPT: "" },
            province: { Id: item.province, SDESCRIPT: "" },
            district: { Id: item.district, SDESCRIPT: "" },
            address: item.sstreet,

            type_document_disabled: false,
            document_number_disabled: false,
            birthday_date_disabled: false,
            names_disabled: false,
            last_name_disabled: false,
            last_name2_disabled: false,
            gender_disabled: false,
            civil_status_disabled: false,
            nationality_disabled: false,
            department_disabled: false,
            province_disabled: false,
            district_disabled: false,
            phone_disabled: false,
            email_disabled: false,
            address_disabled: false,
            relation_disabled: true,
        }
        this.toggle_edit_beneficiary = true;
        this.toggle_add_beneficiary = false;
    }
    deleteBeneficiary(item_id) {

        Swal.fire({
            title: 'Información',
            text: '¿Esta seguro que desea eliminar el beneficiario?',
            icon: 'question',
            iconColor: '#ed6e00',
            showCancelButton: true,
            confirmButtonText: 'Si',
            allowOutsideClick: false,
            cancelButtonText: 'No',
            allowEscapeKey: false,
        }).then(
            result => {
                if (result.isConfirmed) {
                    const id = this.beneficiariesListBD.findIndex((element: any) => element.SIDDOC_PADRE == item_id);
                    if (id != -1) {
                        this.beneficiariesListBD.splice(id, 1);
                    }
                    Swal.fire('Información', "Se realizo de forma exitosa.", 'success');
                }
            }
        );
    }
    cancelBeneficiary() {

        this.toggle_edit_beneficiary = false;
        this.toggle_add_beneficiary = true;
        this.beneficiaryInit()

    }

    updateBeneficiary() {
        const id = this.beneficiariesListBD.findIndex((element: any) => element.documento == this.item_id);
        const valorprev = this.beneficiariesListBD[id].porcentaParticipacion
        if (id != -1) {
            this.beneficiariesListBD[id].porcentaParticipacion = this.data_beneficiary.assignment;
        }
        this.percentage_participation = this.beneficiariesListBD.reduce((acc, current) => acc + parseInt(current?.porcentaParticipacion), 0);

        console.log(this.percentage_participation)
        if (this.percentage_participation > 100) {
            this.isLoading = false;
            if (id != -1) {
                this.beneficiariesListBD[id].porcentaParticipacion = valorprev;
            }
            Swal.fire('Información', 'La suma de la asignación no puede superar el 100%.', 'warning');
            return;
        } else {
            Swal.fire({
                title: 'Información',
                text: 'Esta seguro que desea actualizar los datos?',
                icon: 'question',
                iconColor: '#ed6e00',
                showCancelButton: true,
                confirmButtonText: 'Si',
                allowOutsideClick: false,
                cancelButtonText: 'No',
                allowEscapeKey: false,
            }).then(
                result => {
                    if (result.isConfirmed) {
                        const id = this.beneficiariesListBD.findIndex((element: any) => element.documento == this.item_id);
                        if (id != -1) {
                            this.beneficiariesListBD[id].porcentaParticipacion = this.data_beneficiary.assignment;
                            this.beneficiariesListBD[id].email = this.data_beneficiary.email;
                            this.beneficiariesListBD[id].telefono = this.data_beneficiary.phone;
                            this.beneficiariesListBD[id].nombre = this.data_beneficiary.names;
                            this.beneficiariesListBD[id].apePaterno = this.data_beneficiary.last_name;
                            this.beneficiariesListBD[id].apeMaterno = this.data_beneficiary.last_name2;
                            this.beneficiariesListBD[id].nacionalidad = this.data_beneficiary.nationality.NNATIONALITY;
                            this.beneficiariesListBD[id].codDocumento = this.data_beneficiary.type_document.Id;
                            this.beneficiariesListBD[id].documento = this.data_beneficiary.document_number;
                            this.beneficiariesListBD[id].nrelation = this.data_beneficiary.relation.COD_ELEMENTO;
                            this.beneficiariesListBD[id].fechaNacimiento = this.data_beneficiary.birthday_date;
                            this.beneficiariesListBD[id].sexo = this.data_beneficiary.gender.SSEXCLIEN;
                            this.beneficiariesListBD[id].sstreet = this.data_beneficiary.address;
                            this.beneficiariesListBD[id].department = this.data_beneficiary.department.Id;
                            this.beneficiariesListBD[id].district = this.data_beneficiary.district.Id;
                            this.beneficiariesListBD[id].province = this.data_beneficiary.province.Id;
                        }
                        Swal.fire('Información', "Se realizo de forma exitoza.", 'success');
                    } else if (result.isDenied) {
                        if (id != -1) {
                            this.beneficiariesListBD[id].porcentaParticipacion = valorprev;
                        }
                    }
                    this.toggle_edit_beneficiary = false;
                    this.toggle_add_beneficiary = true;
                    this.beneficiaryInit()
                }
            );
        }


    }

    beneficiaryInit() {
        this.data_beneficiary = {
            sclient: "",
            type_document: [],
            document_number: "",
            birthday_date: "",
            names: "",
            last_name: "",
            last_name2: "",
            gender: [],
            civil_status: "",
            nationality: [],
            department: [],
            province: [],
            district: [],
            phone: "",
            email: "",
            address: "",
            relation: [],
            assignment: "",

            type_document_disabled: false,
            document_number_disabled: false,
            birthday_date_disabled: false,
            names_disabled: false,
            last_name_disabled: false,
            last_name2_disabled: false,
            gender_disabled: false,
            civil_status_disabled: false,
            nationality_disabled: false,
            department_disabled: false,
            province_disabled: false,
            district_disabled: false,
            phone_disabled: false,
            email_disabled: false,
            address_disabled: false,
            relation_disabled: false
        }
    }
}
