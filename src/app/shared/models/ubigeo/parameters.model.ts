export class ParametersResponse {
  parentescos: Array<{ id: number, descripcion }>;
  nacionalidades: Array<{ id: number, descripcion }>;
  ocupaciones: Array<{ id: number, descripcion }>;
  estadoCivil: Array<{ id: number, descripcion }>;
  ubigeos: Array<IDepartamentoModel>;
  constructor({
    parentescos,
    nacionalidades,
    ocupaciones,
    estadoCivil,
    ubigeos
  }) {
    this.parentescos = parentescos.map((val) => ({
      id: Number(val.id),
      descripcion: val.descripcion
    }));
    this.nacionalidades = nacionalidades.map((val) => ({
      id: Number(val.id),
      descripcion: val.descripcion
    }));
    this.ocupaciones = ocupaciones.map((val) => ({
      id: Number(val.id),
      descripcion: val.descripcion
    }));
    this.estadoCivil = estadoCivil.map((val) => ({
      id: Number(val.id),
      descripcion: val.descripcion
    }));
    this.ubigeos = ubigeos;
  }
}
export interface INacionalidadModel {
  id: number;
  descripcion: string;
}
export interface IDepartamentoModel {
  id: number;
  descripcion: string;
  provincias: Array<IProvinciaModel>;
}
export interface IProvinciaModel {
  idProvincia: number;
  provincia: string;
  distritos: Array<IDistritoModel>;
}
export interface IDistritoModel {
  idDistrito: number;
  distrito: string;
}
