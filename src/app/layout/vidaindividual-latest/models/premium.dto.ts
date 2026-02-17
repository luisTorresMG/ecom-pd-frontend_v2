export class PremiumDto {
  idTarifario: number;
  codigoComercio: any;
  plan: number;
  primaAnual: number;
  primaMensual: number;
  primeraCuota: number;
  primaRetorno: number;
  primaFallecimiento: number;
  descPrima: number;
  descPrimeraCuota: number;
  constructor({
    idTarifario,
    codigoComercio,
    plan,
    primaAnual,
    primaMensual,
    primeraCuota,
    primaRetorno,
    primaFallecimiento,
    descPrima,
    descPrimeraCuota
  }) {
    this.idTarifario = idTarifario;
    this.codigoComercio = codigoComercio;
    this.plan = plan;
    this.primaAnual = primaAnual;
    this.primaMensual = primaMensual;
    this.primeraCuota = primeraCuota;
    this.primaRetorno = primaRetorno;
    this.primaFallecimiento = primaFallecimiento;
    this.descPrima = descPrima;
    this.descPrimeraCuota = descPrimeraCuota;
  }
}
