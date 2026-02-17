export interface Item {
  id: string;
  name: string;
}

export interface ChannelType {
  id: number;
  name: string;
}

export interface Branch {
  branchId: number;
  name: string;
  products: Product[];
  detailSubChannel: string;
  associatedChannel: string;
}

export interface Product {
  idRamo: string;
  ramo: string;
  idProducto: string;
  producto: string;
}

export interface SaveProductRequest {
  crearCanal: ChannelInfo[];
}

export interface ChannelInfo {
  idRamo: string;
  idProducto: string;
  codigoCanal: string;
  numeroDocumento: string;
  codigoUsuario: string;
}

export interface SaveCreditLineRequest {
  certificateType: string;
  minStock: string;
  maxStock: string;
  currentStock: string;
  userId: string;
  documentNumber: string;
}

export interface BasicData {
  documentType: string;
  documentNumber: string;
  legalName: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  department: string;
  province: string;
  district: string;
  address: string;
  contact: string;
  phoneNumber: string;
  channelType: string;
  associatedChannel: string;
  email: string;
}

export interface SupplementaryData {
  startValidity: string;
  endValidity: string;
  stockProvider: string;
  distributionType: string;
}

export interface SaveRequest {
  requestType: string;
  userId: string;
  basicData: BasicData;
  supplementaryData: SupplementaryData;
}

export interface FileInfo {
  url: string;
  fileType: number;
  file?: File;
  fileName?: string;
}

export interface UpdateAssociatedChannelRequest {
  numeroDocumento: string;
  codigoCanalAsociado: number;
  subCanal: string;
  codigoCanalEditado: string;
}

export interface RequestInfo {
  startValidity: Date;
  endValidity: Date;
  distributionType: number;
  channelId: string;
  department: number;
  province: number;
  district: number;
  stockProvider: number;
  channelType: number;
  documentType: number;
  address: string;
  legalName: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  contact: string;
  email: string;
  documentNumber: string;
  phoneNumber: string;
}
