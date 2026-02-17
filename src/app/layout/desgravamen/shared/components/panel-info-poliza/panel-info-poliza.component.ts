
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonMethods } from '../../../../../layout/broker/components/common-methods';
import { AccPersonalesService } from '../../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { PanelInfoPolizaService } from '../../../../../layout/broker/components/quote/acc-personales/components/panel-info-poliza/panel-info-poliza.service';
import { StorageService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { UtilService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/util.service';
import { PolicyemitService } from '../../../../../layout/broker/services/policy/policyemit.service';
import { QuotationService } from '../../../../../layout/broker/services/quotation/quotation.service';
import { ClientInformationService } from '../../../../../layout/broker/services/shared/client-information.service';
import { DesgravamenServicePD } from '../../../../../layout/desgravamen/desgravament.service';
import swal from 'sweetalert2';
import { DesgravamentConstants } from '../../core/desgravament.constants';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'panel-info-poliza',
    templateUrl: './panel-info-poliza.component.html',
    styleUrls: ['./panel-info-poliza.component.css'],
})
export class PanelInfoPolizaComponent implements OnInit {
    @Input() detail: boolean;
    @Input() cotizacion: any;
    @Input() poliza: any;
    @Input() format_price: any;


    @Output() polizaChange: EventEmitter<any> = new EventEmitter();
    @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    userId = JSON.parse(localStorage.getItem('currentUser'))['id'];

    CONSTANTS: any = DesgravamentConstants;

    fechaActual: any = UtilService.dates.getCurrentDate();
    flagViajes: boolean = true;
    flagAforo: boolean = false;
    flagRenovacion: boolean = false;
    listPlanes = [];
    validarDisabledNroCredito: false;
    numcuotas: number = 0;
    


