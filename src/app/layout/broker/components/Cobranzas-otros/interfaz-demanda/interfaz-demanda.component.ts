import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { InterfaceMonitoringService } from '../../../../backoffice/services/interface-monitoring/interface-monitoring.service';
import { InterfaceDemandService } from '../../../../backoffice/services/interface-demand/interface-demand.service';

import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// CABECERA
export interface FiltroRamos {
    NNUMORI?: number;
    FLAG?: number;
}
export interface FiltroInterfaz {
    mvt_nnumori?: number;
}

export interface FiltroInterfazDemanda{
    NNUMORI?: number;
    NCODGRU?: number;
    NBRANCH?: number;
}

export interface FiltroValidacionesInterfazDemanda{
    NNUMORI?: number;
    NCODGRU?: number;
    NBRANCH?: number;
}
export interface SolicitudInterfazDemanda{
    SCID_EJEC?: string;
    NNUMORI?: number;
    NCODGRU?: number;
    NBRANCH?: number;
    S_VC_USER?: string;
}

export interface ValidacionesFechaCierrePorInterfaz{
    NCODCONFIG?: number;
    NNUMORI?: number;
    NCODGRU?: number;
    VALOR1?: number;
    VALOR2?: number;
    NSTATUS?: number;
}

export interface ResultadoFechasCierre {
  fechaIni: Date | null;
  fechaFin: Date | null;
  fechaCierre: Date | null;
  mensaje?: string;
  tipo?: 'warning' | 'error';
}

@Component({
    selector: 'app-interfaz-demanda',
    templateUrl: './interfaz-demanda.component.html',
    styleUrls: ['./interfaz-demanda.component.css']
})
export class InterfazDemandaComponent implements OnInit {
    interfazElegido:          number = 0;
    diasAntesDelCierre:       number = 0 ;
    diasDespuesDelCierre:     number = 0;
    filterForm:               FormGroup;
    filtroRamos:              FiltroRamos;
    filtroInterfaz:           FiltroInterfaz;
    filtroInterfazDemanda:    FiltroInterfazDemanda;

    SolicitudInterfazDemanda: SolicitudInterfazDemanda;
    origen:                   any     = [];
    ramos:                    any     = [];
    interfaces:               any     = [];
    procesandoSolicitud:      boolean =false;
    HabilitarBotonProcesar:   boolean = false;
    descripcionRamo:          String  ='';
    descripcionInterfaz:      String  ='';
    fechaIni:                 Date    =null;
    fechaFin:                 Date    = null;
    fechaCierre:              Date    = null;
    constructor(
        private formBuilder:                FormBuilder,
        private interfaceMonitoringService: InterfaceMonitoringService,
        private interfaceDemand:            InterfaceDemandService
    )
    {
    }
    ngOnInit(): void {
      this.createForm();
      this.inicializarFiltros();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            NNUMORI:      [1],
            NCODGRU:      [0],
            NBRANCH:      [0],
            NSTATUS_SEND: [null],
            DPROCESS_INI: [null],
            DPROCESS_FIN: [null],
            NIDPROCESS:   ['', [Validators.pattern(/^[0-9]*$/)]],
            NRECEIPT:     [''],
            CLAIM_MEMO:   [''],
            NPOLICY:      ['']
        });
    }

    inicializarFiltros = () => {
        this.filtroRamos =
        {
          NNUMORI: 1,
          FLAG:0,
        };
        this.filtroInterfaz =
        {
          mvt_nnumori: 1
        };
        this.getParams();
    }

async getParams(): Promise<void> {
  this.procesandoSolicitud = true;

  try {
    const origen$     = this.interfaceMonitoringService.listarOrigen();
    const ramos$      = this.interfaceMonitoringService.listarRamos(this.filtroRamos);
    const interfaces$ = this.interfaceMonitoringService.listarInterfaces(this.filtroInterfaz);

    const [origenRes, ramosRes, interfacesRes] = await forkJoin([
      origen$,
      ramos$,
      interfaces$
    ]).toPromise();

    this.origen     = origenRes.Result.combos;
    this.ramos      = ramosRes.Result.combos;
    this.interfaces = interfacesRes.Result.lista;

  } catch (error) {
    this.mostrarMensaje(
      'Información',
      'Ha ocurrido un error al obtener los parámetros.',
      'error'
    );
  } finally {
    this.procesandoSolicitud = false;
  }
}

    mostrarMensaje(cabecera:string, contenido: string, tipoMensaje: 'success' | 'error' | 'warning' | 'info' | 'question'){
    Swal.fire(cabecera, contenido, tipoMensaje);
    }

