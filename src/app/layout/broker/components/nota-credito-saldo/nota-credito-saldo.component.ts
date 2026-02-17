import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import swal from 'sweetalert2';

import { AppConfig } from '../../../../app.config';
import { setSerialNumber, sortArray } from '../../../../shared/helpers/utils';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { ReporteNotaCreditoService } from '../../services/reporte-nota-credito/reporte-nota-credito.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { Comprobante } from '../../../client/shared/models/comprobante.model';
import { EmisionService } from '../../../client/shared/services/emision.service';
@Component({
    selector: 'app-nota-credito-saldo',
    templateUrl: './nota-credito-saldo.component.html',
    styleUrls: ['./nota-credito-saldo.css']
})

export class NotaCreditoSaldoComponent implements OnInit {
    @ViewChild('childModalMensaje', { static: true })
    childModalMensaje: ModalDirective;
    @ViewChild('childModalEdicion', { static: true })
    childModalEdicion: ModalDirective;
    @ViewChild('childModalEdicionMail', { static: true })
    childModalEdicionMail: ModalDirective;
    @ViewChild('modalSuccessSenMail', { static: true })
    modalSuccessSenMail: ModalDirective;

    @ViewChild('errorSearchForm', { static: false, read: ElementRef })
    errorSearchForm: ElementRef;

    // CONFIGURACIÓN FECHAS
    bsConfig: Partial<BsDatepickerConfig>;
    currentDate: Date = new Date();
    bsStartValue: Date = new Date(this.currentDate.setDate(this.currentDate.getDate() - 31));
    bsEndValue: Date = new Date();
    isValidDate: boolean = true;

    messageErrorForm: string = '';
    userCode: number;
    channelUser: number;
    channelList: any[];
    billsDataGlobal: any[] = [];
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    haveBillsData = false;
    billsData: any[] = [];

    mailBroker: '';
    razonSocialBroker: '';
    numeroDocumentoBroker: '';
    codigoBroker: 0;
    codigoClienteBroker: '';

    searchtext = '';
    comprobantes = [];
    comprobantesRow = [];
    mailCollection = [];
    uniqueMailCollection = [];

    messagevalidation = '';
    loadingdata = false;
    searchcheck = '-1';
    p = 0;
    edicionForm: FormGroup;
    edicionMailForm: FormGroup;
    enviarContratantes = false;
    profile_admin = AppConfig.PROFILE_ADMIN_SOAT;
    showDescarga = false;
    IS_ADMIN: number;
    frmSearchForAdmin: FormGroup;
    startDateControl: FormControl = this.formBuilder.control(this.bsStartValue);
    endDateControl: FormControl = this.formBuilder.control(this.bsEndValue);
    dataNc: any[] = [];
    contador: any;
    isProtecta: boolean;

