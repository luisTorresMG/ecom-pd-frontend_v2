export class ValidarRequest {
  P_INDTIPOIMP: any;
  P_SPOLICYS: any;
  P_SFEINI: any;
  P_SFEFIN: any;

  constructor(datos: any) {
    this.P_INDTIPOIMP = datos.P_INDTIPOIMP || '';
    this.P_SPOLICYS = datos.P_SPOLICYS || '';
    this.P_SFEINI = datos.P_SFEINI || '';
    this.P_SFEFIN = datos.P_SFEFIN || '';
  }
}

export interface IValidarResponse {
  VAL_CERTIF: Array<{
    P_NERROR: number;
    P_SERROR: string;
  }>;
}

export interface IListarResponse {
  ROWTOTAL: number;
  entities: Array<{
    CLASE: any;
    DEPARTAMENTO: any;
    DISTRITO: any;
    FECHA_EMISION: any;
    FIN_VIGENCIA: any;
    HORA_EMISION: any;
    INICIO_VIGENCIA: any;
    MARCA: any;
    MODELO: any;
    NPOLICY: any;
    NPREMIUM: any;
    NSEATCOUNT: any;
    NYEAR: any;
    PROVINCIA: any;
    ROWNUMBER: any;
    ROWTOTAL: any;
    SCHASSIS: any;
    SCLIENAME: any;
    SDOC_TYPE: any;
    SE_MAIL: any;
    SIDDOC: any;
    SNAMEPDF: any;
    SPHONE: any;
    SREGIST: any;
    SSTREET: any;
    STATUS: any;
    TAG: any;
    USO: any;
  }>;
}

export interface ILimpiarResponse {
  Limpieza: any;
}

export class ImprimirRequest {
  P_INDTIPOIMP: any;
  P_SPOLICYS: any;
  P_SFEINI: any;
  P_SFEFIN: any;

  constructor(datos: any) {
    this.P_INDTIPOIMP = datos.P_INDTIPOIMP || '';
    this.P_SPOLICYS = datos.P_SPOLICYS || '';
    this.P_SFEINI = datos.P_SFEINI || '';
    this.P_SFEFIN = datos.P_SFEFIN || '';
  }
}

export interface IImprimirResponse {
  URL: URL;
}
