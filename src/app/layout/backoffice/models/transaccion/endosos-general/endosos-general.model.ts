export class TipoDocRequest {
  S_TYPE: any;
  _: any;

  constructor(datos: any) {
    this.S_TYPE = datos.S_TYPE || '';
    this._ = datos._ || '';
  }
}

export interface ITipoDocResponse {
  PRO_MASTER: Array<{
    SITEM: any;
    SDECRIPTION: any;
  }>;
}

export interface ITipoStaResponse {
  PRO_MASTER: Array<{
    SITEM: any;
    SDECRIPTION: any;
  }>;
}

export interface IDepartResponse {
  PRO_DEPARTMENT: Array<{
    NPROVINCE: any;
    SDESCRIPT: any;
  }>;
}

export interface IDepartResponse {
  PRO_DEPARTMENT: Array<{
    NPROVINCE: any;
    SDESCRIPT: any;
  }>;
}

export class BuscarRequest {
  P_NPOLESP: any;
  P_SPLATE: any;
  P_NTIPPER: any;
  P_SNAME: any;
  P_NNRODOC: any;
  P_SAPEPAT: any;
  P_SAPEMAT: any;
  P_NUSERCODE: any;

  constructor(datos: any) {
    this.P_NPOLESP = datos.P_NPOLESP || '';
    this.P_SPLATE = datos.P_SPLATE || '';
    this.P_NTIPPER = datos.P_NTIPPER || '';
    this.P_SNAME = datos.P_SNAME || '';
    this.P_NNRODOC = datos.P_NNRODOC || '';
    this.P_SAPEPAT = datos.P_SAPEPAT || '';
    this.P_SAPEMAT = datos.P_SAPEMAT || '';
    this.P_NUSERCODE = datos.P_NUSERCODE || '';
  }
}

export interface IBuscarResponse {
  Cantidad: number;
  PA_SEL_ENDOSO: {
    DEFFECDATE: any;
    DEFFECDATE_D: any;
    DESCLASE: any;
    DESMARCA: any;
    DESMODELO: any;
    DESVEHMODEL: any;
    DVIGFIN: any;
    DVIGINI: any;
    FECHA_EMISION: any;
    HORA_EMISION: any;
    NAUTOZONE: any;
    NDIGIT_VERIF: any;
    NIDCLASE: any;
    NIDDOC_TYPE: any;
    NIDUSO: any;
    NLOCAL: any;
    NMARK: any;
    NMODEL: any;
    NMUNICIPALITY: any;
    NPOLESP_COMP: any;
    NPREMIUM: any;
    NPROVINCE: any;
    NSEATING: any;
    NTIPPER: any;
    NYEAR: any;
    ROWNUMBER: any;
    ROWTOTAL: any;
    SADDRESS: any;
    SCLIENT: any;
    SCLIENTNAME: any;
    SCOMPROBANTE: any;
    SDOC_TYPE: any;
    SE_MAIL: any;
    SLASTNAME: any;
    SLASTNAME2: any;
    SNAME: any;
    SNUMDOC: any;
    SORIGEN: any;
    SPLACA: any;
    SSERIAL: any;
    STATUS: any;
    TAG: any;
    TI_DIRE: any;
    TI_VEHICULO: any;
    V_AUTORIZA: any;
  };
}

export class MarcaRequest {
  _: any;

  constructor(datos: any) {
    this._ = datos._ || '';
  }
}

export interface IMarcaResponse {
  PA_SEL_MARK: Array<{
    NMARK: any;
    NVEHBRAND: any;
    SDESCRIPT: any;
  }>;
}

export class UsoRequest {
  P_USER: any;
  _: any;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}

export interface IUsoResponse {
  PRO_USE: Array<{
    NIDUSO: any;
    SDESCRIPT: any;
  }>;
}

export class VersionRequest {
  P_NVEHBRAND: any;
  _: any;

  constructor(datos: any) {
    this.P_NVEHBRAND = datos.P_NVEHBRAND || '';
    this._ = datos._ || '';
  }
}

export interface IVersionResponse {
  version: Array<{
    NVEHMODEL: any;
    SDESVEHMODEL: any;
    SDESCRIPT: any;
  }>;
}

export class ClaseRequest {
  P_NVEHBRAND: any;
  P_SDESVEHMODEL: any;
  _: any;

