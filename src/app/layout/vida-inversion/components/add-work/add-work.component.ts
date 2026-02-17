import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef, Output } from '@angular/core';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { CommonMethods } from '@root/layout/broker/components/common-methods';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import Swal from 'sweetalert2';
import moment from 'moment';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-add-work',
    templateUrl: './add-work.component.html',
    styleUrls: ['./add-work.component.scss']
})

export class AddWorkComponent implements OnInit {
    @Output() workAdded: EventEmitter<any> = new EventEmitter();
    @Input() public reference: any;
    CONSTANTS: any = VidaInversionConstants;
    COD_PROD_PROFILE = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    work_list: any = [];
    //TYPE_CURRENCY: any;
    //work_cod_currency: any;
    parse_amount: any;
    work: any;
    toggle_edit_work: boolean;
    toggle_add_work: boolean;
    type_client: any;
    ORGANIZATION: any;
    idCotizacion: any; //this.reference.quotation_id
    sclient: any; //this.reference.sclient
    profile_id: any;
    fin_date_disabled:boolean = false;

    list_relations: any = [
        {Id: 1, Name: "CONTRATANTE"},
        {Id: 2, Name: "ASEGURADO"},
        {Id: 3, Name: "DATOS DEL PEP"}
    ];

    constructor(
        public clientInformationService: ClientInformationService,
        public quotationService: QuotationService,
        private parameterSettingsService: ParameterSettingsService
    ) { }

    async ngOnInit() {
        
        this.profile_id = await this.getProfileProduct();
        // this.getWorks()
        this.idCotizacion = this.reference.quotation_id;//19970;//
        this.sclient = this.reference.sclient;//"02000084584251";//
        this.ORGANIZATION = [
            {id: 0, value: "Seleccione"},
            {id: 1, value: "Organismo Público"},
            {id: 2, value: "Organismo Internacional"},
        ]

        this.fin_date_disabled = false;

        this.work = {
            id: 0,
            type_client: {Id: 0},
            place_work: "",
            position: "",
            ini_date: "",
            fin_date: "",
            salary: "",
            check_laboral:""
        }
        this.toggle_add_work = true;
        this.toggle_edit_work = false;

        await this.getWorks();
        this.cancelWork();
    }

    resolveTextTypeClient(typeClient: number): string {
        switch (typeClient) {
            case 1:
                return "CONTRATANTE";
            case 2:
                return "ASEGURADO";
            case 3:
                return "DATOS DEL PEP";
            default:
                return "";
        }
    }

    changeCheckLab(): void {
        this.work.fin_date = ""
        if(this.work.check_laboral) {
            this.fin_date_disabled = true;
        }else{
            this.fin_date_disabled = false;
        }
    }

    resetWork(): void {
        this.fin_date_disabled = false;
        this.work = {
            id: 0,
            type_client: {Id: 0},
            place_work: "",
            position: "",
            ini_date: "",
            fin_date: "",
            salary: "",
            check_laboral: false
        }
    }

    public VALIDATE_WORK(work): any {
        let workInitDate = moment(work.ini_date).startOf('day').toDate()
        let workFinDate = moment(!this.fin_date_disabled ? work.fin_date:new Date()).startOf('day').toDate()
        let diaActualNoFormat = moment(new Date()).toDate();
        let diaActual = new Date(diaActualNoFormat.getFullYear(), diaActualNoFormat.getMonth(), diaActualNoFormat.getDate());
        let response = { cod_error: 0, message_error: "" }
        
        if (work.place_work == "") {
            response.message_error += 'Se debe ingresar el centro de trabajo. <br>';
            response.cod_error = 1;
        }

        if (work.position == "") {
            response.message_error += 'Se debe ingresar el cargo. <br>';
            response.cod_error = 1;
        }

        if (work.ini_date == "") {
            response.message_error += 'Se debe ingresar la fecha de inicio. <br>';
            response.cod_error = 1;
        }

        if (work.fin_date == "" && !this.fin_date_disabled) {
            response.message_error += 'Se debe ingresar la fecha de cese. <br>';
            response.cod_error = 1;
        }
        
        if (workInitDate > diaActual) {
            response.message_error += 'La fecha de inicio no puede ser mayor a la fecha actual. <br>';
            response.cod_error = 1;
        }

        if (!this.fin_date_disabled && workFinDate > diaActual) {
            response.message_error += 'La fecha de cese no puede ser mayor a la fecha actual. <br>';
            response.cod_error = 1;
        }

        if (!this.fin_date_disabled && workInitDate > workFinDate) {
            response.message_error += 'La fecha de inicio no puede ser mayor a la fecha de cese. <br>';
            response.cod_error = 1;
        }

        if (work.salary == "") {
            response.message_error += 'Se debe ingresar el sueldo. <br>';
            response.cod_error = 1;
        }

        if (work.type_client == null || work.type_client.Id == null) {
            response.message_error += 'Se debe seleccionar la relación del trabajo. <br>';
            response.cod_error = 1;
        }

        if(this.fin_date_disabled) {
            const findWork = this.work_list.find(x => x.check_laboral == 1 && x.id != work.id && x.type_client == (work.type_client.Id));
            console.log("findWork: ", findWork);
            if(findWork) { 
                switch (work.type_client.Id) {
                    case 1:
                        response.message_error += 'Solo debe registrar un trabajo con opcion actualmente laborando para el contratante. <br>';
                        response.cod_error = 1;
                        break;
                    case 2:
                        response.message_error += 'Solo debe registrar un trabajo con opcion actualmente laborando para el asegurado. <br>';
                        response.cod_error = 1;
                        break;
                    case 3:
                        response.message_error += 'Solo debe registrar un trabajo con opcion actualmente laborando para el pep. <br>';
                        response.cod_error = 1;
                        break;
                }
                // response.message_error += 'Solo debe registrar un trabajo con opcion actualmente laborando. <br>';
                // response.cod_error = 1;
            }
        }

        return response;
    }
  
