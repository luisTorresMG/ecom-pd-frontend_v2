import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { DpsVidagrupoService } from '../shared/services/dps-vidagrupo.service';
import { ScreenSplashService } from '@screen-splash';
import { IInsuranceInfo, ITokenInfo } from '../shared/interfaces/dps-vidagrupo.interface';
import { IOtp } from '@shared/interfaces/otp.interface';
import { DpsModel } from '@root/layout/dps-vidagrupo/shared/models/dps.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {

  insuranceInfo: IInsuranceInfo = this.route.snapshot.data['insuranceInfo'];

  currentStep: 'dps' | 'auth' | 'success' | 'error' | 'expired' | 'canceled' | 'declined' = 'dps';
  otpPayload: IOtp = {
    branchId: 74,
    processId: +this.insuranceInfo.id,
    cellphone: +this.insuranceInfo.celular || undefined,
    email: this.insuranceInfo.correo,
    documentNumber: this.insuranceInfo.numeroDocumento,
    names: this.insuranceInfo.nombres,
    surnames: this.insuranceInfo.apellidos,
    avatar: this.insuranceInfo.avatar ?? '',
    methods: [1, 3],
    isDps: true
  };
  dpsData: any = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly screenSplash: ScreenSplashService,
    private readonly dpsVidaGrupoService: DpsVidagrupoService
  ) {
  }

  ngOnInit(): void {
    if (!this.insuranceInfo.id) {
      return;
    }

    if (this.dpsVidaGrupoService.storage.insuranceInfo?.id != this.insuranceInfo.id) {
      this.dpsVidaGrupoService.storage = {
        isProcessComplete: false,
        dps: {},
        otpAuth: {},
      };
    }

    this.dpsData = this.dpsVidaGrupoService.storage.dps ?? {};

    this.dpsVidaGrupoService.storage = {
      insuranceInfo: this.insuranceInfo
    };

    if (this.dpsVidaGrupoService.storage.isProcessComplete) {
      this.currentStep = 'success';
    }

    this.getStatusDps();
  }

  getStatusDps(): void {
    this.screenSplash.show();
    this.dpsVidaGrupoService.getStatus(this.route.snapshot.params['token']).subscribe({
      next: (response: ITokenInfo): void => {
        this.currentStep =
          +response.idEstado == 6 ? 'success' :
            +response.idEstado == 4 ? 'auth' :
              +response.idEstado == 3 ? 'expired' :
                +response.idEstado == 7 ? 'declined' :
                  +response.idEstado == 8 ? 'canceled' : 'dps';
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.screenSplash.hide();
      },
      complete: (): void => {
        this.screenSplash.hide();
      }
    });
  }

  dpsOnSubmit(dpsData: any): void {
    if (!dpsData.isValidForm) {
      return;
    }

    this.dpsData = dpsData;

    this.screenSplash.show('Guardando información...');

    const dpsPayload = {
      id: +this.insuranceInfo.id,
      jsondps: JSON.stringify(new DpsModel(dpsData)),
      numeroDocumento: this.insuranceInfo.numeroDocumento
    };
    this.dpsVidaGrupoService.saveDps(dpsPayload).subscribe({
      next: (response): void => {
        if (response.success) {
          this.dpsVidaGrupoService.storage = {
            dps: dpsData
          };
          this.currentStep = 'auth';
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.screenSplash.hide();
      },
      complete: (): void => {
        this.screenSplash.hide();
      }
    });
  }

  resultOtp(result: any): void {
    const success: boolean = result.success && !result.hasError;

    this.screenSplash.show('Validando información...');

    const payload = {
      id: +this.insuranceInfo.id,
      success: success
    };
    this.dpsVidaGrupoService.updateState(payload).subscribe({
      next: (): void => {
        this.currentStep = success ? 'success' : 'error';
        this.dpsVidaGrupoService.storage = {
          isProcessComplete: success
        };
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.currentStep = 'error';
        this.dpsVidaGrupoService.storage = {
          isProcessComplete: false
        };
        this.screenSplash.hide();
      },
      complete: (): void => {
        this.screenSplash.hide();
      }
    });
  }

  closeOtp(event: boolean): void {

    if (event) {
      this.currentStep = 'dps';
    }
  }
}
