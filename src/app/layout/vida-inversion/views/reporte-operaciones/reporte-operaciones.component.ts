import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import moment from 'moment';

@Component({
  selector: 'app-reporte-operaciones',
  templateUrl: './reporte-operaciones.component.html',
  styleUrls: ['./reporte-operaciones.component.scss']

})

export class ReporteOperacionesComponent implements OnInit {
  foundResults: any;
  CONSTANTS: any = VidaInversionConstants;
  cur_usr: any;

  filterDate = {
    startDate: moment().startOf('month'),
    endDate: moment().endOf('month'),
  }

  search_params = {
    start_date_options: {
      start_date: new Date(),
      min_start_date: new Date(),
      max_start_date: new Date(),
      start_date_disabled: null,
      validate_start_date: false,
      customClass: [],
    },
    end_date_options: {
      end_date: new Date(),
      min_end_date: new Date(),
      max_end_date: new Date(),
      end_date_disabled: null,
      validate_end_date: false,
      customClass: [],
    },
  }

  // FORMULARIO Y FILTROS
  formData = {
    policy: '',
    policyState: 'Todos',
    dateType: '', // 'EMISION' o 'MOVIMIENTO'
    emissionStartDate: new Date(),
    emissionEndDate: new Date(),
    movementStartDate: new Date(),
    movementEndDate: new Date(),
    startDate: new Date(),
    endDate: new Date()
  };
  private pollingAttempts = 0;
  private readonly POLLING_INTERVAL_MS = 5000; // 5 segundos
  private readonly MAX_POLLING_ATTEMPTS = 100; // 5 minutos máximo
  private pollingInterval: any;
  isGenerating: boolean = false;
  private currentReportId: string = '';
  timeoutMessageShown: boolean = false;

  constructor(public atp_report_service: AtpReportService) {
  }

  async ngOnInit() {
    this.cur_usr = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  changeStartDate(event) {
    this.search_params.start_date_options.validate_start_date = false;
    this.search_params.end_date_options.validate_end_date = false;
    this.search_params.start_date_options.customClass = [];
    this.search_params.end_date_options.customClass = [];

    if (event > this.search_params.end_date_options.end_date) {
      this.search_params.start_date_options.validate_start_date = true;
      this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
    }

    if (this.search_params.end_date_options.end_date < event) {
      this.search_params.end_date_options.validate_end_date = true;
      this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
    }
  }

  changeEndDate(event) {
    this.search_params.start_date_options.validate_start_date = false;
    this.search_params.end_date_options.validate_end_date = false;
    this.search_params.start_date_options.customClass = [];
    this.search_params.end_date_options.customClass = [];

    if (this.search_params.start_date_options.start_date > event) {
      this.search_params.start_date_options.validate_start_date = true;
      this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
    }

    if (event < this.search_params.start_date_options.start_date) {
      this.search_params.end_date_options.validate_end_date = true;
      this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
    }
  }

  formatLocalDate(date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date - tzOffset);

    return localDate.toISOString().split('T')[0];
  }


  async createReportCab() {
    this.search_params.start_date_options.validate_start_date = false;
    this.search_params.end_date_options.validate_end_date = false;
    this.search_params.start_date_options.customClass = [];
    this.search_params.end_date_options.customClass = [];

    if (this.search_params.start_date_options.start_date > this.search_params.end_date_options.end_date) {
      this.search_params.start_date_options.validate_start_date = true;
      this.search_params.start_date_options.customClass = ['border-danger', 'text-danger'];
    }

    if (this.search_params.end_date_options.end_date < this.search_params.start_date_options.start_date) {
      this.search_params.end_date_options.validate_end_date = true;
      this.search_params.end_date_options.customClass = ['border-danger', 'text-danger'];
    }

    if (!this.search_params.start_date_options.validate_start_date && !this.search_params.end_date_options.validate_end_date) {
      const request_report = {
        Nbranch: this.CONSTANTS.RAMO,
        Nproduct: this.CONSTANTS.COD_PRODUCTO,
        Ntype_report: 3,
        Ddate_start_report: this.formatLocalDate(this.search_params.start_date_options.start_date),
        Ddate_end_report: this.formatLocalDate(this.search_params.end_date_options.end_date),
        Nusercode: this.cur_usr?.id
      }

      const dStart = moment(this.search_params.start_date_options.start_date).format('DD/MM/YYYY');
      const dEnd = moment(this.search_params.end_date_options.end_date).format('DD/MM/YYYY');

      console.log('date start not formamted:', this.search_params.start_date_options.start_date);


      Swal.fire({
        title: 'Advertencia',
        text: `Está seguro que desea generar el reporte comercial con el rango de fechas del ${dStart} al ${dEnd}?`,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      }).then(
        async result => {
          if (result.isConfirmed) {
            this.isGenerating = true;

            console.log('objeecto request:', request_report);
            await this.atp_report_service.CreateProductionReportForOperations(request_report).toPromise().then(async (res) => {
              if (res.Ncode == 0) {
                this.currentReportId = res.data;
                if (this.currentReportId == "") {
                  Swal.fire('Generación de reporte', 'No se pudo generar el reporte, por favor intente nuevamente.', 'error');
                  this.isGenerating = false;
                  return;
                }
                this.startPolling();
              }
              else {
                Swal.fire('Generación de reporte', res.Smessage, 'error');
                this.isGenerating = false;
              }
            }).catch((err) => {
              console.log(err);
              Swal.fire('Generación de reporte', err.toString(), 'error');
              this.isGenerating = false;
            });
          }
          else if (result.isDismissed) {
            this.isGenerating = false;
          }
        }
      )
    }
  }

