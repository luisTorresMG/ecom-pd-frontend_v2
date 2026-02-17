import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef, Output } from '@angular/core';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { CommonMethods } from '@root/layout/broker/components/common-methods';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import Swal from 'sweetalert2';
import moment from 'moment';
import { padLeft } from '../../../../shared/helpers/utils';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { element } from 'protractor';

@Component({
    selector: 'app-add-family',
    templateUrl: './add-family.component.html',
    styleUrls: ['./add-family.component.scss']
})

export class AddFamilyComponent implements OnInit {
    @Output() relativeAdded: EventEmitter<any> = new EventEmitter();
    @Input() public reference: any;
    CONSTANTS: any = VidaInversionConstants;
    COD_PROD_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    work_list: any = [];
    relatives_list = [];
    profile_id: any;

    RESIDENCE: any;
    list_civil_status_pep: any;

    TYPE_PEP: any;

    work_cod_currency: any;
    parse_amount: any;

    isLoading: boolean = false;

    work: any;
    relatives: any = {
        pnrelation: { codigo: "", SDESCRIPT: "Seleccione" },
        psnationality: "",
        pntypedoc: { codigo: "", SDESCRIPT: "Seleccione" },
        psnumdoc: "",
        psnames: "",
        pslastnames: "",

    };

    toggle_edit_relative: boolean;
    toggle_add_relative: boolean;

    idCotizacion: any; //this.reference.quotation_id
    sclient: any; //this.reference.sclient
    type_client: any;
    list_document_type: any = [];
    list_relationship_type: any = [];
    list_nacionality: any = [];
    list_civilStatus: any = [];
    relationship: any;

    constructor(
        public clientInformationService: ClientInformationService,
        public quotationService: QuotationService,
        private parameterSettingsService: ParameterSettingsService
    ) { }

    async ngOnInit() {

        this.isLoading = true;

        try {

            this.profile_id = await this.getProfileProduct();
            this.idCotizacion = this.reference.quotation_id;//19970;//
            this.sclient = this.reference.sclient;//"02000084584251";//
            this.type_client = 2;//this.reference.type_client;

            this.TYPE_PEP = [
                { id: 0, value: "CONTRATANTE" },
                { id: 1, value: "ASEGURADO" }
            ]

            this.work = {
                id: 0,
                place_work: "",
                name_type_organization: "",
                position: "",
                code_work: "",
                ini_date: "",
                fin_date: "",
                currency: "",
                salary: ""
            }

            this.resetFamily()

            this.toggle_add_relative = true;
            this.toggle_edit_relative = false;

            const request_relation = { Nbranch: this.CONSTANTS.RAMO, Nproduct: this.CONSTANTS.COD_PRODUCTO };

            this.list_relationship_type = await this.quotationService.getRelationsPep(request_relation).toPromise();

            this.list_document_type = await this.clientInformationService.getDocumentTypeList(this.COD_PROD_PROFILE).toPromise();

            this.list_nacionality = await this.clientInformationService.getNationalityList().toPromise();

            this.list_civilStatus = await this.clientInformationService.getCivilStatusList().toPromise();

            this.work.currency = { NNATIONALITY: 0 };

            await this.getPepRelatives();
            this.cancelRelative();

        } catch (error) {
            console.log("error: ", error)
        } finally {
            this.isLoading = false;
        }
    }

    public VALIDATE_RELATIVES(relatives): any {

        let response = { cod_error: 0, message_error: "" }

        if (relatives.pnrelation.codigo == "") {
            response.message_error += 'Se debe seleccionar el tipo de pariente . <br>';
            response.cod_error = 1;
        }

        if (relatives.psnationality == "") {
            response.message_error += 'Se debe ingresar nacionalidad del pariente. <br>';
            response.cod_error = 1;
        }

        if (relatives.pntypedoc.codigo == "") {
            response.message_error += 'Se debe seleccionar tipo de documento del pariente. <br>';
            response.cod_error = 1;
        }

        if (relatives.psnumdoc == "") {
            response.message_error += 'Se debe ingresar numero del documento del pariente. <br>';
            response.cod_error = 1;
        }

        if (relatives.psnumdoc != "" && relatives.pntypedoc.codigo == 2 && relatives.psnumdoc.length != 8) {

            response.message_error += 'El numero documento del familiar pep, debe tener 8 caracteres. <br>';
            response.cod_error = 1;
        }

        if (relatives.psnumdoc != "" && relatives.pntypedoc.codigo == 4 && (relatives.psnumdoc.length < 8 || relatives.psnumdoc.length > 12)) {

            response.message_error += 'El numero documento del familiar pep, debe tener entre 8 - 12 caracteres. <br>';
            response.cod_error = 1;
        }

        if (relatives.psnames == "") {
            response.message_error += 'Se debe ingresar nombres del pariente . <br>';
            response.cod_error = 1;
        }

        if (relatives.pslastnames == "") {
            response.message_error += 'Se debe ingresar apellidos del pariente. <br>';
            response.cod_error = 1;
        }

        return response;
    }