    addWork = () => {
        const customswal = Swal.mixin({
            confirmButtonColor: "553d81",
            focusConfirm: false,
        })

        let validate_error = this.VALIDATE_WORK(this.work);
        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return
        } 
        console.log("this.work: ", this.work);
        if(this.work_list.filter(x => x.type_client == this.work.type_client.Id).length >= 3) {
            switch (this.work.type_client.Id) {
                case 1:
                    customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al contratante, como máximo.", 'error');
                    return
                case 2:
                    customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al asegurado, como máximo.", 'error');
                    return
                case 3:
                    customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al pep, como máximo.", 'error');
                    return
            }
            // customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al contratante, como máximo.", 'error');
            // return
        }
        // if(this.work_list.filter(x => x.type_client == 2).length >= 3) {
        //     customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al asegurado, como máximo.", 'error');
        //     return
        // }

        // if (this.work_list.filter(x => x.type_client == 3).length >= 3) {
        //     customswal.fire('Información', "Solo puede agregar 3 trabajos con relacion al pep, como máximo.", 'error');
        //     return
        // }
        
        let itemTrabajo = {
            id: 0,
            place_work: this.work.place_work,
            type_client: this.work.type_client.Id,
            position: this.work.position,
            ini_date: this.work.ini_date.getDate().toString().padStart(2, '0') + '/' + (this.work.ini_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.work.ini_date.getFullYear(),
            fin_date: this.work.check_laboral ? "" : (this.work.fin_date.getDate().toString().padStart(2, '0') + '/' + (this.work.fin_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.work.fin_date.getFullYear()),
            salary: this.work.salary,
            check_laboral: this.work.check_laboral ? 1 : 0
        }

        this.work_list.push(itemTrabajo);

        let count = 0;

        for (var i = 0; i < this.work_list.length; i++) {
            this.work_list[i].id = ++count;
        }

        this.cancelWork();
        customswal.fire('Información', "Se agregó el trabajo correctamente.", 'success');
            

    }

    editWork = (item_work) => {
        // console.log("item-work: ", item_work)
        var partesFecha_1 = item_work.ini_date.split('/');
        var dia = parseInt(partesFecha_1[0]); // Parsea el día como entero
        var mes = parseInt(partesFecha_1[1]) - 1; // Parsea el mes (resta 1 ya que en JavaScript los meses van de 0 a 11)
        var anio = parseInt(partesFecha_1[2]); // Parsea el año
        var fecha_1 = new Date(anio, mes, dia);

        var fecha_2
        if(item_work.check_laboral == 0){
            var partesFecha_2 = item_work.fin_date.split('/');
            var dia = parseInt(partesFecha_2[0]); // Parsea el día como entero
            var mes = parseInt(partesFecha_2[1]) - 1; // Parsea el mes (resta 1 ya que en JavaScript los meses van de 0 a 11)
            var anio = parseInt(partesFecha_2[2]); // Parsea el año
            fecha_2 = new Date(anio, mes, dia);
        }else{
            fecha_2 = ""
            this.fin_date_disabled = true;
        }

        //debugger
        this.work = {
            id: item_work.id,
            place_work: item_work.place_work,
            type_client: {Id:item_work.type_client},
            position: item_work.position,
            ini_date: fecha_1,
            fin_date: fecha_2,
            salary: item_work.salary,
            check_laboral: item_work.check_laboral == 1 ? true : false
        }

        this.toggle_edit_work = true;
        this.toggle_add_work = false;
    }

    updateWork = () => {
        //debugger
            
        let validate_error = this.VALIDATE_WORK(this.work);
        if (validate_error.cod_error == 1) {
            Swal.fire('Información', validate_error.message_error, 'error');
            return;
        }

        const new_list_work = this.work_list.map((item) => {
            if (item.id == this.work.id) {
                //debugger
                item.id = this.work.id;
                item.place_work = this.work.place_work;
                item.type_client = this.work.type_client.Id;
                item.position = this.work.position;
                item.ini_date = this.work.ini_date.getDate().toString().padStart(2, '0') + '/' + (this.work.ini_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.work.ini_date.getFullYear();
                item.fin_date = this.work.check_laboral ? "" : this.work.fin_date.getDate().toString().padStart(2, '0') + '/' + (this.work.fin_date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.work.fin_date.getFullYear();
                item.salary = this.work.salary;
                item.check_laboral = this.work.check_laboral ? 1 : 0;

            }

            return item;
        });

        this.work_list = new_list_work;
        this.toggle_edit_work = false;
        this.toggle_add_work = true;
        this.resetWork()

        const customswal = Swal.mixin({
            confirmButtonColor: "553d81",
            focusConfirm: false,
        });

        customswal.fire('Información', "El trabajo fue editado.", 'success');
       
    }

    cancelWork = () => {
        this.resetWork()
        this.fin_date_disabled = false;
        this.toggle_edit_work = false;
        this.toggle_add_work = true;
    }

    deleteWork = (item_id) => {
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
                    const id = this.work_list.findIndex((element: any) => element.id == item_id);
                    if (id != -1) {
                        this.work_list.splice(id, 1);
                    }
                    Swal.fire('Información', "Se eliminó el trabajo correctamente.", 'success');
                }
            }
        );
    }


