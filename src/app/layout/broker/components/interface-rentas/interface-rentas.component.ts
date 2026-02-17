import { Component, OnInit } from '@angular/core';
import { InterfaceMonitoringCBCOService } from '../../../backoffice/services/interface-monitoring/interface-monitoring-cbco.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { forkJoin } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-interface-rentas',
    templateUrl: './interface-rentas.component.html',
    styleUrls: ['./interface-rentas.component.scss']
})

export class InterfaceRentasComponent implements OnInit {

    seacsaDirecto: boolean = true;
    seacsaAFP: boolean = false;
    ahorroDirecto: boolean = false;

    pagos: any = [];
    detalles: any = [];
    origen: any = [];
    pagoSiniestro: any = [];
    montoTotales: any = [];

    checked: boolean = false;
    checkedProc: any = {};
    checkedProcSend: any[] = [];

    pago = {
        P_NNUMORI: 0,
        P_NTYPEOP: 0,
        //P_SPOLIZA: '',
        P_DFECINI: new Date(),
        P_DFECFIN: new Date(),
        P_DFEC_APROB: new Date() // INI JICI 15-08-2024 FIN
    }

    montoTotal: number;
    saludTotal: number;
    retencionTotal: number;
    liquidoTotal: number;

    montoSoles = ''; 
    montoDolares = ''; 

    mostrarMontos: boolean = false;
    mostrarFecha: boolean = false; // INI JICI 14-08-2024 FIN

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
    maxDate: Date = moment().add(30, 'days').toDate(); // INI JICI 14-08-2024 FIN
    diaActual = moment(new Date()).toDate();
    diaAprob: Date = moment().toDate(); // INI JICI 14-08-2024 FIN
    isLoading: boolean = false;

    bsConfig: Partial<BsDatepickerConfig>;
    bsConfigFechaAprobacion: Partial<BsDatepickerConfig>; // INI JICI 14-08-2024 FIN

