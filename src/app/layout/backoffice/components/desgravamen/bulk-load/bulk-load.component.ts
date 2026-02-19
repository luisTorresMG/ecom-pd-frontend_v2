import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import moment from 'moment';

import { fadeAnimation } from '@shared/animations/animations';
import { BulkLoadService } from '../shared/services/bulk-load/bulk-load.service';

import { datePickerConfig } from '@shared/config/config';
import { RegularExpressions } from '@shared/regexp/regexp';

@Component({
  selector: 'app-bulk-load',
  templateUrl: './bulk-load.component.html',
  styleUrls: ['./bulk-load.component.sass'],
  providers: [BulkLoadService],
  animations: [fadeAnimation]
})
export class BulkLoadComponent implements OnInit {
  startDateConfig = {
    ...datePickerConfig,
    maxDate: new Date(),
  };
  endDateConfig = {
    ...datePickerConfig,
    maxDate: new Date(),
  };

  controlSearch!: FormControl;
 
  formFilters!: FormGroup;


  showAdvancedFilters: boolean = true;
  showBillingFilters: boolean = false;
  showButtonBillingFilter: boolean = true;
  billingFiltersForm!: FormGroup;
 
  listStates$: {
    id: string,
    estado: string
  }[] = [];
  listProcesses$: Array<any> = [];
  listFilteredProcesses$: Array<any> = [];
  listCheckedProcesses: any[] = [];
  processSelected: Partial<{
    processType: 1 | 2, // 1: emitir y generar recibos, 2: emitir generar recibos y facturar
    process: any
  }> = {};

  processDetail$: any = {};

  salesChannel$: Array<any> = [];
  products$: Array<any> = [];
  contractors$: Array<any> = [];
  policies$: Array<any> = [];
  transactions$: Array<any> = [];
  payPeriods$: Array<any> = [];

  currentPage: number = 1;
  currentPageBiller: number = 1;

  responseInfo: Partial<{
    success: boolean,
    message: string,
    showImage: boolean,
    reloadData: boolean
  }> = {};

  @ViewChild('modalAdvancedFilters', { static: true, read: TemplateRef })
  modalAdvancedFilters: TemplateRef<ElementRef>;

  @ViewChild('modalDropFile', { static: true, read: TemplateRef })
  modalDropFile: TemplateRef<ElementRef>;

  @ViewChild('modalViewLoad', { static: true, read: TemplateRef })
  modalViewLoad: TemplateRef<ElementRef>;

  @ViewChild('modalBiller', { static: true, read: TemplateRef })
  modalBiller: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmEmitProcess', { static: true, read: TemplateRef })
  modalConfirmEmitProcess: TemplateRef<ElementRef>;

