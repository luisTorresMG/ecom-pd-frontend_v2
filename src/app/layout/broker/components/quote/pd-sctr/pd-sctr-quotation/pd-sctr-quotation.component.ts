
import { InputDateComponent } from '../../../../../../shared/components/input-date/input-date.component'
//Ini RQ2025-4
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
//Fin RQ2025-4
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// Importación de servicios
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import { AddressService } from '../../../../services/shared/address.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { ContractorLocationFormComponent } from '../../../maintenance/contractor-location/contractor-location-form/contractor-location-form.component';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';

// componentes para ser usados como MODAL
import { SearchContractingComponent } from '../../../../modal/search-contracting/search-contracting.component';
import { SearchBrokerComponent } from '../../../../modal/search-broker/search-broker.component';
import { AccessFilter } from './../../../access-filter';
import { ModuleConfig } from './../../../module.config';
import swal from 'sweetalert2';
import { QuotationCoverComponent } from '../../quotation-cover/quotation-cover.component';

// Util
import { CommonMethods } from './../../../common-methods';
import { ValidateLockReponse } from '../../../../interfaces/validate-lock-response';
import { CobranzasService } from '../../../../services/cobranzas/cobranzas.service';
import { ValidateLockRequest } from '../../../../models/collection/validate-lock-request';
import { ValidateDebtRequest } from '../../../../models/collection/validate-debt.request';
import { ValidateDebtReponse } from '../../../../interfaces/validate-debt-response';
import { GenAccountStatusRequest } from '../../../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../../../interfaces/gen-account-status-response';
import { OthersService } from '../../../../services/shared/others.service';
import { AddContactComponent } from '../../../../modal/add-contact/add-contact.component';
import { ToastrService } from 'ngx-toastr';
import { tryCatch } from 'rxjs/internal/util/tryCatch';
import { AccPersonalesService } from '../../acc-personales/acc-personales.service';
import { CommissionLotFilter } from '@root/layout/broker/models/commissionlot/commissionlotfilter';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';
//Ini RQ2025-4
import { PdSctrModule } from '../pd-sctr.module';
//Fin RQ2025-4

@Component({
    selector: 'app-pd-sctr-quotation',
    templateUrl: './pd-sctr-quotation.component.html',
    styleUrls: ['./pd-sctr-quotation.component.css']
})
export class PdSctrQuotationComponent implements OnInit {
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueIniMin: Date = new Date();
    bsValueFinMin: Date = new Date();
    bsValueFinMax: Date = new Date();

    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    saludID = JSON.parse(localStorage.getItem('saludID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    perfil = '';
    codFlat = '';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    codProfile: any;
    //epsItem = JSON.parse(sessionStorage.getItem('eps'))
    epsItem = JSON.parse(localStorage.getItem('eps'))
    lblProducto = '';
    lblFecha = '';

    statePrimaSalud = true;
    statePrimaPension = true;
    stateComision = true;
    stateQuotation = true;
    stateBrokerTasaSalud = true;
    stateBrokerTasaPension = true;
    blockDoc = true;
    blockSearch = true;
    stateSearch = false;
    messageWorker = '';
    maxlength = 8;
    minlength = 8;
    documentTypeList: any = [];
    currencyList: any = [];
    economicActivityList: any = [];
    technicalList: any = [];
    departmentList: any = [];
    provinceList: any = [];
    districtList: any = [];
    sedesList: any = [];
    savedPolicyList: any = [];
    inputsQuotation: any = {};
    savedPolicyEmit: any = {};
    files: File[] = [];
    archivoExcel: File;
    lastFileAt: Date;
    contratanteId = '';
    userId = 0;
    maxSize = 10485760;
    totalNetoSalud = 0;
    totalNetoPension = 0;
    igvSalud = 0;
    igvPension = 0;
    brutaTotalSalud = 0;
    brutaTotalPension = 0;
    flagDisableVL = 0;
    disabledFlat: any = [];
    totalNetoSaludSave = 0;
    totalNetoPensionSave = 0;
    igvSaludSave = 0;
    igvPensionSave = 0;
    brutaTotalSaludSave = 0;
    brutaTotalPensionSave = 0;
    cotizacionID: string = '';

    totalNetoSaludSave2: number = 0.0;
    totalNetoSaludSave3: number = 0.0;
    totalNetoSaludSave6: number = 0.0;

    igvSaludSave2: number = 0.0;
    igvSaludSave3: number = 0.0;
    igvSaludSave6: number = 0.0;
    igvSaludYear: number = 0.0;
    brutaTotalSaludSave2: any;
    brutaTotalSaludSave3: any;
    brutaTotalSaludSave6: any;
    brutaTotalSaludYear: any;

    resList: any = [];
    listaTasasSalud: any = [];
    infoSalud: any = []; // JDD
    listaTasasPension: any = [];
    infoPension: any = []; // JDD
    productList: any = [];
    EListClient: any = [];
    brokerList: any = [];
    tasasList: any = [];
    categoryList: any = [];
    rateByPlanList: any = [];
    detailPlanList: any = [];
    amountPremiumList: any = [];
    amountDetailTotalList: any = [];
    comisionList: any = []
    planesList: any = []
    municipalityTariff = 0
    discountPension = 0;
    discountSalud = 0;
    activityVariationPension = 0;
    activityVariationSalud = 0;
    commissionPension = 0;
    commissionSalud = 0;
    nidProc = '';
    comPropuestaSalud: boolean = false;
    comPropuestaPension: boolean = false;
    primMinimaPension: boolean = false;
    primMinimaSalud: boolean = false;
    comPropuesta: boolean = false;
    igvPensionWS: number = 0;
    igvSaludWS: number = 0;
    mensajePrimaPension = '';
    mensajePrimaSalud = '';
    activityMain = '';
    subActivity = '';
    inputsValidate: any = {};

    BrokerDep = []; //R.P.
    selectedDep = []; //R.P.
    BrokerObl = []; //R.P.
    reloadTariff = false;
    canProposeComission = true;
    canAddSecondaryBroker = true;
    canProposeMinimunPremium = true;
    canProposeRate = true;
    sedeId = '0';
    tasaVL: any = [];
    canTasaVL = true;
    excelSubir: File;
    clickValidarExcel = false;
    loading = false;
    erroresList: any = [];
    errorExcel = false;
    primatotalSCTR: number;
    primatotalSalud: number;
    totalSTRC: any;
    totalSalud: any;
    tipoRenovacion: any;
    frecuenciaPago: any;
    totalNetoPensionYear: number = 0;
    totalNetoSaludYear: number = 0;
    contractingdata: any;
    totalNetoPensionSave2: number = 0.0;
    totalNetoPensionSave3: number = 0.0;
    totalNetoPensionSave6: number = 0.0;
    igvVidaLeyWS: number = 0;
    igvPensionSave2: number = 0.0;
    igvPensionSave3: number = 0.0;
    igvPensionSave6: number = 0.0;
    igvPensionYear: number = 0.0;
    brutaTotalPensionSave2: any;
    brutaTotalPensionSave3: any;
    brutaTotalPensionSave6: any;
    brutaTotalPensionYear: any;
    btnCotiza: boolean = true;
    btnNormal: boolean = true;
    mensajeEquivalente: string = '';
    primaNetaM = 0;
    igvAccM = 0;
    primaTotalM = 0;
    primaNetaR = 0;
    igvAccR = 0;
    primaTotalR = 0;
    primaNeta = 0;
    igvAcc = 0;
    primaTotal = 0;
    template: any = {};
    variable: any = {};
    prima: any = {};
    canAddContractor = true;
    tipoEspecial = false;
    creditHistory: any = null;
    dayConfig: any = 0;
    dayRetroConfig: any = 0;
    nrocotizacion: any = 0; // MRC
    isRateProposed: boolean = false; // MRC
    arrayRateProposed = []; //MRC
    stateRecotiza: boolean = false; //MRC
    inputsContracting: any = {};
    dEmiPension = 0;
    dEmiSalud = 0;
    errorMessageBroker = 'Cliente no está registrado en PROTECTA, favor de comunicarse con el área canal corporativo';
    perfilActual: any;
    validateLockResponse: ValidateLockReponse = {};
    validateDebtResponse: ValidateDebtReponse = {};
    contactList: any = [];

    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    flagContact: boolean = false;
    flagEmail: boolean = false;

    typeTran = ''; // declaraciones VL - EH
    disTasaProp: boolean = false;// declaraciones VL - EH
    typeGobiernoMatriz = false;
    // variables de prueba para abrir modal de pagos
    modal: any = {};
    cotizacion: any = {};
    flagAprobCli: boolean = false;
    quotationDataTra: any;
    flagEnvioEmail = 0;
    planPropuesto: '';
    planList: any = [];
    descPlanBD: '';

    flagExc: boolean = false;

    perfilExterno = false;

    derivaRetroactividad: boolean = false;
    FechaEfectoInicial: Date;
    nroSalud: any;
    isDeclare: boolean = false;
    transaccionProtecta: any;
    transaccionMapfre: any;

    annulmentID: any = null
    nroPension: any;
    nroPoliza: any;

    nTransac: number = 0;
    sAbTransac: string = "";
    tipoEndoso: any = [];
    changeList: any = [];
    flagConfirm: any = 1;

    flagComerExclu: number = 0; //RQ - Perfil Nuevo - Comercial Exclusivo
    polCabDate: any;
    questionText: string;
    flagPolizaMat: boolean = false;
    // listFlagCategory: any = [{ 'ID': 1, 'flagEMP': false}, { 'ID': 2, 'flagOBR': false}, { 'ID': 3, 'flagOAR': false}, { 'ID': 4, 'flagEE': false}, { 'ID': 5, 'flagOE': false}, { 'ID': 6, 'flagOARE': false}];
    categoryPolizaMatList: any = [{ 'NCATEGORIA': '1', 'SCATEGORIA': 'Empleado', 'sactive': false }, { 'NCATEGORIA': '2', 'SCATEGORIA': 'Obrero', 'sactive': false },
    { 'NCATEGORIA': '3', 'SCATEGORIA': 'Obrero Alto Riesgo', 'sactive': false }, { 'NCATEGORIA': '5', 'SCATEGORIA': 'Empleado Excedente', 'sactive': false },
    { 'NCATEGORIA': '6', 'SCATEGORIA': 'Obrero Excedente', 'sactive': false }, { 'NCATEGORIA': '7', 'SCATEGORIA': 'Obrero Alto Riesgo Excedente', 'sactive': false }];

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
    flagGobiernoEstado: boolean = false;
    flagActivateExc = 0;
    chkTope = 0;
    // para calculos decimales cotizacion GT Estado -VL
    v_MontoSinIGVEMP = 0;
    v_MontoSinIGVOBR = 0;
    v_MontoSinIGVOAR = 0;
    v_MontoSinIGVEE = 0;
    v_MontoSinIGVOE = 0;
    v_MontoSinIGVOARE = 0;
    // INI AVS - INTERCONEXION SABSA 06/11/2023
    valMixSAPSA: any;
    listaEPS_SCTR_QUOT = [];
    dataQuotation_EPS: any = {};
    rmvList: any = [];
    flagGBD: boolean = false;
    flagCheckboxComisionPension: boolean = false;
    flagCheckboxComisionSalud: boolean = false;
    listaComisionTecnica: any = [];
    listaTasasTecnica: any = [];
    flagTasas = 0;
    flagClienteNuevo = 1;
    flagJuridico = false;
    flagTecnicaSalud = false;
    flagDelimiter = false;
    flagMina = false;
    flagPrimaMinimaSalud = 0;
    // FIN AVS - INTERCONEXION SABSA 06/11/2023
    codProcess = '';
    rateTypeList: any = [];
    // rulesList: any = [];
    flag_tasas = 1;

    constructor(
        private route: ActivatedRoute,
        private policyemit: PolicyemitService,
        private router: Router,
        private modalService: NgbModal,
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService,
        private addressService: AddressService,
        private contractorLocationIndexService: ContractorLocationIndexService,
        private collectionsService: CobranzasService,
        private datePipe: DatePipe,
        private accPersonalesService: AccPersonalesService,
        private othersService: OthersService,
        private toastr: ToastrService,
        private parameterSettingsService: ParameterSettingsService
    ) {
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
        const response: ValidateLockReponse = <ValidateLockReponse>{};

        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        //
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
        this.lblFecha = CommonMethods.tituloPantalla();

        this.inputsQuotation.NBRANCH = await CommonMethods.branchXproduct(this.codProducto); // DGC PERFILES 07/05/2024
        this.codProfile = await this.getProfileProduct(); // 20230325;
        this.perfilActual = await this.getProfileProduct(); // 20230325;
        //Perfil 32 de Petro Peru externo - AVS
        if (this.perfilActual == '32') {
            this.perfil = '32';
        } else {
            this.perfil = this.variable.var_prefilExterno;
        }

        //INI - RQ - Perfil Nuevo - Comercial Exclusivo
        if (this.perfilActual == '164' || this.perfilActual == '134' || this.perfilActual == '32') //Perfil Externo --Se adiciona perfil Broker PETROPERU - AVS
        {
            this.flagComerExclu = 1;
        }
        //FIN - RQ - Perfil Nuevo - Comercial Exclusivo

        if (this.template.ins_validaPermisos) {
            if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['quotation']) == false) {
                this.router.navigate(['/extranet/home']);
            }
            this.canProposeComission = AccessFilter.hasPermission('6');
            this.canAddSecondaryBroker = AccessFilter.hasPermission('7');
            this.canProposeMinimunPremium = AccessFilter.hasPermission('8');
            this.canProposeRate = AccessFilter.hasPermission('9');
            this.canAddContractor = AccessFilter.hasPermission('34');
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userId = currentUser['id'];

        this.inputsValidate = CommonMethods.generarCampos(30, 0);
        this.disabledFlat = CommonMethods.generarCampos(30, 1);
        this.inputsQuotation.P_TYPE_SEARCH = this.variable.var_tipoBusqueda; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = 2; // this.variable.var_tipoPersona; // Tipo persona
        this.inputsQuotation.P_WORKER = 0;
        this.inputsQuotation.P_NIDDOC_TYPE = '-1'; // Tipo de documento

        //this.inputsQuotation.NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
        await this.getDocumentTypeList();
        //await this.getProductList();
        await this.getTechnicalActivityList(this.codProducto);
        await this.getDepartmentList(null);
        await this.getIGVData();
        await this.obtenerTipoRenovacion();
        await this.getCurrencyList();
        await this.getDataConfig();
        //await this.getComisionList();
        await this.getPlanList();
        await this.getTypeEndoso();

        //  Broker R.P.
        await this.getDepartamento();
        await this.getBrokerObl();

        await this.getRateTypeList();

        this.inputsQuotation.primaMinimaPension = this.codProducto == 2 ? this.variable.var_primaMinimaPension : '';

        this.route.queryParams
            .subscribe(params => {
                this.inputsQuotation.P_NIDDOC_TYPE = params.typeDocument;
                this.inputsQuotation.P_SIDDOC = params.document;
                this.nrocotizacion = params.nroCotizacion;
                this.typeTran = params.typeTransac;
                this.SetTransac();
            });

        if (this.nrocotizacion == undefined) {
            await this.getComisionList(0);
        } else {
            await this.getComisionList(this.nrocotizacion);
        }

        if (this.inputsQuotation.P_NIDDOC_TYPE != undefined && this.inputsQuotation.P_SIDDOC != undefined && this.inputsQuotation.P_NIDDOC_TYPE != '' && this.inputsQuotation.P_SIDDOC != '') {
            this.buscarContratante();
            this.selTipoDocumento(this.inputsQuotation.P_NIDDOC_TYPE);
            this.cambioDocumento(this.inputsQuotation.P_SIDDOC);
        } else {
            // Datos Contratante
            this.inputsQuotation.P_NIDDOC_TYPE = '-1';
            this.inputsQuotation.P_SIDDOC = ''; // Nro de documento
            this.inputsQuotation.P_SFIRSTNAME = ''; // Nombre
            this.inputsQuotation.P_SLASTNAME = ''; // Apellido Paterno
            this.inputsQuotation.P_SLASTNAME2 = ''; // Apellido Materno
            this.inputsQuotation.P_SLEGALNAME = ''; // Razon social
            this.inputsQuotation.P_SE_MAIL = ''; // Email
            this.inputsQuotation.P_SDESDIREBUSQ = ''; // Direccion
            this.inputsQuotation.P_SISCLIENT_GBD = '';
            // Datos Cotización
            this.inputsQuotation.P_NPRODUCT = this.productList.length > 1 ? '-1' : this.inputsQuotation.P_NPRODUCT; // Producto
            this.inputsQuotation.P_NCURRENCY = this.variable.var_codMoneda; // Moneda
            this.inputsQuotation.P_NIDSEDE = null; // Sede
            this.inputsQuotation.P_NTECHNICAL = null; // Actividad tecnica
            this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
            this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
            this.inputsQuotation.P_MINA = false; // Delimitación check
            this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0
            this.inputsQuotation.P_NPROVINCE = null;
            this.inputsQuotation.P_NLOCAL = null;
            this.inputsQuotation.P_NMUNICIPALITY = null;
            this.inputsQuotation.P_PLANILLA = 0;

            this.inputsQuotation.P_COMISION_PRO = null;
            this.inputsQuotation.rateObrProposed = null;
            this.inputsQuotation.rateEmpProposed = null;
        }

        if (this.perfilActual == this.perfil || this.template.ins_iniciarBroker) {
            this.brokerIni();
        }

        this.variable.var_isBroker = false;
        if (this.perfilActual == this.perfil && this.codProducto == '3') {
            this.inputsContracting.EListAddresClient = [];
            this.inputsContracting.EListPhoneClient = [];
            this.inputsContracting.EListEmailClient = [];
            this.inputsContracting.EListContactClient = [];
            this.inputsContracting.EListCIIUClient = [];
            this.variable.var_isBroker = true;
        }

        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateIniMin = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);
        this.inputsQuotation.FDateFin.setDate(this.inputsQuotation.FDateFin.getDate() - this.variable.var_restarDias);
        this.bsValueIniMin = new Date();
        this.bsValueFinMin = this.inputsQuotation.FDateFin;
        this.inputsQuotation.P_COMISION = ''; // Comision
        this.inputsQuotation.tipoRenovacion = '';
        this.inputsQuotation.frecuenciaPago = '';

        if (this.template.ins_retroactividad) {
            if (this.template.ins_firstDay && this.variable.var_isBroker) {
                this.inputsQuotation.FDateIniMin.setDate(0);
                this.inputsQuotation.FDateIniMin.setDate(this.inputsQuotation.FDateIniMin.getDate() + 1);
            } else {
                this.inputsQuotation.FDateIniMin = new Date();
                this.inputsQuotation.FDateIniMin.setDate(this.inputsQuotation.FDateIniMin.getDate() - this.dayRetroConfig);
            }

            this.inputsQuotation.FDateIniFin = new Date();
            this.inputsQuotation.FDateIniFin.setDate(this.inputsQuotation.FDateIniFin.getDate() + this.dayConfig);
        }

        //cuando sea perfil externo
        if (this.perfil == this.perfilActual) {
            this.inputsQuotation.FDateIniMin = new Date();
            this.perfilExterno = true;
        }

        // Cotizador
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''; // Prima minima salud
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''; // Prima minima salud propuesta
        this.inputsQuotation.P_PRIMA_END_SALUD = ''; // Prima endoso salud
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''; // Prima minima pension
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = ''; // Prima minima pension propuesta
        this.inputsQuotation.P_PRIMA_END_PENSION = ''; // Prima endoso pension
        this.inputsQuotation.P_SCOMMENT = '';

        if (this.template.ins_recotizarCotizacion) {
            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                this.isLoading = true;
                this.stateSearch = true;
                this.stateRecotiza = true;
            }
        }

        CommonMethods.clearBack();
        this.FechaEfectoInicial = this.inputsQuotation.FDateIni;
        if (this.typeTran == "Declaración" || this.typeTran == "Inclusión") {
            this.disTasaProp = true;
        }

