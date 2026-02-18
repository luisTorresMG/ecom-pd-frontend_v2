import moment from 'moment';

const getUserType = (documentNumber) => {
  let userType = 1;

  if (`${documentNumber}`.substr(0, 2) === '20') {
    userType = 2;
  }

  return userType;
};

export class UserDocumentRequest {
  idProcess: number;
  idFlujo: string;
  canalVenta: string;
  puntoVenta: string;
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  email: string;
  fechaNac: string;
  terminos: number;
  privacidad: number;
  idModalidad: string;
  idTipoPoliza: number;
  idProducto: number;
  codigoUsuario: number;
  idCategoria: number;
  idSesion?: string;

  constructor({
    processId = 0,
    flowType = '1',
    saleChannel,
    pointOfSale,
    documentType,
    documentNumber,
    email,
    fechaNac,
    terms,
    privacy,
    assistance,
    modeCode,
    idTipoPoliza,
    productId,
    userCode = 3822,
    categoryId,
    idSesion,
  }) {
    this.idProcess = processId;
    this.idFlujo = flowType;
    this.canalVenta = saleChannel;
    this.puntoVenta = pointOfSale;
    this.idTipoPersona = getUserType(documentNumber);
    this.idTipoDocumento = documentType;
    this.numeroDocumento = documentNumber;
    this.email = email;
    this.fechaNac = fechaNac
      ? moment(fechaNac, 'DD/MM/YYYY').format('DD/MM/YYYY').toString()
      : null;
    this.terminos = Number(terms);
    this.privacidad = Number(privacy);
    this.idModalidad = this.modality?.toString();
    this.idTipoPoliza = Number(idTipoPoliza);
    this.idProducto = productId;
    this.codigoUsuario = userCode;
    this.idCategoria = categoryId;
    this.idSesion = idSesion || 0;
  }
  get modality(): number {
    const mod = sessionStorage.getItem('modalidad');
    if (mod === 'true') {
      return 2;
    } else {
      return 1;
    }
  }
}
