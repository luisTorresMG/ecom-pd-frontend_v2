export class ListarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_DREGDATEINI: any;
  P_DREGDATEFIN: any;
  P_NTRANSFERSTATUS: any;
  P_NCERTIFICADO: any;
  P_NPLACA: any;
  _: any;

  constructor(datos: any) {
    this.filterscount = datos.filterscount || '';
    this.groupscount = datos.groupscount || '';
    this.pagenum = datos.pagenum || '';
    this.pagesize = datos.pagesize || '';
    this.recordstartindex = datos.recordstartindex || '';
    this.recordendindex = datos.recordendindex || '';
    this.P_DREGDATEINI = datos.fechaInicio || '';
    this.P_DREGDATEFIN = datos.fechaFin || '';
    this.P_NTRANSFERSTATUS = datos.estadoTrans || '';
    this.P_NCERTIFICADO = datos.nCertificado || '';
    this.P_NPLACA = datos.placa || '';
    this._ = datos.uno || '';
  }
}

export interface IListarResponse {
  ROWTOTAL: number;
  STATUS: number;
  entities: Array<{
    DESERROR: any;
    D_EXPIRDAT: any;
    D_STARTDATE: any;
    NFECHA_REGISTRO: any;
    NIDPOLICY: any;
    NMPRIMA: any;
    NNUMPOINT: any;
    NPLACA: any;
    NSCOD_ERROR: any;
    NTRANSFERSTATUS: any;
    N_POLESP_COMP: any;
    ROWNUMBER: any;
    ROWTOTAL: any;
    SPOLICY: any;
    SSALEPOINT: any;
    STATUS: any;
    STRANSFERSTATUS: any;
    S_CLIENAME: any;
    S_CLIENT: any;
    TAG: any;
  }>;
}

export class EstadoRequest {
  S_TYPE: any;
  _: any;

  constructor(datos: any) {
    this.S_TYPE = datos.S_TYPE || '';
    this._ = datos._ || '';
  }
}

export interface IEstadoResponse {
  PRO_MASTER: Array<{
    SITEM: any;
    SDECRIPTION: any;
  }>;
}

export interface IEnviarResponse {
  code: any;
  description: any;
  message: any;
}
