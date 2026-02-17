export class BeneficiarioModel {
  id: string;
  tipoDocumento: number;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo: string;
  fechaNacimiento: string;
  nacionalidad: number;
  departamento: number;
  provincia: number;
  distrito: number;
  direccion: string;
  porcentajeParticipacion: number;
  correo: string;
  numeroCelular: number;

  constructor(payload?: BeneficiarioModel) {
    this.id = payload?.tipoDocumento && payload?.numeroDocumento ? payload.tipoDocumento + payload.numeroDocumento : null;
    this.tipoDocumento = payload?.tipoDocumento ? payload.tipoDocumento : null;
    this.numeroDocumento = payload?.numeroDocumento ? payload.numeroDocumento : null;
    this.apellidoPaterno = payload?.apellidoPaterno ? payload.apellidoPaterno : null;
    this.nombres = payload?.nombres ? payload.nombres : null;
    this.sexo = payload?.sexo ? payload.sexo : null;
    this.fechaNacimiento = payload?.fechaNacimiento ? payload.fechaNacimiento : null;
    this.nacionalidad = payload?.nacionalidad ? payload.nacionalidad : null;
    this.departamento = payload?.departamento ? payload.departamento : null;
    this.provincia = payload?.provincia ? payload.provincia : null;
    this.distrito = payload?.distrito ? payload.distrito : null;
    this.direccion = payload?.direccion ? payload.direccion : null;
    this.porcentajeParticipacion = payload?.porcentajeParticipacion ? payload.porcentajeParticipacion : null;
    this.correo = payload?.correo ? payload.correo : null;
    this.numeroCelular = payload?.numeroCelular ? payload.numeroCelular : null;
  }
}