  constructor(datos: any) {
    this.P_NVEHBRAND = datos.P_NVEHBRAND || '';
    this.P_SDESVEHMODEL = datos.P_SDESVEHMODEL || '';
    this._ = datos._ || '';
  }
}

export interface IClaseResponse {
  PRO_CLASS: Array<{
    NIDCLASE: any;
    SDESCRIPT: any;
  }>;
}

export class DepartamentoRequest {
  P_USER: any;
  _: any;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}

export interface IDepartamentoResponse {
  PRO_DEPARTMENT: Array<{
    NPROVINCE: any;
    SDESCRIPT: any;
  }>;
}

export class ProvinciaRequest {
  P_NPROVINCE: any;
  P_NLOCAL: any;
  P_SDESCRIPT: any;
  _: any;

  constructor(datos: any) {
    this.P_NPROVINCE = datos.P_NPROVINCE || '';
    this.P_NLOCAL = datos.P_NLOCAL || '';
    this.P_SDESCRIPT = datos.P_SDESCRIPT || '';
    this._ = datos._ || '';
  }
}

export interface IProvinciaResponse {
  PRO_PROVINCE: Array<{
    NLOCAL: any;
    SDESCRIPT: any;
  }>;
}

export class DistritoRequest {
  P_NLOCAL: any;
  P_NMUNICIPALITY: any;
  P_SDESCRIPT: any;
  _: any;

  constructor(datos: any) {
    this.P_NLOCAL = datos.P_NLOCAL || '';
    this.P_NMUNICIPALITY = datos.P_NMUNICIPALITY || '';
    this.P_SDESCRIPT = datos.P_SDESCRIPT || '';
    this._ = datos._ || '';
  }
}

export interface IDistritoResponse {
  PA_SEL_MUNICIPALITY: Array<{
    NMUNICIPALITY: any;
    SDESCRIPT: any;
  }>;
}

export interface IModificarResponse {
  NStatus: {
    P_ES_ERROR: any;
    P_ERROR_MSG: any;
  };
}

export class ValidarRequest {
  P_NVOUCHER: any; // *
  P_NPOLESP_COMP: any; // *
  P_DVIGINI: any; // *
  P_DVIGFIN: any; // *
  P_DEFFECDATE: any; // *
  P_DEFFECDATE_: any; // *
  HORA_EMISION: any; // *
  P_FECHA_EMISION2: any; // *
  P_FECHA_EMISION: any; // *
  P_HORA: any; // *
  P_SPLATE: any; // *
  P_NMARK: any; // *
  P_NSEATING: any; // *
  P_NYEAR: any; // *
  P_SSERIAL: any; // *
  P_NCIRCU: any; // *
  P_NTIPPER: any; // *
  P_SNUMDOC: any; // *
  P_SLEGALNAME: any; // *
  P_SFIRSTNAME: any; // *
  P_SNAME: any; // *
  P_SLASTNAME: any; // *
  P_SLASTNAME2: any; // *
  P_SE_MAIL_S: any; // *
  P_SSTREET: any; // *
  P_SADDRESS: any; // *
  P_NPROVINCE: any; // *
  P_NLOCAL: any; // *
  P_NMUNICIPALITY: any; // *
  P_SCLIENT: any; // *
  P_NREASON: any; // *
  P_NDIGIT_VERIF: any; // *
  P_SOBSERVATION: any; // *
  P_NIDDOC_TYPE: any; // *
  P_SCLIENTNAME: any; // *
  P_NUSERREGISTER: any; // *
  P_NRESULTADO: any; // *
  P_SNOMMARCA: any; // *
  P_NMODEL: any; // *
  P_AUTORIZA: any; // *
  P_SCLASSTYPE: any; // *
  P_SORIGEN: any; // *
  P_SREGIST_TMP: any; // *
  P_VALIDA: any; // *
  P_NCLASE: any; // *
  P_NUSO: any; // *
  P_TI: any; // *
  P_NPREMIUM: any; // *

