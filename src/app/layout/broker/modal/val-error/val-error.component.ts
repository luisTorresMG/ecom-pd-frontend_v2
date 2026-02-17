import { Component, OnInit, Input, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, NgForm } from "@angular/forms";
import Swal from 'sweetalert2';
import { ExcelService } from '../../services/shared/excel.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-val-error',
    templateUrl: './val-error.component.html',
    styleUrls: ['./val-error.component.css']
})
export class ValErrorComponent implements OnInit {
    @Input() public formModalReference: any;
    @Input() public erroresList: any;
    @Input() public changeList: any;
    @Input() public base64String: any;
    @Input() public fileName: any;

    modalRef: BsModalRef;

    flagErrors = 0;

    flagConfirm = 0;

    constructor(private excelService: ExcelService) { }

    ngOnInit() {
        if (this.erroresList != null) {
            if (this.erroresList.length > 0) {
                this.flagErrors = 0;
            }
        }
        else {
            this.flagErrors = 1;
        }
    }

    GenerarReporte() {
        if (this.erroresList != null) {
            if (this.erroresList.length > 0 && this.flagErrors == 0) {
                if (this.validateString(this.base64String)) {
                    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // Tipo MIME para Excel
                    this.downloadFile(this.base64String, this.fileName, fileType);
                } else {
                    this.excelService.generateErroresExcel(this.erroresList, 'Errores');
                }

                this.formModalReference.close()
            }
        }
        else {
            if (this.validateString(this.base64String)) {
                const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // Tipo MIME para Excel
                this.downloadFile(this.base64String, this.fileName, fileType);
            } else {
                this.excelService.generateChangesExcel(this.changeList, 'Cambios');
            }
        }
    }

    validateString(text: any) {
        return text != undefined && text != null && text != '';
    }

    endosarPoliza() {
        Swal.fire({
            title: 'Información',
            text: 'Confirmar los cambios de los asegurados ¿Estás seguro?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.flagConfirm = 1;
                this.formModalReference.close(this.flagConfirm);
            }
        });

    }

    downloadFile(base64String: string, fileName: string, fileType: string) {
        // Convertir Base64 en un blob
        const binaryString = window.atob(base64String); // Decodificar Base64
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);

        for (let i = 0; i < binaryLen; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: fileType });

        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = fileName;  // Nombre del archivo
        link.click();

        // Limpiar el objeto URL
        URL.revokeObjectURL(url);
    }

}
