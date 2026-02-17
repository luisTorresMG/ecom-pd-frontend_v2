export interface PepRequest {
  idProcess: string;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
}
export interface PepResponse {
  success: boolean;
  isOtherList: boolean;
  isIdNumber: boolean;
  isPep: boolean;
  experianRisk: boolean;
  approve: boolean;
  deudaTotal: number;
}
