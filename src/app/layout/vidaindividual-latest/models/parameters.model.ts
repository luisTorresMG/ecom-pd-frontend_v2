export class ParametersResponse {
  parentescos: Array<{ id: number, descripcion }>;
  nacionalidades: Array<{ id: number, descripcion }>;
  ocupaciones: Array<{ id: number, descripcion }>;
  estadoCivil: Array<{ id: number, descripcion }>;
  ubigeos: any;
  constructor({
    parentescos,
    nacionalidades,
    ocupaciones,
    estadoCivil,
    ubigeos
  }) {
    this.parentescos = parentescos.map((val) => ({
      id: val.id,
      descripcion: val.descripcion
    }));
    this.nacionalidades = nacionalidades.map((val) => ({
      id: val.id,
      descripcion: val.descripcion
    }));
    this.ocupaciones = ocupaciones.map((val) => ({
      id: val.id,
      descripcion: val.descripcion
    }));
    this.estadoCivil = estadoCivil.map((val) => ({
      id: val.id,
      descripcion: val.descripcion
    }));
    this.ubigeos = ubigeos;
  }
}