    constructor(
        public clientInformationService: ClientInformationService,
        public policyemitService: PolicyemitService,
        public accPersonalesService: AccPersonalesService,
        public storageService: StorageService,
        public quotationService: QuotationService,
        public desgravamenService: DesgravamenServicePD,
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
            JSON.parse(localStorage.getItem('codProducto'))['productId']
        );
      
    }

    ngOnInit() {
        
        this.poliza = this.poliza || {};
        var actual = new Date();

        // Alex Gallozo 14/03/2023  Agregando un valor inicial al campo número de cuotas
        if (!this.poliza.nroCuotas) {
            this.poliza.nroCuotas = 36;
            this.numcuotas = this.poliza.nroCuotas;
        }
        if (!this.poliza.fechaInicioPoliza)
        {
            this.poliza.fechaInicioPoliza = new Date(actual.getFullYear(), actual.getMonth(), 1);
        }
        if (!this.poliza.fechaFinPoliza)
        {
            this.poliza.fechaFinPoliza = new Date(actual.getFullYear(), actual.getMonth()+1, 0);
        }
        this.polizaChange.emit(this.poliza);
       
        
        if (!this.poliza.listReglas) {
            this.rulesDefault();
        }
        if (!this.poliza.listPlanes) {
            this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
        }
 

        

        this.cambiarTipoPerfil();



    }

    changeStyleCredit() {

        let format_amount = parseInt(this.poliza.capitalCredito.replace(/,/g, ''));

        this.format_price = CommonMethods.formatNUMBER(format_amount);
        this.poliza.capitalCredito = this.format_price;

        if (this.poliza.capitalCredito.toUpperCase() == "NAN") {
            this.poliza.capitalCredito = '';
        }
    }

    rulesDefault() {
        this.poliza.listReglas = {
            flagComision: false,
            flagCobertura: false,
            flagAsistencia: false,
            flagBeneficio: false,
            flagSiniestralidad: false
        }
    }

    cambiarTipoProducto() {
        this.poliza.tipoPerfil = null;
        this.poliza.modalidad = null;
        this.emitirCambiarDatoPoliza();
    }

    mostrarTipoPlan() {
        if (this.poliza.tipoPerfil.DES_PRODUCT != "- Seleccione -") {
            let params = {
                nbranch: this.CONSTANTS.RAMO,
                channel: this.cotizacion.brokers[0].COD_CANAL,
                policyType: this.CONSTANTS.TIPO_POLIZA.INDIVIDUAL,
                renewalType: this.poliza.renovacion.codigo,
                creditType: this.poliza.tipoPerfil.COD_PRODUCT,
                billingType: this.poliza.tipoFacturacion.codigo,
                currency: this.poliza.moneda.codigo
            };
            this.desgravamenService.getListaTipoPlan(params).subscribe(
                (res) => {
                    //let response: any = res.planList;
                    this.poliza.listPlanes = res.planList;
                    this.emitirCambiarDatoPoliza();
                    /*
                            this.poliza.producto = {
                              COD_PRODUCT: response.COD_PRODUCT,
                              DES_PRODUCT: response.DES_PRODUCT,
                              NBRANCH: response.NBRANCH,
                              id: response.COD_PRODUCT,
                              codigo: response.COD_PRODUCT,
                            };
                            */
                },
                (err) => {
                    console.log(err);
                }

            );
        } else {
            //this.flagRenovacion = true;
        }
    }

    cambiarTipoPerfil() {
        //this.validarTipoRenovacion();

        this.getSegmento();
        //this.mostrarTipoPlan();
        if (!!this.poliza.tipoPerfil){
        this.poliza.producto = {
            COD_PRODUCT: this.poliza.tipoPerfil.COD_PRODUCT,
            codigo: this.poliza.tipoPerfil.COD_PRODUCT
        }
            }
        this.poliza.tipoPoliza = {
            id: 1
        }
        this.poliza.tipoPlan = {
            ID_PLAN: 1,
            TIPO_PLAN: 'demo plan'
        }

        // Alex Gallozo 14/03/2023  Agregando un valor inicial al campo número de cuotas
        if (this.poliza.nroCuotas && !this.detail)
        {
            this.poliza.nroCuotas = 36;
            this.CambiarCuotas();
        }

        this.poliza.codSegmento = "61bb7d52-6f36-483e-9fe9-f9f83ab0889f"
        this.poliza.checkbox1 = { POL_MAT: false, isSelected: false };

        this.cotizacion.cotizador.changeContratante = true;
        this.cotizacion.cotizador.changeDatosPoliza = false;
        //this.cotizacion.cotizador.changeDatosPoliza = true;
        this.poliza.tipoRenovacion = null;
        this.poliza.frecuenciaPago = null;
        this.emitirCambiarDatoPoliza();

    }



    cambiarMoneda() {
        this.getSegmento();
    }

    validarTipoRenovacion() {
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_VIAJES.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    this.poliza.tipoRenovacion = {
                        COD_TIPO_RENOVACION: 6,
                        DES_TIPO_RENOVACION: "ESPECIAL",
                        text: "ESPECIAL",
                        codigo: 6,
                        valor: "ESPECIAL"
                    };
                } else {
                    this.poliza.tipoRenovacion = {
                        codigo: '',
                        valor: '- Seleccione -',
                        text: '- Seleccione -'
                    };
                }
            }
        };
        this.emitirCambiarDatoPoliza();
    }

    cambiarTipoRenovacion() {
        this.poliza.frecuenciaPago = {
            codigo: '',
            valor: '- Seleccione -',
            text: '- Seleccione -',
        };    

        this.cotizacion.cotizador.changeContratante = true;
        this.cotizacion.cotizador.changeDatosPoliza = true;
        this.emitirCambiarDatoPoliza();
    }

    cambiarRenovacion() {
        if (this.poliza.renovacion.id == "2") {
            this.flagRenovacion = false;
        } else {
            this.flagRenovacion = true;
        }
        this.poliza.tipoRenovacion = null;
        this.poliza.frecuenciaPago = null;
        this.getSegmento();
    }

    cambiarTipoFreq() {
        this.verificarInicioAseg();
        this.cotizacion.cotizador.changeContratante = true;
        this.cotizacion.cotizador.changeDatosPoliza = true;
        this.emitirCambiarDatoPoliza();
    }

    CambiarCuotas() {
        if (this.poliza.nroCuotas != null && this.poliza.nroCuotas != undefined && this.cotizacion.poliza.tipoRenovacion && this.poliza.nroCuotas != "0")
        {
        this.cotizacion.cotizador.changeContratante = true;
        this.cotizacion.cotizador.changeDatosPoliza = true;
        this.numcuotas = this.poliza.nroCuotas;
        this.emitirCambiarDatoPoliza();
        }
    }

    productoVidaGrupo() {
        let params = {
            productId: this.codProducto,
            epsId: this.epsItem.NCODE,
        };
        this.accPersonalesService.getProductList(params).subscribe(
            (res) => {
                let response: any = res[0];

                this.poliza.producto = {
                    COD_PRODUCT: response.COD_PRODUCT,
                    DES_PRODUCT: response.DES_PRODUCT,
                    NBRANCH: response.NBRANCH,
                    id: response.COD_PRODUCT,
                    codigo: response.COD_PRODUCT,
                };
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getSegmento() {
        if (!!this.poliza.tipoPerfil){
        if (this.poliza.tipoPerfil.DES_PRODUCT != "- Seleccione -") {
            let params = {
                nbranch: this.CONSTANTS.RAMO,
                    channel: this.cotizacion.brokers[0].COD_CANAL,
                policyType: this.CONSTANTS.TIPO_POLIZA.INDIVIDUAL,
                renewalType: this.poliza.renovacion.codigo,
                creditType: this.poliza.tipoPerfil.COD_PRODUCT,
                billingType: this.poliza.tipoFacturacion.codigo,
                currency: this.poliza.moneda.codigo,
                birthday_contractor: this.cotizacion.contratante.fnacimiento
            };
            this.desgravamenService.getListaTipoPlan(params).subscribe(
                (res) => {
                    if (res.codError != '1') {
                        this.poliza.codSegmento = res.codSegmento;
                        this.poliza.listPlanes = res.planList;
                        if (this.cotizacion.modoVista == undefined ||
                            this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
                            this.poliza.listReglas = res.rulesList;
                        }
                        this.emitirCambiarDatoPoliza();
                    } else {
                        this.poliza.codSegmento = '';
                        this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
                        swal.fire('Información', res.sMessage, 'error');
                        this.emitirCambiarDatoPoliza();
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
    
    
        } else {
            this.poliza.codSegmento = '';
            this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
            this.emitirCambiarDatoPoliza();
        }
    }
        
    }

    emitirCambiarDatoPoliza() {

        setTimeout(() => {
            this.cambiaDatosPoliza.emit();
        }, 100);
    }

    CambioPlan() {
        this.cotizacion.cotizador.changeContratante = true;
        this.cotizacion.cotizador.changeDatosPoliza = true;
        this.emitirCambiarDatoPoliza()
    }

    validarPolizaMatriz() {
        if (this.poliza.checkbox1.POL_MAT === true) {
            this.poliza.checkbox1.FAC_ANT = false;
        }
    }
    bloqueo: boolean = true;
    validarDeshabilitarNroCredito() {

        //return validarDisabledNroCredito;
        if (this.detail == true) {
            if (this.bloqueo) {
                if (this.poliza.nroCredito == "0" ||
                    this.poliza.nroCredito == "") {
                    this.bloqueo = false;
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }

        } else {
            return false;
        }

    }

    validarDeshabilitarFechaVigenciaInicio() {
        if (!this.cotizacion.modoVista) {
            // COTIZAR
            return false;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZARENOVAR
        ) {
            // RENOVACION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR
        ) {
            // INCLUSION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EXCLUIR
        ) {
            // EXCLUSION
            return true;
        } else if (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ENDOSO) {
            // ENDOSO
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ANULACION
        ) {
            // ANULACION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.VISUALIZAR
        ) {
            // VISUALIZAR
            return true;
        } else {
            // EVALUACION
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {
                return (
                    !this.detail &&
                    (this.CONSTANTS.PERFIL.COMERCIAl ==
                        this.storageService.user.profileId ||
                        this.CONSTANTS.PERFIL.OPERACIONES ==
                        this.storageService.user.profileId) &&
                    this.poliza.tipoRenovacion.codigo !==
                    this.CONSTANTS.TIPO_RENOVACION.ESPECIAL
                );
            } else {
                return true;
            }
        }
    }

    validateMin() {
        if (this.cotizacion.tipoTransaccion == 2) {
            let now = new Date(
                new Date().getMonth() +
                1 +
                '/' +
                new Date().getDate() +
                '/' +
                new Date().getFullYear()
            );
            if (
                new Date(this.poliza.fechaInicioAseguradoMes).getTime() ==
                new Date(now).getTime()
            ) {
                return this.poliza.fechaInicioPoliza;
            } else {
                return this.poliza.fechaMinInicioAsegurado;
            }
        } else {
            return this.poliza.fechaInicioPoliza;
        }
    }

    verificarInicioAseg() {
        if (this.cotizacion.tipoTransaccion == 8) {
            if (
                this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA !=
                Number(this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA)
            ) {
                let date = new Date(this.poliza.fechaFinAseguradoEn);
                date.setDate(date.getDate() + 1);
                return (this.poliza.fechaInicioAseguradoMes = date);
            } else {
                return (this.poliza.fechaInicioAseguradoMes =
                    this.poliza.fechaInicioAseguradoEn);
            }
        } else {
            return this.poliza.fechaInicioAseguradoMes;
        }
    }
}
