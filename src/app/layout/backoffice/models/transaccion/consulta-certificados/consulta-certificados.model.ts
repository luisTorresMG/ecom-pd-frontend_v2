export class BuscarRequest {
  P_NPOLICY: any;
  P_NIDDOC_TYPE: any;
  P_SIDDOC: any;
  P_SREGIST: any;

  constructor(datos: any) {
    this.P_NPOLICY = datos.nCertificado || '';
    this.P_NIDDOC_TYPE = datos.tipoDocumento || '';
    this.P_SIDDOC = datos.textoTipoDocumento || '';
    this.P_SREGIST = datos.placa || '';
  }
}

export interface IBuscarResponse {
  PRO_CERTIF: [
    {
      ANULADO: any;
      CANAL: any;
      CLASE: any;
      DEPARTAMENTO: any;
      DISTRITO: any;
      FECHA_EMISION: any;
      FE_CREACION: any;
      FIN_VIGENCIA: any;
      HORA_EMISION: any;
      INICIO_VIGENCIA: any;
      MARCA: any;
      MODELO: any;
      MONEDA: any;
      NBILLNUM: any;
      NBRANCH: any;
      NCOMMISSI: any;
      NDIGIT_VERIF: any;
      NIDDOC_TYPE: any;
      NINSUR_AREA: any;
      NPOLICY: any;
      NPREMIUM: any;
      NPRODUCT: any;
      NRECEIPT: any;
      NRO_LOTE_DESCARGO: any;
      NRO_PLANILLA: any;
      NSEATCOUNT: any;
      NTRANSACTIO: any;
      NYEAR: any;
      ORIGEN: any;
      PROVINCIA: any;
      SBILLTYPE: any;
      SBILLTYPE_ORI: any;
      SCERTYPE: any;
      SCHASSIS: any;
      SCLIENAME: any;
      SCLIENT: any;
      SDOC_TYPE: any;
      SE_MAIL: any;
      SFIRSTNAME: any;
      SIDDOC: any;
      SLASTNAME: any;
      SLASTNAME2: any;
      SLEGALNAME: any;
      SREGIST: any;
      SSTREET: any;
      TELEFONO: any;
      USO: any;
      USU_CREACION: any;
      ZCIRCU: any;
    }
  ];
  NCANT: any;
}

export class TipoDocumentoRequest {
  P_USER: any;
  _: any;

  constructor(datos: any) {
    this.P_USER = datos.P_USER || '';
    this._ = datos._ || '';
  }
}

export interface ITipoDocumentoResponse {
  PRO_TYPEDOCUMENT: Array<{
    NIDDOC_TYPE: number;
    SDESCRIPT: string;
  }>;
}
