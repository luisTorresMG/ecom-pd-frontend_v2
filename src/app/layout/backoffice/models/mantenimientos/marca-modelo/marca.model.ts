export class MarcaModel {
  estado: string;
  fechaCreacion: Date;
  fechaModificación: Date;
  idMarca: string;
  marca: string;
}
export class SearchMarcaModel {
  items: Array<{
    id: number;
    description: string;
    fechaCreacion: string;
    fechaModificacion: string;
    estado: string;
  }>;

  constructor(payload?: any) {
    this.items =
      payload?.entities.map((val) => ({
        id: val.NVEHBRAND,
        description: val.SDESCRIPT,
        fechaCreacion: val.DCOMPDATE,
        fechaModificacion: val.DEFFECDATE,
        estado: val.SSTATREGT === '1' ? 'ACTIVO' : 'INACTIVO',
      })) || [];
  }
}
