export class DataPolizaDto {
  nCertificado: string;
  canalVenta: string;
  concatCertificadoCanalVenta?: string;
  codCanalVenta?: string;
  usuarioEmisor: string;
  origen: string;
  loteDescargo: string;
  planilla: string;
  moneda?: string;
  prima: string;
  fechaEmision: string;
  horaEmision: string;
  fecIniVigencia: string;
  fecFinVigencia: string;
  concatVigencia?: string;
}
