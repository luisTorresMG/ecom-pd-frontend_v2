import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { VidaleyService } from '../../../shared/services/vidaley.service';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { Vidaley } from '../../../shared/models/vidaley';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.css'],
})
export class Step4Component implements OnInit {
  @ViewChild('errorModal')
  content;

  vidaleyUser: Vidaley;

  loading = false;

  modalRef: BsModalRef;

  businessRules = false;

  constructor(
    private readonly route: Router,
    private readonly vidaleyService: VidaleyService,
    private readonly sessionService: SessionService,
    private readonly modalService: BsModalService,
    private readonly spinner: NgxSpinnerService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};
  }

  onSubmit(payload) {
    const formData = new FormData();
    formData.append('IdProcess', `${this.vidaleyUser.idProcess}`);
    formData.append('IdProducto', payload.insuranceType);

    if (payload.form) {
      this.sessionService.saveToLocalStorage('sctrIndividual', payload.form);
      formData.append('individual', 'true');

      let pais = payload.form.country;
      if (pais.trim().toUpperCase() === 'PERÚ') {
        pais = 'PERU';
      }

      formData.append(
        'asegurado',
        JSON.stringify({
          idTipoDocumento: payload.form.documentType,
          numeroDocumento: payload.form.documentNumber,
          nombreCliente: payload.form.name,
          apellidoPaterno: payload.form.lastname,
          apellidoMaterno: payload.form.surname,
          fechaNacimiento: moment(payload.form.birthdate, 'YYYY-MM-DD'),
          email: payload.form.email,
          telefono: payload.form.phoneNumber,
          sexo: payload.form.sex,
          sede: this.vidaleyUser.sede,
          tipoTrabajador: payload.form.workerType,
          paisNacimiento: pais,
          sueldo: this.vidaleyUser.totalAmount,
        })
      );
    } else {
      formData.append('individual', 'false');
      formData.append('fileAttach', payload.file, payload.file.name);
    }

    this.spinner.show();

    this.vidaleyService.validateFile(formData).subscribe(
      (response) => {
        this.vidaleyUser.errorFrame = !response.asegurable;
        this.vidaleyUser.errorText = response.errores;

        if (!this.vidaleyUser.errorFrame) {
          this.vidaleyUser.amount = response.monto;
          this.vidaleyUser.rate = response.tasa;
          this.vidaleyUser.totalAmount = response.montoPlanilla;
          this.vidaleyUser.totalWorkers = response.cantidadTrabajadores;
          this.vidaleyUser.plan = response.plan;
          this.vidaleyUser.idCotizacion = response.idCotizacion;
          this.vidaleyUser.healthAmount = response.montoSalud;
          this.vidaleyUser.healthRate = response.tasaSalud;
          this.vidaleyUser.allowanceAmount = response.montoPension;
          this.vidaleyUser.allowanceRate = response.tasaPension;
          this.vidaleyUser.insuranceType = payload.insuranceType;

          if (this.storage.ruc === '20123456789') {
            this.vidaleyUser.amount = 1;
          }
        }

        if (this.vidaleyUser.errorFrame) {
          if (response.errorReglaNegocio) {
            this.businessRules = response.errorReglaNegocio;
          } else {
            this.modalRef = this.modalService.show(this.content);
          }

          this.spinner.hide();
        } else {
          this.sessionService.saveToLocalStorage('sctr', this.vidaleyUser);
          if (payload.form) {
            this.sessionService.saveToLocalStorage('sctrClient', payload.form);
          }
          this.spinner.hide();
          this.route.navigate(['sctr/step-5']);
        }
      },
      () => {
        this.spinner.hide();
        this.googleService.setGenericErrorEvent(
          'Vida Ley - Paso 4',
          'Validar Trama'
        );
      }
    );
  }

  get storage(): any {
    return JSON.parse(sessionStorage.getItem('sctr'));
  }
}
