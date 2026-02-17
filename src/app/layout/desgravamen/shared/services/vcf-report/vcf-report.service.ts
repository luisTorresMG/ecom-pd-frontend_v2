import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    HttpClient,
    HttpHeaders,
    HttpClientModule,
} from '@angular/common/http';
import { AppConfig } from '@root/app.config';

const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const PDF_EXTENSION = '.pdf';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Injectable({
  providedIn: 'root'
})
export class VcfReportService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;
  private UrlVCF = AppConfig.URL_API_REPORT;

  constructor(private http: HttpClient) { }

  public ProcessReserve(data: any): Observable<any> {
    const Json = {
        dStart_Date: data.dStart_Date,
        dExpir_Dat: data.dExpir_Dat,
    };
    return this.http.post(this.UrlVCF + 'Report/ReportReserveVCF', Json, {
        headers: this.headers,
    });
}

}
