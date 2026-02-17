import { Injectable } from '@angular/core';
import { DatePipe, DecimalPipe, getLocaleDateTimeFormat } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { isNullOrUndefined } from 'util';
import { setSerialNumber } from '../../helpers/utils';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';
const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
    constructor(private datePipe: DatePipe, private decimalPipe: DecimalPipe) { }

    public exportReportSalesCF(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Estado',
                    J: 'Uso',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].sstatuS_POL_DES,
                J: json[i].suso,
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

    public exportReportSalesCV(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Estado',
                    J: 'Uso',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].sstatuS_POL_DES,
                J: json[i].suso,
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

    public exportReportCertificate(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Uso',
                    J: 'Punto de Venta',
                    K: 'Tipo Ingreso',
                    L: 'Estado Compra',
                    M: 'Estado Venta',
                    N: 'Nro Planilla',
                    O: 'Estado Planilla',
                    P: 'Departamento',
                    Q: 'Provincia',
                    R: 'Distrito',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].suso,
                J: json[i].spointname,
                K: json[i].sinputtype,
                L: json[i].stateoperation,
                M: json[i].sstatuS_POL_DES,
                N: json[i].nidpayroll,
                O: json[i].statepayroll,
                P: json[i].sprovince,
                Q: json[i].slocat,
                R: json[i].smunicipality,
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

    public exportReportCampaign(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. de Campaña',
                    B: 'Nro. Personas',
                    C: 'Descripción',
                    D: 'Canal de Venta',
                    E: 'Fecha Inicio',
                    F: 'Fecha Fin',
                    G: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].nidcampaign,
                B: json[i].ncountperson,
                C: json[i].sdescript,
                D: json[i].schanneldes,
                E: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                F: this.datePipe.transform(json[i].dexpirdate, 'dd/MM/yyyy'),
                G: json[i].sstatedes,
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

    public exportReportPayroll(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Ramo',
                    B: 'Producto',
                    C: 'Nro. de Planilla',
                    D: 'Certificados	',
                    E: 'Fecha',
                    F: 'Medio de Pago',
                    G: 'MONEDA',
                    H: 'Precio',
                    I: 'Estado',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sbranch,
                B: json[i].sproduct,
                C: json[i].splanilla,
                D: json[i].nquantity,
                E: json[i].sregister,
                F: json[i].stype,
                G: json[i].scurrency,
                H:
                    json[i].sshortcurrency +
                    ' ' +
                    json[i].namounttotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                I: json[i].sdescription,
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

    public exportReportDetailPayroll(json: any[], excelFileName: string): void {
        if (json.length > 0) {
            if (Number(json[0].nbranch) === 66) {
                this.exportReportDetailPayrollSOAT(json, excelFileName);
            } else {
                this.exportReportDetailPayrollVidaLey(json, excelFileName);
            }
        }
    }

    public exportReportDetailPayrollSOAT(
        json: any[],
        excelFileName: string
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Ramo',
                    C: 'Producto',
                    D: 'Nro. Póliza',
                    E: 'Certificado',
                    F: 'Proforma',
                    G: 'Fecha de emisión',
                    H: 'Placa',
                    I: 'Contratante',
                    J: 'Inicio de vigencia',
                    K: 'Fin de vigencia',
                    L: 'Moneda',
                    M: 'Importe',
                    N: 'Uso',
                    O: 'Clase',
                    P: 'Tipo de emisión',
                    Q: 'Punto de Venta',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].scliename,
                B: json[i].sbranch,
                C: json[i].sproduct,
                D: json[i].npolicy,
                E: json[i].ncertif,
                F: json[i].nreceipt,
                G: this.datePipe.transform(json[i].ddateorigi, 'dd/MM/yyyy'),
                H: json[i].sregist,
                I: json[i].snamecomplete,
                J: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                K: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                L: json[i].scurrency,
                M:
                    json[i].sshortcurrency +
                    ' ' +
                    json[i].npremium.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                N: json[i].suso,
                O: json[i].sclase,
                P: json[i].ssalemode,
                Q: json[i].spointname,
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

    public exportReportDetailPayrollVidaLey(
        json: any[],
        excelFileName: string
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Ramo',
                    C: 'Producto',
                    D: 'Nro. Póliza',
                    E: 'Certificado',
                    F: 'Proforma',
                    G: 'Fecha de emisión',
                    H: 'Contratante',
                    I: 'Inicio de vigencia',
                    J: 'Fin de vigencia',
                    K: 'Moneda',
                    L: 'Importe',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].scliename,
                B: json[i].sbranch,
                C: json[i].sproduct,
                D: json[i].npolicy,
                E: json[i].ncertif,
                F: json[i].nreceipt,
                G: this.datePipe.transform(json[i].ddateorigi, 'dd/MM/yyyy'),
                H: json[i].snamecomplete,
                I: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                J: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                K: json[i].scurrency,
                L:
                    json[i].sshortcurrency +
                    ' ' +
                    json[i].npremium.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
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

    public exportReportPrePayroll(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Pre Planilla',
                    B: 'Nro. Especies	',
                    C: 'Fecha',
                    D: 'Medio de Pago',
                    E: 'Precio',
                    F: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].nropreplanilla,
                B: json[i].cantidad,
                C: json[i].fecregistro,
                D: json[i].tipopago,
                E: json[i].montototal,
                F: json[i].descripcionestado,
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

    public exportReportPrePayrollGeneral(
        cab: any = {},
        detail: any[],
        paymentdetail: any[],
        excelFileName: string
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Pre Planilla',
                    B: 'Nro. Especies',
                    C: 'Fecha',
                    D: 'Medio de Pago',
                    E: 'Precio',
                    F: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        if (cab.id > 0) {
            const object = {
                A: cab.id,
                B: cab.cantidad,
                C: cab.dRegister,
                D: cab.tipoPago,
                E: cab.monto,
                F: cab.descripcionEstado,
            };
            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2' });
        const wsd = XLSX.utils.json_to_sheet(
            [{ A: 'Especie', B: 'Placa', C: 'Monto' }],
            { header: ['A', 'B'], skipHeader: true }
        );

        const listadosd = [];
        for (let i = 0; i < detail.length; i++) {
            const object = {
                A: detail[i].policy,
                B: detail[i].regist,
                C: detail[i].amount,
            };
            listadosd.push(object);
        }
        XLSX.utils.sheet_add_json(wsd, listadosd, {
            skipHeader: true,
            origin: 'A2',
        });

        const wsp = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Operación',
                    B: 'Fecha Operación',
                    C: 'Monto',
                    D: 'Banco',
                    E: 'Referencia',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E'], skipHeader: true }
        );

        const listadosp = [];
        for (let i = 0; i < paymentdetail.length; i++) {
            const object = {
                A: paymentdetail[i].operationNumber,
                B: paymentdetail[i].operationDate,
                C: paymentdetail[i].amount,
                D: paymentdetail[i].nbankText,
                E: paymentdetail[i].reference,
            };
            listadosp.push(object);
        }
        XLSX.utils.sheet_add_json(wsp, listadosp, {
            skipHeader: true,
            origin: 'A2',
        });

        const workbook: XLSX.WorkBook = {
            Sheets: {
                Planilla: ws,
                Certificado: wsd,
                'Medios de Pago': wsp,
            },
            SheetNames: ['Planilla', 'Certificado', 'Medios de Pago'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array',
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportReportSalesPRO(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Estado',
                    J: 'Uso',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].sstatuS_POL_DES,
                J: json[i].suso,
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

    public exportReportComissCV(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Estado',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].sstatuS_POL_DES,
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

    public exportReportComissPRO(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Nro. Póliza',
                    B: 'Prima',
                    C: 'DNI/CE',
                    D: 'Inico Vigencia',
                    E: 'Fin Vigencia',
                    F: 'Contratante',
                    G: 'Placa',
                    H: 'Modalidad',
                    I: 'Estado',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].npremium,
                C: json[i].ndocuments,
                D: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                E: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                F: json[i].snamecomplete,
                G: json[i].sregist,
                H: json[i].ssalemode,
                I: json[i].sstatuS_POL_DES,
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

    public exportHistorial(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Procedencia',
                    B: 'Nro. Póliza',
                    C: 'Prima',
                    D: 'DNI/CE',
                    E: 'Inico Vigencia',
                    F: 'Fin Vigencia',
                    G: 'Contratante',
                    H: 'Placa',
                    I: 'Modalidad',
                    J: 'Campaña',
                    K: 'Estado',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].ssource,
                B: json[i].npolicy,
                C: json[i].npremium,
                D: json[i].ndocuments,
                E: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                F: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                G: json[i].snamecomplete,
                H: json[i].sregist,
                I: json[i].ssalemode,
                J: json[i].scampaigsdes,
                K: json[i].sstatuS_POL_DES,
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

    public exportHistorialDetail(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Fecha de Venta',
                    B: 'Punto de Venta',
                    C: 'Contratante',
                    D: 'Nro. Documento',
                    E: 'EMail',
                    F: 'Teléfono',
                    G: 'Dirección',
                    H: 'Ubigeo',
                    I: 'Inicio Vigencia',
                    J: 'Fin Vigencia',
                    K: 'Prima',
                    L: 'Placa',
                    M: 'Año',
                    N: 'Asientos',
                    O: 'Uso',
                    P: 'Clase',
                    Q: 'Marca',
                    R: 'Modelo',
                    S: 'Serie',
                    T: 'Dirección Entrega',
                    U: 'Ubigeo Entrega',
                    V: 'Tipo Pago',
                    W: 'Turno Entrega',
                    X: 'Fecha Entrega',
                    Y: 'Modalidad',
                    Z: 'Factura',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: this.datePipe.transform(json[i].dissuedat, 'dd/MM/yyyy'),
                B: json[i].spointname,
                C: json[i].snamecomplete,
                D: json[i].ndocuments,
                E: json[i].sE_MAIL,
                F: json[i].sphone,
                G: json[i].sstreet,
                H: json[i].ubigeo,
                I: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                J: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                K: json[i].npremium,
                L: json[i].sregist,
                M: json[i].nyear,
                N: json[i].nseatcount,
                O: json[i].suso,
                P: json[i].sclase,
                Q: json[i].svehbrand,
                R: json[i].svehmodel,
                S: json[i].schassis,
                T: json[i].sdireccionentrega,
                U: json[i].ubigeoentrega,
                V: json[i].tipopago,
                W: json[i].horarioentrega,
                X: this.datePipe.transform(json[i].dfechaentrega, 'dd/MM/yyyy'),
                Y: json[i].ssalemode,
                Z: json[i].factura,
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

    public exportReportKunturSalesCF(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Cotización',
                    B: 'Producto',
                    C: 'Cliente',
                    D: 'Póliza',
                    E: 'Asegurados',
                    F: 'Movimiento',
                    G: 'Cosntancia',
                    H: 'Fecha Inicio',
                    I: 'Fecha Fin',
                    J: 'IGV',
                    K: 'Prima Neta',
                    L: 'Prima Total',
                    M: 'Proforma',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].NUM_COTIZACION,
                B: json[i].DES_PRODUCTO,
                C: json[i].SCLIENT,
                D: json[i].POLIZA,
                E: json[i].CANT_ASEGURADOS,
                F: json[i].TIPO_MOVIMIENTO,
                G: json[i].CONSTANCIA,
                H: json[i].FECHA_EFECTO,
                I: json[i].FECHA_EXPIRACION,
                J: json[i].IGV,
                K: json[i].PRIMA_NETA,
                L: json[i].PRIMA_TOTAL,
                M: json[i].PROFORMA,
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

    public exportReportKunturCommissionCF(
        json: any[],
        excelFileName: string
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Cotización',
                    B: 'Producto',
                    C: 'Comercializador',
                    D: 'Tipo Comercializador',
                    E: 'Poliza',
                    F: 'Asegurados',
                    G: '% Comission',
                    H: 'Prima Emision',
                    I: 'Estado Pago',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].NUM_COTIZACION,
                B: json[i].DES_PRODUCTO,
                C: json[i].COMERCIALIZADOR,
                D: json[i].TIPO_COMERCIALIZADOR,
                E: json[i].POLIZA,
                F: json[i].CANT_ASEGURADOS,
                G: json[i].PORCENTAJE_COMISION,
                H: json[i].PRIMA_EMISION,
                I: json[i].ESTADO_PAGO,
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

    public exportHistorialFalabella(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'SUBPRODUCTO',
                    B: 'FECHA VENTA',
                    C: 'TIPO DOC. VENDEDOR',
                    D: 'NUMERO DOC. VENDEDOR',
                    E: 'NUMERO DE PROPUESTA',
                    F: 'MEDIO DE PAGO',
                    G: 'PLAN DE PAGO',
                    H: 'TIPO DE TARJETA',
                    I: 'NUMERO DE TARJETA',
                    J: 'MES VIGENCIA TARJETA',
                    K: 'AÑO VIGENCIA TARJETA',
                    L: 'BANCO',
                    M: 'CARGA PRIMA',
                    N: 'MONTO PRIMA',
                    O: 'CÓDIGO PLAN ASOCIADO',
                    P: 'PUNTO DE VENTA',

                    Q: 'TIPO DOCUMENTO',
                    R: 'NUMERO DOCUMENTO',
                    S: 'DIGITO VERIFICADOR',
                    T: 'NOMBRES',
                    U: 'APELLIDO PATERNO',
                    V: 'APELLIDO MATERNO',
                    W: 'AVENIDA/CALLE',
                    X: ' NUMERACION',
                    Y: 'No DE PISO',
                    Z: 'No DEPARTAMENTO',
                    AA: 'PROVINCIA',
                    AB: 'CIUDAD',
                    AC: 'DISTRITO',
                    AD: 'COD AREA TELEFONO 1',
                    AE: 'TELEFONO 1',
                    AF: 'COD AREA TELEFONO 2',
                    AG: 'TELEFONO 2',
                    AH: 'PREFIJO CELULAR',
                    AI: 'CELULAR',
                    AJ: 'EMAIL',
                    AK: 'FECHA DE NACIMIENTO [DD-MM-AAAA]',
                    AL: 'SEXO',

                    AM: 'TIPO DOCUMENTO',
                    AN: 'NUMERO DOCUMENTO',
                    AO: 'DIGITO VERIFICADOR',
                    AP: 'NOMBRES',
                    AQ: 'APELLIDO PATERNO',
                    AR: 'APELLIDO MATERNO',
                    AS: 'AVENIDA/CALLE',
                    AT: ' NUMERACION',
                    AU: 'No DE PISO',
                    AV: 'No DEPARTAMENTO',
                    AW: 'PROVINCIA',
                    AX: 'CIUDAD',
                    AY: 'DISTRITO',
                    AZ: 'COD AREA TELEFONO 1',
                    BA: 'TELEFONO 1',
                    BB: 'COD AREA TELEFONO 2',
                    BC: 'TELEFONO 2',
                    BD: 'PREFIJO CELULAR',
                    BE: 'CELULAR',
                    BF: 'EMAIL',
                    BG: 'FECHA DE NACIMIENTO [DD-MM-AAAA]',
                    BH: 'SEXO',

                    BI: 'MEDIO DE PAGO',
                    BJ: 'PLACA',
                    BK: 'ORIGEN PT',
                    BL: 'CLASE',
                    BM: 'MARCA PT',
                    BN: 'MODELO PT',
                    BO: 'VERSION',
                    BP: 'N° DE ASIENTOS',
                    BQ: 'USO PT',
                    BR: 'VIN',
                    BS: 'AÑO FABRICACION',
                    BT: 'TIPO CALLE',
                    BU: 'DIRECCION',
                    BV: 'NUMERO',
                    BW: 'DEPARTAMENTO',
                    BX: 'PROVINCIA',
                    BY: 'DISTRITO',
                    BZ: 'NUMERO DE POLIZA',
                    CA: 'NUMERO DE ORDEN/PEDIDO',
                    CB: 'CERTIFICADO SOAT',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: 'VPRDSU', // SUBPRODUCTO
                B: this.datePipe.transform(json[i].dissuedat, 'dd-MM-yyyy'), // FECHA VENTA [DD-MM-AAAA]
                C: 1, // TIPO DOC. VENDEDOR (Por defecto valor: 1)
                D: json[i].dnivendedor, // NUMERO DOC. VENDEDOR
                E: '', // NUMERO DE PROPUESTA
                F: 11, // MEDIO DE PAGO (Por defecto valor: 11)
                G: 1, // PLAN DE PAGO (Por defecto valor: 1)
                H: 1, // TIPO DE TARJETA (Por defecto valor: 1)
                I: '', // NUMERO DE TARJETA
                J: '', // MES VIGENCIA TARJETA
                K: '', // AÑO VIGENCIA TARJETA
                L: '', // BANCO
                M: 'S', // CARGA PRIMA
                N: json[i].npremium, // MONTO PRIMA
                O: '', // CÓDIGO PLAN ASOCIADO
                P: json[i].p_SSALEPOINT_BO, // PUNTO DE VENTA

                Q: json[i].npersontyP_C === '2' ? 6 : 1, // 'TIPO DOCUMENTO',
                R: json[i].ndocuments, // 'NUMERO DOCUMENTO',
                S: 1, // 'DIGITO VERIFICADOR',
                T:
                    json[i].npersontyP_C === '2' ? json[i].slegalnamE_C : json[i].snamE_C, // 'NOMBRES',
                U: json[i].slastnamE_C, // 'APELLIDO PATERNO',
                V: json[i].slastnamE2_C, // 'APELLIDO MATERNO',
                W: json[i].direccioN_C, // 'AVENIDA/CALLE',
                X: 22, // ' NUMERACION',
                Y: '', // 'No DE PISO',
                Z: '', // 'No DEPARTAMENTO',
                AA: json[i].ubigeO_C === null ? '' : json[i].ubigeO_C.split('-')[0], // 'PROVINCIA',
                AB: json[i].ubigeO_C === null ? '' : json[i].ubigeO_C.split('-')[1], // 'CIUDAD',
                AC: json[i].ubigeO_C === null ? '' : json[i].ubigeO_C.split('-')[2], // 'DISTRITO',
                AD: '', // 'COD AREA TELEFONO 1',
                AE: json[i].sphone, // 'TELEFONO 1',
                AF: '', // 'COD AREA TELEFONO 2',
                AG: '', // 'TELEFONO 2',
                AH: '', // 'PREFIJO CELULAR',
                AI: '', // 'CELULAR',
                AJ: json[i].sE_MAIL_C, // 'EMAIL',
                AK: '01-01-1990', // 'FECHA DE NACIMIENTO [DD-MM-AAAA]',
                AL: 'M', // 'SEXO'

                AM: json[i].npersontyp === '2' ? 6 : 1, // 'TIPO DOCUMENTO',
                AN: json[i].ndocuments, // 'NUMERO DOCUMENTO',
                AO: 1, // 'DIGITO VERIFICADOR',
                AP: json[i].npersontyp === '2' ? json[i].slegalnamE_C : json[i].sname, // 'NOMBRES',
                AQ: json[i].slastname, // 'APELLIDO PATERNO',
                AR: json[i].slastnamE2, // 'APELLIDO MATERNO',
                AS: json[i].direccion, // 'AVENIDA/CALLE',
                AT: 222, // ' NUMERACION',
                AU: '', // 'No DE PISO',
                AV: '', // 'No DEPARTAMENTO',
                AW: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[0], // 'PROVINCIA',
                AX: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[1], // 'CIUDAD',
                AY: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[2], // 'DISTRITO',
                AZ: '', // 'COD AREA TELEFONO 1',
                BA: json[i].sphone, // 'TELEFONO 1',
                BB: '', // 'COD AREA TELEFONO 2',
                BC: '', // 'TELEFONO 2',
                BD: '', // 'PREFIJO CELULAR',
                BE: '', // 'CELULAR',
                BF: json[i].sE_MAIL, // 'EMAIL',
                BG: '01-01-1990', // 'FECHA DE NACIMIENTO [DD-MM-AAAA]',
                BH: 'M', // 'SEXO', //

                BI: 11, // 'MEDIO DE PAGO',
                BJ: json[i].sregist, //  'PLACA',
                BK: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[0], // 'ORIGEN PT',
                BL: json[i].sclase, // 'CLASE',
                BM: json[i].svehbrand, // 'MARCA PT',
                BN: json[i].smainmodel, // 'MODELO PT',
                BO: json[i].svehmodel, // 'VERSION',
                BP: json[i].nseatcount, // 'N° DE ASIENTOS',
                BQ: json[i].suso, // 'USO PT',
                BR: json[i].schassis, // 'VIN',
                BS: json[i].nyear, // 'AÑO FABRICACION',
                BT: '', // 'TIPO CALLE',
                BU: json[i].direccion, // 'DIRECCION',
                BV: 0, // 'NUMERO',
                BW: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[0], // 'DEPARTAMENTO',
                BX: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[1], // 'PROVINCIA',
                BY: json[i].ubigeo === null ? '' : json[i].ubigeo.split('-')[2], // 'DISTRITO',
                BZ: json[i].npolicy, // 'NUMERO DE POLIZA',
                CA: json[i].operacion, // 'NUMERO DE ORDEN/PEDIDO',
                CB: json[i].npolicy, // 'CERTIFICADO SOAT'
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

    public exportHistorialAndes(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'CERTIFICADO',
                    B: 'CANAL',
                    C: 'PUNTO DE VENTA',
                    D: 'USUARIO DE VENTA',
                    E: 'FECHA DE INICIO',
                    F: 'FECHA DE FIN',
                    G: 'CONTRATANTE',
                    // H: 'DNI / RUC',
                    // I: 'DEPARTAMENTO',
                    H: 'PLACA',
                    // K: 'MARCA',
                    // L: 'MODELO',
                    // M: 'CLASE',
                    // N: 'AÑO',
                    I: 'USO',
                    J: 'PRIMA',
                    // Q: 'FECHA EMISION',
                    K: 'FECHA VENTA',
                    L: 'TIPO CERTIFICADO',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolicy,
                B: json[i].scliename,
                C: json[i].spointname,
                D: json[i].dnivendedor,
                E: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                F: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                G: json[i].snamecomplete,
                H: json[i].sregist,
                I: json[i].suso,
                J: json[i].npremium,
                K: this.datePipe.transform(json[i].dissuedat, 'dd/MM/yyyy'),
                L:
                    Number(json[i].npolicy.toString().substr(0, 1)) === 7
                        ? 'DIGITAL'
                        : 'FISICO',
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

    public exportCanalesCredito(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'CODIGO',
                    B: 'CANAL',
                    C: 'TIPO',
                    D: 'INICIO VIGENCIA',
                    E: 'PROPUESTA',
                    F: 'MONTO CREDITO',
                    G: 'DIAS CREDITO',
                    H: 'DEUDA',
                    I: 'DIAS NO REPORTADOS',
                    J: 'BLOQUEADO',
                    K: 'FACTURA',
                    L: 'VISA',
                    M: 'PAGO EFECTIVO',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].codigoCanal,
                B: json[i].cliente,
                C: json[i].tipoCanal,
                D: this.datePipe.transform(json[i].inicioVigencia, 'dd/MM/yyyy'),
                E: json[i].aplicaCredito === 1 ? 'CREDITO' : 'CONTADO',
                F: json[i].montoCredito,
                G: json[i].diasCredito,
                H: json[i].montoDeuda,
                I: json[i].diasNoReportados,
                J: json[i].bloqueado === 1 ? 'SI' : 'NO',
                K: json[i].generaComprobante === 1 ? 'SI' : 'NO',
                L:
                    json[i].habilitaVisa === 1
                        ? 'SI'
                        : json[i].habilitaVisa === 2
                            ? 'SI (TELEPAGO)'
                            : 'NO',
                M: json[i].habilitaPagoEfectivo === 1 ? 'SI' : 'NO',
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

    public exportComission(
        json: any[],
        excelFileName: string,
        is_disp?: boolean
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'CANAL',
                    B: 'PRODUCTO',
                    C: 'PLANILLA',
                    D: 'TIPO INTERMEDIARIO',
                    E: 'FECHA DE INICIO',
                    F: 'FECHA FIN',
                    G: 'POLIZA',
                    H: 'COMPROBANTE',
                    I: 'FECHA DE PAGO',
                    J: 'FECHA DE FACTURACION',
                    K: 'FECHA DE DISPONIBILIZACION',
                    L: 'TIPO DE MONEDA',
                    M: 'PRIMA TOTAL',
                    N: 'PRIMA NETA',
                    O: 'PORCENTAJE DE COMISIÓN',
                    P: 'MONTO COMISIÓN',
                    Q: 'ESTADO COMISIÓN',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const item = json[i];
            const object = {
                A: item.canal,
                B: item.producto,
                C: item.idJob,
                D: item.tipoIntermediario,
                E: item.fechaInicio,
                F: item.fechaFin,
                G: item.numeroPoliza,
                H: item.comprobante,
                I: item.fechaPago,
                J: item.fechaFacturacion,
                K: item.fechaDisponibilizacion || 'Pendiente por Disponibilizar',
                L: +item.idMoneda == 1 ? 'Soles' : 'Dólares',
                M: +item.primaTotal,
                N: +item.primaNeta,
                O: item.porcentajeComision,
                P: +item.montoComision,
                Q: item.estadoComision,
            };
            listados.push(object);
        }

        // this.wrapAndCenterCell(ws.A1);

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

    public exportReportCommissionLot(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Ramo',
                    B: 'Producto',
                    C: 'Nro. de Lote',
                    D: 'Nro. Comisiones',
                    E: 'Fecha',
                    F: 'Moneda',
                    G: 'Monto Comisión',
                    H: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sbranch,
                B: json[i].sproduct,
                C: json[i].sidcomlot,
                D: json[i].nquantity,
                E: json[i].sregister,
                F: json[i].scurrency,
                G: json[i].namounttotal,
                H: json[i].sdescription,
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

    private wrapAndCenterCell(cell: XLSX.CellObject) {
        const wrapAndCenterCellStyle = {
            font: { sz: '15', bold: true },
            border: { style: 'thin', color: { rgb: '#FFFFFF' } },
            alignment: { wrapText: true, vertical: 'center', horizontal: 'center' },
            background: { color: { rgb: '#2b0d61' } },
        };
        this.setCellStyle(cell, wrapAndCenterCellStyle);
    }

    private setCellStyle(cell: XLSX.CellObject, style: {}) {
        cell.s = style;
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }
    saveAsExcelFileOI(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(
            data,
            fileName + EXCEL_EXTENSION
        );
    }

    public exportReportBonoGenerales(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                // tslint:disable-next-line:max-line-length
                {
                    A: 'Producto',
                    B: 'Póliza',
                    C: 'Inicio de Vigencia',
                    D: 'Fin de Vigencia',
                    E: 'Prima',
                    F: 'Tasa',
                    G: 'Recibo',
                    H: 'Fecha de Cobro',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sproduct,
                B: json[i].npolicy,
                C: json[i].sfecinivig,
                D: json[i].sfecfinvig,
                E: json[i].nprimaneta,
                F: json[i].ntasaneta,
                G: json[i].nreceipt,
                H: json[i].sfeccobro,
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

    public exportReportEventsUsuarios(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal',
                    B: 'Usuario',
                    C: 'Pagina',
                    D: 'Opción',
                    E: 'Descripción',
                    F: 'Fecha',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].canal,
                B: json[i].usuario,
                C: json[i].pagina,
                D: json[i].evento,
                E: json[i].comentario,
                F: json[i].fechaRegistro,
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

    public exportReportBonoSiniestros(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                // tslint:disable-next-line:max-line-length
                {
                    A: 'Cód. Ramo',
                    B: 'Ramo',
                    C: 'Cód. Producto',
                    D: 'Producto',
                    E: 'Cód Cliente',
                    F: 'Cliente',
                    G: 'Cód. Canal',
                    H: 'Canal',
                    I: 'No. Siniestro',
                    J: 'Póliza',
                    K: 'Moneda',
                    L: 'No. Certificado',
                    M: 'F. Inicio Vigencia',
                    N: 'F. Fin Vigencia',
                    O: 'F. Ocurrencia Siniestro',
                    P: 'F. Reporte Siniestro',
                    Q: 'F. Liquidación',
                    R: 'Importe Reservado',
                    S: 'Importe Pagado',
                    T: 'Estado Siniestro',
                    U: 'F. Movimiento',
                    V: 'Remuneración',
                    W: 'Cód. Cob. Afectada',
                    X: 'Cobertura Afectada',
                    Y: 'S.A. Cob. Afectada',
                    Z: 'Reserva Inicial',
                    AA: 'Reserva Total',
                    AB: 'Pago Total',
                    AC: 'Saldo',
                    AD: 'DNI Asegurado',
                    AE: 'Cód. Asegurado',
                    AF: 'Nombre Asegurado',
                    AG: 'Fecha Nacimiento',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                    'T',
                    'U',
                    'V',
                    'W',
                    'X',
                    'Y',
                    'Z',
                    'AA',
                    'AB',
                    'AC',
                    'AD',
                    'AE',
                    'AF',
                    'AG',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].nbranch,
                B: json[i].sbranch,
                C: json[i].nproduct,
                D: json[i].sproduct,
                E: json[i].nidclient,
                F: json[i].sclient,
                G: json[i].scodchannel,
                H: json[i].sdeschannel,
                I: json[i].nsiniestro,
                J: json[i].npoliza,
                K: json[i].scurrency,
                L: json[i].ncertificate,
                M: json[i].dfecinivig,
                N: json[i].dfecfinvig,
                O: json[i].dfecocu,
                P: json[i].dfecreport,
                Q: json[i].dfecliqui,
                R: json[i].nimportreserv,
                S: json[i].nimportpagado,
                T: json[i].sestadosinies,
                U: json[i].dfecmovi,
                V: json[i].nremunemensu,
                W: json[i].nidcoberafec,
                X: json[i].scoberafec,
                Y: json[i].nsumasegcoberafec,
                Z: json[i].nreservini,
                AA: json[i].nresertotal,
                AB: json[i].npagototal,
                AC: json[i].nsaldo,
                AD: json[i].ndniasegur,
                AE: json[i].ncodasegur,
                AF: json[i].sasegurado,
                AG: json[i].dfecnacasegur,
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

    public exportReportBonoLot(
        json: any[],
        jsonDet: any[],
        excelFileName: string
    ): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Riesgo',
                    B: 'Moneda',
                    C: 'Prima Neta',
                    D: 'Participación de Utilidad',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sproduct,
                B: json[i].scurrency,
                C: json[i].nprimanetaponderada,
                D: json[i].nmontobonoregular + json[i].nmontobonodirecto,
            };
            listados.push(object);
        }
        const workbook = XLSX.utils.book_new();
        this.wrapAndCenterCell(ws.A1);
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2' });
        XLSX.utils.book_append_sheet(workbook, ws, 'LotesDeBono');
        let listaDet = [];
        for (let i = 0; i < jsonDet.length; i++) {
            const data = jsonDet[i].listcommissionlotdetail;

            if (data.length > 0) {
                listaDet = [];
                let product = '';
                for (let j = 0; j < data.length; j++) {
                    const object = {
                        A: data[j].npolicy,
                        B: data[j].sproduct,
                        C: this.decimalPipe.transform(data[j].nprimaneta, '1.2-2'),
                        D: this.decimalPipe.transform(data[j].ntasaneta * 100, '1.2-2'),
                        E: data[j].nreceipt,
                        F: this.datePipe.transform(data[j].dfecinivigencia, 'dd/MM/yyyy'),
                        G: this.datePipe.transform(data[j].dfecfinvigencia, 'dd/MM/yyyy'),
                        H: this.datePipe.transform(data[j].dfeccobro, 'dd/MM/yyyy'),
                        I: this.decimalPipe.transform(data[j].nmontocomitotal, '1.2-2'),
                    };
                    listaDet.push(object);
                    product = data[j].sproduct;
                }
                if (listaDet.length > 0) {
                    const headerDet = XLSX.utils.json_to_sheet(
                        [
                            {
                                A: 'N° de Póliza',
                                B: 'Riesgo',
                                C: 'Prima neta',
                                D: 'Tasa neta',
                                E: 'N° de Recibo',
                                F: 'Ini. Vig. Comprobante',
                                G: 'Fin Vig. Comprobante',
                                H: 'Fecha de cobranza',
                                I: 'Participación de Utilidades',
                            },
                        ],
                        {
                            header: [
                                'A',
                                'B',
                                'C',
                                'D',
                                'E',
                                'F',
                                'G',
                                'H',
                                'I',
                                'J',
                                'K',
                                'L',
                                'M',
                            ],
                            skipHeader: true,
                        }
                    );
                    XLSX.utils.sheet_add_json(headerDet, listaDet, {
                        skipHeader: true,
                        origin: 'A2',
                    });
                    XLSX.utils.book_append_sheet(
                        workbook,
                        headerDet,
                        product.trim().replace(' ', '')
                    );
                }
            }
        }

        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array',
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportReportLeadsSoat(json: any[], excelFileName: string): void {
        /*const ws = XLSX.utils.json_to_sheet([
          {
            A: 'Fecha y hora', B: 'Razón Social', C: 'Nombre del Contacto', D: 'Correo Electrónico', E: 'Teléfono', F: 'Ruc/DNI',
            G: 'Placa', H: 'Marca/Modelo/Año', I: 'Paso en el que se quedo', J: 'Emitido'
          }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], skipHeader: true });*/
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Fecha y hora',
                    B: 'Razón Social',
                    C: 'Nombre de Contacto',
                    D: 'Correo Electrónico',
                    E: 'Teléfono',
                    F: 'Ruc/DNI',
                    G: 'Placa',
                    H: 'Marca',
                    I: 'Modelo',
                    J: 'Año',
                    K: 'Paso en el que se quedo',
                    L: 'Emitido',
                },
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
                skipHeader: true,
            }
        );
        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: this.datePipe.transform(json[i].dregdate, 'dd/MM/yyyy H:mm'),
                B: json[i].slegalname == null ? '' : json[i].slegalname,
                C:
                    json[i].slegalname == null
                        ? json[i].sclienT_NAME +
                        ' ' +
                        json[i].sclienT_APPPAT +
                        ' ' +
                        json[i].sclienT_APPMAT
                        : '',
                D: json[i].smail,
                E: json[i].sphone,
                F: json[i].sdocument,
                G: json[i].sregist,
                H: json[i].sbranch,
                I: json[i].modelo,
                J: json[i].anio,
                K: json[i].sstep,
                L: json[i].nflagemision === 1 ? 'COMPRO' : 'NO COMPRO',
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

    public exportReportLeadsVidaLey(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Fecha y hora',
                    B: 'Razón Social',
                    C: 'Correo Electrónico',
                    D: 'Teléfono',
                    E: 'Ruc/DNI',
                    F: 'Paso en el que se quedo',
                    G: 'Emitido',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: this.datePipe.transform(json[i].dregdate, 'dd/MM/yyyy H:mm'),
                B: json[i].slegalname,
                C: json[i].smail,
                D: json[i].telefono,
                E: json[i].sdocument,
                F: json[i].sstep,
                G: json[i].emitido,
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
    public exportReportrama(json: any[], excelFileName: string): void {
        const rt = XLSX.utils.json_to_sheet([
            {
                A: 'Id process',
                B: 'Contratante',
                C: 'Estado',
                D: 'Fecha',
                E: 'Ramo',
                F: 'Tipo Trama',
            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true });

        const listadatos = [];
        for (let i = 0; i < json.length; i++) {
            const item = json[i];
            const object = {
                A: item.number,
                B: item.contratante,
                C: item.estado.description,
                D: item.fecha,
                E: item.ramo,
                F: item.tipo_trama,
            };
            listadatos.push(object);
        }

        XLSX.utils.sheet_add_json(rt, listadatos, { skipHeader: true, origin: 'A2' });
        const workbook: XLSX.WorkBook = { Sheets: { 'data': rt }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportAccountState(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Producto',
                    B: 'Broker',
                    C: 'Nro. Documento Broker',
                    D: 'Moneda',
                    E: 'Contratante',
                    F: 'Nro. Documento Contratante',
                    G: 'Póliza',
                    H: 'Días de crédito (Vida Ley)',
                    I: 'Certificado',
                    J: 'Inicio',
                    K: 'Fin',
                    L: 'Nro. Comprobante',
                    M: 'Fec. Comprobante',
                    N: 'Fec. Vencimiento',
                    O: 'Fec. Provisión',
                    P: 'Estado Comprobante',
                    Q: 'Prima Neta',
                    R: 'Derecho Emisión',
                    S: 'IGV',
                    T: 'Total',
                    U: 'Ini. Pol',
                    V: 'Fin Pol',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].producto,
                B: json[i].intermediario,
                C: json[i].documentoIntermediario,
                D: json[i].moneda,
                E: json[i].contratante,
                F: json[i].documentoContratante,
                G: json[i].poliza,
                H: json[i].diasCredito,
                I: json[i].certificado,
                J: this.datePipe.transform(json[i].fechaInicioVigencia, 'dd/MM/yyyy'),
                K: this.datePipe.transform(json[i].fechaFinVigencia, 'dd/MM/yyyy'),
                L: setSerialNumber(json[i].idTipoComprobante, json[i].serieNumero),
                M: this.datePipe.transform(json[i].fechaEmision, 'dd/MM/yyyy'),
                N: this.datePipe.transform(json[i].fechaVencimiento, 'dd/MM/yyyy'),
                O: this.datePipe.transform(json[i].fechaProvision, 'dd/MM/yyyy'),
                P: json[i].estado,
                Q: json[i].montoNeto,
                R: json[i].montoEmision,
                S: json[i].montoIGV,
                T: json[i].montoTotal,
                U: this.datePipe.transform(
                    json[i].fechaInicioVigenciaPoliza,
                    'dd/MM/yyyy'
                ),
                V: this.datePipe.transform(
                    json[i].fechaFinVigenciaPoliza,
                    'dd/MM/yyyy'
                ),
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
    public exportAccountStateForAdmin(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Producto',
                    B: 'Documento de Referencia',
                    C: 'Tipo de Comprobante',
                    D: 'Comprobante',
                    E: 'Prima',
                    F: 'Nro. Documento',
                    G: 'Contratante',
                    H: 'Póliza',
                    I: 'Placa',
                    J: 'Fecha de Emisión',
                    K: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].producto,
                B: json[i].documentoReferencia,
                C: json[i].tipoComprobante,
                D: setSerialNumber(json[i].idTipoComprobante, json[i].serieNumero),
                E: Number(json[i].montoTotal.replace(',', '.')),
                F:
                    json[i].tipoDocumentoContratante + ' ' + json[i].documentoContratante,
                G: json[i].contratante,
                H: json[i].poliza,
                I: json[i].placa,
                J: this.datePipe.transform(json[i].fechaEmision, 'dd/MM/yyyy'),
                K: json[i].estado,
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

    public exportProductionReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de Venta',
                    B: 'Certificado',
                    C: 'Código Contratante',
                    D: 'Contratante',
                    E: 'F. Inicio Vigencia',
                    F: 'Comprobante',
                    G: 'Estado',
                    H: 'Código Contratante del Comprobante',
                    I: 'Contratante del Comprobante',
                    J: 'Fecha Comprobante',
                    K: 'Monto del Comprobante',
                    L: 'Prima Bruta',
                    M: 'Prima Neta',
                    N: 'DE',
                    O: 'IGV',
                    P: '% Comisión',
                    Q: 'Comisión',
                    R: 'Clase',
                    S: 'Placa',
                    T: 'Categoria',
                    U: 'Uso',
                    V: 'Carrocería',
                    W: 'Marca',
                    X: 'Departamento',
                    Y: 'Provincia',
                    Z: 'Distrito',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                    'T',
                    'U',
                    'V',
                    'W',
                    'X',
                    'Y',
                    'Z',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].spolicy,
                B: json[i].npolesP_COMP,
                C: json[i].s_CLIENT,
                D: json[i].s_CLIENTNAME,
                E: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                F: json[i].numdoc,
                G: json[i].sstatuspol,
                H: json[i].idcontratante,
                I: json[i].nomcontratante,
                J: this.datePipe.transform(json[i].dcompdate, 'dd/MM/yyyy'),
                K: json[i].montocomprobante,
                L: json[i].nmprima,
                M: json[i].nmonnet,
                N: json[i].nderemi,
                O: json[i].nmonigv,
                P: json[i].porcomision,
                Q: json[i].comision,
                R: json[i].desnclass,
                S: json[i].splate,
                T: json[i].descategoria,
                U: json[i].desuso,
                V: json[i].descarroceria,
                W: json[i].marca,
                X: json[i].departamento,
                Y: json[i].provincia,
                Z: json[i].distrito,
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

    public exportEndorsementReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Certificado',
                    B: 'Campo',
                    C: 'Valor anterior',
                    D: 'Valor nuevo',
                    E: 'Canal',
                    F: 'Fecha de endoso',
                    G: 'Usuario',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].npolesP_COMP,
                B: json[i].sdatafielD_UPDATE,
                C: json[i].sdatavaluE_UPDATE,
                D: json[i].sdatavaluE_UPDATE_NEW,
                E: json[i].spolicy,
                F: this.datePipe.transform(json[i].ddatE_ENDOSES, 'dd/MM/yyyy'),
                G: json[i].suser,
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

    public exportHistoryReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'N° Lote',
                    B: 'Tipo de Certificado',
                    C: 'N° Certificado',
                    D: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].nnumlot,
                B: json[i].scertificate,
                C: json[i].npolesp,
                D: json[i].sstate,
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

    public exportBatchReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'N° Lote',
                    B: 'N° Certificado',
                    C: 'N° Especie Valorada',
                    D: 'Tipo de Certificado',
                    E: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].nnumlot,
                B: json[i].npolesp,
                C: json[i].npolesP_COMP,
                D: json[i].scertificate,
                E: json[i].sstatus,
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

    public exportDischargeReport(json: any[], excelFileName: string): void {
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
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sdeschannel,
                B: json[i].nnumlot,
                C: json[i].npolicy,
                D: json[i].sdescript,
                E: json[i].sorigen,
                F: json[i].suser,
                G: json[i].dcompdate,
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

    public exportCreditNoteReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'PERIODO',
                    B: 'POLIZA',
                    C: 'CERTIFICADO',
                    D: 'FEC INI',
                    E: 'FEC FIN',
                    F: 'CONTRATANTE',
                    G: 'DEPARTAMENTO',
                    H: 'PROVINCIA',
                    I: 'DISTRITO',
                    J: 'MONEDA',
                    K: 'PRIMA POLIZA VENTA',
                    L: 'MONTO NC',
                    M: 'PRIMA APLICADA NC',
                    N: 'FEC NOTA CREDITO',
                    O: 'PRIMA APLICADA NC',
                    P: 'DOCUMENTO REF',
                    Q: 'FEC COMPROBANTE APLICADO',
                    R: 'COMPROBANTE APLICADO',
                    S: 'MOTIVO',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].periodo,
                B: json[i].poliza,
                C: json[i].certificado,
                D: json[i].feC_INI,
                E: json[i].feC_FIN,
                F: json[i].contratante,
                G: json[i].departamento,
                H: json[i].provincia,
                I: json[i].distrito,
                J: json[i].moneda,
                K: json[i].primA_POLIZA_VENTA,
                L: json[i].montO_NC,
                M: json[i].primA_APLICADA_NC,
                N: json[i].feC_NOTA_CREDITO,
                O: json[i].notA_CREDITO,
                P: json[i].documentO_REF,
                Q: json[i].feC_COMPROBANTE_APLICADO,
                R: json[i].comprobantE_APLICADO,
                S: json[i].motivo,
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

    public exportDigitalPlatformReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'CLIENTE',
                    B: 'RIESGO',
                    C: 'RAMO',
                    D: 'SDESCRIPT',
                    E: 'CERTIFICADO',
                    F: 'FECINI',
                    G: 'FECFIN',
                    H: 'FECVEN',
                    I: 'HORA',
                    J: 'FECANUL',
                    K: 'UBIGEO',
                    L: 'NOMBRES',
                    M: 'PATERNO',
                    N: 'MATERNO',
                    O: 'RAZONSOCIAL',
                    P: 'TIPDOC',
                    Q: 'NRODOC',
                    R: 'TELEFONO',
                    S: 'PERSONA',
                    T: 'DIRECCION',
                    U: 'clase Ase',
                    V: 'TIPOTARJETA',
                    W: 'PLACA',
                    X: 'PLACAANT',
                    Y: 'NVEHBRAND',
                    Z: 'MARCA',
                    AA: 'IDMODELO',
                    AB: 'MODELO',
                    AC: 'CATEGORIA',
                    AD: 'CLASE',
                    AE: 'CARROCERIA',
                    AF: 'AÑO',
                    AG: 'USO',
                    AH: 'NROSERIE',
                    AI: 'ASIENTOS',
                    AJ: 'MONEDA',
                    AK: 'PRIMA',
                    AL: 'INDICADOR',
                    AM: 'ESTADOEMI',
                    AN: 'CANAL',
                    AO: 'POLIZA',
                    AP: 'CANAL DESCRIP',
                    AQ: 'PUNTOVENTA',
                    AR: 'OPERADORLOG',
                    AS: 'OBSERVACION',
                    AT: 'NPORCOM',
                    AU: 'MTOCOM1',
                    AV: 'NPORCOM2',
                    AW: 'MTOCOM2',
                    AX: 'NPORCOM3',
                    AY: 'MTOCOM3',
                    AZ: 'NSOLADM',
                    BA: 'NRECCOM',
                    BB: 'NPORDEM',
                    BC: 'FECREGISTRO',
                    BD: 'SVERTION',
                    BE: 'CELULAR',
                    BF: 'SEMAILCLI',
                    BG: 'LOTE',
                    BH: 'FEC ANU COMP',
                    BI: 'SERIE',
                    BJ: 'NRO COMPROBANTE',
                    BK: 'NRO PROFORMA',
                    BL: 'FECHA COMPROBANTE',
                    BM: 'NUSERCODE',
                    BN: 'DISSUEDAT',
                    BO: 'NMODULEC',
                    BP: 'COD DEPARTAMENTO',
                    BQ: 'LOTE DESCARGO',
                    BR: 'NRO PLANILLA',
                    BS: 'ESTADO PLANILLA',
                    BT: 'ESTADO CONCILIACION',
                    BU: 'PTO VENTA',
                    BV: 'NIDUSER',
                    BW: 'USUARIO',
                    BX: 'NOMBRE USUARIO',
                    BY: 'DEPARTAMENTO',
                    BZ: 'PROVINCIA',
                    CA: 'DISTRITO',
                    CB: 'CONTRATANTE',
                    CC: 'CLASE DESCRIPCION',
                    CD: 'USO DESCRIPCION',
                    CE: 'PLAN',
                    CF: 'PRIMAFINAL',
                    CG: 'SINDMARK',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                    'T',
                    'U',
                    'V',
                    'W',
                    'X',
                    'Y',
                    'Z',
                    'AA',
                    'AB',
                    'AC',
                    'AD',
                    'AE',
                    'AF',
                    'AG',
                    'AH',
                    'AI',
                    'AJ',
                    'AK',
                    'AL',
                    'AM',
                    'AN',
                    'AO',
                    'AP',
                    'AQ',
                    'AR',
                    'AS',
                    'AT',
                    'AU',
                    'AV',
                    'AW',
                    'AX',
                    'AY',
                    'AZ',
                    'BA',
                    'BB',
                    'BC',
                    'BD',
                    'BE',
                    'BF',
                    'BG',
                    'BH',
                    'BI',
                    'BJ',
                    'BK',
                    'BL',
                    'BM',
                    'BN',
                    'BO',
                    'BP',
                    'BQ',
                    'BR',
                    'BS',
                    'BT',
                    'BU',
                    'BV',
                    'BW',
                    'BX',
                    'BY',
                    'BZ',
                    'CA',
                    'CB',
                    'CC',
                    'CD',
                    'CE',
                    'CF',
                    'CG',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].cliente,
                B: json[i].riesgo,
                C: json[i].ramo,
                D: json[i].sdescript,
                E: json[i].certificado,
                F: json[i].fecini,
                G: json[i].fecfin,
                H: json[i].fecven,
                I: json[i].hora,
                J: json[i].fecanul,
                K: json[i].ubigeo,
                L: json[i].nombres,
                M: json[i].paterno,
                N: json[i].materno,
                O: json[i].razonsocial,
                P: json[i].tipdoc,
                Q: json[i].nrodoc,
                R: json[i].telefono,
                S: json[i].persona,
                T: json[i].direccion,
                U: json[i].claseAse,
                V: json[i].tipotarjeta,
                W: json[i].placa,
                X: json[i].placaant,
                Y: json[i].nvehbrand,
                Z: json[i].marca,
                AA: json[i].idmodelo,
                AB: json[i].modelo,
                AC: json[i].categoria,
                AD: json[i].clase,
                AE: json[i].carroceria,
                AF: json[i].año,
                AG: json[i].uso,
                AH: json[i].nroserie,
                AI: json[i].asientos,
                AJ: json[i].moneda,
                AK: json[i].prima,
                AL: json[i].indicador,
                AM: json[i].estadoemi,
                AN: json[i].canal,
                AO: json[i].poliza,
                AP: json[i].canaL_DESCRIP,
                AQ: json[i].puntoventa,
                AR: json[i].operadorlog,
                AS: json[i].observacion,
                AT: json[i].nporcom,
                AU: json[i].mtocoM1,
                AV: json[i].nporcoM2,
                AW: json[i].mtocoM2,
                AX: json[i].nporcoM3,
                AY: json[i].mtocoM3,
                AZ: json[i].nsoladm,
                BA: json[i].nreccom,
                BB: json[i].npordem,
                BC: json[i].fecregistro,
                BD: json[i].svertion,
                BE: json[i].celular,
                BF: json[i].semailcli,
                BG: json[i].lote,
                BH: json[i].fecanul,
                BI: json[i].serie,
                BJ: json[i].nrocomprobante,
                BK: json[i].nrO_PROFORMA,
                BL: json[i].fechA_COMPROBANTE,
                BM: json[i].nusercode,
                BN: json[i].dissuedat,
                BO: json[i].nmodulec,
                BP: json[i].coD_DEPARTAMENTO,
                BQ: json[i].lotE_DESCARGO,
                BR: json[i].nrO_PLANILLA,
                BS: json[i].estadO_PLANILLA,
                BT: json[i].estadO_CONCILIACION,
                BU: json[i].ptO_VENTA,
                BV: json[i].niduser,
                BW: json[i].usuario,
                BX: json[i].nombrE_USUARIO,
                BY: json[i].departamento,
                BZ: json[i].provincia,
                CA: json[i].distrito,
                CB: json[i].contratante,
                CC: json[i].clasE_DESCRIPCION,
                CD: json[i].usO_DESCRIPCION,
                CE: json[i].plan,
                CF: json[i].primafinal,
                CG: json[i].sindmark,
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
    public exportArqueoReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'CERTIFICADO',
                    B: 'FECHA DE ENTREGA',
                    C: 'D.PDTES',
                    D: 'TIPO DE USO',
                    E: 'CANAL VENTA',
                    F: 'PUNTO VENTA',
                    G: 'ESTADO REAL',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true }
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
    public exportRateReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Lote',
                    C: 'Póliza',
                    D: 'Fecha Emisión',
                    E: 'Inicio de Vigencia',
                    F: 'Fin de Vigencia',
                    G: 'Proforma',
                    H: 'Tarifa Protecta',
                    I: 'Tarifa Broker',
                    J: 'Diferencia',
                    K: 'Moneda',
                    L: 'Fecha de Distribución',
                    M: 'Fecha de Registro',
                },
            ],
            {
                header: [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                ],
                skipHeader: true,
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sdeschannel,
                B: json[i].nnumlot,
                C: json[i].npolicy,
                D: json[i].dissuedat,
                E: this.datePipe.transform(json[i].dstartdate, 'dd/MM/yyyy'),
                F: this.datePipe.transform(json[i].dexpirdat, 'dd/MM/yyyy'),
                G: json[i].nreceipt,
                H: json[i].tarifA_PROTEC,
                I: json[i].tarifA_BROKER,
                J: json[i].diferencia,
                K: json[i].sdescript,
                L: json[i].dcompdate,
                M: json[i].feregistro,
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
    public exportChannelBatchReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Punto de Ventas',
                    C: 'N° Lote',
                    D: 'N° Certificado',
                    E: 'Tipo Certificado',
                    F: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sdeschannel,
                B: json[i].nnumlot,
                C: json[i].npolicy,
                D: json[i].dissuedat,
                E: json[i].dissuedat,
                F: json[i].dissuedat,
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
    public exportAssignReassignReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Canal de venta',
                    B: 'Punto de Ventas',
                    C: 'N° Lote',
                    D: 'N° Certificado',
                    E: 'Tipo Certificado',
                    F: 'Estado',
                },
            ],
            { header: ['A', 'B', 'C', 'D', 'E', 'F'], skipHeader: true }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].sdeschannel,
                B: json[i].nnumlot,
                C: json[i].npolicy,
                D: json[i].dissuedat,
                E: json[i].dissuedat,
                F: json[i].dissuedat,
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
    }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFileOI(excelBuffer, excelFileName);
    }

    public exportAsExcelFileTrama(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFileTrama(excelBuffer, excelFileName);
    }

    saveAsExcelFileTrama(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(
            data,
            fileName + '_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }

    //INI MMQ 14-03-2023
    public exportAsExcelFileCB(reciboData: any[], operacionData: any[], excelFileName: string): void {
        /* crea libro*/
        var wb = XLSX.utils.book_new();

        /* crea sheet RECIBO (hoja) */
        var wsRecibo = XLSX.utils.json_to_sheet(reciboData);

        /* agrega sheet RECIBO al workbook */
        XLSX.utils.book_append_sheet(wb, wsRecibo, "RECIBO");

        /* crea sheet OPERACAION (hoja) */
        var wsOperacion = XLSX.utils.json_to_sheet(operacionData);

        /* agrega sheet OPERACAION al workbook */
        XLSX.utils.book_append_sheet(wb, wsOperacion, "OPERACIÓN");


        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data1 = new Blob([excelBuffer], { type: fileType });
        this.saveAsExcelFileOI(data1, excelFileName);
    }
    //FIN MMQ 14-03-2023

    public exportNCExcelFile(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'Comprobante', B: 'Derecho_Emision', C: 'Fecha_emision_poliza',
                D: 'Fecha_Comprobante', E: 'Estado', F: 'Fecha_Estado',
                G: 'Prima', H: 'Impuesto', I: 'Prima_Total',
                J: 'Documento_Identificacion', K: 'Nombre_Cliente', L: 'Numero_Poliza',
                M: 'Factura_Origen', N: 'Fecha_Emision', O: 'Importe_Total',
                P: 'Transaccion', Q: 'Inicio_Poliza', R: 'Fin_Poliza',
                S: 'Factura_Afecta', T: 'Monto_Afecta', U: 'Modo_Uso',
                V: 'Monto_Usado', W: 'Saldo', X: 'Fecha_aplicacion',
                Y: 'Fecha_Anulacion',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'], skipHeader: true });

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].COMPROBANTE,
                B: json[i].DERECHO_EMISION,
                C: json[i].EMISION_FAC_AFECTA,
                D: json[i].FECHA_COMPROBANTE,
                E: json[i].ESTADO_COMPROBANTE,
                F: json[i].FECHA_ESTADO,
                G: json[i].PRIMA_NETA,
                H: json[i].IMPUESTO,
                I: json[i].PRIMA_TOTAL,
                J: json[i].SCLINUMDOCU,
                K: json[i].SCLIENAME,
                L: json[i].NPOLICY,
                M: json[i].FACTURA_ORIGEN,
                N: json[i].FECH_EMI_POLI,
                O: json[i].IMPORTTOTAL,
                P: json[i].TRANSACCION,
                Q: json[i].INICIO_POLIZA,
                R: json[i].FIN_POLIZA,
                S: json[i].FACTURA_AFECTA,
                T: json[i].MONTO_FAC_AFECTA,
                U: json[i].MODO_DE_USO,
                V: json[i].MONTO_USADO,
                W: json[i].SALDO_NC,
                X: json[i].FECHA_APLICACION,
                Y: json[i].FECHA_ANULACION,
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportRefacExcelFile(json: any[], excelFileName: string): void {//generador de excel para refacturación

        const listados = [];

        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'Ramo', B: 'Producto', C: 'Póliza',
                D: 'Comprobante nuevo', E: 'Fecha comprobante nuevo', F: 'Cliente',
                G: 'Comprobante origen', H: 'Fecha comprobante origen', I: 'Monto comp.',
                J: 'Nota de crédito', K: 'usuario', L: 'Fecha refacturación',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], skipHeader: true });

        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].RAMO,
                B: json[i].PRODUCTO,
                C: json[i].NPOLICY,
                D: json[i].COMPROBANTE_NUEVO,
                E: json[i].FECHA_COMPROBANTE_NUEVO,
                F: json[i].SCLIENAME,
                G: json[i].COMPROBANTE_ORIGEN,
                H: json[i].FECHA_COMPROBANTE_ORIGEN,
                I: json[i].MONTO_COMPROBANTE,
                J: json[i].NOTA_CREDITO,
                K: json[i].USUARIO,
                L: json[i].FECHA_REFACTURACION,
            };

            listados.push(object);
        }


        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportRefacExcelFileM(json: any[], excelFileName: string): void {//generador de excel para refacturación

        const listados = [];

        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'Ramo', B: 'Producto', C: 'Póliza',
                D: 'Comprobante nuevo', E: 'Fecha comprobante nuevo', F: 'Cliente',
                G: 'Comprobante origen', H: 'Fecha comprobante origen', I: 'Monto comp.',
                J: 'Nota de crédito', K: 'usuario', L: 'Fecha refacturación',
                M: 'Motivo',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], skipHeader: true });

        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].RAMO,
                B: json[i].PRODUCTO,
                C: json[i].NPOLICY,
                D: json[i].COMPROBANTE_NUEVO,
                E: json[i].FECHA_COMPROBANTE_NUEVO,
                F: json[i].SCLIENAME,
                G: json[i].COMPROBANTE_ORIGEN,
                H: json[i].FECHA_COMPROBANTE_ORIGEN,
                I: json[i].MONTO_COMPROBANTE,
                J: json[i].NOTA_CREDITO,
                K: json[i].USUARIO,
                L: json[i].FECHA_REFACTURACION,
                M: json[i].MOTIVO,
            };

            listados.push(object);
        }


        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public expNcMasExcelFile(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'PÓLIZA', B: 'COMPROBANTE', C: 'NC',
                D: 'FECHA DE NC', E: 'MONTO',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E'], skipHeader: true });

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].NPOLICY,
                B: json[i].SCOMPROBANTE,
                C: json[i].SNC,
                D: this.datePipe.transform(json[i].DDESDE, 'dd/MM/yyyy'),
                E: json[i].SPRIMA
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public expErrorNcMasExcelFile(json: any[], excelFileName: string): void {  //migrantes 22/02/2024
        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'RAMO', B: 'PRODUCTO', C: 'POLIZA',
                D: 'CLIENTE', E: 'COMPROBANTE', F:'RECIBO', 
                G: 'FECHA INICIO', H:'FECHA FIN', I: 'PRIMA',
                J: 'ERROR',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E','F','G','H','I','J'], skipHeader: true });

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].SBRANCH,
                B: json[i].SPRODUCT,
                C: json[i].NPOLICY,
                D: json[i].SCLIENT,
                E: json[i].SCOMPROBANTE,
                F: json[i].NRECEIPT,
                G: this.datePipe.transform(json[i].DDESDE, 'dd/MM/yyyy'),
                H: this.datePipe.transform(json[i].DEXPIRDAT, 'dd/MM/yyyy'),
                I: json[i].SPRIMA,
                J: json[i].SMENERROR

            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportDevoReport(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'CUENTA ORIGEN', B: 'NUMERO ORIGEN', C: 'TIPO ORIGEN',
                D: 'CUENTA DESTINO', E: 'NUMERO DESTINO', F: 'TIPO DESTINO',
                G: 'SUBTIPO DESTINO', H: 'MONTO ORIGEN', I: 'MONTO DESTINO',
                J: 'CONCEPTO', K: 'ENTIDAD FINANCIERA', L: 'MONEDA',
                M: 'BENEFICIARIO', N: 'CONTRIBUYENTE', O: 'CENTRO COSTO',
                P: 'CUENTA CONTABLE', Q: 'DATO1', R: 'DATO2',
                S: 'DATO3',

            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'], skipHeader: true });

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].SCUENTAORIGEN,
                B: json[i].NORIGEN,
                C: json[i].STIPORIGEN,
                D: json[i].SCUENTADESTINO,
                E: json[i].NNUMDESTINO,
                F: json[i].STIPODESTINO,
                G: json[i].NSUBTIPODESTINO,
                H: json[i].NMONTOORIGEN,
                I: json[i].NMONTODESTINO,
                J: json[i].SCONCEPTO,
                K: json[i].SENTIDADFINAN,
                L: json[i].SMONEDA,
                M: json[i].SBENEFICIARIO,
                N: json[i].SCONTRIBUYENTE,
                O: json[i].SCENTROCOSTO,
                P: json[i].SCUENTACONTABLE,
                Q: json[i].SDATO1,
                R: json[i].SDATO2,
                S: json[i].SDATO3,
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'Destino': ws }, SheetNames: ['Destino'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportDevoReport2(json: any[], excelFileName: string): void {
        console.log("DATA3 - ", json);
        const ws = XLSX.utils.json_to_sheet([
            {
                A: 'CUENTA ORIGEN', B: 'NUMERO ORIGEN', C: 'TIPO ORIGEN',
                D: 'FECHA DOCUMENTO', E: 'CONCEPTO', F: 'BENEFICIARIO',
                G: 'CONTRIBUYENTE', H: 'MONTO', I: 'DETALLE',
                J: 'SUBTIPO', K: 'SUGERIR NUMERO ORIGEN', L: 'MONTO COMISIÓN',
                M: 'PAQUETE', N: 'TIPO ASIENTO', O: 'NUMERO DE OPERACIÓN'
            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], skipHeader: true });

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].SCUENTAORIGEN,
                B: json[i].NORIGEN,
                C: json[i].STIPORIGEN,
                D: json[i].DFECHAHOY,
                E: json[i].SCONCEPTO,
                F: json[i].SBENEFICIARIO,
                G: json[i].SCONTRIBUYENTE,
                H: json[i].NMONTOORIGEN,
                I: json[i].SCONCEPTO,
                J: 'Devolucion de Primas',
                K: 'SI',
                L: '',
                M: '',
                N: '',
                O: ''
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2', });

        const wsp = XLSX.utils.json_to_sheet([
            {
                A: 'CUENTA ORIGEN', B: 'NUMERO ORIGEN', C: 'TIPO ORIGEN',
                D: 'CUENTA DESTINO', E: 'NUMERO DESTINO', F: 'TIPO DESTINO',
                G: 'SUBTIPO DESTINO', H: 'MONTO ORIGEN', I: 'MONTO DESTINO',
                J: 'CONCEPTO', K: 'ENTIDAD FINANCIERA', L: 'MONEDA',
                M: 'BENEFICIARIO', N: 'CONTRIBUYENTE', O: 'CENTRO COSTO',
                P: 'CUENTA CONTABLE', Q: 'DATO1', R: 'DATO2',
                S: 'DATO3'

            }
        ], { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'], skipHeader: true });

        const listadosp = [];
        for (let i = 0; i < json.length; i++) {
            const object2 = {
                A: json[i].SCUENTAORIGEN,
                B: json[i].NORIGEN,
                C: json[i].STIPORIGEN,
                D: json[i].SCUENTADESTINO,
                E: json[i].NNUMDESTINO,
                F: json[i].STIPODESTINO,
                G: json[i].NSUBTIPODESTINO,
                H: json[i].NMONTOORIGEN,
                I: json[i].NMONTODESTINO,
                J: json[i].SCONCEPTO,
                K: json[i].SENTIDADFINAN,
                L: json[i].SMONEDA,
                M: json[i].SBENEFICIARIO,
                N: json[i].SCONTRIBUYENTE,
                O: json[i].SCENTROCOSTO,
                P: json[i].SCUENTACONTABLE,
                Q: json[i].SDATO1,
                R: json[i].SDATO2,
                S: json[i].SDATO3,
            };

            listadosp.push(object2);
        }
        XLSX.utils.sheet_add_json(wsp, listadosp, { skipHeader: true, origin: 'A2', });

        const workbook: XLSX.WorkBook = { Sheets: { 'Origen': ws, 'Destino': wsp }, SheetNames: ['Origen', 'Destino'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
}
