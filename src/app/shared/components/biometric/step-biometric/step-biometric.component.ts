import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BiometricRequest,
  BiometricResultDto,
  DataBiometricDto,
} from '../../../models/biometric/biometric.model';
import { AppConfig } from '../../../../app.config';
import { BiometricService } from '../../../services/biometric/biometric.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
@Component({
  selector: 'app-step-biometric',
  templateUrl: './step-biometric.component.html',
  styleUrls: ['./step-biometric.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(250, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class StepBiometricComponent implements OnInit, AfterViewInit {
  stepBiom: number;
  formBiometric: FormGroup;
  dataToBiometric: any;
  private fileBiometric: File;

  showBiometric: boolean;

  @Input() insurance: DataBiometricDto;
  @Output() modalBiometric: EventEmitter<boolean>;
  @Output() uploadFileBiometricResult: EventEmitter<BiometricResultDto>;
  @Output() biometricResult: EventEmitter<BiometricResultDto>;
  @ViewChild('biometric', { static: true, read: ElementRef })
  biometricRef: ElementRef;

  constructor(
    private readonly _spinner: NgxSpinnerService,
    private readonly _appConfig: AppConfig,
    private readonly _biometricService: BiometricService,
    private readonly _builder: FormBuilder,
    private readonly _ga: GoogleAnalyticsService
  ) {
    this.showBiometric = true;
    this.stepBiom = 1;
    this.formBiometric = this._builder.group({
      img: [null],
      file: [null, Validators.required],
    });
    this.modalBiometric = new EventEmitter<boolean>();
    this.uploadFileBiometricResult = new EventEmitter<BiometricResultDto>();
    this.biometricResult = new EventEmitter<BiometricResultDto>();
  }

  ngOnInit(): void {
    if (!!sessionStorage.getItem('document-avatar')) {
      const data: BiometricRequest = new BiometricRequest({
        data: {
          IdProcess: this.insurance?.idProcess,
          Documento: this.insurance?.nDoc,
          Apellido: `${this.insurance?.apePat} ${this.insurance?.apeMat}`,
          Nombre: `${this.insurance?.names}`,
          Avatar: this.insurance.photo || sessionStorage.getItem('document-avatar'),
        },
        file: null,
      });
      this.showBiometric = false;
      this.validateDocumentFile(data);
    }
  }
  ngAfterViewInit(): void {
    if (this.resultBiometric) {
      this.biometricResult.emit(<BiometricResultDto>this.resultBiometric);
    }
  }

  closeModalBiometric(reload = false): void {
    this.modalBiometric.emit(false);
    if (reload) {
      location.reload();
    }
  }
  get isMobile(): boolean {
    return navigator.userAgent.match(/Mobile/) !== null;
  }
  get descriptionBiometric(): string {
    if (this.isMobile) {
      return `Estamos iniciando el proceso de validación biométrica, por favor adjunte o tome una foto de su documento de
      identidad (.JPG o .PNG) en sentido horizontal.`;
    }
    return `Estamos iniciando el proceso de validación biométrica, por favor adjunte una imagen de su documento de
      identidad (.JPG o .PNG) en sentido horizontal.`;
  }
  get descriptionSmallBiometric(): string {
    if (this.isMobile) {
      return `*Debe adjuntar o fotografiar la parte frontal de su documento`;
    }
    return `*Debe adjuntar la parte frontal de su documento`;
  }
  get resultBiometric(): any {
    return JSON.parse(sessionStorage.getItem('result-biometric')) || null;
  }
  saveFileBiometric(e): void {
    if (e.target.files.length > 0) {
      this.fileBiometric = e.target.files[0];
      const data: BiometricRequest = new BiometricRequest({
        data: {
          IdProcess: this.insurance?.idProcess,
          Documento: this.insurance?.nDoc,
          Apellido: `${this.insurance?.apePat} ${this.insurance?.apeMat}`,
          Nombre: `${this.insurance?.names}`,
        },
        file: this.fileBiometric,
      });
      this.validateDocumentFile(data);
    }
  }
  private validateDocumentFile(data): void {
    this._spinner.show();
    const doc = document.getElementById('script-biometric');
    console.log(doc);
    if (doc) {
      console.log('remove script');
      doc.parentNode.removeChild(doc);
    }
    let resultBiometric: any;
    this._biometricService.registBiometric(data).subscribe(
      (res: any) => {
        this.showBiometric = true;
        console.log(res);
        if (res.body.result) {
          if (location.pathname.indexOf('accidentespersonales') !== -1) {
            if (this.insurance?.idRamo === 61) {
              if (!!sessionStorage.getItem('document-avatar')) {
                this._ga.emitGenericEventAP(`Obtuvo foto del 'Cliente 360'`);
              } else {
                this._ga.emitGenericEventAP('Documento de identidad adjunto');
              }
            }
          }
          console.log('true');
          const datosBiometric = {
            documento: this.insurance?.nDoc,
            externalId: res.body.id,
            src: null,
          };
          // tslint:disable-next-line:max-line-length
          const url = `${AppConfig.BIGPRIME_API}/api/bigface?dni=${datosBiometric.documento}&externalId=${datosBiometric.externalId}&uuid=${AppConfig.BIG_PRIME}`;

          console.log(url);
          datosBiometric.src = url;
          // window.open(url, 'Biometria', 'width=800,height=700');
          this.stepBiom = 2;
          this._appConfig
            .loadGenericScriptBiometric(this.biometricRef, datosBiometric)
            .then((loaded) => {
              if (loaded) {
                this._spinner.hide();
                this.formBiometric.reset();
              }
            });
          const consultBiometric = {
            idProcess: this.insurance?.idProcess,
            idBigPrime: res.body.id,
            idRamo: this.insurance?.idRamo, // 61
            documento: this.insurance?.nDoc,
          };
          this.dataToBiometric = consultBiometric;
          resultBiometric = {
            success: true,
            hasError: false,
            description: null,
          };
          this.uploadFileBiometricResult.emit(resultBiometric);
        } else {
          console.log('false');
          this.stepBiom = 1;
          resultBiometric = {
            success: true,
            hasError: true,
            description:
              'Ocurrió un error al procesar tu documento, por favor revísalo e inténtalo nuevamente',
          };
          this.uploadFileBiometricResult.emit(resultBiometric);
          this.fileBiometric = null;
          this.formBiometric.reset();
          sessionStorage.setItem(
            'result-biometric',
            JSON.stringify(resultBiometric)
          );
          this.closeModalBiometric();
          location.reload();
          this._spinner.hide();
        }
      },
      (err: any) => {
        console.error(err);
        sessionStorage.setItem('error-biometrico-file', JSON.stringify(err));
        resultBiometric = {
          success: true,
          hasError: true,
          description:
            'Ocurrió un error al procesar tu documento, por favor revísalo e inténtalo nuevamente',
        };
        this.fileBiometric = null;
        this.formBiometric.reset();
        this.uploadFileBiometricResult.emit(resultBiometric);
        sessionStorage.setItem(
          'result-biometric',
          JSON.stringify(resultBiometric)
        );
        this.closeModalBiometric();
        location.reload();
        if (this.insurance?.idRamo === 61) {
          this._ga.emitGenericEventAP(
            'Adjuntar documento de identidad',
            0,
            'Error al adjuntar documento de identidad',
            2
          );
        }
        this._spinner.hide();
      }
    );
  }
  changeStateBiometric(e): void {
    if (e) {
      this.consultarBiometrico(this.dataToBiometric);
    }
  }
  consultarBiometrico(data): void {
    this._biometricService.consultBiometric(data).subscribe(
      (resp: any) => {
        sessionStorage.setItem('_b10m3tr1c0', JSON.stringify(resp));
        if (!resp.body?.success.coincidencia) {
          this.stepBiom = 1;
          const rs = {
            success: true,
            hasError: true,
            description: 'Ocurrió un error al hacer la validación biométrica.',
            payload: data,
          };
          sessionStorage.setItem('result-biometric', JSON.stringify(rs));
          this.biometricResult.emit(rs);
          this.closeModalBiometric();
          return;
        }
        if (resp.body?.success?.status && resp.body?.success?.result) {
          /* const expireDate = moment((resp.body?.success.expirationDate)?.toString().replaceAll(' ', '/'), 'dd/MM/yyyy').toDate();
          // new Date() > expireDate
          if (new Date() > expireDate) {
            this.stepBiom = 1;
            const rs = {
              success: true,
              hasError: true,
              description: 'La fecha de expiración del documento de identidad está vencida.'
            };
            sessionStorage.setItem('result-biometric', JSON.stringify(rs));
            this.biometricResult.emit(rs);
            this.closeModalBiometric();
            return;
          } */
          // Number(this.step1.nDoc) === Number(resp.body?.success.documentId)
          if (
            this.insurance?.nDoc?.toString() ===
            resp.body?.success.documentId?.toString()
          ) {
            this.stepBiom = 3;
            const rs = {
              success: true,
              hasError: false,
              description:
                '¡La validación de reconocimiento facial se realizó con éxito!',
              payload: data,
            };
            sessionStorage.setItem('result-biometric', JSON.stringify(rs));
            this.biometricResult.emit(rs);
            this.closeModalBiometric();
          } else {
            this.stepBiom = 1;
            const rs = {
              success: true,
              hasError: true,
              description:
                'El número de documento de la imagen no coincide con el número de documento ingresado.',
              payload: data,
            };
            sessionStorage.setItem('result-biometric', JSON.stringify(rs));
            this.biometricResult.emit(rs);
            this.closeModalBiometric();
          }
        } else {
          this.stepBiom = 1;
          const rs = {
            success: true,
            hasError: true,
            description: 'Ocurrió un error al hacer la validación biométrica.',
            payload: data,
          };
          sessionStorage.setItem('result-biometric', JSON.stringify(rs));
          this.biometricResult.emit(rs);
          this.closeModalBiometric();
        }
      },
      (err: any) => {
        this.stepBiom = 1;
        console.log(err);
        sessionStorage.removeItem('res-bio');
        sessionStorage.setItem('res-bio', JSON.stringify(err));
        const rs = {
          success: true,
          hasError: true,
          description: 'Ocurrió un error al hacer la validación biométrica.',
        };
        sessionStorage.setItem('result-biometric', JSON.stringify(rs));
        this.biometricResult.emit(rs);
        this.closeModalBiometric();
      }
    );
  }

  uploadFile(): void {
    if (location.pathname.indexOf('accidentespersonales') !== -1) {
      this._ga.emitGenericEventAP('Clic en "Adjuntar documento de identidad"');
    }
  }
}
