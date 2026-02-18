export class BeneficiarioDto {
  codigoClienteAsegurado?: string;
  codigoCliente?: string;
  idTipoDocumentoAsegurado: number;
  numeroDocumentoAsegurado: string;
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
  idPais: string;
  idNacionalidad: string;
  idSexo: string;
  idEstadoCivil: number;
  fechaNacimiento: string;
  clienteHomologado: boolean;
  constructor({
    idTipoDocumentoAsegurado,
    numeroDocumentoAsegurado,
    porcentaje,
    relacion,
    idTipoPersona,
    idTipoDocumento,
    numeroDocumento,
    email,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    departament,
    province,
    district,
    direccion,
    telefono,
    pais,
    idNacionalidad,
    sexo,
    fechaNac,
    idEstadoCivil,
    clienteHomologado,
  }) {
    this.idTipoDocumentoAsegurado = idTipoDocumentoAsegurado;
    this.numeroDocumentoAsegurado = numeroDocumentoAsegurado;
    this.porcentaje = porcentaje;
    this.relacion = relacion.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.idTipoPersona = idTipoPersona;
    this.idTipoDocumento = idTipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.codigoCliente = this.idTipoDocumento + '' + this.numeroDocumento;
    this.codigoClienteAsegurado =
      this.idTipoDocumentoAsegurado + '' + this.numeroDocumentoAsegurado;
    this.email = email;
    this.nombre = nombres;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.departamento = departament.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.provincia = province.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.distrito = district.map((val) => ({
      id: val.id,
      descripcion: val.descripcion,
    }));
    this.direccion = direccion;
    this.telefono = telefono;
    this.idPais = pais;
    this.idNacionalidad = idNacionalidad;
    this.idSexo = sexo;
    this.idEstadoCivil = idEstadoCivil;
    this.fechaNacimiento = fechaNac;
    this.clienteHomologado = clienteHomologado;
  }
}
