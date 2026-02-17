export class EstadoRequest {
  P_NIDUSER: any;
  _: any;
}

export interface IEstadoResponse {
  PA_SEL_STATE: [
    {
      ROWNUMBER: number;
      ROWTOTAL: number;
      SDECRIPTION: string;
      SITEM: string;
      STATUS: number;
      TAG: any;
    }
  ];
}

export class BuscarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_DATEBEGIN: any;
  P_DATEEND: any;
  P_NREQUEST: any;
  P_NSTATE: any;
  P_NIDUSER: any;
  _: any;
}

export interface IBuscarResponse {
  ROWTOTAL: number;
  entities: [
    {
      DATEREGISTER: string;
      NIDREQUEST: string;
      NREQUEST: number;
      NSTATE: number;
      NTYPEREQUEST: string;
      ROWNUMBER: number;
      ROWTOTAL: number;
      SCLIENTNAME: string;
      SSTATUS: string;
      STATUS: string;
      STYPE: string;
      SUSER: string;
      TAG: any;
    }
  ];
}

export class HistorialRequest {
  P_NIDCHANNELREQUEST: any;
}

export interface IHistorialResponse {
  PA_SEL_HISTORY: [
    {
      NIDREQUEST: string;
      NITEM: number;
      SNAMEREGISTER: number;
      SNAMEREQUEST: string;
      SOBSERVATION: string;
      SREGISTER: string;
      SSTATE: string;
      STYPEREQUEST: string;
    }
  ];
}

export class SolicitudRequest {
  S_TYPE: any;
  _: any;
}

export interface ISolicitudResponse {
  PRO_MASTER: [
    {
      SITEM: any;
      SDECRIPTION: any;
    }
  ];
}

export class DocumentoRequest {
  S_TYPE: any;
  _: any;
}

export interface IDocumentoResponse {
  PRO_MASTER: [
    {
      SITEM: any;
      SDECRIPTION: any;
    }
  ];
}

export class ArchivoRequest {
  S_TYPE: any;
  _: any;
}

export interface IArchivoResponse {
  PRO_MASTER: [
    {
      SITEM: string;
      SDECRIPTION: string;
    }
  ];
}

export class FrecuenciaRequest {
  S_TYPE: any;
  _: any;
}

export interface FrecuenciaResponse {
  PRO_MASTER: [
    {
      SITEM: string;
      SDECRIPTION: string;
    }
  ];
}

export class StatusRequest {
  S_TYPE: any;
  _: any;
}

export interface StatusResponse {
  PRO_MASTER: [
    {
      SITEM: string;
      SDECRIPTION: string;
    }
  ];
}

export class CertificadoRequest {
  S_TYPE: any;
  _: any;
}

export interface CertificadoResponse {
  PRO_MASTER: [
    {
      SITEM: string;
      SDECRIPTION: string;
    }
  ];
}

export class DepartamentoRequest {
  _: any;
}

export interface DepartamentoResponse {
  PA_SEL_PROVINCE: [
    {
      NPROVINCE: string;
      SDESCRIPT: string;
    }
  ];
}

export class ProvinciaRequest {
  P_NPROVINCE: any;
  _: any;
}

export interface ProvinciaResponse {
  PA_SEL_LOCAL: [
    {
      NLOCAL: string;
      SDESCRIPT: string;
    }
  ];
}

export class DistritoRequest {
  P_NLOCAL: any;
  _: any;
}

export interface DistritoResponse {
  PA_SEL_MUNICIPALITY: [
    {
      NMUNICIPALITY: string;
      SDESCRIPT: string;
    }
  ];
}

export class CanalRequest {
  _: any;
}

export interface CanalResponse {
  PA_SEL_CHANNEL_TYPE: [
    {
      NIDTYPECHANNEL: string;
      SDESCRIPTIONTYPECHANNEL: string;
    }
  ];
}

export class BuscarCanalRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_SNUMDOC: any;
  P_SCLIENTNAME: any;
  _: any;
}

export interface BuscarCanalResponse {
  ROWTOTAL: any;
  entities: [{}];
}

export interface IChannelDocumentValidate {
  documentNumber: string;
  requestType: number;
}

export interface IValidateChannel {
  PA_VAL_DOC_REQ: {
    P_COUNT: any;
  };
}

export interface RequestChannel {
  NSTATUS: number;
}

export class DataRequest {
  P_NIDREQUESTCHANNEL: any;
  requestType: any;
}

export interface IDataResponse {
  PA_SEL_DATA_REQUEST: [
    {
      DBEGINVALIDITY: string;
      DENDVALIDITY: string;
      NDISTRIBUTION: string;
      NIDCHANNEL: number;
      NLOCAL: number;
      NMUNICIPALITY: number;
      NPROVIDERSTOCK: number;
      NPROVINCE: number;
      NTYPECHANNEL: number;
      NTYPEDOC: string;
      SADDRESS: string;
      SCLIENTNAME: string;
      SCONTACT: string;
      SLASTNAME: any;
      SLASTNAME2: any;
      SMAIL: string;
      SNAME: any;
      SNUMDOC: string;
      SPHONE: string;
    }
  ];
}
export interface IEvaluateChannelRequest {
  idChannel: number;
  state: number;
  userId: number;
  observation: string;
}

