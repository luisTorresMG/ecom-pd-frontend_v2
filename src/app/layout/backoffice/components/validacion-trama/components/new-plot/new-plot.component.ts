import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { UtilsService } from '@shared/services/utils/utils.service';
import { ValidacionTramaService } from '../../shared/services/validacion-trama.service';
import { NewPlotService } from '../../shared/services/new-plot.service';

import { RegularExpressions } from '@shared/regexp/regexp';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { fadeAnimation } from '@shared/animations/animations';
import moment from 'moment';

@Component({
  selector: 'app-new-plot',
  templateUrl: './new-plot.component.html',
  styleUrls: ['./new-plot.component.sass'],
  animations: [fadeAnimation],
})
export class NewPlotComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig> = {
    ...this.utilsService.datepickerConfig,
    minDate: new Date('2022-01-02'),
    maxDate: new Date(),
  };

  form: FormGroup = this.builder.group({
    channelSale: ['', Validators.required],
    branch: [0],
    product: [0],
    structureType: ['', Validators.required],
    emailChannel: ['', Validators.pattern(RegularExpressions.email)],
    arguments: this.builder.array([]),
  });

  attachedFile: File;

  channelSales$: Array<any> = [];
  branches$: Array<any> = [];
  products$: Array<any> = [];
  structureTypes$: Array<any> = [];
  arguments$: Array<any> = [];
  responsePlot$: any = null;
  currentPageError = 1;

  @ViewChild('modalSubmit', { static: true, read: TemplateRef })
  modalSubmit: TemplateRef<ElementRef>;

  constructor(
    private readonly router: Router,
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly vc: ViewContainerRef,
    private readonly utilsService: UtilsService,
    private readonly validacionTramaService: ValidacionTramaService,
    private readonly newPlotService: NewPlotService
  ) {}

  ngOnInit(): void {
    this.formValueChanges();
    this.getChannelSales();
    this.getBranches();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get argumentsList(): FormArray {
    return this.formControl['arguments'] as FormArray;
  }

  set changeCurrentPageError(page: number) {
    this.currentPageError = page;
  }

  formValueChanges(): void {
    this.formControl['branch'].valueChanges.subscribe((value: string) => {
      this.formControl['product'].setValue(0);
      this.formControl['structureType'].setValue(null);
      this.products$ = [];
      this.structureTypes$ = [];
      if (value) {
        this.getProducts();
      } else {
        this.getStructureTypes();
      }
    });

    this.formControl['product'].valueChanges.subscribe(() => {
      this.formControl['structureType'].setValue(null);
      this.structureTypes$ = [];
      if (this.formControl['branch'].value) {
        this.getStructureTypes();
      }
    });

    this.formControl['structureType'].valueChanges.subscribe(
      (value: string) => {
        this.getArguments(+value);
      }
    );
  }

  resetForm(): void {
    this.attachedFile = null;
    this.form.reset({
      emitEvent: false,
    });
    this.formControl['channelSale'].setValue('');
    this.formControl['branch'].setValue(0, {
      emitEvent: false,
    });
    this.formControl['product'].setValue(0, {
      emitEvent: false,
    });
    this.products$ = [];
    this.setValueChannelSales();
    this.setValueBranch();
    this.setValueProduct();
  }

  uploadFile(file: any = {}): void {
    if (file.target.files) {
      this.attachedFile = file.target.files[0] as File;
      return;
    }
  }

  getChannelSales(): void {
    this.utilsService.channelSales(+this.currentUser['id']).subscribe({
      next: (response: ChannelSalesModel) => {
        console.dir(response);
        this.channelSales$ = response.items;
        this.setValueChannelSales();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  setValueChannelSales(): void {
    if (this.channelSales$.length == 1) {
      this.formControl['channelSale'].setValue(this.channelSales$[0].id);
      this.formControl['channelSale'].disable();
    }
  }

  getBranches(): void {
    this.formControl['branch'].enable();
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        console.dir(response);
        this.branches$ = response;
        this.setValueBranch();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  setValueBranch(): void {
    if (this.branches$.length == 1) {
      this.formControl['branch'].setValue(this.branches$[0].id);
      this.formControl['branch'].disable();
    }
  }

  getProducts(): void {
    this.spinner.show();
    this.formControl['product'].enable();
    const payload = {
      branchId: +this.formControl['branch'].value,
      userType: +this.currentUser['tipoCanal'],
    };
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.spinner.hide();

        this.products$ = response;

        this.setValueProduct();
        this.getStructureTypes();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  setValueProduct(): void {
    if (this.products$.length == 1) {
      this.formControl['product'].setValue(this.products$[0].id);
      this.formControl['product'].disable();
    }
  }

  getStructureTypes(): void {
    this.spinner.show();
    const payload = {
      ramo: +this.formControl['branch'].value || 0,
      producto: +this.formControl['product'].value || 0,
    };
    this.validacionTramaService.getStructureTypes(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.spinner.hide();
        this.structureTypes$ = response.listaEstructura;
        this.arguments$ = response.listaArgumentos;
        if (this.structureTypes$.length == 1) {
          this.formControl['structureType'].setValue(
            this.arguments$[0].idEstructura
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getArguments(value: number): void {
    this.argumentsList.reset();
    this.argumentsList.clear();
    this.arguments$
      ?.filter((x) => +x.idEstructura == value)
      ?.forEach((values: any) => {
        const formGroup = this.builder.group({
          idArgument: [values.idArgumento, Validators.required],
          argumentName: [values.argumento, Validators.required],
          structureId: [values.idEstructura, Validators.required],
          dataType: [values.tipoDato, Validators.required],
          dataTypeId: [values.idTipoDato, Validators.required],
          defaultValue: [values.valorPorDefecto || null, Validators.required],
        });
        this.argumentsList.push(formGroup);
      });
  }

  validateFile(): void {
    if (this.form.invalid) {
      return;
    }

    this.spinner.show();

    const transformDate = (value: string, type: string) => {
      const dateTypes = ['3'];
      let nextValue = value;
      if (dateTypes.includes(type)) {
        nextValue = moment(value).format('DD/MM/YYYY');
      }
      return nextValue;
    };

    const args: any = this.argumentsList.getRawValue()?.map((values: any) => ({
      idArgumentoGeneral: values.idArgument,
      argumentoGeneral: `ARG['${values.argumentName}']`,
      idEstructura: values.structureId,
      idTipoDato: values.dataTypeId,
      valorPorDefecto: transformDate(values.defaultValue, values.dataTypeId),
    }));

    const data = {
      argumentos: args,
    };
    const payload = {
      attachedFile: this.attachedFile,
      argumentos: data,
      channelSale: this.formControl['channelSale'].value,
      structureType: this.formControl['structureType'].value,
      userId: this.currentUser['id'],
    };

    this.newPlotService.validatePlot(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.responsePlot$ = {
          ...response,
          showSuccessImage: true,
        };

        if (response.success) {
          this.responsePlot$.message = `Se generó correctamente la carga N° ${response.idCarga}.`;
          this.vc.createEmbeddedView(this.modalSubmit);
        }

        if (!response.success && !(response.validaciones ?? [])?.length) {
          this.responsePlot$.message =
            'Ocurrió un problema al generar la carga, por favor inténtelo más tarde.';
          this.vc.createEmbeddedView(this.modalSubmit);
        }
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

  removeAllTables(): void {
    this.currentPageError = 1;
    this.responsePlot$ = null;
    this.resetForm();
  }

  exportLog(): void {
    const payload: IExportExcel = {
      fileName: 'trama_log',
      data: this.responsePlot$.validaciones.map((values: any) => ({
        Campo: values.campo,
        'Descripción ': values.descripcion,
        'Número de línea': values.numeroLinea,
      })),
    };

    this.spinner.show();
    this.utilsService.exportExcel(payload).then((res: any) => {
      console.log(res);
      this.spinner.hide();
    });
  }

  backPage(): void {
    this.router.navigate(['/backoffice/tramas']);
  }

  closeModals(): void {
    if (this.responsePlot$?.success && this.responsePlot$?.idCarga) {
      this.router.navigate(['/backoffice/tramas']);
      return;
    }
    this.vc.clear();
    this.removeAllTables();
  }

  clearFormControl(form: FormGroup, formControlName): void {
    form.get(formControlName).setValue(null);
  }
}
