import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethods } from '../../../../../layout/broker/components/common-methods';
import { AccPersonalesService } from '../../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { StorageService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import * as FileSaver from 'file-saver';
import { ValErrorComponent } from '../../../../../layout/broker/modal/val-error/val-error.component';
import { QuotationService } from '../../../../../layout/broker/services/quotation/quotation.service';
import { ClientInformationService } from '../../../../../layout/broker/services/shared/client-information.service';
import swal from 'sweetalert2';
import { PolicyemitService } from '@root/layout/broker/services/policy/policyemit.service';
import { OthersService } from '@root/layout/broker/services/shared/others.service';
import { FileService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/file.service';
import { DesgravamentConstants } from '../../core/desgravament.constants';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'panel-info-trama',
  templateUrl: './panel-info-trama.component.html',
  styleUrls: ['./panel-info-trama.component.css'],
})
export class PanelInfoTramaComponent implements OnInit, OnChanges {
  @Input() detail: boolean;
  @Input() trama: any;
  @Output() tramaChange: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: any;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();
  @Input() poliza: any;
  @Input() cotizacion: any;
  @Input() itemsSelected: any[] = [];
  @Input() esEvaluacion: any;
  @Input() hiddenDowloadTrama: boolean;
  @Input() cotizador: any;
  @Output() cotizadorChange: EventEmitter<any> = new EventEmitter();
  @Output() itemsSelectedChange: EventEmitter<any> = new EventEmitter();
  @Input() hiddeShowTrama: boolean;
  showTrama: boolean = true;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  variable: any = {};
  CONSTANTS: any = DesgravamentConstants;
  flagMensajeTrama: boolean = false;
  constructor(
    public clientInformationService: ClientInformationService,
    private accPersonalesService: AccPersonalesService,
    public quotationService: QuotationService,
    private storageService: StorageService,
    private othersService: OthersService,
    private fileService: FileService,
    private policyemit: PolicyemitService,
    private modal: NgbModal
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
  }

  ngOnInit() {
    this.trama = this.trama || {};
    this.tramaChange.emit(this.trama);
    this.cotizador = this.cotizador || {}; 
    this.cotizadorChange.emit(this.cotizador); 
    if (!this.cotizacion.modoTrama) {
      this.obtenerPrimaMinima();
    }

    // Configuracion de las variables
    this.variable = CommonMethods.configuracionVariables(
      this.codProducto,
      this.epsItem.NCODE
    );

    this.ChangeHaveTrama();
  }

  ChangeHaveTrama() {
    this.hiddeShowTrama = true;
  }

  ngOnChanges(changes) {
    if (changes.recargar && changes.recargar.currentValue === true) {
      setTimeout(() => {
        this.recargarChange.emit(false);
      });
      this.cambiaDatosPoliza();
    }
  }

  obtenerPrimaMinima() {
    /* this.accPersonalesService.obtenerPrimaMinima().subscribe((res) => {
      this.trama.PRIMA = "0" //res.premium;
      this.trama.PRIMA_DEFAULT = "0" //res.premium;
    }); */
  }

  cambiaDatosPoliza() {
    if (this.cotizacion.cotizador.calculado) {
      this.validarExcel();
    }
      
  }

  validarExcel(validar?) {
    let msg = '';

    if (!this.cotizacion.contratante.tipoDocumento || !this.cotizacion.contratante.numDocumento) {
      msg += 'Debe ingresar un contratante <br>';
    }
    

    if (!this.poliza.tipoPerfil || !this.poliza.tipoPerfil.COD_PRODUCT) {
      msg += 'Debe elegir el tipo de crédito  <br>';
    }

  
    if (this.cotizacion.brokers.length === 0) {
      msg += 'Debe ingresar un broker  <br>';
    }

    if (
      !this.poliza.tipoRenovacion ||
      !this.poliza.tipoRenovacion.COD_TIPO_RENOVACION
    ) {
      msg += 'Debe elegir el tipo de renovación  <br>';
    }

    if (
      !this.poliza.frecuenciaPago ||
      !this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA
    ) {
      msg += 'Debe elegir la frecuencia de pago  <br>';
    }

    if (!this.poliza.fechaInicioPoliza) {
      msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
    }

    if (!this.poliza.tipoPlan || !this.poliza.tipoPlan.ID_PLAN) {
      msg += 'Debe elegir el tipo de plan  <br>';
    }

    if (!this.cotizacion.poliza.moneda || !this.cotizacion.poliza.moneda.NCODIGINT) {
      msg += 'Debe elegir la moneda  <br>';
    }

    if ((!!this.trama.excelSubir && this.trama.excelSubir.length == 0) || !this.trama.excelSubir)  {
      msg += 'Adjunte una trama para validar  <br>';
    }
    if (!!this.cotizacion.endosatario && this.cotizacion.endosatario.length == 0 
      ) {
        msg += 'Debe elegir un endosatario  <br>';
      }
    /*
    if (!this.cotizacion.cotizador.calculado) {
      msg += 'Primero debe calcular   <br>';
    }
    */

    if (msg === '') {

      if (validar) {
        this.flagMensajeTrama = true;
      }

      this.validarTrama();

    } else {
      this.trama.infoPrimaList = [];
      this.trama.infoPlanList = [];

      if (validar) {
        swal.fire('Información', msg, 'error');
      }
    }
  }

