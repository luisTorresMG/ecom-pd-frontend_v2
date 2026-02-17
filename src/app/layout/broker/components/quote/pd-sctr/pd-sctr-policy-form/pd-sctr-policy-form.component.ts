import { PolizaAsegurados } from '../../../../models/polizaEmit/PolizaAsegurados';
import { PolizaEmitCab } from '../../../../models/polizaEmit/polizaEmitCab';
import { PolizaEmitComer } from '../../../../models/polizaEmit/polizaEmitComer';
import { ProfileEsp } from '../../../../models/shared/client-information/Profile-Esp';
import { PolizaEmitDet, PolizaEmitDetAltoRiesgo, PolizaEmitDetMedianoRiesgo, PolizaEmitDetBajoRiesgo } from '../../../../models/polizaEmit/PolizaEmitDet';
import { Component, OnInit, Input, ElementRef, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';
import { VisaService } from '../../../../../../shared/services/pago/visa.service';
import { AppConfig } from '../../../../../../app.config';
import * as FileSaver from 'file-saver';

//Compartido
import { AccessFilter } from './../../../access-filter'
import { ModuleConfig } from './../../../module.config'
import { OthersService } from '../../../../services/shared/others.service';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { MethodsPaymentComponent } from '../../../../modal/methods-payment/methods-payment.component';

// Util
import { CommonMethods } from '../../../common-methods'
import { ToastrService } from 'ngx-toastr';
import { SessionToken } from '../../../../../client/shared/models/session-token.model'
import { ValidateLockReponse } from '@root/layout/broker/interfaces/validate-lock-response';
import { ValidateDebtReponse } from '@root/layout/broker/interfaces/validate-debt-response';
import { ValidateDebtRequest } from '@root/layout/broker/models/collection/validate-debt.request';
import { ValidateLockRequest } from '@root/layout/broker/models/collection/validate-lock-request';
import { CobranzasService } from '@root/layout/broker/services/cobranzas/cobranzas.service';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';
import { AdjuntoInterface } from '../../../../interfaces/Adjunto.Interface';
import { PolicyLinkComponent } from '../../../policy/policy-link/policy-link.component';

//Ini RQ2025-4
import { PdSctrModule } from '../pd-sctr.module';
//Fin RQ2025-4

import { LogWSPlataformaService } from '../../../../services/logs/log-wsplataforma.service';

@Component({
    selector: 'app-pd-sctr-policy-form',
    templateUrl: './pd-sctr-policy-form.component.html',
    styleUrls: ['./pd-sctr-policy-form.component.css']
})
export class PdSctrPolicyFormComponent implements OnInit {
    @ViewChild('HideButton', { static: true }) miBotonRef!: ElementRef<HTMLButtonElement>;
    nrocotizacion: any = '';
    savedPolicyList: any = [];
    savedPolicyEmit: any = {};
    @Input() public reference: any;
    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    files: File[] = []
    flagAltoP = false;
    flagBajoP = false;
    flagMedianoP = false;
    flagTipoR = false
    lastFileAt: Date
    lastInvalids: any
    maxSize: any
    primas: any[] = []
    flagExtension = false;
    tamañoArchivo = 0;
    disabledFecha = true;
    errorFrecPago = false;
    loading: boolean = false;
    existoso = false;
    activacion = false;
    activacionFin = false;
    factorIgv: any;
    totalSTRC = 0;
    totalSalud = 0;
    activacionExitoso = false;
    NroSalud: any;
    NroPension: any;
    ProductoPension: any;
    ProductoSalud: any;
    flagBusqueda = false;
    fechaEvento: any;
    flagFechaMenorMayor = true;
    flagFechaMenorMayorFin = true;
    flagEmail = false;
    flagEmailNull = true;
    clickValidarArchivos = false;
    clickValidarExcel = false;
    valcheck1 = false
    valcheck2: boolean
    valcheck3: boolean
    asegurados: any = []
    cotizacionID: string = '';
    erroresList: any = [];
    saludList: any = [];
    pensionList: any = [];
    tasasList: any = [];
    contractingdata: any = [];
    activityVariationPension = '';
    activityVariationSalud = '';
    totalNetoSaludSave = 0.0;
    totalNetoPensionSave = 0.0;
    igvSaludSave = 0.0;
    igvPensionSave = 0.0;
    brutaTotalSaludSave = 0.0;
    brutaTotalPensionSave = 0.0;
    mensajePrimaPension = '';
    mensajePrimaSalud = '';
    igvPensionWS: number = 0.0;
    igvSaludWS: number = 0.0;
    endosoPension: string;
    endosoSalud: string;
    bsConfig: Partial<BsDatepickerConfig>;
    igvPension = 0;
    igvSalud = 0;
    nidProc = ''
    validateLockResponse: ValidateLockReponse = {};
    validateDebtResponse: ValidateDebtReponse = {};
    isValidatedInClickButton: boolean = false;
    ValFecha: boolean = false;
    excelSubir: File;
    errorExcel = false;
    errorNroCot = false;
    excelJson: any[] = [];
    archivosJson: any[] = [];
    mensajeValidacion = '';
    indentificacion = '';
    flagColumnas = false;
    primaTotalPension = 0;
    primatotalSalud = 0;
    filePathList = [];
    validaciones = [];
    validacionIndentifacion = [];
    validacionIndentifacionRUC20 = [];
    validacionIndentifacionRUC10 = [];
    mensajeValidacionInd = '';
    objcolumnas = [];
    objcolumnasRuc20 = [];
    objcolumnasRuc10 = [];
    polizaEmit: any = {};
    polizaEmitCab: any = {};
    SClient: string;
    polizaEmitComer: any[] = [];
    polizaEmitComerDTOPrincipal: PolizaEmitComer = new PolizaEmitComer();
    polizaEmitComerDTO: PolizaEmitComer = new PolizaEmitComer();
    polizaEmitDet: any[] = [];
    polizaEmitComerPrincipal = [] = [];
    polizaEmitDetDTO: PolizaEmitDet = new PolizaEmitDet();
    polizaEmitDetAltoRiesgo: PolizaEmitDetAltoRiesgo = new PolizaEmitDetAltoRiesgo();
    polizaEmitDetMedianoRiesgo: PolizaEmitDetMedianoRiesgo = new PolizaEmitDetMedianoRiesgo();
    polizaEmitDetBajoRiesgo: PolizaEmitDetBajoRiesgo = new PolizaEmitDetBajoRiesgo();
    polizaAsegurados: PolizaAsegurados = new PolizaAsegurados();
    profileEsp: ProfileEsp[];
    tipoRenovacion: any = [];
    frecuenciaPago: any = [];
    lblProducto: string = '';
    lblFecha: string = '';
    fechaCheck: boolean = true;
    tableComer = false;
    processID: any = '';
    mode: String; //emitir, incluir, renovar : emit, include, renew
    title: string; //titulo del formulario
    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    saludID = JSON.parse(localStorage.getItem('saludID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    perfil = '';
    codFlat = '';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
    epsItem = JSON.parse(localStorage.getItem('eps'))
    currentUser = JSON.parse(localStorage.getItem('currentUser'))
    profileId: any;
    usercode = JSON.parse(localStorage.getItem('currentUser'))['id']
    tipoClientGBD = JSON.parse(localStorage.getItem('inputsquotation'));
    emisionMapfre: any
    isCotizacion: number;
    canBillMonthly: boolean = true;
    canBillInAdvance: boolean = true;
    facVencido: boolean = false;
    facAnticipada: boolean = false;
    hasQuotationNumber: boolean = false;
    dayConfig: any = 0;
    dayRetroConfig: any = 0;
    monthPerPay = 1;
    monthsSCTR: any;
    disabledEps = false;
    mensajeEquivalente: string = '';
    nroMovimientoEPS: any = null
    nroCotizacionEps: any = null
    template: any = {}
    variable: any = {}
    alertGrati = ''
    clienteValido = false
    dEmiPension = 0
    dEmiSalud = 0
    paymentType: any = null
    visaData: any;
    prePayment: boolean = false
    modalRef: BsModalRef;
    @ViewChild('peModal') content;
    creditHistory: any = null
    dataCIP: any;
    perfilActual: any;
    nbranch: any = '';
    bsValueIniRetroactividad: any;

    valMixSAPSA: any;
    dataEmisionEPS: any = {};
    dataQuotation_EPS_EM: any = {};
    flagDirecto = 0;
    valSALUD_SCTR = 0;
    payPF = 0;
    SaludBruta: any;
    PensionBruta: any;
    dataQuotation: any = {};
    ListainsertEmit: any = [];
    perfil_tip = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
    montos_sctr: any = [];
    flagperfilTip: boolean = false;
    DataSCTRPENSION: any = [];
    DataSCTRSALUD: any = [];
    cotizacion: any = {};
    modal: any = {};
    files_adjuntos: string[] = [];

    contadorTrama = 0
    responseValidateTrama = 0
    dataTrama: any = {}

    infoPension: any = [];
    infoSalud: any = [];

    brutaTotalPension = 0.0;
    brutaTotalSalud = 0.0;
    rateTypeList: any = [];


    errorLogList: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private othersService: OthersService,
        private toastr: ToastrService,
        private policyemit: PolicyemitService,
        private quotationService: QuotationService,
        private modalService: NgbModal,
        private visaService: VisaService,
        private viewContainerRef: ViewContainerRef,
        private factoryResolver: ComponentFactoryResolver,
        private clientInformationService: ClientInformationService,
        private readonly appConfig: AppConfig,
        private collectionsService: CobranzasService,
        private readonly modalServiceInfo: BsModalService,
        private LogService : LogWSPlataformaService,
        private parameterSettingsService: ParameterSettingsService) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    async ngOnInit() {
        //debugger
        this.loading = true;
        this.isCotizacion = 1;
        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE);

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);
        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        this.lblFecha = CommonMethods.tituloPantalla();
        this.perfil = this.variable.var_prefilExterno;
        this.codFlat = this.variable.var_flatKey;
        this.profileId = await this.getProfileProduct();
        this.perfilActual = await this.getProfileProduct();
        this.getProfileEsp();
        await this.getRateTypeList();

        await this.route.queryParams
            .subscribe(params => {
                this.nrocotizacion = params.quotationNumber;
                if (this.nrocotizacion != null && this.nrocotizacion !== undefined && this.nrocotizacion.toString().trim() != '') { this.hasQuotationNumber = true; }
            });

        await this.obtenerTipoRenovacion();
        await this.getDataConfig();

        if (this.template.ins_validaPermisos) {
            if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_emission']) == false) { this.router.navigate(['/extranet/home']); }
        }

        if (!this.template.ins_clienteRegula) { this.clienteValido = true; }
        this.polizaEmit.facturacionVencido = false;
        this.polizaEmit.comentario = '';
        this.polizaEmitCab.MINA = false;
        this.polizaEmitCab.bsValueIni = ModuleConfig.StartDateTrx;
        this.polizaEmitCab.bsValueFin = ModuleConfig.EndDateTrx;
        this.polizaEmitCab.bsValueIniMin = new Date();
        this.polizaEmitCab.bsValueFinMax = new Date();
        this.polizaEmitCab.bsValueFinMin = new Date();
        this.polizaEmitComerDTOPrincipal.TYPE_DOC_COMER = '';
        this.polizaEmitComerDTOPrincipal.DES_DOC_COMER = 'Seleccione';
        this.polizaEmitDet.push(this.polizaEmitDetDTO);
        this.polizaEmitCab.TIPO_DOCUMENTO = '';
        this.polizaEmitCab.tipoRenovacion = '';
        this.polizaEmitCab.ACT_TECNICA = '';
        this.polizaEmitCab.COD_ACT_ECONOMICA = '';
        //this.polizaEmitCab.P_SISCLIENT_GBD = this.tipoClientGBD == null ? '2' : this.tipoClientGBD;
        this.polizaEmitCab.COD_TIPO_SEDE = '';
        this.polizaEmitCab.COD_MONEDA = '';
        this.polizaEmitCab.COD_DEPARTAMENTO = '';
        this.polizaEmitCab.COD_PROVINCIA = '';
        this.polizaEmitCab.COD_DISTRITO = '';
        this.polizaEmitCab.frecuenciaPago = '';
        this.polizaEmitCab.prePayment = false;
        this.polizaEmitCab.NRATETYPE = '';
        this.template.ins_disabledTipRenovacion = false;

        // if (this.template.ins_prePaymentEmision) {
        //     await this.checkPaymentTypes(this.currentUser)
        // }

        if (this.nrocotizacion != undefined) {
            //this.buscarCotizacion();
            this.validateQuotationTransac();
        }

        await this.getDataIgv()
        this.loading = false;

        CommonMethods.clearBack();

        window.addEventListener('beforeunload', () => {
            this.getValidateTrama(this.dataTrama, 2);
        });
    }

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

    async checkPaymentTypes(user: any) {
        await this.policyemit.checkPaymentTypes(user).toPromise().then(
            res => {
                this.paymentType = res;
            },
            error => {
                if (error.status == 401) {
                    swal.fire('Información', 'Su sesión ha terminado, vuelva a ingresar', 'question')
                        .then((value) => {
                            this.router.navigate(['/extranet/login']);
                        })
                }
            }
        );
    }

    async getDataIgv() {
        let data = ['I', 'D']
        // Pension
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionID.nbranch;
            itemIGV.P_NPRODUCT = this.pensionID.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.igvPensionWS = item == 'I' ? res : this.igvPensionWS
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension
                }
            );
        }

        // Salud
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.saludID.nbranch;
            itemIGV.P_NPRODUCT = this.saludID.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.igvSaludWS = item == 'I' ? res : this.igvSaludWS
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud
                }
            );
        }
    }

    async getDataConfig() {
        await this.policyemit.getDataConfig('DIASRETRO_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayRetroConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );

        await this.policyemit.getDataConfig('DIASADD_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );
    }

    onFacturacion(event, type = 'FAC_ANTICIPADA') {
        console.log(event)
        console.log(type)

        this.polizaEmit.facturacionAnticipada = type == 'FAC_ANTICIPADA' ? event.target.checked : this.polizaEmit.facturacionAnticipada;
        this.polizaEmit.facturacionVencido = type == 'FAC_VENCIDO' ? event.target.checked : this.polizaEmit.facturacionVencido;

        this.resetearPrimas(this.infoPension);
        this.resetearPrimas(this.infoSalud);

        this.facAnticipada = this.polizaEmit.facturacionVencido ? true : false
        this.facVencido = this.polizaEmit.facturacionAnticipada ? true : false

        if (!this.polizaEmit.facturacionVencido && !this.polizaEmit.facturacionAnticipada) {
            this.facVencido = false;
            this.facAnticipada = false;
        }
        
        if (this.polizaEmit.facturacionVencido) {
            this.template.ins_disabledTipRenovacion = true;
            if (this.polizaEmitCab.tipoRenovacion != '5') { //Frecuencia mensual
                this.polizaEmitCab.tipoRenovacion = '5';
                this.habilitarFechas();
            }
        } else {
            this.template.ins_disabledTipRenovacion = false;
        }
    }

    clearVal() {
        this.errorNroCot = false;
    }

    seleccionArchivos() {
        if (this.files.length === 0) {
            this.clickValidarArchivos = false;
        }
        this.clickValidarArchivos = true;
    }

    seleccionExcel(archivo: File) {
        this.clearExcel();

        if (!archivo) {
            return;
        }
        this.excelSubir = archivo;
        this.clickValidarExcel = true;
    }

    getProfileEsp() {
        this.clientInformationService.getProfileEsp().subscribe(
            res => {
                this.profileEsp = res;
            },
            err => { }
        );
    }

    clickExcel() {
        this.clearExcel();
    }

    clearExcel() {
        this.excelSubir = null;
        this.clickValidarExcel = false;
        this.clearDataInfo();
    }

    clearDataInfo() {
        this.tasasList = [];
        this.pensionList = [];
        this.saludList = [];
        this.infoPension = [];
        this.infoSalud = [];
        this.processID = '';
    }

    validarExcel() {
        if (this.cotizacionID != '') {
            if (this.excelSubir != undefined) {
                this.clearDataInfo();
                this.validarTrama()
            } else {
                swal.fire('Información', 'Adjunte una trama para validar', 'error');
            }

        } else {
            swal.fire('Información', 'Ingrese una cotización', 'error');
        }
    };

    async validarTrama() {
        let mensaje = '';
        mensaje = await this.validateEmit('cot')
        if (mensaje === '') {
            this.errorExcel = false;
            this.loading = true;

            const myFormData: FormData = new FormData();
            myFormData.append('dataFile', this.excelSubir);

            const data = this.generateObjValida();
            myFormData.append('objValida', JSON.stringify(data));

            this.dataTrama = data

            this.responseValidateTrama = await this.getValidateTrama(this.dataTrama)

            if (this.responseValidateTrama == 1) {
                swal.fire('Información', 'Se esta validando una trama en otra pestaña u ventana, espere a que se termine la validacion para continuar', 'info')
                this.loading = false;
                return;
            }

            await this.policyemit.valGestorList(myFormData).toPromise().then(
                async res => { 
                    if(res.P_CALIDAD == 2){
                        await this.obtValidacionTrama(res);
                    }else{
                        await this.newValidateTrama(res.P_NID_PROC);
                    }
                },
                async err => {
                    await this.policyemit.valGestorList(myFormData).toPromise().then(
                        async res => {
                            if(res.P_CALIDAD == 2){
                                await this.obtValidacionTrama(res);
                            }else{
                                await this.newValidateTrama(res.P_NID_PROC);
                            }
                        },
                        async err => {
                            await this.policyemit.valGestorList(myFormData).toPromise().then(
                                async res => {
                                    if(res.P_CALIDAD == 2){
                                        await this.obtValidacionTrama(res);
                                    }else{
                                        await this.newValidateTrama(res.P_NID_PROC);
                                    }
                                },
                                async err => {
                                    this.getValidateTrama(this.dataTrama, 2)
                                    this.loading = false;
                                }
                            );
                        }
                    );
                }
            );
        } else {
            await this.getValidateTrama(this.dataTrama, 2)
            swal.fire('Información', mensaje, 'error');
        }

        this.loading = false;
    }

    async validateDelimitationRules() {

        if (this.polizaEmitCab.NPRODUCT != 2) {
            let data: any = {
                scodProcess: this.processID,
                ntechnical: this.polizaEmitCab.ACT_TECNICA,
                ncot_mixta: this.polizaEmitCab.NCOT_MIXTA,
                nproduct: this.polizaEmitCab.NPRODUCT == 0 ? 1 : this.polizaEmitCab.NPRODUCT,
                sclient_type: this.contractingdata.P_SISCLIENT_GBD,
                ntype_valid: 1,
                stransac: 'EM'
            };

            if((data.ncot_mixta == 1) || (data.ncot_mixta == 0 && data.nproduct == 1)){ // SD-70599
                await this.quotationService.getValidateDelimitationRules(data).toPromise().then(
                    res => {
                        this.polizaEmitCab.DELIMITACION = res.ncode == 1 ? '* ' + res.smessage : '';
                    });
            }
        }

        // return sdelimiter;
    }

    async validateDerivationRules() {

        console.log('tasas', this.tasasList);
        let data: any = {
            scodProcess: this.processID,
            nworkers_total: this.tasasList.filter(item => item.totalWorkes).reduce((sum, current) => sum + Number(current.totalWorkes), 0),
            namount_total: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + Number(current.planilla), 0),
            sclient_type: this.contractingdata.P_SISCLIENT_GBD,
            ncot_mixta: this.polizaEmitCab.NCOT_MIXTA,
            nproduct: this.polizaEmitCab.NPRODUCT == 0 ? 1 : this.polizaEmitCab.NPRODUCT
        };

        if((data.ncot_mixta == 1) || (data.ncot_mixta == 0 && data.nproduct == 1)){ // SD-70599
            await this.quotationService.getDerivationRules(data).toPromise().then(
                res => {
                    if (res.ncode == 1) {
                        console.log(res.smessage);
                    }
                });
        }
    }

    async validatePrePayment() {
        // Valida score xperian -- Protecta y en Mapfre
        if (this.template.ins_validateHighScore || (this.template.ins_mapfre && this.pensionList.length > 0 && this.saludList.length == 0)) {
            if (this.creditHistory.nflag == 0) {
                this.polizaEmitCab.prePayment = true;
            }
        }
        // Valida periodo corto - Solo Mapfre
        if (this.template.ins_mapfre && this.saludList.length > 0) {
            if (this.polizaEmitCab.tipoRenovacion == '5' || this.polizaEmitCab.tipoRenovacion == '4') {
                this.polizaEmitCab.prePayment = true;
            }
        }
        // Valida cliente del estado
        if (this.template.ins_clienteGobierno || (this.template.ins_mapfre && this.pensionList.length > 0 && this.saludList.length == 0)) {
            if (this.contractingdata.P_SISCLIENT_GBD == '1' || this.polizaEmitCab.tipoRenovacion == '7') {
                this.polizaEmitCab.prePayment = false;
            }
        }
    }

    async callButtonVisa(userData: any) {
        const totalPolicy = await this.CalculateAjustedAmounts();
        const nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
        const lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : '';
        const dataVisa: any = {};
        dataVisa.ExternalId = this.processID;
        dataVisa.Amount = totalPolicy;
        dataVisa.Canal = this.polizaEmitComer[0].CANAL; // userData.canal
        dataVisa.PuntoVenta = 0; // userData.puntoVenta
        dataVisa.Flujo = 0;
        dataVisa.CodigoComercio = CommonMethods.commercialCode(this.codProducto);
        dataVisa.Ramo = this.pensionID.nbranch;
        dataVisa.Producto = this.pensionID.id;
        dataVisa.TipoDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
        dataVisa.NumeroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
        dataVisa.Email = this.polizaEmitCab.CORREO;
        dataVisa.Nombre = nameClient + ' ' + lastnameClient;
        dataVisa.tipoSolicitud = 1; // Solo para emision

        await this.policyemit.generateTokenVisa(dataVisa, userData.token).toPromise().then(
            async res => {
                const config = {
                    action: AppConfig.ACTION_FORM_VISA_SCTR,
                    timeoutUrl: CommonMethods.urlTimeout(this.codProducto, 1),
                    merchantid: CommonMethods.commercialCode(this.codProducto)
                };
                this.visaData = { ...config, ...res };
                this.visaData.flow = CommonMethods.visaFlow(this.codProducto);
                this.visaData.quotationNumber = this.nrocotizacion;
            },
            error => {
                this.loading = false;
            }
        );
    }

    async onPayment() {
        this.loading = true;
        await this.validateFlow();

        if (this.files.length > 0) {
            await this.filesAdjuntos(this.files);
        }

        const policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.savedPolicyList;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = this.emisionMapfre == null ? null : this.emisionMapfre;
        policyData.adjuntos = this.files_adjuntos;
        policyData.transaccion = 1;
        policyData.dataCIP = this.dataCIP;
        this.payPF = 1; //AVS - INTERCONEXION SABSA 05/09/2023
        let insertDetResult = await this.insertDetTr();
        let nidproc_EPS = this.nroMovimientoEPS;

        if (this.savedPolicyEmit.P_NCOT_MIXTA == 1 || this.nbranch == this.pensionID.nbranch && this.polizaEmitCab.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 05/09/2023
            await this.riesgosSCTR_Salud();
        }

        if (insertDetResult.P_COD_ERR == 0) {
            const payPF = this.payPF;

            for (let i = 0; i < policyData.savedPolicyList.length; i++) {
                policyData.savedPolicyList[i].P_PAYPF = payPF;
                policyData.savedPolicyList[i].P_NID_PROC_EPS = nidproc_EPS;
            }

            policyData.dataCIP.ExternalId_EPS = nidproc_EPS;
            localStorage.setItem('policydata', JSON.stringify(policyData));

            this.loading = false;
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        } else {
            this.loading = false;
            swal.fire('Información', 'Hubo un error en la inserción del detalle de la transacción. Comuníquese con soporte.', 'error');
        }
    }

    async insertDetTr() { //AVS - INTERCONEXION SABSA 05/09/2023
        let myFormData: FormData = new FormData()
        await this.insertEmitDet();
        myFormData.append('objetoDet', JSON.stringify(this.ListainsertEmit));

        try {
            const res: any = await this.policyemit.insertdetTR(myFormData).toPromise();
            return res;
        } catch (error) {
            console.error('Error en insertDetTr:', error);
            return { P_COD_ERR: 1, P_SMESSAGE: 'Error en insertDetTr' };
        }
    }

    riesgosSCTR_Salud() { //AVS - INTERCONEXION SABSA 05/09/2023
        this.dataQuotation_EPS_EM = {};
        this.dataQuotation_EPS_EM.primaMinimaAutorizada = this.polizaEmitCab.MIN_SALUD_AUT;
        this.dataQuotation_EPS_EM.riesgos = [];

        if (this.saludList.length > 0) {
            this.saludList.forEach(dataSalud => {
                let riesgo_EPS: any = {};

                riesgo_EPS.codigoProducto = this.saludID.id;
                if (dataSalud.DES_RIESGO === 'Riesgo alto') {
                    riesgo_EPS.codigoPlan = 3;
                    riesgo_EPS.codigoCategoria = 3;
                } else if (dataSalud.DES_RIESGO === 'Riesgo medio') {
                    riesgo_EPS.codigoPlan = 2;
                    riesgo_EPS.codigoCategoria = 2;
                } else if (dataSalud.DES_RIESGO === 'Riesgo bajo') {
                    riesgo_EPS.codigoPlan = 1;
                    riesgo_EPS.codigoCategoria = 1;
                }
                riesgo_EPS.cantidadTrabajador = dataSalud.NUM_TRABAJADORES;
                riesgo_EPS.planillaTotal = dataSalud.NSUM_PREMIUM;
                riesgo_EPS.tasaAutorizada = dataSalud.TASA_CALC;
                this.dataQuotation_EPS_EM.riesgos.push(riesgo_EPS);
            });
        }

        localStorage.setItem('dataQuotation_EPS_EM', JSON.stringify(this.dataQuotation_EPS_EM));
    }

    openPagoEfectivoInfo() {
        this.modalRef = this.modalServiceInfo.show(this.content);
    }

    async callButtonPE() {
        let totalPolicy = await this.CalculateAjustedAmounts();

        this.saveLog('callButtonPE - policy-form - Cliente360 - B', 'Nid-proc - ' + this.processID + " // contractingdata => " + JSON.stringify(this.contractingdata), 1);

        let nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
        let lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : ''

        this.dataCIP = {}
        this.dataCIP.tipoSolicitud = 1 // Solo para emision
        this.dataCIP.monto = totalPolicy
        this.dataCIP.correo = this.polizaEmitCab.CORREO
        this.dataCIP.conceptoPago = CommonMethods.conceptProduct(this.codProducto)
        this.dataCIP.nombres = nameClient
        this.dataCIP.Apellidos = lastnameClient
        this.dataCIP.ubigeoINEI = await this.ubigeoInei(this.polizaEmitCab.COD_DISTRITO)
        this.dataCIP.tipoDocumento = this.polizaEmitCab.TIPO_DOCUMENTO
        this.dataCIP.numeroDocumento = this.polizaEmitCab.NUM_DOCUMENTO
        this.dataCIP.telefono = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : ''
        this.dataCIP.ramo = this.pensionID.nbranch
        this.dataCIP.producto = this.polizaEmitCab.NPRODUCT == null ? this.pensionID.id : this.polizaEmitCab.NPRODUCT
        this.dataCIP.ExternalId = this.processID
        this.dataCIP.quotationNumber = this.nrocotizacion
        this.dataCIP.codigoCanal = this.polizaEmitComer[0].CANAL;
        this.dataCIP.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.dataCIP.eps = Number(this.epsItem.NCODE)
        this.dataCIP.Moneda = this.polizaEmitCab.COD_MONEDA
        if (Number(this.epsItem.NCODE) == 3 && this.polizaEmitCab.NCOT_MIXTA == 1 || this.nbranch == this.pensionID.nbranch && this.polizaEmitCab.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 19/09/2023
            this.dataCIP.producto_EPS = this.saludID.id
            this.dataCIP.ExternalId_EPS = ''
            this.dataCIP.monto_pension = parseFloat(this.PensionBruta).toFixed(2);
            this.dataCIP.monto_salud = parseFloat(this.SaludBruta).toFixed(2);
            this.dataCIP.mixta = this.polizaEmitCab.NCOT_MIXTA
        }
        this.saveLog('Punto Control SCTR A- callButtonPE' , 'Nid-proc - ' + this.processID +
                    " // dataCIP => " + JSON.stringify(this.dataCIP)
                    , 1);
    }

    async ubigeoInei(distrito) {
        let ubigeo = 0
        await this.quotationService.equivalentMunicipality(distrito).toPromise().then(
            res => {
                ubigeo = res;
            },
            error => {
                this.loading = false;
                ubigeo = 0;
            }
        );
        return ubigeo;
    }

    async validateFlow() {
        let mensaje = '';
        mensaje = await this.validateEmit();

        if (mensaje == '') {
            let ncodeStatus = '0'

            if (this.flagEmailNull == false) {
                ncodeStatus = await this.updateClient();
            }

            if (ncodeStatus == '0') {
                this.flagEmailNull = true;
                this.savedPolicyList = [];
                await this.dataEmision();

            } else {
                this.prePayment = false;
                this.loading = false;
                swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
            }

        } else {
            this.prePayment = false
            this.loading = false;
            swal.fire('Información', mensaje, 'error');
        }
    }

    async visaClick() {
        await this.insertEmitDet();
        localStorage.setItem('objetoDet', JSON.stringify(this.ListainsertEmit));
        this.appConfig.AddEventAnalityc();
    }

    async calculateTotal() {
        let totalPolicy = 0;
        if (this.monthPerPay == 0) {
            const initialDate = new Date(CommonMethods.formatDateCalculate(this.polizaEmitCab.bsValueIni)).getTime();
            const finalDate = new Date(CommonMethods.formatDateCalculate(this.polizaEmitCab.bsValueFin)).getTime();
            const daysDifferences = (finalDate - initialDate) / (1000 * 60 * 60 * 24) + 1;
            const dayMonth = daysDifferences / CommonMethods.dayMonth();
            const premiumDaySalud = CommonMethods.formatValor(Number(this.totalNetoSaludSave) * dayMonth, 6); // Prima diaria Salud
            const premiumDayPension = CommonMethods.formatValor(Number(this.totalNetoPensionSave) * dayMonth, 6); // Prima diaria Pension
            const premiumDaySaludDE = CommonMethods.formatValor((Number(this.totalNetoSaludSave) * this.dEmiSalud) * dayMonth, 6); // Prima diaria Salud + DE
            const premiumDayPensionDE = CommonMethods.formatValor((Number(this.totalNetoPensionSave) * this.dEmiPension) * dayMonth, 6); // Prima diaria Pension + DE
            const igvSalud = CommonMethods.formatValor(Number(premiumDaySalud) * (Number(this.igvSaludWS) - 1), 6);
            const igvPension = CommonMethods.formatValor(Number(premiumDayPension) * (Number(this.igvPensionWS) - 1), 6);
            const premiumSalud = Number(premiumDaySaludDE) + Number(igvSalud);
            const premiumPension = Number(premiumDayPensionDE) + Number(igvPension);
            totalPolicy = CommonMethods.formatValor(Number(premiumPension) + Number(premiumSalud), 2);
        } else {
            const premiumDaySalud = Number(CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) * this.monthPerPay, 6));
            const premiumDayPension = Number(CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) * this.monthPerPay, 6));
            const igvSalud = CommonMethods.formatValor(Number(CommonMethods.formatValor(Number(this.totalNetoSaludSave) * this.monthPerPay, 2)) * (Number(this.igvSaludWS) - 1), 6);
            const igvPension = CommonMethods.formatValor(Number(CommonMethods.formatValor(Number(this.totalNetoPensionSave) * this.monthPerPay, 2)) * (Number(this.igvPensionWS) - 1), 6);
            const premiumSalud = Number(premiumDaySalud) + Number(igvSalud);
            const premiumPension = Number(premiumDayPension) + Number(igvPension);
            totalPolicy = CommonMethods.formatValor(Number(premiumPension) + Number(premiumSalud), 2);
        }

        return totalPolicy;
    }

    async infoCarga(processID: any) {
        let self = this;
        // let flagVencido = this.polizaEmit.facturacionVencido ? 1 : 0; //AVS - INTERCONEXION SABSA
        if (processID != '') {
            let data: any = {};
            data.nbranch = 77;
            data.userCode = this.usercode;
            data.stransac = "EM";
            data.codProcess = processID;
            data.typeMovement = '1';
            data.flag_vencido =this.polizaEmit.facturacionVencido ? 1 : 0;

            await this.policyemit.getPolicyEmitDetTX(data)
                .toPromise().then(async res => {
                    if (res.detailList.length > 0) {

                        let itemPension = res.detailList.filter(item => item.ID_PRODUCTO == '1');
                        this.generarInfo(itemPension, '1');

                        let itemSalud = res.detailList.filter(item => item.ID_PRODUCTO == '2');
                        this.generarInfo(itemSalud, '2');

                        this.tasasList = this.pensionList.length > 0 ? this.pensionList : this.saludList;
                        
                        this.saveLog('Punto Control SCTR A- infoCarga' , 'Nid-proc - ' + this.processID +" //Obj - tasasList => " + JSON.stringify(this.tasasList) , 1);

                        this.dataPension(this.infoPension);
                        this.dataSalud(this.infoSalud);

                        this.getRegularClient(this.infoPension, this.infoSalud);

                        await this.resetearPrimas(this.infoPension);
                        await this.resetearPrimas(this.infoSalud);

                    } else {
                        this.primaTotalPension = 0;
                        this.primatotalSalud = 0;
                        this.igvPension = 0;
                        this.igvSalud = 0;
                        this.totalSalud = 0;
                        this.totalSTRC = 0;
                    }
                })
        }

    }

    getRegularClient(itemPension: any, itemSalud: any) {
        const getMesVencido = (items: any) => (items.length > 0 ? items[0].mes_vencido : 0);

        const regulaPen = getMesVencido(itemPension);
        const regulaSal = getMesVencido(itemSalud);
        this.saveLog('Punto Control SCTR A- getRegularClient' , 'Nid-proc - ' + this.processID +
                    " // regulaPen => " + regulaPen +
                    " // regulaSal => " + regulaSal
                    , 1);
        if (this.valMixSAPSA === 1) {
            this.clienteValido = regulaPen == "1" && regulaSal == "1";
        } else {
            this.clienteValido = regulaPen == "1" || regulaSal == "1";
        }
    }

    validateQuotationTransac = () => {
        if (this.nrocotizacion != undefined && this.nrocotizacion != 0) {
            let hideButton = this.miBotonRef.nativeElement;
            let item = { P_NID_COTIZACION: this.nrocotizacion };
            this.policyemit.valTransactionQuotation(item).subscribe(
                res => {
                    if (res.P_NCODE == 0) {
                        if (res.P_SRPTA != 'null') {
                            swal.fire(
                                {
                                    title: 'Información',
                                    text: `La cotización N° ${this.nrocotizacion} esta pendiente de autorizar.`,
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                }
                            ).then(
                                res => {
                                    if (res.value) {
                                        hideButton.style.display = 'none';
                                        return;
                                    }
                                }
                            );
                        } else {
                            hideButton.style.display = 'block';
                            this.buscarCotizacion();
                        }
                    }
                }
            )
        }
    }


    buscarCotizacion = () => {
        this.cotizacionID = '';
        this.NroPension = '';
        this.NroSalud = '';
        this.flagBusqueda = false;
        this.pensionList = [];
        this.saludList = [];
        this.tasasList = [];
        const typeMovement = '1';
        this.flagEmailNull = true;
        // Cabeza Cotizacion | Datos de la póliza
        if (this.nrocotizacion != undefined && this.nrocotizacion != 0) {
            this.policyemit.getPolicyEmitCab(this.nrocotizacion, typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id']).toPromise().then(
                async res => {
                    this.cotizacionID = this.nrocotizacion;
                    if (res.GenericResponse !== null) {
                        if (res.GenericResponse.MENSAJE == null || res.GenericResponse.MENSAJE === '') {
                            // GCAA 30042024
                            if (res.GenericResponse.ESTADO_COT == '2' || res.GenericResponse.ESTADO_COT == '7') {
                                this.filePathList = res.GenericResponse.RUTAS;
                                this.SClient = res.GenericResponse.SCLIENT;
                                this.nroCotizacionEps = res.GenericResponse.SCOTIZA_LNK;
                                this.valMixSAPSA = res.GenericResponse.NCOT_MIXTA;
                                this.valSALUD_SCTR = res.GenericResponse.NPRODUCT;

                                if (this.perfil_tip == '7' || this.perfil_tip == 7) {
                                    this.canBillInAdvance = true;
                                    this.canBillMonthly = true;
                                    //this.polizaEmit.facturacionAnticipada = true; WV comentado
                                    //this.facVencido = true; WV comentado 
                                    this.facVencido = false;
                                    this.facAnticipada = false;
                                } else if (this.perfil_tip == '134' || this.perfil_tip == 134) {
                                    this.canBillInAdvance = true;
                                    this.canBillMonthly = false
                                    //INI-GJLR-SD-55782
                                    //this.polizaEmit.facturacionAnticipada = true;
                                    //this.polizaEmit.facturacionAnticipada = false; WV comentado
                                    //FIN-GJLR-SD-55782
                                    this.facAnticipada = false;
                                    this.facVencido = true;
                                } else if (this.perfil_tip == '305' || this.perfil_tip == 305) {
                                    this.canBillInAdvance = true;
                                    this.canBillMonthly = true;
                                    //this.polizaEmit.facturacionAnticipada = true; WV comentado
                                    this.polizaEmit.facturacionAnticipada = false;
                                    //this.facVencido = true; WV comentado
                                    this.facVencido = false;
                                } else {
                                    //this.polizaEmit.facturacionAnticipada = false; WV comentado
                                }

                                this.polizaEmitCab = res.GenericResponse;

                                if (this.polizaEmitCab.CORREO == '') {
                                    this.flagEmailNull = false;
                                }
                                await this.dataClient();

                                if (this.template.ins_historialCreditoTransaction) {
                                    const data: any = {};
                                    data.tipoid = this.contractingdata.P_NIDDOC_TYPE == '1' ? '2' : '1';
                                    data.id = this.contractingdata.P_SIDDOC;
                                    data.papellido = this.contractingdata.P_SLASTNAME;
                                    data.sclient = this.contractingdata.P_SCLIENT;
                                    data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
                                    data.nbranch = Number(this.nbranch); //AVS - INTERCONEXION SABSA 
                                    this.clientInformationService.invokeServiceExperia(data).subscribe(
                                        res => {
                                            this.creditHistory = {}
                                            this.creditHistory.nflag = res.nflag;
                                            this.creditHistory.sdescript = res.sdescript;
                                        }
                                    );
                                }

                                this.polizaEmitCab.tipoRenovacion = this.template.ins_tipRenovacion ? res.GenericResponse.FREQ_PAGO : '';

                                if (this.template.ins_frecPago) {
                                    this.obtenerFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
                                }

                                this.polizaEmitCab.frecuenciaPago = this.template.ins_frecPago ? res.GenericResponse.FREQ_PAGO : '';

                                this.polizaEmitCab.bsValueIni = !this.template.ins_mapfre ? new Date() : new Date(this.polizaEmitCab.EFECTO_COTIZACION);
                                this.polizaEmitCab.bsValueIniMin = new Date(this.polizaEmitCab.EFECTO_COTIZACION);
                                this.polizaEmitCab.bsValueIniMin.setDate(this.polizaEmitCab.bsValueIniMin.getDate() - this.dayRetroConfig);
                                this.polizaEmitCab.bsValueFin = new Date(res.GenericResponse.EXPIRACION_COTIZACION);

                                this.polizaEmitCab.bsValueFinMin = this.polizaEmitCab.bsValueIni;
                                this.polizaEmitCab.bsValueFinMax = new Date(this.polizaEmitCab.EXPIRACION_COTIZACION); // Cambio 19032024, no hay fecha maxima para realizar la emision
                                this.polizaEmitCab.bsValueFinMax.setDate(this.polizaEmitCab.bsValueFinMax.getDate() + this.dayConfig);


                                //AGF 03012024 Eliminado Retroactividad para ciertos perfiles
                                if ( this.profileId == 305 || this.profileId == 304) { //this.profileId == 134 || this.profileId == 7
                                    this.polizaEmitCab.bsValueIniMin = new Date(this.polizaEmitCab.EFECTO_COTIZACION);
                                    // this.polizaEmitCab.bsValueFinMax = new Date(this.polizaEmitCab.EFECTO_COTIZACION);
                                    // this.template.ins_disabledFechaEmision = true;
                                }

                                //AGF 22/03/2023 Agregando fecha minima y maxima permitida SCTR
                                this.bsValueIniRetroactividad = new Date();
                                this.bsValueIniRetroactividad.setDate(this.bsValueIniRetroactividad.getDate() - 5);
                                let bsValueIniMaxRetroactividad = new Date();
                                bsValueIniMaxRetroactividad.setDate(bsValueIniMaxRetroactividad.getDate() + 5);

                                if (this.currentUser.id == 12340) {
                                    this.polizaEmitCab.bsValueIniMin = this.bsValueIniRetroactividad;
                                    this.polizaEmitCab.bsValueFinMax = bsValueIniMaxRetroactividad;
                                }

                                //AGF Fin 22/03/2023 Agregando fecha minima y maxima permitida SCTR

                                this.polizaEmitCab.MINA = res.GenericResponse.MINA == '1' ? true : false;
                                this.polizaEmitCab.DELIMITACION = res.GenericResponse.DELIMITACION == '1' ? '* La actividad cuenta con delimitación' : '';
                                this.flagBusqueda = true;
                                this.polizaEmitCab.prePayment = false;
                                this.polizaEmitCab.NRATETYPE = res.GenericResponse.STIPO_COTIZACION;

                                this.policyemit.getPolicyEmitComer(this.nrocotizacion, this.isCotizacion)
                                    .subscribe((res: any) => {
                                        this.tableComer = true
                                        this.polizaEmitComer = [];
                                        if (res.length > 0 && res !== null) {
                                            res.forEach(com => {
                                                com.COMISION_PENSION_AUT = com.COMISION_PENSION_AUT == '' ? '0' : com.COMISION_PENSION_AUT;
                                                com.COMISION_PENSION_PRO = com.COMISION_PENSION_PRO == '' ? '0' : com.COMISION_PENSION_PRO;
                                                com.COMISION_PENSION = com.COMISION_PENSION == '' ? '0' : com.COMISION_PENSION;
                                                com.COMISION_SALUD = com.COMISION_SALUD == '' ? '0' : com.COMISION_SALUD;
                                                com.COMISION_SALUD_AUT = com.COMISION_SALUD_AUT == '' ? '0' : com.COMISION_SALUD_AUT;
                                                com.COMISION_SALUD_PRO = com.COMISION_SALUD_PRO == '' ? '0' : com.COMISION_SALUD_PRO;
                                            });
                                            this.polizaEmitComer = res
                                            this.flagBusqueda = true;
                                        } else {
                                            this.polizaEmitComerDTOPrincipal = {};
                                            this.polizaEmitComer = [];
                                        }
                                    })
                            }
                            // GCAA 30042024
                            else {
                                let mensajeRes = '';
                                //mensajeRes = 'La Cotización N° ' + this.nrocotizacion + ', ' + ' esta pendiente de aprobación'; 
                                mensajeRes = res.GenericResponse.ESTADO_MSG != null ? res.GenericResponse.ESTADO_MSG : 'La Cotización N° ' + this.nrocotizacion + ', ' + ' esta pendiente de aprobación';
                                swal.fire({
                                    title: 'Información',
                                    text: mensajeRes,
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                }).then((result) => {
                                    if (result.value) {
                                        this.router.navigate(['/broker/request-status']);
                                    }
                                });
                            }
                            // GCAA 30042024
                        } else {
                            swal.fire('Información', res.GenericResponse.MENSAJE, 'error')
                                .then((value) => {
                                    if (this.profileId == 31) {
                                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                    } else {
                                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                                    }
                                })
                            this.limpiarCampos();
                        }

                        const validateLockReq = new ValidateLockRequest(); //AVS - INTERCONEXION SABSA
                        validateLockReq.branchCode = this.pensionID.nbranch;
                        validateLockReq.productCode = this.pensionID.id;
                        validateLockReq.documentType = this.polizaEmitCab.TIPO_DOCUMENTO;
                        validateLockReq.documentNumber = this.polizaEmitCab.NUM_DOCUMENTO;
                        this.validateLockResponse = await this.getValidateLock(validateLockReq);

                        if (this.validateLockResponse.lockMark == 1) {
                            swal.fire('Información', this.validateLockResponse.observation, 'error');
                            this.loading = true;
                            this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                            return;
                        }
                    } else {
                        this.limpiarCampos()
                    }
                }
            )
        } else {
            swal.fire('Información', 'Ingresar nro de cotización', 'error');
        }
    }

    limpiarCampos() {
        this.polizaEmitCab = new PolizaEmitCab();
        this.polizaEmitCab.bsValueIni = new Date();
        this.polizaEmitCab.bsValueFin = new Date();
        this.polizaEmitCab.bsValueIniMin = new Date();
        this.polizaEmitCab.bsValueFinMin = new Date();
        this.polizaEmitCab.bsValueFinMax = new Date();
        this.polizaEmitCab.TIPO_DOCUMENTO = '';
        this.polizaEmitCab.tipoRenovacion = '';
        this.polizaEmitCab.ACT_TECNICA = ''
        this.polizaEmitCab.COD_ACT_ECONOMICA = ''
        this.polizaEmitCab.P_SISCLIENT_GBD = '';
        this.polizaEmitCab.COD_TIPO_SEDE = '';
        this.polizaEmitCab.COD_MONEDA = '';
        this.polizaEmitCab.COD_DEPARTAMENTO = ''
        this.polizaEmitCab.COD_PROVINCIA = ''
        this.polizaEmitCab.COD_DISTRITO = ''
        this.polizaEmitCab.frecuenciaPago = '';
        this.polizaEmitComer = []
        this.polizaEmit.facturacionVencido = false
        this.polizaEmit.facturacionAnticipada = false
        this.facVencido = false
        this.facAnticipada = false
    }

    async dataClient() {
        let data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.polizaEmitCab.TIPO_DOCUMENTO;
        data.P_SIDDOC = this.polizaEmitCab.NUM_DOCUMENTO.toUpperCase().trim();

        await this.clientInformationService.validateContractingData(data).toPromise().then(
            res => {
                this.contractingdata = res.EListClient[0];
            }
        );
    }

    async obtenerTipoRenovacion() {
        let requestTypeRen: any = {}
        requestTypeRen.P_NEPS = this.epsItem.STYPE
        requestTypeRen.P_NPRODUCT = this.codProducto
        requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']
        await this.policyemit.getTipoRenovacion(requestTypeRen).toPromise().then(
            res => {
                this.tipoRenovacion = res;
            })
    }
    async obtenerFrecuenciaPago(tipoRenovacion: any) {
        await this.policyemit.getFrecuenciaPago(tipoRenovacion).toPromise().then(
            res => {
                if (!this.template.ins_frecPago) {
                    this.polizaEmitCab.frecuenciaPago = this.polizaEmitCab.tipoRenovacion;
                }
                this.frecuenciaPago = res;
                // Si solo hay una frecuencia de pago, está se seleccionará automáticamente
                if (this.frecuenciaPago != null && this.frecuenciaPago.length == 1 && !this.template.ins_frecPago) {
                    this.polizaEmitCab.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
                }

            })
    }

    downloadExcel() {
        const client: string = this.SClient;
        if (client != null && this.nrocotizacion !== undefined && this.nrocotizacion !== 0) {
            const data: any = {};
            data.contratante = this.polizaEmitCab.NOMBRE_RAZON;
            data.ruc = this.polizaEmitCab.NUM_DOCUMENTO;
            data.moneda = this.polizaEmitCab.DES_MONEDA;
            data.cotizacion = this.nrocotizacion;
            data.sclient = client;
            data.operacion = 1;
            data.movimiento = 0;
            data.poliza = 0;

            this.loading = true;
            this.policyemit.downloadExcel(data).toPromise().then(
                res => {
                    this.loading = false;
                    if (res.indEECC === 0) {
                        const nameFile: string = 'Modelo_' + this.nrocotizacion;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    }
                },
                err => {
                    this.loading = false;
                });
        } else {
            swal.fire('Información', 'Debes buscar una cotizacion', 'error');
        }
    }

    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
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

    cambioFecha() {
        this.errorFrecPago = false;
    }

    async validateEmit(flow: any = 'emit') {
        let mensaje = ''
        if (this.cotizacionID == '') {
            this.errorNroCot = true;
            mensaje = 'Debe ingresar una cotización <br />';
        }
        if (this.polizaEmitCab.frecuenciaPago === '') {
            this.errorFrecPago = true;
            mensaje += 'Debe ingresar una frecuencia de pago <br />';
        }
        if (this.polizaEmitCab.tipoRenovacion === '') {
            this.flagTipoR = true;
            mensaje += 'Debe ingresar un tipo de renovación <br />';
        }

        if (flow == 'emit') {
            if (this.excelSubir === undefined) {
                this.errorExcel = true;
                mensaje += 'Debe subir un archivo excel para su validación <br />';
            } else {
                if (this.erroresList.length > 0 || this.processID == '') {
                    this.errorExcel = true;
                    mensaje += 'No se ha procesado la validación de forma correcta <br />';
                }
            }
        }

        if (this.polizaEmitCab.CORREO == '') {
            this.flagEmail = true;
            mensaje += 'Debes ingresar un correo electrónico <br />';
        } else {
            if (this.regexConfig('email').test(this.polizaEmitCab.CORREO) == false) {
                this.flagEmail = true;
                mensaje += 'El correo electrónico es inválido <br />';
            } else {
                this.flagEmail = false;
            }
        }

        return mensaje;
    }

    regexConfig(type) {
        let reg = null;
        switch (type) {
            case 'rate':
                reg = /^((100(\.0{1,2})?)|(\d{1,2}([\\.]{0,1})+(\.\d{1,6})?))$/;
                break;
            case 'number':
                reg = /^[0-9]+$/;
                break;
            case 'decimal':
                reg = /^\d*\.?\d{0,2}$/;
                break;
            case 'porcentaje':
                reg = /^((100(\.0{1,2})?)|(\d{1,2}([\\.]{0,1})+(\.\d{1,2})?))$/;
                break;
            case 'email':
                reg = /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/
                break;
        }

        return reg;
    }

    async generarPoliza(forma: NgForm) {
        let mensaje = '';
        this.flagDirecto = 1; //AVS - INTERCONEXION SABSA

        mensaje = await this.validateEmit();

        if (mensaje == '') {

            if (this.polizaEmitCab.NPRODUCT != 2 || this.polizaEmitCab.NCOT_MIXTA == 1) {
                if (!await this.validateRetroactivity()) {
                    return;
                }
            }


            swal.fire({
                title: 'Información',
                text: '¿Deseas continuar con la emisión de póliza?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    const dataQuotation = this.constructDataQuotation();
                    this.loading = true;

                    this.policyemit.validateProcessEmission(dataQuotation).subscribe(
                        async (res) => {
                            if (res.P_COD_ERR == 0) {
                                if (res.P_SAPROBADO === 'S') {
                                    // this.processInsured();

                                    let smessage = await this.validateAgencySCTR();
                                    // smessage = await this.ValidateDebt(smessage); // no pasar a QA
                                    await this.processEmission(smessage);

                                } else {
                                    this.processDerivation(res);
                                }
                            } else {
                                this.loading = false;
                                swal.fire('Información', res.P_MESSAGE || res.P_SMESSAGE, 'error');
                                // this.isLoading = false;
                            }
                        },
                        (err) => {
                            // this.isLoading = false;
                            swal.fire('Información', 'Hubo un error con el servidor', 'error');
                            this.loading = false;
                        }
                    );
                }
                else {
                    console.log('No se continua con la generación de póliza');
                }

            });


        } else {
            swal.fire('Información', mensaje, 'error');
            this.loading = false;
        }
    }

    async processDerivation(resTecnica) {

        this.savedPolicyList = [];
        this.ListainsertEmit = [];  //AVS - INTERCONEXION SABSA
        await this.dataEmision(); // this.savedPolicyList
        await this.insertEmitDet();  //AVS - INTERCONEXION SABSA this.ListainsertEmit

        this.saveFilesDerivation();
        
        const data: any = {}
        data.P_NID_PROC_EPS = (this.dataTrama.codMixta == 1) ? this.nroMovimientoEPS : (this.dataTrama.nroProduct == 2) ? this.processID : "";
        data.P_NID_PROC_SCTR = (this.dataTrama.codMixta == 1) ? this.processID : (this.dataTrama.nroProduct == 2) ? "" : this.processID;
        data.P_NID_COTIZACION = this.dataTrama.nroCotizacion;
        data.P_NTYPE_TRANSAC = this.dataTrama.type_mov;
        data.P_MENSAJE_TR = "TRAMA ACTUALIZADA";

        this.policyemit.saveDetailQuotation(this.ListainsertEmit).subscribe(
            async (res) => {
                if (res.P_COD_ERR == 0) {

                    swal.fire('Información', resTecnica.P_SMESSAGE, 'success');
                    await this.getUpdateEps(data)
                    this.loading = false;
                    this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                } else {
                    this.loading = false;
                    swal.fire('Información', res.P_MESSAGE || res.P_SMESSAGE, 'error');
                    // this.isLoading = false;
                }
            },
            (err) => {
                // this.isLoading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
                this.loading = false;
            }
        );
    }

    constructDataQuotation() {
        return {
            NumeroCotizacion: this.cotizacionID,
            P_SCLIENT: 0,
            P_NCURRENCY: this.polizaEmitCab.COD_MONEDA,
            P_NBRANCH: 77,
            P_DSTARTDATE: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
            P_DEXPIRDAT: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
            P_NIDCLIENTLOCATION: 0,
            P_SCOMMENT: this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''),
            P_SRUTA: '',
            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            P_NACT_MINA: this.polizaEmitCab.MINA ? 1 : 0,
            P_NTIP_RENOV: this.polizaEmitCab.tipoRenovacion,
            P_NPAYFREQ: this.polizaEmitCab.frecuenciaPago,
            P_SCOD_ACTIVITY_TEC: this.polizaEmitCab.ACT_TECNICA,
            P_SCOD_CIUU: this.polizaEmitCab.COD_ACT_ECONOMICA,
            P_NFACTURA_ANTICIPADA: this.polizaEmit.facturacionAnticipada == true ? 1 : 0, // Facturacion Anticipada
            P_NFACTURA_VENCIDO: this.polizaEmit.facturacionVencido == true ? 1 : 0, // Facturacion Anticipada
            P_NTIP_NCOMISSION: 0,
            P_NPRODUCT: this.polizaEmitCab.NCOT_MIXTA == 1 ? 1 : this.saludList.length > 0 ? 2 : 1, // this.inputsQuotation.P_NPRODUCT,
            P_NEPS: this.epsItem.NCODE,
            P_NPENDIENTE: 0,
            P_NCOMISION_SAL_PR: 0,
            CodigoProceso: this.processID,
            P_NREM_EXC: 0,
            P_DERIVA_RETRO: 0,
            retOP: 2,
            FlagCambioFecha: 0,
            TrxCode: 'EM',
            tipoEndoso: 0,
            SMAIL_EJECCOM: null,
            P_SPOL_MATRIZ: 0,
            P_SPOL_ESTADO: 0,
            FlagCotEstado: 0,
            P_NIDPLAN: 0,
            P_APROB_CLI: 0,
            flagComerExclu: 0,
            P_NCOT_MIXTA: this.polizaEmitCab.NCOT_MIXTA,
            sctrSALUD: 2,
            sctrPENSION: 1,
            flagComisionPension: 0,
            flagComisionSalud: 0,
            P_SCLIENT_TYPE: this.contractingdata.P_SISCLIENT_GBD,
            P_NMONTO_TOTAL: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + Number(current.planilla), 0),
            P_FACT_VENCIDO: this.polizaEmit.facturacionVencido ? 1 : 0,
            planId: 999,
            P_NATTACH: this.files.length > 0 ? 1 : 0,
            P_NCHANGE_ACTIVITY: 0,
            P_NCHANGE_MINA: 0,
            P_NCHANGE_AGENCY: 0,
            P_NPROFILE: this.profileId,
            QuotationDet: [],
            QuotationCom: [],
        };
    }

    async processEmission(resValidationDebt) {

        console.log(resValidationDebt);

        if (resValidationDebt == '') {
            let ncodeStatus = '0';

            if (this.flagEmailNull == false) {
                ncodeStatus = await this.updateClient();
            }

            if (ncodeStatus == '0') {
                this.flagEmailNull = true;
                this.emitirContrac();
            } else {
                this.loading = false;
                swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
            }

        } else {
            this.loading = false;
            swal.fire('Información', resValidationDebt, 'error');
        }
    }

    async ValidateDebt(resAgency) {

        let smessage = '';
        console.log(resAgency)

        if (resAgency == '') {
            this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.contractingdata.P_SCLIENT, 1); //AVS - Mejoras SCTR - 1 - Emision 
            if (this.validateDebtResponse.lockMark == 1) { ////AVS - Mejoras SCTR - Validacion de deudas
                smessage = 'Para emitir la poliza se necesita pago por adelantado.';
            }
        }

        return smessage;
    }

    async validateAgencySCTR() {
        let smessage = '';

        let data = {
            nbranch: this.nbranch,
            nproduct: this.polizaEmitCab.NPRODUCT,
            ncotizacion: this.cotizacionID,
            nflagMixto: this.polizaEmitCab.NCOT_MIXTA
        }

        // if (mensaje == '') {
        await this.policyemit.validateAgencySCTR(data).toPromise().then(
            async res => {
                if (res.P_COD_ERR == 1) {
                    smessage = res.P_MESSAGE;
                    // console.log("Mensaje");
                    // console.log(mensaje);
                }
            },
            error => {
                this.loading = false;
            }
        );
        // }

        return smessage;


    }

    async validateRetroactivity(): Promise<boolean> {

        let res = await this.validateRetroactivityRules();

        const errorCodes = [1, 99];
        const validateCodes = [2];

        // this.derivaRetroactividad = res.ncode === 2;

        if (errorCodes.includes(res.ncode)) {
            await swal.fire('Información', res.smessage, 'info');
            return false;
        }

        if (validateCodes.includes(res.ncode)) {
            await swal.fire('Información', res.smessage, 'info');
        }

        return true;
    }

    async validateRetroactivityRules(): Promise<any> {
        this.loading = true;
        let data: any = {
            scodProcess: this.processID,
            ddate_ini: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
            ddate_fin: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
            namount_total: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + Number(current.planilla), 0),
            nflag_attach: this.files.length > 0 ? 1 : 0,
            ntype_valid: 1,
            nmonth_exp: this.polizaEmit.facturacionVencido == true ? 1 : 0,
            sclient_type: this.contractingdata.P_SISCLIENT_GBD,
            stransac: 'EM',
            nid_cotizacion: this.cotizacionID,
            idProfile: this.perfil_tip
        };

        // Simplificación: Retorna directamente la respuesta de la promesa
        try {
            const response = await this.quotationService.getValidateRetroactivityRules(data).toPromise();
            return response;
        } finally {
            this.loading = false;
        }
    }

    async equivalenciaMapfre(codProtecta: any, keyTable: any, keyStore: any, required: any = 1) {
        let response: any = {};
        const data: any = {};
        data.codProtecta = codProtecta;
        data.keyTable = keyTable;
        data.keyStore = keyStore;

        await this.quotationService.getEquivalente(data).toPromise().then(res => {
            response = res;
            if (res.codError === '1' && required === 1) {
                this.mensajeEquivalente = this.mensajeEquivalente + '<br>' + res.mensaje;
            }
        });
        return response.codMapfre;
    }

    async updateClient() {
        let ncode = '0';
        if (this.contractingdata != undefined) {
            if (this.flagEmailNull == false) {
                this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.contractingdata.P_TipOper = 'INS';
                this.contractingdata.P_NCLIENT_SEG = -1;
                const contractingEmail: any = {};
                contractingEmail.P_CLASS = '';
                contractingEmail.P_DESTICORREO = 'Correo Personal';
                contractingEmail.P_NROW = 1;
                contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                contractingEmail.P_SE_MAIL = this.polizaEmitCab.CORREO;
                contractingEmail.P_SORIGEN = 'SCTR';
                contractingEmail.P_SRECTYPE = '4';
                contractingEmail.P_TipOper = '';
                this.contractingdata.EListEmailClient.push(contractingEmail);
                if (!this.template.ins_mapfre) {
                    this.contractingdata.EListAddresClient = null;
                    this.contractingdata.EListPhoneClient = null;
                    this.contractingdata.EListContactClient = null;
                    this.contractingdata.EListCIIUClient = null;
                }

                await this.clientInformationService.validateContractingData(this.contractingdata).toPromise().then(
                    async res => {
                        ncode = res.P_NCODE;
                    },
                    error => { ncode = '1'; }
                );
            } else {
                ncode = '0';
            }
        } else {
            ncode = '1';
        }

        return ncode;
    }

    async dataEmision(idProcessVisa = 0) {
        this.mensajeEquivalente = '';
        this.savedPolicyList = [];

        if (this.template.ins_mapfre && this.nroMovimientoEPS != null) {
            this.emisionMapfre = {}
            this.emisionMapfre.numCotizacion = this.nroCotizacionEps;
            this.emisionMapfre.nroMovimientoCarga = this.nroMovimientoEPS;
            this.emisionMapfre.cabecera = {};
            this.emisionMapfre.cabecera.keyService = 'emitir';
            this.emisionMapfre.poliza = {};
            this.emisionMapfre.poliza.mcaPolizaMesAdelantado = 'S'; // Facturación adelantada
            this.emisionMapfre.contratante = {};
            this.emisionMapfre.contratante.tipDocum = await this.equivalenciaMapfre(this.contractingdata.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey');
            this.emisionMapfre.contratante.codDocum = this.contractingdata.P_SIDDOC;
            this.emisionMapfre.contratante.mcaFisico = this.contractingdata.P_NPERSON_TYP === '1' ? 'S' : 'N'; // Marca persona natural
            this.emisionMapfre.contratante.Nombre = this.contractingdata.P_NPERSON_TYP === '1' ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
            this.emisionMapfre.contratante.apePaterno = this.contractingdata.P_NPERSON_TYP === '1' ? CommonMethods.validateTextNull(this.contractingdata.P_SLASTNAME) : null;
            this.emisionMapfre.contratante.apeMaterno = this.contractingdata.P_NPERSON_TYP === '1' ? CommonMethods.validateTextNull(this.contractingdata.P_SLASTNAME2) : null;
            this.emisionMapfre.contratante.email = this.polizaEmitCab.CORREO;
            this.emisionMapfre.contratante.tlfNumero = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : '0';
            this.emisionMapfre.contratante.tlfMovil = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : '0';
            this.emisionMapfre.contratante.tipCargo = this.contractingdata.P_NPERSON_TYP === '2' && this.contractingdata.EListContactClient.length > 0 ? await this.equivalenciaMapfre(this.contractingdata.EListContactClient[0].P_NTIPCONT, 'cargo', 'tableKey') : null; // Persona Juridica;
            this.emisionMapfre.contratante.tipCargo = this.emisionMapfre.contratante.tipCargo === '-1' ? '41' : this.emisionMapfre.contratante.tipCargo; // default en caso no exista
            this.emisionMapfre.contratante.nomContacto = '';
            if (this.contractingdata.P_NPERSON_TYP === '2' && this.contractingdata.EListContactClient.length > 0) {
                this.emisionMapfre.contratante.nomContacto = CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SNOMBRES) + ' ' +
                    CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SAPEPAT) + ' ' +
                    CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SAPEMAT); // Persona Juridica
            } else {
                this.emisionMapfre.contratante.nomContacto = null;
            }
            this.emisionMapfre.contratante.fecNacimiento = CommonMethods.validateTextNull(this.contractingdata.P_DBIRTHDAT);
            this.emisionMapfre.contratante.mcaSexo = this.contractingdata.P_NPERSON_TYP === '1' ? this.contractingdata.P_SSEXCLIEN === '1' ? '0' : '1' : null;
            this.emisionMapfre.contratante.codProfesion = this.contractingdata.P_NPERSON_TYP === '1' ? await this.equivalenciaMapfre(this.contractingdata.P_NSPECIALITY, 'profesion', 'tableKey') : null;
            this.emisionMapfre.contratante.codProfesion = this.emisionMapfre.contratante.codProfesion === '-1' ? '0' : this.emisionMapfre.contratante.codProfesion;
            // this.emisionMapfre.contratante.tipActEconomica = this.contractingdata.P_NPERSON_TYP == '2' && this.contractingdata.EListCIIUClient.length > 0 ? await this.equivalenciaMapfre(this.contractingdata.EListCIIUClient[0].P_SCIIU, 'actividadEconomica', 'tableKey') : null // Persona juridica
            this.emisionMapfre.contratante.tipActEconomica = this.contractingdata.P_NPERSON_TYP === '2' ? '9999' : null; // Persona juridica
            this.emisionMapfre.contratante.estadoCivil = this.contractingdata.P_NPERSON_TYP === '2' ? null : this.contractingdata.P_NCIVILSTA === '5' ? 'S' : await this.equivalenciaMapfre(this.contractingdata.P_NCIVILSTA, 'estadoCivil', 'tableKey');
            this.emisionMapfre.contratante.nacionalidad = await this.equivalenciaMapfre(this.contractingdata.P_NNATIONALITY, 'nacionalidad', 'tableKey');
            if (this.contractingdata.EListAddresClient.length > 0) {
                this.emisionMapfre.contratante.direccion = [];
                const itemDireccion: any = {};
                itemDireccion.codPais = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NCOUNTRY, 'nacionalidad', 'tableKey');
                itemDireccion.codDepartamento = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NPROVINCE, 'departamento', 'ubigeoKey');
                itemDireccion.codProvincia = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NLOCAL, 'provincia', 'ubigeoKey');
                itemDireccion.codDistrito = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NMUNICIPALITY, 'distrito', 'ubigeoKey');
                itemDireccion.tipDomicilio = this.contractingdata.EListAddresClient[0].P_STI_DIRE != null ? await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_DIRE, 'tipDomicilio', 'tableKey') : '25';
                itemDireccion.nomDomicilio = this.contractingdata.EListAddresClient[0].P_SNOM_DIRECCION != null ? this.contractingdata.EListAddresClient[0].P_SNOM_DIRECCION.substr(0, 39) : this.contractingdata.EListAddresClient[0].P_SDESDIREBUSQ.substr(0, 39);
                itemDireccion.tipNumero = this.contractingdata.EListAddresClient[0].P_STI_BLOCKCHALET != null ? await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_BLOCKCHALET, 'tipNumero', 'tableKey') : '1';
                itemDireccion.descNumero = this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION != null || this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION !== '' ? this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION : '0';
                itemDireccion.tipInterior = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_INTERIOR, 'tipInterior', 'tableKey');
                itemDireccion.nroInterior = this.contractingdata.EListAddresClient[0].P_SNUM_INTERIOR;
                itemDireccion.tipZona = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_CJHT, 'tipZona', 'tableKey');
                itemDireccion.nomZona = this.contractingdata.EListAddresClient[0].P_SNOM_CJHT == null ? '' : this.contractingdata.EListAddresClient[0].P_SNOM_CJHT.substr(0, 29);
                itemDireccion.refDireccion = this.contractingdata.EListAddresClient[0].P_SREFERENCE == null ? '' : this.contractingdata.EListAddresClient[0].P_SREFERENCE.substr(0, 39);
                itemDireccion.codigoPostal = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NMUNICIPALITY, 'codPostal', 'ubigeoKey', 0);
                itemDireccion.codigoPostal = itemDireccion.codigoPostal === '-1' ? '' : itemDireccion.codigoPostal;
                this.emisionMapfre.contratante.direccion.push(itemDireccion);
            }
            this.emisionMapfre.constancia = {};
            this.emisionMapfre.constancia.ubicacionObraSalud = this.polizaEmitCab.DES_TIPO_SEDE;

        }

        if (this.mensajeEquivalente !== '') {
            this.prePayment = false;
            this.loading = false;
            swal.fire('Información', this.mensajeEquivalente, 'error');
            return;
        }

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Salud - Inicio', 1);
        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'this.saludList.length : ' + this.saludList.length, 1);

        if (this.saludList.length > 0) {
            this.savedPolicyEmit = {};
            this.savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
            this.savedPolicyEmit.P_NID_PROC = this.processID; // Proceso
            this.savedPolicyEmit.P_NBRANCH = this.saludID.nbranch; // Producto
            this.savedPolicyEmit.P_NPRODUCT = '2'; // Producto
            this.savedPolicyEmit.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion; // Tipo Renovacion
            this.savedPolicyEmit.P_DSTARTDATE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
            this.savedPolicyEmit.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
            this.savedPolicyEmit.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago // Frecuencia Pago
            /*if (this.flagDirecto == 1 && this.valMixSAPSA == 1) {
                this.savedPolicyEmit.P_SFLAG_FAC_ANT = 1; //INTERCONEXION SABSA - AVS 15/08/2023 
            } else {*/
            this.savedPolicyEmit.P_SFLAG_FAC_ANT = this.polizaEmit.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
            //}
            this.savedPolicyEmit.P_FACT_MES_VENCIDO = this.polizaEmit.facturacionVencido == true ? 1 : 0; // Facturacion Vencida
            this.savedPolicyEmit.P_NPREM_NETA = this.totalNetoSaludSave; // Prima Mensual
            this.savedPolicyEmit.P_IGV = this.igvSaludSave; // IGV
            this.savedPolicyEmit.P_NPREM_BRU = this.brutaTotalSaludSave; // Total bruta
            this.savedPolicyEmit.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); // Comentario
            this.savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario
            this.savedPolicyEmit.P_NIDPAYMENT = idProcessVisa; // id proceso visa
            //Ini - RI

            this.savedPolicyEmit.P_NAMO_AFEC = this.DataSCTRSALUD.P_NAMO_AFEC;
            this.savedPolicyEmit.P_NIVA = this.DataSCTRSALUD.P_NIVA;
            this.savedPolicyEmit.P_NAMOUNT = this.DataSCTRSALUD.P_NAMOUNT;

            this.savedPolicyEmit.P_NDE = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);
            this.savedPolicyEmit.P_DSTARTDATE_ASE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
            this.savedPolicyEmit.P_DEXPIRDAT_ASE = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
            //Fin - RI
            this.savedPolicyEmit.P_NCOT_MIXTA = this.polizaEmitCab.NCOT_MIXTA; //AVS INTERCONEXION SABSA 17012023
            this.savedPolicyEmit.P_PAYPF = 2; //AVS INTERCONEXION SABSA 17012023
            this.savedPolicyEmit.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA; //AVS INTERCONEXION SABSA 06092023
            this.savedPolicyEmit.P_SDELIMITER = this.polizaEmitCab.DELIMITACION ? 1 : 0; //AVS INTERCONEXION SABSA 06092023
            this.savedPolicyEmit.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA
            this.savedPolicyEmit.sede = this.polizaEmitCab.DES_SEDE;
            //Ini RQ2025-4
            this.savedPolicyEmit.P_NIDCLIENTLOCATION = this.polizaEmitCab.COD_SEDE;
            //Fin RQ2025-4
            this.savedPolicyEmit.P_SCOD_ACTIVITY = this.polizaEmitCab.ACT_TECNICA;
            this.savedPolicyEmit.P_SCOD_CIUU = this.polizaEmitCab.COD_ACT_ECONOMICA;

            if (this.nroMovimientoEPS !== null) {
                this.savedPolicyEmit.P_NID_PROC_EPS = this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 18092023
            } else {
                this.savedPolicyEmit.P_NID_PROC_EPS = '';
            }

            this.savedPolicyEmit.P_NPREM_MIN_EPS = ''; //AVS INTERCONEXION SABSA 18092023
            for (const item of this.saludList) {
                if (item.prima_min !== null && item.prima_min !== undefined) {
                    this.savedPolicyEmit.P_NPREM_MIN_EPS = item.prima_min;
                    break;
                }
            }

            this.savedPolicyList.push(this.savedPolicyEmit);
        }

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Salud - Fin', 1);

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Pension - Inicio', 1);
        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'this.pensionList.length : ' + this.pensionList.length, 1);

        if (this.pensionList.length > 0) {
            this.savedPolicyEmit = {};
            this.savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; //Cotizacion
            this.savedPolicyEmit.P_NID_PROC = this.processID; // Proceso
            this.savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch; // Producto
            this.savedPolicyEmit.P_NPRODUCT = '1'; // Producto
            this.savedPolicyEmit.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion; //Tipo Renovacion
            this.savedPolicyEmit.P_DSTARTDATE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
            this.savedPolicyEmit.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
            this.savedPolicyEmit.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago // Frecuencia Pago
            /*if (this.flagDirecto == 1 && this.valMixSAPSA == 1 && this.currentUser.profileId != 136) {
                this.savedPolicyEmit.P_SFLAG_FAC_ANT = 1; //INTERCONEXION SABSA - AVS 15/08/2023 
            } else {*/
            this.savedPolicyEmit.P_SFLAG_FAC_ANT = this.polizaEmit.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
            //}
            this.savedPolicyEmit.P_FACT_MES_VENCIDO = this.polizaEmit.facturacionVencido == true ? 1 : 0; // Facturacion Vencida
            this.savedPolicyEmit.P_NPREM_NETA = this.totalNetoPensionSave; // Prima Mensual
            this.savedPolicyEmit.P_IGV = this.igvPensionSave; // IGV
            this.savedPolicyEmit.P_NPREM_BRU = this.brutaTotalPensionSave; // Total bruta
            this.savedPolicyEmit.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); //Comentario
            this.savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario
            this.savedPolicyEmit.P_NIDPAYMENT = idProcessVisa; // id proceso visa
            //Ini - RI
            this.savedPolicyEmit.P_NAMO_AFEC = this.DataSCTRPENSION.P_NAMO_AFEC;
            this.savedPolicyEmit.P_NIVA = this.DataSCTRPENSION.P_NIVA;
            this.savedPolicyEmit.P_NAMOUNT = this.DataSCTRPENSION.P_NAMOUNT;

            this.savedPolicyEmit.P_NDE = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
            this.savedPolicyEmit.P_DSTARTDATE_ASE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
            this.savedPolicyEmit.P_DEXPIRDAT_ASE = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
            //Fin - RI
            this.savedPolicyEmit.P_NCOT_MIXTA = this.polizaEmitCab.NCOT_MIXTA; //AVS INTERCONEXION SABSA 17012023
            this.savedPolicyEmit.P_PAYPF = 2; //AVS INTERCONEXION SABSA 17012023
            this.savedPolicyEmit.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA; //AVS INTERCONEXION SABSA 06092023
            this.savedPolicyEmit.P_SDELIMITER = this.polizaEmitCab.DELIMITACION ? 1 : 0; //AVS INTERCONEXION SABSA 06092023
            this.savedPolicyEmit.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA
            //Ini RQ2025-4
            this.savedPolicyEmit.P_NIDCLIENTLOCATION = this.polizaEmitCab.COD_SEDE;
            //Fin RQ2025-4
            this.savedPolicyEmit.P_SCOD_ACTIVITY = this.polizaEmitCab.ACT_TECNICA;
            this.savedPolicyEmit.P_SCOD_CIUU = this.polizaEmitCab.COD_ACT_ECONOMICA;
            if (this.nroMovimientoEPS !== null) {
                this.savedPolicyEmit.P_NID_PROC_EPS = this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 18092023
            } else {
                this.savedPolicyEmit.P_NID_PROC_EPS = '';
            }
            this.savedPolicyEmit.P_NPREM_MIN_EPS = ''; //AVS INTERCONEXION SABSA 18092023
            this.savedPolicyList.push(this.savedPolicyEmit);
        }

        this.saveLog('Emitir Póliza - '  + this.nrocotizacion, 'Validando Lista de Pension - Fin', 1);
    }


    async emitirContrac() {
        if (this.polizaEmit.facturacionVencido == true) {
            // this.loading = false;
            let myFormData: FormData = new FormData()
            this.savedPolicyList = [];
            this.ListainsertEmit = [];  //AVS - INTERCONEXION SABSA
            await this.dataEmision(); // this.savedPolicyList
            await this.insertEmitDet();  //AVS - INTERCONEXION SABSA this.ListainsertEmit

            if (this.files.length > 0) {
                this.files.forEach(file => {
                    myFormData.append('adjuntos', file, file.name);
                });
            }

            myFormData.append('objeto', JSON.stringify(this.savedPolicyList));
            myFormData.append('emisionMapfre', JSON.stringify(this.emisionMapfre));
            myFormData.append('objetoDet', JSON.stringify(this.ListainsertEmit));

            const data: any = {}
            data.P_NID_PROC_EPS = (this.dataTrama.codMixta == 1) ? this.nroMovimientoEPS : (this.dataTrama.nroProduct == 2) ? this.processID : ""
            data.P_NID_PROC_SCTR = (this.dataTrama.codMixta == 1) ? this.processID : (this.dataTrama.nroProduct == 2) ? "" : this.processID
            data.P_NID_COTIZACION = this.dataTrama.nroCotizacion
            data.P_NTYPE_TRANSAC = this.dataTrama.type_mov
            data.P_MENSAJE_TR = "TRAMA ACTUALIZADA"
            
            this.policyemit.savePolicyEmit(myFormData)
                .subscribe((res: any) => {
                    this.loading = false;
                    if (res.P_COD_ERR == 0) {
                        
                        this.getUpdateEps(data)
                        
                        this.flagEmailNull = true;
                        let policyPension = 0;
                        let policySalud = 0;
                        let constancia = 0

                        policyPension = Number(res.P_POL_PENSION);
                        policySalud = Number(res.P_POL_SALUD);
                        constancia = Number(res.P_NCONSTANCIA);

                        this.NroPension = policyPension;
                        this.NroSalud = policySalud;

                        if (policyPension > 0 && policySalud > 0) {

                            swal.fire({
                                title: 'Información',
                                text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' y la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                                .then(async (result) => {
                                    if (result.value) {
                                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                    }
                                });
                        }
                        else {
                            if (policyPension > 0) {
                                swal.fire({
                                    title: 'Información',
                                    text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' con Constancia N° ' + constancia,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                    .then(async (result) => {
                                        if (result.value) {
                                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                        }
                                    });
                            }
                            if (policySalud > 0) {
                                let mensaje = ''
                                if (this.epsItem.NCODE == 1) {
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia;
                                }
                                if (this.epsItem.NCODE == 2) {
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud;
                                }
                                if (this.epsItem.NCODE == 3) {
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia;
                                }
                                swal.fire({
                                    title: 'Información',
                                    text: mensaje,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                    .then(async (result) => {
                                        if (result.value) {
                                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                        }
                                    });
                            }
                        }
                    } else {
                        swal.fire({
                            title: 'Información',
                            text: res.P_MESSAGE,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                    }

                });
            // }
            // });
        } else {
            this.loading = false;
            if (this.polizaEmitCab.NPRODUCT != 2 || this.polizaEmitCab.NCOT_MIXTA == 1) {
                if (this.profileEsp.some(ProfileEsp => ProfileEsp.Profile.toString() == this.perfilActual)) {
                    const response: any = await this.ValidateRetroactivity();
                    if (response.P_NCODE == 4) {
                        await swal.fire('Información', response.P_SMESSAGE, 'info');
                        return;
                    }
                }
            }

            this.objetoTrx();
        }
    }

    formatDate(date: Date): string {
        let anio = date.getFullYear();
        let mes = date.getMonth() + 1;
        let dia = date.getDate();
        return `${dia}/${mes}/${anio}`;
    }

    validarArchivos() {
        this.clickValidarArchivos = false;
        this.archivosJson = [];
        this.tamañoArchivo = 0;
        this.flagExtension = false;
        for (let i = 0; i < this.files.length; i++) {
            let size = (this.files[i].size / 1024 / 1024).toFixed(3);
            let sizeNumber = Number(size);
            this.tamañoArchivo = this.tamañoArchivo + sizeNumber;
            var extensiones_permitidas = ['.jpeg', '.jpg', '.png', '.bmp', '.pdf', '.txt', '.doc', '.xls', '.xlsx', '.docx', '.xlsm', '.xltx', '.xltm', '.xlsb', '.xlam', '.docm', '.dotx', '.dotm', '.pptx', '.pptm', '.potx', '.potm', '.ppam', '.ppsx', '.ppsm', '.sldx', '.sldm', '.thmx', '.zip', '.rar'];
            var rutayarchivo = this.files[i].name;
            var ultimo_punto = this.files[i].name.lastIndexOf('.');
            var extension = rutayarchivo.slice(ultimo_punto, rutayarchivo.length);
            if (this.flagExtension === false) {
                if (extensiones_permitidas.indexOf(extension) == -1) {
                    this.flagExtension = true;
                }
            }
        }
        if (this.flagExtension) {
            this.archivosJson.push({
                error: 'Solo se aceptan imagenes y documentos'
            })
            return;
        }
        if (this.tamañoArchivo > 10) {
            this.archivosJson.push({
                error: 'Los archivos en total no deben de tener mas de 10 mb'
            })
            return;
        }
    }

    async validarTipoRenovacion(event: any) {
        if (this.template.ins_mapfre) {
            this.pensionList = []
            this.saludList = []
            this.tasasList = []
            this.primaTotalPension = 0;
            this.primatotalSalud = 0;
        }

        await this.configFechas()
    }

    async habilitarFechas() {
        this.flagTipoR = false;
        this.activacion = false;
        this.disabledFecha = true;
        this.errorFrecPago = false;

        await this.obtenerFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
        await this.configFechas()
    }

    async configFechas() {
        var fechadesde = this.desde.nativeElement.value.split('/');
        var fechahasta = this.hasta.nativeElement.value.split('/');
        var fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
        var fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
        let fechad = new Date(fechaDes);
        let fechah = new Date(fechaHas);

        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionEspecial) { //Especial
            this.monthPerPay = 0
            fechad.setDate(fechad.getDate() + 1);
            this.polizaEmitCab.bsValueFinMin = new Date(fechad);
            if (fechad.getTime() > fechah.getTime()) {
                this.polizaEmitCab.bsValueFin = new Date(fechad);
            }
            this.disabledFecha = false;
        }
        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionEspecialEstado) { //Especial Estado
            this.monthPerPay = 0
            fechad.setDate(fechad.getDate() + 1);
            this.polizaEmitCab.bsValueFinMin = new Date(fechad);
            if (fechad.getTime() > fechah.getTime()) {
                this.polizaEmitCab.bsValueFin = new Date(fechad);
            }
            this.disabledFecha = false;
        }
        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionMensual) { //Mensual
            this.monthPerPay = 1
            fechad.setMonth(fechad.getMonth() + 1);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.polizaEmitCab.bsValueFin = new Date(fechad);
            this.flagFechaMenorMayorFin = true;
        }
        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionBiMensual) { //Bimestral
            this.monthPerPay = 2
            fechad.setMonth(fechad.getMonth() + 2);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.polizaEmitCab.bsValueFin = new Date(fechad);
            this.flagFechaMenorMayorFin = true;
        }
        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionTriMensual) { //Trimestral
            this.monthPerPay = 3
            fechad.setMonth(fechad.getMonth() + 3);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.polizaEmitCab.bsValueFin = new Date(fechad);
            this.flagFechaMenorMayorFin = true;
        }
        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionSemestral) { //Semestral
            this.monthPerPay = 6
            fechad.setMonth(fechad.getMonth() + 6);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.polizaEmitCab.bsValueFin = new Date(fechad);
            this.flagFechaMenorMayorFin = true;
        }

        if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionAnual) { //Anual
            this.monthPerPay = 12
            fechad.setFullYear(fechad.getFullYear() + 1)
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.polizaEmitCab.bsValueFin = new Date(fechad);
            this.flagFechaMenorMayorFin = true;
        }

        if (this.nrocotizacion != null && this.nrocotizacion !== undefined && this.nrocotizacion.toString().trim() != '') {
            if (this.template.ins_alertaGrati) {
                if (this.polizaEmitCab.bsValueIni !== undefined && this.polizaEmitCab.bsValueFin !== undefined) {
                    const meses = await this.getMesesGrati();
                    this.alertGrati = await CommonMethods.alertaGratificacion(this.polizaEmitCab.bsValueIni, this.polizaEmitCab.bsValueFin, meses, this.variable.var_alertGratificacion)
                    if (this.alertGrati !== '') {
                        this.toastr.warning(this.variable.var_alertToastGratificacion, 'Importante!', { timeOut: 20000, toastClass: 'rmaClass ngx-toastr' });
                    } else {
                        this.toastr.clear();
                    }
                }
            }
        }

        if (this.polizaEmitCab.CORREO != '' && this.cotizacionID != '' && this.excelSubir != undefined) {
            this.contadorTrama++;
            if (this.contadorTrama == 1) {
                this.validarExcel()
            } else {
                this.contadorTrama = 0
            }
        }
    }

    async getMesesGrati() {
        let response = []
        await this.clientInformationService.getVariables('mesesGrati').toPromise().then(
            res => {
                response = res.split(',')
            }
        );
        return response
    }

    textValidate(event: any, typeText) {
        CommonMethods.textValidate(event, typeText)
    }

    downloadFile(filePath: string) {  //Descargar archivos de cotización
        this.othersService.downloadFile(filePath).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    var newBlob = new Blob([res], { type: 'application/pdf' });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);
                    var link = document.createElement('a');
                    link.href = data;
                    link.download = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                    setTimeout(function () {
                        window.URL.revokeObjectURL(data);
                        link.remove();
                    }, 100);
                }

            },
            err => {
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    listToString(list: String[]): string {
        let output = '';
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + ' <br>'
            });
        }
        return output;
    }

    async CalculateAjustedAmounts() {
        let totalPolicyAmount = 0.0;
        let totalPolicyPension = 0.0;
        let totalPolicySalud = 0.0;
        await this.getMonthsSCTR(); //AVS Nueva Estimación De Cálculo 23/12/2022

        totalPolicyPension = await this.getAjustedAmounts(this.pensionID.nbranch, this.pensionID.id, this.totalNetoPensionSave);
        totalPolicySalud = await this.getAjustedAmounts(this.saludID.nbranch, this.saludID.id, this.totalNetoSaludSave);

        this.SaludBruta = totalPolicySalud;  //AVS - INTERCONEXION SABSA 
        this.PensionBruta = totalPolicyPension;  //AVS - INTERCONEXION SABSA

        totalPolicyAmount = CommonMethods.formatValor((Number(totalPolicyPension) + Number(totalPolicySalud)), 2)

        return totalPolicyAmount;
    }

    async getAjustedAmounts(nBranch: Number, nProduct: Number, namo_afec: Number) {

        //AVS Nueva Estimación De Cálculo 23/12/2022
        let totalPolicy = 0.0;
        this.monthsSCTR = this.montos_sctr.P_RESULT;
        const data: any = {};
        data.P_NBRANCH = nBranch;
        data.P_NPRODUCT = nProduct;
        data.P_NAMO_AFEC_INI = CommonMethods.formatValor(Number(namo_afec) * this.monthsSCTR, 2);

        await this.policyemit.AjustedAmounts(data).toPromise().then(
            res => {
                // console.log(res);
                totalPolicy = res.P_NAMOUNT;
                if (res.P_NAMOUNT != 0) {
                    if (this.codProducto == 2 && nProduct == this.pensionID.id) {
                        const sctr: any = {};
                        sctr.P_NAMOUNT = res.P_NAMOUNT;
                        sctr.P_NAMO_AFEC = res.P_NAMO_AFEC;
                        sctr.P_NDE = res.P_NDE;
                        sctr.P_NIVA = res.P_NIVA;
                        sctr.P_NPRODUCT = nProduct;
                        this.DataSCTRPENSION = sctr;
                    } else if (this.codProducto == 2 && nProduct == this.saludID.id) {
                        const sctr: any = {};
                        sctr.P_NAMOUNT = res.P_NAMOUNT;
                        sctr.P_NAMO_AFEC = res.P_NAMO_AFEC;
                        sctr.P_NDE = res.P_NDE;
                        sctr.P_NIVA = res.P_NIVA;
                        sctr.P_NPRODUCT = nProduct;
                        this.DataSCTRSALUD = sctr;
                    }
                }
            },
            err => {
                console.log(err);
            }
        );
        return totalPolicy;
    }

    //AVS - INTERCONEXION SABSA
    async insertEmitDet() {
        this.ListainsertEmit = [];

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Pension - Inicio', 1);
        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'this.pensionList.length : ' + this.pensionList.length, 1);

        if (this.pensionList.length > 0) {
            // var pensionWorkes = this.pensionList.filter(x => Number(x.totalWorkes) > 0);
            this.pensionList.forEach((item, index) => {
                try {
                    this.dataQuotation = {};
                    this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
                    this.dataQuotation.NPRODUCT = '1';
                    this.dataQuotation.NMODULEC = item.nmodulec;
                    this.dataQuotation.NNUM_TRABAJADORES = item.totalWorkes;
                    this.dataQuotation.NMONTO_PLANILLA = Number(item.planilla);
                    this.dataQuotation.NTASA_CALCULADA = Number(item.rate);
                    this.dataQuotation.NTASA_PROP = 0; //Number(item.planProp) > 0 ? Number(item.planProp) : Number(item.rate);
                    this.dataQuotation.NTASA_AUTOR = Number(item.rate);
                    this.dataQuotation.NPREMIUM_MIN = this.infoPension[0].prima_min;
                    this.dataQuotation.NPREMIUM_MIN_PR = 0; // this.infoPension[0].prima_minAutBk;
                    this.dataQuotation.NPREMIUM_MIN_AU = this.infoPension[0].prima_min;
                    this.dataQuotation.NPREMIUM_END = this.infoPension[0].prima_end;
                    this.dataQuotation.NSUM_PREMIUMN = this.totalNetoPensionSave;
                    this.dataQuotation.NSUM_IGV = this.igvPensionSave;
                    this.dataQuotation.NSUM_PREMIUM = this.brutaTotalPensionSave;
                    this.dataQuotation.NUSERCODE = this.usercode;
                    this.dataQuotation.NRATE = Number(item.rate);
                    this.dataQuotation.NDISCOUNT = this.infoPension[0].discount;
                    this.dataQuotation.NACTIVITYVARIATION = this.infoPension[0].activityVariation;
                    this.dataQuotation.SSTATREGT = 1;
                    this.dataQuotation.NMODULEC_FINAL = item.nmodulec;
                    this.dataQuotation.NAMO_AFEC = this.infoPension[0].prima_end;
                    this.dataQuotation.NIVA = this.igvPension;
                    this.dataQuotation.NAMOUNT = this.brutaTotalPension;
                    this.dataQuotation.NDE = 0;
                    this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
                    this.dataQuotation.NPAYFREQ = this.savedPolicyEmit.P_NPAYFREQ;
                    this.dataQuotation.NID_PROC = this.savedPolicyEmit.P_NID_PROC;
                    this.dataQuotation.P_TIPO_COT = this.polizaEmitCab.NRATETYPE;
                    this.ListainsertEmit.push(this.dataQuotation);
                } catch (error) {
                    this.errorLogList.push({
                        index,
                        data: item,
                        error: {
                            message: error instanceof Error ? error.message : String(error),
                            stack: error instanceof Error ? error.stack : null
                        }
                    });
                }
            });
        }

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Pension - Fin', 1);

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Salud - Inicio', 1);
        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'this.saludList.length : ' + this.pensionList.length, 1);

        if (this.saludList.length > 0) {
            // var saludWorkes = this.saludList.filter(x => Number(x.totalWorkes) > 0);
            this.saludList.forEach((item, index) => {
                try {
                    this.dataQuotation = {};
                    this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
                    this.dataQuotation.NPRODUCT = '2';
                    this.dataQuotation.NMODULEC = item.nmodulec;
                    this.dataQuotation.NNUM_TRABAJADORES = item.totalWorkes;
                    this.dataQuotation.NMONTO_PLANILLA = Number(item.planilla);
                    this.dataQuotation.NTASA_CALCULADA = Number(item.rate);
                    this.dataQuotation.NTASA_PROP = 0; //Number(item.planProp) > 0 ? Number(item.planProp) : Number(item.rate);
    
                    this.dataQuotation.NTASA_AUTOR = Number(item.rate);
                    this.dataQuotation.NPREMIUM_MIN = this.infoSalud[0].prima_min;
                    this.dataQuotation.NPREMIUM_MIN_PR = 0; //this.infoSalud[0].prima_minAutBk;
                    this.dataQuotation.NPREMIUM_MIN_AU = this.infoSalud[0].prima_min;
                    this.dataQuotation.NPREMIUM_END = this.infoSalud[0].prima_end;
    
                    this.dataQuotation.NSUM_PREMIUMN = this.totalNetoSaludSave;
                    this.dataQuotation.NSUM_IGV = this.igvSaludSave;
                    this.dataQuotation.NSUM_PREMIUM = this.brutaTotalSaludSave;
    
                    this.dataQuotation.NUSERCODE = this.usercode;
                    this.dataQuotation.NRATE = Number(item.rate);
                    this.dataQuotation.NDISCOUNT = this.infoSalud[0].discount;
                    this.dataQuotation.NACTIVITYVARIATION = this.infoSalud[0].activityVariation;
                    this.dataQuotation.SSTATREGT = 1;
                    this.dataQuotation.NMODULEC_FINAL = item.nmodulec;
                    this.dataQuotation.NAMO_AFEC = this.infoSalud[0].prima_end;
                    this.dataQuotation.NIVA = this.igvSalud;
                    this.dataQuotation.NAMOUNT = this.brutaTotalSalud;
                    this.dataQuotation.NDE = 0;
                    this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
                    this.dataQuotation.NPAYFREQ = this.savedPolicyEmit.P_NPAYFREQ;
                    this.dataQuotation.NID_PROC = this.savedPolicyEmit.P_NID_PROC;
                    this.dataQuotation.P_TIPO_COT = this.polizaEmitCab.NRATETYPE;
                    this.ListainsertEmit.push(this.dataQuotation);
                } catch (error) {
                    this.errorLogList.push({
                        index,
                        data: item,
                        error: {
                            message: error instanceof Error ? error.message : String(error),
                            stack: error instanceof Error ? error.stack : null
                        }
                    });
                }
            });
        }

        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Salud - Fin', 1);
        this.saveLog('Emitir Póliza - ' + this.nrocotizacion, 'Validando Lista de Errores :' + JSON.stringify(this.errorLogList, null, 2), 1);

    }

    async ValidateRetroactivity(operacion: number = 1) {
        const response: any = {};
        let trx = '';
        const dataQuotation: any = {};
        dataQuotation.P_NBRANCH = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
        dataQuotation.P_NPRODUCT = JSON.parse(localStorage.getItem('codProducto'))['productId'];
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        dataQuotation.TrxCode = "EM";
        dataQuotation.RetOP = operacion;
        dataQuotation.FlagCambioFecha = 1;
        const myFormData: FormData = new FormData();
        myFormData.append('objeto', JSON.stringify(dataQuotation));
        await this.quotationService.ValidateRetroactivity(myFormData).toPromise().then(
            res => {
                response.P_SAPROBADO = res.P_SAPROBADO;
                response.P_NCODE = res.P_NCODE;
                response.P_SMESSAGE = res.P_SMESSAGE;
            }
        );
        return response;
    }

    async getValidateDebt(branchCode, productCode, clientCode, transactionCode): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.transactionCode = transactionCode;
        validateDebtRequest.profileCode = Number(this.perfilActual);
        validateDebtRequest.nintermed = JSON.parse(localStorage.getItem('currentUser'))['canal'];

        await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
            res => {
                validateDebtResponse = res;
            }
        );
        return validateDebtResponse;
    }

    async getValidateLock(request: ValidateLockRequest): Promise<ValidateLockReponse> {
        let validateLockRespone: ValidateLockReponse = {};
        await this.collectionsService.validateLock(request).toPromise().then(
            res => {
                validateLockRespone = res;
            },
            err => {
            }
        );
        return validateLockRespone;
    }

    async getMonthsSCTR() { //AVS Nueva Estimación De Cálculo 23/12/2022

        let totalMonths = 0;
        let monthsSCTR: any = {};
        monthsSCTR.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        monthsSCTR.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        monthsSCTR.npayfreq = Number(this.polizaEmitCab.tipoRenovacion);

        await this.policyemit.GetMonthsSCTR(monthsSCTR).toPromise().then(
            res => {
                this.montos_sctr = res;
            },
            err => {
                console.log(err);
            }
        );
        return totalMonths;
    }

    async obtenerPaytypeSCTR(): Promise<boolean> {
        let response: any = {};
        let prima = 0.0;

        if (this.valMixSAPSA == 1) {
            // prima = Number(this.brutaTotalPensionSave) > Number(this.brutaTotalSaludSave) ? this.brutaTotalSaludSave : this.brutaTotalPensionSave;

            response = await this.callServiceMethods(this.brutaTotalPensionSave);

            if (response.P_ORDER !== 1) {
                response = await this.callServiceMethods(this.brutaTotalSaludSave);
            }
        } else {
            if (this.polizaEmitCab.NPRODUCT == 1) {
                prima = this.brutaTotalPensionSave;
            } else {
                prima = this.brutaTotalSaludSave;
            }

            response = await this.callServiceMethods(prima);
        }

        let valTypePay = response.P_ORDER === 1 ? true : false;

        return valTypePay;
    }

    async obtenerPagoDirectoSCTR(): Promise<boolean> {
        let response: any = {};
        let p_nroCotizacion = this.nrocotizacion;
        let p_tipoTransaccion = '1';
        let prima = 0.0;

        if (this.totalNetoPensionSave === 0) {
            prima = this.totalNetoSaludSave;
        }

        if (this.totalNetoSaludSave === 0) {
            prima = this.totalNetoPensionSave;
        }

        if (this.totalNetoPensionSave !== 0 && this.totalNetoSaludSave !== 0) {
            if (this.totalNetoPensionSave == this.totalNetoSaludSave) {
                prima = this.totalNetoPensionSave;
            }
            if (this.totalNetoPensionSave < this.totalNetoSaludSave) {
                prima = this.totalNetoPensionSave;
            }
            if (this.totalNetoSaludSave < this.totalNetoPensionSave) {
                prima = this.totalNetoSaludSave;
            }
        }

        response = await this.callServicePagoDirectoSCTR(p_nroCotizacion, p_tipoTransaccion, prima);

        //let valTypePay = response.P_ORDER === 1 ? true : false;
        //P_ORDER === 1        =>  Aplica Pago Directo = false (si muestra icono Pago Directo)
        //P_ORDER === -1 o 0   =>  No Aplica Pago Directo = true (no muestra icono Pago Directo)        
        let valTypePay = response.P_ORDER === 1 ? false : true;

        return valTypePay;
    }

    async objetoTrx() {

        this.savedPolicyList = [];
        this.ListainsertEmit = [];  //AVS - INTERCONEXION SABSA

        await this.dataEmision(); // this.savedPolicyList
        await this.insertEmitDet();  //AVS - INTERCONEXION SABSA this.ListainsertEmit

        this.OpenModalPagos(this.savedPolicyList);

    }

    OpenModalPagos(paramsTrx) {

        this.polizaEmitCab.trama = {
            PRIMA_TOTAL: 0,
            NIDPROC: paramsTrx[0].P_NID_PROC,
        };

        this.polizaEmitCab.contratante = {
            email: this.polizaEmitCab.CORREO,
            NOMBRE_RAZON: this.polizaEmitCab.P_SLEGALNAME,
            COD_PRODUCT: paramsTrx.length > 1 ? this.pensionID.id : paramsTrx[0].P_NPRODUCT,
            NBRANCH: paramsTrx[0].P_NBRANCH,
            tipoDocumento: {
                Id: this.polizaEmitCab.TIPO_DOCUMENTO
            },
            tipoPersona: {
                codigo: this.polizaEmitCab.TIPO_DOCUMENTO == 1 &&
                    this.polizaEmitCab.NUM_DOCUMENTO.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.polizaEmitCab.NUM_DOCUMENTO,
            emisionDirecta: !this.polizaEmitCab.prePayment ? 'S' : 'N', // Evaluar
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };


        this.polizaEmitCab.poliza = {
            producto: {
                COD_PRODUCT: this.polizaEmitCab.NPRODUCT,
            }
        };

        let mensajeCot = '';

        this.polizaEmitCab.prepago = {
            P_NID_COTIZACION: paramsTrx[0].P_NID_COTIZACION,
            msjCotizacion: 'Se puede realizar la emisión de la cotización N° ' + paramsTrx[0].P_NID_COTIZACION + ' de las siguientes formas:',
        };


        this.polizaEmitCab.brokers = this.polizaEmitComer;
        // for (const item of this.polizaEmitCab.brokers) {
        //   item.COD_CANAL = item.CANAL;
        // }

        this.polizaEmitCab.COD_TIPO_FRECUENCIA = this.polizaEmitCab.frecuenciaPago

        this.polizaEmitCab.tipoTransaccion = 1; // this.nTransac; // rev
        this.polizaEmitCab.transac = 'EM'; // this.sAbTransac;
        this.polizaEmitCab.files = this.files;
        this.polizaEmitCab.paramsTrx = paramsTrx;
        this.polizaEmitCab.numeroCotizacion = paramsTrx[0].P_NID_COTIZACION;
        this.cotizacion = this.polizaEmitCab;

        this.modal.pagos = true;
        this.loading = true;
    }

    async savePolicyEmit(data:any){
        let myFormData: FormData = new FormData()

            if (this.files.length > 0) {
                this.files.forEach(file => {
                    myFormData.append('adjuntos', file, file.name);
                });
            }

            myFormData.append('objeto', JSON.stringify(this.savedPolicyList));
            myFormData.append('emisionMapfre', JSON.stringify(this.emisionMapfre));
            myFormData.append('objetoDet', JSON.stringify(this.ListainsertEmit));

            this.policyemit.savePolicyEmit(myFormData)
                .subscribe((res: any) => {
                    this.loading = false;
                    if (res.P_COD_ERR == 0) {
                        // Ini nidproc
                        this.getUpdateEps(data)
                        // Fin nidproc
                        this.flagEmailNull = true;
                        let policyPension = 0;
                        let policySalud = 0;
                        let constancia = 0

                        policyPension = Number(res.P_POL_PENSION);
                        policySalud = Number(res.P_POL_SALUD);
                        constancia = Number(res.P_NCONSTANCIA);

                        this.NroPension = policyPension;
                        this.NroSalud = policySalud;

                        if (policyPension > 0 && policySalud > 0) {

                            swal.fire({
                                title: 'Información',
                                text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' y la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                                .then(async (result) => {
                                    if (result.value) {
                                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                    }
                                });
                        }
                        else {
                            if (policyPension > 0) {
                                swal.fire({
                                    title: 'Información',
                                    text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' con Constancia N° ' + constancia,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                    .then(async (result) => {
                                        if (result.value) {
                                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                        }
                                    });
                            }
                            if (policySalud > 0) {
                                let mensaje = ''
                                if (this.epsItem.NCODE == 1) {
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia;
                                }
                                if (this.epsItem.NCODE == 2) {
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud;
                                }
                                if (this.epsItem.NCODE == 3) { //AVS - INTERCONEXION SABSA
                                    mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia;
                                }
                                swal.fire({
                                    title: 'Información',
                                    text: mensaje,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                    .then(async (result) => {
                                        if (result.value) {
                                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                        }
                                    });
                            }
                        }
                    } else {
                        swal.fire({
                            title: 'Información',
                            text: res.P_MESSAGE,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                    }

                });
    }

    async formaPagoElegido() {

        const data: any = {}
        data.P_NID_PROC_EPS = (this.dataTrama.codMixta == 1) ? this.nroMovimientoEPS : (this.dataTrama.nroProduct == 2) ? this.processID : ""
        data.P_NID_PROC_SCTR = (this.dataTrama.codMixta == 1) ? this.processID : (this.dataTrama.nroProduct == 2) ? "" : this.processID
        data.P_NID_COTIZACION = this.dataTrama.nroCotizacion
        data.P_NTYPE_TRANSAC = this.dataTrama.type_mov
        data.P_MENSAJE_TR = "TRAMA ACTUALIZADA"

        console.log('formaPagoElegido()');
        console.log(this.polizaEmitCab.poliza.pagoElegido);

        let dataValidate: any = {};
        dataValidate.NID_COTIZACION = data.P_NID_COTIZACION;
        dataValidate.NTYPE_TRANSAC = 1;
        dataValidate.NID_PROC_SCTR = data.P_NID_PROC_SCTR;
        dataValidate.NID_PROC_EPS = data.P_NID_PROC_EPS ;

        if (this.polizaEmitCab.poliza.pagoElegido == 'transferencia' || this.polizaEmitCab.poliza.pagoElegido == 'cash') {
            this.loading = true;
            if (this.nbranch == 77){
                dataValidate.NTYPE_VALIDATION = 2;
                this.quotationService.getValidateMovementCupon(dataValidate).subscribe(async res => {
                    if(res.NFLAGPASARELA == 0){
                        swal.fire('Información',res.MESSAGE,'error');
                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                        this.loading = false;
                        return;
                    }else{
                        // Ini nidproc
                        await this.getUpdateEps(data)
                        // Fin nidproc
                        this.onPaymentKushki();
                        this.loading = false;
                    }
                });
            }else{
                // Ini nidproc
                await this.getUpdateEps(data)
                // Fin nidproc
                this.onPaymentKushki();
                this.loading = false;
            }

                
            }

        if (this.polizaEmitCab.poliza.pagoElegido === 'efectivo') {
            this.loading = true;
            this.onPayment();
            this.loading = false;
        }

        if (this.polizaEmitCab.poliza.pagoElegido === 'directo') {
            this.loading = true;

             if (this.nbranch == 77){
                dataValidate.NTYPE_VALIDATION = 3;
                this.quotationService.getValidateMovementCupon(dataValidate).subscribe(res => {
                    if(res.NFLAGPASARELA == 0){
                        swal.fire('Información',res.MESSAGE,'error');
                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                        this.loading = false;
                        return;
                    }else{
                        this.savePolicyEmit(data);
                    }
                });
                
            }else{
                this.savePolicyEmit(data);
            }

        


        }

         if (this.polizaEmitCab.poliza.pagoElegido === 'omitir') {
             swal.fire({
                 title: 'Información',
                 text: 'Se ha generado correctamente la cotización N° ' +
                     this.polizaEmitCab.numeroCotizacion + ', podrás emitirlo en cualquier otro momento.',
                 icon: 'success',
                 confirmButtonText: 'OK',
                 allowOutsideClick: false,
             })
                .then((result) => {
                     if (result.value) {
                         this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                     }
                 });
         }
    }



    async callServiceMethods(prima) {
        let response: any = {};

        await this.policyemit.getPayMethodsTypeValidate(  //AVS - INTERCONEXION SABSA
            this.creditHistory.sdescript,
            prima,
            '1'
        ).toPromise().then(res => {
            response = res;
        }, err => {
            console.log(err);
        });

        return response;
    }

    async callServicePagoDirectoSCTR(p_nroCotizacion, p_tipoTransaccion, prima) {
        let response: any = {};

        await this.policyemit.getPayDirectMethods(
            p_nroCotizacion,
            p_tipoTransaccion,
            prima,
            this.creditHistory.sdescript,
            this.SClient
        ).toPromise().then(res => {
            response = res;
        }, err => {
            console.log(err);
        });

        return response;
    }

    getBase64(file): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString() || '');
            reader.onerror = error => reject(error);
        });
    }

    guardarAdjuntos(filename: string, base64: string): void {
        let file: any = {}
        file.filename = filename;
        file.base64 = base64;
        this.files_adjuntos.push(JSON.stringify(file));
        console.log(filename);
    }

    async filesAdjuntos(files: File[]) {
        this.files_adjuntos = [];

        for (let file of files) {
            await this.getBase64(file).then(
                data => {
                    this.guardarAdjuntos(file.name, data);
                })
        }
    }

    async onPaymentKushki() {
        this.loading = true;
        await this.validateFlow();

        if (this.files.length > 0) {
            await this.filesAdjuntos(this.files);
        }

        const policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.savedPolicyList;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = this.emisionMapfre == null ? null : this.emisionMapfre;
        policyData.adjuntos = this.files_adjuntos;
        policyData.transaccion = 1;
        policyData.dataCIP = this.dataCIP;

        if (this.polizaEmitCab.poliza.pagoElegido == 'transferencia') {
            policyData.dataCIP.tipoPago = "3"
        } else if (this.polizaEmitCab.poliza.pagoElegido == 'cash') {
            policyData.dataCIP.tipoPago = "2"
        }

        //this.payPF = 1; 
        let insertDetResult = await this.insertDetTr();
        let nidproc_EPS = this.nroMovimientoEPS;

        if (this.savedPolicyEmit.P_NCOT_MIXTA == 1 || this.nbranch == this.pensionID.nbranch && this.polizaEmitCab.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 05/09/2023
            await this.riesgosSCTR_Salud();
        }

        if (insertDetResult.P_COD_ERR == 0) {
            const payPF = this.payPF;

            for (let i = 0; i < policyData.savedPolicyList.length; i++) {
                policyData.savedPolicyList[i].P_PAYPF = policyData.dataCIP.tipoPago;
                policyData.savedPolicyList[i].P_NID_PROC_EPS = nidproc_EPS;
            }

            policyData.dataCIP.ExternalId_EPS = nidproc_EPS;
            console.log('onPaymentKushki()');
            console.log(policyData);
            localStorage.setItem('policydata', JSON.stringify(policyData));
            this.loading = false;
            this.router.navigate(['/extranet/policy/pago-kushki']);
        } else {
             this.loading = false;
            swal.fire('Información', 'Hubo un error en la inserción del detalle de la transacción. Comuníquese con soporte.', 'error');
        }
    }

    // Ini nidproc
    async getValidateTrama(data: any, flag?: number, sctr?: string, eps?: string) {
        let response: number;

        await this.policyemit.getValidateTrama(data, flag, sctr, eps)
            .toPromise()
            .then(res => {
                response = res
            });

        return response;
    }

    async getUpdateEps(data: any) {

        await this.policyemit.getUpdateEps(data)
            .toPromise()

    }
    // Fin nidproc

    generarInfo(data: any, product: string) {

        if (data.length > 0) {
            let item: any = {};
            item.productCore = product;
            item.discount = data[0].DESCUENTO;
            item.activityVariation = data[0].VARIACION_TASA;
            item.commission = 0;
            item.dEmisionPro = product == '1' ? this.dEmiPension : this.dEmiSalud;
            item.igvPro = product == '1' ? this.igvPensionWS : this.igvSaludWS;
            item.prima_end = data[0].PRIMA_END;
            item.primaNetaPrev = data[0].NSUM_PREMIUMNPRE;

            item.totalNeto = data[0].NSUM_PREMIUMNPRE;
            item.primaCom = data[0].NSUM_PREMIUMNPRE;
            item.igv = data[0].NSUM_IGVPRE;
            item.totalBruto = data[0].NSUM_PREMIUMTPRE;

            item.totalNetoPre = data[0].NSUM_PREMIUMN;
            item.primaComPre = data[0].NSUM_PREMIUMN;
            item.igvPre = data[0].NSUM_IGV;
            item.totalBrutoPre = data[0].NSUM_PREMIUM;

            item.prima_min = data[0].PRIMA_MIN;
            item.prima_minPro = data[0].PRIMA_MIN;
            item.prima_minAut = data[0].PRIMA_MIN;
            item.prima_minAutBk = data[0].PRIMA_MIN_PRO; // Se guarda el pro para usarlo luego

            item.totalNetoAut = data[0].NSUM_PREMIUMNPRE;
            item.primaComAut = data[0].NSUM_PREMIUMNPRE;
            item.igvAut = data[0].NSUM_IGVPRE;
            item.totalBrutoAut = data[0].NSUM_PREMIUMTPRE;
            // item.mode = 'evaluar';
            item.mensaje = null;

            item.rma = data[0].REMUNERACION_TOPE; //
            item.desdeRma = data[0].REMUN_TOPE_DESDE; //
            item.finRma = data[0].REMUN_TOPE_HASTA; //
            item.mes_vencido = data[0].OPC_MES_VENCIDO; // 
            item.factVencido = this.polizaEmit.facturacionVencido; //

            item.tasasList = [];

            data.forEach(element => {
                let categoria: any = {};
                categoria.id = element.TIP_RIESGO;
                categoria.nmodulec = element.TIP_RIESGO;
                categoria.description = element.DES_RIESGO;
                categoria.rateRisk = element.TASA_RIESGO;
                categoria.rate = element.TASA;
                categoria.planilla = element.MONTO_PLANILLA;
                categoria.planProp = element.TASA_PRO;
                categoria.premiumMonthPre = element.AUT_PRIMA;
                categoria.premiumMonth = element.AUT_PRIMA;
                categoria.premiumMonthAut = element.AUT_PRIMA;
                categoria.rateAut = element.TASA;
                categoria.rateBk = element.TASA_CALC;
                categoria.totalWorkes = element.NUM_TRABAJADORES;
                categoria.planillaPen = element.MONTO_PLANILLA_PEN;
                categoria.planillaSal = element.MONTO_PLANILLA_SAL;
                categoria.prima_min = element.PRIMA_MIN;
                item.tasasList.push(categoria);
            });

            if (product == '1') {
                this.infoPension.push(item);
                this.pensionList = this.infoPension[0].tasasList;
                this.saveLog('Punto Control SCTR A- GenerarInfo' , 'Nid-proc - ' + this.processID +" // Producto 1 //Obj item=> " + JSON.stringify(item)  + " //Obj 2 - pensionList=> " + JSON.stringify(this.pensionList), 1);

            } else {
                this.infoSalud.push(item);
                this.saludList = this.infoSalud[0].tasasList;
                this.saveLog('Punto Control SCTR A- GenerarInfo' , 'Nid-proc - ' + this.processID +" // Producto 2 //Obj => " + JSON.stringify(item) + " //Obj 2 - saludList=> " + JSON.stringify(this.saludList), 1);
            }
 
        }
    }
    dataPension(infoPension: any, type: any = '0') {
        // console.log(infoPension)
        // this.discountPension = infoPension.length > 0 ? infoPension[0].discount : 0;
        this.activityVariationPension = infoPension.length > 0 ? infoPension[0].activityVariation : 0;
        // this.commissionPension = infoPension.length > 0 ? infoPension[0].commission : 0;
        // this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension.length > 0 ? infoPension[0].prima_min : 0;
        // this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = infoPension.length > 0 ? infoPension[0].prima_minPro : 0;
        this.polizaEmitCab.MIN_PENSION_AUT = infoPension.length > 0 ? infoPension[0].prima_minAut : 0;
        this.endosoPension = infoPension.length > 0 ? infoPension[0].prima_end : 0;
        this.polizaEmitCab.primaComPension = infoPension.length > 0 ? infoPension[0].primaCom : 0;
        this.polizaEmitCab.primaComPensionPre = infoPension.length > 0 ? infoPension[0].primaComPre : 0;

        this.primaTotalPension = infoPension.length > 0 ? infoPension[0].totalNetoPre : 0; // 
        this.igvPension = infoPension.length > 0 ? infoPension[0].igvPre : 0;
        this.brutaTotalPension = infoPension.length > 0 ? infoPension[0].totalBrutoPre : 0;

        this.totalNetoPensionSave = infoPension.length > 0 ? infoPension[0].totalNeto : 0;
        this.igvPensionSave = infoPension.length > 0 ? infoPension[0].igv : 0;
        this.brutaTotalPensionSave = infoPension.length > 0 ? infoPension[0].totalBruto : 0;

        // Prima endoso
        this.polizaEmitCab.PRIMA_PEN_END = infoPension.length > 0 ? infoPension[0].prima_end : 0
        this.polizaEmitCab.rma = infoPension.length > 0 ? infoPension[0].rma : null;
        this.polizaEmitCab.desdeRma = infoPension.length > 0 ? infoPension[0].desdeRma : null;
        this.polizaEmitCab.finRma = infoPension.length > 0 ? infoPension[0].finRma : null;


        this.mensajePrimaPension = infoPension.length > 0 ? infoPension[0].mensaje : "";
        this.saveLog('Punto Control SCTR A- dataPension' , 'Nid-proc - ' + this.processID +
            " // activityVariationPension => " + this.activityVariationPension +
            " // polizaEmitCab.MIN_PENSION_AUT => " + this.polizaEmitCab.MIN_PENSION_AUT  +
            " // endosoPension => " + this.endosoPension +
            " // polizaEmitCab.primaComPension => " + this.polizaEmitCab.primaComPension +
            " // polizaEmitCab.primaComPensionPre => " + this.polizaEmitCab.primaComPensionPre +
            " // primaTotalPension => " + this.primaTotalPension +
            " // igvPension => " + this.igvPension +
            " // brutaTotalPension => " + this.brutaTotalPension +
            " // totalNetoPensionSave => " + this.totalNetoPensionSave +
            " // igvPensionSave => " + this.igvPensionSave +
            " // brutaTotalPensionSave => " + this.brutaTotalPensionSave +
            " // polizaEmitCab.PRIMA_PEN_END => " + this.polizaEmitCab.PRIMA_PEN_END +
            " // polizaEmitCab.rma => " + this.polizaEmitCab.rma +
            " // polizaEmitCab.desdeRma => " + this.polizaEmitCab.desdeRma +
            " // polizaEmitCab.finRma => " + this.polizaEmitCab.finRma 
            , 1);
    }

    dataSalud(infoSalud: any, type: any = '0') {
        console.log(infoSalud)
        // this.discountPension = infoPension.length > 0 ? infoPension[0].discount : 0;
        this.activityVariationSalud = infoSalud.length > 0 ? infoSalud[0].activityVariation : 0;
        // this.commissionPension = infoPension.length > 0 ? infoPension[0].commission : 0;
        // this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension.length > 0 ? infoPension[0].prima_min : 0;
        // this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = infoPension.length > 0 ? infoPension[0].prima_minPro : 0;
        this.polizaEmitCab.MIN_SALUD_AUT = infoSalud.length > 0 ? infoSalud[0].prima_minAut : 0;
        this.endosoSalud = infoSalud.length > 0 ? infoSalud[0].prima_end : 0;
        this.polizaEmitCab.primaComSalud = infoSalud.length > 0 ? infoSalud[0].primaCom : 0;
        this.polizaEmitCab.primaComSaludPre = infoSalud.length > 0 ? infoSalud[0].primaComPre : 0;

        this.primatotalSalud = infoSalud.length > 0 ? infoSalud[0].totalNetoPre : 0; // 
        this.igvSalud = infoSalud.length > 0 ? infoSalud[0].igvPre : 0;
        this.brutaTotalSalud = infoSalud.length > 0 ? infoSalud[0].totalBrutoPre : 0;

        this.totalNetoSaludSave = infoSalud.length > 0 ? infoSalud[0].totalNeto : 0;
        this.igvSaludSave = infoSalud.length > 0 ? infoSalud[0].igv : 0;
        this.brutaTotalSaludSave = infoSalud.length > 0 ? infoSalud[0].totalBruto : 0;

        // Prima endoso
        this.polizaEmitCab.PRIMA_SALUD_END = infoSalud.length > 0 ? infoSalud[0].prima_end : 0

        this.polizaEmitCab.rma = this.polizaEmitCab.rma == null ? infoSalud.length > 0 ? infoSalud[0].rma : this.polizaEmitCab.rma : this.polizaEmitCab.rma;
        this.polizaEmitCab.desdeRma = this.polizaEmitCab.desdeRma == null ? infoSalud.length > 0 ? infoSalud[0].desdeRma : this.polizaEmitCab.desdeRma : this.polizaEmitCab.desdeRma;
        this.polizaEmitCab.finRma = this.polizaEmitCab.finRma == null ? infoSalud.length > 0 ? infoSalud[0].finRma : this.polizaEmitCab.finRma : this.polizaEmitCab.finRma;

        this.mensajePrimaPension = infoSalud.length > 0 ? infoSalud[0].mensaje : "";
        this.saveLog('Punto Control SCTR A- dataSalud' , 'Nid-proc - ' + this.processID +
            " // activityVariationSalud => " + this.activityVariationSalud +
            " // polizaEmitCab.MIN_SALUD_AUT => " + this.polizaEmitCab.MIN_SALUD_AUT  +
            " // endosoSalud => " + this.endosoSalud +
            " // polizaEmitCab.primaComSalud => " + this.polizaEmitCab.primaComSalud  +
            " // polizaEmitCab.primaComSaludPre => " + this.polizaEmitCab.primaComSaludPre +
            " // primatotalSalud => " + this.primatotalSalud +
            " // igvSalud => " + this.igvSalud +
            " // brutaTotalSalud => " + this.brutaTotalSalud +
            " // totalNetoSaludSave => " + this.totalNetoSaludSave +
            " // igvSaludSave => " + this.igvSaludSave +
            " // brutaTotalSaludSave => " + this.brutaTotalSaludSave +
            " // polizaEmitCab.PRIMA_SALUD_END => " + this.polizaEmitCab.PRIMA_SALUD_END +
            " // polizaEmitCab.rma => " + this.polizaEmitCab.rma +
            " // polizaEmitCab.desdeRma => " + this.polizaEmitCab.desdeRma +
            " // polizaEmitCab.finRma => " + this.polizaEmitCab.finRma 
            , 1);
    }

    async resetearPrimas(infoProducto) {

        if (infoProducto.length > 0) {
            // this.isLoading = true;

            console.log('resetearPrimas', this.polizaEmit.facturacionVencido)

            // let premiumAut = event == 0 ? infoProducto[0].prima_minAutBk : !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
            infoProducto[0].factVencido = this.polizaEmit.facturacionVencido;
            infoProducto[0].rateType = this.polizaEmitCab.NRATETYPE; // Tipo de tasa
            console.log('rateType', infoProducto[0].rateType)
            // infoProducto[0].itemTasa = null;

            await this.clientInformationService.getReTariff(infoProducto).subscribe(
                async res => {
                    // this.isLoading = false;
                    let infoPensionTemp = res.filter(item => item.productCore == '1');
                    this.infoPension = infoPensionTemp.length > 0 ? infoPensionTemp : this.infoPension;
                    this.pensionList = this.infoPension.length > 0 ? this.infoPension[0].tasasList : this.pensionList;
                    this.dataPension(this.infoPension, '1');
                    this.saveLog('Punto Control SCTR A- resetearPrimas' , 'Nid-proc - ' + this.processID +
                                " // infoPensionTemp => " + JSON.stringify(infoPensionTemp) +
                                " // pensionList => " + JSON.stringify( this.pensionList)  
                                , 2);
                    let infoSaludTemp = res.filter(item => item.productCore == '2');
                    this.infoSalud = infoSaludTemp.length > 0 ? infoSaludTemp : this.infoSalud;
                    this.saludList = this.infoSalud.length > 0 ? this.infoSalud[0].tasasList : this.saludList;
                    this.dataSalud(this.infoSalud, '1');
                    this.saveLog('Punto Control SCTR A- resetearPrimas' , 'Nid-proc - ' + this.processID +
                                " // infoPensionTemp => " + JSON.stringify(infoSaludTemp) +
                                " // pensionList => " + JSON.stringify( this.saludList)  
                                , 2);
                    console.log('resetearPrimas', res);

                },
                err => {
                    // this.isLoading = false;
                    // this.clearTariff();
                    swal.fire('Información', this.variable.var_sinCombinacion, 'error');
                }
            );
        }

    }

    async getRateTypeList() {
        await this.clientInformationService.getRateTypeList().toPromise().then(
            res => {
                this.rateTypeList = res;
            },
            err => {
            }
        );
    }

    async saveLog(text1: string, text2: string, order: number){
        await this.LogService.save(text1, text2, order)
        .toPromise()
    }

    async saveFilesDerivation(){

        if (this.files.length === 0) return;

        const formData = new FormData();
        const payload = {
            nidCotizacion: this.cotizacionID,
            nidProc: this.processID,
            typeTransac: 'EM'
        };

        this.files.forEach(file => {
            formData.append('adjuntos', file, file.name);
        });

        formData.append('objeto', JSON.stringify(payload));
        this.policyemit.saveFilesDerivation(formData).subscribe({
        next: () => {
            console.log('Archivos enviados exitosamente');
        },
        error: (err) => {
            console.error('Error al enviar archivos:', err);
        }
        });
    }

    async obtValidacionTrama(res: any) {
        this.visaData = null;
        this.erroresList = res.insuredError != null ? res.insuredError.insuredErrorList : [];

        if (res.P_COD_ERR == '1') {
            await this.getValidateTrama(this.dataTrama, 2)
            swal.fire('Información', res.P_MESSAGE, 'error');
        } else {
            if (this.erroresList != null) {
                if (this.erroresList.length > 0) {
                    this.processID = '';
                    this.nroMovimientoEPS = null;

                    const base64String = res.insuredError.P_SFILE;
                    await this.getValidateTrama(this.dataTrama, 2);
                    const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                    modalRef.componentInstance.formModalReference = modalRef;
                    modalRef.componentInstance.erroresList = this.erroresList;
                    modalRef.componentInstance.base64String = base64String;
                    modalRef.componentInstance.fileName = 'errores_sctr_' + res.P_NID_PROC;
                } else {
                    this.processID = res.P_NID_PROC;
                    this.nroMovimientoEPS = res.P_NID_PROC_EPS;
                    await this.infoCarga(this.processID);
                    await this.validateDerivationRules();
                    await this.validateDelimitationRules();
                    await this.callButtonPE();

                    //FLAG DE VALIDAR PRIMA Y RIESGOS - SCTR
                    this.polizaEmitCab.prePayment = await this.obtenerPagoDirectoSCTR();

                    await this.getValidateTrama(this.dataTrama, 0, this.processID, this.nroMovimientoEPS)
                    swal.fire('Información', 'Se validó correctamente la trama', 'success');
                }
            } else {
                await this.getValidateTrama(this.dataTrama, 2)
                swal.fire('Información', 'El archivo enviado contiene errores', 'error');
            }
        }
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

    async newValidateTrama(nid_proc){
        const request = {
            nid_proc: nid_proc
        }

        while (true) {
            const response = await this.GetValTramaFin(request);

            if (response.P_RESPUESTA === 5) {
                
                const newData = this.generateObjValida();
                newData.flagVal = 1;
                newData.nidProcVal = nid_proc;

                const newFormData: FormData = new FormData();
                newFormData.append('objValida', JSON.stringify(newData));


                const resFinal = await this.policyemit.valGestorList(newFormData).toPromise();
                await this.obtValidacionTrama(resFinal);
                this.loading = false;
                break;
            }else if(response.P_RESPUESTA === 6){
                this.loading = false;
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
                        this.loading = true;
                        await this.UpdEstadoAsegurados(nid_proc);
                        this.newValidateTrama(nid_proc);
                    } else if (result.isDismissed) {
                        window.location.reload();
                    }
                });

                break;
            }else if(response.P_RESPUESTA === 7 ){
                this.loading = false;            
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
        this.limpiarCampos();
        this.excelSubir = null;
        this.clickValidarExcel = false;
        this.files = [];
    }

    generateObjValida() {
        const data: any = {};
        data.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.nroCotizacion = this.cotizacionID;
        data.type_mov = '1';
        data.stransac = 'EM';
        data.retarif = '1';
        data.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        data.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        data.eps = this.epsItem.STYPE;
        data.nroCotizacionEPS = this.nroCotizacionEps;
        data.nroPolizaEPS = null;
        data.tipDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
        data.nroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
        data.tipRenovacion = this.polizaEmitCab.tipoRenovacion;
        data.codRamo = this.nbranch;
        data.codProceso = this.nidProc;
        data.codMixta = this.polizaEmitCab.NCOT_MIXTA; //AVS - INTERCONEXION SABSA 20/09/2023
        data.nroPolizaSalud = this.NroSalud; //AVS - INTERCONEXION SABSA 20/09/2023
        data.nroProduct = this.polizaEmitCab.NPRODUCT; //AVS - INTERCONEXION SABSA

        return data;
    }

}