import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Step3Service } from '../../services/step3/step3.service';
import { MainService } from '../../services/main/main.service';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { Step3Request, Step3Response } from '../../models/step3.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { animate, style, transition, trigger } from '@angular/animations';
import { NotificationRequest } from '../../models/notification.model';
import moment from 'moment';
import { ResumenResponse } from '../../models/resumen.model';
import { DecimalPipe } from '@angular/common';
import { PepRequest, PepResponse } from '../../models/pep.model';
import { VidaDevolucionModel } from '../../models/vidadevolucion.model';
import { AppConfig } from '@root/app.config';
import { Step1Service } from '../../services/step1/step1.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(600, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class Step3Component implements OnInit {
  vd: VidaDevolucionModel;

  frmPreguntas: FormGroup;
  acept_dps: boolean;
  isValidPerson: boolean;
  isContractor: boolean;
  respuestasDPS: any[] = [];
  nCigarrosArray: number[] = [];
  nHospitalizado: number[] = [];


  msgDX: string;
  @ViewChild('modalDps', { static: true, read: ModalDirective })
  modalDps: ModalDirective;
  @ViewChild('modalNoValid', { static: true, read: ModalDirective })
  modalNoValid: ModalDirective;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _Router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _Step3Service: Step3Service,
    private readonly _spinner: NgxSpinnerService,
    private readonly _BsModalService: BsModalService,
    private readonly _MainService: MainService,
    private readonly _decimalPipe: DecimalPipe,
    private readonly _Step1Service: Step1Service,
    private readonly _utilsService: UtilsService,
    private readonly trackingService: TrackingService
  ) {
    this.vd = this._MainService.storage;
    this.msgDX = '';
    this.frmPreguntas = this._builder.group({
      talla: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-2][.][0-9]*$/),
          Validators.minLength(3),
          Validators.maxLength(4),
        ]),
      ],
      peso: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(2),
          Validators.maxLength(3),
        ]),
      ],
      fuma: [null, Validators.required],
      fuma_resp: [null],
      presion: [null, Validators.required],
      presion_resp: [null],
      cancer: [null, Validators.required],
      infarto: [null, Validators.required],
      gastro: [null, Validators.required],
      viaja: [null, Validators.required],
      deporte: [null, Validators.required]
    });
    this.acept_dps = false;
    this.isValidPerson = true;

    for (let i = 1; i <= 25; i++) {
      this.nCigarrosArray.push(i);
    }

    for (let i = 1; i <= 365; i++) {
      this.nHospitalizado.push(i);
    }

    this.f.fuma.valueChanges.subscribe((val) => {
      if (Number(val) === 1) {
        this.f.fuma_resp.setValidators([Validators.required]);
      } else {
        this.f.fuma_resp.clearValidators();
        this.f.fuma_resp.setValue(null);
      }
    });

    this.f.presion.valueChanges.subscribe((val) => {
      if (Number(val) === 1) {
        this.f.presion_resp.setValidators([Validators.required]);
      } else {
        this.f.presion_resp.clearValidators();
        this.f.presion_resp.setValue(null);
      }
    });

    this.frmPreguntas.valueChanges.subscribe(() => {
      sessionStorage.setItem(
        'dps',
        JSON.stringify(this.frmPreguntas.getRawValue())
      );
    });
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
    const dataStep3 = JSON.parse(sessionStorage.getItem('dps'));
    if (!!dataStep3) {
      this.frmPreguntas.setValue(dataStep3);
    }

    if (this.resumenAtp !== null) {
      this.frmPreguntas.patchValue(JSON.parse(this.resumenAtp.dps));
      if (!this.frmPreguntas.invalid) {
        this.frmPreguntas.disable();
      }
    }

    this._route.queryParams.subscribe((val) => {
      if (val.ndoc || this.numDocExist) {
        const valContractor = JSON.parse(sessionStorage.getItem('resumen-atp')) || null;

        if (valContractor.contratanteInfo.numeroDocumento == val.ndoc) {
          this.isContractor = true;
        } else if (valContractor.aseguradoInfo.numeroDocumento == val.ndoc) {
          this.isContractor = false;
        }
      }
    });

    this.sameOrNot();
  }

  get resumenAtp(): ResumenResponse | null {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  hideModalDps(): void {
    this.modalDps.hide();
  }

  get numDocExist(): any {
    return sessionStorage.getItem('ndocLink') || null;
  }

  get p3FrmVal(): boolean {
    return Number(this.frmPreguntas.get('fuma').value) === 1 ? true : false;
  }

  get p4FrmVal(): boolean {
    return Number(this.frmPreguntas.get('presion').value) === 1 ? true : false;
  }

  get dataContratanteNotSame(): any {
    return JSON.parse(sessionStorage.getItem('dataContratantenotSame'));
  }

  get hospitalizacionCovid(): boolean {
    return Number(this.f.hospitalizacion_covid.value) === 1;
  }

  get f(): any {
    return this.frmPreguntas.controls;
  }

  get userInfo(): any {
    return JSON.parse(sessionStorage.getItem('info-document')) || null;
  }

  sameOrNot() {
    if (this.dataContratanteNotSame.success) {
      if (!this.numDocExist) {
        this.isContractor = true;
      }
      this.msgDX = this.userInfo.p_SCLIENT_NAME + ' ' + this.userInfo.p_SCLIENT_APPPAT;
    } else {
      this.isContractor = false;
      this.msgDX = '';
    }
  }

  backStep(): void {
    this._Router.navigate(['/vidadevolucion/step2'], {
      queryParamsHandling: 'merge',
    });
  }

  getDataFrm(val): any {
    return this.frmPreguntas.get(val).value;
  }

  get step2(): any {
    return JSON.parse(sessionStorage.getItem('step2')) || null;
  }

  get step1(): any {
    return JSON.parse(sessionStorage.getItem('step1')) || null;
  }

  get nameUser(): string {
    return `${this.userInfo.p_SCLIENT_NAME} ${this.userInfo.p_SCLIENT_APPPAT} ${this.userInfo.p_SCLIENT_APPMAT}`;
  }

  formatMoney(ammount): string {
    return `${Number(this.step2.moneda) === 1 ? 'S/' : '$'
    } ${this._decimalPipe.transform(ammount, '1.2-2')}`;
  }

  get infoDocument(): any {
    return JSON.parse(sessionStorage.getItem('info-document'));
  }

  get resumen(): ResumenResponse {
    return JSON.parse(sessionStorage.getItem('resumen-atp')) || null;
  }

  nextStep(): void {
    sessionStorage.setItem(
      'dps',
      JSON.stringify(this.frmPreguntas.getRawValue())
    );

    const name = `${this.infoDocument.p_SCLIENT_NAME} ${this.infoDocument.p_SCLIENT_APPPAT} ${this.infoDocument.p_SCLIENT_APPMAT}`;
    const valContractor = JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;
    const sendData = this.dataContratanteNotSame.success;
    const pepRequest: PepRequest = {
      idProcess: this.idProcess.toString(),
      idTipoDocumento: this.step1.typeDoc,
      primerApellido: !sendData ? this.infoDocument.p_SCLIENT_APPPAT : valContractor.apellidoPatern,
      // tslint:disable-next-line:max-line-length
      nombres: !sendData ? name : `${valContractor.names} ${valContractor.apellidoPaterno || ''} ${valContractor.apellidoMaterno || ''}`.trim(),
      numeroDocumento: !sendData ? this.step1.nDoc : valContractor.documentNumber,
    };

    this._spinner.show();
    this._Step3Service.blackListExperian(pepRequest).subscribe(
      (res: PepResponse) => {
        this._spinner.hide();
        sessionStorage.setItem(
          'clientePep',
          JSON.stringify({
            isPepWC: res.isPep,
            experianRisk: res.experianRisk,
            isOtherListWC: res.isOtherList,
            isIdNumberWC: res.isIdNumber,
            approve: res.approve,
            TotalDeuda: res.deudaTotal,
          })
        );
        this.respuestasDPS = [
          {
            quest: '1. ¿Cual es su talla y peso?',
            resp: `Talla: ${this.getDataFrm(
              'talla'
            )} (m) Peso: ${this.getDataFrm('peso')} (kg)`,
          },
          {
            quest: '2. ¿Fuma? Indicar consumo diario',
            resp: `${this.convertResultadoQ4(
              this.getDataFrm('fuma_resp'),
              this.getDataFrm('fuma')
            )}`,
          },
          {
            quest:
              '3. ¿Se ha medido la presión arterial en los últimos 2 años?',
            resp: `${this.convertToYesOrno(this.getDataFrm('presion'))}`,
            sub_questions: [
              {
                quest: '¿Cual fue el resultado?',
                resp: `${this.convertResultQ3(
                  this.getDataFrm('presion_resp')
                )}`,
              },
            ],
          },
          {
            quest:
            // tslint:disable-next-line:max-line-length
              '4. ¿Usted tiene, o ha tenido, o se encuentra en tratamiento, o en proceso de diagnóstico, alguna de las iguientes enfemedades, dolencias o situaciones de salud?',
            sub_questions: [
              {
                // tslint:disable-next-line:max-line-length
                quest: `4.1 ¿Cáncer, tumores, V.I.H., SIDA, Linfomas, leucemia, Enfermedades Hematológicas, Enfermedades del Pulmón, Enfermedades al Riñón, Insuficiencia Renal Crónica?`,
                resp: `${this.convertToYesOrno(this.getDataFrm('cancer'))}`,
              },
              {
                // tslint:disable-next-line:max-line-length
                quest: `4.2 ¿Infarto al Miocardio, Infarto Cereblar, Enfermedades Cardiacas, Hipertensión Arterial,
          Enfermedades
          Coronarias, Soplos Cardiacos, Aneurismas, Accidentes Cerebrovasculares, Displidemia,
          Hipercolesterolemia,
          Sobrepreso, Obesidad, Diabetes Mellitus?`,
                resp: `${this.convertToYesOrno(this.getDataFrm('infarto'))}`,
              },
              {
                // tslint:disable-next-line:max-line-length
                quest: `4.3 ¿Enfermedades Gastrointestinales, Hepatitis (B o C), Cirrosis Hepática, Úlcera Gástrica,
          Colitis
          Ulcerosa, Epilepsia, Enfermedad de Alzheimer, Depresión, Enfermedades Psiquiatricas?`,
                resp: `${this.convertToYesOrno(this.getDataFrm('gastro'))}`,
              },
            ],
          },
          {
            quest: `5. ¿Realiza o participa en actividades o deportes riesgosos? se considera como tales actividades
      o deportes,
      aquellos que constituyan una clara agravación del riesgo o en el que se ponga en peligro su
      vida.`,
            sub_questions: [
              {
                quest: `5.1 ¿Viaja en helicópteros, aviones militares, de instrucción o aviones particulares, vuelos
          como piloto o
          estudiante?`,
                resp: `${this.convertToYesOrno(this.getDataFrm('viaja'))}`,
              },
              {
                quest: `5.2 ¿Practica paracaidismo, andinismo, automovilismo, buceo, motociclismo o afines, bungee
          jumping (caída
          libre con cuerda), pesca submarina, ala delta, planeador, rodeo, surf o cualquier otro
          deporte o actividad
          obviamente peligrosa?`,
                resp: `${this.convertToYesOrno(this.getDataFrm('deporte'))}`,
              },
            ],
          },
        ];
        this.nextStepRoute();
        return true;
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
        return false;
      }
    );
  }

  convertToYesOrno(val) {
    if (val == null || Number(val) === 0) {
      return 'No';
    }
    return 'Si';
  }

  convertResultadoQ4(val, fat) {
    if (Number(fat) === 0) {
      return 'No';
    }
    if (val == null || val === 0) {
      return 'No';
    } else {
      return 'Si, ' + val + ' uds.';
    }
    return val;
  }

  convertResultQ3(val): string {
    switch (Number(val)) {
      case 0: {
        return 'Ignoro';
      }
      case 1: {
        return 'Bajo';
      }
      case 2: {
        return 'Normal';
      }
      case 3: {
        return 'Alto';
      }
    }
    return '';
  }

  get cumulus(): any {
    return JSON.parse(sessionStorage.getItem('cumulus'));
  }

  get validarPerson(): boolean {
    const frm = this.frmPreguntas;
    const imc =
      Number(frm.get('peso').value) /
      (Number(frm.get('talla').value) * Number(frm.get('talla').value)) >
      33
        ? false
        : true;
    const peso = Number(frm.get('peso').value);
    const countCigarros =
      Number(frm.get('fuma_resp').value) > 20 ? false : true;
    const tallaCm = Number(frm.get('talla').value) * 100;
    const validPeso = tallaCm - 120 > peso ? false : true;
    const pArterial = Number(frm.get('presion_resp').value) !== 3;
    const cancer = Number(frm.get('cancer').value) !== 1;
    const infarto = Number(frm.get('infarto').value) !== 1;
    const gastro = Number(frm.get('gastro').value) !== 1;
    const viaja = Number(frm.get('viaja').value) !== 1;
    const deporte = Number(frm.get('deporte').value) !== 1;

    return (
      imc &&
      countCigarros &&
      validPeso &&
      pArterial &&
      cancer &&
      infarto &&
      gastro &&
      viaja &&
      deporte
    );
  }

  get idProcess(): number {
    return Number(sessionStorage.getItem('idProcess'));
  }

  get idecon(): any {
    return JSON.parse(sessionStorage.getItem('validity'));
  }

  nextStepRoute() {
    const dps: any = this.frmPreguntas.getRawValue();
    const gtmTrackingPayload = {
      eventName: 'virtualEventGA4_D',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 3',
        'Sección': 'Protección y Devolución',
        'TipoAcción': 'Intención de avance',
        'Medidas': `Talla ${dps.talla} / Peso ${dps.peso} Kg`,
        'Fuma': dps.fuma == 1 ? 'Activado' : 'Desactivado',
        'Presión': dps.presion == 1 ? 'Activado' : 'Desactivado',
        'PresiónResultado': dps.presion_resp ?? '',
        'Enfermedades1': dps.cancer == 1 ? 'Activado' : 'Desactivado',
        'Enfermedades2': dps.infarto == 1 ? 'Activado' : 'Desactivado',
        'Enfermedades3': dps.gastro == 1 ? 'Activado' : 'Desactivado',
        'Actividades1': dps.viaja == 1 ? 'Activado' : 'Desactivado',
        'Actividades2': dps.deporte == 1 ? 'Activado' : 'Desactivado',
        'Covid1': 'Desactivado',
        'Covid2': 'Desactivado',
        'Covid3': 'Desactivado',
        'CTA': 'Siguiente',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtmTrackingPayload);

    this._spinner.show();
    const data: Step3Request = {
      idProcess: this.idProcess,
      jsondps: JSON.stringify(this.frmPreguntas.getRawValue()),
    };
    this._Step3Service.submitEncuesta(data).subscribe(
      (res: Step3Response) => {
        this._spinner.hide();
        if (!this.validarPerson) {
          this.sendNotification('ValidacionDPSVidaIndividual');
          return;
        }

        if ((this.clientePep.experianRisk && this.clientePep.approve == false) && !this.vd.tarifario.saltarExperian) {

          this.sendNotification('RiesgoCrediticioVidaIndividual');
          this.sendNotification('ErrorRiesgoCrediticioVdp');

          return;
        }
        /* if (res.isIdNumber ||
          res.isOtherList ||
          res.isPep) {
          this.sendNotification('PEPVidaIndividual');
          return;
        } */
        if (
          this.clientePep.isOtherList &&
          !this.vd.tarifario.saltarWorldCheck
        ) {
          this.sendNotification('PEPVidaIndividual');
          return;
        }
        if (res && this.validarPerson && !this.isContractor) {
          const gtmTrackingSuccessPayload = {
            eventName: 'virtualEventGA4_D',
            payload: {
              'Producto': 'Vida Devolución Protecta',
              'Paso': 'Paso 3',
              'Sección': 'Protección y Devolución',
              'TipoAcción': 'Avance exitoso',
              'Medidas': `Talla ${dps.talla} / Peso ${dps.peso} Kg`,
              'Fuma': dps.fuma == 1 ? 'Activado' : 'Desactivado',
              'Presión': dps.presion == 1 ? 'Activado' : 'Desactivado',
              'PresiónResultado': dps.presion_resp ?? '',
              'Enfermedades1': dps.cancer == 1 ? 'Activado' : 'Desactivado',
              'Enfermedades2': dps.infarto == 1 ? 'Activado' : 'Desactivado',
              'Enfermedades3': dps.gastro == 1 ? 'Activado' : 'Desactivado',
              'Actividades1': dps.viaja == 1 ? 'Activado' : 'Desactivado',
              'Actividades2': dps.deporte == 1 ? 'Activado' : 'Desactivado',
              'Covid1': 'Desactivado',
              'Covid2': 'Desactivado',
              'Covid3': 'Desactivado',
              'CTA': 'Siguiente',
              'TipoCliente': sessionStorage.getItem('client-type'),
              'ID_Proceso': sessionStorage.getItem('idProcess'),
              'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
            }
          };
          this.trackingService.gtmTracking(gtmTrackingSuccessPayload);

          const gtmTrackingModalPayload = {
            eventName: 'virtualEventGA4_E',
            payload: {
              'Producto': 'Vida Devolución Protecta',
              'Paso': 'Paso 3',
              'Sección': 'Modal DPS Exitoso',
              'TipoAcción': 'Visualizar modal',
              'CTA': 'Siguiente',
              'TipoCliente': sessionStorage.getItem('client-type'),
              'ID_Proceso': sessionStorage.getItem('idProcess'),
              'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
            }
          };
          this.trackingService.gtmTracking(gtmTrackingModalPayload);
          this.modalDps.show();
        } else if (this.isContractor) {
          const valContractor = JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;
          const payloadRiskClient: any = {
            idProcess: Number(sessionStorage.getItem('idProcess')),
            idTipoDocumento: 2,
            numeroDocumento: valContractor.documentNumber,
            // tslint:disable-next-line:max-line-length
            nombres: `${valContractor.names} ${valContractor.apellidoPaterno || ''} ${valContractor.apellidoMaterno || ''}`.trim(),
            primerApellido: valContractor.apellidoPaterno,
          };
          // this._utilsService.clienteRiesgo(payloadRiskClient).subscribe();
          this._spinner.show();
          this._utilsService.clienteRiesgoExperian(payloadRiskClient).subscribe(
            (response: any) => {
              this._spinner.hide();
              if (response.experian.experianRisk && !response.experian.approve) {
                this.sendNotification('PEPVidaIndividual');
                return;
              } else {
                const gtmTrackingSuccessPayload = {
                  eventName: 'virtualEventGA4_D',
                  payload: {
                    'Producto': 'Vida Devolución Protecta',
                    'Paso': 'Paso 3',
                    'Sección': 'Protección y Devolución',
                    'TipoAcción': 'Avance exitoso',
                    'Medidas': `Talla ${dps.talla} / Peso ${dps.peso} Kg`,
                    'Fuma': dps.fuma == 1 ? 'Activado' : 'Desactivado',
                    'Presión': dps.presion == 1 ? 'Activado' : 'Desactivado',
                    'PresiónResultado': dps.presion_resp ?? '',
                    'Enfermedades1': dps.cancer == 1 ? 'Activado' : 'Desactivado',
                    'Enfermedades2': dps.infarto == 1 ? 'Activado' : 'Desactivado',
                    'Enfermedades3': dps.gastro == 1 ? 'Activado' : 'Desactivado',
                    'Actividades1': dps.viaja == 1 ? 'Activado' : 'Desactivado',
                    'Actividades2': dps.deporte == 1 ? 'Activado' : 'Desactivado',
                    'Covid1': 'Desactivado',
                    'Covid2': 'Desactivado',
                    'Covid3': 'Desactivado',
                    'CTA': 'Siguiente',
                    'TipoCliente': sessionStorage.getItem('client-type'),
                    'ID_Proceso': sessionStorage.getItem('idProcess'),
                    'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
                  }
                };
                this.trackingService.gtmTracking(gtmTrackingSuccessPayload);
                this.successStep();
              }
            }
          );
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  successStep(): void {
    const gtmTrackingSuccessPayload = {
      eventName: 'virtualEventGA4_E',
      payload: {
        'Producto': 'Vida Devolución Protecta',
        'Paso': 'Paso 3',
        'Sección': 'Modal DPS Exitoso',
        'TipoAcción': 'Seleccionar botón',
        'CTA': 'Estoy de acuerdo',
        'TipoCliente': sessionStorage.getItem('client-type'),
        'ID_Proceso': sessionStorage.getItem('idProcess'),
        'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
      }
    };
    this.trackingService.gtmTracking(gtmTrackingSuccessPayload);

    sessionStorage.setItem('step', '4');
    this._MainService.step = 4;
    this._Router.navigate(['/vidadevolucion/step4'], {
      queryParamsHandling: 'merge',
    });
  }

  backToInit(tracking: boolean = false) {
    if (tracking) {
      const gtmTrackingSuccessPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 3',
          'Sección': 'Modal DPS Contacto Asesor',
          'TipoAcción': 'Seleccionar botón',
          'CTA': 'Volver al inicio',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
        }
      };
      this.trackingService.gtmTracking(gtmTrackingSuccessPayload);
    }
    sessionStorage.clear();
    this._Router.navigate(['/vidadevolucion'], {
      queryParamsHandling: 'merge',
    });
  }

  get clientePep(): any {
    return JSON.parse(sessionStorage.getItem('clientePep'));
  }

  private sendNotification(type: string): void {
    if (type == 'RiesgoCrediticioVidaIndividual' || type == 'ErrorRiesgoCrediticioVdp'
      || type == 'PEPVidaIndividual') {
      this.isValidPerson = false;
    } else {
      const gtmTrackingSuccessPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 3',
          'Sección': 'Modal DPS Contacto Asesor',
          'TipoAcción': 'Visualizar modal',
          'CTA': 'Siguiente',
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': sessionStorage.getItem('resumen-atp') ? 'Broker' : 'Venta Directa'
        }
      };
      this.trackingService.gtmTracking(gtmTrackingSuccessPayload);
      this.modalNoValid.show();
    }

    const valContractor = JSON.parse(sessionStorage.getItem('dataContratantenotSame')) || null;
    const data: NotificationRequest = new NotificationRequest({
      idProcess: sessionStorage.getItem('idProcess') || '0',
      cantidadAnios: this.step2.cantidadAnio,
      capital: this.formatMoney(this.step2.capital),
      email: !this.isContractor ? this.step1.email : this.dataContratanteNotSame.email,
      telefono: !this.isContractor ? Number(this.step1.telefono) : this.dataContratanteNotSame.phone,
      fechaNacimiento: !this.isContractor ? this.step1.fechaNac : this.dataContratanteNotSame.birthDate,
      fechaSolicitud: moment(new Date()).format('DD/MM/YYYY'),
      monedaDescripcion: Number(this.step2.moneda) === 1 ? 'SOLES' : 'DOLARES',
      monedaSimbolo: Number(this.step2.moneda) === 1 ? 'S/' : '$',
      nroDocumento: !this.isContractor ? this.step1.nDoc : this.dataContratanteNotSame.documentNumber,
      primaAnual: this.formatMoney(this.step2.primaAnual),
      porcentajeDevolucion: this.step2.porcentajeRetorno,
      primaFallecimiento: this.formatMoney(this.step2.primaFallecimiento),
      primaInicial: this.formatMoney(this.step2.primaInicial),
      primaMensual: this.formatMoney(this.step2.primaMensual),
      primaRetorno: this.formatMoney(this.step2.primaRetorno),
      tipoNotificacion: type,
      // tslint:disable-next-line:max-line-length
      asegurado: !this.isContractor ? this.nameUser : `${valContractor.names} ${valContractor.apellidoPaterno || ''} ${valContractor.apellidoMaterno || ''}`.trim(),
      TotalPolizas: this.cumulus.nCountPolicy,
      SumaAsegurada:
        this.cumulus.nCumulusMax - this.cumulus.nCumulusAvailble,
      CumuloMaximo: this.cumulus.nCumulusMax,
      ...this.idecon,
      ...this.clientePep,
    });

    this._MainService.sendNotification(data).subscribe(
      (res: any) => {
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  toLowerCase(data: string): string {
    return data?.toLowerCase();
  }
}
