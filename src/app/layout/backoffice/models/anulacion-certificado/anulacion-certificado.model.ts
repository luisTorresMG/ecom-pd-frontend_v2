export class BuscarRequest {
  P_NPOLICY: string; // Certificado

  constructor(datos: any) {
    this.P_NPOLICY = datos.certificado || '';
  }
}

export interface IBuscarResponse {
  PRO_CERTIF: [
    {
      ANULADO: any;
      CANAL: string;
      CLASE: string;
      DEPARTAMENTO: string;
      DISTRITO: string;
      FECHA_EMISION: string;
      FE_CREACION: any;
      FIN_VIGENCIA: string;
      HORA_EMISION: string;
      INICIO_VIGENCIA: string;
      MARCA: string;
      MODELO: string;
      MONEDA: string;
      NBILLNUM: number;
      NBRANCH: number;
      NCOMMISSI: number;
      NDIGIT_VERIF: number;
      NIDDOC_TYPE: number;
      NINSUR_AREA: number;
      NPOLICY: number;
      NPREMIUM: number;
      NPRODUCT: number;
      NRECEIPT: number;
      NRO_LOTE_DESCARGO: number;
      NRO_PLANILLA: number;
      NSEATCOUNT: number;
      NTRANSACTIO: number;
      NYEAR: number;
      ORIGEN: any;
      SCOMPROBANTE: string;
      PROVINCIA: string;
      SBILLTYPE: string;
      SBILLTYPE_ORI: string;
      SCERTYPE: string;
      SCHASSIS: string;
      SCLIENAME: any;
      SCLIENT: string;
      SDOC_TYPE: string;
      SE_MAIL: string;
      SFIRSTNAME: string;
      SIDDOC: string;
      SLASTNAME: string;
      SLASTNAME2: string;
      SLEGALNAME: any;
      SREGIST: string;
      SSTREET: string;
      TELEFONO: any;
      USO: string;
      USU_CREACION: any;
      ZCIRCU: string;
    }
  ];
}
export interface IMotivoResponse {
  PRO_MOTIVE: Array<{
    NNULLCODE: number;
    SDESCRIPT: string;
  }>;
}

export class AnularRequest {
  P_NPOLICY: any; // Certificado
  P_NMOTIVOANU: any;
  P_DNULLDATE: any;
  P_NBILLNUM: any;
  P_DSTARTDATE: any;
  P_DEXPIRDAT: any;
  P_NPREMIUM: any;
  P_SDESCRIPTANU: any;
  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this.P_NMOTIVOANU = datos.P_NMOTIVOANU || '';
    this.P_DNULLDATE = datos.P_DNULLDATE || '';
    this.P_NBILLNUM = datos.P_NBILLNUM || '';
    this.P_DSTARTDATE = datos.P_DSTARTDATE || '';
    this.P_DEXPIRDAT = datos.P_DEXPIRDAT || '';
    this.P_NPREMIUM = datos.P_NPREMIUM || '';
    this.P_SDESCRIPTANU = datos.P_SDESCRIPTANU || '';
  }
}

export interface IAnularResponse {
  PRO_VALANULAR: [
    {
      P_ERROR_MSG: string;
      P_ES_ERROR: number;
      P_INDICA_TI_ANULA: string;
      P_NVALOR_DEVOLVER: string;
    }
  ];
}

export class ValidarRequest {
  P_NPOLICY: string; // Certificado

  constructor(datos: any) {
    this.P_NPOLICY = datos.certificado || '';
  }
}

export interface IValidarResponse {
  VAL_CERTIF: [
    {
      P_ERROR_MSG: string;
      P_ES_ERROR: number;
    }
  ];
}

export class AnularCertifiRequest {
  P_NPOLICY: any; // Certificado
  P_NMOTIVOANU: any;
  P_DNULLDATE: any;
  P_NUSERCODE: any;
  P_NVALOR_DEVOLVER: any;
  P_INDICA_TI_ANULA: any;
  P_NRECEIPT: any;
  P_SCERTYPE: any;
  P_NBRANCH: any;
  P_NPRODUCT: any;
  P_SCLIENT: any;
  P_DSTARTDATE: any;
  P_NBILLNUM: any;
  P_NINSUR_AREA: any;
  P_SBILLTYPE_ORI: any;
  P_SBILLTYPE: any;
  P_NPREMIUM: any;
  P_NTRANSACTIO: any;
  P_NCOMMISSI: any;
  P_NDIGIT_VERIF: any;
  P_NIDDOC_TYPE: any;
  P_SIDDOC: any;
  constructor(datos: any) {
    this.P_NPOLICY = datos.P_NPOLICY || '';
    this.P_NMOTIVOANU = datos.P_NMOTIVOANU || '';
    this.P_DNULLDATE = datos.P_DNULLDATE || '';
    this.P_NUSERCODE = datos.P_NUSERCODE || '';
    this.P_NVALOR_DEVOLVER = datos.P_NVALOR_DEVOLVER || '';
    this.P_INDICA_TI_ANULA = datos.P_INDICA_TI_ANULA || '';
    this.P_NRECEIPT = datos.P_NRECEIPT || '';
    this.P_SCERTYPE = datos.P_SCERTYPE || '';
    this.P_NBRANCH = datos.P_NBRANCH || '';
    this.P_NPRODUCT = datos.P_NPRODUCT || '';
    this.P_SCLIENT = datos.P_SCLIENT || '';
    this.P_DSTARTDATE = datos.P_DSTARTDATE || '';
    this.P_NBILLNUM = datos.P_NBILLNUM || '';
    this.P_NINSUR_AREA = datos.P_NINSUR_AREA || '';
    this.P_SBILLTYPE_ORI = datos.P_SBILLTYPE_ORI || '';
    this.P_SBILLTYPE = datos.P_SBILLTYPE || '';
    this.P_NPREMIUM = datos.P_NPREMIUM || '';
    this.P_NTRANSACTIO = datos.P_NTRANSACTIO || '';
    this.P_NCOMMISSI = datos.P_NCOMMISSI || '';
    this.P_NDIGIT_VERIF = datos.P_NDIGIT_VERIF || '';
    this.P_NIDDOC_TYPE = datos.P_NIDDOC_TYPE || '';
    this.P_SIDDOC = datos.P_SIDDOC || '';
  }
}

export interface IAnularCertifiResponse {
  PRO_ANULAR: [
    {
      P_ERROR_MSG: string;
      P_ES_ERROR: number;
    }
  ];
}

export class EnviarEmailRequest {
  nroCertificado: any;
  razonSocial: any;
  correo: any;
  constructor(datos: any) {
    this.nroCertificado = datos.nroCertificado || '';
    this.razonSocial = datos.razonSocial || '';
    this.correo = datos.correo || '';
  }
}

export interface EnviarEmailResponse {
  enviado: any;
}
