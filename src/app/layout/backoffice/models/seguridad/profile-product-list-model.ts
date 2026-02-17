export class ProductProfileList {
  items: Array<{
    idProductos: number;
    nombreProducto: string;
    idPerfiles: number;
    nombrePerfil: string;
  }>;
  success: boolean;

  constructor(payload?: any) {
    this.success = payload?.success;
    this.items =
      payload?.listaProductosPerfiles?.map((val) => ({
        idProductos: val.idProductos,
        nombreProducto: val.nombreProducto,
        idPerfiles: val.idPerfiles,
        nombrePerfil: val.nombrePerfil,
      })) || [];
  }
}
