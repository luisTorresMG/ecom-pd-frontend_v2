export default class Rate {
  public id: string;
  public descripcion: string;
  public comisionBroker: number;
  public comisionIntermediario: number;
  public comisionPuntoVenta: number;
  public precio: number;
  public precioRegular: number;

  constructor({
    id = '',
    descripcion = '',
    comisionBroker = 0,
    comisionIntermediario = 0,
    comisionPuntoVenta = 0,
    precio = 0,
    precioRegular = 0,
  }) {
    this.id = id;
    this.descripcion = descripcion;
    this.comisionBroker = comisionBroker;
    this.comisionIntermediario = comisionIntermediario;
    this.comisionPuntoVenta = comisionPuntoVenta;
    this.precio = precio;
    this.precioRegular = precioRegular;
  }
}
