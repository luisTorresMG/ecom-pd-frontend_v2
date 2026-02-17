export class ChannelsModel {
  status: number;
  items: Array<{
    poliza: string,
    estadoCanal: string,
    nombreCanal: string,
    cliente: string
  }>;

  constructor(payload?: any) {
    this.status = payload?.STATUS;
    this.items = payload?.Entity?.map((val: any) => ({
      poliza: val.NPOLICY,
      estadoCanal: val.SCHANNELSTATE,
      nombreCanal: val.SCLIENAME,
      cliente: val.SCLIENT
    })) || [];
  }
}
