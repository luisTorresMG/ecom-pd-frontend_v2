import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
// import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
// import { VidaInversionConstants } from '../../vida-inversion.constants';
// import { VidaInversionService } from '../../services/vida-inversion.service';
// import { QuotationService } from '../../../broker/services/quotation/quotation.service';
import { VidaInversionConstants } from '../../../../../vida-inversion/vida-inversion.constants';
import { EstructuraComercialService } from '../../../../../broker/services/estructura-comercial/estructura-comercial.service';

interface ISocietario {
    NID: number;
    SROL: any;
    SRAZON_SOCIAL: string;
    SRUC: string;
    NPORCENTAJE: number;
}

@Component({
    selector: 'app-estructura-comercial-modal',
    templateUrl: './estructura-comercial-modal.component.html',
    styleUrls: ['./estructura-comercial-modal.component.scss']
})
export class EstructuraComercialModalComponent implements OnInit {

    @Input() public reference: any;

    CONSTANTS: any = VidaInversionConstants;

    titleModal: string = "Agregar Societario del contratante";

    isLoading: boolean = false;

    isView: boolean = false;

    currentEstructure: any = {
        intertype: null,
        intersup: null,
        profile: null
    };

    estructura: any = {
        name: '',
        barnch_id: null,
        product_id: null
    };
    accion: string = "CREATE";

    estructuraDet: any[] = [];

    branchOptions: any[] = [];
    productOptions: any[] = [];
    interTypeOptions: any[] = [];
    interTypeSupOptions: any[] = [];
    profileOptions: any[] = [];
    selectedBranch: any = null;
    selectedProduct: any = null;

    cur_usr: any = null;

    detPaginate: any[] = [];
    currentPage = 1;
    itemsPerPage = 5;
    totalItems = 0;
    maxSize = 10;

    constructor(
        private readonly estructuraComercialService: EstructuraComercialService
    ) { }

