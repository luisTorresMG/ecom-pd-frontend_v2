export class StatusDocumentRequest {
  numeroDocumento: string;
  digitoVerificador: string;

  constructor({ numeroDocumento, digitoVerificador }) {
    this.numeroDocumento = numeroDocumento;
    this.digitoVerificador = digitoVerificador;
  }
}
