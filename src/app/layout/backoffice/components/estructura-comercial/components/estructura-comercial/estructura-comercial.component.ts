import {
    Component,
    OnInit,
    ViewChild,
    TemplateRef,
    ElementRef,
} from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    AbstractControl,
    Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegularExpressions } from '@shared/regexp/regexp';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EstructuraComercialModalComponent } from '../structura-comercial-modal/estructura-comercial-modal.component';
import { EstructuraComercialService } from '../../../../../broker/services/estructura-comercial/estructura-comercial.service';

@Component({
    selector: 'app-estructura-comercial',
    templateUrl: './estructura-comercial.component.html',
    styleUrls: ['./estructura-comercial.component.scss'],
})
export class EstructuraComercialComponent implements OnInit {
    
    formFilter!: FormGroup;
  

    list: any[] = []; // LISTA DE ESTRUCTURA COMERCIAL

    @ViewChild('modalMessage', { static: true, read: TemplateRef })
    modalMessage: TemplateRef<ElementRef>;

    branchOptions: any[] = [];
    productOptions: any[] = [];
    selectedBranch: any = { codigo: "" };
    selectedProduct: any = { codigo: "" };

    structure_list: any[] = [];
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;
    maxSize = 10;

    constructor(
        private readonly _builder: FormBuilder,
        private modalService: NgbModal,
        private readonly spinner: NgxSpinnerService,
        private readonly estructuraComercialService: EstructuraComercialService
    ) {
        this.formFilter = this._builder.group({
            validator: ['', Validators.pattern(RegularExpressions.numbers)],
            channelSale: [0],
            branch: [0],
            product: [0],
            structure: [''],
        });
     }

    async ngOnInit() {
        this.spinner.show();
        try {
            await this.getBranches();

            if (this.branchOptions.length > 0) {
                const vidaIndividualId = this.branchOptions.find(x => x.Id == 71)?.Id;
                if (vidaIndividualId) {
                    this.selectedBranch = { codigo: vidaIndividualId };

                    // this.formFilterControl['branch'].setValue(this.selectedBranch);

                    await this.getProducts();

                    if (this.productOptions.length > 0) {
                        const vidaInversionId = this.productOptions.find(x => x.Id == 6)?.Id;
                        if (vidaInversionId) {
                            this.selectedProduct = { codigo: vidaInversionId };
                            // this.formFilterControl['product'].setValue(this.selectedProduct);
                        }
                    }
                }
            }

            await this.estructuraComercialList();
        } catch (error) {
            console.log("error ngOnInit estructura comercial component: ", error);
        } finally {
            this.spinner.hide();
        }
    }

    get formFilterControl(): { [key: string]: AbstractControl } {
        return this.formFilter.controls;
    }

    get currentUser(): any {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    async estructuraComercialList(isLoading: boolean = false) {
        if (isLoading) this.spinner.show();
        try {
            const payload = {
                SBRANCH: this.selectedBranch.codigo,
                SPRODUCT: this.selectedProduct.codigo,
                SDESCRIPTION: this.formFilterControl['structure'].value,
                SSTATE: 'ACTIVE',
                SUSR_SESSION: this.currentUser['username'],
            };

            const response = await this.estructuraComercialService.EstructuraComercialList(payload).toPromise();

            this.list = response.Result;
            
            this.refreshPagination();
        } catch (error) {
            console.log("error estructura comercial list component: ", error);
        } finally {
            if (isLoading) this.spinner.hide();
        }
    }

    refreshPagination() {
        this.currentPage = 1;
            this.totalItems = this.list.length;
            this.structure_list = this.list.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
            );
    }

    async changeBranch() {
        await this.getProducts();
        this.selectedProduct = { codigo: '' };
    }

    async getProducts() {

        try {
            const branchId = this.selectedBranch.codigo;
            const response = await this.estructuraComercialService.EstructuraComercialProductsByBranchId(branchId).toPromise()
            this.productOptions = response.Result.map(item => ({
                Id: item.NPRODUCT,
                Name: item.SDESCRIPT
            }));
        } catch (error) {
            console.log("error get products component: ", error);
        }
    }

    async getBranches(): Promise<void> {
        try {
            const response = await this.estructuraComercialService.EstructuraComercialBranches().toPromise();
            this.branchOptions = response.Result.map(item => ({
                Id: item.NBRANCH,
                Name: item.SDESCRIPT,
                // SDESCRIPT: item.SDESCRIPT,
                // NBRANCH: item.NBRANCH
            }));
        } catch (error) {
            console.log("error get branches component: ", error);
        }
    }

    async search(resetPage = false) {
        await this.estructuraComercialList(true);
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.structure_list = this.list.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    newEstructura(): void {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(EstructuraComercialModalComponent, { size: 'xl', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.accion = 'CREATE';
        modalRef.componentInstance.reference.estructura = null;
        modalRef.result.then(
            (res) => {
                if (res) this.estructuraComercialList(true);
            })
    }


    viewEstructura(data: any): void {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(EstructuraComercialModalComponent, { size: 'xl', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.accion = 'VIEW';
        modalRef.componentInstance.reference.estructura = data;

        modalRef.result.then(
            (res) => {
                console.log("res: ", res);

            }
        )
    }

    editEstructura(data: any): void {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(EstructuraComercialModalComponent, { size: 'xl', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.reference.accion = 'UPDATE';
        modalRef.componentInstance.reference.estructura = data;

        modalRef.result.then(
            async (res) => {
                if (res) await this.estructuraComercialList(true);
            }
        )
    }
}
