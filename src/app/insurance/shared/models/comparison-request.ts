import { BenefitResponse } from './benefit-response';
import { CoverageDto } from './coverage.model';
import { ServiceResponse } from './service-response';

export class ComparisonRequest {
  idProcess: number;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
  idTipoPeriodo: number;
  idFrecuenciaPago: number;
  idTemporalidad: number;
  idAlcance: number;
  idZona: number;
  idZonaRiesgo: number;
  idActividad: number;
  idMoneda: number;
  cantidadTrabajadores: number;
  codigoUsuario: string;
  coberturas: Array<any>;
  beneficios: Array<any>;
  asistencias: Array<any>;
  codigoProcesoPlan: string;
  idTarifario?: string;
  nombreTarifario?: string;
  versionTarifario?: string;
  constructor({
    processId,
    planId,
    startValidity,
    endValidity,
    paymentFrequency,
    activity,
    cantidadTrabajadores,
    idMoneda,
    coverage = [],
    benefits = [],
    services = [],
    temporality,
    scope,
    validityType,
    codigoProcesoPlan,
    idTarifario,
    nombreTarifario,
    versionTarifario
  }) {
    this.idProcess = processId;
    this.plan = planId;
    this.fechaInicio = startValidity;
    this.fechaFin = endValidity;
    this.idFrecuenciaPago = paymentFrequency;
    this.idActividad = activity;
    this.idMoneda = idMoneda;
    this.cantidadTrabajadores = cantidadTrabajadores || 1;
    this.codigoUsuario = '3822';
    this.coberturas = coverage.map((item) => ({
      id: item.id,
      descripcion: item.descripcion,
      seleccionado: Number(item.obligatoria) === 1 || item.selected,
      sumaAsegurada: item.sumaAsegurada,
      sumaPropuesta: item.capital,
      capitalMaximo: item.capitalMaxima,
      capitalMinimo: item.capitalMinima,
      capitalAutorizado: item.capitalAutorizado,
      capitalCubierto: item.sumaAseguradaCubierta,
      edadEntrada: item.edadEntrada,
      edadPermanencia: item.edadPermanencia,
      limite: item.limite,
      idCobertura: item.idCobertura,
    }));
    this.beneficios = benefits;
    this.asistencias = services;
    this.idTipoPeriodo = validityType;
    this.idAlcance = scope;
    this.idZona = 1;
    this.idZonaRiesgo = 14;
    this.idTemporalidad = temporality;
    this.codigoProcesoPlan = codigoProcesoPlan;
    this.idTarifario = idTarifario;
    this.nombreTarifario = nombreTarifario;
    this.versionTarifario = versionTarifario;
  }
}
