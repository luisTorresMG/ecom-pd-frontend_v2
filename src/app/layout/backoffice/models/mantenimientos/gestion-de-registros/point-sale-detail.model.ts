export class PointSaleDetailModel {
  items: Array<ISalePointDetail>;

  constructor(_?: any) {
    this.items = _?.PA_READ_DET_REQ_SALEPOINT_CH.map((val: any) => ({
      index: null,
      id: +val.NIDSALEPOINT,
      department: +val.NPROVINCE,
      province: +val.NLOCAL,
      district: +val.NMUNICIPALITY,
      state: +val.NSTATE,
      address: val.SADDRESS,
      contact: val.SCONTACT,
      description: val.SDESCRIPTION,
      email: val.SMAIL,
      phone: val.SPHONE,
      frecuency: val.SFRECUENCY,
      frecuencyType: val.STYPEFRECUENCY,
      creditLines: []
    })) || [];
  }
}

export interface ISalePointDetail {
  index?: number;
  id: number;
  department: number;
  province: number;
  district: number;
  state: number;
  address: string;
  contact: string;
  description: string;
  email: string;
  phone: string;
  frecuency: string;
  frecuencyType: string;
  creditLines?: Array<any>;
}
