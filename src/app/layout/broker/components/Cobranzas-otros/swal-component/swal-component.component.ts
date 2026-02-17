import { Component, OnInit, Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-swal-component',
    templateUrl: './swal-component.component.html',
    styleUrls: ['./swal-component.component.css']
})
@Injectable({
    providedIn: 'root'
})
export class SwalComponentComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    swalExito(text: string, html: boolean = false) {
        if (html) {
            swal.fire({
                title: "Éxito",
                html: text,
                icon: "success",
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
            });
        } else {
            swal.fire({
                title: "Éxito",
                text: text,
                icon: "success",
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
            });
        }

    }

    swalError(text: string) {
        swal.fire({
            title: "Error",
            text: text,
            icon: "error",
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
        });
    }

    swalAdvertencia(text: string) {
        swal.fire({
            title: "Advertencia",
            text: text,
            icon: "warning",
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
        });
    }

    swalInformacion(text: string) {
        swal.fire({
            title: "Información",
            text: text,
            icon: "info",
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
        });
    }

    SwalGlobalOpciones(mensaje) {
        return swal.fire({
            title: "Advertencia",
            icon: "warning",
            text: mensaje,
            showCancelButton: true,
            confirmButtonColor: "#FA7000",
            confirmButtonText: "Continuar",
            cancelButtonText: "Cancelar",
            showCloseButton: true,
            customClass: {
                closeButton: 'OcultarBorde'
            },
        }).then((result) => {
            return result.isConfirmed;
        });
    }
}
