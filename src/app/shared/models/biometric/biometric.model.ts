export class BiometricRequest {
  data: {
    IdProcess: number,
    Documento: string,
    Nombre: string,
    Apellido: string,
    Avatar?: string
  };
  file: File;

  constructor(payload: BiometricRequest) {
    this.data = payload.data;
    this.file = payload.file;
  }
}
export class BiometricResultDto {
  success: boolean;
  hasError: boolean;
  description: string;

  constructor(payload: BiometricResultDto) {
    this.success = payload.success;
    this.hasError = payload.hasError;
    this.description = payload.description;
  }
}

export class DataBiometricDto {
  idRamo: number;
  idProcess: number;
  nDoc: string;
  apePat: string;
  apeMat: string;
  names: string;
  photo?: string;

  constructor(payload: DataBiometricDto) {
    this.idRamo = payload.idRamo;
    this.idProcess = payload.idProcess;
    this.nDoc = payload.nDoc;
    this.apePat = payload.apePat;
    this.apeMat = payload.apeMat;
    this.names = payload.names;
    this.photo = payload.photo ?? '';
  }
}
