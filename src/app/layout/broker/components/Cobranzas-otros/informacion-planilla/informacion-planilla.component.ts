import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { SwalComponentComponent } from '../swal-component/swal-component.component';

@Component({
    selector: 'app-informacion-planilla',
    templateUrl: './informacion-planilla.component.html',
    styleUrls: ['./informacion-planilla.component.css']
})
export class InformacionPlanillaComponent implements OnInit {
    alwaystrue: boolean = true;
    nroTipoOperacion: number;
    nroPlanilla: any;
    nroRecibo: any;
    nroComprobante: any;
    nroOperacion: any;
    currentDate: Date = new Date();
    enviooperacion: any;
    resultadosBusqueda: any;
    dataRecuperada: any[] = [];
    mostrarData: boolean = false;
    inputHabilitado: string = "form-input-text";
    inputDeshabilitado: string = "form-input-text disabled";
    constructor(
        private servicioInforme: PolicyemitService,
        private readonly spinner: NgxSpinnerService,
        private aviso: SwalComponentComponent
    ) {
    }

    ngOnInit(): void {
        this.enviooperacion = null;
    }

    validarData() {
        if ((this.nroPlanilla == null || this.nroPlanilla == "") && (this.nroRecibo == null || this.nroRecibo == "") && (this.nroComprobante == null || this.nroComprobante == "") && (this.nroOperacion == null || this.nroOperacion == "")) {
            this.nroTipoOperacion = null;
            for (let index = 1; index <= 4; index++) {
                const inputElement = document.getElementById(index.toString()) as HTMLInputElement;
                inputElement.disabled = false;

            }
            return false;
        } else {
            this.nroTipoOperacion =
                this.nroPlanilla != null ? 1 :
                    this.nroRecibo != null ? 2 :
                        this.nroOperacion != null ? 4 :
                            this.nroComprobante != null ? 3 :
                                0;
            for (let index = 1; index <= 4; index++) {
                const inputElement = document.getElementById(index.toString()) as HTMLInputElement;
                if (inputElement.id !== this.nroTipoOperacion.toString()) {
                    inputElement.disabled = true;
                }
            }
            return true;
        }
    }

    async descargarExcel() {
        this.spinner.show();
        await this.servicioInforme.getExcelInformacionPlanilla(this.resultadosBusqueda).toPromise()
            .then((res: any) => {
                this.spinner.hide();
                const blob = this.b64toBlob(res.resultado);
                const blobUrl = URL.createObjectURL(blob);
                let a = document.createElement("a")
                a.href = blobUrl
                a.download = "Reporte_Informacion_Planilla.xlsx"
                a.click()

            },
                err => {
                    this.spinner.hide();
                    this.aviso.swalError("Error al descargar Excel: " + err);
                });
    }

    b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    limpiarCampos() {
        this.nroPlanilla = null;
        this.nroRecibo = null;
        this.nroComprobante = null;
        this.nroOperacion = null;
        this.resultadosBusqueda = null;
        this.enviooperacion = null;
        this.nroTipoOperacion = null;
        this.mostrarData = false;
    }

    PrepararData() {
        let variablesBusqueda = [this.nroPlanilla, this.nroRecibo, this.nroComprobante, this.nroOperacion];
        this.mostrarData = false;

        if (this.nroTipoOperacion === 0) {
            this.aviso.swalInformacion("Debe de tener al menos un valor para realizar la búsqueda");
            return;
        }
        this.enviooperacion = variablesBusqueda[this.nroTipoOperacion - 1];
        if (this.nroTipoOperacion != 3) {
            console.log(this.enviooperacion.length)
            if (!/^[0-9]+$/.test(this.enviooperacion)) {
                this.aviso.swalInformacion("El tipo de operación seleccionado solo puede tener numeros");
                return;
            } else if (this.enviooperacion.length >= 20) {
                this.aviso.swalInformacion("Se permite como máximo 19 números en la consulta");
                return;
            }

        } else if (this.nroTipoOperacion == 3 && !/^\w\d{3,}-\d{2,}$/.test(this.enviooperacion)) {
            this.aviso.swalInformacion("El tipo de operación seleccionado no sigue el patrón correspondiente. Ejemplo = F000-00");
            return;
        }
        this.RealizarConsulta();
    }

    async RealizarConsulta() {
        let resultado: any;
        let data = {
            nroTipoBusqueda: this.nroTipoOperacion,
            nroPlanilla: this.nroPlanilla == null ? 0 : this.nroPlanilla,
            nroRecibo: this.nroRecibo == null ? 0 : this.nroRecibo,
            nroComprobante: this.nroComprobante == null ? "" : this.nroComprobante,
            nroOperacion: this.nroOperacion == null ? "" : this.nroOperacion
        };
        this.nroTipoOperacion = null;
        this.resultadosBusqueda = null;
        try {
            this.spinner.show();
            const res = await this.servicioInforme.getInformacionPlanilla(data).toPromise();
            resultado = res;
        } catch (error) {
            this.aviso.swalError("Ocurrió un error realizando la consulta : " + error);
        } finally {
            this.spinner.hide();

            if (resultado.codigo == 0) {
                this.resultadosBusqueda = resultado;
                this.dataRecuperada = this.resultadosBusqueda.datarecuperada;
                this.mostrarData = this.dataRecuperada.length > 0 ? true : false;
                if (this.dataRecuperada.length == 0) {
                    this.aviso.swalInformacion("No se encontró información")
                }
            } else {
                this.aviso.swalError("Se encontro un error: " + resultado.mensaje)
            }
        }
    }
}
