import { Component, OnInit } from '@angular/core';
import { InterfaceMonitoringCBCOService } from '../../../../backoffice/services/interface-monitoring/interface-monitoring-cbco.service';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import swal from 'sweetalert2';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-devoluciones-report-cierre',
  templateUrl: './devoluciones-report-cierre.component.html',
  styleUrls: ['./devoluciones-report-cierre.component.css'],
})
export class DevolucionesReportCierreComponent implements OnInit {
  products: any = [];
  opcionesProductos: any = [];
  inputs: any = [];
  seacsaDirecto: boolean = true;
  seacsaAFP: boolean = false;
  ahorroDirecto: boolean = false;
  productCanal: number;
  listActions: any = [];
  pagos: any = [];
  listprovisiones: any = [];
  detalles: any = [];
  origen: any = [];
  pagoSiniestro: any = [];
  montoTotales: any = [];
  ntypeReport: any = [];
  checked: boolean = false;
  checkedProc: any = {};
  checkedProcSend: any[] = [];
  NIDPROFILE: number;
  NUSERCODE: any;
  flagPendiente: boolean = false;
  pago = {
    P_NNUMORI: 0,
    P_NTYPEOP: 0,
    P_SPOLIZA: '',
    P_DFECINI: new Date(),
    P_DFECFIN: new Date(),
    P_DFEC_APROB: new Date(), 
  };
  montoTotal: number;
  saludTotal: number;
  retencionTotal: number;
  liquidoTotal: number;
  maxPeriodo: string;
  montoSoles = '';
  montoDolares = '';

  mostrarMontos: boolean = false;
  mostrarFecha: boolean = false; 

  listToShow: any = [];
  currentPage = 1;
  maxSize = 10;
  itemsPerPage = 15;
  totalItems = 0;

  listToShowDet: any = [];
  currentPageDet = 1;
  maxSizeDet = 10;
  itemsPerPageDet = 15;
  totalItemsDet = 0;
  maxDate: Date = moment().add(30, 'days').toDate(); 
  diaActual = moment(new Date()).toDate();
  diaAprob: Date = moment().toDate(); 
  isLoading: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;
  bsConfigFechaAprobacion: Partial<BsDatepickerConfig>; 

  constructor(
    private modalService: NgbModal,
    private InterfaceMonitoringCBCOService: InterfaceMonitoringCBCOService,
    private rentasService: RentasService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
    this.bsConfigFechaAprobacion = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
        minDate: this.diaAprob, // Fecha mínima es hoy
        maxDate: this.maxDate, // Fecha máxima es hoy + 30 días
      }
    );
  }

  async ngOnInit() {
    this.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
    this.inputs.P_NPRODUCT = '0-0';
    this.inputs.P_NREPORT = 0;
    this.initDates();
    this.getParams();
    ///this.getProducts();
  }

  initDates = () => {
    const hoy = new Date();
    // Primer día del mes actual
    this.inputs.P_DFECINI = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Último día del mes actual
    this.inputs.P_DFECFIN = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  };

  getParams = () => {
    let $origen = this.rentasService.getListProducts();
    let $ntypeReport = this.rentasService.PD_GET_TYPE_REPORT_DEVO();
    ///let $pagoSiniestro = this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: 0 });
    //let $montoTotales = this.InterfaceMonitoringCBCOService.MostrarTotalesMontos({ P_NNUMORI: 0 });
    return forkJoin([
      $origen,
      $ntypeReport /*, $pagoSiniestro, $montoTotales*/,
    ]).subscribe(
      (res) => {
        this.origen = res[0].C_TABLE;
        this.ntypeReport = res[1].C_TABLE;
        //   this.pagoSiniestro = res[1].Result.P_LIST;
        //  this.montoTotales = res[2].Result.P_LIST;
      },
      (err) => {
        swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los parámetros.',
          'error'
        );
      }
    );
  };

  pageChanged = (currentPage) => {
    this.currentPage = currentPage;
    this.listToShow = this.listprovisiones.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  };

  pageChangedDet = (currentPageDet) => {
    this.currentPageDet = currentPageDet;
    this.listToShowDet = this.detalles.slice(
      (this.currentPageDet - 1) * this.itemsPerPageDet,
      this.currentPageDet * this.itemsPerPageDet
    );
  };

  downloadRes = () => {
    if (this.inputs.P_NREPORT == 0) {
      swal.fire(
        'Información',
        'Debe seleccionar al menos un reporte.',
        'warning'
      );
      return;
    }
     //OBTIENE LA CONFIGURACION DEL REPORTE
    const codigoReporte = this.inputs.P_NREPORT.split('-');
    this.inputs.NREPORT = codigoReporte[0];
    this.inputs.SFILENAME = codigoReporte[1];
    this.inputs.SPATHREPORT = codigoReporte[2];

    if (new Date(this.inputs.P_DFECINI) > new Date(this.inputs.P_DFECFIN) && this.inputs.NREPORT != 3) {
      swal.fire(
        'Información',
        'La fecha de inicio no puede ser mayor a la fecha de fin.',
        'warning'
      );
      return;
    }
    const codigo = this.inputs.P_NPRODUCT.split('-');
    this.inputs.branch = codigo[0];
    this.inputs.producto = codigo[1];
    this.GetDataReportDevolucion();
  };

  GetDataReportDevolucion = () => {
    const data = {
      P_NBRANCH: this.inputs.branch,
      P_NPRODUCT: this.inputs.producto,
      P_NREPORT: this.inputs.NREPORT,
      P_DATEINI: this.inputs.P_DFECINI,
      P_DATEEND: this.inputs.P_DFECFIN,
      P_SFILENAME: this.inputs.SFILENAME,
      P_SPATHREPORT: this.inputs.SPATHREPORT,
    };

    ///GetDataReportDevolucion
    this.rentasService.GetDataReportDevolucion(data).subscribe(
      (res) => {
        let _data = res;
        if (_data.response == 0) {
          if (_data.Data != null) {
            const file = new File(
              [this.obtenerBlobFromBase64(_data.Data, '')],
              this.inputs.SFILENAME,
              { type: 'text/xls' }
            );
            FileSaver.saveAs(file);
          }
        } else {
          Swal.fire({
            title: 'Información',
            text: _data.Data,
            icon: 'info',
            confirmButtonText: 'Continuar',
            allowOutsideClick: false,
          });
        }
      },
      (err) => {
        this.isLoading = false;
        swal.fire(
          'Información',
          'Ha ocurrido un error al obtener el reporte.',
          'error'
        );
      }
    );
  };

selectOption = (valores: string) => {
     this.flagPendiente = false;
     console.log("HABILITAR:"+valores);
    const codigoReporte = valores.split('-');
    this.inputs.NREPORTV = codigoReporte[0];
        if (this.inputs.NREPORTV=='3'){
            this.flagPendiente = true;
        }
        console.log("HABILITAR:"+this.flagPendiente);
    }

  obtenerBlobFromBase64 = (b64Data: string, contentType: string) => {
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
  };
  getProducts() {
    //SERVICIO PARA LISTAR LOS PRODUCTOS
    this.rentasService.getListProducts().subscribe({
      next: (response) => {
        this.products = response.C_TABLE;

        this.opcionesProductos = this.products.map((product) => {
          return {
            codigo: `${product.NBRANCH}-${product.NPRODUCT}`,
            valor: product.SPRODUCT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  limitLength(event: any, maxLength: number) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
      // Actualiza el modelo si se trunca manualmente
      this.inputs.P_SPOLIZA = input.value;
    }
  }
  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }
}