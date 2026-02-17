import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as SDto from '../../../services/transaccion/generar-stock/DTOs/generarStock.dto';
import * as CDto from './DTOs/generarStock.dto';
import { GenerarStockService } from '../../../services/transaccion/generar-stock/generar-stock.service';
import { ParseDateService } from '../../../services/transaccion/shared/parse-date.service';
import { AppConfig } from '../../../../../app.config';
import moment from 'moment';
import { NAMED_ENTITIES } from '@angular/compiler';
@Component({
  selector: 'app-generar-stock',
  templateUrl: './generar-stock.component.html',
  styleUrls: ['./generar-stock.component.css'],
})
export class GenerarStockComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 1));
  bsValueFin: Date = new Date();
  formPoliza: FormGroup;
  formSearchData: FormGroup;
  formChangeStatusPoliza: FormGroup;
  urlApi: string;
  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _GenerarStockService: GenerarStockService,
    private readonly _ParseDateService: ParseDateService
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.formPoliza = this._FormBuilder.group({
      tipoPoliza: [-1, Validators.required],
      cantidad: [
        0,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      rango_inicial: [
        { value: 0, disabled: true },
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      rango_final: [
        { value: 0, disabled: true },
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
    });
    this.formSearchData = this._FormBuilder.group({
      fechaIni: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
      tipoPoliza: [''],
    });
    this.formChangeStatusPoliza = this._FormBuilder.group({
      P_NNUMREG: [null, Validators.required],
      P_NSTATUSPOL: [null, Validators.required],
    });
    this.polizaDataWithParams();
    this.initDataPolizas();
  }

  get f(): any {
    return this.formSearchData.controls;
  }
  // PAGINADO
  currentPage = 0;
  p = 0;
  tipoPolizaData: SDto.TipoPolizaDto = {
    Entity: [
      {
        SITEM: '',
        SDECRIPTION: '',
      },
    ],
  };
  dataPolizas: SDto.PolizaDto;
  // FECHAS

  downloadURL: any;
  downloadURL2: any;
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalEditar', { static: true }) modalEditar: ModalDirective;
  @ViewChild('modalMessage', { static: true }) modalMessage: ModalDirective;
  messageModal = '';
  STATUS_POLIZA: SDto.StatusPolizaDto = {
    STATUS: '',
    Entity: [
      {
        NSTATUSPOL: 0,
        ROWNUMBER: '',
        ROWTOTAL: '',
        SDESCRIPT: '',
        STATUS: '',
        TAG: '',
      },
    ],
  };
  private FORM_POLIZA: CDto.GenerarPolizaDto;
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this._GenerarStockService.tipoPolizaData().subscribe(
      (res: SDto.TipoPolizaDto) => {
        this.tipoPolizaData = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  showMessageModal(message: string): void {
    this.messageModal = message;
    this.modalMessage.show();
  }
  hideMessageModal(): void {
    this.modalMessage.hide();
    /* this.polizaData(); */
  }
  initDataPolizas(): void {
    this.dataPolizas = {
      ROWTOTAL: '',
      STATUS: '',
      entities: [],
    };
  }
  // SET FORM VALUES DEFAULT
  setFormValuesDefault(): void {
    this.formSearchData.get('fechaIni').setValue(this.bsValueIni);
    this.formSearchData.get('fechaFin').setValue(this.bsValueFin);
    this.formSearchData.get('tipoPoliza').setValue(-1);
    this.formPoliza.get('rango_inicial').setValue(0);
    this.formPoliza.get('rango_final').setValue(0);
    this.polizaDataWithParams();
  }
  // MODAL EDITAR Poliza
  editarPoliza(data: any): void {
    if (data.NSTATUSPOL === 2) {
      this.showMessageModal('No es posible modificar el estado');
    } else {
      this._spinner.show();
      this.formChangeStatusPoliza.get('P_NNUMREG').setValue(data.NNUMREG);
      this._GenerarStockService.statusPoliza(data.NSTATUSPOL).subscribe(
        (res: SDto.StatusPolizaDto) => {
          this.STATUS_POLIZA = res;
          this.modalEditar.show();
          this._spinner.hide();
        },
        (err: any) => {
          console.log(err);
          this.STATUS_POLIZA = null;
          this.modalEditar.show();
          this._spinner.hide();
        }
      );
    }
  }
  // MODAL NUEVO Poliza
  showModalNuevoPoliza(): void {
    this.modal.show();
  }
  // HIDE MODAL NUEVO Poliza
  hideModalNuevoPoliza(): void {
    this.modal.hide();
    const form = this.formPoliza;
    form.reset();
    form.get('tipoPoliza').setValue(1);
    form.get('cantidad').setValue(0);
    this.formPoliza.get('rango_inicial').setValue(0);
    this.formPoliza.get('rango_final').setValue(0);
  }
  // HIDE MODAL EDITAR Poliza
  cancelarEditarPoliza(): void {
    this.modalEditar.hide();
    this.formChangeStatusPoliza.reset();
  }
  // LIMPIAR FORMULARIO
  clearForm(): void {
    const form = this.formPoliza;
    form.reset();
    form.get('tipoPoliza').setValue(1);
    form.get('cantidad').setValue(0);
    this.formPoliza.get('rango_inicial').setValue(0);
    this.formPoliza.get('rango_final').setValue(0);
    this.FORM_POLIZA = null;
  }
  // SERVICIOS
  // DATA Poliza
  polizaData(isShowLoader: boolean = true): void {
    if (isShowLoader === false) {
      this._spinner.hide();
    } else {
      this._spinner.show();
    }
    this._GenerarStockService.polizaData().subscribe(
      (res: SDto.PolizaDto) => {
        this.dataPolizas = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  generarRangoPoliza(): void {
    this._spinner.show();
    this.FORM_POLIZA = {
      P_NTIPPOL: this.formPoliza.get('tipoPoliza').value,
      P_NQUANTITY: this.formPoliza.get('cantidad').value,
      P_NREGUSER: 62,
      P_NPOLES_FIN: 0,
      P_NPOLES_INI: 0,
    };
    const data: CDto.GenerarRangoPolizaDto = {
      P_NTIPPOL: this.formPoliza.get('tipoPoliza').value,
      P_NQUANTITY: this.formPoliza.get('cantidad').value,
      P_NREGUSER: 62,
    };
    this._GenerarStockService.generarRangoPoliza(data).subscribe(
      (res: SDto.GenerarRangoPolizaDto) => {
        this.formPoliza.get('rango_inicial').setValue(res.Entity.NVRANGOINI);
        this.formPoliza.get('rango_final').setValue(res.Entity.NVRANGOFIN);
        this.FORM_POLIZA.P_NPOLES_INI = res.Entity.NVRANGOINI;
        this.FORM_POLIZA.P_NPOLES_FIN = res.Entity.NVRANGOFIN;
        this._spinner.hide();
        /*         this.polizaData(); */
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  generarPoliza(): void {
    this._spinner.show();
    const data: CDto.GenerarPolizaDto = {
      P_NPOLES_INI: this.FORM_POLIZA.P_NPOLES_INI,
      P_NPOLES_FIN: this.FORM_POLIZA.P_NPOLES_FIN,
      P_NQUANTITY: this.FORM_POLIZA.P_NQUANTITY,
      P_NREGUSER: this.FORM_POLIZA.P_NREGUSER,
      P_NTIPPOL: this.FORM_POLIZA.P_NTIPPOL,
    };
    this._GenerarStockService.generarPoliza(data).subscribe(
      (res: SDto.ResPolizaDto) => {
        this.clearForm();
        this._spinner.hide();
        this.hideModalNuevoPoliza();
        this.busqueda();
      },
      (err: any) => {
        console.log(err);
        this.clearForm();
        this._spinner.hide();
      }
    );
  }

  busqueda(): void {
    this._spinner.show();
    try {
      if (
        this.formSearchData.get('fechaIni').value.toString() == null ||
        this.formSearchData.get('fechaFin').value.toString() == null
      ) {
        this.formSearchData.get('fechaIni').setValue('');
        this.formSearchData.get('fechaFin').setValue('');
      }
      const data: CDto.PolizaDataWithParamDto = {
        P_NTIPPOL: this.formSearchData.get('tipoPoliza').value,
        P_DFCREABEGIN: this.formSearchData.get('fechaIni').value.toString(),
        P_DFCREAEND: this.formSearchData.get('fechaFin').value.toString(),
      };
      // tslint:disable-next-line:radix
      if (parseInt(data.P_NTIPPOL) === -1 || data.P_NTIPPOL === null) {
        data.P_NTIPPOL = '';
      }

      data.P_DFCREABEGIN = this._ParseDateService.parseDate(data.P_DFCREABEGIN);
      data.P_DFCREAEND = this._ParseDateService.parseDate(data.P_DFCREAEND);
      this._GenerarStockService.PolizaDataWithParams(data).subscribe(
        (res: SDto.PolizaDto) => {
          this.dataPolizas = res;
          this.showMessageModal('Datos grabados con éxito');
          this._spinner.hide();
        },
        (err: any) => {
          this.initDataPolizas();
          this._spinner.hide();
        }
      );
    } catch (err) {
      this.polizaData(true);
    }
  }

  polizaDataWithParams(): void {
    this._spinner.show();
    try {
      if (
        this.formSearchData.get('fechaIni').value.toString() == null ||
        this.formSearchData.get('fechaFin').value.toString() == null
      ) {
        this.formSearchData.get('fechaIni').setValue('');
        this.formSearchData.get('fechaFin').setValue('');
      }
      const data: CDto.PolizaDataWithParamDto = {
        P_NTIPPOL: this.formSearchData.get('tipoPoliza').value,
        P_DFCREABEGIN: this.formSearchData.get('fechaIni').value.toString(),
        P_DFCREAEND: this.formSearchData.get('fechaFin').value.toString(),
      };
      // tslint:disable-next-line:radix
      if (parseInt(data.P_NTIPPOL) === -1 || data.P_NTIPPOL === null) {
        data.P_NTIPPOL = '';
      }

      data.P_DFCREABEGIN = this._ParseDateService.parseDate(data.P_DFCREABEGIN);
      data.P_DFCREAEND = this._ParseDateService.parseDate(data.P_DFCREAEND);
      this._GenerarStockService.PolizaDataWithParams(data).subscribe(
        (res: SDto.PolizaDto) => {
          this.dataPolizas = res;
          this._spinner.hide();
        },
        (err: any) => {
          this.initDataPolizas();
          this._spinner.hide();
        }
      );
    } catch (err) {
      this.polizaData(true);
    }
  }

  busqueda2(): void {
    this._spinner.show();
    try {
      if (
        this.formSearchData.get('fechaIni').value.toString() == null ||
        this.formSearchData.get('fechaFin').value.toString() == null
      ) {
        this.formSearchData.get('fechaIni').setValue('');
        this.formSearchData.get('fechaFin').setValue('');
      }
      const data: CDto.PolizaDataWithParamDto = {
        P_NTIPPOL: this.formSearchData.get('tipoPoliza').value,
        P_DFCREABEGIN: this.formSearchData.get('fechaIni').value.toString(),
        P_DFCREAEND: this.formSearchData.get('fechaFin').value.toString(),
      };
      // tslint:disable-next-line:radix
      if (parseInt(data.P_NTIPPOL) === -1 || data.P_NTIPPOL === null) {
        data.P_NTIPPOL = '';
      }

      data.P_DFCREABEGIN = this._ParseDateService.parseDate(data.P_DFCREABEGIN);
      data.P_DFCREAEND = this._ParseDateService.parseDate(data.P_DFCREAEND);
      this._GenerarStockService.PolizaDataWithParams(data).subscribe(
        (res: SDto.PolizaDto) => {
          this.dataPolizas = res;
          this.showMessageModal('El estado se cambió con éxito');
          this._spinner.hide();
        },
        (err: any) => {
          this.initDataPolizas();
          this._spinner.hide();
        }
      );
    } catch (err) {
      this.polizaData(true);
    }
  }
  cambiarStatusPoliza(): void {
    this._spinner.show();
    this._GenerarStockService
      .cambiarStatusPoliza(this.formChangeStatusPoliza.value)
      .subscribe(
        (res: SDto.ResPolizaDto) => {
          /* this.polizaData(false); */
          this.modalEditar.hide();
          if (res.Entity.toString() === '1') {
            this._spinner.hide();
            this.busqueda2();
            this.formChangeStatusPoliza.get('P_NSTATUSPOL').setValue(null);
          } else {
            this.showMessageModal('No se pudo cambiar de estado');
            this._spinner.hide();
          }
        },
        (err: any) => {
          this.modalEditar.hide();
          this.showMessageModal('Ocurrió un error al cambiar de estado');
          this._spinner.hide();
        }
      );
  }

  descargar(data) {
    this.downloadURL =
      this.urlApi +
      '/StockCertificates/Reports/PA_SEL_STOCK_REPORT_GET?P_NSTATUSPOL=' +
      data.NSTATUSPOL +
      '&P_NNUMREG=' +
      data.NNUMREG;
    window.open(this.downloadURL);
  }

  exportar() {
    /* const date = new Date(this.f['fechaIni'].value);
    const date2 = new Date(this.f['fechaFin'].value); */
    // tslint:disable-next-line:radix
    if (
      // tslint:disable-next-line:radix
      parseInt(this.f['tipoPoliza'].value) === -1 ||
      this.f['tipoPoliza'].value === null
    ) {
      this.f['tipoPoliza'].value = '';
    }
    this.downloadURL2 =
      this.urlApi +
      '/StockCertificates/Reports/PA_SEL_STOCK_GRILLA_REPORT_GET?P_NTIPPOL=' +
      this.f['tipoPoliza'].value +
      '&P_DFCREABEGIN=' +
      /* `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` */
      moment(this.f['fechaIni'].value).format('YYYY-MM-DD') +
      '&P_DFCREAEND=' +
      /* `${date2.getDate()}/${date2.getMonth() + 1}/${date2.getFullYear()}` */
      moment(this.f['fechaFin'].value).format('YYYY-MM-DD');
    window.open(this.downloadURL2);
  }
}
