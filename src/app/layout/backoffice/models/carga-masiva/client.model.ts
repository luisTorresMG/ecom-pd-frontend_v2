import moment from 'moment';

export class ClientRequest {
  idTipoDocumento: number;
  numeroDocumento: string;
  nombre: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  razonSocial: string | null;
  idSexo: number | null;
  idNacionalidad: number;
  fechaNacimiento: string | null;
  esClienteEstado: string;
  idDepartamento: number;
  idProvincia: number;
  idDistrito: number;
  direccion: string;
  email: string;
  telefono: string;
  idUsuario: string;

  constructor(payload: any) {
    this.idUsuario = payload.idUsuario;
    this.idTipoDocumento = Number(payload.documentType);
    this.numeroDocumento = payload.documentNumber ? payload.documentNumber?.toString() : null;
    this.nombre = payload.nombres ? payload.nombres?.toString() : null;
    this.apellidoPaterno = payload.apellidoPaterno ? payload.apellidoPaterno?.toString() : null;
    this.apellidoMaterno = payload.apellidoMaterno ? payload.apellidoMaterno?.toString() : null;
    this.razonSocial = payload.razonSocial ? payload.razonSocial?.toString() : null;
    this.idSexo = Number(payload.sexo) !== 0 ? Number(payload.sexo) : null;
    this.idNacionalidad = Number(payload.nacionalidad);
    this.fechaNacimiento = payload.fechaNacimiento ? moment(new Date(payload.fechaNacimiento).toISOString()).format('DD/MM/YYYY') : null;
    this.esClienteEstado = payload.clientState ? '1' : '2';
    this.idDepartamento = Number(payload.departamento);
    this.idProvincia = Number(payload.provincia);
    this.idDistrito = Number(payload.distrito);
    this.direccion = payload.direccion ? payload.direccion?.toString() : null;
    this.email = payload.email ? payload.email?.toString() : null;
    this.telefono = payload.celular ? payload.celular?.toString() : null;
  }
}
export class ClientResponse {
  success: boolean;
  mensaje: string;

  constructor(payload: ClientResponse) {
    this.success = payload.success;
    this.mensaje = payload.mensaje;
  }
}
