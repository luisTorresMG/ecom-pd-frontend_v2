export class SalePointModel {
  totalItems: number;
  items: Array<ISalePoint>;

  constructor(_?: any) {
    this.totalItems = _?.ROWTOTAL || 0;
    this.items = _?.entities.map((val: any) => ({
      dateUpdate: val.DUPDATE,
      channelId: +val.NCHANNEL,
      channelRequestId: +val.NIDCHANNELREQUEST,
      department: +val.NPROVINCE,
      province: +val.NLOCAL,
      district: +val.NMUNICIPALITY,
      salePointId: +val.NSALEPOINT,
      state: +val.NSTATE,
      address: val.SADDRESS,
      clientName: val.SCLIENTNAME,
      contact: val.SCONTACT,
      description: val.SDESC_SALEPOINT,
      frecuency: +val.SFRECUENCY,
      frecuencyType: +val.STYPEFRECUENCY,
      email: val.SMAIL,
      documentNumber: val.SNUMDOC,
      phone: val.SPHONE,
      descriptionDocumentType: val.STYPEDOC
    })) || [];
  }
}

export interface ISalePoint {
  dateUpdate: string;
  channelId: number;
  channelRequestId: number;
  department: number;
  province: number;
  district: number;
  salePointId: number;
  state: number;
  address: string;
  clientName: string;
  contact: string;
  description: string;
  frecuency: number;
  frecuencyType: number;
  email: string;
  documentNumber: string;
  phone: string;
  descriptionDocumentType: string;
}

