export class ChannelSales {
  constructor(
    public nusercode: number,
    public nchannel: string,
    public scliename: string
  ) {}
}

export class Ramo {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class Productos {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}
