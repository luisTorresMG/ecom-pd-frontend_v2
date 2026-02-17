import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    ChangeDetectionStrategy
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { CommonMethods } from '../../../../common-methods';
import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { ValErrorComponent } from '../../../../../modal/val-error/val-error.component';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AccPersonalesService } from '../../acc-personales.service';
import { StorageService } from '../../core/services/storage.service';
import { ViewCouponComponent } from '../../../../../modal/view-coupon/view-coupon.component';
import { ExcelService } from '../../../../../services/shared/excel.service';

interface Nacionality 
{
    NNATIONALITY: Number;
    SDESCRIPT: string;
}
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'panel-info-trama',
    templateUrl: './panel-info-trama.component.html',
    styleUrls: ['./panel-info-trama.component.css'],
})
export class PanelInfoTramaComponent implements OnInit, OnChanges {
    @Input() detail: boolean;
    @Input() trama: any;
    @Output() tramaChange: EventEmitter<any> = new EventEmitter();
    @Input() isLoading: any;
    @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
    @Input() recargar: any;
    @Output() recargarChange: EventEmitter<any> = new EventEmitter();
    @Input() poliza: any;
    @Input() cotizacion: any;
    @Output() cotizacionChange: EventEmitter<any> = new EventEmitter();
    @Input() esMina: any;
    @Input() zeroBroker: any;
    @Input() cambiocontratante: any;
    @Input() validacionTrama : any;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    variable: any = {};
    CONSTANTS: any = AccPersonalesConstants;
    p_nid_proc: string;
    coberturas: any = [];
    asistencias: any = [];
    beneficios: any = [];
    recargos: any = [];
    servAdicionales: any = [];
    inputValorOri: number | null = null; //AVS - RENTAS
    primaNeta: any;


    @Output() cargaTrama: EventEmitter<any> = new EventEmitter();

    constructor(
        public clientInformationService: ClientInformationService,
        private accPersonalesService: AccPersonalesService,
        public quotationService: QuotationService,
        private storageService: StorageService,
        private modal: NgbModal,
        public excelService: ExcelService,
        private modalService: NgbModal,
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
    }

    ngOnInit() {

        this.trama = this.trama || {};
        this.tramaChange.emit(this.trama);

        if (!this.cotizacion.modoTrama) {
            this.trama.PRIMA = "0";
            this.trama.PRIMA_DEFAULT = "0";
        }

        // Configuracion de las variables
        this.variable = CommonMethods.configuracionVariables(
            this.codProducto,
            this.epsItem.NCODE
        );

        if (this.cotizacion.modoTrama == true && this.cotizacion.esEstudiantil && (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO || this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO == this.CONSTANTS.RAMO)) {
            this.trama.validado = false;
            this.tramaChange.emit(this.trama);
        }
    }

    ngOnChanges(changes) {
        if (changes.recargar && changes.recargar.currentValue === true) {
            setTimeout(() => {
                this.recargarChange.emit(false);
            });

            if (this.trama.excelSubir != undefined) {
                this.cambiaDatosPoliza();
            }
        }
        if (changes.validacionTrama && this.poliza.checkbox6.EQUAL_PERSON) {
            this.GenerarTramita();
        }
        if (changes.esMina &&
            changes.esMina.previousValue !== undefined
        ) {
            this.validarExcel(false);
        }

        if (changes.zeroBroker && changes.zeroBroker.previousValue !== undefined) {
            this.validarExcel(false)
        }

        if (changes.cambiocontratante && !changes.cambiocontratante.isFirstChange()) {
            if (changes.cambiocontratante.currentValue != changes.cambiocontratante.previousValue && changes.cambiocontratante.previousValue != 0) {
                this.clearTrama();
            }
        }
    }

    // obtenerPrimaMinima() {
    //   this.accPersonalesService.obtenerPrimaMinima().subscribe((res) => {
    //     this.trama.PRIMA = "0" //res.premium;
    //     this.trama.PRIMA_DEFAULT = "0" //res.premium;
    //   });
    // }

    cambiaDatosPoliza() {
        if (this.trama.excelSubir != undefined) {
            if (this.cotizacion.trama.validado && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                this.validarTrama();
            } else {
                this.validarExcel();
            }
        }
    }

    // GCAA 06022024
    verCupones() {
        if (this.p_nid_proc == '' || this.p_nid_proc == null) {
            swal.fire('Información', 'debe Validar la trama antes de ver los cupones', 'error');
            return;
        }
        this.ListaCupones(this.p_nid_proc);
    }

    GenerarTramita() {
        if(this.poliza.tipoPoliza.codigo!="1"){
            return;
        }

        let jsonReal = [];
        let match = "";
        let found = false;
        let genero = "";

        this.clientInformationService.getNationalityList().subscribe((result: Nacionality[]) => {
        const convertresult = result.reduce((acc, currentValue) => acc.concat(currentValue), []);

        convertresult.forEach(item => {
            if (found) return;
            if (item.NNATIONALITY.toString() == this.cotizacion.contratante.cliente360.P_NNATIONALITY) {
                match = item.SDESCRIPT;
                found = true;
            }
        });

            switch (this.cotizacion.contratante.cliente360.P_SSEXCLIEN) {
                case "1":
                    genero = "F";
                    break;
                case "2":
                    genero = "M";
                    break;
                case "3":
                    genero = "N";
                    break;
                default:
                    genero = " ";
            }

        if (match) {
            jsonReal = [{
                "ROL": "Asegurado",
                "TIPODOC": this.cotizacion.contratante.tipoDocumento.Name,
                "NUMDOC": this.cotizacion.contratante.numDocumento,
                "APEPAT": this.cotizacion.contratante.apellidoPaterno,
                "APEMATERNO": this.cotizacion.contratante.apellidoMaterno,
                "NOMBRES": this.cotizacion.contratante.nombres,
                    "GENERO": genero,
                    "FECHANAC": this.cotizacion.contratante.cliente360.P_DBIRTHDAT,
                "SUELDOBP": "",
                "CORREO": this.cotizacion.contratante.email,
                "NUMCEL": this.cotizacion.contratante.cliente360.P_SPHONE,
                "TIPODOCASEG": "",
                "NUMDOCASEG": "",
                "PORCENT": "",
                "REL": "Titular",
                "PAIS": match,
                "GRADO": ""
            }]
            const { blob, fileName } = this.excelService.generateTramaitaExcel(jsonReal);
            this.trama.excelSubir = { blob, fileName };

            this.validarExcel(true);
        } else {
                console.log('No se encontró ninguna coincidencia para el cod:', this.cotizacion.contratante.cliente360.P_NNATIONALITY);
            }
        });
    }

