export class ChannelSaleRequestModel {
  nusercode: string;

  constructor(payload: any) {
    this.nusercode = payload.userCode || '3822';
  }
}
export class ChannelSaleResponseModel {
  codigoUsuario: string;
  canal: string;
  cliente: string;

  constructor(payload: any) {
    this.codigoUsuario = payload.nusercode || '3822';
    this.canal = payload.nchannel || '';
    this.cliente = payload.scliename || '';
  }
}

export class PointSaleResponseModel {
  data: {
    id: string,
    descripcion: string
  };

  constructor(payload: any) {
    this.data = payload?.PRO_SALE_POINT.map((val) => ({
      id: val.NNUMPOINT,
      descripcion: val.SDESCRIPT
    }));
  }
}

export class AutoParameterModel {
  channelCode: number;
  brandId: number;
  modelId: number;
  mainModelId: number;
  classId: number;
  desc: string;

  constructor(payload: any) {
    this.channelCode = payload?.ncodchannel || 0;
    this.brandId = payload?.nvehbrand || 0;
    this.modelId = payload?.nvehmodel || 0;
    this.mainModelId = payload?.nmainvehmodel || 0;
    this.classId = payload?.nvehclass || 0;
    this.desc = payload?.sdescript.trim() || null;
  }
}
export class AutoUseResponse {
  useId: number;
  desc: string;

  constructor(payload: any) {
    this.useId = payload.niduso;
    this.desc = payload.sdescript.trim();
  }
}
