export class MigrationRequest {
  ce: string;
  day: number;
  month: number;
  year: number;

  constructor(payload: MigrationRequest) {
    this.ce = payload.ce;
    this.day = payload.day;
    this.month = payload.month;
    this.year = payload.year;
  }
}

export class MigrationResponse {
  success: boolean;
  mensaje: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  nacionalidad: string;

  constructor(payload: MigrationResponse) {
    this.success = payload.success;
    this.mensaje = payload.mensaje;
    this.apellidoPaterno = payload.apellidoPaterno;
    this.apellidoMaterno = payload.apellidoMaterno;
    this.nombre = payload.nombre;
    this.nacionalidad = payload.nacionalidad;
  }
}
