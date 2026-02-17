import { Component, OnInit } from '@angular/core';
import { Vidaley, getUserParams } from '../../../shared/models/vidaley';
import { Router } from '@angular/router';
import { VidaleyService } from '../../../shared/services/vidaley.service';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css'],
})
export class Step2Component implements OnInit {
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
    this.loading = true;
    this.spinner.show();
    this.vidaleyUser = { ...this.vidaleyUser, ...payload };

    const selling = this.sessionService.getSellingPoint();
    this.vidaleyUser.canalventa = selling.sellingChannel;
    this.vidaleyUser.puntoventa = selling.sellingPoint;

    const params = getUserParams(this.vidaleyUser);

    this.vidaleyService.setUser(params).subscribe(
      (response) => {
        this.vidaleyUser.idProcess = response;
        this.sessionService.saveToLocalStorage('sctr', this.vidaleyUser);
        this.spinner.hide();
        this.route.navigate(['sctr/step-3']);
      },
      () => {
        this.spinner.hide();
        this.loading = false;
        this.googleService.setGenericErrorEvent(
          'Vida Ley - Paso 2',
          'Grabar cliente'
        );
      }
    );
  }
}
