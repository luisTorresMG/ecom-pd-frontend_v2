export class Facturacion {
  contratante: any;
  detail: FacturacionDetail[];
  usercode: number;
  constructor() {
  }
}

export class FacturacionDetail {
  policy: number;
  certif: number;
  receipt: number;
}
