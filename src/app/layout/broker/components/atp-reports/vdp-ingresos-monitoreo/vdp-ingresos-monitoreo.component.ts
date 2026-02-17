import { PremiumReportService } from './../../../services/premiumReports/premium-report.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { ReportIngresosService, ReportStatusIngresosBM, FileReportIngresosBM } from '../../../services/report-ingresos/report-ingresos.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-vdp-ingresos-monitoreo',
  templateUrl: './vdp-ingresos-monitoreo.component.html',
  styleUrls: ['./vdp-ingresos-monitoreo.component.css']
})
export class VdpIngresosMonitoreoComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  isLoadingSearch: boolean = false;
  isLoadingDownload: Map<string, boolean> = new Map();

  // REQ 13-08-2025 DVP - Control de autorización granular
  isUserAuthorized: boolean = false;
  isCheckingAuthorization: boolean = true;
  authorizationMessage: string = '';

  listToShow: any = [];
  processHeaderList: any = [];
  
  ListRamo: any = [];
  ListState: any = [];
  IdRamo: any = '';
  IdState: any = '';
  
  currentPage = 1;
  rotate = true;
  maxSize = 10;
  itemsPerPage = 6;
  totalItems: any = [];
  
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  
  UnselectedItemMessage: any = '';
  IdReport: any = '';
  SearchType: any = '';
  SearchActivated = false;
  RamoOff = false;
  StateOff = false;
  StartDateOff = false;
  EndDateOff = false;
  IdReportOff = false;
  NameMessage: any = '';

  usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
  username = JSON.parse(localStorage.getItem('currentUser'))['username'];

  private pollingIntervals: Map<string, any> = new Map();
  private activePolling: Set<string> = new Set();
  
  // COMENTADO - Variables relacionadas con auto-refresh
  /*
  private autoRefreshEnabled: boolean = true;
  private autoRefreshInterval: any;
  */

  // COMENTADO - Variables del dashboard de estadísticas
  /*
  dashboardStats = {
    total: 0,
    procesando: 0,
    completados: 0,
    errores: 0,
    sinDatos: 0
  };
  */

  private notificationQueue: Array<{id: string, type: string, message: string}> = [];
  lastSearchTime: Date | null = null;

  constructor(
    private modalService: NgbModal, 
    private reportIngresosService: ReportIngresosService,
    private premiumReportService: PremiumReportService
  ) {
    this.bsConfig = Object.assign({}, {
      dateInputFormat: "DD/MM/YYYY",
      locale: "es",
      showWeekNumbers: false
    });
  }

  ngOnInit() {
    this.checkUserAuthorization();
    this.initializeComponent();
  }

  // REQ 13-08-2025 DVP - Verificación de autorización granular
    private checkUserAuthorization() {
    const currentUser = this.getCurrentUser();
    
    this.reportIngresosService.CheckUserAuthorization({
        SUSER: currentUser,
        NIDRESOURCE: 992 // ID del recurso "Monitoreo de Reportes de Ingresos"
    }).subscribe(
        response => {
        this.isUserAuthorized = response.NAUTHORIZED === 1;
        this.isCheckingAuthorization = false;
        
        if (!this.isUserAuthorized) {
            this.authorizationMessage = 'Su perfil no cuenta con permisos para utilizar esta funcionalidad. Para obtener acceso, contacte al administrador del sistema.';
        }
        },
        error => {
        console.error('Error verificando autorización:', error);
        this.isUserAuthorized = false;
        this.isCheckingAuthorization = false;
        this.authorizationMessage = 'No se pudo verificar los permisos de acceso. Contacte al administrador del sistema.';
        }
    );
    }

    //Obtener usuario actual
    private getCurrentUser(): string {
    try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
        return currentUser?.username || 'SYSTEM';
    } catch {
        return 'SYSTEM';
    }
    }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeComponent() {
    this.getRamosIngresos();
    this.getStatusIngresos();
    this.initializeDefaults();
    // COMENTADO - Auto-refresh setup
    // this.setupAutoRefresh();
  }

  private initializeDefaults() {
    this.IdRamo = "-1";
    this.IdState = "-1";
    this.RamoOff = false;
    this.StateOff = false;
    this.StartDateOff = false;
    this.EndDateOff = false;
    this.IdReportOff = true;
    this.SearchActivated = false;
    
    this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
  }

  // COMENTADO - Método de auto-refresh
  /*
  private setupAutoRefresh() {
    this.autoRefreshInterval = setInterval(() => {
      if (this.autoRefreshEnabled && this.processHeaderList.length > 0) {
        const hasProcessingReports = this.processHeaderList.some(r => r.codEstado === 1);
        
        if (hasProcessingReports) {
          this.refreshCurrentSearch();
        }
      }
    }, 15000);
  }
  */

  private refreshCurrentSearch() {
    if (this.processHeaderList.length === 0 || this.isLoadingSearch) return;

    const searchData: ReportStatusIngresosBM = {
      ID_REPORT: this.SearchActivated ? this.IdReport?.trim() : null,
      NBRANCH: this.IdRamo === '' || this.IdRamo === '-1' ? 0 : parseInt(this.IdRamo),
      DDATE_START_REPORT: this.formatDateToString(this.bsValueIni),
      DDATE_END_REPORT: this.formatDateToString(this.bsValueFin),
      NTYPE_REPORT: 6,
      P_SUSERNAME: this.username
    };

    this.reportIngresosService.GetStatusReportIngresos(searchData).subscribe(
      res => {
        this.updateReportsWithAnimation(res);
      },
      error => {
        console.error('Error en auto-refresh:', error);
      }
    );
  }

  getRamosIngresos() {
    this.reportIngresosService.GetBranchList().subscribe(
      res => {
        this.ListRamo = res || [];
      },
      error => {
        console.error('Error cargando ramos:', error);
        this.ListRamo = [
          { NBRANCH: 61, SDESCRIPT: 'ACCIDENTES PERSONALES' },
          { NBRANCH: 64, SDESCRIPT: 'ASISTENCIA MÉDICA' },
          { NBRANCH: 66, SDESCRIPT: 'SOAT' },
          { NBRANCH: 71, SDESCRIPT: 'VIDA LEY' },
          { NBRANCH: 77, SDESCRIPT: 'SCTR' },
          { NBRANCH: 80, SDESCRIPT: 'VEHICULAR' }
        ];
      }
    );
  }

  getStatusIngresos() {
    this.ListState = [
      { NSTATUSPROC: 1, SDESCRIPTION: 'PROCESANDO' },
      { NSTATUSPROC: 2, SDESCRIPTION: 'COMPLETADO' },
      { NSTATUSPROC: 3, SDESCRIPTION: 'ERROR' },
      { NSTATUSPROC: 4, SDESCRIPTION: 'SIN DATOS' }
    ];
  }

  setControlsForProcess(event: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.SearchActivated = true;
      this.IdReportOff = false;
      this.RamoOff = true;
      this.StateOff = true;
      this.StartDateOff = true;
      this.EndDateOff = true;
      
      this.IdRamo = "-1";
      this.IdState = "-1";
    } else {
      this.SearchActivated = false;
      this.IdReportOff = true;
      this.RamoOff = false;
      this.StateOff = false;
      this.StartDateOff = false;
      this.EndDateOff = false;
      
      this.IdReport = '';
    }
  }

  GetProcess() {
    if (!this.isUserAuthorized) {
        swal.fire({
        title: 'Acceso Restringido',
        text: this.authorizationMessage,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
        });
        return;
    }

    const validation = this.validateSearchForm();
    if (!validation.isValid) {
      this.showValidationError(validation.message!);
      return;
    }

    this.isLoadingSearch = true;
    this.isLoading = true;
    this.listToShow = [];
    this.processHeaderList = [];
    this.currentPage = 1;
    this.lastSearchTime = new Date();

    this.stopAllPolling();

    const searchData: ReportStatusIngresosBM = {
      ID_REPORT: this.SearchActivated ? this.IdReport?.trim() : null,
      NBRANCH: this.IdRamo === '' || this.IdRamo === '-1' ? 0 : parseInt(this.IdRamo),
      DDATE_START_REPORT: this.formatDateToString(this.bsValueIni),
      DDATE_END_REPORT: this.formatDateToString(this.bsValueFin),
      NTYPE_REPORT: 6,
      P_SUSERNAME: this.username
    };

    this.reportIngresosService.GetStatusReportIngresos(searchData).subscribe(
      res => {
        this.processSearchResults(res);
      },
      error => {
        this.handleSearchError(error);
      }
    );
  }

  private validateSearchForm(): { isValid: boolean, message?: string } {
    if (this.SearchActivated) {
      if (!this.IdReport || this.IdReport.trim().length === 0) {
        return { 
          isValid: false, 
          message: "Debe ingresar el ID del reporte para realizar la búsqueda específica." 
        };
      }
      
      if (this.IdReport.trim().length < 10) {
        return { 
          isValid: false, 
          message: "El ID del reporte debe tener al menos 10 caracteres." 
        };
      }
    } else {
      if (new Date(this.bsValueIni) > new Date(this.bsValueFin)) {
        return { 
          isValid: false, 
          message: "La fecha de inicio no debe ser mayor a la fecha de fin." 
        };
      }

      const daysDiff = Math.ceil(
        (new Date(this.bsValueFin).getTime() - new Date(this.bsValueIni).getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 365) {
        return { 
          isValid: false, 
          message: "El rango de fechas no puede ser mayor a 1 año." 
        };
      }

      if (daysDiff < 0) {
        return { 
          isValid: false, 
          message: "El rango de fechas no es válido." 
        };
      }
    }

    return { isValid: true };
  }

  private processSearchResults(res: any[]) {
    if (res && res.length > 0) {
      this.processHeaderList = res.map(item => ({
        SIDREPORT: item.SIDREPORT,
        SUSERNAME: item.SUSERNAME,
        DINIREP: item.DINIREP,
        DFINREP: item.DFINREP,
        NSTATUSPROC: item.NSTATUSPROC,
        NBRANCH: item.NBRANCH,
        SBRANCH_NAME: item.SBRANCH_NAME,
        id: item.SIDREPORT,
        desUsuario: item.SUSERNAME,
        fecInicio: this.formatDateFromAPI(item.DINIREP),
        fecFin: this.formatDateFromAPI(item.DFINREP),
        codEstado: item.NSTATUSPROC,
        desEstado: this.getStatusDescription(item.NSTATUSPROC),
        desRamo: item.SBRANCH_NAME?.trim() || 'N/A',
        codTipo: 'INGRESOS',
        isUpdated: false
      }));

      this.totalItems = this.processHeaderList.length;
      this.listToShow = this.processHeaderList.slice(0, this.itemsPerPage);
      
      // COMENTADO - Actualización de estadísticas del dashboard
      // this.updateDashboardStats();
      
      this.startPollingForProcessingReports();
      this.showSearchSuccessMessage();
    } else {
      this.showNoResultsMessage();
    }
    
    this.isLoadingSearch = false;
    this.isLoading = false;
  }

  private updateReportsWithAnimation(newReports: any[]) {
    const processedReports = newReports.map(item => ({
      SIDREPORT: item.SIDREPORT,
      SUSERNAME: item.SUSERNAME,
      DINIREP: item.DINIREP,
      DFINREP: item.DFINREP,
      NSTATUSPROC: item.NSTATUSPROC,
      NBRANCH: item.NBRANCH,
      SBRANCH_NAME: item.SBRANCH_NAME,
      id: item.SIDREPORT,
      desUsuario: item.SUSERNAME,
      fecInicio: this.formatDateFromAPI(item.DINIREP),
      fecFin: this.formatDateFromAPI(item.DFINREP),
      codEstado: item.NSTATUSPROC,
      desEstado: this.getStatusDescription(item.NSTATUSPROC),
      desRamo: item.SBRANCH_NAME?.trim() || 'N/A',
      codTipo: 'INGRESOS',
      isUpdated: false
    }));

    processedReports.forEach(newReport => {
      const existingReport = this.processHeaderList.find(r => r.SIDREPORT === newReport.SIDREPORT);
      if (existingReport && existingReport.NSTATUSPROC !== newReport.NSTATUSPROC) {
        newReport.isUpdated = true;
        this.showStatusChangeNotification(newReport);
      }
    });

    this.processHeaderList = processedReports;
    
    // COMENTADO - Actualización de estadísticas del dashboard
    // this.updateDashboardStats();
    
    this.updateCurrentPage();
  }

  // COMENTADO - Método que actualiza las estadísticas del dashboard
  /*
  private updateDashboardStats() {
    this.dashboardStats = {
      total: this.processHeaderList.length,
      procesando: this.processHeaderList.filter(r => r.codEstado === 1).length,
      completados: this.processHeaderList.filter(r => r.codEstado === 2).length,
      errores: this.processHeaderList.filter(r => r.codEstado === 3).length,
      sinDatos: this.processHeaderList.filter(r => r.codEstado === 4).length
    };
  }
  */

  private showStatusChangeNotification(report: any) {
    const statusMessages: {[key: number]: {title: string, icon: string}} = {
      1: { title: 'Procesando', icon: 'info' },
      2: { title: 'Completado', icon: 'success' },
      3: { title: 'Error', icon: 'error' },
      4: { title: 'Sin Datos', icon: 'warning' }
    };

    const status = statusMessages[report.codEstado];
    
    if (status) {
      const toast = swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', swal.stopTimer);
          toast.addEventListener('mouseleave', swal.resumeTimer);
        }
      });

      toast.fire({
        icon: status.icon as any,
        title: `Reporte ${status.title}`,
        html: `<small>${report.SIDREPORT}</small>`
      });
    }
  }

  private startPollingForProcessingReports() {
    const processingReports = this.processHeaderList.filter(report => report.codEstado === 1);
    
    processingReports.forEach(report => {
      if (!this.activePolling.has(report.SIDREPORT)) {
        this.startPollingForReport(report.SIDREPORT);
      }
    });
  }

  private startPollingForReport(reportId: string) {
    this.activePolling.add(reportId);
    const intervals = [5000, 10000, 15000, 30000];
    let currentIntervalIndex = 0;

    const poll = () => {
      if (!this.activePolling.has(reportId)) return;

      const searchData: ReportStatusIngresosBM = {
        ID_REPORT: reportId,
        NBRANCH: 0,
        DDATE_START_REPORT: this.formatDateToString(this.bsValueIni),
        DDATE_END_REPORT: this.formatDateToString(this.bsValueFin),
        NTYPE_REPORT: 6,
        P_SUSERNAME: this.username
      };

      this.reportIngresosService.GetStatusReportIngresos(searchData).subscribe(
        res => {
          if (res && res.length > 0) {
            const updatedReport = res[0];
            this.updateReportInLists(updatedReport);

            if (updatedReport.NSTATUSPROC !== 1) {
              this.stopPollingForReport(reportId);
              return;
            }

            const nextInterval = intervals[Math.min(currentIntervalIndex, intervals.length - 1)];
            currentIntervalIndex++;
            
            const timeoutId = setTimeout(poll, nextInterval);
            this.pollingIntervals.set(reportId, timeoutId);
          }
        },
        error => {
          console.error(`Error polling report ${reportId}:`, error);
          this.stopPollingForReport(reportId);
        }
      );
    };

    poll();
  }

  getFileIngresosReport(id: any) {
        if (!this.isUserAuthorized) {
        swal.fire({
        title: 'Acceso Restringido',
        text: this.authorizationMessage,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
        });
        return;
    }

    if (!id) {
      this.showValidationError('ID de reporte no válido');
      return;
    }

    const report = this.processHeaderList.find(r => r.id === id);
    if (report && report.codEstado !== 2) {
      this.showWarningMessage(
        'Reporte No Disponible',
        'El reporte aún no está completado o tiene errores. Solo se pueden descargar reportes completados exitosamente.'
      );
      return;
    }

    this.isLoadingDownload.set(id, true);
    
    this.showDownloadStartNotification(id);

    const downloadData: FileReportIngresosBM = {
      ID_REPORT: id.toString().trim()
    };

    this.reportIngresosService.DownloadFileReportIngresos(downloadData).subscribe(
      res => {
        this.isLoadingDownload.set(id, false);
        
        if (res.SUCCESS) {
          this.handleSuccessfulDownload(res, id);
        } else {
          this.handleDownloadError(res.MESSAGE || 'Error desconocido en la descarga', id);
        }
      },
      error => {
        this.isLoadingDownload.set(id, false);
        this.handleDownloadError('Error de conexión durante la descarga', id);
      }
    );
  }

  private handleSuccessfulDownload(res: any, id: string) {
    try {
      const file = new File(
        [this.obtenerBlobFromBase64(res.FILE_CONTENT, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')],
        res.FILE_NAME || `${id}-REPORTE-INGRESOS.xlsx`, 
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      
      FileSaver.saveAs(file);
      
      const successToast = swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      successToast.fire({
        icon: 'success',
        title: 'Descarga completada',
        html: `<small>${res.FILE_NAME || 'Archivo descargado exitosamente'}</small>`
      });
      
    } catch (error) {
      this.handleDownloadError('Error al procesar el archivo descargado', id);
    }
  }

  private handleSearchError(error: any) {
    this.isLoadingSearch = false;
    this.isLoading = false;
    
    let errorMessage = 'Error al consultar los reportes.';
    let suggestions = '';

    if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor.';
      suggestions = 'Verifique su conexión a internet y el estado del servidor.';
    } else if (error.status === 401) {
      errorMessage = 'Su sesión ha expirado.';
      suggestions = 'Por favor inicie sesión nuevamente.';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para consultar reportes.';
      suggestions = 'Contacte al administrador del sistema.';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor.';
      suggestions = 'Intente nuevamente en unos minutos. Si persiste, contacte al soporte técnico.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    swal.fire({
      title: 'Error de Búsqueda',
      html: `
        <div style="text-align: left; padding: 15px;">
          <p><strong>Error:</strong> ${errorMessage}</p>
          ${suggestions ? `
            <hr>
            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;"><strong>Sugerencia:</strong> ${suggestions}</p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  }

  private handleDownloadError(message: string, id: string) {
    let errorTitle = 'Error de Descarga';
    let suggestions = '';

    if (message.includes('no encontrado') || message.includes('not found')) {
      errorTitle = 'Archivo No Disponible';
      suggestions = 'El archivo aún se está generando, ha expirado o fue eliminado. Verifique el estado del reporte e intente nuevamente.';
    } else if (message.includes('permission') || message.includes('access')) {
      errorTitle = 'Sin Permisos';
      suggestions = 'No tiene permisos para descargar este archivo. Contacte al administrador.';
    } else if (message.includes('timeout')) {
      errorTitle = 'Tiempo de Espera Agotado';
      suggestions = 'La descarga tardó demasiado. Intente nuevamente en unos minutos.';
    }

    swal.fire({
      title: errorTitle,
      html: `
        <div style="text-align: left; padding: 15px;">
          <p><strong>Reporte:</strong> <code>${id}</code></p>
          <p><strong>Error:</strong> ${message}</p>
          ${suggestions ? `
            <hr>
            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;"><strong>Sugerencia:</strong> ${suggestions}</p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  }

  private showDownloadStartNotification(id: string) {
    const toast = swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });

    toast.fire({
      icon: 'info',
      title: 'Iniciando descarga...',
      html: `<small>${id}</small>`
    });
  }

  private showSearchSuccessMessage() {
    if (this.processHeaderList.length > 0) {
      const toast = swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      // COMENTADO - Mensaje que usaba dashboardStats
      /*
      toast.fire({
        icon: 'success',
        title: `${this.dashboardStats.total} reportes encontrados`,
        html: `
          <small>
            ${this.dashboardStats.procesando > 0 ? `${this.dashboardStats.procesando} procesando, ` : ''}
            ${this.dashboardStats.completados} completados
          </small>
        `
      });
      */

      // Nuevo mensaje simplificado
      toast.fire({
        icon: 'success',
        title: `${this.processHeaderList.length} reportes encontrados`,
        html: `<small>Búsqueda completada exitosamente</small>`
      });
    }
  }

  private showNoResultsMessage() {
    const searchDetails = this.SearchActivated 
      ? `ID: ${this.IdReport}` 
      : `Período: ${this.formatDateFromAPI(this.bsValueIni.toISOString())} - ${this.formatDateFromAPI(this.bsValueFin.toISOString())}`;

    swal.fire({
      title: 'Sin Resultados',
      html: `
        <div style="text-align: center; padding: 15px;">
          <div style="font-size: 3em; color: #6c757d; margin: 20px;">
            <i class="fa fa-search"></i>
          </div>
          <p>No se encontraron reportes con los criterios especificados.</p>
          <hr>
          <small><strong>Búsqueda:</strong> ${searchDetails}</small>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  }

  private showValidationError(message: string) {
    swal.fire({
      title: 'Validación',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  }

  private showWarningMessage(title: string, message: string) {
    swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  }

  private updateReportInLists(updatedReport: any) {
    const updateItem = (item: any) => {
      if (item.SIDREPORT === updatedReport.SIDREPORT) {
        item.NSTATUSPROC = updatedReport.NSTATUSPROC;
        item.codEstado = updatedReport.NSTATUSPROC;
        item.desEstado = this.getStatusDescription(updatedReport.NSTATUSPROC);
      }
      return item;
    };

    this.processHeaderList = this.processHeaderList.map(updateItem);
    this.listToShow = this.listToShow.map(updateItem);
    
    // COMENTADO - Actualización de estadísticas del dashboard
    // this.updateDashboardStats();
  }

  private updateCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.listToShow = this.processHeaderList.slice(startIndex, endIndex);
  }

  private stopPollingForReport(reportId: string) {
    this.activePolling.delete(reportId);
    
    if (this.pollingIntervals.has(reportId)) {
      clearTimeout(this.pollingIntervals.get(reportId));
      this.pollingIntervals.delete(reportId);
    }
  }

  private stopAllPolling() {
    this.activePolling.clear();
    this.pollingIntervals.forEach(timeoutId => clearTimeout(timeoutId));
    this.pollingIntervals.clear();
  }

  private cleanup() {
    this.stopAllPolling();
    
    // COMENTADO - Limpieza del auto-refresh
    /*
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    */
  }

  formatDateToString(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  formatDateFromAPI(dateString: string): string {
    const date = new Date(dateString);
    return String(date.getDate()).padStart(2, '0') + '/' + 
           String(date.getMonth() + 1).padStart(2, '0') + '/' + 
           date.getFullYear();
  }

  getStatusDescription(status: number): string {
    const statusObj = this.ListState.find(s => s.NSTATUSPROC === status);
    return statusObj ? statusObj.SDESCRIPTION : 'DESCONOCIDO';
  }

  obtenerBlobFromBase64(b64Data: string, contentType: string) {
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
  }

  pageChanged(currentPage: any) {
    this.currentPage = currentPage;
    this.listToShow = this.processHeaderList.slice(
      ((this.currentPage - 1) * this.itemsPerPage), 
      (this.currentPage * this.itemsPerPage)
    );
  }

  convertListToExcel() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
        this.isLoading = true;
        this.premiumReportService.ConvertListToExcel(this.processHeaderList, "Reportes_Ingresos");
        this.isLoading = false;
    } else {
        swal.fire("Información", "No hay registros para exportar.", "info");
    }
  }

  // COMENTADO - Getters relacionados con dashboardStats
  /*
  get hasProcessingReports(): boolean {
    return this.dashboardStats.procesando > 0;
  }
  */

  get canDownload(): ((id: string) => boolean) {
    return (id: string) => {
      const report = this.processHeaderList.find(r => r.id === id);
      return report && report.codEstado === 2 && !this.isLoadingDownload.get(id);
    };
  }

  get isDownloading(): ((id: string) => boolean) {
    return (id: string) => this.isLoadingDownload.get(id) || false;
  }

  get searchButtonText(): string {
    return this.isLoadingSearch ? 'BUSCANDO...' : 'BUSCAR';
  }

        get searchButtonDisabled(): boolean {
        return this.isLoadingSearch || this.isCheckingAuthorization || !this.isUserAuthorized; 
    }
}