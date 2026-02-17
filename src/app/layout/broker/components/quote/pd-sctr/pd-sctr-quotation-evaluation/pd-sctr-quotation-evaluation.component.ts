import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// Importación de servicios
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { OthersService } from '../../../../services/shared/others.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

// Importacion de modelos
import { QuotationStatusChange } from '../../../../models/quotation/request/quotation-status-change';
import { AuthorizedRate } from '../../../../models/quotation/request/authorized-rate';
import { Status } from '../../../../models/quotation/response/status';
import { Reason } from '../../../../models/quotation/response/reason';
import { QuotationTracking } from '../../../../models/quotation/response/quotation-tracking'
import * as FileSaver from 'file-saver';

// SweetAlert
import swal from 'sweetalert2';
// Configuración
import { CommonMethods } from '../../../common-methods';
import { AccessFilter } from '../../../access-filter'
import { QuotationTrackingSearch } from '../../../../models/quotation/request/quotation-tracking-search';
import { FilePickerComponent } from '../../../../modal/file-picker/file-picker.component';
import { QuotationBroker } from '../../../../models/quotation/request/quotation-modification/quotation-broker';
import { QuotationModification } from '../../../../models/quotation/request/quotation-modification/quotation-modification';
import { QuotationRisk } from '../../../../models/quotation/request/quotation-modification/quotation-risk';
import { Broker } from '../../../../models/quotation/request/broker';
import { BrokerProduct } from '../../../../models/quotation/request/broker-product';
import { DatePipe } from '@angular/common';

// JSON Template

import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';
import { ValidateDebtReponse } from '../../../../interfaces/validate-debt-response';
import { ValidateLockReponse } from '../../../../interfaces/validate-lock-response';
import { ValidateDebtRequest } from '../../../../models/collection/validate-debt.request';
import { CobranzasService } from '../../../../services/cobranzas/cobranzas.service';
import { GenAccountStatusRequest } from '../../../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../../../interfaces/gen-account-status-response';
import { ValidateLockRequest } from '../../../../models/collection/validate-lock-request';
import { AddContactComponent } from '../../../../modal/add-contact/add-contact.component';
import { QuotationCoverComponent } from '../../quotation-cover/quotation-cover.component'; //MSR - Adecuaciones
import { DateArray } from 'ngx-bootstrap/chronos/types';
import { StorageService } from '../../acc-personales/core/services/storage.service';
import { TransactService } from '../../../../services/transact/transact.service';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';
import { LogWSPlataformaService } from '../../../../services/logs/log-wsplataforma.service';

@Component({
    selector: 'app-pd-sctr-quotation-evaluation',
    templateUrl: './pd-sctr-quotation-evaluation.component.html',
    styleUrls: ['./pd-sctr-quotation-evaluation.component.css']
})
export class PdSctrQuotationEvaluationComponent implements OnInit {

    /**
     * Variables de paginación
     */
    typeTransacTecnica: string = '';
    currentPage = 1; // página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; // total de items encontrados
    listToShow: any = [];
    filter = new QuotationTrackingSearch();
    statusChangeList: any = [];
    quotationNumber: string;  // Número de cotización
    productoId: number;
    statusChangeRequest: any = {};  // Objeto principal a enviar en la operación de cambio de estado
    pensionAuthorizedRate: boolean = false;  // habilitar los campos de tasa autorizada de SCTR pensión
    saludAuthorizedRate: boolean = false;  // habilitar los campos de tasa autorizada de SCTR salud
    estimatedWorkerQuantity: string;
    zipCode: string;
    reasonList: Status[] = []; // Lista de razones para el cambio de estado
    statusList: Reason[] = []; // Lista de estados de cotización
    statusEstadoList: Reason[] = [];
    files = []; // Lista de archivos cargados para subirse
    lastFileAt: Date; // Variable de componente FILES para ordenar por fecha
    filesMaxSize = 10485760;  // Limite del total de tamaño de archivos
    mode: string;
    isLoading: Boolean = false; // true:mostrar | false:ocultar pantalla de carga
    mainFormGroup: FormGroup;
    inputsQuotation: any = {}; // Datos de cotización que se carga para Evaluar la cotización
    genericServerErrorMessage: string = 'Ha ocurrido un error inesperado, contáctese con soporte.';
    redirectionMessage: string = 'Usted será redireccionado a la página anterior.';
    canApproveQuotation: boolean;
    canProposeRate: boolean;
    canSeeRiskRate: boolean;
    originalHealthMainPropComission: number;
    originalPensionMainPropComission: number;
    originalPensionMainAuthComission: number;
    originalHealthMainAuthComission: number;
    originalHealthMinPropPremium: number;
    originalPensionMinPropPremium: number;
    originalPensionMinAuthPremium: number;
    originalHealthMinAuthPremium: number;
    enabledPensionProposedRate: boolean;
    enabledHealthProposedRate: boolean;
    enabledPensionAuthorizedRate: boolean;
    enabledHealthAuthorizedRate: boolean;
    enabledHealthMinPropPremium: boolean;
    enabledHealthAuthorizedPremium: boolean;
    enabledPensionMinPropPremium: boolean;
    enabledPensionAuthorizedPremium: boolean;
    enabledHealthMainPropCommission: boolean;
    enabledHealthMainAuthCommission: boolean;
    enabledPensionMainPropCommission: boolean;
    enabledPensionMainAuthCommission: boolean;
    enabledHealthSecondaryPropCommission: boolean;
    enabledPensionSecondaryPropCommission: boolean;
    enabledHealthSecondaryAuthCommission: boolean;
    enabledPensionSecondaryAuthCommission: boolean;
    buttonName: string;
    evaluationLabel: string;
    healthIGV: number;
    pensionIGV: number;
    vidaLeyIGV: number;
    myDate = new Date();
    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    healthProductId = JSON.parse(localStorage.getItem('saludID'));
    pensionProductId = JSON.parse(localStorage.getItem('pensionID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    codProfile: any;
    pensionMessage: string;
    isNetPremiumLessThanMinHealthPremium: boolean;
    isNetPremiumLessThanMinPensionPremium: boolean;
    healthMessage: string;
    statusChange: string;
    status: any;
    sproducto = 'SCTR PENSIÓN';
    sprimaMinima = 'PRIMA MÍNIMA PENSIÓN';
    totalWorkers: any;
    totalAmount: number;
    from: string;// MRC
    template: any = {}
    variable: any = {}
    cotEstado: number;
    comisionAut: boolean = false;
    dayConfig: any = 0;
    dayRetroConfig: any = 0;
    bsConfig: Partial<BsDatepickerConfig>;
    VAL_QUOTATION: any = {}; // MRC
    VAL_QUOTATION_ERROR: any = {};// MRC
    commissionState = true;
    comisionList: any;
    /* INI COT-FII */
    isProposedCommission = false;
    canTasaVL = true;
    isRateProposed;
    codProductoLoad: any;
    flagCotN = 'N';
    flagCotF = 'F';
    arrayRateProposed = [];
    nidProc = '';
    tasasList: any = []; // JDD
    rateByPlanList: any = [];
    detailPlanList: any = [];
    amountPremiumList: any = [];
    amountDetailTotalList: any = [];
    CommissionList: any = [];
    CalculateList: any = [];
    CalculateDetailList: any = [];
    ProposalList: any = [];
    ProposalDetailList: any = [];
    AuthorizedList: any = [];
    AuthorizedDetailList: any = [];
    btnCotiza: boolean = true;
    btnNormal: boolean = true;
    commissionValue = '';
    archivoExcel: File;
    excelSubir: File;
    erroresList: any = [];
    processID = '';
    perfil: any;
    policyNumber: any;
    typeTran: any;
    flagContact: boolean = false;
    flagEmail: boolean = false;
    flagDisabledRestric: boolean = false;
    validateField = [];
    brokerProfile = '';
    glossList: any = []; // Mejoras SCTR
    dEmiPension = 0;
    dEmiSalud = 0;
    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    @ViewChild('desdeAseg') desdeAseg: any;
    lblFecha: string = '';
    lblProducto: string = '';
    clientCode = '';
    validateDebtResponse: ValidateDebtReponse = {};
    creditHistory: any = null;
    contractingdata: any = [];
    validateLockResponse: ValidateLockReponse = {};
    contactList: any = [];
    commentTran: any;
    emsionDirecta = '';
    descPlanBD: '';
    flagEvaluarDirecto = 0;
    retroVal = 0;
    retroMsg: string = '';
    stran: string = '';
    isCotizacion: number;
    formatsDateTest: string[] = [
        'dd/MM/yyyy'
    ];
    dateNow: Date = new Date();

    FechaEfectoInicial: Date;
    // variables de prueba para abrir modal de pagos
    modal: any = {};
    cotizacion: any = {};
    nbranch: any = {};

    transactNumber = 0;
    isTransact = false;
    titleTransact = '';
    usersList: any = [];
    userAssigned = 0;
    nTransac: number = 0;
    sAbrTran: string = '';
    isReasignar: boolean = false;
    infoTransact: any = {};
    tipoEndoso: any = [];
    blokerMod: any = [];
    TitleOperacion = '';
    isPolizaMatriz = false;
    hiddenPolizaMatriz = false;
    flagAprobCli: boolean = false;
    quotationDataTra: any;
    flagEnvioEmail = 0;
    flagRechazoPol: boolean = false;
    planList: any = []; //LSR
    resProfileOpe: any[] = [];
    isProfileOpe = 0;

    emitirCertificadoTecnica = false; //KT flag para la generacion de certificados posterior a la aprobación de tecnica
    emitirCertificadoOperaciones = false; //KT
    datasavecertificados: any = {};
    flagGobiernoEstado = false;
    flagGobiernoMatriz = false;
    flagGobiernoIniciado: boolean = false;
    mailEjecCom: string;
    nidprodEmisionEstado: string = '';
    derivaRetroactividad: boolean = false;
    planPropuesto: '';
    brokerList: any = {};
    emitirPolizaOperaciones = false;
    emitirPolizaMatrizTramiteEstado = false;
    enviarPolizaMatrizTramiteEstado = false;
    iniciadoPolizaMatrizTramiteEstado = false;
    statusTransact = "";
    rechazoMotivoList: any = []; //motivos de rechazo tramites.
    rechazoMotivoID: any = null;
    //EAER - Gestion Tramites Estado - 13092022
    countinputEMP = 0;
    planillainputEMP = 0;
    tasainputEMP = 0;
    MontoSinIGVEMP = 0;
    countinputOBR = 0;
    planillainputOBR = 0;
    tasainputOBR = 0;
    MontoSinIGVOBR = 0;
    countinputOAR = 0;
    planillainputOAR = 0;
    tasainputOAR = 0;
    MontoSinIGVOAR = 0;
    countinputEE = 0;
    planillainputEE = 0;
    tasainputEE = 0;
    MontoSinIGVEE = 0;
    countinputOE = 0;
    planillainputOE = 0;
    tasainputOE = 0;
    MontoSinIGVOE = 0;
    countinputOARE = 0;
    planillainputOARE = 0;
    tasainputOARE = 0;
    MontoSinIGVOARE = 0;
    TotalSinIGV = 0;
    TotalConIGV = 0;
    SumaConIGV = 0;
    MontoFPSinIGVEMP = 0;
    MontoFPSinIGVOBR = 0;
    MontoFPSinIGVOAR = 0;
    MontoFPSinIGVEE = 0;
    MontoFPSinIGVOE = 0;
    MontoFPSinIGVOARE = 0;
    TotalFPSinIGV = 0;
    TotalFPConIGV = 0;
    flagActivateExc = 0;
    chkTope = 0;
    //EAER - Gestion Tramites Estado - 13092022
    procesarPolizaOperaciones = false;
    questionTextEstado: string;
    dataPolizaEstado: any = {}; // Datos de cotización para transaccion de estado VL
    visualAprobEstado: boolean = false;
    PolizaMatrizTransac: boolean = false;
    //INI AVS - INTERCONEXION SABSA 
    valMixSAPSA: any;
    valCIPSCTR_PEN: any;
    valCIPSCTR_EPS: any;
    codCIP_PEN: any;
    codCIP_EPS: any;
    copiedMessage: string = '';
    showCopyMessage = false;
    hideBoxPension: boolean = true;
    hideBoxSalud: boolean = true;
    flagGBD: boolean = false;
    flagClienteNuevo = 1;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    flagCipEmit = 0;
    idProductoCabecera = 0;
    dataCIP: any;
    payPF = 0;
    savedPolicyList: any = [];
    transaccionProtecta: any;
    montos_sctr: any = [];
    monthsSCTR: any;
    DataSCTRPENSION: any = [];
    DataSCTRSALUD: any = [];
    SaludBruta: any;
    PensionBruta: any;
    typeMovement = 0;
    nroSalud: any;
    nroPension: any;
    flagCheckboxComisionPension: boolean = false;
    flagCheckboxComisionSalud: boolean = false;

    tipo_pago_PEN: any;
    slink_PEN: any;
    tipo_pago_SAL: any;
    slink_SAL: any;

    flagMesVec: any;
    validate_button_action_perfil: boolean // validacion solo para tecnica
    //FIN AVS - INTERCONEXION SABSA 

    // Ini JDD mejora
    listaTasasSalud: any = [];
    infoSalud: any = [];
    listaTasasPension: any = [];
    infoPension: any = [];
    // tasasList: any = [];
    discountPension = 0;
    discountSalud = 0;
    activityVariationPension = 0;
    activityVariationSalud = 0;
    commissionPension = 0;
    commissionSalud = 0;

    totalNetoSaludSave = 0;
    totalNetoSaludAutSave = 0;
    totalNetoPensionSave = 0;
    totalNetoPensionAutSave = 0;
    igvSaludSave = 0;
    igvSaludAutSave = 0;
    igvPensionSave = 0;
    igvPensionAutSave = 0;
    brutaTotalSaludSave = 0;
    brutaTotalSaludAutSave = 0;
    brutaTotalPensionSave = 0;
    brutaTotalPensionAutSave = 0;

    totalNetoSalud = 0;
    totalNetoPension = 0;
    igvSalud = 0;
    igvPension = 0;
    brutaTotalSalud = 0;
    brutaTotalPension = 0;
    mensajePrimaPension = '';
    mensajePrimaSalud = '';
    files_adjuntos: any = [];
    rateTypeList: any = [];
    filesTransacEmitcab: any  = {};
    filesTransac: any  = {};
    // Fin JDD mejora
    annulmentList: any = [];
    origin = '';
    flagViewDetail: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private policyService: PolicyemitService,
        private quotationService: QuotationService,
        private mainFormBuilder: FormBuilder,
        private domSanitizer: DomSanitizer,
        private othersService: OthersService,
        private ngbModal: NgbModal,
        private modalService: NgbModal,
        private clientInformationService: ClientInformationService,
        private collectionsService: CobranzasService,
        private storageService: StorageService,
        private transactService: TransactService,
        private LogService : LogWSPlataformaService,
        public datepipe: DatePipe,
        private parameterSettingsService: ParameterSettingsService
    ) {
        this.isCotizacion = 1;
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }


    // Funcion de prueba para abrir modal de pagos
    async OpenModalPagos(paramsTrx) {
        // await this.ValidacionPago();
        // let paytypeSCTR = await this.obtenerPaytypeSCTR(); //AVS - INTERCONEXION SABSA 03/11/2023


        this.inputsQuotation.trama = {
            PRIMA_TOTAL: 0,
            NIDPROC: paramsTrx[0].P_NID_PROC,
        };

        this.inputsQuotation.contratante = {
            email: this.inputsQuotation.P_SE_MAIL,
            NOMBRE_RAZON: this.contractingdata.P_SLEGALNAME,
            COD_PRODUCT: paramsTrx.length > 1 ? 1 : paramsTrx[0].P_NPRODUCT,
            NBRANCH: paramsTrx.P_NBRANCH,
            tipoDocumento: {
                Id: this.inputsQuotation.DocumentTypeId
            },
            tipoPersona: {
                codigo: this.inputsQuotation.DocumentTypeId == 1 &&
                    this.inputsQuotation.DocumentNumber.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.inputsQuotation.DocumentNumber,
            // emisionDirecta: (this.mode === 'Evaluar' && this.vidaLeyID.nbranch!='73' )  ? 'V' :
            // (this.mode === 'Evaluar'  && this.vidaLeyID.nbranch=='73'&& Number(this.AuthorizedDetailList[2].AmountAuthorized)>=100 &&  (this.creditHistory.sdescript=='RIESGO BAJO' || (this.creditHistory.sdescript=='RIESGO ALTO' && this.contractingdata.P_SISCLIENT_GBD==1))) ? 'S' :'N',
            // emisionDirecta: this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? this.emsionDirecta : this.inputsQuotation.formaPago == true ? 'N' : this.emsionDirecta,
            emisionDirecta: !this.inputsQuotation.prePayment ? 'S' : 'N', // Evaluar
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateDebtResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.inputsQuotation.poliza = {
            producto: {
                COD_PRODUCT: paramsTrx.length > 1 ? 1 : paramsTrx[0].P_NPRODUCT,
                NBRANCH: 77,
            },
            moneda: {
                NCODIGINT: this.inputsQuotation.CurrencyId
            }
        };

        // const msgIncRenov = this.mode == 'include' ? 'la inclusión' : this.mode == 'endosar' ? 'el endoso' : this.sAbrTran == 'DE' ? 'la declaración' : 'la renovación';
        // const countPolicy = this.valMixSAPSA == 1 ? 'las pólizas' : 'la póliza';
        // const msgPolicy = this.valMixSAPSA == 1 ? this.nroPension + ' / ' + this.nroSalud : this.polizaEmitCab.NPRODUCT == 1 ? this.nroPension : this.nroSalud;
        this.inputsQuotation.prepago = {
            P_NID_COTIZACION: this.quotationNumber,
            msjCotizacion: 'Se puede realizar la emisión de la cotización N° ' + this.quotationNumber + ' de las siguientes formas:',
        };
        this.inputsQuotation.brokers = this.inputsQuotation.SecondaryBrokerList;

        // for (const item of this.inputsQuotation.brokers) {
        //     item.COD_CANAL = item.CANAL;
        // }

        // if (this.inputsQuotation.tipoTransaccion == 1 || this.inputsQuotation.tipoTransaccion == 14) {
        //     paramsTrx[0].flagEmitCertificado == 1 ? paramsTrx[0].flagEmitCertificado = 0 : 0;
        // }

        this.inputsQuotation.COD_TIPO_FRECUENCIA = this.inputsQuotation.frecuenciaPago;
        this.inputsQuotation.tipoTransaccion = 1; // this.nTransac; // rev
        this.inputsQuotation.transac = 'EM'
        this.inputsQuotation.files = this.files;
        this.inputsQuotation.paramsTrx = paramsTrx;
        this.inputsQuotation.numeroCotizacion = this.quotationNumber;
        this.cotizacion = this.inputsQuotation;
        console.log(this.cotizacion);
        console.log('paramsTrx', paramsTrx)
        this.modal.pagos = true;
        this.isLoading = true;
    }

    async obtenerPaytypeSCTR(): Promise<boolean> {  //AVS - INTERCONEXION SABSA
        let response: any = {};
        let prima = 0.0;

        if (this.valMixSAPSA == 1) {

            response = await this.callServiceMethods(this.brutaTotalPensionAutSave);

            if (response.P_ORDER !== 1) {
                response = await this.callServiceMethods(this.brutaTotalSaludAutSave);
            }
        } else {
            if (this.inputsQuotation.NPRODUCT == 1) {
                prima = this.brutaTotalPensionAutSave;
            } else {
                prima = this.brutaTotalSaludAutSave;
            }

            response = await this.callServiceMethods(prima);
        }

        let valTypePay = response.P_ORDER === 1 ? true : false;

        return valTypePay;
    }

    // validarFlagEC(obj, key) {
    //     return obj.hasOwnProperty(key)
    // }

    // async ValidacionPago() {
    //     let data: any = {}
    //     data.ncotizacion = this.quotationNumber;
    //     data.nusercode = this.inputsQuotation.UserAssigned;
    //     data.npendiente = 0;
    //     await this.quotationService.ValidarReglasPagos(data).toPromise().then(res => {

    //         this.emsionDirecta = res.P_SAPROBADO
    //     })
    // }

    tipoTransaccion() {
        let transaccion: any = 1;
        const vistas = [['Evaluar', 1], ['Emitir', 1], ['Renovar', 4], ['Declarar', 4], ['Incluir', 2], ['Endosar', 8], ['Excluir', 3]];
        const transacciones = [['Emitir', 1], ['Emisión', 1], ['Renovar', 4], ['Renovación', 4],
        ['Declaración', 4], ['Incluir', 2], ['Inclusión', 2], ['Endoso', 8], ['Excluir', 3], ['Exclusión', 3]];
        for (const item of vistas) {
            if (this.mode == item[0]) {
                for (const trans of transacciones) {
                    if (this.typeTran == trans[0]) {
                        transaccion = trans[1];
                        break;
                    }
                }
            }
        }

        return transaccion;
    }

    // async EmitCertificadoTecnica() {
    //     this.isLoading = false;
    //     let title = '¿Desea realizar la emisión de certificados?';
    //     swal.fire({
    //         title: 'Información',
    //         text: title,
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Generar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'
    //     }).then((result) => {
    //         if (result.value) {
    //             this.isLoading = true;
    //             this.policyService.getPolicyEmitCab(
    //                 this.quotationNumber, '1',
    //                 JSON.parse(localStorage.getItem('currentUser'))['id']
    //             ).toPromise().then(async (res: any) => {
    //                 if (!!res.GenericResponse &&
    //                     res.GenericResponse.COD_ERR == 0) {
    //                     await this.policyService.getPolicyEmitDet(
    //                         this.quotationNumber,
    //                         JSON.parse(localStorage.getItem('currentUser'))['id'])
    //                         .toPromise().then(
    //                             async resDet => {
    //                                 const params = [
    //                                     {
    //                                         P_NID_COTIZACION: this.quotationNumber,
    //                                         P_NID_PROC: this.nidProc,
    //                                         P_NPRODUCT: this.productoId,
    //                                         P_NBRANCH: this.nbranch,
    //                                         P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
    //                                         P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
    //                                         P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
    //                                         P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
    //                                         P_SFLAG_FAC_ANT: 1,
    //                                         P_FACT_MES_VENCIDO: 0,
    //                                         P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
    //                                         P_IGV: resDet[0].NSUM_IGV,
    //                                         P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
    //                                         P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
    //                                         P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
    //                                         P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized,                           //Bruta - RI
    //                                         P_SCOMMENT: '',
    //                                         P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //                                         P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
    //                                         P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
    //                                         planId: this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
    //                                         FlagCambioFecha: 0,
    //                                         P_NPOLICY: res.GenericResponse.NPOLICY,
    //                                         P_NDE: 0,
    //                                         P_NIDPAYMENT: 0

    //                                     }
    //                                 ];

    //                                 if (params[0].P_NID_PROC == '') {

    //                                     await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
    //                                         resCod => {
    //                                             params[0].P_NID_PROC = resCod;
    //                                         }
    //                                     );
    //                                 }
    //                                 if (!this.flagAprobCli)
    //                                     this.OpenModalPagos();
    //                             }
    //                         );
    //                 }
    //             });

    //         }
    //     });

    // }


    // validarDecimalPorcentage(int, decimal, input) {
    //     CommonMethods.validateDecimals(int, decimal, input);
    // }
    // changeMontoSinIGV(index: number) {
    //     if (index == 1) {
    //         this.MontoSinIGVEMP = CommonMethods.formatValor(Number(this.planillainputEMP) * Number(this.tasainputEMP) / 100, 6);
    //     }
    //     else if (index == 2) {
    //         this.MontoSinIGVOBR = CommonMethods.formatValor(Number(this.planillainputOBR) * Number(this.tasainputOBR) / 100, 6);
    //     }
    //     else if (index == 3) {
    //         this.MontoSinIGVOAR = CommonMethods.formatValor(Number(this.planillainputOAR) * Number(this.tasainputOAR) / 100, 6);
    //     }
    //     else if (index == 4) {
    //         this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6);
    //     }
    //     else if (index == 5) {
    //         this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6);
    //     }
    //     else if (index == 6) {
    //         this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6);
    //     }
    //     this.changeFPMontoSinIGV();
    // }

    // changeFPMontoSinIGV() {
    //     var frecPago = 0;

    //     switch (Number(this.inputsQuotation.frecuenciaPago)) {
    //         case 1:
    //             frecPago = 12 // Anual
    //             break;
    //         case 2:
    //             frecPago = 6 // Semestral
    //             break;
    //         case 3:
    //             frecPago = 3 // Trimestral
    //             break;
    //         case 4:
    //             frecPago = 2 // Bimestral
    //             break;
    //         case 5:
    //             frecPago = 1; // Mensual
    //             break;

    //         default:
    //             break;
    //     }
    //     this.MontoFPSinIGVEMP = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) * Number(frecPago), 6);
    //     this.MontoFPSinIGVOBR = CommonMethods.formatValor(Number(this.MontoSinIGVOBR) * Number(frecPago), 6);
    //     this.MontoFPSinIGVOAR = CommonMethods.formatValor(Number(this.MontoSinIGVOAR) * Number(frecPago), 6);
    //     this.MontoFPSinIGVEE = CommonMethods.formatValor(Number(this.MontoSinIGVEE) * Number(frecPago), 6);
    //     this.MontoFPSinIGVOE = CommonMethods.formatValor(Number(this.MontoSinIGVOE) * Number(frecPago), 6);
    //     this.MontoFPSinIGVOARE = CommonMethods.formatValor(Number(this.MontoSinIGVOARE) * Number(frecPago), 6);

    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVEMP() { //LS - Poliza Matriz

    //     this.MontoSinIGVEMP = CommonMethods.formatValor(Number(this.planillainputEMP) * Number(this.tasainputEMP) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVOBR() { //LS - Poliza Matriz

    //     this.MontoSinIGVOBR = CommonMethods.formatValor(Number(this.planillainputOBR) * Number(this.tasainputOBR) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVOAR() { //LS - Poliza Matriz

    //     this.MontoSinIGVOAR = CommonMethods.formatValor(Number(this.planillainputOAR) * Number(this.tasainputOAR) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVEE() { //LS - Poliza Matriz

    //     this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVOE() { //LS - Poliza Matriz

    //     this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeMontoSinIGVOARE() { //LS - Poliza Matriz

    //     this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6);
    //     this.changeTotalSinIGV();
    //     this.changeTotalConIGV();
    // }

    // changeTotalSinIGV() { //LS - Poliza Matriz
    //     this.TotalSinIGV = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE), 2);
    //     this.TotalSinIGV = CommonMethods.formatValor(this.TotalSinIGV, 2);
    //     this.TotalFPSinIGV = CommonMethods.formatValor(Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE), 2);
    //     this.TotalFPSinIGV = CommonMethods.formatValor(this.TotalFPSinIGV, 2);
    // }



    // changeTotalConIGV() { //LS - Poliza Matriz
    //     // this.TotalConIGV = CommonMethods.formatValor((Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE)) * 118 / 100, 2,1);
    //     this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2);
    //     // this.TotalFPConIGV = CommonMethods.formatValor((Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE)) * 118 / 100, 2);
    //     this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2);
    //     this.SumaConIGV = CommonMethods.formatValor(Number(this.TotalFPSinIGV) * 18 / 100, 2);
    //     // this.SumaConIGV = CommonMethods.formatValor(this.SumaConIGV, 2);
    // }


    // async recotizar() {
    //     // validar recotizacion de inclusion inclusion
    //     if (this.typeTran == 'Inclusión') {
    //         this.router.navigate(['/extranet/sctr/cotizador'], { queryParams: { nroCotizacion: this.quotationNumber, typeTransac: this.typeTran } });
    //     } else {
    //         this.router.navigate(['/extranet/sctr/cotizador'], { queryParams: { nroCotizacion: this.quotationNumber, typeTransac: this.typeTran } });
    //     }
    // }
    //123
    async renovarPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if (((this.buttonName == 'Renovar' || this.buttonName == 'Declarar') && this.mode == 'Renovar') || this.mode == 'Recotizar') {
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processRenovation();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processRenovation();
                    }
                } else {
                    this.processRenovation();
                }
            } else {
                this.AddStatusChange();
            }
        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processRenovation() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : (this.sAbrTran == 'DE') ? '¿Desea realizar la declaración de la cotización N° ' + this.quotationNumber + '?' : '¿Desea realizar la renovación de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: (this.sAbrTran == 'DE') ? 'Declarar' : 'Renovar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        })
            .then((result) => {
                if (result.value) {
                    // this.objetoTrx();
                }
            });
    }

    async incluirPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Incluir' && this.mode == 'Incluir') || this.mode == 'Recotizar') {
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processInclude();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processInclude();
                    }
                } else {
                    this.processInclude();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processInclude() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar la inclusión de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Incluir',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                // this.objetoTrx();
            }
        });


    }

    // async invocaServPoliza() {
    //     const pregunta = '¿Desea realizar la emisión de la cotización N° ' + this.quotationNumber + '?';
    //     swal.fire({
    //         title: 'Información',
    //         text: pregunta,
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Generar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'

    //     }).then((result) => {
    //         if (result.value) {
    //             this.objetoTrx();
    //             // this.policyService.getPolicyEmitCab(
    //             //   this.quotationNumber, typeMovement,
    //             //   JSON.parse(localStorage.getItem('currentUser'))['id']
    //             // ).subscribe((res: any) => {
    //             //   if (res.GenericResponse !== null) {
    //             //     if (res.GenericResponse.COD_ERR == 0) {
    //             //       savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //             //       savedPolicyEmit.P_NID_PROC = res.GenericResponse.NID_PROC;// Proceso
    //             //       savedPolicyEmit.P_NPRODUCT = this.productoId;
    //             //       savedPolicyEmit.P_SCOLTIMRE = res.GenericResponse.TIP_RENOV;// Tipo Renovación
    //             //       savedPolicyEmit.P_DSTARTDATE = fechaIni; // res.GenericResponse.EFECTO_COTIZACION_VL;
    //             //       savedPolicyEmit.P_DEXPIRDAT = fechaFin;// res.GenericResponse.EXPIRACION_COTIZACION_VL;
    //             //       savedPolicyEmit.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Frecuencia Pago
    //             //       savedPolicyEmit.P_SFLAG_FAC_ANT = 1; // Facturacion Anticipada
    //             //       savedPolicyEmit.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida

    //             //       const efectoWS = new Date(res.GenericResponse.EFECTO_COTIZACION_VL)
    //             //       const fechaEfecto = CommonMethods.formatDate(efectoWS);

    //             //       if (fechaIni != fechaEfecto) {
    //             //         comentario = 'Se ha modificado el inicio de vigencia: Antes = ' + fechaEfecto + '. Ahora = ' + fechaIni;
    //             //       }

    //             //       this.policyService.getPolicyEmitDet(this.quotationNumber, JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
    //             //         res => {
    //             //           amountDetailTotalList = res;

    //             //           savedPolicyEmit.P_NPREM_NETA = amountDetailTotalList[0].NSUM_PREMIUMN;
    //             //           savedPolicyEmit.P_IGV = amountDetailTotalList[0].NSUM_IGV;
    //             //           savedPolicyEmit.P_NPREM_BRU = amountDetailTotalList[0].NSUM_PREMIUM;
    //             //           savedPolicyEmit.P_SCOMMENT = comentario; // Comentario
    //             //           savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario

    //             //           savedPolicyList.push(savedPolicyEmit);
    //             //           this.OpenModalPagos(savedPolicyList);

    //             //         }
    //             //       );
    //             //     }
    //             //   }
    //             // });
    //         }
    //     });
    // }

    async emitirPoliza() {
        // console.log('dddd')
        console.log(this.inputsQuotation.NFLAG_STRAME)
        if (this.inputsQuotation.NFLAG_STRAME == 0) {
            this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: this.quotationNumber } });
        } else {
            //this.isLoading = true;
            if(this.flagViewDetail){
                this.quotationDataTra.Detail = 0;
                sessionStorage.setItem('cs-quotation', JSON.stringify(this.quotationDataTra));
                //this.router.navigate(['/extranet/sctr/cotizacion-evaluacion'], { queryParams: { typeTransacTecnica: this.quotationDataTra.TypeTransac } });
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(
                      ['/extranet/sctr/cotizacion-evaluacion'], 
                      { queryParams: { typeTransacTecnica: this.quotationDataTra.TypeTransac } }
                    );
                  });
            }else{
                swal.fire({
                    title: 'Información',
                    text: '¿Deseas continuar con la emisión de póliza?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar'
                }).then(async (result) => {
                    if (result.value) {
                        await this.emitirContrac();
                    }
                    else {
                        console.log('No se continua con la generación de póliza');
                    }
                });
            }         
        }

    }

    async emitirContrac() {
        if (this.inputsQuotation.facturacionVencido == true) {
            this.isLoading = false;
            let myFormData: FormData = new FormData()
            this.savedPolicyList = [];
            // this.ListainsertEmit = [];  //AVS - INTERCONEXION SABSA
            await this.dataEmisionSCTR(); // this.savedPolicyList
            // await this.insertEmitDet();  //AVS - INTERCONEXION SABSA this.ListainsertEmit

            if (this.files.length > 0) {
                this.files.forEach(file => {
                    myFormData.append('adjuntos', file, file.name);
                });
            }

            myFormData.append('objeto', JSON.stringify(this.savedPolicyList));
            // myFormData.append('emisionMapfre', JSON.stringify(this.emisionMapfre));
            // myFormData.append('objetoDet', JSON.stringify(this.ListainsertEmit));

            // swal.fire({
            //     title: 'Información',
            //     text: '¿Deseas continuar con la emisión de póliza?',
            //     icon: 'question',
            //     showCancelButton: true,
            //     confirmButtonText: 'Continuar',
            //     allowOutsideClick: false,
            //     cancelButtonText: 'Cancelar'
            // })
            //     .then((result) => {
            //         if (result.value) {
            //             this.isLoading = true;
            this.policyService.savePolicyEmit(myFormData)
                .subscribe((res: any) => {
                    this.isLoading = false;
                    if (res.P_COD_ERR == 0) {
                        // this.flagEmailNull = true;
                        let policyPension = 0;
                        let policySalud = 0;
                        let constancia = 0

                        policyPension = Number(res.P_POL_PENSION);
                        policySalud = Number(res.P_POL_SALUD);
                        constancia = Number(res.P_NCONSTANCIA);

                        this.nroPension = policyPension;
                        this.nroSalud = policySalud;

                        if (policyPension > 0 && policySalud > 0) {

                            swal.fire({
                                title: 'Información',
                                text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' y la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            }).then(async (result) => {
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
                                }).then(async (result) => {
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
                                }).then(async (result) => {
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
            //     }
            // });
        } else {
            this.isLoading = false;
            this.savedPolicyList = [];
            await this.dataEmisionSCTR(); // this.savedPolicyList
            this.OpenModalPagos(this.savedPolicyList);
        }
    }

    async updateContracting() {
        const response: any = {};
        this.isLoading = true;
        this.contractingdata.EListAddresClient = null;
        this.contractingdata.EListPhoneClient = null;
        this.contractingdata.EListCIIUClient = null;
        await this.clientInformationService.validateContractingData(this.contractingdata).toPromise().then(
            res => {
                response.code = res.P_NCODE;
                response.message = res.P_SMESSAGE;
                if (res.P_NCODE == '0' || res.P_NCODE == '2') {
                    this.isLoading = false;
                    this.flagContact = false;
                    this.flagEmail = false;
                } else {
                    if (this.template.ins_addContact && this.contactList.length > 0) {
                        this.contractingdata.EListContactClient = [];
                    }
                    this.isLoading = false;
                    // swal.fire('Información', res.P_SMESSAGE, 'error');
                    // return;
                }
            }, error => {
                response.code = '1';
                response.message = 'La solicitud no pudo ser procesada [Cliente 360]';
            }
        );

        return response;
    }

    // getInfoAuth() {
    //     let data: any = {};
    //     data.QuotationNumber = this.quotationNumber;
    //     if (this.AuthorizedList.length > 0) {
    //         data.RateAuthorizedEmp = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'EMPLEADO').map(m => m.RateAuthorized));
    //         data.RateAuthorizedObr = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'OBRERO').map(m => m.RateAuthorized));
    //         data.RateAuthorizedOar = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'OBRERO ALTO RIESGO').map(m => m.RateAuthorized));
    //     } else {
    //         data.RateAuthorizedEmp = 0;
    //         data.RateAuthorizedObr = 0;
    //         data.RateAuthorizedOar = 0;
    //     }
    //     data.AuthorizedList = this.AuthorizedList;
    //     data.AuthorizedCommission = this.inputsQuotation.CommissionAuthorized;

    //     this.quotationService.getInfoQuotationAuth(data).subscribe(
    //         res => {
    //             this.categoryList = res.CategoryList;
    //             this.CommissionList = res.CommissionList;
    //             this.CommissionList.forEach(element => {
    //                 this.inputsQuotation.PensionMinPremium = element.MinPremium;
    //                 this.inputsQuotation.desTipoComision = element.Commission;
    //                 this.inputsQuotation.desTipoPlan = element.Plan;
    //                 this.inputsQuotation.CommissionProposed = element.CommissionProposed;
    //                 this.inputsQuotation.CommissionAuthorized = element.CommissionAuthorized;
    //             });

    //             this.CalculateList = res.CalculateList;
    //             this.CalculateDetailList = res.CalculateDetailList;
    //             this.ProposalList = res.ProposalList;
    //             this.ProposalDetailList = res.ProposalDetailList;
    //             this.AuthorizedList = res.AuthorizedList;
    //             this.AuthorizedDetailList = res.AuthorizedDetailList;

    //             this.inputsQuotation.desTipoPlan = this.descPlanBD; //msr
    //             if (this.mode == 'Visualizar' && this.flagGobiernoEstado) {
    //                 this.visualAprobEstado = true;
    //             }

    //             // if (this.inputsQuotation.SPolMatriz == 1) {
    //             //     this.flagGobiernoMatriz = true;
    //             //     //this.isPolizaMatriz = this.flagGobiernoMatriz;
    //             //     //EAER -  Gestion de tramites con el Estado Sin trama
    //             //     this.loadDatosCotizadorPolizaMatriz();
    //             // }
    //         },
    //         err => {
    //         }
    //     );
    // }

    // changeAuthorizedRate(event, valor, row) {
    //     /*this.arrayRateProposed = [];

    //     if (this.AuthorizedList.length == 1) {
    //       if (this.AuthorizedList[0].CategoryAuthorized == 'EMPLEADO') {
    //         this.getInfoAuth(this.AuthorizedList[0].RateAuthorized, 0);
    //       } else {
    //         this.getInfoAuth(0, this.AuthorizedList[0].RateAuthorized);
    //       }
    //     } else {
    //       this.getInfoAuth(this.AuthorizedList[0].RateAuthorized, this.AuthorizedList[1].RateAuthorized);
    //     }*/
    //     this.getInfoAuth();
    // }

    // changePropossedRate(event, valor, row) {
    //     /*if (this.ProposalList.length == 1) {
    //       if (this.ProposalList[0].CategoryProposal == 'EMPLEADO') {
    //         this.getInfoProp(this.ProposalList[0].RateProposal, 0);
    //       } else {
    //         this.getInfoProp(0, this.ProposalList[0].RateProposal);
    //       }
    //     } else {
    //       this.getInfoProp(this.ProposalList[0].RateProposal, this.ProposalList[1].RateProposal);
    //     }*/
    //     this.getInfoProp();
    // }

    // getInfoProp() {
    //     const data: any = {};
    //     data.QuotationNumber = this.quotationNumber;
    //     if (this.ProposalList.length > 0) {
    //         data.RateProposedEmp = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'EMPLEADO').map(m => m.RateProposal));
    //         data.RateProposedObr = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO').map(m => m.RateProposal));
    //         data.RateProposedOar = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO ALTO RIESGO').map(m => m.RateProposal));
    //     } else {
    //         data.RateProposedEmp = 0;
    //         data.RateProposedObr = 0;
    //         data.RateProposedOar = 0;
    //     }
    //     data.ProposalList = this.ProposalList;
    //     data.ProposedCommission = this.inputsQuotation.CommissionProposed;

    //     this.quotationService.getInfoQuotationAuth(data).subscribe(
    //         res => {
    //             this.categoryList = res.CategoryList;
    //             this.CommissionList = res.CommissionList;
    //             this.CommissionList.forEach(element => {
    //                 this.inputsQuotation.PensionMinPremium = element.MinPremium;
    //                 this.inputsQuotation.desTipoComision = element.Commission;
    //                 this.inputsQuotation.desTipoPlan = element.Plan;
    //                 this.inputsQuotation.CommissionProposed = element.CommissionProposed;
    //                 this.inputsQuotation.CommissionAuthorized = element.CommissionAuthorized;
    //             });
    //             this.ProposalList = [];
    //             this.ProposalDetailList = [];
    //             res.ProposalList.forEach(element => {
    //                 const itemAmountProposed: any = {};
    //                 itemAmountProposed.CategoryProposal = element.CategoryProposal;
    //                 itemAmountProposed.RateProposal = CommonMethods.formatValor(element.RateProposal, 2)
    //                 itemAmountProposed.PremiumProposal = CommonMethods.formatValor(element.PremiumProposal, 2);
    //                 itemAmountProposed.CategoryCode = element.CategoryCode;
    //                 this.ProposalList.push(itemAmountProposed);
    //             });
    //             res.ProposalDetailList.forEach(element => {
    //                 const itemProposalDetail: any = {};
    //                 itemProposalDetail.DescriptionProposal = element.DescriptionProposal;
    //                 itemProposalDetail.AmountProposal = CommonMethods.formatValor(element.AmountProposal, 2)
    //                 this.ProposalDetailList.push(itemProposalDetail);
    //             });
    //         },
    //         err => {
    //         }
    //     );
    // }

    // PrintPropose(): void {
    //     if (!!this.CalculateList) {
    //         if (this.CalculateList.length > 0) {
    //             this.ProposalList = []
    //             this.CalculateList.forEach(element => {
    //                 if (this.inputsQuotation.frecuenciaPago == 5) {
    //                     const itemAmountProposed: any = {};
    //                     itemAmountProposed.CategoryProposal = element.SCATEGORIA;
    //                     itemAmountProposed.RateProposal = CommonMethods.formatValor(element.NTASA, 2);
    //                     itemAmountProposed.PremiumProposal = CommonMethods.formatValor(element.NPREMIUMN_MEN, 2);
    //                     this.ProposalList.push(itemAmountProposed);
    //                 }
    //             });
    //         }
    //     }
    // }

    // validarExcel(codComission?: any) {
    //     this.btnCotiza = codComission == 100 ? false : codComission == 99 ? true : this.btnCotiza;
    //     this.btnNormal = codComission == 99 ? false : codComission == 100 ? true : this.btnNormal;

    //     if (codComission === undefined) {
    //         this.btnNormal = true;
    //         this.isRateProposed = false;
    //     }

    //     let msg = '';
    //     if (this.inputsQuotation.tipoRenovacion === '') {
    //         msg += 'Debe elegir el tipo de renovación  <br>';
    //     }

    //     if (this.inputsQuotation.P_NPRODUCT === '-1') {
    //         msg += 'Debe elegir el producto a cotizar  <br>';
    //     }

    //     if (this.inputsQuotation.P_COMISION === '') {
    //         this.validateField[16] = '1';
    //         msg += 'Debe ingresar el porcentaje de comisión <br>';
    //     }

    //     if (this.isProposedCommission) {
    //         if (this.inputsQuotation.commissionProposed == null) {
    //             this.validateField[20] = '20';
    //             msg += 'Ingrese la comisión.<br>';
    //         }
    //     }

    //     if (this.inputsQuotation.P_COMISION === '') {
    //         msg += 'Debe elegir la comisión  <br>';
    //     }

    //     if (this.excelSubir == null && !(this.flagGobiernoEstado && this.flagGobiernoMatriz)) {
    //         msg += 'Adjunte una trama para validar  <br>'
    //     }

    //     if (msg === '') {
    //         this.validarTrama(codComission);
    //         this.hiddenPolizaMatriz = false;
    //     } else {
    //         if (codComission == undefined) {
    //             swal.fire('Información', msg, 'error');
    //         }
    //     }
    // };

    // seleccionExcel(archivo: File) {
    //     this.excelSubir = null;
    //     this.hiddenPolizaMatriz = false;
    //     if (!archivo) {
    //         this.excelSubir = null;
    //         return;
    //     }
    //     this.tasasList = [];
    //     this.rateByPlanList = [];
    //     this.excelSubir = archivo;
    // }

    // GetAmountDetailTotalListValue(tipo, freq): number {   // usado para setear  montos del cotizador en EC
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_MEN)[tipo];
    //         } else if (freq == 4) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_BIM)[tipo];
    //         } else if (freq == 3) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TRI)[tipo];
    //         } else if (freq == 2) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_SEM)[tipo];
    //         } else if (freq == 1) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_ANU)[tipo];
    //         } else if (freq == 9) {
    //             valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TOT)[tipo];
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    // onProposed(event) {
    //     if (event.target.checked) {
    //         this.commissionState = false;
    //     } else {
    //         this.commissionState = true;
    //         this.inputsQuotation.commissionProposed = null;
    //         this.inputsQuotation.rateObrProposed = null;
    //         this.inputsQuotation.rateEmpProposed = null;
    //         this.validateField[16] = '';
    //         this.validateField[20] = '';
    //         this.validateField[21] = '';
    //         this.validateField[22] = '';
    //     }

    // }


    async ngOnInit() {
        this.getPlanList();
        this.createFormControl();
        this.initializeForm();

        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
        this.brokerProfile = this.variable.var_prefilExterno;
        this.codProfile = await this.getProfileProduct(); // 20230325;
        this.inputsQuotation.primaMinimaPension = this.codProducto == 2 ? this.variable.var_primaMinimaPension : '';

        this.quotationDataTra = JSON.parse(sessionStorage.getItem('cs-quotation'));
        const quotationData = this.quotationDataTra;
        // console.log(quotationData);
        //#region Flag de reverso para vley
        this.flagReverse();
        //#endregion

        this.route.queryParams
            .subscribe(params => {
                this.typeTransacTecnica = params.typeTransacTecnica;
                this.origin = !!params.origin ? params.origin : 'quotation';
            });

        console.log(this.origin)
        await this.getRateTypeList();

        //const quotationData = JSON.parse(sessionStorage.getItem('cs-quotation'));
        if (!!quotationData) {
            this.quotationNumber = quotationData.QuotationNumber;
            this.productoId = quotationData.ProductId;
            this.status = quotationData.Status;
            this.mode = quotationData.Mode;
            // console.log('Datos del modo', this.mode)
            this.from = quotationData.From;
            this.policyNumber = quotationData.PolicyNumber;
            this.typeTran = quotationData.TypeTransac;
            this.transactNumber = quotationData.TransactNumber;
            this.userAssigned = quotationData.UserCodeAssigned;
            this.inputsQuotation.tipoTransaccion = this.tipoTransaccion();
            this.flagGobiernoEstado = quotationData.SPOL_ESTADO == 1 ? true : false;
            this.flagGobiernoMatriz = quotationData.SPOL_MATRIZ == 1 ? true : false;
            this.flagAprobCli = quotationData.APROB_CLI == 1 ? true : false;
            this.mailEjecCom = quotationData.SMAIL_EJECCOM;
            this.flagCipEmit = this.quotationDataTra.NCIP_STATUS_PEN == 0 && this.quotationDataTra.NCIP_STATUS_EPS == 0 ? 1 : 0;
            this.flagViewDetail = quotationData.Detail == 1 ? true : false;

            if (this.typeTransacTecnica == "Renovación" || this.typeTransacTecnica == "Inclusión") {
                this.flagCipEmit = (this.quotationDataTra.NCIP_STATUS_PEN == 0 || this.quotationDataTra.NCIP_STATUS_PEN == 23) && (this.quotationDataTra.NCIP_STATUS_EPS == 0 || this.quotationDataTra.NCIP_STATUS_EPS == 23) ? 1 : 0;
            }

            if (!!!this.quotationNumber || !!!this.mode) {
                this.router.navigate(['/extranet/home']);
            } else {
                this.loadInfoLabel();
                this.canProposeRate = AccessFilter.hasPermission('13');
                this.canSeeRiskRate = AccessFilter.hasPermission('36');
                this.mainFormGroup.controls.gloss.disable();
                this.perfil = this.codProfile;
                if (this.perfil == 137 || this.perfil == 5) {
                    this.mainFormGroup.controls.gloss.enable();
                }
                this.isLoading = true;
                await this.getDataConfig();
                await this.getIGVData();
                await this.getPlanList(); //LSR
                this.getStatusList();

                this.getGlossList();

                this.getComisionList(this.quotationNumber);
                await this.motivosAnulacion();

                this.filter.QuotationNumber = this.quotationNumber;
                this.filter.PageNumber = 1;
                this.filter.LimitPerPage = 5;
                // if (this.isTransact) this.getUsersList();
                this.firstSearch();
                await this.getPerfilTramiteOpe();
                this.isLoading = false;

                // console.log('ONINIT');
                // console.log('this.codProducto: ' + this.codProducto);
                // console.log('this.mode: ' + this.mode);
                // console.log('this.flagCipEmit: ' + this.flagCipEmit);
                // console.log('this.status: ' + this.status);
                // console.log('this.perfil: ' + this.perfil);
                // console.log('this.flagCipEmit: ' + this.flagCipEmit);
            }

        } else {
            this.router.navigate(['/extranet/sctr/consulta-cotizacion']);

        }

        if (this.typeTran == "Emisión" || this.typeTran == "Emisión") {
            this.FechaEfectoInicial = this.inputsQuotation.inicioVigencia;
        } else {
            this.FechaEfectoInicial = this.inputsQuotation.FDateIniAseg;
        }
        this.getStatusEstadoList();
    }

    loadInfoLabel() {
        switch (this.mode) {
            // case 'Recotizar':
            //     this.enabledPensionProposedRate = false;
            //     this.enabledHealthProposedRate = false;
            //     this.enabledHealthMinPropPremium = false;
            //     this.enabledPensionMinPropPremium = false;
            //     this.enabledHealthMainPropCommission = false;
            //     this.enabledPensionMainPropCommission = false;
            //     this.enabledHealthSecondaryPropCommission = false;
            //     this.enabledPensionSecondaryPropCommission = false;
            //     this.evaluationLabel = 'Datos adjuntos';
            //     this.buttonName = 'RECOTIZAR';
            //     break;
            case 'Evaluar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'CONTINUAR';
                break;
            case 'Emitir':
                if (this.currentUser.profileId != 137) {
                    this.evaluationLabel = 'Evaluación';
                    this.buttonName = 'Emitir';
                    this.typeTran == 'Emisión de certificados' ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                    this.emitirPolizaOperaciones = (this.typeTran == 'Emisión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                    this.emitirPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                    this.isTransact = this.emitirPolizaOperaciones;
                    if (this.emitirPolizaMatrizTramiteEstado) { // para poliza matriz
                        this.isTransact = this.emitirPolizaMatrizTramiteEstado;
                    }
                    if (this.isTransact) {
                        this.titleTransact = this.typeTran;
                    }
                }else {
                    this.hideBoxPension = false;
                    this.hideBoxSalud = false;
                }
                
                break;
            case 'EmitirR':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Emitir';
                break;
            case 'Autorizar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Autorizar';
                break;
            case 'Renovar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = this.typeTran == 'Declaración' ? 'Declarar' : 'Renovar';
                this.procesarPolizaOperaciones = ((this.typeTran == 'Declaración' || this.typeTran == 'Renovación') && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.procesarPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                    this.questionTextEstado = this.typeTran == 'Declaración' ? '¿Deseas hacer la declaración de la póliza?' : '¿Deseas hacer la renovación de la póliza?';
                }
                break;
            case 'Incluir':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Incluir';
                this.procesarPolizaOperaciones = (this.typeTran == 'Inclusión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.procesarPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                    this.questionTextEstado = '¿Desea realizar la inclusión de asegurados?';
                }
                break;
            case 'Endosar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Endosar';
                this.procesarPolizaOperaciones = (this.typeTran == 'Endoso' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.procesarPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                    this.questionTextEstado = '¿Deseas hacer el endoso de la póliza?';
                }
                break;
            case 'Excluir':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Excluir';
                this.procesarPolizaOperaciones = (this.typeTran == 'Exclusión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.procesarPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                    this.questionTextEstado = '¿Deseas hacer la exclusión de asegurados?';
                }
                break;
            case 'Asignar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Asignar';
                this.isTransact = true;
                this.titleTransact = 'Asignar trámite de ' + (this.typeTran == 'Broker' ? 'Modificación de Broker' : this.typeTran);
                this.isReasignar = this.userAssigned == 0 ? false : true;
                break;
            case 'Evaluar Tramite':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Iniciar Trámite';
                this.titleTransact = 'Evaluar trámite de ' + this.typeTran
                this.isTransact = true;
                break;
            case 'Visualizar':
                if (this.currentUser.profileId == 137) { //AVS - INTERCONEXION SABSA
                    this.hideBoxPension = false;
                    this.hideBoxSalud = false;
                }
                this.evaluationLabel = 'Evaluación';
                this.buttonName = this.generateButtonName();
                this.isTransact = this.from == 'transact1' || this.from == 'transact2' ? true : false;
                this.titleTransact = 'Visualizar trámite de ' + this.typeTran;
                break;
            case 'Continuar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Continuar';
                this.titleTransact = 'Continuar trabajando el trámite de ' + this.typeTran
                this.isTransact = true;
                break;
            case 'Enviar':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Enviar';
                this.titleTransact = 'Enviar trámite de ' + this.typeTran + ' a ejecutivo comercial'
                this.isTransact = this.from == 'transact1' || this.from == 'transact2' ? true : false;
                console.log('this.isTransact');
                console.log(this.isTransact);
                // this.enviarPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                break;
            case 'Iniciado':
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Emitir';
                this.titleTransact = this.typeTran;
                this.isPolizaMatriz = (this.from == 'transact1' || this.from == 'transact2') && this.flagGobiernoMatriz ? true : false;
                this.hiddenPolizaMatriz = this.isPolizaMatriz;
                // this.flagGobiernoIniciado = this.flagGobiernoEstado && this.typeTran == 'Emisión' ? true : false;
                // this.iniciadoPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                // this.emitirCertificadoOperaciones = this.typeTran == 'Emisión de certificados' || (this.typeTran == 'Emisión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                // this.isTransact = this.iniciadoPolizaMatrizTramiteEstado ? true : this.flagGobiernoIniciado;
                break;
            case 'EmitirC': // modo emision de certificados cuando viene de tecnica
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Emitir Certificados';
                this.typeTran == 'Emisión de certificados' ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                this.emitirPolizaOperaciones = (this.typeTran == 'Emisión de certificados' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.emitirPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                }
                break;
            case 'EmitirC': // modo emision de certificados cuando viene de tecnica
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'Emitir Certificados';
                this.typeTran == 'Emisión de certificados' ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                this.emitirPolizaOperaciones = (this.typeTran == 'Emisión de certificados' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                this.isTransact = this.emitirPolizaOperaciones;
                if (this.isTransact) {
                    this.titleTransact = this.typeTran;
                }
                break;
            default:
                this.buttonName = 'Emitir';
                break;
        }

        this.TitleOperacion = this.mode == 'Emitir' && this.typeTran == 'Emisión de certificados' && this.typeTran == 'Emisión' ? this.typeTran : this.mode;////JDD SUSCRIPCION SCTR

        this.TitleOperacion = this.inputsQuotation.NFLAG_STRAME == 1 && this.status == 'APROBADO' && this.typeTran == 'Emisión' && this.flagViewDetail ? 'Visualizar': this.TitleOperacion ;
    }

    generateButtonName() {

        let buttonName = 'Emitir'

        if (this.typeTran == 'Renovación') {
            buttonName = 'Renovar'
        }

        if (this.typeTran == 'Inclusión') {
            buttonName = 'Incluir'
        }

        if (this.typeTran == 'Exclusión') {
            buttonName = 'Excluir'
        }

        if (this.typeTran == 'Anulación') {
            buttonName = 'Anular'
        }

        return buttonName;
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

    /**
    * Obtener flag de perfil Ope
    */
    async getPerfilTramiteOpe() {
        let dataQuotation: any = {};
        dataQuotation.P_NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
        dataQuotation.P_NPRODUCT = 1;
        dataQuotation.P_NPERFIL = this.codProfile;
        this.transactService.getPerfilTramiteOpe(dataQuotation).subscribe(
            res => {
                // this.resProfileOpe = res;
                this.isProfileOpe = res.P_NFLAG_PERFIL;
            },
            error => {

            }
        );
    }

    flagReverse() {
        this.inputsQuotation.reverseFlag = false;

    }

    getGlossList() {
        this.quotationService.getGlossList().subscribe(
            res => {
                this.glossList = res;
            }
        );
    }

    async getPlanList() {
        const data = {
            P_NBRANCH: this.vidaLeyID.nbranch,
            P_NPRODUCT: this.vidaLeyID.id,
            P_NTIP_RENOV: 0,
            P_NCURRENCY: this.inputsQuotation.COD_MONEDA == null ? 1 : this.inputsQuotation.COD_MONEDA,
            P_NIDPLAN: 0
        }
        await this.quotationService.getPlans(data).toPromise().then(
            res => {
                this.planList = res;
                // if(this.planList[0] != undefined){
                //     this.inputsQuotation.desTipoPlanPM = this.planList[0].SDESCRIPT.toUpperCase();
                // }

            },
            err => {
            }
        );
    }

    // validarTrama(codComission?: any) {

    //     this.isLoading = true;
    //     const myFormData: FormData = new FormData();

    //     this.quotationService.getProcessCode(this.quotationNumber).subscribe(
    //         res => {
    //             this.nidprodEmisionEstado = this.nidProc;
    //             this.nidProc = res;
    //             myFormData.append('dataFile', this.isRateProposed ? null : this.excelSubir);
    //             const data: any = {};
    //             data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //             data.fechaEfecto = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //             data.comision = this.inputsQuotation.P_COMISION;
    //             data.tipoRenovacion = this.inputsQuotation.tipoRenovacion;
    //             data.freqPago = this.inputsQuotation.frecuenciaPago;
    //             data.codProducto = this.vidaLeyID.id;
    //             data.flagCot = this.flagCotN;
    //             data.codActividad = this.inputsQuotation.TechnicalActivityId == null ? '' : this.inputsQuotation.TechnicalActivityId;
    //             data.flagComisionPro = this.isProposedCommission == true ? '1' : '0';
    //             data.comisionPro = this.inputsQuotation.commissionProposed == undefined ? '' : this.inputsQuotation.commissionProposed;
    //             data.tasaObreroPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[0];
    //             data.tasaEmpleadoPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[1];
    //             data.codProceso = this.nidProc;
    //             data.nroCotizacion = this.flagGobiernoIniciado ? null : this.quotationNumber != null ? this.quotationNumber : null;
    //             data.flagPolizaEmision = null;
    //             data.codRamo = this.nbranch;
    //             data.remExc = this.inputsQuotation.NREM_EXC;
    //             // if (this.flagGobiernoIniciado) {
    //                 // data.planesList = null;
    //                 // data.categoryList = this.categoryList;
    //                 // data.type_mov = 1;
    //                 // data.fechaFin = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
    //                 // data.fechaExpiracion = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
    //                 // data.NCURRENCY = '1';
    //                 // data.excludeType = '0';
    //                 // data.flagPolizaEmision = this.isRateProposed ? 1 : null;
    //                 // data.codProceso = this.isRateProposed ? this.nidprodEmisionEstado : '';
    //                 // delete data.tasaObreroPro;
    //                 // delete data.tasaEmpleadoPro;


    //             // }
    //             myFormData.append('objValida', JSON.stringify(data));
    //             this.quotationService.valTrama(myFormData).subscribe(
    //                 res => {
    //                     this.isLoading = false;
    //                     if (res.baseError.P_COD_ERR == 1) {
    //                         swal.fire('Información', res.baseError.P_MESSAGE, 'error');
    //                     } else {
    //                         this.erroresList = res.baseError.errorList;

    //                         if (res.P_COD_ERR == '1') {
    //                             swal.fire('Información', res.P_MESSAGE, 'error');
    //                         } else {
    //                             if (this.erroresList != null) {
    //                                 if (this.erroresList.length > 0) {

    //                                     const modalRef = this.modalService.open(ValErrorComponent, {
    //                                         size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false
    //                                     });
    //                                     modalRef.componentInstance.formModalReference = modalRef;
    //                                     modalRef.componentInstance.erroresList = this.erroresList;
    //                                 } else {
    //                                     this.nidProc = res.NIDPROC;
    //                                     this.processID = res.NIDPROC;
    //                                     this.categoryList = res.categoryList;
    //                                     this.rateByPlanList = res.rateByPlanList;
    //                                     if (this.flagGobiernoIniciado) {
    //                                         this.detailPlanList = res.detailPlanList;
    //                                         this.amountPremiumList = res.amountPremiumList;
    //                                         this.categoryList = res.categoryList; //this.categoryList.length > 0 ? this.categoryList : res.categoryList;
    //                                         this.amountPremiumList.forEach(element => {
    //                                             element.sactive = true;

    //                                         });
    //                                     }
    //                                     this.amountDetailTotalList = res.amountDetailTotalList;
    //                                     this.categoryList.forEach(element => {
    //                                         element.sactive = true;
    //                                         const total = this.categoryList.reduce(function (prev, sum) {
    //                                             return prev + sum.NCOUNT;
    //                                         }, 0);
    //                                         if (this.inputsQuotation.frecuenciaPago == 1) {
    //                                             this.sprimaMinima = 'PRIMA MÍNIMA ANUAL';
    //                                         } else {
    //                                             this.sprimaMinima = 'PRIMA MÍNIMA MENSUAL';
    //                                         }

    //                                     });

    //                                     this.rateByPlanList.forEach(element => {
    //                                         if (codComission === undefined) {
    //                                             if (element.NTASA != 0) {
    //                                                 this.btnCotiza = false;
    //                                             } else {
    //                                                 this.btnCotiza = true;
    //                                             }
    //                                         }
    //                                         element.sactive = true;
    //                                     });

    //                                     this.detailPlanList.forEach(element => {
    //                                         this.inputsQuotation.P_PRIMA_MIN_PENSION = element.PRIMA_MINIMA;
    //                                         this.inputsQuotation.desTipoPlan = element.DET_PLAN;
    //                                         this.inputsQuotation.desTipoPlanPM = element.DET_PLAN;
    //                                         this.planPropuesto = element.DET_PLAN;
    //                                     });

    //                                     this.CalculateList.forEach(element => {
    //                                         element.sactive = true;
    //                                     });

    //                                     if (this.categoryList.length == 0) {
    //                                         swal.fire('Información', 'No se ha encontrado registros en la trama cargada', 'error');
    //                                     } else {
    //                                         if (codComission == undefined) {
    //                                             swal.fire('Información', 'Se validó correctamente la trama', 'success');
    //                                         }
    //                                     }

    //                                 }
    //                             } else {
    //                                 swal.fire('Información', 'El archivo enviado contiene errores', 'error');
    //                             }
    //                         }
    //                     }
    //                 },
    //                 err => {
    //                     this.isLoading = false;
    //                 }
    //             );
    //         },
    //         err => {

    //         }
    //     );

    // }

    async getComisionList(nrocotizacion: any) {
        this.quotationService.getComisionList(nrocotizacion).subscribe(
            res => {
                this.comisionList = res;
            }
        );
    }

    async getDataConfig() {
        await this.policyService.getDataConfig('DIASRETRO_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayRetroConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );

        await this.policyService.getDataConfig('DIASADD_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );

        //
    }

    createFormControl() { // Crear 'mainFormGroup'
        this.mainFormGroup = this.mainFormBuilder.group({
            reason: [''], // Razón de cambio de estado
            status: ['', [Validators.required]],  // Nuevo estado de cotización
            comment: [''], // Comentario adicional para el cambio de estado de cotización
            gloss: [''], // Razón de cambio de estado
            glossComent: [''] // Comentario adicional para el cambio de estado de cotización
        });
    }

    initializeForm() {  // Inicializar 'mainFormGroup'
        this.mainFormGroup.controls.reason.setValue('');
        this.mainFormGroup.controls.status.setValue('');
        this.mainFormGroup.controls.comment.setValue('');
        this.mainFormGroup.controls.gloss.setValue('');
        this.mainFormGroup.controls.glossComent.setValue('');
        this.validateField[16] = '';
    }

    // Este método transforma una url 'insegura' en una 'segura' para evitar la alteración del 'sanitizer de html'
    getSafeUrl(unsafeUrl: string) {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }

    async downloadFile(filePath: string): Promise<any> {  // Descargar archivos de cotización
        this.othersService.downloadFile(filePath).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    const newBlob = new Blob([res], { type: 'application/pdf' });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);
                    const link = document.createElement('a');
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

    /**Obtiene el IGV para Salud y el IGV x Derecho de emisión para Pensión */
    async getIGVData() {
        this.isLoading = true;

        const data = ['I', 'D']

        // Pension
        for (let item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionProductId.nbranch;
            itemIGV.P_NPRODUCT = this.pensionProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.pensionIGV = item == 'I' ? res : this.pensionIGV;
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension;
                }
            );
        }

        // Salud
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.healthProductId.nbranch;
            itemIGV.P_NPRODUCT = this.healthProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.healthIGV = item == 'I' ? res : this.healthIGV;
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud;
                }
            );
        }

        // Vida  Ley
        // let itemIGV: any = {};
        // itemIGV.P_NBRANCH = this.vidaLeyID.nbranch;
        // itemIGV.P_NPRODUCT = this.vidaLeyID.id;
        // itemIGV.P_TIPO_REC = 'A';

        // await this.quotationService.getIGV(itemIGV).toPromise().then(
        //     res => {
        //         this.vidaLeyIGV = res;
        //     }
        // );


        await this.getQuotationData();
        // console.log('this.inputsQuotation');
        // console.log(this.inputsQuotation);
        //await this.getPagosKushki();
    }

    /**
     * Obtiene una lista de estados de cotización
     */
    getStatusList() {
        this.statusList = [];
        this.quotationService.getStatusList('3', this.codProducto).subscribe(
            res => {
                res.forEach(element => {
                    if (element.Id == '2' || element.Id == '3') {
                        if (element.Id == '3') { element.Name = 'NO PROCEDE' }
                        this.statusList.push(element);
                    }
                });
            },
            error => {

            }
        );
    }
    /**
     * Obtiene una lista de motivos por estado escogido
     */
    //Ini EAER - GESTION TRAMITES ESTADO  - 03102022
    getStatusEstadoList() {
        this.statusEstadoList = [];
        let data: any = {};
        data.P_NID_TRAMITE = this.transactNumber;
        data.P_NID_COTIZACION = this.quotationNumber;
        this.transactService.GetHistTransact(data).subscribe(
            res => {
                const result = res.filter((obj) => {
                    return obj.NPERFIL === 8 && (obj.NSTATUS_TRA === 5 || obj.NSTATUS_TRA === 2);
                });
                if ((this.emitirPolizaMatrizTramiteEstado && result.length > 0) || (this.flagGobiernoMatriz && this.flagGobiernoEstado && this.isTransact && this.mode == 'Enviar')) {
                    this.statusEstadoList.push({ Id: "25", Name: "Reevaluar Técnica" });
                }
                this.statusEstadoList.push({ Id: "2", Name: "Aprobado" });
                this.statusEstadoList.push({ Id: "6", Name: "Rechazar" });
            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }
    //Fin EAER - GESTION TRAMITES ESTADO  - 03102022
    getReasonList(event) {
        const selectElementText = event.target['options']
        [event.target['options'].selectedIndex].text;
        this.statusChange = selectElementText;
        if (this.mainFormGroup.controls.status.value == '3') {
            this.quotationService.getReasonList(this.mainFormGroup.controls.status.value).subscribe(
                res => {
                    this.reasonList = res;
                }
            );
        } else {
            this.reasonList = null;
        }
    }


    /**
     * Obtiene el monto de planilla según el tipo de riesgo
     * @param riskTypeId id de tipo de riesgo
     */
    getPayrollAmount(riskTypeId: string) {
        let payRollAmount;
        this.inputsQuotation.SharedDetailsList.forEach(element => {
            if (element.RiskTypeId == riskTypeId) { payRollAmount = element.PayrollAmount; }
        });
        return payRollAmount;
    }

    /**
     * Calcula la prima
     * @param payrollAmount monto de planilla
     * @param rate tasa
     */
    calculatePremium(payrollAmount: number, rate: number) {
        // return Number(payrollAmount.toString()) * Number(rate.toString());
        return Number(payrollAmount.toString()) * Number(rate.toString()) / 100;
    }

    /**
     * Calcula la nueva prima según la tasa autorizada ingresada
     * Calcula la nueva prima total neta, IGV a la prima neta y la prima total bruta.
     * @param authorizedRate valor de ngModel de tasa autorizada
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    // calculateNewPremiums(authorizedRate: any, riskTypeId: string, productId: string) {
    //     console.log('calculateNewPremiums');
    //     if (!this.template.debug_dummy) {
    //         let planProp = authorizedRate != '' ? Number(authorizedRate) : 0;
    //         planProp = isNaN(planProp) ? 0 : planProp;
    //         authorizedRate = planProp;
    //         // let self = this;
    //         if (productId == this.healthProductId.id) {
    //             if (authorizedRate > 100) {
    //                 this.inputsQuotation.SaludDetailsList.forEach(item => {
    //                     if (item.RiskTypeId == riskTypeId) {
    //                         item.valItemAu = true;
    //                     }
    //                 });
    //             }
    //             else {
    //                 this.inputsQuotation.SaludDetailsList.forEach(item => {
    //                     if (item.RiskTypeId == riskTypeId) {
    //                         item.valItemAu = false;
    //                     }
    //                 });
    //             }
    //         } else if (productId == this.pensionProductId.id) {
    //             if (authorizedRate > 100) {
    //                 this.inputsQuotation.PensionDetailsList.forEach(item => {
    //                     if (item.RiskTypeId == riskTypeId) {
    //                         item.valItemAu = true;
    //                     }
    //                 });
    //             }
    //             else {
    //                 this.inputsQuotation.PensionDetailsList.forEach(item => {
    //                     if (item.RiskTypeId == riskTypeId) {
    //                         item.valItemAu = false;
    //                     }
    //                 });
    //             }
    //         }

    //         if (isNaN(authorizedRate) || authorizedRate.toString().trim() == '') authorizedRate = 0; //Si el input está limpio, lo convertimos a 0

    //         let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), authorizedRate), 2); //cálculo de prima nueva con la tasa autorizada
    //         if (productId == this.pensionProductId.id) { //Si el producto es pensión
    //             let pensionNewNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
    //             this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
    //                 if (element.RiskTypeId == riskTypeId) {
    //                     this.inputsQuotation.PensionDetailsList[key].NewPremium = newPremium;
    //                     pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(newPremium.toString());
    //                 } else pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(element.NewPremium.toString());

    //             });

    //             //Cálculo de nueva prima total neta de Pensión
    //             this.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(pensionNewNetAmount, 2);
    //             //Cálculo de Prima Comercial de Pensión
    //             this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
    //             //Cálculo de IGV de la nueva prima total neta de Pensión
    //             this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNewNetAmount, 2);
    //             console.log('calculateNewPremiums');
    //             console.log(this.inputsQuotation.PensionNewCalculatedIGV);
    //             //Cálculo de nueva prima total bruta de Pensión
    //             this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);
    //             this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
    //         }

    //         if (productId == this.healthProductId.id) { //Si el producto es Salud
    //             let saludNewNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
    //             this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
    //                 if (element.RiskTypeId == riskTypeId) {
    //                     this.inputsQuotation.SaludDetailsList[key].NewPremium = newPremium;
    //                     saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(newPremium.toString());
    //                 } else saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(element.NewPremium.toString());
    //             });
    //             //Cálculo de nueva prima total neta de Salud
    //             this.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(saludNewNetAmount, 2);
    //             //Cálculo de Prima Comercial de Pensión
    //             this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
    //             //Cálculo de IGV de la nueva prima total neta de Salud
    //             this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);
    //             //Cálculo de nueva prima total bruta de Salud
    //             this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

    //             this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
    //         }
    //     }

    // }

    // changeTasaPropuestaPension(planPro, valor) {
    //     console.log('changeTasaPropuestaPension');
    //     let planProp = planPro != '' ? Number(planPro) : 0;
    //     planProp = isNaN(planProp) ? 0 : planProp;
    //     let self = this;

    //     if (planProp > 100) {
    //         this.inputsQuotation.PensionDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = true;
    //             }
    //         });
    //     }
    //     else {
    //         this.inputsQuotation.PensionDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = false;
    //             }
    //         });
    //     }
    // }

    // changeTasaPropuestaSalud(planPro, valor) {
    //     let planProp = planPro != '' ? Number(planPro) : 0;
    //     planProp = isNaN(planProp) ? 0 : planProp;
    //     let self = this;

    //     if (planProp > 100) {
    //         this.inputsQuotation.SaludDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = true;
    //             }
    //         });
    //     }
    //     else {
    //         this.inputsQuotation.SaludDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = false;
    //             }
    //         });
    //     }
    // }

    /**
     * Calcula la prima según la tasa propuesta ingresada
     * Calcula la prima total neta, IGV a la prima neta y la prima total bruta.
     * @param rate valor de ngModel de tasa propuesta
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    // calculatePremiums(rate: any, riskTypeId: string, productId: string) {
    //     console.log('calculatePremiums');
    //     if (isNaN(rate) || rate.toString().trim() == '') rate = 0; //Si el input está limpio, lo convertimos a 0

    //     let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), rate), 2); //cálculo de prima nueva con la tasa autorizada
    //     if (productId == this.pensionProductId.id) { //Si el producto es pensión
    //         let pensionTotalNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
    //         this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
    //             if (element.RiskTypeId == riskTypeId) {
    //                 this.inputsQuotation.PensionDetailsList[key].Premium = newPremium;
    //                 pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(newPremium.toString());
    //             } else pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(element.NewPremium.toString());

    //         });
    //         //Cálculo de nueva prima total neta de Pensión
    //         this.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(pensionTotalNetAmount, 2);
    //         //Cálculo de nueva prima comercial de Pension
    //         this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(pensionTotalNetAmount * this.dEmiPension, 2);
    //         //Cálculo de IGV de la nueva prima total neta de Pensión
    //         this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNetAmount, 2);
    //         //Cálculo de nueva prima total bruta de Pensión
    //         this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);

    //         console.log('calculatePremiums IGV: ' + this.inputsQuotation.PensionCalculatedIGV);
    //     }
    //     if (productId == this.healthProductId.id) { //Si el producto es Salud
    //         let saludTotalNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
    //         this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
    //             if (element.RiskTypeId == riskTypeId) {
    //                 this.inputsQuotation.SaludDetailsList[key].Premium = newPremium;
    //                 saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(newPremium.toString());
    //             } else saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(element.NewPremium.toString());
    //         });
    //         //Cálculo de nueva prima total neta de Salud
    //         this.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(saludTotalNetAmount, 2);
    //         //Cálculo de nueva prima comercial de Salud
    //         this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(saludTotalNetAmount * this.dEmiSalud, 2);
    //         //Cálculo de IGV de la nueva prima total neta de Salud
    //         this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * this.healthIGV) - this.inputsQuotation.SaludNetAmount, 2);
    //         //Cálculo de nueva prima total bruta de Salud
    //         this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);
    //     }

    //     if (Number(this.inputsQuotation.SaludNetAmount) < Number(this.inputsQuotation.SaludMinPremium)) {
    //         this.isNetPremiumLessThanMinHealthPremium = true;
    //         let premium = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
    //         // this.healthMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.healthIGV;
    //         this.healthMessage = this.variable.var_msjPrimaMin;
    //     } else {
    //         this.isNetPremiumLessThanMinHealthPremium = false;
    //         this.healthMessage = '';
    //     }

    //     if (Number(this.inputsQuotation.PensionNetAmount) < Number(this.inputsQuotation.PensionMinPremium)) {
    //         this.isNetPremiumLessThanMinPensionPremium = true;
    //         let premium = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : this.inputsQuotation.PensionMinPremium;
    //         // this.pensionMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.pensionIGV;
    //         this.pensionMessage = this.variable.var_msjPrimaMin;
    //     } else {
    //         this.isNetPremiumLessThanMinPensionPremium = false;
    //         this.pensionMessage = '';
    //     }

    // }

    //AVS - INTERCONEXION SABSA - ORDENAMIENTO
    // customSort(arr, order) {
    //     return arr.sort((a, b) => {
    //         const indexA = order.indexOf(a.RiskTypeName);
    //         const indexB = order.indexOf(b.RiskTypeName);
    //         if (indexA === -1 && indexB === -1) return 0;
    //         if (indexA === -1) return 1;
    //         if (indexB === -1) return -1;
    //         return indexA - indexB;
    //     });
    // }

    getTypeTransaction() {
        this.typeMovement = 0;

        switch (this.mode.slice(0, 2).toUpperCase()) {
            case 'RE':
                this.typeMovement = 4;
                break;
            case 'IN':
                this.typeMovement = 2;
                break;
            case 'EX':
                this.typeMovement = 3;
                break;
            case 'AN':
                this.typeMovement = 7;
                break;
            case 'CA':
                this.typeMovement = 7;
                break;
            case 'EN':
                this.typeMovement = 8;
                break;
            default:
                this.typeMovement = 1;
                break;
        }
    }

    /*
    async getPagosKushki() {
        debugger;
        console.log(this.quotationNumber);
        console.log(this.inputsQuotation.NID_PROC_SCTR);
        console.log(this.quotationNumber);
        console.log(this.inputsQuotation.NID_PROC_EPS);
        console.log(this.typeMovement);
        (this.policyService.getPagoKushki(this.quotationNumber, this.inputsQuotation.NID_PROC_SCTR, this.quotationNumber, this.inputsQuotation.NID_PROC_EPS, this.inputsQuotation.tipoTransaccion).toPromise().then(
            (res: any) =>{
                this.tipo_pago_PEN = res.P_STIPO_PAGO_PEN;
                this.slink_PEN = res.P_SLINK_PEN;
                this.tipo_pago_SAL = res.P_STIPO_PAGO_SAL;
                this.slink_SAL = res.P_SLINK_SAL;

                console.log('getPagosKushki()')
                console.log(this.tipo_pago_PEN)
                console.log(this.tipo_pago_SAL)
            }
        ));
    }*/

    /**
     * Obtener los datos de la cotización, para ello se llama a 3 procedimientos
     * getPolicyEmitCab: Obtiene los datos principales de cotización, cliente, sede.
     * getPolicyEmitComer: Obtiene los brokers incluidos en la cotización
     * getPolicyEmitDet: Obtiene detalles de la cotización como montos de planilla, total de trabajadores, primas, tasas según producto y riesgo
     */
    async getQuotationData() {  //Obtener datos de cotización: cabecera, brokers y detalles.
        this.isLoading = true;
        let self = this;
        let typeMovement = '0';

        forkJoin(this.policyService.getPolicyEmitCab(this.quotationNumber,
            typeMovement,
            JSON.parse(localStorage.getItem('currentUser'))['id']),
            this.policyService.getPolicyEmitComer(this.quotationNumber, this.isCotizacion),
            this.policyService.getPolicyEmitDet(this.quotationNumber,
                JSON.parse(localStorage.getItem('currentUser'))['id'])).toPromise().then(
                    async (res: any) => {
                        // console.log(res)
                        if (res[0].GenericResponse.COD_ERR == 1 ||
                            !!res[0].GenericResponse.MENSAJE) {
                            swal.fire('Información', res[0].GenericResponse.MENSAJE, 'error');
                            this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                        } else {
                            if (res[0].StatusCode == 2) {
                                swal.fire('Información', this.listToString(res[0].ErrorMessageList), 'warning');
                            }
                            // console.log('res[0]');
                            // console.log(res[0]);
                            this.EstadoCliente(res[0].GenericResponse.SCLIENT);
                            this.valMixSAPSA = res[0].GenericResponse.NCOT_MIXTA; //AVS - INTERCONEXION SABSA 
                            this.idProductoCabecera = res[0].GenericResponse.NPRODUCT; //AVS - INTERCONEXION SABSA 
                            this.valCIPSCTR_PEN = res[0].GenericResponse.NCIP_STATUS_PEN ?? 0;
                            this.valCIPSCTR_EPS = res[0].GenericResponse.NCIP_STATUS_EPS ?? 0;
                            this.inputsQuotation.P_NID_PROC = res[0].GenericResponse.NID_PROC;
                            this.inputsQuotation.SCLIENT = res[0].GenericResponse.SCLIENT;
                            if (this.valCIPSCTR_PEN !== 21 && this.valCIPSCTR_PEN !== 22 && this.valCIPSCTR_PEN !== 23) {
                                this.valCIPSCTR_PEN = 0;
                            }

                            if (this.valCIPSCTR_EPS !== 21 && this.valCIPSCTR_EPS !== 22 && this.valCIPSCTR_EPS !== 23) {
                                this.valCIPSCTR_EPS = 0;
                            }
                            // console.log('this.valCIPSCTR_EPS');
                            // console.log(this.valCIPSCTR_EPS);
                            this.codCIP_PEN = res[0].GenericResponse.SCIP_NUMBER_PEN;
                            this.codCIP_EPS = res[0].GenericResponse.SCIP_NUMBER_EPS;
                            // Datos de cotización
                            this.inputsQuotation.Date = res[0].GenericResponse.FECHA_REGISTRO; //
                            this.cotEstado = res[0].GenericResponse.ESTADO_COT;
                            this.inputsQuotation.NBRANCH = res[0].GenericResponse.NBRANCH; //
                            this.inputsQuotation.NPRODUCT = res[0].GenericResponse.NPRODUCT; //
                            this.inputsQuotation.FACTURA_ANTICIPADA = res[0].GenericResponse.FACTURA_ANTICIPADA;
                            this.inputsQuotation.NPOLICY = res[0].GenericResponse.NPOLICY;
                            this.inputsQuotation.DELIMITACION = res[0].GenericResponse.DELIMITACION;
                            this.inputsQuotation.NID_PROC_SCTR = res[0].GenericResponse.NID_PROC_SCTR;
                            this.inputsQuotation.NID_PROC_EPS = res[0].GenericResponse.NID_PROC_EPS;

                            //Datos de contratante
                            this.inputsQuotation.DocumentTypeId = res[0].GenericResponse.TIPO_DOCUMENTO;
                            this.inputsQuotation.DocumentTypeName = res[0].GenericResponse.TIPO_DES_DOCUMENTO;
                            this.inputsQuotation.DocumentNumber = res[0].GenericResponse.NUM_DOCUMENTO;
                            this.inputsQuotation.P_SNOMBRES = res[0].GenericResponse.NOMBRE_RAZON;
                            this.inputsQuotation.P_SDESDIREBUSQ = res[0].GenericResponse.DIRECCION;
                            this.inputsQuotation.P_SE_MAIL = res[0].GenericResponse.CORREO;

                            //Datos de cotización - sede
                            this.inputsQuotation.CurrencyId = res[0].GenericResponse.COD_MONEDA;
                            this.inputsQuotation.CurrencyName = res[0].GenericResponse.DES_MONEDA;
                            this.inputsQuotation.LocationId = res[0].GenericResponse.COD_TIPO_SEDE;
                            this.inputsQuotation.LocationName = res[0].GenericResponse.DES_TIPO_SEDE;

                            //Ini RQ2025-4
                            this.renderSede(this.inputsQuotation.LocationName);
                            //Fin RQ2025-4

                            this.inputsQuotation.EconomicActivityId = res[0].GenericResponse.COD_ACT_ECONOMICA;
                            this.inputsQuotation.EconomicActivityName = res[0].GenericResponse.DES_ACT_ECONOMICA;
                            this.inputsQuotation.TechnicalActivityId = res[0].GenericResponse.ACT_TECNICA;
                            this.inputsQuotation.TechnicalActivityName = res[0].GenericResponse.DES_ACT_TECNICA;
                            this.inputsQuotation.DELIMITACION = res[0].GenericResponse.DELIMITACION,
                                this.inputsQuotation.HasDelimiter = Number(res[0].GenericResponse.DELIMITACION) == 0 ? false : true;
                            this.inputsQuotation.IsMining = Number(res[0].GenericResponse.MINA) == 0 ? false : true;
                            this.inputsQuotation.DepartmentId = res[0].GenericResponse.COD_DEPARTAMENTO;
                            this.inputsQuotation.DepartmentName = res[0].GenericResponse.DES_DEPARTAMENTO;
                            this.inputsQuotation.ProvinceId = res[0].GenericResponse.COD_PROVINCIA;
                            this.inputsQuotation.ProvinceName = res[0].GenericResponse.DES_PROVINCIA;
                            this.inputsQuotation.DistrictId = res[0].GenericResponse.COD_DISTRITO;
                            this.inputsQuotation.DistrictName = res[0].GenericResponse.DES_DISTRITO;

                            this.inputsQuotation.tipoRenovacion = res[0].GenericResponse.TIP_RENOV;
                            this.inputsQuotation.desTipoRenovacion = res[0].GenericResponse.DES_TIP_RENOV;
                            this.inputsQuotation.frecuenciaPago = res[0].GenericResponse.FREQ_PAGO;
                            this.inputsQuotation.desFrecuenciaPago = res[0].GenericResponse.DES_FREQ_PAGO;
                            this.inputsQuotation.tipoComision = res[0].GenericResponse.TIP_COMISS;
                            this.inputsQuotation.desTipoComision = res[0].GenericResponse.DES_TIP_COMISS;
                            this.inputsQuotation.inicioVigencia = new Date(res[0].GenericResponse.EFECTO_ASEGURADOS)
                            this.inputsQuotation.finVigencia = new Date(res[0].GenericResponse.EXPIRACION_ASEGURADOS)
                            this.inputsQuotation.NTYPE_TRANSAC = res[0].GenericResponse.NTYPE_TRANSAC;

                            this.inputsQuotation.Comment = res[0].GenericResponse.COMENTARIO;
                            this.filesTransacEmitcab = res[0].GenericResponse.RUTAS;

                            this.filesTransac = await this.getDetailRouteTransac();
                            this.inputsQuotation.FilePathList = this.filesTransac.FilesRouteTransac;

                            // this.inputsQuotation.NFLAG_STRAME = res[0].GenericResponse.NFLAG_STRAME;
                            this.inputsQuotation.NRATETYPE = res[0].GenericResponse.STIPO_COTIZACION != '' ? res[0].GenericResponse.STIPO_COTIZACION : 1;
                            this.inputsQuotation.NNULL_CODE = res[0].GenericResponse.NNULL_CODE; // JDD SCTR SUSCRIPCION

                            this.inputsQuotation.NFLAG_STRAME = !!this.typeTran ? this.typeTran == 'Emisión' ? res[0].GenericResponse.NFLAG_STRAME : 1 : res[0].GenericResponse.NFLAG_STRAME;

                            this.mode = this.inputsQuotation.NFLAG_STRAME == 1 && this.status == 'APROBADO' && this.typeTran == 'Emisión' ? 'Emitir' : this.mode;//JDD SUSCRIPCION SCTR
                            


                            this.loadInfoLabel();
                            console.log('typeTran', this.typeTran);

                            //this.inputsQuotation.SaludPropMinPremium = res[0].GenericResponse.MIN_SALUD_PR == '0' ? res[0].GenericResponse.MIN_SALUD : res[0].GenericResponse.MIN_SALUD_PR; //AVS - INTERCONEXION SABSA -- WV comentado
                            // this.inputsQuotation.SaludPropMinPremium = res[0].GenericResponse.MIN_SALUD_PR;// WV Agregado
                            // this.originalHealthMinPropPremium = res[0].GenericResponse.MIN_SALUD_PR;

                            // this.inputsQuotation.HealthAuthMinPremium = res[0].GenericResponse.MIN_SALUD_AUT;
                            // this.originalHealthMinAuthPremium = this.inputsQuotation.HealthAuthMinPremium;
                            // this.inputsQuotation.SaludMinPremium = res[0].GenericResponse.MIN_SALUD;
                            // //this.inputsQuotation.PensionPropMinPremium = res[0].GenericResponse.MIN_PENSION_PR == '0' ? res[0].GenericResponse.MIN_PENSION : res[0].GenericResponse.MIN_PENSION_PR; //AVS - INTERCONEXION SABSA -- WV Comentado
                            // this.inputsQuotation.PensionPropMinPremium = res[0].GenericResponse.MIN_PENSION_PR;// WV Agregado
                            // this.originalPensionMinPropPremium = res[0].GenericResponse.MIN_PENSION_PR;
                            // this.inputsQuotation.PensionMinPremium = res[0].GenericResponse.MIN_PENSION;
                            // this.inputsQuotation.PensionAuthMinPremium = res[0].GenericResponse.MIN_PENSION_AUT == '0' ? res[0].GenericResponse.MIN_PENSION : res[0].GenericResponse.MIN_PENSION_AUT; //AVS - INTERCONEXION SABSA

                            // this.originalPensionMinAuthPremium = this.inputsQuotation.PensionAuthMinPremium;
                            this.getInfoExperia(res);
                            this.validateDelimitationRules();



                            //Datos de brokers
                            this.inputsQuotation.SecondaryBrokerList = [];
                            // console.log('res[1]');
                            // console.log(res[1]);
                            res[1].forEach(item => {
                                item.COMISION_PENSION = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION);
                                item.COMISION_PENSION_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO);
                                //item.COMISION_PENSION_AUT = item.COMISION_PENSION_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                                item.COMISION_PENSION_AUT = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                                item.COMISION_SALUD_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO);
                                item.COMISION_SALUD = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD);
                                item.COMISION_SALUD_AUT = item.COMISION_SALUD_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_AUT);
                                item.valItemSal = false;
                                item.valItemSalPr = false;
                                item.valItemPen = false;
                                item.valItemPenPr = false;
                                item.OriginalHealthPropCommission = item.COMISION_SALUD_PRO;
                                item.OriginalPensionPropCommission = item.COMISION_PENSION_PRO;
                                item.OriginalHealthAuthCommission = item.COMISION_SALUD_AUT;
                                item.OriginalPensionAuthCommission = item.COMISION_PENSION_AUT;
                                item.CANAL = item.CANAL;
                                item.SCLIENT = item.SCLIENT;
                                item.TIPO_CANAL = item.TIPO_CANAL;
                                self.inputsQuotation.SecondaryBrokerList.push(item);
                            });

                            // Detalles de cotización
                            // this.inputsQuotation.SharedDetailsList = []; // Lista compartida que contiene Nro de trabajadores y Monto de planilla
                            this.listaTasasPension = []; // Lista de detalles de Pensión, cada registro contiene: riesgo, tasa, prima, tasa propuesta
                            this.listaTasasSalud = []; // Lista de detalles de Salud, cada registro contiene: riesgo, tasa, prima, tasa propuesta

                            /*Saldos Temporales con todos los decimales*/
                            // this.inputsQuotation.Temp_SaludNetAmount = 0.00; // Prima total neta de Salud
                            // this.inputsQuotation.Temp_SaludPrimaComercial = 0.00 // Prima Comercial de Salud
                            // this.inputsQuotation.Temp_SaludGrossAmount = 0.00; // Prima total bruta de Salud
                            // this.inputsQuotation.Temp_SaludCalculatedIGV = 0.00; // Igv de prima total neta de Salud

                            // this.inputsQuotation.Temp_PensionNetAmount = 0.00; // Prima total neta de Pensión
                            // this.inputsQuotation.Temp_PensionPrimaComercial = 0.00 // Prima Comercial de Pension
                            // this.inputsQuotation.Temp_PensionGrossAmount = 0.00; // Prima total bruta de Pensión
                            // this.inputsQuotation.Temp_PensionCalculatedIGV = 0.00; // Igv de prima total neta de Pensión

                            // /*Saldos Finales*/
                            // this.inputsQuotation.SaludNetAmount = 0.00; // Prima total neta de Salud
                            // this.inputsQuotation.SaludPrimaComercial = 0.00 // Prima Comercial de Salud
                            // this.inputsQuotation.SaludGrossAmount = 0.00; // Prima total bruta de Salud
                            // this.inputsQuotation.SaludCalculatedIGV = 0.00; // Igv de prima total neta de Salud

                            // this.inputsQuotation.PensionNetAmount = 0.00; // Prima total neta de Pensión
                            // this.inputsQuotation.PensionPrimaComercial = 0.00 // Prima Comercial de Pension
                            // this.inputsQuotation.PensionGrossAmount = 0.00; // Prima total bruta de Pensión
                            // this.inputsQuotation.PensionCalculatedIGV = 0.00; // Igv de prima total neta de Pensión

                            // this.inputsQuotation.SaludNewNetAmount = 0.00;  // Nueva Prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.SaludNewPrimaComercial = 0.00 // Nueva Prima Comercial, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.SaludNewGrossAmount = 0.00;  // Nueva Prima total bruta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.SaludNewCalculatedIGV = 0.00;  // Nuevo Igv de prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas

                            // this.inputsQuotation.PensionNewNetAmount = 0.00;  // Nueva Prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.PensionNewPrimaComercial = 0.00 // Nueva Prima Comercal, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.PensionNewGrossAmount = 0.00;  // Nueva Prima total bruta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                            // this.inputsQuotation.PensionNewCalculatedIGV = 0.00;  // Nuevo Igv de prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                            this.getTypeTransaction();
                            await this.getPolicyCot();

                            // console.log(this.inputsQuotation.NPOLICY);

                            if (this.perfil == 137) {
                                if (this.inputsQuotation.NPOLICY) {
                                    this.validate_button_action_perfil = false;
                                } else {
                                    this.validate_button_action_perfil = true;
                                }
                            }
                            else {
                                this.validate_button_action_perfil = true;
                            }

                            console.log('this.perfil', this.perfil)
                            console.log(this.validate_button_action_perfil)

                            // console.log('res[2]');
                            // console.log(res[2]);

                            let itemPen = res[2].filter(item => item.ID_PRODUCTO == '1');
                            this.generarInfo(itemPen, '1');
                            console.log('this.infoPension', this.infoPension)
                            console.log('this.listaTasasPension', this.listaTasasPension)


                            let itemSal = res[2].filter(item => item.ID_PRODUCTO == '2');
                            this.generarInfo(itemSal, '2');
                            console.log('this.infoSalud', this.infoSalud)
                            console.log('this.listaTasasSalud', this.listaTasasSalud)
                            this.tasasList = this.listaTasasPension.length > 0 ? this.listaTasasPension : this.listaTasasSalud;

                            console.log('this.tasasList', this.tasasList)
                            this.dataPension(this.infoPension);
                            this.dataSalud(this.infoSalud);


                            // res[2].forEach(element => {
                            //     if (element.ID_PRODUCTO == this.pensionProductId.id && this.codProducto == '2') { // Si es un elemento de pensión
                            //         let item: any = {};
                            //         item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                            //         item.RiskTypeId = element.TIP_RIESGO; // Id tipo de riesgo
                            //         if (element.DES_RIESGO.search('Alto') != -1) {
                            //             element.DES_RIESGO = 'Alto (Obreros)'

                            //         } if (element.DES_RIESGO.search('Bajo') != -1) {
                            //             element.DES_RIESGO = 'Bajo (Administrativos)'
                            //         }
                            //         if (element.DES_RIESGO.toUpperCase().includes('FLAT')) {//AVS - INTERCONEXION SABSA
                            //             element.DES_RIESGO = 'Riesgo medio';
                            //         }

                            //         item.RiskTypeName = element.DES_RIESGO; // Nombre de tipo de riesgo
                            //         item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  // Tasa
                            //         //item.Premium = this.cotEstado != 2 ? CommonMethods.formatValor(element.PRIMA, 2) : CommonMethods.formatValor(element.AUT_PRIMA, 2); //Prima WV comentado
                            //         item.Premium = CommonMethods.formatValor(Number(element.MONTO_PLANILLA) * ((Number(element.TASA_PRO) > 0 ? Number(element.TASA_PRO) : Number(element.TASA_CALC)) / 100), 2); //Prima WV Agregado
                            //         item.Premium2 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                            //         item.Premium3 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                            //         item.Premium6 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                            //         item.Premium12 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                            //         // item.ProposedRate = this.cotEstado != 2 ? CommonMethods.formatValor(element.TASA_PRO, 6) : CommonMethods.formatValor(element.TASA, 6); //Tasa propuesta
                            //         item.ProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta
                            //         item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                            //         item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                            //         item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                            //         //item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2); WV Comentado
                            //         //item.NewPremium = CommonMethods.formatValor(Number(element.MONTO_PLANILLA) * (Number(element.TASA) / 100), 2);//WV agregado
                            //         item.NewPremium = CommonMethods.formatValor(Number(element.MONTO_PLANILLA) * (Number(element.TASA) / 100), 2);//WV agregado
                            //         item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                            //         item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                            //         item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa.
                            //         item.valItemAu = false;
                            //         item.valItemPr = false;
                            //         self.inputsQuotation.PensionDetailsList.push(item);

                            //         console.log('==============CALCULOS================');
                            //         //self.inputsQuotation.PensionNetAmount = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN, 2) : self.inputsQuotation.PensionNewNetAmount;
                            //         //self.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(element.NSUM_PREMIUMN, 2); // WV comentado
                            //         //self.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNetAmount) + Number(item.Premium), 2); // WV agregado //CFCM COMENTADO
                            //         self.inputsQuotation.Temp_PensionNetAmount = Number(self.inputsQuotation.Temp_PensionNetAmount) + Number(item.Premium);

                            //         // self.inputsQuotation.PensionPrimaComercial = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiPension, 2) : CommonMethods.formatValor(self.inputsQuotation.PensionNetAmount * self.dEmiPension, 2);
                            //         //self.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiPension, 2);// WV comentado
                            //         //self.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor((Number(self.inputsQuotation.PensionPrimaComercial) + Number(item.Premium)) * self.dEmiPension, 2);// WV agregado //CFCM COMENTADO
                            //         self.inputsQuotation.Temp_PensionPrimaComercial = ((Number(self.inputsQuotation.Temp_PensionPrimaComercial) + Number(item.Premium)) * self.dEmiPension); //CFCM Agrregad0

                            //         // self.inputsQuotation.PensionCalculatedIGV = this.cotEstado != 2 ? CommonMethods.formatValor((element.NSUM_PREMIUMN * this.pensionIGV) - element.NSUM_PREMIUMN, 2) : CommonMethods.formatValor((self.inputsQuotation.PensionNetAmount * this.pensionIGV) - self.inputsQuotation.PensionNetAmount, 2);
                            //         //self.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((element.NSUM_PREMIUMN * this.pensionIGV) - element.NSUM_PREMIUMN, 2);// WV comentado
                            //         //self.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor(Number(self.inputsQuotation.PensionCalculatedIGV) + ((item.Premium * this.pensionIGV) - item.Premium), 2);// WV Agregado (element.PRIMA * this.pensionIGV) - element.PRIMA, 2) //CFCM COMENTADO
                            //         self.inputsQuotation.Temp_PensionCalculatedIGV = Number(self.inputsQuotation.Temp_PensionCalculatedIGV) + ((item.Premium * this.pensionIGV) - item.Premium); //CFCM agregado
                            //         console.log('self.inputsQuotation.PensionCalculatedIGV' + self.inputsQuotation.PensionCalculatedIGV);
                            //         console.log('(item.Premium * this.pensionIGV)' + (item.Premium * this.pensionIGV));


                            //         //self.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionPrimaComercial) + Number(self.inputsQuotation.PensionCalculatedIGV), 2);// CFCM COMENTADO
                            //         self.inputsQuotation.Temp_PensionGrossAmount = Number(self.inputsQuotation.Temp_PensionPrimaComercial) + Number(self.inputsQuotation.Temp_PensionCalculatedIGV); //CFCM AGREGADO

                            //         //Setear Valores Redondeados Pension
                            //         self.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(self.inputsQuotation.Temp_PensionNetAmount, 2); // Prima total neta de Pensión
                            //         self.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(self.inputsQuotation.Temp_PensionPrimaComercial, 2); // Prima Comercial de Pension
                            //         self.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(self.inputsQuotation.Temp_PensionGrossAmount, 2); // Prima total bruta de Pensión
                            //         self.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor(self.inputsQuotation.Temp_PensionCalculatedIGV, 2); // Igv de prima total neta de Pensión

                            //         //Nueva Prima
                            //         //self.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNewNetAmount) + Number(element.AUT_PRIMA), 2); WV Comentado
                            //         self.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNewNetAmount) + Number(item.NewPremium), 2);
                            //         self.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor((Number(self.inputsQuotation.PensionNewPrimaComercial) + Number(item.NewPremium)) * self.dEmiPension, 2);
                            //         //self.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNewCalculatedIGV) + ((item.NewPremium * this.pensionIGV) - item.NewPremium), 2);
                            //         self.inputsQuotation.PensionNewCalculatedIGV = Number(self.inputsQuotation.PensionNewCalculatedIGV) + ((item.NewPremium * this.pensionIGV) - item.NewPremium);



                            //         item.WorkersCount = element.NUM_TRABAJADORES;
                            //         item.PayrollAmount = element.MONTO_PLANILLA;
                            //     }

                            //     if (element.ID_PRODUCTO == this.healthProductId.id && this.codProducto == '2') { //Si es un elemento de pensión
                            //         let item: any = {};
                            //         item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                            //         item.RiskTypeId = element.TIP_RIESGO; //Id tipo de riesgo
                            //         if (element.DES_RIESGO.search('Alto') != -1) {
                            //             element.DES_RIESGO = 'Alto (Obreros)'
                            //         }

                            //         if (element.DES_RIESGO.search('Bajo') != -1) {
                            //             element.DES_RIESGO = 'Bajo (Administrativos)'
                            //         }
                            //         if (element.DES_RIESGO.toUpperCase().includes('FLAT')) { //AVS - INTERCONEXION SABSA
                            //             element.DES_RIESGO = 'Riesgo medio';
                            //         }
                            //         item.RiskTypeName = element.DES_RIESGO; //Nombre de tipo de riesgo
                            //         item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  //Tasa
                            //         // item.Premium = this.cotEstado != 2 ? CommonMethods.formatValor(element.PRIMA, 2) : CommonMethods.formatValor(element.AUT_PRIMA, 2); //Prima AGF Antes
                            //         //item.Premium = CommonMethods.formatValor(element.PRIMA, 2); //Prima WV comentado
                            //         item.Premium = CommonMethods.formatValor(Number(element.MONTO_PLANILLA) * ((Number(element.TASA_PRO) > 0 ? Number(element.TASA_PRO) : Number(element.TASA_CALC)) / 100), 2); // WV Agregado
                            //         // item.ProposedRate = this.cotEstado != 2 ? CommonMethods.formatValor(element.TASA_PRO, 6) : CommonMethods.formatValor(element.TASA, 6); //Tasa propuesta
                            //         item.ProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta
                            //         item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                            //         item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                            //         item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                            //         // item.NewPremium = CommonMethods.formatValor(element.NSUM_PREMIUMN, 2); // Cambio AGF
                            //         item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2); // Cambio AGF
                            //         item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                            //         item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                            //         item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa
                            //         item.valItemAu = false;
                            //         item.valItemPr = false;
                            //         self.inputsQuotation.SaludDetailsList.push(item);

                            //         // console.log(element.AUT_PRIMA); // Cambiar a "NSUM_PREMIUMN"
                            //         self.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludNewNetAmount) + Number(element.NSUM_PREMIUMN), 2); // Cambio AGF element.AUT_PRIMA


                            //         // self.inputsQuotation.SaludNetAmount = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN, 2) : self.inputsQuotation.SaludNewNetAmount;
                            //         //self.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(element.NSUM_PREMIUMN, 2); // WV comentado
                            //         // self.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludNetAmount) + Number(item.Premium), 2); // WV agregado //CFCM COMENTADO
                            //         self.inputsQuotation.Temp_SaludNetAmount = Number(self.inputsQuotation.Temp_SaludNetAmount) + Number(item.Premium); // CFCM AGREGADO


                            //         // self.inputsQuotation.SaludPrimaComercial = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiSalud, 2) : CommonMethods.formatValor(self.inputsQuotation.SaludNetAmount * self.dEmiSalud, 2);
                            //         //self.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiSalud, 2); // WV comentado
                            //         // self.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor((Number(self.inputsQuotation.SaludPrimaComercial) + Number(item.Premium)) * self.dEmiSalud, 2); //CFCM COMENTADO
                            //         self.inputsQuotation.Temp_SaludPrimaComercial = ((Number(self.inputsQuotation.Temp_SaludPrimaComercial) + Number(item.Premium)) * self.dEmiSalud); //CFCM AGREGADO


                            //         // self.inputsQuotation.SaludCalculatedIGV = this.cotEstado != 2 ? CommonMethods.formatValor((element.NSUM_PREMIUMN * this.healthIGV) - element.NSUM_PREMIUMN, 2) : CommonMethods.formatValor((self.inputsQuotation.SaludNetAmount * this.healthIGV) - self.inputsQuotation.SaludNetAmount, 2);
                            //         //self.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((element.NSUM_PREMIUMN * this.healthIGV) - element.NSUM_PREMIUMN, 2); // WV comentado
                            //         self.inputsQuotation.Temp_SaludCalculatedIGV = Number(self.inputsQuotation.Temp_SaludCalculatedIGV) + ((item.Premium * this.healthIGV) - item.Premium);


                            //         // self.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludPrimaComercial) + Number(self.inputsQuotation.SaludCalculatedIGV), 2);
                            //         self.inputsQuotation.Temp_SaludGrossAmount = Number(self.inputsQuotation.Temp_SaludPrimaComercial) + Number(self.inputsQuotation.Temp_SaludCalculatedIGV);

                            //         //Setear Valores redondeados Salud
                            //         self.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(self.inputsQuotation.Temp_SaludNetAmount, 2);
                            //         self.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(self.inputsQuotation.Temp_SaludPrimaComercial, 2);
                            //         self.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor(self.inputsQuotation.Temp_SaludCalculatedIGV, 2);
                            //         self.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(self.inputsQuotation.Temp_SaludGrossAmount, 2);

                            //         item.WorkersCount = element.NUM_TRABAJADORES;
                            //         item.PayrollAmount = element.MONTO_PLANILLA;
                            //     }

                            //     if (this.template.ins_categoriaList) {
                            //         let itemCategory: any = {};
                            //         itemCategory.SCATEGORIA = element.DES_RIESGO;
                            //         itemCategory.NCOUNT = element.NUM_TRABAJADORES;
                            //         itemCategory.NTOTAL_PLANILLA = element.MONTO_PLANILLA;
                            //         itemCategory.NTASA = 0;
                            //         this.categoryList.push(itemCategory);
                            //     }

                            //     let add = true;
                            //     self.inputsQuotation.SharedDetailsList.forEach(subelement => {
                            //         if (subelement.RiskTypeId == element.TIP_RIESGO) add = false;
                            //     });
                            //     if (add == true) self.inputsQuotation.SharedDetailsList.push({ 'RiskTypeId': element.TIP_RIESGO, 'RiskTypeName': element.DES_RIESGO, 'WorkersCount': element.NUM_TRABAJADORES, 'PayrollAmount': element.MONTO_PLANILLA });
                            // });

                            //AVS - INTERCONEXION SABSA 19/10/2023                              
                            // Definir el orden personalizado
                            // const customOrder = ["Riesgo alto", "Riesgo medio", "Riesgo bajo", "Medio"];
                            // this.customSort(this.inputsQuotation.SharedDetailsList, customOrder);
                            // this.customSort(this.inputsQuotation.SaludDetailsList, customOrder);
                            // this.customSort(this.inputsQuotation.PensionDetailsList, customOrder);

                            this.dataClient();
                            console.log(this.creditHistory);
                            if (this, this.inputsQuotation.NFLAG_STRAME == 1) {
                                this.inputsQuotation.prePayment = await this.obtenerPagoDirectoSCTR();
                            }
                            /*this.inputsQuotation.PensionNewPrimaComercial =
                                CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);*/ // WV Comentado

                            /*this.inputsQuotation.PensionNewCalculatedIGV =
                                CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNewNetAmount, 2);*/

                            // console.log('getQuotationData');
                            // console.log('this.inputsQuotation.PensionNewCalculatedIGV');
                            // console.log(this.inputsQuotation.PensionNewCalculatedIGV);

                            // console.log(this.inputsQuotation.PensionNewNetAmount + ' * ' + this.pensionIGV.toString() + ' - ' + this.inputsQuotation.PensionNewNetAmount);


                            // this.inputsQuotation.PensionNewGrossAmount =
                            //     CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);


                            // this.inputsQuotation.SaludNewPrimaComercial =
                            //     CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);


                            // this.inputsQuotation.SaludNewCalculatedIGV =
                            //     CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);


                            // this.inputsQuotation.SaludNewGrossAmount =
                            //     CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

                            // if (this.mode == 'Recotizar') {
                            //     this.checkMinimunPremiumForOriginals(this.healthProductId.id);
                            //     this.checkMinimunPremiumForOriginals(this.pensionProductId.id);

                            // } else {
                            //     this.checkMinimunPremiumAmounts(this.healthProductId.id, self.inputsQuotation.SaludNetAmount); //WV agregado
                            //     this.checkMinimunPremiumAmounts(this.pensionProductId.id, self.inputsQuotation.PensionNetAmount); //WV agregado


                            //     this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
                            //     this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
                            // }

                            // console.log('NIDPROC');
                            // console.log(this.inputsQuotation.NID_PROC);
                            // console.log(this.inputsQuotation.NID_PROC_SCTR);
                            // console.log(this.inputsQuotation.NID_PROC_EPS);

                            // console.log('getPagoKushki');
                            // (this.policyService.getPagoKushki(this.quotationNumber, this.codCIP_PEN, this.quotationNumber, this.codCIP_EPS, this.inputsQuotation.tipoTransaccion).toPromise().then(
                            (this.policyService.getPagoKushki(this.quotationNumber, this.codCIP_PEN, this.quotationNumber, this.codCIP_EPS, this.inputsQuotation.tipoTransaccion).toPromise().then(
                                (res: any) => {
                                    this.tipo_pago_PEN = res.P_STIPO_PAGO_PEN;
                                    this.slink_PEN = res.P_SLINK_PEN;
                                    this.tipo_pago_SAL = res.P_STIPO_PAGO_SAL;
                                    this.slink_SAL = res.P_SLINK_SAL;

                                    // console.log('Tipo pagos');
                                    // //console.log(this.codProducto);
                                    // console.log('Tipo pago pensión');
                                    // console.log(this.tipo_pago_PEN);
                                    // console.log('Tipo pago salud');
                                    // console.log(this.tipo_pago_SAL);

                                    // console.log('Código pago pensión');
                                    // console.log(this.codCIP_PEN);
                                    // console.log('Código pago salud');
                                    // console.log(this.codCIP_EPS);

                                    // console.log('Mixta');
                                    // console.log(this.valMixSAPSA);

                                    // console.log('Estado PEN');
                                    // console.log(this.valCIPSCTR_PEN);

                                    // console.log('Estado EPS');
                                    // console.log(this.valCIPSCTR_EPS);

                                    this.isLoading = false;

                                }, (error) => {
                                    this.isLoading = false;
                                }
                            ));

                            //this.isLoading = false;
                            this.inputsQuotation.reversePD = !this.isTransact ? await this.getReversar(this.quotationNumber, 0) : false;
                        }


                    },
                    (error) => {
                        this.isLoading = false;
                        swal.fire('Información', this.genericServerErrorMessage + ' ' + this.redirectionMessage, 'error');
                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                    }
                );


        if ((this.template.ins_validateDebt && !this.isTransact) || this.emitirPolizaOperaciones || this.procesarPolizaOperaciones) {
            const validateLockReq = new ValidateLockRequest();
            validateLockReq.branchCode = 1;
            validateLockReq.productCode = this.productoId;
            validateLockReq.documentType = this.inputsQuotation.DocumentTypeId;
            validateLockReq.documentNumber = this.inputsQuotation.DocumentNumber;
            this.validateLockResponse = await this.getValidateLock(validateLockReq);

            if (this.validateLockResponse.lockMark == 1) {
                this.flagDisabledRestric = true;
                swal.fire('Información', this.validateLockResponse.observation, 'error');
                self.isLoading = false;
            } else {
                if (this.mode == 'Emitir' || this.mode == 'EmitirR' || this.mode == 'Recotizar') {
                    this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, this.variable.var_movimientoEmision);
                    if (this.validateDebtResponse.lockMark != 0) {
                        if (Number(this.brokerProfile) == Number(this.perfil)) {
                            await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                                this.isLoading = false;
                            });
                        } else {
                            await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                                this.isLoading = false;
                            });
                        }
                    }
                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                    }
                } else if (this.mode == 'Visualizar') {
                    this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, this.variable.var_movimientoRenovacion);

                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                    }
                } else {
                    let typeTranValidate = this.variable.var_movimientoEmision;
                    if (this.mode == 'Incluir' ||
                        (this.mode == 'Autorizar' &&
                            this.typeTran == 'Inclusión') ||
                        (this.mode == 'Evaluar' &&
                            this.typeTran == 'Inclusión')) {
                        typeTranValidate = 2;
                    } else if (this.typeTran == 'Endoso') {
                        typeTranValidate = 8;
                    }
                    else if (this.mode == 'Renovar' || (this.mode == 'Autorizar' && this.typeTran == 'Declaración') || (this.mode == 'Evaluar' && this.typeTran == 'Declaración')) {
                        typeTranValidate = 4;
                    } else if (this.mode == 'Exclusión') {
                        typeTranValidate = 3;
                    }
                    else {
                        typeTranValidate = this.variable.var_movimientoEmision;
                    }
                    // AVS Mejoras SCTR
                    this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, typeTranValidate);

                    if (this.validateDebtResponse.lockMark != 0) {
                        if (Number(this.brokerProfile) == Number(this.perfil)) {
                            await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                                this.isLoading = false;
                            });
                        } else {
                            await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                                this.isLoading = false;
                            });
                        }
                    }
                    if (this.validateDebtResponse.lockMark == 1 && this.mode != 'Autorizar' && this.mode != 'Evaluar') {
                        this.flagDisabledRestric = true;
                    }
                }
                /*if (this.creditHistory.nflag == this.variable.var_riesgoBajo || this.creditHistory.nflag == this.variable.var_riesgoAlto) {
                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                        await this.generateAccountStatus(1, this.vidaLeyID, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                            this.isLoading = false;
                        });
                    }
                    else {
                        await this.generateAccountStatus(1, this.vidaLeyID, this.clientCode, this.variable.var_accountStatusCode).then(() => {
            this.isLoading = false;
                        });
                    }
                }*/
            }

        }
    }

    async obtenerPagoDirectoSCTR(): Promise<boolean> {
        let response: any = {};
        let p_nroCotizacion = this.quotationNumber;
        let p_tipoTransaccion = '1';
        let prima = 0.0;

        if (this.totalNetoPensionAutSave === 0) {
            prima = this.totalNetoSaludAutSave;
        }

        if (this.totalNetoSaludAutSave === 0) {
            prima = this.totalNetoPensionAutSave;
        }

        if (this.totalNetoPensionAutSave !== 0 && this.totalNetoSaludAutSave !== 0) {
            if (this.totalNetoPensionAutSave == this.totalNetoSaludAutSave) {
                prima = this.totalNetoPensionAutSave;
            }
            if (this.totalNetoPensionAutSave < this.totalNetoSaludAutSave) {
                prima = this.totalNetoPensionAutSave;
            }
            if (this.totalNetoSaludAutSave < this.totalNetoPensionAutSave) {
                prima = this.totalNetoSaludAutSave;
            }
        }

        response = await this.callServicePagoDirectoSCTR(p_nroCotizacion, p_tipoTransaccion, prima);

        console.log(response)
        //let valTypePay = response.P_ORDER === 1 ? true : false;
        //P_ORDER === 1        =>  Aplica Pago Directo = false (si muestra icono Pago Directo)
        //P_ORDER === -1 o 0   =>  No Aplica Pago Directo = true (no muestra icono Pago Directo)        
        let valTypePay = response.P_ORDER === 1 ? false : true;

        return valTypePay;
    }

    async callServicePagoDirectoSCTR(p_nroCotizacion, p_tipoTransaccion, prima) {
        let response: any = {};
        let sriesgo = this.creditHistory != null ? this.creditHistory.sdescript : 'RIESGO BAJO';

        await this.policyService.getPayDirectMethods(
            p_nroCotizacion,
            p_tipoTransaccion,
            prima,
            sriesgo,
            this.inputsQuotation.SCLIENT
        ).toPromise().then(res => {
            response = res;
        }, err => {
            console.log(err);
        });

        return response;
    }

    async validateDelimitationRules() {
        // let sdelimiter = '';

        if (this.inputsQuotation.NPRODUCT != 2) {
            let data: any = {
                scodProcess: this.inputsQuotation.P_NID_PROC,
                ntechnical: this.inputsQuotation.TechnicalActivityId,
                ncot_mixta: this.valMixSAPSA,
                nproduct: this.inputsQuotation.NPRODUCT,
                sclient_type: this.inputsQuotation.P_SISCLIENT_GBD,
                ntype_valid: 1,
                stransac: 'EM'
            };

            await this.quotationService.getValidateDelimitationRules(data).toPromise().then(
                res => {
                    this.inputsQuotation.HasDelimiter = res.ncode == 1;
                    this.inputsQuotation.DELIMITACION = res.ncode;
                });

        }

        // return sdelimiter;
    }

    dataPension(infoPension: any, type: any = '0') {
        // console.log(infoPension)
        this.discountPension = infoPension.length > 0 ? infoPension[0].discount : 0;
        this.activityVariationPension = infoPension.length > 0 ? infoPension[0].activityVariation : 0;
        this.commissionPension = infoPension.length > 0 ? infoPension[0].commission : 0;
        this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension.length > 0 ? infoPension[0].prima_min : 0;
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = infoPension.length > 0 ? infoPension[0].prima_minPro : 0;
        this.inputsQuotation.P_PRIMA_MIN_PENSION_AUT = infoPension.length > 0 ? infoPension[0].prima_minAut : 0;
        this.inputsQuotation.P_PRIMA_END_PENSION = infoPension.length > 0 ? infoPension[0].prima_end : 0;
        this.inputsQuotation.primaComPension = infoPension.length > 0 ? infoPension[0].primaCom : 0;
        this.inputsQuotation.primaComPensionPre = infoPension.length > 0 ? infoPension[0].primaComPre : 0;
        this.totalNetoPensionSave = infoPension.length > 0 ? infoPension[0].totalNeto : 0;
        this.totalNetoPension = infoPension.length > 0 ? infoPension[0].totalNetoPre : 0;
        this.igvPensionSave = infoPension.length > 0 ? infoPension[0].igv : 0;
        this.igvPension = infoPension.length > 0 ? infoPension[0].igvPre : 0;
        this.brutaTotalPensionSave = infoPension.length > 0 ? infoPension[0].totalBruto : 0;
        this.brutaTotalPension = infoPension.length > 0 ? infoPension[0].totalBrutoPre : 0;

        this.inputsQuotation.primaComPensionAut = infoPension.length > 0 ? infoPension[0].primaComAut : 0
        this.totalNetoPensionAutSave = infoPension.length > 0 ? infoPension[0].totalNetoAut : 0;
        this.igvPensionAutSave = infoPension.length > 0 ? infoPension[0].igvAut : 0;
        this.brutaTotalPensionAutSave = infoPension.length > 0 ? infoPension[0].totalBrutoAut : 0;

        this.mensajePrimaPension = infoPension.length > 0 ? type == '0' ? this.messageVerify(infoPension) : infoPension[0].mensaje : "";
        this.inputsQuotation.PensionNetAmount = this.totalNetoPensionAutSave
        // this.listaTasasPension = infoPension.length > 0 ? infoPension[0].tasasProducto : this.listaTasasPension;
    }

    messageVerify(item: any): any {
        let mensaje = '';

        let primaMin = this.mode == 'Evaluar' ? Number(item[0].prima_minPro) > 0 ? Number(item[0].prima_minPro) : Number(item[0].prima_min) : Number(item[0].prima_minAut);

        if (primaMin > Number(item[0].primaNetaPrev)) {
            if (this.flagMesVec == "1" && (this.inputsQuotation.NTYPE_TRANSAC == 2 || this.inputsQuotation.NTYPE_TRANSAC == 3 || this.inputsQuotation.NTYPE_TRANSAC == 4)) {
                mensaje = 'No aplica prima mínima por regula mes vencido.';
            } else {
                mensaje = this.variable.var_msjPrimaMin;
            }
        }



        return mensaje;
    }

    dataSalud(infoSalud: any, type: any = '0') {
        this.discountSalud = infoSalud.length > 0 ? infoSalud[0].discount : 0
        this.activityVariationSalud = infoSalud.length > 0 ? infoSalud[0].activityVariation : 0
        this.commissionSalud = infoSalud.length > 0 ? infoSalud[0].commission : 0
        this.inputsQuotation.P_PRIMA_MIN_SALUD = infoSalud.length > 0 ? infoSalud[0].prima_min : 0
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = infoSalud.length > 0 ? infoSalud[0].prima_minPro : 0;
        this.inputsQuotation.P_PRIMA_MIN_SALUD_AUT = infoSalud.length > 0 ? infoSalud[0].prima_minAut : 0;
        this.inputsQuotation.P_PRIMA_END_SALUD = infoSalud.length > 0 ? infoSalud[0].prima_end : 0
        this.inputsQuotation.primaComSalud = infoSalud.length > 0 ? infoSalud[0].primaCom : 0
        this.inputsQuotation.primaComSaludPre = infoSalud.length > 0 ? infoSalud[0].primaComPre : 0
        this.totalNetoSaludSave = infoSalud.length > 0 ? infoSalud[0].totalNeto : 0
        this.totalNetoSalud = infoSalud.length > 0 ? infoSalud[0].totalNetoPre : 0
        this.igvSaludSave = infoSalud.length > 0 ? infoSalud[0].igv : 0
        this.igvSalud = infoSalud.length > 0 ? infoSalud[0].igvPre : 0
        this.brutaTotalSaludSave = infoSalud.length > 0 ? infoSalud[0].totalBruto : 0
        this.brutaTotalSalud = infoSalud.length > 0 ? infoSalud[0].totalBrutoPre : 0

        this.inputsQuotation.primaComSaludAut = infoSalud.length > 0 ? infoSalud[0].primaComAut : 0
        this.totalNetoSaludAutSave = infoSalud.length > 0 ? infoSalud[0].totalNetoAut : 0;
        this.igvSaludAutSave = infoSalud.length > 0 ? infoSalud[0].igvAut : 0;
        this.brutaTotalSaludAutSave = infoSalud.length > 0 ? infoSalud[0].totalBrutoAut : 0;

        this.mensajePrimaSalud = infoSalud.length > 0 ? type == '0' ? this.messageVerify(infoSalud) : infoSalud[0].mensaje : "";
        this.inputsQuotation.SaludNetAmount = this.totalNetoSaludAutSave // SCTR - ED
        // this.listaTasasSalud = infoSalud.length > 0 ? infoSalud[0].tasasProducto : this.listaTasasSalud
    }

    generarInfo(data: any, product: string) {

        if (data.length > 0) {
            let item: any = {};
            item.productCore = product;
            item.discount = data[0].DESCUENTO;
            item.activityVariation = data[0].VARIACION_TASA;
            item.commission = 0;
            item.dEmisionPro = product == '1' ? this.dEmiPension : this.dEmiSalud;
            item.igvPro = product == '1' ? this.pensionIGV : this.healthIGV;
            item.prima_end = data[0].PRIMA_END;
            item.primaNetaPrev = this.status == 'PENDIENTE' ? data[0].NSUM_PREMIUMNPRE : data[0].NSUM_PREMIUMN;

            item.totalNeto = this.status == 'PENDIENTE' ? data[0].NSUM_PREMIUMN : data[0].NSUM_PREMIUMNPRO;
            item.primaCom = this.status == 'PENDIENTE' ? data[0].NSUM_PREMIUMN : data[0].NSUM_PREMIUMNPRO;
            item.igv = this.status == 'PENDIENTE' ? data[0].NSUM_IGV : data[0].NSUM_IGVPRO;
            item.totalBruto = this.status == 'PENDIENTE' ? data[0].NSUM_PREMIUM : data[0].NSUM_PREMIUMTPRO;

            item.totalNetoPre = data[0].NSUM_PREMIUMNPRE;
            item.primaComPre = 0; // data[0].NSUM_PREMIUMN;
            item.igvPre = 0; // data[0].NSUM_IGV;
            item.totalBrutoPre = 0; // data[0].NSUM_PREMIUM;

            item.prima_min = data[0].PRIMA_MIN;
            item.prima_minPro = data[0].PRIMA_MIN_PRO;
            item.prima_minAut = data[0].PRIMA_MIN_AUT;
            item.prima_minAutBk = data[0].PRIMA_MIN_AUT;

            item.totalNetoAut = data[0].NSUM_PREMIUMN;
            item.primaComAut = data[0].NSUM_PREMIUMN;
            item.igvAut = data[0].NSUM_IGV;
            item.totalBrutoAut = data[0].NSUM_PREMIUM;
            item.mode = 'evaluar';
            item.mensaje = null;
            item.tasasList = [];
            data.forEach(element => {
                let categoria: any = {};
                categoria.id = element.TIP_RIESGO;
                categoria.nmodulec = element.TIP_RIESGO;
                categoria.description = element.DES_RIESGO;
                categoria.rateRisk = element.TASA_RIESGO;
                categoria.rate = element.TASA_CALC;
                categoria.planilla = element.MONTO_PLANILLA;
                categoria.planProp = element.TASA_PRO;
                categoria.premiumMonthPre = element.PRIMA;
                categoria.premiumMonth = element.PRIMA;
                categoria.premiumMonthAut = this.status == 'PENDIENTE' ? element.PRIMA : element.AUT_PRIMA;
                categoria.rateAut = this.status == 'PENDIENTE' ? this.mode == 'Evaluar' ? 0 : element.TASA : element.TASA;
                categoria.rateBk = Number(element.TASA_PRO) > 0 ? element.TASA_PRO : element.TASA_CALC;
                categoria.totalWorkes = element.NUM_TRABAJADORES;
                item.tasasList.push(categoria);
            });

            if (product == '1') {
                this.infoPension.push(item);
                this.listaTasasPension = this.infoPension[0].tasasList;
            } else {
                this.infoSalud.push(item);
                this.listaTasasSalud = this.infoSalud[0].tasasList;
            }

        }
    }

    async resetearPrimas(event, infoProducto, itemTasa = null) {
        this.isLoading = true;

        let premiumAut = event == 0 ? infoProducto[0].prima_minAutBk : !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
        infoProducto[0].prima_minAut = itemTasa == null ? premiumAut : infoProducto[0].prima_minAut;
        infoProducto[0].itemTasa = itemTasa;

        await this.clientInformationService.getReTariff(infoProducto).subscribe(
            async res => {
                this.isLoading = false;
                let infoPensionTemp = res.filter(item => item.productCore == '1');
                this.infoPension = infoPensionTemp.length > 0 ? infoPensionTemp : this.infoPension;
                this.listaTasasPension = this.infoPension.length > 0 ? this.infoPension[0].tasasList : this.listaTasasPension;
                this.dataPension(this.infoPension, '1');

                let infoSaludTemp = res.filter(item => item.productCore == '2');
                this.infoSalud = infoSaludTemp.length > 0 ? infoSaludTemp : this.infoSalud;
                this.listaTasasSalud = this.infoSalud.length > 0 ? this.infoSalud[0].tasasList : this.listaTasasSalud;
                this.dataSalud(this.infoSalud, '1');

            },
            err => {
                this.isLoading = false;
                // this.clearTariff();
                swal.fire('Información', this.variable.var_sinCombinacion, 'error');
            }
        );
    }

    async ValidarFrecPago(event: any) {
        if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionAnual) {
            this.inputsQuotation.primaMinimaPension = 'Prima mínima anual';
        } else {
            this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
        }
    }


    async validarTipoRenovacion(event: any) {
        const fechadesde = this.desde.nativeElement.value.split('/');
        const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
        const fechad = new Date(fechaDes);

        let res: any = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.inputsQuotation.tipoRenovacion);
        if (res.FechaExp != "")
            this.inputsQuotation.finVigencia = new Date(res.FechaExp);

        if (this.inputsQuotation.FDateFinAseg)
            await this.ValidarFrecPago(null);

        /*if (this.inputsQuotation.tipoRenovacion === '5') { //Mensual
          fechad.setMonth(fechad.getMonth() + 1);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '4') { //Bimestral
          fechad.setMonth(fechad.getMonth() + 2);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '3') { //Trimestral
          fechad.setMonth(fechad.getMonth() + 3);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '2') { //Semestral
          fechad.setMonth(fechad.getMonth() + 6);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }

        if (this.inputsQuotation.tipoRenovacion === '1') { //Anual
          fechad.setFullYear(fechad.getFullYear() + 1)
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }*/
    }

    changeSaludPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = false;
                }
            });
        }
    }

    changeSaludPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = false;
                }
            });
        }
    }

    changePensionPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = false;
                }
            });
        }
    }

    changePensionPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = false;
                }
            });
        }
    }

    /**
     * Calcula la primas neta total, IGV de prima neta total y la prima bruta total para las tasas autorizadas y primas mínimas autorizadas por producto
     * @param productId Id de producto
     */
    // checkMinimunPremiumForAuthorizedAmounts(productId: string, cantPrima?) { // AGF CALCULOS CORRECTOS Modalidad Visualizar
    //     if (cantPrima != undefined) {
    //         let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
    //         totPrima = isNaN(totPrima) ? 0 : totPrima;
    //         if (productId == this.healthProductId.id) {
    //             console.log(totPrima);
    //             this.inputsQuotation.HealthAuthMinPremium = totPrima

    //         }

    //         if (productId == this.pensionProductId.id) {
    //             console.log(totPrima);
    //             this.inputsQuotation.PensionAuthMinPremium = totPrima
    //         }
    //     }


    //     if (productId == this.healthProductId.id) {
    //         this.inputsQuotation.HealthAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.HealthAuthMinPremium);
    //         let NetPremium = 0;
    //         this.inputsQuotation.SaludDetailsList.map(function (item) {
    //             NetPremium = NetPremium + Number(item.NewPremium);
    //         });

    //         if (NetPremium < this.inputsQuotation.HealthAuthMinPremium) {
    //             if (this.flagMesVec == "1" && (this.inputsQuotation.NTYPE_TRANSAC == 2 || this.inputsQuotation.NTYPE_TRANSAC == 3 || this.inputsQuotation.NTYPE_TRANSAC == 4)) {
    //                 this.inputsQuotation.SaludNewNetAmount = NetPremium;
    //                 this.healthMessage = 'No aplica prima mínima por regula mes vencido.';
    //             } else {
    //                 this.inputsQuotation.SaludNewNetAmount = this.inputsQuotation.HealthAuthMinPremium;
    //                 this.healthMessage = this.variable.var_msjPrimaMin;
    //             }
    //         } else {
    //             this.inputsQuotation.SaludNewNetAmount = NetPremium;
    //             this.healthMessage = '';
    //         }
    //         this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
    //         this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNewNetAmount, 2);
    //         this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);


    //     } else if (productId == this.pensionProductId.id) {
    //         console.log('this.inputsQuotation.PensionAuthMinPremium');
    //         console.log(this.inputsQuotation.PensionAuthMinPremium);
    //         this.inputsQuotation.PensionAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.PensionAuthMinPremium);
    //         console.log(this.inputsQuotation.PensionAuthMinPremium);
    //         let NetPremium = 0;
    //         this.inputsQuotation.PensionDetailsList.map(function (item) {
    //             NetPremium = NetPremium + Number(item.NewPremium);
    //         });
    //         console.log('NetPremium: ' + NetPremium);
    //         console.log('this.inputsQuotation.PensionAuthMinPremium: ' + this.inputsQuotation.PensionAuthMinPremium);

    //         if (NetPremium < this.inputsQuotation.PensionAuthMinPremium) {
    //             //this.inputsQuotation.PensionNewNetAmount = this.inputsQuotation.PensionAuthMinPremium;
    //             console.log('Entra < ');
    //             if (this.flagMesVec == "1" && (this.inputsQuotation.NTYPE_TRANSAC == 2 || this.inputsQuotation.NTYPE_TRANSAC == 3 || this.inputsQuotation.NTYPE_TRANSAC == 4)) {
    //                 this.inputsQuotation.PensionNewNetAmount = NetPremium;
    //                 this.pensionMessage = 'No aplica prima mínima por regula mes vencido.';
    //             } else {
    //                 this.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(this.inputsQuotation.PensionAuthMinPremium, 2);
    //                 console.log('this.inputsQuotation.PensionNewNetAmount' + ': ' + this.inputsQuotation.PensionNewNetAmount);
    //                 this.pensionMessage = this.variable.var_msjPrimaMin;
    //             }
    //         } else {
    //             console.log('Entra > ');
    //             this.inputsQuotation.PensionNewNetAmount = NetPremium;
    //             this.pensionMessage = '';
    //         }
    //         //this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
    //         this.inputsQuotation.PensionNewPrimaComercial = this.inputsQuotation.PensionNewNetAmount * this.dEmiPension;
    //         //this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNewNetAmount, 2); WV comentado
    //         console.log(this.inputsQuotation.PensionNewCalculatedIGV + ' Antes ');
    //         //this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString()) - this.inputsQuotation.PensionNewNetAmount), 2);
    //         this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNewNetAmount, 2);
    //         console.log('checkMinimunPremiumForAuthorizedAmounts');
    //         console.log(this.inputsQuotation.PensionNewNetAmount + ' * ' + this.pensionIGV);
    //         console.log(this.inputsQuotation.PensionNewCalculatedIGV + ' W ');
    //         //Cálculo de nueva prima total bruta de Pensión
    //         this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);
    //     }
    // }
    // checkMinimunPremiumForOriginals(productId: string, cantPrima?) {
    //     console.log('checkMinimunPremiumForOriginals');

    //     if (cantPrima != undefined) {
    //         let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
    //         totPrima = isNaN(totPrima) ? 0 : totPrima;

    //         if (productId == this.healthProductId.id) {
    //             this.inputsQuotation.SaludPropMinPremium = totPrima
    //         }

    //         if (productId == this.pensionProductId.id) {
    //             this.inputsQuotation.PensionPropMinPremium = totPrima
    //         }
    //     }

    //     if (productId == this.healthProductId.id) {
    //         let healthPremiumToBeCompared = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
    //         let originalNetPremium = 0;
    //         this.inputsQuotation.SaludDetailsList.map(function (item) {
    //             originalNetPremium = originalNetPremium + Number(item.Premium);
    //         });

    //         if (originalNetPremium < healthPremiumToBeCompared) { //Si hay tasa propuesta
    //             this.isNetPremiumLessThanMinHealthPremium = true;
    //             //Cálculo de nueva prima total neta de Salud
    //             this.inputsQuotation.SaludNetAmount = healthPremiumToBeCompared;
    //             this.healthMessage = this.variable.var_msjPrimaMin;
    //         } else {
    //             this.isNetPremiumLessThanMinHealthPremium = false;
    //             //Cálculo de nueva prima total neta de Salud
    //             this.inputsQuotation.SaludNetAmount = originalNetPremium;
    //             this.healthMessage = '';
    //         }
    //         //Calculo de Prima Comercial de Salud
    //         this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNetAmount * this.dEmiSalud, 2);
    //         //Cálculo de IGV de la nueva prima total neta de Salud
    //         this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNetAmount, 2);
    //         //Cálculo de nueva prima total bruta de Salud
    //         this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);

    //     } else if (productId == this.pensionProductId.id) {
    //         let pensionPremiumToBeCompared = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : 0;//this.inputsQuotation.PensionMinPremium; WV comentado
    //         let originalNetPremium = 0;
    //         this.inputsQuotation.PensionDetailsList.map(function (item) {
    //             originalNetPremium = originalNetPremium + Number(item.Premium);
    //         });
    //         if (originalNetPremium < pensionPremiumToBeCompared) {
    //             this.isNetPremiumLessThanMinPensionPremium = true;
    //             //Cálculo de nueva prima total neta de Pensión
    //             this.inputsQuotation.PensionNetAmount = pensionPremiumToBeCompared;
    //             this.pensionMessage = this.variable.var_msjPrimaMin;
    //         } else {
    //             this.isNetPremiumLessThanMinPensionPremium = false;
    //             this.inputsQuotation.PensionNetAmount = originalNetPremium;
    //             this.pensionMessage = '';
    //         }
    //         //Calculo de Prima Comercial de Salud
    //         this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNetAmount * this.dEmiPension, 2);
    //         //Cálculo de IGV de la nueva prima total neta de Pensión
    //         this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNetAmount, 2);
    //         console.log('this.pensionIGV.toString()  2: ' + this.pensionIGV.toString());
    //         console.log('this.inputsQuotation.PensionCalculatedIGV  2: ' + this.inputsQuotation.PensionCalculatedIGV);
    //         //Cálculo de nueva prima total bruta de Pensión
    //         this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);
    //     }


    // }

    /**
     * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
     * @param list lista ingresada
     * @returns  string en html
     */
    listToString(list: String[]): string {
        let output = '';
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + ' <br>'
            });
        }
        return output;
    }

    glossChanged() {
        this.mainFormGroup.controls.glossComent.setValue('')
    }

    /**
     * Envia la petición de cambio de estado de la cotización e inserción de tasas autorizadas con las primas autorizadas
     */
    async AddStatusChange() {
        //debugger;
        let errorList: any = [];

        /*Autorizar - recotizar INCLUSION VL -- EH*/
        let statusValue = ''; // se reemplazara 'this.mainFormGroup.get('status').value' por esta variable
        let AuthInc = false;
        statusValue = this.mainFormGroup.get('status').value;


        if (statusValue == '') {
            errorList.push('Debe seleccionar un estado para continuar.');
        } /* else {
            errorList = this.areAuthorizedRatesValid();
            errorList = errorList.concat(this.validateAuthorizedCommmissions());
            errorList = errorList.concat(this.validateAuthorizedPremiums());
        }*/

        if (this.flagContact && this.template.ins_addContact && statusValue != '11' && this.mode === 'Evaluar') {
            if (this.contactList.length == 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email && statusValue != '11' && this.mode === 'Evaluar') {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                // this.inputsValidate[19] = true
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                    // this.inputsValidate[19] = true
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (this.mainFormGroup.controls.gloss.value == 99 && this.mainFormGroup.controls.glossComent.value == '') {
            errorList.push('Debe ingresar una glosa de constancia.');
        }

        if ((this.mainFormGroup.valid == true) && (errorList == null || errorList.length == 0)) { //  AuthInc == true  agregado en inc EH
            const self = this;
            const formData = new FormData();

            this.files.forEach(function (file) { // anexamos todos los archivos al formData
                formData.append(file.name, file, file.name);
            });

            this.statusChangeRequest.QuotationNumber = this.quotationNumber;  // Número de cotización
            this.statusChangeRequest.Status = this.mainFormGroup.controls.status.value; // Nuevo estado
            this.statusChangeRequest.Reason = this.mainFormGroup.controls.reason.value; // Motivo
            this.statusChangeRequest.Comment = this.mainFormGroup.controls.comment.value.trim().toUpperCase().replace(/[<>%]/g, ''); // Comentario
            this.statusChangeRequest.User = JSON.parse(localStorage.getItem('currentUser'))['id'];  // Usuario
            this.statusChangeRequest.Product = self.pensionProductId.id; // Comentario
            this.statusChangeRequest.Nbranch = self.pensionProductId.nbranch; // Comentario
            this.statusChangeRequest.Gloss = this.mainFormGroup.controls.gloss.value; // Mejora SCTR
            this.statusChangeRequest.GlossComment = this.mainFormGroup.controls.glossComent.value.trim().toUpperCase().replace(/[<>%]/g, ''); // Mejora SCTR
            this.statusChangeRequest.flag = this.template.ins_mapfre;

            // Preparación de tasas autorizadas y primas recalculadas a enviar
            self.statusChangeRequest.saludAuthorizedRateList = [];
            self.statusChangeRequest.pensionAuthorizedRateList = [];
            this.statusChangeRequest.BrokerList = [];

            this.inputsQuotation.SecondaryBrokerList.forEach(element => {
                const item = new Broker();
                item.Id = element.CANAL;
                item.ProductList = [];
                if (self.infoPension.length > 0) {
                    const obj = new BrokerProduct();
                    obj.Product = self.infoPension[0].productCore;
                    obj.AuthorizedCommission = element.COMISION_PENSION_AUT;
                    item.ProductList.push(obj);
                }
                if (self.infoSalud.length > 0) {
                    const obj = new BrokerProduct();
                    obj.Product = self.infoSalud[0].productCore;
                    obj.AuthorizedCommission = element.COMISION_SALUD_AUT;
                    item.ProductList.push(obj);
                }
                self.statusChangeRequest.BrokerList.push(item);
            });

            console.log('Pension', this.listaTasasPension);
            this.listaTasasPension.forEach((element) => {
                const item = new AuthorizedRate();
                item.ProductId = self.infoPension[0].productCore;
                item.RiskTypeId = element.nmodulec;
                item.AuthorizedRate = this.inputsQuotation.NFLAG_STRAME == 0 ? Number(element.rateAut) == 0 ? Number(element.planProp) == 0 ? element.rate : element.planProp : element.rateAut : element.rate;
                item.AuthorizedPremium = element.premiumMonthAut;
                item.AuthorizedMinimunPremium = self.inputsQuotation.P_PRIMA_MIN_PENSION_AUT;

                self.statusChangeRequest.pensionAuthorizedRateList.push(item);
            });

            console.log('Salud', this.listaTasasSalud);
            this.listaTasasSalud.forEach((element) => {
                const item = new AuthorizedRate();
                item.ProductId = self.infoSalud[0].productCore;
                item.RiskTypeId = element.nmodulec;
                item.AuthorizedRate = this.inputsQuotation.NFLAG_STRAME == 0 ? Number(element.rateAut) == 0 ? Number(element.planProp) == 0 ? element.rate : element.planProp : element.rateAut : element.rate;
                item.AuthorizedPremium = element.premiumMonthAut;
                item.AuthorizedMinimunPremium = self.inputsQuotation.P_PRIMA_MIN_SALUD_AUT;

                self.statusChangeRequest.saludAuthorizedRateList.push(item);
            });

            console.log('pensionAuthorizedRateList', self.statusChangeRequest.pensionAuthorizedRateList);
            console.log('saludAuthorizedRateList', self.statusChangeRequest.saludAuthorizedRateList);

            /** */
            if (this.mode === 'Evaluar' && statusValue != '11') {
                this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.contractingdata.P_TipOper = 'INS';
                this.contractingdata.P_NCLIENT_SEG = -1;

                if (this.flagContact && this.template.ins_addContact) {
                    this.contractingdata.EListContactClient = [];
                    if (this.contactList.length > 0) {
                        this.contactList.forEach(contact => {
                            if (contact.P_NTIPCONT == 0) {
                                contact.P_NTIPCONT = 99;
                            }
                            if (contact.P_NIDDOC_TYPE == '0') {
                                contact.P_NIDDOC_TYPE = null;
                                contact.P_SIDDOC = null;
                            }
                        });
                        this.contractingdata.EListContactClient = this.contactList;
                    }
                } else {
                    this.contractingdata.EListContactClient = null;
                }

                if (this.flagEmail && this.template.ins_email) {
                    this.contractingdata.EListEmailClient = [];
                    const contractingEmail: any = {};
                    contractingEmail.P_CLASS = '';
                    contractingEmail.P_DESTICORREO = 'Correo Personal';
                    contractingEmail.P_NROW = 1;
                    contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                    contractingEmail.P_SORIGEN = 'SCTR';
                    contractingEmail.P_SRECTYPE = '4';
                    contractingEmail.P_TipOper = '';
                    this.contractingdata.EListEmailClient.push(contractingEmail);
                } else {
                    this.contractingdata.EListEmailClient = null;
                }

                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    const response: any = await this.updateContracting();
                    if (response.code == '0') {
                        this.processChanges(formData);
                    } else {
                        swal.fire('Información', response.message, 'error');
                        return;
                    }
                } else {
                    this.processChanges(formData);
                }

            } else {
                this.processChanges(formData);
            }
        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processChanges(formData) {
        //debugger
        let msgStatusChange = '';
        msgStatusChange = '¿Desea cambiar a estado ' + this.statusChange + ' la cotización N° ' + this.quotationNumber + '?';

        formData.append('statusChangeData', JSON.stringify(this.statusChangeRequest));
        swal.fire({
            title: 'Información',
            text: msgStatusChange,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Procesar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        })
            .then(async (result) => {
                if (result.value) {
                    this.isLoading = true;
                    this.quotationService.changeStatus(formData).subscribe(
                        res => {
                            if (res.StatusCode == 0) {
                                swal.fire('Información', 'Se ha realizado correctamente la operación.', 'success');
                                this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                            } else if (res.StatusCode == 1) { // Error de validación
                                swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                            } else {
                                swal.fire('Información', this.genericServerErrorMessage, 'error');
                            }
                            this.isLoading = false;
                        },
                        err => {
                            swal.fire('Información', this.genericServerErrorMessage, 'error');
                            this.isLoading = false;
                        }
                    );

                }
            });
    }

    // GetNamoAfectDetailTotalListValue_SCTR_SALUD(freq): number { //AVS - Interconexion SAPSA 26/05/2023
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.SaludNetAmount * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    // GetNamoAfectDetailTotalListValue_SCTR_PENSION(freq): number { //AVS - Interconexion SAPSA 26/05/2023
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.PensionNetAmount * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    // GetNivaDetailTotalListValue_SCTR_PENSION(freq): number {
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }
    // GetNamountDetailTotalListValue_SCTR_PENSION(freq): number {
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.PensionCalculatedIGV * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    // GetNamountDetailTotalListValue_SCTR_SALUD(freq): number {
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.SaludGrossAmount * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    // GetNivaDetailTotalListValue_SCTR_SALUD(freq): number {
    //     let valorAD = 0;
    //     try {
    //         if (freq == 5) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 1;
    //         } else if (freq == 4) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 2;
    //         } else if (freq == 3) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 3;
    //         } else if (freq == 2) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 6;
    //         } else if (freq == 1) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 12;
    //         } else if (freq == 9) {
    //             valorAD = this.inputsQuotation.SaludCalculatedIGV * 1;
    //         } else {
    //             valorAD = 0;
    //         }
    //     } catch (error) {
    //         valorAD = 0;
    //     }
    //     return valorAD;
    // }

    GetAmountGeneric(amount: number, frecuency: number): number {
        let amountCalculate = 0;

        const multiplierMap: Record<number, number> = {
            1: 12,
            2: 6,
            3: 3,
            4: 2,
            5: 1,
            9: 1
        };

        const multiplier = multiplierMap[frecuency] ?? 0;

        amountCalculate = amount * multiplier;

        return amountCalculate;
    }

    // async objetoTrx() {
    //     this.isLoading = true;

    //     // if (this.inputsQuotation.tipoTransaccion == 1 && this.emitirCertificadoTecnica == false) {
    //     //     // let comentario = ''
    //     //     // const fechaIni = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //     //     // const fechaFin = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
    //     //     // const savedPolicyList: any = [];
    //     //     // let amountDetailTotalList: any = [];
    //     //     // const savedPolicyEmit: any = {};

    //     //     await this.policyService.getPolicyEmitCab(
    //     //         this.quotationNumber, '1',
    //     //         JSON.parse(localStorage.getItem('currentUser'))['id']
    //     //     ).toPromise().then(async (res: any) => {
    //     //         if (!!res.GenericResponse &&
    //     //             res.GenericResponse.COD_ERR == 0) {
    //     //             await this.policyService.getPolicyEmitDet(
    //     //                 this.quotationNumber,
    //     //                 JSON.parse(localStorage.getItem('currentUser'))['id'])
    //     //                 .toPromise().then(
    //     //                     async resDet => {
    //     //                         // const efectoWS = new Date(res.GenericResponse.EFECTO_COTIZACION_VL)
    //     //                         // const fechaEfecto = CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL));
    //     //                         this.flagEvaluarDirecto = res.GenericResponse.NFLAG_PAY_DIRECTO;
    //     //                         const params = [
    //     //                             {
    //     //                                 P_NID_COTIZACION: this.quotationNumber,
    //     //                                 P_NID_PROC: res.GenericResponse.NID_PROC,
    //     //                                 P_NPRODUCT: this.productoId,
    //     //                                 P_NBRANCH: this.nbranch,
    //     //                                 P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
    //     //                                 P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
    //     //                                 P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
    //     //                                 P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
    //     //                                 P_SFLAG_FAC_ANT: 1,
    //     //                                 P_FACT_MES_VENCIDO: 0,
    //     //                                 P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
    //     //                                 P_IGV: resDet[0].NSUM_IGV,
    //     //                                 P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
    //     //                                 P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
    //     //                                     CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
    //     //                                     'Se ha modificado el inicio de vigencia: Antes = ' +
    //     //                                     CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
    //     //                                     '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : '',
    //     //                                 P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //     //                                 /* Campos para retroactividad */
    //     //                                 P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
    //     //                                 FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
    //     //                                 /* Campos para retroactividad */
    //     //                                 // P_DSTARTDATE_POL : CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),   //IniPol - RI
    //     //                                 // P_DEXPIRDAT_POL: CommonMethods.formatDate(this.inputsQuotation.finVigencia),        //FinPol - RI
    //     //                                 P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),          //RI
    //     //                                 P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
    //     //                                 P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
    //     //                                 P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized                           //Bruta - RI
    //     //                             }
    //     //                         ];

    //     //                         if (params[0].P_NID_PROC == '') {
    //     //                             await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
    //     //                                 resCod => {
    //     //                                     params[0].P_NID_PROC = resCod;
    //     //                                 }
    //     //                             );
    //     //                         }
    //     // this.OpenModalPagos(params);


    //     let dataQuotation: any = {};

    //     const myFiles: FormData = new FormData();
    //     this.files.forEach(file => {
    //         myFiles.append(file.name, file);
    //     });

    //     //console.log(this.polizaEmitCab.MIN_PENSION);
    //     dataQuotation.P_NID_COTIZACION = this.quotationNumber;    //R.P.
    //     dataQuotation.NumeroCotizacion = this.quotationNumber;    //R.P.
    //     dataQuotation.P_STRAN = ''; // this.mode;
    //     dataQuotation.P_SCLIENT = this.contractingdata.P_SCLIENT;
    //     dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
    //     dataQuotation.P_DSTARTDATE = new Date();
    //     dataQuotation.P_NIDCLIENTLOCATION = 0;
    //     dataQuotation.P_SCOMMENT = ''; //his.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
    //     dataQuotation.P_SRUTA = '';
    //     dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //     dataQuotation.P_NREM_EXC = 0; // RQ EXC EHH
    //     dataQuotation.P_ESTADO = this.cotEstado; //AVS - INTERCONEXION SABSA 21/09/2023
    //     dataQuotation.RetOP = 2; // ehh retroactividad
    //     dataQuotation.planId = null;
    //     dataQuotation.FlagCambioFecha = 0;
    //     dataQuotation.QuotationDet = [];
    //     dataQuotation.QuotationCom = [];

    //     dataQuotation.P_NBRANCH = this.inputsQuotation.NBRANCH;
    //     dataQuotation.P_NPRODUCT = this.inputsQuotation.NPRODUCT;
    //     dataQuotation.NumeroCotizacion = this.quotationNumber;
    //     dataQuotation.CodigoProceso = this.inputsQuotation.P_NID_PROC;

    //     // if (this.mode == 'include') {
    //     //     dataQuotation.TrxCode = 'IN';
    //     // } else if (this.mode == 'endosar') {
    //     //     dataQuotation.TrxCode = 'EN';
    //     // } else {
    //     //     if (this.isDeclare) {
    //     //         dataQuotation.TrxCode = 'DE';
    //     //     } else {
    //     //         dataQuotation.TrxCode = 'RE';
    //     //     }
    //     // }
    //     // if (this.isDeclare) {
    //     //     dataQuotation.IsDeclare = this.isDeclare;
    //     // }

    //     dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion;
    //     dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago;
    //     dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia); // Fecha Inicio
    //     dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.finVigencia); // Fecha hasta

    //     // Detalle de Cotizacion Pension
    //     if (this.listaTasasPension.length > 0) {
    //         const NDEPension = 0;
    //         this.listaTasasPension.forEach(dataPension => {
    //             let savedPolicyEmit: any = {};
    //             savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //             savedPolicyEmit.P_NBRANCH = this.inputsQuotation.NBRANCH;
    //             savedPolicyEmit.P_NPRODUCT = this.infoPension[0].productCore; // Pensión
    //             savedPolicyEmit.P_NMODULEC = dataPension.nmodulec;
    //             savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.totalWorkes;
    //             savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.planilla;
    //             savedPolicyEmit.P_NTASA_CALCULADA = dataPension.rate; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
    //             savedPolicyEmit.P_NTASA_PROP = dataPension.planProp;
    //             savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.premiumMonth;
    //             savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
    //             savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
    //             savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION;
    //             savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionAutSave; //
    //             savedPolicyEmit.P_NSUM_IGV = this.igvPensionAutSave; //
    //             savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionAutSave; //
    //             savedPolicyEmit.P_NRATE = dataPension.rate; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
    //             savedPolicyEmit.P_NDISCOUNT = this.discountPension;
    //             savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension;
    //             savedPolicyEmit.P_FLAG = 0;
    //             savedPolicyEmit.P_NAMO_AFEC = this.GetAmountGeneric(this.totalNetoPensionAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NIVA = this.GetAmountGeneric(this.igvPensionAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NAMOUNT = this.GetAmountGeneric(this.brutaTotalPensionAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NDE = NDEPension;
    //             savedPolicyEmit.P_TIPO_COT = this.inputsQuotation.NRATETYPE;
    //             dataQuotation.QuotationDet.push(savedPolicyEmit);
    //         });
    //     }

    //     // Detalle de Cotizacion Salud
    //     if (this.listaTasasSalud.length > 0) {
    //         const NDESalud = 0;
    //         this.listaTasasSalud.forEach(dataSalud => {
    //             const savedPolicyEmit: any = {};
    //             savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //             savedPolicyEmit.P_NBRANCH = this.inputsQuotation.NBRANCH;
    //             savedPolicyEmit.P_NPRODUCT = this.infoSalud[0].productCore; // Salud
    //             savedPolicyEmit.P_NMODULEC = dataSalud.nmodulec;
    //             savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.totalWorkes;
    //             savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.planilla;
    //             savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.rate;
    //             savedPolicyEmit.P_NTASA_PROP = dataSalud.planProp;
    //             savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.premiumMonth;
    //             savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_SALUD;
    //             savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
    //             savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_SALUD;
    //             savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludAutSave;
    //             savedPolicyEmit.P_NSUM_IGV = this.igvSaludAutSave;
    //             savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludAutSave;
    //             savedPolicyEmit.P_NRATE = dataSalud.rate;
    //             savedPolicyEmit.P_NDISCOUNT = this.discountSalud;
    //             savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud;
    //             savedPolicyEmit.P_FLAG = 0;
    //             savedPolicyEmit.P_NAMO_AFEC = this.GetAmountGeneric(this.brutaTotalSaludAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NIVA = this.GetAmountGeneric(this.igvSaludAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NAMOUNT = this.GetAmountGeneric(this.brutaTotalSaludAutSave, this.inputsQuotation.frecuenciaPago);
    //             savedPolicyEmit.P_NDE = NDESalud;
    //             savedPolicyEmit.P_TIPO_COT = this.inputsQuotation.NRATETYPE;
    //             dataQuotation.QuotationDet.push(savedPolicyEmit);
    //         });
    //     }

    //     // Detalle de Cotizacion Pension
    //     // const NDEPension = 0;
    //     // const NDESalud = 0;

    //     // if (this.inputsQuotation.PensionDetailsList.length > 0) {
    //     //     this.inputsQuotation.PensionDetailsList.forEach(dataPension => {
    //     //         let savedPolicyEmit: any = {};
    //     //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //     //         savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
    //     //         savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
    //     //         savedPolicyEmit.P_NMODULEC = dataPension.RiskTypeId;
    //     //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.WorkersCount;
    //     //         savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.PayrollAmount;
    //     //         savedPolicyEmit.P_NTASA_CALCULADA = dataPension.Rate; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
    //     //         savedPolicyEmit.P_NTASA_PROP = dataPension.OriginalProposedRate == '' ? '0' : dataPension.OriginalProposedRate;
    //     //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.Premium;
    //     //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.MIN_PENSION;
    //     //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.MIN_PENSION_PR == '' ? '0' : this.inputsQuotation.MIN_PENSION_PR;
    //     //         savedPolicyEmit.P_NPREMIUM_END = 0;
    //     //         savedPolicyEmit.P_NSUM_PREMIUMN = this.inputsQuotation.PensionNetAmount;
    //     //         savedPolicyEmit.P_NSUM_IGV = this.inputsQuotation.PensionCalculatedIGV;
    //     //         savedPolicyEmit.P_NSUM_PREMIUM = this.inputsQuotation.PensionGrossAmount;
    //     //         savedPolicyEmit.P_NRATE = dataPension.AuthorizedRate == null ? '0' : dataPension.AuthorizedRate; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
    //     //         savedPolicyEmit.P_NDISCOUNT = dataPension.Discount == '' ? '0' : dataPension.Discount;
    //     //         savedPolicyEmit.P_NACTIVITYVARIATION = 0;
    //     //         savedPolicyEmit.P_FLAG = 0;
    //     //         savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NDE = this.inputsQuotation.PensionDetailsList.length > 0 ? NDEPension : this.inputsQuotation.SaludDetailsList.length > 0 ? NDESalud : 0.0;
    //     //         dataQuotation.QuotationDet.push(savedPolicyEmit);
    //     //     });
    //     // }

    //     // // Detalle de Cotizacion Salud
    //     // if (this.inputsQuotation.SaludDetailsList.length > 0) {
    //     //     const NDEPension = 0;
    //     //     const NDESalud = 0;

    //     //     this.inputsQuotation.SaludDetailsList.forEach(dataSalud => {
    //     //         const savedPolicyEmit: any = {};
    //     //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //     //         savedPolicyEmit.P_NBRANCH = this.healthProductId.nbranch;
    //     //         savedPolicyEmit.P_NPRODUCT = this.healthProductId.id; // Salud
    //     //         savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
    //     //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.WorkersCount;
    //     //         savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.PayrollAmount;
    //     //         savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.Rate;
    //     //         savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
    //     //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
    //     //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.MIN_SALUD;
    //     //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.MIN_SALUD_PR == '' ? '0' : this.inputsQuotation.MIN_SALUD_PR;
    //     //         savedPolicyEmit.P_NPREMIUM_END = 0;
    //     //         savedPolicyEmit.P_NSUM_PREMIUMN = this.inputsQuotation.SaludNetAmount;
    //     //         savedPolicyEmit.P_NSUM_IGV = this.inputsQuotation.SaludCalculatedIGV;
    //     //         savedPolicyEmit.P_NSUM_PREMIUM = this.inputsQuotation.SaludGrossAmount;
    //     //         savedPolicyEmit.P_NRATE = dataSalud.AuthorizedRate == null ? '0' : dataSalud.AuthorizedRate;
    //     //         savedPolicyEmit.P_NDISCOUNT = dataSalud.Discount == '' ? '0' : dataSalud.Discount;
    //     //         savedPolicyEmit.P_NACTIVITYVARIATION = 0;
    //     //         savedPolicyEmit.P_FLAG = 0;
    //     //         savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
    //     //         savedPolicyEmit.P_NDE = this.inputsQuotation.PensionDetailsList.length > 0 ? NDEPension : this.inputsQuotation.SaludDetailsList.length > 0 ? NDESalud : 0.0;
    //     //         dataQuotation.QuotationDet.push(savedPolicyEmit);
    //     //     });
    //     // }

    //     // Comercializadores secundarios
    //     var index = 0;
    //     if (this.inputsQuotation.SecondaryBrokerList.length > 0) {
    //         this.inputsQuotation.SecondaryBrokerList.forEach(dataBroker => {
    //             let itemQuotationCom: any = {};
    //             itemQuotationCom.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
    //             itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
    //             itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
    //             itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
    //             itemQuotationCom.P_NCOMISION_SAL = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
    //             itemQuotationCom.P_NCOMISION_SAL_PR = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
    //             itemQuotationCom.P_NCOMISION_PEN = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
    //             itemQuotationCom.P_NCOMISION_PEN_PR = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
    //             itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
    //             itemQuotationCom.P_NLOCAL = 0;
    //             dataQuotation.QuotationCom.push(itemQuotationCom);
    //             index = index + 1;
    //         });
    //     }

    //     dataQuotation.planSeleccionado = '';
    //     dataQuotation.planPropuesto = '';


    //     this.OpenModalPagos(dataQuotation);

    //     //                     }
    //     //                 );
    //     //         }
    //     //     });
    //     // } else if ((this.inputsQuotation.tipoTransaccion == 2 ||
    //     //     this.inputsQuotation.tipoTransaccion == 4 ||
    //     //     this.inputsQuotation.tipoTransaccion == 8 ||
    //     //     this.inputsQuotation.tipoTransaccion == 3 || this.emitirCertificadoTecnica || this.procesarPolizaOperaciones)) {

    //     //     await this.policyService.getPolicyEmitCab(
    //     //         this.quotationNumber, '1',
    //     //         JSON.parse(localStorage.getItem('currentUser'))['id']
    //     //     ).toPromise().then(
    //     //         async res => {
    //     //             if (this.inputsQuotation.tipoTransaccion == 3) {
    //     //                 this.stran = this.typeTran;
    //     //             }
    //     //             this.flagEvaluarDirecto = res.GenericResponse.NFLAG_PAY_DIRECTO;
    //     //             await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
    //     //                 resCod => {
    //     //                     const params = {
    //     //                         P_NPRODUCTO: this.productoId,
    //     //                         P_NBRANCH: this.nbranch,
    //     //                         P_NID_COTIZACION: this.quotationNumber,
    //     //                         P_DEFFECDATE: this.codProducto == 2 ? CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)) : this.codProducto == 3 && this.inputsQuotation.tipoTransaccion == 8 ? CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)) : this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.FECHA_EXCLUSION)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateIniAseg)),
    //     //                         P_DEXPIRDAT: this.codProducto == 2 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : this.codProducto == 3 && this.inputsQuotation.tipoTransaccion == 8 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateFinAseg)),
    //     //                         P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //     //                         P_NTYPE_TRANSAC: this.procesarPolizaOperaciones &&  this.sAbrTran == 'DE'? 11 : this.inputsQuotation.tipoTransaccion,
    //     //                         P_NID_PROC: resCod,
    //     //                         P_FACT_MES_VENCIDO: 0,
    //     //                         P_SFLAG_FAC_ANT: 1,
    //     //                         P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
    //     //                         P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
    //     //                         P_NMOV_ANUL: 0,
    //     //                         P_NNULLCODE: 0,
    //     //                         P_SCOMMENT: null,
    //     //                         P_NPREM_BRU: this.codProducto == 2 ? this.inputsQuotation.PensionNewGrossAmount :  this.AuthorizedDetailList[2].AmountAuthorized,
    //     //                         P_POLICY: this.policyNumber,
    //     //                         /* Campos para retroactividad */
    //     //                         P_STRAN: this.procesarPolizaOperaciones &&  this.sAbrTran == 'DE'? this.sAbrTran : this.stran,
    //     //                         P_DSTARTDATE_ASE: this.codProducto == 2 ? CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)) :  this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.FECHA_EXCLUSION)) : CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
    //     //                         FlagCambioFecha: this.codProducto == 2 ? 0 : this.inputsQuotation.tipoTransaccion == 3 ? 0 : this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
    //     //                         /* Campos para retroactividad */
    //     //                         P_DSTARTDATE_POL: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),   //IniPol - RI
    //     //                         P_DEXPIRDAT_POL: CommonMethods.formatDate(this.inputsQuotation.finVigencia),        //FinPol - RI
    //     //                         P_NAMO_AFEC: this.codProducto == 2 ? this.inputsQuotation.PensionNewPrimaComercial : this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
    //     //                         P_NIVA: this.codProducto == 2 ? this.inputsQuotation.PensionCalculatedIGV : this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
    //     //                         P_NAMOUNT: this.codProducto == 2 ? this.inputsQuotation.PensionNewGrossAmount :  this.AuthorizedDetailList[2].AmountAuthorized                           //Bruta - RI
    //     //                     };

    //     //                     if (this.inputsQuotation.tipoTransaccion != 3) {
    //     //                         this.OpenModalPagos(params);
    //     //                     }
    //     //                     else {
    //     //                         this.inputsQuotation.paramsTrx = params;
    //     //                         this.renovacionTrx(this.inputsQuotation.paramsTrx);
    //     //                     }
    //     //                 });
    //     //         });
    //     // }
    // }

    textValidate(event: any, typeText) {
        CommonMethods.textValidate(event, typeText)
    }

    /**Modificar cotización | Recotizar */
    // modifyQuotation() {
    //     const errorList = this.areProposedRatesValid();
    //     if (errorList == null || errorList.length == 0) {
    //         const self = this;
    //         const quotation = new QuotationModification();
    //         quotation.Number = this.quotationNumber;
    //         quotation.Branch = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
    //         quotation.User = JSON.parse(localStorage.getItem('currentUser'))['id'];

    //         this.statusChangeRequest.QuotationNumber = this.quotationNumber;  //Número de cotización
    //         this.statusChangeRequest.Status = '1'; // Nuevo estado
    //         this.statusChangeRequest.Reason = null; // Motivo
    //         this.statusChangeRequest.Comment = this.mainFormGroup.controls.comment.value; //Comentario
    //         this.statusChangeRequest.User = JSON.parse(localStorage.getItem('currentUser'))['id'];  //Usuario

    //         quotation.StatusChangeData = this.statusChangeRequest;
    //         quotation.RiskList = [];
    //         this.inputsQuotation.PensionDetailsList.forEach((element) => {
    //             let item = new QuotationRisk();
    //             item.RiskTypeId = element.RiskTypeId;
    //             item.ProductTypeId = JSON.parse(localStorage.getItem('pensionID'))['id'];
    //             item.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
    //             item.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
    //             item.PayrollAmount = CommonMethods.ConvertToReadableNumber(element.PayrollAmount);
    //             item.CalculatedRate = CommonMethods.ConvertToReadableNumber(element.Rate);
    //             item.PremimunPerRisk = CommonMethods.ConvertToReadableNumber(element.Premium);
    //             item.MinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionMinPremium);
    //             item.ProposedMinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionPropMinPremium);
    //             item.EndorsmentPremium = CommonMethods.ConvertToReadableNumber(element.EndorsmentPremium);

    //             item.NetPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionNetAmount);
    //             item.GrossPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionGrossAmount);
    //             item.PremiumIGV = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionCalculatedIGV);

    //             item.RiskRate = CommonMethods.ConvertToReadableNumber(element.RiskRate);
    //             item.Discount = element.Discount;
    //             item.Variation = element.Variation;
    //             item.TariffFlag = '3';

    //             quotation.RiskList.push(item);
    //         });
    //         this.inputsQuotation.SaludDetailsList.forEach((element) => {
    //             let item = new QuotationRisk();
    //             item.RiskTypeId = element.RiskTypeId;
    //             item.ProductTypeId = JSON.parse(localStorage.getItem('saludID'))['id'];
    //             item.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
    //             item.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
    //             item.PayrollAmount = CommonMethods.ConvertToReadableNumber(element.PayrollAmount);
    //             item.CalculatedRate = CommonMethods.ConvertToReadableNumber(element.Rate);
    //             item.PremimunPerRisk = CommonMethods.ConvertToReadableNumber(element.Premium);
    //             item.MinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludMinPremium);
    //             item.ProposedMinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludPropMinPremium);
    //             item.EndorsmentPremium = CommonMethods.ConvertToReadableNumber(element.EndorsmentPremium);

    //             item.NetPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludNetAmount);
    //             item.GrossPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludGrossAmount);
    //             item.PremiumIGV = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludCalculatedIGV);

    //             item.RiskRate = CommonMethods.ConvertToReadableNumber(element.RiskRate);
    //             item.Discount = element.Discount;
    //             item.Variation = element.Variation;
    //             item.TariffFlag = '3';

    //             quotation.RiskList.push(item);
    //         });

    //         quotation.BrokerList = [];

    //         this.inputsQuotation.SecondaryBrokerList.forEach((element) => {
    //             let item = new QuotationBroker();
    //             item.ChannelTypeId = element.TIPO_CANAL;
    //             item.ChannelId = element.CANAL;
    //             item.ClientId = element.SCLIENT;

    //             item.HealthProposedCommission = CommonMethods.isNumber(element.COMISION_SALUD_PRO) ? element.COMISION_SALUD_PRO : 0;
    //             item.HealthCommission = CommonMethods.isNumber(element.COMISION_SALUD) ? element.COMISION_SALUD : 0;
    //             item.PensionProposedCommission = CommonMethods.isNumber(element.COMISION_PENSION_PRO) ? element.COMISION_PENSION_PRO : 0;
    //             item.PensionCommission = CommonMethods.isNumber(element.COMISION_PENSION) ? element.COMISION_PENSION : 0;
    //             item.IsPrincipal = false;
    //             item.SharedCommission = 0;
    //             quotation.BrokerList.push(item);
    //         });

    //         let formData = new FormData();
    //         this.files.forEach(function (file) {
    //             // anexamos todos los archivos al formData
    //             formData.append(file.name, file, file.name)
    //         });

    //         formData.append('quotationModification', JSON.stringify(quotation));

    //         swal.fire({
    //             title: 'Información',
    //             text: '¿Desea Recotizar la cotización N° ' + this.quotationNumber + '?',
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Sí',
    //             allowOutsideClick: false,
    //             cancelButtonText: 'No'
    //         })
    //             .then((result) => {
    //                 if (result.value) {
    //                     this.isLoading = true;
    //                     this.quotationService.modifyQuotation(formData).subscribe(
    //                         res => {
    //                             if (res.P_COD_ERR == 0) {
    //                                 if (res.P_SAPROBADO == 'S') {
    //                                     self.isLoading = false;
    //                                     if (res.P_NCODE == 0) {
    //                                         swal.fire({
    //                                             title: 'Información',
    //                                             text: 'Se generó la cotización Nº ' + this.quotationNumber + '¿Desea emitir la póliza?',
    //                                             icon: 'question',
    //                                             showCancelButton: true,
    //                                             confirmButtonText: 'Sí',
    //                                             allowOutsideClick: false,
    //                                             cancelButtonText: 'No'
    //                                         })
    //                                             .then((result) => {
    //                                                 if (result.value) {
    //                                                     self.isLoading = false;
    //                                                     this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: res.P_NID_COTIZACION } });
    //                                                 } else {
    //                                                     this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                                                 }
    //                                             });
    //                                     } else {
    //                                         self.isLoading = false;
    //                                         swal.fire('Información', 'Se ha recotizado correctamente la cotización N° ' + res.P_NID_COTIZACION + ',  para Emitir debe esperar su aprobación.', 'success');
    //                                         this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                                     }
    //                                 } else {
    //                                     self.isLoading = false;
    //                                     swal.fire('Información', 'Se ha recotizado correctamente la cotización N° ' + res.P_NID_COTIZACION + ',  para Emitir debe esperar su aprobación. ' + res.P_SMESSAGE, 'success');
    //                                     this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                                 }
    //                             } else {
    //                                 self.isLoading = false;
    //                                 swal.fire('Información', res.P_MESSAGE, 'error');
    //                             }
    //                         },
    //                         error => {
    //                             swal.fire('Información', this.genericServerErrorMessage, 'error');
    //                         }
    //                     );
    //                 }
    //             });

    //     } else {
    //         swal.fire('Información', CommonMethods.listToString(errorList), 'error')
    //     }

    // }

    generateInfoDerivation(type: string) {

        let data = '';

        if (this.typeTransacTecnica == 'Renovación') {
            data = type == 'mode' ? 'RenewFromQuotation' : '';
        }

        if (this.typeTransacTecnica == 'Inclusión') {
            data = type == 'mode' ? 'IncludeFromQuotation' : '';
        }

        if (this.typeTransacTecnica == 'Exclusión') {
            data = type == 'mode' ? 'ExcludeFromQuotation' : '';
        }

        if (this.typeTransacTecnica == 'Anulación') {
            data = type == 'mode' ? 'CancelFromQuotation' : '';
        }

        return data;
    }

    /**Decide que operación hacer de acuerdo al modo de esta vista --*/
    async manageOperation() {
        console.log(this.mode)
        if (['Renovación', 'Inclusión', 'Exclusión','Anulación'].includes(this.typeTransacTecnica)) {
            this.mode = this.generateInfoDerivation('mode');
            this.typeTransacTecnica = this.generateInfoDerivation('');
        }
        console.log(this.mode)

        if(this.mode == 'Visualizar' && this.typeTransacTecnica == 'Emisión' && this.inputsQuotation.NFLAG_STRAME == 1){
            this.mode = 'Emitir';
        }
        // if (this.typeTransacTecnica == 'Renovación') {
        //     this.mode = 'RenewFromQuotation';
        //     this.typeTransacTecnica = '';
        // }


        switch (this.mode) {
            // case 'Recotizar':
            //     this.modifyQuotation();
            //     break;
            case 'Evaluar':
                this.AddStatusChange();
                break;
            case 'Emitir':
                this.emitirPoliza();
                break;
            case 'EmitirR':
                this.emitirPoliza();
                break;
            case 'Autorizar':
                this.AddStatusChange();
                break;
            case 'Renovar':
                this.renovarPoliza();
                break;
            case 'RenewFromQuotation':
                this.router.navigate(['/extranet/sctr/poliza/transaccion/renew'], {
                    queryParams:
                    {
                        nroCotizacion: this.quotationNumber,
                        fromTecnica: 'renewAprove'
                    }
                });
                break;
            case 'IncludeFromQuotation':
                this.router.navigate(['/extranet/sctr/poliza/transaccion/include'], {
                    queryParams:
                    {
                        nroCotizacion: this.quotationNumber,
                        fromTecnica: 'includeAprove'
                    }
                });
                break;
            case 'ExcludeFromQuotation':
                this.router.navigate(['/extranet/sctr/poliza/transaccion/exclude'], {
                    queryParams:
                    {
                        nroCotizacion: this.quotationNumber,
                        fromTecnica: 'excludeAprove'
                    }
                });
                break;
            case 'CancelFromQuotation':
                this.router.navigate(['/extranet/sctr/poliza/transaccion/cancel'], {
                    queryParams:
                    {
                        nroCotizacion: this.quotationNumber,
                        fromTecnica: 'cancelAprove'
                    }
                });
                break;
            case 'Incluir':
                this.incluirPoliza();
                break;
            case 'Endosar':
                this.endosarPoliza();
                break;
            case 'Excluir':
                this.excluirPoliza();
                break;
            default:
                this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: this.quotationNumber } });
                break;
        }
    }

    /**Primera búsqueda de cambios de estado de cotización */
    firstSearch() {
        this.filter.PageNumber = 1;
        // if (this.isTransact) {
        //     this.searchTrackingTransact()
        // } else {
        this.searchTracking();
        // }
    }
    /**Búsqueda de estados de la cotización accionados por el cambio de página */
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    /**Proceso de búsqueda de cambios de estado de la cotización */
    searchTracking() {
        this.quotationService.getTrackingList(this.filter).subscribe(
            res => {
                this.isLoading = false;
                this.statusChangeList = res.GenericResponse;
                this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                this.totalItems = this.statusChangeList.length;

                if (this.statusChangeList.length == 0) {
                    this.statusChangeList = [];
                } else {
                    if (this.statusChangeList.length > 1) {
                        const files = this.statusChangeList[0].FilePathList;
                        const estadoAnterior = this.statusChangeList[1].Status;
                        const estadoUltimo = this.statusChangeList[0].Status;

                        if ((estadoAnterior == 'CREADO' && files == null) ||
                            (this.mode == 'EmitirR' && estadoUltimo == 'CREADO') ||
                            (this.mode == 'EmitirR' && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == 'Emitir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == 'Renovar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == 'Declarar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == 'Incluir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == 'Endosar' && estadoUltimo == 'CREADO') ||
                            (this.mode == 'EmitirR' && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == 'Incluir' && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == 'Renovar' && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == 'Declarar' && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == 'Endosar' && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1))
                        ) {
                            this.inputsQuotation.estadoPago = true;
                        } else {
                            this.inputsQuotation.estadoPago = false;
                        }
                    }
                }
            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
        }

    }

    /**Muestra las comisión propuesta original de salud */
    // switchHealthPropCommissionValue() {
    //     if (!this.enabledHealthMainPropCommission) this.inputsQuotation.BrokerSaludPropBounty = this.originalHealthMainPropComission;
    // }
    // /**Muestra las comisión autorizada original de salud */
    // switchHealthAuthCommissionValue() {
    //     if (!this.enabledHealthMainAuthCommission) this.inputsQuotation.BrokerSaludAuthBounty = this.originalHealthMainAuthComission;
    // }
    /**Muestra las comisión propuesta original de pensión */
    // switchPensionPropCommissionValue() {
    //     if (!this.enabledPensionMainPropCommission) this.inputsQuotation.BrokerPensionPropBounty = this.originalPensionMainPropComission;
    // }
    // /**Muestra las comisión autorizada original de pensión */
    // switchPensionAuthCommissionValue() {
    //     if (!this.enabledPensionMainAuthCommission) this.inputsQuotation.BrokerPensionAuthBounty = this.originalPensionMainAuthComission;
    // }

    /**Muestra las prima mínima propuesta original de salud */
    // switchHealthMinPropPremiumValue() {
    //     if (!this.enabledHealthMinPropPremium) this.inputsQuotation.SaludPropMinPremium = this.originalHealthMinPropPremium;
    //     this.checkMinimunPremiumForOriginals(this.healthProductId.id);
    // }
    // /**Muestra las prima mínima propuesta original de pensión */
    // switchPensionMinPropPremiumValue() {
    //     // console.log('switchPensionMinPropPremiumValue()');
    //     // console.log(this.inputsQuotation.PensionPropMinPremium);
    //     if (!this.enabledPensionMinPropPremium) this.inputsQuotation.PensionPropMinPremium = this.originalPensionMinPropPremium;
    //     this.checkMinimunPremiumForOriginals(this.pensionProductId.id);
    // }
    /**Muestra las prima mínima autorizada original de pensión */
    // switchPensionMinAuthPremiumValue() {
    //     // console.log('switchPensionMinAuthPremiumValue');
    //     if (!this.enabledPensionAuthorizedPremium) this.inputsQuotation.PensionAuthMinPremium = this.originalPensionMinAuthPremium;
    //     this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
    // }
    // /**Muestra las prima mínima autorizada original de salud */
    // switchHealthMinAuthPremiumValue() {
    //     if (!this.enabledHealthAuthorizedPremium) this.inputsQuotation.HealthAuthMinPremium = this.originalHealthMinAuthPremium;
    //     this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
    // }

    /**Muestra las tasas propuestas originales de salud */
    // switchHealthProposedRateValues() {
    //     if (!this.enabledHealthProposedRate) {
    //         this.listaTasasSalud.map(function (item) {
    //             item.ProposedRate = item.OriginalProposedRate;
    //             item.valItemPr = false;
    //         });
    //     }
    // }
    // /**Muestra las tasas propuestas originales de pensión */
    // switchPensionProposedRateValues() {
    //     if (!this.enabledPensionProposedRate) {
    //         this.listaTasasPension.map(function (item) {
    //             item.ProposedRate = item.OriginalProposedRate;
    //             item.valItemPr = false;
    //         });
    //     }
    // }
    /**Muestra las tasas autorizadas originales de salud */
    switchHealthAuthorizedRateValues() {
        let self = this;
        this.hideBoxSalud = !this.enabledHealthAuthorizedRate ? true : false;
        // if (!this.enabledHealthAuthorizedRate) {
        //     this.hideBoxSalud = true; //AVS - INTERCONEXION SABSA 
        //     // this.listaTasasSalud.map(function (item) {
        //     //     self.calculateNewPremiums(item.OriginalAuthorizedRate, item.RiskTypeId, self.healthProductId.id);
        //     //     item.AuthorizedRate = item.OriginalAuthorizedRate;
        //     //     item.valItemAu = false;
        //     // });
        // } else {
        //     this.hideBoxSalud = false; //AVS - INTERCONEXION SABSA 
        //     this.listaTasasSalud.map(function (item) {
        //         item.AuthorizedRate = '0';
        //         item.valItemAu = false;
        //     });
        // }

        this.listaTasasSalud.map(function (item) {
            item.rateAut = 0;
        });

        this.resetearPrimas(0, this.infoSalud, {})
    }
    /**Muestra las tasas autorizadas originales de pensión */
    switchPensionAuthorizedRateValues() {
        let self = this;

        this.hideBoxPension = !this.enabledPensionAuthorizedRate ? true : false;

        // if (!this.enabledPensionAuthorizedRate) {
        //     this.hideBoxPension = true;
        // } else {
        //     this.hideBoxPension = false; //AVS - INTERCONEXION SABSA 
        // }

        this.listaTasasPension.map(function (item) {
            item.rateAut = 0;
        });

        this.resetearPrimas(0, this.infoPension, {})
    }
    /**Muestra la comisión propuesta original para salud*/
    switchHealthSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledHealthSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_PRO = item.OriginalHealthPropCommission;
                item.valItemSalPr = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para salud*/
    switchHealthSecondaryAuthCommissionValue() {
        let self = this;
        this.flagCheckboxComisionSalud = this.enabledHealthSecondaryAuthCommission; //AVS - INTERCONEXION SABSA
        if (!this.enabledHealthSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_AUT = item.OriginalHealthAuthCommission;
                item.valItemSal = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para pensión*/
    switchPensionSecondaryAuthCommissionValue() {
        let self = this;
        this.flagCheckboxComisionPension = this.enabledPensionSecondaryAuthCommission; //AVS - INTERCONEXION SABSA
        if (!this.enabledPensionSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_AUT = item.OriginalPensionAuthCommission;
                item.valItemPen = false;
            });
        }
    }
    /**Muestra la comisión propuesta original para pensión*/
    switchPensionSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledPensionSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_PRO = item.OriginalPensionPropCommission;
                item.valItemPenPr = false;
            });
        }
    }

    /**Valida las tasas propuestas */
    // areProposedRatesValid(): string[] {
    //     let errorList = [];

    //     if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
    //         this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
    //             if (broker.valItemPenPr == true) {
    //                 errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
    //             }
    //         });

    //         this.inputsQuotation.PensionDetailsList.map(element => {
    //             element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
    //             element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

    //             if (element.WorkersCount <= 0) {
    //                 element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
    //                 if (element.ProposedRate > 0) {
    //                     errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Pensión.')
    //                 }
    //             }
    //             else {
    //                 if (element.valItemPr == true) {
    //                     errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
    //                 }
    //                 if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Pensión no es válida.');
    //             }


    //             return element;
    //         });
    //     }

    //     if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
    //         this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
    //             if (broker.valItemSalPr == true) {
    //                 errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
    //             }
    //         });

    //         this.inputsQuotation.SaludDetailsList.map(element => {
    //             element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
    //             element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

    //             if (element.WorkersCount <= 0) {
    //                 element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
    //                 if (element.ProposedRate > 0) {
    //                     errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Salud.')
    //                 }
    //             }
    //             else {
    //                 if (element.valItemPr == true) {
    //                     errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
    //                 }

    //                 if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Salud no es válida.');
    //             }

    //             return element;
    //         });
    //     }

    //     return errorList;
    // }

    /**Valida las comisiones autorizadas */
    // validateAuthorizedCommmissions(): string[] {
    //     let self = this;
    //     let errorList = [];
    //     this.inputsQuotation.SecondaryBrokerList.map((item: any) => {
    //         if (item.CANAL != '2015000002') {
    //             if (self.inputsQuotation.SaludDetailsList != null && self.inputsQuotation.SaludDetailsList.length > 0 && self.epsItem.STYPE == 1) {
    //                 if (CommonMethods.isNumber(item.COMISION_SALUD_AUT) == false) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' no es válida.');
    //                 // else if (item.COMISION_SALUD_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
    //             }
    //             if (self.inputsQuotation.PensionDetailsList != null && self.inputsQuotation.PensionDetailsList.length > 0) {
    //                 if (CommonMethods.isNumber(item.COMISION_PENSION_AUT) == false) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' no es válida.');
    //                 // else if (item.COMISION_PENSION_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
    //             }
    //         }
    //     });
    //     return errorList;
    // }
    /**Valida las primas autorizadas */
    // validateAuthorizedPremiums(): string[] {
    //     let errorList = [];
    //     if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0 && this.epsItem.STYPE == 1) {
    //         if (CommonMethods.isNumber(this.inputsQuotation.HealthAuthMinPremium) == false) errorList.push('La prima mínima autorizada de salud no es válida.');
    //         else if (this.inputsQuotation.HealthAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La prima mínima autorizada de salud debe ser mayor a cero.');
    //     }

    //     if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
    //         if (CommonMethods.isNumber(this.inputsQuotation.PensionAuthMinPremium) == false) errorList.push('La prima mínima autorizada de pensión no es válida.');
    //         else if (this.inputsQuotation.PensionAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La prima mínima autorizada de pensión debe ser mayor a cero.');
    //     }

    //     return errorList;
    // }
    /**Valida las tasas autorizadas */
    // areAuthorizedRatesValid(): string[] {
    //     let errorList = [];
    //     if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
    //         this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
    //             if (broker.valItemPen == true) {
    //                 errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
    //             }
    //         });

    //         this.inputsQuotation.PensionDetailsList.map(element => {
    //             element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
    //             element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
    //             element.AuthorizedRate = element.AuthorizedRate !== '0' ? CommonMethods.ConvertToReadableNumber(element.AuthorizedRate) : CommonMethods.ConvertToReadableNumber(element.Rate); //AVS - INTERCONEXION SABSA 
    //             if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) {
    //                 errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Pensión debe ser mayor a cero.')
    //             } else {
    //                 if (element.valItemAu == true) {
    //                     errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
    //                 }
    //             };
    //             return element;
    //         });
    //     }
    //     if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
    //         this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
    //             if (broker.valItemSal == true) {
    //                 errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
    //             }
    //         });

    //         if (!this.template.ins_mapfre) {
    //             this.inputsQuotation.SaludDetailsList.map(element => {
    //                 element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
    //                 element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
    //                 element.AuthorizedRate = element.AuthorizedRate !== '0' ? CommonMethods.ConvertToReadableNumber(element.AuthorizedRate) : CommonMethods.ConvertToReadableNumber(element.Rate); //AVS - INTERCONEXION SABSA 
    //                 if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) {
    //                     errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Salud debe ser mayor a cero.');
    //                 } else {
    //                     if (element.valItemAu == true) {
    //                         errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
    //                     }
    //                 }
    //                 return element;
    //             });
    //         }

    //     }
    //     return errorList;
    // }

    async getValidateDebt(branchCode, productCode, clientCode, transactionCode): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.transactionCode = transactionCode;
        validateDebtRequest.profileCode = Number(this.perfil);
        validateDebtRequest.nintermed = JSON.parse(localStorage.getItem('currentUser'))['canal'];
        await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
            res => {
                this.isLoading = false;
                validateDebtResponse = res;
            },
            err => {
                this.isLoading = false;
            }
        );
        return validateDebtResponse;
    }

    generateAccountStatus(branchCode, productCode, clientCode, documentCode): Promise<any> {
        const genAccountStatusRequest = new GenAccountStatusRequest();
        genAccountStatusRequest.branchCode = branchCode;
        genAccountStatusRequest.productCode = productCode;
        genAccountStatusRequest.clientCode = clientCode;
        genAccountStatusRequest.documentCode = documentCode;
        return swal.queue([{
            title: this.validateDebtResponse.observation,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            text: '¿Desea descargar su Estado de Cuenta?',
            // showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false,
            // showLoaderOnConfirm: true,
            preConfirm: () => {
                // this.isLoading = true;
                return this.createDocument(genAccountStatusRequest)
                    .then(async res => {
                        await this.downloadFile(res.path).then(() => {
                            // this.isLoading = false;
                        });
                    })
                    .catch(() => {
                        swal.insertQueueStep({
                            title: 'Error al descargar el estado de cuenta'
                        });
                    });
            }
        }]);
    }

    generateAccountStatusExterno(branchCode, productCode, clientCode, documentCode, externo): Promise<any> {
        const genAccountStatusRequest = new GenAccountStatusRequest();
        genAccountStatusRequest.branchCode = branchCode;
        genAccountStatusRequest.productCode = productCode;
        genAccountStatusRequest.clientCode = clientCode;
        genAccountStatusRequest.documentCode = documentCode;
        if (externo == 0) {
            return swal.queue([{
                title: this.validateDebtResponse.observation,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                text: '¿Desea descargar su Estado de Cuenta?',
                // showCloseButton: true,
                showCancelButton: true,
                allowOutsideClick: false,
                // showLoaderOnConfirm: true,
                preConfirm: () => {
                    this.isLoading = true;
                    return this.createDocument(genAccountStatusRequest)
                        .then(async res => {
                            await this.downloadFile(res.path).then(() => {
                                this.isLoading = false;
                            });
                        })
                        .catch(() => {
                            swal.insertQueueStep({
                                title: 'Error al descargar el estado de cuenta'
                            });
                        });
                }
            }]);
        } else {
            return swal.queue([{
                title: this.validateDebtResponse.observation,
                confirmButtonText: 'Aceptar',
                text: 'Para mayor información comunicarse con el Ejecutivo de Comercial',
                // showCloseButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                // showLoaderOnConfirm: true,
                preConfirm: () => {
                    this.isLoading = true;
                }
            }]);
        }

    }

    async createDocument(request: GenAccountStatusRequest): Promise<GenAccountStatusResponse> {
        let genAccountStatusResponse: GenAccountStatusResponse = {};
        await this.collectionsService.generateAccountStatus(request).toPromise().then(
            res => {
                genAccountStatusResponse = res;
            },
            err => {
            }
        );
        return genAccountStatusResponse;
    }

    async dataClient() {
        let data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
        data.P_SIDDOC = this.inputsQuotation.DocumentNumber.toUpperCase().trim();

        await this.clientInformationService.validateContractingData(data).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {

                    this.contractingdata = res.EListClient[0];
                    if (this.flagGobiernoIniciado) { //tramite estado
                        this.inputsQuotation.P_NPENDIENTE = res.P_NPENDIENTE;
                    }
                    this.inputsQuotation.P_SISCLIENT_GBD = (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
                    if (res.EListClient[0].EListContactClient.length == 0 && (this.mode == 'Evaluar' || this.mode == 'Emitir' || this.mode == 'EmitirR' || this.mode == 'Renovar')) {
                        this.flagContact = true;
                    }

                    if (res.EListClient[0].EListEmailClient.length == 0 && (this.mode == 'Evaluar' || this.mode == 'Emitir' || this.mode == 'EmitirR' || this.mode == 'Renovar')) {
                        this.flagEmail = true;
                    }
                }
            }
        );
    }

    async ValidateRestricClient(sclient) {
        if (this.template.ins_validateDebt && sclient != '') {
            //AVS Mejoras SCTR
            this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, sclient, 1);

            if (this.validateDebtResponse.lockMark === 2) {
                this.flagDisabledRestric = true;

            }
        }
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


    async getInfoExperia(res): Promise<any> {

        // console.log(res);
        // console.log(this.template.ins_historialCreditoQuotation);
        // if (this.template.ins_historialCreditoQuotation) {
        const data: any = {};
        data.tipoid = res[0].GenericResponse.TIPO_DOCUMENTO == '1' ? '2' : '1';
        data.id = res[0].GenericResponse.NUM_DOCUMENTO;
        data.papellido = res[0].GenericResponse.P_SLASTNAME;
        data.sclient = this.contractingdata.P_SCLIENT;
        data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
            res => {
                this.creditHistory = {};
                this.creditHistory.nflag = res.nflag;
                this.creditHistory.sdescript = res.sdescript;
            }
        );
        // }
    }

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        switch (modalName) {
            case 'add-contact':
                modalRef = this.modalService.open(
                    AddContactComponent, {
                    size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false
                });
                modalRef.componentInstance.reference = modalRef;
                typeContact.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
                typeContact.P_SIDDOC = this.inputsQuotation.DocumentNumber;
                modalRef.componentInstance.typeContact = typeContact;
                modalRef.componentInstance.listaContactos = this.contactList;
                modalRef.componentInstance.itemContacto = null;
                break;
        }
    }

    // Section Contacto
    editContact(row) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        let itemContacto: any = {};
        modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        typeContact.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
        typeContact.P_SIDDOC = this.inputsQuotation.DocumentNumber;
        modalRef.componentInstance.typeContact = typeContact;
        this.contactList.map(function (dato) {
            if (dato.P_NROW === row) {
                itemContacto = dato;
            }
        });
        modalRef.componentInstance.itemContacto = itemContacto;
        modalRef.componentInstance.listaContactos = this.contactList;
    }

    deleteContact(row) {
        swal.fire({
            title: 'Eliminar Contacto',
            text: '¿Estás seguro que deseas eliminar esta contacto?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.contactList.splice(row, 1);
                }
            });
    }

    getDate() {
        return new Date();
    }
    async base64ToArrayBuffer(base64): Promise<any> {
        let binaryString = atob(base64);
        let binaryLen = binaryString.length;
        let bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            let ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    async saveByteArray(reportName, byte): Promise<any> {
        let blob = new Blob([byte], { type: 'application/excel' });
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        let fileName = reportName;
        link.download = fileName;
        link.click();
    };

    async downloadFileBase64(stream: string, nameFile: string): Promise<any> {  //Descargar archivos de trama
        let sampleArr = this.base64ToArrayBuffer(stream);
        this.saveByteArray(nameFile + '.xls', sampleArr);
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


    async getTramaFile(item: any): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = item.linea;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        return this.collectionsService.getTramaFile(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {
                    const nameFile: string = item.desMov + '_' + this.quotationNumber;
                    const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                    FileSaver.saveAs(file);
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    async CalculateAjustedAmounts() {
        let totalPolicyAmount = 0.0;
        let totalPolicyPension = 0.0;
        let totalPolicySalud = 0.0;
        await this.getMonthsSCTR(); //AVS Nueva Estimación De Cálculo 23/12/2022

        totalPolicyPension = await this.getAjustedAmounts(this.pensionID.nbranch, this.pensionID.id, this.inputsQuotation.PensionNetAmount);
        totalPolicySalud = await this.getAjustedAmounts(this.healthProductId.nbranch, this.healthProductId.id, this.inputsQuotation.SaludNetAmount);

        this.SaludBruta = totalPolicySalud;  //AVS - INTERCONEXION SABSA 
        this.PensionBruta = totalPolicyPension;  //AVS - INTERCONEXION SABSA

        totalPolicyAmount = CommonMethods.formatValor((Number(totalPolicyPension) + Number(totalPolicySalud)), 2)

        return totalPolicyAmount;
    }

    async ubigeoInei(distrito) {
        let ubigeo = 0
        await this.quotationService.equivalentMunicipality(distrito).toPromise().then(
            res => {
                ubigeo = res;
            },
            error => {
                // this.loading = false;
                ubigeo = 0;
            }
        );
        return ubigeo;
    }

    async callButtonPE() {
        // let totalPolicy = await this.calculateTotal() // RI - SCTR - LNSR
        let totalPolicy = await this.CalculateAjustedAmounts();

        this.saveLog('callButtonPE - quotation-evalua - Cliente360 - B', 'Nid-proc - ' + this.processID + " // contractingdata => " + JSON.stringify(this.contractingdata), 1);

        let nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
        let lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : ''

        this.dataCIP = {}
        this.dataCIP.tipoSolicitud = 1 // Solo para emision
        this.dataCIP.monto = totalPolicy
        this.dataCIP.correo = this.inputsQuotation.P_SE_MAIL
        this.dataCIP.conceptoPago = CommonMethods.conceptProduct(this.codProducto)
        this.dataCIP.nombres = nameClient
        this.dataCIP.Apellidos = lastnameClient
        this.dataCIP.ubigeoINEI = await this.ubigeoInei(this.inputsQuotation.DistrictId)
        this.dataCIP.tipoDocumento = this.inputsQuotation.DocumentTypeId
        this.dataCIP.numeroDocumento = this.inputsQuotation.DocumentNumber
        this.dataCIP.telefono = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : ''
        this.dataCIP.ramo = this.inputsQuotation.NBRANCH
        this.dataCIP.producto = this.inputsQuotation.NPRODUCT
        this.dataCIP.ExternalId = this.inputsQuotation.P_NID_PROC
        this.dataCIP.quotationNumber = this.quotationNumber
        this.dataCIP.codigoCanal = this.inputsQuotation.SecondaryBrokerList[0].CANAL;
        this.dataCIP.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.dataCIP.eps = Number(this.epsItem.NCODE)
        this.dataCIP.Moneda = this.inputsQuotation.CurrencyId
        if (Number(this.epsItem.NCODE) == 3 && this.valMixSAPSA == 1 || this.inputsQuotation.NBRANCH == this.pensionID.nbranch && this.inputsQuotation.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 19/09/2023
            this.dataCIP.producto_EPS = this.healthProductId.id
            this.dataCIP.ExternalId_EPS = ''
            //SCTR - ED
            //this.dataCIP.monto_pension = this.totalNetoPensionAutSave;
            //this.dataCIP.monto_salud = this.totalNetoSaludAutSave;
            // SD-70383
            this.dataCIP.monto_salud = this.SaludBruta;
            this.dataCIP.monto_pension = this.PensionBruta;
            this.dataCIP.mixta = this.valMixSAPSA
        }
    }

    async getPolicyCot() {
        let tempTypeTransac = ['2', '3', '4', '5'].includes(this.inputsQuotation.NTYPE_TRANSAC) ? Number(this.inputsQuotation.NTYPE_TRANSAC) : this.typeMovement;
        await this.policyService.getPolicyCot(this.quotationNumber, tempTypeTransac)
            .toPromise().then(async (res: any) => {
                if (res != null) {
                    this.nroPension = res[0].POL_PEN;
                    this.nroSalud = res[0].POL_SAL;
                    this.flagMesVec = res[0].FACT_MES_VENC == 0 ? false : true;
                    this.inputsQuotation.inicioVigencia = new Date(res[0].DESDE);
                    this.inputsQuotation.finVigencia = new Date(res[0].HASTA);
                    this.inputsQuotation.facturacionAnticipada = res[0].FACT_ANTI == 0 ? false : true;
                    this.inputsQuotation.facturacionVencido = res[0].FACT_MES_VENC == 0 ? false : true;
                    // console.log('this.flagMesVec' + this.flagMesVec);
                    // await this.cargarDatosPoliza(res);
                }

            });
    }

    async validateFlow() {
        // let mensaje = '';
        // mensaje = await this.validateEmit()

        // if (mensaje == '') {
        this.savedPolicyList = [];
        await this.getMonthsSCTR();
        await this.callButtonPE();
        await this.dataEmisionSCTR();

        // } else {
        //     // this.prePayment = false
        //     this.loading = false;
        //     swal.fire('Información', mensaje, 'error');
        // }
    }

    async getMonthsSCTR() { //AVS Nueva Estimacion de Calculo 23/12/2022

        let totalMonths = 0;
        let monthsSCTR: any = {};
        monthsSCTR.date = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
        monthsSCTR.dateFn = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
        monthsSCTR.npayfreq = this.mode == 'include' ? 6 : Number(this.inputsQuotation.tipoRenovacion);

        await this.policyService.GetMonthsSCTR(monthsSCTR).toPromise().then(
            res => {
                this.montos_sctr = res;
            },
            err => {
                console.log(err);
            }
        );
        return totalMonths;
    }

    async getAjustedAmounts(nBranch: Number, nProduct: Number, namo_afec: Number) {
        //AVS Nueva Estimacion de Calculo 23/12/2022
        let totalPolicy = 0.0;
        this.monthsSCTR = this.montos_sctr.P_RESULT;
        const data: any = {};
        data.P_NBRANCH = nBranch;
        data.P_NPRODUCT = nProduct;
        data.P_NAMO_AFEC_INI = CommonMethods.formatValor(Number(namo_afec) * this.monthsSCTR, 2);

        await this.policyService.AjustedAmounts(data).toPromise().then(
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
                    } else if (this.codProducto == 2 && nProduct == this.healthProductId.id) {
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

    // async dataEmision(idProcessVisa = 0) {
    //     this.savedPolicyList = {};
    //     this.savedPolicyList.P_NID_COTIZACION = this.quotationNumber; // nro cotizacion
    //     this.savedPolicyList.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //     this.savedPolicyList.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
    //     this.savedPolicyList.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; // Fecha hasta
    //     this.savedPolicyList.P_NTYPE_TRANSAC = this.typeMovement; //this.typeMovement; // tipo de movimiento
    //     this.savedPolicyList.P_NID_PROC = this.inputsQuotation.P_NID_PROC; // codigo de proceso (Validar trama)
    //     this.savedPolicyList.P_DEVOLVPRI = 0; // Add flag devolucion prima cobrada - JTV 19092022
    //     this.savedPolicyList.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida // Add flag regula mes vencido - JTV 19092022
    //     this.savedPolicyList.P_SFLAG_FAC_ANT = this.inputsQuotation.FACTURA_ANTICIPADA; // Facturacion Anticipada
    //     this.savedPolicyList.P_SCOLTIMRE = this.inputsQuotation.tipoRenovacion; // Tipo de renovacion
    //     this.savedPolicyList.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago; // Frecuencia Pago
    //     this.savedPolicyList.P_NMOV_ANUL = 0; // Movimiento de anulacion
    //     this.savedPolicyList.P_NNULLCODE = 0; // Motivo anulacion
    //     this.savedPolicyList.P_SCOMMENT = ''; // this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); // Frecuencia Pago
    //     this.savedPolicyList.P_NID_PENSION = this.listaTasasPension.length > 0 ? 1 : this.epsItem.STYPE == 2 ? 0 : 1;
    //     this.savedPolicyList.P_NIDPAYMENT = idProcessVisa; // id proceso visa
    //     this.savedPolicyList.P_NPRODUCTO = this.inputsQuotation.NPRODUCT;
    //     const pensionTxt = this.nroPension != '' ? 'Pensión: ' + this.nroPension : '';
    //     const saludTxt = this.nroSalud != '' ? 'Salud: ' + this.nroSalud : '';
    //     const policyText = pensionTxt != '' ? pensionTxt + ' - ' + saludTxt : saludTxt;
    //     this.savedPolicyList.P_POLICY = policyText;
    //     this.savedPolicyList.P_STRAN = this.mode.slice(0, 2).toUpperCase(); // retroactividad
    //     this.savedPolicyList.P_NPOLICY_SALUD = this.nroSalud; //this.valMixSAPSA === 1 ? this.nroSalud : this.codProducto == 2 ? this.nroSalud : 0; //AVS INTERCONEXION SABSA 13/09/2023
    //     this.savedPolicyList.P_NBRANCH = this.inputsQuotation.NBRANCH; //AVS INTERCONEXION SABSA 13/09/2023
    //     const NDEPension = 0; // CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
    //     const NDESalud = 0; // CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);
    //     this.savedPolicyList.P_DSTARTDATE_POL = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //     this.savedPolicyList.P_DEXPIRDAT_POL = CommonMethods.formatDate(this.inputsQuotation.finVigencia);

    //     // if (Number(4) != 3) {
    //     const pensionData = this.DataSCTRPENSION;
    //     const saludData = this.DataSCTRSALUD;

    //     this.savedPolicyList.P_NAMO_AFEC = this.listaTasasPension.length > 0 ? Number(pensionData?.['P_NAMO_AFEC'] ?? 0.0) : this.listaTasasSalud.length > 0 ? Number(saludData?.['P_NAMO_AFEC'] ?? 0.0) : 0.0;
    //     this.savedPolicyList.P_NIVA = this.listaTasasPension.length > 0 ? Number(pensionData?.['P_NIVA'] ?? 0.0) : this.listaTasasSalud.length > 0 ? Number(saludData?.['P_NIVA'] ?? 0.0) : 0.0;
    //     this.savedPolicyList.P_NAMOUNT = this.listaTasasPension.length > 0 ? Number(pensionData?.['P_NAMOUNT'] ?? 0.0) : this.listaTasasSalud.length > 0 ? Number(saludData?.['P_NAMOUNT'] ?? 0.0) : 0.0;
    //     // } else {
    //     //     await this.CalculateAjustedAmounts();
    //     //     const pensionData = this.DataSCTRPENSION;
    //     //     const saludData = this.DataSCTRSALUD;

    //     //     this.savedPolicyList.P_NAMO_AFEC = this.inputsQuotation.PensionDetailsList.length > 0 ? Number(pensionData?.['P_NAMO_AFEC']) ?? 0.0 : this.inputsQuotation.SaludDetailsList.length > 0 ? Number(saludData?.['P_NAMO_AFEC']) ?? 0.0 : 0.0;
    //     //     this.savedPolicyList.P_NIVA = this.inputsQuotation.PensionDetailsList.length > 0 ? Number(pensionData?.['P_NIVA']) ?? 0.0 : this.inputsQuotation.SaludDetailsList.length > 0 ? Number(saludData?.['P_NIVA']) ?? 0.0 : 0.0;
    //     //     this.savedPolicyList.P_NAMOUNT = this.inputsQuotation.PensionDetailsList.length > 0 ? Number(pensionData?.['P_NAMOUNT']) ?? 0.0 : this.inputsQuotation.SaludDetailsList.length > 0 ? Number(saludData?.['P_NAMOUNT']) ?? 0.0 : 0.0;
    //     // }
    //     this.savedPolicyList.P_NDE = this.listaTasasPension.length > 0 ? NDEPension : this.listaTasasSalud.length > 0 ? NDESalud : 0.0;
    //     this.savedPolicyList.P_NCOT_MIXTA = this.valMixSAPSA; //AVS INTERCONEXION SABSA 17012023
    //     this.savedPolicyList.P_PAYPF = 2; //AVS INTERCONEXION SABSA 17012023
    //     this.savedPolicyList.P_NCURRENCY = this.inputsQuotation.CurrencyId; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_SDELIMITER = this.inputsQuotation.DELIMITACION; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_NPREM_MINIMA = this.inputsQuotation.P_PRIMA_MIN_SALUD_AUT; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_NPREM_NETA = this.totalNetoSaludAutSave; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_IGV = this.igvSaludAutSave; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_NPREM_BRU = this.brutaTotalSaludAutSave; //AVS INTERCONEXION SABSA 06092023
    //     this.savedPolicyList.P_NID_PROC_EPS = this.inputsQuotation.NID_PROC_EPS; // this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 
    //     this.savedPolicyList.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA
    //     this.savedPolicyList.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
    //     this.savedPolicyList.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA  

    // }

    dataEmisionSCTR() {
        this.savedPolicyList = [];

        if (this.listaTasasSalud.length > 0) {
            let dataSalud = {
                P_NID_COTIZACION: this.quotationNumber,
                P_NID_PROC: this.inputsQuotation.P_NID_PROC,
                P_NBRANCH: 77,
                P_NPRODUCT: 2,
                P_SCOLTIMRE: this.inputsQuotation.tipoRenovacion,
                P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                P_NPAYFREQ: this.inputsQuotation.frecuenciaPago,
                P_SFLAG_FAC_ANT: this.inputsQuotation.facturacionAnticipada ? 1 : 0,
                P_FACT_MES_VENCIDO: this.inputsQuotation.facturacionVencido ? 1 : 0, // implementar
                P_NPREM_NETA: this.totalNetoSaludAutSave,
                P_IGV: this.igvSaludAutSave,
                P_NPREM_BRU: this.brutaTotalSaludAutSave,
                P_SCOMMENT: this.inputsQuotation.Comment,
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                P_NIDPAYMENT: null,
                P_NAMO_AFEC: this.totalNetoSaludAutSave,
                P_NIVA: this.igvSaludAutSave,
                P_NAMOUNT: this.brutaTotalSaludAutSave,
                P_NDE: 0,
                P_NCOT_MIXTA: this.valMixSAPSA,
                P_PAYPF: 2,
                P_NCURRENCY: this.inputsQuotation.CurrencyId,
                P_SDELIMITER: this.inputsQuotation.DELIMITACION,
                P_NEPS: this.epsItem.NCODE,
                P_NID_PROC_EPS: null, // implementar
                P_NPREM_MIN_EPS: this.inputsQuotation.P_PRIMA_MIN_SALUD // implementar
            };

            // polSalud.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA
            // if (this.nroMovimientoEPS !== null) {
            //     polSalud.P_NID_PROC_EPS = this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 18092023
            // } else {
            //     polSalud.P_NID_PROC_EPS = '';
            // }

            // polSalud.P_NPREM_MIN_EPS = ''; //AVS INTERCONEXION SABSA 18092023
            // for (const item of this.saludList) {
            //     if (item.PRIMA_MIN !== null && item.PRIMA_MIN !== undefined) {
            //         polSalud.P_NPREM_MIN_EPS = item.PRIMA_MIN;
            //         break;
            //     }
            // }

            this.savedPolicyList.push(dataSalud);
        }

        if (this.listaTasasPension.length > 0) {
            let dataPension = {
                P_NID_COTIZACION: this.quotationNumber,
                P_NID_PROC: this.inputsQuotation.P_NID_PROC,
                P_NBRANCH: 77,
                P_NPRODUCT: 1,
                P_SCOLTIMRE: this.inputsQuotation.tipoRenovacion,
                P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                P_NPAYFREQ: this.inputsQuotation.frecuenciaPago,
                P_SFLAG_FAC_ANT: this.inputsQuotation.facturacionAnticipada ? 1 : 0,
                P_FACT_MES_VENCIDO: 0, // implementar
                P_NPREM_NETA: this.totalNetoPensionAutSave,
                P_IGV: this.igvPensionAutSave,
                P_NPREM_BRU: this.brutaTotalPensionAutSave,
                P_SCOMMENT: null,
                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                P_NIDPAYMENT: null,
                P_NAMO_AFEC: this.totalNetoPensionAutSave,
                P_NIVA: this.igvPensionAutSave,
                P_NAMOUNT: this.brutaTotalPensionAutSave,
                P_NDE: 0,
                P_NCOT_MIXTA: this.valMixSAPSA,
                P_PAYPF: 2,
                P_NCURRENCY: this.inputsQuotation.CurrencyId,
                P_SDELIMITER: this.inputsQuotation.DELIMITACION,
                P_NEPS: this.epsItem.NCODE,
                P_NID_PROC_EPS: null, // implementar
                P_NPREM_MIN_EPS: '', // implementar

            };
            // if (this.nroMovimientoEPS !== null) {
            //     polSalud.P_NID_PROC_EPS = this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 18092023
            // } else {
            //     polSalud.P_NID_PROC_EPS = '';
            // }
            this.savedPolicyList.push(dataPension);
        }

        console.log(this.savedPolicyList);

    }

    async onPayment() {
        this.payPF = 1;

        await this.validateFlow();
        let policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.savedPolicyList;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = null;
        policyData.adjuntos = this.files;
        policyData.transaccion = 1; // this.typeMovement; //AVS INTERCONEXION SAPSA
        policyData.dataCIP = this.dataCIP;
        // localStorage.setItem('policydata', JSON.stringify(policyData));
        // const policyData = JSON.parse(localStorage.getItem('policydata'));

        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA
            // let dataQuotation: any = {};

            // const myFiles: FormData = new FormData();
            // this.files.forEach(file => {
            //     myFiles.append(file.name, file);
            // });

            // //console.log(this.polizaEmitCab.MIN_PENSION);
            // dataQuotation.P_NID_COTIZACION = this.quotationNumber;    //R.P.
            // dataQuotation.NumeroCotizacion = this.quotationNumber;    //R.P.
            // dataQuotation.P_STRAN = this.mode.slice(0, 2).toUpperCase();
            // dataQuotation.P_SCLIENT = this.contractingdata.P_SCLIENT;
            // dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
            // dataQuotation.P_DSTARTDATE = new Date();
            // dataQuotation.P_NIDCLIENTLOCATION = 0;
            // dataQuotation.P_SCOMMENT = ''; //his.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
            // dataQuotation.P_SRUTA = '';
            // dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            // dataQuotation.P_NREM_EXC = 0; // RQ EXC EHH
            // dataQuotation.P_ESTADO = this.cotEstado; //AVS - INTERCONEXION SABSA 21/09/2023
            // dataQuotation.RetOP = 2; // ehh retroactividad
            // dataQuotation.planId = null;
            // dataQuotation.FlagCambioFecha = 0;
            // dataQuotation.QuotationDet = [];
            // dataQuotation.QuotationCom = [];

            // dataQuotation.P_NBRANCH = this.inputsQuotation.NBRANCH;
            // dataQuotation.P_NPRODUCT = this.inputsQuotation.NPRODUCT;
            // dataQuotation.NumeroCotizacion = this.quotationNumber;
            // dataQuotation.CodigoProceso = this.inputsQuotation.P_NID_PROC;
            // dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion;
            // dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago;
            // dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia); // Fecha Inicio
            // dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.finVigencia); // Fecha hasta
            // dataQuotation.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA
            // dataQuotation.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
            // dataQuotation.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA  

            // // Detalle de Cotizacion Pension

            // if (this.listaTasasPension.length > 0) {
            //     const NDEPension = 0;
            //     this.listaTasasPension.forEach(dataPension => {
            //         let savedPolicyEmit: any = {};
            //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
            //         savedPolicyEmit.P_NBRANCH = this.inputsQuotation.NBRANCH;
            //         savedPolicyEmit.P_NPRODUCT = this.infoPension[0].productCore; // Pensión
            //         savedPolicyEmit.P_NMODULEC = dataPension.nmodulec;
            //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.totalWorkes;
            //         savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.planilla;
            //         savedPolicyEmit.P_NTASA_CALCULADA = dataPension.rate; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
            //         savedPolicyEmit.P_NTASA_PROP = dataPension.planProp;
            //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.premiumMonth;
            //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
            //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
            //         savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION;
            //         savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionAutSave;
            //         savedPolicyEmit.P_NSUM_IGV = this.igvPensionAutSave;
            //         savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionAutSave;
            //         savedPolicyEmit.P_NRATE = dataPension.rate;  //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
            //         savedPolicyEmit.P_NDISCOUNT = this.discountPension;
            //         savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension;
            //         savedPolicyEmit.P_FLAG = 0;
            //         savedPolicyEmit.P_NAMO_AFEC = this.GetAmountGeneric(this.totalNetoPensionAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NIVA = this.GetAmountGeneric(this.igvPensionAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NAMOUNT = this.GetAmountGeneric(this.brutaTotalPensionAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NDE = NDEPension;
            //         dataQuotation.QuotationDet.push(savedPolicyEmit);
            //     });
            // }

            // // Detalle de Cotizacion Salud
            // if (this.listaTasasSalud.length > 0) {
            //     const NDESalud = 0;
            //     this.listaTasasSalud.forEach(dataSalud => {
            //         const savedPolicyEmit: any = {};
            //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
            //         savedPolicyEmit.P_NBRANCH = this.inputsQuotation.NBRANCH;
            //         savedPolicyEmit.P_NPRODUCT = this.infoSalud[0].productCore; // Salud
            //         savedPolicyEmit.P_NMODULEC = dataSalud.nmodulec;
            //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.totalWorkes;
            //         savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.planilla;
            //         savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.rate;
            //         savedPolicyEmit.P_NTASA_PROP = dataSalud.planProp;
            //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.premiumMonth;
            //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_SALUD;
            //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
            //         savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_SALUD;
            //         savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludAutSave;
            //         savedPolicyEmit.P_NSUM_IGV = this.igvSaludAutSave;
            //         savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludAutSave;
            //         savedPolicyEmit.P_NRATE = dataSalud.rate;
            //         savedPolicyEmit.P_NDISCOUNT = dataSalud.discountSalud;
            //         savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud;
            //         savedPolicyEmit.P_FLAG = 0;
            //         savedPolicyEmit.P_NAMO_AFEC = this.GetAmountGeneric(this.brutaTotalSaludAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NIVA = this.GetAmountGeneric(this.igvSaludAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NAMOUNT = this.GetAmountGeneric(this.brutaTotalSaludAutSave, this.inputsQuotation.frecuenciaPago);
            //         savedPolicyEmit.P_NDE = NDESalud;
            //         dataQuotation.QuotationDet.push(savedPolicyEmit);
            //     });
            // }

            // // Detalle de Cotizacion Pension
            // // const NDEPension = 0;
            // // const NDESalud = 0;

            // // if (this.inputsQuotation.PensionDetailsList.length > 0) {
            // //     this.inputsQuotation.PensionDetailsList.forEach(dataPension => {
            // //         let savedPolicyEmit: any = {};
            // //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
            // //         savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
            // //         savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
            // //         savedPolicyEmit.P_NMODULEC = dataPension.RiskTypeId;
            // //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.WorkersCount;
            // //         savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.PayrollAmount;
            // //         savedPolicyEmit.P_NTASA_CALCULADA = dataPension.Rate; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
            // //         savedPolicyEmit.P_NTASA_PROP = dataPension.OriginalProposedRate == '' ? '0' : dataPension.OriginalProposedRate;
            // //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.Premium;
            // //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.MIN_PENSION;
            // //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.MIN_PENSION_PR == '' ? '0' : this.inputsQuotation.MIN_PENSION_PR;
            // //         savedPolicyEmit.P_NPREMIUM_END = 0;
            // //         savedPolicyEmit.P_NSUM_PREMIUMN = this.inputsQuotation.PensionNetAmount;
            // //         savedPolicyEmit.P_NSUM_IGV = this.inputsQuotation.PensionCalculatedIGV;
            // //         savedPolicyEmit.P_NSUM_PREMIUM = this.inputsQuotation.PensionGrossAmount;
            // //         savedPolicyEmit.P_NRATE = dataPension.AuthorizedRate == null ? '0' : dataPension.AuthorizedRate; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
            // //         savedPolicyEmit.P_NDISCOUNT = dataPension.Discount == '' ? '0' : dataPension.Discount;
            // //         savedPolicyEmit.P_NACTIVITYVARIATION = 0;
            // //         savedPolicyEmit.P_FLAG = 0;
            // //         savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_PENSION(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NDE = this.inputsQuotation.PensionDetailsList.length > 0 ? NDEPension : this.inputsQuotation.SaludDetailsList.length > 0 ? NDESalud : 0.0;
            // //         dataQuotation.QuotationDet.push(savedPolicyEmit);
            // //     });
            // // }

            // // // Detalle de Cotizacion Salud
            // // if (this.inputsQuotation.SaludDetailsList.length > 0) {
            // //     const NDEPension = 0;
            // //     const NDESalud = 0;

            // //     this.inputsQuotation.SaludDetailsList.forEach(dataSalud => {
            // //         const savedPolicyEmit: any = {};
            // //         savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
            // //         savedPolicyEmit.P_NBRANCH = this.healthProductId.nbranch;
            // //         savedPolicyEmit.P_NPRODUCT = this.healthProductId.id; // Salud
            // //         savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
            // //         savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.WorkersCount;
            // //         savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.PayrollAmount;
            // //         savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.Rate;
            // //         savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
            // //         savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
            // //         savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.MIN_SALUD;
            // //         savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.MIN_SALUD_PR == '' ? '0' : this.inputsQuotation.MIN_SALUD_PR;
            // //         savedPolicyEmit.P_NPREMIUM_END = 0;
            // //         savedPolicyEmit.P_NSUM_PREMIUMN = this.inputsQuotation.SaludNetAmount;
            // //         savedPolicyEmit.P_NSUM_IGV = this.inputsQuotation.SaludCalculatedIGV;
            // //         savedPolicyEmit.P_NSUM_PREMIUM = this.inputsQuotation.SaludGrossAmount;
            // //         savedPolicyEmit.P_NRATE = dataSalud.AuthorizedRate == null ? '0' : dataSalud.AuthorizedRate;
            // //         savedPolicyEmit.P_NDISCOUNT = dataSalud.Discount == '' ? '0' : dataSalud.Discount;
            // //         savedPolicyEmit.P_NACTIVITYVARIATION = 0;
            // //         savedPolicyEmit.P_FLAG = 0;
            // //         savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_SALUD(this.inputsQuotation.frecuenciaPago);
            // //         savedPolicyEmit.P_NDE = this.inputsQuotation.PensionDetailsList.length > 0 ? NDEPension : this.inputsQuotation.SaludDetailsList.length > 0 ? NDESalud : 0.0;
            // //         dataQuotation.QuotationDet.push(savedPolicyEmit);
            // //     });
            // // }

            // // Comercializadores secundarios
            // var index = 0;
            // if (this.inputsQuotation.SecondaryBrokerList.length > 0) {
            //     this.inputsQuotation.SecondaryBrokerList.forEach(dataBroker => {
            //         let itemQuotationCom: any = {};
            //         itemQuotationCom.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
            //         itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
            //         itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
            //         itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
            //         itemQuotationCom.P_NCOMISION_SAL = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
            //         itemQuotationCom.P_NCOMISION_SAL_PR = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
            //         itemQuotationCom.P_NCOMISION_PEN = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
            //         itemQuotationCom.P_NCOMISION_PEN_PR = this.listaTasasSalud.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
            //         itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
            //         itemQuotationCom.P_NLOCAL = 0;
            //         dataQuotation.QuotationCom.push(itemQuotationCom);
            //         index = index + 1;
            //     });
            // }

            // dataQuotation.planSeleccionado = '';
            // dataQuotation.planPropuesto = '';

            // if (this.savedPolicyEmit.P_NCOT_MIXTA == 1 || this.nbranch == this.pensionID.nbranch && this.polizaEmitCab.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 05/09/2023
            //     await this.riesgosSCTR_Salud();
            // }

            const payPF = this.payPF;

            if (policyData.savedPolicyList.length > 0) {
                for (let i = 0; i < policyData.savedPolicyList.length; i++) {
                    policyData.savedPolicyList[i].P_PAYPF = payPF;
                }
            } else {
                policyData.savedPolicyList.P_PAYPF = payPF;
            }

            // console.log(policyData.dataCIP);

            policyData.dataCIP.ExternalId_EPS = ''; // this.nroMovimientoEPS;
            localStorage.setItem('policydata', JSON.stringify(policyData));

            this.router.navigate(['/extranet/policy/pago-efectivo']);

        } else {
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        }
    }

    async createJob() {
        console.log('fafafafaaa1111')
        const polizaNro = (this.nroSalud != undefined && this.nroSalud == '' ? '' : this.nroSalud);
        const msgIncRenov = this.mode == 'include' ? 'Inclusión' : this.mode == 'exclude' ? 'Exclusión' : this.mode == 'endosar' ? 'Endoso' : this.sAbrTran == 'DE' ? 'la Declaración' : 'Renovación';
        let mensajeEquivalente = '';
        const myFormData: FormData = new FormData();
        this.isLoading = true;
        if (this.files.length > 0) {
            this.files.forEach(file => {
                myFormData.append('adjuntos', file, file.name);
            });
        }
        await this.dataEmisionSCTR();

        myFormData.append('transaccionProtecta', JSON.stringify(this.savedPolicyList));
        myFormData.append('transaccionMapfre', null);
        myFormData.append('transaccionBroker', null);
        this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

        this.policyService.transactionPolicy(myFormData).subscribe(
            res => {
                this.isLoading = false;
                if (res.P_COD_ERR == 0) {
                    // if (this.mode == 'cancel' || this.mode == 'endosar') {
                    //     swal.fire({
                    //         title: 'Información',
                    //         text: this.responseText,
                    //         icon: 'success',
                    //         confirmButtonText: 'OK',
                    //         allowOutsideClick: false,
                    //     }).then((result) => {
                    //         if (result.value) {
                    //             this.router.navigate(['/extranet/sctr/consulta-polizas']);
                    //         }
                    //     });
                    // } else {
                    swal.fire({
                        title: 'Información',
                        text: 'Se ha realizado la renovación con constancia N° ' + res.P_NCONSTANCIA,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        }
                    });
                    // }
                } else if (res.P_COD_ERR == 2) {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'info',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        }
                    });
                } else {
                    // this.DeleteDataSCTR();
                    // swal.fire({
                    //     title: 'Información',
                    //     text: res.P_MESSAGE,
                    //     icon: 'error',
                    //     confirmButtonText: 'OK',
                    //     allowOutsideClick: false,
                    // })
                }
            },
            err => {
                this.isLoading = false;
            }
        );
    }

    async formaPagoElegido() {

        // console.log('this.inputsQuotation', this.inputsQuotation)

        // return;

        if (this.inputsQuotation.poliza.pagoElegido == 'transferencia' || this.inputsQuotation.poliza.pagoElegido == 'cash') {
            this.onPaymentKushki();
        }
        if (this.inputsQuotation.poliza.pagoElegido === 'efectivo') {
            this.onPayment();
        }

        if (this.inputsQuotation.poliza.pagoElegido === 'directo') {
            let myFormData: FormData = new FormData()

            if (this.files.length > 0) {
                this.files.forEach(file => {
                    myFormData.append('adjuntos', file, file.name);
                });
            }

            myFormData.append('objeto', JSON.stringify(this.savedPolicyList));

            // this.createJob();
            this.isLoading = true;

            this.policyService.savePolicyEmit(myFormData)
                .subscribe((res: any) => {
                    this.isLoading = false;
                    if (res.P_COD_ERR == 0) {
                        let policyPension = 0;
                        let policySalud = 0;
                        let constancia = 0

                        policyPension = Number(res.P_POL_PENSION);
                        policySalud = Number(res.P_POL_SALUD);
                        constancia = Number(res.P_NCONSTANCIA);

                        // let pensionPolicy = policyPension;
                        // let saludPolicy = policySalud;

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



        // if (this.inputsQuotation.poliza.pagoElegido === 'directo') {
        //     if (this.emitirCertificadoTecnica) {
        //         const myFormData: FormData = new FormData();
        //         this.inputsQuotation.paramsTrx[0].P_SPAGO_ELEGIDO = 'directo';
        //         myFormData.append('objetoCE', JSON.stringify(this.inputsQuotation.paramsTrx));
        //         this.emitirCertificadoEstado(myFormData)
        //     }
        //     else if (this.emitirCertificadoOperaciones || this.emitirPolizaOperaciones || this.flagGobiernoIniciado) {
        //         await this.policyService.getPolicyEmitCab(
        //             this.quotationNumber, '1',
        //             JSON.parse(localStorage.getItem('currentUser'))['id']
        //         ).toPromise().then(async (res: any) => {
        //             if (!!res.GenericResponse &&
        //                 res.GenericResponse.COD_ERR == 0) {
        //                 await this.policyService.getPolicyEmitDet(
        //                     this.quotationNumber,
        //                     JSON.parse(localStorage.getItem('currentUser'))['id'])
        //                     .toPromise().then(

        //                         async resDet => {
        //                             const params = [
        //                                 {
        //                                     P_NID_COTIZACION: this.quotationNumber,
        //                                     P_NID_PROC: res.GenericResponse.NID_PROC,
        //                                     P_NPRODUCT: 1,
        //                                     P_NBRANCH: 73,
        //                                     P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
        //                                     P_DSTARTDATE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)),
        //                                     P_DEXPIRDAT: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION_VL)),
        //                                     P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
        //                                     P_SFLAG_FAC_ANT: 1,
        //                                     P_FACT_MES_VENCIDO: 0,
        //                                     P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
        //                                     P_IGV: resDet[0].NSUM_IGV,
        //                                     P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
        //                                     P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
        //                                     P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
        //                                     P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,

        //                                     P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],

        //                                     P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
        //                                     P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
        //                                     FlagCambioFecha: 0,
        //                                     FlagPolMat: 1,
        //                                     flagEmitCertificado: 0,
        //                                     P_SPAGO_ELEGIDO: 'directo'

        //                                 }
        //                             ];
        //                             this.SaveEmitCerti(params);
        //                         })
        //             }
        //         })
        //     }
        // }
    }

    // emitirTrx(savedPolicyList) {
    //     const myFormData: FormData = new FormData();

    //     savedPolicyList[0].P_SPAGO_ELEGIDO = 'directo';
    //     myFormData.append('objeto', JSON.stringify(savedPolicyList));

    //     this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
    //         this.isLoading = false;
    //         if (res.P_COD_ERR == 0) {
    //             let policyVLey = 0;
    //             let constancia = 0;

    //             policyVLey = Number(res.P_POL_VLEY);
    //             constancia = Number(res.P_NCONSTANCIA);

    //             if (policyVLey > 0) {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: 'Se ha generado correctamente la póliza de Vida Ley N° ' + policyVLey,
    //                     icon: 'success',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 })
    //                     .then((result) => {
    //                         if (result.value) {
    //                             this.router.navigate(['/extranet/policy-transactions-all']);
    //                         }
    //                     });
    //             }
    //         } else if (res.P_COD_ERR == 4) {
    //             swal.fire({
    //                 title: 'Información',
    //                 text: res.P_MESSAGE,
    //                 icon: 'success',
    //                 confirmButtonText: 'OK',
    //                 allowOutsideClick: false,
    //             }).then((result) => {
    //                 if (result.value) {
    //                     this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                 }
    //             });
    //         } else {
    //             swal.fire({
    //                 title: 'Información',
    //                 text: res.P_MESSAGE,
    //                 icon: 'error',
    //                 confirmButtonText: 'OK',
    //                 allowOutsideClick: false,
    //             })
    //         }
    //     });
    // }

    // renovacionTrx(renovacion) {
    //     const myFormData: FormData = new FormData();

    //     renovacion.P_SPAGO_ELEGIDO = 'directo';
    //     myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

    //     this.policyService.transactionPolicy(myFormData).subscribe(
    //         resJob => {
    //             this.isLoading = false;
    //             if (resJob.P_COD_ERR == 0) {
    //                 if (this.inputsQuotation.tipoTransaccion == 2) {
    //                     swal.fire('Información', 'Se ha generado correctamente la inclusión de la póliza N° ' + this.policyNumber, 'success');
    //                 }

    //                 if (this.inputsQuotation.tipoTransaccion == 4) {
    //                     if (this.sAbrTran == 'DE') {
    //                         swal.fire('Información', 'Se ha generado correctamente la declaración de la póliza N° ' + this.policyNumber, 'success');
    //                     } else {
    //                         swal.fire('Información', 'Se ha generado correctamente la renovación de la póliza N° ' + this.policyNumber, 'success');
    //                     }
    //                 }
    //                 if (this.inputsQuotation.tipoTransaccion == 8) {
    //                     swal.fire('Información', 'Se ha generado correctamente el endoso de la póliza N° ' + this.policyNumber, 'success');
    //                 }
    //                 if (this.inputsQuotation.tipoTransaccion == 3) {
    //                     swal.fire('Información', 'Se ha generado correctamente la exclusión de la póliza N° ' + this.policyNumber, 'success');
    //                 }
    //                 this.router.navigate(['/extranet/policy-transactions-all']);
    //             } else if (resJob.P_COD_ERR == 2) {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: resJob.P_MESSAGE,
    //                     icon: 'info',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         this.router.navigate(['/extranet/sctr/consulta-polizas']);
    //                     }
    //                 });
    //             } else if (resJob.P_COD_ERR == 4) {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: resJob.P_MESSAGE,
    //                     icon: 'success',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                     }
    //                 });
    //             } else {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: resJob.P_MESSAGE,
    //                     icon: 'error',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 });
    //             }
    //         },
    //         err => {
    //         }
    //     );
    // }
    //ini - marcos silverio
    // seeCovers(nrocotizacion) {
    //     const modalRef = this.modalService.open(QuotationCoverComponent,
    //         { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    //     modalRef.componentInstance.formModalReference = modalRef; //Enviamos la referencia al modal
    //     modalRef.componentInstance.quotationNumber = this.quotationNumber; //Enviamos el número de cotización
    // }
    //fin - marcos silverio
    async ValidateRetroactivity(operacion: number = 1) {
        //let tran = '';
        this.retroVal = 0;
        let FlagCambioFecha = 0;
        if (this.typeTran != '' && this.typeTran != undefined) {
            this.stran = this.typeTran.toString().substring(0, 2).toUpperCase();
        }
        if (this.typeTran == "Emisión" || this.typeTran == "Emisión") {
            FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.inicioVigencia.setHours(0, 0, 0, 0) ? 1 : 0;
        } else {
            FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        }
        const response: any = {};

        const dataQuotation: any = {};
        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.NumeroCotizacion = this.quotationNumber;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
        dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
        dataQuotation.TrxCode = this.stran;
        dataQuotation.RetOP = operacion;
        dataQuotation.FlagCambioFecha = FlagCambioFecha;
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
    getStartAseInclude(fecha: Date): Date {
        let fechad = new Date(fecha);

        if (this.inputsQuotation.frecuenciaPago == "5") {
            fechad.setMonth(fechad.getMonth() - 1);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }
        if (this.inputsQuotation.frecuenciaPago == "4") {
            fechad.setMonth(fechad.getMonth() - 2);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "3") {
            fechad.setMonth(fechad.getMonth() - 3);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "2") {
            fechad.setMonth(fechad.getMonth() - 6);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "1") {
            fechad.setFullYear(fechad.getFullYear() - 1)
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }
    }
    /* Operacion Endoso */

    async endosarPoliza() {
        let errorList: any = [];

        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Endosar' && this.mode == 'Endosar') || this.mode == 'Recotizar') {
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processEndoso();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processEndoso();
                    }
                } else {
                    this.processEndoso();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }
    }
    processEndoso() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar el endoso de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Endosar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                // this.objetoTrx();
            }
        });
    }
    /* * Operacion Endoso * */
    async GetFechaFin(fecha, freq) {
        const response: any = {};
        await this.quotationService.GetFechaFin(fecha, freq).toPromise().then(
            res => {
                response.FechaExp = res.FechaExp;
            }
        );
        return response;
    }

    async excluirPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }
        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Excluir' && this.mode == 'Excluir') || this.mode == 'Recotizar') {

                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processExclude();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processExclude();
                    }
                } else {
                    this.processExclude();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }
    }

    processExclude() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar la exclusión de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                // this.objetoTrx();
            }
        });
    }

    /* Gestión de trámite EHH */
    // searchTrackingTransact() {
    //     let data: any = {};
    //     data.P_NID_TRAMITE = this.transactNumber;
    //     data.P_NID_COTIZACION = this.quotationNumber;

    //     this.transactService.GetHistTransact(data).subscribe(
    //         res => {
    //             this.isLoading = false;
    //             this.statusChangeList = res;
    //             this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    //             this.totalItems = this.statusChangeList.length;
    //             this.GetInfoTransact();
    //             if (this.statusChangeList.length == 0) {
    //                 this.statusChangeList = [];
    //             }
    //         },
    //         err => {
    //             swal.fire('Información', this.genericServerErrorMessage, 'error');
    //         }
    //     );
    // }

    // getUsersList() {
    //     let data: any = {};
    //     data.P_NBRANCH = this.vidaLeyID.nbranch;
    //     data.P_NPRODUCT = this.vidaLeyID.id;
    //     data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //     this.transactService.GetUsersTransact(data).subscribe(
    //         res => {
    //             this.usersList = res;
    //             //this.inputsQuotation.UserAssigned = this.userAssigned == 0 || this.userAssigned == undefined ? '' : this.userAssigned;
    //             let existsUser = false;
    //             this.usersList.forEach(element => {
    //                 if (element.NIDUSER == this.userAssigned) {
    //                     existsUser = true;
    //                 }
    //             });
    //             this.inputsQuotation.UserAssigned = existsUser ? this.userAssigned : (this.usersList.length > 0 ? this.usersList[0].NIDUSER : undefined);
    //         },
    //         error => {

    //         }
    //     );
    // }

    // async AsignarTramite() {
    //     if (this.buttonName == "Rechazar") {
    //         this.DerivarTramite();
    //     } else {
    //         let msg = '';
    //         if (this.inputsQuotation.UserAssigned == '') {
    //             msg = 'Seleccione un usuario por favor.';
    //         }

    //         if (msg != '') {
    //             await swal.fire('Error', msg, 'error');
    //             return
    //         }

    //         swal.fire({
    //             title: 'Información',
    //             text: "¿Desea asignar el trámite?",
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Asignar',
    //             allowOutsideClick: false,
    //             cancelButtonText: 'Cancelar'
    //         }).then((result) => {
    //             if (result.value) {
    //                 this.isLoading = true;
    //                 let dataQuotation: any = {};
    //                 const data: FormData = new FormData(); /* Para los archivos EH */
    //                 this.files.forEach(file => {
    //                     data.append(file.name, file);
    //                 });

    //                 dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //                 dataQuotation.P_NID_COTIZACION = this.quotationNumber;
    //                 dataQuotation.P_NUSERCODE_ASSIGNOR = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //                 dataQuotation.P_NUSERCODE = this.inputsQuotation.UserAssigned;
    //                 dataQuotation.P_NSTATUS_TRA = this.isReasignar ? 4 : 3;
    //                 dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

    //                 data.append('objeto', JSON.stringify(dataQuotation));

    //                 this.transactService.AsignarTransact(data).subscribe(
    //                     res => {
    //                         if (res.P_COD_ERR == 0) {
    //                             this.isLoading = false;
    //                             swal.fire('Información', 'Se asignó el trámite correctamente al usuario', 'success');
    //                             this.router.navigate(['/extranet/tray-transact/2']);
    //                         } else {
    //                             this.isLoading = false;
    //                             swal.fire('Información', res.P_MESSAGE, 'error');
    //                         }
    //                     },
    //                     err => {
    //                         this.isLoading = false;
    //                         swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                     }
    //                 );
    //             }
    //         });
    //     }
    // }

    // changeStatusTransact() {
    //     this.flagRechazoPol = false;
    //     if (this.mainFormGroup.controls.status.value == 11) {
    //         this.buttonName = "Rechazar";
    //         this.flagRechazoPol = true;
    //     } else if (this.mainFormGroup.controls.status.value == 2) {
    //         if (this.mode == "Asignar") {
    //             this.buttonName = "Asignar";
    //         } else {
    //             if (this.mode == "Evaluar Tramite") {
    //                 this.buttonName = 'Iniciar Trámite';
    //             } else {
    //                 if (this.typeTran == "Emisión de certificados" || this.emitirPolizaOperaciones || this.flagGobiernoIniciado || this.procesarPolizaOperaciones) {
    //                     this.buttonName = 'Emitir';
    //                 } else {
    //                     this.buttonName = "Continuar";
    //                 }
    //             }
    //         }
    //     }
    // }

    // changeStatusTransactEstado(statusTransact) {
    //     this.flagRechazoPol = false;
    //     this.statusTransact = statusTransact.target.value;
    //     if (statusTransact.target.value == "6") {
    //         this.buttonName = "Rechazar";
    //         this.flagRechazoPol = true;
    //     } else if (statusTransact.target.value == "2") {
    //         if (this.mode == "Asignar") {
    //             this.buttonName = "Asignar";
    //         } else {
    //             if (this.mode == "Evaluar Tramite") {
    //                 this.buttonName = 'Iniciar Trámite';
    //             } else if (this.mode == "Enviar") {
    //                 this.buttonName = 'Enviar';
    //             } else {
    //                 if (this.typeTran == "Emisión de certificados" || this.emitirPolizaOperaciones || this.flagGobiernoIniciado || this.procesarPolizaOperaciones || this.emitirPolizaMatrizTramiteEstado) {
    //                     this.buttonName = 'Emitir';
    //                 } else {
    //                     this.buttonName = "Continuar";
    //                 }
    //             }
    //         }
    //     } else if (statusTransact.target.value == "25") {
    //         this.buttonName = "Reevaluar";
    //     }
    // }
    // changeMotivoRechazo(motivo) {
    //     this.rechazoMotivoID = motivo.COD_MOTIVO;
    // }

    // async motivorechazoTramite() {
    //     await this.transactService.getMotivRechazoTransact().toPromise().then(
    //         (res: any) => {
    //             this.rechazoMotivoList = res;
    //         }
    //     );
    // }

    // async DerivarTramite() {
    //     if ((this.flagGobiernoIniciado && this.flagRechazoPol) || (this.emitirPolizaMatrizTramiteEstado && this.flagRechazoPol)) {
    //         let msg = "";

    //         if (this.rechazoMotivoID == null || this.rechazoMotivoID == "") {
    //             msg += 'Debe seleccionar el motivo de rechazo. <br />'
    //         }

    //         if (this.mainFormGroup.controls.comment.value == "") {
    //             msg += "Ingrese un comentario por favor."
    //         }

    //         if (msg != "") {
    //             await swal.fire('Error', msg, 'error');
    //             return;
    //         }
    //     }

    //     swal.fire({
    //         title: 'Información',
    //         text: "¿Desea rechazar el trámite?",
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Rechazar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'
    //     }).then((result) => {
    //         if (result.value) {
    //             this.isLoading = true;
    //             let dataQuotation: any = {};
    //             const data: FormData = new FormData(); /* Para los archivos EH */
    //             this.files.forEach(file => {
    //                 data.append(file.name, file);
    //             });

    //             dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //             dataQuotation.P_NID_COTIZACION = this.quotationNumber;
    //             dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //             dataQuotation.P_NSTATUS_TRA = 6;
    //             dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
    //             dataQuotation.P_NIDMOTIVO_RECHAZO = this.rechazoMotivoID; // motivo de rechazo tramite
    //             data.append('objeto', JSON.stringify(dataQuotation));

    //             this.transactService.InsertDerivarTransact(data).subscribe(
    //                 res => {
    //                     if (res.P_COD_ERR == 0) {
    //                         this.isLoading = false;
    //                         swal.fire('Información', 'Se rechazó el trámite correctamente al usuario', 'success');
    //                         this.router.navigate(['/extranet/tray-transact/2']);
    //                     } else {
    //                         this.isLoading = false;
    //                         swal.fire('Información', res.P_MESSAGE, 'error');
    //                     }
    //                 },
    //                 err => {
    //                     this.isLoading = false;
    //                     swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                 }
    //             );
    //         }
    //     });
    // }

    // IniciarTramite() {
    //     swal.fire({
    //         title: 'Información',
    //         text: this.mode == "Continuar" ? "¿Desea continuar trabajando el trámite?" : "¿Desea empezar a trabajar el trámite?",
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Continuar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'
    //     }).then((result) => {
    //         if (result.value) {
    //             this.isLoading = true;
    //             let dataQuotation: any = {};
    //             const data: FormData = new FormData(); /* Para los archivos EH */
    //             this.files.forEach(file => {
    //                 data.append(file.name, file);
    //             });

    //             dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //             dataQuotation.P_NID_COTIZACION = this.quotationNumber;
    //             dataQuotation.P_NPERFIL = this.codProfile;
    //             dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //             dataQuotation.P_NSTATUS_TRA = this.mode == "Continuar" ? 17 : 11;
    //             dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

    //             data.append('objeto', JSON.stringify(dataQuotation));

    //             this.transactService.InsertHistTransact(data).subscribe(
    //                 res => {
    //                     if (res.P_COD_ERR == 0) {
    //                         this.isLoading = false;
    //                         this.moveTransaction()
    //                     } else {
    //                         this.isLoading = false;
    //                         swal.fire('Información', res.P_MESSAGE, 'error');
    //                     }
    //                 },
    //                 err => {
    //                     this.isLoading = false;
    //                     swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                 }
    //             );
    //         }
    //     });
    // }

    // SetTransac() {
    //     try {
    //         switch (this.typeTran) {
    //             case "Inclusión": {
    //                 this.nTransac = 2;
    //                 this.sAbrTran = "IN";
    //                 break;
    //             }
    //             case "Declaración": {
    //                 this.nTransac = 4;
    //                 this.sAbrTran = "DE";
    //                 if (this.mode == 'Renovar') {
    //                     this.TitleOperacion = "Declaración";
    //                 }
    //                 break;
    //             }
    //             case "Renovación": {
    //                 this.nTransac = 4;
    //                 this.sAbrTran = "RE";
    //                 break;
    //             }
    //             case "Exclusión": {
    //                 this.nTransac = 3;
    //                 this.sAbrTran = "EX";
    //                 break;
    //             }
    //             case "Endoso": {
    //                 this.nTransac = 8;
    //                 this.sAbrTran = "EN";
    //                 break;
    //             }
    //             case "Broker": {
    //                 this.nTransac = 13;
    //                 this.sAbrTran = "BR";
    //                 break;
    //             }
    //             case "Emisión de certificados": {
    //                 this.nTransac = 14;
    //                 this.sAbrTran = "EC";
    //                 break;
    //             }
    //             default:
    //                 this.nTransac = 1;
    //                 this.sAbrTran = "EM";
    //                 break;
    //         }
    //     } catch (error) {
    //         this.nTransac = 1;
    //         this.sAbrTran = "EM";
    //     }
    // }
    // moveTransaction() {
    //     switch (this.nTransac) {
    //         case 1: this.GetIniciarEmisionPolEstado();
    //             break;
    //         case 2: // Incluir
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/include'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //         case 3: // Exluir
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/exclude'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //         case 4: // Renovar
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/renew'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //         case 8: // Endoso
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/endosar'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //         case 13: // Broker
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/broker'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //         case 14: // Emisión de certificado
    //             this.router.navigate(['/extranet/sctr/poliza/transaccion/certificate'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
    //             break;
    //     }
    // }

    // GetIniciarEmisionPolEstado() {
    //     let data: any = {};
    //     data.QuotationNumber = this.quotationNumber;
    //     data.ProductId = this.productoId;
    //     data.Status = 'INICIADO';
    //     data.Mode = 'Iniciado';
    //     data.From = 'transact2';
    //     data.PolicyNumber = this.policyNumber;
    //     data.TypeTransac = "Emisión";
    //     data.TransactNumber = this.transactNumber;
    //     data.UserCodeAssigned = this.userAssigned;
    //     data.SMAIL_EJECCOM = this.quotationDataTra.SMAIL_EJECCOM;
    //     data.APROB_CLI = this.flagAprobCli;
    //     data.SPOL_MATRIZ = this.flagGobiernoMatriz;
    //     data.SPOL_ESTADO = this.flagGobiernoEstado;
    //     sessionStorage.removeItem('cs-quotation');
    //     sessionStorage.setItem('cs-quotation', JSON.stringify(data));
    //     this.flagGobiernoEstado = true;
    //     this.isPolizaMatriz = this.flagGobiernoMatriz;
    //     this.isTransact = true;
    //     //this.emitirCertificadoOperaciones =true;
    //     this.ngOnInit()
    // }

    // GetIninicarEmisionCert() {
    //     let data: any = {};
    //     data.QuotationNumber = this.quotationNumber;
    //     data.ProductId = this.productoId;
    //     data.Status = 'INICIADO';
    //     data.Mode = 'Iniciado';
    //     data.From = 'transact2';
    //     data.PolicyNumber = this.policyNumber;
    //     data.TypeTransac = "Emisión de certificados";
    //     data.TransactNumber = this.transactNumber;
    //     data.UserCodeAssigned = this.userAssigned;
    //     sessionStorage.removeItem('cs-quotation');
    //     sessionStorage.setItem('cs-quotation', JSON.stringify(data));
    //     this.isPolizaMatriz = true;
    //     this.isTransact = false;
    //     this.emitirCertificadoOperaciones = true;
    //     this.ngOnInit()

    // }
    // GetInfoTransact(setInfo: boolean = true) {
    //     let data: any = {};
    //     data.P_NID_TRAMITE = this.transactNumber;
    //     data.P_NID_COTIZACION = this.quotationNumber;
    //     data.P_NPRODUCT = this.vidaLeyID.id;
    //     data.P_NBRANCH = this.vidaLeyID.nbranch;

    //     this.transactService.GetInfoTransact(data).subscribe(
    //         res => {
    //             this.infoTransact = res;
    //             if (setInfo) {
    //                 this.SetInfoTransact();
    //             }
    //         },
    //         error => {

    //         }
    //     );
    // }
    // async SetInfoTransact() {
    //     switch (this.nTransac) {
    //         case 2: {
    //             this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
    //             if (this.flagGobiernoEstado) {
    //                 this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //             }
    //             break;
    //         }
    //         case 3: {
    //             this.inputsQuotation.FechaAnulacion = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.FECHA_EXCLUSION) : new Date(this.infoTransact.DFEC_TRANSAC);
    //             this.inputsQuotation.primaCobrada = this.infoTransact.SDEVOLPRI == 1 ? true : false;
    //             if (this.flagGobiernoEstado) {
    //                 this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //             }
    //             break;
    //         }
    //         case 4: {
    //             if (this.sAbrTran != 'DE') {
    //                 this.inputsQuotation.tipoRenovacion = this.infoTransact.NTIP_RENOV;
    //                 this.inputsQuotation.frecuenciaPago = this.infoTransact.NPAYFREQ;
    //                 this.inputsQuotation.desTipoRenovacion = this.setDesRenovFreq(1, this.infoTransact.NTIP_RENOV);
    //                 this.inputsQuotation.desFrecuenciaPago = this.setDesRenovFreq(2, this.infoTransact.NPAYFREQ);

    //                 this.inputsQuotation.inicioVigencia = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_COTIZACION_VL) : new Date(this.infoTransact.DFEC_TRANSAC);
    //                 let res: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.inicioVigencia), this.inputsQuotation.tipoRenovacion);
    //                 if (res.FechaExp != "")
    //                     this.inputsQuotation.finVigencia = new Date(res.FechaExp);

    //                 this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
    //                 let res1: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg), this.inputsQuotation.frecuenciaPago);
    //                 if (res.FechaExp != "")
    //                     this.inputsQuotation.FDateFinAseg = new Date(res1.FechaExp);

    //                 if (this.flagGobiernoEstado) {
    //                     this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //                 }

    //             } else {
    //                 this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
    //                 let res: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg), this.inputsQuotation.frecuenciaPago);
    //                 if (res.FechaExp != "")
    //                     this.inputsQuotation.FDateFinAseg = new Date(res.FechaExp);

    //                 if (this.flagGobiernoEstado) {
    //                     this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //                 }
    //             }
    //             break;
    //         }
    //         case 8: {
    //             this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
    //             this.inputsQuotation.TYPE_ENDOSO = this.infoTransact.NTYPENDOSO;
    //             if (this.flagGobiernoEstado) {
    //                 this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //             }
    //             break;
    //         }
    //         case 13: {
    //             this.inputsQuotation.FDateEffectBroker = new Date(this.infoTransact.DFEC_TRANSAC);
    //             this.SearchContrator();
    //             break;
    //         }
    //         case 1: {
    //             if (this.flagGobiernoEstado) {
    //                 this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //             }
    //             break;
    //         }

    //         case 14: {
    //             if (this.flagGobiernoEstado) {
    //                 this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
    //             }
    //             break;
    //         }
    //     }
    // }

    setDesRenovFreq(tipo, id) {
        let descriptFreqRenov = '';
        switch (id) {
            case 1: descriptFreqRenov = 'ANUAL'; break;
            case 2: descriptFreqRenov = 'Semestral'; break;
            case 3: descriptFreqRenov = 'Trimestral'; break;
            case 4: descriptFreqRenov = 'Bimestral'; break;
            case 5: descriptFreqRenov = 'Mensual'; break;
            case 6: descriptFreqRenov = 'Especial'; break;
            case 7: descriptFreqRenov = 'Especial'; break;
            default: {
                if (tipo == 1) {
                    descriptFreqRenov = this.inputsQuotation.desTipoRenovacion;
                } else {
                    descriptFreqRenov = this.inputsQuotation.desFrecuenciaPago;
                }
                break;
            }
        }
        return descriptFreqRenov;
    }
    //tipo endoso
    // getTypeEndoso() {
    //     this.policyService.GetTypeEndoso().toPromise().then(
    //         (res: any) => {
    //             this.tipoEndoso = res;
    //         });
    // }
    // SearchContrator() {
    //     let searchBroker: any = {};
    //     searchBroker.P_IS_AGENCY = '0';
    //     searchBroker.P_NTIPO_BUSQUEDA = 1;
    //     searchBroker.P_NTIPO_DOC = (this.infoTransact.SCLIENT_RUC.trim().length == 11) ? 1 : 2;;
    //     searchBroker.P_NNUM_DOC = this.infoTransact.SCLIENT_RUC.trim();
    //     searchBroker.P_SNOMBRE = "";
    //     searchBroker.P_SAP_PATERNO = "";
    //     searchBroker.P_SAP_MATERNO = "";
    //     searchBroker.P_SNOMBRE_LEGAL = "";

    //     this.quotationService.searchBroker(searchBroker).subscribe(
    //         res => {
    //             if (res.P_NCODE == 0) {
    //                 if (res.listBroker != null && res.listBroker.length > 0) {
    //                     this.inputsQuotation.SecondaryBrokerList = [];
    //                     res.listBroker.forEach(item => {
    //                         item.DES_DOC_COMER = item.STYPCLIENTDOC;
    //                         item.DOC_COMER = item.NNUMDOC;
    //                         item.COMERCIALIZADOR = item.RAZON_SOCIAL;
    //                         item.COMISION_SALUD_PRO = 0;
    //                         item.COMISION_SALUD = 0;
    //                         item.COMISION_SALUD_AUT = 0;
    //                         item.valItemSalPr = false;
    //                         item.valItemPen = false;
    //                         item.valItemPenPr = false;
    //                         item.OriginalHealthPropCommission = 0;
    //                         item.OriginalPensionPropCommission = 0;
    //                         item.OriginalHealthAuthCommission = 0;
    //                         item.OriginalPensionAuthCommission = 0;
    //                         this.inputsQuotation.SecondaryBrokerList.push(item);
    //                     });
    //                 } else {
    //                     swal.fire("Información", "No hay información con los datos ingresados", "error");
    //                 }
    //             } else {
    //                 swal.fire("Información", res.P_SMESSAGE, "error");
    //             }

    //         },
    //         err => {
    //             swal.fire("Información", "Ocurrió un problema al solicitar su petición", "error");
    //         }
    //     );
    // }
    // EnviarTramite() {
    //     swal.fire({
    //         title: 'Información',
    //         text: "¿Desea enviar el trámite al ejecutivo comercial?",
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Enviar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'
    //     }).then((result) => {
    //         if (result.value) {
    //             this.isLoading = true;
    //             let dataQuotation: any = {};
    //             const data: FormData = new FormData(); /* Para los archivos EH */
    //             this.files.forEach(file => {
    //                 data.append(file.name, file);
    //             });

    //             dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //             dataQuotation.P_NID_COTIZACION = this.quotationNumber;
    //             dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //             dataQuotation.P_NSTATUS_TRA = 5;
    //             dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

    //             data.append('objeto', JSON.stringify(dataQuotation));

    //             this.transactService.InsertDerivarTransact(data).subscribe(
    //                 res => {
    //                     if (res.P_COD_ERR == 0) {
    //                         this.isLoading = false;
    //                         swal.fire('Información', 'Se envió el trámite correctamente al usuario', 'success');
    //                         this.router.navigate(['/extranet/tray-transact/2']);
    //                     } else {
    //                         this.isLoading = false;
    //                         swal.fire('Información', res.P_MESSAGE, 'error');
    //                     }
    //                 },
    //                 err => {
    //                     this.isLoading = false;
    //                     swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                 }
    //             );
    //         }
    //     });
    // }

    // aprobacionCliente(e) { //LS - Gestion Tramites
    //     this.flagAprobCli = false;
    //     this.flagEnvioEmail = 0;

    //     if (e.target.checked) {
    //         this.flagAprobCli = true;
    //         this.flagEnvioEmail = 1;
    //     }
    // }

    // async EmisionPolizaEstado() {
    //     const erroresList: any = [];
    //     if (this.flagGobiernoIniciado) {
    //         if (this.nidProc == '' || this.nidProc == '1') {
    //             erroresList.push('Debe validar una trama para poder emitir la Póliza del estado');
    //         }
    //     }

    //     if (erroresList == null || erroresList.length == 0) {
    //         this.isLoading = true;

    //         await this.policyService.getPolicyEmitCab(
    //             this.quotationNumber, '1',
    //             JSON.parse(localStorage.getItem('currentUser'))['id']
    //         ).toPromise().then(async (res: any) => {
    //             if (!!res.GenericResponse &&
    //                 res.GenericResponse.COD_ERR == 0) {
    //                 let startDate = null;
    //                 let endDate = null;
    //                 let startDateAseg = null;
    //                 let endDateAseg = null;
    //                 if (this.template.ins_iniVigencia) {
    //                     startDate = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //                 }
    //                 if (this.template.ins_finVigencia) {
    //                     endDate = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
    //                 }
    //                 if (this.template.ins_iniVigenciaAseg) {
    //                     startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
    //                 }
    //                 if (this.template.ins_finVigenciaAseg) {
    //                     endDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
    //                 }
    //                 let tran = this.sAbrTran;
    //                 const dataQuotation: any = {};
    //                 dataQuotation.P_SCLIENT = res.GenericResponse.SCLIENT;
    //                 dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
    //                 dataQuotation.P_NBRANCH = this.nbranch;
    //                 dataQuotation.P_DSTARTDATE = startDate; // Fecha Inicio
    //                 dataQuotation.P_DEXPIRDAT = endDate; // Fecha Inicio

    //                 dataQuotation.P_DSTARTDATE_ASE = startDateAseg;
    //                 dataQuotation.P_DEXPIRDAT_ASE = endDateAseg;

    //                 dataQuotation.P_NIDCLIENTLOCATION = res.GenericResponse.COD_SEDE;
    //                 dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
    //                 dataQuotation.P_SRUTA = '';
    //                 dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //                 dataQuotation.P_NACT_MINA = res.GenericResponse.MINA;
    //                 dataQuotation.P_NTIP_RENOV = res.GenericResponse.TIP_RENOV; // Vida Ley
    //                 dataQuotation.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Vida Ley
    //                 dataQuotation.P_SCOD_ACTIVITY_TEC = res.GenericResponse.ACT_TEC_VL; // Vida Ley
    //                 dataQuotation.P_SCOD_CIUU = res.GenericResponse.ACT_ECO_VL; // Vida Ley
    //                 dataQuotation.P_NTIP_NCOMISSION = res.GenericResponse.TIP_COMISS; // Vida Ley
    //                 dataQuotation.P_NPRODUCT = this.vidaLeyID.id; // Vida Ley
    //                 dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
    //                 dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
    //                 dataQuotation.P_NCOMISION_SAL_PR = 0
    //                 dataQuotation.CodigoProceso = this.nidProc
    //                 dataQuotation.P_NREM_EXC = res.GenericResponse.NREM_EXC; //RQ EXC
    //                 dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;// retroactividad
    //                 dataQuotation.retOP = 2; // retroactividad
    //                 dataQuotation.FlagCambioFecha = 0;// retroactividad
    //                 dataQuotation.TrxCode = tran;
    //                 dataQuotation.tipoEndoso = res.GenericResponse.NTYPE_END; //rq mejoras de endoso
    //                 dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
    //                 dataQuotation.P_SPOL_MATRIZ = res.GenericResponse.SPOL_MATRIZ;
    //                 dataQuotation.P_SPOL_ESTADO = res.GenericResponse.SPOL_ESTADO;
    //                 dataQuotation.FlagCotEstado = 2; //2 para generar poliza de estado
    //                 dataQuotation.P_APROB_CLI = res.GenericResponse.APROB_CLI;
    //                 let desTipoPlan = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
    //                 let planPropuesto = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
    //                 dataQuotation.flagComerExclu = 0; //RQ - Perfil Nuevo - Comercial Exclusivo
    //                 dataQuotation.QuotationDet = [];
    //                 dataQuotation.QuotationCom = [];

    //                 if (this.isPolizaMatriz != true) {
    //                     if (this.template.ins_categoriaList) {
    //                         for (let i = 0; i < this.categoryList.length; i++) {
    //                             const itemQuotationDet: any = {};

    //                             itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
    //                             itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
    //                             itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
    //                             itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
    //                             itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
    //                             itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
    //                             itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
    //                             itemQuotationDet.P_NSUM_PREMIUMN = this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
    //                             itemQuotationDet.P_NSUM_IGV = this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
    //                             itemQuotationDet.P_NSUM_PREMIUM = this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
    //                             itemQuotationDet.P_NRATE = this.rateByPlanList[0].NTASA;
    //                             itemQuotationDet.P_NDISCOUNT = '0';
    //                             itemQuotationDet.P_NACTIVITYVARIATION = '0';
    //                             itemQuotationDet.P_FLAG = '0';
    //                             /* Nuevos parametros ins_cotizacion_det */
    //                             itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago);
    //                             itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago);
    //                             itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago);

    //                             dataQuotation.QuotationDet.push(itemQuotationDet);
    //                         }
    //                     }
    //                 } else {
    //                     /*
    //                     if (this.template.ins_categoriaList) {
    //                       if (this.countinputEMP != 0 || this.planillainputEMP != 0 || this.tasainputEMP != 0 || this.MontoSinIGVEMP != 0){
    //                         this.categoryPolizaMatList[0].sactive = true;
    //                       }
    //                       if (this.countinputOBR != 0 || this.planillainputOBR != 0 || this.tasainputOBR != 0 || this.MontoSinIGVOBR != 0){
    //                         this.categoryPolizaMatList[1].sactive = true;
    //                       }
    //                       if (this.countinputOAR != 0 || this.planillainputOAR != 0 || this.tasainputOAR != 0 || this.MontoSinIGVOAR != 0){
    //                         this.categoryPolizaMatList[2].sactive = true;
    //                       }
    //                       if (this.countinputEE != 0 || this.planillainputEE != 0 || this.tasainputEE != 0 || this.MontoSinIGVEE != 0){
    //                         this.categoryPolizaMatList[3].sactive = true;
    //                       }
    //                       if (this.countinputOE != 0 || this.planillainputOE != 0 || this.tasainputOE != 0 || this.MontoSinIGVOE != 0){
    //                         this.categoryPolizaMatList[4].sactive = true;
    //                       }
    //                       if (this.countinputOARE != 0 || this.planillainputOARE != 0 || this.tasainputOARE != 0 || this.MontoSinIGVOARE != 0){
    //                         this.categoryPolizaMatList[5].sactive = true;
    //                       }
    //                       for (let i = 0; i < this.categoryPolizaMatList.length; i++) {
    //                         if(this.categoryPolizaMatList[i].sactive == true){

    //                           const itemQuotationDet: any = {};
    //                           itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
    //                           itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
    //                           itemQuotationDet.P_NMODULEC = this.categoryPolizaMatList[i].NCATEGORIA;
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 1){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP;
    //                           }
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 2){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR;
    //                           }
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 3){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR;
    //                           }
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 5){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEE;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEE;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEE;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEE;
    //                           }
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 6){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOE;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOE;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOE;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOE;
    //                           }
    //                           if(this.categoryPolizaMatList[i].NCATEGORIA == 7){
    //                             itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOARE;
    //                             itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOARE;
    //                             itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOARE;
    //                             itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOARE;
    //                           }

    //                           itemQuotationDet.P_NTASA_PROP = 0;
    //                           // itemQuotationDet.P_NPREMIUM_MENSUAL = this.nTransac == 8 ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
    //                           itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION;
    //                           itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
    //                           itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;

    //                           itemQuotationDet.P_NSUM_PREMIUMN = this.TotalSinIGV == 0 ? 0 : this.TotalSinIGV;
    //                           itemQuotationDet.P_NSUM_IGV = this.SumaConIGV == 0 ? 0 : this.SumaConIGV;
    //                           itemQuotationDet.P_NSUM_PREMIUM = this.TotalConIGV == 0 ? 0 : this.TotalConIGV;

    //                           itemQuotationDet.P_NRATE = 0;
    //                           itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
    //                           itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
    //                           itemQuotationDet.P_FLAG = '0';
    //                           itemQuotationDet.P_NAMO_AFEC = 0; //montos agregados.
    //                           itemQuotationDet.P_NIVA =0;
    //                           itemQuotationDet.P_NAMOUNT = 0;
    //                           dataQuotation.QuotationDet.push(itemQuotationDet);
    //                         }
    //                       }
    //                     }*/
    //                 }
    //                 if (this.brokerList.length > 0 && (tran == "EM")) {

    //                     this.brokerList.forEach(dataBroker => {
    //                         const itemQuotationCom: any = {};
    //                         itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
    //                         itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Desarrollo
    //                         itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
    //                         itemQuotationCom.P_NCOMISION_SAL = 0;
    //                         itemQuotationCom.P_NCOMISION_SAL_PR = 0;
    //                         itemQuotationCom.P_NCOMISION_PEN = 0;
    //                         itemQuotationCom.P_NCOMISION_PEN_PR = 0;
    //                         itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
    //                         itemQuotationCom.P_NLOCAL = dataBroker.NLOCAL; //this.selectedDep[index];
    //                         dataQuotation.QuotationCom.push(itemQuotationCom);

    //                     });
    //                 }



    //                 const myFormData: FormData = new FormData()
    //                 this.files.forEach(file => {
    //                     myFormData.append(file.name, file);
    //                 });

    //                 myFormData.append('objeto', JSON.stringify(dataQuotation));

    //                 const dataValidaCambioPlan = {
    //                     PlanPropuesto: this.planPropuesto,
    //                     PlanSeleccionado: this.inputsQuotation.desTipoPlan,
    //                     TipoTransaccion: this.typeTran
    //                 };
    //                 myFormData.append('objetoValidaCambioPlan', JSON.stringify(dataValidaCambioPlan));


    //                 this.isLoading = false;
    //                 let title = this.emitirPolizaOperaciones || this.flagGobiernoEstado ? '¿Desea realizar la emisión de la póliza?' : '¿Desea realizar la emisión de certificados?';

    //                 swal.fire({
    //                     title: 'Información',
    //                     text: title,
    //                     icon: 'question',
    //                     showCancelButton: true,
    //                     confirmButtonText: 'Generar',
    //                     allowOutsideClick: false,
    //                     cancelButtonText: 'Cancelar'

    //                 }).then((result) => {
    //                     if (result.value) {
    //                         this.isLoading = true;
    //                         this.quotationService.insertQuotation(myFormData).subscribe(
    //                             async res => {
    //                                 let quotationNumber = 0;
    //                                 let transactNumber = 0;
    //                                 let mensajeRes = '';
    //                                 let mensajeOperaciones = ' el cual fue derivado al área de técnica para su gestión';
    //                                 let mensajePolMatriz = this.isPolizaMatriz ? ' y el trámite de Emisión de póliza matriz' : !this.isPolizaMatriz && this.flagGobiernoEstado ? ' y el trámite de Emisión' : '';
    //                                 if (res.P_COD_ERR == 0) {
    //                                     this.inputsQuotation.P_MINA = false;
    //                                     quotationNumber = res.P_NID_COTIZACION;
    //                                     transactNumber = res.P_NID_TRAMITE;
    //                                     this.isLoading = false;
    //                                     /*if(this.flagPolizaMat == true){

    //                                       await this.policyemit.getPolicyEmitCab(
    //                                         res.P_NID_COTIZACION, '1',
    //                                         JSON.parse(localStorage.getItem('currentUser'))['id']
    //                                       ).toPromise().then(async (resCab: any) => {
    //                                         if (!!resCab.GenericResponse &&
    //                                           resCab.GenericResponse.COD_ERR == 0) {
    //                                           await this.policyemit.getPolicyEmitDet(
    //                                             res.P_NID_COTIZACION,
    //                                             JSON.parse(localStorage.getItem('currentUser'))['id'])
    //                                             .toPromise().then(
    //                                               async resDet => {
    //                                                 const params = [
    //                                                   {
    //                                                     P_NID_COTIZACION: res.P_NID_COTIZACION,
    //                                                     P_NID_PROC: resCab.GenericResponse.NID_PROC,
    //                                                     P_NBRANCH: this.vidaLeyID.nbranch,
    //                                                     P_NPRODUCT: this.vidaLeyID.id,
    //                                                     P_SCOLTIMRE: resCab.GenericResponse.TIP_RENOV,
    //                                                     P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.FDateIni),
    //                                                     P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.FDateFin),
    //                                                     P_NPAYFREQ: resCab.GenericResponse.FREQ_PAGO,
    //                                                     P_SFLAG_FAC_ANT: 1,
    //                                                     P_FACT_MES_VENCIDO: 0,
    //                                                     P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
    //                                                     P_IGV: resDet[0].NSUM_IGV,
    //                                                     P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
    //                                                     P_SCOMMENT: '',
    //                                                     P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //                                                     P_DIRECTO: res.P_SAPROBADO,
    //                                                     P_NID_TRAMITE: res.P_NID_TRAMITE
    //                                                   }
    //                                                 ];

    //                                                 this.objetoEmitPolicyMat(params);

    //                                               }
    //                                               );
    //                                           }
    //                                         });

    //                                     }else{*/

    //                                     if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {

    //                                         if (this.flagAprobCli) {
    //                                             swal.fire('Información', "Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.", 'success');
    //                                             this.router.navigate(['/extranet/policy-transactions-all']);
    //                                         } else {
    //                                             // this.objetoTrx();
    //                                             this.EmisionPolizaEstadoOperaciones();
    //                                             // cargar modal de pagos.
    //                                         }
    //                                     } else {
    //                                         swal.fire('Información', res.P_SMESSAGE, 'success');
    //                                         this.router.navigate(['/extranet/policy-transactions-all']);

    //                                     }

    //                                 } else {
    //                                     this.isLoading = false;
    //                                     swal.fire('Información', res.P_MESSAGE, 'error');
    //                                 }
    //                             },
    //                             err => {
    //                                 this.isLoading = false;
    //                                 swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                             }
    //                         );

    //                     }
    //                 });
    //             }
    //         });


    //     } else {
    //         swal.fire('Información', this.listToString(erroresList), 'error');
    //     }


    // }
    //GESTION TRAMITES ESTADO -  POLIZA MATRIZ - VL
    // async EmisionPolizaEstadoSinTrama() {
    //     const erroresList: any = [];

    //     if (this.flagGobiernoIniciado) {
    //         if (this.statusTransact == '') {
    //             erroresList.push('Debe Seleccionar un estado para poder emitir la Póliza');
    //         }
    //     }

    //     if (erroresList == null || erroresList.length == 0) {
    //         this.isLoading = true;
    //         this.isLoading = false;
    //         swal.fire({
    //             title: 'Información',
    //             text:  this.statusTransact == '25' ? '¿Desea generar la reevaluación del trámite?' : '¿Desea realizar la Emisión de póliza matriz?',
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Generar',
    //             allowOutsideClick: false,
    //             cancelButtonText: 'Cancelar'
    //         })
    //             .then((result) => {
    //                 if (result.value) {
    //                     this.isLoading = true;
    //                     this.policyService.getPolicyEmitCab(
    //                         this.quotationNumber, '1',
    //                         JSON.parse(localStorage.getItem('currentUser'))['id']
    //                     ).toPromise().then(async (res: any) => {
    //                         if (!!res.GenericResponse &&
    //                             res.GenericResponse.COD_ERR == 0) {
    //                             let startDate = null;
    //                             let endDate = null;
    //                             let startDateAseg = null;
    //                             let endDateAseg = null;
    //                             if (this.template.ins_iniVigencia) {
    //                                 startDate = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
    //                             }
    //                             if (this.template.ins_finVigencia) {
    //                                 endDate = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
    //                             }
    //                             if (this.template.ins_iniVigenciaAseg) {
    //                                 startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
    //                             }
    //                             if (this.template.ins_finVigenciaAseg) {
    //                                 endDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
    //                             }
    //                             let tran = this.sAbrTran;
    //                             const dataQuotation: any = {};
    //                             dataQuotation.P_SCLIENT = res.GenericResponse.SCLIENT;
    //                             dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
    //                             dataQuotation.P_NBRANCH = this.nbranch;
    //                             dataQuotation.P_DSTARTDATE = startDate; // Fecha Inicio
    //                             dataQuotation.P_DEXPIRDAT = endDate; // Fecha Inicio

    //                             dataQuotation.P_DSTARTDATE_ASE = startDateAseg;
    //                             dataQuotation.P_DEXPIRDAT_ASE = endDateAseg;

    //                             dataQuotation.P_NIDCLIENTLOCATION = res.GenericResponse.COD_SEDE;
    //                             dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
    //                             dataQuotation.P_SRUTA = '';
    //                             dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //                             dataQuotation.P_NACT_MINA = res.GenericResponse.MINA;
    //                             dataQuotation.P_NTIP_RENOV = res.GenericResponse.TIP_RENOV; // Vida Ley
    //                             dataQuotation.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Vida Ley
    //                             dataQuotation.P_SCOD_ACTIVITY_TEC = res.GenericResponse.ACT_TEC_VL; // Vida Ley
    //                             dataQuotation.P_SCOD_CIUU = res.GenericResponse.ACT_ECO_VL; // Vida Ley
    //                             dataQuotation.P_NTIP_NCOMISSION = res.GenericResponse.TIP_COMISS; // Vida Ley
    //                             dataQuotation.P_NPRODUCT = this.vidaLeyID.id; // Vida Ley
    //                             dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
    //                             dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
    //                             dataQuotation.P_NCOMISION_SAL_PR = 0
    //                             dataQuotation.CodigoProceso = this.nidProc
    //                             dataQuotation.P_NREM_EXC = res.GenericResponse.NREM_EXC; //RQ EXC
    //                             dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;// retroactividad
    //                             dataQuotation.retOP = 2; // retroactividad
    //                             dataQuotation.FlagCambioFecha = 0;// retroactividad
    //                             dataQuotation.TrxCode = tran;
    //                             dataQuotation.tipoEndoso = res.GenericResponse.NTYPE_END; //rq mejoras de endoso
    //                             dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
    //                             dataQuotation.P_SPOL_MATRIZ = res.GenericResponse.SPOL_MATRIZ;
    //                             dataQuotation.P_SPOL_ESTADO = res.GenericResponse.SPOL_ESTADO;
    //                             dataQuotation.FlagCotEstado = 2; //2 para generar poliza de estado
    //                             dataQuotation.P_APROB_CLI = res.GenericResponse.APROB_CLI;
    //                             let desTipoPlan = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
    //                             let planPropuesto = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
    //                             dataQuotation.flagComerExclu = 0; //RQ - Perfil Nuevo - Comercial Exclusivo
    //                             dataQuotation.QuotationDet = [];
    //                             dataQuotation.QuotationCom = [];

    //                             if (this.isPolizaMatriz != true) {
    //                                 if (this.template.ins_categoriaList) {
    //                                     for (let i = 0; i < this.categoryList.length; i++) {
    //                                         const itemQuotationDet: any = {};

    //                                         itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
    //                                         itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
    //                                         itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
    //                                         itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
    //                                         itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
    //                                         if (this.categoryList[i].NTASA != undefined) {
    //                                             itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
    //                                         } else {
    //                                             itemQuotationDet.P_NTASA_CALCULADA = this.CalculateList[0].RateCalculate;
    //                                         }
    //                                         itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
    //                                         itemQuotationDet.P_NPREMIUM_MENSUAL = CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
    //                                         itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
    //                                         itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
    //                                         itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
    //                                         if (this.amountDetailTotalList.length > 0) {
    //                                             itemQuotationDet.P_NSUM_PREMIUMN = this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
    //                                             itemQuotationDet.P_NSUM_IGV = this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
    //                                             itemQuotationDet.P_NSUM_PREMIUM = this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
    //                                         }

    //                                         if (this.rateByPlanList[0] != undefined) {
    //                                             itemQuotationDet.P_NRATE = this.rateByPlanList[0].NTASA;
    //                                         } else {
    //                                             itemQuotationDet.P_NRATE = this.CalculateList[0].RateCalculate;
    //                                         }
    //                                         itemQuotationDet.P_NDISCOUNT = '0';
    //                                         itemQuotationDet.P_NACTIVITYVARIATION = '0';
    //                                         itemQuotationDet.P_FLAG = '0';
    //                                         /* Nuevos parametros ins_cotizacion_det */
    //                                         itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago);
    //                                         itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago);
    //                                         itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago);

    //                                         dataQuotation.QuotationDet.push(itemQuotationDet);
    //                                     }
    //                                 }
    //                             } else {
    //                                 console.log(res.GenericResponse)

    //                             }

    //                             if (this.brokerList.length > 0 && (tran == "EM")) {

    //                                 this.brokerList.forEach(dataBroker => {
    //                                     const itemQuotationCom: any = {};
    //                                     itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
    //                                     itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Desarrollo
    //                                     itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
    //                                     itemQuotationCom.P_NCOMISION_SAL = 0;
    //                                     itemQuotationCom.P_NCOMISION_SAL_PR = 0;
    //                                     itemQuotationCom.P_NCOMISION_PEN = 0;
    //                                     itemQuotationCom.P_NCOMISION_PEN_PR = 0;
    //                                     itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
    //                                     itemQuotationCom.P_NLOCAL = dataBroker.NLOCAL; //this.selectedDep[index];
    //                                     dataQuotation.QuotationCom.push(itemQuotationCom);

    //                                 });
    //                             }



    //                             const myFormData: FormData = new FormData()
    //                             this.files.forEach(file => {
    //                               myFormData.append(file.name, file);
    //                           });

    //                             myFormData.append('quotationEnvioMariz', JSON.stringify(dataQuotation));

    //                             const dataValidaCambioPlan = {
    //                                 PlanPropuesto: this.planPropuesto,
    //                                 PlanSeleccionado: this.inputsQuotation.desTipoPlan,
    //                                 TipoTransaccion: this.typeTran,
    //                                 ReevaluarTecnica: this.statusTransact == '25',
    //                                 P_NID_COTIZACION: this.quotationNumber,
    //                                 P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id']
    //                             };
    //                             console.log(dataValidaCambioPlan);
    //                             myFormData.append('objetoEnvioMariz', JSON.stringify(dataValidaCambioPlan));

    //                             this.quotationService.envioTecnicaPolizaMatriz(myFormData).subscribe(
    //                                 async res => {
    //                                     if (res.P_COD_ERR == 0) {
    //                                         this.isLoading = false;
    //                                         swal.fire('Información', res.P_MESSAGE, 'success');
    //                                         this.router.navigate(['/extranet/policy-transactions-all']);

    //                                     } else {
    //                                         this.isLoading = false;
    //                                         swal.fire('Información', res.P_MESSAGE, 'error');
    //                                     }
    //                                 },
    //                                 err => {
    //                                     this.isLoading = false;
    //                                     swal.fire('Información', 'Hubo un error con el servidor', 'error');
    //                                 }
    //                             );

    //                         }
    //                     });
    //                 }
    //             });

    //     } else {
    //         swal.fire('Información', this.listToString(erroresList), 'error');
    //     }


    // }

    // async EmisionPolizaEstadoOperaciones() {
    //     await this.EmitCertificado();
    // }


    // async EmitCertificado() { //LS - Gestion Tramites Estado
    //     const erroresList: any = [];
    //     if (this.emitirCertificadoOperaciones) {
    //         if (this.nidProc == '' || this.nidProc == '1') {
    //             erroresList.push('Debe validar una trama para poder emitir los certificados.');
    //         }
    //     }

    //     if (erroresList == null || erroresList.length == 0) {
    //         this.isLoading = true;

    //         await this.policyService.getPolicyEmitCab(
    //             this.quotationNumber, '1',
    //             JSON.parse(localStorage.getItem('currentUser'))['id']
    //         ).toPromise().then(async (res: any) => {
    //             if (!!res.GenericResponse &&
    //                 res.GenericResponse.COD_ERR == 0) {
    //                 await this.policyService.getPolicyEmitDet(
    //                     this.quotationNumber,
    //                     JSON.parse(localStorage.getItem('currentUser'))['id'])
    //                     .toPromise().then(
    //                         async resDet => {
    //                             const params = [
    //                                 {
    //                                     P_NID_COTIZACION: this.quotationNumber,
    //                                     P_NID_PROC: this.nidProc,
    //                                     P_NPRODUCT: this.productoId,
    //                                     P_NBRANCH: this.nbranch,
    //                                     P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
    //                                     P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
    //                                     P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
    //                                     P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
    //                                     P_SFLAG_FAC_ANT: 1,
    //                                     P_FACT_MES_VENCIDO: 0,
    //                                     P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
    //                                     P_IGV: resDet[0].NSUM_IGV,
    //                                     P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
    //                                     P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
    //                                     P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
    //                                     P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,
    //                                     P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
    //                                         CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
    //                                         'Se ha modificado el inicio de vigencia: Antes = ' +
    //                                         CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
    //                                         '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''),
    //                                     P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //                                     /* Campos para retroactividad */
    //                                     P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
    //                                     P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
    //                                     planId: this.flagGobiernoIniciado ? res.GenericResponse.NIDPLAN : this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
    //                                     FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
    //                                     /* Campos para retroactividad */
    //                                     //FlagPolMat: 1,
    //                                     //FlagEnvioTEjecutivo: this.flagEnvioEmail,
    //                                     flagEmitCertificado: this.flagGobiernoIniciado || this.emitirPolizaOperaciones ? 1 : 0
    //                                 }
    //                             ];

    //                             if (params[0].P_NID_PROC == '') {
    //                                 await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
    //                                     resCod => {
    //                                         params[0].P_NID_PROC = resCod;
    //                                     }
    //                                 );
    //                             }
    //                             this.EmitCerti(params);

    //                         }
    //                     );
    //             }
    //         });
    //     } else {
    //         swal.fire('Información', this.listToString(erroresList), 'error');
    //     }

    // }

    // derivar() { // ?

    // }

    // EmitCerti(saveCerti) {

    //     this.isLoading = false;
    //     let title = this.emitirPolizaOperaciones || this.flagGobiernoEstado ? '¿Desea realizar la emisión de la póliza?' : '¿Desea realizar la emisión de certificados?';
    //     if (this.emitirPolizaOperaciones) {
    //         swal.fire({
    //             title: 'Información',
    //             text: title,
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Generar',
    //             allowOutsideClick: false,
    //             cancelButtonText: 'Cancelar'

    //         }).then((result) => {

    //             if (result.value) {
    //                 this.isLoading = true;
    //                 let dataQuotation: any = {};
    //                 const data: FormData = new FormData();

    //                 dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //                 dataQuotation.P_NFLAG_EMAIL = this.flagAprobCli ? 1 : 0 // this.flagEnvioEmail;
    //                 this.datasavecertificados = saveCerti;
    //                 this.SaveEmitCerti(saveCerti);

    //             }
    //         });
    //     } else if (this.flagGobiernoEstado) {
    //         this.SaveEmitCerti(saveCerti);

    //     }

    // }



    /*

      EmitCerti(saveCerti){

        this.isLoading = false;
        let title = this.emitirPolizaOperaciones? '¿Desea realizar la emisión de la p+oliza?' : '¿Desea realizar la emisión de certificados?';

        swal.fire({
          title: 'Información',
          text: title,
          type: 'question',
          showCancelButton: true,
          confirmButtonText: 'Generar',
          allowOutsideClick: false,
          cancelButtonText: 'Cancelar'

        }).then((result) => {

          if (result.value) {
            this.isLoading = true;
            let dataQuotation: any = {};
            const data: FormData = new FormData();

            dataQuotation.P_NID_TRAMITE = this.transactNumber;
            dataQuotation.P_NFLAG_EMAIL =this.flagAprobCli? 1:0 // this.flagEnvioEmail;

            this.transactService.EnvioEmail(dataQuotation).subscribe(
              res => {
                if (res.P_COD_ERR == 0) {
                  this.datasavecertificados = saveCerti;
                  this.SaveEmitCerti(saveCerti);

                  // if(this.emitirCertificadoOperaciones){
                  //
                  //   this.OpenModalPagos(saveCerti);

                  // }



                } else {
                  this.isLoading = false;
                  swal.fire('Información', res.P_MESSAGE, 'error');
                }
              },
              err => {
                this.isLoading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
              }
            );

          }
        });
      }
    */
    // SaveEmitCerti(saveCerti) {

    //     let title = this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? 'Se ha generado correctamente la póliza de Vida Ley N° ' : 'Se ha generado correctamente la Emisión de Certificados';
    //     if (this.flagAprobCli) {
    //         title = 'Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.';
    //     }
    //     const myFormData: FormData = new FormData();
    //     if (this.files.length > 0) {
    //         this.files.forEach(file => {
    //             myFormData.append('adjuntos', file, file.name);
    //         });
    //     }
    //     myFormData.append('objeto', JSON.stringify(saveCerti));
    //     if ((this.flagGobiernoIniciado || this.emitirPolizaOperaciones) && saveCerti[0].flagEmitCertificado == 1) {
    //         if (!this.flagAprobCli)
    //             this.OpenModalPagos();
    //     } else {
    //         this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
    //             if (res.P_COD_ERR == 0) {
    //                 let policyVLey = 0;
    //                 let constancia = 0;

    //                 policyVLey = Number(res.P_POL_VLEY);
    //                 constancia = Number(res.P_NCONSTANCIA);

    //                 if ((this.emitirCertificadoOperaciones && policyVLey == 0 && !this.flagAprobCli) && this.emitirCertificadoTecnica == false && res.P_SAPROBADO != 'A') {

    //                     if (!this.flagAprobCli && saveCerti[0].flagEmitCertificado == 1)
    //                         this.OpenModalPagos();


    //                 } else {
    //                     if (this.flagAprobCli || policyVLey == 0 || this.emitirCertificadoTecnica == true) { // al enviar al ejecutivo viene con policy cero y status S
    //                         this.isLoading = false;
    //                         swal.fire({
    //                             title: 'Información',
    //                             text: (this.flagAprobCli && policyVLey == 0 && res.P_SAPROBADO == 'S') || this.emitirCertificadoTecnica == true ? title : res.P_MESSAGE,
    //                             icon: 'success',
    //                             confirmButtonText: 'OK',
    //                             allowOutsideClick: false,
    //                         }).then((result) => {
    //                             if (result.value) {
    //                                 if (this.from == 'transact2') {
    //                                     this.router.navigate(['/extranet/tray-transact/1']);
    //                                 }
    //                             }
    //                         });
    //                     } else {
    //                         if ((this.emitirCertificadoOperaciones && policyVLey > 0) || this.flagGobiernoIniciado || this.emitirPolizaOperaciones) {
    //                             this.isLoading = false;
    //                             //let title = 'Se ha generado correctamente la Emisión de Certificados';
    //                             title = this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? title + policyVLey.toString() : title;
    //                             swal.fire({
    //                                 title: 'Información',
    //                                 text: title,
    //                                 icon: 'success',
    //                                 confirmButtonText: 'OK',
    //                                 allowOutsideClick: false,
    //                             })
    //                                 .then((result) => {
    //                                     if (result.value) {
    //                                         if (this.from == 'transact2') {
    //                                             this.router.navigate(['/extranet/tray-transact/1']);
    //                                         }
    //                                     }
    //                                 });
    //                         }
    //                     }

    //                 }
    //             } else if (res.P_COD_ERR == 1 || res.P_COD_ERR == 4 || res.P_SAPROBADO == 'A') {
    //                 this.isLoading = false;
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: res.P_MESSAGE,
    //                     icon: 'success',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         if (this.from == 'transact1') {
    //                             this.router.navigate(['/extranet/tray-transact/1']);
    //                         } else if (this.from == 'transact2') {
    //                             this.router.navigate(['/extranet/tray-transact/2']);
    //                         } else {
    //                             this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: res.P_MESSAGE,
    //                     icon: 'error',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 })
    //             }
    //         });
    //     }
    // }

    // AprobCliente(e) {
    //     this.flagEnvioEmail = 0;

    //     if (e.target.checked) {
    //         this.flagEnvioEmail = 1;
    //     }

    // }

    // reverseMovementIncomplete() {

    //     swal.fire({
    //         title: 'Información',
    //         text: '¿Deseas reversar los movimientos pendientes?',
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Reversar',
    //         allowOutsideClick: false,
    //         cancelButtonText: 'Cancelar'
    //     }).then((result) => {
    //         if (result.value) {
    //             this.isLoading = true;
    //             var data: any = {
    //                 quotation: this.quotationNumber,
    //                 codBranch: this.vidaLeyID.nbranch
    //             };

    //             this.quotationService.reverseMovementsIncomplete(data).subscribe(
    //                 res => {
    //                     this.isLoading = false;

    //                     if (res.codError == 0) {
    //                         this.mode = 'Visualizar';
    //                         this.searchTracking();
    //                         swal.fire('Información', '' + res.desError, 'success');
    //                     } else {
    //                         swal.fire('Información', res.desError, 'error');
    //                     }

    //                 },
    //                 err => {
    //                     this.isLoading = false;
    //                     swal.fire('Información', 'Hubo un error al ejecutar el proceso', 'error');
    //                 }
    //             );
    //         }
    //     });
    // }
    // changeRateProposed(event, valor, row) {
    //     this.arrayRateProposed = [];

    //     if (this.categoryList.length > 0) {
    //         this.categoryList.forEach(element => {
    //             if (element.ProposalRate == undefined || element.ProposalRate == '') {
    //                 element.ProposalRate = 0;
    //                 this.arrayRateProposed.push(element.ProposalRate);
    //             } else {
    //                 this.arrayRateProposed.push(element.ProposalRate);
    //             };
    //         });
    //     }
    //     if (this.categoryList.length == this.arrayRateProposed.length) {
    //         this.isRateProposed = true;
    //         this.validarExcel(-1);
    //     }
    // }
    // clearInsert() {
    //     // Datos Contratante

    //     this.inputsQuotation.P_NIDDOC_TYPE = '-1'; // Tipo de documento
    //     this.inputsQuotation.P_SIDDOC = ''; // Nro de documento
    //     this.inputsQuotation.P_SFIRSTNAME = ''; // Nombre
    //     this.inputsQuotation.P_SLASTNAME = ''; // Apellido Paterno
    //     this.inputsQuotation.P_SLASTNAME2 = ''; // Apellido Materno
    //     this.inputsQuotation.P_SLEGALNAME = ''; // Razon social
    //     this.inputsQuotation.P_SE_MAIL = ''; // Email
    //     this.inputsQuotation.P_SDESDIREBUSQ = ''; // Direccion
    //     this.inputsQuotation.tipoRenovacion = ''; // Tipo de renovación
    //     this.inputsQuotation.frecuenciaPago = ''; // Frecuencia de pago
    //     this.canTasaVL = true;
    //     this.inputsQuotation.P_COMISION = ''

    //     this.excelSubir = null;
    //     this.archivoExcel = null;
    //     this.files = null;
    //     // this.flagEmailNull = true;
    //     this.flagEmail = false;
    //     this.flagContact = false;
    //     this.inputsQuotation.desTipoPlan = ''
    //     this.inputsQuotation.FDateIni = new Date();
    //     this.inputsQuotation.FDateFin = new Date();
    //     this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);

    //     // Datos Cotización
    //     this.inputsQuotation.P_NCURRENCY = '1'; // Moneda
    //     this.inputsQuotation.P_NIDSEDE = null; // Sede
    //     this.inputsQuotation.P_NTECHNICAL = null; // Actividad Tecnica
    //     this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
    //     this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
    //     this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0
    //     this.inputsQuotation.P_NPROVINCE = null;
    //     this.inputsQuotation.P_NLOCAL = null;
    //     this.inputsQuotation.P_NMUNICIPALITY = null;

    //     //Cotizador
    //     this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
    //     this.inputsQuotation.P_PERSON_TYPE = '1'; // Tipo persona

    //     this.categoryList.forEach(element => {
    //         element.ProposalRate = null;
    //     });

    //     this.categoryList = [];
    //     this.rateByPlanList = [];
    //     this.validateLockResponse = {};
    //     this.validateDebtResponse = {};
    //     this.excelSubir = null;
    //     this.creditHistory = null;
    //     this.inputsQuotation.commissionProposed = null;
    //     this.isPolizaMatriz = false;
    // }

    // async procesarPolizaEstadoOperaciones() {  // para procesar directamente transaciones del estado Vida Ley
    //     switch (this.mode) {
    //         case 'Renovar':
    //             this.processRenovation();
    //             break;
    //         case 'Incluir':
    //             this.processInclude();
    //             break;
    //         case 'Endosar':
    //             this.processEndoso();
    //             break;
    //         case 'Excluir':
    //             this.processExclude();
    //             break;

    //     }
    // }
    // emitirCertificadoEstado(datasavecertificados) {
    //     this.policyService.emitirCertificadoEstado(datasavecertificados).subscribe(res => {

    //         if (res.P_COD_ERR == 0) {
    //             let policyVLey = 0;
    //             let constancia = 0;

    //             policyVLey = Number(res.P_NPOLICY);
    //             constancia = Number(res.P_NCONSTANCIA);
    //             let title = 'Se ha generado correctamente la Emisión de Certificados de la póliza N° ';
    //             title = title + policyVLey.toString();
    //             swal.fire({
    //                 title: 'Información',
    //                 text: title,
    //                 icon: 'success',
    //                 confirmButtonText: 'OK',
    //                 allowOutsideClick: false,
    //             })
    //                 .then((result) => {
    //                     if (result.value) {
    //                         this.router.navigate(['/extranet/tray-transact/1']);

    //                     }
    //                 });
    //         }
    //     }

    //     );

    // }

    // async loadDatosCotizadorPolizaMatriz() {
    //     await this.policyService.getPolicyEmitDet(
    //         this.quotationNumber, JSON.parse(localStorage.getItem('currentUser'))['id'])
    //         .toPromise().then(
    //             async resDet => {

    //               var frecPago = 0;

    //               switch (Number(this.dataPolizaEstado.FREQ_PAGO)) {
    //                   case 1:
    //                       frecPago = 12 // Anual
    //                       break;
    //                   case 2:
    //                       frecPago = 6 // Semestral
    //                       break;
    //                   case 3:
    //                       frecPago = 3 // Trimestral
    //                       break;
    //                   case 4:
    //                       frecPago = 2 // Bimestral
    //                       break;
    //                   case 5:
    //                       frecPago = 1; // Mensual
    //                       break;

    //                   default:
    //                       break;
    //               }

    //                 for (let i = 0; i < resDet.length; i++) {

    //                     if (resDet[i].TIP_RIESGO == "1") {
    //                         this.countinputEMP = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputEMP = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputEMP = resDet[i].TASA;
    //                         //this.MontoSinIGVEMP = resDet[i].PRIMA;
    //                         //this.MontoSinIGVEMP = parseFloat(Number.parseFloat(resDet[i].PRIMA).toFixed(6));
    //                         this.MontoSinIGVEMP = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);

    //                     }
    //                     if (resDet[i].TIP_RIESGO == "2") {
    //                         this.countinputOBR = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputOBR = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputOBR = resDet[i].TASA;
    //                         this.MontoSinIGVOBR =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
    //                         //this.MontoFPSinIGVOBR = resDet[i].PRIMA;
    //                     }

    //                     if (resDet[i].TIP_RIESGO == "3") {
    //                         this.countinputOAR = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputOAR = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputOAR = resDet[i].TASA;
    //                         this.MontoSinIGVOAR =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
    //                         //this.MontoFPSinIGVOAR = resDet[i].PRIMA;
    //                     }

    //                     if (resDet[i].TIP_RIESGO == "5") {
    //                         this.countinputEE = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputEE = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputEE = resDet[i].TASA;
    //                         this.MontoSinIGVEE = resDet[i].PRIMA;
    //                         //this.MontoFPSinIGVEE = resDet[i].PRIMA;
    //                         this.MontoSinIGVEE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
    //                     }
    //                     if (resDet[i].TIP_RIESGO == "6") {
    //                         this.countinputOE = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputOE = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputOE = resDet[i].TASA;
    //                         this.MontoSinIGVOE = resDet[i].PRIMA;
    //                         //this.MontoFPSinIGVOE = resDet[i].PRIMA;
    //                         this.MontoSinIGVOE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
    //                     }
    //                     if (resDet[i].TIP_RIESGO == "7") {
    //                         this.countinputOARE = resDet[i].NUM_TRABAJADORES;
    //                         this.planillainputOARE = resDet[i].MONTO_PLANILLA;
    //                         this.tasainputOARE = resDet[i].TASA;
    //                         this.MontoSinIGVOARE = resDet[i].PRIMA;
    //                         //this.MontoFPSinIGVOARE = resDet[i].PRIMA;
    //                         this.MontoSinIGVOARE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
    //                     }

    //                 }
    //                 for (let i = 0; i < this.CalculateList.length; i++) {
    //                     if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO') {
    //                       //  this.MontoFPSinIGVEMP = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                       this.MontoFPSinIGVEMP = CommonMethods.formatValor(this.MontoSinIGVEMP*frecPago,6,1)
    //                     }
    //                     if (this.CalculateList[i].CategoryCalculate == 'OBRERO') {
    //                        // this.MontoFPSinIGVOBR = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                        this.MontoFPSinIGVOBR =CommonMethods.formatValor(this.MontoSinIGVOBR*frecPago,6,1)
    //                     }

    //                     if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO') {
    //                       //  this.MontoFPSinIGVOAR = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                       this.MontoFPSinIGVOAR = CommonMethods.formatValor(this.MontoSinIGVOAR*frecPago,6,1);
    //                     }

    //                     if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO EXCEDENTE') {
    //                        // this.MontoFPSinIGVEE = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                        this.MontoFPSinIGVEE = CommonMethods.formatValor(this.MontoSinIGVEE*frecPago,6,1);
    //                     }
    //                     if (this.CalculateList[i].CategoryCalculate == 'OBRERO EXCEDENTE') {
    //                        // this.MontoFPSinIGVOE = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                        this.MontoFPSinIGVOE = CommonMethods.formatValor(this.MontoSinIGVOE*frecPago,6,1);
    //                     }
    //                     if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO EXCEDENTE') {
    //                        // this.MontoFPSinIGVOARE = this.CalculateList[i].PremiumCalculate.toFixed(6);
    //                        this.MontoFPSinIGVOARE = CommonMethods.formatValor(this.MontoSinIGVOARE*frecPago,6,1);
    //                     }
    //                 }

    //                 this.TotalSinIGV = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE), 2,1);
    //                 this.TotalFPSinIGV = CommonMethods.formatValor(Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE), 2,1);

    //                 this.TotalConIGV = CommonMethods.formatValor( this.TotalSinIGV* 118 / 100, 2,1);
    //                 this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV* 118 / 100,2,1);
    //             }
    //         );
    // }

    // async EmisionPolizaMatrizTEstado() {
    //     if (this.statusTransact == '25') {
    //         let msg = "";

    //         if (this.mainFormGroup.controls.comment.value == "") {
    //             msg += "Ingrese un comentario por favor."
    //         }

    //         if (msg != "") {
    //             await swal.fire('Error', msg, 'error');
    //             return;
    //         }
    //         // this.EmisionPolizaEstadoSinTrama();
    //     } else if (this.statusTransact == '6') {
    //         this.AsignarTramite();
    //     } else if (this.mode == 'Enviar' && this.flagAprobCli) {
    //         this.EnviarTramite();
    //     } else {
    //         const erroresList: any = [];

    //         if (this.emitirPolizaMatrizTramiteEstado) {
    //             if (this.statusTransact == '') {
    //                 erroresList.push('Debe Seleccionar un estado para poder emitir la Póliza');
    //             }
    //         }

    //         if (erroresList == null || erroresList.length == 0) {
    //             this.isLoading = true;
    //             await this.policyService.getPolicyEmitCab(
    //                 this.quotationNumber, '1',
    //                 JSON.parse(localStorage.getItem('currentUser'))['id']
    //             ).toPromise().then(async (res: any) => {
    //                 if (!!res.GenericResponse &&
    //                     res.GenericResponse.COD_ERR == 0) {
    //                     await this.policyService.getPolicyEmitDet(
    //                         this.quotationNumber,
    //                         JSON.parse(localStorage.getItem('currentUser'))['id'])
    //                         .toPromise().then(
    //                             async resDet => {
    //                                 const params = [
    //                                     {
    //                                         P_NID_COTIZACION: this.quotationNumber,
    //                                         P_NID_PROC: "",
    //                                         P_NPRODUCT: this.productoId,
    //                                         P_NBRANCH: this.nbranch,
    //                                         P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
    //                                         P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
    //                                         P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
    //                                         P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
    //                                         P_SFLAG_FAC_ANT: 1,
    //                                         P_FACT_MES_VENCIDO: 0,
    //                                         P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
    //                                         P_IGV: resDet[0].NSUM_IGV,
    //                                         P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
    //                                         P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
    //                                         P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
    //                                         P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,
    //                                         P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
    //                                             CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
    //                                             'Se ha modificado el inicio de vigencia: Antes = ' +
    //                                             CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
    //                                             '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''),
    //                                         P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
    //                                         P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
    //                                         P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
    //                                         planId: this.flagGobiernoIniciado ? res.GenericResponse.NIDPLAN : this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
    //                                         FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
    //                                         flagEmitCertificado: this.flagGobiernoIniciado || this.emitirPolizaOperaciones ? 1 : 0,
    //                                         P_NPOLIZA_MATRIZ: this.flagGobiernoMatriz == true ? 1 : 0,
    //                                         P_SPAGO_ELEGIDO: 'directo'
    //                                     }
    //                                 ];

    //                                 this.EmitPoliMatrizTramiteEstado(params);

    //                             }
    //                         );
    //                 }
    //             });
    //         } else {
    //             swal.fire('Información', this.listToString(erroresList), 'error');
    //         }
    //     }

    // }

    // EmitPoliMatrizTramiteEstado(saveParams) {

    //     this.isLoading = false;
    //     let title = this.flagGobiernoEstado ? '¿Desea realizar la  Emisión de póliza matriz?' : '¿Desea realizar la emisión de certificados?';
    //     if (this.emitirPolizaMatrizTramiteEstado) {
    //         swal.fire({
    //             title: 'Información',
    //             text: title,
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Generar',
    //             allowOutsideClick: false,
    //             cancelButtonText: 'Cancelar'

    //         }).then((result) => {

    //             if (result.value) {
    //                 this.isLoading = true;
    //                 let dataQuotation: any = {};
    //                 const data: FormData = new FormData();

    //                 dataQuotation.P_NID_TRAMITE = this.transactNumber;
    //                 dataQuotation.P_NFLAG_EMAIL = this.flagAprobCli ? 1 : 0 // this.flagEnvioEmail;
    //                 this.datasavecertificados = saveParams;
    //                 this.SaveEmitPoliMatrizTramiteEstado(saveParams);

    //             }
    //         });
    //     } else if (this.flagGobiernoEstado) {
    //         this.SaveEmitPoliMatrizTramiteEstado(saveParams);

    //     }

    // }

    // SaveEmitPoliMatrizTramiteEstado(saveParams) {

    //     let title = 'Se ha generado correctamente la póliza de Vida Ley N° ';
    //     if (this.flagAprobCli) {
    //         title = 'Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.';
    //     }
    //     const myFormData: FormData = new FormData();
    //     if (this.files.length > 0) {
    //         this.files.forEach(file => {
    //             myFormData.append('adjuntos', file, file.name);
    //         });
    //     }
    //     myFormData.append('objeto', JSON.stringify(saveParams));
    //     if ((this.flagGobiernoIniciado || this.emitirPolizaOperaciones) && saveParams[0].flagEmitCertificado == 1) {
    //         if (!this.flagAprobCli)
    //             this.OpenModalPagos();
    //     } else {
    //         this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
    //             console.log('savePolicyEmit_res');
    //             console.log(res);
    //             if (res.P_COD_ERR == 0) {
    //                 let policyVLey = 0;
    //                 let constancia = 0;

    //                 policyVLey = Number(res.P_POL_VLEY);
    //                 constancia = Number(res.P_NCONSTANCIA);

    //                 this.isLoading = false;
    //                 title =  !this.flagAprobCli && policyVLey > 0 ? title + policyVLey.toString():title;
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: title,
    //                     icon: 'success',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 })
    //                     .then((result) => {
    //                         if (result.value) {
    //                             if (this.from == 'transact2') {
    //                                 this.router.navigate(['/extranet/tray-transact/1']);
    //                             }
    //                         }
    //                     });

    //             } else if (res.P_COD_ERR == 1 || res.P_COD_ERR == 4 || res.P_SAPROBADO == 'A') {
    //                 this.isLoading = false;
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: res.P_MESSAGE,
    //                     icon: 'success',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         if (this.from == 'transact1') {
    //                             this.router.navigate(['/extranet/tray-transact/1']);
    //                         } else if (this.from == 'transact2') {
    //                             this.router.navigate(['/extranet/tray-transact/2']);
    //                         } else {
    //                             this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 swal.fire({
    //                     title: 'Información',
    //                     text: res.P_MESSAGE,
    //                     icon: 'error',
    //                     confirmButtonText: 'OK',
    //                     allowOutsideClick: false,
    //                 })
    //             }

    //         });
    //     }



    // }

    async getTramaFileSCTR(item: any): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = item.linea;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        return this.collectionsService.getTramaFileSCTR(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {

                    if (item.linea == 3) {
                        const nameFile: string = 'COTIZACION' + '_' + this.quotationNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    } else {
                        const nameFile: string = item.desMov + '_' + this.quotationNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    }
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    copyCodCIP(option: Number) { //AVS - INTERCONEXION SABSA 
        if (option == 1) {
            const el = document.createElement('textarea');
            el.value = this.codCIP_PEN;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            this.copiedMessage = 'Fue copiado con éxito';
            setTimeout(() => {
                this.copiedMessage = '';
            }, 3000);

            setTimeout(() => {
                const copyMessageElement = document.querySelector('.copy-messagePENSION');
                copyMessageElement.classList.add('show');
                setTimeout(() => {
                    copyMessageElement.classList.remove('show');
                }, 2000);
            }, 0);
        } else if (option == 2) {
            const el = document.createElement('textarea');
            el.value = this.codCIP_EPS;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            this.copiedMessage = 'Fue copiado con éxito';
            setTimeout(() => {
                this.copiedMessage = '';
            }, 3000);

            setTimeout(() => {
                const copyMessageElement = document.querySelector('.copy-messageSALUD');
                copyMessageElement.classList.add('show');
                setTimeout(() => {
                    copyMessageElement.classList.remove('show');
                }, 2000);
            }, 0);
        }
    }

    async EstadoCliente(sclient) {
        await this.quotationService.getEstadoClienteNuevo(sclient).toPromise().then(res => {
            this.flagClienteNuevo = (res === undefined || res.P_ESTADO === undefined) ? 1 : res.P_ESTADO;
        });
    }

    async RelanzarCip(codeCip, nproducto, grupal) {
        this.isLoading = true;
        const data: any = {};
        data.codeCip = codeCip;
        data.token = this.currentUser.token;
        data.nproducto = nproducto;
        data.mixta = grupal == 1 ? this.valMixSAPSA : 0;
        data.flagProducto = nproducto == 1 ? 0 : 1;
        data.flagNcotMixta = this.valMixSAPSA;

        await this.quotationService.relanzarCip(data).toPromise().then(res => {
            this.isLoading = false;
            swal.fire('Información', res.mensaje, 'success').then(() => {
                location.reload();
            });
        });
    }

    async callServiceMethods(prima) {
        let response: any = {};

        await this.policyService.getPayMethodsTypeValidate(  //AVS - INTERCONEXION SABSA
            this.creditHistory.sdescript,
            prima,
            this.typeMovement
        ).toPromise().then(res => {
            response = res;
        }, err => {
            console.log(err);
        });

        return response;
    }

    descargarPDFProm(producto: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let enlace = "";
            let cupon = "";

            if (producto == "1") {
                enlace = this.slink_PEN;
                cupon = "cupon_PENSION";
            } else if (producto == "2") {
                enlace = this.slink_SAL;
                cupon = "cupon_SALUD";
            }

            const xhr = new XMLHttpRequest();
            xhr.open('GET', enlace, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function (oEvent) {
                const arrayBuffer = xhr.response;
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const dataUrl = URL.createObjectURL(blob);

                var link = document.createElement('a');
                link.href = dataUrl;
                link.download = cupon + '.pdf';
                link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                setTimeout(function () {
                    window.URL.revokeObjectURL(dataUrl);
                    link.remove();
                    resolve();
                }, 100);
            };

            xhr.onerror = function () {
                reject(new Error('Error al descargar el PDF'));
            };

            xhr.send();
        });
    }

    descargarPDF(producto: string) {
        this.isLoading = true;

        this.descargarPDFProm(producto).then(() => {
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;

            swal.fire({
                title: 'Información',
                text: "",
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })
        });
    }

    openLink(producto: string) {
        let enlace = "";

        if (producto == "1") {
            enlace = this.slink_PEN;
        } else if (producto == "2") {
            enlace = this.slink_SAL;
        }

        window.open(enlace, '_blank');
    }

    copyLink(producto: string) {
        let enlaceACopiar = "";

        if (producto == "1") {
            enlaceACopiar = this.slink_PEN;
        } else if (producto == "2") {
            enlaceACopiar = this.slink_SAL;
        }

        navigator.clipboard.writeText(enlaceACopiar).then(() => {
            //alert('¡Enlace copiado al portapapeles!');
        }, (err) => {
            console.error('Error al copiar enlace: ', err);
        });
    }

    async crearLink(codeCip, nproducto, grupal) {
        this.isLoading = true;
        const data: any = {};
        data.codeCip = codeCip;
        data.token = this.currentUser.token;

        data.nproducto = nproducto;
        data.mixta = grupal == 1 ? this.valMixSAPSA : 0;
        data.flagProducto = nproducto == 1 ? 0 : 1;
        data.flagNcotMixta = this.valMixSAPSA;
        data.flagKushki = 1;

        if (data.flagNcotMixta == 1) {
            data.producto_link = data.nproducto;
            data.stipo_pago = this.tipo_pago_PEN;
        } else {
            if (this.listaTasasPension.length > 0) {
                data.stipo_pago = this.tipo_pago_PEN;
                data.producto_link = 1;
            } else {
                if (this.listaTasasSalud.length > 0) {
                    data.stipo_pago = this.tipo_pago_SAL;
                    data.producto_link = 2;
                }
            }
        }

        await this.quotationService.relanzarCip(data).toPromise().then(res => {
            this.isLoading = false;
            swal.fire('Información', res.mensaje, 'success').then(() => {
                location.reload();
            });
        });
    }

    // checkMinimunPremiumAmounts(productId: string, cantPrima?) {
    //     console.log('checkMinimunPremiumAmounts');
    //     console.log(productId + ' ' + cantPrima);
    //     console.log('this.inputsQuotation.SaludPropMinPremium ' + this.inputsQuotation.SaludPropMinPremium);
    //     console.log('this.inputsQuotation.SaludMinPremium ' + this.inputsQuotation.SaludMinPremium);
    //     console.log(productId + ' - ' + this.healthProductId.id);
    //     console.log(this.inputsQuotation.NTYPE_TRANSAC + ' - ' + this.flagMesVec);
    //     if (productId == this.healthProductId.id) {
    //         if (Number(this.inputsQuotation.SaludPropMinPremium) > 0) {
    //             if (Number(cantPrima) > Number(this.inputsQuotation.SaludPropMinPremium)) {

    //             } else {
    //                 this.inputsQuotation.SaludNetAmount = this.inputsQuotation.SaludPropMinPremium;
    //                 this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNetAmount) * Number(this.dEmiSalud), 2);
    //                 this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor(((Number(this.inputsQuotation.SaludNetAmount) * this.healthIGV) - Number(this.inputsQuotation.SaludNetAmount)), 2);
    //                 this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor((Number(this.inputsQuotation.SaludPrimaComercial) + Number(this.inputsQuotation.SaludCalculatedIGV)), 2);
    //             }
    //         } else {
    //             if (Number(cantPrima) > Number(this.inputsQuotation.SaludMinPremium)) {

    //             } else {
    //                 if (this.flagMesVec == "1" && (this.inputsQuotation.NTYPE_TRANSAC == 2 || this.inputsQuotation.NTYPE_TRANSAC == 3 || this.inputsQuotation.NTYPE_TRANSAC == 4)) {

    //                 } else {
    //                     this.inputsQuotation.SaludNetAmount = this.inputsQuotation.SaludMinPremium;
    //                     this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNetAmount) * Number(this.dEmiSalud), 2);
    //                     this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor(((Number(this.inputsQuotation.SaludNetAmount) * this.healthIGV) - Number(this.inputsQuotation.SaludNetAmount)), 2);
    //                     this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor((Number(this.inputsQuotation.SaludPrimaComercial) + Number(this.inputsQuotation.SaludCalculatedIGV)), 2);
    //                 }
    //             }
    //         }
    //     } else {
    //         if (productId == this.pensionProductId.id) {
    //             if (Number(this.inputsQuotation.PensionPropMinPremium) > 0) {
    //                 if (Number(cantPrima) > Number(this.inputsQuotation.PensionPropMinPremium)) {

    //                 } else {
    //                     this.inputsQuotation.PensionNetAmount = this.inputsQuotation.PensionPropMinPremium;
    //                     this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNetAmount) * Number(this.dEmiPension), 2);
    //                     this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor(((Number(this.inputsQuotation.PensionNetAmount) * this.pensionIGV) - Number(this.inputsQuotation.PensionNetAmount)), 2);
    //                     console.log('checkMinimunPremiumAmounts this.inputsQuotation.PensionCalculatedIGV  1: ' + this.inputsQuotation.PensionCalculatedIGV);
    //                     this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor((Number(this.inputsQuotation.PensionPrimaComercial) + Number(this.inputsQuotation.PensionCalculatedIGV)), 2);
    //                 }
    //             } else {
    //                 if (Number(cantPrima) > Number(this.inputsQuotation.PensionMinPremium)) {

    //                 } else {
    //                     if (this.flagMesVec == "1" && (this.inputsQuotation.NTYPE_TRANSAC == 2 || this.inputsQuotation.NTYPE_TRANSAC == 3 || this.inputsQuotation.NTYPE_TRANSAC == 4)) {

    //                     } else {
    //                         this.inputsQuotation.PensionNetAmount = this.inputsQuotation.PensionMinPremium;
    //                         this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNetAmount) * Number(this.dEmiPension), 2);
    //                         this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor(((Number(this.inputsQuotation.PensionNetAmount) * this.pensionIGV) - Number(this.inputsQuotation.PensionNetAmount)), 2);
    //                         console.log('checkMinimunPremiumAmounts this.inputsQuotation.PensionCalculatedIGV  2: ' + this.inputsQuotation.PensionCalculatedIGV);
    //                         this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor((Number(this.inputsQuotation.PensionPrimaComercial) + Number(this.inputsQuotation.PensionCalculatedIGV)), 2);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    //Ini RQ2025-4
    renderSede(value: any) {
        const selectElement = document.querySelector('.render-sede') as HTMLSelectElement;

        if (selectElement) {
            const getTextWidth = (text: string, font: string): number => {
                const tempElement = document.createElement('span');
                document.body.appendChild(tempElement);

                tempElement.style.font = font;
                tempElement.style.whiteSpace = 'nowrap';
                tempElement.style.visibility = 'hidden';
                tempElement.style.position = 'absolute';

                tempElement.textContent = text;

                const textWidth = tempElement.offsetWidth;

                document.body.removeChild(tempElement);

                return textWidth;
            };

            // Función para verificar si el texto desborda
            const isTextOverflowing = (): boolean => {
                const elementValue = value;

                const elementStyles = window.getComputedStyle(selectElement);
                const font = `${elementStyles.fontSize} ${elementStyles.fontFamily}`;

                const textWidth = getTextWidth(elementValue, font);

                const elementWidth = selectElement.clientWidth;

                return textWidth > elementWidth;
            };

            // Función para ajustar el contenedor padre
            const adjustParentContainer = () => {
                if (isTextOverflowing()) {
                    const parentDiv = selectElement.parentNode as HTMLElement;

                    if (parentDiv) {
                        parentDiv.classList.remove('col-sm-3');
                        parentDiv.classList.add('col-sm-6');
                    }
                } else {
                    const parentDiv = selectElement.parentNode as HTMLElement;

                    if (parentDiv) {
                        parentDiv.classList.remove('col-sm-6');
                        parentDiv.classList.add('col-sm-3');
                    }
                }
            };

            adjustParentContainer();
        }
    }
    //Fin RQ2025-4

    onKey(event, type = 'rate') {

        if (event.keyCode != 13) {
            let reg = this.regexConfig(type);
            let value = event.target.value;
            if (!reg.test((value ? value : '') + event.key)) {
                event.preventDefault();
            }
        }
    }

    onKeydown(event) {
        var key = event.keyCode || event.charCode;
        if (key == 8) {
            // this.onKeypressNoEnter.emit(event);
        }
    }

    onPaste(event, type = 'rate') {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');

        // if (this.patternPrevent) {
        let reg = this.regexConfig(type);

        //   if (reg == this.CONSTANTS.REGEX.PORCENTAJE) {
        //     let next = pastedText.includes('..');
        //     if (next == true) {
        //       event.preventDefault();
        //     }
        //   }
        if (!reg.test(pastedText)) {
            event.preventDefault();
        }
        // } else {
        //   let reg = this.CONSTANTS.REGEX.ALFANUMERICO;
        //   if (!reg.test(pastedText)) {
        //     event.preventDefault();
        //   }
        // }
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

    async filesAdjuntos(files: File[]) {
        this.files_adjuntos = [];

        for (let file of files) {
            await this.getBase64(file).then(
                data => {
                    this.guardarAdjuntos(file.name, data);
                })
        }
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

    riesgosSCTR_Salud() { //AVS - INTERCONEXION SABSA 05/09/2023
        let dataQuotation_EPS_EM: any = {};
        dataQuotation_EPS_EM.primaMinimaAutorizada = this.inputsQuotation.MIN_SALUD_AUT;
        dataQuotation_EPS_EM.riesgos = [];

        if (this.listaTasasSalud.length > 0) {
            this.listaTasasSalud.forEach(dataSalud => {
                let riesgo_EPS: any = {};

                riesgo_EPS.codigoProducto = 2;
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
                dataQuotation_EPS_EM.riesgos.push(riesgo_EPS);
            });
        }

        localStorage.setItem('dataQuotation_EPS_EM', JSON.stringify(dataQuotation_EPS_EM));
    }

    async onPaymentKushki() {
        await this.validateFlow();

        if (this.files.length > 0) {
            await this.filesAdjuntos(this.files);
        }

        console.log(this.savedPolicyList);

        const policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.savedPolicyList;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = null;
        policyData.adjuntos = this.files_adjuntos;
        policyData.transaccion = 1;
        policyData.dataCIP = this.dataCIP;

        if (this.inputsQuotation.poliza.pagoElegido == 'transferencia') {
            policyData.dataCIP.tipoPago = "3"
        } else if (this.inputsQuotation.poliza.pagoElegido == 'cash') {
            policyData.dataCIP.tipoPago = "2"
        }

        //this.payPF = 1; 
        // let insertDetResult = await this.insertDetTr();
        //let nidproc_EPS = null; //this.nroMovimientoEPS;
        let nidproc_EPS = this.inputsQuotation.NID_PROC_EPS; //SD-70383

        if (this.valMixSAPSA == 1 || this.nbranch == this.pensionID.nbranch && this.inputsQuotation.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 05/09/2023
            await this.riesgosSCTR_Salud();
        }

        // if (insertDetResult.P_COD_ERR == 0) {
        const payPF = this.payPF;

        for (let i = 0; i < policyData.savedPolicyList.length; i++) {
            policyData.savedPolicyList[i].P_PAYPF = policyData.dataCIP.tipoPago;
            policyData.savedPolicyList[i].P_NID_PROC_EPS = nidproc_EPS;
        }

        policyData.dataCIP.ExternalId_EPS = nidproc_EPS;
        console.log('onPaymentKushki()');
        console.log(policyData);
        localStorage.setItem('policydata', JSON.stringify(policyData));

        this.router.navigate(['/extranet/policy/pago-kushki']);
        // } else {
        //     swal.fire('Información', 'Hubo un error en la inserción del detalle de la transacción. Comuníquese con soporte.', 'error');
        // }
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

    motivosAnulacion() {
        this.policyService.GetAnnulment().toPromise().then(
            (res: any) => {
                this.annulmentList = res;
            });
    }

    cancelDetail() {

        if (this.origin == 'policy') {
            this.router.navigate(['/extranet/policy-request']);

        } else {

            this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
        }
    }

    validateButtonProcess() {
        let flag = false;

        // ((mode !== 'Visualizar' && this.flagCipEmit == 1 
        // || status === 'APROBADO' && perfil != 137 && perfil != 153 && this.flagCipEmit == 1)  
        // && ( validate_button_action_perfil) )

        if (this.validate_button_action_perfil && this.flagCipEmit == 1) {
            if (this.mode !== 'Visualizar' && this.flagCipEmit == 1) {
                flag = true;
            }

            if (this.status == 'APROBADO') {
                if(!['137', '153'].includes(this.perfil)){
                    flag = true;
                }else{
                    flag = false;
                }              
            }else if(this.status.toUpperCase().includes("APROBADO PENSIÓN")){
                if (this.perfil = '137'){
                    flag = false;
                }
            }
        }

        return flag;
    }

    async getDetailRouteTransac(){
        let filesResponse;
        const filesRouteTransac: any = {};
        filesRouteTransac.nidCotizacion = CommonMethods.ConvertToReadableNumber(this.quotationNumber);
        filesRouteTransac.nidProc = this.quotationDataTra.NID_PROC !='' && this.quotationDataTra.NID_PROC != null ? this.quotationDataTra.NID_PROC : this.inputsQuotation.P_NID_PROC; //this.nroProcess;
        filesRouteTransac.filesEmitCab = this.filesTransacEmitcab;
        
        await this.policyService.getDetailRouteTransac(filesRouteTransac)
                .toPromise().then(async res => {
                    console.log(res)
                    filesResponse = res;
                });

        return filesResponse;
    }

    async getReversar(cotizacion, indicador) { //AVS - MEJORA ANULACION COTIZACION
        let flag = false;

        const data = { QuotationNumber: cotizacion, BranchNumber: this.nbranch, IndicadorReverse: indicador, Profile: this.codProfile };

        await this.quotationService.getValReversar(data).toPromise()
            .then(res => { flag = res.P_COD_ERR == 0 ? true : false; },
                error => { flag = false; }
            );

        return flag;

    }

    async reversar() { //AVS - MEJORA ANULACION COTIZACION
        this.isLoading = true;
        const data = { QuotationNumber: this.quotationNumber, BranchNumber: this.nbranch, IndicadorReverse: 1, Profile: this.codProfile };

        await this.quotationService.getValReversar(data).toPromise()
            .then(res => {
                if (res.P_COD_ERR == 1) {
                    this.isLoading = false;
                    swal.fire('Información', res.P_SMESSAGE, 'error');
                } else {
                    this.isLoading = false;
                    this.reverseMovementIncomplete();
                }

            },
                error => {
                    this.isLoading = false;
                    swal.fire('Información', 'Ocurrió un error al intentar validar el reverso', 'error');
                }
            );

    }

    reverseMovementIncomplete() {

        swal.fire({
            title: 'Información',
            text: '¿Deseas reversar los movimientos pendientes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Reversar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                var data: any = {
                    quotation: this.quotationNumber,
                    codBranch: this.pensionID.nbranch,
                    codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id']
                };

                this.quotationService.reverseMovementsIncomplete(data).subscribe(
                    res => {
                        this.isLoading = false;
                        if (res.codError == 0) {
                            this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                            swal.fire('Información', '' + res.desError, 'success');
                        } else {
                            swal.fire('Información', res.desError, 'error');
                        }

                    },
                    err => {
                        this.isLoading = false;
                        swal.fire('Información', 'Hubo un error al ejecutar el proceso', 'error');
                    }
                );
            }
        });
    }

    async saveLog(text1: string, text2: string, order: number){
        await this.LogService.save(text1, text2, order)
        .toPromise()
    }
}