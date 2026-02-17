export interface IRecipient {
  nombres: string;
  correo: string;
  telefono: string;
  contratante: string;
  canalVenta: string;
  tipo: '1' | '2';
}

export interface IGetRecipientsResponse {
  success: boolean;
  message: string;
  listaCorreos: IRecipient[];
}

export interface ICreateRecipientResponse {
  success: boolean;
  message: string;
  correoCreado: string;
}

export interface IUpdateRecipientResponse {
  success: boolean;
  message: string;
  correoActualizado: string;
}

export interface IDeleteRecipientResponse {
  success: boolean;
  message: string;
  correoEliminado: string;
}

export interface IDeleteRecipientRequest {
  correo: string;
}

export interface ISalesChannelAndContractor {
  contratante: string;
  canalVenta: string;
}

export interface ISalesChannelsAndContractorsResponse {
  success: boolean;
  message: string;
  listaCanalVenta: ISalesChannelAndContractor[];
}


