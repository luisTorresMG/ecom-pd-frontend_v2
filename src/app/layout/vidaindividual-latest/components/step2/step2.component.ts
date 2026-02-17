import {
  Component,
  ElementRef,
  OnInit,
  AfterViewChecked,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ViewContainerRef,
  TemplateRef,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Step2Service } from '../../services/step2/step2.service';
import { Step1Service } from '../../services/step1/step1.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Step2Request, Step2Response } from '../../models/step2.model';
import { AgesDto } from '../../models/ages.model';
import { CurrencyDto } from '../../models/currency.model';
import { SumaAseguradaDto } from '../../models/sumaAsegurada.model';
import { PercentReturnDto } from '../../models/percentReturn.model';
import { BeneficiarioDto } from '../../models/beneficiario.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ParametersResponse } from '../../models/parameters.model';
import { SlipRequest } from '../../models/slip.model';
import { animate, style, transition, trigger } from '@angular/animations';
import moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MainService } from '../../services/main/main.service';
import { NotificationRequest } from '../../models/notification.model';
import { ResumenResponse } from '../../models/resumen.model';
import { DecimalPipe } from '@angular/common';
import { base64ToArrayBuffer } from '@root/shared/helpers/utils';
import * as FileSaver from 'file-saver';
import { AppConfig } from '@root/app.config';
import { frecuencyPayDto } from '../../models/frecuencyPay.model';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(400, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class Step2Component implements OnInit, AfterViewChecked, OnDestroy {
  formPlan: FormGroup;
  dataBeneficiarios: BeneficiarioDto[] = [];
  tipoErrorFormBeneficiario = '';
  isAddBenf = false;
  beneficiarioLegal = false;
  SHOW_FORM_BENF: boolean;

  DATASTEP2$: AgesDto[];
  AGES$: AgesDto[];
  MONEY$: CurrencyDto[];
  SUMA_ASEGURADA$: SumaAseguradaDto[];
  PERCENTS$: PercentReturnDto[];

  // MENSAJE PARA CONTRATANTE <> ASEGURADO
  msgDX: string;
  // REQ
  FRECUENCIA$: frecuencyPayDto[];

  simboloMoneda: string;
  nombreCotizador: string;

  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  numberDocumentLimit: { min: number; max: number };
  showFormBeneficiarios: boolean;
  errorForm: string;
  parameters$: ParametersResponse;
  enableAgregarBeneficiario: boolean;

  duplicatesBenf: boolean;
  changeDataForm: boolean;

  quotationGeneratedOfAssesor = false;
  canContinue = true;

  aseguradoContratante: boolean;
  isDefinitive: boolean;

  @ViewChild('formBeneficiario', { static: false, read: ElementRef })
  formBeneficiario: ElementRef;
  @ViewChild('modalSlip', { static: false, read: ModalDirective })
  modalSlip: ModalDirective;
  @ViewChild('notContinue', { static: true, read: TemplateRef })
  notContinue: TemplateRef<any>;
  periodo: any;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _Router: Router,
    private readonly route: ActivatedRoute,
    private readonly _Step2Service: Step2Service,
    private readonly _Step1Service: Step1Service,
    private readonly _route: ActivatedRoute,
    private readonly _spinner: NgxSpinnerService,
    private readonly _MainService: MainService,
    private readonly _DecimalPipe: DecimalPipe,
    private readonly _changeDetector: ChangeDetectorRef,
    private readonly vc: ViewContainerRef,
    private readonly trackingService: TrackingService
  ) {
    this.msgDX = '';
    this.quotationGeneratedOfAssesor =
      !!this.route.snapshot.queryParamMap.get('processId');
    if (!this.quotationGeneratedOfAssesor) {
      this.quotationGeneratedOfAssesor = sessionStorage.getItem('processDigitalPlatform') == sessionStorage.getItem('idProcess');
    }
    this.changeDataForm = false;
    this.formPlan = this._builder.group({
      cantidadAnio: [null, Validators.required],
      moneda: [null, Validators.required],
      capital: [
        { value: null, disabled: this.quotationGeneratedOfAssesor },
        Validators.required,
      ],
      porcentajeRetorno: [
        { value: null, disabled: this.quotationGeneratedOfAssesor },
        Validators.required,
      ],
      idFrecuencia: [
        { value: null, disabled: this.quotationGeneratedOfAssesor },
        Validators.required,
      ],
      frecuencia: [null, Validators.required],
      descPrima: [null, Validators.required],
      descPrimeraCuota: [null, Validators.required],
      primaAnual: [null, Validators.required],
      primaMensual: [null, Validators.required],
      primaMensualTotal: [null, Validators.required],
      primeraTotal: [null, Validators.required],
      primaRetorno: [null, Validators.required],
      primaInicial: [null, Validators.required],
      primeraCuota: [null, Validators.required],
      primaFallecimiento: [null, Validators.required],
      plan: [null, Validators.required],
      terms: [null, Validators.required],
      beneficiarioLegal: [
        {
          value: this.beneficiarioLegal,
          disabled: this.quotationGeneratedOfAssesor,
        },
        Validators.required,
      ],
      idTarifario: [null, Validators.required],
    });
    this.isAddBenf = false;
    this.beneficiarioLegal = true;
    this.fp['beneficiarioLegal'].setValue(true);

    this.nombreCotizador = this.sessionDataDocument?.p_SCLIENT_NAME || null;
    this.AGES$ = this.DATASTEP2$ = JSON.parse(
      sessionStorage.getItem('tarifario')
    );
    this.numberDocumentLimit = { min: 8, max: 8 };
    this.isDefinitive = false;
    this.showFormBeneficiarios =
      this.sumaPorcentajeParticicionBeneficiarios < 100;
    const dataStep2: any = JSON.parse(sessionStorage.getItem('step2'));
    const dataBenf: any = JSON.parse(
      sessionStorage.getItem('dataBeneficiarios')
    );
    if (!!dataStep2) {
      this.formPlan.patchValue(dataStep2);
      if (dataStep2.beneficiarioLegal) {
        this.isAddBenf = false;
        this.beneficiarioLegal = true;
        this.fp['beneficiarioLegal'].setValue(true);
      } else if (this.dataBeneficiarios?.length > 0) {
        this.isAddBenf = true;
        this.beneficiarioLegal = false;
        this.fp['beneficiarioLegal'].setValue(false);
      } else {
        this.isAddBenf = false;
        this.beneficiarioLegal = false;
        this.fp['beneficiarioLegal'].setValue(false);
      }
      if (dataBenf?.filter((x) => x?.complete).length > 0) {
        this.isAddBenf = true;
      } else {
        this.isAddBenf = false;
      }
    }
    this.dataBeneficiarios = dataBenf || [];
    this.duplicatesBenf = false;
  }

  ngOnInit(): void {
    scrollTo(0, 0);
    let resp: any = sessionStorage.getItem('_str_pay');
    if (!!resp) {
      resp = JSON.parse(resp);
      if (resp?.success || resp?.errorCode === 'ERROR_EMISION') {
        sessionStorage.clear();
        this._Router.navigate(['/vidadevolucion/step1'], {
          queryParamsHandling: 'merge',
        });
      }
      return;
    }
    this.sameOrNot();
    let host = window.location.hostname;
    const path = window.location.pathname;
    if (path.indexOf('/staging/') !== -1) {
      host =
        '../../../../../staging/assets/formato-tramas/vidadevolucion/exclusiones.txt';
    } else if (path.indexOf('/ecommerce/') !== -1) {
      host =
        '../../../../../ecommerce/assets/formato-tramas/vidadevolucion/exclusiones.txt';
    } else {
      host =
        '../../../../../assets/formato-tramas/vidadevolucion/exclusiones.txt';
    }
    fetch(host)
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem('condiciones-exclusiones-vd', data);
      });
    let sumaPercentdataBeneficiarios = 0;
    this.dataBeneficiarios?.forEach((e) => {
      sumaPercentdataBeneficiarios += Number(e.porcentajeParticipacion);
    });
    if (sumaPercentdataBeneficiarios === 100) {
      this.SHOW_FORM_BENF = false;
    } else {
      this.SHOW_FORM_BENF = true;
    }
    this.showFormBeneficiarios = this.validarLengthBeneficiarios;
    this._Step2Service.getParameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
    /*if (this.validarLengthBeneficiarios && this.dataBeneficiarios.length < 4 && this.sumaPorcentajeParticicionBeneficiarios < 100) {
      this.enableAgregarBeneficiario = true;
    }*/
    let resum: any = sessionStorage.getItem('step2');
    this.setInitData();

    /*  this.SUMA_ASEGURADA$ = this.DATASTEP2$[0].moneda[0].sumaAsegurada; */
    this.fp['cantidadAnio'].valueChanges.subscribe((val) => {
      this.PERCENTS$ = this.SUMA_ASEGURADA$?.find(
        (x) => Number(x.montoSumaAsegurada) === Number(this.fp['capital'].value)
      )?.frecuenciaPago.find((x) => +x.idFrecuencia == +val)?.porcentajeRetorno;

      this.MONEY$ = this.DATASTEP2$.find(
        (x) => Number(x.edad) === Number(val)
      )?.moneda;
      this.SUMA_ASEGURADA$ = this.MONEY$.find(
        (x) => Number(x.idMoneda) === Number(this.fp['moneda']?.value)
      )?.sumaAsegurada;
      if (!resum || this.changeDataForm) {
        this.fp['moneda'].setValue(this.MONEY$[0]?.idMoneda);
        this.fp['capital'].setValue(
          this.SUMA_ASEGURADA$[0]?.montoSumaAsegurada
        );
      }
      // tslint:disable-next-line:max-line-length
      this.PERCENTS$ = this.FRECUENCIA$?.find(
        (x) =>
          Number(x.porcentajeRetorno) === Number(this.fp['capital']?.value)
      )?.porcentajeRetorno;
      this.setValuePrimas();
    });
    this.fp['moneda'].valueChanges.subscribe((val) => {
      const moneyFilter = this.MONEY$.find(
        (x) => Number(x.idMoneda) === Number(val)
      );
      this.SUMA_ASEGURADA$ = moneyFilter?.sumaAsegurada;
      this.simboloMoneda = moneyFilter.simbolo;
      if (!resum || this.changeDataForm) {
        this.fp['capital'].setValue(
          this.SUMA_ASEGURADA$[0]?.montoSumaAsegurada
        );
      }
      // tslint:disable-next-line:max-line-length
      this.PERCENTS$ = this.SUMA_ASEGURADA$?.find(
        (x) => Number(x.montoSumaAsegurada) === Number(this.fp['capital'].value)
      )?.porcentajeRetorno;
      this.setValuePrimas();
    });
    this.fp['capital'].valueChanges.subscribe((val) => {
      this.PERCENTS$ = this.SUMA_ASEGURADA$?.find(
        (x) => Number(x.montoSumaAsegurada) === Number(val)
      )?.porcentajeRetorno;
      this.setValuePrimas();
    });

    this.fp['idFrecuencia'].valueChanges.subscribe((val) => {
      this.PERCENTS$ = this.SUMA_ASEGURADA$?.find(
        (x) => Number(x.montoSumaAsegurada) === Number(this.fp['capital'].value)
      )?.frecuenciaPago.find((x) => +x.idFrecuencia == +val)?.porcentajeRetorno;
      this.setValuePrimas();
      /*  this.fp['porcentajeRetorno'].setValue(
         this.PERCENTS$[0].montoPorcentaje
       );
       this.fp['primaMensual'].setValue(
         this.FRECUENCIA$.find((x) => Number(x.idFrecuencia) === Number(val))
           ?.porcentajeRetorno[0]?.primas[0]?.primaMensual
       );
       this.fp['primaRetorno'].setValue(
         this.FRECUENCIA$.find((x) => Number(x.idFrecuencia) === Number(val))
           ?.porcentajeRetorno[0]?.primas[0]?.primaRetorno
       );
       this.fp['primeraCuota'].setValue(
         this.FRECUENCIA$.find((x) => Number(x.idFrecuencia) === Number(val))
           ?.porcentajeRetorno[0]?.primas[0]?.primeraCuota
       ); */
    });
    this.fp['porcentajeRetorno'].valueChanges.subscribe((val) => {
      if (this.PERCENTS$) {
        // tslint:disable-next-line:max-line-length
        sessionStorage.setItem(
          'codigoComercio',
          this.PERCENTS$?.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.codigoComercio
        );
        this.fp.idTarifario.setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.idTarifario
        );
        this.fp['primaMensual'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primaMensual
        );
        this.fp['primaMensualTotal'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primaMensual + this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.descPrima
        );
        this.fp['primaAnual'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primaAnual
        );
        this.fp['primeraCuota'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primeraCuota
        );
        this.fp['primeraTotal'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primeraCuota + this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.descPrimeraCuota
        );
        this.fp['primaInicial'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primeraCuota
        );
        this.fp['primaRetorno'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.primaRetorno
        );
        this.fp['plan'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            ?.primas[0]?.plan
        );
        // tslint:disable-next-line:max-line-length
        this.fp['primaFallecimiento'].setValue(
          this.PERCENTS$.find((x) => Number(x.montoPorcentaje) === Number(val))
            .primas[0].primaFallecimiento
        );
      }
    });
    this._route.queryParams.subscribe((val) => {
      if (val.ndoc) {
        const resumen = JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
        sessionStorage.setItem('ndocLink', val.ndoc);
        this.isDefinitive = true;
      }
    });
    if (resum) {
      resum = JSON.parse(resum);
      // const resumen = this.resumenAtp;
      // tslint:disable-next-line:prefer-const
      /* let temp = resum?.cotizacionInfo;
      temp.moneda = resum.moneda; */
      this.formPlan.patchValue(resum);
      this.fp['moneda'].setValue(resum.moneda);
      this.fp['cantidadAnio'].setValue(resum.cantidadAnio);
      this.fp['plan'].setValue(resum.plan);
      this.fp['idFrecuencia'].setValue(resum.idFrecuencia);
      this.periodo = resum.frecuencia;
      /*  this.PERCENTS$ =
         this.DATASTEP2$[0].moneda[0].sumaAsegurada[0].frecuenciaPago[0].porcentajeRetorno; */
      // FIXME: VALIDAR SI EL POCENTAJE SE ENCUENTRA EN EL COMBOBOX
      // this.fp['porcentajeRetorno'].setValue(resum.porcentajeRetorno);

      // FIXED: VALIDADO
      if (
        this.PERCENTS$?.find(
          (x) => Number(x.montoPorcentaje) === Number(resum.porcentajeRetorno)
        )
      ) {
        this.fp['porcentajeRetorno'].setValue(resum.porcentajeRetorno);
      } else {
        this.fp['porcentajeRetorno'].setValue(
          this.PERCENTS$[0].montoPorcentaje
        );
      }

      this.fp['terms'].setValue(true);
      this.fp['beneficiarioLegal'].setValue(resum.beneficiarios?.length === 0);
      this.beneficiarioLegal = this.fp['beneficiarioLegal'].value;
      if (!this.fp['beneficiarioLegal']) {
        this.isAddBenf = true;
      }
      this.saveDataStepToStorage();
    }
    this.formPlan.valueChanges.subscribe((val) => {
      this.saveDataStepToStorage();
    });
    if (this.resumenAtp) {
      this.setInitData();
    }
    if (this.quotationGeneratedOfAssesor) {
      this.formPlan.controls['beneficiarioLegal'].disable();
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetector.detectChanges();
  }

  setInitData(): void {
    if (this.DATASTEP2$) {
      if (!this.resumenAtp) {
        this.MONEY$ = this.DATASTEP2$[0].moneda;
        this.PERCENTS$ =
          this.DATASTEP2$[0].moneda[0].sumaAsegurada[0].frecuenciaPago[0].porcentajeRetorno;
        this.FRECUENCIA$ = this.DATASTEP2$[0].moneda[0].sumaAsegurada[0].frecuenciaPago;
        const primas = this.PERCENTS$[0].primas[0];
        this.SUMA_ASEGURADA$ = this.DATASTEP2$[0].moneda[0].sumaAsegurada;
        this.simboloMoneda = this.MONEY$[0].simbolo;
        this.fp['idTarifario'].setValue(primas.idTarifario);
        this.fp['cantidadAnio'].setValue(this.DATASTEP2$[0].edad);
        this.fp['moneda'].setValue(this.DATASTEP2$[0].moneda[0].idMoneda);
        this.fp['capital'].setValue(this.SUMA_ASEGURADA$[0].montoSumaAsegurada);
        this.fp['frecuencia'].setValue(this.FRECUENCIA$[0].frecuencia);
        this.periodo = this.FRECUENCIA$[0].frecuencia;
        this.fp['idFrecuencia'].setValue(this.FRECUENCIA$[0].idFrecuencia);
        this.fp['primaMensualTotal'].setValue(primas.primaMensual + primas.descPrima);
        this.fp['primaMensual'].setValue(primas.primaMensual);
        this.fp['descPrima'].setValue(primas.descPrima);
        this.fp['descPrimeraCuota'].setValue(primas.descPrimeraCuota);
        this.fp['primeraTotal'].setValue(primas.primeraCuota + primas.descPrimeraCuota);
        this.fp['primeraCuota'].setValue(primas.primeraCuota);
        this.fp['primaAnual'].setValue(primas.primaAnual);
        this.fp['plan'].setValue(primas.plan);
        this.fp['primaInicial'].setValue(primas.primeraCuota);
        this.fp['primaRetorno'].setValue(primas.primaRetorno);
        this.fp['primaFallecimiento'].setValue(primas.primaFallecimiento);
        this.fp['porcentajeRetorno'].setValue(
          this.PERCENTS$[0].montoPorcentaje
        );
        sessionStorage.setItem('codigoComercio', primas.codigoComercio);
      } else {
        this.MONEY$ = this.DATASTEP2$.find(
          (x) =>
            Number(x.edad) ===
            Number(this.resumenAtp.cotizacionInfo.cantidadAnios)
        ).moneda;
        this.SUMA_ASEGURADA$ = this.MONEY$.find(
          (x) =>
            Number(x.idMoneda) ===
            Number(this.resumenAtp.cotizacionInfo.idMoneda)
        ).sumaAsegurada;
        // tslint:disable-next-line:max-line-length
        this.FRECUENCIA$ = this.SUMA_ASEGURADA$.find(
          (x) =>
            Number(x.montoSumaAsegurada) ===
            Number(this.resumenAtp.cotizacionInfo.capital)
        ).frecuenciaPago;
        this.PERCENTS$ = this.FRECUENCIA$.find(
          (x) =>
            Number(x.idFrecuencia) ===
            Number(this.resumenAtp.cotizacionInfo.idFrecuenciaPago)
        ).porcentajeRetorno;
        // tslint:disable-next-line:max-line-length
        const primas = this.PERCENTS$.find(
          (x) =>
            Number(x.montoPorcentaje) ===
            Number(this.resumenAtp.cotizacionInfo.porcentajeRetorno)
        ).primas[0];
        this.simboloMoneda = this.MONEY$.find(
          (x) =>
            Number(x.idMoneda) ===
            Number(this.resumenAtp.cotizacionInfo.idMoneda)
        ).simbolo;
        this.fp['idTarifario'].setValue(primas.idTarifario);
        this.fp['cantidadAnio'].setValue(
          this.resumenAtp.cotizacionInfo.cantidadAnios
        );
        this.fp['moneda'].setValue(this.resumenAtp.cotizacionInfo.idMoneda);
        this.fp['capital'].setValue(this.resumenAtp.cotizacionInfo.capital);
        this.fp['primaMensual'].setValue(primas.primaMensual);
        this.fp['primaAnual'].setValue(primas.primaAnual);
        this.fp['plan'].setValue(primas.plan);
        this.fp['idFrecuencia'].setValue(this.FRECUENCIA$[0].frecuencia);
        this.fp['primaInicial'].setValue(primas.primeraCuota);
        this.fp['primaRetorno'].setValue(primas.primaRetorno);
        this.fp['primaFallecimiento'].setValue(primas.primaFallecimiento);

        this.periodo = this.resumenAtp.cotizacionInfo.frecuenciaPago;

        this.fp['frecuencia'].setValue(this.resumenAtp.cotizacionInfo.frecuenciaPago);
        this.fp['idFrecuencia'].setValue(this.resumenAtp.cotizacionInfo.idFrecuenciaPago);
        this.fp['descPrima'].setValue(this.resumenAtp.cotizacionInfo.descPrima);
        this.fp['descPrimeraCuota'].setValue(this.resumenAtp.cotizacionInfo.descPrimeraCuota);

        this.fp['porcentajeRetorno'].setValue(
          this.resumenAtp.cotizacionInfo.porcentajeRetorno
        );
        sessionStorage.setItem('codigoComercio', primas.codigoComercio);
      }
    }
  }

  get resumenAtp(): ResumenResponse | null {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  get dataContratanteNotSame(): any {
    return JSON.parse(sessionStorage.getItem('dataContratantenotSame'));
  }

  get dataContratante(): any {
    return JSON.parse(sessionStorage.getItem('infoContratante'));
  }

  ngOnDestroy(): void {
    // this._subscription.unsubscribe();
  }

  get sumaPorcentajeParticicionBeneficiarios(): number {
    let sumaPorcentajeParticipacionBeneficiarios = 0;
    /*const dataBeneficiarios: Array<any> = JSON.parse(sessionStorage.getItem('dataBeneficiarios'));
    if (!!dataBeneficiarios) {
      dataBeneficiarios.forEach(e => {
        sumaPorcentajeParticipacionBeneficiarios += Number(e?.porcentajeParticipacion || 0);
      });
    }*/
    this.dataBeneficiarios.forEach((e) => {
      sumaPorcentajeParticipacionBeneficiarios += Number(
        e?.porcentajeParticipacion || 0
      );
    });
    return sumaPorcentajeParticipacionBeneficiarios;
  }

  sameOrNot() {

    if (this.dataContratanteNotSame.success) {
      this.msgDX = this.sessionDataDocument.p_SCLIENT_NAME + ' ' + this.sessionDataDocument.p_SCLIENT_APPPAT;
    } else {
      this.msgDX = '';
    }
  }

  get porcentajePorAsignar(): string {
    if (100 - this.sumaPorcentajeParticicionBeneficiarios === 0) {
      return null;
    } else {
      if (100 - this.sumaPorcentajeParticicionBeneficiarios > 0) {
        return `Por asignar: ${100 - this.sumaPorcentajeParticicionBeneficiarios
        }%`;
      }
    }
    return null;
  }

  get validSumaPercentBenf(): boolean {
    let sumaPercentdataBeneficiarios = 0;
    this.dataBeneficiarios?.forEach((e) => {
      sumaPercentdataBeneficiarios += Number(e.porcentajeParticipacion);
    });
    if (sumaPercentdataBeneficiarios >= 100) {
      return true;
    }
    return false;
  }

  setValuePrimas(): void {
    let prueba = null;
    // tslint:disable-next-line:max-line-length
    if (this.DATASTEP2$.find((x) => +x.edad == +this.fp['cantidadAnio'].value).moneda.find((x) => +x.idMoneda == +this.fp['moneda'].value)) {
      prueba = this.DATASTEP2$.find((x) => +x.edad == this.fp['cantidadAnio'].value).moneda.find((x) =>
        +x.idMoneda == +this.fp['moneda'].value).sumaAsegurada;
    } else {
      prueba = this.DATASTEP2$[0].moneda[0].sumaAsegurada;
    }
    let sumaAsegurada = null;
    if (prueba.find((x) => +x.montoSumaAsegurada == +this.fp['capital'].value)) {
      sumaAsegurada = prueba.find((x) => +x.montoSumaAsegurada == +this.fp['capital'].value).frecuenciaPago;
    } else {
      sumaAsegurada = prueba[0].frecuenciaPago;
    }
    const frecuenciaPago = sumaAsegurada;
    if (frecuenciaPago.find((x) => +x.idFrecuencia == +this.fp['idFrecuencia'].value
    )) {
      this.fp['frecuencia'].setValue(frecuenciaPago.find((x) => +x.idFrecuencia == +this.fp['idFrecuencia'].value).frecuencia);
      this.PERCENTS$ =
        frecuenciaPago.find((x) => +x.idFrecuencia == +this.fp['idFrecuencia'].value
        ).porcentajeRetorno;
    } else {
      this.PERCENTS$ =
        frecuenciaPago[0].porcentajeRetorno;
    }


    /*  */
    const percent = !!this.PERCENTS$?.length ? this.PERCENTS$[0] : null;
    const cuota = !!this.FRECUENCIA$?.length ? this.FRECUENCIA$[0] : null;

    if (percent) {
      sessionStorage.setItem(
        'codigoComercio',
        percent.primas[0].codigoComercio
      );
      this.fp.idTarifario.setValue(percent.primas[0].idTarifario);
      this.fp['porcentajeRetorno'].setValue(percent.montoPorcentaje);
      this.fp['primaMensual'].setValue(percent.primas[0].primaMensual);
      this.fp['primaAnual'].setValue(percent.primas[0].primaAnual);
      this.fp['plan'].setValue(percent.primas[0].plan);
      this.fp['primaInicial'].setValue(percent.primas[0].primeraCuota);
      this.fp['primaRetorno'].setValue(percent.primas[0].primaRetorno);
      this.fp['primaFallecimiento'].setValue(
        percent.primas[0].primaFallecimiento
      );
      this.fp['primeraCuota'].setValue(
        percent.primas[0].primeraCuota
      );
      this.fp['primaMensualTotal'].setValue(
        percent.primas[0].primaMensual + percent.primas[0].descPrima
      );
      this.fp['primeraTotal'].setValue(
        percent.primas[0].primeraCuota + percent.primas[0].descPrimeraCuota
      );
      this.fp['descPrima'].setValue(
        percent.primas[0].descPrima
      );
      this.fp['descPrimeraCuota'].setValue(
        percent.primas[0].descPrimeraCuota
      );
    }
  }

  get sessionDataDocument(): any {
    return JSON.parse(sessionStorage.getItem('info-document'));
  }

  changeYearPlan(data: AgesDto): void {
    this.changeDataForm = true;
    this.fp['cantidadAnio'].setValue(data.edad);
  }

  changeTypeMoneyPlan(data: CurrencyDto): void {
    this.changeDataForm = true;
    this.fp['moneda'].setValue(data.idMoneda);
  }

  changeRate(data: any): void {
    this.fp['capital'].setValue(data[0].nReturnRate);
  }

  changeFrecuency(frecuencyP) {
    /*   this.fp['idFrecuencia'].setValue(data[0]); */
    this.periodo = this.FRECUENCIA$.find((x) => +x.idFrecuencia == +frecuencyP).frecuencia;
    /* const mostrarFrecuencia = this.idFrecuencia.idFrecuencia;
    console.log(this.idFrecuencia.idFrecuencia);
     */
  }

  saveDataStepToStorage() {
    const dataStep2: any = {
      idProcess: Number(sessionStorage.getItem('idProcess')),
      ...this.formPlan.getRawValue(),
      porcentajeRetorno: Number(this.fp['porcentajeRetorno'].value),
      beneficiarios: this.dataBeneficiarios,
      fechaInicio: this.fechaIni,
      fechaFin: this.fechaFin,
    };
    sessionStorage.setItem('step2', JSON.stringify(dataStep2));
  }

  get fp(): any {
    return this.formPlan.controls;
  }

  get anualPremiumDolar(): boolean {
    const plan = JSON.parse(sessionStorage.getItem('step2'));
    const tipodeCambio = localStorage.tipocambio;
    if (plan.moneda == 1) {
      return +plan.primaAnual / tipodeCambio >= 1500;
    }
    return +plan.primaAnual >= 1500;
  }

  nextStep(): void {
    this.errorForm = '';
    this.tipoErrorFormBeneficiario = '';
    let sumaPercentdataBeneficiarios = 0;
    this.dataBeneficiarios
      ?.filter((x) => x.complete)
      .forEach((e) => {
        sumaPercentdataBeneficiarios += Number(e.porcentajeParticipacion);
      });
    if (this.beneficiarioLegal) {
      this.dataBeneficiarios = [];
    }
    if (!this.isAddBenf) {
      sessionStorage.removeItem('dataBeneficiarios');
      this.submitDataForm();
    } else {
      if (sumaPercentdataBeneficiarios === 100) {
        this.submitDataForm();
      } else {
        this.errorForm = 'La suma de los beneficiarios debe ser 100%';
      }
    }
  }

  get fechaIni(): string {
    const day = Number(new Date().getDate());
    const month = Number(new Date().getMonth()) + 1;
    const year = Number(new Date().getFullYear());
    const dateIni = `${day}/${month}/${year}`;
    return dateIni;
  }

  get fechaFin(): string {
    const day = Number(new Date().getDate());
    const month = Number(new Date().getMonth()) + 1;
    const year =
      Number(new Date().getFullYear()) + Number(this.fp.cantidadAnio.value);
    const nextYear = `${day}/${month}/${year}`;
    return nextYear;
  }

  private submitDataForm(): void {
    const gtmTrackingPayload = {
      eventName: 'virtualEventGA4_C',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 2',
        'Sección': 'Protección y Devolución',
        'TipoAcción': 'Intención de avance',
        'Periodo': `${this.fp['cantidadAnio'].value} años`,
        'Moneda': this.fp['moneda'].value == 1 ? 'S/' : 'US$',
        'SumaAsegurada': this.fp['capital'].value,
        'Frecuencia': this.periodo,
        'Devolución': this.fp['primaRetorno'].value,
        'CheckTérminos': 'Activado',
        'CheckBeneficiarios': this.isAddBenf ? 'Desactivado' : 'Activado',
        'CheckOtrosBeneficiarios': this.isAddBenf ? 'Activado' : 'Desactivado',
        'NumBeneficiarios': this.dataBeneficiarios.length,
        'CTA': 'Siguiente',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtmTrackingPayload);

    this._spinner.show();
    const dateIni = this.fechaIni;
    const dateFIn = this.fechaFin;
    const dataParameter: Step2Request = new Step2Request({
      idProcess: Number(sessionStorage.getItem('idProcess')),
      ...this.formPlan.getRawValue(),
      fechaInicio: dateIni,
      fechaFin: dateFIn,
      beneficiarios: this.fp['beneficiarioLegal'].value
        ? []
        : this.dataBeneficiarios.filter((x) => x.complete),
    });

    this.saveDataStepToStorage();

    this._Step2Service.step2Complete(dataParameter).subscribe(
      (res: Step2Response) => {
        this._spinner.hide();
        if (this.anualPremiumDolar) {
          this.canContinue = false;
          this.vc.createEmbeddedView(this.notContinue);
          return;
        }
        if (res.success) {
          const gtmTrackingSuccessPayload = {
            eventName: 'virtualEventGA4_C',
            payload: {
              'Producto': 'Vida Devolución Protecta',
              'Paso': 'Paso 2',
              'Sección': 'Protección y Devolución',
              'TipoAcción': 'Avance exitoso',
              'Periodo': `${this.fp['cantidadAnio'].value} años`,
              'Moneda': this.fp['moneda'].value == 1 ? 'S/' : 'US$',
              'SumaAsegurada': this.fp['capital'].value,
              'Frecuencia': this.periodo,
              'Devolución': this.fp['primaRetorno'].value,
              'CheckTérminos': 'Activado',
              'CheckBeneficiarios': this.isAddBenf ? 'Desactivado' : 'Activado',
              'CheckOtrosBeneficiarios': this.isAddBenf ? 'Activado' : 'Desactivado',
              'NumBeneficiarios': this.dataBeneficiarios.length,
              'CTA': 'Siguiente',
              'TipoCliente': sessionStorage.getItem('client-type'),
              'ID_Proceso': sessionStorage.getItem('idProcess'),
              'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
            }
          };
          this.trackingService.gtmTracking(gtmTrackingSuccessPayload);

          sessionStorage.setItem('step', '3');
          this._MainService.step = 3;
          this._Router.navigate(['/vidadevolucion/step3'], {
            queryParamsHandling: 'merge',
          });
        } else {
          this.sendNotification();
        }
        const isEcommerce = sessionStorage.getItem('processDigitalPlatform') || null;
        if (isEcommerce == null) {
          this.saveDataContratante();
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  backStep(): void {
    this._Router.navigate(['/vidadevolucion/step1'], {
      queryParamsHandling: 'merge',
    });
  }

  showAddBenf(): void {
    if (this.quotationGeneratedOfAssesor) {
      return;
    }

    this.isAddBenf = true;
    this.beneficiarioLegal = false;
    this.fp['beneficiarioLegal'].setValue(false);
    this.formBeneficiario.nativeElement.scrollIntoView({ behavior: 'smooth' });
    if (this.dataBeneficiarios.length === 0) {
      const benef = new BeneficiarioDto({ index: 1, complete: false });
      this.dataBeneficiarios.push(benef);
      this.saveBeneficiariosToStorage();
    }
    this.enableAgregarBeneficiario = false;
    // this.addNewBeneficiario();
  }

  changeCheckBox(chk: boolean): void {
    this.isAddBenf = false;
    this.beneficiarioLegal = true;
    this.fp['beneficiarioLegal'].setValue(true);
  }

  formatMoney(ammount: string): string {
    return `${this.getMonedaSimbol(
      this.fp['moneda'].value
    )} ${this._DecimalPipe.transform(ammount, '1.2-2')}`;
  }

  get dataSlip(): SlipRequest {
    const userData = JSON.parse(sessionStorage.getItem('step1'));
    const userDataDocumento = JSON.parse(
      sessionStorage.getItem('info-document')
    );
    const step2Data = JSON.parse(sessionStorage.getItem('step2'));
    const fechaActual = moment(new Date()).format('DD/MM/YYYY').toString();
    const fechaSiguiente = moment(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .format('DD/MM/YYYY')
      .toString();
    let name = `${userDataDocumento.p_SCLIENT_NAME} ${userDataDocumento.p_SCLIENT_APPPAT} ${userDataDocumento.p_SCLIENT_APPMAT}`;
    if (name.indexOf('null') > 0) {
      name = '-';
    }
    const data: SlipRequest = {
      asegurado: name,
      cantidadAnios: this.fp['cantidadAnio'].value,
      capital: this._DecimalPipe.transform(this.fp['capital'].value, '1.2-2'),
      correo: userData.email,
      fechaInicio: fechaActual,
      fechaSolicitud: fechaActual,
      fechaNacimiento: userData.fechaNac,
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idTarifario: this.fp['idTarifario'].value,
      fechaFin: fechaSiguiente,
      fechaVencimiento: fechaSiguiente,
      monedaDescripcion: this.getMonedaDesc(this.fp['moneda'].value),
      monedaSimbolo: this.getMonedaSimbol(this.fp['moneda'].value),
      nroDocumento: userData?.nDoc?.toString(),
      porcentajeDevolucion: this.fp['porcentajeRetorno'].value,
      primaAnual: this._DecimalPipe.transform(
        this.fp['primaAnual'].value,
        '1.2-2'
      ),
      primaMensual: this._DecimalPipe.transform(
        this.fp['primaMensual'].value,
        '1.2-2'
      ),
      primaRetorno: this._DecimalPipe.transform(
        this.fp['primaRetorno'].value,
        '1.2-2'
      ),
      primaFallecimiento: this._DecimalPipe.transform(
        this.fp['primaFallecimiento'].value,
        '1.2-2'
      ),
      primaInicial: this._DecimalPipe.transform(
        this.fp['primaInicial'].value,
        '1.2-2'
      ),
      descPrima: +this._DecimalPipe.transform(this.fp['descPrima'].value, '1.2-2'),
      descPrimeraCuota: +this._DecimalPipe.transform(this.fp['descPrimeraCuota'].value, '1.2-2'),
      primaMensualTotal: +this._DecimalPipe.transform(this.fp['primaMensualTotal'].value, '1.2-2'),
      primeraTotal: +this._DecimalPipe.transform(this.fp['primeraTotal'].value, '1.2-2'),
      idFrecuencia: this.fp['idFrecuencia'].value,
      frecuencia: this.fp['frecuencia'].value,
      contratante: {
        nombre: this.dataContratante != null ? this.dataContratante.p_SCLIENT_NAME + ' ' + this.dataContratante.p_SCLIENT_APPPAT
          + ' ' + this.dataContratante.p_SCLIENT_APPMAT : name,
        nrodocumento: this.dataContratante != null ?
          this.dataContratante.p_SDOCUMENT : userData?.nDoc?.toString(),
        fechanacimiento: this.dataContratante != null ?
          this.dataContratante.p_DBIRTHDAT : userData.fechaNac,
        correo: this.dataContratante != null ? this.dataContratanteNotSame.email : userData.email,
      },
    };
    return data;
  }

  sendSlip() {
    this._spinner.show();
    this._Step2Service.sendSlip(this.dataSlip, 1).subscribe(
      (res: any) => {
        this.sendDownloadSlip(this.dataSlip);
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  private sendDownloadSlip(data): void {
    this._Step2Service.sendSlip(data, 2).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.showHideModalSlip(true);
        this.downloadArchivo(res.body);
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }

  get idecon(): any {
    return JSON.parse(sessionStorage.getItem('validity'));
  }

  get idFrecuencia(): any {
    return JSON.parse(sessionStorage.getItem('step2'));
  }

  get namesComplete(): string {
    return `${this.insurance.p_SCLIENT_NAME} ${this.insurance.p_SCLIENT_APPPAT} ${this.insurance.p_SCLIENT_APPMAT}`;
  }

  private sendNotification(): void {
    const data = new NotificationRequest({
      idProcess: sessionStorage.getItem('idProcess') || '0',
      asegurado: this.namesComplete,
      cantidadAnios: this.fp.cantidadAnio.value,
      capital: this.formatMoney(this.fp.capital.value),
      email: this.step1Data.email,
      telefono: Number(this.step1Data.telefono),
      fechaNacimiento: this.step1Data.fechaNac,
      fechaSolicitud: new Date().toDateString(),
      monedaDescripcion: this.getMonedaDesc(this.fp.moneda.value),
      monedaSimbolo: this.getMonedaSimbol(this.fp.moneda.value),
      nroDocumento: this.step1Data.nDoc,
      porcentajeDevolucion: this.fp.porcentajeRetorno.value,
      primaAnual: this.formatMoney(this.fp.primaAnual.value),
      primaFallecimiento: this.formatMoney(this.fp.primaFallecimiento.value),
      primaInicial: this.formatMoney(this.fp.primaInicial.value),
      primaMensual: this.formatMoney(this.fp.primaMensual.value),
      primaRetorno: this.formatMoney(this.fp.primaRetorno.value),

      idFrecuencia: this.fp.idFrecuencia.value,
      frecuencia: Number(this.fp.frecuencia.value),
      descPrima: this.formatMoney(this.fp.descPrima.value),
      descPrimeraCuota: this.formatMoney(this.fp.descPrimeraCuota.value),
      tipoNotificacion: 'CotizacionVidaIndividual',
      ...this.idecon,
    });
    this._MainService.sendNotification(data).subscribe();
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('info-document'));
  }

  get step1Data(): any {
    return JSON.parse(sessionStorage.getItem('step1'));
  }

  getMonedaDesc(val): string {
    switch (Number(val)) {
      case 1: {
        return 'SOLES';
      }
      case 2: {
        return 'DÓLARES';
      }
      default: {
        return 'DESCRIPCION MONEDA';
      }
    }
  }

  getMonedaSimbol(val): string {
    switch (Number(val)) {
      case 1: {
        return 'S/';
      }
      case 2: {
        return 'US$';
      }
      default: {
        return 'SIMBOLO MONEDA';
      }
    }
  }

  showHideModalSlip(val) {
    if (val) {
      this.modalSlip.show();
    } else {
      this.modalSlip.hide();
    }
  }

  saveBeneficiario(emit: any): void {
    this.enableAgregarBeneficiario = emit.valid;

    if (emit.valid) {
      const findBenef = this.dataBeneficiarios?.find(
        (x) => Number(x?.index) === Number(emit?.data?.index)
      );
      const idx = this.dataBeneficiarios.indexOf(findBenef);
      this.dataBeneficiarios[idx] = emit.data;
      // this.dataBeneficiarios[emit.index - 1] = emit;
      this.validarBeneficiarios();
      this.saveBeneficiariosToStorage();
      if (
        this.dataBeneficiarios.length === 4 &&
        this.sumaPorcentajeParticicionBeneficiarios < 100
      ) {
        this.errorForm = `Falta asignar un ${100 - this.sumaPorcentajeParticicionBeneficiarios
        }% a sus beneficiarios`;
      }
    }
  }

  validarBeneficiarios(): void {
    this.enableAgregarBeneficiario = false;
    if (
      this.validarLengthBeneficiarios &&
      this.dataBeneficiarios.length < 4 &&
      this.sumaPorcentajeParticicionBeneficiarios < 100
    ) {
      this.enableAgregarBeneficiario = true;
    }
  }

  addNewBeneficiario() {
    this.enableAgregarBeneficiario = false;

    if (this.dataBeneficiarios.length === 0) {
      const benef = new BeneficiarioDto({ index: 1, complete: false });
      this.dataBeneficiarios.push(benef);
    } else {
      if (
        this.validarLengthBeneficiarios &&
        this.dataBeneficiarios.length < 4 &&
        this.sumaPorcentajeParticicionBeneficiarios < 100
      ) {
        if (
          this.dataBeneficiarios[this.dataBeneficiarios.length - 1].complete
        ) {
          // tslint:disable-next-line:max-line-length
          const benef = new BeneficiarioDto({
            index:
              this.dataBeneficiarios[this.dataBeneficiarios.length - 1].index +
              1,
            complete: false,
          });
          this.dataBeneficiarios.push(benef);
        }
      }
    }
    sessionStorage.setItem(
      'dataBeneficiarios',
      JSON.stringify(this.dataBeneficiarios)
    );
  }

  validarSumaPorcentajeParticipacionBeneficiarios(): boolean {
    let sumaPorcentajeParticipacionBeneficiarios = 0;
    const dataBeneficiarios: Array<BeneficiarioDto> = JSON.parse(
      sessionStorage.getItem('dataBeneficiarios')
    );
    if (!!dataBeneficiarios) {
      /*if (this.isForUpdate) {
              const benf = dataBeneficiarios.filter(x => Number(x.numeroDocumento) !== Number(this.f['numeroDocumento'].value));
              benf.forEach(e => {
                sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
              });
            } else {
              dataBeneficiarios.forEach(e => {
                sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
              });
            }*/
    }
    this.dataBeneficiarios
      .filter((x) => x.complete)
      .forEach((e) => {
        sumaPorcentajeParticipacionBeneficiarios +=
          Number(e?.porcentajeParticipacion) || 0;
      });
    if (sumaPorcentajeParticipacionBeneficiarios > 100) {
      return false;
    }
    return true;
  }

  updateDateBeneficiario(emit: BeneficiarioDto) {
    // tslint:disable-next-line:max-line-length
    this.dataBeneficiarios = this.dataBeneficiarios.filter(
      (x) => x.numeroDocumento !== emit.numeroDocumento
    );
    this.dataBeneficiarios.push(emit);
    this.saveBeneficiariosToStorage();
  }

  eliminarBeneficiario(emit: BeneficiarioDto) {
    emit.codigoCliente =
      Number.isNaN(Number(emit.codigoCliente)) ? null : emit.codigoCliente;
    // tslint:disable-next-line:max-line-length
    this.dataBeneficiarios = this.dataBeneficiarios.filter(
      (x) => x.index !== emit.index
    );

    /*this.dataBeneficiarios.forEach(val => {
          if (!val.numeroDocumento &&
            !val.nombre &&
            !val.apellidoPaterno &&
            !val.apellidoMaterno &&
            !val.relacion &&
            !val.porcentajeParticipacion &&
            !val.fechaNacimiento &&
            !val.idSexo) {
            console.log('pop');
            this.dataBeneficiarios.pop();
          }
        });*/

    /*let index = 0;
        this.dataBeneficiarios.forEach(val => {
          if (index > val.index) {
            index = index;
          } else {
            index = val.index;
          }
        });*/

    /*this.saveBeneficiariosToStorage();
        const benef = new BeneficiarioDto({ index: this.dataBeneficiarios?.length + 1, complete: false });
        this.dataBeneficiarios.push(benef);*/

    if (this.dataBeneficiarios.length === 0) {
      const benef = new BeneficiarioDto({ index: 1, complete: false });
      this.dataBeneficiarios.push(benef);
    }
    /*const benef = new BeneficiarioDto({ index: index + 1, complete: false });
        this.dataBeneficiarios.push(benef);*/

    this.saveBeneficiariosToStorage();
    this.validarBeneficiarios();
    if (this.dataBeneficiarios[this.dataBeneficiarios.length - 1].complete) {
      this.enableAgregarBeneficiario = true;
    } else {
      this.enableAgregarBeneficiario = false;
    }
  }

  saveBeneficiariosToStorage(): void {
    sessionStorage.setItem(
      'dataBeneficiarios',
      JSON.stringify(this.dataBeneficiarios)
    );
    this.showFormBeneficiarios = this.validarLengthBeneficiarios;
  }

  /*validarSumaPorcentajeParticipacionBeneficiarios(emit: number): void {
      this.showFormBeneficiarios = this.validarLengthBeneficiarios;
    }*/
  get validarLengthBeneficiarios(): boolean {
    this.errorForm = null;
    if (JSON.parse(sessionStorage.getItem('dataBeneficiarios'))?.length > 4) {
      return false;
    }
    if (this.sumaPorcentajeParticicionBeneficiarios > 100) {
      this.errorForm =
        'La suma de las asignaciones debe de sumar un total de 100%';
      return false;
    }
    return true;
  }

  get validarForNextStep(): boolean {
    if (
      this.validarLengthBeneficiarios &&
      this.sumaPorcentajeParticicionBeneficiarios === 100
    ) {
      // tslint:disable-next-line:prefer-const
      let codigoClientes = [];
      this.dataBeneficiarios.forEach((val: any) => {
        codigoClientes.push(val.codigoCliente);
      });
      const unicos = new Set(codigoClientes);
      if (unicos.size === this.dataBeneficiarios.length) {
        this.duplicatesBenf = false;
        return true;
      }
    }
    this.duplicatesBenf = true;
    return false;
  }

  get validBtnNextStep(): boolean {
    if (this.fp.terms.value) {
      if (this.beneficiarioLegal) {
        return true;
      } else if (this.validarForNextStep) {
        return true;
      }
    }
    return false;
  }

  descargarExclusiones(): void {
    const data = {
      archivo: sessionStorage.getItem('condiciones-exclusiones-vd'),
      nombre: 'Condiciones y exclusiones_v2',
    };
    this.downloadArchivo(data);
  }

  descargarTerminos(): void {
    const data = {
      archivo: sessionStorage.getItem('formato-trama-vd'),
      nombre: 'Terminos y condiciones',
    };
    this.downloadArchivo(data);
  }

  /* downloadArchivo(data) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += data.archivo;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', data.nombre + '.pdf');
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none');
      document.body.appendChild(a);
      a.click();
      a.remove();
    } */
  downloadArchivo(response) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], { type: 'application/pdf' });
      FileSaver.saveAs(data, response.nombre);
    }
  }

  backToInitReset(): void {
    sessionStorage.clear();
    this._Router.navigate(['/vidadevolucion/step1']);
  }

  saveDataContratante() {
    const prove = JSON.parse(sessionStorage.getItem('info-document')) || null;
    const resumendata = JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;
    const contractData = JSON.parse(sessionStorage.getItem('infoContratante')) || null;
    if (resumendata.success) {
      this.aseguradoContratante = false;
    } else {
      this.aseguradoContratante = true;
    }
    const payload = {
      idProcess: Number(sessionStorage.getItem('idProcess')),
      idClient: this.sessionDataDocument.p_SCLIENT,
      numeroDocumento: prove.p_SDOCUMENT,
      aseguradoContratante: this.aseguradoContratante,
      definitiva: false,
      contratante: prove != null ? {
        idTipoPersona: 1,
        idTipoDocumento: Number(resumendata.documentType),
        numeroDocumento: resumendata.documentNumber,
        nombres: resumendata.names,
        apellidoPaterno: resumendata.apellidoPaterno,
        apellidoMaterno: resumendata.apellidoMaterno,
        fechaNacimiento: resumendata.birthDate,
        idSexo: resumendata.sex,
        homonimo: 0,
        parentesco: 0,
        telefono: resumendata.phone,
        correo: resumendata.email,
        direccion: resumendata.address,
        idEstadoCivil: Number(resumendata.civilStatus),
        idDepartamento: Number(resumendata.department),
        idProvincia: Number(resumendata.province) || null,
        idDistrito: Number(resumendata.district) || null,
        obligacionFiscal: false,
        idOcupacion: 0
      } : null
    };
    this._Step1Service.saveDataContratante(payload).subscribe(
      (resp: any) => {
      }
    );
  }
}
