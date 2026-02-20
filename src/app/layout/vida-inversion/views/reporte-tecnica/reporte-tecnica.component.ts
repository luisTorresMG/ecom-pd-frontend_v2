import { Component, OnInit, OnDestroy } from '@angular/core';
import { AtpReportService } from '../../../broker/services/atp-reports/atp-report.service';
import Swal from 'sweetalert2';

@Component({
    standalone: false,
    selector: 'app-reporte-tecnica',
    templateUrl: './reporte-tecnica.component.html',
    styleUrls: ['./reporte-tecnica.component.scss']
})
export class ReporteTecnicaComponent implements OnInit, OnDestroy {

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

    // OPCIONES PARA DROPDOWNS
    policyStates: any[] = [{ value: 'Todos', label: 'Todos' }]; // Valor por defecto
    
    // CONTROL DE ESTADO
    isLoading: boolean = false;
    isGenerating: boolean = false;
    isValidatingPolicy: boolean = false;
    isPolicyValid: boolean = false;
    policyValidationMessage: string = '';
    
    // POLLING DEL REPORTE
    private pollingInterval: any;
    private currentReportId: string = '';
    private readonly POLLING_INTERVAL_MS = 3000; // 3 segundos
    private readonly MAX_POLLING_ATTEMPTS = 100; // 5 minutos máximo
    private pollingAttempts = 0;

    // DEBOUNCE PARA VALIDACIÓN DE PÓLIZA
    private policyValidationTimeout: any;
    private currentReportEndDate: Date | null = null;

    constructor(
        private atpReportService: AtpReportService
    ) {}

    async ngOnInit() {
        await this.initializeComponent();
    }

    ngOnDestroy() {
        this.stopPolling();
        
        // Limpiar timeout de validación de póliza
        if (this.policyValidationTimeout) {
            clearTimeout(this.policyValidationTimeout);
        }
    }

    // =============================================================
    // INICIALIZACIÓN
    // =============================================================
    
    async initializeComponent() {
        this.isLoading = true;
        try {
            // Cargar configuración inicial
            await this.loadPolicyStates();
            await this.loadInitialDates();
        } catch (error) {
            console.error('Error inicializando componente:', error);
            Swal.fire('Error', 'Error al cargar la configuración inicial', 'error');
        }
        this.isLoading = false;
    }

    async loadPolicyStates() {
        return new Promise((resolve) => {
            this.atpReportService.getPolicyStates().subscribe(
                (response) => {
                    if (response.nerror === 0) {
                        this.policyStates = response.element_list;
                        
                        // Asegurar que "Todos" siempre esté en la lista y seleccionado
                        if (this.policyStates && this.policyStates.length > 0) {
                            // Verificar si ya existe "Todos" en la lista
                            const todosExists = this.policyStates.some(item => 
                                item.value === 'Todos' || item.value === '' || item.value === null
                            );
                            
                            // Si no existe, agregarlo al inicio
                            if (!todosExists) {
                                this.policyStates.unshift({ value: 'Todos', label: 'Todos' });
                            }
                            
                            // Asegurar que formData.policyState tenga un valor válido
                            if (!this.formData.policyState || this.formData.policyState === '') {
                                this.formData.policyState = 'Todos';
                            }
                        }
                    }
                    resolve(true);
                },
                (error) => {
                    console.error('Error cargando estados:', error);
                    // En caso de error, asegurar que tenga al menos "Todos"
                    this.policyStates = [{ value: 'Todos', label: 'Todos' }];
                    this.formData.policyState = 'Todos';
                    resolve(false);
                }
            );
        });
    }

