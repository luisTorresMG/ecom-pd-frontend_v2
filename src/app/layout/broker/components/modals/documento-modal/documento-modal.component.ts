import {
  Component,
  OnInit,
  Input,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import Swal from 'sweetalert2';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OthersService } from '../../../services/shared/others.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-documento-modal',
  templateUrl: './documento-modal.component.html',
  styleUrls: ['./documento-modal.component.css'],
})
export class DocumentoModalComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;
  @Input() public SCODE: string;
  @Input() public NTICKET: any;
  @Input() public listActions: any;
  
  inputs: any = {};
  listAdj: any = [];
  tipoComentario: any[];
  opcionesTipoComentario: any[] = [];
  destinatarios: any[];
  opcionesDestinatarios: any[];
  semails: string;
  P_SMESSAGE: string[];
  P_NCODE: Number;

  doc_registrados: any = [];
  fileCant: number;
  fileSize: number;
  fileFormats: string;
  suscription:Subscription

  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal,
    private othersService: OthersService,
    private modalService: NgbModal

  ) {}

  ngOnInit() {
    this.getListAdjunt()
    this.getConfFile();
    this.suscription = this.rentasService.refreshDetail$.subscribe(() => {
        this.getListAdjunt();
    });
  }

  async onFileSelected(event: any, SCODE: string) {
    const mensaje = await this.getMessage(24);
    const mensaje2 = await this.getMessage(23);
    const mensaje3 = await this.getMessage(25);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    const mensajeParts3: [SweetAlertIcon, string, string] =
      this.separateString(mensaje3);

    const fileInput = event.target;
    const allowedExtensions = this.fileFormats.split(',');
    const file: File = fileInput.files[0];

    const extension = file.name
      .substring(file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: `${mensajeParts[2]} ${this.getDisplayFileFormats()}.`,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (this.doc_registrados.length >= this.fileCant) {
      Swal.fire({
        icon: mensajeParts2[0],
        title: mensajeParts2[1],
        text: mensajeParts2[2] + this.fileCant,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (file) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > this.fileSize) {
        Swal.fire({
          icon: mensajeParts3[0],
          title: mensajeParts3[1],
          text: `${mensajeParts3[2]} ${this.fileSize} KB.`,
        });
        fileInput.value = ''; // Limpiar el input
        return;
      }

      const fileNameWithoutExtension = file.name.substring(
        0,
        file.name.lastIndexOf('.')
      );
      const extension = file.name.substring(file.name.lastIndexOf('.'));

      // Concatenar el sufijo "-ticket" antes de la extensión
      const fileNameWithSuffix = `${fileNameWithoutExtension}-${SCODE}${extension}`;
      const existingDocIndex = this.doc_registrados.findIndex(
        (doc) => doc.SNAME === fileNameWithSuffix
      );
      if (existingDocIndex !== -1) {
        // Si ya existe un documento con el mismo nombre, llama a la función eliminar
        this.eliminar(this.doc_registrados[existingDocIndex]);
      }

      const newDoc = {
        file: file,
        SNAME: fileNameWithSuffix,
        SSIZE: `${fileSizeKB.toFixed(2)} KB`,
        SPATH: URL.createObjectURL(file),
        isNew: true,
      };

      this.doc_registrados.push(newDoc);
    }
    fileInput.value = '';
  }

  getConfFile() {
    this.rentasService.getConfFile().subscribe({
      next: (res) => {
        this.fileCant = Number(res.C_TABLE[0].FILE_CANT_TK);
        this.fileSize = Number(res.C_TABLE[0].FILE_SIZE);
        this.fileFormats = res.C_TABLE[0].FILE_FORMATS;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  eliminar(doc: any) {
    // Aquí va la lógica para eliminar el documento
    this.rentasService.delTickAdjunt(doc.NID);
    const index = this.doc_registrados.indexOf(doc);
    if (index !== -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA ELIMINAR UN DOCUMENTO
  deleteFile(doc: any) {
    const index = this.doc_registrados.indexOf(doc);
    if (index > -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA SUBIR EL DOCUMETO
  uploadFile(doc: any) {
    doc.isNew = false;
  }

  async getMessage(nerror: number): Promise<string> {
    const data = {
      P_NERRORNUM: nerror,
    };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error(error);
      return 'Error al obtener el mensaje';
    }
  }

  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }

  
  getDisplayFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }

    const formats = this.fileFormats.split(',');
    if (formats.length > 1) {
      const lastFormat = formats.pop();
      return formats.join(', ') + ' y ' + lastFormat;
    } else if (formats.length === 1) {
      return formats[0];
    } else {
      return '';
    }
  }
  getAcceptedFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }
    return this.fileFormats
      .split(',')
      .map((ext) => `.${ext}`)
      .join(',');
  }

  logValue(value: any): any {
    console.log('Valor mostrado:', value);
    return value;
  }
  

  
  getListAdjunt() {
    const data = {
      P_NTICKET: this.NTICKET,
    };
    this.rentasService.getListAdjunt(data).subscribe({
      next: (response) => {
        this.doc_registrados = response.P_CURSOR;
        console.log(this.doc_registrados[0].isEditing )
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  listToString(list: string[]): string {
    let output = '';
    if (list != null) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }
  async downloadFile(filePath: string) {
    const mensaje = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    this.othersService.downloadFile(filePath).subscribe(
      (res) => {
        if (res.StatusCode == 1) {
          Swal.fire(
            'Información',
            this.listToString(res.ErrorMessageList),
            'error'
          );
        } else {
          const newBlob = new Blob([res], { type: 'application/pdf' });

          const navigator: any = window.navigator;
          if (navigator?.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(newBlob);
            return;
          }

          const data = window.URL.createObjectURL(newBlob);

          const link = document.createElement('a');
          link.href = data;

          link.download = filePath.substring(filePath.lastIndexOf('\\') + 1);
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );

          setTimeout(() => {
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        console.log(err);
      }
    );
  }

  async valTblAttachedfile(doc: any) {
    const data = {
      P_NTICKET: this.NTICKET,
      P_NID: doc.NID,
      P_SNAME: doc.SNAME,
    };
    console.log(data);
    this.rentasService.valTblAttachedfile(data).subscribe((res) => {
      if (res.P_NCODE == 2) {
        this.deleteFileModal(doc, res.P_SMESSAGE);
      } else if(res.P_NCODE == 1){
        const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(res.P_SMESSAGE);
        Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
      } else {
        this.delTickAdjunt(doc);
      }
    });
  }
  async deleteFileModal(doc, mensaje) {
    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    const mensajeSeparate = this.separateString(mensaje);
    modalRef.componentInstance.mensaje = mensajeSeparate;
    modalRef.result
      .then(() => {
        this.delTickAdjunt(doc);
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }
  async delTickAdjunt(doc: any) {
    this.deleteFile(doc);
    const mensaje = await this.getMessage(11);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    console.log(doc)
    const data2 = {
      P_NID: doc.NID,
      P_SRUTA: doc.SPATH,
    };
    this.rentasService.delTickAdjunt(data2).subscribe(
      (res) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }

  setEditMode(doc: any) {
    this.getTypeFile();
    this.doc_registrados.forEach(d => d.isEditing = false);
    doc.isEditing = true;
    this.inputs.NTYPEATTACHMENT = {
      codigo: doc.NTYPEATTACHMENT,
      valor: this.opcionesTipoDocumento.find(opcion => opcion.codigo === doc.NTYPEATTACHMENT)?.valor
    };
  }

  editIndex: number | null = null;
  tipoDocumento: any[];
  opcionesTipoDocumento: any[];
  getTypeFile(){
    this.rentasService.getTypeFile().subscribe({
        next: (response) => {
          this.tipoDocumento = response.C_TABLE;
          console.log(this.tipoDocumento)
  
          this.opcionesTipoDocumento = this.tipoDocumento.map((estado) => {
            return {
              codigo: estado.NCODE,
              valor: estado.SDESCRIPT,
            };
          });
          console.log(this.opcionesTipoDocumento)
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  saveChanges(doc: any) {
    const data = {
        "P_NTICKET": this.NTICKET,
        "P_NID": doc.NID,
        "P_NTYPEATTACHMENT": this.inputs.NTYPEATTACHMENT.codigo,
    } 
    this.rentasService.getUpdNtypeActtachment(data).subscribe({
        next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
            this.separateString(response.P_SMESSAGE);
            Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
            });
  
            doc.NTYPEATTACHMENT = this.inputs.NTYPEATTACHMENT.codigo;
            doc.STYPEATTACHMENT = this.inputs.NTYPEATTACHMENT.valor;
  
        },
        error: (error) => {
            console.error(error);
        },
    })
    doc.isEditing = false;
  }
  
  cancelEdit(doc: any) {
    doc.isEditing = false;
    this.inputs.NTYPEATTACHMENT = null;
  }

  
  async uploadFile2(file: File, NTYPEATTACHMENT) {
    console.log(NTYPEATTACHMENT)
    const mensaje = await this.getMessage(22);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const filePath = file.name;
    const fileNameWithoutExtension = file.name.substring(
      0,
      file.name.lastIndexOf('.')
    );
    const extension = file.name.substring(file.name.lastIndexOf('.'));

    // Concatenar el sufijo "-ticket" antes de la extensión
    const fileNameWithSuffix = `${fileNameWithoutExtension}-${this.SCODE}${extension}`;
    const formData = new FormData();
    formData.append('file', file);
    this.rentasService.uploadFile(fileNameWithSuffix, formData).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          const data = {
            P_SCODE: this.SCODE,
            P_NTICKET: this.NTICKET,
            P_SNAME: fileNameWithSuffix,
            P_SSIZE: `${(file.size / 1024).toFixed(2)} KB`,
            P_SPATH: res.GenericResponse,
            P_NUSERCODE: this.NUSERCODE,
            P_NTYPEFILE: 1
          };
          const existingDoc = this.doc_registrados.find(
            (doc) => doc.SNAME === fileNameWithSuffix
          );

          existingDoc.SPATH = res.GenericResponse;

          this.rentasService.insTickAdjunt(data).subscribe(
            (res) => {
              console.log(res);
              existingDoc.NID = res.P_NID
              console.log(existingDoc)
              console.log(this.doc_registrados)
            },
            (err) => {
              Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
            }
          );
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        } else {
          Swal.fire('Información', res.Message, 'error');
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }
}
