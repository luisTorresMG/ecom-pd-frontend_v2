export class EndososDto {
  poliza: {
    nCertificado: string;
    comprobante: string;
    iniVigencia: string;
    finVigencia: string;
    fechaEmision: string;
    horaEmision: string;
  };
  vehiculo: {
    placa: string;
    marca: string;
    version: string;
    clase: string;
    uso: string;
    nAsientos: string;
    anio: string;
    serie: string;
  };
  contratante: {
    tipoDocumento: string;
    nDocumento: string;
    concatDocumento?: string;
    tipoContratante?: string;
    apePaterno?: string;
    apeMaterno?: string;
    nombres?: string;
    razonSocial?: string;
    direccion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    email: string;
    telefono: string;
  };
}
