export class ResumenResponse {
  success: boolean;
  dps: string;
  errorMessage: string;
  canalInfo: CanalInfoDto;
  cotizacionInfo: CotizacionInfoDto;
  contratanteInfo: ContratanteInfoDto;
  beneficiariosInfo: Array<BeneficiarioInfoDto>;
  pasosInfo: PasosInfoDto;
  ejecutivos: any;

  constructor(payload: ResumenResponse) {
    this.success = payload.success;
    this.dps = payload.dps;
    this.errorMessage = payload.errorMessage;
    this.canalInfo = payload.canalInfo;
    this.cotizacionInfo = payload.cotizacionInfo;
    this.contratanteInfo = payload.contratanteInfo;
    this.beneficiariosInfo = payload.beneficiariosInfo.map((val) => ({
      apellidoMaterno: val.apellidoMaterno,
      apellidoPaterno: val.apellidoPaterno,
      beneficiariosLegales: val.beneficiariosLegales,
      codigoCliente: val.codigoCliente,
      correo: val.correo,
      departamento: val.departamento,
      direccion: val.direccion,
      distrito: val.distrito,
      estadoCivil: val.estadoCivil,
      fechaNacimiento: val.fechaNacimiento,
      idDepartamento: val.idDepartamento,
      idDistrito: val.idDistrito,
      idEstadoCivil: val.idEstadoCivil,
      idNacionalidad: val.idNacionalidad,
      idOcupacion: val.idOcupacion,
      idParentesco: val.idParentesco,
      idProvincia: val.idProvincia,
      idSexo: val.idSexo,
      idTipoDocumento: val.idTipoDocumento,
      idTipoPersona: val.idTipoPersona,
      nacionalidad: val.nacionalidad,
      nombre: val.nombre,
      numeroDocumento: val.numeroDocumento,
      obligacionFiscal: val.obligacionFiscal,
      ocupacion: val.ocupacion,
      parentesco: val.parentesco,
      porcentajeParticipacion: val.porcentajeParticipacion,
      provincia: val.provincia,
      scoreCrediticio: val.scoreCrediticio,
      sexo: val.sexo,
      telefono: val.telefono,
    }));
    this.pasosInfo = payload.pasosInfo;
  }
}

export class CanalInfoDto {
  codigoIntermed: string;
  codigoCanal: string;
  codigoPuntoVenta: string;
  codigoCanalBroker: string;
  codigoTipoCanalBroker: string;
  codigoClienteBroker: string;
  codigoCanalIntermediario: string;
  codigoTipoCanalIntermediario: string;
  codigoClienteIntermediario: string;
}
export class CotizacionInfoDto {
  idRamo: string;
  ramo: string;
  idProducto: string;
  producto: string;
  numeroPoliza: string;
  numeroCertificado: string;
  idTipoPeriodo: string;
  tipoPeriodo: string;
  cantidadAnios: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  idFrecuenciaPago: string;
  frecuenciaPago: string;
  descPrima: number;
  descPrimeraCuota: number;
  idPlan: string;
  capital: string;
  primaInicial: string;
  primaMensual: string;
  primaAnual: string;
  primaNeta: string;
  igv: string;
  tasa: string;
  porcentajeRetorno: string;
  primaPorcentajeRetorno: string;
  idMoneda: string;
  moneda: string;
  idAsesor: string;
  nombreAsesor: string;
  nombreSupervisor: string;
  nombreJefe: string;
  numeroOperacion: string;
  tipoTarjeta: string;
  tipoPago: string;
  idTarifario: string;
  cliente: string;
  numeroDocumento: string;
  algoritmo: string;
  porcentajeSimilitud: string;
  urlImagen: string;
  fechaEvaluacion: string;
}
export class ContratanteInfoDto {
  beneficiariosLegales: string;
  scoreCrediticio: string;
  obligacionFiscal: string;
  codigoCliente: string;
  idTipoPersona: string;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  idDepartamento: string;
  departamento: string;
  idProvincia: string;
  provincia: string;
  idDistrito: string;
  distrito: string;
  direccion: string;
  correo: string;
  telefono: string;
  idNacionalidad: string;
  nacionalidad: string;
  idOcupacion: string;
  ocupacion: string;
  idEstadoCivil: string;
  estadoCivil: string;
  idSexo: string;
  sexo: string;
  fechaNacimiento: string;
}
export class BeneficiarioInfoDto {
  porcentajeParticipacion: string;
  idParentesco: string;
  parentesco: string;
  beneficiariosLegales: string;
  scoreCrediticio: string;
  obligacionFiscal: string;
  codigoCliente: string;
  idTipoPersona: string;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  idDepartamento: string;
  departamento: string;
  idProvincia: string;
  provincia: string;
  idDistrito: string;
  distrito: string;
  direccion: string;
  correo: string;
  telefono: string;
  idNacionalidad: string;
  nacionalidad: string;
  idOcupacion: string;
  ocupacion: string;
  idEstadoCivil: string;
  estadoCivil: string;
  idSexo: string;
  sexo: string;
  fechaNacimiento: string;
}
export class PasosInfoDto {
  ultimoPaso: string;
  fechaPaso1: string;
  fechaPaso2: string;
  fechaPaso3: string;
  fechaPaso4: string;
}
