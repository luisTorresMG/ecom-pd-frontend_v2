import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { CommonMethods } from '@root/layout/broker/components/common-methods';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import Swal from 'sweetalert2';
import moment from 'moment';
import { padLeft } from '../../../../shared/helpers/utils';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { VidaInversionService } from '../../services/vida-inversion.service';

@Component({
    standalone: false,
    selector: 'app-add-pep',
    templateUrl: './add-pep.component.html',
    styleUrls: ['./add-pep.component.scss']
})

export class AddPepComponent implements OnInit, OnChanges {
    @Output() familyAdded: EventEmitter<any> = new EventEmitter();
    @Input() public reference: any;
    CONSTANTS: any = VidaInversionConstants;
    COD_PROD_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    fam_list: any = [];

    TYPE_PEP: any = []; //ARJG
    ORGANIZATION: any = [];
    parse_amount: any;

    isLoading: boolean = false;
    fin_date_disabled: boolean = false;

    familys: any = {
        id: 0,
        pnconditionpep: { codigo: "", value: "Seleccione" },
        pnrelation: { codigo: "", SDESCRIPT: "Seleccione" },
        psnames: "",
        pslastnames: "",
        pntypedoc: { codigo: "", value: "Seleccione" },
        psnumdoc: "",
        pspostpep: "",
        name_type_organization: { codigo: "", value: "Seleccione" },
        ini_date: "",
        fin_date: "",
        check_laboral: "",
        codes: { codigo: "", SDESCRIPT: "Seleccione" },
        description_codes: "",
        // pntypedoc_disabled: false,
        // pnrelpep : { id: 0, value: "Seleccione"},
    };

    toggle_edit_famp: boolean;
    toggle_add_famp: boolean;


    idCotizacion: any; //this.reference.quotation_id
    sclient: any; //this.reference.sclient
    type_client: any;
    list_document_type: any = [];
    list_codes_type: any = [];
    @Input() list_relationship_type: any = [];

    relationship: any;
    profile_id: any;
    edit_id: any;
    FL_DATA_QUALITY: boolean = false;


    constructor(
        public clientInformationService: ClientInformationService,
        public quotationService: QuotationService,
        private vidaInversionService: VidaInversionService,
        private parameterSettingsService: ParameterSettingsService
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log("changes: ", changes)
    }

