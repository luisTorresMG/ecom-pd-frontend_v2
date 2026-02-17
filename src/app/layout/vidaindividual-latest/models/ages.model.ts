import { CurrencyDto } from './currency.model';
export class AgesDto {
  edad: number;
  moneda: Array<CurrencyDto>;
  constructor({
    edad,
    moneda
  }) {
    this.edad = edad;
    this.moneda = moneda.map((item) => ({
      idMoneda: item.idMoneda,
      simbolo: item.simbolo,
      sumaAsegurada: item.sumaAsegurada
    }));
  }
}
