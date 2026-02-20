import { Component, OnInit, Input } from '@angular/core';
import { OthersService } from '../../../services/shared/others.service';
import swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-policy-documents-all',
  templateUrl: './policy-documents-all.component.html',
  styleUrls: ['./policy-documents-all.component.css']
})
export class PolicyDocumentsAllComponent implements OnInit {
  @Input() public reference: any;
  @Input() public generadosList: any;
  @Input() public codTransac: any;
  @Input() public motAnulacion: any;
  @Input() public commentAnulacion: any;

  title = "";
  cargas = [];

  constructor(
    private othersService: OthersService
  ) { }

  ngOnInit() {
    // console.log("20" + this.generadosList);
    this.title = "Documentos y Archivos adjuntos";

    if(this.generadosList != null){
        this.generadosList.forEach( e => {
            this.cargas.push(false);
        })
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

  downloadFile(filePath: string, i: number) {  //Descargar archivos de cotización
    this.cargas[i] = true;
    this.othersService.downloadFile(filePath).subscribe(
        res => {
            if (res.StatusCode == 1) {
                swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                this.cargas[i] = false;
                //this.carga = false;
            }else{
                const link = document.createElement('a');
                const url = window.URL.createObjectURL(res);
                link.href = url;
                link.download = filePath.substring(filePath.lastIndexOf("\\") + 1); // Nombre del archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                this.cargas[i] = false;
                //this.carga = false;
            }
        }, err => {
            swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            console.log(err);
            this.cargas[i] = false;
            //this.carga = false;
        })
    // this.othersService.downloadFile(filePath).subscribe(
    //   res => {
    //     if (res.StatusCode == 1) {
    //       swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
    //     } else {
    //       //Es necesario crear un objeto BLOB con el tipo MIME (mime-type) explícitamente configurado
    //       //de otra manera chrome solo funcionaría como debería
    //       var newBlob = new Blob([res], { type: "application/pdf" });

    //       //IE no permite usar un objeto BLOB directamente como un link href
    //       //Por el contrario, es necesario usar msSaveOrOpenBlob
    //       if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //         window.navigator.msSaveOrOpenBlob(newBlob);
    //         return;
    //       }

    //       // Para otros navegadores:
    //       //Crea un link apuntando al ObjectURL que contiene el BLOB.
    //       const data = window.URL.createObjectURL(newBlob);

    //       var link = document.createElement('a');
    //       link.href = data;

    //       link.download = filePath.substring(filePath.lastIndexOf("\\") + 1);
    //       //Esto es necesario si link.click() no funciona en la ultima versión de firefox
    //       link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    //       setTimeout(function () {
    //         //Para Firefox es necesario retrasar la revocación del objectURL
    //         window.URL.revokeObjectURL(data);
    //         link.remove();
    //       }, 100);
    //     }

    //   },
    //   err => {
    //     swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
    //     console.log(err);
    //   }
    // );
  }

}