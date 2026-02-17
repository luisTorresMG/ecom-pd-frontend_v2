import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';

import { DpsService } from '../../shared/services/dps.service';
import { IOtp, IOtpResult } from '@shared/interfaces/otp.interface';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.sass'],
})
export class AuthComponent implements OnInit {
  payloadOtp: IOtp = {
    branchId: 61,
    processId: +sessionStorage.getItem('dps-proccess-id'),
    documentNumber: this.dpsService.storage.numeroDocumento,
    names: this.dpsService.storage.nombres,
    surnames: this.dpsService.storage.apellidos,
    cellphone: this.dpsService.storage.celular,
    email: this.dpsService.storage.correo,
    avatar: this.dpsService.storage.avatar,
    methods: [1, 3],
  };

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly spinner: NgxSpinnerService,
    private readonly dpsService: DpsService
  ) {}

  ngOnInit(): void {}

  resultOtp(e: IOtpResult): void {
    console.log(e);

    const summary = {
      success: e.success,
      hasError: !e.success,
      description: e.message,
      message: '',
    };

    if (e.hasError) {
      this.dpsService.storage = {
        summary: summary,
      };
      this.router.navigate([
        `/dps/${this.activatedRoute.parent.snapshot.params['token']}/summary`,
      ]);
      return;
    }

    this.spinner.show();

    const payload = {
      id: +this.dpsService.storage.id,
      success: e.success,
    };

    this.dpsService.success(payload).subscribe({
      next: (response: any) => {
        console.log(response);

        sessionStorage.removeItem('dps-form');
        sessionStorage.removeItem('dps-proccess-id');
        sessionStorage.removeItem('dps-step');

        summary.message =
          'Comunícate con tu ejecutivo comercial de Protecta Security para continuar con la contratación de tu póliza.';

        this.dpsService.storage = {
          summary: summary,
        };

        this.router.navigate([
          `/dps/${this.activatedRoute.parent.snapshot.params['token']}/summary`,
        ]);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.router.navigate([
          `/dps/${this.activatedRoute.parent.snapshot.params['token']}/summary`,
        ]);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  closeOtp(): void {
    console.log(this.activatedRoute);
    this.router.navigate([
      `/dps/${this.activatedRoute.parent.snapshot.params['token']}/preguntas`,
    ]);
  }
}
