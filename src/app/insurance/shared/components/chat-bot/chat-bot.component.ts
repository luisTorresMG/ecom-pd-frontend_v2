import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RegularExpressions } from '@shared/regexp/regexp';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        animate(
          150,
          style({
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class ChatBotComponent implements OnInit {
  formControlEmail = new FormControl(
    '',
    Validators.compose([Validators.pattern(RegularExpressions.email), Validators.required])
  );
  form: FormGroup = this.builder.group({
    email: this.formControlEmail,
  });

  showForm: boolean = false;
  showButtonChat: boolean = true;

  constructor(
    private readonly renderer: Renderer2,
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    const scriptId = 'genesys-bootstrap';

    if (document.getElementById(scriptId)) {
      this.showButtonChat = false;
    }
  }

  openChat(): void {
    if (this.form.invalid) return;

    this.showForm = false;
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
          arguments
        );
      };
    (window as any).Genesys.t = Date.now();
    (window as any).Genesys.c = {
      environment: 'prod-usw2',
      deploymentId: 'd2ee76e5-7f54-46fa-9c93-f58d3a09d684',
    };

    (window as any).Genesys('subscribe', 'Messenger.ready', () => {
      this.openChatGenesys();
    });

    const script = this.renderer.createElement('script');
    script.setAttribute('id', scriptId);
    script.setAttribute('type', 'text/javascript');
    script.setAttribute(
      'src',
      'https://apps.usw2.pure.cloud/genesys-bootstrap/genesys.min.js'
    );
    script.setAttribute('charset', 'utf-8');
    script.async = true;

    script.onload = () => {
      this.openChatGenesys();
    };

    this.renderer.appendChild(document.head, script);
  }

  private openChatGenesys(): void {
    const Genesys = (window as any).Genesys;

    Genesys('command', 'Database.set', {
      messaging: {
        customAttributes: {
          ATTR_Email: this.formControlEmail.value,
        },
      },
    });

    Genesys('command', 'Messenger.show');
    Genesys('command', 'Messenger.open');

    Genesys('subscribe', 'Messenger.opened', () => {
      this.changeStateButton();
    });
  }

  changeStateButton(): void {
    this.showButtonChat = false;
    this.spinner.hide();
  }
}
