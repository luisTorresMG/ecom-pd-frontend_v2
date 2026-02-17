import { ElementRef, Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ParametersResponse } from '../../models/ubigeo/parameters.model';
import {
  DocumentRequest,
  DocumentResponse,
} from '../../models/document/document.models';
import { IVisaTokenRequest } from '../../interfaces/visa-token.interface';
import { map, timeout } from 'rxjs/operators';
import { base64ToArrayBuffer } from '../../helpers/utils';

import * as FileSaver from 'file-saver';
import {
  ChannelSalesModel,
  PointSalesModel,
} from '../../models/channel-point-sales/channel-point-sale.model';
import {
  AutoParameterModel,
  AutoUseResponse,
} from '../../models/utils/utils.model';

import { Subscription } from 'rxjs';
import {
  IDocumentInfoGestionRequest,
  IDocumentInfoRequest,
  IDocumentInformationRequest,
} from '../../interfaces/document-information.interface';
import {
  IClienteRiesgoRequest,
  IClienteRiesgoResponse,
  INegativeRecordRequest,
} from '../../interfaces/cliente-riesgo.interface';
import {
  DocumentInformationModel,
  DocumentInfoResponseModel,
} from '../../models/document-information/document-information.model';
import { IExportExcel } from '../../interfaces/export-excel.interface';
import { Workbook, Worksheet } from 'exceljs';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { IVisaConfig } from '../../interfaces/visa-config.interface';

const crypto = require('crypto-js');

