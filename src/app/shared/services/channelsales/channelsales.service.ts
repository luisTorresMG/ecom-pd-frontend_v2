import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ChannelSales } from '../../models/channelsales/channelsales';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ChannelSalesService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient, private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }

  exportarExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'N° Certificado',
          B: 'Fecha de entrega',
          C: 'D.Pdtes',
          D: 'Tipo de uso',
          E: 'Canal de venta',
          F: 'Punto de venta',
          G: 'Estado real',
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
        A: json[i].certificado,
        B: json[i].fE_ENTREGA,
        C: json[i].dptes,
        D: json[i].tipO_USO,
        E: json[i].canaL_VENTA,
        F: json[i].puntO_VENTA,
        G: json[i].estadO_REAL,
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
  getPostChannelSales(channelSales: ChannelSales) {
    const body = JSON.stringify(channelSales);
    return this.http
      .post(this._baseUrl + '/ChannelSales/', body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getCanalTipoPago(channel: string) {
    const endpoint = 'codechannel';
    const action = 'obtenertipopagocanal';
    const url = `${endpoint}/${action}/${channel}`;
    return this.http.get(url);
  }

  getComprobantes(payload: any) {
    const url = `${this._baseUrl}/Comprobante/listado`;
    return this.http.post(url, {...payload, noBase64: true});
  }

  getComprobantesForAdmin(payload) {
    const url = `${this._baseUrl}/Comprobante/obtener/reporte`;
    return this.http.post(url, payload);
  }

  getSalesDashboard(Canal: number, Desde: string, Hasta: string) {
    return this.http
      .post(this._baseUrl + '/PlataformaPanel/getSalesDashboard', {
        Canal: Canal,
        Desde: Desde,
        Hasta: Hasta,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
}