    async loadInitialDates() {
    return new Promise((resolve) => {
        this.atpReportService.FechaInicionReporteTecnica().subscribe(
            (response) => {
                if (response.SSTART_DATE) {
                    const dateParts = response.SSTART_DATE.split('/');
                    const initialStartDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                    const today = new Date();

                    this.formData.startDate = new Date(initialStartDate);
                    this.formData.endDate = new Date(today);
                    // this.formData.emissionStartDate = new Date(initialStartDate);
                    this.formData.emissionStartDate = new Date(today);
                    this.formData.emissionEndDate = new Date(today);
                    // this.formData.movementStartDate = new Date(initialStartDate);
                    this.formData.movementStartDate = new Date(today);
                    this.formData.movementEndDate = new Date(today);
                }
                resolve(true);
            },
            (error) => {
                console.error('Error cargando fechas iniciales:', error);
                this.formData.startDate = new Date();
                this.formData.endDate = new Date();
                resolve(false);
            }
        );
    });
}

    // =============================================================
    // VALIDACIONES
    // =============================================================

        validateForm(): { isValid: boolean; message: string } {
        // Validar que se seleccione tipo de fecha (obligatorio)
        if (!this.formData.dateType) {
            return { isValid: false, message: 'Debe seleccionar el tipo de fecha (Emisión o Movimiento)' };
        }

        // Validar póliza si se ingresó
        if (this.formData.policy) {
            if (!/^\d{10}$/.test(this.formData.policy)) {
                return { isValid: false, message: 'La póliza debe tener exactamente 10 dígitos' };
            }
            
            // Validar que la póliza sea válida en el Core
            if (!this.isPolicyValid) {
                return { isValid: false, message: 'Debe ingresar una póliza válida que exista en el sistema y pertenezca al producto VIGP' };
            }
        }

        // Validar fechas según el tipo seleccionado
        if (this.formData.dateType === 'EMISION') {
            if (!this.formData.emissionStartDate || !this.formData.emissionEndDate) {
                return { isValid: false, message: 'Debe seleccionar las fechas de emisión' };
            }
            if (this.formData.emissionStartDate > this.formData.emissionEndDate) {
                return { isValid: false, message: 'Fecha inicio de emisión es mayor a fecha fin' };
            }
        } else if (this.formData.dateType === 'MOVIMIENTO') {
            if (!this.formData.movementStartDate || !this.formData.movementEndDate) {
                return { isValid: false, message: 'Debe seleccionar las fechas de movimiento' };
            }
            if (this.formData.movementStartDate > this.formData.movementEndDate) {
                return { isValid: false, message: 'Fecha inicio de movimiento es mayor a fecha fin' };
            }
        }

        return { isValid: true, message: '' };
    }

            private updateDatesByType() {
            if (this.formData.dateType === 'EMISION') {
                this.formData.startDate = this.formData.emissionStartDate;
                this.formData.endDate = this.formData.emissionEndDate;
            } else if (this.formData.dateType === 'MOVIMIENTO') {
                this.formData.startDate = this.formData.movementStartDate;
                this.formData.endDate = this.formData.movementEndDate;
            }
        }

        onEmissionDateChange() {
        this.updateDatesByType();
    }
        onMovementDateChange() {
        this.updateDatesByType();
    }
        onDateTypeChange() {
    this.updateDatesByType();
    // NO resetear policyState - mantener selección del usuario
    }

    // =============================================================
    // EVENTOS DEL FORMULARIO
    // =============================================================

        onPolicyChange() {
        // Limpiar póliza si no es numérica
        this.formData.policy = this.formData.policy.replace(/[^0-9]/g, '');
        
        // Limitar a 10 dígitos
        if (this.formData.policy.length > 10) {
            this.formData.policy = this.formData.policy.substring(0, 10);
        }

        // Solo resetear estado cuando se limpia completamente la póliza
        //     if (this.formData.policy === '') {
        //     this.formData.policyState = 'Todos';
        // }
        
        this.isPolicyValid = false;
        this.policyValidationMessage = '';

        // Validar póliza con debounce si tiene 10 dígitos
        if (this.formData.policy.length === 10) {
            this.validatePolicyWithDebounce();
        } else if (this.formData.policy.length > 0) {
            this.policyValidationMessage = 'La póliza debe tener exactamente 10 dígitos';
        }
    }

