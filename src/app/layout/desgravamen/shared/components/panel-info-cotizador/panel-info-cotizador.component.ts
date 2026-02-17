import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonMethods } from '../../../../../layout/broker/components/common-methods';
import { AccPersonalesService } from '../../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { FileService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/file.service';
import { StorageService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { UtilService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/util.service';
import { OthersService } from '../../../../../layout/broker/services/shared/others.service';
import swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { DesgravamentConstants } from '../../core/desgravament.constants';
import { triggerAsyncId } from 'async_hooks';
import { QuotationService } from '../../../../../layout/broker/services/quotation/quotation.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'panel-info-cotizador',
  templateUrl: './panel-info-cotizador.component.html',
  styleUrls: ['./panel-info-cotizador.component.css'],
})
export class PanelInfoCotizadorComponent implements OnInit, OnChanges {
  @Input() detail: boolean;

  @Input() cotizador: any;
  @Output() cotizadorChange: EventEmitter<any> = new EventEmitter();

  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

  @Input() trama: any;
  @Output() tramaChange: EventEmitter<any> = new EventEmitter();

  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();

  @Input() cotizacion: any;
  @Input() poliza: any;
  @Input() contratante: any;
  @Input() esPolizaMatriz: any;
  @Input() cotizaDPS: any;

  @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

  CONSTANTS: any = DesgravamentConstants;

  fechaActual: any = UtilService.dates.getCurrentDate();

  show: any = {};

  proponerPrima: boolean;
  proponerSumaAsegurada: boolean;
  seleCobertura: boolean;
  primaNeta: any;


