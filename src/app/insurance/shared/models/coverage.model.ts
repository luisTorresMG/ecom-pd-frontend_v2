export class CoverageDto {
  id: string;
  descripcion: string;
  sumaAsegurada: string;
  capital: string;
  capitalMinima: string;
  capitalMaxima: string;
  capitalPropuesto: string;
  capitalAutorizado: string;
  obligatoria: boolean;
  cobertura: string;
  sumaAseguradaCubierta: string;
  required: boolean;
  horas: string;
  limite: string;
  edadEntrada: {
    minima: string;
    maxima: string;
    base: any;
  };
  edadPermanencia: {
    minima: string;
    maxima: string;
    base: any;
  };
  selected?: boolean;

  constructor(payload: CoverageDto) {
    this.id = payload.id;
    this.descripcion = payload.descripcion;
    this.sumaAsegurada = payload.sumaAsegurada;
    this.capital = payload.capital;
    this.capitalMinima = payload.capitalMinima;
    this.capitalMaxima = payload.capitalMaxima;
    this.capitalPropuesto = payload.capitalPropuesto;
    this.capitalAutorizado = payload.capitalAutorizado;
    this.obligatoria = Number(payload.obligatoria) === 1;
    this.cobertura = payload.cobertura;
    this.sumaAseguradaCubierta = payload.sumaAseguradaCubierta;
    this.horas = payload.horas;
    this.limite = payload.limite;
    this.edadEntrada = payload.edadEntrada;
    this.edadPermanencia = payload.edadPermanencia;
    this.required = payload.required;
    this.selected = payload?.selected ? payload.selected : false;
  }
}

export class CoverageResponse {
  id: string;
  descripcion: string;

  constructor(payload: CoverageResponse) {
    this.id = payload.id;
    this.descripcion = payload.descripcion;
  }
}
