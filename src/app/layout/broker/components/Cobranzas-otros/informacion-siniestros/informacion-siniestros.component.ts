import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { SwalComponentComponent } from '../swal-component/swal-component.component';

@Component({
    selector: 'app-informacion-siniestros',
    templateUrl: './informacion-siniestros.component.html',
    styleUrls: ['./informacion-siniestros.component.css']
})
export class InformacionSiniestrosComponent implements OnInit {
    nroSiniestro: any;
    alwaystrue: boolean = true;
    @ViewChild('childModalMensaje', { static: true })
    childModalMensaje: ModalDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    currentDate: Date = new Date();

    bsFechaOcurrencia: Date = new Date();
    bsFechaDenuncia: Date = new Date();
    bsFechaAprobacion: Date = new Date();
    bsFechaDocumentoCompleto: Date = new Date();

    mostrarData: boolean = false;
    FechaOcurrencia!: FormControl;
    FechaDenuncia!: FormControl;
    FechaDocumentoCompleto!: FormControl;
    FechaAprobacion!: FormControl;
    
    resultadosBusqueda: any;
    haveBillsData: boolean = true;
    dataRecuperada: any;
    inputValue: number | null = null;
    fechasVacias: any;
    fechasAnteriores: any;
    validateModal: any;
    contador: any;
    SiniestroRecuperado: any;
    constructor(
        private servicioInforme: PolicyemitService,
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private aviso: SwalComponentComponent) {
        this.FechaOcurrencia = this.formBuilder.control(this.bsFechaOcurrencia);
        this.FechaDenuncia = this.formBuilder.control(this.bsFechaDenuncia);
        this.FechaDocumentoCompleto = this.formBuilder.control(this.bsFechaDocumentoCompleto);
        this.FechaAprobacion = this.formBuilder.control(this.bsFechaAprobacion);    
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                containerClass: 'theme-dark-blue',
                showWeekNumbers: false,
            }
        );
    }

    ValidarModal() {
        if (this.nroSiniestro == null || this.nroSiniestro == "") {
            this.limpiarCampos();
        }

        this.validateModal = this.childModalMensaje.isShown ? 1 : 0;
        if (this.contador < 1 && this.validateModal == 0 && this.SiniestroRecuperado == this.nroSiniestro) {
            this.RealizarConsulta(1);
            this.contador = this.contador + 1;
        }
        return false;
    }

    ngOnInit(): void {
        this.contador = 1;
        this.mostrarData = false;
    }

    async RealizarBusquedaInicio() {
        let continuar = this.ValidarParametro()
        if (continuar) {
            await this.RealizarConsulta(0);
        }
    }

    ValidarParametro() {
        var continuar: boolean = false;
        continuar = this.nroSiniestro == null ? false : true;
        if (!continuar) {
            this.aviso.swalInformacion("El número de siniestro no puede estar vacío.")
            return;
        };
        continuar = /^[0-9]+$/.test(this.nroSiniestro) ? true : false;
        if (!continuar) {
            this.aviso.swalInformacion("El número de siniestro no puede ser una letra.")
            return;
        }
        return continuar;
    }

    limpiarCampos() {
        this.nroSiniestro = null;
        this.contador = 1;
        this.mostrarData = false;
        this.resultadosBusqueda = null;
        this.dataRecuperada = null;
        this.childModalMensaje.hide()
        this.validateModal = 0;
    }
    AbrirModal() {
        this.contador = 0;
        this.validateModal = 1;
        this.childModalMensaje.show();
    }


    validarCampos() {
        let NuevasFechas = [this.FechaOcurrencia.value, this.FechaDenuncia.value, this.FechaDocumentoCompleto.value, this.FechaAprobacion.value];
        let contador = 0;
        let posicionUnica = [];

        let titulo = "Se actualizó la ";
        if (this.nroSiniestro == null || this.nroSiniestro === 0) {
            this.aviso.swalInformacion("El número de siniestro no puede estar vacío o ser 0.");
            return;
        }

        for (let i = 0; i <= this.fechasVacias.length - 1; i++) {
            if (this.fechasVacias[i].fecha != NuevasFechas[i]) {
                contador++;
                posicionUnica.push(i);
            }
        }

        if (contador > 0 && posicionUnica.length > 0) {

            //titulo = posicionUnica.length > 1 ? "<p>Se actualizaron correctamente las siguientes fechas: </p><ul  style=\"list-style: none;\">" : "Se actualizó la ";
            if (posicionUnica.length > 1) {
                titulo = "Se actualizaron correctamente las fechas";

                //for (let index = 0; index < posicionUnica.length; index++) {
                //    titulo = titulo + "<li style=\"margin-top: 2px; list-style: none;\">" + this.fechasVacias[posicionUnica[index]].valor + "</li>";
                //}
                //titulo = titulo + "</ul>";
                //if (posicionUnica.length == 4) {
                //    titulo = "Se actualizaron correctamente todas las fechas.";
                //}
            } else {
                titulo = titulo  + this.fechasVacias[posicionUnica[0]].valor + " satisfactoriamente.";
            }
        }


        this.actualizarFechas(titulo);
    }


    async actualizarFechas(titulo: string) {

        let data = {
            nroSiniestro: this.SiniestroRecuperado,
            fechaOcurrencia: this.FechaOcurrencia.value,
            fechaDenuncia: this.FechaDenuncia.value,
            fechaDocCompleta: this.FechaDocumentoCompleto.value,
            fechaAprobacion: this.FechaAprobacion.value,
            userCode: JSON.parse(localStorage.getItem("currentUser"))["id"]
        };
        let resultado: any;


        //this.resultadosBusqueda = null;
        try {
            this.spinner.show();
            const res = await this.servicioInforme.updateFechaSiniestro(data).toPromise();
            resultado = res;
        } catch (error) {
            this.aviso.swalError("Ocurrió un error realizando la consulta : " + error);
        } finally {
            this.spinner.hide();
            if (resultado.NCODE != 0 && resultado.MESSAGE != "null" || resultado.MESSAGE != null) {
                this.aviso.swalInformacion(resultado.MESSAGE)
            } else {
                this.aviso.swalExito(titulo, true);
                this.RealizarConsulta(0);
            }
        }
    }


    async RealizarConsulta(noSpinner: number) {
        var FechaOcurrencia: any;
        var FechaDenuncia: any;
        var FechaDocumentoCompleto: any;
        var FechaAprobacion: any;
        let resultado: any;
        let data = {
            NroSiniestro: this.nroSiniestro,
        };
        this.resultadosBusqueda = null;
        try {
            if (noSpinner == 0) {
                this.spinner.show();
            }
            const res = await this.servicioInforme.getSiniestroById(data).toPromise();
            resultado = res;
        } catch (error) {
            this.aviso.swalError("Ocurrió un error realizando la consulta : " + error);
        } finally {
            if (noSpinner == 0) {
                this.spinner.hide();
            }

            if (resultado.codigo == 0) {
                this.resultadosBusqueda = resultado;
                this.dataRecuperada = this.resultadosBusqueda.resultado;
                this.mostrarData = this.dataRecuperada.length > 0 ? true : false;
                if (this.dataRecuperada.length == 0) {
                    this.aviso.swalInformacion("No se encontró información")
                } else {
                    this.SiniestroRecuperado = this.dataRecuperada[0].V_NRO_SINIESTRO;
                    this.bsFechaOcurrencia = this.dataRecuperada[0].V_FECHA_OCURRENCIA;
                    this.bsFechaDenuncia = this.dataRecuperada[0].V_FECHA_DENUNCIA;
                    this.bsFechaDocumentoCompleto = this.dataRecuperada[0].V_FECHA_DOC_COMPLETA;
                    this.bsFechaAprobacion = this.dataRecuperada[0].V_FECHA_APROBACION;

                    this.FechaOcurrencia = this.formBuilder.control(this.bsFechaOcurrencia);
                    this.FechaDenuncia = this.formBuilder.control(this.bsFechaDenuncia);
                    this.FechaDocumentoCompleto = this.formBuilder.control(this.bsFechaDocumentoCompleto);
                    this.FechaAprobacion = this.formBuilder.control(this.bsFechaAprobacion);

                    this.fechasVacias =
                        [{ "id": 0, "Nulo": FechaOcurrencia = this.dataRecuperada[0].V_FECHA_OCURRENCIA == null || this.dataRecuperada[0].V_FECHA_OCURRENCIA == "" ? 1 : 0, "valor": "Fecha de Ocurrencia", "fecha": this.dataRecuperada[0].V_FECHA_OCURRENCIA },
                        { "id": 1, "Nulo": FechaDenuncia = this.dataRecuperada[0].V_FECHA_DENUNCIA == null || this.dataRecuperada[0].V_FECHA_DENUNCIA == "" ? 1 : 0, "valor": "Fecha de Denuncia", "fecha": this.dataRecuperada[0].V_FECHA_DENUNCIA },
                        { "id": 2, "Nulo": FechaDocumentoCompleto = this.dataRecuperada[0].V_FECHA_DOC_COMPLETA == null || this.dataRecuperada[0].V_FECHA_DOC_COMPLETA == "" ? 1 : 0, "valor": "Fecha de Documentación Completa", "fecha": this.dataRecuperada[0].V_FECHA_DOC_COMPLETA },
                        { "id": 3, "Nulo": FechaAprobacion = this.dataRecuperada[0].V_FECHA_APROBACION == null || this.dataRecuperada[0].V_FECHA_APROBACION == "" ? 1 : 0, "valor": "Fecha de Aprobación", "fecha": this.dataRecuperada[0].V_FECHA_APROBACION }];
                }
            } else {
                this.aviso.swalInformacion(resultado.mensaje)
            }
        }
    }

    closeModalMensaje(): void {
        this.validateModal = 0;
        if (this.SiniestroRecuperado == this.nroSiniestro) {
            this.RealizarConsulta(1);
        }
        this.childModalMensaje.hide();

    }
}
