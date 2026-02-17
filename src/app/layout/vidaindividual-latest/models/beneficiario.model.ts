export class BeneficiarioDto {
  complete: boolean;
  index: number;
  relacion: {
    id: string;
    descripcion: string;
  };
  porcentajeParticipacion: number;
  idTipoPersona: number;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  departamento: {
    id: string;
    descripcion: string;
  };
  provincia: {
    id: string;
    descripcion: string;
  };
  distrito: {
    id: string;
    descripcion: string;
  };
  direccion: string;
  email: string;
  telefono: string;
  idNacionalidad: string;
  nacionalidadDesc: string;
  idSexo: string;
  fechaNacimiento: string;
  codigoCliente: string;
  constructor(obj: any) {
    this.index = obj.index;
    /*this.relacion = obj.relacion === undefined ? null : obj.relacion.map((val) => ({
      id: val.id,
      descripcion: val.descripcion
    }));*/
    this.complete = obj.complete;
    this.relacion = obj.relacion === undefined ? null : obj.relacion;
    this.porcentajeParticipacion = obj.porcentajeParticipacion === null ? null : obj.porcentajeParticipacion;
    this.idTipoPersona = obj.idTipoPersona === null ? null : obj.idTipoPersona;
    this.idTipoDocumento = obj.idTipoDocumento ? obj.idTipoDocumento : 2;
    this.numeroDocumento = obj.numeroDocumento === null ? null : obj.numeroDocumento;
    if (obj.idTipoDocumento !== null && obj.numeroDocumento !== null) {
      this.codigoCliente = obj.idTipoDocumento + obj.numeroDocumento;
    } else {
      this.codigoCliente = null;
    }
    this.nombre = obj.nombre === null ? null : obj.nombre;
    this.apellidoPaterno = obj.apellidoPaterno === null ? null : obj.apellidoPaterno;
    this.apellidoMaterno = obj.apellidoMaterno === null ? null : obj.apellidoMaterno;
    /*this.departamento = obj.departamento === undefined ? null : obj.departamento.map((val) => ({
      id: val.nprovince,
      descripcion: val.sdescript
    }));*/
    this.departamento = obj.departamento === undefined ? null : obj.departamento;
    /*this.provincia = obj.provincia === undefined ? null : obj.provincia.map((val) => ({
      id: val.nlocal,
      descripcion: val.sdescript
    }));*/
    this.provincia = obj.provincia === undefined ? null : obj.provincia;
    /*this.distrito = obj.distrito === undefined ? null : obj.distrito.map((val) => ({
      id: val.nmunicipality,
      descripcion: val.sdescript
    }));*/
    this.distrito = obj.distrito === undefined ? null : obj.distrito;
    this.direccion = obj.direccion === null ? null : obj.direccion;
    this.email = obj.email === null ? null : obj.email;
    this.telefono = obj.telefono === null ? null : obj.telefono;
    this.idNacionalidad = obj.idNacionalidad === null ? null : obj.idNacionalidad;
    this.nacionalidadDesc = obj.nacionalidadDesc === null ? null : obj.nacionalidadDesc;
    this.idSexo = obj.idSexo === null ? 3 : obj.idSexo;
    this.fechaNacimiento = obj.fechaNacimiento === null ? null : obj.fechaNacimiento;
  }
}