  // =============================================================
  // POLLING DEL ESTADO DEL REPORTE
  // =============================================================
  startPolling() {
    this.timeoutMessageShown = false;
    this.pollingAttempts = 0;
    this.pollingInterval = setInterval(() => {
      this.checkReportStatus();
    }, this.POLLING_INTERVAL_MS);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  formatDateForBackend(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Check status before downloading
  async checkReportStatus() {
    try {
      this.isGenerating = true;
      this.pollingAttempts++;

      if (this.pollingAttempts > this.MAX_POLLING_ATTEMPTS) {
        this.stopPolling();
        this.isGenerating = false;

        // show the timeout message just once
        if (!this.timeoutMessageShown) {
          Swal.fire('Timeout', 'El reporte está tomando más tiempo del esperado. Por favor consulte el estado más tarde.', 'warning');
          this.timeoutMessageShown = true;
        }
        return;
      }

      const request_report = {
        Nbranch: this.CONSTANTS.RAMO,
        Nproduct: this.CONSTANTS.COD_PRODUCTO,
        Id_report: this.currentReportId, // Usar el ID del reporte actual
        Ntype_report: 3,
      }

      const response = await this.atp_report_service.GetStatusReportNew(request_report).toPromise();
      if (response && response.length > 0) {
        const report = response[0];

        // NSTATUS: 1=En proceso, 2=Completado, 3=Error
        switch (report.NSTATUS) {
          case 2: // Completado
            this.stopPolling();
            this.isGenerating = false;
            Swal.close();

            if (report.SRUTA_DESTINO) {
              this.downloadReport(report.SRUTA_DESTINO);
              Swal.fire('Éxito', 'Reporte generado y descargado correctamente', 'success');
            } else {
              Swal.fire('Completado', 'Reporte completado pero sin archivo disponible', 'info');
            }
            break;

          case 3: // Con errores
            this.stopPolling();
            this.isGenerating = false;
            Swal.close();
            Swal.fire('Error', report.SLOG_MESSAGE || 'Error al generar el reporte', 'error');
            break;

          case 4: // Error fatal
            this.stopPolling();
            this.isGenerating = false;
            Swal.close();
            Swal.fire('Error', report.SLOG_MESSAGE || 'Error crítico en el procesamiento', 'error');
            break;

          case 5: // Sin datos
            this.stopPolling();
            this.isGenerating = false;
            Swal.close();
            Swal.fire('Sin datos', report.SLOG_MESSAGE || 'No se encontraron datos para los filtros seleccionados', 'info');
            break;

          case 1: // En proceso
          default:
            // Continuar polling
            break;
        }
      }
    } catch (error) {
      console.error('Error consultando estado:', error);
      this.stopPolling();
      this.isGenerating = false;
      Swal.fire('Error', 'Error al consultar el estado del reporte', 'error');
    }
  }

  downloadReport(filePath: string) {
    try {
      const downloadData = {
        ID_REPORT: this.currentReportId,
        SMAIN_ROUTE: filePath || '' // Ruta principal del archivo
      };

      this.atp_report_service.DownloadFileReport(downloadData).subscribe(
        (response) => {
          if (response && response.Ofile) {
            // Convertir Base64 a Blob y descargar
            const byteCharacters = atob(response.Ofile);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Crear link de descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.currentReportId}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } else {
            console.error('No se recibió el archivo en la respuesta');
            Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
          }
        },
        (error) => {
          console.error('Error descargando archivo:', error);
          Swal.fire('Error', 'Error al descargar el archivo', 'error');
        }
      );
    } catch (error) {
      console.error('Error en descarga:', error);
      Swal.fire('Error', 'Error al procesar la descarga', 'error');
    }
  }

  get isGenerateDisabled(): boolean {
    return (this.search_params.start_date_options.validate_start_date &&
      this.search_params.end_date_options.validate_end_date) ||
      this.isGenerating;
  }
}
