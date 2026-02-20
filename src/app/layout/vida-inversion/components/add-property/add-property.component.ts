import { VidaInversionService } from '../../services/vida-inversion.service';
import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';

@Component({
    standalone: false,
    selector: 'app-add-property',
    templateUrl: './add-property.component.html',
    styleUrls: ['./add-property.component.scss']
})

export class AddPropertyComponent implements OnInit {

    @Input() public reference: any;
    isLoading: boolean = false;
    CONSTANTS: any = VidaInversionConstants;
    profile_id: any;

    data_quotation_pep = {
        P_NID_COTIZACION: null,
        P_SCLIENT: null,
        P_NSECCION: null,

        P_SINMUEBLES: null,
        P_SVEHICULOS: null,
    }

    constructor(
        private vidaInversionService: VidaInversionService,
        private parameterSettingsService: ParameterSettingsService
    ) { }

    async ngOnInit() {
        this.profile_id = await this.getProfileProduct();
        this.isLoading = true;
        this.data_quotation_pep.P_NID_COTIZACION = this.reference.quotation_id;
        this.data_quotation_pep.P_SCLIENT = this.reference.sclient;
        this.data_quotation_pep.P_NSECCION = 1;
        this.SelDatosPEPVIGP();
    }

    // saveProperty = () => {
    //     const customswal = Swal.mixin({
    //         confirmButtonColor: "553d81",
    //         focusConfirm: false,
    //     })
    //     customswal.fire('Información', "Se registró correctamente.", 'success');
    //     this.reference.close();
    // }

    // DGC - VIGP - 19/01/2024

    VALIDATE_INPUTS = (item) => {
        let response = { cod_error: 0, message_error: "" }
        //debugger
        if (item.P_SINMUEBLES == null || item.P_SINMUEBLES == "") {
            response.message_error += 'Se debe ingresar propiedades inmuebles. <br>';
            response.cod_error = 1;
        }

        if(item.P_SVEHICULOS == null || item.P_SVEHICULOS == ""){
            response.message_error += 'Se debe ingresar vehiculos. <br>';
            response.cod_error = 1;
        }

        return response;
    }

    InsUpdDatosPEPVIGP = () => {
        // let validate_error = this.VALIDATE_INPUTS(this.data_quotation_pep); 
            
        // if (validate_error.cod_error == 1) {
        //     Swal.fire('Información', validate_error.message_error, 'error');
        //     return
        // } 

        this.vidaInversionService.InsUpdDatosPEPVIGP(this.data_quotation_pep).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', "Se registró correctamente.", 'success');
                    this.reference.close();
                } else {
                    Swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error registrando los datos PEP.", 'error');
            }
        )
    }

    SelDatosPEPVIGP = () => {
        this.vidaInversionService.SelDatosPEPVIGP(this.data_quotation_pep).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    if (res.C_TABLE.length > 0) {
                        this.data_quotation_pep.P_SINMUEBLES = res.C_TABLE[0].SINMUEBLES;
                        this.data_quotation_pep.P_SVEHICULOS = res.C_TABLE[0].SVEHICULOS;
                    }
                    this.isLoading = false;
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error obteniendo los datos PEP.", 'error');
            }
        )
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