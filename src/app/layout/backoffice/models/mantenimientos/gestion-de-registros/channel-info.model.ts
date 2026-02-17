export class ChannelInfoModel {
  startDateValidity: string;
  endDateValidity: string;
  distributionType: number;

  channelId: number;

  department: number;
  province: number;
  district: number;
  address: string;

  providerStock: number;
  channelType: number;

  documentType: number;
  documentNumber: string;

  clientName: string;
  contact: string;

  names: string;
  apePat: string;
  apeMat: string;

  email: string;
  phone: string;

  constructor(_?: any) {
    this.address = _.PA_SEL_DATA_REQUEST?.SADDRESS;
    this.apeMat = _.PA_SEL_DATA_REQUEST?.SLASTNAME2;
    this.apePat = _.PA_SEL_DATA_REQUEST?.SLASTNAME;
    this.channelId = +_.PA_SEL_DATA_REQUEST?.NIDCHANNEL || null;
    this.channelType = +_.PA_SEL_DATA_REQUEST?.NTYPECHANNEL || null;
    this.clientName = _.PA_SEL_DATA_REQUEST?.SCLIENTNAME;
    this.contact = _.PA_SEL_DATA_REQUEST?.SCONTACT;
    this.department = +_.PA_SEL_DATA_REQUEST?.NPROVINCE || null;
    this.distributionType = +_.PA_SEL_DATA_REQUEST?.NDISTRIBUTION || null;
    this.district = +_.PA_SEL_DATA_REQUEST?.NMUNICIPALITY || null;
    this.documentNumber = _.PA_SEL_DATA_REQUEST?.SNUMDOC;
    this.documentType = +_.PA_SEL_DATA_REQUEST?.NTYPEDOC || null;
    this.email = _.PA_SEL_DATA_REQUEST?.SMAIL;
    this.endDateValidity = _.PA_SEL_DATA_REQUEST?.DENDVALIDITY;
    this.names = _.PA_SEL_DATA_REQUEST?.SNAME;
    this.phone = _.PA_SEL_DATA_REQUEST?.SPHONE.trim() || null;
    this.providerStock = +_.PA_SEL_DATA_REQUEST?.NPROVIDERSTOCK || null;
    this.province = +_.PA_SEL_DATA_REQUEST?.NLOCAL || null;
    this.startDateValidity = _.PA_SEL_DATA_REQUEST?.DBEGINVALIDITY;
  }
}
