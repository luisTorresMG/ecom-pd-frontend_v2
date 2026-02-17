import { frecuencyPayDto } from './frecuencyPay.model';
import { PercentReturnDto } from './percentReturn.model';
export class SumaAseguradaDto {
  montoSumaAsegurada: number;
  porcentajeRetorno: Array<PercentReturnDto>;
  frecuenciaPago: Array<frecuencyPayDto>;
  constructor({
    montoSumaAsegurada,
    frecuenciaPago,
  }) {
    this.montoSumaAsegurada = montoSumaAsegurada;
    this.frecuenciaPago = frecuenciaPago.map((item) => ({
      frecuencia: item.frecuencia,
      idFrecuencia: item.idFrecuencia,
      porcentajeRetorno : item.porcentajeRetorno
    }));
  }
}
