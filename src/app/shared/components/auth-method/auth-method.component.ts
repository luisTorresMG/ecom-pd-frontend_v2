import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewContainerRef,
  ViewChild,
} from '@angular/core';
import {
  IRegisterOtp,
  IValidateOtpResponse,
} from '../../interfaces/otp-auth.interface';
import { AppConfig } from '@root/app.config';
import { TrackingService } from '@root/layout/vidaindividual-latest/services/tracking/tracking.service';

@Component({
  selector: 'app-auth-method',
  templateUrl: './auth-method.component.html',
  styleUrls: ['./auth-method.component.scss']
})
export class AuthMethodComponent implements OnInit, AfterViewInit {
  @Input() data: IRegisterOtp;
  @Input() biometricData: any;

  @Output() selectedAuthMethod: EventEmitter<number>;
  @Output() showModalAuthMethod: EventEmitter<boolean>;

  @Output() uploadFileBiometricResult: EventEmitter<any>;
  @Output() biometricResult: EventEmitter<any>;

  @Output() otpResult: EventEmitter<IValidateOtpResponse>;
  @Output() result: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('modalAuthMehod', { static: true, read: TemplateRef })
  _modalAuthMehod: TemplateRef<any>;
  @ViewChild('modalBiometricAuth', { static: true, read: TemplateRef })
  _modalBiometricAuth: TemplateRef<any>;
  @ViewChild('modalOtpAuth', { static: true, read: TemplateRef })
  _modalOtpAuth: TemplateRef<any>;

  constructor(
    private readonly _vc: ViewContainerRef,
    private readonly _appConfig: AppConfig,
    private readonly trackingService: TrackingService
  ) {
    this.selectedAuthMethod = new EventEmitter<number>();
    this.showModalAuthMethod = new EventEmitter<boolean>();
    this.uploadFileBiometricResult = new EventEmitter<any>();
    this.biometricResult = new EventEmitter<any>();
    this.otpResult = new EventEmitter<IValidateOtpResponse>();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._vc.createEmbeddedView(this._modalAuthMehod);
      if (
        window.location.pathname.indexOf('/soat') !== -1 ||
        window.location.pathname.indexOf('/vidaley') !== -1
      ) {
        this.selectAuthMethod(3, true);
      }
    });
  }

  get resumenAtp(): any {
    return JSON.parse(sessionStorage.getItem('resumen-atp') ?? '{}');
  }

  closeModal(): void {
    this.showModalAuthMethod.emit(false);
    this.close.emit();
  }

  selectAuthMethod(val: number, showModal = true): void {
    this._vc.clear();
    if (!showModal) {
      return;
    }

    let validationTypeCTA: string = '';

    switch (val) {
      case 0:
        this._vc.createEmbeddedView(this._modalAuthMehod);
        break;
      case 1:
        validationTypeCTA = 'Biométrica';
        this._vc.createEmbeddedView(this._modalBiometricAuth);
        break;
      case 2:
      case 3:
        this.data.type = val == 2 ? 1 : 2;
        validationTypeCTA = val == 2 ? 'Mensaje de texto' : 'Correo electrónico';
        this._vc.createEmbeddedView(this._modalOtpAuth);
        break;
    }
    if (window.location.pathname.indexOf('/vidadevolucion') !== -1) {
      const gtmTrackingPayload = {
        eventName: 'virtualEventGA4_E',
        payload: {
          'Producto': 'Vida Devolución Protecta',
          'Paso': 'Paso 4',
          'Sección': 'Modal Proceso de Validación',
          'TipoAcción': 'Seleccionar botón',
          'CTA': validationTypeCTA,
          'TipoCliente': sessionStorage.getItem('client-type'),
          'ID_Proceso': sessionStorage.getItem('idProcess'),
          'Canal': this.resumenAtp?.ejecutivos?.asesor ? 'Broker' : 'Venta Directa'
        }
      };
      this.trackingService.gtmTracking(gtmTrackingPayload);
    } else if (window.location.pathname.indexOf('/vidaley') !== -1) {
      const gtmPayload = {
        event: 'virtualEvent',
        payload: {
          category: 'Vida Devolución - Paso 4',
          action: 'Proceso de validación',
          label: 'Correo electrónico',
        },
      };
      this._appConfig.gtmTrackEvent(gtmPayload);
    }
    this.selectedAuthMethod.emit(val);
  }

  uploadFileBiometric(e: any) {
    this.uploadFileBiometricResult.emit(e);
    this.result.emit(e);
  }

  biometricResponse(e: any) {
    this.biometricResult.emit(e);
    this.result.emit(e);
  }

  otpResponse(e: IValidateOtpResponse) {
    this.otpResult.emit(e);
    this.result.emit(e);
  }

  get isVdp(): boolean {
    return location.pathname.indexOf('/vidadevolucion') != -1;
  }

  get isSOAT(): boolean {
    return location.pathname.indexOf('/soat') != -1;
  }

  get isVL(): boolean {
    return location.pathname.indexOf('/vidaley') != -1;
  }

  get isAP(): boolean {
    return location.pathname.indexOf('/accidentespersonales') != -1;
  }
}
