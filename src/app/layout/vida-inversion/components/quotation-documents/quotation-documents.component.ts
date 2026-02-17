import { Component, OnInit, Input } from '@angular/core';
import { OthersService } from '../../../../layout/broker/services/shared/others.service';
import swal from 'sweetalert2';
import { NgbPaginationNumber } from '@ng-bootstrap/ng-bootstrap';
import { QuotationService } from '../../../broker/services/quotation/quotation.service';

@Component({
    selector: 'app-quotation-documents',
    templateUrl: './quotation-documents.component.html',
    styleUrls: ['./quotation-documents.component.css']
})
export class QuotationDocumentsComponent implements OnInit {
    @Input() public reference: any;
    @Input() public adjuntosList: any;
    @Input() public generadosList: any;
    @Input() public cotizacion: any;
    @Input() public motAnulacion: any;
    @Input() public codTransac: any;

    vista: any;
    fileExists: boolean = false;
    fileUrl: string = 'URL_DEL_ARCHIVO';
    file_existe: Number;
    document_list: any;

    title = "";

    constructor(
        private othersService: OthersService,
        public quotationService: QuotationService,
    ) { }

    async ngOnInit() {
        this.title = "Documentos PEP de la Cotización"
        this.vista = 0;
        await this.getDocuments();
    }

    async getDocuments() {
        try {
            const response_routes_docs_pep = await this.quotationService.GetRoutesDocsPep(this.cotizacion.toString()).toPromise();
            this.document_list = response_routes_docs_pep.P_DOCUMENTS;
        } catch (error) {
            
        }finally{

        }
    }

    async downloadFile(tipo: number) {  //Descargar archivos de cotización
        //debugger 
        let filePath = "";

        let status_doc = 0;
                
        filePath = this.document_list[tipo].P_FILE_NAME;
        status_doc = this.document_list[tipo].P_STATUS;


        if (status_doc == 1) {
            this.othersService.downloadFile(filePath).subscribe(
                res => {
                    if (res.StatusCode == 1) {
                        swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                    } else {
                        var newBlob = new Blob([res], { type: "application/pdf" });
                        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveOrOpenBlob(newBlob);
                            return;
                        }
                        const data = window.URL.createObjectURL(newBlob);

                        var link = document.createElement('a');
                        link.href = data;

                        link.download = filePath.substring(filePath.lastIndexOf("\\") + 1);
                        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                        setTimeout(function () {
                            window.URL.revokeObjectURL(data);
                            link.remove();
                        }, 100);
                    }

                },
                err => {
                    // swal.fire('Información', 'El archivo se esta generando ...', 'info');
                    swal.fire('Información', 'Sucedió un error al descargar el archivo.', 'error');
                    console.log(err);
                }
            );
        }
        else {
            await this.getDocuments();
            swal.fire('Información', 'El archivo se esta generando ...', 'info');
        }


    }

    listToString(list: String[]): string {
        let output = "";
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + " <br>"
            });
        }
        return output;
    }



}
