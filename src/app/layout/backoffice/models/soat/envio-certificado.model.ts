export class ListarRequest {
  P_NPOLESP: string; // Numero de Certificado
  P_SPLATE: string; // Placa
  P_NTIPPER: string;
  P_SNAME: string; // Nombre
  P_NNRODOC: string; // Numero de Documento
  P_SAPEPAT: string; // Apellido Paterno
  P_SAPEMAT: string; // Apellido Materno
  P_NUSERCODE: string;

  constructor(datos: any) {
    this.P_NPOLESP = datos.certificado || '';
    this.P_SPLATE = datos.placa || '';
    this.P_NTIPPER = datos.ntipper || '';
    this.P_SNAME = datos.nombres || '';
    this.P_NNRODOC = datos.documento || '';
    this.P_SAPEPAT = datos.apellidoPaterno || '';
    this.P_SAPEMAT = datos.apellidoMaterno || '';
    this.P_NUSERCODE = datos.userCode || '';
  }
}

export interface IListarResponse {
  ROWTOTAL: number;
  entities: [
    {
      DEFFECDATE: string;
      DEFFECDATE_D: string;
      DESCLASE: any;
      DESMARCA: any;
      DESMODELO: any;
      DESVEHMODEL: string;
      DVIGFIN: string;
      DVIGINI: string;
      FECHA_EMISION: string;
      HORA_EMISION: string;
      NAUTOZONE: number;
      NDIGIT_VERIF: number;
      NIDCLASE: number;
      NIDDOC_TYPE: number;
      NIDUSO: number;
      NLOCAL: number;
      NMARK: number;
      NMUNICIPALITY: number;
      NPOLESP_COMP: string;
      NPREMIUM: number;
      NPROVINCE: number;
      NSEATING: number;
      NTIPPER: number;
      NYEAR: number;
      ROWNUMBER: number;
      SADDRESS: string;
      SCLIENT: string;
      SCLIENTNAME: string;
      SCOMPROBANTE: string;
      SDOC_TYPE: string;
      SE_MAIL: any;
      SLASTNAME: string;
      SLASTNAME2: string;
      SNAME: string;
      SNUMDOC: string;
      SORIGEN: string;
      SPLACA: string;
      SSERIAL: string;
      STATUS: number;
      TAG: number;
      TI_DIRE: string;
      TI_VEHICULO: string;
      V_AUTORIZA: string;
    }
  ];
}

export interface IUsoResponse {
  PRO_USE: Array<{
    NIDUSO: number;
    SDESCRIPT: string;
  }>;
}

export interface ITipoResponse {
  PRO_MASTER: Array<{
    SITEM: number;
    SDECRIPTION: string;
  }>;
}

export interface IDepartamentoResponse {
  PRO_DEPARTMENT: Array<{
    NPROVINCE: number;
    SDESCRIPT: string;
  }>;
}

export class ProvinciaRequest {
  P_NPROVINCE: string;
  P_NLOCAL: string;
  P_SDESCRIPT: string;
  _: string;

  constructor(datos: any) {
    this.P_NPROVINCE = datos.P_NPROVINCE || '';
    this.P_NLOCAL = datos.P_NLOCAL || '';
    this.P_SDESCRIPT = datos.P_SDESCRIPT || '';
    this._ = datos._ || '';
  }
}
export interface IProvinciaResponse {
  PRO_PROVINCE: Array<{
    NLOCAT: number;
    SDESCRIPT: string;
  }>;
}

export class DistritoRequest {
  P_NLOCAL: string;
  P_NMUNICIPALITY: string;
  P_SDESCRIPT: string;
  _: string;

  constructor(datos: any) {
    this.P_NLOCAL = datos.P_NLOCAL || '';
    this.P_NMUNICIPALITY = datos.P_NMUNICIPALITY || '';
    this.P_SDESCRIPT = datos.P_SDESCRIPT || '';
    this._ = datos._ || '';
  }
}
export interface IDistritoResponse {
  PA_SEL_MUNICIPALITY: Array<{
    NMUNICIPALITY: number;
    SDESCRIPT: string;
  }>;
}

export class ZonaRequest {
  P_SREGIST: any;
  P_STYPE_VEHICLE: any;
  P_NPROVINCE: any;
  P_NYEAR: any;
  _: any;

  constructor(datos: any) {
    this.P_SREGIST = datos.P_SREGIST || '';
    this.P_STYPE_VEHICLE = datos.P_STYPE_VEHICLE || '';
    this.P_NPROVINCE = datos.P_NPROVINCE || '';
    this._ = datos._ || '';
  }
}
export interface IZonaResponse {
  PRO_ZONE: Array<{
    NPROVINCE: number;
    SDESCRIPT: string;
  }>;
}

export class MarcaRequest {
  P_USER: string;
  _: string;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}
export interface IMarcaResponde {
  PRO_MARK: Array<{
    NVEHBRAND: number;
    SDESCRIPT: string;
  }>;
}

export class ModeloRequest {
  P_NVEHBRAND: any;
  P_NVEHMODEL: any;
  P_SDESCRIPT: any;
  _: any;

  constructor(datos: any) {
    this.P_NVEHBRAND = datos.P_NVEHBRAND || '';
    this.P_NVEHMODEL = datos.P_NVEHMODEL || '';
    this.P_SDESCRIPT = datos.P_SDESCRIPT || '';
    this._ = datos._ || '';
  }
}
export interface IModeloResponse {
  PRO_MODEL: Array<{}>;
}

export class ClaseRequest {
  P_USER: any;
  _: any;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}
export interface IClaseResponse {
  PRO_CLASS: Array<{}>;
}

export interface EnviarRequest {
  certificado: string; // Numero de Certificado
  correo: string; // Placa
}

export interface IEnviarResponse {
  NStatus: number;
}
