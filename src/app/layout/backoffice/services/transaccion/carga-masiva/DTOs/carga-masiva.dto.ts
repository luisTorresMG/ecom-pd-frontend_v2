export class DataCargaMasiva {
  cargaMasivaModelGroup: {
    cantidad: number;
    uso: string;
    clase: string;
    prima: number;
    montoComisionBroker: number;
    montoComisionGrossup: number;
    montoComisionIntermediario: number;
    montoComisionGrossupIntermediario: number;
  }[];
  cargaMasivaModelDetail: {
    id: string;
    idProcesoCarga: number;
    idProcesoPD: number;
    fechaInicio: string;
    fechaFin: string;
    factura: any;
    idTipoDocumento: number;
    tipoDocumento: number;
    nroDocumento: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    razonSocial: string;
    idDepartamento: number;
    departamento: string;
    idProvincia: number;
    provincia: string;
    idDistrito: number;
    distrito: string;
    direccion: string;
    correo: string;
    telefono: number;
    placa: string;
    idUso: number;
    idClase: number;
    idMarca: number;
    marca: string;
    idModelo: number;
    modelo: string;
    idVersion: number;
    version: string;
    asientos: number;
    serie: string;
    anio: number;
    indice: number;
    codigoCliente: any;
    idTarifario: string;
    tarifario: string;
    zipCodeInei: any;
    porcentajeComisionBroker: number;
    porcentajeComisionIntermediario: number;
    uso: string;
    clase: string;
    prima: number;
    numeroPoliza?: number;
    comprobante: any;
    montoComisionBroker: number;
    montoComisionGrossup: number;
    montoComisionIntermediario: number;
    montoComisionGrossupIntermediario: number;
  }[];
  cargaMasivaModelError: {
    indice: number;
    campo: string;
    descripcion: string;
  }[];
  success: boolean;
  secuencia: number;
}
export class SearchCargaMasivaDto {
  success: boolean;
  cargaMasivaDetail: {
    idProceso: number;
    fechaProceso: string;
    cantidadContratantes: number;
    cantidadRegistro: number;
    primaTotal: number;
    facturado?: any;
    comprobante?: any;
    estadoZip?: string;
    usuario: string;
    estado: string;
    factura: string;
    canal: string;
    puntoVenta: string;
  }[];
}
export class SearchCargaMasivaHisDto {
  success: boolean;
  cargaMasivaDetail: {
    idEstado: string;
    fechaRegistro: string;
    usuario: string;
  }[];
}
