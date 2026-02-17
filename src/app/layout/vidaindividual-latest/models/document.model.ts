export class DocumentRequest {
  document?: DocumentDto;
  documentMigration?: DocumentMigrationsDto;
  constructor({
    dataDocument,
    dataDocumentMigration
  }) {
    this.document = dataDocument;
    this.documentMigration = dataDocumentMigration;
  }
}
export class DocumentDto {
  typeDoc: string;
  nDoc: string;
  constructor({
    typeDoc,
    nDoc
  }) {
    this.typeDoc = typeDoc;
    this.nDoc = nDoc;
  }
}
export class DocumentMigrationsDto {
  nDoc: string;
  dia: string;
  mes: string;
  year: string;
  constructor({
    nDoc,
    dia,
    mes,
    year
  }) {
    this.nDoc = nDoc;
    this.dia = dia;
    this.mes = mes;
    this.year = year;
  }
}
export class DocumentResponse {
  historicoSCTR: any;
  p_DBIRTHDAT: string;
  p_NDOCUMENT_TYP: string;
  p_NLOCAT: string;
  p_NMUNICIPALITY: string;
  p_NPERSON_TYP: string;
  p_NPROVINCE: string;
  p_SADDRESS: string;
  p_SCLIENT: string;
  p_SCLIENT_APPMAT: string;
  p_SCLIENT_APPPAT: string;
  p_SCLIENT_NAME: string;
  p_SDOCUMENT: string;
  p_SISCLIENT_GBD: string;
  p_SLEGALNAME: string;
  p_SMAIL: string;
  p_SPHONE: string;
  p_SSEXCLIEN: string;
  p_SFOTO?: string;
  constructor({
    historicoSCTR,
    p_DBIRTHDAT,
    p_NDOCUMENT_TYP,
    p_NLOCAT,
    p_NMUNICIPALITY,
    p_NPERSON_TYP,
    p_NPROVINCE,
    p_SADDRESS,
    p_SCLIENT,
    p_SCLIENT_APPMAT,
    p_SCLIENT_APPPAT,
    p_SCLIENT_NAME,
    p_SDOCUMENT,
    p_SISCLIENT_GBD,
    p_SLEGALNAME,
    p_SMAIL,
    p_SPHONE,
    p_SSEXCLIEN,
    p_SFOTO
  }) {
    this.historicoSCTR = historicoSCTR;
    this.p_DBIRTHDAT = p_DBIRTHDAT;
    this.p_NDOCUMENT_TYP = p_NDOCUMENT_TYP;
    this.p_NLOCAT = p_NLOCAT;
    this.p_NMUNICIPALITY = p_NMUNICIPALITY;
    this.p_NPERSON_TYP = p_NPERSON_TYP;
    this.p_NPROVINCE = p_NPROVINCE;
    this.p_SADDRESS = p_SADDRESS;
    this.p_SCLIENT = p_SCLIENT;
    this.p_SCLIENT_APPMAT = p_SCLIENT_APPMAT;
    this.p_SCLIENT_APPPAT = p_SCLIENT_APPPAT;
    this.p_SCLIENT_NAME = p_SCLIENT_NAME;
    this.p_SDOCUMENT = p_SDOCUMENT;
    this.p_SISCLIENT_GBD = p_SISCLIENT_GBD;
    this.p_SLEGALNAME = p_SLEGALNAME;
    this.p_SMAIL = p_SMAIL;
    this.p_SPHONE = p_SPHONE;
    this.p_SSEXCLIEN = p_SSEXCLIEN;
    this.p_SFOTO = p_SFOTO ?? '';
  }
}
export class DocumentMigrationsResponse {
  success: boolean;
  mensaje: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  nacionalidad: string;
  constructor({
    success,
    mensaje,
    apellidoPaterno,
    apellidoMaterno,
    nombre,
    nacionalidad
  }) {
    this.success = success;
    this.mensaje = mensaje;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.nombre = nombre;
    this.nacionalidad = nacionalidad;
  }
}