    validatePolicyWithDebounce() {
        // Limpiar timeout anterior
        if (this.policyValidationTimeout) {
            clearTimeout(this.policyValidationTimeout);
        }

        // Crear nuevo timeout para validar después de 800ms
        this.policyValidationTimeout = setTimeout(() => {
            this.validatePolicyInCore();
        }, 800);
    }

    async validatePolicyInCore() {
        if (!this.formData.policy || this.formData.policy.length !== 10) {
            return;
        }

        this.isValidatingPolicy = true;
        this.policyValidationMessage = 'Validando póliza...';

        try {
            const response = await this.atpReportService.ValidatePolicy(this.formData.policy).toPromise();
            
            // El SP devuelve validation_code: 0=OK, 2=no existe, 3=no es VIGP
            if (response && response.Validation_code === 0) {
                this.isPolicyValid = true;
                this.policyValidationMessage = 'Póliza válida';
                // No forzar el valor, mantener la selección actual del usuario
                // Solo asegurar que tenga un valor válido si está vacío
                if (!this.formData.policyState || this.formData.policyState === '') {
                    this.formData.policyState = 'Todos';
                }
            } else {
                this.isPolicyValid = false;
                this.policyValidationMessage = response.Validation_msg || 'La póliza no es válida';
                
                
                Swal.fire('Póliza no válida', response.Validation_msg || 'La póliza ingresada no existe o no corresponde al producto VIGP', 'warning');
            }
        } catch (error) {
            this.isPolicyValid = false;
            this.policyValidationMessage = 'Error al validar la póliza';
            console.error('Error validando póliza:', error);
        }

        this.isValidatingPolicy = false;
    }

    // =============================================================
    // GENERACIÓN DEL REPORTE
    // =============================================================

