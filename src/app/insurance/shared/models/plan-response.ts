import { BenefitResponse } from './benefit-response';
import { CoverageDto } from './coverage.model';
import { ServiceResponse } from './service-response';
export class PlanResponse {
  id: number;
  aplicaPlan: boolean;
  descripcion: string;
  codigoProceso: string;
  codigoSegmento: string;
  prima: number;
  coberturas: Array<CoverageDto>;
  beneficios: Array<BenefitResponse>;
  asistencias: Array<ServiceResponse>;
  idTarifario?: string;
  nombreTarifario?: string;
  versionTarifario?: string;

  constructor({
    id,
    descripcion,
    codigoProceso,
    codigoSegmento,
    prima,
    coberturas = [],
    beneficios = [],
    asistencias = [],
    idTarifario,
    nombreTarifario,
    versionTarifario,
    aplicaPlan,
  }) {
    this.id = id;
    this.descripcion = descripcion;
    this.codigoProceso = codigoProceso;
    this.codigoSegmento = codigoSegmento;
    this.prima = prima;
    this.coberturas = coberturas.map((c) => ({
      capital: c.capital,
      capitalAutorizado: c.capitalAutorizado,
      capitalMaxima: c.capitalMaxima,
      capitalMinima: c.capitalMinima,
      capitalPropuesto: c.capitalPropuesto,
      cobertura: c.cobertura,
      descripcion: c.descripcion,
      edadEntrada: c.edadEntrada,
      edadPermanencia: c.edadPermanencia,
      horas: c.horas,
      limite: c.limite,
      id: c.id,
      obligatoria: c.obligatoria,
      sumaAsegurada: c.sumaAsegurada,
      sumaAseguradaCubierta: c.sumaAseguradaCubierta,
      required: c.required,
      idCobertura: c.idCobertura,
    }));
    this.beneficios = beneficios.map((b) => ({
      id: b.id,
      descripcion: b.description,
    }));
    this.asistencias = asistencias.map((a) => ({
      id: a.id,
      descripcion: a.description,
      proveedor: a.proveedor,
      documento: a.documento,
    }));
    this.idTarifario = idTarifario;
    this.nombreTarifario = nombreTarifario;
    this.versionTarifario = versionTarifario;
    this.aplicaPlan = aplicaPlan;
  }
}
