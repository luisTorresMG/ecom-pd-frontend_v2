import { NivelIRequest } from '../mantenimientos/planillas/planillas.model';

export class BaseFilter {
  public DRANGESTART: string;
  public DRANGEEND: string;
  public NPOLICY: number;
  public NCANAL: number;
  public NNUMLOT: number;
  public NNUMPOINT: number;
  public SSTATUS: string;
  public SPOLICYS: string;
  public SSALEPOINTS: string;
  public NPAGENUM: number;
  public NPAGESIZE: number;
  constructor() {}
}

export class BuscarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_DREGDATE: any;
  P_NNUMLOT: any;
  P_NSTATUS: any;
  P_NPOLICY: any;
  P_NNUMPOINT: any;
  _: any;
}

export interface IBuscarResponse {
  ROWTOTAL: any;
  STATUS: any;
  entities: [
    {
      DASSIGN: string;
      NNUMLOT: number;
      NNUMLOTSALE: any;
      NPOLESP_COMP: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      SCERTIFICATE: any;
      SNAME_CHANNEL: any;
      SNAME_SALEPOINT: any;
      SSTATUS: any;
      STATUS: any;
      TAG: any;
    }
  ];
}

export class EstadoRequest {
  P_SCODE: any;
  _: any;
}

export interface IEstadoResponse {
  ROWTOTAL: any;
  STATUS: any;
  entities: [
    {
      DCOMPDATE: string;
      NSTATUSPOL: number;
      NUSERCODE: number;
      ROWNUMBER: number;
      ROWTOTAL: number;
      SDESCRIPT: string;
      SCERTIFICATE: number;
      STATUS: number;
      TAG: any;
    }
  ];
}

export class ECanalYPuntoRequest {
  _: any;
}

export interface IECanalYPuntoResponse {
  PA_SEL_STATE: [
    {
      NSTATUSPOL: number;
      SDESCRIPT: string;
    }
  ];
}

export class BusquedaRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NPOLICYS: any;
  P_NSALEPOINTS: any;
  P_NSTATUS: any;
  _: any;
}

export interface IBusquedaResponse {
  ROWTOTAL: number;
  STATUS: number;
  entities: [
    {
      NNUMLOT: number;
      NPOLESP_COMP: number;
      ROWNUMBER: number;
      ROWTOTAL: number;
      SCERTIFICATE: string;
      SNUMPOINT: string;
      SPOLICY: string;
      SSTATUS: string;
      STATUS: number;
      TAG: any;
    }
  ];
}

export class BusquedaDescargoRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NNUMLOT: any;
  _: any;
}

export interface BusquedaDescargoResponse {
  ROWTOTAL: number;
  entities: [
    {
      DCOMPDATE: string;
      NNUMLOT: number;
      NPOLICY: number;
      ROWNUMBER: number;
      ROWTOTAL: number;
      SDESCHANNEL: string;
      SDESCRIPT: string;
      SORIGEN: string;
      STATUS: number;
      SUSER: string;
      TAG: any;
    }
  ];
}

export class BuscarHEVRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NPOLESP_COMP: any;
  _: any;
}

export interface BuscarHEVResponse {
  ROWTOTAL: number;
  STATUS: number;
  entities: [
    {
      NNUMLOT: number;
      NPOLESP: number;
      ROWNUMBER: number;
      ROWTOTAL: number;
      SCERTIFICATE: string;
      SSTATE: string;
      STATUS: number;
      TAG: any;
    }
  ];
}

export class BuscarProduccionRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_DRANGESTART: any;
  P_DRANGEEND: any;
  P_NPOLICY: any;
  P_NNUMPOINT: any;
  _: any;
}

export interface IBuscarProduccionResponse {
  ROWTOTAL: any;
  STATUS: any;
  entities: [
    {
      ASIENTOS: any;
      AÑO: any;
      CANAL: any;
      CARROCERIA: any;
      CATEGORIA: any;
      COMISION: any;
      DCOMPDATE: any;
      DEPARTAMENTO: any;
      DESCARROCERIA: any;
      DESCATEGORIA: any;
      DESNCLASS: any;
      DESUSO: any;
      DEXPIRDAT: any;
      DFECDOC: any;
      DIRECCION: any;
      DISTRITO: any;
      DSTARTDATE: any;
      FECINTERFAZ: any;
      FECVEN: any;
      HORA: any;
      IDCONTRATANTE: any;
      IDMODELO: any;
      MARCA: any;
      MODELO: any;
      MONTOCOMPROBANTE: any;
      NCLASS: any;
      NDEREMI: any;
      NMONIGV: any;
      NMONNET: any;
      NMPRIMA: any;
      NOMCONTRATANTE: any;
      NPOLESP_COMP: any;
      NPOLICY: any;
      NRODOC: any;
      NROSERIE: any;
      NSTATUSISSUE: any;
      NSTATUSPOL: any;
      NUMDOC: any;
      NUMINTERFAZ: any;
      PERSONA: any;
      PORCOMISION: any;
      PROVINCIA: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      SOA_VESTADO: any;
      SPLATE: any;
      SPOLICY: any;
      SSALEPOINT: any;
      SSTATUSPOL: any;
      STATUS: any;
      STIPODOCUMENTO: any;
      SVERTION: any;
      S_CLIENT: any;
      S_CLIENTNAME: any;
      TAG: any;
      TELEFONO: any;
      TIPDOC: any;
      USO: any;
    }
  ];
}

export class BuscarEndososRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_DRANGESTART: any;
  P_DRANGEEND: any;
  _: any;
}

export interface IBuscarEndososResponse {
  ROWTOTAL: any;
  STATUS: any;
  entities: [
    {
      DDATE_ENDOSES: any;
      NPOLESP_COMP: any;
      NPOLICY: any;
      NUSER: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      SDATAFIELD_UPDATE: any;
      SDATAVALUE_UPDATE: any;
      SDATAVALUE_UPDATE_NEW: any;
      SPOLICY: any;
      STATUS: any;
      SUSER: any;
      TAG: any;
    }
  ];
}
