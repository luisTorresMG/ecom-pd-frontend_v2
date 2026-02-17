import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { UtilsService } from '@shared/services/utils/utils.service';
import { RegularExpressions } from '@shared/regexp/regexp';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { CargaMasivaEstadoService } from '../../../../services/transaccion/carga-masiva/carga-masiva-estado.service';
import { ChannelPointService } from '../../../../services/transaccion/shared/channel-point.service';
import { CargaMasivaService } from '../../../../services/transaccion/carga-masiva/carga-masiva.service';
import * as SDto from '../../../../services/transaccion/carga-masiva/DTOs/carga-masiva.dto';
import * as CDto from '../CargaMasiva-List/DTOs/CargaMasiva.dto';

@Component({
  selector: 'app-CargaMasiva-State',
  templateUrl: './CargaMasiva-State.component.html',
  styleUrls: ['./CargaMasiva-State.component.sass'],
})
export class CargaMasivaStateComponent implements OnInit {
  formFilter: FormGroup = this.builder.group({
    channel: [''],
    contractor: [''],
    idProcess: ['', Validators.pattern(RegularExpressions.numbers)],
    tdr: [''],
    state: [''],
    initialDate: [''],
    loadDate: [''],
  });

  formLoad: FormGroup = this.builder.group({
    channelLoad: ['', Validators.required],
    pointSales: ['', Validators.required],
    contractorLoad: ['', Validators.required],
    tdrLoad: ['', Validators.required],
    file: ['', Validators.required],
  });

  formInvoice = this.builder.group({
    idInvoice: ['', Validators.required],
    typeInvoice: ['', Validators.required],
  });

  private pageTableStateLoad: number = 1;

  numberContractors: number = 0;
  messageResultTrama: string = '';
  nameFile: string = 'Selecciona un archivo excel';
  archiveStateLoad: File = null;
  idCargaMasiva: number = 0;
  fechaInitial: string = '01/01/2023';
  valueDateFin: Date = new Date();
  valueDateInit: Date = moment(this.fechaInitial, 'DD/MM/YYYY').toDate();

  dataHistoryLoad$: Array<any> = [];
  // Listado de Canales
  dataListChannels$: Array<any> = [];
  // Listado de Puntos de Venta
  dataPointSales$: Array<any> = [];
  // *Listado de Contratante global
  dataParametersClient$: Array<any> = null;
  // *Listado de Contratante filtrados por canal
  dataParametersClientFiltered$: Array<any> = [];
  // *Listado de TDR filtrados por canal
  dataListTdrFiltered$: Array<any> = [];
  // *Listado de TDR total del listado
  dataListTdr$: Array<any> = [];
  // *Listado de Tipo Contrato
  dataParametersTypeContract$: Array<any> = null;
  // *Listado de linea de crédito por carga masiva global
  dataStateLoad$: Array<any> = [];
  // *Listado de linea de crédito por carga masiva filtrado
  dataStateLoadFiltered$: Array<any> = [];

  datePickerConfig: Partial<BsDatepickerConfig>;