async procesarInterfaz(): Promise<void> {
  try
  {
    const filtro = this.obtenerFiltroInterfazDemanda();
    if(filtro.NBRANCH !=0 && filtro.NCODGRU != 0 && filtro.NNUMORI !=0)
    {
                   await this.setearRamos_Interfaz(filtro);
    const fechas = await this.obtenerFechasCierre(filtro);
                   await this.aplicarFechas(fechas);
                   await this.setearFechasFormularioInterfaz(fechas);
                   await this.obtenerConfiguracionCierrexInterfaz(filtro);
                   await this.validarPeriodoActivoInterfaz(fechas);
    }
  }
  catch (error) {
    this.HabilitarBotonProcesar = false;

    if (error?.mensaje) {
      this.mostrarMensaje(
        'Información',
        error.mensaje,
        error.tipo ?? 'warning'
      );
    }
  }
}

private obtenerFiltroInterfazDemanda(): FiltroInterfazDemanda {
  const { NNUMORI, NCODGRU, NBRANCH } = this.filterForm.value;
  return { NNUMORI, NCODGRU, NBRANCH };
}

private async obtenerFechasCierre(
  filtro: FiltroInterfazDemanda
): Promise<ResultadoFechasCierre> {

  this.procesandoSolicitud = true;

  try {
    const response = await this.interfaceDemand
      .obtenerFechaDeCierreDelaInterfaz(filtro)
      .toPromise();
    console.log('obtenerFechasCierre',response);
    if (response?.NCODE === 0) {
      return {
        fechaIni:    response.DFECINI ? new Date(response.DFECINI) : null,
        fechaFin:    response.DFECFIN ? new Date(response.DFECFIN) : null,
        fechaCierre: response.DFECCIERRE ? new Date(response.DFECCIERRE) : null
      };
    }
    return {
      fechaIni: null,
      fechaFin: null,
      fechaCierre: null,
      mensaje: response?.SMESSAJE ?? 'No se pudo obtener fechas de cierre',
      tipo: 'warning'
    };

  } catch (error) {
    throw {
      mensaje: error?.mensaje
               ?? error?.error?.SMESSAJE ??
               'Error al obtener fechas de cierre',
      tipo:    'error'
    };
  } finally {
    this.procesandoSolicitud = false;
  }
}

private aplicarFechas(fechas: {
  fechaIni:    Date;
  fechaFin:    Date;
  fechaCierre: Date;
}): Promise<void> {

  if (!fechas.fechaIni || !fechas.fechaFin) {
    this.limpiarFormularioInterfaz();
    return Promise.reject({
      mensaje: `No existe un periodo válido para la interfaz:  ${this.descripcionInterfaz} y el ramo: ${this.descripcionRamo} `,
      tipo: 'warning'
    });
  }
  return Promise.resolve();
}

limpiarFormularioInterfaz()
{
      this.filterForm.patchValue({
      DPROCESS_INI: '',
      DPROCESS_FIN: ''
    });
}
private setearFechasFormularioInterfaz(fechas: {
  fechaIni: Date | null;
  fechaFin: Date | null;
}): Promise<void> {

  const formatDate = (date: Date | null): string | null =>
                      date ? date.toISOString().split('T')[0] : null;

  if (!fechas.fechaIni || !fechas.fechaFin) {
    this.filterForm.patchValue({
      DPROCESS_INI: null,
      DPROCESS_FIN: null
    });

    return Promise.resolve();
  }

  this.filterForm.patchValue({
    DPROCESS_INI: formatDate(fechas.fechaIni),
    DPROCESS_FIN: formatDate(fechas.fechaFin)
  });

  return Promise.resolve();
}


