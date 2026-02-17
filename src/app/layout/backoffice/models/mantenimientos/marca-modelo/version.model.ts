export class VersionAutoModel {
  clase: string;
  estado: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  idClase: string;
  idModelo: string;
  idVersion: string;
  marca: string;
  modelo: string;
  version: string;
}
export class SearchVersionAutoModel {
  items: Array<{
    id: number;
    idMarca: number;
    idModelo: number;
    idClase: number;
    description: string;
    descriptionDetail: string;
    fechaCreacion: string;
    fechaModificacion: string;
    estado: string;
  }>;

  constructor(payload?: any) {
    this.items =
      payload?.entities.map((val) => ({
        id: val.NVEHMODEL,
        idMarca: val.NVEHBRAND,
        idModelo: val.NVEHMAINMODEL,
        idClase: val.NIDCLASE,
        idVersion: val.NVEHMODEL,
        description: val.SDESCRIPT,
        descriptionDetail: val.SDESCRIPT_DETAIL,
        fechaCreacion: val.DCOMPDATE,
        fechaModificacion: val.DEFFECDATE,
        estado: val.SSTATREGT === '1' ? 'ACTIVO' : 'INACTIVO',
      })) || [];
  }
}