  @ViewChild('modalLoad', { static: true, read: TemplateRef })
  modalLoad: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmLoad', { static: true, read: TemplateRef })
  modalConfirmLoad: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmTrue', { static: true, read: TemplateRef })
  modalConfirmTrue: TemplateRef<ElementRef>;
  @ViewChild('modalAddLoadError', { static: true, read: TemplateRef })
  modalAddLoadError: TemplateRef<ElementRef>;
  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  modalHistory: TemplateRef<ElementRef>;
  @ViewChild('modalDownloadInvoice', { static: true, read: TemplateRef })
  modalDownloadInvoice: TemplateRef<ElementRef>;
  @ViewChild('modalGenerateInvoice', { static: true, read: TemplateRef })
  modalGenerateInvoice: TemplateRef<ElementRef>;
  @ViewChild('modalSuccessInvoice', { static: true, read: TemplateRef })
  modalSuccessInvoice: TemplateRef<ElementRef>;
  @ViewChild('modalErrorInvoice', { static: true, read: TemplateRef })
  modalErrorInvoice: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly cargaMasivaService: CargaMasivaService,
    private readonly cargaMasivaEstadoService: CargaMasivaEstadoService,
    private readonly utilsService: UtilsService,
    private readonly router: Router,
    private readonly vc: ViewContainerRef,
    private readonly channelPointService: ChannelPointService
  ) {
    this.datePickerConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: true,
      }
    );
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getParametersLoad();
    this.getListChannels();
    this.getDataStateLoad();

    this.formFilterControl['channel'].setValue('0');
    this.formFilterControl['contractor'].setValue('0');
    this.formFilterControl['state'].setValue('0');
    this.formFilterControl['tdr'].setValue('0');
    this.formFilterControl['loadDate'].setValue(new Date());
    this.formFilterControl['initialDate'].setValue(
      moment(this.fechaInitial, 'DD/MM/YYYY').toDate()
    );

    this.formFilterControl['idProcess'].valueChanges.subscribe((val) => {
      if (this.formFilterControl['idProcess'].hasError('pattern')) {
        this.formFilterControl['idProcess'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
    });

    this.formLoadControl['channelLoad'].valueChanges.subscribe((val) => {
      this.formLoadControl['pointSales'].setValue('');
      this.formLoadControl['contractorLoad'].setValue('');
      this.dataPointSales$ = [];
      this.dataParametersClientFiltered$ = [];
      this.getDataPointSales(val);
      this.getDataContractorLoad(val);
    });

    this.formLoadControl['contractorLoad'].valueChanges.subscribe((val) => {
      this.getDataTdrLoad(val);
    });
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get formLoadControl(): { [key: string]: AbstractControl } {
    return this.formLoad.controls;
  }

  get formInvoiceControl(): { [key: string]: AbstractControl } {
    return this.formInvoice.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get currentPage(): number {
    return this.pageTableStateLoad;
  }

  set currentPage(page: number) {
    this.pageTableStateLoad = page;
  }

  getParametersLoad(): void {
    this.spinner.show();

    const request = {
      canal: null,
      cliente: null,
    };
    this.cargaMasivaEstadoService.getParametersLoad(request).subscribe({
      next: (response: any) => {
        this.dataParametersClient$ = response.listadoContratanteCredito;
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

  getListChannels(): void {
    this.utilsService.channelSales(+this.currentUser?.id).subscribe({
      next: (response: any) => {
        this.dataListChannels$ = response.items;
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

  getDataPointSales(e: any): void {
    this.spinner.show();
    this.channelPointService.puntoVentaData(e).subscribe({
      next: (response: any) => {
        this.dataPointSales$ = response.PRO_SALE_POINT;
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

  getDataContractorLoad(value: any): void {
    this.spinner.show();

    const request = {
      canal: value,
      cliente: null,
    };

    this.cargaMasivaEstadoService.getParametersLoad(request).subscribe({
      next: (response: any) => {
        this.dataParametersClientFiltered$ =
          response.listadoContratanteCargaMasiva;
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

  getDataTdrLoad(value: any): void {
    this.spinner.show();

    const request = {
      canal: this.formLoadControl['channelLoad'].value,
      cliente: value,
    };

    this.cargaMasivaEstadoService.getParametersLoad(request).subscribe({
      next: (response: any) => {
        this.dataListTdrFiltered$ = response.listadoTdrCargaMasiva;
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

  getDataStateLoad(): void {
    this.spinner.show();
    const dataFechaFin = new Date(
      new Date().setMonth(new Date().getMonth() + 6)
    );

    const request = {
      codigoCanal: 0,
      cliente: 0,
      tdr: 0,
      idCargaMasiva: 0,
      idEstado: 0,
      fechaInicio: this.fechaInitial,
      fechaFin: moment(dataFechaFin).format('DD/MM/YYYY'),
    };

    this.cargaMasivaEstadoService.getDataStateLoad(request).subscribe({
      next: (response: any) => {
        this.dataStateLoad$ = response.listadoCargaMasivaEstado;
        this.dataStateLoadFiltered$ = response.listadoCargaMasivaEstado;

        const data = this.dataStateLoad$.map((item) => item.tdr);

        this.dataListTdr$ = data.sort().filter((item, index) => {
          return data.indexOf(item) === index;
        });
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

  downloadListLoad(): void {
    const payload: IExportExcel = {
      fileName: 'Carga_Masiva_Estado',
      data: this.dataStateLoadFiltered$.map((value: any) => ({
        'ID PROCESO ': +value.idProceso,
        'CANAL DE VENTA ': value.canal,
        'CONTRATANTE ': value.cliente,
        'TDR ': value.tdr,
        'CANTIDAD DE REGISTROS ': +value.cantidadRegistro,
        'PRIMA TOTAL ': +value.primaTotal,
        'FECHA CARGA ': moment(value.fechaProceso, 'DD/MM/YYYY').toDate(),
        'USUARIO ': value.usuario,
        'ESTADO ': value.estado,
      })),
    };
    this.utilsService.exportExcel(payload);
  }

  search(): void {
    this.spinner.show();
    setTimeout(() => {
      this.searchDataStateLoad();
    }, 300);
  }

  searchDataStateLoad(): void {
    const value = this.formFilter.value;

    this.dataStateLoadFiltered$ = this.dataStateLoad$.filter(
      (x: any) =>
        (value.idProcess == '' ? true : x.idProceso == value.idProcess) &&
        (value.state == '0' ? true : x.idEstado == value.state) &&
        (value.channel == '0' ? true : x.codigoCanal == value.channel) &&
        (value.contractor == '0'
          ? true
          : x.codigoCliente == value.contractor) &&
        (value.tdr == '0' ? true : x.tdr == value.tdr) &&
        Date.parse(moment(x.fechaProceso, 'DD/MM/YYYY').toDate().toString()) >=
          Date.parse(value.initialDate) &&
        Date.parse(moment(x.fechaProceso, 'DD/MM/YYYY').toDate().toString()) <=
          Date.parse(value.loadDate)
    );
    this.spinner.hide();
  }

  uploadFile(e: any): void {
    if (e.target.files.length !== 0) {
      const ext = e.target.files[0].name.split('.').pop();

      if (ext === 'xls' || ext === 'xlsx') {
        this.nameFile = e.target.files[0].name;
        this.archiveStateLoad = e.target.files[0];
      } else {
        this.formLoadControl['file'].reset();
        this.nameFile = 'El archivo no es válido';
      }
    }
  }

  addCargaMasiva(): void {
    this.spinner.show();
    this.hideModal();

    const value = this.formLoad.value;

    const request = {
      Canal: value.channelLoad,
      PuntoVenta: value.pointSales,
      IdUsuario: this.currentUser?.id.toString(),
      Contratante: value.contractorLoad,
      Tdr: value.tdrLoad,
      fileattach: this.archiveStateLoad,
    };

    this.cargaMasivaEstadoService.validateTramaLoad(request).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.cargaMasivaEstadoService.setDataCargaMasivaEstado(response);
        this.router.navigate(['backoffice/transaccion/CargaMasivaAddState']);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.messageResultTrama =
          'Ocurrió un problema al adjuntar archivo, puede que no tenga el formato correcto.';
        this.vc.createEmbeddedView(this.modalAddLoadError);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  goViewDetail(id: any): void {
    this.router.navigate(['/backoffice/transaccion/CargaMasivaAddState'], {
      queryParams: {
        IdCargaMasiva: id,
      },
    });
  }

  viewHistoryLoad(id: number): void {
    const data: CDto.SerchCargaMasivaHisDto = {
      idPoliza: id,
    };
    this.spinner.show();
    this.cargaMasivaService.searchHistory(data).subscribe(
      (res: SDto.SearchCargaMasivaHisDto) => {
        this.idCargaMasiva = id;
        this.dataHistoryLoad$ = res.cargaMasivaDetail;

        this.spinner.hide();
        this.vc.createEmbeddedView(this.modalHistory);
      },
      (err: any) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  generateInvoice(): void {
    this.hideModal();
    this.spinner.show();
    const data = {
      id: this.formInvoiceControl['idInvoice'].value,
      facturacionIndividual: this.formInvoiceControl['typeInvoice'].value,
    };
    this.cargaMasivaService.facturarCarga(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.success) {
          this.getDataStateLoad();
          this.vc.createEmbeddedView(this.modalSuccessInvoice);
        } else {
          this.vc.createEmbeddedView(this.modalErrorInvoice);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  downloadExcel(id: number): void {
    this.spinner.show();
    this.cargaMasivaService.descargarExcel(id).subscribe(
      (res: any) => {
        this.spinner.hide();
        const archivo = {
          file: res.archivo,
          id: id,
          nombre: res.nombre,
        };
        if (res.success) {
          this.downloadArchivo(archivo);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  descargarConstancias(id: any): void {
    this.spinner.show();
    this.cargaMasivaService.descargarConstancia(id).subscribe(
      (res: any) => {
        const data = {
          file: res.archivo,
          nombre: res.nombreArchivo,
        };
        this.downloadArchivo(data);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  downloadFormatExcel(): void {
    this.spinner.show();
    this.cargaMasivaService.descargarFormatoExcelCargaMasiva().subscribe(
      (res: any) => {
        this.spinner.hide();
        const data = {
          file: res.archivo,
          nombre: res.nombre,
        };
        if (res.success) {
          this.downloadArchivo(data);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  downloadInvoice(id: number): void {
    this.spinner.show();
    console.log(id);
    this.cargaMasivaService.descargarFactura(id).subscribe(
      (res: any) => {
        this.spinner.hide();
        const archivo = {
          file: res.archivo,
          id: id,
          nombre: res.nombre,
        };
        if (res.success) {
          this.downloadArchivo(archivo);
        } else {
          this.vc.createEmbeddedView(this.modalDownloadInvoice);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  downloadArchivo(response: any) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.nombre);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.spinner.hide();
    }
  }

  showModalLoad(): void {
    this.hideModal();

    this.nameFile = 'Selecciona un archivo excel';
    this.archiveStateLoad = null;

    this.formLoadControl['file'].reset();
    this.formLoadControl['channelLoad'].setValue('');
    this.formLoadControl['pointSales'].setValue('');
    this.formLoadControl['contractorLoad'].setValue('');
    this.formLoadControl['tdrLoad'].setValue('');

    this.vc.createEmbeddedView(this.modalLoad);
  }

  hideModal(): void {
    this.vc.clear();
  }

  showModalGenerateInvoice(id: any, numberContractors: string): void {
    this.numberContractors = Number.parseInt(numberContractors);
    this.formFilterControl['channel'];
    this.formInvoiceControl['idInvoice'].setValue(id);

    if (this.numberContractors > 1) {
      this.formInvoiceControl['typeInvoice'].setValue(true);
    } else {
      this.formInvoiceControl['typeInvoice'].setValue(false);
    }
    this.vc.createEmbeddedView(this.modalGenerateInvoice);
  }
}
