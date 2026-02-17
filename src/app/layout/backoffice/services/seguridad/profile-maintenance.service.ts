import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { ProfilesModel } from '../../models/seguridad/profiles/profiles.model';
import { map } from 'rxjs/operators';
import { SystemTypesModel } from '../../models/seguridad/system-types.model';
import { SystemProductsModel } from '../../models/seguridad/system-products.model';
import { IResource, ResourcesModel } from '../../models/seguridad/profiles/resources.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileMaintenanceService {

  private urlApi: string;

  constructor(
    private readonly _http: HttpClient
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
  }
  getProfiles(data: any): Observable<ProfilesModel> {
    const params = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', ((data.currentPage || 1) - 1).toString())
      .set('pagesize', data.itemsPerPage)
      .set('recordstartindex', (((data.currentPage || 1) - 1) * 10).toString())
      .set('recordendindex', ((((data.currentPage || 1) - 1) * 10) + 10).toString())
      .set('SNAME', data.name?.trim() || '')
      .set('SDESCRIPTION', data.description?.trim() || '')
      .set('P_NIDPRODUCT', data.productType || '')
      .set('P_NIDSYSTEM', data.profileType || '0')
      .set('_', new Date().getTime().toString());

    const url = `${this.urlApi}/Security/Core/profilesRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(
      map((res: any) => new ProfilesModel(res))
    );
  }
  getResourcesAll(data: any): Observable<ResourcesModel> {
    const params: HttpParams = new HttpParams()
      .set('filterslength', '0')
      .set('pagenum', '0')
      .set('pagesize', '10')
      .set('P_NIDSYSTEM', data.profileType || 0)
      .set('P_NIDPRODUCT', data.productType || '')
      .set('_', `${new Date().getTime()}`);
    const url = `${this.urlApi}/Security/Core/resourcesReadAll`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new ResourcesModel(res)));
  }
  getResourcesActive(data: any): Observable<ResourcesModel> {
    const params: HttpParams = new HttpParams()
      .set('NIDPROFILE', data.idProfile)
      .set('NIDSYSTEM', data.profileType || 0)
      .set('NIDPRODUCT', data.productType || 0);
    const url = `${this.urlApi}/Security/Core/resourcesRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new ResourcesModel(res)));
  }
  profileValidate(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NIDSYSTEM', data.idSystem);
    fd.set('P_NIDPRODUCT', data.productType);
    fd.set('SNAME', data.name);
    fd.set('SDESCRIPTION', data.description);
    if (data.type == 2) {
      fd.set('NUSERUPDATE', data.idUserUpdate);
      fd.set('NIDPROFILE', data.idProfile);
    } else {
      fd.set('NUSERREGISTER', data.idUserUpdate);
    }
    data.items.forEach(e => {
      fd.append('P_NIDRESOURCE_LIST[]', e);
    });
    const url = `${this.urlApi}/Security/Core/ProfileValidatePV`;
    const api = this._http.post(url, fd);
    return api.pipe(map((res: any) => ({
      code: res.result.P_NCODE,
      message: res.result.P_SMESSAGE
    })));
  }
  saveProfile(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('P_NIDSYSTEM', data.idSystem);
    fd.set('P_NIDPRODUCT', data.productType);
    fd.set('SNAME', data.name);
    fd.set('SDESCRIPTION', data.description);
    if (data.type == 2) {
      fd.set('NUSERUPDATE', data.idUserUpdate);
      fd.set('NIDPROFILE', data.idProfile);
    } else {
      fd.set('NUSERREGISTER', data.idUserUpdate);
    }
    data.items.forEach(e => {
      fd.append('P_NIDRESOURCE_LIST[]', e);
    });
    const type = `${data.type == 2 ? 'resourcesAssignPV' : 'ProfileInsPV'}`;
    const url = `${this.urlApi}/Security/Core/${type}`;
    const api = this._http.post(url, fd);
    return api.pipe(map((res: any) => ({
      code: res.result.P_NCODE,
      message: res.result.P_SMESSAGE
    })));
  }
}
