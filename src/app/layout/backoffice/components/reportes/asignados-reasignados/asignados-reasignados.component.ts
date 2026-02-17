import { Router } from '@angular/router';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { async } from '@angular/core/testing';
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';
import { AssignReassignReport } from '../../../models/assignreassignreport/assignreassignreport';
import {
  BaseFilter,
  IBuscarResponse,
  IEstadoResponse,
} from '../../../models/basefilter/basefilter';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../broker/shared/events/events';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { AssignReassignReportService } from '../../../services/assignreassignreport/assignreassignreport.service';
import { AsignarSolicitudService } from '../../../services/transaccion/asignar-solicitud/asignar-solicitud.service';
import * as SDto from '../../../services/transaccion/asignar-solicitud/DTOs/asignar-solicitud.dto';
import { ChannelPoint } from '../../../../../shared/models/channelpoint/channelpoint';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChannelPointService } from '../../../../../shared/services/channelpoint/channelpoint.service';
import moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { UtilsService } from '@shared/services/utils/utils.service';
defineLocale('es', esLocale);
@Component({
  selector: 'app-asignados-reasignados',
  templateUrl: './asignados-reasignados.component.html',
  styleUrls: ['./asignados-reasignados.component.scss'],
})
export class AsignadosReasignadosComponent implements OnInit {
  messageEnvio: string;
  form: FormGroup;
  message: string;
  ListPayroll: any;
  formRadio: FormGroup;
  messageinfo: string;
  urlApi: string;
  rotate = true;
  dataEstado: any;
  bsConfig: Partial<BsDatepickerConfig>;
  totalItems = 0;
  itemsPerPage = 10;
  MENSAJE: string;
  maxSize = 10;
  blockfilter = false;
  assignreassignReportFilter = new BaseFilter();
  npage = 1;
  startDate = '';
  endDate = '';
  fecha = new Date();
  ListChannelPoint: any[];
  fExistRegistro: any = false;
  bsRangeValue: Date[];
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListAssignReassignReport: AssignReassignReport[];
  ListAssignReassignReportExport: AssignReassignReport[];
  msgErrorLista = '';
  canales = [];
  usuario: any;
  canalSelected = 'null';
  puntovSelected = 'null';
  CANAL_VENTA_ID: number;
  PUNTO_VENTA_ID: number;
  STATUS_POLCICY: SDto.StatusPolicy = {
    PRO_MASTER: [
      {
        SDECRIPTION: '',
        SITEM: 0,
      },
    ],
  };
  @ViewChild('modalExport', { static: true, read: TemplateRef })
  _modalExport: TemplateRef<any>;
  @ViewChild('mensaje', { static: true, read: TemplateRef })
  _mensaje: TemplateRef<any>;
  constructor(
    private assignReassignReportService: AssignReassignReportService,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService,
    private readonly _fb: FormBuilder,
    private emissionService: EmisionService,
    private channelSalesService: ChannelSalesService,
    private channelPointService: ChannelPointService,
    private readonly _AsignarSolicitudService: AsignarSolicitudService,
    private readonly _vc: ViewContainerRef,
    private readonly _utilsService: UtilsService
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
    this.form = this._fb.group({
      canal: [null, Validators.required],
      puntov: [null, Validators.required],
      fecha: [this.bsValueFin, Validators.required],
      lote: [null, Validators.required],
      estado: [null, Validators.required],
    });
    this.formRadio = this._fb.group({
      radio: ['EXCEL', Validators.required],
    });
    this.statusPolizaData();
  }

  // PAGINADO
  currentPage = 0;
  p = 0;

  get f(): any {
    return this.form.controls;
  }

  get ff(): any {
    return this.formRadio.controls;
  }

