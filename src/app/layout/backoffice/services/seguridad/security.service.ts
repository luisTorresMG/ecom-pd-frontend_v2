import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { SystemTypesModel } from '../../models/seguridad/system-types.model';
import { SystemProductsModel } from '../../models/seguridad/system-products.model';
import { ProductsProfileModel } from '../../models/seguridad/products-profile.model';
import { RolesClientesModel } from '../../models/seguridad/roles-clientes.model';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private urlApi: string;
  private apiUrlRegist: string;
  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.apiUrlRegist = AppConfig.PD_API;
  }

  systemTypes(): Observable<SystemTypesModel> {
    const params: HttpParams = new HttpParams()
      .set('S_TYPE', 'TYPE_SYSTEM')
      .set('_', `${new Date().getTime()}`);
    const url = `${this.urlApi}/Request/Request/Certificate`;
    const api = this._http.get(url, { params: params });
    return api.pipe(
      map((res: any) => {
        const data = new SystemTypesModel(res);
        // console.log('SYSTEMAS --> ', data);
        // data.items = data.items.filter((x) => x?.id == 1);
        data.items = data.items?.map((val: any) => ({
          id: val.id,
          description: val.id == 2 ? 'CLIENTE 360' : 'PLATAFORMA DIGITAL',
          // description: val.id == 2 ? 'CLIENTE 360' : val.description,
          // description: PLATAFORMA DIGITAL,
        }));
        return data;
      })
    );
  }
  systemProducts(data: any): Observable<SystemProductsModel> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDSYSTEM', data.profileType)
      .set('_', new Date().getTime().toString());

    const url = `${this.urlApi}/User/Emergente/ProductRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new SystemProductsModel(res)));
  }
  productsProfile(data: any): Observable<ProductsProfileModel> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDSYSTEM', data.systemType)
      .set('P_NIDPRODUCT', data.productType);
    const url = `${this.urlApi}/User/Emergente/ProfileSCTRRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new ProductsProfileModel(res)));
  }

  rolesClientes(): Observable<RolesClientesModel> {
    // url Roles
    const url = `${this.apiUrlRegist}/Backoffice/cliente360/roles`;
    const api = this._http.get(url);
    return api.pipe(map((res: any) => new RolesClientesModel(res)));
  }

  canalVentasList(): Observable<any> {
    const req = {
      idCanalVenta: 0,
    };
    const url = `${this.apiUrlRegist}/Backoffice/usuario/canal/venta`;
    const api = this._http.post(url, req);
    return api.pipe(map((res: any) => res));
  }
  validationUser(request: any) {
    const url = `${this.apiUrlRegist}/vidaIndividual/intermedia/validacion`;
    return this._http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }
  submitNewUser(request: any) {
    const url = `${this.apiUrlRegist}/vidaIndividual/intermedia`;
    return this._http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }
  getSuperiorClass(id: any): Observable<any> {
    const url = `${this.apiUrlRegist}/vidaIndividual/intermedia/ejecutivo/${id}`;
    return this._http.get(url).pipe(map((response: any) => response));
  }
}
