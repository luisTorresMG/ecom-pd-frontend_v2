export interface IPasarelaRequest {
  idTarifario: string;
  idProcess: number;
  mail: string;
  nombreCliente: string;
  nombreAsesor: string;
  asegurado: string;
  nroDocumento: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
  fechaInicio: string;
  fechaFin: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  monedaDescripcion: string;
  monedaSimbolo: string;
  cantidadAnios: number;
  capital: number;
  primaInicial: number;
  primaMensual: number;
  primaAnual: number;
  primaRetorno: number;
  primaFallecimiento: number;
  porcentajeDevolucion: number;
  frecuencia: number;
  idFrecuencia: string;
  descPrima: number;
  descPrimaMensual: number;
  contratante: {
    nombre: string;
    nrodocumento: string;
    fechanacimiento: string;
    correo: string;
  };
}
