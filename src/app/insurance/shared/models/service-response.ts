export class ServiceResponse {
  id: number;
  descripcion: string;
  selected?: boolean;
  documento?: string;
  proveedor?: {
    id: string,
    descripcion: string;
  };

  constructor({ id, descripcion, selected, proveedor, documento }) {
    this.id = id;
    this.descripcion = descripcion;
    this.proveedor = proveedor;
    this.selected = selected;
    this.documento = documento;
  }
}
