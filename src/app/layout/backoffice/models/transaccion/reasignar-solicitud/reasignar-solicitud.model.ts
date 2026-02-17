import { NgAnalyzedFile } from '@angular/compiler';

export class CanalRequest {
  _: any;

  constructor(datos: any) {
    this._ = datos._ || '';
  }
}

export interface ICanalResponse {
  PRO_POLICY: Array<{
    NIDPOLICY: any;
    SCLIENAME: any;
  }>;
}

export class BuscarRequest {
  filterscount: any;
  groupscount: any;
  pagenum: any;
  pagesize: any;
  recordstartindex: any;
  recordendindex: any;
  P_NPOLICY_O: any;
  P_NPOLICY_D: any;
  P_DFCREABEGIN: any;
  P_DFCREAEND: any;
  _: any;

  constructor(datos: any) {
    this.filterscount = datos.filterscount || '';
    this.groupscount = datos.groupscount || '';
    this.pagenum = datos.pagenum || '';
    this.pagesize = datos.pagesize || '';
    this.recordstartindex = datos.recordstartindex || '';
    this.recordendindex = datos.recordendindex || '';
    this.P_NPOLICY_O = datos.P_NPOLICY_O || '';
    this.P_NPOLICY_D = datos.P_NPOLICY_D || '';
    this.P_DFCREABEGIN = datos.P_DFCREABEGIN || '';
    this.P_DFCREAEND = datos.P_DFCREAEND || '';
    this._ = datos._ || '';
  }
}

export interface IBuscarResponse {
  ROWTOTAL: any;
  entities: [
    {
      DREGISTER: any;
      NIDREASSIGN: any;
      NNUMLOT_D: any;
      NNUMLOT_O: any;
      NNUMPOINT_D_DES: any;
      NNUMPOINT_O_DES: any;
      NPOLICY_D_DES: any;
      NPOLICY_O_DES: any;
      NQUANTITY: any;
      ROWNUMBER: any;
      ROWTOTAL: any;
      SRANGE: any;
      STATUS: any;
      TAG: any;
    }
  ];
  STATUS: any;
}

export class TipoCRequest {
  S_TYPE: any;
  _: any;

  constructor(datos: any) {
    this.S_TYPE = datos.S_TYPE || '';
    this._ = datos._ || '';
  }
}

export interface ITipoCResponse {
  PRO_MASTER: Array<{
    SITEM: any;
    SDECRIPTION: any;
  }>;
}

export class CanalDRequest {
  P_NPOLICY: any;
  _: any;

  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this._ = datos._ || '';
  }
}

export interface ICanalDResponse {
  PRO_POLICY: Array<{
    NIDPOLICY: any;
    SCLIENAME: any;
  }>;
}

export class PuntoVRequest {
  P_NPOLICY: any;
  P_NNUMPOINT: any;
  _: any;

  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this.P_NNUMPOINT = datos.P_NNUMPOINT || '';
    this._ = datos._ || '';
  }
}

export interface IPuntoVDResponse {
  PRO_SALE_POINT: Array<{
    NNUMPOINT: any;
    SDESCRIPT: any;
  }>;
}

export class CanalOrigenRequest {
  P_NPOLICY: any;
  _: any;

  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this._ = datos._ || '';
  }
}

export interface ICanalOrigenResponse {
  PRO_POLICY: Array<{
    NIDPOLICY: any;
    SCLIENAME: any;
  }>;
}

export class PuntoVORequest {
  P_NPOLICY: any;
  P_NNUMPOINT: any;
  _: any;

  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this.P_NNUMPOINT = datos.P_NNUMPOINT || '';
    this._ = datos._ || '';
  }
}

export interface IPuntoVOResponse {
  PRO_SALE_POINT: Array<{
    NNUMPOINT: any;
    SDESCRIPT: any;
  }>;
}

export class ValidarRequest {
  P_NUMLOT: any;
  P_NPOLICY_O: any;
  P_NNUMPOINT_O: any;
  P_NTIPPOL: any;
  P_NQUANTITY: any;
  RANGE_LIST: any;