    async ngOnInit() {
        this.isLoading = true;
        try {

            this.FL_DATA_QUALITY = await this.CONSTANTS.getIsActiveDataQuality(this.vidaInversionService);
            // console.log(this.FL_DATA_QUALITY);

            this.disableInputsforDataQuality();


            this.profile_id = await this.getProfileProduct();
            this.idCotizacion = this.reference.quotation_id;//19970;//
            this.sclient = this.reference.sclient;//"02000084584251";//
            this.type_client = 2;//this.reference.type_client;

            this.TYPE_PEP = [
                { id: 1, value: "CONTRATANTE" },
                { id: 2, value: "ASEGURADO" }
            ]

            this.ORGANIZATION = [
                { id: 1, value: "Organismo Público" },
                { id: 2, value: "Organismo Internacional" },
            ]

            this.toggle_add_famp = true;
            this.toggle_edit_famp = false;

            const request_relation = { Nbranch: this.CONSTANTS.RAMO, Nproduct: this.CONSTANTS.COD_PRODUCTO };
            this.list_relationship_type = await this.quotationService.getRelationsPep(request_relation).toPromise();

            this.list_document_type = await this.clientInformationService.getDocumentTypeList(this.COD_PROD_PROFILE).toPromise();

            this.list_codes_type = (await this.clientInformationService.getCodesList().toPromise()).filter(row => row.NCODES != 8);

            await this.getPepFam();

            this.cancelFampep();

        } catch (error) {
            console.log("error: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    resetFamilys = () => {
        this.familys = {
            id: 0,
            pnconditionpep: { codigo: "", value: "Seleccione" },
            pnrelation: { codigo: "", SDESCRIPT: "Seleccione" },
            psnames: "",
            pslastnames: "",
            pntypedoc: { codigo: "", value: "Seleccione" },
            psnumdoc: "",
            pspostpep: "",
            ini_date: "",
            fin_date: "",
            check_laboral: false,
            name_type_organization: { codigo: "", value: "Seleccione" },
            codes: { codigo: "", SDESCRIPT: "Seleccione" },
            description_codes: "",
        }
    }

    changeCheckLab(): void {
        this.familys.fin_date = ""
        if (this.familys.check_laboral) {
            this.fin_date_disabled = true;
        } else {
            this.fin_date_disabled = false;
        }
    }

    public VALIDATE_FAMILY(familys): any {

        let workInitDate = moment(familys.ini_date).startOf('day').toDate()
        let workFinDate = moment(!this.fin_date_disabled ? familys.fin_date : new Date()).startOf('day').toDate()
        let diaActualNoFormat = moment(new Date()).toDate();
        let diaActual = new Date(diaActualNoFormat.getFullYear(), diaActualNoFormat.getMonth(), diaActualNoFormat.getDate());

        let response = { cod_error: 0, message_error: "" }

        //debugger
        if (this.edit_id != 1 && familys.pnconditionpep.codigo == "") {
            response.message_error += 'Se debe ingresar el tipo de familiar pep. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.pnrelation.codigo == "") {
            response.message_error += 'Se debe ingresar el tipo de parentesco. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.psnames == "") {
            response.message_error += 'Se debe ingresar nombres del familiar pep. <br>';
            response.cod_error = 1;
        }
        if (this.edit_id != 1 && familys.pslastnames == "") {
            response.message_error += 'Se debe ingresar apellidos del familiar pep. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.pntypedoc.codigo == "") {
            response.message_error += 'Se debe ingresar tipo de documento del familiar pep. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.psnumdoc == "") {
            response.message_error += 'Se debe ingresar numero del documento del familiar pep. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.psnumdoc != "" && familys.pntypedoc.codigo == 2 && familys.psnumdoc.length != 8) {

            response.message_error += 'El numero documento del familiar pep, debe tener 8 caracteres. <br>';
            response.cod_error = 1;
        }

        if (this.edit_id != 1 && familys.psnumdoc != "" && familys.pntypedoc.codigo == 4 && (familys.psnumdoc.length < 8 || familys.psnumdoc.length > 12)) {

            response.message_error += 'El numero documento del familiar pep, debe tener entre 8 - 12 caracteres. <br>';
            response.cod_error = 1;
        }

        if (familys.pspostpep == "") {
            response.message_error += 'Se debe ingresar cargo del familiar pep. <br>';
            response.cod_error = 1;
        }

        if (familys.name_type_organization.codigo == "") {
            response.message_error += 'Se debe seleccionar el tipo organizacion. <br>';
            response.cod_error = 1;
        }

        if (familys.ini_date == "") {
            response.message_error += 'Se debe ingresar la fecha de inicio del cargo familiar pep. <br>';
            response.cod_error = 1;
        }

        if (familys.fin_date == "" && !this.fin_date_disabled) {
            response.message_error += 'Se debe ingresar la fecha de cese del cargo familiar pep. <br>';
            response.cod_error = 1;
        }

        if (workInitDate > diaActual) {
            response.message_error += 'La fecha de inicio del cargo familiar pep no puede ser mayor a la fecha actual. <br>';
            response.cod_error = 1;
        }

        if (!this.fin_date_disabled && workFinDate > diaActual) {
            response.message_error += 'La fecha de cese del cargo familiar pep no puede ser mayor a la fecha actual. <br>';
            response.cod_error = 1;
        }

        if (!this.fin_date_disabled && workFinDate < workInitDate) {
            response.message_error += 'La fecha de cese del cargo familiar pep no puede ser menor a la fecha de inicio del cargo. <br>';
            response.cod_error = 1;
        }

        if (familys.codes.codigo == "") {
            response.message_error += 'Se debe seleccionar el codigo. <br>';
            response.cod_error = 1;
        }

        return response;
    }

    addFamp = () => {

        let validate_error = this.VALIDATE_FAMILY(this.familys);

        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return
        }

        const id = this.fam_list.findIndex((element: any) => element.psnumdoc == this.familys.psnumdoc);
        if (id != -1) {
            Swal.fire('Información', 'No. de Documento de Identidad del familiar existe <br> Familiar: ' + this.fam_list[id].pslastnames.toLocaleUpperCase() + ' ' + this.fam_list[id].psnames.toLocaleUpperCase(), 'error');
            return
        }

        let itemFamily = {
            id: 0,
            pnconditionpep: this.familys.pnconditionpep.codigo, // CODIGO Familiar PEP
            pntypepep: 'Familiar ' + this.familys.pnconditionpep.value, // DESCRIPCION Familiar PEP
            pnrelation: this.familys.pnrelation.COD_ELEMENTO, // CODIGO Parentesco
            pnomrelation: this.familys.pnrelation.GLS_ELEMENTO, // DESCRIPCION PARENTESCO
            psnames: this.familys.psnames,
            pslastnames: this.familys.pslastnames,
            pscliename: this.familys.pslastnames + ' ' + this.familys.psnames,
            pntypedoc: this.familys.pntypedoc.Id,
            psnumdoc: this.familys.psnumdoc,
            pntnumdoc: this.familys.pntypedoc.Name + '-' + this.familys.psnumdoc, // TIPO DOCUMENTO + NUMERO DOCUMENTO
            pspostpep: this.familys.pspostpep, // CARGO QUE LO HIZO PEP
            ini_date: this.familys.ini_date.getDate().toString().padStart(2, '0') + '/' + (this.familys.ini_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.familys.ini_date.getFullYear(),
            fin_date: this.familys.check_laboral ? "" : (this.familys.fin_date.getDate().toString().padStart(2, '0') + '/' + (this.familys.fin_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.familys.fin_date.getFullYear()),
            check_laboral: this.familys.check_laboral ? 1 : 0,
            n_type_organization: this.familys.name_type_organization.id, // CODIGO TIPO ORGANIZACION
            name_type_organization: this.familys.name_type_organization.value, // DESCRIPCION TIPO ORGANIZACION
            codes: this.familys.codes.NCODES, // CODIGO  => CODIGO
            description_codes: this.familys.description_codes, // DESCRIPCION => CODIGO
            pnrelpep: 3,
            pntypeclient: 3,
        }

        this.fam_list.push(itemFamily);

        let count = 0;

        for (var i = 0; i < this.fam_list.length; i++) {
            this.fam_list[i].id = ++count;
        }
        this.cancelFampep();
        // customswal.fire('Información', "Se agregó el familiar correctamente.", 'success');
    }

    editFampep = (item_fam) => {

        let fecha1;
        if (item_fam.ini_date != "") {
            const partesFecha1 = item_fam.ini_date.split('/');
            const dia1 = parseInt(partesFecha1[0]); // Parsea el día como entero
            const mes1 = parseInt(partesFecha1[1]) - 1; // Parsea el mes (resta 1 ya que en JavaScript los meses van de 0 a 11)
            const anio1 = parseInt(partesFecha1[2]); // Parsea el año como entero
            fecha1 = new Date(anio1, mes1, dia1); // Crea un objeto Date con el día, mes y año
        } else {
            fecha1 = "";
        }

        let fecha2;
        if (item_fam.check_laboral == 0) {
            if (item_fam.fin_date != "") {
                const partesFecha2 = item_fam.fin_date.split('/');
                const dia2 = parseInt(partesFecha2[0]); // Parsea el día como entero
                const mes2 = parseInt(partesFecha2[1]) - 1; // Parsea el mes (resta 1 ya que en JavaScript los meses van de 0 a 11) 
                const anio2 = parseInt(partesFecha2[2]); // Parsea el año como entero
                fecha2 = new Date(anio2, mes2, dia2); // Crea un objeto Date con el día, mes y año
            } else {
                fecha2 = "";
            }

        } else {
            fecha2 = "";
            this.fin_date_disabled = true;
        }

        this.familys = {
            id: item_fam.id,
            pnconditionpep: { id: item_fam.pnconditionpep },
            pnrelation: { COD_ELEMENTO: item_fam.pnrelation },
            psnames: item_fam.psnames,
            pslastnames: item_fam.pslastnames,
            pntypedoc: { Id: item_fam.pntypedoc },
            psnumdoc: item_fam.psnumdoc,
            pspostpep: item_fam.pspostpep,
            ini_date: fecha1,
            fin_date: fecha2,
            check_laboral: item_fam.check_laboral == 1 ? true : false,
            name_type_organization: { id: item_fam.n_type_organization, value: item_fam.name_type_organization },
            // n_type_organization:item_fam.n_type_organization.id
            codes: { NCODES: item_fam.codes, SDESCRIPT: item_fam.description_codes },
            description_codes: item_fam.description_codes,
        }

        // if (item_fam.pnrelpep == 1){   // VIGP-KAFG 07/04/2025
        if ([1, 2].includes(item_fam.pntypeclient)) {   // VIGP-KAFG 07/04/2025
            const relaciones = [{
                COD_ELEMENTO: 41,
                GLS_ELEMENTO: "Titular",
                codigo: 41,
                text: "Titular",
                valor: "Titular"
            }]

            this.list_relationship_type.map(x => {
                relaciones.push({ ...x })
            })

            this.list_relationship_type = relaciones

            this.edit_id = 1;
        } else {
            this.edit_id = 0;
        }
        this.toggle_edit_famp = true;
        this.toggle_add_famp = false;
    }

    updateFampep = () => {
        //debugger
        let validate_error = this.VALIDATE_FAMILY(this.familys);

        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return
        }

        const new_list = this.fam_list.map((item) => {
            if (item.id == this.familys.id) {
                item.id = this.familys.id;
                item.pnconditionpep = this.familys.pnconditionpep.codigo,
                    item.pntypepep = (![1, 2].includes(item.pntypeclient) ? 'Familiar ' : '') + this.familys.pnconditionpep.value, // DESCRIPCION Familiar PEP
                    item.pnrelation = this.familys.pnrelation.COD_ELEMENTO,
                    item.pnomrelation = this.familys.pnrelation.GLS_ELEMENTO,
                    item.psnames = this.familys.psnames;
                item.pslastnames = this.familys.pslastnames,
                    item.pscliename = this.familys.pslastnames + ' ' + this.familys.psnames,
                    item.pntypedoc = this.familys.pntypedoc.Id,
                    item.psnumdoc = this.familys.psnumdoc,
                    item.pntnumdoc = this.familys.pntypedoc.Name + '-' + this.familys.psnumdoc, // TIPO DOCUMENTO + NUMERO DOCUMENTO
                    item.pspostpep = this.familys.pspostpep,
                    // item.n_type_organization = this.familys.n_type_organization
                    // item.name_type_organization = this.familys.name_type_organization.value,
                    item.n_type_organization = this.familys.name_type_organization.id, // CODIGO TIPO ORGANIZACION
                    item.ini_date = this.familys.ini_date.getDate().toString().padStart(2, '0') + '/' + (this.familys.ini_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.familys.ini_date.getFullYear(),
                    item.fin_date = this.familys.check_laboral ? "" : (this.familys.fin_date.getDate().toString().padStart(2, '0') + '/' + (this.familys.fin_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.familys.fin_date.getFullYear()),
                    item.check_laboral = this.familys.check_laboral ? 1 : 0,
                    item.name_type_organization = this.familys.name_type_organization.value, // DESCRIPCION TIPO ORGANIZACION
                    item.codes = this.familys.codes.NCODES,
                    item.description_codes = this.familys.description_codes
            }
            return item;
        });
        this.edit_id = 0;
        this.fam_list = new_list;
        this.toggle_edit_famp = false;
        this.toggle_add_famp = true;

        this.resetFamilys()

        this.list_relationship_type = this.list_relationship_type.filter(x => ![41, "41"].includes(x.COD_ELEMENTO))
        const customswal = Swal.mixin({
            confirmButtonColor: "553d81",
            focusConfirm: false,
        });

        customswal.fire('Información', "El familiar fue editado.", 'success');
    }

    cancelFampep = () => {
        this.edit_id = 0;

        this.list_relationship_type = this.list_relationship_type.filter(x => ![41, "41"].includes(x.COD_ELEMENTO))
        this.resetFamilys()

        this.toggle_edit_famp = false;
        this.toggle_add_famp = true;
    }

    deleteFampep = (item_id) => {
        Swal.fire({
            title: 'Información',
            text: 'Seguro que deseas eliminar este registro?',
            icon: 'question',
            iconColor: '#ed6e00',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
            allowEscapeKey: false,
        }).then(
            result => {
                if (result.isConfirmed) {
                    const id = this.fam_list.findIndex((element: any) => element.id == item_id);
                    if (id != -1) {
                        this.fam_list.splice(id, 1);
                    }
                    Swal.fire('Información', "Se eliminó el familiar correctamente.", 'success');
                }
            }
        );
    }

    completo() {
        this.familyAdded.emit(true);
    }

    SaveFamPep = () => {

        let P_FAMILY_LIST: any = [];

        if (this.fam_list.length > 0) {

            // calidad de datos disabled
            if (!this.FL_DATA_QUALITY) {
                console.log("DIsabled calidad de datos");
                Swal.fire({
                    title: 'Información',
                    text: "¿Estás seguro que los datos ingresados son correctos?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                }).then(
                    result => {
                        if (!result.isConfirmed) {
                            console.log("Seleccionó no");
                            return;
                        }
                    }
                );

            }

            this.fam_list.forEach(
                lista => {
                    let dataPepFamily: any = {};

                    dataPepFamily.P_NID_COTIZACION = this.idCotizacion;
                    dataPepFamily.P_SCLIENT = '0' + lista.pntypedoc.toString() + padLeft('0000' + lista.psnumdoc, '0', 12);
                    dataPepFamily.P_NIDDOC_TYPE = lista.pntypedoc;
                    dataPepFamily.P_SIDDOC = lista.psnumdoc;
                    dataPepFamily.P_NRELATIONSHIP = lista.pnrelation;
                    dataPepFamily.P_SNAMES = lista.psnames;
                    dataPepFamily.P_SLASTNAMES = lista.pslastnames;
                    dataPepFamily.P_SPOST_PEP = lista.pspostpep;
                    dataPepFamily.P_NREL_PEP = lista.pnrelpep;
                    dataPepFamily.P_NCONDITION_PEP = lista.pnconditionpep;
                    dataPepFamily.P_STYPE_ORGANIZATION = lista.name_type_organization;
                    dataPepFamily.P_NTYPE_ORGANIZATION = lista.n_type_organization;
                    dataPepFamily.P_DINI_WORK = lista.ini_date;
                    dataPepFamily.P_DFIN_WORK = lista.fin_date;
                    dataPepFamily.P_CHECK_LABORAL = lista.check_laboral;
                    dataPepFamily.P_NCODE = lista.codes;
                    dataPepFamily.P_SDESCRIPTION_CODE = lista.description_codes;
                    P_FAMILY_LIST.push(dataPepFamily);
                }
            );
        }
        //if(this.fam_list.length < 3){
        //    Swal.fire('Información', "Debe ingresar 3 familiar PEP.", 'info');
        //}else{
        this.quotationService.postFamily(P_FAMILY_LIST).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', "Los datos se registraron correctamente.", 'success');
                    this.completo();
                    this.reference.close();
                } else {
                    Swal.fire('Información', "Error al registrar los datos.", 'error');
                }
            }
        );
        //}
    }

    async getPepFam() {
        let cotClie: any = {
            P_NID_COTIZACION: this.idCotizacion,
            P_SCLIENT: this.sclient
        };

        await this.quotationService.getDatosPepFam(cotClie)
            .toPromise()
            .then(res => {
                let i = 0;
                //debugger
                res.forEach(lista => {
                    this.fam_list.push({
                        id: i++,
                        pnidcotiza: lista.P_NID_COTIZACION,
                        pntypeclient: lista.P_NTYPE_CLIENT,
                        psclient: lista.P_SCLIENT,
                        pntypepep: lista.P_NTYPE_PEP,
                        pnomrelation: lista.P_NRELATIONSHIP,
                        pscliename: lista.P_SCLIENAME,
                        pntnumdoc: lista.P_NTNUM_DOC,
                        pspostpep: lista.P_SPOST_PEP,
                        psnames: lista.P_SNAMES,
                        pslastnames: lista.P_SLASTNAMES,
                        pntypedoc: lista.P_NIDDOC_TYPE,
                        psnumdoc: lista.P_SIDDOC,
                        pnrelation: lista.P_NRELATIONSHIPS,
                        pnrelpep: lista.P_NREL_PEP,
                        pnconditionpep: lista.P_NCONDITION_PEP,
                        name_type_organization: lista.P_STYPE_ORGANIZATION,
                        ini_date: lista.P_DINI_WORK ?? "",
                        fin_date: lista.P_DFIN_WORK ?? "",
                        check_laboral: lista.P_CHECK_LAB ?? 0,
                        n_type_organization: lista.P_NTYPE_ORGANIZATION,
                        codes: lista.P_NCODE,
                        description_codes: lista.P_SDESCRIPTION_CODE
                    });
                }
                );
            }
            );
    }

    validarTextoKeyPress(event: any, type: string) {
        if (type == '') return;
        CommonMethods.textValidate(event, type);
    }

    changeDocumentType() {
        this.familys.psnumdoc = "";
    }

    changeCodeType(event: any) {
        this.familys.description_codes = event.SDESCRIPT;
    }

    async getProfileProduct() {

        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.CONSTANTS.COD_CHA_PRODUCTO;
        profile = await this.parameterSettingsService.getProfileProduct(_data).toPromise();

        return profile;
    }

    disableInputsforDataQuality() {

        // Bloquear campos de nombres y apellidos
        if (this.FL_DATA_QUALITY) {
            return true;
        }
        // Habilitar todos los campos para digitación manual
        else {
            return false
        }
    }

}