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
  selector: 'app-devoluciones-provision-automatica',
  templateUrl: './devoluciones-provision-automatica.component.html',
  styleUrls: ['./devoluciones-provision-automatica.component.scss'],
})
export class DevolucionesProvisionAutomaticaComponent implements OnInit {
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
  statusApro: any = [];
  checked: boolean = false;
  checkedProc: any = {};
  checkedProcSend: any[] = [];
  NIDPROFILE: number;
  NUSERCODE: any;
  pago = {
    P_NNUMORI: 0,
    P_NTYPEOP: 0,
    P_SPOLIZA: '',
    P_DFECINI: new Date(),
    P_DFECFIN: new Date(),
    P_DFEC_APROB: new Date(),
  };
  montoTotal: number;
  NFLAG: number;
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

  onFechaAprobacionChange(event: Date) {
    if (event < this.diaAprob || event > this.maxDate) {
      alert(
        'La fecha seleccionada no es válida. Debe estar dentro de los próximos 30 días.'
      );
      this.pago.P_DFECFIN = null;
    }
  }

  async ngOnInit() {
    this.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
    //OBTIENE LOS PERMISOS
    try {
      await this.getProductCanal();
      await this.NidProfile();
      this.getListActions();
    } catch (error) {
      console.error(error);
    }
    this.inputs.P_SPOLIZA = '';
    this.inputs.P_NPRODUCT = '0-0';
    this.inputs.P_SSTATUS = 0;
    this.initDates();
    this.getParams();
    ///this.getProducts();
  }

