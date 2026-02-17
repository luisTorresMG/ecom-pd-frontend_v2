import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import 'rxjs/add/operator/catch';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { DischargeReport } from '../../models/dischargereport/dischargereport';
import {
    BaseFilter,
    BusquedaDescargoRequest,
} from '../../models/basefilter/basefilter';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class DischargeReportService {
    public token: string;
    public firstName: string;
    public lastName: string;
    public canal: string;
    public puntoVenta: string;
    public desCanal: string;
    public desPuntoVenta: string;
    public tipoCanal: string;
    private urlApi: string;
    // public menu: Features[] = [];
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    constructor(
        private http: HttpClient,
        private config: AppConfig,
        private sessionStorageService: SessionStorageService
    ) {
        this.urlApi = AppConfig.BACKOFFICE_API;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
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

    getDischargeReport(baseFilter: BaseFilter) {
        const body = JSON.stringify(baseFilter);
        return this.http
            .post(this.config.apiUrl + '/DischargeReport/getDischargeReport', body, {
                headers: this.headers,
            })
            .map(
                (response) => response,
                (error) => {
                    console.log(error);
                }
            );
    }

    listar(datos: BusquedaDescargoRequest) {
        const parametros = new HttpParams()
            .set('filterscount', datos.filterscount)
            .set('groupscount', datos.groupscount)
            .set('pagenum', datos.pagenum)
            .set('pagesize', datos.pagesize)
            .set('recordstartindex', datos.recordstartindex)
            .set('recordendindex', datos.recordendindex)
            .set('P_NNUMLOT', datos.P_NNUMLOT)
            .set('_', datos._);
        const url = this.urlApi + '/ReportDischarge/Core/ListReporteDischarge';
        const call = this.http.get(url, { params: parametros });
        return this.llamarApi(call);
    }

    exportarExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Lote',
                    C: 'Póliza',
                    D: 'Estado',
                    E: 'Origen',
                    F: 'Usuario',
                    G: 'Fecha de creación',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].SDESCHANNEL,
                B: json[i].NNUMLOT,
                C: json[i].NPOLICY,
                D: json[i].SDESCRIPT,
                E: json[i].SORIGEN,
                F: json[i].SUSER,
                G: json[i].DCOMPDATE,
            };
            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2' });
        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array',
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }
}
