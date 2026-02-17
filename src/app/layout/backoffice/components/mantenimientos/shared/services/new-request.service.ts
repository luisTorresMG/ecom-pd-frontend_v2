import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

import {
  ChannelTypeModel,
  ItemModel,
  RequestInfoResponse,
  SearchChannelResponse,
  StockInfo
} from '../models/new-request.model';
import {
  Branch,
  ChannelType,
  FileInfo,
  Item,
  Product,
  SaveCreditLineRequest, SaveProductRequest,
  SaveRequest
} from '../interfaces/new-request.interface';
import { AppConfig } from 'app/app.config';

interface ItemResponse {
  PRO_MASTER: any[];
}

interface ChannelTypeResponse {
  PA_SEL_CHANNEL_TYPE: any [];
}

interface ValidateDocumentNumberResponse {
  PA_VAL_DOC_REQ: {
    P_COUNT: number
  };
}

interface StatusResponse {
  NSTATUS: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewRequestService {
  private readonly apiUrlBackoffice: string = AppConfig.BACKOFFICE_API;
  private readonly apiUrlWDPD: string = AppConfig.WSPD_API;

  /**
   * @param http: HttpClient Inject the httpclient into the service
   */
  constructor(private readonly http: HttpClient) {
  }

  /**
   * The getParams function returns an Observable of ItemModel[]
   * @param type: string Pass the value of the selected item from the dropdown list to this function
   * @return An array of Item objects
   */
  getParams(type: string): Observable<Item[]> {
    const params: HttpParams = new HttpParams()
      .set('S_TYPE', type)
      .set('_', new Date().getTime().toString());

    const url: string = `${this.apiUrlBackoffice}/Request/Request/Certificate`;
    return this.http.get(url, { params }).pipe(
      map((response: ItemResponse) => response.PRO_MASTER.map((item) => new ItemModel(item)) ?? [])
    );
  }

  /**
   * The getChannelTypes function returns an Observable of ChannelType[]
   * @return An array of ChannelTypeModel
   */
  getChannelTypes(): Observable<ChannelType[]> {
    const params: HttpParams = new HttpParams();
    params.set('_', new Date().getTime().toString());

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/ChannelType`;
    return this.http.get(url, { params }).pipe(
      map((response: ChannelTypeResponse) => response.PA_SEL_CHANNEL_TYPE.map((item) => new ChannelTypeModel(item)) ?? [])
    );
  }

  /**
   * The getStockProviders function returns an Observable of Item[]
   * @param channelType: number Filter the results
   * @return An Observable of an array of item model objects
   */
  getStockProviders(channelType: number): Observable<Item[]> {
    const params: HttpParams = new HttpParams()
      .set('P_NTYPECHANNEL', channelType.toString())
      .set('_', new Date().getTime().toString());

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/ChannelFathers`;
    return this.http.get(url, { params }).pipe(
      map((response: any) => response.PA_SEL_CHANNEL_FATHERS.map((item) => new ItemModel({
        SITEM: item.NPOLICY,
        SDECRIPTION: item.SCLIENAME
      })))
    );
  }

  /**
   * The getChannels function returns an Observable of Item[]
   * @return An Observable<item[]>;
   */
  getChannels(): Observable<Item[]> {
    const url: string = `${this.apiUrlWDPD}/Backoffice/canales/broker`;
    return this.http.get(url).pipe(
      map((response: any) => response.data.listadoCanales.map((item) => new ItemModel({
        SITEM: item.codigoCanal,
        SDECRIPTION: item.canal
      })))
    );
  }

  /**
   * The validateDocumentNumber function validates a document number.
   * @param documentNumber: string Pass the document number to the backoffice
   * @param requestType: string Pass the requestTypeControl value
   * @return A boolean value
   */
  validateDocumentNumber(documentNumber: string, requestType: string): Observable<boolean> {
    const params: HttpParams = new HttpParams()
      .set('P_SNUMDOC', documentNumber)
      .set('P_REQUEST', requestType);

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/ChannelDocumentValidate`;
    return this.http.get(url, { params }).pipe(
      map((response: ValidateDocumentNumberResponse): boolean => response.PA_VAL_DOC_REQ.P_COUNT == 0)
    );
  }

  /**
   * The save function saves the current state of the application to a file.
   * @return An Observable<boolean>;
   */
  save(payload: SaveRequest, attachments: FileInfo[]): Observable<boolean> {
    const { names, paternalSurname, maternalSurname } = payload.basicData;
    const completeNames: string = `${paternalSurname} ${maternalSurname}, ${names}`.toUpperCase().trim();
    const fd: FormData = new FormData();
    fd.set('objParametros[P_NTYPEREQUEST]', payload.requestType);
    fd.set('objParametros[P_NSTATE]', '0');
    fd.set('objParametros[P_NACTIVE]', '1');
    fd.set('objParametros[P_NUSERREGISTER]', payload.userId);
    fd.set('objParametros[P_NTYPEDOC]', payload.basicData.documentType);
    fd.set('objParametros[P_SNUMDOC]', payload.basicData.documentNumber);
    fd.set('objParametros[P_SCLIENTNAME]', payload.basicData.legalName.toUpperCase() || completeNames);
    fd.set('objParametros[P_SNAME]', payload.basicData.names.toUpperCase());
    fd.set('objParametros[P_SLASTNAME]', payload.basicData.paternalSurname.toUpperCase());
    fd.set('objParametros[P_SLASTNAME2]', payload.basicData.maternalSurname.toUpperCase());
    fd.set('objParametros[P_NPROVINCE]', payload.basicData.department);
    fd.set('objParametros[P_NLOCAL]', payload.basicData.province);
    fd.set('objParametros[P_NMUNICIPALITY]', payload.basicData.district);
    fd.set('objParametros[P_SPHONE]', payload.basicData.phoneNumber);
    fd.set('objParametros[P_SADDRESS]', payload.basicData.address);
    fd.set('objParametros[P_SCONTACT]', payload.basicData.contact);
    fd.set('objParametros[P_SMAIL]', payload.basicData.email);
    fd.set('objParametros[P_DBEGINVALIDITY]', moment(payload.supplementaryData.startValidity).format('DD/MM/YYYY'));
    fd.set('objParametros[P_DENDVALIDITY]', moment(payload.supplementaryData.endValidity).format('DD/MM/YYYY'));
    fd.set('objParametros[P_NPROVIDERSTOCK]', payload.supplementaryData.stockProvider);
    fd.set('objParametros[P_NDISTRIBUTION]', payload.supplementaryData.distributionType);
    fd.set('objParametros[P_NTYPECHANNEL]', payload.basicData.channelType);

    attachments.forEach((fileInfo: FileInfo): void => {
      fd.append('objParametros[P_ATTACHMENT_LIST][]', fileInfo.url);
      fd.append('routes[]', fileInfo.url);
    });

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/RequestChannel`;
    return this.http.post(url, fd).pipe(
      map((response: StatusResponse): boolean => response.NSTATUS == 1)
    );
  }

  /**
   * The saveFile function takes a file name and a File object as parameters.
   * It then creates an instance of FormData, which is used to send the file to the server.
   * The function returns an Observable that emits a string response from the server.
   * @param fileName: string Set the name of the file that will be sent to the server
   * @param file: File Pass the file to be uploaded
   * @return An Observable<string>;
   */
  saveFile(fileName: string, file: File): Observable<string> {
    const fd: FormData = new FormData();
    fd.set(fileName, file);

    const url: string = `${this.apiUrlBackoffice}/UploadFiles.ashx`;
    return this.http.post(url, fd, { responseType: 'text' }).pipe(
      map((response: string) => response)
    );
  }

  /**
   * The saveCreditLine function is used to save the credit line.
   * @param payload: SaveCreditLineRequest Pass the data to the api
   * @return A boolean
   */
  saveCreditLine(payload: SaveCreditLineRequest): Observable<boolean> {
    const fd: FormData = new FormData();
    fd.set('P_NTIPPOL', payload.certificateType);
    fd.set('P_NSTOCKMIN', payload.minStock);
    fd.set('P_NSTOCKMAX', payload.maxStock);
    fd.set('P_NSTOCKCURRENT', payload.currentStock);
    fd.set('P_NUSERREGISTER', payload.userId);
    fd.set('P_SNUMDOC', payload.documentNumber);

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/LineCreditInsertChannel`;
    return this.http.post(url, fd).pipe(
      map((response: StatusResponse): boolean => response.NSTATUS == 1)
    );
  }

  /**
   * The updateAssociatedChannel function is used to update the associated channel of a given user.
   * @param payload Send the data to the backend
   * @return An Observable<any>;
   */
  updateAssociatedChannel(payload): Observable<any> {
    const url: string = `${this.apiUrlWDPD}/Backoffice/canales/actualizar/asociado`;
    return this.http.post(url, payload).pipe(
      map((response) => response)
    );
  }

  /**
   * The getProducts function returns product list
   * @return Observable<Product[]>
   */
  getProducts(): Observable<Branch[]> {
    const url: string = `${this.apiUrlWDPD}/backoffice/canales/listado/productos`;
    return this.http.get(url).pipe(
      map((response: any) => this.groupProductsByBranch(response.data.listadoProductos as Product[], ''))
    );
  }

  /**
   * The getProductsOfChannel function returns an observable of type Branch[].
   * It takes a payload object as argument, which contains the numeroSolicitud and codigoCanal properties.
   * The function makes a POST request to the url: http://localhost:8080/backoffice/canales/listado/productos.
   * The response is mapped into an array of type Branch[] using the groupProductsByBranch function.
   * @param payload: { numeroSolicitud, codigoCanal }
   * @return An observable of branch[]
   */
  getProductsOfChannel(payload: { numeroSolicitud, codigoCanal }): Observable<Branch[]> {
    const url: string = `${this.apiUrlWDPD}/backoffice/canales/listado/productosCanal`;
    return this.http.post(url, payload).pipe(
      map((response: any) => this.groupProductsByBranch(response.data.listadoProductosCanal as Product[], response.data))
    );
  }

  /**
   * The saveProducts function is used to save a product in the backend.
   * @param payload: SaveProductRequest Send the data to the backend
   * @return An observable of the type boolean
   */
  saveProducts(payload: SaveProductRequest): Observable<boolean> {
    const url: string = `${this.apiUrlWDPD}/backoffice/canales/crear/producto`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data.success)
    );
  }

  /**
   * The groupProductsByBranch function takes an array of products and groups them by branch.
   * @param products: Product[] Pass the products array to the function
   * @return An array of branch objects
   */
  private groupProductsByBranch(products: Product[], data: any): Branch[] {
    const branches: Branch[] = [];
    products.forEach((product: Product): void => {
      if (!branches.some((b: Branch): boolean => b.branchId == +product.idRamo)) {
        branches.push({
          branchId: +product.idRamo,
          name: product.ramo,
          products: [],
          detailSubChannel: data.subCanal ?? '',
          associatedChannel: data.canalAsociado ?? '',
        });
      }
    });

    branches.forEach((branch: Branch): void => {
      branch.products = products.filter((p: Product): boolean => +p.idRamo == branch.branchId);
    });

    return branches;
  }

  /**
   * The searchChannel function is used to search for a channel by its document number and legal name.
   * @param payload Pass the search parameters to the api
   * @return An observable<SearchChannelResponse>;
   */
  searchChannel(payload): Observable<SearchChannelResponse> {
    const params: HttpParams = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', (payload.currentPage - 1).toString())
      .set('pagesize', '5')
      .set('recordstartindex', ((payload.currentPage - 1) * 5).toString())
      .set('recordendindex', (payload.currentPage * 5).toString())
      .set('P_SNUMDOC', payload.documentNumber)
      .set('P_SCLIENTNAME', payload.legalName)
      .set('_', new Date().getTime().toString());

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestSalePointSearch/GetSalePointSearchChannel`;

    return this.http.get(url, { params }).pipe(
      map((response: any) => new SearchChannelResponse(response))
    );
  }

  /**
   * The requestInfo function returns an Observable of type RequestInfoResponse.
   * The function takes a channel string as input and uses it to create a new HttpParams object,
   * which is then used in the http.
   * Get request to the backoffice API.
   * The response from the API is mapped into a RequestInfoResponse object using its constructor method,
   * which takes in an array of objects as input and maps them into individual properties on itself (see below).
   * @param channel: string Pass the value of the channel to be used in the request
   * @return An observable, which is a data stream that you can subscribe to
   */
  requestInfo(channel: string): Observable<RequestInfoResponse> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDREQUESTCHANNEL', channel);

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/DataRequestRead`;
    return this.http.get(url, { params }).pipe(
      map((response: any) => new RequestInfoResponse(response.PA_SEL_DATA_REQUEST))
    );
  }

  /**
   * The getAttachmentList function returns an observable of the list of attachments for a given channel.
   * @param channel: string Pass the channel to the backend
   * @return An array of objects
   */
  getAttachmentList(channel: string): Observable<any[]> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDREQUESTCHANNEL', channel);

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/AttachmentRequestRead`;
    return this.http.get(url, { params }).pipe(
      map((response: any) => (response.PA_SEL_DATA_ATTACHMENT ?? []).map((item) => {
        const fileInfo: FileInfo = {
          fileType: item.STYPEFILE,
          url: item.SROUTE,
          fileName: item.SFILENAME
        };
        return fileInfo;
      }))
    );
  }

  /**
   * The getCreditLineList function is used to get the credit line list from the backoffice.
   * @param channel: string Pass the channel to the backend
   * @return An array of StockInfo objects
   */
  getCreditLineList(channel: string): Observable<StockInfo[]> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDCHANNEL', channel);

    const url: string = `${this.apiUrlBackoffice}/ChannelRequest/ChannelRequestPolicy/GetLineCreditChannelModify`;
    return this.http.get(url, { params }).pipe(
      map((response: any) => response.PA_SEL_LINE_CREDIT_CHANNEL.map((item) => new StockInfo(item)))
    );
  }
}