  constructor(datos: any) {
    this.P_NUMLOT = datos.P_NUMLOT || '';
    this.P_NPOLICY_O = datos.P_NPOLICY_O || '';
    this.P_NNUMPOINT_O = datos.P_NNUMPOINT_O || '';
    this.P_NTIPPOL = datos.P_NTIPPOL || '';
    this.P_NQUANTITY = datos.P_NQUANTITY || '';
    this.RANGE_LIST = datos.RANGE_LIST || '';
  }
}

export interface IValidarResponse {
  NSTATUS: any;
  objParameters: {
    P_MESSAGE: any;
    P_NNUMPOINT_O: any;
    P_NPOLICY_O: any;
    P_NQUANTITY: any;
    P_NTIPPOL: any;
    P_NUMLOT: any;
    P_STATE: any;
    P_TYPEQUERY: any;
    RANGE_LIST: [any];
  };
}

export class Validar2Request {
  P_NUMLOT: any;
  P_NPOLICY_O: any;
  P_NNUMPOINT_O: any;
  P_NTIPPOL: any;
  P_NQUANTITY: any;

  constructor(datos: any) {
    this.P_NUMLOT = datos.P_NUMLOT || '';
    this.P_NPOLICY_O = datos.P_NPOLICY_O || '';
    this.P_NNUMPOINT_O = datos.P_NNUMPOINT_O || '';
    this.P_NTIPPOL = datos.P_NTIPPOL || '';
    this.P_NQUANTITY = datos.P_NQUANTITY || '';
  }
}

export interface IValidarResponse {
  NSTATUS: any;
  objParameters: {
    P_MESSAGE: any;
    P_NNUMPOINT_O: any;
    P_NPOLICY_O: any;
    P_NQUANTITY: any;
    P_NTIPPOL: any;
    P_NUMLOT: any;
    P_STATE: any;
    P_TYPEQUERY: any;
    RANGE_LIST: [any];
  };
}

export class InsertarRequest {
  P_NUSERREGISTER: any;
  P_NPOLICY_O: any;
  P_NPOLICY_D: any;
  P_NNUMPOINT_O: any;
  P_NNUMPOINT_D: any;
  P_SRANGE: any;
  P_NTYPECERTIF: any;
  P_NQUANTITY: any;
  P_TYPE_ASSIGN: any;
  P_STATE: any;
  P_MESSAGE: any;
  RANGE_LIST: any;

  constructor(datos: any) {
    this.P_NUSERREGISTER = datos.P_NUSERREGISTER || '';
    this.P_NPOLICY_O = datos.P_NPOLICY_O || '';
    this.P_NPOLICY_D = datos.P_NPOLICY_D || '';
    this.P_NNUMPOINT_O = datos.P_NNUMPOINT_O || '';
    this.P_NNUMPOINT_D = datos.P_NNUMPOINT_D || '';
    this.P_SRANGE = datos.P_SRANGE || '';
    this.P_NTYPECERTIF = datos.P_NTYPECERTIF || '';
    this.P_NQUANTITY = datos.P_NQUANTITY || '';
    this.P_TYPE_ASSIGN = datos.P_TYPE_ASSIGN || '';
    this.P_STATE = datos.P_STATE || '';
    this.P_MESSAGE = datos.P_MESSAGE || '';
    this.RANGE_LIST = datos.RANGE_LIST || '';
  }
}

export interface InsertarResponse {
  NSTATUS: any;
  objParameters: {
    P_MESSAGE: any;
    P_NNUMPOINT_D: any;
    P_NPOLICY_O: any;
    P_NQUANTITY: any;
    P_NTYPECERTIF: any;
    P_NUSERREGISTER: any;
    P_SRANGE: any;
    P_STATE: any;
    P_TYPE_ASSIGN: any;
    RANGE_LIST: [any];
  };
}

export interface ErrorResponse {
  code: any;
  description: any;
  message: any;
}
