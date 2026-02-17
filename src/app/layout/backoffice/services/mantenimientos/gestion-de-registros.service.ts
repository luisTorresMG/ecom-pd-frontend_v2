import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {
  EstadoRequest,
  BuscarRequest,
  HistorialRequest,
  SolicitudRequest,
  DocumentoRequest,
  ArchivoRequest,
  FrecuenciaRequest,
  StatusRequest,
  CertificadoRequest,
  DepartamentoRequest,
  ProvinciaRequest,
  DistritoRequest,
  CanalRequest,
  IChannelDocumentValidate,
  DataRequest,
  IEvaluateChannelRequest,
  DataAdjuntoRequest,
  ChannelFathersRequest,
  EstadoERequest,
  DatosLineaERequest,
  DatosPVRequest,
  TipoPapelesModel,
  TipoPapelesModelRequest,
  TipoPapelesPointSaleModel,
  ListaPapeles,
  ActualizarCanalAsociado,
} from '../../models/mantenimientos/gestion-de-registros/gestion-de-registros.model';
import { param } from 'jquery';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockProviderModel } from '../../models/mantenimientos/gestion-de-registros/stock-provider.model';
import moment from 'moment';
import { ChannelModel } from '../../models/mantenimientos/gestion-de-registros/channel.model';
import { PointSaleDetailModel } from '../../models/mantenimientos/gestion-de-registros/point-sale-detail.model';
import { SalePointModel } from '../../models/mantenimientos/gestion-de-registros/sale-point.model';

