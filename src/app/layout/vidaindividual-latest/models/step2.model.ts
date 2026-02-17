import { BeneficiarioDto } from './beneficiario.model';
export class Step2Request {
  idProcess: number;
  idTarifario: number;
  moneda: number;
  cantidadAnio: number;
  fechaInicio: string;
  fechaFin: string;
  capital: number;
  primaInicial: number;
  primaMensual: number;
  primaAnual: number;
  primaRetorno: number;
  plan: number;
  porcentajeRetorno: string;
  beneficiarioLegal: string;
  beneficiarios: BeneficiarioDto[];
  idFrecuencia: number;
  frecuencia: string;
  descPrima: number;
  descPrimeraCuota: number;
  constructor({
    idProcess,
    idTarifario,
    cantidadAnio,
    moneda,
    fechaInicio,
    fechaFin,
    capital,
    primaInicial,
    primaMensual,
    primaAnual,
    primaRetorno,
    plan,
    porcentajeRetorno,
    beneficiarioLegal,
    beneficiarios,
    idFrecuencia,
    frecuencia,
    descPrima,
    descPrimeraCuota,
  }) {
    this.idProcess = idProcess;
    this.idTarifario = idTarifario;
    this.moneda = moneda;
    this.cantidadAnio = cantidadAnio;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.capital = capital;
    this.primaInicial = primaInicial;
    this.primaMensual = primaMensual;
    this.primaAnual = primaAnual;
    this.primaRetorno = primaRetorno;
    this.idFrecuencia = idFrecuencia;
    this.frecuencia = frecuencia;
    this.descPrima = descPrima;
    this.descPrimeraCuota = descPrimeraCuota;
    this.plan = plan;
    this.porcentajeRetorno = porcentajeRetorno;
    this.beneficiarioLegal = Number(beneficiarioLegal).toString();
    this.beneficiarios = beneficiarios.map((val) => ({
      relacion: val.relacion,
      porcentajeParticipacion: val.porcentajeParticipacion,
      idTipoPersona: val.idTipoPersona,
      idTipoDocumento: val.idTipoDocumento,
      numeroDocumento: val.numeroDocumento,
      nombre: val.nombre,
      apellidoPaterno: val.apellidoPaterno,
      apellidoMaterno: val.apellidoMaterno,
      departamento: val.departamento,
      provincia: val.provincia,
      distrito: val.distrito,
      direccion: val.direccion,
      email: val.email,
      telefono: val.telefono,
      idNacionalidad: val.idNacionalidad,
      nacionalidadDesc: val.nacionalidadDesc,
      idSexo: val.idSexo,
      fechaNacimiento: val.fechaNacimiento
    }));
  }
}
export class Step2Response {
  errorMessage: string;
  idProccess: number;
  success: boolean;
  constructor({
    errorMessage,
    idProccess,
    success
  }) {
    this.errorMessage = errorMessage;
    this.idProccess = idProccess;
    this.success = success;
  }
}
