export class PreCotizacionRequest {
  idProcess: number;
  fechaInicio: string;
  fechaFin: string;
  plan: {
    idPlan: number;
    idMoneda: number;
    nombrePlan: string;
    codigoProcesoPlan: string;
    montoPrima: number;
  };
  tipoPeriodo: { id: number; descripcion: string; };
  frecuenciaPago: { id: number; descripcion: string; };
  actividad: { id: number; descripcion: string; };
  temporalidad: { id: number; descripcion: string; };
  alcance: { id: number; descripcion: string; };
  mina: {
    idDepartamentoMina: number;
    departamentoMina: string;
    aplicaMina: boolean;
  };
  riesgo: {
    idZona: number;
    idDepartamentoEmpresa: number;
  };
  viaje: {
    idPaisOrigen: number;
    paisOrigen: string;
    idPaisDestino: number;
    paisDestino: string;
    idDepartamentoOrigen: number;
    departamentoOrigen: string;
    idDepartamentoDestino: number;
    departamentoDestino: string;
  };
  siniestralidad: {
    aplicaSiniestralidad: boolean;
    montoSiniestralidad: number;
    montoDeducible: number;
  };
  coberturas: Array<{
    id: number;
    descripcion: string;
    obligatorio: boolean;
    seleccionado: boolean;
    sumaAsegurada: number;
  }>;
  beneficios: Array<{
    id: number;
    descriocion: string;
    seleccionado: boolean;
  }>;
  asistencias: Array<{
    id: number;
    descriocion: string;
    seleccionado: boolean;
  }>;
  constructor(req: PreCotizacionRequest) {
    this.idProcess = req.idProcess;
    this.fechaFin = req.fechaFin;
    this.actividad = req.actividad;
    this.alcance = req.alcance;
    this.asistencias = req.asistencias;
    this.beneficios = req.beneficios;
    this.coberturas = req.coberturas;
    this.fechaInicio = req.fechaInicio;
    this.frecuenciaPago = req.frecuenciaPago;
    this.mina = req.mina;
    this.plan = req.plan;
    this.riesgo = req.riesgo;
    this.siniestralidad = req.siniestralidad;
    this.temporalidad = req.temporalidad;
    this.tipoPeriodo = req.tipoPeriodo;
    this.viaje = req.viaje;
  }
}