    resetFamily = () => {
        this.relatives = {
            id: 0,
            pnrelation: { codigo: "", SDESCRIPT: "Seleccione" },
            pntypedoc: { codigo: "", Name: "Seleccione" },
            psnames: "",
            pslastnames: "",
            psnumdoc: "",
            psnationality: "",

        }
    }

    addRelative = () => {
        const customswal = Swal.mixin({
            confirmButtonColor: "553d81",
            focusConfirm: false,
        })
        //debugger
        let validate_error = this.VALIDATE_RELATIVES(this.relatives);

        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return
        }
        //debugger
        const id = this.relatives_list.findIndex((element: any) => element.psnumdoc == this.relatives.psnumdoc);

        if (id != -1) {
            Swal.fire('Información', 'No. de Documento de Identidad del pariente existe <br> Pariente: ' + this.relatives_list[id].pslastnames.toLocaleUpperCase() + ' ' + this.relatives_list[id].psnames.toLocaleUpperCase(), 'error');
            return
        }

        let itemRelative = {
            id: 0,
            pnrelation: this.relatives.pnrelation.COD_ELEMENTO, // CODIGO DE PARIENTE
            psdescript: this.relatives.pnrelation.GLS_ELEMENTO, // DESCRIPCION DE PARIENTE
            pnomrelation: this.relatives.pnrelation.GLS_ELEMENTO,
            psnationality: this.relatives.psnationality,
            pntypedoc: this.relatives.pntypedoc.Id, // CODIGO TIPO DOCUMENTO
            psnumdoc: this.relatives.psnumdoc,
            pntnumdoc: this.relatives.pntypedoc.Name + '-' + this.relatives.psnumdoc, // DESCRIPCION TIPO DOCUMENTO
            psnames: this.relatives.psnames,
            pslastnames: this.relatives.pslastnames,
            pscliename: this.relatives.pslastnames + ' ' + this.relatives.psnames,
            pntypeclient: 4,
        }
        this.relatives_list.push(itemRelative);
        let count = 0;
        for (var i = 0; i < this.relatives_list.length; i++) {
            this.relatives_list[i].id = ++count;
        }
        this.cancelRelative();
        customswal.fire('Información', "Se agregó el pariente correctamente.", 'success');

    }

    editRelative = (item_relatives) => {
        this.relatives = {
            id: item_relatives.id,
            pnrelation: { COD_ELEMENTO: item_relatives.pnrelation, GLS_ELEMENTO: item_relatives.psdescript },
            psnationality: item_relatives.psnationality,
            pntypedoc: { Id: item_relatives.pntypedoc },
            psnumdoc: item_relatives.psnumdoc,
            psnames: item_relatives.psnames,
            pslastnames: item_relatives.pslastnames,
        }

        this.toggle_edit_relative = true;
        this.toggle_add_relative = false;
    }

    updateRelative = () => {
        let validate_error = this.VALIDATE_RELATIVES(this.relatives);
        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return
        }

        const new_list = this.relatives_list.map((item) => {
            if (item.id == this.relatives.id) {
                //debugger
                item.id = this.relatives.id;
                item.psnames = this.relatives.psnames;
                item.pslastnames = this.relatives.pslastnames,
                    item.psnumdoc = this.relatives.psnumdoc,
                    item.pscliename = this.relatives.pslastnames + ' ' + this.relatives.psnames,
                    item.psnationality = this.relatives.psnationality,
                    item.pntypedoc = this.relatives.pntypedoc.Id,
                    item.pnrelation = this.relatives.pnrelation.COD_ELEMENTO,
                    item.pnomrelation = this.relatives.pnrelation.GLS_ELEMENTO
                item.pntnumdoc = this.relatives.pntypedoc.Name + '-' + this.relatives.psnumdoc,
                    item.psdescript = this.relatives.pnrelation.GLS_ELEMENTO
            }
            return item;
        });

        this.relatives_list = new_list;
        this.toggle_edit_relative = false;
        this.toggle_add_relative = true;
        this.resetFamily()

        const customswal = Swal.mixin({
            confirmButtonColor: "553d81",
            focusConfirm: false,
        });

        customswal.fire('Información', "El pariente fue editado.", 'success');
    }

    cancelRelative = () => {
        this.resetFamily()
        this.toggle_edit_relative = false;
        this.toggle_add_relative = true;
    }

    deleteRelative = (item_id) => {
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
                    const id = this.relatives_list.findIndex((element: any) => element.id == item_id);
                    if (id != -1) {
                        this.relatives_list.splice(id, 1);
                    }
                    Swal.fire('Información', "Se eliminó el pariente correctamente.", 'success');
                }
            }
        );
    }

    completo() {
        this.relativeAdded.emit(true);
    }

    SaveRelativePep = () => {
        //debugger
        let P_RELATIVE_LIST: any = [];
        //debugger
        if (this.relatives_list.length > 0) {
            this.relatives_list.forEach(
                lista => {
                    let dataPepRelative: any = {};
                    dataPepRelative.P_NID_COTIZACION = this.idCotizacion;
                    dataPepRelative.P_SCLIENT = '0' + lista.pntypedoc.toString() + padLeft('0000' + lista.psnumdoc, '0', 12);
                    dataPepRelative.P_NIDDOC_TYPE = lista.pntypedoc;
                    dataPepRelative.P_SIDDOC = lista.psnumdoc;
                    dataPepRelative.P_NRELATIONSHIPS = lista.pnrelation;
                    dataPepRelative.P_SNAMES = lista.psnames;
                    dataPepRelative.P_SLASTNAMES = lista.pslastnames;
                    dataPepRelative.P_SNATIONALITY = lista.psnationality;
                    P_RELATIVE_LIST.push(dataPepRelative);
                }
            );
        } else {
            let dataPepRelative: any = {};
            dataPepRelative.P_NID_COTIZACION = this.idCotizacion;
            dataPepRelative.P_SCLIENT = "00000000000000";;
            dataPepRelative.P_NIDDOC_TYPE = "";
            dataPepRelative.P_SIDDOC = "";
            dataPepRelative.P_NRELATIONSHIPS = "";
            dataPepRelative.P_SNAMES = "";
            dataPepRelative.P_SLASTNAMES = "";
            dataPepRelative.P_SNATIONALITY = "";
            P_RELATIVE_LIST.push(dataPepRelative);


        }
        //if(this.relatives_list.length < 3){
        //    Swal.fire('Información', "Debe ingresar familiares PEP.", 'info');
        //}else{
        this.quotationService.postRelative(P_RELATIVE_LIST).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', "Los datos se registraron correctamente.", 'success');
                    this.completo()
                    this.reference.close();
                } else {
                    Swal.fire('Información', "Error al registrar los datos.", 'error');
                }
            }
        );
        //}



    }

    async getPepRelatives() {
        let cotClie: any = {
            P_NID_COTIZACION: this.idCotizacion, P_SCLIENT: this.sclient
        };
        //debugger
        await this.quotationService.getDatosPepRelatives(cotClie).toPromise().then(
            res => {
                let i = 1;
                res.forEach(
                    lista => {
                        const listRelative: any = {}
                        listRelative.id = i++;
                        listRelative.pnidcotiza = lista.P_NID_COTIZACION;
                        listRelative.pntypeclient = lista.P_NTYPE_CLIENT;
                        listRelative.psclient = lista.P_SCLIENT;
                        listRelative.psdescript = lista.P_SDESCRIPT;
                        listRelative.pnomrelation = lista.P_NRELATIONSHIP;
                        listRelative.pscliename = lista.P_SCLIENAME;
                        listRelative.pntnumdoc = lista.P_NTNUM_DOC;
                        listRelative.psnationality = lista.P_SNATIONALITY;
                        listRelative.psnames = lista.P_SNAMES;
                        listRelative.pslastnames = lista.P_SLASTNAMES;
                        listRelative.pntypedoc = lista.P_NIDDOC_TYPE;
                        listRelative.psnumdoc = lista.P_SIDDOC;
                        listRelative.pnrelation = lista.P_NRELATIONSHIPS;
                        this.relatives_list.push(listRelative);
                    }
                );
            }
        );
    }

    changeStyleCredit2(value) {
        // let format_amount = parseInt(this.work.salary.replace(/,/g, ''));
        // this.parse_amount = CommonMethods.formatNUMBER(format_amount);
        // this.work.salary = this.parse_amount;
        // if (this.work.salary.toUpperCase() == "NAN") {
        //     this.work.salary = '';
        // }
        let resnpose = this.CONSTANTS.changeStyleCredit(value);
        this.parse_amount = resnpose.parse_amount;
        this.work.salary = resnpose.amount;
    }

    validarTextoKeyPress(event: any, type: string) {
        if (type == '') return;
        CommonMethods.textValidate(event, type);
    }

    changeDocumentType() {
        this.relatives.psnumdoc = "";
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
}