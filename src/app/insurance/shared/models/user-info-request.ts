export class UserInfoRequest {
  idProcess: number;
  idTipoDocumento: string;
  numeroDocumento: string;
  codigoUsuario: number;
  razonSocial: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  idDepartamento: string;
  idProvincia: string;
  idDistrito: string;
  direccion: string;
  telefono: string;
  idNacionalidad: string;
  idSexo: string;
  fechaNacimiento: string;
  idEstadoCivil: number;
  correo: string;
  estadoSunat: {
    domicilio: string;
    estado: string;
  };
  representanteLegal: {
    idTipoDocumento: number;
    numeroDocumento: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };

  constructor({
    processId,
    documentType,
    documentNumber,
    userCode = 3822,
    legalName,
    name,
    lastname,
    surname,
    department,
    district,
    province,
    address,
    phoneNumber,
    country,
    sex,
    birthdate,
    fechaNac,
    civilStatus,
    legalRepresentative,
    tipoPoliza,
    condicionDomicilio,
    estadoContratante,
    email,
  }) {
    this.idProcess = processId;
    this.idTipoDocumento = documentType;
    this.numeroDocumento = documentNumber;
    this.codigoUsuario = userCode;
    this.razonSocial = null;
    this.nombres = name || null;
    this.apellidoPaterno = lastname || null;
    this.apellidoMaterno = surname || null;
    this.idDepartamento = department;
    this.idProvincia = province;
    this.idDistrito = district;
    this.direccion = address;
    this.telefono = phoneNumber;
    this.idNacionalidad = country || 1;
    this.idSexo = sex;
    this.idEstadoCivil = +(civilStatus ?? null);
    this.fechaNacimiento = birthdate || fechaNac || null;
    this.correo = email;
    this.representanteLegal = null;
    this.estadoSunat = {
      domicilio: condicionDomicilio || null,
      estado: estadoContratante || null,
    };

    if (tipoPoliza == 2) {
      this.representanteLegal = {
        idTipoDocumento: legalRepresentative.documentType,
        numeroDocumento: legalRepresentative.documentNumber,
        nombre: legalRepresentative.names,
        apellidoPaterno: legalRepresentative.lastName,
        apellidoMaterno: legalRepresentative.lastName2,
      };
    }

    if (this.session.documentType == 1) {
      this.razonSocial = name || null;
      this.nombres = null;
      this.apellidoPaterno = null;
      this.apellidoMaterno = null;
      this.idSexo = null;
      this.fechaNacimiento = null;
    }
  }

  get session(): any {
    return JSON.parse(sessionStorage.getItem('insurance'));
  }
}
