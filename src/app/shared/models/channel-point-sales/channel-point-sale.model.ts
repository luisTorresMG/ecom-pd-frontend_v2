export class ChannelSalesModel {
  items: Array<{
    id: number,
    description: string
  }>;

  constructor(payload?: any) {
    this.items = payload?.map((val: any) => ({
      id: val.nchannel,
      description: val.sdescript
    })) || [];
  }
}

export class PointSalesModel {
  items: Array<{
    id: number,
    description: string
  }>;

  constructor(payload?: any) {
    this.items = payload?.map((val: any) => ({
      id: val.nnumpoint,
      description: val.sdescript
    })) || [];
  }
}
