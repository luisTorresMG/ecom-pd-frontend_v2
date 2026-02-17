import { Request, RequestDetail } from '../interfaces/request.interface';

export class RequestModel {
  idRamo: number;
  idProducto: number;
  codigoCanal: number;
  placa: string;
  idEstado: number;
  idUsuario: number;
  comentarios: string;
  solicitud: RequestDetailModel[];
  adjuntos: { idTipoDocumento: number };
  file: File;

  constructor(payload: Request) {
    this.idRamo = payload.branchId;
    this.idProducto = payload.productId;
    this.codigoCanal = payload.channelCode;
    this.placa = payload.plate;
    this.idEstado = payload.stateId;
    this.idUsuario = payload.userId;
    this.solicitud = payload.requestDetail.map((item: RequestDetail): RequestDetailModel => ({
      campo: item.field,
      solicitado: item.required,
      vigente: item.current
    }));
    this.adjuntos = {
      idTipoDocumento: payload.attachments.documentType
    };
    this.file = payload.file;
  }
}

export class RequestDetailModel {
  campo: string;
  vigente: string;
  solicitado: string;
}