  constructor(datos: any) {
    this.P_NVOUCHER = datos.P_NVOUCHER || ''; // *
    this.P_NPOLESP_COMP = datos.P_NPOLESP_COMP || ''; // *
    this.P_DVIGINI = datos.P_DVIGINI || ''; // *
    this.P_DVIGFIN = datos.P_DVIGFIN || ''; // *
    this.P_DEFFECDATE = datos.P_DEFFECDATE || ''; // *
    this.P_DEFFECDATE_ = datos.P_DEFFECDATE_ || ''; // *
    this.HORA_EMISION = datos.HORA_EMISION || ''; // *
    this.P_FECHA_EMISION2 = datos.P_FECHA_EMISION2 || ''; // *
    this.P_FECHA_EMISION = datos.P_FECHA_EMISION || ''; // *
    this.P_HORA = datos.P_HORA || ''; // *
    this.P_SPLATE = datos.P_SPLATE || ''; // *
    this.P_NMARK = datos.P_NMARK || ''; // *
    this.P_NSEATING = datos.P_NSEATING || ''; // *
    this.P_NYEAR = datos.P_NYEAR || ''; // *
    this.P_SSERIAL = datos.P_SSERIAL || ''; // *
    this.P_NCIRCU = datos.P_NCIRCU || ''; // *
    this.P_NTIPPER = datos.P_NTIPPER || ''; // *
    this.P_SNUMDOC = datos.P_SNUMDOC || ''; // *
    this.P_SLEGALNAME = datos.P_SLEGALNAME || ''; // *
    this.P_SFIRSTNAME = datos.P_SFIRSTNAME || ''; // *
    this.P_SNAME = datos.P_SNAME || ''; // *
    this.P_SLASTNAME = datos.P_SLASTNAME || ''; // *
    this.P_SLASTNAME2 = datos.P_SLASTNAME2 || ''; // *
    this.P_SSTREET = datos.P_SSTREET || ''; // *
    this.P_SADDRESS = datos.P_SADDRESS || ''; // *
    this.P_NPROVINCE = datos.P_NPROVINCE || ''; // *
    this.P_NLOCAL = datos.P_NLOCAL || ''; // *
    this.P_NMUNICIPALITY = datos.P_NMUNICIPALITY || ''; // *
    this.P_SCLIENT = datos.P_SCLIENT || ''; // *
    this.P_NREASON = datos.P_NREASON || ''; // *
    this.P_NDIGIT_VERIF = datos.P_NDIGIT_VERIF || ''; // *
    this.P_SOBSERVATION = datos.P_SOBSERVATION || ''; // *
    this.P_NIDDOC_TYPE = datos.P_NIDDOC_TYPE || ''; // *
    this.P_SCLIENTNAME = datos.P_SCLIENTNAME || ''; // *
    this.P_NUSERREGISTER = datos.P_NUSERREGISTER || ''; // *
    this.P_NRESULTADO = datos.P_NRESULTADO || ''; // *
    this.P_SNOMMARCA = datos.P_SNOMMARCA || ''; // *
    this.P_NMODEL = datos.P_NMODEL || ''; // *
    this.P_AUTORIZA = datos.P_AUTORIZA || ''; // *
    this.P_SCLASSTYPE = datos.P_SCLASSTYPE || ''; // *
    this.P_SORIGEN = datos.P_SORIGEN || ''; // *
    this.P_SREGIST_TMP = datos.P_SREGIST_TMP || ''; // *
    this.P_VALIDA = datos.P_VALIDA || ''; // *
    this.P_NCLASE = datos.P_NCLASE || ''; // *
    this.P_NUSO = datos.P_NUSO || ''; // *
    this.P_TI = datos.P_TI || ''; // *
    this.P_NPREMIUM = datos.P_NPREMIUM || ''; // *
  }
}

export interface IValidarResponse {
  PRO_VAL_CAMPOS: {
    P_ES_ERROR: any;
    P_ERROR_MSG: any;
  };
}

export class ComparacionRequest {
  P_NVEHBRAND: any;
  P_DESVEHMODEL: any;
  P_NIDCLASE: any;

  constructor(datos: any) {
    this.P_NVEHBRAND = datos.P_NVEHBRAND || '';
    this.P_DESVEHMODEL = datos.P_DESVEHMODEL || '';
    this.P_NIDCLASE = datos.P_NIDCLASE || '';
  }
}

export interface IComparacionResponse {
  PRO_VERSIONEQUI: {
    P_NVEHMAINMODEL: any;
    P_NVEHMODEL: any;
  };
}
