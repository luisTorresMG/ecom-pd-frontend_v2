import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Cliente } from '../../../layout/broker/models/cliente/cliente';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class VisaService {
  endpoint = 'pago';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private api: ApiService) {}

  generarSessionToken(
    idProcess,
    amount,
    canal,
    puntoventa,
    flujo,
    ramo,
    producto
  ) {
    const action = 'GenerateVisaSecurityToken';
    const url = `${this.endpoint}/${action}`;

    const data = {
      Amount: amount,
      IdProcess: idProcess,
      Canal: canal,
      PuntoVenta: puntoventa,
      Flujo: flujo,
      Ramo: ramo,
      Producto: producto,
    };
    return this.api.postHeader(url, data, this.headers);
  }

  generarSessionTokenGeneric(idProcess, amount, canal, puntoventa, flujo) {
    const action = 'visa/token';
    const url = `${this.endpoint}/${action}`;

    const data = {
      Amount: amount,
      IdProcess: idProcess,
      Canal: canal,
      PuntoVenta: puntoventa,
      Flujo: flujo,
    };
    return this.api.postHeader(url, data, this.headers);
  }

  autorizarTransaccion(
    transactionToken,
    sessionToken,
    processId,
    planillaId,
    flujoId,
    userId,
    cliente: Cliente
  ) {
    const action = 'payrollauthorization';
    const url = `${this.endpoint}/${action}`;
    const merchantId =
      sessionStorage.getItem('merchantIdSession') == null
        ? ''
        : sessionStorage.getItem('merchantIdSession');
    let RAMO = sessionStorage.getItem('P_NBRANCH');
    let PRODUCTO = sessionStorage.getItem('P_NPRODUCT');
    if (!RAMO) {
      RAMO = '0';
    }
    if (!PRODUCTO) {
      PRODUCTO = '0';
    }
    const data = {
      TransactionToken: transactionToken,
      SessionToken: sessionToken,
      ProcesoId: processId,
      PlanillaId: planillaId,
      FlujoId: flujoId,
      UserId: userId,
      idRamo: RAMO,
      idProducto: PRODUCTO,
      // PDF Information
      Pdf_Email: cliente == null ? '' : cliente.p_SMAIL,
      Pdf_CustomerName:
        cliente == null
          ? ''
          : cliente.p_SCLIENT_NAME +
            ' ' +
            cliente.p_SCLIENT_APPPAT +
            ' ' +
            cliente.p_SCLIENT_APPMAT,
      Pdf_PhoneNumber: cliente == null ? '' : cliente.p_SPHONE,
      Pdf_Canal: cliente == null ? '' : cliente.p_SCANAL,
      MerchantId: merchantId,
    };

    return this.api.post(url, data);
  }
}