    async generateReport() {
        // Validar formulario
        const validation = this.validateForm();
        if (!validation.isValid) {
            Swal.fire('Validación', validation.message, 'warning');
            return;
        }

        this.isGenerating = true;

        try {
            const reportData = this.prepareReportData();

            this.currentReportEndDate = this.formData.dateType === 'EMISION' 
            ? this.formData.emissionEndDate 
            : this.formData.movementEndDate;
            
            // Crear cabecera del reporte
            const response = await this.atpReportService.CreateReportTechnicalCab(reportData).toPromise();
            
            if (response.Ncode === 0) {
                this.currentReportId = response.Sid_report;
                
                Swal.fire({
                    title: 'Generando Reporte',
                    text: 'El reporte se está procesando en segundo plano. Por favor espere...',
                    icon: 'info',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Iniciar polling para consultar estado
                this.startPolling();
            } else {
                this.isGenerating = false;
                Swal.fire('Error', response.Smessage || 'Error al generar el reporte', 'error');
            }
        } catch (error) {
            this.isGenerating = false;
            console.error('Error generando reporte:', error);
            Swal.fire('Error', 'Error al procesar la solicitud', 'error');
        }
    }

    prepareReportData() {
    // Generar ID único para el reporte
    const now = new Date();
    const reportId = `Reporte_tecnica-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

    // ✅ USAR FECHAS DIRECTAS SEGÚN TIPO SELECCIONADO
    const startDate = this.formData.dateType === 'EMISION' 
        ? this.formData.emissionStartDate 
        : this.formData.movementStartDate;
        
    const endDate = this.formData.dateType === 'EMISION' 
        ? this.formData.emissionEndDate 
        : this.formData.movementEndDate;

    return {
        Sid_report: reportId,
        Nbranch: 71,
        Nproduct: 6,
        Ntype_report: 2,
        Ddate_end_report: this.formatDateForBackend(endDate),          
        Nusercode: 1,
        Npolicy: this.formData.policy || null,
        Status_policy: this.getStatusPolicyValue(),
        Date_type: this.formData.dateType || null,
        Start_date: this.formatDateForBackend(startDate)               
    };
}

        private getStatusPolicyValue(): string | null {
        const state = this.formData.policyState;
        if (!state || state === 'Todos' || state === '') return null;
        return typeof state === 'object' ? (state as any).value : state;
    }

    formatDateForBackend(date: Date): string {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // =============================================================
    // POLLING DEL ESTADO DEL REPORTE
    // =============================================================

    startPolling() {
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

    async checkReportStatus() {
        try {
            this.pollingAttempts++;

            if (this.pollingAttempts > this.MAX_POLLING_ATTEMPTS) {
                this.stopPolling();
                this.isGenerating = false;
                Swal.fire('Timeout', 'El reporte está tomando más tiempo del esperado. Por favor consulte el estado más tarde.', 'warning');
                return;
            }

            const statusData = {
                Id_report: this.currentReportId
            };

            const response = await this.atpReportService.GetStatusReportTechnical(statusData).toPromise();

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
                let message = '';
                if (this.formData.policy && this.formData.dateType === 'MOVIMIENTO') {
                    message = 'No se tiene información para ese rango de fecha de movimiento.';
                } else if (this.formData.dateType === 'EMISION') {
                    message = 'No se tiene información para ese rango de fecha de emisión.';
                } else if (this.formData.dateType === 'MOVIMIENTO') {
                    message = 'No se tiene información para ese rango de fecha de movimiento.';
                } else {
                    message = report.SLOG_MESSAGE || 'No se encontraron datos para los filtros seleccionados';
                }
                Swal.fire('Sin datos', message, 'info');
                break;
                    
                case 1: // En proceso
                default:
                    // Continuar polling
                    break;
            }
            }
        } catch (error) {
            console.error('Error consultando estado:', error);
            // Continuar polling en caso de error de red
        }
    }

    downloadReport(filePath: string) {
        try {
            // Extraer ID del reporte del path o usar el currentReportId
            const reportId = this.currentReportId;
            
            const downloadData = {
                ID_REPORT: reportId,
                SMAIN_ROUTE: filePath || '' // Ruta principal del archivo
            };

            this.atpReportService.DownloadFileReport(downloadData).subscribe(
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
                        link.download = `${reportId}.xlsx`;
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

    // =============================================================
    // GETTERS PARA EL TEMPLATE
    // =============================================================

    get isEmissionDateSelected(): boolean {
        return this.formData.dateType === 'EMISION';
    }

    get isMovementDateSelected(): boolean {
        return this.formData.dateType === 'MOVIMIENTO';
    }

    get canGenerate(): boolean {
        return !this.isLoading && !this.isGenerating && !this.isValidatingPolicy;
    }

    get isPolicyFieldEnabled(): boolean {
        return this.canGenerate;
    }

    get isPolicyStateEnabled(): boolean {
    return this.canGenerate && !this.formData.policy; // Bloqueado si hay póliza
}

    get policyValidationClass(): string {
        if (!this.formData.policy) return '';
        if (this.isValidatingPolicy) return 'text-info';
        if (this.isPolicyValid) return 'text-success';
        return 'text-danger';
    }

    get showPolicyValidation(): boolean {
        return this.formData.policy.length > 0 || this.policyValidationMessage !== '';
    }

        get emissionDateRange(): string {
        if (this.formData.emissionStartDate && this.formData.emissionEndDate) {
            const start = this.formatDateForDisplay(this.formData.emissionStartDate);
            const end = this.formatDateForDisplay(this.formData.emissionEndDate);
            return `${start} - ${end}`;
        }
        return '';
    }

    get movementDateRange(): string {
        if (this.formData.movementStartDate && this.formData.movementEndDate) {
            const start = this.formatDateForDisplay(this.formData.movementStartDate);
            const end = this.formatDateForDisplay(this.formData.movementEndDate);
            return `${start} - ${end}`;
        }
        return '';
    }

    get areEmissionDatesEnabled(): boolean {
    return this.canGenerate && (this.formData.dateType === 'EMISION' || !this.formData.dateType);
    }

    get areMovementDatesEnabled(): boolean {
        return this.canGenerate && (this.formData.dateType === 'MOVIMIENTO' || !this.formData.dateType);
    }

    get areDateTypeRadiosEnabled(): boolean {
        return this.canGenerate;
    }

    formatDateForDisplay(date: Date): string {
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    }
}