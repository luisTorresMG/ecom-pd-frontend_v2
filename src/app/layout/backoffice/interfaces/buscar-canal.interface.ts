export interface IBuscarCanalRequest {
  estadoCanal: number;
  tipoCanal: number;
  canalVenta: string;
  tipoDocumento: number;
  numeroDocumento: string;
  razonSocial: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numPage: number;
  pageSize: number;
  pageIndex: number;
  endIndex: number;
}
