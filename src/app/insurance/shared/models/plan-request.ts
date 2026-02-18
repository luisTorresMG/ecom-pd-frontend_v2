import moment from 'moment';

export class PlanRequest {
  // idProcess: number;
  ////////////////////////////////////
  idProducto: number;
  idTipoPoliza: number;
  idModalidad: number;
  ////////////////////////////////////
  // fecha: string;
  ////////////////////////////////////
  fechaInicio: string;
  fechaFin: string;
  IdTipoPeriodo: number;
  idFrecuenciaPago: number;
  idActividad: number;
  idMoneda: number;
  cantidadTrabajadores: number;
  idZona: number;
  idZonaRiesgo: number;
  idTemporalidad: number;
  idAlcance: number;
  ////////////////////////////////////
  // idTipoRenovacion: number;
  ////////////////////////////////////

  mina: {
    idDepartamentoMina: null;
    departamentoMina: string;
    aplicaMina: boolean;
  };

  riesgo: {
    IdDepartamentoEmpresa: string;
    idZona: string;
  };

  viaje: {
    idPaisOrigen: string;
    paisOrigen: string;
    idPaisDestino: string;
    paisDestino: string;
    idDepartamentoOrigen: string;
    idDepartamentoDestino: string;
  };

  siniestralidad: {
    aplicaSiniestralidad: boolean;
    montoSiniestralidad: number;
    montoDeducible: number;
  };

  constructor({
    processId,
    productId,
    idTipoPoliza,
    validityType,
    paymentFrequency,
    activity,
    idMoneda,
    cantidadTrabajadores,
    startValidity,
    endValidity,
    country,
    idZone,
    idZonaRiesgo,
    department,
    temporality,
    scope,
    mina,
    riesgo,
    viaje,
    siniestralidad,
  }) {
    // this.idProcess = processId;
    this.idProducto = productId;
    this.idTipoPoliza = idTipoPoliza;
    this.idModalidad = this.modality;
    // this.fecha = moment().format('DD/MM/YYYY').toString();
    // this.idTipoRenovacion = validityType;
    this.idFrecuenciaPago = paymentFrequency;
    this.idActividad = activity;
    this.idMoneda = idMoneda;
    this.cantidadTrabajadores = cantidadTrabajadores || 1;
    /*
    this.fechaInicio = moment(new Date(startValidity), 'YYYY-MM-DD')
      .format('DD/MM/YYYY')
      .toString();
    */
    this.fechaInicio = moment(startValidity).format('DD/MM/YYYY');
    this.fechaFin = endValidity;
    this.IdTipoPeriodo = paymentFrequency;
    this.idTemporalidad = 24; // temporality;
    this.idAlcance = scope;
    this.mina = mina;
    this.riesgo = riesgo;
    this.viaje = viaje;
    this.siniestralidad = siniestralidad;
    switch (+this.insurance.productId) {
      case 3:
      case 7:
        if (+this.insurance.idZone !== 1) {
          this.idZona = 2;
          this.idZonaRiesgo = idZone;
        } else {
          this.idZona = 1;
          this.idZonaRiesgo = idZonaRiesgo || department;
        }
        break;
      case 4:
      case 8:
        if (+this.insurance.idZone !== 1) {
          this.idZona = 2;
          this.idZonaRiesgo = this.insurance.idPaisDestino;
        } else {
          this.idZona = 1;
          this.idZonaRiesgo = this.insurance.idDepartamentoDestino;
        }
        break;
      case 6:
        this.idZona = 1;
        this.idZonaRiesgo = this.insurance.idZonaRiesgo;
        break;
      default:
        this.idZona = country;
        this.idZonaRiesgo = department;
        break;
    }
  }
  get modality(): number {
    const mod = sessionStorage.getItem('modalidad');
    if (mod === 'true') {
      return 2;
    } else {
      return 1;
    }
  }
  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }
}
