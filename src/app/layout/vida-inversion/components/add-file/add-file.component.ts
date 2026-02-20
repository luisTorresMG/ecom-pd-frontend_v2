import { Component, Input, OnInit } from '@angular/core';
import { VidaInversionService } from '../../services/vida-inversion.service';
import Swal from 'sweetalert2';

@Component({
    standalone: false,
    selector: 'app-add-file',
    templateUrl: './add-file.component.html',
    styleUrls: ['./add-file.component.css']
})

export class AddFileComponent implements OnInit {

    @Input() check_input_value;
    @Input() public reference: any;

    isLoading: boolean = false;
    pdfFile: File | null = null;
    errorMessage: string | null = null;
    accpet_promotions: string = null;
    is_policy:boolean;
    show_validate_message: boolean = false;
    have_doc: boolean = false;
    have_promotions_value: boolean = false;


    constructor(
        private vidaInversionService: VidaInversionService
    ) { }

    async ngOnInit() {
        this.isLoading = true;

        const response_get_current_promotion_value = await this.vidaInversionService.GetCurrentPromotionValue(this.reference.obj.P_NID_COTIZACION).toPromise();
        this.accpet_promotions = response_get_current_promotion_value.SAUTORIZA;
        this.is_policy = response_get_current_promotion_value.ISPOLICY;
        
    }

    onFileChange = (event: any) => {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'pdf') {
                this.pdfFile = file;
                this.errorMessage = null;
            } else {
                this.pdfFile = null;
                this.errorMessage = 'Solo se permiten archivos PDF.';
            }
        }
    }

    onSubmit = async () => {

        this.have_doc = this.pdfFile ? true : false;
        console.log(this.pdfFile);
        console.log(this.accpet_promotions);
        
        this.have_promotions_value = this.accpet_promotions != "null" ? true : false;

        let myFormData: FormData = new FormData();

        myFormData.append('objeto', JSON.stringify(this.reference.obj));
        myFormData.append('dataFile', this.pdfFile);

        console.log(this.have_doc);
        console.log(this.have_promotions_value);
        // INI VIGP-485
        if (!this.have_doc || !this.have_promotions_value) {
            this.show_validate_message = true;
            return;
        }
        else {
            this.show_validate_message = false;
        }

        let current_time = new Date();
        current_time.setHours(current_time.getHours() - 5);

        const request = {
            cotizacion: this.reference.obj.P_NID_COTIZACION,
            iddocumento: this.reference.obj.P_SDOCUMENT, //Sdocument
            // timestamp: current_time,
            cliente: this.reference.obj.P_SCLIENT, //SCLEINT
            autoriza: this.accpet_promotions,
            origen: "PD"
        }

        const response_accept_promotions = await this.vidaInversionService.AcceptPromotions(request).toPromise();

        if (response_accept_promotions.P_NCODE === 1) {
            // Swal.fire('Información', response_accept_promotions.P_SMESSAGE, 'error');
            Swal.fire('Información', "Ocurrió un error al registrar su respuesta de promociones. Por favor, inténtalo nuevamente.", 'error');
            return;
        }
        // FIN VIGP-485

        const response_save_document = await this.vidaInversionService.SaveDocumentsVIGP(myFormData).toPromise();

        if (response_save_document.P_NCODE == 0) {
            
            // Si no tiene poliza regenrar File del cliente
            !this.is_policy && this.vidaInversionService.reGenDocumentsVIGP({P_NID_COTIZACION: this.reference.obj.P_NID_COTIZACION, P_NDOCUMENT : 3, P_APPLY_DELETE: 1}).toPromise(); // VIGP-485

            Swal.fire('Información', "Se subió el archivo correctamente.", 'success');

            this.reference.readFile();
        } else {
            // Swal.fire('Información', response_save_document.P_MESSAGE, 'error');
            Swal.fire('Información', "Ocurrió un error al guardar el documento. Por favor, inténtalo nuevamente.", 'error');
            return;
        }
        this.reference.close();
        this.reference.previusStep();
        // this.reference.funFirmaManuscrita();

    }
}