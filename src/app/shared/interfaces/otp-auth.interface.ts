export interface IRegisterOtp {
  idProcess: number;
  dni: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: number;
  type?: number;
  photo?: string;
}

export interface IRegisterOtpResponse {
  success: boolean;
  uniqueId: string;
}

export interface IValidateOtp {
  idProcess: number;
  uniqueId: string;
  valor: string;
  NumeroDocumento: string;
}

export interface IValidateOtpResponse {
  success: boolean;
  hasError: boolean;
  message: string;
}
