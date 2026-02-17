export class StockProviderModel {
  items: Array<{
    id: number;
    description: string;
  }>;

  constructor(payload?: any) {
    this.items = payload?.PA_SEL_CHANNEL_FATHERS.map((val: any) => ({
      id: val.NPOLICY,
      description: val.SCLIENAME
    })) || [];
  }
}
