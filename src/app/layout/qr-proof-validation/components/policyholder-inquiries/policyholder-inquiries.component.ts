import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonMethods } from '../../../broker/components/common-methods';
import { GlobalValidators } from '../../../broker/components/global-validators';
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { UtilsService } from '../../../../shared/services/utils/utils.service';
import { QrProofService } from '../../../broker/services/qr-proof/qr-proof.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-policyholder-inquiries',
  templateUrl: './policyholder-inquiries.component.html',
  styleUrls: ['./policyholder-inquiries.component.css', './policyholder-inquiries-theme.component.css']
})
export class PolicyholderInquiriesComponent implements OnInit {

  mainFormGroup: FormGroup;
  isLoading: boolean = false
  documentMinLength = 0;
  documentMaxLength = 0;
  codProducto = '13';
  documentTypeList: any[];  //Lista de tipos de documento
  validateButton: boolean = true;
  inputMode: any;

  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  listToShow: any
  nrodocumento: any
  nroconstancia: any

  decryptdata = JSON.parse(localStorage.getItem('data'))
  data:any = {}

  constructor(
    private mainFormBuilder: FormBuilder,
    private clientInformationService: ClientInformationService,
    private utilservice: UtilsService,
    private qrproofservice : QrProofService,
    private spinner: NgxSpinnerService,
    private router : Router
  ) { }

  ngOnInit(): void {
    if (this.decryptdata) {
        Object.keys(this.decryptdata).forEach((key) => {
            this.data[key] = this.utilservice.decryptData(this.decryptdata[key])
        });

        this.nroconstancia = this.data.NumProof
        this.createForm()
        window.onload = () => {
            const element = document.querySelectorAll('.pull-right .btn.btn-circle.btn-xl')
            if (element) {
                element.forEach((e) => {
                    (e as HTMLElement).style.display = 'none';
                });
            }
        }
    } else {
        this.router.navigate(['/portal-consulta'])
    }

    this.getDocumentTypeList();
  }

  back(){
    this.router.navigate(['/portal-consulta'])
  }

  documentNumberChange () {
    if (this.nrodocumento == '' || this.nrodocumento == undefined) {
        this.validateButton = true
    } else {
        this.validateButton = false
    }
  }

  /**
   * Previene ingreso de datos en el campo [número de documento] según el tipo de documento
   * @param event Evento activador, este objeto contiene el valor ingresado
   * @param documentType Tipo de documento seleccionado
   */
  documentNumberKeyPress(event: any, documentType: string) {
    if (documentType == '') {
        return;
    }

    CommonMethods.validarNroDocumento(event, documentType)
  }

  documentTypeChanged() {
    //this.validateButton = true
    switch (this.mainFormGroup.controls.documentType.value) {
        case '2': { //dni
          this.documentMinLength = 7;
          this.documentMaxLength = 8;
          this.inputMode = 'numeric';
          this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator]);
          this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
          break;
        }
        case '4': { //ce
          this.documentMinLength = 6;
          this.documentMaxLength = 12;
          this.inputMode = 'text';
          this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(6), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
          this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
          break;
        }
        case '6': { //pasaporte
          this.documentMinLength = 6
          this.documentMaxLength = 12;
          this.inputMode = 'text';
          this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(6), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
          this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
          break;
        }
        case '14': { //salvoconducto
          this.documentMinLength = 6
          this.documentMaxLength = 12;
          this.inputMode = 'text';
          this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(6), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
          this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
        }
        default: {  //otros tipos de documento
          this.documentMaxLength = 15;
          this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(15)]);
          this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
          break;
        }
      }
      this.cleanInputs();
  }

  /**
   * Limpia campos de contratante
   */
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue('');
  }

  /**
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      
      documentType: [''],  //Tipo de documento 
      documentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  //Número de documento
      });
  }

  /**
   * Lista tipos de documento
   */
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
      }
    );
  }

   /**
   * Realiza la búsqueda accionada por el cambio de página en el paginador
   * @param page número de página seleccionado en el paginador
   */
   pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  limpiar(){
    this.mainFormGroup.controls.documentType.setValue('')
    this.documentMinLength = 0;
    this.documentMaxLength = 0;
    this.nrodocumento = ''
    this.listToShow = []
    this.foundResults = []
  }

  async consultar() {

    this.isLoading = true;
    this.data.NumDocAseg = this.nrodocumento
    this.data.NumDocType = this.mainFormGroup.get('documentType').value

    await this.qrproofservice.getProof(this.data)
        .toPromise()
        .then(
            res => {
                if (res.Lista && res.Lista.length > 0) {
                    this.listToShow = res.Lista;
                    this.foundResults = this.listToShow;
                    this.totalItems = this.foundResults.length;
                    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                    this.isLoading = false;
                } else if (res.Estado == 4) {
                    this.listToShow = []
                    this.foundResults = []
                    this.isLoading = false;
                    swal.fire({
                        title : 'Información',
                        icon: 'error',
                        text : 'El asegurado se encuentra excluido de la Constancia N° ' + this.nroconstancia,
                        confirmButtonText: 'Entendido',
                        allowOutsideClick: false,
                    });
                } else {
                    this.listToShow = []
                    this.foundResults = []
                    this.isLoading = false;
                    swal.fire({
                        title : 'Información',
                        icon: 'error',
                        text : 'No se encontraron registros para la búsqueda realizada',
                        confirmButtonText: 'Entendido',
                        allowOutsideClick: false,
                    });
                }
            },
            error => {
                this.listToShow = []
                this.foundResults = []
                this.isLoading = false;
                swal.fire('Información', error, 'error');
            }
        );
  }

}
