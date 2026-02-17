import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-config-tasa',
  templateUrl: './config-tasa.component.html',
  styleUrls: ['./config-tasa.component.css'],
})
export class ConfigTasaComponent implements OnInit {
  reference: NgbModalRef;
  bsConfig: Partial<BsDatepickerConfig>;
  minDateIni;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']; // 20230325
  //profileId: number;
  userId: number;
  data: any = {};
  disableFlag: number = -1;
  percentageRateList: any[] = [];
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  //public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  listToShow: any;
  disableRate = true;

  constructor(
    private toastr: ToastrService,
    public parameterSettingsService: ParameterSettingsService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  async ngOnInit() {
    this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
    this.disableFlag = -1;
    this.getPercentageRateList();
  }

  save() {
    console.log(this.data.NPERCENTAGE);
    
    if(this.data.NPERCENTAGE == null || this.data.NPERCENTAGE == undefined || this.data.NPERCENTAGE == '' || this.data.NPERCENTAGE <= 0){
        Swal.fire('Información', 'Debe introducir un porcentaje válido','error');
        return;
    }

    Swal.fire({
        title: 'Información',
        text: '¿Desea guardar la configuración para el porcentaje de tasa?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        allowOutsideClick: false,
        cancelButtonText: 'No'
    }).then(result => {
        if (result.value) {
            let data: any = {
                NBRANCH : this.data.NBRANCH,
                NPRODUCT : this.data.NPRODUCT,
                NPERCENTAGE_RATE : this.data.NPERCENTAGE,
                NUSER_CODE: JSON.parse(localStorage.getItem('currentUser'))['id']
            };

            this.parameterSettingsService.insertPercentageRate(data).subscribe(
                res => {
                    if(res.code == 0){
                        this.getPercentageRateList();
                        this.disableFlag = -1;
                        this.disableRate = true;
                        Swal.fire('Información', 'Se actualizó el porcentaje de tasa correctamente.', 'info');
                    }else {
                        Swal.fire('Información', res.message, 'error');
                    }
                },
                err => {
                    Swal.fire('Error','Contactarse con el administrador','error');
                }
            )
        }
    })

  }

  enableAll() {
    this.disableFlag = 0;
    this.disableRate = false
    if (this.percentageRateList.length > 0) {
        let defaultValues = this.percentageRateList.find(f => f.ESTADO == 'ACTIVO')
        this.setDefaultValues(defaultValues)
    } else {
        this.data.INICIO_VIGENCIA = new Date();
    }
    this.data.COMENTARIO = '';
  }

  getPercentageRateList() {
    let data: any = {
        nBranch: this.data.NBRANCH,
        nProduct: this.data.NPRODUCT
    }
    this.parameterSettingsService.getPercentageRateList(data).subscribe(
      (res) => {
        this.percentageRateList = res;
        if (
          this.percentageRateList != null &&
          this.percentageRateList.length > 0
        ) {
          this.totalItems = this.percentageRateList.length;
          this.listToShow = this.percentageRateList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
          let defaultValues = this.percentageRateList.find(
            (f) => f.ESTADO == 'ACTIVO'
          );
          this.setDefaultValues(defaultValues);
        } else {
          this.totalItems = 0;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setDefaultValues(defaultValues: any) {
    this.data.NPERCENTAGE = defaultValues.NPERCENTAGE;
    this.data.INICIO_VIGENCIA = new Date();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow = this.percentageRateList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.percentageRateList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