  getProductCanal(): Promise<void> {
    return new Promise((resolve, reject) => {
      //SERVICIO QUE RECUPERA EL PRODUCTO ACTUAL
      this.rentasService.getProductCanal().subscribe({
        next: (response) => {
          this.productCanal = response.NPRODUCT;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
      });
    });
  }

  NidProfile(): Promise<void> {
    console.log(this.productCanal + '-hola-' + this.NUSERCODE);
    return new Promise((resolve, reject) => {
      //SERVICIO QUE RECUPERA EL ID DEL PERFIL
      this.rentasService
        .getNidProfile({
          P_NPRODUCT: this.productCanal,
          P_NIDUSER: this.NUSERCODE,
        })
        .subscribe({
          next: (response) => {
            this.NIDPROFILE = response.C_TABLE[0].NIDPROFILE;
            resolve();
          },
          error: (error) => {
            console.error(error);
            reject(error);
          },
        });
    });
  }

  getListActions() {
    //SERVICIO QUE RECUPERA LAS ACCIONES PARA EL PERFIL DEL USUARIO ACTUAL TENIENDO EN CUENTA EL PRODUCTO
    this.rentasService
      .getListActions({
        P_NPRODUCT: this.productCanal,
        P_NIDPROFILE: this.NIDPROFILE,
        P_SCODE: '',
      })
      .subscribe({
        next: (response) => {
          this.listActions = response.C_TABLE[0];
          console.log('TIENE' + this.listActions.DESCARGAR_PA);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  initDates = () => {
    this.diaActual = new Date(
      this.diaActual.getFullYear(),
      this.diaActual.getMonth(),
      this.diaActual.getDate()
    );
    this.inputs.P_DFECINI = this.diaActual;
    this.inputs.P_DFECFIN = this.diaActual;
    // Periodo en formato MM/YYYY
    const mes = (this.diaActual.getMonth() + 1).toString().padStart(2, '0'); // agrega cero si es < 10
    const anio = this.diaActual.getFullYear();
    this.inputs.P_SPERIODO = `${anio}-${mes}`;
    this.maxPeriodo = `${anio}-${mes}`;
  };

  getParams = () => {
    let $origen = this.rentasService.getListProducts();
    let $statusApro = this.rentasService.getListStatusApro();
    ///let $pagoSiniestro = this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: 0 });
    //let $montoTotales = this.InterfaceMonitoringCBCOService.MostrarTotalesMontos({ P_NNUMORI: 0 });
    return forkJoin([
      $origen,
      $statusApro /*, $pagoSiniestro, $montoTotales*/,
    ]).subscribe(
      (res) => {
        this.origen = res[0].C_TABLE;
        this.statusApro = res[1].C_TABLE;
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

  search = (i) => {
    this.checked = false;
    ///console.log("valor del proucto:"+this.inputs.P_NPRODUCT);
    const codigo = this.inputs.P_NPRODUCT.split('-');
    this.inputs.branch = codigo[0];
    this.inputs.producto = codigo[1];
    ///if (new Date(this.inputs.P_DFECINI) > new Date(this.inputs.P_DFECFIN)) {
    if (!this.inputs.P_SPERIODO) {
      swal.fire('Información', 'Debe seleccionar un periodo.', 'warning');
      return;
    }
    this.getlistarProvisionAuto(i);
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

  checkAllProc = () => {
    for (var i = 0; i < this.listprovisiones.length; i++) {
      if (this.puedeSeleccionar(this.listprovisiones[i])) {
        this.listprovisiones[i].IS_SELECTED = this.checked;
      } else {
        this.listprovisiones[i].IS_SELECTED = false; // Forzar deselección
      }
    }
    this.getCheckedProcList();
  };

  checkProc = () => {
    this.checked = this.listprovisiones.every(function (item: any) {
      return item.IS_SELECTED == true;
    });
    this.getCheckedProcList();
  };

  getCheckedProcList = () => {
    this.checkedProc = [];
    this.checkedProcSend = [];
    for (var i = 0; i < this.listprovisiones.length; i++) {
      if (this.listprovisiones[i].IS_SELECTED) {
        this.checkedProc.push(this.listprovisiones[i]);
      }
    }
    this.checkedProcSend.push(this.checkedProc);
  };

  limpiar = () => {
    this.checked = false;
    this.inputs.P_SPOLIZA = '';
    this.inputs.P_NPRODUCT = '0-0';
    this.inputs.P_SSTATUS = 0;
    this.inputs.P_DFECINI = this.diaActual;
    this.inputs.P_DFECFIN = this.diaActual;
    this.listprovisiones = [];
  };

  aprobar = () => {
    this.ProcessAprobarProvisionAuto();
  };

  downloadRes = () => {
    if (this.listprovisiones.length == 0) {
      swal.fire(
        'Información',
        'Debe realizar una búsqueda para exportar.',
        'warning'
      );
      return;
    }
    this.GetDataReportProvisionAuto();
  };

  GetDataReportProvisionAuto = () => {
    const data = {
      P_NBRANCH: this.inputs.branch,
      P_NPRODUCT: this.inputs.producto,
      P_NPOLICY: this.inputs.P_SPOLIZA,
      P_SPERIODO: this.inputs.P_SPERIODO,
      //P_DATEINI: this.inputs.P_DFECINI,
      /// P_DATEEND: this.inputs.P_DFECFIN,
      P_NSTATUS: this.inputs.P_SSTATUS,
    };

    ///GetDataReportProvisionAuto
    this.rentasService.GetDataReportProvisionAuto(data).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.response == 0) {
          if (res.Data != null) {
            const file = new File(
              [this.obtenerBlobFromBase64(res.Data, '')],
              'Reporte_Provision_Automaticas.xlsx',
              { type: 'text/xls' }
            );
            FileSaver.saveAs(file);
          }
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
  getlistarProvisionAuto = (i) => {
    const data = {
      P_NBRANCH: this.inputs.branch,
      P_NPRODUCT: this.inputs.producto,
      P_NPOLICY: this.inputs.P_SPOLIZA,
      P_SPERIODO: this.inputs.P_SPERIODO,
      //P_DATEINI: this.inputs.P_DFECINI,
      /// P_DATEEND: this.inputs.P_DFECFIN,
      P_NSTATUS: this.inputs.P_SSTATUS,
    };
    this.rentasService.getlistarProvisionAuto(data).subscribe({
      next: (response) => {
        if (response.P_NCODE == 0) {
          this.currentPage = 1;
          this.listprovisiones = response.C_TABLE;
          this.calcularTotales();
          this.totalItems = this.listprovisiones.length;
          this.listToShow = this.listprovisiones.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
          if (this.listprovisiones.length == 0 && i == 1) {
            swal.fire(
              'Información',
              'No se encontraron coincidencias en la búsqueda.',
              'warning'
            );
          }
        } else {
          swal.fire('Información', response.P_SMESSAGE, 'error');
        }
      },
      error: (error) => {
        swal.fire(
          'Información',
          'Ha ocurrido un error al obtener las Provisones Automáticas.',
          'error'
        );
      },
    });
  };
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
  //PROCESO DE APROBAR
  ProcessAprobarProvisionAuto() {
    /* const mensajeParts2: [SweetAlertIcon, string, string] =
          this.separateString(mensaje2);*/

    let temp = this.listprovisiones.filter((item) => item.IS_SELECTED == true);
    if (temp.length > 0) {
      swal
        .fire({
          title: 'Alerta',
          icon: 'question',
          showDenyButton: true,
          text: '¿Esta seguro de realizar la acción?',
          confirmButtonText: 'Si',
          denyButtonText: `No`,
        })
        .then((result) => {
          if (result.isConfirmed) {
            //console.log("ENTRO A VALIDACION DE CONFORMACION");
            ///this.confirmaraprobar();
            this.confirmarProvision();
          }
        });
    } else {
      swal.fire(
        'Información',
        'Debe seleccionar al menos un registro.',
        'warning'
      );
    }
  }
  totalSoles: number = 0;
  totalDolares: number = 0;

  calcularTotales() {
    this.totalSoles = 0;
    this.totalDolares = 0;

    this.listprovisiones.forEach((item) => {
      ///console.log("moneda"+item.NCURRENCY);
      if (item.NCURRENCY === 1 && item.NSTATUS != '3') {
        this.totalSoles += +item.MONTO_PROVISION || 0;
      } else if (item.NCURRENCY === 2 && item.NSTATUS != '3') {
        this.totalDolares += +item.MONTO_PROVISION || 0;
      }
    });
  }

  puedeSeleccionar(item: any): boolean {
    if (!item || !item.FECHA_FIN) return false;

    const fechaItem = new Date(item.FECHA_FIN);
    //VALIDO QUE SEA LA HORA ACTUAL
    const hoy = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
    );

    const mismoMes =
      fechaItem.getMonth() === hoy.getMonth() &&
      fechaItem.getFullYear() === hoy.getFullYear();
    //ESTADOS VALIDO  PENDIENTE Y ERROR(PARA QUE LO VUELVA A REALIZAR)
    const estadoValido = item.NSTATUS == '1' || item.NSTATUS == '4';

    return mismoMes && estadoValido;
  }

  async confirmarProvision() {
    const result = await swal.fire({
      title: '¿Está seguro de aprobar los registros seleccionados?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    });

    if (!result.value) {
      return;
    }

    this.isLoading = true;
    let aprobadosArray = { P_LIST: [] };
    let ListProvisionAutoArray = { Provisorios: [] };
    this.inputs.DPROCESS = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
    );
    this.rentasService
      .EquivalenciaUsuario({
        dni: JSON.parse(localStorage.getItem('currentUser')).dni,
        token: '',
      })
      .subscribe({
        next: async (response) => {
          if (response.numbermsg != 0) {
            swal.fire('Información', response.msg, 'error');
            this.isLoading = false;
          } else {
            for (let i = 0; i < this.checkedProcSend[0].length; i++) {
              const InivAL = {
                P_NID_DEV: this.checkedProcSend[0][i].NID_DEV,
                P_DPROCESS: this.inputs.DPROCESS,
                P_NUSERCODE:JSON.parse(localStorage.getItem('currentUser')).id,
              };

              try {
                // 🔹 Esperamos la validación antes de continuar
                const response: any = await this.rentasService
                  .PD_VAL_DEV_AUTOMATIC(InivAL)
                  .toPromise();

                if (response.P_NCODE !== 0) {
                  // ❌ Si hay error, salta al siguiente registro
                  continue;
                }

                // ✅ Solo si pasa validación agregamos a los arrays
                const temp = {
                  P_NID_DEV: this.checkedProcSend[0][i].NID_DEV,
                  P_DPROCESS: this.inputs.DPROCESS,
                  P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))
                    .id,
                };

                const ProvisionAuto = {
                  ramo: '',
                  cod_producto: this.checkedProcSend[0][i].SPRODUCT || '',
                  poliza: this.checkedProcSend[0][i].POLIZA || '',
                  moneda: this.checkedProcSend[0][i].MONEDA || '',
                  monto: this.checkedProcSend[0][i].MONTO_PROVISION || 0,
                  p_nid_dev: this.checkedProcSend[0][i].NID_DEV,
                };

                aprobadosArray.P_LIST.push(temp);
                ListProvisionAutoArray.Provisorios.push(ProvisionAuto);
              } catch (error) {
                console.error('Error en validación inicial:', error);
                this.isLoading = false;
                return;
              }
            }

            const dataListEnd = {
              Provisorios: ListProvisionAutoArray.Provisorios,
              usuario: response.data[0].COD_USUARIO,//JSON.parse(localStorage.getItem('currentUser')).username,
              provi: this.inputs.DPROCESS,
              fec_sol: this.inputs.DPROCESS,
            };

            console.log(
              '✅ Objeto final enviado:',
              JSON.stringify(dataListEnd, null, 2)
            );
            if (
              ListProvisionAutoArray.Provisorios &&
              ListProvisionAutoArray.Provisorios.length > 0
            ) {
              try {
                // 🔹 Llamado de API de provisorios
                const response = await this.rentasService
                  .updApiProvisorioDevolucion(dataListEnd)
                  .toPromise();
                console.log(response);

                // 🔹 Si todo bien, aprobamos provisiones
                const responseAprob = await this.rentasService
                  .updAprobarProvisionAuto(aprobadosArray)
                  .toPromise();

                if (responseAprob.P_NCODE == 0) {
                  swal.fire(
                    'Información',
                    '!La acción se realizó!. Por favor de revisar los resultados.',
                    'success'
                  );
                  this.checkedProcSend[0] = 0;
                  this.checked = false;
                  this.isLoading = false;
                  this.search(2);
                } else {
                  swal.fire('Información', responseAprob.P_SMESSAGE, 'error');
                  this.isLoading = false;
                }
              } catch (error) {
                console.error(error);
                swal.fire(
                  'Información',
                  'Ha ocurrido un error en el proceso de aprobación.',
                  'error'
                );
                this.isLoading = false;
              }
            } else {
              swal.fire(
                'Información',
                'No se pudo continuar debido a que existen validaciones que lo impiden. Por favor, revise los resultados.',
                'warning'
              );
              this.checkedProcSend[0] = 0;
              this.checked = false;
              this.isLoading = false;
              this.search(2);
            }
          }
        },
        error: (error) => {
          console.error(error);
          swal.fire(
            'Información',
            'Ha ocurrido un error en el proceso de aprobación.',
            'error'
          );
          this.isLoading = false;
        },
      });
  }
}
