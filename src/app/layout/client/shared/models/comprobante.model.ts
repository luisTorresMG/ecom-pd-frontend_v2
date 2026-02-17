export class Comprobante {
  tipoComprobante: string;
  serie: string;
  numero: string;
  fecha: string;
  monto: string;
  ruc: string;
  isPDF: boolean;
  captcha?: string;
  serienumero: string;
  constructor() {
    this.tipoComprobante = '';
    this.serie = '';
    this.numero = '';
    this.fecha = '';
    this.monto = '';
    this.ruc = '';
    this.isPDF = false;
  }
}
