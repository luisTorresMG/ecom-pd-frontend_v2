export interface IClienteRiesgoRequest {
    idRamo?: number;
    idProducto?: number;
    idProceso?: number;
    idTipoDocumento: number;
    numeroDocumento: string;
    primerApellido: string;
    nombres: string;
}

export interface IClienteRiesgoResponse {
    idecon: {
        isIdNumber: boolean;
        isPep: boolean;
        isFamPep: boolean;
        isIdNumberFamPep: boolean;
        isOtherList: boolean;
    };
    worldCheck: {
        isIdNumber: boolean;
        isPep: boolean;
        isFamPep: boolean;
        isIdNumberFamPep: boolean;
        isOtherList: boolean;
    };
    experian: {
        score: number;
        experianRisk: boolean;
    };
    success: boolean;
    message: string;
}

export interface INegativeRecordRequest {
  id: number,
  idRamo: number,
  idProducto: number,
  tipoDocumento: string,
  numeroDocumento: string,
  nombres: null,
  porcentaje: null
}
