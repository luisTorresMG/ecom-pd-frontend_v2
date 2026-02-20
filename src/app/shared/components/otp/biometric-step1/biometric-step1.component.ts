import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';
import { IOtp, IOtpResult } from '@shared/interfaces/otp.interface';
import { BiometricService } from '@shared/services/biometric/biometric.service';

@Component({
  standalone: false,
  // tslint:disable-next-line:component-selector
  selector: 'protecta-biometric-step1',
  templateUrl: './biometric-step1.component.html',
  styleUrls: ['./biometric-step1.component.sass'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(250, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class BiometricStep1Component implements OnInit {
  formBiometric!: FormGroup;

 

  currentStep = 1;

  payloadBiometric: any;
  dataInput: any;
  private fileUploaded: File;

  @Input() set data(payload: IOtp) {
    this.dataInput = payload;

    if (payload.avatar) {
      this.saveFileBiometric();
    }
  }

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() result: EventEmitter<any> = new EventEmitter();

  @ViewChild('biometric', { static: true, read: ElementRef })
  biometricRef: ElementRef;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly appConfig: AppConfig,
    private readonly biometricService: BiometricService,
    private readonly builder: FormBuilder
  ) {
     this.formBiometric = this.builder.group({
      img: [null],
      file: [null, Validators.required],
    });
  }

  ngOnInit(): void {
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

  saveFileBiometric(e?: any): void {
    if (this.dataInput.avatar || e?.target?.files?.length > 0) {
      this.fileUploaded = this.dataInput.avatar ? null : e?.target?.files[0];
      const data: any = {
        data: {
          IdProcess: this.dataInput.processId,
          Documento: this.dataInput.documentNumber,
          Apellido: this.dataInput.surnames,
          Nombre: this.dataInput.names,
          Avatar: this.dataInput.avatar || null,
        },
        file: !this.dataInput.avatar ? this.fileUploaded : null,
      };
      this.validateDocumentFile(data);
    }
  }

  private validateDocumentFile(data): void {
    this.spinner.show();

    const doc = document.getElementById('script-biometric');
    if (doc) {
      doc.parentNode.removeChild(doc);
    }

    let resultBiometric: any;
    this.biometricService.registBiometric(data).subscribe(
      (res: any) => {
        console.log(res);

        resultBiometric = {
          success: res.body.result,
          hasError: !res.body.result,
          description: '',
          type: 'biometrico-registrar',
          response: res,
          payload: data,
        };

        this.currentStep = 1;

        if (!res.body.result) {
          resultBiometric.description =
            'Ocurrió un error al procesar tu documento, por favor revísalo e inténtalo nuevamente';

          this.fileUploaded = null;

          this.formBiometric.reset();

          this.result.emit(resultBiometric);
          this.close.emit(true);
          this.spinner.hide();
          return;
        }

        const biometricPayload = {
          documento: this.dataInput.documentNumber,
          externalId: res.body.id,
          src: null,
        };

        // tslint:disable-next-line:max-line-length
        const url = `${AppConfig.BIGPRIME_API}/api/bigface?dni=${biometricPayload.documento}&externalId=${biometricPayload.externalId}&uuid=${AppConfig.BIG_PRIME}`;
        biometricPayload.src = url;

        this.currentStep = 2;
        this.appConfig
          .loadGenericScriptBiometric(this.biometricRef, biometricPayload)
          .then((loaded) => {
            if (loaded) {
              this.spinner.hide();
              this.formBiometric.reset();
            }
          });

        this.payloadBiometric = {
          idProcess: this.dataInput.processId,
          idBigPrime: res.body.id,
          idRamo: this.dataInput.branchId,
          documento: this.dataInput.documentNumber,
        };
      },
      (err: any) => {
        console.error(err);

        resultBiometric = {
          success: false,
          hasError: true,
          description:
            'Ocurrió un error al procesar tu documento, por favor revísalo e inténtalo nuevamente',
          type: 'biometrico-registrar',
          response: err,
          payload: data,
        };

        this.fileUploaded = null;
        this.formBiometric.reset();

        this.result.emit(resultBiometric);
        this.close.emit(true);

        this.spinner.hide();
      }
    );
  }

  changeStateBiometric(e): void {
    if (e) {
      this.consultarBiometrico(this.payloadBiometric);
    }
  }

  consultarBiometrico(payload): void {
    this.biometricService.consultBiometric(payload).subscribe(
      (response: any) => {
        const result: IOtpResult = {
          success: response.body?.success?.result,
          hasError: !response.body?.success?.result,
          message: '',
          payload: payload,
          response: response.body?.success,
          type: 'consultar-biometrico',
        };

        if (!response.body?.success.coincidencia) {
          this.currentStep = 1;

          result.hasError = true;
          result.message =
            'Ocurrió un error al hacer la validación biométrica.';

          this.result.emit(result);
          this.close.emit(true);
          return;
        }

        this.currentStep = 1;
        if (response.body?.success?.status && response.body?.success?.result) {
          if (
            this.dataInput.documentNumber == response.body?.success.documentId
          ) {
            this.currentStep = 3;

            result.hasError = false;
            result.message =
              '¡La validación de reconocimiento facial se realizó con éxito!';
          } else {
            result.hasError = true;
            result.message =
              'El número de documento de la imagen no coincide con el número de documento ingresado.';
          }
        } else {
          result.hasError = true;
          result.message =
            'Ocurrió un error al hacer la validación biométrica.';
        }

        this.result.emit(result);
        this.close.emit(true);
      },
      (error: any) => {
        console.log(error);

        this.currentStep = 1;

        const resultEvent: IOtpResult = {
          success: true,
          hasError: true,
          message: 'Ocurrió un error al hacer la validación biométrica.',
          payload: payload,
          response: error,
          type: 'consultar-biometrico',
        };

        this.result.emit(resultEvent);
        this.close.emit(true);
      }
    );
  }

  closeModal(): void {
    this.close.emit(this.data?.methods.length == 1);
  }
}
