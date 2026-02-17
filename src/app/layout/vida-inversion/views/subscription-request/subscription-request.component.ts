import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
import { VidaInversionConstants } from "../../vida-inversion.constants";
import { ClientInformationService } from "../../../broker/services/shared/client-information.service";
import { Router } from "@angular/router";
import { ParameterSettingsService } from "../../../broker/services/maintenance/parameter-settings.service";
import { VidaInversionService } from "../../services/vida-inversion.service";

@Component({
    selector: 'app-subscription-request.component',
    templateUrl: './subscription-request.component.html',
    styleUrls: ['./subscription-request.component.scss']
})
export class SubscriptionRequestComponent implements OnInit {

    current_day: any = new Date();
    date_ini: Date = new Date();
    date_act: Date = new Date();
    PRODUCT: any;
    TYPE_CLIENT: any;
    isLoading: boolean = false;
    policyList: any = [];
    mensaje: any = "";
    CONSTANTS: any = VidaInversionConstants;
    requests_list: any = [];

    profile_id: any;
    cod_prod_channel: any;
    search_params: any = {
        npolicy: "",
        date_start: new Date(),
        date_end: new Date(),
        nid_solicitud: "",
        document_type: {
            Id: "",
            Name: ""
        },
        document_number: "",
        contractor_name: ""
    };

    constructor(public clientInformationService: ClientInformationService,
        private router: Router,
        private parameterSettingsService: ParameterSettingsService,
        private vidaInversionService: VidaInversionService) { }

    async ngOnInit() {

        // this.search_params_INITIAL();
        this.date_ini.setDate(this.date_ini.getDate() - 15);

        this.search_params.date_start = this.date_ini;
        this.search_params.date_end = this.date_act;

        this.cod_prod_channel = JSON.parse(localStorage.getItem('codProducto'))['productId'];

        this.profile_id = await this.CONSTANTS.GET_PROFILE_PRODUCT(this.parameterSettingsService, this.cod_prod_channel);

        console.log(this.profile_id);


    }
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    changeDocumentType() {
        if (this.search_params.document_type.Id == undefined) {
            this.search_params.document_number = "";
            this.search_params.document_number_disabled = true;
        } else {
            this.search_params.document_number = "";
            this.search_params.document_number_disabled = false;
            if (this.search_params.document_type.Id == 2) {
                this.search_params.number = 8
            } else {
                this.search_params.number = 12
            }
        }
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

    suscripcion(NIDCOTIZACION) {
        this.router.navigate([`extranet/vida-inversion/nueva-solicitud-suscripcion/${NIDCOTIZACION}`]);
    };


    goToNuevaSolicitud(item) {
        this.router.navigate([`extranet/vida-inversion/nueva-solicitud-suscripcion/${item.NRO_COTIZACION}/${item.NID_SOLICITUD}`]);

    }

    searchList() {

        this.mensaje = "";

        if (this.search_params.document_type.Id !== undefined) {

            if (this.search_params.document_number == "") {
                this.mensaje += 'Se debe ingresar el número de documento del Contratante. <br>';

            } else if (this.search_params.document_type.Id == 2 && (this.search_params.document_number.length < 8 || this.search_params.document_number.length > 8)) {
                this.mensaje += 'Cantidad de caracteresdel DNI Incorrecto. <br>';

            } else if (this.search_params.document_type.Id == 4 && (this.search_params.document_number.length < 8)) {
                this.mensaje += 'Cantidad de caracteresdel CE Incorrecto. <br>';
            }
        }

        if (this.search_params.document_number) {

            if (!this.search_params.document_type.Id) {
                this.mensaje += 'Se debe ingresar el tipo de documento del contratante. <br>';
            }
        }

        if (this.search_params.date_start > this.search_params.date_end) {
            this.mensaje += 'La fecha fin de emisión debe ser mayor a la fecha inicio de emisión. <br>';
        }

        if (this.mensaje == "") {

            const search_request = {
                P_NBRANCH: this.CONSTANTS.RAMO,
                P_NPRODUCT: this.CONSTANTS.COD_PRODUCTO,
                P_NPOLICY: this.search_params.npolicy,
                P_DFEC_INI: this.search_params.date_start,
                P_DFEC_FIN: this.search_params.date_end,
                P_NTYPE_DOC: this.search_params.document_type.Id,
                P_SNUM_DOC: this.search_params.document_number,
                P_SNAMES: this.search_params.contractor_name,
                P_NIDPROFILE: this.profile_id
            }

            this.vidaInversionService.ListarSolicitudesSuscripcion(search_request).toPromise().then(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.isLoading = false;
                        this.policyList = res.Result.P_LIST
                        this.requests_list = this.policyList
                        if (this.policyList.length == 0) {
                            Swal.fire(
                                {
                                    title: 'Información',
                                    text: 'No se encontraron solicitudes con los filtros ingresados.',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                }
                            ).then(
                                res => {
                                    if (res.value) {
                                        return;
                                    }
                                }
                            );
                        }
                    } else {
                        this.isLoading = false;
                        Swal.fire('Información', res.Result.P_SMESSAGE, 'error')
                    }
                },
                err => {
                    this.isLoading = false;
                    Swal.fire('Información', 'Ha ocurrido un error al obtener las pólizas.', 'error')
                }
            );
        }
        else {
            Swal.fire({
                title: 'Información',
                text: this.mensaje,
                icon: 'error',
                confirmButtonText: 'Ok',
                allowOutsideClick: false
            })
        }
    }
    cleanParameters() { }
}



