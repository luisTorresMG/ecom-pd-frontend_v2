export class CapitalDto {
  nCapital: number;
  premium: Array<{ nPremium: number }>;
  constructor({
    nCapital,
    premium
  }) {
    this.nCapital = nCapital;
    this.premium = premium.map((item) => ({
      nPremium: item.nPremium
    }));
  }
}
