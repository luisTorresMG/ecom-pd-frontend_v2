import { AfterContentChecked, Component, ElementRef, OnInit, ViewChild, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { SwalComponentComponent } from '../swal-component/swal-component.component';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-correcion-suma-asegurada',
    templateUrl: './correcion-suma-asegurada.component.html',
    styleUrls: ['./correcion-suma-asegurada.component.scss']
})
@Injectable({
    providedIn: 'root'
})
export class CorrecionSumaAseguradaComponent implements OnInit {
    mostrarData: boolean = true;
    alwaystrue: boolean = true;
    ramaElegida: any;
    nombreRamaElegida: string = null;
    @ViewChild('childModalMensaje', { static: true })
    childModalMensaje: ModalDirective;
    coberturaElegida: string;
    montoTotal: string;
    nroPoliza: any;
    nroCertificado: any;
    nombreAsegurado: any;
    resultadosBusqueda: any;
    dataRecuperada: any;
    bsConfig: Partial<BsDatepickerConfig>;
    currentDate: Date = new Date();
    bsFechaOcurrencia: Date = null;
    FechaOcurrencia: FormControl
    
    RamasDisponibles: any;
    CodigoCobertura: any;
    montoInicial: any;
    encenderOption: any;
    polizaIndividual: any;
    validateModal: any;
    contador: any;
    fechaInicioCobertura: any;
    constructor(
        private servicioInforme: PolicyemitService,
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private aviso: SwalComponentComponent,
    ) {
        this.FechaOcurrencia = this.formBuilder.control(this.bsFechaOcurrencia);
        this.recuperarRamos();

        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                containerClass: 'theme-dark-blue',
                showWeekNumbers: false,
            }
        );
        this.dataRecuperada = [{
            "Cobertura": "Muerte Natural",
            "FechaInicio": "20/12/2024",
            "FechaFin": "",
            "SumaAsegurada": 2900,
            "Moneda": "Soles",
        }]
    }


    ngOnInit(): void {
        this.contador = 1;
        this.polizaIndividual = false;
        this.mostrarData = false;
        this.ramaElegida = 0;
        this.encenderOption = false;
    }


    async recuperarRamos(codigo :  number = 0) {
        let data = 
        {
            "codigo":codigo
        }
        let res = null;
        try {
            this.spinner.show();
            res = await this.servicioInforme.getAllBranch(data).toPromise();
            console.log(res);
        } catch (error) {
            this.aviso.swalError("Ocurrió un error realizando la consulta : " + error.value);
        } finally {
            this.spinner.hide();
            this.RamasDisponibles = res.branches;
            this.encenderOption = true;
            return res.branches;
        }
    }

    AbrirModal(CodigoCobertura: any) {
        this.contador = 0;
        this.childModalMensaje.show();
        this.CodigoCobertura = CodigoCobertura;
        let obj: any = null;
        obj = this.dataRecuperada.find(branch => branch.COD_COBERTURA == CodigoCobertura);
        this.coberturaElegida = obj.COBERTURA;
        this.montoTotal = obj.SUMA_ASEGURADA;
        this.montoInicial = obj.SUMA_ASEGURADA;
        this.fechaInicioCobertura = obj.FECHA_INICIO;
        this.validateModal = 1;
    }

    closeModalMensaje(): void {
        this.validateModal = 0;
        this.childModalMensaje.hide();
    }


    validarData() {
        return true;
    }

    PrepararData() {
        let obj: any = null;
        obj = this.RamasDisponibles.find(branch => branch.nbranch == this.ramaElegida);
        this.nombreRamaElegida = obj.snombre;
    }

    ValidarData() {
        if (this.ramaElegida === 0) {
            this.aviso.swalInformacion("Debe de seleccionar un ramo para realizar la búsqueda.");
            return;
        }
        else if (this.nroPoliza == null || this.nroPoliza == 0) {
            this.aviso.swalInformacion("El número de póliza no puede estar vacío o ser 0.");
            return;
        }
        else if (this.nroCertificado == null || this.nroCertificado == 0 && !this.polizaIndividual) {
            this.aviso.swalInformacion("El número de certificado no puede estar vacío o ser 0.");
            return;
        }
        else if (!/^[0-9]+$/.test(this.nroPoliza)) {
            this.aviso.swalInformacion("El número de póliza solo puede tener números.");
            return;
        }
        else if (!/^[0-9]+$/.test(this.nroCertificado)) {
            this.aviso.swalInformacion("El número de Certificado solo puede tener números.");
            return;
        }
        else if (this.FechaOcurrencia.value > this.currentDate) {
            this.aviso.swalInformacion("La fecha de ocurrencia no puede superar a la fecha actual.");
            return;
        }
        this.RealizarBusqueda();
    }

    ValidarModal() {
        this.validateModal = this.childModalMensaje.isShown ? 1 : 0;
        if (this.contador < 1 && this.validateModal == 0) {
            this.RealizarBusqueda();
            this.contador = this.contador + 1;
        }
        return false;

    }


    async RealizarBusqueda(swal: number = 0) {
        if (swal == 0) {
            this.spinner.show();
        }
        let resultado: any;
        let data = {
            P_NBRANCH: this.ramaElegida,
            P_NPOLICY: this.nroPoliza == null ? 0 : this.nroPoliza,
            P_NCERTIF: this.nroCertificado == null ? 0 : this.nroCertificado,
            P_DOCCURDAT: this.FechaOcurrencia.value,
        };
        console.log(data);
        this.resultadosBusqueda = null;
        try {
            const res = await this.servicioInforme.getCoberturasById(data).toPromise();
            resultado = res;
        } catch (error) {
            this.aviso.swalError("Ocurrió un error realizando la consulta : " + error);
        } finally {
            this.spinner.hide();

            if (resultado.codigo == 0) {
                this.resultadosBusqueda = resultado;
                this.dataRecuperada = this.resultadosBusqueda.respuesta;
                this.mostrarData = this.dataRecuperada.length > 0 ? true : false;
                if (this.dataRecuperada.length == 0) {
                    this.aviso.swalInformacion("Ramo/Póliza/Certificado no existe en la base de datos.")
                } else {
                    this.nombreAsegurado = this.dataRecuperada[0].ASEGURADO;
                }
            } else {
                this.aviso.swalInformacion(resultado.mensaje)
            }
        }
    }

    limpiarCampos() {
        this.contador = 1;
        this.validateModal = 0;
        this.polizaIndividual = false;
        this.CodigoCobertura = null;
        this.nombreAsegurado = null;
        this.resultadosBusqueda = null;
        this.dataRecuperada = null;
        this.mostrarData = false;
        this.ramaElegida = 0;
        this.bsFechaOcurrencia = this.currentDate;
        this.nroCertificado = null;
        this.nroPoliza = null;
        this.coberturaElegida = null;
        this.montoInicial = null;
        this.fechaInicioCobertura = null;
        this.montoTotal = null;
        this.nombreAsegurado = null;
    }

    async ValidarPolizaColectiva() {
        this.polizaIndividual = false;
        let res;
        let data =
        {
            "Poliza": this.nroPoliza,
        };

        try {
            res = await this.servicioInforme.validarPolizaColectiva(data).toPromise();
        } catch (error) {
            console.log("Ocurrio un error realizando la consulta: " + error);
        } finally {
            this.polizaIndividual = res.polizaIndividual == 1 ? true : false; //1 individual
            this.nroCertificado = this.polizaIndividual ? 0 : null;
        }

    }

    async grabarNuevaSuma() {
        let res = null;
        let data = {
            "Ramo": this.ramaElegida,
            "Poliza": this.nroPoliza,
            "NroCobertura": this.CodigoCobertura,
            "Certificado": this.nroCertificado,
            "FechaEfecto": this.fechaInicioCobertura,
            "FechaOcurrencia": this.FechaOcurrencia.value,
            "DesCobertura": this.coberturaElegida,
            "NuevoMonto": this.montoTotal,
            "NidUsuario": JSON.parse(localStorage.getItem('currentUser')).id
        }
        this.spinner.show();
        console.log(data);
        try {
            res = await this.servicioInforme.updateSumaAsegurada(data).toPromise();
        } catch (error) {
            this.spinner.hide();
            this.aviso.swalError("Ocurrio un error realizando la consulta: " + error);
        } finally {
            this.spinner.hide();
            if (res.codigo == 0) {
                this.aviso.swalExito(res.mensaje);
                this.RealizarBusqueda(1);
            }
            else if(res.codigo == 2 ){
                this.aviso.swalError(res.mensaje);
            } 
            else {
                this.aviso.swalInformacion(res.mensaje);
            }

        }

    }
}
