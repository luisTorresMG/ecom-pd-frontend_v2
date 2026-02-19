import { Component, OnInit, Input } from '@angular/core';
import { OthersService } from '../../../services/shared/others.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-policy-documents',
  templateUrl: './policy-documents.component.html',
  styleUrls: ['./policy-documents.component.css']
})
export class PolicyDocumentsComponent implements OnInit {
  @Input() public reference: any;
  @Input() public adjuntosList: any;
  @Input() public generadosList: any;
  @Input() public comentario: any;
  @Input() public motAnulacion: any;
  @Input() public codTransac: any;
  @Input() public nbranch: any;
  @Input() set detalleEPSList(value: any[]) {
    this._detalleEPSList = value || [];
    if (this.opcionVer == 1) {
        this.totalItems = this._detalleEPSList.length;
        this.currentPage = 1;
        this.pageChanged(1); // Actualiza listToShow automáticamente
    }
  }
  @Input() public opcionVer: any;
  @Input() public nidheaderproc: any;

  title = "";
  cargas = [];
  currentPage = 1;
  itemsPerPage = 5;
  maxSize = 5;
  totalItems = 0;
  listToShow: any[] = [];
  private _detalleEPSList: any[] = [];

  constructor(
    private othersService: OthersService
  ) { }

    ngOnInit() {
        if(this.opcionVer == 1){
            this.title = "Detalle - Estados EPS";
        } else {
            if(this.codTransac == "6"){
                this.title = "Detalle - Anulación de movimiento";
            } else {
                this.title = "Documentos y Archivos adjuntos";
            }
        }

        if(this.generadosList != null){
            this.generadosList.forEach(e => this.cargas.push(false));
        }
    }


  downloadFile(filePath: string) {  //Descargar archivos de cotización
    this.othersService.downloadFile(filePath).subscribe(
      res => {
        if (res.StatusCode == 1) {
          swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
        } else {
          var newBlob = new Blob([res], { type: "application/pdf" });
          const nav: any = window.navigator;
           if (nav && nav.msSaveOrOpenBlob) {
            nav.msSaveOrOpenBlob(newBlob);
            return;
          }
          // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          //   window.navigator.msSaveOrOpenBlob(newBlob);
          //   return;
          // }
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
        swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
        console.log(err);
      }
    );
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

    pageChanged(page: number) {
        this.currentPage = page;
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.listToShow = this.detalleEPSList.slice(startIndex, endIndex);
    }

    get detalleEPSList(): any[] {
      return this._detalleEPSList;
    }
}
