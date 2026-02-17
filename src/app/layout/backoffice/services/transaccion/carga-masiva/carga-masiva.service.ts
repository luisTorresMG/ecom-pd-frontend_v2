import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../../app.config';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as CDto from '../../../components/transaction/CargaMasiva/CargaMasiva-List/DTOs/CargaMasiva.dto';
import * as SDto from './DTOs/carga-masiva.dto';
import {
  ClientRequest,
  ClientResponse,
} from '../../../models/carga-masiva/client.model';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root',
})
export class CargaMasivaService {
  private CURRENT_USER_ID: any;
  private DATA_CARGA_MASIVA: SDto.DataCargaMasiva | null = null;
  private URI_API: string;
  constructor(private readonly _HttpClient: HttpClient) {
    this.CURRENT_USER_ID = JSON.parse(localStorage.getItem('currentUser'));
    this.CURRENT_USER_ID = this.CURRENT_USER_ID.id;
    this.URI_API = AppConfig.PD_API;
  }
  searchCargaMasiva(
    data: CDto.SearchCargaMasivaDto
  ): Observable<SDto.SearchCargaMasivaDto> {
    data.idUsuario = this.CURRENT_USER_ID;
    const URL = `${this.URI_API}/CargaMasiva/listado`;
    const POST$ = this._HttpClient.post(URL, data);
    const DATA$: Observable<SDto.SearchCargaMasivaDto> = new Observable(
      (obs) => {
        POST$.subscribe(
          (res: SDto.SearchCargaMasivaDto) => {
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
  searchHistory(
    data: CDto.SerchCargaMasivaHisDto
  ): Observable<SDto.SearchCargaMasivaHisDto> {
    const URL = `${this.URI_API}/CargaMasiva/historial/${data.idPoliza}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$: Observable<SDto.SearchCargaMasivaHisDto> = new Observable(
      (obs) => {
        GET$.subscribe(
          (res: SDto.SearchCargaMasivaHisDto) => {
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
  generarCargaMasiva(
    data: CDto.AddCargaMasiva
  ): Observable<SDto.DataCargaMasiva> {
    const formData = new FormData();
    formData.append('Canal', data.canalVenta.toString());
    formData.append('IdUsuario', this.CURRENT_USER_ID);
    formData.append('PuntoVenta', data.puntoVenta.toString());
    formData.append('fileattach', data.file);
    formData.append('Tdr', data.tdr);
    formData.append('Contratante', data.contratante);
    const URL = `${this.URI_API}/CargaMasiva/validartrama`;
    const POST$ = this._HttpClient.post(URL, formData);
    const DATA$: Observable<SDto.DataCargaMasiva> = new Observable((obs) => {
      POST$.subscribe(
        (res: SDto.DataCargaMasiva) => {
          localStorage.setItem('dataTrama', JSON.stringify(res));
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
  verDetalleTrama(id: number): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/${id}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  emitirCargaMasiva(id: number): Observable<boolean> {
    const data = {
      id: id,
    };
    const URL = `${this.URI_API}/CargaMasiva/Emision`;
    const POST$ = this._HttpClient.post(URL, data);
    const DATA$: Observable<boolean> = new Observable((obs) => {
      POST$.subscribe(
        (res: any) => {
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
  setDataCargaMasiva(data: SDto.DataCargaMasiva | null): void {
    this.DATA_CARGA_MASIVA = data;
  }
  getDataCargaMasiva(): SDto.DataCargaMasiva {
    return this.DATA_CARGA_MASIVA;
  }
  facturarCarga(data: any): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/Facturar`;
    const POST$ = this._HttpClient.post(URL, data);
    const DATA$ = new Observable((obs) => {
      POST$.subscribe(
        (res: any) => {
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
  descargarFactura(id: any): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/Comprobantes/${id}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$ = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  descargarExcel(id: any): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/Reporte/${id}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$ = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  exportarExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'ID Proceso',
          B: 'Canal de Venta',
          C: 'Fecha de Carga',
          D: 'Cantidad de Registros',
          E: 'Prima Total',
          F: 'Usuario',
          G: 'Estado',
        },
      ],
      {
        header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        skipHeader: true,
      }
    );

    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].idProceso,
        B: json[i].canal,
        C: json[i].fechaProceso,
        D: json[i].cantidadRegistro,
        E: 'S/. ' + json[i].primaTotal,
        F: json[i].usuario,
        G: json[i].estado,
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
  exportarExcelCargaMasiva(idCargaMasiva): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/Cotizacion/${idCargaMasiva}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
  descargarFormatoExcelCargaMasiva(): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/Estructura`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  descargarConstancia(id): Observable<any> {
    const URL = `${this.URI_API}/CargaMasiva/zip/${id}`;
    const GET$ = this._HttpClient.get(URL);
    const DATA$: Observable<any> = new Observable((obs) => {
      GET$.subscribe(
        (res: any) => {
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
  createCliente(data: ClientRequest): Observable<ClientResponse> {
    const url = `${this.URI_API}/cargamasiva/contratante`;
    const call: Observable<any> = this._HttpClient.post(url, data);
    const data$: Observable<ClientResponse> = new Observable((obs) => {
      call.subscribe(
        (res: any) => {
          obs.next(res);
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data$;
  }
}
