import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import moment from 'moment';

import { RegularExpressions } from '@shared/regexp/regexp';

import { UtilsService } from '@shared/services/utils/utils.service';
import { BandejaTramaService } from '../../shared/services/bandeja-trama.service';

@Component({
  selector: 'app-bandeja-trama',
  templateUrl: './bandeja-trama.component.html',
  styleUrls: ['./bandeja-trama.component.sass'],
})
export class BandejaTramaComponent implements OnInit {
  fechaInicioConfig;
  fechaFinConfig;

  formFilters: FormGroup = this.builder.group({
    idEstructura: [null, Validators.pattern(RegularExpressions.numbers)],
    tipoArchivo: [null],
    fechaInicio: [null],
    fechaFin: [null],
    estado: [null],
  });

  selectedStructure: any = {};

  estructurasResponse$: any = null;
  structureListFreeze$: any = null;

  currentPage = 1;
  responseMessage: {
    showImage: boolean;
    hasError: boolean;
    message: string;
  } = null;

  @ViewChild('modalConfirmOverrideStructure', {
    static: true,
    read: TemplateRef,
  })
  modalConfirmOverrideStructure: TemplateRef<ElementRef>;
  @ViewChild('modalMessage', {
    static: true,
    read: TemplateRef,
  })
  modalMessage: TemplateRef<ElementRef>;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly utilsService: UtilsService,
    private readonly bandejaTramaService: BandejaTramaService
  ) {}

  ngOnInit(): void {
    this.setFechasConfig();
    this.resetForm();
    this.valueChangesFormFilters();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get formFiltersControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  set changeCurrentPage(page: number) {
    this.currentPage = page;
    this.listarEstructuras();
  }

  valueChangesFormFilters(): void {
    this.formFiltersControl['idEstructura'].valueChanges.subscribe(
      (value: string) => {
        if (this.formFiltersControl['idEstructura'].hasError('pattern')) {
          this.formFiltersControl['idEstructura'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formFiltersControl['estado'].valueChanges.subscribe(
      (value: string) => {
        this.estructurasResponse$.dataEstructura =
          this.structureListFreeze$.filter((x: any) =>
            value == 'TODOS'
              ? true
              : x.estado.toString().toLowerCase() == value.toLowerCase()
          );
      }
    );
  }

  resetForm(): void {
    const minDate = new Date('2022-01-01');
    const maxDate = new Date();
    this.fechaInicioConfig = this.fechaFinConfig = {
      ...this.utilsService.datepickerConfig,
      minDate: minDate,
      maxDate: maxDate,
    };

    this.formFiltersControl['idEstructura'].setValue(null);
    this.formFiltersControl['tipoArchivo'].setValue(1);
    this.formFiltersControl['fechaInicio'].setValue(minDate);
    this.formFiltersControl['fechaFin'].setValue(maxDate);
    this.formFiltersControl['estado'].setValue('TODOS');
    this.listarEstructuras();
  }

  setFechasConfig(): void {
    this.fechaInicioConfig = this.fechaFinConfig = {
      ...this.utilsService.datepickerConfig,
      minDate: new Date('2022-01-01'),
      maxDate: new Date(),
    };
  }

  listarEstructuras(reset = false): void {
    if (reset) {
      this.changeCurrentPage = 1;
      return;
    }

    const payload = {
      idEstructura: this.formFiltersControl['idEstructura'].value || '0',
      tipoArchivo: this.formFiltersControl['tipoArchivo'].value || '0',
      fechaInicio: moment(this.formFiltersControl['fechaInicio'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFiltersControl['fechaFin'].value).format(
        'DD/MM/YYYY'
      ),
      indice: this.currentPage,
      cantidadRegistros: 10,
    };

    this.spinner.show();
    this.bandejaTramaService.getAll(payload).subscribe({
      next: (response: any) => {
        this.structureListFreeze$ = Object.freeze(
          response.dataEstructura || []
        );
        this.estructurasResponse$ = response;
        this.formFiltersControl['estado'].enable();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getDetail(id: number, ref: string): void {
    const data = {
      structureId: id,
      ref: ref,
    };

    this.utilsService.encryptStorage({
      name: '_detalle_estructura-ps',
      data: data,
    });
    this.router.navigate([`/backoffice/tramas/configuracion`], {
      queryParams: data,
      queryParamsHandling: 'merge',
    });
  }

  showModalOverrideStructure(data: any): void {
    console.log(data);
    this.selectedStructure = data;
    this.vc.createEmbeddedView(this.modalConfirmOverrideStructure);
  }

  overrideStructure(): void {
    this.vc.clear();
    const data = {
      idEstructura: +this.selectedStructure.idEstructura,
      idUsuario: +this.currentUser['id'],
    };
    this.bandejaTramaService.overrideStructure(data).subscribe({
      next: (response: any) => {
        console.log(response);

        if (!response.success) {
          this.responseMessage = {
            showImage: true,
            hasError: true,
            message: 'Ocurrió un problema al intentar anular la estructura',
          };
          return;
        }

        this.responseMessage = {
          showImage: true,
          hasError: false,
          message: `Se anuló correctamente la estructura N° ${data.idEstructura}`,
        };
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.responseMessage = {
          showImage: true,
          hasError: true,
          message:
            'Tenemos problemas para anular la estructura, inténtelo más tarde',
        };
        this.spinner.hide();
        this.vc.createEmbeddedView(this.modalMessage);
      },
      complete: () => {
        this.spinner.hide();
        this.vc.createEmbeddedView(this.modalMessage);
      },
    });
  }

  closeModals(): void {
    if (!this.responseMessage.hasError) {
      this.listarEstructuras(true);
    }

    this.vc.clear();
    this.selectedStructure = {};
    this.responseMessage = null;
  }

  goToPage(url: string): void {
    sessionStorage.removeItem('_detalle_estructura-ps');
    this.router.navigate([`/backoffice/tramas/${url}`]);
  }
}
