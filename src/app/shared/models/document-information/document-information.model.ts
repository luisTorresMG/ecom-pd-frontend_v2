export class DocumentInformationModel {
  success: boolean;
  message: string;

  clientCode: string;
  clientType: string;
  id: string;

  domicileCondition: string;
  contractorStatus: string;

  isProspect: boolean;
  isState: boolean;
  promotions: boolean;

  personType: number;
  documentType: number;
  documentNumber: string;

  legalName: string;

  clienteAnulado: boolean;
  polizasAnuladas: number;
  clienteEstado: boolean;

  names: string;
  apePat: string;
  apeMat: string;

  birthdate: string;
  returnBirthdate: boolean;
  image: string;

  nationality: number;
  department: number;
  province: number;
  district: number;

  email: string;
  phoneNumber: number;

  civilStatus: number;
  title: string;

  address: string;
  sex: number;
  idSeguridad: string;

  constructor(payload?: any) {
    this.clienteAnulado = payload.clienteAnulado;
    this.clienteEstado = payload.clienteEstado;

    const locationCodeExcludes = [3, 33];

    this.success = payload?.success || false;
    this.message = payload?.message || null;

    this.clientCode = payload?.codigoCliente || null;
    this.clientType = payload?.tipoCliente || null;
    this.domicileCondition = (
      (payload?.condicionDomicilio || '') as string
    ).toUpperCase();
    this.contractorStatus = (
      (payload?.estadoContratante || '') as string
    ).toUpperCase();

    this.isProspect = payload?.clienteProspecto || false;
    this.isState = payload?.clienteEstado || false;
    this.promotions = payload?.promociones || false;

    this.personType = +payload?.idTipoPersona || null;
    this.documentType = +payload?.idTipoDocumento || null;
    this.documentNumber = payload?.numeroDocumento || null;

    this.legalName =
      +payload?.idTipoDocumento == 1 ? payload?.razonSocial || null : null;

    this.names = payload?.nombre || null;
    this.apePat = payload?.apellidoPaterno || null;
    this.apeMat = payload?.apellidoMaterno || null;

    this.image = payload?.imagen || null;
    // tslint:disable-next-line:max-line-length
    this.birthdate = payload?.fechaNacimiento || null;
    this.returnBirthdate = !!payload?.fechaNacimiento;

    this.nationality =
      +payload?.idTipoDocumento == 2 ? 1 : +payload?.nacionalidad || null;

    this.department = +payload?.departamento || null;
    this.province = +payload?.provincia || null;
    this.district = +payload?.distrito || null;

    const locations = [this.department, this.province, this.district];
    // if (locations.every((x) => x == this.department)) {
    //   this.department = null;
    //   this.province = null;
    //   this.district = null;
    // }

    this.address = payload?.direccion || null;

    this.email = payload?.email || null;
    this.phoneNumber = +payload?.telefono || null;

    this.civilStatus = +payload?.estadoCivil || null;
    this.title = payload?.titulo || null;
    this.sex = +payload?.sexo || null;
    this.idSeguridad = payload?.idSeguridad || null;
    this.polizasAnuladas = payload?.polizasAnuladas || null;
  }
}

export class DocumentInfoResponseModel {
  success: boolean;
  message: string;
  clientCode: string;
  clientType: string;
  domicileCondition: string;
  contractorStatus: string;
  isProspect: boolean;
  isState: boolean;
  promotions: boolean;
  personType: number;
  documentType: number;
  documentNumber: string;
  legalName: string;
  clienteAnulado: boolean;
  clienteEstado: boolean;
  names: string;
  apePat: string;
  apeMat: string;
  birthdate: string;
  returnBirthdate: boolean;
  image: string;
  nationality: number;
  department: number;
  province: number;
  district: number;
  email: string;
  phoneNumber: number;
  civilStatus: number;
  title: string;
  address: string;
  sex: number;
  idSeguridad: string;
  id: string;
  polizasAnuladas: number;
  underAge: boolean;
  approvedClient: boolean;

  constructor(payload?: any) {
    this.clienteAnulado = payload?.ClienteAnulado || false;
    this.clienteEstado = payload?.ClienteEstado || false;

    const locationCodeExcludes = [3, 33];

    this.success = payload?.Success || false;
    this.message = payload?.Message || null;

    this.clientCode = payload?.CodigoCliente || null;
    this.clientType = payload?.TipoCliente || null;
    this.domicileCondition = (
      (payload?.CondicionDomicilio || '') as string
    ).toUpperCase();
    this.contractorStatus = (
      (payload?.EstadoContratante || '') as string
    ).toUpperCase();
    this.isProspect = payload?.ClienteProspecto || false;
    this.isState = payload?.ClienteEstado || false;
    this.promotions = payload?.Promociones || false;
    this.personType = +payload?.IdTipoPersona || null;
    this.documentType = +payload?.IdTipoDocumento || null;
    this.documentNumber = payload?.NumeroDocumento || null;
    this.legalName =
      +payload?.IdTipoDocumento == 1 ? payload?.RazonSocial || null : null;
    this.names = payload?.Nombre || null;
    this.apePat = payload?.ApellidoPaterno || null;
    this.apeMat = payload?.ApellidoMaterno || null;

    this.image = payload?.Imagen || null;
    this.birthdate = payload?.FechaNacimiento || null;
    this.returnBirthdate = !!payload?.FechaNacimiento;

    this.nationality =
      +payload?.IdTipoDocumento == 2 ? 1 : +payload?.Nacionalidad || null;

    this.department = +payload?.Departamento || null;
    this.province = +payload?.Provincia || null;
    this.district = +payload?.Distrito || null;

    const locations = [this.department, this.province, this.district];
    if (locations.every((x) => x == this.department)) {
      this.department = null;
      this.province = null;
      this.district = null;
    }

    this.address = payload?.Direccion || null;

    this.email = payload?.Email || null;
    this.phoneNumber = +payload?.Telefono || null;

    this.civilStatus = +payload?.EstadoCivil || null;
    this.title = payload?.Titulo || null;
    this.sex = +payload?.Sexo || null;
    this.idSeguridad = payload?.IdSeguridad || null;
    this.id = payload?.Id || null;
    this.polizasAnuladas= payload?.PolizasAnuladas || 0;
    this.underAge = payload?.MenorEdad || false;
    this.approvedClient = payload?.ClienteHomologado || false;
  }
}
