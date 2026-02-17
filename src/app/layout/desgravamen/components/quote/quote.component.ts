import { ChangeDetectionStrategy, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonMethods } from '../../../../layout/broker/components/common-methods';
import swal from 'sweetalert2';
import { StorageService } from '../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { QuotationService } from '../../../../layout/broker/services/quotation/quotation.service';
import { PolicyemitService } from '../../../../layout/broker/services/policy/policyemit.service';
import { AccPersonalesService } from '../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { ClientInformationService } from '../../../../layout/broker/services/shared/client-information.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DesgravamentConstants } from '../../shared/core/desgravament.constants';
import { DesgravamenServicePD } from '../../desgravament.service';
import { TransactService } from '../../../../layout/broker/services/transact/transact.service';
import { ParameterSettingsService } from '../../../../layout/broker/services/maintenance/parameter-settings.service';
import { PanelInfoTramaComponent } from '../../shared/components/panel-info-trama/panel-info-trama.component';
//import { PanelInfoCotizadorComponent } from '../../shared/components/panel-info-cotizador/panel-info-cotizador.component';

@Component({
    selector: 'app-quote',
    templateUrl: './quote.component.html',
    styleUrls: ['./quote.component.css'],
})
export class QuoteComponent implements OnInit, AfterViewInit {

    @ViewChild(PanelInfoTramaComponent) data_panel: PanelInfoTramaComponent;
    isAsegContra: boolean = true;
    cotizacion: any = {};
    nbranch: string;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    epsItem = JSON.parse(sessionStorage.getItem('eps'));
    isLoading: boolean;
    esEvaluacion: boolean;
    recargar: any = {};
    CONSTANTS: any = DesgravamentConstants;
    modoVista: string;
    modal: any = {};
    numeroCotizacion: any;
    trxPendiente: any;
    modoTrama: boolean;
    perfil: any;
    labelBtn: string;
    fuctionBtn: void;
    flagNroCredito: boolean;
    flagUpdateNroCredito: boolean = false;
    GrupoList: any = [];
    SAPROBADO_DEFECTO: string;
    cotizaDPS: boolean;

    coberturas: any = [];
    asistencias: any = [];
    beneficios: any = [];

    filter: any = {};
    listToShow: any;
    public foundResults: any = [];

    constructor(
        private storageService: StorageService,
        private quotationService: QuotationService,
        private policyemit: PolicyemitService,
        private accPersonalesService: AccPersonalesService,
        private clientInformationService: ClientInformationService,
        private router: Router,
        private route: ActivatedRoute,
        private ngbModal: NgbModal,
        private desgravamenService: DesgravamenServicePD,
        private transactService: TransactService,
        private parameterSettingsService: ParameterSettingsService
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
            JSON.parse(localStorage.getItem('codProducto'))['productId']
        );

