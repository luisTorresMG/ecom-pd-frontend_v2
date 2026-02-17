export class EstadoRequest {
  _: any;

  constructor(datos: any) {
    this._ = datos._ || '';
  }
}

export class CanalRequest {
  P_USER: any;
  _: any;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}

export interface IEstadoResponse {
  PRO_CURRENCY: Array<{
    NSTATUSPOL: number;
    SDESCRIPT: string;
  }>;
}

export interface ICanalResponse {
  PRO_POLICY: Array<{
    NIDPOLICY: number;
    SCLIENAME: string;
  }>;
}

export class BuscarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NPOLICY: any;
  P_CODCANAL: any;
  P_DESCANAL: any;
  P_NSTATUSPOL_ORI: any;
  P_SSTATUSPOL: any;
  P_STATUS: any;
  _: any;

  constructor(datos: any) {
    this.filterscount = datos.filterscount || '';
    this.groupscount = datos.groupscount || '';
    this.pagenum = datos.pagenum || '';
    this.pagesize = datos.pagesize || '';
    this.recordstartindex = datos.recordstartindex || '';
    this.recordendindex = datos.recordendindex || '';
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this.P_CODCANAL = datos.P_CODCANAL || '';
    this.P_DESCANAL = datos.P_DESCANAL || '';
    this.P_NSTATUSPOL_ORI = datos.P_NSTATUSPOL_ORI || '';
    this.P_SSTATUSPOL = datos.P_SSTATUSPOL || '';
    this.P_STATUS = datos.P_STATUS || '';
    this._ = datos._ || '';
  }
}

export interface IBuscarResponse {
  Errores: any;
  ROWTOTAL: any;
  STATUS: any;
  TOTAL: any;
  entities: [
    {
      NCOLUMN: any;
      P_CODCANAL: any;
      P_DCOMPDATE: any;
      P_DESCANAL: any;
      P_ERROR_MSG: any;
      P_ES_ERROR: any;
      P_NINCLPAYROLL: any;
      P_NNUMLOT: any;
      P_NPOLICY: any;
      P_NPOLICY_OUT: any;
      P_NSTATUSPOL: any;
      P_NSTATUSPOL_ORIGEN: any;
      P_SDESCRIPT: any;
      P_SFILENAME: any;
      P_SORIGEN: any;
      P_SSTATUSPOL: any;
      P_SUSERCODE: any;
      P_VENTA: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      STATUS: any;
      TAG: any;
    }
  ];
}

export class ProcessRequest {
  P_NNUMLOT: any;
  P_NUSERCODE: any;
  P_SUSERCODE: any;

  constructor(datos: any) {
    this.P_NNUMLOT = datos.P_NNUMLOT || '';
    this.P_NUSERCODE = datos.P_NUSERCODE || '';
    this.P_SUSERCODE = datos.P_SUSERCODE || '';
  }
}

export interface IProcessResponse {
  CANTPROCESS: any;
}

export class ObtenerRequest {
  P_NUSERCODE: any;
  P_NSTATUSDISC: any;

  constructor(datos: any) {
    this.P_NUSERCODE = datos.P_NUSERCODE || '';
    this.P_NSTATUSDISC = datos.P_NSTATUSDISC || '';
  }
}

export interface IObtenerResponse {
  Lote: any;
  MsgError: any;
  NumError: any;
}

export class DescargoRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  _: any;

  constructor(datos: any) {
    this.filterscount = datos.filterscount || '';
    this.groupscount = datos.groupscount || '';
    this.pagenum = datos.pagenum || '';
    this.pagesize = datos.pagesize || '';
    this.recordstartindex = datos.recordstartindex || '';
    this.recordendindex = datos.recordendindex || '';
    this._ = datos._ || '';
  }
}

export interface IDescargoResponse {
  Errores: any;
  ROWTOTAL: any;
  STATUS: any;
  TOTAL: any;
  entities: [
    {
      NCOLUMN: any;
      P_CODCANAL: any;
      P_DCOMPDATE: any;
      P_DESCANAL: any;
      P_ERROR_MSG: any;
      P_ES_ERROR: any;
      P_NINCLPAYROLL: any;
      P_NNUMLOT: any;
      P_NPOLICY: any;
      P_NPOLICY_OUT: any;
      P_NSTATUSPOL: any;
      P_NSTATUSPOL_ORIGEN: any;
      P_SDESCRIPT: any;
      P_SFILENAME: any;
      P_SORIGEN: any;
      P_SSTATUSPOL: any;
      P_SUSERCODE: any;
      P_VENTA: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      STATUS: any;
      TAG: any;
    }
  ];
}
