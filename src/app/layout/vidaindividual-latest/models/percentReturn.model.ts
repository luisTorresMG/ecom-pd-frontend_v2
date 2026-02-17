import { PremiumDto } from './premium.dto';
export class PercentReturnDto {
  montoPorcentaje: number;
  primas: Array<PremiumDto>;
  constructor({
    montoPorcentaje,
    primas
  }) {
    this.montoPorcentaje = montoPorcentaje;
    this.primas = primas.map((item) => ({
      primaAnual: item.primaAnual,
      primaMensual: item.primaMensual,
      primeraCuota: item.primeraCuota
    }));
  }
}