    constructor(
        private modalService: NgbModal,
        private InterfaceMonitoringCBCOService: InterfaceMonitoringCBCOService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
            }
        );
        // INI JICI 14-08-2024 RENTAS
        this.bsConfigFechaAprobacion = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
                minDate: this.diaAprob,  // Fecha mínima es hoy
                maxDate: this.maxDate,    // Fecha máxima es hoy + 30 días
            }
        );
        // FIN JICI 14-08-2024 RENTAS
    }

    // INI JICI 14-08-2024 RENTAS
    onFechaAprobacionChange(event: Date) {
        if (event < this.diaAprob || event > this.maxDate) {
            alert('La fecha seleccionada no es válida. Debe estar dentro de los próximos 30 días.');
            this.pago.P_DFECFIN = null;
        }
    }
    // FIN JICI 14-08-2024 RENTAS

    ngOnInit(): void {
        this.initDates();
        this.getParams();
    }

    montosTotales() {
        
        const idata = {
            P_NNUMORI: this.pago.P_NNUMORI,
            P_NTYPEOP: this.pago.P_NTYPEOP,
            P_DFECINI: this.pago.P_DFECINI,
            P_DFECFIN: this.pago.P_DFECFIN,
        };
    
        this.InterfaceMonitoringCBCOService.MostrarTotalesMontos(idata).toPromise().then(
            (response) => {
                
                // Verifica la estructura exacta de response
                if (response.Result && response.Result.P_LIST && Array.isArray(response.Result.P_LIST)) {
                    // Filtra los datos por tipo de moneda
                    const montoSolesObj = response.Result.P_LIST.find(item => item.DES_MONEDA == 'SOLES');
                    const montoDolaresObj = response.Result.P_LIST.find(item => item.DES_MONEDA == 'DOLAR AMERICANO');

                    // Asignación de montos
                    this.montoSoles = montoSolesObj ? montoSolesObj.NMTO_PENSION : 0;
                    this.montoDolares = montoDolaresObj ? montoDolaresObj.NMTO_PENSION : 0;
    
                    this.mostrarMontos = true; // Muestra los inputs solo si hay datos
                    this.mostrarFecha = true; // INI JICI 14-08-2024 FIN
                } else {
                    console.warn('La respuesta P_LIST no es un array o es undefined.');
                }
            },
            (error) => {
                console.error('Error al obtener los datos:', error);
            }
        );
    }

    GetFechaAprobacionOP(data){
        console.log(data)
        this.InterfaceMonitoringCBCOService.GetFechaAprobacionOP(data).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                        console.log(res)
                        console.log(res.Result.P_DATE_APROB)
                        console.log(new Date(res.Result.P_DATE_APROB))
                        this.pago.P_DFEC_APROB = new Date(res.Result.P_DATE_APROB)
                   
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al obtener el horario de interfaz.', 'error');
            }
        )
        
    }
       
    


    setFechaAprobacion(P_DATE_SYSTEM: Date): void {
        const medioDia = new Date(P_DATE_SYSTEM);
        medioDia.setHours(12, 0, 0, 0); // Establecemos la hora a las 12:00 PM
        console.log('Fecha original:', P_DATE_SYSTEM);
        console.log('Medio día:', medioDia);
      
        if (P_DATE_SYSTEM.getTime() > medioDia.getTime()) {
          // Si la hora es mayor que el mediodía, sumamos un día
          const nuevaFecha = new Date(P_DATE_SYSTEM);
          nuevaFecha.setDate(nuevaFecha.getDate() + 1);
          console.log('Fecha después de sumar un día (si era después del mediodía):', nuevaFecha);
          P_DATE_SYSTEM = nuevaFecha;
        }
      
        // Verificamos si el día es sábado o domingo
        let diaSemana = P_DATE_SYSTEM.getDay(); // 0 = domingo, 6 = sábado
        console.log('Día de la semana (0 = Domingo, 6 = Sábado):', diaSemana);
      
        if (diaSemana === 6) {
          // Si es sábado, movemos a lunes (2 días más)
          P_DATE_SYSTEM.setDate(P_DATE_SYSTEM.getDate() + 2);
          console.log('Es sábado, ajustamos a lunes:', P_DATE_SYSTEM);
        } else if (diaSemana === 0) {
          // Si es domingo, movemos a lunes (1 día más)
          P_DATE_SYSTEM.setDate(P_DATE_SYSTEM.getDate() + 1);
          console.log('Es domingo, ajustamos a lunes:', P_DATE_SYSTEM);
        }
      
        // Asignamos la fecha calculada a this.pago.P_DFEC_APROB
        this.pago.P_DFEC_APROB = P_DATE_SYSTEM;
        console.log('Fecha final asignada a P_DFEC_APROB:', this.pago.P_DFEC_APROB);
      }
      

    initDates = () => {
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.pago.P_DFECINI = this.diaActual;
        this.pago.P_DFECFIN = this.diaActual;
    }

    getParams = () => {
        let $origen = this.InterfaceMonitoringCBCOService.ListarOrigenRentas();
        let $pagoSiniestro = this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: 0 });
        let $montoTotales = this.InterfaceMonitoringCBCOService.MostrarTotalesMontos({ P_NNUMORI: 0 });
        return forkJoin([$origen, $pagoSiniestro, $montoTotales]).subscribe(
            res => {
                this.origen = res[0].Result.P_LIST;
                this.pagoSiniestro = res[1].Result.P_LIST;
                this.montoTotales = res[2].Result.P_LIST;
            },
            err => { 
                swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        )
    }

    changeOrigin = (e) => {
        this.ListarPagoSiniestro(e);
        this.pago.P_NTYPEOP = 0;
    }

    ListarPagoSiniestro = (e) => {
        this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: e }).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.pagoSiniestro = res.Result.P_LIST;
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al obtener los pagos de siniestro.', 'error');
            }
        )
    }

    search = (i) => {
        this.checked = false;
        if (new Date(this.pago.P_DFECINI) > new Date(this.pago.P_DFECFIN)) {
            swal.fire('Información', 'La fecha de inicio no puede ser mayor a la fecha de fin.', 'warning');
            return;
        }
        if (this.pago.P_NNUMORI == 0) {
            swal.fire('Información', 'Debe seleccionar el origen.', 'warning');
            return;
        } else {
            if (this.pago.P_NTYPEOP == 0) {
                swal.fire('Información', 'Debe seleccionar el pago siniestro.', 'warning');
                return;
            }
        }
        if (this.pago.P_NNUMORI == 2) {
            if (this.pago.P_NTYPEOP == 7) {
                this.seacsaDirecto = false;
                this.seacsaAFP = true;
                this.ahorroDirecto = false;
            } else {
                this.seacsaDirecto = true;
                this.seacsaAFP = false;
                this.ahorroDirecto = false;
            }
        } else {
            this.seacsaDirecto = false;
            this.seacsaAFP = false;
            this.ahorroDirecto = true;
        }
        const data = {
            "P_NNUMORI": this.pago.P_NNUMORI,
            "P_DATE_EVALU": new Date(),
        }
        this.GetFechaAprobacionOP(data)
        this.montosTotales();
        this.listarPagos(i);
    }

    open = (content, item) => {
        let temp = {
            P_NNUMORI: item.NNUMORI,
            P_NTYPEOP: item.NTYPEPAGO,
            P_SCOD_AFP: item.SCOD_AFP,
            P_SCOD_BANCO: item.SCOD_BANCO,
            P_SCOD_VIAPAGO: item.SCOD_VIAPAGO,
            P_SCOD_MONEDA: item.SCOD_MONEDA,
            P_DFECINI: this.pago.P_DFECINI,
            P_DFECFIN: this.pago.P_DFECFIN,
            P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username,
            P_NOPTION: 0
        };

        this.liquidoTotal = item.NMTO_LIQPAGAR;
    
        // Condición para mostrar los cuatro campos
        if (item.NNUMORI == 2 && (item.NTYPEPAGO == 7 || item.NTYPEPAGO == 77)) {
            this.saludTotal = item.NMTO_LIQSALUD;
            this.retencionTotal = item.NMTO_LIQRJUD;
            this.montoTotal = item.NMTO_PENSION;
        } else {
            // Mostrar solo montoTotal, los demás campos como null
            this.saludTotal = null;
            this.retencionTotal = null;
            this.montoTotal = null;
        }
    
        this.listarDetalle(temp);
        this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
    }

    listarPagos = (i) => {
        this.InterfaceMonitoringCBCOService.ListarAprobacionesRentasRes(this.pago).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.currentPage = 1;
                    this.pagos = res.Result.P_LIST;
                    this.totalItems = this.pagos.length;
                    this.listToShow = this.pagos.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.pagos.length == 0 && i == 1) {
                        swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener los pagos de pensión.', 'error'); }
        )
    }

    listarDetalle = (item) => {
        this.InterfaceMonitoringCBCOService.ListarAprobacionesRentasDet(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.currentPageDet = 1;
                    this.detalles = res.Result.P_LIST;
                    this.totalItemsDet = this.detalles.length;
                    this.listToShowDet = this.detalles.slice(
                        (this.currentPageDet - 1) * this.itemsPerPageDet,
                        this.currentPageDet * this.itemsPerPageDet
                    );
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener el detalle de pago de pensión.', 'error'); }
        )
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.pagos.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    pageChangedDet = (currentPageDet) => {
        this.currentPageDet = currentPageDet;
        this.listToShowDet = this.detalles.slice(
            (this.currentPageDet - 1) * this.itemsPerPageDet,
            this.currentPageDet * this.itemsPerPageDet
        );
    }

    checkAllProc = () => {
        for (var i = 0; i < this.pagos.length; i++) {
            this.pagos[i].IS_SELECTED = this.checked;
        }
        this.getCheckedProcList();
    }

    checkProc = () => {
        this.checked = this.pagos.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedProcList();
    }

    getCheckedProcList = () => {
        this.checkedProc = [];
        this.checkedProcSend = [];
        for (var i = 0; i < this.pagos.length; i++) {
            if (this.pagos[i].IS_SELECTED) {
                this.checkedProc.push(this.pagos[i]);
            }
        }
        this.checkedProcSend.push(this.checkedProc);
    }

    AprobarPagos = (item) => {
        this.InterfaceMonitoringCBCOService.AprobarPagos(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    swal.fire('Información', 'Se aprobaron los pagos exitosamente.', 'success');
                    this.checkedProcSend[0] = 0;
                    this.checked = false;
                    this.search(2);
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al aprobar los pagos de pensión.', 'error');
            }
        )
    }

    limpiar = () => {
        this.checked = false;
        this.pago.P_NNUMORI = 0;
        this.pago.P_NTYPEOP = 0;
        //this.pago.P_SPOLIZA = '';
        this.pago.P_DFECINI = this.diaActual;
        this.pago.P_DFECFIN = this.diaActual;
        this.pagos = [];
        this.mostrarMontos = false;
    }

    GetFechaAprobacionOPtwo(data){
        let temp = this.pagos.filter(item => item.IS_SELECTED == true);
        if (temp.length > 0) {
            this.InterfaceMonitoringCBCOService.GetFechaAprobacionOP(data).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        if (new Date(res.Result.P_DATE_APROB).toDateString() != new Date(this.pago.P_DFEC_APROB).toDateString()) {
                            if(new Date(this.pago.P_DFEC_APROB).toDateString() >= new Date().toDateString()){
                                    console.log(this.pagos[0])
                                    const data = {
                                        "P_NNUMORI": this.pagos[0].NNUMORI,
                                        "P_NCODGRU": 7,
                                        "P_NBRANCH": this.pagos[0].NNUMORI
                                    }
                                    this.InterfaceMonitoringCBCOService.GetHorarioInterfaz(data).subscribe(
                                        res => {
                                                if(res.Result.P_NHOUR_TODAY > res.Result.P_NHORARIO){
                                                    swal.fire({
                                                        title: "La aprobación se encuentra fuera del horario de interfaz. ¿Desea aprobar la orden de pago con la fecha seleccionada?",
                                                        icon: "question",
                                                        showDenyButton: true,
                                                        confirmButtonText: "Si",
                                                        denyButtonText: `No`
                                                      }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log(res)
                                                            console.log(res.Result.P_DATE_APROB)
                                                            console.log(new Date(res.Result.P_DATE_APROB))
                                                            console.log(this.pago.P_DFEC_APROB )
                    
                                                           this.confirmaraprobar()
                                                        }
                                                    });
                                                }else{
                                                    this.confirmaraprobar()
                                                }
                                        },
                                        err => {
                                            swal.fire('Información', 'Ha ocurrido un error al obtener el horario de interfaz.', 'error');
                                        }
                                    )
                            }else{
                                    this.confirmaraprobar()
                            }    
                        } else {
                            this.confirmaraprobar()
                        }
                    } else {
                        swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                    }
                },
                err => {
                    swal.fire('Información', 'Ha ocurrido un error al obtener el horario de interfaz.', 'error');
                }
            )
        } else {
            swal.fire('Información', 'Debe seleccionar al menos un registro.', 'warning');
        }
    }

    aprobar = () => {
        const data = {
            "P_NNUMORI": this.pago.P_NNUMORI,
            "P_DATE_EVALU": new Date(),
        }
        this.GetFechaAprobacionOPtwo(data)
    }

    confirmaraprobar(){
        swal.fire(
            {
                title: '¿Está seguro de aprobar los registros seleccionados?',
                text: 'Esta acción es irreversible.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then(
            (result) => {
                if (result.value) {
                    let aprobadosArray = { P_LIST: [] };
                    for (var i = 0; i < this.checkedProcSend[0].length; i++) {
                        // var item: any = {};
                        // item.P_NIDCHEQUE = this.checkedProcSend[0][i].NIDCHEQUE;
                        // item.P_SUSR_APROB = JSON.parse(localStorage.getItem('currentUser')).username;
                        let temp = {
                            P_NNUMORI: this.checkedProcSend[0][i].NNUMORI,
                            P_NTYPEOP: this.checkedProcSend[0][i].NTYPEPAGO,
                            P_SCOD_AFP: this.checkedProcSend[0][i].SCOD_AFP,
                            P_SCOD_BANCO: this.checkedProcSend[0][i].SCOD_BANCO,
                            P_SCOD_VIAPAGO: this.checkedProcSend[0][i].SCOD_VIAPAGO,
                            P_SCOD_MONEDA: this.checkedProcSend[0][i].SCOD_MONEDA,
                            P_DFECINI: this.pago.P_DFECINI,
                            P_DFECFIN: this.pago.P_DFECFIN,
                            P_DFEC_APROB: this.pago.P_DFEC_APROB,
                            P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username,
                            P_NOPTION: 1
                        }
                        aprobadosArray.P_LIST.push(temp);
                    }
                    this.AprobarPagos(aprobadosArray);
                    // this.checkedProcSend[0] = 0;
                    // this.checked = false;
                }
            }
        )
    }


    downloadRes = () => {
        if (this.pagos.length == 0) {
            swal.fire('Información', 'Debe realizar una búsqueda para exportar.', 'warning');
            return;
        }
        this.GetDataReportRentasRes();
    }

    downloadDet = (item) => {
        let temp = {
            P_NNUMORI: item.NNUMORI,
            P_NTYPEOP: item.NTYPEPAGO,
            P_SCOD_AFP: item.SCOD_AFP,
            P_SCOD_BANCO: item.SCOD_BANCO,
            P_SCOD_VIAPAGO: item.SCOD_VIAPAGO,
            P_SCOD_MONEDA: item.SCOD_MONEDA,
            P_DFECINI: this.pago.P_DFECINI,
            P_DFECFIN: this.pago.P_DFECFIN,
            P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username
        }
        this.GetDataReportRentasDet(temp);
    }

    GetDataReportRentasRes = () => {
        this.InterfaceMonitoringCBCOService.GetDataReportRentasRes(this.pago).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Rentas_Resumen.xlsx',
                            { type: 'text/xls' }
                        );
                        FileSaver.saveAs(file);
                    }                                    
                }                
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }            
        )
    }

    GetDataReportRentasDet = (item) => {
        this.InterfaceMonitoringCBCOService.GetDataReportRentasDet(item).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Rentas_Detalle.xlsx',
                            { type: 'text/xls' }
                        );
                        FileSaver.saveAs(file);
                    }                                    
                }                
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }            
        )
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
    }
}