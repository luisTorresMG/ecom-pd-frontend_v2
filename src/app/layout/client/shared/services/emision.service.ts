import { Facturacion } from './../models/facturacion.model';
import { Comprobante } from './../models/comprobante.model';
import { Anulacion } from './../../../broker/models/historial/anulacion';
import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { Contratante } from '../models/contratante.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { isNullOrUndefined } from 'util';
import { PdfDigitalReenvio } from '../../../broker/models/historial/pdfdigitalreenvio';
import { MigrationRequest, MigrationResponse } from '../models/migration.model';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';
import { Response } from '@shared/interfaces/response.interface';
import { RequestModel } from '@root/layout/client/shared/models/request.model';
import { Request } from '@root/layout/client/shared/interfaces/request.interface';

@Injectable()
export class EmisionService {
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  private readonly apiUrl: string = AppConfig.WSPD_API;
  private readonly apiUrlPD: string = AppConfig.PD_API;

  constructor(private api: ApiService, private http: HttpClient) {}

  obtenerTarifa(filter: any) {
    const endpoint = 'emission';
    const action = 'obtenerprima';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(filter);

    return this.api.postHeader(url, data, this.headers);
  }

  obtenerPlanes(filter: any) {
    const endpoint = 'emission';
    const action = 'obtenerplanes';
    const url = `${endpoint}/${action}`;

    const data = JSON.stringify(filter);
    // console.log('obtenerPlanes-->' +  data);
    return this.api.postHeader(url, data, this.headers);
  }

  registrarEmision(IdProceso) {
    const endpoint = 'emissionproc';
    const action = 'EmissionProcessPolicy';
    const url = `${endpoint}/${action}`;

    const data = {
      NIDPROCESS: IdProceso,
    };

    return this.api.postHeader(url, data, this.headers);
  }

  processValidatePoliza(IdProceso) {
    const endpoint = 'emissionproc';
    const action = 'EmissionProcessValidatePolicy';
    const url = `${endpoint}/${action}`;

    const data = {
      NIDPROCESS: IdProceso,
    };

    return this.api.postHeader(url, data, this.headers);
  }

  emissionProcessCompletePolicy(
    transactionToken,
    sessionToken,
    processId,
    planillaId,
    flujoId,
    userId,
    tipoPago,
    nombres,
    apellidos,
    correo,
    total,
    cliente: Contratante,
    canal,
    puntoDeVenta,
    modalidad
  ) {
    const endpoint = 'emissionproc';
    const action = 'emissionprocesscompletepolicy';
    const url = `${endpoint}/${action}`;
    // const oSisweb = new Sisweb();

    let customerName = '';
    customerName = cliente.p_SCLIENT_NAME;
    if (cliente.p_NPERSON_TYP === '1') {
      customerName =
        cliente.p_SCLIENT_NAME +
        ' ' +
        cliente.p_SCLIENT_APPPAT.trim() +
        ' ' +
        cliente.p_SCLIENT_APPMAT.trim();
    } else if (cliente.p_NPERSON_TYP === '2') {
      customerName = cliente.p_SLEGALNAME;
    }

    const data = {
      TransactionToken: transactionToken,
      SessionToken: sessionToken,
      ProcesoId: processId,
      PlanillaId: planillaId,
      FlujoId: flujoId,
      UserId: userId,
      TipoPago: tipoPago,
      Nombres: nombres,
      Apellidos: apellidos,
      Correo: correo,
      Total: total,
      // PDF Information ---------------------
      Pdf_Email: cliente.p_SMAIL,
      Pdf_CustomerName: customerName,
      Pdf_PhoneNumber: cliente.p_SPHONE,
      CodigoCanal: canal,
      CodigoPuntoDeVenta: puntoDeVenta,
      Modalidad: modalidad,
      ChannelCode: sessionStorage.getItem('referenteCode'),
      ProcessName: 'CL',
    };
    return this.api.post(url, data);
  }

