export class PlanillaVentaDto {
  id: number;
  ncertificado: number;
  canalVenta: string;
  state: string;
  tarifaProtecta: number;
  tarifaManual: number;
  proforma: number;
}
export class FormaDePagoPlanillaDto {
  moneda: string;
  tipoPago: string;
  banco: string;
  cuenta: number;
  nOperacion: number;
  fecha: string;
  monto: number;
}
