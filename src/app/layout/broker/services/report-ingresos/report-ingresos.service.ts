import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { AppConfig } from '../../../../app.config';

export interface ReportCabIngresosBM {
  SID_REPORT?: string;
  NTYPE_REPORT?: number;
  SUSERNAME?: string;
  NUSERCODE?: number;
  DDATE_START_REPORT?: string;
  DDATE_END_REPORT?: string;
  NBRANCH?: number;
}

export interface ReportCabIngresosVM {
  NCODE: number;
  SMESSAGE: string;
  SID_REPORT?: string;
}

export interface ReportStatusIngresosBM {
  ID_REPORT?: string;
  NBRANCH?: number;
  DDATE_START_REPORT?: string;
  DDATE_END_REPORT?: string;
  NTYPE_REPORT?: number;
  P_SUSERNAME?: string;
}

export interface ReportStatusIngresosVM {
  SIDREPORT: string;
  SUSERNAME: string;
  DINIREP: string;
  DFINREP: string;
  NSTATUSPROC: number;
  NBRANCH: number;
  SBRANCH_NAME: string;
}

export interface FileReportIngresosBM {
  ID_REPORT: string;
}

export interface FileReportIngresosVM {
  FILE_CONTENT: string;
  FILE_NAME: string;
  SUCCESS: boolean;
  MESSAGE: string;
}

// REQ 13-08-2025 DVP - Validación de autorización granular
export interface AuthorizationCheckBM {
  SUSER: string;
  NIDRESOURCE: number;
}

export interface AuthorizationCheckVM {
  NAUTHORIZED: number; // 1=Autorizado, 0=No autorizado
  NCODE: number;       // 0=Success, 1=Error
  SMESSAGE: string;    // Mensaje descriptivo
}

@Injectable()
export class ReportIngresosService {
  
  private baseUrl = AppConfig.URL_API_SCTR; 
  
  constructor(private http: HttpClient) { }

  // Crear cabecera del reporte (dispara AppBackground)
  CreateReportIngresoCab(data: ReportCabIngresosBM): Observable<ReportCabIngresosVM> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ReportCabIngresosVM>(
      `${this.baseUrl}/ReportKuntur/CreateReportIngresoCab`, 
      data, 
      { headers }
    );
  }

  // Consultar estado del reporte
  GetStatusReportIngresos(data: ReportStatusIngresosBM): Observable<ReportStatusIngresosVM[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ReportStatusIngresosVM[]>(
      `${this.baseUrl}/ReportKuntur/GetStatusReportIngresos`, 
      data, 
      { headers }
    );
  }

  // Descargar archivo del reporte
  DownloadFileReportIngresos(data: FileReportIngresosBM): Observable<FileReportIngresosVM> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<FileReportIngresosVM>(
      `${this.baseUrl}/ReportKuntur/DownloadFileReportIngresos`, 
      data, 
      { headers }
    );
  }

  // Obtener listado de ramos (reutilizar endpoint existente)
  GetBranchList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ReportKuntur/branchPremiumReport?P_TIPO=R`);
  }

    CheckUserAuthorization(data: AuthorizationCheckBM): Observable<AuthorizationCheckVM> {
    // TEMPORAL:  siempre autorizar hasta que aprueben el despliegue en el back
    return of({
        NAUTHORIZED: 1,  // Siempre autorizado
        NCODE: 0,
        SMESSAGE: 'Acceso autorizado temporalmente'
    });
    
    /* ACTIVAR CUANDO BACKEND ESTÉ DESPLEGADO:
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<AuthorizationCheckVM>(
        `${this.baseUrl}/ReportKuntur/CheckUserAuthorization`, 
        data, 
        { headers }
    );
    */
    }
}