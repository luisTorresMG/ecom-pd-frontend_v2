export class ChannelModel {
  totalItems: number;
  items: Array<IChannel>;

  constructor(_?: any) {
    this.totalItems = _?.ROWTOTAL || 0;
    this.items = _?.entities.map((val: any) => ({
      id: val.NIDCHANNEL,
      request: {
        id: val.NREQUEST,
        channel: val.NIDCHANNELREQUEST
      },
      clientName: val.SCLIENTNAME,
      distribution: val.NDISTRIBUTION,
      document: {
        id: this.idTypeDocument(val.STYPEDOC),
        type: val.STYPEDOC,
        number: val.SNUMDOC
      },
      date: val.SDATE,
      state: val.SSTATE,
      status: val.STATUS
    })) || [];
  }
  private idTypeDocument(data: string): number {
    switch (data.toLowerCase()) {
      case 'ruc':
        return 1;
      case 'dni':
        return 2;
      default:
        return 4;
    }
  }
}

export interface IChannel {
  id: number;
  request: {
    id: string;
    channel: number;
  };
  idRequest: number;
  clientName: string;
  distribution: number;
  documentType: string;
  document: {
    type: string;
    number: string;
  };
  date: string;
  state: string;
  status: number;
}
