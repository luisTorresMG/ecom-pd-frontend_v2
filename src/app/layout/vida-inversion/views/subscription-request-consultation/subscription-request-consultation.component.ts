import { Component, OnInit } from "@angular/core";
import { VidaInversionConstants } from "../../vida-inversion.constants";
import { ClientInformationService } from "../../../broker/services/shared/client-information.service";
import Swal from "sweetalert2";
import { VidaInversionService } from "../../services/vida-inversion.service";

@Component({
    selector: 'app-subscription-request-consultation.component',
    templateUrl: './subscription-request-consultation.component.html',
    styleUrls: ['./subscription-request-consultation.component.css']
})
export class SubscriptionRequestConsultationComponent implements OnInit{
    TYPE_DOCUMENT: any;
    TYPE_CLIENT: any;
    mensaje:string;
    requests_list: any = [];
    CONSTANTS: any = VidaInversionConstants;
    isLoading: boolean = false;

    params: any = {
        P_NPRODUCT: '',
        P_NPOLICY: '',
        P_DFEC_INI: new Date(),
        P_DFEC_FIN: new Date(),
        P_NTYPE_CLI: '',
        P_NTYPE_DOC: '',
        P_SNUM_DOC: '',
        P_SNAMES: '',
        P_SAPE_PAT: '',
        P_SAPE_MAT: '',
        P_NBRANCH: '',
        P_NUSERCODE: ''
    };

    SEARCH_PARAMS = {
        product: "Vida Inversión Global Protecta",
        poliza: "",
        client_type: {
            codigo: "0",
            valor: 'AMBOS'
        },
        document_type: {
            Id: 0,
            Name: ""
        },
        document_number: "",
        name: "",
        lastname1: "",
        lastname2: "", 
        date_start: new Date,
        date_end: new Date,


        document_type_disabled: false,
        document_number_disabled: true,
        number: 0
    }
    current_day: any = new Date;
    constructor(public clientInformationService: ClientInformationService,
            private vidaInversionService: VidaInversionService){}

    async ngOnInit() {
        this.TYPE_CLIENT = [
            { codigo: "0", valor: 'AMBOS' },
            { codigo: "1", valor: 'CONTRATANTE' },
            { codigo: "2", valor: 'ASEGURADO' },
        ];
    }

    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    changeDocumentType() {
        if (this.SEARCH_PARAMS.document_type.Id == undefined) {
            this.SEARCH_PARAMS.document_number = "";
            this.SEARCH_PARAMS.document_number_disabled = true;
        } else {
            this.SEARCH_PARAMS.document_number = "";
            this.SEARCH_PARAMS.document_number_disabled = false;
            if (this.SEARCH_PARAMS.document_type.Id == 2){
                this.SEARCH_PARAMS.number = 8
            }else{
                this.SEARCH_PARAMS.number = 12
            }
        }
    }

    buscar() {
        this.mensaje = ""
        if (this.SEARCH_PARAMS.document_type.Id == undefined) {
            this.mensaje = "Se debe ingresar el tipo de documento.";
        } else if (this.SEARCH_PARAMS.document_number == "") {
            this.mensaje = "Se debe ingresar el número de documento.";
        } else if (this.SEARCH_PARAMS.document_type.Id == 2 && (this.SEARCH_PARAMS.document_number.length < 8 || this.SEARCH_PARAMS.document_number.length > 8)) {
            this.mensaje = "Cantidad de caracteresdel DNI Incorrecto";
        } else if (this.SEARCH_PARAMS.document_type.Id == 4 && (this.SEARCH_PARAMS.document_number.length < 8)) {
            this.mensaje = "Cantidad de caracteresdel CE Incorrecto";
        } else if (this.SEARCH_PARAMS.date_start > this.SEARCH_PARAMS.date_end) {
            this.mensaje = "La fecha final debe ser mayor a la fecha inicial.";
        }
        else {
            this.mensaje = "Buscando...";
        }
        
     


        // this.params.P_NPRODUCT = this.SEARCH_PARAMS.product,
        // this.params.P_NPOLICY = this.SEARCH_PARAMS.poliza,
        // this.params.P_NTYPE_CLI = this.SEARCH_PARAMS.client_type,
        // this.params.P_NTYPE_DOC = this.SEARCH_PARAMS.document_type,
        // this.params.P_SNUM_DOC = this.SEARCH_PARAMS.document_number,
        // this.params.P_SNAMES = this.SEARCH_PARAMS.
        // this.params = this.SEARCH_PARAMS
        // this.params = this.SEARCH_PARAMS

        // this.vidaInversionService.ListarReportePolizaTransaccionVIGP(this.params).subscribe(
        //     res => {
        //         if (res.Result.P_NCODE == 0) {
            
        //             if (this.policyList.length == 0) {
        //                 Swal.fire(
        //                     {
        //                         title: 'Información',
        //                         text: 'No se encontraron pólizas con los filtros ingresados.',
        //                         icon: 'error',
        //                         confirmButtonText: 'OK',
        //                         allowOutsideClick: false,
        //                     }
        //                 ).then(
        //                     res => {
        //                         if (res.value) {
        //                             return;
        //                         }
        //                     }
        //                 );
        //             }
        //         } else {
        //             this.isLoading = false;
        //             Swal.fire('Información', res.Result.P_SMESSAGE, 'error')
        //         }
        //     },
        //     err => {
        //         this.isLoading = false;
        //         Swal.fire('Información', 'Ha ocurrido un error al obtener las pólizas.', 'error')
        //     }
        // );
        // Swal.fire({
        //     title: 'Información',
        //     text: this.mensaje,
        //     icon: 'error',
        //     confirmButtonText: 'Ok',
        //     allowOutsideClick: false
        // })

    }
}
