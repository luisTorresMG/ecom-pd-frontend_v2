export class ChannelStatesModel {
  status: number;
  items: Array<{
    id: number,
    descripcion: string
  }>;

  constructor(payload: any) {
    this.status = payload.STATUS;
    this.items = payload.Entity?.map((val: any) => ({
      id: Number(val.SITEM),
      descripcion: val.SDECRIPTION
    }));
  }
}
