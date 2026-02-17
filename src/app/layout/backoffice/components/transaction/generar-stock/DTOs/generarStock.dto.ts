export class GenerarRangoPolizaDto {
  P_NTIPPOL: number;
  P_NQUANTITY: number;
  P_NREGUSER: number;
}
export class GenerarPolizaDto {
  P_NTIPPOL: number;
  P_NQUANTITY: number;
  P_NREGUSER: number;
  P_NPOLES_INI: number;
  P_NPOLES_FIN: number;
}
export class PolizaDataWithParamDto {
  P_NTIPPOL: string;
  P_DFCREABEGIN: string;
  P_DFCREAEND: string;
}
export class ChangeStatusPoliza {
  P_NSTATUSPOL: number;
  P_NNUMREG: number;
}
