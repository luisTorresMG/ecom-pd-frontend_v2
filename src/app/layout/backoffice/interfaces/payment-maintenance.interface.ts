export interface IPaymentEnabledRequest {
    idAplicacion: string;
    idRamo: string;
    idProducto: string;
    codigoCanal: string;
    indice: number;
    cantidadRegistros: string;
  }
  
  export interface IPaymentEnabledResponse {
    idAplicacion: string;
    aplicacion: string;
    idRamo: string;
    ramo: string;
    idProducto: string;
    producto: string;
    codigoCanal: string;
    canal: string;
    pasarelaNiubiz: string;
    pagoEfectivo: string;
    pasarelaKushki: string;
    cashKushki: string;
    smartlinkKuhski: string;
    yapeNiubiz: string;
    indice: string;
    cantidadRegistros: string;
  }
  
  export interface IItemHistory {
    aplicacion: string;
    ramo: string;
    producto: string;
    canal: string;
    pasarelaNiubiz: string;
    pagoEfectivo: string;
    pasarelaKushki: string;
    cashKushki: string;
    smartlinkKushki: string;
    yapeNiubiz: string;
    usuario: string;
    fechaRegistro: string;
  }
  
  export interface IHistoryRequest {
    idAplicacion: string;
    idRamo: string;
    idProducto: string;
    codigoCanal: string;
  }
  
  export interface IItemProduct {
    description: string;
    id: number;
    userType: number;
  }
  
  export interface IItemApplication {
    aplicacion: string;
    idAplicacion: string;
  }
  
  export interface IItemChannel {
    nusercode: number;
    nchannel: number;
    sdescript: string;
    ntypechannel: string;
    stypechannel: string;
  }
  
  export interface IItemBranch {
    description: string;
    id: number;
    userType: number;
  }
  
  export interface IValueFormEdit {
    cardNiubiz: string;
    cashPayment: string;
    cardKushki: string;
    cashKushki: string;
    transferKushki: string;
    yapeNiubiz: string;
  }
  
  export interface IUpdatePayment {
    idAplicacion: string;
    idRamo: string;
    idProducto: string;
    codigoCanal: string;
    pasarelaNiubiz: string;
    pagoEfectivo: string;
    pasarelaKushki: string;
    cashKushki: string;
    smartLinkKushki: string;
    yapeNiubiz: string;
    idUsuario: string;
  }
  