        this.inputsQuotation.P_NRATETYPE = this.rateTypeList.length > 0 ? this.rateTypeList[0].ncode_rate : 0; // Tipo de tasa
    }

    //Ini RQ2025-4
    @HostListener('window:resize')
    onResize() {
        this.renderDropDown();
    }

    renderDropDown() {
        setTimeout(() => {
            PdSctrModule.renderDropDown();
        }, 10);
    }
    //Fin RQ2025-4

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                    this.perfilActual = profile;
                    this.getProductList();
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }

    //R.P.
    async getDepartamento() {
        await this.clientInformationService.GetBrkDepartamento(this.inputsQuotation.NBRANCH, 1).toPromise().then(
            res => {
                this.BrokerDep = res;
            },
            err => {
            }
        );
    }

    async getBrokerObl() {
        await this.clientInformationService.GetBrkObl(this.inputsQuotation.NBRANCH).toPromise().then(
            res => {
                this.BrokerObl = res;
            },
            err => {
            }
        );
    }
    //R.P.

    async habilitarFechas() {
        await this.obtenerFrecuenciaPago(this.inputsQuotation.tipoRenovacion)

        if (this.template.ins_mapfre) {
            this.reloadTariff = false;
            this.equivalentMuni();
        }

        this.categoryList = [];
        this.rateByPlanList = [];
        this.inputsQuotation.P_COMISION = '';
    }

    async getDataConfig() {
        let configDias = ['DIASRETRO_EMISION', 'DIASADD_EMISION']

        for (var config of configDias) {
            let dias = await this.diasConfigurados(config)
            this.dayRetroConfig = config == configDias[0] ? dias : this.dayRetroConfig
            this.dayConfig = config == configDias[1] ? dias : this.dayConfig
        }
    }

    async diasConfigurados(config) {
        let response = 0
        await this.policyemit.getDataConfig(config).toPromise().then(
            res => {
                response = res[0] != undefined ? Number(res[0].SDATA) : 0
            },
            err => {
                response = 0
            }
        );
        return response
    }

    async obtenerTipoRenovacion() {
        const requestTypeRen: any = {}
        requestTypeRen.P_NEPS = this.epsItem.STYPE;
        requestTypeRen.P_NPRODUCT = this.codProducto;
        requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        if (this.cotizacionID == '0' || this.cotizacionID == '') { // INI POLIZAS ESPECIALES RI JTV 11102022
            requestTypeRen.P_ENABLED = 1;
        }
        else {
            requestTypeRen.P_ENABLED = 0;
        } // FIN POLIZAS ESPECIALES RI JTV 11102022

        await this.policyemit.getTipoRenovacion(requestTypeRen).toPromise().then(
            async (res: any) => {
                this.tipoRenovacion = res;
            })
    }

    async obtenerFrecuenciaPago(tipoRenovacion) {
        this.tipoEspecial = tipoRenovacion == 6 || tipoRenovacion == 7 ? true : false;
        await this.policyemit.getFrecuenciaPago(tipoRenovacion).toPromise().then(
            res => {
                this.inputsQuotation.frecuenciaPago = this.inputsQuotation.tipoRenovacion;
                this.frecuenciaPago = res;
                if (this.frecuenciaPago != null && this.frecuenciaPago.length == 1) {
                    this.inputsQuotation.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
                }
            })
    }

    async getComisionList(nrocotizacion: any) {
        await this.quotationService.getComisionList(nrocotizacion).subscribe(
            res => {
                this.comisionList = res;
            }
        );
    }

    async onSelectComision(value: any) {
        this.inputsQuotation.P_COMISION = value;
        this.categoryList = [];
        this.rateByPlanList = [];
    }

    async equivalenciaMapfre(codProtecta: any, keyTable: any, keyStore: any, required: any = 1) {
        let response: any = {}
        let data: any = {}
        data.codProtecta = codProtecta
        data.keyTable = keyTable
        data.keyStore = keyStore

        await this.quotationService.getEquivalente(data).toPromise().then(res => {
            response = res
            if (res.codError == '0') {
                this.mensajeEquivalente = ''
            } else {
                if (required == 1) {
                    this.mensajeEquivalente = this.mensajeEquivalente + '<br>' + res.mensaje;
                }
            }
        });
        return response.codMapfre
    }

    async brokerIni() {
        // Datos del comercializador
        const brokerMain: any = {}
        brokerMain.NTYPECHANNEL = JSON.parse(localStorage.getItem('currentUser'))['tipoCanal'];
        brokerMain.COD_CANAL = JSON.parse(localStorage.getItem('currentUser'))['canal'];
        brokerMain.NCORREDOR = JSON.parse(localStorage.getItem('currentUser'))['brokerId'];
        brokerMain.NTIPDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(1, 1);
        brokerMain.NNUMDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(3);
        brokerMain.RAZON_SOCIAL = JSON.parse(localStorage.getItem('currentUser'))['desCanal'];
        brokerMain.PROFILE = this.perfilActual;
        brokerMain.SCLIENT = JSON.parse(localStorage.getItem('currentUser'))['sclient'];
        brokerMain.P_NPRINCIPAL = 0;
        brokerMain.P_COM_SALUD = 0;
        brokerMain.P_COM_SALUD_PRO = 0;
        brokerMain.P_COM_PENSION = 0;
        brokerMain.P_COM_PENSION_PRO = 0;
        brokerMain.valItemPen = false;
        brokerMain.valItemSal = false;
        if (brokerMain.PROFILE == this.perfil) {
            brokerMain.BLOCK = 1;
        } else {
            brokerMain.BLOCK = 0;
        }

        //AVS - INTERCONEXION SABSA 23/10/2023
        const data: any = {};
        data.P_SCLIENT = JSON.parse(localStorage.getItem('currentUser'))['sclient'];
        data.P_TIPO = 2;
        await this.quotationService.getBrokerAgenciadosCTR(data).toPromise().then(async res => {
            if (res.SCLIENT != null) {
                brokerMain.NINTERMED = res.NINTERMED;
                brokerMain.NINTERTYP = res.NINTERTYP;
                brokerMain.SEMAILCLI = res.SEMAILCLI;
                brokerMain.SFIRSTNAME = res.SFIRSTNAME;
                brokerMain.SLASTNAME = res.SLASTNAME;
                brokerMain.SLASTNAME2 = res.SLASTNAME2;
                brokerMain.SPHONE1 = res.SPHONE1;
                brokerMain.SSTREET = res.SSTREET;
                brokerMain.NMUNICIPALITY = res.NMUNICIPALITY;
            }
        })

        if (brokerMain.PROFILE == 32 && this.brokerList.length == 0) {
            this.brokerList.push(brokerMain);
        }
        else if (brokerMain.PROFILE != 32) {
            this.brokerList.push(brokerMain);
        }

        //this.flagTecnicaSalud = Number(this.epsItem.NCODE) == 3 ? true : false; //AVS - INTERCONEXION SABSA
    }

    async brokerAgenciadoSCTR() { //AVS - INTERCONEXION SABSA 06/11/2023
        const data: any = {};
        data.P_SCLIENT = this.contratanteId;
        data.P_TIPO = 1;
        this.brokerList = [];
        //await this.ComisionesTecnicaEPS();
        await this.quotationService.getBrokerAgenciadosCTR(data).toPromise().then(async res => {
            if (res.SCLIENT != null && res.SCLIENT !== "") {
                const brokerMain: any = {}
                brokerMain.NTYPECHANNEL = res.NTYPECHANNEL;
                brokerMain.COD_CANAL = res.COD_CANAL;
                brokerMain.NINTERMED = res.NINTERMED;
                brokerMain.NINTERTYP = res.NINTERTYP;
                brokerMain.NCORREDOR = res.COD_CANAL;
                brokerMain.NTIPDOC = res.SCLIENT.substr(1, 1);
                brokerMain.NNUMDOC = res.NNUMDOC;
                brokerMain.RAZON_SOCIAL = res.SCLIENAME;
                brokerMain.PROFILE = this.perfilActual;
                brokerMain.SCLIENT = res.SCLIENT;
                brokerMain.P_NPRINCIPAL = 0;
                brokerMain.P_COM_SALUD = 0;
                brokerMain.P_COM_SALUD_PRO = 0;
                brokerMain.P_COM_PENSION = 0;
                brokerMain.P_COM_PENSION_PRO = 0;
                brokerMain.valItemPen = false;
                brokerMain.valItemSal = false;
                brokerMain.SEMAILCLI = res.SEMAILCLI;
                brokerMain.SFIRSTNAME = res.SFIRSTNAME;
                brokerMain.SLASTNAME = res.SLASTNAME;
                brokerMain.SLASTNAME2 = res.SLASTNAME2;
                brokerMain.SPHONE1 = res.SPHONE1;
                brokerMain.SSTREET = res.SSTREET;
                if (brokerMain.PROFILE == this.perfil) {
                    brokerMain.BLOCK = 1;
                } else {
                    brokerMain.BLOCK = 0;
                }
                brokerMain.NMUNICIPALITY = res.NMUNICIPALITY;
                this.brokerList.push(brokerMain);

                //this.flagTecnicaSalud = Number(this.epsItem.NCODE) == 3 ? true : false; //AVS - INTERCONEXION SABSA
            }
        })
    }

    async brokerRec() {
        this.brokerList = [];
        await this.policyemit.getPolicyEmitComer(this.nrocotizacion, 1)
            .toPromise().then(async res => {
                if (res != null && res.length > 0) {
                    res.forEach(element => {
                        const brokerMain: any = {}
                        brokerMain.NTYPECHANNEL = element.TIPO_CANAL;
                        brokerMain.COD_CANAL = element.CANAL;
                        brokerMain.NCORREDOR = JSON.parse(localStorage.getItem('currentUser'))['brokerId'];
                        brokerMain.NTIPDOC = element.TYPE_DOC_COMER;
                        brokerMain.NNUMDOC = element.DOC_COMER;
                        brokerMain.RAZON_SOCIAL = element.COMERCIALIZADOR;
                        brokerMain.PROFILE = this.perfilActual;
                        brokerMain.SCLIENT = element.SCLIENT;
                        brokerMain.P_NPRINCIPAL = 0;
                        brokerMain.P_COM_SALUD = 0;
                        brokerMain.P_COM_SALUD_PRO = 0;
                        brokerMain.P_COM_PENSION = 0;
                        brokerMain.P_COM_PENSION_PRO = 0;
                        brokerMain.valItemPen = false;
                        brokerMain.valItemSal = false;
                        if (brokerMain.PROFILE == this.perfil) {
                            brokerMain.BLOCK = 1;
                        } else {
                            brokerMain.BLOCK = 0;
                        }
                        brokerMain.NMUNICIPALITY = element.NMUNICIPALITY; //AVS - INTERCONEXION SABSA 06/11/2023
                        this.brokerList.push(brokerMain);

                        //this.flagTecnicaSalud = Number(this.epsItem.NCODE) == 3 ? true : false; //AVS - INTERCONEXION SABSA
                    });
                }
            });
    }

    async getIGVData() {
        let data = ['I', 'D']
        // Pension
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionID.nbranch;
            itemIGV.P_NPRODUCT = this.pensionID.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.igvPensionWS = item == 'I' ? res : this.igvPensionWS;
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension;
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
                    this.igvSaludWS = item == 'I' ? res : this.igvSaludWS;
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud;
                }
            );
        }

        // Vida  Ley
        let itemIGV: any = {};
        itemIGV.P_NBRANCH = this.vidaLeyID.nbranch;
        itemIGV.P_NPRODUCT = this.vidaLeyID.id;
        itemIGV.P_TIPO_REC = 'A';

        await this.quotationService.getIGV(itemIGV).toPromise().then(
            res => {
                this.igvVidaLeyWS = res
            }
        );
    }

    async getTechnicalActivityList(codProducto?: any) {
        await this.clientInformationService.getTechnicalActivityList(codProducto).toPromise().then(
            res => {
                this.technicalList = res;
            },
            err => {
            }
        );
    }

    async getProductList() {
        await this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.inputsQuotation.NBRANCH).toPromise().then(
            res => {
                this.productList = res;
                if (this.productList.length == 1) {
                    this.inputsQuotation.P_NPRODUCT = this.productList[0].COD_PRODUCT;
                } else {
                    this.inputsQuotation.P_NPRODUCT = '-1';
                }
                /* PREFILES -DGC - 30/04/2024 */
                if (this.perfilActual == '305' || this.perfilActual == '304') {
                    this.productList = this.productList.filter(x => x.COD_PRODUCT !== 1);
                    this.inputsQuotation.P_NPRODUCT = '-1';
                    // this.inputsQuotation.P_NPRODUCT = this.productList[0].COD_PRODUCT;
                }
                /* PREFILES -DGC - 30/04/2024 */
            },
            err => { }
        );
    }

    async getDocumentTypeList() {
        await this.clientInformationService.getDocumentTypeList(this.codProducto).toPromise().then(
            res => {
                this.documentTypeList = res;
            },
            err => {
            }
        );
    }

    async getCurrencyList() {
        await this.clientInformationService.getCurrencyList().toPromise().then(
            res => {
                this.currencyList = res;
            },
            err => {
            }
        );
    }

    async getPlanList() {
        const data = {
            P_NBRANCH: this.vidaLeyID.nbranch,
            P_NPRODUCT: this.vidaLeyID.id,
            P_NTIP_RENOV: 0,
            P_NCURRENCY: this.inputsQuotation.P_NCURRENCY == null ? 1 : this.inputsQuotation.P_NCURRENCY,
            P_NIDPLAN: 0
        }

        await this.quotationService.getPlans(data).toPromise().then(
            res => {
                this.planList = res;
                this.inputsQuotation.desTipoPlanPM = this.planList[0].SDESCRIPT.toUpperCase(); // VL - Poliza Matriz
            },
            err => {
            }
        );
    }

    async getEconomicActivityList(acTecnica) {
        await this.clientInformationService.getEconomicActivityList(acTecnica).toPromise().then(
            res => {
                this.economicActivityList = res;

                // if(Number(this.epsItem.NCODE) == 3){ //AVS - INTERCONEXION SABSA // AGF PARA TEXTO "La actividad cuenta con delimitación"
                //     for (let item of this.economicActivityList) {
                //         item.Delimiter = '0';
                //     }
                // }
            },
            err => {
            }
        );
    }

    async getDepartmentList(itemDireccion) {
        if (itemDireccion != null) {
            await this.addressService.getDepartmentList().toPromise().then(
                res => {
                    if (itemDireccion.P_NPROVINCE != null) {
                        itemDireccion.P_NPROVINCE = Number(itemDireccion.P_NPROVINCE);
                    } else {
                        res.forEach(element => {
                            if (element.Name == itemDireccion.P_DESDEPARTAMENTO) {
                                itemDireccion.P_NPROVINCE = element.Id;
                            }
                        });
                    }
                },
                err => { }
            );
        } else {
            await this.addressService.getDepartmentList().toPromise().then(
                res => {
                    this.departmentList = res;
                },
                err => {
                }
            );
        }
    }

    async getProvinceList(itemDireccion) {
        if (itemDireccion != null) {
            if (itemDireccion.P_NPROVINCE != null && itemDireccion.P_NPROVINCE != '') {
                return await this.addressService.getProvinceList(itemDireccion.P_NPROVINCE).toPromise().then(
                    res => {
                        if (itemDireccion.P_NLOCAL != null) {
                            itemDireccion.P_NLOCAL = Number(itemDireccion.P_NLOCAL);
                        } else {
                            res.forEach(element => {
                                if (itemDireccion.P_DESPROVINCIA.search('CALLAO') !== -1) {
                                    itemDireccion.P_NLOCAL = element.Id;
                                } else {
                                    if (element.Name == itemDireccion.P_DESPROVINCIA) {
                                        itemDireccion.P_NLOCAL = element.Id;
                                    }
                                }
                            });
                        }
                    },
                    err => { }
                );
            } else {
                return itemDireccion.P_NLOCAL = null;
            }
        } else {
            const province = this.inputsQuotation.P_NPROVINCE == null ? '0' : this.inputsQuotation.P_NPROVINCE;
            return await this.addressService.getProvinceList(province).toPromise().then(
                res => {
                    this.provinceList = res;
                },
                err => {
                }
            );
        }
    }

    async getDistrictList(itemDireccion) {
        if (itemDireccion != null) {
            if (itemDireccion.P_NLOCAL != null && itemDireccion.P_NLOCAL != '') {
                return await this.addressService.getDistrictList(itemDireccion.P_NLOCAL).toPromise().then(
                    res => {
                        if (itemDireccion != null) {
                            if (itemDireccion.P_NMUNICIPALITY != null) {
                                itemDireccion.P_NMUNICIPALITY = Number(itemDireccion.P_NMUNICIPALITY);
                            } else {
                                res.forEach(element => {
                                    if (element.Name == itemDireccion.P_DESDISTRITO) {
                                        itemDireccion.P_NMUNICIPALITY = element.Id;
                                    }
                                });
                            }
                        }
                    },
                    err => { }
                );
            } else {
                return itemDireccion.P_NMUNICIPALITY = null
            }
        } else {
            let local = this.inputsQuotation.P_NLOCAL == null ? '0' : this.inputsQuotation.P_NLOCAL;
            return await this.addressService.getDistrictList(local).toPromise().then(
                res => {
                    this.districtList = res;
                },
                err => {
                }
            );
        }
    }

    resetearPropuesto(resetId) {
        switch (resetId) {
            case 1:
                this.statePrimaSalud = !this.statePrimaSalud;
                this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = '';
                this.resetearPrimas(0, this.infoSalud)
                break;
            case 2:
                // console.log('CASE 2');
                this.statePrimaPension = !this.statePrimaPension;
                this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = '';
                // console.log('this.pensionID.id');
                // console.log(this.pensionID.id);
                this.resetearPrimas(0, this.infoPension)
                break;
            case 3:
                this.stateBrokerTasaSalud = !this.stateBrokerTasaSalud;
                this.flagCheckboxComisionSalud = this.comPropuestaSalud;
                this.resetearComisiones(this.saludID.id)
                break;
            case 4:
                this.stateBrokerTasaPension = !this.stateBrokerTasaPension;
                this.flagCheckboxComisionPension = this.comPropuestaPension;
                this.resetearComisiones(this.pensionID.id)
                break;
            case 5: //
                this.stateComision = !this.stateComision;
        }
    }

    resetearComisiones(productoId) {
        this.brokerList.forEach(broker => {
            broker.P_COM_SALUD_PRO = productoId == this.saludID.id ? 0 : broker.P_COM_SALUD_PRO
            broker.valItemSal = productoId == this.saludID.id ? false : broker.valItemSal
            broker.P_COM_PENSION_PRO = productoId == this.pensionID.id ? 0 : broker.P_COM_PENSION_PRO
            broker.valItemPen = productoId == this.pensionID.id ? false : broker.valItemPen
        });
    }

    validateContracting() {
        let error = '';
        if (this.inputsQuotation.P_TYPE_SEARCH == 1) {
            if (this.inputsQuotation.P_NIDDOC_TYPE == -1 || this.inputsQuotation.P_SIDDOC.trim() == '') {
                if (this.inputsQuotation.P_NIDDOC_TYPE == -1) {
                    error += 'Debe ingresar tipo de documento <br />';
                }
                if (this.inputsQuotation.P_SIDDOC.trim() == '') {
                    error += 'Debe ingresar número de documento <br />';
                }
            } else {
                if (this.inputsQuotation.P_NIDDOC_TYPE == 1 && this.inputsQuotation.P_SIDDOC.trim().length > 1) {
                    if (CommonMethods.validateRuc(this.inputsQuotation.P_SIDDOC)) {
                        error += 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20';
                    }
                }
            }
        } else {
            if (this.inputsQuotation.P_PERSON_TYPE == 1) {
                if (this.inputsQuotation.P_SFIRSTNAME.trim() == '') {
                    error += 'Debe ingresar nombre del contratante <br />';
                }
                if (this.inputsQuotation.P_SLASTNAME.trim() == '') {
                    error += 'Debe ingresar apellido paterno del contratante <br />';
                }
            } else {
                if (this.inputsQuotation.P_SLEGALNAME.trim() == '') {
                    error += 'Debe ingresar razón social <br />';
                }
            }
        }

        return error;
    }

    async validateContractingLock() {
        if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_validateLock) {
            const validateLockReq = new ValidateLockRequest();
            validateLockReq.branchCode = this.pensionID.nbranch;
            validateLockReq.productCode = this.pensionID.id;
            validateLockReq.documentType = this.inputsQuotation.P_NIDDOC_TYPE;
            validateLockReq.documentNumber = this.inputsQuotation.P_SIDDOC;
            this.validateLockResponse = await this.getValidateLock(validateLockReq);
        }
    }

    async generateRequestCDatos() {
        const data: any = {}
        data.P_TIPOPER = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE != '-1' ? this.inputsQuotation.P_NIDDOC_TYPE : '';
        data.P_SIDDOC = this.inputsQuotation.P_SIDDOC.toUpperCase();
        data.P_SFIRSTNAME = this.inputsQuotation.P_SFIRSTNAME != null ? this.inputsQuotation.P_SFIRSTNAME.toUpperCase() : '';
        data.P_SLASTNAME = this.inputsQuotation.P_SLASTNAME != null ? this.inputsQuotation.P_SLASTNAME.toUpperCase() : '';
        data.P_SLASTNAME2 = this.inputsQuotation.P_SLASTNAME2 != null ? this.inputsQuotation.P_SLASTNAME2.toUpperCase() : '';
        data.P_SLEGALNAME = this.inputsQuotation.P_SLEGALNAME != null ? this.inputsQuotation.P_SLEGALNAME.toUpperCase() : '';
        data.P_NBRANCH = this.inputsQuotation.NBRANCH;

        if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_mapfre) {
            data.validaMapfre = {};
            data.validaMapfre.cabecera = {};
            data.validaMapfre.cabecera.keyService = 'validarCliente';
            data.validaMapfre.cliente = {};
            data.validaMapfre.cliente.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //
            data.validaMapfre.cliente.codDocum = this.inputsQuotation.P_SIDDOC; //
        }

        // if (this.mensajeEquivalente != '') {
        //     swal.fire('Información', this.mensajeEquivalente, 'error');
        //     self.isLoading = false;
        //     return;
        // }

        return data;
    }

    async buscarContratante() {

        let msg = this.validateContracting();

        if (msg != '') {
            swal.fire('Información', msg, 'error');
            return;
        }

        this.isLoading = true;
        const data: any = await this.generateRequestCDatos();
        console.log('data', data);

        if (this.inputsQuotation.P_TYPE_SEARCH == 1) {
            await this.validateContractingLock();

            if (this.validateLockResponse.lockMark == 1) {
                swal.fire('Información', this.validateLockResponse.observation, 'error');
                this.isLoading = false;
                this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                return;
            }
        }

        let dataQuality = await this.validateContractingData(data);
        console.log('dataQuality', dataQuality)

        if (dataQuality.P_NCODE == 0 || dataQuality.P_NCODE == 3) {

            this.contratanteId = '';
            // this.flagJuridico = dataQuality.EListClient.length > 0 ? (dataQuality.EListClient[0].P_SIDDOC.substr(0, 2) === '20' ? true : false) : false; //AVS - INTERCONEXION SABSA

            if (dataQuality.EListClient.length > 0) {
                if (dataQuality.EListClient.length == 1) {
                    if (dataQuality.EListClient[0].P_SCLIENT == null) {
                        this.contractorCreationProcess(dataQuality);
                    } else {
                        this.contractorNormalProcess(dataQuality);
                    }

                    if (this.contratanteId != '') {

                        if (this.template.ins_validateDebt) {
                            this.validationDebtAccountStatus();
                        }

                        await this.EstadoCliente(this.contratanteId);
                    }

                } else {
                    this.isLoading = false;
                    this.EListClient = dataQuality.EListClient;
                    const modalRef = this.modalService.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                    modalRef.componentInstance.formModalReference = modalRef;
                    modalRef.componentInstance.EListClient = this.EListClient;

                    modalRef.result.then(async (ContractorData) => {
                        if (ContractorData != undefined) {
                            this.onSelectEconomicActivity(null);
                            this.contractingdata = ContractorData;
                            console.log(this.contractingdata);
                            this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
                            this.inputsQuotation.P_PERSON_TYPE = '2';
                            this.inputsQuotation.P_SLEGALNAME = '';
                            this.inputsQuotation.P_SFIRSTNAME = '';
                            this.inputsQuotation.P_SLASTNAME = '';
                            this.inputsQuotation.P_SLASTNAME2 = '';
                            this.inputsQuotation.P_SE_MAIL = '';

                            this.inputsQuotation.P_NIDDOC_TYPE = this.contractingdata.P_NIDDOC_TYPE;
                            this.inputsQuotation.P_SIDDOC = this.contractingdata.P_SIDDOC;

                            this.blockSearch = true;
                            this.stateSearch = false;

                            const data: any = await this.generateRequestCDatos();
                            console.log('data', data);

                            if (this.inputsQuotation.P_TYPE_SEARCH == 1) {
                                await this.validateContractingLock();
                                1
                                if (this.validateLockResponse.lockMark == 1) {
                                    swal.fire('Información', this.validateLockResponse.observation, 'error');
                                    this.isLoading = false;
                                    this.router.navigate(['/extranet/request-status']);
                                    return;
                                }
                            }

                            let dataQuality = await this.validateContractingData(data);
                            console.log('dataQuality', dataQuality)

                            if (dataQuality.P_NCODE == 0) {
                                this.contratanteId = '';
                                if (dataQuality.EListClient.length > 0) {
                                    this.contractorNormalProcess(dataQuality);
                                    if (this.contratanteId != '') {

                                        if (this.template.ins_validateDebt) {
                                            this.validationDebtAccountStatus();
                                        }

                                        await this.EstadoCliente(this.contratanteId);
                                    }
                                }
                            } else {
                                swal.fire('Información', dataQuality.P_SMESSAGE, 'error');
                                this.isLoading = false;
                            }

                        }

                    }, (reason) => {
                    });
                }

            } else {
                this.isLoading = false;
                swal.fire('Información', "No hay información con los parámetros enviados", 'error');
            }

        }else {
            swal.fire('Información', dataQuality.P_SMESSAGE, 'error');
            this.isLoading = false;
        }


        // const self = this;
        // let msg = '';
        // this.mensajeEquivalente = '';

        // if (this.inputsQuotation.P_TYPE_SEARCH == 1) {
        //     if (this.inputsQuotation.P_NIDDOC_TYPE == -1) {
        //         msg += 'Debe ingresar tipo de documento <br />';
        //     }
        //     if (this.inputsQuotation.P_SIDDOC.trim() == '') {
        //         msg += 'Debe ingresar número de documento <br />';
        //     }
        // } else {
        //     if (this.inputsQuotation.P_PERSON_TYPE == 1) {
        //         if (this.inputsQuotation.P_SFIRSTNAME.trim() == '') {
        //             msg += 'Debe ingresar nombre del contratante <br />';
        //         }
        //         if (this.inputsQuotation.P_SLASTNAME.trim() == '') {
        //             msg += 'Debe ingresar apellido paterno del contratante <br />';
        //         }
        //     } else {
        //         if (this.inputsQuotation.P_SLEGALNAME.trim() == '') {
        //             msg += 'Debe ingresar razón social <br />';
        //         }
        //     }
        // }

        // if (msg != '') {
        //     swal.fire('Información', msg, 'error');
        //     return;
        // }

        // const isValidRuc = CommonMethods.validateRuc(this.inputsQuotation.P_SIDDOC);


        // if (this.inputsQuotation.P_NIDDOC_TYPE == 1 && this.inputsQuotation.P_SIDDOC.trim().length > 1) {
        //     if (CommonMethods.validateRuc(this.inputsQuotation.P_SIDDOC)) {
        //         swal.fire('Información', 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20', 'error');
        //         return;
        //     }
        // }

        // self.isLoading = true;
        // const data: any = {}
        // data.P_TipOper = 'CON';
        // data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        // data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE != '-1' ? this.inputsQuotation.P_NIDDOC_TYPE : '';
        // data.P_SIDDOC = this.inputsQuotation.P_SIDDOC.toUpperCase();
        // data.P_SFIRSTNAME = this.inputsQuotation.P_SFIRSTNAME != null ? this.inputsQuotation.P_SFIRSTNAME.toUpperCase() : '';
        // data.P_SLASTNAME = this.inputsQuotation.P_SLASTNAME != null ? this.inputsQuotation.P_SLASTNAME.toUpperCase() : '';
        // data.P_SLASTNAME2 = this.inputsQuotation.P_SLASTNAME2 != null ? this.inputsQuotation.P_SLASTNAME2.toUpperCase() : '';
        // data.P_SLEGALNAME = this.inputsQuotation.P_SLEGALNAME != null ? this.inputsQuotation.P_SLEGALNAME.toUpperCase() : '';

        // Mapfre
        // if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_mapfre) {
        //     data.validaMapfre = {};
        //     data.validaMapfre.cabecera = {};
        //     data.validaMapfre.cabecera.keyService = 'validarCliente';
        //     data.validaMapfre.cliente = {};
        //     data.validaMapfre.cliente.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //
        //     data.validaMapfre.cliente.codDocum = this.inputsQuotation.P_SIDDOC; //
        // }

        // if (this.mensajeEquivalente != '') {
        //     swal.fire('Información', this.mensajeEquivalente, 'error');
        //     self.isLoading = false;
        //     return;
        // }

        // if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_validateLock) {
        //     const validateLockReq = new ValidateLockRequest();
        //     validateLockReq.branchCode = this.pensionID.nbranch;
        //     validateLockReq.productCode = this.pensionID.id;
        //     validateLockReq.documentType = this.inputsQuotation.P_NIDDOC_TYPE;
        //     validateLockReq.documentNumber = this.inputsQuotation.P_SIDDOC;
        //     this.validateLockResponse = await this.getValidateLock(validateLockReq);
        // }

        // if (this.validateLockResponse.lockMark == 1) {
        //     swal.fire('Información', this.validateLockResponse.observation, 'error');
        //     self.isLoading = false;
        //     this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
        //     return;
        // }

        // await this.clientInformationService.getCliente360(data).toPromise().then(
        //     async res => {
        //         this.contratanteId = '';
        //         this.flagJuridico = res.EListClient.length > 0 ? (res.EListClient[0].P_SIDDOC.substr(0, 2) === '20' ? true : false) : false; //AVS - INTERCONEXION SABSA

        //         if (res.P_NCODE == 0) {
        //             if (res.EListClient.length == 0) {
        //                 this.canTasaVL = true;
        //                 this.stateQuotation = true;
        //                 this.activityMain = '';
        //                 this.subActivity = '';
        //                 this.economicActivityList = null;
        //                 if (this.inputsQuotation.P_SIDDOC != '') {
        //                     this.clearinputsCotizacion();
        //                     if (this.canAddContractor) {
        //                         if (this.inputsQuotation.P_NIDDOC_TYPE != '1' && this.inputsQuotation.P_NIDDOC_TYPE != '2') {
        //                             await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
        //                         } else {
        //                             swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                         }
        //                     } else {
        //                         swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                     }
        //                 } else {
        //                     swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                 }

        //             } else {
        //                 if (res.EListClient[0].P_SCLIENT == null) {
        //                     this.canTasaVL = true;
        //                     this.stateQuotation = true;
        //                     this.activityMain = ''
        //                     this.subActivity = ''



        //                     /*if ((res.EListClient[0].P_SCONDDOMICILIO == 'HABIDO' && res.EListClient[0].P_SESTADOCONTR == 'ACTIVO' && this.flagJuridico) || !this.flagJuridico) { //AVS - INTERCONEXION SABSA
        //                         if (this.canAddContractor) {
        //                             if (this.variable.var_isBroker) {
        //                                 await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, res);
        //                             } else {
        //                                 await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
        //                             }
        //                         } else {
        //                             swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                         }
        //                     } else {
        //                         swal.fire('Información', 'El RUC ' + res.EListClient[0].P_SIDDOC + ' no está activo o habilitado en la SUNAT. Por favor, verifica que la información sea correcta.', 'error');
        //                     }*/ //CFCM COMENTADO

        //                     //CFCM AGREGADO
        //                     if (this.canAddContractor) {
        //                         if (this.variable.var_isBroker) {
        //                             await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, res);
        //                         } else {
        //                             await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
        //                         }
        //                     } else {
        //                         swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                     }
        //                 } else {
        //                     if (res.EListClient.length == 1) {
        //                         if (res.EListClient[0].P_SIDDOC != null) {
        //                             /*if ((res.EListClient[0].P_SCONDDOMICILIO == 'HABIDO' && res.EListClient[0].P_SESTADOCONTR == 'ACTIVO' && this.flagJuridico) || !this.flagJuridico) { //AVS - INTERCONEXION SABSA
        //                                 this.EListClient = res.EListClient;
        //                                 await this.cargarDatosCliente(res);
        //                             } else {
        //                                 swal.fire('Información', 'El RUC ' + res.EListClient[0].P_SIDDOC + ' no está activo o habilitado en la SUNAT. Por favor, verifica que la información sea correcta.', 'error');
        //                             }*/ //CFCM COMENTADO

        //                             //CFCM AGREGADO
        //                             this.EListClient = res.EListClient;
        //                             await this.cargarDatosCliente(res);

        //                         } else {
        //                             swal.fire('Información', 'El contratante no cuenta con el nro de documento.', 'error');
        //                         }
        //                     } else {
        //                         this.EListClient = res.EListClient;
        //                         const modalRef = this.modalService.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        //                         modalRef.componentInstance.formModalReference = modalRef;
        //                         modalRef.componentInstance.EListClient = this.EListClient;

        //                         modalRef.result.then(async (ContractorData) => {
        //                             if (ContractorData != undefined) {
        //                                 this.onSelectEconomicActivity(null);
        //                                 this.contractingdata = ContractorData;
        //                                 this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        //                                 this.inputsQuotation.P_PERSON_TYPE = '2';
        //                                 this.inputsQuotation.P_SLEGALNAME = '';
        //                                 this.inputsQuotation.P_SFIRSTNAME = '';
        //                                 this.inputsQuotation.P_SLASTNAME = '';
        //                                 this.inputsQuotation.P_SLASTNAME2 = '';
        //                                 this.inputsQuotation.P_SE_MAIL = '';
        //                                 if (this.template.ins_sede) {
        //                                     this.stateQuotation = false;
        //                                 }
        //                                 this.blockSearch = true;
        //                                 this.stateSearch = false;


        //                                 const data: any = {};
        //                                 data.P_TipOper = 'CON';
        //                                 data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        //                                 data.P_NIDDOC_TYPE = ContractorData.P_NIDDOC_TYPE;
        //                                 data.P_SIDDOC = ContractorData.P_SIDDOC;

        //                                 // Mapfre
        //                                 if (this.template.ins_mapfre) {
        //                                     data.validaMapfre = {};
        //                                     data.validaMapfre.cabecera = {};
        //                                     data.validaMapfre.cabecera.keyService = 'validarCliente';
        //                                     data.validaMapfre.cliente = {};
        //                                     data.validaMapfre.cliente.tipDocum = await this.equivalenciaMapfre(ContractorData.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey');   //
        //                                     data.validaMapfre.cliente.codDocum = ContractorData.P_SIDDOC; //
        //                                 }

        //                                 this.clientInformationService.getCliente360(data).subscribe(
        //                                     res => {
        //                                         if (res.P_NCODE == 0) {
        //                                             this.cargarDatosCliente(res);
        //                                         } else {
        //                                             this.inputsQuotation.P_TYPE_SEARCH = '1';
        //                                             this.blockDoc = true;
        //                                             this.clearinputsCotizacion();
        //                                             swal.fire('Información', res.P_SMESSAGE, 'error');
        //                                         }
        //                                     },
        //                                     err => {
        //                                         this.inputsQuotation.P_TYPE_SEARCH = '1';
        //                                         this.clearinputsCotizacion();
        //                                     }
        //                                 );
        //                             }
        //                         }, (reason) => {
        //                         });
        //                     }

        //                 }
        //             }
        //         } else if (res.P_NCODE == 3) {
        //             this.canTasaVL = true;
        //             this.stateQuotation = true;
        //             this.clearinputsCotizacion();
        //             if (this.variable.var_isBroker) {
        //                 swal.fire('Error', this.errorMessageBroker, 'error');
        //                 this.creditHistory = null;
        //             } else {
        //                 if (this.canAddContractor) {
        //                     if (this.inputsQuotation.P_NIDDOC_TYPE != '1' && this.inputsQuotation.P_NIDDOC_TYPE != '2') {
        //                         this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
        //                     } else {
        //                         if (this.codProfile == 32 || this.codProducto == 2) { //AVS - INTERCONEXION SABSA 07/07/2023
        //                             this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
        //                         } else {
        //                             swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                             this.creditHistory = null;
        //                         }
        //                     }
        //                 } else {
        //                     swal.fire('Información', this.variable.var_noInformacion360, 'error');
        //                     this.creditHistory = null;
        //                 }
        //             }
        //         } else {
        //             this.inputsQuotation.P_TYPE_SEARCH = '1';
        //             this.blockDoc = true;
        //             this.clearinputsCotizacion();
        //             swal.fire('Información', res.P_SMESSAGE, 'error');
        //         }

        //         await this.EstadoCliente(this.contratanteId);
        //         self.isLoading = false;
        //     },
        //     err => {
        //         this.contratanteId = '';
        //         self.isLoading = false;
        //         swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
        //     }
        // );

        // //AVS - Intercionexion SAPSA - se comenta por incompatibilidad 25/05/2023
        // if (this.template.ins_validateDebt && this.contratanteId != '') {
        //     //AVS Mejoras SCTR Deudas
        //     this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.typeTran == 'Inclusión' ? 2 : this.typeTran == "Renovación" || this.typeTran == "Declaración" ? 4 : 1); //Recotizacion

        //     if (this.validateDebtResponse.lockMark != 0) {
        //         if (Number(this.perfilActual) == Number(this.perfil)) {
        //             //AVS Mejoras SCTR Deudas
        //             await this.generateAccountStatusExterno(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
        //                 self.isLoading = false;
        //             });
        //         } else {
        //             // AVS Mejoras SCTR
        //             await this.generateAccountStatus(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.variable.var_accountStatusCode).then(() => {
        //                 self.isLoading = false;
        //             });
        //         }
        //     } else {
        //         self.isLoading = false;
        //     }
        // }
    }

    async validationDebtAccountStatus() {
        // let transacCode = this.typeTran == 'Inclusión' ? 2 : this.typeTran == "Renovación" || this.typeTran == "Declaración" ? 4 : 1;
        this.validateDebtResponse = await this.getValidateDebt(); //Recotizacion

        if (this.validateDebtResponse.lockMark != 0) {
            if (Number(this.perfilActual) == Number(this.perfil)) {
                //AVS Mejoras SCTR Deudas
                await this.generateAccountStatusExterno().then(() => {
                    this.isLoading = false;
                });
            } else {
                // AVS Mejoras SCTR
                await this.generateAccountStatus().then(() => {
                    this.isLoading = false;
                });
            }
        } else {
            this.isLoading = false;
        }
    }

    async contractorNormalProcess(data: any) {

        if (data.EListClient[0].P_SIDDOC != null) {
            this.EListClient = data.EListClient;
            await this.cargarDatosCliente(data);
        } else {
            swal.fire('Información', 'El contratante no cuenta con el nro de documento.', 'error');
        }

        this.isLoading = false;

        // await this.clientInformationService.getCliente360(data).toPromise().then(
        //     async res => {
        //         if (res.P_NCODE == 0) {
        //             if (res.EListClient.length == 1) {

        //             }
        //         }

        //         this.isLoading = false;
        //     },
        //     err => {
        //         // this.contratanteId = '';
        //         this.isLoading = false;
        //         swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
        //     }
        // );

    }

    async contractorCreationProcess(res: any) {

        this.canTasaVL = true;
        this.stateQuotation = true;
        this.activityMain = '';
        this.subActivity = '';

        if (this.canAddContractor) {
            if (this.variable.var_isBroker) {
                await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, res);
            } else {
                await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
            }
        } else {
            swal.fire('Información', this.variable.var_noInformacion360, 'error');
        }

    }

    async validateContractingData(data: any): Promise<any> {

        if (this.inputsQuotation.P_TYPE_SEARCH == "1") {
            let request: any = {
                P_TIPOPER: data.P_TIPOPER,
                P_NIDDOC_TYPE: data.P_NIDDOC_TYPE,
                P_SIDDOC: data.P_SIDDOC,
                P_NBRANCH: this.inputsQuotation.NBRANCH
            };

            // Simplificación: Retorna directamente la respuesta de la promesa
            return this.clientInformationService.validateContractingData(request).toPromise();
        } else {
            let request: any = {
                P_TIPOPER: data.P_TIPOPER,
                P_SLEGALNAME: data.P_SLEGALNAME,
                P_SFIRSTNAME: data.P_SFIRSTNAME,
                P_SLASTNAME: data.P_SLASTNAME,
                P_SLASTNAME2: data.P_SLASTNAME2
            };

            return this.clientInformationService.getCliente360(request).toPromise();
        }
    }

    async getAddress(): Promise<void> {
        let numdir = 1;
        if (this.inputsContracting.EListAddresClient.length > 0) {
            for (const item of this.inputsContracting.EListAddresClient) {
                item.P_NROW = numdir++;
                item.P_CLASS = '';
                item.P_DESTIDIRE = 'PARTICULAR';
                item.P_SRECTYPE = item.P_SRECTYPE == '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
                item.P_STI_DIRE = item.P_STI_DIRE == '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
                item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION == '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
                item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
                item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
                item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
                item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY == '' ? '1' : item.P_NCOUNTRY;
                await this.getDepartmentList(item);
                await this.getProvinceList(item);
                await this.getDistrictList(item);
                item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION == '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
                if (this.inputsContracting.P_NIDDOC_TYPE == 1) {
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ == '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                }
            }
        }
    }

    async agregaContratante(documentType, documentNumber, receiverStr, ncode, response) {
        if (this.variable.var_isBroker) {
            this.inputsContracting = response.EListClient[0];
            this.inputsContracting.P_NBRANCH = this.inputsQuotation.NBRANCH;
            this.inputsContracting.EListAddresClient = response.EListClient[0].EListAddresClient;
            this.inputsContracting.EListAddresClient.length > 0 ? await this.getAddress() : this.inputsContracting.EListAddresClient = [];
            this.inputsContracting.EListPhoneClient = [];
            this.inputsContracting.EListEmailClient = [];
            this.inputsContracting.EListContactClient = [];
            this.inputsContracting.EListCIIUClient = [];
            this.inputsContracting.P_CodAplicacion = 'SCTR';
            this.inputsContracting.P_TipOper = 'INS';
            this.inputsContracting.P_NSPECIALITY = '99';
            this.inputsContracting.P_SBLOCKADE = '2';
            this.inputsContracting.P_NTITLE = '99';
            this.inputsContracting.P_NNATIONALITY = '1';
            this.inputsContracting.P_SBLOCKLAFT = '2';
            this.inputsContracting.P_SISCLIENT_IND = '2';
            this.inputsContracting.P_SISRENIEC_IND = '1';
            this.inputsContracting.P_SPOLIZA_ELECT_IND = '2';
            this.inputsContracting.P_SPROTEG_DATOS_IND = '2';
            this.inputsContracting.P_SISCLIENT_GBD = '2';
            this.inputsContracting.P_SISCLIENT_CONTRA = '1';
            this.inputsContracting.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            this.inputsContracting.P_NBRANCH = this.inputsQuotation.NBRANCH;

            if (this.inputsContracting.EListAddresClient.length > 0) {
                this.isLoading = true;
                await this.clientInformationService.insertContractingData(this.inputsContracting).toPromise().then(
                    async res => {
                        if (res.P_NCODE === '0') {
                            const data: any = {};
                            data.P_TipOper = 'CON';
                            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                            data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE != '-1' ? this.inputsQuotation.P_NIDDOC_TYPE : '';
                            data.P_SIDDOC = this.inputsQuotation.P_SIDDOC.toUpperCase();
                            data.P_SFIRSTNAME = this.inputsQuotation.P_SFIRSTNAME != null ? this.inputsQuotation.P_SFIRSTNAME.toUpperCase() : '';
                            data.P_SLASTNAME = this.inputsQuotation.P_SLASTNAME != null ? this.inputsQuotation.P_SLASTNAME.toUpperCase() : '';
                            data.P_SLASTNAME2 = this.inputsQuotation.P_SLASTNAME2 != null ? this.inputsQuotation.P_SLASTNAME2.toUpperCase() : '';
                            data.P_SLEGALNAME = this.inputsQuotation.P_SLEGALNAME != null ? this.inputsQuotation.P_SLEGALNAME.toUpperCase() : '';
                            data.P_NBRANCH = this.inputsQuotation.NBRANCH;

                            await this.clientInformationService.validateContractingData(data).toPromise().then(
                                async res => {
                                    if (res.P_NCODE == 0) {
                                        if (res.EListClient.length == 1) {
                                            await this.cargarDatosCliente(res);
                                        }
                                    }
                                    // this.isLoading = false;
                                }
                            );
                        } else if (res.P_NCODE === '1') {
                            // this.isLoading = false;
                            swal.fire('Información', this.errorMessageBroker, 'error');
                        } else {
                            // this.isLoading = false;
                            swal.fire('Información', this.errorMessageBroker, 'warning');
                        }
                        this.isLoading = false;
                    }
                );
            } else {
                this.isLoading = false;
                swal.fire('Información', this.errorMessageBroker, 'error');
            }

        } else {
            this.isLoading = false;
            swal.fire({
                title: 'Información',
                text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: documentType, document: documentNumber, receiver: receiverStr, code: ncode, nbranch: this.inputsQuotation.NBRANCH } });
                }
            });
        }
    }


    async cargarDatosCliente(res) {
        this.contractingdata = res.EListClient[0];
        this.canTasaVL = this.template.ins_disabledComision;
        this.onSelectEconomicActivity(null);
        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = '2';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SE_MAIL = '';
        this.inputsQuotation.P_SISCLIENT_GBD =
            (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
        this.blockSearch = true;
        this.stateSearch = false;

        const inputsQuotationGBD: any = {};
        inputsQuotationGBD.P_SISCLIENT_GBD =
            (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
        localStorage.setItem('inputsquotation', JSON.stringify(inputsQuotationGBD));

        this.contratanteId = this.contractingdata.P_SCLIENT;
        this.inputsQuotation.P_NIDDOC_TYPE = this.contractingdata.P_NIDDOC_TYPE;
        this.inputsQuotation.P_SIDDOC = this.contractingdata.P_SIDDOC;
        this.inputsQuotation.P_NPENDIENTE = res.P_NPENDIENTE;
        if (this.contractingdata.P_NIDDOC_TYPE == 1 && this.contractingdata.P_SIDDOC.length > 1) {
            if (this.contractingdata.P_SIDDOC.substr(0, 2) == '10' || this.contractingdata.P_SIDDOC.substr(0, 2) == '15' || this.contractingdata.P_SIDDOC.substr(0, 2) == '17') {
                this.blockDoc = true;
            } else {
                this.blockDoc = false;
            }
        }
        this.inputsQuotation.P_SFIRSTNAME = this.contractingdata.P_SFIRSTNAME;
        this.inputsQuotation.P_SLEGALNAME = this.contractingdata.P_SLEGALNAME;
        this.inputsQuotation.P_SLASTNAME = this.contractingdata.P_SLASTNAME;
        this.inputsQuotation.P_SLASTNAME2 = this.contractingdata.P_SLASTNAME2;
        if (this.contractingdata.EListAddresClient.length > 0) {
            this.inputsQuotation.P_SDESDIREBUSQ = this.contractingdata.EListAddresClient[0].P_SDESDIREBUSQ;
        }
        if (this.contractingdata.EListEmailClient.length > 0) {
            this.inputsQuotation.P_SE_MAIL = this.contractingdata.EListEmailClient[0].P_SE_MAIL;
        }

        if (this.contractingdata.EListContactClient.length == 0 && this.template.ins_addContact) {
            this.flagContact = true;
        }

        if (this.contractingdata.EListEmailClient.length == 0 && this.template.ins_email) {
            this.flagEmail = true;
        } else if (this.contractingdata.EListEmailClient[0].P_SE_MAIL == undefined || this.contractingdata.EListEmailClient[0].P_SE_MAIL == null ||
            this.contractingdata.EListEmailClient[0].P_SE_MAIL != undefined || this.contractingdata.EListEmailClient[0].P_SE_MAIL != null) { //INTERCONEXION SABSA 11/08/2023 - AVS
            this.flagEmail = true;
        }

        if (this.template.ins_sede) {
            this.getContractorLocationList(this.contratanteId);
        }

        if (this.template.ins_historialCreditoQuotation) {
            const data: any = {};
            data.tipoid = this.inputsQuotation.P_NIDDOC_TYPE == '1' ? '2' : '1';
            data.id = this.inputsQuotation.P_SIDDOC;
            data.papellido = this.inputsQuotation.P_SLASTNAME;
            data.sclient = this.contratanteId;
            data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
                res => {
                    this.creditHistory = {};
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                }
            );
        } else {
            this.creditHistory = {};
            this.creditHistory.nflag = 0;
        }

        if (this.perfilActual != '32' && this.perfilActual != '134') {
            this.brokerAgenciadoSCTR(); //AVS - PRY INTERCONEXION SABSA 10/07/2023
        }

        this.changeBillType();
    }

    async getContractorLocationList(contratanteId: string) {
        await this.contractorLocationIndexService.getContractorLocationList(contratanteId, 999, 1).toPromise().then(
            res => {
                const list: any = [];
                const self = this;

                if (res.GENERICLIST != null) {
                    if (res.GENERICLIST.length > 0) {
                        this.stateQuotation = false;

                        res.GENERICLIST.forEach(sede => {
                            if (sede.State == 'Activo') {
                                list.push(sede);
                                if (sede.Type == self.variable.var_tipoSede) {
                                    self.inputsQuotation.P_NIDSEDE = Number(sede.Id);
                                    self.inputsQuotation.P_NPROVINCE = Number(sede.Departament);
                                    self.inputsQuotation.P_NLOCAL = Number(sede.Province);
                                    self.inputsQuotation.P_NMUNICIPALITY = Number(sede.Municipality);
                                    self.inputsQuotation.P_SSEDE = sede.Description;
                                }
                            }
                        });

                        this.sedesList = list;
                        this.onSelectSede();
                        if (this.productList.length > 1) {
                            this.inputsQuotation.P_NPRODUCT = '-1';
                        }
                    } else {
                        if (this.productList.length > 1) {
                            this.inputsQuotation.P_NPRODUCT = '-1';
                        }
                        this.stateQuotation = true;
                    }
                } else {
                    if (this.productList.length > 1) {
                        this.inputsQuotation.P_NPRODUCT = '-1';
                    }
                    this.stateQuotation = true;
                }
            },
            err => {
            }
        );
    }

    // onSelectSede() {
    //     this.inputsQuotation.P_WORKER = 0;
    //     switch (this.inputsQuotation.P_NIDSEDE) {
    //         case null:
    //             this.inputsQuotation.P_NTECHNICAL = null;
    //             this.inputsQuotation.P_NECONOMIC = null;
    //             this.inputsQuotation.P_NPROVINCE = null;
    //             this.inputsQuotation.P_NLOCAL = null;
    //             this.inputsQuotation.P_NMUNICIPALITY = null;
    //             break;
    //         case 0:
    //             this.inputsValidate[2] = false
    //             this.inputsQuotation.P_NTECHNICAL = null;
    //             this.inputsQuotation.P_NECONOMIC = null;
    //             this.inputsQuotation.P_NPROVINCE = null;
    //             this.inputsQuotation.P_NLOCAL = null;
    //             this.inputsQuotation.P_NMUNICIPALITY = null
    //             this.validarSedes();
    //             break;
    //         default:
    //             this.inputsValidate[2] = false
    //             this.economicValue(this.inputsQuotation.P_NIDSEDE);
    //             break;
    //     }
    // }

    onSelectSede() {
        this.inputsQuotation.P_WORKER = 0;
        this.onSelectProducto(null);
        switch (this.inputsQuotation.P_NIDSEDE) {
            case null:
                this.clearQuotationInputs();
                break;
            case 0:
                this.inputsValidate[2] = false;
                this.clearQuotationInputs();
                this.validarSedes();
                break;
            default:
                this.inputsValidate[2] = false;
                this.economicValue(this.inputsQuotation.P_NIDSEDE);
                break;
        }
    }

    private clearQuotationInputs() {
        this.inputsQuotation.P_NTECHNICAL = null;
        this.inputsQuotation.P_NECONOMIC = null;
        this.inputsQuotation.P_NPROVINCE = null;
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
    }

    onSelectDepartment() {
        this.inputsValidate[4] = false
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.getProvinceList(null);
        this.getDistrictList(null);
    }

    // onSelectTypeSearch() {
    //     this.clearinputsCotizacion();
    //     switch (this.inputsQuotation.P_TYPE_SEARCH) {
    //         case '1':
    //             this.blockSearch = true;
    //             this.inputsQuotation.P_NIDDOC_TYPE = '-1';
    //             this.inputsQuotation.P_SIDDOC = '';
    //             this.inputsQuotation.P_PERSON_TYPE = '2';
    //             this.stateSearch = false;
    //             this.blockDoc = true;

    //             break;

    //         case '2':
    //             this.blockSearch = false;
    //             this.inputsQuotation.P_NIDDOC_TYPE = '-1';
    //             this.inputsQuotation.P_SIDDOC = '';
    //             this.inputsQuotation.P_PERSON_TYPE = '2';
    //             this.stateSearch = true;
    //             this.blockDoc = false;
    //             break;
    //     }
    // }

    onSelectTypeSearch() {
        this.clearinputsCotizacion();

        const isTypeOne = this.inputsQuotation.P_TYPE_SEARCH === '1';

        this.blockSearch = isTypeOne;
        this.inputsQuotation.P_NIDDOC_TYPE = '-1';
        this.inputsQuotation.P_SIDDOC = '';
        this.inputsQuotation.P_PERSON_TYPE = '2';
        this.stateSearch = !isTypeOne;
        this.blockDoc = !isTypeOne;
    }

    onSelectProvince() {
        this.inputsValidate[5] = false
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.getDistrictList(null);
    }

    onSelectDistrict() {
        if (this.inputsQuotation.P_NMUNICIPALITY == null) {
        } else {
            this.inputsValidate[6] = false
            this.equivalentMuni();
        }
    }

    async obtRMV() { //AVS - INTERCONEXION SABSA 06/11/2023
        var fecha = this.formatDate(new Date()).toString();
        await this.quotationService.obtRMV(fecha).toPromise().then(
            res => {
                this.rmvList = res;
            }
        );
    }

    formatDate(date: Date): string { //AVS - INTERCONEXION SABSA 06/11/2023
        let anio = date.getFullYear();
        let mes = date.getMonth() + 1;
        let dia = date.getDate();
        return `${dia}/${mes}/${anio}`;
    }

    // async calcularTarifa() {

    //     let countWorker = 0;
    //     let countPlanilla = 0;
    //     let msg = '';
    //     //await this.obtRMV();

    //     // No se ingresa ningun valor
    //     this.tasasList.forEach(item => {
    //         if (item.totalWorkes == 0) {
    //             this.inputsValidate[8] = false
    //             countWorker++
    //         } else {
    //     if (item.planilla == 0) {
    //         msg += 'Debe ingresar monto de planilla del riesgo ' + item.description + ' <br>'
    //     }/*else if ( this.rmvList.P_RMV == 0) {
    //         msg += 'No se encuentra configurado la RMV del producto. Comunicarse con soporte.'+' <br>' 
    //     }else if(this.rmvList.P_RMV_MITAD > 0 && item.planilla < this.rmvList.P_RMV_MITAD){
    //         msg += 'El monto de la planilla debe ser mayor o igual al 50% de la RMV. '+' <br>' + '(RMV = S/. ' + this.rmvList.P_RMV + ')'+' <br>'
    //     }*/
    // }

    //         if (item.planilla == 0) {
    //             this.inputsValidate[9] = false
    //             countPlanilla++;
    //         } else {
    //             if (item.totalWorkes == 0) {
    //                 msg += 'Debe ingresar trabajadores en el riesgo ' + item.description + ' <br>'
    //             }
    //         }
    //     });

    //     if (this.inputsQuotation.P_NECONOMIC == null) {
    //         msg += 'Debe elegir una sub-actividad válidad <br>'
    //     }

    //     if (msg != '') {
    //         swal.fire('Información', msg, 'error');
    //         return;
    //     } else {
    //         // Falta algún valor
    //         if (countPlanilla == this.tasasList.length) {
    //             msg += 'Debe ingresar un monto de planilla en al menos un riesgo <br>'
    //         }

    //         if (countWorker == this.tasasList.length) {
    //             msg += 'Debe ingresar trabajadores en al menos un riesgo <br>'
    //         }

    //         if (msg != '') {
    //             swal.fire('Información', msg, 'error');
    //             return;
    //         } else {
    //             this.reloadTariff = true
    //             this.flagTasas = 1;
    //             await this.equivalentMuni();
    //         }
    //     }
    // }

    async calcularTarifa() {
        let countWorker = 0;
        let countPlanilla = 0;
        let msg = '';

        // Validaciones en tasasList
        this.tasasList.forEach(item => {
            const hasWorkers = item.totalWorkes > 0;
            const hasPlanilla = item.planilla > 0;

            if (!hasWorkers) {
                this.inputsValidate[8] = false;
                countWorker++;
            } else {
                if (!hasPlanilla) {
                    msg += `Debe ingresar monto de planilla del riesgo ${item.description} <br>`;
                }
            }

            if (!hasPlanilla) {
                this.inputsValidate[9] = false;
                countPlanilla++;
            } else {
                if (!hasWorkers) {
                    msg += `Debe ingresar trabajadores en el riesgo ${item.description} <br>`;
                }
            }
        });

        // Validación de sub-actividad
        if (this.inputsQuotation.P_NECONOMIC == null) {
            msg += 'Debe elegir una sub-actividad válida <br>';
        }

        // Verificación de errores
        if (msg) {
            swal.fire('Información', msg, 'error');
            return;
        }

        // Validación final
        if (countPlanilla === this.tasasList.length) {
            msg += 'Debe ingresar un monto de planilla en al menos un riesgo <br>';
        }

        if (countWorker === this.tasasList.length) {
            msg += 'Debe ingresar trabajadores en al menos un riesgo <br>';
        }

        if (msg) {
            swal.fire('Información', msg, 'error');
            return;
        }

        // Todo válido
        this.reloadTariff = true;
        this.flagTasas = 1;
        await this.equivalentMuni();
    }

    // async equivalentMuni() {
    //     if (this.template.ins_llamarTarifario) {
    //         this.listaTasasSalud = []
    //         this.listaTasasPension = []
    //         this.mensajePrimaPension = ''
    //         this.mensajePrimaSalud = ''

    //         if (this.template.ins_mapfre) {
    //             if (this.inputsQuotation.tipoRenovacion == '') {
    //                 return;
    //             }
    //         }

    //         if (this.brokerList.length > 0 && this.inputsQuotation.P_NMUNICIPALITY != null && this.inputsQuotation.P_NTECHNICAL != null) {
    //             await this.quotationService.equivalentMunicipality(this.inputsQuotation.P_NMUNICIPALITY).toPromise().then(
    //                 async res => {
    //                     this.municipalityTariff = res;
    //                     await this.getTarifario();
    //                 }
    //             );
    //         } else {
    //             this.tasasList = []
    //             this.messageWorker = ''
    //             this.reloadTariff = false
    //         }
    //     }
    // }

    async equivalentMuni() {
        if (!this.template.ins_llamarTarifario) return;

        this.resetTariffData();

        if (this.template.ins_mapfre && this.inputsQuotation.tipoRenovacion === '') {
            return;
        }

        const { P_NMUNICIPALITY, P_NTECHNICAL } = this.inputsQuotation;

        if (this.brokerList.length > 0 && P_NMUNICIPALITY != null && P_NTECHNICAL != null) {
            try {
                this.municipalityTariff = await this.quotationService.equivalentMunicipality(P_NMUNICIPALITY).toPromise();
                await this.getTarifario();
            } catch (error) {
                console.error('Error fetching municipality tariff:', error);
                // Manejo de errores opcional
            }
        } else {
            this.resetTariffList();
        }
    }

    resetTariffData() {
        this.listaTasasSalud = [];
        this.listaTasasPension = [];
        this.mensajePrimaPension = '';
        this.mensajePrimaSalud = '';
    }

    resetTariffList() {
        this.tasasList = [];
        this.messageWorker = '';
        this.reloadTariff = false;
    }

    // async economicValue(sedeID) {
    //     let self = this;
    //     this.sedesList.map(function (dato) {
    //         if (dato.Id == sedeID) {
    //             self.inputsQuotation.P_NTECHNICAL = dato.IdTechnical;
    //             self.inputsQuotation.P_NECONOMIC = dato.IdActivity;
    //             self.inputsQuotation.P_SDELIMITER = dato.Delimiter;
    //             self.inputsQuotation.P_NPROVINCE = Number(dato.Departament);
    //             self.inputsQuotation.P_NLOCAL = Number(dato.Province);
    //             self.inputsQuotation.P_NMUNICIPALITY = Number(dato.Municipality);
    //             self.inputsQuotation.P_SSEDE = dato.Description
    //             self.activityMain = dato.Activity;
    //             self.subActivity = dato.EconomicActivity;
    //         }
    //     });

    //     await this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
    //     this.inputsQuotation.P_DELIMITER = this.inputsQuotation.P_SDELIMITER == '0' ? '' : '* La actividad cuenta con delimitación';
    //     await this.getProvinceList(null);
    //     await this.getDistrictList(null);
    //     await this.equivalentMuni();
    // }

    async economicValue(sedeID) {
        const selectedSede = this.sedesList.find(dato => dato.Id === sedeID);

        if (selectedSede) {
            this.setQuotationInputs(selectedSede);
            this.activityMain = selectedSede.Activity;
            this.subActivity = selectedSede.EconomicActivity;

            await this.updateEconomicData();
        }
    }

    setQuotationInputs(dato) {
        this.inputsQuotation.P_NTECHNICAL = dato.IdTechnical;
        this.inputsQuotation.P_NECONOMIC = dato.IdActivity;
        this.inputsQuotation.P_SDELIMITER = dato.Delimiter;
        this.inputsQuotation.P_NPROVINCE = Number(dato.Departament);
        this.inputsQuotation.P_NLOCAL = Number(dato.Province);
        this.inputsQuotation.P_NMUNICIPALITY = Number(dato.Municipality);
        this.inputsQuotation.P_SSEDE = dato.Description;
    }

    async updateEconomicData() {
        await this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
        // this.inputsQuotation.P_DELIMITER = await this.validateDelimitationRules();
        await this.getProvinceList(null);
        await this.getDistrictList(null);
        await this.equivalentMuni();
    }

    async validateDelimitationRules() {
        // let sdelimiter = '';

        if (this.inputsQuotation.P_NPRODUCT != 2) {
            let data: any = {
                scodProcess: this.codProcess,
                ntechnical: this.inputsQuotation.P_NTECHNICAL,
                ncot_mixta: this.inputsQuotation.P_NPRODUCT == 0 ? 1 : 0,
                nproduct: this.inputsQuotation.P_NPRODUCT == 0 ? 1 : this.inputsQuotation.P_NPRODUCT,
                sclient_type: this.inputsQuotation.P_SISCLIENT_GBD,
                ntype_valid: 1,
                stransac: 'EM'
            };

            await this.quotationService.getValidateDelimitationRules(data).toPromise().then(
                res => {
                    this.inputsQuotation.P_DELIMITER = res.ncode == 1 ? '* ' + res.smessage : '';
                });

        } else {
            this.inputsQuotation.P_DELIMITER = this.inputsQuotation.P_SDELIMITER === '0' ? '' : '* La actividad cuenta con delimitación';
        }

        // return sdelimiter;
    }


    // validarSedes() {
    //     this.contractorLocationIndexService.getSuggestedLocationType(this.contratanteId, this.userId).subscribe(
    //         res => {
    //             if (res.P_NCODE == 1) {
    //                 swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
    //             } else {
    //                 let location: any = {}//solo para enviar el ID de contratante
    //                 location.ContractorId = this.contratanteId; //solo para enviar el ID de contratante
    //                 if (res.P_NCODE == 2) this.openLocationModal(location, false, '2'); //crear sucursal
    //                 else if (res.P_NCODE == 3) this.openLocationModal(location, false, '1'); //crear principal
    //             }
    //         },
    //         err => {
    //             swal.fire('Información', err, 'error');
    //         }
    //     );
    // }

    validarSedes() {
        this.contractorLocationIndexService.getSuggestedLocationType(this.contratanteId, this.userId)
            .subscribe(
                res => this.handleLocationResponse(res),
                err => this.handleError(err)
            );
    }

    handleLocationResponse(res) {
        if (res.P_NCODE === 1) {
            this.showErrorMessage(res.P_SMESSAGE);
        } else {
            this.openLocationModalWithCode(res.P_NCODE);
        }
    }

    showErrorMessage(message) {
        const formattedMessage = this.listToString(this.stringToList(message));
        swal.fire('Información', formattedMessage, 'error');
    }

    openLocationModalWithCode(code) {
        const location = { ContractorId: this.contratanteId }; // Solo para enviar el ID de contratante

        if (code === 2) {
            this.openLocationModal(location, false, '2'); // Crear sucursal
        } else if (code === 3) {
            this.openLocationModal(location, false, '1'); // Crear principal
        }
    }

    handleError(error) {
        swal.fire('Información', error, 'error');
    }

    openLocationModal(contractorLocation: any, openModalInEditMode: boolean, suggestedLocationType: string) {
        const modalRef = this.modalService.open(ContractorLocationFormComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.contractorLocationData = contractorLocation;
        modalRef.componentInstance.openedInEditMode = openModalInEditMode;
        modalRef.componentInstance.suggestedLocationType = suggestedLocationType;
        modalRef.componentInstance.willBeSaved = true;

        modalRef.result.then(async (shouldToUpdateLocationTable) => {
            await this.getContractorLocationList(this.contratanteId);

            await this.equivalentMuni();
            await this.onSelectSede();
            await this.getProvinceList(null);
            await this.getDistrictList(null);
        });
    }

    listToString(inputList: String[]): string {
        let output = '';
        inputList.forEach(function (item) {
            output = output + item + ' <br>'
        });
        return output;
    }

    stringToList(inputString: string): string[] {
        let isFirst: Boolean = true;
        let responseList: string[] = [];
        while (inputString.search('-') != -1) {
            if (isFirst == true) {
                isFirst = false;
                inputString = inputString.substring(inputString.search('-') + 1);
            } else {
                responseList.push(inputString.substring(0, inputString.search('-')));
                inputString = inputString.substring(inputString.search('-') + 1);
            }
        }
        return responseList;
    }

    async onSelectTechnicalActivity(event) {
        this.economicActivityList = null;
        this.inputsQuotation.P_DELIMITER = '';
        this.inputsQuotation.P_WORKER = 0;
        this.inputsQuotation.P_NECONOMIC = null;
        this.onSelectProducto(null);
        if (this.inputsQuotation.P_NTECHNICAL != null) {
            this.activityMain = event.Name;
            await this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
        } else {
            this.activityMain = '';
            this.subActivity = '';
            this.inputsValidate[3] = false
        }
    }

    onSelectEconomicActivity(event) {
        if (this.inputsQuotation.P_NECONOMIC != null) {
            this.inputsQuotation.P_DELIMITER = this.economicActivityList[0].Delimiter == '0' ? '' : '* La actividad cuenta con delimitación ';

            if (this.inputsQuotation.P_NPRODUCT == "0") { // Ambos
                this.inputsQuotation.P_DELIMITER = this.economicActivityList[0].Delimiter == '0' ? '' : '* La actividad cuenta con delimitación (Solo Pensión)';
            };
            if (event != null) {
                this.subActivity = event.Name;
            }
            this.equivalentMuni();
        } else {
            this.subActivity = '';
            this.inputsQuotation.P_DELIMITER = '';
            this.inputsValidate[3] = false
        }
    }

    clearValidate(numInput) {
        this.inputsValidate[numInput] = false
    }

    selTipoDocumento(tipoDocumento) {
        this.blockDoc = true;
        this.clearinputsCotizacion();
        let response = CommonMethods.selTipoDocumento(tipoDocumento)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
        this.inputsValidate[0] = response.inputsValidate

    }

    // onSelectTypePerson(typePersonID) {
    //     this.inputsQuotation.P_SFIRSTNAME = '';
    //     this.inputsQuotation.P_SLEGALNAME = '';
    //     this.inputsQuotation.P_SLASTNAME = '';
    //     this.inputsQuotation.P_SLASTNAME2 = '';
    //     this.inputsQuotation.P_SDESDIREBUSQ = '';
    //     this.inputsQuotation.P_SE_MAIL = '';

    //     switch (typePersonID) {
    //         case '1':
    //             this.blockDoc = true;
    //             break;
    //         case '2':
    //             this.blockDoc = false;
    //             break;
    //     }
    // }

    onSelectTypePerson(typePersonID) {
        this.clearPersonInputs();
        this.blockDoc = typePersonID === '1';
    }

    clearPersonInputs() {
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SDESDIREBUSQ = '';
        this.inputsQuotation.P_SE_MAIL = '';
    }


    // clearInputPolMat() {
    //     if (!this.flagPolizaMat) {
    //         this.countinputEMP = 0;
    //         this.planillainputEMP = 0;
    //         this.tasainputEMP = 0;
    //         this.MontoSinIGVEMP = 0;
    //         this.countinputOBR = 0;
    //         this.planillainputOBR = 0;
    //         this.tasainputOBR = 0;
    //         this.MontoSinIGVOBR = 0;
    //         this.countinputOAR = 0;
    //         this.planillainputOAR = 0;
    //         this.tasainputOAR = 0;
    //         this.MontoSinIGVOAR = 0;
    //     }
    //     if (this.inputsQuotation.P_NREM_EXC == false) {
    //         this.countinputEE = 0;
    //         this.planillainputEE = 0;
    //         this.tasainputEE = 0;
    //         this.MontoSinIGVEE = 0;
    //         this.countinputOE = 0;
    //         this.planillainputOE = 0;
    //         this.tasainputOE = 0;
    //         this.MontoSinIGVOE = 0;
    //         this.countinputOARE = 0;
    //         this.planillainputOARE = 0;
    //         this.tasainputOARE = 0;
    //         this.MontoSinIGVOARE = 0;
    //     }
    //     this.changeFPMontoSinIGV();
    // }

    // validarTrama(codComission?: any) {
    //     this.errorExcel = false;
    //     this.isLoading = true;
    //     const myFormData: FormData = new FormData();

    //     myFormData.append('dataFile', this.isRateProposed ? null : this.excelSubir);

    //     const data: any = {};
    //     data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //     data.fechaEfecto = this.typeTran == 'Inclusión' ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : this.typeTran == 'Exclusión' ? CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion) : this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear();
    //     data.fechaFin = this.inputsQuotation.FDateFin.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateFin.getFullYear();
    //     data.comision = this.inputsQuotation.P_COMISION;
    //     data.tipoRenovacion = this.inputsQuotation.tipoRenovacion;
    //     data.freqPago = this.inputsQuotation.frecuenciaPago;
    //     data.codProducto = this.inputsQuotation.P_NPRODUCT;
    //     data.flagCot = codComission == null ? this.variable.var_flagCotN : codComission == 99 ? this.variable.var_flagCotF : this.variable.var_flagCotN;
    //     data.codActividad = this.inputsQuotation.P_NTECHNICAL;
    //     data.flagComisionPro = this.comPropuesta ? '1' : '0';
    //     data.planesList = this.template.ins_planesList ? this.tasaVL : null; // AP
    //     data.comisionPro = 0;
    //     data.codProceso = this.typeTran == 'Exclusión' ? this.nidProc : this.isRateProposed ? this.nidProc : '';
    //     data.flagPolizaEmision = this.isRateProposed ? 1 : null;
    //     data.codRamo = this.inputsQuotation.NBRANCH;
    //     //cotizacion
    //     data.categoryList = this.categoryList; //cotizacion
    //     data.remExc = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //rq Exc EH

    //     data.type_mov = this.nTransac; // this.typeTran == 'Inclusión' ? "2" : this.typeTran == 'Endoso' ? "8" : this.typeTran == "Renovación" || this.typeTran == "Declaración" ? "4" : "1";
    //     data.nroCotizacion = this.nrocotizacion;
    //     data.fechaExpiracion = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
    //     data.TYPE_ENDOSO = this.inputsQuotation.P_NTYPE_END == '' ? 0 : this.inputsQuotation.P_NTYPE_END;
    //     data.NCURRENCY = this.inputsQuotation.P_NCURRENCY;

    //     //Exclusion
    //     data.nroPoliza = Number(this.codProducto) === 3 ? this.nroPoliza : '';
    //     data.fechaExpiracion = Number(this.codProducto) === 3 ? CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg) : '';
    //     data.excludeType = Number(this.codProducto) === 3 ? this.inputsQuotation.primaCobrada === true ? '1' : '0' : '';

    //     myFormData.append('objValida', JSON.stringify(data));

    //     this.quotationService.valTrama(myFormData).subscribe(
    //         async res => {
    //             this.isLoading = false;
    //             this.erroresList = res.baseError.errorList;
    //             this.changeList = res.baseError.changeList;
    //             if (res.P_COD_ERR == '1') {
    //                 swal.fire('Información', res.P_MESSAGE, 'error');
    //             } else {
    //                 if (this.erroresList != null) {
    //                     if (this.erroresList.length > 0) {
    //                         this.listaTasasPension = [];
    //                         this.tasasList = [];
    //                         this.inputsQuotation.P_PRIMA_MIN_PENSION = '';

    //                         const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    //                         modalRef.componentInstance.formModalReference = modalRef;
    //                         modalRef.componentInstance.erroresList = this.erroresList;
    //                     } else {
    //                         if (this.changeList.length > 0) {
    //                             const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    //                             modalRef.componentInstance.formModalReference = modalRef;
    //                             modalRef.componentInstance.changeList = this.changeList;
    //                             await modalRef.result.then((flag) => {
    //                                 this.flagConfirm = flag;
    //                             });
    //                         }
    //                         this.nidProc = res.NIDPROC;
    //                         this.categoryList = this.nrocotizacion != undefined && this.nrocotizacion != '' && this.categoryList.length > 0 ? this.categoryList : res.categoryList;
    //                         this.rateByPlanList = res.rateByPlanList;
    //                         this.detailPlanList = res.detailPlanList;
    //                         this.amountPremiumList = res.amountPremiumList;
    //                         this.amountDetailTotalList = res.amountDetailTotalList;

    //                         if (this.template.ins_categoriaList) {
    //                             this.categoryList.forEach(element => {
    //                                 element.sactive = true;
    //                                 const total = this.categoryList.reduce(function (prev, sum) {
    //                                     return prev + sum.NCOUNT;
    //                                 }, 0);
    //                                 if (this.inputsQuotation.tipoRenovacion == 1 && this.inputsQuotation.frecuenciaPago == 1)//if (this.inputsQuotation.tipoRenovacion == 1 && total < 5)
    //                                 {
    //                                     this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA ANUAL';
    //                                 } else {
    //                                     this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA MENSUAL';
    //                                 }
    //                             });

    //                             this.rateByPlanList.forEach(element => {
    //                                 if (codComission == null) {
    //                                     if (element.NTASA != 0) {
    //                                         this.btnCotiza = false;
    //                                     } else {
    //                                         this.btnCotiza = true;
    //                                     }
    //                                 }
    //                                 element.sactive = true;
    //                             });

    //                             this.detailPlanList.forEach(element => {
    //                                 this.inputsQuotation.P_PRIMA_MIN_PENSION = element.PRIMA_MINIMA;
    //                                 this.inputsQuotation.desTipoPlan = element.DET_PLAN;
    //                                 this.planPropuesto = element.DET_PLAN; //Marcos silverio
    //                             });

    //                             this.amountPremiumList.forEach(element => {
    //                                 element.sactive = true;
    //                             });

    //                             if (this.categoryList.length == 0) {
    //                                 swal.fire('Información', 'No se ha encontrado registros en la trama cargada', 'error');
    //                             } else {
    //                                 if (codComission == null) {
    //                                     if (this.nTransac != 8) {
    //                                         swal.fire('Información', 'Se validó correctamente la trama', 'success');
    //                                     }
    //                                 }
    //                             }

    //                         }
    //                         if (codComission == null) {
    //                             if (this.nTransac != 8) {
    //                                 swal.fire('Información', 'Se validó correctamente la trama', 'success');
    //                             }
    //                         }
    //                         if (res.P_FLAG_EXC == 1) {
    //                             if (this.flagExc == false && this.perfilExterno == false) {
    //                                 this.toastr.info("La trama de asegurados supera la RMA, considerar que se puede activar el control \"Sin tope de ley\", para que el sistema considere el Excedente", 'Informacion', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
    //                             }
    //                             this.flagExc = true;
    //                         } else {
    //                             this.flagExc = false;
    //                         }
    //                     }
    //                 } else {
    //                     swal.fire('Información', 'El archivo enviado contiene errores', 'error');
    //                 }
    //             }

    //         },
    //         err => {
    //             this.isLoading = false;
    //         }
    //     );
    // }

    clearinputsCotizacion() {
        // Contratistas
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SDESDIREBUSQ = '';
        this.inputsQuotation.P_SE_MAIL = '';
        this.reloadTariff = false;
        this.canTasaVL = true;
        this.inputsQuotation.P_COMISION = ''
        // this.flagEmailNull = true;
        this.flagEmail = false;
        this.flagContact = false;
        this.tasaVL = []
        this.inputsQuotation.desTipoPlan = '';
        this.contractingdata = undefined;

        // Cotizacion
        this.inputsQuotation.P_NIDSEDE = null;
        this.inputsQuotation.P_NCURRENCY = '1';
        this.inputsQuotation.P_NTECHNICAL = null;
        this.inputsQuotation.P_NECONOMIC = null;
        this.inputsQuotation.P_DELIMITER = '';
        //this.inputsQuotation.P_SDELIMITER = '0'; AVS - Mejoras SCTR
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.inputsQuotation.P_NPROVINCE = null;
        if (this.productList.length > 1) {
            this.inputsQuotation.P_NPRODUCT = '-1';
        }
        this.inputsQuotation.tipoRenovacion = '';
        this.inputsQuotation.frecuenciaPago = '';
        this.inputsQuotation.P_PLANILLA = 0


        // Sedes
        this.sedesList = [];
        this.stateQuotation = true;
        this.activityMain = ''
        this.subActivity = ''
        this.provinceList = [];
        this.districtList = [];
        this.listaTasasPension = [];
        this.listaTasasSalud = [];
        this.codProcess = '';
        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);
        this.inputsQuotation.FDateFin.setDate(this.inputsQuotation.FDateFin.getDate() - 1);

        this.inputsQuotation.FDateIniAseg = new Date();
        this.inputsQuotation.FDateFinAseg = new Date();
        this.inputsQuotation.FDateFinAseg.setMonth(this.inputsQuotation.FDateIniAseg.getMonth() + 1);
        this.inputsQuotation.FDateFinAseg.setDate(this.inputsQuotation.FDateFinAseg.getDate() - 1);

        this.bsValueIniMin = new Date();
        this.bsValueFinMin = this.inputsQuotation.FDateFin;
        this.tipoEspecial = false
        this.creditHistory = null
        this.clearTariff()

        this.inputsQuotation.P_NREM_EXC = undefined
    }

    // cambioDocumento(nroDocumento) {
    //     this.stateQuotation = true;
    //     this.clearinputsCotizacion();
    //     if (this.inputsQuotation.P_NIDDOC_TYPE == 1 && nroDocumento.length > 1) {
    //         if (nroDocumento.substr(0, 2) == '10' || nroDocumento.substr(0, 2) == '15' || nroDocumento.substr(0, 2) == '17') {
    //             this.blockDoc = true;
    //             this.inputsQuotation.P_SLEGALNAME = '';
    //         } else {
    //             this.blockDoc = false;
    //             this.inputsQuotation.P_SFIRSTNAME = '';
    //             this.inputsQuotation.P_SLASTNAME = '';
    //             this.inputsQuotation.P_SLASTNAME2 = '';
    //         }
    //     }
    //     if (nroDocumento.length > 0) {
    //         this.inputsValidate[1] = false
    //     }
    // }

    cambioDocumento(nroDocumento) {
        this.stateQuotation = true;
        this.clearinputsCotizacion();

        if (this.isDocumentTypePersonal() && nroDocumento.length > 1) {
            this.updateDocumentState(nroDocumento);
        }

        if (nroDocumento.length > 0) {
            this.inputsValidate[1] = false;
        }
    }

    isDocumentTypePersonal() {
        return this.inputsQuotation.P_NIDDOC_TYPE === 1;
    }

    updateDocumentState(nroDocumento) {
        const prefix = nroDocumento.substr(0, 2);
        if (['10', '15', '17'].includes(prefix)) {
            this.blockDoc = true;
            this.inputsQuotation.P_SLEGALNAME = '';
        } else {
            this.blockDoc = false;
            this.clearNameFields();
        }
    }

    clearNameFields() {
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
    }

    // async onSelectProducto(event) {

    //     this.valMixSAPSA = event != null ? Number(event) : this.valMixSAPSA; //AVS - INTERCONEXION SABSA 06/11/2023
    //     this.flagDelimiter = Number(this.epsItem.NCODE == 3) && this.valMixSAPSA == 2 ? true : false; //AVS - INTERCONEXION SABSA
    //     // this.flagMina = Number(this.epsItem.NCODE == 3) && this.valMixSAPSA == 2 ? true : false; //AVS - INTERCONEXION SABSA
    //     if (this.template.ins_clearTasas) {
    //         this.tasasList = [];
    //         this.listaTasasSalud = [];
    //         this.listaTasasPension = [];
    //         this.mensajePrimaPension = ''
    //         this.mensajePrimaSalud = ''
    //     }

    //     this.inputsQuotation.P_WORKER = 0;

    //     //PENSION EVENT 1
    //     //SALUD EVENT 2
    //     //AMBOS PRODUCTOS 0

    //     if (this.inputsQuotation.P_NPRODUCT != '-1') {
    //         this.reloadTariff = false;
    //         this.equivalentMuni();
    //     } else {
    //         this.clearTariff();
    //     }
    // }

    async onSelectProducto(event) {
        this.updateValMixSAPSA(event);
        this.updateFlagDelimiter();
        this.clearTasasLists();
        this.inputsQuotation.P_WORKER = 0;
        if (this.inputsQuotation.P_NPRODUCT !== '-1') {
            this.reloadTariff = false;
            await this.equivalentMuni();
        } else {
            this.clearTariff();
        }
    }

    updateValMixSAPSA(event) {
        this.valMixSAPSA = event != null ? Number(event) : this.valMixSAPSA;
    }

    updateFlagDelimiter() {
        this.flagDelimiter = Number(this.epsItem.NCODE === 3) && this.valMixSAPSA === 2;
    }

    clearTasasLists() {
        this.tasasList = [];
        this.listaTasasSalud = [];
        this.listaTasasPension = [];
        this.mensajePrimaPension = '';
        this.mensajePrimaSalud = '';
        this.codProcess = '';
    }

    volverCotizar(cantidad, idTasa, fila, tipoCambio) {
        cantidad = !isNaN(Number(cantidad)) ? Number(cantidad) : 0
        this.inputsQuotation.P_WORKER = 0
        this.inputsQuotation.P_PLANILLA = 0
        this.messageWorker = this.variable.var_msjCalcularNuevo
        this.reloadTariff = true;
        this.codProcess = '';
        // this.rulesList = [];
        let productos = [this.pensionID.id, this.saludID.id]

        this.tasasList.forEach(item => {
            if (item.id == idTasa) {
                item.totalWorkes = tipoCambio == 1 ? cantidad : item.totalWorkes;
                item.planilla = tipoCambio == 2 ? cantidad : item.planilla;
            }
            this.inputsQuotation.P_WORKER = this.inputsQuotation.P_WORKER + item.totalWorkes
            this.inputsQuotation.P_PLANILLA = this.inputsQuotation.P_PLANILLA + Number(item.planilla)
        });

        productos.forEach(producto => {
            let riesgos: any = producto == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
            if (riesgos.length > 0) {
                riesgos.forEach(item => {
                    if (item.id == idTasa) {
                        item.totalWorkes = tipoCambio == 1 ? cantidad : item.totalWorkes;
                        item.planilla = tipoCambio == 2 ? cantidad : item.planilla;
                    }
                    item.rate = CommonMethods.formatValor(0, 6)
                    item.planProp = 0
                    item.premiumMonth = CommonMethods.formatValor(0, 2)
                });
            }

            this.listaTasasPension = producto == this.pensionID.id ? riesgos : this.listaTasasPension
            this.listaTasasSalud = producto == this.saludID.id ? riesgos : this.listaTasasSalud
        });

        this.totalNetoSaludSave = CommonMethods.formatValor(0, 2);
        this.inputsQuotation.primaComSalud = CommonMethods.formatValor(0, 2);
        this.igvSaludSave = CommonMethods.formatValor(0, 2);
        this.brutaTotalSaludSave = CommonMethods.formatValor(0, 2)
        this.mensajePrimaSalud = ''

        this.totalNetoPensionSave = CommonMethods.formatValor(0, 2);
        this.inputsQuotation.primaComPension = CommonMethods.formatValor(0, 2);
        this.igvPensionSave = CommonMethods.formatValor(0, 2);
        this.brutaTotalPensionSave = CommonMethods.formatValor(0, 2)
        this.mensajePrimaPension = ''

        if (this.inputsQuotation.P_WORKER > 0 || this.inputsQuotation.P_PLANILLA > 0) {
            if (this.codFlat == idTasa) {
                this.disabledFlat.forEach(disable => {
                    disable.value = true;
                    this.disabledFlat[fila].value = false;
                });
            } else {
                this.disabledFlat.forEach(disable => {
                    if (disable.id == this.codFlat) {
                        disable.value = true;
                    }
                });
            }
        } else {
            if (this.inputsQuotation.P_PLANILLA == 0 && this.inputsQuotation.P_WORKER == 0) {
                this.disabledFlat.forEach(disable => {
                    disable.value = false;
                });
            }
        }

    }

    comisionPropuesta(porPropuesto, fila, tipoId) {
        porPropuesto = !isNaN(Number(porPropuesto)) ? Number(porPropuesto) : 0
        let sumComision = 0

        this.brokerList.forEach(broker => {
            broker.P_COM_PENSION_PRO = tipoId == 1 ? porPropuesto : broker.P_COM_PENSION_PRO
            broker.P_COM_SALUD_PRO = tipoId == 2 ? porPropuesto : broker.P_COM_SALUD_PRO
            sumComision = tipoId == 1 ? sumComision + broker.P_COM_PENSION_PRO : sumComision + broker.P_COM_SALUD_PRO
        });

        if (sumComision > 100) {
            this.brokerList[fila].valItemPen = tipoId == 1 ? true : this.brokerList[fila].valItemPen
            this.brokerList[fila].valItemSal = tipoId == 2 ? true : this.brokerList[fila].valItemSal
        }
        else {
            this.brokerList[fila].valItemPen = tipoId == 1 ? false : this.brokerList[fila].valItemPen
            this.brokerList[fila].valItemSal = tipoId == 2 ? false : this.brokerList[fila].valItemSal
        }
    }

    async resetearPrimas(event, infoProducto, itemTasa = null) {
        this.isLoading = true;

        let premiumProp = event == 0 ? 0 : !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
        infoProducto[0].prima_minPro = itemTasa == null ? premiumProp : infoProducto[0].prima_minPro;
        infoProducto[0].itemTasa = itemTasa;
        infoProducto[0].rateType = this.inputsQuotation.P_NRATETYPE; // Tipo de tasa
        // infoProducto[0].rulesList = this.rulesList;

        await this.clientInformationService.getReTariff(infoProducto).subscribe(
            async res => {
                this.isLoading = false;
                let infoPensionTemp = res.filter(item => item.productCore == '1');
                this.infoPension = infoPensionTemp.length > 0 ? infoPensionTemp : this.infoPension;
                this.listaTasasPension = this.infoPension.length > 0 ? this.infoPension[0].tasasList : this.listaTasasPension;
                this.dataPension(this.infoPension);

                let infoSaludTemp = res.filter(item => item.productCore == '2');
                this.infoSalud = infoSaludTemp.length > 0 ? infoSaludTemp : this.infoSalud;
                this.listaTasasSalud = this.infoSalud.length > 0 ? this.infoSalud[0].tasasList : this.listaTasasSalud;
                this.dataSalud(this.infoSalud);

            },
            err => {
                this.isLoading = false;
                this.clearTariff();
                swal.fire('Información', this.variable.var_sinCombinacion, 'error');
            }
        );
    }

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

        return reg
    }

    // resetearPrimas(primPropuesta, productoId) {
    //     console.log('resetearPrimas');
    //     console.log('primPropuesta: ' + primPropuesta);
    //     primPropuesta = !isNaN(Number(primPropuesta)) ? Number(primPropuesta) : 0;

    //     let tasas = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
    //     let totalNeto = productoId == this.pensionID.id ? Number(this.totalNetoPension) : Number(this.totalNetoSalud)
    //     let primaMinima = productoId == this.pensionID.id ? Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) : Number(this.inputsQuotation.P_PRIMA_MIN_SALUD)
    //     let productos = [this.pensionID.id, this.saludID.id]

    //     console.log('this.listaTasasPension: ');
    //     console.log(this.listaTasasPension);
    //     console.log('tasas: ');
    //     console.log(tasas.length);

    //     if (tasas.length > 0) {
    //         productos.forEach(producto => {
    //             if (producto == productoId) {
    //                 if (primPropuesta > 0) {
    //                     console.log('if');
    //                     if (primPropuesta > totalNeto) {//primPropuesta > totalNeto
    //                         console.log('if 1');
    //                         this.recalcularPrima(productoId, primPropuesta, this.variable.var_msjPrimaMin)
    //                     } else {
    //                         console.log('else 1');
    //                         this.recalcularPrima(productoId, totalNeto, '')
    //                     }
    //                 } else {
    //                     console.log('else');
    //                     if (totalNeto < primaMinima) {//totalNeto < primaMinima
    //                         console.log('if 2');
    //                         this.recalcularPrima(productoId, primaMinima, this.variable.var_msjPrimaMin)
    //                     } else {
    //                         console.log('else 2');
    //                         this.recalcularPrima(productoId, totalNeto, '')
    //                     }
    //                 }
    //             }

    //         });
    //     }
    // }

    // recalcularPrima(productoId: any, monPropuesto: number, mensaje: any) {
    //     if (productoId == this.pensionID.id) {
    //         this.totalNetoPensionSave = CommonMethods.formatValor(monPropuesto, 2)
    //         this.inputsQuotation.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
    //         this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 2);
    //         this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.inputsQuotation.primaComPension) + Number(this.igvPensionSave), 2)
    //         this.mensajePrimaPension = mensaje;
    //     }

    //     if (productoId == this.saludID.id) {
    //         this.totalNetoSaludSave = CommonMethods.formatValor(monPropuesto, 2)
    //         this.inputsQuotation.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
    //         this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 2);
    //         this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.inputsQuotation.primaComSalud) + Number(this.igvSaludSave), 2)
    //         this.mensajePrimaSalud = mensaje;
    //     }
    // }

    // resetearTasas(tasaPropuesta, idTasa, fila, productoId) {
    //     tasaPropuesta = !isNaN(Number(tasaPropuesta)) ? Number(tasaPropuesta) : 0;
    //     let listaTasa = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
    //     let productos = [this.pensionID.id, this.saludID.id]

    //     if (listaTasa.length > 0) {
    //         productos.forEach(producto => {
    //             if (producto == productoId) {
    //                 if (tasaPropuesta > 100) {
    //                     listaTasa[fila].valItem = true
    //                 }
    //                 else {
    //                     listaTasa[fila].valItem = false
    //                 }

    //                 listaTasa[fila].planProp = tasaPropuesta

    //                 if (this.template.ins_mapfre && productoId == this.saludID.id) {
    //                     listaTasa.forEach(item => {
    //                         item.planProp = tasaPropuesta;
    //                     });
    //                 }
    //             }
    //         });

    //         if (productoId == this.pensionID.id) {
    //             let tasa = 0;
    //             this.listaTasasPension.map((item) => {
    //                 this.calculateNewPremiums(tasa = item.planProp == 0 ? item.rate : item.planProp, item.nmodulec, this.pensionID.id);
    //                 item.valItem = false;
    //             });
    //         } else if (productoId == this.saludID.id) {
    //             let tasa = 0;
    //             this.listaTasasSalud.map((item) => {
    //                 this.calculateNewPremiums(tasa = item.planProp == 0 ? item.rate : item.planProp, item.nmodulec, this.saludID.id);
    //                 item.valItem = false;
    //             });
    //         }
    //     }
    // }


    limpiarTarifario() {
        this.messageWorker = '';
        this.primMinimaSalud = false;
        this.primMinimaPension = false;
        this.statePrimaSalud = true;
        this.statePrimaPension = true;
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = ''
        this.brokerList.forEach(broker => {
            broker.P_COM_SALUD = 0;
            broker.P_COM_PENSION = 0;
        });
    }

    async getTarifario() {
        // Limpiar objetos de tarifario
        this.limpiarTarifario()

        if (this.inputsQuotation.P_NTECHNICAL == null || this.inputsQuotation.P_NMUNICIPALITY == null ||
            this.inputsQuotation.P_NPRODUCT == '-1' || this.brokerList.length == 0 || this.contratanteId == '')
            return

        let data: any = {};
        data.nbranch = this.inputsQuotation.NBRANCH;
        data.nproduct = this.inputsQuotation.P_NPRODUCT;
        data.reload = !this.reloadTariff ? 0 : 1;
        data.renovationCode = this.inputsQuotation.tipoRenovacion;
        data.epsCode = this.epsItem.NCODE;
        data.profileValidation = this.perfil != this.perfilActual ? 0 : 1;
        data.tasasList = this.tasasList;
        data.brokerList = this.brokerList;
        data.userCode = this.userId;
        data.stransac = "EM";
        data.codProcess = this.codProcess;
        data.rateType = this.inputsQuotation.P_NRATETYPE; // Tipo de tasa
        data.client_type = this.inputsQuotation.P_SISCLIENT_GBD;
        // data.rulesList = this.rulesList;
        data.protectaTariff = {};
        data.protectaTariff.activity = this.inputsQuotation.P_NECONOMIC; // Sub-Actividad
        data.protectaTariff.workers = this.inputsQuotation.P_WORKER;
        data.protectaTariff.zipCode = this.municipalityTariff.toString(); // Ubigeo Equivalente
        data.protectaTariff.currency = this.inputsQuotation.P_NCURRENCY; // código de moneda
        data.protectaTariff.queryDate = ''; // Fecha
        data.protectaTariff.channel = []; //

        if (this.inputsQuotation.P_DELIMITER != '') { // AGF Cambio de Mensaje por producto
            if (this.inputsQuotation.P_NPRODUCT == "0") { // Ambos
                this.inputsQuotation.P_DELIMITER = '* La actividad cuenta con delimitación (Para Pensión)';

            } else {
                this.inputsQuotation.P_DELIMITER = '* La actividad cuenta con delimitación';
            }
        }
        //Agregando el clientId
        let client: any = {}
        client.clientId = this.contratanteId; // Cliente Contratante
        data.protectaTariff.channel.push(client);

        //Agregando los brokerId y middlemanId | Lista de comercializadores
        this.brokerList.forEach(broker => {
            if (broker.NTYPECHANNEL == '6' || broker.NTYPECHANNEL == '8') {
                let brokerItem: any = {}
                brokerItem.brokerId = broker.NCORREDOR.toString();
                data.protectaTariff.channel.push(brokerItem);
            } else {
                let middlemanItem: any = {}
                middlemanItem.middlemanId = broker.COD_CANAL.toString();
                data.protectaTariff.channel.push(middlemanItem);
            }
        });

        this.isLoading = true;

        // Mapfre
        if (this.template.ins_mapfre && (this.inputsQuotation.P_NPRODUCT == '0' || this.inputsQuotation.P_NPRODUCT == '2')) {
            data.mapfreTariff = {}
            data.mapfreTariff.cabecera = {}
            data.mapfreTariff.cabecera.tariff = this.reloadTariff
            data.mapfreTariff.cabecera.keyService = 'cotizar'
            data.mapfreTariff.poliza = {}
            data.mapfreTariff.poliza.fecEfecSpto = this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear()
            data.mapfreTariff.poliza.fecVctoSpto = this.inputsQuotation.FDateFin.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateFin.getFullYear()
            data.mapfreTariff.poliza.codFormaDeclaracion = await this.equivalenciaMapfre(this.inputsQuotation.tipoRenovacion, 'renovacion', 'tableKey') // Tipo de renovación
            data.mapfreTariff.poliza.codActRiesgo = await this.equivalenciaMapfre(this.inputsQuotation.P_NECONOMIC, 'actividadEconomica', 'tableKey') // Revisar CIIU
            data.mapfreTariff.poliza.tipoPeriodo = this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4' ? 'C' : 'N' // Revisar
            data.mapfreTariff.poliza.moneda = {}
            data.mapfreTariff.poliza.moneda.codMon = this.inputsQuotation.P_NCURRENCY
            data.mapfreTariff.producto = {}
            data.mapfreTariff.riesgoSCTR = []
            let item: any = {}
            item.nomCentroRiesgoSalud = this.inputsQuotation.P_SSEDE
            item.numAsegSalud = this.inputsQuotation.P_WORKER;
            item.impPlanillaSalud = this.inputsQuotation.P_PLANILLA;
            data.mapfreTariff.riesgoSCTR.push(item)
            data.mapfreTariff.contratante = {}
            data.mapfreTariff.contratante.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey') //'DNI' equivalente
            data.mapfreTariff.contratante.codDocum = this.inputsQuotation.P_SIDDOC
            data.mapfreTariff.contratante.nombre = this.contractingdata.P_NPERSON_TYP == '1' ? this.contractingdata.P_SFIRSTNAME + ' ' + this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : this.contractingdata.P_SLEGALNAME
            data.mapfreTariff.mcaGuardado = 'N'
        }

        await this.clientInformationService.getTariff(data).subscribe(
            async res => {
                this.isLoading = false;
                // if (res.fields !== null) {
                console.log(res);

                if (res !== null) {

                    if (CommonMethods.validateNullEmpty(res.errors.code)) {
                        this.codProcess = res.codProcess;
                        this.infoPension = res.data.filter(item => item.productCore == '1');
                        this.listaTasasPension = this.infoPension.length > 0 ? this.infoPension[0].tasasList : [];
                        this.infoSalud = res.data.filter(item => item.productCore == '2');
                        this.listaTasasSalud = this.infoSalud.length > 0 ? this.infoSalud[0].tasasList : []; //AVS - INTERCONEXION SABSA

                        if(this.listaTasasPension.length == 0 && this.listaTasasSalud.length == 0) {
                            this.flag_tasas = 0;
                            this.clearTariff();
                            swal.fire('Información', this.variable.var_sinCombinacion, 'error');
                        }else{
                            if (!this.reloadTariff) {
                                this.tasasList = this.listaTasasPension.length > 0 ? this.listaTasasPension : this.listaTasasSalud;
                            } else {
                                await this.validateDerivationRules();
                                await this.validateDelimitationRules();
                            }

                            this.dataPension(this.infoPension);
                            this.dataSalud(this.infoSalud);
                            this.brokerList = this.infoSalud.length > 0 ? this.infoSalud[0].brokerList : this.infoPension[0].brokerList;
                        }
                    } else {
                        this.clearTariff();
                        swal.fire('Información', res.errors.message, 'error');
                    }
                } else {
                    this.clearTariff();
                    swal.fire('Información', this.variable.var_sinCombinacion, 'error');
                }
            },
            err => {
                this.isLoading = false;
                this.clearTariff();
                swal.fire('Información', this.variable.var_sinCombinacion, 'error');
            }
        );
    }

    async validateDerivationRules() {
        // this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + current.planilla, 0)
        // this.tasasList.filter(item => item.totalWorkes).reduce((sum, current) => sum + current.totalWorkes, 0);

        let data: any = {
            scodProcess: this.codProcess,
            nworkers_total: this.tasasList.filter(item => item.totalWorkes).reduce((sum, current) => sum + current.totalWorkes, 0),
            namount_total: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + current.planilla, 0),
            sclient_type: this.inputsQuotation.P_SISCLIENT_GBD
        };

        await this.quotationService.getDerivationRules(data).toPromise().then(
            res => {
                if (res.ncode == 1) {
                    console.log(res.smessage);
                }
            });
    }

    async dataPension(infoPension: any) {
        // console.log(infoPension)
        this.discountPension = infoPension.length > 0 ? infoPension[0].discount : 0;
        this.activityVariationPension = infoPension.length > 0 ? infoPension[0].activityVariation : 0;
        this.commissionPension = infoPension.length > 0 ? infoPension[0].commission : 0;
        this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension.length > 0 ? await this.validatePremiumByRules(infoPension) : 0;
        this.inputsQuotation.P_PRIMA_END_PENSION = infoPension.length > 0 ? infoPension[0].prima_end : 0;
        this.inputsQuotation.primaComPension = infoPension.length > 0 ? infoPension[0].primaCom : 0;
        this.inputsQuotation.primaComPensionPre = infoPension.length > 0 ? infoPension[0].primaComPre : 0;
        this.totalNetoPensionSave = infoPension.length > 0 ? infoPension[0].totalNeto : 0;
        this.totalNetoPension = infoPension.length > 0 ? infoPension[0].totalNetoPre : 0;
        this.igvPensionSave = infoPension.length > 0 ? infoPension[0].igv : 0;
        this.igvPension = infoPension.length > 0 ? infoPension[0].igvPre : 0;
        this.brutaTotalPensionSave = infoPension.length > 0 ? infoPension[0].totalBruto : 0;
        this.brutaTotalPension = infoPension.length > 0 ? infoPension[0].totalBrutoPre : 0;
        this.mensajePrimaPension = infoPension.length > 0 ? infoPension[0].mensaje : 0;
        // this.listaTasasPension = infoPension.length > 0 ? infoPension[0].tasasProducto : this.listaTasasPension;
    }

    async dataSalud(infoSalud: any) {
        this.discountSalud = infoSalud.length > 0 ? infoSalud[0].discount : 0
        this.activityVariationSalud = infoSalud.length > 0 ? infoSalud[0].activityVariation : 0
        this.commissionSalud = infoSalud.length > 0 ? infoSalud[0].commission : 0
        this.inputsQuotation.P_PRIMA_MIN_SALUD = infoSalud.length > 0 ? infoSalud[0].prima_min : 0
        this.inputsQuotation.P_PRIMA_END_SALUD = infoSalud.length > 0 ? infoSalud[0].prima_end : 0
        this.inputsQuotation.primaComSalud = infoSalud.length > 0 ? infoSalud[0].primaCom : 0
        this.inputsQuotation.primaComSaludPre = infoSalud.length > 0 ? infoSalud[0].primaComPre : 0
        this.totalNetoSaludSave = infoSalud.length > 0 ? infoSalud[0].totalNeto : 0
        this.totalNetoSalud = infoSalud.length > 0 ? infoSalud[0].totalNetoPre : 0
        this.igvSaludSave = infoSalud.length > 0 ? infoSalud[0].igv : 0
        this.igvSalud = infoSalud.length > 0 ? infoSalud[0].igvPre : 0
        this.brutaTotalSaludSave = infoSalud.length > 0 ? infoSalud[0].totalBruto : 0
        this.brutaTotalSalud = infoSalud.length > 0 ? infoSalud[0].totalBrutoPre : 0
        this.mensajePrimaSalud = infoSalud.length > 0 ? infoSalud[0].mensaje : 0
        // this.listaTasasSalud = infoSalud.length > 0 ? infoSalud[0].tasasProducto : this.listaTasasSalud
    }

    async validatePremiumByRules(item: any) {
        let premium = 0;

        if (this.reloadTariff) {
            let data: any = {
                scodProcess: this.codProcess,
                npremium_min: item[0].prima_min,
                npremium_end: item[0].prima_end,
                sclient_type: this.inputsQuotation.P_SISCLIENT_GBD,
                stransac: 'EM'
            };

            await this.quotationService.getPremiumByRules(data).toPromise().then(
                res => {
                    premium = res.npremium
                });
        } else {
            premium = item[0].prima_min;
        }

        return premium;
    }

    // async tasaProductoConfigurada() {
    //     let productos = [this.variable.var_ambosProductos, this.pensionID.id, this.saludID.id]
    //     productos.forEach(async producto => {
    //         console.log(this.reloadTariff);
    //         if (producto == this.inputsQuotation.P_NPRODUCT) {
    //             if (this.listaTasasSalud.length > 0 && this.listaTasasPension.length > 0 || (this.template.ins_mapfre && producto == this.saludID.id)) {
    //                 if (!this.reloadTariff) {
    //                     this.tasasList = producto == this.pensionID.id || producto == this.variable.var_ambosProductos ? this.listaTasasPension : this.listaTasasSalud
    //                 }
    //                 this.listaTasasPension = producto == this.pensionID.id || producto == this.variable.var_ambosProductos ? this.listaTasasPension : []
    //                 console.log(this.listaTasasPension);
    //                 this.listaTasasSalud = producto == this.saludID.id || producto == this.variable.var_ambosProductos ? this.listaTasasSalud : []

    //                 if (!this.reloadTariff) {
    //                     this.messageWorker = this.variable.var_msjCalcularNuevo
    //                 }

    //                 await this.completarCalculos();

    //             } else {
    //                 this.clearTariff();
    //                 swal.fire('Información', this.variable.var_errorTarifario, 'error');
    //                 return;
    //             }
    //         }
    //     });
    // }

    // async generarTasasListas(resList: any) {
    //     this.resList.fields.forEach(async item => {
    //         if (item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch) {
    //             this.listaTasasPension = await this.cargarTasasServicio(item);
    //             console.log(this.listaTasasPension);
    //             this.listaTasasPension = this.listaTasasPension.filter(tasa => tasa.description !== 'Medio'); //AVS - INTERCONEXION SABSA
    //         }

    //         if (item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch) {
    //             this.listaTasasSalud = await this.cargarTasasServicio(item);
    //             this.listaTasasSalud = this.listaTasasSalud.filter(tasa => tasa.description !== 'Medio'); //AVS - INTERCONEXION SABSA
    //         }
    //     });
    // }

    // async cargarTasasServicio(item: any) {
    //     var self = this
    //     var listaTasas: any = []

    //     if (item.enterprise[0].netRate != undefined) {
    //         item.enterprise[0].netRate.map(function (dato) {
    //             dato.rate = CommonMethods.formatValor(Number(dato.rate) * 100, 6);
    //             dato.rate = CommonMethods.formatValor(Number(dato.rate), 6); // AGF Para Formaterar porcentajes Solo Para Saluds

    //             dato.premiumMonth = CommonMethods.formatValor(Number('0'), 2);
    //             dato.planilla = 0;
    //             dato.planProp = 0;
    //             dato.totalWorkes = 0;
    //             dato.sactive = true;
    //             dato.valItem = false;
    //             if (self.reloadTariff == false) {
    //                 dato.rate = CommonMethods.formatValor(0, 6)
    //             }
    //         });
    //     }

    //     if (item.enterprise[0].riskRate != undefined) {
    //         item.enterprise[0].riskRate.forEach(net => {
    //             item.enterprise[0].netRate.map(function (dato) {
    //                 if (net.id == dato.id) {
    //                     dato.rateDet = CommonMethods.formatValor(Number(net.rate) * 100, 6)
    //                 }
    //             });
    //         });
    //     }

    //     if (item.enterprise[0].netRate != null) {
    //         let activeFlat = false;
    //         item.enterprise[0].netRate.map(function (dato) {
    //             dato.status = 0;
    //         });

    //         var num = 0
    //         item.enterprise[0].netRate.forEach(item => {
    //             self.disabledFlat[num].id = item.id
    //             if (self.reloadTariff == false) {
    //                 self.disabledFlat[num].value = false
    //                 if (this.template.ins_mapfre) {
    //                     if (this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4') {
    //                         item.disabled = true
    //                     } else {
    //                         item.disabled = false
    //                     }
    //                 } else if (Number(this.epsItem.NCODE) == 3) { //AVS - INTERCONEXION SABSA
    //                     item.disabled = true;
    //                 }
    //             } else {
    //                 if (this.template.ins_mapfre) {
    //                     if (this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4') {
    //                         item.disabled = true
    //                     } else {
    //                         item.disabled = false
    //                     }
    //                 } else if (Number(this.epsItem.NCODE) == 3) { //AVS - INTERCONEXION SABSA
    //                     item.disabled = true;
    //                 }
    //             }
    //             num++
    //         });

    //         if (this.perfil == this.perfilActual) {
    //             item.enterprise[0].netRate.forEach(risk => {
    //                 if (risk.id == this.codFlat) {
    //                     risk.status = 1;
    //                     activeFlat = true;
    //                     num++
    //                 }
    //             });

    //             if (activeFlat == false) {
    //                 item.enterprise[0].netRate.forEach(risk => {
    //                     risk.status = 1;
    //                 });
    //             }

    //             listaTasas = item.enterprise[0].netRate

    //         } else {
    //             item.enterprise[0].netRate.forEach(risk => {
    //                 risk.status = 1;
    //             });

    //             listaTasas = item.enterprise[0].netRate;
    //         }

    //     } else {
    //         listaTasas = []
    //     }

    //     for (let i = 0; i < listaTasas.length; i++) { //AVS - INTERCONEXION SABSA
    //         if (listaTasas[i].description.toUpperCase().includes('OBRERO')) {
    //             listaTasas[i].description = 'Riesgo Alto';
    //             listaTasas[i].nmodulec = 3;
    //         } else if (listaTasas[i].description.toUpperCase().includes('ADMINISTRATIVO')) {
    //             listaTasas[i].description = 'Riesgo Bajo';
    //             listaTasas[i].nmodulec = 1;
    //         } else if (listaTasas[i].description.toUpperCase().includes('MEDIO')) {
    //             listaTasas[i].description = 'Medio';
    //             listaTasas[i].nmodulec = 2;
    //         } else if (listaTasas[i].description.toUpperCase().includes('FLAT')) {
    //             listaTasas[i].description = 'Riesgo Medio';
    //             listaTasas[i].nmodulec = 4;
    //         }
    //     }

    //     const priorityOrder = { //AVS - INTERCONEXION SABSA - ORDENAMIENTO DE LISTAS
    //         'Riesgo Alto': 0,
    //         'Riesgo Medio': 1,
    //         'Riesgo Bajo': 2,
    //         'Medio': 3,
    //     };

    //     listaTasas.sort((a, b) => {
    //         const orderA = priorityOrder[a.description];
    //         const orderB = priorityOrder[b.description];

    //         if (orderA !== undefined && orderB !== undefined) {
    //             return orderA - orderB;
    //         } else if (orderA !== undefined) {
    //             return -1;
    //         } else if (orderB !== undefined) {
    //             return 1;
    //         } else {
    //             return 0;
    //         }
    //     });


    //     return listaTasas
    // }

    // async completarCalculos() {
    //     this.resList.fields.forEach(async item => {
    //         if (item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch) {
    //             let infoPension: any = await this.infoGenerica(this.pensionID.id, item);
    //             console.log(infoPension);
    //             this.discountPension = infoPension != null ? infoPension.discount : 0;
    //             this.activityVariationPension = infoPension != null ? infoPension.activityVariation : 0;
    //             this.commissionPension = infoPension != null ? infoPension.commission : 0;
    //             this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension != null ? infoPension.prima_min : 0;
    //             this.inputsQuotation.P_PRIMA_END_PENSION = infoPension != null ? infoPension.prima_end : 0;
    //             this.inputsQuotation.primaComPension = infoPension != null ? infoPension.primaCom : 0;
    //             console.log(this.inputsQuotation.primaComPension);
    //             console.log(this.inputsQuotation.primaComPensionPre);
    //             this.inputsQuotation.primaComPensionPre = infoPension != null ? infoPension.primaComPre : 0;
    //             console.log(this.inputsQuotation.primaComPensionPre);
    //             this.totalNetoPensionSave = infoPension != null ? infoPension.totalNeto : 0;
    //             this.totalNetoPension = infoPension != null ? infoPension.totalNetoPre : 0;
    //             this.igvPensionSave = infoPension != null ? infoPension.igv : 0;
    //             this.igvPension = infoPension != null ? infoPension.igvPre : 0;
    //             this.brutaTotalPensionSave = infoPension != null ? infoPension.totalBruto : 0;
    //             this.brutaTotalPension = infoPension != null ? infoPension.totalBrutoPre : 0;
    //             this.mensajePrimaPension = infoPension != null ? infoPension.mensaje : 0;
    //             this.listaTasasPension = infoPension != null ? infoPension.tasasProducto : this.listaTasasPension;
    //         }

    //         if (item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch) {
    //             let infoSalud: any = await this.infoGenerica(this.saludID.id, item)
    //             this.discountSalud = infoSalud != null ? infoSalud.discount : 0
    //             this.activityVariationSalud = infoSalud != null ? infoSalud.activityVariation : 0
    //             this.commissionSalud = infoSalud != null ? infoSalud.commission : 0
    //             this.inputsQuotation.P_PRIMA_MIN_SALUD = infoSalud != null ? infoSalud.prima_min : 0
    //             this.inputsQuotation.P_PRIMA_END_SALUD = infoSalud != null ? infoSalud.prima_end : 0
    //             this.inputsQuotation.primaComSalud = infoSalud != null ? infoSalud.primaCom : 0
    //             this.inputsQuotation.primaComSaludPre = infoSalud != null ? infoSalud.primaComPre : 0
    //             this.totalNetoSaludSave = infoSalud != null ? infoSalud.totalNeto : 0
    //             this.totalNetoSalud = infoSalud != null ? infoSalud.totalNetoPre : 0
    //             this.igvSaludSave = infoSalud != null ? infoSalud.igv : 0
    //             this.igvSalud = infoSalud != null ? infoSalud.igvPre : 0
    //             this.brutaTotalSaludSave = infoSalud != null ? infoSalud.totalBruto : 0
    //             this.brutaTotalSalud = infoSalud != null ? infoSalud.totalBrutoPre : 0
    //             this.mensajePrimaSalud = infoSalud != null ? infoSalud.mensaje : 0
    //             this.listaTasasSalud = infoSalud != null ? infoSalud.tasasProducto : this.listaTasasSalud
    //         }

    //     });
    // }

    // infoGenerica(productoId: any, item: any): any {
    //     // let self = this
    //     let response: any = {}
    //     let dEmision: number = productoId == this.pensionID.id ? this.dEmiPension : this.dEmiSalud
    //     console.log(dEmision);
    //     let igvProducto: number = productoId == this.pensionID.id ? this.igvPensionWS : this.igvSaludWS
    //     let tasasProducto: any = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
    //     if (tasasProducto.length > 0) {
    //         response.discount = item.discount == null ? '0' : item.discount;
    //         response.activityVariation = item.activityVariation == null ? '0' : item.activityVariation;
    //         response.commission = item.commission == null ? '0' : item.commission;

    //         if (item.enterprise[0].netRate != undefined) {
    //             let neto = 0;
    //             tasasProducto.forEach(item => {
    //                 this.tasasList.forEach(dato => {
    //                     if (item.id == dato.id) {
    //                         item.totalWorkes = dato.totalWorkes;
    //                         item.planilla = dato.planilla;
    //                         item.planProp = 0;
    //                         item.premiumMonth = CommonMethods.formatValor((Number(dato.planilla) * Number(item.rate)) / 100, 2);
    //                         console.log("Entra");
    //                     }
    //                 });
    //                 neto = neto + Number(item.premiumMonth)
    //             });

    //             if (tasasProducto.length > 0) {
    //                 if (this.reloadTariff == true) {
    //                     response.prima_min = item.enterprise[0].minimumPremium == null ? '0' : item.enterprise[0].minimumPremium;
    //                     response.prima_end = item.enterprise[0].minimumPremiumEndoso == null ? '0' : item.enterprise[0].minimumPremiumEndoso;
    //                 } else {
    //                     response.prima_min = 0;
    //                     response.prima_end = 0;
    //                 }
    //             }

    //             response.mensaje = ''
    //             if (this.template.ins_mapfre && productoId == this.saludID.id) {
    //                 response.totalNeto = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
    //                 response.primaCom = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
    //                 response.igv = CommonMethods.formatValor(item.enterprise[0].impImptos + item.enterprise[0].impRecargos, 2)
    //                 response.totalBruto = CommonMethods.formatValor(item.enterprise[0].impPrimaTotal, 2)
    //             } else {
    //                 response.totalNetoPre = CommonMethods.formatValor(neto, 2)
    //                 response.totalNeto = CommonMethods.formatValor(neto, 2)
    //                 response.primaComPre = CommonMethods.formatValor(neto * dEmision, 2)
    //                 response.primaCom = CommonMethods.formatValor(neto * dEmision, 2)
    //                 response.igvPre = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2);
    //                 response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2);
    //                 response.totalBrutoPre = CommonMethods.formatValor(Number(response.primaComPre.toString()) + Number(response.igv.toString()), 2)
    //                 response.totalBruto = CommonMethods.formatValor(Number(response.primaCom.toString()) + Number(response.igv.toString()), 2)
    //             }

    //             if (Number(response.totalNeto) < Number(response.prima_min)) {
    //                 response.totalNeto = CommonMethods.formatValor(Number(response.prima_min), 2)
    //                 response.primaCom = CommonMethods.formatValor(response.totalNeto * dEmision, 2)
    //                 response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2)
    //                 response.totalBruto = CommonMethods.formatValor(Number(response.primaCom.toString()) + Number(response.igv.toString()), 2)
    //                 response.mensaje = this.variable.var_msjPrimaMin
    //             }

    //             if (item.channelDistributions != undefined) {
    //                 item.channelDistributions.forEach(channel => {
    //                     this.brokerList.forEach(broker => {
    //                         if (channel.roleId == broker.COD_CANAL) {
    //                             if (productoId == this.pensionID.id) {
    //                                 broker.P_COM_PENSION = (Number(response.commission) * Number(channel.distribution)) / 100;
    //                                 //broker.P_COM_PENSION = 0;
    //                             }
    //                             if (productoId == this.saludID.id) {
    //                                 broker.P_COM_SALUD = (Number(response.commission) * Number(channel.distribution)) / 100;
    //                                 //broker.P_COM_SALUD = 0;
    //                             }
    //                         }
    //                     });
    //                 });
    //             }
    //         }

    //         response.tasasProducto = tasasProducto;
    //     }
    //     else {
    //         response = null
    //     }
    //     return response;
    // }

    // FlagValidacionVL() {
    //     this.flagDisableVL = this.codProducto == 3 && (!this.stateQuotation || this.typeTran === 'Renovación' || this.typeTran === 'Declaración' || this.typeTran === 'Inclusión' || this.typeTran === 'Exclusión' || this.typeTran === 'Endoso') ? 1 : 0;
    // }

    validateMessage() {
        let msg = '';
        let flag = true;
        // this.FlagValidacionVL();

        if (this.template.ins_categoriaList) {
            if (this.flagPolizaMat != true && this.typeGobiernoMatriz == true) {
                if (this.categoryList.length == 0) {
                    flag = false;
                    this.inputsValidate[7] = true
                    msg += 'Para generar una cotización debe tener un producto <br>';
                }
            }
        }

        if (this.template.ins_planesList && this.typeGobiernoMatriz == true) {
            if (this.planesList.length == 0) {
                flag = false;
                this.inputsValidate[7] = true
                msg += 'Para generar una cotización debe tener un plan <br>';
            }
        }

        if (this.template.ins_tasasList) {
            if (this.tasasList.length == 0) {
                flag = false;
                this.inputsValidate[7] = true
                msg += 'Para generar una cotización debe tener un producto <br>';
            }
        }

        if (this.files.length == 0 && this.flagGobiernoEstado == true) {
            flag = false;
            msg = 'Debe adjuntar por lo menos un archivo<br />';
        }

        if (this.flagAprobCli && (this.inputsQuotation.SMAIL_EJECCOM == undefined || this.inputsQuotation.SMAIL_EJECCOM == '')) {
            flag = false;
            msg = 'Ingrese una dirección de correo electrónico para el ejecutivo comercial</br>';
        }

        if (flag) {
            // Campos simples
            if (this.inputsQuotation.P_NIDDOC_TYPE == '-1') {
                this.inputsValidate[0] = true
                msg += 'Debe ingresar el tipo de documento <br>';
            }

            if (this.inputsQuotation.P_SIDDOC == '') {
                this.inputsValidate[1] = true
                msg += 'Debe ingresar el número de documento <br>'
            }

            // Ini vidaley
            if (this.inputsQuotation.P_COMISION == '' && this.template.ins_comision && this.flagPolizaMat != true) {
                this.inputsValidate[16] = true
                msg += 'Debe ingresar el porcentaje de comisión <br>'
            }
            if (this.inputsQuotation.tipoRenovacion == '' && this.template.ins_tipRenovacion) {
                this.inputsValidate[17] = true
                msg += 'Debe ingresar el tipo de renovación <br>'
            }
            if (this.inputsQuotation.frecuenciaPago == '' && this.template.ins_frecPago) {
                this.inputsValidate[18] = true
                msg += 'Debe ingresar la frecuencia de pago <br>'
            }

            if (this.template.ins_email) {
                if (this.inputsQuotation.P_SE_MAIL == '' || this.inputsQuotation.P_SE_MAIL == undefined) {
                    this.inputsValidate[19] = true
                    msg += 'Debe ingresar un correo electrónico para la factura.';
                } else {
                    if (this.regexConfig('email').test(this.inputsQuotation.P_SE_MAIL) == false) {
                        this.inputsValidate[19] = true
                        msg += 'El correo electrónico es inválido.';
                    }
                }
            }

            if (this.inputsQuotation.P_SDESDIREBUSQ == '' || this.inputsQuotation.P_SDESDIREBUSQ == undefined) {
                msg += 'La dirección del cliente no puede estar vacío <br>';
            }

            if (this.nrocotizacion == undefined || this.nrocotizacion == '') {
                if (this.inputsQuotation.P_NIDDOC_TYPE == '1') {
                    if (this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '10' || this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '15' || this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '17') {
                        if (this.inputsQuotation.P_SFIRSTNAME == '' || this.inputsQuotation.P_SFIRSTNAME == null) {
                            msg += 'El nombre del cliente no puede estar vacío <br>';
                        }
                        if (this.inputsQuotation.P_SLASTNAME == '' || this.inputsQuotation.P_SLASTNAME == null) {
                            msg += 'El apellido paterno del cliente no puede estar vacío <br>';
                        }
                    } else {
                        if (this.inputsQuotation.P_SLEGALNAME == '' || this.inputsQuotation.P_SLEGALNAME == null) {
                            msg += 'La razón social del cliente no puede estar vacío <br>';
                        }
                    }

                } else {
                    if (this.inputsQuotation.P_SFIRSTNAME == '' || this.inputsQuotation.P_SFIRSTNAME == null) {
                        msg += 'El nombre del cliente no puede estar vacío <br>';
                    }
                    if (this.inputsQuotation.P_SLASTNAME == '' || this.inputsQuotation.P_SLASTNAME == null) {
                        msg += 'El apellido paterno del cliente no puede estar vacío <br>';
                    }
                }
            }

            if (this.brokerList.length > 0) {
                var index = 0;
                this.brokerList.forEach(broker => {
                    if (this.listaTasasSalud.length > 0 && this.template.ins_saludList) {
                        if (broker.valItemSal == true) {
                            msg += 'La suma total de las comisiones propuestas es mayor a 100 [Salud]<br>'
                        }
                    }
                    if (this.listaTasasPension.length > 0 && this.template.ins_pensionList) {
                        if (broker.valItemPen == true) {
                            msg += 'La suma total de las comisiones propuestas es mayor a 100 [Pensión]<br>'
                        }
                    }

                    if ((this.nTransac == 1 || this.nTransac == 4) && this.sAbTransac != 'DE') {
                        let obj = this.BrokerObl.find(o => o.NINTERMED == broker.COD_CANAL)

                        if (obj != null && (this.selectedDep[index] == null || this.selectedDep[index] == "0")) {
                            msg += 'Falta completar campo oficina de producción <br>'
                        }
                    }
                    index = index + 1;

                });
            } else {
                msg += 'Debe seleccionar al menos un broker <br>'
            }

            if (this.inputsQuotation.P_NPRODUCT == '-1') {
                this.inputsValidate[11] = true
                msg += 'Debe seleccionar un producto válido <br>'
            }

            if (this.sedesList.length > 0) {
                if (this.inputsQuotation.P_NIDSEDE == null || this.inputsQuotation.P_NIDSEDE == 0) {
                    this.inputsValidate[2] = true
                    msg += 'Debe seleccionar una sede válida <br>'
                }
            } else {
                if ((this.inputsQuotation.P_NTECHNICAL == null || this.inputsQuotation.P_NTECHNICAL == 0)
                    && this.template.ins_actRealizar) {
                    this.inputsValidate[12] = true
                    msg += 'Debe seleccionar una actividad a realizar válida <br>'
                }
                if (((this.inputsQuotation.P_NECONOMIC == null || this.inputsQuotation.P_NECONOMIC == 0) && this.flagDisableVL == 0)
                    && this.template.ins_subActividad) {
                    this.inputsValidate[3] = true
                    msg += 'Debe seleccionar una actividad económica válida <br>'
                }
                if ((this.inputsQuotation.P_NPROVINCE == null || this.inputsQuotation.P_NPROVINCE == 0)
                    && this.template.ins_departamento) {
                    this.inputsValidate[4] = true
                    msg += 'Debe seleccionar un departamento válida <br>'
                }
                if ((this.inputsQuotation.P_NLOCAL == null || this.inputsQuotation.P_NLOCAL == 0)
                    && this.template.ins_provincia) {
                    this.inputsValidate[5] = true
                    msg += 'Debe seleccionar una provincia válida <br>'
                }
                if ((this.inputsQuotation.P_NMUNICIPALITY == null || this.inputsQuotation.P_NMUNICIPALITY == 0)
                    && this.template.ins_distrito) {
                    this.inputsValidate[6] = true
                    msg += 'Debe seleccionar un distrito válida <br>'
                }
            }

            let countWorker = 0;
            let countPlanilla = 0;

            if (this.listaTasasSalud.length > 0 && this.template.ins_saludList) {
                this.listaTasasSalud.forEach(item => {
                    if (item.totalWorkes == 0) {
                        this.inputsValidate[8] = true
                        countWorker++
                    } else {
                        if (item.planilla == 0) {
                            msg += 'Debe ingresar un monto en el campo planilla de la categoría ' + item.description + ' [Salud] <br>'
                        }
                    }
                    if (item.planilla == 0) {
                        this.inputsValidate[9] = true
                        countPlanilla++;
                    } else {
                        if (item.totalWorkes == 0) {
                            msg += 'Debe ingresar trabajadores de la categoría ' + item.description + ' [Salud] <br>'
                        }
                    }

                    if (item.totalWorkes == 0 && item.planilla == 0) {
                        if (item.planProp != 0) {
                            if (!this.template.ins_mapfre) {
                                msg += 'No puedes proponer tasa en la categoría ' + item.description + ' [Salud]<br>'
                            }
                        }
                    } else {
                        if (item.valItem == true) {
                            if (!this.template.ins_mapfre) {
                                msg += 'La tasa propuesta es mayor a 100 en la categoría ' + item.description + ' [Salud]<br>'
                            }
                            if (this.template.ins_mapfre) {
                                msg += 'La tasa propuesta es mayor a 100 <br>'
                            }
                        }
                    }
                });
            }

            if (this.listaTasasPension.length > 0 && this.template.ins_pensionList) {
                this.listaTasasPension.forEach(item => {
                    if (item.totalWorkes == 0) {
                        this.inputsValidate[8] = true
                        countWorker++
                    } else {
                        if (item.planilla == 0) {
                            msg += 'Debe ingresar un monto en el campo planilla de la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }
                    if (item.planilla == 0) {
                        this.inputsValidate[9] = true
                        countPlanilla++;
                    } else {
                        if (item.totalWorkes == 0) {
                            msg += 'Debe ingresar trabajadores de la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }

                    if (item.totalWorkes == 0 && item.planilla == 0) {
                        if (item.planProp != 0) {
                            msg += 'No puedes proponer tasa en la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    } else {
                        if (item.valItem == true) {
                            msg += 'La tasa es mayor a 100 en la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }

                });
            }

            if (this.template.ins_tasasList) {
                if (this.listaTasasPension.length > 0 && this.listaTasasSalud.length > 0) {
                    var tasasTotalSCTRMIX = this.listaTasasPension.length + this.listaTasasSalud.length

                    if (countPlanilla == tasasTotalSCTRMIX) {
                        if (countWorker == tasasTotalSCTRMIX) {
                            msg += 'Debe ingresar trabajadores al menos en un tipo de riesgo <br>';
                        }
                    }
                    if (countWorker == tasasTotalSCTRMIX) {
                        if (countPlanilla == tasasTotalSCTRMIX) {
                            msg += 'Debe ingresar planilla al menos en un tipo de riesgo <br>';
                        }
                    }
                } else {
                    if (countPlanilla == this.tasasList.length) {
                        if (countWorker == this.tasasList.length) {
                            msg += 'Debe ingresar trabajadores al menos en un tipo de riesgo <br>';
                        }
                    }
                    if (countWorker == this.tasasList.length) {
                        if (countPlanilla == this.tasasList.length) {
                            msg += 'Debe ingresar planilla al menos en un tipo de riesgo <br>';
                        }
                    }
                }
            }
        }

        if (this.messageWorker != '') {
            msg += 'Para continuar debe haber calculado la prima <br />';
        }

        let sumSize = 0;
        this.files.forEach(file => {
            sumSize = sumSize + file.size;
        });

        if (sumSize > this.maxSize) {
            this.inputsValidate[10] = true
            msg += 'La suma del tamaño de los archivos no puede superar los 10MB  <br>';
        }

        if(this.flag_tasas == 0){
            msg += 'Deben existir tasas validas para poder generar la cotización <br>';
        }

        return msg;
    }

    objEmailClient() {
        return {
            P_CLASS: '',
            P_DESTICORREO: 'Correo Personal',
            P_NROW: 1,
            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            P_SE_MAIL: this.inputsQuotation.P_SE_MAIL,
            P_SORIGEN: 'SCTR',
            P_SRECTYPE: '4',
            P_TipOper: ''
        };
    }

    async managerInfoClient(self) {
        if (this.contractingdata != undefined) {
            if (this.flagEmail || this.flagContact) {
                this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.contractingdata.P_TipOper = 'INS'
                this.contractingdata.P_NCLIENT_SEG = -1;

                if (this.flagEmail && this.inputsQuotation.P_SE_MAIL !== '') {
                    this.contractingdata.EListEmailClient = [];
                    this.contractingdata.EListEmailClient.push(this.objEmailClient())
                } else {
                    this.contractingdata.EListEmailClient = null;
                }

                if (this.flagContact && this.contactList.length > 0) {
                    this.contractingdata.EListContactClient = [];
                    self.contactList.forEach(contact => {
                        contact.P_NTIPCONT = contact.P_NTIPCONT == 0 ? 99 : contact.P_NTIPCONT;
                        contact.P_NIDDOC_TYPE = contact.P_NIDDOC_TYPE == '0' ? null : contact.P_NIDDOC_TYPE;
                        contact.P_SIDDOC = contact.P_NIDDOC_TYPE == '0' ? null : contact.P_SIDDOC;
                    });
                    this.contractingdata.EListContactClient = this.contactList;
                } else {
                    this.contractingdata.EListContactClient = null;
                }

                if (((this.flagContact && this.contactList.length == 0) ||
                    (this.flagEmail && this.inputsQuotation.P_SE_MAIL === ''))
                    && this.creditHistory != null) {
                    self.isLoading = false;
                    swal.fire({
                        title: 'Información',
                        text: this.creditHistory.nflag == 0 ? this.variable.var_contactHighScore : this.variable.var_contactLowScore,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    })
                        .then(async (result) => {
                            if (result.value) {
                                self.isLoading = true;
                                await this.updateContracting();
                            } else {
                                self.isLoading = false;
                                return;
                            }
                        });
                } else {
                    await this.updateContracting();
                }
            } else {
                this.emitirCotizacion();
            }
        } else {
            swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
            self.isLoading = false;
            return;
        }
    }


    async grabarCotizacion() {

        this.isLoading = true;
        const self = this;

        let msg = this.validateMessage();
        if (msg == '') {
            if (self.template.ins_email || self.template.ins_addContact) {
                this.managerInfoClient(this);
            } else {
                if (this.typeTran != 'Exclusión') {
                    this.emitirCotizacion()
                }
            }

        } else {
            swal.fire('Información', msg, 'error');
            self.isLoading = false;
            return;
        }
    }

    async updateContracting() {
        if ((this.flagEmail && this.inputsQuotation.P_SE_MAIL !== '') || (this.flagContact && this.contactList.length > 0)) {
            this.contractingdata.EListAddresClient = null;
            this.contractingdata.EListPhoneClient = null;
            this.contractingdata.EListCIIUClient = null;

            await this.clientInformationService.insertContractingData(this.contractingdata).toPromise().then(
                res => {
                    if (res.P_NCODE == '0' || res.P_NCODE == '2') {
                        this.flagEmail = false;
                        this.flagContact = false;
                        this.emitirCotizacion()
                    } else {
                        this.isLoading = false;
                        swal.fire('Información', res.P_SMESSAGE, 'error');
                        return;
                    }
                }
            );
        } else {
            this.emitirCotizacion()
        }
    }

    async emitirCotizacion() {
        this.isLoading = false;

        if (!await this.validateRetroactivity()) {
            return;
        }

        const confirmacion = await this.mostrarConfirmacion();
        if (!confirmacion) return;

        this.isLoading = true;
        await this.procesarCotizacion();

        // swal.fire({
        //     title: 'Información',
        //     text: '¿Desea generar la cotización?',
        //     icon: 'question',
        //     showCancelButton: true,
        //     confirmButtonText: 'Generar',
        //     allowOutsideClick: false,
        //     cancelButtonText: 'Cancelar'
        // })
        //     .then((result) => {
        //         if (result.value) {
        //             self.isLoading = true;
        //             if (self.template.ins_sede) {
        //                 if (self.sedesList.length == 0) {
        //                     const sede: any = {};
        //                     sede.Action = '1'
        //                     sede.Address = 'DIRECCION PRINCIPAL'
        //                     sede.ContactList = []
        //                     sede.ContractorId = this.contratanteId
        //                     sede.DepartmentId = this.inputsQuotation.P_NPROVINCE
        //                     sede.Description = 'PRINCIPAL'
        //                     sede.DistrictId = this.inputsQuotation.P_NMUNICIPALITY
        //                     sede.EconomicActivityId = this.inputsQuotation.P_NECONOMIC
        //                     sede.ProvinceId = this.inputsQuotation.P_NLOCAL
        //                     sede.StateId = '1'
        //                     sede.TechnicalActivityId = this.inputsQuotation.P_NTECHNICAL
        //                     sede.TypeId = '1'
        //                     sede.UserCode = JSON.parse(localStorage.getItem('currentUser'))['id']

        //                     this.contractorLocationIndexService.updateContractorLocation(sede).subscribe(
        //                         res => {
        //                             if (res.P_NCODE == 0) {
        //                                 this.sedeId = res.P_RESULT;
        //                                 self.proceso(this.sedeId, self)
        //                             } else if (res.P_NCODE == 1) {
        //                                 self.isLoading = false;
        //                                 swal.fire('Información', 'Ocurrió un problema en la creación de la sede', 'error');
        //                                 return;
        //                             } else if (res.P_NCODE == 2) {
        //                                 self.proceso(this.sedeId, self)
        //                             }
        //                         },
        //                         err => {
        //                             swal.fire('Información', err, 'error');
        //                         }
        //                     );
        //                 } else {
        //                     self.proceso(this.sedeId, self)
        //                 }
        //             } else {
        //                 self.proceso(1, self)
        //             }
        //         }
        //     });
    }

    // Función para procesar la cotización
    private async procesarCotizacion() {
        if (this.template.ins_sede) {
            if (this.sedesList.length === 0) {
                const sede = this.crearSede();
                await this.actualizarSede(sede);
            } else {
                this.proceso(this.sedeId, this);
            }
        } else {
            this.proceso(1, this);
        }
    }

    // Función para crear la sede
    private crearSede(): any {
        return {
            Action: '1',
            Address: 'DIRECCION PRINCIPAL',
            ContactList: [],
            ContractorId: this.contratanteId,
            DepartmentId: this.inputsQuotation.P_NPROVINCE,
            Description: 'PRINCIPAL',
            DistrictId: this.inputsQuotation.P_NMUNICIPALITY,
            EconomicActivityId: this.inputsQuotation.P_NECONOMIC,
            ProvinceId: this.inputsQuotation.P_NLOCAL,
            StateId: '1',
            TechnicalActivityId: this.inputsQuotation.P_NTECHNICAL,
            TypeId: '1',
            UserCode: JSON.parse(localStorage.getItem('currentUser'))['id']
        };
    }

    // Función para actualizar la sede
    private async actualizarSede(sede: any) {
        this.contractorLocationIndexService.updateContractorLocation(sede).subscribe(
            res => this.manejarRespuesta(res),
            err => swal.fire('Información', err, 'error')
        );
    }

    // Función para manejar la respuesta de la actualización de la sede
    private manejarRespuesta(res: any) {
        if (res.P_NCODE === 0) {
            this.sedeId = res.P_RESULT;
            this.proceso(this.sedeId, this);
        } else if (res.P_NCODE === 1) {
            this.isLoading = false;
            swal.fire('Información', 'Ocurrió un problema en la creación de la sede', 'error');
        } else if (res.P_NCODE === 2) {
            this.proceso(this.sedeId, this);
        }
    }

    private async mostrarConfirmacion(): Promise<boolean> {
        const result = await swal.fire({
            title: 'Información',
            text: '¿Desea generar la cotización?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        });
        return result.value || false;
    }

    async proceso(sedeId, self) {

        const dataQuotation = this.constructDataQuotation(sedeId);

        localStorage.setItem('dataquotation', JSON.stringify(dataQuotation));

        await this.populateQuotationDetails(dataQuotation);

        const myFormData = this.createFormData(dataQuotation);

        this.quotationService.insertQuotation(myFormData).subscribe(
            async res => await this.handleQuotationResponse(res, self, myFormData),
            err => {
                self.isLoading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
        );

        // const dataQuotation: any = {};
        // dataQuotation.P_SCLIENT = this.contratanteId;
        // dataQuotation.P_NCURRENCY = this.inputsQuotation.P_NCURRENCY;
        // dataQuotation.P_NBRANCH = this.inputsQuotation.NBRANCH;
        // dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIni); // Fecha Inicio
        // dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.FDateFin);; // Fecha Inicio

        // dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
        // dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);

        // dataQuotation.P_NIDCLIENTLOCATION = this.template.ins_sede ? self.sedesList.length > 0 ? this.inputsQuotation.P_NIDSEDE : sedeId : sedeId;
        // dataQuotation.P_SCOMMENT = this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, '');
        // dataQuotation.P_SRUTA = '';
        // dataQuotation.P_NUSERCODE = this.userId;
        // dataQuotation.P_NACT_MINA = this.inputsQuotation.P_MINA == true ? 1 : 0;
        // dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion; // Vida Ley
        // dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago; // Vida Ley
        // //dataQuotation.P_SCOD_ACTIVITY_TEC = !this.template.ins_actRealizarSave ? null : this.inputsQuotation.P_NTECHNICAL; // Vida Ley
        // //dataQuotation.P_SCOD_CIUU = !this.template.ins_subActividadSave ? null : this.inputsQuotation.P_NECONOMIC; // Vida Ley
        // if (dataQuotation.P_NBRANCH == '77') { //SCTR
        //     dataQuotation.P_SCOD_ACTIVITY_TEC = this.inputsQuotation.P_NTECHNICAL;
        //     dataQuotation.P_SCOD_CIUU = this.inputsQuotation.P_NECONOMIC;
        // } else {
        //     dataQuotation.P_SCOD_ACTIVITY_TEC = !this.template.ins_actRealizarSave ? null : this.inputsQuotation.P_NTECHNICAL;
        //     dataQuotation.P_SCOD_CIUU = !this.template.ins_subActividadSave ? null : this.inputsQuotation.P_NECONOMIC;
        // }

        // dataQuotation.P_NTIP_NCOMISSION = this.inputsQuotation.P_COMISION; // Vida Ley
        // dataQuotation.P_NPRODUCT = this.inputsQuotation.P_NPRODUCT; // Vida Ley
        // dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
        // dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
        // dataQuotation.P_NCOMISION_SAL_PR = 0 // MRC
        // dataQuotation.CodigoProceso = this.codProcess // MRC
        // dataQuotation.P_NREM_EXC = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //RQ EXC EHH
        // dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;//ehh retroactividad
        // dataQuotation.retOP = 2; //ehh retroactividad
        // dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIni.setHours(0, 0, 0, 0) ? 1 : 0;//ehh retroactividad
        // dataQuotation.TrxCode = this.sAbTransac;
        // dataQuotation.tipoEndoso = this.inputsQuotation.P_NTYPE_END == '' ? 0 : this.inputsQuotation.P_NTYPE_END; //rq mejoras de endoso
        // dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
        // dataQuotation.P_SPOL_MATRIZ = this.flagPolizaMat == true ? 1 : 0;
        // dataQuotation.P_SPOL_ESTADO = this.flagGobiernoEstado == true ? 1 : 0;
        // dataQuotation.FlagCotEstado = dataQuotation.P_SPOL_ESTADO;
        // dataQuotation.P_NIDPLAN = this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.inputsQuotation.desTipoPlanPM).NIDPLAN;;
        // dataQuotation.P_APROB_CLI = this.flagAprobCli == true ? 1 : 0;
        // let desTipoPlan = this.flagPolizaMat == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
        // let planPropuesto = this.flagPolizaMat == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
        // dataQuotation.flagComerExclu = this.flagComerExclu; //RQ - Perfil Nuevo - Comercial Exclusivo
        // dataQuotation.P_NCOT_MIXTA = this.inputsQuotation.P_NPRODUCT == 0 ? 1 : this.inputsQuotation.P_NPRODUCT || this.inputsQuotation.P_NPRODUCT != 0 ? 0 : this.inputsQuotation.P_NPRODUCT; //AVS - INTERCONEXION SABSA
        // dataQuotation.sctrSALUD = this.saludID != null && this.saludID !== undefined ? (this.saludID.id != null && this.saludID.id !== undefined ? Number(this.saludID.id) : 0) : 0; //AVS - INTERCONEXION SABSA
        // dataQuotation.sctrPENSION = this.pensionID != null && this.pensionID !== undefined ? (this.pensionID.id != null && this.pensionID.id !== undefined ? Number(this.pensionID.id) : 0) : 0; //AVS - INTERCONEXION SABSA 06/11/2023
        // dataQuotation.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
        // dataQuotation.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA 

        // localStorage.setItem('dataquotation', JSON.stringify(dataQuotation));

        // dataQuotation.QuotationDet = [];
        // dataQuotation.QuotationCom = [];

        // if (this.listaTasasSalud.length > 0 && this.template.ins_mapfre) {
        //     dataQuotation.cotizacionMapfre = {}
        //     dataQuotation.cotizacionMapfre.cabecera = {}
        //     dataQuotation.cotizacionMapfre.cabecera.tariff = this.reloadTariff
        //     dataQuotation.cotizacionMapfre.cabecera.keyService = 'cotizar'
        //     dataQuotation.cotizacionMapfre.poliza = {}
        //     dataQuotation.cotizacionMapfre.poliza.fecEfecSpto = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
        //     dataQuotation.cotizacionMapfre.poliza.fecVctoSpto = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
        //     dataQuotation.cotizacionMapfre.poliza.codFormaDeclaracion = await this.equivalenciaMapfre(this.inputsQuotation.tipoRenovacion, 'renovacion', 'tableKey') // Tipo de renovación
        //     dataQuotation.cotizacionMapfre.poliza.codActRiesgo = await this.equivalenciaMapfre(this.inputsQuotation.P_NECONOMIC, 'actividadEconomica', 'tableKey') // Revisar CIIU
        //     dataQuotation.cotizacionMapfre.poliza.tipoPeriodo = this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4' ? 'C' : 'N' // Revisar
        //     dataQuotation.cotizacionMapfre.poliza.moneda = {}
        //     dataQuotation.cotizacionMapfre.poliza.moneda.codMon = this.inputsQuotation.P_NCURRENCY
        //     dataQuotation.cotizacionMapfre.producto = {}
        //     dataQuotation.cotizacionMapfre.riesgoSCTR = []
        //     const item: any = {}
        //     item.nomCentroRiesgoSalud = this.inputsQuotation.P_SSEDE
        //     item.numAsegSalud = this.inputsQuotation.P_WORKER;
        //     item.impPlanillaSalud = this.inputsQuotation.P_PLANILLA;
        //     dataQuotation.cotizacionMapfre.riesgoSCTR.push(item)
        //     dataQuotation.cotizacionMapfre.contratante = {}
        //     dataQuotation.cotizacionMapfre.contratante.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //'DNI' equivalente
        //     dataQuotation.cotizacionMapfre.contratante.codDocum = this.inputsQuotation.P_SIDDOC
        //     dataQuotation.cotizacionMapfre.contratante.nombre = this.contractingdata.P_NPERSON_TYP == '1' ? this.contractingdata.P_SFIRSTNAME + ' ' + this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : this.contractingdata.P_SLEGALNAME
        //     dataQuotation.cotizacionMapfre.mcaGuardado = 'S'
        // }

        // Detalle de Cotizacion Pension
        // if (this.template.ins_pensionList) {
        //     if (this.listaTasasPension.length > 0) {
        //         this.listaTasasPension.forEach(dataPension => {
        //             if (dataPension.sactive) {
        //                 const itemQuotationDet: any = {};
        //                 itemQuotationDet.P_NBRANCH = this.pensionID.nbranch;
        //                 itemQuotationDet.P_NPRODUCT = this.pensionID.id;
        //                 itemQuotationDet.P_NMODULEC = dataPension.nmodulec;
        //                 itemQuotationDet.P_NTOTAL_TRABAJADORES = dataPension.totalWorkes;
        //                 itemQuotationDet.P_NMONTO_PLANILLA = dataPension.planilla;
        //                 itemQuotationDet.P_NTASA_CALCULADA = dataPension.rate;
        //                 itemQuotationDet.P_NTASA_PROP = dataPension.planProp == '' ? '0' : dataPension.planProp;
        //                 itemQuotationDet.P_NPREMIUM_MENSUAL = dataPension.premiumMonth;
        //                 itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
        //                 itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
        //                 itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
        //                 itemQuotationDet.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
        //                 itemQuotationDet.P_NSUM_IGV = this.igvPensionSave;
        //                 itemQuotationDet.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
        //                 itemQuotationDet.P_NRATE = dataPension.rate;
        //                 itemQuotationDet.P_NDISCOUNT = this.discountPension == 0 ? '0' : this.discountPension;
        //                 itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == 0 ? '0' : this.activityVariationPension;
        //                 itemQuotationDet.P_FLAG = '0';
        //                 //Ini - RI
        //                 itemQuotationDet.P_NAMO_AFEC = this.totalNetoPensionSave;
        //                 itemQuotationDet.P_NIVA = this.igvPensionSave;
        //                 itemQuotationDet.P_NAMOUNT = this.brutaTotalPensionSave;
        //                 itemQuotationDet.P_NDE = CommonMethods.formatValor(Number(this.inputsQuotation.primaComPension) - Number(this.totalNetoPensionSave), 2);
        //                 //Fin - RI
        //                 dataQuotation.QuotationDet.push(itemQuotationDet);
        //             }
        //         });
        //     }
        // }

        // Detalle de Cotizacion Salud
        // if (this.template.ins_saludList) {
        //     if (this.listaTasasSalud.length > 0) {
        //         this.listaTasasSalud.forEach(dataSalud => {
        //             const itemQuotationDet: any = {};
        //             itemQuotationDet.P_NBRANCH = this.saludID.nbranch;
        //             itemQuotationDet.P_NPRODUCT = this.saludID.id; // Salud
        //             itemQuotationDet.P_NMODULEC = dataSalud.nmodulec;
        //             itemQuotationDet.P_NTOTAL_TRABAJADORES = dataSalud.totalWorkes;
        //             itemQuotationDet.P_NMONTO_PLANILLA = dataSalud.planilla;
        //             itemQuotationDet.P_NTASA_CALCULADA = dataSalud.rate;
        //             itemQuotationDet.P_NTASA_PROP = dataSalud.planProp == '' ? '0' : dataSalud.planProp;
        //             itemQuotationDet.P_NPREMIUM_MENSUAL = dataSalud.premiumMonth;
        //             itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_SALUD;
        //             itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
        //             itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_SALUD == '' ? '0' : this.inputsQuotation.P_PRIMA_END_SALUD;
        //             itemQuotationDet.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
        //             itemQuotationDet.P_NSUM_IGV = this.igvSaludSave;
        //             itemQuotationDet.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
        //             itemQuotationDet.P_NRATE = dataSalud.rate;
        //             itemQuotationDet.P_NDISCOUNT = this.discountSalud == 0 ? '0' : this.discountSalud;
        //             itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationSalud == 0 ? '0' : this.activityVariationSalud;
        //             itemQuotationDet.P_FLAG = '0';
        //             //Ini - RI
        //             itemQuotationDet.P_NAMO_AFEC = this.totalNetoSaludSave;
        //             itemQuotationDet.P_NIVA = this.igvSaludSave;
        //             itemQuotationDet.P_NAMOUNT = this.brutaTotalSaludSave;
        //             itemQuotationDet.P_NDE = CommonMethods.formatValor(Number(this.inputsQuotation.primaComSalud) - Number(this.totalNetoSaludSave), 2);
        //             //Fin - RI
        //             dataQuotation.QuotationDet.push(itemQuotationDet);
        //         });
        //     }
        // }


        // Comercializadores
        // if (this.brokerList.length > 0) {
        //     var index = 0;
        //     this.brokerList.forEach(dataBroker => {
        //         const itemQuotationCom: any = {};
        //         itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
        //         itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
        //         itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
        //         itemQuotationCom.P_NCOMISION_SAL = self.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD == '' ? '0' : dataBroker.P_COM_SALUD : '0';
        //         itemQuotationCom.P_NCOMISION_SAL_PR = self.listaTasasSalud.length > 0 ? this.flagCheckboxComisionSalud ? (dataBroker.P_COM_SALUD_PRO !== '0' ? dataBroker.P_COM_SALUD_PRO : '0') : (dataBroker.P_COM_SALUD_PRO == '' ? '0' : dataBroker.P_COM_SALUD_PRO) : '0';
        //         itemQuotationCom.P_NCOMISION_PEN = self.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION == '' ? '0' : dataBroker.P_COM_PENSION : '0';
        //         itemQuotationCom.P_NCOMISION_PEN_PR = self.listaTasasPension.length > 0 ? this.flagCheckboxComisionPension ? (dataBroker.P_COM_PENSION_PRO !== '0' ? dataBroker.P_COM_PENSION_PRO : '0') : (dataBroker.P_COM_PENSION_PRO == '' ? '0' : dataBroker.P_COM_PENSION_PRO) : '0';
        //         itemQuotationCom.P_NPRINCIPAL = 1;
        //         itemQuotationCom.P_NLOCAL = this.selectedDep[index];
        //         dataQuotation.QuotationCom.push(itemQuotationCom);
        //         index = index + 1;
        //     });
        // }

        // this.listaEPS_SCTR_QUOT = [];
        // if (Number(this.epsItem.NCODE) == 3 && (dataQuotation.P_NCOT_MIXTA == 1 || this.inputsQuotation.P_NPRODUCT == '2')) { //AVS INTERCONEXION SABSA 19/07/2023
        //     await this.dataCotizacion_EPS();
        // }
        // // const myFormData: FormData = new FormData()
        // // this.files.forEach(file => {
        // //     myFormData.append(file.name, file);
        // // });

        // // myFormData.append('objeto', JSON.stringify(dataQuotation));
        // // myFormData.append('objeto_EPS', JSON.stringify(this.dataQuotation_EPS));
        // //Marcos Silverio
        // const dataValidaCambioPlan = {
        //     PlanPropuesto: this.planPropuesto,
        //     PlanSeleccionado: this.flagPolizaMat ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan,
        //     TipoTransaccion: this.typeTran
        // };
        // myFormData.append('objetoValidaCambioPlan', JSON.stringify(dataValidaCambioPlan));

        // this.quotationService.insertQuotation(myFormData).subscribe(
        //     async res => {
        //         let quotationNumber = 0;
        //         let transactNumber = 0;
        //         let mensajeRes = '';
        //         let mensajeOperaciones = ' el cual fue derivado al área de operaciones para su gestión';
        //         let mensajePolMatriz = this.flagPolizaMat ? ' y el trámite de Emisión de póliza matriz' : !this.flagPolizaMat && this.flagGobiernoEstado ? ' y el trámite de Emisión' : '';
        //         if (res.P_COD_ERR == 0) {
        //             this.inputsQuotation.P_MINA = false;
        //             quotationNumber = res.P_NID_COTIZACION;
        //             transactNumber = res.P_NID_TRAMITE;
        //             self.isLoading = false;
        //             if (this.codProducto == 2) {
        //                 if (this.validateDebtResponse.lockMark === 1) {
        //                     self.isLoading = false;
        //                     this.clearInsert();
        //                     this.clearInsertSCTR();
        //                     /*if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
        //                         mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + 'el cliente cuenta con deuda pendiente y no se puede emitir la poliza';
        //                     } else {*/
        //                     mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE;
        //                     //}
        //                     swal.fire('Información', mensajeRes, 'success');
        //                     this.router.navigate(['/broker/sctr/consulta-cotizacion']);
        //                 } else {
        //                     this.clearInsert();
        //                     await this.emitPolicy(res, self, quotationNumber, myFormData);
        //                 }
        //             } else {
        //                 if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {
        //                     if (!this.flagContact && (!this.flagEmail && this.inputsQuotation.P_SE_MAIL != '')) {
        //                         if (this.validateDebtResponse.lockMark === 1) {
        //                             self.isLoading = false;
        //                             this.clearInsert();
        //                             if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
        //                                 mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ', ' + res.P_SMESSAGE;
        //                             } else {
        //                                 mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE;
        //                             }
        //                             swal.fire('Información', mensajeRes, 'success');
        //                         } else {
        //                             await this.emitPolicy(res, self, quotationNumber, myFormData);
        //                         }

        //                     } else {
        //                         if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
        //                             swal.fire('Información', 'Se ha generado correctamente la recotización N° ' + quotationNumber, 'success');
        //                             this.clearInsert();
        //                             this.router.navigate(['/broker/sctr/consulta-cotizacion'])
        //                         } else {
        //                             swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber, 'success');
        //                             this.clearInsert();
        //                             this.router.navigate(['/broker/sctr/consulta-cotizacion'])
        //                         }
        //                     }
        //                 } else {
        //                     if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
        //                         if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
        //                             mensajeRes = 'Se ha generado correctamente la recotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ',' + res.P_SMESSAGE;
        //                         } else {
        //                             mensajeRes = 'Se ha generado correctamente la recotización N° ' + quotationNumber + ',' + res.P_SMESSAGE;
        //                         }
        //                         swal.fire('Información', mensajeRes, 'success');

        //                         this.clearInsert();
        //                         this.router.navigate(['/broker/sctr/consulta-cotizacion'])
        //                     } else {
        //                         if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo

        //                             mensajeRes = this.flagGobiernoEstado && this.flagPolizaMat ? 'Se ha generado correctamente la cotización N° ' + quotationNumber + mensajePolMatriz + ' N° ' + transactNumber + ',' + mensajeOperaciones :
        //                                 this.flagGobiernoEstado && !this.flagPolizaMat ? 'Se ha generado correctamente la cotización N° ' + quotationNumber + mensajePolMatriz + ' N° ' + transactNumber + ',' + mensajeOperaciones
        //                                     : 'Se ha generado correctamente la cotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ',' + res.P_SMESSAGE;
        //                         } else {
        //                             mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ',' + res.P_SMESSAGE;
        //                         }
        //                         swal.fire('Información', mensajeRes, 'success');
        //                         this.clearInsert();
        //                         this.router.navigate(['/broker/sctr/consulta-cotizacion'])
        //                     }
        //                 }
        //                 // }
        //             }

        //         } else {
        //             self.isLoading = false;
        //             swal.fire('Información', res.P_MESSAGE, 'error');
        //         }
        //     },
        //     err => {
        //         self.isLoading = false;
        //         swal.fire('Información', 'Hubo un error con el servidor', 'error');
        //     }
        // );
    }
    async handleQuotationResponse(res, self, myFormData) {
        self.isLoading = false;
        let mensajeRes = '';

        if (res.P_COD_ERR === 0) {
            const quotationNumber = res.P_NID_COTIZACION;

            if (this.validateDebtResponse.lockMark === 1) {
                this.clearInsert();
                this.clearInsertSCTR();
                mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE;
                swal.fire('Información', mensajeRes, 'success');
                this.router.navigate(['/broker/sctr/consulta-cotizacion']);
            } else {
                this.clearInsert();
                await this.emitPolicy(res, self, quotationNumber, myFormData);
            }

        } else {
            swal.fire('Información', res.P_MESSAGE, 'error');
        }
    }
    constructDataQuotation(sedeId) {
        return {
            P_SCLIENT: this.contratanteId,
            P_NCURRENCY: this.inputsQuotation.P_NCURRENCY,
            P_NBRANCH: this.inputsQuotation.NBRANCH,
            P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.FDateIni),
            P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.FDateFin),
            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
            P_NIDCLIENTLOCATION: this.sedesList.length > 0 ? this.inputsQuotation.P_NIDSEDE : sedeId,
            P_SCOMMENT: this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, ''),
            P_SRUTA: '',
            P_NUSERCODE: this.userId,
            P_NACT_MINA: this.inputsQuotation.P_MINA ? 1 : 0,
            P_NTIP_RENOV: this.inputsQuotation.tipoRenovacion,
            P_NPAYFREQ: this.inputsQuotation.frecuenciaPago,
            P_SCOD_ACTIVITY_TEC: this.inputsQuotation.P_NTECHNICAL,
            P_SCOD_CIUU: this.inputsQuotation.P_NECONOMIC,
            P_NTIP_NCOMISSION: this.inputsQuotation.P_COMISION,
            P_NPRODUCT: this.inputsQuotation.P_NPRODUCT == 0 ? 1 : this.inputsQuotation.P_NPRODUCT, // this.inputsQuotation.P_NPRODUCT,
            P_NEPS: this.epsItem.NCODE,
            P_NPENDIENTE: 0,
            P_NCOMISION_SAL_PR: 0,
            CodigoProceso: this.codProcess,
            P_NREM_EXC: this.inputsQuotation.P_NREM_EXC ? 1 : 0,
            P_DERIVA_RETRO: this.derivaRetroactividad ? 1 : 0,
            retOP: 2,
            FlagCambioFecha: 0,
            TrxCode: this.sAbTransac,
            tipoEndoso: 0,
            SMAIL_EJECCOM: this.inputsQuotation.SMAIL_EJECCOM,
            P_SPOL_MATRIZ: 0,
            P_SPOL_ESTADO: this.flagGobiernoEstado ? 1 : 0,
            FlagCotEstado: this.flagGobiernoEstado ? 1 : 0,
            P_NIDPLAN: 0,
            P_APROB_CLI: this.flagAprobCli ? 1 : 0,
            flagComerExclu: this.flagComerExclu,
            P_NCOT_MIXTA: this.inputsQuotation.P_NPRODUCT == 0 ? 1 : 0,
            sctrSALUD: 2,
            sctrPENSION: 1,
            flagComisionPension: this.flagCheckboxComisionPension ? 1 : 0,
            flagComisionSalud: this.flagCheckboxComisionSalud ? 1 : 0,
            P_SCLIENT_TYPE: this.inputsQuotation.P_SISCLIENT_GBD,
            P_NMONTO_TOTAL: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + current.planilla, 0),
            P_FACT_VENCIDO: 0,
            planId: 999,
            P_NATTACH: this.files.length > 0 ? 1 : 0,
            P_NCHANGE_ACTIVITY: 1,
            P_NCHANGE_MINA: 1,
            P_NCHANGE_AGENCY: 0,
            P_NPROFILE: this.codProfile,
            P_ISCOTIZACION: 1,
            QuotationDet: [],
            QuotationCom: [],
        };
    }

    async populateQuotationDetails(dataQuotation) {
        await this.populateHealthDetails(dataQuotation);
        await this.populatePensionDetails(dataQuotation);
        await this.populateComercializadores(dataQuotation);
        if (Number(this.epsItem.NCODE) == 3 && (dataQuotation.P_NCOT_MIXTA == 1 || this.inputsQuotation.P_NPRODUCT == '2')) { //AVS INTERCONEXION SABSA 19/07/2023
            await this.dataCotizacion_EPS();
        }
    }

    async populatePensionDetails(dataQuotation) {
        if (this.template.ins_pensionList && this.listaTasasPension.length > 0) {
            this.listaTasasPension.forEach(dataPension => {
                const itemQuotationDet = this.createQuotationDetail(dataPension, 1);
                dataQuotation.QuotationDet.push(itemQuotationDet);
            });
        }
    }

    async populateHealthDetails(dataQuotation) {
        if (this.listaTasasSalud.length > 0 && this.template.ins_mapfre) {
            dataQuotation.cotizacionMapfre = {}
            dataQuotation.cotizacionMapfre.cabecera = {}
            dataQuotation.cotizacionMapfre.cabecera.tariff = this.reloadTariff
            dataQuotation.cotizacionMapfre.cabecera.keyService = 'cotizar'
            dataQuotation.cotizacionMapfre.poliza = {}
            dataQuotation.cotizacionMapfre.poliza.fecEfecSpto = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
            dataQuotation.cotizacionMapfre.poliza.fecVctoSpto = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
            dataQuotation.cotizacionMapfre.poliza.codFormaDeclaracion = await this.equivalenciaMapfre(this.inputsQuotation.tipoRenovacion, 'renovacion', 'tableKey') // Tipo de renovación
            dataQuotation.cotizacionMapfre.poliza.codActRiesgo = await this.equivalenciaMapfre(this.inputsQuotation.P_NECONOMIC, 'actividadEconomica', 'tableKey') // Revisar CIIU
            dataQuotation.cotizacionMapfre.poliza.tipoPeriodo = this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4' ? 'C' : 'N' // Revisar
            dataQuotation.cotizacionMapfre.poliza.moneda = {}
            dataQuotation.cotizacionMapfre.poliza.moneda.codMon = this.inputsQuotation.P_NCURRENCY
            dataQuotation.cotizacionMapfre.producto = {}
            dataQuotation.cotizacionMapfre.riesgoSCTR = []
            const item: any = {}
            item.nomCentroRiesgoSalud = this.inputsQuotation.P_SSEDE
            item.numAsegSalud = this.inputsQuotation.P_WORKER;
            item.impPlanillaSalud = this.inputsQuotation.P_PLANILLA;
            dataQuotation.cotizacionMapfre.riesgoSCTR.push(item)
            dataQuotation.cotizacionMapfre.contratante = {}
            dataQuotation.cotizacionMapfre.contratante.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //'DNI' equivalente
            dataQuotation.cotizacionMapfre.contratante.codDocum = this.inputsQuotation.P_SIDDOC
            dataQuotation.cotizacionMapfre.contratante.nombre = this.contractingdata.P_NPERSON_TYP == '1' ? this.contractingdata.P_SFIRSTNAME + ' ' + this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : this.contractingdata.P_SLEGALNAME
            dataQuotation.cotizacionMapfre.mcaGuardado = 'S'
        }

        if (this.listaTasasSalud.length > 0) {
            this.listaTasasSalud.forEach(dataSalud => {
                const itemQuotationDet = this.createQuotationDetail(dataSalud, 2);
                dataQuotation.QuotationDet.push(itemQuotationDet);
            });
        }
    }

    validateValueNumber(value) {
        return value == '' ? 0 : value;
    }

    createQuotationDetail(data, product) {
        return {
            P_NBRANCH: 77,
            P_NPRODUCT: product,
            P_NMODULEC: data.nmodulec,
            P_NTOTAL_TRABAJADORES: data.totalWorkes,
            P_NMONTO_PLANILLA: data.planilla,
            P_NTASA_CALCULADA: data.rate,
            P_NTASA_PROP: data.planProp,
            P_NPREMIUM_MENSUAL: data.premiumMonth,
            P_NPREMIUM_MIN: product == 1 ? this.inputsQuotation.P_PRIMA_MIN_PENSION : this.inputsQuotation.P_PRIMA_MIN_SALUD,
            P_NPREMIUM_MIN_PR: product == 1 ? this.validateValueNumber(this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO) : this.validateValueNumber(this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO),
            P_NPREMIUM_END: product == 1 ? this.inputsQuotation.P_PRIMA_END_PENSION : this.inputsQuotation.P_PRIMA_END_SALUD,
            P_NSUM_PREMIUMN: product == 1 ? this.totalNetoPensionSave : this.totalNetoSaludSave,
            P_NSUM_IGV: product == 1 ? this.igvPensionSave : this.igvSaludSave,
            P_NSUM_PREMIUM: product == 1 ? this.brutaTotalPensionSave : this.brutaTotalSaludSave,
            P_NRATE: data.rate,
            P_NDISCOUNT: product == 1 ? this.discountPension : this.discountSalud,
            P_NACTIVITYVARIATION: product == 1 ? this.activityVariationPension : this.activityVariationSalud,
            P_SCLIENT_TYPE: this.inputsQuotation.P_SISCLIENT_GBD,
            P_FLAG: 0,
            P_NAMO_AFEC: product == 1 ? this.totalNetoPensionSave : this.totalNetoSaludSave,
            P_NIVA: product == 1 ? this.igvPensionSave : this.igvSaludSave,
            P_NAMOUNT: product == 1 ? this.brutaTotalPensionSave : this.brutaTotalSaludSave,
            P_NDE: 0,
            P_TIPO_COT: this.inputsQuotation.P_NRATETYPE
        };
    }

    populateComercializadores(dataQuotation) {
        if (this.brokerList.length > 0) {
            this.brokerList.forEach((dataBroker, index) => {
                const itemQuotationCom = {
                    P_NIDTYPECHANNEL: dataBroker.NTYPECHANNEL,
                    P_NINTERMED: dataBroker.COD_CANAL,
                    P_SCLIENT_COMER: dataBroker.SCLIENT,
                    P_NCOMISION_SAL: this.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD || '0' : '0',
                    P_NCOMISION_SAL_PR: this.listaTasasSalud.length > 0 ? (this.flagCheckboxComisionSalud ? dataBroker.P_COM_SALUD_PRO || '0' : dataBroker.P_COM_SALUD_PRO || '0') : '0',
                    P_NCOMISION_PEN: this.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION || '0' : '0',
                    P_NCOMISION_PEN_PR: this.listaTasasPension.length > 0 ? (this.flagCheckboxComisionPension ? dataBroker.P_COM_PENSION_PRO || '0' : dataBroker.P_COM_PENSION_PRO || '0') : '0',
                    P_NPRINCIPAL: 1,
                    P_NLOCAL: this.selectedDep[index],
                };
                dataQuotation.QuotationCom.push(itemQuotationCom);
            });
        }
    }

    createFormData(dataQuotation) {
        const myFormData = new FormData();
        this.files.forEach(file => myFormData.append(file.name, file));

        myFormData.append('objeto', JSON.stringify(dataQuotation));
        myFormData.append('objeto_EPS', JSON.stringify(this.dataQuotation_EPS));
        // myFormData.append('objetoValidaCambioPlan', JSON.stringify({
        //     PlanPropuesto: this.planPropuesto,
        //     PlanSeleccionado: this.flagPolizaMat ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan,
        //     TipoTransaccion: this.typeTran,
        // }));

        return myFormData;
    }

    clearInsert() {
        // Datos Contratante
        this.blockDoc = true;
        this.inputsQuotation.P_NIDDOC_TYPE = '-1'; // Tipo de documento
        this.inputsQuotation.P_SIDDOC = ''; // Nro de documento
        this.inputsQuotation.P_SFIRSTNAME = ''; // Nombre
        this.inputsQuotation.P_SLASTNAME = ''; // Apellido Paterno
        this.inputsQuotation.P_SLASTNAME2 = ''; // Apellido Materno
        this.inputsQuotation.P_SLEGALNAME = ''; // Razon social
        this.inputsQuotation.P_SE_MAIL = ''; // Email
        this.inputsQuotation.P_SDESDIREBUSQ = ''; // Direccion
        this.inputsQuotation.tipoRenovacion = ''; // Tipo de renovación
        this.inputsQuotation.frecuenciaPago = ''; // Frecuencia de pago
        this.canTasaVL = true;
        this.inputsQuotation.P_COMISION = ''
        this.tasaVL = []
        this.excelSubir = null;
        this.archivoExcel = null;
        this.files = null;
        // this.flagEmailNull = true;
        this.flagEmail = false;
        this.flagContact = false;
        this.inputsQuotation.desTipoPlan = ''
        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);
        this.bsValueIniMin = new Date();
        this.bsValueFinMin = new Date();
        this.bsValueFinMin.setDate(this.bsValueFinMin.getDate() + 1);

        // Datos Cotización
        this.inputsQuotation.P_NCURRENCY = '1'; // Moneda
        this.inputsQuotation.P_NIDSEDE = null; // Sede
        this.inputsQuotation.P_NTECHNICAL = null; // Actividad Tecnica
        this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
        this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
        //this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0 -- AVS Mejoras SCTR
        this.inputsQuotation.P_NPROVINCE = null;
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        if (this.productList.length > 1) {
            this.inputsQuotation.P_NPRODUCT = '-1';
        }
        this.sedeId = '0'

        // Sedes
        this.sedesList = [];
        this.stateQuotation = true;
        this.activityMain = ''
        this.subActivity = ''
        this.provinceList = [];
        this.districtList = [];
        //Validacion para derivacion a tecnica de SCTR
        //this.listaTasasPension = [];
        //this.listaTasasSalud = [];

        //Cotizador
        this.clearTariff();

        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = '2'; // Tipo persona
        //Validacion para derivacion a tecnica de SCTR
        //this.brokerList = [];
        if (this.perfilActual == this.perfil || this.template.ins_iniciarBroker) {
            this.brokerIni();
        }

        this.maxlength = 8;

        this.categoryList.forEach(element => {
            element.ProposalRate = null;
        });

        this.categoryList = [];
        this.rateByPlanList = [];


        this.validateLockResponse = {};
        this.validateDebtResponse = {};
        this.excelSubir = null;
        this.creditHistory = null;
        this.inputsQuotation.commissionProposed = null;

        this.flagPolizaMat = false;
    }

    //AVS - Eliminacion de broker luego del movimiento tecnica
    clearInsertSCTR() {
        this.brokerList = [];
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = '';
        this.listaTasasPension = [];
        this.listaTasasSalud = [];
        this.inputsQuotation.P_SDELIMITER = '0';
    }

    clearTariff() {
        console.log('Ingresa');
        this.comPropuestaSalud = false
        this.comPropuestaPension = false
        this.comPropuesta = false
        this.statePrimaSalud = true
        this.statePrimaPension = true
        this.stateBrokerTasaSalud = true
        this.stateBrokerTasaPension = true
        this.blockSearch = true
        this.stateSearch = false
        this.reloadTariff = false
        this.messageWorker = ''
        this.tasasList = [];
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''; // Prima minima salud
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''; // Prima minima salud propuesta
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''; // Prima minima pension
        this.totalNetoPensionSave = 0.00
        this.totalNetoSaludSave = 0.00
        this.igvPensionSave = 0.00
        this.igvSaludSave = 0.00
        this.brutaTotalPensionSave = 0.00
        this.brutaTotalSaludSave = 0.00
        this.discountPension = 0;
        this.discountSalud = 0;
        this.activityVariationPension = 0;
        this.activityVariationSalud = 0;
        this.commissionPension = 0;
        this.commissionSalud = 0;
        this.inputsQuotation.P_SCOMMENT = ''; // Comentario
        this.files = []; // Archivos
        this.brokerList.forEach(broker => {
            broker.P_COM_SALUD = 0
            broker.P_COM_PENSION = 0
        });
    }

    // addBroker() {
    //     let modalRef = this.modalService.open(SearchBrokerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    //     modalRef.componentInstance.formModalReference = modalRef;
    //     modalRef.componentInstance.listaBroker = this.brokerList;
    //     modalRef.componentInstance.brokerMain = this.inputsQuotation.P_SIDDOC_COM;

    //     modalRef.result.then((BrokerData) => {
    //         BrokerData.P_COM_SALUD = 0;
    //         BrokerData.P_COM_SALUD_PRO = 0;
    //         BrokerData.P_COM_PENSION = 0;
    //         BrokerData.P_COM_PENSION_PRO = 0;
    //         BrokerData.PROFILE = this.perfilActual;
    //         BrokerData.NCORREDOR = BrokerData.NCORREDOR == '' ? BrokerData.COD_CANAL : BrokerData.NCORREDOR;
    //         BrokerData.BLOCK = 0;
    //         BrokerData.valItemPen = false;
    //         BrokerData.valItemSal = false;
    //         BrokerData.NTYPECHANNEL = BrokerData.NTYPECHANNEL; //AVS - INTERCONEXION SABSA 06/11/2023
    //         BrokerData.COD_CANAL = BrokerData.COD_CANAL;
    //         BrokerData.NINTERMED = BrokerData.NINTERMED;
    //         BrokerData.NINTERTYP = BrokerData.NINTERTYP;
    //         BrokerData.NTIPDOC = BrokerData.SCLIENT.substr(1, 1);
    //         BrokerData.NNUMDOC = BrokerData.NNUMDOC;
    //         BrokerData.RAZON_SOCIAL = BrokerData.SCLIENAME;
    //         BrokerData.SCLIENT = BrokerData.SCLIENT;
    //         BrokerData.P_NPRINCIPAL = 0;
    //         BrokerData.SEMAILCLI = BrokerData.SEMAILCLI;
    //         BrokerData.SFIRSTNAME = BrokerData.SFIRSTNAME;
    //         BrokerData.SLASTNAME = BrokerData.SLASTNAME;
    //         BrokerData.SLASTNAME2 = BrokerData.SLASTNAME2;
    //         BrokerData.SPHONE1 = BrokerData.SPHONE1;
    //         BrokerData.SSTREET = BrokerData.SSTREET;
    //         this.brokerList.push(BrokerData);
    //         this.equivalentMuni();
    //         //this.flagTecnicaSalud = Number(this.epsItem.NCODE) == 3 ? true : false; //AVS - INTERCONEXION SABSA
    //     });
    // }

    addBroker() {
        const modalRef = this.modalService.open(SearchBrokerComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false
        });

        this.setupModalInstance(modalRef);

        modalRef.result.then((BrokerData) => {
            this.prepareBrokerData(BrokerData);
            this.brokerList.push(BrokerData);
            this.equivalentMuni();
            // this.flagTecnicaSalud = Number(this.epsItem.NCODE) == 3 ? true : false; //AVS - INTERCONEXION SABSA
        });
    }

    setupModalInstance(modalRef) {
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.listaBroker = this.brokerList;
        modalRef.componentInstance.brokerMain = this.inputsQuotation.P_SIDDOC_COM;
    }

    prepareBrokerData(BrokerData) {
        const defaultValues = {
            P_COM_SALUD: 0,
            P_COM_SALUD_PRO: 0,
            P_COM_PENSION: 0,
            P_COM_PENSION_PRO: 0,
            BLOCK: 0,
            valItemPen: false,
            valItemSal: false,
            P_NPRINCIPAL: 0,
        };

        Object.assign(BrokerData, defaultValues);

        BrokerData.PROFILE = this.perfilActual;
        BrokerData.NCORREDOR = BrokerData.NCORREDOR === '' ? BrokerData.COD_CANAL : BrokerData.NCORREDOR;
        BrokerData.NTIPDOC = BrokerData.SCLIENT.substr(1, 1);
        BrokerData.RAZON_SOCIAL = BrokerData.SCLIENAME;

        // Keeping these fields intact
        const fieldsToKeep = [
            'SCLIENT', 'NNUMDOC', 'SEMIALCLI',
            'SFIRSTNAME', 'SLASTNAME', 'SLASTNAME2',
            'SPHONE1', 'SSTREET',
            'NINTERMED', 'NINTERTYP', 'NTYPECHANNEL', 'COD_CANAL'
        ];

        fieldsToKeep.forEach(field => {
            BrokerData[field] = BrokerData[field];
        });
    }

    deleteBroker(row) {
        swal.fire({
            title: 'Eliminar Broker',
            text: '¿Estás seguro que deseas eliminar este broker?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.brokerList.splice(row, 1);
                    this.selectedDep.splice(row, 1);
                    this.equivalentMuni();
                }
            });
    }

    validarNroDocumento(event: any, tipoDocumento) {
        CommonMethods.validarNroDocumento(event, tipoDocumento)
    }

    textValidate(event: any, tipoTexto) {
        CommonMethods.textValidate(event, tipoTexto)
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

    async getValidateDebt(): Promise<ValidateDebtReponse> {
        // let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = 77;
        validateDebtRequest.productCode = 1;
        validateDebtRequest.clientCode = this.contratanteId;
        validateDebtRequest.transactionCode = 1;
        validateDebtRequest.profileCode = Number(this.perfilActual);
        validateDebtRequest.nintermed = JSON.parse(localStorage.getItem('currentUser'))['canal'];

        // await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
        //     res => {
        //         validateDebtResponse = res;
        //     }
        // );
        return this.collectionsService.validateDebt(validateDebtRequest).toPromise();
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

    dataQuot = JSON.parse(localStorage.getItem('dataquotation'));

    async emitPolicy(res, self, quotationNumber, myFormData) {
        // let message = 'Se generó la cotización';
        let flagAuthSCTR = ['S', 'V'].includes(res.P_SAPROBADO) ? 1 : 0;
        // let nstateEPS = res.P_NSTATE_EPS;
        // let nstateSCTR = res.P_NSTATE_SCTR;

        if (Number(this.epsItem.NCODE) == 3) {
            if (res.P_NSTATE_EPS == 1 && [0, 2].includes(res.P_NSTATE_SCTR)) {
                self.isLoading = false;
                swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', se realizaron propuestas de valores, para emitir debe esperar la aprobación de la EPS. ', 'success');
                this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                this.clearInsert();
                this.clearInsertSCTR();
            } else if (res.P_NSTATE_EPS == 1 && res.P_NSTATE_SCTR == 1) {
                this.serviciosTasasSCTR(quotationNumber, res.P_SMESSAGE);
                swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', sin embargo a sido derivada a técnica por el cual, para emitir debe esperar la aprobación de la EPS y de PROTECTA. ', 'success');
                this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                this.clearInsert();
                this.clearInsertSCTR();
            } else if (res.P_NSTATE_EPS == 2 && res.P_NSTATE_SCTR == 1) {
                this.serviciosTasasSCTR(quotationNumber, res.P_SMESSAGE);
                swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ',  para emitir debe esperar la aprobación. ' + res.P_SMESSAGE, 'success');
                this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                this.clearInsert();
                this.clearInsertSCTR();
            } else if ([0, 2].includes(res.P_NSTATE_EPS) && [0, 2, 3].includes(res.P_NSTATE_SCTR)) {
                if (flagAuthSCTR == 1) {
                    if (res.P_NCODE == 0) {
                        if (!this.template.ins_emisionDirecta) {
                            self.isLoading = false;
                            swal.fire({
                                title: 'Información',
                                text: 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ¿Deseas realizar la emisión?',
                                icon: 'success',
                                showCancelButton: true,
                                confirmButtonText: 'Emitir',
                                cancelButtonText: 'Cancelar'
                            })
                                .then((result) => {
                                    if (result.value) {
                                        this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: quotationNumber } });
                                    } else {
                                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                                    }
                                });
                        } else {
                            if (this.validateDebtResponse.lockMark === 1) {
                                self.isLoading = false;
                                swal.fire('Información', 'Se ha generado correctamente la cotización N° ' +
                                    quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                            }
                        }
                    } else {
                        self.isLoading = false;
                        swal.fire('Información',
                            'Se ha generado correctamente la cotización N° ' +
                            quotationNumber + ',  para emitir debe esperar su aprobación.',
                            'success');
                    }
                } else {
                    self.isLoading = false;
                    if (res.P_NCODE == 2) {
                        swal.fire('Información', res.P_SMESSAGE, 'success');
                        this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                    } else {
                        this.serviciosTasasSCTR(quotationNumber, res.P_SMESSAGE);
                        swal.fire('Información', 'Se ha generado correctamente la cotización N° ' +
                            quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                        this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                    }
                    this.clearInsert();
                    this.clearInsertSCTR();
                }
            }
        } else {
            if (flagAuthSCTR == 1) {
                if (res.P_NCODE == 0) {
                    if (!this.template.ins_emisionDirecta) {
                        self.isLoading = false;
                        swal.fire({
                            title: 'Información',
                            text: 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ¿Deseas realizar la emisión?',
                            icon: 'success',
                            showCancelButton: true,
                            confirmButtonText: 'Emitir',
                            cancelButtonText: 'Cancelar'
                        })
                            .then((result) => {
                                if (result.value) {
                                    this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: quotationNumber } });
                                } else {
                                    this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                                }
                            });
                    } else {
                        if (this.validateDebtResponse.lockMark === 1) {
                            self.isLoading = false;
                            swal.fire('Información', 'Se ha generado correctamente la cotización N° ' +
                                quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                        }
                    }
                } else {
                    self.isLoading = false;
                    swal.fire('Información',
                        'Se ha generado correctamente la cotización N° ' +
                        quotationNumber + ',  para emitir debe esperar su aprobación.',
                        'success');
                }
            } else {
                self.isLoading = false;
                if (res.P_NCODE == 2) {
                    swal.fire('Información', res.P_SMESSAGE, 'success');
                    this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                } else {
                    this.serviciosTasasSCTR(quotationNumber, res.P_SMESSAGE);
                    swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ',  para emitir debe esperar la aprobación. ' + res.P_SMESSAGE, 'success');
                    this.router.navigate(['/broker/sctr/consulta-cotizacion']);
                }
                this.clearInsert();
                this.clearInsertSCTR();
            }
        }
    }

    // generateAccountStatus(): Promise<any> {
    //     const genAccountStatusRequest = new GenAccountStatusRequest();
    //     genAccountStatusRequest.branchCode = 77;
    //     genAccountStatusRequest.productCode = 1;
    //     genAccountStatusRequest.clientCode = this.contratanteId;
    //     genAccountStatusRequest.documentCode = this.variable.var_accountStatusCode;
    //     return swal.queue([{
    //         title: this.validateDebtResponse.observation,
    //         confirmButtonText: 'Aceptar',
    //         cancelButtonText: 'Cancelar',
    //         text: '¿Desea descargar su Estado de Cuenta?',
    //         // showCloseButton: true,
    //         showCancelButton: true,
    //         allowOutsideClick: false,
    //         // showLoaderOnConfirm: true,
    //         preConfirm: () => {
    //             this.isLoading = true;
    //             return this.createDocument(genAccountStatusRequest)
    //                 .then(async res => {
    //                     await this.downloadFile(res.path).then(() => {
    //                         this.isLoading = false;
    //                     });
    //                 })
    //                 .catch(() => {
    //                     swal.insertQueueStep({
    //                         title: 'Error al descargar el estado de cuenta'
    //                     })
    //                 })
    //         }
    //     }])
    // }

    generateAccountStatus(): Promise<any> {
        const genAccountStatusRequest = this.createGenAccountStatusRequest();

        return swal.queue([{
            title: this.validateDebtResponse.observation,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            text: '¿Desea descargar su Estado de Cuenta?',
            showCancelButton: true,
            allowOutsideClick: false,
            preConfirm: () => this.handlePreConfirm(genAccountStatusRequest)
        }]);
    }

    private createGenAccountStatusRequest(): GenAccountStatusRequest {
        const request = new GenAccountStatusRequest();
        request.branchCode = 77;
        request.productCode = 1;
        request.clientCode = this.contratanteId;
        request.documentCode = this.variable.var_accountStatusCode;
        return request;
    }

    private handlePreConfirm(request: GenAccountStatusRequest): Promise<any> {
        this.isLoading = true;

        return this.createDocument(request)
            .then(res => this.downloadFile(res.path))
            .then(() => {
                this.isLoading = false;
            })
            .catch(() => {
                this.isLoading = false; // Asegurarse de restablecer isLoading en caso de error
                swal.insertQueueStep({
                    title: 'Error al descargar el estado de cuenta'
                });
            });
    }

    // generateAccountStatusExterno(): Promise<any> {
    //     const genAccountStatusRequest = new GenAccountStatusRequest();
    //     genAccountStatusRequest.branchCode = 77;
    //     genAccountStatusRequest.productCode = 1;
    //     genAccountStatusRequest.clientCode = this.contratanteId;
    //     genAccountStatusRequest.documentCode = this.variable.var_accountStatusCode;
    //     if (this.validateDebtResponse.external == 0) {
    //         return swal.queue([{
    //             title: this.validateDebtResponse.observation,
    //             confirmButtonText: 'Aceptar',
    //             cancelButtonText: 'Cancelar',
    //             text: '¿Desea descargar su Estado de Cuenta?',
    //             // showCloseButton: true,
    //             showCancelButton: true,
    //             allowOutsideClick: false,
    //             // showLoaderOnConfirm: true,
    //             preConfirm: () => {
    //                 this.isLoading = true;
    //                 return this.createDocument(genAccountStatusRequest)
    //                     .then(async res => {
    //                         await this.downloadFile(res.path).then(() => {
    //                             this.isLoading = false;
    //                         });
    //                     })
    //                     .catch(() => {
    //                         swal.insertQueueStep({
    //                             title: 'Error al descargar el estado de cuenta'
    //                         })
    //                     })
    //             }
    //         }]);
    //     } else {
    //         return swal.queue([{
    //             title: this.validateDebtResponse.observation,
    //             confirmButtonText: 'Aceptar',
    //             text: 'Para mayor información comunicarse con el Ejecutivo de Comercial',
    //             // showCloseButton: true,
    //             showCancelButton: false,
    //             allowOutsideClick: false,
    //             // showLoaderOnConfirm: true,
    //             preConfirm: () => {
    //                 this.isLoading = true;
    //             }
    //         }]);
    //     }

    // }

    generateAccountStatusExterno(): Promise<any> {
        const genAccountStatusRequest = new GenAccountStatusRequest();
        genAccountStatusRequest.branchCode = 77;
        genAccountStatusRequest.productCode = 1;
        genAccountStatusRequest.clientCode = this.contratanteId;
        genAccountStatusRequest.documentCode = this.variable.var_accountStatusCode;

        const { observation, external } = this.validateDebtResponse;

        if (external === 0) {
            return this.showDownloadConfirmation(observation, genAccountStatusRequest);
        } else {
            return this.showInfoAlert(observation);
        }
    }

    private showDownloadConfirmation(observation: string, request: GenAccountStatusRequest): Promise<any> {
        return swal.queue([{
            title: observation,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            text: '¿Desea descargar su Estado de Cuenta?',
            showCancelButton: true,
            allowOutsideClick: false,
            preConfirm: () => {
                this.isLoading = true;
                return this.createDocument(request)
                    .then(async res => {
                        await this.downloadFile(res.path);
                        this.isLoading = false;
                    })
                    .catch(() => {
                        swal.insertQueueStep({
                            title: 'Error al descargar el estado de cuenta'
                        });
                        this.isLoading = false; // Asegúrate de parar el loading
                    });
            }
        }]);
    }

    private showInfoAlert(observation: string): Promise<any> {
        return swal.queue([{
            title: observation,
            confirmButtonText: 'Aceptar',
            text: 'Para mayor información comunicarse con el Ejecutivo de Comercial',
            showCancelButton: false,
            allowOutsideClick: false,
            preConfirm: () => {
                this.isLoading = true; // Esta carga puede ser útil para mostrar algún spinner
            }
        }]);
    }


    async downloadFile(filePath: string): Promise<any> {  //Descargar archivos de cotización
        return this.othersService.downloadFile(filePath).toPromise().then(
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

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        switch (modalName) {
            case 'add-contact':
                modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                typeContact.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE;
                typeContact.P_SIDDOC = this.inputsQuotation.P_SIDDOC;
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
        typeContact.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE;
        typeContact.P_SIDDOC = this.inputsQuotation.P_SIDDOC;
        modalRef.componentInstance.typeContact = typeContact;
        this.contactList.map(function (dato) {
            if (dato.P_NROW === row) {
                itemContacto = dato;
            }
        });
        modalRef.componentInstance.itemContacto = itemContacto;
        modalRef.componentInstance.listaContactos = this.contactList;
    }

    // async ValidateRetroactivity(operacion: number = 1) {
    //     let tran = this.sAbTransac;
    //     const response: any = {};
    //     const dataQuotation: any = {};
    //     dataQuotation.P_NBRANCH = this.pensionID.nbranch;
    //     dataQuotation.P_NPRODUCT = this.pensionID.id;
    //     dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //     dataQuotation.NumeroCotizacion = this.nrocotizacion;
    //     dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
    //     dataQuotation.P_DSTARTDATE_ASE = this.typeTran != 'Exclusión' ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion);
    //     dataQuotation.TrxCode = tran;
    //     dataQuotation.RetOP = operacion;
    //     dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIni.setHours(0, 0, 0, 0) ? 1 : 0;
    //     const myFormData: FormData = new FormData();
    //     myFormData.append('objeto', JSON.stringify(dataQuotation));
    //     await this.quotationService.ValidateRetroactivity(myFormData).toPromise().then(
    //         res => {
    //             response.P_SAPROBADO = res.P_SAPROBADO;
    //             response.P_NCODE = res.P_NCODE;
    //             response.P_SMESSAGE = res.P_SMESSAGE;
    //         }
    //     );
    //     return response;
    // }

    async validateRetroactivity(): Promise<boolean> {

        let res = await this.validateRetroactivityRules();

        const errorCodes = [1, 99];
        const validateCodes = [2];

        this.derivaRetroactividad = res.ncode === 2;

        if (errorCodes.includes(res.ncode)) {
            await swal.fire('Información', res.smessage, 'error');
            return false;
        }

        if (validateCodes.includes(res.ncode)) {
            await swal.fire('Información', res.smessage, 'error');
        }

        return true;
    }

    async validateRetroactivityRules(): Promise<any> {
        let data: any = {
            scodProcess: this.codProcess,
            ddate_ini: CommonMethods.formatDate(this.inputsQuotation.FDateIni),
            ddate_fin: CommonMethods.formatDate(this.inputsQuotation.FDateFin),
            namount_total: this.tasasList.filter(item => item.planilla).reduce((sum, current) => sum + current.planilla, 0),
            nflag_attach: this.files.length > 0 ? 1 : 0,
            ntype_valid: 1,
            nmonth_exp: 0,
            sclient_type: this.inputsQuotation.P_SISCLIENT_GBD,
            stransac: 'EM',
            nid_cotizacion: this.nrocotizacion,
            idProfile: this.codProfile
        };

        // Simplificación: Retorna directamente la respuesta de la promesa
        return this.quotationService.getValidateRetroactivityRules(data).toPromise();
    }

    async GetFechaFin(fecha, freq) {
        const response: any = {};
        await this.quotationService.GetFechaFin(fecha, freq).toPromise().then(
            res => {
                response.FechaExp = res.FechaExp;
            }
        );
        return response;
    }

    /* Nuevos parametros ins_cotiza_det */
    GetAmountDetailTotalListValue(tipo, freq): number {
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_MEN)[tipo];
            } else if (freq == 4) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_BIM)[tipo];
            } else if (freq == 3) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TRI)[tipo];
            } else if (freq == 2) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_SEM)[tipo];
            } else if (freq == 1) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_ANU)[tipo];
            } else if (freq == 9) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TOT)[tipo];
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    SetTransac() {
        try {
            switch (this.typeTran) {
                case "Inclusión": {
                    this.nTransac = 2;
                    this.sAbTransac = "IN";
                    this.questionText = '¿Desea realizar la inclusión de asegurados?';
                    break;
                }
                case "Renovación": {
                    this.nTransac = 4;
                    this.sAbTransac = "RE";
                    this.questionText = '¿Deseas hacer la renovación de la póliza?';
                    break;
                }
                case "Declaración": {
                    this.nTransac = 4;
                    this.sAbTransac = "DE";
                    this.isDeclare = true;
                    this.questionText = '¿Deseas hacer la declaración de la póliza?';
                    break;
                }
                case "Endoso": {
                    this.nTransac = 8;
                    this.sAbTransac = "EN";
                    this.questionText = '¿Deseas hacer el endoso de la póliza?';
                    break;
                }
                case "Exclusión": {
                    this.nTransac = 3;
                    this.sAbTransac = "EX";
                    break;
                }
                default:
                    this.nTransac = 1;
                    this.sAbTransac = "EM";
                    break;
            }
        } catch (error) {
            this.nTransac = 1;
            this.sAbTransac = "EM";
        }
    }

    //tipo endoso
    getTypeEndoso() {
        this.policyemit.GetTypeEndoso().toPromise().then(
            (res: any) => {
                this.tipoEndoso = res;
            });
    }


    changeBillType() {

        this.flagGobiernoEstado = false;
        this.flagPolizaMat = false;
        this.inputsQuotation.P_NPOLICY_MAT = false;
        this.inputsQuotation.P_NREM_EXC = false;
        //this.flagExc = false;
        // this.clearInputPolMat();

        // if (this.inputsQuotation.P_SISCLIENT_GBD == 1 && this.flagComerExclu == 0  && this.codProducto==3 ) {
        //     this.flagGobiernoEstado = true;
        //     //this.flagExc = true;
        // }
    }

    aprobacionCliente(e) {
        this.flagAprobCli = false;
        this.flagEnvioEmail = 0;

        if (e.target.checked) {
            this.flagAprobCli = true;
            this.flagEnvioEmail = 1;
        }
    }

    changeFPMontoSinIGV() {
        var frecPago = 0;
        switch (Number(this.inputsQuotation.frecuenciaPago)) {
            case 1:
                frecPago = 12 // Anual
                break;
            case 2:
                frecPago = 6 // Semestral
                break;
            case 3:
                frecPago = 3 // Trimestral
                break;
            case 4:
                frecPago = 2 // Bimestral
                break;
            case 5:
                frecPago = 1; // Mensual
                break;

            default:
                break;
        }

        this.v_MontoSinIGVEMP = Number(this.MontoSinIGVEMP)
        this.v_MontoSinIGVOBR = Number(this.MontoSinIGVOBR)
        this.v_MontoSinIGVOAR = Number(this.MontoSinIGVOAR)
        this.v_MontoSinIGVEE = Number(this.MontoSinIGVEE)
        this.v_MontoSinIGVOE = Number(this.MontoSinIGVOE)
        this.v_MontoSinIGVOARE = Number(this.MontoSinIGVOARE)

        this.MontoFPSinIGVEMP = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOBR = CommonMethods.formatValor(Number(this.MontoSinIGVOBR) * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOAR = CommonMethods.formatValor(Number(this.MontoSinIGVOAR) * Number(frecPago), 6, 1);
        this.MontoFPSinIGVEE = CommonMethods.formatValor(Number(this.MontoSinIGVEE) * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOE = CommonMethods.formatValor(Number(this.MontoSinIGVOE) * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOARE = CommonMethods.formatValor(Number(this.MontoSinIGVOARE) * Number(frecPago), 6, 1);

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeTotalSinIGV() { //LS - Poliza Matriz
        this.TotalSinIGV = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE), 2, 1);
        this.TotalSinIGV = CommonMethods.formatValor(this.TotalSinIGV, 2, 1);
        this.TotalFPSinIGV = CommonMethods.formatValor(Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE), 2, 1);
        this.TotalFPSinIGV = CommonMethods.formatValor(this.TotalFPSinIGV, 2, 1);
    }

    changeTotalConIGV() { //LS - Poliza Matriz
        this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2, 1);
        this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2, 1);
        this.SumaConIGV = CommonMethods.formatValor(Number(this.TotalFPSinIGV) * 18 / 100, 2, 1);
    }

    serviciosTasasSCTR(quotationNumber, mensaje) {
        const itemData: any = {};
        itemData.P_LISTATASAPENSION_LENGTH = this.listaTasasPension.length;
        itemData.P_LISTATASASALUD_LENGTH = this.listaTasasSalud.length;
        itemData.P_LISTATASAPENSION_PLANPROP0 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[0].planProp) : Number(this.listaTasasPension[0].planPro);
        itemData.P_LISTATASAPENSION_PLANPROP1 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[1].planProp) : Number(this.listaTasasPension[1].planPro);
        itemData.P_LISTATASAPENSION_PLANPROP2 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[2].planProp) : Number(this.listaTasasPension[2].planPro);
        //itemData.P_LISTATASAPENSION_PLANPROP3 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[3].planProp) : Number(this.listaTasasPension[3].planPro);
        itemData.P_COM_PENSION_PRO = this.brokerList[0].P_COM_PENSION_PRO;
        itemData.P_WORKER = this.inputsQuotation.P_WORKER;
        itemData.P_PRIMA_MIN_PENSION_PRO = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? 0 : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO || this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO !== '' ? Number(this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO) : Number(this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO);
        itemData.P_NACT_MINA = JSON.parse(localStorage.getItem('dataquotation'))['P_NACT_MINA'];
        itemData.P_LISTATASASALUD_PLANPROP0 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[0].planProp) : Number(this.listaTasasSalud[0].planPro);
        itemData.P_LISTATASASALUD_PLANPROP1 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[1].planProp) : Number(this.listaTasasSalud[1].planPro);
        itemData.P_LISTATASASALUD_PLANPROP2 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[2].planProp) : Number(this.listaTasasSalud[2].planPro);
        //itemData.P_LISTATASASALUD_PLANPROP3 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[3].planProp) : Number(this.listaTasasSalud[3].planPro);
        itemData.P_NID_COTIZACION = quotationNumber;
        itemData.P_MENSAJE = mensaje;
        itemData.P_SDELIMITER = Number(this.inputsQuotation.P_SDELIMITER);
        itemData.RATE_PENSION0 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[0].rate) : Number(this.listaTasasPension[0].rate);
        itemData.RATE_PENSION1 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[1].rate) : Number(this.listaTasasPension[1].rate);
        itemData.RATE_PENSION2 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[2].rate) : Number(this.listaTasasPension[2].rate);
        //itemData.RATE_PENSION3 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[3].rate) : Number(this.listaTasasPension[3].rate);
        itemData.RATE_SALUD0 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[0].rate) : Number(this.listaTasasSalud[0].rate);
        itemData.RATE_SALUD1 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[1].rate) : Number(this.listaTasasSalud[1].rate);
        itemData.RATE_SALUD2 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[2].rate) : Number(this.listaTasasSalud[2].rate);
        //itemData.RATE_SALUD3 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[3].rate) : Number(this.listaTasasSalud[3].rate);

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(itemData));

        //this.policyemit.Msj_TecnicsSCTR(myFormData).subscribe();
    }

    async ubigeoInei(distrito) { //AVS - INTERCONEXION SABSA 06/11/2023
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

    async dataCotizacion_EPS() { //AVS - INTERCONEXION SABSA 06/11/2023
        this.listaEPS_SCTR_QUOT = [];
        this.dataQuotation_EPS = {};

        let startDate = null;
        let endDate = null;

        let startDateAseg = null;
        let endDateAseg = null;
        const now = new Date();
        startDate = CommonMethods.formatDateToISO(now);
        endDate = CommonMethods.formatDateToISO(this.inputsQuotation.FDateFin);
        this.dataQuotation_EPS.codigoCotizacion = null;
        this.dataQuotation_EPS.codigoRamo = 77;
        this.dataQuotation_EPS.fechaEfecto = startDate;
        this.dataQuotation_EPS.fechaExpiracion = endDate;
        this.dataQuotation_EPS.fechaRegistro = null;
        this.dataQuotation_EPS.codigoActividadTecnica = this.inputsQuotation.P_NTECHNICAL;
        this.dataQuotation_EPS.codigoSubActividadTecnica = this.inputsQuotation.P_NECONOMIC;
        this.dataQuotation_EPS.ubigeo = await this.SCTRInei(this.inputsQuotation.P_NMUNICIPALITY);
        this.dataQuotation_EPS.primaMinima = this.inputsQuotation.P_PRIMA_MIN_SALUD;
        this.dataQuotation_EPS.primaMinimaPropuesta = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
        this.dataQuotation_EPS.asignacionActividadAltoRiesgo = this.inputsQuotation.P_MINA === "true" ? true : false;
        this.dataQuotation_EPS.codigoMoneda = 1;
        this.dataQuotation_EPS.codigoEstadoCotizacion = null;
        this.dataQuotation_EPS.codigoUsuarioRegistro = JSON.parse(localStorage.getItem('currentUser'))['username'];
        this.dataQuotation_EPS.primaComercial = this.totalNetoSaludSave;
        this.dataQuotation_EPS.igv = this.igvSaludSave;
        this.dataQuotation_EPS.derechoEmision = CommonMethods.formatValor(Number(this.inputsQuotation.primaComSalud) - Number(this.totalNetoSaludSave), 2);
        this.dataQuotation_EPS.primaTotal = this.brutaTotalSaludSave;
        this.dataQuotation_EPS.comentario = this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, '');
        this.dataQuotation_EPS.contratante = [];
        this.dataQuotation_EPS.intermediarios = [];
        this.dataQuotation_EPS.riesgos = [];

        let contratanteEPS: any = {};
        contratanteEPS.codigoTipoDocumento = this.inputsQuotation.P_NIDDOC_TYPE;
        contratanteEPS.numeroDocumento = this.EListClient[0].P_SIDDOC;
        contratanteEPS.nombreCompleto = this.EListClient[0].P_SLEGALNAME;
        contratanteEPS.nombres = this.EListClient[0].EListContactClient == null ? this.EListClient[0].P_SLEGALNAME : this.EListClient[0].EListContactClient.length == 0 ? this.EListClient[0].P_SLEGALNAME : this.EListClient[0].EListContactClient[0].P_SNOMBRES;
        contratanteEPS.apellidoPaterno = this.EListClient[0].EListContactClient == null ? '' : this.EListClient[0].EListContactClient.length == 0 ? '' : this.EListClient[0].EListContactClient[0].P_SAPEPAT;
        contratanteEPS.apellidoMaterno = this.EListClient[0].EListContactClient == null ? '' : this.EListClient[0].EListContactClient.length == 0 ? '' : this.EListClient[0].EListContactClient[0].P_SAPEMAT;
        contratanteEPS.correoElectronico = this.EListClient[0].EListContactClient == null ? this.EListClient[0].EListEmailClient[0].P_SE_MAIL : this.EListClient[0].EListContactClient.length == 0 ? this.EListClient[0].EListEmailClient[0].P_SE_MAIL : this.EListClient[0].EListContactClient[0].P_SE_MAIL;
        contratanteEPS.telefono = this.EListClient[0].EListContactClient == null ? '0000000' : this.EListClient[0].EListContactClient.length == 0 ? '0000000' : this.EListClient[0].EListContactClient[0].P_SPHONE;
        contratanteEPS.direccion = this.EListClient[0].EListAddresClient == null ? this.inputsQuotation.P_SDESDIREBUSQ : this.EListClient[0].EListAddresClient.length == 0 ? this.inputsQuotation.P_SDESDIREBUSQ : this.EListClient[0].EListAddresClient[0].P_SDESDIREBUSQ;
        contratanteEPS.ubigeo = await this.SCTRInei(this.inputsQuotation.P_NMUNICIPALITY);
        //contratanteEPS.sede = this.inputsQuotation.P_SSEDE;
        contratanteEPS.sede = (this.inputsQuotation.P_SSEDE == undefined) ? 'PRINCIPAL' : this.inputsQuotation.P_SSEDE;
        this.dataQuotation_EPS.contratante.push(contratanteEPS);

        if (this.brokerList.length > 0) {
            for (const dataBroker of this.brokerList) {
                let intermediarioEPS: any = {};
                intermediarioEPS.codigoExterno = dataBroker.NINTERMED;
                intermediarioEPS.codigoTipoDocumento = this.inputsQuotation.P_NIDDOC_TYPE;
                intermediarioEPS.numeroDocumento = dataBroker.NNUMDOC.trim();
                intermediarioEPS.nombreCompleto = dataBroker.RAZON_SOCIAL.trim();
                intermediarioEPS.nombres = dataBroker.SFIRSTNAME;
                intermediarioEPS.apellidoPaterno = dataBroker.SLASTNAME;
                intermediarioEPS.apellidoMaterno = dataBroker.SLASTNAME2;
                intermediarioEPS.codigoTipoCorredor = dataBroker.NINTERTYP;
                intermediarioEPS.gastoAsesoria = this.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD == '' ? '0' : dataBroker.P_COM_SALUD : '0';
                intermediarioEPS.gastoAsesoriaPropuesto = this.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD_PRO == '' ? '0' : dataBroker.P_COM_SALUD_PRO : '0';
                intermediarioEPS.ubigeo = await this.SCTRInei(this.brokerList[0].NMUNICIPALITY);
                intermediarioEPS.direccion = dataBroker.SSTREET.trim();
                intermediarioEPS.correoElectronico = dataBroker.SEMAILCLI;
                intermediarioEPS.telefono = dataBroker.SPHONE1;
                this.dataQuotation_EPS.intermediarios.push(intermediarioEPS);
            }
        }

        if (this.listaTasasSalud.length > 0) {

            this.listaTasasSalud.forEach(dataSalud => {
                if (dataSalud.planilla !== 0) {
                    let riesgo_EPS: any = {};

                    riesgo_EPS.codigoProducto = this.saludID.id;
                    if (dataSalud.description === 'Obrero Alto Riesgo') {
                        riesgo_EPS.codigoPlan = 3;
                        riesgo_EPS.codigoCategoria = 3;
                    } else if (dataSalud.description === 'Obrero') {
                        riesgo_EPS.codigoPlan = 4;
                        riesgo_EPS.codigoCategoria = 4;
                    } else if (dataSalud.description === 'Administrativo') {
                        riesgo_EPS.codigoPlan = 1;
                        riesgo_EPS.codigoCategoria = 1;
                    }
                    riesgo_EPS.cantidadTrabajador = dataSalud.totalWorkes;
                    riesgo_EPS.planillaTotal = dataSalud.planilla;
                    riesgo_EPS.tasaCalculada = dataSalud.rate;
                    riesgo_EPS.tasaPropuesta = dataSalud.planProp == '' ? '0' : dataSalud.planProp;
                    if (this.flagPrimaMinimaSalud == 1) {
                        riesgo_EPS.primaMensualAutorizada = (this.totalNetoSaludSave / this.listaTasasSalud.filter(item => item.planilla > 0).length).toFixed(2);
                    } else {
                        riesgo_EPS.primaMensualAutorizada = dataSalud.premiumMonth;
                    }
                    this.dataQuotation_EPS.riesgos.push(riesgo_EPS);
                }
            });
        }
    }

    async SCTRInei(distrito) { //AVS - INTERCONEXION SABSA 06/11/2023
        let ubigeo = 0
        await this.quotationService.equivalentINEI(distrito).toPromise().then(
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

    async ComisionesTecnicaEPS() { //AVS - INTERCONEXION SABSA 
        await this.quotationService.getComisionTecnica(this.contratanteId).toPromise().then(async res => {
            this.listaComisionTecnica = res;
            this.listaComisionTecnica.sort((a, b) => a.NPRODUCT - b.NPRODUCT);
        });
    }

    async TasasTecnicaEPS() { //AVS - INTERCONEXION SABSA 
        await this.quotationService.getTasastecnica(this.contratanteId).toPromise().then(async res => {
            this.listaTasasTecnica = res;

            const PensionTasasTecnica = this.listaTasasTecnica.filter(item => item.NPRODUCT === 1);
            this.listaTasasPension.forEach(pensionItem => {

                const matchingTecnicaItem = PensionTasasTecnica.find(tecnicaItem =>
                    tecnicaItem.NMODULEC === pensionItem.nmodulec
                );
                pensionItem.planProp = matchingTecnicaItem ? matchingTecnicaItem.NTASA_AUTOR === 1.2 ? 0 : matchingTecnicaItem.NTASA_AUTOR : 0;
            });

            const SaludTasasTecnica = this.listaTasasTecnica.filter(item => item.NPRODUCT === 2);
            this.listaTasasSalud.forEach(pensionItem => {

                const matchingTecnicaItem = SaludTasasTecnica.find(tecnicaItem =>
                    tecnicaItem.NMODULEC === pensionItem.nmodulec
                );
                pensionItem.planProp = matchingTecnicaItem ? matchingTecnicaItem.NTASA_AUTOR === 1.2 ? 0 : matchingTecnicaItem.NTASA_AUTOR : 0;
            });

            this.flagTasas = 0;

        });
    }

    async EstadoCliente(sclient) {
        await this.quotationService.getEstadoClienteNuevo(sclient).toPromise().then(res => {
            this.flagClienteNuevo = (res === undefined || res.P_ESTADO === undefined) ? 1 : res.P_ESTADO;
        });
    }

    /**
    * Obtiene el monto de planilla según el tipo de riesgo
    * @param riskTypeId id de tipo de riesgo
    */
    getPayrollAmount(riskTypeId: string) {
        let payRollAmount;
        this.tasasList.forEach(element => {
            if (element.nmodulec == riskTypeId) { payRollAmount = element.planilla; }
        });
        return payRollAmount;
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

    onSelectRateType() {
        this.onSelectProducto(null);
    }

    /**
    * Calcula la prima
    * @param payrollAmount monto de planilla
    * @param rate tasa
    */
    // calculatePremium(payrollAmount: number, rate: number) {
    //     // return Number(payrollAmount.toString()) * Number(rate.toString());
    //     return Number(payrollAmount.toString()) * Number(rate.toString()) / 100;
    // }

    /**
    * Calcula la primas neta total, IGV de prima neta total y la prima bruta total para las tasas autorizadas y primas mínimas autorizadas por producto
    * @param productId Id de producto
    */
    // checkMinimunPremiumForAuthorizedAmounts(productId: string, cantPrima?) {
    //     if (cantPrima != undefined) {
    //         let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
    //         totPrima = isNaN(totPrima) ? 0 : totPrima;
    //         if (productId == this.saludID.id) {
    //             this.inputsQuotation.P_PRIMA_MIN_SALUD = totPrima
    //         }

    //         if (productId == this.pensionID.id) {
    //             this.inputsQuotation.P_PRIMA_MIN_PENSION = totPrima
    //         }
    //     }

    //     if (productId == this.saludID.id) {
    //         this.inputsQuotation.P_PRIMA_MIN_SALUD = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.P_PRIMA_MIN_SALUD);
    //         let NetPremium = 0;
    //         this.listaTasasSalud.map(function (item) {
    //             NetPremium = NetPremium + Number(item.premiumMonth);
    //         });

    //         if (NetPremium < this.inputsQuotation.P_PRIMA_MIN_SALUD) {
    //             this.totalNetoSaludSave = this.inputsQuotation.P_PRIMA_MIN_SALUD;
    //             this.mensajePrimaSalud = this.variable.var_msjPrimaMin;
    //         } else {
    //             this.totalNetoSaludSave = NetPremium;
    //             this.mensajePrimaSalud = '';
    //         }
    //         this.inputsQuotation.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
    //         this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * Number(this.igvSaludWS.toString())) - this.totalNetoSaludSave, 2);
    //         this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.igvSaludSave) + Number(this.inputsQuotation.primaComSalud), 2);

    //     } else if (productId == this.pensionID.id) {
    //         this.inputsQuotation.P_PRIMA_MIN_PENSION = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.P_PRIMA_MIN_PENSION);
    //         let NetPremium = 0;
    //         this.listaTasasPension.map(function (item) {
    //             NetPremium = NetPremium + Number(item.premiumMonth);
    //         });
    //         if (NetPremium < this.inputsQuotation.P_PRIMA_MIN_PENSION) {
    //             this.totalNetoPensionSave = this.inputsQuotation.P_PRIMA_MIN_PENSION;
    //             this.mensajePrimaPension = this.variable.var_msjPrimaMin;
    //         } else {
    //             this.totalNetoPensionSave = NetPremium;
    //             this.mensajePrimaPension = '';
    //         }
    //         this.inputsQuotation.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
    //         this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * Number(this.igvPensionWS.toString())) - this.totalNetoPensionSave, 2);
    //         //Cálculo de nueva prima total bruta de Pensión
    //         this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.igvPensionSave) + Number(this.inputsQuotation.primaComPension), 2);
    //     }
    // }

    /**
    * Calcula la nueva prima según la tasa autorizada ingresada
    * Calcula la nueva prima total neta, IGV a la prima neta y la prima total bruta.
    * @param authorizedRate valor de ngModel de tasa autorizada
    * @param riskTypeId - Id de tipo de riesgo
    * @param productId Id de producto
    * 
    * item.rate, item.nmodulec, this.pensionID.id
    */
    // calculateNewPremiums(authorizedRate: any, riskTypeId: string, productId: string) {
    //     if (!this.template.debug_dummy) {
    //         let planProp = authorizedRate != '' ? Number(authorizedRate) : 0;
    //         planProp = isNaN(planProp) ? 0 : planProp;
    //         authorizedRate = planProp;
    //         // let self = this;
    //         if (productId == this.saludID.id) {
    //             if (authorizedRate > 100) {
    //                 this.listaTasasSalud.forEach(item => {
    //                     if (item.nmodulec == riskTypeId) {
    //                         item.valItem = true;
    //                     }
    //                 });
    //             }
    //             else {
    //                 this.listaTasasSalud.forEach(item => {
    //                     if (item.nmodulec == riskTypeId) {
    //                         item.valItem = false;
    //                     }
    //                 });
    //             }
    //         } else if (productId == this.pensionID.id) {
    //             if (authorizedRate > 100) {
    //                 this.listaTasasPension.forEach(item => {
    //                     if (item.nmodulec == riskTypeId) {
    //                         item.valItem = true;
    //                     }
    //                 });
    //             }
    //             else {
    //                 this.listaTasasPension.forEach(item => {
    //                     if (item.nmodulec == riskTypeId) {
    //                         item.valItem = false;
    //                     }
    //                 });
    //             }
    //         }

    //         if (isNaN(authorizedRate) || authorizedRate.toString().trim() == '') authorizedRate = 0; //Si el input está limpio, lo convertimos a 0

    //         let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), authorizedRate), 2); //cálculo de prima nueva con la tasa autorizada
    //         if (productId == this.pensionID.id) { //Si el producto es pensión
    //             let pensionNewNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
    //             this.listaTasasPension.forEach((element, key) => {
    //                 if (element.nmodulec == riskTypeId) {
    //                     this.listaTasasPension[key].premiumMonth = newPremium;
    //                     pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(newPremium.toString());
    //                 } else pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(element.premiumMonth.toString());

    //             });
    //             //Cálculo de nueva prima total neta de Pensión
    //             this.totalNetoPensionSave = CommonMethods.formatValor(pensionNewNetAmount, 2);
    //             //Cálculo de Prima Comercial de Pensión
    //             this.inputsQuotation.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
    //             //Cálculo de IGV de la nueva prima total neta de Pensión
    //             this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 2);
    //             //Cálculo de nueva prima total bruta de Pensión
    //             this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.igvPensionSave) + Number(this.inputsQuotation.primaComPension), 2);
    //             this.checkMinimunPremiumForAuthorizedAmounts(this.pensionID.id);
    //         }

    //         if (productId == this.saludID.id) { //Si el producto es Salud
    //             let saludNewNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
    //             this.listaTasasSalud.forEach((element, key) => {
    //                 if (element.nmodulec == riskTypeId) {
    //                     this.listaTasasSalud[key].premiumMonth = newPremium;
    //                     saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(newPremium.toString());
    //                 } else saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(element.premiumMonth.toString());
    //             });
    //             //Cálculo de nueva prima total neta de Salud
    //             this.totalNetoSaludSave = CommonMethods.formatValor(saludNewNetAmount, 2);
    //             //Cálculo de Prima Comercial de Pensión
    //             this.inputsQuotation.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
    //             //Cálculo de IGV de la nueva prima total neta de Salud
    //             this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 2);
    //             //Cálculo de nueva prima total bruta de Salud
    //             this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.igvSaludSave) + Number(this.inputsQuotation.primaComSalud), 2);

    //             this.checkMinimunPremiumForAuthorizedAmounts(this.saludID.id);
    //         }
    //     }

    // }
}