  ngOnInit() {
    this.form.get('canal').setValue(null);
    this.bsRangeValue = [];
    if (!!localStorage.getItem('currentUser')) {
      this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    }

    this.listarCanales();
    this.estado();
    this.f['canal'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.f['puntov'].setValue(null);
        this.onChangeCanal(+val);
      }
    });
  }

  statusPolizaData(): void {
    this._AsignarSolicitudService.statusPolizaData().subscribe(
      (res: SDto.StatusPolicy) => {
        console.log(res);
        this.STATUS_POLCICY = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  onEventSearch() {
    /* this.npage = 0;
    if (this.canalSelected !== '0') {
      this.getAssignReassignReport();
    } */
    this.spinner.show();
    const data: any = {
      filterscount: '',
      groupscount: '',
      pagenum: '',
      pagesize: '',
      recordstartindex: '',
      recordendindex: '',
      P_DREGDATE: moment(this.f['fecha'].value).format('YYYY-MM-DD'),
      P_NNUMLOT: this.f['lote'].value || '',
      P_NSTATUS: this.f['estado'].value || '',
      P_NPOLICY: this.f['canal'].value || '',
      P_NNUMPOINT: this.f['puntov'].value || '',
      _: 1637250552305,
    };
    if (!this.f['canal'].value) {
      this.MENSAJE = 'Debe seleccionar un canal.';
      this._vc.createEmbeddedView(this._mensaje);
      this.spinner.hide();
    } else {
      if (!this.f['puntov'].value) {
        this.MENSAJE = 'Debe seleccionar un punto de venta.';
        this._vc.createEmbeddedView(this._mensaje);
        this.spinner.hide();
      } else {
        this.assignReassignReportService.listar(data).subscribe(
          (response: IBuscarResponse) => {
            this.ListPayroll = response;
            this.spinner.hide();
          },
          (error: any) => {
            console.log(error);
            this.spinner.hide();
          }
        );
      }
    }
  }

  getAssignReassignReport() {
    this.assignreassignReportFilter = new BaseFilter();
    this.assignreassignReportFilter.NCANAL = +this.canalSelected;
    this.spinner.show();
    this.assignReassignReportService
      .getAssignReassignReport(this.assignreassignReportFilter)
      .subscribe(
        async (result) => {
          this.ListAssignReassignReport = <any[]>result;
          if (this.ListAssignReassignReport.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = this.ListAssignReassignReport.length;
          } else {
            this.fExistRegistro = false;
            this.msgErrorLista = 'No se encontraron Registros..';
          }
          this.emissionService
            .registrarEvento('', EventStrings.REPORTE_PRODUCCION)
            .subscribe();
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
    this.getAssignReassignReport();
  }

  onEventDownload(event) {
    if (this.canalSelected === '0') {
      return;
    }

    this.assignreassignReportFilter.NCANAL = +this.canalSelected;
    this.assignreassignReportFilter.NPAGENUM = null;
    this.assignreassignReportFilter.NPAGESIZE = null;

    this.spinner.show();
    this.assignReassignReportService
      .getAssignReassignReport(this.assignreassignReportFilter)
      .subscribe(
        async (data) => {
          this.spinner.hide();
          this.ListAssignReassignReportExport = <any[]>data;
          if (this.ListAssignReassignReportExport.length > 0) {
            this.excelService.exportAssignReassignReport(
              this.ListAssignReassignReportExport,
              'assignreassign'
            );
          }
          this.emissionService
            .registrarEvento('', EventStrings.PAYROLL_EXPORTAR)
            .subscribe();
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
    this.form.get('fecha').setValue(this.bsValueFin);
    this.form.get('lote').setValue(null);
    this.form.get('estado').setValue(null);
    this.form.get('canal').setValue(null);
    this.form.get('puntov').setValue(null);
    this.ListPayroll = [];
    this.bsRangeValue = [];
    this.ListChannelPoint = [];
  }

  /* onChangeCanal(nchannel) {
    this.canalSelected = nchannel;
    // if (this.canalSelected === '0') {
    //   this.puntosVenta = [];
    // } else {
    //   this.listarPuntosVenta(this.canalSelected);
    // }
  } */
  CanalVentaData(e): void {
    this.CANAL_VENTA_ID = e;
    console.log(e);
  }
  PuntoVentaData(e): void {
    this.PUNTO_VENTA_ID = e;
  }

  estado() {
    this.spinner.show();
    const data: any = {
      P_SCODE: 'REQUEST%20STATUS',
      _: 1637250552305,
    };
    this.assignReassignReportService.estado(data).subscribe(
      (response: IEstadoResponse) => {
        this.dataEstado = response;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  exportar() {
    this._vc.createEmbeddedView(this._modalExport);
    this.formRadio.get('radio').setValue('EXCEL');
  }

  closeModalExport() {
    this._vc.clear();
  }

  tipoExportar() {
    let urlForDownload3 =
      this.urlApi + `/VariousReports/Reports/reportAssignReassignGet?`;
    const params: any = new HttpParams()
      .set('P_DREGDATE', moment(this.f['fecha'].value).format('YYYY-MM-DD'))
      .set('P_NNUMLOT', this.f['lote'].value || '')
      .set('P_NSTATUS', this.f['estado'].value || '')
      .set('P_NPOLICY', this.f['canal'].value || '')
      .set('P_NNUMPOINT', this.f['puntov'].value || '')
      .set('format', this.ff['radio'].value);
    params.updates.forEach((x: any) => {
      urlForDownload3 += `${x.param}=${x.value}&`;
    });
    urlForDownload3 = urlForDownload3.substring(0, urlForDownload3.length - 1);
    this.spinner.show();
    this._utilsService.callApiUrl(urlForDownload3).subscribe(
      (res: any) => {
        if (res?.archivo) {
          const file = {
            archivo: res.archivo,
            nombre: `reporte-${new Date().getTime()}.` + (`${this.ff['radio'].value}`?.toLowerCase() == 'excel' ? 'xls' : 'pdf')
          };
          this._utilsService.downloadArchivo(file);
          this.spinner.hide();
          this._vc.clear();
          this.ff['radio'].setValue('EXCEL');
        }
      },
      (err: any) => {
        console.error(err);
        this.spinner.hide();
      }
    );
  }

  onChangeCanal(nchannel) {
    this.ListChannelPoint = [];
    this.canalSelected = nchannel;
    if (nchannel === 'null') {
      this.form.get('puntov').setValue(null);
      this.ListChannelPoint = [];
    } else {
      const salePoint = new ChannelPoint(nchannel.toString(), 0);
      this.channelPointService.getPostChannelPoint(salePoint).subscribe(
        (data: any) => {
          // console.log(data);
          this.ListChannelPoint = data;
          if (this.ListChannelPoint?.length == 1) {
            this.f['puntov'].setValue(this.ListChannelPoint[0].nnumpoint);
          }
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
}
