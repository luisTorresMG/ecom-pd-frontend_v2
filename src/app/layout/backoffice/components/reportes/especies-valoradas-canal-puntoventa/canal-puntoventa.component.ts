import { ChannelBatchReportService } from '../../../services/channelbatchreport/channelbatchreport.service';
import { Router } from '@angular/router';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { async } from '@angular/core/testing';
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';
import { ChannelBatchReport } from '../../../models/channelbatchreport/channelbatchreport';
import {
  BaseFilter,
  IECanalYPuntoResponse,
  IBusquedaResponse,
} from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { CommissionLotState } from '../../../../broker/models/commissionlot/commissionlotstate';
import { CommissionLotService } from '../../../../broker/services/commisslot/comissionlot.service';
import { ChannelPoint } from '../../../../../shared/models/channelpoint/channelpoint';
import { ChannelPointService } from '../../../../../shared/services/channelpoint/channelpoint.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReporteEvxcypService } from '../../../services/reportes/reporte-evxcyp.service';
import { HttpParams } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
defineLocale('es', esLocale);
import { UtilsService } from '@shared/services/utils/utils.service';
@Component({
  selector: 'app-canal-puntoventa',
  templateUrl: './canal-puntoventa.component.html',
  styleUrls: ['./canal-puntoventa.component.scss'],
})
export class CanalPuntoVentaComponent implements OnInit {
  dataBusqueda: any;
  messageEnvio: string;
  message: string;
  messageinfo: string;
  rotate = true;
  // currentPage = 0;
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  totalItems = 0;
  itemsPerPage = 10;
  dataEstado: any;
  maxSize = 10;
  channelbatchReportFilter = new BaseFilter();
  npage = 1;
  startDate = '';
  endDate = '';
  fecha = new Date();
  fExistRegistro: any = false;
  bsRangeValue: Date[];
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListChannelBatchReport: ChannelBatchReport[];
  ListChannelBatchReportExport: ChannelBatchReport[];
  msgErrorLista = '';
  canales = [];
  usuario: any;
  canalSelected = 'null';
  channelPointId = '';
  lote = '';
  MENSAJE: any;
  ListStateID = '';
  salesPointIdSelected: any;
  blockfilter = false;
  flagNpolicyConsulta = false;

  ListChannelPoint: any[];
  channelPoint = new ChannelPoint('', 0);
  public lstStateCommission: CommissionLotState[];
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  constructor(
    private channelbatchReportService: ChannelBatchReportService,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService,
    private readonly _fb: FormBuilder,
    private _ReporteEvxcypService: ReporteEvxcypService,
    private emissionService: EmisionService,
    private channelSalesService: ChannelSalesService,
    private commissionlotService: CommissionLotService,
    private channelPointService: ChannelPointService,
    private readonly _utilsService: UtilsService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.form = _fb.group({
      canal: [null],
      puntov: [null],
      estado: [null],
    });
  }

  // PAGINADO
  currentPage = 0;
  p = 0;

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit() {
    // this.busqueda();
    this.estado();
    this.bsRangeValue = [];
    this.lote = '';
    const usuarioSession = localStorage.getItem('currentUser');
    if (usuarioSession !== null) {
      this.usuario = JSON.parse(usuarioSession);
    }
    this.listarCanales();
    // this.onGetLstState();
    /*  this.f['canal'].valueChanges.subscribe((val) => {
          if (val === null) {
            this.f['puntov'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['estado'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
          } else {
            this.f['puntov'].setValidators(Validators.compose([]));
            this.f['estado'].setValidators(Validators.compose([]));
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
          }
          /* if (val) {
            this.f['puntov'].setValidators(Validators.compose([]));
            this.f['estado'].setValidators(Validators.compose([]));
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
          } else {
            this.f['puntov'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['estado'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
          }
          this.f['canal'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['puntov'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['estado'].updateValueAndValidity({
            emitEvent: false,
          });
        });
        this.f['puntov'].valueChanges.subscribe((val) => {
          if (val) {
            this.f['canal'].setValidators(Validators.compose([]));
            this.f['estado'].setValidators(Validators.compose([]));
            this.f['puntov'].setValidators(
              Validators.compose([Validators.required])
            );
          } else {
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['estado'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['puntov'].setValidators(
              Validators.compose([Validators.required])
            );
          }
          this.f['canal'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['puntov'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['estado'].updateValueAndValidity({
            emitEvent: false,
          });
        });
        this.f['estado'].valueChanges.subscribe((val) => {
          if (val) {
            this.f['puntov'].setValidators(Validators.compose([]));
            this.f['canal'].setValidators(Validators.compose([]));
            this.f['estado'].setValidators(
              Validators.compose([Validators.required])
            );
          } else {
            this.f['puntov'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['canal'].setValidators(
              Validators.compose([Validators.required])
            );
            this.f['estado'].setValidators(
              Validators.compose([Validators.required])
            );
          }
          this.f['canal'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['puntov'].updateValueAndValidity({
            emitEvent: false,
          });
          this.f['estado'].updateValueAndValidity({
            emitEvent: false,
          });
        });
      } */
  }

