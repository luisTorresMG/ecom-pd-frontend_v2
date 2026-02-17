export class ListarRequest {
  filterscount: string;
  groupscount: string;
  pagenum: string;
  pagesize: string;
  recordstartindex: string;
  recordendindex: string;
  P_NROPLANILLA: string;
  _: string;

  constructor(datos: any) {
    this.filterscount = datos.uno || '';
    this.groupscount = datos.dos || '';
    this.pagenum = datos.tres || '';
    this.pagesize = datos.cuatro || '';
    this.recordstartindex = datos.cinco || '';
    this.recordendindex = datos.seis || '';
    this.P_NROPLANILLA = datos.planilla || '';
    this._ = datos.siete || '';
  }
}

export interface IListarResponse {
  NPLANILLA: number;
  entities: Array<{
    IDSTATE: number;
    NCANAL: string;
    NCANTIDAD: string;
    NCERTIFICADO: string;
    NESTADO_PLANILLA: string;
    NFECHA_OPERACION: string;
    NFECHA_REGISTRO_PAGO: string;
    NFECHA_REGISTRO_PLANILLA: string;
    NIDPAYROLL_DETAIL: number;
    NMONTOTOTAL: string;
    NNRO_OPERACION: string;
    NRO_PLANILLA: number;
  }>;
}

export class ActualizarRequest {
  P_NOPERATION: string;
  P_DATEOPERATION: string;
  P_NROPLANILLA: string;
  P_NIDPAYROLL_DETAIL: string;
  P_ESTADO: string;

  constructor(datos: any) {
    this.P_NOPERATION = datos.P_NOPERATION || '';
    this.P_DATEOPERATION = datos.P_DATEOPERATION || '';
    this.P_NROPLANILLA = datos.P_NROPLANILLA || '';
    this.P_NIDPAYROLL_DETAIL = datos.P_NIDPAYROLL_DETAIL || '';
    this.P_ESTADO = datos.P_ESTADO || '';
  }
}

export interface IActualizarResponse {
  MSG: any;
}

export class NivelIRequest {
  P_NIDPAYROLL: any;

  constructor(datos: any) {
    this.P_NIDPAYROLL = datos.P_NIDPAYROLL || '';
  }
}

export interface INivelIResponse {
  MSG: any;
}

export class GenerarFRequest {
  P_NIDPAYROLL: any;

  constructor(datos: any) {
    this.P_NIDPAYROLL = datos.P_NIDPAYROLL || '';
  }
}

export interface GenerarFResponse {
  MSG: any;
}

export class AnularRequest {
  P_NIDPAYROLL: any;

  constructor(datos: any) {
    this.P_NIDPAYROLL = datos.P_NIDPAYROLL || '';
  }
}

export interface AnularResponse {
  MSG: any;
}

export class GroupRequest {
  P_NROPLANILLA: any;

  constructor(datos: any) {
    this.P_NROPLANILLA = datos.P_NROPLANILLA || '';
  }
}

export interface GroupResponse {
  COMPROBANTE: any;
  IMPORTE: any;
  entitie: [
    {
      COMPROBANTE: any;
      IMPORTE: any;
    }
  ];
}
