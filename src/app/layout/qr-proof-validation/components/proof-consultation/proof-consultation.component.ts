import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalValidators } from '../../../broker/components/global-validators';
import { CommonMethods } from '../../../broker/components/common-methods';
import { QrProofService } from '../../../broker/services/qr-proof/qr-proof.service';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { UtilsService } from '../../../../shared/services/utils/utils.service';

@Component({
  standalone: false,
  selector: 'app-proof-consultation',
  templateUrl: './proof-consultation.component.html',
  styleUrls: ['./proof-consultation.component.css', './proof-consultation-theme.component.css']
})
export class ProofConsultationComponent implements OnInit {
  
  mainFormGroup: FormGroup;
  isLoading: boolean = false
  nrodocumento: any
  nropoliza: any
  nroconstancia: any;
  validateButtonDocument: boolean = true;
  validateButtonPolicy: boolean = true;
  validateButtonProof: boolean = true;

  nrodocumentoMaxLength = 0
  nropolizaMaxLength = 0
  nroconstanciaMaxLength = 0

  constructor(
    private mainFormBuilder: FormBuilder,
    private qrproofservice : QrProofService,
    private router : Router,
    private utilservice: UtilsService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.createForm();
    window.onload = () => {
        const element = document.querySelectorAll('.pull-right .btn.btn-circle.btn-xl')
        if (element) {
            element.forEach((e) => {
                (e as HTMLElement).style.display = 'none';
            });
        }
    }
  }

  /**
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
        nrodocument: [''], 
        nropolicy: [''],  
        nroproof : ['']
    });

    this.mainFormGroup.controls.nrodocument.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator])
    this.mainFormGroup.controls.nrodocument.updateValueAndValidity()
    this.nrodocumentoMaxLength = 11
    
    this.mainFormGroup.controls.nropolicy.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), GlobalValidators.onlyNumberValidator])
    this.mainFormGroup.controls.nropolicy.updateValueAndValidity()
    this.nropolizaMaxLength = 10
    
    this.mainFormGroup.controls.nroproof.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(10), GlobalValidators.onlyNumberValidator])
    this.mainFormGroup.controls.nroproof.updateValueAndValidity()
    this.nroconstanciaMaxLength = 10

  }

  textValidate(event: any, tipoTexto) {
    CommonMethods.textValidate(event, tipoTexto);
  }

  async getProof(){
    
    this.isLoading = true;
    const data: any = {};
    const encryptdata: any = {};

    data.NumDocContrat = this.nrodocumento
    data.NumPolicy = this.nropoliza
    data.NumProof = this.nroconstancia
    data.Branch = 77


    await this.qrproofservice.getProof(data)
        .toPromise()
        .then(
            res => {
                if (res.Estado == 1) {
                    if (res.Lista && res.Lista.length > 0) {
                        this.isLoading = false;
                        swal.fire({
                            title : 'Información',
                            icon: 'success',
                            text : 'La constancia N° ' + res.Lista[0].NroProof + 
                                ' es válida y se encuentra asociada al contratante "' + res.Lista[0].DesContrac +
                                '" en la póliza N° ' + res.Lista[0].NroPolicy + 
                                ', con vigencia del ' + res.Lista[0].StartDate + ' al ' + res.Lista[0].EndDate,
                            confirmButtonText: 'Entendido',
                            allowOutsideClick: false,
                        }).then((ok) => {
                            if (ok.isConfirmed) {
                                swal.fire({
                                    title : 'Información',
                                    icon : 'info',
                                    text : '¿Desea consultar los asegurados registrados en la constancia?',
                                    showCancelButton : true,
                                    confirmButtonText : 'Si',
                                    cancelButtonText : 'No' 
                                }).then((r) => {
                                    if (r.isConfirmed) {
                                        Object.keys(data).forEach((key) => {
                                            encryptdata[key] = this.utilservice.encryptData(data[key].toString());
                                        });

                                        localStorage.setItem('data', JSON.stringify(encryptdata));
                                        this.router.navigate(['/portal-consulta/consulta-asegurados'])
                                    }
                                });
                            }
                        });
                    } else {
                        this.isLoading = false;
                        swal.fire({
                            title : 'Información',
                            icon: 'error',
                            text : 'No se encontraron registros para la búsqueda realizada',
                            confirmButtonText: 'Entendido',
                            allowOutsideClick: false,
                        });
                    }

                } else if (res.Estado == 2) {
                    this.isLoading = false;
                    swal.fire({
                        title : 'Información',
                        icon: 'error',
                        text : 'Por favor, verifique la informacion ingresada',
                        confirmButtonText: 'Entendido',
                        allowOutsideClick: false,
                    });
                } else if (res.Estado == 3) {
                    this.isLoading = false;
                    swal.fire({
                        title : 'Información',
                        icon: 'error',
                        text : 'Por favor, verifique el Nro de constancia ingresada',
                        confirmButtonText: 'Entendido',
                        allowOutsideClick: false,
                    });
                }
            },
            error => {
                this.isLoading = false;
                swal.fire('Información', error, 'error');
            }
        );
  }

}
