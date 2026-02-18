import { BeneficiarioDto } from './beneficiario.model';
export class AseguradoDto {
  index: any;
  codigoCliente?: string;
  porcentaje: number;
  relacion: { id: number; descripcion: string };
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  departamento: { id: number; descripcion: string };
  provincia: { id: number; descripcion: string };
  distrito: { id: number; descripcion: string };
  direccion: string;
  telefono: string;
  idNacionalidad: string;
  idEstadoCivil: number;
  idSexo: string;
  fechaNacimiento: string;
  beneficiarios?: Array<BeneficiarioDto>;
  idRelacionContratante: number;
  relacionContratante: string;
  clienteHomologado: boolean;
  constructor({
    index,
    porcentaje,
    relacion,
    idTipoPersona,
    idTipoDocumento,
    numeroDocumento,
    email,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    departamento,
    provincia,
    distrito,
    direccion,
    telefono,
    idPais,
    idSexo,
    fechaNacimiento,
    beneficiarios,
    idEstadoCivil,
    relacionContratante,
    codigoCliente,
    clienteHomologado,
  }) {
    this.porcentaje = porcentaje;
    this.relacion = relacion.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.idTipoPersona = idTipoPersona;
    this.idTipoDocumento = idTipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.codigoCliente =
      codigoCliente || `${this.idTipoDocumento} ${this.numeroDocumento}`;
    this.email = email;
    this.nombre = nombre;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.departamento = departamento.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.provincia = provincia.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.distrito = distrito.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.direccion = direccion;
    this.telefono = telefono;
    this.idNacionalidad = idPais;
    this.idSexo = idSexo;
    this.idEstadoCivil = idEstadoCivil;
    this.fechaNacimiento = fechaNacimiento;
    this.beneficiarios = beneficiarios;
    this.idRelacionContratante = relacionContratante.id;
    this.relacionContratante = relacionContratante.description;
    this.clienteHomologado = clienteHomologado;
  }
}
