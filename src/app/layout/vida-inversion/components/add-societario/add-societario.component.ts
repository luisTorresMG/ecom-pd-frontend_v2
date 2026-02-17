import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';

interface ISocietario {
    NID:number;
    SROL: any;
    SRAZON_SOCIAL: string;
    SRUC: string;
    NPORCENTAJE: number;
}

@Component({
    selector: 'app-add-societario',
    templateUrl: './add-societario.component.html',
    styleUrls: ['./add-societario.component.scss']
})
export class AddSocietarioComponent implements OnInit {

    @Input() public reference: any;

    CONSTANTS: any = VidaInversionConstants;

    typeClient: number = 1; // 1: CONTRATANTE, 2: ASEGURADO
    titleModal: string = "Agregar Societario del contratante";
    list_roles: {Id:string;Name:string}[] = [
        {Id:"SOCIO", Name:"SOCIO"}, 
        {Id:"ACCIONISTA", Name:"ACCIONISTA"}, 
        {Id:"ASOCIADO", Name:"ASOCIADO"}, 
        {Id:"ADMINISTRADOR", Name:"ADMINISTRADOR"}
    ];

    societario: ISocietario = {
        NID: null,
        SROL: null,
        SRAZON_SOCIAL: null,
        SRUC: null,
        NPORCENTAJE: null
    };

    list_societarios: ISocietario[] = [];

    isLoading: boolean = false;

    isView:boolean = false;

    constructor(
        public clientInformationService: ClientInformationService,
        public vidainversionservice: VidaInversionService,
        public quotationService: QuotationService,
    ) { }

    ngOnInit(): void {
        this.isLoading = true;

        try {
            this.isView = this.reference.isView;
            this.loadSocietarios();
            
        } catch (error) {
            console.log("error: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    loadSocietarios(){
        this.typeClient = this.reference.type;
        if (this.typeClient === 1) this.titleModal = `${this.isView ? "" : "Agregar " }Societarios del contratante`;
        if (this.typeClient === 2) this.titleModal = `${this.isView ? "" : "Agregar " }Societarios del asegurado`;

        const societarios = this.reference.list_societarios as ISocietario[];
        
        societarios.forEach(row => {
            this.list_societarios.push({
                NID: null,
                SROL: row.SROL,
                SRAZON_SOCIAL: row.SRAZON_SOCIAL,
                SRUC: row.SRUC,
                NPORCENTAJE: row.NPORCENTAJE
            });
        })
    }

    validaSocietario() : {cod_error: number, message_error: string} {

        let response = { cod_error: 0, message_error: "" }

        if (this.societario.SROL.Id == null) {
            response.cod_error = 1;
            response.message_error += 'El campo Rol no puede estar vacio. <br>';
        }

        if (this.societario.SRAZON_SOCIAL == null || this.societario.SRAZON_SOCIAL.trim() == '') {
            response.cod_error = 1;
            response.message_error += 'El campo Razon social no puede estar vacio. <br>';
        }

        if (this.societario.SRUC == null || this.societario.SRUC.trim() == '') {
            response.cod_error = 1;
            response.message_error += 'El campo RUC no puede estar vacio. <br>';
        }else{
            if(this.societario.SRUC.length < 11){
                response.cod_error = 1;
                response.message_error += 'El campo RUC debe tener 11 caracteres. <br>';
            }else if(this.societario.SRUC.length > 11){
                response.cod_error = 1;
                response.message_error += 'El campo RUC no debe tener más de 11 caracteres. <br>';
            }   
        }

        if (this.societario.NPORCENTAJE == null) {
            response.cod_error = 1;
            response.message_error += 'El campo Porcentaje no puede estar vacio. <br>';
        } else {
            if(this.societario.NPORCENTAJE < 25){
                response.cod_error = 1;
                response.message_error += 'El campo Porcentaje debe ser mayor o igual a 25. <br>';
            } else if(this.societario.NPORCENTAJE > 100) {
                response.cod_error = 1;
                response.message_error += 'El campo Porcentaje debe ser menor o igual a 100. <br>';
            }
        }

        return response;
    }

    addSocietario() {
        const validSoc = this.validaSocietario();
        // EL AF INDICA QUE SE TIENE QUE VALIDAR TODOS LOS CAMPOS DE FORMA OBLIGATORIA
        // ADEMAS LA ASGINACION DEBE SER MAYOR A 0 Y MENOR A 100

        if (validSoc.cod_error === 1) {
            Swal.fire({
                html: validSoc.message_error,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            })
        }

        else {
            this.list_societarios.push({
                NID: null,
                SROL: this.societario.SROL.Id,
                SRAZON_SOCIAL: this.societario.SRAZON_SOCIAL.toUpperCase(),
                SRUC: this.societario.SRUC,
                NPORCENTAJE: parseFloat(this.societario.NPORCENTAJE.toString()) 
            });
            this.resetSocietario();
        }
    }

    resetSocietario() {
        this.societario = {
            NID: null,
            SROL: {Id:null},
            SRAZON_SOCIAL: null,
            SRUC: null,
            NPORCENTAJE: null
        };
    }

    editarSocietario(item: ISocietario, index: number) {
        this.societario = {
            NID: index,
            SROL: {Id: item.SROL},
            SRAZON_SOCIAL: item.SRAZON_SOCIAL,
            SRUC: item.SRUC,
            NPORCENTAJE: item.NPORCENTAJE
        };
    }

    actualizarSocietario(): void {
        const validSoc = this.validaSocietario();
        if (validSoc.cod_error === 1) {
            Swal.fire({
                html: validSoc.message_error,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
        }
        else {
            const index = this.societario.NID;
            if (index !== null && index >= 0 && index < this.list_societarios.length) {
                this.list_societarios[index] = {
                    NID: null,
                    SROL: this.societario.SROL.Id,
                    SRAZON_SOCIAL: this.societario.SRAZON_SOCIAL.toUpperCase(),
                    SRUC: this.societario.SRUC,
                    NPORCENTAJE: parseFloat(this.societario.NPORCENTAJE.toString())
                };
            }
            
            this.resetSocietario();
            
        }
    }

    resolveTextRs(text: string): string {
        if (text!= null && text.trim() !== '') {
            return text.toUpperCase();
        }   
        return text;
    }

    resolveTextPorcentaje(value) {
        const newVal = parseFloat(value);
        if (!isNaN(newVal)) {
            return newVal.toFixed(2);
        }
        return value;
    }

    eliminarSocietario(index: number) {
        Swal.fire({
            title: 'Confirmación',
            text: '¿Está seguro de eliminar el societario seleccionado?', 
            icon: 'warning',
            confirmButtonText: 'SI',
            cancelButtonText: 'NO',
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false
        }).then((result) => {
            if (result.isConfirmed) {
                const newListSocietarios = this.list_societarios.filter((_, i) => i !== index);
                this.list_societarios = newListSocietarios;
            }
        });
    }

    enviarSocietarios(){
        if (this.list_societarios.length === 0) {
            Swal.fire({
                html: 'Debe agregar al menos un societario.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
            return;
        }else{
            this.reference.close({
                type: this.typeClient,
                list_societarios: this.list_societarios
            });
        }


    }

}
