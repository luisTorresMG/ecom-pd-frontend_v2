import { IResponse } from '@shared/interfaces/response.interface';

export interface IDetailProcessResponse extends IResponse {
  detalleProceso: any;
}

export interface IDetailProcess {
  idProceso: string;
  transaccion: string;
  contratante: string;
  numeroPoliza: string;
  canalVenta: string;
  producto: string;
  moneda: number;
  precio: number;
  numeroClientes: number;
  numeroErrores: number;
  numeroExitos: number;
  tasaError: number;
  periodoDeclaracion: string;
  fechaCreacion: string;
  fase: string;
}
