import { Component, Input, OnInit } from '@angular/core';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { VidaInversionService } from '../../services/vida-inversion.service';
@Component({
    selector: 'app-voucher',
    templateUrl: './voucher.component.html',
    styleUrls: ['./voucher.component.scss'],
})
export class VoucherComponent implements OnInit {

    @Input() public reference: any;
    payment_status: boolean = false;
    bank_selected: any;
    CONSTANTS: any = VidaInversionConstants;
    banks_list: { Id_entidad: number, Entidad_descript: string }[] = [];
    bank_selected_disabled: boolean = false;
    payment_status_disabled: boolean = false;
    save_btn_disabled: boolean = false;
    disabled_inputs_voucher_component: boolean = false;
    
    constructor(public vidaInversionService: VidaInversionService) { }

    async ngOnInit() {

        this.bank_selected = this.reference.bank_selected;
        this.payment_status = this.reference.payment_status

        this.disabled_inputs_voucher_component = this.reference.disabled_inputs_voucher_component;
        this.disabled_inputs_voucher_component && this.disabledInputsVocuher();
        
    }

    getBankList() {
        const response = this.vidaInversionService.getBanksVigp().toPromise();
        return response;
    }

    updateTotalPaymentStatus(status_total_payment, id_bank) {
        console.log(id_bank);
        const request = {
            P_NID_COTIZACION: this.reference.nid_cotizacion,
            P_NIDPROD: this.reference.nid_proc,
            P_STATUS_TOTAL_PAYMENT: status_total_payment,
            P_BANK_PAYMENT: id_bank ? id_bank : null
        }
        const response = this.vidaInversionService.updateStatusTotalPayment(request).toPromise();
        return response;
    }

    async onUpdateTotalPaymentStatus() {
        await this.updateTotalPaymentStatus(this.payment_status ? 1 : 0, this.bank_selected.codigo);
        this.reference.close();
    }

    disabledInputsVocuher() {
        // this.bank_selected_disabled = true;
        this.payment_status_disabled = true;
        // this.save_btn_disabled = true;
        
    }

}
