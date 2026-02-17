export class BuscarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NIDREQUEST: any;
  P_SCLIENAME: any;
  P_NPOLICYS: any;
  P_NSALEPOINTS: any;
  P_NSTATUS: any;
  P_DFCREABEGIN: any;
  P_DFCREAEND: any;
  P_NCODUSER: any;
  _: any;

  constructor(datos: any) {
    this.filterscount = datos.filterscount || '';
    this.groupscount = datos.groupscount || '';
    this.pagenum = datos.pagenum || '';
    this.pagesize = datos.pagesize || '';
    this.recordstartindex = datos.recordstartindex || '';
    this.recordendindex = datos.recordendindex || '';
    this.P_NIDREQUEST = datos.P_NIDREQUEST || '';
    this.P_SCLIENAME = datos.P_SCLIENAME || '';
    this.P_NPOLICYS = datos.P_NPOLICYS || '';
    this.P_NSTATUS = datos.P_NSTATUS || '';
    this.P_DFCREABEGIN = datos.P_DFCREABEGIN || '';
    this.P_DFCREAEND = datos.P_DFCREAEND || '';
    this.P_NCODUSER = datos.P_NCODUSER || '';
    this._ = datos._ || '';
  }
}

export interface BuscarResponse {
  ROWTOTAL: any;
  STATUS: any;
  entities: Array<{
    DREGISTER: any;
    NAMOUNTCOVERED: any;
    NIDPOLICY: any;
    NIDREQUEST: any;
    NNUMLOT: any;
    NNUMPOINT: any;
    NPOLFIN: any;
    NPOLINI: any;
    NQUANTITYAMOUNT: any;
    NREQUESTEDAMOUNT: any;
    NTYPECERTIF: any;
    NUSERREGISTER: any;
    ROWNUMBER: any;
    ROWTOTAL: any;
    SCERTIFICATE: any;
    SPOLICY: any;
    SSALEPOINT: any;
    SSTATUS: any;
    STATUS: any;
    TAG: any;
  }>;
}
