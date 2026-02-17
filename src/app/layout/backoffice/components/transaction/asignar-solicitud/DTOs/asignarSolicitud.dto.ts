export class AsignarSolicitudDto {
  nSolicitud: string;
  canalVenta: string;
  puntoVenta: string;
  cantSolicitada: string;
  cantAtendida: string;
  canAcumulada: string;
  nLote: string;
  estado: string;
  fechaRegistro: string;
}
export class DatosLoteDto {
  nLote: string;
  canalVenta: string;
  puntoVenta: string;
  nSolicitud: string;
  tipo: string;
  cantidad: string;
  desde: string;
  hasta: string;
}

export class PuntoVentaDto {
  P_NPOLICYS?: number;
  P_NUSER?: number;
}

export class CanalVentaDto {
  P_NPOLICYS?: number;
  P_NUSER?: number;
}
export class PolizasDataDto {
  filterscount: number;
  groupscount: number;
  pagenum: number;
  pagesize: number;
  recordstartindex: number;
  recordendindex: number;
  P_NIDREQUEST: number;
  P_SCLIENAME: string;
  P_NPOLICYS: number;
  P_NSALEPOINTS: number;
  P_NSTATUS: number;
  P_DFCREABEGIN: string;
  P_DFCREAEND: string;
  P_NCODUSER: number;
  _: number;
}
export class NuevaSolicitudDto {
  P_NIDPOLICY: number;
  P_NNUMPOINT: number;
  P_NUSERREGISTER: number;
  P_NPRODUCT: number;
  P_NQUANTITY: number;
  P_IDREQUEST?: number;
}
export class ValidateRequestDto {
  P_NIDREQUEST: number;
  P_NPOLICY: number;
  P_NNUMPOINT: number;
  P_AMOUNT: number;
  P_NTIPPOL: number;
}
export class UpdateRequestMasive {
  P_NIREQUEST: number;
  P_NUSERREGISTER: number;
  P_NSTATE: number;
}
export class LoteDataDto {
  SPOLICY: string;
  P_NIDPOLICY: number;
  SSALEPOINT: string;
  P_NNUMPOINT: number;
  NIDREQUEST: number;
  NNUMLOT: number;
  P_NTIPPOL: number;
  SCERTIFICATE: string;
  NQUANTITYAMOUNT?: number;
  NPOLINI?: number;
  NPOLFIN?: number;
}
export class LoteRangoDto {
  P_NPRODUCT: number;
  P_QUANTITY: number;
  P_USER: number;
  P_IDREQUEST?: number;
}
export class CantidadAsignadaDto {
  P_IDREQUEST: number;
}
export class GrabarLoteDto {
  P_NIDPOLICY: number;
  P_NPOLINI: number;
  P_NPOLFIN: number;
  P_NUSERREGISTER: number;
  P_NTIPPOL: number;
  P_IDREQUEST: number;
  P_NNUMPOINT: number;
  P_NQUANTITY: number;
  P_NAMOUNTCOVERED: number;
  P_NPRODUCT: number;
}
export class ValidatePolesPDto {
  P_USER: number;
  P_NPRODUCT: number;
  P_NPOLESP_INI: number;
}
export class RangeValDto {
  P_QUANTITY: number;
  P_NPRODUCT: number;
  P_INI: number;
  P_FIN: number;
  P_USER: number;
}
