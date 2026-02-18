import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { request } from 'http';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../shared/services/api.service';
import { BenefitResponse } from '../models/benefit-response';
import { ComparisonRequest } from '../models/comparison-request';
import { CoverageResponse } from '../models/coverage.model';
import { PlanRequest } from '../models/plan-request';
import { PlanResponse } from '../models/plan-response';
import { ServiceResponse } from '../models/service-response';
import { UserDocumentRequest } from '../models/user-document-request';
import { UserDocumentResponse } from '../models/user-document-response';
import { UserInfoRequest } from '../models/user-info-request';
import { userDerivation } from '../models/user-derivation.model';
import { StatusDocumentRequest } from '../models/status-document-request';
import { IClientState } from '../interfaces/client-state.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientInfoService {
  private apiUrlPD: string = AppConfig.PD_API;
  private apiUrlWSPD: string = AppConfig.WSPD_API;

  constructor(
    private readonly apiService: ApiService,
    private readonly http: HttpClient
  ) {}

  public saveClientDocument(
    // tslint:disable-next-line:no-shadowed-variable
    request: UserDocumentRequest
  ): Observable<UserDocumentResponse> {
    return this.apiService.post('AccidentesPersonales/paso1', request).pipe(
      map((response) => {
        return new UserDocumentResponse(
          response.cliente ?? { idProcess: response.idProcess }
        );
      })
    );
  }

  // tslint:disable-next-line:no-shadowed-variable
  public saveClient(request: UserInfoRequest) {
    return this.apiService.post('AccidentesPersonales/paso2', request).pipe(
      map((response) => {
        console.log(response);
        return response;
      })
    );
  }

  public getCountries(): Observable<Array<{ label: string; value: string }>> {
    return this.apiService
      .get('AccidentesPersonales/Paises')
      .pipe(map((response) => response));
  }

  public getValidityTypes(
    productId: string
  ): Observable<Array<{ id: string; description: string }>> {
    return this.apiService.get(
      `AccidentesPersonales/TipoVigencia/${productId}`
    );
  }

  public getPaymentFrequencies(
    productId: string
  ): Observable<Array<{ id: string; description: string }>> {
    return this.apiService.get(
      `AccidentesPersonales/FrecuenciaPago/${productId}`
    );
  }

  public getActivities(
    productId: string
  ): Observable<Array<{ id: string; description: string }>> {
    return this.apiService.get(`AccidentesPersonales/Actividades/${productId}`);
  }

  public getActivitiesBySegment(payload: {
    IdProceso: number;
    IdMoneda: number;
  }): Observable<Array<{ id: number; description: string }>> {
    const url = `${this.apiUrlPD}/AccidentesPersonales/actividades/segmento`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  public getTemporality(): Observable<
    Array<{ id: string; descripcion: string }>
  > {
    return this.apiService
      .get('AccidentesPersonales/Temporalidades')
      .pipe(map((response) => response.temporalidad));
  }

  public getScopes(): Observable<Array<{ id: string; descripcion: string }>> {
    return this.apiService
      .get('AccidentesPersonales/Alcances')
      .pipe(map((response) => response.alcance));
  }

  // tslint:disable-next-line:no-shadowed-variable
  public getPlans(request: any) {
    const fd = new FormData();

    fd.set('IdProceso', JSON.stringify(request.processId));
    fd.set('Seguro', JSON.stringify(request.seguro));
    fd.set('Asegurados', JSON.stringify(request.insurances));
    fd.set('Beneficiarios', JSON.stringify(request.benefits));
    fd.set('fileattach', request.fileAttach);

    const url = `${this.apiUrlPD}/AccidentesPersonales/planes`;
    return this.http.post(url, fd).pipe(
      map((response: any) => ({
        success: response.success,
        errorMessage: response.errorMessage,
        plans: response.planes?.map((p) => new PlanResponse(p)) || null,
        services:
          response.asistencias?.map((s) => new ServiceResponse(s)) || null,
        benefits:
          response.beneficios?.map((b) => new BenefitResponse(b)) || null,
        coverage:
          response.coberturas?.map((b) => new CoverageResponse(b)) || null,
        codigoComercio: response.codigoComercio,
        errores: response.errores ?? [],
        cantidadTrabajadores: response.cantidadAsegurados,
        cantidadBeneficiarios: response.cantidadBeneficiarios,
        reglaNegocio: response.reglaNegocio,
        archivo: response.archivo,
        nombreArchivo: response.nombreArchivo
      }))
    );
  }

  // tslint:disable-next-line:no-shadowed-variable
  public updatePlan(request: ComparisonRequest) {
    return this.apiService
      .post('AccidentesPersonales/CalcularPrima', request)
      .pipe(map((response) => response));
  }

  // tslint:disable-next-line:no-shadowed-variable
  public derivation(request: userDerivation) {
    const url = `${this.apiUrlWSPD}/notificacion/derivacion/asesor`;
    return this.http.post(url, request).pipe(map((response) => response));
  }

  public contactAdvisor(request: any): Observable<any> {
    const url = `${this.apiUrlWSPD}/notificacion/contacto`;
    return this.http
      .post(url, request)
      .pipe(map((response: any) => response.data));
  }

  public getClientID() {
    try {
      var cookie = this.getCookie('_ga').split('.');
      return cookie[2] + '.' + cookie[3];
    } catch (e) {
      console.log('No Universal Analytics cookie found');
    }
  }

  private getCookie(name: any) {
    var re = new RegExp(name + '=([^;]+)');
    var value = re.exec(document.cookie);
    return value != null ? unescape(value[1]) : '';
  }

  public getSessionID() {
    const pattern = /_ga_34TTLR6HF7=GS\d\.\d\.(.+?)(?:;|$)/;
    const match = document.cookie.match(pattern);
    const parts = match?.[1].split('.');
    return parts?.shift();
  }

  public isClientState(request: IClientState): Observable<any> {
    const url = `${this.apiUrlWSPD}/documento/ruc/estado`;
    return this.http
      .post(url, request)
      .pipe(map((response: any) => response.data));
  }
}