  @ViewChild('modalResponse', { static: true, read: TemplateRef })
  modalResponse: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly spinner: NgxSpinnerService,
    private readonly bulkLoadService: BulkLoadService
  ) {
    this.controlSearch = this.builder.control('');
    this.formFilters = this.builder.group({
      salesChannel: [''],
      processId: ['', Validators.pattern(RegularExpressions.numbers)],
      product: [''],
      contractor: [''],
      state: [''],
      policy: [''],
      transaction: [''],
      paymentPeriod: [''],
      startDate: [null],
      endDate: [null],
    });
    this.billingFiltersForm = this.builder.group({
      state: [''],
      period: [''],
      policy: ['']
    });

  }

  ngOnInit(): void {
    this.formValueChanges();
    this.getStates();

    const params = this.route.snapshot.queryParams;

    if (params['processId'] && params['phase']) {
      switch (params['type']) {
        case 'reprocess':
          this.downloadReprocessFile(params['processId'], params['phase']);
          break;
        case 'csv':
          this.downloadCSVFile(params['processId'], params['phase']);
          break;
      }
    }

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviemre',
      'Diciembre',
    ];

    months.map((label: string, index) => {
      this.payPeriods$.push({
        value: index + 1,
        label: label,
      });
    });

    this.controlSearch.valueChanges.subscribe(() => this.filterProcesses());
  }

  resetFormBillingFilters(): void {
    const initValues = {
      state: '',
      period: '',
      policy: ''
    };
    this.billingFiltersForm.patchValue(initValues);
  }

  set showHideBillingFilters(show: boolean) {
    this.showAdvancedFilters = !show;

    if (!show) {
      this.resetFormBillingFilters();
    }

    if (show) {
      this.resetFormFilters();
    }

    this.showBillingFilters = show;
    this.filterProcesses();
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  get checkedProcessesLength(): number {
    return this.listFilteredProcesses$.filter(x => x.checked).length;
  }

  formValueChanges(): void {
    this.formFilterControl['processId'].valueChanges.subscribe(
      (value: string) => {
        if (this.formFilterControl['processId'].hasError('pattern')) {
          this.formFilterControl['processId'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.billingFiltersForm.valueChanges.subscribe((_): void => {
      this.filterProcesses();
    });
  }

  resetFormFilters(): void {
    const values = {
      salesChannel: '',
      processId: '',
      product: '',
      contractor: '',
      policy: '',
      transaction: '',
      paymentPeriod: '',
      startDate: null,
      endDate: null,
      state: ''
    };
    this.formFilters.patchValue(values, {
      emitEvent: false,
    });
    this.showButtonBillingFilter = true;
    this.closeModal();
    this.filterProcesses();
  }

  getStates(): void {
    this.spinner.show();
    this.bulkLoadService.getStates().subscribe({
      next: (response: any[]): void => {
        console.log(response);
        this.listStates$ = response;
        this.listProcesses();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
        this.listProcesses();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  listProcesses(): void {
    this.currentPage = 1;
    this.spinner.show();
    this.bulkLoadService.listProcesses().subscribe({
      next: (response: Array<any>): void => {
        const billingTypeDescription = {
          1: 'Por póliza',
          2: 'Por certificado'
        };
        this.listProcesses$ = this.listFilteredProcesses$ = response.map((obj: any) => ({
          ...obj,
          checked: false,
          stateDescription: this.listStates$.find((state: any): boolean => state.id == obj.estado)?.estado,
          billingTypeDescription: billingTypeDescription[+obj.tipoFacturacion]
        }));

        this.salesChannel$ = response.map((obj) => obj.canalVenta);
        this.products$ = response.map((obj) => obj.producto);
        this.contractors$ = response.map((obj) => obj.contratante);
        this.policies$ = response.map((obj) => obj.numeroPoliza);
        this.transactions$ = response.map((obj) => obj.transaccion);

        /* Removing duplicates from the array. */
        this.salesChannel$ = Array.from(new Set(this.salesChannel$)).map(
          (value) => ({
            id: value,
            label: value,
          })
        );
        this.products$ = Array.from(new Set(this.products$)).map((value) => ({
          id: value,
          label: value,
        }));
        this.contractors$ = Array.from(new Set(this.contractors$)).map(
          (value) => ({
            id: value,
            label: value,
          })
        );
        this.policies$ = Array.from(new Set(this.policies$)).map((value) => ({
          id: value,
          label: value,
        }));
        this.transactions$ = Array.from(new Set(this.transactions$)).map(
          (value) => ({
            id: value,
            label: value,
          })
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  checkAllProcesses(checked: boolean): void {
    this.listFilteredProcesses$ = this.listFilteredProcesses$.map((obj: any) => ({
      ...obj,
      checked: checked && (obj.estado == 5 || obj.estado == 18)
    }));
    this.listProcesses$ = this.listProcesses$.map((obj: any) => ({
      ...obj,
      checked: !!this.listFilteredProcesses$.find(x => x.idProceso == obj.idProceso)?.checked
    }));

    this.filterProcesses();
  }

  checkProcess(item: any): void {
    item.checked = !item.checked;
    this.listProcesses$.find(x => x.idProceso == item.idProceso).checked = item.checked;
    this.filterProcesses();
  }

  get isAllItemsChecked(): boolean {
    return this.listFilteredProcesses$.filter(x => x.estado == 5 || x.estado == 18).every(x => x.checked);
  }

  getProcessDetail(processId): void {
    this.spinner.show();

    const payload = {
      idProceso: processId,
    };

    this.bulkLoadService.getSummary(payload).subscribe({
      next: (response: any) => {
        this.processDetail$ = {
          phase1: response.verErrores?.find((x) => x.fase == 1) ?? {},
          phase2: response.verErrores?.find((x) => x.fase == 2) ?? {},
          phase3: response.verErrores?.find((x) => x.fase == 3) ?? {},
          phase4: response.verErrores?.find((x) => x.fase == 4) ?? {},
        };
        this.showModalViewLoad();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide(),
    });
  }

  showModalAdvancedFilters(): void {
    this.vc.createEmbeddedView(this.modalAdvancedFilters);
  }

  showModalDropFile(): void {
    this.vc.createEmbeddedView(this.modalDropFile);
  }

  showModalViewLoad(): void {
    this.vc.createEmbeddedView(this.modalViewLoad);
  }

  submitFilters(): void {
    this.showButtonBillingFilter = false;
    this.resetFormBillingFilters();
    this.filterProcesses();
    this.closeModal();
  }

  private filterProcesses(): void {
    const _ = {
      ...this.formFilters.getRawValue(),
      billingFilters: {
        ...this.billingFiltersForm.getRawValue()
      },
      search: this.controlSearch.value,
    };

    const parseString = (value): string => value.toLowerCase();

    const includeString = (value, compare): boolean =>
      parseString(compare).slice(0, value.length) == parseString(value);

    this.listFilteredProcesses$ = this.listProcesses$.filter(
      (x) =>
        ((_.search
            ? includeString(_.search, x.canalVenta) ||
            includeString(_.search, x.contratante) ||
            includeString(_.search, x.producto) ||
            includeString(_.search, x.transaccion) ||
            includeString(_.search, x.numeroPoliza) ||
            includeString(_.search, x.idProceso)
            : true) &&
          (_.salesChannel ? _.salesChannel == x.canalVenta : true) &&
          (_.contractor ? _.contractor == x.contratante : true) &&
          (_.policy ? _.policy == x.numeroPoliza : true) &&
          (_.processId ? _.processId == x.idProceso : true) &&
          (_.product ? _.product == x.producto : true) &&
          (_.transaction ? _.transaction == x.transaccion : true) &&
          (_.paymentPeriod
            ? _.paymentPeriod == +x.periodoDeclaracion.split('-')[0]
            : true) &&
          (_.startDate ? moment(_.startDate) <= moment(x.fechaCreacion) : true) &&
          (_.endDate ? moment(_.endDate) >= moment(x.fechaCreacion) : true) &&
          (_.state ? _.state.split('(d)').includes(x.stateDescription) : true) &&
          // tslint:disable-next-line:max-line-length
          (this.showBillingFilters ? _.billingFilters.state ? _.billingFilters.state == x.estado : x.estado == 18 || x.estado == 5 : true) &&
          // tslint:disable-next-line:max-line-length
          (this.showBillingFilters ? _.billingFilters.period ? _.billingFilters.period == +x.periodoDeclaracion.split('-')[0] : true : true) &&
          (this.showBillingFilters ? _.billingFilters.policy ? _.billingFilters.policy.includes(x.numeroPoliza) : true : true)) ||
        x.checked
    );

    if (this.checkedProcessesLength) {
      const firstChecked = this.listFilteredProcesses$.find(x => x.checked);

      this.listFilteredProcesses$ = this.listFilteredProcesses$
        .filter((process: any): boolean =>
          firstChecked.numeroPoliza == process.numeroPoliza &&
          firstChecked.periodoDeclaracion == process.periodoDeclaracion &&
          (process.estado == 5 || process.estado == 18));
    }
  }

  closeModal(): void {
    this.vc.clear();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  showCloseModalBiller(show: boolean): void {
    this.currentPageBiller = 1;

    if (show) {
      this.listCheckedProcesses = this.listFilteredProcesses$.filter((obj) => obj.checked);
      this.vc.createEmbeddedView(this.modalBiller);
      return;
    }

    this.vc.clear();
    this.listCheckedProcesses = [];
  }

  showModalConfirmEmitProcess(process: any, processType: 1 | 2): void {
    this.processSelected = {
      processType,
      process
    };

    this.vc.createEmbeddedView(this.modalConfirmEmitProcess);
  }

  emitProcess(): void {
    this.spinner.show();

    const payload = {
      numeroPoliza: this.processSelected.process.numeroPoliza,
      idProceso: this.processSelected.process.idProceso,
      migracion: this.processSelected.processType <= 2,
      facturacion: this.processSelected.processType == 2
    };
    this.bulkLoadService.emitProcess(payload).subscribe({
      next: (response): void => {
        console.log(response);

        this.responseInfo = {
          reloadData: response.success,
          success: response.success,
          showImage: true,
          message: ''
        };

        if (response.success) {
          this.responseInfo.message = 'El proceso se terminó correctamente';
        }

        if (!response.success) {
          this.responseInfo.message = 'Ocurrió un problema con el proceso';
        }

        this.showModalResponse();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.responseInfo = {
          reloadData: false,
          success: false,
          showImage: true,
          message: 'Tenemos problemas con el proceso, inténtelo más tarde'
        };
        this.showModalResponse();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  billingProcess(): void {
    this.spinner.show();

    const firstProcess = this.listCheckedProcesses[0];

    const payload = {
      numeroPoliza: firstProcess.numeroPoliza,
      idProceso: this.listCheckedProcesses.map((obj: any) => obj.idProceso),
      facturacion: true,
      periodoDeclaracion: firstProcess.periodoDeclaracion
    };

    this.bulkLoadService.billingProcess(payload).subscribe({
      next: (response: any): void => {
        console.log(response);

        if (response.success) {
          this.responseInfo = {
            success: response.success,
            reloadData: true,
            message: 'Los procesos seleccionados se enviaron a facturar correctamente',
            showImage: true,
          };
        }

        if (!response.success) {
          this.responseInfo = {
            success: response.success,
            reloadData: false,
            message: 'Ocurrió un error al enviar a facturar los procesos seleccionados',
            showImage: true,
          };
        }

        this.showModalResponse();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.responseInfo = {
          success: false,
          reloadData: false,
          message: 'Tenemos problemas para enviar a facturar los procesos seleccionados',
          showImage: true,
        };
        this.showModalResponse();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  showModalResponse(): void {
    this.vc.clear();
    this.vc.createEmbeddedView(this.modalResponse);
  }

  closeModalResponse(): void {
    this.closeModal();

    if (this.responseInfo.reloadData) {
      this.listProcesses();
    }
  }

  downloadReprocessFile(idProceso: number, fase: number): void {
    this.bulkLoadService.downloadReprocessFile({idProceso, fase}).subscribe({
      next: (response): void => {
        console.dir(response);

        if (response.link === '0') {
          return;
        }

        window.open(response.link);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      }
    });
  }

  downloadCSVFile(idProceso: number, fase: 1 | 2 | 3): void {
    this.bulkLoadService.getUrlErrorsByPhase({idProceso, fase}).subscribe({
      next: (response: string): void => {
        if (!response) {
          return;
        }

        window.open(response);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      }
    });
  }
}
