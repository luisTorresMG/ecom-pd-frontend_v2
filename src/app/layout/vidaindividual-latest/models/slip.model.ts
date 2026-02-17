export class SlipRequest {
  idProcess: number;
  asegurado: string;
  nroDocumento: string;
  correo: string;
  fechaNacimiento: string;
  primaMensual: string;
  primaAnual: string;
  primaInicial: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  fechaInicio: string;
  fechaFin: string;
  monedaDescripcion: string;
  monedaSimbolo: string;
  cantidadAnios: string;
  porcentajeDevolucion: string;
  capital: string;
  primaRetorno: string;
  primaFallecimiento: string;
  idTarifario: string;

  descPrima: number;
  descPrimeraCuota: number;
  primaMensualTotal: number;
  primeraTotal: number;
  idFrecuencia: number;
  frecuencia: string;

  contratante: {
    nombre: string;
    nrodocumento: string;
    fechanacimiento: string;
    correo: string;
  };
  constructor({
    idProcess,
    idTarifario,
    asegurado,
    nroDocumento,
    primaInicial,
    correo,
    fechaNacimiento,
    primaMensual,
    primaAnual,
    fechaSolicitud,
    fechaVencimiento,
    fechaInicio,
    fechaFin,
    monedaDescripcion,
    monedaSimbolo,
    cantidadAnios,
    porcentajeDevolucion,
    capital,
    primaRetorno,
    primaFallecimiento,
    descPrima,
    descPrimeraCuota,
    primaMensualTotal,
    primeraTotal,
    idFrecuencia,
    frecuencia,
    contratante
  }) {
    this.idProcess = idProcess;
    this.idTarifario = idTarifario;
    this.asegurado = asegurado;
    this.nroDocumento = nroDocumento;
    this.correo = correo;
    this.fechaNacimiento = fechaNacimiento;
    this.descPrima = descPrima;
    this.descPrimeraCuota = descPrimeraCuota;
    this.primaMensualTotal = primaMensualTotal;
    this.primeraTotal = primeraTotal;
    this.idFrecuencia = idFrecuencia;
    this.frecuencia = frecuencia;
    this.primaMensual = primaMensual;
    this.primaAnual = primaAnual;
    this.fechaSolicitud = fechaSolicitud;
    this.fechaVencimiento = fechaVencimiento;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.monedaDescripcion = monedaDescripcion;
    this.monedaSimbolo = monedaSimbolo;
    this.cantidadAnios = cantidadAnios;
    this.porcentajeDevolucion = porcentajeDevolucion;
    this.capital = capital;
    this.primaRetorno = primaRetorno;
    this.primaFallecimiento = primaFallecimiento;
    this.primaInicial = primaInicial;
    this.contratante = contratante;
  }
}
