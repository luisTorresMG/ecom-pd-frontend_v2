import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as SDto from './DTOs/asignar-solicitud.dto';
import * as CDto from '../../../components/transaction/asignar-solicitud/DTOs/asignarSolicitud.dto';
import { Observable } from 'rxjs';
import { BuscarRequest } from '../../../models/transaccion/asignar-solicitud/asignar-solicitud.model';
@Injectable({
  providedIn: 'root',
})
export class AsignarSolicitudService {
  private API_URI: string;
  private CURRENT_USER_ID: any;
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.BACKOFFICE_API;
    this.CURRENT_USER_ID = JSON.parse(localStorage.getItem('currentUser'));
    this.CURRENT_USER_ID = this.CURRENT_USER_ID.id;
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

  polizasData(datos: BuscarRequest) {
    const parametros = new HttpParams()
      .set('filterscount', datos.filterscount)
      .set('groupscount', datos.groupscount)
      .set('pagenum', datos.pagenum)
      .set('pagesize', datos.pagesize)
      .set('recordstartindex', datos.recordstartindex)
      .set('recordendindex', datos.recordendindex)
      .set('P_NIDREQUEST', datos.P_NIDREQUEST)
      .set('P_SCLIENAME', datos.P_SCLIENAME)
      .set('P_NPOLICYS', datos.P_NPOLICYS)
      .set('P_NSALEPOINTS', datos.P_NSALEPOINTS)
      .set('P_NSTATUS', datos.P_NSTATUS)
      .set('P_DFCREABEGIN', datos.P_DFCREABEGIN)
      .set('P_DFCREAEND', datos.P_DFCREAEND)
      .set('P_NCODUSER', datos.P_NCODUSER)
      .set('_', datos._);
    const url = this.API_URI + '/Assign/Assign/Assign/';
    const call = this._http.get(url, { params: parametros });
    return this.llamarApi(call);
  }
  canalVentaData(): Observable<SDto.CanalVentaDto> {
    const URL = `${this.API_URI}/Assign/Assign/PolicyRead`;
    const GET$ = this._http.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.CanalVentaDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  puntoVentaData(data: CDto.PuntoVentaDto): Observable<SDto.PuntoVentaDto> {
    const params = new HttpParams().set(
      'P_NPOLICYS',
      data.P_NPOLICYS.toString()
    );
    const URL = `${this.API_URI}/Assign/Assign/SalePointRead`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.PuntoVentaDto> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.PuntoVentaDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  puntoVentaNewPolicyData(
    data: CDto.PuntoVentaDto
  ): Observable<SDto.PuntoVentaDto> {
    const params = new HttpParams()
      .set('P_NPOLICY', data.P_NPOLICYS.toString())
      .set('P_NUSER', this.CURRENT_USER_ID);
    const URL = `${this.API_URI}/Request/Request/SalePointReadRequest`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.PuntoVentaDto> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.PuntoVentaDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  statusPolizaData(): Observable<SDto.StatusPolicy> {
    const params = new HttpParams().set('S_TYPE', 'REQUEST STATUS');
    const URL = `${this.API_URI}/Assign/Assign/Status`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.StatusPolicy> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.StatusPolicy) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  tipoCertificados(): Observable<SDto.TipoCertificadosDto> {
    const params = new HttpParams().set('S_TYPE', 'TYPECERTIF');
    const URL = `${this.API_URI}/Request/Request/Certificate`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.TipoCertificadosDto> = new Observable(
      (obs) => {
        GET$.subscribe(
          (res: SDto.TipoCertificadosDto) => {
            obs.next(res);
            obs.complete();
          },
          (err: any) => {
            obs.error(err);
          }
        );
      }
    );
    return DATA$;
  }

  polizasDataWhitParam(
    data: CDto.PolizasDataDto
  ): Observable<SDto.PolizasDataDto> {
    const params = new HttpParams()
      .set('P_NIDREQUEST', data.P_NIDREQUEST.toString())
      .set('P_NPOLICYS', data.P_NPOLICYS.toString())
      .set('P_NSALEPOINTS', data.P_NSALEPOINTS.toString())
      .set('P_NSTATUS', data.P_NSTATUS.toString())
      .set('P_DFCREABEGIN', data.P_DFCREABEGIN.toString())
      .set('P_DFCREAEND', data.P_DFCREAEND.toString());
    const URL = `${this.API_URI}/Assign/Assign/Assign`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.PolizasDataDto> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.PolizasDataDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  validateRequest(
    data: CDto.ValidateRequestDto
  ): Observable<SDto.ValidateRequestDto> {
    const params = new HttpParams()
      .set('P_NIDREQUEST', data.P_NIDREQUEST.toString())
      .set('P_NPOLICY', data.P_NPOLICY.toString())
      .set('P_NNUMPOINT', data.P_NNUMPOINT.toString())
      .set('P_AMOUNT', data.P_AMOUNT.toString())
      .set('P_NTIPPOL', data.P_NTIPPOL.toString());
    const URL = `${this.API_URI}/Request/Request/ValidateRequest`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.ValidateRequestDto> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.ValidateRequestDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  generarNuevaSolicitud(
    data: CDto.NuevaSolicitudDto
  ): Observable<SDto.NuevaSolicitud> {
    const URL = `${this.API_URI}/Request/Request/InsertRequest`;
    data.P_NUSERREGISTER = this.CURRENT_USER_ID;
    const GET$ = this._http.post(URL, data);
    const DATA$: Observable<SDto.NuevaSolicitud> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.NuevaSolicitud) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  validateRejection(id): Observable<SDto.ValidateRejectionMasiveDto> {
    const formData: FormData = new FormData();
    formData.append('objParametros[0][P_NIDREQUEST]', id);
    // tslint:disable-next-line:max-line-length
    const POST$ = this._http.post(
      `${this.API_URI}/Request/Request/ValidateRejectionMasive`,
      formData
    );
    const DATA$: Observable<SDto.ValidateRejectionMasiveDto> = new Observable(
      (obs) => {
        POST$.subscribe(
          (res: SDto.ValidateRejectionMasiveDto) => {
            console.log(res);
            obs.next(res);
            obs.complete();
          },
          (err: any) => {
            console.log(err);
            obs.error(err);
          }
        );
      }
    );
    return DATA$;
  }
  updateRequestMasive(
    data: CDto.UpdateRequestMasive
  ): Observable<SDto.UpdateRequestMasive> {
    const formData: FormData = new FormData();
    formData.append('requests[0][P_NIREQUEST]', data.P_NIREQUEST.toString());
    formData.append('requests[0][P_NUSERREGISTER]', this.CURRENT_USER_ID);
    formData.append('requests[0][P_NSTATE]', data.P_NSTATE.toString());
    const POST$ = this._http.post(
      `${this.API_URI}/Request/Request/UpdateRequestMassive`,
      formData
    );
    const DATA$: Observable<SDto.UpdateRequestMasive> = new Observable(
      (obs) => {
        POST$.subscribe(
          (res: SDto.UpdateRequestMasive) => {
            obs.next(res);
            obs.complete();
          },
          (err: any) => {
            obs.error(err);
          }
        );
      }
    );
    return DATA$;
  }
  cantidadAsignada(data: CDto.CantidadAsignadaDto): Observable<SDto.LoteRango> {
    const params = new HttpParams().set(
      'P_IDREQUEST',
      data.P_IDREQUEST.toString()
    );
    const URL = `${this.API_URI}/Assign/Assign/QuantityAsiggRead`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.LoteRango> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.LoteRango) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  generarRango(data: CDto.LoteRangoDto): Observable<SDto.LoteRango> {
    const params = new HttpParams()
      .set('P_QUANTITY', data.P_QUANTITY.toString())
      .set('P_NPRODUCT', data.P_NPRODUCT.toString())
      .set('P_USER', this.CURRENT_USER_ID)
      .set('P_IDREQUEST', data.P_IDREQUEST.toString());
    const URL = `${this.API_URI}/Assign/Assign/RangeRead`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.LoteRango> = new Observable((obs) => {
      GET$.subscribe(
        (res: SDto.LoteRango) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  grabarDatosLote(
    data: CDto.ValidatePolesPDto
  ): Observable<SDto.ValidatePolesPDto> {
    const params = new HttpParams()
      .set('P_NPOLESP_INI', data.P_NPOLESP_INI.toString())
      .set('P_NPRODUCT', data.P_NPRODUCT.toString())
      .set('P_USER', this.CURRENT_USER_ID);
    const URL = `${this.API_URI}/Assign/Assign/ValidatePolesp`;
    const GET$ = this._http.get(URL, { params: params });
    const DATA$ = new Observable<SDto.ValidatePolesPDto>((obs) => {
      GET$.subscribe(
        (res: SDto.ValidatePolesPDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  rangeVal(data: CDto.RangeValDto): Observable<SDto.RangoValDto> {
    const params = new HttpParams()
      .set('P_QUANTITY', data.P_QUANTITY.toString())
      .set('P_NPRODUCT', data.P_NPRODUCT.toString())
      .set('P_INI', data.P_INI.toString())
      .set('P_FIN', data.P_FIN.toString())
      .set('P_USER', this.CURRENT_USER_ID);
    const URL = `${this.API_URI}/Assign/Assign/RangeVal`;
    const POST$ = this._http.get(URL, { params: params });
    const DATA$: Observable<SDto.RangoValDto> = new Observable((obs) => {
      POST$.subscribe(
        (res: SDto.RangoValDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
  insertAssign(data: CDto.GrabarLoteDto): Observable<SDto.InsertAssignDto> {
    const formData = new FormData();
    formData.append('P_NIDPOLICY', data.P_NIDPOLICY.toString());
    formData.append('P_NPOLINI', data.P_NPOLINI.toString());
    formData.append('P_NPOLFIN', data.P_NPOLFIN.toString());
    formData.append('P_NUSERREGISTER', data.P_NUSERREGISTER.toString());
    formData.append('P_NTIPPOL', data.P_NTIPPOL.toString());
    formData.append('P_IDREQUEST', data.P_IDREQUEST.toString());
    formData.append('P_NNUMPOINT', data.P_NNUMPOINT.toString());
    formData.append('P_NQUANTITY', data.P_NQUANTITY.toString());
    formData.append('P_NAMOUNTCOVERED', data.P_NAMOUNTCOVERED.toString());
    formData.append('P_NPRODUCT', data.P_NPRODUCT.toString());
    const URL = `${this.API_URI}/Assign/Assign/InsertAssign`;
    const POST$ = this._http.post(URL, formData);
    const DATA$: Observable<SDto.InsertAssignDto> = new Observable((obs) => {
      POST$.subscribe(
        (res: SDto.InsertAssignDto) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }
}
