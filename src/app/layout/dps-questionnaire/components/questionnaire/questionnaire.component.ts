import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DpsService } from '../../shared/services/dps.service';
import { QuestionsService } from '../../shared/services/questions.service';
import { conditionalRequired } from '../../shared/validators/requiredIfValidators';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          300,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class QuestionnaireComponent implements OnInit {
  step = 1;
  proccessId: number;
  token: string;

  tokenIsValid = true;

  checkDeclareInfoDPSValidControl = this.fb.control(false, Validators.requiredTrue);
  form = this.fb.group({
    group1: this.fb.group({
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
    }),
    group2: this.fb.group({
      fuma: [null, Validators.required],
      fuma_resp: [null],
    }),
    group3: this.fb.group({
      presion: [null, Validators.required],
      presion_resp: [null],
    }),
    group4: this.fb.group({
      cancer: [null, Validators.required],
      cancer_rsp: [null],
      infarto: [null, Validators.required],
      infarto_rsp: [null],
      gastro: [null, Validators.required],
      gastro_rsp: [null],
    }),
    group5: this.fb.group({
      hospitalizacion: [null, Validators.required],
      hospitalizacion_resp: [null],
    }),
    group6: this.fb.group({
      viaja: [null, Validators.required],
      viaja_resp: [null],
    }),
    group7: this.fb.group({
      deporte: [null, Validators.required],
      deporte_resp: [null],
    }),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dpsService: DpsService,
    private readonly route: ActivatedRoute,
    private readonly qService: QuestionsService,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.token = params.token;
    });
    this.proccessId = +sessionStorage.getItem('dps-proccess-id');
    this.step = sessionStorage.getItem('dps-step')
      ? parseInt(sessionStorage.getItem('dps-step'), 10)
      : 1;

    const rawForm = sessionStorage.getItem('dps-form');

    if (rawForm) {
      this.form.patchValue(JSON.parse(rawForm));
    }

    this.form.valueChanges.subscribe(() => {
      sessionStorage.setItem(
        'dps-form',
        JSON.stringify(this.form.getRawValue())
      );
    });

    this.f.group3.get('presion').valueChanges.subscribe((value) => {
      if (value === '1') {
        this.f.group3.get('presion_resp').setValidators([Validators.required]);
      }
    });

    this.form.setValidators([
      conditionalRequired(
        () => this.f.group2.get('fuma').value == 1,
        this.f.group2.get('fuma_resp')
      ),
      conditionalRequired(
        () => this.f.group3.get('presion').value == 1,
        this.f.group3.get('presion_resp')
      ),
      conditionalRequired(
        () => this.f.group4.get('cancer').value == 1,
        this.f.group4.get('cancer_rsp')
      ),
      conditionalRequired(
        () => this.f.group4.get('infarto').value == 1,
        this.f.group4.get('infarto_rsp')
      ),
      conditionalRequired(
        () => this.f.group4.get('gastro').value == 1,
        this.f.group4.get('gastro_rsp')
      ),
      conditionalRequired(
        () => this.f.group5.get('hospitalizacion').value == 1,
        this.f.group5.get('hospitalizacion_resp')
      ),
      conditionalRequired(
        () => this.f.group6.get('viaja').value == 1,
        this.f.group6.get('viaja_resp')
      ),
      conditionalRequired(
        () => this.f.group7.get('deporte').value == 1,
        this.f.group7.get('deporte_resp')
      ),
    ]);
  }

  get f() {
    return this.form.controls;
  }

  showCurrentRow(rowNumber: number): boolean {
    return this.step !== rowNumber;
  }

  validateForm(): boolean {
    return this.form.get(`group${this.step}`).invalid;
  }

  onBack() {
    if (this.step == 1) {
      this.router.navigate([`/dps/${this.token}/inicio`]);
      return;
    }
    if (this.step > 1) {
      this.step--;
      sessionStorage.setItem('dps-step', this.step.toString());
      return;
    }
  }

  onSubmit() {
    if (this.step < 7) {
      this.step++;
      sessionStorage.setItem('dps-step', this.step.toString());
      return;
    }

    const rawForm = this.form.getRawValue();
    const dps = this.qService.getPayload(rawForm);
    const terms = JSON.parse(sessionStorage.getItem('terms-dps'));
    const payload = {
      id: this.proccessId,
      jsondps: JSON.stringify({
        ...dps,
        privacidad: terms.privacy ? 1 : 0,
        terminos: terms.terms ? 1 : 0,
      }),
      aprobacion: this.checkDeclareInfoDPSValidControl.value
    };

    this.spinner.show();
    this.dpsService.register(payload).subscribe(
      (response) => {
        this.spinner.hide();

        if (response.success) {
          this.router.navigate([`dps/${this.token}/auth`]);
        }
      });
  }
}
