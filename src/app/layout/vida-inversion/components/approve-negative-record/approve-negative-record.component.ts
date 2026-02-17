import {Component, Input, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import { VidaInversionService } from '../../services/vida-inversion.service';


@Component({    
    selector: 'app-approve-negative-record',
    templateUrl: './approve-negative-record.component.html',
    styleUrls: ['./approve-negative-record.component.scss']
})
export class ApproveNegativeRecordComponent implements OnInit {

    @Input() public reference: any;
    
    isLoading: boolean = false;
    NAME_CONTRACTOR: string = "";

    P_COMENTARIO: string = "";

    constructor(private vidaInversionService: VidaInversionService,) { }
    
    ngOnInit(): void {
        this.NAME_CONTRACTOR = this.reference.NAME_CONTRACTOR;
        this.isLoading = false;
    }

    async approveNegativeRecord(){
        this.isLoading = true;
        try{

            const nid_prospect = this.reference.ID_PROSPECT;
            const resp = await this.vidaInversionService.approveNegativeRecord({
                P_NID_PROSPECT: nid_prospect,
                P_NESTADO_RIESGON: 1,
                P_COMENTARIO: this.P_COMENTARIO
            }).toPromise();

            console.log("res-api: ", resp);

            if(resp.P_NCODE == 1){
                Swal.fire({
                    html: 'Ocurrió un error al aprobar el registro negativo.',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showCloseButton: false
                }); 
                return;
            }
            
            this.reference.close({is_success: true, comentario: this.P_COMENTARIO});
        } catch (error) {
            console.error("Error approving negative record:", error);
            Swal.fire({
                html: 'Ocurrió un error al aprobar el registro negativo.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false
            });
        }finally{
            this.isLoading = false;
        }
    }
    
    // cancelApproveNegativeRecord(){
    //     this.isLoading = true;
    //     this.reference.riesgo_negativo_aceptado = false;
    //     this.isLoading = false;
    //     this.reference.closeModal();
    // }
}