declare var VisanetCheckout: any;

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private apiUri: string;
  private apiBackoffice: string;
  private plataformaDigitalApi: string = AppConfig.PD_API;
  private apiURL2: string = AppConfig.WSPD_API;

  constructor(
    private readonly http: HttpClient,
    private readonly appConfig: AppConfig
  ) {
    this.apiUri = AppConfig.PD_API;
    this.apiBackoffice = AppConfig.BACKOFFICE_API;
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  get adminsBackoffice(): Array<number> {
    return [
      20, // Admin
      151, // Operaciones
      154, // Admin - Backoffice
      155, // Operaciones - Backoffice
      169, // Administrador - Backoffice
      174, // Administrador SOAT - Backoffice
      175, // Administrador Reportes - Backoffice
      176, // Técnicas y Operaciones - Backoffice
      177, // Auxiliar Operaciones
      183,
      184,
      185,
      186,
      187,
      188,
      150,
    ];
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get datepickerConfig(): Partial<BsDatepickerConfig> {
    return Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
  }

  getTerms(): Observable<{ sequence: string }> {
    const url = `${this.apiUri}/tool/GetTerms`;
    const call: any = this.http.get(url);
    const data$: Observable<{ sequence: string }> = new Observable((obs) => {
      call.subscribe(
        (res: { sequence: string }) => {
          localStorage.setItem('token', res.sequence);
          sessionStorage.setItem('authToken', res.sequence);
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  getTokeneEcommerce(): any {
    const url = `${this.apiUri}/tool`;
    return this.http
      .get(url)
      .pipe(map((response: any) => this.setTokenEcommerce(response)));
  }

  setTokenEcommerce(payload: any): any {
    if (!payload.sequence) {
      throw new Error('cannot set token');
    }
    const expDate = new Date().getTime() + 100000;
    const token = { token: payload.sequence, expDate };

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        ...currentUser,
        ...token,
      })
    );

    sessionStorage.setItem(
      'terms',
      JSON.stringify([
        payload.texto1,
        payload.texto2,
        payload.texto3,
        payload.texto4,
        payload.texto5,
      ])
    );

    return token;
  }

  getNewTerms(): Observable<{ sequence: string }> {
    const url = `${this.apiUri}/tool/vidaindividual/terms`;
    const call: any = this.http.get(url);
    const data$: Observable<{ sequence: string }> = new Observable((obs) => {
      call.subscribe(
        (res: { sequence: string }) => {
          localStorage.setItem('token', res.sequence);
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  generateVisaToken(data: IVisaTokenRequest) {
    const url = `${this.apiUri}/pago/visa/token`;
    const call: Observable<any> = this.http.post(url, data);
    const data$: Observable<any> = new Observable((obs) => {
      call.pipe(timeout(10000)).subscribe(
        (res: any) => {
          window['initDFP'](
            res.deviceFingerPrintId,
            res.purchaseNumber,
            res.clientIp,
            res.codigoComercio
          );
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  parameters(): Observable<ParametersResponse> {
    const url = `${this.apiUri}/VidaIndividual/parametros`;
    const call: Observable<any> = this.http.get(url);
    const data$: Observable<ParametersResponse> = new Observable((obs) => {
      call.subscribe(
        (res: ParametersResponse) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  documentData(data: DocumentRequest): Observable<DocumentResponse> {
    const url = `${this.apiUri}/vidaindividual/cliente/${data.type}/${data.documentNumber}`;
    const call: Observable<any> = this.http.get(url);
    const data$: Observable<DocumentResponse> = new Observable((obs) => {
      call.subscribe(
        (res: DocumentResponse[]) => {
          obs.next({
            ...res[0],
            p_NDOCUMENT_TYP: data.type.toString(),
            p_SDOCUMENT: data.documentNumber.toString(),
          });
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }

  channelSales(userId: number): Observable<ChannelSalesModel> {
    const url = `${this.apiUri}/ChannelSales`;
    const req = {
      data: btoa(
        JSON.stringify({
          nusercode: userId,
        })
      ),
    };
    const api = this.http.post(url, req);
    return api.pipe(
      map((res: any) => {
        const data = new ChannelSalesModel(res) as ChannelSalesModel;
        if (!this.adminsBackoffice.includes(this.currentUser.profileId)) {
          data.items = data.items.filter(
            (x) => x.id === this.currentUser.canal
          );
        }
        return data;
      })
    );
  }

  pointSales(idChannel: string): Observable<PointSalesModel> {
    // const url = `${this.apiBackoffice}/Assign/Assign/SalePointRead`;
    const url = `${this.apiUri}/ChannelPoint`;
    const data = {
      spolicy: idChannel,
      nnumpoint: this.currentUser.indpuntoVenta,
    };
    const req = {
      data: btoa(JSON.stringify(data)),
    };
    const api = this.http.post(url, req);
    return api.pipe(
      map((res: any) => new PointSalesModel(res) as PointSalesModel)
    );
  }

  callApiUrl(url: string): Observable<{ success: boolean; archivo: string }> {
    const urlApi = `${this.apiUri}/rentas/descarga`;
    const req = {
      url: url,
    };
    const api = this.http.post(urlApi, req);
    return api.pipe(map((res: { success: boolean; archivo: string }) => res));
  }

  downloadArchivo(response: { archivo: string; nombre: string }) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], {
        type: 'application/pdf',
      });
      FileSaver.saveAs(data, response.nombre);
    }
  }

  get onlyNumbers(): RegExp {
    return /^\d+$/;
  }

  get onlyLetters(): RegExp {
    return /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/;
  }

  get alphaNumeric(): RegExp {
    return /^[a-z0-9]+$/i;
  }

  get onlyEmail(): RegExp {
    return AppConfig.CUSTOM_MAIL_DOMAIN;
  }

  downloadFile(_: { fileName: any; fileBase64?: string; file?: ArrayBuffer }) {
    if (!_.fileBase64 && !_.file) {
      return;
    }

    const file = _.fileBase64 || this.arrayBufferToBase64(_.file);

    let extension = _.fileName.slice(
      _.fileName.lastIndexOf('.') + 1,
      _.fileName.length
    );
    extension = extension.toLocaleLowerCase();

    _.fileName = _.fileName.toLocaleLowerCase();

    const fileName = `${_.fileName
      .replaceAll(' ', '_')
      .slice(0, _.fileName.indexOf('.'))}_${new Date().getTime()}.${extension}`;
    const arrBuffer = this.base64ToArrayBuffer(file);
    const mymeType = this.getMymeType(extension);

    const data: Blob = new Blob([arrBuffer], { type: mymeType });
    FileSaver.saveAs(data, fileName?.toLocaleLowerCase());
  }

  arrayBufferToBase64(file: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(file);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const decode = atob(base64);
    let length = decode.length;
    const u8arr = new Uint8Array(length);

    while (length--) {
      u8arr[length] = decode.charCodeAt(length);
    }

    return u8arr.buffer;
  }

  base64ToFile({ base64, fileName }): File {
    const decode = atob(base64);
    let length = decode.length;
    const u8arr = new Uint8Array(length);

    while (length--) {
      u8arr[length] = decode.charCodeAt(length);
    }

    const ext = fileName.split('.').pop();

    return new File([u8arr], fileName, { type: this.getMymeType(ext) });
  }

  getMymeType(ext: string): string {
    switch (ext) {
      case 'txt':
        return 'text/plain';
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      default:
        return null;
    }
  }

  exportExcel(payload: IExportExcel): Promise<Buffer> {
    const isEmptyData: boolean = this.isValidObjectList(payload.data);

    if (isEmptyData) {
      return;
    }

    const workBook = new Workbook();
    this.setMedaDataForExportExcel(workBook);

    const workSheet = workBook.addWorksheet(payload.fileName);
    workSheet.addRow(undefined);

    this.setHeaderForExportExcel(workSheet, payload.data);
    this.setRowsBodyForExportExcel(workSheet, payload.data);
    return this.writeDataForExportExcel(workBook, payload.fileName);
  }

  private isValidObjectList(data: Array<any>): boolean {
    return !(Object.keys(data)[0] ?? []).length;
  }

  private get stylesItemBodyExcel(): {
    fill: any;
    font: any;
    alignment: any;
    border: any;
  } {
    return {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: 'F4F4F4',
        },
      },
      font: {
        size: 12,
        name: 'Calibri',
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
      },
      border: {
        top: {
          color: {
            argb: 'cccccc',
          },
          style: 'thin',
        },
        right: {
          color: {
            argb: 'cccccc',
          },
          style: 'thin',
        },
        bottom: {
          color: {
            argb: 'cccccc',
          },
          style: 'thin',
        },
        left: {
          color: {
            argb: 'cccccc',
          },
          style: 'thin',
        },
      },
    };
  }

  private get stylesItemHeaderExcel(): {
    fill: any;
    font: any;
    alignment: any;
    border: any;
  } {
    return {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '553d81',
        },
      },
      font: {
        size: 12,
        color: {
          argb: 'ffffff',
        },
        name: 'Calibri',
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
      },
      border: {
        bottom: {
          color: {
            argb: 'ffffff',
          },
          style: 'thick',
        },
        left: {
          color: {
            argb: 'ffffff',
          },
          style: 'thin',
        },
      },
    };
  }

  private setMedaDataForExportExcel(workBook: Workbook): void {
    workBook.creator = 'Protecta Security';
    workBook.category = 'Reporte';
    workBook.company = 'Protecta Security';
    workBook.created = new Date();
    workBook.modified = new Date();
  }

  private setHeaderForExportExcel(
    workSheet: Worksheet,
    data: Array<any>
  ): void {
    const keysFirstObject: Array<any> = Object.keys(data[0]);
    const columns = new Array();
    keysFirstObject.forEach((key: string) => {
      const width = Math.max.apply(
        Math,
        data.map((x: any) => (x[key] instanceof Date ? 13 : `${x[key]}`.length))
      );
      columns.push({
        header: key,
        key: key.replace(' ', '_'),
        width: (width > key.length ? width : key.length) + 3.5,
      });
    });

    workSheet.columns = columns;
    workSheet.getRow(1).eachCell((cell) => {
      cell.fill = this.stylesItemHeaderExcel.fill;
      cell.font = this.stylesItemHeaderExcel.font;
      cell.alignment = this.stylesItemHeaderExcel.alignment;
      cell.border = this.stylesItemHeaderExcel.border;
    });
  }

  private setRowsBodyForExportExcel(
    workSheet: Worksheet,
    data: Array<any>
  ): void {
    data.forEach((values: any) => {
      const keys = Object.keys(values);
      const array = new Array();

      keys.forEach((key: string) => {
        array.push(values[key]);
      });
      const row = workSheet.addRow(array);
      row.eachCell((cell) => {
        cell.fill = this.stylesItemBodyExcel.fill;
        cell.font = this.stylesItemBodyExcel.font;
        cell.border = this.stylesItemBodyExcel.border;
        cell.alignment = this.stylesItemBodyExcel.alignment;
      });
    });
  }

  private writeDataForExportExcel(
    workBook: Workbook,
    fileName: string
  ): Promise<any> {
    return workBook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
    });
  }

  getAutoBrands(req: any): Observable<Array<AutoParameterModel>> {
    const url = `${this.apiUri}/brand`;
    const payload = {
      data: btoa(JSON.stringify(req)),
    };
    return this.http
      .post(url, payload)
      .map((response: Array<any>) =>
        response.map((_) => new AutoParameterModel(_))
      );
  }

  getAutoModels(req: any): Observable<Array<AutoParameterModel>> {
    const payload = {
      data: btoa(
        JSON.stringify({
          nvehbrand: req.brandId,
          NCODCHANNEL: req.channelCode,
        })
      ),
    };
    const url = `${this.apiUri}/model/modelByBrand`;
    return this.http
      .post(url, payload)
      .map((response: Array<any>) =>
        response.map((_) => new AutoParameterModel(_))
      );
  }

  getAutoClass(_: any): Observable<Array<AutoParameterModel>> {
    const payload = {
      data: btoa(
        JSON.stringify({
          nvehbrand: _.brandId,
          NCODCHANNEL: _.channelCode,
          sdescript: _.desc,
        })
      ),
    };
    const url = `${this.apiUri}/Classe/classByModel`;
    return this.http
      .post(url, payload)
      .map((response: Array<any>) =>
        response.map((res) => new AutoParameterModel(res))
      );
  }

  getAutoUses(req: any): Observable<Array<AutoUseResponse>> {
    const payload = {
      data: btoa(
        JSON.stringify({
          nvehclass: req.classAuto,
          NCODCHANNEL: req.channelCode,
        })
      ),
    };
    const url = `${this.apiUri}/Use/getUsebyClase`;
    return this.http
      .post(url, payload)
      .map((response: Array<any>) =>
        response.map((_) => new AutoUseResponse(_))
      );
  }

  clienteInformation(data: any): Observable<any> {
    const url = `${this.apiUri}/ecommerce/cliente/informacion/${data.branchId}/1/1/${data.numerodocumento}`;
    const api = this.http.get(url);
    return api.pipe(map((response) => response));
  }

  utmTrancking(payload: any): Subscription {
    const url = `${this.apiUri}/Tracking/utm/register`;
    return this.http
      .post(url, payload)
      .map((response) => response)
      .subscribe();
  }

  findResource(payload: { name: string; path: string }): any {
    let host = window.location.hostname;
    const url = window.location.pathname;
    if (url.indexOf('/staging/') !== -1) {
      host = `../../../../staging/assets/${payload.path}`;
    } else if (url.indexOf('/ecommerce/') !== -1) {
      host = `../../../../ecommerce/assets/${payload.path}`;
    } else {
      host = `../../../../assets/${payload.path}`;
    }
    fetch(host)
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem(payload.name, data);
      });
  }

  fetchResource(uri, type: 'json' | 'arraybuffer' = 'json'): Observable<any> {
    const url = `${AppConfig.DOMAIN_URL}/${uri}`;
    const responseType: any = type;

    return this.http
      .get(url, { responseType: responseType })
      .pipe(map((response) => response));
  }

  getBranches(): Observable<any> {
    const url = `${this.apiUri}/Tool/getbranch`;
    const payload = {
      nid: 0,
      sdescript: '',
      typeuser: 0,
    };
    return this.http.post(url, { data: btoa(JSON.stringify(payload)) }).pipe(
      map((response: any) =>
        response.map((value: any) => ({
          id: +value.nid,
          description: (<string>value.sdescript)
            .toString()
            .trim()
            .toUpperCase(),
          userType: +value.typeuser,
        }))
      )
    );
  }

  getProducts(request: {
    branchId: number;
    userType: number;
  }): Observable<any> {
    const url = `${this.apiUri}/Tool/getproducts`;
    const payload = {
      nid: request.branchId || 0,
      sdescript: '',
      typeuser: request.userType,
    };
    return this.http.post(url, { data: btoa(JSON.stringify(payload)) }).pipe(
      map((response: any) =>
        response.map((value: any) => ({
          id: +value.nid,
          description: (<string>value.sdescript)
            .toString()
            .trim()
            .toUpperCase(),
          userType: +value.typeuser,
        }))
      )
    );
  }

  encryptStorage(payload: { name: string; data: any }): void {
    const encrypt = crypto.AES.encrypt(
      JSON.stringify(payload.data),
      AppConfig.SECRET_KEY
    ).toString();
    sessionStorage.setItem(payload.name, encrypt);
  }

  decryptStorage(name: string): any {
    const session = sessionStorage.getItem(name);
    if (!session) {
      return;
    }

    const decrypt = crypto.AES.decrypt(session, AppConfig.SECRET_KEY);
    const originalText = decrypt.toString(crypto.enc.Utf8);
    return JSON.parse(originalText);
  }

  getToken(time: number = 30): Observable<string> {
    const url = `${this.plataformaDigitalApi}/auth/token/${time}`;
    return this.http.get(url).pipe(map((response: any) => response.data.token));
  }

  documentInformation(
    payload: IDocumentInformationRequest
  ): Observable<DocumentInformationModel> {
    // const url = `${this.apiURL2}/cliente`;
    const url = `${this.apiURL2}/cliente`;

    return this.http.post(url, payload).pipe(
      map(
        (response: any) =>
          new DocumentInformationModel({
            ...response.data,
            idTipoDocumento: payload.idTipoDocumento,
            numeroDocumento: payload.numeroDocumento,
          }) as DocumentInformationModel
      )
    );
  }

  documentInfoResponse(
    payload: IDocumentInfoRequest
  ): Observable<DocumentInfoResponseModel> {
    const url = `${this.apiURL2}/cliente/informacion`;
    return this.http
      .post(url, payload)
      .pipe(
        map(
          (response: any) =>
            new DocumentInfoResponseModel(
              this.decryptClientInfo(response.data.message)
            )
        )
      );
  }

  documentInfoGestion(
    payload: IDocumentInfoGestionRequest
  ): Observable<DocumentInfoResponseModel> {
    const url = `${this.apiURL2}/cliente/gestion`;
    return this.http
      .post(url, payload)
      .pipe(
        map(
          (response: any) =>
            new DocumentInfoResponseModel(
              this.decryptClientInfo(response.data.message)
            )
        )
      );
  }

  documentInfoClientResponse(
    payload: IDocumentInfoRequest
  ): Observable<DocumentInfoResponseModel> {
    const url = `${this.apiURL2}/cliente/obtener-informacion`;
    const hashedToken = this.generateSHA256(payload.token);

    return this.http
      .post(url, payload)
      .pipe(
        map(
          (response: any) =>
            new DocumentInfoResponseModel(
              this.decryptClientInfo(response.Data?.Message, hashedToken)
            )
        )
      );
  }

  searchDocumentByNames(payload: any): Observable<any> {
    const url = `${this.apiURL2}/cliente/busqueda`;

    return this.http
      .post(url, payload)
      .pipe(
        map(
          (response: any) =>
            this.decryptClientInfo(response.data.message)?.ListaCliente360 ?? []
        )
      );
  }

  decryptClientInfo(data: any, hashedToken?: string): any {
    const encryptedJson = data;

    if (!encryptedJson) {
      return;
    }
    const [ivBase64, encryptedBase64] = encryptedJson.split(':');
    const iv = crypto.enc.Base64.parse(ivBase64);
    const encryptedBytes = crypto.enc.Base64.parse(encryptedBase64);
    
    let keyBytes = '';

    if (hashedToken) {
      keyBytes = crypto.enc.Hex.parse(hashedToken);
    } else {
      keyBytes = crypto.enc.Base64.parse(AppConfig.SECRET_KEY_APICLIENT);
    }

    const decryptedBytes = crypto.AES.decrypt(
      { ciphertext: encryptedBytes },
      keyBytes,
      { iv }
    );

    const decryptedJson = decryptedBytes.toString(crypto.enc.Utf8);

    return JSON.parse(decryptedJson);
  }

  generateSHA256(text: string): string {
    const hash = crypto.SHA256(text);
    return hash.toString(crypto.enc.Hex);
  }

  clienteRiesgo(
    payload: IClienteRiesgoRequest
  ): Observable<IClienteRiesgoResponse> {
    const url = `${this.apiURL2}/cliente/indicador/riesgo`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data as IClienteRiesgoResponse));
  }

  nuevoClienteRiesgo(
    payload: IClienteRiesgoRequest
  ): Observable<IClienteRiesgoResponse> {
    const url = `${this.apiURL2}/cliente/listas-negras/riesgo`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  clienteRiesgoExperian(
    payload: IClienteRiesgoRequest
  ): Observable<IClienteRiesgoResponse> {
    const url = `${this.apiURL2}/cliente/indicador/riesgo`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data as IClienteRiesgoResponse));
  }

  experianRisk(payload: IClienteRiesgoRequest): Observable<any> {
    const url = `${this.apiURL2}/cliente/experian`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  negativeRecord(payload: INegativeRecordRequest): Observable<any> {
    const url = `${this.apiURL2}/vidaDevolucion/validacionNegativa`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  private onlyText(text: string): string {
    return text.replace(/[^a-zA-Z ]/g, '');
  }

  getVisaConfig(payload: IVisaConfig): any {
    return {
      action: payload.action,
      method: 'POST',
      sessiontoken: payload.token,
      channel: payload.channel ?? 'paycard',
      merchantid: payload.merchantId,
      merchantlogo: AppConfig.LOGO_PROTECTA,
      formbuttoncolor: '#ED6E00',
      formbuttontext: payload.buttonText || 'Pagar',
      purchasenumber: payload.purchaseNumber,
      showamount: false,
      amount: payload.ammount,
      cardholdername: this.onlyText(payload.name),
      cardholderlastname: this.onlyText(payload.lastName),
      cardholderemail: payload.email,
      expirationminutes: '20',
      timeouturl: `${AppConfig.DOMAIN_URL}/visa/expired`,
      usertoken: null,
    };
  }

  openVisaCheckout(element: ElementRef, payload: IVisaConfig): void {
    delete window['VisanetCheckout'];
    this.appConfig.loadScriptSubscription(element).then(() => {
      const visaConfig = this.getVisaConfig(payload);
      VisanetCheckout.configure({
        ...visaConfig,
        complete: (params) => {},
      });
      VisanetCheckout.open();
      console.log(visaConfig);
    });
  }

  obtenerMetodoPago(data: any): Observable<any> {
    const url = `${this.apiURL2}/pago/tipo/obtener`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getClientID() {
    try {
      var cookie = this.getCookie('_ga').split('.');
      return cookie[2] + '.' + cookie[3];
    } catch (e) {
      console.log('No Universal Analytics cookie found');
    }
  }

  getCookie(name: any) {
    var re = new RegExp(name + '=([^;]+)');
    var value = re.exec(document.cookie);
    return value != null ? unescape(value[1]) : '';
  }

  getSessionID() {
    const pattern = /_ga_TG9RW26B46\d\.\d\.(.+?)(?:;|$)/;
    const match = document.cookie.match(pattern);
    const parts = match?.[1].split('.');
    return parts?.shift();
  }

  encryptData(data: string): string {

    return crypto.AES.encrypt(data, AppConfig.SECRET_KEY).toString();

  }

  decryptData(data: string): string {

    const bytes = crypto.AES.decrypt(data, AppConfig.SECRET_KEY);

    return bytes.toString(crypto.enc.Utf8);

  }
}
