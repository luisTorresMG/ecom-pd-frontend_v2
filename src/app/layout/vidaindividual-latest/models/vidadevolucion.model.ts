import { AgesDto } from './ages.model';
import { BeneficiarioDto } from './beneficiario.model';

export class VidaDevolucionModel {
  idProcess: number;
  isResumen: boolean;
  idFlujo: number;
  idTipoPersona: number;
  codigoUsuario: string;
  canalVenta: string;
  puntoVenta: string;
  contratante: {
    tipoDocumento: string,
    numeroDocumento: string,
    fechaNacimiento: string,
    fechaNacimientoReturnOfApi: boolean,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    nombreCompleto: string,
    nacionalidad: {
      id: number,
      description: string
    },
    departamento: {
      id: number,
      description: string
    },
    provincia: {
      id: number,
      description: string
    },
    distrito: {
      id: number,
      description: string
    },
    direccion: string,
    sexo: number,
    correo: string,
    celular: string,
    ocupacion: number,
    estadoCivil: number,
    terminos: boolean,
    privacidad: string,
    contraSegurado: boolean,
    obligacionesFiscales: string
  };
  plan: {
    terminos: boolean;
    beneficiarioLegal: boolean,
    beneficiarios: Array<BeneficiarioDto>,
    anios: number,
    moneda: number,
    capital: number,
    porcentajeRetorno: number,
    primaAnual: number,
    primaFallecimiento: number,
    primaInicial: number,
    primaMensual: number,
    primaRetorno: number,
    idPlan: number,
    fechaInicioVigencia: string,
    fechaFinVigencia: string
  };
  dps: {
    cancer: string,
    covid: string,
    deporte: string,
    diagnostico_covid: string,
    fuma: string,
    fuma_resp: string,
    gastro: string,
    hospitalizacion_covid: string,
    hospitalizacion_covid_resp: string,
    infarto: string,
    peso: string,
    presion: string,
    presion_resp: string,
    talla: string,
    viaja: string
  };
  tarifario: {
    isFamPep: boolean,
    isIdNumber: boolean,
    isIdNumberFamPep: boolean,
    isOtherList: boolean,
    isPep: boolean,
    rateAges: Array<AgesDto>
    saltarExperian: boolean,
    saltarIdecon: boolean,
    saltarWorldCheck: boolean
  };
  cumulus: {
    nCountPolicy: number,
    nCumulusAvailable: number,
    nTc: number,
    sExceedsCumulus: string,
  };
  constructor(payload?: VidaDevolucionModel) {
    this.idProcess = payload?.idProcess || 0;
    this.isResumen = payload?.isResumen || false;
    this.idFlujo = 1;
    this.idTipoPersona = 1;
    this.codigoUsuario = payload?.codigoUsuario || null;
    this.canalVenta = payload?.canalVenta || null;
    this.puntoVenta = payload?.puntoVenta || null;
    this.contratante = {
      tipoDocumento: payload?.contratante?.tipoDocumento || '2',
      numeroDocumento: payload?.contratante?.numeroDocumento || null,
      fechaNacimiento: payload?.contratante?.fechaNacimiento || null,
      fechaNacimientoReturnOfApi: payload?.contratante?.fechaNacimientoReturnOfApi || false,
      nombres: payload?.contratante?.nombres || null,
      apellidoMaterno: payload?.contratante?.apellidoMaterno || null,
      apellidoPaterno: payload?.contratante?.apellidoPaterno || null,
      nombreCompleto: (!payload?.contratante?.nombres &&
        !payload?.contratante?.apellidoPaterno &&
        !payload?.contratante?.apellidoMaterno) ?
        null : `${payload?.contratante?.nombres} ${payload?.contratante?.apellidoPaterno} ${payload?.contratante?.apellidoMaterno}`,
      nacionalidad: payload?.contratante?.nacionalidad || null,
      departamento: payload?.contratante?.departamento || null,
      provincia: payload?.contratante?.provincia || null,
      distrito: payload?.contratante?.distrito || null,
      direccion: payload?.contratante?.direccion || null,
      sexo: Number(payload?.contratante?.sexo) || null,
      correo: payload?.contratante?.correo || null,
      celular: payload?.contratante?.celular?.toString() || null,
      ocupacion: Number(payload?.contratante?.ocupacion) || null,
      estadoCivil: Number(payload?.contratante?.estadoCivil) || null,
      terminos: payload?.contratante?.terminos || false,
      contraSegurado: payload?.contratante?.contraSegurado || true,
      privacidad: payload?.contratante?.privacidad || '0',
      obligacionesFiscales: payload?.contratante?.obligacionesFiscales || null,
    } || null;
    this.plan = {
      anios: Number(payload?.plan?.anios) || null,
      beneficiarioLegal: payload?.plan?.beneficiarioLegal || null,
      beneficiarios: !!payload?.plan?.beneficiarios?.length ? payload.plan.beneficiarios : [],
      capital: Number(payload?.plan?.capital) || null,
      moneda: Number(payload?.plan?.moneda) || null,
      idPlan: Number(payload?.plan?.idPlan) || null,
      porcentajeRetorno: Number(payload?.plan?.porcentajeRetorno) || null,
      primaAnual: Number(payload?.plan?.primaAnual) || null,
      primaFallecimiento: Number(payload?.plan?.primaFallecimiento) || null,
      primaInicial: Number(payload?.plan?.primaInicial) || null,
      primaMensual: Number(payload?.plan?.primaMensual) || null,
      primaRetorno: Number(payload?.plan?.primaRetorno) || null,
      fechaInicioVigencia: payload?.plan?.fechaInicioVigencia || null,
      fechaFinVigencia: payload?.plan?.fechaFinVigencia || null,
      terminos: payload?.plan?.terminos || false
    } || null;
    this.dps = {
      cancer: payload?.dps?.cancer || null,
      covid: payload?.dps?.covid || null,
      deporte: payload?.dps?.deporte || null,
      diagnostico_covid: payload?.dps?.diagnostico_covid || null,
      fuma: payload?.dps?.fuma || null,
      fuma_resp: payload?.dps?.fuma_resp || null,
      gastro: payload?.dps?.gastro || null,
      hospitalizacion_covid: payload?.dps?.hospitalizacion_covid || null,
      hospitalizacion_covid_resp: payload?.dps?.hospitalizacion_covid_resp || null,
      infarto: payload?.dps?.infarto || null,
      peso: payload?.dps?.peso || null,
      presion: payload?.dps?.presion || null,
      presion_resp: payload?.dps?.presion_resp || null,
      talla: payload?.dps?.talla || null,
      viaja: payload?.dps?.viaja || null,
    } || null;
    this.tarifario = {
      isFamPep: payload?.tarifario?.isFamPep || null,
      isIdNumber: payload?.tarifario?.isIdNumber || null,
      isIdNumberFamPep: payload?.tarifario?.isIdNumberFamPep || null,
      isOtherList: payload?.tarifario?.isOtherList || null,
      isPep: payload?.tarifario?.isPep || null,
      rateAges: payload?.tarifario?.rateAges?.length ? payload.tarifario.rateAges : null,
      saltarExperian: payload?.tarifario?.saltarExperian || false,
      saltarIdecon: payload?.tarifario?.saltarIdecon || false,
      saltarWorldCheck: payload?.tarifario?.saltarWorldCheck || false,
    } || null;
    this.cumulus = {
      nCountPolicy: Number(payload?.cumulus?.nCountPolicy) || null,
      nCumulusAvailable: Number(payload?.cumulus?.nCumulusAvailable) || null,
      nTc: Number(payload?.cumulus?.nTc) || null,
      sExceedsCumulus: payload?.cumulus?.sExceedsCumulus,
    } || null;
  }
}
