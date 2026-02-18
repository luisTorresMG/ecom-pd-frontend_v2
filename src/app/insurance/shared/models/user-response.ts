export class UserResponse {
  name: string;
  lastname: string;
  surname: string;
  address: string;
  phoneNumber: string;
  legalName: string;
  department: string;
  province: string;
  location: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  fechaNac: string;
  avatar?: string;
  tipoCliente?: string;

  constructor(payload) {
    this.name = payload.p_SCLIENT_NAME ?? payload.p_SLEGALNAME;
    this.lastname = payload.p_SCLIENT_APPPAT;
    this.surname = payload.p_SCLIENT_APPMAT;
    this.address = payload.p_SADDRESS;
    this.phoneNumber = payload.p_SPHONE;
    this.legalName = payload.p_SLEGALNAME;
    this.department = payload.p_NPROVINCE;
    this.province = payload.p_NLOCAT;
    this.location = payload.p_NMUNICIPALITY;
    this.nacionalidad = payload.p_NNATIONALITY;
    this.email = payload.p_SMAIL;
    this.telefono = payload.p_SPHONE;
    this.fechaNac = payload.p_DBIRTHDAT;
    this.avatar = payload.p_SFOTO;
    this.tipoCliente = payload.p_STIPOCLIENTE;
  }
}
