export class StatusPolicy {
  PRO_MASTER: {
    SITEM: number;
    SDECRIPTION: string;
  }[];
}
export class CanalVentaDto {
  PRO_POLICY: {
    NIDPOLICY: number;
    SCLIENAME: string;
  }[];
}
export class PuntoVentaDto {
  PRO_SALE_POINT: {
    NNUMPOINT: number;
    SDESCRIPT: string;
  }[];
}
export class TipoCertificadosDto {
  PRO_MASTER: {
    SITEM: string;
    SDECRIPTION: string;
  }[];
}

export class PolizasDataDto {
  ROWTOTAL: number;
  entities: {
    NIDREQUEST: number;
    SPOLICY: string;
    SSALEPOINT: string;
    NREQUESTEDAMOUNT: number;
    NAMOUNTCOVERED: number;
    NQUANTITYAMOUNT: number;
    NNUMLOT: number;
    SCERTIFICATE: string;
    SSTATUS: string;
    NPOLINI: number;
    NPOLFIN: number;
    NUSERREGISTER: number;
    NIDPOLICY: number;
    NNUMPOINT: number;
    NTYPECERTIF: number;
    DREGISTER: string;
    ROWNUMBER: number;
    ROWTOTAL: number;
    STATUS: number;
    TAG?: any;
  }[];
  STATUS: number;
}
export class ValidateRequestDto {
  PA_VAL_REQUEST: {
    P_QUANTITYFREE: number;
    P_RESULT: number;
  };
}
export class NuevaSolicitud {
  PA_INS_REQUEST: {
    P_ASUNTO?: any;
    P_RQ: number;
    P_SEMAIL?: any;
    P_SEMAIL_FATHER?: any;
    P_TITULO?: any;
    SEMAILSCC?: any;
    STRBODYMESSAGE?: any;
  };
}
export class LoteRango {
  PRO_SEL_RANGE: {
    P_NPOLINI_L: number;
    P_NPOLFIN_L: number;
    P_TOTAL: number;
  };
}
export class GrabarLoteDto {
  DREGISTER?: any;
  NAMOUNTCOVERED: number;
  NIDPOLICY: number;
  NIDPOLICY_EDIT?: any;
  NIDREQUEST: number;
  NNUMLOT: number;
  NNUMPOINT: number;
  NNUMPOINT_EDIT?: any;
  NPOLFIN?: any;
  NPOLINI: number;
  NQUANTITYAMOUNT: number;
  NREQUESTEDAMOUNT: number;
  NTYPECERTIF: number;
  NTYPECERTIF_EDIT?: any;
  NUSERREGISTER: number;
  SCERTIFICATE: string;
  SPOLICY: string;
  SSALEPOINT: string;
  SSTATUS: string;
  boundindex: string;
  uid: string;
  uniqueid: string;
  visibleindex: number;
}
export class ValidatePolesPDto {
  PA_VAL_POLESP: {
    P_COUNT: number;
  };
}
export class RangoValDto {
  PRO_SEL_RANGE: {
    P_NPOLFIN_L: number;
    P_NPOLINI_L: number;
    P_TOTAL: number;
  };
}
export class ValidateRejectionMasiveDto {
  REQUEST: string;
  STATUS: number;
}
export class UpdateRequestMasive {
  NSTATUS: number;
}
export class InsertAssignDto {
  NSTATUS: number;
}