    nroPoliza: string;
    nroComprobante: string;
    filteredData: any = [];
    filterForm: FormGroup;
    dataOriginal: any = [];
    constructor(
        private spinner: NgxSpinnerService,
        private emissionService: EmisionService,
        private excelService: ExcelService,
        private channelService: ChannelSalesService,
        private reporteNotaCreditoService: ReporteNotaCreditoService,
        private formBuilder: FormBuilder
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                containerClass: 'theme-dark-blue',
                showWeekNumbers: false,
            }
        );
        this.IS_ADMIN = Number(
            JSON.parse(localStorage.getItem('currentUser')).profileId
        );
        this.frmSearchForAdmin = this.formBuilder.group({
            poliza: [null],
            comprobante: [null],
            documento: [null],
        });
    }



    ngOnInit() {
        this.isProtecta = true;
        this.contador = false;
        this.channelUser = this.currentUser.canal;
        this.userCode = this.currentUser && this.currentUser.id;
        this.nroPoliza = null;
        this.listChannel();
        this.listComprobantes(this.channelUser);


        this.edicionForm = this.formBuilder.group({
            tipoenvio: ['', Validators.required],
            envioContratante: [true, Validators.required],
            mailbroker: [
                '',
                [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
            ],
        });

        this.edicionMailForm = this.formBuilder.group({
            mailcontratante: [
                '',
                [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
            ],
            codigocontratante: ['', [Validators.required]],
        });
        this.habilitarDescargas();

        this.startDateControl.valueChanges.subscribe(() => this.checkDateRange());
        this.endDateControl.valueChanges.subscribe(() => this.checkDateRange());

    }



    checkDateRange(): void {
        const startDate = new Date(this.startDateControl.value);
        const endDate = new Date(this.endDateControl.value);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const timeDiff = endDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (timeDiff >= 0 && diffDays <= 31) {
            this.isValidDate = true;
        } else {
            this.isValidDate = false;
        }

        console.log(this.isValidDate);
    }


    clearFrmSearch(): void {
        this.nroPoliza = null;
        this.billsData = [];
        this.billsDataGlobal = [];
        this.comprobantes = [];
        this.frmSearchForAdmin.reset();
        this.startDateControl.reset();
        this.endDateControl.reset();
        this.startDateControl.setValue(this.bsStartValue);
        this.endDateControl.setValue(this.bsEndValue);
        this.messageErrorForm = '';
        this.searchtext = '';
        this.searchcheck = '-1';
        this.nroComprobante = '';
        this.nroPoliza = '';
        this.dataNc = this.filteredData.GenericResponse;
    }

    searchListData(): void {
        this.listComprobantes(this.channelUser)
    }

    listChannel(): void {
        this.channelService
            .getPostChannelSales(new ChannelSales(this.userCode, '0', ''))
            .subscribe(
                (data) => {
                    this.channelList = <any[]>data;
                    if (AppConfig.FILTER_CHANNEL_ONLY_BROKER.res) {
                        // tslint:disable-next-line:max-line-length
                        this.channelList = this.channelList.filter(
                            (x) =>
                                x.nchannel.toString() ===
                                AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel?.toString()
                        );
                        this.listComprobantes(AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel);
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    habilitarDescargas() {
        this.showDescarga = false;
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (this.profile_admin === user.profileId) {
            this.showDescarga = true;
        }
    }

    async descargarExcelTest() {
        const idata = {
            codCanal: this.currentUser.canal.toString(),
            idPoliza: this.nroPoliza,
            idComprobante: null,
            initDate: moment(this.startDateControl.value).format('DD/MM/YYYY'),
            endDateC: moment(this.endDateControl.value).format('DD/MM/YYYY'),
            desCanal: this.currentUser.desCanal.toString(),
            rucBroker: this.currentUser.codCliente
        }
        this.spinner.show();
        await this.reporteNotaCreditoService.ReportNCEstExcel(idata).toPromise()
            .then((res: any) => {
                this.spinner.hide();
                if (res == "") {
                    swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
                } else {
                    const blob = this.b64toBlob(res);
                    const blobUrl = URL.createObjectURL(blob);
                    let a = document.createElement("a")
                    a.href = blobUrl
                    a.download = "Reporte_Nota_Credito_Disponible.xlsx"
                    a.click()
                };
            },
                err => {
                    this.spinner.hide();
                    swal.fire('Información', 'Error al descargar Excel', 'warning');
                    console.log(err);
                });
    }

    b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    async listComprobantes(canal: any) {
        this.billsData = [];
        this.billsDataGlobal = [];
        this.searchtext = '';
        this.searchcheck = '-1';
        this.loadingdata = true;
        this.spinner.show();
        const idata = {
            codCanal: canal.toString(),
            idPoliza: this.nroPoliza,
            idComprobante: this.nroComprobante,
            initDate: moment(this.startDateControl.value).format('DD/MM/YYYY'),
            endDateC: moment(this.endDateControl.value).format('DD/MM/YYYY')
        }
        try {
            const res: any = await this.reporteNotaCreditoService.getNotaCreditoPendiente(idata).toPromise();
            this.dataNc = res.GenericResponse;
            this.filteredData = res;
            this.dataOriginal = res;
        }
        catch (error) {
            this.spinner.hide();
            swal.fire({
                title: "Error",
                text: "No se ha podido completar la transacción",
                icon: "warning",
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })
            console.log(error);
        }
        finally {
            this.haveBillsData = this.dataNc.length > 0;
            this.spinner.hide();
            this.loadingdata = false;
            console.log(this.filteredData);
            console.log("Datos recibidos:", this.dataNc);
            if (this.filteredData.Message != null && this.filteredData.Message != 'null') {
                swal.fire({
                    title: "Advertencia",
                    text: this.filteredData.Message,
                    icon: "warning",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
            }
            else {
                if (this.dataNc.length > 0) {
                    this.contador = true;
                    swal.fire({
                        title: "Información",
                        text: "Si desea hacer uso de la nota de crédito con saldo, deberá comunicarse con el buzón de canal corporativo: canalcorporativo@protectasecurity.pe",
                        icon: "info",
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })


                } else {
                    this.contador = false;
                    if (typeof this.nroComprobante !== "undefined" && this.nroComprobante.length > 0) {
                        swal.fire({
                            title: "Advertencia",
                            text: "Comprobante no está asociado a la póliza.",
                            icon: "warning",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                    }
                    else if (typeof this.nroPoliza !== "undefined" && this.nroPoliza.length > 0) {
                        swal.fire({
                            title: "Advertencia",
                            text: " Póliza no existe / no está asociado al canal.",
                            icon: "warning",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                    }
                    else {
                        swal.fire({
                            title: "Advertencia",
                            text: "No se encontro Resultado.",
                            icon: "warning",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                    }
                }
            }
        }
    }


    search(type: number) {
        let canalesFiltrados;
        const term = type == 1 ? this.nroPoliza : type == 2 ? this.nroComprobante : '';
        this.mostrarData();
        if (!term) {
            canalesFiltrados = this.dataNc;
        } else {
            canalesFiltrados = this.dataNc.filter(
                (x) =>

                    x.PRODUCTO
                        ?.trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.DOC_REF
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.COMPROBANTE
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.SERIENUM
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.NAMOUNT
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.RAMO
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.NPOLICY
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.SCLIENAME
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.DEFFECDATE
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase()) ||
                    x.STATUS
                        ?.toString()
                        .trim()
                        .toLowerCase()
                        .includes(term.trim().toLowerCase())

            )
            console.log(canalesFiltrados);
            console.log('Desepues: ' + canalesFiltrados);

        }

        if (this.searchcheck !== '-1') {
            canalesFiltrados = canalesFiltrados.filter(
                (x) => Number(x.enviado) === Number(this.searchcheck)
            );
        }

        this.dataNc = canalesFiltrados;
    }


    mostrarData() {
        console.log('Antes:')
        console.log(this.dataNc);
    }
}
