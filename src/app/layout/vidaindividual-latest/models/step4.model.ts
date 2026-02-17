export class Step4Request {
  idProcess: number;
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  idDepartamento: string;
  idProvincia: string;
  idDistrito: string;
  direccion: string;
  telefono: string;
  idNacionalidad: string;
  idSexo: string;
  idOcupacion: string;
  idEstadoCivil: string;
  fechaNacimiento: string;
  obligacionFiscal: string;
  constructor({
    idProcess,
    idTipoPersona,
    idTipoDocumento,
    numeroDocumento,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    idDepartamento,
    idProvincia,
    idDistrito,
    direccion,
    telefono,
    idNacionalidad,
    idSexo,
    idOcupacion,
    idEstadoCivil,
    fechaNacimiento,
    obligacionFiscal
  }) {
    this.idProcess = idProcess;
    this.idTipoPersona = idTipoPersona;
    this.idTipoDocumento = idTipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombre = nombre;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.idDepartamento = idDepartamento;
    this.idProvincia = idProvincia;
    this.idDistrito = idDistrito;
    this.direccion = direccion;
    this.telefono = telefono;
    this.idNacionalidad = idNacionalidad;
    this.idSexo = idSexo;
    this.idOcupacion = idOcupacion;
    this.idEstadoCivil = idEstadoCivil;
    this.fechaNacimiento = fechaNacimiento;
    this.obligacionFiscal = obligacionFiscal;
  }
}
