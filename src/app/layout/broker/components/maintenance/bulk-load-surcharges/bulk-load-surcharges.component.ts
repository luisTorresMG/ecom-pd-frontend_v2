import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { BulkLoadSurchargesService } from '../../../services/maintenance/bulk-load-surcharges.service';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import { ValErrorComponent } from '../../../modal/val-error/val-error.component';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
//util
import { ToastrService } from 'ngx-toastr';
import { UtilsService } from '@shared/services/utils/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as FileSaver from 'file-saver';
import swal from 'sweetalert2'; 

@Component({
    selector: 'app-bulk-load-surcharges',
    templateUrl: './bulk-load-surcharges.component.html',
    styleUrls: ['./bulk-load-surcharges.component.css']
})

export class BulkLoadSurchargesComponent implements OnInit {
    filters: any = {
        NBRANCH: 2,
        NPRODUCT: 3,
        NTYPE_TRANSAC: 0,
        NPARAM: 0,
        NPERFIL: 0,
        SDESCRIPT_TRANSAC: "",
        USER_ACCESS: 0,
        P_SISCLIENT_GBD : "0"
    }
    branchList: any[] = []
    productList: any[] = []
    transactionList: any[] = []
    parameterList: any[] = []
    profileList: any[] = []
    parameterListToShow: any[] = []
    excelSubir: File;
    isLoading: boolean = false; 
    selectedBranch: string = '';
    selectedProduct: string = '';
    errorTramaProduct = false;
    erroresList: any = [];
    errorExcel = false;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
    epsItem = JSON.parse(localStorage.getItem('eps'));
    //Variables de paginación
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

    userId: number;
    profileId: number;
    showCta = false;

    constructor(
        private modalService: NgbModal,
        private clientInformationService: ClientInformationService,
        private parameterSettingsService: ParameterSettingsService,
        private readonly utilsService: UtilsService,
        private spinner: NgxSpinnerService,
        private bulkLoadSurchargesService: BulkLoadSurchargesService,
        private policyemit: PolicyemitService
    ) { }

    async ngOnInit() {
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.profileId = await this.getProfileProduct();
        this.getBranchList();
        this.getProfiles(this.profileId);
    } 

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = this.userId;
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

    pageChanged(page: number) {
        this.currentPage = page;
        this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    async getBranchList() {
        this.clientInformationService.getBranches(this.codProducto, this.epsItem.NCODE).subscribe(res => {
            this.branchList = res
            this.filters.NBRANCH = this.branchList[0].NBRANCH
            this.getProductListByBranch();
        }, err => { console.log(err) })
    }
    
    async getProductListByBranch() {
        this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.filters.NBRANCH).subscribe(
            async res => {
                // Filtrar la lista para obtener solo el producto deseado
                const selectedProduct = res.find(product => product.COD_PRODUCT === 3);
                if (selectedProduct) {
                    this.productList = [selectedProduct]; // Solo se guarda el producto seleccionado
                    this.filters.NPRODUCT = selectedProduct.COD_PRODUCT;
                    await this.getUserAccess();
                } else {
                    console.log("Producto no encontrado");
                }
            },
            err => { console.log(err) }
        );
    }
    downloadExcel(){
        const data = [];

        this.isLoading = true;
        this.policyemit.downloadExcelRecargoVG(data).toPromise().then(
        res => {
          this.isLoading = false;
          if (res.indEECC === 0) {
            const nameFile: string = 'Modelo_Trama_Recargos';
            const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
            FileSaver.saveAs(file);
          }
        },
        err => {
          this.isLoading = false;
        });
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

    changeParameter(){
        if(this.filters.NPARAM == 3){
            this.showCta = true
        }else{
            this.showCta = false;
        }
    }   
    
    async getProfiles(profileId) {
        let _data: any = {};
        _data.nPerfil = profileId
        this.parameterSettingsService.getProfiles(_data).subscribe(
            res => {
                this.profileList = res
                if (this.profileList.length > 0 && this.profileId != 8) {
                    let defaultPro = this.profileList[0].NPERFIL;
                    this.filters.NPERFIL = defaultPro;
                }
            },
            err => {
                console.log(err)
            }
        )
    }

    async getUserAccess() {
        let data: any = {
            nBranch: this.filters.NBRANCH,
            nProduct: this.filters.NPRODUCT,
            nUsercode: this.userId
        }
        let userAccess = 0;
        await this.parameterSettingsService.GetUserAccess(data).toPromise().then(
            res => {
                this.filters.USER_ACCESS = res.code;
            },
            err => { console.log(err) }
        )
    }
    mostrarMas() {
        this.currentPage = 1;
        this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    //Seleccionamos el excel 
    seleccionExcel(archivo: File) { 
        this.excelSubir = null;
        if (!archivo) {
            this.excelSubir = null;
            return;
        }
        this.excelSubir = archivo;
    }
    //Validamos el excel por back y bd 
    validarExcel() { 
        let mensaje = '';
        if (this.excelSubir != undefined) {

            if (this.filters.NBRANCH == 0) mensaje += 'Debe ingresar la rama.<br>';
            if (this.filters.NPRODUCT == 0) mensaje += 'Debe ingresar el producto.<br>';
            
            if (mensaje) {
                this.errorTramaProduct = true;
                swal.fire('Información', mensaje, 'error');
            }
            else{
                this.validarTrama()
            }

        }else {
            swal.fire('Información', 'Adjunte una trama para validar', 'error');
        }
    }
    async validarTrama ()
    {
        this.errorExcel = false;
        this.isLoading = true;

        const myFormData: FormData = new FormData();
        myFormData.append('dataFile', this.excelSubir);
        const data: any = {};
        data.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.codRamo = this.filters.NBRANCH;
        data.codProceso = this.filters.NPRODUCT;
        myFormData.append('objValida', JSON.stringify(data));

        await this.bulkLoadSurchargesService.validateTramaRecargos(myFormData).toPromise().then(
            async res => {
                this.erroresList = res.C_TABLE;
                if (res.P_COD_ERR == '1') {
                    this.isLoading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                } else {
                    if (this.erroresList != null) {
                        if (this.erroresList.length > 0) {
                            this.isLoading = false;
                            const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                            modalRef.componentInstance.formModalReference = modalRef;
                            modalRef.componentInstance.erroresList = this.erroresList;
                        } else {
                            this.isLoading = false;
                            //swal.fire('Información', 'Se validó correctamente la trama', 'success');
                            swal.fire('Información', 'Se registro los datos de la trama correctamente.', 'success');
                        }
                    } else {
                        this.isLoading = false;
                        swal.fire('Información', 'El archivo enviado contiene errores', 'error');
                    }
                }
            },
            err => {
                this.isLoading = false;
            }


        );
    }
}

