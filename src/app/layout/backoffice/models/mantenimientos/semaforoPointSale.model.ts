export class SemaforoPointSaleModel {
  items: Array<{
    puntoVenta: {
      id: string,
      description: string
    };
    stock: {
      current: number,
      min: number,
      max: number
    };
    semaforo: {
      cantidad: number,
      color: number
    };
  }>;

  constructor(payload?: any) {
    this.items = payload?.entities.map((val) => ({
      puntoVenta: {
        id: val?.NNUMPOINT,
        description: val?.SDESCRIPT
      },
      stock: {
        current: val?.NSTOCKCURRENT,
        max: val?.NSTOCKMAX,
        min: val?.NSTOCKMIN
      },
      semaforo: {
        cantidad: val?.NSEMAFOROCANT,
        color: val?.NSEMAFOROCOLOR
      }
    })) || [];

  }
}
