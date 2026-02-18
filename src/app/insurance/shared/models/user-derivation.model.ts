export class userDerivation {
  idProceso: number;
  idRamo: number;
  ramo: string;
  idProducto: number;
  producto: string;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  razonSocial: string;
  correo: string;
  telefono: string;

  constructor({
    idProceso,
    idRamo,
    ramo,
    idProducto,
    producto,
    idTipoDocumento,
    numeroDocumento,
    nombres,
    razonSocial,
    correo,
    telefono,
  }) {
    this.idProceso = idProceso;
    this.idRamo = idRamo;
    this.ramo = ramo;
    this.idProducto = idProducto;
    this.producto = producto;
    this.idTipoDocumento = idTipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombres = nombres;
    this.razonSocial = razonSocial;
    this.correo = correo;
    this.telefono = telefono;
  }
}
