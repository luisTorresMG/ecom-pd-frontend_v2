export class SystemTypesModel {
  items: Array<{
    id: number,
    description: string
  }>;

  constructor(payload?: any) {
    this.items = payload?.PRO_MASTER.map((val) => ({
      id: +val.SITEM,
      description: val.SDECRIPTION
    })) || [];
  }
}
