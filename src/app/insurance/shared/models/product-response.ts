export class ProductResponse {
  categoryName: string;
  modeCode: string;
  documentTypes: Array<{ value: string; label: string }>;
  productId: string;
  key: string;
  showInfo: boolean;
  infoSelected: boolean;
  modeName: string;
  categoryId: string;
  name: string;
  infoDescription: string;
  selected: boolean;
  idTipoPoliza: number;

  constructor({
    categoria,
    documentos,
    idProducto,
    key,
    mostrarCheck,
    marcarCheck,
    modalidad,
    idCategoria,
    producto,
    textoCheck,
    idModalidad,
    selected,
    idTipoPoliza
  }) {
    this.categoryName = categoria;
    this.modeCode = idModalidad;
    this.productId = idProducto;
    this.key = key;
    this.showInfo = mostrarCheck !== '0';
    this.infoSelected = marcarCheck !== '0';
    this.infoDescription = textoCheck;
    this.modeName = modalidad;
    this.categoryId = idCategoria;
    this.name = producto;

    this.documentTypes = documentos.map((item) => ({
      value: item.codigoTipoDocumento,
      label: item.documento,
    }));

    this.selected = selected;
    this.idTipoPoliza = Number(idTipoPoliza);
  }
}