    validarExcel(validar?) {
        let msg = '';

        if (!this.cotizacion.contratante.tipoDocumento || !this.cotizacion.contratante.numDocumento) {
            msg += 'Debe ingresar un contratante <br>';
        }
        if (!this.poliza.tipoPoliza || !this.poliza.tipoPoliza.id) {
            msg += 'Debe elegir el tipo de producto  <br>';
        }

        if (!this.poliza.tipoPerfil || !this.poliza.tipoPerfil.NIDPLAN) {
            msg += 'Debe elegir el tipo de perfil  <br>';
        }

        if (!this.poliza.modalidad || !this.poliza.modalidad.ID) {
            msg += 'Debe elegir el tipo de modalidad  <br>';
        }
        if (this.cotizacion.brokers.length === 0) {
            msg += 'Debe ingresar un broker  <br>';
        }

        if (!this.poliza.tipoRenovacion ||
            !this.poliza.tipoRenovacion.COD_TIPO_RENOVACION) {
            msg += 'Debe elegir el tipo de renovación  <br>';
        }

        if (!this.poliza.frecuenciaPago ||
            !this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA) {
            msg += 'Debe elegir la frecuencia de pago  <br>';
        }

        if (!this.poliza.fechaInicioPoliza) {
            msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
        }

        if (!this.poliza.tipoPlan || !this.poliza.tipoPlan.ID_PLAN) {
            msg += 'Debe elegir el tipo de plan  <br>';
        }

        if (!this.cotizacion.poliza.moneda || !this.cotizacion.poliza.moneda.NCODIGINT) {
            msg += 'Debe elegir la moneda  <br>';
        }

        if (this.trama.excelSubir == undefined) {
            msg += 'Adjunte una trama para validar  <br>';
        }
        // validaciones nuevas tarifario //
        if (this.cotizacion.poliza.listReglas.flagAlcance) {
            if (!this.cotizacion.poliza.codAlcance || !this.cotizacion.poliza.codAlcance.id) {
                msg += 'Debe elegir el alcance  <br>';
            }
        }

        // estudiantil
        if (this.cotizacion.poliza.listReglas.flagTemporalidad) {
            if (!this.cotizacion.poliza.temporalidad || !this.cotizacion.poliza.temporalidad.id) {
                msg += 'Debe elegir la temporalidad  <br>';
            }
        }
        // viajes
        // if(!this.cotizacion.poliza.codTipoViaje || !this.cotizacion.poliza.codTipoViaje.id ){
        //   msg += 'Debe elegir el tipo de viaje  <br>';
        // }
        if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 1) {

            /*   if(!this.cotizacion.poliza.codOrigen || !this.cotizacion.poliza.codOrigen.Id ){
                msg += 'Debe elegir un origen  <br>';
              } */
            if (!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.Id) {
                msg += 'Debe elegir un departamento  <br>';
            }
        } /* else if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 2){
      if(!this.cotizacion.poliza.codOrigen || !this.cotizacion.poliza.codOrigen.NCOUNTRY){
        msg += 'Debe elegir un origen  <br>';
      }
      if(!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.NCOUNTRY){
        msg += 'Debe elegir un destino  <br>';
      }
    } */

        if (!this.poliza.tipoActividad ||
            !this.poliza.tipoActividad.codigo) {
            msg += 'Debe elegir la actividad económica  <br>';
        }

        if (!this.poliza.CodCiiu ||
            !this.poliza.CodCiiu.codigo) {
            msg += 'Debe elegir el CIIU  <br>';
        }

        if (!this.verificarPerfilAforo()) {
            if(this.verificarPerfilEstudiantilAP() || this.verificarPerfilEstudiantilVG() && !this.cotizacion.poliza.listReglas.flagTrama){
                // if (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO) {
                if (!this.detail) {
                    if (this.trama.MONT_PLANILLA == 0) {
                        msg += 'Debe ingresar el monto máximo de pensión  <br>';
                    }
                }
                else {
                    console.log(this.cotizacion.cotizador.cotizadorDetalleList);
                    console.log(this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA)
                    if (this.cotizacion.tipoTransaccion == 4) { //AVS - RENTAS
                        if (Number(this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA) == 0) {
                            msg += 'Debe ingresar el monto máximo de pensión  <br>';
                        }
                    }
                }
            }
        }


        // validaciones personalizadas para endoso
        /*if (this.cotizacion.tipoTransaccion == 8) {
          if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA < this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA) {
            msg += 'La frecuencia de pago no aplica para la facturación restante<br>';
          }
          else {
            if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA == 4 && Number(this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA) == 3) {
              msg += 'La frecuencia de pago no aplica para la facturación restante<br>';
            }
          }
        }*/

