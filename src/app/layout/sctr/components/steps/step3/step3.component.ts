import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Vidaley, getQuoteParams } from '../../../shared/models/vidaley';
import { Router } from '@angular/router';
import { VidaleyService } from '../../../shared/services/vidaley.service';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css'],
})
export class Step3Component implements OnInit {
  vidaleyUser: Vidaley;

  loading = false;

  constructor(
    private readonly route: Router,
    private readonly vidaleyService: VidaleyService,
    private readonly sessionService: SessionService,
    private readonly spinner: NgxSpinnerService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};
  }

  onSubmit(payload: Vidaley) {
    this.googleService.setIntentButton();
    payload.startValidity = moment(payload.startValidity).format();
    payload.endValidity = moment(
      payload.endValidity.split('/').reverse().join('-')
    ).format();
    this.vidaleyUser = { ...this.vidaleyUser, ...payload };

    const params = getQuoteParams(this.vidaleyUser);

    this.spinner.show();
    this.vidaleyService.setQuote(params).subscribe(
      (response) => {
        this.vidaleyUser.insurance = response.asegurable;
        this.vidaleyUser.idProcess = response.idProcess;
        this.vidaleyUser.healthAmount = response.montoSalud;
        this.vidaleyUser.allowanceAmount = response.montoPension;
        this.vidaleyUser.healthRate = response.tasaSalud;
        this.vidaleyUser.allowanceRate = response.tasaPension;
        this.vidaleyUser.isHealthMinimumPremium = response.aplicaPrimaMinimaSalud;
        this.vidaleyUser.healthMinimumPremium = response.primaMinimaSalud;
        this.vidaleyUser.isRiskMinimumPremium = response.aplicaPrimaMinimaPension;
        this.vidaleyUser.riskMinimumPremium = response.primaMinimaPension;
        this.vidaleyUser.sede = response.sede;

        if (this.storage.ruc === '20123456789') {
          this.vidaleyUser.amount = 1;
        }

        this.vidaleyUser.showEmployeeForm = Number(this.vidaleyUser.totalWorkers) === 1;

        this.spinner.hide();
        this.sessionService.saveToLocalStorage('sctr', this.vidaleyUser);
        this.route.navigate(['sctr/step-4']);
      },
      () => {
        this.spinner.hide();
        this.googleService.setGenericErrorEvent(
          'Vida Ley - Paso 2',
          'Grabar pre-cotización'
        );
      }
    );
  }
  get storage(): any {
    return JSON.parse(sessionStorage.getItem('sctr'));
  }
}
