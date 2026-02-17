export class NotificationRequest {
  idProcess: string;
  tipoNotificacion: string;
  email: string;
  telefono: number;
  asegurado: string;
  nroDocumento: string;
  fechaNacimiento: string;
  primaInicial: string;
  primaMensual: string;
  primaAnual: string;
  fechaSolicitud: string;
  monedaDescripcion: string;
  monedaSimbolo: string;
  cantidadAnios: string;
  porcentajeDevolucion: string;
  capital: string;
  primaRetorno: string;
  primaFallecimiento: string;

  // *IDECON
  isIdNumber: boolean;
  isPep: boolean;
  isFamPep: boolean;
  isIdNumberFamPep: boolean;
  isOtherList: boolean;
  TotalDeuda: number;
  // *PEP + WORLDCHECK
  experianRisk: boolean;
  isOtherListWC: boolean;
  isIdNumberWC: boolean;
  isPepWC: boolean;

  TotalPolizas: number;
  SumaAsegurada: number ;
  CumuloMaximo: number ;
  registroNegativo: boolean;

  constructor(payload: NotificationRequest) {
    this.idProcess = Number(payload.idProcess) < 0 ? '0' : payload.idProcess;
    this.tipoNotificacion = payload.tipoNotificacion;
    this.email = payload.email;
    this.telefono = payload.telefono;
    this.asegurado = payload.asegurado;
    this.nroDocumento = payload.nroDocumento;
    this.fechaNacimiento = payload.fechaNacimiento;
    this.primaInicial = payload.primaInicial;
    this.primaMensual = payload.primaMensual;
    this.primaAnual = payload.primaAnual;
    this.fechaSolicitud = payload.fechaSolicitud;
    this.monedaDescripcion = payload.monedaDescripcion;
    this.monedaSimbolo = payload.monedaSimbolo;
    this.cantidadAnios = payload.cantidadAnios;
    this.porcentajeDevolucion = payload.porcentajeDevolucion;
    this.capital = payload.capital;
    this.primaRetorno = payload.primaRetorno;
    this.primaFallecimiento = payload.primaFallecimiento;
    this.isIdNumber = payload.isIdNumber;
    this.isPep = payload.isPep;
    this.isFamPep = payload.isFamPep;
    this.isIdNumberFamPep = payload.isIdNumberFamPep;
    this.isOtherList = payload.isOtherList;
    this.TotalDeuda = payload.TotalDeuda ;
    this.TotalPolizas = payload.TotalPolizas;
    this.SumaAsegurada = payload.SumaAsegurada;
    this.CumuloMaximo = payload.CumuloMaximo;
    this.experianRisk = payload?.experianRisk ? payload.experianRisk : false;
    this.isOtherListWC = payload?.isOtherListWC ? payload.isOtherListWC : false;
    this.isIdNumberWC = payload?.isIdNumberWC ? payload.isIdNumberWC : false;
    this.isPepWC = payload?.isPepWC ? payload.isPepWC : false;
    this.registroNegativo = payload?.registroNegativo || false;
  }
}
