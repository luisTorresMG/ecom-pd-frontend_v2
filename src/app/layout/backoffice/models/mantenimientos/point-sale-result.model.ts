export class PointSaleResultModel {
  totalItems: number;
  status: number;
  porcentajeRechazoPadre: number;
  minStockPadre: number;
  maxStockPadre: number;
  items: Array<{
    numeroPoliza: string,
    porcentajeRechazo: number,
    numeroPuntoVenta: number,
    nombre: string,
    contacto: string,
    descripcion: string,
    correo: string,
    telefono: string,
    direccion: string,
    semaforo: {
      cantidad: number,
      color: number
    }
    stock: {
      cantidad: number,
      minimo: number,
      maximo: number
    },
    departamento: {
      id: number;
      description: string;
    },
    provincia: {
      id: number;
      descripcion: string;
    },
    distrito: {
      id: number;
      description: string;
    },
    activo: string,
  }>;

  constructor(payload?: any) {
    this.porcentajeRechazoPadre = payload?.Padre_NPERCREJECTION || 0;
    this.minStockPadre = payload?.Padre_NSTOCKMIN || 0;
    this.maxStockPadre = payload?.Padre_NSTOCKMAX || 0;
    this.totalItems = payload?.ROWTOTAL || 0;
    this.status = payload?.STATUS || 0;
    this.items = payload?.entities.map((val) => ({
      numeroPoliza: val.NPOLICY,
      porcentajeRechazo: val.NPERCREJECTION,
      numeroPuntoVenta: val.NNUMPOINT,
      nombre: val.SCLIENAME?.trim(),
      contacto: val.SCONTACT,
      descripcion: val.SDESCRIPT?.trim(),
      correo: val.SEMAILCLI,
      telefono: val.NPHONE,
      direccion: val.SSTREET?.trim(),
      semaforo: {
        cantidad: val.NSEMAFOROCANT,
        color: val.NSEMAFOROCOLOR
      },
      stock: {
        cantidad: val.NSTOCKCURRENT,
        minimo: val.NSTOCKMIN,
        maximo: val.NSTOCKMAX
      },
      departamento: {
        id: Number(val.NPROVINCE),
        descripcion: val.DEPARTAMENT?.trim()
      },
      provincia: {
        id: val.NLOCAL?.toString(),
        descripcion: val.PROVINCE?.trim()
      },
      distrito: {
        id: val.NMUNICIPALITY?.toString(),
        descripcion: val.DISTRITO?.trim()
      },
      activo: val.SACTIVE
    })) || [];
  }
}