  onGetLstState() {
    let StateChannel;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tipoCanal = +currentUser.tipoCanal;
    if (tipoCanal === 5) {
      StateChannel = new CommissionLotState(1, '', 0, 0);
    } else {
      StateChannel = new CommissionLotState(0, '', 0, 0);
    }
    this.commissionlotService.getCommissionLotState(StateChannel).subscribe(
      (data) => {
        // console.log(data);
        this.lstStateCommission = <CommissionLotState[]>data;
        // this.lstStateChannel = <CommissionLotState[]>data;
        this.lstStateCommission.forEach((element) => {
          this.ListStateID += element.nidstate + ',';
        });
        this.ListStateID = this.ListStateID.slice(0, -1);
      },
      (error) => {}
    );
  }
  onEventSearch(event) {
    this.npage = 0;
    if (this.canalSelected !== '0') {
      this.getChannelBatchReport();
    }
  }

  getChannelBatchReport() {
    this.channelbatchReportFilter = new BaseFilter();
    this.channelbatchReportFilter.NCANAL = +this.canalSelected;
    this.channelbatchReportFilter.NNUMLOT = +this.lote;
    this.spinner.show();
    this.channelbatchReportService
      .getChannelBatchReport(this.channelbatchReportFilter)
      .subscribe(
        async (result) => {
          this.ListChannelBatchReport = <any[]>result;
          if (this.ListChannelBatchReport.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = this.ListChannelBatchReport.length;
          } else {
            this.fExistRegistro = false;
            this.msgErrorLista = 'No se encontraron Registros..';
          }
          // this.emissionService.registrarEvento('', EventStrings.REPORTE_PRODUCCION).subscribe();
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  pageChanged(event: any): void {
    this.npage = event.page - 1;
    this.getChannelBatchReport();
  }

  onEventDownload(event) {
    if (this.canalSelected === '0') {
      return;
    }

    this.channelbatchReportFilter.NCANAL = +this.canalSelected;
    this.channelbatchReportFilter.NPAGENUM = null;
    this.channelbatchReportFilter.NPAGESIZE = null;

    this.spinner.show();
    this.channelbatchReportService
      .getChannelBatchReport(this.channelbatchReportFilter)
      .subscribe(
        async (data) => {
          this.spinner.hide();
          this.ListChannelBatchReportExport = <any[]>data;
          if (this.ListChannelBatchReportExport.length > 0) {
            this.excelService.exportChannelBatchReport(
              this.ListChannelBatchReportExport,
              'channelbatch'
            );
          }
          // this.emissionService.registrarEvento('', EventStrings.PAYROLL_EXPORTAR).subscribe();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  listarCanales() {
    const filtro = new ChannelSales(this.usuario.id, '0', '');
    this.channelSalesService.getPostChannelSales(filtro).subscribe(
      (res) => {
        this.canales = <any[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onEventClear(event) {
    this.bsRangeValue = [];
    /* this.canalSelected = 'null'; /*
        /* this.form.get('puntov').setValue('null');
        this.form.get('estado').setValue('null');
        this.form.get('canal').setValue('null'); */
    this.dataBusqueda = [];
    this.form.reset();
    this.ListChannelPoint = [];
    this.lote = '';
  }

  onChangeCanal(nchannel) {
    this.ListChannelPoint = [];
    this.canalSelected = nchannel;
    if (nchannel === '0') {
      this.form.get('puntov').setValue(null);
      this.ListChannelPoint = [];
    } else {
      const salePoint = new ChannelPoint(nchannel.toString(), 0);
      this.channelPointService.getPostChannelPoint(salePoint).subscribe(
        (data) => {
          // console.log(data);
          this.ListChannelPoint = <any[]>data;
          /*if (this.ListChannelPoint.length > 0) {
                      if (!this.flagNpolicyConsulta)
                         this.salesPointIdSelected = this.ListChannelPoint[0].nnumpoint;
                        this.form.get('puntov').setValue('');
                      }
                      if (this.ListChannelPoint.length > 1) {
                        const all = {
                          nnumpoint: null,
                          sdescript: 'TODOS',
                        };
                        this.ListChannelPoint = [all].concat(this.ListChannelPoint);
                      }
                    }*/
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  onChangePuntoVenta(e) {
    this.form.get('puntov').setValue(e);
  }

  onSelectChannelPoint(channelPointId) {
    this.channelPointId = channelPointId;
    this.channelPointId = 'null';
  }
  onSelectState(StateID) {
    if (StateID === '0') {
      // console.log('StateID 0 ' + this.ListStateID);
      // this.InputsFilter.P_NSTATE = this.ListStateID;
    } else {
      // console.log('StateID != 0  ' + StateID);
      // this.InputsFilter.P_NSTATE = StateID;  //
    }
  }

  estado() {
    const data: any = {
      _: 1637349040336,
    };
    this._ReporteEvxcypService.estado(data).subscribe(
      (response: IECanalYPuntoResponse) => {
        this.dataEstado = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  busqueda() {
    this.spinner.show();
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_NPOLICYS: this.f['canal'].value || '',
      P_NSALEPOINTS: this.f['puntov'].value || '',
      P_NSTATUS: this.f['estado'].value || '',
      _: 1637349040336,
    };
    if (
      this.f['canal'].value === 'null' ||
      this.f['canal'].value === '' ||
      this.f['puntov'].value === '' ||
      this.f['estado'].value === ''
    ) {
      this.modal.show();
      this.MENSAJE = 'Debe seleccionar alguno de los filtros.';
      this.spinner.hide();
    } else {
      this._ReporteEvxcypService.busqueda(data).subscribe(
        (response: IBusquedaResponse) => {
          this.dataBusqueda = response;
          this.spinner.hide();
        },
        (error: any) => {
          console.log(error);
          this.spinner.hide();
        }
      );
    }
  }

  exportar() {
    if (
      this.f['canal'].value === 'null' ||
      this.f['canal'].value === '' ||
      this.f['puntov'].value === '' ||
      this.f['estado'].value === ''
    ) {
      this.modal.show();
      this.MENSAJE = 'Debe seleccionar alguno de los filtros.';
      this.spinner.hide();
    } else {
      let urlForDownload3 = `https://servicios.protectasecurity.pe/backoffice/ReportAssign/ReportChannel/ChannelReport?`;
      const params: any = new HttpParams()
        .set('P_NPOLICYS', this.f['canal'].value || '')
        .set('P_NSALEPOINTS', this.f['puntov'].value || '')
        .set('P_NSTATUS', this.f['estado'].value || '');
      params.updates.forEach((x: any) => {
        urlForDownload3 += `${x.param}=${x.value}&`;
      });
      urlForDownload3 = urlForDownload3.substring(
        0,
        urlForDownload3.length - 1
      );
      this.spinner.show();
      this._utilsService.callApiUrl(urlForDownload3).subscribe(
        (res: any) => {
          console.dir(res);
          const req = {
            nombre: `reporte-canal-y-puntodeventa${new Date().getTime()}.xls`,
            archivo: res.archivo,
          };
          this._utilsService.downloadArchivo(req);
          this.spinner.hide();
        },
        (err: any) => {
          console.error(err);
          this.spinner.hide();
        }
      );
    }
  }

  ocultarModal() {
    this.modal.hide();
  }
}
