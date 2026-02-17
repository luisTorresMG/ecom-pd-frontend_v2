export interface IDocumentInformationRequest {
  idRamo: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  idUser?: number;
}

export interface IDocumentInfoRequest {
  idRamo: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  idUser?: number;
  token: string;
}

export interface IDocumentInfoGestionRequest extends IDocumentInfoRequest {
  idUsuario: number;
  fechaNacimiento?: string;
}

export interface IDocumentInfoClientRequest extends IDocumentInfoRequest {
  idProducto: number;
  idUsuario: number;
}

export interface IDocumentInformationResponse {
  success: boolean;
  message: string;

  codigoCliente: string;
  tipoCliente: string;
  clienteEstado: boolean;
  clienteProspecto: boolean;
  promociones: boolean;
  idTipoPersona: string;
  idTipoDocumento: number;
  numeroDocumento: string;

  razonSocial: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  imagen: string;

  fechaNacimiento: string;

  nacionalidad: string;
  departamento: number;
  provincia: number;
  distrito: number;
  direccion: string;

  email: string;
  telefono: string;

  estadoCivil: string;
  titulo: string;
  sexo: string;
}

export interface IClienteInformationRequest {
  Ramo: number;
  TipoDocumento: number;
  Documento: string;
  Producto: number;
}

export interface IClienteInformationResponse {
  clienteAnulado: boolean;
  polizasAnuladas: number;
  id: string;
  success: boolean;
  message: string;
}