  emission(payload: any): Observable<any> {
    const url = `${this.apiUrl}/soat/emision`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  generarPolizaDigitalPdf(numeroPoliza: number) {
    const endpoint = 'Certificado';
    const action = 'GetConstanciaPDF';
    const url = `${endpoint}/${action}/${numeroPoliza}`;
    return this.api.get(url, {
      responseType: 'text',
    });
  }

  generarVoucherDigitalPdf(auth: any) {
    const producto = isNullOrUndefined(auth.producto) ? '' : auth.producto;

    const body = {
      email: auth.email,
      phoneNumber: auth.phoneNumber,
      customerName: auth.customerName,
      transactionDateTime:
        auth.transactionDateTime + ' ' + auth.fullDate.substr(-5),
      aprobado: auth.aprobado,
      authorizedAmount: auth.authorizedAmount,
      cardNumber: auth.cardNumber,
      orderNumber: auth.orderNumber,
      description: auth.description,
      quantity: 1,
      id: auth.id,
      producto: producto,
    };

    const endpoint = 'EmissionProc';
    const action = 'DownloadCustomerPdf';
    const url = `${endpoint}/${action}`;
    return this.api.post(url, body, this.headers);
  }

  anulacionPoliza(anulacion: Anulacion) {
    const endpoint = 'emission';
    const action = 'anular';
    const url = `${endpoint}/${action}`;
    return this.api.post(url, anulacion, this.headers);
  }

  generarPolizaPdf(numeroPoliza: number) {
    const endpoint = 'emissionproc';
    const action = 'GetPolicyPdf';
    const url = `${endpoint}/${action}/${numeroPoliza}`;
    return this.api.get(url);
  }

  autoPorPlaca(placa: string) {
    const endpoint = 'emission';
    const action = 'auto';
    const url = `${endpoint}/${action}/${placa}`;

    return this.api.get(url);
  }

  clientePorDocumento(tipo: string, numero: string) {
    const endpoint = 'vidaindividual';
    const action = 'cliente';
    const url = `${endpoint}/${action}/${tipo}/${numero}`;

    return this.api.get(url);
  }

  dataMigration(data: MigrationRequest): Observable<MigrationResponse> {
    const url = `VidaIndividual/cliente/migracion/${data.ce}/${data.day}/${data.month}/${data.year}`;
    return this.api.get(url);
  }

  validarDocumentoCampaign(codchannel: string, tipo: string, numero: string) {
    const action = 'validardocumentocampaign';
    const endpoint = 'emission';
    const url = `${endpoint}/${action}/${codchannel}/${tipo}/${numero}`;

    return this.api.get(url);
  }

  informacionVentas() {
    const endpoint = 'emission';
    const action = 'bloqueoventas';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  informacionVentasCanal(canal: string) {
    const endpoint = 'emission';
    const action = 'bloqueoventas';
    const url = `${endpoint}/${action}/${canal}`;
    return this.api.get(url);
  }

  registrarTracking(IdProceso, IdCliente, Prima) {
    const endpoint = 'tracking';
    const action = 'registertracking';
    const url = `${endpoint}/${action}`;
    const data = {
      NIDPROCESS: IdProceso,
      NPREMIUM: Prima,
      NCLIENTID: IdCliente,
    };
    return this.api.post(url, data, this.headers);
  }

  registrarEvento(Comentario, Codigo) {
    const endpoint = 'tracking';
    const action = 'registerevent';
    const url = `${endpoint}/${action}`;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const IdUsuario = currentUser['id'];
    const data = {
      IdUsuario,
      Comentario,
      Codigo,
    };
    return this.api.post(url, data, this.headers);
  }

  obtenerTarifarios(filter: any) {
    const endpoint = 'emission';
    const action = 'obtenertarifarios';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(filter);
    return this.api.postHeader(url, data, this.headers);
  }

  validarComprobante(comprobante: Comprobante): any {
    const endpoint = 'emission';
    const action = 'validarCDR';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(comprobante);
    return this.api.postHeader(url, data, this.headers);
  }

  facturar(facturacion: Facturacion): any {
    const endpoint = 'emissionproc';
    const action = 'facturar';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(facturacion);
    return this.api.postHeader(url, data, this.headers);
  }

  notificar(notificar: any): any {
    const endpoint = 'comprobante';
    const action = 'notificar';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(notificar);
    return this.api.postHeader(url, data, this.headers);
  }

  generarReporteEnvio() {
    const endpoint = 'comprobante';
    const action = 'reporteenvios';
    const url = `${endpoint}/${action}`;
    return this.api.get(url, {
      responseType: 'text',
    });
  }

  descargarComprobante(data: Comprobante[]): any {
    const url = `${this.apiUrlPD}/Comprobante/descargar`;
    return this.http.post(url, data).pipe(map((response: any) => response.comprobantes[0]));
  }

  saveRequest(payload: Request): Observable<Response<undefined>> {
    const request: RequestModel = new RequestModel({ ...payload });
    delete request.file;

    const fd: FormData = new FormData();
    fd.set('solicitud', JSON.stringify(request));
    fd.set('archivo', payload.file);

    const url: string = `${this.apiUrl}/solicitud/registrar`;
    return this.http.post(url, fd).pipe(map((response: any) => response.data));
  }

  getChannelConfiguration(channel: string): Observable<{
    listadoClases: any[];
    listadoUsos: any[];
    listadoTipoDocumentos: any[];
    success: boolean;
  }> {
    const url: string = `${this.apiUrl}/canal/configuracion/${channel}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
