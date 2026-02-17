import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreliminaryReportService } from '../../../services/report/preliminary-report.service';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-request-preliminary-monitoreo',
  templateUrl: './request-preliminary-monitoreo.component.html',
  styleUrls: ['./request-preliminary-monitoreo.component.css']
})

export class RequestPreliminaryMonitoreoComponent implements OnInit {

    isLoading: boolean = false;
    isValidatedInClickButton: boolean = false;
    filterForm: FormGroup;
    productBool: boolean = false;
    submitted: boolean = false;

    branchTypeList: any[] = [];
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date(new Date().setDate(ModuleConfig.StartDate.getDate() - 15));
    bsValueFin: Date = ModuleConfig.EndDate;
    preliminaryResults: any[] = [];
    nType_Preliminary: number = 1;

    listToShow: any = [];
    currentPage = 1;
    rotate = true;
    maxSize = 10;
    itemsPerPage = 6;
    totalItems: any = [];
    products: any = [];

    constructor(
        private formBuilder: FormBuilder,
        private preliminaryService: PreliminaryReportService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        )
    }

    ngOnInit(): void {
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate());
        this.bsValueFin = new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate());
        this.createForm();
        this.initializeForm();
        this.getBranchTypesList()
        this.getProducts();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            productN: [''],
            startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
        });
    }

    private initializeForm(): void {
        this.filterForm.controls.branch.setValue('0');
        this.filterForm.controls.productN.setValue('');
        this.filterForm.controls.startDate.setValue(this.bsValueIni);
        this.filterForm.controls.endDate.setValue(this.bsValueFin);
        this.filterForm.setValidators([GlobalValidators.dateSort]);
    }

    getProducts = () => {
        this.preliminaryService.listarProductosVILP().subscribe(
            res => {
                this.products = res.Result.LISTA;
            }
        )
    }
         
    onSelectedBranch(e) {
        this.filterForm.controls.productN.setValue('');
        if (Number(e) == 71) {
            this.productBool = true;
            this.filterForm.controls.productN.setValidators(Validators.required);
            this.filterForm.controls.productN.updateValueAndValidity();
        } else {
            this.productBool = false;
            this.filterForm.controls.productN.clearValidators();
            this.filterForm.controls.productN.updateValueAndValidity();
        }
    }

    private getBranchTypesList() {
        this.preliminaryService.getBranchTypesList().subscribe(
            res => {
                this.branchTypeList = res;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al traer los ramos.', 'error');
            }
        )
    }
    
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.preliminaryResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    generateFindMonitor() {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.isLoading = true;
            this.isValidatedInClickButton = true;
            if (this.filterForm.invalid) {
                this.isLoading = false;  
                return;
            } else {
                this.listToShow = [];
                this.preliminaryResults = [];      
                this.currentPage = 1;
                this.rotate = true;
                this.maxSize = 5;
                this.itemsPerPage = 6;
                this.totalItems = 0;
                const data = {
                    branchId: this.filterForm.value.branch,
                    productN: this.filterForm.value.productN,
                    startDate: this.filterForm.value.startDate,
                    endDate: this.filterForm.value.endDate,
                    ReportId: this.nType_Preliminary
                };
                this.preliminaryService.postGenerateMonitorProcess(data).subscribe(
                    res => { 
                        this.preliminaryResults = res; 
                        this.totalItems = this.preliminaryResults.length;
                        this.listToShow = this.preliminaryResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                        this.isLoading = false;
                    },
                    err => { 
                        this.isLoading = false;
                    }
                );
            }
        }
    }
   
    getFilePreliminaryReport(IDMONITOR: any) {
        if (IDMONITOR != null && IDMONITOR != 0) {
            this.isLoading = true;
            this.preliminaryService.GetFilePreliminaryReport(IDMONITOR.trim()).subscribe(
                res => {         
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], IDMONITOR.toUpperCase() + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);  
                        }                                    
                    } else {
                        Swal.fire({
                            title: 'Información',
                            text: 'El reporte no se encuentra disponible en este momento.',
                            icon: 'warning',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                    this.isLoading = false;
                },
                err => {
                    this.isLoading = false;        
                }
            );
        }
    }

    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);            
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    
    cleanValidation() { }
}
