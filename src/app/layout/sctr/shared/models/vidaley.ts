import { Contratante } from '../../../client/shared/models/contratante.model';

export interface Vidaley {
  idProcess?: number;
  ruc: number | string;
  email: string;
  terms: boolean;
  userInfo?: Contratante;
  businessName?: string;
  address?: string;
  department?: number;
  province?: number;
  district?: number;
  phoneNumber?: string;
  userId?: number;
  term?: number;
  startValidity?: string;
  endValidity?: string;
  activity?: number;
  subactivity?: number;
  totalWorkers?: number;
  totalAmount?: number;
  amount?: number;
  insurance?: boolean;
  rate?: number;
  termDescription?: string;
  activityDescription?: string;
  subActivityDescription?: string;
  errorFrame?: boolean;
  errorText?: any[];
  plan?: string;
  idCotizacion?: string;
  privacy?: boolean;
  lock?: boolean;

  lastName: string;
  surname: string;
  name: string;

  healthAmount: number;
  allowanceAmount: number;
  healthRate: number;
  allowanceRate: number;
  riskAddress: string;
  riskDepartment: number;
  riskProvince: number;
  riskDistrict: number;
  insuranceType: number;
  isHealthMinimumPremium?: boolean;
  healthMinimumPremium?: number;
  isRiskMinimumPremium?: boolean;
  riskMinimumPremium?: number;
  sede?: string;

  historic?: any;
  documentType?: number;
  userType?: number;
  lastStep?: number;
  renovation?: string;

  policy?: string;
  idProcessHistorico?: number;
  emitido?: number;
  canalventa?: string;
  puntoventa?: string;

  showEmployeeForm?: boolean;
}

export function getUserParams(payload: Vidaley) {
  let legalName = payload.businessName;

  const getUserType = () => {
    let userType = '1';

    if (`${payload.ruc}`.substr(0, 2) === '20') {
      userType = '2';
    }

    return userType;
  };

  if (getUserType() === '1') {
    legalName = `${payload.lastName} ${payload.surname} ${payload.name}`;
  }

  return {
    idProcess: payload.idProcess,
    idUsuario: 3822,
    CodigoCanal: payload.canalventa, // environment.canaldeventadefault,
    CodigoPuntoDeVenta: payload.puntoventa, // environment.puntodeventadefault,
    idTipoPersona: getUserType(),
    idTipoDocumento: 1,
    numeroDocumento: payload.ruc,
    razonSocial: legalName,
    nombreCliente: payload.name,
    apellidoPaterno: payload.lastName,
    apellidoMaterno: payload.surname,
    idDistrito: payload.district,
    idDepartamento: payload.department,
    idProvincia: payload.province,
    direccion: payload.address,
    email: payload.email,
    telefono: payload.phoneNumber,
    generaComprobante: 0,
    contratanteVidaLey: null,
    AceptaTerminos: payload.terms,
    AceptaPrivacidad: payload.privacy,
  };
}

export function getQuoteParams(payload: Vidaley) {
  return {
    IdProcess: payload.idProcess,
    IdTipoPeriodo: payload.term,
    InicioVigencia: payload.startValidity,
    FinVigencia: payload.endValidity,
    IdActividad: payload.activity,
    IdSubActividad: payload.subactivity,
    CantidadTrabajadores: payload.totalWorkers,
    MontoPlanilla: payload.totalAmount,
    IdUsuario: 3822,
    IdUbigeo: payload.riskDistrict,
    Direccion: payload.riskAddress,
  };
}

export function buildUserFromJSON(payload: any): Vidaley {
  return {
    userType: payload.tipoPersona,
    lastName: payload.apellidoPaterno,
    surname: payload.apellidoMaterno,
    email: payload.email,
    name: payload.nombre,
    businessName: payload.razonSocial,
    ruc: payload.numeroDocumento,
    phoneNumber: payload.telefono,
    documentType: payload.tipoDocumento,
    userId: payload.codigoCliente,
    address: payload.direccion,
    department: payload.idDepartamento,
    province: payload.idProvincia,
    district: payload.idDistrito,

    term: payload.idTipoPeriodo || null,
    termDescription: payload.tipoPeriodo || null,
    startValidity: payload.inicioVigencia,
    endValidity: payload.finVigencia,

    activity: payload.idActividad || null,
    activityDescription: payload.actividad || null,
    subactivity: payload.idSubActividad || null,
    subActivityDescription: payload.subActividad || null,

    totalWorkers: payload.cantidadTrabajadores || null,
    totalAmount: payload.montoPlanilla || null,

    idProcess: payload.emitido === 1 ? 0 : payload.idProcesoCarga,
    idProcessHistorico: payload.idProcesoCarga,
    emitido: payload.emitido,

    lastStep: payload.ultimoPaso,
    terms: true,
    amount: payload.primaTotal,
    idCotizacion: payload.idCotizacion,
    insurance: payload.asegurable,

    healthAmount: null,
    allowanceAmount: null,
    healthRate: null,
    allowanceRate: null,
    riskAddress: null,
    riskDepartment: null,
    riskProvince: null,
    riskDistrict: null,
    insuranceType: null,
    isHealthMinimumPremium: false,
    healthMinimumPremium: 0,
    isRiskMinimumPremium: false,
    riskMinimumPremium: 0,
  };
}
