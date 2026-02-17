import { Component, OnInit } from '@angular/core';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { forkJoin } from "rxjs";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-eecc-report',
    templateUrl: './eecc-report.component.html',
    styleUrls: ['./eecc-report.component.scss']
})

export class EeccReportComponent implements OnInit {

    isLoading: boolean = false;
    meses: any = [];
    anios: any = [];
    fileName: any;
    archivoNombre: string = "";
    mes: any = "";
    anio: string = "";
    data: any = [];
    dataSet: any = [];
    ListEECC: any;
    primeraColumna: any = [];

    listResults: any = [];
    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 5;
    totalItems = 0;
    maxSize = 10;

    constructor(
        private vidaInversionService: VidaInversionService
    ) { }

    ngOnInit(): void {
        this.getParams();
        this.getRecord();
    }

    getParams = () => {
        this.isLoading = true;
        let $meses = this.vidaInversionService.GetMonthsEeccVigp();
        let $anios = this.vidaInversionService.GetYearsEeccVigp();
        return forkJoin([$meses, $anios]).subscribe(
            res => {
                this.isLoading = false;
                if (res[0].P_NCODE == 0) {
                    this.meses = res[0].P_TABLE;
                } else {
                    Swal.fire('Información', res[0].P_SMESSAGE, 'error');
                }
                if (res[1].P_NCODE == 0) {
                    this.anios = res[1].P_TABLE;
                } else {
                    Swal.fire('Información', res[1].P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        )
    }

    onFileChange = (evt: any) => {
        this.archivoNombre = null;
        this.data = null;
        this.dataSet = null;
        const target: DataTransfer = <DataTransfer>(evt.target);
        this.archivoNombre = target.files[0].name;
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            this.data = <any>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
            this.dataSet = this.data;
        };
        reader.readAsBinaryString(target.files[0]);
        evt.target.value = null;
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.listResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    getRecord = () => {
        this.isLoading = true;
        this.vidaInversionService.GetRecordEeccVigp().subscribe(
            res => {
                this.isLoading = false;
                if (res.P_NCODE == 0) {
                    this.currentPage = 1;
                    this.listResults = res.P_TABLE;
                    this.totalItems = this.listResults.length;
                    this.listToShow = this.listResults.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                } else {
                    Swal.fire('Información', res.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener el Histórico.', 'error');
            }
        )
    }

    upload = () => {
        this.isLoading = true;
        if (this.anio == "" || this.mes == "" || this.archivoNombre == "") {
            this.isLoading = false;
            Swal.fire('Información', 'Es obligatorio seleccionar las opciones de los campos y adjuntar un archivo Excel.', 'error');
        } else {
            this.primeraColumna = this.dataSet[0];
            if (this.primeraColumna.length != 2) {
                this.isLoading = false;
                Swal.fire('Información', 'El archivo no tiene el formato o estructura correcta.', 'warning');
                return;
            } else {
                var cabecera = [ "FECHA", "BENCHMARK" ]
                for (var i = 0; i < cabecera.length; i++) {
                    if (cabecera[i].toUpperCase().trim() != this.primeraColumna[i].toUpperCase().trim()) {
                        this.isLoading = false;
                        Swal.fire('Información', 'Los nombres de la cabecera no coinciden: FECHA y BENCHMARK', 'warning');
                        return;
                    }
                }
                if (this.dataSet.length > 1) {
                    this.vidaInversionService.GetMaxRecordEeccVigp().subscribe(
                        res => {
                            if (res.P_NCODE == 0) {
                                var next_id: any = res.P_TABLE[0].NEXT_RECORD;
                                var item: any = {
                                    P_NID_RECORD: next_id,
                                    P_DESC_RECORD: this.archivoNombre,
                                    P_MONTH: this.mes,
                                    P_NID_YEAR: this.anio,
                                    P_SUSERCODE: JSON.parse(localStorage.getItem('currentUser')).username
                                }
                                this.vidaInversionService.InsertEeccRecordVigp(item).subscribe(
                                    res => {
                                        if (res.P_NCODE == 0) {
                                            this.ListEECC = {};
                                            this.ListEECC.P_LIST = [];
                                            for (var i = 1; i < this.dataSet.length; i++) {
                                                var item: any = {};
                                                item.P_NID_RECORD = next_id;
                                                item.P_DEECC_DATE = this.dataSet[i][0]?.trim();
                                                item.P_NEECC_BENCHMARK = this.dataSet[i][1]?.trim();
                                                this.ListEECC.P_LIST.push(item);
                                            }
                                            this.vidaInversionService.InsertEeccReportListVigp(this.ListEECC).subscribe(
                                                res => {
                                                    if (res.P_NCODE == 0) {
                                                        this.isLoading = false;
                                                        this.getRecord();
                                                        Swal.fire('Información', 'Se realizó la carga del archivo de forma exitosa.', 'success');
                                                    } else {
                                                        this.isLoading = false;
                                                        Swal.fire('Información', res.P_SMESSAGE, 'warning');
                                                    }
                                                },
                                                err => {
                                                    this.isLoading = false;
                                                    Swal.fire('Información', 'Ha ocurrido un error al procesar los datos.', 'error');
                                                }
                                            )
                                        } else {
                                            this.isLoading = false;
                                            Swal.fire('Información', res.P_SMESSAGE, 'warning');
                                        }
                                    },
                                    err => {
                                        this.isLoading = false;
                                        Swal.fire('Información', 'Ha ocurrido un error al registrar el Histórico.', 'error');
                                    }
                                )
                            } else {
                                this.isLoading = false;
                                Swal.fire('Información', res.P_SMESSAGE, 'warning');
                            }
                        },
                        err => {
                            this.isLoading = false;
                            Swal.fire('Información', 'Ha ocurrido un error al obtener el ID del Histórico.', 'error');
                        })
                } else {
                    this.isLoading = false;
                    Swal.fire('Información', 'No existen datos.', 'warning');
                }
            }
        }
    }
}