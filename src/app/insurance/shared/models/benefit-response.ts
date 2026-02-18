export class BenefitResponse {
  id: number;
  descripcion: string;
  selected?: boolean;

  constructor({ id, descripcion, selected }) {
    this.id = id;
    this.descripcion = descripcion;
    this.selected = selected;
  }
}
