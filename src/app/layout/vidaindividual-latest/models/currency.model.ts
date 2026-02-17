import { SumaAseguradaDto } from './sumaAsegurada.model';
export class CurrencyDto {
  idMoneda: number;
  simbolo: string;
  sumaAsegurada: Array<SumaAseguradaDto>;
  constructor({
    idMoneda,
    simbolo,
    sumaAsegurada
  }) {
    this.idMoneda = idMoneda;
    this.simbolo = simbolo;
    this.sumaAsegurada = sumaAsegurada.map((item) => ({
      montoSumaAsegurada: item.montoSumaAsegurada,
      porcentajeRetorno: item.porcentajeRetorno
    }));
  }
}