  tabCoberturas: boolean;
  tabAsistencias: boolean;
  tabBeneficios: boolean;
    tabRecargos: boolean;
  coberturas: any = [];
  asistencias: any = [];
  beneficios: any = [];
    recargos: any = [];
  simularPrima: string;
  cargaCobertura: boolean = true;
  cargaAsistencia: boolean = true;
  cargaBeneficios: boolean = true;
  //primaflag: boolean;             //Si False, tiene prima 0
  constructor(
    public storageService: StorageService,
    private fileService: FileService,
    private othersService: OthersService,
    public accPersonalesService: AccPersonalesService,
    private router: Router,
    private quotationService: QuotationService,
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
      JSON.parse(localStorage.getItem('codProducto'))['productId']
    );
    (this.tabCoberturas = true), (this.tabAsistencias = false);
        (this.tabBeneficios = false), (this.tabRecargos = false);
  }

  ngOnInit() {
    this.cotizador = this.cotizador || {};
    this.cotizadorChange.emit(this.cotizador);

  }

  async ngOnChanges(changes) {
    if (
      changes.esPolizaMatriz &&
      changes.esPolizaMatriz.previousValue !== undefined
    ) {
      this.limpiarCotizador();
    }
    if (changes.recargar && changes.recargar.currentValue === true) {
      setTimeout(() => {
        this.recargarChange.emit(false);
      });

      if (this.cotizador.calculado == true && this.cotizador.changeDatosPoliza == true) {
        this.cambiaDatosPolizaCot();
      } else if (this.cotizador.changeContratante == true && this.cotizador.changeDatosPoliza == false) {

        this.limpiarCotizador();
      }

    }
    /*
    if (changes.cotizaDPS && changes.cotizaDPS.currentValue === true){
      console.log("Paso aqui");
      this.clickCalcularPrimaDPS();
    }
    */
  }

  emitirCambiarDatoPoliza() {
    setTimeout(() => {
      this.cambiaDatosPoliza.emit();
    }, 100);
  }

  async cambiaDatosPolizaCot() {
    this.proponerSumaAsegurada = false;
    await this.clickCalcularSinTrama();

  }

  clickCalcular() {
    const params = {
      ID_PROC: this.trama.NIDPROC,
      TASA: this.cotizador.tasaPropuesta,
      PRIMA: this.poliza.primaPropuesta,
      CODPRODUCTO: this.storageService.productId,
    };

    this.isLoadingChange.emit(true);

    this.accPersonalesService.calcularCotizador(params).subscribe(
      (res) => {
        this.trama = Object.assign(this.trama, res);
        this.tramaChange.emit(this.trama);
        this.cotizador.calculado = true;

        this.isLoadingChange.emit(false);
      },
      (error) => {
        this.isLoadingChange.emit(false);
      }
    );
  }

  async clickCalcularSinTrama() {
    const msgValidate = this.validarCampos();
    this.cotizacion.cotizador.recalculo = false;
    this.coberturas = [];
    this.asistencias = [];
    this.beneficios = [];
    if (msgValidate == '') {
      const params = {
        flagCalcular:
          this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
            ? 1
            : 0,
        codUsuario: this.storageService.userId,
        desUsuario: this.storageService.user.username,
                codCanal: this.cotizacion.brokers[0].COD_CANAL,
        contratante: this.cotizacion.contratante.id,
        codRamo: this.CONSTANTS.RAMO,
        codProducto: this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
        codProceso: '',
        PolizaMatriz: 0,
        type_mov: this.cotizacion.tipoTransaccion,
        nroCotizacion: this.cotizacion.numeroCotizacion || 0,
        MontoPlanilla: 0,
                CantidadTrabajadores: 1,
        premium: 0,
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
          sexo: this.cotizacion.contratante.sexo
        },
        datosPoliza: {
          segmentoId: this.poliza.tipoPlan.ID_PLAN,
          tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
          numDocumento: this.cotizacion.contratante.numDocumento,
          codTipoNegocio: this.poliza.tipoPoliza.id || 1,
          codTipoProducto: this.poliza.producto.COD_PRODUCT,
          codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
                    codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
          codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
          codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
          InicioVigPoliza: CommonMethods.formatDate(
            this.poliza.fechaInicioPoliza
          ),
          FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
          InicioVigAsegurado: CommonMethods.formatDate(
                        //this.poliza.fechaInicioPolizaMes
                        this.poliza.fechaInicioPoliza
          ),
          FinVigAsegurado: CommonMethods.formatDate(
                        //this.poliza.fechaFinPolizaMes
                        this.poliza.fechaFinPoliza
          ),
                    CodActividadRealizar: "1",
                    CodCiiu: "1",
          codTipoFacturacion: this.poliza.tipoFacturacion.id,
          codMon: this.poliza.moneda.NCODIGINT,
          desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
          typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
          type_employee: '',
          branch: this.CONSTANTS.RAMO,
          nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
          trxCode: this.cotizacion.transac,
          commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
          //nuevos valores tarifario
          temporalidad: 0,
          codAlcance: 0,
          tipoUbigeo: 0,
          codUbigeo: 14,
          codClienteEndosatario: this.cotizacion.endosatario[0].cod_proveedor,
          nroCredito: this.poliza.nroCredito,
          nroCuotas: this.poliza.nroCuotas,
          polizaMatriz: 0,
          fechaOtorgamiento: CommonMethods.formatDate(
            this.poliza.fechaOtorgamiento
          ),
          capitalCredito: this.poliza.capitalCredito,
          // nuevo tipo de renovacion
          tipoRenovacionPoliza: "3",
          renewalType: this.poliza.renovacion.codigo,
          creditType: this.poliza.tipoPerfil.COD_PRODUCT,
          occupation: this.poliza.tipoActividad.Id,
          renewalFrequency: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                    economicActivity: this.poliza.tipoActividad.Id,
                    actividad: this.poliza.actividad.Id
        },
        datosDPS: []
      };

      console.log(params)

      this.isLoadingChange.emit(true);

      await this.accPersonalesService.calcularCotizadorSinTrama(params).toPromise().then(
        (res) => {
          if (res.P_COD_ERR == 0) {
            if (this.cotizacion.tipoTransaccion == 0) {
              this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
            }
            this.trama = Object.assign(this.trama, res);
            this.trama.PRIMA =
              this.trama.PRIMA < this.trama.PRIMA_DEFAULT
                ? this.trama.PRIMA_DEFAULT
                : this.trama.PRIMA;
            this.primaNeta = this.trama.PRIMA;
            this.trama.NIDPROC = res.NIDPROC;
            this.trama.PRIMA_TOTAL = this.trama.PRIMA

            this.cargaCobertura = true;
            this.cargaAsistencia = true;
            this.cargaBeneficios = true;

            /*
            if(!!this.trama.excelSubir){
              this.trama.excelSubir.splice(0,1)
            }

                     */
            //this.trama.excelSubir = [];
            this.cotizador.calculado = true;
            //this.cotizador.recalculo = true;
            this.tramaChange.emit(this.trama);
            //this.trama.validarExcel();
            this.emitirCambiarDatoPoliza();

          } else {
            if (this.cotizacion.tipoTransaccion == 0) {
              this.cotizacion.brokers[0].P_COM_SALUD = 0;
            }
            //swal.fire('Información', res.P_MESSAGE, 'error');

            swal.fire('Información', res.P_MESSAGE, 'error');

            this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);

          }
          this.isLoadingChange.emit(false);
        },
        (error) => {
          swal.fire(
            'Información',
            'Ocurrió un error en el servidor, por favor intente de nuevo',
            'error'
          );
          this.isLoadingChange.emit(false);
        }
      );
    } else {
      swal.fire('Información', msgValidate, 'error');
    }
  }
  cargaTabs() {
    const params = {

      codProduct: this.poliza.producto?.codigo,
      segmentoId: this.poliza.tipoPlan.ID_PLAN,
      planId: this.poliza.tipoPlan.ID_PLAN, //this.CONSTANTS.PLANMAESTRO,
      IdProc: this.trama.NIDPROC,
      codBranch: this.CONSTANTS.RAMO,
            channel: this.cotizacion.brokers[0].COD_CANAL,
      policyType: this.CONSTANTS.TIPO_POLIZA.INDIVIDUAL,
      renewalType: this.poliza.renovacion.codigo,
      billingType: this.poliza.tipoFacturacion.codigo,
      creditType: this.poliza.tipoPerfil.COD_PRODUCT,
      tipoProducto: 1,
      codPerfil: this.poliza.tipoPerfil?.COD_PRODUCT,
      monedaId: this.poliza.moneda?.NCODIGINT,
      tipoTransac: this.cotizacion.transac,
      tipoModalidad: this.poliza.modalidad?.ID,
      ciiuId: '',
      tipoEmpleado: '1',
      fechaEfecto: this.fechaActual
    };
    /*
        this.accPersonalesService.getTiposCoberturas(params).subscribe(
          (res) => {
            this.coberturas = res;
            console.log(this.coberturas);
          },
          (error) => { }
        );
    */
    this.accPersonalesService.getTiposCoberturas(params).toPromise().then(
      res => {
        this.coberturas = res;
        console.log(this.coberturas);
      },
      err => { }
    );


    this.accPersonalesService.getAssits(params).subscribe(
      (res) => {
        this.asistencias = res.ListAssists;
        console.log(this.asistencias);
      },
      (error) => { }
    );

    this.accPersonalesService.getBenefits(params).subscribe(
      (res) => {
        this.beneficios = res.ListBenefits;
        console.log(this.beneficios);
      },
      (error) => { }
    );

        this.accPersonalesService.getSurcharges(params).subscribe(
            (res) => {
                this.recargos = res.ListSurcharges;
            },
            (error) => { }
        );

  }

  // esto abre el modal
  clickProponer() {
    if (!!this.cotizacion.poliza.producto.codigo) {
            this.cargaTabs();
      this.tabCoberturas = true;
      this.tabAsistencias = false;
      this.tabBeneficios = false;
            this.tabRecargos = false;
      this.show.coberturas = true;
      this.primaNeta = this.trama.PRIMA;
      //this.cargaCobertura = true;
      //this.cargaAsistencia = true;
      //this.cargaBeneficios = true;
    } else {
      swal.fire(
        'Información',
        'Debe los elegir los datos de la póliza',
        'error'
      );
    }
  }

  clickCalcularPrima(event: any, action?: string, codigo?: any) {
        console.log(this.coberturas);
    const params = {
      flagCalcular:
        this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
          ? 1
          : 0,
      codUsuario: this.storageService.userId,
      desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL,
      contratante: this.cotizacion.contratante.id,
      codRamo: this.CONSTANTS.RAMO,
      codProducto: this.poliza.producto.COD_PRODUCT,
      codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
      CantidadTrabajadores: this.trama.TOT_ASEGURADOS,
      codProceso: this.trama.NIDPROC,
      PolizaMatriz:
        this.poliza.tipoPerfil.NIDPLAN !== '6'
          ? this.poliza.checkbox1.POL_MAT
          : 0,
      type_mov: this.cotizacion.tipoTransaccion,
      TipoFacturacion: 1,
      nroCotizacion: this.cotizacion.numeroCotizacion || 0,
      datosContratante: {
        codContratante: this.cotizacion.contratante.id, // sclient
        desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
        codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
        documento: this.cotizacion.contratante.numDocumento,
        nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
        apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
        apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
        fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
        nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
      },
      datosPoliza: {
        segmentoId: this.poliza.tipoPlan.ID_PLAN,
        tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
        numDocumento: this.cotizacion.contratante.numDocumento,
        codTipoNegocio: this.poliza.tipoPoliza.id || 1,
        codTipoProducto: this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: this.poliza.producto.COD_PRODUCT,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,//this.CONSTANTS.PLANMAESTRO,
        codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
        codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
        InicioVigPoliza: CommonMethods.formatDate(
          this.poliza.fechaInicioPoliza
        ),
        FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
        InicioVigAsegurado: CommonMethods.formatDate(
                    this.poliza.fechaInicioPoliza
        ),
        FinVigAsegurado: CommonMethods.formatDate(
                    this.poliza.fechaFinPoliza
        ),
                CodActividadRealizar: "1",
                CodCiiu: "1",
        codTipoFacturacion: this.poliza.tipoFacturacion.id,
        codMon: this.poliza.moneda.NCODIGINT,
        desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
        nproduct: this.poliza.producto.COD_PRODUCT,
        typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
        type_employee: 1,
        branch: this.CONSTANTS.RAMO,
        poliza_matriz: this.poliza.tipoPerfil.NIDPLAN !== '6'
          ? this.poliza.checkbox1.POL_MAT
          : true,
        nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
        trxCode: this.cotizacion.transac,
        commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
        //nuevos valores tarifario
        temporalidad: !!this.poliza.temporalidad
          ? this.poliza.temporalidad.id
          : 0,
        codAlcance: 0,
        tipoUbigeo: !!this.poliza.codTipoViaje
          ? this.poliza.codTipoViaje.id
          : 1,
        // codOrigen:
        //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
        //     ? this.poliza.codOrigen.Id
        //     : !!this.poliza.codOrigen
        // ? this.poliza.codOrigen.NCOUNTRY
        // : 0,
        codUbigeo: 14,
        codClienteEndosatario: this.cotizacion.endosatario[0].cod_proveedor,
        nroCredito: this.poliza.nroCredito || 0,
        nroCuotas: this.poliza.nroCuotas,
        polizaMatriz: 0,
        fechaOtorgamiento: CommonMethods.formatDate(
          this.poliza.fechaOtorgamiento
        ),
        capitalCredito: this.poliza.capitalCredito,
        // nuevo tipo de renovacion
        tipoRenovacionPoliza: "3",
        renewalType: this.poliza.renovacion.codigo,
        creditType: this.poliza.tipoPerfil.COD_PRODUCT,
        occupation: this.poliza.tipoActividad.Id,
        renewalFrequency: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                economicActivity: this.poliza.tipoActividad.Id,
                activity: this.poliza.actividad.Id,
                fechaProrrateo: CommonMethods.formatDate(
                    this.poliza.fechaInicioPolizaShow
                )
      },
      lcoberturas: [],
      lasistencias: [],
      lbeneficios: [],
            datosDPS: [],
            lrecargos: [],
    };

        /*
    params.datosDPS.push({
      question: 3,
      type: "NUMBER",
      value: this.poliza.dps.talla
    });
    params.datosDPS.push({
      question: 4,
      type: "NUMBER",
      value: this.poliza.dps.peso
    });
    params.datosDPS.push({
      question: 5,
      type: "SELECTION",
      value: this.poliza.dps.fuma.resp,
      detail: this.poliza.dps.fuma.resp == "NO" ? null : { type: "TEXT", value: this.poliza.dps.fuma.consumo }
    });
    params.datosDPS.push({
      question: 6,
      type: "SELECTION",
      value: this.poliza.dps.presion.resp,
      detail: this.poliza.dps.presion.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.presion.resultado }
    });
    params.datosDPS.push({
      question: 7,
      type: "TEXT",
      value: "",
      items: [
        {
          question: 1,
          type: "SELECTION",
          value: this.poliza.dps.cancer.resp,
          questionFather: 7,
          detail: this.poliza.dps.cancer.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.cancer.detalle }
        },
        {
          question: 2,
          type: "SELECTION",
          value: this.poliza.dps.infarto.resp,
          questionFather: 7,
          detail: this.poliza.dps.infarto.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.infarto.detalle }
        },
        {
          question: 3,
          type: "SELECTION",
          value: this.poliza.dps.gastro.resp,
          questionFather: 7,
          detail: this.poliza.dps.gastro.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.gastro.detalle }
        },
        {
          question: 4,
          type: "SELECTION",
          value: this.poliza.dps.hospitalizado.resp,
          questionFather: 7,
          detail: this.poliza.dps.hospitalizado.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.hospitalizado.detalle }
        }
      ]
    });
    params.datosDPS.push({
      question: 8,
      type: "TEXT",
      value: "",
      items: [
        {
          question: 1,
          type: "SELECTION",
          value: this.poliza.dps.viaje.resp,
          questionFather: 8,
          detail: this.poliza.dps.viaje.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.viaje.detalle }
        },
        {
          question: 2,
          type: "SELECTION",
          value: this.poliza.dps.practicaExtrema.resp,
          questionFather: 8,
          detail: this.poliza.dps.practicaExtrema.resp == "NO" ? null : { type: "SELECTION", value: this.poliza.dps.practicaExtrema.detalle }
        }
      ]
    });
        */
    (this.coberturas || []).forEach((item) => {
      if (action == 'coberturas') {
        if (item.codCobertura == codigo) {
          item.cobertura_adi = event.checked ? 1 : 0;
        }
      }
      if (item.cobertura_adi != '0') {
        item.capital_prop = item.capital_prop != "0" && item.capital_prop != "" ? item.capital_prop : item.capital,
          this.validarPropuesto(item)
        params.lcoberturas.push({
          codCobertura: item.codCobertura,
          sumaPropuesta: item.capital_prop,
          capital: item.capital,
          capitalCovered: item.capitalCovered,
          capital_aut: item.capital_aut,
          capital_max: item.capital_max,
          capital_min: item.capital_min,
          capital_prop: item.capital_prop,
          cobertura_adi: item.cobertura_adi,
          cobertura_pri: item.cobertura_pri,
          descripcion: item.descripcion,
          entryAge: item.entryAge,
          hours: item.hours,
          ncover: item.ncover,
          stayAge: item.stayAge,
          limit: item.limit,
          suma_asegurada: item.suma_asegurada
        });
      }
    });

    (this.asistencias || []).forEach((item) => {
      if (action == 'asistencias') {
        if (item.codAssist == codigo) {
          item.sMark = event.checked ? 1 : 0;
        }
      }
      if (item.sMark != '0') {
        params.lasistencias.push({
          codAsistencia: item.codAssist,
          desAssist: item.desAssist,
          document: item.document,
          provider: item.provider,
          sMark: item.sMark
        });
      }
    });

    (this.beneficios || []).forEach((item) => {
      if (action == 'beneficios') {
        if (item.codBenefit == codigo) {
          item.sMark = event.checked ? 1 : 0;
        }
      }
      if (item.sMark != '0') {
        params.lbeneficios.push({
          codBeneficio: item.codBenefit,
          desBenefit: item.desBenefit,
          sMark: item.sMark
        });
      }
    });

        (this.recargos || []).forEach((item) => {
            if (action == 'recargos') {
                if (item.codSurcharge == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {
                params.lrecargos.push({
                    codRecargo: item.codSurcharge,
                    desRecargo: item.desSurcharge,
                    amount: item.value,
                    sMark: item.sMark
                });
            }
        });

    const myFormData: FormData = new FormData();
    myFormData.append('fileASeg', this.trama.excelSubir);
    myFormData.append('dataCalcular', JSON.stringify(params));

    //console.log(params);

    this.isLoadingChange.emit(true);
    this.accPersonalesService
      .calcularCotizadorConCoberturas(myFormData)
      .subscribe(
        (res) => {
                    /*
          if (parseInt(this.trama.PRIMA) == 0){

            const paramsAnul = {
              QuotationNumber: this.cotizacion.numeroCotizacion,
              Status: 3,
              Reason: '',
              Comment: '',
              User: this.storageService.userId,
              Product: this.poliza.producto.COD_PRODUCT,
              Nbranch: this.CONSTANTS.RAMO,
              path: '',
              Gloss: '', // this.cotizacion.motivo.codigo,
              GlossComment: '', // this.cotizacion.comentario,
              saludAuthorizedRateList: [],
              pensionAuthorizedRateList: [],
              BrokerList: [],
              Flag: 0, // this.cotizacion.estado.codigo === this.CONSTANTS.ESTADO.NO_PROCEDE ? 1 : 0,
            };
              this.cotizacion.brokers.forEach((item) => {
                paramsAnul.BrokerList.push({
                  Id: item.COD_CANAL,
                  ProductList: [
                    {
                      Product: this.poliza.producto.COD_PRODUCT,
                      AuthorizedCommission:
                        Number(item.P_COM_SALUD_PRO) > 0
                          ? item.P_COM_SALUD_PRO
                          : item.P_COM_SALUD,
                    },
                  ],
                });
              });

              swal.fire('Información', "No hay una prima válida", 'error');

              this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
          }else{
            */
            this.cotizacion.calcularCober = true;
            this.trama = Object.assign(this.trama || {}, res || {});
            this.trama.validado = true;
            this.primaNeta = this.trama.PRIMA;
            this.trama.PRIMA_TOTAL = this.trama.PRIMA
            this.trama.amountPremiumList = res.amountPremiumList;
            this.cotizador.amountPremiumListAut = res.amountPremiumListAut;
            this.cotizador.recalculo = false;
            this.isLoadingChange.emit(false);
            //this.emitirCambiarDatoPoliza();
            if (res.P_COD_ERR == "1") {
              swal.fire('Información', res.P_MESSAGE, 'error');
            }

                    if(this.cotizacion.brokers[0].P_COM_SALUD == 0)
                    {
                        this.cotizacion.brokers[0].P_COM_SALUD = (this.cotizacion.brokers[0].NTYPECHANNEL == '6' || this.cotizacion.brokers[0].NTYPECHANNEL == '8') ? res.COMISION_BROKER : res.COMISION_INTER;
                    }




          }

        /*}*/
        ,
        (error) => {
          this.cotizacion.calcularCober = false;
          this.isLoadingChange.emit(false);
        }
      );
  }

  clickCalcularPrimaDPS() {
    const params = {
      flagCalcular:
        this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
          ? 1
          : 0,
      codUsuario: this.storageService.userId,
      desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL,
      contratante: this.cotizacion.contratante.id,
      codRamo: this.CONSTANTS.RAMO,
      codProducto: this.poliza.producto.COD_PRODUCT,
      codTipoPerfil: this.poliza.tipoPerfil.COD_PRODUCT,
      CantidadTrabajadores: this.trama.TOT_ASEGURADOS,
      codProceso: this.cotizacion.trama.NIDPROC,
      PolizaMatriz:
        this.poliza.tipoPerfil.NIDPLAN !== '6'
          ? this.poliza.checkbox1.POL_MAT
          : 0,
      type_mov: this.cotizacion.tipoTransaccion,
      TipoFacturacion: 1,
      nroCotizacion: this.cotizacion.numeroCotizacion || 0,
      datosContratante: {
        codContratante: this.cotizacion.contratante.id, // sclient
        desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
        codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
        documento: this.cotizacion.contratante.numDocumento,
        nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
        apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
        apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
        fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
        nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
      },
      datosPoliza: {
        segmentoId: this.poliza.tipoPlan.ID_PLAN,
        tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
        numDocumento: this.cotizacion.contratante.numDocumento,
        codTipoNegocio: this.poliza.tipoPoliza.id || 1,
        codTipoProducto: this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: this.poliza.producto.COD_PRODUCT,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,//this.CONSTANTS.PLANMAESTRO,
        codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
        codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
        InicioVigPoliza: CommonMethods.formatDate(
          this.poliza.fechaInicioPoliza
        ),
        FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
        InicioVigAsegurado: CommonMethods.formatDate(
                    //this.poliza.fechaInicioAseguradoMes
                    this.poliza.fechaInicioPoliza
        ),
        FinVigAsegurado: CommonMethods.formatDate(
                    //this.poliza.fechaFinAseguradoMes
                    this.poliza.fechaFinPoliza,
        ),
                CodActividadRealizar: "1",
                CodCiiu: "1",
        codTipoFacturacion: this.poliza.tipoFacturacion.id,
        codMon: this.poliza.moneda.NCODIGINT,
        desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
        nproduct: this.poliza.producto.COD_PRODUCT,
        typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
        type_employee: 1,
        branch: this.CONSTANTS.RAMO,
        poliza_matriz: this.poliza.tipoPerfil.NIDPLAN !== '6'
          ? this.poliza.checkbox1.POL_MAT
          : true,
        nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
        trxCode: this.cotizacion.transac,
        commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
        //nuevos valores tarifario
        temporalidad: !!this.poliza.temporalidad
          ? this.poliza.temporalidad.id
          : 0,
        codAlcance: 0,
        tipoUbigeo: !!this.poliza.codTipoViaje
          ? this.poliza.codTipoViaje.id
          : 1,
        codUbigeo: 14,
        codClienteEndosatario: this.cotizacion.endosatario[0].cod_proveedor,
        nroCredito: this.poliza.nroCredito || 0,
        nroCuotas: this.poliza.nroCuotas,
        polizaMatriz: 0,
        fechaOtorgamiento: CommonMethods.formatDate(
          this.poliza.fechaOtorgamiento
        ),
        capitalCredito: this.poliza.capitalCredito.replace(/,/g, ''),
        // nuevo tipo de renovacion
        tipoRenovacionPoliza: "3",
        renewalType: this.poliza.renovacion.codigo,
        creditType: this.poliza.tipoPerfil.COD_PRODUCT,
        occupation: this.poliza.tipoActividad.Id,
        renewalFrequency: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                economicActivity: this.poliza.tipoActividad.Id,
                activity: this.poliza.actividad.Id,
                fechaProrrateo: CommonMethods.formatDate(
                    this.poliza.fechaInicioPolizaShow
                )
      },
      lcoberturas: [],
      lasistencias: [],
      lbeneficios: [],
      datosDPS: []
    };



    const myFormData: FormData = new FormData();
    myFormData.append('fileASeg', this.trama.excelSubir);
    myFormData.append('dataCalcular', JSON.stringify(params));

    this.isLoadingChange.emit(true);
    this.accPersonalesService
      .calcularCotizadorConCoberturas(myFormData)
      .subscribe(
        (res) => {
                    if (parseInt(res.PRIMA) == 0) {
            const paramsAnul = {
              QuotationNumber: this.cotizacion.numeroCotizacion,
              Status: 3,
              Reason: '',
              Comment: '',
              User: this.storageService.userId,
              Product: this.poliza.producto.COD_PRODUCT,
              Nbranch: this.CONSTANTS.RAMO,
              path: '',
              Gloss: '', // this.cotizacion.motivo.codigo,
              GlossComment: '', // this.cotizacion.comentario,
              saludAuthorizedRateList: [],
              pensionAuthorizedRateList: [],
              BrokerList: [],
              Flag: 0, // this.cotizacion.estado.codigo === this.CONSTANTS.ESTADO.NO_PROCEDE ? 1 : 0,
            };
              this.cotizacion.brokers.forEach((item) => {
                paramsAnul.BrokerList.push({
                  Id: item.COD_CANAL,
                  ProductList: [
                    {
                      Product: this.poliza.producto.COD_PRODUCT,
                      AuthorizedCommission:
                        Number(item.P_COM_SALUD_PRO) > 0
                          ? item.P_COM_SALUD_PRO
                          : item.P_COM_SALUD,
                    },
                  ],
                });
              });
              const myFormDataAnul: FormData = new FormData();
              myFormDataAnul.append('statusChangeData', JSON.stringify(paramsAnul));

              this.quotationService.changeStatusVL(myFormDataAnul).subscribe(
                (res2) => {
                  this.isLoading = false;
                  if (Number(res2.StatusCode) === 0) {
                    swal.fire('Información', "No hay una prima válida", 'error');

                    this.router.navigate(['/extranet/desgravamen/consulta-cotizacion']);
                  } else {
                    swal.fire(
                      'Información',
                      CommonMethods.listToString(res2.ErrorMessageList),
                      'error'
                    );
                  }
                },
                (err2) => {
                  swal.fire(
                    'Información',
                    'Hubo un problema al comunicarnos con el servidor.',
                    'error'
                  );
                  this.isLoading = false;
                }
              );

                    } else {
            if (this.cotizacion.tipoTransaccion == 0) {
                if(this.cotizacion.brokers[0].P_COM_SALUD == 0)
                 {
                    this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
                 }

            }
            this.trama = Object.assign(this.trama || {}, res || {});
            this.trama.PRIMA =
                this.trama.PRIMA < this.trama.PRIMA_DEFAULT
                  ? this.trama.PRIMA_DEFAULT
                  : this.trama.PRIMA;
            this.trama.validado = true;
            this.primaNeta = this.trama.PRIMA;
            this.trama.PRIMA_TOTAL = this.trama.PRIMA
            this.trama.amountPremiumList = res.amountPremiumList;
            this.cotizador.amountPremiumListAut = res.amountPremiumListAut;
            this.cotizador.calculado = true;
            this.cotizacion.primaflag = false;
            //this.cotizador.recalculo = false;
            this.emitirCambiarDatoPoliza();
            this.isLoadingChange.emit(false);
            //this.emitirCambiarDatoPoliza();
            if (res.P_COD_ERR == "1") {
              swal.fire('Información', res.P_MESSAGE, 'error');
            }
          }

        },
        (error) => {
          this.cotizacion.calcularCober = false;
          this.isLoadingChange.emit(false);
        }
      );
  }

  trabajadoresChange(event: any) {
    this.coberturas = [];
    this.trama.amountPremiumList = [];
    this.trama.SUM_ASEGURADA = 0;
    this.trama.validado = false;
    this.cotizador.calculado = false;
    this.cotizador.recalculo = false;
    // this.limpiarCotizador();
  }

  limpiarCotizador() {
    this.trama.validado = false;
    this.trama.TOT_ASEGURADOS = '';
    this.trama.MONT_PLANILLA = 0;
    this.trama.PRIMA = this.trama.PRIMA_DEFAULT;
    this.trama.SUM_ASEGURADA = 0;
    this.cotizador.calculado = false;
    this.cotizador.recalculo = false;
    this.coberturas = [];
    this.primaNeta = this.trama.PRIMA_DEFAULT;
  }

  downloadFile(filePath) {
    this.othersService.downloadFile(filePath).subscribe((res) => {
      this.fileService.download(filePath, res);
    });
  }

  proponeSA() {
    if (!this.proponerSumaAsegurada && !this.detail) {
      (this.coberturas || []).forEach((item) => {
        item.capital_prop = '';
      });
    }
  }

  clickCancel() {
    (this.coberturas || []).forEach((item) => {
      if (item.capital_prop !== 0) {
        item.capital_prop = 0;
      }
    });
  }

  validarCampos(): any {
    let msg = '';

    if (
      !this.cotizacion.contratante.tipoDocumento ||
      !this.cotizacion.contratante.numDocumento
    ) {
      msg += 'Debe ingresar un contratante <br>';
    }

    if (
      !this.cotizacion.poliza.tipoPerfil ||
      !this.cotizacion.poliza.tipoPerfil.COD_PRODUCT
    ) {
      msg += 'Debe elegir el tipo de crédito  <br>';
    }


    if (
      !this.cotizacion.poliza.tipoRenovacion ||
      !this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION
    ) {
      msg += 'Debe elegir el tipo de renovación  <br>';
    }
    if (
      !this.cotizacion.poliza.moneda ||
      !this.cotizacion.poliza.moneda.NCODIGINT
    ) {
      msg += 'Debe elegir una moneda  <br>';
    }

    if (
      !this.cotizacion.poliza.frecuenciaPago ||
      !this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA
    ) {
      msg += 'Debe elegir la frecuencia de pago  <br>';
    }

    if (!this.cotizacion.poliza.fechaInicioPoliza) {
      msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
    }
    if (this.cotizacion.brokers.length === 0) {
      msg += 'Debe ingresar un broker  <br>';
    }

    if (
      !this.cotizacion.poliza.tipoPlan ||
      !this.cotizacion.poliza.tipoPlan.ID_PLAN
    ) {
      msg += 'Debe elegir el tipo de plan  <br>';
    }
    if (this.cotizacion.endosatario.length == 0
    ) {
      msg += 'Debe elegir un endosatario  <br>';
    }
    if (!this.cotizacion.poliza.capitalCredito ||
      this.cotizacion.poliza.capitalCredito == '0') {
      msg += 'Debe ingresar un monto de capital válido  <br>';
    }
    /*
        if (!this.cotizacion.poliza.tipoActividad ||
            !this.cotizacion.poliza.tipoActividad.Id
        ) {
            msg += 'Debe elegir la actividad a realizar  <br>';
        }
        */
        if (!this.cotizacion.poliza.actividad ||
            !this.cotizacion.poliza.actividad.Id
        ) {
            msg += 'Debe elegir la actividad a realizar  <br>';
        }
    return msg;
  }

  CambiarCarga(tipo: any, val: boolean) {
    if (tipo == 'Cob') {
      this.cargaCobertura = false;
    }
  }

  showTabs(tab) {
    switch (tab) {
      case '1':
        this.tabCoberturas = true;
        this.tabAsistencias = false;
        this.tabBeneficios = false;
                this.tabRecargos = false;
        break;
      case '2':
        this.tabCoberturas = false;
        this.tabAsistencias = true;
        this.tabBeneficios = false;
                this.tabRecargos = false;
        break;
      case '3':
        this.tabCoberturas = false;
        this.tabAsistencias = false;
        this.tabBeneficios = true;
                this.tabRecargos = false;
                break;
            case '4':
                this.tabCoberturas = false;
                this.tabAsistencias = false;
                this.tabBeneficios = false;
                this.tabRecargos = true;
        break;
      default:
        this.tabCoberturas = true;
        this.tabAsistencias = false;
        this.tabBeneficios = false;
                this.tabRecargos = false;
    }
  }

  validarPropuesto(item: any) {
    item.message = "";
    if (item.capital_prop != "") {
      if (Number(item.capital_prop) < item.capital_min) {
        item.capital_prop = item.capital;
                item.message = "Con el valor propuesto, no se puede generar una prima, ya que debe estar en el rango entre " + item.capital_min + " y " + item.capital_max;
      }

      if (Number(item.capital_prop) > item.capital_max) {
        item.capital_prop = item.capital_max;
                item.message = "Con el valor propuesto, no se puede generar una prima, ya que debe estar en el rango entre " + item.capital_min + " y " + item.capital_max;
      }
    }
  }

  verificarFlag(item: any, atr: any) {
    let disabled = false;
    if (atr == 1) { // coberturas
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
        this.cotizacion.modoVista == undefined) {
        if (item.cobertura_pri == 1 || !this.cotizacion.poliza.listReglas.flagCobertura) {
          disabled = true;
        }
      }
      else {
                if (
                    item.cobertura_pri == 1 || this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
            disabled = true;
          }

      }
    }

    if (atr == 2) { // asistencias
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
        this.cotizacion.modoVista == undefined) {
                if (item.assist_pri == 1 || !this.cotizacion.poliza.listReglas.flagAsistencia) {
          disabled = true;
        }
      }
      else {
                if (
                    item.assist_pri == 1 || this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
            disabled = true;
          }
      }
    }

    if (atr == 3) { // beneficios
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
        this.cotizacion.modoVista == undefined) {
                if (item.benefit_pri == 1 || !this.cotizacion.poliza.listReglas.flagBeneficio) {
          disabled = true;
        }
      }
      else {
                if (
                    item.benefit_pri == 1 || this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
            disabled = true;
          }
      }
    }

    if (atr == 4) {
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        this.cotizacion.modoVista == undefined) {
        disabled = true;
      }
    }

        if (atr == 5) { // recargos falta modificar flag
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
                if (!this.cotizacion.poliza.listReglas.flagBeneficio) {
                    disabled = true;
                }
            }
            else {
                if (
                    this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
                    disabled = true;
                }
            }
        }

    return disabled;
  }

  verificarInputSA(item: any) {
    let disabled = true;
        /*
    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
      this.cotizacion.modoVista == undefined) {
      if (item.cobertura_adi == 1) {
        disabled = false;
      }
    }
        */
        if (this.cotizacion.modoVista == "Evaluar" && this.cotizacion.transac == "EM") {
  if (item.cobertura_adi == 1) {
                if (item.def == 1) {
                    disabled = true;
                }
                else {
    disabled = false;
  }
            }
        }

    return disabled;
  }

  verificarTextSA() {
    let label = 'S.A. autorizada';

    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar) ||
      this.cotizacion.modoVista == undefined) {
      label = 'Proponer S.A.';
    }

    return label;
  }

}
