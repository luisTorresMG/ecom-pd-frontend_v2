export interface IGetLotsPayload {
  idUsuario: string;
  estadoPoliza: string;
  nombreArchivo: string;
  detalle: {
    codigoCanal: string;
    canal: string;
    planilla: string;
    estadoOrigen: string;
    origen: string;
    listaPoliza: string[];
  }[];
}

export interface IGetLotsResponse {
  numeroLote: string;
  success: boolean;
  message: string;
}