    changeStyleCredit2(value) {
        let resnpose = this.CONSTANTS.changeStyleCredit(value);
        this.parse_amount = resnpose.parse_amount;
        this.work.salary = resnpose.amount;
    }

    validarTextoKeyPress(event: any, type: string) {
        if (type == '') return;
        CommonMethods.textValidate(event, type);
    }

    completo() {
        this.workAdded.emit(true);
    }
    SaveWork = () => {

        let P_WORK_LIST: any = [];
        //debugger
        if (this.work_list.length > 0) {
            this.work_list.forEach(
                lista => {
                    let dataPepWork: any = {};
                    dataPepWork.P_NID_COTIZACION = this.idCotizacion;
                    dataPepWork.P_SCLIENT = this.sclient;
                    dataPepWork.P_NTYPE_CLIENT = lista.type_client;
                    dataPepWork.P_SCENTRAL_WORK = lista.place_work;
                    dataPepWork.P_SJOB_POSITION = lista.position;
                    dataPepWork.P_DINI_WORK = lista.ini_date;
                    dataPepWork.P_DFIN_WORK = lista.fin_date;
                    dataPepWork.P_CHECK_LAB =  lista.check_laboral;
                    dataPepWork.P_NSALARY = lista.salary;
                    P_WORK_LIST.push(dataPepWork);
                }
            );
        }else{
            let dataPepWork: any = {};
                    dataPepWork.P_NID_COTIZACION = this.idCotizacion;
                    dataPepWork.P_SCLIENT = "00000000000000";
                    dataPepWork.P_SCENTRAL_WORK = "";
                    dataPepWork.P_NTYPE_CLIENT = 1;
                    dataPepWork.P_SJOB_POSITION = "";
                    dataPepWork.P_DINI_WORK = "";
                    dataPepWork.P_DFIN_WORK = "";
                    dataPepWork.P_CHECK_LAB = 0;
                    dataPepWork.P_NSALARY = 0;
                    P_WORK_LIST.push(dataPepWork);
        }
            
        this.quotationService.postWorks(P_WORK_LIST).subscribe(
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
    }

    async getWorks() {
        let cotClie: any = {
            P_NID_COTIZACION: this.idCotizacion, P_SCLIENT: this.sclient
        };

        await this.quotationService.getDatoWorks(cotClie).toPromise().then(
            res => {
                        let i = 1;
                        res.forEach(
                            lista => {
                                const listWork: any = {}
                                listWork.id = i++;
                                listWork.place_work = lista.P_SCENTRAL_WORK;
                                listWork.type_client = lista.P_NTYPE_CLIENT;
                                listWork.position = lista.P_SJOB_POSITION;
                                listWork.ini_date = lista.P_DINI_WORK;
                                listWork.fin_date = lista.P_DFIN_WORK;
                                listWork.salary = lista.P_NSALARY;
                                listWork.check_laboral = lista.P_CHECK_LAB;
                                this.work_list.push(listWork);
                            }
                        );
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
}