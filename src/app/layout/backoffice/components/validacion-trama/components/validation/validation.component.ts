import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from '@shared/services/utils/utils.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ValidacionTramaService } from '../../shared/services/validacion-trama.service';

import { Router } from '@angular/router';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';
import { HttpErrorResponse } from '@angular/common/http';
import { RegularExpressions } from '@shared/regexp/regexp';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss'],
})
export class ValidacionComponent implements OnInit {
  fecha: Date = new Date();
  bsValueIni: Date = new Date('2022-01-02');
  bsValueFin: Date = new Date();

  bsDatePickerConfig: Partial<BsDatepickerConfig> = {
    ...this.utilsService.datepickerConfig,
    minDate: this.bsValueIni,
    maxDate: this.bsValueFin,
  };

  arrayBuffer: any;
  file: File;

  formFilter: FormGroup = this._builder.group({
    validator: ['', Validators.pattern(RegularExpressions.numbers)],
    channelSale: [0],
    branch: [0],
    product: [0],
    structure: [''],
    startDate: [this.bsValueIni],
    endDate: [this.bsValueFin],
  });

  proceduresData$: any = null;
  entrydata$: Array<any>;
  proceduresDataC$: Array<any>;
  dataResumen$: Array<any>;
  tramaData$: Array<any>;

  channelSales$: Array<any> = [];
  branches$: Array<any> = [];
  products$: Array<any> = [];
  messageInfo$ = '';

  private selectedTab = 1; // CARGA: 1 - CONFIGURACION: 2
  private page = 1; // PAGINA ACTUAL
  private numberOfRecords = 10; // CANTIDAD DE REGISTROS

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  constructor(
    private readonly utilsService: UtilsService,
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly validationPlotService: ValidacionTramaService
  ) {}

  ngOnInit(): void {
    this.formFilterValueChanges();
    this.getChannelSales();
    this.getBranches();
  }

  get currentPage(): number {
    return this.page;
  }

  set currentPage(page) {
    this.page = page;
    this.search();
  }

  get currentTab(): number {
    return this.selectedTab;
  }

  set currentTab(value: number) {
    this.selectedTab = value;
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  /**
   * I'm trying to reset the values of the form controls to their default values.
   * </code>
   */
  resetFormFilters(): void {
    this.formFilterControl['validator'].setValue(null);
    this.formFilterControl['channelSale'].setValue(0);
    this.formFilterControl['branch'].setValue(0);
    this.formFilterControl['product'].setValue(0);
    this.formFilterControl['structure'].setValue(null);
    this.formFilterControl['startDate'].setValue(this.bsValueIni);
    this.formFilterControl['endDate'].setValue(this.bsValueFin);
    this.formFilter.enable();
    this.currentPage = 1;
    // this.filtrar();
  }

  formFilterValueChanges(): void {
    this.formFilterControl['validator'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          if (this.formFilterControl['validator'].hasError('pattern')) {
            this.formFilterControl['validator'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      }
    );
    this.formFilterControl['branch'].valueChanges.subscribe((value: string) => {
      this.formFilterControl['product'].setValue(0);
      this.products$ = [];
      if (value) {
        this.getProducts();
      }
    });
  }

  navigateToNewPlot() {
    this.router.navigate(['backoffice/tramas/nuevo']);
  }

  search(resetPage = false) {
    if (resetPage) {
      this.currentPage = 1;
      return;
    }

    this.proceduresData$ = null;
    this.spinner.show();

    const payload = {
      ...this.formFilter.getRawValue(),
      currentPage: this.currentPage,
      cantidadRegistros: this.numberOfRecords,
    };
    this.validationPlotService.listado(payload).subscribe(
      (response) => {
        this.proceduresData$ = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  getChannelSales(): void {
    this.utilsService.channelSales(+this.currentUser['id']).subscribe({
      next: (response: ChannelSalesModel) => {
        console.dir(response);
        this.channelSales$ = response.items;

        if (this.channelSales$.length == 1) {
          this.formFilterControl['channelSale'].setValue(
            this.channelSales$[0].id
          );
          this.formFilterControl['channelSale'].disable();
        }
        this.search();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getBranches(): void {
    this.formFilterControl['branch'].enable();
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.branches$ = response;

        if (this.branches$.length == 1) {
          this.formFilterControl['branch'].setValue(this.branches$[0].id);
          this.formFilterControl['branch'].disable();
          return;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getProducts(): void {
    this.spinner.show();
    const payload = {
      branchId: +this.formFilterControl['branch'].value,
      userType: +this.currentUser['tipoCanal'],
    };
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.spinner.hide();

        this.products$ = response;

        if (this.products$.length == 1) {
          this.formFilterControl['product'].setValue(this.products$[0].id);
          this.formFilterControl['product'].disable();
          return;
        }
        this.formFilterControl['product'].enable();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.formFilterControl['product'].enable();
      },
    });
  }

  /**
   * It downloads a file from the server and then it downloads it to the client.
   * </code>
   * @param id - number;
   * @param {number} type - number = 1;
   */
  downloadFile(id, type: number) {
    this.spinner.show();
    const payload = {
      idCarga: id,
      tipoArchivo: type,
    };
    this.messageInfo$ = null;
    this.validationPlotService.downloadExcel(payload).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.messageInfo$ =
            'Ocurrió un problema al intentar descargar el archivo, inténtelo más tarde.';
          return;
        }

        this.utilsService.downloadFile({
          fileName: response.nombreArchivo,
          fileBase64: response.archivo,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  closeModals(): void {
    this._vc.clear();
    this.messageInfo$ = null;
  }

  /**
   * "If the user clicks on the button, the sessionStorage is cleared and the user is redirected to the
   * pageTrayConfigurationPlot() function."
   * </code>
   */
  pageTrayConfigurationPlot(): void {
    sessionStorage.removeItem('data-trama');
    this.router.navigate(['/backoffice/tramas/bandeja']);
  }
}
