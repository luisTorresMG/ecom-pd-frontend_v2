export class TipoPolizaDto {
  Entity: {
    SITEM: string;
    SDECRIPTION: string;
  }[];
}
export class PolizaDto {
  ROWTOTAL: string;
  entities: {
    NNUMREG: string;
    D_FCREACION: string;
    S_PRODUCTO: string;
    NQUANTITY: string;
    N_ALMACENPROTECTA: string;
    N_ALMACENPROVEEDOR: string;
    S_ESTADO: string;
    D_FESTADO: string;
    NSTATUSPOL: string;
    ROWNUMBER: string;
    ROWTOTAL: string;
    STATUS: string;
    TAG: string;
  }[];
  STATUS: string;
}
export class GenerarRangoPolizaDto {
  Entity: {
    P_NTIPPOL: string;
    P_NQUANTITY: string;
    P_NREGUSER: string;
    NRESULTADO: string;
    NVRANGOINI: number;
    NVRANGOFIN: number;
    NNUMREG: string;
    ROWNUMBER: string;
    ROWTOTAL: string;
    STATUS: string;
    TAG: string;
  };
  STATUS: string;
}
export class ResPolizaDto {
  Entity: string;
  STATUS: string;
}
export class StatusPolizaDto {
  Entity: {
    NSTATUSPOL: number;
    SDESCRIPT: string;
    ROWNUMBER: string;
    ROWTOTAL: string;
    STATUS: string;
    TAG: string;
  }[];
  STATUS: string;
}