export class DataAdjuntoRequest {
  P_NIDREQUESTCHANNEL: any;
}

export interface IDataAdjuntoResponse {
  PA_SEL_DATA_ATTACHMENT: [
    {
      SEXTENSION: string;
      SFILENAME: string;
      SROUTE: string;
      STYPEFILE: string;
    }
  ];
}

export class ChannelFathersRequest {
  P_NTYPECHANNEL: any;
  _: any;
}

export interface IChannelFathersResponse {
  PA_SEL_CHANNEL_FATHERS: [
    {
      NPOLICY: string;
      SCLIENAME: string;
    }
  ];
}

export class EstadoERequest {
  P_NIDUSER: any;
  _: any;
}

export interface IEstadoEResponse {
  PA_SEL_STATE: [
    {
      SITEM: string;
      SDECRIPTION: string;
    }
  ];
}

export class DatosLineaERequest {
  P_NIDCHANNELREQUEST: any;
}

export interface IDatosLineaEResponse {
  PA_READ_LINE_CREDIT: [
    {
      NSTOCKCURRENT: number;
      NSTOCKMAX: number;
      NSTOCKMIN: number;
      NTIPPOL: string;
    }
  ];
}

export class DatosCanalRequest {
  P_NIDCHANNELREQUEST: any;
}

export interface IDatosCanalResponse {
  PA_READ_REQ_SALEPOINT: [
    {
      NDISTRIBUTION: any;
      NIDCHANNEL: number;
      NIDCHANNELREQUEST: number;
      NREQUEST: any;
      SDATE: string;
      SSTATE: string;
    }
  ];
}

export class DatosPVRequest {
  P_NIDCHANNELREQUEST: any;
}

export interface IDatosPVResponse {
  PA_READ_DET_REQ_SALEPOINT: [
    {
      NIDSALEPOINT: number;
      NLOCAL: number;
      NMUNICIPALITY: number;
      NPROVINCE: number;
      NSTATE: number;
      SADDRESS: string;
      SCONTACT: string;
      SDESCRIPTION: string;
      SFRECUENCY: string;
      SMAIL: string;
      SPHONE: string;
      STYPEFRECUENCY: string;
    }
  ];
}

export class TipoPapelesModelRequest {
  P_NIDCHANNELREQUEST: any;
}

export class TipoPapelesModel {
  items: Array<{
    currentStock: number;
    maxStock: number;
    minStock: number;
    policyType: number;
  }>;

  constructor(valores?: any) {
    this.items =
      valores?.PA_READ_LINE_CREDIT?.map((val: any) => ({
        currentStock: val.NSTOCKCURRENT || 0,
        maxStock: val.NSTOCKMAX || 0,
        minStock: val.NSTOCKMIN || 0,
        policyType: +val.NTIPPOL || 0,
      })) || [];
  }
}

export class TipoPapelesPointSaleModel {
  pointSale: number;
  items: Array<{
    currentStock: number;
    maxStock: number;
    minStock: number;
    policyType: number;
  }>;

  constructor(valores?: any) {
    this.pointSale = valores?.pointSale || 0;
    this.items =
      valores?.PA_READ_LINE_CREDIT_SALE_POINT?.map((val: any) => ({
        currentStock: val.NSTOCKCURRENT || 0,
        maxStock: val.NSTOCKMAX || 0,
        minStock: val.NSTOCKMIN || 0,
        policyType: +val.NTIPPOL || 0,
      })) || [];
  }
}

export interface EvaluarResponse {
  NSTATUS: any;
}

export interface ProveedorStockResponse {
  PA_SEL_CHANNEL_FATHERS: [
    {
      NPOLICY: any;
      SCLIENAME: any;
    }
  ];
}

export class ListaPapeles {
  pointSale: number;
  index?: number;
  itemsPV: Array<{
    index?: number;
    currentStock: number;
    maxStock: number;
    minStock: number;
    policyType: number;
    channelCode?: number;
    userId?: number;
  }>;

  constructor(valores?: any) {
    this.pointSale = valores?.pointSale || 0;
    this.index = valores?.index || 0;
    this.itemsPV =
      valores?.PA_READ_LINE_CREDIT_SALE_POINT.map((val: any) => ({
        currentStock: val.NSTOCKCURRENT || 0,
        maxStock: val.NSTOCKMAX || 0,
        minStock: val.NSTOCKMIN || 0,
        policyType: +val.NTIPPOL || 0,
      })) || [];
  }
}

export interface ActualizarCanalAsociado {
  numeroDocumento: string;
  codigoCanalAsociado: number;
}