    async ngOnInit() {

        this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
        this.accion = this.reference.accion;
        this.isLoading = true;

        try {
            this.handleTitleModal();
            await this.getBranches();

            if (this.branchOptions.length > 0) {
                const vidaIndividualId = this.branchOptions.find(x => x.NBRANCH == 71)?.NBRANCH;
                if (vidaIndividualId) {
                    this.selectedBranch = vidaIndividualId;
                    this.estructura.branch_id = this.selectedBranch;

                    await this.getProducts();

                    if (this.productOptions.length > 0) {
                        const vidaInversionId = this.productOptions.find(x => x.NPRODUCT == 6)?.NPRODUCT;
                        if (vidaInversionId) {
                            this.selectedProduct = vidaInversionId;
                            this.estructura.product_id = this.selectedProduct;
                        }
                    }
                }
            }

            await this.getTipoIntermediario();
            await this.getProfiles();

            if (this.accion == 'VIEW' || this.accion == 'UPDATE') {
                await this.loadData();
            }

        } catch (error) {
            console.log("error ngOnInit estructura comercial modal component: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadData() {
        try {
            const estructuraId = this.reference.estructura.NSTRUCTURE_CAB_ID;
            const response = await this.estructuraComercialService.EstructuraComercialById(estructuraId).toPromise();
            const estructuraData = response.Result;
            this.estructura.name = estructuraData.SSTRUCTURE;
            this.estructura.branch_id = estructuraData.NBRANCH;
            this.estructura.product_id = estructuraData.NPRODUCT;
            this.estructuraDet = estructuraData.detail.map(item => ({
                id: this.genUID(),
                intertype: item.NINTERTYP,
                intersup: item.NINTERTYP_SUP,
                profile: item.NIDPROFILE,
                intertypeList: this.interTypeOptions.map(row => ({ ...row })),
                intersupList: this.interTypeSupOptions.map(row => {
                    return {
                        NINTERTYP: row.NINTERTYP,
                        SDESCRIPT: row.SDESCRIPT,
                        show: row.NINTERTYP === item.NINTERTYP ? false : true
                    };
                }),
                profileList: this.profileOptions.map(item => ({ ...item })),
            }));

            console.log("estructuraDet loaded: ", this.estructuraDet);

            this.refreshPagination();
        } catch (error) {
            console.log("error load data estructura comercial modal component: ", error);
        }
    }

    genUID(): string {
        const code = Math.random().toString(36).substring(2, 10);
        return code;
    }

    refreshPagination() {
        this.currentPage = 1;
        this.totalItems = this.estructuraDet.length;
        this.detPaginate = this.estructuraDet.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        ).map(item => ({ ...item }));
    }

    onChangeInterType(event: any) {
        this.currentEstructure.intersup = 0;
        for (let item of this.interTypeSupOptions) {
            item.show = true;
            if (item.NINTERTYP === event) item.show = false;
        }
    }

    onChangeInterTypeItem(item: any) {

        for (let structureItem of this.estructuraDet) {

            if (structureItem.id === item.id) {
                structureItem.intertype = item.intertype;
                structureItem.intersup = 0;

                for (let interTypeSup of structureItem.intersupList) {
                    interTypeSup.show = true;
                    if (interTypeSup.NINTERTYP === item.intertype) {
                        interTypeSup.show = false;
                    }
                }

                break;
            }
        }

        this.refreshPagination();
    }

    onChangeInterTypeSupItem(item: any) {

        for (let structureItem of this.estructuraDet) {
            if (structureItem.id === item.id) {
                structureItem.intersup = item.intersup;
                break;
            }
        }

        this.refreshPagination();
    }

    onChangeProfileItem(item: any) {

        for (let structureItem of this.estructuraDet) {
            if (structureItem.id === item.id) {
                structureItem.profile = item.profile;
                break;
            }
        }

        this.refreshPagination();
    }

    async getProducts() {

        try {
            const branchId = this.selectedBranch;
            const response = await this.estructuraComercialService.EstructuraComercialProductsByBranchId(branchId).toPromise()
            this.productOptions = response.Result;
        } catch (error) {
            console.log("error get products component: ", error);
        }
    }

    async getBranches() {
        try {
            const response = await this.estructuraComercialService.EstructuraComercialBranches().toPromise();
            this.branchOptions = response.Result;

        } catch (error) {
            console.log("error get branches component: ", error);
        }
    }

    async getTipoIntermediario() {
        try {
            const response = await this.estructuraComercialService.EstructureComercialIntertype().toPromise();
            this.interTypeOptions = response.Result.map(item => ({ ...item, show: true }));
            this.interTypeSupOptions = response.Result.map(item => ({ ...item, show: true }));

        } catch (error) {
            console.log("error get tipo intermediario component: ", error);
        }
    }

    async getProfiles() {
        try {
            const productoCanal = this.CONSTANTS.COD_CHA_PRODUCTO;
            const response = await this.estructuraComercialService.EstructuraComercialProfiles(productoCanal).toPromise();
            this.profileOptions = response.Result.map(item => ({ ...item, SNAME: item.SNAME.trim().charAt(0).toUpperCase() + item.SNAME.trim().slice(1).toLowerCase() }));
        } catch (error) {
            console.log("error get profiles component: ", error);
        }
    }

    addEstructure() {

        if (!this.validateAddItem()) {
            return;
        }
        const uuid = this.genUID();
        this.estructuraDet.push({
            id: uuid,
            intertypeList: this.interTypeOptions.map(item => ({ ...item })),
            intersupList: this.interTypeSupOptions.map(item => ({ ...item })),
            profileList: this.profileOptions.map(item => ({ ...item })),

            intertype: this.currentEstructure.intertype,
            intersup: this.currentEstructure.intersup,
            profile: this.currentEstructure.profile,
        });

        this.currentEstructure = {
            intertype: 0,
            intersup: 0,
            profile: 0
        };
        this.interTypeOptions.forEach(item => item.show = true);
        this.interTypeSupOptions.forEach(item => item.show = true);

        this.refreshPagination();
    }

    validateAddItem(): boolean {
        if (this.currentEstructure.intertype == null || this.currentEstructure.intertype == 0 || this.currentEstructure.intertype == '') {
            Swal.fire({
                html: 'El campo Tipo de Intermediario es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }
        // if (this.currentEstructure.intersup == null || this.currentEstructure.intersup == 0 || this.currentEstructure.intersup == '') {
        //     Swal.fire({
        //         html: 'El campo Intermediario Superior es obligatorio.',
        //         icon: 'warning',
        //         confirmButtonText: 'Aceptar'
        //     });
        //     return false;
        // }
        if (this.currentEstructure.profile == null || this.currentEstructure.profile == 0 || this.currentEstructure.profile == '') {
            Swal.fire({
                html: 'El campo Perfil es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        // Validate duplicate entry
        if (!this.validateDuplicateEntry()) {
            return false;
        }

        return true;
    }

    validateDuplicateEntry(): boolean {
        const duplicateType = this.estructuraDet.find(item =>
            item.intertype === this.currentEstructure.intertype
        );
        const duplicateTypeSup = this.estructuraDet.find(item =>
            item.intersup === this.currentEstructure.intersup &&
            this.currentEstructure.intersup != 0
        );
        const duplicateProfile = this.estructuraDet.find(item =>
            item.profile === this.currentEstructure.profile
        );

        if (duplicateType || duplicateTypeSup || duplicateProfile) {
            Swal.fire({
                html: 'El detalle que intenta agregar ya existe.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }
        return true;
    }

    async registrarEstructura() {

        if (this.estructuraDet.length == 0) {
            Swal.fire({
                html: 'Debe agregar al menos un detalle a la estructura comercial.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.name.trim() == '') {
            Swal.fire({
                html: 'El nombre de la estructura comercial es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.branch_id == 0) {
            Swal.fire({
                html: 'El campo Ramo es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.product_id == 0) {
            Swal.fire({
                html: 'El campo Producto es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        const isIncomplete = this.validateEstructuraDet();

        if (isIncomplete) {
            Swal.fire({
                html: 'Existen detalles incompletos en la estructura comercial. Por favor, verifique.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        this.isLoading = true;
        try {
            const payload = {
                SSTRUCTURE: this.estructura.name,
                NBRANCH: this.estructura.branch_id,
                NPRODUCT: this.estructura.product_id,
                NUSERCODE: this.cur_usr.id,
                STRUCTUREDET: this.estructuraDet.map(item => ({
                    NINTERTYP: item.intertype,
                    NINTERTYP_SUP: item.intersup,
                    NIDPROFILE: item.profile
                }))
            };

            const response = await this.estructuraComercialService.EtructuraComercialCreate(payload).toPromise();

            if (response.Result.P_CODERROR == 1) {
                Swal.fire({
                    html: response.Result.P_SMESSAGE,
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }

            Swal.fire({
                html: 'Estructura Comercial registrada con éxito.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
            this.reference.close(true);
        } catch (error) {
            console.log("error registrar estructura comercial component: ", error);
            Swal.fire({
                html: 'Ocurrió un error al registrar la Estructura Comercial. Por favor, inténtelo nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
        } finally {
            this.isLoading = false;
        }
    }

    validateEstructuraDet(): boolean {
        let isError = false;
        for (let item of this.estructuraDet) {
            if (item.intertype == null || item.intertype == '' || item.intertype == 0) {
                isError = true;
                break;
            }
            if (item.profile == null || item.profile == '' || item.profile == 0) {
                isError = true;
                break;
            }
        }
        return isError;
    }

    async actualizarEstructura() {

        if (this.estructuraDet.length == 0) {
            Swal.fire({
                html: 'Debe agregar al menos un detalle a la estructura comercial.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.name.trim() == '') {
            Swal.fire({
                html: 'El nombre de la estructura comercial es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.branch_id == 0) {
            Swal.fire({
                html: 'El campo Ramo es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        if (this.estructura.product_id == 0) {
            Swal.fire({
                html: 'El campo Producto es obligatorio.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        const isIncomplete = this.validateEstructuraDet();

        if (isIncomplete) {
            Swal.fire({
                html: 'Existen detalles incompletos en la estructura comercial. Por favor, verifique.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        this.isLoading = true;
        const structureCabId = this.reference.estructura.NSTRUCTURE_CAB_ID;
        try {
            const payload = {
                NSTRUCTURE_CAB_ID: Number(structureCabId),
                SSTRUCTURE: this.estructura.name,
                NBRANCH: this.estructura.branch_id,
                NPRODUCT: this.estructura.product_id,
                NUSERCODE: this.cur_usr.id,
                STRUCTUREDET: this.estructuraDet.map(item => ({
                    NINTERTYP: item.intertype,
                    NINTERTYP_SUP: item.intersup,
                    NIDPROFILE: item.profile
                }))
            };

            const response = await this.estructuraComercialService.EstructuraComercialUpdate(payload).toPromise();

            if (response.Result.P_CODERROR == 1) {
                Swal.fire({
                    html: response.Result.P_SMESSAGE,
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }

            Swal.fire({
                html: 'Estructura Comercial actualizada con éxito.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
            this.reference.close(true);
        } catch (error) {
            console.log("error actualizar estructura comercial component: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    validarCaracter(event: KeyboardEvent) {
        // const permitido = /^[A-Za-z0-9.-]$/;
        const permitido = /^[A-Za-z0-9.\- ]$/;

        if (!permitido.test(event.key)) {
            event.preventDefault();
        }
    }

    handleTitleModal() {
        switch (this.accion) {
            case 'CREATE':
                this.titleModal = "Creación de Estructura Comercial";
                break;
            case 'UPDATE':
                this.titleModal = "Editar Estructura Comercial";
                break;
            case 'VIEW':
                this.titleModal = "Ver Estructura Comercial";
                break;
        }
    }

    removeItem(item: any) {
        const newList = this.estructuraDet.filter(row => row.id !== item.id);
        this.estructuraDet = newList;
        this.refreshPagination();
    }

}
