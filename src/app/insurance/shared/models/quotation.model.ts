export class QuotationRequest {
  idCotizacion: string;
  idProcess: string;

  constructor(payload: QuotationRequest) {
    this.idCotizacion = payload.idCotizacion;
    this.idProcess = payload.idProcess;
  }
}

export class QuotationResponse {
  archivo: string;
  nombre: string;
  resultado: boolean;

  constructor(payload: QuotationResponse) {
    this.archivo = payload.archivo;
    this.nombre = payload.nombre;
    this.resultado = payload.resultado;
  }
}
