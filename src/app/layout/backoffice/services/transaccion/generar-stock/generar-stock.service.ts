import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app.config';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import * as SDto from './DTOs/generarStock.dto';
import * as CDto from '../../../components/transaction/generar-stock/DTOs/generarStock.dto';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root',
})
export class GenerarStockService {
  private API_URI: string;
  private CURRENT_USER_ID: any;
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.BACKOFFICE_API;
    this.CURRENT_USER_ID = JSON.parse(localStorage.getItem('currentUser'));
    this.CURRENT_USER_ID = this.CURRENT_USER_ID.id;
  }

  exportarExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'Nro. Pedido',
          B: 'Producto',
          C: 'Fec. Creación',
          D: 'Cantidad',
          E: 'Almacén Protecta',
          F: 'Almacén Proveedor',
          G: 'Estado',
          H: 'Fec. Estado',
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
        A: json[i].NNUMREG,
        B: json[i].S_PRODUCTO,
        C: json[i].D_FCREACION,
        D: json[i].NQUANTITY,
        E: json[i].N_ALMACENPROTECTA,
        F: json[i].N_ALMACENPROVEEDOR,
        G: json[i].S_ESTADO,
        H: json[i].D_FESTADO,
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

  // id = 1615399313125
  tipoPolizaData(): Observable<SDto.TipoPolizaDto> {
    const $GET: Observable<any> = this._http.get(
      `${this.API_URI}/StockCertificates/Core/CertificateType_Ddl_Load`
    );
    return $GET;
  }
  statusPoliza(NSTATUSPOL: number): Observable<SDto.StatusPolizaDto> {
    const $GET: Observable<any> = this._http.get(
      `${this.API_URI}/StockCertificates/Core/DDLSTATE_LOAD?NSTATUSPOL=${NSTATUSPOL}`
    );
    return $GET;
  }
  generarRangoPoliza(
    data: CDto.GenerarRangoPolizaDto
  ): Observable<SDto.GenerarRangoPolizaDto> {
    data.P_NREGUSER = this.CURRENT_USER_ID;
    // tslint:disable-next-line:max-line-length
    const $GET: Observable<any> = this._http.get(
      // tslint:disable-next-line:max-line-length
      `${this.API_URI}/StockCertificates/Core/PA_STOCK_GENERATION?P_NTIPPOL=${data.P_NTIPPOL}&P_NQUANTITY=${data.P_NQUANTITY}&P_NREGUSER=${data.P_NREGUSER}`
    );
    return $GET;
  }
  generarPoliza(data: CDto.GenerarPolizaDto): Observable<SDto.ResPolizaDto> {
    data.P_NREGUSER = this.CURRENT_USER_ID;
    // tslint:disable-next-line:max-line-length
    const $GET: Observable<any> = this._http.get(
      // tslint:disable-next-line:max-line-length
      `${this.API_URI}/StockCertificates/Core/PA_STOCK_SAVE?P_NTIPPOL=${data.P_NTIPPOL}&P_NQUANTITY=${data.P_NQUANTITY}&P_NREGUSER=${data.P_NREGUSER}&P_NPOLES_INI=${data.P_NPOLES_INI}&P_NPOLES_FIN=${data.P_NPOLES_FIN}`
    );
    return $GET;
  }
  polizaData(): Observable<SDto.PolizaDto> {
    // tslint:disable-next-line:max-line-length
    const $GET: Observable<any> = this._http.get(
      `${this.API_URI}/StockCertificates/Core/PA_SEL_STOCK`
    );
    return $GET;
  }
  PolizaDataWithParams(
    data: CDto.PolizaDataWithParamDto
  ): Observable<SDto.PolizaDto> {
    // tslint:disable-next-line:max-line-length
    const $GET: Observable<any> = this._http.get(
      // tslint:disable-next-line:max-line-length
      `${this.API_URI}/StockCertificates/Core/PA_SEL_STOCK?P_NTIPPOL=${data.P_NTIPPOL}&P_DFCREABEGIN=${data.P_DFCREABEGIN}&P_DFCREAEND=${data.P_DFCREAEND}`
    );
    return $GET;
  }
  cambiarStatusPoliza(
    data: CDto.ChangeStatusPoliza
  ): Observable<SDto.ResPolizaDto> {
    // tslint:disable-next-line:max-line-length
    const $GET: Observable<any> = this._http.get(
      `${this.API_URI}/StockCertificates/Core/PA_STOCK_CHANGE_STATE?P_NSTATUSPOL=${data.P_NSTATUSPOL}&P_NNUMREG=${data.P_NNUMREG}`
    );
    return $GET;
  }
}