  validarTrama(codComission?: any) {
    this.isLoadingChange.emit(true);
    this.trama.infoPrimaList = [];
    this.trama.infoPlanList = [];
    const myFormData: FormData = new FormData();
    const data: any = {
      codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id'],
      desUsuario: this.storageService.user.username,
      codCanal: this.storageService.user.brokerId,
      contratante: this.cotizacion.contratante.id,
      nroPoliza: this.cotizacion.poliza.nroPoliza,
      fechaEfecto: this.cotizacion.tipoTransaccion != 3 ?
        this.cotizacion.tipoTransaccion == 0 && this.cotizacion.tipoTransaccion == 1 ?
          CommonMethods.formatDate(this.poliza.fechaInicioPoliza) :
          CommonMethods.formatDate(this.poliza.fechaInicioAseguradoMes) :
        CommonMethods.formatDate(this.poliza.fechaExclusion),
      fechaExclusion: CommonMethods.formatDate(this.poliza.fechaExclusion),
      tipoExclusion: this.cotizacion.contratante.codTipoCuenta == '1' ? 3 : CommonMethods.formatDate(this.poliza.fechaInicioPoliza) == CommonMethods.formatDate(this.poliza.fechaExclusion) ? 1 : 2,
      devolucionPrima: !!this.cotizacion.devolucionPrima && this.cotizacion.devolucionPrima.DEV_PRI ? 1 : 0,
      fechaFin: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
      comision: 0,
      tipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
      freqPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
      type_mov: this.cotizacion.tipoTransaccion,
      codProducto: this.poliza.producto.COD_PRODUCT,
      codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
      flagCot: 1,
      planillaMax: 0,
      flagPolizaEmision: 2,
      topeLey: 0,
      fechaActual: null,
      codProceso: this.trama.NIDPROC,//codProceso: this.trama.NIDPROC, Cambiar cuando se valide a futuro, esto es SOLO para desgravamen unitario
      planTariffList: [
        {
          planId: null,//planId: this.poliza.tipoPerfil.NIDPLAN, Cambiar cuando se valide a futuro, esto es SOLO para desgravamen unitario
          planDes: null,//planDes: this.poliza.tipoPerfil.SDESCRIPT, Cambiar cuando se valide a futuro, esto es SOLO para desgravamen unitario
          prima: null,//prima: this.poliza.tipoPerfil.NPREMIUM, Cambiar cuando se valide a futuro, esto es SOLO para desgravamen unitario
        },
      ],
      //codActividad: this.poliza.tipoActividad.Id,
      codActividad: this.poliza.actividad.Id,
      flagComisionPro: 0,
      comisionPro: 0,
      tasaObreroPro: 0,
      tasaEmpleadoPro: 0,
      nroCotizacion: this.cotizacion.numeroCotizacion || 0,
      premiumPlan: null,
      premiumPlanPro: '',
      desPlan: this.poliza.tipoPerfil.SDESCRIPT,
      codTipoProducto: this.poliza.producto.COD_PRODUCT,
      codTipoModalidad: null,
      codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
      destipoplan: this.poliza.tipoPlan.TIPO_PLAN,
      premiun: this.poliza.primaPropuesta,
      flagCalcular: this.poliza.checkbox1.POL_MAT ? 0 : 0,
      idproc: null,//idproc: this.trama.NIDPROC, Cambiar cuando se valide a futuro, esto es SOLO para desgravamen unitario
      p_ntasa_calculada: 0,
      p_ntasa_prop: 0,
      p_npremium_min: 0,
      p_npremium_min_pr: 0,
      p_npremium_end: 0,
      p_nrate: 0,
      p_ndiscount: 0,
      p_nactivityvariaction: 0,
      p_flag: 0,
      codRamo: this.CONSTANTS.RAMO,
      PolizaMatriz:0,
      datosContratante: {
        codContratante: this.cotizacion.contratante.id, // sclient
        desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
        codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
        documento: this.cotizacion.contratante.numDocumento,
        nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
        apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
        apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
        fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
        nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY,
        email: this.cotizacion.contratante.email,
        sexo: this.cotizacion.contratante.cliente360.P_SSEXCLIEN,
        desTelefono: this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_DESTIPOTLF,
        telefono: this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_SPHONE
      },
      datosPoliza: {
        segmentoId: this.poliza.codSegmento,
        tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
        numDocumento: this.cotizacion.contratante.numDocumento,
        codTipoNegocio: this.poliza.tipoPoliza.id,
        codTipoProducto: this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
        codTipoModalidad: null,
        codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
        codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
        codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
        InicioVigPoliza: CommonMethods.formatDate(this.poliza.fechaInicioPoliza),
        FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
        InicioVigAsegurado: CommonMethods.formatDate(this.poliza.fechaInicioAseguradoMes),
        FinVigAsegurado: CommonMethods.formatDate(this.poliza.fechaFinAseguradoMes),
        CodActividadRealizar: "1",
        CodCiiu: "1",
        codTipoFacturacion: this.poliza.tipoFacturacion.id,
        codMon: this.poliza.moneda.NCODIGINT,
        desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
        nproduct: this.poliza.producto.COD_PRODUCT,
        typeTransac: this.poliza.checkbox1.POL_MAT
          ? this.CONSTANTS.TRANSACTION_CODE.EMISION
          : this.CONSTANTS.TRANSACTION_CODE.COTIZACION,
        type_employee: 1,
        branch: this.CONSTANTS.RAMO,
        nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
        trxCode: this.cotizacion.transac,
        commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
        //nuevos valores tarifario
        temporalidad: 0,
        codAlcance: 0,
        tipoUbigeo: 0,
        codUbigeo:  14
      },
    };

    myFormData.append('dataFile', this.trama.excelSubir[0]);
    myFormData.append('objValida', JSON.stringify(data));


    this.quotationService.valTrama(myFormData).subscribe(
      (res) => {
        this.cotizacion.calcularCober = false;
        this.isLoadingChange.emit(false);

        const erroresList = res.baseError.errorList;

        if (res.P_COD_ERR === '1' || res.P_COD_ERR === '2') {
          this.trama.validado = false;
/*
          if (this.cotizacion.tipoTransaccion == 0) {
            this.cotizacion.brokers[0].P_COM_SALUD = 0;
          }
*/
          if (erroresList.length > 0) {
            // this.trama = {}
            // this.tramaChange.emit(this.trama);
            this.verficaTramaErrores(erroresList);
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
              // this.trama.validado = false;
              this.trama.excelSubir = null
              this.tramaChange.emit(this.trama);
              this.cotizacion.estadoDeuda = 'Deuda';
              this.cotizacion.montoDeuda = 0;
            } 
          }else{
            swal.fire(
              'Información',
              res.P_MESSAGE,
              'error'
            );
          }
        } else {
          if (erroresList != null) {
            if (erroresList.length > 0) {
              // this.trama = {}
              /*
              if (this.cotizacion.tipoTransaccion == 0) {
                this.cotizacion.brokers[0].P_COM_SALUD = 0;
              }
              */
              this.trama.validado = false;
              this.tramaChange.emit(this.trama);
              this.verficaTramaErrores(erroresList);
              if (this.cotizacion.modoTrama == false) {
                //this.obtenerPrimaMinima();
               // this.trama.TOT_ASEGURADOS = 0;
                //this.trama.SUM_ASEGURADA = 0;
              }
            } else {
              /*
              if (this.cotizacion.tipoTransaccion == 0) {
                this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
              }
              */
              
              if (this.flagMensajeTrama == true) {
                this.trama.NID_PROC = res.NIDPROC;
                this.flagMensajeTrama = false;
                this.trama.validado= true;
                swal.fire(
                  'Información',
                  'Se validó correctamente la trama',
                  'success'
                );
              }
              
            }
          } else {
            swal.fire(
              'Información',
              'El archivo enviado contiene errores',
              'error'
            );
          }
        }
      },
      (error) => {
        this.isLoadingChange.emit(false);
      }
    );
  }

  getPrima(amountPremiumList) {
    let amount = 0;
    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 1) {
      amount = amountPremiumList[3].NPREMIUMN_ANU;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 2) {
      amount = amountPremiumList[3].NPREMIUMN_SEM;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 3) {
      amount = amountPremiumList[3].NPREMIUMN_TRI;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 4) {
      amount = amountPremiumList[3].NPREMIUMN_BIM;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 5) {
      amount = amountPremiumList[3].NPREMIUMN_MEN;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 6) {
      amount = amountPremiumList[3].NPREMIUMN_ESP;
    }

    return amount;
  }

  verficaTramaErrores(erroresList) {
    //this.trama.codProceso = null;
    const modalRef = this.modal.open(ValErrorComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.erroresList = erroresList;
  }

   formatoTrama() {
      const data: any = {};
      data.poliza = 0;
      this.isLoadingChange.emit(true);
      this.policyemit.DownloadExcelPlantillaVCF(data).toPromise().then(
         res => {
             const nameFile: string = '01_TramaBeneficiarios_VCF';
              const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsm', { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
              FileSaver.saveAs(file);
              this.isLoadingChange.emit(false);
          },
          err => {
              this.isLoadingChange.emit(false);
         }
      )
    }

    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
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

    // AGF 03042023
    getValueCheckbox(event: any) {
        if (this.esEvaluacion == true) {
            this.showTrama = false;
        }
        this.trama.excelSubir = [];
        this.showTrama = event.target.checked;
    }

    downloadFile(filePath) {
        this.othersService.downloadFile(filePath).subscribe((res) => {
            this.fileService.download(filePath, res);
        });
    }
}