private setearRamos_Interfaz(
filtro: FiltroInterfazDemanda
): Promise<void> {
  const ramo = this.ramos.find(
                x => x.NBRANCH == filtro.NBRANCH
                );
  const interfaz = this.interfaces.find(
                    x => x.mvt_ncodgru == filtro.NCODGRU
                    );
  this.descripcionRamo     = ramo ? ramo.SBRANCH_DESC : '';
  this.descripcionInterfaz = interfaz ? interfaz.mvt_cdescri : '';
    return Promise.resolve();
}

private validarPeriodoActivoInterfaz(fechas: {fechaCierre: Date}): Promise<void> {
  const hoy = Date.now();

  if(this.diasAntesDelCierre != 0 || this.diasDespuesDelCierre !=0)
  {
    if (!fechas.fechaCierre) {
    return Promise.reject({
      mensaje: 'No existe fecha de cierre configurada',
      tipo:    'warning'
    });
  }
  const inicio = new Date(fechas.fechaCierre);
  inicio.setDate(inicio.getDate() - this.diasAntesDelCierre);

  const fin = new Date(fechas.fechaCierre);
  fin.setDate(fin.getDate() + this.diasDespuesDelCierre);
  if (hoy < inicio.getTime() || hoy > fin.getTime()) {

    return Promise.reject({
      mensaje: `El periodo para ejecutar la interfaz: ${this.descripcionInterfaz} y el ramo: ${this.descripcionRamo}
                no se encuentra disponible debido a configuraciones internas`,
      tipo:    'warning'
    });
  }
}
else{
      this.HabilitarBotonProcesar = true;
}



  return Promise.resolve();
}

async obtenerConfiguracionCierrexInterfaz(
  filtro: FiltroInterfazDemanda
): Promise<void> {

  this.procesandoSolicitud = true;

  try {
    const response = await this.interfaceDemand
      .obtenerConfiguracionCierrexInterfaz(filtro)
      .toPromise();

    console.log('obtenerConfiguracionCierrexInterfaz', response);

    if (response?.respuestaInterfaz?.NCODE === 0) {

      if (response?.listaDeCondiciones?.length > 0) {
        const condicion           = response.listaDeCondiciones[0];
        this.diasAntesDelCierre   = condicion.DIAS_ANT ?? 0;
        this.diasDespuesDelCierre = condicion.DIAS_POS ?? 0;
      } else {
        this.diasAntesDelCierre   = 0;
        this.diasDespuesDelCierre = 0;
      }

      return;
    }

    throw {
      mensaje: response?.respuestaInterfaz?.SMESSAJE
               ?? 'No se pudo obtener configuración de cierre',
      tipo:    'warning'
    };

  } catch (error) {
    throw {
      mensaje: error?.mensaje
               ?? error?.error?.SMESSAJE
               ?? 'Error al obtener configuración de cierre',
      tipo:    error?.tipo ?? 'error'
    };
  } finally {
    this.procesandoSolicitud = false;
  }
}



async enviarSolicitudInterfazDemanda(): Promise<void> {

  const user = JSON.parse(localStorage.getItem('currentUser'));

  const { NNUMORI, NCODGRU, NBRANCH, DPROCESS_INI, DPROCESS_FIN } =
    this.filterForm.value;

  if (!DPROCESS_INI || !DPROCESS_FIN) {
    this.mostrarMensaje(
      'Información',
      'No se puede enviar la solicitud porque no hay un periodo activo',
      'warning'
    );
    return;
  }

  this.SolicitudInterfazDemanda = {
    NNUMORI,
    NCODGRU,
    NBRANCH,
    S_VC_USER: user.username
  };

  this.procesandoSolicitud = true;

  try {
    const response = await this.interfaceDemand
      .EnviarSolicitudInterfazDemanda(this.SolicitudInterfazDemanda)
      .toPromise();

    this.mostrarMensaje(
      'Solicitud enviada',
      `Se procesó la solicitud a demanda para la interfaz: ${this.descripcionInterfaz} y el ramo: ${this.descripcionRamo}`,
      'success'
    );

  } catch (error) {


    if (error?.status == 500) {
      const body = error.error;
      this.mostrarMensaje(
        'Información',
        body?.SMESSAJE ?? 'Error interno del servidor',
        'error'
      );
      return;
    }

    this.mostrarMensaje(
      'Información',
      error?.mensaje ?? 'Error al enviar la solicitud de interfaz',
      'error'
    );

  } finally {
    this.procesandoSolicitud = false;
  }
}


}