        this.modoVista = '';
        this.cotizacion = {
            contratante: {
                codTipoBusqueda: 'POR_DOC',
                lockMark: 0,
                debtMark: 0,
            },
            brokers: [],
            endosatario: [],
            poliza: {
                checkbox1: { POL_MAT: false },
                /*
                dps: {
                  talla: '',
                  peso: '',
                  fuma: {
                    resp: 'NO',
                    consumo: '',
                  },
                  presion: {
                    resp: 'NO',
                    resultado: 'BAJO',
                  },
                  cancer: {
                    resp: 'NO',
                    detalle: '',
                  },
                  infarto: {
                    resp: 'NO',
                    detalle: '',
                  },
                  gastro: {
                    resp: 'NO',
                    detalle: '',
                  },
                  hospitalizado: {
                    resp: 'NO',
                    detalle: '',
                  },
                  viaje: {
                    resp: 'NO',
                    detalle: '',
                  },
                  practicaExtrema: {
                    resp: 'NO',
                    detalle: '',
                  },
                  enfermedadAdi: {
                    detalle: '',
                  },
                },
                */
            },
            trama: {
                excelSubir: [],
            },
            cotizador: {
                changeContratante: false,
                comentario: '',
                files: [],
            },
            files: [],
            modoTrama: false,
            tipoTransaccion: this.tipoTransaccion(),
            activarFormaPago: this.activarFormaPago(),
            fechaEfectoPoliza: new Date(),
            checkPago: '',
            transac: 'EM',
        };
        this.isLoading = false;
        this.esEvaluacion = false;
    }

    async ngOnInit() {
        this.perfil = await this.getProfileProduct(); // 20230325;
        this.obtenerLabelBtn();
        if (this.route.snapshot.data.esEvaluacion === true) {
            this.isLoading = true;
            this.esEvaluacion = true;
            this.numeroCotizacion = this.route.snapshot.params.numeroCotizacion;
            this.modoVista = this.route.snapshot.params.mode;
            this.trxPendiente = this.route.snapshot.queryParams.trx;
            this.modoTrama = this.route.snapshot.queryParams.trama == '1';
            this.cotizacion.primaflag = false;
            await this.obtenerBrokers();
            await this.obtenerCabeceraCotizacion();
            await this.obtenerEndoser();
            await this.EvaluacionVoucher();


            //this.cotizaDPS = true;

            //this.traerRespuestaDPS();
            //AGREGAR AQUI LLAMADA A DPS
            if (this.cotizacion.files.length == 0 || this.cotizacion.files.length == null) {
                this.data_panel.showTrama = true;
                this.data_panel.hiddeShowTrama = true;
            }
            else {
                this.data_panel.showTrama = false;
                this.data_panel.hiddeShowTrama = false;
            }
        }
    }

    ngAfterViewInit() { }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.codProducto;
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
    /*
      async ngAfterViewInit(){
        if (this.cotizacion.poliza.dps.idEstado == 6){
          //Calcular Prima
          this.cotizaDPS = true;
      }
      }
    */
    /*
      EvaluarEmitir() {
        if (
          this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
          this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR
        ) {
          this.policyemit
          .getPolicyEmitCab(
            this.numeroCotizacion,
            this.storageService.variable.var_movimientoEmision,
            this.storageService.userId,
            trama
          )
          .subscribe((res) => {
            const genRes = res.GenericResponse;
            if (genRes.COD_ERR == 0 || genRes.COD_ERR == 2) {
              if (genRes.COD_ERR == 2) {
                swal.fire('Información', genRes.MENSAJE, 'info');
              }
    }
    });
        }
      }
      */

    obtenerTitulo() {
        if (this.esEvaluacion === true) {
            if (
                this.modoVista != this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.ENDOSO &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.EXCLUIR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.ANULACION
            ) {
                if (this.modoTrama && this.cotizacion.poliza.nroPoliza !== '') {
                    return (
                        'Detalle de la Póliza matriz N° ' + this.cotizacion.poliza.nroPoliza
                    );
                } else {
                    const msjPendiente = this.trxPendiente
                        ? ' | ' + this.trxPendiente
                        : '';
                    if (this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR) {
                        return (
                            'Evaluar Cotización N° ' + this.numeroCotizacion + msjPendiente
                        );
                    } else {
                        return (
                            'Detalle de Cotización N° ' + this.numeroCotizacion + msjPendiente
                        );
                    }
                }
            } else {
                if (this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR) {
                    if (this.cotizacion.renovacionTitulo) {
                        return this.cotizacion.renovacionTitulo;
                    } else {
                        return 'RENOVAR PÓLIZA';
                    }
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR) {
                    return 'INCLUSIÓN PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO) {
                    return 'ENDOSAR PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                    return 'EXCLUIR PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION) {
                    return 'ANULAR PÓLIZA';
                }
            }
        }

        return 'Cotizador';
    }

    // details
    async obtenerCabeceraCotizacion() {
        const trama = this.modoTrama ? 1 : 0;
        await this.policyemit
            .getPolicyEmitCab(
                this.numeroCotizacion,
                this.storageService.variable.var_movimientoEmision,
                this.storageService.userId,
                trama
            )
            .toPromise().then(async res => {
                const genRes = res.GenericResponse;
                var actual = new Date(genRes.EFECTO_COTIZACION);
                /*var prueba1 = new Date(actual.getFullYear(), actual.getMonth(), 1);
                var prueba2 = new Date(actual.getFullYear() +1, actual.getMonth()+1, 0);
                var prueba3 = new Date(actual.getFullYear() +1, actual.getMonth(), 0);
                var prueba4 = new Date(actual.getFullYear(), actual.getMonth(), 0);
*/
                if (genRes.COD_ERR == 0 || genRes.COD_ERR == 2) {
                    if (genRes.COD_ERR == 2) {
                        swal.fire('Información', genRes.MENSAJE, 'info');
                    }
                    //TRAE RESPUESTA DPS
                    this.cotizacion.numeroCotizacion = this.numeroCotizacion;
                    this.cotizacion.modoVista = this.modoVista;
                    this.cotizacion.modoTrama = this.modoTrama;
                    this.cotizacion.nidPolicy = genRes.NID_PROC;
                    this.cotizacion.calcularCober = false;
                    this.cotizacion.fin_asegurado = genRes.EXPIRACION_ASEGURADOS;

                    this.cotizacion.contratante = {
                        codTipoBusqueda: 'POR_DOC',
                        tipoDocumento: { Id: genRes.TIPO_DOCUMENTO },
                        numDocumento: (genRes.NUM_DOCUMENTO || '').trim(),
                        tipoPersona: { Id: genRes.COD_TIPO_PERSONA },
                        NOMBRE_RAZON: genRes.NOMBRE_RAZON,
                        direccion: genRes.DIRECCION,
                        email: genRes.CORREO,
                        fnacimiento: genRes.FECHA_NAC,
                        // tipoCuenta
                        // riesgo
                        // contactoa
                    };

                    this.cotizacion.trama = {
                        validado:
                            this.CONSTANTS.MODO_VISTA.POLIZARENOVAR !==
                            this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR !==
                            this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.EXCLUIR !== this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.ENDOSO !== this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.ANULACION !== this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.EVALUAR !== this.cotizacion.modoVista,
                        amountPremiumList: res.amountPremiumList,
                        TOT_ASEGURADOS: res.total_asegurados,
                        PRIMA: res.prima,
                        PRIMA_TOTAL: res.prima,
                        NIDPROC: res.idproc,
                    };
                    const fechafinshow = new Date(genRes.FECHA);
                    //const fechafinshow = new Date(genRes.DFEC_OTORGAMIENTO);
                    fechafinshow.setMonth(fechafinshow.getMonth() + parseInt(genRes.NNUM_CUOTA));
                    fechafinshow.setDate(fechafinshow.getDate() - 1);
                    this.cotizacion.poliza = {
                        nroPoliza: genRes.NPOLICY,
                        producto: { codigo: genRes.NPRODUCT, COD_PRODUCT: genRes.NPRODUCT },
                        tipoPoliza: { codigo: genRes.NID_TYPE_PRODUCT },
                        tipoPerfil: { COD_PRODUCT: genRes.NID_TYPE_PROFILE },
                        modalidad: { codigo: genRes.NID_TYPE_MODALITY },
                        tipoRenovacion: { COD_TIPO_RENOVACION: genRes.TIP_RENOV },
                        frecuenciaPago: { COD_TIPO_FRECUENCIA: genRes.FREQ_PAGO },
                        tipoRenovacionEndoso: { COD_TIPO_RENOVACION: genRes.TIP_RENOV },
                        frecuenciaPagoEndoso: { COD_TIPO_FRECUENCIA: genRes.FREQ_PAGO },
                        /*
                        fechaInicioPoliza: this.CONSTANTS.MODO_VISTA.EVALUAR ? new Date(actual.getFullYear(), actual.getMonth(), 1) : genRes.EFECTO_COTIZACION
                            ? new Date(genRes.EFECTO_COTIZACION)
                            : null,
                        fechaFinPoliza: this.CONSTANTS.MODO_VISTA.EVALUAR ? new Date(actual.getFullYear() +1, actual.getMonth(), 0) : genRes.EXPIRACION_COTIZACION
                            ? new Date(genRes.EXPIRACION_COTIZACION)
                            : null,
                      */

                        fechaInicioPoliza: genRes.EFECTO_COTIZACION
                            ? new Date(genRes.EFECTO_COTIZACION)
                            : null,
                        fechaFinPoliza: genRes.EXPIRACION_COTIZACION
                            ? new Date(genRes.EXPIRACION_COTIZACION)
                            : null,

                        fechaInicioPolizaShow: new Date(genRes.FECHA),
                        //fechaInicioPolizaShow: new Date(genRes.DFEC_OTORGAMIENTO),
                        fechaFinPolizaShow: new Date(fechafinshow),
                        tipoActividad: { Id: genRes.OCCUPATION },
                        actividad: { Id: genRes.ACTIVITY },
                        //CodCiiu: { Id: genRes.ACT_ECO_VL },
                        listPlanes: [
                            {
                                ID_PLAN: genRes.NMODULEC_TARIFARIO,
                                TIPO_PLAN: genRes.SDESCRIPT_TARIFARIO,
                            },
                        ],
                        tipoPlan: {
                            ID_PLAN: genRes.NMODULEC_TARIFARIO,
                            TIPO_PLAN: genRes.SDESCRIPT_TARIFARIO,
                        },
                        fechaInicioAseguradoMes: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        fechaMinInicioAsegurado: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        fechaFinAseguradoMes: genRes.EXPIRACION_ASEGURADOS
                            ? new Date(genRes.EXPIRACION_ASEGURADOS)
                            : null,
                        tipoFacturacion: { id: genRes.COD_TIPO_FACTURACION },
                        moneda: { NCODIGINT: genRes.COD_MONEDA },
                        checkbox1: {
                            POL_MAT: genRes.POLIZA_MATRIZ == 1,
                            FAC_ANT: genRes.FACTURA_ANTICIPADA == 1,
                        },
                        checkbox2: {
                            TRA_MIN: genRes.MINA == 1,
                        },
                        fechaExclusion: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        //nuevos valores desgravament
                        codClienteEndosatario: genRes.SCLIENT_PROVIDER,
                        nroCredito: genRes.NNUM_CREDIT,
                        nroCuotas: genRes.NNUM_CUOTA,
                        fechaOtorgamiento: genRes.DFEC_OTORGAMIENTO
                            ? new Date(genRes.DFEC_OTORGAMIENTO)
                            : null,
                        capitalCredito: CommonMethods.formatNUMBER(parseInt(genRes.NCAPITAL))
                    };
                    this.cotizacion.fechaEfectoPoliza = new Date(
                        genRes.EFECTO_COTIZACION
                    );
                    this.cotizacion.activarFormaPago = await this.activarFormaPago();
                    this.cotizacion.tipoTransaccion = await this.tipoTransaccion();
                    //this.ObtenerFechas();
                    //this.getSegmento();

                    this.cotizacion.poliza.dps = {
                        estado: genRes.EstadoDPS,
                        idestado: genRes.idEstadoDPS,
                    }

                    this.cotizacion.files = genRes.RUTAS;

                    this.cotizacion.cotizador = {
                        comentario: genRes.COMENTARIO,
                        files: genRes.RUTAS,
                        amountPremiumListAnu: res.amountPremiumListAnu,
                        amountPremiumListAut: res.amountPremiumListAut,
                        amountPremiumListProp: res.amountPremiumListProp,
                    };
                    console.log(this.cotizacion);

                    if (this.cotizacion.trama.PRIMA == 0) {
                        this.cotizacion.primaflag = true;
                    } else {
                        this.cotizacion.primaflag = false;
                    }

                    if (genRes.NNUM_CREDIT == "0") {
                        this.flagUpdateNroCredito = true;
                    }
                    if (genRes.COD_ERR == 1) {
                        this.isLoading = false;
                        swal.fire('Información', genRes.MENSAJE, 'error').then((value) => {
                            this.router.navigate([
                                '/extranet/desgravamen/consulta-cotizacion',
                            ]);
                        });
                    }
                } else if (genRes.COD_ERR == 1) {
                    swal.fire('Información', genRes.MENSAJE, 'error');

                    this.router.navigate([
                        '/extranet/desgravamen/consulta-cotizacion',
                    ]);


                    //Valor para regresar
                    //this.router.navigate(['/extranet/tray-transact/1']);
                }
            });
    }
    async obtenerBrokers() {
        await this.policyemit
            .getPolicyEmitComer(this.numeroCotizacion)
            .toPromise().then(async (res) => {
                setTimeout(() => {
                    this.cotizacion.brokers = res.map((item) => {
                        return {
                            NTIPDOC: item.TYPE_DOC_COMER,
                            NNUMDOC: item.DOC_COMER,
                            RAZON_SOCIAL: item.COMERCIALIZADOR,
                            P_COM_SALUD: item.COMISION_SALUD,
                            P_COM_SALUD_PRO: item.COMISION_SALUD_PRO,
                            COD_CANAL: item.CANAL,
                            P_NPRINCIPAL: item.PRINCIPAL,
                            SCLIENT: item.SCLIENT,
                            NTYPECHANNEL: item.TIPO_CANAL,
                            P_SEDIT: 'U',
                        };
                    });

                    this.cotizacion.brokersOriginales = res.map((item) => {
                        return {
                            NTIPDOC: item.TYPE_DOC_COMER,
                            NNUMDOC: item.DOC_COMER,
                            RAZON_SOCIAL: item.COMERCIALIZADOR,
                            P_COM_SALUD: item.COMISION_SALUD,
                            P_COM_SALUD_PRO: item.COMISION_SALUD_PRO,
                            COD_CANAL: item.CANAL,
                            P_NPRINCIPAL: item.PRINCIPAL,
                            SCLIENT: item.SCLIENT,
                            NTYPECHANNEL: item.TIPO_CANAL,
                            P_SEDIT: 'U',
                        };
                    });
                    this.cotizacion.brokersEndoso = [];
                }, 2000);
            });
    }
    async obtenerEndoser() {
        let params = {
            num_cotizacion: this.numeroCotizacion,
            ramo: this.CONSTANTS.RAMO,
        };
        await this.desgravamenService.getEndoserByQuotation(params).toPromise().then((res) => {
            setTimeout(() => {
                this.cotizacion.endosatario = res.providerList.map((item) => {
                    return {
                        tipo_documento: item.tipo_documento,
                        documento: item.documento,
                        nombre_legal: item.nombre_legal,
                    };
                });
            }, 2000);
        });
    }

    async EvaluacionVoucher() {
        const params = {
            QuotationNumber: this.numeroCotizacion,
            LimitPerPage: 5,
            PageNumber: 1,
        };
        await this.quotationService.getTrackingList(params).toPromise().then((res) => {
            let statusChangeList = res.GenericResponse;
            if (!!statusChangeList && statusChangeList.length > 1) {
                const files = statusChangeList[0].FilePathList;
                const estadoAnterior = statusChangeList[1].Status;
                const estadoUltimo = statusChangeList[0].Status;
                if (
                    (estadoAnterior == 'CREADO' && files == null) ||
                    (this.modoVista == 'EmitirR' && estadoUltimo == 'CREADO') ||
                    (this.modoVista == 'EmitirR' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Emitir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Renovar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Declarar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Incluir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Endosar' && estadoUltimo == 'CREADO') ||
                    (this.modoVista == 'EmitirR' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != 5 &&
                        this.perfil != 136) ||
                    (this.modoVista == 'Incluir' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != 5 &&
                        this.perfil != 136) ||
                    (this.modoVista == 'Renovar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != 5 &&
                        this.perfil != 136) ||
                    (this.modoVista == 'Declarar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != 5 &&
                        this.perfil != 136) ||
                    (this.modoVista == 'Endosar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != 5 &&
                        this.perfil != 136) ||
                    this.modoVista == 'Evaluar'
                ) {
                    this.cotizacion.checkPago = true;
                } else {
                    this.cotizacion.checkPago = false;
                }
            } else {
                if (this.modoVista == 'Evaluar') {
                    this.cotizacion.checkPago = true;
                }
            }
            //this.cotizaDPS = true;

        });
    }
    //

    tipoTransaccion() {
        let transaccion = 0;
        return transaccion;
    }

    activarFormaPago() {
        let visualizar = false;
        if (
            !!this.trxPendiente &&
            this.trxPendiente != '' &&
            this.trxPendiente != 'Emisión'
        ) {
            for (const item of this.CONSTANTS.VISTA_FORMA_PAGO.VISTAS) {
                if (this.modoVista === item[0]) {
                    visualizar = this.cotizacion.checkPago;
                }
            }
        } else {
            if (this.modoVista == '') {
                visualizar = false;
            } else {
                if (
                    (!!this.cotizacion.poliza.checkbox1.POL_MAT == true &&
                        this.cotizacion.poliza.tipoPerfil.NIDPLAN != 6) ||
                    this.cotizacion.checkPago != true
                ) {
                    visualizar = false;
                } else {
                    for (const item of this.CONSTANTS.VISTA_FORMA_PAGO.VISTAS) {
                        if (this.modoVista === item[0]) {
                            visualizar = true;
                        }
                    }
                }
            }
        }
        return visualizar;
    }

    clickProcesar() {
        this.validarMensajeContratante();
        this.ValidarSubriTrama();
    }

    ValidarSubriTrama() {
        console.log(this.cotizacion.trama.validado);

        if (this.data_panel.showTrama == false) {

            if (this.cotizacion.trama.validado) {
                return
            }
            else {
                swal.fire('Información', "No se cargó la Trama", 'warning');
            }

        }
    }

    ValidacionContacto(requerid: boolean) {
        if (
            (!(this.cotizacion.contratante.EListContactClient || []).length) &&
            !!this.cotizacion.contratante.creditHistory &&
            !requerid
        ) {
            this.isLoading = false;
            swal
                .fire({
                    title: 'Información',
                    text:
                        this.storageService.variable.var_contactWarningZero,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.ValidacionNroCredito(requerid);
                    } else {
                        this.isLoading = false;
                        return;
                    }
                });
        } else {
            this.ValidacionNroCredito(requerid);
        }
    }

    ValidacionNroCredito(requerid: boolean) {
        if (
            !this.cotizacion.poliza.nroCredito ||
            this.cotizacion.poliza.nroCredito == ""
        ) {
            this.isLoading = false;
            swal
                .fire({
                    title: 'Información',
                    text:
                        this.storageService.variable.var_CreditNoNumber,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.isLoading = true;
                        this.actualizarCliente(requerid);
                    } else {
                        this.isLoading = false;
                        return;
                    }
                });
        } else {
            this.isLoading = true;
            this.actualizarCliente(requerid);
        }
    }

    async validarMensajeContratante() {
        const msgValidate = this.validarCampos();
        if (msgValidate === '') {
            if (!!this.cotizacion.contratante.cliente360) {
                this.validarCliente(false);
            } else {
                swal.fire(
                    'Información',
                    'Los datos del contratante son incorrectos',
                    'error'
                );
            }
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    async validarCliente(requerid: boolean) {
        if (
            this.cotizacion.contratante.flagEmail ||
            this.cotizacion.contratante.flagContact ||
            !this.cotizacion.poliza.nroCredito ||
            this.cotizacion.poliza.nroCredito == "0"
        ) {
            this.cotizacion.contratante.cliente360.P_NUSERCODE =
                this.storageService.userId;
            this.cotizacion.contratante.cliente360.P_TipOper = 'INS';
            this.cotizacion.contratante.cliente360.P_NCLIENT_SEG = -1;

            if (
                this.cotizacion.contratante.flagEmail &&
                !!this.cotizacion.contratante.email
            ) {
                this.cotizacion.contratante.cliente360.EListEmailClient = [];
                const contractingEmail: any = {};
                contractingEmail.P_CLASS = '';
                contractingEmail.P_DESTICORREO = 'Correo Personal';
                contractingEmail.P_NROW = 1;
                contractingEmail.P_NUSERCODE = this.storageService.userId;
                contractingEmail.P_SE_MAIL = this.cotizacion.contratante.email;
                contractingEmail.P_SORIGEN = 'SCTR';
                contractingEmail.P_SRECTYPE = '4';
                contractingEmail.P_TipOper = '';
                this.cotizacion.contratante.cliente360.EListEmailClient.push(
                    contractingEmail
                );
            } else {
                this.cotizacion.contratante.cliente360.EListEmailClient = null;
            }

            if (
                this.cotizacion.contratante.flagContact &&
                !!(this.cotizacion.contratante.EListContactClient || []).length
            ) {
                this.cotizacion.contratante.cliente360.EListContactClient = [];
                this.cotizacion.contratante.EListContactClient.forEach((contact) => {
                    if (Number(contact.P_NTIPCONT) === 0) {
                        contact.P_NTIPCONT = 99;
                    }
                    if (Number(contact.P_NIDDOC_TYPE) === 0) {
                        contact.P_NIDDOC_TYPE = null;
                        contact.P_SIDDOC = null;
                    }
                });
                this.cotizacion.contratante.cliente360.EListContactClient =
                    this.cotizacion.contratante.EListContactClient;
            } else {
                this.cotizacion.contratante.cliente360.EListContactClient = null;
            }
            /*
                  this.actualizarCliente(requerid)
            */

            this.ValidacionContacto(requerid);

        } else {
            if (!requerid) {
                // Validar retroactividad
                /*
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                    this.cotizacion.derivaRetro = true;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    // return;
                } else {
                    */
                this.cotizacion.derivaRetro = false;
                //}
                this.validarMensajePolizaMatriz();
            }
        }
    }

    async validarClientePoliza(requerid: boolean) {
        if (
            !this.cotizacion.poliza.nroCredito ||
            this.cotizacion.poliza.nroCredito == "0"
        ) {
            this.flagNroCredito = false;
            await swal.fire('Información', "No tiene un número de crédito, por favor ingresar uno", 'error');
        } else {
            if (!requerid) {
                // Validar retroactividad
                /*
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                    this.cotizacion.derivaRetro = true;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    // return;
                } else {
                    */
                this.cotizacion.derivaRetro = false;
                //}
                this.validarMensajePolizaMatriz();
            }
        }
    }

    cantmeses(freqpago?: string) {

        let months = 1;

        switch ((freqpago || '').toString()) {
            case '5':
                months = 1;
                break;
            case '4':
                months = 2;
                break;
            case '3':
                months = 3;
                break;
            case '2':
                months = 6;
                break;
            case '1':
                months = 12;
                break;
        }

        return months;
    }


    validarCampos(): any {
        let msg = '';

        if (!this.cotizacion.contratante.creditHistory) {
            msg += 'Debe ingresar un contratante  <br>';
        } else {
            if (this.cotizacion.contratante.email != null) {
                if (this.cotizacion.contratante.email.trim() !== '') {
                    if (
                        /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                            this.cotizacion.contratante.email
                        ) === false
                    ) {
                        msg += 'El correo electrónico es inválido <br />';
                    }
                } else {
                    msg += 'Tiene que ingresar un correo electrónico <br />';
                }
            }
            else {
                msg += 'Tiene que ingresar un correo electrónico <br />';
            }

        }

        if (this.cotizacion.poliza.checkbox1.POL_MAT) {
            if (!this.cotizacion.contratante.email) {
                msg += 'Debe ingresar un correo  <br>';
            }
            if (!(this.cotizacion.contratante.EListContactClient || []).length) {
                msg += 'Debe ingresar un contacto  <br>';
            }
        }

        if (
            !this.cotizacion.contratante.direccion
        ) {
            msg += 'Debe tener una dirección  <br>';
        }

        if (this.cotizacion.brokers.length === 0) {
            msg += 'Debe ingresar un broker  <br>';
        }
        // validacion personalizada para formato de comisión propuesta
        if (this.cotizacion.brokers) {
            for (let item of this.cotizacion.brokers) {
                if (item.P_COM_SALUD_PRO !== 0) {
                    let propuesta = item.P_COM_SALUD_PRO;
                    let ultimoCaracter = propuesta.charAt(propuesta.length - 1);
                    if (ultimoCaracter.includes('.')) {
                        msg +=
                            'El formato de la comisión propuesta del broker, es incorrecto <br>';
                    }
                }
            }
        }

        if (
            !this.cotizacion.poliza.tipoPerfil ||
            !this.cotizacion.poliza.tipoPerfil.COD_PRODUCT
        ) {
            msg += 'Debe elegir el tipo de crédito  <br>';
        }


        //  Inicio Alex Gallozo 14/03/2023 cambiando Label y agregando validacion para el campo número de cuotas
        if (this.cotizacion.poliza.nroCuotas < 36) {
            msg += 'El número de cuotas no puede ser menor a 36  <br>';
        }
        if (this.cotizacion.poliza.nroCuotas > 300) {
            msg += 'El número de cuotas no puede ser mayor a 300  <br>';
        }
        //  Fin Alex Gallozo 14/03/2023 cambiando Label y agregando validacion para el campo número de cuotas

        if (
            !this.cotizacion.poliza.tipoRenovacion ||
            !this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION
        ) {
            msg += 'Debe elegir el tipo de renovación  <br>';
        }

        if (
            !this.cotizacion.poliza.frecuenciaPago ||
            !this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA
        ) {
            msg += 'Debe elegir la frecuencia de pago  <br>';
        }
        else {
            var months = this.cantmeses(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA).toString();

            if (parseInt(this.cotizacion.poliza.nroCuotas.toString()) % parseInt(months) != 0) {
                msg += 'Debe elegir una frecuencia de pago adecuada para el número de cuotas  <br>';
            }

        }

        if (!this.cotizacion.poliza.fechaInicioPoliza) {
            msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
        }

        if (
            !this.cotizacion.poliza.tipoPlan ||
            !this.cotizacion.poliza.tipoPlan.ID_PLAN
        ) {
            msg += 'Debe elegir el tipo de plan  <br>';
        }

        if (
            !this.cotizacion.poliza.moneda ||
            !this.cotizacion.poliza.moneda.NCODIGINT
        ) {
            msg += 'Debe elegir una moneda  <br>';
        }
        if (
            !!this.cotizacion.endosatario &&
            this.cotizacion.endosatario.length == 0
        ) {
            msg += 'Debe elegir un endosatario  <br>';
        }
        /*
            if (!this.cotizacion.cotizador.calculado) {
              msg += 'Primero debe calcular   <br>';
            }
        */
        if (!this.cotizacion.poliza.capitalCredito ||
            this.cotizacion.poliza.capitalCredito == '0') {
            msg += 'Debe ingresar un monto de capital válido  <br>';
        }
        if (!this.cotizacion.poliza.nroCuotas ||
            this.cotizacion.poliza.nroCuotas == '0') {
            msg += 'Debe ingresar un número de cuotas válido  <br>';
        }
        else {
            if (parseInt(this.cotizacion.poliza.nroCuotas, 10) > 360) {
                msg += 'No puede tener mas de 360 cuotas  <br>';
            }
        }
        if (!this.cotizacion.poliza.actividad ||
            !this.cotizacion.poliza.actividad.Id
        ) {
            msg += 'Debe elegir la actividad a realizar  <br>';
        }


        return msg;
    }

    async actualizarCliente(requerid: boolean) {
        if (
            (this.cotizacion.contratante.flagEmail &&
                !!this.cotizacion.contratante.email) ||
            (this.cotizacion.contratante.flagContact &&
                !!(this.cotizacion.contratante.EListContactClient || []).length)
        ) {
            this.cotizacion.contratante.cliente360.EListAddresClient = null;
            this.cotizacion.contratante.cliente360.EListPhoneClient = null;
            this.cotizacion.contratante.cliente360.EListCIIUClient = null;
            this.clientInformationService
                .getCliente360(this.cotizacion.contratante.cliente360)
                .toPromise()
                .then(async (res) => {
                    if (Number(res.P_NCODE) === 0 || Number(res.P_NCODE) === 2) {
                        this.cotizacion.contratante.flagEmail = !this.cotizacion.contratante
                            .email
                            ? true
                            : false;
                        this.cotizacion.contratante.flagContact = !(
                            this.cotizacion.contratante.EListContactClient || []
                        ).length
                            ? true
                            : false;
                        this.cotizacion.detail = !this.cotizacion.contratante.flagContact
                            ? true
                            : false;
                        this.isLoading = false;
                        if (!requerid) {
                            // Validar retroactividad
                            /*const response: any = await this.ValidateRetroactivity();
                            if (response.P_NCODE == 4) {
                                this.cotizacion.derivaRetro = true;
                                await swal.fire('Información', response.P_SMESSAGE, 'error');
                                // return;
                            } else {*/
                            this.cotizacion.derivaRetro = false;
                            //}
                            this.validarMensajePolizaMatriz();
                        }
                    } else {
                        this.isLoading = false;
                        swal.fire('Información', res.P_SMESSAGE, 'error');
                        return;
                    }
                });
        } else {
            if (!requerid) {
                // Validar retroactividad
                /*
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                    this.cotizacion.derivaRetro = true;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    // return;
                } else {
                    */
                this.cotizacion.derivaRetro = false;
                //}
                this.validarMensajePolizaMatriz();
            }
        }
    }

    async ValidateRetroactivity(operacion: number = 1) {
        let response: any = {};

        const dataQuotation: any = {
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: this.cotizacion.poliza.producto.codigo,
            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            NumeroCotizacion: this.cotizacion.numeroCotizacion,
            P_DSTARTDATE: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaInicioPoliza
            ),
            P_DSTARTDATE_ASE:
                this.cotizacion.transac != 'EX'
                    ? CommonMethods.formatDate(
                        this.cotizacion.poliza.fechaInicioAseguradoMes
                    )
                    : CommonMethods.formatDate(this.cotizacion.poliza.fechaExclusion),
            TrxCode: this.cotizacion.transac,
            RetOP: operacion,
            FlagCambioFecha:
                this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                    this.cotizacion.poliza.fechaInicioPoliza.setHours(0, 0, 0, 0)
                    ? 1
                    : 0,
        };

        const myFormData: FormData = new FormData();
        myFormData.append('objeto', JSON.stringify(dataQuotation));
        await this.quotationService
            .ValidateRetroactivity(myFormData)
            .toPromise()
            .then((res) => {
                response = res;
            });

        return response;
    }

    validarMensajePolizaMatriz() {
        this.isLoading = false;
        //this.cotizaDPS = true;
        if (
            !!this.cotizacion.poliza.checkbox1.POL_MAT &&
            this.cotizacion.poliza.tipoPerfil.NIDPLAN != 6
        ) {
            swal
                .fire({
                    title: 'Información',
                    text: this.storageService.variable.var_confirmarPolizaMatriz,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.grabarCotizacion();
                    }
                });
        } else {
            swal
                .fire({
                    title: 'Información',
                    text: '¿Deseas generar la cotización?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Generar',
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        //this.cotizaDPS = true;

                        this.grabarCotizacion();
                    }
                });
        }
    }

    // funcion de crear cotizacion
    grabarCotizacion() {

        const objCotDes = this.obtenerDatosPreCotizacion();

        const myFormData = this.obtenerFormDataCotizacion();

        myFormData.append('objDes', JSON.stringify(objCotDes));

        this.isLoading = true;

        this.quotationService.insertQuotation(myFormData).subscribe(
            (res) => {
                this.cotizacion.numeroCotizacion = res.P_NID_COTIZACION;
                this.cotizacion.prepago = res;
                this.cotizacion.prepago.msjCotizacion =
                    'Se generó la cotización Nº ' +
                    res.P_NID_COTIZACION +
                    ', puede emitir directamente usando los siguientes métodos';
                this.cotizacion.prepago.msjOmitir =
                    'Se ha generado correctamente la cotización N° ' +
                    res.P_NID_COTIZACION +
                    ', puede consultarla y emitirla en cualquier momento.';
                if (res.P_COD_ERR === 0) {
                    this.isLoading = false;

                    if (
                        (res.P_SAPROBADO === 'S' &&
                            this.cotizacion.contratante.debtMark !== 1) ||
                        (res.P_SAPROBADO === 'V' &&
                            this.cotizacion.contratante.debtMark !== 1)
                    ) {
                        // if (!!this.cotizacion.contratante.email && !!(this.cotizacion.contratante.EListContactClient || []).length)
                        swal
                            .fire(
                                'Información',
                                'Se ha generado correctamente la cotización N° ' +
                                res.P_NID_COTIZACION +
                                ', se han enviado los siguientes pasos al correo del asegurado.',
                                'success'
                            )
                            .then((value) => {
                                this.router.navigate([
                                    '/extranet/desgravamen/consulta-cotizacion',
                                ]);
                            });
                    }
                    else {
                        swal
                            .fire(
                                'Información',
                                'Se ha generado correctamente la cotización N° ' +
                                res.P_NID_COTIZACION +
                                ', se han enviado los siguientes pasos al correo del asegurado.',
                                'success'
                            )
                            .then((value) => {
                                this.router.navigate([
                                    '/extranet/desgravamen/consulta-cotizacion',
                                ]);
                            });
                    }
                } else {
                    this.isLoading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            (error) => {
                this.isLoading = false;
            }
        );
    }

    obtenerDatosPreCotizacion() {

        this.coberturas = [];
        this.asistencias = [];
        this.beneficios = [];
        const params = {
            flagCalcular:
                this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
                    ? 1
                    : 0,
            codUsuario: this.storageService.userId,
            desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL,
            contratante: this.cotizacion.contratante.id,
            codRamo: this.CONSTANTS.RAMO,
            codProducto: this.cotizacion.poliza.producto.COD_PRODUCT,
            codTipoPerfil: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
            codProceso: '',
            PolizaMatriz: 0,
            type_mov: this.cotizacion.tipoTransaccion,
            nroCotizacion: this.cotizacion.numeroCotizacion || 0,
            MontoPlanilla: 0,
            CantidadTrabajadores: 1,
            flagSubirTrama: this.cotizacion.trama.validado,
            premium: 0,
            datosContratante: {
                codContratante: this.cotizacion.contratante.id, // sclient
                desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
                codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
                documento: this.cotizacion.contratante.numDocumento,
                nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
                apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
                apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
                fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
                nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY,
                email: this.cotizacion.contratante.email,
                sexo: this.cotizacion.contratante.sexo,
                desTelefono: this.cotizacion.contratante.cliente360?.EListPhoneClient?.[0]?.P_DESTIPOTLF || '',
                telefono: this.cotizacion.contratante.cliente360?.EListPhoneClient?.[0]?.P_SPHONE || '',
            },
            datosPoliza: {
                segmentoId: this.cotizacion.poliza.tipoPlan.ID_PLAN,
                tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
                numDocumento: this.cotizacion.contratante.numDocumento,
                codTipoNegocio: this.cotizacion.poliza.tipoPoliza.id || 1,
                codTipoProducto: this.cotizacion.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
                codTipoPlan: this.cotizacion.poliza.tipoPlan.ID_PLAN,//this.CONSTANTS.PLANMAESTRO,
                codTipoRenovacion: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                codTipoFrecuenciaPago: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                InicioVigPoliza: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaInicioPoliza
                ),
                FinVigPoliza: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
                InicioVigAsegurado: CommonMethods.formatDate(
                    //this.cotizacion.poliza.fechaInicioPolizaMes
                    this.cotizacion.poliza.fechaInicioPoliza
                ),
                FinVigAsegurado: CommonMethods.formatDate(
                    //this.cotizacion.poliza.fechaFinPolizaMes
                    this.cotizacion.poliza.fechaFinPoliza
                ),
                CodActividadRealizar: "1",
                CodCiiu: "1",
                codTipoFacturacion: this.cotizacion.poliza.tipoFacturacion.id,
                codMon: this.cotizacion.poliza.moneda.NCODIGINT,
                desTipoPlan: this.cotizacion.poliza.tipoPlan.TIPO_PLAN,
                typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
                type_employee: '',
                branch: this.CONSTANTS.RAMO,
                nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
                trxCode: this.cotizacion.transac,
                commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
                //nuevos valores tarifario
                temporalidad: 0,
                codAlcance: 0,
                tipoUbigeo: 0,
                codUbigeo: 14,
                codClienteEndosatario: this.cotizacion.endosatario[0].cod_proveedor,
                nroCredito: this.cotizacion.poliza.nroCredito || 0,
                nroCuotas: this.cotizacion.poliza.nroCuotas,
                polizaMatriz: 0,
                fechaOtorgamiento: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaOtorgamiento
                ),
                capitalCredito: this.cotizacion.poliza.capitalCredito = this.cotizacion.poliza.capitalCredito.replace(/,/g, ''),
                // nuevo tipo de renovacion
                tipoRenovacionPoliza: "3",
                renewalType: this.cotizacion.poliza.renovacion.codigo,
                creditType: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
                //occupation: this.cotizacion.poliza.tipoActividad.Id,
                renewalFrequency: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                //economicActivity: this.cotizacion.poliza.tipoActividad.Id,
                activity: this.cotizacion.poliza.actividad.Id,
            },
            datosDPS: []
        };
        return params;
    }

    obtenerFormDataCotizacion() {
        const params = this.obtenerParametrosCotizacion();

        const myFormData: FormData = new FormData();

        if (
            !!this.cotizacion.trama.excelSubir &&
            this.cotizacion.trama.excelSubir.length != 0
        ) {
            this.cotizacion.cotizador.files.push(this.cotizacion.trama.excelSubir[0]);
        }
        (this.cotizacion.cotizador.files || []).forEach((file) => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(params));

        return myFormData;
    }

    obtenerParametrosCotizacion() {
        let primaNeta, primaBruta, igv;
        let campoFrecuencia = '';
        switch (String(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA)) {
            case '6':
                campoFrecuencia = 'NPREMIUMN_ESP';
                break;
            case '5':
                campoFrecuencia = 'NPREMIUMN_MEN';
                break;
            case '4':
                campoFrecuencia = 'NPREMIUMN_BIM';
                break;
            case '3':
                campoFrecuencia = 'NPREMIUMN_TRI';
                break;
            case '2':
                campoFrecuencia = 'NPREMIUMN_SEM';
                break;
            case '1':
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
            default:
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
        }
        if (this.esEvaluacion) {
            primaNeta =
                this.cotizacion.cotizador.amountPremiumListAnu[1].NPREMIUMN_ANU;
            primaBruta =
                this.cotizacion.cotizador.amountPremiumListAnu[3].NPREMIUMN_ANU;
            igv = this.cotizacion.cotizador.amountPremiumListAnu[2].NPREMIUMN_ANU;
        } else {
            if (this.cotizacion.trama.amountPremiumList != undefined) {
                primaNeta = this.cotizacion.trama.amountPremiumList[1][campoFrecuencia] || 0;
                primaBruta = this.cotizacion.trama.amountPremiumList[3][campoFrecuencia] || 0;
                igv = this.cotizacion.trama.amountPremiumList[2][campoFrecuencia] || 0;
            } else {
                primaNeta = 0;
                primaBruta = 0;
                igv = 0;
            }

        }

        const params = {
            NumeroPoliza: !!this.cotizacion.poliza.nroPoliza
                ? parseInt(this.cotizacion.poliza.nroPoliza)
                : 0,
            NumeroCotizacion: this.cotizacion.numeroCotizacion,
            P_NID_PROC: this.cotizacion.trama.NIDPROC,
            P_SCLIENT: this.cotizacion.contratante.id,
            P_SCLIENT_PROVIDER: this.cotizacion.endosatario[0].cod_proveedor,
            P_NCURRENCY: this.cotizacion.poliza.moneda.NCODIGINT,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_SAPLICACION: 'PD',
            P_DFEC_OTORGAMIENTO: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaOtorgamiento
            ),
            P_DSTARTDATE: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaInicioPoliza
            ),
            P_DEXPIRDAT: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaFinPoliza
            ),
            P_DSTARTDATE_ASE: CommonMethods.formatDate(
                //this.cotizacion.poliza.fechaInicioAseguradoMes
                this.cotizacion.poliza.fechaInicioPoliza
            ),
            P_DEXPIRDAT_ASE: CommonMethods.formatDate(
                //this.cotizacion.poliza.fechaFinAseguradoMes
                this.cotizacion.poliza.fechaFinPoliza
            ),
            P_NIDCLIENTLOCATION: 1,
            P_SCOMMENT: this.esEvaluacion
                ? this.cotizacion.comentario
                : this.cotizacion.cotizador.comentario,
            P_SRUTA: '',
            P_NUSERCODE: this.storageService.userId,
            P_NACT_MINA: 0,
            P_NTIP_RENOV: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_SCOD_ACTIVITY_TEC: 1,
            P_SCOD_CIUU: 1,
            P_NTIP_NCOMISSION: 0,
            P_NPRODUCT: this.cotizacion.poliza.producto.codigo,
            P_NEPS: this.storageService.eps.STYPE,
            P_QUOTATIONNUMBER_EPS: "",
            P_NPENDIENTE: '0', // FALTA,
            P_NCOMISION_SAL_PR: 0, // FALTA,
            P_NNUM_CREDIT: this.cotizacion.poliza.nroCredito || 0,
            CodigoProceso: this.data_panel.trama.NID_PROC,
            P_DERIVA_RETRO: this.cotizacion.derivaRetro == true ? 1 : 0,
            retOP: 2,
            FlagCambioFecha:
                this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                    this.cotizacion.poliza.fechaInicioPoliza.setHours(0, 0, 0, 0)
                    ? 1
                    : 0,
            TrxCode: this.cotizacion.transac,
            planId: this.cotizacion.poliza.tipoPlan.ID_PLAN,// this.CONSTANTS.PLANMAESTRO, //
            P_NMODULEC_TARIFARIO: this.cotizacion.poliza.tipoPlan.ID_PLAN,
            P_SDESCRIPT_TARIFARIO: this.cotizacion.poliza.tipoPlan.TIPO_PLAN,
            P_NPOLIZA_MATRIZ: 0,
            P_NTRABAJO_RIESGO: 0,
            P_NFACTURA_ANTICIPADA: 1,
            // P_NPOLIZA_INDIVIDUAL: this.cotizacion.poliza.checkbox2.POL_IND ? 1 : 0,
            // P_NCOBERTURA_ADICIONAL: this.cotizacion.poliza.checkbox2.COB_ADI ? 1 : 0,
            P_NTYPE_PROFILE: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
            P_NTYPE_PRODUCT: this.cotizacion.poliza.tipoPoliza.id,
            P_NTYPE_MODALITY: 0,
            P_NTIPO_FACTURACION: this.cotizacion.poliza.tipoFacturacion.id,
            P_ESTADO: 2,
            PolizaEditAsegurados: this.cotizacion.PolizaEditAsegurados, // 1 si se valido trama
            P_STRAN: this.cotizacion.transac,
            IsDeclare: this.cotizacion.tipoTransaccion == 4 ? true : false,
            // nuevos tarifario
            P_NDERIVA_TECNICA: 0,
            P_NSCOPE: 1,
            P_NTEMPORALITY: 0,
            P_NTYPE_LOCATION: 0,
            P_NLOCATION: 14,
            //Datos Capital_Cuotas -- Rob Par
            P_NCAPITAL: this.cotizacion.poliza.capitalCredito = this.cotizacion.poliza.capitalCredito.replace(/,/g, ''),
            P_NNUM_CUOTA: this.cotizacion.poliza.nroCuotas,
            // nuevo tipo de renovacion
            P_STIMEREN: "3",
            //P_OCCUPATION: this.cotizacion.poliza.tipoActividad.Id,
            P_ACTIVITY: this.cotizacion.poliza.actividad.Id,
            QuotationDet: [
                {
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NPRODUCT: this.cotizacion.poliza.producto.codigo,
                    P_NTOTAL_TRABAJADORES: 1,
                    P_NMONTO_PLANILLA: this.cotizacion.trama.MONT_PLANILLA,
                    P_NTASA_CALCULADA: this.cotizacion.trama.TASA,
                    P_NTASA_PROP: 0, // FALTA
                    P_NPREMIUM_MIN: this.cotizacion.trama.PRIMA,
                    P_NPREMIUM_MIN_PR: this.cotizacion.poliza.primaPropuesta,
                    P_NPREMIUM_END: '0',
                    P_NRATE: 0,
                    P_NDISCOUNT: 0,
                    P_NACTIVITYVARIATION: 0,
                    P_FLAG: '0',
                    //Robert Pariasca - RI

                    P_NAMO_AFEC: primaNeta,
                    P_NIVA: igv,
                    P_NAMOUNT: primaBruta,
                    P_NDE: 0,

                    //Robert Pariasca - RI
                },
            ],
            QuotationCom: [],
            QuotationCli: []
        };
        if (
            this.cotizacion.tipoTransaccion == 8 &&
            this.cotizacion.brokersEndoso.length !== 0
        ) {
            this.cotizacion.brokers = this.cotizacion.brokersEndoso;
        }
        (this.cotizacion.brokers || []).forEach((broker) => {
            params.QuotationCom.push({
                P_NIDTYPECHANNEL: parseInt(broker.NTYPECHANNEL),
                P_NINTERMED: parseInt(broker.COD_CANAL),
                P_SCLIENT_COMER: broker.SCLIENT,
                P_NCOMISION_SAL: broker.P_COM_SALUD === '' ? 0 : broker.P_COM_SALUD,
                P_NCOMISION_SAL_PR:
                    broker.P_COM_SALUD_PRO === '' ? 0 : broker.P_COM_SALUD_PRO,
                P_NCOMISION_PEN: 0,
                P_NCOMISION_PEN_PR: 0,
                P_NPRINCIPAL: broker.P_NPRINCIPAL,
                P_SEDIT: broker.P_SEDIT,
            });
        });
        params.QuotationCli.push({
            idRamo: this.CONSTANTS.RAMO,
            idProducto: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
            externalId: this.cotizacion.trama.NIDPROC,
            idTipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
            numeroDocumento: this.cotizacion.contratante.numDocumento,
            nombre: this.cotizacion.contratante.nombres,
            apellidoPaterno: this.cotizacion.contratante.apellidoPaterno,
            apellidoMaterno: this.cotizacion.contratante.apellidoMaterno,
            correo: this.cotizacion.contratante.email,
            fechaNacimiento: this.cotizacion.contratante.fnacimiento,
            idUsuario: this.storageService.userId,
        });
        //console.log('params', this.cotizacion);
        return params;
    }

    // funcion que evalua el tipo de emision
    async emitirPoliza(params, pago?, cotizacion?) {
        this.SAPROBADO_DEFECTO = this.cotizacion.prepago.P_SAPROBADO;
        if (
            (this.cotizacion.prepago &&
                this.cotizacion.prepago.P_SAPROBADO === 'V') ||
            this.modoVista == 'Evaluar'
        ) {
            this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();
        }

        if (this.cotizacion.prepago) {
            this.cotizacion.contratante.emisionDirecta = this.SAPROBADO_DEFECTO;//this.cotizacion.prepago.P_SAPROBADO;
            //this.cotizacion.contratante.emisionDirecta =this.CONSTANTS.EMISIONDIRECTA;
        } else {
            if (this.modoVista == 'Evaluar') {
                this.cotizacion.contratante.emisionDirecta = 'V';
            } else {
                this.cotizacion.contratante.emisionDirecta = 'N';
            }
        }

        if (this.modoVista == '' || this.modoVista == 'Evaluar') {
            //AQUI INSERTAR CORREO
            /*
                  const fecha = new Date();

                  this.filter.User = JSON.parse(localStorage.getItem('currentUser'))['id'];
                  this.filter.Nbranch = this.CONSTANTS.RAMO;
                  this.filter.StartDate = fecha.getDate();
                  this.filter.EndDate = fecha.getDate();
                  this.filter.QuotationNumber = cotizacion.numeroCotizacion;
                  this.filter.TypeSearch = "1";

                  this.transactService.GetTransactList(this.filter).subscribe(
                    res => {
                      this.foundResults = res.GenericResponse;
                        this.listToShow = this.foundResults.length;

                    },
                    err => {
                      this.listToShow = [];
                      swal.fire('InformaciÃ³n', "Error al buscar tramite para correo", 'error');

                    }
                  );

               */

            let dataQuotation: any = {};
            const data: FormData = new FormData(); // Para los archivos EH

            dataQuotation.P_NBRANCH = this.CONSTANTS.RAMO;
            dataQuotation.P_NID_TRAMITE = 0; //LLAMAR TRAMITE EN EL BACK
            dataQuotation.P_NID_COTIZACION = cotizacion.numeroCotizacion;
            dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            dataQuotation.P_NSTATUS_TRA = "5";
            dataQuotation.P_SCOMMENT = "Envio Correo";

            data.append('objeto', JSON.stringify(dataQuotation));

            // BROKER DE LA POLIZA
            const val_data = {
                SCLIENT: this.cotizacion.brokers[0].SCLIENT
            }
            this.policyemit.valBrokerVCF(val_data).subscribe((res) => {

                if (res.COD_ERROR == 1) {

                    this.transactService.InsertDerivarTransact(data).subscribe(
                        res => {
                            if (res.P_COD_ERR == 0) {

                                this.quotationService.changeStatusVL(params).subscribe(
                                    (res) => {
                                        this.isLoading = false;
                                        if (Number(res.StatusCode) === 0) {
                                            swal.fire(
                                                'Información',
                                                'La operación se realizó correctamente.',
                                                'success'
                                            );

                                            this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
                                        } else {
                                            swal.fire(
                                                'Información',
                                                CommonMethods.listToString(res.ErrorMessageList),
                                                'error'
                                            );
                                        }
                                    },
                                    (err) => {
                                        swal.fire(
                                            'Información',
                                            'Hubo un problema al comunicarnos con el servidor.',
                                            'error'
                                        );
                                        this.isLoading = false;
                                    }
                                );

                            } else {
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                        },
                        err => {
                            swal.fire('Información', 'Hubo un error con el servidor', 'error');
                        }
                    );

                }
                else if (res.COD_ERROR == 0) {


                    let campoFrecuencia = '';
                    let primaNeta, primaBruta, igv;
                    let myFormData: FormData = new FormData();

                    switch (String(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA)) {
                        case '5':
                            campoFrecuencia = 'NPREMIUMN_MEN';
                            break;
                        case '4':
                            campoFrecuencia = 'NPREMIUMN_BIM';
                            break;
                        case '3':
                            campoFrecuencia = 'NPREMIUMN_TRI';
                            break;
                        case '2':
                            campoFrecuencia = 'NPREMIUMN_SEM';
                            break;
                        case '1':
                            campoFrecuencia = 'NPREMIUMN_ANU';
                            break;
                        default:
                            campoFrecuencia = 'NPREMIUMN_ANU';
                            break;
                    }

                    // CUANDO PRESIONA BOTON CALCULAR
                    // if (this.esEvaluacion) {
                    primaNeta = this.cotizacion.trama.PRIMA;
                    primaBruta = this.cotizacion.trama.PRIMA_TOTAL;

                    // } else {
                    //     primaNeta =
                    //         this.cotizacion.trama.amountPremiumList[1][campoFrecuencia];
                    //     primaBruta =
                    //         this.cotizacion.trama.amountPremiumList[3][campoFrecuencia];
                    //     igv = this.cotizacion.trama.amountPremiumList[2][campoFrecuencia];
                    // }
                    // CUANDO NO PRESIONA CALCUALR Y RECARGA
                    // if (this.esEvaluacion) {
                    //     primaNeta =
                    //         this.cotizacion.cotizador.amountPremiumListAnu[1].NPREMIUMN_ANU;
                    //     primaBruta =
                    //         this.cotizacion.cotizador.amountPremiumListAnu[3].NPREMIUMN_ANU;
                    //     igv = this.cotizacion.cotizador.amountPremiumListAnu[2].NPREMIUMN_ANU;
                    // } else {
                    //     primaNeta =
                    //         this.cotizacion.cotizador.amountPremiumListAnu[1].NPREMIUMN_ANU;
                    //     primaBruta =
                    //         this.cotizacion.cotizador.amountPremiumListAnu[3].NPREMIUMN_ANU;
                    //     igv = this.cotizacion.cotizador.amountPremiumListAnu[2].NPREMIUMN_ANU;

                    // }


                    const data_policy = [{
                        P_NID_COTIZACION: this.cotizacion.numeroCotizacion,
                        P_NID_PROC: this.cotizacion.nidPolicy,
                        P_NBRANCH: this.cotizacion.actualizarCotizacion.Nbranch,
                        P_NPRODUCT: this.cotizacion.actualizarCotizacion.Product,
                        P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                        P_DSTARTDATE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
                        P_DEXPIRDAT: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
                        P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                        P_FACT_MES_VENCIDO: 0,
                        P_SFLAG_FAC_ANT: 1,
                        P_NPREM_NETA: primaNeta,
                        P_SRUTA: '',
                        P_IGV: igv,
                        P_NPREM_BRU: primaBruta,
                        P_NUSERCODE: this.storageService.userId,
                        P_SCOMMENT: '',
                        P_NAMO_AFEC: this.cotizacion.trama.PRIMA, //CAMBIAR POR EL VALOR TRAIDO DEL SERVICIO
                        P_NIVA: igv,
                        P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL, //CAMBIAR POR EL VALOR TRAIDO DEL SERVICIO
                        P_NDE: 0,
                        P_DSTARTDATE_ASE: CommonMethods.formatDate(this.cotizacion.poliza.fechaMinInicioAsegurado),
                        P_DEXPIRDAT_ASE: ""

                    }]


                    this.policyemit.getExpirAseg(this.numeroCotizacion).toPromise().then((res) => {
                        data_policy[0].P_DEXPIRDAT_ASE = res.EXPIRACION_ASEGURADOS;
                    })

                    this.policyemit.getPrimasProrrat(this.cotizacion.numeroCotizacion).toPromise().then((res) => {
                        data_policy[0].P_NAMO_AFEC = res.NPREMIUMN;
                        data_policy[0].P_NAMOUNT = res.NPREMIUM;
                        data_policy[0].P_IGV = res.NIGV;
                        data_policy[0].P_NIVA = res.NIGV;

                        // console.log(data_policy);
                        myFormData.append('objeto', JSON.stringify(data_policy));


                        this.policyemit.savePolicyEmit(myFormData).toPromise().then((res) => {
                            this.isLoading = false;

                            if (res.P_COD_ERR == 0) {
                                swal.fire('Información', `Se ha generado exitosamente la póliza N° ${res.P_NPOLICY}`, 'success').then((result) => {
                                    this.router.navigate(['/extranet/desgravamen/consulta-poliza']);
                                })
                            } else {
                                swal.fire('Información', res.P_MESSAGE, 'error').then((result) => {
                                    this.router.navigate(['/extranet/desgravamen/consulta-poliza']);
                                })

                            }

                        })

                    })


                }
            })
            /*
            this.isLoading = true;
            this.modal.pagos = true;
                        */
        } else {
            if (this.modoVista !== 'Evaluar') {
                let nid;
                if (
                    this.cotizacion.prepago &&
                    this.cotizacion.prepago.P_NID_COTIZACION
                ) {
                    nid = this.cotizacion.prepago.P_NID_COTIZACION;
                } else {
                    nid = this.cotizacion.numeroCotizacion;
                }

                this.emitPolicy(nid);
            }
        }
    }

    // funcion para emitir la poliza
    emitPolicy(quotationNumber): any {
        let campoFrecuencia = '';

        switch (String(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA)) {
            case '5':
                campoFrecuencia = 'NPREMIUMN_MEN';
                break;
            case '4':
                campoFrecuencia = 'NPREMIUMN_BIM';
                break;
            case '3':
                campoFrecuencia = 'NPREMIUMN_TRI';
                break;
            case '2':
                campoFrecuencia = 'NPREMIUMN_SEM';
                break;
            case '1':
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
            default:
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
        }

        let primaNeta, primaBruta, igv;
        if (this.esEvaluacion) {
            primaNeta =
                this.cotizacion.cotizador.amountPremiumListAnu[1].NPREMIUMN_ANU;
            primaBruta =
                this.cotizacion.cotizador.amountPremiumListAnu[3].NPREMIUMN_ANU;
            igv = this.cotizacion.cotizador.amountPremiumListAnu[2].NPREMIUMN_ANU;
        } else {
            primaNeta = this.cotizacion.trama.amountPremiumList[1][campoFrecuencia];
            primaBruta = this.cotizacion.trama.amountPremiumList[3][campoFrecuencia];
            igv = this.cotizacion.trama.amountPremiumList[2][campoFrecuencia];
        }

        const params = [
            {
                P_NID_COTIZACION: quotationNumber,
                P_NID_PROC: this.cotizacion.trama.NIDPROC,
                P_NPRODUCT: this.cotizacion.poliza.producto.codigo,
                P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                P_NBRANCH: this.CONSTANTS.RAMO,
                P_DSTARTDATE: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaInicioPoliza
                ),
                P_DEXPIRDAT: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaFinPoliza
                ),
                P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                P_FACT_MES_VENCIDO: 0,
                P_SFLAG_FAC_ANT: 1,
                P_NPREM_NETA: primaNeta,
                SRUTA: '',
                P_IGV: igv,
                P_NPREM_BRU: primaBruta,
                P_NUSERCODE: this.storageService.userId,
                P_SCOMMENT: this.cotizacion.comentario,
                P_NIDPAYMENT: '',
                P_NPOLIZA_MATRIZ: 0,
                P_NAMO_AFEC: primaNeta,
                P_NIVA: igv,
                P_NAMOUNT: primaBruta,
            },
        ];

        const myFormData: FormData = new FormData();
        if (
            !!this.cotizacion.trama.excelSubir &&
            this.cotizacion.trama.excelSubir.length != 0
        ) {
            this.cotizacion.cotizador.files.push(this.cotizacion.trama.excelSubir[0]);
        }
        (this.cotizacion.cotizador.files || []).forEach((file) => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(params));

        this.isLoading = true;

        this.policyemit.savePolicyEmit(myFormData).subscribe(
            (res) => {
                if (res.P_COD_ERR == 0) {
                    const policyId = Number(res.P_POL_AP);
                    const constancia = Number(res.P_NCONSTANCIA);

                    let msg = '';

                    if (this.cotizacion.poliza.checkbox1.POL_MAT) {
                        msg =
                            '. Deberá adjuntar la trama de asegurados en un proceso posterior';
                    }
                    if (policyId > 0) {
                        swal
                            .fire({
                                title: 'Información',
                                text:
                                    'Se ha generado correctamente la póliza de desgravamen N° ' +
                                    policyId +
                                    msg,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                            .then((result) => {
                                if (result.value) {
                                    this.router.navigate([
                                        '/extranet/desgravamen/consulta-poliza',
                                    ]);
                                }
                            });
                    }
                } else {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    });
                }

                this.isLoading = false;
            },
            (err) => {
                swal.fire(
                    'Información',
                    'Hubo un problema al comunicarnos con el servidor.',
                    'error'
                );
                this.isLoading = false;
            }
        );
    }

    obtenerDataEvaluacion() {
        this.cotizacion.prepago = {
            P_NID_COTIZACION: this.cotizacion.numeroCotizacion
        }
        const params = {
            QuotationNumber: !this.esEvaluacion
                ? this.cotizacion.prepago.P_NID_COTIZACION
                : this.cotizacion.numeroCotizacion,
            Status: (this.cotizacion.estado || {}).codigo || 2,
            Reason: (this.cotizacion.motivo || {}).codigo || '',
            Comment:
                this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.RENOVAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.INCLUIR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR
                    ? this.cotizacion.comentario
                    : '',
            User: this.storageService.userId,
            Product: this.cotizacion.poliza.producto.codigo,
            Nbranch: this.CONSTANTS.RAMO,
            path: '',
            Gloss: '', // this.cotizacion.motivo.codigo,
            GlossComment: '', // this.cotizacion.comentario,
            saludAuthorizedRateList: [],
            pensionAuthorizedRateList: [],
            BrokerList: [],
            Flag:
                this.modoVista == 'Emitir' ||
                    this.modoVista == 'EmitirR' ||
                    this.modoVista == 'Renovar' ||
                    this.modoVista == 'Incluir'
                    ? 1
                    : 0, // this.cotizacion.estado.codigo === this.CONSTANTS.ESTADO.NO_PROCEDE ? 1 : 0,
        };

        if (this.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR) {
            this.cotizacion.brokers.forEach((item) => {
                params.BrokerList.push({
                    Id: item.COD_CANAL,
                    ProductList: [
                        {
                            Product: this.cotizacion.poliza.producto.codigo,
                            AuthorizedCommission:
                                Number(item.P_COM_SALUD_PRO) > 0
                                    ? item.P_COM_SALUD_PRO
                                    : item.P_COM_SALUD,
                        },
                    ],
                });
            });
        }

        return params;
    }

    async formaPagoElegido() {
        if (this.modoVista === 'Evaluar' || this.modoVista === 'RenovarPoliza') {
            this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();
        }
        if (this.cotizacion.poliza.pagoElegido === 'efectivo') {
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        }

        if (this.cotizacion.poliza.pagoElegido === 'voucher') {
            if (!!this.cotizacion.file) {
                if (!!this.cotizacion.actualizarCotizacion) {
                    const myFormData: FormData = new FormData();

                    (this.cotizacion.files || []).forEach(function (file) {
                        myFormData.append(file.name, file, file.name);
                    });
                    if (!!this.cotizacion.file) {
                        myFormData.append(
                            this.cotizacion.file.name,
                            this.cotizacion.file,
                            this.cotizacion.file.name
                        );
                    }
                    myFormData.append(
                        'statusChangeData',
                        JSON.stringify(this.cotizacion.actualizarCotizacion)
                    );
                    swal
                        .fire({
                            title: 'Información',
                            text: '¿Deseas adjuntar el voucher?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Adjuntar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar',
                        })
                        .then((result) => {
                            if (result.value) {
                                this.actualizarEstado(myFormData);
                            } else {
                                this.isLoading = false;
                                this.modal.pagos = true;
                            }
                        });
                }
            } else {
                this.isLoading = false;
                this.modal.pagos = true;
                swal.fire(
                    'Información',
                    'Debes adjuntar voucher para continuar',
                    'error'
                );
            }
        }
        if (this.cotizacion.poliza.pagoElegido == 'omitir') {
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {

                if (!!this.cotizacion.prepago.msjOmitir) {
                    swal
                        .fire('Información', this.cotizacion.prepago.msjOmitir, 'success')
                        .then((value) => {
                            this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
                        });
                } else {
                    swal
                        .fire('Información', 'No olvide realizar el pago en otro momento', 'info')
                        .then((value) => {
                            this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
                        });
                }

            } else {
                if (this.cotizacion.estadoMov == 'V') {
                    swal
                        .fire('Información', this.cotizacion.mensajeMov, 'success')
                        .then((value) => {
                            this.router.navigate(['/extranet/desgravamen/consulta-poliza']);
                        });
                } else {
                    let msjTrx =
                        this.cotizacion.transac == 'IN'
                            ? 'la inclusión'
                            : this.cotizacion.transac == 'EN'
                                ? 'el endoso'
                                : this.cotizacion.transac == 'DE'
                                    ? 'la declaración'
                                    : 'la renovación';
                    swal
                        .fire(
                            'Información',
                            'Selecciona una de las opciones de pago para ' +
                            msjTrx +
                            ', de la póliza N° ' +
                            this.cotizacion.poliza.nroPoliza,
                            'success'
                        )
                        .then((value) => {
                            this.isLoading = false;
                            this.modal.pagos = true;
                        });
                }
            }
        }

        if (this.cotizacion.poliza.pagoElegido === 'directo') {
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {
                this.emitPolicy(this.cotizacion.prepago.P_NID_COTIZACION);
            } else {
                this.crearJob();
            }
        }
    }

    objetoJob(codproceso?: string) {
        const params = {
            P_NPRODUCTO: this.cotizacion.poliza.producto.codigo,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NID_COTIZACION: this.cotizacion.numeroCotizacion,
            P_DEFFECDATE:
                this.cotizacion.tipoTransaccion != 3
                    ? CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza)
                    : CommonMethods.formatDate(this.cotizacion.poliza.fechaExclusion),
            P_DEXPIRDAT: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaFinPoliza
            ),
            P_NUSERCODE: this.storageService.userId,
            P_NTYPE_TRANSAC: this.cotizacion.tipoTransaccion,
            P_NID_PROC: !!codproceso ? codproceso : this.cotizacion.trama.NIDPROC,
            P_FACT_MES_VENCIDO: 0,
            P_SFLAG_FAC_ANT: 1,
            P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_NMOV_ANUL: 0,
            P_NNULLCODE: !!this.cotizacion.motivoAnulacion
                ? this.cotizacion.motivoAnulacion.COD_ANULACION
                : 0,
            P_SCOMMENT:
                this.cotizacion.trxPendiente || !this.esEvaluacion
                    ? this.cotizacion.comentario
                    : '',
            P_SRUTA: '',
            P_NID_PENSION: '',
            P_NIDPAYMENT: '',
            P_STIMEREN: ''
        };

        return params;
    }

    crearJob(codproceso?: string) {
        const myFormData: FormData = new FormData();

        if (
            !!this.cotizacion.trama.excelSubir &&
            this.cotizacion.trama.excelSubir.length != 0
        ) {
            this.cotizacion.files.push(this.cotizacion.trama.excelSubir[0]);
        }
        (this.cotizacion.files || []).forEach(function (file) {
            myFormData.append('adjuntos', file, file.name);
        });

        myFormData.append(
            'transaccionProtecta',
            JSON.stringify(this.objetoJob(codproceso))
        );

        this.isLoading = true;

        this.policyemit.transactionPolicy(myFormData).subscribe(
            (res) => {
                if (res.P_COD_ERR == 0) {
                    swal.fire(
                        'Información',
                        'Se ha realizado el movimiento para la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        ' de forma satisfactoria.',
                        'success'
                    );
                    this.clickCancelar();
                } else {
                    swal.fire('Información', res.P_MESSAGE || res.P_MESSAGE, 'error');
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }

    clickCancelar() {
        if (
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION
        ) {
            this.router.navigate(['/extranet/desgravamen/consulta-poliza']);
        } else {
            this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
        }
    }
    actualizarEstado(params) {
        this.quotationService.changeStatusVL(params).subscribe(
            (res) => {
                this.isLoading = false;
                if (Number(res.StatusCode) === 0) {
                    swal.fire(
                        'Información',
                        'La operación se realizó correctamente.',
                        'success'
                    );
                    this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
                } else {
                    swal.fire(
                        'Información',
                        CommonMethods.listToString(res.ErrorMessageList),
                        'error'
                    );
                }
            },
            (err) => {
                swal.fire(
                    'Información',
                    'Hubo un problema al comunicarnos con el servidor.',
                    'error'
                );
                this.isLoading = false;
            }
        );
    }

    // funcion emitir operaciones
    // funcion btn Emitir             Preguntar a Jaime
    async clickEmitirEvaluacion() {
        let message = '';
        /*
              if (!this.cotizacion.estado.codigo) {
                message += 'Debe seleccionar un estado1 <br />';
              } */

        if (
            (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR ||
                this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EMITIR) &&
            this.CONSTANTS.ESTADO.NO_PROCEDE !== this.cotizacion.estado.codigo
        ) {
            if (this.cotizacion.contratante.flagEmail) {
                if (!this.cotizacion.contratante.email) {
                    message +=
                        'Debe ingresar un correo electrónico para la factura. <br />';
                } else {
                    if (
                        /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                            this.cotizacion.contratante.email
                        ) === false
                    ) {
                        message += 'El correo electrónico es inválido. <br />';
                    }
                }
            }

            if (
                this.cotizacion.contratante.flagContact &&
                !(this.cotizacion.contratante.EListContactClient || []).length
            ) {
                message += this.storageService.variable.var_contactZero + '<br />';
            }
        }

        if (message !== '') {
            swal.fire('Información', message, 'error');
            return;
        } else {


            this.flagNroCredito = true;
            this.validarClientePoliza(true)

            if (!this.flagNroCredito) {
                return;
            }

            this.validarCliente(true);
            this.isLoading = false;

            // Validar Retroactividad
            /*
            const response: any = await this.ValidateRetroactivity();
            if (response.P_NCODE == 4) {
                this.cotizacion.derivaRetro = true;
                await swal.fire('Información', response.P_SMESSAGE, 'error');
                // return;
            } else {
                */
            this.cotizacion.derivaRetro = false;
            //}

            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Desea realizar la emisión de la cotización N° ' +
                        this.cotizacion.numeroCotizacion +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    allowOutsideClick: false,
                    cancelButtonText: 'No',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();

                        if (
                            (this.cotizacion.poliza.checkbox1.POL_MAT &&
                                this.cotizacion.poliza.tipoPerfil.NIDPLAN != 6) ||
                            !!this.cotizacion.checkPago == false
                        ) {
                            // Poliza matriz
                            this.emitPolicy(this.cotizacion.numeroCotizacion);
                        } else {
                            // Evaluación
                            // if ((!!this.cotizacion.checkPago == false ||
                            //   !this.cotizacion.cotizador.checkbox.PAGO_ADEL) &&
                            //   this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
                            if (
                                !this.cotizacion.cotizador.checkbox.PAGO_ADEL &&
                                this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR
                            ) {
                                this.emitPolicy(this.cotizacion.numeroCotizacion);
                            } else {
                                // // Validar Retroactividad
                                // const response: any = await this.ValidateRetroactivity(2);
                                // if (response.P_NCODE == 4) {
                                //   this.cotizacion.derivaRetro = true;
                                //   await swal.fire('Información', response.P_SMESSAGE, 'error');
                                //   return;
                                // }

                                this.isLoading = true;
                                this.modal.pagos = true;
                                if (this.modoVista == 'Evaluar') {
                                    this.cotizacion.contratante.emisionDirecta = 'V';
                                } else {
                                    this.cotizacion.contratante.emisionDirecta = 'N';
                                }
                            }
                        }
                    }
                });
        }
    }
    // click continuar
    async clickEnviarEvaluacion() {
        let message = '';

        if (!this.cotizacion.estado.codigo) {
            message += 'Debe seleccionar un estado <br />';
        }

        if (this.cotizacion.primaflag == true) {
            message += 'Debe calcular antes de continuar <br />';
        } else {
            if (parseInt(this.cotizacion.trama.PRIMA) == 0) {
                message += 'No hay una prima asignada en el tarifario <br />';
            }
        }

        if (this.CONSTANTS.RAMO != 71) {
            if (!this.cotizacion.trama.validado || this.cotizacion.trama.validado == undefined) {
                message += 'Debe validad la trama para continuar <br />';
            }
        }
        if (this.CONSTANTS.RAMO == 71) { }

        if (
            (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR ||
                this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EMITIR ||
                this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EMITIRR) &&
            this.CONSTANTS.ESTADO.NO_PROCEDE !== this.cotizacion.estado.codigo
        ) {
            if (this.cotizacion.contratante.flagEmail) {
                if (!this.cotizacion.contratante.email) {
                    message +=
                        'Debe ingresar un correo electrónico para la factura. <br />';
                } else {
                    if (
                        /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                            this.cotizacion.contratante.email
                        ) === false
                    ) {
                        message += 'El correo electrónico es inválido. <br />';
                    }
                }
            }

            //if (
            //    this.cotizacion.contratante.flagContact &&
            //    !(this.cotizacion.contratante.EListContactClient || []).length
            //) {
            //    message += this.storageService.variable.var_contactZero + '<br />';
            //}
        }

        if (message !== '') {
            swal.fire('Información', message, 'error');
            return;
        } else {

            if (this.cotizacion.poliza.dps.estado == 'PROCESO EXITOSO') {

                this.flagNroCredito = true;
                this.validarClientePoliza(true)

                if (!this.flagNroCredito) {
                    return;
                }

                this.isLoading = false;
                const params = this.obtenerDataEvaluacion();

                const myFormData: FormData = new FormData();

                // (this.cotizacion.files || []).forEach(function (file) {
                //     myFormData.append(file.name, file, file.name);
                // });

                myFormData.append('statusChangeData', JSON.stringify(params));
                let mensaje;

                if (this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId) {
                    mensaje =
                        this.storageService.variable.var_aprobarPorTecnica +
                        this.cotizacion.numeroCotizacion +
                        ' ?';
                } else {
                    mensaje =
                        '¿Desea cambiar al estado ' +
                        this.cotizacion.estado.valor +
                        ' la cotización N° ' +
                        this.cotizacion.numeroCotizacion +
                        '?';

                    // Validar Retroactividad
                    /*
                    const response: any = await this.ValidateRetroactivity();
                    if (response.P_NCODE == 4) {
                        this.cotizacion.derivaRetro = true;
                        await swal.fire('Información', response.P_SMESSAGE, 'error');
                        // return;
                    } else {
                        */
                    this.cotizacion.derivaRetro = false;
                    //}
                }

                swal
                    .fire({
                        title: 'Información',
                        text: mensaje,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí',
                        allowOutsideClick: false,
                        cancelButtonText: 'No',
                    })
                    .then((result) => {
                        if (result.value) {
                            this.isLoading = true;
                            if (this.flagUpdateNroCredito) {
                                this.updateNroCredito()
                            }
                            if (
                                this.CONSTANTS.PERFIL.TECNICA ==
                                this.storageService.user.profileId
                            ) {
                                this.actualizarEstado(myFormData);
                            } else {
                                if (
                                    !!this.cotizacion.poliza.checkbox1.POL_MAT &&
                                    this.cotizacion.tipoTransaccion == 1 &&
                                    this.cotizacion.poliza.tipoPerfil.NIDPLAN != 6
                                ) {
                                    this.emitPolicy(this.cotizacion.numeroCotizacion);
                                } else {
                                    if (this.cotizacion.contratante.debtMark !== 1) {
                                        this.emitirPoliza(myFormData, '', this.cotizacion);

                                    } else {
                                        this.actualizarEstado(myFormData);
                                    }
                                }
                            }
                        }
                    });

            } else {
                swal.fire('Información', 'No puede procesar esta cotización hasta que se complete el DPS', 'error');
                return;
            }


        }
    }

    updateNroCredito() {
        let params = {
            P_NNUM_CREDIT: this.cotizacion.poliza.nroCredito,
            P_NID_COTIZACION: this.cotizacion.numeroCotizacion,
            P_NUSERCODE: this.storageService.userId
        };
        this.desgravamenService.insertQuotation(params).subscribe((res) => {
            this.GrupoList = res
        });
    }

    obtenerLabelBtn() {
        if (this.modoVista == '') {
            this.labelBtn = 'Procesar';

            return;
        }
        if (
            this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR
        ) {
            this.labelBtn = 'Emitir';

            return;
        }
        if (
            this.CONSTANTS.PERFIL.COMERCIAl == this.storageService.user.profileId ||
            (this.CONSTANTS.PERFIL.EXTERNO == this.storageService.user.profileId &&
                this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR)
        ) {
            this.labelBtn = 'Continuar';

            return;
        }
    }
    obtenerFuctionBtn() {
        if (
            (this.cotizacion.contratante.lockMark == 0 &&
                this.esEvaluacion == false) ||
            (this.cotizacion.contratante.debtMark == 0 &&
                this.cotizacion.contratante.lockMark == 0 &&
                this.esEvaluacion == true)
        ) {
            if (this.modoVista == '') {
                this.fuctionBtn = this.clickProcesar();
                return;
            }
            if (
                this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
                this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR
            ) {
                this.clickEmitirEvaluacion();
                this.ValidacionContacto(false)
                return;
            }
            if (
                this.CONSTANTS.PERFIL.COMERCIAl == this.storageService.user.profileId ||
                (this.CONSTANTS.PERFIL.EXTERNO == this.storageService.user.profileId &&
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR)
            ) {


                if (!(this.cotizacion.contratante.EListContactClient || []).length) {
                    swal
                        .fire({
                            title: 'Información',
                            text:
                                this.storageService.variable.var_contactWarningZero,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar',
                        })
                        .then(async (result) => {
                            if (result.value) {
                                this.clickEnviarEvaluacion();
                            } else {
                                this.isLoading = false;
                                return;
                            }
                        });
                } else {
                    this.clickEnviarEvaluacion();
                    return;
                }

            }
        } else {
            swal.fire(
                'Informacion',
                'El contratante no esta habilitado para realizar esta operacion',
                'warning'
            );
        }
    }
}
