import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Agregado para la redirección
import swal from 'sweetalert2';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ReportIngresosService, ReportCabIngresosBM } from '../../../services/report-ingresos/report-ingresos.service';

@Component({
  standalone: false,
  selector: 'app-vdp-ingresos-report',
  templateUrl: './vdp-ingresos-report.component.html',
  styleUrls: ['./vdp-ingresos-report.component.css']
})
export class VdpIngresosReportComponent implements OnInit {

  isLoading: boolean = false;
  isLoadingRamos: boolean = false;
  isGeneratingReport: boolean = false;

  // REQ 13-08-2025 DVP
  isUserAuthorized: boolean = false;
  isCheckingAuthorization: boolean = true;
  authorizationMessage: string = '';

  sRamo: number = 0;
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  ListRamos: any[] = [];

  formErrors: any = {
    ramo: '',
    fechaInicio: '',
    fechaFin: '',
    periodo: ''
  };

  // COMENTADO - Variables relacionadas con la estimación de tiempo
  /*
  estimatedTime: string = '';
  showEstimation: boolean = false;
  selectedRamoInfo: any = null;
  periodInfo: string = '';
  */

  constructor(
    private reportIngresosService: ReportIngresosService,
    private router: Router // Agregado para la redirección
  ) {
    this.bsConfig = Object.assign({}, {
      dateInputFormat: "DD/MM/YYYY",
      locale: "es",
      showWeekNumbers: false
    });
  }

  ngOnInit() {
    this.checkUserAuthorization();
    this.loadRamos();
    this.setDefaultDates();
    // COMENTADO - Setup de validación en tiempo real que incluía estimaciones
    // this.setupRealTimeValidation();
    this.setupBasicValidation();
  }

