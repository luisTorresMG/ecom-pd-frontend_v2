import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { CommonMethods } from '../../../broker/components/common-methods';
import { PolicyMovementDetailsComponent } from '../../../broker/components/policy/policy-movement-details/policy-movement-details.component';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';
import { VidaInversionService } from '../../services/vida-inversion.service';
import moment from 'moment';
import Swal from 'sweetalert2'
import { PanelEndosoComponent } from '../../components/panel-endoso/panel-endoso.component';
import { PolicyMovementDetailsAllComponent } from '../../../broker/components/policy-all/policy-movement-details-all/policy-movement-details-all.component';

@Component({
    standalone: false,
    selector: 'app-policy-transaction-consult',
    templateUrl: './policy-transaction-consult.component.html',
    styleUrls: ['./policy-transaction-consult.component.scss']
})

export class PolicyTransactionConsultComponent implements OnInit {

    params: any = {
        P_NPRODUCT: '',
        P_NPOLICY: '',
        P_DFEC_INI: new Date(),
        P_DFEC_FIN: new Date(),
        P_NTYPE_CLI: '',
        P_NTYPE_DOC: '',
        P_SNUM_DOC: '',
        P_SNAMES: '',
        P_SAPE_PAT: '',
        P_SAPE_MAT: '',
        P_NBRANCH: '',
        P_NUSERCODE: ''
    };

    productTypes: any = [];
    clientTypes: any = [];
    docTypes: any = [];
    policyList: any = [];

    documents: any;
    userType: any;
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;
    diaActual = moment(new Date()).toDate();

    maxlength = 8;
    minlength = 8;
    selectedPolicy: string;

    listToShow: any = [];
    currentPage = 1;
    rotate = true;
    maxSize = 5;
    itemsPerPage = 5;
    totalItems = 0;

    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    lblFecha: string = '';
    branch: any;

    constructor(
        private clientInformationService: ClientInformationService,
        private modalService: NgbModal,
        private parameterSettingsService: ParameterSettingsService,
        private vidaInversionService: VidaInversionService
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
        this.productTypes = [
            { codigo: "6", valor: 'VIDA INVERSIÓN GLOBAL PROTECTA' }
        ];
        this.clientTypes = [
            { codigo: "0", valor: 'AMBOS' },
            { codigo: "1", valor: 'CONTRATANTE' },
            { codigo: "2", valor: 'ASEGURADO' }
        ];
        this.lblFecha = CommonMethods.tituloPantalla().toUpperCase();
        this.branch = await CommonMethods.branchXproduct(this.codProducto);
        this.userType = await this.getProfileProduct();
        this.getDocumentTypeList();
        this.initFilters();
    }

    async getProfileProduct() {
        let profile = 0;
        let data: any = {};
        data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(data).toPromise().then(
            res => {
                profile = res;
                return profile;
            }
        );
    }

    initFilters = () => {
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.params.P_DFEC_INI = this.diaActual;
        this.params.P_DFEC_FIN = this.diaActual;
        this.params.P_NPRODUCT = '6';
        this.params.P_NTYPE_DOC = '0';
        this.params.P_NTYPE_CLI = '0';
        this.params.P_NPOLICY = '';
        this.params.P_SNUM_DOC = '';
        this.params.P_SNAMES = '';
        this.params.P_SAPE_PAT = '';
        this.params.P_SAPE_MAT = '';
        this.params.P_NBRANCH = this.branch;;
        this.params.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    }

