export class UserDocumentResponse {
  processId: number;
  clientTypeId: number;
  documentType: number;
  documentNumber: string;
  name: string;
  lastname: string;
  surname: string;
  department: number;
  province: number;
  district: number;
  address: string;
  email: string;
  phoneNumber: string;
  clientId: string;
  birthdate: string;
  sex: string;

  constructor({
    idProcess,
    idTipoPersona,
    idTipoDocumento,
    numeroDocumento,
    razonSocial,
    nombreCliente,
    apellidoPaterno,
    apellidoMaterno,
    idDepartamento,
    idProvincia,
    idDistrito,
    direccion,
    email,
    telefono,
    codigoCliente,
    fechaNacimiento,
    idSexo,
  }) {
    this.processId = idProcess;
    this.clientTypeId = idTipoPersona;
    this.documentType = idTipoDocumento;
    this.documentNumber = numeroDocumento;
    this.name = nombreCliente ?? razonSocial;
    this.lastname = apellidoPaterno;
    this.surname = apellidoMaterno;
    this.department = idDepartamento;
    this.province = idProvincia;
    this.district = idDistrito;
    this.address = direccion;
    this.email = email;
    this.phoneNumber = telefono;
    this.clientId = codigoCliente;
    this.birthdate = fechaNacimiento;
    this.sex = idSexo;
  }
}