@Injectable({
  providedIn: 'root',
})
export class GestionDeRegistrosService {
  private urlApi: string;
  private urlBackend: string;
  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.urlBackend = AppConfig.WSPD_API;
  }

  private llamarApi(call: any) {
    const data = new Observable((obs) => {
      call.subscribe(
        (res) => {
          obs.next(res);
          obs.complete();
        },
        (error) => {
          obs.error(error);
        }
      );
    });
    return data;
  }

  estado(datos: EstadoRequest) {
    const parametros = new HttpParams()
      .set('P_NIDUSER', datos.P_NIDUSER)
      .set('_', datos._);
    const url = this.urlApi + '/ChannelRequest/ChannelRequest/StatusRead/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  buscar(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', datos.filterscount)
      .set('groupscount', datos.groupscount)
      .set('pagenum', datos.pagenum)
      .set('pagesize', datos.pagesize)
      .set('recordstartindex', datos.recordstartindex)
      .set('recordendindex', datos.recordendindex)
      .set('P_DATEBEGIN', datos.P_DATEBEGIN)
      .set('P_DATEEND', datos.P_DATEEND)
      .set('P_NREQUEST', datos.P_NREQUEST)
      .set('P_NSTATE', datos.P_NSTATE)
      .set('P_NIDUSER', datos.P_NIDUSER)
      .set('_', datos._);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequest/ChannelRequestRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  historial(datos: HistorialRequest) {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      datos.P_NIDCHANNELREQUEST
    );
    const url = this.urlApi + '/ChannelRequest/ChannelRequest/GetHistory';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  solicitud(datos: SolicitudRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  documento(datos: DocumentoRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  archivo(datos: ArchivoRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  frecuencia(datos: FrecuenciaRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  status(datos: StatusRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  certificado(datos: CertificadoRequest) {
    const parametros = new HttpParams()
      .set('S_TYPE', datos.S_TYPE)
      .set('_', datos._);
    const url = this.urlApi + '/Request/Request/Certificate/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  departamento(datos: DepartamentoRequest) {
    const parametros = new HttpParams().set('_', datos._);
    const url = this.urlApi + '/User/Emergente/DepartamentoRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  provincia(datos: ProvinciaRequest) {
    const parametros = new HttpParams()
      .set('P_NPROVINCE', datos.P_NPROVINCE)
      .set('_', datos._);
    const url = this.urlApi + '/User/Emergente/ProvinciaRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  distrito(datos: DistritoRequest) {
    const parametros = new HttpParams()
      .set('P_NLOCAL', datos.P_NLOCAL)
      .set('_', datos._);
    const url = this.urlApi + '/User/Emergente/DistritoRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  canal(datos: CanalRequest) {
    const parametros = new HttpParams().set('_', datos._);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/ChannelType';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  validar(datos: IChannelDocumentValidate) {
    const parametros = new HttpParams()
      .set('P_SNUMDOC', datos.documentNumber)
      .set('P_REQUEST', datos.requestType.toString());
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestPolicy/ChannelDocumentValidate';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  insertChannel(datos) {
    console.log(datos);
    const fd = new FormData();
    const businessName =
      datos.documentNumber.toString().slice(0, 2) == '10'
        ? datos?.lastname + ' ' + datos?.lastname2 + ', ' + datos?.name
        : datos?.businessName;

    fd.set('objParametros[P_NTYPEREQUEST]', datos.requestType);
    fd.set('objParametros[P_NSTATE]', '0');
    fd.set('objParametros[P_NACTIVE]', '1');
    fd.set('objParametros[P_NUSERREGISTER]', datos.userId);
    fd.set('objParametros[P_NTYPEDOC]', datos.documentType || '');
    fd.set('objParametros[P_SNUMDOC]', datos.documentNumber || '');
    fd.set('objParametros[P_SCLIENTNAME]', businessName || '');
    fd.set('objParametros[P_SNAME]', datos?.name || '');
    fd.set('objParametros[P_SLASTNAME]', datos?.lastname || '');
    fd.set('objParametros[P_SLASTNAME2]', datos?.lastname2 || '');
    fd.set('objParametros[P_NPROVINCE]', datos.department || '');
    fd.set('objParametros[P_NLOCAL]', datos.province || '');
    fd.set('objParametros[P_NMUNICIPALITY]', datos.district || '');
    fd.set('objParametros[P_SPHONE]', datos.cellphone || '');
    fd.set('objParametros[P_SADDRESS]', datos.address || '');
    fd.set('objParametros[P_SCONTACT]', datos.contact || '');
    fd.set('objParametros[P_SMAIL]', datos.email || '');
    fd.set(
      'objParametros[P_DBEGINVALIDITY]',
      moment(datos.startValidity).format('DD/MM/YYYY') || ''
    );
    fd.set(
      'objParametros[P_DENDVALIDITY]',
      moment(datos.endValidity).format('DD/MM/YYYY') || ''
    );
    fd.set('objParametros[P_NPROVIDERSTOCK]', datos.stockProvider || '');
    fd.set('objParametros[P_NDISTRIBUTION]', datos.distribution || '');
    fd.set('objParametros[P_NTYPECHANNEL]', datos.channelType || '');

    datos.attachments.forEach((e: any) => {
      const file =
        e?.urlArchivo || `UploadChannel/${new Date().getTime()}/${e.nombre}`;
      fd.append(
        'objParametros[P_ATTACHMENT_LIST][]',
        file.replace('[TypeFileName]', e?.fileType)
      );
      fd.append('routes[]', file.replace('[TypeFileName]', e?.fileType));
    });

    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/RequestChannel';
    console.log('URL: ', url);
    console.log('PARAMETROS: ', fd);
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }
  saveLineCredit(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NTIPPOL', data.policyType);
    fd.set('P_NSTOCKMIN', data.minStock);
    fd.set('P_NSTOCKMAX', data.maxStock);
    fd.set('P_NSTOCKCURRENT', data.currentStock);
    fd.set('P_NUSERREGISTER', data.userId);
    fd.set('P_SNUMDOC', data.documentNumber);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/LineCreditInsertChannel`;
    const api = this._http.post(url, fd);
    return api.pipe(map((res: any) => res));
  }
  saveLineCreditIn(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_SEQUENCE', data.index);
    fd.set('P_NIDCHANNEL', data.channelCode);
    fd.set('P_NTIPPOL', data.policyType);
    fd.set('P_NSTOCKMIN', data.minStock);
    fd.set('P_NSTOCKMAX', data.maxStock);
    fd.set('P_NSTOCKCURRENT', data.currentStock);
    fd.set('P_NUSERREGISTER', data.userId);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/LineCreditInsert`;
    const api = this._http.post(url, fd);
    return api.pipe(map((res: any) => res));
  }

  saveLineCredit2(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NTIPPOL', data.policyType);
    fd.set('P_NSTOCKMIN', data.minStock);
    fd.set('P_NSTOCKMAX', data.maxStock);
    fd.set('P_NSTOCKCURRENT', data.currentStock);
    fd.set('P_NUSERREGISTER', data.userId);
    fd.set('P_SNUMDOC', data.documentNumber);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/LineCreditInsertChannel`;
    const api = this._http.post(url, fd);
    return api.pipe(map((res: any) => res));
  }

  respuestaData(datos: DataRequest): Observable<any> {
    switch (+datos.requestType) {
      case 0:
        return this.respuestaData0(datos);
      default:
        return this.respuestaData0(datos);
    }
  }

  respuestaData0(datos: DataRequest): Observable<any> {
    const parametros = new HttpParams().set(
      'P_NIDREQUESTCHANNEL',
      datos.P_NIDREQUESTCHANNEL
    );
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/DataRequestRead';
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => res));
  }

  respuestaData2(datos: DatosPVRequest): Observable<any> {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      datos.P_NIDCHANNELREQUEST
    );
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/GetSalePointRequest';
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => res));
  }

  evaluateChannel(data: IEvaluateChannelRequest): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NIDCHANNELREQUEST', data.idChannel.toString());
    fd.set('P_NSTATE', data.state.toString());
    fd.set('P_NUSER', data.userId.toString());
    fd.set('P_SOBSERVATION', data.observation);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/RequestEvaluateChannel`;
    return this._http.post(url, fd).pipe(
      map((res: any) => ({
        status: res.NSTATUS,
      }))
    );
  }

  respuestaDataAdjunto(datos: DataAdjuntoRequest) {
    const parametros = new HttpParams().set(
      'P_NIDREQUESTCHANNEL',
      datos.P_NIDREQUESTCHANNEL
    );
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestPolicy/AttachmentRequestRead';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  ProveedorStock(datos: ChannelFathersRequest) {
    const parametros = new HttpParams()
      .set('P_NTYPECHANNEL', datos.P_NTYPECHANNEL)
      .set('_', datos._);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/ChannelFathers';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  stockProvider(channelType: string): Observable<any> {
    const params = new HttpParams()
      .set('P_NTYPECHANNEL', channelType)
      .set('_', new Date().getTime().toString());
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/ChannelFathers';
    return this._http
      .get(url, { params: params })
      .pipe(map((res: any) => new StockProviderModel(res)));
  }

  EstadoSolicitud(datos: EstadoERequest) {
    const parametros = new HttpParams()
      .set('P_NIDUSER', datos.P_NIDUSER)
      .set('_', datos._);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequest/StatusReadWorkFlow/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  DatosLinea(datos: DatosLineaERequest) {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      datos.P_NIDCHANNELREQUEST
    );
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/GetLineCreditChannel';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  DatosPV(datos: DatosPVRequest) {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      datos.P_NIDCHANNELREQUEST
    );
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestPolicy/GetSalePointRequestDetail';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }

  listaPapeles(data: TipoPapelesModelRequest): Observable<any> {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      data.P_NIDCHANNELREQUEST
    );
    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditChannel`;
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => new TipoPapelesModel(res)));
  }
  listaPapeles2(data: TipoPapelesModelRequest): Observable<any> {
    const parametros = new HttpParams().set(
      'P_NIDCHANNELREQUEST',
      data.P_NIDCHANNELREQUEST
    );
    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditChannelMod`;
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => new TipoPapelesModel(res)));
  }

  listaLineaCredito(data: any): Observable<any> {
    const parametros = new HttpParams()
      .set('P_NIDCHANNEL', data.channelSale)
      .set('P_NIDSALEPOINT', data.pointSale);
    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditSalePoint`;
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => new TipoPapelesModel(res)));
  }

  listaLineaCredito2(data: any): Observable<any> {
    const parametros = new HttpParams()
      .set('P_NIDCHANNEL', data.channelSale)
      .set('P_NIDSALEPOINT', data.pointSale);
    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditSalePoint`;
    return this._http.get(url, { params: parametros }).pipe(
      map(
        (res: any) =>
          new ListaPapeles({
            ...res,
            pointSale: data.pointSale,
            index: data.index,
          })
      )
    );
  }

  uploadFiles(data: { name: string; file: File }): Observable<any> {
    const fd: FormData = new FormData();
    fd.set(data.name, data.file);
    const url = `${this.urlApi}/UploadFiles.ashx`;
    return this._http
      .post(url, fd, { responseType: 'text', observe: 'response' })
      .pipe(map((response: any) => response));
  }

  searchChannel(data: any): Observable<ChannelModel> {
    const params: HttpParams = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', '0')
      .set('pagesize', '5')
      .set('recordstartindex', (data.page * 5).toString())
      .set('recordendindex', ((data.page * 2 || 1) * 5).toString())
      .set('P_SNUMDOC', data.documentNumber)
      .set('P_SCLIENTNAME', data.clientName || '')
      .set('_', new Date().getTime().toString());

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePointSearch/GetSalePointSearchChannel`;
    return this._http
      .get(url, { params: params })
      .pipe(map((response: any) => new ChannelModel(response)));
  }

  evaluar(datos) {
    const fd = new FormData();
    fd.set('P_NIDCHANNELREQUEST', datos.idcanal);
    fd.set('P_NSTATE', datos.idestado);
    fd.set('P_NUSER', datos.iduser);
    fd.set('P_SOBSERVATION', datos.obser);
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestPolicy/RequestEvaluateChannel';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  proveedorStock(data: any): Observable<any> {
    const parametros = new HttpParams()
      .set('P_NTYPECHANNEL', data.channelType)
      .set('_', '1639678778036');
    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/ChannelFathers`;
    return this._http
      .get(url, { params: parametros })
      .pipe(map((res: any) => new TipoPapelesModel(res)));
  }

  pointSaleDetail(channel: string): Observable<PointSaleDetailModel> {
    const params: HttpParams = new HttpParams().set('P_NIDCHANNEL', channel);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetSalePointRequestDetail_CH`;

    return this._http
      .get(url, { params: params })
      .pipe(map((response: any) => new PointSaleDetailModel(response)));
  }
  pointSaleCreditLines(payload: {
    channelSale: any;
    pointSale: any;
  }): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDCHANNEL', payload.channelSale)
      .set('P_NIDSALEPOINT', payload.pointSale);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditSalePoint`;

    return this._http
      .get(url, { params: params })
      .pipe(map((response: any) => response));
  }

  salePointHeaderRequest(payload: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NTYPEREQUEST', payload.requestType)
      .set('P_NSTATE', payload.state)
      .set('P_NACTIVE', payload.active)
      .set('P_NUSERREGISTER', payload.userId)
      .set('P_NIDCHANNEL', payload.channelId);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePoint/RequestSalePointHeader`;

    return this._http
      .get(url, { params: params })
      .pipe(
        map(
          (response: any) => response.PA_INS_SALEPOINT_REQ_HEAD.P_ID_REQ_CHANNEL
        )
      );
  }

  salePointRequest(payload: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_ID_REQ_CHANNEL', payload.channelRequestId);
    fd.set('P_NIDCHANNEL', payload.channelId);
    fd.set('P_SDESCRIPTION', payload.description);
    fd.set('P_NPROVINCE', payload.department);
    fd.set('P_NLOCAL', payload.province);
    fd.set('P_NMUNICIPALITY', payload.district);
    fd.set('P_SPHONE', payload.phone);
    fd.set('P_SADDRESS', payload.address);
    fd.set('P_SCONTACT', payload.contact);
    fd.set('P_SMAIL', payload.email);
    fd.set('P_SFRECUENCY', payload.frecuency);
    fd.set('P_STYPEFRECUENCY', payload.frecuencyType);
    fd.set('P_NUSERREGISTER', payload.userId);
    fd.set('P_NSEQUENCE', payload.index);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePoint/RequestSalePoint`;

    return this._http
      .post(url, fd)
      .pipe(map((response: any) => response.NSTATUS));
  }

  update(datos) {
    const fd = new FormData();
    fd.set('objParametros[P_NIDCHANNELREQUEST]', datos.nsolicitud);
    fd.set('objParametros[P_NUSERREGISTER]', '62');
    fd.set('objParametros[P_SNUMDOC]', datos.documento);
    fd.set('objParametros[P_SCLIENTNAME]', datos.cliente);
    fd.set('objParametros[P_SNAME]', datos.nombre);
    fd.set('objParametros[P_SLASTNAME]', datos.apellidop);
    fd.set('objParametros[P_SLASTNAME2]', datos.apellidom);
    fd.set('objParametros[P_NPROVINCE]', datos.provincia);
    fd.set('objParametros[P_NLOCAL]', datos.local);
    fd.set('objParametros[P_NMUNICIPALITY]', datos.muni);
    fd.set('objParametros[P_SPHONE]', datos.celular);
    fd.set('objParametros[P_SADDRESS]', datos.direccion);
    fd.set('objParametros[P_SCONTACT]', datos.contacto);
    fd.set('objParametros[P_SMAIL]', datos.email);
    fd.set(
      'objParametros[P_DBEGINVALIDITY]',
      moment(datos.fechai, 'DD/MM/YYYY').format('DD/MM/YYYY') ||
        moment(datos.fechai).format('DD/MM/YYYY')
    );
    fd.set(
      'objParametros[P_DENDVALIDITY]',
      moment(datos.fechaf, 'DD/MM/YYYY').format('DD/MM/YYYY') ||
        moment(datos.fechaf).format('DD/MM/YYYY')
    );
    fd.set('objParametros[P_NPROVIDERSTOCK]', datos.nproStock);
    fd.set('objParametros[P_NDISTRIBUTION]', datos.ndistribution);
    fd.set('objParametros[P_NTYPECHANNEL]', datos.channelType);

    console.log(datos.attachments);

    datos.attachments.forEach((e: any) => {
      const file = e?.urlArchivo || `UploadChannel/${new Date().getTime()}/${e.nombre || e?.SFILENAME}` || e?.SROUTE;
      // `${url}?${fileName}?.${fileExtension}?${fileType}`
      fd.append(
        'routes[]',
        file.replace('[TypeFileName]', e?.fileType || e?.STYPEFILE)
      );
    });

    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/UpdateChannelRequest';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  lineCredit(data) {
    const fd = new FormData();
    fd.set('P_NTIPPOL', data.policyType);
    fd.set('P_NSTOCKMIN', data.minStock);
    fd.set('P_NSTOCKMAX', data.maxStock);
    fd.set('P_NSTOCKCURRENT', data.currentStock);
    fd.set('P_NUSERREGISTER', data.userId);
    fd.set('P_SNUMDOC', data.documentNumber);
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestPolicy/LineCreditInsertChannel';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  lineCreditInsert(data) {
    const fd = new FormData();
    fd.set('P_SEQUENCE', data.sequence);
    fd.set('P_NIDCHANNEL', data.nchannel);
    fd.set('P_NTIPPOL', data.policyType);
    fd.set('P_NSTOCKMIN', data.minStock);
    fd.set('P_NSTOCKMAX', data.maxStock);
    fd.set('P_NSTOCKCURRENT', data.currentStock);
    fd.set('P_NUSERREGISTER', data.userId);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/LineCreditInsert';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  update2(datos) {
    const fd = new FormData();
    fd.set('P_ID_REQ_CHANNEL', datos.nsolicitud);
    fd.set('P_NIDCHANNEL', datos.nichannel);
    fd.set('P_SDESCRIPTION', datos.description);
    fd.set('P_NPROVINCE', datos.provincia);
    fd.set('P_NLOCAL', datos.local);
    fd.set('P_NMUNICIPALITY', datos.muni);
    fd.set('P_SPHONE', datos.celular);
    fd.set('P_SADDRESS', datos.direccion);
    fd.set('P_SCONTACT', datos.contacto);
    fd.set('P_SMAIL', datos.correo);
    fd.set('P_SFRECUENCY', datos.frecuencia);
    fd.set('P_STYPEFRECUENCY', datos.typefrecuencia);
    fd.set('P_NUSERREGISTER', '62');
    fd.set('P_NSEQUENCE', datos.sequence);
    const url =
      this.urlApi +
      '/ChannelRequest/ChannelRequestSalePoint/RequestSalePointMod';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  guardarSalePoint(datos) {
    const fd = new FormData();
    fd.set('P_ID_REQ_CHANNEL', datos.nsolicitud);
    fd.set('P_NIDCHANNEL', datos.nichannel);
    fd.set('P_SDESCRIPTION', datos.description);
    fd.set('P_NPROVINCE', datos.provincia);
    fd.set('P_NLOCAL', datos.local);
    fd.set('P_NMUNICIPALITY', datos.muni);
    fd.set('P_SPHONE', datos.celular);
    fd.set('P_SADDRESS', datos.direccion);
    fd.set('P_SCONTACT', datos.contacto);
    fd.set('P_SMAIL', datos.correo);
    fd.set('P_SFRECUENCY', datos.frecuencia);
    fd.set('P_STYPEFRECUENCY', datos.typefrecuencia);
    fd.set('P_NUSERREGISTER', '62');
    fd.set('P_NSEQUENCE', datos.sequence);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestSalePoint/RequestSalePoint';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }

  deleteSalePoint(datos) {
    const fd = new FormData();
    fd.set('P_NIDREQUEST', datos.nsolicitud);
    const url =
      this.urlApi + '/ChannelRequest/ChannelRequestPolicy/DeleteSalePoint';
    const call = this._http.post(url, fd);
    return this.llamarApi(call);
  }
  creditLinesRead(channelId: string): Observable<any> {
    const payload: HttpParams = new HttpParams().set('P_NIDCHANNEL', channelId);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditChannelModify`;

    // tslint:disable-next-line:max-line-length
    return this._http.get(url, { params: payload }).pipe(
      map((response: any) =>
        response.PA_SEL_LINE_CREDIT_CHANNEL.map((val) => ({
          policyType: +val.NTIPPOL,
          minStock: +val.NSTOCKMIN,
          maxStock: +val.NSTOCKMAX,
          currentStock: +val.NSTOCKCURRENT,
        }))
      )
    );
  }

  salePoints(_: any): Observable<any> {
    _.currentPage = _.currentPage - 1 >= 0 ? _.currentPage - 1 : 0;
    const params: HttpParams = new HttpParams()
      .set('P_SNUMDOC', _.documentNumber || '')
      .set('P_SDESCSALEPOINT', _.description || '')
      .set('P_SNAMECHANNEL', _.clientName || '')
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', _.currentPage)
      .set('pagesize', '5')
      .set('recordstartindex', (_.currentPage * 5).toString())
      .set('recordendindex', (_.currentPage * 5 + 5).toString())
      .set('_', new Date().getTime().toString());

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSaleSearch/GetSalePointSearch`;

    return this._http
      .get(url, { params: params })
      .map((response: any) => new SalePointModel(response));
  }

  creditLinesOfSalePoint(_: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDCHANNEL', _.channelId)
      .set('P_NIDSALEPOINT', _.salePointId);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestPolicy/GetLineCreditSalePointOriginal`;

    return this._http.get(url, { params: params }).map((response: any) =>
      response?.PA_READ_LINE_CREDIT_SALE_POINT.map((val: any) => ({
        minStock: val.NSTOCKMIN,
        maxStock: val.NSTOCKMAX,
        currentStock: val.NSTOCKCURRENT,
        policyType: val.NTIPPOL,
      }))
    );
  }

  validateSalePoint(_: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NTYPEREQUEST', _.requestType)
      .set('P_NSTATE', _.state)
      .set('P_NACTIVE', _.active)
      .set('P_NUSERREGISTER', _.userId)
      .set('P_NIDCHANNEL', _.channelId);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePoint/RequestSalePointModHeader`;

    return this._http
      .get(url, { params: params })
      .map(
        (response: any) => +response.PA_INS_SALEPOINT_REQ_HEAD.P_ID_REQ_CHANNEL
      );
  }

  salePointMod(_: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_ID_REQ_CHANNEL', _.channelRequestId);
    fd.set('P_NIDCHANNEL', _.channelId);
    fd.set('P_SDESCRIPTION', _.description || '');
    fd.set('P_NPROVINCE', _.department);
    fd.set('P_NLOCAL', _.province);
    fd.set('P_NMUNICIPALITY', _.district);
    fd.set('P_SPHONE', _.phone || '');
    fd.set('P_SADDRESS', _.address || '');
    fd.set('P_SCONTACT', _.contact || '');
    fd.set('P_SMAIL', _.email || '');
    fd.set('P_SFRECUENCY', _.frecuency);
    fd.set('P_STYPEFRECUENCY', _.frecuencyType);
    fd.set('P_NUSERREGISTER', _.userId);
    fd.set('P_NSEQUENCE', _.sequence);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePoint/RequestSalePointMod`;

    return this._http.post(url, fd).map((response: any) => +response.NSTATUS);
  }

  bulkLoad(file: File): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('FileUpload', file);

    const url = `${this.urlApi}/ChannelRequest/ChannelRequestSalePoint/UploadArchivo`;

    return this._http.post(url, fd).map((response: any) => response);
  }

  listaCanales(): Observable<any> {
    const url = `${this.urlBackend}/Backoffice/canales/broker`;
    return this._http.get(url).map((response: any) => {
      let resp = [];
      if (response.data?.success) resp = response.data?.listadoCanales;
      return resp;
    });
  }

  actualizarCanalAsociado(datos: ActualizarCanalAsociado): Observable<any> {
    const url = `${this.urlBackend}/Backoffice/canales/actualizar/asociado`;
    return this._http.post(url, datos);
  }

  obtenerCanalAsociado(id: number): Observable<any> {
    const url = `${this.urlBackend}/backoffice/canales/${id}/asociado`;
    return this._http.get(url).map((response: any) => {
      let resp = null;
      if (response.data?.success) resp = response.data;
      return resp;
    });
  }
}
