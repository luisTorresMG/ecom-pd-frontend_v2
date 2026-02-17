import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SystemTypesModel } from '../../models/seguridad/system-types.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProfilesOfType } from '../../models/seguridad/profiles/profiles-of-type.model';
import { ProfilesResponse } from '../../models/seguridad/profiles/profiles.model';
@Injectable({
  providedIn: 'root',
})
export class UserRegisterService {
  private apiUrl: string = AppConfig.BACKOFFICE_API;
  private apiUrlRegist: string = AppConfig.PD_API;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private readonly _http: HttpClient) {}

  profiles(): Observable<SystemTypesModel> {
    const params: HttpParams = new HttpParams()
      .set('S_TYPE', 'TYPE_SYSTEM')
      .set('_', `${new Date().getTime()}`);

    const url = `${this.apiUrl}/Request/Request/Certificate`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new SystemTypesModel(res)));
  }

  profilesOfTypes(id: number): Observable<ProfilesOfType> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDSYSTEM', `${id}`)
      .set('_', `${new Date().getTime()}`);

    const url = `${this.apiUrl}/User/Emergente/ProfileRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new ProfilesOfType(res)));
  }

  searchProfiles(data: any): Observable<ProfilesResponse> {
    const page = data.currentPage > 0 ? data.currentPage - 1 : 0;
    const params: HttpParams = new HttpParams()
      .set('filterscount', '0')
      .set('groupscount', '0')
      .set('pagenum', `${page}`)
      .set('pagesize', '8')
      .set('recordstartindex', `${page * 8}`)
      .set('recordendindex', `${page * 8 + 8}`)
      .set('P_SNAME', data.name || '')
      .set('P_NIDPROFILES', data.profile || '')
      .set('P_NPOLICYS', data.channelSale || '')
      .set('P_NSALEPOINTS', data.pointSale || '')
      .set('P_NIDSYSTEM', data.profileType || '')
      .set('_', `${new Date().getTime()}`);

    const url = `${this.apiUrl}/User/User/UserRead`;
    const api = this._http.get(url, { params: params });
    return api.pipe(map((res: any) => new ProfilesResponse(res)));
  }

  validateUser(data: any): Observable<number> {
    const params: HttpParams = new HttpParams()
      .set('P_NIDPROFILE', data.profileId)
      .set('P_SUSER', data.user)
      .set(
        'P_SNAME',
        `${data.apePat || ''} ${data.apeMat || ''} ${data.name || ''}`.trim()
      )
      .set('P_SLASTNAME', data.apePat)
      .set('P_SSEX', data.sex)
      .set('P_SADDRESS', data.address)
      .set('P_SEMAIL', data.email)
      .set('P_SCELLPHONE', data.phone || '')
      .set('P_NUSERREGISTER', data.userId)
      .set('P_SFIRSTNAME', data.name)
      .set('P_SPASSWORD', data.password)
      .set('P_SDNI', data.documentNumber)
      .set('P_STIP_DOC', data.documentType)
      .set('P_NPROVINCE', data.department)
      .set('P_NLOCAL', data.province)
      .set('P_NMUNICIPALITY', data.district)
      .set('P_SLASTNAME2', data.apeMat)
      .set('P_NPOLICY', data.channelSale)
      .set('P_NNUMPOINT', data.pointSale)
      .set('P_NIDSYSTEM', data.systemType)
      .set(
        'P_NIDPRODUCTS',
        data.products
          .filter((x) => x.active)
          .map((val) => val.id)
          .join(',')
      )
      .set(
        'P_NIDPROFILE_SCTR',
        data.sctrProfile ||
          data.vidaLeyProfile ||
          data.desgravamenProfile ||
          data.otrosRamosProfile ||
          data.accidentesPersonalesProfile ||
          data.covidGrupalProfile ||
          data.vidaGrupoProfile ||
          data.vidaDevolucionProtectaProfile ||
          data.backOfficeProfile ||
          data.qrProfile ||
          data.vidaIndividualLargoPlazoProfile ||
          data.vdpProfile ||
          data.desgravamenDevolucionProfile ||
          data.operacionesProfile ||
          data.devolucionesProfile
      );
    const url = `${this.apiUrl}/User/Emergente/UserValidate`;

    return this._http
      .get(url, { params: params })
      .map((response: any) => +response.PA_VAL_USER.P_VAL as number);
  }

  insertCliente360(data: any): Observable<any> {
    const fd: FormData = new FormData();
    const payload = {
      idCliente: data.idUsuarioCliente360,
      nombreClienteSistema: data.user,
      contraseña: data.password,
      nombreCompleto: `${data.apePat || ''} ${data.apeMat || ''} ${
        data.name || ''
      }`.trim(),
      codigoClienteRegistro: data.userId,
      fechaInicio: data.fechaInicio,
      fechaFinal: data.fechaFinal,
      estado: 1,
      idRol: data.rolUsuario,
      idClienteActualizar: 1,
    };
    const url = `${this.apiUrlRegist}/Backoffice/cliente360/agregar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response: any) => response);
  }

  insertUser(data: any): Observable<any> {
    const fd: FormData = new FormData();
    const profiles = [];
    const payload = {
      nombreUsuario: data.user,
      sexo: data.sex,
      direccion: data.address,
      correo: data.email,
      telefono: data.cellphone || '',
      celular: data.phone || '',
      activo: '1',
      primerNombre: data.name,
      primerApellido: data.apePat,
      segundoApellido: data.apeMat,
      nombreCompleto: `${data.apePat || ''} ${data.apeMat || ''} ${
        data.name || ''
      }`.trim(),
      contraseña: data.password,
      tipoDocumento: data.documentType,
      numeroDocumento: data.documentNumber,
      departamento: data.department,
      provincia: data.province,
      distrito: data.district,
      poliza: data.channelSale,
      puntoVenta: data.pointSale,
      idSistema: data.systemType,
      codigoUsuario: data.userId,
      dataProductoPerfil: data.dataProductoPerfil,
    };
    const url = `${this.apiUrlRegist}/Backoffice/seguridad/agregar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  focusUserName(data: any): Observable<any> {
    const fd: FormData = new FormData();
    const payload = {
      nombreUsuario: data.user,
      idSistema: +data.idSistema,
    };
    const url = `${this.apiUrlRegist}/Backoffice/usuario/validador`;

    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  ListUsersPro(data?: any): Observable<any> {
    const fd: FormData = new FormData();
    let payload = {
      nombreUsuarioSistema: null,
      estado: '2',
      nombreCompleto: null,
      numeroDocumento: null,
      canalVenta: 0,
      idSistema: 0,
    };
    if (!!data) {
      payload = {
        nombreUsuarioSistema: data.usuarioFiltro || null,
        estado: data.estadoFiltro || '2',
        nombreCompleto: data.nombreFiltro || null,
        numeroDocumento: data.dniFiltro || null,
        canalVenta: data.canalVenta,
        idSistema: data.profileType || 0,
      };
    }

    const url = `${this.apiUrlRegist}/Backoffice/usuario/listado`;

    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  dataEditUser(data: any): Observable<any> {
    const fd: FormData = new FormData();
    const payload = {
      idUsuario: data.idUser,
    };
    const url = `${this.apiUrlRegist}/Backoffice/usuario/informacion`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  disableUser(data: any): Observable<any> {
    const payload = {
      idSistema: data.idSistema,
      idUsuario: data.idUsuario || data.idCliente,
      idUsuarioActualizador: data.idUsuarioActualizador,
      estado: data.estado,
    };
    const url = `${this.apiUrlRegist}/Backoffice/usuario/habilitar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  disableCliente(data: any): Observable<any> {
    const payload = {
      idCliente: data.idCliente,
      codigoUsuarioRegistra: data.idUsuarioActualizador,
      estado: data.estado,
    };

    const url = `${this.apiUrlRegist}/Backoffice/cliente360/deshabilitar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  productProfiles(data?: any): Observable<any> {
    const payload = {
      idProducto: data?.idProducto || 0,
    };

    const url = `${this.apiUrlRegist}/Backoffice/usuario/producto/perfil`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  dataCliente360(data?: any): Observable<any> {
    const payload = {
      idCliente: data?.idUser || 0,
    };

    const url = `${this.apiUrlRegist}/Backoffice/usuario/cliente`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  editarCliente360(data: any): Observable<any> {
    const payload = {
      idCliente: data.idCliente360Edit,
      nombreClienteSistema: data.user,
      nombreCompleto: `${data.apePat || ''} ${data.apeMat || ''} ${
        data.name || ''
      }`.trim(),
      fechaFinal: data.fechaFinal,
      idRol: data.rolUsuario,
      idClienteActualizar: data.userId,
      idSistema: 0,
    };

    const url = `${this.apiUrlRegist}/Backoffice/cliente360/editar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  cambiarContraseñaUsuario(data: any): Observable<any> {
    const payload = {
      idUsuario: data.idUsuario,
      contraseña: data.nuevaContraseña,
      idUsuarioActualizador: data.idUsuarioActualizador,
    };

    const url = `${this.apiUrlRegist}/Backoffice/usuario/cambio/contraseña`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  cambiarContraseñaCliente(data: any): Observable<any> {
    const payload = {
      idCliente: data.idUsuario,
      contraseña: data.nuevaContraseña,
      idUsuarioActualizador: data.idUsuarioActualizador,
    };

    const url = `${this.apiUrlRegist}/Backoffice/cliente360/cambio/contraseña`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }

  editarUsuarioPro(data: any): Observable<any> {
    const payload = {
      idUsuario: +data.idUsuarioProEdit,
      nombreUsuarioSistema: data.user,
      sexo: data.sex,
      direccion: data.address,
      correo: data.email,
      telefono: data.cellphone || '',
      celular: data.phone || '',
      activo: '1',
      primerNombre: data.name,
      primerApellido: data.apePat,
      segundoApellido: data.apeMat,
      nombreCompleto: `${data.apePat || ''} ${data.apeMat || ''} ${
        data.name || ''
      }`.trim(),
      contraseña: data.password,
      tipoDocumento: data.documentType,
      numeroDocumento: data.documentNumber,
      departamento: data.department,
      provincia: data.province,
      distrito: data.district,
      poliza: data.channelSale,
      puntoVenta: data.pointSale,
      idSistema: data.systemType,
      codigoUsuario: data.userId,
      dataProductoPerfil: data.dataProductoPerfil,
    };

    const url = `${this.apiUrlRegist}/Backoffice/usuario/actualizar`;
    return this._http
      .post(url, payload, { headers: this.headers })
      .map((response) => response);
  }
}