    getDocumentTypeList = () => {
        this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
            res => {
                this.docTypes = res;
            }
        );
    }

    openModal = (item: any) => {
        let modalRef: NgbModalRef;
        if (item.SCOTIZACION != '') {
            // modalRef = this.modalService.open(PolicyMovementDetailsComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            // modalRef.componentInstance.reference = modalRef;
            // modalRef.componentInstance.itemTransaccionList = this.policyList;
            // modalRef.componentInstance.cotizacionID = cotizacionID;

            const modalRef = this.modalService.open(PolicyMovementDetailsAllComponent, {
                        size: 'lg',
                        windowClass: 'modalCustom',
                        backdropClass: 'light-blue-backdrop',
                        backdrop: 'static',
                        keyboard: false,
                    });
                    modalRef.componentInstance.reference = modalRef;
                    modalRef.componentInstance.itemTransaccionList = this.policyList;
                    modalRef.componentInstance.NBRANCH = item.NBRANCH;
                    modalRef.componentInstance.NPRODUCT = item.NPRODUCT;
                    modalRef.componentInstance.NPOLICY = item.NPOLIZA;
            
                    modalRef.componentInstance.SBRANCH = item.SRAMO;
                    modalRef.componentInstance.SPRODUCT = item.SPRODUCTO;
                    modalRef.componentInstance.SCONTRATANTE = item.SNAME_CONT;
                    modalRef.componentInstance.NID_COTIZACION = item.SCOTIZACION;
                    
        }
    }

    onSelectTypeDocument = () => {
        let response = CommonMethods.selTipoDocumento(this.params.P_NTYPE_DOC)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
    }

    documentNumberKeyPress = (event: any) => {
        CommonMethods.validarNroDocumento(event, this.params.P_NTYPE_DOC)
    }

    validators = () => {

        let msg: string = '';
        let regexNum = /\D/;
        let regexLet = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s´¨]/;
        let regexAlf = /[^a-zA-Z0-9]/;

        // PÓLIZA
        if (this.params.P_NPOLICY.length > 0) {
            if (regexNum.test(this.params.P_NPOLICY)) {
                msg += "El número de póliza solo puede contener números. <br>";
            } else {
                if (this.params.P_NPOLICY.length !== 10) {
                    msg += "El número de póliza debe contener 10 caracteres. <br>";
                }
            }
        }

        // DOCUMENTOS
        if (this.params.P_NTYPE_DOC == 2) {
            if (this.params.P_SNUM_DOC.length > 0) {
                if (regexNum.test(this.params.P_SNUM_DOC)) {
                    msg += "El número de DNI solo puede contener números. <br>";
                } else {
                    if (this.params.P_SNUM_DOC.length !== 8) {
                        msg += "Se debe ingresar 8 dígitos para el DNI. <br>";
                    }
                }
            } else {
                if (this.params.P_NTYPE_CLI == "1") {
                    msg += "Debe ingresar el número de documento del contratante. <br>";
                } else if (this.params.P_NTYPE_CLI == "2") {
                    msg += "Debe ingresar el número de documento del asegurado. <br>";
                } else {
                    msg += "Debe ingresar el número de documento. <br>";
                }
            }
        } else if (this.params.P_NTYPE_DOC == 4) {
            if (this.params.P_SNUM_DOC.length > 0) {
                if (regexAlf.test(this.params.P_SNUM_DOC)) {
                    msg += "El carnet de extranjería solo puede contener caracteres alfanuméricos. <br>";
                } else {
                    if (this.params.P_SNUM_DOC.length < 8 || this.params.P_SNUM_DOC.length > 12) {
                        msg += "Se debe ingresar hasta 12 caracteres para el carnet de extranjería. <br>";
                    }
                }
            } else {
                if (this.params.P_NTYPE_CLI == "1") {
                    msg += "Debe ingresar el número de documento del contratante. <br>";
                } else if (this.params.P_NTYPE_CLI == "2") {
                    msg += "Debe ingresar el número de documento del asegurado. <br>";
                } else {
                    msg += "Debe ingresar el número de documento. <br>";
                }
            }
        } else {
            if (this.params.P_SNUM_DOC.length > 0) {
                if (this.params.P_NTYPE_CLI == "1") {
                    msg += "Debe seleccionar el tipo de documento del contratante. <br>";
                } else if (this.params.P_NTYPE_CLI == "2") {
                    msg += "Debe seleccionar el tipo de documento del asegurado. <br>";
                } else {
                    msg += "Debe seleccionar el tipo de documento. <br>";
                }
            }
        }

        // NOMBRES
        if (this.params.P_SNAMES.length > 0) {
            if (regexLet.test(this.params.P_SNAMES)) {
                msg += "El nombre solo puede contener letras. <br>";
            }
        }
        if (this.params.P_SAPE_PAT.length > 0) {
            if (regexLet.test(this.params.P_SAPE_PAT)) {
                msg += "El apellido 1 solo puede contener letras. <br>";
            }
        }
        if (this.params.P_SAPE_MAT.length > 0) {
            if (regexLet.test(this.params.P_SAPE_MAT)) {
                msg += "El apellido 2 solo puede contener letras. <br>";
            }
        }

        // FECHAS
        if (new Date(this.params.P_DFEC_INI) > new Date(this.params.P_DFEC_FIN)) {
            msg += "La fecha de inicio no puede ser mayor que la fecha de fin. <br>";
        }

        return msg;
    }

    search = () => {

        let msg: string = '';
        msg = this.validators();

        if (msg != '') {
            Swal.fire('Información', msg, 'warning');
        } else {
            this.isLoading = true;
            this.vidaInversionService.ListarReportePolizaTransaccionVIGP(this.params).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.isLoading = false;
                        this.listToShow = [];
                        this.currentPage = 1;
                        this.maxSize = 5;
                        this.totalItems = 0;
                        this.policyList = res.Result.P_LIST;
                        this.totalItems = this.policyList.length;
                        this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));

                        if (this.policyList.length == 0) {
                            Swal.fire(
                                {
                                    title: 'Información',
                                    text: 'No se encuentran póliza(s) con los datos ingresados.',
                                    icon: 'warning',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                }
                            ).then(
                                res => {
                                    if (res.value) {
                                        return;
                                    }
                                }
                            );
                        }
                    } else {
                        this.isLoading = false;
                        Swal.fire('Información', res.Result.P_SMESSAGE, 'error')
                    }
                },
                err => {
                    this.isLoading = false;
                    Swal.fire('Información', 'Ha ocurrido un error al obtener las pólizas.', 'error')
                }
            );
        }
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        this.selectedPolicy = '';
    }

    choosePolicyClk(selection: any) {
        if (selection != undefined && selection != '') {

            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(PanelEndosoComponent, {
                size: 'lg',
                backdropClass: 'light-blue-backdrop',
                backdrop: 'static',
                keyboard: true,
            });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.reference.documents = selection;


        } else {
            Swal.fire({
                title: 'Información',
                text: 'Para continuar deberá seleccionar una póliza',
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    return;
                }
            });
        }

    }
}