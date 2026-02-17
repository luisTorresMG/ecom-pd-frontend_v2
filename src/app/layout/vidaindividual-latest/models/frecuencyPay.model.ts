import { PercentReturnDto } from './percentReturn.model';
// tslint:disable-next-line:class-name
export class frecuencyPayDto {
  idFrecuencia: number;
  frecuencia: string;
  porcentajeRetorno: Array<PercentReturnDto>;
  constructor({
    porcentajeRetorno,
    frecuencia,
    idFrecuencia
  }) {
    this.frecuencia = frecuencia;
    this.idFrecuencia = idFrecuencia;
    this.porcentajeRetorno = porcentajeRetorno.map((item) => ({
      montoPorcentaje: item.montoPorcentaje,
      primas: item.primas
    }));
  }
}
