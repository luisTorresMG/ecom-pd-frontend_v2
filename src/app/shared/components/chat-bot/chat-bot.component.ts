import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppConfig } from '../../../app.config';
import { ChatBotService } from '../../services/chat-bot/chat-bot.service';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@root/layout/soat/shared/services/session.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  animations: [
    trigger('fadein', [
      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          }),
        ),
      ]),
    ]),
  ],
})

export class ChatBotComponent implements OnInit {
  showForm = false;
  model = { email: null };

  frmChat: FormGroup;

  modalSucess: boolean;
  descriptionModal: string;

  limitNumberPhone: { min: number; max: number };

  showChat: boolean;
  showButtonChat: boolean = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly _ChatBotService: ChatBotService,
    private readonly _sessionService: SessionService,
    private readonly _route: ActivatedRoute,
    private readonly renderer: Renderer2,
    private readonly spinner: NgxSpinnerService,
  ) {
    this.limitNumberPhone = {
      min: 9,
      max: 9,
    };
    this.modalSucess = false;
    this.descriptionModal = 'Se envió correctamente el correo electrónico';
    this.showChat = true;
  }

  ngOnInit() {
    this.frmChat = this.fb.group({
      names: [null],
      email: [
        null,
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
      horario: ['9 a.m. - 11 a.m.', Validators.required],
      telefono: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.required,
        ]),
      ],
      comentario: [null],
    });
    this.cForm.telefono.valueChanges.subscribe((val) => {
      if (this.cForm.telefono.hasError('pattern')) {
        if (val) {
          this.cForm.telefono.setValue(
            val?.toString().substring(0, val.toString().length - 1),
          );
        }
      }
    });
    this.cForm.email.setValidators([
      Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
      Validators.required,
    ]);
    this.cForm.email.updateValueAndValidity();
    if (this.isVidaDevolucion) {
      this.frmChat.clearValidators();

      this.cForm.names.setValidators(Validators.required);
      this.cForm.names.updateValueAndValidity();

      this.cForm.horario.setValidators(Validators.required);
      this.cForm.horario.updateValueAndValidity();

      this.cForm.telefono.setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.maxLength(9),
          Validators.required,
        ]),
      );
      this.cForm.telefono.updateValueAndValidity();

      this.cForm.comentario.setValidators(Validators.required);
      this.cForm.comentario.updateValueAndValidity();
    } else {
      this.cForm['telefono'].clearValidators();
      this.cForm['telefono'].updateValueAndValidity();

      this.cForm['comentario'].clearValidators();
      this.cForm['comentario'].updateValueAndValidity();

      this.cForm['horario'].clearValidators();
      this.cForm['horario'].updateValueAndValidity();

      this.cForm['names'].clearValidators();
      this.cForm['names'].updateValueAndValidity();

      this.cForm['email'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ]),
      );
      this.cForm['email'].updateValueAndValidity();
    }
    this._sessionService.renewSellingPoint().subscribe((res: any) => {
      this.showChatBot();
    });
  }
  closeModalSucess(): void {
    this.modalSucess = false;
    this.descriptionModal = '';
  }
  get cForm() {
    return this.frmChat.controls;
  }

  get isVidaDevolucion(): boolean {
    return window.location.pathname.indexOf('vidadevolucion') !== -1;
  }

  get isAccidentesPersonales(): boolean {
    return window.location.pathname.indexOf('accidentespersonales') !== -1;
  }

  validPhone(): void {
    const control = this.cForm['telefono'];
    if (control.touched) {
      const firstNumber = Number(control.value?.substring(0, 1));
      if (firstNumber !== 9) {
        control.setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
            Validators.required,
          ]),
        );
        this.limitNumberPhone = {
          min: 7,
          max: 7,
        };
      } else {
        control.setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
            Validators.required,
          ]),
        );
        this.limitNumberPhone = {
          min: 9,
          max: 9,
        };
      }
      control.updateValueAndValidity();
    }
  }
  showError(controlName: string): boolean {
    return (
      this.cForm[controlName].invalid &&
      (this.cForm[controlName].dirty || this.cForm[controlName].touched)
    );
  }

  showFormClick() {
    this.showForm = !this.showForm;
    this.modalSucess = false;
    if (this.isVidaDevolucion) {
      let data: any = sessionStorage.getItem('step1');
      let names: any = sessionStorage.getItem('info-document');
      if (data && names) {
        console.log('vd1');
        data = JSON.parse(data);
        names = JSON.parse(names);
        this.cForm['names'].setValue(
          `${names.p_SCLIENT_NAME} ${names.p_SCLIENT_APPPAT} ${names.p_SCLIENT_APPMAT}`,
        );
        this.cForm['telefono'].setValue(data.telefono);
        this.cForm['email'].setValue(data.email);
      } else {
        this.cForm['names'].setValue(null);
        this.cForm['telefono'].setValue(null);
        this.cForm['email'].setValue(null);
      }
    }
  }

  onSubmit() {
    this.frmChat.markAllAsTouched();
    if (this.frmChat.valid) {
      if (!this.isVidaDevolucion) {
        this.showChat = false;
        this.showButtonChat = false;
        this.spinner.show();
        const scriptId = 'genesys-bootstrap';

        if (document.getElementById(scriptId)) {
          this.openChatGenesys();
          return;
        }

        (window as any)._genesysJs = 'Genesys';
        (window as any).Genesys =
          (window as any).Genesys ||
          function () {
            ((window as any).Genesys.q = (window as any).Genesys.q || []).push(
              arguments,
            );
          };
        (window as any).Genesys.t = Date.now();
        (window as any).Genesys.c = {
          environment: 'prod-usw2',
          deploymentId: 'd2ee76e5-7f54-46fa-9c93-f58d3a09d684',
        };

        (window as any).Genesys('subscribe', 'Messenger.ready', () => {
          (window as any).__GENESYS_READY__ = true;
          this.openChatGenesys();
        });

        const script = this.renderer.createElement('script');
        script.setAttribute('id', scriptId);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute(
          'src',
          'https://apps.usw2.pure.cloud/genesys-bootstrap/genesys.min.js',
        );
        script.setAttribute('charset', 'utf-8');
        script.async = true;

        script.onload = () => {
          this.openChatGenesys();
        };

        this.renderer.appendChild(document.head, script);
      } else {
        const data = {
          nombres: this.cForm['names'].value,
          horario: this.cForm['horario'].value,
          email: this.cForm['email'].value,
          telefono: this.cForm['telefono'].value,
          comentario: this.cForm['comentario'].value,
        };
        this._ChatBotService.notificationContact(data).subscribe(
          (res: any) => {
            this.frmChat.reset();
            this.cForm.horario.setValue('9 a.m. - 11 a.m.');
            this.modalSucess = true;
            this.descriptionModal =
              'Gracias! Nos contactaremos contigo en el horario elegido.';
          },
          (err: any) => {
            console.log(err);
            this.showForm = false;
            this.cForm.horario.setValue('9 a.m. - 11 a.m.');
            this.frmChat.reset();
          },
        );
      }
    }
  }

  private openChatGenesys(): void {
    const Genesys = (window as any).Genesys;

    Genesys('command', 'Database.set', {
      messaging: {
        customAttributes: {
          ATTR_Email: this.cForm['email'].value,
        },
      },
    });

    Genesys('command', 'Messenger.show');
    Genesys('command', 'Messenger.open');

    setTimeout(() => {
      this.spinner.hide();
    }, 3000);

    Genesys('subscribe', 'Messenger.opened', () => {
      this.changeStateButton();
    });
  }

  changeStateButton(): void {
    this.showButtonChat = false;
    this.spinner.hide();
  }

  private showChatBot(): void {
    if (location.pathname.indexOf('/soat/') !== -1) {
      const linksAgenciados = ['2015000002', '2019000007'];
      const sellingChannel = JSON.parse(
        sessionStorage.getItem('selling') || '{}',
      );
      if (
        linksAgenciados.includes(sellingChannel?.sellingChannel?.toString()) &&
        this._route.snapshot.queryParamMap.get('code')
      ) {
        this.showChat = true;
      } else {
        this.showChat = false;
      }
      if (!this._route.snapshot.queryParamMap.get('code')) {
        this.showChat = true;
      }
    } else {
      this.showChat = true;
    }
  }
}
