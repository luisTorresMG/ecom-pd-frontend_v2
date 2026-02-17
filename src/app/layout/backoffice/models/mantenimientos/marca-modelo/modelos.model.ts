export class ModelsAutoModel {
  estado: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  idMarca: string;
  idModelo: string;
  marca: string;
  modelo: string;
}
export class SearchModelsAutoModel {
  items: Array<{
    id: number;
    idMarca: number;
    description: string;
    fechaCreacion: string;
    fechaModificacion: string;
    estado: string;
  }>;

  constructor(payload?: any) {
    this.items =
      payload?.entities.map((val) => ({
        id: val.NVEHMAINMODEL,
        idMarca: val.NVEHBRAND,
        description: val.SDESCRIPT,
        fechaCreacion: val.DCOMPDATE,
        fechaModificacion: val.DEFFECDATE,
        estado: val.SSTATREGT === '1' ? 'ACTIVO' : 'INACTIVO',
      })) || [];
  }
}
