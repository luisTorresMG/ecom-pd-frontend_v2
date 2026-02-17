import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';

// *MODELOS
import { ChannelStatesModel } from '../../models/mantenimientos/channel-states.model';
import { ChannelTypesModel } from '../../models/mantenimientos/channel-types.model';
import { ChannelsModel } from '../../models/mantenimientos/channels.model';

// *INTERFACES
import { IBuscarCanalRequest } from '../../interfaces/buscar-canal.interface';
import { PointSaleResultModel } from '../../models/mantenimientos/point-sale-result.model';
import { ChannelResultModel } from '../../models/mantenimientos/channel-result.model';
import { SemaforoPointSaleModel } from '../../models/mantenimientos/semaforoPointSale.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {

  private apiUri: string;

  constructor(
    private readonly _http: HttpClient
  ) {
    this.apiUri = AppConfig.BACKOFFICE_API;
  }

  private callApi(api: any): Observable<any> {
    const data = new Observable(obs => {
      api.subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data;
  }

  channels(type: string): Observable<ChannelsModel> {
    const time = new Date().getTime();
    const url = `${this.apiUri}/StockManagement/Channel/PA_SEL_CHANNEL?P_NTYPECHANNEL=${type || -1}&_=${time}`;
    const api = this._http.get(url);
    return this.callApi(api);
  }

  channelStates(): Observable<ChannelStatesModel> {
    const url = `${this.apiUri}/StockManagement/Channel/DDLCHANNELSTATE_LOAD`;
    const api = this._http.get(url);
    return this.callApi(api);
  }

  channelTypes(): Observable<ChannelTypesModel> {
    const time = new Date().getTime();
    const url = `${this.apiUri}/TypeChannel/Core/protypechannelRead?_=${time}`;
    const api = this._http.get(url);
    return this.callApi(api);
  }

  pointSales(data: any): Observable<PointSaleResultModel> {
    const params: HttpParams = new HttpParams()
      .set('P_NPOLICY', data.poliza)
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', '0')
      .set('pagesize', '10')
      .set('recordstartindex', '0')
      .set('recordendindex', '0')
      .set('_', new Date().getTime().toString());
    const url = `${this.apiUri}/StockManagement/Core/PA_SEL_SALE_POINT`;
    const api: Observable<any> = this._http.get(url, { params: params });
    return <Observable<PointSaleResultModel>>this.callApi(api);
  }

  salePointBaja(poliza: string): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NPOLICY', poliza);
    const url = `${this.apiUri}/StockManagement/ChannelV/SalePointBaja`;
    const api: Observable<any> = this._http.post(url, fd);
    return <Observable<any>>api;
  }

  buscarCanal(data: IBuscarCanalRequest): Observable<ChannelResultModel> {
    const params = new HttpParams()
      .set('_', new Date().getTime().toString())
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', data.numPage?.toString())
      .set('pagesize', data.pageSize?.toString())
      .set('recordstartindex', data.pageIndex?.toString())
      .set('recordendindex', data.endIndex?.toString())
      .set('P_NPOLICYSTATE', data.estadoCanal?.toString() || '-1')
      .set('P_NTYPECHANNEL', data.tipoCanal?.toString() || '0')
      .set('P_NPOLICY', data.canalVenta || '0')
      // tslint:disable-next-line:max-line-length
      .set('P_SNOMBRES', Number(data.tipoDocumento || 0) === 1 ?
        `${data.razonSocial || ''}` :
        (`${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''} ${data.nombres || ''}`).trim())
      .set('P_NTYPEDOC', data.tipoDocumento?.toString() || '0')
      .set('P_NNRODOC', data.numeroDocumento || '');

    const url = `${this.apiUri}/StockManagement/Channel/PA_SEL_CHANNEL_FILTER`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }

  savePointChannel(data: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NPOLICY', data.poliza)
      .set('P_SDESCRIPT', data.descripcion)
      .set('P_SSTREET', data.direccion)
      .set('P_NPROVINCE', data.departamento)
      .set('P_TAB_LOCAT', data.provincia)
      .set('P_NMUNICIPALITY', data.distrito)
      .set('P_NPHONE', data.telefono)
      .set('P_NUSERCODE', data.userCode)
      .set('P_SEMAILCLI', data.email)
      .set('P_SCONTACT', data.contacto)
      .set('P_SCHANNEL', '0')
      .set('P_SACTIVE', '1')
      .set('P_NOPCION', '0')
      .set('P_NNUMPOINT', data.puntoVenta);
    const url = `${this.apiUri}/StockManagement/Core/PA_UPD_SALE_POINT`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }
  newPointChannel(data: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NPOLICY', data.poliza)
      .set('P_SDESCRIPT', data.descripcion)
      .set('P_SSTREET', data.direccion)
      .set('P_NPROVINCE', data.departamento)
      .set('P_TAB_LOCAT', data.provincia)
      .set('P_NMUNICIPALITY', data.distrito)
      .set('P_NPHONE', data.telefono)
      .set('P_NUSERCODE', data.userCode)
      .set('P_SEMAILCLI', data.email)
      .set('P_SCONTACT', data.contacto)
      .set('P_SCHANNEL', '1');
    const url = `${this.apiUri}/StockManagement/Core/PA_INS_SALE_POINT`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }
  saveChannel(data: any): Observable<PointSaleResultModel> {
    const params: HttpParams = new HttpParams()
      .set('P_NTYPEDOC', data.tipoDocumento)
      .set('P_NNRODOC', data.numeroDocumento)
      .set('P_NPERSON_TYP', '1')
      .set('P_SLEGALNAME', data.razonSocial || '')
      .set('P_SFIRSTNAME', data.nombres || '')
      .set('P_SLASTNAME', data.apellidoPaterno || '')
      .set('P_SLASTNAME2', data.apellidoMaterno || '')
      .set('SCLIENT', data.codigoCliente)
      .set('P_SCLIENAME', data.nombreCliente || '')
      .set('P_NNATIONALITY', '604')
      .set('P_SSTREET', data.direccion)
      .set('P_SEMAILCLI', data.email)
      .set('P_NUSERCODE', data.codigoUsuario)
      .set('P_NPOLICYFATHER', data.codigoCanalPadre);
    const url = `${this.apiUri}/StockManagement/Core/PA_UPD_CLIENT`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }

  semaforoPointSale(data: any): Observable<SemaforoPointSaleModel> {
    const params: HttpParams = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', '0')
      .set('pagesize', '10')
      .set('recordstateindex', '0')
      .set('recordendindex', '10')
      .set('P_NPOLICY', data.poliza)
      .set('P_NNUMPOINT', data.puntoVenta)
      .set('_', new Date().getTime().toString());
    const url = `${this.apiUri}/StockManagement/Core/PA_SEL_SALE_POINT`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }

  changeState(data: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NPOLICY', data.poliza)
      .set('P_SCLIENT', data.cliente)
      .set('P_SACTIVATE', data.state)
      .set('P_NPOLICYFATHER', data.polizaPadre)
      .set('P_DEXPIRDAT', data.expireDate)
      .set('P_SUSUCRE', data.user)
      .set('P_STATEBEFORE', data.state === 0 ? '1' : '0');
    const url = `${this.apiUri}/StockManagement/ChannelState/PA_UPD_CHANNEL`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }

  reporte(data?: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NTYPECHANNEL', data?.tipoCanal || 0)
      .set('P_NPOLICY', data?.poliza || 0)
      .set('P_NPOLICYSTATE', data?.estadoPoliza || -1)
      .set('P_NTYPEDOC', data?.tipoDocumento || 0)
      .set('P_NNRODOC', data?.numeroDocumento || 0)
      .set('P_SNOMBRES', data?.nombres || '');
    const url = `${this.apiUri}/StockManagement/Reports/PA_SEL_CHANNEL_FILTER_REPORT_GET`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }
  updateStock(data: any): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('P_NPOLICY', data.poliza)
      .set('P_NNUMPOINT', data.puntoVenta)
      .set('P_NSTOCKMIN', data.minStock)
      .set('P_NSTOCKMAX', data.maxStock)
      .set('P_NPERCREJECTION', data.porcentajeRechazo)
      .set('P_NUSERREGISTER', data.userName)
      .set('P_NOPCION', '0')
      .set('P_SACTIVATE', '1');
    const url = `${this.apiUri}/StockManagement/Core/PA_UPD_STOCKMINMAX`;
    const api = this._http.get(url, { params: params });
    return this.callApi(api);
  }
}