  // REQ 13-08-2025 DVP - Verificación de autorización granular
    private checkUserAuthorization() {
    const currentUser = this.getCurrentUser();
    
    this.reportIngresosService.CheckUserAuthorization({
        SUSER: currentUser,
        NIDRESOURCE: 991 // ID del recurso "Generación de Reportes de Ingresos"
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

  loadRamos() {
    this.isLoadingRamos = true;
    
    this.reportIngresosService.GetBranchList().subscribe(
      res => {
        this.ListRamos = res || [];
        this.isLoadingRamos = false;
        
        if (!res || res.length === 0) {
          this.showWarningMessage(
            'Sin Ramos Disponibles',
            'No se encontraron ramos disponibles. Contacte al administrador.'
          );
        }
      },
      error => {
        this.isLoadingRamos = false;
        console.error('Error cargando ramos:', error);
        
        this.ListRamos = [
          { NBRANCH: 64, SDESCRIPT: 'ASISTENCIA MÉDICA' },
          { NBRANCH: 66, SDESCRIPT: 'SOAT' },
          { NBRANCH: 77, SDESCRIPT: 'SCTR' }
        ];
        
        this.showWarningMessage(
          'Error de Conexión',
          'Error al cargar ramos desde el servidor. Se muestran ramos básicos disponibles.'
        );
      }
    );
  }

  // COMENTADO - Método original que incluía actualizaciones de estimación
  /*
  setupRealTimeValidation() {
    setInterval(() => {
    if (this.validateForm()) {
        this.updateEstimation();
        this.updatePeriodInfo();
    }
    }, 500);
  }
  */

  // Nuevo método simplificado sin estimaciones
  setupBasicValidation() {
    setInterval(() => {
      this.validateForm();
    }, 500);
  }

  validateForm(): boolean {
    let isValid = true;
    
    if (!this.sRamo || this.sRamo === 0) {
      //this.formErrors.ramo = 'Debe seleccionar un ramo';
      isValid = false;
    } else {
      this.formErrors.ramo = '';
      // COMENTADO - Actualización de selectedRamoInfo
      // this.selectedRamoInfo = this.ListRamos.find(r => r.NBRANCH == this.sRamo);
    }

    if (!this.bsValueIni) {
      this.formErrors.fechaInicio = 'Fecha de inicio requerida';
      isValid = false;
    } else {
      this.formErrors.fechaInicio = '';
    }

    if (!this.bsValueFin) {
      this.formErrors.fechaFin = 'Fecha de fin requerida';
      isValid = false;
    } else {
      this.formErrors.fechaFin = '';
    }

    if (this.bsValueIni && this.bsValueFin) {
      const startDate = new Date(this.bsValueIni);
      const endDate = new Date(this.bsValueFin);
      const today = new Date();

      if (startDate > endDate) {
        this.formErrors.periodo = 'La fecha de inicio no puede ser posterior a la fecha de fin';
        isValid = false;
      } else if (endDate > today) {
        this.formErrors.periodo = 'No se pueden procesar fechas futuras';
        isValid = false;
      } else {
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 365) {
          this.formErrors.periodo = 'El período no puede ser mayor a 1 año';
          isValid = false;
        } else if (daysDiff === 0) {
          this.formErrors.periodo = 'Debe seleccionar un período de al menos 1 día';
          isValid = false;
        } else {
          this.formErrors.periodo = '';
        }
      }
    }

    return isValid;
  }

  // COMENTADO - Métodos relacionados con estimación de tiempo
  /*
  updateEstimation() {
    if (this.sRamo && this.bsValueIni && this.bsValueFin && !this.formErrors.periodo) {
      const daysDiff = Math.ceil(
        (new Date(this.bsValueFin).getTime() - new Date(this.bsValueIni).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      const baseTime = this.getBaseTimeByRamo(this.sRamo);
      const timeMultiplier = daysDiff > 30 ? 1.5 : 1;
      const volumeMultiplier = daysDiff > 90 ? 2 : 1;
      
      const estimatedMinutes = Math.ceil(baseTime * timeMultiplier * volumeMultiplier);
      
      this.estimatedTime = this.formatEstimatedTime(estimatedMinutes);
      this.showEstimation = true;
    } else {
      this.showEstimation = false;
    }
  }

  getBaseTimeByRamo(ramo: number): number {
    const timeMap: {[key: number]: number} = {
      64: 1,
      66: 3,
      77: 8,
      61: 2,
      71: 4,
      74: 5
    };
    return timeMap[ramo] || 3;
  }

  formatEstimatedTime(minutes: number): string {
    if (minutes < 2) return 'Menos de 2 minutos';
    if (minutes < 60) return `Aproximadamente ${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `Aproximadamente ${hours}h ${remainingMinutes}m`;
  }

  updatePeriodInfo() {
    if (this.bsValueIni && this.bsValueFin && !this.formErrors.periodo) {
      const daysDiff = Math.ceil(
        (new Date(this.bsValueFin).getTime() - new Date(this.bsValueIni).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      this.periodInfo = `Período: ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`;
    } else {
      this.periodInfo = '';
    }
  }
  */

  setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.bsValueIni = firstDay;
    this.bsValueFin = today;
    this.bsValueFinMax = today;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateToString(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  processReports() {
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

    if (!this.validateForm()) {
      const firstError = Object.keys(this.formErrors).find(key => this.formErrors[key]);
      if (firstError) {
        this.showValidationError(this.formErrors[firstError]);
        return;
      }
    }

    const selectedRamo = this.ListRamos.find(r => r.NBRANCH == this.sRamo);
    const ramoName = selectedRamo?.SDESCRIPT || 'N/A';
    
    // Cálculo del período para mostrar en el modal
    const daysDiff = Math.ceil(
      (new Date(this.bsValueFin).getTime() - new Date(this.bsValueIni).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    const periodInfo = `Período: ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`;
    
    swal.fire({
      title: "Confirmar Generación de Reporte",
      html: `
        <div style="text-align: left; padding: 15px;">
          <p><strong>Ramo:</strong> ${ramoName}</p>
          <p><strong>Período:</strong> ${this.formatDateForDisplay(this.formatDateToString(this.bsValueIni))} - ${this.formatDateForDisplay(this.formatDateToString(this.bsValueFin))}</p>
          <p><strong>${periodInfo}</strong></p>
          <hr>
          <p style="font-size: 14px; color: #666;">
            El reporte se procesará en segundo plano. Podrá monitorear el progreso 
            desde la sección "Monitoreo de Reportes".
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: 'Generar Reporte',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.value) {
        this.generateReport();
      }
    });
  }

  generateReport() {
    this.isGeneratingReport = true;
    this.isLoading = true;
    
    swal.fire({
      title: 'Generando Reporte',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div class="fa fa-spinner fa-spin" style="font-size: 2em; color: #007bff; margin: 20px;"></div>
          <p>Iniciando proceso de generación...</p>
          <p style="font-size: 12px; color: #999;">Por favor no cierre esta ventana</p>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        swal.showLoading();
      }
    });

    const data: ReportCabIngresosBM = {
      NBRANCH: this.sRamo,
      DDATE_START_REPORT: this.formatDateToString(this.bsValueIni),
      DDATE_END_REPORT: this.formatDateToString(this.bsValueFin),
      SUSERNAME: this.getCurrentUser(),
      NUSERCODE: this.getCurrentUserCode()
    };

    this.reportIngresosService.CreateReportIngresoCab(data).subscribe(
      res => {
        this.handleGenerationResponse(res);
      },
      error => {
        this.handleGenerationError(error);
      }
    );
  }

  handleGenerationResponse(res: any) {
    this.isGeneratingReport = false;
    this.isLoading = false;
    swal.close();
    
    if (res.NCODE === 0) {
      swal.fire({
        title: 'Reporte Iniciado Exitosamente',
        html: `
          <div style="text-align: center; padding: 15px;">
            <div style="color: #28a745; font-size: 3em; margin: 20px;">
              <i class="fa fa-check-circle"></i>
            </div>
            <p style="margin: 15px 0;">El reporte se está procesando en segundo plano.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>ID del Reporte:</strong></p>
              <code style="font-size: 16px; color: #007bff; background: white; padding: 8px; border-radius: 4px;">${res.SID_REPORT}</code>
            </div>
            <p style="font-size: 14px; color: #666;">
              Puede cerrar esta ventana y monitorear el progreso desde "Monitoreo de Reportes".
            </p>
          </div>
        `,
        // icon: 'success',  // Comentado para evitar doble check
        showCancelButton: true,
        confirmButtonText: 'Ir a Monitoreo',
        cancelButtonText: 'Generar Otro',
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d'
      }).then((result) => {
        if (result.value) {
          // Redirección automática al monitoreo de reportes
          this.router.navigate(['/extranet/reporte-ingresos-monitoreo']);
        } else {
          this.resetForm();
        }
      });
    } else {
      this.handleGenerationError(res.SMESSAGE);
    }
  }

  handleGenerationError(error: any) {
    this.isGeneratingReport = false;
    this.isLoading = false;
    swal.close();

    let errorTitle = 'Error al Generar Reporte';
    let errorMessage = '';
    let suggestions = '';

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Error desconocido';
    }

    if (error?.status === 0 || errorMessage.includes('connection')) {
      errorTitle = 'Error de Conexión';
      errorMessage = 'No se pudo conectar con el servidor';
      suggestions = 'Verifique su conexión a internet e intente nuevamente en unos minutos.';
    } else if (error?.status === 401) {
      errorTitle = 'Sesión Expirada';
      errorMessage = 'Su sesión ha expirado';
      suggestions = 'Por favor inicie sesión nuevamente.';
    } else if (error?.status === 403) {
      errorTitle = 'Sin Permisos';
      errorMessage = 'No tiene permisos para generar este tipo de reporte';
      suggestions = 'Contacte al administrador del sistema.';
    } else if (errorMessage.includes('timeout')) {
      errorTitle = 'Tiempo de Espera Agotado';
      suggestions = 'El servidor está ocupado. Intente con un período más pequeño.';
    } else if (errorMessage.includes('data') || errorMessage.includes('datos')) {
      errorTitle = 'Sin Datos Disponibles';
      suggestions = 'Intente con un período diferente o verifique que existan datos para el ramo seleccionado.';
    }

    swal.fire({
      title: errorTitle,
      html: `
        <div style="text-align: left; padding: 15px;">
          <div style="color: #dc3545; font-size: 2em; text-align: center; margin: 20px;">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <p style="margin-bottom: 15px;"><strong>Error:</strong> ${errorMessage}</p>
          ${suggestions ? `
            <hr>
            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;"><strong>Sugerencia:</strong> ${suggestions}</p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc3545'
    });
  }

  resetForm() {
    const hasData = this.sRamo !== 0 || 
                   this.formatDateToString(this.bsValueIni) !== this.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) ||
                   this.formatDateToString(this.bsValueFin) !== this.formatDate(new Date());

    if (hasData) {
      swal.fire({
        title: 'Confirmar Limpieza',
        text: '¿Está seguro que desea limpiar todos los campos del formulario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6c757d'
      }).then((result) => {
        if (result.value) {
          this.clearForm();
        }
      });
    } else { 
      this.clearForm();
    }
  }

  private clearForm() {
    this.sRamo = 0;
    this.setDefaultDates();
    
    // COMENTADO - Variables relacionadas con estimación
    /*
    this.estimatedTime = '';
    this.showEstimation = false;
    this.selectedRamoInfo = null;
    this.periodInfo = '';
    */
    
    this.formErrors = {
      ramo: '',
      fechaInicio: '',
      fechaFin: '',
      periodo: ''
    };
  }

  getCurrentUser(): string {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
      return currentUser?.username || 'SYSTEM';
    } catch {
      return 'SYSTEM';
    }
  }

  formatDateForDisplay(dateString: string): string {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      return date.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  showValidationError(message: string) {
    swal.fire({
      title: 'Validación',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ffc107'
    });
  }

  showWarningMessage(title: string, message: string) {
    swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ffc107'
    });
  }

  showInfoMessage(title: string, message: string) {
    swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#17a2b8'
    });
  }

  get isFormValid(): boolean {
    return this.validateForm();
  }

    get canGenerateReport(): boolean {
    return this.isFormValid && 
            !this.isGeneratingReport && 
            !this.isLoadingRamos &&
            this.isUserAuthorized; // REQ 13/08/2025
    }

  get buttonText(): string {
    if (this.isGeneratingReport) return 'GENERANDO...';
    if (this.isLoadingRamos) return 'CARGANDO...';
    return 'PROCESAR';
  }

        get buttonDisabled(): boolean {
        return !this.canGenerateReport || this.isCheckingAuthorization; // REQ 13/08/2025
    }

    getCurrentUserCode(): number {
        try {
            const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
            return currentUser?.id || 1; 
        } catch {
            return 1;
        }
        }
}