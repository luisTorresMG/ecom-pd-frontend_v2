export class DocumentRequest {
  type: number;
  documentNumber: string;

  constructor(payload: DocumentRequest) {
    this.type = payload?.type;
    this.documentNumber = payload?.documentNumber;
  }
}
export class DocumentResponse {
  p_NPERSON_TYP: string;
  p_NDOCUMENT_TYP: string;
  p_SDOCUMENT: string;
  p_SLEGALNAME: string;
  p_SCLIENT_NAME: string;
  p_SCLIENT_APPPAT: string;
  p_SCLIENT_APPMAT: string;
  p_NPROVINCE: string;
  p_NLOCAT: string;
  p_NMUNICIPALITY: string;
  p_SADDRESS: string;
  p_SBAJAMAIL_IND: string;
  p_SMAIL: string;
  p_SPHONE: string;
  p_SCLIENT: string;
  p_DBIRTHDAT: string;
  p_SSEXCLIEN: string;
  p_SISCLIENT_GBD: string;
  p_SISCLIENT_IND: string;
  p_NCIVILSTA: string;
  p_NTITLE: string;
  p_NNATIONALITY: string;
  historicoSCTR: string;

  constructor(payload: DocumentResponse) {
    this.p_NPERSON_TYP = payload?.p_NPERSON_TYP;
    this.p_NDOCUMENT_TYP = payload?.p_NDOCUMENT_TYP;
    this.p_SDOCUMENT = payload?.p_SDOCUMENT;
    this.p_SLEGALNAME = payload?.p_SLEGALNAME;
    this.p_SCLIENT_NAME = payload?.p_SCLIENT_NAME;
    this.p_SCLIENT_APPPAT = payload?.p_SCLIENT_APPPAT;
    this.p_SCLIENT_APPMAT = payload?.p_SCLIENT_APPMAT;
    this.p_NPROVINCE = payload?.p_NPROVINCE;
    this.p_NLOCAT = payload?.p_NLOCAT;
    this.p_NMUNICIPALITY = payload?.p_NMUNICIPALITY;
    this.p_SADDRESS = payload?.p_SADDRESS;
    this.p_SBAJAMAIL_IND = payload?.p_SBAJAMAIL_IND;
    this.p_SMAIL = payload?.p_SMAIL;
    this.p_SPHONE = payload?.p_SPHONE;
    this.p_SCLIENT = payload?.p_SCLIENT;
    this.p_DBIRTHDAT = payload?.p_DBIRTHDAT;
    this.p_SSEXCLIEN = payload?.p_SSEXCLIEN;
    this.p_SISCLIENT_GBD = payload?.p_SISCLIENT_GBD;
    this.p_SISCLIENT_IND = payload?.p_SISCLIENT_IND;
    this.p_NCIVILSTA = payload?.p_NCIVILSTA;
    this.p_NTITLE = payload?.p_NTITLE;
    this.p_NNATIONALITY = payload?.p_NNATIONALITY;
    this.historicoSCTR = payload?.historicoSCTR;
  }
}
export class DocumentFormatResponse {
  success: boolean;
  returnBirthDate: boolean;
  documentType: number;
  documentNumber: string;
  completeNames: string;
  names: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nationality: number;
  department: number;
  province: number;
  district: number;
  address: string;
  email: string;
  phone: number;
  birthDate: string;
  sex: number;
  avatar: string;
  civilStatus: number;

  constructor(payload?: any) {
    this.success = payload?.success ? payload.success : false;
    this.returnBirthDate = !!payload?.p_DBIRTHDAT;
    this.documentType = payload?.p_NDOCUMENT_TYP
      ? Number(payload.p_NDOCUMENT_TYP)
      : null;
    this.documentNumber = payload?.p_SDOCUMENT ? payload.p_SDOCUMENT : null;
    this.completeNames = payload?.p_SLEGALNAME ? payload.p_SLEGALNAME : null;
    this.names = payload?.p_SCLIENT_NAME ? payload.p_SCLIENT_NAME : null;
    this.apellidoPaterno = payload?.p_SCLIENT_APPPAT
      ? payload.p_SCLIENT_APPPAT
      : null;
    this.apellidoMaterno = payload?.p_SCLIENT_APPMAT
      ? payload.p_SCLIENT_APPMAT
      : null;
    this.nationality =
      +payload?.p_NDOCUMENT_TYP == 2 ? 1 : +payload?.p_NNATIONALITY || null;
    this.department = +payload?.p_NPROVINCE || null;
    this.province = +payload?.p_NLOCAT || null;
    this.district = +payload?.p_NMUNICIPALITY || null;
    this.address = payload?.p_SADDRESS ? payload.p_SADDRESS : null;
    this.email = payload?.p_SMAIL ? payload.p_SMAIL : null;
    this.phone = payload?.p_SPHONE ? Number(payload.p_SPHONE) : null;
    this.birthDate = payload?.p_DBIRTHDAT ? payload.p_DBIRTHDAT : null;
    this.sex = payload?.p_SSEXCLIEN ? Number(payload.p_SSEXCLIEN) : null;
    this.civilStatus = +payload?.p_NCIVILSTA ?? null;
    this.avatar = payload?.p_SFOTO || null;
  }
}
