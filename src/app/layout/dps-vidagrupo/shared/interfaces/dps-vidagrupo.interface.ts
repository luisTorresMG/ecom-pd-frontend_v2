export interface IStorage {
  insuranceInfo?: IInsuranceInfo;
  dps?: any;
  otpAuth?: any;
  isProcessComplete?: boolean;
}

export interface IInsuranceInfo {
  id: string;
  avatar: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
}

export interface ITokenInfo {
  id: string;
  dps: string;
  idEstado: string;
  estado: string;
  numeroDocumento: string;
  nombreCliente: string;
  algoritmo: string;
  porcentajeSimilitud: any;
  urlImagen: string;
  fechaEvaluacion: string;
  tipoValidacion: string;
  codigoVerificacion: string;
  success: boolean;
}
