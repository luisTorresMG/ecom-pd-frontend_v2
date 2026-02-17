import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../../../app.config';
import { BiometricRequest } from '../../../../shared/models/biometric/biometric.model';
import { DpsService } from '../../shared/services/dps.service';

const TITLE = 'Ha sobrepasado el número de intentos.';
const MESSAGE = 'Un asesor se comunicará en breve con usted.';
@Component({
  selector: 'app-biometric-container',
  templateUrl: './biometric.component.html',
  styleUrls: ['./biometric.component.scss'],
})
export class BiometricComponent implements OnInit {
  @ViewChild('biometric', { static: true, read: ElementRef })
  biometricRef: ElementRef;

  form = this.fb.group({
    file: [''],
  });

  error = false;
  processId: string;
  bigPrime: string;
  document: string;

  rs: any;

  counter = 0;
  back = false;

  token: string;

  messageUpload: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly dpsService: DpsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AppConfig
  ) {}

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.token = params.token;
    });
  }

  saveFileBiometric(event: File[]) {
    this.error = false;
    this.messageUpload = null;

    this.route.parent.params.subscribe((params) => {
      this.token = params.token;
    });
    const file = event[0];

    const ext = ['jpg', 'jpeg', 'png'];

    if (!ext.includes(file.name.substring(file.name.lastIndexOf('.') + 1))) {
      this.error = true;
      this.messageUpload =
        'Para la validación biométrica debe adjuntar una imagen válida';
      return;
    }

    this.processId = sessionStorage.getItem('dps-proccess-id');

    const data: BiometricRequest = new BiometricRequest({
      data: {
        IdProcess: +this.processId,
        Documento: null,
        Apellido: null,
        Nombre: null,
      },
      file: file,
    });

    this.spinner.show();
    const doc = document.getElementById('script-biometric');

    if (doc) {
      doc.remove();
    }

    if (this.counter >= 3) {
      this.onError();
      return;
    }

    this.dpsService.upload(data).subscribe(
      (res: any) => {
        console.log(res);
        if (res?.mensaje?.compareDocument == 'false') {
          this.messageUpload =
            'El número de documento de la imagen no coincide con el número de documento registrado';
        } else {
          this.messageUpload =
            'Ocurrió un error al procesar tu documento, por favor inténtelo nuevamente';
        }
        console.log('res');
        if (!res.result) {
          console.log('error');
          this.error = true;
          this.counter = this.counter + 1;
          this.spinner.hide();
          return;
        }

        this.bigPrime = res.id;
        this.document = res.documento;

        const scriptPayload = {
          documento: res.documento,
          externalId: res.id,
          src: `${AppConfig.BIGPRIME_API}/api/bigface?dni=${res.documento}&externalId=${res.id}&uuid=${AppConfig.BIG_PRIME}`,
        };

        this.appConfig
          .loadGenericScriptBiometric(this.biometricRef, scriptPayload)
          .then((loaded) => {
            if (loaded) {
              this.spinner.hide();
              this.form.reset();
            }
          })
          .catch(() => {
            this.spinner.hide();
          });
      },
      () => {
        this.spinner.hide();
        this.error = true;
      }
    );
  }

  changeStateBiometric(event: boolean) {
    if (!event) {
      return;
    }

    const payload = {
      idProcess: this.processId,
      idBigPrime: this.bigPrime,
      idRamo: 71,
      idProducto: 1,
      documento: this.document,
    };

    this.dpsService.validate(payload).subscribe((res) => {
      if (res?.result && res?.status) {
        if (!res.coincidencia) {
          this.back = true;
          this.onError(
            '¡La validación de reconocimiento facial no se realizó con éxito!',
            null
          );
          sessionStorage.removeItem('dps-form');
          sessionStorage.removeItem('dps-proccess-id');
          sessionStorage.removeItem('dps-step');
          return;
        }

        if (this.document === res.documentId.toString()) {
          this.rs = {
            success: true,
            hasError: false,
            description:
              '¡La validación de reconocimiento facial se realizó con éxito!',
            message:
              'Comunícate con tu ejecutivo comercial de Protecta Security para continuar con la contratación de tu póliza.',
          };

          this.dpsService
            .success({ id: +this.processId, success: true })
            .subscribe(() => {
              sessionStorage.removeItem('dps-form');
              sessionStorage.removeItem('dps-proccess-id');
              sessionStorage.removeItem('dps-step');
            });
        } else {
          this.back = true;

          this.rs = {
            success: true,
            hasError: true,
            description:
              'El número de documento de la imagen no coincide con el número de documento registrado.',
            message: null,
          };
        }
      } else {
        this.back = true;
        this.onError('¡Ocurrió un problema en la validación biométrica!', null);
      }
    });
  }

  tryAgain() {
    this.error = false;
    this.bigPrime = null;
    this.rs = null;
    this.back = false;
  }

  onError(title = TITLE, message = MESSAGE) {
    this.error = true;
    this.spinner.hide();
    this.bigPrime = '-1';

    this.rs = {
      success: true,
      hasError: true,
      description: title,
      message,
    };
    this.dpsService
      .success({ id: +this.processId, success: false })
      .subscribe(() => {});
  }

  backStep(): void {
    this.router.navigate([`/dps/${this.token}/preguntas`]);
  }
}
