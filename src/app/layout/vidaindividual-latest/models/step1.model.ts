import { AgesDto } from './ages.model';
export class Step1Request {
  idProcess: number;
  idFlujo: string;
  canalVenta: string;
  puntoVenta: string;
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  email: string;
  telefono: number;
  fechaNacimiento: string;
  terminos: string;
  privacidad: string;
  codigoUsuario: string;
  primerApellido: string;
  nombres: string;
  constructor({
    idProcess,
    idFlujo,
    canalVenta,
    puntoVenta,
    idTipoPersona,
    idTipoDocumento,
    numeroDocumento,
    email,
    telefono,
    fechaNacimiento,
    terminos,
    privacidad,
    codigoUsuario,
    primerApellido,
    nombres
  }) {
    this.idProcess = idProcess;
    this.idFlujo = idFlujo;
    this.canalVenta = canalVenta;
    this.puntoVenta = puntoVenta;
    this.idTipoPersona = idTipoPersona;
    this.idTipoDocumento = idTipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.email = email;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.terminos = terminos;
    this.privacidad = privacidad;
    this.codigoUsuario = codigoUsuario;
    this.primerApellido = primerApellido;
    this.nombres = nombres;
  }
}
export class Step1Response {
  success: boolean;
  idProcess: number;
  experianRisk: boolean;
  errorMessage: string;
  idecon: {
    isFamPep: boolean,
    isIdNumber: boolean,
    isIdNumberFamPep: boolean,
    isOtherList: boolean,
    isPep: boolean
  };
  cumulus: {
    nCountPolicy: number,
    nCumulusAvailable: number,
    nTc: number,
    sExceedsCumulus: string,
  };
  rateAges: AgesDto[];
  saltarExperian: boolean;
  saltarIdecon: boolean;
  saltarWorldCheck: boolean;
  moneda: string;
  errorCode: string;
  constructor({
    success,
    idProcess,
    experianRisk,
    errorMessage,
    idecon,
    cumulus,
    rateAges,
    saltarExperian,
    saltarIdecon,
    saltarWorldCheck
  }) {
    this.success = success;
    this.idProcess = idProcess;
    this.experianRisk = experianRisk;
    this.errorMessage = errorMessage;
    this.idecon = idecon.map((item) => ({
      isFamPep: item.isFamPep,
      isIdNumber: item.isIdNumber,
      isIdNumberFamPep: item.isIdNumberFamPep,
      isOtherList: item.isOtherList,
      isPep: item.isPep
    }));
    this.rateAges = rateAges.map((item) => ({
      nAge: item.nAge,
      currency: item.currency
    }));
    this.cumulus = cumulus.map((item) => ({
      nCountPolicy: item.nCountPolicy,
      nCumulusAvailable: item.nCumulusAvailable,
      nTc: item.nTc,
      sExceedsCumulus: item.sExceedsCumulus,
    }));
    this.saltarExperian = saltarExperian;
    this.saltarIdecon = saltarIdecon;
    this.saltarWorldCheck = saltarWorldCheck;
  }
}