        if (msg === '') {
            this.validarTrama();
        } else {
            this.trama.infoPrimaList = [];
            this.trama.infoPlanList = [];
            this.clearTrama();
            this.isLoadingChange.emit(false);

            if (validar) {
                swal.fire('Información', msg, 'error');
            }
        }
    }

    getValidacionComision(type) {
        let comisionPrev = '0';
        let comision = '0';

        if (type == 1) { // Comision original || Comision propuesta
            comisionPrev = this.cotizacion.brokers[0].P_COM_SALUD_PRO != '0' ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : this.cotizacion.brokers[0].P_COM_SALUD;
        }

        if (type == 2) { // Comision propuesta
            comisionPrev = this.cotizacion.brokers[0].P_COM_SALUD_PRO != '0' ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : '0';
        }

        switch (true) {
            case comisionPrev === '.':
                comision = '0';
                break;

            case comisionPrev.toString().endsWith('.'):
                comision = comisionPrev.slice(0, -1);
                break;

            default:
                comision = comisionPrev;
                break;
        }

        return comision;
    }

    validarTrama(codComission?: any) {
        this.isLoadingChange.emit(true);
        this.trama.infoPrimaList = [];
        this.trama.infoPlanList = [];
        const myFormData: FormData = new FormData();

        this.poliza.checkbox6?.EQUAL_PERSON ? myFormData.append('dataFile', this.trama.excelSubir.blob, this.trama.excelSubir.fileName) : myFormData.append('dataFile', this.trama.excelSubir);

        const data = this.generateObjValida(codComission);
        myFormData.append('objValida', JSON.stringify(data));

        this.quotationService.valTrama(myFormData).subscribe(
            async (res) => {
                if(res.P_CALIDAD == 2){
                await this.obtValidacionTrama(res);
                }else{
                    await this.newValidateTrama(res.NIDPROC, codComission);
                }
            },
            (error) => {
                this.quotationService.valTrama(myFormData).subscribe(
                    async (res) => {
                        if(res.P_CALIDAD == 2){
                        await this.obtValidacionTrama(res);
                        }else{
                            await this.newValidateTrama(res.NIDPROC, codComission);
                        }
                        //this.cargaTrama.emit(true);
                    },
                    (error) => {
                        this.quotationService.valTrama(myFormData).subscribe(
                            async (res) => {
                                if(res.P_CALIDAD == 2){
                                await this.obtValidacionTrama(res);
                                }else{
                                    await this.newValidateTrama(res.NIDPROC, codComission);
                                }
                                //this.cargaTrama.emit(true);
                            },
                            (error) => {
                                this.isLoadingChange.emit(false);
                                //this.cargaTrama.emit(false);
                            }
                        );
                    }
                );
            }
        );

    }

    // clickClearExcel() {
    //     this.trama.excelSubir = null;
    //     this.initCotizadorDetalle();
    // }

    initCotizadorDetalle() {
        this.cotizacion.cotizador.cotizadorDetalleList = [{
            TASA: '0',
            PRIMA_UNIT: '0',
            PRIMA: '0',
            MONT_PLANILLA: '0',
            TOT_ASEGURADOS: '0'
        }];
    }

    clearTrama() {
        this.trama.validado = false;
        this.cotizacion.trama.validado = false;
        this.tramaChange.emit(this.trama);
        this.cotizacionChange.emit(this.cotizacion);

        if (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO) {
            if (!this.detail) {
                this.initCotizadorDetalle();
            }
        } else {
            this.initCotizadorDetalle();
        }

        if (this.cotizacion.tipoTransaccion == 0 && this.cotizacion.brokers.length > 0) {
            this.cotizacion.brokers[0].P_COM_SALUD = 0;
        }

        if (!this.cotizacion.modoTrama) {
            this.trama.TOT_ASEGURADOS = 0;
            this.trama.MONT_PLANILLA = 0;
            this.trama.SUM_ASEGURADA = 0;
            this.trama.PRIMA = 0;
            this.cotizacion.cotizador.tasa_pro = 0;
            this.cotizacion.cotizador.prima_pro = 0;
        }
    }

    getPrima(amountPremiumList, flag = true) {
        let amount = 0;
        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 1) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_ANU : amountPremiumList[2].NPREMIUMN_ANU;
        }

        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 2) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_SEM : amountPremiumList[2].NPREMIUMN_SEM;
        }

        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 3) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_TRI : amountPremiumList[2].NPREMIUMN_TRI;
        }

        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 4) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_BIM : amountPremiumList[2].NPREMIUMN_BIM;
        }

        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 5) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_MEN : amountPremiumList[2].NPREMIUMN_MEN;
        }

        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 6) {
            amount = flag ? amountPremiumList[3].NPREMIUMN_ESP : amountPremiumList[2].NPREMIUMN_ESP;
        }

        return amount;
    }

    verficaTramaErrores(erroresList,data) {
        /*this.trama.codProceso = null;
        const modalRef = this.modal.open(ValErrorComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.erroresList = erroresList;*/
        console.log('res', data);
        this.trama.codProceso = null;
        const modalRef = this.modal.open(ValErrorComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.erroresList = erroresList;
        modalRef.componentInstance.base64String = data.insuredError.P_SFILE;
        modalRef.componentInstance.fileName = 'errores_' + data.NIDPROC;
    }

    // GCAA 06022024
    ListaCupones(nid_proc) {
        this.trama.codProceso = null;
        const modalRef = this.modal.open(ViewCouponComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.nid_proc = nid_proc;
    }

    verificarPerfilEstudiantil() {
        let flag = false;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    verificarPerfilEstudiantilVG() {
        let flag = false;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            // if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
            //     if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
            //         flag = true;
            //     }
            // }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    verificarPerfilAforo() {
        let flag = false;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (Number(this.cotizacion.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_AFORO.ACC_PERSONALES) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (Number(this.cotizacion.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    verificarPerfilEstudiantilAP() {
        let flag = false;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }
        }
        return flag;
    }

    validarAforo() {
        let flag = true;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.cotizacion.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.ACC_PERSONALES) {
                    flag = false;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (this.cotizacion.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
                    flag = false;
                }
            }
        }

        return flag;
    }

    propuestaComision(event: any, number: any, i: any) {
        this.trama.amountPremiumList = [];
        this.trama.SUM_ASEGURADA = 0;
        this.trama.PRIMA = 0;
        this.trama.validado = false;

        this.clickCalcularPrima(null, 'propuesta', 0);
    }

    validarMontoPrima(flagValidacion: any) {
        let flag = false;

        if (flagValidacion == 1) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR === this.cotizacion.modoVista && !this.cotizacion.poliza.listReglas.flagTrama && !this.cotizacion.cotizador.calculado) {
                    flag = true;
                }
            }
        } else if (flagValidacion == 2) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (!this.cotizacion.poliza.listReglas.flagTrama) {
                    flag = true;
                }

                if (this.cotizacion.poliza.listReglas.flagTrama && this.cotizacion.modoRenovacionEditar) {
                    flag = true;
                }
            }
        } else if (flagValidacion == 3) {
            flag = true;
        }

        return flag;
    }

    flagMejoraRenovacion(){
        let producto = this.poliza.producto.codigo
        const esTipoTransaccionValida = this.cotizacion.tipoTransaccion === 4;
        const productosRamo61 = [3, 7]; // 5
        const productosRamo72 = [3]; // 2
        const esProductoValido =
        (this.CONSTANTS.RAMO === "61" && productosRamo61.includes(producto)) ||
        (this.CONSTANTS.RAMO === "72" && productosRamo72.includes(producto));

        if (esTipoTransaccionValida && esProductoValido) {
            return true
        }else{
            return false;
        }
    }

    clickCalcularPrima(event: any, action?: string, codigo?: any) {
        let aditionalbool = false;

        const params = {
            origen: action,
            flagCalcular: this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar ? 1 : 0, //AVS - RENTAS
            //this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId ? 1 : 0,
            codUsuario: this.storageService.userId,
            desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
            contratante: this.cotizacion.contratante.id,
            codRamo: this.CONSTANTS.RAMO,
            codProducto: this.poliza.producto.COD_PRODUCT,
            codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
            CantidadTrabajadores: this.trama.TOT_ASEGURADOS,
            codProceso: this.trama.NIDPROC,
            mina: this.poliza.checkbox2.TRA_MIN,
            PolizaMatriz: this.validarAforo()
                ? this.poliza.checkbox1.POL_MAT
                : 0,
            type_mov: this.cotizacion.tipoTransaccion == 0 && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR && this.cotizacion.transac == 'RE' ? 4 : this.cotizacion.tipoTransaccion, //AVS - AP y VG - COMISION
            nroCotizacion: this.cotizacion.numeroCotizacion || 0,
            montoPlanilla: this.trama.MONT_PLANILLA,
            tipoCotizacion: this.poliza.tipoTarifario.tipoCotizacion || this.poliza.tipoTarifario2.tipoCotizacion,
            flagTrama: this.poliza.listReglas.flagTrama ? 1 : 0,
            comision: this.getValidacionComision(1), //this.cotizacion.brokers[0].P_COM_SALUD_PRO != 0 ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : this.cotizacion.brokers[0].P_COM_SALUD, //AVS - AP y VG - COMISION
            comisionPro: this.getValidacionComision(2), //this.cotizacion.brokers[0].P_COM_SALUD_PRO != 0 ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : 0, //AVS - AP y VG - COMISION
            ntype_inter: this.cotizacion.brokers[0].NINTERTYP != null ? this.cotizacion.brokers[0].NINTERTYP : 0, //AVS - AP y VG - COMISION
            nintermed: this.cotizacion.brokers[0].nintermed != null ? this.cotizacion.brokers[0].nintermed : this.cotizacion.brokers[0].NINTERMED != null ? this.cotizacion.brokers[0].NINTERMED : 0, //AVS - AP y VG - COMISION
            flagCot: this.detail
                ? this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
            tasaProp: this.cotizacion.cotizador.tasa_pro || 0,
            primaProp: this.cotizacion.cotizador.prima_pro || 0,
            datosContratante: {
                codContratante: this.cotizacion.contratante.id, // sclient
                desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
                codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
                documento: this.cotizacion.contratante.numDocumento,
                nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
                apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
                apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
                fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
                nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
            },
            datosPoliza: {
                tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
                numDocumento: this.cotizacion.contratante.numDocumento,
                codTipoNegocio: this.poliza.tipoPoliza.id,
                codTipoProducto: this.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                codTipoModalidad: this.poliza.modalidad.ID,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
                codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                InicioVigPoliza: CommonMethods.formatDate(
                    this.poliza.fechaInicioPoliza
                ),
                FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
                InicioVigAsegurado: CommonMethods.formatDate(
                    this.poliza.fechaInicioAsegurado
                ),
                FinVigAsegurado: CommonMethods.formatDate(
                    this.poliza.fechaFinAsegurado
                ),
                CodActividadRealizar: this.poliza.tipoActividad.Id,
                CodCiiu: this.poliza.CodCiiu.Id,
                codTipoFacturacion: this.poliza.tipoFacturacion.id,
                codMon: this.poliza.moneda.NCODIGINT,
                desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
                nproduct: this.poliza.producto.COD_PRODUCT,
                typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
                type_employee: 1,
                branch: this.CONSTANTS.RAMO,
                poliza_matriz: this.validarAforo()
                    ? this.poliza.checkbox1.POL_MAT
                    : true,
                nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
                trxCode: this.cotizacion.transac,
                commissionBroker: this.getValidacionComision(2), // this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
                //nuevos valores tarifario
                temporalidad: !!this.poliza.temporalidad
                    ? this.poliza.temporalidad.id
                    : 24,
                codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 2,
                tipoUbigeo: !!this.poliza.codTipoViaje
                    ? this.poliza.codTipoViaje.id
                    : 0,
                // codOrigen:
                //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
                //     ? this.poliza.codOrigen.Id
                //     : !!this.poliza.codOrigen
                // ? this.poliza.codOrigen.NCOUNTRY
                // : 0,
                codUbigeo:
                    !!this.poliza.codDestino.Id
                        ? this.poliza.codDestino.Id
                        : 14,
                idTariff: this.poliza.id_tarifario,
                versionTariff: this.poliza.version_tarifario,
                name_tarifario: this.poliza.name_tarifario,
                id_cotizacion: 0,
                proceso_anterior: this.poliza.proceso_anterior,
                modoEditar: this.cotizacion.modoRenovacionEditar
            },
            lcoberturas: action == 'propuesta' ? this.cotizacion.lcoberturas : [],
            lasistencias: action == 'propuesta' ? this.cotizacion.lasistencias : [],
            lbeneficios: action == 'propuesta' ? this.cotizacion.lbeneficios : [],
            lrecargos: action == 'propuesta' ? this.cotizacion.lrecargos : [],
            lservAdicionales: action == 'propuesta' ? this.cotizacion.lservAdicionales : []
        };

        if (action != 'propuesta') {
            this.cotizacion.lcoberturas = [];
            this.cotizacion.lasistencias = [];
            this.cotizacion.lbeneficios = [];
            this.cotizacion.lrecargos = [];
            this.cotizacion.lservAdicionales = [];
        }

        (this.coberturas || []).forEach((item) => {
            console.log(item);

            if (item.id_cover == "FIXED_PENSION_QUANTITY" || item.id_cover == "MAXIMUM_PENSION_QUANTITY") {
                item.pension_prop = item.valor_prop;
            }
            else if (item.id_cover == 'FIXED_INSURED_SUM_PERCENTAGE') {
                item.porcen_prop = item.valor_prop;
            }
            else {
                item.capital_prop = item.valor_prop;
            }

            // if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
            //     if (["1001", "1002", "1003"].includes(item.codCobertura)) { //AVS - RENTAS
            //         console.log(this.inputValorOri);
            //         let valuepro = this.inputValorOri == null ? item.valor_prop : this.inputValorOri;

            //         if (item.id_cover == "FIXED_PENSION_QUANTITY" || item.id_cover == "MAXIMUM_PENSION_QUANTITY") {
            //             item.pension_prop = valuepro;
            //         }
            //         else if (item.id_cover == 'FIXED_INSURED_SUM_PERCENTAGE') {
            //             item.porcen_prop = valuepro;
            //         }
            //         else {
            //             item.capital_prop = valuepro;
            //         }
            //         item.valor_prop = valuepro;
            //         item.capital_prop = valuepro;
            //     }
            // }

            if (action == 'coberturas') {
                if (item.codCobertura == codigo) {
                    item.cobertura_adi = event.checked ? 1 : 0;
                }
            }

            if (action == 'recoberturas') {
                if (item.codCobertura == codigo) {
                    item.capital_prop = event.target?.value || item.capital_prop;
                }
            }

            if (item.cobertura_adi != '0') {
                params.lcoberturas.push(this.getItemCover(item));

                this.cotizacion.lcoberturas.push(this.getItemCover(item));
            }
        });
        console.log('coberturas', params.lcoberturas);

        (this.asistencias || []).forEach((item) => {
            if (action == 'asistencias') {
                if (item.codAssist == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {
                params.lasistencias.push(this.getItemAssistance(item));

                this.cotizacion.lasistencias.push(this.getItemAssistance(item));
            }
        });

        (this.beneficios || []).forEach((item) => {
            if (action == 'beneficios') {
                if (item.codBenefit == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {
                params.lbeneficios.push(this.getItemBenefit(item));

                this.cotizacion.lbeneficios.push(this.getItemBenefit(item));
            }
        });

        (this.recargos || []).forEach((item) => {
            if (action == 'recargos') {
                if (item.codSurcharge == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {
                params.lrecargos.push(this.getItemSurcharge(item));

                this.cotizacion.lrecargos.push(this.getItemSurcharge(item));
            }
        });

        (this.servAdicionales || []).forEach((item) => {
            if (action == 'servAdicionales') {
                if (item.codServAdicionales == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {

                if (item.amount == 0 || item.amount == null) {
                    swal.fire('Información', 'Debe ingresar un número válido mayor a 0', 'error');
                    //item.sMark = '0';
                    item.amount = 1;
                    aditionalbool = true;
                    return;
                }

                params.lservAdicionales.push(this.getItemService(item));

                this.cotizacion.lservAdicionales.push(this.getItemSurcharge(item));
            }
        })

        if (aditionalbool == false) {
            const myFormData: FormData = new FormData();
            myFormData.append('dataCalcular', JSON.stringify(params));

            this.isLoadingChange.emit(true);
            this.accPersonalesService
                .calcularCotizadorConCoberturas(myFormData)
                .subscribe(
                    (res) => {
                        this.cotizacion.calcularCober = true;
                        this.trama = Object.assign(this.trama || {}, res || {});

                        if (res.P_COD_ERR == "1" || res.P_COD_ERR == "3" || res.P_COD_ERR == "2") {
                            // this.isLoadingChange.emit(false);
                            this.trama = Object.assign(this.trama || {}, res || {});
                            this.trama.PRIMA_TOTAL = 0;
                            this.initCotizadorDetalle();
                            if (this.cotizacion.tipoTransaccion == 4 && this.cotizacion.modoRenovacionEditar) { //AVS - RENTAS
                                this.cotizacion.cotizador.cotizadorDetalleList[0]['MONT_PLANILLA'] = '0';
                                this.trama.MONT_PLANILLA = 0;
                                this.trama.IGV = 0;
                                this.cotizacion.calcularCober = this.validarMontoPrima(2) ? false : true;
                            }
                            this.primaNeta = 0;
                            this.trama.amountPremiumList = [];
                            this.cotizacion.cotizador.amountPremiumListAut = [];
                            this.cotizacion.cotizador.comisionList = [];
                            this.cotizacion.trama.validado = (res.P_COD_ERR == "3" || res.P_COD_ERR == "2") ? true : false; //AVS - RENTAS
                            this.cotizacionChange.emit(this.cotizacion);
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                        else {
                            //this.trama = Object.assign(this.trama, res); //AVS - RENTAS
                            this.trama = Object.assign(this.trama || {}, res || {});
                            //this.trama.PRIMA_TOTAL = this.validarMontoPrima(2) ? res.amountPremiumListAnu[3].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList);
                            this.trama.PRIMA_TOTAL = this.validarMontoPrima(2) ? res.amountPremiumListAut[3].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList);
                            this.trama.MONT_PLANILLA = res.cotizadorDetalleList[0].MONT_PLANILLA;
                            //this.trama.IGV = this.validarMontoPrima(2) ? res.amountPremiumListAnu[2].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList, false);
                            this.trama.IGV = this.validarMontoPrima(2) ? res.amountPremiumListAut[2].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList, false);
                            this.trama.validado = true;
                            this.primaNeta = this.trama.PRIMA;
                            this.trama.amountPremiumList = res.amountPremiumList;
                            this.cotizacion.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;
                            this.cotizacion.cotizador.amountPremiumListAut = res.amountPremiumListAut;
                            this.cotizacion.cotizador.amountPremiumListAnu = this.validarMontoPrima(2) ? res.amountPremiumListAnu : this.cotizacion.cotizador.amountPremiumListAnu;
                            this.cotizacion.cotizador.comisionList = res.comisionList;
                            this.tramaChange.emit(this.trama);

                            this.cotizacion.calcularCober = this.validarMontoPrima(2) && this.cotizacion.modoRenovacionEditar ? false : true; //AVS - RENTAS
                            this.cotizacion.trama.validado = true;
                            this.cotizacionChange.emit(this.cotizacion);

                            if (this.trama.PRIMA_TOTAL == 0) {
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                            this.isLoadingChange.emit(false);
                        }
                    },
                    (error) => {
                        this.initCotizadorDetalle();
                        this.cotizacion.calcularCober = false;
                        this.cotizacion.trama.validado = false;
                        this.cotizacionChange.emit(this.cotizacion);
                        this.isLoadingChange.emit(false);
                    }
                );

        }
    }

    getItemCover(item: any) {
        let cover: any = {};

        cover.codCobertura = item.codCobertura;
        cover.sumaPropuesta = item.capital_prop;
        cover.capital = item.capital;
        cover.capitalCovered = item.capitalCovered;
        cover.capital_aut = item.capital_aut;
        cover.capital_max = item.capital_max;
        cover.capital_min = item.capital_min;
        cover.capital_prop = item.capital_prop;
        cover.cobertura_adi = item.cobertura_adi;
        cover.cobertura_pri = item.cobertura_pri;
        cover.descripcion = item.descripcion;
        cover.entryAge = item.entryAge;
        cover.hours = item.hours;
        cover.ncover = item.ncover;
        cover.stayAge = item.stayAge;
        cover.limit = item.limit;
        cover.suma_asegurada = item.suma_asegurada;
        cover.items = item.items;
        cover.nfactor = item.nfactor;
        cover.id_cover = item.id_cover;
        cover.sdes_cover = item.sdes_cover;
        cover.pension_base = item.pension_base;
        cover.pension_max = item.pension_max;
        cover.pension_min = item.pension_min;
        cover.pension_prop = item.pension_prop;
        cover.porcen_base = item.porcen_base;
        cover.porcen_max = item.porcen_max;
        cover.porcen_min = item.porcen_min;
        cover.porcen_prop = item.porcen_prop;
        cover.lackPeriod = item.lackPeriod;
        cover.deductible = item.deductible;
        cover.copayment = item.copayment;
        cover.maxAccumulation = item.maxAccumulation;
        cover.comment = item.comment;

        return cover;
    }

    getItemAssistance(item: any) {
        let assistance: any = {};

        assistance.codAsistencia = item.codAssist;
        assistance.desAssist = item.desAssist;
        assistance.document = item.document;
        assistance.provider = item.provider;
        assistance.value = item.value;
        assistance.sMark = item.sMark;

        return assistance;
    }

    getItemBenefit(item: any) {
        let benefit: any = {};

        benefit.codBeneficio = item.codBenefit;
        benefit.desBenefit = item.desBenefit;
        benefit.sMark = item.sMark;
        benefit.exc_beneficio = item.exc_beneficio == null ? 0 : item.exc_beneficio == undefined ? 0 : item.exc_beneficio == true ? 1 : 0; //AVS - RENTA
        benefit.studentRentBenefit = item.studentRentBenefit;

        return benefit;
    }

    getItemSurcharge(item: any) {
        let surcharge: any = {};

        surcharge.codRecargo = item.codSurcharge;
        surcharge.desRecargo = item.desSurcharge;
        surcharge.comment = item.comment;
        surcharge.print = item.print;
        surcharge.amount = item.value;
        surcharge.sMark = item.sMark;

        return surcharge;
    }

    getItemService(item: any) {
        let service: any = {};

        service.codServAdicionales = item.codServAdicionales;
        service.desServAdicionales = item.desServAdicionales;
        service.amount = item.amount == null ? 0 : item.amount;
        service.sMark = item.sMark;

        return service;
    }

    async obtValidacionTrama(res?) {
        this.cotizacion.calcularCober = false;
        this.isLoadingChange.emit(false);

        //const erroresList = res.baseError.errorList;
        const erroresList = res.insuredError != null ? res.insuredError.insuredErrorList : [];
        const baseError = res.baseError != null ? res.baseError.errorList : [];

        if (res.P_COD_ERR === '1') {
            this.clearTrama();

            if (erroresList.length > 0) {
                // this.trama = {}
                // this.tramaChange.emit(this.trama);
                this.verficaTramaErrores(erroresList, res);
                if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                    // this.trama.validado = false;
                    this.trama.excelSubir = null
                    this.tramaChange.emit(this.trama);
                    this.cotizacion.estadoDeuda = 'Deuda';
                    this.cotizacion.montoDeuda = 0;
                }
            } else {
                if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                    this.trama.validado = false;
                    this.tramaChange.emit(this.trama);
                    this.trama.excelSubir = null
                    this.cotizacion.estadoDeuda = 'Deuda';
                    this.cotizacion.montoDeuda = 0;
                }
                swal.fire('Información', res.P_MESSAGE, 'error');


            }
            this.cargaTrama.emit(false);
        } else {
            if (erroresList != null) {
                if (erroresList.length > 0) {
                    // this.trama = {}
                    if (this.cotizacion.tipoTransaccion == 0 ||
                        (this.cotizacion.tipoTransaccion == 4 && this.cotizacion.modoRenovacionEditar)) {
                        this.cotizacion.brokers[0].P_COM_SALUD = 0;
                    }
                    this.trama.validado = false;
                    this.cotizacion.trama.validado = false;
                    this.tramaChange.emit(this.trama);
                    this.cotizacionChange.emit(this.cotizacion);
                    this.verficaTramaErrores(erroresList, res);
                    if (this.cotizacion.modoTrama == false) {
                        // this.obtenerPrimaMinima();
                        this.trama.TOT_ASEGURADOS = 0;
                        this.trama.MONT_PLANILLA = 0;
                        this.trama.SUM_ASEGURADA = 0;
                        this.cotizacion.cotizador.tasa_pro = 0;
                        this.cotizacion.cotizador.prima_pro = 0;
                    }

                    this.cargaTrama.emit(false);
                } else {

                    if (baseError != null && baseError.length > 0) {
                        const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                        modalRef.componentInstance.formModalReference = modalRef;
                        modalRef.componentInstance.erroresList = baseError;

                        this.cargaTrama.emit(false);
                    } else {
                        // if (this.cotizacion.transac != 'EN') {
                        this.trama = Object.assign(this.trama || {}, res || {});
                        this.trama.PRIMA_TOTAL = this.detail
                            ? res.amountPremiumListAut[3].NPREMIUMN_ANU
                            : this.getPrima(res.amountPremiumList);
                        this.trama.IGV = this.detail
                            ? res.amountPremiumListAut[2].NPREMIUMN_ANU
                            : this.getPrima(res.amountPremiumList, false);
                        this.cotizacion.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;
                        this.cotizacion.cotizador.comisionList = res.comisionList;
                        // } else {
                        //   this.trama = Object.assign(this.trama || {}, res || {});
                        //   this.tramaChange.emit(this.trama);
                        // }
                        if (this.detail && this.cotizacion.transac != 'EN') {
                            this.cotizacion.cotizador.amountPremiumListAnu =
                                res.amountPremiumListAnu;
                            this.cotizacion.cotizador.amountPremiumListAut =
                                res.amountPremiumListAut;
                            this.cotizacion.cotizador.amountPremiumListProp =
                                res.amountPremiumListProp;
                            this.cotizacion.estadoDeuda = 'Exclusión';
                            this.cotizacion.montoDeuda = this.cotizacion.trama.PRIMA;
                        }
                        this.p_nid_proc = res.NIDPROC; // GCAA 07022024
                        this.trama.validado = true;
                        this.cotizacion.trama.validado = true;
                        this.cotizacionChange.emit(this.cotizacion);

                        this.tramaChange.emit(this.trama);
                        
                        if (res.P_COD_ERR === '2') {
                            swal.fire({
                                title: 'Información',
                                text: res.P_QUESTION,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Continuar',
                                allowOutsideClick: false,
                                cancelButtonText: 'Cancelar'
                            })
                                .then(async (result) => {
                                    if (!result.value) {
                                        this.clearTrama();
                                    } else {
                                        if(this.flagMejoraRenovacion()){
                                            this.cargaTrama.emit(true);
                                        }
                                        return;
                                    }
                                });
                        } else {
                            let msjComision = res.P_MESSAGE.includes("La comisión solicitada supera el máximo permitido");

                            if(msjComision){
                                swal.fire('Información', res.P_MESSAGE, 'warning')
                            }else{
                                swal.fire('Información', res.P_MESSAGE, 'success');
                            }

                            if(this.flagMejoraRenovacion()){
                                this.cargaTrama.emit(true);
                            }

                        }

                        if ((this.cotizacion.tipoTransaccion == 0 && !this.cotizacion.modoTrama) ||
                            (this.cotizacion.tipoTransaccion == 4 && this.cotizacion.modoRenovacionEditar)) {

                            console.log('this.cotizacion.tipoTransaccion', this.cotizacion.tipoTransaccion);
                            console.log('this.cotizacion.modoTrama', this.cotizacion.modoTrama);


                        if (this.cotizacion.brokers[0].NINTERTYP == '1') { // directo => 1
                            this.cotizacion.brokers[0].P_COM_SALUD = 0;
                        }
                        else if (this.cotizacion.brokers[0].NINTERTYP == '3') { // broker => 3
                            this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
                        }
                        else { // comercializador => 65 || banca seguro => 67
                            this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_INTER;
                        }
                    }
                    }
                    // if (this.cotizacion.transac != 'EN') {
                    /*this.trama = Object.assign(this.trama || {}, res || {});
                    this.trama.PRIMA_TOTAL = this.detail
                        ? res.amountPremiumListAut[3].NPREMIUMN_ANU
                        : this.getPrima(res.amountPremiumList);
                    this.trama.IGV = this.detail
                        ? res.amountPremiumListAut[2].NPREMIUMN_ANU
                        : this.getPrima(res.amountPremiumList, false);
                    this.cotizacion.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;
                    this.cotizacion.cotizador.comisionList = res.comisionList;

                    // } else {
                    //   this.trama = Object.assign(this.trama || {}, res || {});
                    //   this.tramaChange.emit(this.trama);
                    // }

                    if (this.detail && this.cotizacion.transac != 'EN') {
                        this.cotizacion.cotizador.amountPremiumListAnu =
                            res.amountPremiumListAnu;
                        this.cotizacion.cotizador.amountPremiumListAut =
                            res.amountPremiumListAut;
                        this.cotizacion.cotizador.amountPremiumListProp =
                            res.amountPremiumListProp;
                        this.cotizacion.estadoDeuda = 'Exclusión';
                        this.cotizacion.montoDeuda = this.cotizacion.trama.PRIMA;
                    }
                    this.p_nid_proc = res.NIDPROC; // GCAA 07022024

                    this.trama.validado = true;
                    this.tramaChange.emit(this.trama);

                    if (res.P_COD_ERR === '2') {
                        swal.fire({
                            title: 'Información',
                            text: res.P_QUESTION,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar'
                        })
                            .then(async (result) => {
                                if (!result.value) {
                                    this.clearTrama();
                                } else {
                                    return;
                                }
                            });
                    } else {
                        swal.fire('Información', res.P_MESSAGE, 'success');
                    }*/
                }
            } else {
                swal.fire(
                    'Información',
                    'El archivo enviado contiene errores',
                    'error'
                );

                this.cargaTrama.emit(false);
            }
        }
    }

    generateObjValida(codComission?) {
        const data: any = {
            codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id'],
            desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
            contratante: this.cotizacion.contratante.id,
            nroPoliza: this.cotizacion.poliza.nroPoliza,
            fechaEfecto: this.cotizacion.tipoTransaccion != 3 ?
                this.cotizacion.tipoTransaccion == 0 && this.cotizacion.tipoTransaccion == 1 ?
                    CommonMethods.formatDate(this.poliza.fechaInicioPoliza) :
                    CommonMethods.formatDate(this.poliza.fechaInicioAsegurado) :
                CommonMethods.formatDate(this.poliza.fechaExclusion),
            fechaExclusion: CommonMethods.formatDate(this.poliza.fechaExclusion),
            tipoExclusion: this.cotizacion.contratante.codTipoCuenta == '1' ? 3 : CommonMethods.formatDate(this.poliza.fechaInicioPoliza) == CommonMethods.formatDate(this.poliza.fechaExclusion) ? 1 : 2,
            devolucionPrima: !!this.cotizacion.devolucionPrima && this.cotizacion.devolucionPrima.DEV_PRI ? 1 : 0,
            fechaFin: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
            comision: this.getValidacionComision(1), // this.cotizacion.brokers[0].P_COM_SALUD_PRO != 0 ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : this.cotizacion.brokers[0].P_COM_SALUD, //AVS - AP y VG - COMISION
            comisionPro: this.getValidacionComision(2), // this.cotizacion.brokers[0].P_COM_SALUD_PRO != 0 ? this.cotizacion.brokers[0].P_COM_SALUD_PRO : 0, //AVS - AP y VG - COMISION
            comision_porcentaje: null,
            ntype_inter: this.cotizacion.brokers[0].NINTERTYP != null ? this.cotizacion.brokers[0].NINTERTYP : 0, //AVS - AP y VG - COMISION
            nintermed: this.cotizacion.brokers[0].nintermed != null ? this.cotizacion.brokers[0].nintermed : this.cotizacion.brokers[0].NINTERMED != null ? this.cotizacion.brokers[0].NINTERMED : 0, //AVS - AP y VG - COMISION
            tipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            freqPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            type_mov: this.cotizacion.tipoTransaccion == 0 && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR && this.cotizacion.transac == 'RE' ? 4 : this.cotizacion.tipoTransaccion, //AVS - AP y VG - COMISION
            codProducto: this.poliza.producto.COD_PRODUCT,
            codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
            flagCot: this.detail
                ? this.cotizacion.modoVista ==
                    this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
            planillaMax: 0,
            topeLey: 0,
            fechaActual: null,
            codProceso: this.poliza.proceso_anterior,//this.trama.NIDPROC,
            planTariffList: [
                {
                    planId: this.poliza.tipoPerfil.NIDPLAN,
                    planDes: this.poliza.tipoPerfil.SDESCRIPT,
                    prima: this.poliza.tipoPerfil.NPREMIUM,
                },
            ],
            codActividad: this.poliza.tipoActividad.Id,
            flagComisionPro: 0,
            tasaObreroPro: 0,
            tasaEmpleadoPro: 0,
            flagPolizaEmision: 0,
            nroCotizacion: this.cotizacion.numeroCotizacion || 0,
            premiumPlan: null,
            premiumPlanPro: '',
            desPlan: this.poliza.tipoPerfil.SDESCRIPT,
            codTipoProducto: this.poliza.producto.COD_PRODUCT,
            codTipoModalidad: this.poliza.modalidad.ID,
            codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
            destipoplan: this.poliza.tipoPlan.TIPO_PLAN,
            premiun: this.poliza.primaPropuesta,
            flagCalcular: this.poliza.checkbox1.POL_MAT ? 0 : 0,
            idproc: this.poliza.proceso_anterior,//this.trama.NIDPROC,
            p_ntasa_calculada: 0,
            p_ntasa_prop: 0,
            p_npremium_min: 0,
            p_npremium_min_pr: 0,
            p_npremium_end: 0,
            p_nrate: 0,
            p_ndiscount: 0,
            p_nactivityvariaction: 0,
            p_flag: 0,
            codRamo: this.CONSTANTS.RAMO,
            mina: this.poliza.checkbox2.TRA_MIN,
            PolizaMatriz: this.poliza.checkbox1.POL_MAT,
            flagTrama: this.poliza.listReglas.flagTrama ? 1 : 0,
            flagTasa: this.poliza.listReglas.flagTasa ? 1 : 0,
            flagPrima: this.poliza.listReglas.flagPrima ? 1 : 0,
            tipoCotizacion: this.poliza.tipoTarifario.tipoCotizacion,
            tasaProp: this.cotizacion.cotizador.tasa_pro || 0,
            primaProp: this.cotizacion.cotizador.prima_pro || 0,
            montoPlanilla: this.detail ? this.cotizacion.transac == 'RE' && this.cotizacion.renovación != 'DECLARAR POLIZA'/*&& !this.poliza.listReglas.flagTrama*/ ? this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA : this.cotizacion.cotizador.montoPlanillaOri : this.trama.MONT_PLANILLA,
            flagProcesartrama: this.cotizacion.transac == 'RE' && this.cotizacion.esEstudiantil && Number(this.cotizacion.modoTrama) == 1 && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR  //AVS - RENTAS
                && (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO || this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) ? 1 : 0,
            datosContratante: {
                codContratante: this.cotizacion.contratante.id, // sclient
                desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
                desCodDocumento: this.cotizacion.contratante.tipoDocumento.Name, // Tipo de documento
                codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
                documento: this.cotizacion.contratante.numDocumento,
                nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
                apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
                apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
                fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
                nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
            },
            datosPoliza: {
                tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
                numDocumento: this.cotizacion.contratante.numDocumento,
                codTipoNegocio: this.poliza.tipoPoliza.id,
                codTipoProducto: this.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                codTipoModalidad: this.poliza.modalidad.ID,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
                codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                InicioVigPoliza: CommonMethods.formatDate(this.poliza.fechaInicioPoliza),
                FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
                InicioVigAsegurado: CommonMethods.formatDate(this.poliza.fechaInicioAsegurado),
                FinVigAsegurado: CommonMethods.formatDate(this.poliza.fechaFinAsegurado),
                CodActividadRealizar: this.poliza.tipoActividad.Id,
                CodCiiu: this.poliza.CodCiiu.Id,
                codTipoFacturacion: this.poliza.tipoFacturacion.id,
                codMon: this.poliza.moneda.NCODIGINT,
                desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
                nproduct: this.poliza.producto.COD_PRODUCT,
                typeTransac: this.poliza.checkbox1.POL_MAT
                    ? this.CONSTANTS.TRANSACTION_CODE.EMISION
                    : this.CONSTANTS.TRANSACTION_CODE.COTIZACION,
                type_employee: 1,
                branch: this.CONSTANTS.RAMO,
                nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
                trxCode: this.cotizacion.transac,
                commissionBroker: this.getValidacionComision(2), //this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
                //nuevos valores tarifario
                temporalidad: !!this.poliza.temporalidad ? this.poliza.temporalidad.id : 24,
                codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 2,
                tipoUbigeo: !!this.poliza.codTipoViaje ? this.poliza.codTipoViaje.id : 0,
                //  codOrigen: !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1 ? this.poliza.codOrigen.Id : !!this.poliza.codOrigen ? this.poliza.codOrigen.NCOUNTRY : 0,
                codUbigeo: !!this.poliza.codDestino.Id
                    ? this.poliza.codDestino.Id
                    : 14,
                idTariff: this.poliza.id_tarifario,
                versionTariff: this.poliza.version_tarifario,
                name_tarifario: this.poliza.name_tarifario,
                id_cotizacion: 0,
                proceso_anterior: this.poliza.proceso_anterior,
                modoEditar: this.cotizacion.modoRenovacionEditar
            },
        };

        return data;
    }

    async GetValTramaFin(data) {
        const response: any = {};
        await this.quotationService.getValTramaFin(data).toPromise().then(
            res => {
                response.P_RESPUESTA = res.P_NCODE;
                response.P_SMESSAGE = res.P_SMESSAGE;
            },
            err => {
                response.P_RESPUESTA = 0;
                response.P_SMESSAGE = "No se pudo conectar con el servicio.";
            }
        );
        return response;
    }

    async newValidateTrama(nid_proc, codComission?){
        const request = {
            nid_proc: nid_proc
        }

        while (true) {
            const response = await this.GetValTramaFin(request);

            if (response.P_RESPUESTA === 5) {
                const newData = this.generateObjValida(codComission);
                newData.flagVal = 1;
                newData.nidProcVal = nid_proc;

                const newFormData: FormData = new FormData();
                newFormData.append('objValida', JSON.stringify(newData));

                const resFinal = await this.quotationService.valTrama(newFormData).toPromise();
                await this.obtValidacionTrama(resFinal);
                this.isLoadingChange.emit(false);
                break;
            }else if(response.P_RESPUESTA === 6){
                this.isLoadingChange.emit(false);
                swal.fire({
                    title: 'Información',
                    text: response.P_SMESSAGE,
                    icon: 'error',
                    allowOutsideClick: false,
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        this.isLoadingChange.emit(true);
                        await this.UpdEstadoAsegurados(nid_proc);
                        this.newValidateTrama(nid_proc, codComission);
                    } else if (result.isDismissed) {
                        window.location.reload();
                    }
                });

                break;
            }else if(response.P_RESPUESTA === 7 ){
                this.isLoadingChange.emit(false);                
                swal.fire({
                    title: 'Información',
                    text: response.P_SMESSAGE,
                    icon: 'error',
                    allowOutsideClick: false,
                    showCancelButton: false,
                    confirmButtonText: 'Ok',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        return;
                    }
                });
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    async UpdEstadoAsegurados(nid_proc: any) {
        const response: any = {};
        await this.quotationService.UpdateTramaAsegurados(nid_proc).toPromise().then(
            res => {
                response.P_COD_ERR = res.P_COD_ERR;
                response.P_MESSAGE = res.P_MESSAGE;
            },
            err => {
                response.P_COD_ERR = 0;
                response.P_MESSAGE = "No se pudo conectar con el servicio.";
            }
        );
        return response;
    }

    limpiarValTrama(){
        this.trama.infoPrimaList = [];
        this.trama.infoPlanList = [];
        this.clearTrama();
    }
}
