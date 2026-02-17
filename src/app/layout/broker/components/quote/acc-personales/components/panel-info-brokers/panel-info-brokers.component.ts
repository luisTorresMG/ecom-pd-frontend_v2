import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchBrokerComponent } from '../../../../../modal/search-broker/search-broker.component';
import { StorageService } from '../../core/services/storage.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AccPersonalesService } from '../../acc-personales.service';

@Component({
    selector: 'panel-info-brokers',
    templateUrl: './panel-info-brokers.component.html',
    styleUrls: ['./panel-info-brokers.component.css'],
})
export class PanelInfoBrokersComponent implements OnInit, OnChanges {
    @Input() detail: boolean;
    @Input() vista: any;
    @Input() brokers: any = [];
    @Input() brokersEndoso: any = [];
    @Output() brokersChange: EventEmitter<any> = new EventEmitter();
    @Input() initialize: boolean;
    proponerComision: boolean;
    brokersEliminados: any = [];
    @Input() brokersOriginales: any = [];
    CONSTANTS: any = AccPersonalesConstants;
    comisionDefault: any;
    @Input() recargar: any;
    @Output() recargarChange: EventEmitter<any> = new EventEmitter();
    @Input() cotizacion: any;
    @Output() cotizacionChange: EventEmitter<any> = new EventEmitter();

    ramoProductoVG = JSON.parse(localStorage.getItem('vidaGrupoID'))['nbranch'];
    ramoProductoAP = JSON.parse(localStorage.getItem('accPerID'))['nbranch'];
    sumaComision: any;

    constructor(
        private modal: NgbModal,
        public storageService: StorageService,
        public accPersonalesService: AccPersonalesService
    ) { }

    ngOnInit() {
        this.brokers = this.brokers || [];
        this.detail = this.detail || false;
        this.brokersChange.emit(this.brokers);
        if (this.initialize) {
            if (
                this.storageService.esPerfilExterno ||
                this.storageService.template.ins_iniciarBroker
            ) {
                this.setBrokerByDefault();
            }
        }

        if (this.vista.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
            this.obtenerComision();
        }
    }

    ngOnChanges(changes) {
        if (changes.recargar && changes.recargar.currentValue === true) {
            setTimeout(() => {
                this.validarMontoComision();
                this.recargarChange.emit(false);
            });
        }
    }

    obtenerComision() {
        //this.accPersonalesService.getTiposComision().subscribe((res) => {
        //this.comisionDefault = res.nroComision;
        this.brokers.forEach((item) => {
            item.P_COM_SALUD = !!this.vista.trama ? this.vista.trama.COMISION_BROKER : 0;
            //});
        });
    }

    async setBrokerByDefault() {

        const result = await this.getTypeInter();

        // Datos del comercializador
        const broker: any = {
            NTYPECHANNEL: this.storageService.user['tipoCanal'],
            COD_CANAL: this.storageService.user['canal'],
            NCORREDOR: this.storageService.user['brokerId'],
            NTIPDOC: this.storageService.user['sclient'].substr(1, 1),
            NNUMDOC: this.storageService.user['sclient'].substr(3),
            RAZON_SOCIAL: this.storageService.user['desCanal'],
            PROFILE: this.storageService.user['profileId'],
            SCLIENT: this.storageService.user['sclient'],
            P_NPRINCIPAL: 0,
            P_COM_SALUD: result.ninterType != 1 ? this.comisionDefault : 0,
            P_COM_SALUD_PRO: 0,
            P_SEDIT: 'I',
            NINTERTYP: result.ninterType,
            valItemPen: false,
            valItemSal: false,
            showDelete: !this.storageService.esPerfilExterno,
            editarTasa: false,
            nintermed: result.nintermed, //AVS - COMISIONES
        };
        this.brokers.push(broker);
        this.brokersChange.emit(this.brokers);
    }

    async getTypeInter() {
        let ninterType = 0;
        let nintermed = 0;

        let request: any = {
            P_IS_AGENCY: 0,
            P_NTIPO_BUSQUEDA: 1,
            P_NTIPO_DOC: this.storageService.user['sclient'].substr(1, 1),
            P_NNUM_DOC: this.storageService.user['sclient'].substr(3),
            P_SNOMBRE: '',
            P_SAP_PATERNO: '',
            P_SAP_MATERNO: '',
            P_SNOMBRE_LEGAL: ''
        };

        await this.accPersonalesService.searchBroker(request).toPromise()
            .then(async (res: any) => {

                if (res.P_NCODE == 0) {
                    if (res.listBroker.length > 0) {
                        ninterType = res.listBroker[0].NINTERTYP;
                        nintermed = res.listBroker[0].NINTERMED;
                    }
                }
            }, err => {
                ninterType = 0;
                nintermed = 0;
            });

        return { ninterType, nintermed };
    }

    limpiarComision() {
        let comProPreview = 0;

        console.log('this.proponerComision', this.proponerComision);
        console.log('this.cotizacion', this.cotizacion);
        console.log('this.cotizacion.modoVista', this.cotizacion.modoVista);
        console.log('this.cotizacion.modoRenovacionEditar', this.cotizacion.modoRenovacionEditar);
        console.log('this.brokers', this.brokers);

        // if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.modoRenovacionEditar) {
        //     this.brokers.forEach((item) => {
        //         // comProPreview = comProPreview + item.P_COM_SALUD_PRO;
        //         item.P_COM_SALUD_PRO = item.P_COM_SALUD;
        //     });
        // } else {
            this.brokers.forEach((item) => {
                // comProPreview = comProPreview + item.P_COM_SALUD_PRO;
                item.P_COM_SALUD_PRO = 0;
            });
        // }

        if (!this.proponerComision) {
            this.recargarChange.emit(true);
        }

    }

