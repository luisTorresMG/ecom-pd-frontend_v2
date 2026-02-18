export class CategoryResponse {
  success: boolean;
  errorMessage: string;
  categorias: Array<{ id: string, descripcion: string }>;

  constructor(payload: CategoryResponse) {
    this.success = payload.success;
    this.errorMessage = payload.errorMessage;
    this.categorias = payload.categorias.map((c) => ({
      id: c.id,
      descripcion: c.descripcion
    }));
  }
}