    clickAdd() {
        const modalRef = this.modal.open(SearchBrokerComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.listaBroker = this.brokers;
        // modalRef.componentInstance.brokerMain = this.inputsCovid.P_SIDDOC_COM;
        modalRef.result.then((brokerData) => {
            brokerData.P_COM_SALUD = brokerData.COD_CANAL != this.CONSTANTS.BKDIRECTO ? this.comisionDefault : 0;
            brokerData.P_COM_SALUD_PRO = 0;
            brokerData.PROFILE = this.storageService.userId;
            brokerData.NCORREDOR = brokerData.NCORREDOR || brokerData.COD_CANAL;
            brokerData.BLOCK = true;
            brokerData.valItemPen = false;
            brokerData.valItemSal = false;
            brokerData.P_SEDIT = 'I';
            brokerData.P_NPRINCIPAL = 0;
            this.brokers.push(brokerData);
            this.brokersChange.emit(this.brokers);
        });
    }

    clickDelete(broker) {
        swal
            .fire({
                title: 'Eliminar Broker',
                text: '¿Estás seguro que deseas eliminar este broker?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
            .then((result) => {
                if (result.value) {
                    let index = this.brokers.indexOf(broker);
                    this.brokers.splice(index, 1);

                    if (this.detail) {
                        this.brokersEliminados = [];
                        let arrayDelete = [];

                        arrayDelete.push(broker);

                        (arrayDelete || []).forEach((broker) => {
                            this.brokersEliminados.push({
                                COD_CANAL: broker.COD_CANAL,
                                NNUMDOC: broker.NNUMDOC,
                                NTIPDOC: broker.NTIPDOC,
                                NTYPECHANNEL: broker.NTYPECHANNEL,
                                P_COM_SALUD: broker.P_COM_SALUD,
                                P_COM_SALUD_PRO: broker.P_COM_SALUD_PRO,
                                P_NPRINCIPAL: broker.P_NPRINCIPAL,
                                P_SEDIT: 'D',
                                RAZON_SOCIAL: broker.RAZON_SOCIAL,
                                SCLIENT: broker.SCLIENT,
                            });
                        });

                        (this.brokers || []).forEach((brokers) => {
                            this.brokersEndoso.push(brokers);
                        });

                        (this.brokersOriginales || []).forEach((broker) => {
                            (this.brokersEliminados || []).forEach((broker1) => {
                                if (broker.NNUMDOC == broker1.NNUMDOC) {
                                    this.brokersEndoso.push(broker1);
                                }
                                (this.brokersEndoso || []).forEach((broker2) => {
                                    if (
                                        broker1.NNUMDOC == broker2.NNUMDOC &&
                                        broker2.P_SEDIT == 'U'
                                    ) {
                                        let index = this.brokersEndoso.indexOf(broker2);
                                        this.brokersEndoso.splice(index, 1);
                                    }
                                });
                            });
                        });
                    }
                }

                this.brokersChange.emit(this.brokers);

                // if (this.brokers.length == 0) {
                //   // this.vista.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
                //   // // this.vista.poliza.tipoFacturacion = [{ codigo: '', valor: '- Seleccione -' }];
                //   // this.vista.poliza.listReglas = {
                //   //   flagComision: false,
                //   //   flagCobertura: false,
                //   //   flagAsistencia: false,
                //   //   flagBeneficio: false,
                //   //   flagSiniestralidad: false,
                //   //   flagAlcance: false,
                //   //   flagTemporalidad: false
                //   // };

                //   // this.limpiarCotizador();
                // }
            });
    }

    validarVerComision(tipoComision) {
        let verComision = false;

        const estadoUltimo = this.vista.historialList.length > 0 ? this.vista.historialList[0].Status : '';

        if (this.vista.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            this.vista.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR ||
            (this.vista.trxPendiente == 'Emisión' && estadoUltimo == this.CONSTANTS.ESTADOS.POR_AUTORIZAR) ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.modoRenovacionEditar)) {
            verComision = true;
        } else {
            verComision = tipoComision == 1 ? true : false;
        }

        return verComision;
    }

    // limpiarCotizador() {
    //   this.vista.trama.validado = false;
    //   this.vista.trama.TOT_ASEGURADOS = '';
    //   this.vista.trama.MONT_PLANILLA = 0;
    //   this.vista.trama.PRIMA = this.vista.trama.PRIMA_DEFAULT;
    //   this.vista.trama.SUM_ASEGURADA = 0;
    //   this.vista.cotizador.calculado = false;
    //   this.vista.coberturas = [];
    //   this.vista.primaNeta = this.vista.trama.PRIMA_DEFAULT;
    // }

    validarMontoComision() {
        let flag = false;
        this.sumaComision = this.cotizacion.cotizador ? (this.cotizacion.cotizador.comisionList?.length > 0 ? this.cotizacion.cotizador.comisionList[0].MAX_COMISION : 0) : 0;
        if (this.sumaComision != 0) {
            flag = true;
        }
        return flag;
    }

    onComisionProChange(nuevoValor: any) {

        if (nuevoValor != 0) {
            this.recargarChange.emit(true);
        } else {
            this.proponerComision = !this.proponerComision;
            this.recargarChange.emit(true);
        }
    }
}
